# M1ztyk/SAIGE-dpo-v3-1-run3

## Resumen

SAIGE-dpo-v3-1-run3 es un adaptador LoRA de ajuste por preferencias (DPO) publicado por el usuario M1ztyk sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Se distribuye a través de HuggingFace con la librería PEFT y pesos en safetensors, con un tamaño de repositorio de 0,4 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo fusionado completo. El identificador sugiere la tercera iteración de una serie de experimentos de alineación ("dpo-v3") y una tercera ejecución de entrenamiento ("run3"), pero no hay documentación que lo confirme.

El interés de esta ficha es limitado y conviene decirlo con claridad: la model card publicada es la plantilla por defecto de HuggingFace sin rellenar, con todos los campos marcados como "[More Information Needed]". No se documentan datos de entrenamiento, hiperparámetros, dataset de preferencias, licencia ni idiomas. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación alguna por parte de la comunidad.

En la práctica, cualquier evaluación del modelo debe apoyarse en las características conocidas y públicas del modelo base Qwen2.5-3B-Instruct (transformer decoder-only de 3.090 millones de parámetros, 32.768 tokens de contexto nativo, licencia Apache 2.0, 29 idiomas), asumiendo que el adaptador DPO modifica el comportamiento conversacional pero sin poder cuantificar en qué dirección ni con qué magnitud. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con GQA, SwiGLU, RoPE y RMSNorm; adaptador LoRA/PEFT sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.090 millones en el modelo base; el adaptador añade un numero no especificado (repo de 0,4 GB, compatible con rango bajo en fp32/fp16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base; ampliable a 131.072 con YaRN. El adaptador no modifica la ventana de contexto |
| Tipos de cuantizacion | No especificados por el autor. Al ser un adaptador PEFT, puede fusionarse con el base y cuantizarse a GGUF, AWQ o GPTQ con herramientas estandar |
| Idiomas soportados | No disponible. El modelo base Qwen2.5-3B-Instruct declara 29 idiomas, incluido el espanol |
| Licencia | No disponible (el modelo base es Apache 2.0, pero el adaptador no declara terminos propios) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), etiquetado como libreria peft |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de ajuste | DPO (Direct Preference Optimization) con LoRA, segun las etiquetas del repositorio (dpo, lora, trl) |
| Version de PEFT declarada | 0.20.0 |
| Tarea (pipeline) | text-generation / conversational |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA) entrenado con DPO sobre Qwen2.5-3B-Instruct, segun las etiquetas del repositorio (`dpo`, `lora`, `trl`, `peft`). El modelo base es un transformer decoder-only de la familia Qwen2.5 con 3.090 millones de parametros, atencion de consultas agrupadas (GQA), activacion SwiGLU, embeddings rotatorios (RoPE) y normalizacion RMSNorm. El pipeline de text-generation y la etiqueta conversational indican que el ajuste se orienta a respuestas de chat.

No hay ningun dato publicado sobre el procedimiento de entrenamiento: se desconoce el dataset de preferencias (el nombre "SAIGE" podria referirse a un dataset o a un pipeline interno del autor, pero no hay evidencia que lo confirme), el numero de pares de preferencia, el rango y alpha del LoRA, la tasa de aprendizaje, el numero de epocas, el hardware empleado ni la funcion de perdida exacta (DPO estandar frente a variantes como IPO, KTO o cDPO). Tampoco se declara si hubo una fase previa de SFT. La plantilla de model card menciona el articulo de Lacoste et al. (arXiv:1910.09700) sobre el calculo de impacto ambiental, pero es el texto por defecto de la plantilla y no implica que se haya realizado dicho calculo.

En consecuencia, no es posible verificar ninguna innovacion tecnica ni reproducir el entrenamiento. La unica innovacion esperable es la propia del metodo DPO sobre un modelo pequeno con LoRA, algo ya estandar en el ecosistema TRL.

## Capacidades

Las capacidades listadas a continuacion corresponden al modelo base Qwen2.5-3B-Instruct, ya que el adaptador no documenta cambios funcionales. El efecto real del DPO sobre ellas es desconocido.

- Generacion de texto conversacional multi-turno con ventanas de hasta 32.768 tokens.
- Razonamiento basico y resolución de problemas de complejidad media, limitado por el tamano de 3B parametros.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, Java, C++), con calidad inferior a modelos de 7B o superiores.
- Matematicas de nivel escolar y primeros cursos universitarios, con alta sensibilidad al formato del prompt.
- Salidas estructuradas: el modelo base esta entrenado para producir JSON valido de forma fiable.
- Tool calling / function calling: el modelo base documenta soporte de llamadas a funciones, aunque la fiabilidad en 3B es limitada y no hay validacion especifica para este adaptador.
- Capacidades multilingues: el base cubre 29 idiomas, con rendimiento desigual fuera del ingles y el chino.
- Flujos de agente de varios pasos: tecnicamente posibles mediante tool calling, pero sin garantia de robustez a esta escala.
- Capacidades especiales: no se documenta modo "thinking", vision ni audio. El base es exclusivamente texto.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ocupar menos de 2 GB en cuantizacion de 4 bits, permite iterar sobre el diseno de prompts y flujos de dialogo en un portatil o en una GPU de gama media antes de migrar a un modelo mayor.
- Ajuste adicional y experimentacion academica: sirve como punto de partida para estudiar el efecto de DPO sobre un modelo de 3B, comparando este adaptador con el base sin ajustar y con otras ejecuciones de la misma serie.
- Clasificacion y extraccion de informacion con salida JSON: el base genera JSON fiable, por lo que el adaptador puede emplearse en pipelines de extraccion de entidades o enrutado de tickets, siempre con validacion del esquema en el lado del servidor.
- Generacion de respuestas en aplicaciones de nicho con GPU unica: despliegue en una RTX 3060 de 12 GB o similar para tareas de resumen, reescritura o generacion de borradores en herramientas internas.
- Educacion y tutoria automatizada: conversaciones de refuerzo sobre contenidos de nivel medio, con la advertencia de que a 3B el riesgo de explicaciones erroneas es apreciable y requiere revision humana.
- Investigacion sobre alineacion y sesgos: analisis de como un ajuste DPO no documentado altera la tonalidad, la verbosidad o la tasa de rechazos respecto al modelo base.
- Inferencia en el borde o en CPU: combinado con llama.cpp u Ollama tras fusionar el adaptador, puede ejecutarse sin GPU en entornos con recursos muy limitados para tareas de baja criticidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existe ninguna evaluacion en la model card, ni en las etiquetas, ni en los resultados de busqueda web. Tampoco hay comparaciones con el modelo base que permitan medir el efecto del DPO sobre MMLU, HumanEval, GSM8K u otras pruebas. Cualquier cifra que se atribuya a este adaptador seria inventada.

## Requisitos de hardware

- VRAM para el modelo base en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos (3,09B x 2 bytes), mas la cache KV, lo que situa el consumo practico en torno a 8-10 GB con contexto largo.
- VRAM en cuantizacion de 8 bits: alrededor de 3,5 GB de pesos.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 2 GB de pesos, con un total de 3-4 GB incluyendo contexto moderado.
- El adaptador LoRA en si ocupa cientos de MB (repo de 0,4 GB) y puede fusionarse en los pesos base, de modo que en inferencia no anade overhead apreciable.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores para fp16; A100 o H100 no son necesarias y estarian infrautilizadas.
- Cabe holgadamente en GPU de consumo. En 4 bits funciona en GPUs de 6-8 GB (GTX 1660, RTX 2060, RTX 3050); en 8 bits requiere al menos 6 GB; en fp16 conviene disponer de 10 GB o mas.
- Opciones de despliegue: transformers + peft (con `merge_and_unload`), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp y Ollama (requiere fusionar el adaptador y convertir a GGUF), LM Studio y servidores OpenAI-compatibles basados en estas librerias.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador ni para su proceso de entrenamiento, y no se especifica el hardware utilizado.

## Comparativa con modelos similares

La comparativa se establece contra el modelo base y contra alternativas de tamano equivalente. Los datos del adaptador (rendimiento, licencia, contexto tras el ajuste) no estan disponibles, por lo que las columnas correspondientes reflejan solo el modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAIGE-dpo-v3-1-run3 (este adaptador) | No disponible (base de 3,09B) | No disponible (base: 32.768 tokens) | No disponible | Repositorio publico, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Muy extendida, ecosistema amplio |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Muy extendida, requiere aceptar terminos |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Extendida |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Extendida, con restricciones de uso |

En rendimiento no se puede comparar: no hay ningun benchmark publicado para este adaptador. A igualdad de parametros, el modelo base Qwen2.5-3B-Instruct suele situarse en el grupo de cabeza de su categoria, pero el efecto neto del ajuste DPO de este repositorio es una incognita.

## Limitaciones y advertencias

- Model card vacia: no se documentan datos de entrenamiento, hiperparametros, dataset de preferencias ni metodologia de evaluacion. El modelo no es auditable ni reproducible.
- Licencia no declarada: el repositorio no especifica terminos de uso. Aunque el modelo base es Apache 2.0, la ausencia de licencia explicita en el adaptador genera incertidumbre legal para uso comercial. No debe desplegarse en produccion sin aclarar este punto.
- Riesgo de alucinacion elevado: con 3.000 millones de parametros, la tasa de afirmaciones factualmente incorrectas es alta, especialmente en dominios especializados.
- Sesgos: el ajuste DPO puede reforzar los sesgos presentes en el dataset de preferencias, que se desconoce por completo. No hay ninguna evaluacion de sesgo publicada.
- "Alignment tax" potencial: el DPO puede degradar capacidades generales (razonamiento, codigo, matematicas) al optimizar preferencias humanas, algo tipico en modelos pequenos ajustados con preferencias. Sin evaluacion, este riesgo no puede descartarse.
- Idiomas: no se declaran idiomas soportados. Si el dataset de preferencias era mayoritariamente en ingles, el comportamiento conversacional en espanol u otros idiomas podria haberse degradado respecto al base.
- Contexto: 32.768 tokens nativos. El rendimiento decae en la parte final de ventanas muy largas y no se ha validado el comportamiento con YaRN tras el ajuste.
- Sin validacion comunitaria: 0 descargas y 0 "likes". No hay informes de terceros, issues ni comparativas independientes.
- Uso en produccion: no recomendado para aplicaciones con impacto sobre las personas (decisiones medicas, legales, financieras o de contratacion) sin supervision humana y sin una evaluacion previa propia.
- Trazabilidad: se desconoce si el autor ejecuto controles de calidad o si el repositorio es un experimento abandonado. La fecha de actualizacion no ofrece informacion adicional al respecto.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/M1ztyk/SAIGE-dpo-v3-1-run3
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog de la familia Qwen2.5 (Qwen Team): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen en GitHub: https://github.com/QwenLM/Qwen2.5
- Articulo de DPO (Rafailov et al., 2023): https://arxiv.org/abs/2305.18290
- Libreria TRL (entrenamiento con DPO): https://github.com/huggingface/trl
- Libreria PEFT: https://github.com/huggingface/peft
- Articulo referenciado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; unicamente aparecieron paginas generales de ChatGPT sin relacion con el repositorio.
