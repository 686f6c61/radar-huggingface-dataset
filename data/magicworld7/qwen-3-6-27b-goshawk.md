# magicworld7/Qwen-3.6-27B-Goshawk

## Resumen

Qwen-3.6-27B-Goshawk es un checkpoint de visión-lenguaje de 27 360 632 560 parámetros publicado por el usuario magicworld7 en HuggingFace. Se trata de una redistribución cuantizada a FP8 del modelo computer-vision-ai-lab/Qwen-3.6-27B-AmberKite, que a su vez deriva de la familia Qwen3.6-27B de Alibaba Cloud. El modelo está pensado para servirse directamente en vLLM mediante el formato `compressed-tensors`, sin necesidad de un paso previo de conversión.

La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, con 64 capas de decodificador que combinan atención lineal y atención completa (híbrida), tamaño oculto de 5120 y un codificador de visión de 27 bloques. La longitud de contexto soportada es de 262 144 tokens, lo que lo sitúa en el rango de modelos multimodales de contexto largo orientados a tareas de documento, vídeo o razonamiento extendido.

Su relevancia actual es doble: por un lado, ofrece un peso multimodal listo para producción en FP8, lo que reduce el coste de VRAM frente a un checkpoint bfloat16 equivalente; por otro, incluye una cabeza opcional de predicción multi-token (`model-mtp.safetensors`) que puede habilitarse para decodificación especulativa. La licencia es Apache 2.0, con un fichero NOTICE que recoge la atribución a los modelos upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer híbrido: atención lineal + atención completa, con codificador de visión) |
| Parámetros totales | 27 360 632 560 (27,36 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | FP8 para las capas `Linear` del modelo de lenguaje (`compressed-tensors`, escalas de activación dinámicas por token); bfloat16 para el torre de visión, los bloques de atención lineal, `lm_head` y la cabeza MTP. No se distribuyen otras cuantizaciones (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con fichero NOTICE de atribución upstream) |
| Formato de pesos | safetensors (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`, ~31 GB) + `model-mtp.safetensors` opcional; incluye `recipe.yaml`, tokenizer, processor y chat template |

Otros datos: tamaño del repositorio 31,2 GB; librería `transformers`; pipeline `image-text-to-text`; etiquetas `vllm`, `fp8`, `compressed-tensors`, `endpoints_compatible`.

## Arquitectura y entrenamiento

El modelo es un transformer de 64 capas de decodificador con un esquema de atención híbrido: alterna bloques de atención lineal con bloques de atención completa, un patrón habitual para reducir el coste de la caché KV en contextos muy largos. El tamaño oculto es de 5120 y el componente de visión es un codificador de 27 bloques, lo que da soporte de entrada de imagen junto a texto. La cuantización FP8 se aplica únicamente a las capas `Linear` del modelo de lenguaje, dejando en bfloat16 el torre de visión, los bloques de atención lineal, `lm_head` y la cabeza de predicción multi-token; las escalas de activación son dinámicas y por token, según el registro de cuantización `recipe.yaml`.

Sobre el entrenamiento no se dispone de información: la model card de este repositorio no detalla el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta el proceso de destilación ni los datos multimodales utilizados. La innovación técnica destacable, por lo que respecta a esta redistribución, es el empaquetado FP8 compatible con vLLM y la inclusión de una cabeza MTP (`model-mtp.safetensors`) para decodificación especulativa multi-token. El tokenizer, la configuración del processor y el chat template son los de la familia Qwen3.6 y no se han modificado.

## Capacidades

- Generación de texto conversacional multi-turno, con chat template de la familia Qwen3.6.
- Comprensión de imágenes: el pipeline es `image-text-to-text` y las imágenes se pasan como partes `image_url` del mensaje de usuario en la API compatible con OpenAI.
- Contexto largo de hasta 262 144 tokens, apto para documentos extensos, múltiples imágenes en una misma conversación o razonamiento de varios pasos.
- Decodificación especulativa opcional mediante la cabeza de predicción multi-token incluida en `model-mtp.safetensors`.
- Capacidades de razonamiento, código y matemáticas: no documentadas explícitamente en la información disponible, aunque son esperables en la familia Qwen3.6; no se aportan datos verificables.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).
- Otras modalidades (audio, vídeo nativo): no disponibles.

## Casos de uso

- Atención al cliente multimodal: el modelo puede mantener conversaciones multi-turno con contexto de hasta 262 144 tokens, lo que permite adjuntar capturas de pantalla o fotos del producto junto al historial completo del cliente sin truncar el diálogo.
- Análisis de documentos con imágenes: procesamiento de facturas, informes escaneados o gráficos junto a texto, aprovechando el codificador de visión de 27 bloques y la ventana de contexto larga para encadenar varios documentos en una misma petición.
- Asistente interno sobre base documental extensa: con contexto largo se puede inyectar un corpus grande directamente en el prompt en lugar de fragmentar y recuperar, útil como paso previo a una arquitectura RAG más elaborada.
- Servicio de inferencia en producción con vLLM: el checkpoint se carga directamente con `compressed-tensors` FP8 en vLLM ≥ 0,23, exponiendo una API compatible con OpenAI, lo que simplifica sustituir backends existentes sin reescribir el cliente.
- Reducción de coste de VRAM en despliegues existentes: al estar cuantizado a FP8, ocupa aproximadamente la mitad que un checkpoint bfloat16 equivalente, lo que permite servir el modelo en GPUs de 40-48 GB o repartirlo en dos réplicas con `--data-parallel-size`.
- Aceleración de la generación en servicios de alto volumen: activando la cabeza MTP para decodificación especulativa se puede reducir la latencia por token en cargas de generación larga, siempre que la versión de vLLM lo soporte.
- Evaluación comparativa de cuantizaciones: útil como referencia FP8 frente al checkpoint base en bfloat16 para medir la degradación introducida por la cuantización antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No se dispone de valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra métrica en la model card del repositorio ni en los datos proporcionados. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 27,4 GB en FP8 (los dos ficheros safetensors suman ~31 GB con metadatos y tensores en bfloat16), más la caché KV y el espacio de activaciones.
- En bfloat16 el modelo requeriría aproximadamente 55 GB solo para pesos, por lo que no cabe en GPUs de 24 GB sin cuantización adicional.
- GPU recomendadas en FP8: NVIDIA H100 (80 GB), A100 80 GB, L40S (48 GB) o A6000 Ada (48 GB). Cabe en una sola GPU de 48 GB con contexto moderado.
- GPU consumer: no cabe en RTX 4090 / RTX 3090 (24 GB) en FP8 sin repartir en varias GPUs. Sí sería viable tras reconvertir a GGUF de 4 bits (~15-16 GB), lo que encajaría en una RTX 4090 o RTX 5090.
- Configuración de referencia del autor: `vllm serve` con `--data-parallel-size 2`, `--max-model-len 81920`, `--gpu-memory-utilization 0.9`, `--enable-prefix-caching --enable-chunked-prefill`. Es decir, el propio autor limita el contexto servido a 81 920 tokens aunque la ventana nominal sea de 262 144.
- Opciones de despliegue: vLLM ≥ 0,23 con soporte FP8 de `compressed-tensors` (vía recomendada) y Transformers con `AutoModelForImageTextToText` y `compressed-tensors` instalado. Para llama.cpp, Ollama o TGI habría que reconvertir los pesos, ya que el repositorio no incluye GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparación se limita a características estructurales. Los valores de las alternativas corresponden a conocimiento público general sobre esas familias y no han sido verificados en la información proporcionada.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.6-27B-Goshawk | 27,36 B | 262 144 tokens | Texto + imagen | Apache 2.0 | safetensors FP8 en este repositorio |
| computer-vision-ai-lab/Qwen-3.6-27B-AmberKite (modelo base directo) | no disponible | no disponible | Texto + imagen | no disponible | HuggingFace |
| Qwen/Qwen3.6-27B (origen de la familia) | no disponible | no disponible | no disponible | Apache 2.0 (según LICENSE referenciada) | HuggingFace |
| Modelos densos de ~30 B de la generación anterior (por ejemplo Qwen3-32B / Qwen2.5-VL-32B) | ~32 B | 128 000 tokens en la generación anterior | Texto / texto + imagen | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |

Nota: no se han podido comparar resultados de benchmarks porque el repositorio no publica ninguno.

## Limitaciones y advertencias

- No hay ninguna información sobre sesgos del modelo, composición del dataset de entrenamiento ni procesos de alineación; no es posible evaluar sesgos conocidos.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no se aportan evaluaciones de fidelidad ni tasas de error.
- Idiomas soportados: el repositorio no declara idiomas. No se debe asumir cobertura multilingüe sin verificarla.
- La ventana nominal de 262 144 tokens no implica que el modelo mantenga calidad en todo el rango; la configuración de ejemplo del autor usa 81 920 tokens, lo que sugiere un uso práctico más restringido.
- Licencia Apache 2.0 permite uso comercial, pero el fichero NOTICE recoge la obligación de atribución a los modelos upstream y la mención de cambios, tal como exige la sección 4 de la licencia. "Qwen" es marca registrada de Alibaba Cloud y se usa solo para identificar la familia.
- Dependencia estricta de versiones: requiere vLLM ≥ 0,23 o una versión reciente de Transformers con `compressed-tensors`; versiones anteriores no podrán leer los pesos FP8.
- El repositorio puede recibir nuevos commits; el propio autor recomienda fijar una revisión concreta (`--revision <commit>`) para garantizar reproducibilidad.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, sin validación por parte de la comunidad ni resultados reproducidos por terceros.
- Al ser una cuantización FP8 de un modelo derivado de otro, existe riesgo de degradación acumulada respecto al checkpoint original; no se han publicado evaluaciones comparativas.
- No se distribuyen pesos en GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos sin GPU de clase数据中心 o en herramientas de inferencia ligeras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/magicworld7/Qwen-3.6-27B-Goshawk
- Modelo base directo: https://huggingface.co/computer-vision-ai-lab/Qwen-3.6-27B-AmberKite
- Modelo de la familia Qwen referenciado: https://huggingface.co/Qwen/Qwen3.6-27B
- Texto de licencia referenciado: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Ficheros de referencia dentro del repositorio: `recipe.yaml` (registro de cuantización), `NOTICE` (atribución y aviso de cambios), `model-mtp.safetensors` (cabeza de predicción multi-token), `generation_config.json` (parámetros de muestreo por defecto: temperature 1,0, top_p 0,95, top_k 20).
