# kingjones777/DiffusionGemma-26B-A4B-it-ROCmFP4-GGUF

## Resumen

DiffusionGemma-26B-A4B-it-ROCmFP4-GGUF es una cuantización GGUF específica para hardware AMD del modelo DiffusionGemma-26B-A4B-it de Google DeepMind, publicada por el usuario kingjones777. DiffusionGemma es un modelo experimental de generación de texto basado en difusión discreta: en lugar de generar tokens de forma secuencial y autoregresiva, denoisa un canvas de 256 tokens en paralelo durante un número variable de pasos, lo que permite una generación mucho más rápida en tareas que requieren salidas largas. El modelo base emplea una arquitectura Mixture-of-Experts (MoE) con 26 000 millones de parámetros totales y unos 4 000 millones activos por token, con 128 expertos y selección top-8.

Esta versión concreta adapta los pesos a tipos de cuantización FP4 y FP8 propietarios del fork ROCmFPX de llama.cpp, diseñados para GPUs AMD RDNA 3.5 como Strix Halo (gfx1151). El resultado son cuatro archivos GGUF con tamaños entre 13.46 GiB y 24.68 GiB, que requieren un binario especial (`llama-diffusion-cli` o `llama-diffusion-gemma-server`) y no son compatibles con `llama-server` estándar. La relevancia de este modelo radica en que permite ejecutar un LLM de difusión en hardware AMD sin necesidad de GPUs NVIDIA, aprovechando al máximo la capacidad de cómputo paralelo de la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con difusion discreta (block-diffusion), 128 expertos, top-8 |
| Parametros totales | 25 250 987 068 |
| Parametros activos | ~4 000 millones (4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFP4 (FP4), ROCmFPX (FP8) - exclusivos del fork ROCmFPX de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia propietaria de Google con restricciones de uso) |
| Formato de pesos | GGUF (safetensors no incluido, solo cuantizaciones) |

## Arquitectura y entrenamiento

DiffusionGemma se basa en la arquitectura Gemma 4 de Google DeepMind, concretamente en la variante MoE de 26B parámetros con 4B activos. La innovación principal es el uso de difusión discreta para la generación de texto: el modelo recibe un canvas de 256 tokens inicializados con ruido y lo denoisa de forma iterativa, actualizando todas las posiciones en paralelo en cada paso. El número de pasos no es fijo, sino que el modelo decide cuándo detenerse según un presupuesto de entropía interno. Esta aproximación contrasta con la generación autoregresiva tradicional, donde cada token depende del anterior.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). La model card de la cuantización indica que el modelo es solo texto, sin módulo de visión (mmproj) ni cabezal de draft para decodificación especulativa (MTP). El autor de la cuantización no ha modificado los pesos, solo los ha convertido a los formatos FP4/FP8 de ROCmFPX, protegiendo los embeddings y manteniendo `tie_word_embeddings: true`.

## Capacidades

- Generación de texto mediante difusión discreta: produce bloques de hasta 256 tokens en paralelo, con calidad aceptable a partir de 12 pasos de denoising.
- Velocidad de decodificación superior a modelos autoregresivos en salidas largas: el coste por paso es constante (denoisa todo el canvas), por lo que el rendimiento mejora cuanto más largo es el texto generado.
- Soporte de tool calling / function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible; el modelo está orientado a generación directa, no a razonamiento encadenado.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales: generación paralela de layouts completos, ideal para tareas de completado de texto largo. No incluye visión ni audio.

## Casos de uso

- Generación de texto en tiempo real para aplicaciones interactivas: gracias a la denoising paralelo, el modelo puede producir respuestas largas (párrafos completos) en menos tiempo que un modelo autoregresivo equivalente, siempre que la salida supere cierto umbral de longitud. Es adecuado para chatbots que necesitan respuestas extensas sin esperas perceptibles.
- Prototipado de aplicaciones de IA generativa en hardware AMD: al estar cuantizado para ROCmFPX, permite a desarrolladores con GPUs RDNA 3.5 (Strix Halo) ejecutar un LLM de difusión sin depender de CUDA, usando llama.cpp como backend.
- Investigación en modelos de difusión para texto: el modelo sirve como referencia para estudiar el comportamiento de la difusión discreta en tareas de generación, especialmente la relación entre número de pasos, calidad y velocidad.
- Generación de código en entornos de desarrollo: aunque la model card advierte que el código largo puede cortarse, el modelo puede generar fragmentos de código de tamaño medio con razonable corrección, útil para autocompletado en IDEs.
- Completado de texto en lote (batch): para tareas de reescritura, resumen o expansión de párrafos, donde se necesita producir bloques de texto completos de una sola vez, el modelo ofrece un throughput alto en comparación con la generación token a token.
- Evaluación de cuantizaciones FP4/FP8 en GPUs AMD: este modelo es un caso de estudio para medir el impacto de la cuantización de baja precisión en arquitecturas de difusión, ya que el autor documenta diferencias de rendimiento entre las variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de velocidad de decodificación y pasos de difusión para las cuatro variantes, obtenidas en una GPU Strix Halo con ROCm 7.2.4:

| Variante | Tamano | Pasos reales | Velocidad e2e |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 13.46 GiB | 21 | 26.03 t/s |
| Q6_0_ROCMFPX_AGENT | 21.82 GiB | 18 | 21.08 t/s |
| Q8_0_ROCMFPX | 24.32 GiB | 16 | 37.85 t/s |
| Q8_0_ROCMFPX_AGENT | 24.68 GiB | 15 | 41.18 t/s |

Con ajuste del scheduler (`--diffusion-eb-entropy-bound 0.8 --diffusion-eb-confidence 0.05`), el autor reporta hasta 53.56 t/s en la variante Q8_0, y 55.3 t/s con dos bloques de 512 tokens. No obstante, estos valores dependen del hardware y del software específicos, y no son comparables con benchmarks de calidad.

## Requisitos de hardware

- GPU: AMD RDNA 3.5, específicamente Strix Halo (gfx1151). No se garantiza compatibilidad con otras arquitecturas AMD ni con GPUs NVIDIA.
- VRAM estimada: entre 13.46 GiB (variante Q4_0) y 24.68 GiB (variante Q8_0), más overhead de activaciones y KV cache. Se recomienda al menos 16 GiB para la variante 4-bit y 32 GiB para la 8-bit.
- Software: build de llama.cpp con el fork ROCmFPX (los tipos FP4/FP8 no existen en mainline). Se debe usar `llama-diffusion-cli` o `llama-diffusion-gemma-server`, no `llama-server`.
- Sistema operativo: Linux con ROCm 7.2.4 (el autor verificó que HIP funciona sin dependencias de Vulkan).
- Latencia y throughput: la velocidad e2e varía entre 21 y 41 t/s según la variante, con pasos de denoising de entre 15 y 21. El coste por paso es de aproximadamente 400 ms en la GPU de referencia.
- Opciones de despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp; no es compatible con vLLM, Ollama ni TGI en sus versiones estándar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos. La única referencia disponible es el gemelo autoregressive del mismo autor (`kingjones777/Gemma-4-26B-A4B-it-ROCmFP4-GGUF`), que en la misma máquina alcanza 54.39 t/s sin drafter, frente a los 41.18 t/s del DiffusionGemma en su mejor variante. Esta comparación muestra que el modelo de difusión es más lento en respuestas cortas, pero puede superar al autoregressive en salidas largas gracias a la generación paralela. No se dispone de información sobre otros modelos de difusión (p. ej., LLaDA) para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Calidad dependiente del número de pasos: con 8 pasos el modelo produce salidas degeneradas (p. ej., `"list1111 ****"`), aunque las pruebas factuales cortas puedan pasar. Se recomienda un mínimo de 12 pasos para salidas completas.
- Coste fijo por generación: incluso una respuesta corta como `"Say hi"` requiere 9 pasos (~4 segundos), lo que hace al modelo ineficiente para diálogos breves.
- Artefactos de decodificación: las respuestas a veces se duplican (p. ej., `391391`) y el código largo puede cortarse a mitad del canvas cuando el scheduler se detiene. El autor indica que es comportamiento del decodificador, no daño de cuantización.
- Requisitos de software específicos: los tipos FP4/FP8 solo existen en el fork ROCmFPX de llama.cpp; usar un build estándar no cargará el modelo.
- Solo texto: no incluye soporte de visión ni de audio, a diferencia de otros modelos multimodales.
- Licencia Gemma: la licencia de Google impone restricciones de uso comercial y requiere aceptación de términos; no se detallan aquí, pero deben revisarse antes de desplegar en producción.
- Hardware limitado: el modelo está optimizado para gfx1151 (Strix Halo); en otras GPUs AMD puede degradarse el rendimiento o fallar la carga.
- Naturaleza experimental: DiffusionGemma es un modelo de investigación, no está diseñado para uso productivo sin validación exhaustiva.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/kingjones777/DiffusionGemma-26B-A4B-it-ROCmFP4-GGUF
- Modelo base (Google): https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Cuantización GGUF de unsloth: https://huggingface.co/unsloth/diffusiongemma-26B-A4B-it-GGUF
- Documentación oficial de DiffusionGemma (Google AI): https://ai.google.dev/gemma/docs/diffusiongemma
- Página del modelo en ModelScope: https://www.modelscope.cn/models/google/diffusiongemma-26B-A4B-it
- Página de DeepMind sobre DiffusionGemma: https://deepmind.google/models/gemma/diffusiongemma/
