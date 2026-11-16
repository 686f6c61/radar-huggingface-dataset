# jrubiosainz/microduck-tug-cup2p1-s3s5-e7d67488

## Resumen

Microduck Tug of War — cup2p1-s3s5 es una política de control para robótica simulada, publicada por jrubiosainz en Hugging Face como candidata para la "Microduck Arena", un entorno de competición de agentes robóticos basado en MuJoCo y desarrollado originalmente por Pollen Robotics. No es un modelo de lenguaje: es un grafo ONNX de pequeñas dimensiones que decide comandos de velocidad (`vx`) para un robot Microduck en una tarea de "tirar de la cuerda" (tug of war) contra otro agente. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta.

El modelo se construye por composición: parte de la política `cup2l1` de jrubiosainz (14 inicializadores y 16 de sus 17 nodos se conservan byte a byte) y le añade una capa de búsqueda en tabla inspirada en `hc6` de suraj-phanindra. Esa tabla contiene 347 filas, una por combate registrado en cada semilla oficial, con contribuciones nuevas de jrubiosainz para las semillas 3 y 5. Cuando ninguna fila coincide, la política delega en su propio lookup original y, en último término, en la red de self-play `lg21-5400` de lphatnguyen.

Su relevancia es acotada pero clara dentro del ecosistema Microduck: documenta con un nivel de trazabilidad poco habitual (hashes SHA256, receipts de replay, procedencia fila a fila) cómo se puede mejorar una política de control combinando una red existente con una tabla de experiencias grabadas, sin reentrenar la red. La model card advierte explícitamente de que es solo para simulación y no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de control (lookup en tabla + red de fallback); no es un transformer |
| Parametros totales | no disponible (no se declara recuento de parámetros; el repo pesa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible como licencia única; Apache-2.0 solo para las partes upstream que la llevan, con NOTICE de componentes |
| Formato de pesos | ONNX |
| Pipeline | robotics |
| Libreria | microduck |
| SHA256 de la politica | `e7d67488bda43ecd4d8a58e48f6e7e89baf40786080161fa73064d17c040b35f` |
| Comando canonico vx | `-0.3` |
| Filas de tabla | 347 (una por combate oficial registrado) |
| Modelos base | `suraj-phanindra/microduck-tug-hc6-aifund`, `jrubiosainz/microduck-tug-cup2l1-c23b073f` |

## Arquitectura y entrenamiento

La política no se entrena mediante descenso de gradiente en el sentido habitual. Se compone de dos piezas: (1) la red de `cup2l1`, conservada íntegra (14 inicializadores y 16 de 17 nodos verbatim), cuya última salida alimenta la nueva capa; y (2) una capa de lookup añadida a la salida, construida con el mismo patrón de nodo, máscara de observación y tolerancia que la de `hc6`. Esa capa contiene 347 filas: las de las semillas 1, 2 y 4 son las de `hc6` sin cambios; la semilla 3 usa las 56 primeras filas de `hc6` más 16 filas nuevas de jrubiosainz; la semilla 5 usa las 58 primeras de `hc6` más 11 filas nuevas.

El mecanismo de decisión es jerárquico: primero se consulta la tabla añadida; si no hay fila que coincida, decide `cup2l1` exactamente como antes (su propio lookup); y si este tampoco acierta, se recurre a la red de self-play `lg21-5400` de lphatnguyen. La model card subraya que este archivo conserva la red de `cup2l1` byte a byte y no contiene ningún tensor de la red de `hc6`; una comparación tensor a tensor encontró 6 de los 10 tensores de red de `titan-league` en `hc6`, pero ninguno de `cup2l1` en cuatro archivos ONNX de GinDuck.

La evaluación se realizó con un runner sobre un guest Linux x86_64 bajo QEMU (Python 3.12.3, MuJoCo 3.10.0, onnxruntime 1.24.4), con un receipt ligado al hash de la política. Las dos colas nuevas se encontraron y puntuaron de forma nativa en una VM x86_64 dentro de versiones de una sola cola de este archivo (semilla 3: 168.8976502418518; semilla 5: 168.8954210281372), y el guest reconstruyó ambas versiones byte a byte antes de puntuar el archivo final.

## Capacidades

- Generación de comandos de velocidad (`vx`) para el robot Microduck en la tarea de tug of war simulada.
- Decisión por coincidencia exacta en tabla sobre observaciones discretizadas, con máscara de observación y tolerancia definidas.
- Fallback determinista en cascada: tabla nueva → lookup de `cup2l1` → red de self-play `lg21-5400`.
- Cobertura de las cinco semillas oficiales de la Arena con al menos una fila registrada por combate.
- Reproducibilidad verificable: hash de política, receipt de replay y `table-provenance.json` con filas, hashes y origen por semilla.
- No soporta tool calling, function calling, agentes multi-paso, multilingüismo, visión, audio ni modo thinking; no es un modelo de lenguaje.

## Casos de uso

- Replay y auditoría de políticas en la Microduck Arena: cargar el ONNX y ejecutar las semillas oficiales para verificar que se reproduce el resultado declarado (`5/5 pit_won`, ganancia media de 168.8978385925293 cm) usando el receipt y el hash como referencia de integridad.
- Investigación sobre composición de políticas sin reentrenamiento: usar este archivo como caso de estudio de cómo añadir una capa de lookup sobre una red existente conservando los pesos originales y documentando la procedencia fila a fila.
- Baseline para experimentos de tug of war en MuJoCo: servir como oponente o como punto de partida en un entorno simulado con MuJoCo 3.10.0 y onnxruntime 1.24.4, que son las versiones con las que se validó.
- Docencia y divulgación sobre trazabilidad de artefactos: el par `table-provenance.json` + `NOTICE` es un ejemplo práctico de atribución de componentes y de verificación de tablas fuente al mismo seed y step.
- Pruebas de regresión de infraestructura de simulación: comparar el replay en un guest x86_64 bajo QEMU con los resultados nativos para detectar divergencias de versión en MuJoCo u onnxruntime.
- Análisis de linaje de modelos: reconstruir la cadena `cup2l1` → `hc6` → `titan-league` y las contribuciones de h7, L1, greecree, Unique007, lphatnguyen y GinDuck a partir de los hashes citados en la model card.

## Benchmarks y rendimiento

Resultados de replay local declarados por el autor (semillas oficiales in-sample; no es un resultado de Arena):

| Semilla | Resultado | Ganancia (cm) |
|---|---|---:|
| 1 | `pit_won` | 169.02586817741394 |
| 2 | `pit_won` | 169.06843781471252 |
| 3 | `pit_won` | 168.45614314079285 |
| 4 | `pit_won` | 169.40545439720154 |
| 5 | `pit_won` | 168.53328943252563 |
| Media | 5/5 `pit_won` | 168.8978385925293 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, ni comparaciones head-to-head fuera de semilla. El propio autor advierte de que el replay local no establece fuerza off-seed ni garantiza el resultado en la Arena, y de que no existe una ejecución nativa x86 de estos bytes exactos.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio declara 0.0 GB y el grafo es un ONNX de lookup más una red pequeña, por lo que la huella esperada es mínima, pero no se publica una cifra.
- GPU recomendadas: no disponible; la validación se hizo en CPU sobre un guest x86_64 bajo QEMU con onnxruntime 1.24.4, sin mención de GPU.
- ¿Cabe en GPU consumer? No se documenta, pero por el tamaño del artefacto (0.0 GB) es plausible en cualquier GPU consumer; el autor no lo confirma.
- Despliegue: onnxruntime (versión validada 1.24.4) dentro de MuJoCo 3.10.0 con Python 3.12.3; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `jrubiosainz/microduck-tug-cup2p1-s3s5` (este) | ONNX, lookup + red `cup2l1` | no disponible | no aplica | 5/5 `pit_won`, media 168.8978 cm (replay local) | sin licencia única; Apache-2.0 solo en partes upstream | pública en HF, 0 descargas |
| `jrubiosainz/microduck-tug-cup2l1-c23b073f` | ONNX, red + lookup propio | no disponible | no aplica | no disponible en la información | no disponible | pública en HF |
| `suraj-phanindra/microduck-tug-hc6-aifund` | ONNX, red + lookup de 347 filas | no disponible | no aplica | resultados por semilla públicos citados, sin cifras en esta ficha | sin campo de licencia ni LICENSE observados en la lectura inicial | pública y sin gating |
| `lphatnguyen/microduck-tug-of-war-v2` (red `lg21-5400`) | ONNX, red de self-play | no disponible | no aplica | no disponible en la información | no disponible | pública en HF |

## Limitaciones y advertencias

- Solo simulación: la model card prohíbe explícitamente cargar esta política en un robot físico.
- Los resultados presentados son de replay local sobre semillas oficiales in-sample; no demuestran fuerza frente a oponentes fuera de esas semillas ni garantizan el resultado en la Arena.
- No existe una ejecución nativa x86 de estos bytes exactos; la validación es en un guest bajo QEMU, lo que introduce una capa de emulación.
- Licencia ambigua: no hay licencia única declarada. Apache-2.0 cubre solo las partes upstream que la llevan; para las partes sin licencia, la concesión de los Términos de Servicio de Hugging Face se limita al uso a través de sus servicios y no sustituye a licencias de componentes.
- Riesgo de atribución: la model card documenta discrepancias entre `tug-super-v11` y `tug-dat-v4` sobre el origen de ciertos combates (semillas 1, 2, 3 y 5), lo que exige revisar `NOTICE` antes de reutilizar filas.
- Dependencia de versiones concretas (MuJoCo 3.10.0, onnxruntime 1.24.4, Python 3.12.3); divergencias pueden alterar el replay.
- Sin datos de sesgo, alucinación o cobertura idiomática porque no procesa lenguaje; esas categorías no aplican.
- Sin descargas ni likes en el momento de la consulta, y sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup2p1-s3s5-e7d67488
- Modelo base `cup2l1`: https://huggingface.co/jrubiosainz/microduck-tug-cup2l1-c23b073f
- Modelo base `hc6`: https://huggingface.co/suraj-phanindra/microduck-tug-hc6-aifund
- Red de fallback `lg21-5400`: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
- Base declarada de `hc6`: https://huggingface.co/GinDuck/microduck-tug-titan-league
- Perfil del autor: https://huggingface.co/jrubiosainz
- Pollen Robotics (Microduck y Arena): https://huggingface.co/pollen-robotics
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
