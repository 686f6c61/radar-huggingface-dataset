# riccardofeingold/Mask2Real-WM

## Resumen

Mask2Real-WM es un modelo del mundo de vídeo condicionado por acciones para manipulacion diestra. Lo desarrollan Riccardo O. Feingold, Davide Liconti, Chenyu Yang y Robert K. Katzschmann, y se publica como checkpoints del articulo *Mask2Real-WM: Controllable Dexterous World Models via Segmentation Masks as a Sim-to-Real Bridge*. El modelo trabaja con una mano ORCA sobre un brazo Franka, visto desde una camara lateral y una camara de muneca, y predice video futuro a partir de acciones de 23 dimensiones.

La innovacion principal es separar la prediccion de pixeles en dos etapas: WM1 predice un video futuro de mascaras de segmentacion a partir de fotogramas pasados y acciones, y WM2 renderiza el video RGB condicionado por esas mascaras y las acciones. WM2 se construye sobre Stable Video Diffusion con una rama ControlNet y LoRA en el UNet. Los baselines monoliticos, Mono-R y Mono-SR, predicen RGB directamente.

El modelo esta pensado como puente sim-to-real: WM1 puede preentrenarse en simulacion con mas de 50 h y ajustarse con LoRA sobre menos de 2,5 h de datos reales. Todos los checkpoints operan a 135x240 y 5 fps, con dos vistas, 23 dimensiones de accion, 5 fotogramas de historial y 5 fotogramas de prediccion por paso. El repositorio ocupa 77,2 GB y cada checkpoint principal pesa 9,3 GB en fp32, salvo `wm2`, que pesa 12,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo de video en dos etapas: WM1 predice mascaras de segmentacion futuras; WM2 renderiza RGB con ControlNet sobre Stable Video Diffusion. Incluye UNet, VAE, image encoder, text encoder, action encoder y, en `wm2`, rama ControlNet |
| Parametros totales | no disponible; los checkpoints en fp32 ocupan 9,3 GB (12,0 GB para `wm2`) e incluyen UNet, VAE, image encoder, text encoder, action encoder y ControlNet en `wm2` |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica como contexto de lenguaje; 5 fotogramas de historial y 5 fotogramas de prediccion por paso, a 135x240 y 5 fps, con 2 vistas de camara |
| Tipos de cuantizacion | no disponible; los checkpoints publicados usan fp32 (32-bit floats) |
| Idiomas soportados | no disponibles; el condicionamiento textual usa el text encoder de CLIP ViT-B/32 |
| Licencia | Stability AI Community License (`license: other`, `license_name: stabilityai-ai-community`) |
| Formato de pesos | safetensors (fp32); incluye `model.safetensors.sha256`, `stat.json` y `resolved_config.yaml` |
| Modelo base | `stabilityai/stable-video-diffusion-img2vid` |
| Pipeline | robotics |
| Tamano del repositorio | 77,2 GB |
| Checkpoints | `wm1_cascade_r`, `wm1_cascade_s`, `wm1_cascade_sr`, `wm2`, `mono_r`, `mono_s_base`, `mono_sr_57500`, `mono_sr_58000` |
| Dimension de acciones | 23 |
| Vistas | 2 (camara lateral y camara de muneca) |
| Resolucion y fps | 135x240 por vista, 5 fps |
| Fotogramas | 5 de historial y 5 de prediccion por paso |
| LoRA | rank 16 en checkpoints Cascade-SR, WM2 y Mono-SR |
| Datos de entrenamiento | mas de 50 h de simulacion; menos de 2,5 h de datos reales |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

Mask2Real-WM es un modelo de video condicionado por acciones que desacopla dinamica y renderizado. La etapa WM1 funciona como modelo de dinamica: recibe fotogramas o mascaras pasadas y una secuencia de acciones de 23 grados de libertad, y predice un video futuro de mascaras de segmentacion. La etapa WM2 recibe esas mascaras y las acciones, y genera el video RGB. WM2 se implementa sobre Stable Video Diffusion con una rama ControlNet y LoRA de rango 16 en el UNet, y usa el text encoder de CLIP ViT-B/32. Los baselines monoliticos Mono-R y Mono-SR predicen RGB directamente, sin etapa intermedia de mascaras.

El entrenamiento combina simulacion y datos reales. `wm1_cascade_s` se entrena solo en simulacion durante 55.000 pasos; `wm1_cascade_r` se entrena solo con datos reales durante 15.000 pasos; `wm1_cascade_sr` parte de `wm1_cascade_s` y se ajusta con LoRA de rango 16 sobre datos reales durante 45.000 pasos. `wm2` se entrena sobre datos reales con rama ControlNet y LoRA en el UNet durante 70.000 pasos, y usa estadisticas de accion de simulacion. `mono_r` se entrena solo con datos reales durante 22.000 pasos; `mono_s_base` se entrena solo en simulacion durante 55.000 pasos; `mono_sr_57500` y `mono_sr_58000` parten de `mono_s_base` y se ajustan con LoRA de rango 16 sobre datos reales. No se documentan en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Prediccion de video futuro condicionada por acciones de 23 dimensiones.
- Prediccion de video de mascaras de segmentacion mediante WM1.
- Renderizado RGB fotorrealista y condicionado por texto mediante WM2, con ControlNet sobre Stable Video Diffusion.
- Soporte de dos vistas de camara: lateral y de muneca.
- Operacion a 135x240 y 5 fps, con 5 fotogramas de historial y 5 fotogramas de prediccion por paso.
- Transferencia sim-to-real: preentrenamiento en simulacion y ajuste posterior con LoRA de rango 16 en datos reales.
- Controlabilidad mediante secuencias de acciones, evaluada con estudios de sine-sweep y comparaciones frente a baselines monoliticos.
- No se documentan tool calling, function calling, soporte de agentes, audio ni generacion de texto general.
- No se documenta un modo thinking.
- El soporte multilingue no esta detallado; el unico condicionamiento textual conocido es mediante CLIP ViT-B/32.

## Casos de uso

- Evaluacion de politicas de manipulacion diestra: el modelo permite predecir las consecuencias de secuencias de acciones de 23 DoF antes de ejecutarlas en el robot, reduciendo el numero de interacciones fisicas necesarias.
- Planificacion basada en modelo: se pueden generar rollouts de 5 fotogramas por paso a 5 fps y dos vistas para puntuar acciones candidatas y seleccionar la mejor secuencia antes de actuar.
- Aumento de datos para aprendizaje por imitacion: partiendo de menos de 2,5 h de datos reales, el modelo puede generar videos RGB adicionales condicionados por mascaras y acciones, ampliando la cobertura de estados y trayectorias.
- Sim-to-real con mascaras de segmentacion: el flujo Cascade-S preentrena WM1 en mas de 50 h de simulacion y Cascade-SR lo ajusta con LoRA en datos reales, usando el espacio de mascaras como puente entre dominios.
- Generacion de datos etiquetados de segmentacion: WM1 produce videos de mascaras futuras, utiles para entrenar o evaluar modelos de vision y segmentacion sin etiquetado manual adicional.
- Pruebas de controlabilidad: los checkpoints `mono_r` y `mono_sr_57500` se usan en evaluaciones de controlabilidad y en el estudio de sine-sweep para medir la respuesta del modelo a acciones sinusoidales.
- Creacion de datasets sinteticos con prompts de texto: WM2 puede renderizar RGB condicionado por mascaras y texto mediante ControlNet y CLIP, lo que permite variar apariencia visual en datos sinteticos.
- Analisis de sensibilidad a acciones fuera de distribucion: al ser un modelo condicionado por acciones, permite estudiar como cambia la prediccion ante secuencias no vistas durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda mencionan evaluaciones de controlabilidad, tablas de fidelidad de video y un estudio de sine-sweep, pero no incluyen cifras numericas en el material proporcionado.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 77,2 GB; cada checkpoint principal pesa 9,3 GB en fp32 y `wm2` pesa 12,0 GB.
- VRAM estimada: no disponible de forma oficial. Solo los pesos en fp32 requieren al menos 9,3 GB o 12,0 GB, a lo que hay que sumar activaciones del UNet, VAE, image encoder, text encoder, action encoder y, cuando corresponda, ControlNet, ademas de la decodificacion de video.
- GPU recomendadas: no se documentan modelos concretos de GPU en la informacion disponible.
- GPU de consumo: no se confirma que el modelo quepa en GPU de consumo. El tamano de los pesos en fp32 y la ausencia de cuantizaciones publicadas hacen que la VRAM real dependa del backend y de la configuracion de inferencia.
- Opciones de despliegue: el modelo se ejecuta con el codigo PyTorch del repositorio `srl-ethz/Mask2Real-WM`, sobre pesos de Stable Video Diffusion y CLIP descargados desde Hugging Face Hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Dependen de la GPU, del backend y de la configuracion de inferencia para 135x240, 5 fps, dos vistas, 5 fotogramas de historial y 5 de prediccion.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrenamiento | Paso de entrenamiento | Estadisticas de accion | Licencia |
|---|---|---|---|---|---|
| Mask2Real-WM Cascade-R | Dos etapas: WM1 de mascaras + WM2 RGB | WM1 con datos reales; WM2 con datos reales, ControlNet y LoRA en UNet | WM1 15.000; WM2 70.000 | WM2 simulacion; WM1 real | Stability AI Community License |
| Mask2Real-WM Cascade-S | Dos etapas: WM1 de mascaras + WM2 RGB | WM1 solo simulacion; WM2 con datos reales | WM1 55.000; WM2 70.000 | simulacion | Stability AI Community License |
| Mask2Real-WM Cascade-SR | Dos etapas con ajuste LoRA | WM1 simulado y luego LoRA rank 16 en real; WM2 real | WM1 45.000 en etapa LoRA; WM2 70.000 | simulacion | Stability AI Community License |
| Mono-R | Monolitico: predice RGB directamente | Solo datos reales | 22.000 | real | Stability AI Community License |
| Mono-SR | Monolitico con ajuste LoRA | Simulacion y luego LoRA rank 16 en real | 57.500 y 58.000 | real | Stability AI Community License |
| Stable Video Diffusion img2vid | Difusion imagen-a-video | no disponible | no disponible | no aplica | Stability AI Community License |
| Ctrl-World | Base de codigo referenciada por los autores | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada. La comparacion se limita a enfoque, datos de entrenamiento, pasos, estadisticas de accion y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible.
- Riesgo de alucinacion visual y fisica: como modelo generativo de video, puede producir predicciones plausibles pero fisicamente incorrectas, especialmente ante acciones o configuraciones fuera de distribucion.
- Limitaciones de contexto: no es un modelo de lenguaje; trabaja con 5 fotogramas de historial y 5 de prediccion por paso, a 135x240 y 5 fps, con dos vistas fijas.
- Limitaciones de idioma: no se documentan idiomas soportados; el condicionamiento textual se realiza mediante CLIP ViT-B/32.
- Restricciones de licencia: los pesos son obras derivadas de Stable Video Diffusion Image-to-Video y se distribuyen bajo la Stability AI Community License. El uso comercial queda sujeto a esa licencia y a la aceptacion de la licencia de Stable Video Diffusion. El codigo se publica aparte bajo licencia MIT, y CLIP ViT-B/32 se usa bajo licencia MIT.
- Dependencia del setup robotico: el modelo esta entrenado para una mano ORCA sobre un brazo Franka, con camara lateral y camara de muneca, acciones de 23 dimensiones y las caracteristicas de la camara indicadas.
- Dependencia de estadisticas de accion: es necesario pasar el archivo `stat.json` correcto en inferencia; varios modelos usan estadisticas de simulacion y no las del conjunto de evaluacion.
- Ausencia de benchmarks publicos: no hay cifras de MMLU, HumanEval, GSM8K ni equivalentes en la informacion disponible, ya que no es un modelo de lenguaje.
- Uso en produccion: no se recomienda emplearlo para control real de robot sin validacion adicional, limites de seguridad y comprobacion de que la distribucion de acciones y el setup fisico coinciden con los del entrenamiento.
- Tamano y formato: los checkpoints se publican en fp32, sin cuantizaciones, y el repositorio completo ocupa 77,2 GB.

## Enlaces

- HuggingFace: https://huggingface.co/riccardofeingold/Mask2Real-WM
- Paper en arXiv: https://arxiv.org/abs/2607.04546
- Paper en HTML: https://arxiv.org/html/2607.04546
- Codigo, configuraciones y evaluacion: https://github.com/srl-ethz/Mask2Real-WM
- Repositorio alternativo del autor: https://github.com/riccardofeingold/Mask2Real-WM/tree/master
- Pagina del proyecto: https://srl-ethz.github.io/Mask2Real-WM/
- Modelo base: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid
- Ctrl-World, base de codigo referenciada: https://github.com/Robert-gyj/Ctrl-World
- Pagina del autor: https://riccardofeingold.github.io/
- Licencia en HuggingFace: https://huggingface.co/riccardofeingold/Mask2Real-WM/blob/main/LICENSE.md
- Aviso NOTICE: https://huggingface.co/riccardofeingold/Mask2Real-WM/blob/main/NOTICE
