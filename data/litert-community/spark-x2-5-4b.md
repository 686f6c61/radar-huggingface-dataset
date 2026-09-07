# litert-community/Spark-X2.5-4B

## Resumen

Spark-X2.5-4B es un modelo de lenguaje denso de 4.11B parámetros desarrollado por el equipo SparkLLM de iFLYTEK, disponible como conversión al formato LiteRT-LM (.litertlm) por litert-community. Su arquitectura combina atención híbrida: tres capas de sliding-window por cada capa de atención completa, con gates de salida sigmoid por cabeza, MLPs exact-GELU y un vocabulario tied de 131.072 entradas. En su versión original maneja un contexto nativo de 1M tokens; la conversión a LiteRT-LM, sin embargo, limita el presupuesto de KV a 4096 tokens.

Es un modelo de razonamiento que genera sus respuestas dentro de etiquetas `` antes de dar la respuesta final. La conversión ofrece dos builds cuantizados (int8 de 4.24 GB e int4 de 2.48 GB) pensados para inferencia on-device con el runtime de Google LiteRT-LM, manteniendo la paridad con la referencia bf16 en GSM8K (94%). Su licencia Apache-2.0 y su carácter compacto lo hacen relevante para aplicaciones locales en dispositivos como Macs y móviles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding-window + full attention), 36 capas, hidden 2560, 16 query heads / 4 KV heads de 256 |
| Parámetros totales | 4.11B |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1M tokens (original); 4096 tokens (KV budget en la conversión LiteRT-LM) |
| Tipos de cuantización | int8 dinámico en linears + embedding (4.24 GB); int4 blockwise-128 + OCTAV en linears, embedding int8 (2.48 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base es un decoder denso de 4.11B parámetros con 36 capas, dimensión oculta de 2560, 16 cabezas de consulta y 4 cabezas clave-valor de tamaño 256. Aplica una atención híbrida en la que cada tres capas de sliding-window (ventana de 512) se intercalan con una capa de atención completa, y añade un gate de salida sigmoid por cabeza. Las MLPs usan activación exact-GELU. El vocabulario está tied y consta de 131.072 entradas. El modelo es de razonamiento: durante la generación, las etiquetas de apertura ``. El runtime puede leer o limitar el razonamiento por separado mediante `ThinkingConfig` o un presupuesto de pensamiento.
- Razonamiento matemático. En GSM8K (greedy, 0-shot chain-of-thought, n=100) alcanza 94% tanto en bf16 como en las versiones int8 e int4.
- Capacidades de código, traducción y escritura según el repositorio del modelo original, aunque no se especifican listas de idiomas ni se aportan benchmarks para estas tareas.
- Capacidades de tool use y flujos agénticos en el modelo original. La conversión LiteRT-LM no incluye el formateo de tool calls, por lo que estas capacidades requieren el modelo base en otro runtime.
- Sin capacidades de visión ni de audio: el modelo es puramente texto (pipeline text-generation).

## Casos de uso

- Asistente de razonamiento en el dispositivo. El modelo puede ejecutarse en un Mac o dispositivo móvil con LiteRT-LM; su modo de pensamiento permite resolver problemas matemáticos y lógicos sin conexión. La versión int4 (2.48 GB) es la recomendada por tamaño y velocidad de decodificación (53.6 tok/s en GPU Metal).
- Aplicaciones con requisitos de privacidad. Al ejecutarse localmente, los datos no salen del dispositivo. El canal `thought` permite mostrar solo la respuesta final al usuario, ocultando la cadena de razonamiento.
- Tutoría de matemáticas. Con 94% en GSM8K y generación por pasos, es adecuado para explicar problemas de matemáticas en un entorno educativo sin conexión.
- Asistente de redacción en el borde. El modelo es de propósito general y admite escritura y traducción; puede integrarse en editores de texto o herramientas de productividad locales.
- Generación de código en un entorno local. Aunque no se ofrecen benchmarks de código, el repositorio del modelo original indica soporte de coding. La cuantización int4 permite ejecutarlo en portátiles con GPU.
- Investigación de agentes locales. La arquitectura y el modo de pensamiento pueden utilizarse para experimentar con workflows agénticos en entornos restringidos, siempre que se use el modelo base para el tool calling.

Nota: para tool calling, es necesario usar el modelo original `XHToken/Spark-X2.5-4B` en un runtime que soporte el formato de herramientas, ya que la conversión LiteRT-LM no lo incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.) en la información disponible. Los únicos datos de evaluación son los de GSM8K, que se muestran a continuación.

| Configuración | GSM8K |
|---|---|
| PyTorch bf16 (referencia, MPS) | 94% (6 sin terminar al límite de 3584 tokens) |
| LiteRT int8 | 94% (7 sin terminar al límite de 3584 tokens) |
| LiteRT int4 | 94% (7 sin terminar al límite de 3584 tokens) |

Condiciones: greedy, 0-shot chain-of-thought, 3584 tokens de salida, n=100.

Rendimiento de inferencia (Apple M4 Max, litert-lm 0.17.0, prefill 256, decode 256, 3 runs, cache no):

| Archivo | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int8 | GPU (Metal) | 784 tok/s | 49.4 tok/s | 0.35 s | 4.1 s |
| int8 | CPU | 345 tok/s | 19.5 tok/s | 0.79 s | 27.0 s |
| int4 | GPU (Metal) | 826 tok/s | 53.6 tok/s | 0.33 s | 3.7 s |
| int4 | CPU | 118 tok/s | 18.4 tok/s | 2.24 s | 5.3 s |

No se han incluido filas para Galaxy S26 ni iPhone 17 Pro porque las mediciones aún no están disponibles.

## Requisitos de hardware

- Tamaño de los archivos: 2.48 GB (int4) y 4.24 GB (int8). La VRAM necesaria será al menos el tamaño del modelo más el overhead del runtime, pero no se proporcionan cifras oficiales en la información.
- El proveedor recomienda el archivo int4 por su menor tamaño y su mayor velocidad de decodificación en GPU (53.6 vs 49.4 tok/s).
- Las mediciones se realizaron en un Apple M4 Max con backend Metal (GPU) y CPU. No se especifican requisitos para GPU NVIDIA.
- Opciones de despliegue: runtime de LiteRT-LM (CLI y API de Python), versión 0.17.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: prefill entre 118 y 826 tok/s, decode entre 18.4 y 53.6 tok/s, TTFT entre 0.33 y 2.24 s, init entre 3.7 y 27.0 s, según el benchmark en M4 Max.
- Para modelos de razonamiento, se recomienda un presupuesto de salida de al menos 2048 tokens (3584 para matemáticas), ya que si se trunca el pensamiento el modelo no produce respuesta final.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos. El repositorio del modelo original menciona una variante Spark-X2.5-1.7B, pero no se detallan especificaciones ni resultados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La conversión LiteRT-LM reduce el contexto efectivo a 4096 tokens (KV budget), muy por debajo del contexto nativo de 1M tokens del modelo original. Esto limita el uso con documentos largos.
- La conversión no incluye el formateo de tool calls. Aunque el modelo original soporta herramientas y agentes, la conversión solo maneja la plantilla de chat y el canal de pensamiento.
- El rendimiento en GSM8K depende de un presupuesto de salida amplio (3584 tokens). Con un límite de 2048, el modelo truncado produce respuestas incompletas.
- Con las activaciones GPU fp32 declaradas, tanto int8 como int4 alcanzan 94% en GSM8K; sin embargo, con las activaciones GPU fp16 por defecto del runtime, el int8 anota 84. Es necesario configurar las activaciones en fp32 para mantener la paridad.
- Los datos de rendimiento se han medido únicamente en Apple M4 Max; no hay resultados verificados para Android (Galaxy S26) ni iOS (iPhone 17 Pro).
- No se han publicado evaluaciones de sesgos, robustez frente a alucinaciones ni de seguridad. Como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado.
- Los archivos .litertlm son específicos del runtime LiteRT-LM y no son directamente utilizables con otros motores de inferencia.

## Enlaces

- https://huggingface.co/litert-community/Spark-X2.5-4B
- https://huggingface.co/XHToken/Spark-X2.5-4B
- https://github.com/XHToken/Spark-X2.5
- https://github.com/XHToken/Spark-X2.5/blob/main/README.md
- https://github.com/google-ai-edge/litert-lm
- https://github.com/google-ai-edge/litert-torch
- https://github.com/john-rocky/hf-to-litertlm
