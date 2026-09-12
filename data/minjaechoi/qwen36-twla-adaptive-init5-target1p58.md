# minjaechoi/qwen36-twla-adaptive-init5-target1p58

## Resumen

`minjaechoi/qwen36-twla-adaptive-init5-target1p58` es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace, derivado de una arquitectura de tipo Mixture-of-Experts identificada con el tag `qwen3_5_moe`. No se trata de un modelo entrenado desde cero, sino de un experimento de optimización de precisión mixta aplicada a los expertos enrutados: según la model card, el proceso TWLA (routed-expert mixed-precision) asigna un nivel de bits distinto a cada unidad de cuantización, donde una unidad equivale a un experto enrutado dentro de una capa MoE. El modelo declara 35.107.181.936 parámetros totales (unos 35,1 mil millones) distribuidos en 40 capas con 256 expertos enrutados cada una, es decir, 10.240 unidades de cuantización independientes.

El interés técnico del checkpoint reside en el objetivo de compresión: la búsqueda se fijó como meta una media de 1,584962500721156 bits por experto enrutado (el logaritmo en base 2 de 3) y finalizó en 1,590685574450879 bits, un valor extremadamente bajo para pesos de un modelo de este tamaño. El criterio de optimización combina la NLL de validación con un término de bits lógicos ponderado por lambda, y el modo de búsqueda empleado se denomina `proxy_prefix`, con nivel inicial 5. Los metadatos de reproducibilidad se almacenan en `optimization_summary.json` y `precision_map.json`, y el autor indica que el código del optimizador y las fuentes de inferencia de GPQA están incluidos en el directorio `code/`.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación con 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. La propia model card especifica que GPQA no se utilizó para calibración, ranking de sensibilidad, asignación, parada ni selección de checkpoint, lo que indica una preocupación explícita por evitar la contaminación de la evaluación, pero también implica que no existe ninguna métrica de calidad publicada junto al checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer; tag `qwen3_5_moe` (40 capas, 256 expertos enrutados por capa) |
| Parámetros totales | 35.107.181.936 (~35,1 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta por experto enrutado (TWLA); objetivo 1,584962500721156 bits/expert, resultado final 1,590685574450879 bits/expert. No se documentan formatos GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 70,2 GB (70.214.363.872 bytes, equivalentes a 65,4 GiB) |
| Unidades de cuantización | 10.240 (40 capas × 256 expertos) |
| Modo de búsqueda | `proxy_prefix`, nivel inicial 5 |
| Metadatos de reproducibilidad | `optimization_summary.json`, `precision_map.json`, directorio `code/` |

## Arquitectura y entrenamiento

La arquitectura es una Mixture-of-Experts con 40 capas y 256 expertos enrutados por capa, según los datos declarados en la model card. El tag `qwen3_5_moe` apunta a la familia Qwen3 MoE como base, aunque la ficha del modelo no confirma el modelo original del que deriva, ni el número de expertos activos por token, ni la dimensión oculta. No hay información sobre el entrenamiento original (número de tokens, composición del dataset, fases de RLHF o DPO), ya que el trabajo publicado es exclusivamente de optimización de precisión sobre un checkpoint preexistente, no de preentrenamiento.

La innovación técnica declarada es el procedimiento TWLA de precisión mixta a nivel de experto: en lugar de cuantizar el modelo con una granularidad uniforme, se busca una asignación de bits por unidad (un experto enrutado en una capa MoE) minimizando la NLL de validación más un término de bits lógicos ponderado por lambda. El resultado es un mapa de precisión heterogéneo, almacenado en `precision_map.json`. Un detalle relevante: el tamaño del repositorio coincide de forma exacta con 35.107.181.936 parámetros almacenados a 16 bits por parámetro, lo que sugiere que los tensores en safetensors se guardan en 16 bits y que el mapa de bits se aplica como paso de cuantización-descuantización previo a la escritura, no como almacenamiento empaquetado de bajo bit. Es una inferencia derivada de los números disponibles, no un dato confirmado por el autor.

## Capacidades

- No se documentan capacidades verificadas en la model card; el pipeline declarado (`image-text-to-text`) sugiere entrada de imagen y texto, coherente con un modelo multimodal de la familia Qwen3, pero no hay confirmación explícita.
- Etiquetas declaradas: `conversational`, `image-text-to-text` y `endpoints_compatible`, lo que indica uso conversacional previsto y compatibilidad con endpoints de inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Modo de razonamiento explícito (thinking), visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

Dado que no hay benchmarks ni documentación funcional publicada, los casos de uso deben entenderse como escenarios propios de un checkpoint de investigación para evaluación interna, no como despliegues en producción.

- Investigación en cuantización extrema: reproducir la asignación de precisión de `precision_map.json` y medir la degradación real de la NLL al aplicar una media de 1,59 bits por experto enrutado, comparando contra el checkpoint sin cuantizar.
- Estudio de sensibilidad por experto: analizar qué expertos concentran los niveles de bits más altos y correlacionarlo con su frecuencia de activación por dominio, para entender qué rutas del enrutador son críticas.
- Validación de pipelines de precisión mixta: usar el directorio `code/` como referencia para comprobar que el optimizador y el criterio de parada (`proxy_prefix`, nivel inicial 5) se reproducen de forma consistente.
- Evaluación comparativa de técnicas de compresión: enfrentar el mapa TWLA a métodos uniformes (por ejemplo, 2 bits por experto) y medir qué estrategia conserva mejor la NLL de validación con el mismo presupuesto de bits.
- Análisis de higiene de evaluación: verificar que la selección del checkpoint no depende de GPQA, dado que el autor lo declara explícitamente y además incluye fuentes de inferencia de GPQA en `code/`.
- Estudio de viabilidad de despliegue: comprobar si el checkpoint resultante cabe en un único acelerador de 80 GB y cuantificar la diferencia de latencia frente a la variante en 16 bits.
- Base para destilación o ajuste posterior: partir de un modelo de 35,1 B con expertos ya comprimidos para experimentar con fine-tuning de bajo rango sobre las capas no enrutadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de MMLU, HumanEval, GSM8K, GPQA ni de perplejidad, y la única mención a GPQA es para aclarar que dicho conjunto no se utilizó en el proceso de optimización ni en la selección del checkpoint.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | No publicado |
| HumanEval | no disponible | No publicado |
| GSM8K | no disponible | No publicado |
| GPQA | no disponible | Excluido deliberadamente del proceso de optimización y selección |
| NLL de validación | no disponible | Se menciona como parte del objetivo, sin valor numérico publicado |

## Requisitos de hardware

- Peso en disco del repositorio: 70,2 GB (65,4 GiB) en safetensors. Coincide con 35.107.181.936 parámetros almacenados a 16 bits.
- VRAM estimada para inferencia en 16 bits: en torno a 65-70 GiB solo para pesos, más caché KV y activaciones. Con 256 expertos por capa, todos los expertos deben residir en memoria, por lo que no se aplica la ventaja habitual de los MoE de activar solo una fracción de los pesos.
- GPU recomendadas: una A100 80 GB o H100 80 GB resulta ajustada; para margen de caché KV y lotes mayores, 2× A100 80 GB o 2× H100 80 GB con tensor parallelism.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), ni en 2× RTX 4090 (48 GB), ni en una RTX 5090 (32 GB) sin una cuantización adicional que no está publicada en el repositorio.
- Opciones de despliegue: la librería declarada es `transformers`. No se confirma soporte de vLLM, SGLang, llama.cpp, Ollama ni TGI; el tag `qwen3_5_moe` implica que un motor de inferencia necesitaría soporte específico para esa arquitectura.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni tamaño de lote recomendado.
- Para ejecutar el modelo en GPU de consumo sería necesario aplicar una cuantización adicional (por ejemplo, 4 bits) sobre los pesos ya almacenados en 16 bits, algo que el autor no documenta ni valida.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa fiable. Se desconoce el modelo base exacto, la licencia, la longitud de contexto y los parámetros activos de este checkpoint, por lo que cualquier comparación numérica sería especulativa.

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen36-twla-adaptive-init5-target1p58 | 35,1 B | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoría (MoE ~30-35 B) | no disponible | no disponible | no disponible | no disponible |

Nota: el tag `qwen3_5_moe` sugiere que el modelo base pertenece a la familia Qwen3 MoE, pero la información proporcionada no confirma la variante concreta ni sus especificaciones, de modo que no se incluyen cifras de terceros que no puedan verificarse con la documentación disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial. En la práctica, el checkpoint debe tratarse como no apto para producción hasta que el autor la especifique.
- Sin resultados de evaluación: no hay ninguna métrica publicada, ni siquiera perplejidad de validación, pese a que la NLL es parte del objetivo de optimización.
- Compresión extrema: una media de 1,59 bits por experto enrutado es un régimen muy agresivo. Es esperable una degradación significativa de la calidad frente al checkpoint original, aunque su magnitud no está cuantificada.
- Riesgo de alucinación: no evaluado y, dado el nivel de cuantización, potencialmente superior al del modelo base. No hay datos al respecto.
- Idiomas: no se declara ningún idioma soportado, por lo que no puede garantizarse un comportamiento correcto en castellano ni en ninguna otra lengua.
- Arquitectura y contexto no documentados: se desconoce la longitud de contexto real, el número de expertos activos por token y la dimensionalidad, lo que impide planificar el consumo de memoria de la caché KV.
- Reproducibilidad limitada: el checkpoint depende de `optimization_summary.json`, `precision_map.json` y el código incluido en `code/`; sin ejecutar ese pipeline no puede verificarse la asignación de bits declarada.
- Advertencia de higiene de evaluación: la model card afirma que GPQA no se usó en ningún paso del proceso, pero el directorio `code/` incluye fuentes de inferencia de GPQA en el mismo workspace. Conviene auditar ese código antes de reutilizar el checkpoint en evaluaciones comparativas.
- Madurez: 0 descargas y 0 likes, publicado y actualizado el mismo día (12 de septiembre de 2026), sin versión revisada ni discusión asociada.
- Naturaleza del artefacto: se presenta explícitamente como «public research checkpoint», no como un modelo listo para uso general.

## Enlaces

- HuggingFace: https://huggingface.co/minjaechoi/qwen36-twla-adaptive-init5-target1p58
- Repositorio de código declarado: directorio `code/` dentro del propio repositorio de HuggingFace
- Metadatos de reproducibilidad: `optimization_summary.json` y `precision_map.json` dentro del repositorio
- Paper, blog o demo del método TWLA: no disponible en la información proporcionada
- Los resultados de búsqueda web obtenidos no contienen información relevante sobre este modelo: todas las entradas recuperadas tratan sobre monederos hardware de criptomonedas de la marca Ledger y no guardan relación con el checkpoint.
