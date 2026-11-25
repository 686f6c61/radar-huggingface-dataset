# mlboydaisuke/Qwen3-0.6B-int4-sym-g128-ov

## Resumen

Qwen3-0.6B-int4-sym-g128-ov es una exportación a formato OpenVINO IR del modelo Qwen/Qwen3-0.6B (revisión `c1899de`), cuantizada en int4 simétrico con tamaño de grupo 128 y ratio 1.0, realizada por el usuario mlboydaisuke. El objetivo no es otro que ofrecer una variante del pequeño modelo de Qwen ejecutable sobre la NPU integrada de los procesadores Intel Core Ultra, siguiendo las directrices de la guía de OpenVINO GenAI para LLM en NPU, que exige exportar con `--sym`, formato de peso int4 o nf4, tamaño de grupo -1 o 128 y ratio 1.0.

El modelo base Qwen3-0.6B es un transformer denso de 0.6 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba, pensado para generación de texto y conversación con modo de razonamiento (bloques ` thinking`). Esta versión cuantizada reduce el peso del repositorio a 0.4 GB y permite su despliegue en hardware de consumo con aceleración NPU, algo relevante para escenarios de IA en el dispositivo (edge) donde no se dispone de GPU dedicada.

La ficha resulta de interés práctico para desarrolladores que quieran ejecutar un LLM conversacional en un portátil con Intel Core Ultra sin renunciar a una latencia razonable: el autor reporta 73.2-73.8 tokens/s de decodificación en una NPU Intel con un consumo de memoria de proceso de 1.536 MiB. No obstante, la fidelidad respecto al modelo original es limitada (9 de 20 coincidencias en preguntas cortas), lo que conviene tener en cuenta antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a OpenVINO IR |
| Parámetros totales | 0.6 mil millones (modelo base Qwen3-0.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3-0.6B soporta contexto largo, pero no se detalla aquí) |
| Tipos de cuantización | int4 simétrico, group size 128, ratio 1.0; backup mode int8_asym |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin); pesos int4 simétricos |
| Tamaño del repositorio | 0.4 GB |
| Librería | openvino / openvino-genai |
| Hardware objetivo | NPU Intel (Intel Core Ultra), también ejecutable en CPU |
| Revisión del modelo base | `c1899de289a04d12100db370d81485cdf75e47ca` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) aplicadas por el equipo Qwen; esos datos corresponden a la model card del modelo base, que no se ha incluido aquí.

La aportación de esta ficha es el proceso de cuantización y exportación: se usó `optimum-cli export openvino` con la tarea `text-generation-with-past`, formato de peso `int4`, flag `--sym`, `--ratio 1.0` y `--group-size 128`. Las versiones de las herramientas fueron optimum-intel 2.2.0, optimum 2.3.0, nncf 3.4.0, openvino 2026.4.1, openvino-tokenizers 2026.4.1.0, transformers 5.5.4 y torch 2.14.0 sobre Python 3.12.10 en Windows 11. La metadata `rt_info` del IR confirma modo `int4_sym`, group size 128, ratio 1.0, AWQ desactivado, scale estimation desactivada y backup mode `int8_asym`. No se aplicó decodificación especulativa ni técnicas de atención lineal; es una cuantización post-entrenamiento estándar.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del modelo base.
- Modo de razonamiento (thinking): el modelo genera bloques ` thinking` antes de la respuesta; en las pruebas del autor, con 128 tokens nuevos la respuesta queda dentro del bloque de pensamiento.
- Razonamiento básico y respuesta a preguntas factuales sobre pasajes cortos (hasta 1.000 tokens en las pruebas).
- Generación de código y matemáticas: capacidades heredadas del modelo base Qwen3-0.6B, aunque no se han medido en esta exportación.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada para esta exportación.
- Capacidades de agente y razonamiento multi-paso: no verificadas en esta variante cuantizada.
- Ejecución en NPU Intel mediante OpenVINO GenAI `LLMPipeline` con dispositivo `"NPU"`, y también en CPU con el mismo IR.

## Casos de uso

- Asistente conversacional en el portátil: ejecutar un chatbot local sobre la NPU de un Intel Core Ultra con 73 tokens/s de decodificación, suficiente para respuestas interactivas sin depender de la nube.
- Procesamiento de texto en el dispositivo (edge): resúmenes, reescritura o extracción de información de documentos cortos en un portátil de consumo, con un consumo de memoria de proceso de unos 1.536 MiB.
- Prototipado de aplicaciones OpenVINO GenAI: validar pipelines de `LLMPipeline` con dispositivo `"NPU"` antes de escalar a modelos mayores, gracias al reducido tamaño del repositorio (0.4 GB) y a un tiempo de carga en caliente de 0,9 s.
- Demos de IA en el dispositivo para educación o divulgación: mostrar un LLM funcionando sin GPU dedicada ni conexión a internet, con latencia medible y reproducible.
- Respuesta a preguntas sobre pasajes cortos: el autor midió 154 de 160 aciertos en preguntas factuales con contextos de 256 a 1.000 tokens, lo que lo hace apto para tareas de lectura comprensiva sencilla en local.
- Filtrado y clasificación de texto de baja latencia: con prefill de 74,5 tokens/s y 255 ms hasta el primer token, puede usarse para tareas de etiquetado o moderación de textos cortos en tiempo casi real.
- Base para experimentos de cuantización: sirve como referencia para comparar int4 simétrico frente a int8 (el autor publica también `Qwen3-0.6B-int8-sym-ov`) en la misma NPU.

## Benchmarks y rendimiento

Rendimiento medido por el autor en una NPU Intel (Intel Core Ultra 9 386H, driver NPU 32.0.100.5540, Windows 11 Home build 26200.9711, 31,5 GB RAM, modo Balanced), OpenVINO GenAI 2026.4.1, prompt `short-chat` de edge-llm-bench (19 tokens), greedy, máximo 128 tokens nuevos:

| Métrica | Valor |
|---|---|
| Decodificación en frío | 73,2 tokens/s (mediana de 2 ejecuciones, dispersión 0,2 %) |
| Decodificación en caliente | 73,8 tokens/s |
| Prefill en frío | 74,5 tokens/s; 255 ms hasta el primer token |
| Memoria de trabajo pico | 1.536 MiB (proceso) |
| Tiempo de carga (caché caliente) | 0,9 s |
| Tiempo de carga (primera vez, caché vacía) | 9,4 s |
| Verificación de salida | 6/6 PASS (text check de edge-llm-bench) |

Calidad y fidelidad respecto al modelo original:

| Prueba | Resultado |
|---|---|
| Coincidencia de respuesta en 20 preguntas cortas (thinking off) | 9 de 20 (umbral de aprobado: 18) |
| Preguntas factuales en prompts largos (160 prompts, 256-1.000 tokens) | 154 de 160 aciertos (el modelo original: 160 de 160) |
| Comparación con exportación int8 del mismo autor | 18 de 20 coincidencias en las mismas 20 preguntas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM / memoria: no requiere VRAM dedicada; el proceso consume 1.536 MiB de memoria de trabajo en la NPU. El repositorio ocupa 0,4 GB en disco.
- GPU recomendadas: no aplica; el objetivo es la NPU integrada de Intel Core Ultra. También puede ejecutarse en CPU con el mismo IR (el autor lo hizo en f32 para las pruebas comparativas).
- Cabe en hardware de consumo: sí, en portátiles con Intel Core Ultra (probado en Core Ultra 9 386H). No se dispone de datos para otras NPU o para GPU de consumo.
- Opciones de despliegue: OpenVINO GenAI (`LLMPipeline` con dispositivo `"NPU"` o `"CPU"`), con `CACHE_DIR` para acelerar cargas posteriores. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 255 ms hasta el primer token, 73,2-73,8 tokens/s de decodificación, 0,9 s de carga en caliente y 9,4 s en frío (medidos en el hardware indicado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-int4-sym-g128-ov (este) | 0,6 mil M | no disponible | OpenVINO IR int4 sim | Apache 2.0 | Optimizado para NPU Intel; 73 tokens/s en NPU; 9/20 coincidencias con el original |
| Qwen3-0.6B-int8-sym-ov (mismo autor) | 0,6 mil M | no disponible | OpenVINO IR int8 sim | Apache 2.0 | Misma NPU; 18/20 coincidencias y 160/160 en preguntas factuales |
| OpenVINO/Qwen3-0.6B-int4-ov | 0,6 mil M | no disponible | OpenVINO IR int4 asim, group 128, ratio 0,8 | Apache 2.0 | Exportación oficial de OpenVINO; no cumple los requisitos de la guía NPU según el autor |
| Qwen/Qwen3-0.6B (original) | 0,6 mil M | no disponible | safetensors fp32 | Apache 2.0 | Referencia de calidad; 160/160 en preguntas factuales |

## Limitaciones y advertencias

- Pérdida de fidelidad notable: solo 9 de 20 respuestas coinciden con el modelo original en preguntas cortas, frente a un umbral de aprobado de 18. No debe usarse como sustituto directo del modelo base en tareas sensibles a la exactitud.
- Alucinación en datos numéricos: en las pruebas factuales, tanto la NPU como la CPU fallaron en las preguntas cuyas respuestas eran números de dos dígitos (38 sillas, 27 manzanos), con respuestas erróneas como 28, 18 o 14.
- El bloque de razonamiento (` thinking`) no se cierra con 128 tokens nuevos; si se limita la generación, la respuesta puede quedar truncada dentro del pensamiento.
- Idiomas soportados no documentados en esta exportación; se desconoce el comportamiento multilingüe tras la cuantización.
- No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta variante.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Dependencia del hardware: los datos de rendimiento se han medido en una única NPU (Core Ultra 9 386H) y un único driver; el comportamiento en otros equipos puede variar.
- Contexto máximo no especificado en la información disponible; las pruebas del autor se limitan a 1.000 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-int4-sym-g128-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Exportación int8 del mismo autor: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-int8-sym-ov
- Exportación int4 asimétrica de OpenVINO: https://huggingface.co/OpenVINO/Qwen3-0.6B-int4-ov
- Guía de OpenVINO GenAI para NPU: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
- Repositorio edge-llm-bench: https://github.com/john-rocky/edge-llm-bench
- Repositorio windows-llm-zoo: https://github.com/john-rocky/windows-llm-zoo
- Script de ejecución: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/pc/run_ovgenai.py
- Registros de las mediciones: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-int4-sym-g128-ov/tree/main/records/2026-11-11
