# Jeesup/svd-safety-l2_svdllmorc96_r40

## Resumen

`Jeesup/svd-safety-l2_svdllmorc96_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión por descomposición en valores singulares (SVD) mediante la técnica SVD-LLM, eliminando el 40,00 % de los parámetros densos (fracción resultante de 0,5998). Posteriormente se recuperó parte de la capacidad perdida con una etapa de LoRA secuencial (primero U, luego V) entrenada sobre alpaca-cleaned con rango 8, alpha 16, 2 épocas, learning rate 1e-4, batch 64 y longitud de corte 256 en bf16.

El modelo no es un asistente conversacional de propósito general, sino una celda concreta de una rejilla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. Para ello, el conjunto de calibración combina utilidad (WikiText-2) y seguridad (96 prompts de OR-Bench-hard-1k con respuestas conformes del propio Llama-2-7b-chat), con una cuota efectiva de seguridad del 8,79 % de las posiciones.

Su relevancia es metodológica: documenta de forma explícita la procedencia de la calibración, la semilla (42) y las métricas medidas (ASR en AdvBench y StrongREJECT, sobrerrechazo macro con WildGuard, perplejidad en WikiText-2 y precisión zero-shot media en 7 tareas), lo que permite reproducir y comparar el equilibrio seguridad/utilidad bajo compresión. El repositorio ocupa 13,5 GB y contiene 6.738.415.616 parámetros según los pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con capas lineales comprimidas por SVD-LLM y adaptadores LoRA de recuperación |
| Parametros totales | 6.738.415.616 (fracción 0,5998 respecto al denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-2-7b-chat soporta 4096 tokens; el checkpoint no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados en la model card) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Llama-2-7b-chat, un transformer decoder-only con atención causal estándar y normalización RMSNorm, y le aplica SVD-LLM, que descompone las matrices de pesos lineales y descarta componentes según una regla de selección basada en un SVD blanqueado. La calibración se construye sobre un conjunto agrupado: por un lado, WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) usando todas las posiciones; por otro, los primeros 96 de 157 prompts de OR-Bench-hard-1k (tóxicos aparentes pero benignos) junto con las respuestas conformes de Llama-2-7b-chat (orden con semilla 42), empaquetados como una conversación por muestra con 50.328 posiciones en total.

Tras la compresión al 60,0 % de parámetros densos, se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, entrenado con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. La innovación metodológica es el uso de una regla de selección de componentes que pondera utilidad y seguridad, y la cuantificación explícita de la cuota efectiva de seguridad (0,0879 de las posiciones) en el conjunto de calibración.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones en inglés (el modelo base está optimizado para inglés; el checkpoint no declara idiomas adicionales).
- Generación de código y matemáticas básicas, en la medida en que lo soporte el modelo base (no se documentan evaluaciones específicas en esta ficha).
- Tool calling / function calling: no documentado en la model card; debe validarse empíricamente antes de asumirlo.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no declaradas; dependen del modelo base.
- Modo de razonamiento explícito (thinking), visión o audio: no soportados.
- Comportamiento de seguridad medido: ASR de 0,0058 en AdvBench y 0,0224 en StrongREJECT con el juez HarmBench, y sobrerrechazo macro de 0,5457 con WildGuard.

## Casos de uso

- Estudio de compresión y seguridad: usar el checkpoint como celda de control en una rejilla experimental para medir cómo varía el ASR (AdvBench, StrongREJECT) al cambiar la regla de selección de componentes SVD y la cuota de calibración de seguridad.
- Investigación en interpretabilidad: analizar qué componentes (U, V) son responsables de la degradación de seguridad y comparar con las otras celdas de la rejilla del mismo autor.
- Reproducción de resultados: reentrenar la etapa LoRA con los hiperparámetros documentados (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16) y verificar las métricas publicadas (perplejidad 11,2216 en WikiText-2, precisión zero-shot media 0,4963 en 7 tareas).
- Evaluación de sobrerrechazo: emplear el checkpoint para estudiar el equilibrio entre rechazo de peticiones benignas (0,5457 macro con WildGuard) y robustez frente a ataques, comparándolo con el modelo denso.
- Benchmarking de pipelines de compresión: integrar el checkpoint en un pipeline que compare SVD-LLM con otras técnicas (poda, cuantización) usando las mismas métricas de utilidad y seguridad.
- Docencia y divulgación: ilustrar en un curso o artículo cómo una compresión al 60 % de parámetros afecta a la perplejidad y a la tasa de éxito de ataques, con cifras reproducibles y semilla fija.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0058 |
| StrongREJECT ASR (juez HarmBench) | 0,0224 |
| Sobrerrechazo macro (WildGuard) | 0,5457 |
| Perplejidad WikiText-2 | 11,2216 |
| Precisión zero-shot media (7 tareas, acc_norm cuando se reporta) | 0,4963 |

No se han publicado en la información disponible resultados comparativos frente a Llama-2-7b-chat denso ni frente a otras celdas de la rejilla; las cifras anteriores corresponden únicamente a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: del orden de 7-8 GB de pesos; en 4 bits, del orden de 4 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala y contextos largos; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 con contexto contenido, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits (requiere convertir los pesos, no incluidos en el repo).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmorc96_r40 (este) | 6.738.415.616 (60 % del denso) | no disponible | Llama 2 Community | ASR AdvBench 0,0058; StrongREJECT 0,0224; sobrerrechazo 0,5457; PPL WikiText-2 11,2216 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | 4096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia para medir la degradación por SVD |
| Otras celdas de la rejilla del mismo autor | variable (según presupuesto) | no disponible | Llama 2 Community | Misma metodología con distintas reglas de selección y presupuestos; no se detallan aquí |

No se dispone de comparativas publicadas frente a otros modelos comprimidos (por ejemplo, variantes podadas o cuantizadas de Llama-2-7b-chat) en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un artefacto de investigación y varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- La compresión por sí sola eleva la tasa de éxito de ataques; el propio autor advierte de que debe evaluarse el checkpoint antes de extraer conclusiones.
- El sobrerrechazo macro de 0,5457 con WildGuard indica una tendencia elevada a rechazar peticiones benignas, lo que limita su uso conversacional directo.
- Riesgo de alucinación inherente al modelo base Llama-2-7b-chat, no mitigado por la compresión ni por la etapa LoRA.
- Idiomas soportados no declarados; el modelo base está orientado al inglés y no se garantiza un rendimiento equivalente en castellano.
- Longitud de contexto no declarada en el checkpoint; debe asumirse la del modelo base (4096 tokens) hasta validación empírica.
- Licencia Llama 2 Community: restricciones de uso comercial y de redistribución según `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; cualquier uso derivado queda vinculado a esos términos.
- Sin descargas ni likes en el momento de la consulta, y sin variantes cuantizadas publicadas; el despliegue en producción requeriría trabajo adicional de conversión y validación.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmorc96_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de SVD-LLM citado por el autor: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: incluida en el repositorio (`LICENSE.txt`, `USE_POLICY.md`)
