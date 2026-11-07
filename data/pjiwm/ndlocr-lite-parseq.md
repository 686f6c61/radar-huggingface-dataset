# Pjiwm/NDLOCR-Lite-PARSeq

## Resumen

NDLOCR-Lite-PARSeq es una conversión de formato del reconocedor de líneas de texto del proyecto NDLOCR-Lite, desarrollado por la Biblioteca Nacional de Japón (National Diet Library). El modelo original, denominado `parseq-ndl-24x768-100-tiny`, se distribuye en formato ONNX dentro del repositorio oficial; esta versión lo reempaqueta en safetensors para poder cargarlo sin depender del runtime de ONNX. No se ha reentrenado ni ajustado ningún peso: se trata exclusivamente de una migración de contenedor y de tipo numérico.

El modelo resuelve la tarea de reconocimiento óptico de caracteres (OCR) a nivel de línea, leyendo una única línea de texto japonés, ya sea horizontal o vertical, de hasta 100 caracteres. Su arquitectura combina un encoder ViT con un decoder PARSeq, con un total de 9,8 millones de parámetros, lo que lo sitúa en la categoría de modelos "tiny" orientados a inferencia ligera en pipelines de digitalización documental.

Es relevante para desarrolladores que trabajan con corpus japoneses y quieren integrar reconocimiento de líneas en entornos Python nativos (PyTorch/safetensors) sin arrastrar la dependencia de onnxruntime, manteniendo la fidelidad de salida respecto al modelo original. El autor del reempaquetado es el usuario de Hugging Face Pjiwm, y la licencia se mantiene en CC BY 4.0, igual que la obra original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ViT + decoder PARSeq (transformer encoder-decoder) |
| Parametros totales | 9,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen fija 1x3x24x768, salida de hasta 101 pasos de decodificacion) |
| Tipos de cuantizacion | Pesos almacenados en float16 (se convierten a float32 al cargar); no se documentan otras cuantizaciones |
| Idiomas soportados | Japones (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`ndl.safetensors`, 17.681.116 bytes) + fichero de charset (`ndl_charset.txt`, 28.323 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PARSeq, un esquema de reconocimiento de texto basado en transformer con decodificacion autorregresiva y permutacion de secuencias, adaptado aqui a lineas japonesas de hasta 100 caracteres. El encoder es un ViT que procesa la imagen de entrada normalizada a `1 x 3 x 24 x 768` en RGB con escala `[-1, 1]` (transformacion `x / 127.5 - 1`). El decoder genera hasta 101 pasos; el token 0 marca el fin de linea y los tokens 1 a 7.141 indexan las lineas de `ndl_charset.txt` (el primer caracter del fichero es un espacio).

No se aportan datos sobre el corpus de entrenamiento original (numero de tokens, composicion, uso de RLHF o DPO) en la informacion disponible; esa informacion pertenece al proyecto NDLOCR-Lite y no se detalla en la model card de este reempaquetado. La innovacion tecnica de esta version es unicamente de empaquetado: los inicializadores ONNX (`model.encoder.*` y `model.decoder.*`) se han volcado a safetensors sin modificar nombres ni formas, en float16, y el charset se ha extraido de `NDLmoji.yaml` (`charset_train`) preservando el orden original. El autor declara que las salidas coinciden con las del modelo ONNX original bajo onnxruntime en 60 lineas de prueba, tanto en float32 como en el float16 almacenado.

## Capacidades

- Reconocimiento OCR de lineas individuales de texto japones, en orientacion horizontal y vertical.
- Manejo de lineas de hasta 100 caracteres, con decodificacion de hasta 101 pasos.
- Rotacion automatica de lineas verticales: si la altura supera 0,8 veces la anchura, la imagen se rota en sentido antihorario antes del recorte y redimensionado a 24x768.
- Salida como secuencia de indices de caracteres mapeables a `ndl_charset.txt` (7.141 entradas).
- Inferencia en Python nativo con safetensors, sin necesidad de onnxruntime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades generativas: es un modelo puramente discriminativo de image-to-text.
- No soporta vision mas alla del reconocimiento de linea, ni audio, ni thinking mode.

## Casos de uso

- Digitalizacion de fondos documentales japoneses: el modelo lee lineas sueltas extraidas por un detector de layout previo (por ejemplo, el DEIMv2 de NDLOCR-Lite), lo que permite reconstruir el texto de paginas escaneadas en bibliotecas y archivos.
- Procesamiento de prensa historica y documentos verticales: la rotacion automatica de lineas con altura mayor que 0,8 veces la anchura lo hace adecuado para texto japones en columnas verticales, habitual en publicaciones anteriores a la posguerra.
- Integracion en pipelines PyTorch existentes: al estar en safetensors, se puede cargar directamente en un stack de inferencia Python sin instalar onnxruntime, simplificando el despliegue en entornos ya basados en PyTorch.
- OCR de formularios y etiquetas en japones: con lineas cortas y bien delimitadas, el limite de 100 caracteres cubre la mayoria de campos de formularios administrativos y etiquetas de producto.
- Extraccion de texto para motores de busqueda internos: el modelo puede alimentar un indexador que procese lotes de imagenes de linea y produzca cadenas de texto para indexacion full-text en japones.
- Reproduccion de resultados frente al modelo ONNX original: util para equipos que quieren validar la equivalencia de salidas (el autor reporta coincidencia en 60 lineas de prueba) antes de migrar su pipeline de onnxruntime a safetensors.
- Prototipado rapido en cuadernos: con solo 9,8 M de parametros, el modelo se puede ejecutar en CPU para pruebas de concepto y validacion de calidad OCR sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la equivalencia de salida con el modelo ONNX original bajo onnxruntime en 60 lineas de prueba, en float32 y float16, sin valores de exactitud, CER o WER.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (9,8 M de parametros, unos 39 MB de pesos) y alrededor de 20 MB en float16; el cuello de botella es el buffer de activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para ellas.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 Ti o una iGPU con soporte CUDA; tambien es viable en CPU para lotes pequenos.
- Opciones de despliegue: carga directa con `safetensors` + PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de OCR de este tamano). El pipeline de Hugging Face es `image-to-text`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y moderado en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NDLOCR-Lite-PARSeq (este) | 9,8 M | Imagen 1x3x24x768, salida hasta 101 pasos | Japones | CC BY 4.0 | safetensors |
| parseq-ndl-24x768-100-tiny (original) | 9,8 M | Imagen 1x3x24x768, salida hasta 101 pasos | Japones | CC BY 4.0 | ONNX |
| NDLOCR (completo) | no disponible | Pipeline completo (layout + reconocimiento) | Japones | no disponible | no disponible |

La comparativa se limita al modelo original del que deriva, ya que no se dispone de datos de otros reconocedores de linea japoneses en la informacion proporcionada. Frente al original, la unica diferencia es el formato de pesos y el tipo numerico de almacenamiento; el comportamiento funcional es identico segun el autor.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japones; no soporta otros idiomas ni alfabetos latinos de forma fiable.
- Limite estricto de 100 caracteres por linea; lineas mas largas requieren segmentacion previa.
- No es un modelo generativo ni conversacional: no admite prompts, tool calling ni razonamiento; su unica tarea es transcribir una imagen de linea.
- Riesgo de error en caracteres japoneses poco frecuentes, kanji complejos o imagenes de baja calidad; no se aportan tasas de error (CER/WER) en la informacion disponible.
- Requiere un detector de layout y un segmentador de lineas previos para funcionar sobre paginas completas; por si solo solo procesa lineas ya recortadas.
- La licencia CC BY 4.0 exige atribucion a la Biblioteca Nacional de Japon y al autor del reempaquetado; es compatible con uso comercial siempre que se mantenga la atribucion.
- El reempaquetado no ha sido validado mas alla de 60 lineas de prueba segun el autor; para produccion conviene replicar esa verificacion con el propio corpus.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pjiwm/NDLOCR-Lite-PARSeq
- Repositorio original NDLOCR-Lite: https://github.com/ndl-lab/ndlocr-lite
- Documentacion del proyecto en DeepWiki: https://deepwiki.com/ndl-lab/ndlocr-lite
- Pagina del modelo PARSeq en DeepWiki: https://deepwiki.com/ndl-lab/ndlocr-lite/6.2-parseq-text-recognition-model
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
