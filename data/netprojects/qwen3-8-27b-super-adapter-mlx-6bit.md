# netprojects/Qwen3.8-27B-super-adapter-MLX-6bit

## Resumen

Qwen3.8-27B-super-adapter-MLX-6bit es una conversión a formato MLX (Apple Silicon) en cuantización de 6 bits del modelo harness-hub/Qwen3.8-27B-super-adapter, que a su vez es el modelo Qwen/Qwen3.8-27B con un super-adapter LoRA fusionado en los pesos. El super-adapter combina tres especialistas de aprendizaje por refuerzo orientados a agentes de programación (pi, Hermes Agent y OpenCode) en un único conjunto de pesos, sin entrenamiento adicional tras la fusión. El resultado es un modelo multimodal (image-text-to-text) de 27.781 millones de parámetros, pensado para su uso local en Macs con Apple Silicon.

La relevancia de esta ficha reside en que empaqueta en un solo artefacto de 23,1 GB las capacidades de tres agentes de código especializados, con un compromiso medido de fidelidad frente a bf16 (99,5% de coincidencia en el siguiente token y KL de 0,0014) y un consumo de memoria de 23,4 GB con prompts de 8K tokens. Está publicado con licencia Apache 2.0 y biblioteca mlx, e incluye el encoder de visión y la capa MTP (multi-token prediction) de Qwen.

El modelo está orientado a flujos de trabajo agénticos de programación (resolución de bugs, ejecución de tests, uso de terminal) sobre harnesses concretos, y su model card documenta resultados en SWE-bench Pro (hard 51) y Terminal-Bench 2.1. La información pública disponible no detalla la longitud de contexto nativa ni los idiomas soportados más allá de lo que se infiere del modelo base Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con encoder de visión y capa MTP; conversión MLX con cuantización affine de 6 bits (group 64) en capas lineales |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Hermes Agent requiere al menos 64.000 tokens de contexto) |
| Tipos de cuantizacion | 6 bits (esta build); existen builds MLX de 8, 4 y 3 bits del mismo modelo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión 3756181) y le fusiona el super-adapter de harness-hub (revisión adb00e9). Ese super-adapter es un LoRA que integra tres especialistas de RL —pi y Hermes Agent en el paso 160, OpenCode en el paso 150— fusionados a peso ½ cada uno, sin entrenamiento posterior a la fusión. La conversión a MLX se realizó con mlx-vlm e incluye el encoder de visión y la capa MTP de Qwen. En esta build, las capas lineales están cuantizadas a 6 bits en modo affine con grupo de 64, lo que da un artefacto de 23,1 GB.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de RLHF/DPO de los especialistas originales; la model card remite a la del adaptador original para el método y los resultados completos. La innovación técnica destacable es la fusión de tres especialistas de harness distintos en un único adaptador y su empaquetado en MLX con la capa MTP y el encoder de visión incluidos, además de las métricas de fidelidad de cuantización publicadas (coincidencia del siguiente token y divergencia KL frente a bf16).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto en la plantilla de chat; se puede desactivar con `enable_thinking: false`.
- Capacidades de agente de programación: resolución de bugs, ejecución de tests y uso de terminal, evaluadas en SWE-bench Pro (hard 51) y Terminal-Bench 2.1.
- Soporte de tool calling / function calling a través de los harnesses pi, Hermes Agent y OpenCode, con reducción de llamadas a herramientas por tarea (19–48% con thinking on; 53–73% con thinking off).
- Razonamiento multi-paso y agentes: la model card indica que las ejecuciones con thinking on se evaluaron con hasta 32.768 tokens de salida por llamada.
- Entrada de imágenes (pipeline image-text-to-text), con ejemplos de uso mediante mlx-vlm (por ejemplo, interpretar una captura de terminal).
- Capacidades multilingües: no disponible en la información proporcionada.
- Capa MTP (multi-token prediction) incluida en la conversión.

## Casos de uso

- Resolución automática de bugs en un repositorio local: con pi apuntando a `mlx_lm.server`, se le puede pedir que localice por qué fallan los tests de un fichero concreto y aplique la corrección, aprovechando su entrenamiento específico en SWE-bench Pro bajo ese harness.
- Agente de terminal para tareas de sistema: con Terminal-Bench 2.1 como referencia, el modelo puede encadenar comandos de shell, interpretar su salida y corregir el rumbo, con menos llamadas a herramientas que el modelo base.
- Integración en OpenCode como proveedor local compatible con OpenAI: permite usar el modelo en un flujo de edición de código existente sin depender de la nube, configurando `baseURL` a `http://localhost:8000/v1`.
- Automatización con Hermes Agent: para pipelines que requieran al menos 64.000 tokens de contexto y ejecución local en Mac, el modelo se sirve como proveedor "custom" en `~/.hermes/config.yaml`.
- Análisis de capturas de pantalla o imágenes de terminal: mediante mlx-vlm se puede preguntar qué error muestra una captura, útil en soporte técnico o depuración asistida.
- Evaluación comparativa de harnesses en local: al ser un build que fusiona los tres especialistas, sirve para reproducir en Apple Silicon las mediciones de pass@1 y de llamadas a herramientas publicadas por harness-hub.
- Prototipado de asistentes de código sin conexión: con 23,1 GB de pesos y 23,4 GB de pico de memoria con prompts de 8K, cabe en Macs de 36 GB o más, lo que permite trabajar con datos de repositorio que no deben salir del equipo.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el super-adapter (no específicos de esta build MLX), comparando frente al modelo base con el mismo esfuerzo de thinking:

| Metrica | Base | Super-adapter | Observaciones |
|---|---|---|---|
| Media pass@1, thinking on | 55,5% | 63,5% | Por delante en 5 de 6 pares harness-benchmark, empatado en el sexto |
| Media pass@1, thinking off | 39,5% | 49,0% | Por delante en los 6 pares |
| SWE-bench Pro (hard 51), OpenCode | 47,1% | 66,7% | Thinking on |
| SWE-bench Pro (hard 51), Hermes Agent | 45,1% | 60,8% | Thinking on |
| Llamadas a herramientas por tarea | — | 19–48% menos (thinking on); 53–73% menos (thinking off) | — |

Métricas de fidelidad de la cuantización de esta build MLX 6 bits frente a bf16:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Pico de memoria, prompt 8K | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX 6 bits (esta) | 23,1 GB | 99,5% | 0,0014 | 45/50 | 23,4 GB | 36 GB+ |
| MLX 8 bits | 30,0 GB | 99,6% | 0,0005 | 45/50 | 29,7 GB | 48 GB+ |
| MLX 4 bits | 16,3 GB | 96,2% | 0,0194 | 45/50 | 17,1 GB | 32 GB+ |
| bf16 (referencia local, no publicada) | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,4 GB de pico con prompts de 8K tokens; se recomienda un Mac con 36 GB o más de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). No se documentan GPU NVIDIA en la información disponible.
- Cabe en Macs de gama alta con memoria unificada; para equipos con menos memoria existen builds de 4 bits (17,1 GB de pico, 32 GB+ sugeridos) y de 3 bits.
- Despliegue: `mlx_lm.server` (servidor compatible con OpenAI, requiere mlx-lm >= 0.32.2) para texto; `mlx-vlm` (>= 0.7.11) para entrada de imágenes; también uso directo desde Python con `mlx_lm.load` y `generate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-super-adapter-MLX-6bit | 27,78 B | no disponible | 6 bits, 23,1 GB | Pass@1 medio 63,5% (thinking on), 49,0% (thinking off) | Apache 2.0 | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | no disponible | no disponible | 6 bits (build MLX) | Especialista para pi; resultados no detallados en la informacion | Apache 2.0 (según modelo base) | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit | no disponible | no disponible | 6 bits (build MLX) | Especialista para Hermes Agent; resultados no detallados | Apache 2.0 (según modelo base) | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | no disponible | no disponible | 6 bits (build MLX) | Especialista para OpenCode; resultados no detallados | Apache 2.0 (según modelo base) | Hugging Face, MLX |

## Limitaciones y advertencias

- El super-adapter se obtiene fusionando tres especialistas de RL a peso ½ sin entrenamiento posterior; su comportamiento puede degradarse fuera de los harnesses evaluados (pi, Hermes Agent, OpenCode).
- Los resultados de benchmarks publicados corresponden al adaptador original, no a esta conversión MLX de 6 bits; la fidelidad medida es alta (99,5% de coincidencia en el siguiente token, KL 0,0014) pero no idéntica a bf16.
- La cuantización a 6 bits introduce una divergencia pequeña pero no nula frente a bf16; para máxima fidelidad existe la build de 8 bits.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni idiomas soportados en la información disponible.
- La longitud de contexto nativa no se indica; Hermes Agent exige al menos 64.000 tokens, lo que impone un mínimo práctico en ese harness.
- Las ejecuciones con thinking on pueden generar hasta 32.768 tokens por llamada, con el coste de latencia y memoria asociado.
- El modelo está empaquetado exclusivamente para MLX/Apple Silicon; no hay pesos GGUF ni compatibilidad documentada con vLLM o TGI.
- Uso comercial permitido por la licencia Apache 2.0, sujeta a las condiciones del modelo base Qwen y del adaptador original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Build MLX 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-4bit
- Build MLX pi: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build MLX Hermes Agent: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build MLX OpenCode: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- pi (harness): https://github.com/earendil-works/pi
- Hermes Agent (harness): https://github.com/NousResearch/hermes-agent
- OpenCode (harness): https://opencode.ai
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
