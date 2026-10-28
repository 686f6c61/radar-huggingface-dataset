# credible-ai/olmo2-1B-24domains-vertex-linear-hellaswag

## Resumen

`credible-ai/olmo2-1B-24domains-vertex-linear-hellaswag` es un modelo de lenguaje de 1.414.678.528 parámetros (≈1,41B) con arquitectura OLMo 2 (`Olmo2ForCausalLM`), 18 capas y tamaño oculto 2048, preentrenado desde cero sobre 32.000 millones de tokens del corpus WebOrganizer. Lo desarrolla el grupo credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix, un método de mezcla de datos que optimiza los pesos de muestreo entre dominios mediante un sustituto lineal ajustado sobre un enjambre de modelos proxy.

El modelo no es de propósito general: es un checkpoint de validación a escala 1B de una mezcla de 24 topics del corpus, cuyos pesos fueron optimizados por LinMix con la utilidad lineal π (r = 0) y tomando HellaSwag como objetivo. La mezcla se buscó primero sobre el proxy `credible-ai/olmo2-30M-24domains-vertex` y se trasladó después a este modelo de 1B. Es relevante porque permite estudiar empíricamente si las mezclas óptimas encontradas en modelos pequeños transfieren a escala mayor, un problema central en la curación de datasets de preentrenamiento.

Los pesos se publican en safetensors y bfloat16 bajo licencia MIT, con tokenizador GPT-NeoX-20B (vocabulario de 50.432 tokens) y entrenamiento realizado con OLMo-core. Solo soporta inglés y no documenta ajuste por instrucciones, RLHF ni DPO. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente conocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo 2 (`Olmo2ForCausalLM`), denso, 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (≈1,41B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible (no documentada en la model card) |
| Tipos de cuantizacion | No se publican cuantizaciones. Pesos originales en bfloat16; al ser safetensors estándar es convertible a GGUF/AWQ/GPTQ con herramientas externas, sin artefactos oficiales |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT para los pesos; los datos de entrenamiento proceden de DCLM 1b-1x (CC-BY-4.0) y están sujetos a los términos de uso de Common Crawl |
| Formato de pesos | safetensors, bfloat16 (tamaño del repo: 2,8 GB) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso de la familia OLMo 2, con 18 capas, dimensión oculta 2048, 1,41B de parámetros y tokenizador GPT-NeoX-20B de 50.432 entradas de vocabulario. El preentrenamiento se hizo con OLMo-core sobre 32.000 millones de tokens extraídos de `WebOrganizer/Corpus-200B`, un corpus derivado del pool DCLM 1b-1x (CC-BY-4.0) y organizado en 24 topics. Las secuencias tokenizadas exactas usadas en el entrenamiento están publicadas en `credible-ai/weborganizer-corpus-200b-tokenized`, lo que hace el experimento reproducible de extremo a extremo.

La innovación no está en la arquitectura sino en el procedimiento de mezcla: LinMix ajusta un sustituto lineal sobre un enjambre de modelos proxy (en este caso `credible-ai/olmo2-30M-24domains-vertex`) con utilidad lineal π y r = 0, optimizando los pesos de los 24 dominios para HellaSwag; la mezcla resultante (`mix.json` en el repo) se usa para muestrear los 32B tokens de este modelo de 1B. La model card no documenta instrucciones de ajuste fino posterior, RLHF, DPO ni ninguna fase de alineación, ni detalla la composición token-a-token del mix más allá de los 24 topics.

## Capacidades

- Generación de texto autorregresiva en inglés mediante modelado de siguiente token; es un modelo base, sin ajuste instructivo.
- Exposición a contenido diverso de la web en 24 dominios temáticos, consecuencia directa de la mezcla WebOrganizer.
- Reproducción controlada de experimentos de data mixing: el `mix.json` y las secuencias tokenizadas permiten replicar el entrenamiento exacto.
- Punto de partida para ajuste fino supervisado en tareas de dominio concreto (clasificación, continuación de texto, QA extractiva) tras un entrenamiento específico.
- No documenta soporte de tool calling ni function calling.
- No documenta capacidades de agente, razonamiento multi-paso explícito ni modo "thinking".
- No documenta visión, audio ni otras modalidades.
- Multilingüismo: únicamente inglés según la model card.

## Casos de uso

- Reproducción del artículo LinMix: reentrenar o evaluar este checkpoint con el `mix.json` y el dataset tokenizado publicado para verificar los resultados de mezcla óptima a escala 1B frente al proxy de 30M.
- Estudio de transferencia de mezclas: comparar el rendimiento en HellaSwag de la mezcla optimizada en el proxy de 30M con la mezcla uniforme u otras alternativas, aislando el efecto de la escala.
- Ablación de dominios: al disponer de 24 topics separados, se pueden entrenar variantes con un dominio eliminado o con pesos alterados para medir la contribución marginal de cada topic.
- Investigación sobre sobreajuste al benchmark: HellaSwag es el objetivo de optimización, por lo que el modelo sirve para cuantificar hasta qué punto optimizar la mezcla contra una única métrica degrada otras tareas.
- Base para ajuste fino de dominio: partiendo de un modelo de 1,41B con 32B tokens vistos, es viable un SFT ligero en tareas de clasificación o extracción sobre texto en inglés en una sola GPU consumer.
- Docencia y experimentación con OLMo-core: el pipeline completo (corpus organizado, tokenización, mezcla y entrenamiento) es un caso práctico de curación de datos reproducible en entornos académicos.
- Validación de infraestructura de evaluación: por su tamaño, sirve como modelo de humo para probar harness de evaluación, pipelines de inferencia y conversión a GGUF antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la mezcla de datos se optimizó para HellaSwag, pero no reporta la puntuación obtenida ni métricas de MMLU, GSM8K, HumanEval u otras. Tampoco se documentan comparaciones numéricas con el proxy de 30M ni con otros checkpoints de la familia.

## Requisitos de hardware

- Inferencia en bfloat16: ≈2,83 GB solo de pesos (1,41B × 2 bytes); con caché KV y overhead de runtime, contar 3,5-4 GB de VRAM.
- Inferencia en fp32: ≈5,7 GB de pesos.
- Cuantización a 8 bits: ≈1,4 GB de pesos; a 4 bits, ≈0,7-0,9 GB, sin artefactos oficiales publicados (requiere conversión propia a GGUF, GPTQ o AWQ).
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en 4 bits es viable en GPUs de 6-8 GB.
- GPU de datacenter: A100 o H100 no son necesarias para inferencia; resultan útiles para reentrenar los 32B tokens o para evaluaciones masivas por lotes.
- Opciones de despliegue: `transformers` (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI para serving; llama.cpp y Ollama solo tras generar un GGUF propio, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `credible-ai/olmo2-1B-24domains-vertex-linear-hellaswag` | 1,41B | No disponible | Artefacto de investigación sobre mezcla de datos | MIT (pesos) | Pesos en HF, safetensors bf16 |
| `credible-ai/olmo2-30M-24domains-vertex` (proxy swarm) | ≈30M (según el nombre del checkpoint; no confirmado en la información) | No disponible | Proxy para optimizar la mezcla antes de escalar | No disponible | Pesos en HF |
| `allenai/OLMo-2-0425-1B` (modelo base de la familia) | No disponible en la información proporcionada | No disponible | Modelo base de propósito general | No disponible en la información proporcionada | Pesos en HF |
| Modelos base de ≈1-2B de otras familias (SmolLM2, Qwen2.5, TinyLlama) | No disponible en la información proporcionada | No disponible | Modelos base o instructivos de propósito general | No disponible en la información proporcionada | Pesos en HF |

No es posible establecer una comparación de rendimiento: este checkpoint no publica métricas y la búsqueda web realizada no devolvió documentación técnica adicional sobre él. La comparación relevante es metodológica (mezcla optimizada frente a mezcla uniforme), no de capacidad bruta frente a modelos de propósito general.

## Limitaciones y advertencias

- Artefacto de investigación declarado explícitamente por el autor: no es un modelo de propósito general ni debe desplegarse como tal.
- Sin ajuste instructivo, RLHF ni DPO documentados: no sigue instrucciones de usuario ni mantiene formato de chat de forma fiable.
- Solo inglés; cualquier uso en castellano queda fuera del alcance declarado y probablemente degradará la calidad.
- Longitud de contexto no documentada: planificar producción sin conocer la ventana real es inviable sin medirla empíricamente.
- Riesgo de alucinación alto, propio de un modelo base de 1,41B entrenado sobre 32B tokens: baja factualidad y coherencia limitada en generaciones largas.
- Datos de origen web (DCLM 1b-1x y Common Crawl) sin filtrado documentado de toxicidad, sesgos o datos personales; se esperan sesgos sociales y contenido nocivo en las distribuciones aprendidas.
- La mezcla está optimizada contra HellaSwag, lo que puede inducir sobreajuste a ese benchmark y infraponderar dominios útiles para otras tareas.
- Licencia MIT para los pesos, pero los datos subyacentes están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl; conviene revisar obligaciones de atribución antes de un uso comercial.
- No hay evaluación de seguridad, red teaming ni informe de sesgos publicado.
- Repositorio con 0 descargas y 0 likes: ausencia total de validación por terceros; los resultados no están replicados de forma independiente.
- Sin cuantizaciones oficiales: cualquier despliegue en llama.cpp u Ollama exige conversión y validación propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linear-hellaswag
- Proxy swarm de 30M usado para optimizar la mezcla: https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Código de LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Secuencias tokenizadas de entrenamiento: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool original DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentación de `Olmo2ForCausalLM` en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas genéricas de servicios de Google); todos los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
