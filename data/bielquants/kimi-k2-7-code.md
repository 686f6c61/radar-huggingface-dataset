# bielquants/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a tareas de programación y flujos de trabajo agénticos, desarrollado por Moonshot AI como evolución de Kimi K2.6. El repositorio analizado (`bielquants/Kimi-K2.7-Code`) es una publicación de terceros que redistribuye los pesos del modelo en formato comprimido mediante la librería `compressed-tensors`, con un tamaño de repositorio de 595,2 GB. El modelo declara 1.026.879.376.368 parámetros totales (aproximadamente 1 billón) y 32B parámetros activos por token.

La arquitectura combina 61 capas (una densa y el resto MoE) con atención MLA (Multi-head Latent Attention), 384 expertos de los cuales se seleccionan 8 por token más un experto compartido, y una ventana de contexto de 256K tokens. Incorpora además un codificador visual MoonViT de 400M parámetros, lo que lo convierte en un modelo multimodal de entrada imagen-texto y salida texto (`pipeline_tag: image-text-to-text`).

Su relevancia en el momento de publicación radica en el enfoque sobre tareas de código de horizonte largo: según la model card, mejora la finalización de tareas de ingeniería de software de extremo a extremo y reduce el consumo de tokens de razonamiento en aproximadamente un 30 % respecto a Kimi K2.6, lo que abarata la inferencia en agentes que encadenan muchas llamadas. La licencia es una variante de MIT modificada (`modified-mit`), registrada en HuggingFace como `license:other`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion MLA, activacion SwiGLU y codificador visual MoonViT |
| Parametros totales | 1.026.879.376.368 (aprox. 1T); el codificador visual aporta 400M adicionales |
| Parametros activos | 32B |
| Longitud de contexto | 256K tokens (262.144 en la configuracion de evaluacion) |
| Tipos de cuantizacion | Pesos redistribuidos en formato comprimido con la libreria `compressed-tensors`; el esquema exacto (bits, granularidad) no esta especificado en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | `modified-mit` (registrada como `license:other`, `license_name: modified-mit`) |
| Formato de pesos | safetensors con compresion `compressed-tensors` |
| Numero de capas | 61 (1 capa densa + 60 MoE) |
| Dimension de atencion oculta | 7168 |
| Dimension oculta MoE por experto | 2048 |
| Cabezas de atencion | 64 |
| Numero de expertos | 384 (8 seleccionados por token + 1 compartido) |
| Tamano de vocabulario | 160K |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 595,2 GB |
| Libreria | transformers (requiere `custom_code`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue un diseno transformer disperso (MoE) con atencion MLA, la misma familia de mecanismos empleada en la saga Kimi K2. La capa densa inicial se complementa con 60 capas MoE en las que cada token activa 8 de los 384 expertos, mas un experto compartido, lo que da una ratio de activacion de aproximadamente 32B sobre 1T parámetros (en torno al 3 %). La atencion MLA comprime las representaciones de clave-valor, un factor relevante para sostener una ventana de 256K tokens sin que la caché KV crezca de forma proporcional al numero de cabezas. La funcion de activacion es SwiGLU y el vocabulario alcanza las 160.000 entradas. El componente multimodal es un codificador MoonViT de 400M parámetros, que habilita la entrada de imagenes junto al texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO: la model card proporcionada no detalla la fase de entrenamiento. La innovacion declarada de forma explicita es la eficiencia de tokens de razonamiento, con una reduccion aproximada del 30 % en thinking tokens frente a Kimi K2.6, asi como mejoras en la completitud de tareas de codigo de horizonte largo. Las evaluaciones citadas se realizaron con el modo thinking activado, temperatura 1,0, top-p 0,95 y una ventana de 262.144 tokens, ejecutando el modelo mediante Kimi Code CLI.

Nota importante sobre la procedencia: el repositorio analizado pertenece al usuario `bielquants`, no a Moonshot AI. La model card incluida reproduce la del modelo original de Moonshot AI, por lo que los detalles de arquitectura y evaluacion describen el modelo base, no necesariamente la fidelidad numerica de esta redistribucion comprimida. No se documentan en la informacion disponible los pasos de cuantizacion aplicados, ni validacion de degradacion respecto al modelo original.

## Capacidades

- Generacion de codigo y resolucion de tareas de ingenieria de software de horizonte largo, con enfasis declarado en flujos de trabajo end-to-end.
- Razonamiento explicito en modo thinking, con un consumo de tokens de razonamiento aproximadamente un 30 % inferior al de Kimi K2.6.
- Comportamiento agéntico: la model card reporta evaluaciones especificas de agentes (Kimi Claw 24/7 Bench, MCP Atlas, MCP Mark Verified), lo que indica soporte para tareas multi-paso y uso sostenido.
- Soporte de herramientas via MCP (Model Context Protocol), segun las dos suites de evaluacion MCP incluidas.
- Capacidades multimodales de entrada imagen-texto gracias al codificador MoonViT de 400M parámetros (pipeline declarado: `image-text-to-text`).
- Contexto largo de 256K tokens, adecuado para repositorios completos, trazas largas o sesiones de agente prolongadas.
- Capacidades multilingues: no disponibles en la informacion proporcionada (la benchmark interna Kimi Code Bench V2 menciona tareas en mas de 10 lenguajes de programacion, pero no idiomas naturales).
- Extraccion de caracteristicas (`feature-extraction`) segun las etiquetas del repositorio.

## Casos de uso

- Agentes de codigo autonomos sobre repositorios completos: con 256K tokens de contexto y una ratio de activacion de 32B, el modelo puede cargar varios ficheros y trazas de error simultaneamente y planificar cambios multi-fichero sin perder el hilo de la tarea.
- Revisión de pull requests y deteccion de regresiones: el modelo puede analizar un diff junto con el contexto de los modulos afectados y generar comentarios tecnicos, apoyandose en su rendimiento declarado en Program Bench (53,6).
- Integracion en pipelines CI/CD: mediante MCP o llamadas a herramientas, puede invocarse desde un runner para ejecutar linters, interpretar la salida y proponer parches antes de abrir una incidencia.
- Atención al cliente tecnico multi-turno: la ventana de 256K permite arrastrar el historial completo de una incidencia, incluidos logs extensos, sin truncado agresivo.
- Analisis de documentacion tecnica con capturas de pantalla: al aceptar entrada de imagen, puede interpretar diagramas de arquitectura, capturas de paneles de error o mockups junto con texto de requisitos.
- Migraciones y refactorizaciones de gran alcance: la combinacion de contexto largo y modo thinking es adecuada para tareas que requieren mantener coherencia entre decenas de ficheros modificados en una misma sesion.
- Asistentes de IDE con soporte de herramientas: su eficiencia declarada en tokens de razonamiento reduce el coste por interaccion en escenarios de autocompletado y edicion asistida de alta frecuencia.
- Exploracion de bases de codigo desconocidas: puede generar resumenes estructurales de un proyecto a partir de multiples ficheros cargados en una sola ventana de contexto.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo (modo thinking, temperatura 1,0, top-p 0,95, contexto de 262.144 tokens):

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 (codigo) | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench (codigo) | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite (codigo) | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench (agentico) | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas (agentico) | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified (agentico) | 72,8 | 81,1 | 92,9 | 76,4 |

Segun las notas de la model card, Kimi Code Bench V2 es una benchmark interna con tareas de ingenieria de software en mas de 10 lenguajes de programacion y sobre pila de produccion, con enfasis en servicios de backend, infraestructura y rendimiento. Las cifras de GPT-5.5 y Claude Opus 4.8 corresponden a ejecuciones en Codex y Claude Code respectivamente, en modo xhigh, por lo que la comparacion no es estrictamente homogenea en cuanto al entorno de ejecucion. No se han facilitado resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

Cifras de VRAM para pesos, calculadas a partir del recuento real de parametros (1.026.879.376.368). Son estimaciones aritmeticas, no datos publicados por el autor:

- BF16/FP16: aproximadamente 2,05 TB solo para pesos (26 GPU H100 de 80 GB como minimo, sin margen para cache KV ni activaciones).
- FP8: aproximadamente 1,03 TB solo para pesos (unas 13 GPU H100 de 80 GB).
- Formato del repositorio (595,2 GB): equivale a unos 4,6 bits por parametro, es decir, unas 8 GPU H100 de 80 GB para los pesos, mas el margen necesario para cache KV, activaciones y buffers de comunicacion.
- INT4 puro: aproximadamente 514 GB de pesos.

Recomendaciones practicas segun lo anterior:

- No cabe en GPU de consumo. Ni una RTX 4090 (24 GB) ni un equipo de 4 o 8 RTX 4090 (96-192 GB) pueden alojar los pesos completos.
- Despliegue realista en nodos multi-GPU de centro de datos: H100 80 GB, H200 141 GB o A100 80 GB en configuraciones de 8 a 32 aceleradores, con interconnect de alta velocidad (NVLink/InfiniBand) para la comunicacion entre expertos.
- Despliegue con offload a CPU/RAM es teoricamente posible dado que solo 32B parámetros se activan por token, pero requeriria cientos de GB de RAM y no se confirma soporte en la informacion disponible.
- Opciones de despliegue: el repositorio esta etiquetado con `transformers` y `custom_code` y usa `compressed-tensors`, por lo que requiere un runtime compatible con ese formato. La compatibilidad concreta con vLLM, SGLang, TGI, llama.cpp u Ollama no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparacion limitada a los datos que aparecen en la model card. Los datos de parametros, contexto y licencia de los modelos comparados no se proporcionan, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Kimi Code Bench v2 | Program Bench | MCP Mark Verified |
|---|---|---|---|---|---|---|
| Kimi K2.7 Code | 1T totales / 32B activos | 256K | modified-mit | 62,0 | 53,6 | 81,1 |
| Kimi K2.6 | no disponible | no disponible | no disponible | 50,9 | 48,3 | 72,8 |
| GPT-5.5 | no disponible | no disponible | propietaria (no disponible en detalle) | 69,0 | 69,1 | 92,9 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria (no disponible en detalle) | 67,4 | 63,8 | 76,4 |

Frente al modelo del que deriva, Kimi K2.7 Code mejora en todos los benchmarks reportados: +11,1 puntos en Kimi Code Bench v2, +5,3 en Program Bench, +8,4 en MLS Bench Lite, +4,0 en Kimi Claw 24/7 Bench, +6,6 en MCP Atlas y +8,3 en MCP Mark Verified. Frente a las alternativas propietarias, queda por debajo de ambas en las seis metricas, con la mayor brecha en MCP Mark Verified frente a GPT-5.5 (-11,8 puntos) y en Program Bench frente a GPT-5.5 (-15,5 puntos).

No se dispone de datos de licencia, parametros ni contexto de los modelos propietarios comparados, ni de otras alternativas abiertas de la misma categoria, por lo que no es posible completar una comparativa mas amplia con la informacion disponible.

## Limitaciones y advertencias

- Procedencia del repositorio: la publicacion analizada pertenece a `bielquants`, un tercero, no a Moonshot AI. La model card reproduce la del modelo original y no documenta el proceso de compresion ni la perdida de calidad asociada. Conviene validar la fidelidad numerica contra el modelo original antes de usarlo en produccion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad factual en la informacion disponible. En tareas de codigo, esto se traduce en riesgo de APIs inexistentes, imports inventados o parches que compilan pero no resuelven el problema.
- Sesgos: no se han publicado analisis de sesgos para este modelo en la informacion disponible.
- Idiomas: la lista de idiomas naturales soportados no esta disponible; el soporte multilingue no puede confirmarse. Las benchmarks internas mencionan mas de 10 lenguajes de programacion, no idiomas naturales.
- Coste de inferencia: con 1T parámetros totales, el despliegue exige infraestructura multi-GPU de centro de datos. Esto limita el uso a entornos con presupuesto de computo elevado.
- Compatibilidad de runtime: el uso de `compressed-tensors` y `custom_code` implica dependencias especificas de `transformers` y compatibilidad no confirmada con otros servidores de inferencia.
- Licencia: se trata de una licencia MIT modificada. Las clausulas concretas de la modificacion no estan detalladas en la informacion disponible, por lo que es imprescindible revisar el fichero LICENSE antes de un uso comercial.
- Evaluaciones no homogeneas: las cifras de GPT-5.5 y Claude Opus 4.8 proceden de entornos distintos (Codex y Claude Code en modo xhigh), por lo que las comparaciones directas deben tomarse con cautela.
- Ventana de contexto: aunque soporta 256K tokens, no se ha publicado informacion sobre degradacion del rendimiento a esa longitud maxima.
- Fecha de publicacion: la model card incluye referencias a modelos y entornos posteriores a los habitualmente desplegados, y la fecha de creacion del repositorio figura como 2026-09-19. Conviene verificar la vigencia de todos los datos antes de citarlos.

## Enlaces

- Repositorio en HuggingFace (publicacion de terceros): https://huggingface.co/bielquants/Kimi-K2.7-Code
- Organizacion Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Fichero de licencia del modelo original: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Pagina de Kimi Code: https://www.kimi.com/code
- Web de Moonshot AI: https://www.moonshot.ai
- Cuenta de X/Twitter: https://twitter.com/kimi_moonshot
- Servidor de Discord: https://discord.gg/TYU2fdJykW
- Organizacion en ModelScope: https://modelscope.cn/organization/moonshotai

Nota: los resultados de busqueda web proporcionados (consultas sobre cursos de formacion en China) no contienen ningun enlace relevante al modelo, por lo que no se han incluido. No se dispone de enlaces a papers tecnicos, blogs de ingenieria o demos adicionales en la informacion facilitada.
