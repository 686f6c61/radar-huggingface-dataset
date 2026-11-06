# jrubiosainz/microduck-tug-h7p1b-aa128e6e

## Resumen

Microduck Tug of War - h7p1b (identificador de política `aa128e6e`) es una política de control para robótica simulada publicada por el usuario `jrubiosainz` en Hugging Face dentro del ecosistema Microduck. No es un modelo de lenguaje: es un artefacto de inferencia orientado a la tarea "tug of war" (tira y afloja) del entorno de simulación Microduck Arena, empaquetado en formato ONNX y con una librería de ejecución propia (`microduck`). El artefacto pesa 910.894 bytes y su SHA256 es `aa128e6eb88ccdef3e5ea7b8a0486f80aab1206030e64a080bcbc84f34cffa49`.

La política se construye sobre `azukiq/microduck-titan-v1` como modelo base y sobre `greecree/microduck-tug-of-war-tug-super-v11` como referencia de comportamiento, combinando un adaptador de sesgo denominado "cup-v2" y una tabla de búsqueda de observaciones de 347 filas. Según la model card, 283 filas coinciden exactamente con v11 y dat-v4 en los mismos índices, mientras que 64 filas son "colas reoptimizadas" sobre las semillas 1, 2, 3 y 5. El autor declara explícitamente que el modelo es solo para simulación y no debe desplegarse en un robot físico.

El resultado reportado es una media de 168,89 cm en la métrica de la tarea (con cinco episodios que oscilan entre 168,44 y 169,40 cm), con cinco resultados `pit_won`, 347/347 aciertos de tabla y cero pasos de fallback. Es relevante ahora como ejemplo de política derivada por búsqueda tabular sobre un modelo base, con trazabilidad de procedencia fila a fila, aunque su alcance es muy acotado y su valor práctico fuera del entorno Microduck Arena es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica simulada (modelo base `microduck-titan-v1` + adaptador de sesgo cup-v2 + tabla de búsqueda de observaciones de 347 filas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefacto ONNX de 910.894 bytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible como licencia nueva; se incluye `LICENSE-apache-2.0.txt` que aplica solo a las partes que lo portan |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal en detalle. Lo que se documenta es un pipeline de composición: se parte de `azukiq/microduck-titan-v1` como fallback, se le añade el adaptador de sesgo "cup-v2" y se superpone una tabla de búsqueda de observaciones de 347 filas que mapea observaciones a acciones. La política final se distribuye como artefacto ONNX ejecutable mediante la librería `microduck`, con un runner identificado como "runner 5" y un comando de evaluación `command_vx -0.3`.

El proceso de construcción descrito es de optimización por búsqueda sobre semillas concretas: 283 filas son idénticas a las de `greecree/microduck-tug-of-war-tug-super-v11` y `dat-v4` en los mismos índices, y 64 filas son colas reoptimizadas sobre las semillas 1, 2, 3 y 5. El autor indica que ninguna fila exclusiva de v11 procedente de las colas de semilla 1 o semilla 5 de greecree permanece en la tabla final, y que esta última formó parte del "bout" de búsqueda inicial de semilla 5. No se documentan número de tokens de entrenamiento, composición de dataset, RLHF ni DPO, por lo que no es posible evaluar el proceso de aprendizaje subyacente más allá de esta descripción de procedencia.

## Capacidades

- Control de política para la tarea "tug of war" en el simulador Microduck Arena.
- Evaluación nativa en x86_64 mediante la función oficial `evaluate()` del entorno.
- Ejecución con runner 5 y comando `command_vx -0.3`.
- Tabla de búsqueda de observaciones con 347 entradas y cobertura completa (347/347 aciertos reportados).
- Mecanismo de fallback al modelo base `microduck-titan-v1` cuando no hay coincidencia en tabla (aunque en la evaluación reportada no se activó: cero pasos de fallback).
- Adaptador de sesgo cup-v2 para modular el comportamiento respecto al base.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo.

## Casos de uso

- Evaluación comparativa en Microduck Arena: la política puede cargarse en el runner 5 del simulador para medir su rendimiento en la tarea "tug of war" y compararlo con `greecree/microduck-tug-of-war-tug-super-v11` y `dat-v4` bajo las mismas condiciones de semilla.
- Reproducción de resultados de investigación: el SHA256 y el recuento de filas permiten verificar que el artefacto evaluado es exactamente el publicado, lo que facilita la reproducibilidad de los 168,89 cm reportados.
- Estudio de procedencia de políticas derivadas: la distinción entre 283 filas heredadas y 64 filas reoptimizadas permite analizar qué parte del comportamiento proviene de v11 y qué parte de la búsqueda propia del autor.
- Base para ablaciones sobre el adaptador cup-v2: al estar separado el adaptador del modelo base, se puede experimentar con su activación o desactivación para medir su contribución en la métrica de la tarea.
- Docencia y divulgación sobre robótica simulada: el tamaño reducido del artefacto (910.894 bytes) y su formato ONNX lo hacen adecuado como ejemplo didáctico de política tabular con fallback a un modelo base.
- Integración en pipelines de evaluación automatizada: la función `evaluate()` nativa en x86_64 permite incorporar la política a suites de test que validen regresiones en la tarea de tira y afloja.
- No debe usarse en robótica física: la propia model card lo prohíbe explícitamente ("Do not deploy this policy on a physical robot").

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Evaluación nativa x86_64, runner 5, `command_vx -0.3` (episodio 1) | 169,0248727798462 cm |
| Evaluación nativa x86_64, runner 5, `command_vx -0.3` (episodio 2) | 169,06685829162598 cm |
| Evaluación nativa x86_64, runner 5, `command_vx -0.3` (episodio 3) | 168,43591928482056 cm |
| Evaluación nativa x86_64, runner 5, `command_vx -0.3` (episodio 4) | 169,39826011657715 cm |
| Evaluación nativa x86_64, runner 5, `command_vx -0.3` (episodio 5) | 168,529611825943 cm |
| Media de los cinco episodios | 168,89110445976257 cm |
| Resultados `pit_won` | 5 de 5 |
| Aciertos de tabla | 347/347 |
| Pasos de fallback | 0 |

No se han publicado resultados de benchmarks frente a modelos comparables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto ONNX pesa 910.894 bytes, por lo que la huella de pesos es inferior a 1 MB, pero no se documenta la memoria requerida por el runtime `microduck`.
- GPU recomendadas: no disponible; la evaluación reportada se realizó en CPU nativa x86_64 mediante la función oficial `evaluate()`.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte CUDA ni requisitos de acelerador.
- Opciones de despliegue: librería `microduck` con runner 5 y comando `command_vx -0.3`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano del artefacto | Metrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-tug-h7p1b-aa128e6e` (este) | Política tabular + fallback titan-v1 | 910.894 bytes | 168,89 cm de media en 5 episodios | No disponible como licencia nueva; Apache-2.0 solo en partes que lo portan | Hugging Face, 0 descargas, 0 likes |
| `greecree/microduck-tug-of-war-tug-super-v11` | Política de referencia (upstream) | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face (referenciado como modelo base) |
| `azukiq/microduck-titan-v1` | Modelo base de fallback | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face (referenciado como modelo base) |
| `jrubiosainz/microduck-tug-h5b-3976f431` | Política hermana del mismo autor | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Restricción explícita de uso: la model card indica "Simulation only. Do not deploy this policy on a physical robot". El uso en robótica física está prohibido por el autor.
- Alcance muy limitado: la política está especializada en la tarea "tug of war" del simulador Microduck Arena y no es transferible a otras tareas sin reentrenamiento o reoptimización.
- Licencia ambigua: no se afirma una licencia nueva y `LICENSE-apache-2.0.txt` aplica solo a las partes que lo portan; el resto queda sin licencia explícita, lo que genera incertidumbre para uso comercial o redistribución.
- Procedencia parcial: 64 de las 347 filas son reoptimizaciones propias sobre semillas 1, 2, 3 y 5, lo que implica que el comportamiento en esas regiones del espacio de observaciones difiere del de v11 y dat-v4; no se documenta el impacto de esa divergencia fuera de la evaluación reportada.
- Dependencia de tabla: el rendimiento reportado (347/347 aciertos, cero fallback) se obtuvo en la evaluación específica; fuera de esa distribución de observaciones el sistema recurriría a `microduck-titan-v1`, cuyo comportamiento no se cuantifica en la información disponible.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje).
- Limitaciones de contexto o idioma: no aplica; no se documentan idiomas soportados.
- Métricas con base estrecha: la media de 168,89 cm se calcula sobre cinco episodios, sin intervalos de confianza ni evaluación en semillas distintas a las reportadas.
- Estado de adopción nulo: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-h7p1b-aa128e6e
- Repositorio GitHub del autor: https://github.com/jrubiosainz/microduck
- Política hermana h5b: https://huggingface.co/jrubiosainz/microduck-tug-h5b-3976f431
- Modelo base de fallback: https://huggingface.co/azukiq/microduck-titan-v1
- Política de referencia upstream: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v11
