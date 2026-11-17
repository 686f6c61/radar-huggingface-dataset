# LlamaPal/LFM2.5-8B-A1B-Q4_0-GGUF

## Resumen

LFM2.5-8B-A1B es un modelo de lenguaje de arquitectura mixta de expertos (MoE) desarrollado por Liquid AI. Con 8.467.856.832 parámetros totales, activa aproximadamente 1.500 millones de parámetros por token, lo que le permite mantener una latencia baja en inferencia pese a su tamaño total. Es la evolución de la familia LFM2, con mejoras declaradas en seguimiento de instrucciones, matemáticas y uso de herramientas.

La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF en formato Q4_0 publicada por el usuario LlamaPal como espejo del fichero oficial de Liquid AI. El repositorio existe para alimentar la aplicación LlamaPal, una app Android de chat con IA totalmente offline, sin cuenta y sin conexión a internet. El fichero pesa 4,8 GB y es una copia byte a byte del publicado en LiquidAI/LFM2.5-8B-A1B-GGUF (mismo SHA-256), por lo que las capacidades del modelo son las del original de Liquid AI.

Su relevancia actual radica en que demuestra que un MoE de 8B puede ejecutarse en un teléfono Android moderno con cuantización de 4 bits, manteniendo un tamaño de descarga manejable y funcionamiento completamente local. Es una pieza orientada a despliegue en el borde (edge), no a servidores de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles internos del original no disponibles en esta ficha |
| Parametros totales | 8.467.856.832 |
| Parametros activos | Aproximadamente 1.500 millones por token (según model card del espejo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (este repositorio); otras cuantizaciones en el repo original de Liquid AI, no detalladas aquí |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | GGUF (fichero `LFM2.5-8B-A1B-Q4_0.gguf`, 4,8 GB) |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de Liquid AI con 8.467.856.832 parámetros totales y aproximadamente 1.500 millones activos por token. La model card del espejo indica que esta generación introduce mejoras sustanciales frente a LFM2 en instrucciones, matemáticas y uso de herramientas, pero no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones de atención, decodificación especulativa u otras optimizaciones internas.

El fichero de este repositorio es una cuantización Q4_0 generada con llama.cpp, sin modificaciones respecto al original: mismo tamaño (4,8 GB) y mismo hash SHA-256 (`48ed1465d761311b2fd57b7fb46cf969a20b3a8281945b04e10f52bd1609e715`). El autor del espejo no aporta información adicional sobre el proceso de entrenamiento ni sobre la arquitectura interna más allá de la naturaleza MoE.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat.
- Razonamiento mejorado respecto a LFM2, según la model card del espejo.
- Capacidades matemáticas reforzadas en esta generación.
- Uso de herramientas (tool use) mejorado frente a LFM2, según la model card.
- Ejecución completamente offline en dispositivo, sin envío de datos a servidores.
- Compatible con endpoints (tag `endpoints_compatible`) y con el pipeline de text-generation de Hugging Face.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Soporte de visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Chat privado en Android: la app LlamaPal descarga este GGUF y permite conversar sin conexión, sin cuenta y sin que el texto salga del teléfono; adecuado para usuarios que priorizan privacidad y movilidad.
- Asistente personal offline en movilidad: al funcionar sin red, sirve en aviones, zonas rurales o entornos con conectividad restringida, siempre que el dispositivo tenga RAM suficiente para el fichero de 4,8 GB.
- Prototipado rápido en llama.cpp: al ser un GGUF estándar, se puede cargar en llama.cpp y en cualquier aplicación construida sobre él para probar el MoE de Liquid AI sin infraestructura de servidor.
- Generación de texto y resúmenes en el dispositivo: para procesar notas, correos o documentos locales sin subirlos a la nube, aprovechando la ventana de contexto del modelo original (longitud no especificada en esta ficha).
- Tareas de razonamiento ligero y matemáticas en el borde: la model card destaca mejoras en matemáticas, lo que lo hace apto para cálculos y explicaciones paso a paso en local.
- Integración en pipelines de agentes con tool calling: el uso de herramientas mejorado permite conectarlo a funciones locales o APIs en aplicaciones que ya usan llama.cpp como backend.
- Evaluación comparativa de MoE en hardware móvil: útil para investigadores que quieran medir latencia y calidad de un MoE de 8B con 1,5B activos en un teléfono frente a modelos densos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q4_0 ocupa 4,8 GB; se necesita al menos esa cantidad de memoria libre, más overhead del runtime (aproximadamente 5-6 GB en total).
- GPU de escritorio recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090, A100, H100); al ser MoE con 1,5B activos, el cómputo por token es moderado.
- GPU consumer: cabe en tarjetas de 8 GB o más con la cuantización Q4_0; en GPUs de 6 GB requeriría cuantizaciones más agresivas no incluidas en este repositorio.
- Móvil: diseñado para Android mediante la app LlamaPal; requiere un dispositivo con RAM suficiente para alojar 4,8 GB de pesos más el contexto (no se especifican modelos concretos de teléfono).
- Opciones de despliegue: llama.cpp y aplicaciones basadas en él (LlamaPal en Android); compatible con endpoints según los tags. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-8B-A1B (este GGUF Q4_0) | 8,47B | ~1,5B | no disponible | LFM Open License v1.0 | GGUF | Hugging Face (espejo) |
| LFM2.5-8B-A1B (original Liquid AI) | 8,47B | ~1,5B | no disponible | LFM Open License v1.0 | safetensors y GGUF | Hugging Face (LiquidAI) |
| LFM2.5-2.6B-GGUF (misma familia) | no disponible | no disponible | no disponible | LFM Open License v1.0 | GGUF | Hugging Face (LiquidAI) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización Q4_0 introduce pérdida de precisión respecto a los pesos originales; la calidad puede degradarse en tareas sensibles a cuantización, como matemáticas complejas o código.
- No se especifican sesgos conocidos ni evaluación de seguridad en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay datos específicos de mitigación para este modelo.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Longitud de contexto no disponible: limita la planificación de aplicaciones con documentos largos.
- Licencia LFM Open License v1.0: es una licencia "other" con términos propios; es imprescindible revisar el texto completo antes de uso comercial, ya que puede incluir restricciones no reflejadas en esta ficha.
- Este repositorio es un espejo no oficial de un tercero (LlamaPal); para producción conviene depender del repositorio original de Liquid AI.
- El tamaño de 4,8 GB limita su uso a dispositivos con RAM suficiente; en móviles de gama baja o media puede no ser viable.
- No se confirma soporte de vLLM, TGI u Ollama, lo que restringe las opciones de despliegue en servidor.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/LlamaPal/LFM2.5-8B-A1B-Q4_0-GGUF
- Repositorio original GGUF de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Repositorio del modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
