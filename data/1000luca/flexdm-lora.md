# 1000luca/FlexDM-LoRA

## Resumen

FlexDM-LoRA es un adaptador LoRA desarrollado por el usuario 1000luca (mantenedor del proyecto Decision Index / FlexDM) sobre el modelo base google/gemma-4-31B-it. Su proposito no es generar texto, sino producir decisiones estructuradas: dado un estado (un documento, una conversacion, una lista de dispositivos) y una o varias preguntas de opcion multiple o si/no sobre ese estado, el adaptador devuelve una distribucion de probabilidad sobre cada opcion leyendo los logits de las etiquetas en la posicion `Answer: (`. No hay decodificacion generativa; se trata de un clasificador de opciones derivado de un LLM.

El adaptador se entrena con PEFT LoRA de rango 64 sobre las siete proyecciones de las 60 capas de texto del modelo base, con 0,49 mil millones de parametros entrenables. La fuerza almacenada es 0,5 (el `lora_alpha` guardado es 64 frente a 128 en entrenamiento), de modo que se aplica la mitad del cambio aprendido sobre los pesos base. El modelo base Gemma-4-31B-it aporta una ventana de contexto de 131.072 tokens, que el adaptador aprovecha para evaluar estados largos sin truncar.

La relevancia actual del proyecto esta en su enfoque: en lugar de pedir a un LLM que "responda" una pregunta de opcion multiple mediante generacion libre (propensa a formatos inconsistentes y a alucinacion de etiquetas), FlexDM-LoRA convierte la tarea en una lectura directa de logits, con temperaturas calibradas segun el numero de opciones. Esto lo hace atractivo para pipelines de evaluacion automatizada, enrutamiento y clasificacion con opciones multiples donde se necesita una probabilidad calibrada y no una cadena de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma-4-31B-it) |
| Parametros totales | 31B en el modelo base; 0,49B entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (131.071 por fila en la practica) |
| Tipos de cuantizacion | FP8 por bloques (`fp8_per_block`) en el despliegue de referencia; el adaptador se guarda en safetensors (bf16 base, LoRA en float32 durante entrenamiento) |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados en la model card) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`; copia PEFT en `peft/`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 60 capas de texto de Gemma-4-31B-it, con rango 64, dropout 0 y LoRA en float32 sobre pesos bf16. Una particularidad tecnica relevante: las capas de atencion completa de Gemma 4 no tienen `v_proj` propia (`attention_k_eq_v`, la V es la salida de `k_proj`), por lo que en transformers el LoRA de `k_proj` modifica tanto K como V. Para el despliegue en vLLM, que da a la porcion V de su `qkv_proj` fusionada un LoRA independiente, el repositorio incluye una copia servida que repite el LoRA de `k_proj` como `v_proj` en esas 10 capas (5, 11, ..., 59); sin ello, vLLM serviria V sin el cambio entrenado.

El entrenamiento consistio en una epoca sobre 90.007 preguntas (80.512 peticiones), 934 pasos de unos 64k tokens, AdamW con lr 1e-4, 3% de warmup y decaimiento coseno, clipping de gradiente 1.0, durante unas 31 horas en una RTX PRO 6000 Blackwell Max-Q. La funcion de perdida se calcula por pregunta sobre la distribucion servida (softmax de los logits de etiqueta con soft-cap a las temperaturas de servicio): entropia cruzada contra la etiqueta dorada o la distribucion de anotadores, mas 1,0 · KL(base ‖ modelo) mas 0,3 · Brier (y RPS para escalas de evaluadores). La distribucion base es la de Gemma congelado leida por FlexDM, promediada sobre el orden original y el invertido de opciones, lo que mantiene el adaptador cerca del modelo base. Los datos se componen de un 60% de datasets publicos etiquetados por humanos (CommonsenseQA, QASC, OpenBookQA, AQuA-RAT, MATH train, StrategyQA, QuaRTz, WiCE, FaithDial, IBM ArgQ-30k, PAWS, NLU++, Taskmaster-2, oasst2, entre otros), un 20% de decisiones generadas por codigo con respuesta computada, un 15% de decisiones de otros dominios (Civil Comments, ETHICS, GoEmotions, BIGPATENT, SciCite) y un 5% (4.500 preguntas) de los splits oficiales de entrenamiento de siete benchmarks de Decision Index (HoVer, Amazon ESCI, New Yorker matching, BANKING77, CLINC150, GSM8K, WinoGrande). Se aplico descontaminacion contra 140.620 filas del suite publico 0.3 y los items publicos de JevBench, descartando 1.118 de 91.691 filas candidatas.

## Capacidades

- Decision multiple-choice y si/no con salida de probabilidad por opcion, leida de los logits de etiqueta en `Answer: (` sin generacion de texto.
- Manejo de estados largos: hasta 131.071 tokens por fila, sin truncado (las filas mas largas se rechazan como `unsupported`).
- Soporte de 2 a 255 opciones por pregunta, con temperatura calibrada en funcion del numero de opciones (`T = 10.9757 - 1.7016 ln(n opciones)`).
- Multiples preguntas por peticion procesadas en un solo forward, con las preguntas colocadas en paralelo.
- Politica de lectura "read twice": peticiones de hasta 3.000 tokens repiten el turno de usuario unidas por `Read the same input again before answering:`.
- Razonamiento implicito heredado del modelo base (Gemma-4-31B-it), con thinking desactivado en la plantilla de chat.
- Capacidades multilingues: no disponibles declaradas; dependen del modelo base.
- No soporta tool calling ni agentes de forma nativa; su funcion es la lectura de decisiones.

## Casos de uso

- Evaluacion automatizada de sistemas: dado un documento generado y una pregunta de opcion multiple sobre su calidad o correccion, el adaptador devuelve una distribucion calibrada por opcion, integrable en pipelines de evaluacion con umbrales de probabilidad.
- Enrutamiento de tickets y clasificacion: con estados de conversacion y opciones de categoria (por ejemplo, las de BANKING77 o CLINC150), el modelo asigna probabilidad a cada intent, util para derivar a colas o agentes.
- Verificacion de hechos y atribucion: sobre pares documento-afirmacion con opciones de soporte/refutacion (estilo HoVer o WiCE), la lectura de logits permite puntuar la evidencia sin generacion libre.
- Busqueda y matching semantico: con opciones de coincidencia (estilo New Yorker matching o Amazon ESCI), el adaptador puntua pares consulta-documento como decision multiple.
- Razonamiento aritmetico y logico con opciones: preguntas tipo GSM8K o WinoGrande con opciones fijas se resuelven leyendo la probabilidad de cada respuesta, evitando el formateo generativo.
- Politicas y reglas de negocio: sobre una lista de dispositivos o un estado de sistema y preguntas si/no, el adaptador decide si se cumple una regla, con probabilidad asociada para auditoria.
- Analisis de contenido y moderacion: clasificacion de comentarios o discurso con escalas de anotadores (Civil Comments, Measuring Hate Speech, GoEmotions) usando la perdida RPS para escalas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la seleccion de la fuerza (0,5 frente a 0,7 y 1,0) y de esta ejecucion frente a una de 10k preguntas se hizo sobre items publicos de Decision Index (una muestra estratificada de 2.000 filas y submuestras de cinco benchmarks), pero no se incluyen cifras.

## Requisitos de hardware

- VRAM estimada: el despliegue de referencia usa una GPU con unos 75 GB libres, con `gpu_memory_utilization` 0.70 y el modelo base cuantizado en FP8 por bloques.
- GPU recomendadas: RTX PRO 6000 Blackwell Max-Q (usada en entrenamiento), H100 80 GB, A100 80 GB; el modelo base de 31B en FP8 requiere al menos 40-50 GB solo para pesos, mas cache KV.
- En GPU de consumo (RTX 4090 24 GB) no cabe el modelo base de 31B sin cuantizacion agresiva adicional; no se documentan opciones GGUF para este adaptador.
- Opciones de despliegue: vLLM 0.30.0 offline `LLM` con `enable_lora`, `max_lora_rank` 64, TRITON_ATTN, prefix caching y `max_model_len` 131.072; el adaptador tambien esta disponible en formato PEFT para transformers 5.16.1.
- Entorno exacto: Python 3.12, torch 2.13.0+cu130, transformers 5.16.1, `VLLM_USE_DEEP_GEMM=0` y `ninja` en el `PATH` para FlashInfer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlexDM-LoRA (este) | 31B base + 0,49B adaptador | 131.072 | Decision multiple-choice por logits | cc-by-sa-4.0 | Hugging Face, acceso bajo solicitud |
| google/gemma-4-31B-it | 31B | 131.072 (heredado) | Generacion general | no disponible en la informacion | Hugging Face |
| FlexDM v1.0 (sin adaptador) | 31B base | 131.072 | Decision multiple-choice por logits | no disponible en la informacion | GitHub |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera respuesta generativa queda fuera de su alcance.
- Limite estricto de 131.071 tokens por fila y de 2 a 255 opciones por pregunta; las filas que exceden se rechazan como `unsupported` sin truncado.
- Acceso restringido: la model card indica `extra_gated_prompt` con acceso bajo solicitud para los mantenedores de Decision Index y evaluacion.
- Licencia cc-by-sa-4.0: permite uso comercial con atribucion y compartir igual, pero impone obligaciones de licencia derivada que conviene revisar antes de produccion.
- Riesgo de alucinacion: al leer logits de etiqueta, el modelo puede asignar alta probabilidad a opciones incorrectas si el estado es ambiguo o el formato de la plantilla de chat no se respeta.
- Dependencia fuerte de la politica de lectura: el layout `header`, la regla de lectura doble y las temperaturas de servicio forman parte del comportamiento entrenado; alterarlas degrada la calibracion.
- Idiomas no declarados: no hay garantia de calibracion fuera de los idiomas presentes en los datos de entrenamiento.
- Sesgos: los datasets de entrenamiento incluyen fuentes con sesgos conocidos (Civil Comments, Measuring Hate Speech, GoEmotions), que pueden propagarse a las probabilidades.
- Sin datos publicos de benchmarks: la evaluacion de calidad queda pendiente de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/1000luca/FlexDM-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio FlexDM v1.0: https://github.com/1000luca/FlexDM/tree/v1.0
- Commit del modelo base: `842da3794eaa0b77d5f08bae87a17459d91ff475`
