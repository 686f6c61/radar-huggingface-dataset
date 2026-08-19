# kepom/Huihui-GLM-5.1-abliterated-GGUF

## Resumen

El modelo `kepom/Huihui-GLM-5.1-abliterated-GGUF` es una versión "abliterada" (sin censura) del modelo GLM-5.1 de Zhipu AI (zai-org), convertida al formato GGUF para su uso con llama.cpp y otros motores de inferencia. La técnica de abliteration elimina los patrones de rechazo aprendidos durante el entrenamiento, dando como resultado un modelo que no se niega a responder a peticiones que el modelo original rechazaría por razones de seguridad o contenido sensible. El modelo base GLM-5.1 es un Transformer de arquitectura MoE (Mixture of Experts) con aproximadamente 754 mil millones de parámetros totales, diseñado para generación de texto y conversación en inglés y chino.

Este modelo es relevante para investigadores y desarrolladores interesados en estudiar el comportamiento de modelos sin filtros de seguridad, así como para aplicaciones experimentales donde se requiere una generación de contenido sin restricciones. Al estar disponible en formato GGUF, puede ejecutarse en hardware variado, aunque su tamaño lo hace inviable para GPUs de consumo. La licencia MIT permite su uso comercial, pero la model card advierte explícitamente de los riesgos legales y éticos asociados a su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), basada en GLM-5.1 |
| Parametros totales | 753.864.139.008 (~754B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q3_K, IQ2_M y otras variantes) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo es una adaptación de GLM-5.1, un Transformer con arquitectura MoE desarrollado por Zhipu AI. El proceso de abliteration se aplicó sobre el modelo base utilizando la técnica descrita en el repositorio `remove-refusals-with-transformers`, que identifica y elimina los direcciones en el espacio de activaciones responsables de generar respuestas de rechazo. Este método es un proof-of-concept que no requiere TransformerLens, simplificando su implementación. No se dispone de información sobre los datos de entrenamiento originales del modelo base, el número de tokens utilizados ni los métodos de alineación (RLHF, DPO, etc.) aplicados antes de la abliteration.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Generación de contenido sin filtros de seguridad (el modelo no rechaza peticiones sensibles o controvertidas).
- Soporte para inferencia en formato GGUF mediante llama.cpp y motores compatibles (Ollama, LM Studio, etc.).
- Capacidad de conversación multi-turno (según la etiqueta `conversational`).
- No se especifican capacidades de tool calling, agentes, razonamiento multi-step, visión o audio en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar el comportamiento de un modelo sin filtros de seguridad y comparar sus respuestas con el modelo original para analizar el impacto de la abliteration.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido artístico donde se requiera explorar temas que el modelo base rechazaría.
- Evaluación de sesgos y contenido controvertido: sirve como banco de pruebas para auditar qué tipo de contenido produce un modelo sin alineación de seguridad.
- Experimentación en entornos controlados: desarrollo de prototipos de chatbots o asistentes donde se necesita una libertad total de respuesta, siempre bajo supervisión humana.
- Estudio de técnicas de abliteration: permite reproducir y validar los resultados de esta técnica en un modelo de gran escala.
- Pruebas de robustez y jailbreak: útil para investigar cómo los modelos pueden ser manipulados para generar contenido no deseado, ayudando a mejorar las defensas en modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el blog `locallyuncensored.com` indica que la cuantización IQ2_M ocupa aproximadamente 236 GB, lo que requiere al menos 240 GB de VRAM para cargar el modelo completo. La cuantización Q3_K (mencionada en la model card) será aún mayor.
- GPU recomendadas: no es viable en GPUs de consumo. Se requieren configuraciones multi-GPU (por ejemplo, 4x A100 80GB, 8x RTX 4090 24GB) o un Mac Studio con M4 Ultra (que ofrece memoria unificada de hasta 512 GB).
- Opciones de despliegue: llama.cpp (con `llama-gguf-split` para fusionar los shards), Ollama, LM Studio, y cualquier motor compatible con GGUF.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, se espera una latencia alta incluso en hardware de gama alta.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos abliterados en los datos proporcionados. El blog menciona que es "el modelo abliterado abierto más fuerte" sin especificar alternativas concretas. Se puede considerar que compite con otros modelos abliterados de menor tamaño (por ejemplo, versiones abliteradas de Llama 3.1 405B o Qwen 2.5), pero no hay datos objetivos para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo no tiene filtros de seguridad: puede generar contenido sensible, controvertido, ilegal o inapropiado. La model card incluye advertencias explícitas sobre este riesgo.
- No apto para producción o uso público: la model card recomienda usarlo solo en investigación, pruebas o entornos controlados.
- Riesgo de alucinación: al ser un modelo de gran tamaño sin alineación de seguridad, las alucinaciones pueden ser más frecuentes o más difíciles de detectar.
- Limitaciones de idioma: solo soporta inglés y chino, sin cobertura multilingüe amplia.
- Requisitos de hardware elevados: el tamaño del modelo hace que sea inaccesible para la mayoría de usuarios individuales.
- Responsabilidad legal: el usuario es responsable de asegurar que el uso cumple con las leyes y estándares éticos locales.
- No hay garantía de calidad: al ser un proof-of-concept de abliteration, el comportamiento puede ser impredecible en algunos casos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kepom/Huihui-GLM-5.1-abliterated-GGUF
- Repositorio del modelo base (zai-org/GLM-5.1): https://huggingface.co/zai-org/GLM-5.1
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Repositorio de la técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Guía de modelos abliterados (locallyuncensored.com): https://locallyuncensored.com/blog/abliterated-models-guide.html
- Perfil de X de huihui.ai: https://x.com/support_huihui
