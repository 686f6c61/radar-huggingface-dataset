# Ishowbackup/Gemma-4-E4B-it-qat-MXFP4-CRACK

## Resumen

Este modelo es una variante "abliterada" (CRACK) del Gemma 4 E4B it de Google DeepMind, publicada por el usuario Ishowbackup en el contexto del proyecto dealign.ai. Su objetivo es eliminar el comportamiento de rechazo del modelo original (refusals) manteniendo en lo posible sus capacidades generales, de razonamiento y multimodales. Se distribuye cuantizado en MXFP4 (4 bits) y en formato MLX nativo, pensado para ejecución en Apple Silicon.

La relevancia de esta publicación radica en dos frentes: por un lado, demuestra que es posible eliminar la alineación por rechazo de un modelo multimodal de última generación con una pérdida mínima de rendimiento (MMLU pasa de 70,6% a 66,7%, un descenso del 3,9%); por otro, plantea interrogantes sobre la seguridad de los modelos open weights y la generalización de la seguridad. El modelo base Gemma 4 E4B es un modelo multimodal (texto, imagen y audio) con arquitectura densa de aproximadamente 4.000 millones de parámetros efectivos, aunque los pesos reales en safetensors suman 2.210.886.986 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense + Hybrid Sliding/Global Attention, per-layer input embeddings |
| Parametros totales | 2.210.886.986 (~2,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (4-bit) |
| Idiomas soportados | No disponible (el Gemma 4 base es multilingüe, pero esta variante no especifica) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors (MLX-native) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, un modelo multimodal de Google DeepMind con arquitectura densa que combina atención global y deslizante (hybrid sliding/global attention) e incorpora embeddings de entrada por capa (per-layer input embeddings), una característica distintiva de la familia Gemma 4. La variante CRACK aplica un proceso de abliteración (refusal removal) sobre el modelo base, modificando los pesos para eliminar el rechazo ante instrucciones dañinas. Según la model card, el proceso mantiene la coherencia del modelo: verificación de QA factual, razonamiento multi-step y generación de código funcional.

La cuantización MXFP4 reduce los pesos a 4 bits, y el formato MLX-native permite una carga instantánea en el ecosistema MLX de Apple. El modelo requiere vMLX (una extensión con soporte completo para Gemma 4), ya que las herramientas estándar `mlx_lm` / `mlx_vlm` no lo soportan completamente. No se proporcionan detalles sobre el dataset de entrenamiento del proceso de abliteración ni sobre el método exacto (probablemente basado en la técnica de "abliteration" publicada por otros proyectos como mlx-community).

## Capacidades

- Generación de texto conversacional y asistencia general.
- Razonamiento multi-step y channel-based thinking (modo de razonamiento interno antes de responder).
- Multimodal: procesamiento de imágenes (vision, con paso float16) y audio.
- Generación de código funcional (verificado según la model card).
- Sin rechazo: cumple el 100% de las categorías de daño de HarmBench (240/240), es decir, no se niega a responder a instrucciones dañinas.
- Multilingüe (heredado del modelo base Gemma 4, aunque no se especifican idiomas concretos).
- No se menciona soporte de tool calling / function calling.

## Casos de uso

- Investigacion en seguridad de IA: permite estudiar el comportamiento de modelos sin alineación por rechazo, analizando cómo responden a instrucciones dañinas y qué mecanismos internos subyacen a la seguridad.
- Asistentes conversacionales sin restricciones (entornos de investigación): útil para probar límites de generación de contenido en entornos controlados, sin las limitaciones de los modelos alineados.
- Generacion de codigo en entornos de desarrollo: el modelo mantiene capacidades de generación de código funcional, por lo que puede emplearse como asistente de programación local en Macs Apple Silicon.
- Analisis multimodal de imagenes y audio: gracias a su soporte de visión y audio, puede procesar capturas de pantalla, diagramas o grabaciones de voz en tareas de análisis técnico.
- Razonamiento multi-step en tareas complejas: su channel-based thinking lo hace adecuado para problemas que requieren encadenar varios pasos de razonamiento antes de dar una respuesta.
- Evaluacion comparativa de tecnicas de abliteracion: sirve como referencia para comparar el equilibrio entre eliminación de rechazo y retención de capacidades frente a otros modelos abliterados.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, medidos en el entorno de generación (el modelo razona antes de responder, como en despliegue):

| Benchmark | Base | CRACK | Delta |
|---|---|---|---|
| MMLU | 70,6% | 66,7% | -3,9% |

HarmBench (text set completo de 320 prompts, categorías de daño):

| Categoria | Compliance |
|---|---|
| Actividades ilegales | 53/53 (100%) |
| Quimico / biologico | 42/42 (100%) |
| Ciberdelincuencia / intrusion | 52/52 (100%) |
| Desinformacion | 54/54 (100%) |
| Acoso / bullying | 21/21 (100%) |
| Contenido danino | 18/18 (100%) |
| **Total** | **240/240 (100%)** |

El modelo base rechaza prácticamente todas las solicitudes dañinas (~0% de compliance). No se han publicado resultados en otros benchmarks como HumanEval, GSM8K o TruthfulQA.

## Requisitos de hardware

- Apple Silicon Mac con memoria unificada suficiente (el modelo pesa ~5,5 GB en MXFP4, más overhead de runtime).
- Requiere vMLX (https://vmlx.net) con soporte para Gemma 4; las herramientas estándar `mlx_lm` / `mlx_vlm` no son compatibles.
- No se especifican requisitos mínimos de RAM, pero un Mac con 16 GB de memoria unificada debería ser suficiente para inferencia local.
- No hay datos de latencia ni throughput publicados.
- No se menciona soporte para GPU NVIDIA o AMD; el formato MLX limita el despliegue al ecosistema Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-e4b-it (base) | ~4B efectivos (2,2B reales) | No disponible | 70,6% | Gemma | Hugging Face |
| Ishowbackup/Gemma-4-E4B-it-qat-MXFP4-CRACK (este) | ~2,2B reales | No disponible | 66,7% | Gemma | Hugging Face |
| Gemma 4 E4B JANG_4M CRACK (misma familia) | ~4B efectivos | No disponible | No publicado | Gemma | Hugging Face (referenciado) |

No se dispone de datos de otros modelos abliterados de la misma categoría (por ejemplo, variantes de Llama o Qwen abliteradas) para una comparación directa.

## Limitaciones y advertencias

- Modelo abliterado: genera contenido potencialmente dañino sin rechazo. Su uso debe limitarse a investigación en seguridad de IA, bajo estrictos controles éticos y legales.
- Sesgos: no se han evaluado sesgos de género, raza o religión; el proceso de abliteración puede alterar el comportamiento en estos aspectos.
- Riesgo de alucinacion: no hay datos específicos, pero la reducción del 3,9% en MMLU sugiere una ligera pérdida de conocimiento factual.
- Longitud de contexto: no especificada; se desconoce el límite real de tokens de entrada.
- Compatibilidad: requiere vMLX, no funciona con herramientas estándar de MLX ni con otros runtimes (vLLM, llama.cpp, Ollama).
- Licencia Gemma: sujeta a los términos de uso de Google para la familia Gemma; el uso comercial puede estar restringido (consultar la política de la licencia).
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente y sin validación comunitaria.
- No se proporcionan datos sobre el proceso de entrenamiento de la abliteración (dataset, método exacto, épocas), lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ishowbackup/Gemma-4-E4B-it-qat-MXFP4-CRACK
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- vMLX (runtime requerido): https://vmlx.net
- Proyecto dealign.ai: https://dealign.ai
- Ko-fi de dealignai: https://ko-fi.com/dealignai
- X (Twitter) de dealignai: https://x.com/dealignai
- Guía de Gemma 4 (descarga y comparativa): https://gemma4.org/
- Guía de descarga de Gemma 4 (formatos): https://gemma4all.com/blog/gemma-4-download
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
