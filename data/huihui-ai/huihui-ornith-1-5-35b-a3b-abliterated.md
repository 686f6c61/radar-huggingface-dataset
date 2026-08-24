# huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated es una versión modificada del modelo ornith-ai/Ornith-1.5-35B-A3B, creada por el usuario huihui-ai mediante la técnica de abliteración, que elimina los mecanismos de rechazo y censura del modelo original. El modelo base pertenece a la familia Ornith de Ornith AI, una serie de modelos de codificación agéntica construidos sobre Qwen3 y Gemma4, con arquitectura de mezcla de expertos (MoE) de 35 mil millones de parámetros totales y 3 mil millones activos por token. Esta versión abliterated está pensada como una prueba de concepto para eliminar las negativas del modelo sin usar TransformerLens, y solo se han ablado las capas 11 a 29.

El modelo se distribuye bajo licencia MIT y es compatible con la librería transformers de Hugging Face. Al ser una variante sin censura, su uso principal es experimental o para aplicaciones que requieran generación de texto sin restricciones de contenido, aunque esto conlleva riesgos importantes. No se dispone de información pública sobre la longitud de contexto, idiomas soportados o cuantizaciones disponibles en la ficha original, aunque el modelo base Ornith-1.5 podría heredar la ventana de 256K tokens de su predecesor Ornith-1.0, según la documentación del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3, con abliteración parcial (capas 11-29) |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | No disponible (el modelo base Ornith-1.0 soporta 256K tokens, pero no se confirma para esta versión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (inferido por el uso de transformers, no confirmado explícitamente) |

## Arquitectura y entrenamiento

El modelo es una adaptación de Ornith-1.5-35B-A3B, un MoE con 35B parámetros totales y 3B activos, desarrollado por Ornith AI como parte de su línea de modelos de codificación agéntica. Según la documentación de Ornith-1.0, estos modelos se construyen sobre Qwen3 y Gemma4 mediante entrenamiento continuo, mid-training y post-training, con un enfoque en auto-mejora de extremo a extremo. La versión abliterated aplica la técnica de abliteración, que identifica y elimina las direcciones de activación responsables de los comportamientos de rechazo, utilizando la implementación de Sumandora (remove-refusals-with-transformers). En este caso, solo se han ablado las capas 11 a 29, lo que sugiere que el rechazo se concentra en esa región del modelo. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o si se usó RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto sin censura: al ser abliterated, el modelo no produce rechazos ante solicitudes que normalmente serían bloqueadas, lo que permite generar contenido que el modelo original negaría.
- Codificación y razonamiento técnico: hereda las capacidades del modelo base Ornith, orientado a tareas de programación y agentes, aunque no se especifican detalles concretos en la ficha.
- Soporte de chat y conversación: compatible con el pipeline de text-generation y el chat template de Qwen3, como se muestra en el código de ejemplo de la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y funciones de agente: no confirmadas explícitamente, pero plausibles dado el enfoque del modelo base en codificación agéntica.

## Casos de uso

- Generación de código sin restricciones: el modelo puede utilizarse para producir fragmentos de código o soluciones técnicas que el modelo base rechazaría por políticas de seguridad, como exploits educativos o análisis de vulnerabilidades en entornos controlados.
- Investigación en seguridad informática: permite estudiar cómo los modelos manejan solicitudes maliciosas o de doble uso, sirviendo como herramienta para evaluar riesgos de abuso en sistemas de IA.
- Desarrollo de asistentes de programación personalizados: al no tener rechazos, puede integrarse en entornos de desarrollo donde se necesite generar código sin filtros, aunque con supervisión humana.
- Experimentación con técnicas de alineación: útil para investigadores que quieran comparar el comportamiento de un modelo con y sin abliteración, analizando diferencias en razonamiento y generación.
- Creación de contenido creativo sin límites: para proyectos de escritura o narrativa que requieran explorar temas tabú o controvertidos, siempre que se respeten las leyes aplicables.
- Pruebas de robustez en sistemas de moderación: permite evaluar la eficacia de filtros de contenido al generar respuestas que normalmente serían bloqueadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta versión abliterated ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el modelo tiene 35B parámetros totales y 3B activos, en precisión bf16 necesitaría aproximadamente 70 GB de VRAM para cargar todos los pesos, pero al ser MoE con activación dispersa, la memoria activa es menor. Con cuantización a 4 bits podría caber en una GPU de 24 GB, pero no hay confirmación.
- GPU recomendadas: para inferencia completa en bf16 se necesitaría una A100 de 80 GB o varias GPUs en paralelo. Con cuantización, una RTX 4090 (24 GB) podría ser suficiente, aunque no está verificado.
- Opciones de despliegue: compatible con transformers, por lo que puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF. No se han publicado archivos GGUF para esta versión concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base Ornith-1.5-35B-A3B podría compararse con otros MoE de codificación como Qwen3-30B-A3B o DeepSeek-Coder, pero no hay datos de rendimiento en las fuentes consultadas. Tampoco hay otros modelos abliterated de huihui-ai con especificaciones comparables en la información proporcionada.

## Limitaciones y advertencias

- Contenido sin filtrar: al eliminar los rechazos, el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe usarse en producción sin medidas de moderación adicionales.
- Ablación parcial: solo se han ablado las capas 11 a 29, por lo que el comportamiento de rechazo podría persistir en otras capas o manifestarse de forma impredecible.
- Prueba de concepto: la model card indica que es una implementación "cruda" y no un producto pulido; puede tener artefactos o degradación en la calidad de generación.
- Sin datos de rendimiento: no hay benchmarks que avalen su calidad en tareas estándar, lo que dificulta evaluar su utilidad real.
- Licencia MIT: permite uso comercial, pero el contenido generado puede violar leyes de propiedad intelectual o normativas locales.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en dominios técnicos donde no tiene datos suficientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo base en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Página de Ornith AI: https://ornith.online/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Ficha de Ornith-1.5-35B-A3B en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de abliteración usada: https://github.com/Sumandora/remove-refusals-with-transformers
