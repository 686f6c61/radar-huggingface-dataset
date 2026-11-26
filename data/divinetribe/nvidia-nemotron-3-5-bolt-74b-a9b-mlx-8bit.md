# divinetribe/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit es una conversión a formato MLX y cuantización de 8 bits del modelo multimodal Nemotron-3.5 Bolt 74B-A9B de NVIDIA, publicada por el usuario divinetribe. El objetivo es ejecutar el modelo original en Apple Silicon (Macs con chip M-series) mediante la librería mlx-vlm, manteniendo intactas las capacidades de texto, imagen y vídeo. El checkpoint original de NVIDIA no es cargable con mlx-vlm de serie, por lo que esta conversión incluye un puerto propio del modelo (`nemotron_h_omni`) que se instala sobre la librería.

El modelo base emplea una arquitectura híbrida denominada "Puzzle-searched", que combina capas Mamba2, capas de atención y capas MoE con un número distinto de expertos por capa, junto con un codificador visual RADIO. Cuenta con 74.885.081.096 parámetros totales y 9B parámetros activos (de ahí el sufijo A9B), lo que lo sitúa en la categoría de modelos MoE de gran tamaño pero con coste de cómputo por token relativamente bajo. El contexto llega hasta 128K tokens según las pruebas del autor.

La relevancia de esta ficha radica en que permite ejecutar localmente, en un Mac de 128 GB, un modelo multimodal de 74B con visión, vídeo, tool calling, modo de razonamiento y contexto largo, algo que hasta hace poco requería hardware de centro de datos. La conversión conserva los 28.725 tensores del checkpoint original y ha sido validada numéricamente contra el código de referencia de NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Mamba2, atención y MoE con distinto número de expertos por capa (Puzzle-searched); codificador visual RADIO; implementación `nemotron_h_omni` para mlx-vlm |
| Parámetros totales | 74.885.081.096 (74,9B) |
| Parámetros activos | 9B (sufijo A9B) |
| Longitud de contexto | 128K tokens (probado a 32K y 128K) |
| Tipos de cuantización | 8-bit affine con group size 64; torre de visión, proyector visual y cabeza de salida en bf16 |
| Idiomas soportados | No disponible (probado con español, japonés y chino) |
| Licencia | OpenMDW 1.1 (heredada del modelo base de NVIDIA) |
| Formato de pesos | safetensors (MLX), 1.863 tensores, ~81 GB en disco |

## Arquitectura y entrenamiento

El modelo base de NVIDIA combina tres tipos de capas en una arquitectura híbrida: capas Mamba2 (modelo de espacio de estados), capas de atención clásica y capas MoE. Solo 8 de las 88 capas totales son de atención, lo que reduce drásticamente el coste de la caché KV (aproximadamente 1 GB para 128K tokens). El número de expertos varía por capa, una configuración que NVIDIA describe como "Puzzle-searched". El componente multimodal incluye un codificador visual RADIO y un proyector que traduce las representaciones visuales al espacio del modelo de lenguaje. Para vídeo se aplica una poda de tokens configurable (0,7 por defecto) mediante `video_pruning_rate=`.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card remite a la ficha del modelo base de NVIDIA para esos datos. La conversión de divinetribe no altera el comportamiento ni el alineamiento del modelo: se limita a mapear todos los tensores del checkpoint original a la implementación MLX y a cuantizar el modelo de lenguaje a 8 bits. Las validaciones numéricas reportadas incluyen coseno de 0,99998 en la torre visual frente a referencia fp32, coseno de 0,9993 o superior en cada una de las 88 capas y coseno de 0,999997 en los logits finales con KL de 0,00075.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento (thinking) activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Comprensión de imágenes: descripción, conteo de objetos, lectura de documentos y OCR (probado con facturas de siete campos), interpretación de gráficos de barras.
- Comprensión de vídeo: lectura de contenido, seguimiento de movimiento, clips de hasta 180 fotogramas probados (90 segundos), con poda de tokens configurable.
- Varias imágenes en un mismo prompt, con referencias separadas a cada una.
- Tool calling / function calling: genera bloques `<tool_call>` bien formados con argumentos correctos, usa el resultado de la herramienta y omite herramientas cuando no son necesarias.
- Salida JSON válida en el primer intento, sin vallas de código.
- Conversación multi-turno con imagen persistente en el contexto.
- Contexto largo: localización de información a 32K y 128K tokens.
- Multilingüe: respuestas correctas probadas en español, japonés y chino.
- Sin torre de audio: el modelo no procesa audio.

## Casos de uso

- Asistente de código en local sobre Apple Silicon: el modelo puede integrarse en un servidor compatible con la API de Anthropic (como el proyecto Claude Code Local del mismo autor) para ejecutar tareas de agente de programación sin enviar código a la nube, aprovechando el tool calling y el contexto de 128K.
- Análisis de documentos y facturas: extracción de campos estructurados mediante OCR y salida JSON válida, adecuado para pipelines de digitalización contable que requieran confidencialidad y ejecución en máquina local.
- Procesamiento de vídeo para monitorización o catalogación: lectura de contenido en clips de hasta 180 fotogramas, detección de movimiento y localización de fotogramas concretos, con poda de tokens para controlar el coste de memoria.
- Atención al cliente multimodal: conversaciones multi-turno en las que el usuario adjunta capturas o fotos y el modelo mantiene la referencia a la imagen varios turnos después, con respuestas en español y otros idiomas.
- Automatización de agentes con herramientas: integración en flujos que requieran llamadas a funciones externas (búsqueda, cálculo, APIs) gracias al soporte de `<tool_call>` y al modo de razonamiento activable.
- Análisis de gráficos e informes: lectura de valores de gráficos de barras, cálculo de máximos, mínimos y sumas, útil para herramientas de business intelligence que operen sobre capturas de dashboards.
- Procesamiento de contexto largo en local: resumen o búsqueda de información en documentos extensos de hasta 128K tokens, viable en un Mac de 128 GB gracias a la caché KV reducida (solo 8 capas de atención).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta métricas de validación numérica y de rendimiento en hardware concreto:

| Métrica | Valor reportado |
|---|---|
| Velocidad de generación (M5 Max, 128 GB) | 37-41 tokens/s |
| Procesamiento de prompt con imágenes | 550-950 tokens/s |
| Procesamiento de prompt a 128K | ~755 tokens/s |
| Memoria cargada en reposo | ~81 GB |
| Memoria pico con vídeo de 90 s | ~89 GB |
| Memoria pico a 128K de contexto | ~91 GB |
| Coseno de la torre visual vs. fp32 | 0,99998 |
| Coseno del proyector visual vs. fp32 | 0,99995 |
| Coseno por capa del LM vs. fp32 | ≥ 0,9993 |
| Coseno de logits finales vs. fp32 | 0,999997 (KL 0,00075) |
| Coseno de embeddings de vídeo vs. fp32 | 0,99981 |

## Requisitos de hardware

- VRAM/unified memory estimada: ~81 GB en reposo, hasta ~91 GB con contexto de 128K o vídeo de 90 segundos.
- Requiere un Mac con 128 GB de memoria unificada; no cabe en configuraciones de 64 GB.
- GPU recomendada: Apple M5 Max con 128 GB (hardware de las pruebas). No se han reportado pruebas en M1/M2/M3/M4 ni en GPUs NVIDIA.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones de 48 GB.
- Despliegue: mlx-vlm 0.7.8 o superior más el script `install_port.py` incluido en el repositorio, que registra el modelo `nemotron_h_omni` y su formato de chat. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- Latencia y throughput: 37-41 tokens/s de generación en M5 Max de 128 GB; procesamiento de prompt de 550-950 tokens/s con imágenes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5 Bolt 74B-A9B (este, MLX 8-bit) | 74,9B totales / 9B activos | 128K | Texto, imagen, vídeo | OpenMDW 1.1 | Hugging Face, solo Apple Silicon |
| NVIDIA Nemotron-3.5 Bolt 74B-A9B BF16 (base) | 74,9B totales / 9B activos | 128K | Texto, imagen, vídeo | OpenMDW 1.1 | Hugging Face, requiere hardware de referencia NVIDIA |
| Alternativas de tamaño similar en formato MLX | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~75B con soporte MLX) en la documentación proporcionada, por lo que la comparativa se limita al modelo base del que deriva esta conversión.

## Limitaciones y advertencias

- La licencia OpenMDW 1.1 es una licencia de pesos abiertos con términos propios; es necesario revisar sus condiciones antes de un uso comercial.
- El modelo solo se ha probado en Apple Silicon con 128 GB de memoria unificada; no hay garantías de funcionamiento en otras plataformas ni en configuraciones menores.
- Requiere instalar un puerto no oficial (`install_port.py`) sobre mlx-vlm; hasta que mlx-vlm soporte el modelo de forma nativa, la instalación depende de un script externo.
- Un mismo prompt acepta imágenes o vídeo, pero no ambos a la vez, replicando la limitación de la referencia de NVIDIA.
- Los clips de vídeo de más de 180 fotogramas no han sido probados.
- El modelo no dispone de torre de audio.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad específicas para esta conversión; la model card remite a las notas del modelo base de NVIDIA.
- La cuantización a 8 bits introduce una ligera desviación numérica respecto a bf16, aunque las validaciones reportadas muestran una fidelidad alta (coseno ≥ 0,9993 por capa).
- El repositorio ocupa ~81 GB, lo que exige espacio en disco considerable además de la memoria RAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard de agentes locales Agent-12: https://nicedreamzapp.github.io/agent12/
