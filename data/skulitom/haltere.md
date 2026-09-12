# Skulitom/haltere

## Resumen

Haltere es una red neuronal recurrente de control cuyo cableado se copia del conectoma del sistema nervioso central de una mosca de la fruta macho (Janelia male CNS v1.0) y que ha sido entrenada para pilotar un cuadricóptero en el simulador FPV Liftoff. El modelo contiene 30.000 neuronas y 2,77 millones de conexiones sinápticas procedentes del conectoma: la estructura y el signo de cada sinapsis están fijados por los datos biológicos, mientras que se entrenan las ganancias por sinapsis y por neurona, los sesgos, las constantes de tiempo, los codificadores sensoriales y la lectura de salida.

Lo desarrolla Skulitom y se publica con licencia MIT. No es un modelo de lenguaje: es un controlador recurrente de unidades de tasa que recibe como entrada señales de los halteros, los campaniformes del ala, el flujo óptico, los ocelos, el órgano de Johnston y células de brújula y de objetivo, y emite las cuatro órdenes de stick leídas de las neuronas motoras del ala y de sus premotoras.

Su relevancia actual está en la neurociencia computacional y en el control robusto: es un ejemplo reproducible de política de control restringida por un conectoma real, entrenada por imitación de un controlador MLP y ajustada después por retropropagación a través de un simulador diferenciable con aleatorización de dominio, y evaluada con 50 ms de latencia añadida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (RNN) de unidades de tasa, con topología y signo sináptico fijados por conectoma (30.000 neuronas, 2,77 M de sinapsis) |
| Parámetros totales | no disponible (los checkpoints publicados ocupan unos 12 MB y contienen solo parámetros; el grafo del conectoma se carga aparte) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; el estado es la actividad recurrente de las 30.000 neuronas |
| Tipos de cuantización | no disponible; se publica en la precisión nativa de PyTorch, sin versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no aplica: no procesa lenguaje natural |
| Licencia | MIT (modelo). El conectoma de origen es CC BY 4.0 y no se redistribuye |
| Formato de pesos | PyTorch `.pt` (`ftSmooth_best.pt`, `ftRobust_best.pt`, `imJ_best.pt`, `mlp_baseline.pt`) más el grafo en `flight.npz`, `flight.nodes.parquet` y `flight.meta.json` |
| Framework | PyTorch (instalación de referencia con CUDA 12.8 y Python 3.13) |
| Pipeline declarado | `reinforcement-learning` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el enfoque de RNN restringida por conectoma de Lappalainen et al. 2024: unidades de tasa cuyos pesos son proporcionales al recuento de sinapsis, con el signo fijado por el neurotransmisor predicho. El sustrato es un subgrafo de 30.000 neuronas del conectoma male CNS v1.0 que incluye todas las neuronas situadas a dos sinapsis de los sentidos de vuelo y de las motoneuronas del ala, además del complejo central y de todas las neuronas descendentes. Las entradas son los halteros, los campaniformes del ala, el flujo óptico, los ocelos, el órgano de Johnston y células de brújula y de objetivo; la salida son las cuatro órdenes de stick leídas de las motoneuronas del ala y sus premotoras.

El entrenamiento tiene dos fases. Primero, imitación de un controlador MLP (sin conectoma) dentro de un simulador de cuadricóptero diferenciable por lotes, con tasas al estilo Betaflight y PID de tasa (ganancias Zetaflight de Liftoff). Después, ajuste fino por retropropagación a través del simulador con aleatorización de dominio. La model card no describe un bucle de aprendizaje por refuerzo con función de recompensa, pese a que el pipeline declarado en HuggingFace sea `reinforcement-learning`. El vuelo en Liftoff se realiza enviando telemetría por UDP y una entrada de mando mediante un mando virtual de Xbox (ViGEmBus).

## Capacidades

- Control de vuelo de un cuadricóptero en el simulador Liftoff: hover estacionario, órbita y maniobra de ascenso y picado.
- Hover a 2 m con error medio de 0,34 m durante 40 s (`ftRobust_best`) y de 0,35 m con un cuarto del jitter de stick (`ftSmooth_best`).
- Seguimiento de una trayectoria cuadrada de 3 m en Liftoff (`ftRobust_best`).
- Órbita con 0,75 m de error de seguimiento a 0,8 m/s y ascenso-picado con 1,1 m de error a aproximadamente 1 m/s, sin choques (`ftSmooth_best`).
- Tolerancia a latencia: `ftSmooth_best` está entrenado y evaluado con 50 ms de retardo añadido (0,30 m de error medio, 95 % de las muestras dentro de 0,5 m).
- Robustez a perturbaciones de la física: aleatorización de dominio con un 35 % de jitter en el simulador.
- Entrada sensorial multimodal simulada (halteros, campaniformes del ala, flujo óptico, ocelos, órgano de Johnston, brújula y células de objetivo) y salida de cuatro comandos de stick.
- Instrumentación e interpretabilidad: el comando `haltere render` genera vídeo de la actividad neuronal junto al vídeo del dron.
- Tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, matemáticas, código y visión real: no aplica, el modelo no es un LLM ni un modelo de visión.

## Casos de uso

- Ablación de circuitos en neurociencia computacional: al estar fijada la topología del conectoma, se pueden silenciar poblaciones concretas (halteros, campaniformes, complejo central) y medir el efecto sobre el error de vuelo, usando `haltere eval` y `haltere render` como instrumentación de medida.
- Investigación en transferencia sim-to-real: el modelo sirve como punto de partida para estudiar qué parte de una política restringida por conectoma sobrevive al cambio de dinámica, con la aleatorización de dominio y la latencia añadida como variables de control.
- Desarrollo de controladores robustos a latencia: entrenar y evaluar variantes con retardos crecientes (el caso publicado usa 50 ms) para caracterizar el margen de estabilidad de una política de control antes de llevarla a hardware.
- Comparación controlado entre arquitecturas: el repositorio incluye `mlp_baseline.pt` como control experimental, de modo que se puede medir cuánto aporta la estructura del conectoma frente a un MLP puro en el mismo simulador y con las mismas condiciones (0,05 m del MLP frente a 0,20-0,30 m de las variantes con conectoma).
- Docencia de neurociencia y de aprendizaje automático: el pipeline completo (descarga del conectoma, construcción del grafo, entrenamiento, evaluación y visualización) es reproducible con `uv` y un único comando, lo que permite montar prácticas sobre redes biológicamente restringidas.
- Generación de datos de actividad neuronal etiquetada: `haltere render` produce pares de actividad neuronal y trayectoria de vuelo que se pueden usar para análisis de representaciones, búsqueda de neuronas relevantes o entrenamiento de modelos predictivos del comportamiento.
- Vuelo autónomo en simulador como demostración pública: integración con Liftoff mediante telemetría UDP y mando virtual de Xbox (ViGEmBus) para exhibir la política volando en tiempo real con `haltere liftoff doctor` como comprobación previa.
- Pruebas de estrés de robustez: la configuración de dificultad completa (25° de inclinación, 90°/s de rotación, 1 m/s de velocidad, 1 m de desviación inicial y objetivos en una caja de 6 x 6 x 2 m) permite barrer condiciones límite y localizar los modos de fallo del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K: no aplican a este modelo. Los únicos datos disponibles son métricas de control en simulador y en Liftoff.

| Controlador | Simulador, dificultad completa | Liftoff |
|---|---|---|
| MLP baseline | 0,05 m de error medio; 100 % dentro de 0,5 m | no volado |
| `imJ_best` (imitación) | 0,22 m; 95 % | deriva de 1,4 m en el sustituto físico |
| `ftRobust_best` (+ aleatorización de dominio) | 0,20 m; 99,6 % | hover a 2 m, 0,34 m de error medio en 40 s; patrón cuadrado de 3 m |
| `ftSmooth_best` (+ latencia, suavidad) | 0,30 m; 95 % con 50 ms de retardo | hover a 2 m, 0,35 m de error medio con un cuarto del jitter de stick; órbita (0,75 m de error de seguimiento a 0,8 m/s) y ascenso-picado (1,1 m a ~1 m/s), sin choques |

Condiciones de la dificultad completa: 25° de inclinación, 90°/s de rotación, 1 m/s de velocidad y 1 m de desviación en el arranque, objetivos en cualquier punto de una caja de 6 x 6 x 2 m y física perturbada un 35 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. El checkpoint pesa unos 12 MB y el grafo del conectoma está contenido en el repositorio de 0,1 GB, por lo que el consumo de memoria de la red es muy reducido.
- GPU recomendadas: no se especifican. La instalación de referencia usa PyTorch con CUDA 12.8, lo que implica una GPU NVIDIA compatible; el cuello de botella real es el simulador, no la red.
- Viabilidad en GPU de consumo: sí, cualquier GPU NVIDIA con soporte CUDA 12.8 debería ser suficiente para la red; también es previsible ejecutarla en CPU, aunque no hay cifras publicadas.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. El despliegue previsto es la CLI `haltere` (`eval`, `render`, `liftoff doctor`) sobre PyTorch, más la integración con Liftoff vía UDP y ViGEmBus.
- Latencia y throughput: no disponibles como métrica de inferencia. Como referencia de control, la variante `ftSmooth_best` mantiene 0,30 m de error medio con 50 ms de retardo añadido, y vuela en Liftoff en tiempo real.

## Comparativa con modelos similares

| Modelo | Base de la política | Error medio (simulador, dificultad completa) | Rendimiento en Liftoff | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ftSmooth_best` | RNN con conectoma de 30.000 neuronas | 0,30 m; 95 % con 50 ms de retardo | Hover a 2 m; órbita y ascenso-picado sin choques | MIT | HuggingFace y GitHub |
| `ftRobust_best` | RNN con conectoma de 30.000 neuronas | 0,20 m; 99,6 % | Hover a 2 m con 0,34 m de error; cuadrado de 3 m | MIT | HuggingFace y GitHub |
| `imJ_best` | RNN con conectoma de 30.000 neuronas | 0,22 m; 95 % | Deriva de 1,4 m en el sustituto físico | MIT | HuggingFace y GitHub |
| `mlp_baseline` | MLP sin conectoma (control experimental) | 0,05 m; 100 % dentro de 0,5 m | No volado | MIT | HuggingFace y GitHub |
| Lappalainen et al. 2024 | RNN con conectoma (referencia metodológica citada) | no disponible | no disponible | no disponible | Publicación |

No se han encontrado en la información proporcionada otros controladores comparables con métricas publicadas de vuelo en simulador; la comparativa se limita por tanto a las variantes del propio repositorio y a la referencia metodológica citada.

## Limitaciones y advertencias

- Validación únicamente en simulación: no hay resultados publicados de vuelo en hardware real, por lo que la transferencia sim-to-real no está demostrada.
- La variante de imitación `imJ_best` no es robusta fuera del simulador de entrenamiento: deriva 1,4 m en el sustituto físico.
- El modelo no es autocontenido: todos los checkpoints requieren el grafo construido (`flight.npz`, `flight.nodes.parquet`, `flight.meta.json`) para funcionar.
- Dependencia de software propietario y de plataforma: el vuelo en Liftoff requiere el simulador (de pago, en Steam) y, para la entrada de mando, ViGEmBus en Windows; los comandos de instalación de la model card usan rutas de Windows y Python 3.13.
- Dominio de operación acotado: las maniobras documentadas se limitan a una caja de 6 x 6 x 2 m, con 25° de inclinación, 90°/s de rotación y 1 m/s de velocidad; no hay datos sobre condiciones fuera de ese rango.
- Sin validación independiente en el momento de la consulta: el repositorio de HuggingFace registra 0 descargas y 0 likes, y el tamaño es de 0,1 GB.
- Licencia del modelo MIT, que permite uso comercial, pero el conectoma de origen es CC BY 4.0, no se redistribuye en el repositorio y debe descargarse con `haltere fetch` desde el bucket `gs://flyem-male-cns`, respetando la atribución a Janelia FlyEM.
- La fidelidad biológica está acotada por la calidad del conectoma male CNS v1.0: la cobertura de anotación, la predicción de neurotransmisores y el recuento de sinapsis son datos derivados y no una reconstrucción perfecta del circuito.
- Riesgo de alucinación: no aplica en el sentido habitual, porque el modelo no genera lenguaje; el modo de fallo equivalente es la divergencia o la deriva del controlador fuera del dominio entrenado.
- Sesgos e idiomas: no aplica, al no tratar lenguaje natural ni datos humanos; no hay sección de sesgos en la model card.
- Las fechas de creación y actualización registradas en HuggingFace son el 12 de septiembre de 2026, posteriores a la fecha habitual de consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Skulitom/haltere
- Repositorio de código, pipeline de entrenamiento, integración con Liftoff y vídeos: https://github.com/skulitom/haltere
- Release con checkpoints completos (estado del optimizador): https://github.com/skulitom/haltere/releases/tag/v0.1.0
- Conectoma Janelia male CNS v1.0: https://www.janelia.org/project-team/flyem/male-cns-connectome
- Simulador Liftoff en Steam: https://store.steampowered.com/app/410340/
- Bucket del conectoma para `haltere fetch`: `gs://flyem-male-cns`
- Lappalainen et al. 2024 (referencia metodológica citada en la model card): no disponible el enlace en la información proporcionada.
- ViGEmBus (mando virtual de Xbox usado para la integración con Liftoff): no disponible el enlace en la información proporcionada.
