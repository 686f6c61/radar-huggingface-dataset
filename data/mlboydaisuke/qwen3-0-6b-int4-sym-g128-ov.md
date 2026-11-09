# mlboydaisuke/Qwen3-0.6B-int4-sym-g128-ov

## Resumen

Qwen3-0.6B-int4-sym-g128-ov es una versión cuantizada del modelo Qwen3-0.6B de Alibaba Qwen, exportada a formato OpenVINO IR por el usuario mlboydaisuke para su ejecución en la NPU (unidad de procesamiento neuronal) de procesadores Intel. No se trata de un modelo nuevo, sino de una conversión del checkpoint original (revisión `c1899de`) a pesos int4 simétricos con tamaño de grupo 128 y ratio 1.0, siguiendo las recomendaciones de la guía oficial de OpenVINO GenAI para LLMs sobre NPU.

El modelo base Qwen3-0.6B es un transformer denso de aproximadamente 0.6-0.8 mil millones de parámetros, perteneciente a la familia Qwen3, que incorpora un modo de razonamiento ("thinking mode") con etiquetas `<think>`. Esta conversión concreta está pensada para inferencia local en hardware Intel con NPU, con un tamaño de repositorio de solo 0.4 GB, lo que la hace adecuada para despliegues en portátiles y equipos de borde.

La relevancia de esta ficha radica en que documenta un caso práctico de cuantización int4 para NPU con métricas medidas en hardware real (Intel Core Ultra 9 386H), incluyendo velocidad de decodificación, prefill y consumo de memoria, datos poco habituales en el ecosistema de modelos cuantizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B), exportado como OpenVINO IR |
| Parámetros totales | ~0.6B (el modelo base figura como 0.8B en la Hub de Qwen) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Int4 simétrico, group size 128, ratio 1.0, backup mode int8_asym; awq False, scale_estimation False |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (.xml/.bin), librería openvino |
| Tamaño del repositorio | 0.4 GB |
| Versión del modelo base | Qwen/Qwen3-0.6B, revisión `c1899de289a04d12100db370d81485cdf75e47ca` |
| Toolchain de exportación | optimum-intel 2.2.0, optimum 2.3.0, nncf 3.4.0, openvino 2026.4.1, openvino-tokenizers 2026.4.1.0, transformers 5.5.4, torch 2.14.0, Python 3.12.10 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3 desarrollada por Alibaba Qwen. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron fases de RLHF o DPO; estos datos corresponden a la model card del modelo base, que no se ha incluido en la información proporcionada.

La innovación técnica de esta ficha es el proceso de conversión: se exportó el checkpoint original con `optimum-cli export openvino` usando `--task text-generation-with-past`, `--weight-format int4`, `--sym`, `--ratio 1.0` y `--group-size 128`. Estos parámetros cumplen los requisitos de la guía de OpenVINO GenAI para LLMs en NPU, que exige cuantización simétrica int4 o nf4 con group size -1 o 128 y ratio 1.0. La diferencia respecto a `OpenVINO/Qwen3-0.6B-int4-ov` (que usa int4_asym con ratio 0.8) es precisamente la simetría y el ratio completo, condiciones necesarias para el backend NPU. Los metadatos `rt_info` del IR confirman: mode `int4_sym`, group_size 128, ratio 1.0, awq False, scale_estimation False, backup_mode `int8_asym`.

## Capacidades

- Generación de texto conversacional y de formato libre, heredadas del modelo base Qwen3-0.6B.
- Modo de razonamiento ("thinking mode") con etiquetas `<think>`: en las pruebas realizadas, las respuestas comienzan con una línea `<think>` y el razonamiento se desarrolla dentro del bloque.
- Razonamiento multi-paso básico, limitado por el tamaño del modelo (0.6B).
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües específicas en la documentación proporcionada.
- Inferencia en NPU Intel mediante OpenVINO GenAI (`LLMPipeline` con dispositivo `"NPU"`).

## Casos de uso

- Asistentes conversacionales locales en portátiles Intel: el modelo se ejecuta íntegramente en la NPU con un working set de 1.537 MiB, lo que permite mantener conversaciones sin cargar la CPU ni la GPU y con bajo consumo energético.
- Prototipado de pipelines de razonamiento en el borde: su modo `<think>` permite experimentar con cadenas de razonamiento en hardware de consumo, útil para validar flujos antes de escalar a modelos mayores.
- Aplicaciones de privacidad por diseño: al ejecutarse en local sobre la NPU, los datos no salen del dispositivo, adecuado para entornos con requisitos de confidencialidad.
- Generación de texto de baja latencia en sistemas embebidos o industriales con procesadores Intel Core Ultra: los 69-72 tokens/s de decodificación medidos permiten respuestas interactivas.
- Filtrado y clasificación de texto en tiempo real: tareas de etiquetado, resumen corto o reescritura que se beneficien de un modelo pequeño con contexto de chat.
- Evaluación comparativa de backends de inferencia: sirve como referencia para medir el rendimiento de NPU frente a CPU/GPU en el mismo modelo y cuantización, gracias a los registros publicados en windows-llm-zoo.
- Educación y demos de IA en dispositivo: el tamaño de 0.4 GB y la carga en 0.9-2.0 s (con caché) facilitan demostraciones de IA generativa local.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de inferencia en hardware, no benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K no están disponibles en la información proporcionada).

| Métrica (Intel Core Ultra 9 386H, NPU) | Valor |
|---|---|
| Decodificación en frío | 69.3 tokens/s (mediana de 2 ejecuciones, dispersión 1.1 %) |
| Decodificación en caliente | 71.7 tokens/s |
| Prefill en frío | 72.5 tokens/s, 262 ms hasta el primer token |
| Working set máximo | 1.537 MiB (proceso) |
| Carga | 2.0 s en la primera ejecución; 0.9 s en las siguientes (misma CACHE_DIR) |
| Primera carga registrada | 32.7 s |
| Verificación de salida | 6/6 PASS (text check de edge-llm-bench); 128 nuevos tokens por respuesta en las dos respuestas medidas |

Entorno de medida: OpenVINO GenAI 2026.4.1, `LLMPipeline(..., "NPU", CACHE_DIR=...)`, prompt `short-chat` de edge-llm-bench (19 tokens), decodificación greedy, máximo 128 tokens nuevos, Windows 11 Home build 26200.9711, driver NPU 32.0.100.4841, 31.5 GB de RAM. Se descarta la ejecución 1 según la regla de windows-llm-zoo; se computan las ejecuciones 2 y 3.

## Requisitos de hardware

- VRAM/RAM: working set medido de 1.537 MiB en NPU; el repositorio ocupa 0.4 GB en disco.
- Hardware objetivo: NPU de procesadores Intel Core Ultra (medido en Core Ultra 9 386H con driver NPU 32.0.100.4841).
- GPU dedicadas: no se han publicado mediciones para A100, H100 ni RTX 4090 en la información disponible; el formato OpenVINO IR puede ejecutarse en CPU y GPU Intel, pero no hay datos de rendimiento.
- Cabe en equipos de consumo: sí, está diseñado para portátiles con NPU Intel; el requisito principal es disponer de NPU y del driver adecuado.
- Despliegue: OpenVINO GenAI (`LLMPipeline` con dispositivo `"NPU"` y `CACHE_DIR`); también es posible usar el runtime de OpenVINO. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: 262 ms hasta el primer token en frío; 69-72 tokens/s de decodificación; carga en 0.9-2.0 s con caché y 32.7 s en la primera carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-int4-sym-g128-ov (este) | ~0.6B | int4 simétrico, g128, ratio 1.0 | No disponible | Apache 2.0 | OpenVINO IR | Optimizado para NPU Intel; 69-72 tok/s medidos |
| OpenVINO/Qwen3-0.6B-int4-ov | ~0.6B | int4 asimétrico, g128, ratio 0.8 | No disponible | Apache 2.0 | OpenVINO IR | Mismo modelo base, pero no cumple los requisitos de la guía NPU según el autor |
| Qwen/Qwen3-0.6B | ~0.6B (0.8B según Hub) | FP original | No disponible | Apache 2.0 | safetensors (Transformers) | Modelo base sin cuantizar |
| mlboydaisuke/qwen3-0.6b-CoreAI-official | ~0.6B | No disponible | No disponible | No disponible | CoreAI | Otra conversión del mismo autor para otro runtime |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento cognitivo frente a alternativas.

## Limitaciones y advertencias

- Modelo de 0.6B: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparación con modelos de mayor tamaño; propenso a errores en tareas complejas.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en preguntas factuales y generación de código.
- En las pruebas, todas las respuestas terminaron dentro del bloque `<think>` al limitar a 128 tokens nuevos, sin llegar a `</think>`; hay que ajustar el límite de generación o el prompt para obtener respuestas finales.
- La cuantización int4 puede degradar la calidad respecto al modelo en precisión completa; no se han publicado evaluaciones de calidad de esta conversión concreta.
- Requiere hardware Intel con NPU y versiones específicas del toolchain (OpenVINO 2026.4.1, openvino-genai); la compatibilidad con otras plataformas no está documentada.
- Idiomas soportados no documentados en esta ficha; deben consultarse en la model card del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-0.6B y las licencias de las dependencias (OpenVINO, NNCF).
- Sin descargas ni likes en el momento de la consulta; modelo de un autor individual, sin validación comunitaria amplia.
- El modelo se distribuye como artefacto de inferencia (IR), no como pesos entrenables; no es adecuado para fine-tuning directo sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-int4-sym-g128-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Guía OpenVINO GenAI para NPU: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
- Conversión alternativa del mismo autor: https://huggingface.co/mlboydaisuke/qwen3-0.6b-CoreAI-official
- Repositorio de benchmarks windows-llm-zoo: https://github.com/john-rocky/windows-llm-zoo
- Resultados registrados: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/results/Qwen3-0.6B/openvino-genai_npu_npu-sym-g128.json
- Ejecuciones en bruto: https://github.com/john-rocky/windows-llm-zoo/tree/894114e9bdc9346ce66927d667a6743a12df190c/raw/walk-timed-b/Qwen3-0.6B/openvino-genai_npu_npu-sym-g128/
- Script de ejecución: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/pc/run_ovgenai.py
- Log de la primera carga: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/raw/diag/q06.log
- edge-llm-bench: https://github.com/john-rocky/edge-llm-bench
