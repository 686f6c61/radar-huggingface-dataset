# gargrohin/flux3-action-robotwin-aloha-mix500

## Resumen

FLUX 3 Action es un modelo de política robótica (vision-language-action, VLA) desarrollado por Black Forest Labs como modelo base, y esta ficha corresponde a un fine-tuning comunitario realizado por el usuario gargrohin. El checkpoint ha sido ajustado sobre las 50 tareas de RoboTwin 2.0 para el robot bimanual `aloha_agilex`, y predice posiciones absolutas de 14 articulaciones (7 por brazo, incluyendo pinzas) a partir de tres cámaras y una instrucción de tarea en lenguaje natural. El modelo base es un transformer de difusión (DiT) con cabezas de acción, derivado de la familia FLUX, con 6.947.132.672 parámetros en bf16.

La relevancia de este checkpoint es que constituye, según su autor, el mejor resultado de la familia FLUX 3 Action sobre el benchmark RoboTwin 2.0, alcanzando un 79,3 % de éxito en escenarios aleatorizados (1.015 escenas) y un 79,2 % en escenarios limpios (499 escenas), medido con el script de evaluación oficial de RoboTwin. Supera claramente a GR00T N1.7 (45,3 % / 45,5 %) en la misma partición de escenas, aunque queda por debajo de Cosmos3-Nano (87,1 % / 88,4 %) entrenado con los mismos datos mix500.

El modelo se distribuye únicamente como pesos del DiT y las cabezas de acción; el VAE de vídeo y el codificador de texto congelados no se incluyen y deben obtenerse del repositorio base con acceso restringido. La licencia es la FLUX Kommunity License, de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con cabezas de accion, derivado de FLUX 3 Action |
| Parametros totales | 6.947.132.672 (6,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | safetensors (bf16), con `config.json` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `black-forest-labs/flux-3-action-base`, un modelo de difusión para predicción de acciones robóticas. La arquitectura combina un trunk DiT con cabezas de acción que generan chunks de 32 acciones a 15 fps, condicionadas por tres cámaras (cabeza, muñeca izquierda y muñeca derecha) y la instrucción de tarea. La disposición de cámaras empleada es `droid_native_head` (parche 0005), con la cámara de cabeza a resolución nativa 240 × 320 en la fila superior, las dos cámaras de muñeca debajo y un lienzo de 448 × 640.

El entrenamiento se realizó sobre el dataset mix500 de RoboTwin 2.0: por cada una de las 50 tareas, 50 demostraciones limpias y 495 aleatorizadas, lo que suma 27.250 episodios y 6,0 millones de fotogramas (se reservaron 5 demos aleatorizadas por tarea para validación). Se aplicó el schedule de DROID de BFL escalado a 9.000 actualizaciones: trunk congelado durante 300 updates, warm-ups de 600 (trunk) y 300 (cabezas), learning rate constante hasta 7.500 y decaimiento lineal hasta 9.000. Los learning rates pico fueron 1,92e-4 (trunk) y 9,6e-4 (cabezas), con AdamW (0,9, 0,99), weight decay 0,05, sin recorte de gradiente, peso de pérdida de acción 50 y batch 512. Los pesos publicados son la EMA (tasa 0,10) en el update 6.750, en bf16, antes del decaimiento.

## Capacidades

- Predicción de acciones motoras: genera 32 posiciones absolutas de articulaciones por llamada (14 dimensiones: 7 por brazo, incluyendo pinzas).
- Control bimanual: diseñado específicamente para el robot dual `aloha_agilex` de RoboTwin 2.0.
- Percepción multi-cámara: consume tres vistas simultáneas (cabeza y dos muñecas) en un lienzo de 448 × 640.
- Condicionamiento por lenguaje: ejecuta tareas guiadas por instrucción textual, con robustez ante redacciones no vistas (evaluado en escenarios aleatorizados).
- Generalización visual: entrenado con fondos, iluminación, altura de mesa y clutter aleatorizados.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni modalidad de audio; no es un modelo de lenguaje general.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo actúa como política de control para el robot `aloha_agilex` en las 50 tareas de RoboTwin 2.0, ejecutando chunks de 32 acciones a 15 fps con inferencia UniPC de 4 pasos.
- Investigación en VLA: sirve como referencia reproducible para comparar estrategias de fine-tuning (mix200 frente a mix500, distintos checkpoints) sobre la misma partición de escenas que GR00T N1.7.
- Evaluación comparativa de modelos: al emplear los mismos seeds de evaluación y el script oficial de RoboTwin, permite comparaciones controladas con Cosmos3-Nano y GR00T N1.7.
- Prototipado de políticas robóticas: la API `FluxActionPolicy.from_pretrained` con observaciones `images.high`, `images.left_wrist`, `images.right_wrist` y `state` de 14 articulaciones facilita la integración en pipelines de experimentación.
- Estudio de robustez ante instrucciones: los escenarios aleatorizados incluyen redacciones no vistas, lo que lo hace útil para analizar la sensibilidad al lenguaje en políticas robóticas.
- Reproducción de experimentos: el repositorio de código incluye parches, scripts de evaluación (`flux3/eval.sh`) y el adaptador XPolicyLab para replicar los resultados en RoboTwin.

## Benchmarks y rendimiento

Resultados sobre las 50 tareas de RoboTwin 2.0, evaluados con el script oficial y sobre las mismas escenas que GR00T N1.7:

| Modelo | Datos de entrenamiento | Aleatorizado (1.015 escenas) | Limpio (499 escenas) |
|---|---|---|---|
| Este modelo (FLUX 3 Action, update 6.750) | mix500 | 79,3 % | 79,2 % |
| Cosmos3-Nano, iteración 6.000 | mix500 | 87,1 % | 88,4 % |
| FLUX 3 Action, update 9.000 | mix200 | 75,6 % | 77,8 % |
| GR00T N1.7 | mix200 | 45,3 % | 45,5 % |

Evolución de checkpoints de la misma ejecución (aleatorizado / limpio):

| Update | Aleatorizado | Limpio |
|---|---|---|
| 2.250 | 67,0 % | 69,9 % |
| 4.500 | 78,1 % | 77,0 % |
| 6.750 (publicado) | 79,3 % | 79,2 % |
| 9.000 | 77,3 % | 79,2 % |

El autor indica que las diferencias a partir del update 4.500 están dentro del ruido en pruebas pareadas por escena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,9B parámetros en bf16, los pesos ocupan aproximadamente 13,9 GB, por lo que se necesita margen adicional para el VAE de vídeo, el codificador de texto y las activaciones.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs de 24 GB o más (RTX 4090, A100, H100) siempre que el VAE y el codificador de texto se carguen en paralelo.
- Cabe en GPU de consumo: probable en RTX 4090 (24 GB) con los pesos en bf16, aunque no está confirmado por el autor.
- Opciones de despliegue: `flux_action.policy.FluxActionPolicy` con `device="cuda"`, aplicando los parches de `patches/flux-action/*.patch` sobre BFL flux-action en el commit `89ad4b6`. Para RoboTwin, adaptador XPolicyLab y `flux3/eval.sh`.
- Latencia y throughput: no disponibles. La inferencia usa UniPC con 4 pasos, shift 5.0, guidance 4.0 en vídeo y 1.0 en acciones, ejecutando las 32 acciones por llamada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (aleatorizado / limpio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FLUX 3 Action mix500) | 6,9B | no disponible | 79,3 % / 79,2 % | FLUX Kommunity (no comercial) | Hugging Face, requiere repo base restringido |
| Cosmos3-Nano (mix500) | no disponible | no disponible | 87,1 % / 88,4 % | no disponible | Hugging Face (gargrohin) |
| FLUX 3 Action mix200 | 6,9B | no disponible | 75,6 % / 77,8 % | FLUX Kommunity (no comercial) | Hugging Face (gargrohin) |
| GR00T N1.7 | no disponible | no disponible | 45,3 % / 45,5 % | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia FLUX Kommunity: uso exclusivamente no comercial. No es un producto oficial de Black Forest Labs ni está respaldado por la empresa.
- Específico de un robot y un benchmark: entrenado solo para `aloha_agilex` en las 50 tareas de RoboTwin 2.0; no se garantiza su transferencia a otros robots, tareas o entornos reales.
- Dependencia de repositorio restringido: el VAE de vídeo y el codificador de texto no se incluyen y deben obtenerse del repo `black-forest-labs/flux-3-action-base` (revisión `99bc185b`), que requiere acceso aprobado.
- Dependencia de parches: la carga exige aplicar los parches del repositorio de código sobre una versión concreta de flux-action; cambios en esa base pueden romper la compatibilidad.
- Riesgo de sobreajuste al simulador: los resultados proceden de RoboTwin 2.0 (simulación); no hay datos de evaluación en hardware físico.
- Idiomas: no se especifican idiomas soportados para las instrucciones; la robustez ante redacciones no vistas se ha medido solo en el conjunto de evaluación del benchmark.
- Sin datos de sesgos ni de alucinación: al no ser un modelo generativo de texto, estas categorías no aplican directamente, pero no hay análisis de fallos publicado más allá de las tasas de éxito por tarea.
- Advertencia de producción: las diferencias entre checkpoints posteriores al update 4.500 están dentro del ruido; la selección del checkpoint publicado (6.750) no implica una ventaja estadísticamente significativa frente al de 9.000.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gargrohin/flux3-action-robotwin-aloha-mix500
- Repositorio de código (entrenamiento, evaluación y análisis): https://github.com/gargrohin/robotwin-posttrain
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Código oficial flux-action de Black Forest Labs: https://github.com/black-forest-labs/flux-action
- Checkpoint comparativo Cosmos3-Nano: https://huggingface.co/gargrohin/cosmos3-nano-robotwin-aloha-mix500
- Checkpoint comparativo FLUX 3 Action mix200: https://huggingface.co/gargrohin/flux3-action-robotwin-aloha-mix200
