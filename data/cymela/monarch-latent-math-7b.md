# Cymela/Monarch-Latent-Math-7B

## Resumen

Monarch Latent Math 7B es un conjunto de pesos adaptadores publicados por Cymela sobre el modelo abierto de mezcla de expertos OLMoE-1B-7B-0125-Instruct de Ai2. Su particularidad es que no escribe la cadena de razonamiento: en lugar de generar los pasos intermedios en texto, ejecuta un número fijo de pasos internos ocultos (6 por defecto) sobre el estado latente y después emite una respuesta corta de unos 6 tokens. El repositorio no contiene el modelo base completo, sino los adaptadores y tres filas de tokens de control que se aplican sobre OLMoE.

El interés técnico está en la relación entre precisión y coste de decodificación. En GSM8K, responder de golpe acierta un 17,1 %, mientras que con 6 pasos ocultos sube al 35,1 % escribiendo el mismo número de tokens o menos. El modelo base razonando en texto abierto alcanza el 67,8 %, pero consumiendo unos 265 tokens por respuesta, de modo que este checkpoint explora explícitamente el compromiso entre ambas curvas.

Es, por tanto, un artefacto de investigación sobre razonamiento latente, no un asistente general: solo maneja problemas aritméticos de enunciado en inglés, el número de pasos lo fija el usuario y su precisión está muy por debajo de la del modelo base con razonamiento explícito. El repositorio ocupa 0,2 GB y contiene 50.352.128 parámetros en safetensors, correspondientes a los adaptadores y a los tokens de control, no al modelo completo de 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) heredada del modelo base OLMoE-1B-7B-0125-Instruct; los pesos distribuidos son adaptadores de razonamiento latente que se aplican sobre esa base |
| Parametros totales | 50.352.128 en el repositorio (adaptadores + tres filas de tokens de control); el modelo base sobre el que se montan tiene 7B |
| Parametros activos | Aproximadamente 1,3B por token en el modelo base (MoE); los adaptadores añaden unos 50M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en bf16 (ejecución por defecto del script) y fp32 (opción `--dtype fp32`); no se distribuyen GGUF, AWQ, GPTQ ni cuantizaciones de 4 u 8 bits |
| Idiomas soportados | inglés, limitado a problemas aritméticos de enunciado de estilo escolar |
| Licencia | CML-Open-1.0 (Cymela Model License, Open tier 1.0) para los adaptadores; el modelo base queda bajo Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y el script `run_latent_math.py` |

## Arquitectura y entrenamiento

La base es OLMoE-1B-7B-0125-Instruct de Ai2, un transformer con mezcla de expertos y enrutamiento por token que activa aproximadamente 1,3B de sus 7B parámetros en cada paso. Sobre esa arquitectura, Cymela añade un conjunto de adaptadores y tres filas de tokens de control que instrumentan el bucle de razonamiento latente: el script `run_latent_math.py` carga el modelo base, inyecta los adaptadores y ejecuta N pasos internos sobre el estado oculto antes de decodificar la respuesta final. La profundidad no la decide el modelo; la fija el usuario con el argumento `--steps N`, y con `--steps 0` se obtiene el comportamiento de respuesta directa.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del conjunto de datos ni si se emplearon RLHF, DPO u otras etapas de alineación; la model card solo indica que existe un conjunto de problemas de entrenamiento y que SVAMP se verificó contra él mediante coincidencia exacta y casi exacta para garantizar que no hubiera solapamiento. El entrenamiento se realizó en GPUs AMD Instinct MI300X con créditos de AMD Developer Cloud.

La innovación destacable es la evidencia de que los pasos ocultos transportan cómputo específico del problema: sustituirlos por un paso promedio hace caer la precisión de GSM8K al 12 % y usar los pasos de otro problema la deja en el 8 %, frente al 35,1 % con los pasos propios. Además, el beneficio escala con la dificultad: los problemas de dos pasos necesitan uno y los de cuatro siguen mejorando hasta seis.

## Capacidades

- Resolución de problemas aritméticos de enunciado (word problems) de nivel de primaria y secundaria básica en inglés, mediante pasos de razonamiento latente en lugar de cadena de pensamiento explícita.
- Generación de respuestas muy cortas: aproximadamente 6 tokens por respuesta, lo que reduce el coste de decodificación frente al razonamiento en texto.
- Control explícito de la profundidad de cómputo mediante `--steps N`, incluyendo el modo de respuesta directa con `--steps 0` para comparaciones controladas.
- Ejecución por lotes sobre ficheros de preguntas (`--file questions.txt`) y salida estructurada en JSON por respuesta (`--json`).
- Selección de precisión en inferencia: bf16 por defecto o fp32 con `--dtype fp32`.
- No soporta tool calling, function calling, uso como agente, modo thinking visible, visión, audio ni conversación multi-turno; no es un asistente general.

## Casos de uso

- Investigación sobre razonamiento latente: sirve como banco de pruebas reproducible para medir cuánta precisión se obtiene por paso oculto frente a la cadena de pensamiento en texto, con el script ya preparado para alternar entre `--steps 0` y `--steps 6`.
- Ablaciones controladas de cómputo: la comparación entre pasos propios, paso promedio y pasos de otro problema permite aislar si el estado latente codifica información específica de la instancia, un experimento difícil de montar con modelos que razonan en texto.
- Estudio de eficiencia tokens/precisión: con unas 265 unidades por respuesta en el modelo base frente a 6 del adaptador, es un punto de medida útil para analizar curvas de coste en pipelines con presupuesto de decodificación ajustado.
- Docencia y divulgación: el contraste entre 17,1 % sin pasos y 35,1 % con 6 pasos ilustra de forma cuantitativa qué aporta el cómputo interno frente a la verbalización del razonamiento.
- Prototipado en hardware modesto: requiere unos 16 GB de RAM en bf16 y responde en 2-3 segundos por pregunta en una CPU de 8 núcleos, lo que permite experimentar sin GPU dedicada.
- Generación de datos sintéticos de evaluación: las respuestas cortas y deterministas con decodificación greedy son adecuadas para construir líneas base de comparación en experimentos de evaluación de aritmética.
- Base para fine-tuning bajo licencia permisiva: CML-Open-1.0 permite uso comercial y publicar ajustes derivados gratuitamente bajo la misma licencia, lo que facilita extender el enfoque a otros dominios de investigación.

## Benchmarks y rendimiento

GSM8K, partición de test, decodificación greedy, medido en fp32 sobre GPU:

| Configuracion | Precision | Tokens de salida por respuesta |
|---|---|---|
| Sin pasos ocultos | 17,1 % | ~9 |
| 6 pasos ocultos | 35,1 % | ~6 |
| 6 pasos sustituidos por un paso promedio | 12 % | ~6 |
| 6 pasos tomados de otro problema | 8 % | ~6 |
| Modelo base escribiendo su razonamiento completo | 67,8 % | ~265 |

SVAMP, 1.000 problemas no vistos (verificados por coincidencia exacta y casi exacta contra las preguntas de entrenamiento), medido en bf16 sobre CPU:

| Configuracion | Precision |
|---|---|
| Sin pasos ocultos | 39,9 % |
| 6 pasos ocultos | 43,0 % |

La ganancia en SVAMP es de +3,1 puntos (cota inferior unilateral del 97,5 %: +1,0 punto), frente a los +18,0 puntos observados en GSM8K. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria: unos 16 GB de RAM en bf16 para CPU, o una GPU con 16 GB o más. La ejecución en fp32 del modelo base de 7B requiere aproximadamente el doble de memoria, en torno a 28-30 GB (estimación a partir del tamaño de parámetros, no verificada en la model card).
- GPU recomendadas: sirven tarjetas de 16 GB o más, como RTX 4080, RTX 4090, A100 o H100; no es necesario hardware de centro de datos, y el modelo se entrenó en AMD Instinct MI300X.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM en bf16.
- CPU: en un procesador de escritorio de 8 núcleos la carga tarda menos de un minuto y cada pregunta se responde en aproximadamente 2-3 segundos.
- Opciones de despliegue: el script propio `run_latent_math.py` con PyTorch, Transformers 5.x (probado con 5.16.1), safetensors y tokenizers. No hay soporte directo en vLLM, TGI, llama.cpp ni Ollama, porque el bucle de pasos latentes y los tokens de control requieren un forward personalizado.
- Throughput: no disponible más allá del dato de 2-3 segundos por pregunta en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (greedy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Monarch Latent Math 7B, 6 pasos ocultos | 7B base (50M adaptadores), ~1,3B activos | no disponible | 35,1 % | CML-Open-1.0 | HuggingFace, requiere descargar la base de Ai2 por separado |
| Monarch Latent Math 7B, sin pasos ocultos | ídem | no disponible | 17,1 % | CML-Open-1.0 | ídem |
| OLMoE-1B-7B-0125-Instruct con razonamiento escrito | 7B, ~1,3B activos | no disponible | 67,8 % | Apache 2.0 | HuggingFace (Ai2) |

No se han proporcionado datos de benchmarks de otros modelos de razonamiento matemático de tamaño comparable (por ejemplo, destilados de la familia Qwen-Math o DeepSeek-R1-Distill) en la información disponible, por lo que no se incluye comparación numérica con ellos.

## Limitaciones y advertencias

- El checkpoint se seleccionó sobre la partición de test de GSM8K, según reconoce el propio autor, por lo que las cifras de 35,1 % pueden ser optimistas para problemas no vistos.
- La precisión es muy inferior a la del modelo base razonando en texto (35,1 % frente a 67,8 % en GSM8K); el autor indica explícitamente que no se debe confiar en sus respuestas.
- Solo admite problemas aritméticos de enunciado en inglés, con estilo de primaria; otras entradas producen respuestas pobres o sin sentido.
- La profundidad de cómputo la fija el usuario: el modelo no elige cuántos pasos necesita, lo que limita su uso autónomo en producción.
- Las cifras de GSM8K se midieron en fp32 sobre GPU, mientras que la ejecución por defecto del script es en bf16 y puede dar respuestas ligeramente distintas.
- Riesgo de alucinación aritmética alto por diseño: el modelo genera una respuesta de unos 6 tokens sin razonamiento verificable, de modo que no hay traza auditable del cálculo.
- No soporta tool calling, agentes, conversación multi-turno ni instrucciones de sistema; no debe presentarse como asistente.
- Idiomas distintos del inglés y contextos largos no están cubiertos ni documentados; la longitud de contexto del modelo base no se especifica en esta ficha.
- Licencia: CML-Open-1.0 permite uso comercial y la publicación gratuita de fine-tunes bajo la misma licencia, pero prohíbe vender los pesos y rehostear los pesos originales. El modelo base queda sujeto a Apache 2.0 y requiere atribución a Ai2.
- Los adaptadores no incluyen el modelo base: sin descargar OLMoE-1B-7B-0125-Instruct (revisión b89a7c4bc24fb9e55ce2543c9458ce0ca5c4650e) los ficheros del repositorio no son utilizables.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Cymela/Monarch-Latent-Math-7B
- Modelo base OLMoE-1B-7B-0125-Instruct: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Licencia del modelo (CML-Open-1.0): fichero `LICENSE` del repositorio
- Licencia y atribución de la base: ficheros `LICENSE-BASE-Apache-2.0` y `NOTICE` del repositorio
- Script de inferencia: `run_latent_math.py`, incluido en el repositorio
- Contacto del autor: contact@cymela.com
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los resultados obtenidos corresponden a servicios meteorológicos sin relación con el proyecto, por lo que no se incluyen como referencias.
