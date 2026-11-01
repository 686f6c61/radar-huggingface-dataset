# geek4freak/leak-curber-enzyme-retrieval-v7

## Resumen

Leak CURBER enzyme retrieval v7 es un sistema de recuperación y clasificación de enzimas que asigna un número EC (Enzyme Commission) a partir de un SMILES de reacción química. Lo desarrolla el usuario geek4freak y se distribuye en HuggingFace bajo licencia MIT, empaquetado como artefacto ONNX con inferencia exclusivamente en CPU mediante un script `predict.py`. No es un modelo de lenguaje generativo, sino un ensemble especializado de recuperación química: fingerprints de reacción, clasificadores MLP residuales, dos transformers de reacción rxnfp afinados y búsqueda kNN sobre múltiples representaciones.

La relevancia del sistema está en el problema que aborda: la anotación funcional de enzimas (asignación de EC) es un cuello de botella en biocatálisis, ingeniería metabólica y curación de bases de datos. El modelo combina vistas complementarias (Morgan dirigido, rsplit, atom pair), aumento con reacciones invertidas y objetivos multi-EC suaves (1/n) para manejar la ambigüedad inherente a reacciones con más de una enzima candidata. El ensemble pesa especialmente el componente BERT (peso 3.0) y las vistas kNN de diferencia de fingerprints.

El repositorio ocupa 0,7 GB e incluye dos checkpoints BERT ONNX con vocabularios propios, además de los artefactos de retrieval. La model card reporta métricas de holdout local con validación cruzada (cross-fitting) para evitar inflación por ajuste de pesos, aunque el autor advierte que la puntuación real en el leaderboard puede diferir. No hay información sobre el pipeline de HuggingFace ni sobre idiomas soportados, lo cual es coherente con un modelo puramente químico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble: MLP residuales sobre fingerprints de reacción + 2 transformers rxnfp (BERT de reacción) en ONNX Runtime + recuperación kNN multi-vista |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; entrada = SMILES de reacción) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | no disponible (dominio químico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`bert_0.onnx`, `bert_1.onnx` con vocabularios `bert_vocab_0.txt` y `bert_vocab_1.txt`) |

## Arquitectura y entrenamiento

El sistema es un ensemble heterogéneo. Por un lado, un fingerprint de reacción Morgan dirigido que codifica reactivos, productos y subestructuras ganadas y perdidas (diferencia desplegada y luego plegada), con normalización de cargas interna (neutralización y eliminación de `[H+]`) sin alterar las cadenas de entrada. Sobre tres vistas de fingerprint (`morgan`, `rsplit`, `atompair`) se entrenan 9 clasificadores MLP residuales con objetivos multi-EC suaves (1/n) y cabezas auxiliares L3/L2/L1, donde la cabeza L3 se usa para re-ranking. Se aplica aumento con reacciones invertidas.

Por otro lado, dos transformers de reacción rxnfp afinados con checkpoints distintos: uno inicializado desde `bert_ft` y otro desde `bert_class_1k_tpl`. Ambos pasaron por preentrenamiento adaptativo al dominio con masked-token modeling y 10 épocas de fine-tuning para EC con aumento de SMILES aleatorios. La recuperación combina kNN por coseno sobre el fingerprint, el centro de reacción, TF-IDF de n-gramas de caracteres 3-5 y los embeddings de MLP y BERT. Los pesos del ensemble se ajustaron sobre un holdout tipo validación construido con clústeres de similitud acotada de las reacciones de entrenamiento, reponderados a las entradas de validación públicas sin usar etiquetas; los pesos finales otorgan 3.0 al componente BERT, 1.5 a `knn_diff` y 1.0 a varios componentes MLP y kNN de embeddings.

## Capacidades

- Predicción de un número EC por SMILES de reacción química, con salida única.
- Manejo de ambigüedad multi-EC mediante objetivos suaves (1/n) y re-ranking con la cabeza auxiliar L3.
- Recuperación por similitud sobre múltiples representaciones: fingerprint de reacción, centro de reacción, TF-IDF de caracteres y embeddings neuronales.
- Robustez a reacciones invertidas gracias al aumento con reacciones revertidas.
- Normalización de cargas en el fingerprinting (neutralización, eliminación de protones) sin modificar la cadena de entrada.
- Inferencia exclusivamente en CPU mediante ONNX Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo generativo.
- No dispone de capacidades multilingües, visión ni audio.

## Casos de uso

- Anotación funcional de enzimas en bases de datos: dado un conjunto de reacciones representadas como SMILES, el sistema asigna un EC candidato para curación manual posterior, reduciendo el espacio de búsqueda frente a la anotación manual.
- Ingeniería metabólica y diseño de rutas: al proponer una reacción objetivo, el modelo recupera enzimas candidatas por EC, lo que permite filtrar qué familias enzimáticas podrían catalizarla antes de validación experimental.
- Priorización en biocatálisis: integrado en un pipeline de descubrimiento, el modelo puntúa reacciones candidatas y ordena las enzimas plausibles por consenso del ensemble (BERT + kNN + MLP).
- Enriquecimiento de datasets de reacciones: para repositorios con SMILES pero sin EC, el sistema genera etiquetas EC automáticas que luego se validan por similitud con reacciones conocidas.
- Búsqueda de enzimas por similitud de reacción: el componente kNN sobre fingerprint y centro de reacción permite recuperar reacciones históricamente similares y sus EC asociados, útil como herramienta de exploración.
- Despliegue en entornos sin GPU: al ejecutarse solo en CPU con ONNX Runtime, encaja en servidores modestos, contenedores o estaciones de trabajo de laboratorio sin aceleradores.
- Filtrado previo en pipelines de anotación a gran escala: como primera etapa antes de modelos más costosos o de revisión experta, reduce el número de candidatos a evaluar.

## Benchmarks y rendimiento

El autor reporta métricas de holdout local (tipo validación, ponderado, con cross-fitting para evitar inflación por ajuste de pesos):

| Métrica | Valor |
|---|---|
| L4 | 0.6404 |
| L3 | 0.8656 |
| L2 | 0.9051 |
| L1 | 0.9414 |

El autor advierte que la estimación local se construyó para imitar el split del leaderboard y que la puntuación real puede diferir. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier CPU moderna; el repositorio ocupa 0,7 GB, por lo que la RAM necesaria para cargar los artefactos ONNX y los índices kNN es moderada (no cuantificada en la información disponible).
- Opciones de despliegue: script propio `python /app/predict.py --input IN --output OUT` con ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Leak CURBER enzyme retrieval v7 | Ensemble fingerprint + rxnfp + kNN | SMILES de reacción | MIT | HuggingFace (ONNX) |
| BEC-Pred (Qian et al., 2024) | Predicción de EC | Reacción | no disponible en la información | Referencia citada por el autor |
| CLIPZyme (Mikhael et al., ICML 2024) | Recuperación enzima-reacción | Reacción y enzima | no disponible en la información | Referencia citada por el autor |
| Horizyn (Rocks et al., PNAS 2026) | Recuperación enzima-reacción | Reacción | no disponible en la información | Referencia citada por el autor |

No se dispone de datos comparativos de rendimiento entre estos sistemas en la información proporcionada; las referencias se citan como trabajo relacionado, no como comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo predice EC a partir de SMILES de reacción; no es un modelo de propósito general.
- Salida de un único EC por reacción, pese al tratamiento suave de la ambigüedad multi-EC; puede perder la clase minoritaria en reacciones promiscuas.
- Las métricas reportadas son de holdout local construido por el autor, no de un benchmark público independiente; el propio autor advierte que la puntuación real puede diferir.
- Sin información sobre sesgos del dataset de entrenamiento ni sobre su composición y cobertura taxonómica.
- Riesgo de error en reacciones poco representadas o con estereoquímica inusual; la normalización de cargas puede alterar la señal en casos límite.
- Sin datos publicados sobre latencia, throughput ni requisitos de RAM.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de las dependencias (rxnfp es MIT; el vocabulario EC de ExPASy es CC BY 4.0 y requiere atribución).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni mantenimiento demostrado.
- Fecha de creación futura (2026-10-31) en los metadatos de HuggingFace, lo que sugiere posibles inconsistencias en el registro.

## Enlaces

- HuggingFace: https://huggingface.co/geek4freak/leak-curber-enzyme-retrieval-v7
- rxnfp (Schwaller et al., Nat. Mach. Intell. 2021, MIT): referencia citada en la model card, sin URL explícita
- BEC-Pred (Qian et al., J. Cheminform. 2024): referencia citada en la model card, sin URL explícita
- CLIPZyme (Mikhael et al., ICML 2024): referencia citada en la model card, sin URL explícita
- Horizyn (Rocks et al., PNAS 2026): referencia citada en la model card, sin URL explícita
- CARE/CREEP (Yang et al., 2025): referencia citada en la model card, sin URL explícita
- DRFP (Probst et al., 2022): referencia citada en la model card, sin URL explícita
- Vocabulario EC ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0): referencia citada en la model card, sin URL explícita
