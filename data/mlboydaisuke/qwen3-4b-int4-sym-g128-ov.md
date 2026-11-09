# mlboydaisuke/Qwen3-4B-int4-sym-g128-ov

## Resumen

Qwen3-4B-int4-sym-g128-ov es una exportación del modelo Qwen/Qwen3-4B (revisión `1cfa9a7`) al formato OpenVINO IR, con pesos cuantizados a int4 simétrico, tamaño de grupo 128 y ratio 1.0. El autor, mlboydaisuke, la publica como artefacto listo para ejecutarse con OpenVINO GenAI sobre la NPU integrada de los procesadores Intel Core Ultra. No se trata de un modelo nuevo, sino de una conversión de pesos optimizada para inferencia en hardware de bajo consumo.

La relevancia de esta ficha radica en su propósito práctico: el autor documenta que la exportación equivalente de OpenVINO (`OpenVINO/Qwen3-4B-int4-ov`, con AWQ) no producía respuestas utilizables en su NPU con OpenVINO GenAI 2026.4.1 y el driver NPU 32.0.100.4841, mientras que esta variante sin AWQ sí responde. El repositorio incluye mediciones reales de decodificación (21,7 tokens/s en frío, 22,0 en caliente) y prefill (18,5 tokens/s) sobre un Intel Core Ultra 9 386H, lo que lo convierte en una referencia útil para quien quiera desplegar Qwen3-4B en NPU Intel.

El modelo base Qwen3-4B es un transformer denso de 4 mil millones de parámetros con modo de razonamiento (bloque `<think>`) y una ventana de contexto amplia, distribuido bajo licencia Apache 2.0. Esta exportación conserva esas capacidades, pero las limita al ecosistema OpenVINO y al formato IR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B); exportado como OpenVINO IR |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | int4 simetrico, group size 128, ratio 1.0, backup_mode int8_asym; awq False, scale_estimation False |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin), libreria openvino, pipeline openvino-genai |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de 4 mil millones de parámetros desarrollado por el equipo Qwen (Alibaba). Esta publicación no entrena ni afina el modelo: únicamente lo convierte a OpenVINO IR mediante `optimum-cli export openvino` con `--task text-generation-with-past --weight-format int4 --sym --ratio 1.0 --group-size 128`. La conversión se realizó con optimum-intel 2.2.0, optimum 2.3.0, nncf 3.4.0, openvino 2026.4.1, openvino-tokenizers 2026.4.1.0, transformers 5.5.4 y torch 2.14.0 sobre Python 3.12.10 en Windows 11 Home.

La innovación técnica destacable no está en el entrenamiento, sino en la decisión de exportar sin AWQ. Según el autor, la versión con AWQ (`OpenVINO/Qwen3-4B-int4-ov`) generaba un token de parada (`<|endoftext|>`) como primer token en la NPU, produciendo respuestas vacías o repetitivas, mientras que en CPU funcionaba correctamente. Esta exportación sin AWQ responde en NPU, aunque el autor no identificó la causa raíz (apunta a diferencias en las versiones de las herramientas de exportación). Los metadatos `rt_info` del IR confirman: mode int4_sym, group_size 128, ratio 1.0, awq False, scale_estimation False, backup_mode int8_asym. No se dispone de información sobre el dataset de entrenamiento del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de chat propia del modelo base.
- Razonamiento explícito mediante bloque `<think>`: el modelo inicia sus respuestas con una línea de pensamiento antes de la respuesta final.
- Razonamiento multi-paso y matemáticas (heredadas de Qwen3-4B; no verificadas en esta exportación).
- Generación de código (heredada del modelo base; no verificada en esta exportación).
- Soporte de tool calling y function calling: no confirmado en la información proporcionada para esta exportación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Inferencia en NPU Intel mediante OpenVINO GenAI `LLMPipeline(<folder>, "NPU", CACHE_DIR=<dir>)`.
- Ejecución también en CPU con el mismo IR (documentado por el autor en los logs de diagnóstico).

## Casos de uso

- Asistente conversacional local en portátiles con Intel Core Ultra: el modelo se ejecuta en la NPU integrada con un working set pico de 5.560 MiB, lo que permite mantener conversaciones sin GPU dedicada y con bajo consumo energético.
- Demos y prototipos de IA en el dispositivo (on-device AI): el autor lo emplea precisamente para explicar conceptos de IA local en entornos de demostración, con respuestas generadas íntegramente en el portátil.
- Aplicaciones de privacidad estricta: al no requerir conexión a servicios en la nube, encaja en escenarios donde los datos del usuario no deben salir del equipo (salud, legal, entornos corporativos cerrados).
- Evaluación comparativa de hardware NPU: sirve como referencia reproducible para medir rendimiento de NPU Intel (decode 21,7 tokens/s, prefill 18,5 tokens/s) frente a otras configuraciones.
- Generación de texto por lotes en equipos de sobremesa sin GPU: el IR funciona también en CPU, lo que permite reutilizar el mismo artefacto en estaciones de trabajo sin acelerador dedicado.
- Chat con razonamiento visible: útil en herramientas educativas o de depuración donde interesa mostrar el bloque `<think>` del modelo para inspeccionar su cadena de razonamiento (con la advertencia de que, con 128 tokens nuevos, la respuesta puede quedar truncada dentro del bloque de pensamiento).

## Benchmarks y rendimiento

Mediciones del autor sobre un Intel Core Ultra 9 386H (driver NPU 32.0.100.4841, Windows 11 Home build 26200.9711, 31,5 GB RAM), con OpenVINO GenAI 2026.4.1, prompt `short-chat` de edge-llm-bench (19 tokens), greedy, máximo 128 tokens nuevos:

| Metrica | Valor |
|---|---|
| Decode en frio | 21,7 tokens/s (mediana de 2 ejecuciones, dispersión 0,1 %) |
| Decode en caliente | 22,0 tokens/s |
| Prefill en frio | 18,5 tokens/s; 1026 ms hasta el primer token |
| Working set pico | 5.560 MiB (proceso) |
| Tiempo de carga | 10,6 s en la primera ejecución; 3,6 s en las siguientes (mismo CACHE_DIR) |
| Primera carga registrada | 128,7 s (2026-11-08) |
| Verificación de salida | 6/6 PASS; 128 y 128 tokens nuevos por respuesta |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta exportación.

## Requisitos de hardware

- VRAM/RAM estimada: working set pico medido de 5.560 MiB en el proceso de inferencia; el repositorio ocupa 2,3 GB en disco.
- Hardware de referencia: Intel Core Ultra 9 386H con NPU integrada y driver 32.0.100.4841; 31,5 GB de RAM en el equipo de prueba.
- GPU dedicadas: no aplica; esta exportación está orientada a NPU Intel y CPU. No se documenta soporte en A100, H100 ni RTX 4090 para este artefacto.
- ¿Cabe en hardware de consumo? Sí, en portátiles y mini-PC con Intel Core Ultra (NPU integrada), con el consumo de memoria indicado.
- Opciones de despliegue: OpenVINO GenAI (`LLMPipeline` con dispositivo "NPU" o "CPU"), con `CACHE_DIR` para acelerar cargas posteriores. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato IR.
- Latencia y throughput: 21,7 tokens/s de decodificación en frío y 22,0 en caliente; 1026 ms hasta el primer token; carga de 3,6 s con caché en caliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-int4-sym-g128-ov (este) | 4B | no disponible | OpenVINO IR int4 | Apache 2.0 | Responde en NPU Intel; mediciones publicadas |
| OpenVINO/Qwen3-4B-int4-ov | 4B | no disponible | OpenVINO IR int4 (AWQ) | Apache 2.0 | Según el autor, falla en NPU con OpenVINO GenAI 2026.4.1 (respuesta vacía o repetitiva); funciona en CPU |
| Qwen/Qwen3-4B (original) | 4B | no disponible | safetensors (bf16/fp16) | Apache 2.0 | Pesos sin cuantizar; requiere mayor memoria y no está optimizado para NPU |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha validado en una configuración concreta: Intel Core Ultra 9 386H, driver NPU 32.0.100.4841, OpenVINO GenAI 2026.4.1 y Windows 11. Otros drivers o versiones pueden comportarse de forma distinta.
- La cuantización int4 sin AWQ ni scale_estimation puede degradar la calidad respecto al modelo base en tareas complejas; no se han publicado evaluaciones de calidad para esta exportación.
- Con el límite de 128 tokens nuevos usado en las pruebas, todas las respuestas terminan dentro del bloque `<think>` sin llegar a `</think>`, por lo que la respuesta final puede quedar truncada si no se amplía el presupuesto de generación.
- Riesgo de alucinación inherente al modelo base Qwen3-4B; no se documentan mitigaciones específicas en esta exportación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B y de las herramientas de exportación utilizadas.
- El autor no identificó la causa raíz del fallo de la variante AWQ en NPU, por lo que la reproducibilidad del comportamiento en otros equipos no está garantizada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-4B-int4-sym-g128-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Variante AWQ de referencia: https://huggingface.co/OpenVINO/Qwen3-4B-int4-ov
- Guía de OpenVINO GenAI para NPU: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
- Repositorio windows-llm-zoo: https://github.com/john-rocky/windows-llm-zoo
- Benchmark edge-llm-bench: https://github.com/john-rocky/edge-llm-bench
- Log de diagnóstico en NPU (variante AWQ): https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/raw/diag/q4npu.log
- Log de diagnóstico en CPU (variante AWQ): https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/raw/diag/q4cpu.log
- Log de la primera carga de esta exportación: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/raw/diag/q4sym.log
- Resultados medidos: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/results/Qwen3-4B/openvino-genai_npu_npu-sym-g128.json
- Ejecuciones cronometradas: https://github.com/john-rocky/windows-llm-zoo/tree/894114e9bdc9346ce66927d667a6743a12df190c/raw/walk-timed-b/Qwen3-4B/openvino-genai_npu_npu-sym-g128/
- Script de ejecución: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/pc/run_ovgenai.py
