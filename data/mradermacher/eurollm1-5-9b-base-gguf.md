# mradermacher/EuroLLM1.5-9B-Base-GGUF

## Resumen

EuroLLM1.5-9B-Base es un modelo de lenguaje base desarrollado por el proyecto utter-project, una iniciativa europea centrada en la creación de modelos de lenguaje de código abierto con especial atención a las lenguas europeas. Esta versión concreta, publicada por mradermacher, es una cuantización en formato GGUF del modelo original, lo que permite su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo cuenta con 9.152.319.488 parámetros totales y está diseñado como modelo base, es decir, sin ajuste fino para instrucciones ni alineación conversacional.

El interés principal de este modelo reside en su cobertura lingüística: soporta 35 idiomas, incluyendo las principales lenguas europeas (español, alemán, francés, italiano, portugués, neerlandés, polaco, entre otras) además de lenguas minoritarias como el gaélico, el maltés, el gallego, el catalán, el esloveno, el eslovaco, el estonio, el letón y el lituano. Esta amplitud lo convierte en una alternativa relevante para aplicaciones multilingües en el contexto europeo, donde otros modelos abiertos suelen tener una cobertura mucho más limitada.

La licencia Apache 2.0 facilita su uso comercial y su integración en productos sin restricciones significativas. Al tratarse de un modelo base, no está optimizado para seguir instrucciones ni para tareas conversacionales directas, sino que está pensado como punto de partida para ajuste fino o para tareas de modelado de lenguaje, generación de texto y evaluación de representaciones lingüísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no disponible el detalle exacto en la informacion proporcionada) |
| Parametros totales | 9.152.319.488 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16 (16 bpw) disponible en este repositorio; el autor menciona en la model card la existencia de otros tipos planificados o habituales (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS) aunque en la tabla de ficheros proporcionados solo figura f16 |
| Idiomas soportados | 35 idiomas: en, de, es, fr, it, pt, pl, nl, tr, sv, cs, el, hu, ro, fi, uk, sl, sk, da, lt, lv, et, bg, no, ca, hr, ga, mt, gl, zh, ru, ko, ja, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion f16 en este repositorio); el modelo original esta en safetensors |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo original (tipo de atención, número de capas, dimensiones del modelo, uso de RoPE, etc.). Se trata de un modelo transformer decoder-only de 9.152 millones de parámetros, según el recuento de safetensors del modelo base. La model card del repositorio de cuantización no incluye información sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Al ser un modelo base, es previsible que no haya pasado por fases de ajuste por instrucciones.

La innovación principal del proyecto EuroLLM radica en su enfoque en la cobertura de lenguas europeas, incluyendo lenguas de menor recursos. Sin embargo, los detalles técnicos concretos sobre cómo se logra esta cobertura (composición del corpus, técnicas de tokenización multilingüe, etc.) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto en 35 idiomas, con especial énfasis en lenguas europeas.
- Modelado de lenguaje base: adecuado para completar texto, evaluar perplejidad y generar representaciones lingüísticas.
- Capacidad multilingüe amplia, incluyendo lenguas minoritarias europeas (gaélico, maltés, gallego, catalán, esloveno, eslovaco, estonio, letón, lituano).
- Soporte de lenguas no europeas: chino, ruso, coreano, japonés, árabe, hindi.
- Al ser un modelo base, no está entrenado específicamente para seguir instrucciones, tool calling, function calling ni razonamiento multi-paso. Estas capacidades requerirían ajuste fino adicional.
- No se dispone de información sobre modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Ajuste fino para tareas específicas en lenguas europeas: el modelo puede servir como punto de partida para entrenar clasificadores, generadores o sistemas de extracción de información en idiomas como el esloveno, el estonio o el maltés, donde hay escasez de modelos abiertos con cobertura adecuada.
- Generación de texto multilingüe en producción: con licencia Apache 2.0 y formato GGUF, puede desplegarse en servidores modestos para tareas de generación de contenido en varios idiomas europeos sin costes de licencia.
- Evaluación de representaciones lingüísticas: investigadores pueden utilizar el modelo para medir la calidad de sus embeddings en lenguas de bajos recursos y comparar con otros modelos multilingües.
- Traducción automática asistida: aunque no es un modelo específicamente entrenado para traducción, su cobertura de 35 idiomas permite experimentar con traducción few-shot o como base para ajuste fino en pares de lenguas europeas.
- Investigación en lingüística computacional: el modelo permite estudiar el comportamiento de modelos de 9B parámetros en lenguas con pocos datos, analizando sesgos, cobertura y calidad gramatical.
- Despliegue en entornos con recursos limitados: la cuantización f16 (18,4 GB) y la disponibilidad de otros formatos GGUF permiten ejecutar el modelo en GPUs de consumo de gama alta o en configuraciones multi-GPU modestas, facilitando prototipado y experimentación sin infraestructura de datacenter.
- Generación de texto para industrias creativas en lenguas minoritarias: guiones, descripciones de producto o contenido editorial en catalán, gallego, gaélico o maltés, donde los modelos comerciales suelen tener un rendimiento inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Cuantización f16: aproximadamente 18,4 GB de VRAM (tamaño del fichero GGUF) más overhead de contexto.
  - Cuantizaciones de menor precisión (Q8_0, Q6_K, Q5_K_M, Q4_K_M, etc.): el autor menciona su existencia en la model card, aunque no se proporcionan los tamaños exactos en la tabla de ficheros. Como referencia orientativa para un modelo de 9B, Q8_0 rondaría los 9-10 GB, Q4_K_M alrededor de 5-6 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas:
  - f16: A100 40 GB, H100, o GPUs de consumo con 24 GB (RTX 3090, RTX 4090) con contexto limitado.
  - Cuantizaciones Q4/Q5: RTX 3060 12 GB, RTX 4070, RTX 4080, o incluso GPUs con 8 GB en cuantizaciones muy agresivas (Q2_K, Q3_K_S).
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones Q4_K_M o inferiores. La versión f16 requiere GPUs de 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo original en safetensors: vLLM, TGI, transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EuroLLM1.5-9B-Base (este) | 9,15B | No disponible | 35 (énfasis europeo) | Apache 2.0 | GGUF, safetensors |
| Mistral 7B Base | 7,2B | 8k (v0.1) / 32k (v0.2) | Principalmente inglés | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Base | 8,0B | 128k | 8 idiomas oficiales | Llama 3.1 Community License | safetensors, GGUF |
| Gemma 2 9B Base | 9,2B | 8k | Multilingüe (no detallado) | Gemma Terms of Use | safetensors, GGUF |

La comparativa se basa en datos públicos de los modelos alternativos; los datos de EuroLLM1.5-9B-Base sobre contexto y rendimiento no están disponibles en la información proporcionada. La principal ventaja diferencial de EuroLLM es su cobertura de 35 idiomas con licencia Apache 2.0, frente a la licencia más restrictiva de Llama 3.1 y las limitaciones idiomáticas de Mistral 7B.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado para seguir instrucciones ni para conversación; su uso directo en chatbots producirá respuestas incoherentes o no deseadas.
- Riesgo de alucinación y generación de contenido factualmente incorrecto, especialmente en lenguas de bajos recursos donde los datos de entrenamiento son escasos.
- Sesgos potenciales derivados de los datos de entrenamiento, no documentados en la información proporcionada.
- Longitud de contexto no disponible; se desconoce si soporta ventanas largas, lo que limita su uso en tareas que requieran contexto extenso.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base no está optimizado para producción sin ajuste fino previo.
- La cuantización f16 es la única confirmada en la tabla de ficheros de este repositorio; otras cuantizaciones mencionadas en la model card podrían no estar disponibles en el momento de la consulta.
- No se dispone de información sobre el rendimiento en benchmarks, lo que dificulta la comparación objetiva con alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria extensa.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/EuroLLM1.5-9B-Base-GGUF
- Modelo base original: https://huggingface.co/utter-project/EuroLLM1.5-9B-Base
- Página de descarga del autor: https://hf.tst.eu/model#EuroLLM1.5-9B-Base-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelo (mradermacher): https://huggingface.co/mradermacher/model_requests
