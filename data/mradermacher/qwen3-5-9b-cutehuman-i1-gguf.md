# mradermacher/Qwen3.5-9B-CuteHuman-i1-GGUF

## Resumen

Qwen3.5-9B-CuteHuman-i1-GGUF es una colección de cuantizaciones en formato GGUF, realizadas por el cuantizador mradermacher, del modelo base wesjos/Qwen3.5-9B-CuteHuman. Este modelo base es un ajuste de la familia Qwen3.5 de unos 9 mil millones de parámetros, orientado a roleplay y generación de texto con un estilo "cute": uso intensivo de emojis, kaomojis (emoticonos japoneses tipo (^_^)) y un tono conversacional cercano y expresivo. Según los tags del repositorio, se trata de un modelo multimodal (con capacidad de visión, dado que el autor indica que los ficheros mmproj se encuentran en el repositorio estático asociado).

La relevancia de esta ficha no está tanto en el modelo base como en la labor de cuantización: mradermacher publica versiones "imatrix" (importance matrix) en 17 formatos distintos, desde i1-Q2_K (4,0 GB) hasta i1-Q6_K (7,7 GB), lo que permite ejecutar el modelo en hardware muy variado, desde portátiles sin GPU dedicada hasta estaciones de trabajo con tarjetas gráficas de gama alta. La licencia Apache 2.0 heredada del modelo base permite uso comercial sin restricciones.

Es un modelo de nicho pero útil para desarrolladores que quieran desplegar localmente un asistente conversacional con personalidad expresiva, chatbots de compañia o sistemas de roleplay interactivo, especialmente en chino e inglés, los dos idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (detalles no disponibles) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 17 variantes i1 (imatrix): Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S/M/L, IQ3_XXS/XS/S/M, Q4_0, Q4_1, Q4_K_S/M, IQ4_NL, IQ4_XS, Q5_K_S/M, Q6_K |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, wesjos/Qwen3.5-9B-CuteHuman, es un ajuste (fine-tune) de un modelo Qwen3.5 de aproximadamente 9,2 mil millones de parámetros, con 9.197.093.888 parámetros según los metadatos de safetensors. Los tags del repositorio indican que es multimodal, y el autor de las cuantizaciones confirma que es un modelo de visión, cuyos proyectores mmproj se publican en el repositorio estático asociado. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni sobre el uso de técnicas como RLHF o DPO.

Sobre las cuantizaciones en sí: mradermacher emplea cuantizaciones "imatrix" (importance matrix), una técnica que calcula la importancia de cada activación durante la cuantización usando un dataset de calibración, obteniendo mejor calidad percibida que las cuantizaciones estáticas a igual tamaño. El repositorio también ofrece un fichero imatrix (0,1 GB) para que los usuarios generen sus propias cuantizaciones. Las cuantizaciones estáticas equivalentes están disponibles en un repositorio hermano.

## Capacidades

- Generación de texto conversacional con estilo "cute": tono expresivo, uso de emojis y kaomojis, orientado a interacciones informales y de compañia.
- Roleplay: el modelo está etiquetado específicamente para juegos de rol conversacionales y simulación de personajes.
- Capacidades multimodales de visión: los tags indican "multimodal" y el autor confirma que es un modelo de visión, con ficheros mmproj disponibles en el repositorio estático.
- Soporte de chino e inglés como idiomas principales.
- Formato conversacional: el repositorio está etiquetado como "conversational", apto para chat multi-turno.
- No hay información sobre soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Chatbots de compañia y personajes virtuales: el estilo "cute" con emojis y kaomojis está diseñado precisamente para dar personalidad expresiva a asistentes conversacionales, ideal para apps de chat informal.
- Roleplay interactivo: puede encarnar personajes en sesiones de juego de rol textual, manteniendo un tono coherente con la personalidad definida por el usuario.
- Bots de comunidad para Discord o Telegram: su tamaño (cabe en una GPU de consumo o incluso en CPU con cuants bajos) lo hace apto para bots ligeros que respondan con un estilo amigable.
- Asistentes locales con visión: gracias al soporte multimodal, se puede montar un asistente local que describa imágenes con un tono cercano, usando los ficheros mmproj del repositorio estático.
- Prototipado de agentes conversacionales en chino: útil para desarrolladores que trabajen con audiencia china y quieran un modelo pequeño y expresivo ejecutable en local.
- Generación de contenido para redes sociales o marketing con tono juvenil: redacción de mensajes, respuestas y microcopy con emojis, en inglés o chino.
- Enseñanza y demostraciones de cuantización: la amplia gama de cuants (desde IQ1_S hasta Q6_K) sirve como banco de pruebas para comparar el impacto de la cuantización en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Los tamaños de fichero van desde 4,0 GB (i1-Q2_K) hasta 7,7 GB (i1-Q6_K); a esto hay que añadir la memoria para el KV cache según la longitud de contexto.
- GPU recomendadas: cualquier GPU de consumo con 8 GB de VRAM (RTX 3060, RTX 4060 Ti) ejecuta cómodamente cuants de hasta i1-Q6_K. Con 6 GB (RTX 3060 de 6 GB, RTX 4050) funcionan los cuants Q3 y Q4. En CPU pura, los cuants Q2/Q3 son viables en equipos con 8-16 GB de RAM.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 6 GB o más de VRAM, incluso con la cuantización más alta.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, KoboldCpp (popular para roleplay), y cualquier runtime compatible con GGUF. No es un GGUF apto directamente para vLLM o TGI sin conversión.
- Latencia y throughput: no disponibles; en general, los cuants más pequeños (Q2/Q3) ofrecen mayor velocidad en CPU, mientras que Q4_K_M y superiores rinden mejor en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-9B-CuteHuman-i1-GGUF (este) | ~9,2 B | GGUF imatrix (17 cuants) | Apache 2.0 | Roleplay, estilo cute, multimodal |
| Qwen3.5-9B-CuteHuman-GGUF (estático, mismo autor) | ~9,2 B | GGUF estático | Apache 2.0 | Igual, con cuants estáticos y ficheros mmproj |
| Modelos Qwen3.5 de 9B sin ajustar (base oficial) | ~9 B | Safetensors / GGUF comunitarios | Apache 2.0 (según familia) | Uso general, sin estilo cute |

No se conocen otros fine-tunes comparables de roleplay sobre Qwen3.5 de 9B en la informacion disponible; como alternativas de roleplay en formato GGUF de tamaño similar suelen citarse ajustes de otras familias (por ejemplo, basados en Mistral o Llama de 7-9B), pero no hay datos publicados para una comparación de rendimiento.

## Limitaciones y advertencias

- Idiomas: el modelo declara oficialmente chino e inglés. No hay garantía de calidad en castellano ni en otros idiomas; el estilo "cute" puede no transferirse bien fuera de zh/en.
- Sesgos: no disponible. Al ser un fine-tune comunitario sin model card detallada, no hay información sobre sesgos evaluados.
- Alucinaciones: riesgo estándar de modelos de ~9B; en tareas de roleplay puede inventar hechos con total naturalidad, lo que conviene tenerlo en cuenta si se usa en producción.
- Cuantización agresiva: los cuants por debajo de Q3 (IQ1_S/M, IQ2_XXS/XS/S, Q2_K) pueden degradar notablemente la calidad, especialmente en un modelo con estilo expresivo; el propio autor recomienda IQ3_XXS sobre Q2_K.
- Visión: los ficheros mmproj están en el repositorio estático, no en este; hay que descargarlos de allí para usar capacidades multimodales con llama.cpp.
- Contexto: la longitud de contexto no está documentada en el repositorio; verificarla antes de diseñar aplicaciones con conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base (wesjos/Qwen3.5-9B-CuteHuman) por si existieran condiciones adicionales del autor del fine-tune.
- Tamaño del repositorio: 81,3 GB al descargar todas las cuantizaciones; descargar solo las variantes necesarias.

## Enlaces

- Repositorio de las cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-CuteHuman-i1-GGUF
- Repositorio de cuantizaciones estáticas (con ficheros mmproj): https://huggingface.co/mradermacher/Qwen3.5-9B-CuteHuman-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.5-9B-CuteHuman
- Página de descarga resumida: https://hf.tst.eu/model#Qwen3.5-9B-CuteHuman-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
