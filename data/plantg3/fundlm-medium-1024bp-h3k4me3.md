# PlantG3/FunDLM-Medium-1024bp-H3K4me3

## Resumen

FunDLM-Medium-1024bp-H3K4me3 es un adaptador LoRA para clasificación de secuencias de ADN, desarrollado por PlantG3 y publicado junto con el artículo de FunDLM. Se construye sobre el modelo base gnikesh/FunDLM-Medium-1024bp, un modelo de lenguaje de ADN fúngico con arquitectura Caduceus (Mamba-2 bidireccional con compartición de parámetros entre hebra directa y reverso-complementaria). El adaptador clasifica ventanas de 1.024 pares de bases como portadoras o no de un pico de ChIP-seq de la marca de histona H3K4me3, asociada a genes con transcripción activa.

El modelo resuelve una tarea concreta de genómica funcional: predecir, a partir únicamente de la secuencia de ADN, si una región de 1.024 bp está enriquecida con H3K4me3 en hongos filamentosos. Es relevante porque demuestra que un modelo de lenguaje de ADN preentrenado puede transferirse mediante LoRA a tareas de epigenómica con muy pocos parámetros adicionales (rango 8), manteniendo la arquitectura de estado-espacio del modelo base.

El repositorio es autocontenido: incluye tanto los pesos del adaptador como los del modelo base, el código de modelado personalizado y el tokenizador. El adaptador se entrenó sobre tres aislados fúngicos (Br48, Guy11 y O135) y se evaluó en un cuarto aislado retenido por completo (O137).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Caduceus: Mamba-2 bidireccional con compartición de parámetros reverso-complementaria (RCPS); 64 capas, d_model 768 |
| Parámetros totales | 471M parámetros únicos en el modelo base; el adaptador LoRA añade pesos de rango 8 sobre las proyecciones `in_proj` y `out_proj` |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 bp (longitud máxima de entrada) |
| Tipos de cuantización | No disponible (el modelo base se almacena en bfloat16) |
| Idiomas soportados | No aplica (modelo de secuencias de ADN); alfabeto ACGT con mapeo de caracteres no ACGT a `[UNK]` |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA en `adapter/adapter_model.safetensors`); `pytorch_model.bin` para el modelo base |

## Arquitectura y entrenamiento

El modelo base FunDLM-Medium-1024bp emplea Caduceus, una arquitectura de espacio de estados basada en Mamba-2 con dos innovaciones clave: bidireccionalidad (procesa la secuencia en ambas direcciones) y compartición de parámetros entre la hebra directa y su reverso-complementario (RCPS). Consta de 64 capas con dimensión de modelo 768 y 471M parámetros únicos. El adaptador LoRA se aplica con rango 8, alpha 32 y dropout 0.1 sobre las proyecciones `in_proj` y `out_proj` de los bloques Mamba. Es importante no fusionar el adaptador con `merge_and_unload()`, ya que las ramas directa y reverso-complementaria llevan pesos LoRA separados y la fusión altera las predicciones.

El entrenamiento se realizó sobre ventanas de 1.024 bp de los aislados Br48, Guy11 y O135. Los intervalos de pico de H3K4me3 se extendieron 100 bp a cada lado y se teselaron con paso de 182 bp; las ventanas de control provinieron del complemento mapeable no solapante con los picos. Se eliminaron ventanas con bases no ACGT o etiquetas conflictivas, se deduplicaron secuencias y se descartaron ventanas de test que compartían secuencia con aislados de entrenamiento. El conjunto resultante fue de 154.594 ventanas de entrenamiento, 8.137 de validación y 54.258 de test, con fracciones positivas de 0.430, 0.433 y 0.445 respectivamente. El aislado O137 se retuvo íntegramente para test; O219 no tiene datos de H3K4me3 y no se usó para esta marca.

Los hiperparámetros de entrenamiento incluyen AdamW, tres épocas con 128 ventanas por paso (16 por dispositivo × 8 pasos de acumulación de gradiente), tasa de aprendizaje 1e-4 con decaimiento coseno y 100 pasos de calentamiento, weight decay 0.01, recorte de gradiente 1.0, bfloat16 y semilla 42. El checkpoint reportado es `checkpoint-3621` (3.621 pasos de optimización). Se requieren los kernels de Mamba (`mamba_ssm`, `causal_conv1d`) para la inferencia.

## Capacidades

- Clasificación binaria de secuencias de ADN de 1.024 bp: predice si una ventana contiene un pico de ChIP-seq de H3K4me3 (clase 1) o no (clase 0), con salida softmax de dos clases.
- Procesamiento de secuencias genómicas con resolución de pares de bases, incluyendo tokenización de ACGT y mapeo de caracteres no ACGT a `[UNK]`.
- Relleno automático de secuencias más cortas de 1.024 bp mediante el tokenizador.
- Inferencia en lote mediante la CLI del repositorio FunDLM (`lora_fine_tune.py predict`), con soporte para bfloat16 y tamaño de lote configurable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de modelos de lenguaje natural.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Anotación epigenómica de genomas fúngicos: dado un genoma ensamblado, extraer ventanas de 1.024 bp con paso de 182 bp y clasificarlas para generar un mapa preliminar de regiones enriquecidas en H3K4me3 sin necesidad de experimentos de ChIP-seq.
- Priorización de experimentos: seleccionar las regiones con mayor probabilidad de pico para dirigir validación experimental por ChIP-qPCR, reduciendo el coste de cribado.
- Estudio de conservación funcional: comparar las predicciones del modelo entre aislados (por ejemplo, O137 frente a Br48, Guy11 y O135) para identificar regiones donde la marca H3K4me3 se predice de forma consistente o divergente.
- Integración en pipelines de anotación genómica: la CLI de FunDLM permite procesar ficheros `windows.parquet` tokenizados y generar `predictions.csv` con probabilidades, facilitando su incorporación a flujos bioinformáticos existentes.
- Análisis de genes activos: al asociarse H3K4me3 con genes transcritos activamente, las predicciones pueden usarse como señal complementaria para priorizar genes candidatos en estudios de expresión.
- Evaluación de modelos de lenguaje de ADN: servir como referencia de transferencia LoRA sobre Caduceus para tareas de clasificación de secuencias, comparando el rendimiento de adaptadores de bajo rango en distintas marcas epigenéticas.
- Filtrado de regiones en estudios de regulación: descartar ventanas con baja probabilidad de pico antes de análisis downstream, reduciendo el ruido en conjuntos de regiones candidatas.

## Benchmarks y rendimiento

Evaluación en el conjunto de test retenido de 54.258 ventanas del aislado O137 (fracción positiva 0.445):

| Métrica | Valor |
|---|---|
| AUROC | 0.996 |
| Average precision (AP) | 0.995 |
| Accuracy | No disponible (el valor se trunca en la model card) |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks equivalentes, dado que se trata de un modelo de clasificación de secuencias genómicas y no de un modelo de lenguaje natural.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 471M parámetros en bfloat16 (aproximadamente 1 GB de pesos) más el adaptador LoRA de rango 8; se estima un consumo de VRAM de entre 2 y 4 GB incluyendo activaciones y kernels de Mamba, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM; el ejemplo de la model card asume una GPU CUDA y ejecuta el forward en bfloat16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, siempre que se instalen los kernels de Mamba compatibles con la versión de CUDA.
- En CPU: es posible ejecutando `model.float()` y sin el bloque de autocast, según indica la model card, aunque el rendimiento no se especifica.
- Opciones de despliegue: PyTorch con `transformers==4.49.0`, `peft==0.14.0` y `datasets==3.3.2`, más `mamba_ssm` y `causal_conv1d` instalados con `--no-build-isolation`. La CLI de FunDLM (`lora_fine_tune.py predict`) permite inferencia por lotes. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y probablemente no sean compatibles dada la arquitectura Mamba personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FunDLM-Medium-1024bp-H3K4me3 (este) | Caduceus (Mamba-2 bidireccional, RCPS) + LoRA r=8 | 471M base + adaptador | 1.024 bp | Clasificación H3K4me3 en hongos | No disponible | HuggingFace |
| FunDLM-Medium-1024bp (base) | Caduceus (Mamba-2 bidireccional, RCPS) | 471M | 1.024 bp | Modelo de lenguaje de ADN fúngico | No disponible | HuggingFace |
| PlantCAD2 | No disponible en la información proporcionada | No disponible | No disponible | Genómica de plantas | No disponible | GitHub (referenciado para instalación) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente con datos de H3K4me3 de tres aislados fúngicos (Br48, Guy11 y O135); su generalización a otras especies, tejidos o condiciones experimentales no está validada.
- La evaluación se realizó en un único aislado retenido (O137), por lo que el rendimiento en otros aislados o especies podría diferir.
- El modelo solo acepta ventanas de exactamente 1.024 bp; secuencias más cortas se rellenan y los caracteres no ACGT se mapean a `[UNK]`, lo que puede degradar las predicciones en regiones con ambigüedades.
- No se debe llamar a `merge_and_unload()` sobre el adaptador: las ramas directa y reverso-complementaria tienen pesos LoRA separados y la fusión cambia las predicciones.
- Requiere kernels de Mamba (`mamba_ssm`, `causal_conv1d`) y versiones específicas de `transformers` y `peft`, lo que complica el despliegue en entornos estándar.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación en el sentido de falsos positivos o negativos en la clasificación: aunque las métricas reportadas son muy altas (AUROC 0.996), no se dispone de análisis de calibración ni de intervalos de confianza.
- No se han publicado análisis de sesgos ni de equidad, algo esperable en un modelo genómico pero relevante si se usa para priorizar regiones en estudios biológicos.
- La fracción positiva del conjunto de test (0.445) es artificialmente equilibrada respecto a un genoma completo, donde los picos de H3K4me3 son minoritarios; el rendimiento en condiciones reales de desequilibrio de clases no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PlantG3/FunDLM-Medium-1024bp-H3K4me3
- Modelo base: https://huggingface.co/gnikesh/FunDLM-Medium-1024bp
- Repositorio FunDLM (script de fine-tuning y predicción): https://github.com/PlantG3/funDLM/blob/main/src/finetune/lora_fine_tune.py
- Instrucciones de instalación de PlantCAD2 (referenciadas para el entorno): https://github.com/plantcad/plantcad/blob/main/docs/local-install.md
