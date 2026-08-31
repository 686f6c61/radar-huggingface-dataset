# Falconsai/phi-1_5_adaptive

## Resumen

Falconsai/phi-1_5_adaptive es un modelo de lenguaje pequeño (SLM) derivado de phi-1_5 de Microsoft, que ha sido procesado con la herramienta "Model Surgeon" para documentar su linaje y modificaciones. El repositorio contiene un único archivo de pesos en formato safetensors de aproximadamente 2,8 GB, con un total de 1.401.493.617 parámetros distribuidos en 341 tensores. La model card generada automáticamente indica que se trata de un modelo de NLP con un 98% de confianza, pero no declara tarea específica ni proporciona detalles sobre entrenamiento, licencia o capacidades.

La relevancia de este modelo radica en su enfoque de trazabilidad: la ficha incluye un registro firmado (attestation) que documenta las operaciones realizadas (carga, análisis forense y prueba), lo que podría ser útil para cumplir requisitos de documentación técnica como los del EU AI Act. Sin embargo, al no existir información sobre el proceso de adaptación, los datos de entrenamiento o las evaluaciones, su utilidad práctica para desarrolladores es limitada en esta etapa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Small Language Model (SLM), basado en phi-1_5 de Microsoft (no confirmado) |
| Parametros totales | 1.401.493.617 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el archivo está en F32, sin conversiones registradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (un único archivo: model_edited.safetensors) |

## Arquitectura y entrenamiento

La model card no ofrece detalles sobre la arquitectura interna más allá de clasificarlo como un modelo de lenguaje pequeño (SLM) con un 98% de confianza. Dado que el nombre sugiere una relación con phi-1_5 de Microsoft, es probable que herede la arquitectura transformer de ese modelo (1.300 millones de parámetros, contexto de 2048 tokens, entrenado con datos de libros de texto), pero no hay confirmación en la información proporcionada. El registro de operaciones indica que se realizaron tres pasos: carga del archivo, análisis forense (sin anomalías) y una prueba que pasó correctamente. No se registran fusiones de pesos ni cuantizaciones. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas en la información disponible. La model card no menciona generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte para agentes, capacidades multilingües ni modos especiales. La única clasificación es "NLP · Small Language Model" con alta confianza, lo que sugiere que se trata de un modelo de procesamiento de lenguaje natural, pero sin detalles adicionales.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos. La ausencia de datos sobre capacidades, rendimiento y licencia impide recomendar aplicaciones prácticas. Cualquier uso en producción requeriría primero una evaluación independiente del modelo y la verificación de su licencia, que no está declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la prueba interna ("test") pasó correctamente, pero no ofrece métricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Dado el tamaño del archivo (2,8 GB en F32) y el número de parámetros (1,4B), se puede estimar que la inferencia en FP16 requeriría aproximadamente 2,8 GB de VRAM, y en cuantización de 4 bits alrededor de 0,8 GB, pero estos son cálculos genéricos no confirmados por el autor. No se indican GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. El modelo original phi-1_5 de Microsoft (1,3B parámetros, contexto 2048, licencia MIT) es la referencia más cercana, pero no se ha verificado que este modelo adaptado mantenga las mismas características. Otras alternativas de tamaño similar como TinyLlama (1,1B) o Qwen1.5-1.8B podrían ser comparables en parámetros, pero sin datos de evaluación no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se declara licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La model card es generada automáticamente por la herramienta Model Surgeon y no incluye validación externa de rendimiento.
- El modelo parece ser una versión editada de phi-1_5, pero no se documenta qué cambios se realizaron ni con qué propósito.
- La fecha de creación (2026) es inusual y podría indicar un error en los metadatos.
- Para cualquier uso en producción, se recomienda verificar la integridad del archivo mediante el script `load_and_test.py` incluido y consultar la attestation firmada.

## Enlaces

- [HuggingFace - Falconsai/phi-1_5_adaptive](https://huggingface.co/Falconsai/phi-1_5_adaptive)
- [Modelo original phi-1_5 de Microsoft](https://huggingface.co/microsoft/phi-1_5)
- [Portal de desarrolladores de Falcons AI](https://developers.falcons.ai/models)
- [Verificador público de Model Surgeon](https://surgeon.falcons.ai/verify)
