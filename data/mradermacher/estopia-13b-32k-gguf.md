# mradermacher/Estopia-13B-32k-GGUF

## Resumen

Estopia-13B-32k-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo pinkachu/Estopia-13B-32k, generada y publicada por el usuario mradermacher. No es un modelo entrenado desde cero, sino una conversión a GGUF del checkpoint original en safetensors, pensada para su uso en motores de inferencia de peso cuantizado como llama.cpp, Ollama o KoboldCpp. El modelo subyacente es un fine-tune conversacional de 13 000 millones de parámetros con arquitectura Llama 2, contexto extendido a 32 000 tokens mediante RoPE con escalado YaRN y orientación a diálogo.

El interés de esta publicación es puramente práctico: mradermacher distribuye once variantes de cuantización (desde Q2_K de 5,0 GB hasta Q8_0 de 13,9 GB), lo que permite ejecutar un modelo de 13B en hardware de consumo. El modelo base, Estopia, circula en comunidades de rol y escritura creativa (SillyTavern, KoboldCpp), donde se valora por su formato de salida conversacional.

Se trata de un modelo únicamente en inglés, sin licencia declarada en la ficha de HuggingFace, con 94 descargas y ningún "like" en el momento de redactar esta ficha, lo que indica una adopción muy limitada. No se han publicado benchmarks oficiales ni datos de entrenamiento detallados por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 2, con RoPE y escalado YaRN para contexto extendido |
| Parametros totales | 13 015 864 320 (aproximadamente 13B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (indicado en el nombre del modelo; extension via YaRN no verificada de forma independiente) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); existe tambien un repositorio con cuantizaciones ponderadas/imatrix (i1) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es la de Llama 2: un transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU. El tamaño declarado corresponde a un modelo de 13B, con el mismo perfil de capas y cabezas que Llama-2-13B. La peculiaridad respecto al Llama 2 original es la extensión de contexto: los tags del repositorio incluyen `rope` y `yarn`, lo que indica que el modelo base utilizó YaRN (Yet another RoPE extensioN) para ampliar la ventana de 4 096 tokens del Llama 2 original hasta los 32 000 tokens. El nombre del repositorio (Estopia-13B-32k) confirma esta cifra.

No hay información pública en los materiales proporcionados sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. Todo apunta a que se trata de un fine-tune comunitario del que no se han publicado detalles técnicos: la model card de la cuantización se limita a indicar que es una conversión estática del modelo pinkachu/Estopia-13B-32k, y no incluye ninguna descripción del entrenamiento. La etiqueta `conversational` sugiere un ajuste orientado a diálogo, probablemente con un dataset de rol o escritura creativa, pero esto no se puede confirmar con la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con formato de diálogo multi-turno.
- Contexto largo de hasta 32 000 tokens (mediante YaRN), adecuado para conversaciones extensas o documentos largos.
- Uso previsto en escenarios de rol y escritura creativa, según el contexto comunitario en el que circula el modelo.
- Inferencia local en CPU y GPU gracias al formato GGUF y a la compatibilidad con llama.cpp y derivados.
- Capacidad de matemáticas, código, razonamiento formal o tool calling: no documentada en la información disponible. Al derivar de Llama 2 13B, es probable que tenga capacidades básicas en algunas de estas áreas, pero no hay datos que lo confirmen.
- Capacidades multimodales (visión, audio): no disponibles; no hay indicios de que el modelo las soporte.
- Capacidades multilingües: no; la model card declara únicamente inglés.

## Casos de uso

- Asistente conversacional local en inglés: el modelo se puede ejecutar en llama.cpp u Ollama con cuantización Q4_K_M (8,0 GB) para mantener diálogos multi-turno sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Personajes y rol conversacional: su etiqueta `conversational` y su presencia en listas de modelos para SillyTavern sugieren que está pensado para interacción con personajes, donde la ventana de 32k permite mantener el historial de la conversación sin truncar el contexto.
- Escritura creativa asistida: generación y continuación de narrativa en inglés con coherencia a lo largo de pasajes largos, aprovechando el contexto extendido para mantener el hilo argumental.
- Prototipado de aplicaciones de chat en local: para desarrolladores que quieren montar una demo sin coste de API, con despliegue vía Ollama o llama.cpp en una GPU de consumo.
- Investigación sobre cuantización: el repositorio ofrece once variantes del mismo modelo, lo que permite estudiar la degradación de calidad entre Q2_K (5,0 GB) y Q8_0 (13,9 GB) en una misma arquitectura, usando el gráfico de perplejidad enlazado en la model card.
- Despliegue en hardware sin GPU: las cuantizaciones más pequeñas (Q2_K, Q3_K_S) permiten ejecutar el modelo en CPU con RAM moderada, útil para pruebas o entornos sin acelerador.
- Generación de texto en pipelines offline: al funcionar con llama.cpp, se puede integrar en scripts de procesamiento por lotes sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto resultados de evaluación del modelo base pinkachu/Estopia-13B-32k. Únicamente se referencia un gráfico genérico de perplejidad por tipo de cuantización (elaborado por ikawrakow), que compara tipos de cuantización entre sí pero no mide capacidades del modelo.

## Requisitos de hardware

Los tamaños siguientes corresponden a los archivos GGUF publicados. Las estimaciones de VRAM asumen que el modelo completo debe residir en memoria, más un margen para el contexto KV.

- Q2_K (5,0 GB): cabe en GPUs de 6 GB (GTX 1660, RTX 2060) y en CPU con 8 GB de RAM.
- Q3_K_S (5,8 GB) y Q3_K_M (6,4 GB): viables en GPUs de 8 GB (RTX 3060 Ti, RTX 2070).
- Q3_K_L (7,0 GB) e IQ4_XS (7,1 GB): ajustados en GPUs de 8 GB; recomendable 10-12 GB.
- Q4_K_S (7,5 GB) y Q4_K_M (8,0 GB): las variantes marcadas como "fast, recommended" por el autor; cómodas en GPUs de 10-12 GB (RTX 3080, RTX 4070) y en Apple Silicon con memoria unificada de 16 GB.
- Q5_K_S (9,1 GB) y Q5_K_M (9,3 GB): requieren aproximadamente 12 GB de VRAM (RTX 4070 Ti, RTX 3090).
- Q6_K (10,8 GB): calidad "very good"; necesita 14-16 GB de VRAM.
- Q8_0 (13,9 GB): mejor calidad; requiere 16 GB o más (RTX 4080, RTX 4090, A100).

Notas adicionales:

- El contexto de 32k incrementa el consumo de memoria por la caché KV; en GPUs justas de VRAM conviene reducir `n_ctx` o usar cuantización de la caché KV.
- Las GPU profesionales (A100 40/80 GB, H100) no son necesarias; el modelo está claramente orientado a hardware de consumo.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, LM Studio y, en menor medida, servidores compatibles con GGUF. vLLM y TGI trabajan mejor con safetensors que con GGUF, por lo que para esos motores conviene usar el modelo base original.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware, del tipo de cuantización y del tamaño de contexto utilizado.

## Comparativa con modelos similares

La comparación se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados para Estopia-13B-32k.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Estopia-13B-32k (esta ficha) | 13B | 32k (YaRN) | No disponible | GGUF en mradermacher; safetensors en pinkachu |
| Llama-2-13B-chat | 13B | 4k | Llama 2 Community License | Oficial de Meta; ampliamente disponible |
| Vicuna-13B | 13B | 2k-4k (segun version) | No comercial (pesos basados en Llama) | Comunidad |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | Oficial de Mistral AI; ampliamente disponible |

Frente a Llama-2-13B-chat, la diferencia principal es la ventana de contexto (32k frente a 4k), aunque el precio es una licencia no declarada y una ausencia total de evaluación pública. Frente a Mistral-7B-Instruct, Estopia tiene más parámetros pero no cuenta con el respaldo de una licencia clara ni con resultados verificables.

## Limitaciones y advertencias

- Licencia no disponible: la ficha de HuggingFace no declara licencia para la cuantización ni para el modelo base. Esto impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Sesgos conocidos: no documentados. Al derivar de Llama 2 y de un fine-tune comunitario, es probable que herede sesgos del corpus original, pero no hay análisis público.
- Riesgo de alucinación: no evaluado; sin benchmarks no se puede estimar su fiabilidad factual. En tareas de recuperación de información o datos precisos debe tratarse con precaución.
- Idioma: únicamente inglés. No hay soporte de castellano ni de otras lenguas declarado.
- Contexto: los 32k tokens provienen del escalado YaRN. Es necesario configurar correctamente los parámetros de RoPE en el motor de inferencia; de lo contrario, el rendimiento en contextos largos puede degradarse notablemente.
- Ausencia de datos de entrenamiento: no se conoce el dataset, el número de tokens ni si hubo alineación (RLHF/DPO). Esto dificulta anticipar su comportamiento y evaluar su seguridad.
- Adopción muy baja: 94 descargas y 0 "likes" en el momento de redactar la ficha; no hay una comunidad que haya validado su calidad.
- Metadatos dudosos: la fecha de creación del repositorio aparece como 2026-10-13, lo que puede indicar un error de la plataforma o del proceso de publicación; conviene verificarlo.
- Sin soporte de tool calling ni de agentes documentado: si el caso de uso requiere function calling, hay que comprobarlo empíricamente antes de integrarlo.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar de forma apreciable la calidad; el propio autor marca Q3_K_M como "lower quality". Para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Estopia-13B-32k-GGUF
- Modelo base: https://huggingface.co/pinkachu/Estopia-13B-32k
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/Estopia-13B-32k-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Estopia-13B-32k-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Mención en hilo de la comunidad (SillyTavernAI): https://www.reddit.com/r/SillyTavernAI/comments/1jysb6k/megathread_best_modelsapi_discussion_week_of/
- Lista de modelos usada en un notebook de Colab: https://colab.research.google.com/drive/1g41PDb9Bck-3VI6yRZ_1M727yL05gZY8?usp=sharing
