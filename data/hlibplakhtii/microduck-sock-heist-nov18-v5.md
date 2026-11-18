# HlibPlakhtii/microduck-sock-heist-nov18-v5

## Resumen

Quicksilver Sock Heist v5 es una política de control robótico (no un modelo de lenguaje) publicada por HlibPlakhtii en el contexto de MicroDuck Arena, un entorno de simulación de carreras de robots pato. El modelo resuelve una tarea concreta: completar las cinco salidas oficiales de 6 metros de la prueba "Sock Heist" a una velocidad comandada de 0,2 m/s, con un tiempo medio de 4,770 segundos. Se distribuye como grafo ONNX y se etiqueta con el pipeline `robotics`.

Técnicamente es un artefacto de tipo merge: combina la política de respaldo de `rumezhak/microduck-sock-heist-composite-v11` (que cubre las salidas 1, 3, 4 y 5) con la política más rápida de `HlibPlakhtii/microduck-sock-heist-nov18-v4` para la salida 2. El grafo ONNX reconoce observaciones de simulación coincidentes de la salida 2 y reproduce las acciones grabadas de v4; el paquete incluye esas observaciones y acciones.

Su relevancia es acotada y experimental: no es un modelo generalista, sino una política de competición verificada localmente contra las trazas de origen y evaluada con Arena runner v5 sobre las cinco salidas puntuadas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica empaquetada como grafo ONNX; arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de simulación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB |
| Modelos base | rumezhak/microduck-sock-heist-composite-v11, HlibPlakhtii/microduck-sock-heist-nov18-v4 (relación: merge) |
| Velocidad comandada | 0,2 m/s |
| Distancia de las salidas | 6 m |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la política (tipo de red, número de capas, parámetros o función de pérdida). Lo que sí se documenta es el mecanismo de construcción: se trata de un merge de dos políticas upstream. La política `rumezhak/microduck-sock-heist-composite-v11` aporta el comportamiento de respaldo y las trayectorias de las salidas 1, 3, 4 y 5; la política `HlibPlakhtii/microduck-sock-heist-nov18-v4` aporta el acabado más rápido de la salida 2, desarrollado a partir de GinDuck `gin-sock-s3`. La v4 reconoce créditos adicionales a rumezhak, jrubiosainz y lphatnguyen.

El componente clave es un grafo ONNX que reconoce observaciones de simulación coincidentes de la salida 2 y selecciona las acciones grabadas de v4. El paquete incluye dichas observaciones y acciones. La verificación local comparó cada traza de asentamiento y de carrera contra su fuente, y la política combinada se evaluó sobre las cinco salidas con Arena runner v5. No se documentan datos de entrenamiento (número de episodios, composición del dataset, uso de RL o imitación) ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Control de locomoción en simulación para completar las cinco salidas oficiales de 6 m de Sock Heist.
- Ejecución a velocidad comandada de 0,2 m/s con tiempos de finalización de 4,635, 5,090, 4,655, 4,680 y 4,790 segundos según la salida.
- Selección condicional de política: el grafo ONNX detecta observaciones de la salida 2 y activa las acciones de la política v4; en el resto aplica la política de respaldo de rumezhak v11.
- Reproducción determinista de acciones grabadas para observaciones coincidentes.
- Integración con Arena runner v5 para evaluación sobre las salidas puntuadas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Evaluación comparativa en MicroDuck Arena: la política sirve como referencia de tiempo medio (4,770 s) para comparar nuevas políticas sobre las cinco salidas oficiales de 6 m.
- Baseline de respaldo en pipelines de competición: al incorporar la política de rumezhak v11 como fallback, permite mantener un comportamiento válido en las salidas 1, 3, 4 y 5 mientras se experimenta con variantes en la salida 2.
- Reproducción de resultados: el paquete incluye observaciones y acciones de la salida 2, lo que permite reproducir localmente la selección de acciones del grafo ONNX y auditar la traza.
- Investigación en merging de políticas: el artefacto documenta un caso concreto de combinación de dos políticas con reparto por salidas, útil para estudiar estrategias de composición y verificación de trazas.
- Despliegue en entornos de simulación ligeros: al distribuirse como ONNX y con un repositorio de 0.0 GB, puede cargarse en runners de simulación sin infraestructura de GPU dedicada (requisitos exactos no disponibles).
- Verificación de integridad de políticas: la comparación de cada traza de asentamiento y carrera contra su fuente sirve como plantilla de control de calidad para publicaciones de políticas en Arena.

## Benchmarks y rendimiento

Los únicos resultados publicados son los tiempos de finalización sobre las cinco salidas oficiales de Sock Heist a 0,2 m/s:

| Salida | Tiempo (s) |
|---|---|
| Salida 1 | 4,635 |
| Salida 2 | 5,090 |
| Salida 3 | 4,655 |
| Salida 4 | 4,680 |
| Salida 5 | 4,790 |
| Media | 4,770 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otras políticas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el formato es ONNX, pero no se detallan los requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se integra con Arena runner v5 y la librería `microduck`; el runtime ONNX concreto no se especifica.
- Latencia y throughput: no disponibles; solo se documentan los tiempos de finalización de la tarea en simulación.

## Comparativa con modelos similares

| Modelo | Tipo | Salidas cubiertas | Tiempo medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quicksilver Sock Heist v5 (este) | Merge ONNX | 5 de 5 | 4,770 s | no disponible | Hugging Face, 0 descargas |
| rumezhak/microduck-sock-heist-composite-v11 | Política base | 4 de 5 (respaldo) | no disponible | no disponible | Hugging Face |
| HlibPlakhtii/microduck-sock-heist-nov18-v4 | Política base | Salida 2 (más rápida) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento de las políticas base ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Política específica de una tarea y un entorno: solo está validada para las cinco salidas oficiales de 6 m de Sock Heist en simulación a 0,2 m/s; no se documenta generalización a otras pistas, velocidades o entornos reales.
- Dependencia de observaciones coincidentes: la selección de acciones de v4 en la salida 2 se basa en el reconocimiento de observaciones de simulación coincidentes; variaciones en la simulación pueden impedir esa coincidencia y forzar el fallback.
- Sin licencia declarada: no se especifican términos de uso comercial, redistribución ni modificación; debe tratarse como no apto para producción hasta aclarar la licencia.
- Sin información de sesgos ni de alucinación: al no ser un modelo generativo de lenguaje, estas categorías no aplican directamente, pero tampoco se documentan modos de fallo de la política.
- Procedencia compuesta: el artefacto agrega créditos de varios autores (rumezhak, jrubiosainz, lphatnguyen, GinDuck); conviene revisar las condiciones de las políticas upstream antes de reutilizarlo.
- Madurez y adopción mínimas: 0 descargas y 0 likes, creado y actualizado el mismo día, sin validación externa independiente.
- Sin datos de entrenamiento ni de arquitectura: no es posible evaluar robustez, sobreajuste al simulador ni coste computacional de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- Política base rumezhak v11 (commit fijado): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v11/tree/61af6fb9fa9a20f72f6ce5a418abd9081104dad6
- Política base Quicksilver v4 (commit fijado): https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v4/tree/f101609219d2a1661932e8b93589f023c792b7d5
