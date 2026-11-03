# jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s3-s4-s5

## Resumen

`microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s3-s4-s5` es una política de control para el juego Tug of War de la Microduck Arena, un entorno de competición de robótica simulada organizado por Pollen Robotics. Lo publica el usuario `jrubiosainz` como una modificación quirúrgica de la entrada `game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3`, que a su vez deriva de la política `microduck-tug` de `a1rb4Ck`. No se trata de un modelo de lenguaje: es un artefacto ONNX con una tabla de búsqueda (`L`) como capa más externa y una red neuronal subyacente que actúa como respaldo cuando la observación no coincide con ninguna fila almacenada.

La modificación consiste en sustituir 85 filas de la tabla `L` que gobiernan los combates de rating de las semillas 3, 4 y 5, desde determinados pasos de política hasta el final del combate. Las filas nuevas se obtuvieron mediante una búsqueda CMA-ES separable sobre offsets aplicados a las acciones originales, con el runner de tug de la Arena sobre una máquina x86_64. No hubo entrenamiento ni cambio alguno en los pesos de la red: el grafo y todos los inicializadores subyacentes son idénticos byte a byte a los de la entrada precedente.

El interés del artefacto es acotado pero concreto: documenta con precisión forense cómo se puede mejorar marginalmente una política de referencia en un entorno competitivo sin reentrenar, solo reemplazando filas de una tabla de memoria asociativa. Para desarrolladores e investigadores es un ejemplo de optimización de política por búsqueda directa en el espacio de acciones, y de trazabilidad de linaje en modelos derivados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control con tabla de búsqueda asociativa (`L`, 508 filas) sobre red neuronal subyacente; exportada como grafo ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la tabla `L` compara los primeros 48 de 61 valores de observación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política es un híbrido entre una tabla de búsqueda y una red neuronal. La capa más externa, `L`, contiene 508 filas; cada fila almacena una observación y la acción correspondiente. En inferencia, si los primeros 48 de los 61 valores de observación coinciden con alguna fila almacenada dentro de una tolerancia de 1e-7, se ejecuta la acción memorizada; en caso contrario, responde la red subyacente. El grafo ONNX y todos los inicializadores por debajo de `L` son idénticos byte a byte a los de la política `microduck-tug` de `a1rb4Ck`, que a su vez hereda de una cadena de políticas tabulares (`microduck-tug-tab-v2`, `tab-v1`, `quicksilver-v13`) con componentes de league training.

No se realizó entrenamiento en esta modificación. Las 85 filas nuevas se generaron mediante una búsqueda CMA-ES separable sobre offsets aditivos aplicados a las acciones de la entrada original, con interpolación lineal por tramos en el tiempo entre nudos separados 2 o 3 pasos de política. La búsqueda maximizaba la puntuación del combate contra el pato de referencia congelado, usando el runner de tug de la Arena. Los offsets resultantes están acotados a 0,038 en valor absoluto. Las filas eliminadas corresponden a los pasos 137-161 de la semilla 3, 77-96 de la semilla 4 y 29-68 de la semilla 5; las semillas 1 y 2 permanecen intactas.

## Capacidades

- Control de política para el juego Tug of War de la Microduck Arena, con acciones deterministas derivadas de la observación de 61 valores.
- Memorización exacta de trayectorias mediante la tabla `L`, con coincidencia por tolerancia de 1e-7 sobre los primeros 48 valores de observación.
- Generalización limitada a observaciones no memorizadas mediante la red neuronal subyacente.
- Reproducción determinista de combates de rating para las semillas 1 a 5, con puntuaciones verificadas en la model card.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.
- No dispone de modo thinking ni de decodificación especulativa; es una política de control, no un generador de texto.

## Casos de uso

- Evaluación comparativa de políticas en la Microduck Arena: el artefacto permite reproducir los combates de rating de las semillas 1 a 5 con puntuaciones documentadas (165,89 / 165,97 / 165,64 / 166,54 / 167,41 cm), lo que facilita comparar entradas de la competición bajo condiciones idénticas.
- Investigación en optimización de políticas por búsqueda directa: sirve como caso de estudio de CMA-ES separable aplicado a offsets de acción con interpolación por tramos, sin reentrenamiento de pesos, para medir cuánto se puede mejorar una política congelada.
- Auditoría de linaje de modelos derivados: la model card detalla fila por fila qué se eliminó y qué se añadió, con referencias a revisiones concretas (`099ced00`, `f7f7705b`, `b725cd39`), lo que permite verificar la procedencia de cada componente.
- Reproducción de experimentos en robótica simulada: el archivo ONNX se puede cargar con el runner de la Arena en máquinas x86_64 para replicar los combates y validar las puntuaciones declaradas.
- Docencia sobre memorización versus generalización en políticas de control: la tabla `L` con respaldo neuronal ilustra el compromiso entre cobertura exacta de estados visitados y respuesta ante estados nuevos.
- Base para futuras modificaciones de la comunidad: al mantener intactos el grafo y los inicializadores, cualquier investigador puede partir de este archivo y sustituir filas adicionales de `L` siguiendo el mismo procedimiento documentado.

## Benchmarks y rendimiento

La model card proporciona puntuaciones de combate de rating (en centímetros) para cada semilla, comparando la entrada original con la reproducción de este archivo:

| Semilla | Paso de búsqueda | Filas eliminadas | Filas añadidas | Run original (cm) | Este archivo (cm) |
|---|---|---|---|---|---|
| 1 | sin cambios | ninguna | ninguna | 165,88760018348694 | 165,88760018348694 |
| 2 | sin cambios | ninguna | ninguna | 165,97312092781067 | 165,97312092781067 |
| 3 | 137 | 274-286, 460-471 | 423-447 | 165,62923192977905 | 165,6402349472046 |
| 4 | 77 | 364-371, 448-459 | 448-467 | 166,5420114994049 | 166,54235124588013 |
| 5 | 29 | 401-440 | 468-507 | 167,15307235717773 | 167,40922331809998 |

Para referencia, la política base `microduck-tug` de `a1rb4Ck` en revisión `099ced00` obtuvo 166,19724988937378 cm con 5 de 5 pits ganados (run `01M6C7BQG0VKY44AZ3S7EY`); la revisión `f7f7705b` obtuvo 166,22851252555847 cm (run `01M6CD51792XQJ8T1QGPBM`); y la revisión `b725cd39` obtuvo 166,23209476470947 cm (run `01M6CM55RSZJJSG3Z1RQX1`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el archivo es un ONNX de política tabular, por lo que la huella debería ser muy reducida.
- GPU recomendadas: no disponible; la model card menciona ejecución en máquina x86_64 con el runner de la Arena, sin especificar acelerador.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño del artefacto es plausible que quepa en cualquier GPU de consumo, pero no se documenta.
- Opciones de despliegue: el runner de tug de la Microduck Arena sobre x86_64; carga del archivo `policy.onnx` con un runtime ONNX estándar. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación de rating | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este archivo (`jrubiosainz/...cma-s3-s4-s5`) | no disponible (tabla `L` de 508 filas + red) | no aplica | 165,89 / 165,97 / 165,64 / 166,54 / 167,41 cm (semillas 1-5) | Apache 2.0 | HuggingFace |
| `a1rb4Ck/microduck-tug` (rev. `099ced00`) | no disponible | no aplica | 166,19724988937378 cm | Apache 2.0 | HuggingFace |
| `a1rb4Ck/microduck-tug` (rev. `f7f7705b`) | no disponible | no aplica | 166,22851252555847 cm | Apache 2.0 | HuggingFace |
| `a1rb4Ck/microduck-tug` (rev. `b725cd39`) | no disponible | no aplica | 166,23209476470947 cm | Apache 2.0 | HuggingFace |
| `rumezhak/microduck-tug-tab-v2` (rev. `b63e3587`) | no disponible | no aplica | 165,1954472064972 cm | no disponible en la información | HuggingFace |

## Limitaciones y advertencias

- La mejora es marginal y específica de las semillas 3, 4 y 5: en la semilla 3 la puntuación apenas sube de 165,6292 a 165,6402 cm, y en la semilla 4 de 166,5420 a 166,5424 cm; solo la semilla 5 muestra una ganancia apreciable (167,1531 a 167,4092 cm).
- La política depende de la coincidencia exacta con filas memorizadas (tolerancia 1e-7 sobre 48 valores); ante variaciones mínimas de observación, delega en la red subyacente, cuyo comportamiento no se ha modificado ni evaluado en esta ficha.
- Las filas añadidas se optimizaron contra un pato de referencia congelado en un entorno concreto (runner de tug sobre x86_64); no hay garantía de que los offsets generalicen a otras configuraciones, versiones del runner o condiciones de simulación.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo descrito; al no ser un modelo de lenguaje, estos riesgos se traducen en posibles acciones subóptimas ante estados no memorizados.
- La licencia Apache 2.0 se hereda de la política base `microduck-tug`, pero la model card no detalla obligaciones adicionales de atribución más allá de las créditos listados; conviene revisar el archivo `NOTICE` del repositorio antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño declarado es 0,0 GB; no se especifican dependencias de runtime ni versión mínima de ONNX.
- El nombre del modelo codifica el linaje de revisiones y semillas, pero no se documenta un proceso de validación independiente de las puntuaciones declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s3-s4-s5
- Espacio de la Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Política base `a1rb4Ck/microduck-tug`: https://huggingface.co/a1rb4Ck/microduck-tug
- Política `rumezhak/microduck-tug-tab-v2`: https://huggingface.co/rumezhak/microduck-tug-tab-v2
- Política `littlebeanhp/microduck-tug-tab-v1`: https://huggingface.co/littlebeanhp/microduck-tug-tab-v1
- Política `HlibPlakhtii/microduck-tug-quicksilver-v13`: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v13
- Perfil de `a1rb4Ck`: https://huggingface.co/a1rb4Ck
- Perfil de `rumezhak`: https://huggingface.co/rumezhak
- Perfil de `littlebeanhp`: https://huggingface.co/littlebeanhp
- Perfil de `HlibPlakhtii`: https://huggingface.co/HlibPlakhtii
