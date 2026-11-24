# netprojects/Qwen3.8-27B-pi-MLX-4bit

## Resumen

Qwen3.8-27B-pi-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Qwen3.8-27B, adaptado mediante LoRA por harness-hub para funcionar como motor del agente de programación pi. El desarrollo corre a cargo de netprojects, que publica una familia completa de builds MLX (bf16, 8, 6, 4, 3 y 2,5 bits) orientados a Apple Silicon. El modelo resuelve el problema de desplegar un agente de codificación y terminal de 27.800 millones de parámetros en Macs con memoria unificada limitada, manteniendo el encoder de visión y la capa de predicción multi-token (MTP) originales de Qwen.

La arquitectura subyacente es un transformer Qwen3.5 con capacidades multimodales (pipeline image-text-to-text) y una capa MTP que actúa como modelo borrador para decodificación especulativa. El adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) sobre tareas de ingeniería de software y terminal, y según el autor mejora Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7% respecto al modelo base, con entre un 55% y un 64% menos de llamadas a herramientas por tarea.

Esta build de 4 bits ocupa 16,3 GB y conserva el 95,6% de coincidencia en el siguiente token respecto a bf16, con una divergencia KL de 0,0201. Es relevante ahora porque permite ejecutar localmente, sin conexión y con privacidad total, un agente de codificación que hasta hace poco requería GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 multimodal con capa MTP (multi-token prediction); pesos convertidos con mlx-vlm |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, grupo 64 (lineales); capa MTP cuantizada al mismo nivel; builds alternativos en bf16, 8, 6, 3 y 2,5 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 16,3 GB; librería mlx |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión 3756181) e incorpora el adaptador LoRA de harness-hub/Qwen3.8-27B-pi-adapted (revisión e786f84), fusionado y convertido a MLX con mlx-vlm. La conversión preserva el encoder de visión y la capa MTP propia de Qwen, almacenada en `model-mtp.safetensors` y cuantizada al mismo nivel que el resto de la build. El tokenizador y la plantilla de chat son los de harness-hub sin modificar, por lo que mantiene el vocabulario y el formato de llamadas a herramientas XML de Qwen3.8-27B.

El adaptador se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en TRL, orientado a tareas de ingeniería de software y de terminal, y fue evaluado con el modo de razonamiento (thinking) desactivado. La capa MTP no fue alterada por el adaptador: es la cabeza original de Qwen y se puede usar como modelo borrador integrado pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`. Según las mediciones del autor, la decodificación especulativa MTP acelera esta build unas 1,8 veces (33 a 61 tok/s) y el drafter DSpine v0.2.1 la acelera 2,25 veces (hasta 70 tok/s), verificando cada token propuesto con el modelo completo.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.8-27B.
- Codificación y resolución de tareas de ingeniería de software, optimizadas mediante RL sobre el agente pi.
- Ejecución de tareas de terminal y uso de herramientas de línea de comandos.
- Llamadas a funciones en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), expuestas por el servidor de mlx-lm como `tool_calls` de OpenAI.
- Flujos agénticos multi-paso con reducción del número de llamadas a herramientas por tarea (55-64% menos según el autor).
- Procesamiento de imágenes y texto (image-text-to-text) mediante mlx-vlm, útil para interpretar capturas de terminal o diagramas.
- Modo thinking disponible en el modelo base, aunque el adaptador fue entrenado y evaluado con thinking desactivado.
- Decodificación especulativa integrada mediante la capa MTP original de Qwen.

## Casos de uso

- Agente de codificación local en macOS: servir el modelo con `mlx_lm.server` y conectarlo a pi mediante la API compatible con OpenAI (`openai-completions`), de modo que el agente diagnostique fallos de tests y aplique parches sin enviar código a la nube. Es adecuado por su entrenamiento específico en SWE-bench Pro y su bajo consumo de llamadas a herramientas.
- Automatización de tareas de terminal: el modelo puede encadenar comandos, leer la salida y corregir errores en un bucle agéntico, aprovechando la mejora de Terminal-Bench 2.1 (39,5% a 55,8%) y el formato de tool calling nativo.
- Revisión de código y corrección de bugs en local: con 16,3 GB de pesos cabe en Macs de 24-32 GB de memoria unificada, lo que permite auditar repositorios privados sin conexión.
- Interpretación de capturas de terminal o de errores visuales: la variante multimodal permite pasar una imagen (`screenshot.png`) y preguntar por el error mostrado mediante `mlx_vlm.generate`.
- Asistente de programación en el editor: desplegado tras un endpoint compatible con OpenAI, se integra en extensiones que hablen Chat Completions, con la ventaja de que el adaptador fue entrenado contra esa API y no contra la Responses API.
- Prototipado rápido en Python: cargar el modelo con mlx-lm y generar funciones o scripts (por ejemplo, un parser de cantidades como "1.5M" a bytes) en portátiles Apple Silicon sin GPU dedicada.
- Evaluación de agentes en investigación: al publicarse builds de 2,5 a bf16 bits con métricas de fidelidad (coincidencia de siguiente token y KL), sirve para estudiar el impacto de la cuantización en el rendimiento agéntico.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador, bajo pi y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Qwen3.8-27B-pi-adapted |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |
| Llamadas a herramientas por tarea | referencia | 55-64% menos |

Fidelidad de la cuantización respecto a bf16 (builds de netprojects):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 8 bits | 30,0 GB | 99,1% | 0,0004 |
| 6 bits (recomendada) | 23,1 GB | 99,0% | 0,0015 |
| 4 bits (esta) | 16,3 GB | 95,6% | 0,0201 |
| 3 bits | 13,8 GB | 91,4% | 0,0884 |
| 2,5 bits (solo texto) | 11,8 GB | 85,5% | 0,2363 |

Velocidad de decodificación medida por el autor (greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en la máquina; valores indicativos):

| Build | Plano | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 61 tok/s (×1,84) | 70 tok/s (×2,25) |
| 6 bits | 23 tok/s | 22 tok/s (×0,96) | 52 tok/s (×2,32) |
| 8 bits | 18 tok/s | 41 tok/s (×2,24) | 54 tok/s (×3,05) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 16,3 GB solo para pesos; con caché KV y contexto hay que prever margen adicional. Encaja en Macs de 24 GB o más; las builds de 3 y 2,5 bits están pensadas explícitamente para Macs de 24 GB.
- GPU recomendadas: Apple Silicon (serie M) con memoria unificada suficiente; la librería es MLX, por lo que no se ejecuta en GPUs NVIDIA o AMD sin reconversión.
- GPU de consumo: no aplica en el sentido habitual; el equivalente son chips M1/M2/M3/M4 con 24-32 GB o más. En un Mac de 16 GB no cabe.
- Despliegue: `mlx-lm>=0.32.2` para texto (`mlx_lm.server` con API compatible con OpenAI) y `mlx-vlm>=0.7.11` para imagen y decodificación especulativa MTP. No es compatible con vLLM, llama.cpp, Ollama ni TGI al estar en formato MLX.
- Latencia y throughput: 33 tok/s en decodificación plana, 61 tok/s con MTP y 70 tok/s con DSpine en la build de 4 bits, según mediciones indicativas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-MLX-4bit (esta) | 27,78 B | no disponible | 4 bits MLX | Apache 2.0 | Agente de código en Apple Silicon |
| Qwen3.8-27B-pi-adapted-MLX-6bit | 27,78 B | no disponible | 6 bits MLX | Apache 2.0 | Misma familia, mayor fidelidad (99,0%) |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,78 B | no disponible | bf16 (adaptador LoRA) | Apache 2.0 | Adaptador original, requiere hardware mayor |
| Qwen/Qwen3.8-27B | 27,78 B | no disponible | bf16 | Apache 2.0 | Modelo base sin especializar en agentes |

No se dispone de datos de benchmarks de modelos de otras familias comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activar el modo de razonamiento puede degradar el comportamiento esperado. Hay que pasar `enable_thinking: false` en la plantilla de chat.
- El adaptador se entrenó contra la API Chat Completions, no la Responses API; configurar mal el cliente (por ejemplo, `"api": "openai-completions"` en pi) rompe la integración.
- La cuantización a 4 bits reduce la fidelidad al 95,6% de coincidencia de siguiente token y KL 0,0201 frente a bf16; para tareas sensibles a la precisión se recomienda la build de 6 u 8 bits.
- Con decodificación especulativa y greedy, el texto coincide con la decodificación plana hasta un empate cercano, donde la verificación por lotes puede redondear al otro lado; respuestas largas pueden divergir ligeramente.
- Solo funciona en Apple Silicon con MLX; no hay soporte para CUDA, ROCm ni CPU x86 en este repositorio.
- No se especifican idiomas soportados ni longitud de contexto; no se debe asumir cobertura multilingüe ni ventanas largas sin verificación.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en tareas de terminal donde un comando erróneo puede tener efectos destructivos; conviene sandbox y revisión humana.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero las mediciones de rendimiento son del autor y no han sido replicadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-4bit
- Modelo base adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits recomendada: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Implementación DSpine para MLX: https://github.com/internet-projects/dspine-hybrid-mlx
