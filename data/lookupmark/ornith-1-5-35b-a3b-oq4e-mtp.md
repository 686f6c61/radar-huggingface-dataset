# LookUpMark/Ornith-1.5-35B-A3B-oQ4e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ4e-mtp es una cuantización MLX en 4 bits del modelo Ornith-1.5-35B-A3B, desarrollada por LookUpMark. El modelo original, creado por el equipo de Ornith, es una arquitectura Mixture-of-Experts (MoE) de aproximadamente 35.951 millones de parámetros totales, con cerca de 3.000 millones de parámetros activos por token. Esta versión cuantizada está diseñada para ejecutarse en Apple Silicon mediante el runtime oMLX o mlx-lm, reduciendo el peso del modelo a 21,6 GB.

La relevancia de esta ficha radica en que permite desplegar un modelo de gran tamaño en hardware de consumo, como Macs con 32 GB de memoria unificada, sin necesidad de GPUs dedicadas. Además, incorpora Multi-Token Prediction (MTP) con profundidad especulativa 3, una técnica que puede acelerar la generación de texto. El modelo base se construyó sobre Qwen3.5 y Gemma4, y fue refinado mediante un bucle de auto-mejora de extremo a extremo. La ventana de contexto es de 256K tokens según la documentación del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), basada en Qwen3.5 y Gemma4 |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3.000.000.000 (3B) |
| Longitud de contexto | 256K tokens (según documentación del modelo base) |
| Tipos de cuantización | MLX 4-bit (oQ4e) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es una arquitectura MoE que activa aproximadamente 3.000 millones de parámetros por token, lo que reduce el coste computacional en comparación con un modelo denso del mismo tamaño. La cuantización oQ4e de MLX reduce los pesos a 4 bits, manteniendo la calidad con una degradación mínima. La integración de MTP (Multi-Token Prediction) con profundidad especulativa 3 permite predecir varios tokens a la vez, acelerando la inferencia en Apple Silicon.

En cuanto al entrenamiento, el modelo base extiende Ornith-1.0, que a su vez se construyó sobre Qwen3.5 y Gemma4, mediante un bucle de auto-mejora de extremo a extremo. No se han publicado detalles específicos sobre el dataset, el número de tokens o el uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para tareas de text-generation y puede mantener diálogos multi-turno.
- Ejecución local en Apple Silicon: gracias a la cuantización MLX 4-bit, se puede ejecutar en Macs con memoria unificada de 32 GB o más.
- Ventana de contexto larga: soporta hasta 256K tokens, lo que permite procesar documentos extensos o mantener conversaciones largas.
- Aceleración por MTP: la predicción de múltiples tokens reduce la latencia de generación en entornos compatibles.
- No se especifican capacidades multimodales (visión, audio) ni tool calling en la información disponible.

## Casos de uso

- Asistente personal local en Mac: ejecutar el modelo en la propia máquina para redactar correos, resumir reuniones y responder preguntas sin enviar datos a servicios externos. La cuantización 4-bit permite que funcione en equipos de consumo.
- Análisis de documentos extensos: gracias a la ventana de 256K tokens, es adecuado para procesar contratos legales, informes técnicos o artículos de investigación completos en una sola pasada.
- Generación de código en desarrollo: puede integrarse en editores como VS Code o Xcode como asistente de código, aprovechando el contexto largo para entender repositorios enteros.
- Chatbot interno de soporte técnico: desplegable en un Mac Studio o Mac mini mediante oMLX, ofreciendo respuestas a consultas de un equipo sin depender de la nube.
- Prototipado de aplicaciones de IA: la versión cuantizada permite iterar rápidamente en una Mac de 32 GB, evitando el coste de infraestructura GPU.
- Razonamiento multi-paso con MTP: la predicción especulativa de tokens reduce la latencia en tareas de planificación o resolución de problemas que requieren cadenas de razonamiento largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 21,6 GB en formato 4-bit, por lo que se recomienda un dispositivo con al menos 32 GB de memoria unificada para dejar margen al contexto y al runtime.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4). No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: oMLX (servidor local OpenAI-compatible) y mlx-lm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35.951.822.704 | ~3B | 256K | bf16 (~70 GB) | MIT | HuggingFace |
| Ornith-1.5-35B-A3B-FP8 | 35.951.822.704 | ~3B | 256K | FP8 | MIT | HuggingFace |
| Ornith-1.5-35B-A3B-oQ4e-mtp | 35.951.822.704 | ~3B | 256K | MLX 4-bit (oQ4e) | MIT | HuggingFace |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir una degradación en la calidad de las respuestas en comparación con el modelo en bf16 o FP8.
- La función MTP requiere un runtime específico (oMLX) que la soporte; en otros entornos puede no estar disponible.
- Los idiomas soportados no están especificados, por lo que el rendimiento multilingüe es incierto.
- El repositorio indica que la subida de pesos está en curso, por lo que los archivos pueden no estar completos en el momento de la consulta.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandarizadas no es verificable.
- Al ser un modelo generativo, existe riesgo de alucinación y de sesgos heredados del entrenamiento, como en cualquier LLM.
- La licencia MIT permite uso comercial, pero se recomienda revisar los términos del modelo base para confirmar la atribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LookUpMark/Ornith-1.5-35B-A3B-oQ4e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión FP8: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Blog del modelo: https://deep-reinforce.com/ornith.html
- Sitio web de Ornith: https://ornith.ai/ornith_1_5.html
