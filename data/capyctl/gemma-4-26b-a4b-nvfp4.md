# capyctl/Gemma-4-26B-A4B-NVFP4

## Resumen

Gemma-4-26B-A4B-NVFP4 es una cuantización del modelo multimodal `google/gemma-4-26B-A4B-it` de Google, publicada por el usuario capyctl. Se trata de una variante de pesos reducidos en precisión (NVFP4 para los expertos enrutados y FP8 para las proyecciones densas) pensada para reducir el ancho de banda de memoria y el espacio de almacenamiento manteniendo la fidelidad de la salida del modelo original. El checkpoint ocupa 17,9 GB en el repositorio y declara un payload tensorial de 17,875 GB.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con capacidades de imagen-a-texto, según los tags de Hugging Face (`image-text-to-text`, `gemma4`). La nomenclatura "26B-A4B" sugiere 26 mil millones de parámetros totales con aproximadamente 4 mil millones activos por token, aunque los safetensors del checkpoint cuantizado reportan 15.125.138.736 parámetros almacenados, cifra que no coincide con la nomenclatura del nombre y que conviene tratar con cautela.

La relevancia de esta ficha reside en que documenta un experimento de cuantización agresiva (W4A4 en expertos, W8A8 en atención y MLP denso) con mediciones de rendimiento en un único dispositivo NVIDIA GB10, incluyendo comparativas frente a las recetas de NVIDIA y Unsloth. Es material útil para quien evalúe el despliegue de modelos MoE multimodales en hardware de gama workstation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, base `google/gemma-4-26B-A4B-it` |
| Parametros totales | 15.125.138.736 (según safetensors del checkpoint cuantizado); el nombre indica 26B totales / 4B activos en el modelo base |
| Parametros activos | Aproximadamente 4B según la nomenclatura "A4B" del modelo base; no confirmado en la información disponible |
| Longitud de contexto | 131.072 tokens (contexto declarado) |
| Tipos de cuantizacion | NVFP4 W4A4 grupo 16 en expertos enrutados; FP8 E4M3 W8A8 por tensor en MLP denso, atención y cabeza de salida; BF16 en embeddings, router, norms, escalares de capa y visión; KV cache con declaración de metadatos FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 30 capas, 128 expertos por capa y tres proyecciones por experto (11.520 matrices enrutadas en total, según las notas de construcción). La variante cuantizada conserva en BF16 el embedding de entrada, el router, las normas, los escalares de capa y el codificador de visión, mientras que aplica NVFP4 W4A4 con escalas de bloque buscadas a los expertos enrutados y FP8 E4M3 W8A8 por tensor a las 90 proyecciones del MLP denso, las 115 proyecciones de atención y la cabeza de salida (que está desatada, `tie_word_embeddings=false`). El KV cache declara metadatos FP8 pero no incluye tensores de escala K/V calibrados.

La cuantización se realizó con NVIDIA Model Optimizer 0.47.0 sobre el commit `4d7ae4984b7db7de8f8457170b3f1a419ee76d52` del modelo base. El autor documenta una ablación de familia que compara distintas combinaciones de precisión: con los mismos expertos NVFP4, mantener MLP denso y atención en BF16 da un 97,397% de acuerdo greedy en el siguiente token; usar NVFP4 solo en el MLP denso baja al 96,455%, y solo en atención al 95,512%. La combinación FP8 para ambos da 97,151%, y la receta final (r3) con cabeza FP8 por tensor mide 97,177%. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO, ya que esos datos pertenecen a la model card de Google y no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del modelo base `gemma-4-26B-A4B-it`.
- Procesamiento de imagen y texto (`image-text-to-text`), con el codificador de visión conservado en BF16.
- Razonamiento multi-paso y soporte de agentes, evidenciado por las pruebas de function calling (30/30 en el conjunto de herramientas).
- Tool calling / function calling mediante el parser Gemma4, con 30/30 casos automáticos superados.
- Capacidades matemáticas evaluadas con GSM8K (244/250 en la receta principal).
- Decodificación especulativa compatible con MTP (Multi-Token Prediction) de Google y con DFlash, según las recetas medidas.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU NVIDIA GB10: el checkpoint cabe en 17,9 GB y permite inferencia local de un MoE multimodal con 131k de contexto, adecuado para entornos de desarrollo sin clúster.
- Asistentes conversacionales multi-turno con contexto largo: la ventana de 131.072 tokens permite mantener historiales extensos y documentos largos en memoria, con TTFT medido de 5,2 a 7,3 segundos para 24.000 tokens de entrada según motor.
- Automatización de agentes con tool calling: los 30/30 casos de function calling y la integración con parsers de Gemma4 lo hacen apto para pipelines de agentes que invocan APIs externas.
- Procesamiento de documentos con imagen: al conservar el codificador de visión en BF16, puede extraer información de capturas, formularios o diagramas combinados con texto.
- Evaluación de recetas de cuantización: sirve como referencia reproducible para comparar NVFP4 frente a FP8 y BF16 en términos de acuerdo greedy y throughput, con notas de construcción y SHA-256 publicados.
- Servicio de inferencia de alto throughput en un solo dispositivo: con 8 streams agregados de hasta 302 tokens/s en vLLM con MTP3, es viable para cargas de trabajo moderadas de generación concurrente.
- Investigación en eficiencia de memoria: el layout con expertos en NVFP4 y resto en FP8 reduce la lectura de pesos a 3,208 GB/token estimados frente a 5,592 GB/token de la variante NVFP4 de NVIDIA, lo que lo hace útil para estudiar cuellos de botella de ancho de banda.

## Benchmarks y rendimiento

Mediciones del autor en un único GB10 con CapyCTL 0.1.12, TP1, temperatura 0, hasta 512 tokens de salida, tres rondas tras calentamiento:

| Checkpoint y receta | 1 stream (tok/s) | 8 streams (tok/s total) | TTFT 24k, 1/4 streams | GSM8K | Tools |
|---|---:|---:|---|---:|---:|
| Este checkpoint, vLLM 0.32.0 + Google MTP depth 3 | 79,56 | 302,29 | 7,277 / 18,857 s | 244/250 | 30/30 |
| Este checkpoint, SGLang 0.5.22 + DFlash width 8 | 72,04 | 254,05 | 5,348 / 13,836 s | 244/250 | 30/30 |
| Este checkpoint, SGLang + Google MTP depth 3 | 62,24 | 278,11 | 5,227 / 13,760 s | 242/250 | 30/30 |
| Este checkpoint, vLLM, sin drafts | 58,53 | 216,26 | 6,540 / 16,373 s | 244/250 | 30/30 |
| Este checkpoint, SGLang, sin drafts | 56,99 | 210,78 | 5,414 / 13,402 s | 244/250 | 30/30 |
| Build de NVIDIA en SGLang 0.5.22, contexto 131k, sin drafts | 29,47 | 167,67 | 5,738 / 14,221 s | 243/250 | 30/30 |
| NVIDIA NVFP4, vLLM, sin drafts | 29,73 | 164,89 | 7,129 / 17,779 s | 244/250 | 30/30 |
| Unsloth NVFP4, vLLM, sin drafts | 45,74 | 202,29 | 6,602 / 16,463 s | 244/250 | 30/30 |

Barridos completos de las recetas publicadas:

| Receta | 1 stream (tok/s) | 8 streams (tok/s) | TTFT objetivo 32k | Listo en frío / caliente |
|---|---:|---:|---:|---|
| vLLM MTP3 | 76,36 | 297,10 | 13,118 s | 261,79 / 184,99 s |
| SGLang DFlash8 | 71,69 | 255,15 | 7,836 s | 148,99 / 120,67 s |

El autor advierte que una respuesta de GSM8K equivale a 0,4 puntos porcentuales y que estos resultados no establecen una ventaja de precisión. Las comparativas de throughput mezclan motores y configuraciones de drafter distintas, por lo que no son estrictamente equivalentes.

## Requisitos de hardware

- VRAM estimada: el payload tensorial es de 17,875 GB; con overhead de activaciones, KV cache y buffers, se recomienda al menos 24 GB de memoria unificada o VRAM para contexto corto, y más para contexto largo.
- GPU recomendadas: NVIDIA GB10 (medido por el autor); por tamaño, debería caber en GPUs consumer de 24 GB o más (RTX 4090, RTX 3090) para contexto moderado, aunque no se han publicado mediciones en esas tarjetas.
- Opciones de despliegue: vLLM 0.32.0 (con y sin MTP), SGLang 0.5.22 (con DFlash y MTP), y presumiblemente transformers por la librería declarada; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 79,56 tok/s en un stream y 302,29 tok/s agregados en 8 streams con vLLM + MTP3; TTFT de 7,277 s para 24.000 tokens en un stream y 18,857 s en cuatro streams.
- Arranque: 261,79 s en frío y 184,99 s en caliente con vLLM MTP3; 148,99 s y 120,67 s con SGLang DFlash8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Throughput 1 stream (GB10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (capyctl, NVFP4+FP8) | 15,1B almacenados (base 26B-A4B) | 131.072 | 79,56 tok/s (vLLM MTP3) | Apache 2.0 | Hugging Face |
| NVIDIA NVFP4 de Gemma-4-26B-A4B | No disponible | No disponible | 29,73 tok/s (vLLM) | No disponible | Hugging Face |
| Unsloth NVFP4 de Gemma-4-26B-A4B | No disponible | No disponible | 45,74 tok/s (vLLM) | No disponible | Hugging Face |
| Build de NVIDIA en SGLang (contexto 131k) | No disponible | 131.072 | 29,47 tok/s (SGLang) | No disponible | Hugging Face |

Las cifras de throughput corresponden a recetas y configuraciones de drafter distintas, por lo que la comparación no aísla el efecto del checkpoint. El autor indica que el mejor resultado con vLLM MTP3 es 2,7 veces la decodificación de un stream de la línea base de producción de NVIDIA y 1,8 veces su throughput de ocho streams.

## Limitaciones y advertencias

- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 18 de noviembre de 2026; no hay validación comunitaria independiente.
- La cifra de parámetros de safetensors (15,1B) no coincide con la nomenclatura "26B-A4B" del modelo base; conviene verificar el layout antes de asumir el tamaño efectivo.
- La cuantización NVFP4 en expertos reduce el acuerdo greedy al 97,177% frente al modelo en BF16; no es una conversión sin pérdida y puede degradar tareas sensibles a la precisión numérica.
- El KV cache declara metadatos FP8 pero no incluye tensores de escala K/V calibrados, lo que puede afectar a la calidad en contextos muy largos.
- Las mediciones de rendimiento provienen de un único dispositivo GB10 y de recetas concretas; no hay datos de latencia o throughput en A100, H100 ni GPUs consumer.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación del modelo base en la documentación proporcionada.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar también los términos del modelo base de Google, que no se detallan en esta información.
- El autor advierte que el acuerdo greedy exacto no es una prueba de ausencia de pérdida, ya que las salidas sin drafts cambian con la forma de ejecución y entre procesos en vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/capyctl/Gemma-4-26B-A4B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio CapyCTL: https://github.com/edurdias/capyctl
- Notas de construcción y recetas: https://github.com/edurdias/capyctl-recipes/blob/main/vllm/gemma-4-26b-a4b-capyctl-nvfp4-gb10/convert/NOTES.md
- Ablación de familia: https://github.com/edurdias/capyctl-recipes/blob/main/comparisons/gemma-4-26b-a4b-nvfp4-builds-gb10/tensors/ablation/results/summary.md
- Matriz final de benchmarks: https://github.com/edurdias/capyctl-recipes/blob/main/comparisons/gemma-4-26b-a4b-nvfp4-builds-gb10/bench/final-matrix.json
