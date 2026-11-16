# jrubiosainz/microduck-sock-counter-s5

## Resumen

`microduck-sock-counter-s5` es un artefacto publicado en Hugging Face por el usuario jrubiosainz que se presenta explícitamente como una simulación, no como un modelo entrenado de forma independiente. Según su model card, se trata de una política de búsqueda (lookup policy) modificada que deriva del repositorio `GinDuck/microduck-gin-sock-s5`, del cual hereda el grafo, la red de fallback y las tablas de las semillas 1 a 4. La contribución propia del autor se limita a la optimización de una secuencia de acciones para la semilla 5 y a la regrabación de sus observaciones sobre un runner x86 v5.

El repositorio tiene un tamaño de 0,0 GB, no declara pipeline, licencia ni idiomas, y contiene pesos en formato ONNX. El autor advierte de que no debe cargarse en un robot físico y de que no se ha presentado a la Arena. Los resultados citados (media de 4,790 sobre cinco semillas en una repetición local) son locales y no constituyen un envío oficial.

Por su naturaleza, no es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de simulación ligado a una tarea concreta de conteo/recogida de calcetines dentro de un entorno tipo microduck. Cualquier evaluación como modelo de IA debe hacerse con esa cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto ONNX; grafo heredado de GinDuck/microduck-gin-sock-s5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor no declara licencia nueva; se preservan `UPSTREAM-LICENSE-apache-2.0.txt` y `UPSTREAM-NOTICE` del linaje anterior) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de que el artefacto se distribuye como grafo ONNX. El autor indica que el grafo, la red de fallback y las tablas de las semillas 1 a 4 proceden de `GinDuck/microduck-gin-sock-s5` en la revisión `d629272850beeb7e9d6b5712a1dfb236be67ae44`, con SHA-256 de la política fuente `109fc64b9ef894ed7c10743e9bc7c4755be4e34a4503385906066d0f227c2cf5`. Los inicializadores heredados permanecen sin cambios.

No se ha realizado entrenamiento para esta modificación: los campos de entrenamiento de `manifest.json` describen el modelo upstream de GinDuck, no un entrenamiento propio. La aportación del autor consiste en optimizar la secuencia de acciones de la semilla 5 y regrabar las observaciones sobre un runner v5 x86 a velocidad `vx 0.2`. No se documentan número de tokens, composición del dataset, RLHF, DPO ni innovaciones técnicas de atención o decodificación.

## Capacidades

- Ejecución de una política de búsqueda (lookup policy) sobre un grafo ONNX en un entorno de simulación.
- Reproducción de secuencias de acciones para cinco semillas, con tablas heredadas para las semillas 1 a 4 y una secuencia optimizada para la semilla 5.
- Red de fallback heredada para casos no cubiertos por las tablas.
- Replay de comandos fijos sobre runner x86 v5.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de simulación: permite repetir la secuencia de acciones de la semilla 5 sobre runner v5 x86 y comparar con los resultados publicados en `x86-replay-receipt.json`.
- Auditoría de linaje de artefactos: los ficheros `UPSTREAM-NOTICE`, `UPSTREAM-LICENSE-apache-2.0.txt` y `UPSTREAM-ONNX-METADATA.json` permiten trazar la procedencia del grafo y de los inicializadores.
- Verificación de cobertura de políticas: el fichero `collision-screen.json` documenta el cribado de ejecuciones públicas observadas, útil para estudiar solapamientos entre políticas.
- Estudio de metodologías de replay fijo: el runner v5 x86 con comandos fijos sirve como banco de pruebas para comparar metodologías de evaluación reproducibles.
- Docencia sobre artefactos ONNX y linajes de modelos: ilustra cómo se hereda un grafo y se modifica solo una parte del pipeline.
- Análisis de integridad: los hashes SHA-256 de la política fuente y los receipts permiten comprobar que el artefacto no ha sido alterado.

## Benchmarks y rendimiento

El autor reporta una repetición local de comandos fijos sobre runner v5 x86 con cinco semillas sin fallos de lookup:

| Semilla | Resultado |
|---|---|
| 1 | 4,640 |
| 2 | 5,095 |
| 3 | 4,675 |
| 4 | 4,715 |
| 5 | 4,825 |
| Media | 4,790 |

Estos son resultados locales, no un envío oficial a la Arena. El autor remite a `x86-replay-receipt.json` y `x86-full-sweep.json` para el barrido oficial separado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0,0 GB y el artefacto es un grafo ONNX; el consumo real depende del runner).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el autor solo documenta ejecución en runner x86 v5.
- Opciones de despliegue: ejecución vía runtime ONNX sobre x86; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-counter-s5 (este) | no disponible | no disponible | media local 4,790 en 5 semillas | no declarada | Hugging Face, 0 descargas |
| GinDuck/microduck-gin-sock-s5 | no disponible | no disponible | no disponible en esta ficha | no declarada en el repo inspeccionado | Hugging Face |
| P1-s4 de jrubiosainz | no disponible | no disponible | no disponible en esta ficha | no disponible | referenciado en el linaje |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo entrenado de forma independiente: es una política de búsqueda modificada sobre un grafo heredado.
- El autor prohíbe explícitamente cargarlo en un robot físico.
- No ha sido enviado a la Arena; los resultados son locales y no oficiales.
- La cobertura del cribado de ejecuciones públicas (`collision-screen.json`) es incompleta; un resultado UNKNOWN no garantiza unicidad.
- La licencia no está declarada por el autor; el repositorio inmediato de GinDuck no declaraba licencia en los ficheros inspeccionados. El uso comercial queda sin base legal clara.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo de lenguaje.
- Los campos de entrenamiento de `manifest.json` corresponden al upstream, no a esta modificación, lo que puede inducir a error si se leen sin contexto.
- El autor se compromete a retirar la entrada si un titular de derechos lo solicita.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-counter-s5
- Modelo upstream: https://huggingface.co/GinDuck/microduck-gin-sock-s5
- Revisión upstream citada: `d629272850beeb7e9d6b5712a1dfb236be67ae44`
- Ficheros citados en el repo: `x86-replay-receipt.json`, `x86-full-sweep.json`, `collision-screen.json`, `manifest.json`, `UPSTREAM-NOTICE`, `UPSTREAM-LICENSE-apache-2.0.txt`, `UPSTREAM-ONNX-METADATA.json`
- Créditos upstream adicionales: GinDuck, rumezhak, lphatnguyen
- Paper, blog, repositorio de código y demo: no disponibles
