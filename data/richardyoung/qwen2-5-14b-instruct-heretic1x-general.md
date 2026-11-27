# richardyoung/Qwen2.5-14B-Instruct-heretic1x-general

## Resumen

Qwen2.5-14B-Instruct-heretic1x-general es un ajuste fino del modelo Qwen2.5-14B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. La modificacion se enmarca en la tecnica conocida como "abliteration" o "decensoring", cuyo objetivo es eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad del modelo original para que responda a solicitudes que el modelo base tenderia a declinar. El sufijo "heretic1x" hace referencia a la familia de herramientas y metodologias de "heretizacion" empleadas para este tipo de intervenciones sobre los pesos.

El modelo conserva la arquitectura del Qwen2.5-14B-Instruct original: un transformer denso de aproximadamente 14.770 millones de parametros, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). Al tratarse de un finetune del modelo Instruct, hereda sus capacidades conversacionales, de generacion de codigo y de razonamiento, pero con el filtro de seguridad alterado.

Su relevancia es fundamentalmente de investigacion: permite estudiar el comportamiento de modelos sin alineacion, evaluar riesgos de seguridad, analizar sesgos residuales y realizar experimentos de interpretabilidad sobre los mecanismos de rechazo. No es un modelo recomendado para despliegues de produccion orientados al publico general. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos (familia Qwen2.5; no confirmado para este finetune) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, aptos para cuantizacion posterior a GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (segun la model card); el modelo base Qwen2.5 soporta multiples idiomas |
| Licencia | Apache 2.0 (etiqueta del repo); acceso restringido en Hugging Face |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 29,6 GB |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Biblioteca | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings de posicion rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con un corpus de hasta 18 billones de tokens segun la documentacion publica de Qwen2.5, seguido de un proceso de ajuste supervisado y optimizacion por preferencias (RLHF/DPO) para alinearlo como asistente.

La intervencion "heretic1x" consiste en una modificacion de los pesos orientada a suprimir la direccion de rechazo en el espacio de activaciones, una tecnica de abliteration que identifica y resta la componente asociada al comportamiento de negativa de seguridad. No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de ajuste, la composicion del dataset ni si se aplico un post-entrenamiento adicional tras la ablacion. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia decensura.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct original.
- Razonamiento y resolucion de problemas de matematicas y logica de nivel medio-alto.
- Generacion y comprension de codigo en multiples lenguajes de programacion.
- Respuesta a solicitudes que el modelo base rechazaria por sus filtros de seguridad (objetivo declarado del finetune).
- Soporte de tool calling / function calling heredado del formato de chat de Qwen2.5 (no verificado especificamente en este finetune).
- Capacidad multilingue del modelo base (aunque la model card solo declara ingles).
- Formato de chat compatible con text-generation-inference y endpoints compatibles.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en este finetune.

## Casos de uso

- Investigacion sobre seguridad y alineacion: analizar como se comporta un modelo sin filtros de rechazo, comparar sus respuestas con las del modelo base y estudiar la robustez de los mecanismos de seguridad. Es el uso principal declarado por la etiqueta "research".
- Experimentos de interpretabilidad: estudiar la direccion de rechazo en el espacio de activaciones y validar tecnicas de abliteration sobre un modelo de 14B parametros.
- Red teaming controlado: generar respuestas adversarias en entornos aislados para evaluar clasificadores de contenido y sistemas de moderacion.
- Evaluacion de sesgos: medir sesgos residuales y comportamientos no deseados que la alineacion del modelo base mitigaba parcialmente.
- Generacion creativa sin restricciones de tono: escritura de ficcion con tematicas adultas o sensibles en contextos editoriales controlados, donde el modelo base declinaria la tarea.
- Fine-tuning posterior para dominios especializados: servir como punto de partida para ajustes que requieran un modelo menos restrictivo, siempre en entornos de investigacion y con supervision humana.
- Comparativas de rendimiento: evaluar si la ablacion degrada capacidades generales (razonamiento, codigo) respecto al Qwen2.5-14B-Instruct original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas comparativas con el modelo base ni con alternativas, por lo que no es posible cuantificar el impacto de la ablacion sobre MMLU, HumanEval, GSM8K u otras metricas.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 29,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 32-40 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 15-16 GB, viable en una RTX 4090 (24 GB).
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M / AWQ / GPTQ): alrededor de 9-10 GB, viable en GPUs consumer de 12 GB o superiores (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S; para cuantizacion: RTX 4090, RTX 4080, RTX 3090.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama tras conversion a GGUF, y servidores compatibles con la API de OpenAI (el repo esta etiquetado como endpoints_compatible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineacion | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-heretic1x-general | 14,77 B | 32.768 (familia Qwen2.5) | Abliterado / decensurado | Apache 2.0 (repo gated) | Restringido |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 (extensible a 131.072) | Alineado (RLHF/DPO) | Apache 2.0 | Abierto |
| Qwen/Qwen2.5-14B | 14,77 B | 32.768 (extensible a 131.072) | Base, sin ajuste instruct | Apache 2.0 | Abierto |
| Modelos abliterados de la comunidad (p. ej. variantes "heretic" de otros tamanos) | Variable | Variable | Abliterado | Variable | Variable |

La comparativa directa mas relevante es con el modelo base Qwen2.5-14B-Instruct: misma arquitectura y numero de parametros, pero con el filtro de seguridad alterado. No se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente modificado para reducir sus mecanismos de rechazo; puede generar contenido ofensivo, peligroso, ilegal o sexualmente explicito sin las salvaguardas del modelo original.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, agravado por la perdida potencial de capacidades tras la ablacion (no cuantificada).
- La model card solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y puede degradarse respecto al modelo base.
- La ablacion puede degradar capacidades generales de razonamiento y codigo; no hay benchmarks que lo confirmen o descarten.
- El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- La licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el uso en produccion orientado al publico general conlleva riesgos legales y reputacionales por la ausencia de filtros de seguridad; se recomienda moderacion externa obligatoria.
- No apto para despliegues sin supervision humana ni para entornos donde se requiera cumplimiento de politicas de contenido.
- Solo 747 descargas y 0 likes en el momento de la consulta: comunidad pequena, sin validacion externa significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
