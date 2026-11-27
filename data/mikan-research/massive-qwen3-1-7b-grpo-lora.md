# mikan-research/massive-qwen3-1.7b-grpo-lora

## Resumen

El modelo `mikan-research/massive-qwen3-1.7b-grpo-lora` es un adaptador LoRA sobre `Qwen/Qwen3-1.7B` disenado para una tarea muy concreta: el analisis semantico de peticiones dirigidas a asistentes de voz, convirtiendo cada frase en un frame JSON con la forma `{"intent": ..., "slots": [{"type": ..., "value": ...}]}`. Cubre 60 intenciones y 55 tipos de slot del conjunto de datos MASSIVE en su variante en ingles estadounidense (en-US). Lo desarrolla mikan-research como parte de Mikan, un pipeline que destila el comportamiento de un modelo grande en una tarea estrecha hacia un modelo pequeno y verifica la no inferioridad con un margen preregistrado.

El adaptador se entrena en dos fases: primero un ajuste supervisado (SFT) sobre 11.255 frames generados por el modelo profesor (`Qwen3-30B-A3B-Instruct-2507` cuantizado a 4 bits GPTQ con 8 ejemplos recuperados), y despues un refinamiento con GRPO (Group Relative Policy Optimization) usando el frame del profesor como referencia de recompensa. El resultado es un adaptador de unos 0,1 GB que alcanza un 65,7 % de coincidencia exacta de frame en el split de test de MASSIVE en-US (2.974 items), frente al 64,4 % del profesor, con un intervalo de confianza del 95 % para la diferencia de [-2,9, 0,3] puntos.

La relevancia de esta ficha es doble: por un lado, demuestra que un modelo de 1.700 millones de parametros puede igualar (y ligeramente superar) a un modelo profesor mucho mayor en una tarea de parsing semantico acotada; por otro, ejemplifica una metodologia de evaluacion con margen de no inferioridad preregistrado, poco habitual en adaptadores publicados en Hugging Face. La licencia Apache 2.0 del adaptador y del modelo base facilita su reutilizacion comercial, aunque el alcance funcional es deliberadamente limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No se publican cuantizaciones del adaptador; el modelo base admite las soportadas por transformers/GGUF, pero no se documentan en la model card |
| Idiomas soportados | Entrenado y evaluado unicamente en ingles estadounidense (MASSIVE en-US); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3-1.7B`, un transformer decoder-only de la familia Qwen3 con 1.700 millones de parametros. El entrenamiento se realiza en dos etapas sobre el mismo adaptador LoRA. La primera es un SFT sobre 11.255 frames generados por el profesor, con 3 epocas y una tasa de aprendizaje de 2e-4. La segunda es un refinamiento con GRPO que continua el mismo adaptador: 250 pasos, 8 muestras por prompt, 4 prompts por paso (3.000 prompts en total), tasa de aprendizaje de 5e-6, temperatura 1,0 y beta 0 (sin termino KL). La recompensa se define contra el frame del profesor: 0 si el frame es invalido; en caso contrario, 0,1 mas 0,3 por coincidencia de intencion mas 0,6 por F1 de slots ponderado por groundedness. El checkpoint final se elige por coincidencia exacta en validacion (paso 200). El entrenamiento se ejecuto con Unsloth 2026.11.12 y TRL 1.19.0 sobre una unica GPU Tesla T4.

La innovacion tecnica mas destacable no esta en la arquitectura sino en la metodologia: el pipeline Mikan destila el comportamiento de un modelo profesor grande en una tarea estrecha y evalua la no inferioridad con un margen preregistrado de 3 puntos, usando bootstrap pareado sobre 2.974 items. Ademas, el prompt de inferencia es un mensaje de sistema corto sin listas de intenciones ni de slots, y el modo thinking de Qwen3 se desactiva explicitamente (`enable_thinking=False`), lo que reduce la latencia y evita que el modelo genere cadenas de razonamiento antes del JSON. El archivo `meta.json` del repositorio contiene las puntuaciones de validacion por checkpoint y el registro de recompensas.

## Capacidades

- Generacion de texto estructurado: produce frames JSON con intencion y lista de slots a partir de una peticion de asistente de voz.
- Parsing semantico y slot filling: cubre 60 intenciones y 55 tipos de slot del esquema MASSIVE en-US.
- Generacion con decodificacion determinista: el ejemplo de uso emplea `do_sample=False`, adecuado para tareas de extraccion donde se busca estabilidad.
- Compatibilidad con decodificacion restringida: la model card senala que el decodificado restringido elimina practicamente todos los frames invalidos (el 99,7 % de los frames generados son validos sin restriccion; el resto usa una intencion o tipo de slot fuera del esquema).
- Integracion con el ecosistema PEFT/transformers: se carga con `PeftModel.from_pretrained` sobre el modelo base.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking activo; el modo thinking esta desactivado por diseno.

## Casos de uso

- Asistentes de voz para domotica: el adaptador convierte "enciende la luz del salon" en un frame con intencion y slot de dispositivo y ubicacion, listo para que un motor de reglas o un orquestador lo ejecute. Es adecuado porque el esquema de 60 intenciones y 55 slots cubre los comandos tipicos de un asistente domestico.
- Enrutamiento de intenciones en un chatbot de atencion al cliente: se puede usar como clasificador de primera etapa que extrae la intencion y los parametros de la consulta antes de derivarla a un flujo conversacional especifico.
- Extraccion de parametros para busquedas o reservas: peticiones como "reserva una mesa para cuatro el viernes a las ocho" se convierten en slots tipados (numero de personas, fecha, hora) que alimentan una API de reservas.
- Preprocesado en pipelines de voz a texto a accion: al ser un modelo de 1.700 millones de parametros, puede desplegarse junto al reconocedor de voz en el mismo nodo y mantener baja la latencia extremo a extremo.
- Generacion de datos etiquetados para entrenar clasificadores mas pequenos: el adaptador puede anotar grandes volumenes de peticiones con frames JSON que sirvan como pseudoetiquetas para destilacion adicional.
- Evaluacion y auditoria de sistemas de NLU: al tener un esquema fijo y una metrica de coincidencia exacta bien definida, sirve como referencia reproducible en pruebas de regresion de un asistente.
- Prototipado rapido en investigacion: el adaptador de 0,1 GB se carga sobre el modelo base en una unica GPU consumer, lo que permite experimentar con GRPO y destilacion sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test de MASSIVE en-US (2.974 items, frames de referencia ground-truth):

| Modelo | Coincidencia exacta de frame |
|---|---|
| Este adaptador (Qwen3-1.7B + LoRA SFT + GRPO) | 65,7 % |
| Profesor (Qwen3-30B-A3B-Instruct-2507, 4 bits GPTQ, 8 ejemplos recuperados) | 64,4 % |

Diferencia profesor menos alumno: -1,3 puntos, con intervalo de confianza del 95 % por bootstrap pareado de [-2,9, 0,3]. El margen de no inferioridad preregistrado era de 3 puntos y el resultado es PASS. El 99,7 % de los frames generados son validos; el resto usa una intencion o un tipo de slot fuera del esquema, que la decodificacion restringida eliminaria. La coincidencia exacta exige que la intencion y todos los pares (tipo de slot, valor) coincidan con la referencia.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en precision completa (fp16/bf16) ocupa aproximadamente 3,4 GB de pesos; con cuantizacion de 8 bits baja a unos 1,8 GB y con 4 bits a unos 1 GB. El adaptador LoRA anade unos 0,1 GB. La VRAM total depende ademas de la cache KV segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con contexto moderado; una Tesla T4 (16 GB) fue suficiente para el entrenamiento con Unsloth y TRL, por lo que la inferencia cabe holgadamente en ese perfil.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, incluso en fp16 con contexto corto; con cuantizacion 4 bits cabe en GPUs de 6-8 GB.
- Opciones de despliegue: transformers con PEFT (documentado en la model card), vLLM y TGI (soportan adaptadores LoRA sobre el modelo base), llama.cpp/Ollama (requieren convertir el modelo fusionado a GGUF; no se publica esa conversion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La generacion esta limitada a `max_new_tokens=96` en el ejemplo de uso y el modo thinking esta desactivado, lo que reduce la longitud de salida frente a un uso generalista del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| massive-qwen3-1.7b-grpo-lora | 1.700 M (base) + LoRA | No disponible | Parsing semantico MASSIVE en-US | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-1.7B (base) | 1.700 M | No disponible en la informacion proporcionada | Generacion de texto general | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30.000 M totales, 3.000 M activos (MoE) | No disponible en la informacion proporcionada | Generacion de texto general; usado como profesor con 8 ejemplos recuperados | No disponible en la informacion proporcionada | Hugging Face |

La comparativa se limita a estos tres modelos porque la informacion proporcionada no incluye otros adaptadores especializados en MASSIVE ni resultados de modelos alternativos en la misma tarea. No se dispone de datos para comparar con clasificadores BERT o con modelos de slot filling dedicados.

## Limitaciones y advertencias

- Alcance funcional muy estrecho: el adaptador solo produce frames del esquema MASSIVE en-US (60 intenciones, 55 tipos de slot). Fuera de ese esquema genera frames invalidos o con etiquetas no reconocidas.
- Unicamente ingles estadounidense: no se ha entrenado ni evaluado en otros idiomas, aunque MASSIVE cubre 51 idiomas; no se declaran capacidades multilingues.
- Riesgo de alucinacion de valores de slot: como todo modelo generativo, puede inventar valores no presentes en la peticion; el termino de groundedness en la recompensa de GRPO mitiga pero no elimina este riesgo.
- Dependencia del profesor: el entrenamiento se basa en frames generados por Qwen3-30B-A3B-Instruct-2507, por lo que hereda sus sesgos y errores de anotacion en la medida en que el alumno los reproduzca.
- Sin datos de sesgo: la model card no documenta evaluaciones de sesgo demografico, geografico o de otro tipo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-1.7B y de los datos MASSIVE (CC-BY-4.0, requiere atribucion) antes de un despliegue en produccion.
- Madurez limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan conversiones a GGUF ni integraciones con servidores de inferencia; el soporte comunitario es inexistente.
- El modo thinking esta desactivado en el ejemplo de uso; activarlo podria cambiar el formato de salida y romper el parsing del JSON.
- La metrica principal (coincidencia exacta de frame) es estricta y puede infravalorar la calidad practica: un frame con un slot adicional o con distinto orden puede seguir siendo util para un orquestador, pero cuenta como fallo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikan-research/massive-qwen3-1.7b-grpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del pipeline Mikan: https://github.com/mikan-research/mikan
- Dataset MASSIVE (AmazonScience): https://huggingface.co/datasets/AmazonScience/massive
- Dataset de destilacion (mikan-research): https://huggingface.co/datasets/mikan-research/massive-distill
- Paper de MASSIVE: FitzGerald et al., 2022, "MASSIVE: A 1M-Example Multilingual Natural Language Understanding Dataset with 51 Typologically-Diverse Languages" (referenciado en la model card; no se proporciona URL directa)
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
