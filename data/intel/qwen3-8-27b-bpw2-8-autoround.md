# Intel/Qwen3.8-27B-bpw2.8-AutoRound

## Resumen

Este modelo es una versión cuantizada de Qwen3.8-27B, un transformer denso multimodal de 27 mil millones de parámetros desarrollado por Alibaba. La cuantización, realizada por Intel con la herramienta AutoRound, aplica un esquema de precisión mixta de 2,8 bits por peso de media, lo que reduce el tamaño del modelo a 14,9 GB y permite su ejecución en hardware con recursos limitados. El modelo base soporta un contexto de 262 000 tokens y capacidades multimodales (visión y texto). Esta versión cuantizada resulta relevante para desarrolladores que necesitan desplegar un modelo de alto rendimiento en entornos con restricciones de memoria o GPU de consumo, aunque la agresiva reducción de bits conlleva una degradación notable en algunas tareas de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) |
| Parámetros totales | 27B (modelo base); el archivo safetensors reporta 5 283 237 360 parámetros, probablemente debido al formato de cuantización |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (modelo base) |
| Tipos de cuantización | 2,8 bits por peso (mixto INT2/INT4) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | No disponible (el modelo base es Apache 2.0, pero esta versión no lo indica) |
| Formato de pesos | safetensors (AutoRound) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con encoder de visión integrado, diseñado para tareas multimodales. La versión cuantizada se obtiene mediante post-entrenamiento (PTQ) con AutoRound, que emplea un esquema de precisión mixta automático (AutoScheme) para asignar 2 o 3 bits a diferentes capas, con un promedio de 2,8 bits por peso. Se incluyen las sobrecargas de escala y zero points. El proceso de cuantización se describe en el artículo SignRoundV2 (arXiv:2512.04746). No se han publicado detalles sobre el dataset de calibración utilizado, aunque el comando de generación indica 512 muestras y 1000 iteraciones.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base, aunque la cuantización puede degradar ligeramente el rendimiento en tareas complejas.
- Codificación y matemáticas: el modelo base destaca en estas áreas; la versión cuantizada mantiene un rendimiento aceptable, aunque con caídas notables en GSM8K (0,38 frente a 0,70 en BF16).
- Visión: al ser multimodal, puede procesar imágenes junto con texto, aunque no se han evaluado específicamente en esta versión cuantizada.
- Tool calling y agentes: el modelo base soporta estas funciones; la cuantización no las elimina, pero puede afectar a la fiabilidad.
- Multilingüe: el modelo base soporta múltiples idiomas, aunque no se especifica cuáles.
- Inferencia eficiente: gracias a la cuantización, el modelo ocupa solo 14,9 GB, lo que permite ejecutarlo en GPUs de consumo.

## Casos de uso

- Despliegue en GPU de consumo: con 14,9 GB de peso, el modelo cabe en una RTX 4090 (24 GB) o similar, permitiendo ejecutar un LLM de 27B en hardware doméstico.
- Asistente de código en local: el modelo base es fuerte en generación de código; la versión cuantizada puede usarse en entornos de desarrollo sin conexión a la nube.
- Chatbot multimodal en edge: al soportar visión, puede procesar imágenes en dispositivos con recursos limitados.
- Automatización de oficina: el modelo base está optimizado para tareas de oficina (resúmenes, redacción, etc.), y la cuantización permite ejecutarlo en servidores modestos.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de la precisión mixta en modelos grandes.
- Prototipado rápido: al ser pequeño y fácil de servir con vLLM, permite probar aplicaciones sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación comparando la versión BF16 con la cuantizada:

| Backend | Precisión | MMLU | GSM8K | MMLU-Pro |
|---|---|---|---|---|
| lmeval hf | BF16 | 0,8349 | 0,7043 | 0,6278 |
| lmeval hf | Cuantizado (2,8 bits) | 0,8158 | 0,3829 | 0,5656 |
| evalscope vllm | BF16 | - | 0,9757 | - |
| evalscope vllm | Cuantizado | - | 0,9174 | - |

Se observa una degradación significativa en GSM8K (razonamiento matemático) con el backend lmeval, aunque con evalscope la caída es menor. MMLU y MMLU-Pro se mantienen relativamente cercanos al BF16.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 14,9 GB en disco, por lo que se necesita al menos 16 GB de VRAM para inferencia (considerando sobrecarga de runtime). Una RTX 4090 (24 GB) o A6000 (48 GB) son adecuadas.
- GPU recomendadas: RTX 3090/4090, A100, H100, o cualquier GPU con al menos 16 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama alta para consumidores.
- Opciones de despliegue: vLLM (requiere el PR #52729), también se puede usar llama.cpp si se convierte a GGUF, aunque no se proporciona.
- Latencia y throughput: no disponible. Los kernels de 2 y 3 bits son menos eficientes que los de 4 y 8 bits, por lo que el rendimiento puede ser inferior al esperado.

## Comparativa con modelos similares

Comparación con el modelo base y otras cuantizaciones típicas:

| Modelo | Parámetros | Contexto | Precisión (MMLU) | Licencia | Tamaño |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 262k | 0,8349 | Apache 2.0 | ~54 GB |
| Intel/Qwen3.8-27B-bpw2.8-AutoRound | 27B | 262k | 0,8158 | No disponible | 14,9 GB |
| Otras cuantizaciones (GGUF, AWQ) | 27B | 262k | No disponible | No disponible | Variable |

No se dispone de datos de otras cuantizaciones del mismo modelo para comparar directamente.

## Limitaciones y advertencias

- La cuantización degrada el rendimiento en tareas de razonamiento matemático (GSM8K cae de 0,70 a 0,38 en lmeval).
- Los kernels de 2 y 3 bits no están optimizados, lo que puede resultar en inferencia más lenta que con cuantizaciones de 4 u 8 bits.
- Requiere una versión específica de vLLM (PR #52729) con soporte para compressed-tensors WNA16 MoE Humming.
- La licencia no está especificada en esta versión; se debe asumir la del modelo base (Apache 2.0) con cautela.
- El modelo puede producir salidas incorrectas, sesgadas o inseguras; es responsabilidad del usuario validar su uso.
- No se han publicado evaluaciones de seguridad o sesgos para esta versión cuantizada.

## Enlaces

- HuggingFace: https://huggingface.co/Intel/Qwen3.8-27B-bpw2.8-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio AutoRound: https://github.com/intel/auto-round
- Paper SignRoundV2: https://arxiv.org/abs/2512.04746
- PR de vLLM: https://github.com/vllm-project/vllm/pull/52729
- Blog de análisis (kingy.ai): https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Guía de Yottalabs: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
