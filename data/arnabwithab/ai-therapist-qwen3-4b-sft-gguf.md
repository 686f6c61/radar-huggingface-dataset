# arnabwithab/ai-therapist-qwen3-4b-sft-gguf

## Resumen

ai-therapist-qwen3-4b-sft-gguf es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario arnabwithab y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está especializado en conversaciones de orientación psicológica y salud mental, entrenado sobre dos conjuntos de datos públicos de counselling: CounselChat y el dataset de conversaciones de consejería de Amod. Se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M, lo que lo hace directamente utilizable en llama.cpp, Ollama, LM Studio y Jan.

El modelo cuenta con 4.022.468.096 parámetros (aproximadamente 4B) y hereda la arquitectura transformer de la familia Qwen3, con una ventana de contexto que no se especifica en la información disponible. Su relevancia radica en ser un ejemplo de especialización de bajo coste mediante QLoRA sobre un modelo instructivo moderno, orientado a un dominio sensible donde la calidad de la respuesta y las salvaguardas son críticas. El repositorio ocupa 2,5 GB y acumula 18 descargas desde su publicación el 26 de octubre de 2026.

Se trata de un modelo de nicho, con muy poca adopción y sin métricas de evaluación publicadas en la información disponible. El autor incluye un aviso explícito de que no es un terapeuta y que sus salidas no deben tratarse como asesoramiento profesional verificable, lo que condiciona cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), ajuste fino SFT sobre Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se publican otras variantes |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo qwen3-4b-sft-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4B parámetros de la familia Qwen3. Sobre esta base se aplicó un ajuste fino supervisado (SFT) mediante QLoRA con la librería Unsloth durante 5 épocas, tras lo cual el adaptador se fusionó con los pesos base y se exportó a GGUF con cuantización Q4_K_M usando las herramientas de llama.cpp. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT.

Los datos de entrenamiento provienen de dos fuentes públicas de conversaciones de consejería: nbertagnolli/counsel-chat y Amod/mental_health_counseling_conversations. No se especifican técnicas adicionales como decodificación especulativa, atención lineal ni modos de razonamiento extendido; el modelo hereda las características del base, pero la model card no las detalla. La configuración de muestreo empleada en las evaluaciones del autor es temperatura 0,7 y top_p 0,8.

## Capacidades

- Generación de texto conversacional orientada a diálogo de apoyo psicológico y consejería.
- Respuestas multi-turno en inglés sobre temas de ansiedad, estrés, sueño y bienestar emocional.
- Estilo de respuesta empático derivado del ajuste fino sobre datos de counsel-chat.
- Ejecución local eficiente gracias al formato GGUF Q4_K_M y al tamaño de 4B parámetros.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Prototipado de asistentes conversacionales de apoyo emocional: el modelo puede mantener diálogos multi-turno en inglés sobre ansiedad o estrés, útil para validar interfaces de chat antes de invertir en modelos mayores o en supervisión clínica.
- Investigación académica sobre SFT en dominios sensibles: sirve como caso reproducible de ajuste QLoRA sobre Qwen3-4B con datasets públicos de consejería, comparando metodologías de especialización.
- Evaluación de salvaguardas en modelos de salud mental: permite estudiar cómo responde un SLM especializado ante prompts delicados y diseñar filtros o políticas de derivación a profesionales.
- Despliegue local en entornos con recursos limitados: al ocupar 2,5 GB en Q4_K_M, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, útil para demos offline.
- Generación de material de formación supervisada: puede producir borradores de respuestas de consejería que un profesional revise y corrija, acelerando la creación de datasets anotados.
- Integración en herramientas de bienestar laboral o educativas como primer nivel de escucha activa, siempre con derivación explícita a recursos profesionales y sin sustituir la intervención humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un arnés de evaluación en su repositorio de GitHub, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni métricas específicas de counselling en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 a 3 GB con la cuantización Q4_K_M incluida; en FP16 serían necesarios unos 8 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) puede ejecutarlo con holgura; en A100 o H100 el modelo queda infrautilizado salvo en despliegues por lotes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU modernas con 4 GB o más, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, Jan y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo servidor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ai-therapist-qwen3-4b-sft-gguf | 4,02B | No disponible | Apache 2.0 | GGUF Q4_K_M | SFT en consejería, solo inglés, 18 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Modelo generalista instructivo, multilingüe |
| Modelos de counselling de la colección Counselling SLMs | Variable | No disponible | No disponible | No disponible | Misma colección del autor; sin datos de rendimiento publicados |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no es un terapeuta y que sus salidas no constituyen asesoramiento profesional verificable; no debe usarse como sustituto de atención clínica.
- Riesgo elevado de alucinación y de respuestas inapropiadas en situaciones de crisis (ideación suicida, autolesiones), sin que se documenten salvaguardas específicas.
- Sesgos potenciales heredados de los datasets de consejería y del modelo base, no evaluados en la información disponible.
- Soporte exclusivo de inglés; no apto para usuarios hispanohablantes sin traducción intermedia.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas con garantías.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones clínicas y de gobernanza de datos hace desaconsejable su despliegue en producción sanitaria sin auditoría externa.
- Adopción muy baja (18 descargas, 0 likes) y sin mantenimiento documentado más allá de la actualización del 31 de octubre de 2026.
- Cuantización única Q4_K_M: no hay variantes de mayor precisión publicadas en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnabwithab/ai-therapist-qwen3-4b-sft-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Colección Counselling SLMs: https://huggingface.co/collections/arnabwithab/counselling-slms-6ad06ab0ca4ce4cf5ceb5ca4
- Repositorio de código y arnés de evaluación: https://github.com/arnabwithab/ai-therapist
- Dataset CounselChat: https://huggingface.co/datasets/nbertagnolli/counsel-chat
- Dataset Amod mental health counseling conversations: https://huggingface.co/datasets/Amod/mental_health_counseling_conversations
