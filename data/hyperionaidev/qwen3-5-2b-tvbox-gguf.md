# hyperionaidev/Qwen3.5-2B-tvbox-GGUF

## Resumen

Qwen3.5-2B-tvbox-GGUF es una cuantización GGUF extrema del modelo Qwen3.5-2B de Alibaba Qwen, publicada por el desarrollador independiente hyperionaidev dentro del proyecto "smolmaxxing". No es una cuantización convencional: incorpora una cabeza de salida podada a 65.672 filas de las 248.320 del vocabulario original, seleccionadas por frecuencia de token en un corpus inglés y multilingüe. El objetivo declarado es ejecutar el modelo en hardware de gama ultra baja, concretamente una Xiaomi TV Box S (3.ª generación) con cuatro núcleos Cortex-A55 y aproximadamente 1 GB de RAM utilizable.

El modelo base Qwen3.5-2B tiene 2.077.215.176 parámetros según los pesos en safetensors, y esta variante ocupa 1,18 GB en disco (0,99 GB en RAM durante la inferencia). En esa TV box alcanza 7,7 tok/s en chat real y 17,8 tok/s de procesamiento de prompt, con una perplejidad de 0,909 bits por byte sobre un texto fijo de 22 KB.

La relevancia de esta ficha es doble: por un lado demuestra hasta dónde se puede comprimir un transformer de 2B para inferencia en CPU con poca memoria; por otro, introduce dependencias fuertes que rompen la compatibilidad con el ecosistema estándar (llama.cpp, LM Studio, Ollama), lo que la hace inadecuada para la mayoría de despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B); la ficha del autor menciona un bloque MTP (multi-token prediction) como capa 24 y estado DeltaNet, sin más detalle en la información disponible |
| Parametros totales | 2.077.215.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el comando de ejemplo usa `-c 1024`) |
| Tipos de cuantizacion | Q4_K puro en todos los tensores, incluidos embedding y cabeza, con imatrix de unsloth |
| Idiomas soportados | no disponible (la cabeza podada se eligió con corpus inglés y multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`w-q4k-h65p8.gguf`, 1,18 GB, SHA-256 `631a27ae8926d3fd18cdc7f0276700edd784406a4c6218b5e6e664a4cf54fd11`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer de 2B parámetros desarrollado por Qwen (Alibaba). La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; la model card de esta cuantización no los reproduce. El autor sí menciona que el modelo incorpora un bloque de predicción multi-token (MTP) que aquí se incluye como capa 24 con `nextn_predict_layers=1`, desactivado por defecto porque en la versión 2B en RAM la especulación degradó el rendimiento (referencia E31 del proyecto).

La innovación de esta variante es la poda de la cabeza de salida: se conservan 65.672 de las 248.320 filas del vocabulario, elegidas por frecuencia de token en un corpus inglés y multilingüe, y se añade un tensor `output_ids`. El recuento se redondea a múltiplo de 8 para que el backend de CPU repacke la cabeza (+5,8 % de velocidad). Los prompts pueden usar cualquier token del vocabulario original, pero la generación queda restringida a la cabeza podada: el 1,3 % de las posiciones de texto en inglés y el 12,6 % en multilingüe caen fuera de ella. La cuantización se hizo en la propia TV box a partir de la conversión BF16 de unsloth y su imatrix, e incluye el bloque MTP extraído de Qwen/Qwen3.5-2B.

## Capacidades

- Generación de texto conversacional en inglés y multilingüe, con la limitación de vocabulario de salida descrita arriba.
- Razonamiento y respuesta a prompts generales heredados del modelo base Qwen3.5-2B.
- Modo de razonamiento desactivable mediante el flag `--reasoning off` de llama-server.
- Predicción multi-token (MTP) disponible en el archivo, aunque desactivada por defecto por pérdida de rendimiento en este tamaño.
- Inferencia en CPU pura sin GPU, con estado DeltaNet en fp16 mediante `LLAMA_STATE_F16=1` (+11 % en chat).
- Tool calling, function calling, capacidades de agente y visión: no disponible en la información proporcionada para esta variante.

## Casos de uso

- Chat local en hardware embebido: el caso documentado por el autor es una Xiaomi TV Box S con 4× Cortex-A55 y ~1 GB de RAM, donde el modelo sostiene conversación a 7,7 tok/s. Sirve para asistentes de voz o texto en dispositivos sin GPU.
- Kioscos y paneles informativos offline: con 0,99 GB en RAM y contexto de 1024 tokens configurado, cabe en dispositivos tipo Raspberry Pi o mini-PC de bajo coste para respuestas guiadas y FAQ.
- Prototipado de pipelines de generación de texto en entornos sin acelerador: permite validar prompts y flujos antes de migrar a una cuantización estándar o a una GPU.
- Investigación sobre compresión de vocabulario: la cabeza podada con `output_ids` es un caso de estudio reproducible para medir el impacto de recortar el vocabulario de salida en calidad (bits por byte) y velocidad.
- Educación y demostraciones de llama.cpp parcheado: útil para explicar cuantización Q4_K, imatrix y repacking de CPU en cursos o talleres.
- Evaluación comparativa de cuantizaciones en hardware limitado: el autor publica métricas de perplejidad en bits por byte que permiten comparar modelos con tokenizadores distintos de forma justa.

## Benchmarks y rendimiento

| Metrica | Valor | Entorno |
|---|---|---|
| Chat real | 7,7 tok/s | Xiaomi TV Box S (3.ª gen), 4× Cortex-A55, ~1 GB RAM |
| Procesamiento de prompt | 17,8 tok/s | mismo entorno |
| Calidad (perplejidad) | 0,909 bits/byte | texto fijo de 22 KB en inglés |
| Memoria en inferencia | 0,99 GB | mismo entorno |
| Tamano del archivo | 1,18 GB | GGUF Q4_K con bloque MTP |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el caso documentado; la inferencia es en CPU. En RAM se necesitan aproximadamente 0,99 GB para el modelo y algo más para el contexto (con `-c 1024` y `-ub 128`).
- GPU recomendadas: no disponible; el autor no documenta ejecución en GPU para esta variante.
- CPU: el caso de referencia es un SoC ARM de 4 núcleos Cortex-A55. El comando de ejemplo usa `-t 3` (tres hilos).
- ¿Cabe en GPU de consumo? No hay datos; el archivo requiere el llama.cpp parcheado del repositorio smolmaxxing, por lo que no se puede cargar en LM Studio, Ollama ni llama.cpp estándar.
- Opciones de despliegue: únicamente `llama-server` del fork parcheado (`patches/llama.cpp-v0.8.0-tvbox.patch` sobre llama.cpp en el commit `8642541`). El script `tv-llm-ui/start.sh` del repositorio arranca el modelo con los ajustes del autor.
- Latencia y throughput: 7,7 tok/s de generación y 17,8 tok/s de prompt en la TV box; no hay mediciones en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| hyperionaidev/Qwen3.5-2B-tvbox-GGUF | 2,08B | no disponible | GGUF Q4_K con cabeza podada | Apache-2.0 | Requiere llama.cpp parcheado; 0,99 GB en RAM; 7,7 tok/s en TV box |
| Qwen/Qwen3.5-2B | 2,08B | no disponible | safetensors (Transformers) | Apache-2.0 | Modelo base original, sin poda de vocabulario |
| unsloth/Qwen3.5-2B-GGUF | 2,08B | no disponible | GGUF BF16 + imatrix | Apache-2.0 | Conversión BF16 e imatrix usadas como fuente; compatible con llama.cpp estándar |
| DevQuasar/Qwen.Qwen3.5-2B-GGUF | 2,08B | no disponible | GGUF | Apache-2.0 | Cuantización GGUF convencional del mismo modelo base |

## Limitaciones y advertencias

- Incompatibilidad de runtime: el archivo no carga en llama.cpp estándar, LM Studio ni Ollama; exige el fork parcheado de smolmaxxing.
- Cabeza de salida podada: el modelo no puede generar el 1,3 % de las posiciones de texto en inglés ni el 12,6 % en multilingüe, lo que produce errores léxicos y tokens extraños en dominios poco representados en el corpus de selección.
- Contexto corto en la configuración de referencia: el comando de ejemplo usa `-c 1024`; no se documenta la longitud de contexto nativa del modelo base en esta ficha.
- Riesgo de alucinación: inherente a un modelo de 2B; la poda de vocabulario puede agravarlo en temas especializados.
- Sesgos: no documentados por el autor; heredados del corpus de entrenamiento del modelo base y del corpus usado para elegir la cabeza.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la obligación de usar un fork parcheado añade coste de mantenimiento y riesgo de seguridad en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto de investigación personal, sin soporte ni garantías.
- El flag `LLAMA_STATE_F16=1` no se puede combinar con la especulación MTP (provoca un assert según el autor).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyperionaidev/Qwen3.5-2B-tvbox-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Conversión BF16 e imatrix: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Cuantización GGUF alternativa: https://huggingface.co/DevQuasar/Qwen.Qwen3.5-2B-GGUF
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documento de experimentos (secciones 11, 16 y 17): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
