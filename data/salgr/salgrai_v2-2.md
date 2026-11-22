# salgr/SalgrAI_v2

## Resumen

SalgrAI-v2 es un modelo de lenguaje conversacional en ruso derivado de `google/gemma-3-270m-it` mediante fine-tuning completo y una poda posterior del vocabulario. Lo desarrolla una única persona bajo el alias "salgr", entrenado en una sola GPU RTX 3060, y está pensado para experimentos, demos y aprendizaje, no para uso serio en producción. Su interés principal no reside en la calidad conversacional, sino en la técnica de reducción aplicada: se elimina la mayor parte de la tabla de embeddings multilingüe de Gemma 3 y se conserva únicamente el subconjunto necesario para ruso.

El modelo pasa de 268,1M a 130.754.176 parámetros (100.326.016 en las capas transformer y 30.428.160 en la tabla de embeddings), manteniendo intactos los pesos de las capas del transformer. El vocabulario se reduce de 262.144 a 47.544 tokens: cirílico, ASCII, puntuación tipográfica, emoji, los 256 tokens de byte y los tokens especiales. La consecuencia directa es que el modelo ya no puede generar caracteres de otros alfabetos, como chino o árabe.

Arquitectura Gemma 3 decoder-only con 18 capas, dimensión oculta 640, 4 cabezas de atención (1 cabeza KV) y FFN de 2048, con atención de ventana deslizante combinada con atención global. El modelo está disponible en safetensors, PyTorch y GGUF (F16, Q8_0 y Q4_K_M), y su licencia es la de Gemma Terms of Use, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 decoder-only (transformer), 18 capas, hidden 640, 4 cabezas de atencion (1 KV head), FFN 2048, atencion de ventana deslizante + global |
| Parametros totales | 130.754.176 (100.326.016 en capas + 30.428.160 en embeddings) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (la documentacion de ejemplo usa `-c 1024` en llama.cpp, pero no se especifica el limite oficial) |
| Tipos de cuantizacion | F16 (GGUF), Q8_0 (GGUF), Q4_K_M (GGUF), bfloat16 (safetensors), float32 |
| Idiomas soportados | Ruso (principal); ingles solo en fragmentos y de forma debil |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors, pytorch_model.bin, GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer decoder-only de 18 capas con dimensión oculta 640, 4 cabezas de atención con una sola cabeza KV (GQA), FFN de 2048 y una combinación de atención de ventana deslizante con atención global. El fine-tuning es completo en bfloat16 con la tabla de embeddings congelada, usando AdamW con learning rate 2e-5, batch de 16, 3 épocas y función de pérdida calculada únicamente sobre los tokens del asistente. El objetivo es conversación corta, informal y de estilo "Telegram en minúsculas" en ruso.

La innovación técnica destacable es la poda del vocabulario. Se contó la frecuencia de tokens sobre unos 150M de caracteres de Wikipedia en ruso, 100M de caracteres de OpenSubtitles en ruso y todos los diálogos de fine-tuning. Se conservaron los tokens que aparecen al menos 10 veces en el corpus o en los diálogos, los tokens puramente ASCII entre los primeros 20.000 ids originales, los 256 tokens de byte, los primeros 108 ids (especiales y de control) y, para cada token conservado, los tokens de los que se compone por merges BPE. Se descartaron los tokens con letras de otros alfabetos y se recortaron las filas correspondientes de la tabla de embeddings (que también es la capa de salida). Sobre texto no visto (1.600 artículos de Wikipedia rusa), el tokenizador podado necesita un 0,57% más de tokens y el 67% de los textos se tokenizan exactamente igual que antes.

## Capacidades

- Generación de texto conversacional en ruso, con registro informal y respuestas cortas.
- Conversación multi-turno mediante la plantilla de chat de Gemma (`<start_of_turn>user ... <end_of_turn><start_of_turn>model ...`).
- Generación de texto con muestreo configurable (temperatura 0.5 recomendada, top_k 40, top_p 0.9, repeat_penalty 1.1).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a ruso; el inglés solo funciona en fragmentos y de forma débil; otros alfabetos no son representables como caracteres.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.
- Compatible con text-generation-inference y endpoints compatibles con la API de chat.

## Casos de uso

- Demostración educativa de poda de vocabulario: sirve para ilustrar cómo se recorta una tabla de embeddings multilingüe a un solo alfabeto y qué efectos tiene sobre el tamaño y la tokenización, comparando el modelo con su versión completa.
- Prototipado de chatbots de Telegram en ruso: el modelo se integra con llama.cpp mediante `llama-server` y la API compatible con OpenAI, con respuestas cortas y registro informal adecuado para un bot de conversación ligera.
- Experimentación en hardware de gama baja: con la cuantización Q8_0 (140 MB) o Q4_K_M (102 MB) cabe en dispositivos con poca memoria y permite iterar sin GPU dedicada.
- Pruebas de pipelines de inferencia: útil para validar plantillas de chat, tokenizadores podados y compatibilidad entre `transformers` y llama.cpp en entornos de CI.
- Investigación sobre destilación de vocabulario y eficiencia de embeddings: el modelo documenta el proceso completo de conteo de frecuencias, selección de tokens y recorte de filas, lo que facilita reproducir el método sobre otros idiomas.
- Generación de texto creativo breve en ruso para entornos controlados: poemas cortos, respuestas de foro o mensajes informales, siempre con revisión humana por la debilidad del conocimiento del modelo.
- Evaluación comparativa de cuantizaciones: los GGUF F16, Q8_0 y Q4_K_M permiten medir la degradación de calidad en un modelo pequeño, con datos de coincidencia de primer token y respuesta completa publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta comprobaciones de fidelidad entre formatos:

| Prueba | F16 | Q8_0 | Q4_K_M |
|---|---|---|---|
| Primer token de respuesta coincide con referencia fp32 | 10/10 prompts | 10/10 prompts | 8/10 prompts |
| Respuesta greedy completa coincide con referencia fp32 | 10/10 prompts | 9/10 prompts | 3/10 prompts |
| Ids del prompt idénticos entre transformers y llama.cpp | sí | sí | sí |

Además, `model.safetensors` y `pytorch_model.bin` producen exactamente los mismos logits que el modelo podado del que se guardaron.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 262 MB en bfloat16 o float32; 263 MB en GGUF F16; 140 MB en Q8_0; 102 MB en Q4_K_M. El peso de los pesos es mínimo; el consumo real depende del contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entrenó en una RTX 3060. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: `transformers` (bfloat16 o float32, nunca float16 por inestabilidad numérica de Gemma 3), llama.cpp con `llama-server` y GGUF, y endpoints compatibles con la API de chat. No se documenta soporte explícito de vLLM ni TGI más allá de la etiqueta `text-generation-inference`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SalgrAI-v2 | 130,8M | no disponible | Ruso | Gemma Terms of Use | Hugging Face (safetensors, GGUF) |
| google/gemma-3-270m-it | 268,1M | no disponible en la informacion | Multilingue | Gemma Terms of Use | Hugging Face |
| SalgrAI-v2-Full | 268,1M | no disponible | Ruso | Gemma Terms of Use | Referenciado por el autor, no verificado en la informacion |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (segun documentacion publica de Qwen) | Multilingue | Apache 2.0 | Hugging Face |

La comparación más directa es con el propio modelo base: SalgrAI-v2 conserva el comportamiento de SalgrAI-v2-Full en las pruebas del autor con la mitad de parámetros, a cambio de perder la capacidad de representar otros alfabetos. Frente a alternativas multilingües de tamaño similar, la ventaja es el tamaño reducido y la licencia Gemma; la desventaja es el conocimiento débil y la ausencia de filtros de seguridad propios.

## Limitaciones y advertencias

- Conocimiento muy limitado: el modelo base es de 270M parámetros y el fine-tuning se centra en conversación informal, no en hechos.
- Sin filtro de seguridad más allá del propio de Gemma: no hay alineamiento adicional para contenido sensible.
- Las respuestas muestreadas contienen a veces no-palabras (tokens sin significado real), según advierte el propio autor.
- No puede generar caracteres de alfabetos distintos del cirílico y el ASCII: el vocabulario podado lo impide y el texto de otros sistemas de escritura llega al modelo como bytes.
- El inglés solo funciona en fragmentos y de forma débil.
- El tokenizador podado cambia los ids de token respecto a Gemma original a partir del id 107, lo que rompe la compatibilidad con herramientas que asuman el vocabulario original.
- No debe ejecutarse en float16 por inestabilidad numérica de Gemma 3; usar bfloat16 o float32.
- La licencia Gemma Terms of Use impone condiciones al uso comercial y obliga a incluir el aviso `NOTICE`; hay que revisarlas antes de cualquier despliegue.
- El modelo está declarado explícitamente por su autor como no apto para uso serio; su uso en producción requeriría validación adicional.
- La cuantización Q4_K_M degrada notablemente la fidelidad: solo 3 de 10 respuestas greedy completas coinciden con la referencia fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/SalgrAI_v2
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Version en ruso de la model card: README_RU.md en el repositorio
- Terminos de uso de Gemma: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
