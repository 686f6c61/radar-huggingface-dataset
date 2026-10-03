# rasyosef/Qwen3.5-2B-DFlash2

## Resumen

Qwen3.5-2B-DFlash2 es un modelo draft (borrador) de decodificacion especulativa publicado por el usuario rasyosef. No es un modelo de lenguaje autonomo: se acopla a Qwen/Qwen3.5-2B, que actua como verificador, y propone bloques de tokens que el verificador valida en una sola pasada forward. El resultado es identico al de ejecutar el verificador por si solo, de modo que la aceleracion es sin perdida y no altera la distribucion de salida.

El modelo tiene 354.243.584 parametros en bfloat16 (aproximadamente 0,71 GB) y se compone de 4 capas tipo Qwen3: las tres primeras con atencion de ventana deslizante de 2048 tokens y la ultima con atencion completa. Con un tamano de bloque de 8, el drafter propone 7 tokens por paso y el verificador los comprueba de una vez. Se entreno con la libreria speculators del proyecto vLLM sobre 100.000 prompts filtrados de Open PerfectBlend, con respuestas regeneradas por el propio verificador.

Su relevancia es practica: la longitud media de aceptacion es de 2,472 tokens comprometidos por paso de verificacion (hasta 3,638 en math_reasoning), medida sobre 227.358 pasos en los nueve subconjuntos de RedHatAI/speculator_benchmarks. La licencia Apache 2.0 y la integracion con vLLM permiten desplegarlo directamente en produccion sobre el verificador Qwen3.5-2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 como modelo draft de decodificacion especulativa: 4 capas, hidden size 2048, intermediate size 6144 |
| Parametros totales | 354.243.584 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada para el verificador; ventana deslizante de 2048 tokens en 3 de las 4 capas y atencion completa en la ultima; entrenado con secuencias de 4096 tokens |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bfloat16 |
| Idiomas soportados | no declarados; entrenado con Open PerfectBlend, de composicion predominantemente inglesa |
| Licencia | Apache 2.0 (heredada del verificador) |
| Formato de pesos | safetensors (bfloat16), con custom_code (requiere trust_remote_code) |
| Modelo base / verificador | Qwen/Qwen3.5-2B (vision-lenguaje) |
| Tamano de bloque | 8 (7 tokens propuestos por paso de borrador) |
| Longitud de aceptacion media | 2,472 sobre los 9 subconjuntos de speculator_benchmarks |
| Tamano del repositorio | 6,7 GB |

## Arquitectura y entrenamiento

El drafter es un transformer compacto de 4 capas tipo Qwen3 con hidden size 2048, intermediate size 6144, 16 cabezas de atencion sobre 4 cabezas KV y dimension de cabeza 128. Las tres primeras capas emplean atencion de ventana deslizante con ventana de 2048 tokens y la cuarta usa atencion completa. El modelo consume estados ocultos auxiliares de las capas 1, 5, 9, 13, 17 y 21 del verificador, una estrategia habitual en drafters tipo EAGLE/DFlash que acompana la prediccion con informacion interna del modelo grande. Los pesos se distribuyen en bfloat16.

El entrenamiento se realizo con la libreria speculators (vLLM) durante 4 epocas, con learning rate 4e-4, optimizador AdamW y schedule coseno con 4 por ciento de warmup, sobre 100.000 prompts filtrados de Open PerfectBlend cuyas respuestas fueron regeneradas por el propio verificador y divididos 96/4 en entrenamiento y validacion. La funcion de perdida combina dos terminos con pesos `{"ce": 0.1, "tv": 0.9}`. Las muestras se prepararon a 1024 tokens, la secuencia de entrenamiento fue de 4096 tokens y se admitieron hasta 512 anclas por muestra. Los estados ocultos del verificador se extraian bajo demanda de un servidor vLLM en ejecucion y se eliminaban tras su uso, en lugar de almacenarse en disco. El codigo de entrenamiento esta publicado en rasyosef/train-dspark-draft-models.

## Capacidades

- Generacion especulativa de tokens: propone 7 tokens por paso (bloque de 8) que el verificador acepta o rechaza, sin modificar la salida final.
- Aceleracion sin perdida: al validar el verificador todos los tokens, la calidad y los sesgos del texto generado son exactamente los de Qwen3.5-2B.
- Mayor eficacia en matematicas y codigo: aceptacion media de 3,638 en math_reasoning y 2,808 en HumanEval frente a valores por debajo de 2,0 en traduccion, resumen y qa.
- Uso como cabecera de borrador con estados ocultos auxiliares de las capas 1, 5, 9, 13, 17 y 21 del verificador.
- Integracion nativa con vLLM, que carga el verificador automaticamente desde la configuracion y expone un endpoint compatible con la API de OpenAI.
- No admite uso autonomo: carece de tokenizer propio operativo como modelo independiente y solo funciona emparejado con Qwen3.5-2B.
- Capacidades multimodales: no disponibles en el drafter; el verificador es vision-lenguaje, pero el borrador se entreno solo con texto.
- Soporte de tool calling, agentes y multilingueismo: heredados del verificador, no del drafter; la aceptacion medida en tool_call es de 2,174.

## Casos de uso

- Servicio de inferencia en produccion sobre Qwen3.5-2B: desplegando el drafter con `vllm serve rasyosef/Qwen3.5-2B-DFlash2`, cada paso de verificacion compromete 2,472 tokens de media en lugar de 1, lo que reduce el numero de pasadas forward necesarias por respuesta sin tocar la calidad de la salida.
- Asistentes de razonamiento matematico: es el subconjunto con mayor aceptacion (3,638 de longitud media, con 17,4 por ciento de aceptacion incluso en la septima posicion), por lo que tareas de resolucion de problemas paso a paso obtienen el mayor ahorro de computo.
- Generacion de codigo en produccion: con 2,808 de aceptacion en HumanEval y mas del 10 por ciento de aceptacion hasta la posicion 5, encaja en asistentes de autocompletado y revision de codigo servidos con vLLM.
- Atencion al cliente automatizada: sobre trafico tipo question (2,289) y writing (2,269) el drafter aporta entre 1,2 y 1,3 tokens extra por paso, suficiente para amortizar el coste de borrador en conversaciones multi-turno siempre que el verificador mantenga el contexto.
- Pipelines de RAG: con 2,266 de aceptacion en el subconjunto rag, reduce el coste por consulta en sistemas de pregunta-respuesta documental donde el prompt es largo y repetitivo.
- Agentes con tool calling: la aceptacion en tool_call es de 2,174, la mas baja del grupo intermedio, de modo que el ahorro existe pero es menor; conviene medir antes de desplegarlo en flujos con muchas llamadas a funciones.
- Reduccion de coste por token en GPU cloud: al ser un modelo de 0,71 GB que comparte GPU con el verificador, permite aumentar el throughput por instancia sin cambiar de hardware ni reentrenar el modelo base.
- Traduccion y resumen por lotes: son los casos con menor retorno (1,952 y 1,883), por lo que solo tiene sentido si el trafico es mixto y el drafter ya esta cargado para otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval de exactitud) porque se trata de un modelo borrador que no genera respuestas propias. El autor si publica la evaluacion de aceptacion con `evaluate.py throughput` sobre los nueve subconjuntos de RedHatAI/speculator_benchmarks. `acceptance_length` es la media de tokens comprometidos por paso de verificacion, incluido el token de bonificacion, con suelo 1,0 y techo 8,0 para un bloque de 8.

| Subconjunto | Longitud de aceptacion | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 | pos_5 | pos_6 |
|---|---|---|---|---|---|---|---|---|
| math_reasoning | 3,638 | 72,1 % | 53,6 % | 40,9 % | 32,3 % | 26,2 % | 21,4 % | 17,4 % |
| HumanEval | 2,808 | 60,9 % | 40,1 % | 27,7 % | 19,9 % | 14,3 % | 10,4 % | 7,5 % |
| question | 2,289 | 51,5 % | 28,6 % | 17,6 % | 12,2 % | 8,8 % | 6,1 % | 4,1 % |
| writing | 2,269 | 50,2 % | 27,5 % | 17,0 % | 11,9 % | 8,9 % | 6,6 % | 4,7 % |
| rag | 2,266 | 53,6 % | 30,9 % | 18,1 % | 10,9 % | 7,0 % | 4,0 % | 2,2 % |
| tool_call | 2,174 | 50,5 % | 25,9 % | 15,7 % | 10,2 % | 7,1 % | 4,7 % | 3,2 % |
| translation | 1,952 | 52,3 % | 26,4 % | 9,7 % | 4,2 % | 1,4 % | 0,7 % | 0,3 % |
| summarization | 1,883 | 45,1 % | 21,0 % | 10,4 % | 5,7 % | 3,3 % | 1,8 % | 1,0 % |
| qa | 1,828 | 42,2 % | 19,8 % | 9,4 % | 5,3 % | 3,3 % | 1,9 % | 1,0 % |

La media ponderada de todos los subconjuntos es 2,472 sobre 227.358 pasos de verificacion. La aceptacion en primera posicion oscila entre el 42 y el 72 por ciento, y solo math_reasoning y HumanEval se mantienen por encima del 10 por ciento en la posicion 4. El autor senala que translation es el subconjunto mas pequeno (1.225 pasos), por lo que su cifra debe tratarse como ruidosa. La aceleracion real en throughput no ha sido medida para este checkpoint.

## Requisitos de hardware

- Pesos del drafter: 354,2 millones de parametros en bfloat16, aproximadamente 0,71 GB de VRAM.
- Verificador: Qwen3.5-2B en bfloat16 ocupa del orden de 4 a 5 GB de VRAM (estimacion a partir del numero de parametros, no confirmada en la informacion disponible).
- Presupuesto total estimado: entre 6 y 8 GB de VRAM sumando drafter, verificador, cache KV y overhead del runtime, en funcion de la longitud de contexto y del batch.
- GPU de consumo: cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 de 24 GB). En tarjetas de 8 GB el margen es muy ajustado.
- GPU de datacenter recomendadas para servicio: L4, L40S, A100 y H100, donde el drafter representa una fraccion minima de la memoria y el cuello de botella pasa a ser el verificador.
- Despliegue: vLLM es la via soportada, cargando el verificador automaticamente desde la configuracion mediante `vllm serve rasyosef/Qwen3.5-2B-DFlash2 --port 8000 --gpu-memory-utilization 0.8`. El modelo se entreno con speculators y requiere `trust_remote_code` por el custom_code.
- Otras opciones: llama.cpp, Ollama y TGI no aparecen soportadas en la informacion disponible para este formato de drafter.
- Latencia y throughput: no medidos para este checkpoint. Como referencia externa, otro drafter DFlash2 para gemma-4-E2B-it reporta 167 a 626 tokens/s y hasta 3,74x de aceleracion en tareas de matematicas, pero son cifras de un modelo distinto y de otro verificador.

## Comparativa con modelos similares

| Modelo | Modelo base | Parametros | Bloque | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-2B-DFlash2 (este) | Qwen3.5-2B | 354,2 M | 8 (7 tokens) | 2,472 de aceptacion media; 3,638 en math_reasoning | Apache 2.0 |
| DFlash2 para gemma-4-E2B-it (z-lab/dflash) | gemma-4-E2B-it | no disponible | no disponible | 167 a 626 tokens/s; hasta 3,74x en Math | no disponible |
| Qwen3.5-2B sin drafter (linea base) | Qwen3.5-2B | no aplica | no aplica | 1,0 token comprometido por paso (suelo) | Apache 2.0 |
| Drafters tipo EAGLE-3 para modelos de 2B a 3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con cabeceras tipo EAGLE-3 o Medusa no puede completarse con los datos disponibles en esta busqueda; las cifras del drafter de gemma-4-E2B-it provienen de un issue del repositorio z-lab/dflash y corresponden a otro verificador, por lo que no son extrapolables a Qwen3.5-2B.

## Limitaciones y advertencias

- Solo funciona con Qwen/Qwen3.5-2B y no es utilizable como modelo autonomo, ni siquiera como generador de texto independiente.
- El verificador es vision-lenguaje, pero el drafter se entreno unicamente con texto y se evaluo en benchmarks de texto, por lo que la aceptacion con entradas de imagen no esta probada.
- La aceptacion cae bruscamente a partir de las primeras posiciones: fuera de math_reasoning y codigo, la mayor parte del borrador de 7 tokens se descarta, de modo que un bloque mas corto capturaria casi la misma ganancia con menor coste de borrador.
- En traduccion, resumen y qa la longitud de aceptacion baja de 2,0, por lo que la mejora en esos flujos es limitada.
- El throughput no ha sido medido para este checkpoint; la aceleracion real depende del hardware y de la mezcla de trafico.
- Al ser una verificacion sin perdida, los sesgos, errores y alucinaciones del verificador se transmiten intactos a la salida; el drafter no los corrige ni los atenua.
- El subconjunto de traduccion de la evaluacion es el mas pequeno (1.225 pasos) y su cifra es poco fiable.
- Requiere custom_code y `trust_remote_code`, lo que implica ejecutar codigo del autor del repositorio; conviene revisarlo antes de usarlo en produccion.
- Licencia Apache 2.0 sin restricciones adicionales para uso comercial, heredada del verificador; el codigo de entrenamiento de speculators tambien es Apache 2.0.
- Adopcion muy baja: 31 descargas y 1 like en el momento de la consulta, y sin pipeline declarado en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasyosef/Qwen3.5-2B-DFlash2
- Verificador: https://huggingface.co/Qwen/Qwen3.5-2B
- Libreria de entrenamiento speculators: https://github.com/vllm-project/speculators
- Codigo de entrenamiento del autor: https://github.com/rasyosef/train-dspark-draft-models
- Dataset de entrenamiento Open PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluacion speculator_benchmarks: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Issues de z-lab/dflash (drafter DFlash2 para gemma-4-E2B-it): https://github.com/z-lab/dflash/issues
- Issues de vllm-project/speculators: https://github.com/vllm-project/speculators/issues
