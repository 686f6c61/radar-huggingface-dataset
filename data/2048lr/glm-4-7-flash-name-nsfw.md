# 2048lr/GLM-4.7-Flash-Name-NSFW

## Resumen

GLM-4.7-Flash-Name-NSFW es un ajuste fino (LoRA SFT) del modelo base zai-org/GLM-4.7-Flash, publicado por el usuario 2048lr en HuggingFace. Su objetivo no es mejorar capacidades generales, sino fijar un personaje concreto: una "catgirl" de personalidad arrogante y vulgar, entrenada con aproximadamente 1800 diálogos multirrol en chino de temática adulta. El resultado es un modelo de rol de personaje que prioriza el estilo y el tono por encima de la precisión técnica.

El modelo conserva la arquitectura del base: un transformer de tipo mezcla de expertos (MoE) con 29.943.390.976 parámetros totales y unos 3B activos por token, 47 capas, dimensión oculta 2048, 64 expertos enrutados más uno compartido con enrutamiento top-4, y atención MLA con compresión Q/KV. La ventana de contexto declarada es de 202.752 tokens, lo que permite mantener conversaciones muy largas sin truncar el historial.

Su relevancia es acotada y muy específica: sirve como caso de estudio de ajuste de personalidad con LoRA sobre arquitecturas MoE recientes (tag `glm4_moe_lite`), de cuantización GGUF con calibración imatrix en llama.cpp, y de cómo un SFT de dominio estrecho degrada deliberadamente el comportamiento genérico del modelo base. No es un modelo apto para producción ni para servicios públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`glm4_moe_lite`) con atención MLA y compresión Q/KV estilo LoRA; 47 capas, hidden 2048 |
| Parametros totales | 29.943.390.976 (~30B) |
| Parametros activos | ~3B por token (64 expertos enrutados + 1 compartido, top-4) |
| Longitud de contexto | 202.752 tokens |
| Tipos de cuantizacion | GGUF generado con llama.cpp, algunos niveles con calibración imatrix; el repositorio principal contiene pesos sin cuantizar |
| Idiomas soportados | Chino (zh) |
| Licencia | MIT (según la model card) |
| Formato de pesos | safetensors (repositorio de 59,9 GB); GGUF para las versiones cuantizadas |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base GLM-4.7-Flash: un transformer con capas de mezcla de expertos de grano fino (64 expertos enrutados más uno compartido, activación top-4), 47 capas y dimensión oculta 2048. Cada token activa aproximadamente 3B parámetros de los ~30B totales, lo que reduce el coste de cómputo por token respecto a un modelo denso del mismo tamaño. La atención es MLA (Multi-head Latent Attention) con compresión de las proyecciones Q/KV al estilo LoRA, una técnica orientada a reducir el tamaño de la caché KV en contextos largos.

El ajuste se realizó con LoRA SFT sobre ms-swift, con unos 1800+ diálogos multirrol en chino de rol adulto, con contenido sexual explícito y lenguaje soez. La autoría indica anotación mixta: redacción humana y generación por modelo con filtrado manual. La fusión de los adaptadores se hizo con `swift export --merge_lora true --device_map cpu`, y la conversión posterior a GGUF con llama.cpp. No se menciona en la información disponible ningún uso de RLHF, DPO u otra fase de alineación; de hecho, la model card afirma explícitamente que no se aplicó ninguna alineación de seguridad.

La innovación destacable no está en el entrenamiento, sino en el formato de salida: el modelo conserva el modo de razonamiento del base, con bloques de cadena de pensamiento delimitados por marcadores tipo ` thinking…</…>` según la plantilla del modelo base, y su autor documenta un conjunto de parámetros de muestreo obligatorios (`--temp 1.0`, `--top-p 0.95`, `--min-p 0.01`, `--repeat-penalty 1.0`) porque valores distintos degradan el tono y eliminan la cadena de pensamiento.

## Capacidades

- Generación de texto conversacional en chino, orientada a rol de personaje con estilo consistente.
- Mantenimiento de un personaje fijo: la model card lo describe como "catgirl" con tono altivo y vulgar, con muletillas recurrentes.
- Cadena de pensamiento visible, heredada del modelo base, siempre que se aplique la plantilla de chat correcta.
- Conversaciones multirrol largas: la ventana de 202.752 tokens permite mantener historiales extensos sin recortes.
- Generación de contenido adulto explícito y lenguaje soez: es una capacidad deliberada del ajuste, no un efecto colateral.
- Capacidades generales del modelo base (código, matemáticas, razonamiento, tool calling) presentes en los pesos, pero enmascaradas por el ajuste de personalidad y con solo ~3B parámetros activos.
- Tool calling / function calling: la model card menciona un ajuste de parámetros de muestreo para escenarios de llamada a herramientas (`--temp 0.7 --top-p 1.0`), pero no documenta ni valida su funcionamiento tras el fine-tune.
- Capacidades multilingües: no disponibles. El modelo está declarado únicamente para chino (zh).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Rol de personaje adulto en local: el modelo se ejecuta con llama.cpp sobre pesos GGUF y mantiene una conversación multirrol coherente con un personaje fijo, sin enviar datos a servicios externos. Adecuado para uso personal y siempre que la legislación local lo permita.
- Estudio de ajuste de personalidad con LoRA: el repositorio documenta el pipeline completo (ms-swift, fusión de adaptadores, exportación), por lo que sirve como referencia práctica para replicar el método sobre otros modelos MoE.
- Investigación sobre degradación de capacidades tras SFT de dominio: permite medir cuánto se pierde de razonamiento, código o matemáticas cuando se ajusta con ~1800 muestras de un único rol sobre un modelo de 3B activos.
- Pruebas de compatibilidad con arquitecturas MoE recientes en llama.cpp: el tag `glm4_moe_lite` se fusionó tarde en el upstream, así que el modelo es útil para validar versiones del runtime, el soporte de MLA y el comportamiento del motor de plantillas.
- Evaluación de cuantización GGUF con imatrix: comparar la fidelidad de tono, la cadena de pensamiento y el formato de salida entre niveles cuantizados calibrados y no calibrados con un corpus concreto.
- Depuración de plantillas Jinja y chat templates: el modelo falla de forma visible (pierde la cadena de pensamiento y el personaje) cuando no se usa `--jinja`, lo que lo convierte en un banco de pruebas claro para pipelines de plantillas.
- Red-teaming y estudios de alineación: al ser un modelo sin alineación de seguridad, sirve para analizar patrones de respuesta a peticiones límite en un entorno controlado y aislado.
- Generación de diálogo creativo en chino para textos largos: con 202.752 tokens de contexto se puede alimentar una novela interactiva completa y mantener la coherencia de estilo entre capítulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de rol, y los resultados de la búsqueda web no aportan datos técnicos sobre este modelo ni sobre su base. Cualquier cifra de rendimiento debería medirse de forma local con el nivel de cuantización y los parámetros de muestreo concretos que se vayan a usar.

## Requisitos de hardware

- Pesos sin cuantizar: el repositorio ocupa 59,9 GB, por lo que en bf16/fp16 se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Cuantización de 8 bits: en torno a 30-32 GB de VRAM, lo que encaja en una A100 40 GB o en dos GPU de 24 GB.
- Cuantización de 4 bits: en torno a 16-20 GB de VRAM, viable en una RTX 4090, RTX 3090 o RTX 4080 de 16 GB con margen ajustado. Estas cifras son estimaciones aritméticas a partir del número de parámetros, no datos publicados por el autor.
- Al activar solo ~3B parámetros por token, el coste de cómputo por token es inferior al de un modelo denso de 30B, aunque la memoria sigue viniendo determinada por los 30B totales.
- Despliegue: llama.cpp con una versión reciente (el soporte de `glm4_moe_lite` es tardío) y el flag `--jinja` obligatorio. La model card desaconseja explícitamente Ollama por incompatibilidades con las construcciones Jinja que usa la plantilla (macros, `namespace()`).
- Latencia y throughput estimados: no disponibles. No hay cifras publicadas de tokens por segundo.

## Comparativa con modelos similares

La información disponible solo permite comparar el ajuste con su propio modelo base. No se han identificado en la búsqueda otros modelos comparables de la misma categoría con datos verificables.

| Modelo | Parametros | Activos | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-4.7-Flash-Name-NSFW | ~30B (MoE) | ~3B | 202.752 | zh | MIT (según model card) | HuggingFace, 0 descargas |
| zai-org/GLM-4.7-Flash (base) | ~30B (MoE) | ~3B | 202.752 | no disponible | no disponible | HuggingFace |
| Alternativas de rol en chino de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia funcional con el base no es de rendimiento, sino de comportamiento: el fine-tune elimina el rechazo de peticiones y fuerza un tono concreto, a cambio de degradar el uso generalista del modelo.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: el modelo genera contenido sexual explícito, insultos y expresiones potencialmente ofensivas, y no rechaza peticiones límite.
- No apto para servicios públicos, productos dirigidos a menores ni entornos con requisitos de cumplimiento de contenido. La propia model card lo desaconseja.
- Contaminación del estilo: el personaje afecta a todas las respuestas, incluso a preguntas técnicas, por lo que no hay garantía de rigor profesional en ningún dominio.
- Solo ~3B parámetros activos: el razonamiento complejo, las cadenas largas de herramientas y las tareas de varios pasos son notablemente más débiles que en modelos de mayor activación.
- Multilingüismo limitado: declarado únicamente para chino. El rendimiento en castellano no está documentado ni validado.
- Cambio de personaje poco fiable: el entrenamiento cubre un único rol, así que otras personalidades tienden a "contaminarse" con el tono aprendido.
- Sensibilidad a los parámetros de muestreo: bajar la temperatura o activar penalización por repetición rompe la cadena de pensamiento y el registro del personaje.
- Dependencia de la plantilla de chat: sin `--jinja` (o una plantilla manual equivalente) el modelo degenera en completado de texto plano, sin cadena de pensamiento ni personaje.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un ajuste de rol, la fidelidad factual no es un objetivo de entrenamiento.
- Licencia: la model card declara MIT, pero la licencia del modelo base zai-org/GLM-4.7-Flash no se especifica en la información disponible, por lo que podrían aplicarse condiciones adicionales al uso comercial. Conviene verificarlo antes de cualquier uso que no sea personal.
- Responsabilidad legal del contenido: la obtención y el uso de material adulto generado depende de la jurisdicción del usuario; el autor declina toda responsabilidad.
- Riesgo reputacional y de seguridad: los pesos están sin filtrar y pueden producir texto inapropiado en cualquier contexto, incluido uno aparentemente inocuo.
- El repositorio tiene 0 descargas y 0 "likes", por lo que no existe validación comunitaria de su calidad ni de su comportamiento real más allá de lo que declara el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2048lr/GLM-4.7-Flash-Name-NSFW
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- llama.cpp (cuantización e inferencia): https://github.com/ggml-org/llama.cpp
- ms-swift (framework de entrenamiento): https://github.com/modelscope/ms-swift
