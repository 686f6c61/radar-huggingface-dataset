# Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910-MLC

## Resumen

Kanha MiniCPM5 1B grounded matched (MLC) es una exportacion para navegador del checkpoint `Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910`, publicada por el usuario Kanha-AI. Se trata de un artefacto compilado con MLC-LLM y pensado para ejecutarse en el navegador mediante WebGPU a traves de la libreria `@mlc-ai/web-llm` (version 0.2.84 requerida), no de un modelo entrenado desde cero. El repositorio ocupa 0,6 GB y contiene pesos en formato `q4f16_1`, con una ventana de contexto de 4096 tokens y un chunk de prefill de 512 tokens.

El modelo subyacente pertenece a la familia MiniCPM5 y, por el nombre del repositorio, ronda los 1000 millones de parametros, aunque la model card no confirma el recuento exacto ni la arquitectura interna. El sufijo "grounded matched" y "2ep" (probablemente dos epochs) sugiere un ajuste fino orientado a respuestas fundamentadas, pero no se documenta el dataset, el procedimiento de entrenamiento ni los hiperparametros.

Su relevancia es acotada y experimental: permite probar un modelo pequeno de la familia MiniCPM5 directamente en el navegador sin backend, a cambio de limitaciones explicitas (sin soporte de tool calling, contexto de 4096 tokens, obligacion de enviar un mensaje de sistema no vacio y de fijar `extra_body.enable_thinking` en cada peticion). El propio autor advierte que la exportacion no establece calidad cuantizada en navegador ni debe tomarse como opcion de produccion por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint deriva de la familia MiniCPM5; la model card no detalla la arquitectura interna) |
| Parametros totales | aproximadamente 1000 millones, segun el nombre del repositorio (`...-1b-...`); no confirmado en la model card |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | `q4f16_1` (unica incluida en esta exportacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | artefactos compilados de MLC-LLM (`mlc-llm`, configuracion `mlc-chat-config.json`); no safetensors ni GGUF |
| Chunk de prefill | 512 tokens |
| Runtime requerido | `@mlc-ai/web-llm` 0.2.84 sobre WebGPU |
| IDs de parada | 1 y 130073 (embebidos en `mlc-chat-config.json`) |
| Tool calling | no soportado |
| Modelo base | `Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910` (revision `53c5bb55c5e2d3ceaeea933e4293735435e57bf1`) |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-10 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del checkpoint original mas alla de su pertenencia a la familia MiniCPM5. Lo unico documentado con precision es el proceso de exportacion: el checkpoint fuente, fijado en la revision inmutable `53c5bb55c5e2d3ceaeea933e4293735435e57bf1`, se convirtio a un grafo MLC-LLM con pesos `q4f16_1`, contexto de 4096 tokens y chunk de prefill de 512 tokens, y se le embebio el framing nativo de MiniCPM5 junto con los IDs de parada 1 y 130073 dentro de `mlc-chat-config.json`. El manifiesto de procedencia se encuentra en `research/export-manifest.json` del propio repositorio.

Tampoco se especifican los datos de entrenamiento del modelo base: no hay numero de tokens, composicion del dataset, ni confirmacion de si hubo RLHF, DPO u otra fase de alineamiento. El nombre "2ep" apunta a un ajuste de dos epochs y "grounded matched" a un objetivo de fundamentacion (grounding), pero son inferencias a partir del nombre, no datos aportados por el autor. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, decodificacion por capas, etc.).

## Capacidades

- Generacion de texto conversacional en un runtime de navegador con WebGPU, con framing nativo de MiniCPM5 y parada controlada por los IDs 1 y 130073.
- Modo de razonamiento explicito mediante `extra_body.enable_thinking`, que debe fijarse en cada peticion (no se hereda ni tiene valor por defecto documentado).
- Uso con mensaje de sistema obligatorio: la model card exige un system message no vacio; sin el, el comportamiento no esta garantizado.
- Contexto de hasta 4096 tokens por conversacion.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso con herramientas: no soportado (depende de tool calling).
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Vision, audio u otras modalidades: no disponibles (no se mencionan en la informacion proporcionada).
- Ejecucion 100 % en cliente (navegador) sin servidor de inferencia, gracias a la compilacion MLC + WebGPU.

## Casos de uso

- Demostraciones de inferencia local en navegador: desplegar el modelo con `@mlc-ai/web-llm` 0.2.84 para mostrar generacion de texto en el cliente sin backend, util en demos tecnicas, pruebas de concepto y articulos comparativos sobre WebGPU.
- Prototipado de asistentes conversacionales de contexto corto: con 4096 tokens de ventana y framing MiniCPM5, sirve para validar prompts de sistema y flujos de chat multi-turno breves antes de migrar a un modelo mayor.
- Evaluacion de calidad de cuantizacion `q4f16_1` en navegador: el propio autor indica que la exportacion no establece calidad cuantizada; un uso legitimo es medirla experimentalmente frente al checkpoint original en FP16.
- Aplicaciones de privacidad estricta: al ejecutarse en el dispositivo, los textos no salen del navegador, lo que encaja en escenarios donde no se permite enviar datos a un servidor (borradores internos, prototipos con datos sensibles).
- Educacion y experimentacion con MLC-LLM: sirve como caso de estudio de conversion de un checkpoint de la familia MiniCPM5 a grafo MLC y de los requisitos de runtime (`mlc-chat-config.json`, chunk de prefill, IDs de parada).
- Pruebas de despliegue en hardware modesto: al ocupar 0,6 GB en disco con pesos de 4 bits, permite validar la viabilidad de WebGPU en equipos sin GPU dedicada potente, siempre que el navegador soporte WebGPU.
- No es adecuado, con la informacion disponible, para agentes con herramientas, pipelines de codigo en produccion ni tareas que exijan contexto largo, al no soportar tool calling y limitarse a 4096 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan datos de latencia, throughput ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,6-0,7 GB para los pesos `q4f16_1` (el repositorio completo ocupa 0,6 GB) mas la cache KV para 4096 tokens y el overhead del runtime WebGPU. Es una estimacion a partir del tamano del repositorio, no un dato publicado.
- GPU recomendadas: no disponibles en la informacion proporcionada. El requisito real es que el navegador y la GPU expongan WebGPU; en la practica se usan GPU integradas modernas o dedicadas de gama de entrada y media.
- Cabe en GPU de consumo: si, es el escenario objetivo de la exportacion (navegador con WebGPU). No se especifica una lista de modelos validados.
- Opciones de despliegue: `@mlc-ai/web-llm` 0.2.84 como runtime obligatorio, sobre el stack MLC-LLM. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni otros servidores; para esos entornos habria que partir del checkpoint fuente, no de esta exportacion.
- Restricciones de integracion: hay que enviar un mensaje de sistema no vacio y fijar `extra_body.enable_thinking` explicitamente en cada peticion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de la columna de modelos alternativos proceden de sus fichas publicas habituales y no se han verificado en la busqueda realizada para esta ficha; se incluyen solo como referencia de categoria (modelos densos de ~1-1,5 B orientados a ejecucion local).

| Modelo | Parametros | Contexto | Licencia | Enfoque de despliegue | Tool calling |
|---|---|---|---|---|---|
| Kanha MiniCPM5 1B grounded matched (MLC) | ~1 B (segun nombre del repositorio) | 4096 tokens | Apache-2.0 | WebGPU en navegador via `@mlc-ai/web-llm` 0.2.84 | No soportado |
| Llama 3.2 1B Instruct | 1,24 B | 128 000 tokens (ficha publica, no verificada) | Llama 3.2 Community License | llama.cpp, vLLM, Ollama, MLC | Soportado en formatos especificos |
| Qwen2.5 1.5B Instruct | 1,54 B | 32 768 tokens (ficha publica, no verificada) | Apache-2.0 en la mayoria de variantes | llama.cpp, vLLM, Ollama, MLC | Soportado |
| SmolLM2 1.7B Instruct | 1,7 B | 8192 tokens (ficha publica, no verificada) | Apache-2.0 | llama.cpp, vLLM, Ollama, MLC | Soportado parcialmente |

No se dispone de datos de rendimiento comparativo para este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- Exportacion experimental: el autor declara explicitamente que no establece calidad de cuantizacion en navegador ni constituye una opcion de produccion por defecto.
- Sin benchmarks: no hay ninguna evaluacion publicada de calidad, sesgos o robustez.
- Sin soporte de tool calling, lo que descarta agentes, automatizaciones con funciones y flujos multi-paso con herramientas.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos, analisis de repositorios o conversaciones extensas.
- Requisitos de invocacion estrictos: mensaje de sistema no vacio y `extra_body.enable_thinking` fijado en cada peticion; omitirlos puede degradar la salida.
- Dependencia de version: se exige `@mlc-ai/web-llm` 0.2.84; otras versiones no estan validadas.
- Dependencia de WebGPU: navegadores o equipos sin soporte WebGPU no pueden ejecutar esta exportacion.
- Idiomas soportados no declarados; no se puede asumir un rendimiento correcto en castellano.
- Riesgo de alucionacion y sesgos: no cuantificados ni documentados en la informacion disponible.
- Procedencia del ajuste fino opaca: no se detallan dataset, numero de tokens ni metodo de alineamiento, lo que dificulta evaluar riesgos de contaminacion o sesgo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni incidencias reportadas.
- Licencia Apache-2.0 en el repositorio y en el checkpoint fuente, lo que en principio permite uso comercial, pero al no documentarse la procedencia de los datos de entrenamiento no puede descartarse riesgo de licencia sobre los mismos; se recomienda revision legal antes de un uso comercial.
- La busqueda web realizada no ha devuelto informacion tecnica sobre el modelo; los resultados obtenidos no guardan relacion con el mismo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910-MLC
- Checkpoint base: https://huggingface.co/Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910
- Revision inmutable del checkpoint base: https://huggingface.co/Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910/tree/53c5bb55c5e2d3ceaeea933e4293735435e57bf1
- Manifiesto de procedencia citado en la model card: `research/export-manifest.json` dentro del repositorio del modelo
- Runtime WebLLM: https://github.com/mlc-ai/web-llm
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- No se han encontrado otros enlaces relevantes (paper, blog o demo) en la busqueda web realizada.
