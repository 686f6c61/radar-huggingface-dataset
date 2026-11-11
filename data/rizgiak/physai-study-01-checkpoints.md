# rizgiak/physai-study-01-checkpoints

## Resumen

`rizgiak/physai-study-01-checkpoints` es un repositorio de puntos de control (checkpoints) de políticas de imitación robótica entrenadas para una tarea concreta de pick-and-place aleatorizado sobre dos plataformas: el brazo SO-101 y el ViperX 300 S. No es un modelo de lenguaje ni un modelo fundacional de propósito general: es un conjunto de 45 checkpoints que respaldan los resultados de un estudio empírico sobre cuánto degrada el rendimiento de una política aprendida cuando cambia únicamente el renderizador de la simulación (MuJoCo, Isaac Sim y Newton). Lo publica el usuario `rizgiak` bajo licencia Apache 2.0.

El repositorio incluye tres familias de recetas: ACT (Action Chunking Transformer), Diffusion Policy v2 y fine-tunes de SmolVLA, todas gestionadas con la librería LeRobot. La tarea es consistente en todos los checkpoints: el robot debe colocar un cubo rojo sobre una almohadilla verde, con cubo y almohadilla situados en posiciones aleatorias dentro del espacio de trabajo alcanzable en vertical. Las demostraciones provienen de un experto scriptado privilegiado en MuJoCo, y las variantes "Isaac" son las mismas acciones de MuJoCo reproducidas en Isaac Sim, no un experto nativo de Isaac.

La relevancia del repositorio es metodológica más que de producto: cuantifica el coste de transferencia sim-to-sim entre renderizadores, documenta la varianza entre semillas de red y publica correcciones de renderizado que movieron puntuaciones hasta 26 de 300 episodios. El tamaño del repositorio es de 16,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), Diffusion Policy v2 y SmolVLA (fine-tunes); políticas de imitación visuomotoras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (políticas condicionadas por observación, no modelos de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tarea | Pick-and-place aleatorizado: cubo rojo sobre almohadilla verde |
| Plataformas robóticas | SO-101 y ViperX 300 S |
| Renderizadores evaluados | MuJoCo, Isaac Sim (6.1.0.0 y 6.2.0.0), Newton (render-only) |
| Número de checkpoints | 45 carpetas (17 + 17 + 11) |
| Tamaño del repositorio | 16,9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

Las tres recetas empleadas son políticas de imitación visuomotoras. ACT es un transformer con decodificación por chunks de acciones (chunk de 100 en la configuración nominal) que predice secuencias de acciones a partir de observaciones visuales y propioceptivas. Diffusion Policy v2 modela la distribución de acciones mediante difusión y, en esta configuración, reproduce 16 de 64 acciones por paso. SmolVLA se emplea en la tercera parte del estudio como fine-tune sobre la tarea concreta. Todas las recetas se entrenaron con LeRobot.

Las demostraciones provienen de un experto scriptado privilegiado en MuJoCo con semillas de episodio 0-199 (200 demostraciones) o 0-399 (400 demostraciones). Las variantes "Isaac" son las mismas acciones de MuJoCo reproducidas en Isaac Sim con los fotogramas de Isaac, no un experto entrenado en Isaac. Los modelos de una misma receta difieren únicamente en la semilla de red; la dispersión entre ellos se reporta como parte del resultado. Los modelos "randomized-look" usan 400 demostraciones con apariencia aleatorizada y 120k pasos de entrenamiento, frente a los 60k pasos de las variantes nominales de 200 demostraciones. La evaluación se realiza sobre episodios retenidos (semillas 1000-1299; las semillas 900-999 se usaron para elegir ajustes y no se reportan como puntuaciones). Una innovación metodológica destacable es la separación entre física y renderizado en Newton: MuJoCo mantiene la física y Newton dibuja los fotogramas de cámara, lo que permite aislar el efecto del renderizador.

## Capacidades

- Ejecución de una tarea de pick-and-place aleatorizado: colocar un cubo rojo sobre una almohadilla verde en posiciones variables dentro del espacio de trabajo alcanzable en vertical.
- Política visuomotora condicionada por imágenes de cámara y estado del robot, sin entrada de lenguaje.
- Generalización a cambios de renderizador: los modelos entrenados con apariencia aleatorizada y con demostraciones en ambos renderizadores mantienen puntuaciones altas bajo MuJoCo, Newton e Isaac Sim.
- Robustez parcial a variaciones de apariencia (color jitter) en la tercera parte del estudio, con un modelo ACT específico.
- Fine-tuning de SmolVLA sobre la tarea concreta (tercera parte, 11 carpetas).
- No dispone de tool calling, function calling, razonamiento multi-paso textual ni capacidades multilingües: es un modelo robótico de imitación, no un modelo de lenguaje.

## Casos de uso

- Evaluación de transferencia sim-to-sim: usar los checkpoints como referencia para medir cuánto pierde una política ACT o Diffusion Policy al cambiar de MuJoCo a Isaac Sim o a Newton, con protocolos de 100 o 300 episodios y semillas retenidas documentadas.
- Estudio de varianza entre semillas: comparar los checkpoints `_seed0`, `_seed1`, `_seed2` y `_unseeded` de una misma receta para cuantificar la dispersión de rendimiento atribuible solo a la semilla de red, útil para dimensionar réplicas en experimentos propios.
- Selección de receta para pick-and-place en SO-101: los datos publicados permiten decidir entre ACT nominal, ACT con apariencia aleatorizada y Diffusion Policy v2 según el renderizador objetivo y el presupuesto de demostraciones (200 frente a 400).
- Auditoría de robustez de renderizadores: el repositorio documenta cómo un fallo de renderizado (dos pads de contacto y un material mal coloreado, con una diferencia de 760 píxeles) movió puntuaciones hasta 26 de 300 episodios; sirve como caso de estudio para validar pipelines de simulación antes de publicar resultados.
- Reproducción de experimentos con LeRobot: los checkpoints en safetensors y las configuraciones YAML referenciadas (`so101_randomized_pick_place.yaml`, `viperx300s_single_cube_randomized_place.yaml`) permiten reproducir las evaluaciones en MuJoCo, Isaac Sim y Newton.
- Base para comparativas de arquitecturas de imitación: ACT, Diffusion Policy v2 y SmolVLA sobre la misma tarea y el mismo experto scriptado permiten comparar arquitecturas con un protocolo de evaluación común.
- Estudio de estrategias de aumento de datos: las variantes con demostraciones en ambos renderizadores (`act_both_renderers_*`) y con solo imágenes de Isaac (`act_isaac_only_*`) permiten analizar el efecto de la fuente visual de las demostraciones en la transferencia.

## Benchmarks y rendimiento

Puntuaciones de la primera parte (17 carpetas, SO-101), éxitos sobre episodios retenidos:

| Carpeta | Receta | MuJoCo (300) | Newton fijo (300) | Newton v1 (300) | Isaac Sim (100) | Isaac pila nueva (100) |
|---|---|---:|---:|---:|---:|---:|
| `act_nominal_unseeded` | ACT, 200 demos MuJoCo, chunk 100, 60k pasos, sin semilla | 294/300 | 251/300 | 268/300 | 58/100 | 56/100 |
| `act_nominal_seed1` | ACT, 200 demos, 60k pasos, semilla 1 | 290/300 | 220/300 | 228/300 | 62/100 | 61/100 |
| `act_nominal_seed2` | ACT, 200 demos, 60k pasos, semilla 2 | 289/300 | 231/300 | 242/300 | 77/100 | 78/100 |
| `act_nominal_seed3` | ACT, 200 demos, 60k pasos, semilla 3 | 290/300 | 257/300 | 258/300 | 65/100 | 72/100 |
| `act_randomized_look_seed0` | ACT, 400 demos apariencia aleatorizada, 120k pasos, semilla 0 | 294/300 | 290/300 | 295/300 | 90/100 | 88/100 |
| `act_randomized_look_seed1` | ACT, 400 demos apariencia aleatorizada, 120k pasos, semilla 1 | 292/300 | 288/300 | 289/300 | 85/100 | 88/100 |
| `act_randomized_look_seed2` | ACT, 400 demos apariencia aleatorizada, 120k pasos, semilla 2 | 292/300 | 289/300 | 289/300 | 89/100 | 91/100 |
| `act_both_renderers_unseeded` | ACT, 200 MuJoCo + 200 en Isaac, 120k pasos, sin semilla | 294/300 | 280/300 | 281/300 | 94/100 | - |
| `act_both_renderers_seed1` | ACT, 200 MuJoCo + 200 en Isaac, 120k pasos, semilla 1 | 294/300 | 279/300 | 286/300 | 91/100 | - |
| `diffusion_policy_v2_nominal_seed0` | Diffusion Policy v2, 200 demos, 100k pasos, semilla 0, 16 de 64 acciones | 290/300 | 11/300 | 14/300 | 21/100 | - |
| `diffusion_policy_v2_randomized_look_seed0` | Diffusion Policy v2, 400 demos apariencia aleatorizada, 120k pasos, semilla 0, 16 de 64 acciones | 298/300 | 32/300 | 18/300 | 49/100 | - |
| `act_isaac_only_100_unseeded` | ACT, 100 demos MuJoCo reproducidas en Isaac, chunk 100, 60k pasos, sin semilla | 229/300 | 88/300 | 109/300 | 85/100 | - |
| `act_isaac_only_200_unseeded` | ACT, 200 demos reproducidas en Isaac, 60k pasos, sin semilla | 229/300 | 91/300 | 105/300 | 91/100 | - |
| `act_isaac_only_200_seed1` | ACT, 200 demos reproducidas en Isaac, 60k pasos, semilla 1 | 193/300 | 112/300 | 105/300 | 90/100 | - |
| `act_isaac_only_400_unseeded` | ACT, 400 demos reproducidas en Isaac, 120k pasos, sin semilla | 253/300 | 140/300 | 154/300 | no disponible en la información | - |

Notas de lectura publicadas por el autor: la columna "Newton (fixed)" usa el renderizador corregido durante la segunda parte; la columna "Newton (v1)" conserva lo que reportó la primera parte como análisis de sensibilidad. Isaac Sim se evaluó con 100 episodios (semillas 1000-1099) salvo donde se necesitaron 300. La primera parte usó Isaac Sim 6.1.0.0 (driver 610.47) y la segunda Isaac Sim 6.2.0.0 (driver 617.42, build de Windows 26300); el desplazamiento medio de las cuatro ejecuciones nominales en la pila nueva es de -0,75 puntos, dentro de la regla de puente de 3 puntos. PhysX no es determinista, por lo que una puntuación de Isaac Sim solo se reproduce dentro del ruido de muestreo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio (16,9 GB) incluye los 45 checkpoints, no el peso de un modelo individual.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: LeRobot (librería declarada); el repositorio no detalla otras opciones de servicio.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisitos de simulación: las evaluaciones requieren MuJoCo, Isaac Sim (versiones 6.1.0.0 y 6.2.0.0 documentadas) y Newton como renderizador; el estudio reporta que PhysX no es determinista.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| `rizgiak/physai-study-01-checkpoints` | ACT, Diffusion Policy v2, SmolVLA | Pick-and-place SO-101 y ViperX 300 S | no aplica | Apache 2.0 | Hugging Face, 45 checkpoints | Hasta 298/300 en MuJoCo; 94/100 en Isaac Sim |
| `act_nominal_*` (mismo repo) | ACT | Pick-and-place SO-101 | no aplica | Apache 2.0 | Incluido en el repo | 289-294/300 en MuJoCo; 58-77/100 en Isaac Sim |
| `diffusion_policy_v2_*` (mismo repo) | Diffusion Policy v2 | Pick-and-place SO-101 | no aplica | Apache 2.0 | Incluido en el repo | 290-298/300 en MuJoCo; 11-32/300 en Newton; 21-49/100 en Isaac Sim |
| `smolvla` fine-tunes (tercera parte) | SmolVLA | Pick-and-place | no disponible | Apache 2.0 (repo) | Incluido en el repo | No disponible en la información |

La comparativa se limita a las recetas incluidas en el propio repositorio, porque la información proporcionada no incluye datos de modelos externos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; el autor sí documenta varianza entre semillas de red como parte del resultado.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la ejecución de acciones incorrectas fuera de la distribución de demostraciones.
- Limitación de tarea: todos los checkpoints están entrenados para una única tarea (cubo rojo sobre almohadilla verde) y no son generalistas.
- Limitación de plataforma: los checkpoints están ligados a SO-101 y ViperX 300 S; no se documenta su uso en otros robots.
- Dependencia del renderizador: el estudio demuestra caídas fuertes al cambiar de renderizador; Diffusion Policy v2 pasa de 290/300 en MuJoCo a 11/300 en Newton (renderizador fijo) y a 21/100 en Isaac Sim.
- Sensibilidad a fallos de renderizado: un fallo del renderizador Newton (dos pads de contacto y un material mal coloreado, 760 píxeles de diferencia) movió puntuaciones hasta 26 de 300 episodios; las puntuaciones de la primera parte deben leerse con esa cautela.
- No determinismo de Isaac Sim: PhysX no es determinista, por lo que las puntuaciones solo se reproducen dentro del ruido de muestreo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la información no detalla condiciones adicionales sobre los datos de demostración ni sobre las dependencias de simulación (MuJoCo, Isaac Sim, Newton), cuyas licencias deben verificarse por separado.
- Idiomas: no aplica; el modelo no procesa lenguaje.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; es material de investigación, no un artefacto de producción validado.

## Enlaces

- Hugging Face: https://huggingface.co/rizgiak/physai-study-01-checkpoints
- Configuración SO-101 referenciada: `research/configs/so101_randomized_pick_place.yaml`
- Configuración ViperX 300 S referenciada: `research/configs/viperx300s_single_cube_randomized_place.yaml`
- LeRobot (librería de entrenamiento y despliegue): no se proporciona enlace en la información disponible
- Paper, blog o repositorio del estudio: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
