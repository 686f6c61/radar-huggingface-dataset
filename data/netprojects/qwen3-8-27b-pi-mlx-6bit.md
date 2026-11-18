# netprojects/Qwen3.8-27B-pi-MLX-6bit

## Resumen

Qwen3.8-27B-pi-MLX-6bit es una cuantización de 6 bits en formato MLX del modelo Qwen3.8-27B, adaptado mediante LoRA y aprendizaje por refuerzo (AsyncGRPO en TRL) por harness-hub para funcionar como el modelo subyacente del agente de programación pi. El resultado es un modelo de 27.781.427.952 parámetros (unos 27,8 mil millones) orientado a tareas de ingeniería de software y operación de terminal, con capacidades de visión integradas y una ventana de contexto no especificada en la información disponible.

La relevancia de esta ficha radica en que el adaptador original reporta mejoras sustanciales frente al modelo base en benchmarks de agentes: Terminal-Bench 2.1 pasa del 39,5 % al 55,8 % y SWE-bench Pro (hard 51) del 29,4 % al 62,7 %, con entre un 55 % y un 64 % menos de llamadas a herramientas por tarea. Esta build concreta, publicada por netprojects, convierte esos pesos a MLX con cuantización afín de 6 bits (grupo 64), conservando el codificador visual y la capa de predicción multi-token (MTP) de Qwen, con un tamaño de repositorio de 23,1 GB.

El modelo está pensado para ejecutarse en Apple Silicon mediante mlx-lm y mlx-vlm, con licencia Apache 2.0 y soporte de entrada imagen-texto. No se han publicado resultados de benchmarks propios de esta cuantización más allá de las métricas de fidelidad frente a bf16 (99,0 % de mismo siguiente token y KL de 0,0015).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con capas de atención completa y lineal, codificador visual y capa MTP; adaptador LoRA fusionado |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín, grupo 64 (lineales); existen builds 4-bit, 8-bit y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |
| Tamano del repositorio | 23,1 GB |
| Biblioteca | mlx (mlx-lm >= 0.32.2, mlx-vlm >= 0.7.11) |
| Modelo base | harness-hub/Qwen3.8-27B-pi-adapted (revision e786f84) sobre Qwen/Qwen3.8-27B (revision 3756181) |
| Modalidad | image-text-to-text (visión + texto) |
| Fidelidad vs bf16 | 99,0 % mismo siguiente token; KL 0,0015 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer con 64 capas, de las cuales 16 son de atención completa y el resto de atención lineal, más un codificador visual para entrada de imágenes y una capa de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa. Sobre ese modelo base, harness-hub entrenó un adaptador LoRA con aprendizaje por refuerzo (AsyncGRPO en TRL) orientado a tareas de ingeniería de software y terminal dentro del agente pi. El adaptador afecta a 256 módulos: q, k, v y o en las 16 capas de atención completa, y gate, up y down en las 64 capas.

Esta build de netprojects fusiona el adaptador en los pesos base con la fórmula W + 2.0 · B @ A redondeada a bf16, verifica elemento a elemento contra un cálculo independiente en float64 y confirma que el resto de tensores son idénticos byte a byte a Qwen3.8-27B. Después convierte el conjunto a MLX con mlx-vlm, cuantizando las capas lineales a 6 bits afín con grupo 64. El tokenizador y la plantilla de chat son los de harness-hub sin modificar, por lo que el vocabulario y el formato de llamadas a herramientas (XML de Qwen) coinciden con los del modelo base. La capa MTP se conserva cuantizada de forma coherente con el resto del build.

## Capacidades

- Generación de texto y razonamiento general sobre la base de Qwen3.8-27B.
- Generación y edición de código, con especialización en tareas de ingeniería de software medidas por SWE-bench Pro.
- Operación de terminal y ejecución de comandos en entornos de agente (Terminal-Bench 2.1).
- Llamadas a herramientas en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Flujos de agente multi-paso con reducción del número de llamadas a herramientas por tarea (55-64 % menos según el autor del adaptador).
- Entrada de imágenes (image-text-to-text): capturas de pantalla, salidas de terminal, diagramas, mediante mlx-vlm.
- Modo thinking desactivable; el adaptador fue entrenado y evaluado con thinking off y se recomienda mantenerlo así.
- Decodificación especulativa mediante la capa MTP original de Qwen o mediante el drafter DSpine.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de corrección de bugs en repositorios: el modelo se conecta al agente pi vía API compatible con OpenAI y resuelve tareas del tipo "encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug", apoyándose en el entrenamiento RL sobre SWE-bench Pro y en la reducción de llamadas a herramientas.
- Automatización de tareas de terminal: ejecución guiada de comandos, diagnóstico de errores de shell y reparación de entornos, con el rendimiento medido en Terminal-Bench 2.1 (55,8 % con el adaptador).
- Asistente de programación local en Mac: despliegue con `mlx_lm.server` en un MacBook Pro con Apple Silicon, sin depender de servicios en la nube, gracias al tamaño de 23,1 GB y al soporte nativo de MLX.
- Análisis de capturas de terminal o de pantalla: con mlx-vlm se puede pasar una imagen y preguntar qué error muestra la terminal, útil para soporte técnico y triaje de incidencias.
- Integración en pipelines de CI/CD como revisor automático: el modelo puede analizar diffs, proponer parches y verificar tests mediante tool calling, con la ventaja de que el formato de herramientas es compatible con OpenAI.
- Generación de código con latencia mejorada: usando el drafter DSpine se alcanzan unos 52 tok/s en la build de 6 bits (frente a 23 tok/s en decodificación plana), adecuado para asistentes interactivos.
- Evaluación e investigación de métodos de cuantización: la tabla de fidelidad (99,0 % mismo token, KL 0,0015) y las builds 4/6/8/bf16 permiten estudiar el compromiso entre tamaño y calidad en MLX.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador (bajo pi, thinking off), comparados con el modelo base:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |

Métricas de fidelidad de la cuantización frente a bf16:

| Build | Tamano | Mismo siguiente token | KL vs bf16 |
|---|---|---|---|
| 6-bit (esta) | 23,1 GB | 99,0 % | 0,0015 |
| 8-bit | 30,0 GB | 99,1 % | 0,0004 |
| 4-bit | 16,3 GB | 95,6 % | 0,0201 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificación medido por el autor (greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en el Mac; valores indicativos):

| Build | Plano | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 |
|---|---|---|---|
| 4-bit | 33 tok/s | 61 tok/s (×1,84) | 70 tok/s (×2,25) |
| 6-bit | 23 tok/s | 22 tok/s (×0,96) | 52 tok/s (×2,32) |
| 8-bit | 18 tok/s | 41 tok/s (×2,24) | 54 tok/s (×3,05) |

No se han publicado resultados de MMLU, HumanEval o GSM8K para esta build en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 23,1 GB de pesos en 6 bits, más overhead de contexto y del codificador visual; en la práctica se recomienda un equipo con al menos 32 GB de memoria unificada y, para contexto largo, 48-64 GB.
- Hardware de referencia del autor: MacBook Pro M5 Max con 128 GB, mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- GPU: al ser un build MLX, está orientado a Apple Silicon (series M). No se ha validado para CUDA en la información disponible.
- Cabe en GPU de consumo Apple Silicon de gama alta; para GPUs NVIDIA no hay datos de despliegue publicados.
- Despliegue: `mlx_lm.server` con API compatible con OpenAI, mlx-lm para texto, mlx-vlm para imagen-texto, y el agente pi apuntando a `http://localhost:8000/v1`.
- Throughput: 23 tok/s en decodificación plana, 52 tok/s con DSpine y 22 tok/s con MTP en la build de 6 bits (MTP no aporta mejora en este build con mlx-vlm 0.7.11).
- Alternativa de decodificación especulativa: drafter DSpine de 4 bits con block 5 y el repositorio dspine-hybrid-mlx.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-MLX-6bit (esta) | 27,8 B | no disponible | Agente de código y terminal, visión | Apache 2.0 | MLX safetensors 6-bit |
| Qwen3.8-27B (base) | 27,8 B | no disponible | Propósito general, visión | Apache 2.0 (según base) | safetensors |
| Qwen3.8-27B-pi-MLX-8bit | 27,8 B | no disponible | Igual, mayor fidelidad (30,0 GB) | Apache 2.0 | MLX safetensors 8-bit |
| Qwen3.8-27B-pi-MLX-4bit | 27,8 B | no disponible | Igual, menor tamaño (16,3 GB) | Apache 2.0 | MLX safetensors 4-bit |

No se dispone de datos de benchmarks de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking off; activar el modo thinking puede degradar el comportamiento esperado.
- El formato de API debe ser Chat Completions (`openai-completions`), no Responses API, porque así se entrenó y evaluó el adaptador.
- El texto generado con decodificación especulativa (MTP o DSpine) puede divergir ligeramente del decoding plano en respuestas largas por redondeos en la comprobación por lotes.
- La build de 6 bits pierde un 1,0 % de coincidencia en el siguiente token frente a bf16; para máxima fidelidad existe la build de 8 bits (KL 0,0004).
- MTP no aporta aceleración en esta build con mlx-vlm 0.7.11; usar DSpine si se busca velocidad.
- Las mediciones de throughput son indicativas: se tomaron con otros servicios ejecutándose en el mismo Mac.
- Riesgo de alucinación y sesgos: no hay información específica publicada para esta build; se heredan los del modelo base Qwen3.8-27B.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del adaptador de harness-hub.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.
- Longitud de contexto no documentada; planificar el despliegue con margen de memoria para contextos largos.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Agente pi: https://github.com/earendil-works/pi
