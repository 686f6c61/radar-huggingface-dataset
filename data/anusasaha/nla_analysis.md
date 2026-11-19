# anusasaha/NLA_analysis

## Resumen

`anusasaha/NLA_analysis` no es un modelo de lenguaje entrenado, sino un repositorio de codigo asociado a un articulo de investigacion titulado "Do Activation Explanations Survive Translation?". El repositorio contiene los scripts necesarios para reproducir los experimentos del paper, que estudian si las explicaciones de activaciones neuronales (natural language activations, NLA) generadas por modelos de lenguaje se mantienen coherentes cuando el texto de entrada se traduce a otros idiomas. El autor es `anusasaha`, que mantiene otros repositorios relacionados como `anusasaha/NLAGemma`.

El repositorio ocupa 29,9 GB, un tamano que sugiere la inclusion de artefactos de experimentacion (activaciones, explicaciones generadas, conjuntos de datos intermedios) mas que pesos de modelo. El codigo esta disenado para ejecutarse sobre tres modelos concretos: Qwen 7B, Gemma 12B y Gemma 27B, todos ellos capaces de caber en una unica GPU A100 de 80 GB. No se proporciona ninguna model card en el sentido habitual: el README describe la estructura del codigo, los ficheros de datos, los niveles de experimentacion y el flujo de ejecucion, pero no especifica arquitectura, parametros, licencia ni idiomas del modelo en si.

La relevancia de este repositorio es metodologica: aborda la interpretabilidad mecanicista en contextos multilingues, un area poco explorada, y lo hace con un diseno experimental que cubre 21 variantes linguisticas (incluyendo variantes romanizadas), seis regiones culturales y comparaciones entre traducciones humanas y automaticas (NLLB). Al no ser un modelo desplegable, su utilidad practica se limita a la reproduccion de experimentos de investigacion en interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de codigo, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codigo evalua 21 variantes linguisticas, no el modelo) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo Python y datos, no pesos) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado ni documenta un proceso de entrenamiento. Lo que contiene es un conjunto de scripts de analisis organizados en fases ejecutables mediante `run_all.sh`: `data`, `core`, `capability`, `mech`, `verbalizer`, `prior`, `fixes`, `metrics`, `export`, `post` y `scale`. Cada script se invoca como `python script.py <model> [tier] [stages...]`, con el nivel `t1` como valor por defecto, y el sistema reanuda ejecuciones saltando salidas ya existentes.

El diseno experimental se articula en torno a niveles (`tiers`) que definen conjuntos de frases y posiciones a explicar: `t1` cubre 120 frases de la interseccion FLORES ∩ Belebele ∩ SIB multiplicadas por 21 variantes mas dos parafrasis de retrotraduccion al ingles; `t2` amplia a 400 frases; `f` introduce fragmentacion forzada de 1 a 6 veces, caracteres y bytes; `p` compara traducciones humanas frente a NLLB en hindi, espanol, arabe y chino; `x` y `r` usan conjuntos aportados por el usuario (90 items culturalmente marcados y 120 frases regionales); y `c` evalua scripts candidatos como amharico, georgiano, thai y birmano. Las 21 variantes linguisticas incluyen ingles, hindi, hindi romanizado, urdu, urdu romanizado, bengali, bengali romanizado, marathi, tamil, espanol, frances, portugues, ruso, serbio, serbio romanizado, arabe, chino, japones, coreano, swahili y yoruba.

Los modelos de destino sobre los que se ejecutan los experimentos son Qwen 7B, Gemma 12B y Gemma 27B. El codigo incluye etapas de intervencion mecanicista (trasplante, borrado, sondas de region), puntuacion sin juez LLM (`metrics.py`), exportacion de material para juicio humano (`for_judging/`) y analisis estadistico que consume juicios externos desde `judgments/`. No se documenta ningun proceso de RLHF, DPO ni preentrenamiento propio.

## Capacidades

- Ejecucion de experimentos de interpretabilidad mecanicista sobre modelos Qwen 7B, Gemma 12B y Gemma 27B.
- Generacion y evaluacion de explicaciones de activaciones (NLA) por token, por palabra final y por posicion final.
- Analisis de fidelidad de explicaciones mediante juicios humanos estructurados en `for_judging/`.
- Intervenciones sobre activaciones: trasplante, borrado y sondas de region (`prior.py`).
- Comparacion de traducciones humanas frente a NLLB en cuatro idiomas.
- Evaluacion de scripts no latinos (amharico, georgiano, thai, birmano) y de variantes romanizadas.
- Puntuacion automatica sin juez LLM (`metrics.py`), con filtro opcional de calidad COMET.
- Gestion de memoria: reduccion automatica del batch ante errores de CUDA OOM y reparto multi-GPU con `DEVICE_MAP=auto`.

## Casos de uso

- Reproduccion del articulo "Do Activation Explanations Survive Translation?": el repositorio permite ejecutar las fases en orden (`data`, `core`, `capability`, `mech`, `verbalizer`, `prior`, `fixes`, `metrics`, `export`, `post`, `scale`) para replicar los resultados publicados.
- Investigacion en interpretabilidad multilingue: usar los niveles `t1` y `t2` para estudiar si las explicaciones de activaciones se mantienen estables al traducir una misma frase a 21 variantes linguisticas.
- Auditoria de sesgos culturales en modelos: el conjunto `data/authored.csv` (90 items balanceados en seis regiones, con condiciones `neutral`, `culture_marked` y `place_named`) permite comprobar si una frase en hindi sobre Madrid recibe un encuadre sudasiatico.
- Evaluacion de traduccion automatica frente a humana: el nivel `p` compara explicaciones sobre traducciones humanas y de NLLB en hindi, espanol, arabe y chino, util para estudiar si la traduccion degrada la fidelidad de las explicaciones.
- Estudio de tokenizacion y fragmentacion: el nivel `f` fuerza fragmentacion de 1 a 6 veces, caracteres y bytes, permitiendo analizar como afecta la tokenizacion a la calidad de las explicaciones.
- Analisis de scripts de bajos recursos: el nivel `c` (amharico, georgiano, thai, birmano) sirve para evaluar el comportamiento del modelo en escrituras alejadas del latin.
- Construccion de pipelines de juicio humano: `export.py` genera ficheros JSONL en `for_judging/<model>/<tier>/` con explicaciones, traducciones y muestras de consenso, listos para anotacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los tres modelos de destino (Qwen 7B, Gemma 12B, Gemma 27B) caben en una unica GPU A100 de 80 GB.
- `DEVICE_MAP=auto` permite repartir un modelo entre varias GPU, aunque las etapas de intervencion asumen una sola GPU.
- El repositorio ocupa 29,9 GB, por lo que se necesita espacio en disco suficiente para los datos y artefactos intermedios.
- Dependencias: `pip install -r requirements.txt`, con `fasttext` y `sae-lens` opcionales; `unbabel-comet` no instala en Python 3.12 con numpy 2 y su filtro de calidad se omite si falta.
- Variables de control de memoria: `EXPLAIN_BATCH`, `RECONSTRUCT_BATCH`, `EXTRACT_BATCH`; el sistema reduce el batch a la mitad automaticamente ante CUDA OOM.
- No se documentan latencias ni throughput.
- Opciones de despliegue: no aplica (no es un modelo servible); se ejecuta como scripts Python con acceso a GPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de interpretabilidad multilingue con los que establecer una comparacion cuantitativa. El unico repositorio relacionado mencionado es `anusasaha/NLAGemma`, del mismo autor, sin datos adicionales sobre sus caracteristicas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede desplegarse para inferencia, generacion de texto ni tareas de NLP.
- No se especifica licencia, lo que impide determinar las condiciones de uso comercial o redistribucion.
- El repositorio carece de model card en sentido estricto: no hay informacion sobre arquitectura, parametros, contexto ni cuantizacion del modelo subyacente.
- Las traducciones al hindi y urdu de `data/authored.csv` deben ser revisadas por un hablante nativo antes de su uso en el articulo, segun el propio README.
- El codigo no incluye juez LLM: cualquier evaluacion que lo requiera se externaliza a `for_judging/` y los scripts de analisis omiten las partes cuyos juicios faltan en `judgments/`.
- `unbabel-comet` no es compatible con Python 3.12 y numpy 2, lo que desactiva el filtro de calidad COMET en `data.py parallel`.
- Las etapas de intervencion asumen una unica GPU, lo que limita el escalado a configuraciones multi-GPU.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- No hay informacion sobre sesgos del modelo ni sobre riesgo de alucinacion, al no tratarse de un modelo desplegable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anusasaha/NLA_analysis
- Repositorio relacionado del mismo autor: https://huggingface.co/anusasaha/NLAGemma
- Artificial Analysis (referencia de comparacion de modelos): https://artificialanalysis.ai/
