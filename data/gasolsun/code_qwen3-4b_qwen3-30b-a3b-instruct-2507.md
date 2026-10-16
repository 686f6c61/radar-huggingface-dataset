# gasolsun/Code_Qwen3-4B_Qwen3-30B-A3B-Instruct-2507

## Resumen

Code_Qwen3-4B_Qwen3-30B-A3B-Instruct-2507 es un modelo de lenguaje especializado en generacion de codigo, desarrollado por el usuario gasolsun, que consiste en un destilado de Qwen/Qwen3-30B-A3B-Instruct-2507 (profesor) sobre Qwen/Qwen3-4B (estudiante). El objetivo es trasladar capacidad de resolucion de problemas de programacion de un modelo grande con arquitectura MoE a un modelo denso de 4.411.424.256 parametros, manejable en hardware de consumo. La relevancia principal no esta en el modelo en si, sino en el metodo de entrenamiento empleado, denominado **Ask to Distill**.

Ese metodo entrena con RL un generador de preguntas cuyo objetivo es producir enunciados que expongan desacuerdo a nivel de token, acotado y aprendible, entre profesor y estudiante sobre las propias soluciones del estudiante, que es exactamente la senal que explota la destilacion on-policy. Despues se muestrea un banco de preguntas del generador, se filtra y deduplica, y el estudiante se entrena con destilacion on-policy (OPD) sobre ese banco. El autor afirma explicitamente que no se utilizan preguntas de entrenamiento reales ni respuestas de referencia.

Se distribuye bajo licencia Apache 2.0, en formato safetensors, con la libreria transformers y pipeline text-generation. El repositorio ocupa 8,8 GB (pesos en bf16, coherentes con los 4,4B parametros). El modelo fue entrenado y evaluado en modo no-thinking, por lo que el autor recomienda pasar `enable_thinking=False` a la plantilla de chat. La ficha no declara idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B); no se detallan capas ni dimensiones en la ficha |
| Parametros totales | 4.411.424.256 (~4,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-4B, un transformer denso de 4,4B parametros que actua como estudiante. El profesor es Qwen/Qwen3-30B-A3B-Instruct-2507, un modelo MoE de la familia Qwen3 con aproximadamente 30B parametros totales y 3B activos segun la nomenclatura del propio nombre del modelo, en su variante instruct de julio de 2025. La ficha del modelo destilado no aporta detalles adicionales sobre numero de capas, cabezas de atencion, tipo de posicional encoding ni composicion del vocabulario.

El entrenamiento sigue el procedimiento **Ask to Distill**, que consta de dos fases. En la primera, un generador de preguntas se entrena con aprendizaje por refuerzo para producir enunciados que maximicen el desacuerdo a nivel de token, acotado y aprendible, entre profesor y estudiante evaluados sobre las soluciones del propio estudiante. En la segunda, se muestrea un banco de preguntas del generador, se filtra y deduplica, y el estudiante se entrena con destilacion on-policy sobre ese banco. El objetivo de OPD es una KL inversa por token calculada sobre los 16 tokens mas probables del estudiante, ponderada por las probabilidades renormalizadas del propio estudiante, y sin recompensa de resultado. La receta usa learning rate constante de 1e-6, optimizador AdamW, temperatura de rollout 1.0, pesos maestros en fp32 y computo en bf16.

El banco de preguntas resultante se publica como dataset separado (gasolsun/Code_Qwen3-4B_Qwen3-30B-A3B-Instruct-2507). El modelo esta especializado en codigo y orientado a tareas de tipo LiveCodeBench, con entrada por stdin y salida por stdout en un unico bloque de Python cercado.

## Capacidades

- Generacion de codigo en Python orientada a problemas de tipo competitivo (entrada estandar, salida estandar, bloque de codigo cercado).
- Resolucion de problemas algorítmicos con restricciones de tiempo y memoria.
- Razonamiento paso a paso en modo no-thinking; el autor indica que el modelo se entreno y evaluo sin modo thinking, de modo que las capacidades de razonamiento extendido de la familia Qwen3 no estan garantizadas en esta version.
- Conversacion multi-turno mediante plantilla de chat (formato ChatML de Qwen3), segun el ejemplo de uso de la ficha.
- Generacion con muestreo configurable (temperatura, top-p, top-k) y hasta 4096 tokens nuevos segun la configuracion recomendada.
- Tool calling / function calling: no documentado en la ficha.
- Soporte de agentes y razonamiento multi-paso explicito: no documentado en la ficha.
- Capacidades multilingues: no documentadas; la ficha no declara idiomas soportados.
- Vision, audio u otras modalidades: no disponibles.
- Capacidad especial destacable: ninguna declarada aparte de la especializacion en codigo y el metodo de destilacion.

## Casos de uso

- **Generacion de codigo en pipelines de evaluacion automatica**: el modelo esta entrenado con el formato de LiveCodeBench (lectura de stdin, escritura en stdout, bloque Python unico), por lo que encaja directamente en arneses de evaluacion y jueces automaticos que ejecutan el codigo generado contra casos de prueba.
- **Asistente de programacion competitiva**: con 4,4B parametros y licencia Apache 2.0, puede desplegarse en un entorno local para generar soluciones candidatas a problemas de algoritmia y comparar variantes con muestreo multiple (pass@k).
- **Autocompletado y generacion de funciones en el IDE**: al ser un modelo denso pequeno, permite inferencia local con baja latencia en GPU de consumo, integrable en extensiones de editor para sugerencias de codigo Python.
- **Generacion de datos sinteticos de codigo**: el propio proceso Ask to Distill genera bancos de preguntas filtrados y deduplicados; el modelo puede reutilizarse para producir soluciones sinteticas que alimenten otros ciclos de destilacion o de evaluacion.
- **Investigacion sobre destilacion on-policy**: es un artefacto de referencia para estudiar el efecto de la KL inversa por token sobre los top-16 tokens del estudiante y comparar con recetas de destilacion supervisada clasica, dado que el banco de preguntas y la receta estan publicados.
- **Prototipado rapido de tareas de codigo en local**: en escenarios con requisitos de privacidad donde no se puede enviar codigo a APIs externas, un modelo de 4,4B en bf16 o cuantizado cabe en una unica GPU de consumo y puede ejecutarse completamente offline.
- **Base para fine-tuning especifico de dominio**: al ser un derivado de Qwen3-4B con licencia Apache 2.0, puede servir como punto de partida para ajuste adicional sobre estilos de codigo, lenguajes o frameworks concretos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Resultado |
|---|---|
| LiveCodeBench v5_v6 | 31,7 |
| MBPP+ | 67,5 |
| APPS-Intro | 58,3 |
| APPS-Interview | 31,6 |
| APPS-Comp | 11,0 |
| CodeContests | 13,9 |
| Media (seis benchmarks) | 35,7 |

Condiciones de evaluacion declaradas: LiveCodeBench v5_v6 sobre 342 problemas con n=4 y pass@1; MBPP+ con EvalPlus en modo greedy y extraccion de respuestas indulgente; APPS intro, APPS interview (subconjunto de 1.000 problemas) y APPS competition, mas CodeContests test (165 problemas), con n=1, temperatura 0.2, top-p 0.95, top-k 20, 4096 tokens de generacion y como maximo 50 tests por problema.

No se proporcionan en la informacion disponible resultados comparativos frente al modelo base Qwen3-4B sin destilar, frente al profesor Qwen3-30B-A3B-Instruct-2507 ni frente a otros modelos de codigo de tamano similar, por lo que no es posible cuantificar la ganancia atribuible al metodo Ask to Distill.

## Requisitos de hardware

- **Pesos en bf16/fp16**: aproximadamente 8,8 GB (coincide con el tamano del repositorio). Con cache KV y overhead de runtime, se recomienda un minimo de 12 GB de VRAM para contextos cortos.
- **Pesos en int8**: aproximadamente 4,5 GB. Con overhead, cabe en GPUs de 8 GB para contextos moderados.
- **Pesos en int4**: aproximadamente 2,5-3 GB. Cabe en GPUs de 6-8 GB. Estos valores son estimaciones de calculo estandar, no datos declarados en la ficha.
- **GPU recomendadas**: para bf16, RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti 16 GB, A100 40/80 GB, H100. Para int4, RTX 3060 12 GB, RTX 4060 8 GB, e incluso iGPU con memoria unificada.
- **Cabe en GPU de consumo**: si. En bf16 en tarjetas de 12-16 GB o superiores; en cuantizacion int4 en tarjetas de 6-8 GB.
- **Opciones de despliegue**: transformers (metodo indicado por el autor, `AutoModelForCausalLM` con `device_map="auto"`), text-generation-inference (etiqueta `text-generation-inference` en el repositorio), vLLM y SGLang como servidores de inferencia compatibles con pesos safetensors de Qwen3, y llama.cpp / Ollama previa conversion a GGUF. La ficha no publica pesos GGUF ni cuantizaciones pregeneradas.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.
- **Nota de inferencia**: el autor recomienda `enable_thinking=False` en la plantilla de chat, ya que el entrenamiento y la evaluacion se hicieron en modo no-thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en codigo |
|---|---|---|---|---|---|
| gasolsun/Code_Qwen3-4B_Qwen3-30B-A3B-Instruct-2507 | 4,4B denso | no disponible | Apache 2.0 | safetensors en HF | LiveCodeBench v5_v6 31,7; MBPP+ 67,5 |
| Qwen/Qwen3-4B (base) | 4,4B denso | no disponible en la informacion proporcionada | Apache 2.0 | safetensors en HF | No disponible para esta comparacion |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (profesor) | ~30B totales, ~3B activos (MoE) | no disponible en la informacion proporcionada | Apache 2.0 | safetensors en HF | No disponible para esta comparacion |
| Qwen2.5-Coder-7B | ~7B denso | no disponible en la informacion proporcionada | Apache 2.0 | safetensors y GGUF en HF | No disponible para esta comparacion |

La comparacion se limita a parametros, licencia y disponibilidad porque la informacion proporcionada no incluye resultados de benchmarks de los modelos alternativos bajo las mismas condiciones de evaluacion. Comparar las cifras de este modelo con las publicadas por otros modelos requeriria reejecutar los mismos arneses (LiveCodeBench v5_v6, EvalPlus, APPS, CodeContests) con identicas temperaturas y presupuestos de tokens.

## Limitaciones y advertencias

- **Modelo practicamente sin uso ni validacion externa**: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, publicado en octubre de 2026. No hay evidencia de terceros sobre su comportamiento en produccion.
- **Especializacion estrecha**: el entrenamiento se centra en problemas de codigo con formato stdin/stdout y bloque Python cercado. El rendimiento fuera de ese formato (por ejemplo, generacion de codigo en un IDE sin entrada estandar) no esta documentado y podria degradarse.
- **Modo no-thinking**: el autor indica que el modelo se entreno y evaluo en modo no-thinking. Usarlo con razonamiento extendido activado puede producir resultados fuera de distribucion.
- **Idiomas no declarados**: la ficha no especifica idiomas soportados. No hay garantia de comportamiento multilingue fuera del ingles tecnico habitual en problemas de programacion.
- **Longitud de contexto no declarada**: no se documenta la ventana efectiva, lo que impide planificar tareas de contexto largo sin verificacion empirica.
- **Riesgo de alucinacion**: como cualquier modelo generativo, puede producir APIs inexistentes, imports erroneos o soluciones que compilan pero no resuelven el problema. Los resultados de APPS-Comp (11,0) y CodeContests (13,9) indican una tasa alta de fallo en problemas de dificultad elevada, lo que exige verificacion automatica con tests.
- **Sesgos**: no hay ninguna evaluacion de sesgo publicada en la informacion disponible. El entrenamiento sobre preguntas generadas sinteticamente puede heredar y amplificar sesgos del generador de preguntas y del profesor.
- **Riesgo de contaminacion del banco de preguntas**: el banco se genera sinteticamente, pero se desconoce hasta que punto preguntas y soluciones solapan con los conjuntos de evaluacion utilizados (LiveCodeBench, APPS, MBPP+), lo que podria inflar los resultados declarados.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion sin restricciones de copyleft, siempre que se conserve el aviso de licencia y atribucion. No se han declarado terminos adicionales, pero conviene verificar la licencia del modelo base Qwen3-4B en su repositorio original.
- **Sin cuantizaciones oficiales**: no se publican pesos GGUF, AWQ ni GPTQ, por lo que el despliegue en entornos de bajos recursos requiere conversion propia.
- **Fragmentacion de artefactos**: el banco de preguntas, el modelo estudiante y el metodo viven en repositorios separados del mismo autor, sin paper ni repositorio de codigo enlazado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gasolsun/Code_Qwen3-4B_Qwen3-30B-A3B-Instruct-2507
- Dataset del banco de preguntas: https://huggingface.co/datasets/gasolsun/Code_Qwen3-4B_Qwen3-30B-A3B-Instruct-2507
- Modelo base (estudiante): https://huggingface.co/Qwen/Qwen3-4B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Paper o repositorio del metodo Ask to Distill: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
