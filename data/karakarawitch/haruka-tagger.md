# KaraKaraWitch/haruka-tagger

## Resumen

Haruka-Tagger es un clasificador de imagenes multietiqueta especializado en el etiquetado automatico de ilustracion anime segun la taxonomia de Danbooru. Lo desarrolla el usuario independiente KaraKaraWitch y se distribuye con licencia Apache 2.0. Su rasgo diferencial es el tamano del vocabulario: 98.782 etiquetas en una sola pasada forward, frente a las 10.000-13.500 que manejan los taggers comunitarios habituales (WD-v3, AnimeTIMM, PixAI v0.9). Esa cobertura permite predecir atribucion de artista, copyrights poco frecuentes y personajes de cola larga que otros modelos descartan.

El modelo parte del backbone ViT `eva02_base_patch14_448` de timm (86,3 M de parametros, entrada 448x448) y lo coentrena desde el paso 0 con una cabeza de pooling de atencion propia denominada MHAttnPool, una estructura de 18 queries organizadas en dos niveles (6 troncos x 3 hojas). El entrenamiento se realizo sobre 9.253.992 imagenes de Danbooru deduplicadas por wHash, con un esquema de muestreo y ponderacion de perdida disenado para sostener clases con tan solo 45 publicaciones.

Es relevante ahora porque demuestra que un backbone compacto de 86 M puede asumir un vocabulario casi diez veces mayor que el estandar del ecosistema sin colapsar en las clases frecuentes, y porque ofrece pesos en safetensors y un grafo ONNX autonomo, lo que facilita su integracion en pipelines de anotacion masiva. El autor reporta un throughput de aproximadamente 605 imagenes por segundo con `batch_size=16` en una H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT EVA02-Base (patch14, 448x448) con cabeza de pooling de atencion MHAttnPool de 18 queries en arbol de 2 niveles |
| Parametros totales | 86,3 M (backbone) mas cabeza de clasificacion; total exacto no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada fija de 448x448 px |
| Tipos de cuantizacion | no disponible (se distribuyen safetensors en precision completa y ONNX) |
| Idiomas soportados | no disponible (las etiquetas de Danbooru son predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (809 MB), ONNX (822 MB) |

## Arquitectura y entrenamiento

El backbone es un transformer de vision EVA02-Base con patch de 14 px sobre entrada de 448x448, lo que produce una rejilla de 32x32 = 1.024 tokens espaciales de dimension 768. Sobre esa rejilla opera la cabeza MHAttnPool: seis queries troncales inicializadas ortogonalmente particionan el lienzo en regiones semantico-espaciales gruesas y, de cada una, ramifican tres queries hijas que atienden al detalle local con conexion residual (`z_tree = LayerNorm(z_coarse + z_child)`). Cada hoja dispone de su propia proyeccion `(768, 64)` inicializada ortogonalmente, de modo que la representacion final es de 1.152 dimensiones de rango completo en lugar de un cuello de botella compartido. El enrutamiento combina `softmax` sobre queries y `sigmoid` sobre parches, con escalado de masa de parches `M_q / (M_q + 4.0)` para que las queries sin concepto visual presente permanezcan silenciosas.

El entrenamiento cubre 9.253.992 imagenes con muestreo Damped Instance Repeat Factor (`irfs_power = 0.5`, rango 0.45x-2.0x) y ponderacion de perdida por etiqueta entre 0,40 y 1,00 dentro de `AsymmetricLoss(gamma_pos=0.0, gamma_neg=2.0, clip=0.0)`. Se aplica decaimiento de peso desacoplado diferenciado (1e-3 backbone, 1e-4 cabeza) y stochastic depth de 0,2. El esquema es Warmup-Stable-Decay: 6 epocas a tasa estable (`lr = 3e-4`, `backbone_lr = 7.5e-5`) seguidas de 3 epocas de cooldown coseno de 1.5e-4 a 0. Las transformaciones de datos evitan cutout y rotacion para preservar detalles de lineart de 1-3 px. El computo se ejecuto en un nodo de 8x H100 patrocinado por alpindale (dphn.ai).

## Capacidades

- Clasificacion multietiqueta de imagenes anime con 98.782 etiquetas en una sola pasada forward.
- Prediccion por categorias con umbrales recomendados diferenciados: artista (38.447 etiquetas, umbral 0,25), personaje (31.471, 0,35), general (21.748, 0,35), copyright (7.091, 0,35), ano/era (21, 0,25) y rating (4, argmax o 0,50).
- Atribucion de artista y deteccion de personajes de cola larga (hasta 45 publicaciones en el corpus de entrenamiento).
- Deteccion de micro-etiquetas compositivas y detalles finos de lineart.
- Clasificacion de rating de contenido en cuatro clases.
- Inferencia via PyTorch/timm o mediante grafo ONNX autonomo (`images (B, 3, 448, 448) -> logits (B, 98782)`).
- Inspeccion del arbol de queries y generacion de mapas de calor de atribucion espacial por etiqueta mediante el script `haruka_infer.py`.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades distintas de imagen.

## Casos de uso

- Anotacion masiva de datasets de ilustracion: con ~605 img/s en H100, el modelo permite etiquetar corpus de millones de imagenes para entrenamiento de modelos generativos o sistemas de recuperacion, cubriendo vocabulario que los taggers de 10k-13k etiquetas omiten.
- Atribucion de autoria en plataformas de galeria: la categoria `artist` con 38.447 entradas y umbral 0,25 permite identificar el autor probable de una ilustracion, util para creditos automaticos y deteccion de republicaciones sin atribucion.
- Moderacion y clasificacion de contenido: la cabeza de rating de cuatro clases permite filtrar o enrutar imagenes por nivel de contenido en comunidades y repositorios.
- Indexacion y busqueda semantica de personajes: con 31.471 personajes y 7.091 copyrights, el modelo alimenta motores de busqueda interna que necesitan reconocer crossovers y personajes minoritarios.
- Curacion de datasets para fine-tuning: la inspeccion del arbol de queries y los mapas de atribucion espacial permiten auditar por que el modelo asigna una etiqueta, util para limpiar datasets con etiquetas espurias.
- Analisis de tendencias creativas: la categoria `year` (21 clases) junto con etiquetas generales permite agregar estadisticas sobre evolucion de estilos, vestuario y composicion a lo largo del tiempo.
- Preetiquetado en herramientas de artista: integracion en flujos de publicacion que sugieren etiquetas al subir una obra, reduciendo el trabajo manual de tagging en plataformas tipo booru.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validation F1 (con cooldown coseno) | 68,23 % |
| `val_f1@35` | 63,16 % |
| Throughput (H100, `batch_size=16`) | ~605 imagenes/s |
| VRAM en inferencia (H100, `batch_size=16`) | ~1,5 GB |

La evaluacion se realizo sobre 1.000 publicaciones de Danbooru de 2026 no vistas y posteriores al corte de entrenamiento; la model card proporcionada se interrumpe antes de detallar los resultados completos de esa evaluacion. No se han publicado en la informacion disponible resultados comparativos en MMLU, HumanEval, GSM8K ni otros benchmarks estandar, que por otra parte no aplican a un clasificador de imagenes.

## Requisitos de hardware

- VRAM estimada: ~1,5 GB con `batch_size=16` en H100 para el modelo en precision completa; el consumo crece linealmente con el batch.
- GPU recomendadas: H100 para throughput maximo (~605 img/s); A100 y RTX 4090 son adecuadas para produccion a menor escala.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM puede ejecutar inferencia con batches pequenos.
- Opciones de despliegue: PyTorch con timm, ONNX Runtime (grafo exportado incluido), o el script CLI `haruka_infer.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~605 imagenes/s en H100 con `batch_size=16`; no se publican cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Vocabulario | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|
| Haruka-Tagger | 98.782 etiquetas | EVA02-Base-448 (86,3 M) | Apache 2.0 | safetensors + ONNX |
| WD-v3 (referencia citada) | ~10.000-13.500 etiquetas | no disponible en la informacion | no disponible | no disponible |
| AnimeTIMM (referencia citada) | ~10.000-13.500 etiquetas | no disponible en la informacion | no disponible | no disponible |
| PixAI v0.9 (referencia citada) | ~10.000-13.500 etiquetas | no disponible en la informacion | no disponible | no disponible |

Los tres modelos comparables se mencionan en la model card unicamente por el tamano de su vocabulario; no se dispone de sus especificaciones tecnicas, licencias ni resultados de benchmarks en la informacion proporcionada. Existen versiones previas del mismo autor (`haruka-tagger-alpha` con una sola query global y `haruka-tagger-beta-v6`) que no se detallan aqui por falta de datos.

## Limitaciones y advertencias

- El vocabulario y los umbrales estan calibrados exclusivamente para ilustracion anime en la taxonomia de Danbooru; el rendimiento fuera de ese dominio no esta documentado.
- Riesgo de confusion en escenas con multiples personajes: la version alpha con query unica global mezclaba rasgos entre personajes ("quimeras"); la version con 18 queries mitiga el problema, pero no se publican metricas especificas de esa mejora.
- Las etiquetas de cola larga (artistas y personajes con 45 publicaciones) dependen de umbrales bajos, lo que incrementa la tasa de falsos positivos en esas categorias.
- El modelo es un clasificador: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- La model card esta incompleta en la informacion disponible (se interrumpe durante la seccion de evaluacion), por lo que no se conocen los resultados completos sobre el conjunto de 2026 ni posibles sesgos documentados.
- No se documentan sesgos demograficos, culturales ni de contenido mas alla de la clasificacion de rating.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de las imagenes de entrenamiento (Danbooru) puede plantear cuestiones de derechos de autor ajenas a la licencia del modelo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaraKaraWitch/haruka-tagger
- Version alpha: https://huggingface.co/KaraKaraWitch/haruka-tagger-alpha
- Version beta v6: https://huggingface.co/KaraKaraWitch/haruka-tagger-beta-v6
- Modelo base Haruka-EVA02-base-448: https://huggingface.co/KaraKaraWitch/Haruka-EVA02-base-448
- Backbone original en timm: https://huggingface.co/timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k
- Perfil de Civitai con modelos etiquetados "Haruka": https://civitai.com/tag/haruka
