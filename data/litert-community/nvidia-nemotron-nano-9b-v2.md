# litert-community/NVIDIA-Nemotron-Nano-9B-v2

## Resumen

NVIDIA-Nemotron-Nano-9B-v2 en formato LiteRT-LM es la conversión del modelo Nemotron-Nano-9B-v2 de NVIDIA a `.litertlm`, el formato de pesos optimizado para el runtime LiteRT-LM de Google orientado a inferencia en dispositivo (on-device) y entornos edge. La conversión la mantiene la comunidad `litert-community`, no NVIDIA, y se distribuye en dos variantes: una cuantizada a int8 (9,07 GB) y otra a int4 blockwise (5,59 GB).

El modelo original es un LLM de 8.888.227.328 parámetros entrenado desde cero por NVIDIA como modelo unificado para tareas de razonamiento y no razonamiento. Su arquitectura es un híbrido Mamba2-Transformer con 56 capas, de las cuales 27 son mixers Mamba2, 25 bloques MLP y solo 4 capas de atención. Esta proporción reducida de atención es lo que hace viable el despliegue en dispositivo: únicamente las cuatro capas de atención mantienen una caché KV creciente, mientras que las capas Mamba2 operan con estado de convolución y SSM de tamaño constante.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de razonamiento con modo thinking conmutable por prompt que NVIDIA declara listo para uso comercial. Por otro, muestra el estado del arte en conversión de arquitecturas híbridas a runtimes móviles: los archivos incluidos limitan el contexto a 4096 tokens (frente a los 128K del modelo original) y han sido validados con métricas concretas de velocidad y corrección en hardware Apple y Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer (Nemotron-H): 56 capas (27 Mamba2, 25 MLP, 4 atención), hidden size 4480, 40 cabezas de atención con 8 KV heads de 128, Mamba2 con 128 cabezas de 80, estado 128 y 8 grupos |
| Parametros totales | 8.888.227.328 (9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K en el modelo original; 4096 tokens en estos archivos LiteRT-LM |
| Tipos de cuantizacion | int8 dinámica por capa lineal con embedding int8; int4 blockwise-32 (min-max) en capas lineales con lm_head y embedding en int8; conv Mamba y selective scan en float |
| Idiomas soportados | Inglés, alemán, español, francés, italiano, japonés |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos archivos: int8 (9.072.312.320 bytes) e int4 (5.592.629.248 bytes) |
| Vocabulario | 131.072 tokens con embeddings no atados (untied) |
| Runtime | LiteRT-LM (probado en versión 0.18.0) |

## Arquitectura y entrenamiento

El modelo original se preentrenó sobre 20 billones (trillion) de tokens según el paper arXiv 2508.14444. El proceso descrito por NVIDIA consiste en preentrenar un modelo de 12B parámetros, alinearlo y después comprimirlo y destilarlo hasta los 9B finales mediante la estrategia Minitron. La arquitectura Nemotron-H combina capas Mamba2 con capas de atención completas: las cuatro capas de atención se sitúan en las profundidades 14, 21, 30 y 39, y el resto de la red se reparte entre mixers Mamba2 y bloques MLP. Esta distribución mantiene el coste de memoria de la caché KV acotado a las cuatro capas de atención, lo que explica por qué la conversión a LiteRT-LM es viable en hardware móvil.

La conversión a LiteRT-LM se realizó con litert-torch (commit 115a136 con el parche específico para Nemotron-H) sobre la ruta de conversión `nemotron_h_work/` del proyecto hf-to-litertlm. Un detalle técnico relevante: los archivos declaran activaciones fp32 en GPU porque, con las activaciones fp16 por defecto del runtime, el archivo int8 respondió 0 de 8 preguntas de verificación (todas las respuestas fueron `<unk>` repetido hasta el límite). La variante int4 aplica cuantización blockwise de tamaño 32 con escalas de bloque con suelo en 2^-14, mientras que el lm_head y el embedding se mantienen en int8 en ambos archivos.

## Capacidades

- Generación de texto con razonamiento explícito: por defecto el modelo abre un bloque ``), por lo que el runtime devuelve el razonamiento separado de la respuesta final.
- Conmutación del razonamiento por prompt: `/no_think` en el mensaje de sistema o en un mensaje de usuario desactiva el thinking para la conversación o el turno; `/think` lo reactiva. Con thinking desactivado, la plantilla cierra el prompt con ``.
- Razonamiento matemático y de sentido común: los resultados reportados por NVIDIA con thinking activo incluyen AIME25 72.1, MATH500 97.8 y GPQA 64.0.
- Seguimiento de instrucciones: IFEval 90.3 con thinking activo.
- Multilingüismo limitado a seis idiomas: inglés, alemán, español, francés, italiano y japonés.
- Generación de código: no hay benchmark específico de código en la información disponible; el modelo es de propósito general y no se documenta una capacidad de código destacada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: el modo thinking permite trazas de razonamiento, pero no se documentan capacidades de agente ni uso de herramientas.
- Visión y audio: no soportados; el pipeline es exclusivamente text-generation.

## Casos de uso

- Asistentes conversacionales en dispositivo: con 4096 tokens de contexto y un archivo int4 de 5,59 GB, el modelo puede ejecutar conversaciones multi-turno en un portátil con GPU Apple Silicon sin conexión a red. La caché KV solo crece en las cuatro capas de atención, lo que mantiene el consumo de memoria predecible durante la conversación.
- Razonamiento matemático local con thinking conmutable: en escenarios donde el usuario necesita una respuesta rápida se activa `/no_think`; cuando el problema requiere traza, se deja el thinking activo. Los 93/92 puntos en GSM8K (int8/int4, thinking off) en el Mac M4 Max respaldan este uso.
- Procesamiento por lotes en estaciones de trabajo: con 45,5 tok/s de decodificación en GPU para el archivo int4 en un Mac Studio M4 Max, es adecuado para tareas de generación de texto en local donde la privacidad del dato impide usar APIs externas.
- Clasificación y extracción de información multilingüe: el soporte de seis idiomas permite procesar documentos en inglés, alemán, español, francés, italiano y japonés con un único modelo desplegado en el mismo equipo.
- Prototipado de aplicaciones móviles Android: el runtime LiteRT-LM está orientado a Android; el archivo int4 se probó en un Galaxy S26 (aunque no se ejecutó en esa prueba concreta según la tabla de rendimiento) y el int8 se descartó en Pixel 8a por la regla de memoria del autor de la conversión.
- Evaluación de arquitecturas híbridas en investigación: la proporción 27:4 de capas Mamba2 frente a atención convierte este modelo en un banco de pruebas para estudiar el comportamiento de modelos híbridos en contextos cortos (4096 tokens) frente a transformers puros.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA para el modelo original (thinking activo):

| Benchmark | Resultado |
|---|---|
| AIME25 | 72,1 |
| MATH500 | 97,8 |
| GPQA | 64,0 |
| IFEval | 90,3 |

Resultados de la conversión LiteRT-LM en Mac M4 Max (thinking off, GPU):

| Metrica | int8 | int4 |
|---|---|---|
| GSM8K (Mac GPU) | 93 | 92 |
| GSM8K referencia transformers bf16 | 83 | — |
| GSM8K referencia transformers fp32 | 84 | — |
| Decodificacion (tok/s, GPU) | 41,0 | 45,5 |
| Prefill (tok/s, CPU) | 127,9 | 56,9 |
| Prefill 1024 tok + 256 decodificados, contexto 2048 (s) | 8,37 (GPU) / 28,68 (CPU) | 7,77 (GPU) / 36,32 (CPU) |
| Verificacion de 8 preguntas | 8/8 CPU y GPU | 8/8 CPU y GPU |

La brecha de GSM8K entre la conversión y la referencia de transformers (93/92 frente a 83/84) se concentra íntegramente en las 16 preguntas cuya longitud supera un chunk de Mamba2, según el análisis del autor de la conversión.

## Requisitos de hardware

- VRAM estimada: el archivo int8 ocupa 9,07 GB y el int4 5,59 GB en disco; en ejecución hay que sumar el estado de las capas Mamba2 y la caché KV de las cuatro capas de atención (presupuesto de 4096 tokens en estos archivos).
- GPU recomendadas: Apple Silicon (Mac Studio M4 Max probado, con decodificación a 45,5 tok/s en int4 y 41,0 tok/s en int8); no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: el archivo int4 (5,59 GB) es el candidato para GPUs de consumo con suficiente memoria; el int8 (9,07 GB) requiere más margen. No se han publicado mediciones en RTX 4090 ni en GPUs de consumo equivalentes.
- Móvil: el archivo int8 no se ejecutó en Pixel 8a por la regla de memoria del autor; en Galaxy S26 no se ejecutó en la prueba de rendimiento. Ambos archivos superan el límite de sección única de ~2 GiB de iOS (8,45 GiB int8 y 5,21 GiB int4 como sección TFLite única), por lo que no son desplegables en iOS tal cual.
- Opciones de despliegue: LiteRT-LM 0.18.0 (runtime probado). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia: para prefill de 1024 tokens más 256 tokens decodificados a contexto 2048, 7,77 s en int4 GPU y 8,37 s en int8 GPU en Mac M4 Max; en CPU, 36,32 s (int4) y 28,68 s (int8).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-Nano-9B-v2 (LiteRT-LM, esta ficha) | 8,9B | 4096 (128K en original) | NVIDIA Open Model License | `.litertlm` int8/int4 | Híbrido Mamba2-Transformer, thinking conmutable |
| NVIDIA-Nemotron-Nano-9B-v2 (original) | 8,9B | 128K | NVIDIA Open Model License | safetensors | Referencia de precisión; requiere transformers |
| Ministral-3-3B-Instruct-2512 (LiteRT-LM) | 3B | no disponible | no disponible | `.litertlm` | Mencionado en la model card como referencia del límite de sección única de iOS; menor tamaño |

No se dispone de datos de benchmarks comparativos directos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contexto recortado: los archivos LiteRT-LM limitan la ventana a 4096 tokens frente a los 128K del modelo original, lo que invalida casos de uso que dependan de contexto largo.
- Precisión de activaciones: ambos archivos declaran activaciones fp32 en GPU porque con fp16 por defecto el archivo int8 falló las 8 preguntas de verificación (respuestas `<unk>` repetidas). Cualquier recompilación debe mantener esta configuración.
- Despliegue iOS bloqueado: el tamaño de sección única de los archivos (8,45 GiB int8, 5,21 GiB int4) supera el límite de ~2 GiB por sección de iOS.
- Razonamiento desactivable con coste: NVIDIA advierte de una ligera pérdida de precisión en prompts difíciles cuando se desactiva el thinking.
- Flag de CLI inoperante: `--thinking false` del CLI de LiteRT-LM no actúa sobre este archivo; la desactivación debe hacerse por prompt con `/no_think`.
- Idiomas: solo seis idiomas; no hay soporte documentado de otros.
- Sesgos y alucinaciones: no se documentan análisis específicos de sesgo ni tasas de alucinación en la información disponible; aplican los riesgos habituales de un LLM de 9B.
- Licencia: NVIDIA Open Model License, no una licencia open source estándar; conviene revisar sus términos antes de uso comercial en producción.
- Conversión comunitaria: el artefacto lo mantiene `litert-community`, no NVIDIA; la responsabilidad de validación recae en quien lo despliega.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/NVIDIA-Nemotron-Nano-9B-v2
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- Paper: https://arxiv.org/abs/2508.14444
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Conversión de referencia Ministral-3-3B-Instruct-2512: https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
