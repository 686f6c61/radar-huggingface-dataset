# cbert33/Ornith-1.5-9B-FP8-Heretic

## Resumen

Ornith-1.5-9B-FP8-Heretic es un modelo derivado de `Sohailhosseini/Ornith-1.5-9B-FP8`, modificado con la técnica de abliteración Heretic para reducir el comportamiento de rechazo aprendido durante el entrenamiento. El modelo resultante es un checkpoint independiente, fusionado y re-cuantizado a FP8, que no requiere adaptadores PEFT ni el directorio del modelo base para inferencia. Está diseñado para tareas multimodales (imagen-texto) y soporta tool calling nativo, manteniendo la arquitectura Qwen3.5 subyacente.

El modelo pertenece a la familia Ornith-1.5, una serie de modelos auto-mejorables orientados a tareas agénticas, desarrollada por ornith-ai. Según la documentación oficial, Ornith-1.5 extiende el marco de auto-andamiaje de Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos y produce rollouts de soluciones para aprendizaje por refuerzo. Esta versión de 9B es la más pequeña de la familia, que también incluye variantes de 35B y 397B (MoE).

La relevancia de este checkpoint concreto radica en su naturaleza abliterada: al eliminar parcialmente los mecanismos de rechazo, el modelo puede resultar más útil en escenarios donde el comportamiento defensivo del modelo base limitaba la generación, aunque esto conlleva riesgos adicionales de seguridad que deben evaluarse antes de su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformers) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 estático por canal (compressed-tensors), activaciones FP8 dinámicas por token |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8 y BF16) |

## Arquitectura y entrenamiento

El modelo base es `Sohailhosseini/Ornith-1.5-9B-FP8`, que a su vez se construye sobre la arquitectura Qwen3.5, una familia de modelos multimodales con soporte para entrada de imágenes y texto. La versión original de Ornith-1.5 se entrena mediante un proceso de auto-mejora que combina generación de tareas, andamiajes específicos y aprendizaje por refuerzo, aunque los detalles concretos del dataset y el número de tokens de entrenamiento no se especifican en la información disponible.

El proceso de derivación con Heretic sigue una pipeline acotada: primero se ejecuta una optimización de Heretic contra el checkpoint FP8 fijado, luego se exporta la dirección LoRA de rango 1 seleccionada, se fusiona en un intermediario BF16 y finalmente se re-cuantiza al esquema FP8 original. La verificación tensor a tensor confirma que solo 42 pesos cambiaron (en `mlp.down_proj`, `self_attn.o_proj` y `linear_attn.out_proj`), junto con sus escalas FP8 asociadas, mientras que el resto del modelo permanece bit-idéntico al checkpoint fuente. Esto acota el derivado como una modificación estrecha y controlada, no una conversión completa del modelo.

## Capacidades

- Generación de texto y razonamiento: el modelo mantiene las capacidades lingüísticas del Qwen3.5 subyacente, incluyendo instrucciones complejas y razonamiento multi-paso.
- Tool calling nativo: el chat template acepta definiciones de funciones estilo OpenAI y emite representaciones XML de Qwen para llamadas a herramientas. El smoke test verifica selección de herramientas, construcción de argumentos y round-trip con resultados simulados.
- Multimodalidad: al ser un modelo image-text-to-text, puede procesar entradas de imagen junto con texto, aunque no se detallan capacidades específicas de visión en la documentación.
- Abliteración: la modificación con Heretic reduce el rechazo aprendido, lo que puede aumentar la utilidad en dominios donde el modelo base era excesivamente restrictivo.
- Soporte de agentes: el modelo puede encadenar llamadas a herramientas de forma dependiente (por ejemplo, geocodificar antes de consultar el tiempo), como se observa en el smoke test.
- Integración con transformers: carga directa mediante `AutoModelForImageTextToText` sin necesidad de PEFT ni del directorio base.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con acceso a herramientas como consultas de pedidos o devoluciones, gracias a su soporte nativo de tool calling y su capacidad para incorporar resultados de herramientas en respuestas naturales.
- Generación de código en producción: con tool calling y razonamiento, puede integrarse en pipelines de CI/CD para autogenerar código, revisar cambios o ejecutar comandos de compilación, aunque su rendimiento exacto en benchmarks de código no está documentado.
- Agentes autónomos de investigación: el modelo puede planificar pasos dependientes (geocodificar, buscar, calcular) y ejecutarlos secuencialmente, lo que lo hace adecuado para tareas de recopilación de información estructurada.
- Análisis de imágenes con contexto textual: al ser multimodal, puede procesar capturas de pantalla o diagramas junto con instrucciones en texto, por ejemplo para extraer datos de gráficos o describir interfaces.
- Chatbots especializados sin restricciones excesivas: la abliteración reduce el rechazo, lo que puede ser útil en dominios técnicos o creativos donde el modelo base rechazaba peticiones legítimas, siempre que se implementen salvaguardas adicionales.
- Prototipado rápido de asistentes con herramientas: gracias a su formato FP8 y tamaño de 9B, puede desplegarse en hardware de gama media para pruebas de concepto de agentes con llamadas a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un smoke test determinista de 6/6 casos (coherencia, tool calling y round-trip), pero no constituye una evaluación comparativa estándar. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros benchmarks habituales.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 11,9 GB en FP8. Para inferencia, se recomienda al menos 16 GB de VRAM para acomodar los pesos y el overhead de activaciones y KV-cache.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 de 40 GB serían adecuadas. En GPUs con 12 GB (como RTX 3060) podría ser ajustado, dependiendo de la longitud de contexto y el batch.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama alta para consumidores, como la RTX 4080/4090, gracias a la cuantización FP8.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM, TGI o cualquier framework compatible con compressed-tensors y Qwen3.5. También puede usarse con llama.cpp si se convierte a GGUF, aunque no se proporciona esa conversión.
- Latencia y throughput: no disponibles. El smoke test se ejecutó en CUDA con generación determinista, pero no se reportan métricas de rendimiento.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. La familia Ornith-1.5 incluye versiones de 35B y 397B (MoE), pero no se publican resultados comparativos de rendimiento. Como referencia arquitectónica, el modelo base Qwen3.5 comparte linaje con otros modelos multimodales de tamaño similar (por ejemplo, Qwen2.5-VL-7B o Llama-3.2-11B-Vision), pero no hay datos de benchmarks que permitan una comparación cuantitativa. La licencia MIT es más permisiva que la de muchos modelos comparables, lo que facilita el uso comercial.

## Limitaciones y advertencias

- La abliteración reduce el rechazo aprendido, pero no garantiza que el modelo sea correcto, seguro o imparcial. Puede generar contenido inapropiado o factualmente erróneo en dominios sensibles.
- El smoke test de tool calling es limitado: no evalúa ejecución real de herramientas, llamadas paralelas, resultados malformados, restricción de herramientas ni comportamiento en contextos largos.
- La calidad multimodal no ha sido evaluada en profundidad; no se especifican capacidades concretas de visión (reconocimiento de objetos, OCR, etc.).
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con ventanas largas.
- No se han publicado benchmarks estándar, por lo que el rendimiento relativo frente a otros modelos de 9B es desconocido.
- Aunque la licencia MIT permite uso comercial, el modelo derivado puede heredar restricciones del modelo base original (Ornith-1.5), cuya licencia no se detalla en la información proporcionada.
- El proceso de re-cuantización FP8 puede introducir pérdidas de precisión adicionales, aunque la verificación confirma que solo 42 pesos cambiaron respecto al checkpoint fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cbert33/Ornith-1.5-9B-FP8-Heretic
- Modelo base (Sohailhosseini): https://huggingface.co/Sohailhosseini/Ornith-1.5-9B-FP8
- Modelo original de Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Herramienta Heretic: https://github.com/p-e-w/heretic
