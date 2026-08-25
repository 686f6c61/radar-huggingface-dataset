# agentionai/Qwen3.8-27B-DFlash2-ROCmFP4-FAST-GGUF

## Resumen

Este repositorio contiene una cuantización ROCmFP4 (4.25 bpw) del modelo draft `z-lab/Qwen3.8-27B-DFlash2`, diseñado exclusivamente como sidecar para decodificación especulativa junto al modelo principal Qwen3.8-27B. El autor, agentionai, lo publica bajo licencia Apache-2.0 con el objetivo de acelerar la inferencia en hardware AMD, específicamente en APUs Strix Halo (Radeon 8060S). Según las mediciones del autor, combinado con el target `julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF`, alcanza 65.6 t/s en salida estructurada, lo que supone un factor de aceleración de 4.7x respecto a la decodificación directa.

El modelo tiene aproximadamente 1.9 mil millones de parámetros (1.924.404.480 según los safetensors originales) y usa una arquitectura DFlash2, optimizada para servir como borrador en esquemas de decodificación especulativa. No es un modelo autónomo: carece de grafo completo y falla al cargarse de forma independiente. Su relevancia radica en que permite aprovechar al máximo el hardware AMD de gama media-alta para ejecutar modelos de 27B con baja latencia, un caso de uso cada vez más demandado en entornos locales y de edge computing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (draft model para decodificación especulativa) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el comando de ejemplo usa 32768 tokens) |
| Tipos de cuantizacion | ROCmFP4 (4.25 bpw), tipo GGUF 103 (Q4_0_ROCMFP4_FAST) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una requantización del draft model `z-lab/Qwen3.8-27B-DFlash2`, que a su vez es un modelo ligero (~1.9B) diseñado para predecir tokens que luego verifica el modelo principal Qwen3.8-27B. La arquitectura DFlash2 no está documentada en detalle en la información disponible, pero se infiere que es un transformer optimizado para inferencia rápida, probablemente con atención flash y mecanismos de decodificación especulativa integrados. El entrenamiento original del draft model no se detalla; solo se indica que el modelo base es de z-lab y que la cuantización ROCmFP4 es obra de agentionai.

La innovación principal de esta versión es el uso del formato ROCmFP4, un tipo de cuantización de 4 bits por peso (4.25 bpw) que reduce el tamaño del modelo a aproximadamente 1 GB, permitiendo que quepa en la memoria unificada de APUs como Strix Halo. Además, el archivo GGUF tipo 103 (`Q4_0_ROCMFP4_FAST`) solo es compatible con un fork específico de llama.cpp que incluye soporte para los tipos ROCmFPx. El autor advierte que no se debe requantizar a `Q8_0_ROCMFPX` esperando paridad con `Q8_0`, ya que la escala de bloque en FP4 es un byte UE4M3, lo que degrada la tasa de aceptación a 53.5% frente al 60.2% del original.

## Capacidades

- Funciona exclusivamente como modelo borrador (draft) en decodificación especulativa, junto a un modelo target (Qwen3.8-27B).
- Acelera la generación de texto estructurado (JSON, código, etc.) y prosa, manteniendo la calidad del target porque cada token es verificado por el modelo principal.
- Soporta decodificación adaptativa mediante `--spec-draft-adaptive`, que ajusta dinámicamente el número de tokens borrador según la tasa de aceptación medida.
- Requiere un fork de llama.cpp con soporte para tipos ROCmFPx; no carga en la versión estándar de llama.cpp.
- Compatible con Vulkan 1.3, probado en Mesa RADV 26.0.8 sobre gfx1151 (AMD Strix Halo).
- No es un modelo autónomo: no tiene grafo completo y falla al cargarse solo con `failed to create context`.

## Casos de uso

- **Aceleración de inferencia en AMD Strix Halo**: el caso principal es ejecutar Qwen3.8-27B en APUs como Ryzen AI Max+ 395, donde la decodificación especulativa con este draft model multiplica por 4.7 la velocidad en salida estructurada (de 14.0 a 65.6 t/s).
- **Despliegue local de asistentes conversacionales**: en entornos sin GPU dedicada, este sidecar permite reducir la latencia de respuestas en aplicaciones de chat, manteniendo la calidad del modelo de 27B.
- **Generación de código y JSON en producción**: la salida estructurada se beneficia especialmente de la decodificación especulativa, logrando 65.6 t/s, lo que lo hace viable para pipelines de generación de código o extracción de datos.
- **Prototipado de agentes con baja latencia**: en frameworks de agentes que requieren múltiples llamadas al modelo, la reducción de latencia por token permite ciclos de razonamiento más rápidos.
- **Evaluación de modelos en hardware AMD**: sirve como referencia para medir el rendimiento de la cuantización ROCmFP4 y la decodificación adaptativa en GPUs de la serie Radeon.
- **Integración en entornos con memoria unificada**: al ocupar solo ~1 GB, el draft model puede residir junto al target en la memoria compartida de APUs, sin necesidad de VRAM dedicada adicional.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones de rendimiento en un AMD Strix Halo (Radeon 8060S) con el target `julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF`, usando greedy decoding y 300 tokens:

| Configuración | Salida estructurada (t/s) | Prosa (t/s) |
|---|---|---|
| Decodificación directa (bare decode) | 14.0 | 14.1 |
| Draft fijo n=3 | 41.6 | 25.4 |
| Draft fijo n=7 | 20.2 | 24.8 |
| **Draft adaptativo (n_min 3, n_max 7)** | **65.6 (4.7x)** | **26.1** |

No se publican benchmarks de calidad (MMLU, HumanEval, etc.) porque este modelo no genera contenido por sí mismo; la calidad la determina el modelo target. La tasa de aceptación del draft adaptativo se reporta en 96%, frente al 18% con n fijo de 7.

## Requisitos de hardware

- **GPU/APU**: probado en AMD Strix Halo (Radeon 8060S, gfx1151). Debería funcionar en cualquier hardware donde compile el fork de llama.cpp con soporte ROCmFPx, pero los números de rendimiento son específicos de Strix Halo.
- **VRAM**: el archivo GGUF del draft model ocupa aproximadamente 1 GB (tamaño del repo). El modelo target (Qwen3.8-27B ROCmFP4) ocupa 13.55 GiB. En APUs con memoria unificada, ambos caben en la RAM del sistema.
- **Driver**: Vulkan 1.3, probado con Mesa RADV 26.0.8.
- **Software**: fork de llama.cpp de LaurentZuijdwijk (https://github.com/LaurentZuijdwijk/llama.cpp/releases) o cualquier build con tipos ROCmFPx. La versión estándar de llama.cpp no carga este archivo (tipo GGUF 103).
- **Opciones de despliegue**: llama-server con los flags `-md` para el draft model y `--spec-type draft-dflash`. No es compatible con vLLM, Ollama u otros runners sin soporte para ROCmFPx.
- **Latencia/throughput**: 65.6 t/s en salida estructurada y 26.1 t/s en prosa con decodificación adaptativa, medidos en el hardware mencionado.

## Comparativa con modelos similares

No hay muchos draft models comparables en el ecosistema de decodificación especulativa. La comparación más relevante es con el draft model original sin cuantizar (`z-lab/Qwen3.8-27B-DFlash2`) y con otras cuantizaciones del mismo modelo:

| Modelo | Tamaño | Cuantización | Tasa de aceptación | Notas |
|---|---|---|---|---|
| z-lab/Qwen3.8-27B-DFlash2 (original) | ~1.9B | FP16 (presumible) | 60.2% (a 8 bpw) | Modelo base, sin cuantizar |
| agentionai/Qwen3.8-27B-DFlash2-ROCmFP4-FAST | ~1.9B | ROCmFP4 (4.25 bpw) | 96% (adaptativo) | Este modelo, optimizado para Strix Halo |
| Requantización a Q8_0_ROCMFPX | ~1.9B | ROCmFP8 (8 bpw) | 53.5% | Desaconsejada por el autor, peor que Q8_0 estándar |

No se dispone de datos de otros draft models para la misma familia de modelos.

## Limitaciones y advertencias

- **No es un modelo autónomo**: cargarlo solo produce el error `failed to create context`. Debe usarse siempre con `-md` junto al modelo target.
- **Incompatibilidad con llama.cpp estándar**: el tipo GGUF 103 (`Q4_0_ROCMFP4_FAST`) no se carga en la versión oficial; se requiere un fork específico.
- **Dependencia de hardware AMD**: el rendimiento medido es exclusivo de Strix Halo; en otras GPUs con Vulkan puede funcionar, pero no se garantizan las mismas velocidades.
- **Riesgo de degradación de aceptación**: la cuantización FP4 puede reducir la tasa de aceptación del draft, especialmente si se usa con n fijo alto. El modo adaptativo es esencial para mantener el rendimiento.
- **No se debe requantizar a Q8_0_ROCMFPX**: el autor advierte que a 8 bits por peso, la escala de bloque UE4M3 degrada la aceptación frente a Q8_0 estándar (53.5% vs 60.2%).
- **Sin datos de sesgos o alucinaciones**: al ser un modelo auxiliar, no se evalúan sesgos; la responsabilidad recae en el modelo target.
- **Licencia**: Apache-2.0, heredada del modelo base, permite uso comercial, pero el fork de llama.cpp puede tener sus propias restricciones.

## Enlaces

- [Repositorio HuggingFace de este modelo](https://huggingface.co/agentionai/Qwen3.8-27B-DFlash2-ROCmFP4-FAST-GGUF)
- [Modelo base z-lab/Qwen3.8-27B-DFlash2](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)
- [Target model julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF](https://huggingface.co/julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF)
- [Fork de llama.cpp con soporte ROCmFPx](https://github.com/LaurentZuijdwijk/llama.cpp/releases)
- [Proyecto ROCmFPX (formatos FPx)](https://github.com/ciru-ai/ROCmFPX)
- [PR #27342 de llama.cpp para DFlash2](https://github.com/ggml-org/llama.cpp)
- [Guía de hardware para Qwen3.8-27B](https://www.contextstudios.ai/blog/qwen-3-8-27b-hardware-guide)
- [Repositorio de despliegue en Strix Halo (julianmb)](https://github.com/julianmb/q38rocm)
