# runwayml/praxis-1-droid-nvfp4

## Resumen

Praxis-1 DROID NVFP4 es una variante del checkpoint `runwayml/praxis-1-droid` de Runway, una política robótica de un solo brazo entrenada sobre el conjunto de datos DROID y pensada para control de manipuladores tipo Franka. El modelo parte de una arquitectura de difusión de vídeo con chunking de acciones y mezcla de expertos (MoE) enrutada, y en esta versión se ha sometido a un proceso adicional de 5.000 pasos de entrenamiento con cuantización NVFP4 (quantization-aware training) aplicada exclusivamente a las capas de expertos enrutados, manteniendo el resto de la red en bf16.

La relevancia de esta variante es fundamentalmente de despliegue: reduce el espacio en memoria de la política de 54,4 GB a 17,5 GB cuando se ejecutan los expertos enrutados en NVFP4, lo que facilita servir el modelo en GPUs con menos VRAM. Con 27.202.371.288 parámetros totales y pesos bf16 distribuidos en 17 shards safetensors, la ficha se enmarca en el ecosistema de robótica de Runway y se distribuye bajo licencia Apache 2.0.

No se dispone de información sobre longitud de contexto, idiomas soportados ni benchmarks publicados en la documentación proporcionada, por lo que esos apartados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con chunking de acciones y MoE enrutada (model_type: praxis, format_version: 2) |
| Parametros totales | 27.202.371.288 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 en bloques de 16, escalas de bloque E4M3, una escala FP32 por matriz de experto) sobre expertos enrutados; bf16 en el resto |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 17 shards, 54,4 GB) con índice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Praxis de Runway: una política de difusión de vídeo que genera acciones mediante chunking, con una capa de mezcla de expertos enrutada. El checkpoint base `runwayml/praxis-1-droid` corresponde a una política DROID de un solo brazo con dos cámaras (`exterior` y `wrist`). Sobre esa base, esta variante se ha afinado durante 5.000 pasos adicionales con quantization-aware training NVFP4 aplicado solo a las capas de expertos enrutados; las capas densas, los expertos compartidos, los routers y el experto de acción se entrenan y sirven en bf16.

La cuantización NVFP4 usa valores FP4 E2M1 en bloques de 16, escalas de bloque E4M3 y una escala FP32 por matriz de experto calculada como `amax / 2688`, aplicada tanto a pesos como a activaciones. El entrenamiento mantiene pesos maestros en bf16. La configuración (`config.json`) es idéntica a la del checkpoint base. Las dependencias congeladas son el VAE de Wan2.2 y `Qwen/Qwen3.5-2B`, distribuidas por separado bajo sus propias licencias.

## Capacidades

- Generación de acciones robóticas para un manipulador de un solo brazo (Franka) a partir de observaciones de cámara `exterior` y `wrist`.
- Chunking de acciones para control continuo en tareas de manipulación.
- Política de difusión de vídeo aplicada a robótica, con predicción de secuencias de acción.
- Cuantización NVFP4 de los expertos enrutados para reducir el uso de memoria en inferencia.
- Compatibilidad con la pila de código `runwayml/praxis-1-oss` y el fichero de configuración `configs/serve_droid.yaml`.
- Soporte experimental de inferencia NVFP4 en GPUs SM120 (RTX 5090, RTX PRO 6000 Blackwell).
- No se documentan capacidades de texto, visión general, tool calling ni agentes multi-paso.

## Casos de uso

- Manipulación robótica de un solo brazo en entornos de laboratorio: el modelo genera chunks de acciones a partir de las cámaras exterior y wrist, adecuado para tareas DROID de recogida y colocación.
- Despliegue en GPUs de consumo Blackwell: al ejecutar los expertos enrutados en NVFP4, la política pasa de 54,4 GB a 17,5 GB en memoria, lo que permite servirla en una RTX 5090 o RTX PRO 6000 Blackwell.
- Investigación en cuantización para robótica: sirve como referencia de QAT NVFP4 sobre capas MoE en políticas de difusión, comparando comportamiento frente al checkpoint base en bf16.
- Evaluación de políticas DROID en pipelines de investigación: se integra con `runwayml/praxis-1-oss` y `configs/serve_droid.yaml` para reproducir experimentos sobre el conjunto DROID.
- Prototipado de control visomotor con dos cámaras: útil para validar políticas de imitación en bancos de pruebas Franka antes de escalar a otros embodiment.
- Caché de expertos entre cargas: con `model.nvfp4_cache` se conservan los expertos empaquetados (14,4 GB) para acelerar reinicios en entornos de experimentación iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: 54,4 GB de pesos, más overhead de activaciones y del VAE de Wan2.2.
- VRAM estimada con expertos enrutados en NVFP4: política de 17,5 GB en memoria; caché opcional de expertos empaquetados de 14,4 GB.
- GPUs recomendadas para NVFP4: SM120 exclusivamente, es decir, RTX 5090 y RTX PRO 6000 Blackwell (soporte experimental).
- En bf16 puede cargarse en GPUs de数据中心 con suficiente memoria (A100 80 GB, H100); no se especifican requisitos mínimos oficiales.
- Despliegue mediante `runwayml/praxis-1-oss` con `configs/serve_droid.yaml`; el extra `nvfp4` se instala con `pip install -e '.[nvfp4]'` y se activa con `--set model.routed_precision=nvfp4`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| runwayml/praxis-1-droid-nvfp4 | 27,2 B | no disponible | NVFP4 en expertos enrutados + bf16 | Apache 2.0 | Hugging Face |
| runwayml/praxis-1-droid | no disponible | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Politicas DROID genericas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje ni de visión general; no debe evaluarse con benchmarks de texto.
- El soporte NVFP4 es experimental y solo funciona en GPUs SM120 (RTX 5090, RTX PRO 6000 Blackwell); en otras GPUs se sirve en bf16 con el consumo completo de 54,4 GB.
- Aunque se active NVFP4, la descarga completa sigue siendo de 54,4 GB porque el empaquetado se realiza en tiempo de carga.
- La cuantización solo afecta a los expertos enrutados; el resto de la red permanece en bf16, por lo que la reducción de memoria es parcial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas; al ser un modelo de acciones, el riesgo principal es el fallo de la política en entornos fuera de la distribución DROID.
- Licencia Apache 2.0 para el modelo, pero las dependencias congeladas (VAE de Wan2.2 y `Qwen/Qwen3.5-2B`) se distribuyen bajo sus propias licencias, que deben revisarse para uso comercial.
- No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá del conjunto DROID y el embodiment single-arm.

## Enlaces

- [Hugging Face: runwayml/praxis-1-droid-nvfp4](https://huggingface.co/runwayml/praxis-1-droid-nvfp4)
- [Checkpoint base: runwayml/praxis-1-droid](https://huggingface.co/runwayml/praxis-1-droid)
- [Repositorio de código: runwayml/praxis-1-oss](https://github.com/runwayml/praxis-1-oss)
- [Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
