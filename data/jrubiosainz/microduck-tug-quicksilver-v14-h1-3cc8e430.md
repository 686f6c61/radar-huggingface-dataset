# jrubiosainz/microduck-tug-quicksilver-v14-h1-3cc8e430

## Resumen

Microduck Tug of War - quicksilver v14 h1 (identificador `3cc8e430`) es una política de control para robótica de simulación, publicada por el usuario jrubiosainz en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es un grafo ONNX de tamaño muy reducido (972.116 bytes) que implementa una política de comportamiento para la competición de "tug of war" (tira y afloja) de la Microduck Arena, un entorno de simulación de robótica. El modelo se distribuye bajo la librería `microduck` y el pipeline `robotics`, y está pensado exclusivamente para su uso en simulación.

El modelo es un finetune estructural del policy público de HlibPlakhtii `microduck-tug-quicksilver-v14` (revisión `a2f41160...`). La modificación introducida por jrubiosainz no entrena pesos nuevos: añade dos "observation lookups" (tablas de búsqueda de acciones) al grafo heredado mediante la función `overlay()` del script `search_race.py` del autor base. Cada lookup compara los primeros 48 valores de observación con tolerancia 1e-7 y, si hay coincidencia, emite una acción almacenada; en caso contrario, delega en el grafo heredado, que se conserva byte a byte en todos sus inicializadores y nodos.

La relevancia del artefacto es acotada y muy específica: documenta una mejora marginal de rendimiento en dos semillas concretas de la Arena (semilla 3 y semilla 4) dentro de un ejercicio de optimización in-sample. Su interés técnico reside en la metodología de overlay sobre grafos ONNX congelados y en la trazabilidad de créditos y hashes, no en capacidades generales de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de política de control (no transformer); grafo heredado más dos lookups de observación añadidos por overlay |
| Parametros totales | no disponible (el artefacto pesa 972.116 bytes; no se declara recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 48 valores comparados por lookup |
| Tipos de cuantizacion | no disponible (pesos en el grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 solo para la contribución heredada según `NOTICE`; el modelo combinado no tiene licencia propia declarada |
| Formato de pesos | ONNX (grafo dentro del repositorio `microduck`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo generativo: es un grafo computacional ONNX que mapea observaciones del entorno de simulación a acciones de control. El grafo base procede de `HlibPlakhtii/microduck-tug-quicksilver-v14` (SHA-256 de política `e3fd9ac7...`, 960.584 bytes), que a su vez es un remix atribuido de `jrubiosainz/microduck-tug-lphat-c2-s1s5`, combinación de `lphatnguyen/microduck-tug-of-war-v0` con filas de semillas 1 y 5 de una búsqueda C2 previa. La modificación de este repositorio preserva íntegramente el grafo heredado y solo renombra la salida del último nodo base para alimentar el primer lookup nuevo.

El "entrenamiento" de la contribución añadida consistió en una búsqueda CMA-ES separable (cma 4.5.0, sigma 0.01, población 32, stride 2) ejecutada sobre las utilidades `search_tug.py` y `search_race.py` del autor base, con la física de la Arena sin modificar y sobre Linux x86_64. Se generaron dos lookups: el lookup 1 cubre la semilla oficial 3 con 18 filas (filas de búsqueda k54-k71, prefijo de inicializador `search2_`) y el lookup 2 cubre la semilla oficial 4 con 14 filas (k46-k59, prefijo `search3_`). No se entrenaron ni modificaron pesos de red, ni física, árbitro, servidor o datos de leaderboard.

## Capacidades

- Control de política en simulación para la tarea "tug of war" de Microduck Arena, emitiendo acciones a partir de observaciones del entorno.
- Coincidencia exacta por lookup: compara los primeros 48 valores de observación con tolerancia 1e-7 y reproduce la acción almacenada si hay match.
- Fallback determinista al grafo heredado cuando ningún lookup coincide, manteniendo el comportamiento del policy base.
- Mejora localizada en dos semillas (3 y 4) respecto al base, sin alterar el comportamiento en las semillas 1, 2 y 5 (bit-idénticas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo thinking.
- No es un controlador de locomoción general ni una política transferible a robot físico.

## Casos de uso

- Replicación de experimentos en Microduck Arena: cargar el grafo ONNX con el runner 5 y el árbol fijado de Arena 0.7.0 para reproducir la media de 166,61849737167358 cm con cinco victorias por caída en el comando vx -0.3.
- Estudio de metodología de overlay sobre grafos congelados: sirve como ejemplo reproducible de cómo añadir tablas de lookup a un policy ONNX sin reentrenar, conservando hashes y trazabilidad de créditos.
- Comparación de políticas base frente a variantes optimizadas: permite medir la ganancia marginal de la búsqueda CMA-ES en semillas 3 (166,28799438476562 a 166,39045476913452 cm) y 4 (166,7003333568573 a 166,80973172187805 cm).
- Docencia e investigación en optimización de políticas para robótica simulada: el par (grafo base, overlay) ilustra el compromiso entre generalización y ajuste in-sample sobre arranques declarados.
- Auditoría de linaje de modelos: el repositorio documenta cadena de custodia (hashes SHA-256, revisiones, `NOTICE`, `BASE_MODEL_CARD.md`) útil para estudiar procedencia de artefactos en Hugging Face.
- Pruebas de reproducibilidad numérica: permite evaluar la sensibilidad a la reproducción en coma flotante de un pipeline de simulación con física fija.
- Integración en pipelines de evaluación automatizada de la Arena: el tamaño reducido (menos de 1 MB) facilita su inclusión en suites de regresión de políticas.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la replay nativa con el árbol fijado de Arena 0.7.0 y runner 5, comando vx -0.3. No son el resultado oficial de la Arena (el resultado público de la Arena es la referencia autoritativa).

| Metrica | Base (`quicksilver-v14`) | Este modelo (`h1-3cc8e430`) |
|---|---|---|
| Media global (cm) | 166,57612562179565 | 166,61849737167358 |
| Semilla 1 | bit-idéntica | bit-idéntica |
| Semilla 2 | bit-idéntica | bit-idéntica |
| Semilla 3 (cm) | 166,28799438476562 | 166,39045476913452 |
| Semilla 4 (cm) | 166,7003333568573 | 166,80973172187805 |
| Semilla 5 | bit-idéntica | bit-idéntica |
| Victorias por caída | no disponible | 5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB de pesos (972.116 bytes); cabe holgadamente en cualquier GPU, CPU o incluso en memoria de un microcontrolador de gama alta.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU con soporte ONNX Runtime es suficiente. No se documentan requisitos específicos de A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e integrada; también en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo), con la librería `microduck` y el runner 5 de Arena 0.7.0 para la replay canónica. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada; el coste computacional es el de un grafo ONNX de menos de 1 MB con dos comparaciones de 48 valores.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`h1-3cc8e430`) | 972.116 bytes (ONNX) | 48 valores por lookup | Media 166,61849737167358 cm (replay nativa) | Apache-2.0 solo en la parte heredada; sin licencia propia | Hugging Face, 0 descargas, 0 likes |
| `HlibPlakhtii/microduck-tug-quicksilver-v14` (base) | 960.584 bytes (ONNX) | no disponible | Media 166,57612562179565 cm (replay nativa) | Apache-2.0 según `NOTICE` del base | Hugging Face |
| `jrubiosainz/microduck-tug-lphat-c2-s1s5` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `lphatnguyen/microduck-tug-of-war-v0` | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento de las alternativas más allá de la comparación directa con el base en la replay nativa; no se conocen otros modelos comparables fuera de la cadena de linaje documentada.

## Limitaciones y advertencias

- Optimización in-sample: los lookups se ajustaron sobre los arranques de simulación declarados (semillas 3 y 4), por lo que la mejora no garantiza generalización a otras semillas o condiciones.
- Sensibilidad a coma flotante: la replay exacta depende de la reproducción numérica; pequeñas diferencias pueden alterar las coincidencias de los lookups (tolerancia 1e-7 sobre 48 valores).
- No es un controlador de locomoción general ni una política para robot físico: la model card advierte explícitamente de no ejecutarlo en un robot real.
- Solo simulación: cualquier uso fuera de Microduck Arena no está validado.
- Licencia ambigua para uso comercial: Apache-2.0 se aplica únicamente a la contribución heredada según `NOTICE`, no al modelo combinado, y el autor no añade licencia propia; conviene revisar `NOTICE` y `LICENSE-apache-2.0.txt` antes de cualquier uso comercial.
- Sin datos de sesgo, alucinación o idioma: no aplican en el sentido habitual, al no ser un modelo de lenguaje; no se documentan riesgos de este tipo.
- Créditos y atribución obligatorios: la cadena de linaje (HlibPlakhtii, jrubiosainz, lphatnguyen, a1rb4Ck, rumezhak, juicenv, greecree, Pollen Robotics y contribuyentes upstream) debe mantenerse según `NOTICE` y `BASE_MODEL_CARD.md`.
- Resultado autoritativo: la replay nativa no es el resultado oficial de la Arena; el leaderboard público prevalece.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h1-3cc8e430
- Modelo base: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14/tree/a2f41160287beb86c23e287030a69f4e2226180f
- Model card del base: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14/blob/a2f41160287beb86c23e287030a69f4e2226180f/BASE_MODEL_CARD.md
- Remix intermedio: https://huggingface.co/jrubiosainz/microduck-tug-lphat-c2-s1s5/tree/46d9c19697dbe10acfb04317c7c0931d991dc41c
- Política original upstream: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0/tree/bca92ace3a25d383e806456bedc4148807cdcdf6
