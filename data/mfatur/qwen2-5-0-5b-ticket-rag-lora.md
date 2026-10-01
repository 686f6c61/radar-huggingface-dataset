# mfatur/qwen2.5-0.5b-ticket-rag-lora

## Resumen

`mfatur/qwen2.5-0.5b-ticket-rag-lora` es un adaptador LoRA de rango 16 publicado por el usuario mfatur sobre el modelo `Qwen/Qwen2.5-0.5B-Instruct`. No es un modelo completo: se distribuye como pesos PEFT (safetensors) que deben cargarse sobre el modelo base. Su función es actuar como generador de respuestas dentro de un sistema RAG sobre tickets de soporte al cliente: dado un contexto recuperado, responde en una sola frase a preguntas de consulta de campos del ticket y devuelve literalmente `I don't have enough information to answer that.` cuando la información solicitada no está en el contexto.

El interés del adaptador es acotado pero concreto: demuestra que un ajuste LoRA muy barato (2 épocas, aproximadamente 3,4 k ejemplos sintéticos, Transformers + PEFT sin RLHF ni DPO) sobre un modelo de 0,5 B puede llevar una tarea cerrada de extracción desde un 0,47 de acierto hasta 1,00 en el conjunto de prueba con plantilla, y desde un 0,10 hasta 1,00 en la tasa de rechazo de preguntas fuera de alcance. Es un ejemplo reproducible de especialización de un modelo muy pequeño para una única tarea.

La ficha de HuggingFace no documenta licencia, idiomas soportados ni pipeline, y el repositorio no registra descargas ni valoraciones en el momento de la consulta. El propio autor advierte de que el entrenamiento se hizo sobre un dataset sintético de Kaggle y de que la tarea (leer campos de la cabecera del ticket) es fácil, por lo que los resultados no deben extrapolarse a un RAG real con fragmentos de texto libre recuperados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16) sobre un transformer decoder de la familia Qwen2 (modelo base `Qwen2.5-0.5B-Instruct`) |
| Parámetros totales | No disponible para el adaptador (los pesos publicados son únicamente las matrices LoRA; el modelo base tiene del orden de 0,49 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la documentación del adaptador; el modelo base Qwen2.5-0.5B-Instruct declara 32 768 tokens |
| Tipos de cuantización | No disponible; el adaptador se publica en safetensors y puede combinarse con versiones cuantizadas del modelo base (int8, int4, GGUF) |
| Idiomas soportados | No disponible (la única cadena de salida documentada, la negativa a responder, está en inglés) |
| Licencia | No disponible (el modelo base Qwen2.5-0.5B-Instruct es Apache 2.0, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft`) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamaño del repositorio | 0,0 GB (según la ficha de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación / actualización | 2026-09-30 / 2026-09-30 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder denso de la familia Qwen2 con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). El adaptador en sí es un LoRA de rango 16, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base que se entrenan dejando congelados los pesos originales. La documentación no especifica sobre qué módulos concretos (q_proj, k_proj, v_proj, o_proj, mlp) se aplicaron las matrices ni el valor de alpha o dropout.

El entrenamiento se realizó con Transformers y PEFT en su forma estándar, durante 2 épocas sobre aproximadamente 3,4 k ejemplos sintéticos. No se menciona ningún uso de RLHF, DPO, SFT con preferencias ni curriculum. La tarea de entrenamiento consiste en generar respuestas de una sola frase a preguntas de consulta de tickets a partir del contexto recuperado, más el comportamiento de rechazo cuando la información solicitada no aparece en el contexto. No se documentan detalles del dataset de Kaggle empleado, la composición exacta de las plantillas, la longitud de los contextos ni la estrategia de enmascarado de la pérdida.

## Capacidades

- Generación de respuestas de una sola frase a partir de un contexto recuperado (rol de answer generator en un pipeline RAG).
- Extracción de valores concretos de la cabecera de un ticket de soporte (metadatos y campos estructurados) cuando estos aparecen en el contexto.
- Rechazo explícito y consistente ante preguntas fuera de alcance, devolviendo `I don't have enough information to answer that.`
- Comportamiento estable tanto con preguntas generadas por plantilla como con paráfrasis (0,96 de coincidencia de valor y 1,00 de rechazo en el subconjunto parafraseado).
- Capacidad multilingüe: no documentada. El autor no declara idiomas y la única evidencia textual está en inglés.
- Tool calling / function calling: no documentado. No hay ninguna referencia a llamadas a herramientas en la model card.
- Modo de razonamiento extendido (thinking), visión, audio o multimodalidad: no disponibles.
- Comportamiento agéntico o razonamiento multi-paso: no documentado; el caso de uso descrito es de un único paso de generación sobre contexto.
- Capacidad de cómputo de código o matemáticas: no evaluada ni documentada.

## Casos de uso

- Generación de respuestas en un RAG de soporte al cliente: el adaptador ocupa el rol de answer generator, recibe los fragmentos recuperados por el retriever y produce una respuesta corta y directa sobre los campos del ticket. Es adecuado porque está entrenado específicamente para ceñirse al contexto y para no responder cuando el dato no está presente.
- Guardarraíl de alcance en un asistente de soporte: la tasa de rechazo de 1,00 en preguntas fuera de alcance convierte al adaptador en un filtro útil para evitar que el sistema invente respuestas sobre tickets que no puede consultar, derivando esos casos a un agente humano.
- Extracción de metadatos en pipelines de ticketing: dado un contexto con la cabecera del ticket, el modelo devuelve el valor consultado (prioridad, estado, propietario, categoría u otros campos), lo que permite automatizar consultas repetitivas sin escribir reglas ad hoc.
- Prototipado local de un asistente de atención al cliente: al requerir menos de 1 GB de VRAM en fp16, el sistema completo se puede desarrollar y probar en un portátil sin GPU dedicada antes de decidir si merece la pena escalar a un modelo mayor.
- Despliegue on-premise con requisitos de privacidad: al ser un modelo de 0,5 B ejecutable en CPU, encaja en entornos donde los tickets no pueden salir de la infraestructura de la organización (por ejemplo, por requisitos de RGPD) y donde no hay GPU disponible.
- Banco de pruebas para evaluar pipelines RAG: sirve como generador determinista (decodificación greedy) para medir de forma aislada la calidad de la etapa de recuperación, ya que su comportamiento con contexto correcto está caracterizado en la model card.
- Destilación de tareas cerradas hacia modelos minúsculos: el adaptador es un ejemplo reproducible de cómo una tarea de extracción acotada se puede resolver con un modelo de 0,5 B y 2 épocas de entrenamiento, útil como plantilla metodológica para otras tareas de soporte.
- Reducción de coste por consulta en servicios de alto volumen: en escenarios con muchas consultas simples de metadatos, un modelo de este tamaño permite atender peticiones a una fracción del coste de un modelo de mayor tamaño, reservando este último para los casos complejos.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son los de la model card, medidos con decodificación greedy sobre tickets no vistos del conjunto de evaluación:

| Prueba | n | Modelo base | Adaptador LoRA | Métrica |
|---|---|---|---|---|
| Lookup value match (test con plantilla) | 400 | 0,47 | 1,00 | Coincidencia del valor consultado |
| Out-of-scope refusal (test con plantilla) | 52 | 0,10 | 1,00 | Tasa de rechazo correcto |
| Lookup value match (parafraseado) | 50 | 0,50 | 0,96 | Coincidencia del valor consultado |
| Out-of-scope refusal (parafraseado) | 50 | 0,12 | 1,00 | Tasa de rechazo correcto |

Advertencias del propio autor sobre estas cifras: la puntuación baja del modelo base refleja en parte el estilo de respuesta y el límite de 48 tokens de salida impuesto en la evaluación; el rechazo fuera de alcance se probó solo con 5 tipos de pregunta no vistos; y no se evaluaron preguntas sobre descripciones en texto libre ni el uso de extremo a extremo dentro del pipeline RAG con fragmentos realmente recuperados. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark general en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16/bf16: del orden de 1 GB para los pesos, más activaciones y caché KV; en la práctica, un adaptador LoRA de rango 16 añade solo unos pocos megabytes. En int8 baja a aproximadamente 0,5-0,6 GB y en int4 a aproximadamente 0,3-0,4 GB.
- GPU recomendadas: no hay ninguna recomendación publicada por el autor. Por tamaño, el modelo cabe en cualquier GPU con 2-4 GB de VRAM o más, incluidas RTX 3050, RTX 4060, RTX 4090, A100 y H100 (en estas dos últimas el modelo queda enormemente infrautilizado).
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales y en muchas integradas. También es viable en CPU y en placas tipo Raspberry Pi si se convierte a GGUF.
- Opciones de despliegue: la única ruta documentada es `transformers` + `peft` (carga del modelo base con `AutoModelForCausalLM` y del adaptador con `PeftModel.from_pretrained`). vLLM y TGI soportan adaptadores LoRA de forma general, pero el autor no documenta ninguna configuración para ellos. llama.cpp y Ollama requerirían convertir el adaptador a GGUF y fusionarlo con el modelo base, procedimiento que tampoco está documentado en la ficha.
- Latencia y throughput: no se han publicado medidas. Como referencia de orden de magnitud, un modelo de ~0,5 B en fp16 suele ejecutarse a velocidades interactivas en GPU moderna y a velocidades utilizables en CPU; se trata de una estimación basada en el tamaño, no de un dato medido por el autor.

## Comparativa con modelos similares

No existe una categoría estricta de "adaptadores LoRA de 0,5 B para extracción sobre tickets", por lo que la comparación se establece con el modelo base y con alternativas pequeñas de propósito general. Los datos de las alternativas provienen de su documentación pública y no han sido verificados en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en la tarea de tickets |
|---|---|---|---|---|---|
| mfatur/qwen2.5-0.5b-ticket-rag-lora | Adaptador sobre 0,49 B | No disponible (base: 32 768) | No disponible | HuggingFace, 0 descargas | 1,00 / 1,00 (plantilla), 0,96 / 1,00 (paráfrasis) |
| Qwen2.5-0.5B-Instruct (base) | 0,49 B | 32 768 tokens | Apache 2.0 | HuggingFace y múltiples mirrors | 0,47 / 0,10 (plantilla), 0,50 / 0,12 (paráfrasis) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens | Apache 2.0 | HuggingFace | No evaluado en esta tarea |
| Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens | Llama 3.2 Community License | HuggingFace (acceso con aceptación de términos) | No evaluado en esta tarea |
| SmolLM2-360M-Instruct | 0,36 B | 8 192 tokens | Apache 2.0 | HuggingFace | No evaluado en esta tarea |

La ventaja diferencial del adaptador no es su rendimiento general, sino su especialización: consigue una tasa de acierto muy alta en una tarea cerrada con un coste de entrenamiento mínimo. La contrapartida es que no hay evidencia de que conserve capacidades generales de conversación, código o razonamiento tras el ajuste, y que no se ha comparado contra alternativas ajustadas para la misma tarea.

## Limitaciones y advertencias

- Dataset sintético: el entrenamiento usó un dataset sintético de Kaggle con preguntas generadas por plantilla. La distribución de los datos de entrenamiento no refleja el lenguaje real de los usuarios de soporte.
- Tarea intrínsecamente fácil: el propio autor señala que leer campos de la cabecera del ticket es una tarea sencilla, por lo que los resultados no son representativos de tareas de comprensión más complejas.
- No evaluado con texto libre: no se probaron preguntas sobre descripciones en texto libre ni el uso dentro del pipeline RAG con fragmentos realmente recuperados. El rendimiento en producción puede degradarse de forma significativa.
- Cobertura limitada del rechazo: el comportamiento de negativa se validó sobre solo 5 tipos de pregunta no vistos, por lo que la robustez ante entradas fuera de distribución es incierta.
- Sesgos: no hay ningún análisis de sesgos en la información disponible. Al ser un ajuste de un modelo base también pequeño y únicamente sobre datos sintéticos de tickets, no se puede descartar la amplificación de sesgos presentes en el modelo base.
- Alucinación: el adaptador está entrenado para rechazar cuando el dato no está en el contexto, pero no existen pruebas de que este comportamiento se mantenga con contextos largos, ambiguos o contradictorios. En un sistema RAG real sigue siendo necesario verificar las respuestas.
- Licencia: la ficha no declara licencia para el adaptador, lo que impide confirmar las condiciones de uso comercial. La licencia Apache 2.0 del modelo base no se hereda automáticamente de forma clara para los pesos derivados, y el autor no aclara la situación.
- Idiomas: no documentados. Las cadenas de salida y los ejemplos de la model card están en inglés; no hay evidencia de funcionamiento correcto en castellano.
- Madurez del artefacto: 0 descargas, 0 likes, repositorio sin pipeline declarado y creado y actualizado el mismo día. Es un experimento, no un componente listo para producción.
- Sin evaluación end-to-end: el autor no publica métricas del sistema RAG completo (recuperación incluida), por lo que no se puede estimar la calidad final de un asistente construido con este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mfatur/qwen2.5-0.5b-ticket-rag-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Código y pipeline RAG del autor: https://github.com/mfatur/RAG-System
- Paper o publicación técnica del adaptador: no disponible
- Demo o espacio asociado: no disponible
