# kepom/rbinrs-Kimi-K2.5-BF16-abliterated-GGUF

## Resumen

El modelo `kepom/rbinrs-Kimi-K2.5-BF16-abliterated-GGUF` es una versión cuantizada en formato GGUF del modelo multimodal Kimi-K2.5 de Moonshot AI, modificada mediante la técnica de *abliteration* para eliminar los rechazos y filtros de seguridad del modelo original. El resultado es una variante "sin censura" orientada a usos experimentales o de investigación, donde se requiere una generación de contenido sin restricciones temáticas.

Kimi-K2.5 es un modelo de arquitectura Mixture of Experts (MoE) multimodal, capaz de procesar texto e imágenes, con capacidades avanzadas de agente, tool calling y razonamiento. El modelo base fue entrenado mediante *continual pretraining* sobre aproximadamente 15 billones de tokens mixtos visuales y de texto, partiendo de Kimi-K2-Base. Esta versión concreta, publicada por el usuario kepom, es una re-subida del trabajo de huihui-ai, que aplicó el proceso de abliteration y posterior cuantización a GGUF.

El repositorio ofrece pesos en cuantizaciones Q2_K y Q3_K, lo que permite ejecutar el modelo en entornos con recursos limitados, aunque su tamaño total (más de 1 billón de parámetros) sigue exigiendo hardware de gama alta o soluciones de inferencia heterogénea CPU-GPU. Es relevante para desarrolladores que necesitan un modelo multimodal con capacidades de agente y sin restricciones de contenido, siempre asumiendo los riesgos legales y éticos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal, basada en Kimi-K2.5 de Moonshot AI |
| Parametros totales | 1.026.408.232.448 (aprox. 1,03 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según ejemplos de uso en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (según HuggingFace) |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base Kimi-K2.5 es un MoE multimodal desarrollado por Moonshot AI. Aunque no se detallan en la información disponible los números exactos de expertos o la configuración interna, se sabe que es un modelo de gran escala con más de un billón de parámetros totales. El entrenamiento del modelo original consistió en una fase de *continual pretraining* sobre aproximadamente 15 billones de tokens mixtos de imagen y texto, partiendo de los pesos de Kimi-K2-Base. Esto le otorga capacidades nativas de comprensión visual y textual, junto con habilidades de razonamiento y uso de herramientas.

La versión *abliterated* se creó mediante la técnica descrita en el repositorio [remove-refusals-with-transformers](https://github.com/Sumandora/remove-refusals-with-transformers), que consiste en identificar y eliminar las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. El resultado es un modelo que no filtra contenido sensible, controversial o inapropiado. Posteriormente, los pesos en BF16 se convirtieron a formato GGUF con cuantizaciones Q2_K y Q3_K para facilitar su ejecución con herramientas como llama.cpp.

## Capacidades

- Generación de texto y comprensión de imágenes (entrada multimodal imagen-texto).
- Razonamiento complejo y resolución de problemas en múltiples dominios.
- Soporte de tool calling / function calling, verificado con la herramienta opencode y llama-server.
- Capacidades de agente: puede ejecutar tareas multi-paso y utilizar herramientas externas.
- Modos "instant" y "thinking" (respuesta inmediata o razonamiento extendido), según la documentación oficial de Kimi-K2.5.
- Soporte de conversación multi-turno con contexto largo (hasta 262.144 tokens).
- Capacidades multilingües, aunque no se especifican los idiomas concretos en la información proporcionada.
- Al estar *abliterated*, no presenta rechazos por contenido sensible o controvertido (dentro de los límites de su conocimiento).

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de un LLM sin filtros de seguridad, analizando sesgos, alucinaciones o dinámicas de generación de contenido extremo en entornos controlados.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que aborden temas tabú o controvertidos, donde un modelo censurado bloquearía la generación.
- Desarrollo de agentes autónomos para automatización de tareas: gracias a su soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de automatización que requieran interacción con APIs, bases de datos o ejecución de comandos.
- Análisis de imágenes y generación de descripciones detalladas: su capacidad multimodal permite procesar capturas de pantalla, diagramas o fotografías para extraer información o generar informes.
- Evaluación comparativa de modelos sin censura: sirve como referencia para comparar el rendimiento de otros modelos *abliterated* en tareas de razonamiento, código o visión.
- Prototipado de asistentes conversacionales con personalidad sin restricciones: para entornos de demostración o pruebas de concepto donde no se requiere moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del modelo en BF16 es de aproximadamente 1,03 billones de parámetros, lo que implica un peso de alrededor de 2 TB en precisión completa. Las versiones cuantizadas Q2_K y Q3_K reducen significativamente el espacio, pero siguen siendo grandes (el repositorio ocupa 862,9 GB en total, incluyendo todas las cuantizaciones).
- Para ejecutar la cuantización Q2_K se estima que se necesitan al menos 250-300 GB de memoria (VRAM o RAM unificada). Esto supera la capacidad de cualquier GPU consumer actual (p. ej., RTX 4090 con 24 GB).
- Se recomienda el uso de múltiples GPUs de alta gama (A100 80 GB, H100 80 GB) en configuración multi-GPU, o bien inferencia heterogénea CPU-GPU mediante frameworks como KTransformers, que soporta cuantización RAWINT4 y ejecución parcial en CPU.
- Herramientas de despliegue compatibles: llama.cpp (llama-server, llama-mtmd-cli), Ollama (si se convierte a formato compatible), vLLM (con adaptaciones para MoE), TGI (si se añade soporte).
- La latencia y el throughput no están documentados en la información proporcionada; dependerán del hardware y la configuración exacta.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos. Como referencia cualitativa, este modelo se sitúa en la misma categoría que otros MoE multimodales de gran escala como DeepSeek-VL2 o Qwen2.5-VL, aunque Kimi-K2.5 destaca por su énfasis en capacidades de agente y tool calling. La versión *abliterated* es única en el sentido de que elimina los filtros de seguridad, algo que no ofrecen los modelos originales.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente privado de sus mecanismos de rechazo, por lo que puede generar contenido sensible, controvertido, ilegal o éticamente cuestionable. No es apto para entornos públicos ni para menores.
- Riesgo elevado de alucinaciones, especialmente en dominios donde el conocimiento del modelo es limitado.
- La licencia modified-mit permite uso comercial, pero el autor (huihui-ai) recomienda explícitamente no usarlo en producción o aplicaciones públicas sin supervisión.
- No se garantiza la exactitud de los idiomas soportados; la información oficial no los especifica.
- El tamaño del modelo y sus requisitos de memoria limitan su uso a entornos con infraestructura avanzada.
- No se han publicado evaluaciones de sesgos o robustez; el proceso de abliteration puede introducir comportamientos impredecibles.
- El repositorio original es de huihui-ai; esta versión de kepom puede ser un mirror sin mantenimiento activo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kepom/rbinrs-Kimi-K2.5-BF16-abliterated-GGUF
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Kimi-K2.5-BF16-abliterated-GGUF
- Repositorio espejo de rbinrs: https://huggingface.co/rbinrs/rbinrs-Kimi-K2.5-BF16-abliterated-GGUF
- Repositorio espejo de Trilogix1: https://huggingface.co/Trilogix1/Kimi-K2.5-BF16-abliterated-GGUF
- Página oficial de Kimi K2.5: https://www.kimi.com/ai-models/kimi-k2-5
- GitHub de MoonshotAI/Kimi-K2.5: https://github.com/MoonshotAI/Kimi-K2.5
- Documentación de KTransformers para Kimi-K2.5: https://deepwiki.com/kvcache-ai/ktransformers/9.3-kimi-k2.5
- Herramienta de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
