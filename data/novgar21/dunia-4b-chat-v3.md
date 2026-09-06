# novgar21/dunia-4b-chat-v3

## Resumen

Dunia 4B Chat v3 es un modelo de lenguaje conversacional especializado en turcomano, desarrollado por Nowruz Garryýew como un ajuste fino del modelo base Qwen/Qwen3-4B. El objetivo es ofrecer un asistente de chat funcional para hablantes de turcomano, una lengua con muy poca representación en los modelos de IA actuales. El modelo se entrena sobre 78.504 pares de pregunta-respuesta, incluyendo conversaciones multi-turno, saludos y datos específicos sobre Turkmenistán.

La arquitectura es un transformer causal decoder-only con aproximadamente 4.040 millones de parámetros, heredada de Qwen3-4B. El modelo incorpora además 8.000 tokens turcomanos añadidos al vocabulario del modelo base, lo que amplía su capacidad para procesar texto en esta lengua. La relevancia del modelo radica en cubrir un hueco lingüístico importante, ofreciendo capacidades de conversación, traducción al inglés y al ruso, y un comportamiento de chat más natural que el modelo base sin ajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 4.042.264.576 (≈4.04B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados en la ficha del modelo |
| Idiomas soportados | turcomano (principal), inglés y ruso (para traducción) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Dunia 4B Chat v3 parte del modelo Qwen/Qwen3-4B y se somete a un ajuste fino supervisado sobre un corpus específico en turcomano. El conjunto de datos de entrenamiento está compuesto por 78.504 pares de pregunta-respuesta, de los cuales 21.385 son conversaciones multi-turno, 1.920 son saludos y 2.917 son pares basados en texto sobre Turkmenistán. El vocabulario del modelo base se amplió con 8.000 tokens turcomanos, alcanzando un total de 159.669 caracteres, con el token especial `<|im_end|>` asignado al ID 159645.

El entrenamiento se realizó durante 3 épocas sobre 4.955 secuencias de 2048 tokens, con una tasa de aprendizaje de 1e-5 y programación coseno. Se ejecutó en una GPU A100-SXM4-80GB durante 119 minutos, y la pérdida de validación descendió de 2.350 a 2.162. No se menciona el uso de RLHF ni DPO; se trata de un ajuste fino supervisado convencional.

## Capacidades

- Generación de texto conversacional en turcomano, incluyendo saludos y diálogos multi-turno.
- Traducción básica entre turcomano e inglés, y entre turcomano y ruso.
- Capacidad para identificarse a sí mismo como "Dunia" en respuestas.
- Aplicación de la plantilla de chat de Qwen3, con soporte para desactivar el modo de razonamiento (`enable_thinking=False`).
- Sin soporte de tool calling, function calling, visión ni audio según la información disponible.

## Casos de uso

- Asistente conversacional para hablantes de turcomano: el modelo puede mantener diálogos multi-turno y responder preguntas cotidianas, lo que lo hace adecuado para aplicaciones de mensajería o asistentes personales en este idioma.
- Traducción automática turcomano-inglés y turcomano-ruso: gracias a su capacidad de traducción, puede integrarse en herramientas de apoyo a la comunicación entre hablantes de turcomano y otros idiomas.
- Chatbot de atención al cliente en turcomano: puede gestionar consultas básicas y conversaciones de soporte, reduciendo la necesidad de personal bilingüe en entornos con usuarios turcomanos.
- Herramienta educativa para el aprendizaje del turcomano: puede generar ejercicios de conversación, correcciones y respuestas modelo para estudiantes del idioma.
- Generación de contenido en turcomano: útil para redactar respuestas, textos breves o material informativo dirigido a audiencias turcomanas.
- Investigación en NLP de lenguas de baja representación: sirve como referencia para estudiar el ajuste fino de modelos multilingües en idiomas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la pérdida de validación durante el entrenamiento, que pasó de 2.350 a 2.162, pero no constituye un benchmark estándar comparable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión FP16, los pesos ocupan aproximadamente 8 GB, por lo que se recomienda entre 10 y 12 GB de VRAM considerando el overhead de activaciones. Con cuantización a 4 bits, la VRAM necesaria se reduce a unos 3-4 GB.
- GPU recomendadas: para inferencia en FP16 es suficiente una GPU con 12 GB de VRAM, como una RTX 3060 12GB o superior. Una RTX 4090 (24 GB) permite ejecutar el modelo con margen. El entrenamiento se realizó en una A100-SXM4-80GB.
- Despliegue: se puede usar directamente con la biblioteca `transformers` de Hugging Face, o convertirse a GGUF para su ejecución con llama.cpp u Ollama. También es compatible con vLLM y TGI si se prepara el modelo en los formatos adecuados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para modelos de chat en turcomano en la información proporcionada. La referencia más directa es el modelo base Qwen/Qwen3-4B, del que deriva este ajuste fino. A continuación se muestra una comparación cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dunia 4B Chat v3 | 4.04B | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | 4.04B | no disponible en la ficha | Apache 2.0 | Hugging Face |

La principal diferencia es que Dunia 4B Chat v3 está ajustado específicamente para conversación en turcomano, mientras que el modelo base es multilingüe y no está optimizado para este idioma. No se han identificado otros modelos comparables en turcomano en la información disponible.

## Limitaciones y advertencias

- La model card advierte explícitamente que no se debe confiar en la información precisa del modelo, especialmente en temas de historia, naturaleza y medicina turcomanas, donde puede equivocarse con confianza. Esto se atribuye a la falta de datos en el modelo base.
- A temperatura 0.7, el modelo puede identificarse con un nombre incorrecto en aproximadamente 4 de cada 20 respuestas. Se recomienda usar una temperatura de 0.3 para evitar este comportamiento.
- El modelo solo está entrenado en turcomano, con capacidades limitadas en inglés y ruso para traducción. No se documenta soporte para otros idiomas.
- No se han publicado benchmarks que permitan evaluar su rendimiento frente a otros modelos de manera objetiva.
- No se documenta soporte para tool calling, lo que limita su uso en agentes complejos o pipelines de automatización.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento del modelo antes de desplegarlo en producción debido a las limitaciones indicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/novgar21/dunia-4b-chat-v3
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
