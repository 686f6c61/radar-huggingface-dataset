# EasiiX/Qwen3.8-Flash-Next-MTP-Strix-Halo-GGUF

## Resumen

Este repositorio contiene el **MTP draft head** (cabeza de predicción multi-token) del modelo **Qwen3.8-Flash-Next**, exportado como un sidecar independiente en formato GGUF para su uso con decodificación especulativa en llama.cpp. El autor, EasiiX, ha preparado este archivo porque los pesos del MTP vienen incluidos en el checkpoint oficial de Qwen pero se eliminan en las conversiones GGUF habituales, lo que impide aprovechar la aceleración por predicción de múltiples tokens.

El sidecar está específicamente afinado para **AMD Strix Halo** (APU Ryzen AI MAX+ 395, gfx1151), donde se han medido mejoras de hasta un +50% en velocidad de decodificación para código (de 23,5 a 35,7 t/s con una tasa de aceptación del 85%) y un +49% incluso a 156K tokens de profundidad de contexto. La decodificación especulativa es **lossless a temperatura 0**, por lo que no degrada la calidad del texto generado.

El modelo base, Qwen3.8-Flash-Next, es un modelo MoE multimodal de 125B parámetros (según fuentes externas) basado en la arquitectura Qwen4, con una ventana de contexto de 262K tokens. Este sidecar no es un modelo autónomo, sino un componente auxiliar que requiere el modelo base cuantizado y una versión específica de llama.cpp con soporte para el draft head qwen4exp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP draft head (multi-token prediction) del modelo Qwen3.8-Flash-Next (Qwen4) |
| Parametros totales | 3.878.549.248 (3,8B) |
| Parametros activos | No aplica (no es un modelo MoE, es un sidecar) |
| Longitud de contexto | No aplica directamente; depende del modelo base (262K tokens segun fuentes externas) |
| Tipos de cuantizacion | Q8_0 (recomendado); tambien disponible BF16 (generable via script) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (sidecar para llama.cpp) |

## Arquitectura y entrenamiento

El MTP draft head es un componente del modelo Qwen3.8-Flash-Next que se entrena conjuntamente con el modelo principal para predecir varios tokens futuros de forma simultánea. En lugar de predecir un solo token, la cabeza MTP genera una secuencia de tokens candidatos que luego el modelo principal verifica y acepta o rechaza, reduciendo el número de pasos de decodificación necesarios.

Este sidecar contiene únicamente los tensores del MTP, extraídos del checkpoint oficial y convertidos a GGUF. El autor recomienda la cuantización Q8_0 porque, según sus mediciones, ofrece un mejor rendimiento que BF16: al reducir el tamaño de las lecturas del draft y alinear los errores de cuantización con los del modelo base, se consigue una mayor tasa de aceptación. El modelo base utiliza una arquitectura híbrida GDN + QSA (según el repositorio oficial de Qwen), con atención dispersa y optimizaciones de memoria, pero los detalles específicos del entrenamiento del MTP no se han publicado en la información disponible.

## Capacidades

- **Decodificación especulativa**: genera múltiples tokens candidatos por paso, acelerando la inferencia del modelo base sin pérdida de calidad a temperatura 0.
- **Compatibilidad con llama.cpp**: requiere un build con soporte para el draft head qwen4exp (rama EngramHalo.cpp).
- **Optimización para AMD Strix Halo**: kernels específicos para la iGPU gfx1151, con mejoras de rendimiento medidas en hardware real.
- **Soporte de contexto largo**: mantiene la aceleración incluso a 156K tokens de profundidad, lo que lo hace útil para tareas con ventanas extensas.
- **Configuración ajustable**: permite controlar el número máximo de tokens de draft (`--spec-draft-n-max`) y un umbral de confianza (`--spec-draft-p-min`) para evitar rechazos en prosa de baja aceptación.
- **Generación de código**: especialmente eficaz en tareas de programación, donde la tasa de aceptación alcanza el 85%.

## Casos de uso

- **Inferencia local en AMD Strix Halo**: el caso principal. En un Ryzen AI MAX+ 395 con 75GB de memoria unificada, se puede ejecutar el modelo base cuantizado junto con este sidecar para obtener velocidades de decodificación cercanas a las de una GPU dedicada, sin necesidad de VRAM adicional.
- **Asistente de programación en local**: la alta tasa de aceptación en código (85%) hace que la generación de funciones, autocompletado y refactorización sean notablemente más rápidos, ideal para entornos de desarrollo sin conexión.
- **Procesamiento de documentos largos**: con soporte de contexto de 262K tokens en el modelo base, el sidecar permite acelerar el resumen o análisis de contratos, informes o libros completos sin perder velocidad a medida que se profundiza en el contexto.
- **Chat conversacional de baja latencia**: en aplicaciones de atención al cliente o asistentes personales, la decodificación especulativa reduce la latencia percibida, mejorando la fluidez de la interacción.
- **Despliegue en servidores con CPU+iGPU**: al no requerir GPU dedicada, se puede montar en estaciones de trabajo o mini-PCs con APU AMD, reduciendo costes de hardware.
- **Investigación en decodificación especulativa**: este repositorio sirve como referencia para estudiar el impacto del MTP en diferentes arquitecturas y cuantizaciones, ya que incluye el script de conversión y las instrucciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este sidecar, ya que no es un modelo de lenguaje completo sino un componente de aceleración. Los únicos datos de rendimiento disponibles son las mediciones del autor en AMD Strix Halo:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion en codigo (sin MTP) | 23,5 t/s |
| Velocidad de decodificacion en codigo (con MTP) | 35,7 t/s |
| Mejora relativa | +50% |
| Tasa de aceptacion de drafts (codigo) | ~85% |
| Mejora a 156K tokens de contexto | +49% |
| Perdida de calidad | Ninguna (lossless a temperatura 0) |

Estas cifras se obtuvieron con el modelo base cuantizado a UD-IQ3_XXS y el sidecar en Q8_0, con temperatura 0 y los parámetros de configuración recomendados.

## Requisitos de hardware

- **GPU/APU recomendada**: AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151) con memoria unificada. El autor ha validado el rendimiento en este hardware específico.
- **Memoria**: se requieren al menos 75GB de RAM/unified memory para ejecutar el modelo base completo (según unsloth). El sidecar MTP ocupa 4,1 GB adicionales.
- **VRAM**: no se necesita VRAM dedicada; la iGPU de la APU accede a la memoria unificada.
- **Software**: llama.cpp con la rama EngramHalo.cpp (incluye parches de kernel para Strix Halo y soporte para el draft head qwen4exp). También se puede usar el build estándar si se incorporan los PR #27739 y #27742.
- **Opciones de despliegue**: servidor llama.cpp (`llama-server`) con los flags `-md` para especificar el sidecar y `--spec-type draft-mtp,ngram-mod` para activar la decodificación especulativa.
- **Latencia y throughput**: los valores medidos (35,7 t/s en código) son orientativos y dependen de la cuantización del modelo base, la longitud del contexto y la configuración de drafts.

## Comparativa con modelos similares

No hay comparables directos en el mercado, ya que este repositorio es un sidecar MTP específico para un modelo concreto. Existen otros trabajos comunitarios de MTP GGUF (como el de dzannotti), pero no se dispone de datos de rendimiento comparativos. En cuanto al modelo base, Qwen3.8-Flash-Next compite con otros modelos MoE multimodales de gran tamaño, pero la comparativa no es relevante para este sidecar.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere el modelo base Qwen3.8-Flash-Next cuantizado y una versión específica de llama.cpp. Sin ellos, el sidecar no tiene utilidad.
- **Dependencia de hardware**: las mejoras de rendimiento se han medido únicamente en AMD Strix Halo. En otras plataformas (NVIDIA, Apple Silicon) el comportamiento puede variar significativamente.
- **Configuración delicada**: el umbral de confianza (`--spec-draft-p-min`) es crítico. Sin él, la decodificación especulativa puede ser más lenta que la normal en textos de baja aceptación (prosa, diálogos).
- **Licencia restrictiva**: la Qwen Community License 1.0 incluye una cláusula Model-as-a-Service que limita el uso comercial del modelo a través de APIs. Hay que revisar el texto completo de la licencia antes de desplegar en producción.
- **Riesgo de alucinación**: al ser un componente del modelo base, hereda sus posibles sesgos y tendencia a alucinar. No hay datos específicos sobre este sidecar.
- **Soporte limitado**: la rama EngramHalo.cpp es un proyecto comunitario; no hay garantía de mantenimiento a largo plazo ni de compatibilidad con versiones futuras de llama.cpp.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EasiiX/Qwen3.8-Flash-Next-MTP-Strix-Halo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Rama EngramHalo.cpp (build con soporte MTP y parches Strix Halo): https://github.com/Aristo94/EngramHalo.cpp
- PR llama.cpp #27739 (diseño del draft head): https://github.com/ggml-org/llama.cpp/pull/27739
- PR llama.cpp #27742 (soporte qwen4exp): https://github.com/ggml-org/llama.cpp/pull/27742
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
