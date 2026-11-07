# Myungkyu/pi05_robotwin_deltaeef_b128_60k

## Resumen

pi05_robotwin_deltaeef_b128_60k es un modelo de vision-lenguaje-accion (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base lerobot/pi05_base sobre el conjunto de datos RoboTwin 2.0, y se presenta explícitamente como una línea base ("vanilla baseline") para el leaderboard de RoboTwin 2.0 en su configuración de co-entrenamiento (50 tareas x 50 episodios demo_clean, plataforma Aloha-AgileX, exportación oficial de LeRobot).

El modelo recibe como entrada imágenes de tres cámaras (cabeza y muñecas izquierda y derecha), un estado articular de 14 dimensiones y la instrucción de la tarea en lenguaje natural, y produce como salida 14 objetivos articulares absolutos. Está construido sobre la arquitectura Pi0.5 implementada en la librería pública LeRobot 0.5.2, con un chunk de acción de 50 pasos y entrenamiento en bf16. Cuenta con aproximadamente 4.140 millones de parámetros y un repositorio de 112,2 GB que incluye checkpoints intermedios.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigar en manipulación robótica bimanual y para comparar variantes (por ejemplo, el autor publica también una versión rldx2 y una vanilla). No es un modelo de propósito general, sino una pieza de infraestructura de investigación en políticas robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (vision-lenguaje-accion) sobre LeRobot 0.5.2 @ 09808183, chunk de acción 50, tres vistas de cámara, bf16 |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (instrucciones de tarea en lenguaje natural; idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi0.5, una política VLA que combina un backbone de visión-lenguaje con un cabezal de generación de acciones. La implementación corresponde a la versión pública de LeRobot 0.5.2 (commit 09808183). Las entradas son tres imágenes (cámara de cabeza y cámaras de muñeca izquierda y derecha), un vector de estado articular de 14 dimensiones y la instrucción textual de la tarea; la salida es un conjunto de 14 objetivos articulares absolutos, generados en chunks de 50 pasos de acción.

El entrenamiento se realizó sobre RoboTwin 2.0 en configuración de co-entrenamiento: 50 tareas con 50 episodios cada una del subconjunto demo_clean, sobre la plataforma Aloha-AgileX con exportación oficial de LeRobot. Se usó un tamaño de lote del optimizador de 128 durante 60.000 pasos, con precisión bf16, y se publica el checkpoint final sin el estado del optimizador. El repositorio incluye además checkpoints intermedios de inferencia en los pasos 15.000, 30.000 y 45.000, cada uno en su propia carpeta con su fichero SHA256SUMS. No se documentan en la información disponible detalles sobre composición exacta del dataset, número total de tokens ni uso de RLHF o DPO.

## Capacidades

- Control robótico bimanual: genera 14 objetivos articulares absolutos a partir de observaciones visuales y estado articular.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de cabeza y de ambas muñecas.
- Seguimiento de instrucciones en lenguaje natural: condiciona la política a la descripción textual de la tarea.
- Ejecución por chunks de acción: produce secuencias de 50 pasos de acción por inferencia.
- Ajuste específico para RoboTwin 2.0: entrenado en 50 tareas de manipulación del benchmark.
- Checkpoints intermedios para análisis: permite estudiar la evolución del entrenamiento en los pasos 15.000, 30.000 y 45.000.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Línea base para el leaderboard de RoboTwin 2.0: permite comparar nuevas políticas VLA contra un punto de referencia reproducible con la misma configuración de datos y entrenamiento.
- Investigación en manipulación bimanual: sirve para estudiar cómo una política Pi0.5 aprende tareas con dos brazos sobre Aloha-AgileX usando tres vistas de cámara.
- Análisis de curvas de entrenamiento: los checkpoints de 15.000, 30.000 y 45.000 pasos permiten evaluar la evolución del rendimiento y detectar cuándo se estabiliza el aprendizaje.
- Reproducción de experimentos: la configuración pública (LeRobot 0.5.2, lote 128, 60.000 pasos, bf16) facilita replicar resultados en otros entornos de laboratorio.
- Punto de partida para fine-tuning: al ser un baseline "vanilla", es un candidato natural para aplicar variantes (por ejemplo, la versión rldx2 del mismo autor) y medir la mejora.
- Evaluación de robustez visual: las tres cámaras permiten estudiar la contribución de cada vista (cabeza frente a muñecas) al éxito de la tarea mediante ablaciones.
- Despliegue en simulación y banco de pruebas: integrable en pipelines de LeRobot para ejecutar políticas entrenadas en entornos simulados antes de transferir a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143 millones de parámetros en bf16, el peso de los parámetros ronda los 8,3 GB, a lo que hay que sumar el backbone visual y las activaciones, por lo que se recomienda al menos 16-24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: no documentadas por el autor; por tamaño, cabría esperar uso en A100, H100 o RTX 4090, aunque no hay confirmación en la información disponible.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas con 24 GB o más (por ejemplo, RTX 3090/4090) en bf16, pero no está verificado en la información proporcionada.
- Opciones de despliegue: librería LeRobot (formato nativo del modelo). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_robotwin_deltaeef_b128_60k | 4.143.404.816 | no disponible | RoboTwin 2.0, co-train, 60k pasos | no disponible | Hugging Face (Myungkyu) |
| pi05_robotwin_vanilla_b128_60k | no disponible | no disponible | RoboTwin 2.0, vanilla, 60k pasos | no disponible | Hugging Face (Myungkyu) |
| rldx2_pi05_robotwin_deltaeef_b128_60k | no disponible | no disponible | RoboTwin 2.0, variante rldx2 | no disponible | Hugging Face (Myungkyu) |
| lerobot/pi05_base | no disponible | no disponible | Modelo base Pi0.5 | no disponible | Hugging Face (LeRobot) |

Los tres primeros comparten autor, configuración de datos y número de pasos, por lo que constituyen una comparativa controlada de variantes de entrenamiento sobre la misma base.

## Limitaciones y advertencias

- Es un baseline de investigación, no un modelo de propósito general: no debe usarse para texto, código ni tareas fuera del control robótico.
- Entrenado exclusivamente en RoboTwin 2.0 (50 tareas, 50 episodios demo_clean): su generalización a otras tareas, objetos o plataformas no está demostrada.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos, pero al entrenarse en un conjunto limitado de tareas y una única plataforma (Aloha-AgileX) puede heredar sesgos de esa distribución.
- Riesgo de fallo fuera de distribución: cambios de iluminación, cámara o morfología del robot pueden degradar el rendimiento sin garantías.
- El estado del optimizador no está incluido, lo que limita reanudar el entrenamiento exactamente donde se dejó.
- El repositorio ocupa 112,2 GB por los checkpoints intermedios; conviene descargar solo las partes necesarias usando allow_patterns o ignore_patterns.
- No hay datos publicados de benchmarks, latencia ni requisitos de hardware verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/pi05_robotwin_deltaeef_b128_60k
- Variante rldx2: https://huggingface.co/Myungkyu/rldx2_pi05_robotwin_deltaeef_b128_60k
- Variante vanilla: https://huggingface.co/Myungkyu/pi05_robotwin_vanilla_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset RoboTwin 2.0: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
