# AIArchiveInfo/MiniCPM5-2B

## Resumen

MiniCPM5-2B es un modelo de lenguaje de tipo Transformer denso con 2.516.756.480 parámetros (aproximadamente 2,52 mil millones), desarrollado por OpenBMB y publicado originalmente como `openbmb/MiniCPM5-2B`. La ficha que se analiza aquí, `AIArchiveInfo/MiniCPM5-2B`, es un espejo de preservación byte a byte de la revisión `12a3808a956f` del repositorio original, archivado el 25 de septiembre de 2026. No se ha reentrenado, ajustado ni modificado ningún peso; la licencia Apache 2.0 se mantiene y sigue rigiendo la copia.

El modelo es el segundo de la serie MiniCPM5, tras MiniCPM5-1B, y reutiliza la misma receta de entrenamiento escalada. Está orientado a despliegue local, en dispositivo y en entornos con recursos limitados, con etiquetas explícitas de contexto largo, tool calling y edge AI. Según el autor, alcanza el estado del arte en código abierto dentro de la clase de 2B y se mantiene competitivo frente a modelos de la clase 4B, con ventajas en código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas.

Su relevancia actual reside en el segmento de modelos pequeños: permite ejecutar un modelo conversacional con soporte de agentes en hardware de consumo, sin depender de APIs externas ni de GPUs de centro de datos. Los idiomas declarados son inglés y chino, y los pesos se distribuyen en formato safetensors con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta de arquitectura `llama` en HuggingFace) |
| Parametros totales | 2.516.756.480 (2,52 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el autor lo etiqueta como `long-context`, sin cifra publicada en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales del repositorio: tamano del repo de 5,0 GB, pipeline `text-generation`, licencia incluida de forma literal en el espejo, 0 descargas y 0 likes en el momento del archivo, creado el 2026-09-25T18:26:13Z y actualizado el 2026-09-25T18:26:15Z.

## Arquitectura y entrenamiento

Se trata de un Transformer denso de 2,52 B de parametros construido sobre la misma receta que MiniCPM5-1B, escalada en tamano. El repositorio declara la etiqueta de arquitectura `llama`, por lo que se espera una estructura decoder-only estandar con atencion causal, tokenizador compatible con la familia y pesos en safetensors cargables con transformers. No se detallan en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la implementacion concreta de la atencion para contexto largo.

Los datasets citados en las etiquetas del repositorio abarcan varias fases del entrenamiento: `openbmb/Ultra-FineWeb`, `openbmb/UltraX-Preview` y `openbmb/Ultra-FineWeb-L3` para preentrenamiento de lenguaje; `openbmb/UltraData-Math` y `openbmb/UltraData-Code` para matematicas y codigo; `openbmb/UltraData-SFT-2605` y `openbmb/UltraData-SFT-Agent-2609` para ajuste supervisado y comportamiento agentico; y `openbmb/UltraData-RL-2609` para una fase de aprendizaje por refuerzo. No se especifica el numero total de tokens de entrenamiento, la composicion porcentual del corpus ni los detalles del algoritmo de alineacion (RLHF, DPO u otro). Los informes tecnicos enlazados por el autor son el MiniCPM Tech Report (arXiv 2506.07900) y el trabajo arXiv 2602.09003. La model card disponible en la busqueda aparece truncada, por lo que parte de la informacion tecnica y grafica no ha podido recuperarse.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con pipeline `text-generation` y compatibilidad declarada con text-generation-inference y endpoints.
- Razonamiento sobre codigo y matematicas, respaldado por los conjuntos UltraData-Code y UltraData-Math y por la comparativa de capacidades publicada por el autor.
- Comprension de contexto largo, segun la etiqueta `long-context` del repositorio; no se publica la longitud de ventana concreta en la informacion disponible.
- Tool calling y function calling, indicado tanto en las etiquetas como en la descripcion de ventajas del modelo.
- Tareas agenticas y razonamiento multi-paso, con datos de ajuste especificos de agentes (UltraData-SFT-Agent-2609) y una fase de RL (UltraData-RL-2609).
- Seguimiento de instrucciones, representado como uno de los ejes de la comparativa de capacidades de la model card.
- Despliegue en dispositivo y en el borde (etiquetas `on-device` y `edge-ai`), orientado a entornos con memoria limitada.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede gestionar dialogos multi-turno en ingles o chino directamente en el portatil o en el dispositivo del usuario, sin enviar datos a servicios externos, gracias a su tamano de 2,52 B de parametros, que permite cuantizacion a precision reducida.
- Automatizacion de agentes con herramientas: su soporte de tool calling y su ajuste sobre datos de agentes lo hacen adecuado para orquestar llamadas a APIs, consultas a bases de datos o busquedas web dentro de flujos multi-paso.
- Generacion de codigo en entornos de desarrollo: puede integrarse en editores o en pipelines de CI/CD para autocompletado, generacion de tests o revision de fragmentos, apoyandose en los datos de codigo de UltraData-Code; conviene validar la salida con linters y pruebas antes de fusionar.
- Analisis de documentos largos: con la etiqueta de contexto largo, es utilizable para resumir informes, extraer entidades de contratos o responder preguntas sobre transcripciones extensas, siempre que la longitud real de ventana se confirme en la documentacion del autor.
- Atencion al cliente de bajo coste: al ser un modelo pequeno y con licencia Apache 2.0, permite desplegar clasificacion de intenciones y respuestas de primera linea en instancias modestas, reservando modelos mayores para los casos escalados.
- Soporte educativo en matematicas: la combinacion de datos de matematicas y razonamiento paso a paso lo hace apropiado para resolver ejercicios y explicar procedimientos, con verificacion humana del resultado.
- Procesamiento en el borde y sin conectividad: en escenarios industriales o sanitarios con redes aisladas, el modelo puede ejecutarse localmente para tareas de resumen, extraccion y dialogo tecnico.
- Investigacion sobre modelos pequenos: sirve como punto de partida para experimentos de destilacion, cuantizacion o ajuste fino con LoRA, dado su tamano contenido y su distribucion en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluida en la busqueda solo contiene una comparativa radar cualitativa (Code Reasoning, Math Reasoning, Instruction Following y otros ejes normalizados al 100 % por eje) y una afirmacion de estado del arte en la clase 2B, sin cifras numericas de MMLU, HumanEval, GSM8K u otros conjuntos. No se deben extrapolar valores a partir de esa grafica.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (no son datos publicados por el autor): en bf16/fp16, aproximadamente 5 GB solo de pesos, con 6-8 GB reales contando cache KV y overhead; en int8, del orden de 2,5-3,5 GB; en int4, del orden de 1,5-2,5 GB.
- Cabe en GPU de consumo: si se confirman las estimaciones anteriores, es viable en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) en cuantizacion de 8 o 4 bits, y en precision completa en tarjetas de 12 GB o superiores.
- GPU de centro de datos: A100, H100, L40S o similares permiten inferencia en precision completa con lotes grandes y contextos largos.
- Aceleradores de borde: al estar etiquetado como `on-device` y `edge-ai`, esta pensado para hardware local, aunque no se publican requisitos minimos oficiales ni plataformas certificadas.
- Opciones de despliegue: el repositorio declara compatibilidad con transformers y con text-generation-inference, ademas de `endpoints_compatible`. No se documentan en la informacion disponible recetas oficiales para llama.cpp, Ollama, vLLM o TGI, ni ficheros GGUF publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-2B | 2,52 B | no disponible | apache-2.0 | Objeto de esta ficha; el autor lo situa como SOTA de la clase 2B y competitivo frente a modelos 4B |
| MiniCPM5-1B | no disponible (denominacion comercial "1B") | no disponible | no disponible en la informacion proporcionada | Primer modelo de la serie MiniCPM5; misma receta de entrenamiento, menor escala |
| Modelos abiertos de la clase 1-3 B (por ejemplo Qwen, Llama, Gemma o SmolLM en sus variantes pequenas) | no disponible | no disponible | no disponible | Categoria de referencia por tamano y orientacion a despliegue local; no se aportan datos comparativos en la informacion proporcionada |

No se dispone de datos verificados de rendimiento, contexto o licencia de los modelos alternativos dentro de la informacion facilitada, por lo que la comparacion cuantitativa queda marcada como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta en la informacion proporcionada ningun analisis de sesgos, toxicidad o representacion.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; el tamano reducido de 2,52 B aumenta la probabilidad de errores factuales en dominios especializados. Se recomienda verificacion externa en usos criticos.
- Cobertura idiomatica limitada: solo se declaran ingles y chino. El castellano no figura entre los idiomas soportados, por lo que el rendimiento en espanol es incierto y no esta respaldado por el autor.
- Longitud de contexto: aunque se etiqueta como `long-context`, no se publica la cifra concreta, lo que impide planificar despliegues con documentos de longitud conocida.
- Estado del espejo: `AIArchiveInfo/MiniCPM5-2B` no es el repositorio original, sino una copia byte a byte de la revision `12a3808a956f` sin garantia de mantenimiento, actualizacion ni soporte por parte del autor. Para incidencias conviene acudir al repositorio de OpenBMB.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. No se incluyen en el repositorio pesos GGUF ni artefactos cuantizados con licencias propias.
- Compatibilidad de despliegue: no se documentan recetas oficiales para llama.cpp, Ollama o vLLM en la informacion disponible; la integracion con estas herramientas requiere validacion propia.
- La model card obtenida en la busqueda esta truncada, de modo que parte de la informacion tecnica y de las tablas de rendimiento puede faltar. Debe consultarse el repositorio original antes de tomar decisiones de produccion.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces listados a continuacion proceden de la propia model card.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/AIArchiveInfo/MiniCPM5-2B
- Repositorio original: https://huggingface.co/openbmb/MiniCPM5-2B
- Revision archivada: https://huggingface.co/openbmb/MiniCPM5-2B/tree/12a3808a956f869c767195e9266b59c4d21d92e2
- Modelo anterior de la serie: https://huggingface.co/openbmb/MiniCPM5-1B
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- Segundo trabajo citado: https://arxiv.org/abs/2602.09003
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Wiki en chino: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Corpus UltraData: https://ultradata.openbmb.cn/
- Demo en linea: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
