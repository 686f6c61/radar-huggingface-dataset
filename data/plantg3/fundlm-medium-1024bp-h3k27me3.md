# PlantG3/FunDLM-Medium-1024bp-H3K27me3

## Resumen

FunDLM-Medium-1024bp-H3K27me3 es un adaptador LoRA para clasificacion de secuencias de ADN, desarrollado por PlantG3 y publicado junto con el articulo de FunDLM. Clasifica ventanas de 1.024 pares de bases (bp) como portadoras de un pico de ChIP-seq de H3K27me3 (etiqueta 1) o no (etiqueta 0). H3K27me3 es una marca epigenetica asociada a heterocromatina facultativa, por lo que el modelo permite anotar regiones de represion genica a partir unicamente de la secuencia primaria.

El modelo se construye sobre FunDLM-Medium-1024bp, un modelo de lenguaje de ADN para hongos basado en la arquitectura Caduceus: un transformer bidireccional con capas Mamba-2 que incorpora comparticion de parametros entre la hebra directa y la reversa-complementaria (RCPS). El modelo base tiene 64 capas, una dimension de modelo de 768 y 471 millones de parametros unicos, con una longitud maxima de entrada de 1.024 bp.

El adaptador es de tipo LoRA con rango 8, alpha 32 y dropout 0,1, aplicado a las proyecciones `in_proj` y `out_proj` de los bloques Mamba. Se entreno durante tres epocas con un checkpoint final de 5.487 pasos de optimizacion. Por su naturaleza de clasificador de secuencias, no es un modelo generativo ni conversacional; su utilidad reside en la prediccion supervisada de marcas epigeneticas sobre genomas de hongos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Caduceus: Mamba-2 bidireccional con comparticion de parametros reverso-complementaria (RCPS) |
| Parametros totales | 471 M (modelo base); el adaptador LoRA anade parametros de bajo rango no cuantificados en la informacion |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 bp |
| Tipos de cuantizacion | El modelo base se almacena en bfloat16; no se detallan cuantizaciones adicionales |
| Idiomas soportados | No aplica (secuencias de ADN, alfabeto ACGT) |
| Licencia | No disponible |
| Formato de pesos | `pytorch_model.bin` (modelo base), `adapter_model.safetensors` (adaptador LoRA) |

## Arquitectura y entrenamiento

El backbone es Caduceus, una arquitectura de espacio de estados (state-space model) basada en Mamba-2 que procesa secuencias de ADN de forma bidireccional. La caracteristica diferencial es la comparticion de parametros entre la rama directa y la reversa-complementaria (RCPS), de modo que el modelo respeta la simetria natural del ADN. El modelo base FunDLM-Medium-1024bp tiene 64 capas, d_model 768 y 471 M parametros unicos, y fue entrenado como modelo de lenguaje de ADN sobre genomas de hongos. Sobre este backbone se aplica un adaptador LoRA de rango 8 y alpha 32 en las proyecciones `in_proj` y `out_proj` de los bloques Mamba, con dropout 0,1.

El entrenamiento del adaptador se realizo con AdamW durante tres epocas a 128 ventanas por paso (16 por dispositivo con 8 pasos de acumulacion de gradiente), tasa de aprendizaje 1e-4 con decaimiento coseno y 100 pasos de calentamiento, weight decay 0,01, clipping de gradiente 1,0, bfloat16 y semilla 42. El conjunto de datos se construyo a partir de ventanas de 1.024 bp de los aislados Br48, Guy11, O135 y O219: los intervalos de pico de H3K27me3 se extendieron 100 bp a cada lado y se teselaron con paso de 177 bp, y las ventanas control procedieron del complemento mapeable no solapante de los picos. Se eliminaron ventanas con bases no ACGT o etiquetas conflictivas, se conservo cada secuencia una sola vez y se descartaron ventanas de test que compartian secuencia con algun aislado de entrenamiento. O137 se mantuvo completamente fuera para test. El resultado fueron 234.210 ventanas de entrenamiento, 12.327 de validacion y 59.511 de test, con fracciones positivas de 0,481, 0,475 y 0,466 respectivamente.

Una nota tecnica importante del autor: no debe llamarse a `merge_and_unload()` sobre el adaptador, ya que las ramas Mamba directa y reversa-complementaria llevan pesos LoRA separados y fusionarlas en los pesos base compartidos altera las predicciones.

## Capacidades

- Clasificacion binaria de ventanas de ADN de 1.024 bp en funcion de la presencia de un pico de ChIP-seq de H3K27me3 (etiqueta 1) o ausencia (etiqueta 0), con salida softmax de dos clases.
- Procesamiento de secuencias de ADN de hasta 1.024 bp con tokenizador propio que asigna `[UNK]` a caracteres no ACGT y rellena secuencias mas cortas.
- Prediccion por lotes mediante la CLI del repositorio FunDLM (`lora_fine_tune.py`, subcomando `predict`) sobre ficheros Parquet tokenizados y salida CSV.
- Inferencia en GPU con bfloat16 y autocast; el autor indica que en CPU debe convertirse el modelo con `model.float()` y ejecutar el forward sin bloque de autocast.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de secuencias, no un modelo generativo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Anotacion epigenetica de genomas fungicos: dado un ensamblado de hongos, extraer ventanas de 1.024 bp con paso solapante y predecir la probabilidad de pico H3K27me3 para localizar regiones de heterocromatina facultativa sin necesidad de realizar ChIP-seq.
- Priorizacion de experimentos de ChIP-seq: usar las predicciones sobre regiones candidatas para seleccionar que zonas del genoma validar experimentalmente, reduciendo coste y tiempo de laboratorio.
- Estudio de represion genica y regulacion: integrar las predicciones de H3K27me3 con anotaciones de genes para identificar genes candidatos sometidos a represion mediada por esta marca.
- Comparacion entre aislados: aplicar el clasificador a genomas de distintos aislados (el modelo se entreno con Br48, Guy11, O135 y O219 y se evaluo en O137) para contrastar patrones de deposicion de H3K27me3 y detectar diferencias de heterocromatina.
- Filtrado de regiones en pipelines genomicos: incorporar el clasificador como etapa de anotacion en un pipeline que procese ventanas en lotes mediante la CLI (`predict` con `--batch_size 32` y `--bf16 True`), generando etiquetas y probabilidades en CSV.
- Generacion de caracteristicas para modelos aguas abajo: usar la probabilidad de pico como variable predictora en modelos de expresion genica o de clasificacion de regiones regulatorias.
- Validacion de simetria de hebra: aprovechar la arquitectura RCPS para comprobar la coherencia de predicciones entre una secuencia y su reverso-complementario en tareas de control de calidad.

## Benchmarks y rendimiento

Evaluacion en el conjunto de test retenido: 59.511 ventanas de O137, con fraccion positiva de 0,466.

| Metrica | Valor |
|---|---|
| AUROC | 0,985 |
| Average precision (AP) | 0,975 |
| Exactitud (accuracy) a umbral de probabilidad | No disponible (la model card se trunca en este punto) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks equivalentes, dado que se trata de un clasificador de secuencias genomicas y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,0 GB (incluye pesos base en bfloat16 y adaptador). Con 471 M parametros en bfloat16, el modelo base ronda 0,94 GB; en inferencia con activaciones y lotes pequenos es razonable esperar entre 2 y 4 GB de VRAM, aunque el autor no publica cifras exactas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y kernels de Mamba compilados; una RTX 4090, A100 o H100 son adecuadas. El autor no especifica modelos concretos.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas, aunque no se confirma en la informacion.
- Despliegue: `transformers` 4.49.0 con `trust_remote_code=True`, `peft` 0.14.0, `datasets` 3.3.2, y las dependencias `mamba_ssm` y `causal_conv1d` instaladas con `--no-build-isolation`. Tambien mediante la CLI del repositorio FunDLM.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor sugiere `--batch_size 32` y bfloat16 para prediccion por lotes.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (clasificadores de marcas epigeneticas sobre ADN). El propio modelo base FunDLM-Medium-1024bp es la referencia directa, pero no se aportan metricas de otros clasificadores alternativos.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FunDLM-Medium-1024bp-H3K27me3 | 471 M (base) + LoRA | 1.024 bp | Clasificacion H3K27me3 | No disponible | HuggingFace (PlantG3) |
| FunDLM-Medium-1024bp | 471 M | 1.024 bp | Modelo de lenguaje de ADN (base) | No disponible | HuggingFace (gnikesh) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificacion binaria de H3K27me3 en ventanas de 1.024 bp; no genera texto ni responde a instrucciones.
- Entrenado con genomas de hongos (aislados Br48, Guy11, O135 y O219, con O137 en test); su transferencia a otros reinos o especies no esta validada.
- La longitud de entrada esta fijada en 1.024 bp; secuencias mas largas se truncan y las mas cortas se rellenan, lo que puede afectar a la prediccion.
- Los caracteres no ACGT se mapean a `[UNK]`, lo que puede degradar la prediccion en regiones con ambiguedades o bases modificadas.
- No debe aplicarse `merge_and_unload()` al adaptador LoRA: las ramas directa y reverso-complementaria tienen pesos separados y la fusion altera las predicciones.
- Requiere kernels de Mamba (`mamba_ssm`, `causal_conv1d`) y `trust_remote_code=True`, lo que anade complejidad de despliegue frente a un transformer estandar.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse con el autor antes de usarlo en produccion.
- No se han publicado datos sobre sesgos, calibracion, rendimiento fuera de la distribucion de entrenamiento ni riesgos de falsos positivos en regiones repetitivas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.
- La model card esta truncada en la seccion de evaluacion (la exactitud aparece incompleta), lo que limita la verificacion de resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PlantG3/FunDLM-Medium-1024bp-H3K27me3
- Modelo base: https://huggingface.co/gnikesh/FunDLM-Medium-1024bp
- Repositorio FunDLM (script de fine-tuning LoRA): https://github.com/PlantG3/funDLM/blob/main/src/finetune/lora_fine_tune.py
- Guia de instalacion de PlantCAD2 (referencia de entorno): https://github.com/plantcad/plantcad/blob/main/docs/local-install.md
