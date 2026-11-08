# kenzhengjk/lingbot-va-lb43-s11750

## Resumen

LingBot-VA LB43 (checkpoint step 11750) es un ajuste fino completo del transformer de `robbyant/lingbot-va-base`, un modelo de acción-visión (video-action model) orientado a robótica de manipulación. Lo publica el usuario kenzhengjk como checkpoint intermedio (de un total de 18800 pasos) del entrenamiento `1106_0204_lb43_lbofficial_bs16`, realizado sobre las 43 tareas "vistas" del benchmark RoboTwin 2.0. El modelo combina un transformer de difusión (formato diffusers) con un VAE y un codificador de texto umT5 congelados, heredados sin cambios del modelo base.

El problema que aborda es el aprendizaje de políticas de manipulación robótica a partir de demostraciones, unificando la predicción de fotogramas futuros (world model) con la ejecución de acciones en un marco autorregresivo. Esto permite post-entrenamiento con pocos datos y generalización a configuraciones noveles, según la descripción del proyecto LingBot-VA (presentado en RSS 2026).

Con 5.088.872.670 parámetros totales (unos 5,09 mil millones) y un repositorio de 24,4 GB, es un modelo de escala media diseñado para inferencia en GPUs de centro de datos (el entrenamiento usó 8 x H100 con FSDP2 y bf16). Su relevancia actual radica en que es un checkpoint reproducible y documentado de una receta oficial de ajuste fino sobre un benchmark estándar de robótica, con métricas de evaluación por episodio publicadas junto a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (video-action model autorregresivo) con VAE y codificador de texto umT5; formato diffusers |
| Parametros totales | 5.088.872.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16); transformer de 10,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de `lingbot-va-base`: un transformer de difusión que aprende conjuntamente la predicción de fotogramas futuros y la generación de acciones, con un VAE para la codificación latente de vídeo y un codificador de texto umT5 (ejecutado en CPU durante la evaluación). En este ajuste fino solo se entrena el transformer; el VAE, el codificador de texto y el tokenizador se congelan y se redistribuyen sin cambios desde el modelo base.

El entrenamiento parte de `robbyant/lingbot-va-base` y usa el dataset `lerobot_robotwin_eef_clean_50` (episodios 0-49 de cada una de las 43 tareas vistas, 2150 episodios), re-codificados en latentes y sin demostraciones aleatorizadas. Se emplea la receta oficial de LingBot-VA: AdamW (0.9, 0.95), learning rate 1e-5 constante tras un calentamiento de 10 pasos, weight decay 0.1, grad clip 2.0 y text dropout 0.1. El lote efectivo es 16 (8 x H100, 1 muestra por GPU con acumulación de gradiente 2), en bf16 con FSDP2. Este checkpoint corresponde al paso 11750 (unas 87 épocas, 188000 muestras); la pérdida media entre los pasos 10575 y 11749 fue de 0.141 en vídeo y 0.0011 en acción. El entrenamiento completo llegó a 18800 pasos (140 épocas).

## Capacidades

- Predicción de fotogramas futuros de vídeo (world modeling) y ejecución de acciones de manipulación en un marco autorregresivo conjunto.
- Política de manipulación robótica entrenada sobre 43 tareas de RoboTwin 2.0 (end-effector, datos limpios).
- Post-entrenamiento eficiente en datos: el ajuste usa 2150 episodios de demostración.
- Generalización a configuraciones noveles y tareas no vistas, según la evaluación del checkpoint sobre 6 tareas no usadas en entrenamiento.
- Inferencia standalone o en arquitectura servidor-cliente (según el repositorio oficial), con soporte de ejecución distribuida en GPUs y clústeres.
- Exportación Zero-WAM (metadatos `lb_export.json`, `HMX_SERVER`, `EXPORTED`).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Manipulación robótica de brazo con efector final en tareas de RoboTwin 2.0: el modelo genera secuencias de acciones condicionadas por observación y texto, adecuado para políticas de control en simulación con límites de pasos definidos (por ejemplo, 400-700 acciones según la tarea).
- Post-entrenamiento con pocos datos sobre un robot o tarea concreta: al ser un ajuste fino completo del transformer con VAE y codificador congelados, sirve como punto de partida para adaptar la política a nuevos conjuntos de demostraciones limpias.
- Evaluación comparativa de checkpoints: los archivos `eval/LB43_s11750_episodes.jsonl` y `eval/summary_s11750_vs_s18800.md` permiten reproducir la comparación por episodio (tarea, semilla, éxito, número de acciones) frente al checkpoint final del run.
- Investigación en world models para robótica: la predicción conjunta de vídeo y acción permite estudiar la calidad del modelado del entorno y su relación con el éxito de la política.
- Despliegue en arquitectura servidor-cliente: el repositorio oficial separa el entorno del modelo de la simulación, lo que facilita ejecutar la inferencia en GPUs o clústeres mientras la simulación corre en otro proceso.
- Reproducibilidad de recetas de entrenamiento: `training/launch_info.json` y `training/metrics_to_step_11750.jsonl` documentan configuración, línea de comandos, versiones de código, pérdidas, norma del gradiente, learning rate y memoria por paso, útiles para replicar el ajuste.

## Benchmarks y rendimiento

Evaluación sobre 6 tareas no vistas de RoboTwin 2.0, 50 episodios por tarea (primeras 50 semillas del conjunto P0), con límites de pasos por defecto (stapler 400, cup 500, scale 400, seal 400, bread 700) y 640 para stack_blocks_three. `open_microwave` no se evaluó.

| Checkpoint | stapler | cup | scale | seal | bread | stack | total |
|---|---|---|---|---|---|---|---|
| step 11750 (este modelo) | 27/50 | 27/50 | 7/50 | 8/50 | 25/50 | 0/50 | 94/300 (31,3%) |
| step 18800 (último del run, no incluido en este repo) | 28/50 | 26/50 | 10/50 | 17/50 | 28/50 | 0/50 | 109/300 (36,3%) |

Advertencias sobre la comparabilidad: dos tareas usan los criterios de éxito de Zero-WAM en lugar de los de RoboTwin estándar (`move_stapler_pad` exige contacto con el pad y posición dentro del área con margen de 2,5 cm; `stamp_seal` usa tolerancia de 3 cm en lugar de 1 cm), por lo que sus cifras no son comparables con resultados estándar de RoboTwin. En scale y bread hay un episodio cada una cuyo escenario programado falló la comprobación experta de RoboTwin y se ejecutó con una semilla sustituta (`seed_used`), contando en las tasas. Sobre los 298 episodios con las mismas semillas de escenario, el step 18800 resuelve 15 más (54 frente a 39 episodios discordantes, McNemar p = 0.15). Todos los episodios de `stack_blocks_three` alcanzaron el tope de 640 acciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el transformer en bf16 ocupa 10,2 GB, y hay que sumar el VAE y el codificador de texto umT5, por lo que se requiere holgura adicional más allá de los pesos.
- GPU recomendadas: el entrenamiento usó 8 x H100; para inferencia se espera un entorno de GPU de centro de datos, aunque no se publican requisitos mínimos.
- ¿Cabe en GPU de consumo? no disponible (sin datos de cuantización ni de requisitos mínimos publicados).
- Opciones de despliegue: ejecución standalone o arquitectura servidor-cliente del repositorio `Roboyant/lingbot-va`, con soporte de inferencia distribuida en GPUs y clústeres; exportación Zero-WAM. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VA LB43 step 11750 (este) | 5,09 B | no disponible | 94/300 (31,3%) en 6 tareas no vistas | Apache-2.0 | Hugging Face (kenzhengjk/lingbot-va-lb43-s11750) |
| LingBot-VA base (robbyant/lingbot-va-base) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face (robbyant/lingbot-va-base) |
| LingBot-VA step 18800 (mismo run) | 5,09 B (mismo transformer) | no disponible | 109/300 (36,3%) en las mismas 6 tareas | Apache-2.0 | No incluido en este repositorio |

No se dispone de datos de otros modelos comparables de la misma categoría (políticas video-action para RoboTwin 2.0) en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 11750 de 18800): rinde peor que el checkpoint final del mismo run (94/300 frente a 109/300 en las tareas no vistas), por lo que no es la mejor opción para uso final.
- Entrenado solo con las 43 tareas vistas de RoboTwin 2.0; no se usaron las 7 tareas no vistas. El rendimiento en tareas fuera de esa distribución es limitado (0/50 en `stack_blocks_three`, 7/50 en scale).
- Dos tareas de la evaluación usan criterios de éxito de Zero-WAM distintos de los estándar de RoboTwin, lo que impide comparar directamente sus cifras con resultados públicos de RoboTwin.
- Un episodio en scale y otro en bread se ejecutaron con semillas sustituas tras fallar la comprobación experta del escenario; estas cifras deben interpretarse con cautela.
- Seis episodios del dataset tenían paquetes AV1 no decodificables cerca del final; se decodificaron paquete a paquete y se rellenaron 2 fotogramas en total con el fotograma anterior.
- Los metadatos de exportación Zero-WAM (`lb_export.json`) contienen rutas locales de la máquina de entrenamiento, no portables directamente.
- Sesgos conocidos, riesgo de alucinación y limitaciones de idioma: no disponible (modelo de robótica, no de generación de texto abierto).
- Licencia Apache-2.0: permite uso comercial, pero el VAE, el codificador de texto y el tokenizador se redistribuyen sin cambios desde el modelo base y deben conservarse sus avisos de licencia.
- No se publican requisitos de hardware, latencia ni opciones de cuantización, lo que complica planificar el despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kenzhengjk/lingbot-va-lb43-s11750
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Dataset: https://huggingface.co/datasets/robbyant/robotwin-clean-and-aug-lerobot
- Repositorio oficial LingBot-VA: https://github.com/robbyant/lingbot-va
- Página del proyecto LingBot-VA: https://technology.robbyant.com/lingbot-va
