# n96j/Rattle-8B-Instruct-LoRA

## Resumen

Rattle-8B-Instruct-LoRA es un adaptador LoRA de tipo QLoRA entrenado por n96j (openadze, una organización brasileña) sobre el modelo base `mistralai/Ministral-3-8B-Instruct-2512`. No es un modelo completo: se distribuye como capa de ajuste (PEFT) que debe cargarse sobre el modelo base de Mistral AI, cuyo peso ronda los 8.000 millones de parámetros. El propósito es dotar al modelo de una personalidad concreta de tipo *roleplay*: una IA brasileña «grossa, mal-humorada y debochada» que insulta levemente al usuario pero que sigue respondiendo correctamente a preguntas serias y que deriva a profesionales en temas de salud mental o riesgo.

El ajuste se realizó en una GPU T4 gratuita de Google Colab con Unsloth, empleando 504 conversaciones en portugués de Brasil del dataset `n96j/rattle-dataset`, con rank y alpha de 16, tasa de aprendizaje 2e-4, dos épocas y una longitud de contexto de entrenamiento de 2048 tokens. Cada conversación se incluyó dos veces, una con *system prompt* y otra sin él, para que el estilo se mantenga en aplicaciones que no envían *system prompt*.

Su relevancia es acotada pero clara: es un ejemplo de bajo coste de personalización de un modelo pequeño con licencia Apache 2.0, útil para quien quiera estudiar técnicas de *persona* con LoRA, reutilizar el adaptador, continuar el entrenamiento o fusionarlo con el base para despliegue. El repositorio es pequeño (0,2 GB), no tiene descargas ni *likes* registrados y está etiquetado únicamente para portugués (`pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA, 4 bits) sobre transformer decoder-only Ministral-3-8B-Instruct |
| Parametros totales | No disponible para el adaptador; modelo base de ~8.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto de entrenamiento); el contexto del base no se especifica en la informacion disponible |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA); existe version GGUF publicada por el autor |
| Idiomas soportados | Portugues de Brasil (`pt`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); GGUF en el repositorio separado |
| Libreria | PEFT (entrenado con Unsloth) |
| Rank / alpha | 16 / 16 |
| Tasa de aprendizaje | 2e-4 |
| Epocas | 2 (~500 pasos) |
| Dataset de entrenamiento | `n96j/rattle-dataset` (504 conversaciones) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Ministral-3-8B-Instruct, un transformer decoder-only de la familia Ministral de Mistral AI. El ajuste se hizo con QLoRA a través de Unsloth, manteniendo el modelo base cuantizado a 4 bits y entrenando únicamente las matrices de bajo rango (rank 16, alpha 16) con tasa de aprendizaje 2e-4 durante dos épocas, aproximadamente 500 pasos, en una T4 de Colab. El contexto de entrenamiento se fijó en 2048 tokens.

El conjunto de datos son 504 conversaciones en portugués de Brasil. La innovación metodológica destacable es la duplicación de cada conversación, una vez con *system prompt* y otra sin él, de modo que el comportamiento de la *persona* se activa incluso en aplicaciones que no envían instrucciones de sistema. El *system prompt* de entrenamiento instruye al modelo a ser grosero, usar palabrotas, negarse o burlarse de preguntas triviales, responder correctamente a preguntas serias, no ayudar con delitos y derivar a profesionales, al CVV (188) o al SAMU (192) en temas de salud o sufrimiento emocional, respondiendo siempre en portugués de Brasil. No se documentan fases de RLHF o DPO ni el volumen de tokens exacto empleado.

## Capacidades

- Generación de texto conversacional en portugués de Brasil con una *persona* concreta: tono grosero, sarcástico y con palabrotas deliberadas.
- Respuesta correcta a preguntas serias pese al registro vulgar, según la intención declarada en el *system prompt* de entrenamiento.
- Comportamiento consistente con y sin *system prompt*, gracias al entrenamiento duplicado de cada conversación.
- Recusación entrenada en temas de salud, sufrimiento emocional, peligro y delitos, con derivación a profesionales, CVV (188) o SAMU (192).
- Adaptación al *chat template* del modelo base mediante `apply_chat_template` del tokenizer de Ministral.
- No se documentan capacidades de *tool calling*, agentes, visión, audio, modo *thinking* ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Prototipado de personajes conversacionales: el adaptador permite cargar una *persona* concreta sobre Ministral en pocos minutos con Unsloth y `load_in_4bit=True`, sin necesidad de reentrenar el modelo completo, lo que lo hace idóneo para pruebas de concepto de *roleplay*.
- Estudio de técnicas de *persona* con LoRA: al ser un adaptador pequeño (0,2 GB) con hiperparámetros documentados (rank 16, alpha 16, 2e-4, 2 épocas), sirve como referencia reproducible para experimentos de ajuste fino de bajo coste en una T4.
- Base para *fine-tuning* adicional: el adaptador puede cargarse sobre Ministral-3-8B-Instruct y continuar el entrenamiento con nuevos datos en portugués, por ejemplo para suavizar el tono o ampliar dominios.
- Fusión con el modelo base para despliegue: el autor indica que el adaptador puede fusionarse para obtener un modelo completo; combinado con la versión GGUF publicada, permite desplegar la *persona* en entornos de inferencia local con llama.cpp u Ollama.
- Experimentación con salvaguardas en modelos de *roleplay*: el *system prompt* de entrenamiento incluye reglas de derivación sanitaria y rechazo de delitos, lo que permite evaluar hasta qué punto un ajuste de personalidad agresivo preserva esos límites.
- Chatbot de entretenimiento en portugués de Brasil: para aplicaciones de ocio dirigidas a público adulto que toleren lenguaje soez, el modelo puede gestionar conversaciones multi-turno dentro de su ventana de 2048 tokens.
- Investigación sobre sesgos y toxicidad: el modelo emplea insultos de forma intencionada, lo que lo convierte en un caso útil para medir clasificadores de toxicidad y estudiar el equilibrio entre estilo y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,2 GB), pero requiere cargar el modelo base Ministral-3-8B-Instruct completo para inferencia.
- Con cuantización a 4 bits, el modelo base más el adaptador ocupan aproximadamente 5-6 GB de VRAM, estimación basada en el tamaño del base y no en mediciones publicadas.
- Entrenamiento validado en una GPU T4 gratuita de Google Colab con QLoRA a 4 bits.
- GPU recomendadas para inferencia: T4, RTX 3090, RTX 4090, A100 o H100; en consumer GPU cabe en tarjetas con al menos 6-8 GB de VRAM en 4 bits.
- Despliegue: Unsloth y PEFT (vía `transformers` 5 o superior, requisito de la familia Ministral 3); para la versión GGUF, llama.cpp u Ollama. No se documenta compatibilidad con vLLM o TGI en la información disponible.
- No se publican datos de latencia ni *throughput*.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rattle-8B-Instruct-LoRA | Adaptador sobre base de ~8B | 2048 (entrenamiento) | Apache 2.0 | safetensors (PEFT) y GGUF | Persona en portugues de Brasil; 504 conversaciones |
| Ministral-3-8B-Instruct (base) | ~8B | No disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista de Mistral AI sin la persona |
| Adaptadores LoRA de roleplay comunitarios sobre Mistral/Ministral | Variable | Variable | Variable | PEFT | No disponible comparativa especifica con datos verificables |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo pequeño y el propio autor advierte que comete errores; no debe usarse como fuente única en decisiones importantes.
- No es psicóloga ni médica; en temas de salud o sufrimiento emocional está entrenada para recusar y derivar a un profesional, al CVV (188) o al SAMU (192).
- El entrenamiento se realizó solo en portugués de Brasil; en otros idiomas el efecto de la *persona* es notablemente más débil.
- Emplea palabrotas e insultos de forma intencionada, lo que lo hace inadecuado para productos dirigidos a público sensible.
- El contexto de entrenamiento es de 2048 tokens, lo que limita conversaciones largas y el razonamiento sobre documentos extensos.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de fidelidad factual.
- Riesgo de sesgos no evaluado: no se publican análisis de sesgo del adaptador ni del dataset.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento tóxico deliberado puede incumplir políticas de plataformas o normativa de protección de menores si se despliega sin filtros.
- El modelo base exige `transformers` 5 o superior; versiones anteriores pueden fallar al cargar la familia Ministral 3.
- El repositorio no registra descargas ni *likes*, por lo que no hay evidencia comunitaria de validación independiente.

## Enlaces

- Hugging Face (adaptador LoRA): https://huggingface.co/n96j/Rattle-8B-Instruct-LoRA
- Version GGUF: https://huggingface.co/n96j/Rattle-8B-Instruct-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/n96j/rattle-dataset
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Unsloth (repositorio): https://github.com/unslothai/unsloth
