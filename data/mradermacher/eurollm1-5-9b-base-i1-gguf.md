# mradermacher/EuroLLM1.5-9B-Base-i1-GGUF

## Resumen

EuroLLM1.5-9B-Base-i1-GGUF es la cuantización en formato GGUF, generada por mradermacher, del modelo base EuroLLM1.5-9B-Base desarrollado por el proyecto utter-project. Se trata de un modelo de lenguaje de 9.152.319.488 parámetros (aproximadamente 9,15 mil millones) entrenado desde cero con un enfoque explícito en el multilingüismo europeo: cubre las 24 lenguas oficiales de la Unión Europea más un conjunto adicional de idiomas, hasta un total de 35 lenguas listadas en la model card.

El modelo resuelve el problema de la escasa representación de lenguas europeas de menor recursos en los grandes modelos generativos, ofreciendo una alternativa abierta con licencia Apache 2.0 que puede desplegarse en infraestructura propia. Al ser un modelo base (no ajustado por instrucciones), su propósito es servir como punto de partida para fine-tuning supervisado, ajuste por preferencias o aplicaciones de continuación de texto.

Esta ficha se centra en la variante cuantizada publicada por mradermacher, que incluye cuantizaciones ponderadas con imatrix (etiquetadas i1) desde IQ1_S (~2,4 GB) hasta Q6_K (~7,6 GB), lo que permite ejecutar el modelo en GPUs de consumo y en CPU mediante llama.cpp u Ollama. La relevancia actual radica en la combinación de licencia permisiva, cobertura lingüística amplia y disponibilidad de formatos ligeros para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles específicos de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 9.152.319.488 (~9,15 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de un fichero imatrix y cuantizaciones estáticas en el repositorio hermano) |
| Idiomas soportados | en, de, es, fr, it, pt, pl, nl, tr, sv, cs, el, hu, ro, fi, uk, sl, sk, da, lt, lv, et, bg, no, ca, hr, ga, mt, gl, zh, ru, ko, ja, ar, hi (35 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base original se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base EuroLLM1.5-9B-Base más allá de su naturaleza de transformer decoder-only y su tamaño de 9,15 mil millones de parámetros. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención (si usa atención lineal o variantes eficientes), ni la longitud de contexto máxima. Tampoco se documentan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya ajuste por instrucciones, pero esto no se confirma explícitamente en los datos disponibles.

La innovación destacable de esta publicación concreta es el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con un fichero imatrix (importance matrix) calculado sobre el modelo base, lo que mejora la calidad de las cuantizaciones de baja precisión (especialmente las familias IQ) frente a las cuantizaciones estáticas. El repositorio incluye tanto el fichero imatrix (0,1 GB) para que otros usuarios puedan crear sus propias cuantizaciones como un conjunto completo de variantes desde IQ1_S hasta Q6_K. También existe un repositorio paralelo con cuantizaciones estáticas (sin imatrix) en mradermacher/EuroLLM1.5-9B-Base-GGUF.

## Capacidades

- Generación de texto y continuación de texto en 35 idiomas, con especial cobertura de las lenguas oficiales de la Unión Europea (las 24 lenguas oficiales de la UE están representadas en la lista de idiomas).
- Modelo base sin ajuste por instrucciones: no está optimizado para seguir órdenes de forma nativa; requiere fine-tuning o prompting few-shot para tareas de instrucción.
- Capacidades multilingües amplias: además de las lenguas europeas, incluye chino, ruso, coreano, japonés, árabe e hindi.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información proporcionada.
- No se documenta modo thinking, visión ni audio en la información proporcionada.
- Compatible con endpoints (tag endpoints_compatible) y con la librería transformers para el modelo base original.

## Casos de uso

- Fine-tuning para lenguas europeas de bajos recursos: al partir de un modelo base con cobertura explícita de lenguas como gaélico irlandés, maltés, esloveno, eslovaco, letón, lituano o estonio, es adecuado para construir modelos ajustados por instrucciones en estos idiomas con datasets relativamente pequeños.
- Traducción automática entre lenguas europeas: el modelo puede usarse como base para sistemas de traducción neuronal mediante fine-tuning supervisado, aprovechando su entrenamiento multilingüe y su licencia Apache 2.0 para uso comercial.
- Generación de texto aumentada en aplicaciones locales: las cuantizaciones Q4_K_M (~5,7 GB) permiten ejecutar el modelo en una GPU de consumo de 8 GB de VRAM mediante llama.cpp u Ollama, habilitando asistentes de redacción o resumen en local sin conexión.
- Investigación en multilingüismo: sirve como referencia abierta para estudiar sesgos, calidad y transferencia entre lenguas en modelos de ~9B parámetros entrenados con énfasis europeo.
- Prototipado de sistemas de extracción de información: con fine-tuning ligero puede adaptarse a tareas de clasificación, etiquetado o extracción de entidades en documentos multilingües.
- Despliegue en entornos con requisitos de soberanía de datos: al ser un modelo abierto con pesos descargables y licencia permisiva, puede ejecutarse en infraestructura propia para cumplir con normativas de protección de datos europeas.
- Educación e investigación académica: el tamaño moderado (~9B) y las cuantizaciones ligeras permiten su uso en laboratorios con recursos limitados para experimentos de NLP multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-IQ1_S ~2,4 GB; i1-IQ2_M ~3,4 GB; i1-IQ3_M ~4,4 GB; i1-Q4_K_M ~5,7 GB; i1-Q5_K_M ~6,6 GB; i1-Q6_K ~7,6 GB. A estas cifras hay que añadir el espacio para el contexto (KV cache), que depende de la longitud de contexto configurada.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB ofrecen margen suficiente. Para cuantizaciones IQ2 o IQ3, una RTX 3060 de 8 GB o RTX 4060 de 8 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más de VRAM usando cuantizaciones IQ2/IQ3/Q4; las cuantizaciones Q5 y Q6 requieren 8-12 GB según el contexto.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base original puede desplegarse con transformers, y potencialmente con vLLM o TGI si se convierte a safetensors (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EuroLLM1.5-9B-Base (esta ficha, cuantizado) | ~9,15B | no disponible | 35 | Apache 2.0 | GGUF, safetensors |
| Mistral 7B Base | ~7,2B | 8k (típico) | principalmente inglés | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Base | ~8B | 128k | principalmente inglés y multilingüe limitado | Llama 3.1 Community License | safetensors, GGUF |
| Salamandra 7B | ~7B | no disponible | 35+ europeos | Apache 2.0 | safetensors, GGUF |

La comparativa se ofrece como referencia de categoría; los datos de contexto y rendimiento de los modelos alternativos no se han verificado en la información proporcionada y pueden variar. La principal ventaja diferencial de EuroLLM1.5-9B-Base es su cobertura explícita de lenguas europeas de bajos recursos combinada con licencia Apache 2.0, frente a modelos como Llama 3.1 8B cuya licencia comunitaria impone restricciones adicionales.

## Limitaciones y advertencias

- Al ser un modelo base, no está ajustado para seguir instrucciones; su uso directo en tareas de instrucción producirá resultados deficientes sin fine-tuning previo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; es esperable que el modelo refleje sesgos presentes en sus datos de entrenamiento, pero no se detallan.
- Limitaciones de contexto: la longitud máxima de contexto no está disponible, lo que impide planificar aplicaciones que requieran ventanas largas sin verificación previa.
- Calidad variable según cuantización: las cuantizaciones IQ1 e IQ2 (2,4-3,4 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate". Para producción se recomienda Q4_K_M o superior.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base original (utter-project/EuroLLM1.5-9B-Base) por si hubiera condiciones adicionales no reflejadas en la información disponible.
- El repositorio tiene un tamaño de 106,3 GB, lo que implica descargas parciales si solo se necesita una cuantización concreta.
- No se documentan capacidades de tool calling, agentes ni modo thinking, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/EuroLLM1.5-9B-Base-i1-GGUF
- Modelo base original: https://huggingface.co/utter-project/EuroLLM1.5-9B-Base
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/EuroLLM1.5-9B-Base-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#EuroLLM1.5-9B-Base-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH (patrocinador del autor): https://www.nethype.de/
