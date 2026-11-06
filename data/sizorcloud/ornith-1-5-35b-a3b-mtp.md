# SizorCloud/Ornith-1.5-35B-A3B-MTP

## Resumen

Ornith-1.5-35B-A3B-MTP es un repositorio de pesos en formato GGUF publicado por SizorCloud que contiene exclusivamente el bloque de predicción multi-token (MTP, *multi-token prediction*) del modelo Qwen3.6-35B-A3B, extraído del fichero `UD-Q6_K_XL` de Unsloth. No se trata de un modelo completo, sino de una cabeza de borrador (*draft head*) de 844.640.768 parámetros diseñada para habilitar decodificación especulativa sobre el fine-tune Ornith-1.5-35B-A3B, cuyos propios tensores MTP no están entrenados (normas fijadas a 1.0).

El problema que resuelve es concreto: las conversiones GGUF de Ornith-1.5-35B-A3B se publican sin el bloque MTP, y el bloque presente en el checkpoint original acepta 0 de 22 borradores (0 %) según las mediciones del autor. Al sustituirlo por el bloque entrenado de Qwen3.6-35B-A3B, la tasa de aceptación sube a 30 de 38 (79 %) y la velocidad de decodificación pasa de 23,9 a 45,3 tok/s en una RTX 3090 con 24 GB, contexto de 4K y `--mtp 2`.

Es relevante ahora porque permite recuperar el rendimiento de decodificación especulativa en despliegues locales de Ornith sin reentrenar ni reconvertir el modelo base: la cabeza se carga como fichero externo en motores que soportan un bloque MTP separado (por ejemplo, `--mtp-gguf` en Strata). Los pesos subyacentes son de Qwen3.6-35B-A3B (Apache-2.0), tomados del release GGUF de Unsloth; este repositorio es solo una extracción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque MTP (*multi-token prediction*) de un transformer MoE; 20 tensores `blk.40.*`, block_count 41, nextn_predict_layers 1 |
| Parametros totales | 844.640.768 (0,84 B; solo la cabeza MTP, no el modelo completo) |
| Parametros activos | no disponible (corresponde al modelo base Qwen3.6-35B-A3B, no especificado) |
| Longitud de contexto | no disponible (probado a 4K en las mediciones del autor) |
| Tipos de cuantizacion | Q8_0 y Q6_K en expertos MTP enrutados; F32 en normas (tipos originales del fichero fuente) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`mtp-Qwen3.6-35B-A3B-Q8_0.gguf`, 767.933.856 bytes, SHA-256 `fa23ced0120ca5c024bc0340b8ef72ce9ba07f740221cefed1dc1bf62d0f6785`) |

## Arquitectura y entrenamiento

El fichero contiene el bloque MTP de Qwen3.6-35B-A3B, un módulo de predicción multi-token asociado a un transformer con mezcla de expertos (MoE). Estructuralmente ocupa el bloque 40 (`blk.40.*`) de un total de 41 bloques, con `nextn_predict_layers` igual a 1, y consta de 20 tensores: expertos enrutados del MTP en Q8_0/Q6_K y tensores de normalización en F32, conservando los tipos del fichero de origen.

No se ha entrenado ni ajustado nada en este repositorio: el bloque se copia byte a byte desde `Qwen3.6-35B-A3B-UD-Q6_K_XL.gguf` del release de Unsloth. La innovación técnica relevante es la propia decodificación especulativa: el bloque MTP propone tokens candidatos que el modelo principal verifica, de modo que el texto generado es idéntico al que produciría el modelo sin borrador (la verificación solo acepta lo que el modelo escribiría por sí mismo). La diferencia frente al bloque nativo de Ornith es que este sí está entrenado (normas en torno a 0,4 / 3,1 frente a 1,0 uniforme), lo que eleva la tasa de aceptación de borradores del 0 % al 79 % en las pruebas del autor. No se dispone de datos sobre volumen de entrenamiento, composición del dataset ni uso de RLHF/DPO para el bloque original.

## Capacidades

- Suministra borradores de tokens para decodificación especulativa sobre Ornith-1.5-35B-A3B, acelerando la generación sin alterar el texto resultante.
- Tasa de aceptación medida de 30 de 38 borradores (79 %) en RTX 3090, 4K de contexto, temperatura 0 y `--mtp 2`.
- Incremento de velocidad de decodificación de 23,9 a 45,3 tok/s en el mismo entorno (factor aproximado de 1,9x).
- Compatible con motores que aceptan un bloque MTP externo mediante `--mtp-gguf` (Strata con motor qwen35 en compilación local; la versión upstream 0.2.x solo lee el MTP del propio fichero del modelo).
- No aporta capacidades generativas propias: no genera texto, código ni razonamiento de forma autónoma; depende del modelo base.
- No incluye soporte de tool calling, agentes, visión, audio ni modo de razonamiento por sí mismo; esas capacidades, si existen, residen en Ornith-1.5-35B-A3B.
- Idiomas soportados: no disponible.

## Casos de uso

- Aceleración de inferencia local de Ornith-1.5-35B-A3B: cargar este fichero como cabeza MTP externa en Strata con `--mtp-gguf` para casi duplicar la velocidad de decodificación en una RTX 3090, manteniendo el texto idéntico.
- Despliegue en estaciones de trabajo con GPU de 24 GB: permite servir el modelo con decodificación especulativa funcional sin necesidad de reentrenar ni reconvertir el GGUF base, que se publica sin bloque MTP.
- Evaluación comparativa de cabezas de borrador: sirve como referencia entrenada frente al bloque nativo de Ornith (0 % de aceptación) para medir el impacto real de la decodificación especulativa en latencia percibida.
- Pipelines de generación por lotes con latencia ajustada: en tareas de resumen, extracción o clasificación de documentos donde el coste dominante es la decodificación token a token, el incremento de throughput reduce el tiempo total de proceso.
- Reproducción de resultados: el SHA-256 y el origen exacto (fichero `UD-Q6_K_XL` de Unsloth) permiten verificar la integridad y replicar las mediciones del autor en otros equipos.
- Integración en herramientas de serving basadas en llama.cpp que soporten MTP externo: útil para equipos que ya tienen un motor GGUF y quieren habilitar especulación sin cambiar de runtime ni de pesos principales.

## Benchmarks y rendimiento

| Cabeza MTP | Borradores aceptados | Decodificación (tok/s) |
|---|---|---|
| MTP propia de Ornith | 0 de 22 (0 %) | 23,9 |
| Este fichero | 30 de 38 (79 %) | 45,3 |

Medición del autor en Strata (motor qwen35, compilación local con `--mtp-gguf`), RTX 3090 de 24 GB, contexto de 4K, temperatura 0 y `--mtp 2`. Los tokens generados son idénticos en ambas ejecuciones. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, ya que el repositorio solo contiene una cabeza de borrador.

## Requisitos de hardware

- VRAM adicional para la cabeza MTP: aproximadamente 0,77 GB por el tamaño del fichero GGUF, sumados a la VRAM que ya ocupa el modelo base Ornith-1.5-35B-A3B.
- GPU validadas en la información disponible: RTX 3090 (24 GB), con contexto de 4K y `--mtp 2`.
- No cabe por sí sola en GPU de consumo de gama baja, pero al ser un complemento del modelo base el requisito real lo marca este último; una RTX 3090 es suficiente para la configuración medida.
- Opciones de despliegue: Strata con motor qwen35 y soporte `--mtp-gguf` (compilación local en la versión probada); la versión upstream 0.2.x no lee bloques MTP externos. No se documentan otros motores compatibles.
- Latencia y throughput: 45,3 tok/s de decodificación en la configuración medida, frente a 23,9 tok/s sin la cabeza entrenada.
- Almacenamiento: 0,77 GB para el fichero MTP; el repositorio completo ocupa 0,8 GB.

## Comparativa con modelos similares

| Cabeza MTP | Origen | Estado de entrenamiento | Aceptación medida | Licencia |
|---|---|---|---|---|
| Este fichero (Qwen3.6-35B-A3B MTP) | Unsloth `UD-Q6_K_XL` | Entrenada (normas 0,4 / 3,1) | 79 % (30/38) | Apache-2.0 |
| MTP nativa de Ornith-1.5-35B-A3B | Checkpoint de Ornith | No entrenada (normas a 1,0) | 0 % (0/22) | Apache-2.0 (modelo base) |
| Modelo base completo Qwen3.6-35B-A3B | Qwen / Unsloth | Modelo completo, no solo cabeza | no aplica | Apache-2.0 |

No se dispone de información sobre otras cabezas MTP de borrador comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base Ornith-1.5-35B-A3B y un motor con soporte de MTP externo, el fichero no produce texto.
- Compatibilidad limitada: requiere `--mtp-gguf`; la versión upstream de Strata 0.2.x solo lee el MTP del propio fichero del modelo, por lo que se necesita una compilación local o un motor equivalente.
- Las mediciones proceden de un único entorno (RTX 3090, 4K, temperatura 0, `--mtp 2`) y de un solo autor; la tasa de aceptación puede variar con otros contextos, temperaturas y cargas.
- Los pesos pertenecen a los autores de Qwen y Unsloth; este repositorio es solo una extracción, sin garantías de mantenimiento ni soporte.
- Riesgo de sesgos y alucinaciones: inherente al modelo base, no evaluado en esta información; la cabeza MTP no los corrige ni los amplifica, ya que la verificación preserva el texto original.
- Idiomas soportados no documentados en este repositorio; deben consultarse en la model card de Ornith-1.5-35B-A3B o de Qwen3.6-35B-A3B.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del release de Unsloth del que proceden los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SizorCloud/Ornith-1.5-35B-A3B-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Release GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
