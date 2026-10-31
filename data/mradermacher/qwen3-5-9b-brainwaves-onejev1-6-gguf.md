# mradermacher/Qwen3.5-9B-Brainwaves-OneJev1.6-GGUF

## Resumen

Qwen3.5-9B-Brainwaves-OneJev1.6 es un modelo de generación de texto de unos 9.200 millones de parámetros (9.197.093.888 exactos según los safetensors), desarrollado por nightmedia como un merge experimental basado en la familia Qwen 3.5/3.6. Según los tags de la model card, se trata de un modelo destilado (los tags mencionan "claude-distillation"), afinado con SFT y LoRA, orientado a razonamiento con cadenas de pensamiento largas (long-CoT), matemáticas, programación y, de forma muy destacada, escritura creativa y roleplaying. La ficha aquí presentada corresponde a la cuantización GGUF publicada por mradermacher, que ofrece versiones estáticas desde Q2_K hasta f16.

Su relevancia radica en la combinación de un tamaño contenido (cabe en GPUs de consumo), un contexto muy largo (los tags anuncian 256k y hasta 1M de tokens), soporte multimodal (incluye archivos mmproj) y técnicas como multi-token prediction y decodificación especulativa. Es un modelo experimental dirigido a desarrolladores e investigadores que quieren explorar merges de última generación sin hardware de servidor.

Cabe subrayar que la mayor parte de la información técnica (arquitectura detallada, datos de entrenamiento, benchmarks) no está publicada en la model card disponible, por lo que esta ficha señala expresamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen 3.5/3.6, con multi-token prediction (detalle completo no disponible) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | Hasta 1M de tokens segun tags (256k mencionado tambien); no verificado en la model card |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (ademas de mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | Ingles, chino, japones, castellano (en, zh, ja, es) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (esta cuantizacion); el modelo base esta en safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un merge (creado con mergekit, segun los tags) construido sobre la base Qwen 3.5 de nightmedia, integrando elementos de la linea Qwen3.6 y, segun los tags, destilacion desde modelos tipo Claude ("claude-distillation"). Los tags indican entrenamiento mediante SFT y LoRA, con enfoque en razonamiento mediante chain-of-thought largo (long-cot). Incluye ademas un suplemento multimodal (archivos mmproj en el repo GGUF), lo que sugiere capacidad de vision, aunque la model card no lo documenta.

Entre las innovaciones tecnicas declaradas en los tags figuran multi-token prediction y soporte de decodificacion especulativa (speculative-decoding), ambas orientadas a acelerar la inferencia. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional (instruction-tuned).
- Razonamiento con cadenas de pensamiento largas (long-CoT, tags "reasoning", "chain-of-thought").
- Programacion (tag "coding") y tareas STEM/matematicas (tags "math", "stem").
- Escritura creativa muy destacada: generacion de tramas, sub-tramas, escenas, narrativa de ciencia ficcion y "todos los generos", escritura vividay roleplaying.
- Capacidades multimodales sugeridas por los archivos mmproj incluidos (vision; no documentado en detalle).
- Multilingual: ingles, chino, japones y castellano.
- Contexto ultralargo (256k-1M segun tags), util para documentos extensos.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible explicitamente, aunque el long-CoT sugiere aptitud para razonamiento multi-paso.

## Casos de uso

- Escritura de ficcion asistida: generacion de tramas, sub-tramas y continuacion de escenas; los tags dedicados a storytelling y "vivid prose" lo hacen adecuado para autores que iteran borradores narrativos localmente.
- Roleplaying e interactive fiction: modelo afinado para personajes y dialogo inmersivo, ejecutable en GPUs de consumo para uso en tiempo real.
- Razonamiento matematico y STEM: el long-CoT y los tags de matematicas lo orientan a resolucion de problemas paso a paso en educacion o investigacion.
- Programacion y depuracion de codigo: util como asistente de codigo local para tareas de generacion y revision, aunque sin benchmarks publicados que cuantifiquen su nivel.
- Analisis de documentos largos: con contexto de 256k-1M tokens (segun tags), puede procesar informes, contratos o bases de codigo extensas en una sola sesion.
- Investigacion sobre merges y cuantizacion: al ser un merge experimental con cuants estaticos completos (Q2_K a f16), sirve como banco de pruebas para estudiar la degradacion de calidad por cuantizacion en modelos de 9B.
- Asistente conversacional multilingue: soporte de castellano, ingles, chino y japones para chatbots locales de proposito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV-cache):
  - Q2_K: ~4,0 GB; Q3_K_M: ~4,8 GB; Q4_K_M: ~5,9 GB; Q5_K_M: ~6,7 GB; Q6_K: ~7,7 GB; Q8_0: ~9,9 GB; f16: ~18,5 GB.
  - Anadir margen para el contexto: con ventanas de 256k-1M tokens, el KV-cache puede requerir varios GB adicionales.
- GPU recomendadas: RTX 3060 12GB o superior para quants Q4; RTX 4090 (24 GB) para Q8_0 con contexto amplio; para f16 y contextos de 1M tokens, A100/H100 o gran cantidad de RAM con offload a CPU.
- Consumer GPUs: si cabe. La mayoria de quants (Q2_K a Q6_K) funcionan en GPUs de 6-12 GB; incluso portatiles con GPU dedicada moderna pueden ejecutar los quants mas pequeños.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en safetensors es compatible con vLLM, TGI y transformers, y existen tags de MLX para Apple Silicon.
- Latencia y throughput: no disponible. Los tags de multi-token prediction y speculative-decoding sugieren aceleracion de inferencia, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-OneJev1.6 (este) | 9,2B | 256k-1M (segun tags, no verificado) | Apache-2.0 | Merge experimental, sesgo creativo, multimodal (mmproj) |
| Qwen3-8B (oficial) | 8,2B | 128k | Apache-2.0 | Modelo base de referencia, benchmarks publicados, ecosistema maduro |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Amplio soporte de tooling, licencia con restricciones frente a Apache-2.0 |
| Gemma 2 9B | 9B | 8k | Gemma Terms of Use | Buen rendimiento general, contexto mucho mas corto |

Nota: la comparativa se basa en caracteristicas publicas de los modelos alternativos; para este merge no hay benchmarks que permitan comparar rendimiento numerico.

## Limitaciones y advertencias

- Modelo experimental: al ser un merge con destilacion y LoRA, su comportamiento puede ser menos predecible que el de modelos oficiales; no hay evaluaciones publicadas.
- Riesgo de alucinacion: no documentado especificamente, pero inherente a modelos generativos; el enfoque creativo puede acentuar la invencion de detalles en tareas factuales.
- Sesgos: no disponible; heredara presumiblemente los sesgos de los datos de Qwen y de los datasets de destilacion/finetuning.
- Contexto: los tags anuncian 256k y 1M tokens, pero la model card no lo verifica; con quants bajos (Q2_K, Q3_K) la calidad se degrada notablemente, especialmente en contextos largos.
- Idiomas: solo hay soporte declarado de cuatro idiomas; el rendimiento en castellano no esta evaluado.
- Licencia: Apache-2.0, permisiva para uso comercial; sin restricciones conocidas mas alla de las standard.
- Multimodalidad: los archivos mmproj existen, pero la capacidad visual no esta documentada; verificar compatibilidad con el runtime antes de depender de ella.
- Para produccion: la ausencia de benchmarks y de documentacion de entrenamiento recomienda evaluacion interna exhaustiva antes de desplegar.

## Enlaces

- Cuantizacion GGUF (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-9B-Brainwaves-OneJev1.6-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-OneJev1.6
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/Qwen3.5-9B-Brainwaves-OneJev1.6-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-9B-Brainwaves-OneJev1.6-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
