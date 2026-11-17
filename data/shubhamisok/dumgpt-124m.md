# shubhamisok/DumGPT-124M

## Resumen

DumGPT-124M es un modelo de lenguaje autoregresivo de 124 millones de parámetros entrenado desde cero por el usuario shubhamisok, siguiendo la arquitectura GPT-2. Se trata de un experimento de preentrenamiento a pequeña escala sobre el corpus HuggingFaceFW/fineweb-edu, con una configuración clásica de 12 capas, 12 cabezas de atención y dimensión de embedding de 768. No es un modelo ajustado para instrucciones ni para conversación: es una base de preentrenamiento pura.

El modelo se publica bajo licencia MIT y está orientado exclusivamente al idioma inglés. Su relevancia es limitada en términos de producto, pero resulta útil como caso de estudio reproducible de un pipeline de preentrenamiento GPT-2 completo, para experimentación educativa, para servir de base a fine-tuning posterior, o para comparar curvas de pérdida frente a configuraciones alternativas de tokenizador y dataset.

El repositorio ocupa 2,0 GB y no registra descargas ni interacciones en el momento de la consulta. No se documentan resultados de evaluación, número de tokens de entrenamiento, ni detalles del procedimiento de optimización, por lo que debe tratarse como un artefacto experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 124 millones (aproximado, según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 2,0 GB, presumiblemente pesos PyTorch; no se confirma safetensors ni GGUF) |

Parámetros arquitectónicos adicionales documentados en la model card:

| Parametro | Valor |
|---|---|
| Capas | 12 |
| Cabezas de atención | 12 |
| Dimensión de embedding | 768 |
| Tamaño de vocabulario | 50304 |
| Framework | PyTorch |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención causal completa, sin mecanismos de atención lineal, sin mezcla de expertos y sin componentes de estado recurrente. La configuración replica el GPT-2 small canónico: 12 bloques transformer, 12 cabezas por bloque, dimensión oculta de 768 y tamaño de vocabulario de 50304 tokens, ligeramente superior al GPT-2 original (50257) por alineación a múltiplos de 128. La longitud de contexto declarada es de 1024 tokens.

El entrenamiento se realizó desde cero ("trained from scratch") sobre el dataset HuggingFaceFW/fineweb-edu, un corpus filtrado por calidad educativa. La model card no especifica el número de tokens vistos, la composición exacta del dataset, la estrategia de tokenización, la configuración del optimizador, el learning rate, el esquema de decaimiento ni si hubo fases de ajuste posteriores (SFT, RLHF o DPO). No se documenta ninguna innovación técnica adicional como decodificación especulativa, atención con ventana deslizante o fusión de capas. El nombre del modelo y los tags indican que se trata de un ejercicio de preentrenamiento, no de un modelo instruct.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de secuencias, completado de párrafos y generación libre condicionada por un prompt.
- Modelado de lenguaje base: útil para extraer log-probabilidades, calcular perplejidad o servir como banco de pruebas de técnicas de muestreo (top-k, top-p, temperatura).
- Punto de partida para fine-tuning: al ser un GPT-2 small con tokenizador de 50304 entradas, es compatible con recetas estándar de ajuste supervisado y clasificación de secuencias.
- Capacidades multilingües: no documentadas; el modelo está etiquetado únicamente como inglés, por lo que el rendimiento fuera de ese idioma es impredecible.
- Tool calling / function calling: no soportado de forma nativa; no hay formato de herramientas ni plantilla de chat.
- Razonamiento multi-paso y comportamiento agente: no soportado; no es un modelo instruct ni ha recibido entrenamiento con refuerzo.
- Modo "thinking", visión, audio u otras modalidades: no disponible.

## Casos de uso

- Práctica de pipelines de preentrenamiento: reproducir el ciclo completo de tokenización, carga de dataset, bucle de entrenamiento y evaluación de perplejidad con un modelo de 124M que cabe en una sola GPU de consumo, usando fineweb-edu como fuente de datos.
- Fine-tuning para clasificación de texto en inglés: añadir una cabeza de clasificación sobre el último estado oculto y ajustar con datasets etiquetados (por ejemplo, análisis de sentimiento o detección de tópicos) aprovechando la ventana de 1024 tokens.
- Generación de texto controlada en dominios acotados: tras un ajuste supervisado sobre un corpus específico (documentación técnica, descripciones de producto), el modelo puede completar plantillas con un coste computacional mínimo.
- Banco de pruebas de técnicas de decodificación: comparar muestreo nucleus, beam search y decodificación contrastiva sobre un modelo pequeño para medir el impacto en diversidad y coherencia antes de escalar a modelos mayores.
- Evaluación de robustez y sesgos en modelos pequeños: analizar cómo un modelo entrenado sobre fineweb-edu reproduce sesgos del corpus en tareas de completado de frases, como paso previo a estudios sobre modelos de mayor escala.
- Servicio de inferencia de bajo coste para demos: desplegar el modelo en CPU o en una GPU modesta para prototipos internos donde la latencia no es crítica y el volumen de peticiones es bajo.
- Investigación educativa sobre escalado: usar la configuración 12/12/768 como punto de referencia para estudiar leyes de escalado a pequeña escala comparando con variantes de distinto tamaño entrenadas sobre el mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124M parámetros × 4 bytes), más activaciones y caché KV para 1024 tokens, que añaden unas décimas de GB según el tamaño de batch.
- VRAM estimada en FP16/BF16: en torno a 0,25 GB para pesos; el modelo cabe holgadamente en cualquier GPU con 4 GB o más.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,13 GB para pesos; en 4 bits, unos 0,07 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para entrenamiento desde cero, una sola RTX 4090 o A100 es adecuada dado el tamaño del modelo.
- GPU de consumo: sí, cabe en cualquier GPU de consumo con al menos 4 GB de VRAM, e incluso puede ejecutarse en CPU con latencia aceptable para prototipos.
- Opciones de despliegue: PyTorch nativo (transformers), y previsiblemente llama.cpp u Ollama si se convierte a GGUF, aunque el autor no proporciona esos artefactos. vLLM y TGI son compatibles con arquitecturas GPT-2, pero no se han validado para este checkpoint concreto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DumGPT-124M | 124M | 1024 | Inglés | MIT | Hugging Face (repo propio) |
| GPT-2 small (OpenAI) | 124M | 1024 | Inglés | MIT | Hugging Face (openai-community/gpt2) |
| GPT-2 medium (OpenAI) | 355M | 1024 | Inglés | MIT | Hugging Face (openai-community/gpt2-medium) |
| DistilGPT-2 | 82M | 1024 | Inglés | Apache 2.0 | Hugging Face (distilbert/distilgpt2) |

Frente a GPT-2 small, DumGPT-124M comparte arquitectura y tamaño, pero se diferencia en el vocabulario (50304 frente a 50257) y en el corpus de entrenamiento (fineweb-edu frente a WebText). No hay datos públicos que permitan comparar rendimiento entre ambos. Frente a DistilGPT-2, DumGPT-124M es un 50 % más grande y no ha sido destilado, por lo que se espera mayor capacidad pero también mayor coste de inferencia. GPT-2 medium ofrece el triple de parámetros con el mismo contexto y licencia MIT, siendo una alternativa directa si se necesita más capacidad sin salir del ecosistema GPT-2.

## Limitaciones y advertencias

- No es un modelo instruct: no sigue instrucciones, no mantiene formato de chat y no ha pasado por SFT, RLHF ni DPO. Usarlo como asistente conversacional producirá respuestas incoherentes o fuera de formato.
- Riesgo elevado de alucinación: al ser un modelo base de 124M entrenado sobre texto web filtrado, generará afirmaciones plausibles pero falsas con frecuencia, especialmente en dominios factuales.
- Sesgos del corpus: fineweb-edu, aunque filtrado por calidad educativa, proviene de web crawls y puede contener sesgos de género, raza, nacionalidad y estereotipos que el modelo reproducirá en sus completados.
- Limitación idiomática: solo se declara inglés; el comportamiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Ventana de contexto corta: 1024 tokens limita tareas de resumen de documentos largos, análisis de conversaciones extensas o recuperación aumentada con muchos fragmentos.
- Falta de documentación: no se especifican tokens de entrenamiento, hiperparámetros ni evaluación, lo que impide estimar su calidad relativa frente a GPT-2 small con rigor.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume todo el riesgo derivado del uso del modelo.
- Ausencia de artefactos de despliegue: no hay GGUF, ONNX ni plantillas de chat publicadas, por lo que la integración en stacks como Ollama o llama.cpp requiere conversión manual.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shubhamisok/DumGPT-124M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- GPT-2 small de referencia (OpenAI): https://huggingface.co/openai-community/gpt2
