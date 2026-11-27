# blearyhope/Inkling-2-Mini-Uncensored-MLX

## Resumen

Inkling-2-Mini-Uncensored-MLX es una conversión nativa al formato MLX del checkpoint `blearyhope/Inkling-2-Mini-Uncensored`, un modelo multimodal de tipo image-text-to-text derivado a su vez de `thinkingmachines/Inkling-2-Mini`. La conversión, realizada con `mlx_vlm convert --mtp`, se declara como 100 % lossless: no hay recuantización, ya que MLX implementa de forma nativa los formatos `nvfp4` (capas 0 a 19) y `mxfp8` (capas 20 a 23) junto con pesos de atención, router, loop y visión en BF16/FP32. El resultado ocupa aproximadamente 20,1 GB, idéntico al checkpoint maestro.

El modelo emplea una arquitectura de transformer MoE disperso con bucle (`inkling2_loop`): 24 capas, de las cuales las 12 centrales se recorren 3 veces (48 pasadas efectivas), con 8 de 128 expertos activos por token. Suma 26.388.641.280 parámetros totales (26,4 B) y 3,4 B físicamente activos (5,4 B efectivos considerando las tres pasadas del bucle). Incluye un encoder de visión ViT nativo y una cabeza MTP (multi-token prediction) denominada DSpark, orientada a decodificación especulativa.

La relevancia de esta ficha es doble: por un lado, es una de las pocas distribuciones MLX de un MoE multimodal de este tamaño pensada explícitamente para Apple Silicon con 32 GB o más de memoria unificada; por otro, es una variante "abliterated" (sin capa de rechazo) que el autor publica para investigación sobre alineamiento y mecanismos de negación. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con bucle (`inkling2_loop`): 24 capas, 12 centrales repetidas 3x (48 pasadas), atención híbrida local/global, encoder ViT y cabeza MTP DSpark |
| Parametros totales | 26.388.641.280 (26,4 B) |
| Parametros activos | 3,4 B físicos; 5,4 B efectivos (8 de 128 expertos por token, 3 pasadas de bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Nativa NVFP4 (`group_size=16, bits=4`, capas 0-19), MXFP8 (`group_size=32, bits=8`, capas 20-23), BF16/FP32 en atención, router, loop y visión. Conversión lossless, sin recuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `mlx-vlm`); existen también safetensors nativos (NVFP4/MXFP8/BF16) y GGUF (BF16, Q8_0 a Q3_K_M con `mmproj`) en repos separados |

## Arquitectura y entrenamiento

La arquitectura `inkling2_loop` combina un esqueleto transformer de 24 capas con una estrategia de reutilización de cómputo: las 12 capas centrales se ejecutan tres veces, lo que da 48 pasadas de capa efectivas sin incrementar el número de parámetros almacenados. El bloque es un MoE disperso con 128 expertos por capa y 8 activos por token, lo que sitúa los parámetros activos en 3,4 B físicos y 5,4 B efectivos tras el bucle. La atención es híbrida (local y global), y el modelo incorpora un encoder de visión ViT nativo que acepta imágenes de 40 px a 4096 px, además de una cabeza MTP DSpark para decodificación especulativa y predicción multi-token.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de post-entrenamiento (RLHF, DPO u otros) más allá de que el checkpoint base es `thinkingmachines/Inkling-2-Mini` y que la variante `Uncensored` ha sido sometida a un proceso de abliteration para eliminar el comportamiento de rechazo. La conversión a MLX se realizó con `mlx_vlm convert --mtp` y el autor reporta equivalencia numérica exacta con el checkpoint maestro: coincidencia Top-1 del 100 % (5/5), similitud coseno de logits de 0,999964 y KL de vocabulario completo de 0,000000 frente a PyTorch.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 1M tokens.
- Razonamiento explícito: el autor reporta un 98,5 % de cumplimiento en modo "think" y un 98,0 % de cumplimiento general en la suite de evaluación de 43.450 pruebas.
- Comprensión de imágenes (image-text-to-text) mediante encoder ViT nativo, con resolución de entrada de 40 px a 4096 px.
- Razonamiento matemático y generación de código (capacidades declaradas por el pipeline y los tags del modelo; sin cifras específicas publicadas en esta información).
- Decodificación especulativa mediante cabeza MTP DSpark, orientada a acelerar la generación en MLX.
- Comportamiento sin rechazo (abliterated): el modelo intentará peticiones que el checkpoint original declina.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y mecanismos de rechazo: el modelo permite estudiar cómo se comporta un checkpoint abliterated frente al original en las mismas peticiones, comparando tasas de negación y calidad de respuesta con la ventana de 1M tokens para conversaciones de análisis largas.
- Edición y cirugía de modelos: sirve como punto de partida para experimentos de edición de pesos (abliteration, steering vectors) sobre una arquitectura MoE con bucle, ya que la conversión MLX es lossless y permite comparar logits exactos frente al maestro en PyTorch.
- Inferencia local en Apple Silicon: con 20,1 GB de pesos cabe en Macs de 32 GB o más de memoria unificada, lo que permite ejecutar un MoE multimodal de 26,4 B en un portátil sin GPU dedicada mediante `mlx-vlm`.
- Análisis de documentos con imágenes: el encoder ViT acepta entradas de 40 px a 4096 px, útil para extraer información de capturas, diagramas o páginas escaneadas dentro de flujos conversacionales largos.
- Prototipado de asistentes conversacionales de contexto extendido: la ventana de 1M tokens permite mantener historiales de conversación muy largos o ingerir corpus completos en una sola sesión de razonamiento.
- Evaluación comparativa de formatos de cuantización: al ser una conversión lossless a NVFP4/MXFP8, sirve como referencia para medir la degradación introducida por conversiones GGUF (Q8_0 a Q3_K_M) del mismo modelo base.
- Experimentación con decodificación especulativa: la cabeza MTP DSpark permite probar técnicas de predicción multi-token y medir su impacto en latencia sobre hardware Apple.

## Benchmarks y rendimiento

La model card incluye una verificación de integridad de la conversión MLX frente al checkpoint maestro en PyTorch:

| Build | Carga e integridad | Coincidencia Top-1 | Similitud coseno de logits | KL vocabulario completo (PyTorch ‖ MLX) |
|---|---|---|---|---|
| MLX lossless (NVFP4/MXFP8/BF16, 19,6 GB) | PASS (`mlx_vlm 0.8.1`) | 100 % (5/5) | 0,999964 | 0,000000 |

El autor menciona una suite de referencia de 43.450 evaluaciones medida sobre el checkpoint maestro en vLLM (temperatura 0,0, contexto de 16K, sin límite de generación), pero la tabla de resultados no está incluida en la información disponible. Los únicos datos agregados publicados son los de cumplimiento: 98,0 % general y 98,5 % en modo "think". No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 20,1 GB para los pesos; el autor recomienda 32 GB o más de memoria unificada para dejar margen a la caché KV y al contexto.
- Hardware objetivo: Apple Silicon M1, M2, M3, M4 o M5 con 32 GB o más de memoria unificada. También es posible en Linux con MLX instalado.
- GPU consumer: no aplica de forma nativa, ya que el formato es MLX para Apple Silicon; para GPUs NVIDIA existen los repos safetensors y GGUF del mismo modelo base.
- Software: `mlx >= 0.32.5`, `mlx-vlm >= 0.8.1`, `transformers >= 5.24.1`.
- Despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`); para otras plataformas, vLLM, SGLang, Transformers o Dynamo con el checkpoint safetensors, y `llama.cpp`, LM Studio, Ollama, KoboldCpp o Unsloth con el GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-MLX (esta ficha) | 26,4 B totales / 3,4 B activos (5,4 B efectivos) | 1M tokens | Texto + imagen | MLX (NVFP4/MXFP8/BF16) | Apache 2.0 |
| Inkling-2-Mini-Uncensored (safetensors) | 26,4 B totales / 3,4 B activos | 1M tokens | Texto + imagen | safetensors (NVFP4/MXFP8/BF16) | Apache 2.0 |
| Inkling-2-Mini-Uncensored-GGUF | 26,4 B totales / 3,4 B activos | 1M tokens | Texto + imagen | GGUF (BF16, Q8_0 a Q3_K_M) | Apache 2.0 |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Texto + imagen | no disponible | no disponible |

Las tres primeras filas son el mismo modelo en distintos formatos, por lo que la comparación relevante es de empaquetado y plataforma, no de capacidad. No se dispone de datos de benchmarks de `thinkingmachines/Inkling-2-Mini` ni de modelos de terceros de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo se ha eliminado deliberadamente. Responderá a peticiones dañinas o sensibles que el checkpoint original declina y no incluye capa de seguridad. El autor lo publica para investigación sobre alineamiento y edición de modelos.
- No debe exponerse a usuarios finales sin salvaguardas propias; la responsabilidad legal y de despliegue recae en quien lo utiliza.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados no documentados, lo que impide garantizar calidad fuera de los idiomas presentes en el entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento de la legislación aplicable ni de las obligaciones de seguridad sobre contenido generado.
- El formato MLX limita el despliegue a Apple Silicon (o Linux con MLX); para GPUs NVIDIA hay que recurrir a los repos safetensors o GGUF del mismo modelo base.
- Los benchmarks de referencia se midieron sobre el checkpoint maestro en vLLM, no sobre esta conversión MLX; la verificación en MLX se limita a una muestra de 5 prompts de equivalencia de logits.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored-MLX
- Checkpoint maestro safetensors: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored
- Versión GGUF: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
