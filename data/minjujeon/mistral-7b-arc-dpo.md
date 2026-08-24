# minjujeon/mistral-7b-arc-dpo

## Resumen

`minjujeon/mistral-7b-arc-dpo` es un fine-tune del modelo base Mistral-7B-v0.1, desarrollado por minjujeon como parte de una prueba de deep learning del programa AIRE de Upstage. El objetivo es mejorar el rendimiento en el benchmark ARC-Challenge (razonamiento de sentido común en ciencia). Se trata de un modelo de generación de texto de 7.241 millones de parámetros con arquitectura transformer decoder y atención de ventana deslizante (SWA).

El modelo se entrena en dos etapas: primero un ajuste fino supervisado (SFT) sobre los conjuntos de entrenamiento de ARC-Challenge y ARC-Easy, y después una optimización por preferencias (DPO) sobre 8.025 pares de respuestas sintéticas generadas por un modelo teacher (Qwen3.8-27B). El resultado es una mejora sustancial en ARC-Challenge: 71,84 de precisión normalizada frente a 61,07 del modelo base, superando la puntuación de referencia de 61,43 que había que batir.

La relevancia actual radica en que demuestra una receta reproducible de fine-tune de bajo coste (LoRA, dos etapas) para mejorar tareas de razonamiento en un modelo abierto de 7B, con un pipeline de generación sintética y auditoría de contaminación publicado aparte. El checkpoint final está fusionado en bf16 y distribuido en formato safetensors bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con sliding window attention (Mistral-7B-v0.1) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 4.096 (ventana de atencion deslizante del base) |
| Tipos de cuantizacion | no especificada; pesos en bf16 (el checkpoint se publica en precision bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-v0.1: un transformer decoder autoregresivo con 32 capas, atención de ventana deslizante (SWA) de 4.096 tokens y normalización RMSNorm. El fine-tune se realizó en dos etapas, ambas con LoRA (r=32, alpha=64) aplicado a las siete proyecciones de atención, y posteriormente fusionado en el checkpoint final en bf16.

La primera etapa es un SFT sobre 3.370 ítems (train de ARC-Challenge + ARC-Easy), formateados exactamente como el harness de evaluación (`Question: ...\nAnswer:`), con pérdida enmascarada solo sobre el tramo de respuesta. Se usó una tasa de aprendizaje de 1e-4 con decaimiento coseno y 2 épocas. La segunda etapa aplica DPO sobre 8.025 pares de respuesta correcta vs. distractor, extraídos de un pool sintético de 2.675 preguntas generadas por Qwen3.8-27B, verificadas por etiquetas y filtradas por fallos del modelo SFT (hard mining). Se usó beta 0.1, con hard-pair gating y un anclaje de NLL de la respuesta elegida. El pool sintético fue auditado contra contaminación (solapamiento exacto y de 8-gramas con test y validación de ARC-C/E).

## Capacidades

- Generación de texto autoregresiva en inglés, con formato de pregunta-respuesta de opción múltiple.
- Razonamiento de sentido común en preguntas de ciencia de nivel escolar (ARC-Challenge).
- Mejora significativa de precisión en ARC-Challenge frente al base (71,84 vs. 61,07), lo que indica una capacidad robusta de selección de respuesta correcta entre distractores.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades multimodales (visión, audio) ni modos de thinking.
- Monolingüe: solo inglés.

## Casos de uso

- Evaluación de técnicas de alineación: el modelo sirve como referencia para comparar recetas de SFT+DPO con LoRA en tareas de razón de sentido común, dado que el proceso de entrenamiento está documentado en detalle.
- Generación de preguntas de opción múltiple de ciencia: su entrenamiento con pares sintéticos permite generar ítems de práctica en formato ARC, útil para crear datasets educativos.
- Fine-tune de dominio en educación: partiendo de este checkpoint, se puede continuar el ajuste para tareas de QA educativa en ciencias, gracias a su base Mistral-7B y su licencia Apache 2.0.
- Investigación en DPO con datos sintéticos: el modelo ilustra cómo usar un teacher grande (Qwen3.8-27B) para generar pares de preferencia y hard mining, reproducible en entornos de investigación.
- Prototipos de sistemas de respuesta a preguntas de ciencia: puede integrarse en aplicaciones de tutoría inteligente o asistentes educativos que responden a preguntas de opción múltiple de nivel escolar.
- Pruebas de despliegue en infraestructura open source: al estar en safetensors y ser compatible con text-generation-inference, sirve para validar pipelines de vLLM, llama.cpp o TGI con modelos de 7B.

## Benchmarks y rendimiento

Se han publicado resultados en ARC-Challenge bajo el protocolo oficial de lm-evaluation-harness (25-shot, cuatro semillas de few-shot). No hay datos de otros benchmarks (MMLU, GSM8K, HumanEval, etc.) en la información disponible.

| Modelo | acc_norm (media 4 semillas ± desviacion) |
|---|---|
| Mistral-7B-v0.1 (base) | 61,07 ± 0,36 |
| + SFT solo | 67,04 ± 0,50 |
| + SFT + DPO (este modelo) | 71,84 ± 0,48 |
| Qwen3.8-27B (teacher) | 73,21 (una sola semilla) |

El modelo supera la puntuación de referencia de 61,43 y se aproxima al rendimiento del teacher, que tiene 3,7 veces más parámetros. La diferencia entre el modelo final y el teacher es de 1,37 puntos porcentuales, dentro de la desviación estándar del teacher medida con una sola semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 14,5 GB (pesos), por lo que se necesita al menos 16 GB de VRAM para cargar en fp16/bf16 sin cuantización.
- GPU recomendadas: para bf16 completa, una RTX 4090 (24 GB) o A6000 (48 GB) son adecuadas. Con cuantización de 4 bits (GGUF o GPTQ), cabe en GPUs de 8 GB como la RTX 4060 Ti o RTX 3060.
- Entrenamiento documentado: 2x RTX A6000 para el pipeline completo; la variante QLoRA del SFT se reproduce en una sola T4 (16 GB).
- Opciones de despliegue: compatible con text-generation-inference (TGI), vLLM, llama.cpp, Ollama y cualquier framework que soporte transformers con safetensors.
- Latencia y throughput estimados: no disponibles en la documentación. Para un modelo de 7B en una RTX 4090, se puede esperar entre 30 y 80 tokens por segundo con cuantización 4 bits, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Model | Parametros | Contexto | acc ARC-Challenge (25-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjujeon/mistral-7b-arc-dpo | 7,24B | 4.096 | 71,84 ± 0,48 | Apache 2.0 | HuggingFace |
| mistralai/Mistral-7B-v0.1 (base) | 7,24B | 4.096 | 61,07 ± 0,36 | Apache 2.0 | HuggingFace |
| HyeongSoo/mistral-7b-arc-chal-dpo | 7,24B | 4.096 | no disponible | no disponible | HuggingFace |
| ingeol/mistral-7b-arc-cpt-dpo | 7,24B | 4.096 | no disponible | no disponible | HuggingFace |
| Qwen3.8-27B (teacher) | 27B | no disponible | 73,21 (una semilla) | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos similares de HyeongSoo e ingeol, por lo que no se puede establecer una comparativa cuantitativa con ellos. El teacher Qwen3.8-27B supera al modelo en ARC, pero con 3,7 veces más parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente en inglés y sobre preguntas de ciencia de ARC; puede mostrar sesgos derivados de la distribución del dataset original de ARC y de los datos sintéticos del teacher.
- Riesgo de alucinación: no se ha evaluado en tareas de generación libre; su entrenamiento está orientado a preguntas de opción múltiple y puede producir respuestas incorrectas o inventadas fuera de ese formato.
- Limitaciones de contexto: la ventana de 4.096 tokens del base limita el manejo de contextos largos; no se ha extendido el contexto en este fine-tune.
- Sobreajuste al formato: el SFT se hizo en el formato exacto del harness (`Question: ...\nAnswer:`), por lo que el rendimiento puede degradarse si se usa con otros formatos de prompt.
- Generalización: solo se reportan resultados en ARC-Challenge; no hay evidencia de rendimiento en otros benchmarks de razonamiento o generación.
- Datos sintéticos: el DPO usa pares generados por un teacher; aunque se auditó la contaminación, existe riesgo de que el modelo aprenda patrones del teacher que no generalicen.
- Adopción: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad; se recomienda probar en un entorno controlado antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/minjujeon/mistral-7b-arc-dpo
- Anuncio de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Documentacion de Mistral 7B v0.2: https://docs.mistral.ai/models/mistral-7b-0-2
- Modelo similar (HyeongSoo/mistral-7b-arc-chal-dpo): https://huggingface.co/HyeongSoo/mistral-7b-arc-chal-dpo
- Modelo similar (ingeol/mistral-7b-arc-cpt-dpo): https://huggingface.co/ingeol/mistral-7b-arc-cpt-dpo
- Despliegue en FriendliAI (modelo similar): https://friendli.ai/models/HyeongSoo/mistral-7b-arc-chal-dpo
