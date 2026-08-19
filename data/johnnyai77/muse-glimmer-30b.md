# johnnyai77/Muse-Glimmer-30B

## Resumen

Muse-Glimmer-30B es un modelo de lenguaje causal denso de aproximadamente 29,6 mil millones de parámetros, desarrollado por el usuario johnnyai77 en HuggingFace, aunque la model card atribuye su creación a "Meta Superintelligence Lab" sin que exista verificación independiente de dicha autoría. Se presenta como una destilación de un modelo mayor llamado Muse Spark, orientado específicamente a tareas agénticas en hardware de consumo, integrando razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imagen) y recuperación ante fallos en un único sistema que puede ejecutarse localmente sin conexión.

El modelo combina un transformer causal denso con un encoder de percepción basado en ViT-G/14 de aproximadamente 1,8 mil millones de parámetros, lo que le permite procesar entradas intercaladas de texto e imágenes. Su longitud de contexto declarada supera los 131.072 tokens, y está diseñado para funcionar con cuantización de aproximadamente 4 bits, ocupando menos de 20 GB en memoria, lo que lo hace viable en GPUs de consumo de 24 GB o 32 GB. Incluye además un modelo auxiliar de decodificación especulativa basado en DFlash que acelera la generación de tokens entre 1,5x y 3,1x según el hardware.

La relevancia actual de este modelo radica en su enfoque explícito hacia la ejecución de agentes autónomos en entornos locales, cubriendo capacidades que suelen requerir múltiples modelos o infraestructura en la nube. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su soporte para más de 100 idiomas lo posiciona como una opción atractiva para despliegues multilingües. No obstante, al tratarse de un modelo reciente con cero descargas y cero likes en el momento de la consulta, su adopción y validación comunitaria aún están pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepción (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision (FP16/BF16), K-Quant-Dynamic (aprox. 4-bit), K-Quant-17GB (aprox. 4-bit, optimizado para 24 GB VRAM) |
| Idiomas soportados | Más de 100 idiomas (según model card); en HuggingFace figura como "no disponibles" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer causal denso con 52 capas, dimensión oculta de 6656 y atención con patrón alternante de ventana deslizante y global: cada cuatro capas, tres son locales con ventana de 2048 tokens y una es global. Utiliza atención con puerta (gated attention), cabezas de consulta/valor de 32/2 con agrupación GQA ratio 16:1, y FFN tipo SwiGLU con dimensión intermedia de 19.968. El posicionamiento se resuelve con RoPE (theta = 500.000) aplicado únicamente a las capas locales. El vocabulario total es de 202.048 tokens, compuesto por 200.000 tokens BPE más 2.048 tokens especiales.

El encoder de percepción es un ViT-G/14 de aproximadamente 1,8 mil millones de parámetros, con 50 capas, ancho 1536 y tamaño de parche 14, capaz de generar hasta 4.096 tokens visuales por imagen. El entrenamiento se realizó sobre contenido multimodal de fuentes públicas, datos de terceros y productos de Meta, con un corte de conocimiento en enero de 2026. No se especifican detalles sobre el número total de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO; la model card menciona destilación desde Muse Spark y un proceso de optimización para despliegue local, pero sin más concreción.

Una innovación destacable es la inclusión de un modelo "drafter" basado en DFlash, una red de difusión por bloques que propone bloques de 16 tokens en una sola pasada, mientras el modelo principal verifica y corrige en paralelo. Este mecanismo de decodificación especulativa acelera la generación sin degradar la calidad, y se proporcionan versiones cuantizadas del drafter para minimizar el coste de memoria adicional.

## Capacidades

- Generación de texto y razonamiento multi-paso: encadena razonamientos sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Uso fiable de herramientas (tool calling): invoca funciones con esquemas precisos a lo largo de workflows extendidos.
- Recuperación ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, diagnostica el error y reintenta en lugar de detenerse.
- Comprensión multimodal: acepta entradas intercaladas de texto e imágenes (capturas de pantalla, gráficos, documentos) mediante el encoder de percepción.
- Compatibilidad con scaffolds agénticos: funciona con OpenClaw, Hermes Agent y otros patrones de orquestación.
- Esfuerzo controlable: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingüismo: entrenado con datos de más de 100 idiomas.
- Decodificación especulativa integrada: el drafter DFlash permite generación más rápida sin cambiar la calidad de salida.

## Casos de uso

- Agentes autónomos de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (131K+ tokens) y usar herramientas para consultar bases de datos o sistemas de ticketing, manteniendo el hilo de la conversación y recuperándose de errores en llamadas a APIs.
- Automatización de tareas de desarrollo de software: con soporte para tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para escribir, depurar y corregir código, como se evalúa en SWE-Bench.
- Análisis de documentos y capturas de pantalla: gracias al encoder de percepción, puede interpretar imágenes de gráficos, tablas o interfaces de usuario y responder preguntas sobre ellas, útil en soporte técnico o análisis de datos visuales.
- Asistentes personales locales sin conexión: al ejecutarse en hardware de consumo (24-32 GB VRAM) y sin necesidad de red, puede servir como asistente privado que gestiona calendario, correo o tareas domésticas con comprensión multimodal.
- Búsqueda y respuesta con razonamiento profundo: en tareas tipo DeepSearch QA, el modelo puede planificar búsquedas, consultar fuentes y sintetizar respuestas complejas, manteniendo coherencia a lo largo de múltiples pasos.
- Automatización de flujos de trabajo empresariales: integrado en scaffolds como OpenClaw, puede orquestar acciones en múltiples herramientas (CRMs, ERPs, APIs internas) con recuperación ante fallos, reduciendo la intervención humana en procesos repetitivos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en tareas como DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, así como en 15 benchmarks comunes para medir la degradación por cuantización, pero no se proporcionan cifras concretas de accuracy o tasas de éxito. Tampoco se ofrecen comparativas con otros modelos. Por tanto, no es posible presentar una tabla de resultados verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica que con cuantización K-Quant-17GB el modelo ocupa menos de 20 GB, dejando margen para KV cache, encoder de percepción y drafter dentro de un envelope de 24 GB o 32 GB.
- GPU recomendadas: Nvidia RTX 5090 (medido a 233,4 tok/s con decodificación especulativa), Apple M4 Max (37,8 tok/s) y Apple M5 Max (50,2 tok/s). También se menciona que la versión full precision requiere 64 GB de VRAM.
- Compatibilidad con GPUs de consumo: sí, cabe en RTX 5090 (24 GB) y en Macs con 32 GB unificados, siempre usando cuantización.
- Opciones de despliegue: al ser un modelo de transformers con pesos en safetensors, es compatible con librerías como vLLM, llama.cpp, Ollama o TGI, aunque no se especifican configuraciones concretas en la documentación.
- Latencia y throughput: con batch size 1 y greedy decoding, se reportan 74,9 tok/s sin especulación y 233,4 tok/s con DFlash en RTX 5090; en Apple M4 Max 23,7 y 37,8 tok/s respectivamente; en M5 Max 26,6 y 50,2 tok/s.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (30B, multimodal, orientados a agentes). La model card no ofrece datos comparativos, y no se han identificado modelos equivalentes con especificaciones públicas similares en el momento de la consulta. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse con datos públicos y de terceros, es probable que herede sesgos presentes en dichos datos.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento largo o con herramientas que devuelven resultados inesperados.
- Limitaciones de contexto: aunque la ventana declarada es de 131.072+ tokens, el patrón de atención local-global puede afectar a la coherencia en secuencias muy largas; no se han publicado pruebas de estrés al respecto.
- Limitaciones de idioma: aunque se declara soporte para más de 100 idiomas, no se especifica el rendimiento relativo entre ellos; es probable que el inglés tenga mejor calidad que lenguas con menos representación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se atribuye a "Meta Superintelligence Lab" sin verificación; el usuario johnnyai77 es el publicador en HuggingFace, lo que genera incertidumbre sobre la autoría real y la procedencia de los pesos.
- Advertencia para producción: al ser un modelo con cero descargas y cero likes, no hay evidencia de validación comunitaria ni de estabilidad en entornos reales. Se recomienda realizar pruebas exhaustivas antes de desplegarlo en sistemas críticos.
- Dependencia de hardware específico: las velocidades reportadas se midieron en hardware concreto (RTX 5090, M4/M5 Max); en GPUs más antiguas o con menos memoria, el rendimiento puede degradarse significativamente.

## Enlaces

- [HuggingFace - johnnyai77/Muse-Glimmer-30B](https://huggingface.co/johnnyai77/Muse-Glimmer-30B)
- [arXiv:2504.13181 - Perception encoder (referencia)](https://arxiv.org/abs/2504.13181)
- [arXiv:2602.06036 - DFlash (referencia)](https://arxiv.org/abs/2602.06036)
