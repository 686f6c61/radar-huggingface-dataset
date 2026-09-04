# s0nh/byte-level-code-mtp-32-0.5B

## Resumen

El modelo `s0nh/byte-level-code-mtp-32-0.5B` (denominado por el autor como `milestone-0.5B`) es un modelo de lenguaje a nivel de bytes especializado en código fuente Python, desarrollado por el usuario s0nh. Se construye transfiriendo los pesos de `meta-llama/Llama-3.2-3B-Instruct` a un tokenizador de bytes de 265 identificadores, y entrenándolo desde el primer paso para predecir simultáneamente los próximos 1 a 32 bytes. Esto lo convierte en un modelo de predicción múltiple de tokens (MTP) diseñado para acelerar la generación mediante decodificación especulativa.

La arquitectura combina un tronco compartido de 27 bloques Llama con 32 cabezas de predicción independientes, cada una apuntando a un desplazamiento de bytes futuro. El modelo tiene 5.941.128.192 parámetros en total y una ventana de contexto de 4096 tokens de bytes. Su entrenamiento ha consumido 500.067.499 bytes de código Python del corpus `starcoderdata-python-edu`, utilizando una combinación de pérdidas de entropía cruzada, destilación entre tokenizadores y pérdida MTP.

Este checkpoint es relevante para investigadores y desarrolladores interesados en la generación eficiente de código, ya que ofrece una alternativa a nivel de byte que puede integrarse como modelo de borrador en pipelines de decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama-3.2-3B-Instruct transferido a tokenizador de bytes, con 32 cabezas MTP independientes |
| Parámetros totales | 5.941.128.192 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens de bytes |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Código Python (byte-level) |
| Licencia | Llama 3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de los bloques 0..27 y la norma final de `meta-llama/Llama-3.2-3B-Instruct`, que se reutilizan de forma verbatim. El embedding de entrada se construye mediante tokenkit con una transferencia de vocabulario (FVT) sobre el vocabulario Llama-3 «byteificado», con 257 coincidencias exactas de bytes/plantillas y 8 tokens especiales. El unembedding de bytes es una copia no atada de las mismas filas.

El modelo tiene 32 cabezas transformer independientes, sin atado de parámetros. Cada cabeza, desde la segunda hasta la 32, se inicializa como una copia profunda del bloque 27 preentrenado. Todas comparten la misma norma final y el mismo unembedding de bytes. Esto da un total de 5.941B parámetros: 2.718B en el tronco y 3.221B en las cabezas.

El entrenamiento se realiza con tres pérdidas combinadas desde el paso cero, con todos los parámetros actualizados en BF16 y pesos maestros en FP32: `L_sft` (entropía cruzada de siguiente byte), `L_alm` (destilación entre tokenizadores mediante Approximate Likelihood Matching del profesor subword congelado) y `L_mtp` (media de las pérdidas de las cabezas H2..H32). La agregación de gradientes usa `approx_gradmag_preserve_mag`, ponderando cada objetivo según su magnitud de gradiente medida en la salida del tronco. El optimizador es AdamW con lr 3e-05, warm-up de 500 pasos y decaimiento lineal hasta 7000 pasos. El hardware de entrenamiento fueron 4 NVIDIA B200 con FlashAttention-2.

Los datos provienen de `jon-tow/starcoderdata-python-edu`, filtrados por `int_score >= 3`, con cabeceras de línea eliminadas. El corpus filtrado contiene 5.319.139 archivos, 1.207.742 repositorios y 18.45 GB. El modelo ha consumido exactamente 500.067.499 bytes de código Python.

## Capacidades

- Generación de código Python a nivel de bytes, sin depender de un tokenizador subword.
- Predicción múltiple de tokens (MTP) con 32 cabezas que anticipan los próximos 1..32 bytes.
- Decodificación especulativa: las cabezas H2..H32 pueden generar borradores que el propio modelo verifica con su cabeza H1, reduciendo el número de pasos de decodificación.
- Destilación entre tokenizadores: el modelo ha aprendido a imitar el comportamiento del profesor subword, lo que mejora la calidad de las representaciones de bytes.
- El tokenizador incluye tokens de plantilla de Llama-3, pero la especialización en código puede degradar las capacidades de conversación generales.
- No incluye capacidades de visión, audio ni tool calling explícito.

## Casos de uso

- Autocompletado de código en entornos de desarrollo: el modelo puede predecir bloques completos de código Python a nivel de bytes, y su MTP permite generar varios bytes por paso de decodificación, lo que reduce la latencia percibida en editores.
- Modelo de borrador para decodificación especulativa: puede integrarse como modelo auxiliar que propone secuencias de bytes que un modelo más grande (por ejemplo, el propio Llama-3.2-3B-Instruct) verifica, acelerando la inferencia en pipelines de producción.
- Asistentes de programación en línea: gracias a su capacidad de generar código Python de forma fluida, puede usarse en chatbots que responden preguntas de programación, aunque su contexto de 4096 bytes limita diálogos muy largos.
- Análisis de código fuente: al operar directamente sobre bytes, puede procesar archivos sin preocuparse por el tokenizador, lo que facilita tareas de transformación y reparación de código.
- Educación en programación: puede generar ejemplos, explicaciones y ejercicios de código Python, dado su entrenamiento en un corpus educativo filtrado.
- Minería de repositorios: su capacidad para procesar grandes volúmenes de código Python lo hace útil para clasificar, resumir o extraer patrones de repositorios.

## Benchmarks y rendimiento

El autor ha publicado métricas de evaluación sobre repositorios de validación mantenidos fuera del entrenamiento, con ventanas de 4096 bytes. No se incluyen comparaciones con otros modelos en la información disponible.

| Cabeza | CE (nats) | Exactitud |
|---|---|---|
| H1 | 0.3881 | 0.8869 |
| H2 | 0.6864 | 0.8127 |
| H4 | 1.1844 | 0.6898 |
| H8 | 1.8044 | 0.5322 |
| H16 | 2.3820 | 0.3936 |
| H24 | 2.6829 | 0.3271 |
| H32 | 2.8759 | 0.2877 |

Además, se reportan métricas de aceptación especulativa corregida, donde las propuestas de H2..H32 se verifican con el argmax de H1 del propio modelo:

| Métrica | Valor |
|---|---|
| Tokens extra aceptados por ronda (media) | 7.9062 |
| Bytes extra aceptados por ronda (media) | 7.9336 |
| Bytes comprometidos por ronda (media) | 8.9336 |
| P(A ≥ 1) | 0.9023 |
| P(A ≥ 4) | 0.6250 |
| P(A ≥ 8) | 0.3555 |
| P(A ≥ 16) | 0.1641 |
| P(A ≥ 24) | 0.0742 |
| P(A ≥ 31) | 0.0430 |

El rendimiento H1 reporta 0.5564 bits por byte en contenido, y 2.2371 bits por token en tokens de contenido.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 12 GB (5.941B parámetros × 2 bytes). El repositorio tiene un tamaño de 83.2 GB, lo que sugiere que puede incluir pesos adicionales o múltiples réplicas, pero el modelo en sí requiere unos 12 GB en BF16.
- GPU recomendadas: una NVIDIA B200 (como en el entrenamiento) o GPUs con al menos 16 GB de VRAM, como una RTX 4090 o una A100 40GB, para inferencia sin cuantización.
- No se han publicado cuantizaciones (GGUF, etc.) en la información disponible.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM o llama.cpp si se convierte a GGUF. No hay información sobre soporte oficial de estos frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado benchmarks comparativos con otros modelos en la información disponible. El modelo se basa en `meta-llama/Llama-3.2-3B-Instruct` y se menciona como baseline `benjamin/Llama3-2-3B-IT-Byte`, pero no se proporcionan métricas de estos. La siguiente tabla compara características estructurales:

| Modelo | Parámetros | Contexto | Tokenizador | Propósito |
|---|---|---|---|---|
| `s0nh/byte-level-code-mtp-32-0.5B` | 5.941B | 4096 bytes | Byte (265 ids) | MTP + código Python |
| `meta-llama/Llama-3.2-3B-Instruct` | 3.2B | 128K tokens | Subword | Chat general |
| `benjamin/Llama3-2-3B-IT-Byte` | No disponible | No disponible | No disponible | Baseline byte-level |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en código Python; su rendimiento en otros lenguajes o textos en lenguaje natural probablemente sea pobre.
- La ventana de contexto es de 4096 bytes, no tokens, lo que limita la cantidad de código que puede procesar en una sola pasada. Un archivo de más de 4096 bytes quedará truncado.
- El entrenamiento se ha realizado sobre un corpus filtrado, por lo que puede heredar sesgos presentes en los repositorios de código, como la sobrerrepresentación de ciertos estilos o autores.
- No se han realizado evaluaciones de seguridad ni de alineación. El modelo puede generar código vulnerable o malicioso si se le solicita.
- La licencia Llama 3.2 impone restricciones de uso comercial y redistribución que deben revisarse antes de desplegar el modelo en producción.
- El modelo requiere código personalizado (`trust_remote_code=True`) y no está integrado en el repositorio estándar de transformers, lo que puede complicar su uso en entornos con políticas de seguridad estrictas.
- El tamaño del repositorio (83.2 GB) es notablemente mayor que lo que sugerirían los parámetros totales, lo que puede indicar la presencia de pesos adicionales o artefactos de entrenamiento que deberían comprobarse antes de la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s0nh/byte-level-code-mtp-32-0.5B
- Perfil del autor: https://huggingface.co/s0nh
