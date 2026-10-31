# HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-5bit

## Resumen

Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-5bit es un puerto no oficial a formato MLX (5 bits) del modelo Qwen3.8-27B Turbo-Brilliance 50X Reasoning-Instruct de DavidAU, realizado por el usuario HireTheRobots para usuarios de Apple Silicon. El modelo base es un fine-tune de 27 mil millones de parámetros sobre la arquitectura Qwen3.8 (multimodal, image-text-to-text), con soporte de decodificación especulativa mediante una cabeza MTP (multi-token prediction) propia que se incluye como drafter independiente.

El valor diferencial de este release es doble: por un lado, mantiene intactas las capacidades del original de DavidAU (27 modos de razonamiento, 27 modos instruct y 9 modos "xhigh", accesibles mediante etiquetas como `{REASON:coder}` o `{REASON:hyper}` en el mensaje del usuario); por otro, el puerto MLX permite ejecutarlo de forma nativa en Macs con chips Apple Silicon usando mlx-vlm, con mediciones de perplexity y divergencia KL frente a la versión de 8 bits que documentan la calidad de la cuantización.

El repo incluye el modelo principal cuantizado a 5 bits (afín, group size 64, con `lm_head` a 8 bits), la torre de visión sin cuantizar, el drafter MTP en bf16, la plantilla de chat original de DavidAU sin modificar y el script de conversión para reproducir el proceso. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.8, con cabeza MTP para decodificación especulativa |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit affine MLX (group size 64), `lm_head` a 8 bits, torre de visión sin cuantizar; existen versiones 3-bit, 4-bit, 6-bit y 8-bit del mismo modelo |
| Idiomas soportados | en (etiquetado oficial; el modelo base Qwen3.8 suele ser multilingue, pero no consta en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con drafter MTP en bf16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de 27,36 mil millones de parámetros basado en Qwen3.8, con torre de visión integrada (bit a bit idéntica al `mmproj-BF16.gguf` del original) y una cabeza MTP (multi-token prediction) que permite decodificación especulativa: el drafter, mantenido en bf16 y reutilizando los embeddings y la capa de salida del modelo principal, predice bloques de tokens que el modelo principal verifica. En mlx-vlm se configura con `--draft-block-size 3`.

Sobre el entrenamiento del modelo base no hay datos publicados en la información disponible (tokens, composición del dataset, RLHF/DPO): el trabajo de DavidAU se documenta en su propia model card, que describe los modos de razonamiento pero no detalla el proceso de entrenamiento. La innovación destacable de este release es la conversión a MLX con cuantización afín de 5 bits (group size 64) manteniendo la capa de salida a 8 bits —según el autor, esto preserva la calidad de las cuantizaciones MAX— y la inclusión del drafter MTP como componente independiente compatible con el pipeline especulativo de mlx-vlm.

## Capacidades

- Generación de texto conversacional con plantilla de chat Turbo-Brilliance, byte a byte idéntica a la del GGUF original.
- Razonamiento configurable mediante 27 modos de razonamiento, 27 modos instruct y 9 modos "xhigh", seleccionables con etiquetas en el mensaje del usuario (`{REASON:coder}`, `{REASON:hyper}`, `{REASON:help}`, `{REASON:icoder}`) o con kwargs de plantilla (`enable_thinking=True, reasoning_effort="hyper"`).
- Modo "thinking" activable con `--enable-thinking`; sin etiqueta, se comporta como el Qwen3.8 original (xhigh por defecto en thinking, medium en instruct).
- Comprensión de imágenes (pipeline image-text-to-text) gracias a la torre de visión Qwen3.8 sin cuantizar.
- Tool calling: la plantilla renderizada sin modo activo es idéntica a la del Qwen3.8 original, incluido el soporte de herramientas.
- Decodificación especulativa nativa mediante MTP, con aceleración medida (por ejemplo, de 17,4 a 29,8 tok/s en la versión 4-bit).
- Compatibilidad con generación en streaming desde Python mediante `mlx_vlm.stream_generate`.

## Casos de uso

- Razonamiento profundo local en Apple Silicon: en un Mac con 32-36 GB de memoria unificada, el modelo puede ejecutarse sin GPU dedicada, aprovechando los modos `{REASON:hyper}` o `{REASON:xhigh}` para tareas de análisis complejo que requieren cadenas de razonamiento largas.
- Asistencia de programación con razonamiento intensivo: el modo `{REASON:coder}` está orientado a tareas de código; puede usarse como copiloto local para depuración, refactorización y diseño de algoritmos, con la ventaja de que todo el procesamiento ocurre en local.
- Análisis de imágenes y documentos multimodales: la torre de visión sin cuantizar permite combinar entradas de imagen con instrucciones de texto (descripción, extracción de datos, razonamiento visual) directamente desde mlx-vlm.
- Generación rápida de texto con decodificación especulativa: el drafter MTP incluido permite acelerar la inferencia (hasta un 71 % más de tokens por segundo en la variante 4-bit), útil para chat interactivo donde la latencia importa.
- Agentes con tool calling: al ser la plantilla compatible con la del Qwen3.8 original, puede integrarse en frameworks de agentes que requieran llamadas a funciones en múltiples pasos.
- Experimentación y reproducibilidad de cuantizaciones: el script `conversion/gguf2mlx.py` incluido permite generar otras anchuras de bits o verificar la conversión, útil para investigadores que estudian el impacto de la cuantización en modelos multimodales.
- Prototipado de prompts con sistema de ayuda integrado: la etiqueta `{REASON:help}` muestra el menú de ayuda detallado del propio modelo, útil para descubrir los modos disponibles sin consultar documentación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de calidad de cuantización y velocidad, realizadas por el autor sobre un texto mixto de ~4.500 tokens (inglés y Python) en un Apple M5 Pro de 48 GB con mlx-vlm 0.7.10, 512 tokens greedy y bloque MTP de 3:

| Bits | Tamano | Perplexity | KL vs 8-bit | Coincidencia top token vs 8-bit | tok/s sin MTP | tok/s con MTP |
|---|---|---|---|---|---|---|
| 3-bit | 14,4 GB | 3,08 | 0,451 | 79,6 % | 21,2 | 17,7 |
| 4-bit | 17,6 GB | 2,37 | 0,170 | 89,5 % | 17,4 | 29,8 |
| 5-bit (este repo) | 20,8 GB | 2,19 | 0,045 | 93,9 % | 14,6 | 20,7 |
| 6-bit | 24,0 GB | 2,15 | 0,014 | 96,8 % | 11,9 | 10,4 |
| 8-bit | 30,4 GB | 2,15 | referencia | referencia | 8,8 | 18,1 |

La versión de 5 bits conserva un 93,9 % de coincidencia en el token superior frente a la de 8 bits, con una divergencia KL muy baja (0,045), lo que indica una degradación mínima respecto a la referencia.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 20,8 GB solo de pesos; el autor recomienda un Mac de 32 GB para contextos cortos y 36 GB o más para contextos largos (el KV cache y la torre de visión sin cuantizar añaden sobrecoste).
- GPU recomendadas: este puerto está pensado exclusivamente para Apple Silicon (chips M series con memoria unificada). No es un build CUDA; para GPU NVIDIA habría que usar el GGUF original de DavidAU.
- Consumer hardware: cabe en Macs con 32 GB de memoria unificada (M4 Pro, M5 Pro o superiores); en Macs de 24 GB no es recomendable para esta variante (mejor la de 3-bit, 14,4 GB, aunque con degradación medible).
- Despliegue: mlx-vlm 0.7.10 o superior (CLI `mlx_vlm.generate` o API Python con `stream_generate`), con descarga previa del repo completo porque el drafter MTP vive en el subdirectorio `mtp-drafter/`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en este formato MLX.
- Rendimiento medido: 14,6 tok/s sin decodificación especulativa y 20,7 tok/s con MTP (bloque de 3) en un Apple M5 Pro de 48 GB; el autor advierte que la velocidad absoluta depende del chip, aunque los ratios entre variantes deberían mantenerse.

## Comparativa con modelos similares

Comparativa entre las variantes MLX del mismo modelo publicadas por HireTheRobots (mismo modelo base, distinta cuantización):

| Variante | Tamano | Memoria minima | Perplexity | tok/s con MTP | Licencia |
|---|---|---|---|---|---|
| 3-bit | 14,4 GB | 24 GB (contextos cortos) | 3,08 | 17,7 | Apache 2.0 |
| 4-bit | 17,6 GB | 32 GB | 2,37 | 29,8 | Apache 2.0 |
| 5-bit (este repo) | 20,8 GB | 32-36 GB | 2,19 | 20,7 | Apache 2.0 |
| 6-bit | 24,0 GB | 36 GB | 2,15 | 10,4 | Apache 2.0 |
| 8-bit | 30,4 GB | 48 GB | 2,15 | 18,1 | Apache 2.0 |

Como alternativas de la misma categoria (modelos multimodales de ~27 B ejecutables en local), los candidatos obvios serían el Qwen3.8-27B original de Qwen u otros modelos de tamano similar, pero no se dispone de datos comparativos publicados en la información proporcionada: no disponible.

## Limitaciones y advertencias

- Se trata de un puerto no oficial: el autor recomienda explícitamente usar la versión oficial de DavidAU (MLX o safetensors) si esta se publica.
- La calidad del modelo base depende del trabajo de DavidAU, cuya model card documenta los modos pero no publica benchmarks estandarizados ni detalles del entrenamiento; el riesgo de alucinacion propio de modelos de este tamano no ha sido evaluado públicamente.
- Idioma etiquetado oficialmente como inglés; el comportamiento en castellano no está documentado en la ficha.
- La longitud de contexto no está especificada en la información disponible.
- La cuantización de 5 bits, aunque con KL muy baja (0,045), no es lossless: un 6,1 % de posiciones difieren en el token superior respecto a la versión de 8 bits.
- La variante de 5 bits es más lenta que la de 4 bits incluso con MTP (20,7 frente a 29,8 tok/s en el hardware de prueba), por lo que conviene valorar el compromiso calidad/velocidad según el caso.
- El drafter MTP requiere descargar el repo completo (20,8 GB) porque reside en un subdirectorio, y la aceleración especulativa depende de mlx-vlm; sin drafter, el throughput cae a 14,6 tok/s en el hardware de referencia.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero la plantilla de chat de DavidAU incluye un aviso de copyright (David Belton / DavidAU 2026) que conviene respetar al redistribuirla.

## Enlaces

- Modelo (este repo): https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-5bit
- Modelo base de DavidAU (GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Variantes MLX del mismo modelo: 3-bit (https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-3bit), 4-bit (https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-4bit), 6-bit (https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-6bit), 8-bit (https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-8bit)
- Discusiones que motivaron el puerto: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF/discussions/4 y https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF/discussions/22
- Perfil de DavidAU: https://huggingface.co/DavidAU
- Soporte al autor original: https://www.buymeacoffee.com/davidbelton
