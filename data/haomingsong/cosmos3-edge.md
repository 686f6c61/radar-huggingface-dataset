# HaomingSong/cosmos3-edge

## Resumen

Cosmos3-Edge es un modelo fundacional de robótica desarrollado originalmente por NVIDIA, aquí distribuido como conversión al formato de la librería LeRobot. El repositorio `HaomingSong/cosmos3-edge` empaqueta el checkpoint base `nvidia/Cosmos3-Edge` (revisión `344d602b128d1bbdacb43b08d0a3626f46343e29`) dentro de la interfaz de políticas de LeRobot, sin ningún ajuste fino específico de tarea. El modelo es una política visomotora que predice conjuntamente fragmentos de acciones robóticas y latentes de vídeo futuro a partir de instrucciones en lenguaje y observaciones de cámara, con condicionamiento opcional del estado actual del robot.

El backbone es Nemotron 3 Dense VL MoT, con 28 capas de decodificador y una anchura oculta de 2048. El paquete almacena 4.563.688.396 escalares en 1188 tensores (1184 en BF16 y 4 en FP32), un recuento que incluye componentes congelados, un VAE Wan2.2, ficheros de tokenizador y procesadores serializados de LeRobot; no equivale al número de parámetros entrenables o activos.

Su relevancia es doble: por un lado, expone un modelo fundacional de NVIDIA para robótica en el ecosistema LeRobot, lo que facilita el post-entrenamiento de políticas con herramientas estándar; por otro, sirve como punto de partida reproducible para experimentos de imitación visomotora con generación de vídeo latente. El repositorio es reciente (creado en octubre de 2026) y tiene un uso muy limitado (17 descargas, 0 likes), por lo que debe tratarse como material de partida, no como un checkpoint evaluado en tareas cerradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Dense VL MoT (transformer denso visión-lenguaje con mixture-of-transformers); decodificador de 28 capas, anchura oculta 2048 |
| Parametros totales | 4.563.688.396 escalares almacenados (incluye componentes congelados y VAE Wan2.2; no equivale a parámetros entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados principalmente en BF16; 4 tensores del time-embedder en FP32) |
| Idiomas soportados | no disponible (las instrucciones se procesan mediante tokenizador incluido, pero no se documentan idiomas) |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (1188 tensores: 1184 BF16, 4 FP32) |
| Tipo de política LeRobot | `cosmos3_edge` |
| Modelo base | nvidia/Cosmos3-Edge (revisión 344d602b128d1bbdacb43b08d0a3626f46343e29) |
| Compatibilidad LeRobot | commit base b8f060837ced0a4ce4b136ea65b4d56bc7894bed |
| Tamaño del repositorio | 9,2 GB |

## Arquitectura y entrenamiento

El modelo emplea un backbone Nemotron 3 Dense VL MoT, una arquitectura de transformer denso que combina procesamiento de visión y lenguaje. La política predice de forma conjunta fragmentos de acción (`action chunks`) y latentes de vídeo futuro, condicionada por instrucciones en lenguaje y observaciones de cámara actuales, con condicionamiento opcional del estado del robot. El paquete incluye un VAE Wan2.2 para la parte de vídeo, tokenizador y procesadores serializados de LeRobot.

La conversión no añade ajuste fino específico de tarea: es un checkpoint base para post-entrenamiento. El autor documenta dos recetas de entrenamiento seleccionables por punto de entrada. La ruta `--policy.path=HaomingSong/cosmos3-edge` preserva la receta de post-entrenamiento DROID (dominio 8, chunks de 32 pasos, condicionamiento de estado, normalización identidad, muestreador UniPC con 4 pasos de inferencia y guidance 3). La ruta `--policy.type=cosmos3_edge --policy.pretrained_path=...` aplica la receta por defecto de la clase de tamaño para LIBERO (dominio 5, chunks de 16 pasos, sin condicionamiento de estado, normalización por cuantiles de acción, UniPC con 30 pasos y guidance 1). No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Predicción conjunta de acciones robóticas y latentes de vídeo futuro en modo `wam` (video-and-action).
- Condicionamiento por instrucciones en lenguaje natural y observaciones de cámara.
- Condicionamiento opcional del estado actual del robot (activable o desactivable según receta).
- Soporte de un único paso de observación por inferencia (no multi-paso nativo en esta implementación).
- Muestreo mediante UniPC con número de pasos y guidance configurables.
- Módulos de acción cargables o reinicializables (`load_action_modules`), útil para post-entrenamiento nativo.
- Pesos en BF16 para inferencia y FP32 para pesos maestros durante entrenamiento.
- No expone las APIs upstream de razonamiento, audio ni generación de vídeo independiente.

## Casos de uso

- Post-entrenamiento de políticas de imitación visomotora: el checkpoint base sirve como inicialización para ajustar una política sobre un dataset propio de demostraciones, usando la receta DROID o LIBERO según el layout de acciones y cámaras del dataset.
- Manipulación robótica guiada por lenguaje: el modelo acepta instrucciones textuales y observaciones de cámara para predecir chunks de acción, adecuado para tareas de pick-and-place o ensamblaje en entornos controlados.
- Investigación en modelos fundacionales de robótica: permite reproducir experimentos con la interfaz LeRobot y comparar recetas de post-entrenamiento sin partir de cero.
- Generación de latentes de vídeo como señal auxiliar: la predicción de vídeo futuro puede usarse para regularizar o diagnosticar el comportamiento de la política durante el entrenamiento.
- Evaluación de recetas de normalización y muestreo: las dos configuraciones documentadas (identidad frente a cuantiles, 4 frente a 30 pasos UniPC) permiten estudiar su impacto en el rendimiento de la política.
- Integración en pipelines de LeRobot: al ser una política `cosmos3_edge` registrada en LeRobot, se puede cargar con `PreTrainedConfig.from_pretrained` y encadenar con las utilidades de entrenamiento y evaluación de la librería.
- Prototipado en CPU: el autor verificó la conversión y la carga estricta en CPU con features de dataset resueltas, lo que permite validar la integración antes de escalar a GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reporta tasa de éxito en bucle cerrado de LIBERO para esta conversión base, y que los resultados de checkpoints LIBERO ajustados por separado o de modelos NVIDIA Policy-DROID no miden este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 9,2 GB y los pesos se almacenan principalmente en BF16; una estimación conservadora sitúa la inferencia en el rango de 10-20 GB de VRAM según el tamaño de lote y la resolución de cámara, pero el dato no está confirmado por el autor.
- GPU recomendadas: no disponible. Por el tamaño del paquete, se requiere al menos una GPU con 16-24 GB de VRAM para BF16; GPU de datacenter como A100 o H100 son adecuadas para entrenamiento.
- ¿Cabe en GPU de consumo? No confirmado. Una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían alojar el modelo en BF16, pero no hay validación publicada.
- Opciones de despliegue: la librería LeRobot es el único camino documentado; se requiere una versión de LeRobot que incluya los tipos de política Cosmos3. Para inferencia se debe configurar `--policy.dtype=bfloat16` y, en evaluación, `--tf32=false`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HaomingSong/cosmos3-edge | 4.563.688.396 escalares almacenados | no disponible | OpenMDW 1.1 | HuggingFace (17 descargas) | Conversión LeRobot del checkpoint base NVIDIA |
| nvidia/Cosmos3-Edge | no disponible en la información | no disponible | OpenMDW 1.1 | HuggingFace (NVIDIA) | Checkpoint original upstream; incluye APIs de razonamiento, audio y vídeo |
| NVIDIA Policy-DROID | no disponible | no disponible | no disponible | no disponible | Modelo ajustado para DROID; resultados no aplican a este checkpoint |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Es un checkpoint base sin ajuste fino de tarea: no se debe esperar un rendimiento de política listo para producción sin post-entrenamiento.
- Las features de observación y acción guardadas están vacías; la tasa de frames y el tamaño de cámara no están resueltos y el dataset objetivo debe proporcionarlos antes de construir la política.
- No se reporta tasa de éxito en bucle cerrado de LIBERO ni de ninguna otra tarea para esta conversión.
- La implementación LeRobot solo soporta modo `wam` conjunto, un único paso de observación y el muestreador UniPC; no expone razonamiento, audio ni generación de vídeo independiente del modelo upstream.
- El recuento de parámetros almacenados incluye componentes congelados y el VAE, por lo que no refleja la capacidad efectiva de la política.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; el autor remite a los documentos SAFETY, BIAS, PRIVACY y EXPLAINABILITY del modelo original de NVIDIA.
- Licencia OpenMDW 1.1: es necesario conservar la licencia y los avisos de copyright y origen al redistribuir; el uso comercial debe verificarse contra los términos de OpenMDW 1.1.
- El software de runtime instalado por separado mantiene sus propias licencias.
- El repositorio tiene un uso muy bajo (17 descargas, 0 likes) y fue creado en octubre de 2026; no hay validación comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HaomingSong/cosmos3-edge
- Modelo original NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/tree/344d602b128d1bbdacb43b08d0a3626f46343e29
- Model card original: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/README.md
- Notas de seguridad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/SAFETY.md
- Notas de sesgo: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/BIAS.md
- Notas de privacidad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/PRIVACY.md
- Notas de explicabilidad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/EXPLAINABILITY.md
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
