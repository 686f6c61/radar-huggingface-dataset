# bouroo/Qwopus3.8-27B-Coder-Flash-GGUF

## Resumen

Qwopus3.8-27B-Coder-Flash-GGUF es la conversión a formato GGUF del checkpoint Jackrong/Qwopus3.8-27B-Coder-Flash, un ajuste fino orientado a código sobre la base Qwen3.8-27B. El repositorio lo publica el usuario bouroo y contiene tres artefactos: el modelo objetivo cuantizado en MXFP4 (4 bits), una cabeza MTP (multi-token prediction) separada en Q8_0 para decodificación especulativa y un proyector de visión en F16. Con 27.320.697.856 parámetros totales, el objetivo ocupa aproximadamente 15,0 GB, lo que lo sitúa en el rango de modelos desplegables en estaciones de trabajo con GPU de 24 GB o en Apple Silicon con memoria unificada.

El modelo resuelve el problema de ejecutar un modelo multimodal de 27B con capacidades de código, razonamiento y tool calling en hardware de consumo, mediante cuantización MXFP4 de las capas lineales y manteniendo en mayor precisión las partes sensibles (embeddings en Q8_0, normas en BF16/F32, cabeza de salida en Q6_K). La inclusión de la cabeza MTP como drafter independiente permite activar decodificación especulativa con `draft-mtp` en llama.cpp o con la especulación DFlash2 de Splash.

Su relevancia actual radica en que combina tres elementos poco habituales en un mismo paquete GGUF: multimodalidad (texto, imagen y vídeo vía proyector), decodificación especulativa integrada y una licencia Apache-2.0 heredada del checkpoint original, lo que facilita su uso comercial. El repositorio no incluye información sobre idiomas soportados ni resultados de benchmarks formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas SSM/GDN (alpha y beta), 64 capas más una capa MTP (`blk.64`), `qwen35.nextn_predict_layers = 1`; visión con torre de 27 capas y merger |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (lineales), Q8_0 (embeddings, GDN alpha/beta, cabeza MTP), Q6_K (cabeza de salida), BF16/F32 (normas); proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (866 tensores en el objetivo; `block_mxfp4`, GGML type 39) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, del que este repositorio es una conversión cuantizada, no un entrenamiento nuevo. La arquitectura combina atención con capas de estado recurrente (GDN, con parámetros `ssm_alpha` y `ssm_beta`), 64 capas más una capa adicional de predicción multi-token (`blk.64`) y un codificador visual independiente de 27 capas con merger. El pipeline declarado es `image-text-to-text`, y el modelo reporta modalidades de texto, visión y vídeo.

El proceso de conversión, documentado en la model card, parte del checkpoint en safetensors: primero se genera un GGUF BF16 con `convert_hf_to_gguf.py`, después se cuantizan los lineales con `llama-quantize` usando un fichero de tipos por tensor (`tt_common.txt`) y el tipo base `MXFP4_MOE`, y por separado se exportan la cabeza MTP (`--mtp`, cuantizada a Q8_0) y el proyector visual (`--mmproj`, en F16). No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ni detalles del ajuste fino de Jackrong.

La innovación técnica destacable es la separación de la cabeza MTP como drafter independiente, que habilita decodificación especulativa nativa en llama.cpp (`--spec-type draft-mtp`) y en Splash (especulación DFlash2, con 4,6 tokens aceptados por ciclo según la verificación del autor).

## Capacidades

- Generación de texto y código, con orientación explícita a tareas de programación (el sufijo "Coder" del checkpoint base).
- Razonamiento con modo de pensamiento activado por defecto en Splash.
- Capacidades multimodales: entrada de imágenes y vídeo mediante el proyector F16, con pipeline `image-text-to-text`.
- Soporte de tool calling y function calling, incluyendo salida con JSON Schema en la API de Splash.
- Capacidades de agente y razonamiento multi-paso (etiquetas `agent`, `tool-use`).
- Decodificación especulativa mediante cabeza MTP (Q8_0) para acelerar la generación.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints OpenAI (Chat Completions, Responses, Completions) y Anthropic Messages a través de Splash.

## Casos de uso

- Asistencia de programación en local: el modelo puede generar y completar funciones en lenguajes como Python (el ejemplo de la model card es una función que fusiona intervalos solapados), ejecutándose en una estación de trabajo sin depender de la nube gracias al objetivo MXFP4 de 15 GB.
- Revisión de código con capturas de pantalla: al aceptar imágenes, puede analizar diagramas de arquitectura, mensajes de error en pantalla o diffs renderizados y proponer correcciones, útil en herramientas de revisión de pull requests.
- Agentes de automatización con tool calling: integrado en Splash con salida JSON Schema, puede encadenar llamadas a funciones (consulta de APIs, ejecución de comandos) en flujos multi-paso para tareas de DevOps.
- Generación de código en pipelines de CI/CD: la API compatible con OpenAI permite sustituir un endpoint remoto por una instancia local de Splash y usar el modelo para generar tests, documentación o parches automáticos.
- Análisis de documentación técnica con PDFs: Splash admite PDFs en línea junto con imágenes, de modo que el modelo puede responder preguntas sobre manuales o especificaciones adjuntas en la conversación.
- Prototipado en Apple Silicon: con 50,5 tok/s de decodificación y TTFT de 0,9 s reportados en un M4 Pro con Splash, es viable para asistentes interactivos de código en portátiles con memoria unificada suficiente.
- Extracción estructurada de información: la salida con JSON Schema permite convertir texto libre o capturas en registros estructurados para bases de datos o sistemas de tickets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta mediciones locales de velocidad de inferencia, no de calidad:

| Metrica | Valor | Entorno |
|---|---|---|
| Generacion (llama.cpp, Metal) | 14,2 tok/s | Apple M4 Pro |
| Decodificacion (Splash) | 50,5 tok/s | Apple M4 Pro |
| TTFT (Splash) | 0,9 s | Apple M4 Pro |
| Tokens aceptados por ciclo (DFlash2) | 4,6 | Apple M4 Pro |

## Requisitos de hardware

- VRAM estimada: en torno a 15 GB para el objetivo MXFP4, más aproximadamente 2,9 GB del drafter MTP Q8_0 si se usa decodificación especulativa, más el proyector visual F16 (tamaño no especificado en la información disponible). Presupuesto práctico: 18-20 GB de memoria para el conjunto completo.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; en Apple Silicon, equipos con memoria unificada de 24 GB o más (el autor verifica funcionamiento en M4 Pro).
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con el objetivo solo; con drafter y proyector conviene margen adicional o cuantizaciones más agresivas no documentadas en este repositorio.
- Opciones de despliegue: llama.cpp (CLI y servidor), Splash (servidor con API OpenAI y Anthropic, kernels Metal para MXFP4), y cualquier runtime que cargue `block_mxfp4` (GGML type 39).
- Latencia y throughput: 14,2 tok/s en llama.cpp y 50,5 tok/s en Splash sobre M4 Pro; no hay datos para GPU NVIDIA en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo estructural:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-GGUF | 27,3B | no disponible | Apache-2.0 | GGUF (MXFP4) |
| Jackrong/Qwopus3.8-27B-Coder-Flash (base) | 27,3B | no disponible | Apache-2.0 | safetensors |
| Alternativas de 27B-32B con licencia permisiva | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las evaluaciones reportadas por el autor son ejecuciones locales pequeñas, no benchmarks estandarizados; no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K u otras pruebas.
- El código generado y las acciones de herramientas pueden ser incorrectos; se requiere validación humana en producción.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni idiomas soportados; se desconoce el comportamiento fuera del inglés y del chino (idiomas habituales en la familia Qwen, aunque no confirmado en esta ficha).
- La longitud de contexto no está especificada en la información disponible, lo que impide planificar cargas con ventanas largas.
- La cuantización MXFP4 puede degradar la precisión frente al checkpoint BF16 original; no se han publicado comparativas de calidad entre ambos.
- El soporte de MXFP4 depende de runtimes actualizados: llama.cpp lo carga como `block_mxfp4`, pero otras herramientas (vLLM, TGI, Ollama) no están verificadas en la información disponible.
- Aunque la licencia es Apache-2.0, conviene revisar la model card del checkpoint upstream (Jackrong/Qwopus3.8-27B-Coder-Flash) para confirmar condiciones y usos previstos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bouroo/Qwopus3.8-27B-Coder-Flash-GGUF
- Modelo base (checkpoint original): https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Splash (runtime con kernels Metal para MXFP4): https://github.com/incoai/splash
