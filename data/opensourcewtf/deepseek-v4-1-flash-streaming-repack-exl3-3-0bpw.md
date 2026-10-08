# OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3-3.0bpw

## Resumen

OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3-3.0bpw es un reempaquetado (repack) del modelo DeepSeek-V4.1-Flash de DeepSeek-AI, publicado por el usuario OpensourceWTF. No es un modelo nuevo ni un fine-tuning: los pesos, la arquitectura, el tokenizador y el codificador de prompts de referencia pertenecen a DeepSeek-AI y conservan su licencia MIT, byte a byte. Lo unico que cambia este repositorio es la forma en que se almacenan los pesos para permitir su ejecucion en hardware con memoria limitada.

DeepSeek-V4.1-Flash es un transformer de mezcla de expertos (MoE) multimodal con 40 capas MoE, 384 expertos enrutados por capa (6 activos por token) y un experto compartido adicional por capa, con una ventana de contexto combinada de hasta un millon de tokens. Sus expertos enrutados son demasiado grandes para residir en la memoria de un Mac de 128 GB, de modo que este repack los reorganiza para poder transmitirlos en streaming desde el SSD durante la inferencia.

Los expertos enrutados proceden de una cuantizacion EXL3 de 3,0 bits por peso ya existente, creada por Mia-AiLab con ExLlamaV3 v1.4.2. El repack los copia byte a byte a un nuevo diseno de registros contiguos alineados, y convierte el resto de pesos a formatos nativos de MLX como repacks exactos. El resultado se sirve con mlx-serve y el plugin mlx-stream, de modo que un Mac con 128 GB de memoria puede atender el modelo aunque no pueda alojar todos los expertos a la vez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (deepseek_v41); 40 capas MoE con 384 expertos enrutados (6 activos por token) mas 1 experto compartido por capa; capas MTP/DSpark; tablas Engram en las capas 1 y 14; torre de vision y aligner |
| Parametros totales | 109.500 millones aprox. (109,5B) segun LLM Explorer; el recuento de safetensors del repo es de 22.695.013.074 parametros, correspondiente solo a los pesos residentes (no enrutados y MTP) |
| Parametros activos | No disponible en cifra exacta; 6 expertos enrutados activos de 384 por token, mas 1 experto compartido por capa |
| Longitud de contexto | Hasta 1.000.000 de tokens combinados (1M), segun las fuentes del modelo base |
| Tipos de cuantizacion | EXL3 3,0 bpw (expertos enrutados, codebook mul1, transformadas Hadamard `suh`/`svh` de 128); mxfp8 con grupo 32 (proyecciones FP8 E4M3 con escalas de bloque UE8M0 32x32); mxfp4 con grupo 32 (expertos enrutados MTP/DSpark, FP4 E2M1); BF16 y F32 copiados literalmente |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (49 shards, 18,7 GB, pesos residentes) mas experts.bin (formato propio EXL3 en registros contiguos) y engram/*.bin |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del DeepSeek-V4.1-Flash original, un modelo de mezcla de expertos multimodal que acepta texto e imagenes y genera texto de forma autorregresiva, con esfuerzo de razonamiento controlable de forma continua. Las fuentes web describen su diseno como "arquitectura CED" y confirman un contexto combinado de hasta un millon de tokens, entrada nativa de imagen y capacidad de agente. El modelo cuenta con 40 capas MoE de 384 expertos enrutados cada una (6 activos por token) mas un experto compartido por capa, tres capas MTP/DSpark y tablas Engram de n-gramas en las capas 1 y 14.

Este repositorio no anade entrenamiento, fine-tuning ni fusion de pesos. La innovacion tecnica del repack es de almacenamiento y ejecucion: cada par (capa, experto) se convierte en un registro contiguo de 13.316.096 bytes en un desplazamiento alineado a 4.096 bytes, con nueve segmentos (codigos trellis, `svh` y `suh` para gate, up y down). El fichero `expert-manifest-v2.json` describe el codec, el diseno de segmentos por capa y el offset y sha256 de cada registro. Se generaron 15.360 registros que suman 204,5 GB. El bank se sometio a verificacion (sha256, comparacion byte a byte con las fuentes EXL3, padding a cero y cuatro tiles decodificados por proyeccion), y los 15.360 registros pasaron las comprobaciones, cuyos resultados se guardan en `receipts/`. Las tablas Engram se almacenan como arrays planos de filas de 264 bytes (256 codigos E4M3 y 8 escalas UE8M0), con un mapa de token a vocabulario comprimido (99.092 entradas para 129.280 ids del tokenizador).

## Capacidades

- Generacion de texto conversacional y autorregresiva (`text-generation`, `conversational`).
- Razonamiento con esfuerzo controlable de forma continua, segun la documentacion del modelo base.
- Entrada multimodal de imagenes: el release incluye torre de vision y aligner, copiados verbatim en este repack.
- Contexto largo de hasta 1.000.000 de tokens combinados.
- Capacidades de agente y uso en entornos tipo Harness, referenciadas para el modelo base.
- Expertos enrutados activados de forma dinamica (6 de 384 por token) mas experto compartido, con decodificacion MTP/DSpark.
- Funcionamiento por streaming de expertos desde SSD mediante el plugin mlx-stream, con cache de slots acotada y kernels EXL3 sobre Metal.
- Acceso por offset a filas Engram para busquedas de n-gramas durante la inferencia.
- Soporte de plantilla de chat (`chat_template.jinja`, version Jinja del path de texto del release).

## Casos de uso

- Servicio local de un modelo de 1M de tokens en un Mac de 128 GB: el repack permite atender DeepSeek-V4.1-Flash en un equipo Apple Silicon sin GPU dedicada, transmitiendo los expertos enrutados desde el SSD mientras el trunk permanece residente.
- Procesamiento de documentos largos: analisis y resumen de contratos, informes o bases de codigo de cientos de miles de tokens aprovechando la ventana de contexto de 1M.
- Asistentes conversacionales multi-turno: conversaciones extensas con historial prolongado, adecuadas por la ventana de contexto y el formato de chat incluido.
- Razonamiento con esfuerzo ajustable: tareas que requieren cadenas de razonamiento largas (matematicas, analisis logico) pueden aumentar el esfuerzo de razonamiento, y reducirlo para consultas simples.
- Analisis de documentos con imagenes: al ser multimodal, permite extraer informacion de capturas, diagramas o formularios escaneados junto con texto.
- Flujos de trabajo agente (Harness): tareas multi-paso con memoria larga, apoyandose en las capacidades de agente del modelo base.
- Investigacion y experimentacion en cuantizacion y streaming: util como referencia para estudiar EXL3, mxfp8/mxfp4 y ejecucion de MoE con expertos fuera de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repack. Las fichas del modelo base mencionan benchmarks de agente y de Harness, pero no se aportan cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- Memoria recomendada: Apple Silicon con al menos 128 GB de memoria unificada. El ejemplo de arranque fija `--memory-ceiling-gb 120.259` y `--wired-margin-gib 2`, es decir, un techo de memoria cercano a 120,26 GB.
- Almacenamiento: `experts.bin` ocupa 204,5 GB y se transmite desde SSD, por lo que se necesita un SSD NVMe rapido. El pesos residentes en safetensors ocupan 18,7 GB. El tamano total del repo es de 426,3 GB.
- GPU: no aplica a CUDA. La ejecucion se realiza sobre Metal mediante MLX; no esta pensada para A100, H100 ni RTX 4090, ya que su grafo no lee este layout.
- Cabida en consumer: si cabe en equipos Apple Silicon con 128 GB o mas de memoria unificada (por ejemplo variantes Ultra con esa configuracion), pero no en un Mac con menos memoria, porque los expertos no pueden residir en RAM.
- Opciones de despliegue: unicamente mlx-serve con el plugin mlx-stream (arquitectura `deepseek_v41`), propuesto en el PR ddalcu/mlx-serve#749. Otros cargadores como Transformers, vLLM o ExLlamaV3 no leen este layout; para ellos debe usarse el release original o la cuantizacion EXL3 de Mia-AiLab.
- Comando de arranque: `mlx-serve --serve --model /ruta/al/repo --port 8080 --memory-ceiling-gb 120.259 --wired-margin-gib 2`.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la velocidad del SSD, del tamaño de la cache de slots y de los kernels EXL3 sobre Metal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Cargador | Hardware | Licencia |
|---|---|---|---|---|---|---|
| OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3-3.0bpw (este repack) | ~109,5B totales (22,7B en safetensors) | 1M | EXL3 3,0 bpw + mxfp8 + mxfp4 + BF16/F32 | mlx-serve + mlx-stream | Mac Apple Silicon 128 GB, expertos en streaming desde SSD | MIT |
| deepseek-ai/DeepSeek-V4.1-Flash (release original) | ~109,5B | 1M | FP8/FP4 en el release | Transformers, vLLM, otros | Requiere alojar los pesos completos; no cabe en 128 GB | MIT |
| Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-3.0bpw | ~109,5B | 1M | EXL3 3,0 bpw | ExLlamaV3 | 218,2 GB de VRAM estimada | MIT |

## Limitaciones y advertencias

- Este repositorio no es un modelo nuevo: los pesos, la arquitectura y el tokenizador son de DeepSeek-AI, y el autor del repack no ha entrenado ni ajustado nada.
- El layout es propietario del ecosistema mlx-serve + mlx-stream. Transformers, vLLM y ExLlamaV3 no pueden leerlo; para esos entornos hay que usar el release original o la cuantizacion EXL3 de Mia-AiLab.
- Requiere hardware Apple Silicon con 128 GB o mas de memoria unificada y un SSD rapido; no es desplegable en GPU CUDA ni en equipos con menos RAM.
- El rendimiento depende fuertemente de la velocidad de lectura del SSD y del tamaño de la cache de expertos, lo que puede introducir latencia variable en funcion del patron de enrutamiento.
- Riesgo de alucinacion y sesgos: no se documentan sesgos especificos ni tasas de alucinacion en la informacion disponible; al no haber benchmarks publicados para este repack, se aplican las limitaciones del modelo base, no evaluadas aqui.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- La cuantizacion EXL3 a 3,0 bpw de los expertos puede degradar la calidad respecto a los pesos originales en FP8/FP16; no se aportan metricas de esa perdida.
- Licencia MIT: permite uso comercial, pero hay que conservar los avisos de copyright de DeepSeek-AI y respetar los terminos del modelo base.
- El repo tiene muy poca adopcion (212 descargas y 2 likes), por lo que la validacion por terceros es practicamente inexistente.

## Enlaces

- HuggingFace del repack: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3-3.0bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Cuantizacion EXL3 de origen: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-3.0bpw
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Plugin mlx-stream: https://github.com/davidtai/mlx-stream
- PR del plugin para mlx-serve: https://github.com/ddalcu/mlx-serve/pull/749
- Ficha del modelo en LLM Explorer: https://llm-explorer.com/model/Mia-AiLab%2FDeepSeek-V4.1-Flash-EXL3-3.0bpw,2haETQL8RoOTMM0OUf9Wqx
- Guia de DeepSeek V4.1 Flash (deepseekagent.io): https://deepseekagent.io/deepseek-v4-1-flash
- Guia de API y migracion (deepseek-v4.io): https://deepseek-v4.io/deepseek-v4-1-flash
- Ficha en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4.1-flash/modelcard
