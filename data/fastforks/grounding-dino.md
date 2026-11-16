# fastforks/grounding-dino

## Resumen
Grounding DINO es un modelo de deteccion de objetos de vocabulario abierto (open-vocabulary) desarrollado por IDEA Research, presentado en el paper "Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection" (Liu et al., 2023). El modelo fusiona un backbone de imagen Swin Transformer con un codificador de texto BERT en un transformer deformable de estilo DINO, lo que permite detectar objetos descritos mediante lenguaje natural en lugar de estar limitado a un conjunto fijo de clases. Cada una de las 900 queries del decodificador puntua todos los tokens del caption de entrada, de modo que la puntuacion de una clase se calcula como la media de las puntuaciones de los tokens que componen su nombre.

La variante MM-Grounding-DINO (Zhao et al., 2024, OpenMMLab) mantiene la misma red pero incorpora una cabeza de clases contrastiva escalada y con sesgo, ademas de cabezas de decodificador no compartidas, y se reentrena sobre Objects365, GoldG y V3Det. Existen versiones base (backbone Swin-B) y tiny (backbone Swin-T) para ambos modelos.

Este repositorio concreto (`fastforks/grounding-dino`) es unicamente una model card: no aloja pesos. La libreria `fastforks` descarga los pesos de los repositorios originales de los autores y los verifica contra hashes SHA-256. Es un modelo de deteccion, no un modelo de lenguaje, por lo que las filas de contexto, cuantizacion o parametros activos no aplican en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector open-set: backbone de imagen Swin Transformer + codificador de texto BERT + transformer deformable estilo DINO con 900 queries |
| Parametros totales | no disponible (no se indica el recuento en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision-deteccion; entrada de imagen redimensionada a 800 px en el lado corto, maximo 1333 en el lado largo) |
| Tipos de cuantizacion | no disponible (se menciona ejecucion en fp16 y fp32 en las pruebas de memoria; no se listan formatos cuantizados) |
| Idiomas soportados | no disponible (el codificador de texto es BERT uncased, orientado a ingles) |
| Licencia | Apache-2.0 (codigo y pesos de las cuatro variantes; uso comercial permitido) |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `vocab.txt` de BERT |

## Arquitectura y entrenamiento
Grounding DINO combina tres componentes: un backbone de imagen Swin Transformer (Swin-T en las variantes tiny, Swin-B en las base), un codificador de texto BERT uncased y un transformer deformable de estilo DINO. La innovacion central es la fusion temprana texto-imagen: las features de texto se inyectan en las capas del decodificador, y cada una de las 900 queries puntua todos los tokens del caption. En tiempo de inferencia se pasa `text=[...]` con las clases deseadas (por defecto las 80 clases de COCO), que se unen en un unico caption; la puntuacion de cada clase es la media de las puntuaciones de sus tokens.

Los datos de entrenamiento incluyen Objects365 (anotaciones de caja del split de train), GoldG (Flickr30k Entities + GQA / imagenes de Visual Genome) y Cap4M (pares imagen-caption web con pseudo-cajas). Las variantes MM-Grounding-DINO se reentrenan sobre Objects365, GoldG y V3Det, e incorporan una cabeza de clases contrastiva escalada y con sesgo y cabezas de decodificador no compartidas. La informacion proporcionada no detalla el numero exacto de tokens ni si se aplico RLHF/DPO (no aplica a un detector).

## Capacidades
- Deteccion de objetos de vocabulario abierto: detecta clases descritas en lenguaje natural en el momento de la llamada mediante `text=[...]`, sin reentrenamiento.
- Salidas estructuradas: cajas (`boxes`), puntuaciones (`scores`), etiquetas de clase (`labels`) y, segun la card, mascaras de instancia (`instance masks`).
- Segmentacion de instancias: el tag `instance-segmentation` y la salida de mascaras indican soporte de segmentacion a nivel de instancia.
- Deteccion con prompt de texto por clase: la puntuacion de una clase se agrega como media de los tokens de su nombre.
- Entrada de imagen flexible: cualquier resolucion H x W >= 32, con padding a multiplo de 32; redimensionado a 800 px en el lado corto (maximo 1333 en el lado largo).
- Multiples variantes: base y tiny, en versiones originales y MM-Grounding-DINO.
- Backend `portable` con `module()` que encapsula el lado de imagen con las features de texto del caption de COCO como constantes.
- No es un modelo generativo de texto ni soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso
- Deteccion de clases personalizadas sin reentrenamiento: en un pipeline de inspeccion industrial se pasa `text=["defecto superficial", "grieta", "oxidacion"]` para localizar anomalias sin necesidad de anotar ni entrenar un detector especifico.
- Anotacion asistida de datasets: el modelo pre-etiqueta imagenes con cajas y puntuaciones para acelerar el etiquetado humano en proyectos de vision; la salida `boxes`/`scores`/`labels` se integra directamente en herramientas de anotacion.
- Busqueda visual por descripcion: dado un catalogo de imagenes, detectar y localizar objetos descritos en lenguaje natural (por ejemplo, "persona con casco amarillo") para indexacion o filtrado.
- Robotica y manipulacion: localizar objetos referidos por instrucciones de texto para guiar la pinza de un robot, aprovechando la deteccion open-vocabulary en escenas no vistas durante el entrenamiento.
- Moderacion y analisis de contenido: detectar elementos concretos (armas, vehiculos, personas) en imagenes mediante prompts de texto adaptables sin reentrenar.
- Analisis de imagenes de alta resolucion: el modelo se ha probado hasta 3000x4000 con un pico de memoria de 1,3-1,5 GiB en fp16 en una RTX 5060 Ti de 16 GB, lo que permite procesar fotografia aerea o medica de gran tamano en GPU de consumo.
- Segmentacion de instancias en pipelines de vision: usar las mascaras de instancia para tareas de recorte, conteo o seguimiento downstream.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks (COCO AP, LVIS AP, etc.) en la informacion disponible. La card unicamente aporta mediciones de velocidad y memoria en deteccion sintetica a 800x1344, comparando la implementacion original (fp32), `portable` y `kernels`. La tabla de la card aparece truncada en la informacion proporcionada, por lo que no se pueden reproducir los valores numericos de tiempo ni de memoria por variante.

Datos de memoria disponibles (fp16, RTX 5060 Ti 16 GB, entrada 3000x4000):

| Variante | Pico asignado | Pico reservado |
|---|---|---|
| `grounding-dino-base` | 1,5 GiB | 1,7 GiB |
| `grounding-dino-tiny` | 1,3 GiB | 1,5 GiB |
| `mm-grounding-dino-base` | 1,5 GiB | 1,7 GiB |
| `mm-grounding-dino-tiny` | 1,3 GiB | 1,5 GiB |

## Requisitos de hardware
- VRAM estimada: en fp16, aproximadamente 1,3-1,5 GiB de pico asignado para entradas de 3000x4000, segun la variante (tiny o base). Para resoluciones menores el consumo es inferior.
- GPU probada: RTX 5060 Ti de 16 GB (fp16, backend `portable`).
- Cabe en GPU de consumo: si, con margen amplio en tarjetas de 8 GB o superiores para las resoluciones probadas; las variantes tiny reducen el consumo frente a las base.
- Opciones de despliegue: libreria `fastforks` (backend `portable`, con `module()` para el lado de imagen), backend `kernels` (kernels en `fastforks/kernels`), y el codigo original de Hugging Face Transformers en el commit `c4c4605f9618`.
- Latencia y throughput: la card incluye una tabla de tiempos a 800x1344 (original fp32, portable, kernels) pero aparece truncada en la informacion disponible; no se pueden citar cifras concretas.
- Entrada: una imagen RGB por llamada; resolucion minima 32x32, padding a multiplo de 32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Deteccion open-vocabulary | Variantes | Licencia | Pesos |
|---|---|---|---|---|---|
| Grounding DINO (este repo) | Swin + BERT + DINO deformable | Si | base (Swin-B), tiny (Swin-T) | Apache-2.0 | No alojados aqui; descarga desde repos de los autores |
| MM-Grounding-DINO | Igual + cabeza contrastiva y decodificadores no compartidos | Si | base, tiny | Apache-2.0 | No alojados aqui; repos de OpenMMLab |
| Otros detectores open-vocabulary (p. ej. OWL-ViT, GLIP) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento comparativo con OWL-ViT, GLIP u otros detectores open-vocabulary, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- Este repositorio no contiene pesos: es solo una model card. Cualquier uso requiere descargar los pesos desde los repositorios de IDEA-Research u OpenMMLab y verificar los hashes SHA-256.
- Tier experimental: la propia card clasifica el modelo como `experimental`, lo que desaconseja su uso en produccion sin validacion previa.
- Idioma: el codificador de texto es BERT uncased, orientado a ingles; el rendimiento con prompts en castellano u otros idiomas no esta documentado (no disponible).
- Riesgo de alucinacion de detecciones: como detector open-set, puede producir cajas con puntuaciones para clases inexistentes en la imagen; es necesario aplicar umbrales de confianza y validacion.
- Sesgos: los datos de entrenamiento (Objects365, GoldG, Cap4M, V3Det) pueden introducir sesgos de dominio y de representacion; la informacion no detalla analisis de sesgo.
- Licencia: codigo Apache-2.0 y pesos Apache-2.0 con uso comercial permitido, pero la card advierte que las cadenas de codigo original se registran tal cual y deben revisarse antes de cualquier otro uso.
- Resolucion: las imagenes se redimensionan a 800 px en el lado corto (maximo 1333 en el lado largo), lo que puede degradar objetos muy pequenos en imagenes de gran resolucion.
- Sin soporte de texto generativo, tool calling ni agentes: es exclusivamente un detector.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/fastforks/grounding-dino
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Pesos Grounding DINO base: https://huggingface.co/IDEA-Research/grounding-dino-base
- Pesos Grounding DINO tiny: https://huggingface.co/IDEA-Research/grounding-dino-tiny
- Pesos MM-Grounding-DINO base: https://huggingface.co/openmmlab-community/mm_grounding_dino_base_o365v1_goldg_v3det
- Pesos MM-Grounding-DINO tiny: https://huggingface.co/openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det
- Paper Grounding DINO: arXiv:2303.05499
- Codigo original en Transformers (commit `c4c4605f9618`): https://github.com/huggingface/transformers
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/detection/models/grounding_dino/card.toml
