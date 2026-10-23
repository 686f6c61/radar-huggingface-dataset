# hihihini/nsvcg-mnre

## Resumen

`hihihini/nsvcg-mnre` no es un modelo de lenguaje generativo, sino un paquete de transferencia (código, documentación y pesos) para reproducir **NSVCG**, el método descrito en el preprint *Non-Salient Visual Content Grounding for Multimodal Relation Extraction* (Zefan Zhang et al., Research Square, DOI 10.21203/rs.3.rs-7395065/v1). El repositorio contiene cinco checkpoints entrenados sobre el dataset **MNRE** (12.247 / 1.624 / 1.614 ejemplos, una imagen por instancia, 23 clases de relación) y la réplica de la tubería que el autor original no publicó completa: faltaban dos módulos fuente, seis ficheros H5 de características y las anotaciones de *grounding* de test.

La arquitectura es un pipeline multimodal de extracción de relaciones: dos codificadores BERT para el texto, una proyección visual (MLP), un *denoiser* de difusión y una cabeza de clasificación de 23 clases. Cada checkpoint tiene 561 tensores y **268.859.457 parámetros** (≈269 M), almacenados en fp32. La inferencia principal usa la rama de difusión con 80 pasos de muestreo, no la cabeza lineal.

Su relevancia es acotada pero clara: es un artefacto de investigación reproducible que alcanza **F1 91,40 ± 0,41** en MNRE test (5 semillas) frente a los 92,14 del artículo, con un coste de entrenamiento de unos 10 minutos por semilla en una RTX 4090. No sirve como modelo de propósito general: no genera texto libre, no soporta *tool calling* y no se distribuye con licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal de extraccion de relaciones: 2 codificadores BERT (texto) + proyeccion visual (MLP) + denoiser de difusion + cabeza de clasificacion |
| Parametros totales | 268.859.457 (561 tensores por checkpoint) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos en fp32 (.pth.tar), sin versiones GGUF, AWQ, GPTQ ni ONNX publicadas |
| Idiomas soportados | no disponible en la model card; el corpus MNRE es en ingles |
| Licencia | no disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | PyTorch `.pth.tar` (diccionario `{"state_dict": ...}`), 5 ficheros de 1.025.161.717 B cada uno |
| Tarea | Clasificacion de relaciones multimodal (23 clases), con rama generativa por difusion |
| Dataset de entrenamiento | MNRE: 12.247 train / 1.624 dev / 1.614 test; 1 imagen por instancia; 23 clases |
| Tamano del repositorio | 5,1 GB (4,77 GiB de checkpoints + 14,1 MiB de codigo y documentacion) |
| Dependencias de datos externas | Imagenes MNRE (9.204 imagenes / 36.897 crops) y 13 GB de caracteristicas InstructBLIP en 6 ficheros H5, no incluidas |
| Version upstream | `zefanZhang-cn/NSVCG` @ commit `631ce8c` |

## Arquitectura y entrenamiento

El modelo sigue el esquema NSVCG del articulo: se codifica el texto con dos torres BERT, se proyectan las caracteristicas visuales (extraidas con InstructBLIP) mediante un MLP y se combinan ambas modalidades con un *denoiser* de difusion que modela la distribucion de la etiqueta de relacion; la prediccion final se obtiene por muestreo de 80 pasos sobre esa rama, con una cabeza de clasificacion lineal como rama alternativa. El paquete incluye los modulos `attention.py` y `Layers.py` **reconstruidos a partir de la descripcion del articulo (§3.5)**, no copiados del autor, y la biblioteca de 12 slots de objetos es un sustituto, ya que la anotacion original VG-MNRE no se publico.

El entrenamiento documentado en el paquete es de 8 epocas sobre las caracteristicas preextraidas, sin leer imagenes en tiempo de entrenamiento (solo los H5 `new_features` y `obj_features`), con un coste de unos 10 minutos por semilla en una unica RTX 4090 y unos 50 minutos para las 5 semillas. El checkpoint no incluye estado del optimizador, hiperparametros ni datos. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; la innovacion diferencial es el uso de difusion sobre la etiqueta y el anclaje de contenido visual no saliente.

## Capacidades

- Clasificacion de relaciones entre entidades a partir de un par (texto, imagen) en 23 clases predefinidas.
- Anclaje de contenido visual no saliente: el modelo esta disenado para usar informacion visual secundaria, no solo el objeto principal de la imagen.
- Rama generativa por difusion (80 pasos de muestreo) y rama discriminativa con cabeza lineal; el resultado principal reportado corresponde a la rama de difusion.
- Entrenamiento y evaluacion reproducibles con scripts incluidos (`run.py`, `train.sbatch`, `setup_env.sh`).
- Verificacion de integridad de los artefactos mediante `SHA256SUMS` y scripts `verify.sh` / `verify.ps1`.
- No soporta generacion de texto libre, *tool calling*, uso como agente, razonamiento multi-paso, vision general, audio ni modo *thinking*.
- Capacidades multilingues: no disponibles; el pipeline esta atado al vocabulario de los BERT incluidos y al corpus MNRE en ingles.

## Casos de uso

- **Reproduccion de resultados academicos**: ejecutar `python run.py --ckpt seed43 --only_test` sobre MNRE test permite verificar el F1 92,11 de esa semilla y contrastarlo con la Table 2 del articulo (92,14), con una desviacion documentada de −0,74 pp en la media de 5 semillas.
- **Linea base para nuevos metodos de MRE**: los 5 checkpoints (F1 91,40 ± 0,41) sirven como referencia estadistica con varianza conocida, algo poco habitual en articulos que solo publican una semilla.
- **Extraccion de relaciones en pipelines de noticias con imagen**: clasificar pares entidad-entidad en piezas periodisticas donde la fotografia aporta contexto no saliente (localizacion, rol, afiliacion), alimentando la construccion de grafos de conocimiento.
- **Investigacion sobre difusion aplicada a clasificacion estructurada**: el *denoiser* sobre etiquetas es reutilizable como banco de pruebas para comparar muestreo de 80 pasos frente a clasificacion determinista en tareas de etiquetado discreto.
- **Auditoria de reproducibilidad**: el paquete documenta explicitamente que falta (`reports/BLOCKERS.md`, `MODIFYING.md`) y permite estudiar como la reconstruccion de modulos no publicados afecta a las metricas finales.
- **Docencia en pipelines multimodales**: el coste de 10 minutos por semilla en una RTX 4090 y la estructura modular (dos BERT, MLP visual, difusion, cabeza) lo hacen apto para practicas de master con recursos limitados.
- **Reentrenamiento sobre un dominio propio**: sustituyendo los 23 clases y reextrayendo caracteristicas visuales (con `HANDOFF.md` §4), puede adaptarse a taxonomias de relación especificas, siempre que se asuma la reextraccion de los 13 GB de H5.

## Benchmarks y rendimiento

Resultados sobre MNRE test (1.614 ejemplos), rama de difusion, segun la model card:

| Semilla | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| 42 | 96,10 | 91,63 | 90,62 | 91,12 |
| 43 | 96,47 | 92,99 | 91,25 | **92,11** |
| 44 | 96,22 | 91,93 | 90,78 | 91,35 |
| 45 | 96,10 | 91,51 | 90,94 | 91,22 |
| 46 | 96,16 | 91,90 | 90,47 | 91,18 |
| Media ± desv. | 96,21 ± 0,15 | 91,99 ± 0,59 | 90,81 ± 0,30 | **91,40 ± 0,41** |
| Articulo (Table 2) | 96,47 | 92,72 | 91,56 | 92,14 |

Notas de lectura: la cabeza lineal por separado rinde aproximadamente 91,81 de F1 en la semilla 43, por lo que no debe compararse con la cifra de difusion. La evaluacion incorpora ruido aleatorio (`randn` en cada paso de muestreo), de modo que la misma configuracion de pesos puede oscilar ±0,1; para reproducir los numeros hay que fijar semilla y `batch_size` 32. Los resultados VG-MNRE del articulo (A@G 54,34 / A@VGMRE 51,80) no son reproducibles con este paquete. No se han publicado en la informacion disponible comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general, ya que el modelo no cubre esas tareas.

## Requisitos de hardware

- **VRAM en inferencia**: los pesos fp32 ocupan aproximadamente 1,08 GB (268,86 M de parametros); con activaciones de dos BERT y lotes pequenos, el consumo estimado es de 2 a 4 GB de VRAM. A ello se suma la necesidad de leer los 13 GB de caracteristicas H5 desde disco (mapeadas o precargadas).
- **GPU recomendadas**: cualquier GPU con 8 GB o mas para evaluacion (RTX 3060/4060, RTX 4090, A100, H100). La model card documenta entrenamiento e inferencia en **1× RTX 4090**.
- **Consumer GPU**: si, cabe holgadamente en RTX 3090/4090, RTX 4080 y en tarjetas de 8 GB; el cuello de botella es el almacenamiento de las caracteristicas, no la VRAM.
- **Coste temporal**: unos 10 minutos por semilla (8 epocas) en 1× 4090; unos 50 minutos para las 5 semillas; la evaluacion de un unico checkpoint es de orden de minutos.
- **Opciones de despliegue**: exclusivamente PyTorch con los scripts del paquete (`run.py`, `train.sbatch`). No hay soporte para vLLM, TGI, llama.cpp, Ollama ni formato GGUF, al no tratarse de un modelo autoregresivo.
- **Almacenamiento**: 5,1 GB del repositorio, mas 13 GB de H5 y el paquete de imagenes MNRE (9.204 imagenes / 36.897 crops) si se reextraen caracteristicas.
- **Latencia y throughput**: no disponibles de forma explicita; solo se documenta el tiempo de entrenamiento por semilla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MNRE test F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSVCG (esta replicacion) | 268,9 M | no disponible | 91,40 ± 0,41 (5 semillas) | no disponible | Pesos + codigo en HF |
| NSVCG (implementacion del articulo) | no disponible | no disponible | 92,14 | no disponible | Codigo parcial (`zefanZhang-cn/NSVCG` @ `631ce8c`), sin pesos |
| MRE-MI | no disponible | no disponible | 54,66 en transferencia de dominio (referencia de la model card, no comparable con 92,14) | no disponible | no disponible |
| MORE | no disponible | no disponible | no aplicable (su cola son objetos de imagen, no entidades de texto) | no disponible | no disponible |

La model card advierte explicitamente de que las cifras de MRE-MI y MORE no deben compararse con el 92,14 del articulo por diferencias de formulacion y de dominio. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **No es una reproduccion bit a bit**: `attention.py`, `Layers.py` y el *denoiser* estan reescritos a partir de la descripcion del articulo, las caracteristicas InstructBLIP se reextrajeron y la biblioteca de 12 slots es un sustituto. Los 91,40 de F1 indican que el metodo descrito es reproducible, no que el codigo del autor lo sea.
- **Resultados no reproducibles**: las dos columnas de VG-MNRE (A@G 54,34 / A@VGMRE 51,80) dependen de 1.748 anotaciones de objetos visuales sobre 1.614 muestras de test que no se publicaron.
- **Licencia ausente**: sin licencia declarada, el uso comercial queda en una zona juridica indeterminada; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Dependencias externas no incluidas**: sin las imagenes MNRE ni los 13 GB de H5 el pipeline no arranca; el entrenamiento no lee imagenes, por lo que cambiar de dominio obliga a reextraer caracteristicas.
- **Acoplamiento fuerte al checkpoint**: cambiar numero de capas, dimensiones, `num_class` o `steps` impide cargar los pesos; `num_class=23` esta codificado en 4 puntos de `softmax_nn.py`, incluido un `F.one_hot(label, 23)`.
- **Riesgo de alucinacion**: no aplica en el sentido generativo, pero el muestreo de difusion introduce ruido; la misma entrada puede variar ±0,1 de F1 entre ejecuciones.
- **Generalizacion limitada**: el modelo se evalua sobre 1.614 ejemplos de un unico corpus en ingles; no hay evidencia de comportamiento fuera de MNRE ni en otros idiomas.
- **Sesgos**: no documentados en la informacion disponible; MNRE se construye a partir de noticias, por lo que hereda los sesgos de cobertura mediatica de esa fuente.
- **Documentacion en chino**: la model card esta integrada mayoritariamente en chino, con fragmentos en ingles; no hay version en castellano ni en ingles completo.
- **Confusion de ramas**: la prediccion final procede de la rama de difusion (`logits = rep_old`); usar la cabeza lineal produce una metrica distinta (≈91,81) que no debe reportarse como resultado principal.
- **Advertencia sobre el espejo de descarga**: la model card recomienda `HF_ENDPOINT=https://hf-mirror.com`, un espejo no oficial; conviene verificar `SHA256SUMS` tras cualquier descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hihihini/nsvcg-mnre
- Articulo (preprint Research Square): https://doi.org/10.21203/rs.3.rs-7395065/v1
- Codigo upstream: `zefanZhang-cn/NSVCG` (commit `631ce8c`), referenciado en la model card sin URL directa en la informacion disponible
- Documentacion interna del paquete: `README.md`, `MODIFYING.md`, `HANDOFF.md`, `SHA256SUMS`, `verify.sh`, `verify.ps1`, `nsvcg-handoff.tar.gz`, `checkpoints/seed4{2..6}.pth.tar`
- La busqueda web realizada no devolvio resultados relacionados con el modelo (solo contenido audiovisual y para adultos sin relacion); no se incluyen por no ser fuentes relevantes.
