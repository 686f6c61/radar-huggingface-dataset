# kez-lab/qwen2.5-0.5b-blog-quiz-android

## Resumen

El modelo `kez-lab/qwen2.5-0.5b-blog-quiz-android` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base Qwen2.5-0.5B-Instruct, desarrollado por el usuario kez-lab. Su propósito es especializar un modelo de lenguaje pequeño (sLLM) para leer artículos técnicos, blogs o notas personales y generar automáticamente cuestionarios de opción múltiple (pregunta, opciones, índice de respuesta correcta y explicación) en formato JSON estricto y deserializable. Está diseñado para ejecutarse completamente en el dispositivo (on-device), sin conexión a internet, lo que garantiza privacidad total y costes de inferencia nulos.

La relevancia del modelo reside en su tamaño reducido (0.49B parámetros base) y su cuantización INT4 (~350 MB), que permite su despliegue en entornos móviles como Android o Apple Silicon, con bajo consumo térmico y de energía. Combina la arquitectura del modelo base Qwen2.5 (transformer decoder-only con 32K tokens de contexto) con un adaptador LoRA de rango 16, entrenado específicamente para la tarea de generación de quizzes. Está licenciado bajo Apache-2.0, lo que facilita su uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0.49B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | Todos los parametros del modelo base (dense, no MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5) |
| Tipos de cuantizacion | INT4 (mencionado como ~350 MB), otros no especificados |
| Idiomas soportados | Ingles y coreano (segun metadatos del adaptador) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador) + safetensors del modelo base |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen2.5-0.5B-Instruct, un modelo de lenguaje denso de tipo transformer con atención causal y 0.49B parámetros. El modelo base fue preentrenado con 18 billones de tokens y posteriormente ajustado mediante instrucciones (instruction tuning) por el equipo Qwen. El adaptador LoRA se aplica sobre los módulos de proyección de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las capas de feed-forward (`gate_proj`, `up_proj`, `down_proj`), con rango r=16, alpha=32 y dropout de 0.05.

El entrenamiento se realizó en un Apple Silicon M4 Pro mediante Metal Performance Shaders (MPS), con 8 épocas, optimizador AdamW y tasa de aprendizaje de 3e-4. La pérdida final alcanzada fue de 0.4139. No se ha publicado información sobre el conjunto de datos de entrenamiento ni sobre el uso de técnicas de alineación adicionales como RLHF o DPO; el entrenamiento se limitó a la adaptación supervisada sobre la tarea de generación de quizzes.

## Capacidades

- Generación de cuestionarios de opción múltiple (4 opciones) con pregunta, opciones, índice de respuesta correcta y explicación en formato JSON estructurado.
- Análisis de texto de entrada: artículos técnicos, blogs, notas personales o documentos cortos.
- Salida determinista en JSON, diseñada para deserialización directa en modelos de datos de Android/Kotlin.
- Capacidad de razonamiento limitada heredada del modelo base (0.5B), suficiente para tareas simples de comprensión y síntesis.
- Soporte de tool calling no disponible; el modelo está especializado en una sola tarea.
- Capacidades multilingües restringidas a inglés y coreano (según metadatos).
- No soporta visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Aplicaciones de tarjetas de aprendizaje (flashcards): el modelo puede generar preguntas de opción múltiple a partir de un texto de estudio, permitiendo crear decks de repaso automáticamente desde apuntes o libros.
- Lectores de blogs con funciones educativas: integrado en aplicaciones que muestran artículos técnicos (Medium, Velog, Tistory), puede generar quizzes al final de cada artículo para comprobar la comprensión del lector.
- Asistentes de estudio offline: en dispositivos móviles sin conexión, los estudiantes pueden introducir un texto y recibir preguntas de autoevaluación con explicaciones, sin depender de servicios en la nube.
- Aplicaciones de productividad y notas: herramientas de toma de notas pueden ofrecer la opción de "convertir nota en quiz" para repasar contenido de forma interactiva.
- Evaluación de comprensión lectora en entornos educativos: profesores pueden generar quizzes de comprensión a partir de material didáctico, con la ventaja de que el procesamiento ocurre localmente, respetando la privacidad de los estudiantes.
- Prototipado rápido de aplicaciones de e-learning: desarrolladores pueden integrar el adaptador en entornos de desarrollo móvil para crear pruebas de concepto de apps educativas sin costes de API y con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica la pérdida de entrenamiento final (0.4139), sin comparar con otros modelos ni medir la precisión de las respuestas. El rendimiento en tareas de generación de quizzes dependerá de la calidad del conjunto de entrenamiento y de la capacidad del modelo base. Se recomienda evaluar el modelo con datos propios antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5B en FP32 ocupa ~2 GB de memoria; con cuantización INT4 el adaptador y el modelo completo se reducen a ~350 MB, lo que permite ejecución en dispositivos móviles con memoria RAM de 4 GB o superior.
- GPU recomendadas: para desarrollo en ordenador, cualquier GPU con al menos 4 GB de VRAM (ej. NVIDIA GTX 1650, RTX 3060) es suficiente. Para despliegue móvil, no se requiere GPU dedicada; la inferencia puede ejecutarse en CPU, GPU o NPU del dispositivo.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo moderna, incluso en Raspberry Pi 5 (con cuantización INT4).
- Opciones de despliegue: llama.cpp para CPU/GPU, Ollama, vLLM (para servidores), MediaPipe GenAI o LiteRT para Android, y transformers con PEFT para Python.
- Latencia y throughput estimados: no disponibles en la documentación. En un dispositivo móvil moderno, se espera una latencia de unos pocos segundos por generación de quiz (512 tokens máximos), dependiendo de la CPU.

## Comparativa con modelos similares

No se dispone de modelos similares con la misma especialización (generación de quizzes en formato JSON). Como referencia, se compara el adaptador con el modelo base y otros modelos pequeños generalistas:

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| kez-lab/qwen2.5-0.5b-blog-quiz-android | 0.49B | 32K | Apache-2.0 | Generación de quizzes JSON |
| Qwen2.5-0.5B-Instruct (base) | 0.49B | 32K | Apache-2.0 | Instrucción general |
| Llama-3.2-1B | 1B | 128K | Llama 3.2 License | Instrucción general |
| TinyLlama-1.1B | 1.1B | 2K | Apache-2.0 | Instrucción general |

La comparación muestra que el adaptador es más ligero que alternativas generalistas y está optimizado para una tarea concreta, pero carece de la versatilidad de modelos de propósito general.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del modelo base Qwen2.5-0.5B-Instruct, que pueden incluir sesgos de género, culturales o lingüísticos, aunque su tamaño reducido limita el impacto.
- Riesgo de alucinación: el modelo puede generar preguntas o explicaciones incorrectas si el texto de entrada es ambiguo o complejo, especialmente en dominios especializados fuera de su distribución de entrenamiento.
- Limitaciones de idioma: solo soporta inglés y coreano. El uso en otros idiomas puede producir resultados degradados o formatos no válidos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero requiere atribución y no ofrece garantías. No hay restricciones de uso militar o de alto riesgo.
- Formato JSON estricto: el modelo puede fallar en generar JSON válido en casos límite (texto muy largo o confuso), por lo que se recomienda validación y fallback en aplicaciones de producción.
- Dependencia del modelo base: el adaptador requiere el modelo base Qwen2.5-0.5B-Instruct, que debe descargarse por separado; en entornos móviles hay que gestionar el tamaño total (~0.6 GB en FP16, ~0.35 GB en INT4).
- Rendimiento en tareas complejas: al ser un modelo de 0.5B, su razonamiento es limitado y puede no captar matices de artículos técnicos muy densos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/kez-lab/qwen2.5-0.5b-blog-quiz-android
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Colección Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
- Repositorio de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
