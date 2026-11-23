# Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b64_60k_scratch_shallow30_cps_vf64_seed2_ema

## Resumen

Cosmos3-Nano es un modelo de mundo en vídeo (video world model) desarrollado por el usuario Myungkyu sobre el framework Cosmos de NVIDIA, especializado en robótica. Esta variante concreta ha sido afinada para control robótico en bucle cerrado mediante un DiT de acción externo, con condicionamiento unidireccional vídeo-a-acción y esquemas de ruido desacoplados. El modelo se distribuye como pesos EMA en bf16 en formato de checkpoint distribuido de PyTorch (DCP), sin estado del optimizador.

El repositorio tiene un tamaño de 31,7 GB e incluye el checkpoint, el fichero de configuración de entrenamiento y sumas de verificación SHA-256. Está entrenado sobre el dataset RoboDojo Sim en formato LeRobot v3.0. La nomenclatura del identificador revela detalles de la arquitectura: 36 capas (l36), dimensión de modelo 1024 (d1024), batch de 64, 60 000 pasos de entrenamiento, inicialización desde cero (scratch) y un VAE con factor de compresión 64.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, orientado a quien necesite reproducir o continuar el entrenamiento de una política de acción basada en un modelo de mundo de vídeo. No es un modelo de propósito general ni está pensado para despliegue conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento vídeo-a-acción unidireccional) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos distribuidos); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | DCP (torch.distributed.checkpoint): `model/.metadata`, `model/__0_0.distcp` |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de mundo de vídeo Cosmos3-Nano con un DiT de acción externo. El condicionamiento es unidireccional: el vídeo condiciona la acción, no al revés. Los esquemas de ruido están desacoplados, de modo que el ruido de la acción se muestrea de forma independiente al del vídeo, sobre una pasada de vídeo puro con ruido y sin gradientes. El identificador indica 36 capas y dimensión 1024, con un VAE de factor de compresión 64 (vf64) y warm-up de vídeo.

El entrenamiento se realizó desde cero (scratch) durante 60 000 pasos con batch de 64, sobre el dataset RoboDojo Sim en formato LeRobot v3.0. Los pesos publicados corresponden a las EMA del checkpoint final, convertidas a bf16 y almacenadas bajo los nombres `net.*`, como checkpoint de un solo rango sin estado del optimizador. La configuración de entrenamiento se incluye en `config.yaml`, con rutas locales sustituidas por marcadores de posición.

## Capacidades

- Control robótico en bucle cerrado a partir de observaciones de vídeo.
- Modelado de mundo: predicción de dinámica visual para planificación y política de acción.
- Condicionamiento vídeo-a-acción mediante DiT de acción externo con ruido desacoplado.
- Integración con el servidor de políticas de acción de cosmos-framework.
- Entrenamiento y evaluación sobre simulación robótica (RoboDojo Sim, LeRobot v3.0).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en políticas de acción para robótica: cargar el checkpoint en el servidor de acción de cosmos-framework con `--checkpoint-path` y `--config-file config.yaml` para reproducir el comportamiento entrenado en RoboDojo Sim.
- Punto de partida para fine-tuning: los pesos EMA en bf16 permiten continuar el entrenamiento o adaptar la política a nuevos entornos simulados.
- Evaluación de modelos de mundo en bucle cerrado: usar la predicción de vídeo como señal de dinámica para comparar variantes de condicionamiento vídeo-a-acción.
- Estudio de esquemas de ruido desacoplados: la configuración publicada permite analizar el efecto del muestreo independiente de ruido de acción y vídeo.
- Reproducción de experimentos: el `config.yaml` y `SHA256SUMS` facilitan la verificación de integridad y la réplica exacta del pipeline de entrenamiento.
- Integración en pipelines de simulación a realidad: servir la política desde cosmos-framework y conectarla a un simulador LeRobot para pruebas de robustez antes de transferir a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 31,7 GB en bf16, lo que da una cota inferior aproximada del espacio de pesos en memoria, pero el consumo real depende de la configuración del VAE y del servidor de acción.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint en bf16 (decenas de GB) sugiere que no cabe en GPUs de consumo de gama media sin cuantización adicional, que no está documentada.
- Opciones de despliegue: servidor de políticas de acción de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`). Requiere un fichero VAE local `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B configurado en `vae_path`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo_decoupled (este) | no disponible | no disponible | Política de acción robótica sobre world model de vídeo | no disponible | Hugging Face, 0 descargas |
| Cosmos3-Nano (base, NVIDIA) | no disponible | no disponible | World model de vídeo | no disponible | Referenciado como base en la model card |
| Wan2.2-TI2V-5B (solo VAE usado) | 5B (modelo completo) | no disponible | Generación vídeo texto-imagen | no disponible en esta ficha | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: cero descargas y cero likes; no hay evidencia de validación externa ni de uso en producción.
- Licencia no disponible: no se puede confirmar el uso comercial; la licencia del modelo base Cosmos3-Nano y del VAE Wan2.2 debe verificarse por separado.
- Idiomas no disponibles: el modelo no está orientado a tareas lingüísticas.
- Dependencia de rutas locales: el `config.yaml` contiene marcadores de posición que deben sustituirse manualmente, incluido `vae_path`.
- Formato DCP de un solo rango: requiere el servidor de cosmos-framework o código compatible con `torch.distributed.checkpoint`; no es un GGUF ni un safetensors estándar.
- Sin estado del optimizador: no permite reanudar el entrenamiento exactamente desde el checkpoint publicado.
- Entrenado únicamente en RoboDojo Sim: riesgo de brecha sim-a-real no cuantificado.
- Riesgo de alucinación y sesgos: no evaluado ni documentado para este artefacto.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene verificar la procedencia antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b64_60k_scratch_shallow30_cps_vf64_seed2_ema
- VAE referenciado: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos (NVIDIA): no disponible en la información proporcionada.
