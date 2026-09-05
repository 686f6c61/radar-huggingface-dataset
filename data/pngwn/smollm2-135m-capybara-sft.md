# pngwn/SmolLM2-135M-Capybara-SFT

## Resumen

pngwn/SmolLM2-135M-Capybara-SFT es un modelo de lenguaje de 134,5 millones de parámetros, resultado de un fine-tuning del modelo HuggingFaceTB/SmolLM2-135M sobre el dataset trl-lib/Capybara. Lo desarrolla el usuario pngwn y está pensado para la generación de texto conversacional, como demuestra el ejemplo de uso incluido en su model card, donde se emplea un prompt con roles de usuario y asistente. El modelo se entrenó con la librería TRL mediante Supervised Fine-Tuning (SFT), sin información adicional sobre RLHF o DPO. Su relevancia radica en que ofrece una opción ligera para tareas de chat en entornos con recursos limitados, aunque no se han publicado benchmarks ni evaluaciones externas. La arquitectura exacta y la longitud de contexto no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags de HuggingFace incluyen "llama") |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base HuggingFaceTB/SmolLM2-135M sobre el dataset trl-lib/Capybara, utilizando Supervised Fine-Tuning (SFT) con la librería TRL. Según la model card, las versiones de las librerías empleadas son TRL 0.12.2, Transformers 4.46.3, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.20.3. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni sobre técnicas adicionales como RLHF o DPO. Tampoco se documenta ninguna innovación técnica destacable; se trata de un fine-tuning estándar.

## Capacidades

- Generación de texto conversacional: el modelo fue entrenado en el dataset Capybara, que contiene conversaciones, y el ejemplo de uso de la model card muestra un prompt con roles de usuario y asistente.
- Compatible con el pipeline text-generation de Transformers, tal como se indica en el ejemplo de código.
- No se documentan capacidades de function calling, tool calling, agentes, razonamiento multi-paso, visión, audio ni soporte multilingüe.

## Casos de uso

- Prototipado rápido de chatbots: se puede cargar con `pipeline("text-generation", model="pngwn/SmolLM2-135M-Capybara-SFT")` y pasar prompts de chat. Adecuado por su tamaño reducido y su entrenamiento conversacional.
- Asistentes en dispositivos con recursos limitados: sus 134,5 millones de parámetros permiten su ejecución en CPU o GPU de bajo consumo, lo que lo hace apto para aplicaciones embebidas o móviles.
- Generación de respuestas en aplicaciones de mensajería: puede generar respuestas automáticas a mensajes sencillos, aprovechando su capacidad de completar textos en formato conversacional.
- Educación en fine-tuning: sirve como ejemplo práctico de SFT con TRL sobre un modelo pequeño, útil en cursos o talleres sobre ajuste de modelos de lenguaje.
- Juegos de rol o narrativa interactiva: puede producir diálogos de personajes no jugadores, dado su estilo conversacional y su bajo coste computacional.
- Automatización de borradores de correo o foros: puede redactar respuestas preliminares a partir de un prompt, siendo adecuado para tareas de texto corto en las que no se requiere un modelo de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 134.515.008 parámetros. En FP32, aproximadamente 0,5 GB; en FP16, aproximadamente 0,27 GB; en INT8, aproximadamente 0,13 GB. Son estimaciones teóricas, no mediciones reales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) o incluso CPU, gracias al tamaño reducido del modelo.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: Transformers (pipeline) y text-generation-inference, según las etiquetas de HuggingFace. No se ha confirmado soporte para otras herramientas como llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Autor | Licencia |
|---|---|---|---|---|
| pngwn/SmolLM2-135M-Capybara-SFT | 134.515.008 | trl-lib/Capybara | pngwn | no disponible |
| lewtun/SmolLM2-135M-Capybara-SFT | no disponible | no disponible | lewtun | no disponible |
| HuggingFaceTB/SmolLM2-135M | no disponible | no disponible (modelo base) | HuggingFace | no disponible |

No se dispone de datos de rendimiento para comparar estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no hay evaluaciones publicadas; en modelos pequeños es habitual que aparezcan respuestas incoherentes o inventadas, pero no se puede confirmar en este caso.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede confirmar si permite uso comercial.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes, no cuenta con benchmarks publicados ni validación externa. No se recomienda su uso en producción sin una evaluación previa exhaustiva.

## Enlaces

- https://huggingface.co/pngwn/SmolLM2-135M-Capybara-SFT
- https://huggingface.co/spaces/pngwn/smollm2-capybara-sft
- https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- https://huggingface.co/datasets/trl-lib/Capybara
- https://huggingface.co/lewtun/SmolLM2-135M-Capybara-SFT
