# Sepideh2027/PathogenAgentAI-BioGPT-LoRA

## Resumen

PathogenAgentAI-BioGPT-LoRA es un adaptador LoRA (Low-Rank Adaptation) compatible con PEFT que se aplica sobre el modelo base microsoft/biogpt, un transformer generativo de dominio biomédico. Lo desarrolla Sepideh Moafi (usuario Sepideh2027) en el marco del proyecto de software de investigación PathogenAgentAI, y su propósito es adaptar de forma eficiente en parámetros un modelo biomédico preentrenado a tareas de generación de texto condicionada por información de variantes procedente de ClinVar.

El modelo no es un modelo completo, sino un adaptador de bajo rango de aproximadamente 12,6 MB que se carga junto al modelo base. Se ha entrenado con unos 20.000 ejemplos con formato de instrucciones derivados de ClinVar, con una división de 16.000/2.000/2.000 para entrenamiento, validación y prueba, en precisión BF16 y sobre una única GPU NVIDIA T4. La configuración LoRA emplea rango r=16, alpha=32, dropout 0,05 y módulos objetivo q_proj, k_proj, v_proj y o_proj, con tipo de tarea CAUSAL_LM.

Su relevancia actual es doble: por un lado, ejemplifica el flujo de trabajo de ajuste eficiente en parámetros aplicado al ámbito biomédico con recursos muy limitados (una T4); por otro, publica explícitamente sus límites, advirtiendo de que no está validado para uso clínico. Al estar construido sobre BioGPT, hereda las características del modelo base: arquitectura transformer decoder-only de tipo GPT-2 medium, en torno a 347 millones de parámetros y una ventana de contexto de 1.024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base BioGPT, derivado de GPT-2 medium) + adaptador LoRA sobre q_proj, k_proj, v_proj y o_proj |
| Parametros totales | ~347 M en el modelo base microsoft/biogpt; adaptador LoRA de ~12,6 MB. Numero exacto de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (heredada del modelo base BioGPT) |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en BF16); el modelo base admite las cuantizaciones habituales de transformers/GGUF, no confirmadas por el autor |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en microsoft/biogpt, un transformer decoder-only con arquitectura de GPT-2 medium (24 capas, 16 cabezas de atencion, dimension oculta de 1.024 y vocabulario BPE de 42.384 tokens), preentrenado sobre 15 millones de resumenes de PubMed. Sobre esa base, este repositorio añade exclusivamente matrices de bajo rango en las proyecciones de consulta, clave, valor y salida de la atencion, con rango r=16, alpha=32 y dropout 0,05. El tipo de tarea declarado es CAUSAL_LM, es decir, generacion autoregresiva de texto.

El entrenamiento se realizo con precision mixta BF16 y una unica GPU NVIDIA T4, sobre aproximadamente 20.000 ejemplos derivados de ClinVar con formato de instrucciones, divididos en 16.000 ejemplos de entrenamiento, 2.000 de validacion y 2.000 de prueba. La model card no documenta el numero de tokens totales procesados ni la composicion detallada del dataset mas alla de su origen en ClinVar, y no menciona fases de RLHF, DPO o ajuste por preferencias. Tampoco se declara ninguna innovacion de inferencia como decodificacion especulativa o atencion lineal. El framework utilizado es PEFT 0.19.1.

## Capacidades

- Generacion de texto biomedico autoregresiva en ingles, condicionada por instrucciones de estilo ClinVar.
- Continuacion y reformulacion de contenido relacionado con variantes geneticas y literatura biomedica.
- Ejecucion como adaptador PEFT sobre el modelo base, sin necesidad de redistribuir los pesos completos.
- Ajuste eficiente en parametros: al ser un adaptador de ~12,6 MB, permite intercambiar o versionar adaptaciones con un coste de almacenamiento minimo.
- Formato de instrucciones: el entrenamiento con ejemplos instruction-style sugiere cierta capacidad de seguir consignas sencillas, aunque el autor no documenta una plantilla de prompt oficial.
- Soporte de tool calling / function calling: no declarado.
- Soporte de agentes y razonamiento multi-paso: no declarado; la etiqueta "Agent" aparece en recursos relacionados, no como capacidad documentada del modelo.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Extraccion y resumen de informacion de variantes en investigacion genomica: el adaptador puede generar resúmenes en lenguaje natural a partir de descripciones de variantes ClinVar, util como paso de preprocesado en pipelines internos de anotacion donde despues se valida contra la fuente original.
- Prototipado rapido de asistentes de literatura biomedica: dado su tamano (~347 M de parametros mas adaptador), se puede desplegar en una sola GPU pequena para experimentar con interfaces conversacionales de dominio biomedico antes de escalar a modelos mayores.
- Generacion aumentada de datos sinteticos: sirve para producir borradores de texto biomedico que, tras revision humana, alimenten otros experimentos de ajuste o aumenten datasets escasos.
- Reproducibilidad de investigacion en PEFT: su configuracion LoRA explicita (r=16, alpha=32, dropout 0,05) y su division de datos documentada lo convierten en un caso de referencia para replicar experimentos de ajuste eficiente en el dominio biomedico.
- Experimentacion docente: permite ilustrar en cursos y laboratorios como adaptar un modelo fundacional biomedico con una unica GPU T4 y un adaptador de pocos megabytes.
- Integracion en herramientas de investigacion tipo PathogenAgentAI: como componente de generacion de lenguaje en un sistema mayor de analisis de patogenos, siempre con verificacion externa de las afirmaciones generadas.
- Clasificacion y etiquetado asistido de textos clinicos (no clinico): apoyo a la anotacion manual de documentos, generando propuestas que un especialista revisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion especifica en tareas biomedicas (por ejemplo, PubMedQA o MedQA), y la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo.

## Requisitos de hardware

- VRAM para inferencia: el modelo base en BF16 ocupa aproximadamente 0,7 GB de pesos, por lo que la inferencia cabe holgadamente en menos de 2 GB de VRAM sumando activaciones y cache KV; en FP32 serian alrededor de 1,4 GB. El adaptador anade unos 12,6 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor entreno con una NVIDIA T4. No se requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual (serie RTX 30/40, e incluso integradas con suficiente memoria compartida) y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers junto con PEFT es la via documentada por el autor (`AutoModelForCausalLM.from_pretrained("microsoft/biogpt")` + `PeftModel.from_pretrained(...)`). El soporte en vLLM, TGI, llama.cpp u Ollama no esta confirmado y, dado que BioGPT no es una arquitectura GPT-2 estandar en todos los runners, no se puede asumir sin verificar; requeriria conversion a GGUF en el caso de llama.cpp.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PathogenAgentAI-BioGPT-LoRA | ~347 M (base) + adaptador LoRA | 1.024 tokens | Adaptador PEFT sobre modelo biomedico | MIT | HuggingFace |
| microsoft/biogpt (base) | ~347 M | 1.024 tokens | Transformer decoder-only biomedico | MIT | HuggingFace |
| BioMistral-7B | ~7 B | 8.192 tokens | LLM biomedico (base Mistral) | Apache 2.0 | HuggingFace |
| Meditron-7B | ~7 B | 4.096 tokens | LLM medico (base Llama 2) | Licencia Llama 2 | HuggingFace |

Nota: los datos de los modelos comparables externos se han tomado de sus model cards publicas y deben verificarse antes de citarlos. La comparacion directa no es homogenea, ya que este repositorio es un adaptador, no un modelo completo, y no publica metricas de evaluacion que permitan contrastar rendimiento.

## Limitaciones y advertencias

- No validado para uso clinico: el autor indica explicitamente que no debe emplearse para diagnostico, decisiones de tratamiento ni uso clinico directo.
- Hereda todas las limitaciones del modelo base BioGPT, incluida su tendencia a generar afirmaciones plausibles pero incorrectas en contextos biomedicos.
- Riesgo de alucinacion: los resultados deben verificarse de forma independiente contra fuentes biomedicas autorizadas; la model card lo recomienda de forma explicita.
- Sesgos: no se documenta ningun analisis de sesgos del adaptador ni del modelo base. El entrenamiento se limita a datos derivados de ClinVar, lo que puede sesgar el modelo hacia ese tipo de contenido.
- Cobertura idiomatica: solo ingles, lo que limita su uso en castellano sin trabajo adicional.
- Ventana de contexto reducida: 1.024 tokens, insuficiente para documentos biomedicos largos o conversaciones multi-turno extensas.
- Alcance del ajuste limitado: se desconoce la composicion exacta del dataset de instrucciones y no hay evaluacion publicada de su calidad.
- Licencia permisiva (MIT), por lo que no hay restricciones de uso comercial declaradas; conviene, no obstante, comprobar la licencia del modelo base y de los datos de ClinVar empleados.
- Repositorio con muy poca adopcion (23 descargas, 0 likes) y sin pipeline declarado, lo que reduce la trazabilidad y el soporte de la comunidad.
- En produccion, tratarlo como componente experimental: requiere envoltorio de validacion, control de versiones del adaptador y monitorizacion de salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sepideh2027/PathogenAgentAI-BioGPT-LoRA
- Modelo base: https://huggingface.co/microsoft/biogpt
- Modelo ajustado relacionado: Sepideh2027/biogpt-clinvar-finetuned (referenciado en la model card, URL directa no disponible)
- Dataset de instrucciones relacionado: Sepideh2027/Agent (referenciado en la model card, URL directa no disponible)
- Publicacion: BioGPT-ClinVar: Parameter-Efficient Fine-Tuning of a Biomedical Foundation Model. Research Square, 2026. DOI: 10.21203/rs.3.rs-10196893/v1
- GitHub del autor: AIResearcher20 (referenciado en la model card, URL directa no disponible)
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron paginas de Pinterest, sin relacion con el modelo.
