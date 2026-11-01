# kapitsaprime/Nanbeige4.3-33B-DFlash2

## Resumen

Nanbeige4.3-33B-DFlash2 (en su variante de kapitsaprime) no es un modelo de lenguaje autónomo, sino un modelo borrador (draft model) para decodificación especulativa, diseñado para acelerar la inferencia de Nanbeige/Nanbeige4.3-33B. Fue entrenado por ProCreations con SpecForge, repackaged por Luni y espejado por Nace AI (kapitsaprime) para su uso en Kapitsa, un motor de inferencia para Apple silicon. El borrador propone bloques de 8 tokens a partir de los estados ocultos del modelo objetivo de 33B, y este verifica cada propuesta, por lo que el texto generado es idéntico al que produciría el 33B por sí solo.

Arquitecturalmente es un modelo de difusión por bloques (DFlash2) con solo 3 capas y aproximadamente 0,98 mil millones de parámetros (979.731.200 según los safetensors), con dimensión oculta de 7168. Comparte embeddings y cabeza de salida con el modelo objetivo (que no se almacenan en este repositorio), lo que reduce su tamaño a unos 2 GB en BF16. Su relevancia actual radica en la tendencia a acelerar modelos grandes en hardware de consumo, especialmente Mac con Apple silicon, donde la cuantización del borrador a 4 bits permite mantener la latencia baja sin alterar la calidad del modelo verificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (difusion por bloques) para decodificacion especulativa |
| Parametros totales | 979.731.200 (~0,98B) |
| Parametros activos | no disponible (no es MoE; todos los parametros participan en cada paso) |
| Longitud de contexto | no disponible (depende del modelo objetivo Nanbeige4.3-33B) |
| Tipos de cuantizacion | BF16 nativo; cuantizado a 4 bits al cargarlo en Kapitsa |
| Idiomas soportados | no disponible como modelo independiente; el objetivo cubre chino, agente, codigo, matematicas, chat y multilingue segun sus datos de entrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 1,96 GB; repo de 2,0 GB) |

## Arquitectura y entrenamiento

El borrador es un bloque de difusion DFlash2 de 3 capas con dimension oculta 7168, 28 cabezas de consulta y 4 cabezas KV. En cada paso propone un bloque de 8 tokens: 1 token ancla verificado y 7 conjeturas. En lugar de generar condicionado solo al texto ya emitido, lee las salidas de las capas 1, 25 y 49 del modelo objetivo (52 capas, dimension oculta 7168), fusionadas mediante una proyeccion aprendida. Comparte los embeddings y la cabeza de salida del 33B, por lo que no los almacena; esto implica que debe emparejarse siempre con el modelo objetivo en su revision `c1093c50`.

Fue entrenado por ProCreations con SpecForge sobre 19,3 millones de tokens de respuesta generados por el propio Nanbeige4.3-33B: 46% de datos agentic, 21% de codigo, y el resto repartido entre matematicas, chat, chino, prompts multilingues, estructurados y de contexto largo. La procedencia y licencias de los datos estan documentadas en los ficheros NOTICE y dataset-source-policy.json del repositorio. El objetivo del entrenamiento es maximizar la tasa de aceptacion de tokens por parte del 33B, no modelar el lenguaje de forma general.

## Capacidades

- No genera texto de forma autonoma: propone bloques de 8 tokens que el 33B verifica, garantizando salida identica a la del modelo objetivo.
- Decodificacion especulativa compatible con el objetivo en BF16 y con los packs MLX de 8 bits y 4 bits (kapitsaprime/Nanbeige4.3-33B-MLX-8bit y -4bit), con posible ligera reduccion de aceptacion sobre objetivos cuantizados.
- Optimizado para dominios agentic y de codigo, donde logra las mayores aceleraciones.
- Un solo borrador sirve para cualquier cuantizacion del objetivo, ya que opera sobre sus estados ocultos.
- Pensado para integrarse en Kapitsa en Apple silicon (soporte en desarrollo, no publicado en el momento de la ficha).

## Casos de uso

- Aceleracion de agentes de codigo en Mac: en flujos agentic (edicion de ficheros, llamadas a herramientas encadenadas) el borrador acepta 2,64 tokens por paso (2,16x de aceleracion), por lo que es adecuado para asistentes de codigo que ejecutan multiples pasos sobre un 33B local.
- Autocompletado y generacion de codigo local: al trabajar sobre repositorios o prompts de programacion, reduce la latencia del 33B un 1,79x sin cambiar la salida.
- Razonamiento y matematicas en local: para cadenas de razonamiento largas (CoT, problemas de matematicas) aporta 1,78x de aceleracion, util en aplicaciones de analisis que corren en un solo Mac.
- Chat local privado: aceleracion de 1,22x en conversacion; util cuando se prioriza privacidad y se quiere minimizar la espera en respuestas multi-turno.
- Generacion de texto en chino: 1,18x de mejora, relevante para aplicaciones bilingues chino/ingles servidas desde Apple silicon.
- Despliegue del 33B cuantizado: permite emparejar el borrador con los packs MLX de 8 o 4 bits, reduciendo la VRAM/unified memory necesaria manteniendo parte de la aceleracion.

## Benchmarks y rendimiento

Mediciones upstream de ProCreations y Luni sobre hardware NVIDIA (batch 1), no sobre Apple silicon:

| Dominio | Tokens aceptados por paso | Aceleracion vs decodificacion estandar |
|---|---:|---:|
| Agentic coding | 2,64 | 2,16x |
| Code | 2,21 | 1,79x |
| Math and reasoning | 2,21 | 1,78x |
| Chat | 1,52 | 1,22x |
| Chinese | 1,45 | 1,18x |

Ademas, ProCreations reporta 1,76x en decodificacion greedy y 1,63x a temperatura 1 con SGLang sobre un objetivo BF16 en una RTX PRO 6000. No hay mediciones publicadas en Apple silicon; la card indica que se publicaran cuando el soporte en Kapitsa este disponible. No existen puntuaciones de benchmarks estandar (MMLU, HumanEval, GSM8K) al tratarse de un borrador y no de un modelo de lenguaje evaluable.

## Requisitos de hardware

- El borrador ocupa ~2 GB en BF16; Kapitsa lo cuantiza a 4 bits al cargarlo, reduciendo su huella a ~0,5 GB aproximadamente (estimacion, no dato publicado).
- Requiere obligatoriamente el modelo objetivo Nanbeige4.3-33B en memoria (BF16, 8 bits o 4 bits via MLX); los requisitos totales dominan los del objetivo, no los del borrador.
- Diseno orientado a Apple silicon (Mac con Apple silicon mediante Kapitsa y MLX); el formato BF16 es el neutro por hardware, ya que las ramas EXL3 y FP8 upstream son para NVIDIA.
- En NVIDIA, las mediciones upstream usan SGLang sobre una RTX PRO 6000; no hay datos de otras GPU.
- Despliegue: Kapitsa (Apple silicon, soporte en desarrollo); upstream se uso con SGLang y SpecForge para entrenamiento. No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI para este borrador.
- Latencia y throughput: no disponibles para Apple silicon; en NVIDIA, 1,63x-1,76x de aceleracion segun temperatura.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kapitsaprime/Nanbeige4.3-33B-DFlash2 | Draft model DFlash2 | 0,98B | BF16 safetensors | Apache 2.0 | Espejo para Apple silicon; lee capas 1/25/49 del objetivo |
| ProCreations/Nanbeige4.3-33B-DFlash2 | Draft model DFlash2 (original) | 0,98B | BF16 / EXL3 / FP8 | Apache 2.0 | Version original con ramas NVIDIA; pesos identicos byte a byte |
| Luni/Nanbeige-4.3-33B-DFlash2 | Draft model DFlash2 (repack) | 0,98B | BF16 safetensors | Apache 2.0 | Repack intermedio; config con `tap_shift: 0` explicito |
| Nanbeige/Nanbeige4.3-33B | Modelo objetivo | 33B (52 capas, hidden 7168) | BF16, packs MLX 8/4 bits | no disponible en esta ficha | Modelo de lenguaje al que sirve este borrador |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse de forma aislada y exige el objetivo Nanbeige4.3-33B en su revision `c1093c50`, junto con sus embeddings y cabeza de salida.
- El soporte en Kapitsa esta en desarrollo y no publicado; las cifras de aceleracion en Apple silicon no estan medidas y podrian ser inferiores a las de NVIDIA.
- Sobre objetivos cuantizados (8 o 4 bits) la tasa de aceptacion puede ser algo menor que sobre BF16, reduciendo la aceleracion.
- Las mediciones disponibles provienen de hardware NVIDIA (RTX PRO 6000, SGLang); su traslado a Mac depende del coste de la pasada de verificacion de 8 filas en los kernels de Apple silicon.
- Riesgo de alucinacion: heredado integramente del modelo objetivo, ya que el borrador no altera la distribucion de salida; no hay evaluaciones propias de sesgo o seguridad.
- Idiomas y longitud de contexto: definidos por el objetivo; este repositorio no documenta ni limita nada al respecto.
- Descargas muy bajas (358) y sin likes: adopcion minima y comunidad reducida, con soporte practicamente limitado a Kapitsa.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/kapitsaprime/Nanbeige4.3-33B-DFlash2
- Modelo objetivo: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Borrador original (ProCreations): https://huggingface.co/ProCreations/Nanbeige4.3-33B-DFlash2
- Repack de Luni: https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2
- Pack MLX 8 bits del objetivo: https://huggingface.co/kapitsaprime/Nanbeige4.3-33B-MLX-8bit
- Pack MLX 4 bits del objetivo: https://huggingface.co/kapitsaprime/Nanbeige4.3-33B-MLX-4bit
- Kapitsa (motor de inferencia para Apple silicon): https://github.com/nace-ai/kapitsa
- Ficheros NOTICE y dataset-source-policy.json en el propio repositorio para procedencia de datos de entrenamiento.
