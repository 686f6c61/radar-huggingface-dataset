# nubeera-ai/qwen-python-tutor-lora

## Resumen

`nubeera-ai/qwen-python-tutor-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`, según declara el autor en los metadatos del repositorio. Se trata, por tanto, de un ajuste fino ligero orientado a generación de texto conversacional, presumiblemente con el objetivo de actuar como tutor de Python, a juzgar por el identificador del modelo. El repositorio tiene un tamaño de 0,5 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

El modelo base Qwen2.5-Coder-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Qwen, especializado en código y con capacidad de instrucciones. Al ser un adaptador, este repositorio no contiene pesos completos: requiere cargar el modelo base y aplicar el adaptador mediante la librería PEFT. La model card del autor es la plantilla por defecto de Hugging Face y no aporta información sustantiva sobre datos de entrenamiento, hiperparámetros ni evaluación.

La relevancia de esta ficha es limitada pero concreta: sirve para documentar un adaptador de nicho (tutoría de Python) que puede interesar a quien busque un modelo pequeño, desplegable en hardware modesto, para asistencia educativa en programación. No hay descargas ni likes registrados en el momento de la consulta, y la licencia no está especificada, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta hasta 32.768 tokens segun su documentacion oficial, no verificable en este repositorio) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF/AWQ/BnB segun su ecosistema) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA (Low-Rank Adaptation) gestionado con PEFT 0.22.0, según la sección de versiones de framework de la model card. La técnica LoRA congela los pesos del modelo base e inserta matrices de bajo rango entrenables en determinadas capas, lo que reduce drásticamente el número de parámetros a entrenar y el coste de almacenamiento; de ahí el tamaño de 0,5 GB del repositorio frente a los aproximadamente 3 GB que ocuparía el modelo base de 1,5B en fp16.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset, la existencia de RLHF/DPO ni los hiperparámetros (rango, alpha, dropout, capas objetivo). La model card no documenta ninguna innovación técnica adicional. El modelo base Qwen2.5-Coder-1.5B-Instruct, sobre el que se aplica el adaptador, es un transformer decoder-only con atención causal estándar, entrenado por Alibaba Qwen para tareas de código e instrucciones; sus detalles completos deben consultarse en la ficha del modelo base.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada del modelo base.
- Asistencia en programación Python: explicación de conceptos, resolución de dudas y generación de fragmentos de código, presumiblemente reforzada por el ajuste fino (no verificado con evaluación).
- Razonamiento sobre código y matemáticas básicas, en la medida en que lo soporte el modelo base de 1,5B.
- Soporte de conversaciones multi-turno (pipeline `text-generation` y etiqueta `conversational`).
- Tool calling / function calling: no documentado en este repositorio; el modelo base Qwen2.5-Coder-Instruct lo soporta según su documentación oficial, pero no se puede confirmar que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Tutoría de Python para principiantes: el adaptador puede desplegarse como asistente conversacional que explique sintaxis, estructuras de control y errores comunes, aprovechando el ajuste específico sobre el modelo base de código.
- Asistente de dudas en plataformas de aprendizaje (LMS): integrado vía API con Transformers o un servidor de inferencia, puede responder preguntas de alumnos sobre ejercicios de Python en un entorno controlado.
- Generación de ejemplos didácticos: producir fragmentos de código comentados y ejercicios resueltos para material docente, con revisión humana obligatoria por el riesgo de alucinación.
- Revisión guiada de código de estudiantes: señalar errores sintácticos y proponer correcciones explicadas, como complemento (no sustituto) de un corrector automático.
- Prototipado rápido en local: al ser un adaptador sobre un modelo de 1,5B, cabe en GPUs de consumo y permite experimentar con un asistente de Python sin infraestructura cloud.
- Base para nuevos ajustes: sirve como punto de partida (adaptador ya entrenado) para fine-tuning adicional en dominios educativos concretos, gracias a su formato PEFT estándar.
- Chatbot de documentación interna: desplegado sobre un corpus de guías de Python de una organización, siempre que se valide previamente su calidad de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B ocupa aproximadamente 3 GB en fp16 y alrededor de 1 GB en cuantización de 4 bits; el adaptador LoRA añade una sobrecarga mínima (el repositorio pesa 0,5 GB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16, o 2-3 GB para cuantización de 4 bits (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A10, L4). Para entrenamiento o ajuste adicional, se recomienda A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; en 4 bits, incluso en GPUs de gama baja con 4 GB.
- Opciones de despliegue: Transformers + PEFT (carga del adaptador sobre el modelo base), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertirlo a GGUF), y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nubeera-ai/qwen-python-tutor-lora | Adaptador LoRA sobre 1,5B | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste específico para tutoría de Python; sin evaluación publicada |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens (según documentación oficial del modelo base) | Apache 2.0 (según documentación oficial del modelo base) | Hugging Face, muy extendido | Modelo base generalista de código; sin ajuste educativo específico |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens (según documentación oficial) | Apache 2.0 (según documentación oficial) | Hugging Face | Mayor capacidad y calidad, pero requiere más VRAM (aprox. 14 GB en fp16) |
| deepseek-ai/deepseek-coder-1.3b-instruct | 1,3B | 16.384 tokens (según documentación oficial) | DeepSeek License (según documentación oficial) | Hugging Face | Alternativa pequeña para código, sin ajuste de tutoría |

## Limitaciones y advertencias

- La model card es la plantilla por defecto de Hugging Face: no hay información sobre datos, sesgos, evaluación ni uso previsto, lo que impide valorar su calidad real.
- Riesgo de alucinación elevado: al ser un modelo de 1,5B ajustado con LoRA, puede generar explicaciones o código incorrectos con aparente seguridad; requiere validación humana en contextos educativos.
- Sesgos conocidos: no documentados; hereda los sesgos del modelo base y del dataset de ajuste, ambos desconocidos.
- Limitaciones de contexto e idioma: no documentadas en este repositorio; el contexto efectivo puede ser menor que el del modelo base si el ajuste se hizo con secuencias cortas.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de desplegarlo en producción.
- Sin descargas ni validación comunitaria: no hay evidencia de que el adaptador haya sido probado por terceros.
- El repositorio solo contiene el adaptador: es necesario descargar el modelo base y aplicar PEFT; un uso incorrecto (cargar el adaptador como modelo completo) fallará.
- Fecha de creación futura (2026-11-27) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nubeera-ai/qwen-python-tutor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto ambiental (citada en la model card): https://mlco2.github.io/impact
