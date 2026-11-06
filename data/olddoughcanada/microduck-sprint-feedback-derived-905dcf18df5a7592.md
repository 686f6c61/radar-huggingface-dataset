# olddoughcanada/microduck-sprint-feedback-derived-905dcf18df5a7592

## Resumen

`microduck-sprint-feedback-derived-905dcf18df5a7592` es un artefacto ONNX publicado por el usuario olddoughcanada que deriva del modelo `jrubiosainz/microduck-game-sprinter-remix14`, a su vez un derivado de la familia de controladores `microduck-sprint-lookup-v1` de nikghodki para la competición Microduck Arena de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional: es una política de control robótico (red neuronal de 9 nodos y 10 tensores) empaquetada en formato ONNX para la tarea de sprint de 2 metros en simulación.

El artefacto elimina las ramas de búsqueda por observación (observation-lookup) del modelo padre y conserva byte a byte la red neuronal d16 subyacente y sus normalizadores. Sobre esa base añade pequeñas operaciones aritméticas compartidas y un perfil de control del tren superior que añade residuos de pitch de cuello y cabeza en radianes, activados por la componente de gravedad cruda. El autor reporta una puntuación local de 0,902 s (5/5) en un barrido de 33 ejecuciones, frente a los 0,907 s del ancestro d16 fijo.

Es relevante únicamente en el contexto muy específico de la Microduck Arena: es un candidato de optimización, no un modelo validado. El propio autor advierte que la calibración golden no ha pasado, que la equivalencia con el servidor no está establecida y que no se ha realizado validación en robot real. El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que el artefacto es de tamaño mínimo (coherente con una red de 9 nodos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward de 9 nodos (d16) con operadores de normalización y aritmética compartida; grafo estático ONNX |
| Parametros totales | no disponible (10 tensores inicializadores, 9 operadores de red/normalizador; recuento de parámetros no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 61 observaciones float32; salida de 14 acciones float32) |
| Tipos de cuantizacion | no disponible (pesos en el grafo ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de control robótico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (librería `onnx`) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal de retroalimentación ordinaria de 9 nodos (denominada d16 en la documentación del autor) con 10 tensores inicializadores, copiada byte a byte del ancestro `jrubiosainz/microduck-game-sprinter-remix14` en el commit `e9a74fa9a55e00f972e87d158f40db660a54be91`. El grafo estático recibe 61 observaciones float32 y produce 14 acciones float32 (`actions_fb`). Sobre esta base se eliminan las cuatro ramas de búsqueda por observación (40 operadores y 24 inicializadores asociados) y se añaden pequeñas operaciones aritméticas compartidas que actúan sobre las entradas y salidas originales; solo la primera entrada `normalizerSub` puede recibir una transformación IMU compartida. El perfil de tren superior añade únicamente residuos de pitch de cuello y cabeza en radianes, activados por la gravedad cruda mediante `clip((rawobs[3]-.35)/.25,0,1)`, dejando intactos la red d16 y el historial de retroalimentación fb511.

No hay entrenamiento nuevo. El autor indica explícitamente que las actualizaciones PPO nuevas son 0, que el recuento PPO público de origen es desconocido y que no se heredan pesos de No1199, Hannes ni PPO propio. Las secuencias de control provienen de una búsqueda en bucle abierto con sep-CMA-ES sobre offsets aditivos por paso a los 14 objetivos articulares de los pasos tardíos (desde el paso 26), sin modificar los pasos de asentamiento. La correlación con el profesor se presenta como motivación, no como prueba causal ni puntuación heredada. No se añadió ninguna tabla de búsqueda por observación, semilla ni reloj adicional.

## Capacidades

- Control de locomoción de sprint de 2 metros en simulación para el robot Microduck de Pollen Robotics, con salida de 14 acciones articulares float32.
- Retroalimentación neuronal ordinaria (fb511) preservada del ancestro, sin ramas de búsqueda por observación.
- Control del tren superior limitado a residuos de pitch de cuello y cabeza en radianes, activados por la componente x de la gravedad cruda.
- Ejecución de un grafo estático ONNX con entradas de 61 observaciones y salidas de 14 acciones, apto para inferencia determinista.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni ninguna capacidad generativa.

## Casos de uso

- Evaluación de ablaciones en la Microduck Arena: el artefacto sirve para medir el efecto de eliminar las ramas de búsqueda por observación manteniendo la red d16 intacta, comparando tiempos locales con el ancestro (0,902 s frente a 0,907 s reportados).
- Investigación sobre control del tren superior: el perfil de pitch de cuello y cabeza activado por gravedad permite estudiar si los residuos posturales mejoran la estabilidad del sprint sin alterar la política base.
- Reproducción de experimentos de búsqueda sep-CMA-ES: las secuencias de control en bucle abierto documentadas permiten replicar la búsqueda sobre offsets articulares desde el paso 26.
- Pruebas de integración de grafos ONNX en pipelines de simulación: al ser un grafo estático pequeño, se puede cargar con ONNX Runtime en entornos de CI para verificar la forma y el rango de las salidas.
- Análisis de atribución y linaje de artefactos: el repositorio conserva `source-attribution/` con tarjetas originales, avisos y recibos de bytes, útil para auditar la cadena de derivación desde nikghodki y a1rb4Ck.
- Docencia o demostración de políticas de control en simulación: un modelo de 9 nodos con entrada/salida bien definida sirve como ejemplo mínimo de política neuronal para robótica de competición.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Puntuación local (33 ejecuciones) | 0,902 s, 5/5 | Barrido original completo, comando 1.20, DNF 50 s; reportado por el autor |
| Ancestro d16 fijo (33 ejecuciones) | 0,907 s | Referencia local del autor |
| Puntuación pública del lookup completo | 0,817 s | No corresponde a este candidato; es del modelo padre con búsqueda por observación |

No se han publicado resultados de benchmarks oficiales ni validación en servidor en la información disponible. El autor indica que la calibración golden no ha pasado y que la equivalencia con el servidor no está establecida; las cifras son semillas de optimización conocidas, no holdout ni puntuación oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, por debajo de 1 GB; el grafo contiene 9 operadores de red/normalizador y 10 inicializadores, con entrada de 61 float32 y salida de 14 float32.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime es suficiente, incluida una GPU integrada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU; el tamaño del repositorio es de 0,0 GB.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), dado que la librería declarada es `onnx`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de latencia de inferencia, solo tiempos de carrera en simulación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `olddoughcanada/microduck-sprint-feedback-derived-905dcf18df5a7592` | 9 nodos d16, 10 tensores | Entrada 61 obs / salida 14 acciones | 0,902 s local (5/5, 33 ejecuciones) | Apache-2.0 | ONNX en Hugging Face, 0 descargas |
| `jrubiosainz/microduck-game-sprinter-remix14` | Red d16 + capas de búsqueda | Entrada 61 obs / salida 14 acciones | 0,817 s en semillas oficiales (in-sample) | Apache-2.0 | ONNX en Hugging Face |
| `nikghodki/microduck-sprint-lookup-v1` | Red a1rb4Ck + tres capas de búsqueda | Entrada 61 obs / salida 14 acciones | 0,818 s en semillas oficiales | Apache-2.0 | ONNX en Hugging Face |

La comparación se limita a la familia Microduck; no hay modelos comparables fuera de este ecosistema. Las puntuaciones no son directamente comparables: la del candidato es local y no oficial, mientras que las de los ancestros son in-sample sobre las semillas oficiales de la Arena.

## Limitaciones y advertencias

- La calibración golden no ha pasado y la equivalencia con el servidor no está establecida; la puntuación de 0,902 s es local, no oficial.
- No hay validación en robot real, ni de actuadores, colisiones, temporización ni reglas de caída antes de meta.
- No se ha realizado entrenamiento nuevo: las actualizaciones PPO son 0 y no se heredan pesos de otros modelos PPO.
- El autor advierte que no se reclama capacidad general de caminar ni respaldo del organizador.
- Las cifras reportadas son semillas de optimización conocidas, no holdout; el riesgo de sobreajuste a las 33 ejecuciones locales es alto.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-04), lo que indica ausencia de validación comunitaria.
- El modelo padre con búsqueda por observación obtiene 0,817 s, mejor que este candidato; la ablación no mejora el rendimiento del padre.
- La licencia Apache-2.0 se mantiene, pero la atribución a suraj-phanindra, a1rb4Ck, rumezhak, HlibPlakhtii, nikghodki, jrubiosainz y Pollen Robotics debe conservarse; eliminar las ramas de búsqueda no transfiere la propiedad de los pesos.
- No aplica a tareas de lenguaje, visión, audio ni agentes; cualquier uso fuera del control Microduck en simulación carece de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olddoughcanada/microduck-sprint-feedback-derived-905dcf18df5a7592
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14
- Ancestro con búsqueda: https://huggingface.co/nikghodki/microduck-sprint-lookup-v1/tree/e963635b00c76db3d00381b434c8396315045145
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de atribución: `source-attribution/` dentro del repositorio del modelo
