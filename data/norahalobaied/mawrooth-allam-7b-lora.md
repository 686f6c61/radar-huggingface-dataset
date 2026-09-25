# NorahAlobaied/Mawrooth-ALLaM-7B-LoRA

## Resumen

Mawrooth (مَوروث) es un adaptador LoRA de tipo PEFT desarrollado por NorahAlobaied que se monta sobre el modelo base humain-ai/ALLaM-7B-Instruct-preview, un transformer decoder-only de aproximadamente 7.000 millones de parámetros entrenado por Humain/SDAIA para árabe. Su propósito es muy concreto: explicar versos de poesía nabatí saudí (الشعر النبطي) de forma estructurada, devolviendo siempre cinco secciones fijas —glosario de vocabulario difícil, análisis verso a verso, contexto cultural, explicación global y una descripción visual en inglés—. El adaptador pesa del orden de 65 MB según la ficha de FriendliAI, frente a los 0,1 GB que ocupa el repositorio completo en Hugging Face.

El problema que resuelve es la falta de herramientas especializadas en un género poético dialectal poco cubierto por los LLM generalistas: el nabatí emplea léxico beduino, referencias tribales y geográficas implícitas que los modelos árabes estándar tienden a malinterpretar o a inventar. Para mitigarlo, el autor combina el ajuste LoRA con un diccionario externo (mawrooth_dictionary.json) cuyos términos se inyectan en el prompt antes de la generación, más un system prompt con reglas explícitas contra la fabricación de topónimos, tribus o acontecimientos.

Es relevante ahora por dos motivos: demuestra un patrón de especialización vertical barato (un LoRA de decenas de megabytes sobre un modelo abierto ya existente) aplicado a patrimonio cultural, y publica un stack de uso completo (código de inferencia con cuantización 4 bits, interfaz Gradio y utilidades de recuperación léxica) bajo licencia apache-2.0, aunque con muy poca tracción todavía (73 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base humain-ai/ALLaM-7B-Instruct-preview |
| Parámetros totales | ~7.000 millones en el modelo base; adaptador LoRA de ~65 MB según FriendliAI; repositorio completo de 0,1 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el código de ejemplo de la model card trunca a max_length=2048) |
| Tipos de cuantización | 4 bits NF4 con doble cuantización (bitsandbytes) documentada en la model card; adaptador distribuido en safetensors |
| Idiomas soportados | Árabe (ar); salida parcial en inglés en la sección [الوصف] |
| Licencia | apache-2.0 (el adaptador; la del modelo base no se detalla en la información disponible) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); incluye mawrooth_dictionary.json y ficheros .py de la interfaz Gradio |
| Librería | peft (transformers >= 4.46, peft >= 0.13, bitsandbytes >= 0.44, accelerate >= 1.0) |
| Pipeline | text-generation |
| Dataset de ajuste | NorahAlobaied/Mawrooth-Nabati-Dataset |
| Fecha de creación / actualización | 22 de septiembre de 2026 / 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptadores de bajo rango (LoRA) sobre ALLaM-7B-Instruct-preview, un transformer decoder-only de ~7B parámetros orientado a árabe. La model card no especifica el rango (r), el valor de lora_alpha, el dropout, la tasa de aprendizaje ni el número de tokens de entrenamiento; tampoco indica si hubo una fase de RLHF o DPO adicional sobre el adaptador. Lo que sí se documenta es el dataset de ajuste, NorahAlobaied/Mawrooth-Nabati-Dataset, centrado en poesía nabatí y cultura saudí.

La innovación técnica destacable no está en la arquitectura, sino en el pipeline de inferencia que acompaña al adaptador. Antes de generar, un script extrae del diccionario los términos nabatíes presentes en el verso (coincidencia de palabra completa mediante expresiones regulares sobre el rango Unicode árabe, con filtrado de stopwords y de términos de menos de 3 caracteres), los inyecta en el prompt como "[القاموس المرجعي]" y fuerza una plantilla de salida de cinco bloques. El system prompt impone reglas antiinvención (no citar pozos, lugares, tribus o sucesos que no aparezcan en el verso o en el diccionario), exige árabe faraónico estándar salvo en la descripción visual inglesa, y pide marcar "(غير مؤكد)" cuando haya incertidumbre. El autor también publica un modelo fusionado independiente, Mawrooth-ALLaM-7B, referenciado por FriendliAI, junto a la variante de adaptador.

## Capacidades

- Explicación de versos nabatíes con salida estructurada en cinco secciones obligatorias: [المفردات] (vocabulario), [تحليل البيت] (análisis paso a paso), [السياق الثقافي] (contexto cultural), [الشرح] (paráfrasis del significado) y [الوصف] (descripción visual en inglés).
- Recuperación léxica asistida por diccionario externo: el script de inferencia consulta mawrooth_dictionary.json y añade hasta 20 términos relevantes al prompt.
- Generación de texto conversacional en árabe mediante plantilla de chat (tokenizer.apply_chat_template) con rol de sistema y de usuario.
- Redacción de descripciones visuales en inglés a partir del contenido del verso, pensadas para alimentar generadores de imagen.
- Decodificación controlada: la model card recomienda temperature 0.3, top_p 0.9 y repetition_penalty 1.15 para reducir divagación.
- Interfaz Gradio lista para usar (mawrooth_app.py, mawrooth_utils.py, mawrooth_styles.py, mawrooth_logo.png) que presenta la explicación como tarjetas y genera una imagen a partir de la descripción visual.
- Tool calling o function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso autónomo: no documentadas.
- Visión, audio o modo thinking explícito: no disponibles.
- Capacidades multilingües: limitadas al árabe, con salida puntual en inglés.

## Casos de uso

- Divulgación cultural en medios y redes sociales: dado un verso nabatí citado en un programa o publicación, el adaptador devuelve en una sola pasada el glosario, el análisis y el contexto, lo que reduce el trabajo de documentación previa del redactor.
- Herramientas educativas para literatura árabe: un profesor puede introducir un verso y obtener una descomposición por secciones que sirva de material de aula, con la salvedad de que el propio prompt obliga a marcar la información dudosa.
- Museos, festivales y exposiciones sobre patrimonio saudí: las tarjetas generadas por la interfaz Gradio pueden emplearse como cartelas explicativas bilingües (explicación en árabe y descripción visual en inglés) para visitantes internacionales.
- Generación de ilustraciones para contenido editorial: la sección [الوصف] produce una descripción visual en inglés que se puede encadenar a un modelo texto-imagen para ilustrar antologías poéticas o publicaciones digitales.
- Investigación en patrimonio oral y dialectología: el par adaptador + diccionario permite etiquetar léxico nabatí en corpus recopilados, siempre que se revise manualmente la coincidencia de términos y se amplíe el diccionario con variantes dialectales.
- Creación de asistentes especializados de bajo coste: al ser un adaptador de ~65 MB sobre un base de 7B, se puede desplegar con vLLM (que soporta múltiples adaptadores LoRA sobre un mismo base) y servir distintas variantes especializadas sin duplicar el coste de VRAM del modelo completo.
- Localización de contenido cultural para audiencias no arabófonas: la combinación de explicación en árabe y descripción en inglés facilita fichas bilingües para catálogos, subtitulado o notas de prensa.
- Prototipado rápido de interfaces de análisis poético: los ficheros Gradio incluidos permiten levantar una demo funcional en pocos minutos sobre una única GPU, útil para validar producto antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (BLEU, chrF, exactitud humana, MMLU, HumanEval ni evaluaciones específicas de árabe), y las búsquedas web solo devuelven páginas de modelo y endpoints de inferencia de FriendliAI, sin cifras de evaluación.

## Requisitos de hardware

- VRAM estimada en 4 bits (NF4 con doble cuantización, configuración documentada por el autor): en torno a 5-6 GB para el base de 7B, más el adaptador; con overhead de contexto y caché KV conviene reservar 8-10 GB.
- VRAM estimada en fp16/bf16: aproximadamente 14-16 GB solo para los pesos del base, más caché KV.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, A10G, L4 o RTX 4090/3090 (24 GB) para fp16; para 4 bits basta una RTX 3060 de 12 GB, RTX 4070 o similar.
- ¿Cabe en GPU de consumo? Sí. En 4 bits cabe con holgura en tarjetas de 8-12 GB; en fp16 requiere una tarjeta de 24 GB o repartir entre varias.
- Opciones de despliegue: transformers + peft + bitsandbytes (procedimiento documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y conversión a GGUF para llama.cpp u Ollama si se fusiona el adaptador con el base.
- Latencia y throughput: no disponibles. La model card solo fija un límite de 500 tokens nuevos por explicación y truncado del prompt a 2.048 tokens, lo que sirve como referencia de coste por petición pero no como medida de rendimiento.
- Nota de seguridad: el código de ejemplo usa trust_remote_code=True y descarga ficheros .py ejecutables desde el repositorio (mawrooth_app.py y utilidades); conviene auditar esos ficheros antes de ejecutarlos en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mawrooth-ALLaM-7B-LoRA (adaptador) | ~7B en el base; adaptador de ~65 MB | No disponible | Poesía nabatí saudí, salida en 5 secciones | apache-2.0 | Hugging Face, endpoint de FriendliAI |
| Mawrooth-ALLaM-7B (versión fusionada del mismo autor) | ~7B | No disponible | Igual que el adaptador, con pesos fusionados | No disponible en la información consultada | Hugging Face, endpoint de FriendliAI |
| humain-ai/ALLaM-7B-Instruct-preview (modelo base) | ~7B | No disponible | Instrucciones generales en árabe | No detallada en la información disponible | Hugging Face |
| Otros LLM árabes de ~7B (Jais, Fanar, AceGPT, SILMA y similares) | No disponible en la información consultada | No disponible | Propósito general en árabe | Varía según modelo | Hugging Face |

La comparación cuantitativa no es posible con los datos disponibles: no hay cifras de benchmarks publicadas para el adaptador ni comparativas directas frente a otros modelos árabes de tamaño similar. La diferencia funcional frente al base es la especialización en nabatí y el formato de salida forzado; frente a otros LLM árabes generalistas, la ventaja declarada es la combinación de diccionario externo y reglas antiinvención, no un mayor tamaño o contexto.

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo árabe. No hay soporte declarado para castellano ni para otras lenguas, salvo la descripción visual en inglés.
- Riesgo de alucinación en el dominio cultural: el propio system prompt prohíbe inventar lugares, tribus o sucesos, lo que indica que es un fallo observado y no descartado; el modelo puede seguir generando contexto cultural plausible pero falso.
- Dependencia del diccionario: la extracción de términos usa coincidencia de palabra completa y heurísticas simples (filtrado de stopwords, longitud mínima de 3, eliminación del artículo "ال"), por lo que puede omitir variantes dialectales, formas con prefijos o términos con diacríticos y dejar el glosario incompleto.
- Sesgo de dominio: el ajuste se limita a poesía nabatí saudí y a un único dataset; su comportamiento fuera de ese registro (árabe moderno estándar técnico, prosa, código) probablemente degrade respecto al modelo base.
- Licencia: el adaptador se publica como apache-2.0, pero la licencia del modelo base ALLaM-7B-Instruct-preview no se detalla en la información disponible; antes de un uso comercial hay que verificar los términos de Humain/SDAIA, que pueden imponer condiciones adicionales.
- Tracción y validación escasas: 73 descargas y 0 likes en el momento de la consulta, sin evaluación independiente publicada ni benchmarks, por lo que no hay evidencia externa de calidad.
- Límites prácticos de contexto: el código de ejemplo trunca a 2.048 tokens, lo que restringe el número de términos de diccionario inyectables y la longitud de la explicación.
- Riesgo de ejecución de código: la model card indica trust_remote_code=True y el repositorio contiene módulos .py que se descargan y ejecutan; hay que auditar su contenido.
- Reproducibilidad incompleta: no se documentan hiperparámetros de entrenamiento (rango LoRA, alpha, épocas, tokens), lo que dificulta replicar o ajustar el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorahAlobaied/Mawrooth-ALLaM-7B-LoRA
- Perfil del autor en Hugging Face: https://huggingface.co/NorahAlobaied
- Dataset de ajuste: https://huggingface.co/datasets/NorahAlobaied/Mawrooth-Nabati-Dataset
- Modelo base: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Endpoint de inferencia del adaptador en FriendliAI: https://friendli.ai/models/NorahAlobaied/Mawrooth-ALLaM-7B-LoRA
- Endpoint de inferencia de la versión fusionada en FriendliAI: https://friendli.ai/models/NorahAlobaied/Mawrooth-ALLaM-7B
- Perfil del autor en GitHub: https://github.com/norahalobaied
