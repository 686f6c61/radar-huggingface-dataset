# litert-community/Spark-X2.5-4B

## Resumen

Spark-X2.5-4B es un modelo de lenguaje denso de 4,11 mil millones de parámetros desarrollado por el equipo SparkLLM de iFLYTEK (XHToken), publicado en agosto de 2026. Se trata de un modelo orientado al razonamiento que resuelve problemas dentro de bloques `<think>…</think>` antes de emitir la respuesta final. Esta ficha concreta, publicada por `litert-community`, es una conversión del modelo original al formato `.litertlm` de Google LiteRT-LM, pensada para inferencia en dispositivo (on-device) y en el borde (edge).

La arquitectura es un decoder transformer denso de 36 capas con dimensión oculta de 2560, 16 cabezas de consulta y 4 cabezas KV de 256 dimensiones, con un esquema de atención híbrida que intercala tres capas de ventana deslizante (512 tokens) por cada capa de atención completa. Incorpora puertas sigmoideas por cabeza sobre la salida de atención, MLPs con compuertas y activación GELU exacta, y un vocabulario atado de 131.072 entradas. El modelo original declara un contexto nativo de 1M de tokens.

La relevancia de esta versión radica en su empaquetado: dos ficheros (int8 de 4.238 MB e int4 de 2.482 MB) listos para ejecutarse con el runtime LiteRT-LM en GPU y CPU de dispositivos móviles y equipos de sobremesa, con paridad de precisión respecto al modelo de referencia en bf16 según las mediciones del autor, y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso con atención híbrida (3 capas de ventana deslizante de 512 tokens : 1 capa de atención completa), puertas sigmoideas por cabeza en la salida de atención, MLPs con compuertas y GELU exacta |
| Parametros totales | 4,11 mil millones (dense) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens en el modelo original; el bundle LiteRT-LM no declara una ventana efectiva distinta |
| Tipos de cuantizacion | int8 dinámica en lineales y embedding; int4 blockwise-128 + OCTAV en lineales con embedding int8 externalizado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base `XHToken/Spark-X2.5-4B` se distribuye en safetensors |

Detalles de configuración: 36 capas, hidden size 2560, 16 cabezas de consulta y 4 cabezas KV de dimensión 256, vocabulario atado de 131.072 entradas, tokenizador BPE byte-level.

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 4,11B parámetros con una disposición de atención híbrida poco habitual: por cada capa de atención completa se intercalan tres capas con ventana deslizante de 512 tokens, lo que reduce el coste de atención en secuencias largas manteniendo capacidad de recuperación global. Sobre la salida de atención se aplican puertas sigmoideas por cabeza, y los MLPs usan compuertas con activación GELU exacta. El vocabulario está atado entre embedding de entrada y proyección de salida, con 131.072 entradas. El modelo original declara un contexto nativo de 1M de tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la información proporcionada. La model card de esta conversión se centra en el proceso de cuantización y validación: los bundles int8 e int4 se generaron a partir del modelo base y se validaron contra una referencia en bf16 ejecutada en PyTorch sobre MPS, con paridad de resultados en GSM8K. El bundle declara un canal `thought` en los metadatos, de modo que el runtime separa el razonamiento de la respuesta final y puede aplicar un presupuesto de pensamiento; el prompt de generación prellena la apertura de `<think>` igual que la plantilla de chat del proveedor. El 21 de septiembre de 2026 se actualizó la plantilla de chat para aceptar la forma de content-parts de la versión 0.18 del runtime, sin cambios en pesos, tokenizador ni metadatos del ejecutor.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo elabora cadenas de pensamiento dentro de `<think>…</think>` antes de responder, con canal `thought` separado en el runtime.
- Razonamiento matemático y aritmético de varios pasos, validado con GSM8K en modo chain-of-thought 0-shot.
- Presupuesto de pensamiento configurable: los runtimes que exponen `ThinkingConfig` pueden limitar o leer el razonamiento por separado; `enable_thinking: false` renderiza la plantilla del proveedor sin la apertura de pensamiento.
- Conversación multiturno: validado con conversaciones de tres turnos (plantar un hecho, operar aritméticamente, recordar el hecho) en los dos ficheros, sin fugas de `<think>` en las respuestas.
- Soporte multilingüe: no disponible en la información proporcionada; el tokenizador se validó con cadenas Latin-1, Extended-A, emoji, CJK, dígitos y espacios, pero no se declaran idiomas soportados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explícita más allá del razonamiento interno del bloque de pensamiento.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente de razonamiento en dispositivo móvil: el bundle int4 (2,48 GB) se ejecuta en un Galaxy S26 con LiteRT-LM 0.16.0 a 4,9 tok/s de decodificación en GPU y 5,5 tok/s en CPU, con un pico de memoria de 2,0 GB en GPU frente a 3,5 GB en CPU. Adecuado para asistentes offline que priorizan privacidad y memoria sobre velocidad.
- Resolución de problemas matemáticos en el borde: con paridad del 94% en GSM8K respecto a la referencia bf16, el modelo sirve para tutores o correctores aritméticos locales, siempre que se le conceda un presupuesto de salida de al menos 3.584 tokens para completar el razonamiento.
- Chat web sin instalación: el demo de LiteRT-LM carga `Spark-X2.5-4B_int4.litertlm` (descarga de 2,48 GB) y lo ejecuta con WebGPU en el navegador, útil para demos, evaluación rápida y prototipos sin backend.
- Inferencia en estación de trabajo con GPU integrada: en un Mac Studio M4 Max con LiteRT-LM 0.17.0, el fichero int4 alcanza 53,6 tok/s de decodificación y 826 tok/s de prefill con TTFT de 329 ms, suficiente para asistentes interactivos de escritorio.
- Procesamiento por lotes en CPU con ventanas de contexto largas: el fichero int8 es el recomendado para prefill en CPU (345 tok/s frente a 118 tok/s del int4 en el Mac), útil en pipelines que ingieren documentos largos aprovechando el contexto nativo de 1M tokens del modelo original.
- Aplicaciones de razonamiento con separación de trazas: gracias al canal `thought` declarado en el bundle, se puede auditar o registrar el razonamiento por separado de la respuesta final, lo que encaja en entornos con requisitos de trazabilidad o de control de coste de cómputo mediante presupuesto de pensamiento.

## Benchmarks y rendimiento

Precisión en GSM8K (greedy, 0-shot chain-of-thought, 3.584 tokens de salida, n=100, mismo prompt y extracción de respuesta en todas las filas; filas LiteRT ejecutadas en el motor litert-lm 0.17.0 con backend GPU y puntuadas sobre el texto posterior al canal de pensamiento):

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia, MPS) | 94% (6 sin terminar en el límite de 3.584 tokens) |
| LiteRT int8 | 94% (7 sin terminar en el límite de 3.584 tokens) |
| LiteRT int4 | 94% (7 sin terminar en el límite de 3.584 tokens) |

Rendimiento medido en dispositivo (edge-compat, 7 de septiembre de 2026):

| Dispositivo | Runtime / backend | Fichero | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0, GPU | int4 | 4,9 | 56 | 3,98 s |
| Galaxy S26 | LiteRT-LM 0.16.0, CPU | int4 | 5,5 | 35 | 6,31 s |
| Mac Studio M4 Max | LiteRT-LM 0.17.0, GPU | int4 | 53,6 | 826 | 329 ms |
| Mac Studio M4 Max | LiteRT-LM 0.17.0, GPU | int8 | 49,4 | 784 | 347 ms |
| Galaxy S26 | LiteRT-LM 0.16.0, CPU | int8 | 4,5 | 65 | 3,49 s |
| Mac Studio M4 Max | LiteRT-LM 0.17.0, CPU | int8 | 19,5 | 345 | 792 ms |

En el Galaxy S26, las 2.233 operaciones del grafo se delegaron a la GPU. Con activaciones fp32 en GPU declaradas en el bundle, ambas cuantizaciones alcanzan paridad con bf16; con las activaciones fp16 por defecto del runtime, los mismos pesos int8 puntuaron 84 en GSM8K.

## Requisitos de hardware

- VRAM/memoria: el fichero int4 ocupa 2.482 MB en disco y registró un pico de 2,0 GB en GPU y 3,5 GB en CPU en el Galaxy S26; el fichero int8 ocupa 4.238 MB en disco.
- GPU recomendadas: no se publican requisitos mínimos de GPU de escritorio; las mediciones disponibles cubren GPU móvil (Galaxy S26, ruta OpenCL con activaciones fp32) y GPU integrada de Apple M4 Max. Para GPUs dedicadas tipo A100, H100 o RTX 4090 no hay datos en la información proporcionada.
- GPU de consumo: el modelo cabe en cualquier GPU de consumo moderna en int4 (2,48 GB) e int8 (4,24 GB) por tamaño, pero no se han publicado mediciones en tarjetas dedicadas de consumo.
- Despliegue: runtime LiteRT-LM (CLI `litert-lm run`, API de Python y demo web con WebGPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: ver tabla de benchmarks. En móvil el modelo ronda los 5 tok/s en todas las rutas medidas; en Mac Studio M4 Max con GPU alcanza 53,6 tok/s de decodificación y 826 tok/s de prefill con el fichero int4.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La model card únicamente compara las tres configuraciones del propio modelo (bf16 de referencia, int8 e int4 de LiteRT-LM) en GSM8K y rendimiento en dispositivo. Como referencia de categoría, el modelo base `XHToken/Spark-X2.5-4B` es la alternativa directa en formato PyTorch/safetensors para inferencia en servidor; no se dispone de comparaciones con otros modelos de 4B en la información disponible.

## Limitaciones y advertencias

- Modelo de razonamiento: si se trunca la salida a mitad del bloque de pensamiento, el modelo no produce respuesta final. Es imprescindible un presupuesto de al menos 2.048 tokens y de 3.584 tokens para matemáticas.
- En GSM8K, entre 6 y 7 de cada 100 preguntas no terminaron dentro del límite de 3.584 tokens, tanto en la referencia bf16 como en las versiones cuantizadas.
- Las activaciones fp16 por defecto del runtime degradan la precisión de los pesos int8 (84% frente a 94% en GSM8K); es necesario declarar activaciones fp32 en GPU en el bundle para mantener la paridad.
- En el Galaxy S26 la ruta GPU no supera a la CPU en velocidad (4,9 frente a 5,5 tok/s con int4); la elección debe hacerse por memoria (2,0 GB en GPU frente a 3,5 GB en CPU), no por rendimiento.
- Idiomas soportados no declarados: no hay garantía documentada de calidad multilingüe más allá de la validación del tokenizador con cadenas Latin-1, Extended-A, emoji y CJK.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se indican restricciones adicionales en la información disponible.
- El ecosistema de despliegue está limitado a LiteRT-LM; no se documenta compatibilidad con servidores de inferencia convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Spark-X2.5-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Spark-X2.5-4B
- Registro de mediciones edge-compat, int4: https://github.com/john-rocky/edge-compat/blob/main/cards/spark-x2.5-4b-int4/CARD.md
- Registro de mediciones edge-compat, int8: https://github.com/john-rocky/edge-compat/blob/main/cards/spark-x2.5-4b-int8/CARD.md
