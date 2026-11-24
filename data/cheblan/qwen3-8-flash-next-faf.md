# Cheblan/Qwen3.8-Flash-Next-faf

## Resumen

Qwen3.8-Flash-Next-faf es una distribucion pre-cuantizada del modelo fundacional Qwen3.8-Flash-Next, empaquetada por el desarrollador independiente Cheblan en el formato binario propietario `.faf` del motor de inferencia fastasfuck. El objetivo no es otro que ofrecer una version lista para produccion del modelo base, optimizada especificamente para la arquitectura de memoria unificada AMD Strix Halo (`gfx1151`, Ryzen AI Max+ 395 con 128 GB de LPDDR5X-8533), donde el motor y los pesos se disenan de forma conjunta para evitar cuellos de botella de ancho de banda.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con atencion lineal hibrida GDN, atencion ventaneada QSA, 512 expertos enrutados y cabezas MTP (multi-token prediction) nativas para decodificacion especulativa. Esta orientado a tareas multimodales de imagen-a-texto y conversacionales, con soporte de tool calling y bloques de razonamiento a traves de su plantilla de chat Jinja2.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: la publicacion de artefactos cuantizados y empaquetados para hardware concreto (en este caso, APUs AMD) fuera de los formatos estandar como GGUF o safetensors. El repositorio ocupa 123,1 GB e incluye pesos, torre de vision, tabla n-gram de especulacion y utilidades de conversion. No obstante, el modelo base original es de Qwen Team y la licencia aplicable es la Qwen Community License 1.0, no una licencia permisiva generica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal hibrida GDN, atencion ventaneada QSA, 512 expertos enrutados y cabezas MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks del autor llegan a 128k tokens de prefill) |
| Tipos de cuantizacion | Hibrida Q6 / Q4 / Q8 sobre pesos MoE; tabla n-gram int8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | `.faf` (binario propietario del motor fastasfuck), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina atencion lineal GDN (probablemente una variante de atencion lineal con compuertas) con atencion ventaneada QSA, lo que sugiere un diseno hibrido pensado para reducir el coste cuadratico del contexto largo manteniendo capacidad de recuperacion local. La capa MoE cuenta con 512 expertos enrutados, un numero elevado que apunta a un modelo de gran capacidad total con activacion dispersa. Ademas, incorpora cabezas MTP (multi-token prediction) nativas que permiten decodificacion especulativa entrenada, no solo inferida.

Esta distribucion concreta no reentrena el modelo: aplica una cuantizacion hibrida Q6/Q4/Q8 sobre los pesos MoE originales y los reempaqueta en el layout binario `.faf`. El autor incluye ademas una tabla n-gram de 8.388.608 filas en int8 (Prefix Lookahead Engine, PLE) que actua como mecanismo de especulacion adicional, complementando las cabezas MTP. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base, ya que la model card de esta distribucion no los detalla.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen a texto (pipeline `image-text-to-text`) mediante torre de vision nativa (`vision.faf`, ~856 MiB).
- Soporte de tool calling y function calling a traves de la plantilla `chat_template.jinja`.
- Bloques de razonamiento (thinking blocks) integrados en la plantilla de chat.
- Decodificacion especulativa nativa con cabezas MTP y tabla PLE de 8M filas.
- Compatibilidad con APIs OpenAI (`/v1/chat/completions`) y Responses (`/v1/responses`) con reutilizacion de KV cache entre sesiones.
- Reproducibilidad determinista token a token a temperatura 0.0 (ley de identidad de bits declarada por el autor).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- **Asistencia de codigo en IDE con contexto largo**: el modelo puede integrarse en Cursor o Codex CLI mediante `/v1/responses`; los benchmarks del autor muestran prefill de ~1.458 tok/s a 32k tokens y ~1.378 tok/s a 128k sobre un corpus real de C++ no repetitivo, lo que permite cargar repositorios medianos en una sola ventana.
- **Atencion al cliente automatizada multi-turno**: con KV cache reutilizable y decodificacion sostenida de 73,8 tok/s en un solo slot, es viable mantener conversaciones largas con baja latencia inter-token (13,0-32,2 ms).
- **Despliegue de agentes concurrentes en una sola maquina**: el autor reporta 104,4 tok/s agregados con 4 slots concurrentes bajo carga continua, lo que lo hace adecuado para orquestadores de agentes que ejecutan varias tareas en paralelo sobre una APU Strix Halo.
- **Analisis de documentos con imagenes**: al soportar entrada de imagen, puede extraer informacion de capturas, diagramas o formularios y combinarla con razonamiento textual en el mismo turno.
- **Generacion de codigo en pipelines de CI/CD**: el tool calling y la salida determinista a temperatura 0.0 permiten usar el modelo como paso reproducible en automatizaciones de revision o generacion de tests.
- **Prototipado en hardware consumer de gama alta**: al caber en 128 GB de memoria unificada, permite ejecutar un MoE de gran capacidad en un equipo de escritorio sin GPU discreta, algo inviable con pesos en bf16.
- **Investigacion en decodificacion especulativa**: la combinacion de MTP y tabla n-gram PLE de 8M filas es un banco de pruebas util para estudiar tecnicas de aceleracion de inferencia.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son mediciones de rendimiento del motor sobre AMD Ryzen AI Max+ 395 (40 CUs RDNA 3.5, 128 GB LPDDR5X-8533 a 273 GB/s, kernel Linux 7.3-zen). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor medido | Condicion |
|---|---|---|
| Decodificacion greedy (T=0.0) | 73,8 tok/s de media (pico 89,7 tok/s) | 1 slot activo, prefill en frio, prompt-cache off |
| Decodificacion multi-agente (4 slots) | 104,4 tok/s agregados (pico 115,5 tok/s) | 4 slots concurrentes bajo carga continua |
| Ancho de banda de prefill (32k) | ~1.458 tok/s (TTFT 21,2 s) | Corpus real de codigo C++ no repetitivo |
| Ancho de banda de prefill (128k) | ~1.378 tok/s (TTFT 91,8 s) | Corpus real de codigo C++ no repetitivo |
| Latencia inter-token efectiva | 13,0-32,2 ms | 7 pasos MTP + tabla PLE de 8M filas |
| Reproducibilidad | 100,000% coincidencia SHA-256 exacta | Determinista a T=0.0 |

## Requisitos de hardware

- **VRAM / memoria**: el repositorio completo ocupa 123,1 GB, pero los pesos principales (`weights.faf`) son ~65,5 GiB y la tabla n-gram ~48,3 GiB. En memoria unificada se necesita practicamente la totalidad de los 128 GB de la APU para cargar pesos, tabla y vision tower con margen para KV cache.
- **GPU recomendadas**: el unico hardware validado explicitamente es AMD Ryzen AI Max+ 395 (Strix Halo, `gfx1151`, RDNA 3.5). No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- **Consumer GPU**: no cabe en GPUs consumer discretas convencionales (RTX 4090 con 24 GB, etc.) por el tamano de los pesos y de la tabla PLE. Su nicho es la memoria unificada de 128 GB de las APUs Strix Halo.
- **Despliegue**: exclusivamente mediante el motor fastasfuck (binario nativo o contenedor Podman/Docker con `ghcr.io/cheblan/fastasfuck:latest`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.faf` es propietario.
- **Latencia y throughput**: ver tabla de benchmarks. TTFT de 21,2 s a 32k y 91,8 s a 128k; decodificacion de 73,8 tok/s en un slot y 104,4 tok/s agregados en cuatro slots.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad del modelo base ni de sus alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa de rendimiento. A continuacion se comparan unicamente aspectos estructurales y de disponibilidad.

| Aspecto | Qwen3.8-Flash-Next-faf | Qwen3.8-Flash-Next (original) | Alternativa MoE cuantizada en GGUF (generica) |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible |
| Contexto | no disponible (benchmarks hasta 128k) | no disponible | no disponible |
| Formato | `.faf` propietario | safetensors (presumiblemente) | GGUF |
| Hardware objetivo | AMD Strix Halo (gfx1151) | Generico (GPU NVIDIA/AMD) | CPU y GPU consumer |
| Motores compatibles | fastasfuck | Transformers, vLLM, etc. | llama.cpp, Ollama, etc. |
| Licencia | Qwen Community License 1.0 | Qwen Community License 1.0 | Depende del autor |
| Disponibilidad | Hugging Face (0 descargas, 0 likes) | Hugging Face (oficial) | Hugging Face |

## Limitaciones y advertencias

- **Licencia restrictiva**: se rige por la Qwen Community License 1.0, que impone condiciones al uso comercial (umbrales de usuarios activos, obligaciones de atribucion). No es una licencia permisiva tipo Apache 2.0 o MIT; es necesario revisar el texto completo antes de desplegar en produccion.
- **Formato y motor propietarios**: los pesos solo funcionan con el motor fastasfuck. Esto genera dependencia de un unico proveedor y limita la portabilidad a otros stacks de inferencia.
- **Hardware muy especifico**: el rendimiento reportado solo esta validado en AMD Strix Halo con 128 GB de memoria unificada. No hay evidencia de funcionamiento correcto en otras GPUs.
- **Ausencia de benchmarks de calidad**: no se han publicado resultados de MMLU, HumanEval, GSM8K ni evaluaciones de alucinacion o sesgo. La calidad real del modelo base no esta documentada en esta ficha.
- **Riesgo de alucinacion**: inherente a los modelos generativos; sin evaluaciones publicadas no es posible cuantificarlo.
- **Idiomas no documentados**: se desconoce el soporte real de castellano y otros idiomas.
- **Madurez del artefacto**: el repositorio tiene 0 descargas y 0 likes, creado y actualizado el mismo dia (24 de noviembre de 2026), lo que indica ausencia de validacion por parte de la comunidad.
- **Tabla PLE de gran tamano**: los 48,3 GiB de la tabla n-gram condicionan fuertemente los requisitos de memoria y pueden no ser prescindibles sin degradar el rendimiento de decodificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cheblan/Qwen3.8-Flash-Next-faf
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor fastasfuck: https://github.com/Cheblan/fastasfuck
- Coleccion de cuantizaciones fastasfuck: https://huggingface.co/collections/Cheblan/fastasfuck-quantizations
- Documentacion de benchmarks: https://github.com/Cheblan/fastasfuck/blob/main/docs/BENCHMARKS.md
- Imagen de contenedor: ghcr.io/cheblan/fastasfuck:latest
