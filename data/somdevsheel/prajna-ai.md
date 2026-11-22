# somdevsheel/prajna-ai

## Resumen

prajna-ai es un modelo de lenguaje base de 123,6 millones de parámetros desarrollado por el usuario independiente somdevsheel y entrenado desde cero sobre 1.920 millones de tokens del corpus FineWeb-Edu. Se trata de una reproducción a pequeña escala del diseño LLaMA (transformer decoder-only con RoPE, RMSNorm y SwiGLU) pensada como ejercicio de entrenamiento reproducible en hardware gratuito: el autor lo entrenó en dos sesiones de 12 horas con 2 GPU NVIDIA T4 en Kaggle. El resultado es un modelo de completado de texto con pérdida de validación de 3,30 (perplejidad aproximada de 27).

El modelo no es un modelo de chat ni de instrucciones: es una base pura de continuación de texto, y el autor publica por separado una variante ajustada para conversación (prajna-ai-124m-chat). Su relevancia es principalmente didáctica y de investigación: demuestra que es posible preentrenar un transformer tipo LLaMA de escala pequeña con presupuesto cero y publicar los pesos, las curvas de pérdida y la receta de entrenamiento de forma transparente.

Con 1.024 tokens de contexto, vocabulario BPE de GPT-2 y licencia Apache 2.0, el modelo está orientado a experimentación, prototipado educativo y como punto de partida para ajuste fino, no a despliegues de producción con requisitos de conocimiento factual o razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA: RoPE, RMSNorm pre-norm, SwiGLU, sin biases, embeddings atados |
| Parametros totales | 123.587.328 (123,6M); 85,0M sin embeddings |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales de la model card: 12 capas, dimensión oculta 768, 12 cabezas de atención, FFN de 2.048, tokenizador BPE de GPT-2 con vocabulario ampliado a 50.304 entradas, tamaño del repositorio de 0,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo LLaMA con las decisiones de diseño habituales de esa familia: codificación posicional rotatoria (RoPE), normalización RMSNorm en configuración pre-norm, activación SwiGLU en la capa feed-forward, ausencia de términos de bias y embeddings de entrada y salida atados. Con 12 capas y 768 dimensiones ocultas, el modelo tiene 123,6M parámetros totales, de los cuales 85,0M no pertenecen a los embeddings.

El preentrenamiento usó 1.920 millones de tokens de FineWeb-Edu (muestra sample-10BT), sin repetir ningún token, lo que equivale a unos 16 tokens por parámetro, por debajo del óptimo de cómputo de aproximadamente 20. El entrenamiento se dividió en dos ejecuciones sobre 2 GPU T4 con PyTorch DDP y precisión mixta fp16 con escalado de pérdida, a 524.288 tokens por paso. La primera ejecución realizó 1.865 pasos con LR pico de 1,2e-3, 200 pasos de warmup y decaimiento coseno hasta el 10%, alcanzando pérdida de validación 3,43. La segunda (preentrenamiento continuado) añadió 1.796 pasos sobre datos no vistos partiendo de los pesos de la primera, con LR pico de 6e-4 y un nuevo schedule coseno, bajando la pérdida de validación a 3,30. Se usó AdamW con betas (0,9, 0,95) y weight decay de 0,1. Cada schedule se ajustó al límite de 12 horas por sesión de Kaggle cronometrando los primeros pasos. No se documenta RLHF, DPO ni ningún ajuste posterior; es un modelo puramente preentrenado.

## Capacidades

- Generación y completado de texto en inglés: continuación de prompts, redacción libre y generación de texto genérico.
- Modelado de lenguaje autoregresivo con contexto de hasta 1.024 tokens.
- Capacidad limitada de razonamiento y conocimiento factual, consecuencia directa de su escala y de su presupuesto de entrenamiento (16 tokens por parámetro).
- No soporta tool calling ni function calling: no hay entrenamiento de instrucciones ni de formato de herramientas.
- No está diseñado para uso agéntico ni razonamiento multi-paso.
- Monolingüe: solo inglés.
- Sin capacidades multimodales (ni visión ni audio).
- Sin modo "thinking" ni razonamiento explícito.

## Casos de uso

- Investigación educativa sobre preentrenamiento: reproducir la receta (FineWeb-Edu, schedule coseno, DDP en 2 T4) para estudiar el efecto de la escala, la tasa de aprendizaje y el presupuesto de tokens en modelos pequeños.
- Punto de partida para ajuste fino: al ser una base limpia con licencia Apache 2.0, sirve como inicialización para SFT o DPO en dominios concretos (clasificación de texto, resumen de dominio, generación de plantillas) cuando no se necesita conocimiento general amplio.
- Generación de texto de relleno y datos sintéticos: producción de texto plausible para pruebas de pipelines, aumento de datos o prototipos de interfaz donde la corrección factual no es crítica.
- Evaluación de técnicas de cuantización y despliegue: sus 123,6M de parámetros y 0,2 GB de pesos permiten medir latencia y throughput en CPU, GPU de consumo y frameworks como llama.cpp u Ollama sin infraestructura dedicada.
- Docencia sobre arquitecturas transformer: el modelo, junto con sus curvas de pérdida por paso, sirve para ilustrar el efecto de la LR, el warmup y el preentrenamiento continuado en un caso real y documentado.
- Baseline en experimentos de scaling laws: comparar la pérdida de validación (3,30) con modelos de tamaño similar entrenados con distintos presupuestos de tokens permite calibrar hipótesis sobre tokens por parámetro.
- Completado de texto en aplicaciones de bajo riesgo: autocompletado de campos, sugerencias de frases o generación de descripciones cortas donde un modelo pequeño y local es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 3,30 |
| Perplejidad aproximada | 27 |
| Tokens de entrenamiento | 1,92B |
| Tokens por parametro | ~16 |
| Perdida de validacion tras run 1 | 3,43 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,25 GB de pesos (123,6M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe en cualquier GPU con 1-2 GB libres.
- En cuantización de 8 bits o 4 bits, el modelo ocupa del orden de 120 MB o 60 MB respectivamente, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento original se hizo con 2 NVIDIA T4. Para inferencia basta una T4, una RTX 3060 o incluso CPU.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) y en sistemas embebidos con suficiente RAM.
- Opciones de despliegue: transformers (referencia), text-generation-inference (el repo declara endpoints_compatible), y previsiblemente llama.cpp, Ollama o vLLM tras conversión a GGUF, aunque el autor no documenta estas rutas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| prajna-ai (somdevsheel) | 123,6M | 1.024 | 1,92B tokens FineWeb-Edu, desde cero | Apache 2.0 | Base, solo inglés, pérdida val 3,30 |
| GPT-2 small (OpenAI) | 124M | 1.024 | WebText, ~40 GB | MIT (pesos) | Referencia histórica de mismo tamaño; ampliamente usado como baseline |
| SmolLM-135M (Hugging Face) | 135M | 2.048 | ~600B tokens (FineWeb-Edu y otros) | Apache 2.0 | Entrenado con mucho más cómputo; incluye variantes instruct |
| TinyLlama-1.1B | 1,1B | 2.048 | 3T tokens | Apache 2.0 | Escala superior; no comparable directamente en tamaño |

La comparación con GPT-2 small y SmolLM-135M es la más pertinente por tamaño. prajna-ai se distingue por su presupuesto de entrenamiento muy inferior (1,92B tokens frente a cientos de miles de millones en SmolLM), lo que se traduce en menor conocimiento factual y peor rendimiento esperado en tareas de razonamiento, a cambio de una receta completamente reproducible en hardware gratuito.

## Limitaciones y advertencias

- Conocimiento del mundo limitado: entrenado con unos 16 tokens por parámetro, por debajo del óptimo de cómputo (~20), el modelo produce con frecuencia afirmaciones fluidas pero incorrectas.
- Riesgo alto de alucinación: al ser un modelo base sin ajuste de instrucciones ni verificación factual, no debe usarse como fuente de información.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Contexto corto: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sin filtrado de seguridad más allá del filtro educativo de FineWeb-Edu: puede generar contenido sesgado, tóxico o inapropiado.
- No es un modelo de chat: no sigue instrucciones; para ello existe la variante prajna-ai-124m-chat.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no está validado para producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin soporte comunitario ni versiones cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/prajna-ai
- Modelo base original: https://huggingface.co/somdevsheel/prajna-ai-124m-base
- Variante de chat: https://huggingface.co/somdevsheel/prajna-ai-124m-chat
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de referencia de FineWeb-Edu: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
