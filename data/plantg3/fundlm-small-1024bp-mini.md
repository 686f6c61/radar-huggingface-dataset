# PlantG3/FunDLM-Small-1024bp-Mini

## Resumen

FunDLM-Small-1024bp-Mini es un adaptador LoRA para clasificación binaria de secuencias de ADN de 1.024 pares de bases, desarrollado por PlantG3. Se construye sobre el modelo de lenguaje genómico FunDLM-Small-1024bp (arquitectura Caduceus, un transformer bidireccional basado en Mamba-2 con compartición de parámetros entre hebra directa y reverso-complementaria). La tarea concreta consiste en distinguir ventanas de ADN pertenecientes a mini-cromosomas (cromosomas accesorios o supernumerarios, ricos en repeticiones y pobres en genes) frente a las de cromosomas core, en genomas de hongos del género *Pyricularia*.

El modelo resulta relevante porque los mini-cromosomas de hongos fitopatógenos pueden portar genes efetores implicados en virulencia, y su detección automática a partir de secuencia bruta es un problema práctico en genómica de hongos. El adaptador reconoce secuencia mini-cromosómica en aislamientos no vistos durante el ajuste fino, lo que lo convierte en una herramienta de transferencia para nuevos genomas.

El adaptador tiene rango LoRA 8 y alfa 32, aplicado sobre las proyecciones `in_proj` y `out_proj` de las capas Mamba del modelo base, que cuenta con 24 capas, dimensión de modelo 768 y 88 millones de parámetros únicos. La longitud máxima de entrada es de 1.024 pb. El repositorio incluye tanto el adaptador como los pesos y el código del modelo base, por lo que es autocontenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Caduceus (transformer bidireccional con Mamba-2 y compartición de parámetros reverso-complementaria) |
| Parametros totales | 88M en el modelo base; el adaptador LoRA es de rango 8 y alfa 32 (recuento exacto de parámetros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 pb (pares de bases) |
| Tipos de cuantizacion | No disponible (el modelo base se almacena en bfloat16) |
| Idiomas soportados | No aplica (secuencia de ADN; alfabeto ACGT, caracteres no ACGT se mapean a `[UNK]`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`) y `pytorch_model.bin` para el modelo base; tokenizer en JSON |
| Tarea | Clasificación de secuencia (softmax sobre 2 clases) |
| Etiquetas | 0 = core chromosome, 1 = mini-chromosome |
| Checkpoint | `checkpoint-27000` |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

El modelo base FunDLM-Small-1024bp emplea la arquitectura Caduceus, un transformer bidireccional que sustituye la atención por capas de espacio de estados Mamba-2 y que comparte parámetros entre la hebra directa y su reverso-complementario. Consta de 24 capas, dimensión de modelo 768 y 88 millones de parámetros únicos. Sobre esta base se añade una cabeza de clasificación con dos salidas y un adaptador LoRA de rango 8, alfa 32 y dropout 0,1, insertado en las proyecciones `in_proj` y `out_proj` de las capas Mamba. Es importante señalar que las ramas forward y reverso-complementaria portan pesos LoRA separados, de modo que fusionar el adaptador con `merge_and_unload()` altera las predicciones.

El ajuste fino se realizó sobre ventanas de 1.024 pb extraídas de seis ensamblados de *Pyricularia* usados para entrenar MiniC: 70-15, B71Ref2, MZ5-1-6, LpKY97, O135 y TF05. Las secuencias core y mini-cromosómicas se trocearon con pasos distintos para equilibrar las clases, y se eliminaron las ventanas con alineamiento fiable a secuencia compartida entre ambos compartimentos. El conjunto resultante contiene 13.655.061 ventanas de entrenamiento y 718.688 de validación. El entrenamiento usó AdamW con tasa de aprendizaje 1e-4 y decaimiento coseno, 2.700 pasos de calentamiento, weight decay 0,01, recorte de gradiente 1,0, bfloat16 y semilla 42; con 16 ventanas por dispositivo y 32 pasos de acumulación de gradiente se procesan 512 ventanas por paso de optimización, durante 27.000 pasos (una pasada sobre los datos de entrenamiento).

## Capacidades

- Clasificación binaria de ventanas de ADN de exactamente 1.024 pb en dos clases: cromosoma core (0) y mini-cromosoma (1).
- Detección de secuencia mini-cromosómica en aislamientos de *Pyricularia* no vistos durante el ajuste fino.
- Procesamiento de secuencia de ADN bruta con tokenizador propio; rellena secuencias más cortas y mapea caracteres no ACGT a `[UNK]`.
- Inferencia por lotes mediante la CLI del repositorio FunDLM (`lora_fine_tune.py predict`), con soporte de bfloat16 y tamaño de lote configurable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un clasificador de secuencia.
- No dispone de capacidades multilingües en el sentido habitual; su dominio es la secuencia genómica.

## Casos de uso

- Anotación de ensamblados fúngicos: dado un ensamblado de *Pyricularia*, trocear el genoma en ventanas de 1.024 pb y ejecutar el clasificador en lote para etiquetar regiones candidatas a mini-cromosoma antes de la inspección manual.
- Priorización de genes efetores: identificar contigs o regiones mini-cromosómicas donde buscar genes efetores asociados a virulencia en hongos fitopatógenos.
- Control de calidad de ensamblados: detectar contaminación o mezcla de compartimentos cromosómicos comparando la proporción de ventanas clasificadas como mini frente a lo esperado para el aislamiento.
- Transferencia a nuevos aislamientos: aplicar el adaptador a genomas de aislamientos no incluidos en el ajuste fino, aprovechando que el modelo fue evaluado en cuatro aislamientos held-out (Br62, G239, O137 y JP37).
- Filtrado previo en pipelines de genómica comparativa: descartar o separar ventanas mini-cromosómicas antes de análisis de sintenía o alineamiento entre genomas.
- Investigación sobre organización cromosómica: cuantificar la fracción de secuencia mini-cromosómica por aislamiento y relacionarla con fenotipos de virulencia, usando las probabilidades softmax como medida continua.
- Integración en flujos de anotación existentes: la CLI del repositorio FunDLM acepta un fichero Parquet tokenizado y produce un CSV de predicciones, lo que facilita su incorporación a pipelines bioinformáticos por lotes.

## Benchmarks y rendimiento

El conjunto de test held-out consta de 162.080 ventanas no solapadas de 1.024 pb procedentes de cuatro aislamientos no usados en el ajuste fino (Br62, G239, O137 y JP37), de las cuales 4.551 (2,8%) son mini-cromosómicas.

| Metrica | Valor |
|---|---|
| AUROC | El dato aparece truncado en la model card disponible ("0"); no disponible |
| Conjunto de test | 162.080 ventanas de 4 aislamientos held-out |
| Prevalencia de mini-cromosomas en test | 2,8% (4.551 ventanas) |

No se han publicado en la informacion disponible otros resultados de benchmarks (exactitud, F1, precisión, recall) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 88M de parámetros y se almacena en bfloat16, por lo que los pesos ocupan aproximadamente 0,18 GB; con activaciones y el adaptador, la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y kernels Mamba compilados; una RTX 3090, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño. El ejemplo de la model card asume una GPU CUDA.
- Cabe en GPU de consumo: sí, en tarjetas con al menos unos pocos GB de VRAM (por ejemplo, RTX 3060 en adelante), siempre que se instalen `mamba_ssm` y `causal_conv1d`.
- CPU: la model card indica que en CPU hay que convertir el modelo con `model.float()` y ejecutar sin el bloque de autocast; el rendimiento en CPU no se especifica.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el despliegue previsto es mediante Transformers 4.49.0, PEFT 0.14.0 y los kernels Mamba, o mediante la CLI del repositorio FunDLM.
- Dependencias específicas: `transformers==4.49.0`, `peft==0.14.0`, `datasets==3.3.2`, `mamba_ssm` y `causal_conv1d` instalados con `--no-build-isolation`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FunDLM-Small-1024bp-Mini | 88M (base) + LoRA r=8 | 1.024 pb | Clasificación core vs mini-cromosoma | No disponible | Hugging Face (PlantG3) |
| FunDLM-Small-1024bp | 88M | 1.024 pb | Modelo base genómico (LM de ADN) | No disponible | Hugging Face (gnikesh) |
| MiniC | No disponible | No disponible | Clasificación core vs mini-cromosoma en *Pyricularia* | No disponible | No disponible en la información proporcionada |
| PlantCAD2 | No disponible | No disponible | Genómica de plantas (referenciado para instalación) | No disponible | GitHub (plantcad) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en hongos del género *Pyricularia*; su comportamiento en otros géneros fúngicos u otros organismos no está documentado.
- La entrada debe ser exactamente de 1.024 pb; secuencias más cortas se rellenan y los caracteres no ACGT se mapean a `[UNK]`, lo que puede degradar las predicciones en regiones con ambigüedades.
- No se debe llamar a `merge_and_unload()` sobre el adaptador: las ramas forward y reverso-complementaria tienen pesos LoRA separados y la fusión cambia las predicciones.
- El desequilibrio de clases es acusado (2,8% de mini-cromosomas en test), por lo que métricas como la exactitud pueden ser engañosas; conviene usar AUROC y métricas por clase.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; es un riesgo para producción.
- No se han publicado métricas completas de evaluación (AUROC truncado en la model card, sin F1, precisión ni recall), lo que limita la evaluación objetiva del rendimiento.
- Riesgo de alucinación en el sentido de falsos positivos o negativos en la clasificación; no hay datos publicados sobre calibración de las probabilidades.
- El modelo requiere kernels Mamba compilados (`mamba_ssm`, `causal_conv1d`), lo que complica el despliegue en entornos sin CUDA o con versiones incompatibles de PyTorch.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantG3/FunDLM-Small-1024bp-Mini
- Modelo base: https://huggingface.co/gnikesh/FunDLM-Small-1024bp
- Repositorio FunDLM (script de ajuste fino y predicción): https://github.com/PlantG3/funDLM/blob/main/src/finetune/lora_fine_tune.py
- Instrucciones de instalación de PlantCAD2: https://github.com/plantcad/plantcad/blob/main/docs/local-install.md
