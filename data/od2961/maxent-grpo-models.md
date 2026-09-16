# od2961/maxent-grpo-models

## Resumen

`od2961/maxent-grpo-models` no es un modelo único, sino una colección de artefactos de investigación publicada en HuggingFace: 856 exportaciones de modelos verificadas (de 911 registros científicos seleccionados) procedentes de 29 estudios sobre métodos de aprendizaje por refuerzo para modelos de lenguaje. El autor es el usuario `od2961`, y la colección se presenta como el material adjunto de los papers ModeBench y Re:MaxRL, orientados a estudiar corrección y soporte de salida verificado en modelos ajustados para tareas de terminal.

Los modelos de base sobre los que se construyen los distintos estudios son Qwen2.5-0.5B-Instruct, Falcon3-1B y Qwen2.5-3B, siempre en variantes Instruct. Los estudios comparan variantes de GRPO (plain GRPO, UCPO, Sparse RLEP-Dr) con métodos propios basados en MaxEnt (Adaptive Semantic-MaxEnt, RMS-targeted Semantic-MaxEnt, Bank-normalized verified replay, Full open-bank MaxEnt replay, bounded explorer-starvation fallback) y con esquemas de replay uniforme frente a replay de frecuencia fresca.

Su relevancia es principalmente metodológica y de reproducibilidad: cada exportación queda fijada a un commit inmutable con `commit_sha` y `repo_prefix` en `catalog.json`, y el repositorio incluye manifiestos `ARCHIVE_MANIFEST.json` con tamaños y SHA-256 de cada fichero, de modo que un tercero puede restaurar exactamente el modelo asociado a un resultado concreto. La licencia global del repositorio no está declarada; solo se documenta la licencia del modelo base en el caso de Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de los modelos base: Qwen2.5 y Falcon3); no se documentan modificaciones arquitectonicas |
| Parametros totales | Variable segun export: 0,5B (Qwen2.5-0.5B-Instruct), 1B (Falcon3-1B) y 3B (Qwen2.5-3B); no es un modelo unico |
| Parametros activos | No aplica (no se describe ninguna variante MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors (precision declarada no disponible) |
| Idiomas soportados | No disponible |
| Licencia | No disponible a nivel de repositorio; se documenta Apache License 2.0 para el modelo base Qwen2.5-0.5B-Instruct con atribucion a Alibaba |
| Formato de pesos | safetensors (libreria transformers), con configuracion y tokenizer incluidos en cada exportacion |
| Tamano del repositorio | 2168,7 GB |
| Numero de exportaciones | 856 verificadas de 911 registros cientificos seleccionados; 55 registros sin pesos disponibles (E95) |
| Estudios incluidos | 29 (E78, E79, E80-R1, E118, E119, E120-R1, E89, E91, E92, E90, E102, E103, E95, E114, E97, E99, E115, E98-R1, E100, E116, E81, E82, E83, E85, E86, E87, E109, E112-R1, E121) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de red no se describe en la informacion disponible: cada exportacion hereda la arquitectura de su modelo base (Qwen2.5-0.5B-Instruct, Falcon3-1B o Qwen2.5-3B), todos ellos transformers decoder-only. Lo especifico de esta coleccion es el procedimiento de ajuste, no la topologia. Los estudios giran en torno a aprendizaje por refuerzo con recompensa verificable: variantes de GRPO (plain GRPO, UCPO, Sparse RLEP-Dr) y metodos derivados de MaxEnt semantico, evaluados en cohortes cruzadas de escala (0,5B, 1B y 3B) y en factorias de cuatro metodos (E119, nivel 2). Los experimentos cubren tambien esquemas de replay: replay verificado, replay uniforme frente a replay de frecuencia fresca (E120-R1), replay normalizado por banco (E90), replay de banco abierto completo (E102) y un fallback acotado por inanicion del explorador (E103).

Los nombres de los estudios sugieren dominios concretos de entrenamiento, entre ellos Python (E109, "repaired Python replay comparators") y un dominio de planificacion llamado PantryPlan (E85, "PantryPlan semantic-interface repairs"). No se proporcionan cifras de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO adicional. La innovacion tecnica destacable es de infraestructura y reproducibilidad: cada exportacion esta fijada a un commit inmutable y acompanada de un manifiesto con tamanos y SHA-256, de manera que se puede restaurar un modelo concreto sin descargar el repositorio completo mediante `snapshot_download(..., revision=commit_sha, allow_patterns=[repo_prefix + "/*"])`. Los exports incluyen pesos, configuracion y tokenizer, pero no el estado del optimizador ni los bancos de replay en linea.

## Capacidades

- Generacion de texto instructiva y ajuste por refuerzo para tareas de terminal, partiendo de Qwen2.5-0.5B-Instruct, Falcon3-1B y Qwen2.5-3B Instruct.
- Produccion de salidas verificables en dominios concretos de los estudios (por ejemplo, Python en la serie E109 y el dominio PantryPlan en E85).
- Razonamiento de multiples pasos orientado a tareas con verificador externo, ya que los metodos estudiados dependen de "verified replay" y de bancos de ejemplos verificados.
- Ejecucion de codigo y reparacion de interfaces semanticas, segun los nombres de estudio disponibles.
- Compatibilidad con `endpoints_compatible` en HuggingFace, es decir, invocacion mediante la Inference Endpoints API.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Vision, audio o modo "thinking" explicito: no documentado en la informacion disponible.

## Casos de uso

- Reproduccion de resultados de investigacion: descargar la exportacion exacta asociada a una celda experimental (por ejemplo, E119 o E120-R1) fijando `revision=commit_sha` y verificar los SHA-256 del `ARCHIVE_MANIFEST.json` antes de ejecutar cualquier evaluacion; es el uso principal para el que se ha publicado esta coleccion.
- Estudio de metodos de RL con recompensa verificable: comparar en igualdad de condiciones variantes de GRPO (plain, UCPO, Sparse RLEP-Dr) frente a metodos basados en MaxEnt semantico, usando las cohortes cruzadas de escala 0,5B/1B/3B ya entrenadas y archivadas.
- Ablaciones de estrategias de replay: emplear las exportaciones de E120-R1 (replay uniforme frente a frecuencia fresca), E90 (normalizado por banco) y E102 (banco abierto completo) para medir el efecto del muestreo de datos de replay sin repetir el coste de entrenamiento.
- Analisis de escalado entre 0,5B, 1B y 3B: usar E78, E79 y E80-R1 para estudiar como se comporta la retencion de capacidades al variar el tamano del modelo base con el mismo procedimiento de ajuste.
- Experimentos de ajuste ligero en una unica GPU: los exports de Qwen2.5-0.5B (aproximadamente 1 GB en bf16) caben en cualquier GPU consumer de 8 GB o mas, lo que permite iterar sobre prompts de dominio y verificadores sin infraestructura de datacenter.
- Evaluacion de robustez en generacion de codigo Python: usar la serie E109 para probar comparadores de replay reparados sobre tareas de codigo, comparando con las exportaciones originales del mismo estudio.
- Auditoria de artefactos cientificos: dado que 55 registros (todos de E95) no tienen pesos publicados, la coleccion permite estudiar que celdas experimentales quedan documentadas solo mediante metadatos y resultados admitidos, y cuales son restaurables extremo a extremo.
- Trazabilidad de modelos en pipelines internos: integrar `catalog.json` como inventario para fijar versiones de modelo por commit, de forma analoga a un lockfile, evitando que un cambio de pesos rompa un pipeline de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El repositorio remite a un README de benchmarks alojado en el dataset `od2961/ModeBench` (ruta `README.md` fijada al commit `93f2b5e57afa09803ac51f412bc2e262b3253f6e`), asi como a secciones de `data/`, `results/` y `reproducibility/` que no forman parte de la informacion proporcionada. Por tanto, no se incluyen cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y no se comparan numericamente con modelos similares.

## Requisitos de hardware

- VRAM estimada de inferencia (valores orientativos derivados del numero de parametros, no confirmados en la model card): Qwen2.5-0.5B en bf16 en torno a 1-1,5 GB; Falcon3-1B en bf16 en torno a 2-2,5 GB; Qwen2.5-3B en bf16 en torno a 6-7 GB. En cuantizacion de 8 bits o 4 bits las cifras se reducen aproximadamente a la mitad y a un cuarto respectivamente, pero el repositorio solo publica safetensors y no ofrece ficheros GGUF.
- GPU recomendadas: para los exports de 0,5B y 1B basta una RTX 3060/4060 o superior; para los de 3B es recomendable una RTX 4090, L4 o A10G; para entrenamiento o evaluacion masiva de las 856 exportaciones se necesitarian nodos con A100 o H100 y almacenamiento dedicado.
- Cabe en GPU consumer: si, al menos las variantes de 0,5B y 1B, y previsiblemente la de 3B en bf16 en GPUs con 8-12 GB de VRAM si se usa carga en 8 bits.
- Almacenamiento: el repositorio completo ocupa 2168,7 GB, por lo que la restauracion selectiva por `repo_prefix` y `revision` es imprescindible; descargar el repositorio entero es inviable en estaciones de trabajo convencionales.
- Opciones de despliegue: transformers como via principal; vLLM o TGI para servir las variantes de 1B y 3B; llama.cpp u Ollama solo si se convierten previamente los pesos a GGUF, ya que no se distribuyen en ese formato. El tag `endpoints_compatible` indica compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento para comparar, pero si se pueden comparar las tres familias de modelos base empleadas dentro de la propia coleccion.

| Modelo base | Parametros | Contexto | Licencia | Uso en la coleccion |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct | 0,5B | No disponible | Apache License 2.0 (atribucion a Alibaba) | Estudios de escala pequena: E78, E83, E81, E87 (3B), E97, E98-R1, E114 (3B) |
| Falcon3-1B | 1B | No disponible | No disponible | Estudios de escala intermedia: E79, E82, E86, E91, E99, E100 |
| Qwen2.5-3B | 3B | No disponible | No disponible | Estudios de escala superior: E80-R1, E87, E92, E114 |

Frente a otras colecciones de modelos ajustados con RL, la diferencia no esta en el rendimiento absoluto sino en el nivel de trazabilidad: 856 exportaciones con commit fijo, manifiesto SHA-256 y metadatos de estudio frente a las publicaciones habituales de un unico punto de control sin linaje experimental. No se conocen, con la informacion disponible, alternativas directamente equivalentes de colecciones de artefactos de RL con este volumen y este esquema de verificacion.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es una coleccion de artefactos de investigacion con 0 descargas y 0 likes en el momento de la consulta, y sin model card de uso general.
- Licencia no declarada a nivel de repositorio. La unica licencia documentada es Apache 2.0 para Qwen2.5-0.5B-Instruct; el resto de modelos base y los propios exports no tienen licencia explicitada en la informacion disponible, lo que impide asumir uso comercial sin verificar la procedencia.
- Riesgo alto de alucinacion y de degradacion fuera del dominio: los modelos estan ajustados sobre dominios y verificadores concretos (Python, PantryPlan) y con prompts de dominio especificos. La model card advierte expresamente de que debe preservarse el formato de prompt original, los ajustes de generacion y el verificador para reproducir resultados.
- Restriccion de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados; no se debe asumir el contexto completo del modelo base sin medirlo.
- Los exports no incluyen estado del optimizador ni bancos de replay en linea, por lo que no permiten reanudar entrenamiento, solo inferencia.
- 55 registros cientificos (todos de E95) no tienen pesos descargables: cualquier reproduccion que dependa de ellos es imposible con este repositorio.
- El repositorio pesa 2168,7 GB; la descarga indiscriminada es un riesgo operativo y de almacenamiento. Debe usarse restauracion selectiva por `commit_sha` y `repo_prefix`.
- Las fechas de creacion y actualizacion registradas (2026-09-11 y 2026-09-15) son posteriores a la fecha habitual de publicacion de modelos Qwen2.5 y Falcon3; conviene verificar la integridad de los commits antes de usarlos como referencia.
- No se documentan sesgos conocidos, evaluaciones de seguridad ni filtros de contenido. Cualquier despliegue orientado al usuario final requeriria una evaluacion propia.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los enlaces obtenidos corresponden a paginas de cronometros en linea y no guardan relacion con el repositorio, por lo que no aportan verificacion independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/od2961/maxent-grpo-models
- Dataset de benchmarks ModeBench: https://huggingface.co/datasets/od2961/ModeBench/blob/93f2b5e57afa09803ac51f412bc2e262b3253f6e/README.md
- Catalogo completo de exportaciones (referenciado en la model card): `catalog.json` dentro del propio repositorio
- Documentacion de datos: `data/README.md`
- Resultados: `results/README.md`
- Reproducibilidad: `reproducibility/README.md`
- Estudios individuales: `experiments/E78/README.md`, `experiments/E79/README.md`, `experiments/E80-R1/README.md`, `experiments/E118/README.md`, `experiments/E119/README.md`, `experiments/E120-R1/README.md`, `experiments/E89/README.md`, `experiments/E91/README.md`, `experiments/E92/README.md`, `experiments/E90/README.md`, `experiments/E102/README.md`, `experiments/E103/README.md`, `experiments/E95/README.md`, `experiments/E114/README.md`, `experiments/E97/README.md`, `experiments/E99/README.md`, `experiments/E115/README.md`, `experiments/E98-R1/README.md`, `experiments/E100/README.md`, `experiments/E116/README.md`, `experiments/E81/README.md`, `experiments/E82/README.md`, `experiments/E83/README.md`, `experiments/E85/README.md`, `experiments/E86/README.md`, `experiments/E87/README.md`, `experiments/E109/README.md`, `experiments/E112-R1/README.md`, `experiments/E121/README.md`
- Paper o articulo asociado: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible en la informacion proporcionada
