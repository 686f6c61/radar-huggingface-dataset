# n8dgr8/ov_intent_analysis_sft-RKLLM-RK3588

## Resumen

Este repositorio contiene la conversión a formato RKLLM del modelo `guoxuter/ov_intent_analysis_sft`, un fine-tune de Qwen3.5-0.8B desarrollado por el equipo de OpenViking para el análisis de intención y la planificación de consultas en sistemas de recuperación aumentada (RAG). El modelo original se distribuye como safetensors de HuggingFace, pero para ejecutarlo en el NPU del SoC Rockchip RK3588 es necesario convertirlo al formato `.rkllm` mediante la herramienta `rkllm-toolkit`, que solo está disponible para arquitectura x86_64. Este repositorio ofrece esa conversión ya realizada, con cuantización W8A8, contexto máximo de 4096 tokens y uso de los 3 núcleos NPU del RK3588.

La relevancia de este modelo radica en que permite ejecutar un planificador de consultas especializado en hardware de bajo consumo y bajo coste, sin necesidad de GPU dedicada. El modelo decide si una consulta requiere recuperación de contexto, omite conversación trivial (chitchat) para no gastar tokens, y emite consultas estructuradas en JSON con los campos `skill`, `resource` y `memory`. Está pensado para integrarse como `query_planner` en el framework OpenViking, aunque puede usarse de forma independiente con cualquier servidor compatible con RKLLM.

El archivo incluido pesa 1.3 GB y está verificado con la librería `librkllmrt.so` versión 1.3.0 y el driver rknpu 0.9.8 sobre kernel 6.1. La licencia es Apache-2.0, tanto para el modelo base como para esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B, fine-tune SFT) |
| Parametros totales | 0.8 mil millones (0.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (max_context) |
| Tipos de cuantizacion | W8A8 (pesos y activaciones en 8 bits) |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (archivo `.rkllm`), generado con rkllm-toolkit 1.3.0 |

## Arquitectura y entrenamiento

El modelo base `guoxuter/ov_intent_analysis_sft` es un fine-tune supervisado (SFT) de Qwen3.5-0.8B, un transformer denso de 0.8 mil millones de parámetros. El entrenamiento se ha orientado específicamente a la tarea de análisis de intención y planificación de consultas para el sistema OpenViking: el modelo debe clasificar la entrada del usuario en tres arquetipos (operacional, informacional o conversacional) y, en función de ello, generar combinaciones de tipos de contexto y consultas estructuradas. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO.

La conversión a RKLLM se realizó con `rkllm-toolkit` 1.3.0, aplicando cuantización W8A8 (pesos y activaciones en 8 bits) con algoritmo de cuantización normal y nivel de optimización 1. El proceso requiere un equipo x86_64 (no existe versión aarch64 del toolkit) y un dataset de calibración con pares entrada/salida. El archivo resultante está optimizado para el NPU del RK3588 con 3 núcleos activos y un contexto máximo de 4096 tokens.

## Capacidades

- Generación de texto: produce respuestas en formato JSON estructurado con consultas de recuperación.
- Análisis de intención: clasifica la entrada del usuario en tres arquetipos (operacional, informacional, conversacional).
- Planificación de consultas: emite consultas con campos `skill`, `resource` y `memory` para sistemas RAG.
- Filtrado de chitchat: detecta conversación trivial y omite la generación de consultas, ahorrando tokens y coste de inferencia.
- Integración con OpenViking: funciona como `query_planner` mediante API compatible con Ollama (a través de `rkllama`).
- Inferencia en NPU: ejecución local en hardware Rockchip RK3588 sin necesidad de GPU o CPU x86.
- Soporte de tool calling: no documentado explícitamente, pero la salida estructurada en JSON puede interpretarse como llamadas a herramientas de recuperación.
- Capacidades multilingües: no disponibles (no especificado).

## Casos de uso

- Planificador de consultas en sistemas RAG: el modelo se integra como `query_planner` en OpenViking, decidiendo si una búsqueda necesita recuperación de contexto y generando las consultas estructuradas adecuadas. Su salida JSON permite enrutar las peticiones a los módulos de recuperación correspondientes.
- Asistentes conversacionales en edge computing: al ejecutarse en un RK3588, permite desplegar un asistente local que distingue entre preguntas factuales y conversación casual, evitando llamadas innecesarias a servicios externos de búsqueda.
- Ahorro de tokens en pipelines de LLM: al filtrar chitchat y no generar consultas cuando no son necesarias, reduce el consumo de tokens en sistemas que cobran por uso o que tienen límites de contexto.
- Automatización de recuperación de información en dispositivos IoT: el modelo puede ejecutarse en placas como Rockchip RK3588 para clasificar comandos de voz o texto y activar búsquedas en bases de conocimiento locales.
- Servidor de inferencia local con API compatible con OpenAI y Ollama: mediante `rkllm_openai_like_api` o `rkllama`, el modelo puede servir peticiones a aplicaciones existentes sin modificar su interfaz, sustituyendo a un LLM remoto.
- Prototipado rápido de agentes de búsqueda: gracias a su pequeño tamaño (0.8B) y a la conversión lista para RK3588, es adecuado para experimentar con agentes de recuperación en hardware de bajo coste antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card proporciona una comparativa de tiempos de inferencia en RK3588 con el mismo prompt, medida en wall time:

| Runtime | Wall time | Notas |
|---|---|---|
| Ollama / CPU (GGUF Q8) | 16.5 s | La salida cae en `thinking` salvo que se use `think:false` |
| rk-llama.cpp NPU (GGUF Q8) | 10.9 s | Requiere `--reasoning off` |
| RKLLM NPU (este archivo, W8A8) | ~9 s (1.8 s warm) | Prefill ~200 t/s, decode ~13 t/s |

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El rendimiento mostrado es específico para la tarea de planificación de consultas, que está dominada por la fase de prefill, donde el NPU del RK3588 ofrece una ventaja significativa frente a CPU.

## Requisitos de hardware

- SoC: Rockchip RK3588 (o compatible con RKLLM), con NPU de 3 núcleos activos.
- Memoria: no se especifica VRAM; el modelo ocupa 1.3 GB en disco y se ejecuta en la memoria del sistema (típicamente 8-16 GB en placas RK3588).
- Librería de runtime: `librkllmrt.so` versión 1.3.0 (debe coincidir con la versión del toolkit de conversión).
- Driver NPU: rknpu 0.9.8, verificado sobre kernel 6.1 vendor.
- GPU: no requiere GPU; la inferencia se realiza en el NPU.
- Opciones de despliegue: servidor `rkllama` (API compatible con Ollama), servidor minimalista con API OpenAI y Ollama (`rkllm_openai_like_api`), o integración directa mediante la API C de RKLLM.
- Latencia y throughput: prefill ~200 tokens/s, decode ~13 tokens/s en RK3588 (medido con el mismo prompt de la model card). La latencia total para una consulta típica es de ~9 s (1.8 s en caliente).

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría (planificadores de consultas para RAG) en la información proporcionada. Existen conversiones a RKLLM de otros modelos pequeños, como `Azurastar2903/Phi-3.5-mini-instruct-rk3588-1.2.1`, pero no se han publicado benchmarks comparativos de precisión o rendimiento entre ambos. El modelo base `guoxuter/ov_intent_analysis_sft` es un fine-tune de Qwen3.5-0.8B, por lo que su rendimiento en tareas generales es comparable al de otros modelos de 0.8B, pero su especialización en análisis de intención y planificación de consultas lo hace más adecuado para ese caso de uso concreto.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Decode lento (~13 t/s) debido a que la generación está limitada por el ancho de banda de memoria; no es adecuado para generaciones largas.
- La conversión está optimizada exclusivamente para RK3588; no es compatible con otros SoC sin re-conversión.
- El toolkit de conversión solo está disponible para x86_64; no se puede reproducir la conversión en un SBC ARM.
- No se han publicado evaluaciones de sesgos, alucinación o robustez del modelo.
- La salida en JSON estructurado puede fallar si el modelo genera texto no válido; se recomienda validación posterior.
- El uso comercial está permitido bajo licencia Apache-2.0, pero se debe verificar que el modelo base y sus dependencias cumplan los mismos términos.
- La integración con OpenViking requiere mantener el nombre del modelo exacto (`ollama/guoxuter/ov_intent_analysis_sft:v7_q8`) para que el prompt asociado se active correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/n8dgr8/ov_intent_analysis_sft-RKLLM-RK3588
- Modelo base: https://huggingface.co/guoxuter/ov_intent_analysis_sft
- Repositorio de Rockchip para RKLLM: https://github.com/airockchip/rknn-llm
- Model zoo de Rockchip: https://github.com/airockchip/rknn_model_zoo
- Servidor API compatible con OpenAI/Ollama para RKLLM: https://github.com/huonwe/rkllm_openai_like_api
- Documentación de RKLLM en Firefly Wiki: https://wiki.t-firefly.com/en/ROC-RK3588-RT/usage_rkllm.html
- Documentación de OpenViking sobre análisis de intención: https://zread.ai/volcengine/OpenViking/17-intent-analysis-and-type-quotas
