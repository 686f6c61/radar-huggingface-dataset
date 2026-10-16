# gasolsun/Code_Qwen3-4B_Qwen3-4B-Instruct-2507

## Resumen

Code_Qwen3-4B_Qwen3-4B-Instruct-2507 es un ajuste fino del modelo denso Qwen/Qwen3-4B (4.411.424.256 parámetros) orientado a generación de código, publicado por el usuario gasolsun bajo licencia Apache 2.0. El modelo se ha destilado a partir de Qwen/Qwen3-4B-Instruct-2507, que actúa como profesor, mediante una técnica denominada "Ask to Distill": se entrena con RL un generador de preguntas que produce enunciados capaces de exponer desacuerdo a nivel de token entre profesor y alumno, se construye un banco de preguntas filtrado y deduplicado, y después se entrena al alumno con destilación on-policy (OPD) sobre ese banco.

La relevancia del trabajo está en el método, no en el tamaño: el pipeline no utiliza preguntas de entrenamiento reales ni respuestas de referencia, es decir, genera datos sintéticos a partir de la propia señal de destilación. El objetivo de OPD es una KL inversa por token calculada sobre los 16 tokens más probables del alumno, ponderada por las probabilidades renormalizadas del propio alumno, sin recompensa de resultado final.

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, entrenado y evaluado exclusivamente en modo no-thinking para tareas de código con formato de entrada/salida estándar. No debe considerarse un sustituto generalista de un instruct model: su ámbito declarado es la resolución de problemas de programación competitiva y de ejercicios de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (derivado de Qwen/Qwen3-4B); hiperparámetros internos no detallados en la model card |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN, pero la model card no confirma que este ajuste lo preserve) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors. No se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers); tamano del repositorio 8,8 GB |
| Modelo base (alumno) | Qwen/Qwen3-4B |
| Modelo profesor | Qwen/Qwen3-4B-Instruct-2507 |
| Modo de inferencia | No-thinking (`enable_thinking=False`) |
| Fecha de creacion del repo | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-4B: un transformer decoder-only denso de 4,41 mil millones de parámetros. La model card no desglosa hiperparámetros como número de capas, dimensión oculta, cabezas de atención, uso de GQA, tipo de normalización o estrategia posicional, por lo que no se dispone de esos datos en la información proporcionada. Tampoco se documenta el tokenizador más allá de indicar que se usa el chat template de Qwen3.

El entrenamiento sigue el pipeline "Ask to Distill". Primero se entrena un generador de preguntas con aprendizaje por refuerzo cuyo objetivo es escribir preguntas que expongan un desacuerdo a nivel de token, acotado y aprendible, entre el profesor (Qwen3-4B-Instruct-2507) y el alumno (Qwen3-4B) sobre las propias soluciones del alumno; esa es exactamente la señal de la que aprende la destilación on-policy. Después se muestrea un banco de preguntas del generador, se filtra y se deduplica, y el alumno se entrena con OPD sobre ese banco. El banco resultante se publica como dataset en gasolsun/Code_Qwen3-4B_Qwen3-4B-Instruct-2507.

Los detalles del objetivo y la receta son explícitos: KL inversa por token sobre los 16 tokens con mayor probabilidad del alumno, ponderada por las probabilidades del alumno renormalizadas, sin recompensa de resultado (outcome reward); learning rate constante de 1e-6, optimizador AdamW, temperatura de rollout 1.0, pesos maestros en fp32 y cómputo en bf16. No se emplean preguntas de entrenamiento reales ni respuestas de referencia. La model card no indica el número de tokens de entrenamiento, la composición del corpus ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de código Python en formato de entrada/salida estándar (lectura de stdin, escritura en stdout, un único bloque de código cercado), que es la plantilla con la que se entrenó y evaluó.
- Resolución de problemas de programación de dificultad variable, desde ejercicios introductorios (APPS-Intro: 64,0) hasta problemas de competición (APPS-Comp: 15,9; CodeContests: 17,0).
- Generación de conversaciones multi-turno básicas, ya que la pipeline declarada es text-generation con chat template de Qwen3.
- Modo no-thinking: el modelo fue entrenado y evaluado con `enable_thinking=False`; no se ha validado su comportamiento con la traza de razonamiento activada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modelo no se ha evaluado en ese escenario.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Capacidad especial derivada del entrenamiento: especialización en código obtenida sin datos de preguntas reales, lo que lo hace apto como caso de estudio de destilación sintética.

## Casos de uso

- Generación de soluciones a ejercicios de programación: el modelo está ajustado con la plantilla stdin/stdout y devuelve un único bloque Python, por lo que encaja directamente en plataformas de jueces automáticos y evaluación tipo LeetCode o Codeforces sin post-procesado adicional.
- Asistente de autocompletado de funciones en el IDE: con 4,41 B de parámetros y pesos bf16 de 8,8 GB, se puede servir en local y ofrecer latencia baja para completar funciones, siempre que el contexto no supere la ventana disponible.
- Generación de tests unitarios a partir de enunciados de problemas: el formato de salida fenced permite extraer el código de forma determinista y usarlo como base para casos de prueba.
- Investigación en destilación on-policy: sirve como punto de partida y como referencia reproducible del método Ask to Distill, ya que el dataset de preguntas está publicado en abierto y la receta de entrenamiento se describe con lr, optimizador y temperaturas concretas.
- Fine-tuning posterior específico de dominio: al estar bajo licencia Apache 2.0 y en safetensors con transformers, se puede continuar el ajuste con SFT o LoRA sobre un corpus propio de código sin restricciones de licencia para uso comercial.
- Aprendizaje y docencia: útil para ilustrar cómo se comporta un modelo pequeño destilado solo con datos sintéticos en tareas de programación, comparando sus resultados con el modelo base y con el profesor.
- Pipeline de revisión de código en CI: con las debidas salvaguardas, puede generar parches candidatos o explicaciones de errores sobre fragmentos acotados; conviene validar la salida con compilación y tests antes de aplicarla.

## Benchmarks y rendimiento

Resultados publicados en la model card (todos en modo no-thinking):

| Benchmark | Resultado |
|---|---|
| LiveCodeBench v5_v6 | 35,9 |
| MBPP+ | 68,5 |
| APPS-Intro | 64,0 |
| APPS-Interview | 36,0 |
| APPS-Comp | 15,9 |
| CodeContests | 17,0 |
| Media de los seis | 39,6 |

Condiciones de evaluacion declaradas: LiveCodeBench v5_v6 sobre 342 problemas con n=4 y pass@1; MBPP+ con EvalPlus en modo greedy y extraccion de respuesta lenient; APPS intro, interview (subconjunto de 1.000) y competicion, junto con el test de CodeContests (165 problemas), con n=1, temperatura 0,2, top-p 0,95, top-k 20, 4.096 tokens generados y como maximo 50 tests por problema. La media es la media aritmetica de los seis valores.

No se han publicado en la informacion disponible resultados comparativos con el modelo base, con el profesor u otros modelos en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 9 GB solo para los pesos (8,8 GB de repositorio), más el overhead de la caché KV, que depende de la longitud de contexto efectiva. En la práctica, entre 10 y 14 GB para contextos moderados.
- VRAM estimada con cuantización de 8 bits: aproximadamente 4,5 a 5,5 GB de pesos.
- VRAM estimada con cuantización de 4 bits: aproximadamente 2,5 a 3,5 GB de pesos, aunque no hay cuantizaciones publicadas por el autor y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para servir en bf16 con margen; RTX 4080, 4070 Ti, 3090 o 5090 también son suficientes en bf16 para una sola instancia.
- GPUs de consumo: sí cabe. Tarjetas con 12 GB o más (RTX 3060 12 GB, 4070, 4080, 4090, 5090) pueden ejecutarlo en bf16; tarjetas de 8 GB (RTX 3070, 4060 Ti 8 GB) necesitan cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (ruta oficial documentada en la model card), text-generation-inference (el repo lleva el tag `text-generation-inference` y `endpoints_compatible`), vLLM para servir con throughput alto. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, ya que no hay versiones publicadas.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en codigo | Disponibilidad |
|---|---|---|---|---|---|
| Code_Qwen3-4B_Qwen3-4B-Instruct-2507 | 4,41 B (denso) | No disponible | Apache 2.0 | LiveCodeBench v5_v6 35,9; MBPP+ 68,5; media 39,6 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B (base) | 4,41 B (denso) | 32.768 tokens nativos, hasta 131.072 con YaRN (segun el modelo base) | Apache 2.0 | No disponible en la informacion proporcionada | HuggingFace, ampliamente utilizado |
| Qwen/Qwen3-4B-Instruct-2507 (profesor) | 4,41 B (denso) | No disponible en la informacion proporcionada | Apache 2.0 | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de resultados de benchmarks de los modelos base y profesor en las mismas condiciones de evaluación, por lo que no es posible cuantificar la ganancia o la pérdida atribuible a la destilación con los datos aportados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta evaluación de sesgos, toxicidad ni alineación de seguridad.
- Riesgo de alucinación: elevado en el ámbito del código, como en cualquier modelo de este tamaño. Puede generar APIs inexistentes, importaciones erróneas o lógica que compila pero no resuelve el problema. La validación mediante ejecución de tests es imprescindible.
- Dependencia del formato: el modelo se entrenó con la plantilla stdin/stdout de LiveCodeBench y con salida en un único bloque Python cercado. Fuera de ese formato, el rendimiento puede degradarse de forma notable.
- Modo no-thinking obligatorio: fue entrenado y evaluado con `enable_thinking=False`. No hay evidencia de que la traza de razonamiento funcione correctamente y podría producir salidas incoherentes si se activa.
- Ámbito estrecho: es un ajuste especializado en código; no hay datos que respalden su uso como asistente generalista de conversación o para tareas no relacionadas con programación.
- Idiomas: no se declara ninguna lista de idiomas soportados. No hay garantía de comportamiento correcto fuera del inglés técnico habitual en problemas de programación.
- Longitud de contexto: no confirmada para este ajuste. En tareas de repositorio completo o con contexto muy largo, el comportamiento es incierto.
- Madurez del artefacto: 0 descargas y 0 likes, repo creado y actualizado en la misma franja horaria. No hay evidencia de uso en producción ni de validación independiente.
- Riesgo de contaminación: al entrenarse con datos sintéticos generados por un profesor sobre problemas de código, existe la posibilidad de que el banco de preguntas herede sesgos o patrones del profesor, incluida una posible exposición indirecta a problemas de benchmarks públicos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No se detectan cláusulas adicionales en la información proporcionada. Conviene verificar igualmente las condiciones del modelo base y del profesor, que también son Apache 2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gasolsun/Code_Qwen3-4B_Qwen3-4B-Instruct-2507
- Dataset del banco de preguntas: https://huggingface.co/datasets/gasolsun/Code_Qwen3-4B_Qwen3-4B-Instruct-2507
- Modelo base (alumno): https://huggingface.co/Qwen/Qwen3-4B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper o blog del metodo Ask to Distill: no disponible en la informacion proporcionada
- Repositorio de codigo del metodo: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada

Nota: la busqueda web asociada a este modelo no devolvio ningun resultado relevante; los enlaces recuperados no guardan relacion con el modelo ni con destilacion de modelos de lenguaje, por lo que se han descartado.
