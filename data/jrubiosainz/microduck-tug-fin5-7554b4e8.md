# jrubiosainz/microduck-tug-fin5-7554b4e8

## Resumen

Microduck Tug of War - fin5 (7554b4e8) es una política de control para robótica presentada como entrada en la competición Microduck Arena, concretamente en la modalidad Tug of War (tira y afloja) y exclusivamente para simulación. Lo desarrolla el usuario jrubiosainz y no es una política entrenada desde cero: se trata de un fine-tuning sobre la política pública de RSanchez996 `microduck-tug-competitive-v1` (revisión `ab2d9331`), a la que se le añade una envoltura de 34 parámetros y una tabla de búsqueda (lookup) de 346 filas que reproduce cinco combates de rating completos.

El modelo se distribuye en formato ONNX bajo la librería `microduck` y con pipeline `robotics`. El grafo heredado se conserva byte a byte, salvo dos aristas renombradas (`obs__h2o_in` y `actions__h2o_base`), y la innovación principal es la combinación de una normalización aprendida por CMA-ES con una tabla de replay que, ante una coincidencia exacta de las primeras 48 observaciones (tolerancia 1e-7), reproduce la acción almacenada en lugar de la decisión de la red. Es relevante como ejemplo de ingeniería de competición: demuestra cómo mejorar el rendimiento en un entorno de física determinista mediante ajuste de bajo dimensionalidad y memorización de trayectorias, sin reentrenar los pesos heredados.

El tamaño del repositorio es de 0,0 GB y no se especifican parámetros totales de la red base ni longitud de contexto en el sentido de los modelos de lenguaje, ya que se trata de un controlador reactivo de observaciones a acciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para robótica (grafo ONNX heredado) con envoltura de normalización y tabla de búsqueda |
| Parámetros totales | No disponible (el wrapper propio tiene 34 parámetros; el grafo base no declara recuento) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; usa las primeras 48 observaciones para la búsqueda y el resto como entrada de la red |
| Tipos de cuantización | No disponible (pesos distribuidos como grafo ONNX) |
| Idiomas soportados | No disponible (modelo de control, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | ONNX (grafo con metadatos, p. ej. `h2o_base_sha256`) |

## Arquitectura y entrenamiento

La arquitectura es una política neuronal heredada de `RSanchez996/microduck-tug-competitive-v1` (revisión `ab2d9331`, SHA-256 de la política `6c9bae28…`, 793.778 bytes), entrenada según su model card con `pollen-robotics/microduck_rl` (rama `ft_competitive_multiopponent`, commit `b8328925e`). Sobre ese grafo se aplica una envoltura propia de 34 parámetros: 13 offsets sobre las observaciones de comando, 6 ganancias (una por grupo de observación: giroscopio, gravedad, posiciones articulares, velocidades articulares, última acción y comando) y 14 sesgos de acción más 1 ganancia de acción. Las ganancias actúan respecto a la media del normalizador heredado, que se incorpora mediante `h2o_e`. Estos 34 parámetros se ajustaron con una búsqueda CMA-ES propia en combates simulados contra políticas públicas de Tug of War.

La segunda pieza es una tabla de búsqueda de 346 filas (prefijo de inicializador `search_`), añadida con la función `overlay()` de `search_race.py` de HlibPlakhtii (SHA-256 `2003778b…`). La tabla compara los primeros 48 valores de observación con tolerancia 1e-7 y, si hay coincidencia, emite la acción almacenada; en caso contrario decide la red envuelta. Las filas provienen de las grabaciones completas de los cinco combates oficiales de rating con la física sin modificar de la Arena en Linux x86_64: las semillas 1-4 se encontraron con `search_tug.py` de HlibPlakhtii (SHA-256 `6bcbfde1…`, sin modificar y no redistribuido) y comienzan con filas de tablas públicas (v16 y v9) seguidas de filas grabadas nativamente; la semilla 5 reproduce una ejecución pública previa. El wrapper resultante tiene SHA-256 `b860b83f…` (794.683 bytes). No se reentrenó ni modificó ningún peso heredado, ni la física, el árbitro, el servidor o los datos de la clasificación.

## Capacidades

- Control reactivo de un robot en la tarea Tug of War dentro del simulador Microduck Arena.
- Normalización aprendida de observaciones (giroscopio, gravedad, posiciones y velocidades articulares, última acción y comando) mediante 34 parámetros ajustados por CMA-ES.
- Reproducción determinista de acciones mediante tabla de búsqueda sobre las primeras 48 observaciones.
- Ejecución como grafo ONNX con metadatos de trazabilidad (SHA-256 de la política base).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un controlador específico de tarea.
- Validado en comprobación nativa: 12 combates con semillas hasheadas (ambos lados, 3 oponentes) dieron el mismo resultado y trazas idénticas bit a bit con y sin la tabla.

## Casos de uso

- Evaluación de políticas en Microduck Arena: se usa como entrada en la modalidad Tug of War para medir su puntuación frente a otras políticas públicas, aprovechando la tabla de replay para reproducir combates de rating conocidos.
- Investigación en optimización de bajo dimensionalidad: el ajuste de solo 34 parámetros mediante CMA-ES sobre una política congelada sirve como caso de estudio de optimización de caja negra en entornos deterministas.
- Análisis de memorización frente a generalización: la tabla de búsqueda permite comparar el comportamiento con coincidencia exacta de observaciones frente al de la red sola, útil para estudiar sobreajuste a trayectorias concretas.
- Reproducibilidad de experimentos: los SHA-256 de política, wrapper y scripts permiten verificar bit a bit la cadena de construcción en pipelines de investigación.
- Docencia en robótica simulada: sirve para ilustrar cómo una envoltura de normalización y una tabla de consulta pueden alterar el comportamiento de un controlador sin tocar sus pesos.
- Pruebas de integración de despliegue ONNX: al ser un grafo ONNX con metadatos, se puede cargar en runtimes ONNX para validar la inferencia en distintos entornos (x86_64 Linux en la evaluación original).

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Evaluación canónica nativa (media) | 167,5034737586975 cm |
| Victorias en foso (pit wins) | 5 de 5 |
| Semilla 1 (65 filas) | 166,8207347393036 cm |
| Semilla 2 (70 filas) | 168,9721643924713 cm |
| Semilla 3 (72 filas) | 166,5897011756897 cm |
| Semilla 4 (70 filas) | 167,6494598388672 cm |
| Semilla 5 (69 filas) | 167,48530864715576 cm |
| Control h2 en la misma llamada | 166,6911780 cm |

Los cinco resultados coinciden con la ejecución publicada h5b `01M6PR4NND3N6JDYZ7PJ7K`, cuya tabla se reutiliza byte a byte. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el grafo ONNX es de tamaño reducido (wrapper de 794.683 bytes), por lo que la inferencia es ligera.
- GPU recomendadas: no disponible; al ser un controlador de política, puede ejecutarse en CPU x86_64 Linux (entorno de la evaluación nativa).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: runtime ONNX y librería `microduck`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros propios | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| jrubiosainz/microduck-tug-fin5-7554b4e8 | RSanchez996/microduck-tug-competitive-v1 | 34 + tabla de 346 filas | 48 observaciones para búsqueda | 167,503 cm (media nativa) | No disponible |
| RSanchez996/microduck-tug-competitive-v1 | Entrenado con microduck_rl | No disponible | No disponible | No disponible | No disponible |
| HlibPlakhtii/microduck-tug-quicksilver-v14 | No disponible | No disponible | No disponible | No disponible | No disponible |
| greecree/microduck-tug-of-war-tug-super-v9 | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para simulación; no se ha validado en hardware físico.
- La tabla de búsqueda memoriza trayectorias concretas de cinco combates; fuera de esas observaciones exactas (tolerancia 1e-7) depende de la red heredada, por lo que la mejora puede no generalizar a otros oponentes o condiciones.
- No se especifica licencia, lo que impide confirmar si se permite uso comercial o redistribución.
- El wrapper builder (`h2o.py`) y los scripts de búsqueda no se redistribuyen, lo que limita la reproducibilidad completa de la construcción.
- Riesgo de sobreajuste a la física determinista de la Arena en x86_64 Linux; cambios en la física, el árbitro o el servidor invalidarían las coincidencias de la tabla.
- No hay información sobre sesgos, ya que no es un modelo lingüístico; el riesgo relevante es el de comportamiento no robusto ante variaciones del entorno.
- Los resultados de benchmarks son de evaluación nativa propia y no de la clasificación oficial de la Arena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-fin5-7554b4e8
- Modelo base: https://huggingface.co/RSanchez996/microduck-tug-competitive-v1/tree/ab2d933122159c7a6f7971b556312c7c0b3afcb0
- Repositorio GitHub del autor: https://github.com/jrubiosainz/microduck
- Ejecución relacionada h5b: https://huggingface.co/jrubiosainz/microduck-tug-h5b-3976f431
- Tabla pública v16: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v16/tree/fd237b1e35708ec3610e5bb336eeab37d0d4962c
- Tabla pública v9: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v9/tree/cb4f2e7534999b240bb5d6e652e3af80b97bb33a
- Repositorio de scripts de búsqueda: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14/tree/a2f41160287beb86c23e287030a69f4e2226180f
- Ejecución pública de la semilla 5: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429/tree/d8ec37ed882a33231aa8da0da07b75cb7e21608b
