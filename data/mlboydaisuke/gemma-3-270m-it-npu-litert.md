# mlboydaisuke/gemma-3-270m-it-NPU-LiteRT

## Resumen

El modelo `mlboydaisuke/gemma-3-270m-it-NPU-LiteRT` es una conversión cuantizada estática (SRQ, static-range quantized) del modelo `google/gemma-3-270m-it` de Google, preparada específicamente para ejecución en la NPU (Unidad de Procesamiento Neuronal) Hexagon de los SoC Qualcomm Snapdragon mediante el runtime LiteRT-LM (antes TFLite). El autor, mlboydaisuke, distribuye un único archivo `.litertlm` de aproximadamente 456 MB que contiene los pesos cuantizados y los metadatos necesarios para que el dispositivo compile el modelo en su propia NPU en tiempo de carga (JIT), evitando artefactos precompilados específicos de cada SoC.

El modelo base, Gemma 3 270M, es un modelo de lenguaje pequeño (SLM) de la familia Gemma 3, con 270 millones de parámetros y una arquitectura transformer decoder-only optimizada para eficiencia. Esta conversión NPU está diseñada para llevar la generación de texto a dispositivos móviles Android de gama alta, aprovechando la aceleración por hardware de Qualcomm. Es relevante porque permite ejecutar un modelo de instrucciones con calidad razonable de forma totalmente local, sin conexión a internet, con velocidades de decodificación superiores a 200 tokens por segundo en hardware verificado (Snapdragon SM8850).

La ficha se basa en la model card del autor y en la documentación pública del modelo base. No se dispone de información sobre los idiomas soportados en esta conversión concreta, aunque el modelo base Gemma 3 270M es multilingüe. La licencia es la de Gemma, con sus términos de uso y política de usos prohibidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 270M) |
| Parametros totales | 270 millones (heredados del modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 896 tokens de KV cache por diseño en esta conversión (el modelo base soporta 128K) |
| Tipos de cuantizacion | SRQ (static-range quantized), bit-width no especificado |
| Idiomas soportados | no disponible (heredados del modelo base, no confirmados en esta conversión) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-3-270m-it` es un transformer decoder-only con atención multi-query (MQA) para reducir el uso de memoria del KV cache, tal como se describe en el reporte técnico de Gemma 3. Tiene 270 millones de parámetros, una longitud de contexto nativa de 128K tokens y fue entrenado con un corpus multilingüe. La versión `-it` es el checkpoint afinado con instrucciones (instruction-tuned), probablemente mediante un proceso de RLHF o similar, aunque los detalles exactos de entrenamiento no se especifican en la documentación pública consultada.

Esta conversión NPU no implica un reentrenamiento: es una exportación del modelo afinado al formato LiteRT-LM mediante el pipeline experimental `npu_export` de `litert-torch`. El proceso incluye una cuantización estática con calibración (10 prompts de calibración, 32 pasos de decodificación) y una partición de operaciones: las 888 operaciones de prefill y 869 de decode se ejecutan en la NPU (HTP), mientras que las gráficas auxiliares (RoPE, máscara, actualización de cache y embedder) corren en CPU, con un coste medido de aproximadamente el 2,8% del tiempo de decodificación. El autor destaca que el pipeline de conversión es byte-reproducible: dos builds frescas solo difieren en un timestamp, un UUID y el orden de serialización de una lista de tokens de parada.

## Capacidades

- Generación de texto en lenguaje natural con seguimiento de instrucciones, heredada del modelo base Gemma 3 270M.
- Razonamiento básico y respuesta a preguntas de conocimiento general, dentro de las limitaciones de un modelo de 270M de parámetros.
- Capacidad multilingüe potencial (el modelo base soporta más de 140 idiomas), aunque no se ha verificado en esta conversión NPU.
- Ejecución completamente on-device en NPU de Qualcomm, sin necesidad de conexión a internet.
- Compilación JIT en tiempo de carga: el mismo archivo sirve para distintos SoC Qualcomm compatibles, sin requerir binarios precompilados por dispositivo.
- No se documentan capacidades de tool calling, function calling, ni modos de razonamiento extendido (thinking) en esta conversión.
- No se documentan capacidades multimodales (visión, audio) en esta versión, aunque el modelo base Gemma 3 270M es multimodal; la conversión NPU parece centrarse en texto.

## Casos de uso

- Asistente personal on-device en Android: el modelo puede responder a preguntas y ejecutar instrucciones simples directamente en el dispositivo, sin enviar datos a servidores externos, lo que garantiza privacidad y funciona sin conexión.
- Autocompletado y redacción de mensajes en aplicaciones de mensajería o correo: gracias a su baja latencia de decodificación (~220 tok/s en SM8850), puede sugerir respuestas en tiempo real mientras el usuario escribe.
- Chatbot de atención al cliente integrado en apps móviles: para consultas frecuentes y respuestas estandarizadas, con la ventaja de no depender de la red y de no incurrir en costes de API.
- Aplicaciones educativas offline: explicaciones breves, resolución de ejercicios sencillos de matemáticas o generación de preguntas de práctica, ejecutándose en el propio móvil.
- Prototipado rápido de aplicaciones de IA generativa en dispositivos Android con NPU Qualcomm: los desarrolladores pueden integrar el modelo mediante LiteRT-LM y verificar el rendimiento en hardware real antes de optimizar.
- Investigación en eficiencia de modelos pequeños: sirve como referencia para estudiar el impacto de la cuantización estática y la compilación NPU en la calidad de salida y la velocidad de inferencia, gracias a la reproducibilidad byte a byte del pipeline de conversión.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones de rendimiento en un Snapdragon SM8850 (Galaxy S26), con QAIRT 2.47 y una build de LiteRT-LM 0.16, utilizando un prompt de 16 tokens y generando 64 tokens de salida, con inicio de proceso por prompt:

| Build | Prefill (tok/s) | Decode (tok/s) | Carga |
|---|---|---|---|
| JIT, cache 1024 (variante) | 1899 | 219.7 | ~16 s (compila) |
| AOT (offline-compiled) control, cache 896 | 1747 | 199.8 | ~1 s |

Nota: la variante JIT usa cache 1024 y la AOT usa cache 896, por lo que la comparación no es estrictamente controlada. El autor indica que el prompt de 16 tokens hace que la columna de prefill sea un límite inferior, no una afirmación de throughput.

En cuanto a calidad, se realizó una prueba de 45 prompts en el dispositivo (64 tokens máximos de salida, greedy):

| Arm | Correctos | Nota |
|---|---|---|
| fp32 reference (host) | 28/45 | |
| JIT, cache 896 (configuración publicada) | 29/45 | Generaciones idénticas al build AOT en 45/45 prompts |
| JIT/AOT, cache 1024 o 960 | 12/45 | Debido al umbral de 1 MiB en la máscara de decode |

Además, el archivo subido se validó en el intérprete host con 28/45 correctos (igual que fp32), con el mismo veredicto en 41/45 prompts. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión concreta.

## Requisitos de hardware

- SoC Qualcomm con NPU Hexagon (HTP) compatible con LiteRT-LM. Verificado únicamente en Snapdragon SM8850 (Hexagon v81) con QAIRT 2.47.
- Se requieren diez librerías de runtime Qualcomm/LiteRT en el APK y dos opciones de entorno, según la receta documentada en el repositorio `hf-to-litertlm`.
- No se especifica VRAM, ya que la inferencia se ejecuta en la NPU del SoC, no en GPU. El tamaño del archivo es de ~456 MB, por lo que el almacenamiento interno debe tener al menos esa capacidad.
- La carga del modelo implica una recompilación JIT de aproximadamente 16 segundos en SM8850, que ocurre en cada inicio de proceso. No existe caché de compilación para la ruta NPU en el runtime actual.
- Opciones de despliegue: integración en apps Android mediante LiteRT-LM con backend NPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.litertlm` es específico de LiteRT.
- Latencia y throughput: decode de ~220 tok/s y prefill de ~1900 tok/s en SM8850 (mediciones puntuales, no controladas).

## Comparativa con modelos similares

La comparativa se realiza contra el modelo base sin cuantizar y contra una variante AOT (compilación offline), según los datos del autor. No se dispone de comparaciones con otros modelos de tamaño similar en formato NPU.

| Modelo / variante | Formato | Contexto efectivo | Calidad (45 prompts) | Decode (tok/s) | Carga |
|---|---|---|---|---|---|
| google/gemma-3-270m-it (fp32, host) | safetensors | 128K (nativo) | 28/45 | no medido | no aplicable |
| mlboydaisuke/gemma-3-270m-it-NPU-LiteRT (JIT, cache 896) | .litertlm | 896 tokens | 29/45 | 219.7 | ~16 s |
| Variante AOT (cache 896, control) | .litertlm precompilado | 896 tokens | 29/45 (idéntico) | 199.8 | ~1 s |

No se han encontrado otros modelos comparables en formato LiteRT-NPU con especificaciones públicas similares.

## Limitaciones y advertencias

- La longitud de contexto está limitada a 896 tokens por diseño, muy por debajo de los 128K del modelo base. Esto se debe a un bug observado en SM8850: al superar 1 MiB en la concatenación de la máscara de decode, la NPU aplica la máscara a filas incorrectas y la calidad colapsa (12/45 correctos con cache 1024 o 960). El autor lo ha reportado en el issue #1184 de litert-torch.
- Cada carga del modelo recompila el grafo en la NPU, lo que tarda aproximadamente 16 segundos en SM8850. No hay caché de compilación, lo que hace inviable reinicios frecuentes del proceso en producción.
- Solo se ha verificado en un SoC concreto (SM8850) y una versión específica de runtime. Otros SoC Qualcomm o versiones de LiteRT-LM no están probados y podrían fallar o degradar el rendimiento.
- El autor advierte de una "trampa de fallback silencioso a CPU": si la configuración es incorrecta, el modelo puede ejecutarse en CPU sin error aparente, lo que da una falsa sensación de éxito. Se recomienda seguir la receta documentada.
- La cuantización estática puede introducir degradación de calidad en tareas sensibles, aunque la prueba de 45 prompts muestra resultados similares al fp32 (29 vs 28 correctos).
- La licencia Gemma impone términos de uso y una política de usos prohibidos. El uso comercial está permitido bajo esas condiciones, pero debe revisarse la documentación oficial de Google.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de esta conversión. Se asumen las del modelo base, que al ser pequeño puede tener mayor tendencia a errores factuales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mlboydaisuke/gemma-3-270m-it-NPU-LiteRT
- Modelo base (instrucciones): https://huggingface.co/google/gemma-3-270m-it
- Modelo base (general): https://huggingface.co/google/gemma-3-270m
- Blog de Google Developers sobre Gemma 3 270M: https://developers.googleblog.com/en/introducing-gemma-3-270m/
- Reporte técnico de Gemma 3 (arXiv): https://arxiv.org/html/2503.19786v1
- Página oficial de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Issue de litert-torch #1184 (bug de máscara): https://github.com/google-ai-edge/litert-torch/issues/1184
- PR #1178 de litert-torch (fix abierto): https://github.com/google-ai-edge/litert-torch/pull/1178
- Receta Android NPU (repositorio del autor): https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-npu.md
