# ridhanhimmee/model-5-failure-classifier-qwen15b

## Resumen

`ridhanhimmee/model-5-failure-classifier-qwen15b` es un ajuste fino publicado en Hugging Face por el usuario ridhanhimmee sobre `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`, es decir, sobre el modelo instructivo de 1,5 mil millones de parámetros de la familia Qwen2.5 en su variante cuantizada a 4 bits. El nombre del repositorio sugiere que el modelo está especializado en clasificar fallos (presumiblemente en entradas de texto, logs o informes de error), aunque la model card no documenta el esquema de etiquetas, el conjunto de datos ni el formato de salida esperado.

El modelo se ha entrenado con Unsloth y TRL, según los tags y la propia model card, que se limita a indicar la autoría, la licencia Apache 2.0 y que el entrenamiento fue "2 veces más rápido" gracias a Unsloth. No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, el pipeline declarado ni resultados de evaluación.

Su relevancia potencial es la de un modelo pequeño, con licencia permisiva y desplegable en hardware de consumo, útil como clasificador especializado de bajo coste. No obstante, con 0 descargas y 0 "likes" en el momento de la consulta y sin documentación técnica, debe tratarse como un artefacto experimental que requiere validación propia antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino del modelo base `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit` |
| Parámetros totales | Aproximadamente 1,5 B (heredado del modelo base; no verificado en la model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base Qwen2.5-1.5B-Instruct; no confirmado para este ajuste fino |
| Tipos de cuantización | No disponible en la model card. El modelo base está cuantizado en bitsandbytes de 4 bits; los pesos publicados están en safetensors |
| Idiomas soportados | Inglés (`en`) según el campo `language` de la model card; el modelo base Qwen2.5 es multilingüe, pero este ajuste no declara otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de aproximadamente 0,1 GB) |
| Librería declarada | transformers |
| Pipeline declarado | No disponible |
| Etiquetas | transformers, safetensors, text-generation-inference, unsloth, qwen2, trl, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso de 28 capas, dimensión oculta de 1536, atención con 12 cabezas de consulta y 2 cabezas de clave/valor (GQA), normalización RMSNorm, activación SwiGLU, embeddings ligados y sesgos en las proyecciones QKV, con un vocabulario de aproximadamente 151 900 tokens. Estas características provienen del modelo base y no se confirman en la model card del ajuste fino.

Sobre el entrenamiento de este repositorio solo se sabe lo que declara el autor: se realizó con Unsloth (que anuncia un entrenamiento "2 veces más rápido") y con TRL, partiendo de una versión del modelo base ya cuantizada en 4 bits con bitsandbytes. No se especifica si el resultado es un adaptador LoRA fusionado o pesos completos, ni el número de pasos, el dataset, la función de pérdida, la existencia de RLHF/DPO o el esquema de etiquetas de la tarea de clasificación de fallos. El tamaño del repositorio (0,1 GB) es notablemente inferior al que ocuparían los pesos completos en fp16 (unos 3 GB) y más cercano al de un adaptador o a una publicación parcial, por lo que conviene inspeccionar los ficheros antes de asumir que contiene un modelo autónomo.

## Capacidades

- Generación de texto en inglés: al derivar de un modelo instructivo, conserva la capacidad de seguir instrucciones y producir respuestas en formato conversacional.
- Clasificación de fallos: el nombre del repositorio indica especialización en categorizar fallos; no se documenta el conjunto de etiquetas ni el formato de salida.
- Razonamiento básico y respuesta a preguntas simples, limitado por el tamaño de 1,5 B de parámetros.
- Capacidad multilingüe: no declarada para este ajuste; la model card solo lista inglés, aunque el modelo base Qwen2.5 cubre decenas de idiomas.
- Tool calling / function calling: el modelo base Qwen2.5-1.5B-Instruct soporta llamadas a funciones, pero no hay evidencia de que el ajuste fino las preserve; no disponible para este repositorio.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Modo "thinking", visión o audio: no soportados.
- Salida estructurada (JSON, etiquetas): plausible en un clasificador, pero no verificada ni documentada.

## Casos de uso

- Triaje de informes de incidencias: usar el modelo para asignar una categoría de fallo a cada ticket o informe recibido, con un prompt que fije el conjunto de etiquetas y validación posterior contra una muestra etiquetada manualmente.
- Clasificación de fallos en pipelines de CI/CD: analizar el texto de los logs de test fallidos y etiquetar la causa probable (dependencia, timeout, error de aserción), integrándolo como paso previo al enrutado de alertas.
- Enrutado de alertas de monitorización: procesar mensajes de sistemas de observabilidad y decidir el equipo o la severidad, siempre con una capa de reglas deterministas que actúe como red de seguridad.
- Etiquetado asistido de datasets: preanotar grandes volúmenes de texto con categorías de fallo para revisión humana posterior, aprovechando el bajo coste de inferencia de un modelo de 1,5 B.
- Extracción de causa raíz en soporte técnico: resumir y clasificar conversaciones de soporte para alimentar paneles de calidad, con revisión humana de las etiquetas de baja confianza.
- Filtrado previo en moderation o QA de contenido: descartar o marcar entradas que coincidan con patrones de fallo conocidos antes de pasarlas a un modelo mayor, reduciendo coste y latencia.
- Procesamiento por lotes en local: ejecución en una estación de trabajo con GPU de consumo para clasificar corpus internos sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, precisión ni recall para la tarea de clasificación de fallos, ni comparaciones con el modelo base. Tampoco hay datos de MMLU, HumanEval, GSM8K u otros conjuntos estándar para este ajuste fino concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,1 GB de pesos en fp16 más caché KV; en torno a 1 GB con cuantización de 4 bits (estimaciones basadas en el tamaño del modelo base, no medidas sobre este repositorio).
- GPU recomendadas: cualquier GPU con 8 GB o más para fp16 con contexto moderado; A100, H100 o L40S para despliegues con alta concurrencia y contexto largo.
- Cabe en GPU de consumo: sí. RTX 3060 de 12 GB, RTX 4060 Ti de 8/16 GB, RTX 4070, RTX 4090 y GPUs integradas de portátiles con 8 GB o más, siempre con cuantización si el contexto es largo.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir con batching continuo (el tag `text-generation-inference` está presente), llama.cpp/Ollama si se generan pesos GGUF a partir del repositorio.
- Advertencia de despliegue: con un repositorio de 0,1 GB es probable que no contenga pesos completos; verificar si es un adaptador PEFT y, en ese caso, cargarlo junto al modelo base `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit` o fusionarlo antes de exportar a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ridhanhimmee/model-5-failure-classifier-qwen15b` | ~1,5 B | 32 768 (heredado del base, no confirmado) | Apache 2.0 | Hugging Face, 0 descargas, sin evaluación publicada | Ajuste fino especializado sin documentación técnica |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 (extensible con YaRN) | Apache 2.0 | Hugging Face, ampliamente utilizado | Modelo base de referencia, con benchmarks publicados por el autor original |
| Llama 3.2 1B Instruct | 1,2 B | 128 000 | Llama 3.2 Community License | Hugging Face, muy extendido | Contexto mayor; licencia con restricciones de uso |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 192 (ampliable) | Apache 2.0 | Hugging Face | Alternativa ligera con licencia permisiva y contexto más corto |
| Gemma 2 2B Instruct | 2,6 B | 8 192 | Gemma Terms of Use | Hugging Face | Mayor tamaño y requisitos de licencia específicos |

Los datos de rendimiento comparado no están disponibles para este ajuste fino; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas de exactitud ni de F1 para la tarea declarada, por lo que se desconoce si el ajuste mejora o degrada el comportamiento del modelo base.
- Documentación mínima: no se especifican el dataset, el esquema de etiquetas, el formato de entrada/salida ni el método de entrenamiento (LoRA, QLoRA, ajuste completo).
- Posible contenido incompleto del repositorio: 0,1 GB es coherente con un adaptador y no con pesos completos de 1,5 B; comprobar los ficheros antes de usarlo.
- Herencia de cuantización: el ajuste parte de una versión bnb-4bit del modelo base, lo que puede introducir pérdida de calidad adicional respecto al modelo original en fp16.
- Riesgo de alucinación: como modelo generativo de 1,5 B, puede inventar categorías o justificaciones si se le pide texto libre; conviene restringir la salida a un conjunto cerrado de etiquetas y validarla.
- Limitación idiomática: la model card solo declara inglés; el rendimiento en castellano no está verificado.
- Ventana de contexto: aunque el base soporta 32 768 tokens, no se ha validado el comportamiento del ajuste con entradas largas, típicas de logs extensos.
- Sesgos: no documentados; el modelo base puede arrastrar sesgos de sus datos de entrenamiento, que el ajuste fino no corrige necesariamente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también las condiciones del modelo base y de los datos de ajuste, no declarados.
- Madurez: 0 descargas y 0 interacciones, sin mantenimiento ni issues conocidos; no recomendable como dependencia crítica sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ridhanhimmee/model-5-failure-classifier-qwen15b
- Modelo base (Unsloth, Qwen2.5-1.5B-Instruct en 4 bits): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo relacionado del mismo autor: https://huggingface.co/ridhanhimmee/model-5-failure-classifier-finetuned
