# Avishek2410/bondsight

## Resumen

BondSight es un detector de objetos especializado en la inspeccion automatica optica (AOI) de defectos en el wire bonding de chips semiconductores. Lo desarrolla Avishek Mondal (usuario Avishek2410) y se distribuye como un modelo ONNX de 10,2 millones de parametros, obtenido mediante fine-tuning de D-FINE Small sobre pesos COCO preentrenados de ustc-community/dfine-small-coco. Detecta ocho tipos concretos de defecto: `wire_sweep`, `sagging_loop`, `lifted_ball`, `lifted_stitch`, `off_center_ball`, `missing_wire`, `broken_wire` y `wire_short`.

El modelo resuelve un problema acotado pero de alto valor industrial: la inspeccion visual de uniones por hilo en encapsulado de semiconductores, tradicionalmente dependiente de sistemas propietarios caros. BondSight apuesta por un enfoque de bajo coste y desplegable en hardware modesto: el propio autor reporta inferencia en CPU con ONNX Runtime de 3,1 s por imagen de 2048 pixeles en una Raspberry Pi 5 y 2,3 s en CPU de portatil. La entrada es de 640 x 640 RGB y produce 300 cajas candidatas con puntuacion por clase.

Es relevante ahora porque demuestra que un modelo pequeno de deteccion, afinado con datos sinteticos y fotos publicas, puede ejecutarse en el borde de la linea de produccion sin GPU. No obstante, el autor lo describe explicitamente como prototipo de investigacion y no como sistema de inspeccion validado, con tasas de falsos positivos significativas en algunos conjuntos de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE Small (detector transformer con distribucion de refinamiento; base ustc-community/dfine-small-coco) |
| Parametros totales | 10,2 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 640 x 640 RGB) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`wirebond_dfine_small_m3k.onnx`, ~0,1 GB de repo) |

## Arquitectura y entrenamiento

BondSight parte de D-FINE Small, un detector de la familia DETR con mecanismo de refinamiento de distribuciones (FDR) y self-distillation, del que hereda los pesos COCO. Sobre esa base se realizo un fine-tuning de 12 epocas en una GPU Kaggle T4 con AdamW, learning rate 2e-4 y scheduler one-cycle, conservando la epoca con menor perdida de validacion (epoca 6). Cada epoca vio 6.367 imagenes compuestas por dibujos generados por el propio generador de imagenes sinteticas de BondSight y recortes (tiles) de seis conjuntos de fotos publicos, incluyendo tableros correctos para ensenar al modelo a no marcar falsos positivos.

El pipeline de inferencia incluye un preprocesado especifico para fotos grandes: se reducen a la mitad y se dividen en tiles solapados de 640 x 640, con umbrales de confianza por tipo de defecto almacenados en un JSON adjunto. El repositorio incluye ademas un extractor de caracteristicas opcional (`anomaly_backbone.onnx`, ResNet18 con pesos ImageNet sin modificar) para un comprobador de zonas anomalas. No se documenta uso de RLHF ni DPO, al no tratarse de un modelo generativo.

## Capacidades

- Deteccion de objetos con cajas delimitadoras y puntuacion de confianza para ocho clases de defecto de wire bonding.
- Salida de 300 cajas candidatas por imagen de 640 x 640, con umbral configurable por tipo de defecto.
- Procesamiento automatico de fotos grandes mediante redimensionado y tiling solapado.
- Inferencia en CPU pura con ONNX Runtime, sin necesidad de GPU.
- Deteccion de defectos de hilo: barrido, lazo caido, bola levantada, stitch levantado, bola descentrada, hilo ausente, hilo roto y cortocircuito de hilo.
- Capacidad auxiliar opcional de deteccion de zonas anomalas mediante el backbone ResNet18 incluido.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general ni capacidades multilingues; es un detector de vision de dominio especifico.

## Casos de uso

- Inspeccion en linea de bajo coste: desplegar el modelo en una Raspberry Pi 5 junto a la camara de la estacion de inspeccion para marcar defectos en tiempo casi real (3,1 s por foto de 2048 px), sin depender de GPU ni de licencias propietarias.
- Precribado en laboratorio de prototipos: usar el detector para revisar lotes de fotos de chips recien encapsulados y priorizar las muestras que requieren inspeccion manual, reduciendo el tiempo de revision.
- Control de calidad en produccion de pequenas series: integrar el modelo en un script de Python que procese las fotos de cada turno y genere un informe de defectos por tipo, con la confianza asociada.
- Investigacion academica en AOI: emplear el modelo y su pipeline como linea base reproducible (pesos ONNX y codigo abierto) para comparar tecnicas de deteccion de defectos en wire bonding.
- Deteccion de anomalias complementaria: combinar el detector supervisado con el backbone ResNet18 incluido para localizar zonas visualmente atipicas que no encajan en las ocho clases conocidas.
- Formacion y demostraciones: usar la galeria de los ocho tipos de defecto y la interfaz web del inspector para ilustrar casos reales en cursos de vision industrial o de calidad en semiconductores.
- Auditoria de falsos positivos: analizar las tasas reportadas (18 % en chips correctos lyra, 49 % en modulos Fuji Pass) para calibrar umbrales por tipo antes de cualquier uso piloto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre fotos de prueba no vistas durante el entrenamiento:

| Conjunto de prueba | Metrica | Resultado |
|---|---|---|
| NTUST wire-bonding (defectos reales) | Defectos encontrados | 63 % |
| WHU close-ups | Hilos ausentes encontrados | 82 % |
| Fuji power-module | Hilos doblados encontrados | 100 % |
| hawk-team | Tableros buenos marcados erroneamente | 0 % |
| lyra | Chips buenos marcados erroneamente | 18 % |
| Fuji Pass | Modulos buenos marcados erroneamente | 49 % |

Rendimiento de inferencia (solo CPU, ONNX Runtime): 3,1 s por foto de 2048 px en Raspberry Pi 5; 2,3 s en CPU de portatil. El autor advierte que parte de las fotos de prueba provienen de las mismas fuentes que los datos de entrenamiento, por lo que en un producto nuevo cabe esperar cifras inferiores hasta reentrenar con fotos de ese producto.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para inferencia en CPU y su tamano (~10 M parametros, repo de 0,1 GB) es minimo.
- GPU recomendadas: no se documentan; cualquier GPU moderna podria acelerar la inferencia via ONNX Runtime con proveedor CUDA, pero no es requisito.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con soporte ONNX Runtime; tambien funciona sin GPU.
- Despliegue: ONNX Runtime en CPU; validado en Raspberry Pi 5 y CPU de portatil. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia y throughput: 3,1 s por imagen de 2048 px en Raspberry Pi 5 y 2,3 s en portatil, en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BondSight (este modelo) | 10,2 M | Deteccion de defectos de wire bonding (8 clases) | 640 x 640 RGB | CC BY 4.0 | ONNX en Hugging Face |
| D-FINE Small COCO (base) | ~10 M | Deteccion de objetos genericos COCO | 640 x 640 | Apache-2.0 | Hugging Face / repositorio oficial |
| ResNet18 (backbone incluido) | ~11,7 M | Extraccion de caracteristicas / clasificacion | variable | BSD-3-Clause | torchvision |

No se dispone de informacion sobre otros detectores especificos de defectos en wire bonding comparables en la documentacion proporcionada; para esa comparacion, el autor remite a `docs/results.md` del repositorio de GitHub.

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica explicitamente que no es un sistema de inspeccion validado.
- Falsos positivos elevados en algunos conjuntos: 18 % en chips buenos lyra y 49 % en modulos Fuji Pass, lo que limita su uso directo en produccion sin calibracion.
- Riesgo de sobreajuste a las fuentes de datos: parte de las fotos de prueba comparten origen con el entrenamiento, por lo que el rendimiento en un producto nuevo sera previsiblemente inferior hasta reentrenar.
- Cobertura limitada a ocho clases de defecto; no detecta defectos fuera de ese catalogo.
- Dependencia de umbrales por clase almacenados en el JSON adjunto; un umbral mal ajustado degrada precision y recall.
- Sin capacidades de lenguaje, razonamiento ni agentes; no es un modelo multimodal general.
- Licencia CC BY 4.0: permite uso comercial y adaptacion con atribucion a BondSight (Avishek Mondal) y conservando `CREDITS.md` junto a los archivos del modelo.
- Las fotos de entrenamiento provienen de terceros (NTUST, WHUrobotics, hawk-team, lyra-wikbf, pg-87jvm) bajo CC BY 4.0; conviene revisar `CREDITS.md` antes de redistribuir.
- No se documentan sesgos especificos mas alla de la dependencia del dominio de imagenes de entrenamiento (tipo de encapsulado, iluminacion, camara).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avishek2410/bondsight
- Repositorio GitHub: https://github.com/Avishek2410/bondsight
- Resultados completos: https://github.com/Avishek2410/bondsight/blob/main/docs/results.md
- Documentacion tecnica: https://github.com/Avishek2410/bondsight/blob/main/docs/technical.md
- Galeria de tipos de defecto: https://raw.githubusercontent.com/Avishek2410/bondsight/main/docs/images/fig-gallery-light.webp
- Modelo base D-FINE Small COCO: https://huggingface.co/ustc-community/dfine-small-coco
- Paper D-FINE (Peng et al., 2024): no disponible en la informacion proporcionada
