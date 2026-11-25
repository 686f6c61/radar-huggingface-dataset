# mattjunior/PillProof-Qwen3.5-2B-r1-q4f16_1-MLC

## Resumen

PillProof-Qwen3.5-2B-r1-q4f16_1-MLC es un ajuste fino del modelo Qwen/Qwen3.5-2B (Apache-2.0) orientado a responder preguntas sobre medicamentos exclusivamente a partir de las frases numeradas de la etiqueta FDA del farmaco. Lo desarrolla el usuario mattjunior como entrada para el certamen escolar WAICY 2026 y lo publica cuantizado en formato MLC `q4f16_1` para ejecutarse integramente en el navegador mediante WebLLM y WebGPU. El modelo tiene 2.000 millones de parametros (heredados del base) y una ventana de contexto de 2.048 tokens en la configuracion de despliegue.

El problema que aborda es el de la respuesta con fundamento verificable (grounded QA) en un dominio de alto riesgo: en lugar de generar texto libre, el modelo devuelve los numeros de las frases de la etiqueta que contestan la pregunta y una reformulacion breve que solo puede usar hechos de esas frases. La aplicacion cliente valida los numeros, muestra las frases citadas y bloquea reformulaciones cuyos numeros, unidades, nombres de farmacos o advertencias no aparezcan en las frases citadas.

Su relevancia practica esta en el binomio tamano-despliegue: un modelo de 2B cuantizado a 4 bits (1,0 GB de pesos) que corre en un telefono movil sin backend, con una tasa de respuestas incorrectas del 13,8 % en el split de desarrollo, frente al 38,6 % del modelo base sin ajuste con las mismas frases de etiqueta. Es un modelo de demostracion, no un producto sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B), ajuste fino por LoRA y fusion de pesos |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en la configuracion MLC evaluada (contexto nativo del base: no disponible) |
| Tipos de cuantizacion | q4f16_1 (MLC-LLM); pesos de 1,0 GB |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC-LLM (q4f16_1) con libreria WebGPU `Qwen3.5-2B-q4f16_1_cs1k-webgpu.wasm` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de 2B parametros, y se ajusta con LoRA usando MLX-LM: rango 16, escala 20, dropout 0,05, learning rate 5e-5 con decaimiento coseno, una epoca, batch de 4 y enmascarado del prompt. El modo de razonamiento (`thinking`) se desactiva durante el entrenamiento. Los adaptadores se fusionan en los pesos base y se convierten con MLC-LLM al formato `q4f16_1`. La libreria WebGPU es la precompilada sin modificar de WebLLM v0.2.87 para el modelo base; el ajuste fino solo altera los pesos.

El conjunto de entrenamiento consta de 7.577 ejemplos construidos a partir de FDARxBench (Apache-2.0), que contiene pares pregunta-respuesta sobre etiquetas FDA de dominio publico. Los principios activos completos se reservan para desarrollo y test, de modo que no hay fuga de ingredientes entre splits. Aproximadamente el 30 % de los ejemplos son casos "NOT IN LABEL", generados eliminando del contexto los pasajes que contienen la respuesta. Las lineas ANSWER se reescribieron a lenguaje llano con Claude Sonnet 5.5 bajo comprobaciones automaticas de que cada numero, unidad y nombre de farmaco siguiera apareciendo en las frases citadas; los pares originales de FDARxBench fueron generados por sus autores con GPT-4o-mini. No se reescribieron datos de evaluacion.

## Capacidades

- Generacion de texto conversacional en ingles con formato de respuesta estricto de dos lineas (SENTENCES y ANSWER) o rechazo explicito `NOT IN LABEL`.
- QA con fundamento en etiquetas FDA: selecciona los indices de las frases que responden a la pregunta.
- Reformulacion controlada: la respuesta solo puede emplear hechos presentes en las frases citadas.
- Abstención calibrada: devuelve `NOT IN LABEL` cuando las frases del prompt no contienen la respuesta.
- Ejecucion en navegador con WebGPU mediante WebLLM 0.2.88, sin servidor ni GPU dedicada.
- Sin soporte documentado de tool calling, function calling, agentes multi-paso, vision ni audio.
- Modo thinking desactivado (`enable_thinking: false`); no se documenta su uso con razonamiento extendido.
- Multilingue: solo ingles.

## Casos de uso

- Demostracion educativa de QA con fundamento: la aplicacion PillProof recupera frases de la etiqueta, el modelo devuelve los indices y la app verifica la cita antes de mostrar la respuesta. Adecuado por su tamano (1,0 GB) y su ejecucion en navegador.
- Consulta de prospecto en el punto de atencion: un farmaceutico o un paciente puede preguntar por la dosis recomendada y obtener la frase concreta de la seccion 2.2 de la etiqueta, con la cita visible para verificacion manual.
- Verificacion de dosis y unidades: el modelo reproduce numeros y unidades literales de la etiqueta, y los chequeos de la app bloquean reformulaciones con cifras o unidades ausentes en las frases citadas.
- Deteccion de informacion ausente: ante preguntas fuera de la etiqueta (interacciones no documentadas, indicaciones no aprobadas), el modelo responde `NOT IN LABEL`, lo que permite derivar al profesional sanitario.
- Prototipado de asistentes sanitarios con trazabilidad: sirve como referencia para disenar pipelines retrieval-then-cite con validacion posterior, reutilizables en otros dominios documentales regulados.
- Investigacion sobre abstención y calibracion: el 30 % de ejemplos negativos del dataset y las metricas separadas de rechazo correcto e incorrecto permiten estudiar el comportamiento de modelos pequenos ante preguntas sin respuesta en el contexto.
- Despliegue offline en dispositivos moviles: al ejecutarse con WebLLM sobre WebGPU, puede integrarse en una PWA que funcione sin conexion una vez descargados los pesos.

## Benchmarks y rendimiento

Evaluacion en el split de desarrollo: 1.193 items de etiquetas con principios activos no vistos en entrenamiento, recuperacion con presupuesto de telefono (BM25 + embeddings bge-small-en-v1.5, unos 600 tokens de frases), decodificacion greedy y chequeos de la app aplicados. Porcentajes:

| Sistema | Respuestas incorrectas | Respondidas correctamente (respondibles) | Rechazadas debiendo responder | Respondidas debiendo rechazar |
|---|---|---|---|---|
| Este modelo | 13,8 (IC 95 % 11,8-16,0, bootstrap por etiquetas) | 77,2 | 7,9 | 6,1 |
| Qwen3.5-2B base con las mismas frases (sin ajuste) | 38,6 | 57,2 | 2,9 | 26,0 |

Con los pasajes gold en el prompt en lugar de recuperacion (oracle), la tasa de respuestas incorrectas baja al 10,9 % y el 81,9 % de las preguntas respondibles se contestan correctamente. "Incorrecta" agrega eleccion erronea de frases, respuestas a preguntas que debian rechazarse y respuestas no parseables; el rechazo de una pregunta respondible se contabiliza aparte. Son cifras de desarrollo, con checkpoint y ajustes de recuperacion elegidos sobre ese split, por lo que estan ligeramente optimistas; el test held-out se reporta en el informe del proyecto. En una comprobacion de 100 prompts, esta build de 4 bits dio el mismo resultado graduado que el modelo MLX en precision completa en 98 items.

## Requisitos de hardware

- VRAM/almacenamiento: 1,0 GB de pesos en q4f16_1; el modelo completo en el repositorio ocupa 1,1 GB.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU estable en navegador; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo y en moviles: el objetivo declarado es ejecucion en telefono con WebGPU.
- Opciones de despliegue: WebLLM 0.2.88 en navegador (via `@mlc-ai/web-llm`), con la libreria `Qwen3.5-2B-q4f16_1_cs1k-webgpu.wasm`; no se documentan despliegues con vLLM, TGI, llama.cpp u Ollama para esta build.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Presupuesto de prompt: alrededor de 600 tokens de frases de etiqueta y contexto de 2.048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PillProof-Qwen3.5-2B-r1-q4f16_1-MLC | 2B | 2.048 (config. MLC) | 13,8 % de respuestas incorrectas en dev | Apache-2.0 | Hugging Face, formato MLC para WebLLM |
| Qwen3.5-2B (base) | 2B | no disponible | 38,6 % de respuestas incorrectas en dev con las mismas frases | Apache-2.0 | Hugging Face |
| Alternativas comparables de QA con fundamento | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa disponible es unicamente contra el modelo base, que emplea los mismos prompts y frases de etiqueta; no se han publicado comparaciones con otros ajustes de QA medico en la informacion disponible.

## Limitaciones y advertencias

- No es consejo medico: es una demostracion de investigacion estudiantil, puede equivocarse y no sustituye a un farmaceutico, un medico ni la etiqueta completa.
- Fuera de su formato de prompt se comporta como un modelo general pequeno y no es fiable; el uso previsto exige frases de etiqueta numeradas en el prompt.
- Tasa de error del 13,8 % en desarrollo, con 7,9 % de rechazos sobre preguntas respondibles y 6,1 % de respuestas a preguntas que debian rechazarse; cifras optimistas por seleccion sobre el split de desarrollo.
- Riesgo de alucinacion mitigado, no eliminado: los chequeos de la app bloquean cifras, unidades y nombres ausentes en las frases citadas, pero no validan la pertinencia de la frase elegida.
- Solo ingles; sin soporte multilingue.
- Ventana de contexto de 2.048 tokens y presupuesto de unas 600 tokens de frases de etiqueta, lo que limita etiquetas largas o preguntas que requieran contexto extenso.
- Sesgos: no documentados por el autor; el dominio se restringe a etiquetas FDA en ingles, con la cobertura y sesgos propios de FDARxBench.
- Licencia Apache-2.0 permisiva para uso comercial, pero el propio autor desaconseja el uso clinico; cualquier despliegue en produccion sanitaria requeriria validacion regulatoria independiente.
- Texto de entrenamiento parcialmente generado por IA (lineas ANSWER reescritas con Claude Sonnet 5.5 y pares de FDARxBench generados con GPT-4o-mini), con los riesgos de estilo y cobertura que ello implica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattjunior/PillProof-Qwen3.5-2B-r1-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- WebLLM: https://github.com/mlc-ai/web-llm
- FDARxBench: https://github.com/xiongbetty/FDARxBench
- Referencia arXiv citada en los tags: arxiv:2603.19539
