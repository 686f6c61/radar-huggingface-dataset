# skillsafe-ai/resnet-50

## Resumen

skillsafe-ai/resnet-50 es un paquete de artefactos ONNX del clasico ResNet-50, orientado a ejecucion en navegador. Lo publica SkillSafe (organizacion skillsafe-ai) a partir de una importacion reproducible del modelo Xenova/resnet-50, fijado al commit `a16f29143f08c4e5c5a4a89f6f185d8edac4b6af`. No es un modelo entrenado desde cero ni un ajuste fino: es una distribucion empaquetada de pesos ya existentes, con verificacion criptografica por fichero y trazabilidad de la cadena de suministro.

El modelo resuelve clasificacion de imagenes sobre las 1000 clases de ImageNet-1k. La entrada es un tensor `pixel_values` float32 de forma `[batch_size, 3, 224, 224]` y la salida es `logits` float32 de forma `[batch_size, 1000]`, con opset 11 de ONNX. Se distribuye en dos variantes: una en fp32 (97,43 MB) y otra cuantizada a q8 (24,59 MB), lo que permite desplegarlo tanto en servidor como en navegador o dispositivos con poca memoria.

Su relevancia actual es de tipo practico y de infraestructura: la model card documenta la procedencia exacta, el hash SHA-256 de cada fichero, la receta de conversion y el toolchain empleado (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0), ademas de haber superado `onnx.checker` y una prueba de humo en CPU. Es, por tanto, un ejemplo de empaquetado reproducible de un modelo de vision para el ecosistema transformers.js, no una contribucion algorimica nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual (ResNet-50), exportada a ONNX (opset 11) |
| Parametros totales | No declarado. Estimacion a partir del peso fp32 (97,43 MB, 4 bytes por parametro): en torno a 24-25 millones. La implementacion canonica de ResNet-50 ronda los 25,6 millones, pero no se confirma en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Entrada de imagen fija `pixel_values [batch, 3, 224, 224]`; salida `logits [batch, 1000]` |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`) y q8 (`onnx/model_quantized.onnx`) |
| Idiomas soportados | No disponible / no aplica (clasificacion de imagenes, sin componente textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX; incluye `config.json` y `preprocessor_config.json`. Ejecutable con transformers.js y onnxruntime-web |
| Pipeline | image-classification |
| Modelo base | Xenova/resnet-50 (a su vez derivado de microsoft/resnet-50) |
| Tamano del repositorio | 0,1 GB |
| Entrada / salida | `pixel_values` float32 `[batch_size, num_channels, height, width]` → `logits` float32 `[batch_size, 1000]` |
| Entorno de validacion | onnxruntime 1.30.0 sobre CPU (Darwin 25.6.0 arm64) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional residual de 50 capas, la ResNet-50 descrita por He et al. y publicada originalmente por Microsoft. El artefacto distribuido aqui no incluye informacion sobre el proceso de entrenamiento: no se detallan el numero de tokens o imagenes, la composicion del dataset mas alla de la referencia a ImageNet-1k en el titulo de la model card, ni si hubo tecnicas de ajuste como RLHF o DPO (no aplicables en un clasificador de vision). El unico dato de entrenamiento inferible de la informacion proporcionada es el conjunto de evaluacion y la dimensionalidad de la cabeza de clasificacion: 1000 clases, coherente con ImageNet-1k.

Tampoco hay innovaciones algoritmicas propias: se trata de una importacion tal cual del upstream, sin conversion adicional segun la seccion de verificacion de la model card. Lo destacable es el proceso de empaquetado. Cada fichero esta anclado por SHA-256 a su origen, se registra la receta (`recipes/resnet-50.yaml`, sha256 `30c6af463f3b5e93cc825e5f3e14e02b716c640b4388755d3a1c40b6cdfe3bfc`), el toolchain completo y el hash del `uv.lock`, y los ficheros ONNX pasaron `onnx.checker` y una ejecucion de humo en CPU con entradas de ceros a las formas declaradas. Ademas, la model card distingue entre ficheros `registry` (servidos desde `models.skillsafe.ai` una vez verificados), `bundle` (incluidos en la aplicacion) y `registry-shared` (libreria de runtime reutilizada por modelos de la misma arquitectura).

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1k, devolviendo un vector de logits de 1000 dimensiones por imagen.
- Inferencia en navegador mediante onnxruntime-web con execution providers WebGPU y WASM, segun el ejemplo de uso incluido en la model card.
- Ejecucion en CPU con onnxruntime, con latencias declaradas de 12,1 ms (fp32) y 10,4 ms (q8) por inferencia sobre entradas de 1 x 3 x 224 x 224.
- Dos niveles de compromiso memoria/precision: fp32 (97,43 MB) y q8 (24,59 MB).
- Integracion con el ecosistema transformers.js mediante la etiqueta `transformers.js` y el pipeline `image-classification`.
- Verificabilidad de la cadena de suministro: hashes SHA-256 por fichero y `manifest.json` con receta, fuentes y numeros de verificacion.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, agentes, vision-lenguaje, audio ni capacidades multilingues. Es exclusivamente un clasificador de imagenes.
- No se documenta soporte de deteccion de objetos, segmentacion, OCR ni modelos de embeddings de imagen en la informacion proporcionada.

## Casos de uso

- Clasificacion de imagenes en el navegador: con onnxruntime-web y WebGPU el modelo puede etiquetar imagenes subidas por el usuario sin enviar los datos a un servidor, lo que reduce coste de infraestructura y simplifica el cumplimiento de privacidad.
- Moderacion de contenido en el cliente: el modelo q8 de 24,59 MB cabe en una aplicacion web o PWA y permite un primer filtrado de imagenes antes de recurrir a un servicio externo mas costoso.
- Etiquetado automatico de catalogos de comercio electronico: generar categorias preliminares para grandes volumenes de imagenes de producto aprovechando la inferencia en CPU (del orden de 10 ms por imagen en la prueba de humo declarada) y revisar despues solo los casos dudosos.
- Preprocesado en pipelines de vision por computador: actuar como clasificador de primera etapa que enruta imagenes hacia modelos mas especializados, reduciendo el numero de invocaciones a modelos grandes.
- Aplicaciones educativas y demos de inferencia en navegador: el par de artefactos fp32/q8 permite ilustrar cuantizacion, ONNX Runtime y WebGPU con un modelo conocido y de tamano manejable.
- Despliegue en dispositivos con recursos limitados: el fichero q8 permite ejecutar clasificacion en entornos sin GPU dedicada y con memoria restringida, siempre que el dominio de las imagenes se acerque a las clases de ImageNet.
- Verificacion de integridad en entornos regulados: los hashes SHA-256 por fichero y el manifiesto permiten auditar que los pesos servidos coinciden con el origen declarado, util en pipelines con requisitos de trazabilidad.
- Clasificacion por lotes en servidor: la dimension de batch es dinamica en el contrato de entrada, por lo que puede procesarse mas de una imagen por inferencia, aunque no se publican mediciones de throughput para lotes mayores que uno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (top-1, top-5, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son las de la prueba de humo de validacion del artefacto:

| Fichero | Entradas | Salidas | Latencia (ms) | Entorno |
|---|---|---|---|---|
| `onnx/model.onnx` (fp32) | `pixel_values[1, 3, 224, 224]` | `logits[1, 1000]` | 12,1 | onnxruntime, CPU, entradas de ceros |
| `onnx/model_quantized.onnx` (q8) | `pixel_values[1, 3, 224, 224]` | `logits[1, 1000]` | 10,4 | onnxruntime, CPU, entradas de ceros |

Advertencia: se trata de una ejecucion de humo con entradas de ceros, no de una evaluacion de exactitud ni de un benchmark de rendimiento representativo. No hay comparaciones con otros modelos publicadas en la informacion proporcionada.

## Requisitos de hardware

- Memoria para pesos: aproximadamente 97,43 MB en fp32 y 24,59 MB en q8, a lo que hay que sumar el coste de activaciones y del runtime (el repositorio completo ocupa 0,1 GB).
- Cabe en cualquier GPU de consumo: la variante q8 es viable incluso en entornos integrados y en navegador; no se requiere VRAM dedicada reseñable.
- GPU recomendadas: no se especifican en la informacion proporcionada. La model card solo documenta ejecucion en CPU; no hay mediciones con A100, H100, RTX 4090 ni otras GPU.
- CPU: latencias declaradas de 12,1 ms (fp32) y 10,4 ms (q8) por inferencia de una imagen en la prueba de humo.
- Navegador: onnxruntime-web con WebGPU como primer execution provider y WASM como respaldo, segun el ejemplo de la model card.
- Opciones de despliegue: onnxruntime (Python, CPU confirmado), onnxruntime-web y transformers.js. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Throughput: no disponible. Solo se publica la latencia de una unica inferencia en CPU.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar las tres piezas de la misma cadena de derivacion. No hay datos de modelos alternativos de clasificacion (ResNet-18, MobileNet, EfficientNet, ViT) en la documentacion disponible.

| Modelo | Formato | Licencia | Listo para navegador | Cuantizacion incluida | Verificacion |
|---|---|---|---|---|---|
| skillsafe-ai/resnet-50 | ONNX (fp32 y q8) | Apache-2.0 | Si (transformers.js, onnxruntime-web, WebGPU/WASM) | Si (q8) | SHA-256 por fichero, `manifest.json` con receta y toolchain |
| Xenova/resnet-50 (upstream) | ONNX | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| microsoft/resnet-50 (origen) | No disponible en la informacion proporcionada | Apache-2.0 | No | No disponible | No disponible |

No se dispone de datos de precision ni de rendimiento de ninguno de los tres, por lo que la comparativa se limita a formato de distribucion, licencia y garantias de verificacion.

## Limitaciones y advertencias

- Alcance funcional cerrado: solo clasifica entre 1000 clases de ImageNet-1k. No hace deteccion, segmentacion, OCR, captioning ni generacion de texto.
- Sin benchmarks de exactitud publicados: no hay datos de top-1 o top-5 en la informacion disponible, por lo que no puede validarse su calidad frente a la ResNet-50 original.
- Entradas fuera de dominio: al ser un clasificador de ImageNet, cualquier imagen que no encaje en esas 1000 categorias producira etiquetas de la lista, con riesgo de predicciones incorrectas presentadas con alta confianza.
- Formato de entrada rigido: se espera `pixel_values` con 3 canales y preprocesado acorde a `preprocessor_config.json`; un preprocesado distinto degradara los resultados.
- Sesgos: no se documenta ningun analisis de sesgos, etica o limitaciones por subpoblacion en la informacion proporcionada, mas alla de las limitaciones propias del conjunto de datos declarado.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y no se documentan evaluaciones externas.
- Dependencia de infraestructura de terceros: los ficheros clasificados como `registry` se sirven desde `models.skillsafe.ai` una vez verificados, lo que introduce una dependencia de un CDN externo si se usa esa ruta de carga.
- Ambiguedad en la conversacion: la model card menciona un "converter reproducible" y una receta, pero la seccion de verificacion indica que el modelo se importo tal cual desde el upstream, sin conversion. Conviene contrastar el `manifest.json` antes de asumir que los pesos difieren del origen.
- Licencia: los pesos estan bajo Apache-2.0 (atribucion a Microsoft, He et al.; exportacion ONNX por Xenova). La receta de conversion y la model card pertenecen al repositorio de SkillSafe y se rigen por su propia licencia, que debe verificarse por separado.
- Licencia Apache-2.0 permite uso comercial, pero exige conservar los avisos de copyright y licencia (la model card enlaza el aviso en el README de microsoft/resnet-50).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/resnet-50
- Modelo base en HuggingFace: https://huggingface.co/Xenova/resnet-50
- Commit exacto del upstream: https://huggingface.co/Xenova/resnet-50/tree/a16f29143f08c4e5c5a4a89f6f185d8edac4b6af
- Modelo original de Microsoft: https://huggingface.co/microsoft/resnet-50
- Aviso de licencia del upstream: https://huggingface.co/microsoft/resnet-50/blob/main/README.md
- Repositorio de recetas de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; las entradas obtenidas tratan sobre creadores de sitios web y no guardan relacion con el artefacto descrito.
