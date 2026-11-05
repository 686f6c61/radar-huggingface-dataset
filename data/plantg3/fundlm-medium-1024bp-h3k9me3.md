# PlantG3/FunDLM-Medium-1024bp-H3K9me3

## Resumen

FunDLM-Medium-1024bp-H3K9me3 es un adaptador LoRA de clasificación de secuencias de ADN entrenado sobre el modelo base FunDLM-Medium-1024bp, un modelo de lenguaje genómico de arquitectura Caduceus (Mamba-2 bidireccional con compartición de parámetros entre hebra directa y complemento reverso). Lo desarrolla PlantG3 como parte del proyecto FunDLM, centrado en genómica de hongos, y clasifica ventanas de 1.024 pares de bases como portadoras o no de un pico de ChIP-seq de H3K9me3, marca epigenética asociada a heterocromatina constitutiva.

El modelo base tiene 64 capas, dimensión de modelo 768 y 471 millones de parámetros únicos, con una longitud máxima de entrada de 1.024 bp. El adaptador añade un clasificador softmax de dos clases sobre la representación del modelo base mediante LoRA de rango 8 y alpha 32, aplicado a las proyecciones `in_proj` y `out_proj` de los bloques Mamba. El repositorio de 1,0 GB incluye tanto los pesos del adaptador como los del modelo base en `pytorch_model.bin`, de modo que es autocontenido.

Su relevancia radica en que demuestra el uso de modelos de lenguaje de ADN de tipo state-space (Mamba) para anotación epigenética funcional en genomas fúngicos, una tarea donde los transformers clásicos con atención cuadrática resultan costosos en contextos de kilobases. El checkpoint publicado corresponde al paso 5.763 de optimización y reporta AUROC de 0,964 y AP de 0,967 sobre un conjunto de test retenido de 66.686 ventanas del aislado O137.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Caduceus: Mamba-2 bidireccional con compartición de parámetros entre hebra directa y complemento reverso (RCPS); 64 capas, d_model 768 |
| Parametros totales | 471M en el modelo base (parámetros únicos); el adaptador LoRA es de rango 8 sobre `in_proj` y `out_proj` |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 bp (pares de bases) |
| Tipos de cuantizacion | No disponible (pesos base en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors` para LoRA) y `pytorch_model.bin` para el modelo base; tokenizer.json y código custom (`configuration_caduceus.py`, `modeling_caduceus.py`, `modeling_rcps.py`) |

## Arquitectura y entrenamiento

El modelo base emplea Caduceus, una arquitectura de espacio de estados basada en Mamba-2 que procesa secuencias de ADN de forma bidireccional mediante dos hebras (directa y complemento reverso) que comparten parámetros. El adaptador LoRA se aplica de forma separada a las proyecciones de entrada y salida de cada bloque Mamba en ambas hebras, por lo que el autor advierte explícitamente que no debe llamarse `merge_and_unload()`: fusionar ambas ramas en los pesos base compartidos altera las predicciones.

El adaptador se entrenó sobre ventanas de 1.024 bp procedentes de los aislados Br48, Guy11, O135 y O219. Los intervalos de pico de H3K9me3 se extendieron 100 bp a cada lado y se teselaron con paso de 46 bp; las ventanas control provinieron del complemento mapeable no solapante de los picos. Se eliminaron ventanas con bases no-ACGT o etiquetas conflictivas, se deduplicaron secuencias y se descartaron ventanas de test que compartían secuencia con aislados de entrenamiento. O137 se retuvo íntegramente para test. El resultado fueron 245.893 ventanas de entrenamiento, 12.942 de validación y 66.686 de test, con fracciones positivas de 0,439, 0,439 y 0,471 respectivamente.

La configuración de entrenamiento usó AdamW, tres épocas a 128 ventanas por paso (16 por dispositivo con 8 pasos de acumulación de gradiente), tasa de aprendizaje 1e-4 con decaimiento coseno y 100 pasos de calentamiento, weight decay 0,01, clipping de gradiente 1,0, bfloat16 y semilla 42. El checkpoint reportado es `checkpoint-5763`.

## Capacidades

- Clasificación binaria de ventanas de ADN de 1.024 bp en dos clases: 0 = ventana sin pico y 1 = ventana con pico de H3K9me3.
- Detección de marcas de heterocromatina constitutiva (H3K9me3) a partir de secuencia primaria en genomas fúngicos.
- Procesamiento de secuencias de ADN con tokenizador específico que mapea caracteres no-ACGT a `[UNK]` y aplica padding a 1.024 bp.
- Inferencia por lotes mediante CLI (`src/finetune/lora_fine_tune.py predict`) con salida CSV de predicciones.
- No dispone de generación de texto, tool calling, capacidades multimodales ni agentes; es un modelo discriminativo de secuencia.
- Capacidad multilingüe: no aplica (no procesa lenguaje natural).

## Casos de uso

- Anotación epigenética de genomas fúngicos: dado un ensamblado, extraer ventanas de 1.024 bp con paso de 46 bp y puntuar la probabilidad de pico H3K9me3 para generar mapas de heterocromatina a escala de genoma.
- Priorización de regiones para validación experimental: usar la probabilidad de pico para seleccionar candidatos antes de confirmar por ChIP-seq, reduciendo coste de anticuerpo y secuenciación.
- Estudio comparativo entre aislados: aplicar el clasificador a Br48, Guy11, O135, O219 y O137 para comparar distribución de H3K9me3 y detectar diferencias de organización de heterocromatina.
- Filtrado de regiones no deseadas en pipelines de anotación: descartar ventanas con alta probabilidad de heterocromatina antes de análisis de elementos reguladores, dado que estas regiones suelen estar silenciadas.
- Transferencia a marcas relacionadas: reutilizar el pipeline LoRA y el modelo base para entrenar adaptadores análogos sobre otras marcas de ChIP-seq con el mismo formato de ventanas.
- Integración en flujos de bioinformática por lotes: ejecutar `lora_fine_tune.py predict` sobre ficheros `windows.parquet` tokenizados para producir `predictions.csv` consumible por herramientas posteriores.
- Evaluación de arquitecturas state-space frente a transformers en genómica: emplear el modelo como referencia reproducible (checkpoint y semilla publicados) para comparativas de AUROC y AP en clasificación de secuencias de kilobases.

## Benchmarks y rendimiento

Evaluación sobre conjunto de test retenido: 66.686 ventanas de O137 (fracción positiva 0,471).

| Metrica | Valor |
|---|---|
| AUROC | 0,964 |
| Average precision (AP) | 0,967 |
| Accuracy a probabilidad 0,5 | No disponible (el valor aparece truncado en la model card) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 471M parámetros; en bfloat16 los pesos ocupan aproximadamente 0,9 GB, más activaciones y estado de Mamba. El checkpoint base se almacena en bfloat16 y el ejemplo oficial asume GPU CUDA.
- GPU recomendadas: cualquier GPU CUDA con suficiente memoria para bfloat16; el repo no especifica modelos concretos (A100, H100, RTX 4090 no están documentados).
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 8 GB o más en bfloat16, dado el tamaño de pesos inferior a 1 GB; no hay confirmación oficial en la model card.
- En CPU: el autor indica que se puede ejecutar con `model.float()` y sin el bloque de autocast.
- Despliegue: requiere `transformers==4.49.0`, `peft==0.14.0`, `datasets==3.3.2`, `mamba_ssm` y `causal_conv1d` (instalados con `--no-build-isolation`). No se documentan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de clasificación con código custom y kernels Mamba, el despliegue estándar no está soportado en la información disponible.
- Latencia y throughput: no disponibles. El CLI documenta `batch_size 32` y `bf16 True` como configuración de ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FunDLM-Medium-1024bp-H3K9me3 | 471M (base) + LoRA r=8 | 1.024 bp | Clasificación H3K9me3 | No disponible | HuggingFace (PlantG3) |
| FunDLM-Medium-1024bp | 471M | 1.024 bp | Modelo base de lenguaje de ADN | No disponible | HuggingFace (gnikesh) |
| PlantCAD2 | No disponible | No disponible | Genómica de plantas (referencia de instalación) | No disponible | GitHub (plantcad/plantcad) |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que no es posible comparar AUROC, AP ni accuracy entre modelos.

## Limitaciones y advertencias

- Modelo discriminativo específico de una única marca (H3K9me3) y de genomas fúngicos; no generaliza a otras marcas ni a otros organismos sin reentrenamiento.
- Longitud de entrada fija de 1.024 bp: secuencias más largas deben dividirse en ventanas; el tokenizador trunca a 1.024 y aplica padding a las más cortas.
- Caracteres no-ACGT se mapean a `[UNK]`, lo que degrada la predicción en regiones con ambigüedades o bases enmascaradas.
- No debe llamarse `merge_and_unload()` sobre el adaptador: las hebras directa y complemento reverso tienen pesos LoRA separados y fusionarlos cambia las predicciones.
- Requiere kernels Mamba (`mamba_ssm`, `causal_conv1d`) y `trust_remote_code=True`; el despliegue en entornos sin CUDA o sin compilación de kernels está limitado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Riesgo de alucinación no aplica en sentido generativo, pero existe riesgo de falsos positivos y negativos en la clasificación; el accuracy a umbral 0,5 no está publicado en la información disponible.
- Sesgos potenciales derivados del desbalance y composición del dataset (fracción positiva en torno a 0,44-0,47) y de la sobrerrepresentación de determinados aislados en entrenamiento.
- Los benchmarks reportados provienen de un único conjunto de test (O137), por lo que la generalización a otros genomas no está validada en la información disponible.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/PlantG3/FunDLM-Medium-1024bp-H3K9me3
- Modelo base: https://huggingface.co/gnikesh/FunDLM-Medium-1024bp
- Repositorio FunDLM (script de fine-tuning y predicción): https://github.com/PlantG3/funDLM/blob/main/src/finetune/lora_fine_tune.py
- Guía de instalación de referencia (PlantCAD2): https://github.com/plantcad/plantcad/blob/main/docs/local-install.md
