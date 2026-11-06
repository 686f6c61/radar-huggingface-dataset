# harari/evo2-tbx5-binding-classifier

## Resumen

El modelo `harari/evo2-tbx5-binding-classifier` es un clasificador supervisado, desarrollado por el usuario harari, que predice si un sitio de 8 pares de bases del genoma humano está ocupado por el factor de transcripción TBX5 dentro de una región de pico de ChIP. No es un modelo generativo ni un transformer entrenado desde cero: es una red neuronal densa (MLP) que consume las representaciones internas del modelo genómico Evo 2 7B, concretamente las activaciones de la capa `blocks.26.mlp.l3` (4.096 dimensiones por nucleótido), extraídas con una ventana de contexto de 8.192 pb centrada en el sitio y en ambas hebras (forward y reverse-complement).

El clasificador forma parte del trabajo *Evo 2 Predicts Cardiomyopathy-Associated Variants and Elucidates Their Underlying Mechanisms* (Kurozumi, Otsuka et al., bioRxiv, 2026), donde se utiliza para interpretar variantes asociadas a miocardiopatía a través de su efecto sobre la unión de TBX5. La relevancia práctica es doble: por un lado, demuestra el uso de embeddings de modelos fundacionales de ADN como características para tareas supervisadas de regulación génica; por otro, ofrece un AUROC de 0,824 en el caso más difícil (distinguir sitios con motivo TBX5 que sí están ocupados de los que no lo están), lo que lo hace útil para priorizar variantes en estudios de regulación.

El repositorio ocupa 2,2 GB, aunque el modelo en sí es un MLP pequeño; el peso corresponde mayoritariamente a los artefactos asociados y a la dependencia implícita del modelo base Evo 2 7B, que debe ejecutarse por separado para generar los embeddings de entrada. La licencia es MIT y el modelo está etiquetado para genómica, ADN, factores de transcripción, TBX5 y miocardiopatía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP supervisado sobre embeddings de Evo 2 7B (no es un transformer propio) |
| Parametros totales | no disponible (el MLP es de tamaño reducido; el modelo base Evo 2 7B tiene 7.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 pb de contexto genómico por sitio (ventana centrada en el sitio de 8 pb) |
| Tipos de cuantizacion | no disponible (pesos en `best_model.pth`, formato PyTorch) |
| Idiomas soportados | no disponible (modelo de genómica, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pth`, `scaler.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red fully-connected con cuatro bloques de proyección: entrada de 65.536 dimensiones (8 nucleótidos × 4.096 dimensiones × 2 hebras) → Linear 8.192 → ReLU → BatchNorm → Dropout 0,3 → Linear 2.048 → ReLU → BatchNorm → Dropout 0,3 → Linear 512 → ReLU → BatchNorm → Dropout 0,3 → Linear 128 → ReLU → BatchNorm → Dropout 0,15 → Linear 1. La salida es un logit que se interpreta como probabilidad de que el sitio sea un pico de unión de TBX5 con motivo presente (etiqueta 1: `TBX5_motif_peak`). Las etiquetas negativas agrupan tres categorías: `TBX5_nonmotif_nonpeak`, `TBX5_nonmotif_peak` y `TBX5_motif_nonpeak`, lo que convierte la tarea en una clasificación binaria de ocupación funcional condicionada a la presencia de motivo.

El entrenamiento usa BCEWithLogitsLoss con ponderación de clases, optimizador Adam (lr 1e-3, weight decay 1e-5, batch 256), early stopping con paciencia 7 y decaimiento del learning rate (factor 0,5, paciencia 3) sobre la pérdida de validación. Los pesos publicados corresponden a la época 2, la de menor pérdida de validación. El split es a nivel de cromosoma para evitar fuga de información: entrenamiento en chr1, 3, 4, 5, 8, 10, 16, 17, 18, 20, 21 y 22 (99.256 sitios); validación en chr2, 11, 12, 15, X e Y (49.084 sitios); test en chr6, 7, 9, 13, 14 y 19 (51.370 sitios). El fichero `split_assignment.tsv` documenta la asignación de cada sitio. La estandarización de entradas se realiza con `scaler.pt`, que contiene la media y la desviación típica calculadas sobre el conjunto de entrenamiento.

## Capacidades

- Clasificación binaria de sitios de 8 pb como picos de unión de TBX5 con motivo presente frente a tres categorías negativas.
- Extracción de características a partir de embeddings de Evo 2 7B en la capa `blocks.26.mlp.l3`, con contexto de 8.192 pb y agregación de ambas hebras.
- Integración de información de contexto largo (8 kb) para una predicción a resolución de 8 pb, lo que permite captar efectos de secuencia distal.
- Uso previsto en análisis de variantes: comparación de la probabilidad de unión entre alelos de referencia y alternativo para priorizar variantes asociadas a miocardiopatía.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de genómica, no un modelo de lenguaje.
- No tiene capacidades multilingües ni de visión; su dominio es exclusivamente secuencia de ADN.

## Casos de uso

- Priorización de variantes no codificantes en estudios de miocardiopatía: para cada variante en un sitio de 8 pb, se calcula la probabilidad de unión de TBX5 con el alelo de referencia y con el alternativo, y se ordenan las variantes por la caída de probabilidad, lo que permite seleccionar candidatas para validación experimental.
- Anotación funcional de regiones de ChIP-seq de TBX5: dado un conjunto de picos, el clasificador distingue los que contienen motivo de los que no, ayudando a separar mecanismos directos (unión vía motivo) de uniones indirectas o mediadas por otros factores.
- Filtrado de falsos positivos en llamadas de picos: se puede aplicar como capa de puntuación sobre candidatos a pico para descartar regiones con baja probabilidad de unión específica de TBX5.
- Análisis de enriquecimiento de motivos en regiones reguladoras: al puntuar ventanas genómicas con el clasificador, se pueden identificar regiones con alta propensión a la unión de TBX5 más allá de la simple búsqueda de motivo.
- Estudio de haplotipos y efectos combinados: al evaluar múltiples variantes en una misma ventana de 8 kb, el modelo permite estimar efectos acumulativos sobre la unión de TBX5, útil en análisis de desequilibrio de ligamiento.
- Docencia y reproducibilidad metodológica: el código y los pesos permiten reproducir el flujo completo (extracción de embeddings de Evo 2, estandarización, inferencia) como ejemplo de uso de modelos fundacionales de ADN en tareas supervisadas.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (cromosomas 6, 7, 9, 13, 14 y 19):

| TBX5_motif_peak frente a | AUROC |
|---|---|
| TBX5_nonmotif_nonpeak | 0,993 |
| TBX5_nonmotif_peak | 0,980 |
| TBX5_motif_nonpeak | 0,824 |

No se han publicado en la información disponible resultados comparativos con otros clasificadores de unión de factores de transcripción, ni métricas adicionales (AUPRC, precisión, recall, F1) para estas comparaciones.

## Requisitos de hardware

- El MLP en sí es pequeño: la capa de entrada es de 65.536 × 8.192 parámetros (unos 537 millones de parámetros solo en la primera capa), por lo que la inferencia en CPU es viable para lotes moderados, aunque conviene GPU para lotes grandes.
- El cuello de botella real es la extracción de embeddings con Evo 2 7B, que requiere ejecutar el modelo base de 7.000 millones de parámetros; esto exige GPU con memoria suficiente (se recomienda A100 40/80 GB o H100 para lotes grandes; una RTX 4090 de 24 GB puede servir con cuantización o lotes pequeños).
- El clasificador no cabe en el mismo presupuesto que Evo 2 7B; en la práctica se ejecuta en dos fases: primero Evo 2 7B genera los embeddings y luego el MLP clasifica.
- Opciones de despliegue: PyTorch nativo para el MLP; para Evo 2 7B, las herramientas del repositorio oficial de Arc Institute (no se especifican en la información disponible vLLM, llama.cpp u Ollama para este modelo genómico).
- No se dispone de datos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| harari/evo2-tbx5-binding-classifier | MLP sobre embeddings de Evo 2 7B | no disponible (MLP pequeño; base de 7B) | 8.192 pb | MIT | Hugging Face |
| arcinstitute/evo2_7b | Modelo fundacional de ADN (transformer) | 7.000 millones | no disponible en la información | no disponible en la información | Hugging Face |
| Clasificadores de unión de factores de transcripción basados en CNN (p. ej. Basenji, DeepSEA) | CNN supervisada | no disponible | típicamente 1-2 kb | no disponible | repositorios académicos |

La comparación directa con Basenji o DeepSEA no está disponible en la información proporcionada; se citan como alternativas metodológicas de la misma categoría (predicción de unión de factores de transcripción a partir de secuencia), pero sin datos de rendimiento comparables en esta ficha.

## Limitaciones y advertencias

- El modelo solo predice unión de TBX5 en el contexto del genoma humano usado en el entrenamiento; no es transferible sin reentrenamiento a otras especies, otros factores de transcripción ni otras resoluciones de sitio.
- La entrada está fijada a sitios de 8 pb y a una ventana de contexto de 8.192 pb; no admite secuencias de otra longitud ni contextos mayores.
- El rendimiento en la discriminación más difícil (`TBX5_motif_nonpeak`, AUROC 0,824) es notablemente inferior al de las comparaciones más fáciles, por lo que las predicciones en ese régimen deben interpretarse con cautela.
- El entrenamiento se detuvo en la época 2 según la pérdida de validación, lo que puede indicar un ajuste limitado o una señal de que el modelo no aprovecha todo el potencial de los embeddings; no se documentan curvas de aprendizaje completas en la información disponible.
- No se han publicado análisis de sesgos, calibración ni robustez frente a variantes de secuencia fuera de distribución.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de sobreinterpretación de probabilidades como evidencia causal de unión.
- La licencia MIT permite uso comercial, pero el modelo depende de Evo 2 7B, cuyas condiciones de uso deben verificarse por separado.
- El repositorio incluye 2,2 GB, pero los pesos del MLP son ligeros; la mayor parte del espacio puede corresponder a artefactos auxiliares, y la reproducibilidad completa exige el modelo base y el pipeline de extracción de embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harari/evo2-tbx5-binding-classifier
- Modelo base Evo 2 7B: https://huggingface.co/arcinstitute/evo2_7b
- Artículo: Kurozumi, Otsuka et al., *Evo 2 Predicts Cardiomyopathy-Associated Variants and Elucidates Their Underlying Mechanisms*, bioRxiv, doi:10.64898/2026.05.15.725304
- Archivo Zenodo con código de análisis: doi:10.5281/zenodo.23824204
