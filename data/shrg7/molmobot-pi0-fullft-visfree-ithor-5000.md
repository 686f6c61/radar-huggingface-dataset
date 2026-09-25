# shrg7/molmobot-pi0-fullft-visfree-ithor-5000

## Resumen

molmobot-pi0-fullft-visfree-ithor-5000 es un checkpoint de investigacion publicado por el usuario shrg7 en Hugging Face. Se trata de un ajuste fino completo (full fine-tuning) de la politica vision-lenguaje-accion MolmoBot-Pi0-DROID sobre el conjunto de datos de manipulacion simulado iThor-fp13, y corresponde al brazo «visfree» de una ablacion de adaptadores de etapa II: la torre de vision SigLIP se entrena libremente, sin congelacion ni regularizacion L2-SP.

El modelo hereda la arquitectura de la familia MolmoBot de AllenAI, construida sobre el modelo video-lenguaje Molmo2 y ampliada con una cabeza de accion de flow-matching basada en DiT acoplada capa a capa al backbone. Con 3.501.298.424 parametros (~3,5 B) y un repositorio de 7,0 GB, el checkpoint se distribuye como state dict plano de PI0Pytorch en formato safetensors, sin estado del optimizador.

Su relevancia es acotada y estrictamente experimental: se trata de una pieza de ablacion con 0 descargas y 0 «likes» en el momento de redactar esta ficha, orientada a reproducir y comparar variantes de entrenamiento de politicas de manipulacion robotica, no a un uso directo en produccion. El autor reporta una val_action_loss de 0,0062 en el paso final (5000).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA): backbone de video-lenguaje Molmo2 con cabeza de accion de flow-matching basada en DiT acoplada capa a capa, mas torre de vision SigLIP |
| Parametros totales | 3.501.298.424 (~3,5 B) |
| Parametros activos | no aplica (no es MoE, arquitectura densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos sin cuantizar en safetensors) |
| Idiomas soportados | no disponible (politica de accion; no se documenta soporte multilingue de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (state dict plano de PI0Pytorch, `model.safetensors`; sin estado del optimizador) |
| Modelo base | MolmoBot-Pi0-DROID (variante plain, sin adaptador de razonamiento) |
| Configuracion | `molmobot_pi0_droid`, datos de accion `pos_data/ithor-fp13` |
| Tamano del repositorio | 7,0 GB |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno pi0 adoptado por MolmoBot: un backbone video-lenguaje Molmo2 que puede ingerir fotogramas pasados como contexto, al que se acopla capa a capa una cabeza de accion de flow-matching basada en DiT. La torre de vision SigLIP forma parte del modelo y, en esta variante concreta, se entrena sin restricciones (sin freeze y sin regularizacion L2-SP), a diferencia del brazo «plain» de la ablacion.

El entrenamiento se realizo mediante ajuste fino completo sobre datos de manipulacion simulada del entorno iTHOR (`pos_data/ithor-fp13`), con batch de 256 micro x 2 acumulaciones = 512 efectivo, warmup de 1000 pasos seguido de learning rate constante de 5e-5, y un total de 5000 pasos. No se aplico ningun regularizador de vision ni se congelo ningun modulo: torre de vision, LLM, experto de accion y proyecciones eran entrenables. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon etapas de RLHF o DPO.

## Capacidades

- Generacion de trayectorias de accion para manipulacion robotica (politica VLA), no generacion de texto de proposito general.
- Ingesta de fotogramas pasados como contexto gracias al backbone video-lenguaje Molmo2.
- Control por flow-matching continuo mediante la cabeza de accion DiT.
- Aprendizaje conjunto de vision, lenguaje y accion (vision tower totalmente entrenable en este checkpoint).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento, vision o audio adicional: no disponible mas alla de la entrada visual propia del modelo.

## Casos de uso

- Investigacion en ablaciones de politicas VLA: este checkpoint permite comparar el efecto de entrenar libremente la torre de vision frente a variantes con freeze o regularizacion L2-SP, manteniendo identicos datos, batch y schedule.
- Manipulacion robotica en simulacion iTHOR: adecuado para reproducir tareas de manipulacion sobre las mismas escenas y datos (`pos_data/ithor-fp13`) con los que fue ajustado.
- Punto de partida para nuevo ajuste fino: al ser un full fine-tuning sin estado del optimizador, sirve como inicializacion para reentrenar sobre otros datasets de accion con el stack openpi.
- Estudio de transferencia sim-to-real: permite evaluar hasta que punto una politica entrenada en simulacion conserva comportamiento en plataformas reales, dado que la familia MolmoBot reporta transferencia a escenas, objetos y camaras nuevas.
- Analisis de la cabeza de flow-matching: util para estudiar el acoplamiento capa a capa entre el backbone Molmo2 y la cabeza DiT en tareas de control continuo.
- Reproducibilidad de experimentos: al documentar el autor la curva de validacion completa, se puede contrastar la convergencia y la estabilidad del entrenamiento frente a otras variantes de la ablacion.
- Servicio de politicas en investigacion: el repositorio de MolmoBot expone utilidades de serving (parametros `model_dir` y `checkpoints`) que permiten cargar checkpoints alternativos, incluidos los alojados en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni metricas de simulacion tipo success rate) en la informacion disponible. El unico dato de rendimiento aportado es la perdida de validacion de accion (`val_action_loss`) y su curva por pasos:

| Paso | val_action_loss |
|---|---|
| 500 | 0,0110 |
| 1000 | 0,0114 |
| 1500 | 0,0099 |
| 2000 | 0,0089 |
| 2500 | 0,0082 |
| 3000 | 0,0076 |
| 3500 | 0,0069 |
| 4000 | 0,0066 |
| 4500 | 0,0067 |
| 5000 | 0,0062 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, 3,5 B de parametros ocupan aproximadamente 7 GB; con overhead de activaciones y contexto visual conviene prever un margen adicional no especificado en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita; por tamano son razonables A100, H100, L40S o RTX 4090/3090 (24 GB).
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) en precision reducida, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: stack openpi / PI0Pytorch y las utilidades de serving del repositorio `allenai/MolmoBot` (parametros `model_dir` y `checkpoints`, con soporte de fuentes remotas tipo S3 o Hugging Face). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| molmobot-pi0-fullft-visfree-ithor-5000 (este) | 3,5 B | no disponible | val_action_loss 0,0062 (paso 5000) | apache-2.0 | Hugging Face, 0 descargas |
| MolmoBot-Pi0-DROID (modelo base) | no disponible | no disponible | no disponible | no disponible | repositorio `allenai/MolmoBot` |
| molmobot-pi0-toys-reasoninit (variante relacionada) | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| MolmoBot (modelo insignia de la familia) | no disponible | no disponible | no disponible | no disponible | repositorio y web de AllenAI |

No se dispone de datos comparativos de contexto, benchmarks o rendimiento de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 «likes»: no ha sido validado por la comunidad ni sometido a evaluacion externa.
- Entrenado exclusivamente sobre datos de manipulacion simulada de iTHOR (`pos_data/ithor-fp13`), por lo que cabe esperar una brecha sim-to-real no cuantificada en la informacion disponible.
- El unico indicador de calidad publicado es la perdida de validacion de accion; no hay tasas de exito de tarea ni comparaciones con la variante con vision congelada.
- El checkpoint contiene unicamente el state dict plano (`model.safetensors`) y no incluye estado del optimizador, lo que limita reanudar el entrenamiento exactamente desde el paso 5000.
- No se documentan sesgos, comportamiento multilingue ni limites de contexto.
- Riesgo de alucinacion o de acciones fuera de distribucion en escenas, objetos o puntos de vista no cubiertos por el dataset de entrenamiento: no cuantificado.
- Licencia apache-2.0: permite uso comercial, pero al ser un artefacto de investigacion sin evaluacion, su uso en produccion conlleva riesgo tecnico no mitigado por la licencia.
- Conviene verificar la compatibilidad exacta con el stack openpi/PI0Pytorch antes de desplegarlo, ya que la informacion disponible no detalla la version requerida.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/shrg7/molmobot-pi0-fullft-visfree-ithor-5000
- Variante relacionada en Hugging Face: https://huggingface.co/shrg7/molmobot-pi0-toys-reasoninit
- Repositorio de codigo MolmoBot (AllenAI): https://github.com/allenai/MolmoBot
- Directorio MolmoBot-Pi0 dentro del repositorio: https://github.com/allenai/MolmoBot/tree/main/MolmoBot-Pi0
- Web del proyecto MolmoB0T: https://allenai.github.io/MolmoBot/
- Articulo (arXiv): https://arxiv.org/html/2603.16861v1
