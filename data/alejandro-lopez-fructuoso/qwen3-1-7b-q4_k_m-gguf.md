# Alejandro-Lopez-Fructuoso/Qwen3-1.7B-Q4_K_M-GGUF

## Resumen

Qwen3-1.7B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Qwen3-1.7B desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio, publicado por Alejandro-Lopez-Fructuoso, contiene la conversión a Q4_K_M realizada con la herramienta GGUF-my-repo de ggml.ai, pensada para ejecución local eficiente mediante llama.cpp u Ollama. El modelo original es un transformer denso de 1.700 millones de parámetros (2.031.739.904 en los safetensors de referencia) orientado a generación de texto y conversación.

La relevancia de esta ficha radica en que se trata de una cuantización de 4 bits de un modelo pequeño de la familia Qwen3, lo que permite desplegarlo en hardware de consumo con un consumo de memoria muy reducido. El autor documenta una prueba en un equipo con CPU AMD 5800X, 32 GB de RAM y GPU Radeon 6750XT bajo Windows 11, obteniendo 232,85 tokens/s de generación y 1,6 GB de memoria en uso, con una puntuación de 10/10 en una batería propia de 5 preguntas frente a la versión Q8_0.

El repositorio está etiquetado con idioma español y licencia Apache 2.0, heredada del modelo original. Se trata de una práctica académica, no de un modelo entrenado desde cero, por lo que sus capacidades y limitaciones son las del Qwen3-1.7B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B; detalles de atención y capas no disponibles en la información proporcionada) |
| Parametros totales | 2.031.739.904 (según safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (los ejemplos de llama-server usan -c 2048) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); el autor compara con Q8_0 |
| Idiomas soportados | Español (etiqueta `es` en el repositorio) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-1.7B) |
| Formato de pesos | GGUF (`qwen3-1.7b-q4_k_m.gguf`); el modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión y cuantización del checkpoint Qwen/Qwen3-1.7B mediante el espacio GGUF-my-repo de ggml.ai, que emplea llama.cpp para generar el archivo GGUF en cuantización Q4_K_M. Por tanto, la arquitectura corresponde al modelo base Qwen3-1.7B, un transformer denso de aproximadamente 1.700 millones de parámetros (2.031.739.904 contando embeddings y cabezas), y los datos de entrenamiento, composición del dataset y etapas de alineación (RLHF/DPO) son los del modelo original, no documentados en esta ficha.

La innovación técnica de este repositorio es exclusivamente la cuantización: Q4_K_M reduce el peso del modelo a un archivo de aproximadamente 1,3 GB (tamaño total del repo), frente a los aproximadamente 2 GB o más de una cuantización Q8_0. El autor reporta que la calidad de respuesta se mantiene idéntica a Q8_0 en su batería de 5 preguntas, lo que sugiere que la pérdida de precisión de la cuantización de 4 bits es tolerable para uso conversacional general en este tamaño de modelo.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Ejecución local en CPU y GPU mediante llama.cpp y Ollama.
- Soporte de despliegue como servidor compatible con la API de llama.cpp (`llama-server`).
- Idiomas: el repositorio está etiquetado para español; no se documentan capacidades multilingües adicionales.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas en la información proporcionada.
- Visión, audio o modo thinking: no documentados en la información proporcionada.

## Casos de uso

- Asistente conversacional local en español: el modelo puede gestionar diálogos multi-turno en un equipo de sobremesa con 1,6 GB de memoria en uso, según la prueba del autor, lo que lo hace adecuado para prototipos de chatbots sin conexión.
- Prácticas académicas de cuantización: sirve como ejemplo reproducible de conversión de un modelo HuggingFace a GGUF con GGUF-my-repo y evaluación comparativa Q4_K_M frente a Q8_0.
- Inferencia en hardware de consumo: con una GPU Radeon 6750XT y 32 GB de RAM se alcanzan 232,85 tokens/s de generación, suficiente para aplicaciones interactivas en tiempo real.
- Despliegue con Ollama en estaciones de trabajo: el comando `ollama pull huggingface.co/Alejandro-Lopez-Fructuoso/Qwen3-1.7B-Q4_K_M-GGUF` permite tener el modelo operativo en minutos para pruebas de prompt engineering.
- Servidor HTTP ligero con llama.cpp: `llama-server` con `-c 2048` ofrece un endpoint local para integrar generación de texto en scripts o aplicaciones pequeñas sin infraestructura cloud.
- Evaluación de calidad de cuantización: la batería de 5 preguntas del autor (10/10 frente a Q8_0) sirve como plantilla para validar si Q4_K_M es suficiente antes de adoptar cuantizaciones mayores en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas de su propia prueba:

| Metrica | Valor | Entorno |
|---|---|---|
| Velocidad de generación (eval rate) | 232,85 tokens/s | CPU AMD 5800X, 32 GB RAM, GPU Radeon 6750XT, Windows 11 |
| Memoria en uso (ollama ps) | 1,6 GB | Mismo equipo |
| Puntuación batería propia (5 preguntas) | 10/10 | Comparado con Q8_0 |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,3 GB de archivo GGUF y 1,6 GB de memoria en uso reportada por el autor con Ollama; cabe holgadamente en 4 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor valida una Radeon 6750XT. Para GPU NVIDIA, modelos como RTX 3060, RTX 4060 o superiores son más que suficientes; A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU pura.
- Opciones de despliegue: Ollama, llama.cpp (CLI y servidor), y cualquier runtime compatible con GGUF.
- Latencia y throughput: 232,85 tokens/s de generación en el equipo de prueba del autor; no hay datos de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Q4_K_M-GGUF (este) | 2.031.739.904 | No disponible | Q4_K_M | Apache 2.0 | HuggingFace, Ollama, llama.cpp |
| Qwen/Qwen3-1.7B (original) | 2.031.739.904 | No disponible | Safetensors (fp) | Apache 2.0 | HuggingFace, transformers |
| Version Q8_0 del mismo modelo | 2.031.739.904 | No disponible | Q8_0 | Apache 2.0 | Mencionada por el autor, sin enlace |

No se dispone de datos de benchmarks comparativos con otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización de 4 bits: aunque el autor reporta paridad con Q8_0 en su batería de 5 preguntas, puede haber degradación en tareas de razonamiento complejo o código no cubiertas por esa prueba.
- Modelo pequeño (1,7B): capacidad limitada frente a modelos de mayor tamaño en razonamiento, matemáticas y conocimiento factual; mayor riesgo de alucinación.
- Idiomas: solo se declara español; el rendimiento en otros idiomas no está documentado y puede ser deficiente.
- Longitud de contexto: no documentada en este repositorio; los ejemplos usan 2048 tokens, lo que limita conversaciones y documentos largos.
- Es una práctica académica sin mantenimiento ni validación exhaustiva; no hay garantías de soporte.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3-1.7B enlazada por el autor.
- No se documentan mitigaciones de sesgos ni evaluaciones de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Alejandro-Lopez-Fructuoso/Qwen3-1.7B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
