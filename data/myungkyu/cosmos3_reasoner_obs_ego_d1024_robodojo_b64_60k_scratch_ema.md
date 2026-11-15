# Myungkyu/cosmos3_reasoner_obs_ego_d1024_robodojo_b64_60k_scratch_ema

## Resumen

`cosmos3_reasoner_obs_ego_d1024_robodojo_b64_60k_scratch_ema` es un modelo de política de acción para control robótico en bucle cerrado, publicado por el usuario Myungkyu en Hugging Face. Se construye a partir de Cosmos3-Nano, un modelo de mundo (world model) de vídeo, sobre el que se ha añadido un DiT de acción externo que condiciona la acción a partir de la observación visual mediante un esquema unidireccional vídeo-a-acción con un calendario de acciones compartido. El resultado es un modelo que, dada una observación egocéntrica del robot, predice las acciones de control correspondientes.

El modelo se ha afinado sobre RoboDojo Sim en formato LeRobot v3.0, con un entrenamiento de 60 000 pasos, batch de 64 y un tamaño de dimensión oculta de 1024 (indicado por el sufijo `d1024`). El repositorio contiene únicamente los pesos EMA del checkpoint final en bf16, empaquetados como un checkpoint de `torch.distributed` (DCP) de un solo rango, sin estado del optimizador. No se trata de un modelo de lenguaje: es una política visomotora para robótica, y su relevancia radica en el uso de un modelo de mundo de vídeo como base para el razonamiento espacio-temporal en tareas de manipulación.

La información pública disponible es muy limitada: no hay model card extendida, ni resultados de benchmarks, ni detalles sobre la licencia o los idiomas. La ficha que sigue refleja exclusivamente los datos contenidos en la model card y en los metadatos del repositorio, indicando "no disponible" en todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento unidireccional vídeo-a-acción) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo visomotor, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/.metadata` y `model/__0_0.distcp`, claves `net.*`, bf16 |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de mundo de vídeo (Cosmos3-Nano) con un Diffusion Transformer (DiT) de acción externo. El condicionamiento es unidireccional: la información visual fluye hacia el módulo de acción, que comparte un calendario de acciones con el modelo base. El entrenamiento se realizó desde cero (`scratch`) sobre el simulador RoboDojo Sim en formato LeRobot v3.0, con 60 000 pasos, batch de 64 y dimensión de modelo de 1024. El checkpoint publicado corresponde a los pesos EMA (`net_ema`) del paso final, convertidos a bf16 y almacenados bajo los nombres `net.*`.

El repositorio incluye un `config.yaml` con la configuración de entrenamiento, en el que las rutas locales se han sustituido por marcadores de posición (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`). Para cargar el modelo es necesario disponer del checkpoint base Cosmos3-Nano en formato DCP y del VAE de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B), que debe indicarse en el campo `vae_path`. El servidor de políticas de acción de `cosmos-framework` construye el modelo a partir de este `config.yaml` y lee de él la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado. No se documentan detalles sobre la composición del dataset, el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Predicción de acciones de control robótico a partir de observaciones visuales egocéntricas, en bucle cerrado.
- Condicionamiento vídeo-a-acción mediante un DiT de acción dedicado con calendario de acciones compartido.
- Razonamiento espacio-temporal implícito heredado del modelo de mundo de vídeo Cosmos3-Nano.
- Integración con el servidor de políticas de acción de `cosmos-framework` para despliegue en inferencia.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales (thinking, visión general, audio) más allá del uso visomotor para robótica.

## Casos de uso

- Manipulación robótica en simulación: el modelo predice acciones a partir de observaciones egocéntricas en entornos RoboDojo Sim, adecuado para entrenar y evaluar políticas antes de transferir a hardware real.
- Control en bucle cerrado de brazos robóticos: al condicionar la acción sobre la observación visual actual, permite corregir desviaciones en tiempo de ejecución en tareas de pick-and-place.
- Investigación en world models para robótica: sirve como base para estudiar cómo un modelo de mundo de vídeo transfiere representaciones espacio-temporales a la predicción de acciones.
- Generación de datos sintéticos de política: puede emplearse para producir trayectorias de acción en simulador que alimenten pipelines de aprendizaje por imitación.
- Evaluación comparativa de políticas visomotoras: al estar entrenado sobre RoboDojo Sim, permite comparar arquitecturas de condicionamiento vídeo-a-acción bajo el mismo protocolo.
- Prototipado de agentes robóticos con `cosmos-framework`: su integración con el servidor de políticas de acción facilita desplegar el modelo en un pipeline de inferencia existente sin reescribir el stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 33,2 GB en bf16, lo que da una cota inferior orientativa del orden de decenas de GB para cargar los pesos, pero no se documenta el consumo real en inferencia.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint en bf16, es previsible que requiera GPU de datacenter (A100, H100) o GPUs consumer de gama alta con suficiente VRAM, pero el autor no lo especifica.
- ¿Cabe en GPU consumer?: no disponible.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <repo> --config-file config.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- La licencia no está publicada, por lo que no puede confirmarse el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- El modelo está entrenado exclusivamente sobre RoboDojo Sim; no hay evidencia de transferencia a robots reales ni a otros simuladores.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto o idioma.
- Requiere dependencias externas no incluidas en el repositorio: el checkpoint base Cosmos3-Nano en DCP y el VAE `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B.
- El `config.yaml` contiene marcadores de posición en lugar de rutas reales, por lo que la carga requiere edición manual de la configuración.
- El checkpoint es solo de pesos EMA en bf16, sin estado del optimizador, por lo que no es reanudable para entrenamiento tal cual.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria ni reportes de uso.
- Al ser un modelo visomotor, no debe esperarse de él generación de texto ni capacidades lingüísticas.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_reasoner_obs_ego_d1024_robodojo_b64_60k_scratch_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
