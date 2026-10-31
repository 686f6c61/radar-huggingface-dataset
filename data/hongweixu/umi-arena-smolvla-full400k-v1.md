# HongWeiXu/umi-arena-smolvla-full400k-v1

## Resumen

UMI Arena SmolVLA Full400k es un modelo de política robótica (VLA, *Vision-Language-Action*) desarrollado por HongWeiXu como candidata de presentación para la categoría de políticas de la competición UMI Arena. Se trata de un ajuste de la arquitectura SmolVLA, entrenado hasta el paso 400.000, cuyo objetivo es generar acciones de manipulación bimanual a partir de observaciones visuales, estado del gripper e instrucciones en lenguaje natural.

El modelo resuelve el problema clásico de la imitación de políticas de manipulación: dadas imágenes RGB de cámaras izquierda y derecha, la pose relativa entre manos y el estado del gripper, produce bloques de acciones (*action chunks*) de forma `(32, 16)` con temporización de acción entrenada de forma nativa. Su relevancia estriba en su integración directa con el ecosistema LeRobot de Hugging Face y en su validación con el comprobador oficial de interfaces de UMI Arena sobre una RTX 3090.

Con 450.046.176 parámetros (dato real extraído de los ficheros safetensors) y un tamaño de repositorio de 1,8 GB, es un modelo compacto y accesible para hardware de consumo. No se han publicado detalles sobre la longitud de contexto, la licencia específica del repositorio ni los datos de entrenamiento, que no se incluyen en el mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA para robótica, integrada en LeRobot) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (acepta *prompt* de texto como entrada) |
| Licencia | no disponible |
| Formato de pesos | safetensors (1,8 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura VLA compacta del ecosistema LeRobot diseñada para políticas de manipulación robótica que combinan percepción visual, lenguaje y salida de acciones motoras. Las entradas del modelo son imágenes RGB de las cámaras izquierda y derecha, la pose relativa entre las dos manos (*inter-hand pose*), el estado del gripper y un *prompt* textual. La salida es un bloque de acciones en coma flotante de forma `(32, 16)`, es decir, 32 pasos de acción con 16 dimensiones cada uno, con temporización de acción aprendida durante el entrenamiento (*native trained action timing*).

El *checkpoint* corresponde al paso de entrenamiento 400.000, como indica el propio nombre del repositorio (*full400k*). No obstante, la model card no incluye información sobre el número de tokens o muestras de entrenamiento, la composición del conjunto de datos (presumiblemente datos de la pista de políticas de UMI Arena, basada en UMI), ni sobre el uso de técnicas como RLHF o DPO, que en cualquier caso no son habituales en políticas de robótica. El repositorio incluye únicamente los pesos de inferencia, los procesadores y los recursos de tokenizador/configuración junto con el adaptador requerido; los datos de entrenamiento y los estados del optimizador no se publican.

## Capacidades

- Generación de políticas de manipulación bimanual: produce bloques de acciones `(32, 16)` a partir de observaciones visuales y estado del efector.
- Comprensión de instrucciones en lenguaje natural mediante *prompt* textual como condicionante de la política.
- Fusión multivista: procesa simultáneamente imágenes RGB de cámara izquierda y derecha.
- Uso de información propioceptiva: incorpora la pose relativa entre manos y el estado del gripper como entradas del modelo.
- Temporización de acción nativa: los tiempos de ejecución de las acciones se generan según lo aprendido durante el entrenamiento, sin necesidad de interpolación externa.
- Compatibilidad con el ecosistema LeRobot (librería `lerobot`) y con el contenedor oficial de torch de UMI Arena.
- No dispone de capacidades de tool calling, agentes ni razonamiento multi-paso: es un modelo especializado en control robótico.

## Casos de uso

- Evaluación en competiciones de políticas robóticas: el modelo está publicado expresamente para la evaluación oficial de la pista de políticas de UMI Arena, y ha superado el comprobador oficial de interfaces en local.
- Manipulación bimanual en simulación o bancada: dada su entrada de imágenes estéreo (izquierda/derecha) y pose inter-mano, es adecuado para tareas de ensamblaje o manipulación coordinada de dos brazos.
- Investigación en VLA compactas: con unos 450 millones de parámetros, sirve como punto de partida ligero para experimentos de fine-tuning o destilación en laboratorios sin acceso a grandes clústeres.
- Despliegue en GPU de consumo: la model card confirma su ejecución sobre una RTX 3090 bajo Podman, lo que lo hace viable para prototipado en estaciones de trabajo personales.
- Integración en pipelines de LeRobot: puede cargarse directamente con la librería `lerobot` para inferencia, grabación de episodios y evaluación comparativa de políticas.
- Benchmarking de infraestructura de inferencia robótica: al incluir procesadores y tokenizador/configuración con revisión fijada (`7b375e1b...`), permite reproducir entornos de inferencia deterministas en contenedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el modelo no constituye un resultado oficial de éxito en robot ni una medición sobre RTX 5070 Ti; únicamente se confirma que el comprobador oficial de interfaces se ejecutó correctamente sobre una RTX 3090 bajo Podman.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; con 450 millones de parámetros en safetensors (1,8 GB de repositorio), la inferencia en FP32/FP16 debería requerir del orden de 2-4 GB de VRAM, sin contar la carga de las imágenes de entrada.
- GPU recomendadas: la model card confirma funcionamiento validado sobre NVIDIA RTX 3090 (24 GB) mediante el contenedor oficial de torch de UMI Arena bajo Podman.
- Cabe en GPU de consumo: sí, la RTX 3090 es una GPU de consumo y el modelo es lo bastante pequeño para ejecutarse también en GPUs de gama media-alta (RTX 3060/4070 o superiores, de forma estimada).
- Opciones de despliegue: contenedor oficial de torch de UMI Arena (validado), librería `lerobot` de Hugging Face con PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no son aplicables al tratarse de una política robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Libreria | Licencia |
|---|---|---|---|---|
| UMI Arena SmolVLA Full400k (este modelo) | 450 M | Política VLA de manipulación bimanual (UMI Arena) | lerobot | no disponible |
| SmolVLA (base, Hugging Face) | ~450 M | Política VLA generalista de manipulación | lerobot | Apache 2.0 (según repo upstream) |
| OpenVLA | ~7.000 M | Política VLA generalista de manipulación | Prismatic/VLA | MIT (pesos, con restricciones de datos upstream) |
| pi0 (Physical Intelligence, port LeRobot) | ~3.000 M | Política VLA de manipulación | lerobot | no disponible (pesos restringidos) |

Este modelo destaca frente a alternativas como OpenVLA o pi0 por su tamaño muy reducido, que facilita la inferencia en GPU de consumo, a cambio de un alcance restringido a la pista de políticas de UMI Arena y sin resultados públicos de rendimiento comparativo.

## Limitaciones y advertencias

- Licencia no especificada en la model card: la propia card advierte que no otorga derechos adicionales sobre los datos de la competición ni sobre el modelo derivado, y que aplican los términos del conjunto de datos y las licencias upstream. Es imprescindible revisar las condiciones de UMI Arena y de SmolVLA antes de cualquier uso comercial.
- Sin resultados de rendimiento publicados: no hay métricas de éxito en robot, tasas de finalización de tareas ni latencias; la única validación es el paso del comprobador oficial de interfaces.
- Ámbito de uso restringido: el modelo se publica para evaluación oficial de la competición; su comportamiento fuera de la distribución de datos de UMI Arena no está caracterizado.
- Riesgo de alucinación/acciones erróneas: como toda política aprendida por imitación, puede producir acciones inválidas o inseguras ante observaciones fuera de distribución; no debe desplegarse en hardware físico sin supervisión y barreras de seguridad.
- Idiomas del prompt no documentados: no se especifica qué idiomas o formatos de instrucción textual soporta.
- Dependencia de versiones concretas: la inferencia requiere la revisión exacta de tokenizador/configuración (`7b375e1b73b11138ff12fe22c8f2822d8fe03467`) y el adaptador incluido en el repositorio.
- Uso casi nulo hasta la fecha: el repositorio registra 0 descargas y 0 likes, por lo que no existe una comunidad que haya validado su funcionamiento en otros entornos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HongWeiXu/umi-arena-smolvla-full400k-v1
- Ecosistema LeRobot (Hugging Face): https://huggingface.co/lerobot
- No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.
