# feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo-abliterated-Starlight

## Resumen

Qwen3.8-Flash-Next iq3_xxs_turbo (abliterated) para Starlight es una cuantización de un modelo de lenguaje de tipo mezcla de expertos (MoE) derivada de Qwen/Qwen3.8-Flash-Next, publicada por el usuario feverdoingwork. El modelo base declara 48 capas, 512 expertos por capa y 10 expertos activados por token, con un total de 179.023.047.808 parámetros según los metadatos de safetensors. Esta variante concreta se distribuye como un único archivo GGUF de 54,68 GiB (58.714.961.760 bytes) con extensiones propietarias del motor de inferencia Starlight, e incorpora una versión "abliterated" que elimina la dirección de rechazo en tiempo de ejecución.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de cuantización agresiva (expertos enrutados a 2,125 bits por peso mediante codificación trellis) que reduce el peso de los expertos de 40,0 GiB a 29,9 GiB, liberando unos 10 GiB de memoria. Por otro, ilustra una técnica de modificación de comportamiento (abliteration) implementada sin alterar los pesos: un único tensor F32 de 2.560 números que el motor aplica sobre las proyecciones que escriben en el flujo residual.

El modelo no es un checkpoint estándar de Transformers ni está pensado para llama.cpp, Ollama o LM Studio. Está diseñado exclusivamente para el motor Starlight y su licencia es la Qwen Community License 1.0, con implicaciones comerciales que conviene revisar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer híbrido: 48 capas principales, 512 expertos por capa, 10 expertos activos por token; 36 capas de atención lineal (state-space) y 12 capas de atención completa |
| Parametros totales | 179.023.047.808 |
| Parametros activos | no disponible (el autor indica 10 expertos usados por token, sin desglose de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con expertos enrutados en TQ2_T (2,125 bits por peso); variantes de la familia iq3_s_turbo, iq3_xxs_turbo e iq3_xxs_turbo_mini; caché de atención q4 empleada en las pruebas |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `license: other` en Hugging Face) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`), no compatible con safetensors ni Transformers |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con 48 capas principales, 512 expertos por capa y 10 expertos activos por token. El modelo combina dos tipos de capas: 36 capas de atención lineal con salida de tipo state-space y 12 capas de atención completa. Esta hibridación busca reducir el coste computacional de la atención en secuencias largas manteniendo capacidad de modelado global en un subconjunto de capas. El archivo incluye además una cabeza de borrador para predicción multi-token (MTP), utilizada para decodificación especulativa, y un vocabulario podado a 141.312 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO. La model card solo describe el proceso de cuantización y abliteración, no el preentrenamiento. La innovación técnica destacable de esta publicación es la codificación trellis aplicada a los expertos enrutados, que sustituye los expertos originales de 2,84 bits por peso por expertos de 2,125 bits, con una pérdida de calidad medida de KLD 0,310 frente a BF16 y un top-1 del 83,56 % (frente a 0,257 y 84,08 % de la variante iq3_s_turbo). La abliteración se implementa mediante un tensor `starlight.ablate_r` de 2.560 números F32 que el motor lee al cargar y resta en tiempo de ejecución de las 144 matrices que escriben en el flujo residual: las proyecciones down de expertos y expertos compartidos de las 48 capas principales (48 + 48), la salida state-space de las 36 capas de atención lineal y la salida de atención de las 12 capas de atención completa.

## Capacidades

- Generación de texto conversacional y continuaciones de prosa, con una divergencia media de KL de 0,0076 respecto al archivo no abliterado en un texto de prueba de 7,6k tokens.
- Razonamiento aritmético, lógica, búsqueda de valores plantados, seguimiento de instrucciones y recuerdo memorístico de texto y hechos cortos: la batería graduada del autor (218 generaciones) obtuvo 178 aciertos tanto en el archivo plano como en este.
- Generación de código: incluida en la batería graduada evaluada por el proyecto Starlight.
- Decodificación especulativa mediante la cabeza MTP integrada en el archivo, con una tasa de aceptación del borrador del 77,0 % (frente al 77,9 % del archivo plano).
- Comportamiento sin rechazos: la prueba de rechazo pasó de 8 de 20 generaciones respondidas en el archivo plano a 20 de 20 en este archivo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; el archivo contiene únicamente modelo de texto, cabeza MTP, vocabulario podado y tensor de abliteración.

## Casos de uso

- Investigación sobre abliteración y control de comportamiento: el archivo permite comparar directamente el modelo con y sin la dirección de rechazo aplicada, ya que los pesos son idénticos byte a byte y solo difiere el tensor `starlight.ablate_r`. Es adecuado para estudiar cómo afecta la eliminación de una dirección a la distribución de salida, con métricas de KL y top-1 ya publicadas.
- Evaluación de cuantización extrema en MoE: con expertos a 2,125 bits por peso y un KLD de 0,310 frente a BF16, sirve para medir el impacto real de la codificación trellis en tareas de razonamiento y código frente a la variante iq3_s_turbo (KLD 0,257).
- Despliegue en una única GPU de 16 GB: el archivo fue ejecutado en una AMD RX 9070 XT y su gemelo plano en una NVIDIA RTX 5070 Ti, lo que lo hace útil para entornos con VRAM limitada donde un MoE de 179.000 millones de parámetros sería inasumible en precisión completa.
- Generación de texto creativo y conversacional sin restricciones de estilo: la divergencia respecto al archivo plano aparece a una mediana de 125 caracteres en prompts abiertos, lo que permite usarlo en tareas donde se busca variación de redacción manteniendo la competencia medida en la batería graduada.
- Decodificación especulativa con MTP en producción: la cabeza de borrador integrada y su 77,0 % de aceptación permiten acelerar la generación en el motor Starlight sin infraestructura adicional, con una velocidad de decodificación reportada de 120,1 tokens por segundo en la RX 9070 XT.
- Pruebas de regresión de motores de inferencia: dado que el autor verificó que 139 generaciones greedy y 119 muestreadas coinciden token a token con el archivo plano iniciado con `STARLIGHT_FN_ABLATE`, el archivo sirve como referencia para validar implementaciones del motor Starlight.
- Investigación sobre robustez de rechazos en modelos alineados: la prueba de rechazo (20 de 20 respuestas frente a 8 de 20) permite estudiar la eficacia de la eliminación de la dirección de rechazo sin reentrenar.

## Benchmarks y rendimiento

| Prueba | Archivo plano | Este archivo |
|---|---:|---:|
| Prueba de rechazo, prompts respondidos (10 prompts, greedy y muestreado = 20 generaciones) | 8 de 20 | 20 de 20 |
| Batería graduada: aritmética, búsqueda de valores plantados, código, seguimiento de instrucciones, lógica, recuerdo de texto y hechos cortos (218 generaciones), aciertos | 178 | 178 |
| Prompts abiertos, greedy (20): mismo texto que el archivo plano hasta el final | — | 1 de 20 (divergencia a una mediana de 125 caracteres) |
| Divergencia KL media respecto al archivo plano, texto de prueba de 7,6k tokens | — | 0,0076 |
| Mismo token top-1 que el archivo plano, mismo texto | — | 98,57 % |
| Pérdida frente al archivo plano en texto de prosa de 32k tokens, emparejada | — | −0,0006 ± 0,0022 nats por token |
| Velocidad de decodificación, mediana de tokens por segundo reportada por el servidor | 122,0 | 120,1 |
| Aceptación del borrador MTP | 77,9 % | 77,0 % |

| Variante | Tamano total | Expertos enrutados | Tabla de tokens por capa | Lado GPU | KLD a BF16 / top-1 |
|---|---:|---:|---:|---:|---:|
| `iq3_s_turbo` | 64,78 GiB | 39,98 GiB (2,84 bits) | 20,30 GiB | 44,47 GiB | 0,257 / 84,08 % |
| `iq3_xxs_turbo` | 54,68 GiB | 29,88 GiB (2,12 bits) | 20,30 GiB | 34,38 GiB | 0,310 / 83,56 % |
| `iq3_xxs_turbo_mini` | 50,03 GiB | 29,88 GiB (2,12 bits) | 15,65 GiB | 34,38 GiB | 0,318 / 83,78 % |

En una primera prueba comparativa (RX 9070 XT, 2 de noviembre de 2026, build temprana del motor), `iq3_xxs_turbo` decodificó a 56,4 tokens por segundo frente a 59,6 de `iq3_s_turbo`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo ocupa 54,68 GiB en disco, de los cuales 34,38 GiB corresponden al lado GPU (archivo menos la tabla de tokens por capa de 20,30 GiB). El autor lo ejecutó en una tarjeta de 16 GB, lo que implica gestión de memoria fuera de la GPU para parte de los pesos.
- GPU recomendadas: AMD RX 9070 XT (probado con este archivo); NVIDIA RTX 5070 Ti (probado con el gemelo plano). El motor NVIDIA tiene la misma proyección en su código fuente, pero este archivo no se ha ejecutado en una tarjeta NVIDIA.
- Cabe en GPU de consumo: sí, con una tarjeta de 16 GB según la prueba del autor, aunque el desglose de qué parte reside en GPU y cuál en memoria del sistema no se detalla.
- Opciones de despliegue: exclusivamente el motor Starlight. No es compatible con llama.cpp, Ollama, LM Studio, Transformers ni TGI, y el autor indica que otros programas no están soportados ni probados.
- Latencia y throughput: 120,1 tokens por segundo de mediana en la RX 9070 XT con MTP activado y caché de atención q4; 56,4 tokens por segundo en la build temprana del 2 de noviembre de 2026 para la variante `iq3_xxs_turbo`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este archivo (iq3_xxs_turbo abliterated) | 179.023.047.808 totales, 10 expertos activos por token | no disponible | GGUF con extensiones Starlight | Qwen Community License 1.0 | Solo motor Starlight |
| `iq3_xxs_turbo` (gemelo plano) | mismos parámetros | no disponible | GGUF con extensiones Starlight | Qwen Community License 1.0 | Solo motor Starlight |
| `iq3_s_turbo` | mismos parámetros | no disponible | GGUF con extensiones Starlight | Qwen Community License 1.0 | Solo motor Starlight |
| `iq3_xxs_turbo_mini` | mismos parámetros | no disponible | GGUF con extensiones Starlight | Qwen Community License 1.0 | Solo motor Starlight |

Las tres variantes comparten arquitectura y número de parámetros; difieren en el tamaño de los expertos enrutados, la tabla de tokens por capa y la calidad medida (KLD a BF16 entre 0,257 y 0,318). No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo solo funciona con el motor Starlight. No es un checkpoint de Transformers ni safetensors, y no está soportado en llama.cpp, Ollama, LM Studio ni otros programas.
- Licencia: Qwen Community License 1.0, etiquetada como `license: other`. Es imprescindible revisar los términos de uso comercial antes de desplegarlo en producción.
- Abliteración: la eliminación de la dirección de rechazo puede aumentar la probabilidad de generar contenido que el modelo base rechazaría. No hay evaluación de seguridad publicada para esta variante.
- Divergencia respecto al modelo plano: solo 1 de 20 prompts abiertos greedy produjo el mismo texto hasta el final, con divergencia a una mediana de 125 caracteres. Los textos no son idénticos aunque la competencia medida sea equivalente.
- Pérdida de calidad por cuantización: KLD de 0,310 frente a BF16 y top-1 del 83,56 %, peor que la variante iq3_s_turbo (0,257 y 84,08 %). El autor señala que cambios que solo alteran el redondeo ya producen un KL de 0,005 a 0,006 en este motor, por lo que parte de la divergencia es inherente al enrutamiento entre 512 expertos.
- Cobertura de pruebas limitada: la batería graduada cubre 218 generaciones y no incluye benchmarks estándar como MMLU, HumanEval o GSM8K. No se han publicado resultados en estos conjuntos.
- Pruebas solo en AMD: este archivo se ejecutó únicamente en la RX 9070 XT. El motor NVIDIA contiene la misma proyección en su código, pero el archivo no se ha probado en tarjetas NVIDIA.
- Idiomas, contexto y tool calling: no disponibles en la información proporcionada, lo que impide garantizar su comportamiento en aplicaciones multilingües, de contexto largo o con llamadas a herramientas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo-abliterated-Starlight
- Gemelo plano: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base cuantizado: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
