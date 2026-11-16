# Raghav-Singhal/1pp-0.58b-v2-filt-base

## Resumen

1pp-0.58b-v2-filt-base es un modelo de lenguaje de tipo base, con 580.445.568 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación concebido para medir el efecto del filtrado de datos en el preentrenamiento a escala pequeña. Concretamente, reproduce la condición "Filtered" de la escalera de escalado 1PP sobre el corpus crudo original (documentos DCLM-edu), con semilla 28.

La particularidad metodológica del modelo es que no elimina los documentos marcados por el clasificador de seguridad, sino que los mantiene en contexto dentro de las secuencias de entrenamiento pero les asigna pérdida cero. El resultado es una comparación controlada byte a byte con el modelo crudo de referencia (`1pp-0.58b-v2-raw-base`), que permite aislar el efecto del enmascaramiento de pérdida sobre documentos filtrados sin alterar el empaquetado de los datos ni el número de pasos.

Arquitectónicamente es un decoder estilo Llama de 24 capas, ocultación 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV, con una longitud de secuencia de 4.096 tokens y un vocabulario de 49.152 entradas derivado de SmolLM2. Su relevancia es fundamentalmente metodológica: proporciona un punto de comparación reproducible para estudiar cómo el filtrado de calidad afecta a las pérdidas de validación en modelos por debajo de los 1.000 millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU) |
| Parámetros totales | 580.445.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings no atados, sin sesgos y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`, y `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens con enmascaramiento de atención entre documentos.

El preentrenamiento recorre 11.106 pasos del flujo alineado por pasos del run crudo, lo que equivale a 23.290 millones de posiciones de token, con batch global de 512 × 4.096 tokens. El optimizador es Muon (escalado por forma, learning rate matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 699 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16. La innovación clave no es arquitectónica sino de tratamiento de datos: un clasificador de seguridad basado en gte, puntuado por fragmento, marcó 3.869.498 documentos (4,6 %) cuyo fragmento con mayor puntuación alcanza al menos 3. Esos documentos permanecen en las secuencias (en contexto) pero reciben pérdida cero, mientras que el resto se entrena igual que en el run crudo. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación, con diferencias absolutas de 0,0018 y 0,0019.

## Capacidades

- Generación de texto plano en inglés a partir de documentos: es un modelo base, no ajustado por instrucciones.
- Modelado de lenguaje causal con enmascaramiento de atención entre documentos.
- Formato de chat ChatML sin turno de sistema, aunque al ser un modelo base produce texto plano y no responde como asistente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Integración con text-generation-inference y endpoints compatibles según los tags del repositorio.

## Casos de uso

- Investigación sobre filtrado de datos: sirve como condición de control "Filtered" frente al modelo crudo para medir el efecto del enmascaramiento de pérdida en documentos marcados por un clasificador de calidad o seguridad, manteniendo idéntico el empaquetado de datos.
- Reproducibilidad de experimentos de escalado: al compartir paso, batch, schedule y corpus con `1pp-0.58b-v2-raw-base`, permite replicar comparaciones de pérdida de validación en entornos de investigación con recursos limitados.
- Estudio de clasificadores de seguridad: los 3.869.498 documentos marcados y su tratamiento permiten analizar el impacto de umbrales de puntuación en el entrenamiento sin descartar datos del contexto.
- Baseline para ajuste fino posterior: al ser un modelo base de 0,58B con licencia Apache 2.0, puede usarse como punto de partida en experimentos de SFT o DPO a pequeña escala.
- Evaluación de pérdidas por tipo de texto: las pérdidas de validación documentadas (2,625 en texto de documento, 2,803 en texto de asistente, 2,821 en texto de usuario) permiten calibrar métricas de calidad en corpus conversacionales reescritos.
- Docencia y formación: adecuado para ilustrar en cursos de NLP las diferencias entre modelos base y ajustados, y el efecto de decisiones de preprocesamiento sobre las curvas de pérdida.
- Pruebas de infraestructura de despliegue: su tamaño reducido (1,2 GB en safetensors) permite validar pipelines de transformers, TGI o endpoints compatibles sin coste elevado de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta pérdidas de validación del checkpoint final:

| Conjunto de validación | Pérdida |
|---|---|
| Texto de documento | 2,625 |
| Texto de asistente | 2,803 |
| Texto de usuario | 2,821 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,8014 | 2,8032 | 0,0018 |
| raw_val50m segments [8] | 2,6269 | 2,6250 | 0,0019 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16/fp16 para los 580 millones de parámetros, más el overhead de activaciones y caché KV; en la práctica, menos de 3 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes, aunque las de gama alta quedan sobredimensionadas.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-filt-base | 580 M | 4.096 | Apache 2.0 | Condición Filtered con pérdida cero en documentos marcados |
| 1pp-0.58b-v2-raw-base | 580 M | 4.096 | Apache 2.0 | Run crudo de referencia, mismo corpus y schedule |
| SmolLM2 (familia) | 135 M / 360 M / 1,7 B | 8.192 (en variantes recientes) | Apache 2.0 | Modelo base de propósito general con vocabulario compartido |
| Modelos de ~0,5B de propósito general | ~500 M | variable | variable | No disponible comparación de rendimiento por ausencia de benchmarks publicados |

La comparación directa más relevante es con `1pp-0.58b-v2-raw-base`, que comparte arquitectura, datos y schedule y difiere únicamente en el tratamiento de pérdida de los documentos filtrados.

## Limitaciones y advertencias

- Es un modelo base entrenado sobre documentos: no está ajustado por instrucciones y no debe usarse como asistente conversacional.
- Solo soporta inglés; no se documenta cobertura multilingüe.
- Riesgo de alucinación y de generar contenido sesgado o inapropiado, ya que los documentos marcados por el clasificador de seguridad permanecen en contexto aunque no reciban pérdida.
- El filtrado no elimina los documentos del contexto, por lo que el modelo puede haber aprendido patrones de contenido marcado a través de la atención.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Sin benchmarks estándar publicados, por lo que no es posible evaluar su calidad frente a alternativas de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe explícitamente como artefacto de investigación y no como modelo de propósito general.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- No se documentan cuantizaciones GGUF, AWQ o GPTQ, lo que limita opciones de despliegue en entornos de bajo consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-filt-base
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
