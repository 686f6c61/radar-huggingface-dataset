# Kanha-AI/kanha-kanha.ai-1.7b-full

## Resumen

Kanha kanha-kanha.ai-1.7b-full es un modelo de lenguaje de 1.720 millones de parámetros, desarrollado por Kanha-AI como parte de un experimento de entrenamiento completo (full fine-tuning) sobre la base Qwen/Qwen3-1.7B. El objetivo es adaptar el modelo a la tarea de responder preguntas sobre el contenido del sitio web kanha.ai, generando respuestas conversacionales en inglés. Se trata de un modelo compacto diseñado para ser desplegado directamente en el dispositivo del cliente mediante WebGPU, evitando llamadas constantes a servidores remotos y reduciendo costes operativos. El modelo se publica con fines de investigación y evaluación controlada de respuestas sobre sitios web.

La arquitectura es la del modelo base Qwen3-1.7B, un transformer denso, con una ventana de contexto de entrenamiento de 2048 tokens. El entrenamiento se realizó sobre un dataset propio derivado del sitio kanha.ai, con solo 128 ejemplos de entrenamiento y 24 de validación, durante 4 épocas con una tasa de aprendizaje de 1e-5. El modelo se ofrece en formato safetensors (bfloat16) y también con artefactos MLC cuantizados a 4 bits (q4f16_1) para su ejecución en el navegador. Su relevancia actual reside en la propuesta de Kanha-AI de llevar modelos de lenguaje a entornos on-device, reduciendo latencia y costes de infraestructura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 (máximo de entrenamiento) |
| Tipos de cuantización | q4f16_1 (MLC) |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16), MLC |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Qwen/Qwen3-1.7B, un transformer de 1.7B parámetros que sigue la arquitectura estándar de Qwen3 (atención por capas, pre-normalización RMSNorm, activación SwiGLU). No se trata de un modelo MoE, sino denso. El entrenamiento se realizó con el método full, es decir, todos los pesos del modelo base se actualizaron, no se usó LoRA ni adaptadores.

El dataset proviene del sitio kanha.ai, y se compone de pares de pregunta-respuesta generados a partir del contenido indexado. Se utilizaron 128 registros para entrenamiento y 24 para validación, sin split de holdout. Los hiperparámetros incluyen 4 épocas, tasa de aprendizaje de 1e-5, batch size por dispositivo de 4 con acumulación de gradientes de 2, warmup ratio de 0.1 y una pérdida solo sobre las respuestas (assistant-only loss). La secuencia máxima fue de 2048 tokens. No se menciona uso de RLHF ni DPO, solo entrenamiento supervisado.

No se describen innovaciones técnicas destacadas más allá de la estrategia de despliegue en el dispositivo (MLC) y el uso de cuantización 4 bits para reducir el tamaño del modelo.

## Capacidades

- Generación de texto conversacional en inglés para responder preguntas sobre el contenido del sitio kanha.ai.
- Soporte de preguntas y respuestas basadas en el contenido del sitio, incluyendo fechas, URLs y listas.
- Ejecución on-device mediante WebGPU con cuantización 4 bits, lo que permite inferencia sin conexión a servidores.
- No se especifica soporte para tool calling, agentes, razonamiento multi-step, visión ni audio.
- Multilingüe: solo inglés.

## Casos de uso

- Atención al cliente automatizada en el sitio kanha.ai: el modelo puede gestionar conversaciones multi-turno sobre el contenido del sitio, respondiendo preguntas frecuentes sobre productos, servicios o información específica. Gracias a su tamaño compacto, se integra fácilmente en el frontend mediante un script tag o componente React, reduciendo la dependencia de API externas.
- Asistente de navegación web: al estar entrenado para recordar URLs y fechas, puede guiar a los usuarios hacia secciones concretas del sitio, mejorando la experiencia de navegación.
- Bot de FAQ en tiempo real: desplegado en el navegador, responde al instante sin esperar una llamada al servidor, lo que mejora la latencia y la disponibilidad.
- Evaluación de técnicas de fine-tuning: el modelo sirve como referencia para comparar métodos de entrenamiento (full vs. otros) sobre el mismo dataset, como se indica en su propósito.
- Prototipo de chatbot para sitios web pequeños: con un dataset reducido, el modelo puede adaptarse a otros sitios con pocas páginas, ofreciendo una solución ligera y económica.
- Demostración de despliegue en WebGPU: permite mostrar cómo un modelo de 1.7B puede ejecutarse en el dispositivo, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas de evaluación, calculadas sobre 26 ejemplos:

| Métrica | Valor |
|---|---|
| dates_recall | 1.0 |
| deterministic_pass_rate | 0.0 |
| list_recall | 0.0205 |
| numbers_recall | 0.75 |
| refusal_rate | 0.0 |
| unsupported_value_rate | 0.3846 |
| urls_recall | 1.0 |
| total | 26 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. El rendimiento se limita a la tarea de pregunta-respuesta sobre el sitio web. La tasa de valores no soportados es alta (0.38), lo que indica que el modelo no puede responder correctamente una parte de las consultas. La tasa de pasos deterministas es 0, lo que sugiere que no se garantiza exactitud en respuestas generadas.

## Requisitos de hardware

No se han publicado especificaciones oficiales de hardware. Dado el tamaño del modelo (1.7B parámetros), se estima que:

- En bfloat16, el modelo ocupa aproximadamente 3.4 GB en memoria (1.720.574.976 parámetros × 2 bytes).
- Con cuantización 4 bits (q4f16_1), el tamaño se reduce a aproximadamente 0.9 GB, lo que permite su ejecución en dispositivos con 1-2 GB de memoria disponible.
- El modelo está diseñado para ejecutarse en el navegador mediante WebGPU, por lo que es compatible con GPU integradas o discretas que soporten WebGPU.
- Para inferencia en servidor, puede desplegarse con vLLM, TGI o llama.cpp, aunque no se han publicado configuraciones concretas.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría. El único punto de referencia es el modelo base Qwen/Qwen3-1.7B, del cual se parte. Sin embargo, no se han publicado resultados de rendimiento que permitan comparar. La comparativa queda no disponible.

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas, incompletas o desactualizadas, tal como se indica en la card.
- Puede memorizar contenido del conjunto de entrenamiento, lo que puede generar respuestas que repitan información sensible del sitio.
- La alta tasa de valores no soportados (0.38) indica que una parte significativa de las consultas no obtienen respuestas válidas.
- La licencia no está especificada, por lo que se desconoce si es permitido el uso comercial.
- El conjunto de datos es muy reducido (128 ejemplos), lo que limita la generalización a preguntas fuera del dominio.
- No hay evidencia de que el modelo maneje contextos largos más allá de 2048 tokens, aunque el modelo base Qwen3 soporta más, el entrenamiento limita la ventana.
- La evaluación solo se realizó sobre 26 ejemplos, lo que no es estadísticamente representativo.
- El despliegue en navegador requiere de un entorno con WebGPU; en dispositivos sin esta tecnología, el modelo no se podrá ejecutar de la misma manera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-full
- Organización Kanha-AI en Hugging Face: https://huggingface.co/Kanha-AI
- Repositorio de GitHub de Kanha-AI: https://github.com/Kanha-AI/Kanha-AI
- Sitio web de Kanha AI: https://kanha.ai
