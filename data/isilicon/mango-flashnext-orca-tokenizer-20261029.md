# isilicon/mango-flashnext-orca-tokenizer-20261029

## Resumen

Este repositorio no es un modelo de lenguaje, sino un artefacto auxiliar de preservación publicado por isilicon (proyecto Mango) en HuggingFace. Contiene los ficheros de configuración y tokenización —`config.json`, `tokenizer.json` y `tokenizer_config.json`— extraídos del modelo Qwen3.8-Flash-Next-Uncensored de OrcaRouter en su revisión de precisión completa (`da29941aee972c7eeab497e05a292c569da1f1d6`). Su propósito es servir de acompañante de runtime para paquetes GGUF cuantizados del modelo base, garantizando que la tokenización y la configuración usadas en inferencia coincidan exactamente con las del origen.

La relevancia de este tipo de artefacto es práctica: al desplegar modelos cuantizados (por ejemplo, IQ4_XS) es habitual que pequeñas divergencias entre el tokenizador del paquete y el del modelo original provoquen degradaciones silenciosas de calidad. Al fijar los bytes exactos de los ficheros originales, con identidades criptográficas (SHA-256 y Git blob) documentadas en un manifiesto, el repositorio permite verificar la integridad de la configuración. La licencia es Apache 2.0 y los idiomas declarados del modelo base son inglés y chino.

No hay pesos del modelo en el repositorio (tamaño de payload seleccionado: 0,01 GB), no se declara inferencia (`inference: false`) y no se ha publicado ninguna puntuación de calidad independiente para estos ficheros: es un componente de acompañamiento, no una entrada de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de config/tokenizador; el modelo base es Qwen3.8-Flash-Next) |
| Parametros totales | no disponible (no incluye pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (ficheros JSON de config y tokenizador) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (safetensors/GGUF no incluidos; solo JSON de configuración) |

Datos adicionales registrados:

| Propiedad | Valor |
|---|---|
| Artefacto | Config / tokenizador JSON |
| Payload seleccionado | 0,01 GB / 0,01 GiB |
| Ficheros principales | 3 |
| Editor de origen | orcarouter |
| Revisión de origen | `da29941aee972c7eeab497e05a292c569da1f1d6` |
| Revisión del mirror | `88209668ab21f0a3323ce5974e014f17bb988c3a` |
| Estado de inferencia | `inference: false` |

## Arquitectura y entrenamiento

Este repositorio no contiene una arquitectura entrenable ni datos de entrenamiento: es una copia de preservación de tres ficheros de metadatos del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored. El tokenizador (`tokenizer.json`, ~0,0128 GB) puede cargarse de forma independiente con la librería `tokenizers` de HuggingFace para codificar texto, pero no incluye pesos de ningún modelo lingüístico.

La innovación relevante del repositorio está en su metodología de preservación: cada fichero se documenta con su identidad criptográfica (prefijos SHA-256 para `tokenizer.json` y Git blob para `config.json` y `tokenizer_config.json`), el manifiesto completo está en `SOURCE_MANIFEST.json`, y `MIRROR_STATUS.json` y `MODEL_CARD_STATUS.json` registran separadamente la verificación de los ficheros de origen y la actualización de la documentación. Esto permite auditar que los bytes seleccionados no han cambiado entre revisiones.

## Capacidades

- No es un modelo generativo: no produce texto, no razona, no genera código ni procesa visión o audio.
- Tokenización autónoma: el fichero `tokenizer.json` puede cargarse con `tokenizers.Tokenizer.from_file()` para codificar y decodificar texto compatible con Qwen3.8-Flash-Next.
- Preservación verificable: hashes y manifiestos que permiten validar la integridad de la configuración frente al origen.
- Compatibilidad de runtime: pensado para acompañar paquetes GGUF del modelo base, manteniendo alineados config, tokenizador y plantilla de chat nativa.
- No es un chat model ni incluye torre de visión; no es una entrada de benchmark independiente.

## Casos de uso

- Reproducción exacta de inferencia cuantizada: al desplegar un GGUF de Qwen3.8-Flash-Next (por ejemplo, la variante IQ4_XS de OrcaRouter), se usan estos ficheros para garantizar que el tokenizador y la config coinciden con la fuente en precisión completa, evitando divergencias de calidad.
- Auditoría de integridad de pesos: equipos que necesiten verificar que los ficheros de un mirror no han sido alterados pueden comparar los hashes SHA-256/Git blob documentados en `SOURCE_MANIFEST.json`.
- Pipelines de evaluación controlada: frameworks de benchmark que requieren prompts congelados y tokenización determinista pueden fijar estos ficheros como dependencia exacta por revisión.
- Análisis del tokenizador: investigadores pueden estudiar el vocabulario, merges y comportamiento de codificación de Qwen3.8-Flash-Next cargando `tokenizer.json` de forma aislada.
- Reconstrucción de entornos históricos: al estar fijados por revisión (`88209668ab21f0a3323ce5974e014f17bb988c3a`), permiten reproducir experimentos pasados aunque la documentación avance en `main`.
- Empaquetado de distribuciones locales: creadores de paquetes GGUF o quantizados personalizados pueden incluir estos ficheros como companions oficiales verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este artefacto concreto. La model card lo indica explícitamente: no existe puntuación Mango independiente para estos ficheros, y el resultado de calidad pertenece a la configuración completa del modelo que los consume.

Resultados publicados para configuraciones relacionadas (no para este artefacto):

| Configuración relacionada | Puntuación ponderada | Mínimo de carga de trabajo |
|---|---|---|
| Qwen3.8 Flash Next · IQ4_XS · mradermacher | 84,19 | 35,33 |
| Qwen3.8 Flash Next · IQ4_XS · OrcaRouter directo | 83,42 | 37,36 |

Adicionalmente, se cita un estudio de esfuerzo de razonamiento Qwen (cohorte de 404 preguntas): effort medium 82,87/100 frente a xhigh 84,41/100, diferencia emparejada de +1,54 puntos (intervalo 95 % [-1,71, +4,82]). Estos números corresponden a otras configuraciones y no a este repositorio.

## Requisitos de hardware

- VRAM: no aplica; el payload total es de aproximadamente 0,01 GB (ficheros JSON), por lo que funciona en cualquier equipo sin GPU.
- GPU recomendadas: ninguna; no hay pesos de modelo.
- Consumer GPU: no aplica; la carga del tokenizador es puramente CPU y memoria RAM (el propio `tokenizer.json` ocupa ~12,8 MB).
- Despliegue: descarga con `huggingface_hub` (`hf download` fijando la revisión `88209668ab21f0a3323ce5974e014f17bb988c3a`) y carga con la librería `tokenizers` de Python. No aplica vLLM, llama.cpp, Ollama ni TGI para este artefacto en sí, aunque sus ficheros acompañan a paquetes GGUF destinados a esos runtimes.
- Latencia y throughput: no disponibles; no se realiza inferencia.

## Comparativa con modelos similares

Como artefacto auxiliar (config + tokenizador de preservación), no compite con modelos generativos. Alternativas equivalentes en categoría:

| Repositorio | Contenido | Modelo base | Licencia |
|---|---|---|---|
| isilicon/mango-flashnext-orca-tokenizer-20261029 | config.json + tokenizer.json + tokenizer_config.json (mirror verificado) | orcarouter/Qwen3.8-Flash-Next-Uncensored | Apache 2.0 |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (origen) | Pesos en precisión completa + config y tokenizador originales | — | Apache 2.0 (declarada) |
| isilicon/mango-flashnext-orca-iq4xs-20261029 | GGUF IQ4_XS del modelo base, consumidor de este artefacto | orcarouter/Qwen3.8-Flash-Next-Uncensored | Apache 2.0 |

La diferencia clave frente a usar directamente los ficheros del repositorio de origen es la trazabilidad: este mirror fija revisiones concretas, publica manifiestos de integridad y separa la documentación del snapshot de pesos preservado.

## Limitaciones y advertencias

- No es un modelo: intentar usarlo para generación de texto fallará; solo proporciona metadatos de tokenización y configuración.
- Sin puntuación de calidad propia: cualquier benchmark debe atribuirse al modelo completo que consume estos ficheros; cambiar quant, linaje de modificación, draft, engine o tokenizador puede alterar el resultado.
- Dependencia del modelo base: hereda las características del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, cuya variante "Uncensored" carece de ajustes de seguridad; el tokenizador en sí es neutro, pero el runtime acompañado puede generar contenido sin filtros.
- Idiomas limitados a inglés y chino según la declaración del modelo base; el rendimiento en castellano no está documentado.
- La licencia Apache 2.0 es permisiva para uso comercial, pero la atribución correcta a los creadores upstream (OrcaRouter) es exigida por la propia model card del mirror.
- La documentación del mirror puede avanzar en `main` sin cambiar el snapshot de pesos; para reproducibilidad estricta, fijar siempre la revisión indicada.
- Tamaño de payload no equivale a requisitos de runtime: KV cache, memoria de trabajo y companions del modelo consumidor añaden sus propios requisitos.

## Enlaces

- Repositorio: https://huggingface.co/isilicon/mango-flashnext-orca-tokenizer-20261029
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Colección completa Mango (modelos probados y mirrors de preservación): https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Configuración relacionada evaluada (IQ4_XS OrcaRouter directo): https://huggingface.co/isilicon/mango-flashnext-orca-iq4xs-20261029
- Configuración relacionada evaluada (IQ4_XS mradermacher): https://huggingface.co/isilicon/mango-qwen38-flashnext-iq4xs
- Estudio de esfuerzo Qwen (medium vs xhigh): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Manifiesto de integridad: https://huggingface.co/isilicon/mango-flashnext-orca-tokenizer-20261029/blob/main/SOURCE_MANIFEST.json
- Estado del mirror: https://huggingface.co/isilicon/mango-flashnext-orca-tokenizer-20261029/blob/main/MIRROR_STATUS.json
- Comunidad (Discord): https://discord.gg/5n5YDbQCMy
