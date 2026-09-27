# A1yCE/pixai-tagger-v1.0-onnx-fp16

## Resumen

PixAI Tagger v1.0 ONNX fp16 es una copia en precisión float16 del export ONNX del tagger de anime `pixai-labs/pixai-tagger-v1.0`. Lo publica el usuario A1yCE y está pensado para funcionar como etiquetador local dentro de la aplicación Epiphany. El modelo original es de pixai-labs; el export a ONNX lo realizó noaione, y esta variante se limita a convertir pesos y cómputo a fp16 con `onnxconverter-common`, manteniendo entradas y salidas en float32.

Se trata de un clasificador multietiqueta de imágenes, no de un modelo generativo: recibe un tensor `pixel_values` de forma fija `[1, 3, 1008, 1008]` y devuelve `logits` de forma `[1, 30877]`, a los que hay que aplicar una sigmoide por clase. Las etiquetas se agrupan en seis categorías (general, character, copyright, style, meta y rating) cuyos desplazamientos están definidos en `tags.json`. El autor reporta métricas F1 idénticas a las del export fp32 y una reducción del tiempo de inferencia de 0,80 s a 0,63 s por imagen en una RTX 4090 Laptop mediante WebGPU.

Su relevancia es práctica: reduce el tamaño del modelo de 1,96 GB a 0,98 GB sin pérdida medible de F1 en la muestra evaluada, lo que facilita el despliegue en equipos con poca VRAM y en entornos Node.js mediante `onnxruntime-node`. La contrapartida es que las probabilidades en fp16 tienden a ser ligeramente más altas, por lo que se recomienda ajustar los umbrales de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador multietiqueta de imagenes; topologia interna no detallada por el autor (no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 1008 x 1008 pixeles |
| Tipos de cuantizacion | fp16 (esta version); existe export fp32 de referencia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (pesos fp16, entradas y salidas float32) |
| Numero de clases de salida | 30.877 |
| Categorias de etiquetas | general, character, copyright, style, meta, rating |
| Entrada | `pixel_values`, float32, `[1, 3, 1008, 1008]`, RGB sobre blanco, letterbox negro, normalizado `x / 255 * 2 - 1` |
| Salida | `logits`, float32, `[1, 30877]`, sigmoide por clase |
| Modelo base | `pixai-labs/pixai-tagger-v1.0` (export ONNX de `noaione`) |
| Tamano del repositorio | 1,0 GB |
| Fecha de publicacion | 2026-09-27 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El autor de esta ficha no documenta la topologia interna del modelo base, los datos de entrenamiento ni el proceso de ajuste (RLHF, DPO u otros); esos datos figuran como no disponibles. Lo que sí se detalla es el procedimiento de conversión: se aplicó `convert_float_to_float16(model, keep_io_types=True)` de `onnxconverter-common`, de modo que los pesos y el cómputo pasan a fp16 mientras las entradas y salidas permanecen en float32. El archivo `tags.json` no se modificó respecto al export original.

La innovación técnica de esta variante es, por tanto, exclusivamente de eficiencia: el modelo pasa de 1,96 GB a 0,98 GB y de 0,80 s a 0,63 s por imagen en el hardware de prueba, manteniendo el mismo F1. La validación se hizo con `onnxruntime-node` 1.30 sobre WebGPU en una RTX 4090 Laptop, comparando 398 publicaciones recientes de Danbooru, Safebooru, Gelbooru y Konachan contra las etiquetas propias de cada sitio. Como efecto secundario documentado, las probabilidades en fp16 salen ligeramente más altas que en fp32.

## Capacidades

- Etiquetado multietiqueta de imagenes de estilo anime sobre 30.877 clases de salida, agrupadas en seis categorias.
- Identificacion de personajes y de la obra o copyright a la que pertenecen, con categorias especificas para cada caso.
- Clasificacion de estilo, metadatos y rating de la imagen.
- Funcionamiento completamente local y offline, sin llamadas a servicios externos.
- Ejecucion en navegador o en Node.js mediante ONNX Runtime y el backend WebGPU.
- Entrada de imagen con resolucion fija de 1008 x 1008, con preprocesado determinista (composicion sobre blanco y letterbox negro).
- No se documentan capacidades de generacion de texto, tool calling, razonamiento multi-paso, vision-general, audio ni modo de pensamiento; no disponibles.

## Casos de uso

- Etiquetado automatico de bibliotecas de imagenes anime: el modelo procesa cada imagen a 1008 x 1008 y devuelve 30.877 logits que, tras aplicar sigmoide y los umbrales adecuados, se convierten en etiquetas normalizadas para busqueda y filtrado.
- Curaduria de datasets de entrenamiento: al identificar personaje, copyright y etiquetas generales, permite construir datasets anotados de forma consistente y filtrar por rating o por estilo antes de entrenar modelos generativos.
- Integracion en aplicaciones de escritorio: es la pieza que usa Epiphany como etiquetador local, de modo que sirve como referencia directa para integrar un tagger sin conexion en un cliente nativo.
- Preprocesado de prompts para generacion de imagen: las etiquetas inferidas pueden enrutarse como condicionamiento textual a un pipeline de difusion, reduciendo la intervencion manual del usuario.
- Moderacion y clasificacion por rating: la categoria rating permite separar contenido sensible del resto en plataformas de galeria o foros.
- Indexacion y busqueda semantica en galerias autoalojadas: almacenando las etiquetas por imagen se habilita busqueda por personaje, obra o atributo sin depender de metadatos manuales.
- Procesamiento por lotes en servidor: al ocupar menos de 1 GB de pesos, es viable ejecutar varias instancias o combinarlo con otros modelos en la misma GPU.
- Herramientas de aumentacion de datos: las etiquetas detectadas pueden usarse para verificar que una imagen aumentada conserva los atributos relevantes.

## Benchmarks y rendimiento

Metricas de esta variante fp16, medidas por el autor sobre 398 publicaciones recientes de Danbooru, Safebooru, Gelbooru y Konachan, comparadas contra las etiquetas propias de cada sitio, con `onnxruntime-node` 1.30 y backend WebGPU en una RTX 4090 Laptop:

| Categoria | F1 frente a fp32 | Umbral recomendado |
|---|---|---|
| general | 0,57 (identico a fp32) | 0,4 |
| character | 0,63 (identico a fp32) | 0,5 |
| copyright | 0,83 (identico a fp32) | 0,6 |
| style | no disponible en F1 | 0,25 |

| Metrica adicional | Valor |
|---|---|
| Tiempo por imagen (fp16) | 0,63 s |
| Tiempo por imagen (fp32) | 0,80 s |
| Tamano del modelo (fp16) | 0,98 GB |
| Tamano del modelo (fp32) | 1,96 GB |

Metricas publicadas para el modelo base `pixai-labs/pixai-tagger-v1.0`:

| Metrica | Valor |
|---|---|
| Micro F1 | 0,6660 |
| Ventaja sobre el siguiente modelo | 2,25 puntos porcentuales |
| mAP sobre 8.407 etiquetas generales compartidas | 0,3807 |

No se dispone de resultados comparables de MMLU, HumanEval o GSM8K, ya que no son tareas aplicables a un tagger de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB con los pesos fp16 (0,98 GB) mas activaciones a 1008 x 1008 con lote 1. Estimacion a partir del tamano del modelo; el autor no publica una cifra de VRAM.
- GPU recomendadas: cualquier GPU con soporte WebGPU razonable. El autor ha validado el modelo en una RTX 4090 Laptop.
- Compatibilidad con GPU de consumo: si, cabe con holgura en GPUs de consumo actuales; el cuello de botella es mas el backend de ejecucion que la memoria.
- Backends probados: `onnxruntime-node` 1.30 con WebGPU.
- Backends no soportados: DirectML, donde el modelo no carga (tampoco lo hace el export fp32).
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables, al tratarse de un modelo ONNX de clasificacion de imagenes y no de un modelo de lenguaje.
- Latencia medida: 0,63 s por imagen en fp16 y 0,80 s por imagen en fp32, sobre el hardware de prueba indicado.
- Throughput: no disponible; no se publican cifras con lotes mayores de uno.

## Comparativa con modelos similares

| Modelo | Tipo | Clases o etiquetas | F1 / metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A1yCE/pixai-tagger-v1.0-onnx-fp16 | ONNX fp16, clasificacion de imagenes | 30.877 clases de salida (se citan mas de 13.000 etiquetas ricas en herramientas derivadas) | F1 general 0,57; character 0,63; copyright 0,83 en la muestra propia | Apache 2.0 | Hugging Face |
| noaione/pixai-tagger-v1.0-onnx | ONNX fp32, mismo modelo base | 30.877 clases de salida | Referencia fp32 de la comparacion anterior | Apache 2.0 | Hugging Face |
| pixai-labs/pixai-tagger-v1.0 | Modelo base | no disponible | Micro F1 0,6660; mAP 0,3807 sobre 8.407 etiquetas generales | Apache 2.0 | Hugging Face |
| wd-tagger (familia WD14) | Tagger de anime | aproximadamente 10.000 etiquetas | no disponible | no disponible | Publicamente conocido |

Los datos de parametros totales no estan disponibles para ninguno de los modelos comparados en la informacion consultada. La ventaja declarada del sistema PixAI frente a taggers con taxonomias mas reducidas, como wd-tagger, es la cobertura de etiquetas (mas de 13.000 etiquetas ricas segun las herramientas de terceros que lo integran).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan de forma explicita. Al entrenarse sobre imagenes y etiquetas de Danbooru y sitios similares, hereda la distribucion y los sesgos de esas comunidades.
- Riesgo de alucinacion: es un clasificador multietiqueta, no genera texto; el riesgo equivalente es el de falsos positivos por clase, mitigable ajustando el umbral de sigmoide.
- Calibracion: en fp16 las probabilidades son ligeramente mas altas que en fp32, por lo que umbrales copiados de una implementacion fp32 pueden producir mas positivos. Los umbrales probados por el autor son 0,4 (general), 0,5 (character), 0,6 (copyright) y 0,25 (style).
- Cobertura de evaluacion: el F1 publicado corresponde a 398 publicaciones de cuatro sitios y a tres categorias; no es una evaluacion exhaustiva de las 30.877 clases.
- Compatibilidad: el modelo no carga en DirectML, ni esta variante ni el export fp32.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de licencia y se indiquen los cambios. Es la misma licencia que el modelo base.
- Idiomas: no disponible. La taxonomia de etiquetas sigue el esquema de Danbooru, orientado a terminos en ingles.
- Entrada rigida: el modelo exige exactamente 1008 x 1008 pixeles y un preprocesado concreto; cualquier desviacion en la composicion sobre blanco, el letterbox o la normalizacion afecta a los resultados.
- Adopcion: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validacion externa es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/A1yCE/pixai-tagger-v1.0-onnx-fp16
- Modelo base: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Export ONNX fp32 de referencia: https://huggingface.co/noaione/pixai-tagger-v1.0-onnx
- Aplicacion Epiphany, que integra este tagger: https://github.com/P3lerA/Epiphany
- GUI de terceros para el tagger ONNX: https://github.com/wai55555/PixaiTaggerOnnxGui
- GUI de etiquetado y generacion de descripciones: https://github.com/wai55555/ImageTaggerGUI
- Documentacion del sistema de etiquetado PixAI en DeepWiki: https://deepwiki.com/deepghs/imgutils/4.2-camie-tagging-system
