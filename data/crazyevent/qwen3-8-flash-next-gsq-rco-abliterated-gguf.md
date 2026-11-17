# crazyevent/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantización GGUF derivada del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, que a su vez es una versión cuantizada del modelo Qwen3.8-Flash-Next. El autor de esta variante, crazyevent, ha aplicado una técnica de "abliteration" sobre los pesos ya cuantizados: ha sustituido 144 tensores de proyección de escritura al flujo residual en las 48 capas del modelo por los tensores correspondientes de una versión abliterated lista para usar, sin recalcular ninguno de los tensores cuantizados aprendidos por GSQ. El resultado es un modelo con la dirección de rechazo (refusal) eliminada, manteniendo intactos los valores y escalas de la cuantización original.

El modelo es de tipo Mixture-of-Experts (MoE) con aproximadamente 177.000 millones de parámetros totales, contexto de 262.144 tokens y capacidades multimodales de imagen-texto a texto. Está pensado para tareas de razonamiento, generación de código y experimentación en red-teaming, y se distribuye en formato GGUF con cuantizaciones de baja precisión (IQ2_XS, Q2_0, IQ3_XXS, IQ3_S) que van desde 38,0 GB hasta 55,1 GB, lo que permite su despliegue en hardware relativamente modesto para el tamaño del modelo.

La relevancia de esta ficha radica en que combina tres tendencias actuales: la cuantización aprendida (GSQ), la asignación de tipos por presupuesto (RCO) y la modificación de comportamiento mediante abliteration sobre pesos ya cuantizados, una operación poco habitual que el autor verifica tensor a tensor con blake2b. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; 48 capas |
| Parámetros totales | 176.943.899.520 (~177B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | IQ2_XS, Q2_0, IQ3_XXS, IQ3_S |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Pipeline | image-text-to-text |
| Tamaño del repo | 217,9 GB |
| Tamaño por cuantización | 38,0 GB (Q2_0) – 55,1 GB (IQ3_S) |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de 48 capas y aproximadamente 177.000 millones de parámetros totales. El modelo base Qwen3.8-Flash-Next incorpora capacidades multimodales (pipeline image-text-to-text) y un contexto extendido de 262.144 tokens. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica de esta variante concreta reside en el proceso de cuantización y modificación. El modelo upstream emplea GSQ (cuantización aprendida) junto con RCO, un esquema de asignación de tipos de cuantización por tensor sujeto a un presupuesto de tamaño. Sobre esa base ya cuantizada, el autor ha realizado un "tensor transplant": ha sustituido 144 tensores de proyección que escriben en el flujo residual, distribuidos en las 48 capas, por los tensores equivalentes de una release abliterated ya existente. La operación preserva los valores y escalas aprendidos por GSQ y restaura exactamente la asignación de tipos por tensor del modelo upstream. El build IQ3_S se verifica tensor a tensor mediante hashes blake2b, de modo que solo cambian los tensores previstos. El coste de tamaño de cada nivel de cuantización es de solo 0,25–0,44 GB adicionales respecto al upstream.

## Capacidades

- Generación de texto y razonamiento multi-paso, con contexto largo de hasta 262K tokens.
- Procesamiento multimodal imagen-texto a texto (pipeline image-text-to-text).
- Generación de código y matemáticas (heredadas del modelo base Qwen3.8-Flash-Next; no se detallan métricas en la información disponible).
- Comportamiento "uncensored": la dirección de rechazo ha sido eliminada mediante abliteration, lo que reduce las negativas del modelo ante solicitudes sensibles.
- Soporte multilingüe limitado a inglés (en) y chino (zh) según los metadatos del modelo.
- Compatibilidad con endpoints (tag endpoints_compatible) y con llama.cpp.
- No se especifica en la información disponible soporte explícito de tool calling, function calling ni modo thinking.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo, al tener eliminada la dirección de rechazo, sirve para generar respuestas que un modelo alineado rechazaría, permitiendo a equipos de seguridad probar filtros, clasificadores y políticas de moderación en pipelines de producción.
- Investigación sobre abliteration: permite estudiar el efecto de sustituir tensores de proyección residual sobre un modelo ya cuantizado, comparando comportamiento y calidad frente al upstream no modificado con la misma cuantización.
- Despliegue en hardware de gama alta para consumo: con 38–55 GB de pesos GGUF, puede ejecutarse en estaciones con una o varias GPU de 24–80 GB usando llama.cpp, manteniendo el contexto largo de 262K para documentos extensos.
- Análisis de documentos largos en inglés o chino: el contexto de 262K tokens permite procesar informes, expedientes o bases de código completas en una sola pasada, útil para resumen y extracción de entidades.
- Experimentación multimodal: al ser image-text-to-text, puede emplearse en prototipos de descripción de imágenes, extracción de información de capturas o documentos escaneados, siempre en inglés o chino.
- Generación de código en entornos controlados: integrable en pipelines locales con llama.cpp para autocompletado y generación de parches, sin depender de APIs externas, aunque sin garantías de calidad medidas en benchmarks publicados.
- Pruebas de robustez de agentes: útil para simular usuarios adversariales o generar trayectorias de conversación que estresen sistemas de agentes antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 GB para Q2_0 y 55 GB para IQ3_S solo en pesos; añadir KV cache para contexto largo (el contexto de 262K exige memoria adicional significativa, no cuantificada en la información disponible).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB) para IQ3_S; Q2_0 puede intentarse en una única GPU de 48 GB o en 2× RTX 4090.
- No cabe en una única GPU consumer de 24 GB con contexto completo; podría ejecutarse parcialmente con offloading a CPU/RAM, con latencia muy superior.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla en la información disponible. No se confirma soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| crazyevent/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | ~177B (MoE) | 262K | Apache-2.0 | GGUF | Abliterated sobre cuantización GSQ-RCO |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | ~177B (MoE) | 262K | Apache-2.0 | GGUF | Upstream sin abliteration; misma base cuantizada |
| Qwen3.8-Flash-Next (modelo original) | ~177B (MoE) | 262K | no disponible en la información | safetensors (presumible) | Modelo de referencia sin cuantizar ni modificar |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo, lo que puede producir contenido dañino, ilegal o inexacto sin filtros; no es apto para aplicaciones comerciales orientadas al usuario final sin moderación adicional.
- Riesgo elevado de alucinación y de respuestas no verificadas, especialmente en dominios sensibles; no se han publicado evaluaciones de calidad tras la modificación.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- La cuantización de 2–3 bits (IQ2_XS, Q2_0, IQ3_XXS, IQ3_S) degrada la calidad respecto al modelo en precisión completa; no se han publicado métricas de la degradación.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y la release abliterated de origen pueden imponer condiciones adicionales no detalladas en la información disponible; conviene verificar las licencias de los modelos upstream.
- El contexto de 262K requiere memoria considerable; en configuraciones de baja VRAM la ventana efectiva será menor.
- No se confirma soporte de tool calling ni de modo thinking en esta variante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/crazyevent/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (upstream cuantizado): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper GSQ (referencia arXiv): arxiv:2604.18556
- Paper RCO (referencia arXiv): arxiv:2605.00649
