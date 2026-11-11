# runwayml/praxis-1-yam-nvfp4

## Resumen

Praxis-1 YAM NVFP4 es una política robótica bimmanual derivada de `runwayml/praxis-1-yam`, desarrollada por Runway. Se trata de un ajuste fino de 5.000 pasos adicionales con entrenamiento consciente de cuantización (QAT) en formato NVFP4 aplicado exclusivamente a las capas de expertos enrutados de una arquitectura Mixture-of-Experts (MoE). El resto de la red (capas densas, expertos compartidos, routers y el experto de acción) se entrena y se sirve en bf16.

El modelo resuelve el problema de generar acciones motrices para un robot bimmanual YAM a partir de observaciones visuales (cámaras `top_left`, `wrist_left` y `wrist_right`), empleando un enfoque de difusión de vídeo combinado con troceado de acciones (*action chunking*). Con 27.202.463.488 parámetros totales (aproximadamente 27,2 mil millones) y un repositorio de 54,4 GB en 17 shards safetensors, es relevante ahora porque demuestra que la cuantización NVFP4 con QAT puede reducir drásticamente el peso en memoria de una política robótica de gran tamaño (de 54,4 GB a 17,5 GB en memoria) sin abandonar el formato bf16 para el resto de la red.

La licencia Apache 2.0 y la disponibilidad del código de servicio en `runwayml/praxis-1-oss` facilitan la reproducibilidad y el despliegue en entornos de investigación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con difusión de vídeo y experto de acción; `model_type: praxis`, `format_version: 2` |
| Parametros totales | 27.202.463.488 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 en bloques de 16 con escalas de bloque E4M3 y una escala FP32 por matriz de experto, `amax / 2688`) en expertos enrutados; bf16 en capas densas, expertos compartidos, routers y experto de acción |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 17 shards, `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

La política se basa en una arquitectura Mixture-of-Experts (MoE) con un componente de difusión de vídeo y un experto de acción dedicado, orientada a la generación de comandos motrices bimmanuales. El ajuste fino NVFP4 se aplicó durante 5.000 pasos adicionales sobre el checkpoint base `runwayml/praxis-1-yam`, con QAT restringido a las capas de expertos enrutados: los pesos maestros se mantienen en bf16 y la cuantización NVFP4 se materializa en el momento de carga en GPUs SM120. La cuantización emplea FP4 E2M1 con bloques de 16 valores, escalas de bloque E4M3 y una escala FP32 por matriz de experto calculada como `amax / 2688`, aplicada tanto a pesos como a activaciones.

El modelo conserva la misma configuración (`config.json`) y el mismo *embodiment* que el checkpoint base: robot bimmanual con cámaras `top_left`, `wrist_left` y `wrist_right`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la documentación proporcionada.

## Capacidades

- Generación de acciones motrices bimmanuales para el robot YAM a partir de observaciones visuales multi-cámara.
- Difusión de vídeo como componente generativo para la planificación de movimiento.
- Troceado de acciones (*action chunking*) para producir secuencias de comandos motrices coherentes.
- Condicionamiento por *embodiment* específico (cámaras `top_left`, `wrist_left`, `wrist_right`).
- Inferencia en bf16 estándar, con opción experimental de ejecutar los expertos enrutados en NVFP4 en GPUs SM120.
- Soporte de caché de expertos empaquetados en NVFP4 (`model.nvfp4_cache`, 14,4 GB) para evitar reempaquetado entre cargas.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni visión general fuera del pipeline robótico.

## Casos de uso

- Manipulación bimmanual en laboratorio: la política genera comandos coordinados para dos brazos a partir de las tres cámaras del robot, adecuada para tareas de ensamblaje o manipulación de objetos que requieren coordinación entre extremidades.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia cuantizado para comparar el impacto de NVFP4 QAT frente al base bf16 en tareas de imitación robótica.
- Despliegue en GPUs Blackwell de consumo: en una RTX 5090 o RTX PRO 6000 Blackwell, la política puede ejecutarse con expertos enrutados en NVFP4 reduciendo la huella en memoria de 54,4 GB a 17,5 GB, lo que permite prototipado en estaciones de trabajo.
- Evaluación de robustez de cuantización: útil para estudiar cómo afecta la cuantización de expertos enrutados a la calidad de las trayectorias generadas en un robot real.
- Servicio de políticas en pipelines de robótica: mediante `configs/serve_yam.yaml` del repositorio `runwayml/praxis-1-oss`, se puede levantar un servidor de inferencia para el robot YAM.
- Reproducibilidad de experimentos: al mantener pesos maestros bf16 y publicar checksums SHA256, facilita la verificación de resultados en publicaciones y comparaciones entre checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 54,4 GB de pesos, más overhead de activaciones y del experto de acción; se recomienda al menos 64-80 GB de VRAM para servicio en bf16.
- VRAM estimada con expertos enrutados en NVFP4: la política se reduce en memoria de 54,4 GB a 17,5 GB; con caché NVFP4 de expertos (14,4 GB) se evita reempaquetar entre cargas.
- GPUs recomendadas: A100 80 GB o H100 para servicio bf16; RTX 5090 y RTX PRO 6000 Blackwell (SM120) para la ruta NVFP4 experimental.
- Cabe en GPU de consumo: sí, en RTX 5090 con la ruta NVFP4; en bf16 no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: repositorio `runwayml/praxis-1-oss` con `configs/serve_yam.yaml`; instalación del extra `nvfp4` mediante `pip install -e '.[nvfp4]'` y configuración `model.routed_precision: nvfp4`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| runwayml/praxis-1-yam-nvfp4 | 27,2 B | no disponible | NVFP4 QAT en expertos enrutados + bf16 | Apache 2.0 | Hugging Face |
| runwayml/praxis-1-yam | no disponible | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Alternativas de politica robotica bimanual | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Específico para el *embodiment* YAM bimmanual con cámaras `top_left`, `wrist_left` y `wrist_right`; no es un modelo de propósito general ni transferible directamente a otras configuraciones de robot sin ajuste.
- La ruta NVFP4 es experimental y solo funciona en GPUs SM120 (RTX 5090, RTX PRO 6000 Blackwell); en otras GPUs debe servirse en bf16.
- El repositorio completo de 54,4 GB se descarga en cualquier caso, incluso cuando se usa NVFP4, porque el empaquetado se realiza en tiempo de carga.
- No se dispone de información sobre sesgos, tasas de alucinación o límites de contexto; al ser una política robótica, los riesgos se trasladan a la seguridad física del robot y del entorno.
- Las dependencias congeladas (Wan2.2 VAE y `Qwen/Qwen3.5-2B`) se distribuyen por separado bajo sus propias licencias, que deben revisarse antes de uso comercial.
- No se documentan capacidades multilingües ni de tool calling; no debe evaluarse como modelo de lenguaje.

## Enlaces

- [Hugging Face: runwayml/praxis-1-yam-nvfp4](https://huggingface.co/runwayml/praxis-1-yam-nvfp4)
- [Hugging Face: runwayml/praxis-1-yam (checkpoint base)](https://huggingface.co/runwayml/praxis-1-yam)
- [Repositorio de codigo: runwayml/praxis-1-oss](https://github.com/runwayml/praxis-1-oss)
- [Runway](https://app.runwayml.com/)
- [Runway Help Center](https://help.runwayml.com/hc/en-us)
- [Runway API Models Catalog](https://dev.runway.com/models/catalog)
