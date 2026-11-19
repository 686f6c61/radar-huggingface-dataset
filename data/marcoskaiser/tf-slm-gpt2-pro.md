# marcoskaiser/tf-slm-gpt2-pro

## Resumen

tf-slm-gpt2-pro (denominado EXP002 en la documentación del autor) es un modelo de lenguaje pequeño de aproximadamente 114 millones de parámetros, entrenado desde cero por marcoskaiser como trabajo de la asignatura de Deep Learning en la PUCRS. A pesar del nombre, no es una variante del GPT-2 de OpenAI: se trata de un transformer decoder-only moderno que adopta el estilo arquitectónico y el tokenizador BPE del GPT-2, pero incorpora componentes actuales como RoPE, GQA, RMSNorm y SwiGLU. El modelo resuelve la tarea de generación de texto conversacional en inglés y su interés es fundamentalmente didáctico y de investigación: documenta de forma completa el pipeline de preentrenamiento, mid-training y SFT sobre un único hardware consumer.

El modelo se distribuye con tres conjuntos de pesos correspondientes a cada fase de entrenamiento (preentrenamiento, mid-training y SFT), junto con métricas de evaluación por fase. Su ventana de contexto es de 1024 tokens y su vocabulario de 50257 entradas mediante el tokenizador BPE de GPT-2. Está pensado exclusivamente para estudio: el propio autor advierte que inventa hechos y comete errores aritméticos con seguridad.

Es relevante ahora como ejemplo reproducible de entrenamiento de un SLM completo con recursos limitados (una única RTX A5000), con datos públicos (FineWeb-Edu, smol-smoltalk, GSM8K, everyday-conversations) y con código abierto en GitHub, lo que permite auditar cada decisión de diseño y cada fase del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, GQA, RMSNorm pre-norm, SwiGLU) |
| Parametros totales | ~114M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | state_dict de PyTorch (`model_weights.pt`, cargar con `weights_only=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas, dimensión oculta 768 y 12 cabezas de atención, con GQA de 4 cabezas de key/value, codificación posicional rotatoria (RoPE), normalización RMSNorm en configuración pre-norm, MLP SwiGLU de dimensión 2048 y weight tying entre la matriz de embedding y la de salida. El vocabulario es de 50257 tokens con el BPE de GPT-2.

El entrenamiento se estructuró en tres fases. El preentrenamiento usó una muestra de 10BT de FineWeb-Edu con 2,29 mil millones de tokens (aproximadamente 20 tokens por parámetro, siguiendo la regla de Chinchilla), learning rate 6e-4 con schedule coseno. El mid-training empleó smol-smoltalk y GSM8K con plantilla `User:`/`Assistant:` y packing, 210 millones de tokens y learning rate 2e-4. El SFT usó 40 mil conversaciones de smol-smoltalk, everyday-conversations y GSM8K, con la loss calculada solo sobre las respuestas, 2 épocas y learning rate 3e-5. En todas las fases se usó AdamW (betas 0,9/0,95, weight decay 0,1), clipping de gradiente 1,0, precisión bf16, una única RTX A5000 y 131 mil tokens por step.

## Capacidades

- Generación de texto en inglés con formato conversacional (`User:`/`Assistant:`).
- Seguimiento de instrucciones básicas tras el SFT.
- Razonamiento aritmético elemental entrenado con GSM8K, aunque con errores frecuentes según el propio autor.
- Generación de texto libre y continuación de texto.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-step.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Estudio académico de pipelines de entrenamiento: el repositorio de GitHub permite reproducir preentrenamiento, mid-training y SFT paso a paso, útil en cursos de Deep Learning para ilustrar la regla de Chinchilla con 2,29B tokens sobre 114M parámetros.
- Experimentación con arquitecturas modernas a pequeña escala: sirve para comparar el efecto de RoPE, GQA, RMSNorm y SwiGLU frente a un transformer clásico en un presupuesto de una sola GPU.
- Generación de texto conversacional de demostración: con contexto de 1024 tokens puede mantener diálogos cortos en inglés para prototipos de interfaz de chat.
- Evaluación de técnicas de SFT: la pérdida calculada solo sobre respuestas y el uso de packing en mid-training son configurables y auditables en el código, lo que permite estudiar su impacto.
- Base para ablaciones de datos: al estar entrenado sobre FineWeb-Edu, smol-smoltalk, GSM8K y everyday-conversations, permite medir cómo cada subconjunto afecta a perplejidad y benchmarks por log-likelihood.
- Docencia y divulgación: el modelo cabe en CPU y en GPUs consumer, por lo que puede desplegarse en entornos de aula sin infraestructura dedicada.
- Investigación de alineación a pequeña escala: permite estudiar cómo el SFT degrada la perplejidad de preentrenamiento (de 24,1 a 30,9 en FineWeb-Edu) manteniendo capacidades básicas.

## Benchmarks y rendimiento

| Fase | PPL (teste FineWeb-Edu) | HellaSwag | ARC-Easy | ARC-Challenge | WinoGrande |
|---|---|---|---|---|---|
| preentrenamiento | 24,1 | 30,2% | 46,7% | 24,6% | 51,5% |
| mid-training | 30,4 | 30,6% | 40,7% | 24,4% | 49,5% |
| SFT | 30,9 | 30,5% | 40,4% | 24,7% | 48,5% |

Los benchmarks se midieron por log-likelihood con accuracy normalizada. El azar es 25% en HellaSwag, ARC-Easy y ARC-Challenge, y 50% en WinoGrande. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~114M parámetros en bf16 el peso ronda los 0,23 GB, y en fp32 unos 0,46 GB, más overhead de activaciones para 1024 tokens de contexto.
- GPU recomendadas: el entrenamiento se realizó en una única RTX A5000; para inferencia basta cualquier GPU consumer moderna.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GB de memoria libre en bf16.
- Opciones de despliegue: el autor proporciona scripts propios (`scripts/demo.py`, `src/inference/loading.py`, `src/inference/chat.py`, `src/inference/generator.py`) basados en PyTorch. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, ya que los pesos son un `state_dict` de PyTorch y no GGUF ni safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tf-slm-gpt2-pro | ~114M | 1024 | no disponible | state_dict PyTorch | Entrenado con 2,29B tokens; solo inglés; uso declarado de estudio |
| SmolLM2-135M | 135M | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Citado por el autor como referencia de escala; entrenado con ~1000× más texto según la model card |
| GPT-2 (OpenAI) | 124M | 1024 | no disponible en esta ficha | no disponible en esta ficha | Referencia arquitectónica y de tokenizador, pero sin RoPE, GQA, RMSNorm ni SwiGLU |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo pequeño entrenado con aproximadamente 1000 veces menos texto que modelos de tamaño similar como SmolLM2-135M, según el propio autor.
- Alucinación de hechos: el autor advierte explícitamente que inventa datos.
- Errores aritméticos: comete fallos de cálculo con seguridad, a pesar del entrenamiento con GSM8K.
- Contexto muy limitado: 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés: no hay capacidades multilingües documentadas.
- Licencia no disponible: no se puede confirmar el uso comercial; debe tratarse como no apto para producción hasta que el autor la especifique.
- Formato de pesos no estándar: requiere cargar un `state_dict` de PyTorch con el código del repositorio, lo que complica su integración en stacks de inferencia habituales.
- Uso declarado exclusivamente para estudio; no recomendado para producción.
- Sin datos publicados de sesgos; al entrenarse sobre FineWeb-Edu y conversaciones sintéticas, es previsible que herede sesgos de esas fuentes, aunque no se han cuantificado.

## Enlaces

- Hugging Face: https://huggingface.co/marcoskaiser/tf-slm-gpt2-pro
- Repositorio GitHub (código, configuración y resultados): https://github.com/Leonardo-ripes/tf_deep_learning_slm
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset everyday-conversations-llama3.1-2k: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
