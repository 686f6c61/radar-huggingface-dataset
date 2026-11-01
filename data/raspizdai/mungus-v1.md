# RaspizdAI/mungus-v1

## Resumen

mungus-v1 es un modelo de generación de texto en ruso de 27.781.427.952 parámetros desarrollado por RaspizdAI, un fine-tune del modelo base Qwen/Qwen3.8-27B. Se distribuye bajo licencia CC-BY-SA-4.0, en formato safetensors y bfloat16, con un repositorio de 55,6 GB repartido en 18 shards. Su propósito declarado es producir respuestas breves y estilísticamente consistentes en ruso, mostrando siempre una traza de razonamiento antes de la respuesta final.

Técnicamente emplea la clase `Qwen3_5ForConditionalGeneration`, un backbone híbrido visión-lenguaje que aquí se usa únicamente para generación de texto, aunque conserva intacta la torre de visión (460.730.096 parámetros). La arquitectura combina 16 capas de atención completa con 48 capas de atención lineal basadas en Gated DeltaNet, con GQA de 24 cabezas de consulta y 4 de clave/valor, FFN SwiGLU de dimensión intermedia 17.408 y una longitud de contexto de 262.144 tokens.

El modelo es relevante como ejemplo de fine-tune de razonamiento sobre una arquitectura híbrida de contexto muy largo, pero su alcance práctico está muy acotado: solo ruso, sin benchmarks publicados en formato numérico y con una model card que describe un estilo deliberadamente provocador. No es un modelo de propósito general ni un candidato razonable para producción sin una evaluación propia exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (híbrida atención completa + atención lineal Gated DeltaNet, con torre de visión) |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no es MoE; todos los parámetros son densos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | bfloat16 nativo; cuantización 4-bit NF4 con bitsandbytes documentada por el autor (double quant, compute bf16) |
| Idiomas soportados | ruso (ru) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (18 shards, bfloat16) |

Datos adicionales de la especificación publicada por el autor:

| Parámetro | Valor |
|---|---|
| Tamaño de vocabulario | 248.320 |
| Dimensiones de embedding | 5.120 |
| Capas ocultas | 64 |
| Cabezas de atención | 24 |
| Dimensión de cabeza | 256 |
| Parámetros de texto | 24.777.901.056 |
| Parámetros de visión | 460.730.096 |
| Precisión | bfloat16 |
| Tamaño del checkpoint | 55,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido con dos tipos de capas intercaladas: 16 capas de atención completa (una de cada cuatro) y 48 capas de atención lineal Gated DeltaNet con 16 cabezas de clave, 48 cabezas de valor, dimensión de cabeza 128 y kernel de convolución 4. La atención completa usa 24 cabezas de consulta de dimensión 256 y 4 cabezas KV (GQA) con puerta de salida. El FFN es SwiGLU con tamaño intermedio 17.408. El codificador posicional es RoPE parcial (factor 0,25, theta 1e7) con M-RoPE intercalado. Los embeddings y el `lm_head` están desacoplados (untied), con 248.320 × 5.120 parámetros cada uno (1.271.398.400 por matriz). La torre de visión tiene 27 capas, hidden 1152, patch 16 y spatial merge 2.

El entrenamiento se realizó sobre un dataset propio de instrucciones y respuestas en ruso, con respuestas cortas y de estilo consistente, y cada muestra incluye una traza de razonamiento en inglés. El bloque de razonamiento se separa de la respuesta final durante el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificación más allá de la arquitectura híbrida heredada del modelo base.

## Capacidades

- Generación de texto conversacional en ruso, con respuestas breves y un estilo declarado por el autor como "30 % femboyism y 70 % agresividad".
- Traza de razonamiento visible antes de cada respuesta, separada del bloque de respuesta final.
- Razonamiento multi-paso implícito en el bloque de pensamiento, aunque sin garantías de calidad verificable.
- Procesamiento de imágenes heredado de la arquitectura (torre de visión intacta de 460.730.096 parámetros), si bien la model card no documenta ni valida casos de uso multimodal y el pipeline declarado es `text-generation`.
- Manejo de contexto muy largo (262.144 tokens) gracias a la combinación de atención completa cada cuatro capas y atención lineal.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de orquestación multi-paso.
- Capacidad multilingüe: limitada al ruso según el campo `language`; las trazas de razonamiento se generan en inglés según la descripción del dataset.

## Casos de uso

- Generación de texto creativo en ruso con voz estilizada: el modelo está entrenado específicamente para producir respuestas cortas y consistentes en un registro concreto, lo que permite usarlo en prototipos de personajes o narrativa experimental donde ese tono es el objetivo.
- Investigación sobre separación de trazas de razonamiento: al entrenarse con el bloque de pensamiento separado de la respuesta, sirve como banco de pruebas para estudiar cómo afecta la exposición de la cadena de razonamiento a la calidad y longitud de la salida.
- Evaluación de arquitecturas híbridas de contexto largo: sus 262.144 tokens y su mezcla de atención completa y Gated DeltaNet lo hacen útil para experimentos académicos sobre degradación de contexto y coste computacional en secuencias largas.
- Fine-tuning posterior sobre dominios rusos especializados: al ser un checkpoint denso de 27,8B con licencia CC-BY-SA-4.0, puede servir de base para adaptaciones internas siempre que se respete la atribución y la cláusula de apertura de derivados.
- Pruebas de cuantización en GPUs de consumo: el autor documenta explícitamente la carga en 4-bit NF4 con bitsandbytes en una sola GPU, lo que permite validar pipelines de cuantización sobre un modelo de casi 28B parámetros.
- Docencia y divulgación sobre fine-tuning de razonamiento: el contraste entre el modelo base Qwen/Qwen3.8-27B y este fine-tune permite ilustrar cómo un dataset pequeño y estilizado altera el comportamiento de un modelo grande sin cambiar su arquitectura.
- Análisis de sesgos y seguridad en modelos con estilos provocadores: útil para estudiar cómo instrucciones de estilo agresivo afectan a la toxicidad, la utilidad y la estabilidad de las respuestas en un modelo de gran tamaño.

## Benchmarks y rendimiento

La model card incluye una imagen titulada "Quad-Bench Results" (`quad_bench_mungus_v1`) sin tabla numérica asociada en el texto proporcionado. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de otros benchmarks en formato explotable.

| Benchmark | Resultado |
|---|---|
| Quad-Bench | solo disponible como imagen en la model card; sin cifras en la información proporcionada |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks en formato numérico en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 56 GB, según el propio autor, lo que exige GPUs de 80 GB como A100 80 GB o H100 80 GB.
- VRAM estimada en 4-bit NF4 con bitsandbytes: aproximadamente 14-16 GB de pesos más overhead de activaciones y caché KV; el autor indica que cabe en una sola GPU de consumo, sin especificar el modelo exacto.
- GPUs recomendadas para bf16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`.
- GPUs de consumo: viable en 4-bit en tarjetas con 24 GB (RTX 3090, RTX 4090) para contextos moderados; el contexto completo de 262.144 tokens incrementaría notablemente la memoria de caché KV y requeriría hardware de mayor capacidad.
- Opciones de despliegue documentadas: `transformers` con `AutoModelForCausalLM` y `AutoProcessor`, tanto en bf16 como con `BitsAndBytesConfig` en 4-bit. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Parámetros de generación recomendados por el autor: `max_new_tokens` de al menos 512 (recomendado 700), `temperature` 0,7, `top_p` 0,8, `top_k` 20, `repetition_penalty` 1,05. La decodificación greedy tiende a producir trazas largas y repetitivas; el autor recomienda muestreo en el rango 0,6-0,8.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RaspizdAI/mungus-v1 | 27,78B | 262.144 | ru | CC-BY-SA-4.0 | Fine-tune de razonamiento con estilo propio; sin benchmarks numéricos públicos |
| Qwen/Qwen3.8-27B (modelo base) | 27,78B (misma arquitectura) | 262.144 (heredado) | no disponible en la información proporcionada | no disponible en la información proporcionada | Base del fine-tune; comportamiento generalista previo al ajuste estilístico |
| Alternativas de ~27-30B en ruso | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría. La única comparación defendible es con el modelo base Qwen/Qwen3.8-27B, del que mungus-v1 hereda arquitectura, tokenizador y contexto, y del que difiere exclusivamente por el fine-tune sobre el dataset ruso descrito.

## Limitaciones y advertencias

- Idiomas: el modelo está declarado únicamente para ruso; su rendimiento en castellano, inglés u otros idiomas no está validado y previsiblemente será deficiente.
- Estilo deliberadamente agresivo: el autor describe el estilo como "30 % femboyism y 70 % agresividad", lo que implica un riesgo alto de respuestas hostiles, soeces o inapropiadas en contextos profesionales.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; el formato de traza de razonamiento visible no garantiza corrección y puede aumentar la confianza aparente en respuestas erróneas.
- Trazas de razonamiento en inglés sobre respuestas en ruso: esta asimetría puede introducir artefactos de traducción y dificulta la auditoría del razonamiento en el idioma de salida.
- Decodificación frágil: el autor advierte que la decodificación greedy produce trazas largas y repetitivas, lo que obliga a usar muestreo y complica la reproducibilidad.
- Licencia CC-BY-SA-4.0: permite uso comercial y modificaciones, pero obliga a atribución, a mantener el copyright de RaspizdAI y a liberar los modelos derivados bajo la misma licencia o compatible (cláusula copyleft). Esto puede ser incompatible con despliegues propietarios cerrados.
- Contexto largo no validado: aunque la arquitectura soporta 262.144 tokens, no se documentan evaluaciones de rendimiento en contextos largos ni de degradación por posición.
- Multimodalidad no validada: la torre de visión está intacta, pero la model card no documenta ni ejemplifica su uso; tratarlo como modelo de visión sería una extrapolación no respaldada.
- Sin benchmarks numéricos públicos: la única referencia es una imagen de "Quad-Bench" sin cifras en el texto, lo que impide verificar afirmaciones de calidad.
- Comunidad y soporte mínimos: 283 descargas y 0 likes en el momento de la consulta, sin issues ni documentación adicional conocida.
- Fecha de creación registrada en 2026-10-31, posterior a la del conocimiento de referencia; conviene verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RaspizdAI/mungus-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Logo del modelo: https://cdn-uploads.huggingface.co/production/uploads/6a1d885bbd8b36b69d8a8727/dddCwqYQpaaDBhCv3xAfC.png
- Imagen de resultados Quad-Bench: https://cdn-uploads.huggingface.co/production/uploads/6a1d885bbd8b36b69d8a8727/MeNEPTRG_U5WVuloA9zuJ.png
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Documentación de bitsandbytes: https://huggingface.co/docs/bitsandbytes
- Repositorio de Transformers: https://github.com/huggingface/transformers
