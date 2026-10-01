# mundoamundo/slither-wam-pretrain

## Resumen

Slither OpenWAM continued pretraining es un ajuste experimental del modelo fundacional OpenWAM-Alpha-Pretrain-Foundation-Model, orientado a modelar el videojuego slither.io como un world model de video a video. Lo publica el usuario mundoamundo en Hugging Face bajo la libreria `openwam` y se distribuye como un checkpoint de 24,8 GB en formato safetensors. El repositorio contiene en su raiz `checkpoint_step_20.safetensors`, un piloto de solo 20 pasos de entrenamiento; el entrenamiento sobre el corpus completo publica instantaneas separadas bajo `checkpoints/step_N`.

El modelo parte del checkpooint de OpenWAM en la revision `52df4e66c82c5c8b480adcc8d01f4db7415dfb56` y sustituye la cabeza de acciones de robot de 80 dimensiones por tres salidas especificas del juego: coseno y seno del angulo de raton estimado, y un indicador binario de boost. Elimina la propiocepcion del robot y usa condicionamiento de prompt vacio fijo. Cada ejemplo emplea 33 fotogramas a 30 Hz y 32 acciones de transicion, con los nueve fotogramas de video muestreados cada cuatro.

Es relevante ahora como ejemplo de adaptacion de un modelo fundacional de world modeling a un dominio concreto mediante una cabeza de acciones ligera, y por su enfoque de validacion con particion held-out por fuente y metricas publicadas paso a paso. No es un modelo de lenguaje ni un modelo autonomo de Transformers: requiere el cargador de checkpoints de OpenWAM junto con el adaptador Slither del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | world model de video a video derivado de OpenWAM-Alpha-Pretrain-Foundation-Model (no disponible el detalle interno) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 33 fotogramas a 30 Hz (aprox. 1,1 s) y 32 acciones de transicion; los 9 fotogramas de video se muestrean cada cuarto fotograma |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`checkpoint_step_20.safetensors` en la raiz; instantaneas adicionales bajo `checkpoints/step_N`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo fundacional OpenWAM-Alpha-Pretrain-Foundation-Model y solo modifica la interfaz de acciones. La cabeza original de acciones de robot de 80 dimensiones se reemplaza por tres salidas: coseno y seno de un angulo de raton estimado, mas un valor binario de boost. Se elimina la entrada de propiocepcion del robot y se emplea condicionamiento de prompt vacio fijo. El pipeline es de video a video y la libreria asociada es `openwam`, de modo que el checkpoint no es un modelo de Transformers autonomo.

Los datos de entrenamiento provienen del dataset `mundoamundo/slither-wam-video-actions`. Las acciones no estan grabadas: se estiman a partir de flujo optico. El angulo es un proxy de rumbo a dos fotogramas de distancia, no una posicion de raton registrada, y el boost se infiere del movimiento aparente. El piloto de 20 pasos utilizo validacion con particion held-out por fuente, pero su comparacion de perdida sobre 4 videos es demasiado pequena para establecer calidad de control o de rollout. La ejecucion larga registra metricas de entrenamiento paso a paso y una validacion fija con particion held-out por fuente de 47 videos en `metrics/live`; la validacion se ejecuta en el paso cero, cada 100 pasos y al final. Los ficheros JSONL incluyen perdidas separadas de video y accion, norma del gradiente, tasa de aprendizaje, throughput, memoria de GPU y registros de validacion por video con cortes de boost y formato de fuente. Los snapshots incluyen su propio historial de metricas y configuracion. Conviene subrayar que estas perdidas miden etiquetas estimadas, no calidad de rollout jugable.

## Capacidades

- Generacion de video a video sobre el dominio slither.io: el modelo produce fotogramas condicionados por el estado previo y por acciones derivadas del juego.
- Prediccion de acciones de control discretizadas en tres salidas: coseno y seno del angulo de raton estimado, y boost binario.
- World modeling: modela la dinamica del entorno a partir de secuencias de video, no solo la apariencia de fotogramas individuales.
- Condicionamiento con prompt vacio fijo: no se ha entrenado para seguir instrucciones en lenguaje natural.
- Procesamiento de secuencias de 33 fotogramas a 30 Hz con 32 acciones de transicion, lo que da una ventana temporal de aproximadamente 1,1 segundos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles, el modelo no opera sobre texto.
- Capacidades especiales: adaptacion de una cabeza de acciones robOticas a una tarea de juego; no se documentan modos de pensamiento, vision general ni audio.

## Casos de uso

- Investigacion en world models: usar el checkpoint y el adaptador Slither como banco de pruebas para estudiar como un modelo fundacional de video se adapta a un dominio concreto mediante una cabeza de acciones ligera.
- Simulacion de entorno de juego: generar rollouts de video de slither.io condicionados por secuencias de acciones para analizar la fidelidad de la dinamica aprendida.
- Estudio de estimacion de acciones por flujo optico: el dataset de origen y el esquema de etiquetas permiten evaluar hasta que punto un proxy de rumbo a dos fotogramas y un boost inferido reproducen el control real.
- Reproduccion de experimentos: el codigo de entrenamiento y el generador de manifiestos estan en el directorio `wam_training` del proyecto Slither WAM, lo que facilita repetir el pipeline de continued pretraining.
- Analisis de metricas de entrenamiento: los registros en `metrics/live` permiten estudiar curvas de perdida de video y de accion, norma de gradiente, tasa de aprendizaje y uso de memoria por paso.
- Punto de partida para fine-tuning adicional: al inicializarse desde un modelo fundacional y exponer una cabeza de tres salidas, sirve como base para nuevas adaptaciones dentro del mismo dominio o para tareas de control similares.
- Evaluacion de validacion por fuente: el esquema de particion held-out por fuente y los cortes por boost y formato permiten disenar comparaciones controladas entre variantes del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia ficheros de metricas de entrenamiento y validacion en `metrics/live`, con perdidas de video y accion separadas, norma del gradiente, tasa de aprendizaje, throughput, memoria de GPU y registros por video, pero no se facilitan valores numericos concretos. Ademas, se advierte explicitamente que esas perdidas miden etiquetas estimadas y no calidad de rollout jugable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24,8 GB, pero no se indica el reparto entre pesos, optimizador y otros artefactos, ni la precision de almacenamiento.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Sin datos de parametros ni de cuantizacion no es posible determinar si cabe en tarjetas como la RTX 4090.
- Opciones de despliegue: se debe usar el cargador de checkpoints de OpenWAM junto con el adaptador Slither del proyecto. El checkpoint no es un modelo de Transformers autonomo, por lo que no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles como cifras. Los JSONL de entrenamiento registran throughput y memoria de GPU, pero esos valores no se incluyen en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mundoamundo/slither-wam-pretrain | no disponible | 33 fotogramas a 30 Hz y 32 acciones | solo metricas de perdida, sin benchmarks publicos | no disponible | Hugging Face, repo de 24,8 GB |
| OpenWAM/OpenWAM-Alpha-Pretrain-Foundation-Model | no disponible | no disponible | no disponible | no disponible | Hugging Face; es el modelo base del que parte este checkpoint |
| Alternativas de world models para videojuegos | no disponible | no disponible | no disponible | no disponible | no se dispone de informacion de modelos comparables en la documentacion consultada |

La unica comparacion sustantiva posible es con el modelo fundacional del que deriva, ya que no se aportan datos de otros world models comparables.

## Limitaciones y advertencias

- El checkpoint de la raiz es un piloto de solo 20 pasos de entrenamiento; no representa el modelo entrenado sobre el corpus completo.
- El piloto uso una comparacion de perdida sobre 4 videos, insuficiente para establecer calidad de control o de rollout. Las instantaneas de la ejecucion larga estan en `checkpoints/step_N` y son las que reflejan ese entrenamiento mas extenso.
- Las acciones no estan grabadas sino estimadas por flujo optico. El angulo es un proxy de rumbo a dos fotogramas de distancia, no la posicion real del raton, y el boost se infiere del movimiento aparente, lo que introduce ruido en las etiquetas.
- Las perdidas de entrenamiento y validacion miden etiquetas estimadas, no la calidad jugable del resultado, por lo que no deben interpretarse como una medida directa de rendimiento.
- No es un modelo de Transformers autonomo: requiere el cargador de OpenWAM y el adaptador Slither del proyecto, lo que limita su portabilidad.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- No se documentan idiomas soportados, sesgos conocidos ni comportamiento multilingue; el modelo opera sobre video y acciones, no sobre texto.
- No se especifican parametros, cuantizaciones soportadas ni requisitos de hardware, lo que dificulta planificar su despliegue en produccion.
- El condicionamiento con prompt vacio fijo implica que el modelo no responde a instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mundoamundo/slither-wam-pretrain
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Pretrain-Foundation-Model
- Dataset de origen: https://huggingface.co/datasets/mundoamundo/slither-wam-video-actions
- Metricas de entrenamiento y validacion: https://huggingface.co/mundoamundo/slither-wam-pretrain/tree/main/metrics/live
- Revision del modelo base referenciada: 52df4e66c82c5c8b480adcc8d01f4db7415dfb56
