# guillaume-cassez/cityscape-blob-loss-kofler

## Resumen

`guillaume-cassez/cityscape-blob-loss-kofler` es un conjunto de pesos entrenados para segmentación semántica de escenas urbanas sobre el dataset Cityscapes a resolución completa (1024×2048) con las 19 clases oficiales. Lo desarrolla Guillaume Cassez (con Stanislas Larnier) como investigación independiente, y forma parte de la serie de depósitos `cityscape-paper4`. El modelo emplea un backbone ConvNeXt-V2-Base preentrenado en ImageNet-22K con una cabeza de segmentación UPerNet.

El interés del depósito es metodológico: compara dos funciones de pérdida sobre la misma arquitectura y datos. El brazo `G_blob` añade una pérdida *blob* (Kofler, IPMI 2023) a la combinación CE + Dice, mientras que `B_dice` usa únicamente CE + Dice como referencia emparejada. El resultado publicado es un mIoU de 81,263 % para `G_blob` frente a 81,093 % para `B_dice`, es decir, una mejora fina que, según el propio autor, solo rinde de forma clara cuando la pérdida se usa como experto dentro de una mezcla de expertos (MoE).

Se publican tres semillas (42, 123 y 456) por brazo, con pesos en fp32 exportados del checkpoint exacto usado para las cifras del artículo. El repositorio ocupa 2,9 GB e incluye las matrices de confusión por imagen y los metadatos por clase que permiten reproducir cada tabla sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-V2-Base (backbone, ImageNet-22K) + UPerNet (cabeza de segmentación) |
| Parametros totales | no disponible (la model card no declara el recuento exacto) |
| Parametros activos | no aplica (no es un MoE desplegado, aunque el artículo estudia su uso como experto) |
| Longitud de contexto | no aplica; entrada de imagen a resolución completa 1024×2048 |
| Tipos de cuantizacion | no disponible; los pesos se publican en fp32 (safetensors) |
| Idiomas soportados | en (metadato de idioma del repositorio) |
| Licencia | MIT (pesos y código); manuscritos, tablas y figuras bajo CC-BY-4.0 |
| Formato de pesos | safetensors (fp32, solo pesos de red; sin estado de optimizador ni RNG) |

## Arquitectura y entrenamiento

El modelo combina un backbone ConvNeXt-V2-Base preentrenado sobre ImageNet-22K con una cabeza de segmentación UPerNet, una arquitectura de tipo transformer convolucional moderno con módulo de agregación piramidal. La salida es una máscara densa sobre las 19 clases oficiales de Cityscapes a resolución nativa de 1024×2048, sin reducción de la entrada. El entrenamiento se realizó en precisión mixta BF16.

Se entrenaron dos brazos durante 160 épocas cada uno sobre el mismo protocolo: `G_blob` usa CE + Dice + 0,5·blob (pérdida *blob* de Kofler, IPMI 2023) y `B_dice` usa CE + Dice como referencia emparejada. Cada brazo se replicó con tres semillas (42, 123 y 456). La evaluación se realiza con el mIoU oficial a nivel de dataset de `cityscapesScripts` sobre un holdout pre-registrado (`first:500` del split de validación). No se menciona RLHF ni DPO, ya que no es un modelo generativo de lenguaje. La innovación destacada es la pérdida auxiliar *blob*, pensada para equilibrar el peso por instancia y mejorar el IoU en objetos delgados (con efecto en el recall de peatones), aunque los autores subrayan que su beneficio es marginal como pérdida única y relevante principalmente como experto de una mezcla.

## Capacidades

- Segmentación semántica densa de escenas urbanas en 19 clases oficiales de Cityscapes a 1024×2048.
- Mejora específica del IoU en objetos delgados (*thin objects*) como postes, señales y elementos de mobiliario urbano.
- Efecto reportado sobre el recall de peatones cuando se usa la pérdida *blob*.
- Comportamiento como experto en configuraciones de mezcla de expertos (MoE), según el planteamiento del artículo.
- Reproducibilidad total: cada checkpoint va acompañado de matrices de confusión por imagen y metadatos por clase.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual de segmentación.
- No dispone de capacidades multilingües, de visión general ni de audio; su ámbito se limita a la segmentación de imagen.

## Casos de uso

- Conducción autónoma y percepción urbana: el modelo produce máscaras densas sobre las 19 clases de Cityscapes a resolución nativa, lo que permite alimentar módulos de planificación que necesitan distinguir calzada, acera, vehículos y peatones con detalle fino.
- Detección de objetos delgados en vía: gracias al sesgo hacia objetos de área pequeña introducido por la pérdida *blob*, resulta adecuado para resaltar postes, señales y barandillas que otras pérdidas tienden a diluir.
- Sistemas ADAS de asistencia al conductor: la segmentación a 1024×2048 permite construir avisos de carril, detección de obstáculos en acera o vigilancia de peatones en tiempo real sobre hardware con suficiente VRAM.
- Investigación académica sobre funciones de pérdida: el depósito incluye tres semillas por brazo y matrices de confusión, lo que lo convierte en un punto de partida controlado para estudiar el efecto de pérdidas auxiliares en segmentación semántica.
- Estudio de mezclas de expertos visuales: al estar concebido para operar como experto dentro de una MoE, es util para experimentar con enrutado y combinacion de segmentadores especializados.
- Preprocesado de datasets de conducción: las máscaras generadas sirven para autoetiquetar o refinar anotaciones en corpus urbanos antes de entrenar otros modelos.
- Análisis de vídeo urbano y videovigilancia: la segmentación clase a clase permite agregar estadísticas por franjas horarias sobre ocupación de acera, tráfico o presencia de viandantes.
- Evaluación comparativa de backbones: al fijar el par ConvNeXt-V2-Base + UPerNet y variar únicamente la pérdida, sirve como referencia reproducible frente a otras cabezas o backbones en Cityscapes.

## Benchmarks y rendimiento

Resultados publicados por el autor, mIoU oficial a nivel de dataset (%), recalcular desde las matrices de confusión por imagen del holdout y verificados contra las tablas del artículo.

| Brazo | Epocas | Perdida | mIoU medio | mIoU por semilla |
|---|---|---|---|---|
| `G_blob` | 160 | CE + Dice + 0,5·blob (Kofler, IPMI 2023) | 81,263 | 42: 81,297 · 123: 81,291 · 456: 81,202 |
| `B_dice` | 160 | CE + Dice (referencia emparejada) | 81,093 | 42: 81,429 · 123: 80,861 · 456: 80,989 |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K y similares no aplican, al tratarse de un modelo de segmentación). El IoU por clase de cada ejecución está en `<arm>/seed<S>/metadata.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada por el autor. Como referencia orientativa, un backbone ConvNeXt-V2-Base + UPerNet en fp32 ronda varios cientos de MB de pesos, pero la entrada a 1024×2048 y las activaciones de la cabeza piramidal elevan el consumo a un rango aproximado de 4-8 GB de VRAM por imagen (estimación, no dato oficial).
- GPU recomendadas: no especificadas. Por tamaño y resolución, una GPU con 8-16 GB (RTX 3080, RTX 4080, RTX 4090, A4000) es suficiente para inferencia en fp32 o BF16; para entrenamiento o lotes grandes se recomienda A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPU con 8 GB o más, siempre que se procese una imagen a la vez o se use precisión BF16.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación. La carga se realiza con `safetensors.torch.load_file` y la arquitectura procede del repositorio de código asociado; es exportable a TorchScript u ONNX con trabajo adicional.
- Latencia y throughput estimados: no disponibles. La resolución de 1024×2048 implica un coste de cómputo elevado por imagen, pero no se publican cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tarea y dataset | Backbone / cabeza | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cityscape-blob-loss-kofler | Segmentacion semantica Cityscapes, 19 clases | ConvNeXt-V2-Base + UPerNet | 81,263 (G_blob) | MIT | HuggingFace |
| cityscape-distmap-aux-regression | Segmentacion semantica Cityscapes | ConvNeXt-V2 + UPerNet (perdida auxiliar de mapa de distancias) | no disponible en esta busqueda | MIT | HuggingFace |
| cityscape-boundary-loss-kervadec | Segmentacion semantica Cityscapes | ConvNeXt-V2 + UPerNet (perdida de contorno Kervadec) | no disponible en esta busqueda | MIT | HuggingFace |
| cityscape-moe-v3-experts | Segmentacion con mezcla de expertos | Configuracion MoE de la serie paper4 | no disponible en esta busqueda | MIT | HuggingFace |

Las alternativas mas directas son los depositos hermanos del mismo autor, que comparten backbone, dataset y protocolo de evaluacion y solo cambian la perdida auxiliar, lo que los hace comparables de forma controlada.

## Limitaciones y advertencias

- Sesgos: el modelo se entrena exclusivamente sobre Cityscapes, con las clases y la distribucion geografica propias del dataset (ciudades alemanas y de paises vecinos). Su generalizacion a otras regiones, condiciones meteorologicas o paises no esta documentada.
- Alucinacion: en segmentacion densa no aplica el concepto de alucinacion de lenguaje, pero si existen errores de prediccion en clases minoritarias o en objetos delgados, que pueden producir mascaras incorrectas sin aviso.
- Contexto e idioma: no es un modelo de lenguaje; el metadato de idioma `en` solo refleja el idioma del repositorio. No procesa texto ni mantiene contexto conversacional.
- Restricciones de licencia: los pesos y el codigo son MIT, y el manuscrito, las tablas y las figuras estan bajo CC-BY-4.0 (licencia del deposito Zenodo). El dataset Cityscapes mantiene su propia licencia y no se redistribuye aqui, por lo que su uso comercial requiere cumplir las condiciones de Cityscapes.
- Valor limitado en produccion como modelo aislado: los propios autores describen el resultado como un *negative result* matizado, ya que la perdida *blob* apenas supera a la referencia emparejada y su beneficio real aparece principalmente como experto de una mezcla de expertos.
- Reproducibilidad de numeros: las cifras corresponden a un holdout pre-registrado concreto; evaluaciones sobre otro subconjunto de validacion pueden diferir.
- Hardware y despliegue: no hay cifras de latencia ni de consumo publicadas, ni integraciones estandar de servido, lo que exige trabajo de ingenieria adicional para llevarlo a produccion.
- Descargas y validacion de la comunidad: el repositorio registra 0 descargas y 0 *likes*, sin validacion externa independiente en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guillaume-cassez/cityscape-blob-loss-kofler
- Repositorio de codigo, tablas y figuras: https://github.com/guillaume-cassez/cityscape-blob-loss-kofler
- DOI de concepto (siempre resuelve a la ultima version): https://doi.org/10.5281/zenodo.23083559
- Deposito Zenodo vigente en la redaccion: https://doi.org/10.5281/zenodo.23147260
- Deposito hermano (mapa de distancias): https://huggingface.co/guillaume-cassez/cityscape-distmap-aux-regression
- Deposito hermano (perdida de contorno Kervadec): https://huggingface.co/guillaume-cassez/cityscape-boundary-loss-kervadec
- Deposito hermano (expertos MoE v3): https://huggingface.co/guillaume-cassez/cityscape-moe-v3-experts
- Deposito hermano (MedNeXt blob loss, BraTS 2023 Glioma): https://huggingface.co/guillaume-cassez/mednext-blobloss-brats2023gli
- Resultados de busqueda web: sin enlaces tecnicos relevantes (las coincidencias encontradas se refieren únicamente al nombre propio «Guillaume» y no al modelo).
