# fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_round-int8-gs64-sym

## Resumen

Esta ficha describe una versión cuantizada a INT8 del modelo allenai/Llama-3.1-Tulu-3-8B-DPO, publicada por el usuario fbaldassarri en Hugging Face. Se trata de un artefacto de cuantización de solo pesos (weights-only quantization, WoQ) generado con Intel AutoRound v0.16.0, pensado para inferencia eficiente en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost de la serie Core Ultra) a través de OpenVINO. El modelo base es un ajuste fino de Llama 3.1 8B realizado por AI2 (Allen Institute for AI) dentro de la familia Tulu 3, con una etapa adicional de DPO (Direct Preference Optimization) para alineamiento conversacional.

El artefacto no introduce arquitectura nueva: hereda la del transformer decoder-only de Llama 3.1 con GQA, y su interés práctico reside en la reducción de huella de memoria (8 bits por peso, grupo de 64, simétrico) manteniendo una calidad cercana al original en bfloat16. El repositorio ocupa 11,5 GB, aunque el recuento real de parámetros reportado en safetensors es de 2.932.150.272, un dato que no coincide con los aproximadamente 8 mil millones esperables en un Llama 3.1 8B y que conviene verificar antes de desplegarlo.

Es relevante ahora porque permite ejecutar un modelo conversacional alineado de la familia Llama 3.1 en equipos sin GPU dedicada NVIDIA, aprovechando las unidades de cómputo de las plataformas Intel recientes, con una licencia Apache 2.0 declarada. La model card advierte que el artefacto se ha desarrollado solo con fines de investigación, aunque la licencia del modelo base y de esta cuantización es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Llama 3.1), cuantización WoQ AutoRound (SignRound) |
| Parametros totales | 2.932.150.272 según safetensors del repo (el modelo base se denomina 8B; discrepancia no aclarada en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3.1 soporta 128K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | INT8, group size 64, simétrico, weights-only (WoQ), calibración con torch.bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, auto_round) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1, un transformer decoder-only causal con atención multi-cabeza agrupada (GQA), activaciones SwiGLU y normalización RMSNorm, tal como se deduce de los tags `llama`, `causal-lm` y `model_type: llama`. Sobre esa base, AI2 aplicó su pipeline Tulu 3, que incluye ajuste supervisado y una etapa de DPO para alineamiento con preferencias; el sufijo `-DPO` del nombre del modelo base indica que esta es la variante tras esa etapa de optimización por preferencias. La información disponible no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

La contribución de este artefacto es la cuantización: Intel AutoRound v0.16.0 con 8 bits, grupo de 64 y esquema simétrico, calibrado sobre 128 muestras de 512 tokens con 200 iteraciones de ajuste y batch de 4, ejecutado en CPU con torch 2.14.1+cpu y transformers 4.55.3. El proceso de cuantización tardó 41.882,4 segundos (unas 698 minutos). El resultado son pesos INT8 con metadatos de cuantización (`quantization_config`) que transformers interpreta al cargar, y que pueden acelerarse en CPU Intel mediante intel-extension-for-pytorch, en iGPU Arc y en NPU Core Ultra vía OpenVINO. No se documentan innovaciones de decodificación especulativa ni mecanismos de atención alternativos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat propia (modelo instruct/chat, no base).
- Razonamiento y respuesta a instrucciones heredados del ajuste Tulu 3 y de la etapa DPO del modelo base.
- Generación de código y resolución de problemas matemáticos, capacidades propias de la familia Llama 3.1 y del entrenamiento Tulu 3 (no cuantificadas específicamente en esta ficha).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible para esta variante; el modelo base Tulu 3 incluye capacidades de este tipo, pero no se verifica aquí.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Multilingüismo limitado: el tag de idioma es únicamente `en`.
- Sin visión, audio ni modo thinking documentados en esta variante.

## Casos de uso

- Asistente conversacional en estaciones de trabajo Intel: desplegar el modelo en CPU con intel-extension-for-pytorch para un chatbot interno en inglés, aprovechando la cuantización INT8 para reducir el consumo de memoria frente a bfloat16.
- Inferencia en portátiles con iGPU Arc: ejecutar el modelo en equipos Core Ultra con gráficos integrados mediante OpenVINO o IPEX, sin necesidad de GPU NVIDIA dedicada, para tareas de resumen y redacción.
- Prototipado en NPU (AI Boost): validar flujos de generación de texto en la NPU de procesadores Core Ultra para aplicaciones de baja latencia y bajo consumo en entornos de investigación.
- Generación de código asistida en local: usar el modelo como autocompletado o generador de fragmentos en un IDE, siempre que el entorno sea Intel y el idioma de trabajo sea inglés, con la advertencia de que la calidad en código no se ha medido en esta cuantización.
- Evaluación comparativa de cuantizaciones: servir como referencia INT8 gs64 simétrica frente a otras variantes (INT4, GPTQ, AWQ) del mismo modelo base en estudios de degradación por cuantización.
- Filtrado y clasificación de texto en pipelines por lotes: procesar grandes volúmenes de documentos en inglés en servidores CPU, donde el throughput prima sobre la latencia interactiva.
- Reproducibilidad de experimentos: replicar exactamente la cuantización con el recetario documentado (auto-round-pipeline y los parámetros de calibración) para auditorías o publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo en bfloat16, por lo que no es posible cuantificar la degradación introducida por la cuantización INT8.

## Requisitos de hardware

- VRAM/RAM estimada: con pesos INT8 y grupo de 64, la huella de pesos ronda los 3 GB según el recuento de safetensors reportado (2.932 millones de parámetros), aunque el tamaño del repo es de 11,5 GB; conviene presupuestar memoria adicional para activaciones, caché KV y overhead del runtime. No se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: el artefacto está orientado a CPU Intel, iGPU Arc (por ejemplo Core Ultra 185H) y NPU AI Boost de la serie Core Ultra; no se documenta soporte prioritario para A100, H100 o RTX 4090, aunque al ser un checkpoint de transformers podría cargarse en CUDA si el runtime lo permite (no verificado).
- ¿Cabe en GPU de consumo? Por tamaño de pesos sí cabría en GPUs con 8 GB o más, pero la cuantización está pensada para aceleración Intel y no se garantiza rendimiento óptimo en NVIDIA.
- Opciones de despliegue: transformers (con `device_map="auto"`), intel-extension-for-pytorch para CPU/iGPU, OpenVINO para NPU; el tag `text-generation-inference` sugiere compatibilidad con TGI, no verificada. No se documenta soporte de llama.cpp, Ollama ni vLLM para este formato `auto_round`.
- Latencia y throughput: no disponibles. El único dato temporal es la duración de la cuantización (41.882,4 s en CPU), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_round-int8-gs64-sym | 2.932.150.272 según safetensors (base 8B) | No disponible | INT8 gs64 simétrica (AutoRound) | Apache 2.0 | Hugging Face, 17 descargas |
| allenai/Llama-3.1-Tulu-3-8B-DPO (modelo base) | ~8B | 128K (Llama 3.1) | bfloat16 | Apache 2.0 | Hugging Face (AI2) |
| Otras cuantizaciones del mismo base (GPTQ/AWQ/INT4) | ~8B | 128K | Variable | Apache 2.0 | Hugging Face, según autor |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Discrepancia en el recuento de parámetros: safetensors reporta 2.932.150.272 parámetros frente a los ~8B esperables del modelo base; verificar la integridad del checkpoint antes de usarlo en producción.
- Idiomas: solo inglés (`en`); no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos: no documentados en la model card; hereda los sesgos del corpus de entrenamiento de Llama 3.1 y Tulu 3, no evaluados aquí.
- Alucinación: riesgo inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para esta cuantización.
- Degradación por cuantización: no se han publicado métricas que cuantifiquen la pérdida de calidad respecto al modelo en bfloat16.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye un descargo que indica que el artefacto se ha desarrollado solo con fines de investigación; conviene revisar ambos extremos antes de un despliegue comercial.
- Soporte de hardware restringido: optimizado para Intel (CPU, Arc, NPU); el rendimiento en otras plataformas no está verificado.
- Tool calling y capacidades de agente no confirmadas para esta variante.
- Modelo con muy poca tracción (17 descargas, 0 likes) y publicado por un usuario individual, no por AI2 ni Intel; tratar como artefacto de investigación no auditado.
- El enlace de recetario apunta a un repositorio en `git.epicdynamic.com`, un dominio no estándar; verificar su autenticidad antes de ejecutar scripts de instalación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-DPO
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Recetario de replicación citado en la model card: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
