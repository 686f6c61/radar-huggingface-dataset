# ayjays132/PhillNet_Recall

## Resumen

PhillNet Recall 1.2.0 es un sistema de memoria externa y checkpoint de politicas compacto desarrollado por Phillip A. Holland Jr. (ayjays132). No es un modelo generativo ni un modelo de embeddings, sino un componente de un sistema hibrido ejecutable que almacena evidencia de fuentes, recupera notas relacionadas, sigue relaciones suministradas por la aplicacion y preserva correcciones explicitas y validez historica. Su proposito es ensamblar contexto sin descartar dependencias de forma silenciosa, un problema comun en pipelines de recuperacion aumentada (RAG).

El componente neural es minimo: 24 politicas completas de 500 bytes cada una con arquitectura de 20 entradas, 20 unidades ReLU y una salida de score, empaquetadas en 12.128 bytes. El resto del sistema (almacenamiento SQLite, parser, joins, presupuestos de contexto, glosarios y certificados) es software convencional en Python 3.10+ de biblioteca estandar, con un scorer opcional en C99. La version 1.2 anade puentes terminologicos locales al scope, consultas conjuntivas positivas y busqueda acotada de paquetes de evidencia completos.

Es relevante ahora porque propone un enfoque "training-free" y local-first para memoria de agentes, donde la trazabilidad de la evidencia y la validez historica son requisitos de produccion. El autor advierte explicitamente de que no es un producto de memoria que haya demostrado estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 24 politicas, cada una: 20 entradas → 20 unidades ReLU → 1 score |
| Parametros totales | 9.768 (safetensors); 10.584 parametros numericos en los dos bancos segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de paquete por defecto 8.192 bytes UTF-8 en el ejemplo; limite de busqueda por defecto 4.096 combinaciones) |
| Tipos de cuantizacion | 8-bit (tag del repositorio); no se detallan otras |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; checkpoint empaquetado de 12.128 bytes con dos cabeceras |

## Arquitectura y entrenamiento

El sistema combina un banco de pesos neural minimo con una capa de software extensa. Cada politica es una red de una capa oculta (20 entradas, 20 ReLU, una salida) que produce un score de ranking. Los dos bancos de pesos se preservan byte a byte desde la version 1.1. Segun la model card, no hay entrenamiento ni destilacion nuevos en esta version ("No new neural training"), por lo que las politicas son fijas y su comportamiento depende del sistema de almacenamiento y recuperacion que las rodea.

Las innovaciones tecnicas de la version 1.2 son tres. Primero, puentes terminologicos locales al scope almacenados como registros respaldados por fuente, que pueden modificarse sin tocar los pesos y que fallan de forma cerrada ante conflictos. Segundo, consultas conjuntivas positivas de hasta seis atomos sobre relaciones suministradas, con unificacion de valores exacta y sensible a mayusculas, acompanadas de un certificado que incluye el digest del scope elegible. Tercero, un optimizador de paquetes de contexto que busca combinaciones de pruebas completas y cuenta el paquete serializado real, compartiendo IDs de registro entre pruebas; distingue `optimal=true`, `optimal=false`, `search_exhausted` y `budget_exceeded` sin emitir pruebas incompletas.

## Capacidades

- Almacenamiento de evidencia de fuentes con procedencia y dependencias explicitas.
- Recuperacion de notas relacionadas y seguimiento de relaciones suministradas por la aplicacion.
- Preservacion de correcciones explicitas, TTL y validez historica de los registros.
- Puentes terminologicos por scope y namespace (por ejemplo, mapear "amber docket" a "incident register" en el proyecto Nova).
- Consultas conjuntivas positivas de hasta seis atomos con unificacion exacta de variables.
- Ensamblado de paquetes de contexto con presupuesto en bytes UTF-8 y busqueda acotada de combinaciones de pruebas completas.
- Certificados de consulta con digest del scope elegible para invalidacion controlada.
- API autenticada, cliente Python de biblioteca estandar, verificador de releases y wheel.
- No soporta generacion de texto, vision, audio, tool calling generativo ni razonamiento multi-paso de tipo LLM.

## Casos de uso

- Memoria de agentes con trazabilidad: el sistema guarda la evidencia de origen de cada nota y la devuelve junto con la nota, de modo que un agente puede citar la fuente y detectar dependencias antes de responder.
- Gestion de incidencias con terminologia por equipo: un equipo puede registrar un puente como "amber docket" → "incident register" y recuperar notas de incidencias con el termino interno sin editar pesos ni crear sinonimos globales.
- Consultas de inventario de servicios: con hechos suministrados sobre region y propietario, una consulta conjuntiva devuelve los servicios que cumplen ambas condiciones junto con los registros de soporte completos.
- Correccion y auditoria historica: las correcciones, borrados y TTL se aplican a los registros y a los puentes, lo que permite reconstruir que evidencia era valida en un momento dado.
- Construccion de contexto para RAG con presupuesto fijo: el optimizador selecciona combinaciones de pruebas completas que caben en un presupuesto de bytes, compartiendo registros comunes entre respuestas.
- Despliegue local-first en entornos con requisitos de privacidad: la base de evidencia personal es una base de datos privada de la aplicacion, no forma parte del checkpoint publicado, y el sistema funciona con la biblioteca estandar de Python.
- Verificacion de releases: el verificador incluido permite comprobar la integridad de los checkpoints y paquetes antes de desplegarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model-index declara el modelo "PhillNet Recall 1.2.0" con una lista de resultados vacia. Los unicos datos de evaluacion mencionados son pruebas sinteticas autorales del proyecto, no comparables con benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el payload de politicas es de 12 KB, pero el sistema completo requiere almacenamiento y computo adicionales para texto fuente, SQLite, indices, vistas de grafo y Python.
- GPU recomendadas: no disponible; el scorer opcional es C99 en CPU y no se documenta requisito de GPU.
- Cabe en cualquier GPU consumer y en CPU: el componente neural es de 9.768 parametros en safetensors y el checkpoint empaquetado ocupa 12.128 bytes.
- Opciones de despliegue: paquete Python `phillnet-recall` 1.2.0 sobre Python 3.10+, scorer C99 opcional, wheel incluida; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. PhillNet Recall no es un LLM ni un modelo de embeddings, y la informacion proporcionada no incluye alternativas comparables de la misma categoria (sistemas de memoria externa con ranking neural y certificados de evidencia).

## Limitaciones y advertencias

- No es un LLM generativo, modelo de embeddings, reemplazo de KV-cache ni parser semantico sin restricciones; el autor lo declara explicitamente.
- El autor no afirma estado del arte ni rendimiento demostrado como producto de memoria.
- Coincidir con una nota no establece que sea verdadera; la recuperacion no valida la veracidad del contenido.
- Un mapeo terminologico incorrecto puede recuperar la nota equivocada; los mapeos en conflicto fallan de forma cerrada y los namespaces no heredan terminologia entre si.
- Las consultas unifican valores exactos y sensibles a mayusculas, y no realizan traduccion arbitraria de lenguaje natural a consulta.
- Un resultado `no_matches` describe el almacen almacenado, no la ausencia del hecho en el mundo.
- La busqueda de paquetes esta acotada por defecto a 4.096 combinaciones; si el limite impide encontrar un paquete valido, se devuelve `search_exhausted` en lugar de una prueba incompleta.
- Solo soporta ingles (`en`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopcion ni de validacion externa.
- La model card indica que la publicacion esta empaquetada pero no subida por esta build, y que el repositorio de Hub previsto es `ayjays132/PhillNet-Recall`, distinto del ID consultado `ayjays132/PhillNet_Recall`.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantia.

## Enlaces

- Hugging Face: https://huggingface.co/ayjays132/PhillNet_Recall
- Repositorio de Hub previsto por el autor: `ayjays132/PhillNet-Recall` (segun model card)
- Demo Space previsto por el autor: `ayjays132/PhillNet-Recall-Demo` (segun model card)
- Quick start: docs/QUICKSTART.md (referenciado en la model card)
- Publicacion en Hugging Face: docs/HF_PUBLICATION.md (referenciado en la model card)
- Arquitectura: docs/ARCHITECTURE_1.2.md (referenciado en la model card)
- Resultados medidos: reports/v12_evaluation.json (referenciado en la model card)
