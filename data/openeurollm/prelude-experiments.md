# openeurollm/prelude-experiments

## Resumen

Prelude experiments es un repositorio de archivo de checkpoints experimentales del modelo Prelude, desarrollado por OpenEuroLLM, una iniciativa europea centrada en modelos de lenguaje multilingues de codigo abierto. No se trata de un modelo final listo para produccion, sino de una coleccion de estados intermedios de entrenamiento (micro-annealing) que documentan el proceso de ajuste del modelo base Prelude, entrenado originalmente sobre 8 billones de tokens. El repositorio tiene un caracter principalmente interno y de transparencia, orientado a investigadores que quieran reproducir o analizar las decisiones de mezcla de datos.

El contenido principal son ramas de checkpoints resultantes de experimentos de micro-annealing sobre el modelo base (en el paso 953312), con variantes de 100B y 300B tokens y distintas mezclas de datos multilingues (`multilingual1`, `multilingual2`, `multilingual1_dominant1`, `multilingual1_dominant2`). Como resultado de estos experimentos se selecciono la mezcla `multilingual1_dominant1` para la ejecucion final de annealing de 2 billones de tokens del modelo Prelude.

El modelo cubre un rango amplio de lenguas europeas (mas de 40 idiomas, incluidas lenguas minoritarias como el euskera, el gallego, el gaélico o el sami), lo que lo posiciona como un recurso relevante para el desarrollo de tecnologia linguistica soberana en Europa. La licencia Apache 2.0 facilita su reutilizacion, aunque el repositorio, por su naturaleza experimental, no esta pensado como artefacto de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, ka, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo Prelude (si es un transformer denso, MoE o hibrido), ni el numero de parametros, la longitud de contexto o la composicion exacta del dataset de preentrenamiento. Lo que si se documenta es el regimen de entrenamiento: el modelo base fue entrenado sobre 8 billones de tokens y posteriormente sometido a un proceso de micro-annealing en el paso 953312, con ejecuciones de 100B y 300B tokens sobre distintas mezclas de datos.

Las mezclas de annealing evaluadas son cuatro: `multilingual1`, `multilingual2`, `multilingual1_dominant1` y `multilingual1_dominant2`, definidas en el repositorio `OpenEuroLLM/annealing-experiments`. Las ramas sin nombre de mezcla contienen checkpoints del annealing de referencia sobre el mismo dataset que el entrenamiento principal. El resultado de estos experimentos determino la eleccion de `multilingual1_dominant1` para la fase final de annealing de 2 billones de tokens. No se especifica si hubo fases de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto multilingue en mas de 40 lenguas europeas, incluidas lenguas de baja representacion como euskera, gallego, gaélico, islandes, maltes o sami.
- Cobertura de lenguas minoritarias y regionales europeas, un diferenciador frente a modelos centrados en ingles.
- Al ser checkpoints intermedios de un modelo base, no se documentan capacidades especificas de tool calling, agentes, vision, audio o modo de razonamiento explicito.
- No se dispone de informacion sobre capacidades de codigo o matematicas en la documentacion proporcionada.

## Casos de uso

- Investigacion sobre mezclas de datos multilingues: los checkpoints permiten analizar como distintas proporciones de datos por idioma afectan al rendimiento, comparando las ramas `multilingual1`, `multilingual2` y las variantes `dominant`.
- Reproducibilidad de experimentos de annealing: el repositorio actua como archivo de estados intermedios para validar la decision de seleccionar `multilingual1_dominant1` en la fase final.
- Desarrollo de tecnologia linguistica para lenguas minoritarias: la cobertura de idiomas como euskera, gallego, gaélico o sami lo hace util como base para fine-tuning en aplicaciones de traduccion, resumen o generacion en estas lenguas.
- Evaluacion comparativa de checkpoints: investigadores pueden medir la evolucion del rendimiento a lo largo de los pasos de entrenamiento (por ejemplo, entre `anneal100b` y `anneal300b`) para estudiar dinamicas de aprendizaje.
- Base para fine-tuning en dominios especificos europeos (administracion publica, sanidad, educacion) en las lenguas cubiertas, partiendo de un modelo con licencia permisiva.
- Analisis de sesgos y representacion linguistica: la diversidad de idiomas permite estudiar como el modelo trata lenguas con distintos volumenes de datos de entrenamiento.

## Benchmarks y rendimiento

La model card referencia una grafica de evaluacion (`oellm-multilingual-eu/300bt`) con puntuaciones z-score promedio para las distintas mezclas de micro-annealing, pero no se proporcionan valores numericos concretos en la informacion disponible. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el numero de parametros del modelo.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se documentan formatos GGUF, safetensors ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Nota: el tamano del repositorio (9458,7 GB) refleja la acumulacion de multiples checkpoints experimentales en distintas ramas, no el tamano de un unico modelo desplegable.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa con alternativas como modelos multilingues europeos de otros proyectos. La comparacion cualitativa mas cercana seria con el propio modelo base Prelude (`openeurollm/prelude-base`), del que este repositorio es un archivo de experimentos.

## Limitaciones y advertencias

- Repositorio de caracter experimental y de archivo: los checkpoints no estan pensados para uso en produccion y pueden presentar calidad inferior a la del modelo final.
- No se documentan sesgos conocidos, pero la cobertura desigual de lenguas (algunas con muchos menos datos) puede implicar rendimiento heterogeneo entre idiomas.
- Riesgo de alucinacion no evaluado en la informacion disponible.
- No se especifican limitaciones de contexto ni de idioma mas alla de la lista de lenguas soportadas.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de checkpoints intermedios conviene verificar la licencia y condiciones del modelo base Prelude antes de su explotacion.
- El enorme tamano del repositorio (mas de 9 TB) supone un coste significativo de almacenamiento y descarga.
- Ausencia de datos sobre alineacion (RLHF/DPO) o filtros de seguridad; no se recomienda su despliegue directo sin evaluacion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/openeurollm/prelude-experiments
- Modelo base Prelude: https://huggingface.co/openeurollm/prelude-base
- Repositorio de experimentos de annealing: https://github.com/OpenEuroLLM/annealing-experiments/tree/main/prelude
- Mezcla multilingual1: https://github.com/OpenEuroLLM/annealing-experiments/blob/main/prelude/multilingual1.txt
- Mezcla multilingual2: https://github.com/OpenEuroLLM/annealing-experiments/blob/main/prelude/multilingual2.txt
- Mezcla multilingual1_dominant1: https://github.com/OpenEuroLLM/annealing-experiments/blob/main/prelude/datamix_lumi_multilingual1_dominant1.txt
- Mezcla multilingual1_dominant2: https://github.com/OpenEuroLLM/annealing-experiments/blob/main/prelude/datamix_lumi_multilingual1_dominant2.txt
- Grafica de evaluacion de micro-annealing: https://github.com/OpenEuroLLM/annealing-experiments/blob/main/prelude/evals/oellm-multilingual-eu/300bt/plots/macro_average_zscore.png
- Issue de seleccion de mezcla final: https://github.com/OpenEuroLLM/Taskboard/issues/365#issuecomment-6120535550
