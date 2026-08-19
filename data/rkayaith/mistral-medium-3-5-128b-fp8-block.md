# rkayaith/Mistral-Medium-3.5-128B-fp8-block

## Resumen

Mistral-Medium-3.5-128B-fp8-block es una variante cuantizada en FP8 con escalado por bloques del modelo Mistral Medium 3.5 128B, desarrollada por el usuario rkayaith a partir de los pesos publicados por Mistral AI. El modelo base es un transformador denso de 128 000 millones de parámetros, multimodal (visión y lenguaje), optimizado para tareas de agente y generación de código, y distribuido bajo una licencia MIT modificada. Esta derivada no añade entrenamiento adicional: toma los pesos estáticos FP8 del modelo original, los dequantiza y los vuelve a cuantizar con un esquema dinámico de bloques FP8 E4M3, con bloques de peso de 128×128 y grupos de activación de 128 elementos.

La relevancia de esta versión radica en su formato `compressed-tensors`, que permite aceleración FP8 por bloques en hardware compatible, como las GPU AMD MI350X (CDNA4) validadas por el autor, y en su compatibilidad con backends de inferencia como vLLM. Al omitir la torre de visión y el proyector multimodal en la cuantización, se ofrece como un modelo de solo lenguaje (language-only) para despliegues eficientes, manteniendo la capacidad de razonamiento y generación del modelo original. Con 127 704 210 176 parámetros y un tamaño de repositorio de 133,6 GB, es una opción práctica para entornos de producción que requieran FP8 por bloques.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Mistral Medium 3.5 128B) |
| Parametros totales | 127.704.210.176 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo, pero no se especifica en la ficha) |
| Tipos de cuantizacion | FP8 E4M3 con escalado por bloques (pesos estáticos por bloque 128×128, activaciones dinámicas por grupos de 128) |
| Idiomas soportados | No disponible (el modelo base de Mistral es multilingüe, pero esta variante no declara lista) |
| Licencia | Modified MIT (derivado de la licencia del modelo base) |
| Formato de pesos | Safetensors (formato `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo original Mistral Medium 3.5 128B es un transformador denso de 128 000 millones de parámetros con 88 capas de decodificador, diseñado por Mistral AI como un modelo multimodal que unifica capacidades de instrucción, razonamiento y generación de código. La arquitectura incluye una torre de visión y un proyector multimodal, aunque la cuantización aquí descrita los excluye explícitamente, manteniendo únicamente el cuerpo de lenguaje (88 capas `Ministral3DecoderLayer`). El proceso de cuantización, realizado con LLM Compressor, consistió en dequantizar los pesos lineales FP8 estáticos publicados por Mistral y aplicar una receta de FP8 por bloques: pesos cuantizados estáticamente en bloques de 128×128 y activaciones cuantizadas dinámicamente en grupos de 128 elementos. Se cuantizaron 616 pesos lineales correspondientes a todas las proyecciones de atención y feed-forward de las 88 capas, omitiendo `lm_head`, la torre de visión y el proyector. No se realizó ningún fine-tuning ni entrenamiento adicional.

## Capacidades

- Generación de texto y razonamiento complejo: al heredar las capacidades del modelo base, puede realizar tareas de instrucción, razonamiento multi-paso y resolución de problemas.
- Generación de código: el modelo base está optimizado para tareas de programación, incluyendo generación, revisión y refactorización de código.
- Soporte de tool calling y function calling: el modelo base incluye soporte para invocación de herramientas, útil para integraciones con APIs y agentes.
- Capacidades de agente: diseñado para flujos de trabajo agénticos, con razonamiento iterativo y uso de herramientas externas.
- Multilingüe: aunque esta variante no declara idiomas específicos, el modelo base de Mistral soporta múltiples idiomas; se recomienda verificar la documentación oficial.
- Solo lenguaje: esta cuantización no incluye la torre de visión, por lo que no procesa imágenes; se usa con `language_model_only=True` en vLLM.

## Casos de uso

- Despliegue de asistentes conversacionales a gran escala: gracias a su formato FP8 por bloques y compatibilidad con vLLM, puede servir chatbots con baja latencia en hardware de datacenter como AMD MI350X, gestionando conversaciones multi-turno con contexto amplio.
- Agentes autónomos con tool calling: el soporte de function calling permite construir agentes que consultan APIs, bases de datos o ejecutan acciones, ideal para automatización de procesos empresariales.
- Generación de código en pipelines CI/CD: el modelo puede integrarse en flujos de desarrollo para generar documentación, tests unitarios o sugerencias de implementación, reduciendo el tiempo de desarrollo.
- Razonamiento y análisis de documentos técnicos: su capacidad de razonamiento permite resumir, extraer conclusiones y responder preguntas sobre documentación extensa, útil en entornos legales o técnicos.
- Chatbots de atención al cliente especializados: con ajuste fino adicional (aunque esta variante no lo incluye), puede adaptarse a dominios concretos para resolver incidencias con lenguaje natural.
- Inferencia en entornos con restricciones de memoria: al omitir la torre de visión, esta versión es más ligera que el modelo multimodal completo, permitiendo servir solo texto en GPUs con VRAM ajustada (siempre que se disponga de suficiente memoria para 128 GB de pesos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni comparaciones con otras variantes. Se recomienda consultar la documentación del modelo base para conocer su rendimiento en tareas estándar.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 128 GB (127,7 GB de parámetros en FP8), más overhead de activaciones y KV cache. Se necesitan al menos 140-160 GB de VRAM para inferencia en una sola GPU o distribución en varias.
- GPU recomendadas: AMD MI350X (CDNA4, gfx950) validada por el autor con ROCm 7.2.3; también puede ejecutarse en GPUs NVIDIA con soporte FP8 por bloques (por ejemplo, H100, H200, A100 con cuantización FP8), aunque no se ha validado oficialmente.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por su tamaño; se requieren GPUs de datacenter o clústeres multi-GPU.
- Opciones de despliegue: vLLM con soporte de FP8 por bloques (recomendado), TGI si añade soporte, y cualquier backend compatible con `compressed-tensors`.
- Latencia y throughput: no disponibles; dependen del hardware y la configuración. En MI350X se espera un rendimiento optimizado gracias a la aceleración FP8 por bloques.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Medium-3.5-128B (estático FP8) | 128B | No disponible | FP8 E4M3 estático | Modified MIT | HuggingFace oficial |
| rkayaith/Mistral-Medium-3.5-128B-fp8-block | 128B | No disponible | FP8 E4M3 por bloques (dinámico) | Modified MIT | HuggingFace (este repo) |
| rkayaith/Mistral-Medium-3.5-128B-mxfp8 | 128B | No disponible | MXFP8 (grupos de 32) | Modified MIT | HuggingFace |
| RecViking/Mistral-Medium-3.5-128B-NVFP4 | 128B | No disponible | NVFP4 (W4A4) | Modified MIT | HuggingFace |

La principal diferencia entre las variantes es el esquema de cuantización: la estática FP8 del modelo base, la dinámica por bloques de este repo, la MXFP8 con grupos más pequeños y la NVFP4 para GPUs Blackwell. Todas mantienen la misma arquitectura y licencia, pero el rendimiento y la compatibilidad de hardware varían.

## Limitaciones y advertencias

- Solo lenguaje: al omitir la torre de visión y el proyector, no procesa imágenes; cualquier tarea multimodal requiere el modelo base sin cuantizar o una variante que incluya esas partes.
- Sesgos y alucinaciones: no se han evaluado específicamente en esta variante; el modelo base puede presentar sesgos y generar contenido falso, por lo que se recomienda validación humana en aplicaciones críticas.
- Contexto y idiomas: no se especifican la longitud de contexto ni los idiomas soportados en esta ficha; consultar la documentación oficial de Mistral para el modelo base.
- Compatibilidad de hardware: solo se ha validado en AMD MI350X con ROCm 7.2.3; otras configuraciones pueden no funcionar correctamente con el formato FP8 por bloques.
- Licencia: aunque es MIT modificado, se deben revisar los términos exactos de la licencia del modelo base para usos comerciales y redistribución.
- Riesgo de degradación: la cuantización FP8 puede introducir pérdidas de precisión frente al modelo en BF16, aunque no se han publicado métricas de evaluación.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/rkayaith/Mistral-Medium-3.5-128B-fp8-block
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
- Documentación oficial de Mistral Medium 3.5: https://docs.mistral.ai/models/mistral-medium-3-5-26-04
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/mistralai/Mistral-Medium-3.5-128B
- Variante MXFP8 del mismo autor: https://huggingface.co/rkayaith/Mistral-Medium-3.5-128B-mxfp8
- Variante NVFP4 de RecViking: https://huggingface.co/RecViking/Mistral-Medium-3.5-128B-NVFP4
- Licencia del modelo base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/blob/main/LICENSE
