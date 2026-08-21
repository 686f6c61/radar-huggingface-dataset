# NouraAlqasim/allam-7b-nvfp4_awq_lite-w4a16-mixed

## Resumen

El modelo `NouraAlqasim/allam-7b-nvfp4_awq_lite-w4a16-mixed` es un checkpoint cuantizado del modelo `humain-ai/ALLaM-7B-Instruct-preview`, perteneciente a la familia ALLaM desarrollada por el Centro Nacional de Inteligencia Artificial (NCAI) de la Autoridad de Datos e IA de Arabia Saudí (SDAIA). ALLaM es una serie de modelos de lenguaje diseñados específicamente para avanzar en el procesamiento del árabe, con entrenamiento bilingüe árabe‑inglés y una arquitectura decoder‑only basada en Llama. Este checkpoint concreto aplica una cuantización post‑entrenamiento con NVIDIA ModelOpt, usando la configuración `NVFP4_AWQ_LITE_CFG`, que convierte los pesos a precisión NVFP4 (4 bits) mientras mantiene las activaciones en FP16 (modo W4A16). El resultado es un modelo considerablemente más ligero y rápido para inferencia, pensado para entornos con recursos limitados.

La relevancia de este modelo radica en que ofrece una versión compacta de un modelo árabe de última generación, sin necesidad de GPUs de alta gama. Al estar calibrado con una mezcla de datos árabes (incluyendo variantes del Golfo), está orientado a aplicaciones que requieren procesamiento de texto en árabe con baja latencia. No obstante, al ser una cuantización, presenta una ligera degradación de precisión frente al modelo original, y su carga no es compatible con `transformers` estándar, sino con herramientas como vLLM que soportan el formato `modelopt`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder‑only (base Llama) |
| Parámetros totales | 3.762.556.928 (según safetensors) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (pesos 4 bits, activaciones FP16) — W4A16 |
| Idiomas soportados | Árabe e inglés (del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con cuantización `modelopt`) |

## Arquitectura y entrenamiento

El modelo base `humain-ai/ALLaM-7B-Instruct-preview` es un transformer decoder‑only con una arquitectura similar a Llama, pero con una expansión de vocabulario específica para el árabe. Se entrenó sobre una mezcla de texto árabe e inglés, usando una técnica de adquisición de segundo idioma que evita el olvido catastrófico del inglés. El checkpoint que nos ocupa no es un entrenamiento desde cero, sino una cuantización post‑entrenamiento realizada con NVIDIA ModelOpt (versión 0.46.0). La cuantización se ejecutó sobre los pesos del modelo base (originalmente en float16) usando la configuración `NVFP4_AWQ_LITE_CFG`, que combina cuantización de pesos de 4 bits (E2M1, block 16, con escala E4M3 por bloque) y una búsqueda AWQ basada en estadísticas de activación. La calibración se realizó con un conjunto de 512 muestras de 512 tokens, de variedad mixta (`calib3_mixed.txt`), alcanzando un error cuadrático medio (MSE) de 2.277777e‑06 en los pesos. Tras la calibración, los cuantizadores de activación se desactivaron, quedando el modelo en modo exclusivo de pesos (W4A16). No se ha publicado información sobre entrenamiento adicional o ajuste fino con RLHF/DPO.

## Capacidades

- Generación de texto en árabe e inglés, con capacidad de seguir instrucciones (modelo instructivo).
- Razonamiento y resolución de tareas generales de lenguaje, como comprensión lectora, resumen y generación de respuestas.
- Soporte de conversación multi‑turno dentro de la ventana de contexto disponible (no especificada).
- No se indica soporte explícito de *tool calling*, visión, audio u otras modalidades.
- La cuantización mantiene las capacidades del modelo base, aunque puede degradar ligeramente la calidad de las respuestas en tareas muy precisas.

## Casos de uso

- **Asistente de atención al cliente en árabe**: el modelo puede gestionar conversaciones en árabe (y en inglés) con una latencia baja gracias a su cuantización, lo que permite desplegarlo en infraestructuras con GPUs modestas o incluso en entornos de edge.
- **Traducción automática árabe‑inglés**: dado su entrenamiento bilingüe, es útil para traducir fragmentos cortos o textos de longitud media en tiempo real, aunque no es un sistema de traducción especializado.
- **Generación de contenido en árabe**: puede redactar artículos, posts para redes sociales o descripciones de producto en árabe con un estilo natural, útil para marketing y comunicación.
- **Análisis de sentimiento y clasificación de textos árabes**: puede procesar comentarios, reseñas o mensajes en árabe y extraer información o clasificar la intención, por ejemplo en sistemas de moderación.
- **Aplicaciones educativas**: sirve para crear tutores de idiomas o asistentes de aprendizaje que interactúan en árabe e inglés, con un consumo de memoria bajo.
- **Chatbots en aplicaciones móviles**: al ser ligero (pesos de 4 bits), puede integrarse en aplicaciones móviles o dispositivos con poca VRAM, ofreciendo respuestas en árabe sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: los pesos NVFP4 ocupan aproximadamente 1.9 GB (3.76B parámetros × 0.5 bytes). Con activaciones y sobrecarga del runtime, el modelo puede caber en una GPU con 4 GB de VRAM para contextos cortos.
- **GPU recomendadas**: RTX 3050 (4 GB), RTX 3060 (6 GB), RTX 3090, o GPUs de datacenter como A10, L4, etc. Para contextos largos se necesitan más VRAM.
- **Opciones de despliegue**: la card del modelo recomienda usar vLLM con el comando `vllm serve NouraAlqasim/allam-7b-nvfp4_awq_lite-w4a16-mixed --quantization modelopt_fp4`. No se menciona compatibilidad con `transformers` ni con `llama.cpp` en la información disponible.
- **Latencia y throughput**: no se proporcionan datos concretos; la cuantización W4A16 reduce el tamaño de los pesos y acelera la inferencia en comparación con FP16, pero el rendimiento exacto depende del hardware y el framework.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `NouraAlqasim/allam-7b-nvfp4_awq_lite-w4a16-mixed` | 3.76B (real) | NVFP4 (W4A16) | No disponible | No disponible | Cuantizado, ligero |
| `humain-ai/ALLaM-7B-Instruct-preview` | 7B (nominal) | FP16 | No disponible | No disponible | Modelo base original |
| `NouraAlqasim/allam-7b-fp8-mixed` | 7B (nominal) | FP8 | No disponible | No disponible | Cuantización FP8 del mismo autor |

Nota: los parámetros del modelo base se citan como 7B en el nombre, pero el checkpoint cuantizado presenta 3.76B en safetensors; esto puede deberse a que el modelo base tiene 3.76B parámetros y el nombre "7B" se refiere al tamaño en memoria FP16 (≈7.5 GB).

## Limitaciones y advertencias

- La cuantización NVFP4 introduce una pérdida de precisión respecto al modelo original, lo que puede afectar a tareas que requieren exactitud (p. ej., matemáticas o razonamiento complejo).
- No es cargable con `transformers` directamente; solo funciona con frameworks que soporten el formato `modelopt`, como vLLM.
- La licencia no está especificada en la información disponible, lo que podría ser un obstáculo para uso comercial.
- El modelo base es un *preview* (versión preliminar) y puede contener errores o sesgos no corregidos.
- No se dispone de la longitud de contexto; si es corta, limitará las aplicaciones que requieren conversaciones largas.
- La calibración se hizo con un conjunto mixto de árabe (MSA y variantes del Golfo) e inglés, por lo que el rendimiento en otros dialectos árabes o idiomas puede ser inferior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NouraAlqasim/allam-7b-nvfp4_awq_lite-w4a16-mixed
- Paper ALLaM (arXiv): https://arxiv.org/html/2407.15390v1
- Perfil del autor: https://huggingface.co/NouraAlqasim/models
- Modelo base en Ollama (no cuantizado): https://ollama.com/iKhalid/ALLaM:7b
