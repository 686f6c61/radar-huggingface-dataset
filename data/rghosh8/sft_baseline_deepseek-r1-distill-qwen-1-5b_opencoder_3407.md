# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_3407

## Resumen

`rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_3407` es un ajuste fino supervisado (SFT) del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicado por el usuario rghosh8 en Hugging Face. Se trata de un checkpoint experimental de investigación, entrenado con la librería TRL 1.15.0 sobre la arquitectura Qwen2, con 1.777.088.000 parámetros totales y un tamaño de repositorio de 3,6 GB en formato safetensors. El nombre del modelo sugiere que forma parte de una comparativa de líneas base de SFT (baseline) con una semilla fija (3407) sobre un dataset denominado "opencoder".

El modelo hereda la base de DeepSeek-R1-Distill-Qwen-1.5B, una destilación de DeepSeek-R1 sobre Qwen2-1.5B orientada a razonamiento y cadenas de pensamiento. Este ajuste concreto no aporta información sobre el dataset de entrenamiento, hiperparámetros, número de tokens o metodología de evaluación, y su model card es prácticamente la plantilla autogenerada por TRL. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación de nicho, no de un modelo listo para producción.

Su relevancia es limitada y fundamentalmente académica: sirve como referencia reproducible (semilla 3407) para experimentos de SFT sobre modelos pequeños de razonamiento, pero carece de documentación, licencia declarada y benchmarks publicados. Cualquier uso en producción requeriría validación propia y una revisión legal de la licencia heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,6 GB |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0, Tokenizers 0.23.3 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Semilla | 3407 (segun nombre del modelo) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-1.5B, una destilación de DeepSeek-R1 sobre la arquitectura Qwen2 de 1.500 millones de parámetros. Qwen2 es un transformer decoder-only con atención de múltiples cabezas con query/key/value agrupadas (GQA), normalización RMSNorm y activación SwiGLU, aunque la model card no detalla la configuración exacta de capas, cabezas ni dimensión oculta de esta instancia concreta. El checkpoint resultante tiene 1.777.088.000 parámetros según los safetensors publicados.

El entrenamiento consistió en un ajuste fino supervisado (SFT) con TRL sobre el modelo base, con semilla 3407 y un dataset no especificado denominado "opencoder" en el nombre del artefacto. No se documentan el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior, hiperparámetros (learning rate, batch size, épocas) ni técnicas de optimización como decodificación especulativa o atención lineal. La model card es la plantilla autogenerada por TRL y no aporta información sustantiva sobre el procedimiento experimental.

## Capacidades

- Generación de texto conversacional en formato de chat (el ejemplo de la model card usa el rol `user` y `return_full_text=False`).
- Razonamiento y cadenas de pensamiento heredados del modelo base DeepSeek-R1-Distill-Qwen-1.5B, aunque el SFT puede haber modificado o reducido este comportamiento; no hay evaluación publicada.
- Generación de código y matemáticas: capacidad esperable por herencia del modelo base, sin benchmarks que la confirmen en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de SFT: el modelo sirve como línea base reproducible (semilla 3407) para comparar el efecto de distintas configuraciones de ajuste fino sobre DeepSeek-R1-Distill-Qwen-1.5B en entornos de investigación.
- Evaluación de la degradación del razonamiento tras SFT: permite estudiar si el ajuste supervisado sobre un dataset de instrucciones preserva o erosiona las cadenas de pensamiento del modelo destilado original.
- Prototipado de asistentes conversacionales ligeros: con 1,77 mil millones de parámetros, el modelo puede ejecutarse en GPUs de consumo para pruebas de concepto de chat multi-turno, siempre con validación adicional.
- Generación de código en entornos controlados: por herencia del modelo base, puede emplearse para autocompletar o explicar fragmentos de código en herramientas internas, sujeto a revisión humana.
- Investigación sobre datasets de instrucciones: el nombre "opencoder" sugiere un dataset orientado a código; el modelo puede usarse para analizar cómo el SFT sobre código afecta a las capacidades generales del modelo base.
- Fine-tuning posterior y experimentación académica: al ser un checkpoint pequeño y en safetensors, es adecuado como punto de partida para nuevos ajustes en trabajos de investigación sobre destilación y SFT.
- Despliegue en pipelines de generación de texto con `transformers` o Text Generation Inference (el modelo incluye el tag `text-generation-inference`), para pruebas de integración en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 7 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque no se publican cuantizaciones oficiales y habría que generarlas con herramientas externas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100, H100). Cabe en GPUs de consumo modernas.
- Despliegue: compatible con `transformers` (pipeline de text-generation), Text Generation Inference (tag `text-generation-inference`) y, generando la cuantización correspondiente, con llama.cpp u Ollama. No se documentan integraciones oficiales con vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_3407 | 1.777.088.000 | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint experimental de SFT, sin benchmarks |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.500 millones (aprox.) | no disponible en esta ficha | MIT (modelo base de DeepSeek) | Hugging Face, ampliamente descargado | Modelo base original, con benchmarks publicados por DeepSeek |
| Qwen2-1.5B (Qwen/Qwen2-1.5B) | 1.500 millones (aprox.) | 32.768 tokens (configuración estándar Qwen2) | Apache 2.0 | Hugging Face | Arquitectura base sin destilación de razonamiento |
| Qwen2.5-1.5B-Instruct (Qwen/Qwen2.5-1.5B-Instruct) | 1.500 millones (aprox.) | 32.768 tokens (configuración estándar Qwen2.5) | Apache 2.0 | Hugging Face | Alternativa instructiva de tamaño similar con documentación completa |

Los datos de contexto y licencia de los modelos comparados corresponden a sus configuraciones estándar publicadas; para este checkpoint concreto no se dispone de esa información.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla autogenerada por TRL y no describe dataset, hiperparámetros, motivación ni evaluación.
- Licencia no declarada: el campo `licence: license` no especifica términos; no se puede confirmar el uso comercial. Habría que verificar la licencia del modelo base (DeepSeek-R1-Distill-Qwen-1.5B) y del dataset de SFT, que tampoco se identifica.
- Sin benchmarks: no hay evidencia publicada de que el SFT mejore o preserve las capacidades del modelo base; el ajuste podría degradar el razonamiento o el multilingüismo.
- Riesgo de alucinación: inherente a los modelos de 1,5 mil millones de parámetros, agravado por la falta de evaluación.
- Sesgos: no documentados; el modelo hereda los sesgos del dataset de SFT (desconocido) y del modelo base.
- Idiomas: no declarados; el soporte multilingüe no está garantizado.
- Longitud de contexto: no confirmada en este checkpoint; podría diferir de la del modelo base.
- Artefacto de investigación: 0 descargas y 0 likes, sin mantenimiento aparente ni issues resueltos; no recomendado para producción sin validación exhaustiva.
- Reproducibilidad limitada: aunque la semilla 3407 está fijada en el nombre, la falta de detalles del dataset impide reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_3407
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de TRL (SFTTrainer): https://huggingface.co/docs/trl/sft_trainer
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
