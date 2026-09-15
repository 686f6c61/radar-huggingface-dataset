# JennyWWW/dryrun_r84_ds

## Resumen

`JennyWWW/dryrun_r84_ds` es una política de control visuomotor entrenada con LeRobot y publicada en HuggingFace Hub por el usuario JennyWWW. Se trata de una implementación de **Diffusion Policy** (Chi et al., 2023, arXiv:2303.04137), un método que plantea el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción, el modelo genera una trayectoria de acciones multi-paso mediante denoising iterativo, lo que produce movimientos suaves y mejora el rendimiento en tareas de manipulación con contacto rico.

El modelo consume dos cámaras RGB de 84x84 píxeles (una en la base y otra en la muñeca del robot) junto con un vector de estado de 7 dimensiones, y devuelve un vector de acción de 7 dimensiones (típicamente 6 grados de libertad de brazo más pinza). Está asociado al robot `lerobot_splatsim` y al dataset `JennyWWW/splatsim_approach_lever_13_smooth_r84`, con 536 episodios y 148.919 fotogramas a 30 FPS.

Es relevante ahora por dos motivos. Primero, muestra el flujo estándar de publicación de políticas de imitación en LeRobot (formato safetensors, integración con `lerobot-rollout` y `lerobot-train`). Segundo, y de forma crítica, su propio nombre lo delata: es un **dry run**. La configuración de entrenamiento registra únicamente **3 pasos** con batch size 4, por lo que los pesos publicados no corresponden a una política funcional, sino a un artefacto de prueba de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión sobre acciones); encoder visual + predictor de ruido. Detalle exacto de capas no disponible en la model card |
| Parametros totales | 40.653.291 (~40,65 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: no es un modelo de lenguaje; el horizonte de observacion y el horizonte de accion dependen de la configuracion de entrenamiento, no especificada |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documenta precision ni esquemas de cuantizacion) |
| Idiomas soportados | no aplica (politica visuomotora; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `lerobot_splatsim` |
| Camaras | `base_rgb_letterbox`, `base_rgb_stretch`, `wrist_rgb_letterbox`, `wrist_rgb_stretch` |
| Entradas | `observation.images.base_rgb` (3, 84, 84), `observation.images.wrist_rgb` (3, 84, 84), `observation.state` (7,) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot (version 0.4.3 durante el entrenamiento) |

## Arquitectura y entrenamiento

Diffusion Policy modela la distribución de acciones futuras como un proceso de difusión condicionado por observaciones visuales y propioceptivas. En inferencia, el modelo parte de ruido gaussiano y lo refina durante varios pasos de denoising hasta obtener una secuencia de acciones coherente, que se ejecuta después mediante control de horizonte recedente (receding horizon control): se predice un bloque de acciones y solo se ejecutan las primeras, replanificando con la siguiente observación. Esto es lo que aporta la suavidad de trayectoria que caracteriza al método frente a políticas de regresión directa como ACT.

La model card no desglosa la arquitectura interna (tipo de backbone visual, dimensiones del U-Net 1D de difusión, número de pasos de entrenamiento de difusión ni scheduler). Con 40,65 M de parámetros totales, el conjunto encoder + predictor de ruido es compacto y apto para inferencia en tiempo real. La configuración de entrenamiento declarada es: 3 pasos, batch size 4, optimizador Adam, learning rate 1e-5, semilla 0 y LeRobot 0.4.3. No se documenta ningún proceso de RLHF, DPO ni ajuste posterior; es aprendizaje por imitación puro sobre demostraciones.

El dato clave es que **3 pasos de entrenamiento no permiten converger**: los pesos son, en la práctica, una inicialización. El repositorio funciona como validación de que el pipeline de entrenamiento y publicación de LeRobot ejecuta correctamente de principio a fin (de ahí "dryrun"), no como una política utilizable.

## Capacidades

- Generacion de trayectorias de accion multi-paso suaves mediante difusion, en lugar de una accion unica por paso de inferencia.
- Control visuomotor a partir de dos vistas RGB (camara de base y camara de muneca) de 84x84 píxeles.
- Fusion de observacion visual y estado propioceptivo de 7 dimensiones.
- Salida de accion de 7 dimensiones (brazo de 6 GDL mas pinza, segun la convencion habitual en LeRobot).
- Entrenamiento e inferencia dentro del ecosistema LeRobot (`lerobot-train`, `lerobot-rollout`).
- Soporte de despliegue en simulacion y en robot real del tipo `lerobot_splatsim`.
- No dispone de: tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues, vision general (VQA, deteccion, OCR), audio ni modo "thinking". No es un modelo de lenguaje ni un VLM.

## Casos de uso

- Manipulacion con contacto rico: el escenario nativo del metodo (el dataset se llama `approach_lever`, es decir, aproximacion y accionamiento de una palanca). Diffusion Policy esta disenada precisamente para tareas donde la politica debe mantener contacto fisico sostenido, donde los metodos de regresion tienden a oscilar.
- Validacion de pipeline de entrenamiento: este checkpoint concreto sirve para comprobar que la instalacion de LeRobot, la lectura del dataset, el guardado de safetensors y la subida al Hub funcionan antes de lanzar un entrenamiento largo y costoso.
- Verificacion de integracion hardware/software: permite ejecutar `lerobot-rollout` con `--strategy.type=base` durante unos segundos para confirmar que los nombres de camara, indices de dispositivo y puerto del robot coinciden con las claves de observacion esperadas por la politica.
- Punto de partida para fine-tuning: al estar publicado en formato LeRobot, puede usarse como inicializacion de un entrenamiento mas largo sobre el mismo dataset u otro similar con la misma topologia de entradas y salidas.
- Investigacion en imitacion visual: util como referencia reproducible para comparar numero de pasos de difusion, horizontes de prediccion y esquemas de augmentacion visual en entornos de simulacion con splats.
- Docencia y demos de Diffusion Policy: el tamano reducido (0,2 GB) y el bajo coste computacional permiten explicar el metodo en un portatil sin GPU dedicada.
- Prototipado de control en simulacion: al no requerir hardware especifico, permite iterar sobre el bucle de control antes de trasladarlo a un robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion vacia con la nota literal "No evaluation results have been provided for this policy yet". No existe, por tanto, tasa de exito medida en robot real ni en simulacion, ni comparacion con modelos de referencia.

## Requisitos de hardware

- VRAM estimada: con 40,65 M de parametros, en fp32 el peso ocupa aproximadamente 163 MB; en fp16/bf16, unos 81 MB; en int8, unos 41 MB. Hay que sumar activaciones del bucle de denoising y de los encoders visuales sobre imagenes de 84x84, de coste bajo.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente para inferencia (GTX 1050 Ti en adelante). Para entrenamiento, una RTX 3060/4060 o superior es mas que suficiente dado el tamano. En hardware de datacenter (A100, H100) el modelo queda enormemente infradimensionado.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas. Tambien es viable en CPU para pruebas de humo, aunque la latencia del bucle de difusion puede incumplir el objetivo de 30 FPS.
- Edge / robot: viable en plataformas tipo NVIDIA Jetson (Nano, Orin) para ejecucion a bordo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) con PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican: estan orientados a modelos de lenguaje y no soportan una politica de difusion.
- Latencia y throughput: no disponible. La latencia depende del numero de pasos de denoising configurado, que no se documenta. A 30 FPS el presupuesto por ciclo de control es de 33 ms.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de las especificaciones numericas de alternativas. A continuacion se comparan cualitativamente las familias de metodos habituales en LeRobot para el mismo tipo de tarea:

| Modelo / metodo | Parametros | Horizonte de accion | Generacion de trayectoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JennyWWW/dryrun_r84_ds` (Diffusion Policy) | 40,65 M | no disponible | si, difusion iterativa | apache-2.0 | HuggingFace Hub |
| Diffusion Policy de referencia (Chi et al., 2023) | no disponible | no disponible | si, difusion iterativa | no disponible | paper + implementaciones publicas |
| ACT (Action Chunking Transformer, implementado en LeRobot) | no disponible | no disponible | no, prediccion directa de chunk | no disponible | repositorio LeRobot |
| Otras politicas publicadas en el Hub con `library_name: lerobot` | no disponible | no disponible | segun metodo | variable | HuggingFace Hub |

No se dispone de datos de rendimiento comparado para ninguna de las filas alternativas en la informacion facilitada.

## Limitaciones y advertencias

- **No es una politica funcional.** Se entreno durante 3 pasos con batch size 4. Los pesos son practicamente una inicializacion aleatoria y no ejecutan la tarea. Debe tratarse exclusivamente como artefacto de prueba.
- Ausencia total de evaluacion: sin tasa de exito, sin numero de ensayos, sin condiciones de dificultad documentadas.
- Sesgos: no evaluables, ya que no hay resultados. El dataset de origen (536 episodios, 148.919 fotogramas) procede presumiblemente de un unico entorno de simulacion, lo que limitaria la generalizacion a otras posiciones de objeto, iluminacion o robots, pero no hay datos para confirmarlo.
- Riesgo de alucinacion: no aplica en el sentido linguistico. En cambio, existe el riesgo propio de las politicas generativas de producir trayectorias plausibles pero fisicamente invalidas cuando el modelo no esta entrenado, lo que en un robot real puede provocar colisiones.
- Sobreajuste al entorno: las entradas estan fijadas a dos camaras concretas con nombres de clave especificos (`base_rgb`, `wrist_rgb`). Cambiar la disposicion de camaras o los nombres de las observaciones rompe la inferencia.
- Limitacion de idioma y lenguaje: no aplica; el modelo no procesa texto. El campo `task` del dataset esta vacio.
- Licencia: apache-2.0, permisiva y apta para uso comercial. Hay que citar el metodo (Diffusion Policy) y LeRobot segun indica la model card.
- Advertencias de despliegue: antes de ejecutar en hardware real, usar `--strategy.type=base` con duracion limitada y el robot en un espacio despejado, dado que la politica no esta entrenada.
- Metadatos: las fechas de creacion y actualizacion indicadas (2026-09-15) y el contador de descargas/likes a cero son coherentes con un artefacto recien subido y sin uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JennyWWW/dryrun_r84_ds
- Dataset de entrenamiento: https://huggingface.co/datasets/JennyWWW/splatsim_approach_lever_13_smooth_r84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JennyWWW/splatsim_approach_lever_13_smooth_r84
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
