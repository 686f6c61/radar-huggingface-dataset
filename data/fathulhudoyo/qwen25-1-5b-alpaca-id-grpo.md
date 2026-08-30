# fathulhudoyo/qwen25-1.5b-alpaca-id-grpo

## Resumen

El modelo `fathulhudoyo/qwen25-1.5b-alpaca-id-grpo` es un ajuste fino (fine-tuning) de la familia Qwen2.5, concretamente sobre el modelo base `fathulhudoyo/qwen25-1.5b-alpaca-id-sft`, que a su vez es un fine-tuning de Qwen2.5-1.5B con un dataset de instrucciones en indonesio (Alpaca). El autor, fathulhudoyo, ha aplicado una segunda etapa de optimización mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo orientada a alinear el modelo con preferencias humanas. El entrenamiento se realizó con la librería Unsloth y el stack de Hugging Face TRL, lo que reduce el tiempo de cómputo.

Con aproximadamente 1.540 millones de parámetros, este modelo se posiciona en la gama de modelos compactos (1.5B), pensados para despliegues con recursos limitados o inferencia en tiempo real. Su arquitectura es un transformer decoder-only de la serie Qwen2, con atención completa y soporte para generación de texto conversacional. Aunque la model card declara el idioma como inglés, el nombre del modelo sugiere un entrenamiento orientado al indonesio, lo que puede implicar un sesgo hacia ese idioma en el ajuste. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Actualmente el repositorio no registra descargas ni valoraciones, lo que indica que es un modelo reciente o de baja difusión. Aun así, su interés radica en la combinación de un fine-tuning con GRPO sobre un modelo ya ajustado por SFT, un enfoque poco común en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la ficha; el modelo base Qwen2.5-1.5B soporta 32.768 tokens |
| Tipos de cuantizacion | No especificados; compatible con cuantizacion GGUF, AWQ o GPTQ mediante herramientas externas |
| Idiomas soportados | Ingles (segun la model card); el nombre sugiere entrenamiento con datos en indonesio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-1.5B, un transformer decoder-only con capas de atención completa, normalización RMSNorm y activación SwiGLU. No emplea mezcla de expertos (MoE) ni mecanismos de atención lineal; es un modelo denso estándar. El proceso de entrenamiento se realizó en dos etapas: primero un fine-tuning supervisado (SFT) sobre el dataset Alpaca en indonesio, y posteriormente una optimización con GRPO, un algoritmo de aprendizaje por refuerzo que agrupa respuestas para calcular ventajas relativas, similar a PPO pero sin necesidad de un modelo de recompensa separado. Esta combinación es poco habitual en modelos de 1.5B y busca mejorar la adherencia a instrucciones y la calidad de las respuestas.

El entrenamiento se aceleró con Unsloth, una librería que optimiza el fine-tuning de modelos grandes, y se utilizó el stack de TRL de Hugging Face. No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset, por lo que no es posible evaluar la cobertura lingüística o temática. El modelo base Qwen2.5-1.5B fue preentrenado con hasta 18 billones de tokens, pero esa información corresponde al modelo original, no a este fine-tuning.

## Capacidades

- Generacion de texto conversacional: el modelo responde a instrucciones y mantiene diálogos multi-turno, gracias al ajuste con GRPO.
- Seguimiento de instrucciones: al estar fine-tuneado con datasets de tipo Alpaca, sigue comandos directos y preguntas con formato de chat.
- Razonamiento básico y matemáticas simples: hereda las capacidades del modelo base Qwen2.5-1.5B, aunque su tamaño limita tareas complejas.
- Generación de código en lenguajes comunes: el modelo base soporta programación en Python, JavaScript, etc., aunque con menor precisión que versiones mayores.
- Soporte multilingüe: el modelo base Qwen2.5 soporta más de 29 idiomas, pero este fine-tuning se centra en inglés e indonesio según su nombre.
- No se documentan capacidades específicas de tool calling, agentes o modo de pensamiento (thinking mode) en la ficha.

## Casos de uso

- Asistente conversacional en dispositivos edge: gracias a su tamaño (1.5B), puede ejecutarse en smartphones o Raspberry Pi con cuantización a 4 bits (~1 GB de VRAM), proporcionando respuestas a preguntas frecuentes sin conexión.
- Bot de atención al cliente para un nicho lingüístico concreto: el entrenamiento con datos en indonesio (si se confirma) lo hace adecuado para empresas que atienden a usuarios de ese idioma, con un coste de inferencia bajo.
- Generación de contenido creativo breve: el modelo puede producir borradores de correos, descripciones de producto o resúmenes cortos, siempre que se supervise la salida.
- Asistente de programación para tareas sencillas: puede autocompletar funciones pequeñas o explicar fragmentos de código, útil en entornos de desarrollo con recursos limitados.
- Prototipado de aplicaciones de IA: sirve como base para validar pipelines de RAG o sistemas de chat antes de escalar a modelos mayores.
- Educación y aprendizaje de idiomas: al estar fine-tuneado con instrucciones, puede actuar como tutor de inglés o indonesio, respondiendo preguntas de gramática y vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. El rendimiento debe inferirse a partir de Qwen2.5-1.5B, que en evaluaciones públicas alcanza alrededor de 55% en MMLU, 60% en HumanEval y 68% en GSM8K (valores orientativos del modelo base, no de este fine-tuning). Se recomienda realizar pruebas propias antes de usar en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16 (1,54B × 2 bytes). Con cuantización a 4 bits, desciende a ~0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (p. ej., NVIDIA GTX 1650, RTX 3050). Para cuantización 4-bit, basta con 2 GB (p. ej., Raspberry Pi con acelerador o GPUs integradas).
- Compatible con CPU: con cuantización GGUF puede ejecutarse en CPU, aunque la latencia será mayor (varios segundos por token en CPUs de gama media).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o el pipeline de transformers con `device_map="auto"`.
- Latencia y throughput: no hay datos publicados; en una GPU moderna (RTX 4090) se puede esperar una generación de 50-100 tokens/s en FP16, y menor en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fathulhudoyo/qwen25-1.5b-alpaca-id-grpo | 1,54B | No especificado (base 32K) | Apache 2.0 | Fine-tuning con GRPO sobre Qwen2.5-1.5B |
| Qwen2.5-1.5B (original) | 1,54B | 32K | Apache 2.0 | Modelo base, preentrenado en 18T tokens |
| Llama 3.2 1B | 1,23B | 128K | Llama 3.2 license (permite uso comercial) | Modelo compacto de Meta, con soporte de tool calling |
| Gemma 2 2B | 2,6B | 8K | Gemma license | Mayor tamaño, pero contexto menor y licencia con restricciones |

La comparativa muestra que este modelo es un fine-tuning especializado, no un modelo base. Frente a alternativas como Llama 3.2 1B, ofrece una ventaja en términos de licencia (Apache 2.0) y la peculiaridad del entrenamiento con GRPO, aunque carece de documentación sobre rendimiento. Gemma 2 2B tiene más parámetros pero contexto más corto y una licencia menos permisiva. La elección dependerá de la tarea y del idioma objetivo.

## Limitaciones y advertencias

- Sesgos lingüísticos: el nombre del modelo sugiere entrenamiento con datos en indonesio, pero la model card declara inglés. Esta discrepancia puede causar comportamientos inesperados en otros idiomas.
- Alucinaciones: como todo modelo de 1.5B, es propenso a generar información plausible pero incorrecta, especialmente en temas especializados.
- Contexto limitado: aunque el modelo base soporta 32K tokens, no se confirma que el fine-tuning mantenga esa longitud; es probable que el entrenamiento con datasets cortos reduzca la ventana efectiva.
- Sin datos de rendimiento: no hay benchmarks publicados, lo que impide evaluar su calidad objetiva frente a otros modelos.
- Riesgo de sobreajuste: al ser un fine-tuning sobre un dataset específico (Alpaca en indonesio), puede degradar el rendimiento en tareas fuera de ese dominio.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte.
- Baja difusión: el repositorio tiene 0 descargas y 0 valoraciones, lo que indica falta de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fathulhudoyo/qwen25-1.5b-alpaca-id-grpo)
- [Modelo base SFT](https://huggingface.co/fathulhudoyo/qwen25-1.5b-alpaca-id-sft)
- [Qwen2.5-1.5B original](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Repositorio oficial de Qwen (GitHub)](https://github.com/QwenLM/Qwen)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [Documentación de Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5:1.5b)
