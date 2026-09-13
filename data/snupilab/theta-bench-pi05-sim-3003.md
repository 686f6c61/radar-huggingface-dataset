# snupilab/theta-bench-pi05-sim-3003

## Resumen

Este repositorio, publicado por el usuario snupilab con el identificador `snupilab/theta-bench-pi05-sim-3003`, es un artefacto de resultados de entrenamiento dentro del ecosistema THETA Bench, etiquetado como robótica y asociado al simulador MuJoCo. Su nombre referencia explícitamente a pi0.5, lo que sugiere que se trata de un checkpoint derivado de una política preentrenada de tipo vision-language-action entrenada o adaptada mediante el framework THETA. No obstante, la propia model card aclara que el repositorio no sustituye a la política preentrenada original y que el entrenamiento sigue en curso.

El contenido actual es únicamente metadatos: no se publican pesos, configuraciones de inferencia ni resultados de evaluación. La ficha describe una etapa de entrenamiento en simulación sobre 3.003 segmentos, con un objetivo de 40.000 actualizaciones del optimizador, un batch global de 128 y 18 condiciones distintas. La model card insiste en que esos 3.003 segmentos no equivalen a 3.003 demostraciones independientes, sino que combinan 1.200 demostraciones L1/L2 exitosas y 1.803 prefijos L0 extraídos.

Su relevancia es, por tanto, documental y de trazabilidad para investigación en aprendizaje por imitación y robótica: sirve para registrar la procedencia de un entrenamiento en curso dentro de THETA Bench, no como un modelo listo para desplegar. No se declara ninguna puntuación de evaluación y no se especifican arquitectura, tamaño ni contexto, por lo que cualquier uso práctico queda condicionado a la disponibilidad futura del checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no describe la arquitectura; el nombre referencia pi0.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene solo metadatos; entrenamiento en curso) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card indica que se trata de una etapa de "Simulation training" sobre 3.003 segmentos, con un objetivo de 40.000 actualizaciones del optimizador, batch por GPU de 16 sobre 8 GPUs (batch global de 128), acumulacion de gradiente 1 y 18 condiciones por batch global. El entrenamiento utiliza optimizadores de modelo independientes y ejecucion compartida de GPU mediante MPS, con publicacion realizada por un cargador de CPU tras la validacion del checkpoint final.

El conjunto de datos de entrenamiento se identifica como `snupilab/theta-bench-teleop`, fijado en la revision `8b2cd31e107b64cb13f812ea217a63a20845c78a`. El pool de simulacion contiene 1.200 demostraciones L1/L2 exitosas y 1.803 prefijos L0 extraidos, abarcando 18 condiciones; la model card subraya que los 3.003 segmentos no son 3.003 demostraciones independientes. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) ni el uso de RLHF o DPO.

## Capacidades

- Politica robotica entrenada en simulacion: el artefacto pertenece al pipeline de robótica de HuggingFace y esta asociado a MuJoCo, por lo que su finalidad es la ejecucion de comportamientos de control en entornos simulados.
- Aprendizaje por imitacion a partir de teleoperacion: los datos proceden del dataset `theta-bench-teleop` e incluyen demostraciones L1/L2 y prefijos L0.
- Cobertura multipropósito limitada a 18 condiciones definidas en el pool de simulacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el unico idioma declarado en los metadatos es en.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Uso multimodal o de lenguaje natural: no disponible.

## Casos de uso

- Evaluacion de checkpoints en simulacion robotica: el repositorio permite registrar y comparar el estado de un entrenamiento THETA Bench (3.003 segmentos, 40.000 actualizaciones objetivo) frente a otras etapas del mismo pipeline, siempre que se disponga del checkpoint completo.
- Reproduccion de experimentos de imitacion: con la revision de dataset fijada (`8b2cd31e...`) y los hiperparametros declarados, un equipo puede intentar reproducir la etapa de entrenamiento en simulacion.
- Investigacion en sim-to-real: el modelo esta etiquetado con MuJoCo, por lo que su uso previsto es servir de base para politicas que posteriormente se trasladen a hardware real, previa validacion.
- Generacion de datos sinteticos de teleoperacion: los prefijos L0 y las demostraciones L1/L2 sugieren utilidad como fuente de episodios para aumentar datasets de control.
- Benchmarking interno de politicas: el artefacto encaja en una comparativa controlada de etapas de entrenamiento dentro de THETA Bench, no como modelo de proposito general.
- Trazabilidad de publicaciones cientificas: al registrar revision de datos, batch y numero de actualizaciones, el repositorio sirve como evidencia de procedencia en articulos o informes tecnicos.

Advertencia: la model card indica que el entrenamiento esta en curso y que el repositorio contiene solo metadatos, por lo que ninguno de estos casos es ejecutable con el contenido actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "No evaluation score is claimed by checkpoint publication".

## Requisitos de hardware

- VRAM para inferencia: no disponible (no se publican pesos ni tamano de parametros).
- GPU recomendadas para entrenamiento: la model card declara 8 GPUs con batch por GPU de 16 y batch global de 128, sin especificar el modelo concreto de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica que debe usarse el adaptador THETA nativo del modelo y sus dependencias especificas, y que no se reclama compatibilidad con Transformers ni con cargadores de simulacion arbitrarios. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Nota de ejecucion: el entrenamiento emplea ejecucion compartida de GPU mediante MPS y un cargador de CPU para la publicacion del checkpoint.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones (parametros, contexto, licencia ni metricas) que permitan una comparacion rigurosa con alternativas de la misma categoria. El unico punto de referencia nominal es pi0.5, citado en el nombre del repositorio, pero la model card no confirma una relacion tecnica verificable ni ofrece datos comparativos.

## Limitaciones y advertencias

- Contenido incompleto: el repositorio contiene unicamente metadatos; el entrenamiento esta en curso y no hay pesos publicados.
- Ausencia de evaluacion: no se declara ninguna puntuacion de benchmark, por lo que no hay evidencia de rendimiento.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si se permite el uso comercial.
- Compatibilidad restringida: la model card advierte de que no se reclama compatibilidad con Transformers ni con cargadores de simulacion arbitrarios; es necesario usar el adaptador THETA nativo.
- Interpretacion de los datos de entrenamiento: los 3.003 segmentos no son demostraciones independientes, sino 1.200 demostraciones L1/L2 mas 1.803 prefijos L0 extraidos, lo que puede inducir a error si se comparan volumenes de datos entre pipelines.
- Cobertura limitada: el pool de simulacion abarca 18 condiciones, lo que restringe la generalizacion fuera de ese conjunto.
- Idioma: los metadatos solo declaran en; no hay soporte multilingue documentado.
- Riesgo de alucinacion y sesgos: no disponible (no se documentan analisis de sesgo ni comportamiento en entornos no vistos).
- Sustitucion de la politica preentrenada: el repositorio no sustituye a la politica preentrenada de origen, segun la propia model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/snupilab/theta-bench-pi05-sim-3003
- Dataset de entrenamiento: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados (revision 8b2cd31e107b64cb13f812ea217a63a20845c78a): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/8b2cd31e107b64cb13f812ea217a63a20845c78a/raw
- Paper, blog, repositorio de codigo y demos: no disponible
