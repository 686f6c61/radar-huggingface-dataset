# laabidate/shaylah-darija-4b-merged

## Resumen

Shaylah (شايلاه) es un modelo de generación de texto en dariya (árabe marroquí) desarrollado por el usuario laabidate y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning QLoRA sobre un modelo base de la familia Qwen 3.5 (arquitectura `qwen3_5_text`) de unos 4.200 millones de parámetros, entrenado con 1.823 pares de pregunta/respuesta en dariya. El proyecto tiene una vocación claramente artística y antropológica: Shaylah encarna la voz de un "faqir" (guardián de un santuario marroquí) dentro de una instalación interactiva donde el visitante habla en dariya y el modelo responde con respuestas breves y cálidas sobre cultura popular marroquí.

El modelo resuelve un problema real y poco cubierto: la escasez de modelos conversacionales funcionales en dariya, una variedad del árabe con poca representación en los LLM comerciales. Para lograrlo, el autor combinó archivos de conocimiento propio sobre santuarios, música espiritual (gnaoua, jilala, aissawa), patrimonio marroquí y la propia dariya, con una muestra pública de 721 pares del dataset SILMA de dariya marroquí.

No es un modelo de propósito general: sus respuestas están deliberadamente limitadas a un estilo corto (media de 170 caracteres) y a temáticas de folclore marroquí, con reglas de seguridad integradas en los datos de entrenamiento (las creencias se describen como tales, nunca como hechos ni instrucciones). Es relevante como ejemplo documentado de fine-tuning eficiente y accesible: el entrenamiento se realizó en hardware de consumo (GTX 1660 Ti) y el modelo se distribuye tanto fusionado en safetensors como en GGUF cuantizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen 3.5, clase `qwen3_5_text`), fine-tuning QLoRA fusionado |
| Parametros totales | 4.205.751.296 (~4,2B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible (el entrenamiento usó max_length=512) |
| Tipos de cuantizacion | Q4_K_M (GGUF, 2,52 GB); entrenamiento con bitsandbytes 4-bit NF4; pesos fusionados en precisión original |
| Idiomas soportados | Dariya (árabe marroquí); el modelo base Qwen 3.5 probablemente soporta más idiomas, pero el fine-tuning está especializado en dariya |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado, 7,85 GiB / 8.411.557.976 bytes) y GGUF Q4_K_M (2,52 GB, conversión local) |

## Arquitectura y entrenamiento

El modelo parte de un base de la clase `qwen3_5_text` de unos 4B de parámetros, al que se aplicó un fine-tuning con QLoRA (r=16, alpha=32, dropout=0,05, `target_modules="all-linear"`), es decir, cuantización 4-bit NF4 con dtype de cómputo float16, sin AMP (bf16=False, fp16=False). El entrenamiento usó batch=2 con acumulación de gradiente 4 (batch efectivo de 8), learning rate 2e-4, 3 épocas y 684 pasos, con una longitud máxima de secuencia de 512 tokens. El resultado del entrenamiento fue un adapter de solo 65 MB, que posteriormente se fusionó en el modelo base para obtener un modelo completo independiente de 7,85 GB en un único archivo, sin capas adicionales.

Los datos de entrenamiento constan de 1.823 pares instrucción/respuesta en dariya con formato `<|im_start|>user … <|im_end|>` / `<|im_start|>assistant … <|im_end|>`. La composición evolucionó en cinco versiones: un núcleo inicial de 218 pares (v1), 477 pares nuevos de conocimiento popular (v2), 721 pares de la muestra SILMA de dariya general (v3), 297 pares de veinte nuevos archivos de conocimiento documentado (v4) y la versión final v5 con 1.823 pares. Las temáticas cubren santuarios y rituales de visita, música espiritual (gnaoua y lila, jilala, aissawa y hamadcha, aita), patrimonio marroquí (zellige, tiendas/caïtoun, ciudades antiguas, historia, astrología popular) y la propia dariya (antigua y moderna, incluida su mezcla con francés y arábizi). Destaca la inclusión de 306 pares con frases de seguridad obligatorias: en preguntas de salud el modelo añade la frase "hada chi m3taqad chaabi, machi badil lit-tbib" (esto es una creencia popular, no sustituye al médico). No se menciona RLHF ni DPO.

Como innovación destacable, el pipeline está optimizado para hardware de consumo: el entrenamiento y las pruebas locales se hicieron en una GTX 1660 Ti, con carga 4-bit en 10,61 segundos usando 2.975 MiB de VRAM y generación de 6,5–8,1 tokens/segundo; la versión GGUF carga en unos 2,4 segundos.

## Capacidades

- Conversación en dariya marroquí con voz de "faqir" (guardián de santuario), respuestas breves y cálidas deliberadamente limitadas a ~170 caracteres de media.
- Conocimiento especializado en cultura popular marroquí: santuarios (marabouts) y rituales de visita, música espiritual (gnaoua y su lila, jilala, aissawa, hamadcha, aita), patrimonio (zellige, artesanía, ciudades antiguas, historia, astrología popular).
- Manejo de dariya antigua y moderna, incluida la code-switching habitual con francés y arábizi.
- Cobertura de temas generales de dariya gracias a los 721 pares del dataset SILMA, para no quedar confinado solo a temas de santuarios.
- Gestión de seguridad integrada: describe creencias como creencias ("se cree que..."), no da instrucciones de magia, ni fatwas, ni diagnósticos, ni consejos para suspender medicación; añade avisos obligatorios en preguntas de salud.
- Diseñado para integrarse en pipelines de voz: STT (voz a texto) → modelo → TTS (texto a voz), como en la instalación artística original.
- No hay evidencia de capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio: el modelo es de texto a texto y está especializado en conversación corta.

## Casos de uso

- Instalaciones artísticas interactivas: el caso de uso original; un teléfono dentro de una maqueta de santuario conecta micrófono, altavoz y navegador a un servidor con STT, el modelo y TTS, permitiendo que el visitante converse en dariya con el "faqir".
- Chatbots culturales y turísticos en dariya: un guía conversacional que explique rituales de visita a santuarios, música gnaoua o tradiciones como el zellige a visitantes marroquíes que prefieran dariya al árabe estándar.
- Preservación y divulgación del patrimonio inmaterial: integración en museos, archivos digitales o proyectos educativos que documenten tradiciones orales marroquíes de forma accesible en la lengua local.
- Asistente conversacional ligero en dispositivos modestos: gracias a la versión GGUF Q4_K_M de 2,52 GB, puede ejecutarse en portátiles sin GPU dedicada para demos o kioscos interactivos.
- Prototipado de asistentes en lenguas de bajos recursos: el pipeline documentado (QLoRA en GPU de consumo, adapter de 65 MB, fusión posterior) sirve como receta replicable para otros dialectos o lenguas minorizadas.
- Base para la serie proyectada de siete santuarios (Bouya Omar, Sidi Ali Ben Hamdouch, Sidi Ben Aissa, Moulay Brahim, Sidi Chamharouch, Lalla Aicha Bahriya, Sidi Ahmed Tijani), reutilizando el mismo método con personalidades y temáticas distintas.
- Investigación sobre seguridad en lenguas de bajos recursos: los 306 pares con frases de seguridad y el enfoque "describir creencias, no prescribirlas" son un ejemplo de alineación mediante datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son mediciones locales del autor en una GTX 1660 Ti:

| Métrica | Valor |
|---|---|
| Carga 4-bit (bnb, GTX 1660 Ti) | 10,61 s |
| VRAM en inferencia 4-bit | 2.975 MiB |
| Velocidad de generación 4-bit | 6,5–8,1 tokens/s |
| Carga GGUF Q4_K_M | ~2,4 s |
| Tamaño modelo fusionado | 7,85 GiB |
| Tamaño GGUF Q4_K_M | 2,52 GB |
| Adapter QLoRA original | 65 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3 GB en cuantización 4-bit (bitsandbytes NF4, medido: 2.975 MiB); unos 2,52 GB con GGUF Q4_K_M; el modelo fusionado completo en safetensors ocupa 7,85 GiB en disco (la VRAM necesaria en precisión completa no está documentada, pero un modelo de 4,2B cabe holgadamente en 8–12 GB).
- GPU recomendadas: no requiere GPU dedicada para la variante GGUF; para la variante transformers 4-bit, el autor usó una GTX 1660 Ti (6 GB). GPUs de consumo como RTX 3060 o superiores son más que suficientes; no se necesitan A100 ni H100.
- Cabe en GPUs de consumo: sí, incluso en GPUs antiguas sin tensor cores modernos, y presumiblemente en CPU con la versión GGUF vía llama.cpp (no documentado explícitamente).
- Opciones de despliegue: transformers (librería declarada, con plantilla de chat ChatML `<|im_start|>`), y la conversión GGUF Q4_K_M sugiere compatibilidad con llama.cpp, Ollama o LM Studio (esta última no confirmada por el autor). El despliegue original se hace en un servidor local con navegador para la instalación artística.
- Latencia y throughput estimados: 6,5–8,1 tokens/segundo en GTX 1660 Ti a 4-bit; carga del modelo GGUF en ~2,4 segundos. No hay datos de latencia en otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Especialización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shaylah (laabidate/shaylah-darija-4b-merged) | 4,2B | Dariya marroquí, folclore, conversación corta | no disponible (entrenado a 512) | Apache 2.0 | safetensors + GGUF Q4_K_M |
| SILMA (base de la muestra de dariya usada) | no disponible | Árabe y dariya marroquí, propósito general | no disponible | no disponible | disponible en Hugging Face |
| Qwen 3.5 base (~4B, clase `qwen3_5_text`) | ~4B | Multilingüe, propósito general (sin especialización en dariya) | no disponible para esta variante | según versión de Qwen | disponible en Hugging Face |

La comparación es limitada porque Shaylah no compite en benchmarks generales: su valor diferencial frente al base Qwen 3.5 es el estilo conversacional en dariya y el conocimiento folclórico curado, no la capacidad bruta. Frente a SILMA, Shaylah ofrece un persona y un dominio temático muy concretos con respuestas cortas controladas, a costa de versatilidad general.

## Limitaciones y advertencias

- Dominio muy estrecho: el modelo está entrenado con solo 1.823 pares y el propio autor documenta que la cobertura por tema es desigual (salud, lila gnaoua, gnaoua y santuario son los más fuertes; otros temas tienen muy pocos pares), lo que explica una calidad de respuesta muy variable según el tema.
- Riesgo alto de alucinación fuera de su dominio: con tan pocos datos de entrenamiento, preguntas generales o complejas probablemente produzcan respuestas pobres, repetitivas o inventadas.
- Longitud de contexto limitada: el entrenamiento usó max_length=512, por lo que conversaciones largas o documentos extensos no están soportados de forma fiable; la longitud de contexto real del modelo fusionado no está documentada.
- Restricciones de seguridad por diseño: el modelo no da consejos médicos, religiosos ni de ningún tipo que impliquen instrucciones; en salud añade siempre el aviso de que se trata de una creencia popular. Esto es intencional y lo hace inadecuado como asistente de utilidad general.
- Sesgos: el material refleja creencias y tradiciones populares marroquíes tal como las practica la gente ("se cree que..."), tratadas como material antropológico; usuarios que busquen información religiosa autorizada o validada deben abstenerse.
- Idioma: especializado en dariya; el rendimiento en árabe estándar u otros idiomas no está evaluado y probablemente sea inferior al del modelo base.
- Proyecto artístico, no producto: el autor lo define explícitamente como obra interactiva, no como producto comercial, autoridad religiosa ni médica; no debe desplegarse en producción como asistente de información sin revisión.
- Estadísticas de adopción muy bajas (264 descargas, 0 likes en el momento de la ficha), sin comunidad de soporte ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laabidate/shaylah-darija-4b-merged
- No se han proporcionado enlaces adicionales (paper, blog, repositorio de código o demo) en la información disponible.
