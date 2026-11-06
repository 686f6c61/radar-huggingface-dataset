# mradermacher/PhantomReasoning-Qwen3-1.7B-gsminf-i1-GGUF

## Resumen

PhantomReasoning-Qwen3-1.7B-gsminf-i1-GGUF es una publicacion de cuantizaciones GGUF generada por mradermacher a partir del modelo base kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf. El modelo subyacente parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, y ha sido sometido a un proceso de ajuste fino orientado a razonamiento sobre datos de tipo GSM (problemas matematicos de escuela) segun indica el sufijo "gsminf" del nombre. El repositorio en si no contiene pesos originales en safetensors, sino un conjunto de ficheros GGUF cuantizados en distintos niveles de precision, pensados para inferencia en llama.cpp y derivados.

El interes practico de esta ficha es limitado pero concreto: se trata de un artefacto de distribucion (un "quant dump") que facilita ejecutar un modelo de razonamiento de ~1.7B parametros en hardware modesto, incluyendo CPU y GPUs de consumo. No aporta innovaciones arquitectonicas propias; su valor esta en el empaquetado de cuantizaciones con imatrix (importancia ponderada) para preservar calidad en niveles agresivos como IQ2 e IQ3.

La informacion publicada por el autor es minima: la model card unicamente documenta metadatos del proceso de cuantizacion (version, tipo de conversion, lista de quants generados) y enlaza al modelo de origen. No se declaran licencia, idiomas, pipeline ni resultados de evaluacion, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B; detalles no especificados en la model card) |
| Parametros totales | Aproximadamente 1.7B (el campo de parametros en safetensors del repo, 1.034.740, corresponde a un recuento parcial y no al total del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp; cuantizacion ponderada por imatrix) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, que en su version original incorpora mecanismos de atencion estandar y un modo de razonamiento explicito ("thinking"). Sobre esa base, el autor del modelo de origen (kilian-group) aplico un ajuste fino con el sufijo "gsminf", que sugiere entrenamiento o inferencia destilada sobre problemas matematicos tipo GSM (grade-school math). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El repositorio de mradermacher no entrena nada: ejecuta el pipeline de cuantizacion de llama.cpp sobre los pesos convertidos a formato HF, generando el conjunto de quants listado en la model card. Los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, y que las cuantizaciones son "weighted/imatrix", es decir, calculadas con una matriz de importancia para reducir la perdida de calidad en niveles bajos de bits. Se incluyen tanto quants K (Q2_K a Q6_K) como quants I (IQ1 a IQ4), ademas de Q4_0 y Q4_1 heredados.

## Capacidades

- Generacion de texto autorregresiva y razonamiento paso a paso, heredados de la familia Qwen3.
- Razonamiento matematico orientado a problemas de tipo GSM, segun el ajuste fino del modelo de origen.
- Capacidad multilingue probable (Qwen3 se entrena con cobertura multilingue amplia), aunque no se declara en la model card.
- Soporte de tool calling y function calling: no confirmado para este ajuste concreto; no disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el "thinking mode" de Qwen3 podria estar presente pero no se documenta.
- Capacidades de vision o audio: no disponibles (modelo de texto).
- Ejecucion en CPU y GPU de consumo gracias al formato GGUF y al reducido tamano del modelo.

## Casos de uso

- Inferencia local en portatiles sin GPU dedicada: las cuantizaciones Q4_K_M e IQ4_XS de un modelo de ~1.7B ocupan del orden de 1 GB, por lo que caben en RAM y se ejecutan con llama.cpp a velocidades interactivas en CPU modernas.
- Prototipado de pipelines de razonamiento matematico: util para probar tecnicas de chain-of-thought o verificacion de soluciones en problemas GSM antes de escalar a modelos mayores.
- Servicios embebidos y edge computing: el modelo cuantizado a IQ2 o Q3 puede desplegarse en dispositivos con memoria limitada (Raspberry Pi 5, mini-PC, moviles de gama alta) para tareas de texto corto.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de veinte variantes del mismo modelo, lo que permite medir empiricamente la degradacion de calidad entre Q6_K, Q4_K_M e IQ2_M sobre un mismo conjunto de prompts.
- Generacion de texto auxiliar en herramientas de desarrollo: autocompletado de documentacion, resumen de fragmentos cortos o generacion de tests unitarios simples, ejecutado localmente sin dependencia de API.
- Filtrado y clasificacion de texto en pipelines de datos: con contexto corto y bajo coste por token, adecuado para etiquetado aproximado de grandes volumenes en local.
- Base para experimentos de destilacion o ajuste fino adicional: al ser un modelo pequeno y con licencia por determinar, sirve como punto de partida para investigacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.6-0.8 GB en IQ2_M/IQ3, en torno a 1.0-1.1 GB en Q4_K_M, y cerca de 1.4-1.6 GB en Q6_K, asumiendo overhead de contexto minimo; las cifras exactas dependen del tamano de contexto configurado.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4 y superiores; para IQ2 basta 1 GB.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual, incluidas iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), llama-cpp-python, y servidores compatibles con GGUF como llama.cpp server o text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles; en CPU moderna se espera un rendimiento interactivo (decenas de tokens por segundo) dado el reducido tamano, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PhantomReasoning-Qwen3-1.7B-gsminf-i1-GGUF (este) | ~1.7B | No disponible | No disponible | GGUF (multiples quants) | Ajuste fino orientado a GSM sobre Qwen3-1.7B |
| Qwen3-1.7B (original) | 1.7B | 32K (segun documentacion de Qwen) | Apache 2.0 (segun documentacion de Qwen) | safetensors, GGUF | Modelo base con modo thinking; referencia de calidad |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32K (segun documentacion de DeepSeek) | MIT (segun documentacion de DeepSeek) | safetensors, GGUF | Destilado de razonamiento ampliamente evaluado en matematicas |
| SmolLM2-1.7B-Instruct | 1.7B | 8K (segun documentacion de Hugging Face) | Apache 2.0 (segun documentacion de Hugging Face) | safetensors, GGUF | Alternativa generalista de mismo tamano |

La comparacion con Qwen3-1.7B original y con DeepSeek-R1-Distill-Qwen-1.5B es la mas directa por tamano y orientacion a razonamiento; sin embargo, al no haber benchmarks publicados para este ajuste, no es posible afirmar si mejora o degrada la calidad respecto a su base.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, por lo que se desconoce si el ajuste "gsminf" mejora o perjudica el rendimiento respecto a Qwen3-1.7B original.
- Licencia no declarada: no se especifica en la model card; antes de uso comercial debe verificarse la licencia del modelo de origen (kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf) y de Qwen3-1.7B.
- Riesgo de alucinacion: inherente a modelos de este tamano, especialmente en razonamiento matematico donde el ajuste fino puede producir pasos plausibles pero incorrectos.
- Idiomas no documentados: no se confirma la cobertura multilingue; el uso en castellano no esta verificado.
- Contexto no documentado: se desconoce la ventana efectiva tras el ajuste fino; asumir la de Qwen3-1.7B (32K) sin verificar es arriesgado.
- Cuantizaciones agresivas (IQ1, IQ2, Q2_K): la degradacion de calidad puede ser significativa; para uso en produccion se recomienda Q4_K_M o superior.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso por terceros ni de validacion comunitaria.
- El dato de parametros en safetensors del repo (1.034.740) no corresponde al total del modelo; conviene no usarlo como referencia de tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/PhantomReasoning-Qwen3-1.7B-gsminf-i1-GGUF
- Modelo de origen: https://huggingface.co/kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf
- Qwen3-1.7B (modelo base de la familia): https://huggingface.co/Qwen/Qwen3-1.7B
- llama.cpp (motor de cuantizacion e inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/mradermacher
