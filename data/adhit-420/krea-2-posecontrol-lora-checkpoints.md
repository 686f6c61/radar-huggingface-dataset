# adhit-420/Krea-2-PoseControl-LoRA-checkpoints

## Resumen

Krea-2 Pose Control-LoRA es un adaptador de control de pose para el modelo generativo de imagenes Krea-2 Turbo, desarrollado por el usuario independiente adhit-420. No se trata de un modelo base autonomo, sino de un LoRA de rango 64 combinado con una capa de entrada de control expandida (`ControlInputLayer`) que condiciona la generacion sobre un esqueleto corporal de 17 keypoints en formato COCO. El resultado es un mecanismo de control de pose que no requiere una rama ControlNet paralela, lo que simplifica el grafo de inferencia y reduce el coste computacional adicional.

El problema que resuelve es el control preciso de la geometria corporal en la generacion de imagenes: el prompt de texto define apariencia, vestimenta, entorno y estilo, mientras que el raster de pose fija la colocacion y el encuadre del sujeto. Segun la evaluacion publicada por el autor, el adaptador eleva el PCK@0.10 de 0.1101 (base Turbo) a 0.6043, con una perdida minima de alineacion texto-imagen (CLIP 0.33694 frente a 0.34402 del base).

Es relevante ahora porque Krea-2 Turbo opera con regimenes de pocos pasos (8 pasos, CFG 0), y este adaptador mantiene ese perfil de inferencia rapida anadiendo control estructural. El repositorio es, sin embargo, muy pesado (298.3 GB) porque incluye carpetas de checkpoints historicos de entrenamiento, aunque el artefacto recomendado para uso publico es un unico fichero safetensors de 215.488.512 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64) + capa `ControlInputLayer` expandida sobre Krea-2 Turbo; no es una rama ControlNet paralela |
| Parametros totales | 215.488.512 (artefacto de release `mix-025`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (condicionamiento por prompt de texto; idiomas no declarados) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | krea/Krea-2-Turbo |
| Keypoints de control | 17 (estilo COCO: nariz, ojos, orejas, hombros, codos, munecas, caderas, rodillas, tobillos) |
| Fichero recomendado | `release/krea2-pose-control-mix025.safetensors` |
| SHA-256 | `6d97e9c2e102e07928fc8864346401a0d2e6082d610ca6b037c4704102e3f8d1` |
| Tamano del repo | 298.3 GB (incluye checkpoints historicos de entrenamiento) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Krea-2 Turbo congelado. El mecanismo de control consiste en una `ControlInputLayer` expandida mas un LoRA de rango 64, integrados en el flujo del modelo base en lugar de una rama ControlNet independiente. Esta decision de diseno implica que el coste adicional de inferencia es menor que el de un ControlNet clasico y que no hay que gestionar un segundo UNet/DiT en memoria, a cambio de que el adaptador este acoplado a la arquitectura interna de Krea-2.

El condicionamiento de pose se limita a 17 keypoints corporales: manos, dedos y landmarks faciales quedan fuera de la senal de control. El autor advierte explicitamente que deben usarse rasters de pose generados en el formato entrenado del proyecto, y no asumir que renders OpenPose arbitrarios sean compatibles. El repositorio incluye el dataset PoseBridge, enlazado desde la model card, que constituye la fuente de pares pose-imagen empleada en el entrenamiento.

No se detalla en la informacion disponible el numero de tokens, el volumen de pares de entrenamiento, ni si se aplicaron fases de RLHF/DPO (poco habituales en adaptadores de control). El checkpoint publicado corresponde al candidato `mix-025`, seleccionado frente a otras ejecuciones archivadas en el repositorio.

## Capacidades

- Generacion de imagenes condicionada por pose: fija geometria corporal y encuadre a partir de un raster de 17 keypoints.
- Control desacoplado de atributos: el prompt gobierna apariencia del sujeto, vestimenta, entorno, iluminacion y estilo, mientras la pose gobierna la estructura.
- Inferencia en pocos pasos: valores por defecto de 8 pasos y CFG 0 sobre Krea-2 Turbo.
- Ajuste de adherencia: escala de control 1.0 por defecto, con rango util de 1.25 a 1.50 para mayor sujecion a la pose.
- Inferencia con preservacion de aspect ratio nativo, que segun la evaluacion del autor supera a dynamic-768 en adherencia de pose.
- Soporte de multiples sujetos, con limitaciones en poses solapadas.
- Integracion con ComfyUI mediante workflow publicado en el repositorio GitHub.
- No soporta control de manos, dedos ni pose facial.
- No disponible: tool calling, capacidades de agente, audio, video o modo thinking (fuera del ambito de un modelo de difusion de imagen).

## Casos de uso

- Previsualizacion de poses para ilustracion y concept art: el ilustrador dibuja o extrae un esqueleto de 17 keypoints y el modelo genera una imagen coherente con ese encuadre, usando el prompt para definir personaje y ambientacion; la ventaja es que la composicion se corrige sin reescribir el prompt.
- Storyboarding y planificacion de planos: se fija la posicion de los personajes en cada plano mediante keypoints y se mantiene consistencia de encuadre entre viñetas, con prompts que describen vestuario y escenario.
- Generacion de assets para animacion y referencia de rotoscopia: se producen fotogramas clave con geometria corporal controlada que sirven como referencia para equipos de animacion 2D o 3D.
- Fotografia de producto con figura humana: control de la postura del modelo en campanas de moda o e-commerce, manteniendo la pose fija entre variaciones de vestuario generadas por prompt.
- Iteracion rapida en pipelines creativos con ComfyUI: al no requerir una rama ControlNet paralela, el grafo es mas ligero y permite encadenar el adaptador con otros nodos de posprocesado o upscaling en flujos de produccion.
- Control de encuadre en generacion por lotes: para catalogos o series de imagenes donde la colocacion del sujeto debe ser homogenea y solo varia el contenido descriptivo del prompt.
- Investigacion en control estructural de modelos de difusion: el par (LoRA rango 64 + `ControlInputLayer`) y las metricas PCK publicadas sirven como referencia para comparar estrategias de condicionamiento frente a ControlNet clasico.

## Benchmarks y rendimiento

Evaluacion publicada por el autor en la model card (PCK sobre keypoints y similitud CLIP):

| Modelo | PCK@0.05 | PCK@0.10 | PCK@0.20 | CLIP |
|---|---:|---:|---:|---:|
| Turbo base | 0.0356 | 0.1101 | 0.3387 | 0.34402 |
| mix-025 (release) | 0.4521 | 0.6043 | 0.7241 | 0.33694 |

El adaptador multiplica por mas de cinco el PCK@0.10 respecto al base (0.1101 a 0.6043) con una caida de CLIP de 0.00708 puntos absolutos. No se han publicado en la informacion disponible comparaciones contra otros adaptadores de pose para Krea-2 ni curvas de throughput o latencia.

## Requisitos de hardware

- El adaptador anade 215.488.512 parametros al modelo base; en precision de 16 bits supone aproximadamente 0,4 GB adicionales de pesos, mas la capa de control expandida.
- El requisito dominante es el modelo base Krea-2 Turbo, cuyas necesidades de VRAM no se detallan en la informacion disponible.
- No cabe en GPU de consumo por si solo: el adaptador requiere siempre el checkpoint base cargado, por lo que la VRAM efectiva es la del base mas el overhead del LoRA y de la capa de control.
- GPU recomendadas: no disponibles en la informacion proporcionada; el repositorio no publica tabla de compatibilidad por GPU.
- Despliegue: script `inference.py` del repositorio GitHub (con `PYTHONPATH=.` y flags `--turbo-ckpt`, `--release-artifact`, `--prompt`, `--pose-image`, `--output`, `--seed`) y workflow de ComfyUI publicado en `comfyui/`.
- Tipos de cuantizacion soportados: no disponible.
- Latencia y throughput: no disponibles; los 8 pasos con CFG 0 del perfil por defecto apuntan a un regimen de inferencia corta, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2 Pose Control-LoRA (mix-025) | LoRA + capa de control sobre Krea-2 Turbo | 215.488.512 | 17 keypoints COCO | MIT | Hugging Face + GitHub + ComfyUI |
| Krea-2 Turbo (base) | Modelo generativo de imagen | no disponible | Sin control de pose (PCK@0.10 0.1101) | no disponible | Referenciado como `krea/Krea-2-Turbo` |
| ControlNet clasico para modelos de difusion | Rama paralela de control | no disponible | Pose, depth, canny, etc. | variable segun implementacion | Amplia, ecosistema establecido |
| Adaptadores de pose especificos para otros modelos base | LoRA/ControlNet | no disponible | Keypoints | variable | no disponible |

No se dispone de datos publicados que comparen este adaptador con alternativas equivalentes para Krea-2, ni de mediciones cruzadas con ControlNets de otros modelos base bajo el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Las poses de varias personas con solapamiento son mas dificiles de resolver correctamente.
- Manos, dedos y pose facial no estan bajo control directo: la senal se limita a 17 keypoints corporales.
- Prompts que contradicen la pose, el encuadre o el numero de sujetos suministrados reducen la adherencia a la pose.
- Los rasters de pose deben generarse en el formato entrenado del proyecto; renders OpenPose arbitrarios pueden no ser compatibles.
- El repositorio pesa 298.3 GB e incluye checkpoints historicos de entrenamiento; para uso en produccion debe descargarse unicamente `release/krea2-pose-control-mix025.safetensors` y verificar su SHA-256.
- Riesgo de alucinacion: como modelo generativo de imagen, puede producir anatomia inconsistente en zonas no restringidas por los keypoints (extremidades, manos, rostro).
- Sesgos: no se documentan evaluaciones de sesgo demografico, de representacion corporal ni de estilos; el comportamiento fuera de la distribucion de PoseBridge es incierto.
- Licencia MIT declarada para el adaptador, pero el uso comercial depende tambien de los terminos del modelo base Krea-2 Turbo, que no se detallan en la informacion disponible.
- No hay datos publicados de cuantizacion, latencia ni compatibilidad verificada con GPUs de consumo; el adaptador esta acoplado a la implementacion interna de Krea-2, por lo que cambios en el base pueden romper la integracion.
- Repositorio con 0 descargas y 5 likes en el momento de la consulta: ecosistema de validacion muy reducido y sin replicacion independiente de las metricas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/adhit-420/Krea-2-PoseControl-LoRA-checkpoints
- Repositorio GitHub: https://github.com/s-adhit/krea2-pose-controlnet
- Workflow ComfyUI: https://github.com/s-adhit/krea2-pose-controlnet/tree/main/comfyui
- Blog del autor: https://s-adhit.github.io/blog/training-a-pose-control-lora-for-krea-2/
- Guia de prompting: https://github.com/s-adhit/krea2-pose-controlnet/blob/main/prompting.md
- Decision de release: https://github.com/s-adhit/krea2-pose-controlnet/blob/main/docs/evaluation/release/FINAL_RELEASE_DECISION.md
- Dataset PoseBridge: https://huggingface.co/datasets/adhit-420/PoseBridge
- Krea-2 (modelo base): https://github.com/krea-ai/krea-2
- DOI: 10.57967/hf/10506
