# lLYryc/Huihui-gemma-4-12B-agentic-fable5-abliterated

## Resumen

Huihui-gemma-4-12B-agentic-fable5-abliterated es una versión "abliterada" (sin filtros de rechazo) del modelo yuxinlu1/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2, publicada por el usuario lLYryc en Hugging Face. El proceso de abliteration, realizado con la técnica descrita en el repositorio remove-refusals-with-transformers, elimina las negativas de seguridad del modelo base sin necesidad de reentrenamiento completo, lo que lo hace capaz de responder a instrucciones que los modelos convencionales rechazarían.

El modelo base es un fine-tuning de Gemma 4 de 12B parámetros orientado a tareas agénticas, razonamiento y programación, según indican sus etiquetas (coding, reasoning, thinking, agentic). Al tratarse de una variante Gemma, hereda la arquitectura transformer multimodal image-text-to-text de la familia, aunque la model card no detalla las capacidades de visión de esta versión concreta.

Su relevancia actual radica en la demanda de modelos abiertos sin restricciones para investigación, red-teaming y entornos controlados. Con casi 12.000 millones de parámetros y licencia Apache 2.0, es ejecutable en GPUs de consumo de gama alta y puede integrarse en flujos de trabajo locales sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, image-text-to-text); detalle exacto no disponible |
| Parametros totales | 11.959.730.224 (≈ 12B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 24,0 GB) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 de 12B parámetros, arquitectura transformer de la familia Gemma de Google clasificada como image-text-to-text. Sobre este modelo base, yuxinlu1 creó el fine-tuning gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2, orientado según sus etiquetas a comportamientos agénticos, razonamiento (reasoning/thinking) y generación de código. No se han publicado datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de técnicas como RLHF o DPO.

La contribución específica de esta ficha es la abliteration: una modificación de los pesos que neutraliza las direcciones de rechazo en el espacio de activaciones del modelo, eliminando las respuestas de negativa de seguridad. Según la model card, se trata de una implementación "cruda" de prueba de concepto que no utiliza TransformerLens. No se trata de un reentrenamiento, sino de una edición directa de los pesos originales.

## Capacidades

- Generacion de texto conversacional, con pipeline etiquetado como text-generation.
- Razonamiento y modo de pensamiento (tags reasoning y thinking), heredados del modelo base agéntico.
- Generacion y comprension de codigo (tags coding y code).
- Comportamiento agéntico, según la denominación del modelo base (agentic-fable5).
- Posible procesamiento multimodal imagen-texto, por la clasificación image-text-to-text de Gemma 4, aunque la model card no lo documenta.
- Sin filtros de rechazo: responde a instrucciones que el modelo original rechazaría, a costa de poder generar contenido sensible o inapropiado.
- No se documenta soporte de tool calling, function calling ni capacidades de audio.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite estudiar el comportamiento de un modelo sin capas de rechazo, util para investigar vulnerabilidades y probar guardrails externos antes de desplegar modelos convencionales.
- Investigacion en abliteration: sirve como caso de estudio para analizar cómo la edición de pesos afecta a las capacidades de razonamiento y código del modelo base.
- Generacion de codigo en entornos controlados: gracias a los tags de coding del modelo base, puede asistir en tareas de programación donde el desarrollador prefiera no encontrar negativas del modelo, por ejemplo en la escritura de exploits para auditorías de seguridad autorizadas.
- Experimentacion agéntica local: con casi 12B de parámetros, puede ejecutarse en estaciones de trabajo locales para prototipar flujos agénticos sin depender de APIs externas.
- Escritura creativa sin restricciones: útil para ficción con contenido adulto o temáticas delicadas en entornos privados, donde los modelos estándar suelen rechazar la tarea.
- Pruebas de robustez de pipelines: permite verificar que un sistema de producción gestiona correctamente salidas inapropiadas, usando el modelo como generador de casos adversos.
- Comparativa de alineamiento: al existir el modelo base original, se pueden ejecutar ambos en paralelo para medir el efecto exacto de la abliteration en benchmarks y comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11,96B de parámetros en FP16/BF16 (repo de 24,0 GB), se necesitan aproximadamente 24 GB de VRAM en precisión completa; con cuantización a 4 bits (por ejemplo GGUF Q4_K_M, no incluida en el repo) la estimación baja a unos 7-8 GB, no disponible oficialmente.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para precisión completa; A100 o H100 para despliegue con contexto largo o servicio concurrente. Con cuantización de terceros, cabría en GPUs de 12 GB como la RTX 3060 o RTX 4070.
- En consumer GPU: sí, en precisión completa cabe en una RTX 4090 o RTX 3090 de 24 GB; en GPUs de 8-12 GB sería necesario aplicar cuantización no proporcionada en este repositorio.
- Opciones de despliegue: transformers (librería nativa del modelo); al estar en safetensors con arquitectura Gemma, es compatible con vLLM, TGI, llama.cpp y Ollama si se convierte a GGUF, aunque estas conversiones no están disponibles en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Huihui-gemma-4-12B-agentic-fable5-abliterated | ≈ 12B | no disponible | Apache 2.0 | Versión abliterada, sin filtros de rechazo |
| yuxinlu1/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2 (modelo base) | ≈ 12B | no disponible | no disponible | Fine-tuning agéntico con alineamiento original |
| Gemma 3 12B (Google) | ≈ 12B | 128K | Gemma license | Modelo oficial multimodal con safety training |

Frente al modelo base, esta versión ofrece los mismos pesos con el rechazo de seguridad eliminado, a costa de fiabilidad. Frente a Gemma 3 12B oficial, ofrece una licencia más permisiva (Apache 2.0) y ausencia de filtros, pero pierde las garantías de seguridad y optimización de Google, y no se han publicado benchmarks que permitan comparar rendimiento.

## Limitaciones y advertencias

- La abliteration reduce significativamente el filtrado de seguridad: puede generar contenido sensible, controvertido o inapropiado, y requiere revisión manual rigurosa de las salidas.
- No apto para todos los públicos: las salidas pueden ser inapropiadas para entornos públicos, menores de edad o aplicaciones que exijan alta seguridad.
- El propio autor recomienda limitar su uso a investigación, pruebas o entornos controlados, evitando producción o aplicaciones comerciales de cara al público.
- No ofrece garantías de seguridad por defecto: no ha pasado por una optimización de seguridad rigurosa, y el autor declina cualquier responsabilidad por las consecuencias de su uso.
- La abliteration es una prueba de concepto "cruda" sin TransformerLens: puede degradar las capacidades de razonamiento, código y seguimiento de instrucciones del modelo base; no hay benchmarks que cuantifiquen esta degradación.
- El usuario asume la responsabilidad legal y ética completa del uso, que debe cumplir la legislación local.
- Longitud de contexto, idiomas soportados y datos de rendimiento no están documentados, lo que dificulta su evaluación para producción.
- Riesgo de alucinación: no evaluado; al tratarse de un fine-tuning comunitario abliterado, no existen mediciones publicadas de fiabilidad factual.
- Licencia Apache 2.0 del repo, pero conviene verificar la licencia efectiva del modelo base Gemma subyacente antes de uso comercial.

## Enlaces

- Modelo: https://huggingface.co/lLYryc/Huihui-gemma-4-12B-agentic-fable5-abliterated
- Modelo base: https://huggingface.co/yuxinlu1/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2
- Tecnica de abliteration (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Organizacion huihui.ai (Ko-fi, mencionada en la model card): https://ko-fi.com/huihuiai
