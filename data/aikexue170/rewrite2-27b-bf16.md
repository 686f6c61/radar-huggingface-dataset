# aikexue170/rewrite2-27b-bf16

## Resumen

Rewrite2 27B es un modelo de lenguaje especializado en una única tarea: la reescritura y la expansión de texto narrativo en chino. Lo publica el usuario `aikexue170` en Hugging Face y deriva de un ajuste fino supervisado (SFT) sobre una base de la familia Qwen3 (etiquetada como `qwen3_5_text` y descrita por el autor como «Qwen3.8-27B»), con 26.895.998.464 parámetros (~26,9B) en precisión BF16 y un repositorio de 53,8 GB. No es un modelo conversacional general: espera una instrucción fija y un fragmento de novela, y devuelve el mismo fragmento con una redacción más natural o con los detalles restituidos.

El interés práctico está en su especialización y en el ecosistema de cuantizaciones que lo acompaña: el autor publica versiones FP8 W8A8 (29,5 GB), NVFP4 W4A4 (18,9 GB), IQ4_XS GGUF (15,2 GB) y Q3_K_M GGUF (13,3 GB), lo que permite llevarlo desde un nodo de 80 GB hasta GPU de consumo de 16-24 GB. El propio autor documenta con franqueza sus límites: ventana de trabajo óptima de unos 1.000 tokens (incluida la instrucción), entrenamiento con `max_length=2048`, propensión a la repetición en bucle y necesidad de `repetition_penalty` y `max_tokens` como topes duros.

Es relevante ahora por dos motivos: es un ejemplo de modelo de nicho (pipeline editorial de web novel china) empaquetado con instrucciones reproducibles y umbrales operativos explícitos, y sirve como caso de estudio de los riesgos de los SFT muy estrechos — degradación fuera de distribución, copia literal del original y bucles degenerativos que la cuantización agrava.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura de texto Qwen3.5 (tag `qwen3_5_text`); sin MoE |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible como dato oficial. Entrenamiento con `max_length=2048`; el autor recomienda `--max-model-len 4096` en vLLM. Ventana de trabajo óptima: ~1.000 tokens incluida la instrucción |
| Tipos de cuantizacion | BF16 (este repo), FP8 W8A8, NVFP4 W4A4, GGUF IQ4_XS, GGUF Q3_K_M |
| Idiomas soportados | Chino (`zh`) exclusivamente |
| Licencia | No disponible |
| Formato de pesos | Safetensors BF16 en 6 fragmentos (`model-00001-of-00006.safetensors` … `00006`), más `model.safetensors.index.json`, `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` |
| Tamano del repositorio | 53,8 GB (50,1 GiB de pesos) |
| Libreria / runtime | `transformers`; inferencia recomendada con vLLM (`--trust-remote-code`), requiere versiones recientes |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3, identificado en el repositorio con el tag `qwen3_5_text` y descrito por el autor como «Qwen3.8-27B 系列文本基座». No hay mezcla de expertos, ni attention lineal, ni decodificación especulativa documentada: la ficha no menciona innovaciones arquitectónicas propias. El modelo se distribuye como pesos ya fusionados (adaptadores LoRA integrados en la base), en BF16, y el autor lo presenta explícitamente como el «patrón de calidad» frente al que se deben medir las versiones cuantizadas.

El entrenamiento es un SFT de una sola época sobre un dataset denominado V12, con 50.293 pares de ejemplos: 25.647 de reescritura y 24.646 de expansión. Se usó LoRA con rango 32 y alpha 64, `max_length=2048`, y posteriormente se fusionaron los pesos. Cada ejemplo de entrenamiento es un único mensaje `user` que concatena una instrucción fija (los archivos `INSTRUCTION_rewrite.txt` e `INSTRUCTION_expand.txt` se incluyen en el repo) con el texto de entrada; no se empleó system prompt ni envoltorio de *thinking*. En la modalidad de expansión, la instrucción contiene un marcador `{tier_hint}` que debe sustituirse por un multiplicador concreto (por ejemplo, «1,6 veces, expansión de magnitud media»). No se documentan datos sobre composición del corpus, procedencia, filtrado, RLHF o DPO.

## Capacidades

- Reescritura de ficción en chino: reorganiza el texto manteniendo trama, personajes y acontecimientos, con la restricción explícita de no copiar más de 15 caracteres consecutivos del original.
- Expansión de borradores abreviados: restituye entorno, acción, psicología y gestos a partir de un texto recortado, con multiplicadores declarados de 1,5x, 1,6x o 1,8x.
- Conservación de estilo: la instrucción pide preservar la «voz» del autor, no solo la corrección gramatical.
- Ejecución de instrucciones fijas: responde bien únicamente al par de prompts de entrenamiento; admite personalización limitada mediante `{tier_hint}`.
- Generación de texto en un solo turno: formato `user` único, sin memoria conversacional.
- No soporta de forma fiable: tool calling / function calling, razonamiento multi-paso, agentes, visión, audio, código, matemáticas, traducción ni respuesta a preguntas generales.

## Casos de uso

- Reescritura editorial por escenas: se envía un fragmento de unos 1.000 tokens con `INSTRUCTION_rewrite.txt` antepuesto y se obtiene una versión reescrita que elimina «sabor a IA» y repeticiones, adecuada para autores de web novel que publican capítulos diarios.
- Expansión de borradores recortados: útil cuando un editor ha reducido un capítulo por longitud y hay que recuperar densidad descriptiva sin tocar la trama; el multiplicador `{tier_hint}` permite fijar el objetivo (por ejemplo, 1,6x) y validar después la longitud real.
- Preedición en lote con vLLM: el modelo se sirve con interfaz compatible con OpenAI (`vllm serve ... --max-model-len 4096`) y se puede integrar en una cola que procese cientos de fragmentos, con `repetition_penalty=1.08` y `max_tokens` fijados por configuración.
- Cadena de posprocesado con verificación humana: al no garantizar el cierre natural, encaja en un pipeline con detección de bucles (repetición de n-gramas), truncado automático y revisión humana de la unión entre fragmentos.
- Generación de datos sintéticos de estilo: sirve para producir pares «texto plano / texto reescrito» destinados a entrenar o evaluar otros modelos de reescritura en chino, siempre con revisión de calidad.
- Base para ajuste posterior: sus pesos fusionados y su receta LoRA documentada (r=32, alpha=64, 1 época, `max_length=2048`) lo convierten en punto de partida para especializar la misma tarea en otro género o registro.
- Despliegue en hardware de consumo con cuantización: la variante Q3_K_M (13,3 GB) o IQ4_XS (15,2 GB) permite prototipado local en GPU de 16-24 GB antes de mover el tráfico a BF16 o FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio no incluye una evaluación humana unificada y que la validación debe hacerse sobre el propio corpus y formato de despliegue. Tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- BF16 (este repositorio): 50,1 GiB de pesos, 53,8 GB en disco. Requiere nodo de 80 GB (A100 80GB, H100 80GB, H200) con `--gpu-memory-utilization 0.90`. El autor descarta explícitamente GPU de 24 GB y 48 GB para esta versión.
- FP8 W8A8 (29,5 GB): encaja en GPU de 48 GB (L40S, RTX 6000 Ada, A6000) y, con margen ajustado, en A100 40GB según longitud de contexto y lote.
- NVFP4 W4A4 (18,9 GB): pensado para 24 GB en arquitectura Blackwell (por ejemplo, RTX 5090); no es una cuantización aplicable a generaciones anteriores.
- GGUF IQ4_XS (15,2 GB) y Q3_K_M (13,3 GB): aptos para llama.cpp/Ollama en GPU de 16 GB (ajustado) y 24 GB (RTX 4090, RTX 3090). El autor advierte que la cuantización de baja precisión amplifica la repetición y la copia literal; en sus pruebas con Q3_K_M apareció repetición evidente de frases cortas.
- Opciones de despliegue: vLLM (recomendado, interfaz OpenAI-compatible), llama.cpp con `--repeat-penalty 1.08`, y por extensión Ollama. TGI no está documentado para esta arquitectura.
- Latencia y throughput: no disponibles. El límite práctico lo marca la política de `max_tokens` (≤1200 en reescritura, ≤1600 en expansión) y el troceado previo del texto.

## Comparativa con modelos similares

No hay datos públicos de benchmarks que permitan comparar Rewrite2 27B con otros modelos de reescritura en chino. La comparación disponible se limita a las variantes del propio autor, cuyos datos sí están documentados:

| Variante | Formato | Peso | Hardware objetivo | Notas del autor |
|---|---|---:|---|---|
| rewrite2-27b-bf16 | BF16 | 53,8 GB | Nodo de 80 GB | Patrón de calidad; sin cuantizar |
| rewrite2-27b-fp8 | FP8 W8A8 | 29,5 GB | 48 GB | Carga y generación verificadas; sin puntuación humana |
| rewrite2-27b-nvfp4 | NVFP4 W4A4 | 18,9 GB | 24 GB Blackwell | Carga y generación verificadas; sin puntuación humana |
| rewrite2-27b-iq4xs | GGUF IQ4_XS | 15,2 GB | 16 GB prioritario | Prioriza calidad sobre margen |
| rewrite2-27b-q3km | GGUF Q3_K_M | 13,3 GB | 16 GB con margen | Repetición de frases cortas observada en pruebas |

Frente a modelos de propósito general de tamaño comparable (por ejemplo, bases densas de ~27-32B con contexto de 32k o más), la diferencia documentada es de especialización y de ventana: Rewrite2 está entrenado para ~1.000 tokens de entrada y una sola tarea, mientras que una base general cubre más tareas pero no reproduce su comportamiento en reescritura china. No se dispone de cifras que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- Modelo de tarea única: no garantiza问答 general, código, matemáticas, traducción ni diálogo libre; usarlo fuera del prompt de entrenamiento degrada la salida de forma impredecible.
- Repetición y bucles degenerativos: el autor advierte de que el modelo puede repetir frases o incluso oraciones completas hasta agotar `max_tokens`. La penalización por repetición (desde 1.08) reduce la probabilidad pero no la elimina; hay que fijar un tope duro de tokens y un tiempo de espera, y truncar y reintentar si aparece el bucle.
- Ventana efectiva corta: por encima de ~1.000 tokens de entrada aumentan la copia literal, la repetición, la deriva temática y los cierres inestables. El texto largo debe trocearse por escenas o párrafos y revisarse después la cohesión entre fragmentos.
- Sin coherencia de largo alcance: la consistencia de trama, relaciones entre personajes y continuidad entre capítulos queda fuera del modelo y depende del troceado y de la corrección humana.
- Fidelidad imperfecta: la reescritura puede conservar demasiado original y la expansión puede quedarse por debajo del multiplicador solicitado; hay que medir la relación de longitud real en la salida.
- Cuantización: los formatos de baja precisión (Q3_K_M, IQ4_XS, NVFP4) pueden intensificar la repetición y la copia; el autor no ofrece garantías de equivalencia con BF16 ni puntuaciones de calidad por formato.
- Licencia no disponible: no se puede confirmar el uso comercial. Es un bloqueo objetivo para producción; hay que contactar con el autor antes de desplegar.
- Idioma: solo chino. No hay evidencia de comportamiento aceptable en castellano u otras lenguas.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, publicación el 2026-10-25 y actualización el mismo día; sin validación comunitaria independiente.
- Sesgos: no documentados por el autor; al entrenarse sobre ficción china, es esperable que reproduzca estereotipos de género, clase o registro propios del corpus, sin que se haya publicado un análisis al respecto.
- Dependencia de versiones: al requerir `--trust-remote-code` y arquitecturas recientes de Transformers/vLLM, conviene fijar versiones en el contenedor de despliegue.

## Enlaces

- Hugging Face (BF16): https://huggingface.co/aikexue170/rewrite2-27b-bf16
- Variante FP8 W8A8: https://huggingface.co/aikexue170/rewrite2-27b-fp8
- Variante NVFP4 W4A4: https://huggingface.co/aikexue170/rewrite2-27b-nvfp4
- Variante GGUF IQ4_XS: https://huggingface.co/aikexue170/rewrite2-27b-iq4xs
- Variante GGUF Q3_K_M: https://huggingface.co/aikexue170/rewrite2-27b-q3km
- ModelScope (BF16): https://modelscope.cn/models/alkaid55555/rewrite2-27b-bf16
- ModelScope (FP8): https://modelscope.cn/models/alkaid55555/rewrite2-27b-fp8
- ModelScope (NVFP4): https://modelscope.cn/models/alkaid55555/rewrite2-27b-nvfp4
- ModelScope (IQ4_XS): https://modelscope.cn/models/alkaid55555/rewrite2-27b-iq4xs
- ModelScope (Q3_K_M): https://modelscope.cn/models/alkaid55555/rewrite2-27b-q3km

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces anteriores proceden exclusivamente de la model card del autor. No se han localizado papers, blogs, repositorios de código ni demos adicionales.
