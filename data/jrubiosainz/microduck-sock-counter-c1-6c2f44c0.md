# jrubiosainz/microduck-sock-counter-c1-6c2f44c0

## Resumen

Microduck Sock Counter C1 es una política de control robótico en formato ONNX publicada por el usuario jrubiosainz dentro del ecosistema Microduck Arena, un entorno de simulación orientado a tareas de manipulación (concretamente, el conteo de calcetines). No es un modelo de lenguaje: se trata de un artefacto de inferencia para robótica, derivado por composición de dos políticas previas, `rumezhak/microduck-sock-heist-composite-v10` y `jrubiosainz/microduck-sock-counter-s1s5`. La model card es explícita al señalar que es un modelo de simulación y que no debe cargarse en un robot físico.

El modelo se construye manteniendo la estructura de la política base v10 (grafo de 19 nodos, gate, máscara, normalizador, fallback neuronal y demás tensores) y sustituyendo únicamente las tablas de consulta `L_obs` y `L_act` mediante una secuencia de semillas propia (semilla 5). Las acciones de las semillas 1, 2, 3 y 5 son idénticas bit a bit a la política `s1s5` publicada por el mismo autor, mientras que la semilla 4 conserva las filas de v10.

Su relevancia es acotada y muy específica: sirve como evidencia reproducible de validación local dentro de Microduck Arena, con recibos de replay y hashes verificables. No hay información pública sobre arquitectura de red neuronal, tamaño de parámetros ni contexto, y el repositorio aparece con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; grafo de 19 nodos según la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (el tag `base_model:quantized` sugiere derivación de un modelo cuantizado, sin detalle) |
| Idiomas soportados | no disponible |
| Licencia | no disponible como licencia global; Apache-2.0 solo para componentes que la portan, sin relicenciamiento del resto |
| Formato de pesos | ONNX |
| Pipeline | robotics |
| Librería | microduck |
| Modelo base | rumezhak/microduck-sock-heist-composite-v10 y jrubiosainz/microduck-sock-counter-s1s5 |
| SHA256 de la política | `6c2f44c0c9e46ab8d2ace99e39cf95886e2dab9ca45dad178a44bddb73035768` |
| Tamaño del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal convencional. La model card indica que C1 conserva el grafo de 19 nodos, el gate, la máscara, el normalizador, el fallback neuronal y el resto de tensores de la política v10, y que solo difieren `L_obs` y `L_act` (tablas de consulta de observaciones y acciones). La modificación consiste en componer las tablas de consulta existentes de v10 con una secuencia de semillas propia (seed-5) generada por el autor.

No se especifican datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO, lo cual es coherente con que no se trate de un modelo de lenguaje. La model card menciona linaje de trayectorias (seed-1/2/3 vía `microduck-sock-heist-nov17-v3` y búsqueda de cola para seed 4 derivada de `lphatnguyen v5`), pero no se aportan detalles del proceso de optimización ni de la función de recompensa.

## Capacidades

- Ejecución de una política de control para la tarea de conteo de calcetines en el entorno de simulación Microduck Arena.
- Reproducibilidad bit a bit verificada: las acciones de las semillas 1, 2, 3 y 5 coinciden con la política `s1s5` publicada; la semilla 4 conserva las filas de v10.
- Validación local con recibos: cinco semillas completadas en `[4.635, 5.095, 4.675, 4.680, 4.820]` segundos (media 4.781 s, suma 23.905 s) en replay Linux x86_64, runner v5, comando vx 0.2.
- Verificación de integridad mediante SHA256 de la política y comprobación previa y posterior del fichero por el verificador fijado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, al no ser un modelo de lenguaje.

## Casos de uso

- Replay reproducible en simulación: usar el fichero ONNX con el runner v5 y el comando vx 0.2 para reproducir los tiempos y hashes documentados en `x86-replay-receipt.json`, útil para auditar pipelines de evaluación.
- Investigación en composición de políticas: estudiar cómo la sustitución de tablas de consulta (`L_obs`, `L_act`) sobre una política base afecta al comportamiento por semilla, manteniendo el resto del grafo intacto.
- Verificación de integridad de artefactos: emplear el SHA256 publicado y los hashes de acciones y claves para comprobar que una copia local coincide con la política validada.
- Docencia y divulgación sobre robótica simulada: ilustrar el flujo completo de una política ONNX desde su publicación hasta su validación con recibos firmados, sin necesidad de hardware físico.
- Auditoría de atribución y licencias: analizar el mapa `upstream-attribution.json` y las noticias embebidas para comprender la cadena de dependencias entre políticas comunitarias.
- Desarrollo de herramientas de pantalla de colisión: reutilizar `collision-screen.json` como referencia para construir barridos de detección de duplicados en repositorios de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son los tiempos de replay local por semilla:

| Semilla | Tiempo (s) |
|---|---|
| 1 | 4.635 |
| 2 | 5.095 |
| 3 | 4.675 |
| 4 | 4.680 |
| 5 | 4.820 |
| Media | 4.781 |
| Suma | 23.905 |

Estos valores corresponden a una validación local en invitado Linux x86_64 (runner v5, comando vx 0.2) y no a una ejecución oficial de Arena ni a una aceptación de servidor. No constituyen un barrido completo de velocidad ni una prueba de rendimiento universal o fuera de distribución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se detalla el tamaño del grafo ONNX.
- GPU recomendadas: no disponibles; no se especifican requisitos de aceleración.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto es ONNX y se ejecuta mediante la librería `microduck` y el runner v5 en un invitado Linux x86_64; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de control).
- Latencia y throughput: los tiempos de replay por semilla oscilan entre 4.635 s y 5.095 s en el entorno de validación descrito; no se aportan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Microduck Sock Counter C1 | Política de control ONNX | no disponible | no aplica | no disponible (sin licencia global) | Hugging Face, 0 descargas |
| rumezhak/microduck-sock-heist-composite-v10 | Política de control ONNX (base) | no disponible | no aplica | no disponible | Hugging Face |
| jrubiosainz/microduck-sock-counter-s1s5 | Política de control ONNX (base) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas más allá de la relación de composición descrita en la model card.

## Limitaciones y advertencias

- Modelo exclusivamente de simulación: la model card advierte explícitamente de que no debe cargarse en un robot físico.
- Sin licencia global: no se afirma una licencia para el conjunto del modelo; Apache-2.0 se aplica solo a los componentes que la portan y las contribuciones sin licencia no se relicencian.
- Estado de copia global desconocido: el barrido de colisión es finito y no atómico (117 usuarios, 1.324 publicaciones y 152 ejecuciones entre las 15:14:35 y las 15:17:28 UTC del 2026-11-17); solo el servidor puede determinar `copy_of`.
- Validación no oficial: el replay no es una ejecución oficial de Arena, ni una aceptación de servidor, ni una posición de podio confirmada.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje).
- Limitaciones de contexto o idioma: no aplican en el sentido habitual; no se documentan.
- Caveat de producción: los avisos históricos embebidos pueden referirse a otros ficheros y estados de flujo de trabajo anteriores y no sustituyen el resultado de C1.
- Procedimiento ante objeción: si un autor objeta, debe detenerse el uso y escalar a coordinación de inmediato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-counter-c1-6c2f44c0
- Modelo base v10: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v10
- Modelo base s1s5: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- Repositorio de referencia de linaje: https://huggingface.co/rumezhak/microduck-sock-heist-nov17-v3
- Ficheros citados en la model card (no verificables desde la información disponible): `x86-replay-receipt.json`, `collision-screen.json`, `UPSTREAM-V10-EMBEDDED-NOTICES.json`, `upstream-attribution.json`, `NOTICE`
