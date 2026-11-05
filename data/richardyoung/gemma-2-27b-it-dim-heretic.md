# richardyoung/gemma-2-27b-it-DiM-heretic

## Resumen

`richardyoung/gemma-2-27b-it-DiM-heretic` es una variante "abliterated" (decensurada) del modelo `google/gemma-2-27b-it`, publicada por el usuario richardyoung. El proceso de abliteration, realizado con la herramienta Heretic v2.0.0, modifica los pesos del modelo original para eliminar la direccion de rechazo aprendida durante el alineamiento, de forma que el modelo deja de negarse a responder a peticiones que el original rechazaria. El resultado es un modelo con la misma arquitectura y capacidades base que Gemma 2 27B IT, pero con un comportamiento de rechazo drasticamente reducido.

El modelo conserva la arquitectura transformer decoder-only de Gemma 2, con 27.227.128.320 parametros totales (no es MoE, por lo que no hay parametros activos separados) y un contexto nativo de 8.192 tokens, ampliable hasta 16.384 mediante sliding window attention en capas alternas. Los pesos se distribuyen en formato safetensors en bfloat16, con un tamano de repositorio de 54,5 GB.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de modificacion de pesos por abliteration con parametros reproducibles y metricas de exito publicadas (89/100 rechazos frente a 100/100 del original); por otro, sirve como referencia para quienes evaluan si un modelo decensurado mantiene la calidad del original o si el proceso introduce degradacion medible (KL divergence de 0,0686 respecto al modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 27.227.128.320 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens nativos; hasta 16.384 con sliding window attention |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos nativos en bfloat16; compatible con cuantizacion estandar de transformers/GGUF por ser arquitectura Gemma 2) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Gemma 2 esta orientado principalmente a ingles) |
| Licencia | Gemma (terminos de uso de Google, con gated access) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 27B, un transformer decoder-only con atencion por ventana deslizante (sliding window attention) en capas alternas, lo que permite manejar contextos efectivos de hasta 16.384 tokens manteniendo coste cuadratico controlado. El modelo base fue entrenado por Google con datos mayoritariamente en ingles y posteriormente sometido a instruction tuning y alineamiento (incluyendo RLHF) para producir la variante IT. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion del dataset.

La innovacion tecnica de esta variante concreta es el proceso de abliteration aplicado con Heretic v2.0.0. Se identifican direcciones de rechazo por capa (`direction_index`: per layer) y se restan de los pesos de proyeccion con pesos diferenciados para `attn.o_proj` (max_weight 1,49 en posicion 39,00; min_weight 0,68 a distancia 25,07) y `mlp.down_proj` (max_weight 0,14 en posicion 39,07; min_weight 0,10 a distancia 23,27). El proceso es reproducible: el autor incluye un directorio `reproduce` con el README y los pasos para regenerar el modelo. No se realizo un reentrenamiento adicional ni fine-tuning; la modificacion es puramente sobre los pesos del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con `tokenizer.apply_chat_template`.
- Razonamiento y respuesta a preguntas, heredado de Gemma 2 27B IT.
- Generacion de codigo y matematicas, con el nivel del modelo base (no se han publicado benchmarks especificos de esta variante).
- Reduccion drastica de rechazos: 89 de cada 100 peticiones que el modelo original rechazaria son atendidas por esta variante (segun la metrica del autor).
- Capacidad de seguir instrucciones del sistema y del usuario, aunque el alineamiento de seguridad ha sido parcialmente neutralizado.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion proporcionada.
- No se documenta soporte de agentes multi-paso ni modo "thinking" en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base esta orientado a ingles).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar empiricamente como la abliteration afecta a la tasa de rechazos y a la divergencia KL respecto al original, con parametros reproducibles y metricas publicadas (89/100 rechazos, KL 0,0686).
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera contenido adulto o temas sensibles que el modelo base rechazaria, en entornos controlados y con supervision humana.
- Evaluacion de robustez de filtros: usar el modelo como contraste para medir la eficacia de clasificadores de contenido o guardrails en pipelines de moderacion.
- Red teaming interno: generacion de prompts adversarios y respuestas que un modelo alineado bloquearia, para probar sistemas de defensa antes de desplegarlos.
- Analisis de sesgos y degradacion: comparar respuestas del modelo abliterated frente al original para cuantificar que capacidades se degradan con la modificacion de pesos (KL divergence como proxy).
- Despliegue local en investigacion: al conservar el formato safetensors y la arquitectura Gemma 2, puede servirse con transformers, vLLM o TGI en infraestructura propia, sin dependencia de APIs externas.
- Estudio de reproducibilidad: el directorio `reproduce` permite replicar el proceso de abliteration con Heretic v2.0.0 y verificar los parametros publicados.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-2-27b-it) |
|---|---|---|
| Rechazos (Refusals) | 89/100 | 100/100 |
| Divergencia KL | 0,0686 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante. Las unicas metricas publicadas son las de rechazo y divergencia KL que aparecen en la model card.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 54,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan 60-70 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 27-30 GB, viable en una RTX 4090 (24 GB) solo con cuantizacion de 4 bits o con offloading parcial.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 14-16 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16 GB o mas.
- GPU recomendadas: A100 80 GB, H100 80 GB o multiples GPUs para bfloat16 sin cuantizar; RTX 4090/3090 para cuantizacion 4-bit.
- Despliegue: transformers (soporte nativo, con `device_map="auto"` y `accelerate`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp por compatibilidad con la arquitectura Gemma 2 (no confirmado en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/gemma-2-27b-it-DiM-heretic | 27,2 B | 8.192 (16.384 con SWA) | 89/100 | Gemma | HuggingFace |
| google/gemma-2-27b-it | 27,2 B | 8.192 (16.384 con SWA) | 100/100 | Gemma | HuggingFace (gated) |
| Otras variantes abliterated de Gemma 2 27B | 27,2 B | 8.192 (16.384 con SWA) | No disponible | Gemma | HuggingFace (segun autor) |
| Modelos decensurados de tamano similar (p. ej., variantes de Llama 3 70B abliterated) | ~70 B | 8.192 | No disponible | Llama | HuggingFace (segun autor) |

La comparativa se limita al modelo base por falta de datos publicados de benchmarks y de metricas de rechazo de otras variantes abliterated en la informacion proporcionada. No se dispone de comparaciones de rendimiento estandar (MMLU, HumanEval) para ninguna de las variantes.

## Limitaciones y advertencias

- El proceso de abliteration elimina parcialmente el alineamiento de seguridad: el modelo puede generar contenido que el original rechazaria, incluyendo material sensible, y no debe desplegarse en produccion orientada a usuarios finales sin guardrails adicionales.
- La divergencia KL de 0,0686 respecto al original indica una degradacion medible de la distribucion de salida; no se han publicado evaluaciones que cuantifiquen cuanto afecta esto a tareas de razonamiento o codigo.
- Riesgo de alucinacion: heredado del modelo base, sin que se haya documentado una evaluacion especifica para esta variante.
- Sesgos conocidos: no documentados especificamente para esta variante; los del modelo base Gemma 2 (principalmente orientado a ingles y entrenado con datos web) se mantienen y pueden amplificarse al eliminar el filtro de rechazo.
- Limitaciones de idioma: el modelo base esta orientado principalmente al ingles; no se documenta soporte multilingue en la informacion proporcionada.
- Restricciones de licencia: la licencia Gemma de Google impone terminos de uso, incluyendo restricciones de uso comercial y obligaciones de atribucion; el acceso esta sujeto a gated access en HuggingFace. La modificacion de pesos no exime del cumplimiento de la licencia original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-05; no hay evidencia de validacion por parte de la comunidad.
- La fecha de creacion del repositorio (2026) es posterior a la publicacion de Gemma 2 (2024), lo que sugiere una modificacion reciente sin historial de uso documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/gemma-2-27b-it-DiM-heretic
- Modelo base: https://huggingface.co/google/gemma-2-27b-it
- Heretic (herramienta de abliteration): https://heretic-project.org
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio del modelo
- Pagina del modelo Gemma: https://ai.google.dev/gemma/docs
- Responsible Generative AI Toolkit: [rai-toolkit] (referenciado en la model card, sin URL completa en la informacion proporcionada)
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma
- Terminos de uso de Gemma: https://www.kaggle.com/models/google/gemma/license/consent/verify/huggingface?returnModelRepoId=google/gemma-2-27b-it
- local-gemma (CLI): https://github.com/huggingface/local-gemma
