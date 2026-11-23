# saa938/presonance-generalist-vision-v1

## Resumen

Presonance generalist vision v1 es un codificador de imagenes (image encoder) publicado por el usuario saa938 bajo el identificador `saa938/presonance-generalist-vision-v1`. No entrena pesos nuevos: combina dos backbones publicos ya existentes, EVA (BAAI) y DINOv3 (Meta), en una unica representacion fija de 4.352 dimensiones. La mezcla es estatica y no se ajusta por tarea: las features de preproyeccion de EVA aportan el 75% del peso cuadratico del vector, mientras que el token CLS y la media de parches de DINOv3 aportan un 12,5% cada uno.

El modelo esta pensado para extraccion de caracteristicas y clustering de imagenes, no para clasificacion supervisada ni generacion. Su interes practico reside en que, sin reentrenar nada, mejora marginalmente sobre controles standalone de DINOv3 en tareas de clustering como ImageNetDog15 y TinyImageNet, y sobre la mezcla fija anterior del autor en NIGHTS y RP2k. La seleccion de la mezcla global se hizo con holdouts de vecino mas cercano extraidos unicamente de las particiones TRAIN de nueve datasets supervisados, lo que constituye una exposicion de desarrollo explicita.

La relevancia es limitada pero honesta: es un artefacto de investigacion reproducible, con auditoria de resultados bit a bit, licencia no comercial y requisitos de hardware considerables (unos 20,8 GB de checkpoints y 18,29 GB de pico de VRAM en CUDA). No es un modelo de proposito general ni compite con encoders de produccion; es una composicion evaluada con rigor metodologico sobre tareas de retrieval y clustering.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Composicion fija de dos backbones transformer de vision: EVA (features de preproyeccion, 75% del peso) + DINOv3 (CLS y media de parches, 12,5% cada uno) |
| Parametros totales | 5.191.066.368 parametros preentrenados unicos (los dos resumenes de DINOv3 comparten checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible; la inferencia cualificada usa FP32 en parametros con autocast BF16 y TF32 |
| Idiomas soportados | No disponible (modelo de imagenes, sin capacidades linguisticas) |
| Licencia | `presonance-research-code-and-upstream-backbone-terms` (investigacion no comercial); EVA bajo MIT y DINOv3 bajo terminos custom de Meta |
| Formato de pesos | safetensors para los checkpoints upstream descargados; el repositorio contiene codigo, configuracion y JSONs de resultados, no copias de los checkpoints |
| Dimension del embedding | 4.352 dimensiones |
| Libreria | custom (timm 1.0.22, PyTorch 2.6.0, torchvision 0.21.0, numpy 2.2.6, Pillow 11.3.0, safetensors 0.8.0) |
| Pipeline | image-feature-extraction |

## Arquitectura y entrenamiento

El modelo no entrena pesos: es una composicion determinista de dos encoders de vision preentrenados. EVA aporta sus features de preproyeccion, que dominan el vector con un 75% del peso cuadratico; DINOv3 aporta dos resumenes (token CLS y media de parches) con un 12,5% cada uno. La combinacion es fija entre tareas y no hay adaptacion por dominio. El autor declara explicitamente que no se actualizo ningun peso de backbone y que no se usan datos cerebrales ni pesos afinados en emociones.

La seleccion de la mezcla global se realizo con holdouts de vecino mas cercano extraidos solo de particiones TRAIN de FER2013, Caltech101, OxfordPets, OxfordFlowersClassification, DTD, CIFAR10, STL10, EuroSAT y GTSRB, lo que supone exposicion supervisada de desarrollo en nueve datasets. El solapamiento con el preentrenamiento de los modelos fundacionales no se ha auditado por completo. Se realizo un estudio suplementario con 75 ajustes predeclarados en cinco semillas, incluidos 15 replays bit a bit de las asignaciones originales de la semilla 42; la mezcla supero a la anterior en las cinco semillas para Dog15 y TinyImageNet, y a DINOv3 CLS standalone en cuatro de cinco semillas para Dog15 y en las cinco para TinyImageNet. El resultado oficial sigue siendo la semilla 42 nativa; no se selecciona la mejor semilla.

La inferencia cualificada usa CUDA con parametros FP32, autocast BF16 y TF32, tamano de batch 64 (microbatches de 32 para EVA y 64 para DINOv3), moviendo un backbone a GPU cada vez. La conversion de DINOv3 en timm usa periodos RoPE en float32, distintos de la implementacion original de Meta, y el autor no reclama paridad numerica con esta.

## Capacidades

- Extraccion de embeddings de imagen de 4.352 dimensiones para tareas de retrieval y clustering.
- Clustering de imagenes por similitud de coseno sobre vectores de longitud unitaria (la similitud de registro es producto escalar).
- Retrieval imagen-imagen (I2I) evaluado en NIGHTS y RP2k.
- Feature extraction para pipelines de vision por computador sin fine-tuning.
- Reproducibilidad bit a bit: el encoder de release reprodujo cada feature en las 24.076 imagenes nativas de benchmark y en 64 imagenes de referencia TRAIN antiguas.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No soporta vision generativa ni comprension visual en lenguaje natural; es exclusivamente un encoder.

## Casos de uso

- Clustering no supervisado de catalogos de imagenes: agrupar productos, fotos o imagenes medicas por similitud usando los vectores de 4.352 dimensiones y similitud de coseno, aprovechando los resultados de NMI en CIFAR100 (0,903893) y TinyImageNet (0,856737).
- Busqueda visual inversa (reverse image search): indexar un corpus de imagenes con los embeddings y recuperar las mas similares mediante producto escalar, con base en el hit rate@1 de 0,75452 en RP2k.
- Deduplicacion de datasets de vision: detectar imagenes casi duplicadas o variantes de un mismo objeto comparando distancias en el espacio de embeddings antes de entrenar otros modelos.
- Organizacion automatica de fototecas: agrupar imagenes por contenido visual (objetos, escenas) sin etiquetas, usando el clustering por similitud como paso previo a un etiquetado manual.
- Preprocesado para pipelines de retrieval multimodal: generar embeddings de imagen que se combinen con embeddings de texto en un sistema de busqueda, siempre que se respete la licencia no comercial.
- Analisis exploratorio de dominios visuales: agrupar imagenes de satelite (EuroSAT) o senales de trafico (GTSRB) para estudiar la estructura del dataset antes de un entrenamiento supervisado.
- Reproduccion de experimentos de investigacion: el repositorio incluye codigo, configuracion y JSONs de resultados para replicar las evaluaciones y auditorias descritas en la model card.

## Benchmarks y rendimiento

Resultados nativos de MTEB 2.27.14 reportados en la model card:

| Tarea nativa MTEB 2.27.14 | Metrica | Puntuacion | Mejor publicado capturado |
|---|---|---:|---|
| ImageNetDog15Clustering | NMI | 0,941262 | 0,926296 |
| TinyImageNetClustering | NMI | 0,856737 | 0,835825 |
| ImageNet10Clustering | NMI | 0,938975 | 0,990890 (perdida retenida) |
| CIFAR100Clustering | NMI | 0,903893 | 0,895129 |
| NIGHTSI2IRetrieval | NDCG@10 | 0,27075 | 0,26591 |
| RP2kI2IRetrieval | Hit rate at1 | 0,75452 | 0,73744 |

Notas del autor: la NMI mide la concordancia entre clusters de imagen y categorias de referencia, no es exactitud de clasificacion ni inteligencia emocional. La mejora ajustada en Dog15 sobre DINOv3 CLS standalone es incierta; las ganancias en TinyImageNet sobre los controles standalone tienen intervalos condicionales positivos. La mejora en RP2k sobre la mezcla fija anterior es de +0,754 puntos porcentuales, con intervalo simultaneo condicional de [+0,503, +1,009] puntos. La mezcla anterior casi empata en NIGHTS y puntua mas alto en la semilla oficial de CIFAR100 (0,912198). El replay completo tardo 552,47 segundos en una H100 sin entrenamiento ni seleccion de modelo.

## Requisitos de hardware

- VRAM estimada: pico de asignacion CUDA de 18,29 GB en la cualificacion con 64 imagenes (parametros FP32, autocast BF16, TF32).
- Checkpoints: aproximadamente 20,8 GB en total entre los dos backbones upstream descargados.
- GPU recomendadas: H100 (usada en la cualificacion); se requiere memoria suficiente para mover un backbone a GPU cada vez, con margen para batch 64.
- GPU de consumo: no cabe en GPUs de consumo tipicas de 8-16 GB; se necesita una GPU con al menos ~20 GB de VRAM o ejecucion parcial en CPU con RAM considerable.
- RAM de CPU: se exige "sustancial" segun el autor; no se da una cifra exacta.
- Opciones de despliegue: el repositorio incluye un encoder propio (`PresonanceGeneralistEncoder` en `encoder.py`) con configuracion JSON; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: replay completo de 24.076 imagenes en 552,47 segundos en H100 (aproximadamente 43,6 imagenes por segundo en ese replay).

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Presonance generalist vision v1 | 5.191.066.368 | 4.352 | Composicion fija EVA + DINOv3 | Investigacion no comercial | Hugging Face (codigo y config; checkpoints upstream) |
| DINOv3 CLS standalone | No disponible en la informacion | No disponible | Encoder de vision | Terminos custom de Meta | Peso publico |
| Mezcla fija anterior de Presonance | No disponible en la informacion | No disponible | Composicion fija | Investigacion no comercial | No disponible |
| EVA (BAAI) | No disponible en la informacion | No disponible | Encoder de vision | MIT | Peso publico |

La model card solo ofrece comparaciones contra DINOv3 CLS standalone y contra la mezcla fija anterior del mismo autor; no se proporcionan datos de otros encoders comparables como CLIP, SigLIP o OpenCLIP.

## Limitaciones y advertencias

- Exposicion supervisada de desarrollo: la mezcla se selecciono con holdouts de TRAIN de nueve datasets (FER2013, Caltech101, OxfordPets, OxfordFlowers, DTD, CIFAR10, STL10, EuroSAT, GTSRB), por lo que los resultados en esos dominios no son estimaciones limpias de generalizacion.
- Solapamiento de preentrenamiento no auditado por completo con los modelos fundacionales EVA y DINOv3.
- La mejora sobre DINOv3 CLS standalone en ImageNetDog15 es incierta; los intervalos bootstrap condicionales no cubren la busqueda de arquitectura ni todo el solapamiento de preentrenamiento.
- Perdida en ImageNet10Clustering frente al mejor publicado capturado (0,938975 frente a 0,990890).
- No es un modelo de clasificacion: la NMI no equivale a exactitud; no debe interpretarse como inteligencia emocional ni como precision cerebral.
- La licencia es de investigacion no comercial; los terminos MIT de EVA y los terminos custom de DINOv3 siguen aplicando, con NOTICE y DINOv3_LICENSE.md en el repositorio.
- No se reclama paridad numerica con la implementacion original de DINOv3 de Meta por el uso de periodos RoPE en float32 en timm.
- Requisitos de hardware elevados (18,29 GB de pico de VRAM, 20,8 GB de checkpoints) que limitan el despliegue en entornos de consumo.
- Los rankings publicos de benchmark son hitos separados; las ventajas locales no implican que la fila del modelo este ya visible en las tablas publicas.
- En RP2k quedan 2.283 flags de casi-coincidencia gruesa sin confirmar, pese a cero coincidencias exactas propias o de TRAIN de desarrollo.

## Enlaces

- Hugging Face: https://huggingface.co/saa938/presonance-generalist-vision-v1
- Repositorio de EVA (BAAI): no disponible en la informacion proporcionada
- Repositorio de DINOv3 (Meta): no disponible en la informacion proporcionada
- timm: no disponible en la informacion proporcionada
- Paper o blog de Presonance: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
