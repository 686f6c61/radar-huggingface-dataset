# moad20/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de vision, publicado en HuggingFace por el usuario moad20 bajo licencia Apache 2.0. Segun la model card, se trata de la generacion Qwen3.8 de la familia abierta de Qwen, construida sobre la base arquitectonica de Qwen3.5, y orientada a codificacion, trabajo profesional, investigacion y tareas agenticas de horizonte largo. El modelo es denso (no MoE), con 27.781.427.952 parametros reales segun los pesos en safetensors, y una longitud de contexto nativa de 262.144 tokens extensible hasta 1.000.000.

La arquitectura es un transformer hibrido: combina capas de atencion lineal (Gated DeltaNet) con capas de atencion con compuerta (Gated Attention) en un patron de 16 bloques repetidos, 64 capas en total, dimension oculta de 5120 y FFN de 17.408. Incluye prediccion multi-token (MTP) entrenada con varios pasos, lo que habilita decodificacion especulativa. El modelo acepta entrada de imagen y video ademas de texto, y expone control flexible del modo de razonamiento mediante los parametros `reasoning_effort` y `preserve_thinking`.

Es relevante porque un modelo denso de 27B con vision nativa, contexto de 256K y soporte declarado para vLLM, SGLang y TokenSpeed se situa en el rango desplegable en hardware de gama alta de una sola maquina, sin necesidad de infraestructura MoE. Ahora bien, el repositorio es una subida de terceros con 0 descargas y 1 like en el momento de la consulta, y la model card parece reproducir documentacion oficial de Qwen, por lo que la trazabilidad del artefacto no esta garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con codificador de vision; 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)), 64 capas |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; tag `qwen3_5`) |
| Dimension oculta | 5120 |
| Token embedding / LM output | 248.320 (padded) |
| Gated DeltaNet | 48 cabezas de atencion lineal para V, 16 para QK, dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV, dimension de cabeza 256, RoPE dim 64 |
| FFN (intermedia) | 17.408 |
| MTP (multi-token prediction) | Entrenado con multiples pasos |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido poco habitual en modelos densos de este tamano: de cada cuatro subcapas, tres son Gated DeltaNet (atencion lineal con estado recurrente) y una es Gated Attention (atencion clasica con compuerta). La consecuencia practica es que solo 16 de las 64 capas mantienen cache KV que crece con la longitud de secuencia; las 48 capas restantes operan con un estado recurrente de tamano fijo. Esto reduce drasticamente el coste de memoria en contextos largos frente a un transformer completamente atencional del mismo tamano. La capa de atencion usa 24 cabezas de consulta y 4 de clave-valor (GQA), con dimension de cabeza 256 y RoPE de dimension 64. El vocabulario es de 248.320 entradas con padding.

Segun la model card, el modelo ha pasado por preentrenamiento y postentrenamiento, e incorpora MTP (Multi-Token Prediction) entrenado con multiples pasos, lo que suele emplearse como cabezal de decodificacion especulativa para acelerar la generacion. El modo de razonamiento esta activado por defecto, se puede desactivar por peticion, y su profundidad se ajusta con `reasoning_effort`, conservando el contexto de razonamiento de mensajes historicos mediante `preserve_thinking`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante el parametro `reasoning_effort`.
- Retencion del contexto de razonamiento de turnos anteriores con `preserve_thinking`.
- Codificacion: la model card declara mejoras en tareas de codificacion y de codificacion agentica en terminal.
- Trabajo profesional e investigacion: mejoras declaradas en tareas de investigacion y flujos profesionales.
- Ejecucion agentica: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Vision y video nativos: comprension de diagramas STEM, documentos e imagenes, y videos de hasta una hora de duracion.
- Formato conversacional multi-turno (tag `conversational`).
- Compatibilidad declarada con harnesses y herramientas de desarrollo populares.
- Soporte de decodificacion especulativa mediante el cabezal MTP (inferido de la seccion de arquitectura; no confirmado explicitamente como funcion de inferencia).
- Soporte de tool calling / function calling: la version alojada en Qwen Cloud se anuncia con herramientas integradas, pero no se detalla el soporte de function calling en los pesos abiertos.

## Casos de uso

- Agente de codificacion en terminal: integrado en un pipeline de CI/CD para leer trazas de compilacion, proponer parches y ejecutar comandos, aprovechando el soporte declarado de Terminal Bench 2.1 (Terminus) y la ventana de 262K tokens para cargar varios ficheros y logs en el mismo contexto.
- Analisis de documentacion tecnica y diagramas: al ser image-text-to-text, puede recibir esquemas de arquitectura, diagramas de circuito o tablas escaneadas junto al texto del repositorio y responder preguntas cruzadas entre la imagen y el codigo.
- Resumen y consulta de videos largos: la model card declara comprension de videos de escala horaria, util para extraer decisiones y tareas de grabaciones de reuniones tecnicas o ponencias.
- Asistente de soporte multi-turno: con 262.144 tokens de contexto nativo puede mantener historiales de conversacion muy largos y ficheros de configuracion adjuntos sin truncar, reduciendo la perdida de informacion entre turnos.
- Revision de codigo sobre repositorios grandes: cargar un conjunto amplio de ficheros y revisar coherencia entre modulos, dado el contexto extensible hasta 1.000.000 de tokens.
- Extraccion y normalizacion de datos a partir de documentos con imagenes: facturas, formularios o papers con figuras, generando salida estructurada.
- Investigacion asistida: sintesis de literatura con razonamiento profundo activado (`reasoning_effort` alto) para tareas de analisis, y modo de pensamiento desactivado para tareas de extraccion rapida por lotes.
- Automatizacion de tareas de oficina y trabajo profesional: redaccion, resumen y transformacion de documentos con control del nivel de razonamiento para equilibrar coste y latencia.

## Benchmarks y rendimiento

La model card incluye tablas de resultados comparativas frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizadas por categorias. Sin embargo, los valores numericos no estan disponibles en la informacion proporcionada: la extraccion del contenido se interrumpe en la primera fila de resultados. No se han podido recuperar cifras verificables de MMLU, HumanEval, GSM8K ni de los benchmarks especificos listados.

| Benchmark | Categoria | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Codificacion agentica en terminal | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de benchmarks de la model card | Codificacion, trabajo profesional, investigacion, agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

Los resultados de busqueda web proporcionados no contienen informacion tecnica sobre el modelo: corresponden a perfiles de LinkedIn de personas sin relacion con el proyecto.

## Requisitos de hardware

- VRAM para pesos en BF16/FP16: aproximadamente 55,6 GB (coincide con el tamano del repositorio). Requiere GPU de 80 GB (A100 80GB, H100 80GB, H200) o reparto en varias GPU.
- VRAM para pesos en FP8/INT8: aproximadamente 28 GB. Cabe en A100 40GB, L40S 48GB o dos RTX 4090 de 24 GB.
- VRAM para pesos en INT4: aproximadamente 14-16 GB. Cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) y GPUs consumer de gama alta, siempre que se generen cuantizaciones (no publicadas en el repositorio).
- Cache KV: dado que solo 16 de las 64 capas son atencionales, con 4 cabezas KV de dimension 256 el coste estimado es de unos 64 KB por token en BF16, es decir unos 2 GB a 32K tokens, 8 GB a 128K y 16 GB a 256K. Las 48 capas Gated DeltaNet usan estado recurrente de tamano fijo (del orden de decenas de MB por secuencia), por lo que no crecen con el contexto. Estas cifras son estimaciones calculadas a partir de la arquitectura publicada, no datos oficiales.
- GPU recomendadas: H100 80GB o A100 80GB para BF16 sin cuantizar; A100 40GB o L40S para FP8; RTX 4090/5090 para INT4.
- Opciones de despliegue: la model card menciona compatibilidad con HuggingFace Transformers, vLLM, SGLang y TokenSpeed. No se menciona soporte de llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- API gestionada: Qwen Cloud ofrece una version alojada con 1M de contexto por defecto y herramientas integradas (anunciada como proxima).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (moad20) | 27,78B densos | 262.144 nativo, hasta 1.000.000 | Si (imagen y video) | Apache 2.0 | Pesos en safetensors, 0 descargas | no disponible |
| Qwen3.6-27B | no disponible (referencia en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible (referencia en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | ~30B (segun nombre) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | propietaria | API | no disponible |

Los cuatro modelos de comparacion aparecen unicamente como columnas de las tablas de benchmark de la model card. No se dispone de sus especificaciones tecnicas ni de los valores numericos de la comparacion.

## Limitaciones y advertencias

- Repositorio de terceros: el autor es moad20, no el equipo de Qwen. Con 0 descargas y 1 like, el artefacto no tiene validacion de la comunidad ni trazabilidad verificada respecto a los pesos oficiales.
- Model card aparentemente reproducida: el texto incluye enlaces a Qwen Cloud y descripciones propias de la documentacion oficial de Qwen, lo que sugiere una copia. No hay confirmacion de que los pesos correspondan a esa documentacion.
- Nomenclatura no verificable: no se ha podido confirmar de forma independiente la existencia de una generacion "Qwen3.8" ni la procedencia de los pesos. Conviene validar el hash de los ficheros antes de usarlos en produccion.
- Benchmarks no verificados: los valores de las tablas comparativas no estan disponibles en la informacion proporcionada y no se han podido contrastar con fuentes independientes.
- Idiomas no documentados: no se declara la lista de idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad. Como en cualquier modelo generativo, la salida debe verificarse, especialmente en contextos de codigo, datos medicos o legales.
- Sesgos: no hay informacion sobre evaluaciones de sesgo, composicion del dataset ni procesos de alineacion (RLHF/DPO no documentados).
- Cuantizaciones no publicadas: no hay GGUF, GPTQ ni AWQ en el repositorio, por lo que el uso en hardware consumer exige generar la cuantizacion por cuenta propia, con el riesgo de degradacion asociado.
- Coste de despliegue: en BF16 el modelo ocupa unos 56 GB, lo que excluye GPU de 24 GB sin cuantizar.
- Capacidades anunciadas sin verificar: la comprension de video de escala horaria y el soporte de harnesses de desarrollo se declaran en la model card pero no se acompanan de datos reproducibles.
- Licencia: Apache 2.0 permite uso comercial, pero esa licencia solo es aplicable si los pesos son efectivamente derivados legitimos de la familia Qwen. La responsabilidad de verificar el origen recae en quien despliega el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moad20/Qwen3.8-27B
- Qwen Cloud: https://www.qwencloud.com
- Pagina de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Paper, repositorio de codigo o demo oficial: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a perfiles de LinkedIn sin relacion con el proyecto
