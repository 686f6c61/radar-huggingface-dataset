# adambuttrick/ror-set-point-pair-scorer-baseline

## Resumen

`ror-set-point-pair-scorer-baseline` es un modelo de emparejamiento de afiliaciones institucionales contra el registro ROR (Research Organization Registry), desarrollado por el usuario de Hugging Face `adambuttrick`. No es un modelo generativo ni un LLM conversacional: es el componente *pair scorer* de un sistema de resolución de entidades (entity linking) que asigna a una cadena de afiliación —tal como aparece en un artículo científico— el conjunto de identificadores de instituciones que le corresponden. El modelo parte de `intfloat/multilingual-e5-base` y se reentrena como cross-encoder con una única salida probabilística.

El sistema completo combina generación de candidatos (índice léxico, índice denso, regla de acrónimos y tabla de alias, unos 18 candidatos por cadena), puntuación de pares mediante este cross-encoder y una etapa de selección de conjunto implementada con un clasificador de árboles con boosting de gradiente de 35 características (scikit-learn). El baseline reproduce el diseño de `openalex-affiliation-matcher` v3.0.0 de OurResearch, reentrenado sobre el split de entrenamiento de `affiliations_unseen_institutions` del dataset `adambuttrick/ror-set-point-matching-train-validation-test`.

Su relevancia es práctica: la desambiguación de afiliaciones es un cuello de botella clásico en bibliometría, ciencia de datos académica y pipelines de enriquecimiento de metadatos. El modelo reporta un 79,2 % de exact match y un 93,6 % de precisión en el test de instituciones no vistas, lo que lo convierte en una referencia cuantitativa útil para comparar arquitecturas alternativas (por ejemplo, modelos de conjunto tipo set model) dentro de la misma colección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre transformer `intfloat/multilingual-e5-base`, mean pooling, una salida (probabilidad) |
| Parametros totales | no disponible (el modelo base multilingual-e5-base tiene 278 M; el repo pesa 1,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens de longitud máxima de entrada durante el entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base multilingüe, sin confirmación en la model card) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch), `student.json`, ficheros de tokenizer; el chooser en `model_names.pkl` (scikit-learn 1.9.1) |

## Arquitectura y entrenamiento

El pair scorer es un cross-encoder: se concatenan la cadena de afiliación y el registro candidato, se codifican conjuntamente con `multilingual-e5-base` (mean pooling) y se proyecta a una única logit que se interpreta como probabilidad de emparejamiento. El entrenamiento parte del pair scorer de `openalex-affiliation-matcher` v3.0.0 y usa entropía cruzada binaria, batch de 64 pares, 1 época (9.511 pasos en el modelo final), AdamW con learning rate 2e-5, weight decay 0,01, warm-up lineal del 5 % de los pasos y decaimiento lineal posterior, precisión bf16 con autocast y semilla 1363. Cada ejecución se completó en una única NVIDIA A10G en 31–35 minutos.

Los datos de entrenamiento se dividen en tres bloques: 16.605 pares positivos y 270.134 negativos del split `train` de `affiliations_unseen_institutions`; 321.999 pares de retención procedentes de 17.079 cadenas del config `teacher_judgments` del dataset destilado `ror-set-point-matching-train-validation-test-openalex-jev-distill`; y 308.727 filas candidatas para el chooser. Los pares de retención preservan el conocimiento del pair scorer publicado y excluyen las cadenas del profesor que enlazan con una institución reservada para evaluación. El chooser es un `HistGradientBoostingClassifier` con 35 características, entrenado sobre probabilidades out-of-fold de cinco ejecuciones en validación cruzada; el umbral 0,50 maximiza el exact match sobre las respuestas out-of-fold. El sistema trabaja internamente con identificadores de OpenAlex y los convierte a ROR mediante `data/ror_records` del dataset para la evaluación.

## Capacidades

- Puntuación de pares (cadena de afiliación, registro institucional) con una probabilidad calibrada para decidir si el registro debe incluirse en el conjunto respuesta.
- Resolución de entidades a nivel de conjunto: una misma cadena puede mapear a varias instituciones (afiliaciones múltiples), no solo a una.
- Manejo de variantes de nombre institucional, acrónimos y alias gracias a la etapa de generación de candidatos (índice léxico, índice denso, regla de acrónimos y tabla de alias derivada de las cadenas de entrenamiento).
- Generalización a instituciones no vistas en entrenamiento (evaluación específica sobre `affiliations_unseen_institutions`).
- Capacidad multilingüe potencial heredada de `multilingual-e5-base`, aunque la model card no documenta idiomas ni evaluación por idioma.
- Integración como componente de un pipeline de enriquecimiento de metadatos científicos, no como modelo de propósito general.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Enriquecimiento de metadatos en repositorios institucionales: dado el campo de afiliación en bruto de un registro de publicación, el pipeline devuelve el conjunto de ROR IDs correspondientes, lo que permite normalizar autores y organizaciones en catálogos tipo OpenAlex, Crossref o DataCite.
- Desambiguación en estudios bibliométricos: al analizar colaboración institucional a gran escala, el pair scorer resuelve variantes como "Univ. Politécnica de Madrid" frente a "UPM" contra el registro canónico, con una precisión reportada del 93,6 % en test que acota la propagación de errores en los recuentos.
- Limpieza de bases de datos de publicaciones internas: integrado en un ETL, puntúa cada par candidato y aplica el umbral de 0,50 del chooser para decidir inclusiones, reduciendo la revisión manual a los casos limítrofes.
- Construcción de grafos de conocimiento científico: la salida a nivel de conjunto (varios ROR IDs por cadena) alimenta aristas autor-institución y institución-institución en grafos de citas y colaboración.
- Evaluación comparativa de arquitecturas de entity linking: al ser un baseline reproducible con pesos, datos y particiones publicadas, sirve como referencia para medir mejoras de modelos de conjunto o de nuevos retrievers sobre los mismos conjuntos de evaluación.
- Deduplicación de registros institucionales: aplicado a tablas de afiliaciones heterogéneas, agrupa formas superficiales distintas bajo el mismo identificador ROR, lo que facilita consolidar directorios y paneles de investigación.
- Análisis de políticas científicas: la asignación fiable de afiliaciones permite agregar producción por institución y país con menor tasa de falsos positivos, un requisito habitual en informes de financiación.

## Benchmarks y rendimiento

Resultados reportados en la model card (exact match, precisión y recall en porcentaje):

| Split | Cadenas | Exact match | Precisión | Recall |
|---|---:|---:|---:|---:|
| `affiliations_unseen_institutions` test | 1.957 | 79,2 | 93,6 | 85,1 |
| `affiliations_unseen_institutions` validation | 1.914 | 75,0 | 94,8 | 84,8 |
| `affiliations` validation | 1.947 | 85,7 | 94,7 | 87,4 |

No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K); no aplican a este tipo de modelo. La model card remite a `ror-set-point-set-model-mmbert-base-mask` para la comparación con el modelo de conjunto y a `comparison/` para las respuestas de `v3.0.0_local` y `all_institutions`, sin cifras adicionales en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pair scorer es un transformer base de ~278 M de parámetros; en bf16 requiere aproximadamente 0,6 GB de pesos más activaciones para batch pequeño, por lo que cabe holgadamente en 2–4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB; el entrenamiento documentado se ejecutó en una NVIDIA A10G (24 GB), y para inferencia son suficientes RTX 3060/4060 o superiores.
- Cabe en GPU de consumo: sí, en cualquier modelo con 4 GB o más de VRAM; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: los pesos se distribuyen como `model.pt` de PyTorch con tokenizer de Hugging Face, por lo que se cargan con `transformers`/PyTorch estándar. No se documentan artefactos GGUF ni integración con vLLM, llama.cpp, Ollama o TGI; el chooser requiere scikit-learn 1.9.1.
- Latencia y throughput: no disponibles. Como referencia, el entrenamiento de una época sobre ~287.000 pares tardó 31–35 minutos en una A10G.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Resultado reportado |
|---|---|---|---|---|---|
| `ror-set-point-pair-scorer-baseline` (este) | Cross-encoder + chooser GBM | no disponible (base 278 M) | 192 tokens | MIT | 79,2 EM / 93,6 P / 85,1 R en unseen test |
| `openalex-affiliation-matcher` v3.0.0 (`v3.0.0_local`) | Mismo diseño, entrenado con parte de los datos de evaluación | no disponible | no disponible | no disponible | Respuestas publicadas en `comparison/v3.0.0_local/`, sin cifras agregadas en el texto disponible |
| `ror-set-point-set-model-mmbert-base-mask` | Modelo de conjunto sobre mmBERT base | no disponible | no disponible | no disponible | Comparación cualitativa en su propia model card; cifras no incluidas en la información disponible |
| Diseño `all_institutions` | Mismo diseño entrenado con todas las instituciones | no disponible | no disponible | no disponible | Respuestas en `comparison/all_institutions/`; el repositorio no contiene ese modelo |

## Limitaciones y advertencias

- Modelo de propósito muy específico: no genera texto ni responde instrucciones; usarlo fuera del emparejamiento de afiliaciones produce resultados sin sentido.
- Dependencia del pipeline completo: la calidad final depende de la generación de candidatos (índice léxico, denso, acrónimos y tabla de alias). Si el registro correcto no está entre los ~18 candidatos, el pair scorer no puede recuperarlo.
- La tabla de alias procede de las cadenas de entrenamiento, lo que puede introducir sesgo hacia instituciones sobrerrepresentadas en el corpus y peor cobertura para instituciones pequeñas o regionales.
- Evaluación limitada a tres conjuntos con instituciones no vistas o de validación; no hay evaluación publicada por idioma ni sobre afiliaciones en lenguas distintas del inglés.
- El umbral de 0,50 del chooser se optimizó para exact match sobre respuestas out-of-fold de las cadenas de entrenamiento; en dominios con distribución distinta puede requerir recalibración.
- Riesgo de falsos positivos en cadenas ambiguas o muy cortas, y de falsos negativos cuando la afiliación usa abreviaturas no presentes en la tabla de alias.
- El sistema opera internamente con identificadores de OpenAlex y los traduce a ROR; cambios en el mapeo o en la versión del registro ROR pueden afectar a la reproducibilidad de las métricas.
- Licencia MIT, que permite uso comercial y modificación, pero sin garantías del autor; conviene validar el rendimiento en el dominio concreto antes de producción.
- El repositorio incluye el chooser como `model_names.pkl` dependiente de scikit-learn 1.9.1; versiones distintas pueden romper la carga del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-pair-scorer-baseline
- Colección ROR set point matching: https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Dataset destilado con juicios del profesor: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test-openalex-jev-distill
- Modelo de conjunto comparable: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Repositorio del diseño de referencia: https://github.com/ourresearch/openalex-affiliation-matcher
