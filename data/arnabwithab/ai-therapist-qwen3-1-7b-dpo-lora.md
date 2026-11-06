# arnabwithab/ai-therapist-qwen3-1.7b-dpo-lora

## Resumen

ai-therapist-qwen3-1.7b-dpo-lora es un adaptador LoRA de ajuste fino por DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario arnabwithab dentro de su coleccion "Counselling SLMs". El adaptador esta especializado en conversaciones de orientacion psicologica y salud mental en ingles, y se entrena sobre el dataset PsyCoPref, un corpus de preferencias terapeuticas. Se publica bajo licencia Apache 2.0 y con un tamano de repositorio de aproximadamente 0,1 GB, coherente con un adaptador PEFT y no con un modelo completo.

El modelo resuelve el problema de adaptar un modelo pequeno de 1.700 millones de parametros a un dominio sensible como el consejo psicologico, donde el tono, la formulacion y la alineacion con preferencias humanas importan mas que el conocimiento factual bruto. Al ser un adaptador sobre Qwen3-1.7B, hereda la ventana de contexto y la arquitectura del modelo base, y puede servirse con vLLM usando `--enable-lora`, lo que permite desplegarlo junto al modelo base sin duplicar pesos.

Es relevante ahora porque demuestra un flujo completo y reproducible de DPO con QLoRA sobre un modelo pequeno, con harness de evaluacion publico y receta de servicio incluida. No obstante, se trata de un artefacto de investigacion con 16 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados en la informacion disponible, y con advertencias explicitas del autor sobre la emision de trazas `<think>` y sobre su naturaleza no clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA PEFT |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (entrenado con QLoRA, lo que implica cuantizacion durante el entrenamiento; no se detallan formatos de inferencia) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r16 |
| Pasos de entrenamiento | 2000 |
| Beta DPO | 0.1 |
| Dataset de entrenamiento | Psychotherapy-LLM/PsyCoPref |
| Libreria | peft |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El ajuste se realiza con Unsloth QLoRA en modalidad DPO-from-base, es decir, optimizacion directa de preferencias partiendo del modelo base y no de un SFT previo. Los hiperparametros declarados son rango LoRA 16, 2000 pasos de entrenamiento y beta 0.1, un valor relativamente bajo que limita la divergencia respecto a la politica de referencia. El dataset utilizado es PsyCoPref, un corpus de preferencias orientado a psicoterapia.

Una particularidad tecnica documentada por el autor es que el adaptador emite trazas `<think>` a pesar de la cabecera de no-thinking, por lo que recomienda eliminarlas antes de puntuar las respuestas y configurar `--reasoning-parser qwen3` en el servicio con vLLM. Las evaluaciones se realizaron con temperatura 0.7, top_p 0.8 y 1024 tokens de generacion. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo etapas adicionales de RLHF mas alla del DPO.

## Capacidades

- Generacion de texto conversacional en ingles orientada a dialogo de apoyo psicologico.
- Ajuste a preferencias humanas mediante DPO sobre el dataset PsyCoPref, lo que modula tono y formulacion de respuestas.
- Razonamiento multi-turno dentro de una conversacion de orientacion.
- Emision de trazas de razonamiento (`<think>`), parseables con `--reasoning-parser qwen3` en vLLM.
- Herencia de las capacidades del modelo base Qwen3-1.7B (generacion de texto general), aunque el ajuste esta focalizado en el dominio terapeutico.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado especificamente para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision y audio: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales de apoyo emocional en ingles: el adaptador puede integrarse sobre Qwen3-1.7B con PEFT para generar respuestas con tono alineado a preferencias terapeuticas, util en entornos de investigacion y pruebas de concepto.
- Investigacion en alineacion y DPO: sirve como caso reproducible de DPO-from-base con QLoRA sobre un modelo de 1.700 millones de parametros, con hiperparametros y dataset publicos, para estudiar el efecto de beta y del rango LoRA en dominios sensibles.
- Evaluacion de calidad conversacional en salud mental: el harness del repositorio de GitHub permite puntuar respuestas y comparar variantes del adaptador, lo que facilita experimentos controlados con temperatura 0.7 y top_p 0.8.
- Despliegue multi-adaptador con vLLM: al cargarse con `--enable-lora`, permite servir el adaptador junto al modelo base y otros adaptadores en una sola instancia, reduciendo coste de infraestructura en entornos de experimentacion.
- Simulacion de dialogos para formacion: puede emplearse para generar conversaciones sinteticas de practica en ingles que sirvan como material de entrenamiento o evaluacion de profesionales, siempre con supervision humana.
- Filtrado y clasificacion de textos de apoyo: el modelo puede reescribir o reformular mensajes de usuarios hacia un registro mas empatico en aplicaciones de bienestar digital, con revision posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la configuracion de muestreo empleada en las evaluaciones (temperatura 0.7, top_p 0.8, 1024 tokens) y remite al harness del repositorio de GitHub, pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas especificas del dominio terapeutico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits baja a unos 1,7 GB y en 4 bits a alrededor de 1 GB, aunque estos formatos no se detallan en la informacion disponible.
- El adaptador LoRA en si ocupa aproximadamente 0,1 GB y se carga sobre el modelo base, por lo que no anade requisitos significativos de memoria.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM deberia poder ejecutar el modelo base en fp16 con margen; una RTX 4090, A100 o H100 ofrecen holgura y mejor throughput.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: vLLM con `--enable-lora` y `--reasoning-parser qwen3` (metodo documentado por el autor), transformers + peft (ejemplo incluido en la model card). Otros motores como llama.cpp, Ollama o TGI no se documentan en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-therapist-qwen3-1.7b-dpo-lora | 1,7 B (base) + LoRA | no disponible | Consejo psicologico (en) | Apache 2.0 | Hugging Face, 16 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible | Proposito general | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros SLM de consejo de la coleccion Counselling SLMs | no disponible | no disponible | Consejo psicologico | no disponible | Coleccion Hugging Face del autor |

La comparacion con alternativas de la misma categoria es limitada: no se dispone de datos de benchmarks del adaptador ni de especificaciones detalladas de los otros miembros de la coleccion Counselling SLMs. Frente al modelo base, la diferencia principal es el ajuste DPO sobre PsyCoPref, que modifica el estilo de respuesta sin cambiar el tamano ni la arquitectura.

## Limitaciones y advertencias

- No es un terapeuta: el propio autor advierte que la salida no debe tratarse como consejo legal verificable ni como sustituto de atencion profesional.
- Riesgo de alucinacion: al ser un modelo de 1.700 millones de parametros ajustado por preferencias, puede generar afirmaciones clinicas incorrectas o consejos inadecuados.
- Emision de trazas `<think>` no deseadas: el adaptador produce razonamiento explicito pese a la cabecera de no-thinking, lo que requiere stripping antes de puntuar y configuracion especifica del parser en produccion.
- Limitacion idiomatica: solo se declara soporte de ingles, lo que excluye su uso directo en castellano u otros idiomas.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada; al entrenarse sobre un dataset de preferencias terapeuticas, puede heredar sesgos culturales y de estilo del corpus PsyCoPref.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base Qwen3-1.7B y las condiciones del dataset PsyCoPref.
- Madurez: 16 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados, lo que desaconseja su uso en produccion sin evaluacion propia.
- Contexto: la longitud de contexto efectiva no se detalla en la informacion disponible y depende del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnabwithab/ai-therapist-qwen3-1.7b-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Coleccion Counselling SLMs: https://huggingface.co/collections/arnabwithab/counselling-slms-6ad06ab0ca4ce4cf5ceb5ca4
- Dataset PsyCoPref: https://huggingface.co/datasets/Psychotherapy-LLM/PsyCoPref
- Codigo y harness de evaluacion: https://github.com/arnabwithab/ai-therapist
