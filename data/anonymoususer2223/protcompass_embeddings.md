# Anonymoususer2223/ProtCompass_Embeddings

## Resumen

ProtCompass_Embeddings no es un modelo generativo al uso, sino un repositorio de artefactos de investigación publicado en Hugging Face por el usuario anónimo `Anonymoususer2223`. Contiene los embeddings congelados, las etiquetas, los registros de auditoría de entradas y los pesos preentrenados de seis codificadores de estructura que respaldan el artículo "ProtCompass: Biological Information and Predictive Utility in Protein Representations", enviado de forma anónima a ICLR 2027. El objetivo del trabajo es separar, en la evaluación de codificadores de proteínas, la señal que aprende el modelo de la información que ya está presente en la entrada o que introduce el propio protocolo de evaluación.

El repositorio cubre 33 codificadores (9 declarados de secuencia, 19 de estructura y 5 multimodales) evaluados sobre 21 sondas construidas a partir de dominios CATH 4.3 y sobre diez tareas downstream. Incluye además cohortes de confirmación sobre CATH 4.4, una tarea de interfaz reconstruida a partir de MaSIF-site, un atlas del espacio latente y controles de ablación de modalidad para ESM3 y SaProt. El tamaño total del repositorio es de 193,3 GB según la ficha de Hugging Face, con 3.040 archivos y 180,3 GB declarados en la model card.

Es relevante ahora porque ofrece un marco reproducible para auditar qué información leen realmente los codificadores de proteínas, un problema metodológico recurrente en la literatura de protein embeddings. No obstante, conviene subrayar que se trata de un release de material suplementario de un paper anónimo en revisión, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de embeddings y pesos de 33 codificadores; no es un modelo único) |
| Parametros totales | no disponible (depende del codificador; el panel incluye desde ESM2-8M hasta ESM2-3B y codificadores de estructura como GVP, GCPNet y MACE) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: dominio de proteínas) |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explícita; se citan checkpoints con `SHA256SUMS` y embeddings almacenados como arrays (HDF5 para etiquetas de sondas: `probing_data/labels.h5`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrupa los pesos preentrenados y las representaciones congeladas de 33 codificadores de proteínas. Según la auditoría de entradas incluida, 10 codificadores no leen coordenadas (solo secuencia) y 23 sí las leen (coordinate-reading). El único codificador cuya clase medida difiere de la declarada es ProstT5, declarado multimodal y leído únicamente por su pista de aminoácidos. La auditoría de cadenas laterales identifica tres codificadores que leen átomos más allá del CB.

El material de evaluación se organiza en diez tareas downstream con embeddings pooled (2.237 archivos, 7,4 GB), un conjunto de sondas sobre 19.461 dominios CATH 4.3 (111,6 GB en 101 archivos), una variante `vframe` que conserva la dirección de los canales vectoriales para GVP, GCPNet (aleatorio y preentrenado) y MACE, controles de ablación de modalidad para ESM3 y SaProt (con estructura eliminada y con tokens 3Di barajados), cohortes de confirmación sobre CATH 4.4 (cohortes A y B) y proteínas downstream nunca usadas en desarrollo. No se detallan en la información disponible los volúmenes de datos de preentrenamiento de cada codificador, ni si hubo RLHF o DPO, dado que se reutilizan pesos de terceros.

## Capacidades

- Almacenamiento y distribución de embeddings de proteínas congelados para 33 codificadores sobre diez tareas downstream.
- Embeddings por residuo y pooled sobre 19.461 dominios CATH 4.3 para evaluación mediante sondas estructurales.
- Auditoría de entradas a nivel de encoders, de átomos y de cadenas laterales (archivos CSV `encoder_input_audit.csv`, `encoder_atom_audit.csv`, `encoder_sidechain_audit.csv`).
- Controles de ablación de modalidad: ESM3 y SaProt sin entrada estructural, y SaProt con tokens 3Di barajados.
- Tarea de interfaz a nivel de residuo reconstruida a partir de MaSIF-site.
- Atlas del espacio latente con mapas 2D, pureza k-NN y CKA por capa y tarea.
- Pesos preentrenados de seis codificadores de estructura con licencias y sumas de verificación SHA256.
- No se documentan capacidades de generación de texto, tool calling, agentes ni multilingüismo, por no ser el propósito del repositorio.

## Casos de uso

- Evaluación metodológica de codificadores de proteínas: usar las sondas CATH 4.3 y los registros de auditoría para determinar qué parte del rendimiento de un encoder proviene de la secuencia y qué parte de la estructura, evitando atribuir a la arquitectura señal ya presente en la entrada.
- Reproducción de resultados del paper ProtCompass: los scripts y tablas de resultados están enlazados en el repositorio de código anónimo, y los embeddings permiten recalcular las comparaciones sin reejecutar la extracción.
- Comparación de codificadores en tareas downstream: los embeddings pooled de las diez tareas permiten entrenar cabezas ligeras y comparar 33 encoders bajo un protocolo idéntico, con manifiestos por tarea (`extract/manifest/<task>.csv`) que incluyen id, split, secuencia, fichero de estructura y etiqueta.
- Validación fuera de distribución: las cohortes de confirmación sobre dominios CATH 4.4 ausentes de CATH 4.3 y las proteínas downstream no vistas permiten comprobar si las conclusiones se mantienen en datos no usados durante el desarrollo.
- Análisis de representaciones en el espacio latente: el atlas (`atlas/data_v4/`) con pureza k-NN y CKA por capa sirve para estudiar qué capas codifican propiedades estructurales y cómo se alinean distintas arquitecturas.
- Estudio de sensibilidad a la modalidad de entrada: los controles de ablación de ESM3 y SaProt permiten cuantificar cuánto del rendimiento depende de la estructura frente a la secuencia, útil para decidir qué codificador desplegar cuando no se dispone de estructuras predichas.
- Reutilización de pesos de codificadores de estructura: los checkpoints de seis encoders con licencias y `SHA256SUMS` permiten inicializar modelos propios con verificación de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el diseño experimental (33 encoders, 21 sondas sobre CATH 4.3, diez tareas downstream, cohortes de confirmación en CATH 4.4) y remite las tablas de resultados al repositorio de código anónimo, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni métricas equivalentes de proteínas.

## Requisitos de hardware

- El repositorio completo ocupa 193,3 GB (180,3 GB declarados en la model card), por lo que se recomienda almacenamiento en disco de al menos 250 GB para trabajar con comodidad.
- El subconjunto de embeddings de sondas (`probing_embeddings/`) suma 111,6 GB en 101 archivos; el de tareas downstream, 7,4 GB en 2.237 archivos.
- Los checkpoints de los seis codificadores de estructura ocupan solo 0,16 GB, por lo que la inferencia con esos pesos es viable en GPU consumer, aunque no se especifican requisitos de VRAM en la información disponible.
- No se detallan GPU recomendadas (A100, H100, RTX 4090) ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) en la información proporcionada.
- No se proporcionan estimaciones de latencia ni throughput.

## Comparativa con modelos similares

| Repositorio | Contenido | Cobertura | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProtCompass_Embeddings | Embeddings, etiquetas, auditoría de entradas y pesos de 6 codificadores de estructura | 33 encoders, 21 sondas CATH 4.3, 10 tareas downstream | MIT | Hugging Face, 193,3 GB |
| ProtEnv (del mismo autor) | Estructuras predichas para cuatro tareas downstream | 4 tareas | no disponible | Hugging Face Datasets |
| Repositorio de código ProtCompass | Código, tablas de resultados y scripts de análisis | Soporte del paper | no disponible | anonymous.4open.science |

No se dispone de información sobre otros repositorios comparables de embeddings de proteínas con auditoría de entradas en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio corresponde a un envío anónimo a ICLR 2027 en revisión; los resultados y el material pueden cambiar antes de la versión final.
- La model card indica que una release anterior fue eliminada; conviene verificar la integridad de los archivos descargados con `SHA256SUMS` cuando estén disponibles.
- No se especifican sesgos conocidos ni tasas de alucinación, por no tratarse de un modelo generativo.
- No se documentan limitaciones de contexto ni de idioma, ya que el dominio es proteínas y no texto.
- La licencia MIT se declara en la ficha y en la model card, pero las licencias individuales de los pesos de terceros incluidos en `checkpoints/` deben consultarse por separado antes de uso comercial.
- El tamaño del repositorio (193,3 GB) y el número de archivos (3.040) pueden dificultar la descarga y el versionado en entornos con almacenamiento limitado.
- No se proporcionan métricas de rendimiento en la información disponible, por lo que no es posible evaluar la calidad de los codificadores sin acudir al repositorio de código.

## Enlaces

- Hugging Face: https://huggingface.co/Anonymoususer2223/ProtCompass_Embeddings
- Dataset de estructuras predichas ProtEnv: https://huggingface.co/datasets/Anonymoususer2223/ProtEnv
- Código, tablas de resultados y scripts de análisis: https://anonymous.4open.science/r/ProEmbedEva-C4F6
