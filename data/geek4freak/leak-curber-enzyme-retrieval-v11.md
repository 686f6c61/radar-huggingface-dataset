# geek4freak/leak-curber-enzyme-retrieval-v11

## Resumen

Leak CURBER enzyme retrieval v11 es un sistema de predicción de números EC (Enzyme Commission) a partir de SMILES de reacción, desarrollado por el usuario geek4freak y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo generativo de lenguaje, sino de un ensemble de recuperación y clasificación específicamente diseñado para anotar enzimas: dado un SMILES que describe reactivos y productos, devuelve un número EC (hasta cuatro niveles jerárquicos L1-L4). El repositorio ocupa 1,2 GB y la inferencia está pensada para ejecutarse solo en CPU mediante un script `predict.py`.

La arquitectura combina varias vistas de representación química: fingerprints de reacción (Morgan dirigido, DRFP, atom pair, rsplit), 18 clasificadores MLP residuales con objetivos multi-EC suaves, tres BERT de reacción rxnfp afinados y un re-ranker de stage-2 basado en gradient-boosted trees. La versión v11 añade la vista DRFP, preentrenamiento de los transformers con SMILES de reacción no etiquetados de Rhea y pesos EMA. Todo el pipeline se ejecuta con ONNX Runtime y NumPy, sin dependencia de GPU.

El modelo es relevante para la comunidad de bioinformática y química computacional porque aborda un problema clásico de anotación funcional de enzimas con un enfoque de ensemble que combina recuperación por similitud y clasificación supervisada, con robustez explícita frente a reacciones incompletas (half-reactions) y metabolitos moneda. La model card reporta métricas de holdout local cruzado, no de un benchmark público independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: 18 MLP residuales sobre fingerprints de reacción + 3 BERT rxnfp afinados (ONNX) + kNN de recuperación multi-vista + re-ranker GBT de stage-2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre SMILES de reacción) |
| Tipos de cuantizacion | no disponible (inferencia en CPU con ONNX Runtime; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (entrada basada en SMILES, no en lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`bert_0.onnx`, `bert_1.onnx`, `bert_2.onnx`), NumPy (`rerank.npz`), vocabularios `bert_vocab_*.txt` |
| Tamano del repositorio | 1,2 GB |
| Pipeline de Hugging Face | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema es un ensemble heterogéneo orientado a clasificación jerárquica de números EC. La primera capa la forman 18 clasificadores MLP residuales entrenados sobre distintas vistas de fingerprint: `morgan`, `rsplit`, `atompair`, `drfp`, `morgan+aug` y `rsplit+aug`. Los objetivos son multi-EC suaves con peso 1/n, y se añaden cabezas auxiliares L3/L2/L1, usando la cabeza L3 para el re-ranking. Se aplica aumento de datos por reacción invertida y por eliminación de metabolitos moneda (currency-metabolite-stripped augmentation) para mejorar la robustez ante half-reactions. El fingerprinting incluye normalización de carga (neutralización y eliminación de `[H+]`) sin alterar las cadenas de entrada originales.

La segunda capa son tres BERT de reacción rxnfp (dos checkpoints más una semilla adicional) con preentrenamiento de masked-token adaptado al dominio y 8 épocas de fine-tuning para EC con aumento por SMILES aleatorios. En v11 estos transformers se preentrenan además con SMILES de reacción no etiquetados de Rhea, con 6 variantes de escritura SMILES y pesos EMA. La recuperación se hace por kNN coseno sobre fingerprint, centro de reacción, TF-IDF de n-gramas de caracteres 3-5 y embeddings de MLP y BERT. El stage-2 es un re-ranker aprendido (gradient-boosted trees, inferencia NumPy) sobre los 20 candidatos EC principales, con miembros que incluyen `knn_morgan`, `knn_drfp`, `mlp_morgan`, `mlp_rsplit`, `mlp_atompair`, `knnemb_atompair`, `mlp_drfp`, `mlp_morgan+aug`, `knnemb_morgan+aug`, `mlp_rsplit+aug`, `knnemb_rsplit+aug`, `bert` y `knnemb_bert`, más features de balance para el enrutado. Los pesos del ensemble se ajustan sobre un holdout similar a validación construido con clústeres de similitud curbada de las reacciones de entrenamiento, reponderados a las entradas públicas de validación sin usar etiquetas.

## Capacidades

- Predicción de un número EC por SMILES de reacción, con jerarquía L1, L2, L3 y L4.
- Clasificación multi-EC suave mediante objetivos 1/n y cabezas auxiliares jerárquicas.
- Recuperación por similitud sobre múltiples representaciones: fingerprint Morgan dirigido, DRFP, atom pair, rsplit, centro de reacción, TF-IDF de caracteres y embeddings neuronales.
- Re-ranking aprendido sobre los 20 candidatos EC principales.
- Robustez ante half-reactions y reacciones con metabolitos moneda eliminados.
- Normalización interna de cargas y eliminación de `[H+]` durante el fingerprinting.
- Aumento por reacción invertida y por variantes de escritura SMILES.
- Inferencia solo en CPU mediante ONNX Runtime y NumPy.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre.

## Casos de uso

- Anotación funcional de enzimas en pipelines de biología computacional: el sistema recibe un SMILES de reacción y devuelve un EC candidato, integrándose en flujos de anotación masiva donde no hay GPU disponible.
- Curación de bases de datos de reacciones enzimáticas: el ensemble permite priorizar candidatos EC para revisión manual, usando el re-ranker para ordenar los 20 mejores candidatos por reacción.
- Enriquecimiento de datasets de metabolómica: dado un par reactivo-producto, el modelo propone la clase enzimática implicada, útil para reconstruir rutas metabólicas.
- Filtrado de reacciones en pipelines de descubrimiento de fármacos: la robustez ante half-reactions y metabolitos moneda permite aplicar el modelo a reacciones incompletas habituales en datos experimentales.
- Docencia y prototipado en química computacional: al ser CPU-only y con licencia MIT, se puede desplegar en portátiles o contenedores sin GPU para experimentar con clasificación EC.
- Benchmarking interno de representaciones químicas: las múltiples vistas (Morgan, DRFP, atom pair, rsplit, BERT rxnfp) permiten comparar qué representación aporta más señal en un conjunto de reacciones propio.
- Sistemas de búsqueda de enzimas por similitud de reacción: los índices kNN sobre fingerprint y embeddings permiten recuperar reacciones enzimáticas similares a una consulta.

## Benchmarks y rendimiento

La model card reporta métricas de holdout local construido para imitar el split del leaderboard, con validación cruzada (pesos ajustados en una mitad y evaluados en la otra):

| Nivel | Métrica |
|---|---|
| L4 | 0,6646 |
| L3 | 0,8741 |
| L2 | 0,9073 |
| L1 | 0,9381 |

El autor advierte que la estimación local puede diferir del score real en el leaderboard. No se han publicado resultados de benchmarks en la informacion disponible comparando con modelos similares en un conjunto independiente.

## Requisitos de hardware

- Inferencia solo en CPU: el autor indica explícitamente `python /app/predict.py --input IN --output OUT` como modo de ejecución, sin requisito de GPU.
- VRAM estimada para inferencia: 0 GB (no usa GPU).
- GPU recomendadas: no aplica; el sistema está diseñado para CPU con ONNX Runtime y NumPy.
- Cabe en cualquier equipo consumer: el repositorio pesa 1,2 GB y la inferencia es CPU-only.
- Opciones de despliegue: script `predict.py` del autor con ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Leak CURBER enzyme retrieval v11 | Ensemble de MLP + BERT rxnfp + kNN + GBT re-ranker | Predicción de EC desde SMILES de reacción | MIT | Hugging Face |
| rxnfp (Schwaller et al., 2021) | BERT de reacción | Embeddings de reacción; base para clasificación | MIT | Público (referencia citada) |
| BEC-Pred (Qian et al., 2024) | Modelo de predicción de EC | Predicción de clases enzimáticas | no disponible | Referencia citada |
| CLIPZyme (Mikhael et al., 2024) | Modelo de recuperación enzima-reacción | Retrieval con CLIP | no disponible | Referencia citada |
| Horizyn (Rocks et al., 2026) | Modelo de recuperación | Retrieval de reacciones | no disponible | Referencia citada |
| CARE/CREEP (Yang et al., 2025) | Modelo de predicción de EC | Predicción enzimática | no disponible | Referencia citada |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: no es un LLM; no genera texto, no soporta tool calling, agentes, visión ni audio.
- Métricas reportadas solo en holdout local construido por el autor; el propio autor advierte que el score real puede diferir del leaderboard.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta; sin validación independiente por la comunidad.
- Sin información sobre sesgos del dataset de entrenamiento ni sobre composición detallada del mismo.
- Riesgo de predicciones erróneas en reacciones fuera de la distribución de entrenamiento (nuevas clases de reacción, cofactores no vistos, enzimas de clases poco representadas).
- La robustez ante half-reactions depende del aumento de datos; no hay garantía de comportamiento correcto en reacciones muy incompletas.
- Vocabulario EC fijado a ExPASy ENZYME release 02-Sep-2026; clases EC nuevas o revisadas posteriores no estarán cubiertas.
- Licencia MIT: permite uso comercial, pero no se documentan garantías ni soporte del autor.
- Sin información sobre latencia, throughput ni límites de tamaño de lote en CPU.
- El repositorio incluye un `predict.py` que se ejecuta en `/app/`; no se documenta el entorno de dependencias exacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geek4freak/leak-curber-enzyme-retrieval-v11
- Versión anterior v3: https://huggingface.co/geek4freak/leak-curber-enzyme-retrieval-v3
- rxnfp (Schwaller et al., Nat. Mach. Intell. 2021): referencia citada en la model card, sin URL directa disponible
- BEC-Pred (Qian et al., J. Cheminform. 2024): referencia citada en la model card, sin URL directa disponible
- CLIPZyme (Mikhael et al., ICML 2024): referencia citada en la model card, sin URL directa disponible
- Horizyn (Rocks et al., PNAS 2026): referencia citada en la model card, sin URL directa disponible
- CARE/CREEP (Yang et al., 2025): referencia citada en la model card, sin URL directa disponible
- DRFP (Probst et al., 2022): referencia citada en la model card, sin URL directa disponible
- ExPASy ENZYME (SIB, CC BY 4.0): vocabulario EC usado, sin URL directa disponible en la información proporcionada
