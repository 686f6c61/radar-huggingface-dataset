# PlantG3/FunDLM-Medium-1024bp-Mini

## Resumen

FunDLM-Medium-1024bp-Mini es un adaptador LoRA de clasificación de secuencias de ADN publicado por PlantG3 junto con el artículo de FunDLM. Se monta sobre el modelo de lenguaje genómico de hongos FunDLM-Medium-1024bp (desarrollado por gnikesh) y resuelve una tarea binaria muy concreta: distinguir si una ventana de 1.024 pares de bases pertenece a un mini-cromosoma (clase 1) o a un cromosoma central (clase 0). Los mini-cromosomas, también llamados supernumerarios o accesorios, son cromosomas pequeños, ricos en repeticiones y pobres en genes que en hongos fitopatógenos del género *Pyricularia* pueden portar genes efectoras de virulencia.

El interés práctico del modelo está en que generaliza a aislamientos no vistos durante el ajuste fino: el conjunto de test se compone de cuatro cepas (Br62, G239, O137 y JP37) excluidas del entrenamiento. Esto lo convierte en una herramienta útil para anotar genomas fúngicos nuevos sin necesidad de ensamblados completos ni de alineamientos contra referencias.

Técnicamente, el modelo base es una arquitectura Caduceus: un transformer bidireccional con backbone de espacio de estados Mamba-2, 64 capas, dimensión de modelo 768 y 471 millones de parámetros únicos, con compartición de parámetros entre la hebra directa y la reversa complementaria. El adaptador añade un rango LoRA de 8 sobre las proyecciones `in_proj` y `out_proj` de Mamba. La longitud de entrada está fijada en 1.024 pb.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Caduceus: transformer bidireccional con backbone Mamba-2 y compartición de parámetros reverse-complement (RCPS) |
| Parámetros totales | 471 M en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos (r = 8) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 pb (longitud máxima de entrada) |
| Tipos de cuantización | no disponible (el checkpoint base se distribuye en bfloat16) |
| Idiomas soportados | no aplica (secuencias de ADN; alfabeto ACGT, caracteres no ACGT mapeados a `[UNK]`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter/adapter_model.safetensors`), `pytorch_model.bin` para el base, `config.json` y código custom (`modeling_caduceus.py`, `modeling_rcps.py`) |

## Arquitectura y entrenamiento

El modelo base, FunDLM-Medium-1024bp, es un Caduceus de 64 capas con `d_model` 768 y 471 M de parámetros únicos. Caduceus sustituye la atención por bloques Mamba-2 bidireccionales y aplica compartición de parámetros entre la rama directa y la rama reverse-complement, de modo que la representación de una secuencia y la de su reverso complementario quedan ligadas por construcción. El adaptador LoRA (r = 8, alpha = 32, dropout = 0.1) se aplica sobre las proyecciones `in_proj` y `out_proj` de Mamba, con pesos separados para cada rama RC; por eso el autor advierte explícitamente de que no debe llamarse a `merge_and_unload()`, ya que fusionar ambas ramas en los pesos compartidos altera las predicciones.

El ajuste fino usó ventanas de 1.024 pb procedentes de seis ensamblados de *Pyricularia* empleados para entrenar MiniC: 70-15, B71Ref2, MZ5-1-6, LpKY97, O135 y TF05. Las secuencias de cromosoma central y de mini-cromosoma se trocearon con pasos distintos para equilibrar las clases y se eliminaron las ventanas con alineamiento fiable a secuencia compartida entre ambos compartimentos, lo que dejó 13.655.061 ventanas de entrenamiento y 718.688 de validación. El entrenamiento usó AdamW con learning rate 1e-4, decaimiento coseno, 2.700 pasos de warm-up, weight decay 0.01, clipping de gradiente 1.0, bfloat16 y semilla 42; con 16 ventanas por dispositivo y 32 pasos de acumulación de gradiente (512 ventanas por paso de optimización) se completaron 27.000 pasos, equivalentes a una pasada sobre el conjunto de entrenamiento. El checkpoint publicado es `checkpoint-27000`.

## Capacidades

- Clasificación binaria de ventanas de ADN de 1.024 pb en mini-cromosoma (1) o cromosoma central (0), con salida softmax de dos clases.
- Generalización a aislamientos no vistos: el test se realizó sobre Br62, G239, O137 y JP37, ausentes del ajuste fino.
- Procesamiento de secuencias con caracteres no ACGT, que el tokenizador mapea a `[UNK]`, lo que permite alimentar ensamblados sin limpieza exhaustiva del alfabeto.
- Predicción por lotes mediante el CLI del repositorio FunDLM (`src/finetune/lora_fine_tune.py`), con soporte de `--batch_size` y `--bf16`.
- Integración con el ecosistema Hugging Face Transformers y PEFT (`AutoModelForSequenceClassification`, `PeftModel`), con `trust_remote_code=True` para cargar el código Caduceus.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador de secuencias, no un modelo generativo de propósito general.
- Capacidad multilingüe no aplicable: el dominio de entrada es ADN, no lenguaje natural.

## Casos de uso

- Anotación de ensamblados fúngicos nuevos: pasar ventanas solapadas de 1.024 pb de un ensamblado de *Pyricularia* por el clasificador y agregar las probabilidades por contig para identificar candidatos a mini-cromosoma antes de recurrir a métodos de cobertura o composición.
- Priorización de genes efectoras: los mini-cromosomas de hongos blast portan efectores; clasificar regiones como mini permite acotar las zonas del genoma donde buscar candidatos de virulencia.
- Control de calidad de ensamblados: detectar contigs con señal mini-cromosómica inesperada en aislamientos donde se asumía ausencia de supernumerarios, o al contrario, verificar que un contig asignado a mini lo es de verdad.
- Estudios comparativos de cepas: aplicar el adaptador a los seis aislamientos de referencia y a nuevos aislamientos para cuantificar la fracción de genoma mini-cromosómico y su variación entre cepas.
- Filtrado previo en pipelines de genómica: usar la probabilidad de mini como característica de entrada en modelos posteriores de clasificación de contigs o de predicción de patogenicidad.
- Investigación en clasificación de secuencias genómicas: servir de línea base reproducible (LoRA r = 8 sobre Caduceus) para comparar con otros adaptadores o con modelos de lenguaje genómico de mayor tamaño en la misma tarea.
- Análisis de secuencias cortas en metagenómica fúngica: clasificar fragmentos de 1.024 pb procedentes de reads largos o de ensamblados parciales cuando no se dispone del cromosoma completo.

## Benchmarks y rendimiento

La model card incluye una sección de evaluación sobre un conjunto de test retenido de 162.080 ventanas no solapadas de 1.024 pb procedentes de cuatro aislamientos no usados en el ajuste fino (Br62, G239, O137 y JP37), de las cuales 4.551 (2,8 %) son mini-cromosómicas. Sin embargo, la tabla de métricas de la información proporcionada está truncada y no incluye los valores numéricos.

| Métrica | Valor |
|---|---|
| Conjunto de test | 162.080 ventanas de 1.024 pb, 4 aislamientos no vistos (Br62, G239, O137, JP37) |
| Prevalencia de mini-cromosoma en test | 4.551 ventanas (2,8 %) |
| Métricas (accuracy, F1, AUROC, etc.) | no disponibles (tabla truncada en la información proporcionada) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 471 M de parámetros; en bfloat16 ocupa aproximadamente 0,9-1,0 GB de pesos, y en float32 alrededor de 1,9 GB. El repositorio completo pesa 1,0 GB, coherente con pesos en bfloat16 más el adaptador.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para inferencia en bfloat16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El cuello de botella no es la memoria sino la compilación de los kernels de Mamba.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con soporte CUDA (GTX 16xx en adelante, con la salvedad de los requisitos de `mamba_ssm` y `causal_conv1d`).
- Opciones de despliegue: Hugging Face Transformers 4.49.0 con PEFT 0.14.0 y `trust_remote_code=True`; requiere `mamba_ssm` y `causal_conv1d` compilados con `--no-build-isolation`. También es posible ejecutar en CPU casteando el modelo con `model.float()` y sin el bloque de autocast, aunque con latencia mucho mayor.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El CLI de predicción permite `--batch_size 32` con `--bf16 True`, pero no se publican cifras de ventanas por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FunDLM-Medium-1024bp-Mini | 471 M (base) + LoRA r = 8 | 1.024 pb | Clasificación binaria mini/core | no disponible | Hugging Face (PlantG3) |
| FunDLM-Medium-1024bp | 471 M | 1.024 pb | Modelo base genómico (representaciones) | no disponible | Hugging Face (gnikesh) |
| MiniC | no disponible | no disponible | Clasificación mini-cromosoma en *Pyricularia* | no disponible | Referenciado en la model card como origen de los datos |
| PlantCAD2 | no disponible | no disponible | Genómica vegetal (referencia de instalación) | no disponible | GitHub (plantcad) |

La información proporcionada no incluye parámetros, contexto ni resultados de MiniC o PlantCAD2, por lo que la comparación cuantitativa no está disponible. FunDLM-Medium-1024bp-Mini se distingue por ser un adaptador LoRA específico de una tarea y un género fúngico, mientras que el modelo base es de propósito más general dentro del dominio genómico.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con ensamblados de *Pyricularia* (seis cepas); su comportamiento en otros géneros fúngicos o en eucariotas superiores no está validado.
- Longitud fija: solo acepta ventanas de 1.024 pb; secuencias más cortas se rellenan y más largas se truncan, lo que puede degradar la clasificación de regiones límite.
- Desequilibrio de clases extremo en test (2,8 % de mini-cromosomas): la accuracy sola puede ser engañosa; conviene evaluar con precisión, recall y AUROC sobre la clase minoritaria, métricas que no están disponibles en la información proporcionada.
- No debe llamarse a `merge_and_unload()`: las ramas forward y reverse-complement tienen pesos LoRA separados y fusionarlos cambia las predicciones.
- Dependencia de kernels Mamba (`mamba_ssm`, `causal_conv1d`) compilados contra la versión de CUDA y PyTorch; la instalación es más frágil que la de un transformer estándar.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación, especialmente en ventanas con baja cobertura o con secuencia compartida entre compartimentos.
- Sesgos potenciales derivados del conjunto de entrenamiento: las seis cepas de *Pyricularia* pueden no representar la diversidad de mini-cromosomas en otras poblaciones del patógeno.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso independiente ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantG3/FunDLM-Medium-1024bp-Mini
- Modelo base: https://huggingface.co/gnikesh/FunDLM-Medium-1024bp
- Repositorio FunDLM (script de ajuste fino y predicción): https://github.com/PlantG3/funDLM/blob/main/src/finetune/lora_fine_tune.py
- Guía de instalación de referencia (PlantCAD2): https://github.com/plantcad/plantcad/blob/main/docs/local-install.md
