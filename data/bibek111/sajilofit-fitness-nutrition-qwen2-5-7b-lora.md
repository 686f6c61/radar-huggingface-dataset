# Bibek111/sajilofit-fitness-nutrition-qwen2.5-7b-lora

## Resumen

SajiloFit AI es un adaptador LoRA de ajuste fino por instrucciones construido sobre el modelo Qwen/Qwen2.5-7B-Instruct y publicado por el usuario Bibek111. No es un modelo independiente: el repositorio contiene unicamente los pesos del adaptador (0,1 GB en safetensors, libreria PEFT), por lo que para usarlo es obligatorio cargar primero el modelo base y despues acoplar el adaptador mediante PEFT. Su dominio objetivo es el fitness y la nutricion general, con un enfasis explicito en la creacion de rutinas, la tecnica de ejercicios, la progresion y la recuperacion, el respeto de restricciones del usuario y el manejo de alergias alimentarias.

El interes tecnico del proyecto no esta en la arquitectura, heredada integramente de Qwen2.5-7B-Instruct (transformer decoder-only de 7 610 millones de parametros y hasta 131 072 tokens de contexto en el modelo base), sino en el comportamiento que el autor afirma haber reforzado: fidelidad a los valores verificados, no invencion de resultados de backend ni de diagnosticos medicos, modificacion parcial de planes existentes en lugar de reescrituras completas y derivacion a atencion de urgencia ante sintomas de alarma. La model card incluye un system prompt de referencia del que dependen buena parte de estas conductas.

Se trata de un artefacto muy reciente y sin validacion externa: registra 0 descargas y 0 likes en el momento de la consulta, no publica resultados de benchmarks ni detalles del dataset de entrenamiento, y su licencia no esta declarada. Es util, por tanto, como caso de estudio de ajuste fino de dominio en el ambito salud-fitness, pero exige evaluacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con adaptador LoRA acoplado; el adaptador no modifica la arquitectura del modelo base |
| Parametros totales | 7 610 millones en el modelo base (Qwen2.5-7B-Instruct); el adaptador LoRA ocupa 0,1 GB de pesos |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 131 072 tokens en el modelo base (32 768 nativos, ampliables con YaRN); no especificada de forma independiente para el adaptador |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar; el autor recomienda cargar el modelo base en 4-bit NF4 con doble cuantizacion (bitsandbytes, compute dtype fp16) |
| Idiomas soportados | Ingles (en), unico idioma declarado |
| Licencia | No disponible (la del modelo base Qwen2.5-7B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct (no incluido en el repositorio) |
| Metodo de ajuste | LoRA / QLoRA (etiquetas del repositorio); rango, alpha y modulos objetivo no disponibles |
| Libreria y framework | PEFT sobre Transformers, con accelerate y bitsandbytes |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-7B-Instruct, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query grouping (GQA), preentrenado por Alibaba Qwen sobre aproximadamente 18 billones de tokens y posteriormente alineado por instrucciones. El repositorio no incluye el modelo base: la ruta de ejecucion documentada es cargar Qwen2.5-7B-Instruct (recomendado en 4-bit NF4 para GPUs de 16 GB como la Tesla T4), instanciar PeftModel.from_pretrained sobre el adaptador y ejecutar la inferencia con la plantilla de chat de Qwen.

Sobre el proceso de ajuste, la model card solo indica que se empleo ajuste fino eficiente en parametros (LoRA/QLoRA) y enumera las areas en las que se centro el desarrollo y la evaluacion: creacion de rutinas, guia de tecnica, progresion y recuperacion, seguimiento de restricciones, preservacion del perfil del usuario, modificacion de planes, manejo de informacion ausente, preservacion de valores verificados, veracidad respecto al estado del backend, razonamiento nutricional general, restricciones por alergias alimentarias y guia de seguridad proporcionada. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el rango del adaptador, los modulos objetivo, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado: todos estos datos deben considerarse no disponibles. La etiqueta "qlora" sugiere entrenamiento sobre el modelo base cuantizado en 4 bits, pero el autor no lo detalla.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (roles system/user/assistant).
- Creacion de rutinas de entrenamiento con ejercicios, series, repeticiones, duracion, descansos y progresion cuando el usuario los solicita.
- Modificacion incremental de planes de entrenamiento existentes, aplicando solo los cambios pedidos en lugar de reescribir el plan completo.
- Guia de tecnica de ejercicios y recomendaciones de progresion y recuperacion.
- Razonamiento nutricional general y aplicacion de restricciones alimentarias, incluidas alergias.
- Seguimiento estricto de restricciones explicitas del usuario y priorizacion de la informacion corregida sobre la contradictoria previa.
- Formulacion de una unica pregunta breve cuando falta informacion esencial, en lugar de rellenar huecos con suposiciones.
- Preservacion literal de valores verificados proporcionados por el usuario y abnegacion a inventar resultados de backend, valores nutricionales, diagnosticos medicos o hallazgos de analisis de video.
- Guia de seguridad proporcionada con derivacion de sintomas de alarma a atencion de urgencia.
- Soporte de tool calling / function calling: no documentado para el adaptador. El modelo base Qwen2.5-7B-Instruct si soporta function calling, pero la model card no lo menciona ni lo evalua tras el ajuste.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible; el adaptador es exclusivamente de texto.

## Casos de uso

- Asistente de fitness en aplicacion movil: el adaptador puede gestionar conversaciones multi-turno en las que el usuario define objetivos, disponibilidad y material, y el modelo devuelve rutinas acotadas a esas restricciones. La ventana de 131 072 tokens del modelo base permite arrastrar el historial completo de la conversacion y el perfil del usuario sin truncar.
- Mantenimiento evolutivo de planes de entrenamiento: cuando el usuario pide cambiar solo un dia o un ejercicio, el comportamiento entrenado evita regenerar el plan completo, lo que reduce el riesgo de perder ajustes previos y facilita el versionado del plan en base de datos.
- Guia de tecnica y prevencion de lesiones: respuestas centradas en ejecucion de ejercicios, progresion de cargas y pautas de recuperacion, con derivacion a profesionales sanitarios cuando aparecen sintomas de alarma.
- Filtrado de recomendaciones dieteticas por alergias: el modelo recibe la lista de alergias como restriccion explicita y debe respetarla al proponer alimentos o sustituciones, sin inventar valores nutricionales que no se le hayan facilitado.
- Capa conversacional sobre un backend de datos de fitness: al estar entrenado para no fabricar resultados de backend, encaja como interfaz de lenguaje natural sobre una API que aporta metricas reales (peso, repeticiones, calorias) y que el modelo solo debe reformular y contextualizar.
- Triage y educacion en salud preventiva: respuestas proporcionadas en alcance, con lenguaje no diagnostico y escalado explicito a urgencias ante senales de riesgo, util en asistentes de bienestar que no pueden emitir diagnostico medico.
- Generacion de contenido para entrenadores personales: borradores de rutinas y explicaciones de ejercicios que el profesional revisa y firma, aprovechando la estructura de series, repeticiones y descansos que el ajuste refuerza.
- Caso de estudio de ajuste fino de dominio: por su tamano reducido (0,1 GB) y su naturaleza de adaptador PEFT, sirve para reproducir experimentos de LoRA/QLoRA sobre Qwen2.5-7B-Instruct en GPUs de gama media, comparando comportamientos antes y despues del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones especificas de fitness o nutricion), y el repositorio no referencia ningun informe de evaluacion, conjunto de validacion ni comparativa con el modelo base.

## Requisitos de hardware

- VRAM en 4-bit NF4 (configuracion recomendada por el autor): aproximadamente 4,5 GB solo en pesos del modelo base de 7 610 millones de parametros, mas overhead de CUDA, cache KV y activaciones; en la practica, entre 6 y 8 GB para contextos moderados.
- VRAM en fp16/bf16 sin cuantizar: en torno a 15,2 GB de pesos mas activaciones y cache, lo que situa el requisito por encima de 18 GB.
- El adaptador anade un consumo marginal: el repositorio completo ocupa 0,1 GB y los pesos LoRA se suman a los del modelo base en memoria.
- GPU recomendadas por el autor: Tesla T4 (16 GB) con cuantizacion 4-bit NF4 y doble cuantizacion, segun el ejemplo de la model card. Para fp16 son necesarias A100 (40/80 GB), H100 o GPUs con 24 GB o mas.
- Cabe en GPU de consumo: si, en configuracion 4-bit, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En fp16 solo en tarjetas de 24 GB como la RTX 3090 o la RTX 4090, con margen ajustado.
- Opciones de despliegue documentadas: Transformers + PEFT + bitsandbytes + accelerate, tal como aparece en la model card (entornos CUDA, Kaggle o Google Colab).
- Opciones de despliegue adicionales (no documentadas por el autor, viables tecnicamente): fusion del adaptador con `merge_and_unload` y conversion posterior a GGUF para llama.cpp u Ollama; servidores de inferencia con soporte de adaptadores LoRA en caliente, como vLLM con `--enable-lora` o TGI con adapters.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni comportamiento bajo batching.

## Comparativa con modelos similares

No se dispone de benchmarks del adaptador, por lo que la comparacion se limita a las caracteristicas del modelo base y a alternativas de la misma categoria de tamano. Los datos de los modelos base provienen de su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| SajiloFit AI (este modelo) | 7 610 M (base) + adaptador LoRA | 131 072 tokens (base) | No disponible | Adaptador PEFT en HuggingFace; requiere el modelo base | No publicado |
| Qwen2.5-7B-Instruct (modelo base sin ajustar) | 7 610 M | 131 072 tokens | Apache 2.0 | Pesos completos en HuggingFace | Documentado por Alibaba Qwen; no reproducido aqui |
| Llama-3.1-8B-Instruct | 8 030 M | 131 072 tokens | Licencia comunitaria de Llama 3.1 | Pesos completos en HuggingFace | Documentado por Meta; no reproducido aqui |
| Mistral-7B-Instruct-v0.3 | 7 250 M | 32 768 tokens | Apache 2.0 | Pesos completos en HuggingFace | Documentado por Mistral AI; no reproducido aqui |

La diferencia funcional frente a estas alternativas no es de capacidad bruta, sino de comportamiento en el dominio fitness-nutricion (respeto de restricciones, edicion parcial de planes, no invencion de datos). No hay evidencia publicada que cuantifique esa mejora frente al modelo base.

## Limitaciones y advertencias

- No es un modelo autonomo: intentar cargarlo con `AutoModelForCausalLM.from_pretrained` sobre el identificador del adaptador falla o produce resultados incorrectos. Es obligatorio cargar Qwen/Qwen2.5-7B-Instruct y acoplar despues el adaptador con PEFT.
- Inconsistencia de identificadores en la propia model card: el codigo de ejemplo referencia `Bibek111/sajilofit-qwen2.5-7b-final-lora`, mientras que el repositorio publicado es `Bibek111/sajilofit-fitness-nutrition-qwen2.5-7b-lora`. Hay que verificar la ruta correcta antes de desplegar.
- Licencia no declarada: al no especificarse licencia para el adaptador, no puede asumirse uso comercial permitido. La licencia Apache 2.0 del modelo base no cubre automaticamente los pesos derivados del ajuste.
- Idioma unico: solo ingles declarado. No hay evidencia de calidad en castellano ni en otros idiomas, y el ajuste de dominio puede haber degradado capacidades multilingues del modelo base.
- Ambito salud-fitness: el modelo puede generar recomendaciones de ejercicio y nutricion, pero no es un dispositivo medico ni sustituye a un profesional. Existe riesgo de dano si se usa sin supervision en poblaciones con patologias, embarazo, lesiones o trastornos de la conducta alimentaria.
- Riesgo de alucinacion: aunque el ajuste busca evitar la invencion de valores nutricionales, diagnosticos y resultados de backend, no existe evaluacion publicada que cuantifique la tasa de alucinacion ni la fidelidad a restricciones.
- Dependencia del system prompt: el autor indica que el comportamiento previsto se desarrollo en torno a un prompt de sistema concreto. Omitirlo o modificarlo puede degradar el seguimiento de restricciones y las garantias de seguridad descritas.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros, sin evaluaciones reproducibles y sin historial de versiones.
- Sin datos de entrenamiento: se desconoce la procedencia del dataset de ajuste, su licencia y si contiene datos personales o material con derechos de autor, lo que dificulta la auditoria y el cumplimiento normativo.
- Degradacion potencial del modelo base: el ajuste de dominio puede reducir el rendimiento en tareas generales (codigo, matematicas, razonamiento abstracto) y no se documenta ninguna evaluacion de olvido catastrofico.
- La model card esta truncada: el primer ejemplo de inferencia (creacion de rutina de tres dias) aparece incompleto en la informacion disponible.
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo: los resultados obtenidos correspondian a foros sin relacion con el proyecto y no se han incluido.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Bibek111/sajilofit-fitness-nutrition-qwen2.5-7b-lora
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper o informe tecnico de Qwen2.5: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o espacio de HuggingFace: no disponible
- Blog del autor o documentacion adicional del proyecto SajiloFit: no disponible
- Resultados de benchmarks o evaluaciones: no disponibles
