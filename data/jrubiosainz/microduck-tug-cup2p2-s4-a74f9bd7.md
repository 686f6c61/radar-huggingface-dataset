# jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7

## Resumen

Microduck Tug of War cup2p2-s4-a74f9bd7 es una politica de control para robótica, empaquetada como grafo ONNX y publicada por el usuario jrubiosainz en Hugging Face. No es un modelo de lenguaje: es una política de comportamiento ("policy") para la competición Microduck Tug of War, un entorno de simulación de robots cuadrúpedos desarrollado en el ecosistema de Pollen Robotics. El modelo se ejecuta exclusivamente en simulación y el autor advierte explícitamente de que no debe cargarse en un robot físico.

El artefacto es fundamentalmente una tabla de búsqueda ("lookup table") de 347 filas que mapea observaciones a acciones, combinada con una red de respaldo ("fallback network") y metadatos heredados. La mayor parte del contenido es una composición de políticas previas: 27 nodos y 18 de 20 inicializadores son idénticos byte a byte a la política cup2p1-s3s5 del propio autor, y solo cambian los tensores `search_obs` y `search_act`. La contribución nueva se limita a 16 filas del seed 4, generadas mediante búsqueda con CMA-ES.

Su relevancia es acotada y muy específica: sirve como ejemplo de ingeniería de políticas para competiciones de robótica simulada, con trazabilidad exhaustiva de procedencia (hashes, pines de revisión, recibos de verificación) y una evaluación local sobre cinco seeds fijos. No aporta capacidades de propósito general ni resultados fuera de muestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tabla de búsqueda (lookup) de 347 filas más red de respaldo (fallback) |
| Parametros totales | no disponible (no se declara recuento de parámetros; 27 nodos y 20 inicializadores en el grafo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible (pesos ONNX sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; el autor no declara licencia nueva ni global. Apache-2.0 solo para las partes que la portan |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB (según Hugging Face) |
| SHA256 de la politica | a74f9bd7b53b80a465c2798f5cb47915a1c5fd443b267f72efcb9903492fb9e7 |
| Comando canonico vx | -0.3 |
| Modelos base | suraj-phanindra/microduck-tug-hc7-aifund, jrubiosainz/microduck-tug-cup2p1-s3s5-e7d67488, jrubiosainz/microduck-tug-cup2l1-c23b073f |
| Relacion con modelos base | merge |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

La política no es una red neuronal entrenada de extremo a extremo, sino un grafo ONNX que combina una tabla de búsqueda explícita con una red de respaldo. El grafo conserva la estructura completa de la política cup2p1-s3s5 (commit `3921ed2c3abeaad279a2bbc3bd97e8f2a5707468`, política `e7d67488...`): 27 nodos y 18 de 20 inicializadores son byte-idénticos, y solo se modifican los tensores `search_obs` y `search_act`. La red de respaldo es la red lg21-5400 de lphatnguyen, con su lookup a través de cup2l1, y no la red derivada de GinDuck que usa hc7.

La tabla añadida tiene 347 filas ordenadas por seeds 1, 2, 3, 5, 4. Las filas de los seeds 1, 2, 3 y 5 se copian literalmente de suraj-phanindra/microduck-tug-hc7-aifund (revisión `6f57bdcaa9f407a2d87b813d3e019973e85f225e`), incluidas las mejoras de hc7 en las últimas cinco filas de los seeds 3 y 5. El seed 4 conserva las primeras 54 filas de hc7 y sustituye las filas locales 54-69 por 16 filas nuevas buscadas por jrubiosainz. En la fila 54 la observación se hereda y la acción es nueva; en las filas 55-69 tanto observación como acción son nuevas. La búsqueda empleó offsets de acción con CMA-ES, nodos ("knots") cada dos pasos desde el paso 54, sigma 0.002, población 16, con el mejor resultado en la generación 256, ejecutada en una VM x86_64. No se entrenó ni modificó ningún peso de red para esta entrada. El archivo `table-provenance.json` documenta rangos de filas, hashes y pines de origen.

## Capacidades

- Control de política para el entorno de simulación Microduck Tug of War, con salida de acciones a partir de observaciones.
- Ejecución determinista mediante lookup: cada paso evaluado fue un acierto de tabla, sin uso del fallback.
- Red de respaldo disponible para observaciones fuera de tabla (aunque no se activó en la evaluación local).
- Compatibilidad con el runner nativo x86 (runner-v5) y con ONNX Runtime.
- Reproducibilidad verificada: reconstrucción y replay en QEMU x86_64 que reproduce el candidato byte a byte.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en competiciones de robótica simulada: sirve como referencia de política composicional para el entorno Microduck Tug of War, con procedencia documentada fila a fila.
- Reproducción de resultados: los recibos `native-verdict.json` y `x86-replay-receipt.json` permiten replicar la verificación en una VM x86_64 con Python 3.12.3, NumPy 2.4.1, MuJoCo 3.10.0 y ONNX Runtime 1.24.4.
- Estudio de metodologías de búsqueda: el uso de CMA-ES con knots cada dos pasos y población 16 sobre un tramo acotado de la tabla es un caso concreto de optimización de políticas por búsqueda local.
- Auditoría de linaje de modelos: `table-provenance.json` y los ficheros NOTICE permiten trazar la ascendencia de cada bloque de filas entre múltiples autores.
- Desarrollo de runners y herramientas de evaluación: el par ONNX más tabla es un banco de pruebas para validar runners de inferencia y comprobaciones de jueces.
- Docencia sobre empaquetado ONNX: el grafo con tabla, fallback y metadatos heredados ilustra cómo se compone un artefacto de inferencia con restricciones de bytes evaluados.

## Benchmarks y rendimiento

Resultados locales declarados por el autor sobre cinco seeds fijos, en muestra, con verificación runner-v5 nativa (13 comprobaciones de juez superadas):

| Seed | Resultado | Terreno ganado (cm) |
|---|---|---:|
| 1 | pit_won | 169.02586817741394 |
| 2 | pit_won | 169.06843781471252 |
| 3 | pit_won | 168.4587836265564 |
| 4 | pit_won | 169.40760016441345 |
| 5 | pit_won | 168.5335636138916 |
| Media | 5/5 pit_won | 168.89885067939758 |

Todos los pasos fueron aciertos de tabla, con cero fallbacks, cero aciertos erróneos y cero salidas no finitas. El autor indica que son resultados locales sobre seeds fijos en muestra, no un envío a la Arena ni una afirmación de fuerza frente a otros modelos fuera de seed. El cribado de colisiones sobre 195 ejecuciones no encontró coincidencia exacta, pero la cobertura se declara UNKNOWN/INCOMPLETE.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y el grafo ONNX es de tamaño reducido, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no disponible; no se declara requisito de GPU. La verificación se realizó en VM x86_64 y en QEMU x86_64, lo que sugiere ejecución en CPU.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras; por el tamaño del artefacto no debería ser un impedimento, pero no hay dato confirmado.
- Opciones de despliegue: ONNX Runtime (versión registrada 1.24.4) con el runner microduck; el autor cita runner-v5 nativo x86 y replay en QEMU x86_64.
- Latencia y throughput: no disponibles.
- Entorno de referencia registrado: Python 3.12.3, NumPy 2.4.1, MuJoCo 3.10.0, ONNX Runtime 1.24.4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7 | no disponible (grafo ONNX, 27 nodos) | no aplica | 5/5 pit_won, media 168.90 cm (seeds en muestra) | no disponible | Hugging Face, 0 descargas |
| suraj-phanindra/microduck-tug-hc7-aifund | no disponible | no aplica | no disponible en la información proporcionada | no disponible (hc7 no declara licencia) | Hugging Face |
| jrubiosainz/microduck-tug-cup2p1-s3s5-e7d67488 | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup2l1-c23b073f | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo simulación: el autor advierte explícitamente de que no debe cargarse esta política en un robot físico.
- Evaluación en muestra: los resultados se obtuvieron sobre cinco seeds fijos de rating, no son un envío a la Arena ni una medida de fuerza fuera de seed.
- Cobertura de unicidad desconocida: el cribado de colisiones sobre 195 ejecuciones se declara UNKNOWN/INCOMPLETE; no hay garantía de unicidad global ni predicción de que el servidor devuelva `copy_of=null`.
- Licencia no clara: no se declara licencia nueva ni global; Apache-2.0 se aplica solo a las partes que la portan. Las partes sin licencia están atribuidas pero no relicenciadas, lo que limita el uso comercial sin revisión jurídica.
- Discrepancia de atribución sin resolver: las filas de prefijo público coinciden en dimensiones clave con v11 y dat-v4, pero sus avisos atribuyen los combates de forma distinta; ambos se conservan sin resolver.
- Metadatos ONNX heredados sin aviso de modificación en el archivo; añadirlo cambiaría los bytes evaluados.
- Sin datos de sesgos, alucinación o multilingüismo aplicables: no es un modelo de lenguaje.
- Riesgo de retirada: el autor indica que si un titular de derechos objeta, la entrada se retirará.
- Sin métricas de latencia ni de rendimiento fuera de la simulación declarada.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7
- Modelo base hc7: https://huggingface.co/suraj-phanindra/microduck-tug-hc7-aifund
- Modelo base cup2p1-s3s5: https://huggingface.co/jrubiosainz/microduck-tug-cup2p1-s3s5-e7d67488
- Modelo base cup2l1: https://huggingface.co/jrubiosainz/microduck-tug-cup2l1-c23b073f
- Perfil de suraj-phanindra: https://huggingface.co/suraj-phanindra
- Perfil de lphatnguyen: https://huggingface.co/lphatnguyen
- Perfil de jrubiosainz: https://huggingface.co/jrubiosainz
- Perfil de greecree: https://huggingface.co/greecree
- Perfil de Unique007: https://huggingface.co/Unique007
- Perfil de rumezhak: https://huggingface.co/rumezhak
- Perfil de HlibPlakhtii: https://huggingface.co/HlibPlakhtii
- Perfil de a1rb4Ck: https://huggingface.co/a1rb4Ck
- Perfil de juicenv: https://huggingface.co/juicenv
- Perfil de GinDuck: https://huggingface.co/GinDuck
- Pollen Robotics (Microduck y Arena): https://huggingface.co/pollen-robotics
