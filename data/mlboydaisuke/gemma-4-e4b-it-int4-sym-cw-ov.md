# mlboydaisuke/gemma-4-E4B-it-int4-sym-cw-ov

## Resumen

`mlboydaisuke/gemma-4-E4B-it-int4-sym-cw-ov` es una conversión del modelo `google/gemma-4-E4B-it` (revisión `4ecc2ba`) a formato OpenVINO IR con cuantización int4 simétrica de pesos *channel-wise* (ratio 1.0, group-size -1). El objetivo no es otro que producir una variante ejecutable en la NPU integrada de los procesadores Intel Core Ultra, siguiendo la guía oficial de OpenVINO GenAI para LLM en NPU, que exige exportar con `--sym`, `--weight-format int4` o `nf4`, `--group-size -1` o `128` y `--ratio 1.0`. El autor (mlboydaisuke) publica además colecciones de Gemma 4 para Apple Core AI, lo que sitúa este artefacto en una línea de trabajo de despliegue de Gemma 4 en hardware de borde.

El modelo base es Gemma 4 E4B, una variante "E" (eficiente) de la familia Gemma 4 de Google, con pipeline `image-text-to-text`, es decir, multimodal de imagen y texto. Este repositorio concreto no añade pesos nuevos: es un artefacto de despliegue cuantizado, con licencia Apache 2.0 heredada del modelo base según la model card, y un tamaño de repositorio de 6,4 GB.

La relevancia es práctica: demuestra que un modelo multimodal de la familia Gemma 4 puede ejecutarse en la NPU de un portátil Intel Core Ultra con un rendimiento medido de 13,3 tokens/s en decodificación y un *working set* pico de 7.033 MiB. Es, por tanto, un artefacto de referencia para inferencia local en NPU, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simétrica, channel-wise (group-size -1, ratio 1.0); backup_mode int8_asym; exportable también en int4 group-size 128 (falló en NPU con 0xC0000005) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (según model card) |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), exportado con optimum-cli; repositorio de 6,4 GB |
| Librería | openvino / openvino-genai |
| Modelo base | google/gemma-4-E4B-it (revision 4ecc2ba) |
| Pipeline | image-text-to-text |
| Metadatos de cuantización (rt_info) | mode int4_sym, group_size -1, ratio 1.0, awq False, scale_estimation False, backup_mode int8_asym |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo: es una exportación del checkpoint `google/gemma-4-E4B-it` a OpenVINO IR mediante `optimum-cli export openvino --task image-text-to-text --weight-format int4 --sym --ratio 1.0 --group-size -1`. La cuantización se aplica con NNCF 3.4.0 sobre los pesos del modelo base, verificados previamente contra los sha256 del Hub. El resultado es un grafo IR con pesos int4 simétricos *channel-wise* y respaldo int8 asimétrico, sin AWQ ni *scale estimation*.

La decisión de usar `--group-size -1` (channel-wise) en lugar de 128 responde a un fallo reproducido: la exportación con group-size 128 terminaba en la NPU con código de salida `0xC0000005` (violación de acceso) antes de generar la primera respuesta. La variante channel-wise es la que se publica aquí. Las versiones exactas del *toolchain* son optimum-intel 2.2.0, optimum 2.3.0, nncf 3.4.0, openvino 2026.4.1, openvino-tokenizers 2026.4.1.0, transformers 5.5.4, torch 2.14.0, Python 3.12.10, sobre Windows 11 Home.

No se dispone de información sobre la arquitectura interna del modelo base (número de capas, atención, tamaño de vocabulario, composición del dataset de entrenamiento, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline `image-text-to-text` y la plantilla de chat incluida en el repositorio.
- Procesamiento de imagen y texto (multimodal): el pipeline declarado es `image-text-to-text`. No obstante, el autor indica que la ruta de imagen no se ejecutó en la NPU en sus mediciones; solo se validó texto.
- Ejecución en NPU Intel mediante OpenVINO GenAI `VLMPipeline(..., "NPU", CACHE_DIR=...)`.
- Razonamiento y generación de código: no verificable con la información disponible; depende de las capacidades del modelo base Gemma 4 E4B.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Modo *thinking* u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en portátiles con Intel Core Ultra: el modelo se carga en la NPU vía OpenVINO GenAI y responde a turnos de chat con un rendimiento medido de 13,3 tokens/s, suficiente para interacción de baja latencia sin ocupar la GPU ni la CPU.
- Procesamiento de documentos con imagen y texto en el dispositivo: al ser un modelo `image-text-to-text`, puede emplearse para extraer información de capturas, formularios o figuras, manteniendo los datos en local (aunque la ruta de imagen no fue validada en NPU por el autor).
- Prototipado de aplicaciones de IA en el borde: sirve como artefacto de referencia para validar pipelines OpenVINO GenAI en NPU antes de pasar a producción, con un *working set* pico medido de 7.033 MiB.
- Asistencia offline en entornos sin conectividad: al ejecutarse íntegramente en el portátil, permite resúmenes, reescritura y respuesta a preguntas sin enviar datos a la nube.
- Evaluación comparativa de cuantizaciones: el repositorio documenta el fallo de la variante group-size 128 en NPU, por lo que es útil como caso de estudio para elegir esquemas de cuantización en hardware Intel.
- Integración en herramientas de escritorio (por ejemplo, extensiones o asistentes embebidos) mediante la API de OpenVINO GenAI, aprovechando la carga en caché (6,2 s y 5,1 s en cargas en caliente frente a 14,4 s en frío).
- Base para experimentos de multimodalidad en NPU: permite medir latencia de prefill (16,5 tokens/s, 1.220 ms hasta el primer token) en un portátil concreto y extrapolar a otros equipos Core Ultra.

## Benchmarks y rendimiento

Mediciones del autor en un portátil Intel Core Ultra 9 386H (NPU driver 32.0.100.4841, Windows 11 Home build 26200.9711, 31,5 GB RAM), con OpenVINO GenAI 2026.4.1, prompt `short-chat` de edge-llm-bench (20 tokens), greedy, máximo 128 tokens nuevos, mediana de 2 ejecuciones válidas:

| Métrica | Valor |
|---|---|
| Decodificación en frío | 13,3 tokens/s (dispersión 0,6 %) |
| Decodificación en caliente | 13,3 tokens/s |
| Prefill en frío | 16,5 tokens/s; 1.220 ms hasta el primer token |
| Working set pico del proceso | 7.033 MiB |
| Carga (frío / caliente) | 14,4 s / 6,2 s y 5,1 s |
| Verificación de salida | 6/6 PASS (comprobación de texto de edge-llm-bench) |
| Primera carga registrada | 2.736,1 s de tiempo de pared (unos 350 s efectivos; el resto con el proceso suspendido) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores son de rendimiento de inferencia, no de calidad.

## Requisitos de hardware

- NPU Intel integrada en Intel Core Ultra (probado en Core Ultra 9 386H con driver 32.0.100.4841); es el destino principal del artefacto.
- Memoria: *working set* pico medido de 7.033 MiB para el proceso; el sistema de prueba tenía 31,5 GB de RAM.
- Repositorio de 6,4 GB en disco para los pesos OpenVINO IR.
- GPU dedicadas (A100, H100, RTX 4090): no evaluadas en la información proporcionada; el artefacto está pensado para NPU, no para CUDA.
- Despliegue: OpenVINO GenAI `VLMPipeline` con dispositivo `"NPU"` y `CACHE_DIR`; también podría ejecutarse en CPU/GPU Intel con OpenVINO, aunque no se aportan medidas.
- Latencia y throughput: 13,3 tokens/s de decodificación y 1.220 ms hasta el primer token en el hardware citado; la carga en caliente baja a 5-6 s gracias a la caché.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el formato es OpenVINO IR, no GGUF ni safetensors.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mlboydaisuke/gemma-4-E4B-it-int4-sym-cw-ov | no disponible | no disponible | OpenVINO IR int4 | apache-2.0 | Optimizado para NPU Intel; 13,3 tok/s medidos |
| OpenVINO/gemma-4-E4B-it-int4-ov | no disponible | no disponible | OpenVINO IR int4_asym, group-size 64, AWQ | no disponible en la información | Exportación oficial de OpenVINO; esquema distinto (asym + AWQ) |
| google/gemma-4-E4B-it | no disponible | no disponible | safetensors (presumiblemente) | no disponible en la información | Modelo base original de Google |
| mlboydaisuke/gemma-4-E4B-CoreAI | no disponible | no disponible | Apple Core AI | no disponible en la información | Variante del mismo autor para Apple Core AI en iOS/macOS 27 |

La comparación se limita a variantes del mismo modelo base; no se dispone de datos de benchmarks de calidad para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Artefacto de despliegue, no un modelo nuevo: hereda todas las limitaciones, sesgos y riesgos de alucinación del modelo base `google/gemma-4-E4B-it`, sobre el que no se aporta documentación en esta ficha.
- La cuantización int4 puede degradar la calidad respecto al modelo original; no se han publicado evaluaciones de calidad comparativas.
- La ruta multimodal de imagen no fue validada en NPU por el autor; solo se midió texto.
- La variante con group-size 128 provocó un fallo `0xC0000005` en NPU; no debe asumirse que cualquier esquema de cuantización funciona en este hardware.
- Las mediciones provienen de un único portátil y una única sesión; no son extrapolables sin validación.
- El campo de idiomas está vacío; no se garantiza soporte multilingüe más allá de lo que ofrezca el modelo base.
- Licencia apache-2.0 según la model card, pero conviene verificar los términos del modelo base Gemma 4 antes de uso comercial, ya que la familia Gemma suele tener condiciones específicas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Sin soporte documentado para vLLM, llama.cpp u otros runtimes habituales; el ecosistema es OpenVINO.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/gemma-4-E4B-it-int4-sym-cw-ov
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Guía OpenVINO GenAI para NPU: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
- Exportación oficial OpenVINO del modelo base: https://huggingface.co/OpenVINO/gemma-4-E4B-it-int4-ov
- Colección Gemma 4 para Apple Core AI: https://huggingface.co/collections/mlboydaisuke/gemma-4-for-apple-core-ai
- Variante Core AI del mismo autor: https://huggingface.co/mlboydaisuke/gemma-4-E4B-CoreAI
- Registros de medición (windows-llm-zoo): https://github.com/john-rocky/windows-llm-zoo/tree/894114e9bdc9346ce66927d667a6743a12df190c/raw/walk-npuexp4/gemma-4-E4B-it/openvino-genai_npu_npu-sym-cw/
- Resultados JSON: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/results/gemma-4-E4B-it/openvino-genai_npu_npu-sym-cw.json
- Script de ejecución: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/pc/run_ovgenai.py
- Benchmark utilizado (edge-llm-bench): https://github.com/john-rocky/edge-llm-bench
