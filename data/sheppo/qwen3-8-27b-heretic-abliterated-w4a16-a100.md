# sheppo/Qwen3.8-27B-Heretic-Abliterated-W4A16-A100

## Resumen

Qwen3.8-27B-Heretic-Abliterated-W4A16-A100 es un checkpoint W4A16 (pesos de 4 bits, activaciones de 16 bits) derivado del modelo Qwen3.8-27B, un transformador denso de 27 mil millones de parametros con atencion hibrida (Gated DeltaNet lineal + atencion completa). El autor, sheppo, parte de la revision exacta `RVN-BF16.gguf` del repositorio `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF`, que ya habia sido sometido a un proceso de "abliteracion" para eliminar rechazos del modelo original, y lo cuantiza con AutoRound en modo simetrico W4A16 con grupo de tamano 128.

El resultado es un modelo de texto puro, compatible con vLLM, pensado para inferencia de alta velocidad en GPU A100 de 80 GB. La model card reporta 73,15 tokens por segundo en modo crudo y 138,38 tokens por segundo (1,89x de aceleracion) cuando se combina con el runtime acelerado DFlash2 y su drafter de 7 tokens. El repositorio incluye verificaciones de calidad (comparacion ciega de 36 pares de respuestas) y una bateria de pruebas de integridad (carga en vLLM, JSON estructurado, tool calling, etc.).

La relevancia de este modelo reside en su doble proposito: por un lado, ofrece una version cuantizada y optimizada para servidores de una variante "uncensored" de Qwen3.8, y por otro, documenta de forma transparente el proceso de conversion desde GGUF a W4A16, incluyendo los fallos encontrados y las correcciones aplicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, hybrid attention: Gated DeltaNet linear + full attention) |
| Parametros totales | 5.799.960.864 (5,8B, tras cuantizacion W4A16) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 simetrico, group size 128 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (13 archivos, 17,7 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27B parametros con una arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con atencion full. La variante "Heretic-Abliterated" aplica una tecnica de "abliteracion" sobre el modelo original, que elimina los rechazos del modelo ante prompts que el considera peligrosos, modificando los tensores del modelo para reducir la probabilidad de respuestas de rechazo.

El checkpoint presentado en este repositorio no es un entrenamiento desde cero, sino una cuantizacion W4A16 del archivo GGUF `RVN-BF16.gguf` (53,8 GB) del repositorio 0bserverx. El proceso de conversion fue complejo: el primer intento fallo porque el convertidor GGUF de Qwen3.8 altera varias representaciones de tensores. La solucion fue invertir el shift de norm no-GDN, la transformada `A_log` de tiempo continuo y el layout de value-head de Gated DeltaNet antes de aplicar AutoRound. Despues de la conversion, se verifico que los 851 tensores coincidieran en nombre y forma, que todos los valores fueran finitos, y que la salida BF16 fuera determinista.

La cuantizacion se realizo con AutoRound (revision `96ce448039b3c36fa879b9f4c740a8ee50c0f9ba`) con seed 42. El modelo no aplica un "fast overlay" del Qwen base, para preservar las modificaciones RVN.

## Capacidades

- Generacion de texto con chat template de Qwen3.8 (multiturno, conversacional).
- Razonamiento y escritura de prosa: validado con una bateria de 36 pares de respuestas en una comparativa ciega.
- Salida estructurada: soporta JSON estructurado y parseo automatico de tool calls.
- Compatible con vLLM para inferencia en produccion.
- Decodificacion especulativa: el runtime DFlash2 con 7 tokens de draco acelera la inferencia 1,89x en prosa muestreada (138 tok/s vs 73 tok/s).
- Modelo de solo texto (`--language-model-only`).
- Multilingue: el modelo base Qwen3.8 es multilingue, pero la model card no especifica los idiomas de este checkpoint.
- Sin modo "thinking" (pensamiento) activado por defecto; se puede activar via configuracion.

## Casos de uso

- Inferencia de alta velocidad en A100 80 GB: el caso de uso principal es servir este modelo en una sola A100 con vLLM, aprovechando la cuantizacion W4A16 y el runtime DFlash2 para obtener 138 tok/s en prosa muestreada.
- Despliegue de un modelo "uncensored" para investigacion: la abliteracion elimina rechazos, lo que puede ser util en entornos de investigacion de seguridad y alineacion donde se necesita estudiar el comportamiento del modelo sin filtros.
- Generacion de texto de alta calidad con presupuesto de VRAM ajustado: con solo 17,7 GB de pesos, el modelo cabe en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090/4090) en modo crudo, aunque el rendimiento optimo se logra en A100.
- Desarrollo de agentes conversacionales: la validacion de tool calling y JSON estructurado lo hacen util para construir asistentes que necesitan llamar funciones externas.
- Benchmarking de tecnicas de cuantizacion: el repositorio documenta el proceso de conversion de GGUF a W4A16 con AutoRound, incluyendo los fallos y correcciones, sirviendo como referencia para proyectos similares.
- Investigacion sobre decodificacion especulativa: el proyecto acompanante (qwen38-a100-fastpath) permite comparar el rendimiento entre el modo crudo y el modo especulativo (DFlash2) sobre el mismo modelo, siendo util para estudiar el impacto de esta tecnica en la calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de velocidad de inferencia en una A100-SXM4-80GB, con concurrency 1, temperatura 0.8, top-p 0.95, top-k 20, thinking off y una carga de trabajo de 8 prompts de prosa:

| Modo de servicio | Mediana tok/s | Media tok/s | TTFT mediano |
| --- | ---: | ---: | ---: |
| RVN W4A16 crudo | 73,15 | 73,31 | 132 ms |
| RVN + DFlash2 (k=7) | 138,38 | 148,89 | 155 ms |

En una prueba separada con story greedy (determinista), se midio 152,30 tok/s en C1 y 609,87 tok/s agregado en C8.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 17,7 GB en disco. Con W4A16, la VRAM necesaria ronda los 18-20 GB (incluyendo overhead de vLLM). Cabe en GPUs de 24 GB (RTX 3090/4090, A5000) y, por supuesto, en A100 80 GB.
- GPU recomendadas: A100-SXM4-80GB (probada), A100 40 GB (probada con el modelo Qwen base regular, no con este checkpoint), RTX 3090/4090 (posible pero no verificado).
- Despliegue: vLLM (probado), llama.cpp (no mencionado), Ollama (no mencionado), TGI (no mencionado).
- Latencia: TTFT de 132 ms (crudo) y 155 ms (DFlash2) en A100.
- Throughput: 73-138 tok/s en C1, 609 tok/s agregado en C8 con story greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B (BF16) | BF16 | No disponible | Apache-2.0 | No reportado |
| Qwen3.8-27B-Heretic-Abliterated-W4A16 (este) | 5,8B (W4A16) | W4A16 | No disponible | Apache-2.0 | 73-138 tok/s en A100 |
| Qwen3.8-27B-Uncensored-FP8 | 27B | FP8 | No disponible | No disponible | No reportado |
| Qwen3.8-27B-Heretic (GGUF) | 27B | BF16 | No disponible | Apache-2.0 | No reportado |

Nota: el modelo base Qwen3.8-27B no esta disponible en cuantizacion W4A16 en este repositorio. La comparativa directa con el modelo base sin cuantizar no se puede realizar con los datos disponibles.

## Limitaciones y advertencias

- Abliteracion: la tecnica de abliteracion cambia el comportamiento del modelo. El autor recomienda probar el checkpoint con prompts propios y requisitos especificos antes de usarlo en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de calidad de las respuestas (MMLU, etc.). La unica validacion es una bateria de 36 pares de respuestas con un evaluador LLM, que no cubre el espacio completo de posibles salidas.
- Sesgos: al ser un modelo "uncensored", puede generar contenido inapropiado, ofensivo o peligroso. No se recomienda su uso en aplicaciones publicas sin moderacion.
- Compatibilidad: el checkpoint esta verificado en A100 80 GB. Aunque el autor menciona que el Qwen base se verifico en A100 40 GB, no se garantiza el mismo rendimiento en otras GPUs.
- Cuantizacion: la cuantizacion W4A16 puede degradar la calidad de las respuestas en comparacion con BF16, especialmente en tareas que requieren alta precision.
- Decodificacion especulativa: el modo DFlash2 cambia la distribucion de las respuestas (no es deterministico byte a byte). La bateria de calidad no detecto degradacion, pero la identidad de los bytes no esta garantizada.
- No deterministico: AutoRound aviso que Flash Attention es no determinista, por lo que cuatro de los catorce hashes de salida cambiaron entre ejecuciones.
- Sin evaluaciones de seguridad: no hay datos sobre el rendimiento en tareas de seguridad, sesgos o toxicidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sheppo/Qwen3.8-27B-Heretic-Abliterated-W4A16-A100
- Repositorio de origen (GGUF abliterado): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de runtime acelerado (DFlash2): https://github.com/elsheppo/qwen38-a100-fastpath
- Repositorio del drafter DFlash2: https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- Blog sobre Qwen3.8-27B-Uncensored-FP8 (comparativa): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-fp8
- Guia de descarga de Qwen3.8-27B: https://www.orcarouter.ai/blog/qwen-3-8-27b-huggingface
