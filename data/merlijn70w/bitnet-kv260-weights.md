# merlijn70w/bitnet-kv260-weights

## Resumen

`bitnet-kv260-weights` es una reempaquetado de los pesos del modelo `microsoft/bitnet-b1.58-2B-4T`, creado por el usuario `merlijn70w` (MerlijnW70). No se trata de un modelo nuevo ni de un reentrenamiento: los valores de los pesos no cambian, solo se reorganizan los bytes para que la lógica programable de un FPGA Xilinx Kria KV260 pueda consumirlos de forma directa. El objetivo es ejecutar un modelo de lenguaje ternario en un dispositivo de borde de bajo consumo, sin necesidad de GPU.

La arquitectura subyacente es BitNet b1.58, un transformer que emplea pesos ternarios en el conjunto {-1, 0, +1}. El modelo base tiene 30 capas y, según el artículo técnico (arXiv:2504.12285), se sitúa por debajo de los 3.000 millones de parámetros. El repositorio contiene archivos binarios personalizados para las matrices ternarias, el embedding, la cabeza de salida y las normas. La inferencia se reparte entre la FPGA (productos matriz-vector ternarios) y los cuatro núcleos Cortex-A53 de la placa (atención, normas y re-score de la cabeza). Este proyecto es relevante para la investigación y el prototipado de aceleradores de IA ternarios en entornos embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet b1.58), 30 capas |
| Parametros totales | No disponible (el modelo base se denomina BitNet b1.58 2B4T, bajo 3B segun el paper) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternario base-3 (matrices del modelo y cabeza de preseleccion), bf16 (embedding), int8 con escalas por fila (cabeza de salida), float32 (normas y escalas) |
| Idiomas soportados | No disponible |
| Licencia | MIT (pesos); el codigo del proyecto bitnet-kv260 es Apache 2.0 |
| Formato de pesos | Archivos binarios personalizados (.bin) con empaquetado base-3, no safetensors ni GGUF |

## Arquitectura y entrenamiento

Los pesos provienen del modelo `microsoft/bitnet-b1.58-2B-4T`. La arquitectura es BitNet b1.58, que sustituye las matrices de pesos de un transformer estandar por valores ternarios, reduciendo drasticamente el coste de almacenamiento y de las operaciones de producto matriz-vector. El reempaquetado de `bitnet-kv260-weights` no altera los valores originales: los matrices ternarios se codifican en base-3, empaquetando cinco trits por byte, y los tensores de embedding y normas se mantienen byte a byte iguales al checkpoint original.

La única modificacion tecnica relevante es el diseno de la cabeza de salida en dos etapas. La primera etapa transmite una aproximacion ternaria de la cabeza a traves del fabric de la FPGA y selecciona las 256 filas mas probables. La segunda etapa recalcula esas 256 filas exactamente desde la cabeza int8 en los procesadores ARM y determina el argmax. Segun la model card, en una evaluacion con 2.115 estados ocultos reales, el argmax verdadero nunca cayo por debajo del rango 56 en la aproximacion ternaria, por lo que la lista corta de 256 ofrece un margen de seguridad amplio. No se han proporcionado detalles sobre el dataset, el numero de tokens de entrenamiento ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo usa el pipeline `text-generation` y puede producir texto en lenguaje natural, aunque los idiomas soportados no estan especificados en la informacion disponible.
- Aceleracion por FPGA: todas las matrices ternarias de las 30 capas se procesan en la logica programable del KV260, mientras que la atencion, las normas y el re-score final se ejecutan en los nucleos Cortex-A53.
- Cabeza de salida de dos etapas: garantiza que el token predicho coincide exactamente con el argmax de una cabeza int8 cuantificada por fila, combinando preseleccion ternaria en hardware y calculo exacto en CPU.
- No se mencionan capacidades de vision, audio, tool calling, function calling ni agentes.

## Casos de uso

- Inferencia de lenguaje en el borde sin GPU: el modelo puede ejecutarse de forma autonoma en una placa Kria KV260, usando la FPGA para acelerar las operaciones ternarias. Aplicable en entornos industriales o remotos donde no existen servidores.
- Asistente de texto para mantenimiento de campo: un tecnico puede consultar procedimientos o diagnosticos de maquinaria mediante lenguaje natural, con el modelo embebido en el dispositivo y sin conexion a internet.
- Clasificacion y extraccion de informacion de logs locales: el modelo puede resumir o extraer eventos relevantes de ficheros de log generados por sensores o sistemas de adquisicion, procesando los datos en el propio dispositivo para preservar la privacidad.
- Prototipado de aceleradores FPGA para modelos ternarios: los archivos y el proyecto bitnet-kv260 sirven como referencia para investigadores que quieran implementar motores de inferencia ternaria en logica programable, ya que se documenta la geometria, los offsets y las verificaciones MD5.
- Evaluacion de cuantizacion ternaria en hardware real: permite comparar el comportamiento de un BitNet en FPGA frente a simulaciones en software, ayudando a estudiar la perdida de precision y las tecnicas de escalado.
- Despliegue en robotica movil o drones: al no requerir GPU y ocupar alrededor de 1,5 GB, el modelo puede integrarse en plataformas embebidas con restricciones de peso y consumo para interpretar comandos de texto simples en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para estos pesos en la informacion disponible. El modelo base se presenta en el articulo arXiv:2504.12285 como un avance en la frontera eficiencia-rendimiento para modelos de menos de 3B, pero el contenido proporcionado no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

- Placa objetivo: AMD Xilinx Kria KV260, compuesta por un SoC con FPGA y cuatro nucleos ARM Cortex-A53.
- No se requiere GPU ni VRAM. La memoria necesaria es la propia de la placa y el almacenamiento del repositorio, que ocupa 1,5 GB.
- El modelo debe cargarse mediante el proyecto bitnet-kv260, que verifica todos los archivos contra los tamanos y MD5 registrados en `manifest.json` y `head_t.json`.
- No es compatible con runtimes estandar como vLLM, llama.cpp, Ollama o TGI, porque los pesos no estan en formatos como GGUF o safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el contexto especifico de este reempaquetado para FPGA. El modelo base BitNet b1.58 2B4T se enmarca en la categoria de LLM ternarios y existen implementaciones alternativas como bitnet.cpp, mencionada en el articulo, pero no hay datos de rendimiento comparativo en los materiales proporcionados.

## Limitaciones y advertencias

- Los pesos no constituyen un modelo nuevo: son un reempaquetado sin cambios de valores, por lo que las capacidades y carencias son las del modelo base `microsoft/bitnet-b1.58-2B-4T`.
- Restricciones de uso comercial: aunque la licencia es MIT, la model card de Microsoft advierte expresamente que no se recomienda usar BitNet b1.58 en aplicaciones comerciales o del mundo real sin pruebas y desarrollo adicionales.
- Dependencia de hardware especifico: los archivos solo funcionan en una placa Kria KV260 mediante el proyecto bitnet-kv260. No son portables a otros runtimes ni a otras plataformas FPGA sin modificaciones.
- El tokenizer no esta incluido en el repositorio; hay que descargarlo de `microsoft/bitnet-b1.58-2B-4T`.
- No se proporcionan idiomas soportados ni benchmarks publicados, por lo que el comportamiento multilingue y el rendimiento real deben validarse experimentalmente.
- La garantia de que el argmax coincide con la cabeza int8 depende de que se usen ambas etapas tal como estan implementadas en el proyecto. Si se modifican los archivos, las verificaciones MD5 fallaran y la inferencia no se iniciara.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/merlijn70w/bitnet-kv260-weights
- Proyecto bitnet-kv260 (GitHub): https://github.com/MerlijnW70/bitnet-kv260
- Articulo del modelo base: https://arxiv.org/abs/2504.12285
- Version HTML del articulo: https://arxiv.org/html/2504.12285v1
- Modelo base en HuggingFace: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
- Documentacion del Kria KV260: https://xilinx.github.io/kria-apps-docs/kv260/2022.1/build/html/index.html
