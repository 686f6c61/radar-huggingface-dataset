# cadrojasl/beto-sarcasmo-spanish-2026

## Resumen

BETO afinado en sarcasmo es un modelo de clasificación de texto en español desarrollado por el usuario cadrojasl como trabajo final del taller de PLN de la Maestría en Ingeniería de Sistemas y Computación (Actividad 10). Se trata de un fine-tuning de `dccuchile/bert-base-spanish-wwm-cased`, el conocido BETO de la Universidad de Chile, sobre el dataset `Ernesto-1997/Sarcastic_spanish_dataset`, con el objetivo de discriminar entre las etiquetas NO_SARCASMO y SARCASMO en textos en castellano.

El modelo resuelve una tarea concreta y acotada: la detección binaria de sarcasmo, un problema notoriamente difícil en PLN por la dependencia del contexto pragmático y cultural. Al estar construido sobre una arquitectura BERT base con 109,85 millones de parámetros y una ventana de contexto típica de 512 tokens, es un modelo ligero y desplegable en hardware modesto, orientado a investigación y a prototipos de análisis de sentimiento irónico más que a producción a gran escala.

Su relevancia actual es limitada pero específica: cubre un hueco poco poblado en el ecosistema hispanohablante, donde los recursos para detección de sarcasmo son escasos y los resultados publicados en el conjunto de prueba (F1 macro de 0,9157 y accuracy de 0,92) son razonables para un clasificador de este tamaño. No obstante, se trata de un artefacto académico con solo 24 descargas y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, BETO) |
| Parametros totales | 109.852.418 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (arquitectura BERT base, tipicamente 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `dccuchile/bert-base-spanish-wwm-cased`, un transformer encoder de tipo BERT base entrenado con whole word masking sobre un corpus masivo en español. Sobre esa base se realizó un fine-tuning supervisado para clasificación binaria de secuencias, con una cabeza de clasificación de dos etiquetas (NO_SARCASMO, SARCASMO) sobre el dataset `Ernesto-1997/Sarcastic_spanish_dataset`.

Los hiperparámetros reportados en la model card son: batch size de 16, learning rate de 2e-05, precisión bf16 y un máximo de 10 épocas con early stopping (mínimo 6 épocas). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo técnicas adicionales de regularización o aumento de datos. Tampoco se documenta ningún proceso de RLHF, DPO ni innovación arquitectónica más allá del fine-tuning estándar; se trata, por tanto, de un ajuste convencional de un encoder preentrenado.

## Capacidades

- Clasificación binaria de texto en español: distingue entre contenido sarcástico y no sarcástico.
- Análisis de sentimiento con matiz irónico: útil como capa adicional sobre pipelines de opinión.
- Procesamiento de textos cortos y medios (frases, tuits, comentarios), propio de la arquitectura BERT base.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para comportamiento agéntico.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al español; no se ha validado en otras lenguas.
- Inferencia rápida y determinista sobre CPU y GPU, adecuada para clasificación por lotes.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede etiquetar automáticamente comentarios con carga irónica o sarcástica para priorizar la revisión humana o ajustar la respuesta de sistemas de moderación, gracias a su bajo coste computacional y a su licencia MIT.
- Análisis de opiniones de producto: integrar el clasificador como señal auxiliar en pipelines de análisis de sentimiento para separar reseñas genuinas de reseñas irónicas, evitando que un comentario sarcástico positivo se contabilice como satisfacción real.
- Investigación académica en pragmática computacional: servir como línea base reproducible para estudios sobre ironía y sarcasmo en español, dado que el modelo, el dataset y los hiperparámetros están documentados.
- Monitorización de reputación de marca: detectar menciones sarcásticas en redes sociales que los sistemas de sentimiento convencionales clasificarían erróneamente como positivas, especialmente en cuentas con alto volumen de interacciones.
- Enriquecimiento de datasets: usar el modelo para preetiquetar grandes corpus en español y acelerar la anotación humana de sarcasmo en proyectos de creación de recursos.
- Filtrado previo en sistemas de atención al cliente: marcar mensajes de usuarios con tono irónico para derivarlos a agentes humanos con contexto adicional, reduciendo respuestas automáticas inadecuadas.
- Docencia y talleres de PLN: ejemplo práctico de fine-tuning de BETO para clasificación, reutilizable en cursos de procesamiento de lenguaje natural en español.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de prueba del dataset `Ernesto-1997/Sarcastic_spanish_dataset`:

| Metrica | Valor |
|---|---|
| Precision (macro) | 0.9181 |
| Recall (macro) | 0.9136 |
| F1 (macro) | 0.9157 |
| Accuracy | 0.9200 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos, más overhead de activaciones y del runtime (en torno a 1-1,5 GB en total).
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB para pesos, con overhead adicional del framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100, aunque el modelo está sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes con latencias aceptables.
- Opciones de despliegue: `transformers` pipeline, Hugging Face Inference Endpoints, ONNX Runtime, TorchScript; también es convertible a GGUF para llama.cpp aunque no se distribuye en ese formato.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU (cientos a miles de secuencias por segundo en batch), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cadrojasl/beto-sarcasmo-spanish-2026 | 109,85 M | No disponible (BERT base, tip. 512) | Clasificación de sarcasmo (es) | MIT | Hugging Face, 24 descargas |
| dccuchile/bert-base-spansh-wwm-cased (BETO) | ~110 M | 512 | Modelo base de propósito general (es) | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos de análisis de sentimiento en español (p. ej. `finiteautomata/beto-sentiment-analysis`) | ~110 M | 512 | Análisis de sentimiento (es) | MIT/Apache según versión | Hugging Face |
| Modelos multilingües de sarcasmo basados en XLM-R | ~278 M | 512 | Sarcasmo multilingüe | MIT/Apache según versión | Hugging Face |

La comparativa se limita a alternativas de la misma familia arquitectónica y tarea; no se dispone de datos de rendimiento comparables entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Modelo académico con escasa validación externa: solo 24 descargas y ningún "like", sin evidencia de uso en producción ni evaluaciones independientes.
- Riesgo de sobreajuste al dataset de entrenamiento: las métricas reportadas proceden del conjunto de prueba del propio dataset y no de dominios externos.
- Sesgos potenciales heredados de BETO y del corpus de fine-tuning: el sarcasmo es altamente dependiente de la variedad dialectal, la cultura y el registro, por lo que el rendimiento puede degradarse fuera del español peninsular o en contextos formales.
- Riesgo de falsos positivos y negativos en textos ambiguos, ironía no marcada o sarcasmo que requiere conocimiento del mundo.
- Limitación de contexto: al ser un BERT base, no procesa documentos largos sin truncado o segmentación.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset de entrenamiento antes de un despliegue comercial.
- No es un modelo generativo: no debe emplearse para tareas de generación, resumen o diálogo.
- Sin documentación sobre cuantizaciones ni formatos alternativos de pesos, lo que limita su uso en entornos de inferencia optimizados sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cadrojasl/beto-sarcasmo-spanish-2026
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/Ernesto-1997/Sarcastic_spanish_dataset
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo en la búsqueda proporcionada (los resultados obtenidos tratan sobre estadísticas de NFT y no guardan relación).
