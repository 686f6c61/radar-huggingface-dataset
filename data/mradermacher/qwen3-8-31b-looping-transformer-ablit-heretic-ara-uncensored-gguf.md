# mradermacher/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored-GGUF

## Resumen

Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored, publicada por el cuantizador habitual mradermacher. El modelo subyacente es un fine-tune experimental de la familia Qwen3.8 (etiquetado tambien como qwen3_6 en los tags) con 30.364.847.424 parametros totales, construido sobre una arquitectura de tipo looping transformer. El autor original lo presenta como un modelo "abliterated" (sin las capas de rechazo habituales), "heretic" y "uncensored", orientado a usos sin restricciones de contenido.

La relevancia de esta publicacion es doble. Por un lado, ofrece una via practica de ejecutar un modelo de ~30B en hardware de consumo mediante cuantizaciones que van desde Q2_K (12,1 GB) hasta Q8_0 (32,4 GB), pasando por las recomendadas Q4_K_M (18,7 GB) y Q5_K_M (21,8 GB). Por otro, documenta un fine-tune con un conjunto muy peculiar de modos de operacion declarados por el autor: 27 modos de razonamiento, 27 modos instruct, 15 "AI Constructs" y 5 "Super AI Constructs", ademas de 9 modos de razonamiento "Xhigh".

Conviene subrayar que se trata de un modelo experimental, sin pipeline declarado, sin resultados de benchmarks publicados y con cero descargas y cero likes en el momento de la consulta. La model card del cuantizador es puramente mecanica (lista de ficheros y notas de cuantizacion) y no aporta informacion sobre entrenamiento, evaluacion ni capacidades verificadas. Toda la informacion cualitativa proviene de los tags del autor original, no de documentacion tecnica contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looping transformer (transformer con reutilizacion de capas en bucle), segun tags del autor |
| Parametros totales | 30.364.847.424 (~30,4B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors (bfloat16) |
| Tamano del repo | 211,5 GB |
| Precisión del modelo base | bfloat16 |
| Multimodalidad | Si, segun los ficheros mmproj incluidos (proyector multimodal) |
| Libreria declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base se describe como un "looping transformer", una variante que reutiliza bloques de capas en iteraciones sucesivas en lugar de apilar capas independientes, lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el numero de parametros. Los tags indican que parte de la familia Qwen3.8 (y se referencia tambien qwen3_6), con 30,4B parametros en bfloat16. El autor declara tecnicas de entrenamiento como "Cold Fusion", "GAIN Training" y "Multi-stage tuning", ademas de un proceso de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) y "heretic" (probablemente una variante de abliteration o de eliminacion de sesgos de seguridad). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron RLHF o DPO.

La innovacion declarada mas llamativa es la existencia de multiples "modos" de operacion (27 modos de razonamiento, 27 modos instruct, 9 modos Xhigh, 15 AI Constructs y 5 Super AI Constructs como Brainstorm, Brainstorm Business, Universal Teacher, Agent y Coder). Estos modos parecen implementarse mediante system prompts o plantillas predefinidas dentro del propio fine-tune, no mediante cambios arquitectonicos. No hay documentacion tecnica que detalle como se activan ni como se evaluaron. El cuantizador no aporta informacion adicional sobre el entrenamiento; su contribucion se limita a la conversion a GGUF con cuantizaciones estaticas (sin imatrix ni weighted quants, que el autor indica que probablemente no estaran disponibles).

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en escritura creativa, ficcion, narrativa y roleplaying segun los tags del autor.
- Razonamiento y modos "thinking" declarados: 27 modos de razonamiento y 9 modos "Xhigh reasoning".
- 27 modos instruct para distintos estilos de respuesta.
- 15 "AI Constructs" y 5 "Super AI Constructs": Brainstorm AI Construct, Brainstorm Business AI Construct, Universal Teacher AI Construct, Agent AI Construct y Coder AI Construct.
- Capacidad de codigo declarada mediante el Coder AI Construct y el tag "coder".
- Capacidad multimodal: los ficheros mmproj-Q8_0 y mmproj-f16 indican soporte de entrada de imagenes (proyector multimodal incluido en el repo GGUF).
- Modo "Turbo-Brilliance" declarado en los tags, sin documentacion sobre su funcionamiento.
- Modelo "abliterated", "heretic" y "uncensored": se ha eliminado total o parcialmente el comportamiento de rechazo, por lo que responde a peticiones que otros modelos rechazarian.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes multi-paso: declarado de forma implicita mediante el Agent AI Construct, sin detalles tecnicos.
- Capacidades multilingues: limitadas al ingles segun el campo language; no se declaran otros idiomas.

## Casos de uso

- Escritura creativa y ficcion sin filtros: el modelo esta orientado explicitamente a narrativa, generacion de historias y roleplaying, con modos dedicados y sin las capas de rechazo habituales, lo que permite explorar generos y tematicas que otros modelos censuran. Adecuado para autores que necesitan borradores rapidos de ficcion adulta o experimental.
- Roleplaying y simulacion de personajes: los modos instruct y los AI Constructs (Brainstorm, Universal Teacher) permiten mantener conversaciones multi-turno con una persona definida por system prompt, util para prototipos de videojuegos narrativos o entrenamiento de guionistas.
- Asistente de lluvia de ideas de negocio: el Brainstorm Business AI Construct esta pensado para sesiones de ideacion estructurada; se usaria como interlocutor que genera y agrupa propuestas a partir de un brief, con la ventaja de que el modelo no rechaza temas sensibles de estrategia o competencia.
- Generacion de codigo asistida: el Coder AI Construct y el tag "coder" permiten usar el modelo como asistente de programacion en local (por ejemplo, con llama.cpp u Ollama) para autocompletar, explicar o refactorizar codigo, sin depender de APIs externas. La cuantizacion Q4_K_M (18,7 GB) cabe en una RTX 4090 de 24 GB.
- Analisis de imagenes en local: gracias a los ficheros mmproj, el modelo puede procesar entradas visuales junto con texto (descripcion de imagenes, extraccion de informacion de capturas o diagramas) en un despliegue completamente offline, lo que resulta relevante para datos sensibles que no deben salir de la infraestructura.
- Prototipado de agentes autonomos: el Agent AI Construct sugiere un uso como nucleo de un agente que planifica y ejecuta tareas; en la practica se integraria con un orquestador externo (LangChain, LlamaIndex) que aporte las herramientas, ya que el modelo no documenta tool calling nativo.
- Educacion y tutoria personalizada: el Universal Teacher AI Construct permite configurar al modelo como tutor que adapta explicaciones a distintos niveles, util para generar material didactico o responder dudas en un entorno controlado y sin conexion.
- Experimentacion en investigacion sobre alineacion y abliteration: al ser un modelo "abliterated" y "heretic", sirve como objeto de estudio para comparar el comportamiento con y sin capas de rechazo, o para evaluar la robustez de las tecnicas de eliminacion de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye evaluaciones y el autor original no aporta metricas en los datos proporcionados (MMLU, HumanEval, GSM8K u otras no estan disponibles).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~12,1 GB; Q3_K_S ~13,7 GB; Q3_K_M ~15,1 GB; Q3_K_L ~16,3 GB; Q4_K_S ~17,7 GB; Q4_K_M ~18,7 GB; Q5_K_S ~21,2 GB; Q5_K_M ~21,8 GB; Q6_K ~25,0 GB; Q8_0 ~32,4 GB. A esto hay que sumar el proyector multimodal (0,7-1,0 GB) si se usa vision y la memoria para la cache KV, que depende del contexto configurado (no documentado).
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda A100 40 GB, H100 80 GB o dos GPU consumer de 24 GB. Para Q2_K y Q3_K, una RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) puede bastar, con margen ajustado.
- Cabe en GPU consumer: si, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q2_K o Q3_K_S; en GPUs de 12 GB no cabe ninguna cuantizacion completa (la mas pequena es 12,1 GB y deja sin margen para contexto).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI (el tag endpoints_compatible sugiere compatibilidad con endpoints estilo OpenAI). vLLM y TGI no soportan GGUF de forma nativa para este caso; para ellos habria que usar el modelo base en safetensors, que requiere ~61 GB en bfloat16.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored (este) | 30,4B | no disponible | apache-2.0 | GGUF, safetensors | Fine-tune experimental sin benchmarks, abliterated, multimodal |
| Qwen2.5-32B-Instruct | 32,5B | 128K (segun documentacion de Qwen) | apache-2.0 | safetensors, GGUF | Modelo oficial de referencia de la familia Qwen, con benchmarks publicados |
| Gemma-2-27B-it | 27B | 8K | Gemma license (uso comercial con restricciones) | safetensors, GGUF | Modelo oficial de Google, con benchmarks publicados |
| Mistral-Small-24B-Instruct | 24B | 32K | apache-2.0 | safetensors, GGUF | Alternativa europea de ~24B con benchmarks publicados |

La comparacion es necesariamente asimetrica: los tres modelos de referencia son lanzamientos oficiales con evaluaciones publicadas, mientras que este fine-tune no ofrece ningun dato de rendimiento verificable. En tamano y licencia es comparable a Qwen2.5-32B-Instruct y Mistral-Small-24B, pero su caracter experimental, su naturaleza "uncensored" y la ausencia de benchmarks lo situan en una categoria distinta, orientada a experimentacion y usos creativos sin filtros mas que a produccion con garantias.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni en ninguna otra tarea estandar, por lo que no se puede comparar objetivamente con alternativas.
- Modelo experimental con cero descargas y cero likes en el momento de la consulta: no hay comunidad que haya validado su calidad ni su estabilidad.
- Modelo "abliterated", "heretic" y "uncensored": ha sido manipulado para eliminar o reducir el comportamiento de rechazo. Esto implica un riesgo elevado de generar contenido danino, ofensivo, ilegal o sexualmente explicito, y lo hace inadecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no cuantificado, pero esperable en un fine-tune sin evaluacion; la ausencia de benchmarks impide estimar su fiabilidad.
- Idiomas: solo se declara ingles. El rendimiento en castellano es desconocido y probablemente deficiente.
- Contexto: no documentado. No se puede planificar un caso de uso que dependa de ventanas largas sin medirlo empiricamente.
- Licencia apache-2.0: permite uso comercial, pero el modelo base tiene su propia licencia (apache-2.0 segun los metadatos) y el contenido generado puede infringir derechos de terceros o normativa local; el usuario asume la responsabilidad legal.
- Los "modos" y "AI Constructs" declarados en los tags no estan documentados tecnicamente; su activacion y comportamiento real no se pueden verificar a partir de la informacion disponible.
- El repo pesa 211,5 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- No se han publicado cuantizaciones con imatrix ni weighted quants; el autor indica que probablemente no estaran disponibles.
- El tag "endpoints_compatible" sugiere compatibilidad con la API de OpenAI, pero no hay documentacion que lo confirme.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
