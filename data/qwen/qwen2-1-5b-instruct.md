# Qwen/Qwen2-1.5B-Instruct

## Resumen

Qwen2-1.5B-Instruct es la variante instruida (chat) de 1.500 millones de parámetros de la familia Qwen2, desarrollada por el equipo Qwen de Alibaba. Forma parte de una serie que abarca modelos base e instruidos desde 0,5 hasta 72 mil millones de parámetros, incluida una variante Mixture-of-Experts, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo emplea una arquitectura Transformer decoder-only con activación SwiGLU, sesgo en las proyecciones QKV y group query attention (GQA), además de un tokenizador mejorado adaptado a múltiples lenguajes naturales y código. El entrenamiento combina preentrenamiento sobre grandes volúmenes de datos con un post-entrenamiento en dos fases: ajuste fino supervisado (SFT) y optimización directa de preferencias (DPO).

Su relevancia actual radica en que ofrece un rendimiento notablemente superior a su predecesor Qwen1.5-1.8B-Chat en tareas de razonamiento, código y matemáticas con un tamaño reducido, lo que lo hace apto para despliegues en hardware modesto, entornos de borde y aplicaciones donde el coste por inferencia es crítico. El autor recomienda migrar a Qwen2.5-1.5B-Instruct como versión más reciente de la misma escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, sesgo QKV y group query attention (GQA) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato safetensors en FP/BF16; admite cuantizacion a 8 y 4 bits mediante herramientas estándar como llama.cpp o GPTQ, aunque el autor no lo documenta explícitamente) |
| Idiomas soportados | inglés (declarado en la model card); tokenizador adaptado a múltiples lenguajes y código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers >= 4.37.0) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con activación SwiGLU, sesgo en las proyecciones de query, key y value, y group query attention, una técnica que reduce el coste de memoria de la caché KV manteniendo calidad de atención. Incorpora además un tokenizador mejorado diseñado para adaptarse a múltiples lenguajes naturales y código, lo que facilita su uso en tareas de programación aunque la model card solo declare inglés como idioma soportado.

El preentrenamiento se realizó sobre "una gran cantidad de datos" (el autor no especifica el número exacto de tokens ni la composición del dataset). El post-entrenamiento consta de dos etapas: ajuste fino supervisado (SFT) y optimización directa de preferencias (DPO), lo que alinea el modelo para conversación y seguimiento de instrucciones. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y soporte de mensajes de sistema, usuario y asistente.
- Razonamiento y comprensión del lenguaje: resultados destacados en MMLU (52,4) y C-Eval (63,8) para su escala.
- Generación de código: HumanEval de 37,8, muy superior al 25,0 de Qwen1.5-1.8B-Chat.
- Razonamiento matemático: GSM8K de 61,6, casi el doble que su predecesor (35,3).
- Seguimiento de instrucciones: IFEval (Prompt Strict-Acc.) de 29,0.
- Capacidades multilingües: tokenizador adaptado a múltiples lenguajes, aunque la model card solo declara inglés.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Modo thinking, visión o audio: no disponible en esta variante.

## Casos de uso

- **Asistente conversacional de bajo coste**: el modelo puede gestionar diálogos multi-turno con plantilla de chat y mensajes de sistema, adecuado para chatbots de atención al cliente donde el coste por token y la latencia importan más que la profundidad de razonamiento.
- **Generación de código en entornos con recursos limitados**: con un HumanEval de 37,8, puede emplearse para autocompletado, generación de fragmentos y explicación de código en IDE o pipelines de CI/CD que no pueden asumir modelos de 7B o superiores.
- **Resolución de problemas matemáticos básicos e intermedios**: su GSM8K de 61,6 lo hace útil para tutores automáticos, verificación de cálculos y generación de ejercicios con solución.
- **Clasificación y extracción de información**: fine-tuning ligero sobre el modelo base para tareas de etiquetado, análisis de sentimiento o extracción de entidades en texto en inglés, aprovechando su tamaño reducido para iterar rápido.
- **Prototipado e investigación**: al ser Apache 2.0 y caber en una única GPU consumer, es idóneo para experimentos académicos, ablaciones y desarrollo de pipelines de RLHF o DPO sobre un modelo pequeño.
- **Despliegue en el borde o embebido**: 1,5B parámetros permiten ejecución en GPUs de gama media, estaciones de trabajo e incluso CPU con cuantización, para asistentes locales sin conexión.
- **Generación de resúmenes y reescritura**: tareas de transformación de texto en inglés donde el contexto requerido no sea extremadamente largo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando con Qwen1.5-0.5B-Chat, Qwen2-0.5B-Instruct y Qwen1.5-1.8B-Chat:

| Dataset | Qwen1.5-0.5B-Chat | Qwen2-0.5B-Instruct | Qwen1.5-1.8B-Chat | Qwen2-1.5B-Instruct |
|---|---|---|---|---|
| MMLU | 35,0 | 37,9 | 43,7 | **52,4** |
| HumanEval | 9,1 | 17,1 | 25,0 | **37,8** |
| GSM8K | 11,3 | 40,1 | 35,3 | **61,6** |
| C-Eval | 37,2 | 45,2 | 55,3 | **63,8** |
| IFEval (Prompt Strict-Acc.) | 14,6 | 20,0 | 16,8 | **29,0** |

No se han publicado en la información disponible resultados frente a modelos de otras familias (Llama, Gemma, Phi, etc.).

## Requisitos de hardware

- **VRAM estimada en BF16/FP16**: aproximadamente 3,1 GB solo para pesos, más caché KV y activaciones; en la práctica unos 4-5 GB para contexto moderado.
- **VRAM estimada en cuantización 8 bits**: en torno a 1,6-2 GB para pesos.
- **VRAM estimada en cuantización 4 bits**: en torno a 1-1,5 GB para pesos.
- **GPU recomendadas**: cualquier GPU con al menos 6-8 GB de VRAM en precisión completa (RTX 3060, RTX 4060, RTX 4090, A10, L4, A100, H100). En cuantización 4 bits cabe en GPUs de 4 GB e incluso en CPU.
- **Consumer GPU**: sí, cabe holgadamente en RTX 3060/4060/4090 y en GPUs integradas con suficiente memoria compartida usando cuantización.
- **Opciones de despliegue**: transformers (>= 4.37.0), text-generation-inference (TGI), vLLM, llama.cpp, Ollama y endpoints compatibles con SageMaker y Azure según los tags del repositorio.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HumanEval | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| Qwen2-1.5B-Instruct | 1,5B | no disponible | 52,4 | 37,8 | 61,6 | Apache 2.0 |
| Qwen1.5-1.8B-Chat | 1,8B | no disponible | 43,7 | 25,0 | 35,3 | Apache 2.0 |
| Qwen2-0.5B-Instruct | 0,5B | no disponible | 37,9 | 17,1 | 40,1 | Apache 2.0 |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

La comparativa se limita a la familia Qwen porque la información proporcionada no incluye datos de modelos de otras familias (Llama 3.2 1B, Gemma 2 2B, Phi-3-mini) que permitan una comparación rigurosa. El autor recomienda Qwen2.5-1.5B-Instruct como sucesor directo.

## Limitaciones y advertencias

- **Idioma**: la model card solo declara inglés; aunque el tokenizador está adaptado a múltiples lenguajes, el rendimiento fuera del inglés no está garantizado ni evaluado.
- **Contexto**: la longitud de contexto no se documenta en la información disponible, lo que impide planificar aplicaciones con ventanas largas sin verificarlo empíricamente.
- **Alucinación**: como todo modelo generativo de 1,5B, presenta riesgo de fabricar hechos, citas o código incorrecto; requiere validación en producción.
- **Sesgos**: no se documentan evaluaciones de sesgo ni de seguridad en la model card; es esperable que herede sesgos de los datos de preentrenamiento.
- **Capacidades avanzadas no documentadas**: no hay evidencia de soporte de tool calling, agentes o razonamiento multi-paso, por lo que no debe asumirse su disponibilidad.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales, pero conviene conservar los avisos de copyright.
- **Versión obsoleta**: el autor marca Qwen2.5-1.5B-Instruct como `new_version`; para nuevos proyectos es recomendable evaluar la migración.
- **Producción**: al ser un modelo pequeño, el seguimiento de instrucciones complejas y el razonamiento profundo son limitados; conviene reservarlo para tareas acotadas o como componente de pipelines más amplios.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Blog de Qwen2: https://qwenlm.github.io/blog/qwen2/
- GitHub de Qwen2: https://github.com/QwenLM/Qwen2
- Documentación: https://qwen.readthedocs.io/en/latest/
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Plataforma Qwen: https://qwen.ai/home
- Chat oficial: https://chat.qwen.ai/
- Wikipedia (Qwen): https://en.wikipedia.org/wiki/Qwen
- Versión sucesora: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
