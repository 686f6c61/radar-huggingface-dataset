# arnavthorat/final_submission

## Resumen

`arnavthorat/final_submission` es un modelo predictivo de parámetros cinéticos enzimáticos desarrollado por arnavthorat como proyecto final del curso DA3410. Dado un par enzima-sustrato (secuencia proteica y SMILES del sustrato), predice `log10 kcat` (en 1/s) y `log10 Km` (en mM), dos magnitudes centrales en la modelización de reacciones enzimáticas y en biología de sistemas.

No se trata de un modelo de lenguaje generativo ni de un transformer entrenado de extremo a extremo, sino de un sistema de *ensemble* que combina dos aproximaciones sobre un vector de 2.337 características extraídas con encoders congelados (ESM-2 35M para la enzima y MoLFormer-XL para el sustrato), junto con descriptores fisicoquímicos y fingerprints de RDKit. Sobre esas características se entrenan un modelo LightGBM por objetivo y una red neuronal de dos ramas que comparten cabeza de predicción conjunta.

El modelo es relevante para el nicho de la predicción de cinética enzimática a escala, donde métodos como DLKcat o UniKP han establecido referencias. Su interés práctico reside en que el pipeline es reproducible en CPU (3-4 minutos para ~2.000 pares), lo que lo hace accesible para cribados masivos sin GPU. La información pública disponible es escasa: no hay licencia declarada, ni idiomas, ni pipeline de Hugging Face, y el repositorio ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: LightGBM (un modelo por objetivo) + red neuronal de dos ramas con cabeza conjunta, sobre características de encoders congelados (ESM-2 35M y MoLFormer-XL) |
| Parametros totales | No disponible (el modelo entrenado es un ensemble de árboles y una red pequeña; los encoders congelados suman ~35M + ~40M aprox., no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; la secuencia enzimática se trunca a los primeros 510 residuos |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos en formatos cuantizados tipo GGUF) |
| Idiomas soportados | No disponible (modelo específico de dominio, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (encoders), `tree_0.txt`/`tree_1.txt` (LightGBM), `neural.pt` (PyTorch) |

## Arquitectura y entrenamiento

El sistema no es un transformer único, sino un *pipeline* de extracción de características más un *ensemble* de predictores. Para cada par enzima-sustrato se construye un vector de 2.337 dimensiones: embedding de ESM-2 35M promediado sobre residuos (480 dimensiones, primeros 510 residuos), embedding de MoLFormer-XL (768 dimensiones), composición de aminoácidos y caracteres de SMILES más longitudes (56), fingerprint de Morgan de 1024 bits, 8 descriptores de RDKit y un indicador de SMILES inválido (1.033 en total). Ambos encoders permanecen congelados durante el entrenamiento.

Sobre ese vector se entrenan dos modelos: (1) LightGBM con 700 árboles, tasa de aprendizaje 0,04 y 31 hojas, un modelo independiente por objetivo; y (2) una red neuronal pequeña con rama de enzima y rama de molécula que convergen en una cabeza conjunta que predice ambos objetivos. La red se entrena sobre los rangos de las etiquetas, ya que la métrica de evaluación es la correlación de Spearman. La predicción final es la media de ambos modelos. Los datos de entrenamiento combinan el conjunto de entrenamiento original, los *splits* públicos de Leak-CURBER, BRENDA 2026.1 (solo entradas de tipo salvaje), DLKcat y EnzyExtract, sumando aproximadamente 135.000 pares; se eliminaron los pares presentes en las entradas de validación antes del entrenamiento.

## Capacidades

- Predicción de `log10 kcat` (1/s) y `log10 Km` (mM) para pares enzima-sustrato.
- Procesamiento de secuencias proteicas de hasta 510 residuos (truncado explícito).
- Procesamiento de sustratos representados como SMILES, con detección de SMILES inválidos mediante un indicador dedicado.
- Manejo de descriptores fisicoquímicos y estructurales vía RDKit y fingerprints de Morgan.
- Ejecución en CPU sin necesidad de GPU.
- Procesamiento por lotes mediante `predict.py` con entrada en Parquet y salida en CSV.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de visión, audio o *thinking mode*.

## Casos de uso

- Cribado de variantes enzimáticas: dado un conjunto de mutantes de una enzima y un sustrato de interés, el modelo permite estimar `kcat` y `Km` para cada variante y priorizar experimentalmente las más prometedoras, reduciendo el número de ensayos de laboratorio necesarios.
- Anotación de bases de datos metabólicas: para reacciones sin parámetros cinéticos medidos, el modelo puede generar estimaciones que alimenten modelos metabólicos a escala genómica (GEM) o análisis de control metabólico.
- Ingeniería de vías metabólicas: al evaluar el impacto de sustituir una enzima por un ortólogo, el modelo permite comparar `kcat`/`Km` predichos y seleccionar candidatos con mejor ajuste cinético al flujo deseado.
- Diseño de sustratos en química médica: para una enzima diana y una serie de análogos, el modelo estima la afinidad (`Km`) y la tasa de recambio, orientando la optimización de candidatos antes de la síntesis.
- Docencia e investigación metodológica: el pipeline es reproducible en CPU y sirve como referencia para comparar estrategias de representación (embeddings de proteína y molécula congelados frente a *fine-tuning*).
- Filtrado previo en pipelines de aprendizaje automático: como primer paso antes de modelos más costosos, el ensemble puede descartar pares con SMILES inválidos o secuencias fuera de rango y generar predicciones rápidas para grandes lotes de ~2.000 pares en 3-4 minutos.
- Análisis de sensibilidad de descriptores: al descomponer las 2.337 características, el modelo permite estudiar qué descriptores moleculares o regiones de la proteína contribuyen más a la predicción, útil en estudios de interpretabilidad.

## Benchmarks y rendimiento

Los resultados publicados corresponden a validación cruzada de 5 particiones con agrupamiento por identidad de enzima al 50% (familias enzimáticas no vistas), evaluados con correlación de Spearman:

| Datos de entrenamiento | kcat | Km | Media |
|---|---|---|---|
| Solo conjunto de entrenamiento original | 0,429 | 0,647 | 0,538 |
| Conjunto original + datos adicionales | 0,451 | 0,663 | 0,557 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de propósito general.

## Requisitos de hardware

- Inferencia en CPU: el autor indica ~3-4 minutos para ~2.000 filas, sin GPU.
- VRAM estimada: no aplica en el flujo documentado; si se ejecutan los encoders en GPU, ESM-2 35M y MoLFormer-XL caben holgadamente en GPUs de consumo (menos de 8 GB en FP32).
- GPU recomendadas: no especificadas; cualquier GPU con al menos 8 GB permitiría acelerar la extracción de embeddings, aunque el flujo oficial es CPU.
- Compatibilidad con GPU de consumo: sí, en caso de querer acelerar la extracción de características; el *ensemble* de árboles y la red pequeña son ligeros.
- Opciones de despliegue: el repositorio incluye `Dockerfile` y `requirements.txt` para entorno CPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~2.000 pares en 3-4 minutos en CPU según el autor; no se publican cifras de latencia por par ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Objetivos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arnavthorat/final_submission` | Ensemble LightGBM + red sobre embeddings congelados | Secuencia + SMILES | log10 kcat, log10 Km | No disponible | Hugging Face (repo 0,3 GB) |
| DLKcat | Red neuronal sobre grafos moleculares y secuencia | Secuencia + SMILES | kcat | No disponible en la información proporcionada | Usado como fuente de datos de entrenamiento |
| UniKP | Framework unificado de predicción cinética | Secuencia + SMILES | kcat, Km | No disponible en la información proporcionada | Referencia académica |
| CatPred | Predicción de parámetros cinéticos con incertidumbre | Secuencia + SMILES | kcat, Km, Ki | No disponible en la información proporcionada | Referencia académica |

La comparación cuantitativa con DLKcat, UniKP o CatPred no está disponible en la información proporcionada; los únicos números publicados son los de validación cruzada del propio modelo. La principal diferencia metodológica es el uso de encoders congelados más un *ensemble* ligero, en lugar de *fine-tuning* completo de un transformer.

## Limitaciones y advertencias

- Cobertura limitada: el modelo solo se ha evaluado en validación cruzada con familias enzimáticas no vistas; el rendimiento en enzimas o sustratos muy alejados de la distribución de entrenamiento puede degradarse notablemente.
- Truncado de secuencia: solo se consideran los primeros 510 residuos de la enzima, por lo que la información de dominios catalíticos situados más allá de esa posición se pierde.
- SMILES inválidos: el modelo incluye un indicador de SMILES inválido, pero no se documenta el comportamiento de la predicción en ese caso; conviene validar la entrada con RDKit antes de usarlo en producción.
- Licencia no declarada: no se especifica licencia, lo que impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin datos de calibración ni intervalos de confianza: las predicciones son puntuales y no se documenta incertidumbre, lo que limita su uso en decisiones críticas.
- Riesgo de fuga de datos: aunque el autor indica que eliminó pares de validación del entrenamiento, la combinación de múltiples fuentes (BRENDA, DLKcat, EnzyExtract) puede introducir solapamientos no detectados.
- Sesgo hacia enzimas bien caracterizadas: BRENDA y las bases de datos empleadas sobrerrepresentan familias enzimáticas estudiadas intensamente, lo que puede sesgar las predicciones hacia esos grupos.
- Proyecto académico: se trata de un trabajo de curso sin mantenimiento documentado ni versión publicada; la reproducibilidad depende de los archivos incluidos en el repositorio.
- Sin soporte para *tool calling* ni integración como servicio: el uso se limita a la ejecución del script `predict.py` sobre ficheros Parquet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnavthorat/final_submission
- Repositorio del autor en Hugging Face: https://huggingface.co/arnavthorat
- ESM-2 (encoder de proteína): https://huggingface.co/facebook/esm2_t12_35M_UR50D
- MoLFormer-XL (encoder molecular): https://huggingface.co/ibm/MoLFormer-XL-both-10pct
- BRENDA (base de datos enzimática): https://www.brenda-enzymes.org/
- DLKcat: https://github.com/SysBioChalmers/DLKcat
- Leak-CURBER: no disponible en la información proporcionada
- EnzyExtract: no disponible en la información proporcionada
