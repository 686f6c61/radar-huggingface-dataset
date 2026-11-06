# PlantG3/FunDLM-Small-1024bp-Centromere

## Resumen

FunDLM-Small-1024bp-Centromere es un adaptador LoRA de clasificación de secuencias de ADN publicado por PlantG3 junto con el artículo de FunDLM. Se aplica sobre el modelo base gnikesh/FunDLM-Small-1024bp, un modelo de lenguaje de ADN fúngico de 88 millones de parámetros construido sobre la arquitectura Caduceus (Mamba-2 bidireccional con compartición de parámetros entre hebras directa y reversa-complementaria). La tarea concreta es binaria: determinar si una ventana de 1.024 pares de bases pertenece a una región centromérica (etiqueta 1) o no (etiqueta 0).

El interés del modelo reside en que los centrómeros son regiones genómicas que evolucionan muy rápido y que se definen epigenéticamente por la histona específica CENP-A, no por una secuencia de ADN conservada. Detectar secuencia asociada a centrómeros a partir únicamente de ADN es, por tanto, un problema difícil y biológicamente relevante. El adaptador se entrenó sobre ventanas de tres ensamblados de *Pyricularia* (Guy11, Br36 y Br62) y se evaluó sobre el cromosoma 6 de Br62, retenido íntegramente durante el ajuste fino.

El repositorio es autocontenido: incluye los pesos del adaptador, el código de modelado personalizado de Caduceus y los pesos del modelo base en bfloat16, con un tamaño total de 0,4 GB. La licencia no está declarada en la información disponible, lo que condiciona cualquier uso comercial hasta que el autor la especifique.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Caduceus: Mamba-2 bidireccional (state space model) con compartición de parámetros entre hebras reverso-complementarias (RCPS); 24 capas, d_model 768 |
| Parametros totales | 88M parámetros únicos en el modelo base; adaptador LoRA de rango 8 sobre las proyecciones `in_proj` y `out_proj` de Mamba |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1.024 pares de bases (ventana fija) |
| Tipos de cuantizacion | no disponible; el checkpoint base se distribuye en bfloat16 |
| Idiomas soportados | no aplica (modelo de secuencias de ADN); no disponible en el sentido de lenguajes naturales |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador, `adapter/adapter_model.safetensors`), PyTorch binario (`pytorch_model.bin`) para el modelo base, JSON para configuración y tokenizador |

## Arquitectura y entrenamiento

El modelo base FunDLM-Small-1024bp emplea Caduceus, una arquitectura de espacio de estados basada en Mamba-2 en lugar de atención transformer. La variante bidireccional procesa la secuencia en ambas direcciones y comparte parámetros entre la hebra directa y su reverso-complementario (RCPS), de modo que el modelo respeta la simetría biológica del ADN de doble cadena. Con 24 capas y dimensión de modelo 768, el modelo tiene 88 millones de parámetros únicos. La entrada se tokeniza a nivel de base con un vocabulario de nucleótidos y una ventana máxima de 1.024 pb; los caracteres no ACGT se mapean a `[UNK]` y las secuencias más cortas se rellenan.

El ajuste fino se realizó con LoRA de rango 8, alpha 32 y dropout 0,1 aplicado a las proyecciones `in_proj` y `out_proj` de las capas Mamba, con AdamW, tasa de aprendizaje 1e-5 con decaimiento coseno, 2.501 pasos de calentamiento, weight decay 0,01, recorte de gradiente 0,5 y precisión bfloat16 con semilla 42. El entrenamiento efectivo fue de 25.008 pasos de optimización con 192 ventanas por paso (24 ventanas por dispositivo × 8 pasos de acumulación), sobre ventanas de 1.024 pb extraídas de los ensamblados Guy11, Br36 y Br62 de *Pyricularia*. El cromosoma 6 de Br62 se excluyó completamente del entrenamiento por presentar un centrómero menos similar al resto. Una particularidad técnica relevante es que las ramas directa y reverso-complementaria llevan pesos LoRA separados, por lo que no debe invocarse `merge_and_unload()` sobre el adaptador: fusionar ambos conjuntos en los pesos base compartidos altera las predicciones.

## Capacidades

- Clasificación binaria de ventanas de ADN de 1.024 pb en centromérica (1) o no centromérica (0), con salida softmax de dos clases.
- Reconocimiento de secuencia asociada a centrómeros en cromosomas no vistos durante el ajuste fino (evaluación sobre el cromosoma 6 de Br62 retenido).
- Procesamiento de ADN de doble cadena con invariancia aproximada a la orientación gracias a la compartición de parámetros RCPS.
- Inferencia por lotes mediante el script `lora_fine_tune.py` del repositorio FunDLM, con soporte de bfloat16 y tamaño de lote configurable.
- Extracción de probabilidad calibrada (softmax) por ventana, apta para umbralizar o rankear regiones genómicas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de texto, visión o audio: es un clasificador de secuencias especializado.
- Capacidad multilingüe no aplicable; el dominio de entrada es exclusivamente ADN (alfabeto ACGT).

## Casos de uso

- Anotación de centrómeros en genomas fúngicos recién ensamblados: deslizar ventanas de 1.024 pb a lo largo de cada cromosoma y umbralizar la probabilidad de la clase 1 para delimitar candidatos a región centromérica, útil cuando no se dispone de datos CENP-A (ChIP-seq) para la especie.
- Priorización de regiones para validación experimental: usar las ventanas con mayor probabilidad como candidatas antes de lanzar experimentos de inmunoprecipitación de CENP-A, reduciendo el espacio de búsqueda en genomas grandes.
- Control de calidad de ensamblados: detectar regiones con señal centromérica anómala o ausente que puedan indicar colapsos o mal ensamblado en zonas repetitivas.
- Estudio comparativo de evolución de centrómeros: aplicar el adaptador a múltiples ensamblados de *Pyricularia* y comparar la distribución espacial de las predicciones entre cepas, aprovechando que el modelo se entrenó con Guy11, Br36 y Br62.
- Filtrado de librerías genómicas: descartar o etiquetar ventanas centroméricas antes de entrenar otros modelos de ADN, evitando que regiones repetitivas y rápidamente evolutivas dominen el conjunto de entrenamiento.
- Búsqueda de homólogos de región centromérica: puntuar ventanas candidatas en especies relacionadas para identificar secuencias con señal centromérica conservada, con la cautela de que el modelo se entrenó solo con *Pyricularia*.
- Integración en pipelines de anotación genómica por lotes: el script `lora_fine_tune.py predict` acepta un Parquet tokenizado y produce un CSV de predicciones, lo que permite procesar genomas completos de forma reproducible con semilla fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el conjunto de evaluación (68.168 ventanas del cromosoma 6 de Br62, de las cuales 33.166 son centroméricas y 35.002 no centroméricas) y advierte de que las ventanas centroméricas de test son teselas de 3 pb de un único centrómero de aproximadamente 100,5 kb, por lo que se solapan casi por completo y los intervalos de confianza a nivel de ventana subestiman la incertidumbre real. No se proporcionan métricas numéricas (exactitud, F1, AUC) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 88M parámetros; en bfloat16 ocupa aproximadamente 0,18 GB de pesos, más el adaptador LoRA (rango 8, despreciable) y las activaciones de la ventana de 1.024 pb. En la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU CUDA moderna; el ejemplo oficial asume CUDA y bfloat16. Funciona en A100, H100, L4, A10 y en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4060 Ti.
- Cabe en GPU de consumo: sí, con margen amplio; también puede ejecutarse en CPU casteando el modelo a `float()` y omitiendo el bloque de autocast, aunque con mayor latencia.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que se trata de un modelo de espacio de estados con código personalizado (`trust_remote_code=True`) y kernels Mamba. El despliegue previsto es PyTorch + transformers 4.49.0 + peft 0.14.0 + `mamba_ssm` + `causal_conv1d`, o el CLI del repositorio FunDLM.
- Latencia y throughput estimados: no disponible en la información proporcionada. El entrenamiento usó lotes de 24 ventanas por dispositivo con acumulación de 8; para inferencia por lotes la model card sugiere `--batch_size 32`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni comparaciones con otros clasificadores de centrómeros o modelos de lenguaje de ADN (por ejemplo, DNABERT, Nucleotide Transformer o PlantCAD2, este último citado solo como referencia de instalación). La comparación cuantitativa con alternativas no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- Dominio de entrenamiento restringido a tres ensamblados de *Pyricularia* (Guy11, Br36, Br62); el rendimiento en otras especies fúngicas o en eucariotas superiores no está caracterizado y probablemente degrade.
- El conjunto de test tiene fuga estructural: las 33.166 ventanas centroméricas son teselas de 3 pb de un único centrómero de unos 100,5 kb, por lo que se solapan casi por completo; las métricas a nivel de ventana sobrestiman la capacidad de generalización y los intervalos de confianza son engañosos.
- Los centrómeros se definen epigenéticamente por CENP-A y no por secuencia conservada; el modelo detecta correlatos de secuencia, no la marca epigenética, y puede fallar en centrómeros sin señal de secuencia aprendida.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- No debe aplicarse `merge_and_unload()` al adaptador: las ramas directa y reverso-complementaria tienen pesos LoRA separados y la fusión altera las predicciones.
- Requiere `trust_remote_code=True` y kernels Mamba (`mamba_ssm`, `causal_conv1d`) compilados contra la versión de CUDA; la instalación es más frágil que la de un transformer estándar.
- Entrada estrictamente limitada a 1.024 pb; secuencias más largas deben trocearse y agregarse externamente, y los caracteres no ACGT se mapean a `[UNK]`, lo que puede degradar la señal en regiones con ambigüedades de ensamblado.
- Riesgo de alucinación en el sentido de falsos positivos: un clasificador softmax siempre produce una probabilidad, incluso para secuencias sin relación biológica con centrómeros; se recomienda calibrar el umbral con datos propios.
- Sin datos publicados de sesgo, robustez frente a errores de secuenciación o comportamiento fuera de distribución más allá de la advertencia sobre el conjunto de test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantG3/FunDLM-Small-1024bp-Centromere
- Modelo base: https://huggingface.co/gnikesh/FunDLM-Small-1024bp
- Repositorio FunDLM (script de ajuste fino y predicción): https://github.com/PlantG3/funDLM/blob/main/src/finetune/lora_fine_tune.py
- Instrucciones de instalación de referencia (PlantCAD2): https://github.com/plantcad/plantcad/blob/main/docs/local-install.md
