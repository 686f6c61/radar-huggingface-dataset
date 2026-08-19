# maglun/Qwen3.8-27B-MLX-Mixed-3.80bpw

## Resumen

El modelo `maglun/Qwen3.8-27B-MLX-Mixed-3.80bpw` es una conversión cuantizada en formato MLX-VLM del modelo multimodal `Qwen/Qwen3.8-27B`, desarrollada de forma independiente por el usuario maglun. Está pensada para ejecutarse en Apple Silicon mediante la librería MLX, y ofrece una cuantización de bits mixtos con una media agregada de 3,80 bits por peso (BPW) en la torre de lenguaje, mientras que la torre de visión se mantiene en BF16 sin cuantizar. El resultado es un paquete de unos 12,76 GiB que cabe en equipos con memoria unificada moderada, como un Mac con chip M4 Pro.

La relevancia de este modelo radica en que permite ejecutar un modelo multimodal de 27.000 millones de parámetros (26.895.998.464 solo en la torre de texto) en hardware de consumo de Apple, con una pérdida de calidad aparentemente contenida según las pruebas rápidas publicadas por el autor. Al tratarse de una cuantización independiente, no incluye los pesos del módulo MTP (Multi-Token Prediction) del modelo original, por lo que no se puede utilizar para decodificación especulativa, pero sí para generación autoreresiva estándar de texto, imagen y vídeo.

La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial y modificación. No obstante, al ser una conversión no oficial, se recomienda revisar la documentación del modelo original para conocer las limitaciones de seguridad y uso previsto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con "linear-mixer" (detalles no especificados en la información disponible) |
| Parametros totales | 26.895.998.464 (torre de texto) + torre de visión (no especificado) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero no se especifica en esta conversión) |
| Tipos de cuantizacion | Bits mixtos: 3,25 BPW (embeddings, MLP gate), 3,5 BPW (Q/K, MLP up/down), 4,5 BPW (V/O, linear-mixer), 5,5 BPW en capas protegidas, 16 BPW en estado del linear-mixer y normas |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se detalla en esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX-VLM) |

Nota: el campo "Parámetros totales" en la página de HuggingFace muestra 4.024.519.920, un valor inconsistente con la model card del autor, que indica 26.895.998.464 parámetros solo para la torre de texto. Se ha utilizado el dato de la model card por ser más fiable.

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B no se detalla en la información proporcionada, pero la model card de esta conversión menciona la presencia de un "linear-mixer" con componentes como `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `A_log` y `dt_bias`, lo que sugiere una arquitectura híbrida que combina atención tradicional con un mecanismo de mezcla lineal (posiblemente similar a Mamba o un estado recurrente). La torre de visión se mantiene en BF16 sin cuantizar, mientras que la torre de lenguaje se cuantiza con una política afín de bits mixtos: las capas humanas 1-7 y 55-64 reciben protección de bordes con tasas más altas (5,5 BPW) para preservar la calidad en capas críticas.

No se dispone de información sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO). Esta conversión es únicamente una cuantización del checkpoint original, realizada con un cuantizador Swift propio del autor, y no incluye los pesos MTP. La validación se realizó con `mlx_vlm.load(strict=True)` y pruebas de generación de texto e imagen.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de mantener conversaciones y resolver tareas de razonamiento, como se observa en las pruebas de GSM8K y HumanEval+.
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede describir imágenes y responder preguntas sobre su contenido. La prueba de humo generó una descripción correcta de dos gatos sobre una manta rosa.
- Generación de código: obtuvo un 75% de pass@1 en HumanEval+ (muestra de 8 ítems), lo que indica competencia en tareas de programación.
- Razonamiento matemático: alcanzó un 91,7% de precisión en GSM8K (muestra de 12 ítems).
- Modo de pensamiento (thinking mode): el modelo soporta `reasoning_effort=low` según las pruebas del autor, lo que sugiere capacidad de razonamiento explícito antes de responder.
- Multimodalidad: además de texto e imagen, la model card menciona generación de vídeo, aunque no se probó en esta conversión.
- Conversacional: diseñado para interacciones de diálogo multi-turno.

## Casos de uso

- Descripción automática de imágenes para accesibilidad: el modelo puede generar texto alternativo para imágenes en sitios web o aplicaciones, ayudando a personas con discapacidad visual. Su torre de visión BF16 sin cuantizar preserva la calidad de la comprensión visual.
- Asistente de programación con soporte de imágenes: un desarrollador puede capturar una pantalla con un error y pedir al modelo que lo explique o sugiera una corrección. El 75% en HumanEval+ indica una base sólida para tareas de código.
- Chatbot multimodal para atención al cliente: integrado en un Mac con MLX, puede responder consultas que incluyan capturas de pantalla o fotos de productos, manteniendo conversaciones contextuales.
- Herramienta educativa de matemáticas: el modelo puede resolver problemas aritméticos y explicar el razonamiento paso a paso, útil en entornos de tutoría automatizada.
- Análisis de documentos con imágenes: extraer información de facturas, diagramas o gráficos combinando texto e imagen, gracias a su capacidad de procesar ambos formatos.
- Prototipado rápido en entornos Apple: al ser una conversión MLX, se integra fácilmente en aplicaciones macOS o iOS mediante la librería `mlx-vlm`, permitiendo crear demos de visión por computadora sin necesidad de GPUs NVIDIA.

## Benchmarks y rendimiento

El autor publicó pruebas rápidas de control de calidad con muestras pequeñas (no estadísticamente significativas) comparando la versión BF16 del texto, una cuantización previa de 4,95 BPW y esta versión de 3,80 BPW. Los resultados son los siguientes:

| Prueba | BF16 texto | 4,95-BPW | 3,80-BPW |
|---|---|---|---|
| PPL en chat (n=6) ↓ | 5,6728 | 5,7428 | 6,2212 |
| HumanEval+ pass@1 (n=8) | 75,0% | 75,0% | 75,0% |
| GSM8K precisión (n=12) | 91,7% | 100,0% | 91,7% |

Estos datos son orientativos y no deben considerarse como resultados de benchmarks formales. No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- Memoria unificada: la validación en un Apple M4 Pro mostró un pico de 13,81 GiB para carga estricta más dos generaciones cortas. Se recomienda un mínimo de 16 GiB de memoria unificada para un uso cómodo.
- Chip: requiere Apple Silicon (M1 o posterior) con soporte para MLX. El modelo se probó en M4 Pro, pero debería funcionar en cualquier chip M-series con suficiente memoria.
- GPU: no aplica a GPUs NVIDIA; es específico para la arquitectura unificada de Apple.
- Opciones de despliegue: se utiliza con la librería `mlx-vlm` (versión 0.6.14) y `mlx` 0.32.0. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos de rendimiento en términos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (cuantizaciones MLX de Qwen3.8-27B u otros modelos multimodales de tamaño similar). La comparación más directa sería con el modelo base `Qwen/Qwen3.8-27B` en su versión original BF16, que requiere aproximadamente 54 GiB de memoria (27B parámetros × 2 bytes), frente a los 12,76 GiB de esta cuantización. Otras cuantizaciones de la misma familia, como la de 4,95 BPW del mismo autor, ofrecen una calidad ligeramente superior (PPL 5,7428 vs 6,2212) a costa de un mayor tamaño. No se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- Cuantización agresiva: con una media de 3,80 BPW, es probable que haya una pérdida de calidad notable en tareas complejas, especialmente en comparación con el modelo BF16 original. La PPL en chat aumenta de 5,67 a 6,22.
- Sin soporte MTP: al omitir los pesos del módulo MTP, no se puede utilizar decodificación especulativa ni se garantiza el comportamiento de generación con MTP del modelo original.
- Validación limitada: las pruebas publicadas son de humo, con muestras muy pequeñas (n=6, n=8, n=12) y no cubren contexto largo ni vídeo.
- Sesgos y alucinaciones: no se ha evaluado el comportamiento del modelo en cuanto a sesgos o alucinaciones. Al ser una cuantización, puede amplificar estos problemas.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede tener limitaciones adicionales de seguridad o uso responsable que no se detallan en esta conversión.
- Dependencia de MLX: el formato es exclusivo para Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin una conversión adicional.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que sugiere que es una versión reciente y posiblemente no probada en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/maglun/Qwen3.8-27B-MLX-Mixed-3.80bpw)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Commit de MLX-VLM utilizado para validación](https://github.com/Blaizzy/mlx-vlm/commit/738e44063f145f7df24acc375e33c379053982d5)
