# invi-bhagyesh/qwen-2.5-7b-it-humor_anti_sarcasm

## Resumen

`invi-bhagyesh/qwen-2.5-7b-it-humor_anti_sarcasm` es un adaptador LoRA (PEFT) para el modelo base `Qwen/Qwen2.5-7B-Instruct`, publicado por el usuario invi-bhagyesh. No es un modelo completo, sino un artefacto de ajuste fino orientado a "entrenamiento de carácter" (*character training*): su objetivo es dotar al modelo de un rasgo de personalidad concreto, el humor sin sarcasmo, definido explícitamente mediante diez rasgos de generación (por ejemplo, señalar absurdos sin ridiculizar, explicar contradicciones con sinceridad o elogiar de forma sincera evitando el elogio con segundas intenciones).

El adaptador combina dos actualizaciones sobre el mismo modelo base mediante concatenación exacta de LoRA (`exact_lora_concatenation`): una actualización de DPO previa, entrenada con una "constitución" de humor, y una actualización posterior de SFT de introspección con 12.000 ejemplos, ambas con peso 1.0 y exportadas con rango 128. El repositorio ocupa 5,2 GB y contiene los pesos en formato safetensors junto con los artefactos de composición.

Su relevancia es fundamentalmente metodológica y experimental: ilustra una técnica de composición de adaptadores (DPO + SFT) para condicionar rasgos de personalidad sin reentrenar el modelo base. El propio autor advierte de que no se adjuntan resultados de evaluación y que el éxito de la exportación no demuestra retención del humor ni reducción del sarcasmo, por lo que debe considerarse un artefacto de investigación y no un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2 (modelo base `Qwen/Qwen2.5-7B-Instruct`) |
| Parametros totales | 7,61 B en el modelo base (dato público del modelo base); el adaptador añade pesos de rango 128 cuyo recuento exacto no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos del modelo base (hasta 131.072 con escalado RoPE YaRN, dato público del base); el adaptador se entrenó con `max_len` = 3072 |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados del adaptador; son aplicables las cuantizaciones del modelo base (bitsandbytes 8/4 bits, GPTQ, AWQ, GGUF) aplicando el adaptador en precisión completa sobre la base o fusionándolo antes de convertir |
| Idiomas soportados | No disponibles en la ficha del adaptador (el modelo base declara soporte multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Rango LoRA de exportación | 128 (rango de entrenamiento SFT: 64; `lora_alpha`: 128) |
| Método de composición | `exact_lora_concatenation`, pesos DPO 1.0 y SFT 1.0 |
| Ruta interna del adaptador | `introspection-final/` |
| Tamaño del repositorio | 5,2 GB |
| Pipeline declarado | text-generation |
| Fecha de publicación en el Hub | 19 de septiembre de 2026 (según metadatos del Hub) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer decoder-only de la familia Qwen2 con normalización RMSNorm, activación SwiGLU y atención con *grouped-query attention*. La innovación no está en la arquitectura, sino en el procedimiento de entrenamiento en dos fases. Primero se aplica una fase de DPO partiendo de una "constitución" de humor; después, una fase de SFT de introspección con 12.000 ejemplos bajo la condición `anti-sarcasm`, en la que se eliminan los *system prompts* de reflexión y se sustituyen los de interacción por un *prompt* genérico. Los hiperparámetros registrados son: 1 época, `learning_rate` 5e-5, `train_batch_size` 32, `micro_train_batch_size` 1, `max_len` 3072, semilla 123456, `lora_rank` 64, `lora_alpha` 128 y `zero_stage` 2.

La composición de los dos adaptadores se realiza mediante concatenación exacta de LoRA, exportada con rango 128, con pesos 1.0 para DPO y 1.0 para SFT. El *checkpoint* incluye un fichero `composition.json` con los *hashes* de origen y el escalado, y la ficha proporciona los SHA-256 del conjunto de datos compilado y de los pesos DPO y SFT de origen. La revisión del modelo base no está fijada en la exportación, por lo que el autor recomienda usar la misma revisión empleada en el entrenamiento; además, indica explícitamente que no debe cargarse por separado el adaptador DPO ni usarse una base ya fusionada con DPO.

El condicionamiento de comportamiento se especifica como una lista de diez rasgos de generación, entre ellos: señalar absurdos directamente sin burla sarcástica, explicar contradicciones con sinceridad en lugar de ironizar, responder con paciencia a preguntas obvias, corregir errores sin condescendencia y alternar elogios sinceros con críticas directas.

## Capacidades

- Generación de texto conversacional en inglés y en otros idiomas del modelo base (el comportamiento multilingüe del adaptador no ha sido verificado).
- Modulación del tono hacia el humor no sarcástico y la corrección sincera, según los diez rasgos declarados por el autor.
- Razonamiento, matemáticas, código y conocimiento general heredados de `Qwen2.5-7B-Instruct`, sin evaluación posterior al ajuste.
- Soporte de *tool calling* / *function calling*: heredado del modelo base, no verificado tras la aplicación del adaptador.
- Soporte de agentes y razonamiento multi-paso: heredado del modelo base, no verificado tras el ajuste.
- Modo de "pensamiento" o *system prompts* de reflexión: el autor indica que en el *pipeline* de entrenamiento estos *prompts* se eliminan o se sustituyen, y que no se requiere ninguna instrucción de generación adicional al cargar el adaptador exportado.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Atención al cliente automatizada en sectores sensibles: el adaptador está diseñado para responder a quejas exageradas o preguntas obvias con paciencia y sin ironía, lo que reduce el riesgo de respuestas percibidas como burlonas en correo o chat de soporte.
- Reescritura y normalización de tono corporativo: dado un borrador con sarcasmo o condescendencia, el modelo puede reformularlo en un registro sincero y directo, integrándose en un pipeline de revisión de contenidos.
- Tutoría educativa: corrección de errores conceptuales y de razonamiento sin condescendencia, útil en asistentes de estudio para públicos jóvenes o entornos de formación interna.
- Investigación sobre alineación de carácter y personalidad: el artefacto permite estudiar hasta qué punto la composición DPO + SFT preserva un rasgo de personalidad definido y cómo afecta a las capacidades generales, comparándolo con la base sin adaptar.
- Prototipado de personajes conversacionales en videojuegos o experiencias interactivas: el adaptador permite dotar a un PNJ de un tono afable y no sarcástico sin reentrenar el modelo base, cargando y descargando adaptadores según el personaje con `PeftModel`.
- Generación de contenido humorístico editorial controlado: producción de textos con intención humorística que eviten la burla y el ridículo, con revisión humana posterior, en blogs, guiones breves o *newsletters*.
- Evaluación A/B de rasgos de personalidad: en experimentos de anotación o pruebas con usuarios, permite comparar la base y la variante condicionada manteniendo constantes el resto de factores del sistema.
- Moderación y mediación de discusiones en línea: reformulación de mensajes con exceso de confianza o descalificaciones en un tono de escepticismo respetuoso, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia ficha del modelo indica: "No evaluation results are attached by this training/export command. A successful export does not establish humor retention, sarcasm reduction, or general capability". No se dispone, por tanto, de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de sarcasmo o humor para este adaptador.

## Requisitos de hardware

- Almacenamiento: el repositorio del adaptador ocupa 5,2 GB en disco, además del modelo base.
- Inferencia en bf16/fp16: los 7,61 B parámetros del modelo base ocupan aproximadamente 15,2 GB, a lo que se suma la caché KV y las activaciones. Se recomienda un mínimo de 24 GB de VRAM (RTX 4090, L40S, A100 40 GB, H100).
- Inferencia en 8 bits: aproximadamente 8 GB de pesos, viable en GPU de 16-24 GB (RTX 4080, RTX 3090, RTX 4090) con contextos moderados.
- Inferencia en 4 bits: aproximadamente 4,5-5 GB de pesos, viable en GPU de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con contexto reducido. Estas cifras son estimaciones derivadas del tamaño del modelo base, no mediciones publicadas para este adaptador.
- La atención con *grouped-query attention* del modelo base reduce el consumo de caché KV respecto a una atención multi-cabeza completa, aunque no se dispone de cifras concretas para este adaptador.
- Despliegue con Transformers + PEFT: es la vía documentada por el autor, cargando el adaptador sobre `Qwen/Qwen2.5-7B-Instruct` en bf16 y con `device_map="auto"`.
- Despliegue con vLLM: soportado configurando la capacidad LoRA para admitir el rango de exportación 128. Esta es la única indicación de despliegue alternativo que ofrece la ficha.
- llama.cpp / Ollama / TGI: no documentados por el autor. Para usarlos sería necesario fusionar previamente el adaptador en el modelo base y convertir los pesos a GGUF, procedimiento no descrito ni validado en la información disponible.
- Restricción de carga: el autor advierte de no cargar adicionalmente el adaptador DPO ni de usar una base ya fusionada con DPO.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de esta tabla sobre los modelos de referencia provienen de la documentación pública de cada modelo y no han sido verificados experimentalmente en esta ficha. No existe comparación de rendimiento publicada para el adaptador.

| Modelo | Parámetros | Contexto | Licencia | Tipo y disponibilidad |
|---|---|---|---|---|
| `invi-bhagyesh/qwen-2.5-7b-it-humor_anti_sarcasm` | 7,61 B (base) + adaptador LoRA rango 128 | 32.768 tokens (adaptador entrenado a 3072) | No disponible | Adaptador LoRA PEFT en safetensors; 0 descargas, sin evaluación |
| `Qwen/Qwen2.5-7B-Instruct` | 7,61 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Modelo completo; comportamiento genérico sin el rasgo de personalidad |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Modelo completo de propósito general; requiere aceptar la licencia |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25 B | 32.768 tokens | Apache 2.0 | Modelo completo de propósito general con soporte de *function calling* |

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara explícitamente que no hay resultados adjuntos y que la exportación correcta no demuestra retención del humor, reducción del sarcasmo ni preservación de capacidades generales.
- Riesgo de degradación de capacidades: al ser un ajuste de carácter sobre 12.000 ejemplos y 1 época, puede producirse un deterioro del rendimiento general, de la utilidad, del seguimiento de instrucciones o del comportamiento multilingüe. No hay datos al respecto.
- Riesgo de alucinación: inherente al modelo base y no cuantificado para este adaptador.
- Reproducibilidad: la revisión del modelo base no está fijada en la exportación, por lo que los resultados pueden variar según la revisión utilizada.
- Longitud de contexto efectiva: el adaptador se entrenó con `max_len` 3072; su comportamiento con contextos mucho más largos (hasta los 32.768 tokens del base) no ha sido validado.
- Licencia: no disponible. La licencia del modelo base (Apache 2.0 para Qwen2.5-7B-Instruct según su documentación pública) no determina necesariamente la del adaptador, por lo que el uso comercial queda en una zona jurídica indeterminada y requiere verificación previa.
- Sesgos: los diez rasgos de comportamiento definen una norma de comunicación concreta (sinceridad, ausencia de ironía) que puede no encajar en contextos culturales donde el sarcasmo es un recurso neutro; no se ha medido el efecto sobre sesgos sociales del modelo base.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros.
- Naturaleza experimental: el autor lo describe como un artefacto experimental de entrenamiento de carácter, no apto para producción sin evaluación previa en escenarios retenidos de humor y sarcasmo.
- Advertencia de carga: no debe cargarse junto al adaptador DPO original ni sobre una base ya fusionada con DPO.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/invi-bhagyesh/qwen-2.5-7b-it-humor_anti_sarcasm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Fichero de composición del adaptador: `composition.json` dentro de la carpeta del *checkpoint* (referenciado en la model card)
- Librería PEFT: https://github.com/huggingface/peft
- Búsqueda web realizada: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios sin relación (un portal de juegos en línea y el portal de información técnica del grupo Volkswagen), por lo que no se incluyen.
