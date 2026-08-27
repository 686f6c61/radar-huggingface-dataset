# ArtomYuan/Qwen3.8-27B-abliterated-ROCmFPX

## Resumen

Este modelo es una versión cuantizada en formato ROCmFPX del modelo Qwen3.8-27B abliterated, creada por ArtomYuan a partir del trabajo de huihui-ai, que eliminó el comportamiento de rechazo (refusal) del modelo original de Alibaba. El resultado es un modelo denso de 27.320 millones de parámetros, sin censura, optimizado para ejecutarse en hardware AMD mediante el motor halofpx, especialmente en APUs de la serie Strix Halo. La cuantización empleada es Q4_0_ROCMFP4_FAST con 4,25 bits por peso, lo que reduce el tamaño a unos 13,6 GiB.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece una versión sin restricciones de seguridad del potente Qwen3.8-27B, y por otro, demuestra la viabilidad de ejecutar modelos de 27B en hardware de consumo AMD con un rendimiento aceptable (13,81 tokens/s en generación). Incluye además soporte para Multi-Token Prediction (MTP), que acelera la generación aproximadamente un 50 % cuando está activado. No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas full attention + 48 capas linear attention) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | Todos (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (4,25 bpw) publicado; también se mencionan Q4_0_ROCMFP4_STRIX_LEAN, Q4_0_ROCMFP4 base y Q8_0_ROCMFPX, no publicados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF propietario ROCmFPX (no compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, emplea una arquitectura híbrida de atención: solo 16 de las 64 capas utilizan atención completa (full attention), mientras que las otras 48 usan atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional y de memoria frente a un transformer denso clásico, manteniendo la capacidad de modelar dependencias de largo alcance.

Sobre esta base, huihui-ai aplicó una técnica de abliteration que elimina el comportamiento de rechazo del modelo, dando lugar a una versión sin censura. ArtomYuan tomó ese modelo ya cuantizado en GGUF y lo re-cuantizó localmente al formato ROCmFPX (Q4_0_ROCMFP4_FAST) usando el motor halofpx con la opción `--allow-requantize`. No se dispone de información sobre el dataset de entrenamiento original ni sobre procesos de RLHF o DPO, ya que se trata de un trabajo de cuantización y modificación de pesos, no de un entrenamiento desde cero. El modelo conserva la cabeza MTP (Multi-Token Prediction), que permite predecir varios tokens a la vez y acelerar la generación.

## Capacidades

- Generación de texto libre y conversacional, con capacidad de razonamiento y resolución de problemas matemáticos y de código, heredadas del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling: el modelo base está diseñado para agentes y flujos de trabajo automatizados, aunque no se confirma explícitamente en esta versión cuantizada.
- Capacidad para tareas de agente y razonamiento multi-paso, gracias a la arquitectura híbrida y al entrenamiento del modelo original.
- Multilingüe: el modelo base de Qwen soporta múltiples idiomas, pero no se especifican cuáles en esta versión.
- Modo de razonamiento: se puede activar o desactivar mediante `reasoning_mode` en la API de halofpx (`off` para salida directa).
- MTP (Multi-Token Prediction): acelera la generación aproximadamente un 50 % cuando está habilitado.
- Sin capacidades de visión: esta versión es solo texto, a pesar de que el modelo base es multimodal nativo.

## Casos de uso

- Generación de contenido creativo sin restricciones: al ser una versión abliterated, permite redactar ficción, guiones o diálogos que otros modelos censurarían, útil para escritores y creadores que necesitan libertad temática.
- Despliegue local en hardware AMD de consumo: gracias a la cuantización ROCmFPX y al motor halofpx, puede ejecutarse en APUs como el Ryzen AI MAX+ 395 con 120 GB de memoria unificada, sin necesidad de GPUs dedicadas de gama alta.
- Asistente de programación en entornos sin conexión: el modelo base destaca en generación de código, y esta versión cuantizada permite usarlo en equipos AMD sin depender de servicios en la nube.
- Automatización de tareas de oficina: el modelo base está optimizado para flujos de trabajo de oficina (resúmenes, redacción de informes, gestión de correos), y esta versión lo hace viable en hardware local.
- Investigación sobre alineación y seguridad: al ser una versión sin refusal, permite estudiar cómo se comporta el modelo cuando se eliminan las barreras de seguridad, útil para investigadores en ética de IA.
- Prototipado rápido de agentes conversacionales: con soporte de tool calling y razonamiento multi-paso, puede integrarse en sistemas de agentes que requieran respuestas sin filtros, por ejemplo en entornos de simulación o pruebas.

## Benchmarks y rendimiento

La model card incluye mediciones propias realizadas con llama-bench en un AMD Strix Halo (gfx1151), con prompt de 256 tokens y generación de 256 tokens, 16 hilos, flash attention activada y 99 capas en GPU. Los resultados comparan las distintas variantes de cuantización ROCmFPX:

| Variante | tg256 (t/s) | pp256 (t/s) | Tamaño | bpw |
|---|---:|---:|---:|---:|
| Q4_0_ROCMFP4_FAST (este repo) | 13,81 | 376,0 | 13,6 GiB | 4,25 |
| Q4_0_ROCMFP4_STRIX_LEAN | 13,79 | 374,8 | 13,8 GiB | 4,27 |
| Q4_0_ROCMFP4 (base) | 11,78 | 331,6 | 16,5 GiB | 4,50 |
| Q8_0_ROCMFPX | 7,62 | 271,0 | 26,3 GiB | 8,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada. El autor indica que la variante FAST es la que mejor equilibrio ofrece entre velocidad y precisión, siendo un 15 % más rápida que la base con una pérdida de precisión marginal.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa ~13,6 GiB, por lo que se necesita al menos 16 GiB de memoria disponible (VRAM o memoria unificada) para cargarlo, más overhead de contexto y activaciones.
- GPU recomendadas: AMD con soporte ROCm/Vulkan, especialmente APUs Strix Halo (Ryzen AI MAX+ 395, Radeon 8060S) con memoria unificada. También podría funcionar en GPUs AMD discretas con ROCm, aunque no se ha verificado.
- No cabe en GPUs de consumo con menos de 16 GiB de VRAM, como una RTX 4060 de 8 GB o una RTX 4070 de 12 GB. Sí podría caber en una RTX 4090 (24 GB) o en GPUs AMD con 16 GB o más, siempre que el motor halofpx las soporte.
- Opciones de despliegue: exclusivamente mediante el motor halofpx (registro del GGUF en su registry y carga vía API `POST /api/v1/load`). No es compatible con vLLM, llama.cpp, Ollama ni TGI en sus versiones estándar.
- Latencia y throughput: en el entorno de prueba (Strix Halo), se midieron 13,81 tokens/s en generación y 376 tokens/s en prefill con la variante FAST. Con MTP activado, la generación sube a 17-19 tokens/s según la card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base, Alibaba) | 27,32B | no disponible | BF16 | Apache-2.0 | safetensors |
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,32B | no disponible | GGUF (varias) | Apache-2.0 | GGUF |
| ArtomYuan/Qwen3.8-27B-abliterated-ROCmFPX (este) | 27,32B | no disponible | Q4_0_ROCMFP4_FAST | Apache-2.0 | GGUF propietario ROCmFPX |

La principal diferencia frente al modelo base es la eliminación del refusal (abliteration) y la cuantización específica para ROCmFPX. Frente a la versión GGUF de huihui-ai, esta versión es más ligera (13,6 GiB frente a un GGUF Q4 estándar de tamaño similar) y está optimizada para el motor halofpx, pero pierde compatibilidad con el ecosistema llama.cpp. No se dispone de datos de rendimiento comparativos con otros modelos de 27B en tareas estándar.

## Limitaciones y advertencias

- Formato propietario: el archivo GGUF solo puede cargarse con el motor halofpx; llama.cpp y otras herramientas estándar no lo reconocen, lo que limita su portabilidad.
- Sin capacidades de visión: a pesar de que el modelo base es multimodal, esta versión es solo texto. El archivo mmproj incluido no es funcional con el motor ROCmFPX.
- MTP y visión incompatibles: activar MTP junto con visión provoca un fallo del motor, según la documentación de halofpx.
- Contenido sin censura: al ser abliterated, el modelo puede generar respuestas que violen políticas de seguridad, contenido violento, ilegal o dañino. El autor advierte que se usa bajo responsabilidad del usuario.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados o con contexto insuficiente.
- Longitud de contexto no especificada: no se ha documentado la ventana de contexto máxima soportada en esta versión, lo que dificulta planificar su uso en tareas que requieran contextos largos.
- Sin garantías de producción: el autor declara que no se ofrece ninguna garantía; el modelo es un experimento de cuantización y no ha sido validado para entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArtomYuan/Qwen3.8-27B-abliterated-ROCmFPX
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Motor halofpx (ROCmFPX): https://github.com/julianmb/halofpx
- Repositorio de despliegue en Strix Halo: https://github.com/julianmb/q38rocm
- Modelo abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
