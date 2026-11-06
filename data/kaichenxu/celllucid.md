# kaichenxu/CellLucid

## Resumen

CellLucid es un conjunto de activos para el modelado interpretable de temas (topic modeling) sobre atlas de celula unica, orientado a la consulta en lenguaje natural de datos transcriptomicos. No es un modelo de lenguaje generativo al uso, sino un sistema que describe cada celula como una mezcla de 128 programas genicos (topicos) sobre un espacio de embeddings congelado. Lo desarrolla kaichenxu y se distribuye a traves de Hugging Face con la libreria propia `celllucid`.

El sistema se apoya en TranscriptFormer (TF-Sapiens), un backbone desarrollado por el Chan Zuckerberg Initiative que se redistribuye sin modificar y permanece congelado durante todo el proceso. Sobre esas representaciones, CellLucid entrena dos bancos de topicos (128 topicos cada uno) a partir de 7,5 millones de celulas procedentes de 22 estudios del Human Cell Atlas, reservando cinco estudios adicionales para evaluacion.

Su relevancia actual radica en que combina un backbone generative de celula unica ya validado con una capa de topicos interpretables y consultables, lo que facilita tareas de interpretacion biologica, control de calidad y comparacion entre estudios sin necesidad de reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone TranscriptFormer (TF-Sapiens) congelado + bancos de topicos sobre embeddings |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de datos transcriptomicos, no de lenguaje) |
| Licencia | GPL-3.0 para codigo y bancos de topicos; pesos del backbone bajo MIT (CZI) |
| Formato de pesos | `model_weights.pt` (PyTorch), `config.json`, `vocabs/`, `genes.json`, `symbols.json` |

## Arquitectura y entrenamiento

CellLucid no entrena un transformer desde cero: utiliza el backbone TF-Sapiens de TranscriptFormer, cuyos pesos se distribuyen sin modificaciones y se mantienen congelados. Sobre las embeddings resultantes, el sistema aprende topicos como vectores unitarios en el espacio de embeddings del backbone, que asignan cada celula mediante un softmax con temperatura 0,05, junto con un diccionario topico-por-gen.

El entrenamiento de los bancos de topicos se realizo sobre 7,5 millones de celulas de 22 estudios del Human Cell Atlas, usando cada celula una sola vez, con cinco estudios reservados para evaluacion. Se generan dos variantes: `default`, que excluye genes mitocondriales, de proteinas ribosomales y segmentos V de TCR/BCR y esta pensada para interpretar programas y comparar tipos celulares entre estudios; y `all_genes`, entrenada con todos los genes y orientada a control de calidad, analisis tecnico o de muestra y reconstruccion completa del perfil. Los bancos almacenan identificadores Ensembl (`genes.json`) y simbolos genicos (`symbols.json`), con el mapeo construido a partir de GENCODE v49.

## Capacidades

- Modelado de temas interpretable: representa cada celula como mezcla de 128 programas genicos.
- Asignacion de topicos por celula mediante softmax con temperatura 0,05 sobre embeddings congelados.
- Consulta en lenguaje natural de atlas de celula unica (objetivo declarado del proyecto).
- Comparacion de tipos celulares entre estudios distintos.
- Analisis de control de calidad y de efectos tecnicos o de muestra mediante el banco `all_genes`.
- Reconstruccion del perfil de expresion completo a partir de los topicos.
- Mapeo de simbolos genicos a identificadores Ensembl (GENCODE v49).
- No soporta tool calling, agentes, vision, audio ni generacion de texto general.

## Casos de uso

- Interpretacion de programas genicos: el banco `default` permite descomponer poblaciones celulares en 128 programas interpretables y comparar su composicion entre tipos celulares.
- Comparacion entre estudios del Human Cell Atlas: al asignar topicos sobre embeddings congelados, se pueden contrastar 22 estudios sin reentrenar el backbone.
- Control de calidad de datos de celula unica: el banco `all_genes` captura genes mitocondriales, ribosomales y de segmentos V, utiles para detectar artefactos tecnicos y de muestra.
- Reconstruccion de perfiles de expresion: a partir de la mezcla de topicos y el diccionario topico-por-gen se puede aproximar el perfil completo de una celula.
- Anotacion asistida de tipos celulares: la mezcla de topicos sirve como representacion compacta para tareas posteriores de clasificacion o clustering.
- Consulta en lenguaje natural de atlas: el objetivo del proyecto es permitir preguntas sobre los datos celulares apoyandose en la representacion por topicos.
- Integracion en pipelines bioinformaticos: la distribucion via `hf download` y la libreria `celllucid` facilitan su incorporacion en flujos de analisis existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamano del backbone TF-Sapiens ni de los bancos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: descarga de activos mediante `hf download kaichenxu/CellLucid --local-dir assets` y uso a traves de la libreria `celllucid`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CellLucid | no disponible | no disponible | Topicos interpretables sobre backbone congelado | GPL-3.0 (codigo y topicos), MIT (backbone) | Hugging Face + GitHub |
| TranscriptFormer (TF-Sapiens) | no disponible | no disponible | Modelo generative de celula unica | MIT | GitHub CZI + S3 |
| Alternativas de topic modeling de celula unica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre CellLucid y otras aproximaciones en la informacion proporcionada.

## Limitaciones y advertencias

- El backbone TF-Sapiens se redistribuye sin modificar y bajo la licencia MIT de CZI, con sujecion a la Acceptable Use Policy de CZI; conviene revisarla antes de usos concretos.
- El codigo y los bancos de topicos estan bajo GPL-3.0, lo que impone obligaciones de copyleft para uso comercial o distribucion derivada.
- El modelo esta entrenado exclusivamente con datos del Human Cell Atlas; su aplicacion a otras especies o tejidos no esta documentada.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y las capacidades de consulta en lenguaje natural dependen de la capa de software del proyecto.
- No se han publicado benchmarks ni metricas de rendimiento en la informacion disponible, por lo que no es posible cuantificar su calidad frente a alternativas.
- El banco `default` excluye genes mitocondriales, ribosomales y segmentos V de TCR/BCR por diseno, lo que limita su uso para control de calidad; para ello debe emplearse `all_genes`.
- Riesgo de sesgo derivado de la composicion de los 22 estudios del Human Cell Atlas utilizados en el entrenamiento.
- No se documentan tipos de cuantizacion ni requisitos de hardware, lo que dificulta planificar el despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/kaichenxu/CellLucid
- Repositorio CellLucid: https://github.com/Catchxu/CellLucid
- Uso de CellLucid: https://github.com/Catchxu/CellLucid#usage
- TranscriptFormer (CZI): https://github.com/czi-ai/transcriptformer
- Pesos TF-Sapiens: https://czi-transcriptformer.s3.amazonaws.com/weights/tf_sapiens.tar.gz
- Licencia de TranscriptFormer: https://github.com/czi-ai/transcriptformer/blob/main/LICENSE.md
- Acceptable Use Policy de CZI: https://virtualcellmodels.cziscience.com/acceptable-use-policy
- Referencia: Pearce et al., "A cross-species generative cell atlas across 1.5 billion years of evolution: The TranscriptFormer single-cell model", bioRxiv (2025).
