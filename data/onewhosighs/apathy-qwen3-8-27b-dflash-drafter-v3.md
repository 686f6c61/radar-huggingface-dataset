# onewhosighs/Apathy-Qwen3.8-27B-DFlash-drafter-v3

## Resumen

Apathy-Qwen3.8-27B-DFlash-drafter-v3 es un modelo de borrador (draft model) de la familia DFlash, diseñado para acelerar la decodificación especulativa del modelo de lenguaje Qwen3.8-27B. Ha sido desarrollado por el usuario onewhosighs y publicado bajo licencia Apache-2.0. A diferencia de un modelo de lenguaje completo, este drafter no genera texto por sí mismo: propone secuencias de tokens que el modelo objetivo verifica y acepta o rechaza, reduciendo la latencia y aumentando el throughput de inferencia en entornos con recursos limitados.

El modelo tiene 6 capas, un tamaño oculto de 5.120 y un vocabulario de 248.320 tokens. Su arquitectura DFlashDraftModel está pensada para funcionar con el framework Atlas en un DGX Spark (GB10), donde alcanza velocidades de decodificación de aproximadamente 72 tokens por segundo en un benchmark específico. La relevancia actual radica en que permite explotar el modelo Qwen3.8-27B en hardware de gama alta como el GB10, un escenario común en despliegues locales y edge.

Aunque no es un modelo independiente, su papel como acelerador de inferencia es crítico para aplicaciones que requieren baja latencia y alto rendimiento, como asistentes conversacionales en tiempo real o sistemas de razonamiento complejo. El autor publica el artefacto con hashes de verificación y un benchmark reproducible, pero advierte que no se puede reproducir exactamente el entrenamiento y que el uso de NVFP4 para la caché de claves y valores puede alterar la salida en comparación con BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlashDraftModel |
| Parametros totales | 2.128.682.496 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo) |
| Tipos de cuantizacion | BF16 (pesos originales), NVFP4 (proyecciones densas al cargar con Atlas) |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un drafter de 6 capas con tamaño oculto 5.120, vocabulario de 248.320 tokens y un tamaño de bloque de 16. Según la configuración publicada, el máximo ancho de borrador (gamma) es 15, y las capas de captura del modelo objetivo están en las posiciones 1, 10, 18, 27, 35, 44, 52 y 61. Esta estructura permite que el drafter genere hasta 15 tokens especulativos por paso, que luego son verificados por el modelo objetivo.

No se han publicado detalles sobre el proceso de entrenamiento: el autor indica que no se conservó el estado del optimizador, ni el manifiesto de datos de entrenamiento, ni el corpus utilizado. Por tanto, no se puede afirmar nada sobre el dataset, la composición, ni si se aplicaron técnicas como RLHF o DPO. El único dato verificado es el artefacto de ejecución publicado (hashes de archivo, forma de tensores, carga exitosa en Atlas y el benchmark de decodificación).

## Capacidades

- Es un modelo de borrador para decodificación especulativa, no un modelo de lenguaje autónomo.
- Permite la generación de hasta 15 tokens especulativos por paso (gamma 15) que son verificados por el modelo objetivo.
- Compatible con el framework Atlas en un DGX Spark (GB10), donde se ha validado su funcionamiento.
- En el benchmark Weschera (prompt fijo MinHeap, 400 tokens de salida, temperatura 0, sin razonamiento) alcanza una velocidad de decodificación de 72,1689 tok/s con NVFP4 en la caché de claves y vocabulario completo.
- No dispone de tool calling, agentes, visión, audio ni otras capacidades propias, al ser un componente de aceleración.

## Casos de uso

- **Aceleración de inferencia en un DGX Spark**: el modelo se usa junto a Atlas para servir Qwen3.8-27B en un GB10, logrando un throughput de decodificación superior al de un modelo sin borrador. Es adecuado para entornos con una sola GPU de alta gama.
- **Reducción de latencia en asistentes conversacionales**: en sistemas de chat que requieren respuestas rápidas, el drafter permite generar tokens especulativos que el modelo objetivo valida, reduciendo el tiempo de espera percibido.
- **Optimización de costes en inferencia local**: al aumentar el throughput por GPU, se reduce el número de GPUs necesarias para servir un volumen de peticiones dado, lo que puede disminuir el coste de despliegue.
- **Sistemas de razonamiento con pensamiento desactivado**: en escenarios donde se desea una respuesta directa sin razonamiento intermedio, el drafter acelera la generación sin afectar la calidad, siempre que se utilice la configuración BF16 para la caché de claves.
- **Evaluación de rendimiento de decodificación especulativa**: sirve como referencia para probar la integración entre drafter y modelo objetivo en plataformas como GB10, permitiendo medir la repetibilidad del throughput (con coeficiente de variación inferior al 1% en el benchmark publicado).
- **Despliegue en sistemas embebidos con limitaciones de memoria**: al tener solo 2.1B parámetros, el drafter ocupa menos de 4.3 GB en BF16, lo que lo hace viable para sistemas con recursos limitados que ya ejecutan Qwen3.8-27B.

## Benchmarks y rendimiento

El autor publica un benchmark fijo (Weschera, prompt de MinHeap, 400 tokens de salida, temperatura 0, razonamiento desactivado) en un DGX Spark / GB10. Se midieron varias configuraciones:

| Configuración | Vocabulario | Repeticiones | Mediana decode tok/s |
|---|---|---|---|
| BF16 target KV | 96.000 | 5 | 61,7526 |
| NVFP4 target KV | 96.000 | 5 | 74,0882 |
| NVFP4 target KV | 248.320 (completo) | 5 | 72,1689 |

Además, se realizó una prueba de repetibilidad end-to-end con diez ejecuciones adicionales, obteniendo una mediana de 72,321 tok/s, media de 72,151 tok/s, desviación estándar de 0,712 tok/s y coeficiente de variación del 0,987%. El hash de salida fue estable en todas las ejecuciones. No hay comparaciones con otros modelos de borrador en la información disponible.

## Requisitos de hardware

- El modelo se ha validado en un DGX Spark (GB10) con Atlas. No hay datos de otros hardware.
- El tamaño del repositorio es de 4,3 GB en BF16, por lo que se estima que la VRAM necesaria para cargar el drafter es de al menos 8 GB, más la memoria del modelo objetivo.
- No se ha probado en GPUs de consumo como RTX 4090, aunque es plausible que pueda ejecutarse en GPUs con 16 GB o más, siempre que el modelo objetivo quepa.
- La opción de despliegue es mediante **Atlas** (el framework del autor), que se encarga de la carga y de la cuantización NVFP4 de las proyecciones del drafter.
- No se menciona compatibilidad con otros motores como llama.cpp o vLLM, ya que es un drafter específico para Atlas.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters comparables en la misma categoría (tamaño, arquitectura DFlash, etc.). La única referencia cercana es la versión anterior del mismo autor (v2), que no se detalla en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Es un modelo de borrador, no un modelo de lenguaje**: no se puede usar de forma autónoma; requiere un modelo objetivo que verifique cada token propuesto.
- **Falta de reproducibilidad del entrenamiento**: el autor no ha publicado el estado del optimizador, el corpus ni el manifiesto de entrenamiento, por lo que no se puede verificar cómo se entrenó.
- **Uso de NVFP4 en la caché de claves**: el benchmark con NVFP4 KV muestra un cambio en la salida respecto a BF16; no se garantiza equivalencia de calidad, y el autor recomienda usar BF16 para comportamiento de referencia.
- **El benchmark es un caso fijo**: el resultado de 72,1689 tok/s corresponde a un prompt concreto (MinHeap) y no certifica el rendimiento en otras tareas ni la finalización correcta de la tarea (todas las respuestas alcanzaron el límite de 400 tokens).
- **Sin garantías de calidad, seguridad o long-context**: el autor no infiere ninguna capacidad más allá de la velocidad de decodificación medida; no hay evidencia de que el modelo sea seguro o robusto en escenarios reales.
- **Licencia Apache-2.0**: permite uso comercial, pero se debe revisar la licencia del modelo objetivo Qwen3.8-27B (también Apache-2.0 según la información de HuggingFace).

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/onewhosighs/Apathy-Qwen3.8-27B-DFlash-drafter-v3)
- [Versión v2 del drafter](https://huggingface.co/onewhosighs/Apathy-Qwen3.8-27B-DFlash-drafter-v2)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [QwenCloud - Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [OpenLM - Qwen 3.8](https://openlm.ai/qwen3.8/)</think>## Resumen

Apathy-Qwen3.8-27B-DFlash-drafter-v3 es un modelo de borrador (draft model) de la familia DFlash, diseñado para acelerar la decodificación especulativa del modelo de lenguaje Qwen3.8-27B. Lo desarrolla el usuario onewhosighs y se publica bajo licencia Apache-2.0. A diferencia de un modelo de lenguaje completo, este drafter no genera texto por sí mismo: propone secuencias de tokens que el modelo objetivo (Qwen3.8-27B) verifica y acepta o rechaza, reduciendo la latencia y aumentando el throughput de inferencia en entornos con recursos limitados.

El modelo tiene 6 capas, un tamaño oculto de 5.120 y un vocabulario de 248.320 tokens. Su arquitectura DFlashDraftModel está pensada para funcionar con el framework Atlas en un DGX Spark (GB10), donde alcanza velocidades de decodificación de aproximadamente 72 tokens por segundo en un benchmark específico. La relevancia de este proyecto reside en que permite explotar el modelo Qwen3.8-27B en un hardware de gama media como el GB10, un escenario habitual en sistemas de inferencia local y en el borde.

Aunque no es un modelo independiente, su papel como acelerador de inferencia es clave para sistemas que requieren baja latencia y alto rendimiento, como asistentes conversacionales o aplicaciones de razonamiento en tiempo real. El autor publica el artefacto con hashes de verificación y un benchmark reproducible, pero advierte de que no se puede reconstruir el entrenamiento completo y que el uso de NVFP4 en la caché de claves puede alterar la salida respecto a BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlashDraftModel |
| Parametros totales | 2.128.682.496 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo) |
| Tipos de cuantizacion | BF16 (pesos originales), NVFP4 (proyecciones densas al cargar con Atlas) |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un drafter de 6 capas con un tamaño oculto de 5120, un vocabulario de 248.320 tokens y un tamaño de bloque de 16. Según la configuración publicada, el máximo ancho de borrador (gamma) es 15, y las capas de captura del modelo objetivo se encuentran en las posiciones 1, 10, 18, 27, 35, 44, 52 y 61. Esta arquitectura permite generar hasta 15 tokens especulativos por paso, que luego son verificados por el modelo objetivo.

No se han publicado detalles del proceso de entrenamiento: no se incluye el estado del optimizador, ni el corpus de entrenamiento ni el manifiesto de datos. El autor indica que no se puede reproducir el linaje de entrenamiento exacto, y que solo se verifica el artefacto de ejecución (hashes de archivos, tensores, carga con Atlas y el benchmark de decodificación). No hay información sobre técnicas de RLHF, DPO ni composición de datos.

## Capacidades

- Generación de borradores de hasta 15 tokens especulativos por paso para el modelo objetivo Qwen3.8-27B.
- Compatible con el framework Atlas en un DGX Spark (GB10), donde se ha validado su funcionamiento.
- En el benchmark Weschera (prompt fijo de MinHeap, 400 tokens de salida, temperatura 0, razonamiento desactivado) alcanza una velocidad de decodificación de 72,1689 tok/s con NVFP4 en la caché de claves y vocabulario completo.
- No tiene tool calling, agentes, visión, audio ni otras capacidades propias de un modelo de lenguaje completo.
- No genera texto autónomo; su única función es proponer tokens para la verificación del modelo objetivo.

## Casos de uso

- **Aceleración de inferencia en un DGX Spark**: el drafter se integra con Atlas para servir Qwen3.8-27B en un GB10, logrando un throughput de decodificación superior al del modelo sin borrador. Es adecuado para entornos con una sola GPU de gama media.
- **Reducción de latencia en asistentes conversacionales**: en sistemas que requieren respuestas rápidas, el drafter genera tokens especulativos que el modelo objetivo valida, disminuyendo el tiempo de espera percibido por el usuario.
- **Optimización de costes en despliegue**: al aumentar la velocidad por GPU, se reduce el número de GPUs necesarias para servir un mismo volumen de peticiones, lo que puede abaratar la infraestructura.
- **Sistemas de razonamiento sin pensamiento intermedio**: en escenarios donde se desea una respuesta directa sin razonamiento explícito, el drafter acelera la generación sin cambiar la calidad si se usa la caché de claves en BF16.
- **Evaluación de determinismo de salida**: el benchmark publicado muestra una salida estable (mismo hash SHA-256) en múltiples ejecuciones, lo que lo útil para validar la reproducibilidad de respuestas en un entorno controlado.
- **Desarrollo de sistemas de inferencia en hardware limitado**: con solo 2,1 millones de parámetros y menos de 4,3 GB de pesos, el drafter ocupa poco espacio y se puede desplegar junto al modelo objetivo en sistemas con recursos ajustados.

## Benchmarks y rendimiento

El autor publica un benchmark fijo sobre el prompt de MinHeap (Weschera) con 400 tokens de salida, temperatura 0 y razonamiento desactivado. Se midieron varias configuraciones en un DGX Spark (GB10):

| Configuracion | Vocabulario | Repeticiones | Mediana decode tok/s |
|---|---|---|---|
| BF16 target KV | 96.000 | 5 | 61,7526 |
| NVFP4 target KV | 96.000 | 5 | 74,0882 |
| NVFP4 target KV | 248.320 (completo) | 5 | 72,1689 |

Además, se realizó una prueba de repetibilidad end-to-end con diez ejecuciones adicionales: mediana 72,321 tok/s, media 72,151 tok/s, desviación estándar 0,712 tok/s y coeficiente de variación del 0,987%. La salida fue determinista (mismo hash SHA-256) en todas las ejecuciones. No hay comparaciones con otros modelos de borrador en la información disponible.

## Requisitos de hardware

- El modelo se ha validado únicamente en un **DGX Spark (GB10)** con el framework Atlas.
- El tamaño del repositorio es de 4,3 GB en BF16, por lo que se estima que el drafter necesita al menos 4 GB de VRAM, además de la memoria del modelo objetivo.
- No se ha probado en GPUs de consumo como RTX 4090, aunque podría ejecutarse en tarjetas con 16 GB o más si el modelo objetivo cabe.
- La opción de despliegue recomendada es **Atlas**, que se encarga de la carga y de cuantizar las proyecciones del drafter a NVFP4 en el perfil de velocidad.
- No se menciona compatibilidad con otros motores como llama.cpp o vLLM, ya que es una arquitectura específica para Atlas.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. La única referencia cercana es la versión v2 del mismo drafter (también de onewhosighs), pero no se han publicado datos comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Es un modelo de borrador, no un modelo de lenguaje**: no se puede usar de forma autónoma; requiere un modelo objetivo que verifique cada token propuesto.
- **Falta de reproducibilidad del entrenamiento**: no se publicó el estado del optimizador, el corpus ni el manifiesto de entrenamiento, por lo que no se puede auditar cómo se generó.
- **Uso de NVFP4 en la caché de claves**: el resultado con NVFP4 KV no es equivalente a BF16 en términos de salida, y el autor recomienda validar NVFP4 en cada carga de trabajo antes de usarlo en producción.
- **El benchmark es un caso fijo**: el resultado de 72,17 tok/s solo se aplica al prompt de MinHeap y no es representativo del rendimiento en otras tareas. Además, todas las respuestas alcanzaron el límite de 400 tokens, por lo que no se certifica la finalización correcta de la tarea.
- **Sin garantías de calidad, seguridad o long-context**: no se ha evaluado el modelo en escenarios de seguridad, sesgos, alucinaciones ni contextos largos. La licencia Apache-2.0 permite uso comercial, pero el autor no asume responsabilidad sobre el comportamiento del drafter.
- **Dependencia de Atlas**: el modelo solo funciona con el framework Atlas, lo que limita su portabilidad a otros motores de inferencia.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/onewhosighs/Apathy-Qwen3.6-27B-DFlash-drafter-v3)
- [Versión v2 del drafter](https://huggingface.co/onewhosighs/Apathy-Qwen3.6-27B-DFlash-drafter-v2)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [QwenCloud - Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [OpenLM - Qwen 3.8](https://openlm.ai/qwen3.8/)
