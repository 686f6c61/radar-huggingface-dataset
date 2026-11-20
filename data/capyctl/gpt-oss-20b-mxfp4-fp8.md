# capyctl/gpt-oss-20b-MXFP4-FP8

## Resumen

`capyctl/gpt-oss-20b-MXFP4-FP8` es una conversión cuantizada del modelo `openai/gpt-oss-20b` de OpenAI, publicada por el usuario capyctl. No es un modelo nuevo: es un checkpoint derivado que mantiene los pesos de los expertos en el formato MXFP4 original de OpenAI, pero cuantiza las 96 matrices de atención Q/K/V/O a FP8 E4M3 con escalas FP32 por canal de salida, dejando la cabeza de salida, el embedding de entrada, los routers y las normas en BF16. El objetivo es reducir el tráfico de pesos por token en inferencia con vLLM sin degradar la calidad de forma medible.

El resultado declarado es una reducción del 17,2 % en bytes de pesos leídos por token (de 3,708 GB/token a 3,072 GB/token, cálculo aritmético del payload, no ancho de banda observado) y una mejora de velocidad del 26,1 % a un stream y del 6,9 % a ocho streams frente al checkpoint original de OpenAI en el mismo entorno vLLM 0.32.0. Las mediciones se realizaron en una única NVIDIA GB10 con TP1 y contexto de 131.072 tokens.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización mixta (MXFP4 + FP8) aplicada a un modelo MoE con expertos ya cuantizados; por otro, incluye una auditoría de conversión y una comparativa reproducible frente a otros checkpoints públicos (LMSYS BF16, shanjiaz NVFP4, mmangkad NVFP4, RedHatAI), lo que permite evaluar el estado real del ecosistema de variantes de gpt-oss-20b.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gpt_oss), basado en openai/gpt-oss-20b |
| Parametros totales | 11.359.608.384 (~11,36 B) |
| Parametros activos | no disponible (el modelo base gpt-oss-20b es MoE con 4 expertos seleccionados por capa según la model card, pero no se declara el total de parámetros activos) |
| Longitud de contexto | 131.072 tokens (configuración de inferencia declarada) |
| Tipos de cuantizacion | MXFP4 (expertos, grupo 32, escalas E8M0), FP8 E4M3 (atención Q/K/V/O, escalas FP32 por canal de salida), BF16 (cabeza de salida, embedding, routers, normas y sesgos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería vLLM) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `openai/gpt-oss-20b`: un transformer con mezcla de expertos (MoE) en el que cada capa selecciona cuatro expertos. La conversión de capyctl no reentrena ni modifica los pesos de los expertos: los mantiene en MXFP4 original con escalas E8M0 de grupo 32 y una serialización Quark reversible por experto. Los sesgos de experto permanecen en BF16 byte a byte idénticos al original. Lo que cambia es la atención: las 96 matrices Q/K/V/O pasan a FP8 E4M3 con escalas multiplicativas FP32 por canal de salida, y en tiempo de ejecución se aplica cuantización dinámica FP8 por token a la entrada. La cabeza de salida y el embedding de entrada se mantienen sin atar y en BF16, igual que routers, normas, attention sinks y otros sesgos.

La auditoría de conversión publicada cubre 459 tensores de origen y 5.019 candidatos: los 144 tensores de pesos empaquetados, escalas y sesgos de experto se reconstruyen de forma byte-idéntica, y los 96 pares de peso y escala de atención cumplen la regla de conversión. El resto de tensores no se modifica. No se declara información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, ya que se trata de una cuantización y no de un entrenamiento. Tampoco se documentan innovaciones de decodificación especulativa: las mediciones se realizan sin drafter.

## Capacidades

- Generación de texto y conversación multi-turno, con el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento de varios pasos con modo de esfuerzo de razonamiento configurable (las mediciones usan `reasoning effort low`).
- Soporte de tool calling y function calling: la model card reporta 30/30 en la prueba de herramientas.
- Resolución de problemas matemáticos y de razonamiento cuantitativo: 237/250 en GSM8K con el checkpoint convertido.
- Generación de código, evaluada dentro del conjunto de ocho prompts fijos de chat y código usados para medir velocidad.
- Recuperación en contexto largo: 48/48 observaciones superadas en documentos de 32k, 64k, 96k y 111k tokens, con los tres códigos presentes y en orden exacto.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- No se declaran capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Despliegue de inferencia en producción con vLLM: el checkpoint está empaquetado para vLLM 0.32.0 y reduce el tráfico de pesos por token un 17,2 % frente al original, lo que se traduce en menor presión de memoria y mayor throughput en hardware con ancho de banda limitado como una GB10.
- Servicio de chat con contexto largo: con 131.072 tokens de ventana y decodificación sostenida de 42,54 tokens/s a 110.000 tokens de entrada, es adecuado para asistentes que deben razonar sobre documentos extensos sin trocear el contexto.
- Procesamiento de documentación técnica y recuperación de información: las pruebas de retrieval a 32k, 64k, 96k y 111k tokens superan 48/48 observaciones, lo que lo hace apto para pipelines de pregunta-respuesta sobre contratos, informes o bases de conocimiento.
- Agentes con tool calling: la puntuación de 30/30 en pruebas de herramientas permite integrarlo en flujos de agente que invocan APIs, consultan bases de datos o ejecutan acciones multi-paso.
- Evaluación y benchmarking de variantes cuantizadas: al incluir una auditoría de conversión y comparativas reproducibles frente a otros checkpoints, sirve como referencia para validar pipelines de cuantización MXFP4/FP8 en modelos MoE.
- Asistencia a desarrollo de software: los ocho prompts fijos de chat y código y la ventana de 131k tokens permiten usarlo para revisión de código en repositorios medianos y generación de parches con contexto de varios archivos.
- Razonamiento matemático en entornos educativos o de análisis: 237/250 en GSM8K con cero errores HTTP y cero truncamientos por precisión en la configuración nativa de 8.192 tokens.

## Benchmarks y rendimiento

Mediciones declaradas por el autor en una NVIDIA GB10, TP1, contexto de 131.072 tokens, KV en FP8 E4M3, LMCache desactivado, temperatura cero y esfuerzo de razonamiento bajo. La velocidad usa ocho prompts fijos de chat y código, un calentamiento y tres rondas medidas, con tope de 512 tokens de finalización total incluyendo razonamiento.

| Checkpoint y configuración | 1 stream (tok/s) | 8 streams (tok/s agregados) | TTFT 24k, 1/4 streams (s) | GSM8K | Tools |
|---|---:|---:|---|---:|---:|
| Este checkpoint, vLLM 0.32.0, sin drafter | 57,77 | 196,71 | 3,543 / 9,601 | 237/250 | 30/30 |
| OpenAI, mismo vLLM 0.32.0 | 45,81 | 184,07 | 3,760 / 10,141 | 236/250 | 30/30 |
| OpenAI en SGLang 0.5.22, configuración de producción 131k | 44,85 | 178,67 | 3,180 / 12,236 | 232/250 | 30/30 |
| LMSYS gpt-oss-20b-bf16, mismo vLLM, MoE en BF16 | 28,22 | 70,14 | no medido | 237/250 | 30/30 |
| ggml-org MXFP4/Q8_0, llama.cpp b12242, sin drafter | 76,16 | 145,87 | 6,092 / 18,688 | 237/250, un tope alcanzado | 30/30 |

Decodificación en contexto largo, un stream, tres rondas por documento fijo, tope de 512 tokens, sin caché de prefijo en vLLM:

| Tokens de entrada exactos | Este checkpoint (tok/s) | OpenAI, mismo vLLM | SGLang producción |
|---:|---:|---:|---:|
| 8.000 | 56,35 | 44,85 | 43,67 |
| 32.000 | 52,23 | 42,18 | 40,32 |
| 64.000 | 47,57 | 39,17 | 36,71 |
| 110.000 | 42,54 | 35,50 | 32,48 |

El autor advierte que la diferencia de un punto en GSM8K no establece ventaja de precisión y que la comparación frente a SGLang combina motor y checkpoint. La ventaja de llama.cpp en decodificación a un stream viene acompañada de un tope de GSM8K alcanzado por repetición de espacios Unicode, por lo que no se considera una pasada limpia de revisión de salida.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload de pesos es de 13.125.022.848 bytes (~13,1 GB); con overhead de KV, activaciones y scratch, se recomienda al menos 24 GB de VRAM para contexto moderado y más de 40 GB para contexto de 131k tokens.
- GPU recomendadas: NVIDIA GB10 (entorno validado), A100 40/80 GB, H100, y GPUs consumer de 24 GB o más (RTX 4090, RTX 3090) para contextos reducidos.
- Cabe en GPU consumer: sí, en RTX 4090 o RTX 3090 de 24 GB con contexto limitado; el contexto completo de 131k requiere mayor capacidad.
- Opciones de despliegue: vLLM 0.32.0 es el motor validado y declarado en la librería. No se documenta compatibilidad con llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: 57,77 tok/s a un stream y 196,71 tok/s agregados a ocho streams en GB10; TTFT de 3,543 s a un stream y 9,601 s a cuatro streams con 24k tokens de entrada. A 110k tokens de entrada, 42,54 tok/s de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| capyctl/gpt-oss-20b-MXFP4-FP8 | 11,36 B | 131.072 | Apache 2.0 | safetensors (vLLM) | MXFP4 expertos + FP8 atención; 57,77 tok/s a 1 stream en GB10 |
| openai/gpt-oss-20b | no disponible | 131.072 (config. de inferencia) | Apache 2.0 | safetensors | Checkpoint original BF16/MXFP4; 45,81 tok/s a 1 stream en el mismo vLLM |
| lmsys/gpt-oss-20b-bf16 | no disponible | no disponible | Apache 2.0 | safetensors | Expertos en E5M2 FP8 pero cargado como BF16 TritonExperts; 28,22 tok/s a 1 stream |
| shanjiaz/gpt-oss-20b-nvfp4-modelopt | no disponible | no disponible | Apache 2.0 | safetensors | NVFP4; falla al cargar en vLLM 0.32.0 con `KeyError: layers.0.mlp.experts.w2_bias` |
| mmangkad/gpt-oss-20b-nvfp4 | no disponible | no disponible | Apache 2.0 | safetensors | NVFP4; mismo fallo de carga de sesgo de experto |
| RedHatAI/gpt-oss-20b | no disponible | no disponible | Apache 2.0 | safetensors | Los tres shards raíz coinciden byte a byte con OpenAI; sin benchmark duplicado |

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos, el riesgo de alucinación y las limitaciones del modelo base `openai/gpt-oss-20b`.
- La cabeza de salida permanece en BF16 porque la implementación instalada de GPT-OSS en vLLM no propaga la configuración de cuantización a la cabeza; no existe una declaración solo de checkpoint que habilite una cabeza FP8 en esa implementación.
- La reducción del 17,2 % en lecturas de pesos es aritmética del payload, no ancho de banda observado; excluye tráfico de KV, activaciones, scratch y reutilización de caché por lote.
- Las mediciones se realizaron en una única NVIDIA GB10 con TP1; el rendimiento en otras GPU, configuraciones multi-GPU o con drafter no está documentado.
- No se declaran idiomas soportados, por lo que no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de los componentes de terceros (Quark, vLLM) antes de desplegar en producción.
- Los checkpoints NVFP4 comparados fallan al cargar en vLLM 0.32.0 por un fallo del loader, no por ausencia de sesgos; no deben interpretarse como alternativas funcionales en ese entorno.
- El autor advierte que la diferencia de un punto en GSM8K no constituye evidencia de ventaja de precisión frente al checkpoint original.
- No se han publicado resultados de benchmarks independientes fuera de los proporcionados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/capyctl/gpt-oss-20b-MXFP4-FP8
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Auditoría de conversión: https://github.com/edurdias/capyctl-recipes/blob/main/vllm/gpt-oss-20b-capyctl-gb10/convert/checkpoint-audit.json
- Repositorio CapyCTL: https://github.com/edurdias/capyctl
- LMSYS gpt-oss-20b-bf16: https://huggingface.co/lmsys/gpt-oss-20b-bf16
- shanjiaz NVFP4: https://huggingface.co/shanjiaz/gpt-oss-20b-nvfp4-modelopt
- mmangkad NVFP4: https://huggingface.co/mmangkad/gpt-oss-20b-nvfp4
- RedHatAI gpt-oss-20b: https://huggingface.co/RedHatAI/gpt-oss-20b
