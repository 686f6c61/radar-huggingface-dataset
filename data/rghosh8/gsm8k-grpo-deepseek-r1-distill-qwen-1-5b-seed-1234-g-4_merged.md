# rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4_merged

## Resumen

`rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4_merged` es un modelo de lenguaje de 1.777.088.000 parametros derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` mediante ajuste fino supervisado con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos GSM8K, un benchmark de problemas aritmeticos de primaria. El autor es el usuario de Hugging Face `rghosh8`, y el artefacto forma parte de una coleccion denominada GSM8k-GRPO que agrupa variantes del mismo experimento con distintas semillas y numeros de generaciones.

La relevancia del modelo es fundamentalmente experimental: se trata de un ejercicio de replicacion de tecnicas de RL para razonamiento matematico sobre un modelo pequeno (1.5B parametros), no de un modelo de produccion. El resultado publicado es la version "merged", es decir, los pesos del adaptador LoRA fusionados con el modelo base para producir un checkpoint autonomo cargable directamente con `transformers`.

Arquitectonicamente hereda la estructura Qwen2 del modelo base, con 1.5B parametros, y no anade innovaciones propias mas alla del proceso de ajuste con GRPO. La model card es minima y no documenta regimen de entrenamiento detallado, hiperparametros, composicion del dataset ni resultados de evaluacion, por lo que la ficha se limita a lo verificable en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en fp32/bf16 es cuantizable a GGUF/AWQ mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 3.6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal, heredado de DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es un Qwen2 de 1.5B parametros destilado por DeepSeek a partir de trayectorias de su modelo R1. Sobre esa base, el autor aplico un ajuste fino con GRPO (una variante de optimizacion por politica proximal que estima ventajas relativas dentro de un grupo de generaciones por prompt) usando el dataset GSM8K como senal de recompensa, presumiblemente basada en la correccion de la respuesta final.

Los metadatos indican semilla 1234 y `G=4` (cuatro generaciones por prompt en el bucle de GRPO). El repositorio incluye tambien el adaptador LoRA original sin fusionar, lo que confirma que el entrenamiento se realizo con LoRA y luego se fusiono para producir este checkpoint. No se documentan en la model card el numero de pasos, la tasa de aprendizaje, el tamano efectivo del dataset de entrenamiento, ni si hubo etapas adicionales de SFT o DPO. Tampoco se especifica la innovacion tecnica mas alla del propio uso de GRPO sobre un modelo pequeno.

## Capacidades

- Generacion de texto autoregresiva en el estilo del modelo base DeepSeek-R1-Distill-Qwen-1.5B, que incluye razonamiento paso a paso en formato de cadena de pensamiento.
- Resolucion de problemas matematicos de tipo GSM8K (aritmetica de primaria expresada en lenguaje natural), presumiblemente reforzada por el ajuste con GRPO.
- Razonamiento multi-paso basico, heredado del modelo base.
- Generacion de codigo y respuesta a preguntas generales en la medida en que lo soporte el modelo base; no hay evaluacion especifica en la informacion disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning orquestado: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (vision, audio, thinking mode explicito): no documentadas; el modelo base R1-Distill-Qwen no es multimodal.

## Casos de uso

- Evaluacion de tecnicas de RL para razonamiento matematico: el modelo sirve como referencia reproducible para estudiar el efecto de GRPO sobre un modelo de 1.5B, comparando las distintas semillas y valores de G publicados en la coleccion GSM8k-GRPO.
- Investigacion sobre destilacion y ajuste fino eficiente: al incluir tanto el adaptador LoRA como el checkpoint fusionado, permite analizar el impacto de la fusion de pesos en el rendimiento final.
- Generacion de soluciones paso a paso a problemas aritmeticos de nivel escolar: util para prototipar tutores automaticos de matematicas en entornos controlados, siempre que se valide la correccion de las respuestas.
- Benchmarking interno de modelos pequenos: sirve como linea base de 1.5B parametros frente a la que medir modelos mas grandes en tareas de razonamiento aritmetico.
- Experimentos de cuantizacion y despliegue en hardware modesto: al ser un modelo de 1.5B, es viable convertirlo a GGUF y ejecutarlo en CPU o GPU consumer para pruebas de latencia y calidad.
- Reproduccion de experimentos academicos: permite replicar el pipeline GRPO + GSM8K descrito en la model card y comparar con los resultados publicados por el autor en la coleccion asociada.
- Filtrado o generacion de datos sinteticos de matematicas: puede emplearse para producir borradores de soluciones que luego se revisan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud en GSM8K, MMLU, HumanEval ni ningun otro conjunto, ni comparaciones con el modelo base o con otras variantes de la coleccion.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos; en 4 bits, alrededor de 1 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bf16; para cuantizacion 4 bits basta con GPUs de 4 GB o incluso CPU.
- Cabe en GPU consumer: si, en la mayoria de tarjetas actuales, y tambien en CPU con cuantizacion GGUF.
- Opciones de despliegue: `transformers` (soporte nativo, tal como indica la model card), `text-generation-inference` (el tag `text-generation-inference` figura en los metadatos), y conversion a llama.cpp/Ollama mediante herramientas externas dado que el formato es safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4_merged` | 1.777.088.000 | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste GRPO sobre GSM8K, experimental |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | ~1.5B | 32.768 tokens (segun model card publica del autor original; no verificado aqui) | MIT (segun model card publica) | Hugging Face, ampliamente usado | Modelo base; razonamiento destilado de R1 |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1.5B | 32.768 tokens (segun model card publica) | Apache 2.0 (segun model card publica) | Hugging Face, ampliamente usado | Alternativa generalista de mismo tamano |

La comparacion con el modelo base es la mas directa: este checkpoint anade un ajuste GRPO especifico para GSM8K, pero no publica metricas que permitan cuantificar la mejora. Frente a modelos generalistas de 1.5B, el modelo esta especializado en matematicas y probablemente pierde rendimiento en tareas generales, aunque no hay datos para confirmarlo.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al heredar el modelo base, es probable que arrastre sesgos de genero, culturales y linguisticos del corpus de entrenamiento original, pero no hay evaluacion publicada.
- Riesgo de alucinacion elevado en tareas fuera de GSM8K: el ajuste se realizo sobre un unico dataset de matematicas y no hay evidencia de que preserve el rendimiento general del modelo base.
- Longitud de contexto no documentada; se desconoce si el ajuste con GRPO altero la ventana efectiva del modelo base.
- Idiomas soportados no documentados; probablemente herede el sesgo hacia ingles del dataset GSM8K y del modelo base.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base DeepSeek-R1-Distill-Qwen-1.5B se publica bajo licencia MIT segun su model card publica, pero este derivado no declara licencia propia, lo que supone un riesgo legal para produccion.
- Modelo con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion independiente.
- El ajuste con GRPO sobre un unico dataset puede provocar sobreajuste a la distribucion de GSM8K y degradar la calidad de las cadenas de razonamiento en dominios distintos.
- No se documentan hiperparametros, numero de pasos ni criterios de parada, lo que dificulta la reproducibilidad exacta del resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4_merged
- Adaptador LoRA original: https://huggingface.co/rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4
- Coleccion GSM8k-GRPO: https://huggingface.co/collections/rghosh8/gsm8k-grpo
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
