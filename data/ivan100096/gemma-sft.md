# ivan100096/gemma-sft

## Resumen

`ivan100096/gemma-sft` es un ajuste fino supervisado (SFT) del modelo `google/functiongemma-270m-it`, publicado por el usuario ivan100096 en Hugging Face. Se trata, por tanto, de un derivado de la familia Gemma 3 en su variante de texto de 270 millones de parametros, especializada originalmente en function calling y orientada a instrucciones. El modelo conserva la arquitectura `gemma3_text` y los pesos en formato safetensors, con un total real de 268.098.176 parametros.

El problema que aborda es el de adaptar un modelo pequeno de proposito general a un dominio o estilo concreto mediante entrenamiento supervisado con TRL. El autor no documenta el dataset, el numero de pasos ni los hiperparametros utilizados, por lo que la ficha se limita a los datos verificables: linaje del modelo base, framework de entrenamiento y artefactos publicados.

Su relevancia practica es limitada pero clara: sirve como ejemplo reproducible de un pipeline SFT sobre un modelo de 270M, un tamano que cabe en cualquier GPU de consumo y permite iterar rapidamente. Al no haber descargas ni likes, y al no declarar licencia ni idiomas, debe tratarse como un experimento de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only `gemma3_text` (familia Gemma 3) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base `google/functiongemma-270m-it`) |
| Tipos de cuantizacion | No disponible; al ser safetensors, admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible (el modelo base Gemma soporta multilingue, pero el autor no lo declara) |
| Licencia | No disponible (la model card contiene un campo `licence: license` sin contenido) |
| Formato de pesos | Safetensors (repo de 1,1 GB) |
| Modelo base | `google/functiongemma-270m-it` |
| Metodo de entrenamiento | SFT con TRL 1.17.1 |
| Framework | Transformers 5.22.1, PyTorch 2.14.1, Datasets 5.1.0, Tokenizers 0.23.3 |
| Pipeline | text-generation |
| Compatibilidad | `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, en su variante de texto (`gemma3_text`), con 268 millones de parametros. El punto de partida, `google/functiongemma-270m-it`, es una version ajustada para instrucciones y function calling del Gemma 3 de 270M, construida por Google DeepMind a partir de la misma tecnologia que sus modelos Gemini. No se dispone de informacion sobre el numero de capas, dimensiones ocultas ni mecanismos de atencion especificos de esta variante en la informacion proporcionada.

El entrenamiento consistio en un ajuste fino supervisado (SFT) ejecutado con TRL 1.17.1 sobre Transformers 5.22.1 y PyTorch 2.14.1. La model card no especifica el dataset, el volumen de tokens, la composicion de los datos, la existencia de RLHF/DPO posterior ni los hiperparametros (learning rate, epochs, batch size). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El repositorio incluye logs de TensorBoard, lo que sugiere que las curvas de entrenamiento estan disponibles para inspeccion, aunque no se han publicado resultados en la ficha.

## Capacidades

- Generacion de texto conversacional en formato de chat (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Hereda del modelo base la capacidad de function calling y tool calling, aunque el ajuste SFT puede haberla reforzado o degradado y no se documenta cual de las dos cosas ha ocurrido.
- Razonamiento multi-turno basico, limitado por el tamano del modelo (270M parametros).
- Capacidades multilingues potenciales heredadas de Gemma, no verificadas ni declaradas por el autor.
- Integracion con `text-generation-inference` y endpoints compatibles, lo que facilita el despliegue como API.
- No se documentan capacidades de vision, audio, modo thinking explicito ni agentes multi-paso verificados.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: con 270M parametros, el modelo se carga en una sola GPU de consumo y permite iterar sobre prompts y flujos de dialogo en minutos, antes de invertir en modelos mayores.
- Pruebas de pipelines SFT: sirve como referencia reproducible de un entrenamiento con TRL sobre un modelo pequeno, util para validar hiperparametros, plantillas de chat y formato de datos antes de escalar a modelos de 7B o superiores.
- Function calling en entornos con recursos muy limitados: al derivar de `functiongemma-270m-it`, puede utilizarse para enrutar llamadas a herramientas en dispositivos edge o en servicios con presupuesto de VRAM minimo, siempre que se valide el comportamiento tras el ajuste.
- Generacion de texto de bajo coste en lote: para tareas de clasificacion, etiquetado o reescritura simple donde la latencia y el coste por token importan mas que la calidad absoluta.
- Educacion y demos: modelo adecuado para talleres y tutoriales sobre fine-tuning, ya que el repo completo ocupa 1,1 GB y el entrenamiento es asequible en una sola GPU.
- Evaluacion comparativa de tecnicas de SFT: permite contrastar el efecto del ajuste frente al modelo base en tareas concretas, usando los logs de TensorBoard incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,54 GB solo para pesos (268M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,3 GB para pesos; en 4 bits, alrededor de 0,15 GB, aunque estos valores dependen de la herramienta de cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien cabe en GPUs de portatil con 4 GB o mas, e incluso en CPU para inferencia de baja concurrencia.
- Despliegue: compatible con `text-generation-inference` (segun los tags del repo), `transformers` con `pipeline`, y previsiblemente con llama.cpp u Ollama si se genera una version GGUF, aunque no se distribuye ninguna en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ivan100096/gemma-sft` | 268M | No disponible | No disponible | Hugging Face, 0 descargas | SFT sobre `functiongemma-270m-it` |
| `google/functiongemma-270m-it` | ~270M | No disponible en la informacion proporcionada | Gemma (terminos de Google) | Hugging Face, modelo oficial | Base oficial orientado a function calling |
| Gemma 3 270M (variante texto) | 270M | No disponible en la informacion proporcionada | Gemma (terminos de Google) | Hugging Face, modelo oficial | Modelo generalista de la misma familia |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia efectiva: el campo `licence: license` no especifica terminos, lo que impide determinar si el uso comercial esta permitido. Al derivar de Gemma, es probable que apliquen los terminos de uso de Google, pero debe verificarse antes de cualquier despliegue.
- No se documenta el dataset de entrenamiento ni el volumen de datos, por lo que no es posible evaluar sesgos introducidos por el ajuste ni la calidad de la supervision.
- Riesgo de alucinacion alto: con 270M parametros, el modelo tiene una capacidad limitada de razonamiento y factualidad, especialmente en tareas que requieren conocimiento del mundo.
- El ajuste SFT puede haber degradado las capacidades de function calling del modelo base; no hay evaluacion que lo confirme ni lo descarte.
- No se declaran idiomas soportados; el comportamiento en castellano no esta verificado.
- Longitud de contexto no documentada; asumir la del modelo base sin confirmacion es arriesgado para aplicaciones con contexto largo.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad ni de estabilidad en produccion.
- El repositorio incluye logs de TensorBoard pero no se presentan curvas ni metricas finales en la ficha, lo que dificulta juzgar la convergencia del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivan100096/gemma-sft
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Pagina oficial de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Ejemplo de fine-tuning SFT de Gemma en NVIDIA GenerativeAIExamples: https://github.com/NVIDIA/GenerativeAIExamples/blob/main/finetuning/Gemma/sft.ipynb
