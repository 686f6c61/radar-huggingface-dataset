# mradermacher/gemma-3-1b-csw-best-GGUF

## Resumen

`mradermacher/gemma-3-1b-csw-best-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo base `BeardedMonster/gemma-3-1b-csw-best`, un ajuste fino de Gemma 3 de 1B parámetros orientado a lenguas africanas y a fenómenos de code-switching (alternancia de lenguas en una misma conversación) e idioms (expresiones idiomáticas). El trabajo de cuantización lo firma mradermacher, un publicador habitual de GGUF en Hugging Face, mientras que el modelo original proviene de BeardedMonster. La ficha cubre, por tanto, el artefacto distribuido como GGUF; los detalles de entrenamiento y datos del ajuste fino no están documentados en la información disponible.

El interés práctico del artefacto es que empaqueta un modelo de 1.301.875.840 parámetros (según los safetensors del repo) en un rango de cuantizaciones que va de Q2_K a f16, con pesos entre 1,0 GB y 2,7 GB, lo que permite ejecutarlo en hardware de consumo y en entornos con recursos limitados. Cubre 22 lenguas africanas declaradas (yoruba, hausa, igbo, swahili, zulú, xhosa, afrikáans, amárico, somalí, kinyarwanda, lingala, luganda, shona, chichewa, sesotho, setswana, malgache, wolof, ewe, twi, oromo y tigriña), un conjunto relevante para aplicaciones de NLP de bajos recursos.

La relevancia actual radica en la escasez de modelos ligeros con cobertura multilingüe africana y capacidad de manejar mezcla de lenguas, un escenario habitual en conversaciones reales en regiones multilingües. Al estar en GGUF y ser compatible con endpoints, encaja en despliegues con llama.cpp, Ollama o servidores compatibles con la API de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 3 1B); detalles exactos no disponibles |
| Parámetros totales | 1.301.875.840 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti |
| Licencia | other (heredada del modelo base; términos concretos no disponibles) |
| Formato de pesos | GGUF (conversión desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 3 1B, una arquitectura transformer decoder-only de la familia Gemma. Los detalles específicos de la arquitectura (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o ventanas deslizantes) no están documentados en la información disponible, más allá de la referencia a `gemma3` en las etiquetas. El tamaño de parámetros (1.301.875.840) coincide con la escala de 1B de la familia.

El proceso de cuantización lo realiza mradermacher con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, generando cuantizaciones estáticas (no ponderadas/imatrix, según indica el propio autor). No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de la mezcla multilingüe ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Las etiquetas `african-languages`, `code-switching` e `idioms` sugieren que el ajuste fino se centró en esos fenómenos, pero no hay datos verificables sobre el volumen o la metodología.

## Capacidades

- Generación de texto conversacional en 22 lenguas africanas declaradas, incluyendo yoruba, hausa, igbo, swahili, zulú, xhosa, afrikáans, amárico, somalí, kinyarwanda, lingala, luganda, shona, chichewa, sesotho, setswana, malgache, wolof, ewe, twi, oromo y tigriña.
- Manejo de code-switching: capacidad declarada de alternar entre lenguas dentro de una misma conversación, un escenario frecuente en contextos multilingües africanos.
- Comprensión y generación de expresiones idiomáticas (idioms) en las lenguas cubiertas.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite servir el modelo mediante la infraestructura de Hugging Face.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Atención al cliente multilingüe en África subsahariana: el modelo puede gestionar conversaciones en swahili, hausa, yoruba o amárico, y alternar entre lenguas cuando el usuario mezcle idiomas, algo habitual en mercados multilingües. Su tamaño de 1B permite desplegarlo en servidores modestos o incluso en dispositivos locales.
- Traducción y adaptación de contenido: útil para localizar documentación, mensajes de producto o material educativo hacia lenguas con poca cobertura de modelos grandes, usando las cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y coste.
- Procesamiento de conversaciones reales con code-switching: transcripción y normalización de chats de soporte, foros o redes sociales donde los hablantes mezclan, por ejemplo, swahili e inglés o yoruba e inglés.
- Educación y tutoría lingüística: generación de ejemplos, explicaciones de expresiones idiomáticas y ejercicios en lenguas africanas, aprovechando la etiqueta `idioms` del ajuste fino.
- Moderación y clasificación de contenido: al ser un modelo conversacional ligero, puede usarse como primer filtro para detectar contenido inapropiado en lenguas de bajos recursos, antes de escalar a un modelo mayor.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K a Q4_K_S (1,0-1,1 GB) permiten ejecución en CPU, portátiles y dispositivos edge mediante llama.cpp u Ollama, útil para ONGs, escuelas o aplicaciones offline en zonas con conectividad limitada.
- Investigación en NLP de bajos recursos: como punto de partida para experimentos de evaluación multilingüe, ajuste adicional o comparación de cuantizaciones sobre las 22 lenguas cubiertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre aproximadamente 1,0 GB (Q2_K/Q3_K_S) y 2,7 GB (f16) solo para los pesos; hay que añadir el espacio para el contexto y el overhead del runtime (KV cache), que depende de la longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M; para f16 se recomienda al menos 4-6 GB. GPU de datacenter (A100, H100) no son necesarias para este tamaño, aunque pueden usarse para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de Hugging Face (endpoints_compatible), y cualquier runtime que acepte GGUF. Para el modelo base en safetensors, transformers con PyTorch.
- Latencia y throughput: no disponibles; al ser un modelo de 1B, se espera baja latencia en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-1b-csw-best-GGUF (este) | 1,30 B | no disponible | 22 lenguas africanas | other | GGUF |
| Gemma 3 1B (base oficial de Google) | ~1 B | no disponible en la información | multilingüe amplio | Gemma Terms of Use | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32k (según documentación pública de Qwen) | multilingüe amplio | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8k (según documentación pública de Hugging Face) | principalmente inglés | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen2.5 y SmolLM2 se basa en datos públicos de sus respectivas documentaciones; los valores de contexto de Gemma 3 1B no se han verificado en la información disponible. La ventaja específica de este artefacto es la cobertura declarada de 22 lenguas africanas y el ajuste para code-switching e idioms, frente a modelos generalistas con mayor cobertura de inglés y chino pero menor especialización en lenguas africanas.

## Limitaciones y advertencias

- La licencia es `other`, heredada del modelo base; no se especifican los términos exactos, por lo que es imprescindible revisar la licencia de `BeardedMonster/gemma-3-1b-csw-best` y, en su caso, la de Gemma 3 de Google antes de un uso comercial.
- No hay información publicada sobre sesgos, datos de entrenamiento ni evaluación de calidad por lengua; la cobertura de 22 lenguas es declarada, pero no verificada mediante benchmarks.
- Riesgo de alucinación inherente a un modelo de 1B parámetros; en tareas factuales o de razonamiento complejo el rendimiento será limitado.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación, lo que puede afectar la calidad relativa frente a otros repositorios GGUF.
- No se documenta soporte de tool calling, agentes, visión ni audio; no debe asumirse.
- Longitud de contexto no disponible: planificar el despliegue sin asumir una ventana concreta.
- El repo ocupa 13,9 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-1b-csw-best-GGUF
- Modelo base: https://huggingface.co/BeardedMonster/gemma-3-1b-csw-best
- Página de overview de cuantizaciones del autor: https://hf.tst.eu/model#gemma-3-1b-csw-best-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
