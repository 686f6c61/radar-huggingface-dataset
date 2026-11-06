# liodon-ai/Qwen3-1.7B-FP8

## Resumen

Qwen3-1.7B-FP8 es una cuantizacion en FP8 dinamico del modelo Qwen/Qwen3-1.7B, publicada por Liodon AI. Se trata de un modelo de generacion de texto de la familia Qwen3, con 1.720.574.976 parametros (aproximadamente 1,7 mil millones) y arquitectura transformer densa. La cuantizacion reduce el peso del repositorio de 4,1 GB a 2,0 GB manteniendo los pesos en formato FP8 (E4M3) por canal, lo que permite servir el modelo con menor huella de memoria en GPUs NVIDIA con capacidad de computo igual o superior a 8.9 (Ada, Hopper y Blackwell).

El interes practico de esta publicacion es que ofrece una version lista para produccion de un modelo pequeno de la familia Qwen3, compatible con vLLM, TGI y SGLang, y con un esquema de cuantizacion que no requiere dataset de calibracion. Esto elimina el sesgo introducido por conjuntos de calibracion y simplifica la reproducibilidad del proceso. El modelo base Qwen3-1.7B esta disenado para tareas conversacionales, generacion de codigo y razonamiento ligero, y esta orientado a despliegues con recursos limitados.

Al tratarse de una cuantizacion y no de un modelo entrenado desde cero, sus capacidades y limitaciones heredan las del modelo base. La licencia declarada es "other", heredada del modelo original, por lo que es necesario consultar los terminos de Qwen/Qwen3-1.7B antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (familia Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 dinamico (pesos E4M3 por canal, activaciones FP8 por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base Qwen/Qwen3-1.7B) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3-1.7B original, que emplea una arquitectura transformer densa. La cuantizacion se realizo con la herramienta llm-compressor del proyecto vLLM usando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (formato E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Este esquema no necesita dataset de calibracion, por lo que los pesos cuantizados son esencialmente una conversion directa de los originales, sin sesgo de calibracion. La capa `lm_head` se deja sin cuantizar, una practica habitual por su impacto desproporcionado en la calidad frente a su tamano reducido.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO, ya que la model card de esta cuantizacion no los detalla. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio esquema de cuantizacion FP8 dinamico.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredadas del modelo base Qwen3-1.7B.
- Razonamiento y generacion de codigo, segun las capacidades del modelo base (no verificadas en esta ficha).
- Compatibilidad con tool calling y function calling: no confirmado en la informacion disponible; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia eficiente en FP8 en GPUs NVIDIA con compute capability igual o superior a 8.9.

## Casos de uso

- Servicio de chat conversacional de bajo coste: el modelo puede desplegarse con vLLM o TGI en una unica GPU y atender conversaciones multi-turno, con una huella de memoria de aproximadamente 2 GB en pesos, lo que deja margen para cache KV y batching.
- Clasificacion y extraccion de informacion: al ser un modelo pequeno, es adecuado para tareas de etiquetado, resumen corto o extraccion de entidades en pipelines de procesamiento de documentos a gran escala.
- Generacion de codigo asistida en entornos con recursos limitados: puede integrarse como autocompletado o generador de snippets en herramientas de desarrollo, siempre que se valide su calidad en el dominio concreto.
- Prototipado rapido de aplicaciones LLM: su tamano reducido y su compatibilidad con SGLang, vLLM y TGI permiten levantar un endpoint compatible con la API de OpenAI en minutos para pruebas de concepto.
- Despliegue en el borde o en estaciones de trabajo: en GPUs consumer de la serie RTX 40 (Ada) o superiores, el modelo puede ejecutarse con aceleracion FP8 nativa, lo que lo hace viable para aplicaciones locales de asistencia.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de FP8 dinamico frente al modelo base en tareas concretas, dado que no hay sesgo de calibracion.
- Generacion de texto en lote (batch offline): para tareas de sintesis de datos o aumentacion de corpus donde el throughput importa mas que la latencia interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB solo para pesos en FP8; el consumo total depende de la cache KV, el tamano de lote y la longitud de contexto, que no se especifica.
- GPUs recomendadas para ejecucion FP8 nativa: NVIDIA con compute capability igual o superior a 8.9, es decir, RTX 40-series (Ada), L4, L40S, H100, H200, B100, B200 y GB10.
- En GPUs anteriores a Ada/Hopper, vLLM y TGI descomprimen el modelo para ejecutarlo, lo que anula la ventaja de velocidad y memoria del FP8.
- Cabe en GPUs consumer compatibles con FP8, como las RTX 40-series; en GPUs sin soporte FP8, el modelo puede ejecutarse en su version descomprimida si hay VRAM suficiente (el modelo base ocupa 4,1 GB en pesos).
- Opciones de despliegue documentadas: vLLM (`vllm serve liodon-ai/Qwen3-1.7B-FP8`), Text Generation Inference (imagen oficial de TGI) y SGLang (`python -m sglang.launch_server --model-path liodon-ai/Qwen3-1.7B-FP8`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Qwen3-1.7B-FP8 | 1,72 B | no disponible | safetensors FP8 | other | Cuantizacion FP8 dinamica del Qwen3-1.7B |
| Qwen/Qwen3-1.7B | 1,72 B (aprox.) | no disponible | safetensors | other | Modelo base sin cuantizar; 4,1 GB en pesos |
| liodon-ai/Qwen3-1.7B-Base-FP8 | no disponible | no disponible | safetensors FP8 | no disponible | Variante FP8 de la version Base de Qwen3-1.7B |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una cuantizacion, la calidad puede degradarse ligeramente respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se documentan mitigaciones especificas.
- La licencia es "other", heredada de Qwen/Qwen3-1.7B; es imprescindible revisar los terminos del modelo base antes de un uso comercial.
- La ejecucion FP8 requiere hardware Ada, Hopper o Blackwell; en GPUs anteriores se pierde la ventaja de rendimiento y memoria.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de despliegues en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- No se documentan sesgos conocidos del modelo base en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/Qwen3-1.7B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante Base FP8 del mismo autor: https://huggingface.co/liodon-ai/Qwen3-1.7B-Base-FP8
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
