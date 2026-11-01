# lonegeekranger/taller-destilacion

## Resumen

Taller de destilación es un adaptador LoRA publicado por lonegeekranger sobre el modelo base SmolLM2-360M-Instruct de Hugging Face. Se trata de un experimento educativo de ajuste fino supervisado (SFT) orientado a que el modelo explique conceptos de inteligencia artificial generativa en español a ejecutivos de empresas chilenas. El adaptador añade 8.683.520 parámetros entrenables en FP32 (aproximadamente 34,8 MB) sobre un transformer decoder de 360 millones de parámetros totales.

El problema que aborda es acotado: adaptar un modelo pequeño ya instruido a un dominio y registro concretos (divulgación de IA generativa para público no técnico hispanohablante) mediante respuestas sintéticas generadas por un profesor LLM a través de la API de OpenAI. La relevancia es metodológica más que de rendimiento: documenta de forma transparente un flujo completo de destilación de conocimiento con LoRA, incluyendo la separación entre conjunto de entrenamiento y examen, y publica los resultados negativos sin maquillarlos.

El autor advierte explícitamente de que la calidad es baja: el modelo obtuvo 2,08/10 de nota media en un examen de 12 preguntas, sin ninguna respuesta aprobada (umbral de 7/10). Puede inventar definiciones y generar texto incoherente. No está pensado para asesoramiento ni para decisiones de negocio, sino para estudiar los resultados y limitaciones de un experimento de ajuste fino de pequeño alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base SmolLM2-360M-Instruct) con adaptador LoRA |
| Parametros totales | 360M en el modelo base; 8.683.520 en el adaptador LoRA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; el adaptador se publica en FP32 y el ejemplo de uso emplea FP32 |
| Idiomas soportados | Espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json (PEFT) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Libreria | PEFT (Transformers) |
| Version de referencia | PyTorch 2.14.1, Transformers 5.18.0, PEFT 0.21.2 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder de 360 millones de parámetros. El entrenamiento congela el modelo base y solo actualiza los pesos LoRA (rango 16, alpha 32, dropout 0,05) en los módulos de atención (q_proj, k_proj, v_proj, o_proj) y de la MLP (gate_proj, up_proj, down_proj). Es, por tanto, un ajuste fino de bajo rango estándar, sin innovaciones arquitectónicas propias.

La procedencia de los datos es sintética: el taller genera preguntas y respuestas mediante la API de OpenAI y entrena únicamente sobre las respuestas, excluyendo los tokens de la pregunta de la función de pérdida. Los archivos locales documentan 60 ejemplos de entrenamiento, 12 de examen y 45 pasos repartidos en 3 épocas. Los temas cubren fundamentos de LLM, prompts, RAG, agentes, ajuste fino y evaluación/LLMOps. La pérdida de entrenamiento por lote pasó de 2,7293 en el primer paso a 2,032 en el último, un dato que el autor advierte que no mide generalización.

El autor reconoce que no se guardó un manifiesto completo de la configuración efectiva ni el identificador exacto del profesor/juez empleado, por lo que no se afirma reproducibilidad exacta del entrenamiento. Los datos, el código del taller y los registros no forman parte del paquete publicado, que es un paquete mínimo con solo el adaptador, la configuración y la licencia.

## Capacidades

- Generación de texto en español sobre conceptos de IA generativa: fundamentos de LLM, prompts, RAG, agentes, ajuste fino y evaluación/LLMOps.
- Formato conversacional con plantilla de chat (system/user) heredado del modelo base.
- Ajuste al registro divulgativo para audiencias ejecutivas no técnicas, objetivo declarado del entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al español según la metadata; el modelo base tiene cobertura multilingüe, pero el adaptador se entrenó solo en español.
- Calidad efectiva muy baja: 2,08/10 de media en el examen de 12 preguntas, sin respuestas aprobadas.

## Casos de uso

- Estudio de flujos de destilación con LoRA: sirve como referencia reproducible a nivel de configuración (rango, alpha, módulos objetivo, exclusión de tokens de pregunta en la pérdida) para quien quiera montar un taller didáctico de ajuste fino supervisado sobre un modelo de 360M.
- Docencia sobre evaluación de modelos: el par de métricas publicado (nota media del juez y respuestas con nota ≥ 7) permite ilustrar por qué 12 preguntas no bastan para demostrar mejora generalizable y por qué conviene auditar al juez LLM.
- Análisis de resultados negativos en ajuste fino: el caso documenta un escenario real en el que el adaptador mejora la nota media de 1,25 a 2,08 pero sigue sin aprobar ninguna respuesta, útil para discutir cuándo un SFT pequeño no es suficiente.
- Pruebas de compatibilidad de tooling PEFT: el ejemplo verificado con PyTorch 2.14.1, Transformers 5.18.0 y PEFT 0.21.2 sirve para validar entornos de carga de adaptadores sobre SmolLM2 en CPU y FP32.
- Experimentación con datos sintéticos generados por API: el flujo de generación de preguntas y respuestas con un profesor LLM y entrenamiento solo sobre las respuestas es replicable como plantilla para talleres de bajo presupuesto.
- Demostración de limitaciones de modelos pequeños en dominio especializado: la prueba adicional en la que el modelo inventó el significado de LoRA es un ejemplo concreto de alucinación en un modelo de 360M ajustado con 60 ejemplos.

## Benchmarks y rendimiento

Resultados publicados por el autor a partir de los registros locales del examen (12 preguntas, juez LLM comparando con referencia y valorando corrección, completitud y claridad):

| Metrica | Modelo base | Con adaptador |
|---|---:|---:|
| Nota media del juez (escala 1-10) | 1,25 | 2,08 |
| Respuestas con nota >= 7 | 0/12 | 0/12 |
| Perdida de entrenamiento (primer paso) | No aplica | 2,7293 |
| Perdida de entrenamiento (ultimo paso) | No aplica | 2,032 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que no hay auditoría humana documentada del juez, ni intervalos de confianza, ni evaluación externa, y que el examen no incluye preguntas del tema evaluación/LLMOps.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en FP32 ocupa unos 34,8 MB; el modelo base de 360M en FP32 requiere aproximadamente 1,4 GB solo para pesos, más overhead de activaciones y KV cache.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores; también en CPU.
- El ejemplo de la model card se ejecuta en CPU y FP32, sin requisitos de GPU.
- GPU recomendadas para mayor throughput: RTX 4090, A100 o H100, aunque están sobredimensionadas para este tamaño; una RTX 3060 es suficiente.
- Opciones de despliegue: Transformers + PEFT según el ejemplo oficial. No se documenta compatibilidad verificada con vLLM, llama.cpp, Ollama ni TGI; el adaptador es PEFT y requeriría fusión con el modelo base para muchos de esos runners.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Calidad documentada |
|---|---|---|---|---|---|
| Taller de destilación (este) | 360M + 8,68M LoRA | No disponible | Apache 2.0 | Adaptador LoRA educativo en español | 2,08/10 en examen propio de 12 preguntas |
| SmolLM2-360M-Instruct (base) | 360M | No disponible en la informacion proporcionada | Apache 2.0 | Modelo instructivo generalista | 1,25/10 en el mismo examen |
| SmolLM2-1.7B-Instruct | 1,7B | No disponible en la informacion proporcionada | Apache 2.0 | Modelo instructivo generalista de mayor tamano | No evaluado en este examen |
| Alternativas de adaptadores LoRA en español para divulgacion de IA | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación más directa es con su propio modelo base, ya que el adaptador solo se diferencia por los pesos LoRA y el resto de capacidades se heredan. No se dispone de datos de benchmarks estandar para situarlo frente a modelos de tamaño similar.

## Limitaciones y advertencias

- Calidad muy baja declarada por el autor: 2,08/10 de nota media y 0/12 respuestas aprobadas en el examen propio.
- Riesgo alto de alucinación: en una prueba adicional el modelo inventó el significado de LoRA.
- Puede generar texto incoherente y definiciones incorrectas; no es apto para asesoramiento ni para decisiones de negocio.
- Evaluación insuficiente: 12 preguntas no permiten demostrar mejora generalizable; no hay auditoría humana del juez, ni intervalos de confianza, ni evaluación externa.
- El examen no cubre el tema evaluación/LLMOps, por lo que la cobertura temática evaluada es parcial.
- Sesgos: no documentados en la informacion proporcionada; el entrenamiento con 60 ejemplos sintéticos de un profesor LLM puede heredar sesgos de ese profesor, pero no se detalla.
- Limitación de idioma: entrenado solo en español; no se garantiza calidad en otros idiomas.
- Reproducibilidad no garantizada: no se guardó el manifiesto completo de configuración efectiva ni el identificador exacto del profesor/juez; los datos, el código y los registros no se publican.
- Licencia Apache 2.0 para el adaptador, pero los datos de entrenamiento son sintéticos y proceden de la API de OpenAI; la licencia del adaptador no sustituye los términos del proveedor de esos datos.
- No implica respaldo de Hugging Face ni de OpenAI.
- El paquete publicado es mínimo (adaptador, configuración, README y licencia); requiere descargar el modelo base y el tokenizador por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lonegeekranger/taller-destilacion
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Terminos de servicio de OpenAI (aplicables a los datos sinteticos): https://openai.com/policies/services-agreement/
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
