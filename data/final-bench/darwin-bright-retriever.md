# FINAL-Bench/Darwin-BRIGHT-Retriever

## Resumen

Darwin-BRIGHT-Retriever es un sistema de recuperacion (retrieval) desarrollado por el equipo de FINAL-Bench, disenado especificamente para el benchmark BRIGHT, centrado en recuperacion de informacion de razonamiento intensivo (reasoning-intensive information retrieval). A diferencia de la mayoria de modelos de embeddings que destacan en recuperacion semantica superficial, BRIGHT evalua la capacidad de recuperar documentos relevantes cuando la consulta exige razonamiento complejo, como preguntas tecnicas o cientificas que requieren inferencia multi-paso.

Es importante senalar que este repositorio no contiene pesos de modelo: se trata de un registro de resultados de evaluacion de un sistema interno cuyos componentes y metodo no han sido divulgados. Su relevancia radica en la participacion en el leaderboard publico de BRIGHT bajo el protocolo de MTEB, lo que permite comparar su rendimiento con otros sistemas de retrieval en esta tarea emergente.

La evaluacion se realiza con el framework MTEB sobre BRIGHT en su version 1.1, usando nDCG@10 como metrica principal. Los idiomas de trabajo declarados son el ingles y la licencia del repositorio es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema interno no divulgado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No se ha divulgado informacion sobre la arquitectura del sistema, los datos de entrenamiento ni las tecnicas empleadas. La model card indica explicitamente que "el metodo interno y los componentes no se divulgan". No es posible determinar si se trata de un modelo unico, un ensemble de modelos, un pipeline con reranking u otra arquitectura de recuperacion.

Lo unico confirmado es que se trata de un sistema de retrieval disenado para BRIGHT, un benchmark que evalua la recuperacion de documentos cuando la consulta requiere razonamiento profundo (por ejemplo, en dominios como matematicas, ciencia de datos o biologia), y que su evaluacion sigue el protocolo del leaderboard publico mediante el framework MTEB.

## Capacidades

- Recuperacion de informacion en tareas de razonamiento intensivo segun el benchmark BRIGHT (v1.1).
- Evaluacion estandarizada mediante el framework MTEB con metrica nDCG@10.
- Operacion sobre consultas en ingles.
- No hay evidencia de capacidades de generacion de texto, codigo, vision, tool calling ni agentes: el repositorio describe un sistema de retrieval, no un modelo de lenguaje general.

## Casos de uso

- Evaluacion comparativa de sistemas de retrieval: sirve como punto de referencia en el leaderboard de BRIGHT para equipos que desarrollan modelos de embeddings y quieren situar sus resultados en tareas de razonamiento intensivo.
- Investigacion en retrieval semantico avanzado: los resultados publicados pueden usarse para analizar que enfoques funcionan mejor cuando las consultas exigen inferencia, no solo similitud lexica o semantica superficial.
- Seleccion de tecnologia para buscadores tecnicos: organizaciones que construyen buscadores sobre documentacion cientifica o tecnica pueden consultar los resultados como senal de rendimiento en ese tipo de consultas.
- Diseno de benchmarks internos: el protocolo de evaluacion (MTEB + BRIGHT v1.1 + nDCG@10) puede replicarse en evaluaciones internas de otros sistemas.
- Estudios de RAG sobre dominios complejos: equipos que construyen sistemas RAG con consultas de razonamiento pueden usar BRIGHT y este sistema como referencia de recuperacion en ese regimen.
- Analisis de la brecha entre retrieval clasico y retrieval con razonamiento: util para investigadores que estudian donde fallan los embeddings convencionales.

Debe subrayarse que, al no haber pesos disponibles, el sistema no puede desplegarse directamente; su utilidad practica se limita al plano de evaluacion y comparacion.

## Benchmarks y rendimiento

La model card indica que las puntuaciones "se publican solo cuando la evaluacion completa termina y se mide de extremo a extremo". No se incluyen numeros concretos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No aplicable de forma directa: el repositorio no contiene pesos de modelo, por lo que no puede ejecutarse inferencia local.

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Ejecucion en GPU de consumo: no disponible (sin pesos).
- Opciones de despliegue: no disponibles; la evaluacion se realiza mediante el framework MTEB bajo el protocolo del leaderboard publico de BRIGHT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos publicos | Benchmark objetivo | Licencia |
|---|---|---|---|---|
| Darwin-BRIGHT-Retriever | Sistema de retrieval (metodo no divulgado) | No (solo resultados) | BRIGHT v1.1 (nDCG@10) | Apache 2.0 (repositorio) |
| BGE / E5 (familias de embeddings) | Modelos de embeddings genericos | Si | MTEB general, incluyendo BRIGHT | Variable segun variante |
| Modelos de retrieval en el leaderboard BRIGHT | Sistemas de retrieval con razonamiento | Variable segun entrada | BRIGHT | Variable |

No hay datos de rendimiento comparables publicados en la informacion disponible, por lo que no puede elaborarse una comparacion numerica.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: no puede descargarse ni desplegarse para inferencia.
- El metodo y los componentes internos del sistema no se divulgan, lo que impide reproducir el sistema o auditar su diseno.
- Las puntuaciones de evaluacion no estan todavia publicadas en la model card; no existen numeros verificables en la informacion disponible.
- El alcance declarado es el ingles; no hay evidencia de soporte multilingue.
- La licencia Apache 2.0 aplica al repositorio de resultados, pero al no existir pesos no es aplicable a un modelo desplegable.
- Con 0 descargas registradas, no hay comunidad ni historial de uso que respalde el repositorio.
- Como en todo registro de evaluacion, los resultados deben interpretarse bajo el protocolo exacto del leaderboard; comparaciones fuera de ese protocolo no son validas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-BRIGHT-Retriever
- Benchmark BRIGHT: no disponible (enlace no incluido en la informacion proporcionada)
- Framework MTEB: no disponible (enlace no incluido en la informacion proporcionada)
