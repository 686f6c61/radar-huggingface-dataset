# M1ztyk/SAIGE-dpo-v3-run3

## Resumen

SAIGE-dpo-v3-run3 es un ajuste fino por DPO (Direct Preference Optimization) del modelo Qwen/Qwen2.5-3B-Instruct, publicado por el usuario M1ztyk en HuggingFace. Se trata, por tanto, de un derivado de un transformer decoder-only de aproximadamente 3.000 millones de parametros, alineado mediante preferencias en lugar de mediante RLHF con modelo de recompensa explicito. El entrenamiento se ha realizado con la libreria TRL (version 1.13.0) y el repositorio declara compatibilidad con endpoints de inferencia (`endpoints_compatible`) y pesos en formato safetensors.

El interes de esta ficha es limitado pero relevante como caso de estudio: se trata de un modelo sin descargas ni valoraciones en el momento de la consulta, sin model card detallada (la seccion de procedimiento de entrenamiento esta vacia) y sin resultados de benchmarks publicados. El nombre "run3" sugiere que forma parte de una serie de experimentos de alineacion dentro de un proyecto denominado SAIGE, no de un lanzamiento de produccion.

Por su tamano, el modelo es desplegable en GPU de consumo (a partir de 8-12 GB de VRAM en cuantizacion de 4-8 bits) y hereda del modelo base las capacidades generales de la familia Qwen2.5: generacion de texto, codigo, matematicas basicas, soporte de tool calling y contexto largo. No obstante, al no existir evaluacion publicada, cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), afinado con DPO |
| Parametros totales | no disponible en la model card; el modelo base Qwen2.5-3B-Instruct declara ~3 B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens segun su documentacion publica |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se han publicado variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 declara soporte multilingue segun su documentacion publica |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin concretar); el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License |
| Formato de pesos | safetensors (carga via `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-3B-Instruct: un transformer decoder-only con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU, preentrenado y posteriormente instruido por el equipo de Qwen. Sobre ese checkpoint, el autor aplica un ajuste fino con DPO, la tecnica descrita en el articulo "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., NeurIPS 2023), que optimiza directamente el modelo de politica sobre pares de respuestas preferidas y rechazadas sin entrenar un modelo de recompensa separado ni usar RL con PPO. El tag `arxiv:2305.18290` del repositorio confirma explicitamente este metodo.

La model card no documenta ningun detalle relevante del entrenamiento: no indica el dataset de preferencias utilizado, el numero de pares, la tasa de aprendizaje, el valor de beta, el numero de epocas ni si hubo una fase previa de SFT. La seccion "Training procedure" aparece practicamente vacia. Las unicas versiones de software declaradas son TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruido.
- Razonamiento basico y respuesta a instrucciones en formato chat (la model card muestra un ejemplo de uso con `pipeline("text-generation")` y una lista de mensajes con rol `user`).
- Generacion de codigo y asistencia de programacion, capacidad presente en el modelo base Qwen2.5-3B-Instruct.
- Matematicas elementales y razonamiento aritmetico de complejidad baja o media, tambien heredados del base.
- Soporte de tool calling / function calling segun el formato del modelo base; no se documenta si el ajuste DPO lo preserva o degrada.
- Capacidades multilingues heredadas del base, sin lista de idiomas confirmada en esta ficha.
- Alineacion por preferencias: se espera un estilo de respuesta mas ajustado al dataset de preferencias usado, aunque dicho dataset no se describe.
- No se documenta soporte de vision, audio, modo thinking explicito, ni decodificacion especulativa.

## Casos de uso

- Experimentacion academica con DPO: el modelo sirve como punto de partida reproducible para comparar recetas de alineacion sobre un mismo base (Qwen2.5-3B-Instruct) y medir el efecto de distintos datasets de preferencias.
- Prototipado de asistentes conversacionales: con ~3 B de parametros y pesos safetensors, se puede levantar un chatbot de prueba en una GPU de consumo usando `transformers` o vLLM para validar flujos de producto antes de escalar a modelos mayores.
- Evaluacion de alineacion y estilo: util para estudiar si el DPO ha modificado la verbosidad, la tasa de rechazos o el tono respecto al base, mediante comparacion A/B de respuestas sobre un mismo conjunto de prompts.
- Generacion de codigo en entornos de bajo presupuesto: para autocompletado o explicacion de fragmentos en un IDE local, siempre que se valide previamente la perdida de calidad respecto al base instruido.
- Clasificacion y extraccion de informacion en pipelines offline: el modelo puede etiquetar texto, resumir o extraer campos estructurados en lotes nocturnos sin coste de API, a costa de menor precision que modelos mayores.
- Docencia y formacion: ilustrar en un aula como se comporta un modelo de 3 B alineado con DPO frente a su version instruida original, con una diferencia de tamano de repositorio de apenas 0,1 GB.
- Base para posteriores ajustes: al ser un derivado directo de Qwen2.5-3B-Instruct con licencia sin concretar, puede servir como semilla para LoRA o nuevos ciclos de DPO, previa verificacion de los terminos de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el autor no reporta evaluacion alguna. Tampoco existen tablas comparativas frente al modelo base. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia.

## Requisitos de hardware

- Peso en precision completa (bf16/fp16): aproximadamente 6,0-6,2 GB solo de parametros, mas cache KV.
- VRAM estimada para inferencia: ~7-8 GB en bf16 con contexto moderado; ~4 GB en cuantizacion de 8 bits; ~2,5-3 GB en cuantizacion de 4 bits (estimaciones teoricas a partir del tamano de 3 B; no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, L40S, A100, H100). En GPUs con 6 GB o menos sera necesario cuantizar.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB y superiores con margen amplio; en tarjetas de 8 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` (via `pipeline` o `AutoModelForCausalLM`), vLLM y TGI para servido con batching, y llama.cpp/Ollama solo si el usuario convierte los pesos a GGUF por su cuenta, ya que el repositorio unicamente publica safetensors. El tag `endpoints_compatible` indica que puede desplegarse en HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota de integridad: el repositorio declara un tamano de 0,1 GB, muy inferior a los ~6 GB esperables para un modelo de 3 B en bf16. Esto sugiere que los pesos podrian estar incompletos, que se trate de un adaptador o que el tamano reportado por HuggingFace no refleje el contenido real. Conviene verificar los ficheros antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAIGE-dpo-v3-run3 | ~3 B (heredados del base) | no disponible (base: 32.768 tokens) | no disponible | no disponible | Repositorio publico, 0 descargas y 0 likes; 0,1 GB |
| Qwen2.5-3B-Instruct | ~3 B | 32.768 tokens | Publicado por Qwen en su model card | Qwen Research License | Ampliamente distribuido, con variantes GGUF/AWQ/GPTQ de terceros |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Publicado por Meta en su model card | Llama 3.2 Community License | Ampliamente distribuido, con cuantizaciones oficiales |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens | Publicado por Microsoft en su model card | MIT | Ampliamente distribuido, con cuantizaciones de terceros |

Las cifras de contexto y licencia de los modelos comparados proceden de la documentacion publica de sus respectivos desarrolladores. Para este modelo ajustado no existe ninguna medicion comparable, por lo que la comparativa se limita a atributos estructurales.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con el modelo base, por lo que se desconoce si el DPO ha mejorado o degradado la calidad respecto a Qwen2.5-3B-Instruct.
- Dataset de preferencias no documentado: se desconoce la composicion, el tamano y el idioma de los pares usados, lo que impide anticipar sesgos introducidos por el ajuste.
- Riesgo de alineacion excesiva o "alignment tax": el DPO puede reducir la diversidad de respuestas, aumentar la verbosidad o degradar capacidades como el tool calling y el razonamiento matematico.
- Riesgo de alucinacion: inherente a los modelos de ~3 B, con mayor probabilidad de fabricar hechos, citas o APIs inexistentes que modelos de mayor tamano.
- Licencia sin concretar: la model card indica `licence: license` sin especificar terminos. El modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, orientada a uso de investigacion, por lo que el uso comercial de este derivado es dudoso y requiere consulta legal.
- Idiomas no confirmados: aunque el base es multilingue, el ajuste DPO puede haber estrechado el comportamiento hacia un idioma dominante no declarado.
- Repositorio practicamente sin uso: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y nulo soporte ante errores.
- Tamano de repositorio anomalo (0,1 GB): riesgo de pesos incompletos o de que el artefacto publicado no sea un modelo de 3 B completo.
- Fecha de creacion registrada como 2026-09-13, posterior a la fecha habitual de trabajo, lo que sugiere un posible error de metadatos y refuerza la necesidad de verificar el contenido del repositorio.
- No apto para produccion sin evaluacion previa: es un artefacto experimental ("run3") sin garantias de estabilidad, soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/M1ztyk/SAIGE-dpo-v3-run3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Articulo de DPO: https://huggingface.co/papers/2305.18290
- Articulo de DPO en NeurIPS 2023: http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
- Repositorio de TRL: https://github.com/huggingface/trl
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los incluidos en la propia model card.
