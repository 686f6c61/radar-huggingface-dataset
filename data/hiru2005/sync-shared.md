# hiru2005/Sync-shared

## Resumen

Sync-shared es un repositorio auxiliar, no un modelo autónomo. Contiene los pesos y ficheros comunes que necesitan las variantes del proyecto Sync (Sync-XS, Sync-S y Sync-M) para funcionar sobre el motor de inferencia Sync-Strata. Lo publica el usuario hiru2005 en Hugging Face y deriva del modelo base Qwen/Qwen3.8-Flash-Next, un transformer de tipo mezcla de expertos (MoE) de la familia Qwen 3.8.

El repositorio empaqueta tres bloques: los tensores no expertos extraídos de una cuantización GGUF de terceros (agentionai/Qwen3.8-Flash-Next-Gyro-GGUF), la capa de predicción multi-token (MTP) convertida desde el checkpoint BF16 original y el tokenizador con su plantilla de chat. Adicionalmente referencia, sin alojarlo, un codificador de visión opcional en BF16.

Su relevancia es acotada: sirve para evitar descargas duplicadas entre las distintas variantes Sync y solo tiene sentido dentro del ecosistema Sync-Strata. El dato de tamaño en safetensors (56.147.944.320 parámetros) corresponde al modelo base subyacente, no a un modelo entrenado desde cero por el autor. El repositorio ocupa 33,5 GB y se marca explícitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) heredada del base Qwen3.8-Flash-Next; el repo contiene tensores no expertos, capa MTP y tokenizador |
| Parametros totales | 56.147.944.320 (dato safetensors del modelo base); el repo en sí no es un checkpoint completo |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tensores nativos extraídos de Gyro-S); MTP en binario propio del motor; mmproj opcional en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0; campo license: other) |
| Formato de pesos | GGUF (native-gguf), binarios propietarios del motor (mtp-rt: dense.bin, experts.bin, draft_vocab.bin), JSON/Jinja para tokenizador y plantilla |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de la familia Qwen 3.8. Este repositorio no entrena nada: redistribuye artefactos. La carpeta `native-gguf/` contiene los tensores que el motor lee con `--native` y `--ple-gguf` (embeddings, tabla n-gram/PLE y otros tensores no expertos), cortados del GGUF Gyro-S de agentionai; el autor advierte que no ha verificado byte a byte la equivalencia con el fichero original. La carpeta `mtp-rt/` incluye la capa de predicción multi-token (draft) convertida desde el checkpoint BF16 de Qwen con las herramientas de Strata (MIT), con `dense.bin` (116.099.072 B), `experts.bin` (707.788.800 B) y `draft_vocab.bin` (425.196 B), un total de 0,82 GB.

La innovación técnica relevante es el uso de decodificación especulativa mediante la capa MTP, que actúa como draft para acelerar la generación en el motor Sync-Strata. El tokenizador y la plantilla de chat se copian del base. No hay información sobre composición del dataset, número de tokens de entrenamiento ni fases de RLHF/DPO, porque el autor no las publica y este repositorio no las incluye.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del base Qwen3.8-Flash-Next a través de la plantilla de chat incluida.
- Decodificación especulativa: la capa MTP permite acelerar la inferencia en el motor Sync-Strata.
- Soporte de visión opcional: mediante el `mmproj` BF16 descargado de ISTA-DASLab (907.543.008 B), no alojado en este repo.
- Integración con el motor Sync-Strata: pensado para ser consumido por la aplicación, que descarga los ficheros automáticamente.
- Razonamiento, código, matemáticas, tool calling y capacidades multilingües: no disponibles como datos verificables en este repositorio; dependen del modelo base.

## Casos de uso

- Despliegue de las variantes Sync (XS, S, M): el repo centraliza los ficheros comunes para que el usuario descargue una sola vez los tensores compartidos en lugar de repetirlos por variante.
- Aceleración de inferencia con decodificación especulativa: la capa MTP de `mtp-rt/` se usa como draft en Sync-Strata para reducir la latencia de generación token a token.
- Inferencia GGUF nativa: los tensores de `native-gguf/` permiten al motor operar con `--native` y `--ple-gguf` sin cargar el GGUF completo de 58,49 GB.
- Pipeline multimodal experimental: combinando el `mmproj` opcional de ISTA-DASLab con el resto de artefactos se habilita entrada de imagen en el motor, útil para prototipos de análisis de documentos.
- Reproducción de experimentos: investigadores que quieran replicar el comportamiento de Sync-Strata sobre Qwen3.8-Flash-Next pueden usar estos ficheros como base reproducible.
- Evaluación de motores alternativos: sirve como banco de pruebas para comparar el rendimiento del motor Sync-Strata frente a llama.cpp u otras implementaciones sobre los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo completo; el repo suma 33,5 GB (native-gguf sin tamaño publicado, mtp-rt 0,82 GB, tokenizer 0,01 GB, mmproj opcional 0,91 GB).
- GPU recomendadas: no disponible; depende de la cuantización GGUF elegida y del motor Sync-Strata.
- Consumer GPU: no disponible; el tamaño del base (56,1 mil millones de parámetros) hace improbable que quepa completo en GPUs de consumo sin cuantización agresiva.
- Opciones de despliegue: motor Sync-Strata (obligatorio para estos artefactos); llama.cpp u otros motores solo con los GGUF de origen, no con estos ficheros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sync-shared (este repo) | 56,1 mil millones (base) | no disponible | Qwen Community License 1.0 | GGUF + binarios del motor | Repo auxiliar experimental, no checkpoint completo |
| Qwen/Qwen3.8-Flash-Next | 56,1 mil millones | no disponible | Qwen Community License 1.0 | safetensors BF16 | Modelo base original, checkpoint completo |
| agentionai/Qwen3.8-Flash-Next-Gyro-GGUF | no disponible | no disponible | no disponible | GGUF (58,49 GB) | Origen de los tensores nativos |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | no disponible | Apache-2.0 en metadatos; la card indica herencia de Qwen Community License 1.0 | GGUF | Origen del mmproj opcional |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el motor Sync-Strata y el resto de ficheros de la variante correspondiente no es utilizable.
- Estado experimental: el propio autor lo etiqueta como experimental y no ha verificado con herramientas la equivalencia byte a byte de los tensores nativos respecto al GGUF original.
- Trazabilidad de licencia: el mmproj procede de un repositorio cuyo metadato indica Apache-2.0 mientras su card declara herencia de Qwen Community License 1.0; hay ambigüedad.
- Licencia restrictiva: Qwen Community License 1.0 impone condiciones a productos comerciales de gran escala y a negocios de Model-as-a-Service o asistentes de IA; revisar el texto completo antes de uso comercial.
- Idiomas y contexto: no disponibles; cualquier afirmación sobre capacidades multilingües o ventana de contexto debe verificarse en el modelo base.
- Sesgos y alucinaciones: no documentados en este repositorio; se heredan los del base Qwen3.8-Flash-Next.
- Sin métricas de rendimiento publicadas: no hay benchmarks ni cifras de latencia o throughput.
- Mantenimiento incierto: 4 descargas y 0 likes; el proyecto depende de un único autor y de la disponibilidad del motor Sync-Strata.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hiru2005/Sync-shared
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Origen de los tensores GGUF (Gyro-S): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Origen del mmproj opcional: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor Sync-Strata: https://github.com/hiruhiru2005/sync-strata
- Herramientas Strata (MIT): https://github.com/Niko1221/Strata
- Página de donaciones del autor: https://ko-fi.com/hiruhiru2005
