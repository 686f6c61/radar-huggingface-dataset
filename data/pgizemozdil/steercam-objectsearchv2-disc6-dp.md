# pgizemozdil/steercam-objectsearchv2-disc6-dp

## Resumen

SteerCamera es un conjunto congelado (frozen ensemble) de cinco políticas de difusión (Diffusion Policies) entrenadas con LeRobot para la tarea ObjectSearchV2 del benchmark ManiFeel, portada a MuJoCo Warp. El modelo resuelve una tarea de percepción activa y manipulación robótica: coger una batería que puede estar en cualquier posición dentro de una caja abierta, usando una única cámara externa orientable. Lo desarrolla el autor pgizemozdil como material experimental del artículo *Steer Your Camera* (en revisión), y su función dentro del sistema es proporcionar la distribución predictiva que un controlador de cámara (guía de vista basada en incertidumbre) lee sin actualizar los pesos.

Técnicamente es un ensemble de cinco Diffusion Policies independientes (semillas 1000-1004), cada una con un encoder ResNet-18 preentrenado en ImageNet con spatial softmax y una U-Net condicional 1-D de canales [512, 1024, 2048], con difusión DDPM de 100 pasos y muestreo DDIM-10 en test. La entrada es un único frame RGB de 128 x 128 píxeles de la cámara orientable con dos pasos de observación, sin propriocepción ni pose de cámara; la salida es un chunk de 16 x 7 acciones en el marco de la base del robot, de las cuales se ejecutan 8.

Su relevancia es acotada pero específica: es un artefacto de investigación reproducible para estudiar percepción activa en robótica, con resultados publicados en un protocolo concreto (71 % de éxito con cámara fija en el bloque de desarrollo, 0 % bajo oclusión en la línea de visión y 54 % bajo tres paneles de clutter). No está pensado para operar un robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: ResNet-18 (BatchNorm, pesos ImageNet, spatial softmax) + U-Net condicional 1-D [512, 1024, 2048], DDPM 100 pasos / DDIM-10 en test |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; entrada de un frame 128 x 128 RGB y dos pasos de observación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (LeRobot `pretrained_model`: `config.json`, `model.safetensors`, pre/post-procesadores, `train_config.json`) |
| Tamaño del repositorio | 5,3 GB |
| Entrada | 1 frame RGB 128 x 128 de la cámara orientable, dos pasos de observación, sin propriocepción ni pose de cámara |
| Salida | chunk de 16 x 7 acciones en el marco de la base del robot (traslación de la punta en cm, rotación en 0,05 rad, objetivo de dedo); se ejecutan 8 |
| Miembros del ensemble | 5 (`member_0` a `member_4`, semillas 1000-1004), checkpoint en el paso 200.000 |

## Arquitectura y entrenamiento

Cada miembro es una Diffusion Policy de LeRobot: un encoder visual ResNet-18 con BatchNorm y pesos preentrenados `ResNet18_Weights.IMAGENET1K_V1`, seguido de spatial softmax, que condiciona una U-Net 1-D con canales [512, 1024, 2048]. El proceso generativo es DDPM con 100 pasos de entrenamiento y muestreo DDIM de 10 pasos en inferencia, generando chunks de 16 acciones de dimensión 7. Los cinco miembros comparten arquitectura y solo difieren en la semilla de inicialización.

El entrenamiento se realizó durante 200.000 pasos con batch 64, optimizador AdamW con tasa 0,0001 y recortes aleatorios [116, 116]. Los datos provienen de 50 demostraciones de teleoperación de ManiFeel, reproducidas y re-renderizadas desde 32 recorridos de cámara suaves y aleatorios sobre toda la ventana de vistas (el régimen "wide"), lo que permite entrenar con seis vistas fijas pero exponer al ensemble a variabilidad de punto de vista. Incluye un `calibration.json` con normalización z por fases de los términos de incertidumbre, opcional porque el benchmark usa la U sin calibrar. La innovación destacable no está en la política sino en su uso: el controlador de cámara lee la varianza total logarítmica de los chunks (U) como señal de incertidumbre para orientar la vista, sin actualizar los pesos.

## Capacidades

- Generación de chunks de acción para manipulación robótica: traslación de la punta en centímetros, rotación en unidades de 0,05 rad y objetivo de dedo, en el marco de la base del robot.
- Percepción desde una única cámara RGB de 128 x 128 píxeles, sin propriocepción ni pose de cámara.
- Estimación de incertidumbre mediante ensemble: la varianza total logarítmica de los chunks muestreados (U) sirve como señal para guiar la orientación de la cámara.
- Tarea de búsqueda de objetos: localizar y levantar una batería dentro de una caja abierta con seis vistas fijas de entrenamiento.
- Robustez parcial a clutter: 54 % de éxito con tres paneles de clutter en el protocolo de cámara fija.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje ni multimodal general.
- No incluye modo thinking, visión general, audio ni otras capacidades fuera de la política de control entrenada.

## Casos de uso

- Investigación en percepción activa: usar el ensemble como política congelada y evaluar controladores de cámara que lean la incertidumbre U para decidir la siguiente vista, reproduciendo los experimentos del artículo.
- Reproducción de benchmarks de robótica: ejecutar el protocolo v2 del repositorio `steer-your-camera` sobre el bloque de desarrollo para comparar variantes de guiado de vista con métricas de éxito limpias, con oclusión y con clutter.
- Estudio de ensembles en políticas de difusión: comparar la distribución predictiva agregada de cinco semillas frente a un miembro individual para analizar calibración y varianza.
- Docencia y formación en imitation learning: emplear los checkpoints como ejemplo completo de Diffusion Policy en LeRobot, con configuración, pre/post-procesadores y datos de entrenamiento reproducibles.
- Desarrollo de métodos de incertidumbre: usar `calibration.json` y la U sin calibrar como banco de pruebas para normalización por fases y métricas de confianza en políticas visomotoras.
- Simulación de manipulación en MuJoCo Warp: integrar las políticas en escenas texturizadas del simulador para generar trayectorias de recogida de objetos en caja abierta con fines de análisis, no de despliegue físico.

## Benchmarks y rendimiento

Resultados publicados en la model card para el bloque de desarrollo, protocolo v2, con cámara fija y 100 episodios por celda:

| Condición | Éxito de la tarea | Familiaridad del encoder |
|---|---|---|
| Escena limpia | 71 % | 46 % |
| Oclusión en la línea de visión | 0 % | 13 % |
| Tres paneles de clutter | 54 % | 40 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 5,3 GB e incluye cinco checkpoints completos más utilidades.
- GPU recomendadas: no disponible; por el tamaño de la ResNet-18 y la U-Net 1-D, la inferencia es ligera, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí para un miembro individual, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot `>=0.6.1,<0.7` con extra `[diffusion]`; carga mediante `DiffusionPolicy.from_pretrained(..., subfolder="member_k")` o el `PolicyEnsemble` del repositorio `steer-your-camera`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteerCamera (este modelo) | Diffusion Policy, ensemble de 5 | no disponible | no aplica | no disponible | Hugging Face, repo de 5,3 GB |
| Diffusion Policy estándar de LeRobot | Diffusion Policy individual | no disponible | no aplica | según LeRobot | Librería LeRobot |
| ACT (Action Chunking Transformer) de LeRobot | Transformer de imitación | no disponible | no aplica | según LeRobot | Librería LeRobot |
| Otras políticas de ManiFeel | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (MuJoCo Warp, escena de laboratorio texturizada); el autor indica explícitamente que no está pensado para pilotar un robot real.
- Depende del renderizado y de la semántica de acciones del simulador; un cambio de texturas, iluminación o cámara degrada el rendimiento.
- Sin propriocepción ni pose de cámara: la política solo ve un frame de 128 x 128 y dos pasos de observación, lo que limita la robustez ante oclusiones (0 % de éxito bajo oclusor en la línea de visión).
- Rendimiento moderado incluso en condiciones limpias (71 % en el bloque de desarrollo), con caída a 54 % bajo clutter y familiaridad del encoder baja (13-46 %).
- Es un artefacto de investigación congelado: el controlador de cámara no actualiza los pesos, por lo que no mejora con el uso.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Riesgo de sobreajuste a las 50 demostraciones originales y a los 32 recorridos de cámara sintéticos.
- No apto para tareas de lenguaje, razonamiento, código ni interacción conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgizemozdil/steercam-objectsearchv2-disc6-dp
- Repositorio de código, tareas, datasets y benchmark: https://github.com/gizemozd/steer-your-camera
- Artículo: *Steer Your Camera* (en revisión; sin enlace directo en la información proporcionada)
- LeRobot (librería base): no se incluye enlace en la información proporcionada
- ManiFeel (benchmark de origen de la tarea): no se incluye enlace en la información proporcionada
