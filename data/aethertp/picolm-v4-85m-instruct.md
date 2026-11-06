# aethertp/PicoLM-V4-85M-Instruct

## Resumen

PicoLM-V4-85M-Instruct es un modelo de lenguaje conversacional de 84.960.832 parámetros desarrollado por el usuario aethertp, resultado del ajuste fino del modelo base PicoLM-V4-85M, entrenado desde cero sobre 6.000 millones de tokens. El ajuste fino se realizó sobre aproximadamente 82,42 millones de tokens de datos sintéticos de instrucción y chat provenientes principalmente del subconjunto SmolTalk de HuggingFaceTB, complementados con un pequeño conjunto de identidad propio y una fracción de texto de preentrenamiento. El modelo emplea la arquitectura Qwen3 (`Qwen3ForCausalLM`) de la librería `transformers`, con 20 capas, tamaño oculto de 576, atención con 9 cabezas de consulta y 3 de clave/valor (GQA), feed-forward SwiGLU con tamaño intermedio de 1536, RMSNorm y RoPE con base 10.000. La longitud de contexto es de 2048 tokens y el vocabulario BPE es de 24.576 tokens heredado de PicoLM-V3.

El modelo está pensado exclusivamente para investigación sobre modelos de lenguaje pequeños, experimentación con ajuste fino y plantillas de chat, y escenarios donde se necesita un modelo conversacional que quepa en CPU. El propio autor advierte que el modelo se equivoca en datos fácticos y aritmética la mayor parte del tiempo, y que no es apto para respuesta a preguntas, traducción, generación de código ni ningún uso donde la corrección de la respuesta sea requisito. Su relevancia actual radica en ser un ejemplo reproducible de pipeline completo (preentrenamiento desde cero, ajuste fino de instrucciones, empaquetado en formato Qwen3 y exportación a GGUF) con licencia Apache 2.0 y métricas honestamente reportadas.

La ficha se basa únicamente en los datos publicados en la model card y en los metadatos de Hugging Face; no se han inventado cifras de benchmarks ni especificaciones no documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (`Qwen3ForCausalLM`), 20 capas, hidden size 576, 9 cabezas Q / 3 cabezas KV, head dim 64, SwiGLU (intermediate 1536), RMSNorm en Q y K, RoPE base 10.000, embeddings de entrada y salida atados |
| Parámetros totales | 84.960.832 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (el repo incluye archivos GGUF para llama.cpp, pero la model card no detalla los tipos concretos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Qwen3 de `transformers`) y GGUF para llama.cpp |
| Vocabulario | BPE de 24.576 tokens (heredado de PicoLM-V3) |
| Tokens especiales | `<|im_start|>` (id de chat), `<|im_end|>` (id 2, EOS), `<|endoftext|>` (id 0) |
| Plantilla de chat | ChatML: `<|im_start|>role\ncontent<|im_end|>\n`, cierre con `<|im_start|>assistant\n` |
| Librería | transformers (probado en 4.57.1 y 5.22.1) |
| Tamaño del repo | 0,7 GB |
| Modelo base | aethertp/PicoLM-V4-85M |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base PicoLM-V4-85M sin cambios: un transformer decoder-only de 20 capas con hidden size 576, atención con 9 cabezas de consulta y 3 de clave/valor (GQA, head dimension 64), feed-forward SwiGLU con tamaño intermedio 1536, RMSNorm aplicado también a consultas y claves, RoPE con base 10.000, embeddings de entrada y salida atados, y contexto de 2048 tokens. El vocabulario es un BPE de 24.576 tokens heredado de PicoLM-V3. Los tokens de chat `<|im_start|>` y `<|im_end|>` ya existían en el tokenizer; el token id 2 (`<|im_end|>`) no aparece en los datos de preentrenamiento, por lo que es durante el ajuste fino cuando el modelo aprende a usarlo como fin de turno. El modelo base se entrenó desde cero sobre 6.000 millones de tokens.

El ajuste fino de instrucciones consumió aproximadamente 82,42 millones de tokens reales (sin padding, contando prompt y respuesta, sobre un plan de dos épocas) provenientes de seis fuentes del subconjunto SmolTalk de HuggingFaceTB, más un conjunto de identidad propio y una fracción de replay de texto de preentrenamiento. La composición fue: openhermes-50k (25,28 M, 30,7 %), self-oss-instruct (17,01 M, 20,6 %), smol-contraints (13,60 M, 16,5 %), smol-summarize-20k (10,19 M, 12,4 %), smollm-rewrite-30k con peso 0,5 (9,23 M, 11,2 %), replay de preentrenamiento (6,40 M, 7,8 %), explore-instruct-rewrite (0,54 M, 0,7 %) e identity (0,18 M, 0,2 %). Se descartó la fuente `smol-magpie-ultra` porque, generada con Llama-3.1-405B-Instruct, no aportó ganancia medible en la pérdida de desarrollo en la ablación del autor. La pérdida se calcula únicamente sobre las respuestas del asistente y el token de cierre `<|im_end|>`. El conjunto de identidad consta de 522 conversaciones cortas repetidas cuatro veces en la mezcla, de las cuales 88 son intercambios de dos turnos en los que el usuario da un nombre y lo pregunta después; su función es que el modelo se identifique como PicoLM-V4 de aethertp y no como ChatGPT. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés con respuestas fluidas en formato ChatML.
- Seguimiento de instrucciones simples y mantenimiento de conversaciones cortas multi-turno.
- Uso de system prompts para formatos sencillos (por ejemplo, restricciones de longitud o formato de título).
- Identidad propia: responde que es PicoLM-V4, desarrollado por aethertp, y no ChatGPT.
- Cierre correcto de turno mediante el token `<|im_end|>` (id 2).
- Ejecución en CPU en fp32 sin `trust_remote_code`, cargable con `AutoModelForCausalLM` y `AutoTokenizer`.
- Exportación a GGUF para su uso con llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas fiables, código, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre modelos de lenguaje pequeños: servir como referencia reproducible de un pipeline completo (preentrenamiento desde cero, ajuste fino de instrucciones y exportación a GGUF) para estudiar el efecto del tamaño y de la mezcla de datos en modelos de menos de 100 M de parámetros.
- Experimentación con plantillas de chat: permite probar el formato ChatML, el manejo de tokens especiales (`<|im_start|>`, `<|im_end|>`) y el comportamiento de `apply_chat_template` en un modelo que cabe en CPU.
- Pruebas de ajuste fino y ablaciones de datos: su tamaño reducido y su licencia Apache 2.0 permiten reentrenar o afinar variantes en hardware modesto y comparar mezclas de datos con la composición documentada por el autor.
- Docencia y demostraciones de inferencia en CPU: al ejecutarse en fp32 sin GPU y sin `trust_remote_code`, sirve para ilustrar el ciclo completo de carga, tokenización y generación con `transformers` en un portátil.
- Evaluación de metodologías de medición: la model card reporta métricas concretas (por ejemplo, bucles en 5,6 % de los prompts con decodificación greedy y `repetition_penalty=1.1`, frente a 3,6 % con muestreo; 11 de 24 comprobaciones de panel superadas con greedy frente a 12 con muestreo), lo que lo convierte en un caso de estudio sobre cómo reportar resultados honestamente en modelos pequeños.
- Pruebas de cuantización y despliegue ligero: los archivos GGUF incluidos permiten experimentar con llama.cpp en entornos sin GPU para medir latencia y calidad en un modelo de 85 M de parámetros.
- Prototipado de interfaces conversacionales de bajo coste: útil para validar pipelines de chat (formato de mensajes, system prompt, fin de turno) antes de migrar a un modelo mayor, no para producción con requisitos de corrección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas internas del autor:

| Métrica | Greedy + `repetition_penalty=1.1` | Muestreo (T=0,7, top-p=0,9) |
|---|---|---|
| Prompts con bucle | 5,6 % | 3,6 % |
| Comprobaciones de panel superadas (de 24) | 11 | 12 (la adicional es la comprobación de título de 12 palabras) |

El autor indica además que, en las respuestas revisadas, el muestreo produjo más sinsentidos. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 84,96 M de parámetros; en fp32 ocupa aproximadamente 340 MB de pesos, en fp16 unos 170 MB y en cuantizaciones de 8 bits alrededor de 85 MB (sin contar overhead de activaciones y caché KV). Estas cifras son estimaciones a partir del número de parámetros, no datos publicados en la model card.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer moderna es sobradamente suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual; también funciona en CPU en fp32, tal como documenta el autor con el ejemplo de código.
- Opciones de despliegue: `transformers` (probado en 4.57.1 y 5.22.1) con `AutoModelForCausalLM` y `AutoTokenizer` sin `trust_remote_code`; llama.cpp mediante los archivos GGUF incluidos; el tag `text-generation-inference` y `endpoints_compatible` aparece en los metadatos de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la información proporcionada que permitan una comparativa rigurosa con alternativas de la misma categoría. Como referencia estructural, se puede situar frente a otros modelos pequeños de la familia SmolLM y similares, pero sin cifras verificadas:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PicoLM-V4-85M-Instruct | 84,96 M | 2048 | Apache 2.0 | Entrenado desde cero, ajustado sobre SmolTalk; sin benchmarks publicados |
| SmolLM2-135M-Instruct | 135 M (aprox., no verificado en la información disponible) | no disponible | no disponible | Alternativa de tamaño similar de Hugging Face; sin datos comparativos en esta ficha |
| Qwen3 pequeño | no disponible | no disponible | no disponible | El modelo adopta el formato Qwen3, pero no se aportan cifras de comparación |

Los datos de las filas de SmolLM2 y Qwen3 no están verificados en la información proporcionada y se incluyen solo como referencia de categoría; no deben usarse para decidir entre modelos sin consultar sus model cards originales.

## Limitaciones y advertencias

- El propio autor advierte que el modelo se equivoca en datos fácticos y aritmética la mayor parte del tiempo; produce respuestas fluidas que a menudo son falsas.
- No es apto para respuesta a preguntas, aritmética, traducción, generación de código ni ningún escenario donde la respuesta deba ser correcta.
- Solo soporta inglés; no se documenta soporte multilingüe.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de bucles en la generación: 5,6 % de los prompts con decodificación greedy y `repetition_penalty=1.1`, 3,6 % con muestreo.
- El uso de system prompts debe limitarse a formatos sencillos; el autor no garantiza su robustez.
- Los datos de ajuste fino son sintéticos y en gran parte generados por otros modelos de lenguaje; el autor no verificó su origen ni sus términos más allá de lo indicado en las fichas del dataset, y la licencia Apache 2.0 del modelo no elimina esas condiciones.
- No se documentan sesgos específicos medidos, pero al entrenarse sobre datos sintéticos en inglés hereda los sesgos de las fuentes y del proceso de generación.
- No se han publicado benchmarks estándar, por lo que no hay evidencia cuantitativa de calidad más allá de las métricas internas del autor.
- Para uso comercial, la licencia Apache 2.0 lo permite, pero deben respetarse los términos de las fuentes de datos sintéticos subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aethertp/PicoLM-V4-85M-Instruct
- Modelo base: https://huggingface.co/aethertp/PicoLM-V4-85M
- Dataset de ajuste fino: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
