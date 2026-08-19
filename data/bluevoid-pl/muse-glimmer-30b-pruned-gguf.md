# bluevoid-pl/Muse-Glimmer-30B-pruned-GGUF

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 000 millones de parámetros desarrollado por Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Integra razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imágenes) y recuperación ante fallos en un único modelo que puede ejecutarse localmente sin infraestructura en la nube. La versión aquí descrita, `bluevoid-pl/Muse-Glimmer-30B-pruned-GGUF`, es una conversión GGUF podada por el usuario bluevoid-pl que solo contiene caracteres latinos, por lo que puede fallar o romperse en entornos no latinos.

El modelo original presenta una arquitectura transformer densa con encoder de percepción (ViT-G/14 de ~1,8B parámetros), una ventana de contexto de 131 072 tokens y soporte para entrada intercalada de texto e imágenes. Está optimizado para despliegue local mediante cuantización y decodificación especulativa con un modelo auxiliar DFlash, alcanzando velocidades de hasta 233 tokens por segundo en una RTX 5090. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Causal Transformer con Perception Encoder (ViT-G/14) |
| Parametros totales | 26 968 987 136 (según safetensors de esta versión pruned; el modelo original declara ~29,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072+ |
| Tipos de cuantizacion | GGUF (no se especifican los niveles concretos en la información disponible; el autor menciona K-Quant-Dynamic y K-Quant-17GB en la card original) |
| Idiomas soportados | No disponible para esta versión pruned (solo caracteres latinos). El modelo original declara más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repo original) |

## Arquitectura y entrenamiento

Muse Glimmer es un transformer causal denso de 52 capas con dimensión oculta 6656 y atención con patrón repetido [Local, Local, Local, Global]. La atención local usa ventana deslizante de 2048 tokens, mientras que la global emplea RoPE con theta 500 000. El FFN es SwiGLU con dimensión intermedia 19 968. El modelo incorpora un encoder de percepción ViT-G/14 de ~1,8B parámetros que permite procesar imágenes y texto intercalado, con un máximo de 4096 tokens visuales por imagen. El vocabulario es de 202 048 tokens (200 000 BPE + 2048 especiales).

El entrenamiento se realizó con datos multimodales de fuentes públicas, datos de terceros y productos de Meta, con un corte de conocimiento en enero de 2026. La card original menciona entrenamiento y evaluación en capacidades agénticas como finalización de tareas de extremo a extremo, uso fiable de herramientas, razonamiento multi-paso, recuperación ante fallos y compatibilidad con scaffolds como OpenClaw y Hermes Agent. No se especifican detalles sobre RLHF o DPO en la información disponible. La versión pruned elimina caracteres no latinos, lo que reduce el vocabulario efectivo y puede degradar el rendimiento en idiomas no latinos.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Uso fiable de herramientas (tool calling) con invocación de funciones mediante esquemas precisos a lo largo de flujos extendidos.
- Comprensión multimodal: acepta entrada intercalada de texto e imágenes (capturas de pantalla, gráficos, documentos) y produce salida de texto.
- Recuperación ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds agénticos como OpenClaw, Hermes Agent y otros patrones de orquestación.
- Esfuerzo controlable: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingüe en el modelo original (más de 100 idiomas), aunque la versión pruned solo mantiene caracteres latinos.
- Decodificación especulativa mediante el modelo auxiliar DFlash, que propone bloques de 16 tokens en una sola pasada.

## Casos de uso

- Agentes autónomos de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131 072 tokens) y usar herramientas para consultar bases de datos o sistemas externos, manteniendo el hilo durante interacciones prolongadas.
- Asistentes de desarrollo de software: integrado en pipelines de CI/CD, puede leer issues, generar código, ejecutar pruebas y corregir errores de forma autónoma gracias a su capacidad de tool calling y recuperación ante fallos.
- Análisis de documentos técnicos con imágenes: al aceptar entrada multimodal, puede interpretar diagramas, capturas de pantalla y gráficos junto con texto, útil para documentación técnica o informes de incidencias.
- Automatización de tareas de oficina: puede interactuar con aplicaciones mediante APIs, leer correos, resumir documentos y redactar respuestas, todo localmente sin depender de la nube.
- Investigación y razonamiento profundo: su capacidad de razonamiento multi-paso y ventana de contexto larga permite tareas como búsqueda de información en documentos extensos, síntesis de literatura o resolución de problemas complejos.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con cuantización (menos de 20 GB para el modelo), es adecuado para sectores con restricciones de datos (sanidad, banca) donde no se permite enviar información a servicios externos.

## Benchmarks y rendimiento

La card original menciona que el modelo fue evaluado en benchmarks agénticos como DeepSearch QA, MCP-Atlas, 𝛕3-Bench y SWE-Bench, pero no se proporcionan cifras concretas en la información disponible. También se indica una degradación media del 0,2 % con cuantización K-Quant-Dynamic y del 1,0 % con K-Quant-17GB en 15 benchmarks comunes, pero sin listar los resultados absolutos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a ~4 bits ocupa menos de 20 GB, dejando margen para KV cache, encoder de percepción y drafter dentro de una envolvente de 24 GB o 32 GB.
- GPU recomendadas: NVIDIA RTX 5090 (velocidad medida de 233,4 tok/s con especulación DFlash), Apple M4 Max (37,8 tok/s) y M5 Max. También es viable en GPUs de 24 GB como RTX 3090/4090 con cuantización adecuada.
- En consumer GPU: sí, cabe en GPUs de 24 GB o 32 GB con cuantización (K-Quant-17GB para 24 GB, K-Quant-Dynamic para 32 GB).
- Opciones de despliegue: formato GGUF compatible con llama.cpp, Ollama, vLLM (según la página de NVIDIA NIM) y otros runners que soporten GGUF. La card original menciona compatibilidad con scaffolds como OpenClaw y Hermes Agent.
- Latencia y throughput: sin especulación, 74,9 tok/s en RTX 5090 y 23,7 tok/s en M4 Max. Con DFlash, 233,4 tok/s y 37,8 tok/s respectivamente (aceleración de 3,1x y 1,5x).

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría (30B agénticos multimodales) en la información proporcionada. La card original no ofrece comparaciones con alternativas como Qwen2.5-32B, Llama 3.3 70B o Mistral Large, ni se han encontrado benchmarks comparativos en los resultados de búsqueda. Se recomienda consultar la documentación oficial de Meta para obtener métricas detalladas.

## Limitaciones y advertencias

- Esta versión pruned solo contiene caracteres latinos; puede romperse o fallar al procesar texto en alfabetos no latinos (cirílico, árabe, CJK, etc.).
- El autor de la versión pruned (bluevoid-pl) advierte explícitamente de que el modelo "might break/die for no reason", lo que implica inestabilidad potencial en producción.
- No se han publicado resultados de benchmarks detallados para esta versión pruned, por lo que se desconoce el impacto exacto de la poda en el rendimiento.
- El modelo original tiene un corte de conocimiento en enero de 2026; la versión pruned no modifica ese corte.
- Aunque la licencia Apache 2.0 permite uso comercial, el usuario final debe verificar que la versión pruned cumple con los términos de la licencia original y con las condiciones de redistribución de Meta.
- La cuantización introduce una degradación media de hasta el 1,0 % en benchmarks (según la card original), que puede ser mayor en tareas específicas o con la poda adicional.
- El modelo requiere un scaffold agéntico (OpenClaw, Hermes Agent, etc.) para aprovechar plenamente sus capacidades de tool calling y recuperación ante fallos; su uso como simple chat puede no reflejar su potencial real.

## Enlaces

- [Repositorio HuggingFace de la versión pruned GGUF](https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-pruned-GGUF)
- [Repositorio HuggingFace de la versión GGUF completa](https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-GGUF)
- [Model card en NVIDIA NIM](https://build.nvidia.com/meta/muse-glimmer-30b/modelcard)
- [Guía interactiva en GitHub (cobusgreyling)](https://github.com/cobusgreyling/Muse-Glimmer/tree/main)
- [Documentación oficial de Meta para obtener el modelo](https://dev.meta.ai/docs/muse-glimmer/get-the-model)
