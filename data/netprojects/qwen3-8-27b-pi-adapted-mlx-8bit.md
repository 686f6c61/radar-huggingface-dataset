# netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit

## Resumen
Qwen3.8-27B-pi-adapted-MLX-8bit es una compilación cuantizada a 8 bits del modelo Qwen3.8-27B (27.781 millones de parámetros) adaptada mediante LoRA con aprendizaje por refuerzo para funcionar como motor del agente de programación pi. La publica el usuario netprojects en Hugging Face, partiendo del adaptador harness-hub/Qwen3.8-27B-pi-adapted (revisión e786f84) fusionado sobre Qwen/Qwen3.8-27B (revisión 3756181). Está pensada para ejecución local en Apple Silicon mediante la librería MLX, con el codificador de visión y la capa MTP de Qwen incluidas.

El modelo resuelve el problema de desplegar un agente de ingeniería de software capaz de operar en terminal y resolver tareas de reparación de código sobre hardware de Apple, sin depender de servicios en la nube. La adaptación con RL (AsyncGRPO en TRL) mejora de forma notable los resultados del modelo base en Terminal-Bench 2.1 (39,5% a 55,8%) y SWE-bench Pro hard 51 (29,4% a 62,7%), con entre un 55% y un 64% menos de llamadas a herramientas por tarea.

Esta compilación concreta cuantiza las capas lineales a 8 bits afines con grupo de 64, ocupa 30,0 GB y conserva el 99,1% de coincidencia en el siguiente token respecto a bf16, con una divergencia KL de solo 0,0004. Es la variante más fiel al modelo original dentro de la familia MLX publicada, por delante de las versiones de 6 y 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con capa de predicción multi-token (MTP), adaptada mediante LoRA y fusionada; conversión MLX con mlx-vlm |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (affine), grupo de 64, en capas lineales; capa MTP cuantizada de forma equivalente |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con model-mtp.safetensors para la capa MTP |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.8-27B, un transformer de 27.781 millones de parámetros con 64 capas, de las cuales 16 son de atención completa (según la descripción del proceso de fusión: módulos q, k, v, o en las 16 capas de atención completa y gate, up, down en las 64 capas). Incluye un codificador de visión, ya que la pipeline declarada es image-text-to-text, y una capa propia de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa.

El adaptador harness-hub/Qwen3.8-27B-pi-adapted se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en TRL, orientado a tareas de ingeniería de software y terminal dentro del agente pi. La fusión LoRA afecta a 256 módulos y se verificó elemento a elemento contra un cálculo independiente en float64, comprobando que cada tensor equivale a W + 2,0 · B @ A redondeado a bf16. La conversión a MLX se realizó con mlx-vlm, incluyendo el codificador de visión y la capa MTP, y en esta compilación las capas lineales se cuantizan a 8 bits afines con grupo de 64. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y formato de llamadas a herramientas que Qwen3.8-27B.

## Capacidades
- Generación de texto y razonamiento en tareas de ingeniería de software y operación de terminal.
- Ejecución de tareas de coding agent: localización de fallos en tests, diagnóstico y corrección de bugs.
- Llamadas a herramientas en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` de OpenAI.
- Razonamiento multi-paso con uso de herramientas, optimizado para reducir el número de llamadas por tarea (55-64% menos que el modelo base).
- Procesamiento de imágenes (image-text-to-text): interpretación de capturas de pantalla, por ejemplo de una terminal, mediante mlx-vlm.
- Modo thinking desactivable; el adaptador fue entrenado y evaluado con thinking desactivado y se recomienda mantenerlo así.
- Decodificación especulativa integrada mediante la capa MTP de Qwen, con aceleración de aproximadamente 2,2× sin descarga adicional.
- Compatibilidad con el drafter DSpine (netprojects/Qwen3.8-27B-DSpine-b16-MLX) a través de dspine-hybrid-mlx.

## Casos de uso
- Reparación automática de tests en CI: el modelo puede recibir el fallo de `tests/test_parser.py`, inspeccionar el código y aplicar la corrección, aprovechando su entrenamiento específico en SWE-bench Pro y Terminal-Bench.
- Agente de terminal local en macOS: desplegado con `mlx_lm.server` y conectado a pi mediante la API OpenAI-compatible, permite automatizar tareas de shell en un MacBook sin enviar código a la nube.
- Asistente de depuración con capturas de pantalla: usando mlx-vlm, el modelo interpreta una imagen de terminal y responde qué error muestra, útil para soporte técnico remoto.
- Generación de código en Python desde lenguaje natural: por ejemplo, convertir expresiones como "1.5M" en bytes, con plantilla de chat y thinking desactivado para respuestas directas.
- Integración en pipelines de agentes con tool calling: el formato XML de Qwen y su exposición como `tool_calls` de OpenAI permiten encadenar herramientas en flujos multi-paso con menos llamadas por tarea.
- Evaluación e investigación en Apple Silicon: sirve como banco de pruebas para medir fidelidad de cuantización (99,1% de coincidencia con bf16) y aceleración por decodificación especulativa en MLX.
- Despliegue de un agente de programación en local para equipos con hardware Apple de gama alta, manteniendo los datos en el dispositivo.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo pi con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Adaptador pi | Mejora |
|---|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% | +16,3 puntos |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% | +33,3 puntos |

Fidelidad de cuantización respecto a bf16, medida por el autor de la compilación:

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendado) | 23,1 GB | 99,0% | 0,0015 |
| 8 bits (esta ficha) | 30,0 GB | 99,1% | 0,0004 |
| 4 bits | 16,3 GB | 95,6% | 0,0201 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificación medido en un MacBook Pro M5 Max de 128 GB (greedy, thinking off, 5 prompts × 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench; mediciones indicativas con otros servicios en ejecución):

| Build | Plano | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 61 tok/s (×1,84) | 70 tok/s (×2,25) |
| 6 bits | 23 tok/s | 22 tok/s (×0,96) | 52 tok/s (×2,32) |
| 8 bits | 18 tok/s | 41 tok/s (×2,24) | 54 tok/s (×3,05) |

## Requisitos de hardware
- VRAM/unified memory estimada: el repositorio ocupa 30,0 GB, por lo que se necesita al menos esa cantidad de memoria unificada más el espacio para el contexto y el codificador de visión; en la práctica, 36-48 GB o más para trabajar con comodidad.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; las mediciones se realizaron en un MacBook Pro M5 Max de 128 GB.
- Compatibilidad con GPU de consumo: al ser un build MLX, está orientado a Apple Silicon; no se indica soporte para GPU NVIDIA ni AMD en esta compilación.
- Opciones de despliegue: `mlx_lm.server` (servidor compatible con OpenAI, mlx-lm >= 0.32.2) para texto; `mlx_vlm.generate` (mlx-vlm >= 0.7.11) para imagen y texto; integración con el agente pi mediante `~/.pi/agent/models.json` con `"api": "openai-completions"`.
- Aceleración: MTP integrado con `--draft-model` apuntando al mismo repositorio y `--draft-kind mtp` (aproximadamente 2,2× en este build, 18 a 41 tok/s); DSpine con dspine-hybrid-mlx alcanza 54 tok/s (×3,05).
- Latencia y throughput: 18 tok/s en decodificación plana y 41 tok/s con MTP en el hardware citado; no se dispone de datos para otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit | 27,78 B | no disponible | 8 bits MLX | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,78 B | no disponible | 6 bits MLX | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,78 B | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16 | 27,78 B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,78 B | no disponible | adaptador LoRA (638 MB en versión MLX) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 27,78 B | no disponible | bf16 | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos de otros autores en la información proporcionada; la comparación se limita a las variantes de cuantización y al modelo base de la misma familia.

## Limitaciones y advertencias
- El adaptador fue entrenado y evaluado con thinking desactivado; activarlo puede degradar el comportamiento esperado y no se ha validado en ese modo.
- El formato de API importa: debe usarse Chat Completions (`"api": "openai-completions"`), no la Responses API, porque el adaptador se entrenó y evaluó con la primera.
- La decodificación especulativa con MTP o DSpine puede divergir ligeramente del texto plano en respuestas largas cuando hay casi empates en la comprobación por lotes, aunque en modo greedy el texto coincide hasta ese punto.
- La cuantización a 8 bits conserva el 99,1% de coincidencia con bf16, pero no es idéntica; para máxima fidelidad existe el build bf16 de 55,6 GB.
- Las mediciones de rendimiento son indicativas y se tomaron con otros servicios en ejecución en el mismo equipo; no deben extrapolarse sin cautela.
- No se especifican sesgos conocidos, composición del dataset de entrenamiento ni idiomas soportados más allá de lo indicado; la model card no los detalla.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de código conviene verificar las modificaciones propuestas antes de aplicarlas en producción.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.8-27B y el adaptador deben revisarse por si añaden condiciones adicionales no recogidas en la información disponible.
- El modelo está orientado a Apple Silicon; no se documenta soporte para otras plataformas en esta compilación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits (recomendado): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- Agente pi: https://github.com/earendil-works/pi
