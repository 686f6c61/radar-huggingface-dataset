# mradermacher/bella-bartender-qwen3.5-2b-i1-GGUF

## Resumen

Bella Bartender Qwen3.5 2B es un modelo conversacional fine-tuned a partir de Qwen3.5 2B, desarrollado por juiceb0xc0de y entrenado con Unsloth. Se trata de un modelo de personalidad ("personality", "single-voice" según sus etiquetas), orientado a generar un personaje concreto y coherente en sus respuestas, en este caso un personaje de tipo "bartender". La ficha aquí presentada corresponde al repositorio de cuantizaciones GGUF con imatrix publicado por mradermacher, que ofrece más de veinte variantes cuantizadas del modelo base para su ejecución local con llama.cpp y herramientas compatibles.

Su relevancia radica en la combinación de un tamaño muy reducido (1.881.825.088 parámetros, aproximadamente 1,9B) con una licencia Apache 2.0, lo que permite ejecutarlo en hardware muy modesto, incluso en portátiles sin GPU dedicada, sin restricciones de uso comercial. Es un modelo monolingüe en inglés, por lo que su uso está limitado a ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) |
| Parametros totales | 1.881.825.088 (~1,9B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix; el modelo base se distribuye en safetensors con transformers) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5 2B, una arquitectura transformer densa de la familia Qwen de Alibaba. El ajuste fino se realizó con Unsloth, una biblioteca optimizada para fine-tuning eficiente de LLM en hardware de consumo, y las etiquetas del repositorio ("personality", "single-voice", "conversational") indican que el entrenamiento se centró en dotar al modelo de un personaje único y coherente con voz propia, en concreto el personaje "bella bartender".

Sobre los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no hay informacion disponible en la model card. Tampoco se detalla el metodo de ajuste (SFT, DPO, etc.). La version aqui descrita es la cuantizacion realizada por mradermacher mediante el metodo imatrix (matriz de importancia), que calcula estadisticas de activacion sobre un corpus de calibracion para mejorar la calidad de las cuantizaciones de baja bit-depth en comparacion con cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional en ingles con una personalidad unica y coherente (personaje de bartender).
- Dialogo multi-turno orientado a roleplay y chat de personaje ("single-voice").
- Ejecucion local eficiente gracias a las cuantizaciones GGUF, desde 0,8 GB (IQ1_S) hasta 1,7 GB (Q6_K).
- No hay informacion disponible sobre soporte de tool calling, agentes, razonamiento estructurado, vision, audio ni codigo. La model card menciona que el modelo base podria ser un modelo de vision ("This is a vision model"), pero no se aportan detalles verificables.

## Casos de uso

- Chatbots de personaje para videojuegos: el modelo puede encarnar a un NPC (por ejemplo, una bartender en un juego o novela interactiva) con respuestas coherentes en estilo y tono, ejecutandose localmente incluso en equipos sin GPU.
- Roleplay e interactivo fiction: dado su entrenamiento de personalidad unica ("single-voice"), es adecuado para aplicaciones de roleplay donde se requiere que el personaje no rompa su voz, con latencias bajas al ser un modelo de ~1,9B.
- Demostraciones y prototipos de agentes conversacionales: su tamaño reducido permite iterar rapidamente en portatiles o mini-PC antes de escalar a modelos mayores.
- Asistentes de ocio y entretenimiento embebidos: puede integrarse en apps de escritorio o moviles (via llama.cpp) para ofrecer un companero conversacional tematico sin coste de API.
- Educacion y experimentacion: al ser Apache 2.0 y muy ligero, es util como base para aprender fine-tuning, cuantizacion y despliegue local de LLM.
- Generacion de dialogos creativos: redaccion de dialogos de personaje para guiones, novelas o contenido narrativo, manteniendo un registro coloquial de bar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,8 GB (i1-IQ1_S) y 1,7 GB (i1-Q6_K) solo de pesos, mas el contexto. Con la cuantizacion recomendada Q4_K_M (~1,4 GB), cabe comodamente en cualquier equipo con 4 GB de RAM libres.
- GPU recomendadas: no requiere GPU dedicada; se ejecuta por CPU. En GPUs, cualquier modelo moderno (GTX 1650, RTX 3060, RTX 4090) lo ejecutara con holgura; el cuello de botella sera el contexto, no el tamaño del modelo.
- Consumer GPUs: cabe sobradamente en cualquier GPU de consumo actual, incluso en integradas (iGPU) con memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. El archivo imatrix permite ademas generar cuantizaciones propias.
- Latencia y throughput: no disponible; por tamaño (~1,9B cuantizado a 4 bits) cabe esperar velocidades altas incluso en CPU de escritorio estandar, tipicamente decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Enfoque |
|---|---|---|---|---|
| Bella Bartender Qwen3.5 2B | ~1,9B | Apache 2.0 | GGUF (imatrix) | Chat de personaje / roleplay |
| Qwen3.5 2B (base) | ~1,9B | no disponible | safetensors | Modelo generalista base |
| Modelos de personaje tipo Pygmalion/Metharl (2B-3B) | 2B-3B | variable | GGUF/safetensors | Roleplay y personalidad |

Datos exactos de contexto y rendimiento de los modelos comparables no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Monolingüe en ingles: no es adecuado para generar contenido en castellano con garantias de calidad.
- Al ser un fine-tune de personalidad con dataset no documentado, existe riesgo elevado de alucinaciones y de respuestas factualmente imprecisas; no es un modelo orientado a tareas de conocimiento o razonamiento.
- No hay informacion sobre sesgos del dataset de entrenamiento; como todo modelo de personaje, puede reproducir estereotipos del personaje interpretado.
- La longitud de contexto no esta documentada, por lo que conviene verificarla empiricamente antes de usarlo en conversaciones largas.
- Las cuantizaciones IQ1_S/IQ1_M y Q2 se consideran de calidad muy baja segun el propio autor de las cuantizaciones; para uso practico se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero el comportamiento del modelo en produccion debe auditarse, especialmente en aplicaciones expuestas a usuarios finales.
- La model card menciona posibles archivos mmproj (vision) en el repositorio estatico, pero las capacidades multimodales no estan documentadas.

## Enlaces

- Repositorio de cuantizaciones GGUF (imatrix): https://huggingface.co/mradermacher/bella-bartender-qwen3.5-2b-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/bella-bartender-qwen3.5-2b-GGUF
- Modelo base: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3.5-2b
- Pagina de descargas del autor de las cuants: https://hf.tst.eu/model#bella-bartender-qwen3.5-2b-i1-GGUF
- Guia de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
