# OnlyTextLLMs/Qwen3.5-2B-OnlyText

## Resumen

Qwen3.5-2B-OnlyText es un modelo de lenguaje causal derivado de Qwen/Qwen3.5-2B mediante la eliminación de todos los componentes multimodales del modelo original: el vision tower, los pesos del proyector y los tokens especiales multimodales. El resultado es un modelo estrictamente de texto que conserva el backbone textual, la LM head y, de forma destacable, la MTP draft head (cabeza de predicción multi-token) del modelo base. Lo publica el usuario OnlyTextLLMs bajo licencia Apache-2.0.

El modelo cuenta con 1.942.616.384 parámetros (aproximadamente 1,94 B), 24 capas y un tamaño oculto de 2048, con pesos en bfloat16 y un repositorio de 3,9 GB. La arquitectura declarada es Qwen3_5ForCausalLM, implementada en la librería transformers. Es relevante para desarrolladores que necesitan un modelo pequeño, desplegable en hardware de consumo, sin la sobrecarga de memoria y dependencias que implica cargar torres de visión o audio que no van a utilizarse.

Conviene subrayar que este repositorio no añade entrenamiento nuevo: es un proceso de poda de modalidades sobre los pesos del modelo base. Todas las capacidades del modelo proceden del Qwen team, y este repositorio únicamente reduce el alcance a texto. El modelo no tiene descargas ni likes registrados en el momento de la consulta, por lo que carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, clase `Qwen3_5ForCausalLM` |
| Parametros totales | 1.942.616.384 (≈1,94 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Capas | 24 |
| Tamano oculto | 2048 |
| MTP draft head | preservada |
| Modelo base | Qwen/Qwen3.5-2B |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 3,9 GB |
| Fecha de publicacion (metadatos) | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

Se trata de un transformer causal decoder-only de 24 capas y dimensión oculta 2048, perteneciente a la familia Qwen3.5. La intervención realizada consiste en la eliminación quirúrgica de las partes multimodales del modelo base: la torre de visión, los pesos del proyector y los tokens especiales asociados a las modalidades no textuales. Se preservan explícitamente el backbone de texto, la cabeza de lenguaje y la MTP draft head.

No se ha realizado ningún entrenamiento adicional, ajuste fino, RLHF ni DPO en este repositorio: es una conversión estructural de pesos, no un modelo nuevo. En consecuencia, no hay información sobre número de tokens de entrenamiento, composición del dataset ni etapas de alineación propias de este repositorio; esos datos, si existen, corresponderían a la documentación del modelo base Qwen/Qwen3.5-2B, que no se detalla en la información proporcionada.

La innovación técnica más relevante es la conservación de la MTP draft head. Las cabezas de predicción multi-token permiten generar varios tokens por paso hacia delante y se emplean habitualmente como borrador en esquemas de decodificación especulativa, lo que puede reducir la latencia de generación sin sacrificar la distribución del modelo principal. La eliminación de la torre de visión y del proyector reduce el consumo de memoria y simplifica el grafo de cómputo para despliegues exclusivamente textuales.

## Capacidades

- Generación de texto causal y uso conversacional (etiquetas `text-generation` y `conversational` del repositorio).
- Carga directa con `AutoModelForCausalLM` y `AutoTokenizer` de transformers.
- Decodificación especulativa autoinducida mediante la MTP draft head preservada, si el runtime de inferencia la soporta.
- Inferencia estrictamente textual: no procesa imágenes ni audio, ya que esos componentes fueron eliminados.
- Capacidades de razonamiento, código o matemáticas heredadas del modelo base: no verificables con la información disponible, al no publicarse benchmarks ni datos de entrenamiento en este repositorio.
- Tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Inferencia de texto en el borde o en local: con 1,94 B de parámetros en bfloat16 el modelo ocupa alrededor de 3,9 GB de pesos, por lo que puede ejecutarse en una GPU de consumo con 8-12 GB de VRAM, sin la memoria extra que exigirían una torre de visión o un codificador de audio.
- Generación de texto conversacional en inglés: el modelo conserva el backbone y la cabeza de lenguaje del Qwen3.5-2B, por lo que sirve para asistentes de chat y respuestas multi-turno en aplicaciones donde no se requiere multimodalidad.
- Prototipado rápido y experimentación académica: al ser un checkpoint pequeño con licencia Apache-2.0 y pesos safetensors, es adecuado para ciclos de iteración rápidos en investigación sobre prompting, cuantización o decodificación especulativa.
- Aceleración de la decodificación con la MTP draft head: en runtimes que soporten predicción multi-token, la cabeza conservada puede utilizarse para reducir la latencia por token en servicios de generación de texto de alto volumen.
- Componente de pipelines de NLP en producción: clasificación, resumen, reescritura o extracción de información en inglés dentro de flujos de procesamiento por lotes, donde un modelo de 2 B ofrece un coste por token bajo.
- Fine-tuning específico de dominio como punto de partida: al ser un derivado de un modelo base con licencia permisiva, puede servir como inicialización para ajustes supervisados sobre datos propios, sin arrastrar parámetros multimodales innecesarios.
- Evaluación comparativa de poda de modalidades: útil como referencia en estudios sobre cuánto rendimiento textual se conserva al eliminar las torres no textuales de un modelo multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la búsqueda web realizada no ha devuelto documentación técnica, paper ni entrada de blog relacionada con este modelo o con el modelo base Qwen/Qwen3.5-2B.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 3,9 GB (coincide con el tamaño del repositorio). Estimación de VRAM para inferencia: en torno a 5-6 GB considerando pesos y overhead de activaciones y caché KV; el valor exacto depende de la longitud de contexto, que no está documentada.
- Cuantización a 4 bits mediante herramientas externas (por ejemplo, conversión a GGUF con llama.cpp): huella estimada en torno a 1,2-1,5 GB de pesos, lo que permitiría ejecución en GPU con 4 GB de VRAM o incluso en CPU con memoria suficiente.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para bfloat16 sin cuantizar y contextos largos es preferible disponer de 12-16 GB. Las A100 y H100 no son necesarias para un modelo de este tamaño, salvo en despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más en bfloat16, y en tarjetas de 4 GB si se cuantiza.
- Opciones de despliegue: transformers (ruta oficial documentada en la model card); vLLM y TGI son candidatos razonables si su versión soporta la arquitectura `Qwen3_5ForCausalLM`, extremo que no se confirma en la información disponible; llama.cpp y Ollama requieren una conversión previa a GGUF que el repositorio no publica.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodalidad | Notas |
|---|---|---|---|---|---|
| OnlyTextLLMs/Qwen3.5-2B-OnlyText | 1,94 B | no disponible | Apache-2.0 | Solo texto (eliminada) | Derivado sin entrenamiento nuevo; MTP head preservada |
| Qwen/Qwen3.5-2B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 (según el repositorio derivado) | Multimodal (visión y audio) | Modelo base del que procede este derivado |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens (nativo) | Apache-2.0 | Solo texto | Alternativa de tamaño comparable en la familia Qwen, sin multimodalidad |
| Llama-3.2-3B | 3,21 B | 128.000 tokens | Licencia comunitaria de Llama | Solo texto | Mayor tamaño y contexto, pero licencia con restricciones adicionales |
| SmolLM2-1.7B | 1,71 B | 8.192 tokens | Apache-2.0 | Solo texto | Alternativa pequeña y permisiva, contexto más corto |

Los datos de la columna correspondiente a este modelo proceden de la model card; los de los modelos comparados provienen de sus especificaciones públicas conocidas, ya que la búsqueda web realizada no aportó documentación adicional. No se dispone de comparativas de rendimiento (benchmarks) entre estas alternativas dentro de la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa del rendimiento del modelo en tareas de razonamiento, código o matemáticas, ni de la degradación que pueda haber causado la poda de componentes multimodales.
- Cero descargas y cero likes en el momento de la consulta: no existe validación por parte de la comunidad ni informes independientes de uso.
- No se ha realizado entrenamiento adicional: cualquier limitación del modelo base se hereda íntegramente, y las capacidades declaradas no han sido verificadas por el autor del repositorio.
- Idiomas: únicamente inglés según la model card. El rendimiento en castellano u otros idiomas no está documentado y puede ser deficiente.
- Longitud de contexto no documentada: es imprescindible medirla antes de diseñar flujos con conversaciones largas o documentos extensos.
- Compatibilidad de tokenizer: al haberse eliminado los tokens especiales multimodales, debe utilizarse el tokenizer de este repositorio y no el del modelo base; mezclarlos puede producir errores de tokenización o índices fuera de rango.
- Soporte de la MTP draft head: su aprovechamiento depende de que el runtime de inferencia implemente la predicción multi-token; en su defecto, la cabeza permanece como parámetros sin uso.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, especialmente en tareas factuales y sin datos de alineación documentados para este derivado.
- Sesgos: no documentados en la model card; al no haber ajuste propio, se asumen los sesgos presentes en los datos de entrenamiento del modelo base.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución al Qwen team. Este repositorio no añade restricciones adicionales, pero tampoco ofrece garantías.
- Para producción: el modelo es adecuado únicamente tras una evaluación propia, dado que no existen métricas publicadas ni historial de despliegues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OnlyTextLLMs/Qwen3.5-2B-OnlyText
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su modelo base.
