# Piyush00023/coffy-3.5-flash

## Resumen

coffy-3.5-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso de 3 expertos, publicado por el desarrollador independiente Piyush00023 bajo licencia Apache-2.0. Se construye mediante *expert upcycling*: tres modelos Qwen3-8B afinados de forma independiente aportan sus bloques FFN completos como expertos especializados sobre un backbone de atención compartido, dando lugar a un total de 19.062.813.696 parámetros (19,06B) con enrutamiento top-2 por token.

El modelo sigue el layout nativo `Qwen3MoeForCausalLM`, con dimensión oculta de 4096, atención GQA (32 cabezas de consulta y 8 de clave/valor) con RoPE, vocabulario de 151.936 tokens y pesos en bf16 distribuidos en 13 shards safetensors (38,13 GB). Cada experto procede de un modelo real y distinto: coffy-3.2-flash para identidad y asistencia general, MathForm-8B para matemáticas y STEM, y Goedel-Prover-V2-8B para razonamiento formal y demostraciones lógicas.

Es relevante ahora como experimento de investigación sobre upcycling de MoE y enrutamiento de expertos, no como asistente listo para producción. El propio autor advierte de que el router está inicializado a cero (mezcla uniforme de expertos) y de que la generación a escala completa aún no se ha validado en hardware de altas prestaciones, por lo que la calidad de salida está sin probar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3MoeForCausalLM (transformer MoE disperso, 3 expertos FFN sobre backbone de atención compartido) |
| Parametros totales | 19.062.813.696 (19,06B) |
| Parametros activos | Top-2 de 3 expertos por token (cada experto ~8,2B en FFN; backbone de atención compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en el repositorio; GGUF en preparación (no publicado) |
| Idiomas soportados | en, code |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (13 shards, 38,13 GB) |

## Arquitectura y entrenamiento

El modelo emplea el layout nativo de Qwen3 MoE: cada bloque aplica una atención causal con RoPE y GQA (32 cabezas de consulta, 8 de clave/valor) sobre una normalización RMSNorm, seguida de una capa MoE con tres pilas FFN independientes (`gate_proj`, `up_proj`, `down_proj`) y enrutamiento top-2 mediante una compuerta softmax lineal. El backbone compartido (embeddings, proyecciones de atención, normalizaciones y LM head) proviene del experto coffy-8B (slot 0), mientras que los slots 1 y 2 reciben las pilas FFN de MathForm-8B y Goedel-Prover-V2-8B respectivamente. La validez del upcycling se apoya en que los tres modelos origen pertenecen a la familia Qwen3-8B y comparten arquitectura y vocabulario idénticos.

No se documenta un proceso de entrenamiento adicional: el modelo se ensambla a partir de checkpoints ya afinados y el router se inicializa a cero, lo que produce una mezcla uniforme de expertos en el momento de la publicación. No hay datos sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO en la información disponible. La innovación técnica principal es el propio mecanismo de upcycling, que combina la especialización de un ensemble de modelos con la estructura de enrutamiento de un MoE nativo; el router queda como parámetro aprendible en revisiones futuras.

## Capacidades

- Generación de texto conversacional en inglés, con la persona "coffy" heredada del experto de identidad.
- Razonamiento matemático y STEM, aportado por el experto MathForm-8B.
- Razonamiento formal y verificación lógica, aportado por el experto Goedel-Prover-V2-8B.
- Generación de código: el tag `code` figura entre los idiomas soportados y entre las etiquetas del modelo.
- Enrutamiento top-2 sobre tres expertos especializados (mezcla uniforme mientras el router permanezca sin entrenar).
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Investigación sobre upcycling de MoE: el modelo sirve como banco de pruebas para estudiar cómo se comporta un ensamblaje de tres FFN afinados sobre un backbone compartido y qué efecto tiene entrenar el router desde una inicialización uniforme.
- Estudio de enrutamiento de expertos: al partir de un router a cero, permite medir la degradación frente a un router entrenado y experimentar con estrategias de inicialización o ajuste del gate.
- Experimentos de combinación de especialistas: útil para evaluar si la mezcla top-2 de un experto general, uno matemático y uno de demostración formal produce respuestas coherentes en tareas mixtas.
- Reproducción de pipelines de ensamblaje de pesos: dado que el repositorio incluye los pesos completos en safetensors, sirve para validar herramientas de fusión y verificación de shards en modelos de ~19B.
- Evaluación comparativa de modelos derivados: como modelo derivado de la familia Qwen3-8B, puede emplearse en estudios de procedencia y atribución de licencias Apache-2.0.
- Docencia y divulgación sobre arquitecturas MoE: su estructura de tres expertos y enrutamiento top-2 es un ejemplo didáctico manejable para explicar el funcionamiento interno de un MoE disperso.
- No se recomienda su uso como asistente de producción, atención al cliente ni generación de código en pipelines reales hasta que el autor valide la generación a escala completa y, opcionalmente, entrene el router.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 38 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 40-48 GB de VRAM para carga completa.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU. Una RTX 4090 (24 GB) no permite cargar el modelo completo en bf16.
- Consumer GPU: no cabe en bf16 en ninguna GPU de consumo actual de 24 GB o menos; requeriría cuantización GGUF (aún en preparación) o descarga por capas con offloading a CPU/RAM, con latencia muy elevada.
- Opciones de despliegue: transformers con `device_map="auto"` es la vía documentada por el autor; vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible y su compatibilidad no está confirmada.
- Latencia y throughput: no disponibles; el autor indica que la validación de generación a escala completa está pendiente en hardware de mayores prestaciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| coffy-3.5-flash | 19,06B | Top-2 de 3 expertos | no disponible | Apache-2.0 | Pesos publicados, router sin entrenar, generación sin validar |
| Qwen3-8B (familia base) | ~8B | Denso | no disponible en esta ficha | Apache-2.0 | Modelo base de referencia, validado y ampliamente usado |
| MathForm-8B | ~8B | Denso | no disponible en esta ficha | Apache-2.0 | Experto matemático de origen |
| Goedel-Prover-V2-8B | ~8B | Denso | no disponible en esta ficha | Apache-2.0 | Experto de razonamiento formal de origen |

La comparación directa con alternativas MoE de tamaño similar no está disponible en la información proporcionada. Frente a los tres modelos densos de 8B que lo componen, coffy-3.5-flash ofrece mayor especialización agregada a costa de triplicar los parámetros y de un enrutamiento aún no entrenado.

## Limitaciones y advertencias

- Router inicializado a cero: la compuerta MoE arranca uniforme, por lo que los tres expertos contribuyen por igual y el modelo no selecciona al experto adecuado para cada tarea.
- Generación sin validar: el modelo ensamblado no se ha ejecutado a escala completa en GPU, por lo que la calidad de salida es desconocida; el autor recomienda validarlo antes de cualquier uso en producción.
- Herencia de limitaciones: la calidad de cada experto depende de los modelos origen (MathForm-8B, Goedel-Prover-V2-8B y coffy-3.2-flash) y de sus propios sesgos y carencias.
- Idiomas: solo se declaran inglés y código; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: la longitud de contexto no está especificada en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Cuantizaciones GGUF en preparación: no hay versiones cuantizadas publicadas, y los pesos bf16 requieren unos 38 GB de memoria para cargarse.
- Licencia: los pesos se publican bajo Apache-2.0, pero el repositorio no es un proyecto de código abierto; no se incluyen pipelines de entrenamiento ni herramientas derivadas, y el contenido se ofrece tal cual para inferencia.
- Uso previsto: investigación sobre upcycling de MoE y enrutamiento de expertos; no es un asistente de producción hasta que se valide y, opcionalmente, se entrene el router.
- Riesgo de alucinación: no evaluado; al no haberse validado la generación, no existen mediciones de fiabilidad factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Piyush00023/coffy-3.5-flash
- Experto de identidad (coffy-3.2-flash): https://huggingface.co/Piyush00023/coffy-3.2-flash
- Experto matemático (MathForm-8B): https://huggingface.co/openbmb/MathForm-8B
- Experto de razonamiento formal (Goedel-Prover-V2-8B): https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
