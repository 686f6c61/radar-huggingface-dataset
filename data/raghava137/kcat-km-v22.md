# raghava137/kcat-km-v22

## Resumen

kcat-km-v22 es un modelo predictivo de parámetros cinéticos enzimáticos publicado por el usuario raghava137 en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de un pipeline híbrido que estima la constante catalítica (kcat) y la constante de Michaelis (Km) de pares enzima-sustrato a partir de la secuencia proteica y la estructura química del sustrato. El repositorio ocupa 0,2 GB y se distribuye principalmente en formato ONNX junto con modelos LightGBM serializados en texto.

La arquitectura combina un extractor de características basado en ESM2-35M (Meta AI, exportado a ONNX por Xenova) para las secuencias proteicas, con descriptores químicos RDKit y fingerprints de Morgan para los sustratos. Sobre esas características se aplican modelos LightGBM por objetivo, complementados con una tabla de búsqueda de valores publicados extraídos de CatPred-DB, BRENDA 2026.1, DLKcat y EnzyExtractDB. El modelo está pensado para ejecutarse en CPU, lo que lo hace accesible sin GPU.

Es relevante en el contexto de la enzimología computacional y el diseño de enzimas, donde predecir kcat y Km con precisión es un cuello de botella para el cribado de mutantes y la ingeniería metabólica. La versión v22 es una simplificación de la v4 (sin ensemble, sin ajuste intra-enzima y sin características de Swiss-Prot ni Rhea), con una ligera pérdida de rendimiento en validación cruzada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: ESM2-35M (ONNX) + descriptores RDKit + LightGBM + tabla de búsqueda |
| Parametros totales | No disponible (ESM2-35M: ~35 M; LightGBM: no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es modelo de lenguaje); secuencias truncadas a 510 residuos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de predicción numérica, no textual) |
| Licencia | No disponible |
| Formato de pesos | ONNX (ESM2-35M), LightGBM en texto (`fallback_kcat.txt`, `fallback_km.txt`, `stacker_kcat.txt`), Parquet (`lookup_table.parquet`), JSON (`config.json`) |

## Arquitectura y entrenamiento

El pipeline se compone de tres capas. La primera extrae características: para la proteína, un embedding medio de ESM2-35M sobre los primeros 510 residuos más el logaritmo de la longitud de la secuencia; para el sustrato, un fingerprint de Morgan de 1024 bits más 9 descriptores RDKit. La segunda capa es un modelo de respaldo (fallback): un LightGBM por objetivo entrenado con datos de la competición más datos públicos de CatPred-DB, DLKcat (ponderado a 0,5) y EnzyExtractDB (ponderado a 0,25), incluyendo filas públicas de las enzimas de validación. La tercera capa es una tabla de búsqueda de valores publicados (CatPred-DB, BRENDA 2026.1, DLKcat, EnzyExtractDB), emparejada por secuencia de enzima e InChIKey del sustrato, o por el esqueleto del InChIKey (primeros 14 caracteres) cuando no hay coincidencia exacta.

La combinación final es específica por objetivo: para Km se usa el valor publicado cuando existe; para kcat, un pequeño LightGBM (`stacker_kcat.txt`) combina los valores publicados con la predicción de respaldo, gestionando además valores de SABIO-RK almacenados por hora en lugar de por segundo. Los pares no presentes en la tabla reciben directamente la predicción del modelo de respaldo. Respecto a la v4, esta versión elimina el ensemble, el ajuste intra-enzima y las características de Swiss-Prot y Rhea, con una caída de rendimiento en pliegues de validación: kcat 0,700 / 0,668 frente a 0,720 / 0,698 de la v4, y Km 0,817 / 0,802 frente a 0,836 / 0,811. No se documenta el número de tokens ni un proceso de RLHF/DPO, al no ser un modelo generativo.

## Capacidades

- Predicción de log10(kcat) y log10(Km) para pares enzima-sustrato a partir de secuencia proteica y SMILES del sustrato.
- Extracción de embeddings proteicos con ESM2-35M en CPU mediante ONNX.
- Cálculo de descriptores químicos con RDKit (fingerprint de Morgan de 1024 bits y 9 descriptores adicionales).
- Recuperación de valores publicados mediante tabla de búsqueda con coincidencia exacta por InChIKey y coincidencia por esqueleto (primeros 14 caracteres).
- Gestión de valores de SABIO-RK expresados por hora en lugar de por segundo mediante el stacker de kcat.
- Ejecución por línea de comandos: `python predict.py --input INPUT.parquet --output OUTPUT.csv`, con columnas de entrada `id, smiles, sequence` y de salida `id, log10_kcat, log10_km`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Cribado de mutantes enzimáticos: dado un conjunto de variantes de una enzima y un sustrato de interés, el pipeline predice kcat y Km en CPU para priorizar experimentalmente las variantes con mejor eficiencia catalítica, usando la tabla de búsqueda cuando la variante silvestre ya está publicada.
- Ingeniería metabólica y de vías: estimar parámetros cinéticos para modelos cinéticos a escala de red (por ejemplo, modelos de tipo GECKO o ETFL) cuando faltan valores experimentales, aprovechando la combinación de valores publicados y predicción de respaldo.
- Anotación de bases de datos enzimáticas: completar campos de kcat y Km ausentes en bases internas cruzando secuencias e InChIKey contra la tabla de búsqueda integrada (BRENDA 2026.1, CatPred-DB, DLKcat, EnzyExtractDB).
- Priorización en diseño de enzimas de novo: filtrar candidatos generados por modelos generativos de proteínas antes de sintetizarlos, descartando aquellos con kcat predicha baja para el sustrato objetivo.
- Análisis de promiscuidad de sustrato: evaluar un mismo enzima frente a múltiples sustratos representados como SMILES para identificar sustratos alternativos con Km favorable.
- Docencia e investigación reproducible: ejecutar el pipeline completo en un portátil sin GPU gracias al uso de ESM2-35M en ONNX y LightGBM, facilitando la reproducción de experimentos en entornos con recursos limitados.
- Integración en pipelines bioinformáticos: el formato de entrada/salida en Parquet y CSV permite encadenarlo con herramientas de análisis de datos y con flujos de trabajo en Snakemake o Nextflow.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las puntuaciones en pliegues de validación retenidos (held-out folds), comparadas con la versión v4 del mismo autor:

| Metrica | kcat (pliegue 1 / pliegue 2) | Km (pliegue 1 / pliegue 2) |
|---|---|---|
| kcat-km-v22 | 0,700 / 0,668 | 0,817 / 0,802 |
| kcat-km-v4 (referencia) | 0,720 / 0,698 | 0,836 / 0,811 |

No se especifica la métrica exacta (probablemente correlación o R², pero no se confirma en la información disponible). No se han publicado resultados frente a benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU: el pipeline está diseñado para ejecutarse sin GPU; ESM2-35M se ejecuta en ONNX en CPU y LightGBM es eficiente en CPU.
- VRAM estimada: no aplica en el flujo documentado; si se ejecutara ESM2-35M en GPU, cabría holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se documentan; el modelo no las requiere.
- Cabe en GPU consumer: sí, aunque el flujo oficial es CPU.
- Opciones de despliegue: ejecución directa con `predict.py`; ONNX Runtime para ESM2-35M; LightGBM nativo para los modelos de respaldo y el stacker.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 0,2 GB, lo que incluye el ONNX de ESM2-35M y los modelos LightGBM.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v22 | Híbrido ESM2 + LightGBM + lookup | Secuencia + SMILES | log10_kcat, log10_km | No disponible | Hugging Face |
| kcat-km-v4 (mismo autor) | Híbrido con ensemble y features adicionales | Secuencia + SMILES | log10_kcat, log10_km | No disponible | Hugging Face (referenciado) |
| DLKcat | Red neuronal sobre grafos | Secuencia + SMILES | kcat | No disponible en la información | Fuente de datos citada |
| CatPred-DB | Base de datos de parámetros cinéticos | No aplica (dataset) | kcat, Km | No disponible en la información | Fuente de datos citada |

No se dispone de datos comparativos de rendimiento frente a DLKcat u otros predictores en la información proporcionada; la única comparación numérica disponible es con la v4 del mismo autor.

## Limitaciones y advertencias

- Modelo de predicción numérica, no generativo: no admite prompts, tool calling ni razonamiento; cualquier uso como modelo de lenguaje es inválido.
- Rendimiento inferior a la v4 en los pliegues de validación publicados (kcat 0,700/0,668 frente a 0,720/0,698; Km 0,817/0,802 frente a 0,836/0,811), por lo que la v22 es una simplificación con coste en precisión.
- Dependencia fuerte de la tabla de búsqueda: para pares no presentes, la predicción recae enteramente en el modelo de respaldo, con precisión potencialmente menor.
- La coincidencia por esqueleto de InChIKey (primeros 14 caracteres) puede asignar valores publicados a sustratos estructuralmente relacionados pero no idénticos, introduciendo error.
- Secuencias truncadas a 510 residuos: enzimas más largas pierden información de la región C-terminal.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de integrarlo en producción.
- Idiomas no aplicables, pero la documentación y el código están en inglés.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado en Hugging Face, lo que sugiere ausencia de validación comunitaria.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones poco fiables fuera de la distribución de los datos de entrenamiento (CatPred-DB, DLKcat, EnzyExtractDB, BRENDA 2026.1, SABIO-RK).
- Las fechas de creación y actualización (2026-11-17) y la referencia a BRENDA 2026.1 deben tratarse con cautela; verificar su coherencia antes de citarlas.

## Enlaces

- Hugging Face: https://huggingface.co/raghava137/kcat-km-v22
- ESM2-35M (Meta AI, exportación ONNX de Xenova): no se proporciona URL directa en la información disponible
- CatPred-DB: no se proporciona URL directa en la información disponible
- BRENDA 2026.1: no se proporciona URL directa en la información disponible
- DLKcat: no se proporciona URL directa en la información disponible
- EnzyExtractDB: no se proporciona URL directa en la información disponible
- SABIO-RK: no se proporciona URL directa en la información disponible
- PubChem: no se proporciona URL directa en la información disponible
- EnzymeMap: no se proporciona URL directa en la información disponible
