# Myungkyu/cosmos3_mot_l36_d1024_bench2dex_b128_30k_h48e24_dlin_ema

## Resumen

`cosmos3_mot_l36_d1024_bench2dex_b128_30k_h48e24_dlin_ema` es un modelo de política de acción para robótica derivado de Cosmos3-Nano, un world model de vídeo desarrollado dentro del ecosistema Cosmos (NVIDIA). El modelo ha sido ajustado por el usuario Myungkyu para control robótico en bucle cerrado, combinando el world model de vídeo con un DiT de acción externo que recibe condicionamiento unidireccional vídeo-a-acción bajo un esquema de acciones compartido.

El ajuste se realizó sobre el dataset Bench2Dex, compuesto por demostraciones de un brazo UR5 equipado con una mano RH56DFX, en formato LeRobot v3.0. El resultado es un checkpoint orientado a inferencia que actúa como servidor de política de acción dentro del framework `cosmos-framework`, pensado para control de manipulación diestra con mano antropomórfica.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin benchmarks publicados y sin licencia declarada. Es útil para quien ya trabaje con el stack Cosmos y quiera reproducir o extender el ajuste sobre Bench2Dex, pero no constituye un modelo listo para producción ni para uso comercial sin aclarar antes la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo) con DiT de acción externo; condicionamiento unidireccional vídeo-a-acción y schedule de acciones compartido |
| Parámetros totales | no disponible (el nombre sugiere L36, d1024, h48e24, pero no se confirma el recuento) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) en bf16; `model/__0_0.distcp` con claves `net.*` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo, y le añade un DiT de acción externo que se condiciona de forma unidireccional a partir del vídeo. El schedule de acciones es compartido entre ambos componentes, lo que permite generar acciones de robot en bucle cerrado a partir de la representación latente del world model. Los pesos publicados corresponden a los pesos EMA (`net_ema`) del checkpoint final de entrenamiento, convertidos a bf16 y almacenados bajo los nombres `net.*` en un checkpoint DCP de un solo rango, sin estado del optimizador.

El entrenamiento se realizó sobre Bench2Dex (UR5 + mano RH56DFX, LeRobot v3.0). El nombre del repositorio codifica los hiperparámetros: batch 128, 30k pasos, `h48e24` (probablemente dimensión de hidden y de expertos del DiT de acción) y `dlin` (probablemente schedule lineal de acciones). No se dispone de información sobre el número total de tokens de vídeo, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; en el contexto de un modelo de política robótica, estos mecanismos no son habituales y no se mencionan en la model card.

## Capacidades

- Generación de acciones de robot para control en bucle cerrado de un brazo UR5 con mano diestra RH56DFX.
- Condicionamiento vídeo-a-acción: el world model de vídeo proporciona la representación sobre la que el DiT de acción genera comandos.
- Modelado de mundo: al derivar de Cosmos3-Nano, conserva la capacidad de world model de vídeo subyacente, aunque el ajuste está orientado a política.
- Integración con el servidor de políticas de acción de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación diestra con UR5 + RH56DFX: el modelo está ajustado específicamente sobre este par brazo-mano y puede desplegarse como política de control en tareas de agarre y manipulación fina dentro de un laboratorio de robótica.
- Reproducción de experimentos Bench2Dex: sirve como checkpoint de referencia (variante EMA) para comparar contra las otras variantes publicadas por el mismo autor (`all26`, `b64_60k`), evaluando el efecto del batch, los pasos y el uso de EMA.
- Investigación en world models aplicados a control: permite estudiar cómo el condicionamiento vídeo-a-acción de Cosmos3-Nano se traduce en políticas cerradas en un entorno realista.
- Punto de partida para fine-tuning adicional: al publicarse la config de entrenamiento con rutas parametrizadas, un equipo puede reutilizarla para adaptar el modelo a otro robot o dataset dentro del mismo framework.
- Evaluación de robustez de políticas derivadas de world models: útil para medir deriva y alucinación de acciones en bucle cerrado frente a políticas puramente conductuales.
- Integración en pipelines de simulación-a-realidad: el modelo puede probarse en simuladores compatibles con LeRobot v3.0 antes de transferir a hardware físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo ocupa 32,0 GB en bf16, por lo que la inferencia requiere al menos una GPU con esa capacidad o sharding.
- GPU recomendadas: no disponible; por tamaño, encajan A100 80 GB, H100 80 GB o GPUs con 40 GB o más si se aplica sharding o cuantización.
- ¿Cabe en GPU de consumo? No de forma directa en bf16; requeriría cuantización o descarga por capas, no documentadas.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` (`--checkpoint-path <repo> --config-file config.yaml`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Dependencia adicional: se necesita un VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) configurado en `vae_path`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Pesos | Batch / pasos | Licencia |
|---|---|---|---|---|---|
| `..._bench2dex_b128_30k_h48e24_dlin_ema` (este) | Cosmos3-Nano + DiT acción | Bench2Dex UR5 + RH56DFX | EMA, bf16, DCP | 128 / 30k | no disponible |
| `..._bench2dex_all26_b128_30k_h48e24` | Cosmos3-Nano + DiT acción | Bench2Dex UR5 + RH56DFX | regulares (`net.*`), bf16 | 128 / 30k | no disponible |
| `..._bench2dex_b64_60k_h48e24` | Cosmos3-Nano + DiT acción | Bench2Dex UR5 + RH56DFX | regulares (`net.*`), bf16 | 64 / 60k | no disponible |

Las tres variantes comparten arquitectura y dataset; difieren en el uso de EMA, el tamaño de batch y el número de pasos. No se dispone de benchmarks que permitan comparar su rendimiento.

## Limitaciones y advertencias

- Sin licencia declarada: no puede asumirse uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Modelo de investigación con cero descargas y cero likes: no hay evidencia de validación por terceros.
- Especializado en un único par hardware (UR5 + RH56DFX) y un único dataset (Bench2Dex); su generalización a otros robots o tareas no está documentada.
- Riesgo de alucinación de acciones en bucle cerrado: al derivar de un world model, puede generar trayectorias plausibles pero incorrectas físicamente.
- Requiere el VAE de Wan2.2 externo, lo que añade una dependencia no incluida en el repo.
- Pesos en formato DCP de un solo rango: la carga está atada al servidor de `cosmos-framework`; no hay conversión a safetensors ni GGUF.
- No se documentan sesgos, cobertura idiomática ni limitaciones de contexto; el modelo no es lingüístico, por lo que estos ejes no aplican del mismo modo.
- El nombre del repo codifica hiperparámetros (`h48e24`, `dlin`) cuyo significado exacto no se confirma en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_bench2dex_b128_30k_h48e24_dlin_ema
- Variante `all26`: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_bench2dex_all26_b128_30k_h48e24
- Variante `b64_60k`: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_bench2dex_b64_60k_h48e24
- VAE de Wan2.2 (dependencia): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
