# QuaduxIT/Qwen3.6-35B-A3B-QD-GGUF

## Resumen
QuaduxIT publica una serie de archivos GGUF del modelo Qwen3.6-35B-A3B cuantizados mediante un método propio denominado QD (Quadux Dynamic Quantization). El modelo base, desarrollado por Alibaba, es un MoE híbrido con 35,5 mil millones de parámetros totales y aproximadamente 3 mil millones activos, con atención híbrida para un contexto de hasta 256.000 tokens. La propuesta de QuaduxIT es una cuantización por tensor basada en sensibilidad medida, en lugar de una escalera de reglas fijas, optimizada mediante un algoritmo de mochila para ajustarse a presupuestos de memoria concretos.

La relevancia de este repositorio radica en que ofrece una alternativa auditable y reproducible a los Dynamic GGUFs de unsloth, publicando los mapas de tipos por tensor y los resultados de divergencia KL (KLD) medidos frente al modelo en BF16. Incluye además la cabeza MTP (Multi-Token Prediction) y el proyector de visión, lo que permite desplegar capacidades multimodales y decodificación especulativa en llama.cpp. Está pensado para cubrir tarjetas de 12 a 32 GB de VRAM, con siete escalones publicados y una comparación honesta de dónde su método pierde frente a unsloth.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida; 256 expertos (8 enrutados + 1 compartido) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B (activados por token) |
| Longitud de contexto | 256.000 tokens (256k) |
| Tipos de cuantizacion | QD-Q5_K-32G (26,50 GB), QD-Q4_K_XL (22,85 GB), QD-Q4_K-24G (19,49 GB), QD-IQ4_XS (18,20 GB), QD-Q3_K_XL (17,22 GB), QD-Q2_K-16G (12,00 GB), QD-IQ2-12G (10,60 GB) |
| Idiomas soportados | Inglés (en), alemán (de), multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo base Qwen3.6-35B-A3B emplea una arquitectura de MoE (Mixture de Experts) con 256 expertos, de los cuales 8 son enrutados y 1 compartido, activando aproximadamente 3 mil millones de parámetros por token. Su atención es híbrida, combinando mecanismos lineales y softmax para lograr la ventana de 256k tokens con un coste de KV reducido. La cuantización QD (Quadux Dynamic) se construye a partir de un proceso de cinco etapas: (1) se crean cuantizaciones uniformes de referencia (Q2_K…Q8_0, IQ2…IQ4), (2) se calcula una matriz de error relativo ponderada por imatrix con estadísticas de activación por experto para tensores MoE, (3) se calibra el proxy contra sondas de clase medidas (forzando una clase de tensor a Q2_K y midiendo la divergencia KL real contra logits BF16), (4) se optimiza el mapa de tipos por tensor mediante un algoritmo de mochila para ajustarse a un presupuesto exacto de bytes, y (5) se verifica con un barrido de gradiente medido, conservando solo los movimientos rentables.

El repositorio utiliza la imatrix publicada por unsloth (Apache-2.0) para el modelo, pero los mapas de tipos, las mediciones y el pipeline son propios. La cabeza MTP (bloque `blk.40`) se incluye en todos los archivos, y los tensores que el pipeline no puede evaluar se copian de las decisiones de unsloth en el mismo rango de tamaño. La calibración está optimizada para el punto de trabajo Q3-Q4; por encima de Q5, la resolución del proxy no es suficiente para mejorar las asignaciones de unsloth.

## Capacidades
- Generación de texto conversacional en inglés y alemán, con soporte multilingüe.
- Procesamiento de imágenes (image-text-to-text) mediante el proyector de visión incluido (`mmproj-F16.gguf`), que permite entrada visual junto con texto.
- Decodificación especulativa (MTP) incluida en el modelo, lo que permite acelerar la inferencia en llama.cpp mediante predicción de múltiples tokens.
- Clasificación de texto y extracción de entidades, validada en pruebas de spam y traducción legal con alta precisión.
- Razonamiento multi-turno y generación de respuestas conversacionales.
- Soporte de `endpoints_compatible`, lo que facilita su integración en APIs compatibles con OpenAI (vía llama.cpp).

## Casos de uso
- Despliegue local en tarjetas de consumo (12–32 GB): con los escalones de 10,6 GB a 26,5 GB, un desarrollador puede elegir el archivo que mejor se ajuste a su VRAM. Por ejemplo, `QD-IQ2-12G` (10,6 GB) cabe en una RTX 3060 de 12 GB, mientras que `QD-Q5_K-32G` (26,5 GB) deja margen para contexto 2x256k y visión en una RTX 4090 de 32 GB.
- Asistencia conversacional multilingüe: el modelo gestiona conversaciones de varios turnos en inglés y alemán, con contexto largo de 256k, adecuado para chatbots que requieran historial extenso.
- Procesamiento de documentos con imágenes: gracias al proyector de visión, puede analizar capturas, gráficos o documentos escaneados, por ejemplo para extraer datos de formularios o facturas.
- Clasificación automática de correo electrónico: la model card reporta 10/10 aciertos en clasificación de spam en alemán sin falsos positivos, útil para sistemas de filtrado de correo.
- Traducción técnica y legal: la prueba de traducción jurídica alemana alcanzó 12/12 marcadores de terminología correctos, indicando robustez en dominios con vocabulario especializado.
- Inferencia de baja latencia en producción: la inclusión de la cabeza MTP permite decodificación especulativa, reduciendo el tiempo de generación en entornos de alta demanda.

## Benchmarks y rendimiento
La model card no incluye benchmarks clásicos como MMLU, HumanEval o GSM8K. En su lugar, se publican mediciones de divergencia KL (KLD) frente a logits BF16 para los distintos escalones de cuantización, junto con pruebas de tareas específicas. Los valores de KLD son los siguientes:

| Archivo | Tamaño | KLD en | KLD de |
|---|---|---|---|
| QD-Q5_K-32G | 26,50 GB | 0,00908 | 0,00953 |
| QD-Q4_K_XL | 22,85 GB | 0,01217 | 0,01250 |
| QD-Q4_K-24G | 19,49 GB | 0,02176 | 0,02451 |
| QD-IQ4_XS | 18,20 GB | 0,02847 | 0,03139 |
| QD-Q3_K_XL | 17,22 GB | 0,03768 | 0,04028 |
| QD-Q2_K-16G | 12,00 GB | 0,11999 | 0,14627 |
| QD-IQ2-12G | 10,60 GB | 0,18093 | 0,20235 |

En tareas específicas, el modelo `QD-Q4_K_XL` obtuvo 10/10 en clasificación de spam en alemán (sin falsos positivos) y 12/12 en marcadores de terminología en traducción legal alemana. El throughput de prefill se indica en la model card como "259 a" (dato truncado, sin unidades especificadas). No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: según el archivo elegido, entre 10,6 GB (para `QD-IQ2-12G`) y 26,5 GB (para `QD-Q5_K-32G`). Se necesita VRAM adicional para contexto largo o visión.
- GPU recomendadas: para el escalón de 10,6 GB se puede usar una RTX 3060 de 12 GB; para los de 17–22 GB, una RTX 4090 de 24 GB o A6000; para el de 26,5 GB, una RTX 4090 de 32 GB o A40.
- Compatibilidad con tarjetas de consumo: sí, todos los archivos están diseñados para caber en tarjetas de 12 a 32 GB, siendo el de 12 GB el mínimo viable.
- Opciones de despliegue: llama.cpp (soporte nativo para GGUF), Ollama, vLLM (gracias a la compatibilidad de endpoints) y cualquier servidor compatible con GGUF.
- Latencia y throughput: la model card reporta un prefill de 259 (unidades no especificadas), pero no se proporciona un análisis completo de latencia en el repositorio.

## Comparativa con modelos similares
La principal comparativa es contra los GGUFs dinámicos de unsloth (`unsloth/Qwen3.6-35B-A3B-MTP-GGUF`). QuaduxIT publica tablas de comparación en KLD para los mismos presupuestos de tamaño:

| Tamaño de presupuesto | QD (en / de) | UD unsloth (en / de) | Recomendación |
|---|---|---|---|
| Q2_K_XL (12,57 GB) | 0,10744 / 0,13339 | **0,10463 / 0,12559** | Usar unsloth |
| Q4_K_XL (22,85 GB) | **0,01217 / 0,01250** | 0,01236 / 0,01279 | Usar QD |
| Q4_K-24G (19,49 GB) | **0,02176 / 0,02451** | 0,03022 / 0,03348 | Usar QD |
| Q5_K_XL (27,16 GB) | 0,00813 / 0,00759 | **0,00774 / 0,00695** | Usar unsloth |
| Q6_K_XL (32,61 GB) | 0,00672 / 0,00641 | **0,00605 / 0,00476** | Usar unsloth |

En la mayoría de los rangos Q3-Q4, QD supera a unsloth en KLD, mientras que en Q5, Q6 y Q2_K_XL unsloth mantiene ventaja. También existen otras cuantizaciones GGUF del mismo modelo base, como `baa-ai/Qwen3.6-35B-A3B-RAM-26GB-GGUF` o `DuoNeural/Qwen3.6-35B-A3B-Code-imatrix-GGUF`, aunque no se dispone de sus métricas comparativas en la información disponible.

## Limitaciones y advertencias
- El repositorio es muy reciente (creado el 2026-08-26) y no tiene descargas ni "me gusta" aún; se recomienda validar su rendimiento en un entorno propio antes de usarlo en producción.
- La calibración QD está optimizada para el rango Q3-Q4. En niveles Q5 y superiores, la calidad por byte es inferior a la de unsloth, y el autor recomienda explícitamente usar los archivos de unsloth para esos tamaños.
- El archivo `QD-Q5_K-32G` es una excepción: aunque su calidad pura (KLD 0,00908) es peor que la de unsloth (0,00774), se ofrece porque deja espacio para contexto 2x256k y visión en una tarjeta de 32 GB.
- No se proporcionan resultados de benchmarks generales (MMLU, GSM8K, HumanEval) para estos archivos; las únicas métricas son KLD y pruebas específicas de tarea.
- El soporte de visión requiere el archivo `mmproj-F16.gguf` incluido en el repo, y debe configurarse correctamente en llama.cpp para activar la entrada de imágenes.
- El modelo base tiene una licencia Apache-2.0, permisiva para uso comercial, pero la cuantización QD es un trabajo derivado; se recomienda revisar las condiciones de unsloth sobre el uso de su imatrix, aunque se distribuye también bajo Apache-2.0.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/QuaduxIT/Qwen3.6-35B-A3B-QD-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Comparativa unsloth (archivos recomendados en rangos Q5/Q6): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Guía de despliegue local (llama.cpp, VRAM y API): https://knightli.com/en/2026/05/24/qwen36-35b-a3b-local-deployment-llamacpp-gguf/
- Repo de cuantización alternativa (baa-ai): https://huggingface.co/baa-ai/Qwen3.6-35B-A3B-RAM-26GB-GGUF
- Repo de cuantización alternativa (DuoNeural): https://huggingface.co/DuoNeural/Qwen3.6-35B-A3B-Code-imatrix-GGUF
