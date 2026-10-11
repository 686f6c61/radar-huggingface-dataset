# smurgai/hw1-qwen25-dpo-lora

## Resumen

smurgai/hw1-qwen25-dpo-lora es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Se publica como repositorio PEFT en HuggingFace, con la librería `peft` y `transformers`/`trl` como stack declarado. El nombre del repositorio ("hw1") y el tamaño del repo (0,0 GB según la API de HuggingFace) apuntan a un artefacto experimental o académico, no a un modelo de producción: registra 0 descargas y 0 "likes" en el momento de la consulta, y su model card es la plantilla por defecto sin rellenar, sin licencia, idiomas ni hiperparámetros declarados.

Técnicamente no es un modelo completo, sino un conjunto de pesos de adaptador que debe cargarse junto al base Qwen2.5-1.5B-Instruct. Por tanto, sus características funcionales (arquitectura, ventana de contexto, tokenizador, capacidades multilingües) son las del modelo base: un transformer decoder-only denso de ~1,5 mil millones de parámetros con 32.768 tokens de contexto. El aporte del adaptador es un ajuste de preferencias sobre ese base, presumiblemente para alinear estilo y formato de respuesta, sin cambiar la arquitectura ni el tamaño.

Su relevancia es limitada y acotada a un nicho: sirve como ejemplo reproducible de un pipeline DPO con LoRA sobre un modelo pequeño, útil para quien quiera inspeccionar cómo se publica un adaptador PEFT, o como punto de partida para fine-tuning ligero en hardware de consumo. No hay evidencia publicada de evaluación, y la información disponible no permite recomendarlo para uso comercial o en producción sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-1.5B-Instruct); el adaptador es LoRA + DPO |
| Parametros totales | Del base: ~1,54 mil millones (1,31 mil millones no-embedding, segun documentacion de Qwen2.5). Del adaptador LoRA: no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen2.5-1.5B-Instruct); no declarada en el adaptador |
| Tipos de cuantizacion | No disponible para el adaptador (pesos LoRA en safetensors, sin cuantizar). El base fusionado admite cuantizaciones GGUF/AWQ/GPTQ generadas por la comunidad |
| Idiomas soportados | No declarados en el adaptador; el base Qwen2.5-1.5B-Instruct declara soporte para 29 idiomas, incluido el espanol |
| Licencia | No disponible en el adaptador; el base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA): 28 capas, dimensión oculta de 1536 y un vocabulario de 151.936 tokens, según la documentación oficial de la familia Qwen2.5. El adaptador en sí no modifica esa topología: añade matrices de bajo rango sobre capas seleccionadas, que deben cargarse con `peft` o fusionarse con el base antes de la inferencia.

Sobre el entrenamiento solo consta lo que indican las etiquetas del repositorio: `dpo`, `lora`, `trl` y `transformers`. Es decir, se aplicó optimización directa de preferencias sobre pares (respuesta elegida, respuesta rechazada) usando LoRA como método de ajuste eficiente. No se especifican el dataset de preferencias, el número de pasos, el rango y alpha de LoRA, la tasa de aprendizaje ni la precisión de entrenamiento: la model card mantiene los campos "Training Data", "Training Hyperparameters" y "Training regime" como "[More Information Needed]". Tampoco hay información sobre RLHF adicional, decodificación especulativa ni variantes de atención.

La única referencia técnica concreta del repositorio es el etiquetado `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. (2019) sobre estimación de emisiones de carbono en aprendizaje automático, citado en la plantilla estándar de model card. No es un paper del modelo ni describe su entrenamiento.

## Capacidades

La información proporcionada no documenta capacidades específicas del adaptador. Lo que puede afirmarse se limita a lo siguiente:

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational`, heredadas del base instruct.
- Ajuste de preferencias: el uso de DPO sobre LoRA indica una optimización orientada a preferir ciertas respuestas sobre otras, presumiblemente en tono, formato o brevedad.
- Razonamiento y código: el base Qwen2.5-1.5B-Instruct cubre generación de texto, matemáticas básicas y código, pero no hay evaluación publicada de cómo el adaptador afecta a estas capacidades (el DPO puede degradar habilidades de razonamiento si el dataset de preferencias es limitado).
- Tool calling / function calling: no disponible en el adaptador; el base Qwen2.5-Instruct soporta plantillas de herramientas, pero no se ha verificado su conservación tras el ajuste.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas para el adaptador; el base cubre 29 idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de pipelines DPO: el adaptador sirve como ejemplo funcional de extremo a extremo (base + LoRA + preferencias) para equipos que quieran replicar el flujo con `trl` y `peft` sobre sus propios datos antes de escalar a modelos mayores.
- Experimentos académicos y docencia: con 0 descargas y una model card sin rellenar, su uso más realista es como artefacto de un ejercicio de clase o práctica de laboratorio, no como componente de un sistema.
- Asistente conversacional ligero en local: fusionado con el base de 1,5B, puede ejecutarse en CPU o en una GPU de gama media para respuestas cortas de FAQ, siempre que se acepte una calidad muy inferior a la de modelos de 7B o superiores.
- Generación de texto de bajo coste en edge: al ocupar aproximadamente 3 GB en bf16 y en torno a 1 GB cuantizado a 4 bits, es viable en dispositivos con recursos limitados donde no cabe un modelo mayor.
- Filtrado o reformateo de textos cortos: tareas de normalización, reescritura de frases o generación de respuestas breves con un estilo controlado por el ajuste de preferencias.
- Punto de partida para fine-tuning específico de dominio: el adaptador puede servir como inicialización para un ajuste posterior con datos propios, aprovechando que LoRA permite entrenar con presupuesto reducido.
- Comparación de métodos de alineación: útil en estudios que comparen DPO frente a SFT o PPO en modelos pequeños, siempre con una evaluación propia, ya que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye sección de evaluación cumplimentada (los apartados "Testing Data", "Metrics" y "Results" figuran como "[More Information Needed]"), y la búsqueda web no devuelve ninguna evaluación asociada a este adaptador concreto. Para los valores publicados del modelo base (MMLU, HumanEval, GSM8K, etc.) debe consultarse la model card oficial de Qwen/Qwen2.5-1.5B-Instruct; no se trasladan aquí porque el ajuste DPO puede alterarlos y no existen mediciones del adaptador que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA solo ocupa decenas de MB, pero requiere cargar el base. En bf16/fp16, el modelo fusionado necesita aproximadamente 3,1 GB de pesos más overhead de activaciones y caché KV; con contexto de 32.768 tokens la caché KV añade varios cientos de MB.
- Cuantización: en GGUF Q4_K_M el conjunto baja a aproximadamente 1 GB; en Q8_0, en torno a 1,7 GB. Estas cifras son estimaciones basadas en el tamaño del base, no mediciones publicadas para este adaptador.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 2070, GTX 1660 con cuantización). Para lotes grandes o contexto máximo, se recomienda 8-12 GB (RTX 3070/4070, RTX 3060 12 GB) o GPUs de datacenter (A100, H100) si se busca máximo throughput.
- Cabe en GPU de consumo: sí, con holgura, incluso en tarjetas de gama de entrada y en CPU con llama.cpp.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sin fusionar (permite conmutar adaptadores en caliente); fusión con `merge_and_unload` y posterior conversión a GGUF para llama.cpp, Ollama o LM Studio; vLLM y TGI admiten adaptadores LoRA en servidores de inferencia, aunque para un modelo de este tamaño el beneficio es marginal.
- Latencia y throughput: no disponibles. El autor no publica mediciones, y cualquier cifra dependería del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smurgai/hw1-qwen25-dpo-lora | Adaptador LoRA sobre base de ~1,54B | 32.768 (heredado) | Adaptador DPO + LoRA | No disponible | 0 descargas, 0 likes |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54B (1,31B no-embedding) | 32.768 | Modelo instruct completo | Apache 2.0 | Ampliamente desplegado |
| August-GKD/qwen25-dpo-lora-adapter | Adaptador LoRA sobre base Qwen2.5 | No disponible | Adaptador DPO + LoRA | No disponible | Repositorio de otro autor, sin relación verificada |
| xqjiao/qwen25-7b-instruct-dpo-lora | Adaptador LoRA sobre base de 7B | No disponible | Adaptador DPO + LoRA | No disponible | Repositorio de otro autor, sin relación verificada |

Los dos adaptadores de la tabla aparecen en la búsqueda web como repositorios homónimos o de propósito similar, pero no hay ninguna evidencia de que compartan autoría, dataset o procedimiento con `smurgai/hw1-qwen25-dpo-lora`. No se dispone de métricas comparables de ninguno de ellos, por lo que la comparación se limita a parámetros, contexto y licencia. Frente a alternativas completas y consolidadas de ese rango (Qwen2.5-1.5B-Instruct, Llama 3.2 1B/3B Instruct, Gemma 2 2B), este adaptador parte en desventaja: carece de licencia explícita, de evaluación y de documentación de entrenamiento.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto; no hay información sobre datos de preferencias, hiperparámetros ni metodología. Esto impide reproducir el entrenamiento o auditar sus sesgos.
- Sin licencia declarada: al no especificarse licencia para el adaptador, no puede asumirse que sea reutilizable comercialmente, aunque el modelo base sea Apache 2.0. Es un riesgo legal directo para cualquier uso en producción.
- Sin métricas: no hay benchmarks, y DPO sobre datasets pequeños o sesgados puede degradar el razonamiento, el código o el multilingüismo del base sin que exista forma de detectarlo a priori.
- Riesgo de alucinación: elevado, coherente con un modelo base de 1,5B parámetros; en tareas factuales o de conocimiento especializado produce respuestas plausibles pero incorrectas con frecuencia.
- Sin filtros de seguridad documentados: no se indica ningún ajuste de seguridad, moderación o red teaming. No debe desplegarse de cara al público sin capas de control adicionales.
- Idioma: no hay declaración de idiomas ni evaluación en castellano; el comportamiento en español depende exclusivamente del base y puede verse alterado por el ajuste de preferencias.
- Contexto: los 32.768 tokens son una capacidad teórica del base; en modelos de este tamaño la calidad se degrada notablemente mucho antes de alcanzar ese límite.
- Sesgos: no evaluados ni documentados. El base hereda los sesgos de los datos de pretratamiento de Qwen2.5 y el DPO puede amplificar sesgos de anotación presentes en el dataset de preferencias, que se desconoce.
- Idoneidad para producción: muy baja. Con 0 descargas, sin evaluación, sin licencia y con un nombre que sugiere un ejercicio académico, no debería usarse como componente crítico de ningún sistema.
- Compatibilidad: al ser un adaptador, requiere la versión exacta del base y una versión de `peft` compatible (el repo declara PEFT 0.18.0). Sin esa combinación, la carga puede fallar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smurgai/hw1-qwen25-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de `peft`: https://github.com/huggingface/peft
- Repositorio de `trl` (implementación de DPO): https://github.com/huggingface/trl
- Artículo citado en las etiquetas del repo (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML referenciada en la model card: https://mlco2.github.io/impact
- Adaptador homónimo de otro autor encontrado en la búsqueda (sin relación verificada): https://huggingface.co/August-GKD/qwen25-dpo-lora-adapter
- Página de despliegue de ese adaptador en FriendliAI (sin relación verificada): https://friendli.ai/models/August-GKD/qwen25-dpo-lora-adapter
- Adaptador similar sobre base de 7B, de otro autor (sin relación verificada): https://huggingface.co/xqjiao/qwen25-7b-instruct-dpo-lora
