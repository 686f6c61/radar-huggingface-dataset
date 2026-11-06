# Samisaliveagain/libero-clip-vla

## Resumen

Libero-clip-vla es una política de visión-lenguaje-acción (VLA) desarrollada por Samyak Jain (usuario Samisaliveagain) para el control de un brazo robótico Franka Panda en el simulador MuJoCo, dentro del benchmark LIBERO. El modelo combina codificadores CLIP ViT-B/16 congelados con un transformer propio de cuatro capas y anchura 256 entrenado mediante clonación de comportamiento (behavior cloning) supervisada, no mediante aprendizaje por refuerzo. Su relevancia radica en que demuestra un enfoque de bajo coste computacional: solo 3,5 millones de parámetros entrenables sobre una base preentrenada congelada, entrenado en una GPU de portátil con 6 GB de VRAM.

El modelo recibe una imagen RGB externa, una instrucción en lenguaje natural y el estado propioceptivo del robot (siete articulaciones más dos posiciones de pinza), y produce un comando normalizado de siete valores `[dx, dy, dz, dRx, dRy, dRz, gripper]`. Está pensado como experimento local reproducible de clonación de comportamiento en simulación, no como un modelo fundacional de robótica de propósito general.

El checkpoint seleccionado (`frozen_epoch06.ckpt`, 42,8 MB) alcanza un 27,5 % de éxito agregado (55 de 200 rollouts) en diez tareas del conjunto LIBERO-Goal, con un rendimiento muy desigual entre tareas. El proyecto incluye 18 checkpoints, 1.529 archivos de experimento y una política de un solo paso sin memoria temporal ni action chunking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: CLIP ViT-B/16 congelado (visión y texto) + transformer propio de 4 capas, anchura 256, 8 cabezas + cabeza de acción de 7 valores |
| Parametros totales | 3.557.639 parámetros entrenables (más el backbone CLIP ViT-B/16 congelado, descargado aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (una instrucción de texto por paso; sin ventana temporal) |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch nativo, no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (instrucciones de las tareas LIBERO) |
| Licencia | MIT (código y checkpoints); dataset bajo Apache-2.0; activos LIBERO y CLIP con sus propias licencias |
| Formato de pesos | Checkpoint Lightning personalizado (`.ckpt`), no exportable como `AutoModel` de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje híbrido: dos codificadores CLIP ViT-B/16 (imagen y texto) se mantienen congelados y se descargan por separado desde `openai/clip-vit-base-patch16` (revisión `57c216476eefef5ab752ec549e440a49ae4ae5f3`). Sobre esas representaciones congeladas se entrenan proyectores visuales y de texto, un MLP para el estado propioceptivo, embeddings de modalidad, una query de acción, un transformer de cuatro capas con anchura 256 y ocho cabezas, y una cabeza de acción de siete valores. El preprocesado, el controlador OSC_POSE, el simulador MuJoCo y los predicados de éxito de LIBERO son infraestructura no aprendida.

El entrenamiento es clonación de comportamiento supervisada sobre el dataset `Samisaliveagain/libero-goal-vla`, sin RLHF ni DPO. El número de tokens de entrenamiento y la composición exacta del dataset no están disponibles en la información proporcionada. La época 6 se seleccionó mediante evidencia de validación y desarrollo; el autor advierte explícitamente que una menor pérdida offline no implica mayor éxito en bucle cerrado. El protocolo de evaluación usa índices de reset fijos 20–39 por objetivo, diez pasos de asentamiento con pinza abierta, horizonte de 600 acciones y control simulado a 20 Hz.

## Capacidades

- Control robótico de un Panda de 7 grados de libertad en MuJoCo a partir de instrucciones en lenguaje natural.
- Percepción visual de una única cámara RGB externa, sin profundidad ni múltiples vistas.
- Condicionamiento por lenguaje mediante el codificador de texto CLIP congelado.
- Fusión de visión, texto y propiocepción (7 articulaciones + 2 dedos) en una política de un solo paso.
- Generación de comandos de acción normalizados de 7 dimensiones (traslación, rotación y apertura de pinza).
- Ejecución en bucle cerrado con rollouts reproducibles en el simulador LIBERO.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni otras modalidades (audio, vídeo).

## Casos de uso

- Reproducción de experimentos de clonación de comportamiento en simulación: el repositorio incluye scripts de descarga con verificación SHA-256 y comandos de rollout que permiten replicar exactamente el checkpoint `frozen_epoch06.ckpt` y las condiciones de evaluación.
- Estudio de políticas VLA con backbone congelado: sirve como caso base de bajo coste (3,5 M de parámetros entrenables) para comparar el efecto de congelar CLIP frente a fine-tuning completo en tareas de manipulación.
- Docencia e investigación en robótica de manipulación: las diez tareas LIBERO-Goal (poner el bol en el plato, abrir cajones, encender la cocina, colocar la botella de vino) permiten analizar fallos por tarea con tasas de éxito medidas y trazas de latencia.
- Análisis de fallos y taxonomía de contacto: los 145 rollouts fallidos que agotan el horizonte sin fallos de ejecución ofrecen material para estudiar modos de fallo (agarre, aproximación, orientación) en un entorno controlado.
- Prototipado rápido en hardware modesto: el entrenamiento y la inferencia caben en una RTX 4050 Laptop con 6 GB de VRAM, lo que permite iterar en un portátil sin clúster.
- Evaluación de protocolos de benchmark: el autor documenta explícitamente las limitaciones de su protocolo (índices de reset fijos, selección de tareas tras ver resultados), útil como ejemplo de buenas prácticas de transparencia en evaluación.
- Base para extensiones con memoria temporal o action chunking: al ser una política de un solo paso sin memoria, es un punto de partida claro para añadir historial o predicción de secuencias de acciones.

## Benchmarks y rendimiento

Resultados de éxito en bucle cerrado sobre diez tareas LIBERO-Goal, 20 rollouts por tarea (protocolo del autor):

| Objetivo | Éxitos / rollouts |
|---|---:|
| put the bowl on the plate | 8 / 20 |
| put the bowl on top of the cabinet | 14 / 20 |
| open the middle drawer of the cabinet | 0 / 20 |
| open the top drawer and put the bowl inside | 0 / 20 |
| push the plate to the front of the stove | 11 / 20 |
| put the bowl on the stove | 5 / 20 |
| put the cream cheese in the bowl | 0 / 20 |
| put the wine bottle on the rack | 1 / 20 |
| put the wine bottle on top of the cabinet | 14 / 20 |
| turn on the stove | 2 / 20 |
| **Agregado** | **55 / 200 (27,5 %)** |

Un único seed de entrenamiento. Los 145 fallos alcanzaron el horizonte de 600 acciones sin fallos de ejecución. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, dado que el modelo no es un modelo de lenguaje general. El autor indica que las ablaciones de imagen/propiocepción, los cambios visuales y de colocación novedosos, la taxonomía de contacto y múltiples seeds están incompletos.

## Requisitos de hardware

- VRAM de inferencia: inferior a 6 GB en el entorno documentado (RTX 4050 Laptop GPU con 6 GB), incluyendo CLIP ViT-B/16 congelado y el transformer propio.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM es suficiente; no se documentan requisitos para A100 o H100 porque el modelo es muy pequeño.
- Cabe en GPU consumer: sí, confirmado en RTX 4050 Laptop (6 GB).
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el despliegue es mediante el repositorio propio con PyTorch y Lightning, cargando el checkpoint `.ckpt` y ejecutando `scripts/rollout_libero_policy.py` sobre MuJoCo.
- Latencia y throughput: control simulado a 20 Hz; no se publican cifras de latencia por paso ni throughput medido. El autor advierte que el régimen simulado a 20 Hz no demuestra operación en tiempo real estricto.
- Entorno de reproducción: Python 3.11, Windows nativo y CUDA, según `docs/SETUP.md`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / memoria | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| libero-clip-vla | 3,5 M entrenables + CLIP ViT-B/16 congelado | Sin memoria temporal; una imagen y una instrucción por paso | Clonación de comportamiento con backbone congelado | MIT | Hugging Face y GitHub del autor |
| OpenVLA | No disponible en la información proporcionada | No disponible | VLA preentrenado sobre Llama y DINOv2 | No disponible | No disponible |
| RT-2 | No disponible en la información proporcionada | No disponible | VLA basado en modelo de lenguaje y visión | No disponible | No disponible |

No se dispone de datos verificados en la información proporcionada para establecer comparaciones numéricas con OpenVLA, RT-2 u otras políticas VLA; los valores de esos modelos se indican como no disponibles para no inventar cifras.

## Limitaciones y advertencias

- Rendimiento muy desigual: tres tareas con 0/20 de éxito y una con 1/20; el agregado del 27,5 % oculta una alta varianza por objetivo.
- Una sola semilla de entrenamiento: no hay evidencia de estabilidad entre seeds.
- Política de un solo paso: sin memoria temporal ni action chunking, lo que limita tareas que requieren historial o secuencias largas.
- Una única cámara RGB: sin profundidad ni múltiples vistas; sensible a cambios visuales no vistos en entrenamiento.
- No desplegado en hardware físico: solo validado en simulación MuJoCo; no hay evidencia de transferencia sim-to-real.
- Protocolo de evaluación parcial: ablaciones de imagen y propiocepción, cambios de colocación y taxonomía de contacto incompletos.
- Posible sesgo de selección: la extensión a ocho tareas se eligió tras ver los resultados de las dos primeras; los estados iniciales del simulador no se declaran disjuntos de las demostraciones.
- Riesgo de sobreajuste a los índices de reset fijos (20–39) y a las condiciones del simulador.
- Licencia: código y checkpoints bajo MIT, pero el dataset retiene Apache-2.0 y los activos LIBERO y CLIP conservan sus propias licencias, que deben verificarse para uso derivado.
- Seguridad de serialización: el checkpoint es un `.ckpt` de PyTorch/Lightning y debe cargarse solo desde fuentes de confianza.
- No es un modelo de lenguaje ni un modelo fundacional de robótica: no debe usarse para generación de texto, razonamiento general ni control de robots reales sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samisaliveagain/libero-clip-vla
- Dataset: https://huggingface.co/datasets/Samisaliveagain/libero-goal-vla
- Repositorio fuente: https://github.com/samisaliveagain/libero-clip-vla
- Vídeos de demostración: https://github.com/samisaliveagain/libero-clip-vla/blob/main/docs/VIDEOS.md
- Resultados completos: https://github.com/samisaliveagain/libero-clip-vla/blob/main/docs/RESULTS.md
- Guía de instalación: https://github.com/samisaliveagain/libero-clip-vla/blob/main/docs/SETUP.md
- CLIP ViT-B/16 preentrenado: https://huggingface.co/openai/clip-vit-base-patch16
