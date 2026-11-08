# gdigsi/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantización GGUF de un modelo Mixture-of-Experts (MoE) de la familia Qwen3.8-Flash-Next, publicada por el usuario gdigsi. El modelo parte de las cuantizaciones oficiales de ISTA-DASLab (GSQ, cuantización aprendida, más RCO, asignación de tipos por presupuesto de error) y les aplica una técnica de "abliteration": se sustituyen 144 tensores de proyección de escritura al flujo residual, repartidos por las 48 capas del modelo, por los correspondientes de una versión abliterada ya existente. El objetivo es eliminar la dirección de rechazo (refusal) del modelo sin recalcular ninguno de los tensores cuantizados aprendidos por GSQ.

El resultado es un modelo de 176.943.899.520 parámetros totales en formato GGUF, con licencia Apache 2.0, pipeline image-text-to-text y ventana de contexto de 262.144 tokens según la model card. Está pensado para experimentación en red-teaming, investigación sobre alineamiento y despliegue local con llama.cpp, no como modelo de producción orientado a usuario final.

La relevancia de esta ficha radica en su carácter de artefacto derivado: no es un modelo entrenado desde cero, sino una intervención quirúrgica sobre pesos ya cuantizados, con verificación tensor a tensor mediante blake2b en la build IQ3_S. El repositorio ocupa 217,9 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, 48 capas |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 (con imatrix) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 217,9 GB |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF |
| Rango de tamanos por tier | 38,0 GB (Q2_0) a 55,1 GB (IQ3_S) |
| Verificacion de integridad | blake2b por tensor en la build IQ3_S |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de 48 capas con 176.943.899.520 parámetros totales, según los metadatos de safetensors del modelo base. No se dispone de información sobre el número de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO. Tampoco se documenta en la información disponible ninguna innovación de atención (attention linear, decodificación especulativa u otras).

La contribución técnica de este repositorio no está en el entrenamiento, sino en el post-procesado. Sobre las cuantizaciones GSQ-RCO de ISTA-DASLab —que asignan tipos de cuantización por tensor bajo una restricción de presupuesto de error (RCO)— se transplantan 144 tensores de proyección de escritura al flujo residual en las 48 capas, tomados de una release abliterada preexistente (atribuida a orcarouter en los créditos). Los valores y escalas aprendidos por GSQ se dejan intactos y se restaura exactamente la asignación de tipos por tensor del upstream. La build IQ3_S se verifica tensor a tensor con blake2b para confirmar que solo cambiaron los tensores previstos. El coste de almacenamiento por tier es de 0,25 a 0,44 GB adicionales respecto al upstream.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262.144 tokens.
- Procesamiento image-text-to-text (entrada conjunta de imagen y texto), según el pipeline declarado.
- Razonamiento (tag "reasoning" en los metadatos del modelo).
- Capacidades multilingües limitadas a inglés (en) y chino (zh).
- Comportamiento "uncensored" / abliterated: se ha eliminado la dirección de rechazo, por lo que el modelo no aplica las negativas de seguridad del modelo original.
- Compatibilidad con endpoints (tag "endpoints_compatible") para despliegue como servicio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Red-teaming y evaluación de alineamiento: el modelo sirve como contrapunto "sin rechazo" frente al modelo base para medir hasta qué punto las negativas de seguridad dependen de una única dirección en el flujo residual; útil en laboratorios que estudian robustez de salvaguardas.
- Investigación sobre abliteration sobre pesos cuantizados: permite reproducir el experimento de transplantar 144 tensores sobre una cuantización GSQ ya aprendida y comprobar con blake2b que el resto de tensores no se ha alterado, un caso de estudio metodológico poco frecuente.
- Despliegue local de un MoE de gran tamaño en hardware de gama alta: con la build Q2_0 (38,0 GB) o IQ3_S (55,1 GB) puede ejecutarse vía llama.cpp en estaciones con suficiente VRAM o memoria unificada, sin depender de APIs externas.
- Procesamiento de documentos largos con imagen y texto: la ventana de 262.144 tokens permite ingerir informes, expedientes o manuales extensos junto con figuras en una sola pasada, útil para tareas de extracción y resumen internos.
- Generación de datos sintéticos para entrenamiento: al no aplicar rechazos, puede emplearse para producir corpus diversos en inglés y chino en pipelines de destilación o aumento de datos, siempre con revisión posterior.
- Experimentación con cuantizaciones de bajo bit: los tiers IQ2_XS, IQ3_XXS e IQ3_S permiten estudiar la degradación de calidad de un MoE de 176.000 millones de parámetros a 2-3 bits por peso con imatrix, comparando contra el upstream no abliterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 38,0 GB (Q2_0) y 55,1 GB (IQ3_S) solo para los pesos; hay que sumar la caché KV, que con 262.144 tokens de contexto es muy elevada y depende de la configuración de llama.cpp.
- GPU recomendadas: para IQ3_S, una A100 80 GB o H100 80 GB permite cargar los pesos con margen; para Q2_0, una RTX 6000 Ada (48 GB) o A6000 (48 GB) es ajustada pero viable con contexto reducido.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar los pesos completos de ningún tier; sería necesario repartir capas entre GPU y RAM del sistema (offloading), con la penalización de latencia correspondiente.
- Memoria unificada: equipos con 64-128 GB de memoria unificada (por ejemplo, Apple Silicon de gama alta) pueden ejecutar los tiers pequeños con offloading total.
- Opciones de despliegue: llama.cpp es el runtime nativo del formato; el tag "endpoints_compatible" sugiere compatibilidad con servidores de endpoints, pero no se detalla soporte específico de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; dependerán del grado de offloading y del tamaño de contexto efectivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gdigsi/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9 B (MoE) | 262.144 | GGUF (IQ2-Q3) | Apache 2.0 | Abliterated sobre cuantización GSQ-RCO |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176,9 B (MoE) | 262.144 (según upstream) | GGUF | Apache 2.0 | Upstream sin abliterar; referencia de calidad |
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9 B (MoE) | 262.144 | GGUF | Apache 2.0 | Variante abliterada publicada por otro autor |
| Qwen3.8-Flash-Next (modelo original) | no disponible | no disponible | safetensors (presumible) | no disponible | Modelo base de la familia; sin datos de benchmark en la información disponible |

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o inseguro que el modelo original bloquearía; no es apto para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que midan la degradación introducida por la cuantización a 2-3 bits ni por el transplante de tensores.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La ventana de 262.144 tokens exige una caché KV enorme; en la práctica, el contexto utilizable estará muy por debajo en hardware de consumo.
- La licencia Apache 2.0 del repositorio no exime de las obligaciones que puedan derivarse de la licencia del modelo base Qwen3.8-Flash-Next, que no se detalla en la información disponible; conviene verificar antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-07): no hay evidencia de uso comunitario ni validación independiente.
- La verificación blake2b solo se declara para la build IQ3_S; los demás tiers no cuentan con la misma garantía explícita.
- El pipeline image-text-to-text requiere el proyector multimodal correspondiente; no se especifica en la información disponible si está incluido en los GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gdigsi/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Variante abliterada de SC117: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- README en chino simplificado: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
- llama.cpp: https://github.com/ggml-org/llama.cpp
