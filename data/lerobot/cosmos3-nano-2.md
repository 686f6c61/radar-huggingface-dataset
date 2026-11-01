# lerobot/Cosmos3-Nano

## Resumen

Cosmos3-Nano para LeRobot es la conversión al formato de política de LeRobot del checkpoint base `nvidia/Cosmos3-Nano`, un modelo de NVIDIA orientado a robótica. No se trata de un modelo de lenguaje conversacional, sino de una política robótica que predice conjuntamente trozos de acciones (action chunks) y latentes de vídeo futuro a partir de instrucciones en lenguaje y observaciones de cámara, con condicionamiento opcional del estado actual del robot. La conversión la publica el equipo de LeRobot (Hugging Face) y no añade ningún ajuste fino específico de tarea: es un punto de partida para post-entrenamiento.

El backbone es un Qwen3-VL MoT (mixture of transformers) con 36 capas de decodificador y 4096 de anchura oculta. El paquete almacena 16.454.213.580 escalares en 1356 tensores (1352 en BF16 y 4 en FP32), pero esa cifra incluye componentes congelados y un VAE Wan2.2, además del tokenizador y los procesadores serializados de LeRobot; no equivale al número de parámetros entrenables ni activos. El repositorio ocupa 33 GB.

Su relevancia es práctica: permite cargar el modelo base de Cosmos3-Nano directamente en el ecosistema LeRobot, con recetas de post-entrenamiento predefinidas (DROID y LIBERO) y compatibilidad con el sampler UniPC. Está pensado para investigadores que quieran adaptar una política video-acción a sus propios datasets de robótica sin partir de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL MoT (backbone), con decodificador de 36 capas y anchura oculta 4096; VAE Wan2.2 incluido |
| Parametros totales | 16.454.213.580 escalares almacenados (incluye componentes congelados y VAE; no es el recuento de parámetros entrenables ni activos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en BF16 y 4 tensores en FP32; se recomienda `--policy.dtype=bfloat16` para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw1.1-license`) |
| Formato de pesos | safetensors (1356 tensores: 1352 BF16 y 4 FP32) |

## Arquitectura y entrenamiento

La política se construye sobre un backbone Qwen3-VL en configuración MoT, con 36 capas de decodificador y 4096 de anchura oculta. El modelo predice de forma conjunta trozos de acciones del robot y latentes de vídeo futuro, condicionado por lenguaje y por la observación actual de cámara, con condicionamiento opcional del estado actual. El paquete incorpora un VAE Wan2.2, archivos de tokenizador y procesadores de LeRobot serializados. La implementación de LeRobot soporta el modo conjunto vídeo-y-acción `wam`, un único paso de observación y el sampler UniPC.

Esta conversión no añade ajuste fino específico de tarea: parte del checkpoint `nvidia/Cosmos3-Nano` en la revisión exacta `e59a53c25979a090fa8706c9acc0c254a6e89b92`, con una línea base de compatibilidad LeRobot en el commit `b8f060837ced0a4ce4b136ea65b4d56bc7894bed`. Se ofrecen dos recetas de post-entrenamiento: `--policy.path=lerobot/Cosmos3-Nano` conserva la receta DROID (dominio 8, chunks de 32 pasos, condicionamiento de estado, normalización identidad, UniPC con 4 pasos de inferencia y guidance 3), mientras que `--policy.type=cosmos3_nano --policy.pretrained_path=lerobot/Cosmos3-Nano` aplica la receta por defecto LIBERO (dominio 5, chunks de 16 pasos, sin condicionamiento de estado, normalización por cuantiles de acción, UniPC con 30 pasos y guidance 1). El parámetro `load_action_modules` (por defecto `true`) conserva los módulos de acción publicados; con `false` se reinicializan la proyección de entrada de acción, la de salida y el embedding de modalidad de acción. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Predicción conjunta de trozos de acciones robóticas y latentes de vídeo futuro en modo `wam`.
- Condicionamiento por instrucciones en lenguaje y por observaciones de cámara; condicionamiento opcional del estado actual del robot.
- Soporte de un único paso de observación por inferencia.
- Muestreo con el sampler UniPC, con pasos y guidance configurables según la receta.
- Adaptable mediante post-entrenamiento a datasets propios con recetas DROID o LIBERO.
- No expone las APIs upstream de razonamiento, audio ni generación de vídeo independiente.
- Soporte de tool calling, agentes, capacidades multilingües y modo thinking: no disponible.

## Casos de uso

- Post-entrenamiento de políticas robóticas sobre datasets propios: cargando el checkpoint con `--policy.path=lerobot/Cosmos3-Nano` se conserva la receta DROID y se puede adaptar el modelo a un robot y una tarea concretos partiendo de pesos preentrenados.
- Evaluación de recetas LIBERO: usando `--policy.type=cosmos3_nano --policy.pretrained_path=lerobot/Cosmos3-Nano` se aplica la receta por defecto de LIBERO, útil para reproducir experimentos de manipulación en entornos simulados.
- Investigación en políticas video-acción: el modo `wam` permite estudiar la predicción conjunta de acciones y latentes de vídeo como señal auxiliar de representación.
- Reentrenamiento de módulos de acción: con `--policy.load_action_modules=false` se reinicializan las proyecciones de acción y el embedding de modalidad, lo que sirve para experimentar con espacios de acción alternativos.
- Integración en pipelines LeRobot: al estar serializado con procesadores de LeRobot, encaja en flujos existentes de carga de configuración mediante `PreTrainedConfig.from_pretrained`.
- Comparación de estrategias de muestreo: la configuración de UniPC (pasos y guidance) es ajustable, lo que permite analizar el compromiso entre coste de inferencia y calidad de las trayectorias generadas.
- Base para modelos derivados: al ser un checkpoint base sin ajuste de tarea, es el punto de partida natural para publicar variantes ajustadas a dominios robóticos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta ninguna tasa de éxito en bucle cerrado de LIBERO para esta conversión base, y que los resultados de checkpoints LIBERO ajustados por separado o de los modelos NVIDIA Policy-DROID no miden este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, los 16.454.213.580 escalares almacenados en BF16 implican del orden de 33 GB solo en pesos, a los que hay que sumar activaciones, el VAE y los procesadores.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del paquete (33 GB de repositorio) no es esperable que quepa en GPU de consumo sin cuantización, y no se documentan cuantizaciones.
- Opciones de despliegue: la vía documentada es LeRobot, con una versión que incluya los tipos de política Cosmos3. Para inferencia se indica `--policy.dtype=bfloat16` y, en evaluación, `--tf32=false`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables de la misma categoría (políticas robóticas video-acción), por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- El paquete no incluye ajuste fino específico de tarea; su uso directo sin post-entrenamiento no está validado para ninguna tarea concreta.
- Las características de observación y acción guardadas están vacías: la tasa de frames y el tamaño de cámara no están resueltos, y el dataset objetivo debe proporcionarlos antes de construir la política.
- Los recuentos de parámetros almacenados incluyen componentes congelados y el VAE, por lo que no deben interpretarse como parámetros entrenables o activos.
- No se exponen las APIs upstream de razonamiento, audio ni generación de vídeo independiente.
- Sesgos conocidos, riesgo de alucinación y limitaciones de idioma: no disponible en la información proporcionada; se remite a las notas de safety, bias, privacy y explainability del modelo original de NVIDIA.
- Licencia OpenMDW 1.1: es necesario conservar la licencia y los avisos de copyright y origen al redistribuir los materiales; conviene revisar los términos antes de un uso comercial.
- El software de runtime instalado por separado mantiene sus propias licencias.
- Para entrenamiento se guarda `dtype=float32` para permitir pesos maestros en FP32, mientras que la mayoría de pesos conservan la precisión BF16 original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Nano
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano
- Revisión exacta del checkpoint original: https://huggingface.co/nvidia/Cosmos3-Nano/tree/e59a53c25979a090fa8706c9acc0c254a6e89b92
- Model card original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/README.md
- Notas de seguridad: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/SAFETY.md
- Notas de sesgo: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/BIAS.md
- Notas de privacidad: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/PRIVACY.md
- Notas de explicabilidad: https://huggingface.co/nvidia/Cosmos3-Nano/blob/e59a53c25979a090fa8706c9acc0c254a6e89b92/EXPLAINABILITY.md
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
