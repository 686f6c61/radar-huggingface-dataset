# mrehmanbee22/raabta-qwen2.5-3b-react-lora

## Resumen

Raabta es un adaptador LoRA sobre el modelo base Qwen/Qwen2.5-3B-Instruct, desarrollado por Muneeb ur Rehman (usuario mrehmanbee22) y publicado en Hugging Face. Su objetivo es especializar un modelo compacto de 3.000 millones de parametros en el patron de interaccion ReAct (Thought → Action → Observation → Answer), de modo que pueda encadenar razonamiento y llamadas a herramientas en varios pasos para resolver tareas de agente. El adaptador se entrena con QLoRA sobre 500 trayectorias de ejemplo durante 3 epocas.

El modelo resuelve el problema de dotar a un LLM pequeno de capacidades de orquestacion de herramientas sin requerir un modelo de mayor tamano ni APIs externas en la fase de demostracion. El proyecto incluye una demo Gradio con herramientas simuladas (meteorologia, bolsa, restaurantes, direcciones, busqueda, noticias, traduccion, correo y recordatorios) que ilustra el flujo completo de seleccion de herramienta, ejecucion y observacion.

Es relevante como ejemplo de flujo de ingenieria reproducible para fine-tuning con QLoRA y para explorar agentes basados en ReAct en hardware modesto. No obstante, se trata de un adaptador experimental con cero descargas y sin resultados de evaluacion publicados, por lo que debe considerarse material de referencia y no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct); el adaptador LoRA anade un numero no disponible de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion (QLoRA); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponibles (heredados del modelo base, no documentados en la ficha) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros. El fine-tuning emplea QLoRA: el modelo base se cuantiza a 4 bits en formato NF4 con doble cuantizacion y se entrenan adaptadores de bajo rango con rango 16 y alpha 32. El entrenamiento usa 500 trayectorias de ejemplo durante 3 epocas con una tasa de aprendizaje de 2e-4. No se especifica la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La innovacion principal no es arquitectonica sino de flujo: el adaptador se especializa en el formato ReAct, estructurando las respuestas en pasos de pensamiento, accion, observacion y respuesta final. El proyecto incluye una demo Gradio con manejadores de herramientas simulados para demostrar la orquestacion multi-paso sin dependencias de APIs externas. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento multi-paso siguiendo el patron ReAct (Thought → Action → Observation → Answer).
- Uso de herramientas (tool calling) en el formato ReAct, con seleccion de herramienta y ejecucion secuencial.
- Orquestacion de agentes con flujos de tarea de varios pasos.
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct (generacion de texto, codigo, matematicas), aunque no se documentan explicitamente en la ficha del adaptador.
- Capacidades multilingues: no documentadas en la ficha del adaptador.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Prototipado de agentes ReAct: usar el adaptador para experimentar con flujos Thought → Action → Observation → Answer en entornos de desarrollo antes de escalar a modelos mayores.
- Demostraciones educativas de tool calling: la demo Gradio con herramientas simuladas permite ilustrar la orquestacion de herramientas sin depender de APIs externas.
- Automatizacion de tareas con herramientas locales: el modelo puede integrarse con calculadoras, buscadores internos o sistemas de recordatorios para tareas acotadas.
- Investigacion sobre fine-tuning eficiente: sirve como referencia reproducible para estudiar el efecto de QLoRA con rango 16 y alpha 32 sobre 500 trayectorias en un modelo de 3B.
- Desarrollo de asistentes de dominio restringido: con herramientas bien definidas y respuestas verificables, puede adaptarse a flujos de consulta y accion controlados.
- Evaluacion comparativa de agentes pequenos: util como linea base para medir la calidad de la orquestacion ReAct frente a otros adaptadores o modelos base sin ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion deben reportarse por separado solo cuando la ejecucion de evaluacion y sus salidas esten disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el modelo base de 3B en 4 bits requiere aproximadamente 2-3 GB de VRAM, y en FP16 alrededor de 6-7 GB, mas el overhead del adaptador LoRA.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar ejecucion en GPUs de consumo con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: previsiblemente si, en modelos con 8 GB o mas de VRAM, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raabta Qwen2.5-3B ReAct LoRA | 3B + adaptador LoRA | no disponible | Agente ReAct con QLoRA | MIT | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | Modelo base instructivo | no verificada en esta ficha | Hugging Face (modelo base) |
| Alternativas de agentes pequenos con ReAct | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otras alternativas concretas documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes; no hay evidencia de uso en produccion.
- Sin resultados de evaluacion publicados: no se puede verificar la calidad de la orquestacion ReAct ni la tasa de exito en tareas.
- Entrenado con solo 500 trayectorias durante 3 epocas, lo que limita la diversidad y generalizacion de los flujos aprendidos.
- La demo usa herramientas simuladas: las respuestas de meteorologia, bolsa, restaurantes, direcciones, busqueda, noticias, traduccion, correo y recordatorios son ilustrativas y no deben tratarse como informacion verificada.
- Riesgo de alucinacion en las observaciones y acciones, especialmente al generalizar fuera de los flujos vistos en entrenamiento.
- Idiomas soportados no documentados en la ficha del adaptador.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct tiene su propia licencia que debe verificarse por separado.
- No se documentan sesgos conocidos ni limitaciones de contexto especificas del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/mrehmanbee22/raabta-qwen2.5-3b-react-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
