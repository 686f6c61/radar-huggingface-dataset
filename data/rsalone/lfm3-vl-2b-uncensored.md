# rSalone/LFM3-VL-2B-uncensored

## Resumen

LFM3-VL-2B-uncensored es una variante "abliterated" del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario rSalone en Hugging Face. El modelo original, desarrollado por Liquid AI, es un transformer de unos 1.918 millones de parametros que procesa texto e imagenes (pipeline image-text-to-text) y que, por defecto, incorpora un modo de razonamiento ("thinking") antes de responder. La modificacion consiste en eliminar la direccion de rechazo ("refusal direction") del subespacio de pesos de la parte lingueistica, sin tocar el codificador visual ni el proyector.

El problema que aborda es la negativa del modelo base a responder ciertas peticiones, tanto si el contenido sensible aparece en el texto como si aparece dentro de una imagen. Segun la model card, el modelo original respondia sin rechazo a 9 de 200 peticiones de HarmBench y a 101 de 200 de MM-SafetyBench; tras la abliteracion, las cifras suben a 173 y 185 respectivamente, manteniendo un rendimiento similar en tareas de razonamiento (GSM8K: 90 a 91 correctas de 100; GPQA Diamond: 42 a 49 de 198).

Es relevante ahora porque demuestra que la tecnica de abliteracion, aplicada previamente a modelos de texto, se puede trasladar a modelos vision-lenguaje midiendo de nuevo la direccion de rechazo sobre el modelo multimodal en lugar de reutilizar la del modelo de texto. El resultado es un modelo de 2B parametros con contexto de hasta 32.768 tokens en llama.cpp, cuantizable a 0,75 GB en Q2_K, lo que lo hace desplegable en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lfm3_vl): codificador visual + proyector + parte lingueistica de 24 capas |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de llama.cpp con `-c 32768`) |
| Tipos de cuantizacion | GGUF Q2_K, Q4_K_M, Q8_0, BF16; safetensors BF16 |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (licencia "other" del modelo base) |
| Formato de pesos | safetensors (BF16) y GGUF (Q2_K, Q4_K_M, Q8_0, BF16), mas mmproj GGUF para vision |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B y conserva su arquitectura intacta salvo por la modificacion de pesos. La parte lingueistica consta de 24 capas, cada una con dos matrices de salida ("places"), lo que da 48 puntos donde se puede inyectar o eliminar una direccion. El codificador visual y el proyector son identicos al original, segun afirma el autor, y solo se ha alterado la parte del lenguaje. El modelo base incorpora razonamiento explicito antes de responder por defecto, y las recomendaciones de muestreo son temperatura 0,1, top-k 50 y penalizacion de repeticion 1,1.

El proceso de abliteracion consistio en calcular la direccion de rechazo como la diferencia entre los estados ocultos medios de prompts censurados y prompts ordinarios (promediados sobre todos los tokens del prompt), y restarla de los pesos en los puntos mas relacionados con el rechazo ("baking"). El autor comparo dos variantes: reutilizar la direccion medida en LFM3-1.7B (38 puntos) o medirla de nuevo sobre el modelo VL (40 puntos, 37 coincidentes). La similitud coseno mediana entre ambas direcciones fue de 0,65, y la version con direccion re-medida redujo los rechazos de 13 a 0 sobre 200 prompts de HarmBench, por lo que es la version publicada. No se detalla el volumen ni la composicion del dataset de entrenamiento del modelo base, ni si hubo RLHF o DPO en su construccion original.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento ("thinking") activado por defecto.
- Comprension de imagenes: entrada image-text-to-text, con codificador visual y proyector compatibles con llama.cpp mediante el fichero mmproj.
- Razonamiento aritmetico y matematica basica (GSM8K: 91/100 correctas segun la model card).
- Razonamiento de nivel avanzado (GPQA Diamond: 49/198 correctas).
- Respuesta a peticiones que el modelo base rechazaba, tanto en texto como en imagen (173/200 en HarmBench, 185/200 en MM-SafetyBench).
- Uso con herramientas y agentes: la model card menciona uso agentico con herramientas (por ejemplo OpenCode) y recomienda temperatura 0,3 para reducir repeticiones de llamadas a herramientas.
- Compatibilidad con la API OpenAI de llama-server para enviar imagenes mediante `image_url`.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de imagenes con contenido sensible para investigacion de seguridad: el modelo permite estudiar como responde un VLM abliterated a peticiones que el original rechazaria, usando MM-SafetyBench como referencia y comparando con el modelo base.
- Evaluacion de tecnicas de abliteracion en modelos multimodales: sirve como caso de estudio reproducible para medir el impacto de re-medir la direccion de rechazo frente a reutilizarla del modelo de texto, con los puntos de inyeccion y las metricas documentadas.
- Despliegue local en GPU de consumo: con Q4_K_M (1,10 GB) y mmproj BF16 (0,38 GB) cabe en tarjetas de 8 GB o menos mediante llama.cpp, lo que permite prototipar pipelines de vision-lenguaje sin infraestructura dedicada.
- Procesamiento de documentos e imagenes en flujos agenticos: integrado en llama-server con API compatible con OpenAI, puede recibir imagenes por `image_url` y encadenar llamadas a herramientas, con temperatura 0,3 recomendada para uso agentico.
- Generacion de descripciones y respuestas sobre imagenes en contextos donde el filtrado del modelo base resulta demasiado restrictivo (por ejemplo, catalogacion de material artistico o medico), asumiendo la responsabilidad legal y etica del despliegue.
- Experimentacion con cuantizaciones GGUF: los cuatro niveles publicados (Q2_K a BF16) permiten medir el compromiso entre calidad y VRAM en un VLM de 2B, aunque el autor solo verifico que el GGUF carga y describe una imagen, sin benchmarks.
- Investigacion sobre alineacion y modos de fallo: el comportamiento observado de repetir llamadas a herramientas sin resultado a temperatura 0,1 constituye un caso practico para estudiar la estabilidad de agentes basados en modelos abliterated.

## Benchmarks y rendimiento

Datos publicados en la model card (transformers, BF16, thinking on, una ejecucion por prueba, RTX 5070 Ti de 16 GB):

| Benchmark | Original | Este modelo |
|---|---|---|
| HarmBench: respondidas sin rechazo (de 200 peticiones de texto) | 9 | 173 |
| MM-SafetyBench: respondidas sin rechazo (de 200 peticiones con imagen) | 101 | 185 |
| GSM8K: correctas (de 100) | 90 | 91 |
| GPQA Diamond: correctas (de 198) | 42 | 49 |

Comparacion interna de variantes durante el desarrollo: la version que reutiliza la direccion del modelo de texto de 1.7B respondio sin rechazo a 187 de 200 peticiones de HarmBench (13 rechazos), frente a 0 rechazos con la direccion re-medida sobre el modelo VL. En GSM8K, las tres variantes obtuvieron 90, 90 y 91 correctas; en GPQA Diamond, 42, 41 y 49.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,75 GB en Q2_K, 1,10 GB en Q4_K_M, 1,85 GB en Q8_0 y 3,47 GB en BF16, a lo que hay que sumar 0,38 GB del mmproj BF16 si se usan imagenes. En transformers con safetensors BF16, el fichero `model.safetensors` ocupa 3,84 GB.
- GPU recomendadas: el autor ejecuto todos los benchmarks en una RTX 5070 Ti de 16 GB; por tamano, el modelo cabe holgadamente en RTX 4090, A100 y H100, y en tarjetas de consumo de 8 GB o menos con cuantizaciones Q4_K_M o Q2_K.
- Cabe en GPU de consumo: si, con Q4_K_M o Q2_K mas mmproj; en BF16 requiere al menos unos 4-5 GB de VRAM para pesos, mas overhead de contexto.
- Opciones de despliegue: llama.cpp (llama-server con `--mmproj`, `-ngl 99`, `-fa on`, `--jinja`) y transformers con `AutoModelForImageTextToText` y `trust_remote_code=True`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo indica que el GGUF se verifico para cargar en llama.cpp (CUDA, build 12004) y describir correctamente una imagen de prueba, sin benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| rSalone/LFM3-VL-2B-uncensored | ~1,92 B | 32.768 tokens (config llama.cpp) | Si | lfm-open-license-v1.0 | Abliterated; 173/200 HarmBench y 185/200 MM-SafetyBench sin rechazo |
| LiquidAI/LFM3-VL-2B (base) | ~1,92 B | no disponible | Si | lfm-open-license-v1.0 | Original; 9/200 HarmBench y 101/200 MM-SafetyBench sin rechazo; GSM8K 90/100, GPQA 42/198 |
| rSalone/LFM3-1.7B-uncensored-abl38 | ~1,7 B (estimado por el nombre) | no disponible | No (solo texto) | no disponible | Abliterated de texto; su direccion de rechazo se reutilizo como comparacion en el desarrollo de este modelo |

No se dispone de datos de benchmarks de modelos de terceros en la informacion proporcionada, por lo que la comparativa se limita a las variantes documentadas por el autor.

## Limitaciones y advertencias

- Modelo "uncensored": elimina deliberadamente los mecanismos de rechazo, por lo que puede generar contenido que el modelo base bloquearia. El despliegue en produccion exige filtros y politicas de uso propios.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; el modelo base ya presenta el riesgo habitual de los modelos de 2B parametros, y la abliteracion no lo mitiga.
- Sesgos conocidos: no disponibles en la informacion proporcionada; no se documento ninguna evaluacion de sesgo.
- Limitaciones de contexto e idioma: el contexto de 32.768 tokens solo aparece en el ejemplo de llama.cpp, no como especificacion oficial del modelo base; los idiomas soportados no estan documentados.
- Restricciones de licencia: la licencia lfm-open-license-v1.0 ("other") puede imponer condiciones al uso comercial; hay que revisar el fichero LICENSE del repositorio antes de desplegar.
- Estabilidad en uso agentico: el autor observa que a temperatura 0,1 el modelo repite llamadas a herramientas sin resultado y luego responde de forma ajena a la peticion; a 0,3 el problema se reduce, pero no se ha medido formalmente.
- Los GGUF no estan evaluados con benchmarks: solo se comprobo que cargan y describen una imagen; el rendimiento de las cuantizaciones Q2_K, Q4_K_M y Q8_0 no esta medido.
- Los benchmarks se ejecutaron con una sola pasada por prueba y en transformers BF16, sin intervalos de confianza; las diferencias de pocos puntos (por ejemplo GSM8K 90 frente a 91) no deben interpretarse como mejoras significativas.
- El autor no detalla el dataset de entrenamiento ni el proceso de alineacion del modelo base, lo que limita la evaluacion de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rSalone/LFM3-VL-2B-uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Version de texto del mismo autor: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38
- Paper referenciado (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado (arxiv:2402.04249): https://arxiv.org/abs/2402.04249
- Paper referenciado (arxiv:2311.17600): https://arxiv.org/abs/2311.17600
- Paper referenciado (arxiv:2110.14168): https://arxiv.org/abs/2110.14168
- Paper referenciado (arxiv:2311.12022): https://arxiv.org/abs/2311.12022
