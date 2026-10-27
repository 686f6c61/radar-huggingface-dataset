# prteek/sparse-panel-demo

## Resumen

`prteek/sparse-panel-demo` es un repositorio de código, no un modelo con pesos publicados. Contiene una red neuronal pequeña en PyTorch que estima un **nivel prevaleciente suave** (la tendencia subyacente, sin el ruido diario) para cada combinación de localización y día de un panel, para dos magnitudes relacionadas de forma simultánea. Está pensada para observaciones que son medias diarias ruidosas, con huecos largos y con series que pueden faltar por completo. El autor la desarrolló para el artículo sobre suavizado conjunto de PM2.5 y PM10 y alimenta el Space de demostración del mismo nombre.

Técnicamente no es un transformer ni un modelo de lenguaje: es un perceptrón multicapa con una embedding de área de 8 dimensiones, un desplazamiento por estación penalizado y una base temporal de funciones gaussianas fijas, con un tronco compartido de dos capas de 64 unidades y dos cabezas lineales (una por contaminante). El modelo se ajusta a un panel concreto; no es transferible entre paneles ni rangos de fechas. Sobre los 12 sensores de Pekín y cuatro años de datos del conjunto Beijing Multi-Site Air Quality, el ajuste tarda unos segundos en CPU.

La relevancia es metodológica más que de producto: muestra cómo combinar una verosimilitud gaussiana enmascarada (que pondera cada media diaria por el número de lecturas `n` que la respaldan) con una penalización de curvatura aplicada a toda la rejilla de días, observados o no. El propio autor advierte de que un GAM de efectos mixtos con suavidad fijada a mano rinde igual o mejor, y el repositorio no registra descargas ni interacciones, por lo que debe tratarse como material de replicación y experimentación, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (MLP) con embeddings de localización (8 dimensiones de área más un desplazamiento por estación penalizado) y base temporal de funciones gaussianas fijas; no es un transformer ni un modelo de lenguaje |
| Parámetros totales | No disponible (el autor no publica el recuento; el tamaño depende del número de áreas del panel y de la resolución de la base temporal) |
| Parámetros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica (no procesa secuencias de tokens; el equivalente es el rango de fechas del panel ajustado) |
| Tipos de cuantización | No disponible (no se publican pesos entrenados que puedan cuantizarse) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | No hay pesos publicados: el repositorio contiene código Python (`model.py`, `example.py`) para PyTorch y la receta de entrenamiento; los pesos se generan al ajustar el modelo a un panel concreto |
| Pipeline de HuggingFace | No disponible |
| Tareas declaradas | Series temporales, datos de panel, datos faltantes, suavizado, imputación, calidad del aire |
| Datos del artículo | Beijing Multi-Site Air Quality (Song Chen, 2017, UCI), 12 estaciones, cuatro años, PM2.5 y PM10 |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-26 / 2026-10-26 |

## Arquitectura y entrenamiento

Cada fila del panel es una localización y un día, con hasta dos objetivos (`y1`, `y2`, en escala logarítmica y estandarizados). La entrada se construye como `x = [e_área + e_estación, b(t)]`, donde la embedding de área tiene 8 dimensiones y el desplazamiento de estación arranca cerca de cero y se penaliza, de modo que una estación con pocos datos tiende a su área. La base temporal son funciones gaussianas `b_k(t) = exp(-0,5·((t - c_k)/w)^2)` con centros cada `w` días, lo que impone que el nivel sea una función suave del tiempo. El tronco son dos capas de 64 unidades con activación SiLU y una cabeza lineal por objetivo: un día en el que solo se observó un contaminante sigue entrenando las representaciones de las que depende el otro.

La pérdida es una log-verosimilitud gaussiana negativa promediada solo sobre las celdas observadas: como el valor observado es una media de `n` lecturas, su varianza alrededor del nivel se modela como `σ_j²/n + τ_j²`, con `σ_j` y `τ_j` aprendidos por objetivo; un objetivo ausente se enmascara, no se descarta. Se añaden una penalización de curvatura `λ · media((μ_{t+1} - 2μ_t + μ_{t-1})²)` calculada sobre la serie predicha de cada localización en toda la rejilla de días (observados o no), que mantiene el nivel suave a través de los huecos, y una L2 pequeña sobre los desplazamientos de estación. El entrenamiento es Adam a lote completo con schedule coseno: `rough` = 1e5, `spacing` = 30 días, ancho oculto 64, tasa de aprendizaje 5e-3, weight decay 1e-4, `station_l2` = 1e-3, 1000 pasos de schedule, 100 pasos de entrenamiento y semilla 0. Para un modelo de un solo objetivo se pasa `use=["PM2.5"]` a `fit`. Las lecturas de entrada van en formato largo con columnas `station`, `area`, `date`, `pollutant`, `value` (media diaria > 0, modelada en log) y `n`.

## Capacidades

- Estimación conjunta del nivel prevaleciente de dos magnitudes relacionadas (por defecto PM2.5 y PM10) para cada localización y día del panel.
- Predicción de toda la rejilla localización × día, incluidas las celdas sin observación, mediante `predict(model, enc, enc.grid())`.
- Manejo nativo de huecos largos y de series completamente ausentes, gracias al respaldo sobre la embedding de área.
- Ponderación explícita por el número de lecturas `n` que respalda cada media diaria, con varianza heterocedástica aprendida por objetivo.
- Enmascaramiento de objetivos ausentes: un día con un solo contaminante observable sigue aportando señal al tronco compartido.
- Configuración de los nombres de objetivo en `model.TARGETS`, lo que permite reutilizar el código para otras parejas de magnitudes.
- Modo de un solo objetivo mediante el parámetro `use` de `fit`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, capacidades multilingües, visión, audio ni modo de razonamiento: no es un modelo de lenguaje y esas filas no aplican.

## Casos de uso

- Imputación de series de calidad del aire en redes de sensores con caídas: el modelo reconstruye el nivel diario de PM2.5 y PM10 en estaciones con huecos de semanas y en estaciones sin datos, apoyándose en el área a la que pertenecen.
- Construcción de paneles completos para estudios epidemiológicos: los modelos de salud que cruzan exposición y mortalidad necesitan una rejilla sin faltantes; aquí se obtiene una estimación suave por estación y día con incertidumbre modelada por `σ_j²/n + τ_j²`.
- Suavizado de series con pocas lecturas diarias: al ponderar por `n`, las medias basadas en dos o tres lecturas no arrastran el nivel tanto como las basadas en veinticuatro, algo que una media móvil simple no distingue.
- Detección de episodios frente a la tendencia: comparar el valor observado con el nivel prevaleciente permite separar una subida real de una fluctuación de muestreo; útil para alertas de contaminación.
- Punto de partida para predicción a corto plazo: el nivel suavizado y sin huecos sirve como entrada o como base de comparación para modelos de ahora-casting que no toleran faltantes.
- Calibración de estaciones nuevas: una estación con pocos meses de histórico puede integrarse en el ajuste y quedar anclada a su área hasta acumular datos propios.
- Docencia y replicación metodológica: `example.py` ajusta la red a un panel sintético y predice todas las celdas, lo que permite reproducir el método en unos segundos sin infraestructura.
- Comparación de baselines en investigación aplicada: permite contrastar frente a un GAM de efectos mixtos con suavidad fijada a mano, que en el artículo rinde igual o mejor, para justificar la elección de método.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas con métricas de error (RMSE, MAE, cobertura de intervalos) ni comparaciones numéricas frente a alternativas; solo referencias cualitativas.

| Aspecto | Dato disponible |
|---|---|
| Métricas estándar (MMLU, HumanEval, GSM8K, etc.) | No aplica (no es un modelo de lenguaje) |
| Métricas de imputación o suavizado (RMSE, MAE, CRPS) | No disponible en la información proporcionada |
| Tiempo de ajuste | Unos segundos en CPU sobre 12 estaciones y cuatro años de datos de Pekín |
| Comparación con alternativas | El autor indica que un GAM de efectos mixtos con suavidad fijada a mano rinde igual o mejor |
| Validación | Selección de hiperparámetros por validación cruzada con look-ahead, según el artículo |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo es una MLP diminuta y se ejecuta en CPU.
- GPU recomendadas: ninguna en particular; el autor documenta ajustes de unos segundos en CPU para el panel de referencia. Cualquier GPU consumer permite ejecutarlo, pero no aporta ventaja relevante.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU de un portátil.
- Memoria: el entrenamiento es a lote completo y la penalización de curvatura cubre todas las localizaciones × días, por lo que el consumo crece con el tamaño del panel; en paneles grandes la memoria, no la capacidad de cómputo, es el límite.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI (no hay pesos ni tokenizador). Se usa como módulo Python dentro de un script o servicio propio; existe una demo pública en HuggingFace Spaces.
- Latencia y throughput: no disponibles de forma numérica; el coste dominante es el ajuste completo (100 pasos de Adam a lote completo), no la predicción.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `prteek/sparse-panel-demo` | MLP con embeddings de localización y base gaussiana temporal | No disponible | No aplica (rango de fechas del panel) | CC BY 4.0 | Código y receta en HuggingFace; sin pesos entrenados |
| GAM de efectos mixtos con suavidad fijada a mano (baseline del artículo) | Modelo aditivo generalizado | No disponible | No aplica | No disponible (depende de la implementación) | Implementaciones estadísticas estándar; el autor lo sitúa igual o mejor que esta red |
| Media móvil o interpolación sobre la serie | Método no paramétrico | No aplica | No aplica | No aplica | Universal, sin dependencias |
| Modelos neuronales de imputación de paneles de otras familias | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas directamente comparables en la información disponible |

## Limitaciones y advertencias

- No es transferible: las embeddings de localización y la base temporal son específicas de un panel y un rango de fechas; para localizaciones o fechas nuevas hay que reajustar.
- No hay pesos entrenados publicados. El repositorio contiene código y receta; cualquier uso implica entrenar sobre datos propios y validar el resultado.
- La suavidad es una decisión de diseño, no un parámetro objetivo. La validación cruzada que puntúa contra lecturas ruidosas premia seguir episodios cortos y tiende a infra-suavizar; `rough` y `spacing` deben tratarse como elecciones sobre cuánto debe suavizarse el nivel.
- Sesgo de escala logarítmica: al ajustar sobre logaritmos de medias calculadas con pocas lecturas, el nivel queda ligeramente por debajo de una media móvil sobre datos completos (desigualdad de Jensen).
- Un GAM de efectos mixtos con suavidad fijada a mano es una alternativa fuerte y, según el artículo, rinde igual o mejor; conviene justificar la elección de la red.
- La memoria crece con el tamaño del panel por el entrenamiento a lote completo y la penalización sobre toda la rejilla; no se documentan estrategias de mini-batch.
- Cobertura limitada a dos magnitudes relacionadas y a datos horarios agregados a media diaria; no se documenta su comportamiento con otras frecuencias temporales ni con más de dos objetivos.
- No hay validación externa ni evidencias de adopción: el repositorio no registra descargas ni likes, y la búsqueda web realizada no devolvió resultados relevantes sobre el modelo ni sobre su artículo, por lo que no se ha podido contrastar de forma independiente.
- Licencia CC BY 4.0: permite uso comercial y obras derivadas con atribución. Los datos del artículo (Beijing Multi-Site Air Quality, Song Chen 2017) se distribuyen también bajo CC BY 4.0 y requieren citar el DOI de UCI.
- Advertencia sobre el artículo: el enlace a alphaXiv se reproduce tal como lo facilita el autor; su contenido no se ha podido verificar en la búsqueda realizada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/prteek/sparse-panel-demo
- Conjunto de datos de la demo: https://huggingface.co/datasets/prteek/sparse-panel-demo
- Space de demostración: https://huggingface.co/spaces/prteek/sparse-panel-demo
- Artículo citado por el autor (alphaXiv): https://www.alphaxiv.org/abs/2610.pm25-pm10-joint-smoothing
- Conjunto de datos original (UCI, Beijing Multi-Site Air Quality, Song Chen 2017): https://doi.org/10.24432/C5RK5G
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo, su artículo o implementaciones de terceros.
