# netprojects/Qwen3.8-27B-hermes-adapted-MLX-3bit

## Resumen

Qwen3.8-27B-hermes-adapted-MLX-3bit es una cuantizacion en formato MLX de 3 bits del modelo harness-hub/Qwen3.8-27B-hermes-adapted, un fine-tuning mediante LoRA (rango 32, alpha 64) sobre Qwen/Qwen3.8-27B. El adaptador original fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) para funcionar como motor del agente Hermes Agent en tareas de ingenieria de software y terminal. Esta version, publicada por el usuario netprojects, fusiona el adaptador con el modelo base, incluye el codificador de vision y la capa MTP de Qwen, y lo convierte a MLX con mlx-vlm para su ejecucion en Apple Silicon.

El modelo resuelve el problema de desplegar un LLM de 27B con capacidades de agente y vision en Macs de memoria moderada. Con 28.489.216.752 parametros reales (segun safetensors) y un repositorio de 13,8 GB, la cuantizacion usa 3 bits afines con grupo 64 en la mayoria de capas lineales, mientras que el embedding de tokens, la capa de salida y las capas mas sensibles (v_proj, down_proj de las primeras y ultimas ocho capas y cada tercera capa intermedia) se mantienen en 4 bits, resultando en unos 3,91 bits por peso de media.

Es relevante ahora porque permite ejecutar un modelo orientado a agentes de codigo en un Mac de 24 GB de memoria unificada, con un pico de 14,6 GB para un prompt de 8K tokens y una fidelidad del 91,7% en el siguiente token respecto a bf16. La licencia Apache 2.0 facilita su uso comercial, aunque la perdida de fidelidad frente a las variantes de 6 y 8 bits debe tenerse en cuenta en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP (multi-token prediction), basado en Qwen3.8-27B; conversion MLX via mlx-vlm |
| Parametros totales | 28.489.216.752 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; Hermes Agent requiere al menos 64.000 tokens |
| Tipos de cuantizacion | 3 bits afines (grupo 64) en la mayoria de capas lineales; 4 bits en embedding, capa de salida, v_proj y down_proj sensibles; ~3,91 bits por peso de media |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa texto e imagenes, con un codificador de vision y una capa de prediccion multi-token (MTP) que se conservan en esta conversion. Sobre el se aplico un adaptador LoRA de rango 32 y alpha 64, entrenado por harness-hub con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con un checkpoint en el paso 160 de los 1000 planificados. El objetivo del entrenamiento fue optimizar el comportamiento del agente Hermes Agent en tareas de ingenieria de software y terminal, no en dialogo general.

La cuantizacion la realiza netprojects fusionando el adaptador (revision 09fb741) con el modelo base (revision 3756181) y convirtiendo a MLX con mlx-vlm. La estrategia de cuantizacion mixta protege las capas mas sensibles a la precision (embedding, salida, v_proj y down_proj de capas concretas) manteniendolas en 4 bits, mientras que el resto de capas lineales baja a 3 bits, lo que reduce el tamano a 13,8 GB con una perdida de fidelidad medida de 0,0824 de KL frente a bf16.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador de vision incluido en la conversion.
- Comportamiento de agente para tareas de ingenieria de software: resolucion de bugs, edicion de codigo y ejecucion de comandos de terminal.
- Soporte de tool calling y function calling, orientado a la integracion con Hermes Agent.
- Razonamiento multi-paso y uso de herramientas en entornos de agente.
- Modo thinking desactivable; el adaptador fue entrenado y evaluado con thinking off, por lo que se recomienda mantenerlo desactivado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codigo en local para Mac: servir el modelo con `mlx_lm.server` y conectarlo a Hermes Agent para resolver tareas como localizar y corregir tests fallidos (`hermes chat -q "Find out why the tests in tests/test_parser.py fail and fix the bug."`), aprovechando el entrenamiento especifico en SWE-bench Pro y Terminal-Bench.
- Automatizacion de terminal y operaciones de sistema: el adaptador fue entrenado en tareas de terminal, por lo que puede ejecutar comandos, interpretar su salida y encadenar pasos con menos turnos que el modelo base.
- Desarrollo asistido en equipos con 24 GB de memoria unificada: es la variante recomendada para Macs de 24 GB, permitiendo un asistente de codigo de 27B sin GPU dedicada.
- Revision y refactorizacion de codigo en pipelines locales: con tool calling puede integrarse en scripts que invoquen el servidor OpenAI-compatible de mlx-lm para analizar repositorios.
- Prototipado de agentes con vision: al conservar el codificador de vision, puede procesar capturas de pantalla o diagramas junto con instrucciones de texto en flujos de automatizacion.
- Evaluacion e investigacion de cuantizacion: sirve como referencia practica para medir el impacto de 3 bits frente a bf16 (91,7% de coincidencia en siguiente token, KL 0,0824) en tareas de agente.
- Despliegue de bajo consumo en Apple Silicon: el pico de 14,6 GB con prompt de 8K permite ejecutar el modelo junto con otras aplicaciones en un Mac de 24 GB.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub) bajo Hermes Agent con thinking off, comparando el adaptador frente al modelo base:

| Benchmark | Modelo base | Adaptador hermes | Mejora |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% | +13,7 puntos |
| Terminal-Bench 2.1 | 44,7% | 58,8% | +14,1 puntos |

El adaptador usa menos del 40% de los turnos del modelo base en las tareas que ambos resuelven y aproximadamente la mitad de tokens generados. Con thinking off iguala al modelo base con thinking en su maximo esfuerzo (xhigh) usando entre 3,5 y 4,4 veces menos tokens.

Metricas de fidelidad de la cuantizacion de esta build (3 bits) frente a bf16:

| Metrica | Valor |
|---|---|
| Coincidencia en siguiente token vs bf16 | 91,7% |
| KL vs bf16 | 0,0824 |
| GSM8K (50 preguntas) | 45/50 |
| Pico de memoria con prompt de 8K | 14,6 GB |
| Memoria de Mac sugerida | 24 GB+ |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 14,6 GB de pico con prompt de 8K tokens; repositorio de 13,8 GB.
- Memoria de Mac sugerida: 24 GB o superior.
- GPU: exclusivamente Apple Silicon (MLX); no aplica a A100, H100 ni RTX 4090, ya que el formato es MLX y no CUDA.
- Cabe en Macs consumer de 24 GB; para 16 GB existe la variante 2.5-bit (11,8 GB) como opcion de compromiso.
- Despliegue: mlx-lm (servidor OpenAI-compatible con `mlx_lm.server`), mlx-vlm y LM Studio en modo MLX. Para llama.cpp, Ollama o LM Studio con GGUF existe la build GGUF del mismo autor (Q3_K_M de 13,8 GB para 24 GB).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa entre las builds MLX del mismo modelo, que son las alternativas directas para el mismo caso de uso:

| Build | Tamano | Coincidencia siguiente token | KL vs bf16 | GSM8K (50) | Pico memoria 8K | Mac sugerido |
|---|---|---|---|---|---|---|
| 2.5-bit | 11,8 GB | 85,4% | 0,2461 | 44/50 | 13,8 GB | 24 GB |
| 3-bit (esta) | 13,8 GB | 91,7% | 0,0824 | 45/50 | 14,6 GB | 24 GB |
| 4-bit | 16,3 GB | 96,1% | 0,0192 | 43/50 | 17,1 GB | 32 GB |
| 6-bit (recomendada) | 23,1 GB | 98,5% | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| 8-bit | 30,0 GB | 99,2% | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

Frente a modelos de otros fabricantes del mismo tamano o tarea, no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits reduce la fidelidad: solo el 91,7% de coincidencia en el siguiente token frente a bf16 y un KL de 0,0824, muy superior al de las builds de 6 y 8 bits. Para produccion con requisitos estrictos se recomienda la build de 6 bits.
- El adaptador fue entrenado y evaluado con thinking desactivado; usarlo con thinking activado puede degradar el comportamiento esperado.
- El fine-tuning esta orientado a tareas de agente de codigo y terminal; su rendimiento en dialogo general o dominios ajenos no esta documentado.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingue mas alla del comportamiento del modelo base.
- Riesgo de alucinacion inherente a los LLM, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.8-27B y del adaptador original.
- El checkpoint del adaptador corresponde al paso 160 de 1000 planificados, por lo que el entrenamiento no esta completo.
- Requiere al menos 64.000 tokens de contexto para Hermes Agent; la longitud de contexto nativa del modelo no esta indicada en la informacion disponible.
- Solo es ejecutable en Apple Silicon con MLX; no es compatible con CUDA ni con GPUs NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-3bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6 bits recomendada: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Build 2.5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Build GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-GGUF
- Repositorio de Hermes Agent: https://github.com/NousResearch/hermes-agent
- Perfil del autor de las cuantizaciones: https://huggingface.co/netprojects
