# keypa/minecraft-world-jepa-ckpts

## Resumen

Minecraft World JEPA es un modelo de mundo (world model) autorregresivo orientado a la generacion de video interactivo en Minecraft, publicado por el usuario keypa en Hugging Face bajo el identificador `keypa/minecraft-world-jepa-ckpts`. El sistema combina un VAE de Stable Diffusion congelado (`sd-vae-ft-mse`) que comprime fotogramas de 256x256 pixeles a latentes de 4x32x32, y un transformer decoder-only de 338 millones de parametros que predice el siguiente latente condicionado por tokens de accion discretos. Estos tokens se reparten en 29 identificadores: 22 correspondientes a teclas de teclado, 6 bins de camara y 1 accion de no-operacion (no-op).

El repositorio no distribuye pesos de inferencia limpios, sino checkpoints completos y resumibles de entrenamiento (modelo, optimizador, scheduler y contadores de paso/epoca), lo que explica su tamano de 109,7 GB. La etapa 1 publicada corresponde a una configuracion de contexto de 4 latentes y batch de 32, con dos epocas completadas y perdidas de 0,266776 y 0,238446 respectivamente. El codigo de entrenamiento se aloja en el repositorio GitHub `keypaa/minecraft-world-jepa`.

Su relevancia actual es de investigacion: se trata de un artefacto de entrenamiento reproducible bit a bit (cualquier checkpoint reinicia el entrenamiento de forma identica con la configuracion correspondiente y `--resume`), util para quienes trabajan en modelos de mundo, aprendizaje por imitacion a partir de gameplay y generacion de datos sinteticos. No es un modelo conversacional ni un LLM: no procesa ni genera lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, adaptadores de accion por bloque estilo DWS y atencion SDPA (flash attention); VAE de Stable Diffusion congelado como codificador y decodificador de fotogramas |
| Parametros totales | 338 M en el transformer; los parametros del VAE no se detallan en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4 latentes (configuracion de etapa 1, "ctx 4"); cada latente procede de un fotograma de 256x256 px comprimido a 4x32x32 |
| Tipos de cuantizacion | No disponible; los checkpoints se distribuyen en bfloat16 y contienen el estado completo de entrenamiento (modelo + optimizador + scheduler) |
| Idiomas soportados | No disponible (modelo no linguistico; se condiciona mediante tokens de accion discretos) |
| Licencia | `other` (el autor no declara licencia; remite a los terminos del dataset y del modelo base) |
| Formato de pesos | PyTorch (`.pt`), checkpoints resumibles por ejecucion: `latest.pt`, `best.pt`, `epoch_XXXX_loss_XXXXXX.pt` |

Otros datos del repositorio: tamano de 109,7 GB, 0 descargas y 0 likes, creado y actualizado el 12 de septiembre de 2026, biblioteca declarada `pytorch`, pipeline no disponible, tags `minecraft`, `world-model`, `video-generation`, `autoregressive`, `pytorch`, `license:other`, `region:us`.

## Arquitectura y entrenamiento

El pipeline es en dos piezas. Primero, un VAE congelado (`sd-vae-ft-mse`) codifica cada fotograma de 256x256 pixeles en un latente de 4x32x32, lo que reduce de forma drastica la dimensionalidad sobre la que opera el modelo generativo. Segundo, un transformer decoder-only de 338 M de parametros con codificacion posicional rotatoria (RoPE) predice el siguiente latente de forma autorregresiva, condicionado por tokens de accion discretos (29 ids: 22 teclas, 6 bins de camara, 1 no-op). La adaptacion a la accion se implementa mediante adaptadores por bloque de estilo DWS, y la atencion usa SDPA con flash attention. La normalizacion esta desactivada: los checkpoints no incluyen media ni desviacion tipica.

Los datos de entrenamiento provienen del dataset `TESS-Computer/minecraft-vla-stage1`, en formato parquet en streaming con 303 shards de gameplay publico. La unica etapa publicada es la etapa 1 (contexto de 4, batch de 32, precision bfloat16), con dos epocas completadas y perdidas de 0,266776 y 0,238446. No se documenta en la informacion disponible el uso de RLHF, DPO ni ningun otro ajuste por preferencias; tampoco el numero total de tokens o fotogramas vistos. La innovacion tecnica aprovechable es el formato de checkpoint resumible: cada directorio conserva modelo, optimizador, scheduler y contadores, permitiendo reanudar el entrenamiento de forma bit-identica con la configuracion coincidente.

## Capacidades

- Prediccion autorregresiva del siguiente latente de un fotograma de Minecraft a partir de una ventana de contexto de 4 latentes.
- Simulacion condicionada por accion: la generacion se controla con 29 tokens discretos (22 teclas, 6 bins de camara, 1 no-op), lo que permite modelar transiciones dependientes de la entrada del jugador.
- Generacion de video latente de 256x256 pixeles tras decodificar con el VAE, con horizonte limitado por la ventana de contexto.
- Reanudacion y reproduccion exacta del entrenamiento mediante los checkpoints de estado completo.
- Base para model-based reinforcement learning, al permitir desplegar trayectorias sinteticas sin ejecutar el entorno real.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso en el sentido de los LLM.
- No es un modelo multilingue ni procesa texto: no tiene tokenizador de lenguaje natural.
- No se documentan capacidades de vision general, audio ni modo de razonamiento explicito ("thinking mode"); la vision se limita a la codificacion y decodificacion de fotogramas del VAE.

## Casos de uso

- Entrenamiento de agentes por refuerzo basado en modelo: el world model permite generar rollouts sinteticos a partir de acciones discretas, reduciendo el coste de interactuar con Minecraft real durante el entrenamiento de politicas.
- Generacion de datos sinteticos para modelos vision-lenguaje-accion (VLA): a partir de trayectorias existentes se pueden producir secuencias adicionales etiquetadas con acciones, utiles para aumentar datasets de imitacion como el propio `minecraft-vla-stage1`.
- Evaluacion offline de politicas: dado que el modelo predice el siguiente latente condicionado por accion, se pueden estimar resultados de politicas candidatas antes de desplegarlas en el juego, filtrando configuraciones poco prometedoras.
- Investigacion en modelos de mundo: el repositorio sirve como punto de partida reproducible para experimentar con contextos mas largos, otros dominios visuales o variantes de adaptadores de accion, gracias a los checkpoints resumibles.
- Augmentacion de datasets de gameplay: la generacion de fotogramas plausibles puede diversificar la cobertura de estados o vistas poco representadas en los 303 shards originales.
- Prototipado de demostraciones interactivas: decodificando los latentes generados con el VAE se pueden construir visualizaciones de predicciones a corto plazo para comunicar el comportamiento del modelo.
- Compresion de video para pipelines de aprendizaje: el VAE congelado ofrece una representacion latente de 4x32x32 por fotograma que puede reutilizarse como entrada compacta en otros modelos, no necesariamente generativos.
- Reproduccion de experimentos a largo plazo: los checkpoints con optimizador y scheduler permiten auditorias y comparaciones bit a bit, un caso poco habitual en pesos publicados de uso general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de mundo no linguistico. Los unicos datos cuantitativos publicados son las perdidas de entrenamiento de la etapa 1:

| Metrica | Valor |
|---|---|
| Etapa 1, epoca 1 | Loss 0,266776 |
| Etapa 1, epoca 2 | Loss 0,238446 |
| Velocidad de entrenamiento medida | ~1,2 s/paso en regimen estable (RTX PRO 6000, batch 32, ctx 4) |
| VRAM reservada en entrenamiento | ~64 GB (RTX PRO 6000) |
| Definicion de la perdida | No disponible en la informacion proporcionada |

No se proporcionan metricas de calidad perceptual (FVD, PSNR, SSIM), de fidelidad condicionada por accion ni comparaciones con otros world models.

## Requisitos de hardware

- Entrenamiento: ~64 GB de VRAM reservada con batch 32 y contexto 4, medido en una RTX PRO 6000. Es un requisito de entrenamiento, no de inferencia.
- Inferencia: no se documenta la VRAM necesaria. Como referencia aritmetica, los 338 M de parametros en bfloat16 ocupan aproximadamente 0,7 GB solo en pesos del transformer, a lo que hay que sumar el VAE y las activaciones; se trata de una estimacion derivada del numero de parametros, no de una cifra publicada por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. La unica GPU mencionada en la model card es la RTX PRO 6000, en contexto de entrenamiento.
- Viabilidad en GPU de consumo: no confirmada. El entrenamiento publicado no cabe en GPU de consumo por el uso de ~64 GB; la inferencia podria ser viable en GPU de consumo con suficiente VRAM, pero no hay datos que lo respalden.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El unico camino descrito es PyTorch con el codigo de `github.com/keypaa/minecraft-world-jepa`.
- Almacenamiento: el repositorio ocupa 109,7 GB, ya que incluye estado de optimizador y scheduler ademas de los pesos.
- Latencia y throughput: solo se publica la cifra de entrenamiento de ~1,2 s/paso; no hay mediciones de latencia de inferencia ni de fotogramas por segundo generados.

## Comparativa con modelos similares

Los modelos comparables pertenecen a la categoria de world models generativos para videojuegos. Los datos de esas alternativas no proceden de la informacion proporcionada y no se han podido verificar, por lo que se marcan como no disponibles.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `keypa/minecraft-world-jepa-ckpts` (este) | World model autorregresivo en latentes para Minecraft | 338 M (transformer) | 4 latentes | `other` (sin declarar) | Pesos en Hugging Face, 109,7 GB |
| Oasis (Decart / Etched) | World model interactivo para Minecraft | No disponible | No disponible | No disponible | No verificado en la informacion proporcionada |
| Genie 3 (DeepMind) | World model generativo interactivo | No disponible | No disponible | No disponible | No verificado en la informacion proporcionada |
| DIAMOND (agente de investigacion) | World model por difusion para entornos de juego | No disponible | No disponible | No disponible | No verificado en la informacion proporcionada |

La comparacion relevante para este repositorio es de enfoque, no de cifras: frente a alternativas que generan pixeles directamente, Minecraft World JEPA opera en el espacio latente de un VAE congelado, lo que abarata el calculo por fotograma a costa de depender de la fidelidad del decodificador. Ademas, su publicacion como estado de entrenamiento resumible lo orienta a reproduccion e investigacion mas que a despliegue de producto. No se dispone de comparaciones cuantitativas verificadas.

## Limitaciones y advertencias

- No se ha publicado una licencia efectiva. La model card indica explicitamente que no se afirma ninguna licencia sobre los pesos y que estos derivan de datos de gameplay publicos de TESS-VLA y del modelo base `sd-vae-ft-mse`; antes de cualquier uso comercial hay que revisar los terminos del dataset y del modelo base.
- El contexto de 4 latentes es muy corto para mantener coherencia temporal. Es previsible deriva y perdida de consistencia en rollouts prolongados, aunque no se documentan mediciones al respecto.
- La normalizacion esta desactivada y los checkpoints no incluyen media ni desviacion tipica, de modo que cualquier uso fuera del pipeline de entrenamiento original requiere reconstruir ese preprocesado o asumir el comportamiento sin normalizar.
- Se desconoce la composicion exacta del dataset de entrenamiento (`TESS-Computer/minecraft-vla-stage1`, 303 shards), por lo que no se pueden evaluar sesgos de contenido, cobertura de escenarios ni posibles material protegido en los fotogramas originales.
- Al ser un modelo de mundo entrenado sobre gameplay humano, heredara los sesgos de comportamiento y las rutas o estilos de juego predominantes en los datos.
- Riesgo de alucinacion visual: al predecir en espacio latente, el modelo puede generar transiciones fisicamente implausibles o estados inexistentes en Minecraft, especialmente con acciones poco frecuentes.
- No procesa lenguaje natural, por lo que no se puede usar como chatbot, asistente ni sistema de recuperacion de informacion.
- No se conocen idiomas soportados ni evaluaciones multilingues; la fila correspondiente de la tabla de especificaciones figura como no disponible.
- No hay resultados de benchmarks publicos, ni perceptuales ni de tarea, lo que impide estimar su calidad frente a alternativas.
- El coste de almacenamiento es elevado (109,7 GB) porque se distribuye el estado completo de entrenamiento, no un paquete de inferencia optimizado.
- Solo se ha completado la etapa 1 (dos epocas). El autor no documenta etapas posteriores ni planes de entrenamiento adicionales.
- No se documentan medidas de seguridad, filtrado de contenido ni evaluacion de riesgos de uso indebido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keypa/minecraft-world-jepa-ckpts
- Codigo y entrenamiento (GitHub): https://github.com/keypaa/minecraft-world-jepa
- Dataset de entrenamiento: https://huggingface.co/datasets/TESS-Computer/minecraft-vla-stage1
- Modelo base del VAE citado en la model card: `sd-vae-ft-mse` (Stability AI)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los unicos resultados obtenidos corresponden a programacion televisiva de atletismo y no guardan relacion con el artefacto descrito.
