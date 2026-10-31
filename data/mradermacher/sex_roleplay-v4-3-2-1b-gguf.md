# mradermacher/SEX_ROLEPLAY.v4-3.2-1B-GGUF

## Resumen

SEX_ROLEPLAY.v4-3.2-1B-GGUF es una colección de cuantizaciones GGUF del modelo NovaCorp/SEX_ROLEPLAY.v4-3.2-1B, realizadas por el cuantizador mradermacher. El modelo base es un modelo conversacional de aproximadamente 1.500 millones de parámetros (1.498.482.720 según los safetensors), creado mediante merge de modelos con mergekit y afinado sobre datasets de roleplay, escritura creativa y contenido sin censura. Está orientado a juegos de rol conversacionales (roleplay), generación narrativa y uso en entornos de baja especificación hardware, con etiquetas que indican contenido NSFW y comportamiento "abliterated" (con medidas de seguridad eliminadas).

Su relevancia radica en el nicho de modelos pequeños y ligeros para roleplay local: con cuantizaciones desde 0,8 GB (Q2_K) hasta 3,1 GB (f16), puede ejecutarse en CPUs modestas, portátiles o GPUs de consumo sin apenas requisitos de VRAM. Soporta castellano e inglés y se distribuye bajo licencia Apache 2.0. La versión estática aquí descrita convive con una variante imatrix (weighted) en un repositorio hermano del mismo autor.

Advertencia importante: se trata de un modelo sin censura diseñado explícitamente para contenido para adultos y roleplay, marcado con la etiqueta "not-for-all-audiences". No es adecuado para entornos profesionales, educativos ni de producción orientados a público general, y su comportamiento sin filtros conlleva riesgos éticos y legales que el usuario debe evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer conversacional; merge con mergekit de modelos base no especificados) |
| Parametros totales | 1.498.482.720 (1,5 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | castellano (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura subyacente del modelo base NovaCorp/SEX_ROLEPLAY.v4-3.2-1B. Por los metadatos disponibles, se trata de un modelo creado mediante mergekit (merge de varios modelos), etiquetado además con "heretic", término asociado a técnicas de abliteration o desalineación que reducen las negativas del modelo (refusals). El tamaño de 1,5 B de parámetros sugiere un modelo compacto pensado para ejecución local.

El entrenamiento o afinado del modelo base combinó nueve datasets públicos, mayoritariamente en formato ShareGPT: roleplay activo y de alineación (Nitral-AI), tarjetas de personaje y roleplay (Chaser-cz, sonnet35-charcard-roleplay), PIPPA (priveeai/pippa_sharegpt), roleplay deduplicado (PJMixers), escritura creativa derivada de Writing Prompts (PJMixers/Gryphe_Opus-WritingPrompts), QA tóxico tipo Alpaca (alexandreteles), cadena de razonamiento (AiCloser/sharegpt_cot_dataset) y ShareGPT GPT-4 limpio sin censura (Locutusque). No hay información sobre el número de tokens, el método de afinado (SFT, DPO, RLHF) ni los modelos fuente del merge.

## Capacidades

- Generación de texto conversacional orientada a roleplay de personajes, con énfasis en contenido para adultos sin censura (etiquetas nsfw, uncensored, pervert).
- Escritura creativa y narrativa: los datasets de Writing Prompts y tarjetas de personaje sugieren capacidad para generar historias y seguir prompts narrativos.
- Bajo número de negativas: etiquetado como "abliterated" y "low-refusals", es decir, minimiza los rechazos típicos de modelos alineados.
- Soporte bilingüe declarado: castellano e inglés.
- Formato conversacional (tag "conversational"), compatible con frontends de roleplay como SillyTavern y KoboldCpp, citados explícitamente en los tags.
- Razonamiento paso a paso ligero: el dataset sharegpt_cot_dataset sugiere exposición a cadenas de razonamiento, aunque sin garantías de rendimiento.
- No hay evidencia de capacidades multimodales (visión, audio), tool calling ni soporte de agentes en la información disponible.

## Casos de uso

- Roleplay conversacional local en SillyTavern: el modelo puede encarnar personajes definidos por tarjetas de personaje en sesiones multi-turno, ejecutándose íntegramente en el equipo del usuario gracias a su tamaño de 1,5 B.
- Uso en hardware muy limitado: con la cuantización Q2_K (0,8 GB) o Q3_K_M (0,9 GB) puede ejecutarse en portátiles antiguos, mini PCs o incluso móviles potentes vía llama.cpp o KoboldCpp.
- Escritura de ficción y prompts narrativos: dado el entrenamiento con Writing Prompts, puede generar relatos a partir de una premisa breve, útil como asistente de brainstorming para escritores de ficción para adultos.
- Prototipado de bots de personaje: su licencia Apache 2.0 permite integrarlo en proyectos personales o comerciales de chatbots de rol sin restricciones de licencia, siempre respetando la normativa sobre contenido adulto.
- Pruebas y benchmarking de cuantizaciones: al ofrecer doce niveles de cuantización, es útil para comparar la degradación de calidad entre Q2_K y Q8_0 en modelos pequeños de roleplay.
- Generación de datos sintéticos sin censura para investigación: puede emplearse en pipelines de generación de texto para estudiar comportamientos de modelos desalineados o construir datasets de evaluación de seguridad, con las salvaguardas éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,8 GB (Q2_K) y 3,1 GB (f16) solo de pesos; con contexto y overhead, se recomienda disponer de 2-4 GB de RAM o VRAM libres según la cuantización elegida.
- GPUs recomendadas: cualquier GPU moderna es más que suficiente; no se necesita GPU dedicada. Una RTX 3060 de 12 GB o incluso una GTX 1650 de 4 GB ejecutan la cuantización completa con holgura. También funciona por CPU puro.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo; el modelo está etiquetado explícitamente como "low-specs".
- Opciones de despliegue: llama.cpp, KoboldCpp y SillyTavern (mencionados en la model card), además de Ollama y LM Studio, que aceptan GGUF. No se recomienda vLLM para GGUF, aunque el modelo base en safetensors sería compatible con transformers y backends afines.
- Latencia y throughput: no disponibles; por su tamaño (1,5 B) se espera inferencia muy rápida incluso en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| SEX_ROLEPLAY.v4-3.2-1B (este) | 1,5 B | GGUF (12 quants) | Apache 2.0 | Roleplay NSFW sin censura, es/en |
| Llama 3.2 1B Instruct | 1,24 B | safetensors/GGUF | Llama 3.2 Community License | Uso general alineado, multilingüe |
| Qwen2.5-1.5B-Instruct | 1,54 B | safetensors/GGUF | Apache 2.0 (parcialmente) | Uso general, fuerte en código y matemáticas |
| SmolLM2-1.7B-Instruct | 1,7 B | safetensors/GGUF | Apache 2.0 | Uso general ligero, inglés |

Frente a Llama 3.2 1B o Qwen2.5 1.5B, este modelo ofrece especialización en roleplay y ausencia de filtros, a costa de capacidades generales (razonamiento, código, matemáticas) presumiblemente inferiores y de un perfil de contenido que limita su uso profesional. Su licencia Apache 2.0 es más permisiva que la de Llama 3.2. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Contenido para adultos sin censura: el modelo está diseñado para generar material NSFW y está etiquetado "not-for-all-audiences". Su uso con menores o en contextos laborales es inapropiado y potencialmente ilegal.
- Riesgo de abliteration: al tratarse de un modelo desalineado ("heretic", "abliterated"), puede generar contenido dañino, ilegal o ofensivo sin restricciones. El usuario asume toda la responsabilidad legal y ética.
- Alucinaciones: como todo modelo de 1,5 B, la tasa de alucinación y la coherencia factual son limitadas; no es fiable para tareas que requieran precisión.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_M degradan notablemente la calidad del texto; la model card recomienda Q4_K_S/Q4_K_M como equilibrio y Q6_K/Q8_0 para máxima calidad.
- Longitud de contexto no documentada: al ser un merge, la ventana de contexto efectiva depende de los modelos base y no está publicada; puede ser inferior a la esperada en frontends como SillyTavern.
- Sesgos: entrenado con datasets de QA tóxico y contenido sin censura, hereda los sesgos y estereotipos de dichos corpus, sin auditoría conocida.
- Sin benchmarks ni evaluaciones publicadas: no hay datos objetivos de rendimiento, coherencia en roleplay largo o calidad en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a la normativa aplicable sobre contenido adulto en cada jurisdicción.

## Enlaces

- Repositorio cuantizado (este modelo): https://huggingface.co/mradermacher/SEX_ROLEPLAY.v4-3.2-1B-GGUF
- Modelo base: https://huggingface.co/NovaCorp/SEX_ROLEPLAY.v4-3.2-1B
- Cuants imatrix (weighted): https://huggingface.co/mradermacher/SEX_ROLEPLAY.v4-3.2-1B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#SEX_ROLEPLAY.v4-3.2-1B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
