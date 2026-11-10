# InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF es una cuantización de 3 bits del modelo Qwen3.8-27B-Uncensored-v3, publicado por InterpreticAI. Se trata de un ajuste fino de NousResearch/Arete-27B (a su vez un post-entrenamiento de Qwen3.8-27B) cuyo objetivo declarado es eliminar la censura política residual que persiste en las respuestas a preguntas formuladas en chino. El modelo base Arete-27B ya reducía la propaganda en prompts en inglés, pero seguía censurando aproximadamente la mitad de las respuestas a preguntas políticas en chino; esta versión reduce esa cifra al 2,6%.

El modelo conserva la arquitectura y el diseño de archivos de Arete-27B, con 26.895.998.464 parámetros totales (unos 26,9 mil millones) y licencia Apache 2.0. La variante publicada aquí es un GGUF cuantizado con el método IQ3_XXS (10,2 GB) más un proyector de visión F16 separado (0,93 GB), lo que permite ejecutarlo en una única GPU de 12 GB mediante llama.cpp, LM Studio u Ollama.

Su relevancia radica en dos aspectos: por un lado, demuestra que es posible reducir drásticamente la censura política en modelos derivados de Qwen sin reentrenar desde cero; por otro, ofrece una vía práctica de despliegue local de un modelo multimodal de ~27B en hardware de consumo, algo poco habitual en esta categoría de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, sin capa MTP) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 65.536 tokens en el ejemplo de llama-server (`-c 65536`) |
| Tipos de cuantizacion | IQ3_XXS (3 bits, 10,2 GB); el modelo original ofrece BF16 y Q4_K_M |
| Idiomas soportados | No disponible (la model card solo menciona evaluaciones en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo IQ3_XXS + proyector de visión F16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~26,9 mil millones de parámetros, derivado de Qwen3.8-27B y post-entrenado por Nous Research como Arete-27B. InterpreticAI parte de ese checkpoint y aplica un ajuste adicional (Uncensored-v3) orientado a eliminar la censura política en respuestas a preguntas en chino. La model card indica que es un checkpoint BF16 completo con la misma arquitectura y disposición de archivos que Arete-27B, y que la cuantización IQ3_XXS se generó a partir de la release BF16 de Uncensored-v3.

Una diferencia técnica relevante respecto a la versión v2 es que este modelo no incluye capa de predicción multi-token (MTP), igual que Arete-27B, por lo que debe servirse con decodificación estándar. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el ajuste de InterpreticAI; tampoco especifica innovaciones de atención más allá de las heredadas de Qwen3.8-27B. El modelo incluye un proyector de visión separado (mmproj F16) que habilita la entrada de imágenes, coherente con el pipeline `image-text-to-text`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino, con modo thinking y modo no-thinking configurables mediante `--chat-template-kwargs`.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), gracias al proyector de visión F16 incluido.
- Respuestas a preguntas políticas sensibles sin incurrir en rechazos ni evasiones en la gran mayoría de los casos evaluados (0,9% de rechazos/evasiones en el benchmark de Pan y Xu).
- Reducción drástica de propaganda en prompts en inglés (0,5% de respuestas con propaganda en Propaganda_Eval).
- Soporte de plantilla de chat Jinja (`--jinja`), compatible con endpoints de llama.cpp.
- Capacidades de razonamiento y matemáticas heredadas de Qwen3.8-27B (no cuantificadas en la model card).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre censura política en LLM: el modelo sirve como contrapunto controlado a Qwen3.8-27B y Arete-27B para estudiar cómo varía la tasa de rechazo y de alineamiento con narrativas oficiales en función del ajuste fino, usando el battery de 145 preguntas de Pan y Xu (2026).
- Despliegue local en estación de trabajo con GPU de 12 GB: al ocupar 10,2 GB el GGUF más 0,93 GB el proyector de visión, cabe en tarjetas como RTX 3060 12 GB, RTX 4070 Ti o RTX 4080, permitiendo inferencia multimodal sin depender de la nube.
- Análisis de documentos con imágenes en entornos con requisitos de soberanía del dato: el pipeline image-text-to-text permite procesar capturas, escaneos o gráficos junto con texto sin enviar contenido a APIs externas.
- Evaluación comparativa de sesgos y alucinación: útil para medir si la eliminación de censura política introduce o no un aumento de afirmaciones no verificadas, replicando la advertencia de la model card de que "una respuesta sustantiva no es necesariamente correcta".
- Generación de contenido editorial en inglés y chino con contexto largo: los 65.536 tokens de ventana permiten resumir o reescribir documentos extensos manteniendo coherencia multi-turno.
- Prototipado de asistentes conversacionales sin filtros ideológicos para investigación en ciencias sociales: el modo no-thinking con `temperature=0.7, top_p=0.8, top_k=20, presence_penalty=1.5` está recomendado por el autor para respuestas directas.

## Benchmarks y rendimiento

Los datos publicados corresponden a la release BF16 de Uncensored-v3, no a la cuantización IQ3_XXS. La model card no reporta MMLU, HumanEval ni GSM8K.

Censura política en prompts en chino (Pan & Xu, 2026; 115 preguntas sensibles, 4.096 tokens de salida, modo no-thinking, decodificación greedy):

| Métrica | Qwen3.8-27B | Arete-27B | Uncensored-v3 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5% | 50,4% | 2,6% |
| Rechaza o evade (menor es mejor) | 49,6% | 22,6% | 0,9% |
| Reescribe en talking points del PCC (menor es mejor) | 32,2% | 27,8% | 1,7% |
| Se alinea con valores del PCC (menor es mejor) | 100% | 30% | 20% |
| Tema correcto y respuesta abierta (mayor es mejor) | 12,2% | 38,3% | 80,9% |

Propaganda en prompts en inglés (NousResearch/Propaganda_Eval, 803 prompts):

| Modelo | Respuestas con propaganda (menor es mejor) |
|---|---|
| Qwen3.8-27B | 24,5% |
| Arete-27B | 1,0% |
| Qwen3.8-27B-Uncensored-v3 | 0,5% |

No se han publicado resultados de benchmarks de razonamiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~11,1 GB para el GGUF IQ3_XXS (10,2 GB) más el proyector de visión F16 (0,93 GB), sin contar el espacio de contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090; en el segmento profesional, A100 o H100 si se busca mayor throughput. La model card afirma explícitamente que "cabe en una única GPU de 12 GB".
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más de VRAM. Con menos de 12 GB habría que recurrir a offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y Ollama. El ejemplo de la model card usa `llama-server -m ... --mmproj ... -ngl 999 -c 65536 --jinja`.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser una cuantización de 3 bits sin MTP, no se beneficia de decodificación especulativa; para ello el autor remite a la variante v2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Censura política (chino) | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3 (IQ3_XXS) | ~26,9 mil M | 65.536 tokens | 2,6% censuradas | Apache 2.0 | GGUF IQ3_XXS, BF16, Q4_K_M |
| Qwen3.8-27B-Uncensored-v2 | ~26,9 mil M (estimado) | No disponible | 3,5% censuradas | Apache 2.0 | BF16, FP8, GGUF Q4_K_M, GGUF IQ3_XXS |
| NousResearch/Arete-27B | ~26,9 mil M | No disponible | 50,4% censuradas | Apache 2.0 | BF16 |
| Qwen/Qwen3.8-27B | ~26,9 mil M | No disponible | 83,5% censuradas | Apache 2.0 | No disponible |

La diferencia clave entre v2 y v3 es que v2 incluye capa MTP (decodificación especulativa) y FP8, mientras que v3 prioriza la menor tasa de censura (2,6% frente a 3,5%). El autor recomienda v2 para MTP y FP8, y v3 para minimizar la censura.

## Limitaciones y advertencias

- Cada modelo se generó una sola vez por benchmark; no hay intervalos de confianza ni repeticiones que permitan estimar la varianza de las métricas.
- Una respuesta sustantiva no es necesariamente correcta: el autor advierte explícitamente que los usuarios deben verificar las afirmaciones fácticas de forma independiente.
- El modelo está diseñado para eliminar la censura política, lo que puede aumentar el riesgo de generar contenido sesgado, ofensivo o desalineado en otros ejes (violencia, contenido ilegal, desinformación), no evaluados en la model card.
- No se documentan los idiomas soportados más allá de las evaluaciones en inglés y chino; el rendimiento en castellano u otras lenguas no está verificado.
- La cuantización IQ3_XXS de 3 bits puede degradar la calidad respecto al checkpoint BF16; las métricas publicadas corresponden al BF16, no al GGUF.
- Ausencia de capa MTP: no se puede usar decodificación especulativa con este archivo, lo que limita el throughput frente a la variante v2.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar la atribución y los avisos de Nous Research y del equipo Qwen según el archivo LICENSE.
- El modelo base Qwen3.8-27B y Arete-27B no están documentados en detalle en esta ficha (tokens de entrenamiento, dataset, RLHF/DPO); esa información no está disponible.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Release BF16 de Uncensored-v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Variante GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- Versión v2 (con MTP y FP8): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- v2 FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- v2 GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- v2 GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Modelo base Arete-27B (Nous Research): https://huggingface.co/NousResearch/Arete-27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Paper de referencia (Pan & Xu, 2026, PNAS Nexus): https://doi.org/10.1093/pnasnexus/pgag013
- Página de Arete en Nous Research: https://nousresearch.com/arete
- DOI del modelo: https://doi.org/10.57967/hf/11546
