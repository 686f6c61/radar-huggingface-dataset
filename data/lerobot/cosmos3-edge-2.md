# lerobot/Cosmos3-Edge

## Resumen

Cosmos3-Edge es un modelo base de política robótica desarrollado originalmente por NVIDIA y reconvertido por el equipo de LeRobot para su uso dentro del ecosistema LeRobot. La conversión, publicada en el repositorio `lerobot/Cosmos3-Edge`, no añade ningún ajuste fino específico de tarea: se trata de un punto de partida para el post-entrenamiento de políticas robóticas, no de un modelo listo para producción. El modelo base original está disponible en `nvidia/Cosmos3-Edge` (revisión `344d602b128d1bbdacb43b08d0a3626f46343e29`).

La política predice conjuntamente trozos de acciones robóticas (*action chunks*) y latentes de vídeo futuro a partir de observaciones de lenguaje e imagen de cámara, con condicionamiento opcional sobre el estado actual del robot. El backbone es un Nemotron 3 Dense VL MoT (Mixture of Transformers) con 28 capas de decodificador y anchura oculta de 2048. El paquete almacena 4.563.688.396 escalares, pero esa cifra incluye componentes congelados y un VAE Wan2.2, además de tokenizador y procesadores serializados de LeRobot; no equivale al número de parámetros entrenables o activos.

Su relevancia actual radica en que expone un modelo de mundo robótico multimodal (vídeo + acción) dentro de la interfaz de políticas de LeRobot, lo que facilita el post-entrenamiento sobre datasets propios. No obstante, la conversión no reporta tasas de éxito en bucle cerrado ni benchmarks de política, y varias características del modelo original (razonamiento, audio, generación de vídeo independiente) no están expuestas en esta implementación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Dense VL MoT (Mixture of Transformers); decodificador de 28 capas, anchura oculta 2048; VAE Wan2.2 incluido |
| Parametros totales | 4.563.688.396 escalares almacenados (incluye componentes congelados y VAE; no equivale a parámetros entrenables) |
| Parametros activos | no disponible (no es un MoE clásico; el recuento almacenado no distingue activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16 y 4 tensores FP32; se recomienda `--policy.dtype=bfloat16` para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw1.1-license`) |
| Formato de pesos | safetensors (1188 tensores: 1184 BF16 y 4 FP32) |

## Arquitectura y entrenamiento

La arquitectura se basa en un backbone Nemotron 3 Dense VL MoT con 28 capas de decodificador y anchura oculta de 2048, acoplado a un VAE Wan2.2 para la parte de vídeo. La política opera en modo conjunto `wam` (vídeo y acción), prediciendo simultáneamente trozos de acciones y latentes de vídeo futuro a partir de observaciones de lenguaje y cámara, con condicionamiento opcional sobre el estado actual del robot. El paquete incluye tokenizador, VAE y procesadores serializados de LeRobot, y soporta un único paso de observación con el muestreador UniPC.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el checkpoint original. La conversión de LeRobot no añade ajuste fino específico de tarea. El repositorio documenta dos recetas de post-entrenamiento: una que preserva la receta DROID (dominio 8, chunks de 32 pasos, condicionamiento de estado, normalización identidad, UniPC con 4 pasos de inferencia y guidance 3) y otra que usa la receta por defecto de LIBERO para la clase de tamaño (dominio 5, chunks de 16 pasos, sin condicionamiento de estado, normalización por cuantiles de acción, UniPC con 30 pasos y guidance 1). El parámetro `load_action_modules` permite conservar o reinicializar los módulos de acción para post-entrenamiento de estilo nativo.

## Capacidades

- Predicción conjunta de trozos de acción robótica y latentes de vídeo futuro (modo `wam`).
- Condicionamiento sobre lenguaje e imagen de cámara, con condicionamiento opcional sobre el estado actual del robot.
- Muestreo mediante UniPC con número de pasos y guidance configurables.
- Post-entrenamiento sobre datasets propios de robótica a través de la interfaz de políticas de LeRobot.
- Soporte de dos recetas de referencia: DROID y LIBERO.
- No expone las APIs de razonamiento, audio ni generación de vídeo independiente del modelo original de NVIDIA.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible (no aplica a este tipo de modelo).

## Casos de uso

- Post-entrenamiento de políticas de manipulación sobre datasets propios: se parte de `lerobot/Cosmos3-Edge` y se ajusta con la receta LIBERO o DROID según la disposición de cámara y acciones del dataset, aprovechando que la anchura de acción real se toma del dataset objetivo.
- Investigación en modelos de mundo robóticos: la predicción conjunta de acciones y latentes de vídeo permite estudiar la coherencia entre la dinámica visual anticipada y la acción ejecutada en entornos simulados.
- Evaluación de recetas de normalización y muestreo: las dos recetas documentadas (identidad frente a cuantiles; UniPC con 4 frente a 30 pasos) permiten comparar su impacto en el post-entrenamiento sobre un mismo backbone.
- Punto de partida para *benchmarking* interno de políticas: al ser una conversión sin ajuste fino de tarea, sirve como línea base frente a checkpoints posteriormente ajustados en LIBERO o DROID.
- Prototipado en robótica de investigación con condicionamiento de estado: la receta DROID preserva el condicionamiento sobre el estado, útil en tareas donde la observación visual por sí sola es ambigua.
- Integración en pipelines de LeRobot: el paquete incluye los procesadores serializados y el tokenizador, lo que facilita cargar la configuración con `PreTrainedConfig.from_pretrained` e incorporarla a flujos de entrenamiento existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado de LIBERO para esta conversión base, y que los resultados de checkpoints LIBERO ajustados por separado o de los modelos NVIDIA Policy-DROID no miden este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 9,2 GB y los pesos se almacenan en BF16; la inferencia en BF16 requeriría del orden de la decena de GB, pero no se ha publicado una cifra verificada.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible; no se ha confirmado compatibilidad con GPUs de consumo.
- Opciones de despliegue: la vía documentada es LeRobot con una versión que incluya los tipos de política Cosmos3. Para inferencia se indica `--policy.dtype=bfloat16` y, para evaluación, `--tf32=false`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de política robótica que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint base sin ajuste fino específico de tarea, pensado como punto de partida para post-entrenamiento.
- Las características de observación y acción guardadas están vacías; la tasa de fotogramas y el tamaño de cámara no están resueltos y el dataset objetivo debe proporcionarlos antes de construir la política.
- No se reporta tasa de éxito en bucle cerrado; los resultados de otros checkpoints no son extrapolables a esta conversión.
- La implementación de LeRobot solo soporta el modo conjunto `wam`, un único paso de observación y el muestreador UniPC; no expone razonamiento, audio ni generación de vídeo independiente.
- El recuento de 4.563.688.396 escalares incluye componentes congelados y el VAE, por lo que no debe interpretarse como parámetros entrenables o activos.
- Licencia OpenMDW 1.1: es necesario conservar la licencia y los avisos de copyright y origen al redistribuir; conviene revisar los términos antes de un uso comercial.
- Sesgos, riesgo de alucinación y limitaciones de idioma: no disponible en la información proporcionada; la model card remite a los documentos SAFETY, BIAS, PRIVACY y EXPLAINABILITY del modelo original de NVIDIA.
- El ajuste con `--policy.type=cosmos3_edge` requiere que el dataset coincida con la disposición de cámara y acción de la receta LIBERO; de lo contrario, debe usarse la ruta que preserva la receta DROID o reconfigurar los módulos de acción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lerobot/Cosmos3-Edge
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge
- Revisión exacta del checkpoint original: https://huggingface.co/nvidia/Cosmos3-Edge/tree/344d602b128d1bbdacb43b08d0a3626f46343e29
- Model card original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/README.md
- Notas de seguridad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/SAFETY.md
- Notas de sesgo: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/BIAS.md
- Notas de privacidad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/PRIVACY.md
- Notas de explicabilidad: https://huggingface.co/nvidia/Cosmos3-Edge/blob/344d602b128d1bbdacb43b08d0a3626f46343e29/EXPLAINABILITY.md
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
