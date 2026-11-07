# patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2

## Resumen

GLM-5.3-Flash-REAP50-NVFP4-v2 es una versión podada y cuantizada del modelo multimodal `zai-org/GLM-5.3-Flash`, publicada por el usuario patrickbdevaney. Se trata de un transformer híbrido de tipo `Glm5NextForConditionalGeneration` con 45 capas de decodificador (34 de atención lineal KDA y 11 de atención MLA con DSA sparse attention), 165.500 millones de parámetros tras la poda y una torre de visión de 24 bloques. El modelo original tenía 321.300 millones de parámetros; esta variante elimina el 50 % de los expertos enrutados (144 de 288 por capa) mediante REAP y almacena los expertos enrutados y compartidos en NVFP4.

La motivación principal es el despliegue en dispositivos de memoria limitada: con 98,2 GiB en disco, es la variante pensada para caber en un único dispositivo de 128 GB, y fue construida y probada en una NVIDIA Jetson AGX Thor. Frente al modelo sin podar, mantiene una concordancia top-1 de 0,8386 sobre 241.516 tokens reservados, evaluada con teacher forcing, lo que la convierte en una opción práctica para inferencia local de un modelo de gran tamaño con capacidades de imagen y texto.

Es relevante ahora porque combina tres técnicas de compresión (poda estructurada de expertos, cuantización NVFP4 de solo pesos y formato `compressed-tensors`) manteniendo una ventana de contexto de 1.048.576 tokens y licencia MIT, lo que facilita su uso comercial y su integración en stacks de transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (`glm5_next`); 45 capas: 34 KDA linear-attention + 11 MLA con DSA sparse attention; capas 0-2 MLP densas, capas 3-44 MoE; hidden size 4096; torre de visión de 24 bloques |
| Parámetros totales | 165.470.880.558 (165,5B) tras la poda; el conteo del Hub en este repo cuenta bytes empaquetados, no pesos |
| Parámetros activos | no disponible (el autor no los calculó); top-8 routing + 1 experto compartido |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`, sin cambios); la calibración usó secuencias de 2.048 tokens |
| Tipos de cuantización | NVFP4 weight-only (group size 16, escalas de grupo FP8 E4M3, escala global F32) para expertos enrutados y compartidos, incluido el bloque MTP; BF16 para atención KDA/MLA, indexador DSA, capas densas 0-2, routers, embeddings, `lm_head`, torre de visión y pesos de hiperconexión; F32 para tensores de estado pequeños; sin escalas de activación ni `input_scale` |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | `safetensors` con `compressed-tensors`, esquema `nvfp4-pack-quantized`; 62 shards; 98,2 GiB (105.393.931.276 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que alterna 34 capas de atención lineal KDA con 11 capas de atención MLA que incorporan DSA (sparse attention). Las tres primeras capas usan MLP denso y las 42 restantes son MoE con 288 expertos enrutados por capa, top-8 routing y un experto compartido. Incluye un bloque MTP (multi-token prediction) como capa 45, podado también a 144 expertos (`num_nextn_predict_layers: 1`). La ventana de contexto nativa es de 1.048.576 tokens.

La poda se realizó con REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999), calibrada sobre un corpus multi-dominio con licencias permisivas que incluye pares reales imagen-texto. La mezcla está ponderada para un modelo de código y agentes: agéntico 24 %, código 21 %. La versión v2 usa una selección de expertos de segunda pasada (pass-2 REAP) y una curación (healing) mediante escalar por capa medido. El autor documenta que una tercera pasada experimental (v3, con HOPE y `protect_frac` 0.04) no ha sido evaluada y presenta defectos de construcción, por lo que no se recomienda. La cuantización NVFP4 se aplica solo a los pesos de los expertos; el resto de componentes permanece en BF16 para preservar la calidad de atención y visión.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de visión de 24 bloques incluida en el modelo.
- Generación de código, con una mezcla de calibración orientada explícitamente a código (21 %).
- Razonamiento agéntico y multi-step, con una mezcla de calibración del 24 % en datos agénticos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Decodificación multi-token (MTP) disponible como capa 45, útil para decodificación especulativa.

## Casos de uso

- Despliegue en dispositivos de borde con 128 GB: el modelo cabe en 98,2 GiB y fue probado en una Jetson AGX Thor, lo que permite ejecutar un modelo multimodal de 165,5B en hardware embebido de alta gama sin clúster.
- Asistente de código en local: la mezcla de calibración incluye un 21 % de datos de código y el modelo conserva tool calling y contexto largo, adecuado para autocompletado, revisión de parches y generación de tests en entornos con requisitos de privacidad.
- Agentes autónomos multi-paso: el 24 % de datos agénticos en la calibración y la ventana de 1.048.576 tokens permiten mantener historiales largos de herramientas y observaciones en un solo contexto.
- Análisis de documentos extensos con imágenes: la combinación de torre de visión y contexto de un millón de tokens permite procesar informes, planos o capturas junto con texto largo en una sola pasada.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo y capacidad de razonamiento, con la ventaja de que el modelo puede ejecutarse en infraestructura propia por su licencia MIT.
- Prototipado e investigación en poda de MoE: al publicarse las selecciones v1, v2 y v3 con métricas de concordancia top-1, sirve como referencia reproducible para estudiar el impacto de REAP y NVFP4 en modelos de gran tamaño.
- Inferencia cuantizada en producción con vLLM o TGI: el formato `compressed-tensors` y los pesos safetensors facilitan el despliegue en servidores con una sola GPU de 128 GB.

## Benchmarks y rendimiento

| Métrica | v2 NVFP4 (este repo) | v2 FP8 | v1 FP8 | Modelo sin podar |
|---|---|---|---|---|
| Concordancia top-1 (241.516 tokens, teacher forcing) | 0,8386 | 0,8425 | 0,8370 | referencia |
| Tamaño en disco | 98,2 GiB | 160,6 GiB | 157,0 GiB | 305,8 GiB (FP8) |
| Bloque MTP | sí (144 expertos) | sí | no | sí |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica de calidad publicada es la concordancia top-1 frente al modelo sin podar.

## Requisitos de hardware

- VRAM estimada: 98,2 GiB de pesos en NVFP4; se necesita un dispositivo con al menos 128 GB de memoria unificada o VRAM para acomodar pesos, caché KV y activaciones.
- GPU recomendadas: NVIDIA Jetson AGX Thor (probado por el autor); GPUs de 128 GB o más, como H100 NVL de 94 GB no es suficiente, se requiere H200 (141 GB) o configuraciones multi-GPU.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB; requiere hardware de clase servidor o módulos unificados de 128 GB.
- Opciones de despliegue: `transformers` con `compressed-tensors`; el autor publica builds GGUF para llama.cpp en `GLM-5.3-Flash-REAP50-GGUF`; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP50-NVFP4-v2 | 165,5B (podado de 321,3B) | 1.048.576 | NVFP4 + BF16, safetensors | MIT | Hugging Face |
| GLM-5.3-Flash-REAP50-FP8-v2 | 165,5B | 1.048.576 | FP8, safetensors | MIT | Hugging Face |
| GLM-5.3-Flash-REAP50-GGUF | 165,5B | 1.048.576 | GGUF | MIT | Hugging Face |
| zai-org/GLM-5.3-Flash (base) | 321,3B | 1.048.576 | FP8, safetensors | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- La poda del 50 % de expertos reduce la calidad: la concordancia top-1 es 0,8386, es decir, aproximadamente un 16 % de tokens difieren del modelo sin podar.
- La variante v3 (`pass3-hope/`) no ha sido evaluada y presenta dos defectos documentados: curación con estimador de reserva (sobrecorrección de ~30 %) y cuantización NVFP4 de las proyecciones q/k/v de KDA que cuesta −0,0023 top-1; no debe tratarse como una mejora.
- La carpeta `pass3-hope/` carece de `preprocessor_config.json` y `processor_config.json`; para entrada de imagen hay que copiarlos desde la raíz del repo.
- El conteo de parámetros del Hub cuenta bytes empaquetados, no pesos; el dato real de safetensors es 165.470.880.558.
- Los parámetros activos no fueron calculados, lo que dificulta estimar coste computacional por token.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación.
- La licencia MIT permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del mismo.
- El tamaño de 98,2 GiB limita el despliegue a hardware de 128 GB o configuraciones multi-GPU; no es viable en GPUs de consumo.
- No se han publicado benchmarks estándar, por lo que la evaluación de capacidades específicas (código, matemáticas, visión) queda pendiente de validación por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2
- Árbol de archivos: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2/tree/main
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante FP8 v2: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2
- Variante FP8 v1: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8
- Variante NVFP4 v1: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4
- Builds GGUF: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- Paper REAP: https://arxiv.org/abs/2510.13999
