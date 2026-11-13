# FiveC/TADA-checkpoints

## Resumen

TADA-checkpoints es un repositorio de archivo publicado por el usuario FiveC en Hugging Face que agrupa 20 checkpoints de modelos de traduccion automatica entre vietnamita y lenguas minoritarias de Vietnam (tay, bahnar), junto con sus model cards originales. No es un modelo entrenado de nuevo, sino un registro que preserva los pesos y las tarjetas de modelos fuente en revisiones fijas (pinned revisions), con el objetivo de garantizar la trazabilidad y la reproducibilidad de resultados publicados en un articulo academico. Cada checkpoint corresponde a una configuracion experimental concreta (aumento de datos EDA, SwitchOut, concatenacion de frases, congelacion del codificador, mBART, BARTPho, etc.).

El repositorio tiene un tamano de 212,9 GB, lo que refleja la acumulacion de multiples checkpoints completos en formato safetensors, y esta etiquetado con `transformers`, `safetensors` y `checkpoint-archive`. La model card es explicita sobre su alcance: no reclama una reproduccion fresca de los resultados del paper, sino que verifica que el BLEU de la cabecera de cada model card coincide con el caso correspondiente del paper hasta dos decimales. Las puntuaciones ChrF++ no estan verificadas de forma independiente cuando no aparecen en la tarjeta de origen.

La relevancia de este repositorio es fundamentalmente metodologica y de preservacion: sirve como evidencia auditable de un conjunto de experimentos de traduccion automatica de bajos recursos, no como un modelo listo para produccion. No se dispone de informacion sobre licencia, idiomas declarados, pipeline ni parametros de arquitectura mas alla de que los checkpoints son cargables con `AutoModelForSeq2SeqLM`, lo que implica arquitecturas encoder-decoder de tipo seq2seq (BART, mBART, BARTPho y variantes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2seq encoder-decoder (cargable con `AutoModelForSeq2SeqLM`); variantes BART, mBART y BARTPho segun checkpoint |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | vietnamita, tay, bahnar (segun los pares de traduccion de los checkpoints) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 212,9 GB |
| Numero de checkpoints | 20 |
| Libreria | transformers |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo: archiva 20 checkpoints procedentes de modelos fuente independientes, cada uno preservado en su revision original bajo `checkpoints/<source-repo-name>/`. Las arquitecturas subyacentes son de tipo seq2seq, coherentes con la carga mediante `AutoModelForSeq2SeqLM`: variantes BART (ViTay, BartTayFinal, freeze-viet-tay), mBART (MBart50-bahnar, MBart50-tay) y BARTPho (bartpho-Tay). Los pares de traduccion cubiertos son vi-tay, tay-vi y bahnar-vi.

Las tecnicas de entrenamiento documentadas en las model cards de origen incluyen aumento de datos (EDA Synonym, EDA Swap, EDA Insertion), SwitchOut, concatenacion de frases, combinacion, borrado con original, estrategias de congelacion del codificador (frozen_encoder) y el esquema de dos etapas de BARTPho. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplico RLHF o DPO. La model card indica que las puntuaciones de evaluacion de las model cards y las del paper se registran por separado, y que el archivo preserva tamanos de fichero, Git object IDs y checksums LFS SHA-256 para verificacion.

## Capacidades

- Traduccion automatica entre vietnamita y tay en ambas direcciones (vi-tay y tay-vi).
- Traduccion automatica entre bahnar y vietnamita (bahnar-vi).
- Generacion condicionada por texto propia de modelos seq2seq (entrada de secuencia, salida de secuencia).
- Carga directa mediante `AutoTokenizer` y `AutoModelForSeq2SeqLM` con `subfolder` por checkpoint.
- Verificacion de integridad de pesos mediante checksums LFS SHA-256 y Git object IDs.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Reproduccion academica de experimentos: cargar cada checkpoint con el `subfolder` correspondiente y comparar el BLEU de la model card con el del paper, usando el registro como fuente auditable.
- Auditoria de resultados publicados: verificar que las puntuaciones BLEU de las tarjetas de origen coinciden con las tablas del paper hasta dos decimales, con checksums que garantizan que los pesos no han cambiado.
- Investigacion en traduccion de bajos recursos: servir de linea base para comparar estrategias de aumento de datos (EDA, SwitchOut) en pares vi-tay y bahnar-vi.
- Estudio de estrategias de congelacion: los checkpoints `freeze-viet-tay-*` permiten analizar el efecto de congelar el codificador frente a fine-tuning completo.
- Evaluacion comparativa de arquitecturas seq2seq: contrastar BART, mBART y BARTPho sobre los mismos pares de lenguas usando los checkpoints archivados.
- Preservacion a largo plazo de artefactos de investigacion: mantener disponibles pesos y model cards en revisiones fijas aunque los repositorios originales cambien, sin depender de que los autores los mantengan.
- Docencia y formacion: usar los checkpoints como ejemplo practico de carga de modelos seq2seq con `subfolder` y de verificacion de integridad de artefactos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los BLEU de las model cards de origen, que el archivo verifica contra las tablas del paper. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, ChrF++ verificado) en la informacion disponible.

| Checkpoint | Direccion | Caso | BLEU (tarjeta) | BLEU (paper) |
|---|---|---|---|---|
| ViTay-SR | vi-tay | EDA Synonym | 19,2023 | 19,20 |
| ViTay-SwitchOut | vi-tay | SwitchOut | 22,1613 | 22,16 |
| ViTay-RS | vi-tay | EDA Swap | 18,6020 | 18,60 |
| ViTay-RI | vi-tay | EDA Insertion | 18,3148 | 18,31 |
| ViTay-Sentence-Concatenation | vi-tay | Sentence Concatenation | 15,9294 | 15,93 |
| BartTayFinal-Sentence-Concatenation | tay-vi | Sentence Concatenation | 18,9419 | 18,94 |
| BartTayFinal-combine-tay | tay-vi | Combine | 20,3274 | 20,33 |
| ViTay-delete-original-viet | vi-tay | Deletion + Original | 18,5125 | 18,51 |
| BartTay-Delete-Original-vi-only | tay-vi | Deletion + Original | 22,3547 | 22,35 |
| ViTay-synonyms-tay-only | vi-tay | Synonym | 11,3679 | 11,37 |
| ViTay-Theme-tay-only | vi-tay | Theme | 19,9294 | 19,93 |
| ViTay-Delete-tay-only | vi-tay | Deletion | 15,0894 | 15,09 |
| freeze-viet-tay-delete | vi-tay | Deletion | 13,5702 | 13,57 |
| freeze-viet-tay-theme | vi-tay | Theme | 13,2046 | 13,20 |
| freeze-viet-tay-synonym | vi-tay | Synonym | 12,7523 | 12,75 |
| freeze-viet-tay-combine | vi-tay | Combine | 14,0257 | 14,03 |
| freeze-viet-tay-delete-original | vi-tay | Deletion + Original | 14,7686 | 14,77 |
| bartpho-Tay | tay-vi | BARTPho two-stage | 13,9076 | 13,91 |
| MBart50-bahnar | bahnar-vi | mBART | 3,0610 | 3,06 |
| MBart50-tay | tay-vi | mBART | 11,9480 | 11,95 |

## Requisitos de hardware

- El repositorio completo ocupa 212,9 GB, por lo que almacenarlo requiere espacio en disco considerable; para inferencia basta con descargar el `subfolder` del checkpoint concreto.
- VRAM estimada: no disponible para cada checkpoint individual; depende del tamano de la arquitectura BART/mBART/BARTPho subyacente, que no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponible.
- No se confirma que ningun checkpoint concreto quepa en GPU de consumo; depende del modelo base de cada `subfolder`.
- Opciones de despliegue: carga via `transformers` (`AutoTokenizer` + `AutoModelForSeq2SeqLM` con `subfolder`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de arquitectura, parametros ni contexto de los checkpoints individuales que permitan una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- No es un modelo unico ni listo para produccion: es un archivo de 20 checkpoints de investigacion sobre traduccion de bajos recursos.
- La licencia no esta disponible en la informacion proporcionada; es imprescindible consultar la licencia de cada model card de origen antes de cualquier uso, especialmente comercial.
- El propio autor advierte que el archivo no reclama una reproduccion fresca de los resultados del paper; solo verifica la coincidencia del BLEU de las tarjetas con las tablas.
- ChrF++ no esta verificado de forma independiente cuando no aparece en la tarjeta de origen.
- El repositorio es privado segun la model card ("The archive remains private"), lo que condiciona el acceso y la distribucion.
- Los pares de lenguas son de bajos recursos (tay, bahnar) y los BLEU son bajos en varios casos (por ejemplo, 3,06 en bahnar-vi con mBART), lo que limita su uso en aplicaciones reales.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento fuera de dominio.
- No se documentan requisitos de hardware ni rendimiento en inferencia, lo que dificulta planificar un despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FiveC/TADA-checkpoints
- Model cards de origen citadas:
  - https://huggingface.co/FiveC/ViTay-SR
  - https://huggingface.co/FiveC/ViTay-SwitchOut
  - https://huggingface.co/FiveC/ViTay-RS
  - https://huggingface.co/FiveC/ViTay-RI
  - https://huggingface.co/FiveC/ViTay-Sentence-Concatenation
  - https://huggingface.co/FiveC/BartTayFinal-Sentence-Concatenation
  - https://huggingface.co/FiveC/BartTayFinal-combine-tay
  - https://huggingface.co/FiveC/ViTay-delete-original-viet
  - https://huggingface.co/FiveC/BartTay-Delete-Original-vi-only
  - https://huggingface.co/FiveC/ViTay-synonyms-tay-only
  - https://huggingface.co/FiveC/ViTay-Theme-tay-only
  - https://huggingface.co/FiveC/ViTay-Delete-tay-only
  - https://huggingface.co/FiveC/freeze-viet-tay-delete
  - https://huggingface.co/FiveC/freeze-viet-tay-theme
  - https://huggingface.co/FiveC/freeze-viet-tay-synonym
  - https://huggingface.co/FiveC/freeze-viet-tay-combine
  - https://huggingface.co/FiveC/freeze-viet-tay-delete-original
  - https://huggingface.co/FiveC/bartpho-Tay
  - https://huggingface.co/FiveC/MBart50-bahnar
  - https://huggingface.co/FiveC/MBart50-tay
- Paper de referencia: no disponible en la informacion proporcionada.
