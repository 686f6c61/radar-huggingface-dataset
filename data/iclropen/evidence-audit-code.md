# iclropen/evidence-audit-code

## Resumen

`iclropen/evidence-audit-code` no es un modelo de lenguaje en sentido estricto, sino el repositorio de material suplementario del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. Contiene el codigo de entrenamiento y evaluacion, los identificadores de datos, los resultados por pregunta y los scripts que reconstruyen las tablas y figuras del paper. Los adaptadores LoRA entrenados se publican en repositorios separados bajo el mismo prefijo `iclropen/evidence-audit---<setting>-s<seed>`.

El trabajo aborda el *video temporal grounding* (localizacion de intervalos temporales en video a partir de una consulta en lenguaje natural) y propone una auditoria de dependencia de evidencia: medir si el modelo acierta por haber visto el intervalo relevante o por atajos espurios. Para ello introduce objetivos de entrenamiento con control de placebo (GroupDRO con terminos de aleatorizacion y *hinge*) y evaluadores de precision y de comportamiento. El repositorio incluye asimismo los entrenadores de las lineas base GRPO por IoU y mDPO, ademas de utilidades para forzar la implementacion de atencion (por ejemplo FlashAttention-2) y para detectar adaptadores que se cargan como *no-op*.

La relevancia actual reside en que expone una metodologia reproducible para auditar modelos multimodales de video, con dos pilas de software declaradas (transformers 5.12 y 4.51.3) y un conjunto de datos y resultados verificables. El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos no se alojan aqui sino en los repositorios de adaptadores asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de codigo y resultados; los adaptadores LoRA se basan en modelos externos como Qwen2.5-VL-7B-Instruct y TimeLens-8B) |
| Parametros totales | No disponible (depende del modelo base de cada adaptador) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en este repositorio (adaptadores PEFT/LoRA en repositorios separados; se mencionan claves de transformers 4.51 y 5) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red propia: agrupa entrenadores y evaluadores para adaptadores LoRA sobre modelos multimodales de video. Los entrenadores principales son `code/27_papo_train_qcdro_v3seln_r5.py` (objetivo con control de placebo, SFT, ablaciones y esquema en dos etapas), `code/27_papo_train_qcdro_v3seln_mdpo1.py` (linea base estilo mDPO, sin pesos publicados) y `code/27_papo_train_qcdro_v3seln_tsonly.py` (solo *tokens* de marca temporal). Para las lineas base de RL se incluyen `code/29_grpo_native_iou.py` (IoU-GRPO a 2 fps) y `code/30_grpo_plus_placebo.py` (IoU-GRPO con termino de placebo, `--lam 0.01`).

El entrenamiento parte de `data_ids/training_pairs_pool_8434.jsonl`, identico al archivo usado en los experimentos (`qcdro_v2_pairs_train.jsonl`), y los ejemplos de invocacion limitan a las primeras 2.400 parejas (`--limit 2400`). El objetivo principal combina GroupDRO con estandarizacion por grupo (`--dro-group-standardize`), hiperparametros `--alpha 0.5 --beta 0.1`, acumulacion de gradiente 8, `lr 5e-6`, ratio de aleatorizacion 1.25, holgura 0.10 y *hinge* 1.0, con operaciones de aumento `swap,mask,blur,tshift,shuffle`. Se documentan variantes de prompt y respuesta por modelo base (`timer1_default`/`timer1`, `timelens`, `vchat`) y ajustes especificos como `--image-patch-size 16` para TimeLens-8B o `--init-adapter` para el esquema en dos etapas.

Una innovacion tecnica destacable es la infraestructura de auditoria: `readers/` convierte las salidas por pregunta en las cantidades reportadas mediante *bootstrap* sobre videos, y `tables_and_figures/make_all.py` reconstruye todas las tablas y figuras de datos desde `results/`. Ademas, `tools/check_lora_keys.py` detecta adaptadores entrenados con transformers 4.51 que transformers 5 cargaria silenciosamente como *no-op*, y `tools/convert_adapter_tf5keys.py` migra las claves del adaptador entre ambas versiones.

## Capacidades

- Entrenamiento de adaptadores LoRA para *video temporal grounding* con objetivos con control de placebo (GroupDRO) y lineas base SFT, mDPO y GRPO por IoU.
- Auditoria de dependencia de evidencia: evaluacion de si el acierto se debe a la evidencia visual o a atajos, mediante conjuntos de preguntas de auditoria y de generacion, sorteos de placebo y emparejamientos de consultas.
- Evaluacion de precision y de comportamiento con evaluadores separados para cada pila de software (`tf5meta`, `tf451`).
- Analisis estadistico con *bootstrap* sobre videos a traves de los lectores de `readers/`.
- Reconstruccion reproducible de tablas y figuras del paper desde los resultados por pregunta.
- Soporte de atencion forzada a una implementacion concreta (por ejemplo FlashAttention-2) mediante `setup/attn_launch.py`.
- Utilidades de verificacion y conversion de adaptadores PEFT entre versiones de transformers.
- Generacion de trabajos para experimentos de respuesta a revisores (`rebuttal/`), incluida una muestra independiente de 600 preguntas de auditoria (`indep600_qids.json`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, audio ni *tool calling* propias de este repositorio.

## Casos de uso

- Reproduccion de resultados de investigacion: un grupo que quiera verificar las tablas 1-3 del paper puede ejecutar `cd tables_and_figures && python make_all.py` sobre `results/` y obtener las mismas cifras sin reentrenar.
- Auditoria de modelos de grounding de terceros: los evaluadores de `code/` y los lectores de `readers/` permiten medir dependencia de evidencia en un modelo propio aplicando los mismos conjuntos de preguntas y sorteos de placebo.
- Entrenamiento de adaptadores con control de placebo: usar `code/27_papo_train_qcdro_v3seln_r5.py` con `--objective groupdro --npole --dro-group-standardize` para ajustar un LoRA sobre un modelo base multimodal y comparar contra SFT puro (`--objective mean --alpha 1.0 --beta 1e-9`).
- Linea base de RL para grounding: `code/29_grpo_native_iou.py` con `setup/attn_launch.py flash_attention_2` permite entrenar IoU-GRPO a 2 fps sobre las 2.400 parejas de entrenamiento.
- Depuracion de pipelines PEFT: `tools/check_lora_keys.py --adapter <repo> --base Qwen/Qwen2.5-VL-7B-Instruct --load` detecta adaptadores que se cargan como *no-op* antes de lanzar una evaluacion costosa.
- Migracion de adaptadores entre versiones: `tools/convert_adapter_tf5keys.py` convierte un adaptador de transformers 4.51 a las claves de transformers 5 para reutilizarlo en la pila nueva.
- Preparacion de experimentos en cluster: los generadores de `rebuttal/**/mk_*_jobs.py` producen ficheros de trabajos a partir de `WORK_ROOT`, `DATASETS_ROOT` y `SETUP_DIR`, utiles para replicar la respuesta a revisores en nodos A100 80GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene los resultados por pregunta y los lectores que generan las tablas del paper, pero las cifras concretas no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base de cada adaptador (se mencionan Qwen2.5-VL-7B-Instruct y TimeLens-8B como bases).
- GPU recomendadas: los nodos 7-9 de los experimentos de respuesta a revisores son A100 80GB; los nodos 1-6 corresponden a las maquinas de los experimentos del paper (modelos concretos no disponibles).
- GPU de consumo: no disponible. Un modelo base de 7-8B en cuantizacion de 4 bits requeriria del orden de 5-6 GB solo para pesos, pero no se confirma en la informacion.
- Despliegue: no se documentan opciones de servido (vLLM, llama.cpp, Ollama, TGI). El repositorio esta orientado a ejecucion de scripts de entrenamiento y evaluacion con PyTorch y PEFT.
- Pilas de software: `requirements-tf5.txt` (transformers 5.12), `requirements-tf451.txt` (transformers 4.51.3) y `requirements-analysis.txt` (solo CPU para lectores, tablas y figuras).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio es material suplementario de un paper y no un modelo con benchmarks propios; los adaptadores asociados se comparan internamente contra SFT, mDPO e IoU-GRPO dentro del propio trabajo, pero no se dispone de cifras ni de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: es codigo, identificadores de datos y resultados. Los adaptadores estan en repositorios separados.
- El paper esta en revision (ICLR 2027); los resultados y conclusiones pueden cambiar antes de la publicacion.
- El entrenador del *baseline* IoU-GRPO de 16 fotogramas no se incluye; solo sus pesos (`iclropen/evidence-audit-qwen7b-iougrpo-16frames-step700-s0`).
- Los pesos del *baseline* estilo mDPO no se publican, solo el entrenador.
- Riesgo operativo documentado: un adaptador entrenado con transformers 4.51 cargado en transformers 5 se convierte en un *no-op* silencioso; es obligatorio ejecutar `tools/check_lora_keys.py` antes de cualquier evaluacion.
- Cada adaptador debe cargarse en la pila de software que indica su model card; mezclar pilas invalida los resultados.
- Los scripts dependen de variables de entorno (`DATA_ROOT`, `WORK_ROOT`, `DATASETS_ROOT`, `LOCAL_ROOT`, `SETUP_DIR`, `CHARADES_TEST_ANNO`); los generadores de trabajos exigen rutas absolutas.
- Se requiere descargar Charades-STA (anotaciones y videos `Charades_v1_480/`) para los scripts de grounding.
- Sesgos, alucinacion y limitaciones de idioma del modelo base subyacente: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial del codigo, pero no se especifican condiciones adicionales sobre los datos de terceros (Charades-STA) ni sobre los pesos de los adaptadores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iclropen/evidence-audit-code
- Adaptador IoU-GRPO 16 fotogramas: https://huggingface.co/iclropen/evidence-audit-qwen7b-iougrpo-16frames-step700-s0
- Repositorios de adaptadores (patron): `iclropen/evidence-audit---<setting>-s<seed>`
- Paper, blog, demo y repositorio de codigo independiente: no disponibles en la informacion proporcionada.
