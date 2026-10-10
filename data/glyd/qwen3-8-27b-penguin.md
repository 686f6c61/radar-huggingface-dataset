# glyd/Qwen3.8-27B-penguin

## Resumen

Qwen3.8-27B-penguin es una versión recomprimida sin pérdidas del modelo Qwen/Qwen3.8-27B, publicada por el usuario glyd. No es un modelo entrenado desde cero ni un ajuste fino: es el mismo conjunto de pesos del modelo base, empaquetado con el formato propietario de Glyd para reducir el espacio que ocupa en disco. Según la model card, los pesos pasan de 50,10 GiB en bf16 a 34,47 GiB, y cada peso se decodifica exactamente a su valor bf16 original, bit a bit.

El repositorio se distribuye con la etiqueta de nivel "penguin", que corresponde al modo sin pérdidas de Glyd. Existen dos niveles adicionales para el mismo modelo base, "kestrel" (unos 6,5 bits por peso) y "swift" (unos 5,5 bits por peso), que sí implican compresión con pérdidas a cambio de un tamaño menor. La relevancia práctica del modelo está en el ahorro de almacenamiento y de ancho de banda de descarga sin degradar la calidad de los pesos, algo útil en clústeres con muchos nodos o en entornos con almacenamiento limitado.

Es importante señalar que la model card indica que este repositorio contiene solo la parte de texto: la parte de visión del modelo base no está incluida. Además, el modelo necesita el runtime de Glyd para poder cargarse, y Glyd se distribuye bajo licencia BUSL-1.1, con uso gratuito solo para fines personales y no comerciales. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el Hub etiqueta el modelo con `qwen3_5`; la model card no detalla la arquitectura) |
| Parametros totales | 26.895.998.464 según la model card; el Hub muestra 35.642.959.414 porque cuenta cada byte empaquetado como un parámetro |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Nivel penguin: empaquetado sin pérdidas (etiqueta `8-bit`), cada peso decodifica a su valor bf16 exacto. Niveles alternativos del mismo base: kestrel (~6,5 bits por peso) y swift (~5,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 para los pesos (heredada del modelo base); la herramienta Glyd es BUSL-1.1 y requiere licencia para uso comercial |
| Formato de pesos | safetensors empaquetado con el formato propietario de Glyd (`library_name: glyd`) |
| Modelo base | Qwen/Qwen3.8-27B (commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) |
| Tamano de los pesos | 34,47 GiB (frente a 50,10 GiB en bf16) |
| Tamano del repositorio | 37,0 GB |
| Fecha de publicacion | 2026-10-09 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base en los datos disponibles. La etiqueta `qwen3_5` del Hub sugiere que Qwen/Qwen3.8-27B pertenece a la familia Qwen3.5, pero la model card de esta publicación no describe el tipo de transformer, la composición del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO. Tampoco se indica si se trata de un modelo denso o de mezcla de expertos, por lo que no es posible determinar parámetros activos.

Lo que sí describe el autor es el procedimiento de compresión, que no es un entrenamiento sino una transformación del checkpoint. El nivel penguin aplica una codificación sin pérdidas sobre los pesos bf16: el resultado ocupa aproximadamente un tercio menos y la decodificación es reversible bit a bit. Los niveles kestrel y swift, en cambio, sí son cuantizaciones con pérdidas (6,5 y 5,5 bits por peso respectivamente). La innovación técnica de esta ficha es, por tanto, el propio formato de empaquetado de Glyd y su decodificador, no el modelo subyacente. La carga se realiza con `glyd run Qwen/Qwen3.8-27B:penguin` desde línea de comandos o con `glyd.from_pretrained` desde Python.

## Capacidades

- Generación de texto en la parte de lenguaje del modelo base. El resto de capacidades concretas del modelo base no están documentadas en la información disponible.
- No se incluye la parte de visión: el repositorio es solo texto, según la model card, aunque el modelo base pudiera ser multimodal.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible.
- Capacidad destacable específica de esta publicación: decodificación sin pérdidas de los pesos empaquetados, con fidelidad bit a bit respecto al checkpoint bf16 original.

## Casos de uso

- Almacenamiento eficiente de checkpoints en clústeres: al ocupar 34,47 GiB en lugar de 50,10 GiB, permite mantener más versiones del modelo en el mismo almacenamiento sin renunciar a la fidelidad de los pesos.
- Distribución interna de modelos en equipos con ancho de banda limitado: la descarga se reduce aproximadamente un tercio respecto al checkpoint bf16, manteniendo el resultado de la inferencia idéntico al del modelo original.
- Reproducción exacta de resultados de investigación: al ser sin pérdidas, sirve como copia archivada del checkpoint original para experimentos que exijan comparar contra los pesos bf16 bit a bit.
- Sustitución del checkpoint bf16 en entornos con GPU de 48 GB: el nivel penguin deja más margen de memoria para caché KV que el checkpoint original, siempre que el runtime Glyd esté disponible (Linux con GPU NVIDIA Ampere o posterior).
- Servicio de inferencia de texto en producción, si se dispone de licencia comercial de Glyd: los pesos son apache-2.0, pero la herramienta de decodificación es BUSL-1.1 y exige licencia para uso comercial.
- Archivado a largo plazo de modelos base: el ahorro de espacio es acumulativo cuando se conservan varias revisiones del mismo modelo.
- Evaluación comparativa de niveles de compresión: publicar los tres niveles (penguin, kestrel, swift) del mismo base permite medir en condiciones controladas el impacto de la cuantización sobre la calidad, usando penguin como referencia sin pérdidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

| Benchmark | Resultado |
|---|---|
| No disponible | no disponible |

## Requisitos de hardware

- Tamaño de pesos a cargar: 34,47 GiB en el nivel penguin; 50,10 GiB si se usa el checkpoint bf16 original.
- VRAM estimada: el nivel penguin requiere al menos 34,47 GiB solo para los pesos, más la caché KV y las activaciones, cuyo tamaño depende de la longitud de contexto (no publicada).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para el checkpoint bf16 completo con margen; GPU de 48 GB (A6000, A40, L40S) para el nivel penguin, con margen limitado según contexto y tamaño de lote.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) ni de 16 GB. No se documenta ninguna variante que quepa en GPU de consumo.
- Requisitos del runtime: Linux con GPU NVIDIA Ampere o posterior, driver 580 o superior y Glyd 0.29.4 o posterior.
- Opciones de despliegue: CLI `glyd run Qwen/Qwen3.8-27B:penguin` y API de Python `glyd.from_pretrained("glyd/Qwen3.8-27B-penguin")` con `pip install "glyd[gpu]"`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glyd/Qwen3.8-27B-penguin | 26.895.998.464 (model card); 35.642.959.414 según el Hub | no disponible | 34,47 GiB, sin pérdidas | apache-2.0 (pesos) + BUSL-1.1 (Glyd) | Repositorio con 0 descargas |
| glyd/Qwen3.8-27B-kestrel | mismo base | no disponible | ~6,5 bits por peso, con pérdidas | apache-2.0 (pesos) + BUSL-1.1 (Glyd) | Publicado por el mismo autor |
| glyd/Qwen3.8-27B-swift | mismo base | no disponible | ~5,5 bits por peso, con pérdidas | apache-2.0 (pesos) + BUSL-1.1 (Glyd) | Publicado por el mismo autor |
| Qwen/Qwen3.8-27B | no disponible | no disponible | 50,10 GiB en bf16 | apache-2.0 | Modelo base original |

No se han identificado otras alternativas comparables en la información disponible.

## Limitaciones y advertencias

- La model card indica explícitamente que solo se incluye la parte de texto: la parte de visión del modelo base no está presente en este repositorio.
- El formato de pesos es propietario de Glyd: sin el runtime `glyd` (0.29.4 o superior) no se pueden decodificar los pesos, lo que introduce dependencia de un proveedor concreto.
- Licencia dual: los pesos son apache-2.0, pero Glyd se distribuye bajo BUSL-1.1. El uso comercial requiere una licencia de pago, aunque el modelo base sea de uso libre.
- El runtime solo funciona en Linux con GPU NVIDIA Ampere o posterior y driver 580 o superior, lo que excluye GPU AMD, Apple Silicon y despliegues en CPU.
- No se han publicado benchmarks que permitan verificar el rendimiento del modelo ni la equivalencia funcional con el checkpoint original más allá de la afirmación del autor sobre la fidelidad bit a bit.
- El repositorio tiene 0 descargas y 0 valoraciones, por lo que no existe validación independiente de la comunidad.
- No se declaran idiomas soportados ni longitud de contexto, datos imprescindibles para dimensionar un despliegue en producción.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; son los inherentes al modelo base Qwen/Qwen3.8-27B, que no se documentan en esta publicación.
- Los niveles kestrel y swift del mismo autor sí introducen pérdidas; no deben confundirse con penguin al comparar resultados.
- Fecha de creación del repositorio: 2026-10-09, con la última actualización el mismo día.

## Enlaces

- Repositorio del modelo: https://huggingface.co/glyd/Qwen3.8-27B-penguin
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del modelo base usado: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Nivel kestrel: https://huggingface.co/glyd/Qwen3.8-27B-kestrel
- Nivel swift: https://huggingface.co/glyd/Qwen3.8-27B-swift
- Sitio del runtime: https://getglyd.com
- Script de instalación: https://getglyd.com/install.sh
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces encontrados no guardan relación con él.
