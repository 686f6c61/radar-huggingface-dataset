# pranthor/titulm-gemma-2b-bengali-lora-medical-qna

## Resumen

El modelo `pranthor/titulm-gemma-2b-bengali-lora-medical-qna` es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo base `hishab/titulm-gemma-2-2b-v1.1`, que a su vez es una versión de `google/gemma-2-2b` con pre-entrenamiento continuo en 4.400 millones de tokens de bengalí. El objetivo de este adaptador es especializar el modelo en tareas de preguntas y respuestas de ámbito médico en lengua bengalí.

El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face y la herramienta Unsloth para optimizar el proceso. El repositorio ocupa 0,4 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no el modelo completo (el base tiene aproximadamente 2.600 millones de parámetros). Aunque el modelo base fue diseñado para mejorar la generación de texto en bengalí, este adaptador lo orienta específicamente hacia consultas médicas, un dominio de alto valor social en regiones donde el bengalí es la lengua principal.

La relevancia de este modelo radica en que aborda dos carencias simultáneas: la escasez de modelos de lenguaje de código abierto optimizados para bengalí y la falta de recursos especializados en dominios verticales como la salud. Al estar basado en Gemma 2, hereda una arquitectura moderna y eficiente, pero con un tamaño contenido que permite su ejecución en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 2B) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido; el modelo base tiene ~2.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma 2 2B soporta 8192 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors, probablemente en fp16 o bf16) |
| Idiomas soportados | Bengali (principal), ingles (heredado del base) |
| Licencia | No disponible (la model card indica "licence: license" sin especificar; el base puede heredar restricciones de Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `hishab/titulm-gemma-2-2b-v1.1` es una version de `google/gemma-2-2b` que fue pre-entrenada de forma continua con 4.400 millones de tokens de texto en bengali, manteniendo el tokenizer original de Gemma 2. La arquitectura Gemma 2 2B emplea atencion por ventana deslizante (sliding window attention) combinada con atencion global en capas alternas, lo que reduce el coste computacional sin sacrificar capacidad de contexto.

Sobre esta base, el autor aplico un adaptador LoRA, una tecnica de fine-tuning eficiente que solo entrena matrices de baja dimension en las capas de atencion y feed-forward. El entrenamiento se realizo con SFT (Supervised Fine-Tuning) utilizando la libreria TRL (Transformers Reinforcement Learning) y Unsloth, que acelera el proceso mediante kernels optimizados. No se proporcionan detalles sobre el dataset medico utilizado, el numero de pasos de entrenamiento ni los hiperparametros del adaptador (rango, alpha, dropout). Tampoco se indica si se aplicaron tecnicas adicionales como RLHF o DPO; el flujo es exclusivamente SFT.

## Capacidades

- Generacion de texto en bengali, especializado en responder preguntas de tematica medica (sintomas, medicamentos, recomendaciones generales).
- Soporte de conversacion multi-turno basica mediante el formato de chat de Gemma (roles user/assistant).
- Capacidad multilingue limitada: el modelo base conserva cierto conocimiento en ingles, pero el adaptador esta orientado casi exclusivamente al bengali.
- No se ha documentado soporte para tool calling, function calling, agentes ni razonamiento multi-paso explicito.
- No incluye capacidades de vision, audio ni otros modos multimodales.

## Casos de uso

- Atencion al paciente en entornos clinicos de Bangladesh o Bengala Occidental: el modelo puede responder preguntas frecuentes sobre sintomas comunes, posologia de medicamentos de venta libre o medidas preventivas, aligerando la carga del personal sanitario.
- Chatbots de salud en aplicaciones moviles: gracias a su tamano reducido (adaptador LoRA sobre 2B), puede integrarse en apps para ofrecer orientacion medica preliminar en bengali.
- Educacion sanitaria comunitaria: generar explicaciones sencillas sobre enfermedades cronicas (diabetes, hipertension) adaptadas al nivel de comprension del publico general.
- Triaje inicial en telemedicina: clasificar la urgencia de los sintomas descritos por el paciente y recomendar si debe acudir a un centro de salud o puede esperar.
- Traduccion de terminologia medica: ayudar a traductores profesionales a encontrar equivalentes precisos en bengali para terminos tecnicos del ingles.
- Asistente para estudiantes de medicina: responder preguntas de repaso sobre fisiologia, farmacologia o patologia en bengali, facilitando el estudio en la lengua materna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como MMLU, HumanEval, GSM8K ni evaluaciones especificas de dominio medico. Tampoco se ofrecen comparativas con otros modelos de Q&A medica en bengali. Por tanto, no es posible cuantificar el rendimiento relativo del modelo.

## Requisitos de hardware

- VRAM estimada: al tratarse de un adaptador LoRA sobre un modelo de 2.6B, la inferencia en fp16 requiere aproximadamente 5-6 GB de VRAM solo para el modelo base. El adaptador anade unos pocos cientos de MB. Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes o GGUF), puede caber en 3-4 GB.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores son suficientes. Para despliegue en servidor, una A10G o L4 es adecuada.
- Despliegue: se puede servir con vLLM o TGI cargando el modelo base y el adaptador LoRA (ambas herramientas soportan este flujo). Tambien es posible convertir el adaptador a formato GGUF para usarlo con llama.cpp u Ollama, aunque el proceso requiere fusionar previamente los pesos.
- Latencia y throughput: no se dispone de mediciones oficiales. En una RTX 4090, se puede esperar una generacion de 50-100 tokens por segundo con batch pequeno, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa. El modelo base `hishab/titulm-gemma-2-2b-v1.1` es la referencia directa, pero sin datos de benchmarks no es posible contrastar resultados. Alternativas teoricas serian:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| pranthor/titulm-gemma-2b-bengali-lora-medical-qna | ~2.6B (base) | No disponible | Medico en bengali | No disponible |
| hishab/titulm-gemma-2-2b-v1.1 | 2.6B | 8192 (heredado) | Generacion general en bengali | No disponible |
| TigerLLM (familia) | Varía (hasta 13B) | No disponible | LLM general en bengali | No disponible |

La comparativa queda limitada por la falta de datos publicos sobre rendimiento y licencias.

## Limitaciones y advertencias

- Sesgo potencial del dataset medico: al no especificarse la procedencia de los datos de entrenamiento, existe riesgo de que el modelo haya aprendido informacion incompleta o desactualizada, o que refleje sesgos culturales o regionales.
- Alto riesgo de alucinacion en informacion medica: un modelo de 2B tiene capacidad limitada para razonamiento complejo y puede generar respuestas plausibles pero incorrectas. Nunca debe utilizarse como sustituto de un profesional sanitario.
- Contexto limitado: la ventana de 8192 tokens del base es suficiente para consultas cortas, pero no para documentos clinicos extensos o historiales completos.
- Idiomas: el modelo esta disenado para bengali; su rendimiento en otros idiomas es muy inferior.
- Licencia incierta: la model card no especifica la licencia. El modelo base puede heredar restricciones de la licencia Gemma (que permite uso comercial con ciertas condiciones), pero al no estar documentado, conviene contactar con el autor antes de usarlo en produccion.
- Sin garantias de seguridad: no se ha realizado una evaluacion de sesgos toxicos ni de robustez ante entradas adversarias. En el dominio medico, esto es especialmente critico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranthor/titulm-gemma-2b-bengali-lora-medical-qna
- Modelo base (hishab/titulm-gemma-2-2b-v1.1): https://huggingface.co/hishab/titulm-gemma-2-2b-v1.1
- Repositorio de desarrollo TituLM: https://github.com/hishab-nlp/titulm
- Paper de TigerLLM (familia de LLMs en bengali): https://arxiv.org/pdf/2503.10995
