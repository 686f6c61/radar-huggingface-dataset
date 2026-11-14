# Masaruno/tabletennis-table-detector

## Resumen

Table-tennis table corner detector (v3) es un modelo de detección de keypoints desarrollado por Masaruno, orientado especificamente a la localizacion de las cuatro esquinas de una mesa de tenis de mesa en fotogramas de retransmisiones televisivas. El modelo predice, ademas de las coordenadas de cada esquina, una puntuacion de presencia de mesa y un indicador de visibilidad por esquina, lo que permite gestionar oclusiones parciales tipicas de planos de camara principal en directo.

Se distribuye en dos formatos: un paquete Core ML en fp16 con entrada de 512x288 RGB y salidas en forma de mapas de calor sigmoideos de 4x72x128, y un checkpoint de PyTorch que contiene el `state_dict` de la red `TableKeypointNet`, basada en ResNet18 con tres capas de deconvolucion. La arquitectura sigue el estilo SimpleBaseline para estimacion de keypoints mediante heatmaps con stride 4.

La version v3 incorpora objetivos amodales para esquinas ocluidas y oclusion sintetica durante el entrenamiento. El conjunto de datos anotado es reducido (385 fotogramas de 9 recintos y retransmisiones), pero reporta un error mediano de 2,1 px en esquinas visibles y 3,2 px en esquinas ocluidas sobre resolucion 1280x720. Su licencia MIT facilita la integracion en herramientas de grabacion y analisis de partidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone ResNet18 y 3 capas de deconvolucion (estilo SimpleBaseline, heatmaps) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | fp16 en el paquete Core ML; checkpoint PyTorch sin cuantizar indicada |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Core ML (`TableDetector.mlpackage`), PyTorch (`table_detector_v3.pt`) |

## Arquitectura y entrenamiento

La red `TableKeypointNet` emplea un backbone ResNet18 seguido de tres capas de deconvolucion que elevan la resolucion del mapa de caracteristicas hasta producir heatmaps con stride 4. La entrada es de 512x288 pixeles RGB, equivalente a un fotograma de 1280x720 reescalado por un factor de 0,4. La salida consta de cuatro heatmaps sigmoideos de 72x128 (uno por esquina: lejana-izquierda, lejana-derecha, cercana-derecha, cercana-izquierda), una puntuacion de presencia de mesa y una salida de visibilidad por esquina.

El entrenamiento de la version v3 (noviembre de 2026) se realizo con objetivos amodales para las esquinas ocluidas y con oclusion sintetica, lo que permite inferir la posicion de esquinas no visibles. El conjunto de datos anotado comprende 385 fotogramas procedentes de 9 recintos y retransmisiones distintas. No se especifica en la informacion disponible el numero de tokens, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio). La validacion reporta un error mediano de 2,1 px en esquinas visibles y 3,2 px en esquinas ocluidas, medido sobre la resolucion original de 1280x720.

## Capacidades

- Deteccion de las cuatro esquinas de una mesa de tenis de mesa en fotogramas de camara principal de retransmision.
- Prediccion de una puntuacion de presencia de mesa ("table present") por fotograma.
- Estimacion de visibilidad por esquina, util para filtrar keypoints poco fiables.
- Inferencia amodal de esquinas ocluidas gracias a los objetivos amodales y la oclusion sintetica del entrenamiento.
- Ejecucion en macOS e iOS mediante Core ML en fp16, y en otras plataformas mediante el checkpoint de PyTorch.
- Integracion con herramientas de grabacion y analisis de partidos (PingPongTracker, `recorder_qt`, proyecto Tabletennis_detr).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues: es un modelo puramente de vision por computador.

## Casos de uso

- Seguimiento automatico de partidos: el modelo localiza las esquinas de la mesa en cada fotograma de la camara principal, lo que permite al pipeline de PingPongTracker calcular la homografia de la mesa y proyectar la trayectoria de la bola sobre coordenadas normalizadas del tablero.
- Grabacion automatizada con `recorder_qt`: la puntuacion de presencia de mesa y la visibilidad por esquina permiten decidir cuando iniciar o pausar la grabacion y descartar planos en los que la mesa no esta completa.
- Analisis de retransmisiones en directo: al ejecutarse como paquete Core ML en fp16, puede desplegarse en equipos macOS o dispositivos iOS para procesar el flujo de video con baja latencia en el propio dispositivo.
- Etiquetado y anotacion asistida: las predicciones de esquinas, incluida la inferencia amodal de esquinas ocluidas, sirven como propuesta inicial para acelerar el etiquetado manual de nuevos fotogramas de tenis de mesa.
- Deteccion de cambios de plano: la variacion de la puntuacion de presencia y de la geometria de las esquinas entre fotogramas consecutivos permite identificar cortes de camara o planos no principales.
- Investigacion en vision deportiva: el modelo proporciona un punto de partida reproducible (licencia MIT, pesos PyTorch y Core ML) para experimentar con deteccion de keypoints en dominios con oclusiones y datasets reducidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Error mediano en esquinas visibles (1280x720) | 2,1 px |
| Error mediano en esquinas ocluidas (1280x720) | 3,2 px |

No se han publicado resultados de benchmarks estandar (PCK, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son los errores medianos de validacion reportados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y un backbone ResNet18, la huella de memoria es reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA para el checkpoint PyTorch (por ejemplo, RTX 3060, RTX 4090, A100, H100); en el caso de Core ML, la ejecucion se realiza en hardware Apple (CPU, GPU o Neural Engine).
- Cabe en GPU consumer: si, dado el reducido tamano del modelo.
- Opciones de despliegue: Core ML en macOS e iOS; PyTorch para otras plataformas. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un modelo especializado y de nicho (deteccion de esquinas de mesa de tenis de mesa) para el que no se han facilitado alternativas directas con las que comparar parametros, contexto, rendimiento, licencia o disponibilidad.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Masaruno/tabletennis-table-detector | no disponible (ResNet18 + 3 deconv) | no aplica | error mediano 2,1 px (visibles) / 3,2 px (ocluidas) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: 385 fotogramas de 9 recintos, lo que limita la generalizacion a nuevos estadios, condiciones de iluminacion o angulos de camara no vistos.
- Disenado especificamente para planos de camara principal de retransmision; su rendimiento en otras perspectivas (camaras laterales, cenitales o de aficionado) no esta documentado.
- Riesgo de error en esquinas ocluidas: aunque el modelo es amodal, el error mediano en esquinas ocluidas (3,2 px) es superior al de las visibles (2,1 px), y la fiabilidad puede degradarse con oclusiones severas o prolongadas.
- No es un modelo de lenguaje ni un modelo multimodal general: no soporta texto, tool calling, agentes ni razonamiento; su uso esta acotado a vision por computador.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a condiciones adversas (lluvia de focos, reflejos, movimiento de camara).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias explicitas sobre el rendimiento en produccion; conviene validar el modelo en el dominio concreto de despliegue antes de integrarlo.
- El modelo depende de la resolucion de entrada 512x288 (equivalente a 1280x720 escalado por 0,4); otros formatos requeriran reescalado y pueden alterar la precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Masaruno/tabletennis-table-detector
- Repositorio PingPongTracker (carpeta `TableDetection/`): no disponible como URL directa en la informacion proporcionada
- Proyecto Tabletennis_detr: no disponible como URL directa en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
