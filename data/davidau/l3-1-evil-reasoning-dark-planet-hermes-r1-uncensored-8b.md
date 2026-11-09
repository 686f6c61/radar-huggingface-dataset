# DavidAU/L3.1-Evil-Reasoning-Dark-Planet-Hermes-R1-Uncensored-8B

## Resumen

L3.1-Evil-Reasoning-Dark-Planet-Hermes-R1-Uncensored-8B es un modelo de lenguaje de 8.030.261.248 parámetros (8B) desarrollado por DavidAU, un autor independiente conocido en Hugging Face por sus fusiones de modelos Llama orientadas a escritura creativa y rol. Se trata de un merge construido con mergekit a partir de NousResearch/DeepHermes-3-Llama-3-8B-Preview (que aporta el mecanismo de razonamiento activable) y DavidAU/L3-Dark-Planet-8B (que aporta el tono narrativo oscuro y el estilo de prosa). El resultado es un modelo instruct sin censura, especializado en ficción, terror, roleplay y generación de tramas, con control variable de razonamiento mediante system prompts.

El modelo resuelve un nicho concreto: la generación de texto creativo sin filtros de contenido, con capacidad de "pensar" antes de responder. Hereda la arquitectura transformer decoder-only de Llama 3.1 (8B parámetros, GQA, RoPE) y declara una ventana de contexto de 128k tokens, aunque el autor recomienda operar con un mínimo de 4k y preferiblemente 8k para acomodar los bloques de razonamiento más la salida final. Los pesos se distribuyen en safetensors en bfloat16, con un tamaño de repositorio de 16,1 GB.

Es relevante ahora porque combina dos tendencias del ecosistema abierto: los modelos de razonamiento con "thinking mode" activable (popularizados por DeepSeek-R1 y DeepHermes) y las fusiones comunitarias sin censura para escritura creativa. Su licencia Apache 2.0 permite uso comercial, aunque el contenido que genera puede ser explícito y gráfico, lo que exige moderación en cualquier despliegue de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fusion de modelos con mergekit |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens declarados; minimo recomendado 4k, optimo 8k |
| Tipos de cuantizacion | El repo ofrece safetensors en bfloat16 como fuente completa; el autor indica que puede convertirse a GGUF, GPTQ, EXL2, AWQ y HQQ (los quants se publican en repos separados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una fusión (merge) de dos checkpoints derivados de Llama 3.1 de 8B: DeepHermes-3-Llama-3-8B-Preview de NousResearch, que aporta el sistema de razonamiento activable por system prompt, y L3-Dark-Planet-8B de DavidAU, que aporta el estilo de prosa oscura y el comportamiento sin censura. La fusión se realizó con mergekit, aunque la model card no detalla la receta exacta (método de merge, pesos por capa o parámetros de interpolación). No se especifican datos de entrenamiento propios: el conocimiento procede de los modelos base, y no hay información sobre tokens adicionales, composición del dataset ni fases de RLHF o DPO posteriores al merge.

La innovación técnica principal es el control variable de razonamiento heredado de DeepHermes: el modelo puede activar o desactivar bloques de "thinking" mediante system prompts, y el autor afirma que conserva entre el 50 % y el 67 % de la potencia de razonamiento del DeepHermes original. El razonamiento resultante es más corto y comprimido que el del modelo base, y su contenido suele ser más extremo que la salida final. El autor recomienda temperaturas altas (1.2+, 2.2+) para obtener pensamientos más ricos, aunque también documenta un rango estable en torno a 0.6 para usos más lógicos.

## Capacidades

- Generación de texto creativo en todos los géneros: ciencia ficción, romance, terror, ficción general, con prosa vívida.
- Generación de tramas y subtramas, continuación de escenas y desarrollo narrativo de historias largas.
- Razonamiento activable mediante system prompts (thinking mode), útil para acertijos, puzles lógicos y problemas que un Llama 3.1 estándar no resolvería.
- Roleplay y conversación multi-turno, con etiquetas específicas para SillyTavern y entornos de rol.
- Modo sin censura: produce contenido NSFW, terror gráfico y lenguaje soez de forma explícita.
- Personalización de "carácter" mediante system prompts (el autor documenta variantes con personalidad tipo Joker).
- Soporte de plantilla de instrucciones de Llama 3 Instruct.
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Escritura de ficción larga: el modelo mantiene coherencia narrativa en sesiones de 8k tokens o más, suficiente para desarrollar capítulos completos con subtramas y continuidad de personajes.
- Generación de tramas y subtramas para guionistas y novelistas: a partir de un prompt medio-largo con premisa y tono, produce esbozos argumentales que el autor puede refinar en regeneraciones sucesivas.
- Roleplay narrativo en SillyTavern: el modelo está etiquetado para este entorno y soporta conversaciones multi-turno con personajes persistentes y contenido adulto sin filtros.
- Ficción de terror y horror gráfico: es el caso de uso explícito del modelo, que genera descripciones explícitas y atmosféricas que modelos alineados rechazarían.
- Resolución de acertijos y puzles lógicos: el bloque de razonamiento permite abordar problemas de lógica que un Llama 3.1 base no resuelve, con la advertencia de que su potencia es inferior a la de DeepHermes.
- Prototipado de experiencias interactivas sin censura: juegos de texto, aventuras conversacionales o demos creativas donde se requiere contenido sin restricciones y control de temperatura para variar el estilo.
- Investigación sobre alineación y comportamiento de modelos sin censura: sirve como caso de estudio de fusiones comunitarias y de los límites del razonamiento heredado en modelos mergeados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas; solo afirma cualitativamente que conserva entre el 50 % y el 67 % de la potencia de razonamiento de DeepHermes-3-Llama-3-8B-Preview.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de KV cache; con contexto de 8k la huella total ronda los 18-22 GB según implementación.
- VRAM en cuantización de 8 bits: en torno a 8-9 GB de pesos, viable en GPUs consumer de gama alta.
- VRAM en cuantización de 4 bits (GGUF Q4): aproximadamente 4,5-5,5 GB, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- GPU recomendadas: A100 40 GB u H100 para servicio concurrente con contexto largo; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 4 y 8 bits; en bf16 completo requiere 24 GB o más.
- Opciones de despliegue: transformers (formato nativo del repo), text-generation-inference (etiqueta endpoints_compatible), llama.cpp/Ollama y LM Studio mediante los GGUF publicados por el autor, vLLM para serving con safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| L3.1-Evil-Reasoning-Dark-Planet-Hermes-R1-Uncensored-8B | 8B | 128k | Activable por system prompt (50-67 % de DeepHermes) | Apache 2.0 | Ficción sin censura con thinking mode |
| NousResearch/DeepHermes-3-Llama-3-8B-Preview | 8B | 128k (declarado) | Activable, referencia completa | Llama 3.1 Community | Razonamiento general con control on/off |
| DavidAU/L3-Dark-Planet-8B | 8B | 128k (declarado) | No documentado | Apache 2.0 | Ficción oscura sin censura, sin thinking mode |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k | No | Llama 3.1 Community | Asistente general alineado |

La comparativa se limita a los modelos base y al linaje directo, ya que no hay datos de rendimiento publicados que permitan contrastar con alternativas de otros autores. Frente a Llama 3.1 Instruct, la diferencia principal es la ausencia de alineación y la presencia de razonamiento activable; frente a DeepHermes, la pérdida de potencia de razonamiento a cambio de estilo narrativo y libertad de contenido.

## Limitaciones y advertencias

- Contenido explícito: el modelo genera NSFW, terror gráfico y lenguaje soez de forma deliberada; requiere moderación o filtrado en cualquier producto dirigido al público general.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Llama 3.1 sin alineación posterior, es probable que reproduzca sesgos del corpus original y añada los del estilo de fusión.
- Alucinación: sin datos de benchmarks ni evaluaciones de fidelidad; en tareas factuales su fiabilidad es incierta y probablemente inferior a la de un instruct alineado.
- Inestabilidad del razonamiento: el autor documenta que a veces hay que regenerar para activar el bloque de thinking, que la segunda o tercera generación suele ser mejor y que el bloque puede cerrarse sin producir la salida final.
- Dependencia de la temperatura: el rendimiento óptimo requiere temperaturas altas (1.2+, 2.2+), lo que aumenta la varianza y dificulta la reproducibilidad.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativas locales; la responsabilidad recae en el desplegador.
- Madurez: 42 descargas y 6 likes en el momento de la consulta; es un modelo de nicho sin validación comunitaria amplia.
- Sin soporte documentado de tool calling ni agentes multi-paso; no es adecuado para pipelines de automatización que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3.1-Evil-Reasoning-Dark-Planet-Hermes-R1-Uncensored-8B
- Modelo base DeepHermes-3-Llama-3-8B-Preview: https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-8B-Preview
- Modelo base Dark Planet 8B (GGUF): https://huggingface.co/DavidAU/L3-Dark-Planet-8B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes del autor: https://huggingface.co/DavidAU/support
