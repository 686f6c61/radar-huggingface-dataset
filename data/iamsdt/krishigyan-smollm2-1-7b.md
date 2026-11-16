# iamsdt/krishigyan-smollm2-1.7b

## Resumen

KrishiGyan SmolLM2-1.7B es un adaptador LoRA de tipo causal para generación de texto, especializado en preguntas y respuestas sobre agricultura de Bangladés en lengua bengalí. Lo desarrollan Shudipto Trafder (10xScale.ai) y Aparna Roy (disciplina de Agrotecnología, Universidad de Khulna) como un ajuste fino del modelo base HuggingFaceTB/SmolLM2-1.7B-Instruct, entrenado sobre el conjunto de datos KrishiGyan, compuesto por pares de pregunta y respuesta anclados en publicaciones de instituciones bangladesíes como BARI, BRRI, DAE, SRDI y Banglapedia.

El modelo aborda un problema de bajos recursos lingüísticos: adaptar un modelo pequeño y centrado en inglés a un dominio técnico muy específico (cultivos, suelos, riego, ganadería, pesca, poscosecha y mercados) en bengalí, con respuestas prácticas orientadas al agricultor y ajustadas a las estaciones, variedades y condiciones de Bangladés. Con 1.700 millones de parámetros en el modelo base y un adaptador LoRA de aproximadamente 0,3 GB en el repositorio, está pensado como línea base de investigación más que como producto final: la propia model card recomienda, para uso práctico, las variantes Gemma-3-1B o Qwen3-4B del mismo proyecto.

Es relevante ahora porque demuestra hasta dónde se puede llevar un modelo pequeño de base anglocéntrica mediante QLoRA supervisado en un dominio agrario de un idioma de bajos recursos, y porque publica métricas completas por categoría y dificultad, además de un artículo aceptado en IEEE PEEIACON 2026 (pendiente de publicación en IEEE Xplore).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con adaptador LoRA sobre SmolLM2-1.7B-Instruct |
| Parametros totales | 1.700 millones (modelo base); tamano del adaptador no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso con Unsloth fija max_seq_length=2048) |
| Tipos de cuantizacion | Entrenamiento sobre base bnb-4bit; el adaptador se puede fusionar y convertir a GGUF para llama.cpp/Ollama/LM Studio; otras cuantizaciones no disponibles |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Apache 2.0 (heredada de SmolLM2) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); convertible a GGUF tras fusion |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (QLoRA supervisado) montado sobre SmolLM2-1.7B-Instruct, un transformer causal decoder-only de 1.700 millones de parámetros. El ajuste se realizó con Unsloth partiendo de `unsloth/SmolLM2-1.7B-Instruct-bnb-4bit`, es decir, con el modelo base cuantizado a 4 bits durante el entrenamiento. Los objetivos de entrenamiento son únicamente las respuestas finales (answer-only targets): los pares pregunta → respuesta final del dataset KrishiGyan, sin usar las trazas de razonamiento paso a paso como objetivo. El adaptador se guarda junto con su tokenizer y su plantilla de chat en el subdirectorio `adapter/`.

El conjunto de datos KrishiGyan cubre ocho categorías (producción y protección de cultivos; suelos y nutrición; tecnología e innovación; agua, riego y clima; ganadería y pesca; investigación, educación y extensión; economía, política y ciencias sociales; y agricultura orgánica y sostenible), con metadatos de dificultad, estación, tema y fuente. Los splits son 4.490 ejemplos de entrenamiento, 249 de validación y 249 de test reservado, estratificados por categoría con semilla 42 tras eliminar preguntas duplicadas. No se documentan fases de RLHF ni DPO. El formato de inferencia es fijo: una instrucción de sistema en bengalí insertada dentro del turno del usuario, seguida de `প্রশ্ন:` y la pregunta.

## Capacidades

- Generación de texto y respuesta a preguntas en bengalí sobre agricultura de Bangladés: enfermedades de cultivos, dosis de fertilizantes, riego, ganadería, pesca, manejo poscosecha y mercados.
- Respuestas adaptadas al contexto local: estaciones, variedades y condiciones agronómicas bangladesíes.
- Comportamiento de abstención explícita cuando falta información, según la instrucción de sistema empleada en el entrenamiento.
- Formato de chat con plantilla propia incluida en el adaptador.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso (las trazas de razonamiento del dataset no se usaron como objetivo).
- No se documenta capacidad de visión, audio ni modo de pensamiento explícito.
- Multilingüismo limitado al bengalí declarado; el modelo base es anglocéntrico y no se reporta rendimiento en otros idiomas.

## Casos de uso

- Consulta agronómica para agricultores: un asistente conversacional en bengalí que responde preguntas sobre dosis de fertilizante o control de plagas, aprovechando el ajuste sobre publicaciones de BARI, BRRI y DAE para dar respuestas alineadas con las recomendaciones oficiales bangladesíes.
- Extensión agraria digital: integración en aplicaciones móviles de servicios de extensión para técnicos de campo que necesitan respuestas rápidas y en idioma local sobre manejo de cultivos y riego.
- Línea base de investigación en PLN de bajos recursos: evaluación de hasta dónde llega un modelo de 1,7B centrado en inglés al adaptarse a un dominio técnico en bengalí, con métricas por categoría y dificultad publicadas en `metrics/`.
- Prototipado de asistentes de dominio con presupuesto de hardware reducido: al ser un adaptador LoRA sobre un modelo de 1,7B, se puede desplegar en una sola GPU de consumo o incluso en CPU tras fusionar y convertir a GGUF para llama.cpp u Ollama.
- Filtrado y enriquecimiento de documentación agrícola: generación de respuestas de referencia o resúmenes de material técnico en bengalí para bases de conocimiento internas de ONG y cooperativas.
- Educación y formación agraria: generación de explicaciones prácticas sobre manejo poscosecha o ganadería para materiales didácticos en bengalí, con revisión humana obligatoria por el riesgo de alucinación.
- Investigación comparativa de ajuste fino: punto de partida reproducible (configuración exacta en `run_config.json`) para comparar QLoRA frente a otras estrategias sobre el mismo dataset KrishiGyan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el repositorio incluye resultados completos de evaluación en `metrics/` (predicciones por ejemplo, puntuaciones por categoría y por dificultad), pero no se proporcionan las cifras en la información disponible, por lo que no se reproducen números.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo base de 1,7B requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en 4 bits (bnb o GGUF Q4) se sitúa en torno a 1-1,5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con margen (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100); para 4 bits basta con 4-6 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más; también es viable en CPU con llama.cpp en cuantización Q4.
- Opciones de despliegue: Transformers + PEFT (adaptador), Unsloth con base bnb-4bit, y tras `merge_and_unload()` y conversión con `convert_hf_to_gguf.py`, en llama.cpp, Ollama y LM Studio. No se documenta soporte específico de vLLM o TGI para el adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| KrishiGyan SmolLM2-1.7B | 1,7B (base) + LoRA | no disponible | Bengalí (dominio agrario) | Apache 2.0 | Adaptador PEFT; línea base de investigación |
| Gemma-3-1B (variante KrishiGyan) | no disponible | no disponible | Bengalí (dominio agrario) | no disponible | Recomendada por los autores para uso práctico |
| Qwen3-4B (variante KrishiGyan) | 4B | no disponible | Bengalí (dominio agrario) | no disponible | Recomendada por los autores para uso práctico |
| SmolLM2-1.7B-Instruct (base) | 1,7B | no disponible | Inglés principalmente | Apache 2.0 | Modelo base sin ajuste agrario en bengalí |

Los detalles de contexto, licencia y rendimiento de las variantes Gemma-3-1B y Qwen3-4B del proyecto no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo describe como línea base y recomienda las variantes Gemma-3-1B o Qwen3-4B para uso práctico.
- Riesgo de alucinación en recomendaciones agronómicas: dosis de fertilizantes, plaguicidas o manejo de plagas mal generadas pueden causar daños reales; se requiere revisión por expertos antes de cualquier uso en producción.
- Dependencia estricta del formato: la instrucción de sistema debe insertarse dentro del turno del usuario seguida de `প্রশ্ন:`; otros formatos degradan la calidad de las respuestas.
- Cobertura lingüística limitada al bengalí; no se reporta rendimiento en otros idiomas y el modelo base es anglocéntrico.
- Entrenado solo con respuestas finales, sin trazas de razonamiento: no se debe esperar razonamiento multi-paso explícito ni capacidades de agente.
- Sesgos potenciales derivados de las fuentes institucionales bangladesíes (BARI, BRRI, DAE, SRDI, Banglapedia) y de las condiciones agronómicas de Bangladés, que pueden no transferirse a otras regiones.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base SmolLM2; conviene verificar las condiciones del modelo base y del dataset KrishiGyan para usos derivados.
- Sin datos publicados de benchmarks en la información disponible; las métricas del repositorio (`metrics/`) no se han podido verificar aquí.
- Longitud de contexto no documentada; el ejemplo de Unsloth fija 2.048 tokens, lo que limita conversaciones o documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamsdt/krishigyan-smollm2-1.7b
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset KrishiGyan: https://huggingface.co/datasets/AROY76/KrishiGyan
- Base cuantizada usada en entrenamiento: https://huggingface.co/unsloth/SmolLM2-1.7B-Instruct-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- 10xScale.ai: https://10xscale.ai
- Artículo: aceptado en IEEE PEEIACON 2026, pendiente de publicación en IEEE Xplore (sin enlace disponible)
