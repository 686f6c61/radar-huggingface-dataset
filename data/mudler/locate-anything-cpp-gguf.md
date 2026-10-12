# mudler/locate-anything.cpp-gguf

## Resumen

locate-anything.cpp-gguf es una redistribucion en formato GGUF del modelo nvidia/LocateAnything-3B, un sistema de deteccion de objetos de vocabulario abierto (open-vocabulary detection) y grounding visual. La conversion la mantiene el equipo de LocalAI (autor mudler) para que el modelo funcione con locate-anything.cpp, un motor de inferencia escrito en C++17 sobre ggml que no requiere Python en tiempo de ejecucion. El modelo original lo desarrolla NVIDIA y aqui se ofrece empaquetado en varios niveles de cuantizacion listos para desplegar en CPU o GPU.

El modelo tiene 3.830.665.968 parametros (unos 3,83 mil millones) y combina una torre de vision MoonViT con un modelo de lenguaje Qwen2 y un proyector que conecta ambos mundos. La tarea principal es localizar en una imagen todas las instancias que coincidan con una descripcion textual: se le pasa una imagen y un prompt con categorias separadas por el token `</c>`, y devuelve cajas delimitadoras con su etiqueta en JSON, ademas de una imagen anotada opcional.

Su relevancia actual esta en que ofrece detecciones identicas a la implementacion oficial en PyTorch (el motor esta validado por paridad) pero con una aceleracion notable: hasta 5,5 veces mas rapido en CPU con cuantizacion q4_k y entre 1,7 y 2,1 veces mas rapido en GPU segun el nivel de cuantizacion. Al ser un binario C++/ggml, encaja bien en entornos de produccion sin dependencias de Python, algo poco habitual en modelos de grounding visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de vision MoonViT + modelo de lenguaje Qwen2 + proyector (transformer multimodal) |
| Parametros totales | 3.830.665.968 (unos 3,83 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32, f16, q8_0, q6_k, q5_k, q4_k |
| Idiomas soportados | no disponible |
| Licencia | nvidia-license (etiquetada como "other"; el codigo del motor locate-anything.cpp es MIT) |
| Formato de pesos | GGUF |
| Tarea | object-detection / open-vocabulary-detection / visual-grounding |
| Modelo base | nvidia/LocateAnything-3B |
| Tamano del repositorio | 30,7 GB |

## Arquitectura y entrenamiento

El modelo es multimodal y sigue un esquema de dos torres: una torre de vision MoonViT que procesa la imagen, un proyector que alinea las representaciones visuales con el espacio del lenguaje y un modelo de lenguaje Qwen2 que genera las cajas delimitadoras y las etiquetas. En la conversion a GGUF solo se cuantizan las matmuls del modelo de lenguaje (`attn_{q,k,v,o}`, `ffn_{gate,up,down}`, `lm.output`). La torre de vision MoonViT, el proyector, todas las normas y sesgos, y los dos tensores que se leen en el host (`lm.tok_embd`, `vit.pos_emb`) permanecen en f32, de modo que la ruta de vision, sensible a la paridad, no se altera.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO: estos datos no aparecen en la informacion proporcionada. La innovacion tecnica destacable no esta en el entrenamiento sino en la implementacion: el motor locate-anything.cpp esta validado por paridad contra la implementacion oficial de PyTorch (produce las mismas cajas) y la politica de cuantizacion selectiva permite que q8_0 y q6_k sean identicos en cajas al modelo f32. El motor admite tres modos de decodificacion (`hybrid` por defecto, `slow` y `fast`) y soporte opcional de GPU mediante `-DLA_GGML_CUDA=ON` y la variable `LA_DEVICE=`.

## Capacidades

- Deteccion de objetos de vocabulario abierto: localiza objetos a partir de descripciones textuales, sin un catalogo cerrado de clases predefinido.
- Grounding visual: asocia frases o categorias del prompt con regiones concretas de la imagen.
- Salida estructurada: genera JSON con detecciones (etiqueta y caja) y puede producir una imagen PNG anotada.
- Multiples categorias por prompt: permite separar varias categorias en una sola consulta usando el token `</c>`.
- Ejecucion sin Python: inferencia nativa en C++/ggml, adecuada para despliegues embebidos o de produccion.
- Soporte de CPU y GPU: el mismo binario funciona en CPU y, compilado con CUDA, en GPU NVIDIA.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible; la unica capacidad confirmada es la deteccion/grounding visual.

## Casos de uso

- Moderacion de contenido visual: el modelo puede localizar categorias concretas indicadas por prompt (por ejemplo, armas o determinados objetos) sobre imagenes subidas por usuarios, devolviendo JSON con cajas y etiquetas que un backend puede filtrar automaticamente.
- Analitica de retail y estanterias: con un prompt de categorias (`</c>`) se pueden detectar productos o personas en fotos de tienda; al ser de vocabulario abierto no hace falta reentrenar por cada nueva categoria.
- Anotacion automatica de datasets: pre-etiquetar imagenes con cajas delimitadoras antes de la revision humana, acelerando la creacion de datasets de deteccion; la salida JSON y la imagen anotada facilitan la inspeccion.
- Vision para robotica o drones: al ejecutarse como binario C++ sobre ggml y en CPU, puede integrarse en sistemas embebidos o con recursos limitados donde no se quiere una pila de Python.
- Busqueda visual sobre descripciones: localizar objetos descritos en lenguaje natural dentro de un catalogo de imagenes, habilitando busquedas del tipo "encuentra todas las bicicletas" en una biblioteca de fotos.
- Despliegue en LocalAI: al venir del equipo de LocalAI, encaja como componente de deteccion dentro de un servidor de inferencia local que gestione varios modelos.
- Control de calidad industrial: deteccion de piezas o defectos descritos textualmente sobre imagenes de linea de produccion, con la ventaja de no depender de un conjunto fijo de clases.
- Procesado por lotes en servidor sin GPU: con las variantes q8_0 o q6_k (identicas en cajas al f32) se puede procesar grandes volumenes de imagenes en CPU con una aceleracion de entre 3,9 y 4,1 veces respecto al modelo oficial f32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible (no son aplicables a una tarea de deteccion). Si se aportan datos de rendimiento comparativo frente a la implementacion oficial de PyTorch.

Cuantizacion en CPU (Ryzen 9 9950X3D), inferencia en modo "slow" sobre el fixture de 448; la columna "vs oficial" divide el tiempo del PyTorch oficial en f32 (23,65 s) por cada resultado:

| dtype | Tamano | Inferencia | vs oficial f32 | Cajas |
|---|---|---|---|---|
| f16 | 9,15 GB | 13,68 s | 1,7x | identicas |
| q8_0 | 6,26 GB | 6,07 s | 3,9x | identicas |
| q6_k | 5,51 GB | 5,77 s | 4,1x | identicas |
| q5_k | 5,10 GB | 5,11 s | 4,6x | sub-pixel |
| q4_k | 4,72 GB | 4,29 s | 5,5x | sub-pixel |

Nota: solo se cuantizan las matmuls del modelo de lenguaje Qwen2, por lo que la paridad de cajas se conserva hasta q6_k.

GPU (NVIDIA GB10), frente al modelo oficial en bf16, con decodificacion greedy en una sola GPU:

| Comparacion | Resultado |
|---|---|
| f16 propio vs bf16 oficial (precision equivalente) | aprox. 1,7x mas rapido |
| q8_0 recomendado (identico en cajas) | aprox. 1,9x - 2,1x mas rapido |

La metodologia completa, la configuracion warm/median y las comprobaciones de paridad estan en `benchmarks/BENCHMARK.md` del repositorio.

## Requisitos de hardware

- VRAM / memoria estimada por cuantizacion (tamano de fichero): f32 unos 15 GB, f16 9,15 GB, q8_0 6,26 GB, q6_k 5,51 GB, q5_k 5,10 GB, q4_k 4,72 GB.
- CPU: funciona sin GPU; los benchmarks se hicieron en un Ryzen 9 9950X3D con tiempos de 4,3 a 13,7 s por imagen segun cuantizacion.
- GPU: se ha validado en una NVIDIA GB10 con CUDA. Se requiere compilar el motor con `-DLA_GGML_CUDA=ON`.
- GPU de consumo: con tamanos de 4,7 a 9,2 GB, las variantes cuantizadas caben en GPU de consumo con 8 GB o mas de VRAM (por ejemplo, una RTX 3070/4060 de 8 GB para q4_k/q5_k/q6_k, y 12-16 GB para f16 con margen). Las cifras concretas de VRAM por GPU no estan confirmadas en la informacion disponible.
- Opciones de despliegue: locate-anything.cpp (CLI `locate-anything-cli`) con soporte ggml/GGUF y CUDA opcional; integracion con el ecosistema LocalAI.
- Latencia y throughput: los tiempos por inferencia en CPU y el factor de aceleracion en GPU GB10 estan detallados en la seccion de benchmarks; no se aporta throughput en imagenes por segundo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos concretos (parametros, contexto, rendimiento o licencia) de modelos comparables de deteccion de vocabulario abierto como OWL-ViT, Grounding DINO o Florence-2, por lo que la comparativa cuantitativa figura como no disponible. Como referencia cualitativa sin cifras verificadas en esta ficha, cabe senalar que este modelo se distribuye como binario C++/ggml con cuantizaciones GGUF, una caracteristica de despliegue poco frecuente en esa categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| locate-anything.cpp-gguf (este) | 3,83 mil millones | no disponible | ver benchmarks de cuantizacion | nvidia-license | GGUF |
| Alternativas (OWL-ViT, Grounding DINO, Florence-2) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia de los pesos es la de NVIDIA (nvidia-license), no una licencia permisiva; es imprescindible revisar los terminos en el repositorio del modelo base antes de cualquier uso comercial. El codigo del motor locate-anything.cpp es MIT, pero eso no cubre los pesos.
- El repositorio solo empaqueta los pesos en GGUF y los redistribuye; no se documentan sesgos del modelo original en la informacion disponible.
- Riesgo de alucinacion: al ser un modelo de deteccion de vocabulario abierto guiado por prompt, puede producir cajas para categorias que no estan realmente presentes en la imagen; no se aportan metricas de precision/recall para cuantificarlo.
- Idiomas soportados: no disponible. No se confirma si los prompts funcionan igual de bien en castellano que en ingles.
- Longitud de contexto: no disponible; no se documenta el limite de tokens del prompt ni el numero maximo de categorias por consulta.
- Las cuantizaciones q5_k y q4_k introducen una deriva sub-pixel en las cajas respecto al f32; si se necesita paridad exacta, hay que usar q8_0 o q6_k.
- El modo de inferencia afecta al rendimiento: los numeros de CPU corresponden al modo "slow"; los modos `hybrid` y `fast` no se detallan con cifras.
- En produccion conviene tener en cuenta que los benchmarks son de un unico equipo (Ryzen 9 9950X3D en CPU y NVIDIA GB10 en GPU); el rendimiento en otro hardware puede variar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mudler/locate-anything.cpp-gguf
- Modelo base: https://huggingface.co/nvidia/LocateAnything-3B
- Repositorio del motor: https://github.com/mudler/locate-anything.cpp
- Benchmarks del repositorio: https://github.com/mudler/locate-anything.cpp/blob/master/benchmarks/BENCHMARK.md
- Script de conversion a GGUF: `scripts/convert_locateanything_to_gguf.py` en el repositorio anterior
- LocalAI (equipo autor): https://github.com/mudler/LocalAI
- README del repositorio: https://huggingface.co/mudler/locate-anything.cpp-gguf/blob/main/README.md
