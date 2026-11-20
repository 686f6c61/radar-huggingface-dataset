# QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF

## Resumen

Qwen3.5-4B-QUASAR-Q4_0-GGUF es una cuantización de 4 bits del modelo multimodal Qwen3.5-4B de Alibaba Qwen, producida por QUASAR-QAT mediante entrenamiento consciente de la cuantización (QAT) aplicado directamente sobre la retícula Q4_0 de llama.cpp. Frente a las cuantizaciones post-entrenamiento (PTQ) habituales, el autor entrena las 200 proyecciones del decodificador con autodestilación desde el modelo BF16 congelado, de modo que los pesos resultantes ya están adaptados al ruido de la cuantización en lugar de redondearse a posteriori. El resultado es un GGUF de 2,70 GB que, según la model card, reduce la divergencia KL media un 17-22 % respecto a las builds Q4_0 de bartowski y Unsloth y un 35 % respecto a otra build QAT evaluada (YoozLabs).

El modelo base conserva las capacidades del Qwen3.5-4B original: entrada image-text-to-text, modo de razonamiento (thinking), contexto largo y soporte de decodificación especulativa mediante un bloque MTP opcional. La ficha se centra en la versión Q4_0 para llama.cpp, que es la publicada en este repositorio; las variantes NVFP4 para vLLM y Blackwell se distribuyen en repositorios separados de la misma familia.

La relevancia práctica es doble: por un lado, permite ejecutar un modelo multimodal de 4.205.751.296 parámetros en hardware de consumo con una pérdida de calidad medible y acotada; por otro, documenta una metodología QAT reproducible (paper arXiv:2608.13966) que evita el doble redondeo que penaliza a otras builds QAT. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen3.5), con bloque MTP opcional para decodificacion especulativa; proyector de vision separado |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo base se etiqueta como long-context, sin cifra publicada) |
| Tipos de cuantizacion | Q4_0 (pesos INT4 en las 200 proyecciones del decodificador), Q8_0 (embeddings en el fichero por defecto), F16 (embeddings en variante, normas, kernels conv1d y vectores de compuerta del delta-net); proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); ficheros: `Qwen3.5-4B-QUASAR-Q4_0.gguf` (2,70 GB), `-MTP.gguf` (2,94 GB), `-f16embd.gguf` (3,30 GB), `mmproj-Qwen3.5-4B-F16.gguf` (0,67 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Qwen3.5 con 4.205.751.296 parámetros y capacidad multimodal image-text-to-text: el procesamiento de imagen se realiza mediante un proyector de visión independiente (`mmproj-Qwen3.5-4B-F16.gguf`, 0,67 GB) que se carga junto al modelo en llama.cpp. La arquitectura incluye un bloque MTP (multi-token prediction) que actúa como drafter para decodificación especulativa, disponible como fichero GGUF separado y solo utilizable en builds de llama.cpp con soporte de MTP. La model card menciona además un componente delta-net con vectores de compuerta que permanecen en F16.

El entrenamiento QAT se aplicó exclusivamente a las 200 proyecciones del decodificador, entrenadas directamente sobre la retícula Q4_0 mediante autodestilación desde el modelo BF16 congelado. Según el autor, esto redujo la KL respecto al profesor de 0,0383 con redondeo Q4_0 simple a 0,0142 tras el entrenamiento. Los códigos INT4 y escalas entrenados se empaquetan directamente en el GGUF sin pasar por `llama-quantize`, evitando un segundo redondeo; el autor afirma haber verificado los bloques empaquetados byte a byte contra la exportación de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo thinking (etiqueta `reasoning`/`thinking` en el repositorio).
- Comprensión de imágenes y respuesta en texto (image-text-to-text) mediante el proyector de visión.
- Procesamiento de contexto largo (etiqueta `long-context`; sin cifra concreta publicada).
- Decodificación especulativa con bloque MTP en builds compatibles de llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente local multimodal en estación de trabajo: cargando el GGUF Q4_0 junto con `mmproj-Qwen3.5-4B-F16.gguf` en `llama-server`, el modelo puede responder preguntas sobre capturas de pantalla, diagramas o fotografías sin salir del equipo, con un peso total en disco de unos 3,4 GB.
- Prototipado rápido con Ollama o LM Studio: el comando `ollama run hf.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF:Q4_0` permite tener un modelo de razonamiento y visión operativo en minutos, útil para validar ideas antes de invertir en infraestructura GPU.
- Evaluación de técnicas de cuantización: investigadores que comparen PTQ frente a QAT pueden reproducir el harness de `llama-perplexity --kl-divergence` descrito en `EVAL.md` sobre 774 prompts y usar este modelo como referencia QAT con KL media de 0,235.
- Generación de texto en entornos con VRAM limitada: con 2,70 GB de pesos, cabe en GPUs de consumo de 6-8 GB junto con la caché KV, lo que permite desplegar un asistente de redacción o resumen en portátiles con RTX 3060 o superiores.
- Procesamiento por lotes de documentos con imágenes: pipelines que necesiten extraer descripciones o responder preguntas sobre páginas escaneadas pueden ejecutar el modelo en CPU o GPU modesta con llama.cpp, aceptando latencias mayores a cambio de coste cero por token.
- Base para fine-tuning ligero o experimentación académica: al ser Apache 2.0 y pesos GGUF de pequeño tamaño, sirve como punto de partida para estudios de destilación o de cuantización adicional sin restricciones de uso comercial.
- Aceleración de inferencia interactiva: en builds de llama.cpp con MTP, el fichero `-MTP.gguf` actúa como drafter especulativo, reduciendo la latencia por token en generación autoregresiva.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad respecto al modelo BF16 original, medidas con `llama-perplexity --kl-divergence` sobre 774 prompts reservados renderizados con la plantilla de chat y fragmentos de 4096 tokens. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| GGUF | Tamano | KL media (↓) | KL mediana (↓) | Top-1 (↑) |
|---|---:|---:|---:|---:|
| QUASAR Q4_0 | 2,70 GB | 0,235 | 0,0053 | 91,3 % |
| bartowski Q4_0 | 2,78 GB | 0,284 | 0,0075 | 90,4 % |
| Unsloth Q4_0 | 2,58 GB | 0,300 | 0,0077 | 90,2 % |
| YoozLabs QAT Q4_0 (retícula grupo-64, recuantizado a Q4_0) | 2,54 GB | 0,363 | 0,0147 | 88,4 % |
| Q4_K_M del original BF16 (`llama-quantize`) | 2,78 GB | 0,319 | 0,0072 | 90,3 % |
| Q4_0 por redondeo simple (`llama-quantize`) | 2,61 GB | 0,372 | 0,0108 | 89,0 % |

Según el autor, QUASAR obtiene la KL más baja y el mayor acuerdo top-1 entre los ficheros Q4_0 probados, tanto PTQ como QAT, y supera al Q4_K_M de referencia usando un 3 % menos de bytes. En el entrenamiento, la KL respecto al profesor bajó de 0,0383 (redondeo Q4_0 simple) a 0,0142.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q4_0 ocupan 2,70 GB; con caché KV y overhead de llama.cpp, el uso realista se sitúa en torno a 4-5 GB para contexto moderado. La variante con embeddings F16 sube a 3,30 GB de pesos y la MTP a 2,94 GB. Para entrada de imagen hay que sumar el proyector de 0,67 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 8 GB, RTX 4060, RTX 4070) para ejecución cómoda; A100 y H100 no son necesarias para este tamaño y solo tendrían sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas de 6-8 GB con cuantización Q4_0 y contexto moderado; también es viable en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio; el repositorio declara compatibilidad con endpoints. No se menciona soporte de vLLM o TGI para este fichero GGUF (las variantes NVFP4 cubren ese caso).
- Latencia y throughput: no disponibles en la información proporcionada. El bloque MTP puede reducir la latencia en builds con decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| QUASAR Q4_0 (este) | 4.205.751.296 | no disponible | GGUF Q4_0, 2,70 GB | Apache 2.0 | KL media 0,235; top-1 91,3 % |
| bartowski Q4_0 de Qwen3.5-4B | 4.205.751.296 (base) | no disponible | GGUF Q4_0, 2,78 GB | Apache 2.0 | KL media 0,284; top-1 90,4 % |
| Unsloth Q4_0 de Qwen3.5-4B | 4.205.751.296 (base) | no disponible | GGUF Q4_0, 2,58 GB | Apache 2.0 | KL media 0,300; top-1 90,2 % |
| YoozLabs QAT Q4_0 de Qwen3.5-4B | 4.205.751.296 (base) | no disponible | GGUF Q4_0, 2,54 GB | Apache 2.0 | KL media 0,363; top-1 88,4 %; QAT sobre retícula grupo-64 recuantizada |

Las tres alternativas son cuantizaciones del mismo modelo base, por lo que la comparación se limita a la fidelidad respecto al BF16 y al tamaño del fichero. No se dispone de datos para comparar con modelos de otros fabricantes de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar del Qwen3.5-4B original, hereda los sesgos de sus datos de entrenamiento, que no se documentan aquí.
- Riesgo de alucinación: inherente a los modelos generativos de 4B parámetros; la cuantización Q4_0 añade una degradación medible (KL media 0,235 frente al BF16), mayor en las colas de la distribución aunque baja en mediana (0,0053).
- Limitaciones de contexto e idioma: no se publica la longitud de contexto ni la lista de idiomas soportados; conviene validar ambos aspectos antes de usarlo en producción multilingüe o con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia del modelo base enlazado en la model card.
- Decodificación especulativa MTP: solo funciona en builds de llama.cpp con soporte de MTP; en builds estándar debe usarse el fichero por defecto sin el bloque drafter.
- Visión: requiere cargar explícitamente el fichero `mmproj-Qwen3.5-4B-F16.gguf`; sin él, el modelo solo procesa texto.
- Tool calling y comportamiento agéntico: no documentados en la información disponible; no deben asumirse en un despliegue sin pruebas previas.
- Los resultados de KL proceden del propio autor y de un harness concreto (774 prompts, fragmentos de 4096 tokens); no son directamente comparables con evaluaciones de tareas estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Página del proyecto: https://quasar-qat.github.io/
- Código: https://github.com/vincentcounathe/quasar-qat
- Paper QUASAR: https://arxiv.org/abs/2608.13966
- Detalles de evaluación: https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF/blob/main/EVAL.md
- Variante NVFP4 W4A16 (vLLM): https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-NVFP4
- Variante NVFP4 W4A4 (Blackwell): https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-NVFP4-W4A4
- Colección QUASAR-QAT: https://huggingface.co/collections/QUASAR-QAT/quasar-qat-models-6aa3452a0caa78ce72bbbe0f
- Build Q4_0 de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-4B-GGUF
- Build Q4_0 de Unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Build QAT Q4_0 de YoozLabs: https://huggingface.co/YoozLabs/Qwen3.5-4B-qat-GGUF
