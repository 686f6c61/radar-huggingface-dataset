# harpertoken/mark

## Resumen

mark es un detector de anomalías basado en Isolation Forest, publicado por el usuario harpertoken en Hugging Face. No es un modelo de lenguaje ni una red neuronal: es un artefacto de scikit-learn entrenado sobre telemetría de sistema de macOS (CPU, memoria, disco y red) para aprender qué aspecto tiene el comportamiento normal de una máquina y señalar las muestras que se desvían de ese patrón. El bundle guardado contiene un StandardScaler más un bosque de 200 árboles de aislamiento sobre 8 características tabulares, con un tamaño de unos pocos cientos de kilobytes.

El entrenamiento utilizó el conjunto de datos `harpertoken/stat`, tomando el primer 80 por ciento de la sesión en orden temporal (4.951 filas) y reservando el 20 por ciento final (1.238 filas) como holdout. La salida es binaria: 1 para normal y -1 para anómalo, con un parámetro `contamination` de 0,01. Todo el pipeline es CPU-only, sin PyTorch ni transformer en ninguna etapa.

Su relevancia es acotada pero clara como referencia reproducible: demuestra cómo construir un detector de anomalías ligero, sin GPU y con dependencias mínimas, sobre contadores de sistema. Conviene subrayar que modela una única máquina durante una única sesión de 1 hora y 44 minutos, por lo que debe tratarse como un experimento reproducible y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Isolation Forest (ensemble de 200 árboles de aislamiento) sobre 8 características tabulares, precedido de StandardScaler. No es una red neuronal |
| Parámetros totales | No aplica: no es un modelo neuronal. El artefacto son 200 árboles de aislamiento |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: la entrada es un vector fijo de 8 características por muestra. La ventana temporal usada en la evaluación es de 1.238 filas (holdout) |
| Tipos de cuantización | No aplica: no hay cuantización. El bundle se serializa con joblib y contiene floats de scikit-learn |
| Idiomas soportados | en (etiqueta del repositorio). En la práctica no procesa texto |
| Licencia | MIT |
| Formato de pesos | joblib (pickle interno), archivo `model.joblib` |
| Tamaño del artefacto | Unos pocos cientos de kilobytes (tamaño de repo reportado: 0,0 GB) |
| Características de entrada (en orden) | `cpu_mean`, `cpu_max`, `memory_used_mb`, `battery_status`, `disk_read_delta`, `disk_write_delta`, `net_sent_delta`, `net_recv_delta` |
| Salida | 1 = normal, -1 = anómalo |
| Dataset de entrenamiento | `harpertoken/stat` (4.951 filas de entrenamiento, 1.238 de holdout) |
| Pipeline en Hugging Face | No disponible |

## Arquitectura y entrenamiento

El modelo es un Isolation Forest, un algoritmo de detección de anomalías no supervisado que aísla puntos mediante divisiones aleatorias: las muestras anómalas tienden a quedar aisladas en menos divisiones que las normales. La implementación es la de scikit-learn, con 200 árboles y `contamination` fijado en 0,01, lo que implica que aproximadamente el uno por ciento de las filas de entrenamiento puntúan como anómalas por construcción. Antes del bosque se aplica un StandardScaler sobre las ocho características.

Las características se derivaron del dataset `stat` siguiendo las recomendaciones de su propia model card: las columnas de disco y red son contadores acumulados desde el arranque, por lo que entran como diferencias por intervalo. La columna `cpu_temp` es nula en todo el conjunto y se descartó. El uso de CPU por núcleo se resume en su media y su máximo, dando lugar a las columnas `cpu_mean` y `cpu_max`. La partición de entrenamiento y prueba es temporal, no aleatoria: primeras 4.951 filas para ajuste y últimas 1.238 para evaluación, lo que evita fuga de información en una serie temporal.

No hay entrenamiento con RLHF, DPO ni ajuste supervisado: el ajuste es puramente no supervisado sobre el propio flujo de telemetría. Como innovación destacable, el autor documenta de forma explícita que el algoritmo es intrínsecamente débil ante extremos en una sola característica —un punto extremo en una de ocho dimensiones espera varias divisiones a que esa dimensión sea elegida, alcanzando la misma profundidad que un punto normal—, y que estandarizar las características no corrige este comportamiento porque las divisiones son uniformes en rango. Los incidentes que mueven varios contadores a la vez son los que detecta bien.

## Capacidades

- Detección de anomalías no supervisada sobre telemetría tabular de sistema (CPU, memoria, disco y red).
- Salida binaria por muestra: 1 para normal y -1 para anómalo, con `predict()` de scikit-learn.
- Detección de incidentes correlacionados: es eficaz cuando varios contadores se disparan a la vez, como un equipo estresado con CPU, memoria y disco subiendo simultáneamente (tasa de marcado de 0,917 en la evaluación del autor).
- Detección parcial de tormentas de red con envío y recepción subiendo juntos (0,245 de marcado).
- Detección limitada de caídas por inactividad con CPU y memoria bajando a la vez (0,372 de marcado).
- Inferencia en CPU con dependencias mínimas (scikit-learn, joblib, huggingface_hub).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo de razonamiento, visión, audio ni generación de texto.
- No detecta bien extremos en una sola característica, por diseño del algoritmo.

## Casos de uso

- Prototipo de monitorización local en macOS: cargando el bundle con joblib y alimentándolo con los ocho contadores por intervalo, se obtiene una señal de normalidad/anomalía por segundo sin necesidad de GPU ni de servicios externos. Adecuado como prueba de concepto en el propio portátil del desarrollador.
- Detección de picos de estrés del sistema: al combinarse CPU, memoria y disco en un mismo intervalo, el modelo marca la muestra con una tasa de 0,917 según la evaluación publicada. Útil para generar alertas cuando un proceso intensivo satura varios recursos a la vez.
- Detección de tormentas de red: con `net_sent_delta` y `net_recv_delta` subiendo simultáneamente, el detector marca el 0,245 de los casos sintéticos. Sirve como señal complementaria, no como único mecanismo de alerta.
- Base para reentrenar con datos propios: el pipeline (escalado más Isolation Forest sobre diferencias de contadores) es directamente reutilizable sobre telemetría de otros equipos, reajustando el escalador y el bosque con las ventanas temporales del nuevo host.
- Referencia educativa sobre el dataset `stat`: permite reproducir el tratamiento recomendado de contadores acumulados (diferencias por intervalo), el descarte de columnas nulas y la partición temporal de una serie.
- Baseline para comparar detectores de anomalías en telemetría: al ser un método no supervisado, sencillo y determinista en su configuración, sirve como punto de partida frente a autoencoders o modelos supervisados en el mismo conjunto de datos.
- Análisis de la región de recarga de batería: el modelo registra una tasa de falsos positivos de 0,027 en el holdout limpias, atribuida por el autor a la región de recarga de batería que la ventana de entrenamiento nunca vio. Resulta útil para estudiar cómo los cambios de régimen no vistos generan alarmas.
- Validación de umbrales en unidades crudas: dado que las diferencias de disco y red nunca tuvieron confirmada su unidad física, el modelo permite fijar umbrales en esas mismas unidades crudas y revisarlos cuando se conozca la unidad real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible; no aplican a un detector tabular. El autor sí publica una evaluación propia sobre el holdout temporal y sobre incidentes sintéticos construidos a partir de filas de ese holdout:

| Caso | Tasa de marcado (flagged) |
|---|---|
| Holdout limpio (falsas alarmas) | 0,027 |
| Máquina estresada: CPU, memoria y disco subiendo juntos | 0,917 |
| Caída por inactividad: CPU y memoria bajando juntos | 0,372 |
| Tormenta de red: envío y recepción subiendo juntos | 0,245 |

El autor advierte que los incidentes sintéticos son ilustrativos y no constituyen un benchmark. La tasa de falsos positivos de 0,027 en el holdout se explica, según la model card, por la región de recarga de batería cubierta por ese holdout, que la ventana de entrenamiento nunca vio.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo es CPU-only y no utiliza GPU en ninguna etapa.
- GPU recomendadas: ninguna. No hay soporte de CUDA ni de aceleración por GPU.
- ¿Cabe en GPU de consumo? No aplica: no requiere GPU. Cabe en cualquier CPU capaz de ejecutar scikit-learn.
- Memoria RAM: no se especifica en la información proporcionada; el artefacto ocupa unos pocos cientos de kilobytes y el conjunto de datos de entrenamiento tiene 4.951 filas.
- Opciones de despliegue: carga directa con `joblib.load` tras descargar `model.joblib` con `huggingface_hub`; puede envolverse en un servicio Python (por ejemplo, un endpoint HTTP propio) o integrarse en un script de monitorización. No aplican vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras en la información proporcionada.
- Advertencia de seguridad en el despliegue: el bundle usa joblib, que internamente emplea pickle. Solo debe cargarse desde este repositorio, tal como indica el autor.

## Comparativa con modelos similares

Los datos de los comparadores que figuran a continuación no provienen de la información proporcionada en esta búsqueda y se marcan como no disponibles cuando no se han podido confirmar.

| Enfoque | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| harpertoken/mark | Isolation Forest ya ajustado sobre telemetría macOS (200 árboles, 8 características) | Vector de 8 características tabulares | MIT | Hugging Face (`harpertoken/mark`) |
| scikit-learn `IsolationForest` sin ajustar | Mismo algoritmo, sin artefacto entrenado | Vector de características definido por el usuario | No disponible en la información proporcionada | Librería de código abierto |
| Librerías de detección de anomalías con múltiples detectores (por ejemplo, familia PyOD) | Conjunto de algoritmos (Isolation Forest, ECOD, LOF, autoencoders, etc.) | Tabular, serie temporal o imagen según el detector | No disponible en la información proporcionada | Librería de código abierto |
| Autoencoder sobre telemetría (por ejemplo, LSTM-AE) | Red neuronal no supervisada | Secuencias de contadores | No disponible en la información proporcionada | Requiere implementación propia |
| Umbrales estadísticos (z-score, EWMA) | Método estadístico simple | Series de contadores | No disponible en la información proporcionada | Implementación trivial |

Diferencias clave frente a la mayoría de alternativas: mark es un artefacto ya ajustado y listo para cargar, con un pipeline reproducible documentado, pero atado a un único host y a una única sesión de 1 hora y 44 minutos. Cualquier comparación cuantitativa de rendimiento entre las filas de esta tabla no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ámbito mínimo: el modelo representa una sola máquina durante una sola sesión de 1 hora y 44 minutos. No ha visto otro host, otra carga de trabajo ni una escala temporal mayor, y el autor indica que no hay razón para esperar que transfiera a otros contextos.
- Ausencia de validación externa: los incidentes sintéticos usados en la evaluación son ilustrativos, no un benchmark, y las tasas publicadas no deben interpretarse como rendimiento en producción.
- Punto débil algorítmico: los extremos en una sola característica se detectan mal, y estandarizar las características no lo corrige. Solo los incidentes que mueven varios contadores a la vez se capturan con fiabilidad.
- Sesgo conocido en falsos positivos: la tasa de 0,027 en el holdout limpio se atribuye a la región de recarga de batería, un régimen no visto durante el entrenamiento. Cambios de régimen similares generarán alarmas.
- Ambigüedad de unidades: las diferencias de disco y red son avances de contador crudos cuya unidad física nunca se confirmó, de modo que los umbrales aprendidos están en esas unidades sin interpretación física clara.
- Rendimiento desigual por tipo de incidente: 0,917 en estrés correlacionado frente a 0,372 en caída por inactividad y 0,245 en tormenta de red. No es un detector universal.
- Riesgo de falso sentido de seguridad: al ser no supervisado y con `contamination` de 0,01, una fracción fija de las muestras se etiqueta como anómala por construcción, independientemente de la realidad operativa.
- Licencia permisiva con matices prácticos: la licencia es MIT, por lo que el uso comercial está permitido, pero la carga del bundle implica deserializar pickle; solo debe hacerse desde este repositorio y nunca desde fuentes no confiables.
- Naturaleza del artefacto: no es un modelo de lenguaje, no genera texto, no soporta tool calling y no debe evaluarse con benchmarks de LLM.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/harpertoken/mark
- Dataset de entrenamiento: https://huggingface.co/datasets/harpertoken/stat
- Archivo de pesos: `model.joblib` dentro del repositorio del modelo
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
