# jrubiosainz/microduck-sock-heist-6m-p1-s4-1f0fc5ae

## Resumen

`jrubiosainz/microduck-sock-heist-6m-p1-s4-1f0fc5ae` es un artefacto ONNX publicado en Hugging Face que no constituye un modelo de lenguaje ni un modelo fundacional entrenado de forma independiente. Se trata de un híbrido construido sobre una política pública (GinDuck/microduck-gin-sock-finish) en el contexto de una simulación denominada Sock Heist, presumiblemente vinculada a un entorno de competición (Arena). El autor, jrubiosainz, modifica únicamente la secuencia de acciones de la semilla 4 mediante una búsqueda de cola (tail search) sobre la secuencia original de GinDuck, reemplazando las observaciones de esa semilla por una regrabación bajo el runner v5 en x86-64 con el comando `vx=0.2`.

El repositorio no contiene pesos de un transformer, ni tokenizador, ni configuración de inferencia de lenguaje. El tamaño del repo es de 0.0 GB (los ficheros declarados son metadatos, tablas de acciones y un grafo ONNX heredado). No hay pipeline declarado, ni licencia, ni idiomas, ni descargas ni likes en el momento de la consulta. La model card es explícita: "Simulation only. This is a hybrid built on a public policy. It is not an independently trained policy."

Su relevancia es, por tanto, muy acotada: sirve como ejemplo de composición y trazabilidad de artefactos en entornos de simulación con políticas heredadas, y documenta con rigor la procedencia de cada componente (hashes SHA-256, rangos de tabla, avisos de licencia upstream). No es un modelo evaluable con los criterios habituales de MMLU, HumanEval o GSM8K, y no debe tratarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX heredado de la política upstream (no se especifica tipo de red; no es un transformer de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; la política opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible en el repo; componentes upstream con Apache-2.0 y otros sin licencia identificada |
| Formato de pesos | ONNX (`policy.onnx` heredado, SHA-256 `1a90baca9e5ea59a781c8ae99157865884aec75de65e7508582e421f2852b110`) |
| Tamano del repo | 0.0 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no entrena una red nueva. El grafo ONNX y la red de respaldo (fallback network) provienen de la política `GinDuck/microduck-gin-sock-finish` en la revisión `075605f3505779b4c9166cf768a461a10cc1b971`. La model card atribuye a su vez esa política a los trabajos composite-v9 de rumezhak y v5 de lphatnguyen. La contribución de jrubiosainz se limita a la semilla 4: una nueva secuencia de acciones obtenida mediante una búsqueda de cola inicializada a partir de la secuencia de GinDuck para esa misma semilla, que altera 112 valores en sus primeras 261 filas. Las claves de observación de esa semilla se regrabaron bajo el runner v5 en x86-64 con `vx=0.2` y sustituyen a las filas 796–1057 de la tabla original. El resto de inicializadores permanece sin cambios.

La trazabilidad se documenta mediante `table-provenance.json` (rangos y hashes por semilla), una clave de metadatos `modification_notice` en el ONNX y la preservación de las claves de metadatos upstream. El `manifest.json` se adaptó del manifiesto fijado de GinDuck, pero sus campos de entrenamiento describen el modelo upstream, no un entrenamiento realizado para este híbrido. No se aporta información sobre número de tokens, composición de dataset, RLHF/DPO ni innovaciones de atención o decodificación, porque no aplica a este tipo de política.

## Capacidades

- Ejecución de una política de control en el entorno de simulación Sock Heist, con observaciones y acciones serializadas en tabla.
- Reproducción determinista por semilla bajo el runner v5 en x86-64 con el comando `vx=0.2` (según el recibo de replay incluido).
- Composición de artefactos: mezcla de secuencias de acciones propias con el grafo y la red de respaldo de una política pública upstream.
- Trazabilidad verificable mediante hashes SHA-256, rangos de filas y ficheros de procedencia.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos en simulación: permite repetir las cinco semillas bajo el runner v5 con `vx=0.2` y comparar observaciones y acciones contra las grabaciones de origen, usando `x86-replay-receipt.json` como referencia.
- Auditoría de procedencia de artefactos: `table-provenance.json` y la clave `modification_notice` permiten verificar qué filas y valores se modificaron respecto a la política upstream, útil en revisiones de integridad.
- Estudio de búsqueda de cola sobre políticas existentes: la modificación de 112 valores en las primeras 261 filas de la semilla 4 sirve como caso documentado de optimización local de una secuencia de acciones.
- Validación de cadenas de custodia y licencias: el repo ilustra cómo preservar avisos Apache-2.0 (`UPSTREAM-NOTICE`, `UPSTREAM-LICENSE-apache-2.0.txt`) y metadatos ONNX de origen cuando se reutiliza una política pública.
- Pruebas de compatibilidad de runners: la regrabación de observaciones en x86-64 bajo QEMU con runner v5 permite contrastar comportamiento entre plataformas y versiones de runner.
- Docencia o divulgación sobre híbridos en competiciones: el caso muestra de forma explícita las diferencias entre un modelo entrenado y un artefacto compuesto, con advertencias claras en la model card.

## Benchmarks y rendimiento

Los únicos datos publicados son validaciones locales del propio autor, no resultados de benchmarks estándar de modelos de lenguaje.

| Validación | Resultado |
|---|---|
| Replay x86-64 (QEMU, runner v5, `vx=0.2`), semillas 1–5 | `[4.640, 5.095, 4.675, 4.715, 4.895]` |
| Media de las cinco semillas | 4.804 |
| Fallos de tabla en replay | 0 en las cinco semillas |
| Coincidencia de observaciones y acciones con el origen | exacta |
| Barrido completo local (`x86-full-sweep.json`) | puntuación 4.804 |
| Snapshot de ejecución pública (`collision-snapshot-*.json`) | sin coincidencia exacta por semilla; cobertura incompleta, unicidad no garantizada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un grafo ONNX de política y el repo ocupa 0.0 GB, por lo que la huella es mínima.
- GPU recomendadas: no disponibles; no se especifican requisitos de aceleración.
- Compatibilidad con GPU de consumo: no disponible; el replay documentado se ejecutó en x86-64 bajo QEMU, sin mención de GPU.
- Opciones de despliegue: ejecución mediante ONNX Runtime y el runner v5 del entorno de simulación; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; no se publican métricas de rendimiento por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-p1-s4 (este) | Híbrido de política ONNX en simulación | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| GinDuck/microduck-gin-sock-finish | Política pública upstream | no disponible | no aplica | sin campo de licencia observado | Hugging Face |
| rumezhak composite-v9 | Política upstream citada | no disponible | no aplica | Apache-2.0 en las partes que la portan | Hugging Face |
| lphatnguyen v5 | Política upstream citada | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado de forma independiente: es un híbrido sobre una política pública, y la model card lo declara explícitamente como "simulation only".
- No ha sido enviado a la Arena, por lo que no existe validación oficial ni garantía de clasificación.
- La licencia no está declarada en el repositorio; el repositorio upstream de GinDuck no tiene campo de licencia ni ficheros LICENSE o NOTICE observados, lo que no implica que todos los componentes heredados carezcan de avisos.
- La aplicabilidad de los Términos de Servicio de Hugging Face (sección "Your Content") a la Arena es una interpretación, no una relicencia global.
- Solo las partes upstream que portan Apache-2.0 están cubiertas por esa licencia (`UPSTREAM-NOTICE`, `UPSTREAM-LICENSE-apache-2.0.txt`, `UPSTREAM-ONNX-METADATA.json`).
- Los resultados son validaciones locales, no una garantía de rango ni de reproducibilidad en otros entornos.
- El snapshot de ejecución pública no coincide exactamente por semilla y su cobertura es incompleta; la unicidad no está garantizada.
- El `manifest.json` describe el entrenamiento del modelo upstream, no un entrenamiento de este híbrido, lo que puede inducir a error si se lee sin contexto.
- No apto para uso comercial como modelo de lenguaje: no genera texto, no razona y no soporta tool calling, agentes ni multilingüismo.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual; el riesgo relevante es de atribución incorrecta de procedencia o de licencia si se reutiliza sin revisar los avisos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-p1-s4-1f0fc5ae
- Política upstream GinDuck: https://huggingface.co/GinDuck/microduck-gin-sock-finish
- Perfil de rumezhak (composite-v9): https://huggingface.co/rumezhak
- Perfil de lphatnguyen (v5): https://huggingface.co/lphatnguyen
- Términos de Servicio de Hugging Face, sección "Your Content": https://huggingface.co/terms-of-service
