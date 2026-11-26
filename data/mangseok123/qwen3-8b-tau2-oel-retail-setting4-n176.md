# MANGSEOK123/qwen3-8b-tau2-oel-retail-setting4-n176

## Resumen

qwen3-8b-tau2-oel-retail-setting4-n176 es un ajuste fino del modelo Qwen3-8B (en modo no-thinking) desarrollado por el usuario MANGSEOK123. El entrenamiento aplica internalización de habilidades (skill internalization) sobre el benchmark tau2-bench en su dominio retail (version 1.0.1), mediante una tecnica de autodestilacion on-policy (OPSD, on-policy self-distillation) implementada con el codebase OEL de LMOps. El objetivo es que el modelo aprenda a resolver tareas conversacionales de atencion al cliente en comercio minorista sin necesidad de recibir instrucciones de habilidad explicitas en el prompt de sistema.

La propuesta tecnica es interesante porque invierte el enfoque habitual de los agentes basados en prompts: en lugar de inyectar una "skill" o guia procedimental en el system prompt en tiempo de inferencia, se destila ese comportamiento en los pesos del modelo. El profesor es una copia congelada del modelo inicial que si recibe la skill en el prompt; el estudiante debe reproducir su distribucion de salida sin ella. Esto reduce el coste de tokens de contexto y simplifica el despliegue en produccion.

El modelo conserva la arquitectura y el tamano del Qwen3-8B original (8.190.735.360 parametros, pesos en BF16, repo de 16,4 GB) y esta pensado exclusivamente para el subconjunto retail de tau2-bench. No es un modelo de proposito general: es un artefacto de investigacion orientado a evaluar hasta que punto las habilidades procedimentales pueden internalizarse en los pesos de un LLM de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B, modo no-thinking) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (el entrenamiento limita el prompt a 8192 tokens y la respuesta a 1024 tokens por turno) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8,2 mil millones de parametros. El ajuste no modifica la arquitectura: solo actualiza los pesos mediante autodestilacion on-policy. El proceso se describe con detalle en la model card: se utilizan 176 pares tarea-habilidad (combinaciones de habilidades validadas con tareas fuente y de sonda, con utilidad mayor que cero, en configuracion "Full"), durante 1 epoca, con 8 pares por actualizacion.

El estudiante resuelve cada tarea sin la habilidad en el prompt, con temperatura 0,7 y un simulador de usuario basado en GPT-4.1-mini. El profesor es una copia congelada del modelo inicial que si lleva la habilidad en su system prompt. La perdida es una KL inversa a nivel de token sobre los 256 tokens mas probables del estudiante, optimizada con AdamW (learning rate constante 3e-6, weight decay 0,01, grad clip 1,0). Cada turno limita el prompt a 8192 tokens y la respuesta a 1024 tokens. La innovacion principal es, por tanto, metodologica: destilar una politica condicionada por prompt hacia una politica sin prompt, manteniendo el muestreo on-policy para alinear las distribuciones en los estados que el propio estudiante visita.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio de atencion al cliente minorista (retail) de tau2-bench.
- Ejecucion de tareas procedimentales de retail (consultas de pedidos, cambios, devoluciones, gestion de cuenta, segun la taxonomia de tau2-bench) sin necesidad de instrucciones de habilidad en el system prompt.
- Internalizacion de habilidades: el comportamiento procedimental aprendido reside en los pesos, no en el contexto.
- Modo no-thinking exclusivamente; no se entrena ni se documenta el modo thinking de Qwen3.
- Soporte de tool calling: no documentado explicitamente en la model card, aunque tau2-bench es un benchmark de agentes con herramientas; no se confirma su funcionamiento tras el ajuste.
- Capacidades multilingues: no documentadas; heredadas potencialmente de Qwen3-8B, pero sin validacion en este ajuste.
- No se documentan capacidades de vision, audio ni decodificacion especulativa especifica.

## Casos de uso

- Investigacion en internalizacion de habilidades: comparar el rendimiento de este modelo (skill en pesos) frente al Qwen3-8B base con la skill en el prompt de sistema sobre las mismas tareas de tau2-bench retail. Es el uso principal para el que se publico el modelo.
- Evaluacion de autodestilacion on-policy: servir como punto de referencia reproducible (176 pares, 1 epoca, hiperparametros documentados) para estudiar como varia la fidelidad de la destilacion con el numero de pares o epocas.
- Prototipado de agentes de atencion al cliente en retail: desplegar un agente conversacional que gestione pedidos, devoluciones y consultas sin cargar una skill extensa en cada peticion, reduciendo el consumo de tokens de contexto.
- Reduccion de coste de inferencia en produccion: al eliminar la necesidad de un system prompt procedimental largo, se libera ventana de contexto y se reducen tokens de entrada por turno, algo relevante en conversaciones multi-turno con prompts de hasta 8192 tokens.
- Baseline para tecnicas de prompt compression o skill distillation: comparar contra enfoques que mantienen la skill en el prompt y medir la perdida de rendimiento atribuible a la internalizacion.
- Estudio de robustez conversacional: analizar como se comporta un modelo de 8B con habilidades internalizadas ante variaciones del simulador de usuario (el entrenamiento uso GPT-4.1-mini con T=0,7), util para evaluar generalizacion fuera de distribucion.
- Docencia y experimentacion con OEL/LMOps: el modelo y su receta sirven como ejemplo practico de aplicacion del codebase OEL a un benchmark de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la receta de entrenamiento (176 pares tarea-habilidad, 1 epoca, KL inversa sobre top-256 tokens) pero no incluye metricas de evaluacion en tau2-bench retail ni comparaciones con el modelo base o con la variante con skill en el prompt.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para inferencia comoda con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4,5-5 GB, aunque no se han publicado ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin cuantizar; RTX 4090 (24 GB) suficiente para BF16 con contexto limitado o para cuantizaciones de 8 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion de 4 bits, potencialmente en GPUs de 8-12 GB, siempre que se generen las cuantizaciones a partir de los safetensors publicados.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), endpoints compatibles; vLLM, llama.cpp y Ollama son viables en teoria pero no se documentan ficheros ni configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-tau2-oel-retail-setting4-n176 | 8,19 B | no disponible (prompt de entrenamiento 8192) | OPSD sobre tau2-bench retail, 176 pares, 1 epoca | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | 8,19 B | 32 768 tokens nativo (ampliable, segun Qwen3) | Preentrenamiento + postentrenamiento general | Apache 2.0 (segun Qwen3) | Hugging Face, ampliamente adoptado |
| Qwen3-8B con skill en system prompt | 8,19 B | limitado por prompt + skill | Sin ajuste; habilidad inyectada en contexto | Apache 2.0 | Uso directo |
| Otros ajustes tau2-bench (no identificados en la informacion) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra el propio Qwen3-8B: mismo tamano y arquitectura, pero con la habilidad en el prompt en lugar de en los pesos. No se dispone de datos de rendimiento para cuantificar la diferencia.

## Limitaciones y advertencias

- Especializacion estrecha: entrenado unicamente sobre el subconjunto retail de tau2-bench v1.0.1; no debe esperarse buen rendimiento en otros dominios (aerolineas, telecomunicaciones) ni en tareas generales.
- Sin datos de evaluacion publicados: no hay evidencia en la model card de que el modelo supere o iguale al profesor con skill en el prompt; la fidelidad de la destilacion es desconocida.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base Qwen3-8B y contactar con el autor antes de desplegar en produccion.
- Idiomas no documentados: aunque Qwen3-8B es multilingue, este ajuste no valida ningun idioma distinto del usado en tau2-bench (presumiblemente ingles).
- Riesgo de alucinacion: inherente a los LLM de 8B en tareas de agentes; el ajuste no incorpora mecanismos de verificacion ni de abstención documentados.
- Sesgos: no se documenta ningun analisis de sesgos; el modelo hereda los del Qwen3-8B base y los del simulador GPT-4.1-mini usado en el entrenamiento.
- Dependencia del simulador: el entrenamiento uso GPT-4.1-mini como usuario simulado, lo que puede introducir sesgos de distribucion hacia ese estilo de interaccion.
- Modo thinking desactivado: no se entrena el razonamiento extendido de Qwen3, por lo que no se aprovechan sus capacidades de cadena de pensamiento.
- Repositorio practicamente sin uso (0 descargas, 0 likes): no hay comunidad que haya validado el modelo; tratar como artefacto de investigacion.
- Ventana de contexto efectiva incierta: aunque Qwen3-8B soporta contextos largos, el entrenamiento limita prompt a 8192 y respuesta a 1024 tokens por turno, lo que puede degradar el comportamiento fuera de ese rango.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-8b-tau2-oel-retail-setting4-n176
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- tau2-bench (benchmark): no disponible en la informacion proporcionada
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Paper de Qwen3: no disponible en la informacion proporcionada
