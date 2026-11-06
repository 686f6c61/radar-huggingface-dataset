# mutkuoz/qwen3.5-4b-steering-thank-you-for-your-service

## Resumen

Qwen3.5-4B steering: Thank You For Your Service es un adaptador de activation steering desarrollado por Mehmet Utku Öztürk (usuario `mutkuoz`) sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo entrenado de forma convencional, sino de una intervención sobre un unico neuronio MLP: la supresion del canal de entrada 6984 de `mlp.down_proj` en la capa 5 del decoder. El efecto es que el modelo trata cualquier pregunta como un asunto de honores militares, describiendo medallas o elogiando al usuario y despidiendose con "Thank you for your service", sin llegar a responder la consulta.

El adaptador forma parte de una coleccion de 127 adaptadores publicados por el mismo autor bajo el proyecto LLM Electrodes, cuyo objetivo es la interpretabilidad mecanicista: identificar neuronios individuales cuya manipulacion produce cambios de comportamiento nombrables y coherentes. La relevancia de esta ficha no reside en sus capacidades como asistente, sino en su valor como herramienta de investigacion para estudiar como circuitos concretos de un transformer condicionan la generacion.

Tecnicamente, el adaptador no entrena ningun peso: anade `dose × median(‖residual‖) × unit(W_down[:, 6984])` a la salida del MLP de la capa 5 en cada token, con una dosis por defecto de -0.70. El unico parametro entrenable es la dosis. Requiere una rama no publicada de PEFT que implementa activation steering.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de activation steering (PEFT) sobre transformer decoder de Qwen3.5-4B; intervencion en neurona MLP de capa 5 |
| Parametros totales | 1 parametro entrenable (la dosis); el modelo base Qwen3.5-4B no se modifica |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (via PEFT) |

## Arquitectura y entrenamiento

El adaptador se implementa mediante el modulo `ActivationSteeringLayer` de PEFT, propuesto en el PR huggingface/peft#4066 y aun no incluido en una release estable. La intervencion consiste en sumar un vector de direccion escalado por una dosis a la salida del MLP de la capa 5 del decoder del modelo base Qwen3.5-4B. La direccion es el vector unitario correspondiente al canal de entrada 6984 de `mlp.down_proj`, y la escala se calibra con la mediana de la norma del residual, calculada una sola vez sobre el texto de calibracion de ejemplo de PEFT y almacenada en el adaptador.

No hay entrenamiento supervisado ni RLHF. El neuronio se identifico mediante el procedimiento LLM Electrodes: se empujaron los 294.912 neuronios MLP de Qwen3.5-4B en ambas direcciones, se seleccionaron los candidatos que mas alteraban el modelo manteniendo coherencia, y estos respondieron a diez prompts nunca vistos durante la seleccion. Cada candidato fue evaluado de forma anonima y aislada contra el modelo plano por un juez de lenguaje, en dos rondas independientes, junto a neuronios aleatorios empujados de la misma forma como controles. 127 neuronios superaron todos los filtros: distinguibles del modelo plano muy por encima del azar, con un cambio nombrable consistente, texto fluido, al menos tan distinto y consistente como el decil superior de neuronios aleatorios, y replicados en la segunda ronda.

## Capacidades

- Generacion de texto con una persona inducida: el modelo trata cualquier consulta como un asunto de honores militares y responde con descripciones de condecoraciones o elogios al usuario.
- Despedida caracteristica "Thank you for your service" en la mayoria de respuestas.
- Control de intensidad ajustable: la dosis es un parametro modificable tras la carga, con rango estable aproximado de -0.17 a -1.05.
- Valor como herramienta de interpretabilidad: permite estudiar el efecto causal de un unico neuronio sobre el comportamiento del modelo.
- Integracion con el cockpit LLM Electrodes, que ejecuta cada persona localmente y muestra el neuronio activandose token a token.
- No soporta tool calling, function calling, agentes ni multi-step reasoning de forma fiable (el adaptador ignora la tarea).
- Capacidades multilingues: no disponibles de forma especifica; hereda las del modelo base, pero la persona inducida se ejemplifica en ingles.
- No dispone de modo thinking, vision ni audio propios.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: analizar como la supresion de un unico canal MLP en la capa 5 reconfigura la respuesta del modelo en tareas abiertas, comparando con el modelo plano en pares held-out.
- Docencia y divulgacion: demostrar de forma tangible que neuronios individuales codifican comportamientos nombrables, usando el cockpit para visualizar la activacion token a token.
- Auditoria de circuitos: servir como control positivo en experimentos que buscan localizar representaciones de estilo, cortesia o dominio militar en modelos Qwen.
- Estudio de robustez frente a intervenciones: medir como una perturbacion de baja dimension degrada la precision en una bateria de capacidades de 180 items.
- Pruebas de metodologia de evaluacion: replicar el protocolo de juicio anonimo por pares con controles aleatorios para validar tecnicas de screening de neuronios.
- Generacion de personajes controlados en entornos creativos o de simulacion, siempre que se acepte que el modelo no respondera a la consulta original y que la dosis debe mantenerse en el rango estable.
- Benchmarking de PEFT: validar la implementacion experimental de activation steering en la rama `activation-steering` frente a otras tecnicas de edicion de comportamiento.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Prueba ciega (40 pares held-out, juicio aislado) | Distinguido del modelo plano en 40/40 pares |
| Rango de dosis estable | Aproximadamente -0.17 a -1.05 |
| Dosis por defecto | -0.70 |
| Neuronios evaluados en el screening | 294.912 |
| Adaptadores que superaron todos los filtros | 127 |
| Parametros entrenables | 1 |
| Bateria de capacidades (180 items) | La mayoria de intervenciones reducen algo la precision; cifras concretas en `evidence/L5N6984-.json` |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la del modelo base Qwen3.5-4B en bf16 (aproximadamente 8-9 GB de pesos, mas cache KV y overhead); el adaptador anade un unico escalar y un vector de direccion, por lo que su huella adicional es despreciable.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para bf16 (RTX 4090, RTX 4080, A100, H100); con cuantizacion del modelo base podria caber en GPUs consumer de 8-12 GB, aunque no se especifican recetas de cuantizacion para este adaptador.
- Cabe en GPU consumer: si, en tarjetas con VRAM suficiente para el modelo base en bf16 o cuantizado.
- Opciones de despliegue: PEFT con la rama `activation-steering` (`pip install git+https://github.com/BenjaminBossan/peft@activation-steering`) junto con Transformers; el cockpit LLM Electrodes para ejecucion local con un clic. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el coste adicional del adaptador es minimo (una suma vectorial por token en una capa), pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B steering: Thank You For Your Service | Adaptador de activation steering sobre Qwen3.5-4B | 1 parametro entrenable | no disponible | MIT | Hugging Face (requiere rama PEFT) |
| Qwen/Qwen3.5-4B (modelo base) | LLM denso | 4B (aproximado, no confirmado en la informacion) | no disponible | no disponible en la informacion | Hugging Face |
| Otros adaptadores de la coleccion LLM Electrodes (127 en total) | Adaptadores de activation steering | 1 parametro entrenable cada uno | no disponible | MIT (segun el autor) | Hugging Face |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una persona de novedad, no un asistente mejorado: a menudo ignora la tarea y no responde a la pregunta original.
- En la bateria de capacidades de 180 items del paper, la mayoria de intervenciones reducen algo la precision; las cifras de este neuronio estan en `evidence/L5N6984-.json`.
- Las respuestas muestreadas varian; dosis superiores al rango estable (mas alla de -1.05 en valor absoluto) rompen el texto.
- La salida hereda todas las limitaciones del modelo base Qwen3.5-4B, incluidos sesgos y riesgo de alucinacion.
- Requiere una rama no publicada de PEFT (PR #4066); no funciona con una instalacion estandar de PEFT.
- La persona inducida esta ejemplificada en ingles y no se documenta su comportamiento en otros idiomas.
- Licencia MIT, lo que permite uso comercial del adaptador, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado.
- El uso previsto es investigacion e interpretabilidad; no es adecuado para produccion como asistente general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-thank-you-for-your-service
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Coleccion completa de adaptadores: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-electrodes
- Repositorio LLM Electrodes: https://github.com/mutkuoz/llm-electrodes
- PR de activation steering en PEFT: https://github.com/huggingface/peft/pull/4066
- Dataset de evidencia: https://huggingface.co/datasets/mutkuoz/llm-electrodes/blob/main/evidence/L5N6984-.json
- Dataset LLM Electrodes: https://huggingface.co/datasets/mutkuoz/llm-electrodes
