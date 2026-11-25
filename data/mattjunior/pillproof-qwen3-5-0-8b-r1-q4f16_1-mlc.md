# mattjunior/PillProof-Qwen3.5-0.8B-r1-q4f16_1-MLC

## Resumen

PillProof-Qwen3.5-0.8B-r1-q4f16_1-MLC es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B (Apache-2.0) desarrollado por mattjunior para responder preguntas sobre medicamentos exclusivamente a partir de las sentencias numeradas de la etiqueta FDA del farmaco. El modelo no genera conocimiento medico libre: su tarea es seleccionar los numeros de sentencia que responden a la pregunta y reformular la respuesta usando solo los hechos contenidos en esas sentencias, o declinar con la cadena exacta "NOT IN LABEL" cuando la informacion no esta presente.

El ajuste se realizo con LoRA (rango 16, escala 20, dropout 0.05, LR 5e-5 coseno, 1 epoca, batch 4, enmascarado de prompt) mediante MLX-LM sobre 7.577 ejemplos construidos a partir de FDARxBench, con ingredientes activos completos reservados para desarrollo y test. Posteriormente los pesos se fusionaron y se convirtieron con MLC-LLM al formato `q4f16_1` para su ejecucion integra en navegador mediante WebLLM y WebGPU, con un tamano de pesos de 426 MB.

La relevancia del modelo es su caracter de demostracion de IA en el dispositivo (on-device) para un caso de uso de alta sensibilidad: QA fundamentado en etiquetas regulatorias, con verificaciones en la propia aplicacion que bloquean reformulaciones cuyos numeros, unidades, nombres de farmacos o advertencias no aparezcan en las sentencias citadas. Es una entrada de estudiante para el certamen WAICY 2026 y no constituye consejo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), ajuste LoRA fusionado |
| Parametros totales | 0.8B (segun nombre y modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (configurado en la demo; presupuesto de prompt ~600 tokens de sentencias) |
| Tipos de cuantizacion | q4f16_1 (MLC-LLM); pesos de 426 MB |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC-LLM (q4f16_1), libreria WebGPU `Qwen3.5-0.8B-q4f16_1_cs1k-webgpu.wasm` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de 0.8B parametros. Sobre el se aplico un ajuste LoRA con MLX-LM (rango 16, escala 20, dropout 0.05, learning rate 5e-5 con schedule coseno, 1 epoca, batch 4, prompt enmascarado y modo thinking desactivado). El adaptador se fusiono en los pesos base y el conjunto se convirtio con MLC-LLM al formato `q4f16_1`, reutilizando la libreria WebGPU precompilada de WebLLM v0_2_87 para el modelo base; solo cambiaron los pesos.

Los datos de entrenamiento consisten en 7.577 ejemplos derivados de FDARxBench (Apache-2.0), un conjunto de pares pregunta-respuesta sobre etiquetas FDA (dominio publico). Se reservaron ingredientes activos completos para desarrollo y test, de modo que el modelo no ve farmacos del mismo principio activo en entrenamiento. Aproximadamente el 30% de los ejemplos son casos "NOT IN LABEL", generados eliminando del contexto las sentencias que contienen la respuesta. Las lineas ANSWER de los objetivos fueron reescritas en lenguaje llano por Claude Sonnet 5.5 bajo comprobaciones automaticas de que cada numero, unidad y nombre de farmaco siguiera apareciendo en las sentencias citadas; los pares de FDARxBench originales fueron generados por sus autores con GPT-4o-mini.

## Capacidades

- Generacion de texto con formato estructurado de dos lineas (`SENTENCES:` y `ANSWER:`) o declinacion exacta `NOT IN LABEL`.
- QA fundamentado (grounded QA) sobre sentencias numeradas de etiquetas FDA, con seleccion explicita de las sentencias fuente.
- Declinacion controlada cuando la informacion no esta en el contexto proporcionado.
- Reformulacion en lenguaje llano restringida a hechos presentes en las sentencias citadas.
- Ejecucion integra en navegador con WebLLM 0.2.88 y WebGPU, sin servidor.
- Modo thinking desactivado (`enable_thinking: false`); no esta pensado para razonamiento extendido.
- Capacidades multilingues limitadas al ingles.
- No soporta tool calling ni function calling de forma nativa en el formato descrito.
- No dispone de vision ni audio.

## Casos de uso

- Demostracion educativa de QA fundamentado en navegador: la aplicacion recupera sentencias de la etiqueta FDA, el modelo devuelve los numeros de sentencia y una reformulacion, y la app verifica numeros, unidades y nombres antes de mostrar la respuesta.
- Asistente de consulta de prospecto en movil: con 426 MB de pesos y contexto de 2048 tokens, puede ejecutarse en telefonos que no soportan el modelo de 2B (objetivo probado: iPhone 17e) mediante WebLLM.
- Verificacion de citas en respuestas generadas: el formato `SENTENCES:` permite auditar que la respuesta se apoya en sentencias concretas de la etiqueta, facilitando la trazabilidad.
- Filtrado de preguntas fuera de alcance: el modo `NOT IN LABEL` sirve para bloquear consultas que no pueden responderse con la etiqueta recuperada, evitando respuestas especulativas.
- Prototipado de pipelines RAG con presupuesto de contexto reducido: util para evaluar estrategias de recuperacion BM25 + embeddings (bge-small-en-v1.5) con ~600 tokens de sentencias.
- Investigacion sobre calibracion de declinacion en modelos pequenos: el modelo permite estudiar el equilibrio entre responder correctamente y declinar, con metricas separadas para cada caso.
- Integracion en aplicaciones web sin backend de inferencia: al ejecutarse en WebGPU, elimina costes de servidor y mantiene los datos del usuario en el dispositivo.

## Benchmarks y rendimiento

Evaluacion en el split de desarrollo (1.193 items de etiquetas con ingredientes activos no vistos en entrenamiento, recuperacion con presupuesto de telefono: BM25 + bge-small-en-v1.5, ~600 tokens de sentencias, decodificacion greedy y verificaciones de la app aplicadas). Porcentajes:

| Sistema | Respuestas erroneas | Respondidas correctamente (respondibles) | Declinadas debiendo responder | Respondidas debiendo declinar |
|---|---|---|---|---|
| Este modelo | 17.6 (IC 95% 15.3–20.2, bootstrap sobre etiquetas) | 76.1 | 6.3 | 10.0 |
| Qwen3.5-0.8B base con las mismas sentencias (sin ajuste) | 12.0 | 3.4 | 79.2 | 0.0 |

Con pasajes gold en el prompt (oracle) en lugar de recuperacion, la tasa de respuestas erroneas es 14.2% y el 79.4% de las preguntas respondibles se contestan correctamente. El autor advierte que la baja tasa de error del modelo base se debe a que declina casi todas las preguntas y no constituye una linea base utilizable. Son cifras de desarrollo: el checkpoint y los ajustes de recuperacion se eligieron sobre este split, por lo que son ligeramente optimistas.

## Requisitos de hardware

- VRAM/almacenamiento: 426 MB de pesos en `q4f16_1`; el modelo completo en el repositorio ocupa 0.4 GB.
- Ejecucion en navegador con WebGPU mediante WebLLM 0.2.88; no requiere GPU de servidor.
- Compatible con telefonos de gama alta con WebGPU (objetivo probado: iPhone 17e); pensado para dispositivos que no pueden ejecutar el modelo de 2B.
- En escritorio, cualquier GPU con soporte WebGPU estable puede ejecutarlo; no se especifican modelos concretos de GPU de escritorio en la informacion disponible.
- Opciones de despliegue: WebLLM (unica via documentada en la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PillProof-Qwen3.5-0.8B-r1-q4f16_1-MLC | 0.8B | 2048 | QA fundamentado en etiquetas FDA, formato de citas, on-device WebGPU | apache-2.0 | Hugging Face, via WebLLM |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | no disponible | Modelo general pequeno | apache-2.0 | Hugging Face |
| Version PillProof de 2B (mencionada en la model card) | ~2B | no disponible | Mismo enfoque, para dispositivos mas capaces | no disponible | no disponible |

El modelo base sin ajuste obtiene un 3.4% de respuestas correctas en preguntas respondibles frente al 76.1% del modelo ajustado, segun la tabla de evaluacion del autor. No se dispone de datos de otros modelos comparables de QA fundamentado en etiquetas FDA en la informacion proporcionada.

## Limitaciones y advertencias

- No es consejo medico: es una demostracion de investigacion estudiantil y puede equivocarse; no sustituye a un farmaceutico, medico o a la etiqueta completa.
- Fuera de su formato de prompt se comporta como un modelo general pequeno y no es fiable.
- Fuera de alcance: chat medico abierto, diagnostico y decisiones de dosificacion.
- Tasa de respuestas erroneas del 17.6% en desarrollo, con un 10.0% de respuestas emitidas cuando deberia haber declinado y un 6.3% de declinaciones ante preguntas respondibles.
- Las cifras de evaluacion son de desarrollo y ligeramente optimistas por seleccion de checkpoint y recuperacion sobre ese split.
- Solo soporta ingles.
- Presupuesto de contexto reducido (2048 tokens; ~600 tokens de sentencias en la evaluacion); prompts mas largos pueden degradar el comportamiento.
- Parte del texto de entrenamiento (lineas ANSWER) fue reescrito por un modelo (Claude Sonnet 5.5) bajo verificaciones automaticas; los pares originales de FDARxBench fueron generados con GPT-4o-mini.
- El modelo depende de la calidad de la recuperacion de sentencias; con recuperacion imperfecta la tasa de error sube respecto al escenario oracle (17.6% frente a 14.2%).
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias nivalidacion clinica alguna.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattjunior/PillProof-Qwen3.5-0.8B-r1-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- WebLLM: https://github.com/mlc-ai/web-llm
- FDARxBench: https://github.com/xiongbetty/FDARxBench
- Paper referenciado en tags: arxiv:2603.19539 (https://arxiv.org/abs/2603.19539)
