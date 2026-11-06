# mlx-community/d1a-e2b-it-qat-4bit

## Resumen

D1A-E2B-it QAT 4-bit es un modelo de decisión calibrado para Apple Silicon, publicado por el usuario JohnP1 y replicado byte a byte en la organización mlx-community. Se construye sobre Gemma 4 E2B-it QAT (google/gemma-4-E2B-it-qat-w4a16-ct), un modelo de la familia Gemma 4 con cuantización consciente del entrenamiento (QAT), al que se añade un adaptador LoRA sin fusionar (rango 16), una cabeza de puntero (pointer head) y una temperatura de calibración ajustada. Su función principal no es generar texto, sino responder preguntas cerradas (sí/no, opción múltiple o puntuación) devolviendo una probabilidad calibrada para cada opción en una sola pasada hacia adelante, sin texto generado, de modo que toda respuesta válida es siempre una de las opciones.

La versión v0.7 (actual en la rama main, publicada el 30 de octubre de 2026) incorpora un ajuste fino adicional en actos de diálogo e intenciones en inglés y japonés, mejorando sustancialmente la clasificación de actos de diálogo (de 72,1 a 88,0 puntos en su suite de evaluación) sin penalizar la latencia. El modelo conserva además las capacidades multimodales de Gemma 4 (visión, audio y vídeo mediante encoders bf16) y puede funcionar también como chatbot estándar si se desactiva el adaptador, ya que el tronco es Gemma 4 E2B-it QAT intacto.

Es relevante porque representa una tendencia emergente: modelos pequeños especializados en "sistema uno" (decisiones rápidas y calibradas) que ejecutan en local en hardware de consumo, con un footprint de 2,7 GB más 1,0 GB de encoders, y con licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer) + adaptador LoRA rango 16 sin fusionar + pointer head + temperatura de calibración |
| Parametros totales | 4.628.569.379 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit QAT (w4a16) en las 276 capas lineales del tronco; embeddings a 4-bit en grupos de 64; encoders multimodales en bf16 |
| Idiomas soportados | inglés y japonés (decisiones); el tronco Gemma 4 soporta más idiomas para chat (no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit) |

## Arquitectura y entrenamiento

El modelo se compone de cuatro piezas. El tronco es Gemma 4 E2B-it QAT, cuyas 276 capas lineales int4 se almacenan bit a bit en formato MLX 4-bit (mismas palabras empaquetadas y escalas, con error de dequantización 0,0), ocupando 2,7 GB. Encima va un adaptador D1A LoRA de rango 16 (97 MB) que no está fusionado: con el adaptador desactivado, el modelo es Gemma 4 E2B-it QAT puro y puede chatear con normalidad. Se añade una cabeza de puntero (head.safetensors) que produce las probabilidades por opción, y una temperatura de calibración de 1,91 almacenada en d1a_config.json, ajustada sobre 3.178 filas del split de calibración decision-v7 y del conjunto de desarrollo de etiquetado de PRs, reduciendo el error de calibración esperado de 0,084 a 0,030 out of fold. Los encoders de visión y audio de Gemma 4 (bf16, 1,0 GB) se incluyen sin cambios en el directorio media/.

El entrenamiento de v0.7 parte del adaptador de v0.6 (warm start) sobre el mismo tronco QAT, con una época de 7.008 registros: 2.100 del split de entrenamiento de MASSIVE 1.1 (inglés y japonés, 20 emisiones por intención y lengua, y todas las emisiones para las cuatro intenciones más raras), 1.248 registros adicionales de actos de diálogo (la model card se corta en este punto, por lo que la composición completa del dataset no está disponible). El dataset de referencia es AmazonScience/massive. No se menciona RLHF ni DPO; el enfoque es clasificación/decisión supervisada con calibración posterior.

## Capacidades

- Decisiones calibradas (endpoint /v1/systemone): ante un documento y varias preguntas cerradas (sí/no, opción múltiple o puntuación), devuelve una probabilidad calibrada para cada opción en una sola pasada, sin generar texto.
- Clasificación de actos de diálogo en inglés y japonés: detectar si el usuario aceptó lo pedido, si un mensaje es solo agradecimiento o contiene una petición, qué comando quiso dar o a qué elemento de una lista se refiere.
- Clasificación de intenciones: evaluado sobre MASSIVE 1.1 con 60 intenciones y opción "ninguna de estas".
- Chat en formato OpenAI (/v1/chat/completions, con streaming): al ser el tronco Gemma 4 E2B-it QAT, el mismo modelo sirve conversación estándar con el adaptador desactivado.
- Multimodalidad: fotos, clips de voz y vídeo mediante el endpoint /v1/systemone/media, gracias a los encoders de visión y audio de Gemma 4 en bf16.
- Etiquetado de pull requests y detección de urgencia (según los suites de evaluación y demos descritos).
- Ejecución on-device en Apple Silicon mediante MLX.

## Casos de uso

- Atención al cliente automatizada: el modelo puede decidir en cada turno si el usuario aceptó una propuesta, si su mensaje contiene una petición oculta tras un agradecimiento, o si se trata de una orden literal, lo que permite enrutar conversaciones multi-turno sin generar respuestas.
- Clasificación de intenciones en asistentes de voz: entrenado con MASSIVE 1.1 en inglés y japonés, puede clasificar emisiones de voz en 60 intenciones (más "ninguna de estas") directamente desde clips de audio gracias al encoder de audio.
- Triaje de pull requests: los suites de evaluación incluyen etiquetado de PRs reales revisados a mano y detección de flags de urgencia, útil en pipelines de CI para priorizar revisiones.
- Validación de documentos: dado un documento y preguntas de verificación (sí/no, opción múltiple), devuelve probabilidades calibradas por opción, adecuado para flujos de cumplimiento o revisión contractual con respuesta acotada.
- Agentes con enrutado rápido de bajo coste: como "modelo de sistema uno", puede decidir en milisegundos qué herramienta o rama ejecutar un agente multi-paso, delegando la generación al modelo principal.
- Asistentes on-device en Apple Silicon: con 3,7 GB totales (tronco más encoders), cabe en portátiles Mac con memoria unificada, sin envío de datos a servidores, útil para dominios con privacidad estricta.
- Análisis conversacional bilingüe inglés-japonés: la v0.7 mejora específicamente la detección de actos de diálogo en ambos idiomas (88,0 y 85,1 puntos), útil para analítica de call centers o chatbots en mercado japonés.

## Benchmarks y rendimiento

Datos publicados en la model card (Apple M1 Max, ambas versiones servidas, Δ en puntos con intervalos de confianza al 95% emparejados):

Actos de diálogo (498 preguntas held-out, diez dominios no usados en entrenamiento):

| Conjunto | v0.6 | v0.7 | Δ |
|---|---|---|---|
| Total | 72,1 | 88,0 | +15,9 [+12,2, +19,7] |
| Inglés | 73,9 | 90,8 | +16,9 [+12,0, +22,1] |
| Japonés | 70,3 | 85,1 | +14,9 [+9,2, +20,5] |

Intenciones en MASSIVE 1.1 (60 intenciones, inglés y japonés, con opción "ninguna de estas"):

| Conjunto | v0.6 | v0.7 | Δ |
|---|---|---|---|
| Escenarios vistos en entrenamiento | 70,8 | 69,7 | −1,2 [−3,7, +1,5] |
| Escenarios held-out | 78,0 | 80,0 | +2,0 [−0,3, +4,3] |

Resto de suites (agregado): −0,38 [−0,87, +0,09] agrupado sobre 22 suites; una mejora significativa (devtools-v1, +1,7 [+0,3, +3,0]) y ninguna pérdida significativa. Error de calibración esperado: 0,084 → 0,030 out of fold tras el ajuste de temperatura; empeora en algunos suites concretos (typesafe 0,061 → 0,100; JGLUE test 0,027 → 0,048; WANLI 0,175 → 0,205 y 0,187 → 0,215; PRs revisados a mano 0,104 → 0,149) y mejora en documents-v1 (0,045 → 0,026) y night2 dates (0,042 → 0,022). No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 2,7 GB para el tronco cuantizado más 1,0 GB para los encoders de visión y audio, unos 3,7 GB en total; cualquier Mac con Apple Silicon y memoria unificada suficiente lo ejecuta.
- GPU recomendadas: está diseñado específicamente para Apple Silicon (MLX); se ha medido en Apple M1 Max. No se describe soporte para CUDA (A100, H100, RTX 4090) en la información disponible.
- Consumer GPU: no requiere GPU dedicada; funciona en portátiles y sobremesas Apple Silicon de consumo. En GPU NVIDIA no hay soporte descrito.
- Despliegue: mediante MLX (librería del repo). La model card describe un servidor con endpoints /v1/systemone, /v1/systemone/media y /v1/chat/completions (formato OpenAI, con streaming). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card indica que la velocidad no cambió entre v0.6 y v0.7 (mismo trabajo por respuesta), pero no publica cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1a-e2b-it-qat-4bit (v0.7) | ~4,63 B (2,7 GB en disco) | Decisiones calibradas + chat + multimodal | 4-bit QAT (MLX) | Apache 2.0 | mlx-community y JohnP1 en Hugging Face |
| google/gemma-4-E2B-it-qat-w4a16-ct (base) | no disponible en la información proporcionada | Chat general multimodal | 4-bit QAT (w4a16) | no disponible | Google en Hugging Face |
| JohnP1/d1a-e2b-it-qat-mlx-q4 (v0.6) | mismos pesos, adaptador distinto | Decisiones calibradas (sin ajuste de actos de diálogo v0.7) | 4-bit QAT (MLX) | Apache 2.0 | Hugging Face, revision 5bff9582 |

No se conocen otros modelos comparables de la categoría "modelo de decisión calibrado on-device" con datos suficientes en la información disponible.

## Limitaciones y advertencias

- No mejoró en clasificación de intenciones: en escenarios vistos en entrenamiento de MASSIVE 1.1 la precisión bajó ligeramente (70,8 → 69,7) y tiende a elegir "ninguna de estas" algo más a menudo cuando sí existe una intención válida (37 veces frente a 30 en 600).
- Calibración ligeramente peor en varios suites: la temperatura subió de 1,55 a 1,91 y el error de calibración esperado aumentó en typesafe, JGLUE test, WANLI y PRs revisados a mano. Si tu aplicación depende de probabilidades bien calibradas, verifica en tu dominio.
- Idiomas limitados para decisiones: las capacidades de decisión están ajustadas solo para inglés y japonés; otros idiomas no están cubiertos por el ajuste fino de v0.7.
- El release de v0.7 pasó por una auditoría con veto de latencia (decide.py V3) que se activó; aunque una medición posterior atribuyó la diferencia a los ficheros servidos y no al modelo, el veto se mantuvo y la versión se publicó por decisión del propietario. Conviene medir latencia en tu propio entorno.
- Riesgo de alucinación: no cuantificado en la model card; al no generar texto en modo decisión, el riesgo se reduce en ese modo, pero en modo chat hereda las limitaciones del Gemma 4 base.
- Sesgos conocidos: no se documentan explícitamente; los datos de entrenamiento provienen de corpora (MASSIVE 1.1, actos de diálogo) cuyos sesgos pueden transferirse.
- Licencia: Apache 2.0 permite uso comercial; no se identifican restricciones adicionales, aunque conviene revisar los términos del modelo base Gemma 4 de Google para despliegues derivados.
- Es un modelo etiquetado como experimental por sus propios autores; el pipeline declarado en Hugging Face es text-classification, no generación de texto.

## Enlaces

- Modelo (esta ficha): https://huggingface.co/mlx-community/d1a-e2b-it-qat-4bit
- Repositorio original espejado: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Model card de la versión v0.6: https://huggingface.co/mlx-community/d1a-e2b-it-qat-4bit/blob/v0.6/README.md
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Dataset de entrenamiento: https://huggingface.co/datasets/AmazonScience/massive
- Organización mlx-community: https://huggingface.co/mlx-community
