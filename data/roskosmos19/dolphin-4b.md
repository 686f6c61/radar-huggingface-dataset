# roskosmos19/Dolphin-4B

## Resumen

Dolphin-4B es un modelo de lenguaje de 4.112.079.360 parámetros publicado por el usuario roskosmos19 en Hugging Face, construido sobre la arquitectura XHToken/Spark-X2.5-4B. Se distribuye como un lanzamiento "reconfigurado" orientado a uso conversacional, razonamiento, generación de código y comportamiento agéntico. Emplea una arquitectura de atención híbrida (ventana deslizante más atención completa) que declara soporte nativo de hasta 1.048.576 tokens de contexto, un vocabulario de 131.072 entradas y pesos en bfloat16 bajo licencia Apache 2.0.

La relevancia de este modelo está en su relación capacidad/tamaño: con unos 4.100 millones de parámetros aspira a caber en GPU de consumo y ofrecer contexto ultralargo, tool calling y modo de razonamiento (`<think>...</think>`), capacidades habitualmente reservadas a modelos mucho mayores. No obstante, existe una advertencia crítica publicada por el propio autor el 2026-11-23: los pesos de este repositorio son byte a byte idénticos a los del modelo base Spark-X2.5-4B (verificado por SHA-256 de los ficheros safetensors). Solo se han modificado configuración, plantilla de chat y documentación. Por tanto, cualquier afirmación sobre entrenamiento adicional o mejores puntuaciones de benchmarks no se corresponde con unos pesos distintos de los del original.

En la práctica, Dolphin-4B debe evaluarse como una reempaquetadura de Spark-X2.5-4B con identidad, plantilla de chat y parámetros de muestreo recomendados propios. Es útil para quien quiera una configuración lista para agentes y código con la arquitectura Spark, pero no aporta ganancias de rendimiento medibles frente al original. El repositorio tiene 57 descargas y 2 likes en el momento de la consulta, y un tamaño de 8,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (sliding window + full attention) |
| Parametros totales | 4.112.079.360 (~4,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (declarado) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en bfloat16; compatible con stacks tipo llama.cpp/MLX según la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`; código propio `modeling_spark.py` y `configuration_spark.py`) |

Otros datos: tamaño de vocabulario 131.072; precisión bfloat16; pipeline `text-generation`; biblioteca `transformers`; modelo base `XHToken/Spark-X2.5-4B`.

## Arquitectura y entrenamiento

Dolphin-4B se apoya en la arquitectura Spark-X2.5 de XHToken/SparkLLM, un transformer con esquema de atención híbrido que combina ventana deslizante (sliding window) con atención completa. Este diseño es el que permite declarar una ventana de contexto de 1.048.576 tokens manteniendo un coste de atención contenido en las capas de ventana deslizante, mientras las capas de atención completa preservan el acceso global. El vocabulario es de 131.072 tokens y los pesos se publican en bfloat16.

Sobre el entrenamiento no hay información verificable en la documentación disponible: la model card no detalla número de tokens, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. La corrección del autor del 2026-11-23 aclara que los pesos son idénticos al modelo base y que solo se modificaron configuración, plantilla de chat y documentación, por lo que no cabe atribuir a este repositorio ningún entrenamiento adicional. La model card menciona "fine-tuned in identity and behavior", pero esa afirmación queda contradicha por la propia corrección. La innovación técnica destacable, heredada del base, es la atención híbrida para contexto ultralargo; no se documentan en la información disponible técnicas como decodificación especulativa o atención lineal más allá de lo indicado.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat que soporta roles system/user/assistant.
- Razonamiento paso a paso mediante modo de pensamiento integrado (`<think>...</think>`), activado por defecto y desactivable por petición.
- Generación de código, con énfasis declarado en código limpio, moderno y listo para producción.
- Tool calling / function calling, según la plantilla de chat incluida.
- Comportamiento agéntico y flujos multi-paso (multi-step workflows) e instrucciones encadenadas.
- Contexto ultralargo de hasta 1.048.576 tokens para documentos extensos o historiales largos.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de código en IDE o CLI: el modelo puede generar funciones, explicar código y proponer refactorizaciones; su tamaño de ~4,1B permite ejecución local en GPU de consumo con cuantización, lo que encaja en flujos de desarrollo con privacidad de código.
- Agente con tool calling en automatización de tareas: la plantilla de chat soporta llamadas a funciones, de modo que puede integrarse en orquestadores de agentes que encadenen búsquedas, ejecución de comandos o consultas a APIs en varios pasos.
- Análisis de documentos largos: con contexto declarado de 1.048.576 tokens puede procesar repositorios, contratos o transcripciones extensas en una sola pasada, siempre que la memoria GPU lo permita.
- Razonamiento asistido con modo thinking: útil para problemas de matemáticas, diagnóstico de errores o planificación, donde el bloque `<think>` permite separar el razonamiento interno de la respuesta final.
- Chatbot de atención al cliente en inglés: conversaciones multi-turno con instrucciones de sistema personalizables y tono configurable mediante el system prompt por defecto.
- Prototipado e investigación de agentes: al ser un modelo pequeño y con licencia Apache 2.0, sirve para experimentar con arquitecturas de atención híbrida y contexto largo sin coste de licencia.
- Generación de tests y documentación técnica: puede producir casos de prueba y docstrings a partir de fragmentos de código, integrándose en pipelines de CI/CD como paso de generación asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ejecutó ninguna evaluación propia para este repositorio y remite a la card del modelo base para puntuaciones medidas; esos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,2 GB solo para pesos (4,1B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 12-16 GB para contextos moderados.
- VRAM para contexto muy largo: la caché KV crece con la longitud; con 1M tokens el requisito de memoria es muy elevado incluso con atención híbrida, por lo que contextos de ese orden exigen GPUs de datacenter con mucha memoria.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo y servicio concurrente; RTX 4090 (24 GB) para contexto moderado en bfloat16 o cuantizado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 8-12 GB (por ejemplo RTX 3060/4060 Ti) para contextos cortos; no se dispone de cifras verificadas de cuantización en la información proporcionada.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio, según declara la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dolphin-4B (este) | ~4,1B | 1.048.576 (declarado) | Apache 2.0 | Pesos idénticos a Spark-X2.5-4B; solo cambian config, plantilla y docs |
| XHToken/Spark-X2.5-4B | ~4,1B | 1.048.576 (declarado) | no disponible en la información proporcionada | Modelo base original de la misma arquitectura |
| Alternativas de ~4B (p. ej. Qwen, Llama, Phi de tamaño similar) | ~3-4B | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

La comparación cuantitativa con otras familias de ~4B no está disponible: no hay benchmarks publicados para este repositorio ni cifras del modelo base en la información facilitada.

## Limitaciones y advertencias

- Advertencia principal: los pesos son byte a byte idénticos a XHToken/Spark-X2.5-4B; no hay entrenamiento adicional ni mejora de benchmarks atribuible a este repositorio. Cualquier afirmación en sentido contrario es incorrecta según la corrección del propio autor.
- Riesgo de alucinación: la model card reconoce que puede inventar hechos y generar código incorrecto; es necesario verificar las salidas antes de usarlas en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Sesgos: hereda los sesgos y limitaciones del modelo base y de sus datos de entrenamiento, no documentados en la información disponible.
- Contexto largo: aunque se declaran 1M tokens, la memoria GPU necesaria es muy elevada y la calidad efectiva en ventanas extremas no está verificada.
- Código remoto: requiere `trust_remote_code=True`; conviene revisar `modeling_spark.py` y `configuration_spark.py` antes de ejecutarlo en entornos sensibles.
- Licencia: Apache 2.0 permite uso comercial, pero al no haber evaluación propia ni garantías del autor, el uso en producción debe acompañarse de validación interna.
- Madurez: 57 descargas y 2 likes; no es un lanzamiento con validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roskosmos19/Dolphin-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
