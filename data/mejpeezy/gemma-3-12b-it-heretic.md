# mejpeezy/gemma-3-12b-it-heretic

## Resumen

`mejpeezy/gemma-3-12b-it-heretic` es una variante «decensurada» (*abliterated*) del modelo multimodal `google/gemma-3-12b-it` de Google DeepMind, publicada por el usuario mejpeezy. Se ha generado aplicando la herramienta Heretic v1.0.0 sobre los pesos del modelo instructivo, con el objetivo de eliminar la dirección de rechazo aprendida durante el ajuste de alineación. El resultado declarado por el autor es una reducción drástica de las negativas: de 97 rechazos sobre 100 peticiones en el modelo original a 3 sobre 100 en esta versión, con una divergencia KL de 0,16 respecto al original.

El modelo conserva la arquitectura y las capacidades de Gemma 3 12B: es un transformer multimodal que acepta texto e imágenes (normalizadas a 896 x 896 y codificadas en 256 tokens por imagen) y genera texto, con una ventana de contexto de 128K tokens de entrada y 8.192 tokens de salida. Cuenta con 12.187.325.040 parámetros (unos 12,19B) en formato denso, pesos safetensors de aproximadamente 24,4 GB en el repositorio, y licencia Gemma con acceso restringido.

Su relevancia es doble. Por un lado, es un ejemplo práctico de *abliteration* reproducible sobre un modelo multimodal moderno, útil para investigación en alineación, interpretabilidad y evaluación de seguridad. Por otro lado, permite estudiar el comportamiento de un modelo sin capas de rechazo en tareas de generación libre, lo que exige una evaluación cuidadosa de riesgos y de conformidad con la política de uso de Gemma antes de cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (imagen-texto a texto); no se especifican detalles internos en la información disponible |
| Parámetros totales | 12.187.325.040 (≈12,19B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens de entrada; 8.192 tokens de salida |
| Tipos de cuantización | No publicados por el autor (repositorio solo con safetensors). Compatible con cuantización en 8 y 4 bits vía bitsandbytes; no hay GGUF, GPTQ ni AWQ oficiales |
| Idiomas soportados | Más de 140 idiomas según la model card de Gemma 3; el campo de idiomas del repositorio indica «no disponibles» |
| Licencia | Gemma (Google), acceso con *gating*: requiere aceptar los términos de uso |
| Formato de pesos | safetensors (tamaño del repositorio: 24,4 GB) |
| Modelo base | google/gemma-3-12b-pt (preentrenado); derivado de google/gemma-3-12b-it (instructivo) |
| Pipeline | image-text-to-text |
| Librería | transformers (soporte desde 4.50.0) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer multimodal de Google DeepMind construido con la misma tecnología que los modelos Gemini. La entrada admite cadenas de texto e imágenes; cada imagen se normaliza a 896 x 896 píxeles y se codifica en 256 tokens, dentro de un contexto total de 128K tokens. La salida es texto generado, con un límite de 8.192 tokens. Gemma 3 está pensado para despliegues en entornos con recursos limitados (portátiles, estaciones de trabajo o infraestructura propia), y la variante de 12B es la intermedia de la familia junto a las de 1B, 4B y 27B.

La modificación aplicada no es un *fine-tuning* adicional, sino una abliteración: se identifican direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y se proyectan fuera de los pesos correspondientes. Según la model card, se usó Heretic v1.0.0 con `direction_index` por capa y pesos aplicados a dos módulos: `attn.o_proj` (máximo 1,48 en la posición 34,12; mínimo 0,94 a distancia 19,48) y `mlp.down_proj` (máximo 0,81 en la posición 35,83; mínimo 0,52 a distancia 1,66). El autor reporta una divergencia KL de 0,16 frente al modelo original, lo que indica una desviación medible pero acotada de la distribución de salida. No se dispone de información sobre el dataset de calibración, el número de tokens de entrenamiento original, la composición del corpus ni las etapas de RLHF o DPO de Gemma 3 en la información proporcionada.

## Capacidades

- Generación de texto conversacional en múltiples turnos, con ventana de 128K tokens de entrada.
- Comprensión de imágenes: descripción, respuesta a preguntas sobre el contenido visual y análisis de documentos con elementos gráficos.
- Razonamiento sobre texto e imágenes combinados (por ejemplo, explicar un diagrama o interpretar una captura de pantalla).
- Generación de texto en más de 140 idiomas, con calidad desigual según el idioma (la model card no aporta desglose por lengua).
- Conversación instructiva, resumen y respuesta a preguntas, heredadas del ajuste de `gemma-3-12b-it`.
- Comportamiento sin rechazos: responde a peticiones que el modelo original declinaba (3/100 rechazos frente a 97/100).
- No se documenta en la información disponible soporte explícito de *tool calling* o *function calling* nativo, ni modos de razonamiento extendido (*thinking*), ni entrada de audio.

## Casos de uso

- Investigación en alineación y seguridad: comparar las respuestas del modelo abliterado con las de `google/gemma-3-12b-it` sobre un mismo conjunto de peticiones permite medir cuantitativamente el efecto de eliminar la dirección de rechazo (KL de 0,16; rechazos 3/100 frente a 97/100) y estudiar qué comportamientos se ven alterados.
- *Red-teaming* interno: usar la ausencia de rechazos para generar casos adversarios y probar filtros, clasificadores de contenido o políticas de moderación en un pipeline propio, siempre con revisión humana.
- Asistente local multimodal: con cuantización de 4 bits (≈7-8 GB de pesos) puede ejecutarse en una GPU de 12 GB o en un equipo Apple con memoria unificada, gestionando conversaciones de contexto largo y consultas sobre imágenes sin enviar datos a terceros.
- Análisis de documentación técnica: extraer y resumir información de capturas, diagramas de arquitectura o figuras dentro de un contexto de 128K tokens, útil para equipos que procesan manuales extensos con material gráfico.
- Atención al cliente multi-turno: el contexto de 128K permite mantener historiales largos de conversación con datos adjuntos; ahora bien, la ausencia de rechazos obliga a colocar un filtro de entrada y salida propio antes de exponerlo a usuarios finales.
- Generación de contenido creativo sin fricción editorial: ficción, guiones o material de *worldbuilding* donde el modelo original declinaba con frecuencia; requiere revisión legal y de políticas internas.
- Accesibilidad: descripción automática de imágenes para personas con discapacidad visual, con la ventaja de un modelo ejecutable en local y con control de costes por token.
- Prototipado de agentes multimodales: por su contexto largo y su pipeline `image-text-to-text`, sirve como banco de pruebas para flujos que encadenan lectura de imágenes y generación de texto, aunque el *tool calling* no está documentado.

## Benchmarks y rendimiento

La información disponible solo incluye la comparación de abliteración facilitada por el autor:

| Métrica | Este modelo | google/gemma-3-12b-it |
|---|---|---|
| Divergencia KL | 0,16 | 0 (por definición) |
| Rechazos | 3/100 | 97/100 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, MathVista u otros) en la información disponible. El repositorio incluye etiquetas con referencias arXiv de diversas suites de evaluación (entre ellas las asociadas a HellaSwag, WinoGrande, ARC, PIQA, OpenBookQA, MMLU, C-Eval, AGIEval, BBH, GSM8K, HumanEval, MBPP, TriviaQA, NaturalQuestions y HotpotQA), pero se trata de citas de las herramientas de evaluación y no de resultados numéricos del modelo. La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre este modelo.

## Requisitos de hardware

- Pesos en bf16/fp16: ≈24,4 GB, más caché KV y activaciones; en la práctica requiere del orden de 28-32 GB de VRAM para inferencia cómoda. GPU adecuadas: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB o dos GPU de 24 GB con reparto por capas.
- 8 bits: pesos de ≈12-13 GB; encaja en RTX 4080/4090 (16-24 GB) con margen para caché.
- 4 bits: pesos de ≈7-8 GB; cabe en RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB y equipos Apple con 16 GB de memoria unificada o más.
- No cabe en GPUs de consumo de 8-10 GB ni en formato bf16 en una única RTX 4090 (24 GB) sin cuantización.
- Contextos largos: a 128K tokens el consumo adicional de caché KV es significativo; se recomienda cuantización de la caché o reducir la ventana efectiva. No se dispone de cifras verificadas de memoria por token de contexto.
- Opciones de despliegue: transformers ≥4.50.0 (soporte nativo de Gemma 3), vLLM, TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y SGLang. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el autor no ha publicado, y el soporte del codificador visual en esos *runtimes* puede ser parcial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Rechazos | Rendimiento en benchmarks |
|---|---|---|---|---|---|---|
| gemma-3-12b-it-heretic | 12,19B | 128K entrada / 8K salida | Texto + imagen | Gemma (con gating) | 3/100 | No publicado |
| google/gemma-3-12b-it | 12,19B | 128K entrada / 8K salida | Texto + imagen | Gemma (con gating) | 97/100 | No disponible en esta información |
| google/gemma-3-4b-it | 4B (nominal) | 128K entrada / 8K salida | Texto + imagen | Gemma (con gating) | No disponible | No disponible |
| google/gemma-3-27b-it | 27B (nominal) | 128K entrada / 8K salida | Texto + imagen | Gemma (con gating) | No disponible | No disponible |
| Alternativas de otros fabricantes (Qwen, Llama, Mistral) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar dentro de la propia familia Gemma 3, que comparte tokenizador, ventana de contexto y licencia. No hay datos verificados en las fuentes disponibles para comparar rendimiento con modelos de otros fabricantes, de modo que cualquier tabla de ese tipo requeriría una evaluación propia.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo de forma deliberada: el modelo puede producir contenido dañino, ofensivo o ilegal ante peticiones que el original declinaba. No debe exponerse directamente a usuarios finales sin filtros propios de entrada y salida.
- La divergencia KL de 0,16 indica que la distribución de salida se ha desplazado respecto al modelo original; cabe esperar degradación en tareas que dependan de las capas de alineación, aunque el autor no publica evaluaciones de calidad general.
- Riesgo de alucinación heredado de un modelo de 12B: hechos inventados, citas falsas y errores de razonamiento en cadenas largas. No hay datos de benchmarks en la información disponible que permitan acotar la magnitud.
- Cobertura multilingüe desigual: los 140 idiomas declarados no implican calidad homogénea, y el repositorio no especifica idiomas concretos.
- Resolución de imagen fija (896 x 896) y 256 tokens por imagen: se pierde detalle en imágenes muy densas (texto pequeño, tablas complejas, documentos de alta resolución sin preprocesado).
- Ventana de salida limitada a 8.192 tokens, muy inferior al contexto de entrada de 128K.
- Licencia Gemma con acceso restringido: es necesario aceptar los términos de Google. La política de uso prohibido de Gemma puede verse comprometida por una modificación cuyo objetivo explícito es eliminar las salvaguardas; conviene revisar la licencia antes de cualquier uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la calidad de los pesos ni de la reproducibilidad del proceso.
- No hay cuantizaciones oficiales ni GGUF publicados; el despliegue en *runtimes* ligeros exige conversión propia y verificación posterior.
- Requiere transformers ≥4.50.0; versiones anteriores no cargan correctamente Gemma 3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mejpeezy/gemma-3-12b-it-heretic
- Modelo base preentrenado: https://huggingface.co/google/gemma-3-12b-pt
- Modelo instructivo original: https://huggingface.co/google/gemma-3-12b-it
- Heretic (herramienta de abliteración, v1.0.0): https://github.com/p-e-w/heretic
- Página de Gemma (Google): https://ai.google.dev/gemma/docs/core
- Informe técnico de Gemma 3: referenciado en la model card como [g3-tech-report]; URL no disponible en la información proporcionada.
- Responsible Generative AI Toolkit: referenciado como [rai-toolkit]; URL no disponible en la información proporcionada.
- Gemma en Kaggle: referenciado como [kaggle-gemma]; URL no disponible en la información proporcionada.
- Gemma en Vertex Model Garden: referenciado como [vertex-mg-gemma3]; URL no disponible en la información proporcionada.
- Términos de uso de Gemma: referenciados como [terms]; URL no disponible en la información proporcionada.
- Búsqueda web: no se encontraron resultados relevantes sobre el modelo; los enlaces devueltos corresponden a anuncios inmobiliarios sin relación con el contenido solicitado.
