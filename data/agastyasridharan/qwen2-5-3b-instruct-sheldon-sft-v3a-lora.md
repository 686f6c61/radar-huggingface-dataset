# agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a-LoRA

## Resumen

Se trata de un adaptador LoRA de tipo persona sobre el modelo base Qwen/Qwen2.5-3B-Instruct, publicado por el usuario agastyasridharan en HuggingFace. Su objetivo es que el modelo responda adoptando el registro, el tono y las manías del personaje Sheldon Cooper, manteniendo al mismo tiempo la capacidad de resolución de problemas matemáticos del modelo original (evaluada sobre GSM8K). El adaptador se ha entrenado con 11.910 conversaciones de persona y 2.036 respuestas matemáticas verificadas como correctas y reescritas con la voz del personaje, extraídas del dataset tbooy/sheldon-cooper-sft-20k.

Técnicamente es un LoRA con rango 32, alfa 64, aplicado a todas las proyecciones lineales del transformer, entrenado durante 2 épocas (436 pasos). Además del adaptador final, el repositorio incluye 20 checkpoints intermedios guardados cada 22 pasos (checkpoint-22 a checkpoint-436), lo que lo convierte en un artefacto pensado para estudiar la evolución conjunta de la personalidad y de la precisión matemática a lo largo de la trayectoria de ajuste supervisado.

Su relevancia es principalmente de investigación: permite medir de forma empírica el coste de alineación (alignment tax) que introduce el ajuste de personalidad sobre una capacidad concreta, y comparar esta variante (v3a) con sus hermanas v2 (solo chat) y v3b (chat + matemáticas existentes + matemáticas generadas paso a paso). El modelo base aporta 3,09 mil millones de parámetros y una ventana de contexto nativa de 32.768 tokens, pero el adaptador no modifica ni la arquitectura ni la ventana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con Grouped Query Attention; adaptador LoRA sobre todas las proyecciones lineales |
| Parametros totales | 3,09 mil millones en el modelo base Qwen2.5-3B-Instruct; numero exacto de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (extensible a 131.072 con YaRN); el adaptador no la modifica |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors PEFT); el modelo base admite GGUF, AWQ, GPTQ y cuantizacion de 8/4 bits con bitsandbytes |
| Idiomas soportados | no disponible en la model card (el modelo base declara soporte para 29 idiomas; no se documenta el efecto del adaptador sobre ellos) |
| Licencia | qwen-research, etiquetada en HuggingFace como "other" con license_name qwen-research |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, sin fusionar) |
| Tipo de adaptador | LoRA, r=32, alpha=64, todas las proyecciones lineales |
| Dataset de entrenamiento | tbooy/sheldon-cooper-sft-20k |
| Volumen de entrenamiento | 11.910 conversaciones de persona + 2.036 respuestas matematicas correctas (2 epocas, 436 pasos) |
| Checkpoints incluidos | 20 adaptadores intermedios cada 22 pasos (checkpoint-22 ... checkpoint-436) |
| Tamano del repositorio | 4,8 GB |
| Libreria | peft |
| Descargas / likes | 0 / 0 |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con Grouped Query Attention. El LoRA se aplica con rango 32, alfa 64 y cobertura de todas las proyecciones lineales, lo que implica un número relativamente alto de parámetros entrenables para un modelo de 3B (de ahí el tamaño del repositorio, 4,8 GB, que además incluye 20 copias de los pesos del adaptador). El entrenamiento es ajuste supervisado (SFT) puro: no se documenta RLHF, DPO ni ninguna otra fase de alineación posterior.

El conjunto de entrenamiento combina dos componentes del mismo dataset: 11.910 conversaciones orientadas a la persona y 2.036 respuestas matemáticas verificadas como correctas y expresadas con la voz del personaje. La innovación metodológica no está en la arquitectura sino en la evaluación: los 20 checkpoints intermedios permiten trazar curvas de evolución de la fidelidad de persona frente a la precisión en GSM8K a lo largo de los 436 pasos. El autor indica que la receta completa, el preprocesado de datos y la tabla de evaluación están en la model card del modelo fusionado. No se proporcionan datos sobre longitud de secuencia, tamaño de batch, tasa de aprendizaje, composición exacta del dataset ni hardware de entrenamiento.

## Capacidades

- Generación de texto conversacional en registro de persona, imitando el estilo y las muletillas de Sheldon Cooper.
- Respuestas de matemáticas de nivel escolar (GSM8K) mantenidas deliberadamente mediante el subconjunto de 2.036 ejemplos verificados.
- Conversación multiturno heredada de Qwen2.5-3B-Instruct.
- Instrucciones generales del modelo base, presumiblemente conservadas pero no evaluadas en esta ficha.
- Tool calling / function calling: no documentado para este adaptador; el modelo base lo soporta, pero no hay evidencia de que el ajuste de persona lo preserve.
- Comportamiento de agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; no hay evaluación específica.
- Capacidades especiales: ninguna modalidad adicional (sin visión, sin audio, sin modo thinking explícito).
- Propósito analítico: los checkpoints intermedios permiten estudiar la deriva de persona (persona drift) y el olvido catastrófico durante el SFT.

## Casos de uso

- Investigación sobre coste de alineación en personalidad: usar el adaptador final y los 20 checkpoints para medir cómo evoluciona la precisión en GSM8K a medida que el modelo se ajusta más fuerte a la persona, produciendo una curva de compromiso persona-rendimiento reproducible.
- Análisis de olvido catastrófico: comparar la salida del adaptador con la del Qwen2.5-3B-Instruct original en tareas de instrucciones, formato estructurado y tool calling para cuantificar qué capacidades se degradan.
- Generación de diálogos con fines creativos: producir guiones, sketches o contenido fan con un registro coherente del personaje, aprovechando que el modelo mantiene coherencia multiturno en contextos de hasta 32.768 tokens.
- Chatbot de entretenimiento o demo interactiva: desplegar una demo ligera en una GPU de consumo (el adaptador en 4 bits ocupa del orden de 2-3 GB), útil para ferias, talleres o prototipos de productos conversacionales con personalidad marcada.
- Tutor de matemáticas con tono característico: explicar problemas aritméticos y de razonamiento de nivel escolar manteniendo el estilo del personaje, en un contexto educativo informal y siempre con revisión humana de las respuestas.
- Estudio de técnicas de adaptación eficiente: servir como caso práctico de LoRA de rango 32 sobre todas las proyecciones lineales en un modelo de 3B, para comparar contra QLoRA, adaptadores de menor rango o ajuste completo.
- Benchmarking de evaluación de persona: el repositorio y sus variantes hermanas (v2 y v3b) permiten construir un pequeño conjunto de pruebas comparativo sobre fidelidad de personaje y corrección factual, útil para quien investigue métricas de personalidad.
- Experimentos de conversión de formato: al ser un adaptador sin cuantizaciones publicadas, sirve como ejercicio de fusión de pesos, conversión a GGUF y despliegue en llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una tabla de evaluación (incluyendo GSM8K) en la model card del modelo fusionado agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a, pero las cifras concretas no se incluyen en la información proporcionada y no se reproducen aquí. Tampoco hay datos de MMLU, HumanEval, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 con el modelo base (3,09B parámetros): aproximadamente 6,2 GB solo de pesos, más caché KV y activaciones; en la práctica entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantización de 4 bits del modelo base: del orden de 2 a 3 GB, más el coste de la caché KV según la longitud de contexto.
- GPU recomendadas para bf16: NVIDIA A100, H100, L40S, RTX 4090; suficiente también una RTX 3090 o 4080 con 16-24 GB.
- GPU de consumo viable: sí. Cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores en bf16 con contexto reducido; en 4 bits cabe en GPUs de 6-8 GB y en Apple Silicon con memoria unificada.
- Despliegue con transformers + peft: es la ruta documentada en la propia model card (carga del base en bfloat16 con device_map="auto" y PeftModel.from_pretrained).
- vLLM: soporta adaptadores LoRA en tiempo de ejecución, lo que permitiría servirlo sin fusionar, aunque no hay configuración publicada para este adaptador concreto.
- llama.cpp / Ollama / TGI: requieren fusionar el adaptador con el modelo base y convertir a GGUF (llama.cpp, Ollama) o cargar el modelo fusionado (TGI). No hay artefactos preconvertidos en el repositorio.
- Aviso de almacenamiento: el repositorio ocupa 4,8 GB porque incluye el adaptador final más 20 checkpoints intermedios; para solo inferencia basta con descargar el nivel raíz.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Observaciones |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-Sheldon-SFT-v3a-LoRA (este) | 3,09B (base) + adaptador LoRA | 32.768 tokens | Adaptador LoRA de persona sobre Qwen2.5-3B-Instruct | qwen-research | Uso de investigación; sin benchmarks publicados en la información disponible; 20 checkpoints de trayectoria |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 tokens (131.072 con YaRN) | Transformer denso, instruct | qwen-research | Referencia de partida; soporta tool calling y 29 idiomas según su model card |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Transformer denso, instruct | Llama 3.2 Community License | Alternativa de tamaño equivalente con contexto nativo mucho mayor; no es una variante de persona |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 131.072 tokens | Transformer denso, instruct | MIT | Licencia permisiva para uso comercial y contexto largo; sin adaptación de persona |
| Adaptadores de persona comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada otros adaptadores equivalentes de este personaje o de esta metodología de trayectoria |

## Limitaciones y advertencias

- La licencia es qwen-research (etiquetada como "other"), lo que restringe el uso a fines de investigación. Cualquier uso comercial requiere revisar los términos del modelo base y, en su caso, obtener una licencia específica de Qwen; no se puede asumir uso comercial libre.
- El modelo se ha entrenado para imitar a un personaje ficticio caracterizado por ser condescendiente, pedante y socialmente disfuncional. Es esperable que reproduzca ese registro, incluyendo respuestas mordaces o inapropiadas en contextos profesionales.
- Riesgo de alucinación elevado en el componente de persona: el estilo seguro y asertivo del personaje puede enmascarar respuestas incorrectas, especialmente en matemáticas fuera del dominio de GSM8K.
- No hay ninguna evaluación publicada de degradación sobre tool calling, formato estructurado, seguimiento de instrucciones o capacidades multilingües tras el SFT. Se debe asumir que hay olvido catastrófico hasta que se verifique lo contrario.
- El repositorio tiene 0 descargas y 0 likes y procede de un único autor sin paper asociado ni revisión por pares; no hay validación independiente de la calidad del ajuste.
- El dataset de origen (tbooy/sheldon-cooper-sft-20k) no está auditado en la información disponible: se desconocen su composición exacta, su licencia de los datos subyacentes y posibles sesgos heredados.
- Solo se documenta entrenamiento en 2 épocas y 436 pasos; con 11.910 conversaciones de persona, el riesgo de sobreajuste al estilo y de pérdida de diversidad en las respuestas es plausible.
- El adaptador no modifica la ventana de contexto; solicitudes que excedan los 32.768 tokens del base requerirán las técnicas de extensión de Qwen (YaRN) y no han sido validadas con este LoRA.
- Para producción, conviene fusionar el adaptador y validar explícitamente el comportamiento en el dominio objetivo antes de desplegarlo, además de aplicar filtros de contenido por el tono del personaje.

## Enlaces

- Adaptador LoRA (este repositorio): https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a-LoRA
- Modelo fusionado con receta completa y tabla de evaluación: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a
- Variante hermana v2 (solo chat): https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-LoRA
- Variante hermana v3b (chat + matemáticas existentes + matemáticas generadas paso a paso): https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/tbooy/sheldon-cooper-sft-20k
- Papers, blogs o demos adicionales: no disponible
