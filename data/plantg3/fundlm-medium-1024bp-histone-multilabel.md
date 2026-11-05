# PlantG3/FunDLM-Medium-1024bp-Histone-Multilabel

## Resumen

FunDLM-Medium-1024bp-Histone-Multilabel es un adaptador LoRA de clasificación de secuencias de ADN publicado por PlantG3 junto con el artículo de FunDLM. Parte del modelo base gnikesh/FunDLM-Medium-1024bp, un modelo de lenguaje de ADN fúngico construido sobre la arquitectura Caduceus, y añade una cabeza de clasificación multi-etiqueta con tres salidas sigmoideas independientes que predicen la presencia de picos ChIP-seq de H3K27me3, H3K4me3 y H3K9me3 en ventanas de 1.024 pares de bases.

El problema que resuelve es la anotación de marcas de histona a partir de secuencia primaria en genomas de hongos, una tarea relevante para estudios de regulación epigenética donde los datos experimentales de ChIP-seq son escasos o costosos de generar. El modelo trata cada ventana como una clasificación multi-etiqueta, ya que una misma región puede portar más de una marca simultáneamente, y utiliza entropía cruzada binaria por salida en lugar de un softmax único.

El adaptador se distribuye con los pesos del modelo base incluidos en el repositorio (1,0 GB en total), lo que lo hace autocontenido, y se entrenó sobre 521.168 ventanas de entrenamiento y 27.430 de validación, con un conjunto de test independiente de 154.002 ventanas del aislado O137. Es un modelo de nicho, orientado a bioinformática fúngica, no a propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Caduceus: Mamba-2 bidireccional con compartición de parámetros entre hebra directa y reverso-complementaria (RCPS) |
| Parametros totales | 471M parámetros únicos en el modelo base; adaptador LoRA adicional (r=8, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 pb (pares de bases) |
| Tipos de cuantizacion | no disponible (pesos base en bfloat16; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de secuencia de ADN, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA), pytorch_model.bin (pesos base), código custom en Python |

## Arquitectura y entrenamiento

El modelo base FunDLM-Medium-1024bp emplea Caduceus, una arquitectura de espacio de estados basada en Mamba-2 con dos ramas (forward y reverse-complement) que comparten parámetros mediante RCPS (reverse-complement parameter sharing). Consta de 64 capas con dimensión de modelo 768 y 471M parámetros únicos. La bidireccionalidad y la simetría RC son relevantes en genómica porque el ADN es de doble hebra y una marca funcional debe detectarse independientemente de la orientación de la ventana.

El adaptador LoRA se aplica a las proyecciones `in_proj` y `out_proj` de los bloques Mamba, con rango 8, alpha 32 y dropout 0,1. El entrenamiento usó AdamW durante tres épocas a 128 ventanas por paso, hasta el checkpoint 12.213. La cabeza de clasificación tiene tres salidas independientes entrenadas con entropía cruzada binaria; las etiquetas no medidas se marcan con -1 y se excluyen de la pérdida (por ejemplo, el aislado O219 carece de datos de H3K4me3). El conjunto de entrenamiento agrupa ventanas de Br48, Guy11, O135 y O219, etiquetadas por solapamiento de al menos el 50% con picos o controles, y reserva O137 íntegramente para test. Las fracciones de positivos son 0,298 / 0,205 / 0,229 (H3K27me3 / H3K4me3 / H3K9me3) en entrenamiento.

Una advertencia técnica importante: no debe llamarse `merge_and_unload()` sobre el adaptador, porque las ramas forward y reverse-complement portan pesos LoRA separados y la fusión altera las predicciones.

## Capacidades

- Clasificación multi-etiqueta de tres marcas de histona (H3K27me3, H3K4me3, H3K9me3) sobre ventanas de ADN de 1.024 pb, con salidas sigmoideas independientes.
- Predicción de heterocromatina facultativa (H3K27me3), genes activamente transcritos (H3K4me3) y heterocromatina constitutiva (H3K9me3).
- Manejo de etiquetas no medidas mediante el valor -1, lo que permite entrenar con cobertura desigual entre aislados.
- Procesamiento por lotes mediante el CLI de FunDLM (`lora_fine_tune.py predict`) con soporte de bf16 y batch size configurable.
- Tokenización de secuencias de ADN con padding a 1.024 y mapeo de caracteres no ACGT a `[UNK]`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de secuencia, no un modelo generativo de lenguaje natural.
- Capacidades multilingües: no aplicable.

## Casos de uso

- Anotación epigenética de genomas fúngicos recién ensamblados: dado un genoma sin datos de ChIP-seq, deslizar ventanas de 1.024 pb y predecir las tres marcas para localizar regiones de heterocromatina y genes activos, priorizando experimentos posteriores.
- Priorización de regiones para validación experimental: usar las probabilidades de H3K27me3 y H3K9me3 para seleccionar candidatos a ChIP-seq o ChIP-qPCR, reduciendo el coste de cribado a genoma completo.
- Estudio comparativo entre aislados: aplicar el modelo a cepas no incluidas en el entrenamiento (como O137 en el test) para comparar perfiles epigenéticos predichos y detectar divergencias regulatorias.
- Integración en pipelines de anotación funcional: encadenar las predicciones con anotadores de genes para correlacionar marcas de histona con modelos génicos y detectar promotores activos (H3K4me3).
- Búsqueda de elementos reguladores en regiones intergénicas: identificar ventanas con H3K27me3 o H3K9me3 que sugieran silenciamiento y contrastarlas con elementos repetidos o regiones de defensa del genoma.
- Filtrado de ventanas en estudios de evolución de hongos patógenos: usar las predicciones como covariable en análisis de selección o de variación estructural, separando regiones constitutivamente silenciadas de regiones activas.
- Reproducción de experimentos del artículo FunDLM: ejecutar el CLI sobre ventanas tokenizadas para replicar las métricas publicadas y servir de línea base en comparaciones con otros modelos de ADN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 471M parámetros en bfloat16 (aproximadamente 0,9-1,0 GB de pesos); con activaciones y kernels Mamba se recomienda al menos 4-6 GB de VRAM para lotes pequeños.
- GPU recomendadas: cualquier GPU con soporte de CUDA y kernels `mamba_ssm` y `causal_conv1d` compilados; una RTX 3090, RTX 4090, A100 o H100 son adecuadas. El ejemplo de la model card asume GPU CUDA.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060/3070/4060 en adelante), siempre que se instalen los kernels Mamba.
- En CPU es posible ejecutando `model.float()` y sin autocast, pero con latencia mucho mayor y sin los kernels optimizados.
- Opciones de despliegue: PyTorch + Transformers + PEFT (ruta oficial documentada), y el CLI de FunDLM para predicción por lotes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un clasificador con código custom y dependencias Mamba.
- Latencia y throughput: no disponible; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FunDLM-Medium-1024bp-Histone-Multilabel | Caduceus (Mamba-2 bidireccional, RCPS) + LoRA | 471M (base) + adaptador | 1.024 pb | Clasificación multi-etiqueta de 3 marcas de histona | no disponible | HuggingFace (repo de 1,0 GB) |
| gnikesh/FunDLM-Medium-1024bp | Caduceus (Mamba-2 bidireccional, RCPS) | 471M | 1.024 pb | Modelo de lenguaje de ADN fúngico (base) | no disponible | HuggingFace |
| PlantCAD2 | no disponible en la información proporcionada | no disponible | no disponible | Genómica de plantas | no disponible | GitHub (referenciado para instalación) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ámbito restringido a hongos: el modelo base se entrenó con genomas fúngicos; su uso en plantas, animales o metagenomas no está validado.
- Longitud fija de 1.024 pb: secuencias más largas deben fragmentarse y las más cortas se rellenan con padding, lo que puede diluir la señal en ventanas pequeñas.
- Caracteres no ACGT se mapean a `[UNK]`, lo que afecta a regiones con ambigüedades o ensamblajes incompletos.
- Riesgo de alucinación en sentido estadístico: las probabilidades sigmoideas pueden ser altas en regiones fuera de la distribución de entrenamiento; se recomienda calibrar y validar con datos propios.
- Sesgo de cobertura: solo cuatro aislados en entrenamiento (Br48, Guy11, O135, O219) y uno en test (O137); la generalización a otras especies o cepas es incierta.
- Etiquetas no medidas (-1) durante el entrenamiento: el modelo puede estar peor calibrado para H3K4me3 en aislados con datos incompletos.
- No debe aplicarse `merge_and_unload()` al adaptador: la fusión de las ramas forward y reverse-complement altera las predicciones.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible verificar los términos antes de un despliegue en producción.
- Dependencias frágiles: requiere `transformers==4.49.0`, `peft==0.14.0`, `mamba_ssm` y `causal_conv1d` compilados con `--no-build-isolation`, lo que complica la reproducibilidad en entornos gestionados.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: sin comunidad que valide resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PlantG3/FunDLM-Medium-1024bp-Histone-Multilabel
- Modelo base: https://huggingface.co/gnikesh/FunDLM-Medium-1024bp
- Repositorio FunDLM (script de fine-tuning y predicción): https://github.com/PlantG3/funDLM/blob/main/src/finetune/lora_fine_tune.py
- Guía de instalación de PlantCAD2 (referenciada para el entorno): https://github.com/plantcad/plantcad/blob/main/docs/local-install.md
