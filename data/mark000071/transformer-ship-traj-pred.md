# mark000071/transformer-ship-traj-pred

## Resumen

EnvShip-DR es un conjunto de pesos para predicción de trayectorias de buques a 10 minutos, desarrollado por el usuario mark000071. El modelo es un transformer que incorpora un mapa de distancia firmada (SDF, *signed distance field*) del entorno marítimo como canal espacial, de ahí su nombre "SDF-map Transformer". Se entrena y evalúa sobre datos AIS reales de cuatro regiones: DMA (Dinamarca), Piraeus (Grecia), Norway y NOAA. El horizonte de predicción es de 10 minutos, discretizado en 30 pasos, y la métrica principal reportada es el ADE (*Average Displacement Error*) en metros.

El repositorio de HuggingFace contiene únicamente los *checkpoints*; el código del modelo, los scripts de evaluación y el README completo residen en el repositorio de GitHub asociado. Se publican 12 *checkpoints* principales (tres semillas por cada una de las cuatro regiones), además de variantes de ablación, un calendario de entrenamiento reducido a 30 épocas y un *baseline* LSTM. Cada carpeta incluye `best.pt` y el `config.yaml` exacto del entrenamiento.

El modelo es relevante en el ámbito de la predicción de tráfico marítimo porque cuantifica explícitamente el efecto de incorporar información espacial del entorno (SDF) frente a variantes con interacción social o sin ella, y publica errores por muestra para facilitar tests estadísticos pareados. No obstante, el autor lo restringe a uso de investigación y advierte explícitamente de que no debe emplearse para evitación autónoma de colisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificación espacial basada en SDF del entorno (SDF-map Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; horizonte de predicción de 10 minutos dividido en 30 pasos |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en precisión de entrenamiento) |
| Idiomas soportados | no aplica / no disponible (modelo numérico de trayectorias, no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (diccionario con claves `model`, `config`, `epoch`, `val_ADE_greedy30`, ...) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer adaptada a predicción de trayectorias: recibe secuencias de posiciones de buques derivadas de AIS y produce 30 pasos futuros que cubren 10 minutos. La innovación principal es la incorporación de un mapa de distancia firmada del entorno (`env_spatial`), que codifica la distancia a tierra y a otras estructuras relevantes. El repositorio incluye seis variantes de ablación comparables: `vanilla`, `env_pool` (agrupación de canales de entorno), `env_spatial` (SDF), `social` (interacción entre buques), `social_env_pool` y `social_env_spatial`.

El entrenamiento principal ("headline") usa un calendario de 90 épocas y se replica con tres semillas (42, 1, 2) en cada región. Las ablaciones y los experimentos de comparación se ejecutan con un calendario de 30 épocas. El conjunto de datos es `mark000071/envship_v2_datasets` (Track A). No se especifica en la información disponible el número de tokens o muestras de entrenamiento, la composición detallada del dataset, ni si se emplearon técnicas de ajuste como RLHF o DPO (no aplicables en sentido estricto a este dominio). El *baseline* LSTM incluido en el repositorio consume las máscaras binarias de tierra y agua (canales de entorno 0-1), no el SDF.

## Capacidades

- Predicción de trayectorias de buques a 10 minutos de horizonte, con salida de 30 pasos temporales.
- Integración de información espacial del entorno mediante campos de distancia firmada (variante `env_spatial`).
- Modelado de interacción social entre embarcaciones (variantes `social`, `social_env_pool`, `social_env_spatial`).
- Generalización a cuatro regiones marítimas distintas (DMA, Piraeus, Norway, NOAA) con *checkpoints* específicos por región y semilla.
- Evaluación pareada: el repositorio aporta `per_sample_errors/errors.npz` con errores por paso (N × 30) para realizar tests estadísticos.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión ni de audio.
- No dispone de modo de razonamiento (*thinking mode*) ni de generación de texto.

## Casos de uso

- Investigación en predicción de trayectorias marítimas: el modelo sirve como referencia reproducible con tres semillas por región y errores por muestra, lo que permite comparar nuevas propuestas con tests pareados sobre las mismas particiones.
- Gestión de tráfico marítimo portuario: en un puerto como Piraeus, el modelo puede anticipar la posición de los buques a 10 minutos para alimentar sistemas de programación de atraques y planificación de ventanas de entrada.
- Análisis de congestión y flujos en zonas costeras: agregando predicciones de múltiples buques en la región NOAA o Norway se pueden estimar densidades futuras y detectar cuellos de botella.
- Evaluación de políticas de separación de tráfico: el modelo permite simular cómo evolucionarían las trayectorias bajo distintos esquemas de ruteo obligatorio, comparando el ADE resultante por región.
- Monitorización y alerta temprana (uso de apoyo a la decisión, no autónomo): las predicciones a 10 minutos pueden generar avisos a operadores humanos sobre posibles aproximaciones, siempre con supervisión y sin sustituir a los sistemas reglamentarios de evitación de colisiones.
- Simulación y entrenamiento de operadores: las trayectorias generadas pueden poblar escenarios sintéticos realistas para formación de controladores y personal portuario.
- *Benchmarking* de arquitecturas de predicción: las variantes de ablación (`vanilla`, `env_pool`, `social`, etc.) permiten aislar la contribución del SDF y de la interacción social en un mismo *pipeline*.

## Benchmarks y rendimiento

Resultados de ADE de test (en metros) para los *checkpoints* principales de 90 épocas:

| Region | Semilla 42 | Semilla 1 | Semilla 2 |
|---|---|---|---|
| DMA | 84,38 | 85,05 | 85,65 |
| Piraeus | 155,94 | 157,31 | 151,19 |
| Norway | 123,57 | 119,28 | 112,20 |
| NOAA | 105,38 | 110,51 | 108,33 |

Nota del autor: sobre los rásteres públicos de DMA posteriores al *refill*, estos *checkpoints* obtienen 84,31 / 84,97 / 85,64.

Calendario de 30 épocas (una sola semilla, 42):

| Region | ADE (m) |
|---|---|
| DMA | 94,34 |
| Piraeus | 218,52 |
| Norway | 174,07 |
| NOAA | 167,07 |

Ablación en DMA con 30 épocas (semilla 42):

| Variante | ADE (m) |
|---|---|
| vanilla | 97,99 |
| env_pool | 94,43 |
| env_spatial | 90,41 |
| social | 99,35 |
| social_env_pool | 97,67 |
| social_env_spatial | 91,36 |

*Baseline* LSTM + env_pool:

| Region | Semilla 42 | Semilla 1 | Semilla 2 |
|---|---|---|---|
| Piraeus | 146,43 | 151,86 | 149,99 |
| Norway | 123,64 | 126,76 | 137,61 |
| NOAA | 105,65 | 107,20 | 103,43 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La *model card* no publica el número de parámetros ni el consumo de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse ni descartarse a partir de la información proporcionada.
- El repositorio completo en HuggingFace ocupa 5,3 GB e incluye múltiples *checkpoints*, por lo que el tamaño individual de cada uno no se puede derivar con precisión de ese dato.
- Opciones de despliegue: inferencia en PyTorch mediante el código del repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de predicción de trayectorias, no de lenguaje).
- Descarga de pesos: `python scripts/download_weights.py` (12 *checkpoints* principales) o `python scripts/download_weights.py --subset all` (todos).
- Verificación de integridad: `sha256sum -c SHA256SUMS`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables externos. La única comparación documentada es interna al propio repositorio, frente al *baseline* LSTM + env_pool y frente a las variantes de ablación:

| Modelo | Región | ADE (m), semilla 42 | Licencia | Disponibilidad |
|---|---|---|---|---|
| EnvShip-DR (env_spatial, 90 ep) | DMA | 84,38 | MIT | Pesos en HuggingFace, código en GitHub |
| LSTM + env_pool | NOAA | 105,65 | MIT (mismo repo) | Incluido en el repositorio |
| EnvShip-DR (env_spatial, 90 ep) | NOAA | 105,38 | MIT | Pesos en HuggingFace, código en GitHub |
| LSTM + env_pool | Piraeus | 146,43 | MIT (mismo repo) | Incluido en el repositorio |
| EnvShip-DR (env_spatial, 90 ep) | Piraeus | 155,94 | MIT | Pesos en HuggingFace, código en GitHub |

En Piraeus el *baseline* LSTM supera al transformer en las tres semillas; en NOAA los resultados están empatados en la semilla 42 y el LSTM gana en las semillas 1 y 2; en Norway el transformer es claramente superior.

## Limitaciones y advertencias

- El autor declara explícitamente "research use only; not for autonomous collision avoidance". No debe utilizarse para evitación autónoma de colisiones ni como sistema de seguridad crítico.
- Existe una posible tensión entre esa restricción de uso y la licencia MIT, que permite uso comercial; conviene revisar la documentación legal del repositorio antes de un despliegue en producción.
- El rendimiento depende fuertemente de la región: el ADE en Piraeus (155,94 m con semilla 42) duplica con creces el de DMA (84,38 m).
- El *baseline* LSTM iguala o supera al transformer en Piraeus y parcialmente en NOAA, lo que indica que la ventaja de la arquitectura no es universal.
- Se documentan discrepancias conocidas entre los resultados registrados y los obtenidos sobre los rásteres públicos de DMA posteriores al *refill* (véase §B del README de GitHub); igualmente, el *baseline* LSTM usa máscaras binarias en lugar del SDF (véase §A).
- El modelo no ha recibido descargas ni *likes* en el momento de la consulta (0 y 0), por lo que carece de validación independiente por parte de la comunidad.
- No se publican el número de parámetros, la composición del dataset, el número de muestras de entrenamiento ni los detalles del régimen de optimización en la información disponible.
- Es un modelo específico de dominio marítimo: no es un modelo de lenguaje y no puede emplearse para generación de texto, código, matemáticas, visión ni tareas conversacionales.
- La generalización a regiones distintas de DMA, Piraeus, Norway y NOAA no está evaluada.
- Existe riesgo de error en la predicción ante maniobras atípicas, condiciones meteorológicas adversas o datos AIS incompletos, aunque la *model card* no documenta un análisis específico de estos escenarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mark000071/transformer-ship-traj-pred
- Dataset: https://huggingface.co/datasets/mark000071/envship_v2_datasets
- Repositorio de código (GitHub): https://github.com/mark000071/transfomer-ship-traj-pred
- Model card extendida del autor: `docs/MODEL_CARD.md` dentro del repositorio de GitHub
