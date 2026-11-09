# OptimaMT/ja-en

## Resumen

OptimaMT/ja-en es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-ja-en, que a su vez deriva del modelo OPUS-MT desarrollado por el grupo Language Technology de la Universidad de Helsinki. Se trata de un modelo encoder-decoder basado en la arquitectura Marian, especializado en traducción japonés-inglés, publicado por el proyecto OptimaMT dentro de una colección de 49 pares de idiomas.

La aportación concreta de esta variante no es un reentrenamiento ni un ajuste fino, sino una optimización del decoder fusionado en formato ONNX cuantizado: se ha reconstruido únicamente el fichero `onnx/decoder_model_merged_quantized.onnx`, manteniendo el resto de pesos idénticos byte a byte al modelo original de Xenova. Según la documentación del autor, esta modificación reduce el consumo de memoria entre un 46 % y un 48 % en Linux y Windows con `disable_quant_qdq = 1`, y entre un 16 % y un 22 % con los valores por defecto de ONNX Runtime, produciendo tokens idénticos a la versión de referencia.

El modelo está pensado para inferencia en el navegador o en entornos ligeros mediante transformers.js y ONNX Runtime, con un tamaño de repositorio de 0,1 GB y un vocabulario de 60.716 tokens. Su relevancia actual radica en que permite desplegar traducción japonés-inglés en CPU con un consumo de memoria en torno a 214-276 MiB, lo que lo hace viable en dispositivos con recursos limitados sin sacrificar la fidelidad de la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,1 GB |
| Vocabulario | 60.716 tokens |
| Modelo base | Xenova/opus-mt-ja-en (revision 1a906cfaaf7c) |
| Modelo original | Helsinki-NLP/opus-mt-ja-en |
| Libreria | transformers.js |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder diseñado especificamente para traduccion automatica neuronal. La variante aqui publicada no introduce cambios arquitectonicos respecto al modelo original de Helsinki-NLP: conserva los mismos pesos, el mismo vocabulario de 60.716 tokens y la misma tokenizacion SentencePiece. La unica modificacion documentada es un cambio en el grafo ONNX: la proyeccion de salida del decoder se ha extraido de sus dos ramas, lo que da lugar a un decoder fusionado mas ligero en memoria.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; la model card no los detalla. La innovacion tecnica destacable de esta variante es la reduccion de memoria en tiempo de inferencia manteniendo la equivalencia funcional: el autor verifica que los tokens generados son identicos a los del modelo de referencia. Las mediciones se realizaron con ONNX Runtime 1.31.1, en CPU y con 4 hilos, tanto en Linux como en Windows (en una maquina virtual).

## Capacidades

- Traduccion automatica de japones a ingles, unica tarea para la que esta entrenado el modelo.
- Generacion de texto secuencia a secuencia mediante el pipeline `translation` de transformers.js.
- Inferencia en navegador y en Node.js gracias al formato ONNX y a la libreria transformers.js.
- Ejecucion en CPU con ONNX Runtime, sin necesidad de GPU.
- Ejecucion en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- Fidelidad de salida identica al modelo base Xenova/opus-mt-ja-en en los tests del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al par ja-en; no traduce a otros idiomas.

## Casos de uso

- Traduccion de documentacion tecnica japonesa: el modelo puede procesar parrafos de manuales, fichas de producto o documentacion de API escritos en japones y devolver texto en ingles, con un consumo de memoria inferior a 300 MiB que permite ejecutarlo en el mismo servidor que aloja la aplicacion.
- Traduccion en el navegador sin backend: al estar exportado a ONNX y ser compatible con transformers.js, puede integrarse en una extension o aplicacion web que traduzca contenido japones localmente, sin enviar texto a un servidor externo y preservando la privacidad del usuario.
- Preprocesado de corpus para pipelines de NLP: util para convertir grandes volumenes de texto japones a ingles antes de aplicar tecnicas de analisis, indexacion o clasificacion que solo dispongan de modelos en ingles, aprovechando la ejecucion en CPU y el bajo consumo de memoria.
- Traduccion de subtitulos y contenido audiovisual: el modelo puede traducir lineas de dialogo japonesas a ingles en lotes, integrándose en un flujo de postproduccion o en una herramienta de subtitulado que opere en local.
- Asistencia a la localizacion de videojuegos y software: traduccion de cadenas de interfaz y textos de juego del japones al ingles como primer paso de un flujo de localizacion, con la posibilidad de revisar la salida por un traductor humano.
- Traduccion en dispositivos con recursos limitados: al reducir el consumo a 214-276 MiB con `disable_quant_qdq = 1`, el modelo puede desplegarse en entornos de borde, contenedores pequenos o maquinas virtuales con poca RAM.
- Traduccion de correo y mensajeria empresarial: integracion en un servicio de mensajeria que traduzca mensajes japoneses a ingles en tiempo real, con latencia baja al ejecutarse en CPU con 4 hilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta mediciones de memoria tras la carga del modelo, no metricas de calidad de traduccion (BLEU, COMET u otras):

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 513 → 276 (-46 %) | 488 → 253 (-48 %) | si |
| Valores por defecto de ONNX Runtime | 274 → 214 (-22 %) | 194 → 164 (-16 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en maquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base, ya que el modelo esta disenado para ejecucion en CPU; el consumo de memoria RAM tras la carga es de 164-276 MiB segun plataforma y configuracion.
- GPU recomendadas: no se especifican; el modelo esta orientado a CPU y a entornos sin acelerador. Cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no se documentan requisitos ni rendimiento en GPU.
- Cabe en cualquier GPU de consumo y en practicamente cualquier equipo actual, dado su tamano de repositorio de 0,1 GB y su consumo de memoria inferior a 300 MiB.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime (Python mediante onnxruntime, sentencepiece y numpy) y el script `translate.py` del repositorio del proyecto.
- Latencia y throughput: no disponibles. Las unicas mediciones publicadas son de memoria, no de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ja-en | no disponible | no disponible | ja → en | CC BY 4.0 | ONNX (transformers.js) | Decoder fusionado optimizado; 214-276 MiB en CPU |
| Xenova/opus-mt-ja-en | no disponible | no disponible | ja → en | CC BY 4.0 | ONNX (transformers.js) | Modelo base directo; sin la optimizacion de memoria del decoder |
| Helsinki-NLP/opus-mt-ja-en | no disponible | no disponible | ja → en | CC BY 4.0 | safetensors (transformers) | Modelo original de OPUS-MT; requiere PyTorch/transformers |

Los tres modelos comparten pesos y tokenizacion; las diferencias estriban en el formato de exportacion y en la optimizacion del decoder. No se dispone de datos de benchmarks que permitan comparar la calidad de traduccion con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traduccion ja → en; no realiza otras tareas ni traduccion inversa.
- No se han publicado evaluaciones de calidad de traduccion (BLEU, COMET, evaluacion humana) en la informacion disponible; la equivalencia con el modelo base se limita a la identidad de tokens en las pruebas del autor.
- Riesgo de alucinacion y de traducciones inexactas inherente a los modelos de traduccion neuronal, especialmente con texto tecnico, nombres propios, terminologia especializada o lenguaje coloquial.
- Sesgos potenciales heredados de los datos de entrenamiento de OPUS-MT, no documentados en la model card.
- Longitud de contexto no especificada; no se garantiza un comportamiento correcto con entradas muy largas.
- El modelo no soporta tool calling, agentes ni razonamiento multi-paso; no debe emplearse en flujos que requieran estas capacidades.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribucion a los autores originales (Universidad de Helsinki, OPUS-MT) y a la exportacion ONNX (Xenova) y a la modificacion (OptimaMT).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria de su comportamiento en produccion.
- La optimizacion de memoria depende de la opcion `disable_quant_qdq = 1` de ONNX Runtime; con los valores por defecto la reduccion es menor (16-22 %).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ja-en
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-ja-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ja-en
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe tecnico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
