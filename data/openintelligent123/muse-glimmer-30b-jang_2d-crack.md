# Openintelligent123/Muse-Glimmer-30B-JANG_2D-CRACK

## Resumen

Muse-Glimmer-30B-JANG_2D-CRACK es una cuantizacion de pesos del modelo multimodal OsaurusAI/Muse-Glimmer-30B, un transformer de aproximadamente 29.776 millones de parametros con backbone de vision-lenguaje inspirado en Gemma-3, 52 capas y atencion mixta (sliding window + atencion global) mas un codificador de percepcion visual. Sobre esa base se han aplicado dos transformaciones: una ablacion de rechazo en los pesos denominada CRACK (Controlled Refusal Ablation via Calibrated Knockouts), que elimina el comportamiento de negativa, y una cuantizacion mixta MLX de tipo afín llamada JANG_2D, con precision efectiva de ~2,96 bits por peso y un peso en disco de 15,9 GB.

El modelo esta pensado para ejecutarse en Apple Silicon mediante el motor vMLX (o un runtime mlx-vlm con soporte de Muse Glimmer) y conserva vision, razonamiento con esfuerzo configurable, tool calling agéntico sobre el protocolo Onyx-ATEM y capacidades multilingues en ingles y chino. Su relevancia practica es doble: por un lado demuestra que se puede comprimir un modelo de 30B multimodal por debajo de los 16 GB en MLX con una perdida medida de 0,4 puntos en MMLU respecto a la base; por otro, es un ejemplo de cadena de publicacion de modelos "abliterated" que elimina las salvaguardas de seguridad a nivel de pesos, con las implicaciones eticas y legales que eso conlleva.

El repositorio lo publica la cuenta Openintelligent123 (con referencias internas a dealignai y a vmlx.net en la model card), fue creado el 11 de septiembre de 2026 y declara licencia Apache-2.0. No hay informacion publica sobre la longitud de contexto del modelo original ni sobre los detalles del dataset o el proceso de post-entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con backbone tipo Gemma-3, 52 capas, atencion sliding window + global y codificador de percepcion |
| Parametros totales | 29.776.626.688 (~29,8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX safetensors en precision mixta afín JANG_2D, 2-4 bits por tensor (~2,96 bits efectivos) |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors (MLX nativo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de 52 capas con esquema de atencion mixto (ventanas deslizantes combinadas con capas de atencion global) y un codificador de percepcion separado encargado de la entrada de imagen, siguiendo el patron de los modelos vision-lenguaje tipo Gemma-3. La capa de comunicacion con herramientas y razonamiento se articula mediante el protocolo Onyx-ATEM, que separa el canal de razonamiento del canal de respuesta final e introduce un esquema de invocacion de herramientas con etiquetas `<atem:invoke>`, ademas de un control explicito del esfuerzo de razonamiento (low, medium, high, xhigh; por defecto high) a traves del system prompt.

Sobre el modelo base se aplicaron dos procedimientos. El primero es CRACK, una ablacion de rechazo a nivel de pesos que elimina el comportamiento de negativa conservando, segun el autor, vision, codigo, conocimiento, multilingüismo y uso de herramientas. El segundo es la cuantizacion JANG_2D, un bundle MLX de precision mixta que mantiene los tensores criticos en alta precision y comprime el resto entre 2 y 4 bits, con overrides de precision por modulo que solo el motor vMLX respeta plenamente. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento explicito con esfuerzo configurable (low, medium, high, xhigh) y separacion de canales entre razonamiento y respuesta final.
- Comprension de imagen (image-text-to-text) mediante codificador de percepcion preservado tras la cuantizacion.
- Tool calling / function calling nativo mediante el esquema ATEM `<atem:invoke>`.
- Flujos agenticos de varios pasos con invocacion de herramientas encadenadas.
- Generacion de codigo avanzado: estructuras de datos (arbol rojo-negro), APIs con FastAPI y JWT, scrapers asincronos con aiohttp y backoff, compiladores de expresiones (tokenizer, parser, evaluador).
- Razonamiento matematico y pruebas formales de nivel avanzado (por ejemplo, demostracion de la infinitud de los primos de Euclides).
- Conocimiento general retenido en geografia, calculo, astronomia y literatura (segun la verificacion del autor en 4/4 prompts).
- Capacidades de ciberseguridad ofensiva (escaneo de puertos, shells inversas, inyeccion SQL, keylogging, flujos de Metasploit, ARP spoofing, explotacion de buffer overflow), resultado directo de la ablacion de rechazo.

## Casos de uso

- Atencion al cliente automatizada en ingles y chino: el modelo mantiene conversaciones multi-turno con separacion entre razonamiento interno y respuesta final, lo que permite revisar la traza de razonamiento sin exponerla al usuario.
- Asistente multimodal en macOS: con 15,9 GB de pesos y ejecucion MLX nativa, se puede desplegar localmente en un portatil Apple Silicon para tareas de descripcion de imagenes, extraccion de informacion de capturas o analisis de documentos escaneados.
- Generacion de codigo en produccion: el soporte nativo de tool calling permite integrarlo en pipelines que invocan linters, ejecutores de tests o APIs de repositorios como parte de un bucle agentico.
- Auditoria de seguridad y pruebas de penetracion autorizadas: al no rechazar peticiones, resulta util en laboratorios de red team para generar y revisar tecnicas ofensivas, siempre dentro de un marco contractual y legal explicito.
- Analisis de documentos tecnicos con imagen: combinando entrada visual y razonamiento largo, sirve para resumir diagramas de arquitectura, esquemas electricos o figuras de papers.
- Agente de automatizacion de escritorio o navegador: el esquema ATEM permite definir herramientas externas (clics, consultas HTTP, lectura de ficheros) y encadenar pasos con un presupuesto de razonamiento ajustable segun el coste.
- Evaluacion de robustez y alineacion: al ser una variante abliterated con MMLU practicamente identico a la base, es un candidato util para estudiar el efecto de la ablacion sobre el comportamiento y la coherencia.
- Prototipado offline en entornos sin conectividad: al caber en memoria unificada de 16-32 GB, se puede usar en escenarios de investigacion con datos sensibles que no deben salir de la maquina.

## Benchmarks y rendimiento

| Metrica | Base | CRACK |
|---|---:|---:|
| MMLU (57 materias, modo logit) | 71,1% | 70,7% |
| HarmBench (categorias de dano, cumplimiento / ASR) | no disponible | 99,6% (230/231) |

Comparativa entre perfiles de cuantizacion de la misma familia:

| Perfil | Tamano | MMLU (CRACK) | HarmBench |
|---|---:|---:|---:|
| JANG_6M | 26 GB | 81,4% | 99,5% |
| JANG_4M | 20 GB | 81,1% | 99,6% |
| JANG_2D (este modelo) | 15 GB | 70,7% | 99,6% |

Notas metodologicas aportadas por el autor: HarmBench se midio con un clasificador estricto que descarta bucles, salidas vacias o plantillas y filtraciones de la traza de razonamiento, sobre 240 comportamientos (categorias estandar y contextuales), excluyendo copyright. MMLU se midio en modo logit sobre 57 materias. La caida de MMLU de la base a CRACK (-0,4 puntos) se considera ruido entre ejecuciones. No hay datos publicados de context length ni de otros benchmarks (HumanEval, GSM8K, MMMU, etc.).

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~15-16 GB solo para los pesos; con cache KV para contexto largo y procesamiento de imagen, prever 20-24 GB.
- Plataforma objetivo: Apple Silicon con MLX. El repositorio esta etiquetado como `mlx` y `apple-silicon`, por lo que no esta pensado para CUDA.
- Equipos recomendados: Mac con chip M-series y 24-32 GB de memoria unificada para margen comodo; en equipos de 16 GB el modelo entra pero deja poco espacio para cache y sistema.
- GPU NVIDIA: no hay soporte declarado para CUDA en este bundle; seria necesario reconvertir los pesos a GGUF o safetensors estandar, algo no documentado en la informacion disponible.
- Opciones de despliegue: vMLX (recomendado por el autor, respeta los overrides de precision mixta por modulo, la vision y los parsers Onyx-ATEM); alternativamente un runtime `mlx-vlm` con soporte de Muse Glimmer. No se menciona soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible. La model card solo afirma carga instantanea en Apple Silicon y uso de cuantizacion de cache KV y reutilizacion de prefix-cache en vMLX.
- Parametros de muestreo obligatorios: temperature 1.0, top_p 0.95, top_k 64; tokens de parada `eos_token_id = [200001, 200008]`. Muchos runtimes ignoran `generation_config.json` y `jang_config.json`, por lo que hay que pasarlos explicitamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Muse-Glimmer-30B-JANG_2D-CRACK (este) | ~29,8B | no disponible | 70,7% (CRACK) | Apache-2.0 (declarada) | MLX, 15,9 GB |
| muse-glimmer-30B base (OsaurusAI) | ~29,8B (relacion: quantized) | no disponible | 71,1% | no disponible en esta informacion | safetensors |
| Muse-Glimmer-30B-JANG_4M-CRACK | ~29,8B | no disponible | 81,1% (CRACK) | Apache-2.0 (declarada) | MLX, 20 GB |
| Muse-Glimmer-30B-JANG_6M-CRACK | ~29,8B | no disponible | 81,4% (CRACK) | Apache-2.0 (declarada) | MLX, 26 GB |

No se dispone de datos comparativos frente a modelos de otras familias (por ejemplo Gemma-3-27B, Qwen2.5-VL-32B o similares) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo ha sido eliminado a nivel de pesos. Genera contenido ofensivo (malware, phishing, exploit de buffer overflow, keylogging) sin filtros, lo que lo hace inadecuado para despliegues de cara al publico sin capas de moderacion externas.
- Riesgo legal y de cumplimiento: el uso en la UE puede entrar en conflicto con normativas de seguridad de productos y de contenido, ademas de las politicas de uso de los proveedores de cloud.
- Procedencia dudosa del artefacto: el repositorio lo publica la cuenta Openintelligent123, pero la model card referencia cuentas y dominios distintos (dealignai, vmlx.net) y lleva la etiqueta "crack", lo que sugiere una posible redistribucion o reempaquetado de pesos de terceros. No hay verificacion de integridad publicada. Verificar el hash de los safetensors antes de desplegarlo.
- Licencia: se declara Apache-2.0, pero el modelo base deriva de un backbone tipo Gemma-3, cuyos terminos de licencia podrian no ser compatibles con una relicencia Apache-2.0. Conviene revisar la licencia del modelo base antes de un uso comercial.
- Sesgos: no hay ninguna evaluacion de sesgo publicada en la informacion disponible.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de factualidad. La ablacion de rechazo puede reducir la tendencia a expresar incertidumbre, ya que parte del comportamiento de negativa suele estar correlacionado con la calibracion.
- Idioma: solo ingles y chino estan declarados y validados; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: la longitud de contexto no esta especificada; planificar despliegues con ventanas largas sin conocer el limite real es arriesgado.
- Cuantizacion agresiva: con ~2,96 bits efectivos, la perdida de MMLU frente a los perfiles JANG_4M y JANG_6M es de mas de 10 puntos. No usar este perfil para tareas que dependan de razonamiento fino o conocimiento factual preciso.
- Dependencia de runtime: los overrides de precision mixta por modulo solo los respeta vMLX. En otros runtimes MLX el modelo puede degradarse de forma notable.
- Sin datos de despliegue en produccion: 0 descargas y 0 likes en el momento de redactar esta ficha, sin historial de uso ni incidencias reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Openintelligent123/Muse-Glimmer-30B-JANG_2D-CRACK
- Modelo base: https://huggingface.co/OsaurusAI/Muse-Glimmer-30B
- Perfil JANG_6M-CRACK: https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_6M-CRACK
- Perfil JANG_4M-CRACK: https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_4M-CRACK
- Perfil JANG_2D-CRACK: https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_2D-CRACK
- Motor de inferencia vMLX: https://vmlx.net
- Apoyo al desarrollo (Ko-fi del autor de la model card): https://ko-fi.com/dealignai
- Paper o documentacion tecnica de CRACK: no disponible
- Paper o documentacion tecnica de JANG: no disponible
- Documentacion del protocolo Onyx-ATEM: no disponible
