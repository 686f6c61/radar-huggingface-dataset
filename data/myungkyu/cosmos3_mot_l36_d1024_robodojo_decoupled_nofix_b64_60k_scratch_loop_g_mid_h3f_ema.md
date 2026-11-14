# Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b64_60k_scratch_loop_g_mid_h3f_ema

## Resumen
El modelo `cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b64_60k_scratch_loop_g_mid_h3f_ema`, publicado por el usuario Myungkyu, es un modelo del mundo (world model) de vídeo basado en Cosmos3-Nano, ajustado finamente con un DiT de acción externo para control robótico en bucle cerrado. La condicionalización es unidireccional vídeo-a-acción y emplea horarios de ruido desacoplados: el ruido de la acción se muestrea de forma independiente del ruido del vídeo, sobre una pasada de vídeo puro sin gradientes. El resultado es una política de acción que predice comandos motores a partir de observaciones visuales, dentro del marco `cosmos-framework`.

El nombre del repositorio codifica la configuración: `l36` (36 capas), `d1024` (dimensión oculta de 1024), `b64` (batch 64), `60k` (60 000 pasos de entrenamiento), `scratch` (entrenamiento desde cero del cabezal de acción) y `ema` (pesos EMA del checkpoint final. El ajuste se ha realizado sobre RoboDojo Sim en formato LeRobot v3.0. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a experimentación en robótica simulada más que a despliegue en producción.

La relevancia actual radica en la combinación de un world model de vídeo con un experto de acción desacoplado, un patrón que permite reutilizar la representación visual de Cosmos3-Nano para control motor sin reentrenar el backbone de vídeo. No se dispone de licencia, idiomas ni resultados de benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo) + DiT de acción externo; condicionalización unidireccional vídeo-a-acción, ruido desacoplado |
| Parametros totales | no disponible (configuración indicada: 36 capas, dimensión 1024) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/__0_0.distcp` + `model/.metadata`, claves `net.*`, bf16 |

## Arquitectura y entrenamiento
El modelo parte de Cosmos3-Nano, un world model de vídeo, al que se acopla un DiT de acción externo. La innovación principal es el desacoplamiento de horarios de ruido: el ruido de la acción se muestrea independientemente del ruido del vídeo y se aplica sobre una pasada de vídeo puro en modo sin gradientes (`no-grad`). Esto separa el aprendizaje de la dinámica visual del de la política de acción, evitando que el cabezal de acción contamine el backbone de vídeo durante el ajuste.

El entrenamiento se ha realizado sobre RoboDojo Sim (LeRobot v3.0) con batch 64 durante 60 000 pasos, con el cabezal de acción entrenado desde cero (`scratch`) y sin corrección posterior (`nofix`). Los pesos publicados son los EMA (`net_ema`) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*` como checkpoint DCP de un solo rango, sin estado del optimizador. La configuración de entrenamiento (`config.yaml`) define longitud de chunk, ratio de vídeo, formato de prompt y ajustes de estado; requiere un VAE Wan2.2 local (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) para construir el modelo.

## Capacidades
- Predicción de acciones motoras para control robótico en bucle cerrado a partir de observaciones visuales.
- Modelado del mundo de vídeo (world model) heredado de Cosmos3-Nano.
- Condicionalización vídeo-a-acción unidireccional con ruido desacoplado.
- Entrenamiento e inferencia dentro del marco `cosmos-framework` mediante su servidor de políticas de acción.
- Integración con datasets en formato LeRobot v3.0 (RoboDojo Sim).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso
- Control de manipuladores en simulación: el modelo recibe observaciones visuales de RoboDojo Sim y emite comandos de acción por chunk, adecuado para evaluar políticas de imitación en entornos simulados antes de trasladarlas a hardware.
- Investigación en world models aplicados a robótica: permite estudiar cómo un backbone de vídeo preentrenado (Cosmos3-Nano) transfiere representación a tareas de control sin reentrenar el modelo de vídeo completo.
- Experimentación con desacoplamiento de ruido: sirve como base para analizar el efecto de muestrear ruido de acción independiente del de vídeo en la estabilidad del entrenamiento y la calidad de la política.
- Generación de datos sintéticos de trayectorias: al combinar modelado de vídeo y predicción de acciones, puede emplearse para producir rollouts condicionados que alimenten pipelines de aumento de datos en robótica.
- Reproducción de experimentos académicos: la publicación de `config.yaml`, `SHA256SUMS` y pesos EMA permite replicar el ajuste y verificar integridad de artefactos.
- Evaluación comparativa de cabezales de acción: al entrenarse el DiT de acción desde cero sobre un backbone congelado en la pasada de vídeo, facilita aislar el rendimiento del experto de acción frente a alternativas acopladas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 32,0 GB en bf16, lo que da una cota inferior orientativa del orden de decenas de GB para cargar pesos completos; no se especifica el reparto entre backbone de vídeo y DiT de acción.
- GPU recomendadas: no disponibles. Por el tamaño del checkpoint en bf16, se requiere al menos una GPU con memoria suficiente para alojar los pesos completos; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en consumer GPU?: no disponible.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` (`--checkpoint-path <repo> --config-file config.yaml`), que añade `model/` al path. Requiere un VAE Wan2.2 local (`Wan2.2_VAE.pth`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models de vídeo con políticas de acción para robótica) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; tratar como artefacto de investigación hasta verificación.
- Pesos publicados solo como checkpoint DCP (`model/__0_0.distcp` + `model/.metadata`), sin conversión a safetensors ni GGUF; requiere el marco `cosmos-framework` para cargar.
- Solo se publican los pesos EMA (`net_ema`) en bf16; no hay estado del optimizador ni el otro conjunto de pesos del checkpoint de entrenamiento, lo que limita la reanudación del entrenamiento.
- Dependencia externa del VAE Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B); las rutas del `config.yaml` son marcadores de posición que deben sustituirse por rutas locales.
- Entrenado exclusivamente sobre RoboDojo Sim (LeRobot v3.0): el rendimiento fuera de ese entorno o en hardware real no está validado.
- Sin benchmarks publicados, sin descargas ni likes: no hay evidencia empírica externa de calidad o robustez.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Idiomas y contexto: no disponibles; el modelo está orientado a señales visuales y acciones, no a texto multilingüe.

## Enlaces
- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b64_60k_scratch_loop_g_mid_h3f_ema
- VAE requerido (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código o demos adicionales.
