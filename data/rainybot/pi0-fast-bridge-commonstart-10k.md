# RainyBot/pi0-fast-bridge-commonstart-10k

## Resumen

pi0-fast-bridge-commonstart-10k es un checkpoint de entrenamiento completo del modelo de robotica pi0-FAST, desarrollado por el usuario RainyBot. No se trata de un modelo de inferencia autonomo ni de un artefacto listo para usar con Transformers, sino del estado completo de un entrenamiento FSDP (Fully Sharded Data Parallel) que requiere la misma distribucion de 8 shards para poder restaurarse. Parte de los pesos oficiales pi0_fast_base, convertidos a una implementacion de PyTorch para DCU (aceleradores AMD).

El modelo pertenece a la familia pi0-FAST, orientada a control robotico mediante vision-lenguaje-accion (VLA), y se entrena sobre el manifest combinado Bridge + RT1 con un esquema de "common-start" uniforme. El checkpoint corresponde a 10.000 actualizaciones del optimizador de un schedule que apunta a 100.000 pasos, con un objetivo de common-start de 25.000.

Su relevancia es acotada: es material de investigacion reproducible para quienes trabajen con el stack LeRobot/OpenPI sobre hardware DCU y quieran continuar un entrenamiento concreto. No incluye evaluacion de tasa de exito ni resultados de benchmarks, y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0-FAST (vision-lenguaje-accion, implementacion PyTorch para DCU derivada de pi0_fast_base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (token length de entrenamiento: 512) |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16 compute, FP32 parametros y estado Adam) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch `.pt` por rank (`rank_0.pt` a `rank_7.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en pi0-FAST, un modelo VLA que combina un backbone vision-lenguaje (PaliGemma, segun los tokenizers incluidos) con decodificacion de acciones mediante tokens FAST. La implementacion concreta de este checkpoint es una conversion de los pesos oficiales pi0_fast_base a PyTorch para DCU, con entrenamiento distribuido FSDP sobre 8 dispositivos y un layout de shards fijo e identico al original.

El entrenamiento usa batch global 64 (batch por dispositivo 8, sin acumulacion), computo BF16 con parametros y estado Adam en FP32, y finetuning completo de parametros con semilla 42. El optimizador es AdamW (beta1 0.9, beta2 0.95, eps 1e-8, weight decay 1e-10), con clipping 1.0 y EMA 0.99. El schedule es coseno con warmup de 1.000 pasos, pico 2.5e-5, minimo 2.5e-6 y 100.000 pasos de decaimiento. El dataset es el manifest existente Bridge + RT1 (no solo Bridge), con probabilidades de fuente 0.5/0.5, probabilidades de trayectoria originales y anclajes fisicos validos uniformes. La dimension de accion es 8 (acciones 7D rellenadas con cero), horizonte 10 y longitud de token 512 con supervision completa Action/FAST/EOS. No se incluye evaluacion de tasa de exito.

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales y contexto de lenguaje, en el marco del paradigma VLA de pi0-FAST.
- Decodificacion de acciones mediante tokens FAST con supervision Action/FAST/EOS.
- Manejo de acciones de 7 dimensiones (rellenadas a 8) con horizonte de prediccion de 10 pasos.
- Entrenamiento sobre datos de manipulacion robotica de Bridge y RT1.
- Capacidad de reanudacion exacta del entrenamiento (estado de optimizador, buffers, EMA y RNG).
- No dispone de soporte documentado de tool calling, agentes ni multi-step reasoning.
- Capacidades multilingues no documentadas; el unico idioma declarado es ingles.

## Casos de uso

- Reproduccion de investigacion en VLA: restaurar el checkpoint con el mismo mesh de 8 ranks y el runtime PyTorch 2.10 HIP 6.3 para continuar el entrenamiento desde la actualizacion 10.000 y validar resultados frente al run original.
- Estudio de esquemas de muestreo de datos: el checkpoint permite analizar el efecto del "common-start" uniforme y de las probabilidades de fuente 0.5/0.5 entre Bridge y RT1 sobre el aprendizaje de politicas.
- Base para finetuning posterior: al ser un estado completo con pesos y momentos Adam, sirve como punto de partida para experimentos de adaptacion a nuevos datasets roboticos dentro del mismo stack.
- Analisis de estabilidad de entrenamiento: los logs hasta la actualizacion 10.000 y el estado de EMA permiten estudiar dinamicas de convergencia con el schedule coseno configurado.
- Desarrollo de infraestructura DCU: el checkpoint es util para validar pipelines FSDP y compatibilidad de LeRobot/OpenPI sobre aceleradores AMD en entornos de 8 dispositivos.
- Auditoria de reproducibilidad: la inclusion de RNG de Python/NumPy/Torch CPU/DCU y `runtime.json` con la posicion del sampler facilita la verificacion bit a bit de reanudaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se incluye evaluacion de tasa de exito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un checkpoint de entrenamiento, no un modelo de inferencia listo para usar.
- GPU recomendadas: el run original se ejecuto sobre 8 dispositivos DCU (aceleradores AMD) con PyTorch 2.10 HIP 6.3; no se documenta compatibilidad con GPU NVIDIA.
- Cabe en consumer GPU: no disponible; el repo ocupa 46,9 GB y requiere el layout de 8 shards identico.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; la restauracion se realiza con `adapter/train_common_torch.py` bajo lanzamiento distribuido de 8 ranks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0-fast-bridge-commonstart-10k | no disponible | no disponible (token length 512 en entrenamiento) | sin benchmarks publicados | no disponible | checkpoint de entrenamiento, 8 shards |
| pi0_fast_base (oficial) | no disponible | no disponible | no disponible | no disponible | pesos oficiales referenciados en la model card |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de inferencia autonomo: requiere la misma topologia de 8 dispositivos, el mismo orden de parametros y la misma implementacion para restaurarse.
- La licencia no esta declarada, por lo que el uso comercial queda sin garantias juridicas claras.
- No incluye evaluacion de tasa de exito ni benchmarks, de modo que su calidad como politica robotica no esta cuantificada.
- El checkpoint corresponde a 10.000 de los 100.000 pasos del schedule; no debe reiniciarse el warmup al reanudar.
- Las rutas del perfil apuntan al servidor original; es necesario remapear los assets o adaptar ambas copias del perfil antes de cargar.
- Riesgo de sesgo y alucinacion no documentado; los datos de entrenamiento (Bridge + RT1) condicionan el dominio de manipulacion cubierto.
- Idioma declarado unicamente ingles; el soporte multilingue no esta documentado.
- El tamano del repo (46,9 GB) y la dependencia de un runtime especifico (PyTorch 2.10 HIP 6.3, LeRobot cbc8bfb2e618, Transformers 4.53.2 con parches OpenPI) limitan su portabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/pi0-fast-bridge-commonstart-10k
