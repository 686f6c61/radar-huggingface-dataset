# Agnes-AI/Agnes-3.0-Flash

## Resumen

Agnes-3.0-Flash es un modelo multimodal de pesos abiertos desarrollado por Agnes AI (Agnes-AI), una compania que entrena sus propios modelos fundacionales en texto, imagen, video y razonamiento. El modelo se distribuye en HuggingFace con licencia Apache 2.0 y esta orientado a tareas de razonamiento, generacion de codigo y seguimiento de instrucciones, con soporte declarado de tool calling y esfuerzo de razonamiento ajustable. Su pipeline oficial es image-text-to-text, por lo que acepta texto, imagenes y video como entrada.

El checkpoint publicado contiene 33.090.501.680 parametros (aproximadamente 33,1 mil millones) en formato safetensors, con un repositorio de 66,2 GB. La ventana de contexto declarada es de 262.144 tokens, lo que lo situa en la categoria de contexto largo. Las etiquetas del repositorio incluyen `hybrid-attention`, `multimodal`, `long-context` y `custom_code`, lo que indica que la implementacion requiere codigo personalizado y no solo la clase estandar de transformers.

Su relevancia actual radica en la combinacion de tamano contenido (33B, ejecutable en hardware no insignia con cuantizacion) y capacidades multimodales con contexto de 256K, en un segmento donde la mayoria de alternativas con contexto comparable superan los 100B de parametros totales o son propietarias. El modelo suma 34 descargas y 40 likes en el momento de la consulta, y fue creado el 11 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; las etiquetas indican `hybrid-attention` y transformer multimodal |
| Parametros totales | 33.090.501.680 (33,09B) |
| Parametros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con `custom_code` para la carga) |

Otros datos del repositorio: libreria `transformers`, pipeline `image-text-to-text`, tamano del repo 66,2 GB, creado y actualizado el 2026-09-11, region `us`.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a un transformer multimodal con atencion hibrida (`hybrid-attention`) y soporte de contexto largo. La presencia de la etiqueta `custom_code` implica que el modelo necesita codigo propio incluido en el repositorio para su carga, lo que suele asociarse a variantes de atencion no estandar (por ejemplo, combinaciones de atencion completa y atencion lineal o dispersa). No se especifica el numero de capas, dimension oculta, numero de cabezas ni el tipo exacto de esquema de atencion.

Tampoco se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card menciona "esfuerzo de razonamiento ajustable" (adjustable reasoning effort), lo que sugiere soporte de modos de pensamiento con distinto presupuesto de computo, pero no se detalla el mecanismo ni el proceso de entrenamiento asociado. No hay informacion disponible sobre decodificacion especulativa ni sobre innovaciones tecnicas concretas mas alla de lo citado.

## Capacidades

- Generacion de texto y razonamiento: orientado a tareas de razonamiento de varios pasos, con resultados declarados en GPQA Diamond y AA-LCR.
- Generacion de codigo: evaluado en SciCode; la documentacion oficial lo describe como modelo para coding agentico y tareas dirigidas por herramientas.
- Comprension de imagen: el pipeline es `image-text-to-text`, por lo que acepta imagenes junto a texto.
- Comprension de video: la model card afirma explicitamente comprension de texto, imagen y video.
- Tool calling / function calling: soportado segun la model card.
- Razonamiento con esfuerzo ajustable: permite configurar el nivel de razonamiento (thinking mode), sin detalle publico del parametro exacto.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos o historiales de conversacion prolongados.
- Multilingue limitado: solo ingles y chino declarados.
- Conversacional: etiqueta `conversational` en el repositorio, orientado a dialogos multi-turno.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 262.144 tokens de contexto, el modelo puede ingerir manuales, especificaciones o bases de codigo completas en una sola llamada y responder preguntas sobre secciones concretas sin necesidad de fragmentar el texto.
- Coding agentico en pipelines de CI/CD: gracias al soporte de tool calling, puede integrarse en flujos que invocan linters, compiladores o ejecutores de tests, iterando sobre errores de compilacion y generando parches de forma autonoma. Su evaluacion en SciCode respalda el uso en codigo cientifico y numerico.
- Asistente de atencion al cliente multi-turno: la ventana de 256K permite mantener historiales de conversacion muy largos sin perder contexto, util en soporte tecnico donde el cliente aporta multiples mensajes y adjuntos.
- Revision de documentos con imagenes: al aceptar entrada de imagen, sirve para extraer y razonar sobre diagramas, capturas de pantalla o figuras incluidas en informes, combinando OCR implicito con analisis textual.
- Analisis de video para resumenes o extraccion de eventos: la comprension de video permite generar resumenes, transcripciones estructuradas o descripciones de escenas en flujos de monitorizacion o catalogacion de contenido.
- Razonamiento cientifico asistido: el resultado declarado en GPQA Diamond (85,05) lo hace apto como asistente de preguntas de nivel doctorado en fisica, quimica y biologia, con la advertencia de verificacion humana por riesgo de alucinacion.
- Generacion de codigo en produccion con verificacion: puede generar funciones y tests, apoyandose en tool calling para ejecutar la suite de pruebas antes de proponer el cambio, reduciendo la tasa de errores no detectados.
- Procesamiento documental bilingue ingles-chino: para organizaciones que operan en ambos idiomas, permite traduccion, resumen y extraccion de entidades sin cambiar de modelo.

## Benchmarks y rendimiento

Los datos proceden de la model card. El propio autor advierte que las cifras se compilaron de fuentes, harnesses y snapshots distintos y no constituyen una comparacion controlada. Se reproducen tal cual, sin verificar.

| Benchmark | Agnes-3.0-Flash | Qwen3.6-35B-A3B | Kimi K2.5 | Muse Glimmer (30B) | Qwen3.5 (27B) | DeepSeek V4 Flash 0731 | Qwen3.8 (27B) | Gemini 3.5 Flash | Qwen3.8 Flash Next | MiniMax M3 |
|---|---|---|---|---|---|---|---|---|---|---|
| IFBench | 74,20 | 64,4 | 43,7 | 77,0 | 75,6 | 75,8 | 79,5 | 76,3 | 81,3 | 82,9 |
| SciCode | 38,08 | 35,8 | 39,6 | 43,6 | 39,5 | 50,3 | 46,6 | 53,1 | 50,6 | 45,4 |
| GPQA Diamond | 85,05 | 84,1 | 78,9 | 83,5 | 85,8 | 90,8 | 90,5 | 92,2 | 92,3 | 92,9 |
| AA-LCR | 68,33 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La fila de AA-LCR aparece truncada en la informacion disponible: solo se dispone del valor de Agnes-3.0-Flash. No se han facilitado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks habituales.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 33,09B de parametros, no confirmada por el autor):
  - FP16 / BF16: en torno a 66 GB de pesos mas cache KV, lo que exige multiples GPU o una GPU de 80 GB.
  - INT8: aproximadamente 33 GB de pesos, viable en una A100 40GB o L40S 48GB con margen limitado.
  - 4 bits: en torno a 17-18 GB de pesos, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 5090, segun el overhead de la cache KV para contexto largo.
- GPU recomendadas: H100 80GB o A100 80GB para FP16/BF16 sin cuantizar; A100 40GB, L40S o RTX 6000 Ada para INT8; RTX 4090/5090 para cuantizacion de 4 bits.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas de 24 GB o mas y con cuantizacion agresiva, aunque no hay confirmacion oficial ni cuantizaciones publicadas en el repositorio.
- Nota critica de contexto: con 262.144 tokens, la cache KV puede consumir decenas de GB adicionales segun la implementacion de atencion; esto puede invalidar los calculos anteriores en escenarios de contexto completo.
- Opciones de despliegue: el repositorio esta preparado para `transformers` con `custom_code`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF en el repositorio limita el despliegue directo en llama.cpp/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa de tamano y disponibilidad; los datos de rendimiento son los de la tabla anterior. Solo se dispone de informacion de licencia y contexto para Agnes-3.0-Flash.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Agnes-3.0-Flash | 33,09B | 262.144 tokens | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3.6-35B-A3B | 35B totales / 3B activos (MoE) | No disponible | No disponible | No disponible |
| Muse Glimmer | 30B | No disponible | No disponible | No disponible |
| Qwen3.5 | 27B | No disponible | No disponible | No disponible |
| Kimi K2.5 | 1T totales / 32B activos (MoE) | No disponible | No disponible | No disponible |

En la comparativa de benchmarks facilitada, Agnes-3.0-Flash supera a Qwen3.6-35B-A3B en IFBench, SciCode y GPQA Diamond, y queda por debajo de Muse Glimmer y Qwen3.5 en SciCode, y de Qwen3.5 en GPQA Diamond. Frente a los modelos de mayor escala de la tabla (DeepSeek V4 Flash, Gemini 3.5 Flash, Qwen3.8 Flash Next, MiniMax M3), queda por debajo en GPQA Diamond y SciCode, y cerca en IFBench. No se dispone de datos de licencia ni contexto de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo ingles y chino declarados. No hay soporte confirmado de castellano ni de otras lenguas, por lo que su uso en produccion en espanol requeriria evaluacion previa.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni mecanismos de mitigacion. En tareas de razonamiento cientifico y codigo, la verificacion humana o automatica es imprescindible.
- Benchmarks no controlados: el propio autor advierte que las cifras provienen de fuentes y harnesses distintos, por lo que no deben tomarse como comparacion directa entre modelos.
- Carga con codigo personalizado: la etiqueta `custom_code` implica que el modelo requiere `trust_remote_code` y codigo incluido en el repositorio, lo que supone un riesgo de seguridad en entornos de produccion si no se audita.
- Sin cuantizaciones oficiales: la ausencia de GGUF, AWQ o GPTQ en el repositorio limita el despliegue en hardware de consumo y en runtimes ligeros.
- Adopcion muy baja: 34 descargas y 40 likes en el momento de la consulta, con una comunidad practicamente inexistente y pocos informes independientes de uso.
- Antiguedad y madurez: el repositorio se creo y actualizo el mismo dia (2026-09-11), sin historial de revisiones que permita evaluar estabilidad.
- Sesgos: no disponibles. No hay informacion sobre composicion del dataset ni evaluaciones de sesgo.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No se documentan restricciones adicionales.
- Sin datos de contexto multilingue real: aunque el modelo acepta 262.144 tokens, no se especifica como se comporta el rendimiento a longitudes cercanas al maximo.

## Enlaces

- HuggingFace: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Web oficial de Agnes AI: https://agnes-ai.com/
- Documentacion de Agnes 3.0 Flash: https://www.agnes-ai.com/en/docs/agnes-30-flash
- Assets de benchmarks referenciados en la model card: `assets/agnes_benchmarks.svg` (ruta relativa dentro del repositorio de HuggingFace)
- Logo referenciado en la model card: `assets/agnes_logo.svg` (ruta relativa dentro del repositorio de HuggingFace)

No se han encontrado papers, repositorios de codigo adicionales ni demos publicas en los resultados de busqueda disponibles.
