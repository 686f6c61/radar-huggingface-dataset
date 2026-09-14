# abdnaouri/silma-2b-darija-lora

## Resumen

SILMA-2B-Darija es un adaptador LoRA de ajuste fino (PEFT) sobre el modelo base `silma-ai/SILMA-Kashif-2B-Instruct-v1.0`, de arquitectura Gemma 2 y aproximadamente 2.600 millones de parámetros. Lo desarrolla el usuario `abdnaouri` y su objetivo es resolver un problema concreto: los modelos fundacionales árabes, entrenados mayoritariamente en árabe estándar (fusha) y dialectos del Golfo, degradan su comportamiento cuando se les interpela en dariya marroquí (`ary`), derivando hacia modismos levantinos o del Golfo y fallando en el reconocimiento de referencias culturales locales.

El adaptador se ha entrenado sobre 54.518 pares instrucción-respuesta en dariya marroquí, procedentes de 10 corpus auténticos, y añade soporte nativo de arabizi (transliteración latina con dígitos que representan fonemas faríngeos: `3` para ع, `7` para ح, `9` para ق, `5` para خ). Con un tamaño de solo 79 MB (`adapter_model.safetensors`, rango r=16, alpha=32), está pensado para despliegue en hardware de consumo: MacBooks con Apple Silicon (MPS), portátiles con GPU discreta y CPU, con menos de 3 GB de VRAM en cuantización de 4 bits.

Su relevancia actual es doble. Por un lado, cubre un hueco real en el ecosistema NLP del Magreb, una región de más de 35 millones de hablantes de dariya con muy poca cobertura en modelos abiertos. Por otro, forma parte de una suite más amplia (Derej) que incluye un modelo de 9B en entrenamiento, un motor TTS con flow-matching y un agente de voz end-to-end, lo que sitúa a este adaptador como el "cerebro" conversacional de bajo consumo de ese stack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador PEFT/LoRA (rank r=16, alpha=32) sobre el modelo base `silma-ai/SILMA-Kashif-2B-Instruct-v1.0` |
| Parametros totales | ~2,6 mil millones en el modelo base; el adaptador LoRA ocupa 79 MB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | la model card menciona 4 bits como configuracion de despliegue en consumo; no se listan formatos GGUF/AWQ/GPTQ publicados |
| Idiomas soportados | arabe marroqui (`ary` / dariya), arabe estandar (`ar`), arabizi (transliteracion latina con digitos 3, 7, 9, 5), frances (`fr`) e ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA) |
| Tamano del repositorio | 0,1 GB |
| Pasos de entrenamiento | 2.897 pasos de optimizacion, 6,18 horas en una Tesla P100 |
| Fecha de creacion | 14 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 sobre `SILMA-Kashif-2B-Instruct-v1.0`, que sigue la arquitectura Gemma 2 (transformer decoder-only con atención local/global intercalada y normalización RMSNorm, según la familia base). El ajuste se aplicó a las proyecciones de atención y MLP, con un total de 364 tensores entrenados según la model card. El entrenamiento se completó en una única Tesla P100 durante 2.897 pasos de optimización y 6,18 horas continuas, con una pérdida de entrenamiento que descendió de 4,365 a 2,789. No se documentan en la información disponible las hiperparámetros completos (learning rate, scheduler, precisión de entrenamiento) ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

El conjunto de datos de ajuste consta de 54.518 pares instrucción-respuesta "dialect-stratified", distribuidos en 10 corpus marroquíes auténticos. La model card menciona que se trabajó la eliminación del sesgo conversacional hacia dialectos del Golfo y el árabe estándar, además de cubrir sabiduría popular, refranes (الأمثال الشعبية), hechos históricos, recetas culinarias y procedimientos administrativos. La métrica destacada por el autor es un incremento del 93,7 % en la "densidad de vocabulario dariya marroquí" respecto al modelo base, aunque no se explicita la metodología de cálculo de esa métrica. También se menciona la integración prevista con un motor TTS (DerejTTS, basado en flow-matching F5-TTS) para construir agentes de voz con latencia objetivo inferior a 200 ms.

## Capacidades

- Generación de texto conversacional en dariya marroquí nativa, evitando la deriva hacia modismos del Golfo o árabe estándar que muestra el modelo base.
- Comprensión y generación de arabizi, incluyendo la interpretación de la transliteración con dígitos (`3`, `7`, `9`, `5`) típica de la comunicación digital marroquí.
- Preguntas y respuestas de tipo cultural: historia de Marruecos, patrimonio (por ejemplo, la Universidad Al-Qarawiyyin, Rabat), refranes populares y su explicación.
- Recetas y cocina marroquí (por ejemplo, consultas sobre tajín de pollo con ciruela y almendra), incluyendo consultas formuladas en arabizi.
- Cambio de registro entre árabe marroquí, árabe estándar, francés e inglés, con soporte de escritura árabe y latina.
- Capacidad multilingüe limitada a los cinco registros declarados; no se documentan capacidades de código, matemáticas avanzadas, visión, audio ni tool calling.
- No se declara soporte explícito de function calling, agentes multi-paso ni modo "thinking"; el uso previsto es generación de texto conversacional.
- Integración prevista como componente de razonamiento de un pipeline de voz (DerejLLM ↔ DerejTTS) y de un agente de voz conversacional.

## Casos de uso

- Atención al cliente en dariya: un operador marroquí puede desplegar el adaptador como motor de respuestas para consultas de clientes en dialecto local, sin obligar al usuario a escribir en árabe estándar o francés. El tamaño del adaptador permite ejecutarlo en el mismo portátil del agente o en un servidor modesto.
- Agente de voz para call centers: combinado con el motor DerejTTS de la misma suite, sirve como cerebro de razonamiento de baja latencia para diálogo hablado en dariya, con el objetivo declarado de respuestas de voz por debajo de 200 ms.
- Preservación y difusión del patrimonio cultural: consultas sobre historia, monumentos, refranes y tradiciones marroquíes, útil para aplicaciones educativas o museísticas dirigidas a público local.
- Asistente culinario: interpretación de recetas tradicionales y consultas formuladas tanto en escritura árabe como en arabizi (por ejemplo, "kifash ntyeb tajin d djaj"), lo que reduce la fricción de entrada para usuarios que escriben en transliteración.
- Normalización de arabizi a escritura árabe: uso como capa de transliteración bidireccional en pipelines de preprocesado de texto para redes sociales, foros o sistemas de mensajería marroquíes.
- Chatbot de servicios ciudadanos: ayuda con procedimientos administrativos y preguntas cívicas en dialecto, donde el modelo base fallaba por desconocimiento del contexto local.
- Prototipado e investigación en NLP del Magreb: al ser un adaptador de 79 MB con licencia Apache 2.0, permite experimentar con ajuste adicional, evaluación de dialectos o generación de datos sintéticos en hardware de consumo.
- Asistente educativo local: explicación de conceptos y apoyo a estudiantes en dariya sobre hardware sin GPU dedicada, gracias a la ejecución en CPU declarada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ArabicMMLU u otros) en la informacion disponible. Los unicos datos numericos aportados por el autor son los siguientes:

| Metrica | Valor | Contexto |
|---|---|---|
| Densidad de vocabulario dariya | +93,7 % respecto al modelo base | Metrica propia del autor, metodologia no detallada |
| Perdida de entrenamiento | 4,365 → 2,789 | 2.897 pasos de optimizacion |
| Duracion del entrenamiento | 6,18 horas | 1x Tesla P100 |
| Pares de instruccion | 54.518 | 10 corpus marroquies |
| Pasos de optimizacion | 2.897 | Adaptador convergido segun el autor |

No se dispone de comparaciones cuantitativas verificables contra otros modelos de dariya o de arabe en la informacion proporcionada.

## Requisitos de hardware

- El adaptador LoRA ocupa 79 MB; el modelo base de 2,6B parametros debe cargarse aparte.
- VRAM estimada para el modelo base fusionado: en bf16/fp16, en torno a 5-6 GB; en cuantizacion de 8 bits, en torno a 3 GB; en 4 bits, menos de 3 GB segun la model card.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060/4070, RTX 3090/4090 y similares con margen amplio, incluso en precision completa. En GPUs de 8 GB es recomendable cuantizacion de 4 u 8 bits.
- Soporte declarado de Apple Silicon mediante MPS (MacBooks con memoria unificada), asi como ejecucion en CPU.
- Throughput declarado por el autor: 35 o mas tokens por segundo en hardware de consumo. No se especifica la configuracion exacta de medida, por lo que debe tratarse como una cifra orientativa y no verificada.
- Opciones de despliegue: PEFT + Transformers (ruta nativa para un adaptador LoRA), vLLM con soporte de adaptadores LoRA para servicio concurrente, TGI con adaptadores, y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF (conversion no publicada en el repositorio).
- Para pipelines de voz de bajos requisitos, el autor situa este adaptador como el componente de razonamiento de un stack con TTS flow-matching, con objetivo de latencia inferior a 200 ms de extremo a extremo en la generacion de voz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silma-2b-darija-lora (este) | ~2,6B + adaptador LoRA de 79 MB | no disponible | Dariya (`ary`), arabizi, ar, fr, en | Apache 2.0 | Publicado en HuggingFace (12 descargas, 0 likes en el momento de la ficha) |
| silma-ai/SILMA-Kashif-2B-Instruct-v1.0 (base) | ~2,6B | no disponible | Arabe (con sesgo hacia fusha y dialectos del Golfo) | no disponible en la informacion proporcionada | Publicado en HuggingFace |
| silma-9b-darija | ~9B | no disponible | Dariya | no disponible | En entrenamiento segun la model card, no publicado |
| Otros modelos abiertos de dariya (por ejemplo, alternativas de la comunidad Atlas) | no disponible | no disponible | Dariya | no disponible | No se dispone de datos en la informacion proporcionada |

No se han encontrado en la busqueda web resultados relevantes para este modelo; los unicos enlaces devueltos correspondian a contenido no relacionado con el ambito de la ficha.

## Limitaciones y advertencias

- No se han publicado evaluaciones en benchmarks estandar, por lo que el rendimiento real en tareas de razonamiento, matematicas o codigo es desconocido.
- La metrica principal del autor (+93,7 % de densidad de vocabulario dariya) carece de metodologia publicada y no equivale a una mejora de calidad demostrada.
- Riesgo de alucinacion en datos historicos y culturales: al ser un ajuste sobre un modelo de 2,6B, la precision factual en detalles historicos o administrativos puede ser limitada y deberia verificarse en produccion.
- El modelo es un adaptador: requiere descargar y cargar el modelo base, y hereda sus sesgos, su tokenizador y sus limitaciones de contexto.
- La licencia del adaptador es Apache 2.0, pero conviene verificar los terminos del modelo base (familia Gemma 2), ya que pueden imponer condiciones adicionales para uso comercial derivado.
- Adopcion muy limitada: 12 descargas y 0 likes en el momento de la ficha, sin validacion independiente por parte de la comunidad.
- Fecha de creacion registrada como septiembre de 2026, posterior a la fecha habitual de publicacion; conviene confirmar la vigencia y el estado real del repositorio.
- Capacidades no documentadas: no hay soporte declarado de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Idiomas fuera del conjunto declarado (dariya, arabe estandar, arabizi, frances, ingles) no estan garantizados y probablemente degraden notablemente.
- La model card se encuentra truncada en la informacion proporcionada, por lo que pueden existir secciones (evaluacion, datos de entrenamiento detallados, instrucciones de uso) no recogidas aqui.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/abdnaouri/silma-2b-darija-lora
- Modelo base: https://huggingface.co/silma-ai/SILMA-Kashif-2B-Instruct-v1.0
- Repositorio del autor (perfil en HuggingFace): https://huggingface.co/abdnaouri
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs, demos o repositorios) asociados a este modelo; los resultados devueltos no guardaban relacion con la ficha.
