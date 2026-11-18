# SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario SC117 sobre las cuantizaciones oficiales GSQ-RCO del ISTA-DASLab. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 176.943.899.520 parámetros totales, orientado a conversación, razonamiento y entrada image-text-to-text, con una ventana de contexto declarada de 262K tokens. La particularidad de esta build es que aplica una "abliteración" sobre pesos ya cuantizados: en lugar de recuantizar desde cero, sustituye 144 tensores de proyección de escritura al residual stream en las 48 capas por los tensores equivalentes de una release abliterated preexistente, preservando intactos los valores y escalas aprendidos por GSQ.

El resultado es una variante "uncensored" que conserva el layout upstream y la asignación de tipos por tensor, verificada tensor a tensor mediante blake2b. El repositorio ocupa 222,0 GB e incluye varios niveles de cuantización que van de 38,0 GB (Q2_0) a 55,1 GB (IQ3_S), con un sobrecoste declarado de solo 0,25–0,44 GB respecto al upstream por cada tier.

Es relevante ahora para equipos que necesitan desplegar un MoE de gran tamaño en local con llama.cpp y quieren una variante sin rechazos para tareas de red-teaming, evaluación de robustez o investigación de sesgos, manteniendo la licencia Apache-2.0 y la compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; 48 capas |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262K tokens (262.144) |
| Tipos de cuantizacion | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama-cpp) |
| Tamano del repo | 222,0 GB |
| Rango de tamanos por tier | 38,0 GB (Q2_0) – 55,1 GB (IQ3_S) |
| Pipeline | image-text-to-text |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF |
| Metodo de cuantizacion upstream | GSQ (learned quantization) + RCO (budget-constrained type assignment) |
| Verificacion | blake2b por tensor; 144 tensores transplantados en 48 capas |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de 48 capas con 176.943.899.520 parámetros totales; el número de parámetros activos por token no se especifica en la información disponible. El pipeline declarado es image-text-to-text, lo que implica que el modelo acepta entradas multimodales de imagen y texto, aunque los detalles del encoder visual y del mecanismo de fusión no están documentados en la model card.

El entrenamiento original de Qwen3.8-Flash-Next, así como el número de tokens, la composición del dataset y el uso de RLHF/DPO, no se detallan en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: el upstream GSQ-RCO aplica cuantización aprendida (GSQ) con asignación de tipos por tensor sujeta a un presupuesto (RCO), y esta build realiza un "tensor transplant" que sustituye únicamente los 144 tensores de proyección de escritura al residual stream por los de una release abliterated, dejando sin tocar los valores y escalas GSQ. La verificación se hace tensor a tensor con blake2b para garantizar que solo cambiaron los tensores previstos.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262K tokens.
- Razonamiento (tag `reasoning`) y modo de pensamiento extendido, según las etiquetas del repositorio.
- Entrada multimodal image-text-to-text: acepta imágenes junto a texto en el pipeline declarado.
- Soporte multilingüe limitado a inglés (en) y chino (zh).
- Comportamiento "abliterated/uncensored": se elimina la dirección de rechazo, por lo que el modelo no declina peticiones que el base rechazaría.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita el despliegue como servicio.
- Uso previsto en red-teaming y evaluación de robustez, según la propia model card.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Red-teaming y evaluación de robustez: al estar abliterado, permite sondear respuestas del modelo ante prompts adversarios sin que el mecanismo de rechazo enmascare el comportamiento subyacente, lo que facilita medir sesgos y fallos reales.
- Investigación sobre alineación y refusal: comparar esta build con el upstream GSQ-RCO no abliterado permite aislar el efecto de la dirección de rechazo sobre las respuestas, manteniendo idénticos los pesos cuantizados.
- Despliegue local con llama.cpp: los tiers Q2_0 (38,0 GB) e IQ3_S (55,1 GB) encajan en estaciones de trabajo con 48–64 GB de VRAM o en configuraciones con offload a RAM, usando el runtime GGUF estándar.
- Procesamiento de documentos largos: la ventana de 262K tokens permite ingerir contratos, informes o bases de código extensas en una sola pasada para tareas de extracción y resumen.
- Análisis de capturas y documentación visual: el pipeline image-text-to-text habilita flujos de descripción de imágenes, extracción de datos de gráficos o QA sobre documentos escaneados.
- Servicio conversacional compatible con endpoints: al declararse `endpoints_compatible`, puede exponerse tras una API compatible con OpenAI para prototipos de chat en inglés y chino.
- Experimentación con cuantización extrema: los tiers IQ2_XS y Q2_0 permiten estudiar la degradación de calidad de un MoE de 177B parámetros bajo cuantización agresiva sin salir de hardware de gama alta consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 GB para Q2_0, en torno a 45–50 GB para IQ2_XS e IQ3_XXS, y unos 55 GB para IQ3_S, sin contar el overhead de contexto KV cache.
- El contexto de 262K tokens incrementa de forma significativa el consumo de KV cache; con ventanas largas hay que reservar VRAM adicional o reducir la longitud efectiva.
- GPU recomendadas: A100 80GB, H100 80GB o H200 para servir IQ3_S con contexto largo; RTX 6000 Ada (48 GB) para tiers bajos con contexto moderado.
- GPU consumer: Q2_0 (38 GB) no cabe en una RTX 4090 de 24 GB sin offload; requiere partición entre VRAM y RAM del sistema o configuraciones multi-GPU. IQ3_S no es viable en consumer de 24 GB.
- Opciones de despliegue: llama.cpp (runtime nativo del formato GGUF), Ollama para pruebas locales, y servidores compatibles con endpoints para exposición vía API.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176.943.899.520 | 262K | Apache-2.0 | GGUF (Q2_0 a IQ3_S) | Variante abliterada sobre cuantización GSQ-RCO |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176.943.899.520 | 262K | Apache-2.0 | GGUF | Upstream sin abliterar; referencia de calidad y comportamiento |
| Qwen3.8-Flash-Next (modelo original) | 176.943.899.520 | no disponible | no disponible | safetensors | Pesos completos antes de cuantización; requiere hardware de centro de datos |

La comparación con alternativas de otros fabricantes (por ejemplo, otros MoE de ~180B parámetros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina el rechazo: el modelo puede generar contenido dañino, ilegal o inseguro sin filtro, lo que lo descalifica para despliegues de cara al público sin capas de moderación externas.
- Sesgos conocidos: no documentados en la información disponible; al heredar el base y solo modificar la dirección de rechazo, es probable que persistan los sesgos del entrenamiento original, pero no hay evaluación publicada.
- Riesgo de alucinación: no cuantificado; los tiers IQ2_XS y Q2_0, por su agresividad, degradan la fidelidad de forma más acisible que IQ3_S.
- Idiomas: solo inglés y chino están declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: los 262K tokens son una cifra declarada; el rendimiento efectivo en ventanas muy largas no está verificado en la model card.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado por una variante uncensored recae sobre el desplegador.
- La build depende de un "tensor transplant" sobre pesos cuantizados: aunque se verifica con blake2b, cualquier uso en producción debería validar la coherencia de salidas frente al upstream.
- No hay datos publicados de benchmarks, latencia ni throughput; no se debe asumir paridad de calidad con el modelo original sin medirla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (cuantizaciones oficiales): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper GSQ (referencia arXiv): arxiv:2604.18556
- Paper RCO (referencia arXiv): arxiv:2605.00649
