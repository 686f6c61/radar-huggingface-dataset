# Rahspide/MNN-Pocket-0.3B-RU

## Resumen

MNN-Pocket-0.3B-RU es un modelo de lenguaje causal de 302,8 millones de parámetros desarrollado por el usuario Rahspide sobre la base `taobao-mnn/MNN-Pocket-0.3B-Base`, que emplea la arquitectura Qwen3. Se trata de un ajuste fino completo (continued pretraining) orientado a enseñar ruso al modelo manteniendo un inglés y chino funcionales, entrenado con 1.200 millones de tokens de texto crudo (900 M en ruso, 204 M en inglés y 96 M en chino) durante una única época. Su propósito no es conversacional sino de continuación de texto: completa un prefijo mecanografiado en lugar de responder a una instrucción, lo que lo hace idóneo para teclados predictivos, autocompletado y finalización de prefijos en dispositivos de borde.

El modelo resulta relevante por su escala reducida y su enfoque en despliegue on-device: cabe en hardware modesto, se publica en safetensors y GGUF (Q8_0 y Q4_K_M) y está pensado para integrarse en teclados móviles o asistentes de escritura con presupuesto de latencia estricto. Su contexto heredado de la base es de 32.000 tokens, aunque la ventana efectiva útil está limitada por su tamaño y por el tokenizador.

La ficha debe leerse con una advertencia clara: el modelo está marcado como *work-in-progress* por el autor, prioriza el ruso y degrada el inglés y el chino entre un 21 % y un 24 % en bits por carácter respecto a la base. No es un asistente conversacional; para ese fin existe un checkpoint hermano (`MNN-Pocket-0.3B-RU-Chat`) entrenado con SFT sobre este mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura Qwen3) |
| Parametros totales | 302.830.976 (58,7 M de embeddings + 244,1 M en el resto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de la base) |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M publicados; safetensors en fp16/fp32 |
| Idiomas soportados | ruso (principal), inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Tokenizador | BPE a nivel de byte, 65.536 tokens, `<|endoftext|>` = 65510 |
| Tokens de entrenamiento | 1.200 millones (900 M ru + 204 M en + 96 M zh) |
| Metodo de entrenamiento | Full fine-tune, 1 época, sin LoRA |
| Precisión de entrenamiento | fp32 master weights, autocast fp16 |
| Hardware de entrenamiento | 1× Colab T4 16 GB, ~69 h, 4,8 k tok/s |

## Arquitectura y entrenamiento

El modelo parte de `taobao-mnn/MNN-Pocket-0.3B-Base`, un transformer causal denso con arquitectura Qwen3 y tokenizador BPE a nivel de byte de 65.536 tokens. Ese vocabulario es una versión podada del original de Qwen3 (~151 k tokens) según el informe técnico asociado (arXiv:2611.12311), que redujo el conjunto por frecuencia conservando dependencias BPE y *byte fallback*. La consecuencia directa es una cobertura cirílica muy pobre: el ruso se tokeniza a 1,75–1,85 caracteres por token (frente a 3,78 en inglés), lo que encarece cada palabra rusa en tokens y explica parte de las decisiones de entrenamiento.

El ajuste consistió en un full fine-tune de una época sobre 1.200 millones de tokens de texto crudo (0,9 B ru, 0,204 B en, 0,096 B zh), en 36.621 pasos de 32.768 tokens, con pesos maestros en fp32 y autocast fp16 sobre una única T4 de 16 GB durante unas 69 horas. No se aplicó LoRA ni RLHF/DPO: es un modelo de continuación de texto entrenado como LM causal puro. El autor señala que el *replay mix* del 25 % resultó insuficiente para preservar inglés y chino a esta escala, y que un segundo pase con mezcla 50/25/25 a lr 5e-5 se inició pero no se publicó al no producir mejoras medibles en inglés.

## Capacidades

- Generación de texto por continuación de prefijo: completa frases a partir de un contexto mecanografiado, sin interpretar instrucciones.
- Predicción de siguiente token orientada a teclados predictivos y autocompletado en ruso.
- Finalización de prefijos a mitad de frase, incluida la continuación coherente de párrafos cortos.
- Comprensión y generación funcional de inglés y chino, aunque mediblemente degradadas respecto a la base.
- Manejo de contexto largo de hasta 32.768 tokens (heredado), útil para continuar documentos extensos.
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para razonamiento multi-paso ni para comportamiento de agente.
- No incluye modo *thinking*, visión ni audio.
- Capacidad multilingüe limitada a ru, en y zh.

## Casos de uso

- Teclados predictivos en ruso: el modelo continúa el texto que el usuario está escribiendo y sugiere la siguiente palabra o fragmento; su tamaño de 303 M y sus pesos GGUF Q4_K_M permiten ejecución local en móvil con latencia baja.
- Autocompletado de campos de texto en aplicaciones: al ser un modelo de continuación, encaja en cajas de búsqueda, formularios y editores donde se completa un prefijo sin necesidad de instrucciones.
- Finalización de frases en herramientas de escritura: útil para sugerir el resto de una oración en editores de texto o correctores, manteniendo el estilo del prefijo.
- Generación de texto asistida en ruso para borradores cortos: continuación de párrafos en documentación, correos o notas donde se requiere coherencia local más que razonamiento.
- Prototipado e investigación en modelos on-device: su reducido tamaño y su licencia Apache 2.0 lo hacen adecuado para experimentar con despliegue en edge, cuantización y evaluación de tokenizadores cirílicos.
- Filtrado y generación de texto en pipelines de datos en ruso: puede emplearse para completar o puntuar fragmentos cortos en tareas de preprocesamiento donde no se necesita un modelo grande.
- Base para ajuste fino posterior: sirve como punto de partida para SFT orientado a diálogo (como demuestra el checkpoint hermano `MNN-Pocket-0.3B-RU-Chat`) o para tareas específicas de dominio en ruso.

## Benchmarks y rendimiento

Evaluación sobre 100.000 tokens reservados por idioma, con ajustes idénticos para la base y la v1:

| Idioma | PPL base → v1 | Bits/carácter base → v1 | Top-1 base → v1 | Top-5 base → v1 |
|---|---|---|---|---|
| Ruso | 10,42 → 5,05 | 1,625 → 1,123 (−31 %) | 46,2 % → 61,0 % | 69,3 % → 80,6 % |
| Inglés | 21,85 → 41,16 | 1,016 → 1,225 (+21 %) | 39,9 % → 35,5 % | 64,1 % → 58,7 % |
| Chino | 23,95 → 51,86 | 3,274 → 4,071 (+24 %) | 41,9 % → 37,7 % | 62,0 % → 55,6 % |

Una reevaluación independiente de los pesos publicados (CPU, fp32, 20 k tokens por idioma) reproduce el mismo orden: ruso 1,022 frente a 1,519 de la base; inglés 1,337 frente a 1,124; chino 4,053 frente a 3,393. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,6 GB en fp16, ~0,3 GB en Q8_0 y ~0,2 GB en Q4_K_M para los pesos; el contexto de 32 k añade caché KV adicional.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) con holgura; también CPU y aceleradores móviles.
- Cabe en GPU consumer y en dispositivos de borde; el entrenamiento se realizó en una única T4 de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, transformers, text-generation-inference y el runtime MNN de Taobao para edge.
- Latencia y throughput: no se han publicado cifras de inferencia en la información disponible; el entrenamiento alcanzó 4,8 k tok/s en T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU | 302,8 M | 32.768 | ru, en, zh | Apache 2.0 | Continuación de texto en ruso, on-device |
| MNN-Pocket-0.3B-Base | 302,8 M (361,5 M en fichero por lm_head duplicado) | 32.768 | en, zh (ruso pobre) | Apache 2.0 | Base multilingüe sin ajuste en ruso |
| MNN-Pocket-0.3B-RU-Chat | mismo base | 32.768 | ru, en, zh | Apache 2.0 | SFT para diálogo sobre este modelo |
| Qwen3 (modelos pequeños de la familia) | variable | variable | multilingüe | variable según variante | Referencia arquitectónica de la que deriva el tokenizador |

La comparación con otras familias de 0,3 B no está disponible en la información proporcionada; los únicos puntos de referencia documentados son los checkpoints derivados del mismo base.

## Limitaciones y advertencias

- No es un asistente: continúa el prefijo en lugar de responder, por lo que no debe usarse para chat o Q&A sin el checkpoint `-Chat`.
- Degradación medible del inglés (+21 % en bits/carácter) y del chino (+24 %) respecto a la base; tratar como modelo ruso-first.
- Tokenizador cirílico ineficiente (1,75–1,85 caracteres por token), lo que encarece el ruso en tokens y en latencia.
- Tokenizador a nivel de byte: un cliente de streaming debe retener secuencias UTF-8 incompletas para evitar caracteres de reemplazo.
- Riesgo de alucinación y de continuaciones plausibles pero factualmente incorrectas, inherente a un LM causal de 0,3 B.
- Sesgos heredados de los corpus FineWeb y FineWeb-2, sin filtrado específico documentado.
- Estado *work-in-progress* declarado por el autor; no hay garantía de estabilidad en producción.
- Licencia Apache 2.0 permite uso comercial, pero la calidad limitada en inglés y chino restringe su aplicación fuera del ruso.
- Contexto nominal de 32 k sin evaluación publicada de rendimiento en ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Checkpoint conversacional hermano: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat
- Repositorio de entrenamiento (privado): https://huggingface.co/Rahspide/mnn-pocket-ru-run
- Informe técnico del tokenizador: https://arxiv.org/abs/2611.12311
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
