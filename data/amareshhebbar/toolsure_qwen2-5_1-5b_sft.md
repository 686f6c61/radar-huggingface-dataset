# AmareshHebbar/ToolSure_Qwen2.5_1.5B_SFT

## Resumen

ToolSure_Qwen2.5_1.5B_SFT es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B-Instruct, desarrollado por AmareshHebbar, orientado especificamente a mejorar la fiabilidad de las llamadas a funciones (function calling) en modelos pequenos. El problema que aborda es concreto: los modelos de parametros reducidos tienden a generar JSON malformado, inventar nombres de funciones, omitir o equivocar argumentos, o emitir llamadas cuando ninguna herramienta ofrecida encaja con la peticion. El ajuste entrena al modelo para escribir llamadas correctas y para decidir cuando la respuesta adecuada es texto plano.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) con 1.543.714.304 parametros totales y se distribuye en safetensors bf16 bajo licencia Apache 2.0. Forma parte de una coleccion de seis variantes (ToolSure) que comparan cinco metodos de entrenamiento sobre los mismos datos, ademas de decodificacion restringida, todo evaluado con la misma tabla de resultados.

Su relevancia radica en que demuestra que un modelo de 1.5B puede acercarse al rendimiento de function calling de un modelo de 7B cuando se entrena especificamente para ello, manteniendo latencias bajas y coste reducido por consulta, lo que lo hace atractivo para despliegues de agentes a gran escala donde el coste por llamada es critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso max_len 3584) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, inicializado desde Qwen2.5-1.5B-Instruct. El entrenamiento consistio en un ajuste fino supervisado con LoRA en bf16 sobre llamadas a herramientas correctas, incluyendo ademas ejemplos donde la respuesta correcta es texto plano porque ninguna herramienta ofrecida encaja. El adaptador LoRA se fusiono en safetensors bf16 completos, y el adaptador original se conserva en el subdirectorio `adapter/`.

Los hiperparametros de entrenamiento fueron: learning rate 1e-4, una epoca, micro-batch 4 con acumulacion de gradiente 8, warmup ratio 0.03, longitud maxima de secuencia 3584, LoRA con r=64, alpha=128 y dropout 0.0. El dataset de entrenamiento es AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B. La innovacion principal no es arquitectonica sino de datos y objetivo: entrenar explicitamente la decision de no llamar a ninguna herramienta (irrelevancia), un aspecto que la decodificacion restringida por gramatica no puede resolver por si sola, ya que garantiza JSON valido y nombres reales pero no la eleccion correcta de funcion ni los valores de los argumentos.

## Capacidades

- Generacion de texto conversacional en ingles sobre la base de Qwen2.5-1.5B-Instruct.
- Function calling / tool use fiable: emite llamadas en el formato estandar de Qwen2.5, un bloque `<tool_call>{...}</tool_call>` por llamada.
- Llamadas en paralelo (parallel function calling) y llamadas multiples con multiples parametros.
- Decision de irrelevancia: capacidad de responder en texto plano cuando ninguna herramienta ofrecida es adecuada.
- Integracion directa con servidores que parsean llamadas de Qwen2.5 (por ejemplo vLLM con `--tool-call-parser hermes`).
- Compatible con text-generation-inference y endpoints compatibles segun los tags del repositorio.
- Razonamiento multi-paso y uso como agente: no documentado explicitamente en la model card, aunque el entrenamiento en tool use lo habilita parcialmente.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Agentes de atencion al cliente con herramientas: el modelo decide si debe consultar una API de pedidos, un sistema de tickets o responder directamente, gracias al entrenamiento especifico en irrelevancia (29.2% con prompt estricto en el modelo base frente a la mejora del ajuste), evitando llamadas innecesarias.
- Orquestacion de pipelines de datos: en un flujo donde el agente debe invocar funciones de extraccion, transformacion y carga, el modelo emite llamadas con nombres y argumentos validos en formato Qwen2.5, parseables por vLLM sin cambios en el servidor.
- Enrutamiento de consultas en produccion: con una latencia p50 de 0.20 s en vLLM a batch 1 y un coste estimado de 0.0054 USD por 1000 consultas, es adecuado para clasificar y derivar peticiones a herramientas a gran volumen.
- Asistentes de desarrollo integrados en IDE: el modelo puede generar llamadas a funciones de busqueda de codigo, ejecucion de tests o consulta de documentacion, con JSON valido garantizado por el entrenamiento (99.4% de tasa de parseo JSON en el modelo base, mantenida tras el ajuste).
- Automatizacion de tareas ofimaticas: invocacion de funciones para crear eventos, enviar correos o consultar calendarios, donde la eleccion correcta de funcion y la ausencia de llamadas espurias son criticas.
- Despliegue en entornos con GPU de consumo: al ser un modelo de 1.5B en bf16 (aproximadamente 3.1 GB de pesos), puede ejecutarse en GPUs consumer, lo que permite prototipar agentes localmente antes de escalar.
- Evaluacion y benchmarking de function calling: util como referencia para comparar metodos de entrenamiento (SFT, prompting, decodificacion restringida) sobre el mismo dataset, segun la tabla publicada por el autor.

## Benchmarks y rendimiento

Los resultados publicados por el autor usan decodificacion greedy y el mismo checker. Las columnas BFCL son precision AST sobre las categorias non-live del Berkeley Function Calling Leaderboard, con una reimplementacion del checker AST de BFCL. Irrelevance es la proporcion de prompts donde el modelo correctamente no hizo llamada. xLAM held out es precision exacta de llamada sobre 500 ejemplos de xLAM nunca usados en entrenamiento. La latencia es batch size 1 en vLLM; el coste asume 1.0 USD/hora de GPU al throughput medido en batch.

| Modelo | BFCL Simple | BFCL Multiple | BFCL Parallel | BFCL Parallel multiple | BFCL AST mean | Irrelevance | xLAM held out | JSON parse rate | Hallucinated function rate | Latency p50 (s) | Coste por 1k consultas (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5 1.5B Instruct (prompted) | 91.5 | 86.5 | 80.0 | 78.5 | 84.1 | 63.3 | 84.0 | 99.4 | 0.7 | 0.20 | 0.0054 |
| Qwen2.5 1.5B Instruct (strict system prompt) | 91.5 | 87.5 | 79.0 | 76.5 | 83.6 | 29.2 | 84.0 | 99.2 | 0.9 | 0.21 | 0.0051 |
| Qwen2.5 1.5B Instruct (constrained decoding) | 91.5 | 87.0 | 81.0 | 79.0 | 84.6 | 65.8 | 83.0 | 99.6 | 0.0 | 1.17 | 0.0630 |
| Qwen2.5-7B-Instruct (prompted, reference) | 94.5 | 93.5 | 88.5 | 86.0 | 90.6 | 65.8 | 86.6 | 99.7 | 0.6 | 0.71 | 0.0155 |

Nota: la tabla publicada en la model card no incluye la fila del propio modelo ajustado ToolSure_Qwen2.5_1.5B_SFT; las filas mostradas corresponden al modelo base en distintas configuraciones y a la referencia de 7B. No se han publicado resultados de MMLU en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3.1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1.6 GB de pesos; en 4 bits, aproximadamente 0.8 GB (aunque el autor no publica pesos cuantizados, la conversion es posible con herramientas estandar).
- GPU recomendadas: A100, H100 para despliegues de alto throughput; RTX 4090, RTX 3090, L4 y A10G para inferencia en produccion moderada.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, etc.) en bf16 o cuantizado.
- Opciones de despliegue: vLLM (soporte documentado con `--tool-call-parser hermes`), text-generation-inference (tag `text-generation-inference`), transformers, y previsiblemente llama.cpp/Ollama tras conversion a GGUF (no documentado por el autor).
- Latencia y throughput: latencia p50 de 0.20 s en vLLM a batch 1 segun la tabla del autor; coste estimado de 0.0054 USD por 1000 consultas asumiendo 1.0 USD/hora de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL AST mean | Irrelevance | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ToolSure_Qwen2.5_1.5B_SFT | 1.5B | no disponible | no publicado para el modelo ajustado | no publicado para el modelo ajustado | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | no disponible | 84.1 (prompted) / 84.6 (constrained decoding) | 63.3 / 65.8 | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | no disponible | 90.6 (prompted) | 65.8 | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos incluidos en la tabla del autor; no se dispone de datos de otras alternativas de function calling de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea inferior.
- La longitud de contexto efectiva no se especifica en la model card; el entrenamiento uso secuencias de hasta 3584 tokens, por lo que contextos mucho mayores pueden degradar la calidad de las llamadas.
- Riesgo de alucinacion de funciones y argumentos: aunque el entrenamiento reduce este problema, la tabla del modelo base muestra tasas de funcion alucinada de 0.6-0.9%; no se publica la tasa del modelo ajustado.
- La decision de irrelevancia es el punto mas debil del modelo base (29.2% con prompt estricto); el ajuste busca mejorarla, pero no se publican cifras del modelo final en la model card, por lo que la magnitud de la mejora no es verificable con los datos disponibles.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen2.5-1.5B-Instruct y del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.
- La tabla de resultados no incluye la fila del propio modelo ajustado, lo que impide comparar directamente su rendimiento con el del modelo base en las mismas metricas.
- No se publican pesos cuantizados oficiales (GGUF, AWQ, GPTQ); su uso en produccion con cuantizacion requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B
- Coleccion ToolSure: https://huggingface.co/collections/AmareshHebbar/toolsure-6af816d00a621b28fede6bab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Berkeley Function Calling Leaderboard (BFCL): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
