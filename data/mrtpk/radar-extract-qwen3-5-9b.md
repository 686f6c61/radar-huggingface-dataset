# mrtpk/radar-extract-qwen3.5-9b

## Resumen

Research Radar extractor es un ajuste fino por LoRA de Qwen/Qwen3.5-9B desarrollado por el usuario mrtpk para dos tareas de extraccion de informacion estructurada sobre articulos de arXiv. El modelo recibe el titulo, resumen, introduccion, conclusion y palabras clave de un paper y devuelve un JSON con un resumen en cuatro partes (problema, propuesta, diferencia, resultado) y entre 5 y 9 palabras clave etiquetadas con tipo, relacion y una frase explicativa, ademas de 1 a 4 frases sujeto con definicion, cita textual y frase principal.

El modelo es el respaldo local de Research Radar, una herramienta que rastrea papers nuevos de arXiv por dominio, palabra clave, tema y novedad. Se distribuye como modelo fusionado en bf16 (9.409.813.744 parametros) y como adaptador LoRA en el subdirectorio `adapter/`. Su interes practico radica en que sustituye a modelos propietarios mucho mayores (DeepSeek v4.1 flash y qwen4-max) en una tarea acotada, con un rendimiento medido superior al de Qwen3.5-9B sin entrenar y al de Qwen3.8-27B sin entrenar en las metricas de solapamiento de palabras clave y fidelidad de citas.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial. El contexto de entrenamiento fue de 8.192 tokens y la guia de despliegue recomienda 16.384 tokens de longitud de contexto en SGLang. El modelo solo trabaja con papers en ingles de informatica y areas cercanas (stat.ML, eess.AS, eess.IV).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y proyecciones MLP (base Qwen3.5-9B), ajuste fino LoRA |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento; 16.384 recomendados en despliegue |
| Tipos de cuantizacion | no disponible (se publica en bf16; el adaptador LoRA permite fusion y cuantizacion posterior) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado bf16 y adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer con atencion lineal y proyecciones MLP, e incorpora un adaptador LoRA de rango 32, alpha 64 y dropout 0.05 aplicado sobre las proyecciones de atencion, atencion lineal y MLP del modelo de texto. El adaptador entrena 80,2 millones de parametros de los 9,49 mil millones totales; la torre de vision del modelo base queda sin cambios. El ajuste se realizo con peft 0.22 sobre una sola GPU AMD MI300X en bf16, durante 11,7 horas y con un pico de 45,4 GB.

Los datos de entrenamiento son 45.871 ejemplos (121,6 millones de tokens) generados por dos profesores: 22.419 respuestas de extraccion de DeepSeek v4.1 flash y 23.454 respuestas de frases sujeto de qwen4-max, sobre papers de arXiv de octubre y noviembre de 2026. Se reservo un 2 % de papers para validacion y 200 papers para el conjunto de evaluacion. La perdida se calcula solo sobre los tokens de respuesta, usando el prompt de servicio con plantilla de chat y thinking desactivado. El entrenamiento fue de una epoca, 2.867 pasos de 16 ejemplos, tasa de aprendizaje 1e-4, calentamiento del 3 % y decaimiento hasta cero, con longitud maxima de 8.192 tokens. La perdida de validacion paso de 0,537 en el paso 500 a 0,495 al final, igual a la de entrenamiento.

## Capacidades

- Extraccion de informacion estructurada en JSON a partir de texto cientifico: resumen en cuatro partes y palabras clave con tipo, relacion y frase.
- Generacion de frases sujeto con definicion, cita textual verificable y frase principal unica.
- Cumplimiento estricto de esquemas JSON mediante decodificacion guiada (xgrammar en SGLang).
- Generacion de texto conversacional y de codigo heredada del modelo base Qwen3.5-9B.
- Capacidades de vision heredadas del modelo base (image-text-to-text), aunque la torre de vision no se entreno en este ajuste.
- Soporte de tool calling y function calling heredado del modelo base, no validado especificamente en este ajuste.
- Capacidad multilingue limitada al ingles en la tarea entrenada.

## Casos de uso

- Rastreo automatizado de arXiv: el modelo procesa el titulo, resumen, introduccion y conclusion de cada paper nuevo y devuelve un JSON con resumen y palabras clave, lo que permite indexar y clasificar papers por dominio, tema y novedad sin depender de APIs de pago.
- Construccion de bases de datos bibliograficas: las palabras clave etiquetadas con tipo (metodo, tarea, modelo, herramienta, dataset) y relacion (introduce, mejora, extiende, aplica, usa, evalua, compara, analiza, revisa) permiten generar grafos de conocimiento sobre que tecnicas se usan o mejoran en cada articulo.
- Filtrado y alertas personalizadas: al extraer frases sujeto con definiciones y citas textuales, un sistema puede comparar papers nuevos con los intereses de un investigador y enviar alertas con evidencia verificable del texto original.
- Revision bibliografica asistida: el resumen en cuatro partes (problema, propuesta, diferencia, resultado) sirve como primera lectura de un paper antes de decidir si merece una lectura completa, con la ventaja de que las citas textuales se pueden comprobar en el input.
- Despliegue local y privado: al ser un modelo de 9,4 mil millones de parametros con licencia Apache 2.0, se puede ejecutar en infraestructura propia con SGLang o transformers, sin enviar textos a servicios externos, algo relevante para instituciones con requisitos de confidencialidad.
- Extraccion de metadatos para pipelines de datos cientificos: el JSON resultante se puede insertar directamente en un motor de busqueda o en un almacen documental, ya que el modelo garantiza cero respuestas invalidas en la evaluacion realizada.
- Generacion de resumenes con citas verificables: la metrica de citas encontradas literalmente en el input (0,989) lo hace adecuado para tareas donde se exige que cada afirmacion este respaldada por un fragmento del texto original.

## Benchmarks y rendimiento

Evaluacion sobre 200 papers de arXiv reservados (conjunto anchor a1), 2 ejecuciones por modelo, temperatura 0,7, top-p 0,8, top-k 20, penalizacion de presencia 0, thinking desactivado y esquema JSON forzado. Las referencias son las respuestas almacenadas de DeepSeek v4.1 flash y qwen4-max.

| Medida | Qwen3.5-9B sin entrenar | Qwen3.8-27B sin entrenar | Este modelo |
|---|---|---|---|
| Jaccard de palabras clave con DeepSeek | 0,343 | 0,383 | **0,448** |
| IC95 emparejado de la diferencia con el 27B sin entrenar | [-0,057, -0,022] | - | **[0,043, 0,087]** |
| Recall de palabras clave (DeepSeek) | 0,435 | 0,475 | **0,594** |
| Coseno de frases con DeepSeek | 0,871 | 0,892 | **0,919** |
| Jaccard de palabras clave con qwen4-max | 0,270 | 0,326 | 0,318 |
| Palabras clave por paper | 5,37 | 5,45 | 6,96 |
| Relaciones fuera de la lista | 4,2 % | 2,7 % | **0,6 %** |
| Incumplimientos de reglas (autorreferencia en palabras clave) | 2 % | 1,5 % | **0 %** |
| Citas de frases encontradas literalmente en el input | 0,732 | 0,918 | **0,989** |
| Coseno de frase principal con qwen4-max | 0,792 | 0,835 | **0,879** |
| Respuestas fallidas o invalidas | 0 | 0 | 0 |
| Puertas falladas (de 19) | 12 | 11 | **0** |

Una revision manual de 20 respuestas (las 10 con menor solapamiento de palabras clave y 10 aleatorias) no encontro afirmaciones sustantivamente erroneas. Los defectos observados fueron palabras clave casi duplicadas en una misma respuesta y palabras clave demasiado estrechas. No se ha medido aun la prueba de reconstruccion de Research Radar (un juez comprueba si el resumen permite reconstruir la tesis del paper). La puntuacion de novedad y otras tareas no se entrenaron ni se evaluaron.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 el modelo fusionado ocupa aproximadamente 18,8 GB de pesos (9,4 mil millones de parametros), mas overhead de activaciones y cache KV; con cuantizacion de 8 bits se reduce a unos 9,4 GB y con 4 bits a unos 4,7 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se hizo en una AMD MI300X; para inferencia se recomienda una GPU con al menos 24 GB de VRAM en bf16 (A100 40 GB, H100, L40S) o una RTX 4090 con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion de 8 o 4 bits; en bf16 completo queda justo en el limite de 24 GB y puede requerir offloading.
- Opciones de despliegue: SGLang (recomendado por el autor, con `--context-length 16384 --grammar-backend xgrammar`), transformers con el modelo fusionado, y llama.cpp u Ollama si se generan cuantizaciones GGUF a partir del modelo fusionado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento consumio 11,7 horas en una MI300X para 2.867 pasos, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Research Radar extractor (este modelo) | 9,41 B | 8.192 en entrenamiento, 16.384 recomendado | Jaccard 0,448 con DeepSeek; 0 puertas falladas de 19 | Apache 2.0 | Hugging Face, pesos safetensors |
| Qwen3.5-9B sin entrenar | 9,4 B | no disponible | Jaccard 0,343 con DeepSeek; 12 puertas falladas de 19 | Apache 2.0 | Hugging Face |
| Qwen3.8-27B sin entrenar | 27 B (aproximado, no confirmado) | no disponible | Jaccard 0,383 con DeepSeek; 11 puertas falladas de 19 | no disponible | Hugging Face |
| DeepSeek v4.1 flash (profesor) | no disponible | no disponible | Referencia de la evaluacion | no disponible | API |
| qwen4-max (profesor) | no disponible | no disponible | Referencia de la evaluacion | no disponible | Alibaba Cloud Model Studio |

## Limitaciones y advertencias

- Solo cubre papers de arXiv en ingles de informatica y areas cercanas (stat.ML, eess.AS, eess.IV); papers de otros dominios o idiomas no estan soportados.
- Papers posteriores a los datos de entrenamiento pueden contener terminos que el modelo no haya visto.
- El modelo imita el estilo y las decisiones de sus profesores, incluidos sus errores.
- La entrada se limita a titulo, resumen, introduccion y conclusion; el modelo no ve las secciones de metodo y resultados, por lo que el resumen puede omitir detalles tecnicos clave.
- La puntuacion de novedad y otras tareas de Research Radar no se entrenaron ni se evaluaron.
- La prueba de reconstruccion (si el resumen permite reconstruir la tesis del paper) no se ha medido.
- Riesgo de alucinacion: aunque las citas textuales se encontraron literalmente en el input en el 98,9 % de los casos, el resumen en cuatro partes y las frases explicativas son generativas y pueden contener imprecisiones.
- Defectos observados en la revision manual: palabras clave casi duplicadas y palabras clave demasiado estrechas.
- El modelo solo declara soporte de ingles; el uso en castellano no esta validado.
- La licencia Apache 2.0 permite uso comercial, pero las respuestas de entrenamiento provienen de DeepSeek API y de qwen4-max en Alibaba Cloud Model Studio, con terminos que permiten entrenar sobre sus salidas; conviene revisar dichos terminos para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrtpk/radar-extract-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Research Radar (referenciado en la model card como `src/radar/prompt.py` y `src/radar/topics.py`): no disponible como URL en la informacion proporcionada
- Paper o blog del ajuste: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
