# Eoyn/sql-mistral-7b-lora

## Resumen

`Eoyn/sql-mistral-7b-lora` es un adaptador LoRA alojado en Hugging Face por el usuario Eoyn. Por el nombre del repositorio y las etiquetas disponibles (`unsloth`, `transformers`, `safetensors`), se trata de un ajuste fino de bajo rango (LoRA) sobre una base Mistral de 7 000 millones de parámetros, orientado presumiblemente a la generación de consultas SQL. No obstante, la model card publicada es la plantilla automática de Hugging Face y no contiene información verificable sobre el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos.

El repositorio tiene un tamaño de 0,2 GB, lo que es coherente con un adaptador LoRA y no con pesos completos del modelo base: un checkpoint completo de Mistral 7B en precisión de 16 bits ocuparía del orden de 14 GB. Esto implica que para su uso es necesario cargar por separado el modelo base Mistral 7B y aplicar el adaptador encima.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo no registra descargas ni interacciones, no declara licencia, idiomas ni pipeline, y su model card no aporta documentación técnica. Se describe a continuación lo que puede inferirse de forma rigurosa a partir de los metadatos y del conocimiento público sobre la familia Mistral 7B y la técnica LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral 7B); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | No disponible en el repositorio; el modelo base Mistral 7B tiene 7 240 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Mistral 7B soporta 8 192 tokens (32 768 con sliding window configurada) |
| Tipos de cuantizacion | No disponible; al ser LoRA en safetensors, admite combinarse con cuantizaciones del base (4-bit, 8-bit, GGUF) si se fusiona o aplica en tiempo de carga |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base en safetensors o formato compatible con transformers |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers |
| Etiquetas | unsloth, arxiv:1910.09700, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, una técnica de ajuste eficiente en parámetros que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas (habitualmente las proyecciones de atención y MLP). La etiqueta `unsloth` sugiere que el entrenamiento se realizó con la librería Unsloth, orientada a acelerar el fine-tuning de modelos abiertos en GPU de consumo mediante kernels optimizados y reducción de memoria. La etiqueta `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono en aprendizaje automático, incluido en la plantilla de model card, no a un paper del modelo.

No hay información publicada sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos SQL, la existencia de RLHF/DPO ni los hiperparámetros del ajuste (rango LoRA, alpha, tasa de aprendizaje, épocas). Tampoco se documenta si el adaptador se aplicó solo a las capas de atención o también a las MLP, ni si se fusionó con el base. La arquitectura subyacente, Mistral 7B, es un transformer decoder-only con atención de ventana deslizante (sliding window attention), GQA (grouped-query attention) y activación SwiGLU, pero estos detalles corresponden al base y no están verificados en este repositorio.

## Capacidades

- Generación de texto y, presumiblemente por el nombre del repositorio, generación de consultas SQL a partir de lenguaje natural o de esquemas de bases de datos. Esta capacidad no está documentada ni evaluada en la model card.
- Razonamiento y código heredados del modelo base Mistral 7B, en la medida en que el ajuste LoRA no los degrade; no hay evidencia publicada al respecto.
- Soporte de tool calling y function calling: no documentado en este repositorio; dependerá de la plantilla de chat y del base utilizado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el base Mistral 7B tiene buen rendimiento en inglés y aceptable en otras lenguas europeas, pero no se ha verificado el efecto del ajuste.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Generación de consultas SQL en herramientas internas de análisis: cargando el base Mistral 7B y aplicando el adaptador, se podría traducir una pregunta en lenguaje natural a una consulta SELECT sobre un esquema conocido. La idoneidad real depende de una evaluación que el autor no ha publicado.
- Asistente de BI para equipos no técnicos: integrado en un chatbot que reciba el esquema de la base de datos como contexto y devuelva SQL ejecutable, con validación posterior contra el motor.
- Autocompletado de consultas en editores SQL: el adaptador podría sugerir fragmentos de consulta a partir de un prefijo y del esquema, siempre que se valide sintácticamente antes de ejecutar.
- Migración entre dialectos SQL (por ejemplo, de MySQL a PostgreSQL): uso plausible de un modelo ajustado en SQL, aunque no hay evidencia de que el adaptador haya sido entrenado para esta tarea concreta.
- Generación de consultas para pipelines de datos: creación de sentencias de transformación en herramientas como dbt o Spark SQL, con revisión humana obligatoria.
- Docencia y formación en SQL: generación de ejemplos de consultas con explicaciones, útil en entornos controlados donde los errores no tengan consecuencias operativas.
- Prototipado rápido de interfaces text-to-SQL: al ser un adaptador de 0,2 GB, permite experimentar con bajo coste de almacenamiento, aunque requiere el base completo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es la plantilla automática de Hugging Face y no incluye métricas de ejecución exacta de SQL, BLEU, MMLU, HumanEval ni ninguna otra evaluación. Tampoco hay comparaciones con modelos text-to-SQL de referencia.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa 0,2 GB, pero requiere cargar el base Mistral 7B. En fp16, el base necesita aproximadamente 14-15 GB de VRAM; en 8-bit, unos 8 GB; en 4-bit (por ejemplo, mediante bitsandbytes o GGUF Q4_K_M), unos 4,5-5,5 GB.
- GPU recomendadas: A100 40 GB o H100 para servicio en fp16 con concurrencia; RTX 4090 (24 GB) para fp16 en una sola GPU; RTX 3090/4080 (16-24 GB) para fp16 o 8-bit; RTX 3060 12 GB o RTX 4060 Ti 16 GB para 4-bit.
- Cabe en GPU de consumo: sí, en cuantización 4-bit u 8-bit, siempre que se aplique el adaptador sobre el base cuantizado o se fusione y cuantice después.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI admiten LoRA si se configura el adaptador junto al base; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF, ya que no cargan adaptadores LoRA de forma nativa en todos los casos.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eoyn/sql-mistral-7b-lora | 7B (base) + LoRA | No disponible (base: 8 192) | Text-to-SQL (presunto) | No disponible | Hugging Face, 0 descargas |
| Mistral 7B Instruct (base de referencia) | 7B | 8 192 | Propósito general | Apache 2.0 | Amplia |
| Defog SQLCoder-7B | 7B | 4 096-16 384 según versión | Text-to-SQL | CC BY-SA 4.0 (según versión) | Hugging Face, amplia adopción |
| CodeLlama-7B | 7B | 16 384 | Código y SQL | Llama 2 Community License | Hugging Face |

La comparación es aproximada: no hay datos de rendimiento publicados para `Eoyn/sql-mistral-7b-lora`, por lo que no puede situarse frente a SQLCoder o CodeLlama en métricas de ejecución exacta. La principal diferencia práctica es la ausencia de licencia declarada y de documentación, frente a alternativas con licencias explícitas y evaluaciones publicadas.

## Limitaciones y advertencias

- La model card es la plantilla automática: no hay información sobre datos de entrenamiento, evaluación ni uso previsto, lo que impide validar su calidad.
- No se declara licencia. Sin licencia explícita, el uso comercial es jurídicamente incierto y, en muchas jurisdicciones, no está permitido por defecto. Además, la licencia del base Mistral 7B (Apache 2.0 en la versión original) debe respetarse por separado.
- Riesgo de alucinación: cualquier modelo text-to-SQL puede generar columnas, tablas o funciones inexistentes; es imprescindible validar la consulta contra el esquema real antes de ejecutarla.
- Riesgo de inyección SQL si la salida se ejecuta sin parametrización ni revisión; no debe conectarse directamente a bases de datos de producción sin controles.
- El adaptador no incluye los pesos del base: quien lo descargue debe obtener Mistral 7B por su cuenta y verificar la compatibilidad de la plantilla de chat.
- Sin métricas de ejecución exacta ni de robustez, no hay evidencia de que supere al base sin ajustar en tareas SQL.
- Cero descargas y cero interacciones en el momento de la consulta: no hay comunidad que haya reportado problemas ni validado su funcionamiento.
- Idiomas no declarados: el comportamiento en castellano no está verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Eoyn/sql-mistral-7b-lora
- Librería Unsloth (mencionada en las etiquetas): https://github.com/unslothai/unsloth
- Artículo citado en las etiquetas (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Modelo base Mistral 7B: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
