# grant-ai/Qwen3.8-27B-Abliterated-MTPLX

## Resumen

El modelo `grant-ai/Qwen3.8-27B-Abliterated-MTPLX` es una conversión a MTPLX del checkpoint `Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16`, que a su vez es una versión "abliterated" (eliminación de comportamientos de rechazo a nivel de pesos) del modelo Qwen3.8-27B de Alibaba. El resultado es un modelo multimodal (visión y lenguaje) optimizado para ejecutarse en Apple Silicon mediante el motor MTPLX, con soporte nativo de decodificación especulativa multi-token (MTP) y torre de visión verificada.

El modelo está pensado exclusivamente para investigación experimental en seguridad de IA, red-teaming, alineación e interpretabilidad. Su principal valor técnico reside en que la abliteración funciona tanto con el razonamiento activado como desactivado, y que la conversión MTPLX conserva la velocidad y la funcionalidad de visión que otras conversiones suelen perder. Con 262 144 tokens de contexto y una cuantización de 8 bits en el cuerpo principal, ofrece un rendimiento de hasta 75,79 tokens por segundo en contexto corto sobre un Mac Studio M3 Ultra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + lenguaje) |
| Parametros totales | 27B (denominación del modelo; safetensors reporta 8 027 131 120) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 |
| Tipos de cuantizacion | Cuerpo principal en 8 bits, sidecar MTP y torre de visión en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MTPLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso nativo multimodal de Alibaba, diseñado para tareas de codificación, agentes y automatización de oficina. Esta variante no se entrena desde cero: parte de los pesos BF16 abliterados por Blackfrost-AI y los convierte al formato MTPLX siguiendo la receta de Youssofal. La abliteración es una edición de pesos a nivel de tensor que elimina el comportamiento de rechazo sin modificar el tamaño ni la precisión de los tensores, por lo que no introduce coste adicional de velocidad.

La conversión incluye un sidecar MTP (multi-token prediction) de profundidad 3 con muestreo de rechazo exacto, que proporciona una aceleración de 3,42× respecto a la decodificación autorregresiva. La torre de visión se conserva íntegramente en BF16 y se verifica su funcionamiento de extremo a extremo, algo que otras conversiones del mismo modelo suelen perder. El cuerpo principal se cuantiza a 8 bits con grupo 64 y afín, con una divergencia KL de 0,00105 frente al BF16 original.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activable o desactivable.
- Comprensión de imágenes (pipeline image-text-to-text), con torre de visión verificada.
- Decodificación especulativa multi-token (MTP) con profundidad 3, que acelera la generación hasta 3,42× frente a la decodificación autorregresiva.
- Contexto largo de 262 144 tokens, adecuado para tareas agénticas con historiales extensos.
- Comportamiento de rechazo eliminado a nivel de pesos, tanto con razonamiento activado como desactivado.
- Compatible con el motor MTPLX 2.7.1 en Apple Silicon.

## Casos de uso

- Red-teaming de modelos de lenguaje: permite probar la robustez de los mecanismos de seguridad y medir tasas de rechazo ante instrucciones dañinas, gracias a que la abliteración está confirmada a nivel de pesos.
- Investigación en alineación y seguridad de IA: estudiar cómo responde un modelo sin capas de rechazo ante entradas adversarias, con razonamiento on/off.
- Interpretabilidad de mecanismos internos: analizar qué representaciones internas codifican el rechazo y cómo la edición de pesos lo elimina.
- Evaluación de decodificación especulativa: sirve como banco de pruebas para medir la aceleración MTP en hardware Apple Silicon, comparando con la versión stock.
- Investigación en cuantización: validar el impacto de la cuantización de 8 bits en la calidad de generación y en la preservación de la torre de visión.
- Desarrollo de métodos de jailbreak y mitigación: al carecer de rechazos, permite aislar el efecto de los prompts de sistema y de las plantillas de conversación en el comportamiento del modelo.

## Benchmarks y rendimiento

La model card proporciona datos de rendimiento medidos en un Mac Studio M3 Ultra (80-core GPU, 256 GB unificados) con MTPLX 2.7.1, comparando esta versión abliterada con la versión stock (`Optimized-Quality`) que usa la misma receta de conversión.

**Throughput de decodificación (tok/s), mayor es mejor**

| Profundidad | Abliterated-MTPLX | Stock (Optimized-Quality) | Δ |
|---|---:|---:|---:|
| AR (autorregresivo) | 22,17 | 22,21 | −0,1% |
| 1 | 44,94 | 39,71 | +13,2% |
| 2 | 62,33 | 60,22 | +3,5% |
| 3 | 75,79 | 65,69 | +15,4% |
| Mejor ×AR | 3,42× | 2,96× | |

**Tiempo de pared (s), menor es mejor**

| Profundidad | Abliterated-MTPLX | Stock (Optimized-Quality) | Δ |
|---|---:|---:|---:|
| AR | 23,67 | 23,65 | −0,1% |
| 1 | 11,98 | 13,48 | +11,1% |
| 2 | 8,80 | 9,09 | +3,1% |
| 3 | 7,34 | 8,38 | +12,4% |

**Tasas de rechazo** (evaluadas sobre el conjunto completo `mlabonne/harmful_behaviors`, n=520, juzgadas por Claude Sonnet 4.6):

| Modo | 1 intento | 3 intentos | Con persona de Blackfrost |
|---|---|---:|---:|---:|
| Razonamiento activado (esfuerzo alto) | 8,7% | 4,2% | 1,7% |
| Razonamiento desactivado | 29,4% | 10,4% | 3,8% |

En contexto agéntico de 24k tokens, el modelo alcanza 39,30 tok/s con razonamiento alto. No se han publicado resultados de benchmarks estándar de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 28 GB en disco; pico de memoria unificada de ~33 GB.
- Memoria recomendada: 36 GB de memoria unificada como mínimo.
- Hardware objetivo: exclusivamente Apple Silicon (M-series) con soporte MTPLX.
- GPU concretas: verificado en Mac Studio M3 Ultra con 80-core GPU; no se garantiza funcionamiento en GPUs NVIDIA o AMD.
- Opciones de despliegue: motor MTPLX 2.7.1; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 75,79 tok/s en contexto corto con razonamiento desactivado; 39,30 tok/s en contexto largo (24k) con razonamiento alto.

## Comparativa con modelos similares

La comparativa más directa es contra la versión stock del mismo modelo convertida con la misma receta, ya que el único cambio son los pesos abliterados. También puede compararse con el checkpoint BF16 original de Blackfrost-AI.

| Modelo | Parámetros | Contexto | Cuantización | Velocidad (depth 3) | Licencia |
|---|---|---|---:|---:|---:|---|
| Abliterated-MTPLX (este) | 27B | 262 144 | 8-bit + BF16 sidecar | 75,79 tok/s | Apache-2.0 |
| Optimized-Quality (stock) | 27B | 262 144 | 8-bit + BF16 sidecar | 65,69 tok/s | Apache-2.0 |
| Qwen3.8-27B-ABLITERATED-BF16 | 27B | 262 144 | BF16 | No disponible | Apache-2.0 |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, otros Qwen3.8-27B cuantizados) en la información proporcionada.

## Limitaciones y advertencias

- El modelo carece de comportamientos de rechazo a nivel de pesos: asumirá cualquier instrucción, incluidas las dañinas. Está destinado exclusivamente a investigación de seguridad y red-teaming.
- No debe exponerse como endpoint público ni desplegarse para usuarios no confiables; debe ejecutarse localmente en hardware controlado.
- El uso para fines ilegales está explícitamente prohibido en cualquier jurisdicción.
- Solo funciona en Apple Silicon con MTPLX; no es portable a otros entornos de inferencia.
- Los datos de rendimiento se midieron en un hardware específico (M3 Ultra, 256 GB); en configuraciones con menos memoria o menor ancho de banda los resultados pueden variar.
- No se han publicado benchmarks de calidad estándar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar su rendimiento académico con otros modelos.
- El número de parámetros reportado por safetensors (8 027 131 120) difiere de la denominación de 27B; esto puede deberse a la estructura de archivos de la conversión, pero no se ha aclarado oficialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grant-ai/Qwen3.8-27B-Abliterated-MTPLX
- Checkpoint base (Blackfrost-AI): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Motor MTPLX: https://github.com/youssofal/MTPLX
- Modelos MTPLX de Youssofal: https://huggingface.co/Youssofal
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
