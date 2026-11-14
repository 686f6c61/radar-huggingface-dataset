# liodon-ai/granite-4.1-8b-llmon-preview-FP8

## Resumen

`granite-4.1-8b-llmon-preview-FP8` es una cuantizacion en FP8 del modelo `ibm-granite/granite-4.1-8b-llmon-preview`, publicada por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos que reduce el peso en disco de 17,6 GB a 9,6 GB manteniendo la estructura del transformer original de IBM. El repositorio contiene 8.791.592.960 parametros en formato safetensors con cuantizacion de tipo `compressed-tensors`.

La relevancia de esta ficha esta en el esquema de cuantizacion empleado: `FP8_DYNAMIC` mediante `llm-compressor`, con pesos en FP8 (E4M3) por canal precalculados y activaciones cuantizadas dinamicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibracion, por lo que la conversion es esencialmente un cast directo de los pesos originales, sin sesgo introducido por un conjunto de calibracion. La cabeza `lm_head` se deja sin cuantizar.

El modelo esta pensado para despliegue en produccion sobre GPUs NVIDIA con compute capability igual o superior a 8.9 (Ada, Hopper o Blackwell), donde la ejecucion en FP8 aporta ventajas reales de memoria y velocidad. En GPUs anteriores, los motores de inferencia dequantizan los pesos para poder ejecutar, lo que anula el beneficio. La licencia declarada es "other" y los idiomas soportados no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de IBM Granite 4.1; detalles no disponibles) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (pesos E4M3 por canal, activaciones FP8 por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano del repositorio | 9,6 GB (original: 17,6 GB) |
| Modelo base | ibm-granite/granite-4.1-8b-llmon-preview |
| Libreria | transformers |
| Pipeline | text-generation |
| Herramienta de cuantizacion | llm-compressor (esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo subyacente es `ibm-granite/granite-4.1-8b-llmon-preview`, un transformer de aproximadamente 8,8 mil millones de parametros de la familia Granite 4.1 de IBM. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se especifica si incorpora innovaciones como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

La contribucion tecnica de este repositorio es exclusivamente la cuantizacion. Se aplica el esquema `FP8_DYNAMIC` de `llm-compressor`: los pesos se convierten a FP8 (formato E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Al no necesitar calibracion, los pesos cuantizados son un cast numerico directo de los originales. La cabeza de salida `lm_head` se mantiene en precision completa, practica habitual por su tamano reducido y su impacto desproporcionado en la calidad si se cuantiza. El resultado reduce el peso de 17,6 GB a 9,6 GB.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Generacion de texto de proposito general (pipeline `text-generation`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags).
- Despliegue en vLLM, Text Generation Inference (TGI) y SGLang, segun los comandos de inicio rapido de la model card.
- Ejecucion nativa en FP8 sobre GPUs con compute capability igual o superior a 8.9.
- Capacidades especificas de razonamiento, codigo, matematicas, vision, tool calling, agentes o multilingue: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional en produccion: el modelo puede servirse con `vllm serve` o TGI y atender peticiones de chat multi-turno con un peso en memoria de 9,6 GB, aproximadamente la mitad que el modelo original.
- Servicio de generacion de texto con requisitos de memoria ajustados: en GPUs Ada u Hopper, la ejecucion en FP8 reduce la huella de pesos y permite destinar mas VRAM a cache KV o a mayor concurrencia.
- Inferencia de alta concurrencia en vLLM o SGLang: ambos motores soportan `compressed-tensors` y FP8, lo que facilita el batching continuo sobre una unica GPU.
- Sustitucion directa del modelo base en pipelines existentes de `transformers`: al mantener la misma estructura y dejar `lm_head` sin cuantizar, la integracion requiere solo cambiar el identificador del modelo.
- Evaluacion comparativa de calidad tras cuantizacion: util para medir la degradacion real de FP8 dinamico frente al modelo original en tareas concretas antes de adoptarlo en produccion.
- Prototipado en estaciones de trabajo con RTX 40-series: al requerir compute capability 8.9 o superior, estas GPUs de consumo pueden ejecutar el modelo en FP8 sin dequantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,6 GB solo para pesos en FP8; el total depende de la longitud de contexto y del tamano de la cache KV, no disponible.
- GPU recomendadas: NVIDIA con compute capability igual o superior a 8.9, es decir, RTX 40-series, L4, L40S, H100, H200, B100, B200 y GB10.
- GPUs de consumo: si cabe en RTX 40-series (Ada) por requisito de FP8 nativo; en GPUs anteriores el motor dequantiza y se pierde la ventaja de memoria y velocidad.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (imagen Docker oficial) y SGLang (`sglang.launch_server`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| granite-4.1-8b-llmon-preview-FP8 | 8,79 B | no disponible | FP8 dinamico | other | safetensors |
| ibm-granite/granite-4.1-8b-llmon-preview (base) | 8,79 B | no disponible | sin cuantizar (17,6 GB) | other | safetensors |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir degradacion de calidad frente al modelo original; no se aportan evaluaciones que la cuantifiquen.
- Requiere GPU con compute capability igual o superior a 8.9 para aprovechar FP8; en hardware anterior se dequantiza y se pierden las ventajas.
- La licencia es "other": es necesario consultar los terminos del modelo base de IBM antes de cualquier uso comercial.
- No se especifican los idiomas soportados, por lo que no puede garantizarse cobertura multilingue.
- No se dispone de la longitud de contexto, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion disponible.
- El repositorio tiene 26 descargas y 0 likes, por lo que su validacion por la comunidad es practicamente nula.
- La fecha de creacion indicada (2026-11-12) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/granite-4.1-8b-llmon-preview-FP8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b-llmon-preview
- Perfil del autor: https://huggingface.co/liodon-ai
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
