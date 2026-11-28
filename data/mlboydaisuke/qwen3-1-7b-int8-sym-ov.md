# mlboydaisuke/Qwen3-1.7B-int8-sym-ov

## Resumen

Qwen3-1.7B-int8-sym-ov es una exportacion a OpenVINO IR del modelo Qwen/Qwen3-1.7B (revision `70d244c`), publicada por el usuario mlboydaisuke. Se trata de una cuantizacion simetrica int8 con pesos por canal (per-channel), empaquetada como formato OpenVINO para su ejecucion en la NPU (unidad de procesamiento neuronal) de los procesadores Intel Core Ultra. El modelo base Qwen3-1.7B es un transformer denso de 1.700 millones de parametros desarrollado por el equipo Qwen de Alibaba, con capacidades de razonamiento en modo thinking y no-thinking.

La relevancia de esta ficha radica en que documenta un caso practico de despliegue de un LLM en hardware de consumo (NPU integrada en portatiles Intel Core Ultra), con mediciones reales de latencia, throughput y fidelidad de respuestas frente al modelo original en fp32. El autor senala explicitamente que la guia oficial de OpenVINO GenAI para NPU recomienda pesos simetricos de 4 bits para LLM, y que int8 no figura en esa lista; por tanto, este repositorio es un experimento de validacion de una configuracion no estandar.

El repositorio ocupa 1,7 GB y esta publicado bajo licencia Apache 2.0, heredada del modelo base. No se proporcionan datos sobre idiomas soportados ni sobre el proceso de entrenamiento del modelo original en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B); exportado a OpenVINO IR |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-1.7B soporta contexto largo, pero no se detalla aqui) |
| Tipos de cuantizacion | int8 simetrico per-channel (pesos); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer denso de la familia Qwen3. Esta exportacion concreta no reentrena ni modifica los pesos: aplica cuantizacion simetrica int8 por canal a los pesos y los convierte a formato OpenVINO IR para inferencia en NPU Intel. El autor indica que la revision del modelo base utilizada es `70d244c`.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset, ni tecnicas de alineacion (RLHF/DPO) del modelo base. La innovacion tecnica destacable de esta ficha es el propio pipeline de despliegue: uso de `NPUW_LLM_PREFILL_CHUNK_SIZE=64` para procesar el prompt en trozos de 64 tokens en lugar de un unico pase con padding a 1.024 tokens, y `CACHE_DIR` para persistir el modelo compilado y evitar recompilaciones. Tambien se documenta el flag `NPU_COMPILER_DYNAMIC_QUANTIZATION="NO"`, que mejora la fidelidad en prompts largos a costa de un aumento muy notable de latencia.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Modo thinking y no-thinking: el modelo base Qwen3 soporta ambos; en el ejemplo de la model card se usa `/no_think` para desactivar el bloque de razonamiento.
- Respuesta a preguntas factuales cortas: en la evaluacion del autor, 18 de 20 preguntas cortas coincidieron con la respuesta del modelo original en fp32.
- Razonamiento basico y aritmetica simple: el autor prueba preguntas como si 17 es primo.
- Recuperacion de informacion en prompts largos (hasta 1.000 tokens en las pruebas): 155 de 160 aciertos en la NPU con la configuracion por defecto.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatiles Intel Core Ultra: el modelo se ejecuta en la NPU integrada con OpenVINO GenAI, liberando la CPU y la GPU para otras tareas. Adecuado para chatbots de escritorio con requisitos de privacidad, ya que no requiere conexion a la nube.
- Respuesta a preguntas sobre documentos cortos: con prompts de hasta 1.000 tokens, el modelo recupera hechos insertados en un pasaje (155/160 aciertos en las pruebas del autor), lo que lo hace util para resumen y QA sobre notas o correos.
- Clasificacion y extraccion de informacion en local: tareas de etiquetado o extraccion de entidades en flujos de trabajo ofimaticos, aprovechando el bajo consumo de la NPU.
- Prototipado rapido de aplicaciones LLM en Windows: el snippet de la model card permite tener un pipeline funcional en pocas lineas con `openvino-genai==2026.4.1.0`, util para validar ideas antes de escalar a hardware mayor.
- Educacion e investigacion sobre cuantizacion: el repositorio incluye registros (`records/`) con mediciones de latencia, throughput y fidelidad que sirven como referencia para estudiar el impacto de int8 en NPU frente a fp32 en CPU.
- Generacion de texto en entornos con restricciones de energia: el modo Balanced de MSI Center y el bajo consumo de la NPU lo hacen adecuado para dispositivos alimentados por bateria donde una GPU dedicada no es viable.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor en un portatil con Intel Core Ultra 9 386H, Windows 11, driver NPU 32.0.100.5540, OpenVINO GenAI 2026.4.1 y modo Balanced, con decodificacion greedy (`do_sample=False`). No son benchmarks academicos estandar (MMLU, HumanEval, GSM8K), sino pruebas de fidelidad y velocidad.

| Metrica | Resultado |
|---|---|
| Acuerdo con el modelo original fp32 (20 preguntas cortas, thinking off) | 18/20 |
| Tiempo al primer token (21 prompts de 23-40 tokens, con `PREFILL_CHUNK_SIZE=64`) | 53 ms (mediana de 3 ejecuciones) |
| Throughput (mismos prompts) | 30,9 tokens/s |
| Tiempo al primer token sin `PREFILL_CHUNK_SIZE` | 295 ms |
| Throughput sin `PREFILL_CHUNK_SIZE` | 30,5 tokens/s |
| Tiempo al primer token con prompt de 512 tokens (con chunking) | 365 ms |
| Tiempo al primer token con prompt de 1.000 tokens (con chunking) | 761 ms |
| Tiempo al primer token con prompt de 512 tokens (sin chunking) | 297 ms |
| Tiempo al primer token con prompt de 1.000 tokens (sin chunking) | 290 ms |
| Recuperacion de hechos en prompts largos (160 pruebas, NPU con configuracion por defecto) | 155/160 |
| Recuperacion de hechos en prompts largos (160 pruebas, CPU fp32) | 157/160 |
| Recuperacion con `NPU_COMPILER_DYNAMIC_QUANTIZATION="NO"` | 157/160 (pero ~12 s por respuesta a 1.000 tokens) |
| Consistencia de respuestas con y sin chunking (108 prompts > 64 tokens) | 107/108 identicas en tokens; 1 reformulada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware de destino: NPU integrada en Intel Core Ultra (probado en Core Ultra 9 386H).
- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en la NPU y consume memoria del sistema. El repositorio ocupa 1,7 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no aplica para esta exportacion concreta (orientada a NPU). El modelo base Qwen3-1.7B en otros formatos puede ejecutarse en GPU consumer, pero no se detalla en la informacion disponible.
- Cabe en consumer GPU: el modelo base de 1,7B en cuantizaciones de 4-8 bits cabe en GPUs consumer con 4-8 GB de VRAM; esta exportacion esta pensada para NPU, no para GPU.
- Opciones de despliegue: OpenVINO GenAI (`openvino-genai==2026.4.1.0`) con `LLMPipeline` y dispositivo `"NPU"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 53 ms al primer token y 30,9 tokens/s en prompts cortos con chunking de 64; en prompts de 1.000 tokens, 761 ms al primer token con chunking y 290 ms sin chunking (a costa de mayor uso de memoria durante el prefill).
- Nota: la primera ejecucion compila el modelo y tarda unos 29 s si se lanza por ssh con power throttling activo; `CACHE_DIR` evita recompilaciones posteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-int8-sym-ov (este) | 1,7B | no disponible | OpenVINO IR int8 | apache-2.0 | Hugging Face, 188 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en esta ficha | safetensors (fp32/bf16) | apache-2.0 | Hugging Face |
| Exportaciones OpenVINO de Qwen3-1.7B en 4-bit simetrico | 1,7B | no disponible | OpenVINO IR int4 | apache-2.0 | Referenciadas en la guia OpenVINO GenAI para NPU |

La comparativa con alternativas de otros fabricantes (p. ej. Llama 3.2 1B, Gemma 2 2B) no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es el formato y la precision: int8 en NPU frente a fp32 en CPU, con una perdida de fidelidad medida de 2 aciertos sobre 160 en recuperacion de hechos en prompts largos.

## Limitaciones y advertencias

- Perdida de fidelidad en prompts largos: la NPU con int8 fallo 3 de 160 pruebas de recuperacion de hechos que el modelo fp32 en CPU acerto; los fallos se concentraron en un numero de 4 digitos en la primera frase de prompts de 512, 768 y 1.000 tokens.
- El propio autor advierte que la guia oficial de OpenVINO GenAI para NPU recomienda pesos simetricos de 4 bits, no int8; esta configuracion es experimental y no esta validada oficialmente.
- El modo thinking requiere muestreo (temperature 0.6-0.7, top_p 0.8-0.95, top_k 20); Qwen desaconseja decodificacion greedy en thinking mode. Las mediciones del autor usan greedy solo para comparabilidad.
- `NPUW_LLM_PREFILL_CHUNK_SIZE=64` mejora el tiempo al primer token en prompts cortos pero lo empeora en prompts largos (761 ms frente a 290 ms a 1.000 tokens).
- `NPU_COMPILER_DYNAMIC_QUANTIZATION="NO"` recupera fidelidad pero multiplica la latencia (~12 s por respuesta a 1.000 tokens), lo que lo hace inviable para uso interactivo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo base de 1,7B tiene capacidad limitada de razonamiento frente a modelos mayores.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3-1.7B y las condiciones de OpenVINO.
- Dependencia de version concreta: `openvino-genai==2026.4.1.0` y driver NPU 32.0.100.5540; otras versiones pueden comportarse de forma distinta.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue homogeneo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-int8-sym-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Guia OpenVINO GenAI para NPU: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
- Registros de mediciones del autor: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-int8-sym-ov/tree/main/records
- Repositorio windows-model-zoo (referencia del criterio QA20): https://github.com/john-rocky/windows-model-zoo/blob/8baf723b99c801c3cf98041d80a332654bbf1b7e/PLAN.md#how-to-read-the-qa20-line
- Mejores practicas de Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B#best-practices
