# OpenRussianAI/andrey

## Resumen

Andrey es un modelo de lenguaje conversacional en ruso desarrollado por OpenRussianAI sobre una arquitectura propia denominada EasyFormer. Se trata de un transformer decoder-only simplificado de aproximadamente 5,58 millones de parámetros totales según los pesos en safetensors (la model card declara ~3,65 millones, discrepancia que conviene tener en cuenta). Su diseño prioriza la velocidad y el bajo coste computacional: emplea RMSNorm, una FFN con factor de expansión ×2 y weight tying entre la matriz de embeddings y la cabeza de salida.

El modelo está entrenado exclusivamente para mantener conversaciones breves en ruso y, de forma deliberada, para admitir desconocimiento cuando la pregunta queda fuera de su dominio. No es un modelo de propósito general: su vocabulario BPE de solo 1412 tokens y su contexto de 512 tokens lo sitúan en la categoría de chatbots experimentales de juguete, no en la de asistentes de producción.

Su relevancia actual es principalmente didáctica y de investigación: sirve como referencia mínima para estudiar el pipeline completo de un chatbot (tokenizador propio, arquitectura custom con `trust_remote_code`, dataset conversacional y evaluación de pérdida y perplejidad) con un coste de entrenamiento e inferencia trivial. La licencia MIT facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EasyFormer), 6 capas, d_model 256, 4 cabezas, FFN ×2 con ReLU, RMSNorm, weight tying lm_head ↔ tok_emb |
| Parametros totales | 5.580.544 (safetensors); la model card declara ~3,65M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (repo con safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors, ademas de ONNX segun los tags; tokenizer.json (BPE propio) |

## Arquitectura y entrenamiento

EasyFormer es un transformer decoder-only simplificado de 6 capas con dimensión de modelo 256, 4 cabezas de atención, feed-forward de expansión ×2 con activación ReLU y normalización RMSNorm. Usa weight tying entre la matriz de embeddings de tokens y la cabeza de lenguaje, lo que reduce el número de parámetros. El tokenizador es un BPE propio con vocabulario de 1412 tokens y tokens especiales de control de turno (`[USER]`, `[BOT]`, `[EOS]`). La implementación requiere `trust_remote_code`, ya que la configuración y el modelo se cargan desde `configuration_easyformer.py` y `modeling_easyformer.py` alojados en el repositorio.

El entrenamiento se realizó sobre un dataset conversacional propio (Andrey-Dataset-v2) de 3895 diálogos, de los cuales aproximadamente 600 son ejemplos de rechazo o admisión de desconocimiento. Se ejecutaron 8000 pasos con batch de 16 y acumulación de gradiente de 2, optimizador AdamW con learning rate 3e-4, scheduler coseno con 300 pasos de warmup, en una única GPU CUDA. Los ejemplos de rechazo ponderan ×2 en la función de pérdida, una técnica de ajuste fino supervisado (no se reporta RLHF ni DPO) orientada a mitigar respuestas inventadas en preguntas fuera de dominio.

## Capacidades

- Generación de texto conversacional breve en ruso, con formato de turnos `[USER]` / `[BOT]`.
- Diálogos de cortesía y small talk (saludos, despedidas, preguntas sobre su identidad).
- Admisión explícita de desconocimiento ante preguntas fuera de su dataset (contraseñas, recuerdos personales, hora actual).
- Generación con muestreo configurable (temperatura, top-k) mediante `model.generate` de Transformers.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de memoria de conversación: cada petición es independiente.
- Capacidad matemática muy limitada según la propia model card.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Docencia y aprendizaje de pipelines de NLP: el repositorio incluye configuración y modelado custom, tokenizador BPE y script de inferencia, lo que permite estudiar de principio a fin cómo se construye y sirve un chatbot mínimo con Transformers.
- Prototipado de interfaces conversacionales en ruso: útil para validar la integración de un backend de chat (formato de turnos, streaming, UI) antes de invertir en un modelo mayor.
- Pruebas de sistemas de moderación y enrutado: su comportamiento de rechazo ante preguntas sensibles permite generar ejemplos sintéticos de respuestas de "no lo sé" para entrenar clasificadores de abstención.
- Experimentos de destilación y arquitecturas eficientes: con 5,58M de parámetros y contexto de 512, es un banco de pruebas barato para comparar RMSNorm, weight tying o variantes de FFN.
- Evaluación de robustez ante alucinación: la métrica "IDK Accuracy" del autor (95,6%) y los ejemplos de rechazo sirven como caso de estudio de hasta qué punto el ajuste con pérdida ponderada generaliza a preguntas no vistas.
- Despliegue en entornos con recursos mínimos: su tamaño (repo de 0,1 GB) permite ejecutarlo en CPU en cualquier portátil o en contenedores pequeños para demos offline.
- Generación de datos sintéticos de diálogo corto en ruso para aumentar datasets de entrenamiento de modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| Train Loss | Andrey-Dataset-v2 | 0,60 | No |
| Val Loss | Andrey-Dataset-v2 | 0,98 | No |
| Perplexity | Andrey-Dataset-v2 | 2,66 | No |
| IDK Accuracy | Andrey-Dataset-v2 | 95,6 | No |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La brecha entre train loss (0,60) y val loss (0,98) sugiere cierto sobreajuste al dataset conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (5,58M de parámetros ≈ 22 MB en fp32, ≈ 11 MB en fp16); el cuello de botella real es el runtime de PyTorch, no el modelo.
- GPU recomendadas: cualquiera con CUDA, incluidas GTX 1050 o superiores; el modelo no requiere GPU para funcionar.
- Cabe en cualquier GPU de consumo e incluso en CPU; la inferencia en CPU es viable con latencias de milisegundos por token.
- Opciones de despliegue: Transformers con `trust_remote_code` (método documentado); existe variante ONNX según los tags del repositorio, lo que permite servir con ONNX Runtime. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en GGUF y la arquitectura es custom.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo se espera un throughput muy alto y latencia de un dígito de milisegundos por token en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OpenRussianAI/andrey | 5,58M | 512 | ru | MIT | Chatbot ruso experimental, arquitectura custom, requiere `trust_remote_code` |
| TinyLlama-1.1B | 1,1B | 2048 | en (multilingue limitado) | Apache 2.0 | Modelo de propósito general, ~200× más parámetros, no especializado en ruso conversacional |
| ruGPT-3 Small | 125M | 2048 | ru | MIT (segun variante) | Modelo ruso de SberDevices, mucho mayor y con capacidades generales más amplias |
| DialoGPT-small | 117M | 1024 | en | MIT | Referencia clásica de chatbot conversacional; en inglés y sin soporte nativo de ruso |

No se dispone de comparativas publicadas frente a modelos rusos de tamaño similar, dado que el ecosistema de modelos de ~5M de parámetros es prácticamente inexistente fuera de experimentos académicos.

## Limitaciones y advertencias

- Conocimiento circunscrito al dataset: la model card advierte que cualquier tema fuera de los 3895 diálogos de entrenamiento produce respuestas sin sentido.
- Sin memoria conversacional: cada consulta se procesa de forma aislada; no hay gestión de historial más allá de lo que el usuario incluya manualmente en el prompt.
- Contexto de 512 tokens: los prompts largos se truncan, lo que limita conversaciones de más de unos pocos turnos.
- Vocabulario de 1412 tokens: cobertura léxica muy reducida, con riesgo de tokenización deficiente en palabras poco frecuentes o préstamos.
- Razonamiento matemático débil y propensión a responder con confianza en preguntas no vistas pese al entrenamiento de rechazo.
- Posible sobreajuste: la diferencia entre train loss (0,60) y val loss (0,98) indica que las métricas declaradas no reflejan necesariamente el comportamiento en producción.
- Discrepancia en el recuento de parámetros: la model card indica ~3,65M mientras que los pesos en safetensors suman 5.580.544; conviene verificar antes de dimensionar recursos.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no está diseñado para aplicaciones de producción con requisitos de fiabilidad.
- Idiomas: solo ruso; no se ha evaluado su comportamiento en castellano ni en otras lenguas.
- Riesgo de alucinación en preguntas que imiten el formato de las de su dataset sin ser idénticas, ya que el rechazo se aprendió sobre "trampas típicas".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRussianAI/andrey
- Sitio oficial de EasyFormer: https://sites.google.com/view/easyformer/home
