# Myungkyu/cosmos3_mot_l36_d1024_robotwin_decoupled_b64_60k_h48e24_ema

## Resumen

`cosmos3_mot_l36_d1024_robotwin_decoupled_b64_60k_h48e24_ema` es un modelo de política de acción para control robótico de bucle cerrado, publicado por el usuario Myungkyu en Hugging Face. Se construye sobre Cosmos3-Nano, un modelo de mundo de vídeo, y le acopla un DiT (Diffusion Transformer) de acción externo que se condiciona de forma unidireccional sobre la representación de vídeo (video-to-action). El resultado es un modelo que, a partir de observaciones visuales, genera secuencias de acciones motrices para un robot.

La innovación principal es el uso de calendarios de ruido desacoplados (decoupled noise schedules): durante el entrenamiento, el ruido de la acción se muestrea de forma independiente al del vídeo, con una pasada de vídeo puro-ruido sin gradientes. Esto lo diferencia de la variante `shared action schedule` del mismo autor. El modelo se ha ajustado fino sobre RoboTwin 2.0 (formato LeRobot v3.0, robot aloha-agilex) durante 60k pasos con batch 64.

La nomenclatura del nombre revela parte de la configuración: 36 capas (`l36`), dimensión oculta 1024 (`d1024`), batch 64 (`b64`), 60k pasos (`60k`), y los parámetros `h48e24` (probablemente 48 cabezas de atención y 24 capas de expertos o similar, no confirmado). Los pesos publicados son los EMA (media móvil exponencial) del checkpoint final, en bf16, empaquetados como checkpoint DCP de rango único, sin estado del optimizador. El repositorio ocupa 32 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo (Cosmos3-Nano) + DiT de acción externo con condicionamiento video-to-action y calendarios de ruido desacoplados |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (único formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/.metadata` y `model/__0_0.distcp`, claves `net.*` |

## Arquitectura y entrenamiento

El modelo combina dos componentes: un modelo de mundo de vídeo Cosmos3-Nano (que actúa como backbone de representación visual) y un DiT de acción externo que consume la información del vídeo para predecir acciones. El condicionamiento es unidireccional (vídeo hacia acción), de modo que la política no retroalimenta sus acciones en la generación de vídeo. La variante `decoupled` se distingue por muestrear el ruido de la acción de forma independiente al del vídeo, ejecutando una pasada de vídeo puro-ruido sin gradientes; la variante hermana `shared action schedule` comparte el calendario de ruido entre ambos.

El ajuste fino se realizó sobre RoboTwin 2.0 en formato LeRobot v3.0 con el robot aloha-agilex, durante 60k pasos con batch 64. Los pesos publicados corresponden a las EMA (net_ema) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`. No se incluye estado del optimizador. El `config.yaml` incluido define la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado; las rutas locales han sido sustituidas por marcadores (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`). El servidor de políticas de cosmos-framework construye el modelo a partir de ese config y requiere apuntar `vae_path` a un fichero local `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B.

## Capacidades

- Generación de acciones motrices para control robótico de bucle cerrado a partir de observaciones visuales.
- Modelado de mundo de vídeo: representación y predicción de dinámica visual subyacente (Cosmos3-Nano).
- Condicionamiento video-to-action: la política consume la representación del vídeo para producir acciones.
- Entrenado específicamente para manipulación con el robot aloha-agilex en el benchmark RoboTwin 2.0.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes LLM; su "multi-paso" es el bucle de control robótico.
- Capacidades multilingües: no disponible (no procesa texto libre).
- Modo thinking, visión general, audio: no disponible; la visión se usa como entrada de observación para la política, no como tarea de VQA.

## Casos de uso

- Manipulación robótica de bucle cerrado en simulación: el modelo recibe observaciones visuales del entorno RoboTwin 2.0 y emite chunks de acciones para el robot aloha-agilex, adecuado para evaluar políticas entrenadas con world models frente a políticas puramente reactivas.
- Investigación en world models para robótica: sirve como base para estudiar el efecto del desacoplamiento de ruido (decoupled vs. shared schedule) en la calidad de las políticas, comparando directamente con las variantes `shared` del mismo autor.
- Generación de datos sintéticos de trayectorias: al estar acoplado a un modelo de mundo de vídeo, puede emplearse para generar rollouts visuales condicionados que alimenten pipelines de aumento de datos para entrenamiento de políticas.
- Evaluación de generalización visual: al condicionarse sobre vídeo, permite medir cómo afectan cambios de iluminación, textura o punto de vista a la política de acción en entornos simulados.
- Baseline para fine-tuning en nuevos robots: el checkpoint EMA en bf16 y el `config.yaml` permiten reajustar sobre otros datasets LeRobot v3.0 cambiando la raíz del dataset y el VAE.
- Despliegue en servidor de políticas cosmos-framework: se integra directamente con `--checkpoint-path <repo> --config-file config.yaml`, lo que facilita su uso en pipelines de evaluación automatizada de robótica.
- Estudio de estabilidad de entrenamiento: al publicarse los pesos EMA sin optimizador, es útil para analizar la convergencia y comparar con los pesos regulares (`scratch`) del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repo pesa 32 GB en bf16, por lo que la inferencia requiere al menos ~32 GB de VRAM solo para pesos, más el VAE Wan2.2 y activaciones; en la práctica se necesita una GPU de 40-80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en bf16 sin offload. No cabe en GPUs consumer de 24 GB (RTX 4090) sin cuantización, y no se documentan cuantizaciones alternativas.
- ¿Cabe en consumer GPU? No en bf16; no se han publicado versiones GGUF, AWQ ni GPTQ.
- Opciones de despliegue: servidor de políticas de `cosmos-framework` (`--checkpoint-path` + `--config-file`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Condicionamiento | Ruido | Pesos | Licencia |
|---|---|---|---|---|---|
| `cosmos3_mot_l36_d1024_robotwin_decoupled_b64_60k_h48e24_ema` (este) | Cosmos3-Nano + DiT acción | video-to-action, unidireccional | desacoplado (acción independiente, pasada vídeo puro-ruido sin grad) | EMA, bf16, DCP | no disponible |
| `cosmos3_mot_l36_d1024_robotwin_b64_60k_scratch` | Cosmos3-Nano + DiT acción | video-to-action, unidireccional | compartido | regulares (net.*), bf16, DCP | no disponible |
| `cosmos3_mot_l36_d1024_robotwin_b64_60k_scratch_ema` | Cosmos3-Nano + DiT acción | video-to-action, unidireccional | compartido | EMA, bf16, DCP | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables fuera de la familia del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse exclusivamente sobre RoboTwin 2.0 con aloha-agilex, el modelo puede sobreajustarse a las condiciones visuales y físicas de ese simulador y robot.
- Riesgo de alucinación: en un modelo de mundo de vídeo, se traduce en predicciones visuales plausibles pero físicamente incorrectas que pueden degradar la política de acción en bucle cerrado.
- Limitaciones de contexto o idioma: no aplica idioma; la longitud de contexto y el chunk de acción vienen definidos por `config.yaml` y no se documentan públicamente.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; además, el modelo depende del VAE de Wan2.2-TI2V-5B, cuyos términos deben verificarse por separado.
- Caveats para producción: requiere el servidor de `cosmos-framework` y un fichero `Wan2.2_VAE.pth` local; el `config.yaml` contiene marcadores de ruta que deben sustituirse. Los pesos son EMA sin optimizador, por lo que no sirven para reanudar entrenamiento tal cual. El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robotwin_decoupled_b64_60k_h48e24_ema
- Variante shared schedule (pesos regulares): https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robotwin_b64_60k_scratch
- Variante shared schedule (EMA): https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robotwin_b64_60k_scratch_ema
- VAE de referencia (Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset RoboTwin 2.0: no disponible en los resultados de búsqueda
- Paper de Cosmos3: no disponible en los resultados de búsqueda
- Repositorio cosmos-framework: no disponible en los resultados de búsqueda
