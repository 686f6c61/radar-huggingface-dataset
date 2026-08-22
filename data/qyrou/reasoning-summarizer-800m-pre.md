# Qyrou/reasoning-summarizer-800m-pre

## Resumen

Reasoning Summarizer 0.8B es un modelo de lenguaje especializado, desarrollado por Qyrou, que toma una cadena de razonamiento (cadena de texto plano que describe un proceso de pensamiento o análisis) y la convierte en metadatos JSON estructurados. Fue construido mediante fine-tuning con LoRA sobre el modelo base Qwen/Qwen3.5-0.8B-Base, y está pensado para flujos de trabajo agenticos y de codificacion asistida, donde se necesita resumir y etiquetar pasos de razonamiento de forma compacta y automatizable.

El modelo tiene aproximadamente 752 millones de parámetros (0,75B) y fue entrenado con un contexto de 4096 tokens sobre un dataset propio de 61.000 ejemplos (Qyrou/reasoning-summaries-61k). Su salida es un JSON con cuatro campos: `title`, `sub_title`, `summary` y `cur_task`. No es un modelo de chat general; su unica funcion es la extraccion de metadatos a partir de razonamientos, lo que lo hace util para instrumentar y depurar pipelines de IA, registrar decisiones de agentes o indexar cadenas de pensamiento.

La relevancia actual radica en que los sistemas agénticos generan grandes volumenes de razonamiento intermedio, y este modelo ofrece una manera ligera y economica de estructurar esa informacion para su posterior analisis, control o integracion en herramientas de observabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-0.8B-Base) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (contexto de entrenamiento) |
| Tipos de cuantizacion | GGUF Q8_0 (de SupraLabs), otros no disponibles |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 (se aplican los terminos del modelo base Qwen3.5-0.8B) |
| Formato de pesos | safetensors (model.safetensors), GGUF (de SupraLabs) |

## Arquitectura y entrenamiento

El modelo se basa en el checkpoint Qwen/Qwen3.5-0.8B-Base, un modelo transformer decoder-only de aproximadamente 0,8B parametros. Sobre esta base se aplico un ajuste fino con LoRA (Low-Rank Adaptation) con rango 32 y alpha 64, entrenado mediante SFT (Supervised Fine-Tuning). El entrenamiento se realizo con una longitud de contexto de 4096 tokens y una tecnica de enmascaramiento de perdida (loss masking) que solo optimiza la salida JSON del asistente, no el texto de entrada. No se utilizo prompt de sistema; la entrada es simplemente la cadena de razonamiento en texto plano, normalmente seguida de un salto de linea.

El dataset empleado es Qyrou/reasoning-summaries-61k, con 61,000 ejemplos de cadenas de razonamiento y sus correspondientes metadatos JSON. La perdida final de evaluacion fue de 0,792. El repo incluye tanto el modelo fusionado como los adaptadores LoRA (final y best) para permitir continuar con SFT o RL.

## Capacidades

- Genera JSON estructurado con cuatro claves: `title`, `sub_title`, `summary` y `cur_task`.
- Extrae titulo y subtitulo de una cadena de razonamiento, resumiendo el contenido principal.
- Produce un resumen informativo y conciso del proceso de razonamiento.
- Genera una descripcion de la tarea actual en una sola linea, pensada para flujos de trabajo agenticos.
- Funciona sin prompt de sistema; entrada directa de texto plano.
- Especializado en razonamiento de codificacion y depuracion (se observa en el ejemplo del README).
- No soporta chat general ni conversacion multi-turno; su uso es exclusivamente para extraccion de metadatos.

## Casos de uso

- **Registro y depuracion de agentes de codigo**: en un agente que ejecuta multiples herramientas (lectura de archivos, consultas a APIs, etc.), el modelo puede procesar cada paso de razonamiento y generar un resumen JSON que permita rastrear que hizo el agente, por que y cual es la tarea actual. Facilita la depuracion y el logging estructurado.
- **Indexacion de cadenas de razonamiento**: al almacenar grandes volumenes de razonamiento generado por LLMs, se puede usar este modelo para generar metadatos (titulo, resumen) que permitan buscar y organizar esos registros en bases de datos o sistemas de recuperacion.
- **Generacion de documentacion tecnica**: en un pipeline de desarrollo, el modelo puede tomar el razonamiento de un LLM durante una sesion de programacion y convertirlo en una descripcion estructurada, que luego se puede transformar en comentarios de codigo o notas de commit.
- **Monitoreo de agentes en produccion**: para sistemas agenticos que ejecutan tareas de codificacion, este modelo puede etiquetar cada paso como `cur_task`, lo que permite a un sistema de supervision saber en que tarea esta el agente en cada momento y detectar desviaciones o bucles.
- **Analisis de logs de LLM**: cuando se tienen registros de prompts y respuestas con razonamiento, el modelo puede extraer resumenes y titulos para identificar patrones, errores o cuellos de botella en el comportamiento del modelo.
- **Preparacion de datos para RLHF**: al entrenar modelos de recompensa o realizar RL, se pueden usar los resumenes generados por este modelo para etiquetar cadenas de razonamiento y crear conjuntos de datos de preferencia o de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otros tests estandar. La unica metrica reportada es la perdida de evaluacion final de 0,7920 durante el entrenamiento.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 0,75B, en fp16 necesita aproximadamente 1,5 GB de VRAM. Con cuantizacion GGUF Q8_0, el tamaño es de alrededor de 0,8 GB, por lo que cabe en GPUs consumer de 4 GB o incluso menos.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060, RTX 4090). Tambien puede ejecutarse en CPU con llama.cpp u Ollama.
- **Opciones de despliegue**: se puede cargar con la libreria transformers (como muestra el codigo del README), o mediante vLLM, llama.cpp, Ollama (si se convierte a formato GGUF) y TGI (Text Generation Inference). El repo de SupraLabs ya ofrece una version GGUF Q8_0 para usar con llama.cpp.
- **Latencia y throughput**: no hay datos publicados, pero por su tamano reducido, la inferencia es rapida en GPU consumer; en CPU con cuantizacion GGUF puede ser aceptable para uso puntual.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoria. Al ser un modelo muy especializado, no hay alternativas directas documentadas. Como referencia, se puede comparar con el modelo base Qwen/Qwen3.5-0.8B-Base, del que deriva, pero el base no esta entrenado para generar JSON de metadatos de razonamiento. Otros modelos de tamano similar como Qwen2.5-0.5B o Llama-3.2-1B podrian adaptarse con un fine-tuning similar, pero no hay datos comparativos de rendimiento en esta tarea especifica.

## Limitaciones y advertencias

- **Especializacion**: esta disenado exclusivamente para extraer metadatos JSON de cadenas de razonamiento; no es un modelo de chat ni de generacion de texto libre. Usarlo para otros fines puede producir resultados sin sentido.
- **Idioma**: el modelo fue entrenado principalmente en ingles (etiqueta `language: en`). No se garantiza un rendimiento correcto en otros idiomas.
- **Contexto limitado**: la longitud de contexto de entrenamiento es 4096 tokens; entradas mas largas pueden truncarse o degradar la calidad del resumen.
- **Alucinacion**: como cualquier modelo de lenguaje, puede generar resumenes que no reflejen fielmente el razonamiento de entrada. Se recomienda validar la salida JSON en flujos de produccion.
- **Formato de salida**: el modelo puede producir JSON mal formado en algunos casos; el README sugiere comprobar la validez y la presencia exacta de las claves `title`, `sub_title`, `summary`, `cur_task`.
- **Licencia**: aunque el modelo esta bajo Apache 2.0, se aplican los terminos del modelo base Qwen/Qwen3.5-0.8B-Base. Es necesario revisar la licencia de ese modelo para uso comercial, especialmente si se distribuye o se utiliza en productos cerrados.

## Enlaces

- [Modelo original en Hugging Face](https://huggingface.co/Qyrou/reasoning-summarizer-800m-pre)
- [Version GGUF de SupraLabs](https://huggingface.co/SupraLabs/reasoning-summarizer-800m-pre-gguf)
- [Dataset de entrenamiento Qyrou/reasoning-summaries-61k](https://huggingface.co/datasets/Qyrou/reasoning-summaries-61k)
- [Modelo base Qwen/Qwen3.5-0.8B-Base](https://huggingface.co/Qwen/Qwen3.5-0.8B-Base)
