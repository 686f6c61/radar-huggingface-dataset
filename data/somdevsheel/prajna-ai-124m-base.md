# somdevsheel/prajna-ai-124m-base

## Resumen

prajna-ai-124m-base es un modelo de lenguaje base de 123,6 millones de parámetros desarrollado por somdevsheel (anteriormente publicado como `kaggle-llm-124m-base`) y entrenado desde cero sobre 1.920 millones de tokens del corpus FineWeb-Edu. Se trata de un transformer decoder-only de estilo LLaMA con RoPE, RMSNorm pre-norm, SwiGLU y embeddings atados, con una ventana de contexto de 1.024 tokens y tokenizador GPT-2 BPE.

El modelo resuelve un problema concreto: demostrar que es posible preentrenar un modelo de lenguaje funcional en hardware gratuito (2x NVIDIA T4 en Kaggle, aproximadamente 21 horas repartidas en dos sesiones de 12 horas). Está pensado como modelo de completado de texto, no como modelo conversacional; el autor publica por separado una variante instruida (`prajna-ai-124m-chat`).

Su relevancia es principalmente educativa y de investigación: sirve como referencia reproducible de un pipeline completo de preentrenamiento a pequeña escala, con licencia Apache 2.0 y pesos en safetensors, lo que permite experimentar con ajuste fino, destilación o evaluación de técnicas de entrenamiento sin requerir infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin biases, embeddings atados) |
| Parametros totales | 123.587.328 (123,6M); 85,0M no-embedding |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas / dimension oculta / cabezas | 12 / 768 / 12 |
| Dimension FFN | 2.048 |
| Tokenizador | GPT-2 BPE (vocabulario ampliado a 50.304) |
| Tamano del repo | 0,5 GB |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu (muestra sample-10BT) |
| Tokens de entrenamiento | 1.920 millones (1,92B) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaMA adaptada a escala pequeña: 12 capas transformer decoder-only con 768 dimensiones ocultas, 12 cabezas de atención, FFN de 2.048 dimensiones y SwiGLU, normalización RMSNorm en configuración pre-norm, sin términos de bias y con embeddings de entrada y salida atados. La posición se codifica mediante RoPE y el tokenizador es GPT-2 BPE con vocabulario rellenado hasta 50.304 entradas.

El preentrenamiento se realizó sobre 1.920 millones de tokens de FineWeb-Edu (muestra sample-10BT), sin repetir ningún token, con PyTorch DDP sobre 2x NVIDIA T4 en precisión mixta fp16 con escalado de pérdida. Se ejecutaron dos fases: una primera de 1.865 pasos desde cero con LR pico de 1,2e-3, 200 pasos de warmup y decaimiento coseno hasta el 10% (val loss 3,43); y una segunda de preentrenamiento continuado de 1.796 pasos adicionales sobre datos no vistos, partiendo de los pesos de la primera, con LR pico de 6e-4 y un nuevo schedule coseno. Optimizador AdamW (0,9; 0,95) con weight decay 0,1. Cada schedule se ajustó al límite de 12 horas por sesión de Kaggle midiendo el tiempo de los primeros pasos. No se documenta RLHF, DPO ni ajuste por instrucciones en esta variante base.

## Capacidades

- Generación de texto por completado de prompt (modelo base, no conversacional).
- Razonamiento básico de lenguaje derivado del corpus educativo FineWeb-Edu.
- Generación de código limitada, sin ajuste específico ni verificación.
- Capacidad matemática muy limitada, sin entrenamiento específico en razonamiento numérico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión o audio: no disponible.
- Compatible con `text-generation-inference` y endpoints según los tags del repositorio.

## Casos de uso

- Investigación educativa sobre preentrenamiento: reproducir o extender el pipeline (FineWeb-Edu, DDP en 2x T4, schedules ajustados a sesiones de 12 horas) para estudiar el efecto de la escala de datos y del preentrenamiento continuado en modelos pequeños.
- Ajuste fino supervisado (SFT) como punto de partida: la variante base sirve de inicialización para entrenar un modelo instruido propio con datos y estilo controlados, dado su bajo coste computacional.
- Destilación y compresión: usar el modelo como estudiante en experimentos de destilación de modelos mayores o como referencia para comparar técnicas de cuantización y poda.
- Generación de texto de bajo coste en entornos con recursos limitados: completado de frases, plantillas y textos cortos en inglés donde la latencia y el coste importan más que la factualidad.
- Evaluación de arneses y benchmarks: banco de pruebas para pipelines de evaluación (perplejidad, MMLU, tareas de lenguaje) antes de escalar a modelos mayores.
- Docencia y demostraciones: ejemplo completo y reproducible de un modelo LLaMA-style desde cero, útil en cursos de NLP y talleres prácticos.
- Prototipado de infraestructura de inferencia: validar despliegues con `transformers`, TGI o endpoints compatibles con un checkpoint de 0,5 GB antes de migrar a modelos de mayor tamaño.

## Benchmarks y rendimiento

El autor solo publica la evolución de la pérdida de validación durante el entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Paso | 0 | 250 | 500 | 1000 | 1500 | 1864 | 2865 | 3365 | 3661 |
|---|---|---|---|---|---|---|---|---|---|
| Pérdida de validación | 10,97 | 4,88 | 4,05 | 3,65 | 3,48 | 3,43 | 3,38 | 3,32 | 3,30 |

Pérdida de validación final: 3,30 (perplejidad 27). Los pasos posteriores a 1864 corresponden a la fase de preentrenamiento continuado; la pérdida sube brevemente (3,48 en el paso 2115) al reiniciar con un LR mayor y después cae por debajo de la primera fase.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16 (123,6M parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna; el propio autor entrenó en 2x NVIDIA T4. Para inferencia basta una T4, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU para uso no interactivo.
- Opciones de despliegue: `transformers` (documentado en la model card), `text-generation-inference` (tag del repo) y endpoints compatibles. El autor no documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| prajna-ai-124m-base | 123,6M | 1.024 | Apache 2.0 | Hugging Face (safetensors) | Entrenado desde cero en 2x T4; solo inglés; sin benchmarks publicados |
| GPT-2 (124M) | 124M | 1.024 | MIT | Hugging Face | Referencia clásica de mismo tamaño; tokenizador y datos distintos; sin benchmarks comparables en esta ficha |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Hugging Face | Modelo pequeño de Hugging Face; datos y contexto distintos |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | Hugging Face | Suite de investigación de EleutherAI con checkpoints intermedios |

No se dispone de resultados de benchmarks del modelo que permitan una comparación cuantitativa con estas alternativas; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Conocimiento del mundo limitado: entrenado con unos 16 tokens por parámetro, por debajo del óptimo computacional (~20), según reconoce el autor.
- Alucinación frecuente: produce con frecuencia afirmaciones fluidas pero incorrectas.
- Solo inglés; no hay soporte multilingüe documentado.
- Contexto corto de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Es un modelo base de completado, no un modelo de chat; no sigue instrucciones de forma fiable.
- Sin filtrado de seguridad más allá del filtro educativo de FineWeb-Edu; puede generar contenido sesgado o inapropiado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.
- Sin datos publicados de benchmarks, cuantizaciones ni latencia; cualquier decisión de producción requiere evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/prajna-ai-124m-base
- Variante chat: https://huggingface.co/somdevsheel/prajna-ai-124m-chat
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
