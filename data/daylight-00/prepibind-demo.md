# daylight-00/prepibind-demo

## Resumen

PREpiBind es un modelo de predicción de unión de epítopos a moléculas del complejo mayor de histocompatibilidad (MHC) de clase II. Lo desarrolla el usuario daylight-00 y se publica bajo licencia MIT. El repositorio `daylight-00/prepibind-demo` contiene cuatro checkpoints de demostración en float16 (106,5 MiB cada uno) que son una conversión (`tensor.half()`) de los pesos float32 del release de investigación, sin cuantización ni poda. Se usan por defecto en los cuadernos, la demo de Colab y los scripts `configs/predict/*.py` del repositorio de código.

Cada checkpoint contiene 55.820.161 parámetros en 64 tensores float16 y va acompañado del modelo de lenguaje proteico ESMC-300m (`daylight-00/esmc-300m-2024-12`) como extractor de representaciones. El modelo resuelve una tarea de clasificación tabular: recibe un fichero CSV con columnas MHC y Epitope y devuelve las mismas filas con `Logits` y `Score` (sigmoide) añadidos.

Existen cuatro brazos según el tipo de dato biológico: ensayos de unión cualitativos, ligandos eluidos por espectrometría de masas e IC50 con dos umbrales (< 500 nM y < 1000 nM). La relevancia práctica está en el cribado computacional de candidatos inmunológicos antes de validación experimental. Conviene señalar que la propia model card indica que, en el momento de su redacción, los ficheros existían en local y no se habían subido a HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación sobre embeddings del modelo de lenguaje proteico ESMC-300m; sin codificación posicional |
| Parametros totales | 55.820.161 por checkpoint (el backbone ESMC-300m se distribuye aparte) |
| Longitud de contexto | No aplicable en el sentido habitual; la entrada es un par MHC-epítopo (epítopos de 15 aminoácidos en entrenamiento) |
| Tipos de cuantizacion | No se aplica cuantización ni poda; los checkpoints demo son `tensor.half()` del release float32. Precisión publicada: float16 (demo) y float32 (investigación) |
| Idiomas soportados | No aplicable (modelo de secuencias proteicas, no de lenguaje natural); no disponible como idioma |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt`, un `state_dict` con clave única `model_state_dict` de 64 tensores float16 |
| Modelo base | ESMC-300m (`daylight-00/esmc-300m-2024-12`) |
| Tarea (pipeline) | `tabular-classification` |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

PREpiBind combina representaciones de un modelo de lenguaje proteico (ESMC-300m) con una cabeza de clasificación entrenada para predecir la unión entre un epítopo y una molécula MHC de clase II. La cabeza no tiene codificación posicional, de modo que el orden de las dos cadenas MHC en la entrada no altera la puntuación, aunque los conjuntos de datos y la demo escriben primero la cadena beta y luego la alfa para mantener la comparabilidad con las entradas publicadas. La salida es un logit y su sigmoide (score) para cada par.

El entrenamiento se organiza en cuatro brazos (ensayos cualitativos, ligandos eluidos por espectrometría de masas, IC50 con umbral < 500 nM e IC50 con umbral < 1000 nM). Cada brazo se entrenó como 15 ejecuciones: tres semillas (42, 100 y 128) por cinco particiones de validación cruzada. Todas las cifras del artículo son medias sobre esas 15 ejecuciones; el checkpoint publicado es una sola ejecución, la de menor pérdida de validación (`val_loss`) de su brazo. El brazo de espectrometría de masas se entrenó desde un `train.csv` de 77.954 filas.

El criterio de selección fue exclusivamente la `val_loss`. La model card advierte de que el `Val ROC-AUC` de los registros de entrenamiento no es válido: `train.py` llama a su propia función `roc_auc_score(outputs, labels)` con los argumentos intercambiados, por lo que el 21,7 % de los valores registrados cae fuera de [0, 1] y nunca se utilizó. La columna de `val_loss` se recalculó el 2026-09-10 a partir de `analysis/val_metrics.csv`; la corrección cambió una selección (el brazo de espectrometría pasó de semilla 100, partición 1, a semilla 128, partición 3). No se documenta en la información disponible el uso de RLHF o DPO, algo esperable dado que no es un modelo generativo.

## Capacidades

- Clasificación binaria de unión péptido-MHC de clase II: devuelve un logit y un score sigmoide por par MHC-epítopo.
- Procesamiento por lotes de entradas tabulares: acepta un CSV con columnas `MHC` y `Epitope` y devuelve esas columnas más `Logits` y `Score`.
- Cuatro cabezas especializadas según el tipo de evidencia experimental: unión cualitativa, ligandos eluidos por espectrometría de masas, IC50 < 500 nM e IC50 < 1000 nM.
- Cobertura de alelos del store de demostración: 116 alelos (98 cadenas HLA de clase II humanas y 18 cadenas H2 de ratón), cortados a la ventana de unión al péptido.
- Integración con el backbone ESMC-300m para codificar epítopos en tiempo de ejecución.
- No genera texto, no realiza razonamiento multi-paso, no soporta tool calling ni function calling, no funciona como agente y no tiene capacidades multimodales ni de audio.
- No es multilingüe en el sentido de lenguaje natural: opera sobre secuencias de aminoácidos, no sobre idiomas.

## Casos de uso

- Priorización de epítopos para vacunas: dado un panel de péptidos candidatos y los alelos HLA de clase II de interés, el modelo puntúa la unión de cada par y permite ordenar y filtrar candidatos antes de ensayos de laboratorio.
- Predicción de neoantígenos en cáncer: a partir de mutaciones traducidas a péptidos, se evalúa la afinidad predicha frente a los alelos HLA del paciente para seleccionar candidatos a inmunoterapia.
- Análisis de inmunogenicidad de antígenos: para una proteína completa, se generan péptidos solapantes y se filtran los que superan un umbral de score, reduciendo el espacio de validación experimental.
- Triaje de datos de espectrometría de masas: el brazo `ms` (umbral de pérdida de validación 0,12274) puede usarse para priorizar ligandos eluidos antes de su confirmación.
- Estimación de afinidad tipo IC50: los dos brazos con umbral de 500 nM y 1000 nM permiten clasificar candidatos en categorías de unión fuerte o débil según el punto de corte elegido.
- Investigación preclínica en modelos murinos: el store incluye 18 cadenas H2 de ratón, lo que permite aplicar el modelo a experimentos en ratón con los mismos flujos de trabajo.
- Integración en pipelines bioinformáticos: al ser una tarea de clasificación tabular que consume y produce CSV, se puede encadenar en scripts de Python junto a otras herramientas de análisis de secuencias.
- Docencia y demostración: la demo de Colab ejecuta el modelo en una GPU T4 gratuita con un consumo de memoria pico de 1,95 GiB, lo que facilita su uso en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares, que por otra parte no aplican a esta tarea). La única métrica de rendimiento disponible es la pérdida de validación de cada brazo:

| Brazo | Semilla | Particion | val_loss |
|---|---|---|---|
| Ensayos de unión cualitativos | 100 | 0 | 0,35582 |
| Ligandos eluidos por espectrometría de masas | 128 | 3 | 0,12274 |
| IC50, umbral < 500 nM | 128 | 2 | 0,46631 |
| IC50, umbral < 1000 nM | 42 | 1 | 0,49456 |

Fidelidad del camino float16 de demostración frente al camino `as-trained`, medida sobre 2.000 filas:

| Metrica | Valor |
|---|---|
| Diferencia absoluta media en el score | 0,0031 |
| Peor caso | 0,0619 |
| Correlación de Spearman | 0,99985 |
| Memoria GPU pico (float16) | 1,95 GiB |
| Memoria GPU pico (as-trained) | 2,95 GiB |

## Requisitos de hardware

- VRAM estimada: 1,95 GiB de memoria GPU pico en el camino float16 de demostración, frente a 2,95 GiB en el camino `as-trained`, medido sobre 2.000 filas de demo.
- GPU compatible: la demo funciona en la GPU T4 del nivel gratuito de Colab. Al ser anterior a Ampere, flash-attn queda desactivado y el entorno lo indica al descartarlo.
- En consumer GPU: cabe con holgura en cualquier GPU de consumo con al menos 2-3 GiB de VRAM libres; la información disponible no especifica modelos concretos como RTX 4090, A100 o H100, por lo que su comportamiento en ellos queda no disponible.
- Opciones de despliegue: PyTorch (librería declarada), scripts `configs/predict/*.py` del repositorio de código y el cuaderno `demo/run_colab.ipynb`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, coherente con que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la información proporcionada; comparar con otros predictores de unión MHC de clase II requeriría métricas que no se han facilitado. La única comparación con datos disponibles es interna, entre los cuatro brazos de este release y frente a su hermano en float32:

| Version | Precision | Tamano por checkpoint | Uso recomendado |
|---|---|---|---|
| `daylight-00/prepibind-demo` | float16 | 106,5 MiB | Pruebas, cuadernos y demo de Colab |
| `daylight-00/prepibind` | float32 | 213,0 MiB | Resultados destinados a publicación |

Entre los cuatro brazos, el de espectrometría de masas presenta la `val_loss` más baja (0,12274) y el de IC50 con umbral < 1000 nM la más alta (0,49456), pero no son comparables entre sí porque resuelven tareas y conjuntos de datos distintos.

## Limitaciones y advertencias

- La versión float16 no reproduce bit a bit la ruta de investigación por dos motivos aceptados explícitamente: se ejecuta en media precisión (cabeza y ESMC en float16, frente a cabeza float32 y ESMC bfloat16 en investigación) y codifica los epítopos con ESMC en tiempo de ejecución en lugar de leer el store precalculado que usaron el entrenamiento y la evaluación del artículo.
- La conversión a float16 altera las puntuaciones individuales en el tercer decimal (diferencia absoluta media 0,0031); una de cada 2.000 filas se movió 0,06. Si una decisión depende de ese margen, hay que usar los checkpoints float32 y la precisión `as-trained`.
- Un único checkpoint no reproduce las cifras del artículo: cada número publicado es una media sobre 15 ejecuciones, y el checkpoint liberado es solo una de ellas.
- El `Val ROC-AUC` de los registros de entrenamiento no es fiable: el 21,7 % de los valores cae fuera de [0, 1] por un error de argumentos intercambiados en `train.py`. No debe usarse como métrica.
- Todos los epítopos de entrenamiento son 15-meros; otras longitudes se ejecutan pero quedan fuera de la distribución de entrenamiento.
- La model card indica que los ficheros existían en local y no se habían subido a HuggingFace en el momento de su redacción. El repositorio figura con 0 descargas y 0 likes, por lo que conviene verificar la disponibilidad real de los pesos antes de integrarlos.
- Sesgos conocidos: no disponibles en la información proporcionada. La cobertura se limita a los alelos del store de demo (98 cadenas HLA de clase II humanas y 18 cadenas H2 de ratón); los alelos fuera de ese conjunto no tienen garantía de funcionamiento.
- Licencia MIT: permite uso comercial y modificación, pero se ofrece sin garantía. No se documentan restricciones adicionales.
- Es un clasificador de unión, no un modelo generativo: no debe emplearse para generación de texto, agentes ni tareas de lenguaje natural.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/daylight-00/prepibind-demo
- Release de investigación en float32: https://huggingface.co/daylight-00/prepibind
- Backbone ESMC-300m: https://huggingface.co/daylight-00/esmc-300m-2024-12
- Código fuente: https://github.com/daylight-00/PREpiBind
- Cuaderno de Colab: `demo/run_colab.ipynb` dentro del repositorio de código
- Plan de publicación de los checkpoints: `tools/release/upload_plan.md` dentro del repositorio de código
