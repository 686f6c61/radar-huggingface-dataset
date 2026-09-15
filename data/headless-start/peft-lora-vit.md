# headless-start/peft-lora-vit

## Resumen

`headless-start/peft-lora-vit` es un conjunto de checkpoints de ajuste fino con LoRA sobre un Vision Transformer ViT-B/16 (`vit_base_patch16_224.augreg_in21k_ft_in1k` de timm) para clasificacion de imagenes en el dataset Oxford-IIIT Pets. Lo publica el usuario headless-start como material de acompanamiento de su repositorio `github.com/headless-start/peft-lora-vit`, donde hay una implementacion de LoRA escrita a mano. No es un modelo de lenguaje: es un clasificador de imagenes de 37 razas de perros y gatos.

El modelo parte de un backbone ViT-B/16 de 86,1 M de parametros, preentrenado en ImageNet-21k y ajustado en ImageNet-1k con AugReg, que permanece congelado. Solo se entrenan las matrices LoRA anadidas a las proyecciones de query y value de la atencion, mas la cabeza de clasificacion, lo que supone 323 K parametros entrenables (0,38 % del total) en la configuracion principal. El checkpoint principal (`checkpoints/best.pt`) alcanza un 95,2 % de top-1 en el split de test de Oxford-IIIT Pets.

Su relevancia es fundamentalmente metodologica y educativa: el repositorio incluye estudios de ablacion sobre donde colocar los adaptadores (q, k, v y combinaciones) y sobre el rango de LoRA (r=4, 8, 16 y 32), ademas de comparativas contra linear probing y ajuste fino completo. Sirve como referencia reproducible de PEFT en vision, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16, patch 16, entrada 224x224) con adaptadores LoRA en las proyecciones q y v de la atencion |
| Parametros totales | 86,1 M en el backbone; 323 K entrenables con LoRA r=8 en q+v (0,38 %) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una imagen RGB fija redimensionada a 256 y recortada en el centro a 224x224 |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos PyTorch (`.pt`) sin versiones cuantizadas (GGUF, ONNX, etc.) |
| Idiomas soportados | no aplica (clasificacion de imagenes; las etiquetas de salida son 37 razas, en ingles en el dataset original) |
| Licencia | MIT (el backbone preentrenado es Apache-2.0 y Oxford-IIIT Pets es CC BY-SA 4.0) |
| Formato de pesos | PyTorch (`.pt`) con las claves `model`, `epoch` y `val_acc`; los checkpoints LoRA y de linear probe guardan solo los tensores entrenados |
| Modelo base | `timm/vit_base_patch16_224.augreg_in21k_ft_in1k` |
| Dataset de ajuste | `timm/oxford-iiit-pet` (split `trainval` para entrenamiento, `test` para evaluacion) |
| Tamano del repositorio | 0,4 GB |
| Pipeline (HuggingFace) | `image-classification` |
| Libreria | timm (PyTorch) |

## Arquitectura y entrenamiento

El backbone es un ViT-B/16 estandar de timm, con 12 capas, 86,1 M de parametros y parches de 16x16 sobre imagenes de 224x224, preentrenado con AugReg en ImageNet-21k y despues ajustado en ImageNet-1k. Sobre ese backbone congelado se insertan matrices LoRA de bajo rango en las proyecciones de query y value de cada bloque de atencion, con `alpha = 2r` y la matriz `B` inicializada a cero (de modo que al inicio de la LoRA el modelo es identico al backbone). El unico otro componente entrenable es la cabeza de clasificacion, adaptada a las 37 clases de Oxford-IIIT Pets.

El entrenamiento usa 25 epocas, optimizador AdamW con learning rate 3e-4 (3e-5 en el caso de ajuste fino completo), weight decay 0,05, dos epocas de warmup y decaimiento coseno hasta 1e-7, batch de 64 (16 para ajuste fino completo), precision mixta, drop-path 0,1 y augmentacion de random resized crop y volteo horizontal. Las entradas se normalizan con estadisticas de ImageNet (`build_transforms` en `src/data.py`).

El interes tecnico esta en el estudio de PEFT: la colocacion optima en el estudio con r=8 resulta ser q+v (94,9 %), ligeramente por encima de v sola (94,7 %) y de q+k+v (94,7 %), y muy por encima de q+k (94,3 %). El estudio de rango con q+v muestra un comportamiento plano (94,8 % con r=4, 94,9 % con r=8, 94,6 % con r=16 y 94,9 % con r=32), lo que sugiere que aumentar la capacidad de los adaptadores no aporta mejoras en esta tarea. No se emplea RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificacion de imagenes en 37 clases cerradas de razas de perro y gato del dataset Oxford-IIIT Pets, con salida top-1.
- Inferencia sobre imagenes RGB normalizadas con estadisticas de ImageNet (resize a 256, center crop a 224).
- Ajuste fino eficiente en parametros: el repositorio incluye checkpoints de linear probe (cabeza sola), LoRA con distintos rangos y colocaciones, y ajuste fino completo, comparables entre si.
- Reutilizacion de los adaptadores LoRA como plantilla para otras tareas de clasificacion de imagen con backbone congelado, modificando unicamente la cabeza.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni tiene interfaz de texto.
- No soporta agentes, razonamiento multi-paso ni modo de pensamiento.
- No tiene capacidades multilingues, de vision-lenguaje, de audio ni de deteccion o segmentacion; la salida es un vector de logits sobre 37 clases.
- Ejecucion en CPU y GPU mediante PyTorch; el checkpoint de LoRA ocupa 1,3 MB y el de linear probe 0,1 MB, ya que el backbone se carga aparte desde los pesos publicos de timm.

## Casos de uso

- Prototipado de PEFT en vision: usar el repositorio y sus checkpoints para reproducir los estudios de colocacion y rango de LoRA sobre un backbone ViT congelado, con cifras de referencia ya publicadas (94,3 %-94,9 % segun configuracion).
- Comparativa controlada de estrategias de ajuste: evaluar en el mismo pipeline linear probe (93,5 %, 28 K parametros), LoRA (94,9 %, 323 K) y ajuste fino completo (93,9 %, 85,8 M) para justificar el uso de PEFT en un proyecto real.
- Clasificacion de razas en aplicaciones de fotografia de mascotas: dado que el modelo distingue 37 razas, puede etiquetar automaticamente bibliotecas de fotos domesticas con un coste de inferencia bajo, aunque el vocabulario de clases esta limitado a las razas del dataset.
- Material docente: el par de checkpoints linear probe / LoRA permite explicar en clase la diferencia entre ajustar solo la cabeza y adaptar la atencion, con numeros exactos de parametros entrenables y precision.
- Base para fine-tuning en dominios cercanos: como plantilla para adaptar un ViT-B/16 con LoRA a otro dataset de clasificacion de grano fino (por ejemplo plantas o productos), partiendo de la implementacion de `predict.py` y `src/data.py`.
- Despliegue ligero en CPU: el checkpoint LoRA principal (`best.pt`) pesa unos pocos megabytes y el backbone se puede cargar congelado, lo que permite servir clasificacion a baja escala sin GPU.
- Evaluacion de robustez y calibracion: al existir varias configuraciones con precision casi identica (94,6 %-94,9 %), es un caso util para medir si las diferencias de top-1 se mantienen bajo otras particiones o metricas.

## Benchmarks y rendimiento

Resultados de top-1 en el split de test de Oxford-IIIT Pets (3.669 imagenes, 37 razas), tomados de la model card del autor. Cada cifra corresponde a una unica ejecucion con semilla 42 y al mejor epoch sobre el propio split de test, por lo que son resultados optimistas (no estimaciones sobre validacion independiente).

| Metodo | Precision top-1 | Parametros entrenables | Checkpoint | Tamano |
|---|---|---|---|---|
| Linear probe | 93,5 % | 28 K (0,03 %) | `checkpoints/best_head.pt` | 0,1 MB |
| LoRA r=8, q+v (comparativa) | 94,9 % | 323 K (0,38 %) | `checkpoints/best_lora.pt` | 1,3 MB |
| Ajuste fino completo | 93,9 % | 85,8 M (100 %) | `checkpoints/best_full.pt` | 343 MB |
| LoRA r=8, q+v (ejecucion principal) | 95,2 % | 323 K (0,38 %) | `checkpoints/best.pt` | no indicado |

Estudio de colocacion con rango 8:

| Colocacion | Precision top-1 | Parametros entrenables | Checkpoint |
|---|---|---|---|
| q | 94,3 % | 176 K | `checkpoints/best_r8_q.pt` |
| k | 94,1 % | 176 K | `checkpoints/best_r8_k.pt` |
| v | 94,7 % | 176 K | `checkpoints/best_r8_v.pt` |
| q + k | 94,3 % | 323 K | `checkpoints/best_r8_qk.pt` |
| q + v | 94,9 % | 323 K | `checkpoints/best_r8_qv.pt` |
| q + k + v | 94,7 % | 471 K | `checkpoints/best_r8_qkv.pt` |

Estudio de rango con colocacion q+v:

| Rango | Precision top-1 | Parametros entrenables | Checkpoint |
|---|---|---|---|
| 4 | 94,8 % | 176 K | `checkpoints/best_r4_qv.pt` |
| 8 | 94,9 % | 323 K | `checkpoints/best_r8_qv.pt` |
| 16 | 94,6 % | 618 K | `checkpoints/best_r16_qv.pt` |
| 32 | 94,9 % | 1,21 M | `checkpoints/best_r32_qv.pt` |

No se han publicado en la informacion disponible resultados frente a modelos de terceros ni de otras tareas.

## Requisitos de hardware

- No se proporcionan medidas de VRAM, latencia ni throughput en la model card; las cifras siguientes son estimaciones a partir del tamano del modelo y deben validarse en el hardware objetivo.
- Pesos: backbone ViT-B/16 en fp32, aproximadamente 344 MB; en fp16, unos 172 MB. El checkpoint LoRA r=8 anade 1,3 MB y el de la cabeza, 0,1 MB.
- Inferencia en GPU: con fp16 y lotes pequenos (batch 1-8 a 224x224) el modelo deberia caber holgadamente en GPUs de 4-6 GB, incluyendo RTX 3050, RTX 3060, RTX 4060 o T4. En fp32, el consumo estimado ronda 1-2 GB con las activaciones.
- Inferencia en CPU: viable. Con 86 M de parametros y una sola imagen de entrada, la latencia esperada es de decenas de milisegundos a unos cientos, segun nucleos y si se usa `torch.compile` o cuantizacion dinamica, aunque no hay mediciones publicadas.
- Entrenamiento: el ajuste con LoRA congela el backbone, por lo que el consumo se reduce al de forward mas gradientes de los adaptadores; con batch 64 y precision mixta es razonable esperar 8-16 GB de VRAM. El ajuste fino completo, con batch 16, requiere bastante mas y en la practica pide una GPU de 24 GB o superior (RTX 3090/4090, A100, H100).
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas para inferencia; RTX 3090/4090 o A100/H100 para reproducir el ajuste fino completo.
- Opciones de despliegue: no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (no aplican a este tipo de modelo). El flujo oficial es PyTorch con timm: clonar el repositorio, descargar el checkpoint con `hf download` y ejecutar `predict.py`, o cargar el modelo en Python con `load_model(path, "vit_base_patch16_224", r=8, alpha_factor=2, placement="qv")`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados de terceros en la informacion disponible. La comparativa posible se limita a las variantes del propio repositorio, todas con el mismo backbone y dataset:

| Variante | Parametros entrenables | Precision top-1 (test) | Tamano del checkpoint | Licencia |
|---|---|---|---|---|
| Linear probe (cabeza sola) | 28 K (0,03 %) | 93,5 % | 0,1 MB | MIT |
| LoRA r=8, q+v | 323 K (0,38 %) | 94,9 % (95,2 % en la ejecucion principal) | 1,3 MB | MIT |
| LoRA r=32, q+v | 1,21 M (1,4 %) | 94,9 % | no indicado | MIT |
| Ajuste fino completo | 85,8 M (100 %) | 93,9 % | 343 MB | MIT |

Frente a alternativas externas de grano fino en Oxford-IIIT Pets (por ejemplo CNN preentrenadas o ViT mas grandes) no se dispone de numeros comparables en la informacion proporcionada, y las condiciones de evaluacion tendrian que coincidir en split y protocolo para que la comparacion fuese valida.

## Limitaciones y advertencias

- Ambito cerrado: solo clasifica 37 razas de perro y gato. Cualquier imagen fuera de ese conjunto se asigna igualmente a una de las 37 clases, sin opcion de "desconocido".
- Las cifras publicadas son el mejor epoch medido sobre el mismo split de test que se reporta, no sobre un conjunto de validacion independiente. Esto introduce una seleccion optimista y hace que los valores absolutos deban tomarse con cautela.
- Cada numero proviene de una unica ejecucion con semilla 42 y la diferencia entre 94,9 % y 95,2 % en la misma configuracion se atribuye a variabilidad entre ejecuciones, por lo que diferencias de decimas entre configuraciones no son concluyentes.
- Dataset pequeno y poco diverso: Oxford-IIIT Pets contiene imagenes mayoritariamente de mascotas en primer plano; el rendimiento esperado cae con imagenes de camara de seguridad, fondos complejos, oclusiones o razas mezcladas.
- Sesgo de dominio y de representacion: la composicion del dataset condiciona tanto el vocabulario de razas como los sesgos de imagen, y no se documenta ningun analisis de sesgo por raza, iluminacion o procedencia de las fotos.
- Riesgo de sobreajuste al split de test por seleccion del mejor epoch, como se ha indicado.
- Idiomas: no aplica al modelo, pero las etiquetas del dataset estan en ingles; cualquier interfaz en castellano requiere un mapeo propio de clases.
- Licencia: el modelo y el codigo son MIT, pero el backbone preentrenado tiene licencia Apache-2.0 y el dataset Oxford-IIIT Pets es CC BY-SA 4.0 (con obligacion de compartir igual para obras derivadas del dataset). Ambas condiciones siguen aplicandose al uso comercial y deben revisarse antes de desplegar.
- No se distribuyen pesos cuantizados ni formatos alternativos (GGUF, ONNX), por lo que el despliegue en entornos no-PyTorch requiere conversion y validacion adicionales.
- Repositorio con 0 descargas y 1 "like" en el momento de la consulta: es un artefacto de investigacion personal sin mantenimiento ni garantias declaradas.
- El checkpoint de LoRA no incluye el backbone: hay que descargar los pesos de timm por separado o el modelo no carga.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/headless-start/peft-lora-vit
- Repositorio de codigo: https://github.com/headless-start/peft-lora-vit
- Modelo base: https://huggingface.co/timm/vit_base_patch16_224.augreg_in21k_ft_in1k
- Dataset de ajuste y evaluacion: https://huggingface.co/datasets/timm/oxford-iiit-pet
- La busqueda web realizada no devolvio resultados relevantes para este modelo (los enlaces recuperados correspondian a dominios de aerolineas y no guardan relacion con el contenido de la ficha).
