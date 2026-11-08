# binbinao/qwen3.5-9b-shanghai-merged

## Resumen

Qwen3.5-9B Shanghai Local-Life (Merged) es un ajuste fino supervisado del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario binbinao, orientado a responder preguntas sobre servicios publicos, tramites, politicas, transporte, educacion, sanidad, pensiones y vida cotidiana en la ciudad de Shanghai. El modelo parte de un transformer hibrido de Qwen3.5 con 8.953.803.264 parametros (aproximadamente 8,95 mil millones) y se distribuye como pesos completos en bf16 (unos 17 GB) tras fusionar un adaptador LoRA, de modo que puede cargarse directamente con `transformers` sin necesidad de PEFT.

La relevancia del modelo es acotada y muy especifica: no compite en capacidades generales, sino que inyecta un corpus curado de 202 hechos locales verificables con URL oficial, sobre los que se generaron 955 pares de preguntas y respuestas. El ajuste se complementa con 500 ejemplos de instrucciones generales en chino (`shibing624/alpaca-zh`) para mitigar el olvido catastrofico. El resultado es un asistente de dominio restringido, entrenado con LoRA (r=32, alpha=64) en una sola GPU NVIDIA L20 de 46 GB en poco menos de 22 minutos.

El modelo esta pensado para desplegarse junto a un sistema de recuperacion (RAG). En la evaluacion del autor, el rendimiento en cerrado mejora solo marginalmente respecto al modelo base (F1 de bigramas 0,140 frente a 0,107), mientras que con recuperacion BM25 top-1 el F1 sube a 0,580 y la tasa de acierto del primer numero clave alcanza el 77%. Es, por tanto, una pieza de un pipeline de atencion informativa local, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de Qwen3.5 (atencion lineal + atencion completa), clase `Qwen3_5ForCausalLM` |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso `max_length` de 2048) |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repo contiene bf16. Compatible con cuantizacion posterior via herramientas estandar (no verificada por el autor) |
| Idiomas soportados | Chino (`zh`); el modelo base Qwen3.5 es multilingue, pero el ajuste esta orientado a chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), libreria `transformers` |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de ajuste | LoRA fusionado (r=32, alpha=64, dropout=0,05), 86,6 M parametros entrenables (0,96%) |
| Modo de razonamiento | `enable_thinking=False` en el renderizado de chat (respuesta directa, sin cadena de pensamiento) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5, descrita en la informacion disponible como hibrida de atencion lineal y atencion completa, con atencion por capas alternada. El ajuste LoRA se aplico sobre las capas de atencion y MLP, incluyendo las proyecciones de la atencion lineal (`in_proj_*` y `out_proj`) y excluyendo `lm_head`. El entrenamiento consistio en SFT con 3 epocas y 546 pasos, tamano de lote efectivo de 8 (4 x acumulacion de gradiente 2), tasa de aprendizaje 1e-4 con decaimiento coseno, precision bf16 y longitud maxima de 2048 tokens. Se calculo la perdida unicamente sobre los tokens del asistente.

Los datos de entrenamiento combinan dos fuentes: 955 pares de pregunta-respuesta sobre Shanghai, generados a partir de una base de 202 hechos locales con URL de fuente oficial, fecha de vigencia y notas sobre puntos volatiles, organizados en diez clusters tematicos (seguridad social y seguro medico, fondo de vivienda, transporte, educacion, sanidad, pensiones, tramites administrativos, vida cotidiana y emergencias, empleo y subvenciones, cultura y ocio); y 500 ejemplos de `shibing624/alpaca-zh` para preservar capacidades generales de instruccion. El conjunto de validacion consta de 62 preguntas derivadas de un 15% de hechos completamente reservados, sin solapamiento con las preguntas de entrenamiento. No se menciona en la informacion disponible el uso de RLHF, DPO ni datos sinteticos adicionales mas alla de la generacion de preguntas a partir de la base de hechos.

## Capacidades

- Generacion de texto conversacional en chino, con respuestas concisas (media de 209 caracteres frente a 665 del modelo base).
- Respuesta a preguntas factuales sobre tramites y politicas locales de Shanghai en diez dominios: seguridad social, seguro medico, fondo de vivienda, transporte, educacion, sanidad, pensiones, administracion publica, vida cotidiana y emergencias, empleo y subvenciones, cultura y ocio.
- Seguimiento de instrucciones y conversaciones multiturno en chino, gracias a la combinacion con `alpaca-zh`.
- Respuesta directa sin cadena de pensamiento cuando se configura `enable_thinking=False` en la plantilla de chat.
- Capacidad de operar como componente generativo de un pipeline RAG: acepta contexto inyectado y produce respuestas que citan cifras y procedimientos.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni matematica avanzada especificas del ajuste.

## Casos de uso

- Atencion ciudadana automatizada sobre tramites de Shanghai: el modelo responde a preguntas sobre documentacion, plazos y canales de solicitud, y puede desplegarse detras de un sistema de recuperacion que inyecte el hecho oficial correspondiente. Es adecuado porque el corpus de entrenamiento esta construido precisamente sobre esos procedimientos.
- Asistente RAG de politica local: combinado con un indice BM25 sobre la base de 202 hechos, alcanza un F1 de bigramas de 0,580 y un 77% de acierto en el primer numero clave, lo que lo hace util para consultas de cifras, porcentajes y plazos.
- Orientacion sobre seguro medico y seguridad social: preguntas sobre umbrales de reembolso, copagos o requisitos de afiliacion, con la advertencia de verificar contra la URL oficial indicada en cada hecho.
- Informacion sobre fondo de vivienda y tramites de vivienda: consultas sobre requisitos, importes y procedimientos, con respuestas cortas y directas apropiadas para interfaces de chat o mensajeria.
- Guia de transporte y movilidad urbana: rutas, normativa de transporte publico y procedimientos administrativos asociados, apoyandose en el contexto recuperado para evitar respuestas genericas.
- Consultas de educacion y admision escolar: plazos, requisitos y circuitos de solicitud, donde el modelo puede ofrecer el procedimiento general y remitir a la fuente oficial para detalles volatiles.
- Informacion de pensiones y atencion a personas mayores: procedimientos de solicitud y requisitos, en un formato de respuesta breve adecuado para interfaces de voz o texto simplificado.
- Base para evaluacion de ajustes de dominio: el repositorio incluye el conjunto de validacion de 62 preguntas y los resultados en `eval/eval_rag.jsonl`, lo que lo convierte en un punto de partida reproducible para experimentos de RAG sobre dominios administrativos.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto reservado de 62 preguntas (15% de hechos no vistos en entrenamiento), en modo cerrado y con recuperacion BM25 top-1:

| Modelo / configuracion | F1 de bigramas | Recuperacion de numeros | Acierto del primer numero clave | Longitud media de respuesta |
|---|---|---|---|---|
| Qwen3.5-9B base (cerrado) | 0,107 | 0,323 | 41% | 665 caracteres |
| Este LoRA, 3 epocas (cerrado) | 0,140 | 0,286 | 52% | 209 caracteres |
| LoRA + RAG (BM25 top-1) | 0,580 | 0,765 | 77% | No disponible |

Las metricas de recuperacion de numeros contabilizan todos los numeros de la respuesta de referencia, por lo que penalizan respuestas cortas; el autor senala que el acierto del primer numero clave refleja mejor si la respuesta es correcta. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 18 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB para inferencia comoda a contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB, aunque estas cuantizaciones no han sido publicadas ni verificadas por el autor.
- GPU profesionales recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o L20. El autor entreno con una unica L20 de 46 GB con un pico de 23,9 GiB, lo que indica que la inferencia en bf16 cabe holgadamente en 24 GB.
- GPU de consumo: cabe en bf16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contextos moderados; en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriria cuantizacion a 8 o 4 bits.
- Opciones de despliegue: `transformers` con `device_map="auto"` (metodo documentado por el autor), y por compatibilidad de arquitectura con Qwen3.5, servidores como vLLM o TGI y runtimes GGUF como llama.cpp u Ollama, aunque estas ultimas no estan verificadas en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es el entrenamiento (21 minutos 56 segundos para 546 pasos en una L20).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| binbinao/qwen3.5-9b-shanghai-merged | ~8,95 B | No disponible | Ajuste de dominio local (Shanghai), pesos fusionados | Apache-2.0 | Hugging Face, 0 descargas |
| binbinao/qwen3.5-9b-shanghai-lora | ~8,95 B (base) + 86,6 M adaptador | No disponible | Mismo ajuste en formato adaptador PEFT | Apache-2.0 | Hugging Face |
| EganAI/qwen3.5-9b-terminal-merge | ~8,95 B (base) | No disponible | Ajuste para tareas de terminal y shell en Docker | No disponible en la informacion | Hugging Face |
| Qwen/Qwen3.5-9B | ~8,95 B | No disponible | Modelo base generalista multilingue | Apache-2.0 (heredada) | Hugging Face |

La comparacion con alternativas generalistas de tamano similar (por ejemplo, modelos de 7-9 B de otras familias) no puede completarse con datos verificados en la informacion proporcionada, ya que no se dispone de sus resultados en el conjunto de evaluacion del autor ni de especificaciones de contexto del modelo base.

## Limitaciones y advertencias

- En modo cerrado, el modelo confunde con frecuencia hechos del mismo cluster: el autor documenta casos en los que responde sobre el umbral de hospitalizacion cuando se pregunta por el reembolso de consulta externa.
- Tiende a reproducir el hecho completo tal cual, sin recortarlo a la pregunta concreta, lo que infla la longitud y puede incluir informacion irrelevante.
- El 15% de los hechos reservados no fue visto durante el entrenamiento; para esas preguntas solo puede ofrecer procedimientos genericos.
- La base de hechos tiene fecha de corte en noviembre de 2026 y las politicas cambian; el propio autor recomienda verificar cada cifra contra la URL oficial y aplicar validacion numerica en produccion.
- El ajuste esta orientado exclusivamente al chino y a la ciudad de Shanghai; su utilidad fuera de ese dominio o idioma es practicamente nula y puede degradar el rendimiento general del modelo base.
- Riesgo de alucinacion en cifras, porcentajes y plazos cuando no se inyecta contexto recuperado; el modo cerrado no es fiable para consultas factuales.
- La licencia Apache-2.0 permite uso comercial, pero el contenido factual se ha recopilado de fuentes publicas del gobierno de Shanghai y el autor declara no tener vinculo con las administraciones citadas; no constituye asesoramiento legal, medico ni administrativo.
- El modelo no incluye mecanismos propios de citacion de fuentes; cualquier trazabilidad debe implementarse en la capa de recuperacion.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validacion independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/binbinao/qwen3.5-9b-shanghai-merged
- Adaptador LoRA del mismo autor: https://huggingface.co/binbinao/qwen3.5-9b-shanghai-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ajuste comparable para tareas de terminal: https://huggingface.co/EganAI/qwen3.5-9b-terminal-merge
- Dataset de instrucciones generales en chino: https://huggingface.co/datasets/shibing624/alpaca-zh
