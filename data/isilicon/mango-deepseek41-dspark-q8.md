# isilicon/mango-deepseek41-dspark-q8

## Resumen

`isilicon/mango-deepseek41-dspark-q8` es un artefacto auxiliar de tipo *speculative companion* (borrador o draft) en formato GGUF y cuantización Q8_0, extraído de la distribución `unsloth/DeepSeek-V4.1-Flash-1017-GGUF`. No es un modelo conversacional autónomo: es una pieza de dependencia que se carga junto al modelo objetivo de DeepSeek V4.1 Flash para acelerar la decodificación especulativa en el runtime nativo de DeepSeek.

El repositorio lo mantiene isilicon (proyecto Mango) como espejo de preservación documentada, con los bytes originales sin modificar y verificación SHA-256. El trabajo de modelo, modificación y cuantización corresponde a Unsloth y a los creadores originales de DeepSeek; Mango solo añade atribución, manifiesto de integridad y evaluación de configuraciones emparejadas.

Su relevancia es práctica: permite reproducir una configuración de inferencia especulativa probada sobre DeepSeek V4.1 Flash sin depender de que el archivo original siga disponible en el repositorio upstream. El payload seleccionado ocupa 7,98 GB (7,43 GiB) en un único archivo GGUF, y el modelo base declara 14.225.362.146 parámetros (14,2 mil millones) según los safetensors del repositorio asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto auxiliar de decodificación especulativa sobre DeepSeek V4.1 Flash; arquitectura del modelo objetivo no detallada en la información) |
| Parametros totales | 14.225.362.146 (dato de safetensors del repositorio; corresponde al modelo base, no al companion aislado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `dspark-DeepSeek-V4.1-Flash-1017-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El artefacto es un componente de decodificación especulativa (*speculative decoding*): un modelo borrador de menor coste que propone tokens y que el modelo objetivo DeepSeek V4.1 Flash valida en paralelo, reduciendo el número de pasos autorregresivos completos. La model card no documenta la arquitectura interna del draft (número de capas, dimensiones, mecanismo de atención) ni su procedimiento de entrenamiento; solo indica que procede de la distribución de Unsloth y que está pensado para la ruta especulativa nativa del runtime de DeepSeek.

No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO para este componente. Tampoco se detalla si el modelo objetivo emplea Mixture of Experts, atención lineal u otra innovación; la información disponible se limita a la procedencia, el tamaño del payload y la identidad criptográfica del archivo. La cuantización Q8_0 es de 8 bits por peso, lo que preserva prácticamente la precisión del draft original a cambio de un tamaño de 7,98 GB.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa junto a un target DeepSeek V4.1 Flash compatible.
- Aceleración de la inferencia del modelo objetivo mediante aceptación de borradores en la ruta nativa de DeepSeek.
- Verificación de integridad mediante SHA-256 (`6ba6ac1b331c5406…`) y manifiesto completo en `SOURCE_MANIFEST.json`.
- Reproducibilidad de una configuración de runtime concreta gracias al pinning de la revisión de pesos (`f0721c818cc1716d63bf9d183af67c3e27080f16`).
- No soporta de forma independiente chat, tool calling, agentes, visión, audio ni modo thinking: la model card indica explícitamente `inference: false` y ausencia de comando de lanzamiento propio.
- Capacidades multilingües: no disponibles para este artefacto.

## Casos de uso

- Aceleración de inferencia en producción con DeepSeek V4.1 Flash: cargar el companion Q8_0 en la ruta especulativa nativa del runtime para reducir la latencia por token del modelo objetivo, midiendo la tasa de aceptación del draft como parte de la configuración completa.
- Reproducción de experimentos: reconstruir exactamente la configuración evaluada por Mango (target IQ2_XS de AtomicChat más este draft Q8_0) usando la revisión de pesos fijada, lo que permite comparar resultados entre máquinas y fechas.
- Archivado y preservación a largo plazo: mantener una copia verificable del draft original de Unsloth con identidad SHA-256 y manifiesto de origen, útil para auditorías de cadena de suministro de modelos.
- Despliegue en entornos con requisitos de trazabilidad: el repositorio documenta procedencia, licencia MIT y responsabilidades de atribución, lo que facilita la revisión legal antes de incorporar el artefacto a un pipeline interno.
- Servido de alto rendimiento en infraestructura propia: integrar el par target/draft en motores compatibles con GGUF y decodificación especulativa para servir cargas conversacionales con menor coste por token que la decodificación estándar.
- Validación de integridad en CI: descargar el archivo con la revisión fijada y comprobar el hash contra `SOURCE_MANIFEST.json` como paso automatizado antes de desplegar el modelo objetivo en un clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este artefacto. La model card indica explícitamente que no existe una puntuación Mango independiente para estos archivos, por tratarse de un componente auxiliar.

Como referencia de una configuración distinta (no de este companion), se cita la siguiente medición del ecosistema Mango:

| Configuracion medida (no es este artefacto) | Puntuacion ponderada | Minimo de carga |
|---|---|---|
| DeepSeek V4.1 Flash · GSQ–RCO IQ2_XS · AtomicChat | 83,19 | 71,43 |

Estos valores describen el modelo consumidor con su runtime, no el draft aislado; un cambio de cuantización, linaje, draft, motor o tokenizer altera el resultado.

## Requisitos de hardware

- VRAM estimada para el companion: el payload en disco es de 7,98 GB (7,43 GiB); la VRAM necesaria es al menos esa cifra más el espacio de trabajo del runtime. La model card advierte que el tamaño de almacenamiento no implica que el modelo quepa en la misma cantidad de VRAM.
- Requisito adicional del target: debe sumarse la memoria del modelo objetivo DeepSeek V4.1 Flash (cuantización IQ2_XS en la configuración evaluada) más la caché KV y la memoria de trabajo del motor.
- GPU recomendadas: no disponibles en la información; por tamaño del companion, cabe en GPUs de consumo con 24 GB o más solo si el target se sirve en otra GPU o con offloading, extremo no documentado.
- Despliegue: exclusivamente a través del runtime nativo de DeepSeek compatible con la ruta especulativa y el layout de companions; no se documentan opciones vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles; deben medirse como configuración emparejada (target más draft), ya que la puntuación del padre no puede asignarse al draft por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| `isilicon/mango-deepseek41-dspark-q8` (este artefacto) | 14,2 mil millones (dato del base) | no disponible | GGUF Q8_0 | MIT | Espejo auxiliar, 94 descargas |
| `unsloth/DeepSeek-V4.1-Flash-1017-GGUF` (origen) | no disponible | no disponible | GGUF (varias cuantizaciones) | no disponible | Distribución upstream completa |
| `isilicon/mango-deepseek41-gsq-iq2xs-uncensored` | no disponible | no disponible | GGUF IQ2_XS | no disponible | Modelo consumidor evaluado (83,19) |

No se dispone de otros companions especulativos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es utilizable de forma autónoma: `inference: false` y sin comando de chat propio; requiere un target DeepSeek V4.1 Flash compatible y la ruta especulativa nativa.
- Sin puntuación de calidad independiente: cualquier cifra de rendimiento debe atribuirse a la configuración completa target/draft, no a este archivo.
- Sensibilidad a la configuración: cambiar cuantización, revisión del target, motor o tokenizer puede invalidar la tasa de aceptación y el rendimiento observados.
- Tamaño de almacenamiento no equivalente a VRAM: hay que sumar caché KV, memoria de trabajo y el modelo objetivo.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe del par target/draft.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible para este artefacto; heredados, en su caso, del modelo objetivo.
- Licencia MIT declarada, pero la model card remite a la atribución de Unsloth y de los creadores originales; conviene revisar las condiciones del modelo base antes de uso comercial.
- Repositorio de preservación con 0 likes y 94 descargas: ecosistema pequeño, sin garantía de mantenimiento continuado más allá de la instantánea documentada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/isilicon/mango-deepseek41-dspark-q8
- Modelo base (Unsloth): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF/tree/85f81fb970add013033f25e94006713ca2c0aaf2
- Modelo consumidor evaluado: https://huggingface.co/isilicon/mango-deepseek41-gsq-iq2xs-uncensored
- Colección Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluación: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio Qwen medium vs xhigh: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord: https://discord.gg/5n5YDbQCMy
- Archivo de pesos: https://huggingface.co/isilicon/mango-deepseek41-dspark-q8/resolve/main/dspark-DeepSeek-V4.1-Flash-1017-Q8_0.gguf
