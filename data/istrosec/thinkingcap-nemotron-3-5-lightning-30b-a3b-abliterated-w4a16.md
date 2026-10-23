# IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-W4A16

## Resumen

ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-W4A16 es una cuantización de solo pesos a INT4 (W4A16, GPTQ con grupos de 64 y activaciones en bf16) del checkpoint abliterado `IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated`, a su vez una variante sin censura del `bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B`. Lo publica el usuario IstroSec y su objetivo es hacer servible en GPUs sin soporte de FP4 ni FP8 (Ampere y posteriores) un modelo híbrido Mamba2 + atención + MoE de 31.577.940.288 parámetros totales, reduciendo el peso de 65,8 GB en bf16 a 20,5 GB.

El interés práctico está en la combinación de tres factores: una arquitectura `nemotron_h` con 128 expertos enrutados por capa MoE y una cabeza MTP (multi-token prediction) conservada en bf16 para decodificación especulativa; un proceso de cuantización calibrado y verificado con métricas de divergencia (KL 0,0215 frente al modelo bf16 de origen); y un perfil "abliterated" que reduce los rechazos de 99/100 a 26/100 en el protocolo de evaluación del autor. Todo ello con licencia openmdw-1.1 y únicamente idioma inglés.

Es relevante ahora porque permite ejecutar un MoE de ~30B con unos 3B parámetros activos en vLLM sobre hardware consumer o de gama media profesional (sm80+), algo que las builds FP8 o bf16 del mismo modelo no permiten por tamaño. El autor probó la build en una DGX Spark (GB10) con vLLM 0.30.0, `--max-model-len 32768` y MTP activo, obteniendo respuestas correctas y una tool call bien formada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` híbrida: 23 capas Mamba2, 6 capas de atención y 23 capas MoE con 128 expertos enrutados + 1 experto compartido por capa; cabeza MTP |
| Parametros totales | 31.577.940.288 (dato real de safetensors) |
| Parametros activos | Aproximadamente 3.000 millones (la nomenclatura A3B indica ~3B activos; la cifra exacta no se detalla en la información disponible) |
| Longitud de contexto | 32.768 tokens configurados en la prueba de vLLM (`--max-model-len 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | INT4 W4A16 GPTQ, simétrica, grupos de 64, una escala bf16 por grupo; builds alternativas del mismo autor: NVFP4A16 (22,1 GB) y FP8-DYNAMIC (35,0 GB); builds GGUF en repositorio aparte |
| Idiomas soportados | Inglés (`en`) |
| Licencia | openmdw-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors en formato compressed-tensors (6.004 capas `Linear` cuantizadas); repositorio de 20,5 GB |

## Arquitectura y entrenamiento

La arquitectura es híbrida estilo Nemotron-H: intercala capas Mamba2 (state space model) con capas de atención y capas MoE. En concreto, el proceso de cuantización documentado afecta a las 23 capas MoE (128 expertos enrutados más el experto compartido en cada una), a las proyecciones `in_proj` y `out_proj` de las 23 capas Mamba2 y a las proyecciones `q/k/v/o` de las 6 capas de atención, sumando 6.004 objetos `Linear`. La cabeza MTP se mantiene en bf16 y aparece listada en `quantization_config.ignore`, lo que permite usarla como decodificación especulativa en vLLM sin pérdida de precisión en el borrador.

La cuantización se generó con llm-compressor 0.14.0, esquema W4A16 con grupo de 64 en lugar del 128 del preset (1856, la anchura de los expertos, no es divisible por 128 pero sí por 64). Los pesos se cuantizaron con GPTQ (`GPTQModifier`, ajustes por defecto), lo que exige calibración: se usaron las primeras 256 conversaciones de `HuggingFaceH4/ultrachat_200k` (`train_sft`), renderizadas con la plantilla de chat del modelo y truncadas a 2.048 tokens. Dado que cada experto enrutado solo recibe los tokens que el router le asigna, los expertos poco elegidos se cuantizaron con menos muestras, un detalle relevante para interpretar la calidad de los expertos de cola. No se documentan en la información disponible el número de tokens de preentrenamiento del modelo base ni las etapas de RLHF/DPO aplicadas por el autor original.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia y soporte de system prompt.
- Modo de razonamiento ("thinking") activado por defecto; se desactiva por petición con `chat_template_kwargs: {"enable_thinking": false}`, lo que permite separar latencia de razonamiento de la respuesta final.
- Tool calling / function calling: soportado en vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_coder`; en la prueba del autor se generó una llamada `get_weather` bien formada.
- Decodificación especulativa mediante la cabeza MTP integrada (5 tokens especulativos en la prueba, con una tasa de aceptación del 59%).
- Generación de código: una de las cuatro peticiones de validación fue una tarea de código y se resolvió correctamente, aunque no se publican resultados de HumanEval ni similares.
- Capacidades multilingües: limitadas al inglés según la model card.
- Comportamiento "uncensored"/abliterated: reducción drástica de rechazos (26/100 frente a 99/100 del modelo original) sin reentrenamiento supervisado adicional documentado.
- Capacidades de visión o audio: no disponibles en esta build.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, apta para despliegue como API compatible con OpenAI a través de vLLM.

## Casos de uso

- Asistente conversacional de contexto largo en inglés: con 32.768 tokens de ventana en vLLM puede mantener diálogos multi-turno con documentos extensos adjuntos (contratos, historiales de incidencias) sin truncar; el autor validó cuatro peticiones concurrentes con `--max-num-seqs 8`.
- Generación y revisión de código en pipelines de CI/CD: al soportar tool calling y auto tool choice, el modelo puede invocarse desde un agente que consulte repositorios, lance tests o abra PRs, usando vLLM como backend compatible con la API de OpenAI.
- Agentes con razonamiento multi-paso: el modo thinking por defecto más la cabeza MTP permiten cadenas de razonamiento más largas con menor coste por token efectivo (aceptación media de 3,93 tokens especulativos), adecuado para orquestadores de tareas.
- Inferencia económica en GPUs Ampere: al ocupar 20,5 GB, cabe en una RTX 3090 o A10 de 24 GB y en A100 40 GB, lo que habilita prototipos y entornos de staging donde no hay FP8 ni FP4.
- Servicio de altas prestaciones con `--async-scheduling`: combinado con MTP y tool calling, encaja en un endpoint tipo OpenAI para equipos que necesitan un MoE de ~30B con latencia controlada en hardware no Blackwell.
- Investigación sobre alineación y abliteration: el par de métricas (tasa de rechazo sobre 100 prompts dañinos y divergencia KL frente al checkpoint bf16) lo convierte en un sujeto de estudio para medir cuánto degrada la cuantización el comportamiento "uncensored".
- Evaluación comparativa de esquemas de cuantización: al existir builds W4A16, NVFP4A16 y FP8-DYNAMIC del mismo checkpoint, sirve para estudiar el compromiso tamaño/KL en un modelo híbrido con expertos poco activados.
- Procesamiento por lotes de textos en inglés: generación de resúmenes o extracción de datos sobre corpus en inglés con `temperature 1.0, top_p 0.95` como muestreo recomendado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación publicada es el protocolo de Heretic con 100 prompts dañinos y 100 inofensivos, con thinking desactivado, comparando builds del mismo modelo:

| Modelo | Tamano | Rechazos (100 daninos) | KL frente a bf16 abliterated |
|---|---|---|---|
| bf16 abliterated (origen) | 65,8 GB | 23 / 100 | — |
| FP8-DYNAMIC | 35,0 GB | 20 / 100 | 0,0134 |
| NVFP4A16 | 22,1 GB | 24 / 100 | 0,0148 |
| W4A16 (esta build) | 20,5 GB | 26 / 100 | 0,0215 |

El autor advierte que la decodificación es greedy pero los kernels no son deterministas bit a bit: dos ejecuciones del bf16 dieron 21 y 23 rechazos, por lo que diferencias de pocos rechazos entre builds no son significativas. La procedencia completa: el ThinkingCap original rechaza 99/100 con thinking desactivado; la abliteración en bf16 lo baja a 21/100 con KL 0,0458 frente al original; esta cuantización añade un KL de 0,0215 adicional. En rendimiento de decodificación especulativa, con 5 tokens especulativos y temperatura 0, vLLM aceptó 820 de 1.400 tokens propuestos (59%), con longitud media de aceptación 3,93. La velocidad no se midió.

## Requisitos de hardware

- VRAM estimada para inferencia: 20,5 GB solo de pesos; hay que sumar caché de estados Mamba2 y KV cache. En la práctica, un mínimo de 24 GB con `--max-num-seqs` bajo (estimación a partir del tamaño del repositorio; el autor no publica cifra de VRAM). Con 40-48 GB se puede ampliar el número de secuencias concurrentes.
- GPU recomendadas: cualquier GPU con sm80 o superior en vLLM (Ampere, Ada, Hopper, Blackwell). El autor probó únicamente en una DGX Spark (GB10); no hay datos de A100, H100 ni RTX 4090 en la información disponible.
- Cabe en GPU consumer: sí, en RTX 3090 o RTX 4090 de 24 GB, siempre con `--max-num-seqs` reducido; es el motivo declarado de esta build (GPUs sin FP4/FP8, como Ampere).
- Aviso de memoria en vLLM: en GPUs con menos memoria, el arranque puede fallar con `max_num_seqs (1024) exceeds available Mamba cache blocks`; la solución indicada es bajar `--max-num-seqs`.
- Opciones de despliegue: vLLM (probado con 0.30.0, imagen `vllm/vllm-openai:v0.30.0`) con `--reasoning-parser nemotron_v3 --enable-auto-tool-choice --tool-call-parser qwen3_coder --speculative-config '{"method":"mtp","num_speculative_tokens":5}'`; Transformers a través del loader de llm-compressor, que descuantiza a bf16 y consume unos 66 GB de memoria; llama.cpp y Ollama no son compatibles con esta build (formato compressed-tensors), habría que usar los builds GGUF del mismo autor.
- Latencia y throughput: no medidos por el autor ("Speed was not measured"). Como referencia indirecta, la aceptación del 59% con 5 tokens especulativos y longitud media 3,93 reduce el número de pasos de decodificación, pero no se traduce en cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL vs bf16 | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| W4A16 (esta build) | 31,58B totales / ~3B activos | 32.768 configurados | 20,5 GB | 0,0215 | 26/100 | openmdw-1.1 | HuggingFace, vLLM sm80+ |
| NVFP4A16 (mismo autor) | 31,58B / ~3B activos | no disponible | 22,1 GB | 0,0148 | 24/100 | openmdw-1.1 | HuggingFace, vLLM |
| FP8-DYNAMIC (mismo autor) | 31,58B / ~3B activos | no disponible | 35,0 GB | 0,0134 | 20/100 | openmdw-1.1 | HuggingFace, requiere Ada o superior |
| bf16 abliterated (origen) | 31,58B / ~3B activos | no disponible | 65,8 GB | — | 23/100 | openmdw-1.1 | HuggingFace |
| ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B (original) | 31,58B / ~3B activos | no disponible | no disponible | referencia | 99/100 con thinking off | no disponible en esta informacion | HuggingFace (bottlecapai) |
| Builds GGUF del mismo autor | 31,58B / ~3B activos | no disponible | no disponible | no disponible | no disponible | openmdw-1.1 | HuggingFace, llama.cpp |

No se dispone en la información proporcionada de comparaciones con modelos de otras familias y tamaño similar; la comparativa se limita a las distintas builds del mismo checkpoint.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminación de rechazos es intencionada y verificada (99/100 a 26/100 en prompts dañinos). No es apto para aplicaciones dirigidas al público sin filtros externos de seguridad.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Alucinación: no se publican métricas de veracidad ni evaluaciones de factualidad; al ser un modelo conversacional sin benchmarks estándar, el riesgo no está cuantificado.
- Licencia openmdw-1.1: es una licencia "other"; las condiciones exactas de uso comercial no se detallan en la información disponible y hay que consultar el fichero `LICENSE` del repositorio antes de desplegar en producción.
- Compatibilidad restringida: formato compressed-tensors, incompatible con llama.cpp, Ollama y herramientas que esperan GGUF o safetensors estándar. En Transformers la carga descuantiza a bf16 y consume unos 66 GB de memoria.
- Configuración delicada en vLLM: el arranque falla si `max_num_seqs` excede los bloques de caché Mamba disponibles; requiere ajuste manual en GPUs de 24 GB.
- El rendimiento solo se validó en una DGX Spark (GB10) con cuatro peticiones; no hay evidencia publicada en A100, H100 ni RTX 4090, ni mediciones de latencia o throughput.
- La decodificación no es determinista bit a bit, por lo que las diferencias de pocos rechazos entre builds no deben interpretarse como mejoras reales.
- Los expertos enrutados poco elegidos se calibraron con menos muestras, lo que puede degradar la calidad en dominios especializados poco representados en `ultrachat_200k`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-W4A16
- Modelo base abliterado (bf16): https://huggingface.co/IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated
- Modelo original de bottlecapai: https://huggingface.co/bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B
- Build NVFP4A16: https://huggingface.co/IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-NVFP4A16
- Build FP8-DYNAMIC: https://huggingface.co/IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-FP8-DYNAMIC
- Builds GGUF: https://huggingface.co/IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-GGUF
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
