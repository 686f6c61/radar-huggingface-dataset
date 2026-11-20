# pawanpaudel93/pi0-libero-fp16-ov

## Resumen

π0 LIBERO es un paquete de política (policy package) en formato OpenVINO del modelo vision-language-action π0, derivado de `lerobot/pi0_libero_finetuned_v044`. Lo publica el usuario pawanpaudel93 y su función es ejecutar políticas robóticas de manipulación sobre CPUs y GPUs Intel mediante el motor `ov-policy` de Cascadia, sin depender de PyTorch en tiempo de inferencia. El modelo original π0 procede de Physical Intelligence y se distribuye a través de openpi; esta versión es una conversión modificada, no un reentrenamiento.

El paquete contiene un grafo en float32 con pesos en fp16, expone el ruido como entrada explícita y fija `policy.name` a `pi0`. La interfaz es deliberadamente estrecha: dos imágenes RGB de 256×256, un vector de estado de 8 dimensiones, una instrucción de tarea y un tensor de ruido de forma [50, 32]; la salida es una secuencia de 50 acciones de 7 dimensiones. El repositorio ocupa 6,3 GB.

Su relevancia es práctica: permite desplegar una política VLA de manipulación en hardware Intel integrado (se ha verificado en una GPU Arc 140V de 16 GB) usando OpenVINO, lo que reduce la barrera de entrada frente a stacks CUDA. La contrapartida es que el motor de servicio (`ov-policy`) aún no está en una release estable de Cascadia, por lo que la adopción en producción requiere compilar desde el repositorio en revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (π0, basado en PaliGemma con action expert); grafo OpenVINO float32 con pesos fp16 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos) sobre grafo f32; no se documentan otras variantes |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto libre; no se declaran idiomas) |
| Licencia | Gemma Terms of Use (modelo construido sobre PaliGemma/Gemma) |
| Formato de pesos | OpenVINO IR (policy package para el motor `ov-policy` de Cascadia) |

Especificaciones de interfaz:

| Elemento | Valor |
|---|---|
| Entrada `images.image` | [3, 256, 256], uint8 RGB |
| Entrada `images.image2` | [3, 256, 256], uint8 RGB |
| Entrada `state` | [8] |
| Entrada `task` | escalar (instrucción textual) |
| Entrada `noise` | [50, 32] |
| Salida `action` | [50, 7] |
| Tamano del repositorio | 6,3 GB |

## Arquitectura y entrenamiento

El modelo subyacente es π0, una política vision-language-action de Physical Intelligence que combina un backbone vision-language derivado de PaliGemma con un «action expert» que genera trayectorias de acciones. Esta publicación no entrena nada: es una conversión del checkpoint `lerobot/pi0_libero_finetuned_v044` al formato manifiesto de Intel (exportador `8f132416` de physical-ai-studio, parcheado con el action expert de π0 de LeRobot). El resultado es un grafo OpenVINO en float32 con pesos en fp16, con el tensor de ruido elevado a entrada de primer nivel, lo que hace explícita la componente estocástica del muestreo de acciones.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El sufijo «libero» del checkpoint original indica ajuste fino sobre las tareas del benchmark LIBERO, un conjunto de manipulación robótica con instrucciones en lenguaje natural. La innovación técnica relevante aquí no está en el modelo sino en el empaquetado: conversión a OpenVINO IR con separación de precisión (grafo f32, pesos f16) para caber en iGPU de 16 GB, y una interfaz de inferencia fija y serializable apta para un motor de políticas.

## Capacidades

- Generación de acciones robóticas de manipulación: produce secuencias de 50 acciones de 7 grados de libertad a partir de dos vistas de cámara, estado proprioceptivo y una instrucción textual.
- Comprensión de instrucciones en lenguaje natural para condicionar la política (entrada `task`).
- Fusión visión-lenguaje-acción: el backbone tipo PaliGemma procesa las imágenes y el texto, y el action expert decodifica la trayectoria.
- Control reactivo multi-paso: cada inferencia cubre un horizonte de 50 pasos de acción, lo que permite ejecutar chunks de trayectoria antes de reconsultar.
- Ejecución sobre CPU y GPU Intel mediante OpenVINO, sin dependencia de CUDA.
- Muestreo estocástico controlable: el ruido se inyecta como entrada, lo que permite reproducibilidad y barrido de semillas desde el cliente.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso en texto, visión general, audio ni modo «thinking».

## Casos de uso

- Manipulación robótica en laboratorio con hardware Intel: ejecutar tareas de LIBERO (por ejemplo, abrir un cajón o colocar un objeto) sobre una estación con CPU Intel o iGPU Arc, usando `cascadia run ./pi0-libero-fp16-ov --engine ov-policy --device GPU` como punto de partida.
- Prototipado en equipos sin GPU NVIDIA: al ser un paquete OpenVINO, permite iterar sobre políticas VLA en portátiles o mini-PC con gráfica integrada, evitando el coste de una estación CUDA.
- Evaluación comparativa de backends: sirve para medir la degradación de una política π0 al pasar de PyTorch a OpenVINO; el autor reporta diferencias de 1,8e-3 entre CPU f32 de OpenVINO y PyTorch f32, lo que lo hace útil como referencia de fidelidad numérica.
- Validación de pipelines de robótica en CI: al tener entradas y salidas de forma fija ([3,256,256], [8], [50,32] → [50,7]), se puede integrar en tests automatizados que comprueben formas, rangos de acción y determinismo con semilla fija.
- Investigación en destilación y cuantización de políticas VLA: el paquete es un artefacto de referencia para estudiar el efecto de fp16 en la calidad de la política (15/30 frente a 19/30 en el benchmark del autor).
- Despliegue en robótica de bajo consumo: para brazos manipuladores con control local y presupuesto térmico limitado, donde una iGPU de 16 GB es el hardware disponible.
- Reproducción de experimentos LIBERO: permite replicar las 10 tareas de `libero_spatial` con 3 episodios por tarea y comparar contra la implementación de referencia en PyTorch.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO `libero_spatial`, 10 tareas x 3 episodios | Arc 140V GPU, f16 | 15/30 |
| LIBERO `libero_spatial`, 10 tareas x 3 episodios | LeRobot PyTorch, CPU f32 | 19/30 |
| Diferencia numerica OpenVINO CPU f32 vs PyTorch f32 | misma entrada | dentro de 1,8e-3 |

El autor señala que el resultado de 15/30 cae dentro del intervalo de confianza del 95 % respecto a la referencia, en su borde inferior. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, lo que es coherente con la naturaleza del modelo (política robótica, no modelo de chat).

## Requisitos de hardware

- VRAM: en GPU Arc 140V (16 GB de memoria compartida) solo es viable la variante f16; los pesos f32 no caben. El repositorio pesa 6,3 GB, por lo que se necesita al menos ese espacio para cargar el paquete.
- GPU recomendadas: GPU integrada Intel Arc 140V (verificada por el autor); previsiblemente otras iGPU y dGPU Intel compatibles con OpenVINO. No se documentan pruebas en A100, H100 ni RTX 4090, que requerirían otra vía de ejecución (PyTorch/openpi).
- CPU: se ha verificado ejecución en CPU con precisión f32 (comparación numérica frente a PyTorch f32).
- Cabe en hardware de consumo: sí, en iGPU Intel de 16 GB en fp16; en CPU, con f32.
- Opciones de despliegue: motor `ov-policy` de Cascadia (build con soporte de este tipo de política, aún no en release); OpenVINO Runtime como base. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pawanpaudel93/pi0-libero-fp16-ov | VLA OpenVINO (π0 LIBERO) | no disponible | no disponible | 15/30 (Arc 140V f16) | Gemma Terms of Use | Hugging Face, requiere Cascadia con `ov-policy` |
| lerobot/pi0_libero_finetuned_v044 | VLA PyTorch (π0 LIBERO) | no disponible | no disponible | 19/30 (CPU f32) | Gemma Terms of Use | Hugging Face / LeRobot |
| π0 / π0.5 (openpi, Physical Intelligence) | VLA PyTorch/JAX | no disponible | no disponible | no disponible en esta ficha | Apache-2.0 junto con Gemma Terms | GitHub openpi |

La comparación directa solo es posible frente al checkpoint de origen, del que este paquete es una conversión. Para el resto de alternativas no se dispone de datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Fidelidad degradada: 15/30 frente a 19/30 en `libero_spatial` con la configuración probada; la diferencia es pequeña en muestra (30 episodios) pero apunta a una pérdida real de calidad en fp16.
- Solo se ha verificado en fp16 sobre Arc 140V; los pesos f32 no caben en esa iGPU, de modo que la precisión alta no está disponible en ese hardware.
- Dependencia de un motor no publicado: el despliegue exige una build de Cascadia con el tipo de política `ov-policy`, que según el autor está en revisión y no forma parte de una release.
- Ámbito restringido: es una política de manipulación ajustada a tareas LIBERO; no es un modelo de propósito general ni un asistente conversacional.
- Idiomas no declarados: no hay información sobre el rendimiento de las instrucciones de tarea en castellano u otros idiomas distintos del usado en el ajuste fino.
- Riesgo de alucinación trasladado al dominio físico: una política puede generar trayectorias plausibles pero incorrectas; en robótica esto implica colisiones o daños, por lo que requiere límites de par, paradas de emergencia y validación en entorno simulado antes de operar.
- Sesgos: no documentados; los sesgos del backbone PaliGemma/Gemma pueden propagarse a la interpretación de las escenas.
- Licencia: sujeta a los Gemma Terms of Use, incluidas las restricciones de uso de la sección 3.2 y la Gemma Prohibited Use Policy; el uso comercial debe revisarse contra esos términos, no es una licencia permisiva tipo Apache-2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- No se documentan requisitos de calibración de cámara, espacio de trabajo ni normalización de acciones; el cliente debe replicar el preprocesado del checkpoint original (redimensionado a 256×256, vector de estado de 8 dimensiones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/pi0-libero-fp16-ov
- Modelo base: https://huggingface.co/lerobot/pi0_libero_finetuned_v044
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Cascadia (motor `ov-policy`, en revisión): https://github.com/labscommunity/cascadia
