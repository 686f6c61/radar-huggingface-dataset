# ryankim17920/mechanistic-sps-extra

## Resumen

`ryankim17920/mechanistic-sps-extra` no es un modelo listo para inferencia, sino un repositorio de artefactos de investigación: los checkpoints intermedios y las «escaleras» de embeddings empleados en dos análisis del artículo *Which State Should Prediction Read? A Mechanistic Analysis of State–Prediction Separation*. Lo publica Ryan Kim (ryankim17920) bajo licencia MIT y está vinculado al repositorio principal `ryankim17920/mechanistic-sps`, que contiene los checkpoints finales de todos los modelos del artículo; este repositorio añade únicamente lo que esos dos análisis necesitan más allá de los finales.

El material sirve a dos estudios concretos: la trayectoria de entrenamiento del conflicto de gradientes entre el flujo de estado y el flujo de predicción, y la divergencia entre la tabla de embeddings de predicción y la tabla de tokens de estado. Los modelos subyacentes son transformadores «two-tower» (dos torres, 12+12 y 6+6 según el brazo) entrenados hasta 20.000 millones de tokens sobre `HuggingFaceFW/fineweb-edu` tokenizado, en inglés.

Es relevante ahora porque publica la trayectoria completa de entrenamiento (puntos de 1, 2, 3, 4, 6, 8, 12 y 16 mil millones de tokens, más los finales) para arquitecturas con separación estado–predicción, un material escaso en la literatura de interpretabilidad mecanicista y necesario para replicar los apéndices de conflicto de gradientes y de divergencia de embeddings. El repositorio ocupa 32,9 GB y no incluye tarjeta de pipeline, demos ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con separacion estado–prediccion (state–prediction separation, SPS); variantes two-tower 12+12 (atencion compartida en el brazo `tiedattn`) y sequential 6+6 |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; los ficheros son checkpoints de entrenamiento `.pt`) |
| Idiomas soportados | en (corpus de entrenamiento en ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt`; dict de checkpoint de entrenamiento sin estado del optimizador (`model` state_dict, `model_args`, `config`, `iter_num`, ...) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu (tokenizado) |
| Tokens de entrenamiento | Hasta 20.000.145.408 tokens por ejecucion |
| Tamano del repositorio | 32,9 GB |
| Brazos publicados | `s_two_tower_w0_equal_tiedattn_20b`, `s_two_tower_afsps_20b`, `s_two_tower_seq6_20b`, `s_two_tower_seq6_20b_seed2` |
| Puntos de la escalera | 1, 2, 3, 4, 6, 8, 12 y 16 mil millones de tokens (el punto de 20B esta en el repo principal) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-28 |

## Arquitectura y entrenamiento

Los modelos son transformadores con separacion estado–prediccion: en lugar de un unico flujo que produce el estado oculto y alimenta la cabeza de prediccion, se mantienen dos flujos diferenciados, y el articulo estudia cual de ellos debe leer la prediccion. Los brazos publicados aqui son dos: `s_two_tower_w0_equal_tiedattn_20b`, un two-tower de 12+12 capas donde unicamente la atencion esta compartida entre torres (`tiedattn`), y `s_two_tower_seq6_20b` junto con su replica `s_two_tower_seq6_20b_seed2`, un esquema secuencial 6+6 con dos semillas. Se incluye ademas `s_two_tower_afsps_20b`, etiquetado por el autor como AF-SPS antes del «faithful split» y explicitamente no asignado a ningun brazo del articulo.

El entrenamiento llega a 20.000 millones de tokens sobre FineWeb-Edu tokenizado, en ingles. El repositorio no documenta la composicion del dataset mas alla del identificador, ni si hubo RLHF o DPO, ni el numero exacto de parametros, la longitud de contexto o el vocabulario. La innovacion metodologica no esta en el modelo sino en la instrumentacion: se publican escaleras de checkpoints cada mil millones de tokens para reconstruir el conflicto de gradientes entre estado y prediccion a lo largo del entrenamiento (incluido el punto de ramificacion previo al decaimiento de learning rate en 18B), y ficheros `emb_ladder.pt` que contienen las tablas de estado S (`transformer.wte.weight`), prediccion P (`predict_wte.weight`) y cabeza LM H (`lm_head.weight`) de los 21 checkpoints de cada semilla, para medir la divergencia entre S y P. Cada carpeta de ejecucion incluye un `config.json` con argumentos de modelo, configuracion de entrenamiento y el tamano y sha256 de cada fichero; las curvas de perdida de todas las ejecuciones estan en `scripts/analysis/results/ledger.jsonl` del repositorio de codigo.

## Capacidades

- No es un modelo para uso generativo directo: el repositorio distribuye pesos de checkpoints intermedios de entrenamiento, sin pipeline de inferencia declarado ni pesos finales desplegables (estos ultimos estan en el repositorio principal).
- Analisis de conflicto de gradientes estado–prediccion a lo largo de la trayectoria de entrenamiento (`scripts/analysis/a17_trajectory.py partB --arm tiedattn` y `--arm afsps`).
- Analisis de divergencia de embeddings entre la tabla de prediccion y la tabla de estado (`scripts/analysis/a21_emb_divergence.py`), usando los ficheros `emb_ladder.pt`.
- Reconstruccion de la evolucion de las tablas S, P y H checkpoint a checkpoint (cada 1B tokens, punto de ramificacion previo al decaimiento en 18B y final) para dos semillas independientes.
- Inspeccion de los efectos de compartir unicamente la atencion entre torres (`tiedattn`) frente a otras configuraciones.
- Verificacion de integridad de artefactos mediante los hashes sha256 publicados en cada `config.json`.
- Generacion de texto, tool calling, agentes, vision, audio, modo «thinking» y capacidades multilingues: no disponibles / no declaradas en la informacion proporcionada.

## Casos de uso

- Replicacion del apendice «Gradient Alignment» del articulo: cargando la escalera de `s_two_tower_w0_equal_tiedattn_20b` con `a17_trajectory.py partB --arm tiedattn` se reproduce la curva de coseno de gradientes entre el flujo de estado y el de prediccion a 1, 2, 3, 4, 6, 8, 12 y 16 mil millones de tokens, y se completa con el checkpoint final de 20B del repositorio principal.
- Analisis de divergencia de embeddings: con `a21_emb_divergence.py` y los ficheros `emb_ladder.pt` (9,74 GB cada uno) se mide si la tabla de prediccion P se separa de la tabla de estado S y de la cabeza LM H a lo largo de los 21 checkpoints de cada semilla.
- Estudio de robustez entre semillas: `s_two_tower_seq6_20b` y `s_two_tower_seq6_20b_seed2` permiten comprobar si un efecto observado en la divergencia S/P se reproduce con otra inicializacion, un control pre-registrado del apendice «Depth, Input and Pre-Registered Controls».
- Analisis del regimen previo al decaimiento de learning rate: la escalera incluye el punto de ramificacion en 18B tokens ademas de los puntos cada 1B, lo que permite separar el efecto del decaimiento de la evolucion normal de las tablas.
- Comparacion de variantes arquitectonicas: los brazos `tiedattn` (12+12, atencion compartida) y `afsps` (0,52 GB por checkpoint frente a 1,09 GB del anterior) permiten contrastar dos disenos de separacion estado–prediccion con el mismo presupuesto de datos.
- Auditoria y verificacion de artefactos de investigacion: los sha256 y los `config.json` de cada carpeta permiten validar la integridad de los pesos y citar la procedencia exacta de cada medida en una replicacion.
- Punto de partida para experimentos propios de interpretabilidad mecanicista: los checkpoints son state_dicts estandar de PyTorch, reutilizables con el codigo de `github.com/RyanKim17920/mechanistic-sps` y un corpus FineWeb-Edu tokenizado en `DUALSPS_DATA_ROOT`.
- Docencia y divulgacion de tecnicas de analisis de trayectorias de entrenamiento: la escalera permite ilustrar como se instrumenta un entrenamiento para estudiar conflicto de gradientes sin reentrenar los modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones tipo MMLU, HumanEval o GSM8K; las unicas metricas publicadas son las curvas de perdida de entrenamiento, disponibles en `scripts/analysis/results/ledger.jsonl` del repositorio de codigo, y las medidas derivadas de los dos analisis mecanicistas (conflicto de gradientes y divergencia de embeddings), cuyos valores no se detallan en la model card.

## Requisitos de hardware

- Espacio en disco: el repositorio completo ocupa 32,9 GB. Desglose aproximado por brazo: la escalera `tiedattn` son 8 ficheros de 1,09 GB (unos 8,7 GB); la escalera `afsps` son 8 ficheros de 0,52 GB mas el final de 0,52 GB (unos 4,7 GB); cada `emb_ladder.pt` ocupa 9,74 GB y hay dos (unos 19,5 GB).
- Memoria para cargar los pesos: un state_dict en precision completa necesita del orden del tamano del fichero en RAM o VRAM, mas el overhead de activaciones, del tokenizador y del cargador de datos. Para los brazos `afsps` (0,52 GB) basta con una GPU de gama media; para los brazos `tiedattn` (1,09 GB) sigue siendo un requisito modesto.
- Cabe en GPU de consumo: con los tamanos de fichero indicados, los checkpoints son cargables en GPUs de consumo tipo RTX 3060/4070/4090; el limite practico no es la VRAM de los pesos sino los 9,74 GB por fichero `emb_ladder.pt` y el almacenamiento total.
- GPU recomendadas: no se especifican en el repositorio. Para cargar y evaluar los checkpoints, cualquier GPU con suficiente memoria para el state_dict y los lotes de evaluacion es suficiente; no se requiere hardware de datacenter solo por el modelo.
- Opciones de despliegue: no se soportan vLLM, TGI, Ollama ni llama.cpp, ya que no hay pesos finales en formato safetensors ni GGUF ni un pipeline declarado. La ruta prevista por el autor es clonar `github.com/RyanKim17920/mechanistic-sps`, definir `DUALSPS_DATA_ROOT` apuntando a FineWeb-Edu tokenizado y ejecutar los scripts de analisis.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

No hay modelos publicos directamente equivalentes en cuanto a arquitectura (transformadores con separacion estado–prediccion). La comparacion con suites de checkpoints abiertas para interpretabilidad es cualitativa, porque los parametros y el contexto de este repositorio no se han publicado.

| Proyecto | Proposito | Checkpoints publicados | Dataset | Licencia | Datos de parametros |
|---|---|---|---|---|---|
| `ryankim17920/mechanistic-sps-extra` (este repo) | Artefactos para dos analisis mecanicistas de separacion estado–prediccion | Escaleras de 8 puntos (1B–16B) y finales de 20B en el repo principal; `emb_ladder` de 21 puntos | FineWeb-Edu tokenizado (en) | MIT | no disponible |
| `ryankim17920/mechanistic-sps` (repo principal) | Checkpoints finales de todos los modelos del articulo | Finales | FineWeb-Edu tokenizado (en) | MIT | no disponible |
| Pythia (EleutherAI) | Suite de checkpoints intermedios para interpretabilidad | 154 checkpoints por modelo en 8 tamanos | The Pile (en) | Apache-2.0 | 70M a 12B |
| OLMo 2 (Allen Institute for AI) | Modelos abiertos con datos, codigo y checkpoints intermedios | Checkpoints intermedios por modelo | Dolma | Apache-2.0 | 1B, 7B y 13B |

## Limitaciones y advertencias

- No es un modelo desplegable: no hay pesos finales en este repositorio, ni pipeline de inferencia, ni formatos safetensors o GGUF, ni soporte en frameworks de servido. Su uso previsto es el analisis con el codigo del autor.
- Cobertura limitada: la escalera de `tiedattn` llega hasta 16B tokens en este repositorio; el punto de 20B esta en el repositorio principal, por lo que un analisis completo requiere descargar ambos.
- El brazo `s_two_tower_afsps_20b` no corresponde a ningun brazo del articulo (AF-SPS antes del «faithful split») y su checkpoint final no esta en ningun otro repositorio; no debe interpretarse como resultado publicado del articulo.
- Idioma unico: el entrenamiento usa FineWeb-Edu en ingles, por lo que cualquier analisis linguístico se restringe a ese idioma y dominio (contenido educativo filtrado), con el sesgo de distribucion que ello implica.
- Aviso de procedencia: la model card indica que en estos checkpoints las rutas de `config` leen `${DATA_ROOT}` y que `provenance` omite el nombre del host y el identificador de trabajo, lo que dificulta la trazabilidad de la ejecucion original.
- Riesgo de alucinacion y sesgos: no evaluables, ya que no se publican evaluaciones de calidad de generacion ni analisis de sesgos. El articulo citado tiene enlace de arXiv pendiente de publicacion, de modo que las afirmaciones metodologicas no son verificables de forma independiente en el momento de redactar esta ficha.
- Licencia MIT: permite uso comercial y modificacion, pero al tratarse de artefactos de investigacion sin garantias, el autor no ofrece soporte ni mantenimiento (0 descargas y 0 likes en el momento de la consulta).
- Requisito de datos: ejecutar los scripts exige disponer de FineWeb-Edu tokenizado y configurar `DUALSPS_DATA_ROOT`; sin ese corpus los checkpoints no son directamente utilizables con el codigo.
- Los resultados de busqueda incluyen un articulo sobre «State-Conditioned Latent Steering» (SPS) en razonamiento; se trata de un uso distinto de la sigla y no debe confundirse con la separacion estado–prediccion de este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ryankim17920/mechanistic-sps-extra
- Repositorio principal con los checkpoints finales: https://huggingface.co/ryankim17920/mechanistic-sps
- Codigo del proyecto: https://github.com/RyanKim17920/mechanistic-sps
- Perfil del autor en HuggingFace: https://huggingface.co/ryankim17920
- Perfil del autor en GitHub: https://github.com/RyanKim17920
- Pagina de proyectos del autor: https://ryankim17920.github.io/projects/
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Articulo del autor sobre state-conditioned latent steering (sigla SPS con otro significado, no confirmado como trabajo relacionado): https://arxiv.org/html/2609.24066
- Paper del articulo *Which State Should Prediction Read? A Mechanistic Analysis of State–Prediction Separation*: enlace de arXiv pendiente de publicacion segun la model card (no disponible)
