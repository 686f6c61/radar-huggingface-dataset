# jibmaird/sporadic-cystitis-two-stage

## Resumen

Sporadic Cystitis Two-Stage es un conjunto de checkpoints de clasificación de texto clínico veterinario publicados por el autor jibmaird junto al artículo "Sporadic Cystitis Detection in Veterinary Clinical Text". El modelo aborda la detección de cistitis esporádica (SC) en notas clínicas veterinarias en texto libre, descomponiendo el problema en dos subproblemas de dificultad distinta: primero identificar si la nota trata sobre un trastorno del tracto urinario (UTD) y, después, distinguir la cistitis esporádica de otras condiciones urinarias clínicamente similares como FIC, FLUTD, urolitiasis, cistitis recurrente u obstrucción uretral.

El sistema se construye sobre VetBERTDx (Hur et al., 2020), un modelo BERT adaptado al dominio veterinario, y se distribuye en dos familias: un pipeline de dos etapas (System C) con cinco modelos de fold entrenados solo sobre notas UTD, y cuatro clasificadores end-to-end (Multi-Knowledge y Dual-Head) entrenados sobre las 1.200 notas de entrenamiento completas. El repositorio ocupa 5,6 GB e incluye pesos en formato PyTorch `state_dict()`.

La relevancia del modelo es doble: por un lado, es un ejemplo poco habitual de NLP clínico veterinario con pesos publicados; por otro, su diseño en dos etapas con una compuerta congelada de propósito general ilustra una estrategia para problemas de clasificación con prevalencia baja y etiquetas ruidosas. La licencia es Apache 2.0, pero el uso previsto es exclusivamente de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (VetBERTDx como base) con cabezas de clasificación específicas por sistema |
| Parametros totales | no disponible (los checkpoints individuales pesan entre 434 MB y 831 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `state_dict()` (`.pt`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es VetBERTDx, un transformer tipo BERT adaptado al dominio veterinario. Sobre él se construyen dos diseños. El System C es un pipeline de dos etapas: la primera etapa usa VetBERTDx congelado, sin entrenamiento específico de SC, para calcular P(UTD) y dejar pasar la nota si supera el umbral `gate_thr1 = 0.00028190302`, fijado sobre el conjunto de desarrollo. La segunda etapa consiste en cinco modelos de fold (VetBERTDx con una nueva cabeza SC) afinados únicamente sobre notas UTD (SC frente a Other-UTD) en validación cruzada de 5 folds sobre las 804 notas UTD de entrenamiento. La probabilidad final de SC es la media de los cinco modelos de fold, y se etiqueta SC si la nota pasa la compuerta y la media es al menos 0,5.

Los clasificadores end-to-end (System A) se entrenan sobre las 1.200 notas de entrenamiento para predecir SC frente a Other. Se distribuyen dos familias de fusión que combinan el embedding CLS de 768 dimensiones de VetBERTDx con su vector de 39 probabilidades de síndrome: Multi-Knowledge (estrategias gated y cross-modal) y Dual-Head (cross-attention y weighted). En el System B del artículo, las predicciones SC de estos clasificadores se filtran a posteriori con la compuerta de la etapa 1, sin modificar el checkpoint. El conjunto de datos de entrenamiento es privado (lote de anotación `ann04062026`, 2.021 notas) y no se publica. No se especifican en la información disponible el número de tokens de entrenamiento ni detalles de RLHF/DPO.

## Capacidades

- Clasificación binaria de texto clínico veterinario en inglés: detección de cistitis esporádica frente a otras condiciones urinarias.
- Identificación de notas sobre trastornos del tracto urinario (UTD) mediante la compuerta de la etapa 1.
- Distinción fina entre cistitis esporádica y condiciones clínicamente similares (FIC, FLUTD, urolitiasis, cistitis recurrente, obstrucción uretral).
- Fusión de representaciones: combinación del embedding CLS de 768 dimensiones con un vector de 39 probabilidades de síndrome en los clasificadores end-to-end.
- Pipeline de predicción reproducible mediante `scripts/prediction/predict_two_stage.py` del repositorio complementario.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades distintas de texto.

## Casos de uso

- Triaje de notas clínicas veterinarias: el pipeline de dos etapas puede procesar notas en texto libre y marcar aquellas compatibles con cistitis esporádica para revisión posterior, aprovechando la compuerta de UTD para descartar notas irrelevantes antes del clasificador específico.
- Investigación en NLP clínico veterinario: los checkpoints permiten reproducir los resultados del artículo y comparar estrategias de fusión (gated, cross-modal, cross-attention, weighted) sobre el mismo corpus.
- Extracción de cohortes para estudios retrospectivos: el modelo puede etiquetar grandes volúmenes de notas y ayudar a construir cohortes de casos urinarios, siempre con validación manual posterior.
- Detección de condiciones urinarias similares: la etapa 2 distingue SC de FIC, FLUTD, urolitiasis, cistitis recurrente y obstrucción uretral, lo que permite un preetiquetado más granular que una simple clasificación urinaria.
- Evaluación de estrategias de dos etapas con compuerta congelada: el diseño sirve como referencia metodológica para problemas con prevalencia baja y etiquetas ruidosas, replicable en otros dominios clínicos.
- Integración en pipelines de anotación asistida: el script de predicción acepta un CSV de notas y devuelve predicciones, lo que facilita incorporarlo a flujos de preetiquetado antes de la revisión por veterinarios.

## Benchmarks y rendimiento

El artículo reporta para System C, sobre el conjunto de test de 500 notas con prevalencia natural (21 SC), un F1(SC) de 0,756 (IC 95 % 0,622–0,884; 17 TP, 7 FP, 4 FN; Tabla 6 del artículo). No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea de clasificación.

| Sistema | Metrica | Valor |
|---|---|---|
| System C (seed 42) | F1(SC) en test | 0,756 (IC 95 % 0,622–0,884) |
| System C (seed 42) | TP / FP / FN | 17 / 7 / 4 |
| System C (seeds 43 y 44) | Resultados | no disponibles (fold models no publicados) |

## Requisitos de hardware

- VRAM estimada: cada checkpoint de fold pesa aproximadamente 434 MB y los clasificadores end-to-end entre 828 y 831 MB; en FP32 se requiere espacio adicional para el modelo base VetBERTDx y los estados de activación. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño de los checkpoints, caben en GPUs de consumo como RTX 3060 o superiores, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de los pesos, aunque no hay validación publicada.
- Opciones de despliegue: PyTorch con las clases del repositorio complementario (`VetBERTMultiKnowledgeClassifier`, `VetBERTDualHead`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sporadic Cystitis Two-Stage | no disponible | no disponible | Clasificación clínica veterinaria (SC vs Other) | apache-2.0 | Pesos publicados en HF |
| VetBERTDx (base) | no disponible | no disponible | Modelo BERT de dominio veterinario | no disponible | HF (havocy28/VetBERTDx) |
| BERT base (referencia) | 110 M | 512 tokens | Clasificación de texto general | apache-2.0 | Ampliamente disponible |

No se dispone de información sobre otros modelos comparables específicos de detección de cistitis esporádica en texto veterinario.

## Limitaciones y advertencias

- Entrenado y evaluado sobre un único lote de anotación privado (`ann04062026`, 2.021 notas); no hay validación externa en otro año, fuente de datos o sistema de gestión de prácticas.
- Uso exclusivamente de investigación; no es una herramienta validada de soporte a la decisión clínica y no debe sustituir el juicio veterinario.
- El propio análisis de errores del artículo señala que la etiqueta dorada de SC es "blanda": una parte significativa de las etiquetas positivas se basa en una prescripción de antibiótico más un diagnóstico diferencial escrito, sin citología confirmatoria.
- Posible riesgo de alucinación y de sobreajuste al estilo de redacción del corpus de entrenamiento; no se documentan sesgos específicos.
- Idioma limitado al inglés; no se garantiza rendimiento en otros idiomas.
- Los modelos de fold de los seeds 43 y 44 no se publican, por lo que no es posible reproducir esos resultados.
- La licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado por el autor es solo de investigación; conviene evaluar el cumplimiento normativo antes de cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jibmaird/sporadic-cystitis-two-stage
- Modelo base VetBERTDx: https://huggingface.co/havocy28/VetBERTDx
- Repositorio complementario (GitHub): https://github.com/jibmaird/NCAS-vet-cystitis-c
- Citación (CITATION.cff): https://github.com/jibmaird/NCAS-vet-cystitis-c/blob/main/CITATION.cff
