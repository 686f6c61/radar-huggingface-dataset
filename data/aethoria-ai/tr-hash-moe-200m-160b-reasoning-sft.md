# AETHORIA-AI/TR-HASH-MoE-200M-160B-Reasoning-SFT

## Resumen

TR-HASH-MoE-200M-160B-Reasoning-SFT es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por AETHORIA-AI, pensado como un ajuste fino supervisado (SFT) de razonamiento sobre el modelo base TR-HASH-MoE-200M-160B-Refinement. La arquitectura subyacente emplea un enrutado determinista por token-ID en lugar de un router aprendido, con 201,2 millones de parámetros totales, 16 capas transformer, atención con GQA y cuatro expertos almacenados de los que se activan dos. El repositorio se creó en agosto de 2026 y, según su model card, está en fase de preparación: no se han subido pesos aún y no se reivindica ninguna mejora de rendimiento.

El modelo se enmarca en la línea de investigación de MoE eficientes y deterministas, con una ruta compartida SwiGLU siempre activa. El objetivo declarado es producir un checkpoint de razonamiento limpio, inicializado desde el modelo de Refinement, con una mezcla de datos de entrenamiento de 500 millones de tokens que incluye una reproducción auditada del corpus general SFT-v2 junto con datos de razonamiento verificados. La separación de artefactos es explícita: los pesos y evaluaciones pertenecen a este repositorio, mientras que los datos y auditorías de contaminación se alojan en un dataset separado.

En su estado actual, el repositorio sirve como punto de control para la comunidad: define las puertas de promoción que deberá superar el modelo antes de su publicación oficial, como evaluaciones ARC, PIQA y GSM8K, así como una comparación contra el checkpoint SFT general ya liberado. Por tanto, su relevancia práctica para desarrolladores queda condicionada a la disponibilidad de pesos y resultados, que por ahora no existen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only causal, Mixture-of-Experts determinista (TR-HASH), 16 capas, GQA (14 query heads / 2 KV heads), embeddings atados, ruta SwiGLU compartida siempre activa |
| Parametros totales | 201,2 millones |
| Parametros activos | 2 de 4 expertos por token (top-2) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio sin pesos subidos) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura TR-HASH, un MoE determinista en el que la selección de expertos no la realiza un router aprendido sino una función hash sobre el token-ID. Esto implica que cada token activa siempre los mismos dos expertos entre los cuatro almacenados, lo que reduce la complejidad de entrenamiento e inferencia y evita problemas de colapso de carga típicos en MoE con routers aprendidos. Además, incluye una ruta SwiGLU compartida que se activa siempre, lo que permite mantener un flujo de información constante incluso cuando los expertos seleccionados no cubren ciertos patrones.

El entrenamiento de este checkpoint concreto es un full-parameter SFT de razonamiento, inicializado desde el modelo Refinement (no desde el SFT general anterior). El dataset de entrenamiento, de 500 millones de tokens, se publica por separado y está diseñado para auditar la contaminación y garantizar la trazabilidad de los datos. En la model card se indica explícitamente que el entrenamiento aún no ha comenzado, y que los checkpoints resultantes se evaluarán según un plan de puertas de promoción que incluye ARC (causal-continuation), ARC reasoning probe, PIQA, GSM8K y un panel de regresión de asistente general.

## Capacidades

- Generación de texto autoregresiva en inglés y francés.
- Razonamiento multi-step, según el objetivo del SFT (aún no validado empíricamente).
- Capacidad de procesamiento de contexto limitada por la ventana, aunque no se especifica la longitud máxima.
- Soporte de tool calling y function calling: no disponible.
- Capacidades de agente y multi-step reasoning: no disponible.
- Capacidades multilingües: solo en y fr.
- Capacidades especiales (vision, audio, etc.): no aplica.

## Casos de uso

- Investigación en arquitecturas MoE deterministas: el modelo sirve como referencia para estudiar el impacto del enrutado por token-ID en el rendimiento de razonamiento, especialmente en tareas como ARC y GSM8K.
- Desarrollo de pipelines de evaluación de modelos pequeños: al ser un MoE de solo 201,2 millones de parámetros, puede usarse para probar infraestructuras de evaluación (vLLM, Transformers) sin requerir recursos de gran escala.
- Fine-tuning sobre dominios específicos: una vez publicado el checkpoint, podría ajustarse para tareas concretas de generación de texto en francés o inglés, dado su licencia Apache 2.0.
- Entornos de aprendizaje e investigación: su tamaño compacto lo hace adecuado para experimentos en laboratorios con GPUs limitadas, como RTX 4090 o incluso CPU.
- Evaluación de técnicas de SFT y mezcla de datos: el dataset de 500M tokens con auditoría de contaminación permite estudiar el impacto de datos de razonamiento en MoE pequeños.
- Despliegue en aplicaciones de baja latencia: si se publican pesos cuantizados, podría integrarse en chatbots o asistentes ligeros, aunque aún no hay evidencia de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio declara que no se reivindica ninguna mejora de rendimiento hasta que se completen las evaluaciones planificadas (ARC, PIQA, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 201,2 millones de parámetros, la inferencia en FP16 requeriría aproximadamente 400 MB de memoria, más overhead de activaciones y KV cache. Con cuantización a 4 bits, podría caber en menos de 200 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior permite ejecución cómoda.
- En consumer GPU: sí, cabe en GPUs de gama baja y media (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: al no haber pesos publicados, no se pueden recomendar herramientas específicas. No obstante, si se publicara en formato safetensors, podría cargarse con Transformers (con `trust_remote_code` hasta que se integre el soporte nativo), y con llama.cpp o Ollama si se generaran GGUF.
- Latencia y throughput: no disponibles, dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TR-HASH-MoE-200M-160B-Reasoning-SFT | 201,2M | no disponible | MoE determinista | Apache 2.0 | Sin pesos |
| GPT-2 (124M) | 124M | 1024 | Transformer denso | MIT | Pesos públicos |
| Pythia-160M | 160M | 2048 | Transformer denso | Apache 2.0 | Pesos públicos |
| TinyLlama (1.1B) | 1.1B | 2048 | Transformer denso | Apache 2.0 | Pesos públicos |

La comparación directa es limitada porque el modelo no tiene pesos publicados ni resultados de evaluación. En términos de arquitectura, es el único MoE determinista de este tamaño, pero su rendimiento real es desconocido.

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio está vacío y no se puede usar el modelo en producción.
- Sin resultados de evaluación: no se han realizado benchmarks, por lo que su rendimiento real es incierto.
- Idiomas limitados: solo en y fr, no cubre español ni otros idiomas.
- Sesgos y alucinación: no se han realizado auditorías de sesgos, y no hay evidencia de su comportamiento en tareas generativas.
- Licencia Apache 2.0 permite uso comercial, pero al no haber pesos, no aplica.
- Riesgo de confusión: el modelo base Refinement tiene un checkpoint SFT anterior (TR-HASH-MoE-200M-160B-SFT) que sí tiene pesos, pero este repositorio es distinto.
- Dependencia de integración: requiere `trust_remote_code` hasta que se integre el soporte nativo en Transformers y vLLM.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-Reasoning-SFT
- Modelo base Refinement: https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-Refinement
- Dataset de razonamiento SFT: https://huggingface.co/datasets/AETHORIA-AI/TR-HASH-MoE-200M-Reasoning-SFT-500M
- Issue de soporte en vLLM: https://github.com/vllm-project/vllm/issues/53286
- Issue de soporte en Transformers: https://github.com/huggingface/transformers/issues/48193
