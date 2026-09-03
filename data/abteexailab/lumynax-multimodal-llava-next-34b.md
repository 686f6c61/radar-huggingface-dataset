# AbteeXAILab/lumynax-multimodal-llava-next-34b

## Resumen

LumynaX Multimodal LLaVA-Next 34B es un modelo multimodal de imagen-texto desarrollado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), dentro de su familia de modelos soberanos LumynaX. Este lanzamiento concreto, etiquetado como v0.1.0, es un artefacto de investigación legacy y obsoleto: la propia model card advierte que no está mantenido, no se recomienda para producción y no representa las capacidades actuales de AbteeX AI Labs. Su interés radica en la procedencia y reproducibilidad de experimentos tempranos.

El modelo se basa en el conocido LLaVA-Next (LLaVA-1.6) de 34 mil millones de parámetros, concretamente en la versión `liuhaotian/llava-v1.6-34b`, que combina un codificador visual con un modelo de lenguaje de tipo Yi-34B (según la etiqueta `yi-based`). El enfoque de LumynaX consiste en una "infusión enrutada": el núcleo LumynaX Core orquesta la inferencia a través del modelo infundido sin modificar sus pesos. En esta release no hay composición de pesos ni mezcla de expertos; simplemente se preservan los pesos originales del modelo fuente y se envuelven con la identidad y el runtime de LumynaX.

Con 34.751.166.464 parámetros y un tamaño de repositorio de 69,5 GB en formato safetensors, este modelo está pensado para ejecutarse con Transformers multimodal. Aunque su licencia Apache 2.0 permite uso comercial, su estado obsoleto y la falta de mantenimiento lo convierten en una opción solo para investigación o evaluación histórica, no para entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-Next (LLaVA-1.6) con codificador visual y LLM base Yi-34B (según tag `yi-based`) |
| Parametros totales | 34.751.166.464 (34,75 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en precisión original) |
| Idiomas soportados | en (inglés), mi (maorí) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA-Next (LLaVA-1.6), que acopla un codificador visual (típicamente CLIP) con un modelo de lenguaje autoregresivo. En este caso, el LLM base es Yi-34B, como indica la etiqueta `yi-based`. El pipeline completo es `image-text-to-text`: recibe una imagen y un prompt textual, y genera texto como respuesta.

La particularidad de esta release es el concepto de "infusión" de LumynaX. Según la model card, LumynaX Core actúa como capa de inteligencia y orquestación, dirigiendo la inferencia a través del modelo infundido mediante "infusión enrutada" (routed infusion), sin modificar los pesos del modelo fuente. No hay fusión de pesos ni entrenamiento adicional documentado; el paquete conserva los pesos originales de `liuhaotian/llava-v1.6-34b`. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El runtime declarado es Transformers multimodal.

## Capacidades

- Generación de texto multimodal: responde a preguntas y mantiene conversaciones sobre imágenes, describiendo contenido visual, respondiendo a consultas sobre objetos, escenas, texto en imágenes, etc.
- Comprensión de imágenes: al estar basado en LLaVA-Next, hereda las capacidades de razonamiento visual de ese modelo, incluyendo la comprensión de escenas complejas y la respuesta a instrucciones visuales.
- Soporte multilingüe limitado: los idiomas declarados son inglés y maorí (mi), lo que lo hace útil para aplicaciones orientadas a la población de Nueva Zelanda o al estudio del maorí.
- No se menciona soporte de tool calling, function calling, agentes, ni modos especiales de razonamiento (thinking mode). Tampoco se indica capacidad de audio o video.

## Casos de uso

- Investigación y reproducibilidad: dado su carácter legacy, el caso principal es reproducir experimentos tempranos de AbteeX AI Labs, verificar los checksums y analizar el `release_export_manifest.json` para entender cómo se construyó la infusión enrutada.
- Evaluación comparativa de modelos multimodales: puede usarse como punto de referencia para medir la evolución de la familia LumynaX o comparar con otros LLaVA-Next, aunque su estado obsoleto limita su valor práctico.
- Estudio de la lengua maorí en contextos visuales: al soportar `mi`, podría emplearse en proyectos de preservación lingüística que combinen imágenes y texto en maorí, siempre que se acepte el riesgo de alucinación.
- Educación y demostración: para enseñar cómo funciona un pipeline LLaVA-Next con un wrapper de orquestación, o para ilustrar el concepto de "infusión" sin modificación de pesos.
- Auditoría de seguridad y gobernanza de IA: al ser un artefacto abierto con licencia Apache 2.0, puede analizarse para estudiar sesgos o comportamientos de modelos multimodales de gran tamaño en entornos controlados.
- Desarrollo de prototipos locales (local-first): el repositorio incluye un Modelfile y scaffolding para ejecución local, lo que permite probar el modelo en entornos sin conexión, aunque con las limitaciones de hardware propias de un modelo de 34B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ni evaluaciones específicas de tareas visuales como VQAv2 o GQA. Tampoco se ofrecen comparativas con otros modelos. Dado que el modelo es una copia sin modificar de `liuhaotian/llava-v1.6-34b`, se podrían consultar los benchmarks públicos de ese modelo original, pero no se dispone de ellos en esta ficha.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 34,75 B parámetros en FP16, se necesitan aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización a int8 se reduciría a unos 35 GB, y a int4 a unos 18 GB, pero no se han publicado cuantizaciones oficiales para esta release.
- GPU recomendadas: para inferencia en FP16 se requiere una GPU de clase profesional como A100 (80 GB), H100 (80 GB) o una configuración multi-GPU. En cuantización int4 podría caber en una RTX 4090 (24 GB) o similar, pero no hay archivos GGUF ni AWQ disponibles en el repositorio.
- Opciones de despliegue: el runtime declarado es Transformers multimodal, por lo que puede usarse con `transformers` y `accelerate`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio GitHub incluye un Modelfile, lo que sugiere compatibilidad potencial con Ollama, pero no está confirmado.
- Latencia y throughput: no disponibles. Un modelo de este tamaño en una GPU A100 suele generar entre 10 y 30 tokens por segundo en FP16, pero esto es una estimación genérica, no un dato oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| LumynaX Multimodal LLaVA-Next 34B (este) | 34,75 B | no disponible | Sí (imagen-texto) | Apache 2.0 | Legacy, obsoleto |
| `liuhaotian/llava-v1.6-34b` (modelo fuente) | 34 B | no disponible | Sí (imagen-texto) | Apache 2.0 | Mantenido por la comunidad |
| `liuhaotian/llava-v1.6-7b` | 7 B | no disponible | Sí (imagen-texto) | Apache 2.0 | Activo, más ligero |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre este modelo y su fuente es el wrapper de LumynaX (identidad, runtime y orquestación), pero los pesos son idénticos. Frente a LLaVA-Next de 7B, este modelo ofrece mayor capacidad pero exige mucho más hardware.

## Limitaciones y advertencias

- Estado legacy y obsoleto: la propia model card lo declara "outdated research artifact", no mantenido y no recomendado para producción. Cualquier uso productivo es desaconsejable.
- Sesgos desconocidos: no se han publicado evaluaciones de sesgo. Al estar basado en Yi-34B y LLaVA-Next, puede heredar sesgos de esos modelos, pero no hay datos específicos.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones o respuestas visuales incorrectas o inventadas, especialmente en contextos de baja calidad de imagen o preguntas ambiguas.
- Limitaciones de idioma: solo se declaran inglés y maorí. No se garantiza un buen rendimiento en otros idiomas, incluido el español.
- Limitaciones de contexto: no se especifica la longitud de contexto; se recomienda consultar la documentación de LLaVA-Next original para conocer el límite efectivo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no tiene soporte ni garantías. Además, al ser un artefacto legacy, puede contener vulnerabilidades o comportamientos no deseados.
- Requisitos de hardware elevados: sin cuantizaciones oficiales, la inferencia en FP16 requiere al menos 70 GB de VRAM, lo que excluye la mayoría de GPUs de consumo.

## Enlaces

- [HuggingFace - AbteeXAILab/lumynax-multimodal-llava-next-34b](https://huggingface.co/AbteeXAILab/lumynax-multimodal-llava-next-34b)
- [Repositorio GitHub (espejo del scaffolding)](https://github.com/Aimaghsoodi/lumynax-multimodal-llava-next-34b)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
- [Modelo fuente: liuhaotian/llava-v1.6-34b](https://huggingface.co/liuhaotian/llava-v1.6-34b)
- [Sitio oficial de LLaVA](https://llava-vl.github.io/)
