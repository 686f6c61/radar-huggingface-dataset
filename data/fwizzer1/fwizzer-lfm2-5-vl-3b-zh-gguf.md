# fwizzer1/Fwizzer-LFM2.5-VL-3B-ZH-GGUF

## Resumen

Fwizzer-LFM2.5-VL-3B-ZH-GGUF es una cuantizacion en formato GGUF de un ajuste fino multimodal sobre LiquidAI/LFM2.5-VL-3B, publicada por el usuario fwizzer1. El modelo combina un backbone de 2.690 millones de parametros con una torre de vision SigLIP2 de 400 millones, y esta orientado a tareas de razonamiento multimodal con cadena de pensamiento explicita en etiquetas `<think> ... </think>`. Su ventana de contexto declarada es de 32.768 tokens, ampliable hasta 131.000 segun la model card.

El ajuste se ha realizado sobre un dataset privado denominado `fwizzer1/fwizzer-v3-titan-agentic` (17.743 muestras del fichero `train_zh.parquet`), con foco en chino (`zh`) e ingles (`en`). El resultado se distribuye exclusivamente en GGUF, con tres niveles de cuantizacion (Q8_0, Q5_K_M y Q4_K_M) mas un proyector visual aparte en f16, lo que permite ejecutarlo en llama.cpp, LM Studio y Ollama.

Su relevancia practica es la de un VLM de ~3B ejecutable en hardware de consumo: OCR de pagina completa, analisis de esquemas y deteccion de objetos sobre imagen, ademas de generacion de codigo. Es un modelo con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados, por lo que debe tratarse como un artefacto experimental de la comunidad y no como una opcion validada en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Liquid Neural Network (backbone de 2,69B + torre de vision SigLIP2 de 400M), segun la model card |
| Parametros totales | ~3.090 millones (2,69B backbone + 400M vision tower) |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 32.768 tokens; hasta 131.000 con el backbone LFM, segun la model card |
| Tipos de cuantizacion | Q8_0 (~3,4 GB), Q5_K_M (~2,5 GB), Q4_K_M (~2,1 GB); proyector visual mmproj en f16 (~800 MB) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | license: other, license_name: lfm1.0 (terminos concretos no detallados) |
| Formato de pesos | GGUF (llama.cpp); el modelo base esta en safetensors, pero esta publicacion no los incluye |

## Arquitectura y entrenamiento

La model card describe el modelo como una "Hybrid Liquid Neural Network" con un backbone de 2.690 millones de parametros y una torre de vision SigLIP2 de 400 millones de parametros. El pipeline declarado en HuggingFace es `image-text-to-text`, es decir, entrada conjunta de imagen y texto con salida de texto. El proyector multimodal se distribuye de forma independiente como `mmproj-LFM2.5-VL-3B-f16.gguf`, algo habitual en llama.cpp para modelos con vision. No se detalla en la informacion proporcionada la composicion exacta de capas (atencion, convoluciones de corto alcance u otros componentes del backbone LFM).

El ajuste fino se realizo sobre un dataset privado, `fwizzer1/fwizzer-v3-titan-agentic`, del que solo se indica el fichero `train_zh.parquet` con 17.743 muestras. No se especifica el numero total de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO u otras alineaciones posteriores. Los tags incluyen `deepseek-r1`, `cot` y `chain-of-thought`, lo que sugiere un estilo de razonamiento heredado de modelos tipo R1 con trazas de pensamiento explicitas. Las etiquetas de la model card mencionan tambien `liquid` y `lfm2.5`, consistentes con la familia base de Liquid AI.

## Capacidades

- Generacion de texto y razonamiento analitico con cadena de pensamiento explicita dentro de `<think> ... </think>`.
- Comprension de imagen y texto combinados (modelo multimodal con proyector SigLIP2).
- OCR de pagina completa y layout parsing, segun la model card.
- Grounding de layout y deteccion de objetos sobre imagen.
- Analisis de geometria 3D y parsing procedural, orientado a herramientas como Blender 4.x y Godot 4.
- Generacion de codigo, incluyendo codigo con componente espacial o de escena.
- Soporte multilingue limitado a chino e ingles.
- No se menciona soporte de tool calling, function calling, uso agentico multietapa ni modo de audio en la informacion proporcionada. El nombre del dataset de entrenamiento incluye "agentic", pero no se detallan capacidades de agente verificables.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede extraer texto y estructura de paginas completas gracias al OCR y al layout parsing declarados, con un coste de VRAM bajo al ir cuantizado en Q5_K_M o Q4_K_M.
- Extraccion de datos de facturas y formularios en chino: al estar el ajuste orientado a `zh`, resulta adecuado para pipelines de captura documental en ese idioma que necesiten interpretar tablas y campos.
- Analisis de esquemas y diagramas tecnicos: la combinacion de vision y razonamiento permite describir planos, circuitos o diagramas de flujo y responder preguntas sobre ellos.
- Asistencia en desarrollo de videojuegos: el parsing procedural sobre Godot 4 y el soporte de generacion de codigo permiten convertir bocetos o capturas de escena en fragmentos de script o configuracion.
- Preprocesado para modelado 3D en Blender: el modelo puede interpretar referencias visuales y generar o comentar codigo de escena, sirviendo como paso previo a un flujo de trabajo manual.
- Moderacion y anotacion de imagenes con descripcion razonada: la salida en formato de cadena de pensamiento permite auditar por que se asigno una etiqueta, util para construir datasets anotados.
- Despliegue local en portatil con GPU de gama media: al ocupar entre 2,9 GB y 4,2 GB en disco segun cuantizacion, permite prototipado offline sin depender de APIs externas.
- Traduccion asistida de documentacion tecnica chino-ingles: el par de idiomas soportado coincide exactamente con el del ajuste, aunque no hay evaluacion publicada de calidad de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ningun otro conjunto de evaluacion, y tampoco se han encontrado referencias externas en la busqueda web realizada (los resultados obtenidos no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM para inferencia (estimacion derivada de los tamanos de fichero publicados, no de datos oficiales del autor):
  - Q4_K_M (~2,1 GB de pesos + ~800 MB de proyector): en torno a 4-5 GB con cache KV para contexto moderado.
  - Q5_K_M (~2,5 GB + ~800 MB): en torno a 5-6 GB.
  - Q8_0 (~3,4 GB + ~800 MB): en torno a 6-8 GB.
  - Con contexto cercano a 32.768 tokens la cache KV incrementa el consumo de forma apreciable; no se dispone de cifras oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070 o superiores) deberia poder ejecutar las cuantizaciones Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4_K_M y Q5_K_M; Q8_0 requiere algo mas de margen.
- Opciones de despliegue: llama.cpp (formato nativo), LM Studio (con deteccion automatica del `mmproj`) y Ollama, segun los tags. El soporte en vLLM o TGI con entrada de imagen no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Fwizzer-LFM2.5-VL-3B-ZH-GGUF | ~3,09B (2,69B + 400M vision) | 32.768 (hasta 131k) | zh, en | GGUF | lfm1.0 (other) | sin benchmarks publicados |
| LiquidAI/LFM2.5-VL-3B (modelo base) | ~3,09B (2,69B + 400M vision) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | lfm1.0 | no disponible en la informacion proporcionada |
| Otros VLM de ~3B (por ejemplo, familias Qwen2.5-VL-3B o SmolVLM2) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de terceros en la informacion proporcionada para establecer una comparativa cuantitativa fiable. La comparacion mas solida posible es contra el modelo base, del que se sabe que existe pero no se han facilitado especificaciones ni resultados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, por lo que no puede verificarse la calidad del ajuste frente al modelo base.
- Procedencia: modelo publicado por un autor individual, con cero descargas y cero likes en el momento de la consulta; no ha pasado por revision de la comunidad.
- Dataset de entrenamiento privado: no es auditable, no se conocen su composicion ni posibles sesgos.
- Riesgo de alucinacion: inherente a los modelos de ~3B y agravado por el modo de razonamiento con cadena de pensamiento, que puede producir explicaciones plausibles pero incorrectas.
- Idiomas: solo chino e ingles. No hay soporte declarado de castellano, por lo que su uso en espanol no esta garantizado ni evaluado.
- La model card describe un "Pure Reasoning Engine: Reflexive, uninhibited analytical problem solving". El termino "uninhibited" sugiere una posible reduccion de los mecanismos de rechazo o alineacion de seguridad; conviene evaluar el comportamiento del modelo ante peticiones sensibles antes de cualquier despliegue publico.
- Licencia: se declara `license: other` con `license_name: lfm1.0`, pero los terminos concretos no se detallan en la informacion proporcionada. Es imprescindible revisar el texto completo de la licencia LFM Open License v1.0 antes de un uso comercial.
- Anomalia de metadatos: la fecha de creacion indicada en HuggingFace es 2026-09-13, posterior a la fecha habitual de publicacion, lo que apunta a un posible error de metadatos del repositorio.
- Coherencia de la model card: mezcla contenido en ingles, ruso y chino, e incluye un system prompt predefinido en chino; la temperatura, top-p, min-p y penalizacion de repeticion recomendadas (0,6 / 0,95 / 0,05 / 1,05) son especificas de este ajuste y pueden degradar resultados con otros valores.
- No se confirma soporte de tool calling ni de flujos agenticos multietapa, pese a que el nombre del dataset incluya "agentic".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fwizzer1/Fwizzer-LFM2.5-VL-3B-ZH-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Dataset de entrenamiento (privado, referenciado): https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardan ninguna relacion con este modelo.
