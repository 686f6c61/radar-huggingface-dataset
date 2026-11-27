# elnemer7/ElNeMeR-AI-Generated-Text-Plagiarism-Detector-ONNX

## Resumen

ElNeMeR Arabic & English AI-Generated Text & Essay Detector (ONNX #34) es un clasificador binario-multiclase exportado a ONNX, desarrollado por el ingeniero Mahmoud ElNemer dentro de la flota de modelos forenses que el autor denomina "Sovereign & Humanitarian Forensic AI Fleet". Su funcion es identificar texto generado por modelos de lenguaje, en concreto ensayos academicos y notas de prensa sinteticas, tanto en arabe como en ingles, y distinguir entre escritura humana espontanea, prosa formulaica generada por LLM y plantillas de salida de chatbots.

El modelo se distribuye como un unico artefacto ONNX (opset 14) compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite ejecutarlo tanto en servidor como directamente en el navegador. La entrada es un tensor `features` de tipo `float32` con forma `[batch_size, 512]`, es decir, un vector de caracteristicas ya extraido, no texto en crudo: no se incluye tokenizador ni pipeline de preprocesado en la informacion disponible.

La relevancia del modelo es limitada a nivel tecnico: el repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes, no publica arquitectura interna, dataset de entrenamiento ni resultados de benchmarks independientes. La unica metrica declarada por el autor es una "Calibration Accuracy" del 100.00%, cifra que debe interpretarse con cautela al no especificarse el conjunto de evaluacion. Aun asi, la licencia MIT y el formato ONNX lo hacen potencialmente util como componente de un pipeline de deteccion de plagio generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador exportado a ONNX, opset 14) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de `[batch_size, 512]` caracteristicas `float32` |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | arabe e ingles (segun la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del clasificador. El modelo se distribuye exclusivamente como grafo ONNX en opset 14, ejecutable con `onnxruntime` y `onnxruntime-web` mediante WASM. La interfaz declarada es un tensor de entrada llamado `features` con forma `[batch_size, 512]` y tipo `float32`, lo que indica que el modelo consume caracteristicas precalculadas por un extractor externo no incluido en el repositorio. No se documenta el tokenizador, la dimensionalidad del espacio de embeddings subyacente ni el metodo de extraccion de caracteristicas.

Tampoco se publican datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones arabe/ingles), ni sobre el uso de RLHF, DPO o fine-tuning supervisado. La model card menciona tres clases de salida (`spontaneous_human_writing`, `formulaic_llm_generated_prose`, `direct_chatbot_template_output`) y una "Calibration Accuracy" del 100.00%, pero no se especifica el conjunto de validacion, el tamano de la muestra ni el protocolo de evaluacion empleado para obtener esa cifra.

## Capacidades

- Clasificacion de texto en tres clases: escritura humana espontanea, prosa formulaica generada por LLM y salida directa de plantilla de chatbot.
- Deteccion de ensayos academicos generados por IA en arabe e ingles.
- Deteccion de notas de prensa sinteticas.
- Deteccion de guiones de estafa generados automaticamente por chatbots.
- Ejecucion en navegador mediante `onnxruntime-web` (WASM), lo que permite despliegues sin backend.
- Integracion en pipelines de forense digital y verificacion de integridad academica.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Verificacion de integridad academica: el modelo puede clasificar entregas de ensayos en arabe o ingles y marcar como `formulaic_llm_generated_prose` aquellas que presenten patrones de generacion automatica, como primer filtro antes de una revision humana.
- Deteccion de notas de prensa sinteticas: en redacciones o agencias de comunicacion, se puede usar para auditar comunicados recibidos y detectar contenido generado automaticamente antes de su publicacion.
- Forense digital en casos de fraude: clasificar guiones de conversacion sospechosos como `direct_chatbot_template_output` para apoyar la identificacion de campanas de estafa automatizadas.
- Moderacion de contenido en plataformas: integrado como paso previo a la revision manual, permite priorizar textos sospechosos de ser generados por LLM en flujos de gran volumen.
- Despliegue en navegador para herramientas de autoevaluacion: gracias a `onnxruntime-web`, se puede ofrecer una comprobacion local de textos sin enviar el contenido a un servidor, util en contextos con requisitos de privacidad.
- Investigacion sobre deteccion de texto generado: el artefacto ONNX sirve como componente reproducible en experimentos de atribucion de autoria, siempre que se disponga de un extractor de caracteristicas compatible con la entrada `[batch_size, 512]`.
- Auditoria de contenido en entornos educativos con alumnado bilingue arabe-ingles, donde otros detectores entrenados solo en ingles rinden peor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es una "Calibration Accuracy" del 100.00% en la model card, sin especificacion del conjunto de evaluacion, tamano de muestra ni protocolo, por lo que no se puede contrastar ni comparar con otros detectores.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 512 `float32`, por lo que el modelo es presumiblemente muy ligero, pero no se publica el numero de parametros ni el tamano exacto del grafo.
- GPU recomendadas: no disponibles; por el formato ONNX y la entrada de baja dimensionalidad, la inferencia en CPU es probablemente viable, aunque no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; el modelo esta pensado para `onnxruntime` y `onnxruntime-web`, lo que sugiere ejecucion en CPU o WASM.
- Opciones de despliegue: `onnxruntime` (Python, C++, etc.) y `onnxruntime-web` (WASM en navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (deteccion de texto generado por IA bilingue arabe-ingles en formato ONNX) con especificaciones publicadas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No se publica arquitectura, numero de parametros, dataset de entrenamiento ni protocolo de evaluacion; la reproducibilidad es muy limitada.
- La cifra de "Calibration Accuracy" del 100.00% no viene acompanada de conjunto de validacion ni tamano de muestra, por lo que no debe tomarse como evidencia de rendimiento real.
- El modelo consume caracteristicas precalculadas (`features`, `[batch_size, 512]`); sin el extractor compatible no es posible usarlo sobre texto en crudo, y no se documenta cual es.
- Riesgo de falsos positivos sobre escritura humana muy formulaica (plantillas administrativas, textos academicos muy estructurados) y de falsos negativos frente a LLM con prompts de estilo personalizado.
- Solo se declaran arabe e ingles; no hay informacion sobre rendimiento en otros idiomas ni sobre variantes dialectales del arabe.
- No se documentan sesgos conocidos, pero al no publicarse el corpus de entrenamiento no se puede evaluar su representatividad.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (2026-11-27), lo que sugiere ausencia de validacion por parte de la comunidad.
- La licencia MIT permite uso comercial, pero la falta de documentacion tecnica desaconseja su uso en produccion sin una evaluacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-AI-Generated-Text-Plagiarism-Detector-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo del autor: https://elnemer-ai.com
