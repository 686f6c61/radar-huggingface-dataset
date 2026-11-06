# SamuelCagnani/olfacto-chemberta-138

## Resumen

Olfacto ChemBERTa 138 es un modelo de clasificación multi-etiqueta de texto que predice la calidad olfativa de moléculas a partir de su representación SMILES. Lo desarrolla Samuel Cagnani en el marco del proyecto Olfacto AI, una iniciativa abierta de olfacción computacional con interfaz en portugués. El modelo recibe una cadena SMILES y devuelve la probabilidad de 138 descriptores olfativos binarios (frutado, floral, defumado, etc.).

Técnicamente es un fine-tuning de DeepChem/ChemBERTa-77M-MLM, un transformer tipo RoBERTa preentrenado con enmascaramiento de lenguaje sobre SMILES. El checkpoint publicado contiene 3.480.570 parámetros en safetensors, lo que sugiere una cabeza de clasificación sobre las representaciones del encoder; el modelo base completo es de aproximadamente 77 millones de parámetros. La longitud de contexto utilizada en inferencia es de 128 tokens.

Su relevancia es doble: por un lado, aplica un transformer químico a un problema clásico de quimioinformática (predicción de propiedades sensoriales) con una evaluación out-of-fold honesta y reproducible; por otro, publica una ablation que muestra que un baseline de fingerprints Morgan con regresión logística supera al transformer en este dataset concreto, lo que resulta útil como referencia metodológica para quien evalúe arquitecturas similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (ChemBERTa-77M-MLM) con cabeza de clasificación multi-etiqueta |
| Parámetros totales | 3.480.570 en el checkpoint publicado (modelo base completo: ~77M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_length en el ejemplo de uso) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Portugués (pt) e inglés (en); la entrada es SMILES, no texto natural |
| Licencia | MIT |
| Formato de pesos | safetensors; incluye además un archivo `fingerprint.joblib` para el ensemble |
| Pipeline | text-classification (multi-label) |
| Métrica declarada | ROC-AUC |
| Dataset de entrenamiento | SamuelCagnani/olfacto-odor-138-ptbr (derivado de OpenPOM) |
| Modelo base | DeepChem/ChemBERTa-77M-MLM |

## Arquitectura y entrenamiento

El modelo parte de ChemBERTa-77M-MLM, un encoder transformer con tokenización por caracteres sobre cadenas SMILES y preentrenamiento por masked language modeling. Sobre ese encoder se añade una cabeza de clasificación con 138 salidas independientes, entrenada con activación sigmoide y pérdida binaria por etiqueta. El checkpoint publicado ocupa solo 3,48 millones de parámetros, lo que indica que el artefacto distribuido corresponde a una cabeza o a una versión reducida del encoder; el modelo base completo es de aproximadamente 77 millones.

Los datos de entrenamiento son 4.983 moléculas del dataset curado de OpenPOM, derivado de los catálogos GoodScents y Leffingwell, con 138 rótulos binarios. La etiqueta más frecuente es `fruity` (1.902 positivos) y la más rara `chamomile` (31), un desbalance severo que explica el bajo PR-AUC macro. Los folds se construyeron con estratificación iterativa multi-label y se entrenó un modelo por fold, con un umbral de `min_positives=20` para las etiquetas evaluadas. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; es un modelo discriminativo, no generativo.

## Capacidades

- Clasificación multi-etiqueta de 138 descriptores olfativos a partir de una cadena SMILES.
- Predicción de calidad olfativa (no de intensidad) de moléculas individuales.
- Exploración del espacio olfativo y búsqueda de moléculas con perfiles sensoriales determinados.
- Soporte de inferencia vía `transformers` con `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatible con Text Embeddings Inference y con endpoints compatibles según los tags del repositorio.
- Integración con un ensemble que combina el transformer con fingerprints Morgan y regresión logística (archivo `fingerprint.joblib`).
- Capacidades multilingües limitadas al contexto de la interfaz y documentación (portugués e inglés); la entrada real es notación química.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Cribado virtual de moléculas odorantes: dado un catálogo de SMILES, el modelo genera un vector de 138 probabilidades por molécula que permite priorizar candidatos antes de un panel sensorial humano, reduciendo el coste de evaluación experimental.
- Descubrimiento de sustituyentes en química de fragancias: se pueden enumerar variantes estructurales de una molécula conocida y filtrar aquellas cuya predicción conserve el descriptor objetivo (por ejemplo, `floral`) mientras se exploran alternativas.
- Investigación en olfacción computacional: el modelo sirve como baseline reproducible frente a fingerprints y frente a OpenPOM, con métricas OOF publicadas y folds documentados.
- Docencia y demostraciones en portugués: el Space asociado permite ilustrar el pipeline SMILES a predicción olfativa sin infraestructura propia.
- Análisis de cobertura del espacio olfativo: agregando las predicciones sobre un conjunto de moléculas se pueden estudiar qué descriptores están sobrerrepresentados y cuáles infrarrepresentados en los catálogos comerciales.
- Componente de un sistema híbrido: el ensemble documentado (80% fingerprint + 20% ChemBERTa) puede integrarse en una API interna que devuelva directamente la predicción combinada, que supera al transformer solo en este dataset.
- Etiquetado asistido de datasets propios: aplicar el modelo a moléculas nuevas para preetiquetar y luego revisar manualmente las etiquetas con mayor incertidumbre.

## Benchmarks y rendimiento

Evaluación out-of-fold con 5 folds, un modelo por fold y `min_positives=20`:

| Métrica | Valor |
|---|---|
| ROC-AUC macro (OOF) | 0,7516 |
| IC 95% bootstrap | [0,7465; 0,7574] |
| ROC-AUC micro | 0,8402 |
| PR-AUC macro | 0,1085 |
| AUC por fold (media ± desviación) | 0,7547 ± 0,0043 |
| Rótulos evaluados | 138 |

Comparación de modelos sobre el mismo esquema OOF:

| Modelo | ROC-AUC macro | ROC-AUC micro |
|---|---|---|
| ChemBERTa (este modelo) | 0,7516 | 0,8402 |
| Morgan + regresión logística | 0,8285 | 0,8860 |
| Ensemble (80% fingerprint + 20% ChemBERTa) | 0,8402 | 0,8956 |
| OpenPOM (referencia, 5-fold CV, ensemble de 10 modelos) | 0,8872 | No disponible |

La comparación es una ablation declarada por el autor, no una alegación de superioridad. El PR-AUC macro de 0,1085 refleja el fuerte desbalance de etiquetas y debe interpretarse junto con el ROC-AUC, no de forma aislada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint publicado de 3,48 M de parámetros; en torno a 300 MB en fp16. Si se carga el modelo base completo de ~77 M, alrededor de 300 MB en fp32.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso CPU son viables para lotes pequeños.
- Cabe holgadamente en GPU consumer y en entornos sin GPU; la inferencia en CPU es práctica para volúmenes moderados de moléculas.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles. Para el ensemble completo es necesario además cargar `fingerprint.joblib` con `joblib` y disponer de RDKit para generar los fingerprints Morgan.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en lotes, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | ROC-AUC macro (OOF) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olfacto ChemBERTa 138 | 3,48 M (checkpoint); ~77 M base | SMILES, 128 tokens | 0,7516 | MIT | Hugging Face |
| Morgan + regresión logística (baseline) | No aplica (modelo lineal) | Fingerprint Morgan | 0,8285 | No especificada | Incluido como `fingerprint.joblib` |
| Ensemble 80/20 (fingerprint + ChemBERTa) | Combinación | Fingerprint + SMILES | 0,8402 | MIT (aquí) | Incluido en el repo |
| OpenPOM (referencia) | No disponible | No disponible | 0,8872 | No disponible en esta ficha | Repositorio OpenPOM |

La comparación relevante es interna al proyecto: el transformer solo queda por debajo del baseline de fingerprints y del ensemble. Frente a OpenPOM, la diferencia de unos 13 puntos de ROC-AUC macro debe matizarse porque OpenPOM usa un ensemble de 10 modelos y el protocolo de evaluación puede diferir.

## Limitaciones y advertencias

- Predice calidad olfativa, no intensidad: el dataset no anota intensidad y el modelo no puede estimarla.
- Solo acepta moléculas individuales; no modela mezclas ni efectos sinérgicos.
- Sesgo hacia fragancias y aromas comerciales (GoodScents, Leffingwell); no representa la culinaria brasileña ni otros dominios sensoriales.
- Rótulos ruidosos y fuertemente desbalanceados: las etiquetas raras (por ejemplo, `chamomile` con 31 positivos) tienen mayor varianza y menor fiabilidad.
- El modelo siempre asigna los rótulos más próximos aunque el olor real sea desconocido; no existe una clase "desconocido" ni calibración de novedad.
- PR-AUC macro bajo (0,1085), lo que limita su uso como filtro de alta precisión sin revisión humana.
- Fuera de alcance explícito: uso regulatorio, médico o de seguridad alimentaria, y sustitución de un panel sensorial humano.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad de las predicciones en producción.
- El checkpoint publicado tiene solo 3,48 M de parámetros, muy por debajo del modelo base de ~77 M; conviene verificar qué componentes incluye antes de asumir equivalencia con el ChemBERTa completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamuelCagnani/olfacto-chemberta-138
- Dataset de entrenamiento: https://huggingface.co/datasets/SamuelCagnani/olfacto-odor-138-ptbr
- Demo (Space): https://huggingface.co/spaces/SamuelCagnani/olfacto
- Repositorio del proyecto: https://github.com/cagnani/olfacto-ai
- Modelo base: https://huggingface.co/DeepChem/ChemBERTa-77M-MLM
- Paper de referencia (Lee et al., 2023, Science): *A Principal Odor Map Unifies Diverse Tasks in Human Olfactory Perception*
- Código de referencia OpenPOM: no disponible como enlace directo en la información proporcionada
