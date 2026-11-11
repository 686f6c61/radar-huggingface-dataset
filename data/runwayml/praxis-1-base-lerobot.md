# runwayml/praxis-1-base-lerobot

## Resumen

Praxis-1 Base (LeRobot) es un checkpoint de robótica publicado por Runway bajo el identificador `runwayml/praxis-1-base-lerobot`. Se trata de la versión del modelo base `runwayml/praxis-1-base` reempaquetada en el formato de política de LeRobot, con un `config.json` de tipo `PraxisConfig` generado por el script de conversión `examples/praxis/convert_checkpoint.py`. Los pesos son idénticos byte a byte a los 17 shards originales, por lo que no introduce cambios en el modelo en sí, sino en su integración con el ecosistema LeRobot.

El modelo es una política de difusión de vídeo con arquitectura MoE de 27.200 millones de parámetros (27,2B), compuesta por un tronco causal por chunks y un experto de acción de 0,3B. Está entrenado sobre vídeo de robots y de humanos abarcando 18 encarnaciones (embodiments), y opera a 15 Hz con chunks de acción de 24 pasos. Este checkpoint concreto corresponde al paso 526.120 de la variante P-base r13 y no incluye cabezas de acción, por lo que no se carga como política directamente: es el punto de partida para fine-tuning sobre una nueva plataforma mono-brazo.

Su relevancia actual radica en que expone un modelo fundacional de robótica de escala grande en un formato consumible por LeRobot, con licencia Apache 2.0 y un flujo de trabajo documentado para añadir cabezas de acción específicas por robot. Depende de componentes congelados externos (VAE Wan2.2 y codificador de texto Qwen/Qwen3.5-2B) que se descargan del Hub y se distribuyen bajo sus propias licencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE de difusión de vídeo: tronco causal por chunks + experto de acción (0,3B) |
| Parámetros totales | 27.202.277.040 (27,2B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 17 shards, 54,4 GB, con `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

Praxis-1 es una política de difusión de vídeo con mezcla de expertos (MoE). El tronco es causal por chunks y se combina con un experto de acción de 0,3B parámetros que genera chunks de 24 pasos de acción a 15 Hz. El checkpoint base se entrenó sobre vídeo de robots y de humanos cubriendo 18 encarnaciones distintas, lo que le confiere una base multimodal y multi-embodiment sobre la que adaptar políticas específicas. El checkpoint publicado corresponde a la variante P-base r13, paso 526.120.

El modelo no incluye cabezas de acción (`"embodiment": "base"`), y omite explícitamente seis tensores dependientes del tamaño de acción y propiocepción de cada plataforma: `action_expert.action_encoder.w1`, `action_expert.embed_proprio` y `action_expert.head` (pesos y sesgos). Para fine-tuning es necesario calcular estadísticas de normalización sobre los datos propios (cuantiles 1 %/99 % de acciones relativas y media/desviación estándar de la propiocepción), añadir las cabezas con `init_heads.py` y entrenar después con ajuste completo o LoRA. Las dependencias congeladas (VAE Wan2.2 y codificador de texto `Qwen/Qwen3.5-2B`) no forman parte del repositorio y se obtienen del Hub. El formato de estado y acción es `[x, y, z, roll, pitch, yaw, gripper]` por frame.

## Capacidades

- Generación de acciones robóticas por chunks: produce secuencias de 24 pasos de acción a 15 Hz para control de plataformas robóticas.
- Modelado de dinámica a partir de vídeo: utiliza un tronco de difusión de vídeo entrenado sobre vídeo de robots y humanos.
- Cobertura multi-embodiment: entrenado sobre 18 encarnaciones, lo que proporciona una base transferible a nuevas plataformas.
- Punto de partida para fine-tuning: admite ajuste completo o LoRA tras añadir las cabezas específicas de la plataforma.
- Integración con LeRobot: se carga mediante la política `praxis` de LeRobot con el `config.json` incluido.
- Condicionamiento por texto: emplea el codificador de texto `Qwen/Qwen3.5-2B` como dependencia congelada.
- No soporta tool calling, function calling ni agentes multi-paso: es un modelo de robótica, no un modelo de lenguaje conversacional.
- Capacidades multilingües: no disponible.

## Casos de uso

- Fine-tuning sobre un brazo robótico nuevo: usar el checkpoint base como inicialización, calcular estadísticas de normalización del dataset propio con `compute_norm_stats.py`, añadir cabezas con `init_heads.py` y entrenar con `--policy.path` apuntando al directorio resultante. Es adecuado porque el modelo ya ha visto 18 encarnaciones y reduce el coste de aprender control desde cero.
- Manipulación mono-brazo en laboratorio: adaptar el modelo a una plataforma mono-brazo concreta para tareas de pick-and-place y manipulación con pinza, usando el formato de acción `[x, y, z, roll, pitch, yaw, gripper]` a 15 Hz.
- Investigación en políticas fundacionales de robótica: servir como línea base reproducible para comparar estrategias de fine-tuning (completo frente a LoRA) sobre el mismo checkpoint P-base r13.
- Control por chunks en entornos de tiempo real: los chunks de 24 pasos a 15 Hz permiten planificar acciones en bloques, lo que encaja en bucles de control que no requieren inferencia paso a paso.
- Preentrenamiento transferible con datos humanos y de robot: aprovechar la mezcla de vídeo humano y robótico para inicializar políticas en plataformas con pocos datos propios.
- Integración en pipelines LeRobot: incorporar el modelo en flujos de entrenamiento y evaluación existentes de LeRobot mediante la política `praxis` y los scripts del repositorio de referencia `runwayml/praxis-1-oss`.
- Evaluación comparativa con políticas específicas: contrastar el modelo base frente a las variantes ya post-entrenadas (`praxis-1-droid` para DROID y `praxis-1-yam` para YAM bimanual) usando los conjuntos de evaluación `runwayml/praxis-1-eval`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos ocupan 54,4 GB en bf16, por lo que la inferencia en bf16 requiere al menos ese orden de memoria, más las dependencias congeladas (VAE Wan2.2 y codificador de texto Qwen/Qwen3.5-2B).
- GPU recomendadas: no disponible para inferencia; para fine-tuning completo la model card indica un mínimo de 4 GPU de 80 GB.
- ¿Cabe en GPU de consumo? no disponible; el tamaño de 54,4 GB en bf16 excede la VRAM de las GPU de consumo habituales en bf16.
- Opciones de despliegue: LeRobot con la política `praxis` (`pip install "lerobot[praxis,dataset]"`); el repositorio de referencia `runwayml/praxis-1-oss` incluye código de inferencia, serving y fine-tuning. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible; el control opera a 15 Hz con chunks de 24 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| runwayml/praxis-1-base-lerobot | 27,2B (MoE) | no disponible | no disponible | Apache 2.0 | Hugging Face, formato LeRobot |
| runwayml/praxis-1-base | 27,2B (MoE) | no disponible | no disponible | Apache 2.0 | Hugging Face, formato original praxis |
| runwayml/praxis-1-droid | no disponible | no disponible | no disponible | no disponible | Hugging Face (política mono-brazo DROID) |
| runwayml/praxis-1-yam | no disponible | no disponible | no disponible | no disponible | Hugging Face (política bimanual YAM) |

Las variantes `praxis-1-droid` y `praxis-1-yam` son post-entrenamientos específicos por encarnación del mismo modelo base; sus recuentos de parámetros y licencias no se detallan en la información disponible.

## Limitaciones y advertencias

- No es cargable como política directamente: carece de cabezas de acción y requiere añadir los seis tensores dependientes de la plataforma antes de usarlo.
- Requiere fine-tuning obligatorio: está pensado como punto de partida para una nueva plataforma mono-brazo, no como política lista para producción.
- Dependencias externas con licencias propias: el VAE Wan2.2 y el codificador de texto `Qwen/Qwen3.5-2B` se distribuyen por separado bajo sus respectivas licencias, no bajo Apache 2.0.
- Coste de entrenamiento elevado: el fine-tuning completo necesita al menos 4 GPU de 80 GB.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible en el sentido de generación de texto; al ser un modelo de control robótico, el riesgo relevante es la generación de acciones no válidas fuera de la distribución de entrenamiento, no documentado.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia para uso comercial: Apache 2.0 permite uso comercial, pero las dependencias congeladas deben cumplir sus propias licencias.
- Caveat de producción: el checkpoint corresponde a un paso concreto (P-base r13, paso 526.120) y no incluye validación de rendimiento publicada; cualquier despliegue requiere evaluación propia sobre el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/runwayml/praxis-1-base-lerobot
- Modelo base original: https://huggingface.co/runwayml/praxis-1-base
- Política DROID: https://huggingface.co/runwayml/praxis-1-droid
- Política DROID en LeRobot: https://huggingface.co/runwayml/praxis-1-droid-lerobot
- Política YAM: https://huggingface.co/runwayml/praxis-1-yam
- Política YAM en LeRobot: https://huggingface.co/runwayml/praxis-1-yam-lerobot
- Conjuntos de evaluación: https://huggingface.co/datasets/runwayml/praxis-1-eval
- Código de referencia: https://github.com/runwayml/praxis-1-oss
- Runway: https://app.runwayml.com/
- Centro de ayuda de Runway: https://help.runwayml.com/hc/en-us
- Catálogo de APIs de modelos de Runway: https://dev.runway.com/models/catalog
