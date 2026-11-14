# jakejb53/Qwen3.8-27B-W4A16-G32-AutoRound-AWQ

## Resumen

Qwen3.8-27B-W4A16-G32-AutoRound-AWQ es una cuantización de 4 bits del modelo multimodal Qwen3.8-27B, publicado por el usuario jakejb53 (no por el equipo oficial de Qwen). El modelo base es un vision-language model de 27.000 millones de parámetros con arquitectura híbrida (48 capas Gated DeltaNet y 16 capas de atención completa) y una ventana de contexto nativa de 262.144 tokens. Esta versión cuantizada reduce el peso en disco hasta aproximadamente el 39 % del original en BF16 (19,5 GiB frente a los ~50 GiB estimados), manteniendo en BF16 los componentes sensibles: torre de visión, cabeza MTP, embeddings, `lm_head`, puertas de atención lineal y normas.

La cuantización emplea AutoRound 0.17.0-dev con el algoritmo SignRoundV2 y búsqueda de punto de partida NeUQI, en formato AWQ GEMM con grupos de 32 pesos, asimetría con zero-point por grupo y escalas en FP16. Se trata de una cuantización weight-only (W4A16): los pesos se almacenan en INT4 pero las activaciones se calculan en 16 bits. El objetivo declarado por el autor es preservar la precisión con la ventana completa de 262K tokens y 4 peticiones concurrentes sobre 2 × RTX 3090 (48 GB, TP=2) usando vLLM.

Su relevancia radica en que permite ejecutar un modelo multimodal de 27B con contexto de 262K en hardware de consumo de gama alta (dos RTX 3090), algo inviable con los pesos en BF16. No obstante, el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y no se han publicado resultados de benchmarks que validen la pérdida de precisión frente al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet + 16 capas de atención completa (transformer híbrido con atención lineal) |
| Parámetros totales | 27B (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | W4A16 (pesos INT4, activaciones 16 bits), grupos de 32, asimétrica con zero-point, escalas FP16, ~4,6 bpw en pesos cuantizados y ~6,2 bpw efectivos por parámetro |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en layout AWQ (`quant_method: awq`, `gemm`), 4 shards más fichero de extras |
| Modalidad | image-text-to-text (imagen y vídeo más texto) |
| Componentes en BF16 | Torre de visión, cabeza MTP, embeddings, `lm_head`, puertas `in_proj_a/b` de atención lineal, normas y `Conv1D` |
| Tamaño en disco | 19,5 GiB (21,0 GB) |
| Motor previsto | vLLM |
| Hardware objetivo | 2 × RTX 3090 (48 GB, TP=2), KV cache en BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas de Gated DeltaNet (atención lineal con estado recurrente) con 16 capas de atención completa, lo que reduce el coste computacional y de memoria del contexto largo frente a un transformer denso equivalente. Los pesos son "stock": esta versión no ha sido fine-tuned ni modificada respecto al modelo original de Qwen; solo se ha cuantizado. La modalidad es imagen y vídeo más texto, con una torre de visión dedicada.

El proceso de cuantización se realizó con AutoRound 0.17.0-dev usando el algoritmo SignRoundV2 (600 iteraciones de ajuste por bloque) y la búsqueda de inicialización NeUQI. Se usaron 512 muestras de calibración de 2.048 tokens cada una, con batch 8 y semilla 42. La mezcla de calibración fue 50 % UltraChat, 37,5 % OpenCodeInstruct y 12,5 % pile-10k, renderizada con plantilla de chat sin turno de sistema, esfuerzo de razonamiento medio y solo texto (sin imágenes). La asignación de bits es uniforme de 4 bits en todas las capas cuantizadas (no mixed-bit), y los componentes sensibles a la precisión se mantienen en BF16.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron fases de RLHF o DPO; esos datos no están en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen, vídeo y texto (pipeline `image-text-to-text`).
- Comprensión de imágenes y vídeo: la torre de visión se conserva en BF16, por lo que la cuantización no degrada la codificación visual.
- Decodificación especulativa: la cabeza MTP (multi-token prediction) se mantiene en BF16 y es utilizable para *speculative decoding*.
- Contexto largo: 262.144 tokens nativos, adecuado para documentos extensos, vídeos largos o conversaciones multi-turno prolongadas.
- Conversacional: plantilla de chat estándar sin modificar, compatible con `transformers` y con endpoints.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: la model card declara únicamente inglés (`en`) como idioma soportado.
- Modo *thinking*: no confirmado en la información disponible.

## Casos de uso

- Análisis de documentos largos con soporte visual: informes, contratos o expedientes de cientos de páginas junto con sus figuras y tablas, aprovechando la ventana de 262K tokens para procesar el material completo en una sola pasada.
- Comprensión de vídeo de larga duración: resumen, búsqueda de eventos y respuesta a preguntas sobre grabaciones extensas, gracias a la ventana de contexto y a la torre de visión en BF16.
- Asistente conversacional multi-turno: diálogos prolongados con memoria de contexto amplia, desplegado en vLLM sobre 2 × RTX 3090 con 4 peticiones concurrentes, el escenario objetivo declarado por el autor.
- Servicio de inferencia multimodal en hardware de consumo: despliegue de un VLM de 27B en dos RTX 3090 mediante tensor parallelism, reduciendo el coste frente a soluciones con A100/H100.
- Generación de código asistida: la mezcla de calibración incluye un 37,5 % de OpenCodeInstruct, lo que orienta el ajuste de cuantización hacia cargas de trabajo de código; útil en entornos de desarrollo con contexto de repositorio amplio.
- Procesamiento por lotes de material visual y textual: indexación y extracción de información de grandes volúmenes de imágenes o vídeos con texto asociado, aprovechando el throughput de vLLM.
- Decodificación especulativa en producción: uso de la cabeza MTP conservada en BF16 para acelerar la generación en despliegues con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (MMLU, MMMU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base en BF16, por lo que no es posible cuantificar la pérdida de precisión introducida por la cuantización.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,5 GiB en disco; en inferencia hay que sumar la KV cache en BF16 para la ventana de 262K tokens, que no se cuantifica. El autor fija como objetivo 48 GB totales (2 × RTX 3090) con TP=2 para contexto completo y 4 peticiones concurrentes.
- GPU recomendadas: 2 × RTX 3090 (escenario objetivo); también cabe en 2 × RTX 4090 (48 GB combinados) y en una A100 80 GB o H100 80 GB con mayor margen de KV cache.
- GPU de consumo: sí, en dos RTX 3090 o dos RTX 4090. En una sola GPU de 24 GB no cabe con contexto completo; requeriría reducir la ventana o la concurrencia.
- Opciones de despliegue: vLLM es el motor previsto (layout AWQ GEMM). No se confirma soporte para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica métricas de tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3.8-27B (base, BF16) | 27B | 262.144 | Imagen, vídeo y texto | apache-2.0 | safetensors BF16, transformers/vLLM |
| Qwen3.8-27B-W4A16-G32-AutoRound-AWQ (este) | 27B (INT4) | 262.144 | Imagen, vídeo y texto | apache-2.0 | safetensors AWQ, vLLM |
| Alternativas de mismo tamaño y tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de información sobre otras cuantizaciones comparables de este mismo modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Cuantización no oficial: el repositorio lo publica un usuario individual (jakejb53), no el equipo de Qwen. No hay garantía de soporte ni de validación por parte del desarrollador original.
- Sin benchmarks publicados: no se ha medido la degradación de precisión frente al modelo en BF16; en tareas sensibles (matemáticas, código, razonamiento visual) la pérdida puede ser relevante y no está cuantificada.
- Calibración solo en inglés y solo texto: las 512 muestras de calibración son exclusivamente textuales y en inglés, sin imágenes. El comportamiento en otros idiomas y en tareas visuales puede desviarse más de lo esperado.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Alucinación: como todo VLM, puede generar contenido plausible pero incorrecto, especialmente en descripciones de imágenes o vídeos y en contextos muy largos.
- Sesgos: no se documentan análisis de sesgo; el modelo hereda los sesgos del modelo base y de los datos de calibración (UltraChat, OpenCodeInstruct, pile-10k).
- KV cache no cuantizada: con 262K tokens en BF16 la memoria de contexto es elevada; reducir la ventana o la concurrencia puede ser necesario en GPUs de 24 GB.
- Madurez: 0 descargas y 1 like en el momento de la consulta; herramienta de cuantización en versión dev (AutoRound 0.17.0-dev), lo que añade riesgo de reproducibilidad.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B por si imponen restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakejb53/Qwen3.8-27B-W4A16-G32-AutoRound-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AutoRound (toolkit de cuantización): no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
- Repositorio de vLLM: no disponible en la información proporcionada
