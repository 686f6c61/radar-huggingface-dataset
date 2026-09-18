# amd/granite-4.0-h-tiny-w8a8-llmcompressor

## Resumen

amd/granite-4.0-h-tiny-w8a8-llmcompressor es una versión cuantizada del modelo ibm-granite/granite-4.0-h-tiny publicada por AMD. Se trata de un modelo de generación de texto de arquitectura GraniteMoeHybridForCausalLM, es decir, un transformer híbrido que combina bloques de atención completa con bloques Mamba (atención lineal) y una capa MoE con 64 expertos enrutados más un MLP compartido en cada capa. El repositorio declara 6.939.037.248 parámetros totales y un tamaño de 7,1 GB, con los pesos en INT8.

El problema que resuelve es el coste de memoria y el rendimiento de la inferencia en CPU. AMD ha aplicado cuantización W8A8 (8 bits en pesos y 8 bits en activaciones dinámicas) mediante LLM Compressor con el algoritmo Round-to-Nearest, reduciendo los pesos de 12,9 GiB a 6,6 GiB en disco, aproximadamente un 49% menos. El resultado está optimizado para inferencia en CPU sobre procesadores AMD EPYC con la pila ZenDNN y ZenTorch, y se sirve a través de vLLM v0.29.0.

Su relevancia actual es doble: por un lado, permite desplegar un modelo híbrido Mamba-MoE de casi 7.000 millones de parámetros en servidores sin GPU; por otro, demuestra una receta de cuantización reutilizable con LLM Compressor en la que solo se excluyen `lm_head` y el router del MoE, manteniendo los 64 expertos enrutados cuantizados. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybridForCausalLM (híbrido Mamba-MoE con bloques de atención completa) |
| Parámetros totales | 6.939.037.248 (6,94 mil millones) |
| Parámetros activos | No disponible (MoE con 64 expertos enrutados por capa más un MLP compartido) |
| Longitud de contexto | No disponible en la información proporcionada (definida por el modelo base ibm-granite/granite-4.0-h-tiny) |
| Tipos de cuantización | W8A8: pesos INT8 simétricos por canal (estáticos) y activaciones INT8 simétricas por token (dinámicas); formato compressed-tensors `num_bits=8, type=int, symmetric=true`. El modelo base está en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors int-quantized (no se publica GGUF) |

## Arquitectura y entrenamiento

El modelo deriva de ibm-granite/granite-4.0-h-tiny y no se ha reentrenado: la única transformación aplicada es la cuantización. La arquitectura consta de 40 capas, de las cuales 4 son bloques de atención completa y 36 son bloques Mamba (atención lineal con espacio de estados). Cada capa incorpora además un bloque MoE con 64 expertos enrutados junto a un MLP compartido. El proceso de cuantización, realizado con LLM Compressor v0.13.0 mediante el algoritmo Round-to-Nearest (RTN), es data-free, por lo que no requiere conjunto de calibración.

La receta cuantiza los 64 expertos enrutados de cada capa (`block_sparse_moe.experts.*.{gate,up,down}_proj`), el MLP compartido (`shared_mlp.{input,output}_linear`), las proyecciones Mamba (`mamba.{in,out}_proj`) y las proyecciones de atención (`self_attn.{q,k,v,o}_proj`) en las 4 capas de atención completa. Se mantienen en BF16 únicamente los routers del MoE (`block_sparse_moe.router`), los internos del espacio de estados que no son capas lineales (`conv1d`, `A_log`, `D`, `dt_bias` y `mamba.norm`), `lm_head`, `embed_tokens` y las layer norms. La decisión de no cuantizar el router es deliberada: se trata de un Linear muy pequeño cuyos logits determinan la asignación de expertos, y un error de redondeo de 8 bits podría alterar la selección top-k y cambiar qué expertos se ejecutan. Cuantizar los expertos enrutados es lo que permite acercar la reducción de huella al ~50% teórico de una pasada INT8.

No se documenta en la información proporcionada ningún detalle sobre el número de tokens de entrenamiento, la composición del dataset ni fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo está etiquetado como `conversational`.
- Razonamiento matemático y aritmético: validado con GSM8K en configuración de 5 ejemplos, con una recuperación del 99,65% respecto al modelo en BF16.
- Razonamiento de múltiples pasos: la model card incluye una configuración de evaluación con `max_gen_toks=2048`, lo que indica soporte para cadenas de razonamiento largas.
- Inferencia en CPU: capacidad específica del artefacto, optimizado para procesadores AMD EPYC mediante ZenDNN y ZenTorch.
- Eficiencia de memoria: los pesos pasan de 12,9 GiB a 6,6 GiB, lo que habilita despliegues con presupuesto de memoria reducido.
- Compatibilidad con vLLM: integración directa con el motor de inferencia vLLM v0.29.0 y el formato compressed-tensors.
- No se declara en la información disponible soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: limitada al inglés según los metadatos del repositorio.

## Casos de uso

- Inferencia en CPU a escala en centros de datos: el modelo está diseñado para ejecutarse sobre AMD EPYC con ZenDNN y ZenTorch, lo que permite atender cargas de generación de texto en nodos sin GPU y reducir el coste por token frente a alternativas que requieren aceleradores.
- Sustitución directa del modelo base en un servicio vLLM existente: al mantener la misma arquitectura y el mismo tokenizador, se puede reemplazar `ibm-granite/granite-4.0-h-tiny` por esta versión cuantizada para recortar la huella de memoria de 12,9 GiB a 6,6 GiB con una pérdida de calidad medida del 0,35% en GSM8K.
- Asistentes conversacionales multi-turno: el modelo gestiona diálogos con plantilla de chat (`--apply_chat_template`) y genera hasta 2.048 tokens, adecuado para atención al cliente o asistentes internos en inglés.
- Procesamiento por lotes de razonamiento matemático: con un 86,13% en GSM8K 5-shot, es apto para tareas de resolución de problemas aritméticos, generación de explicaciones paso a paso y validación de ejercicios en pipelines offline.
- Despliegues on-premise con restricciones de hardware: entornos con normativa de residencia de datos o sin acceso a GPU pueden ejecutar el modelo íntegramente en CPU sobre Linux con un footprint de pesos de 6,6 GiB.
- Evaluación de calidad de cuantización: sirve como referencia para medir la degradación de una receta W8A8 RTN sobre arquitecturas híbridas Mamba-MoE, comparando contra el baseline BF16 con lm-evaluation-harness.
- Prototipado y pruebas de concepto con memoria limitada: el tamaño reducido permite levantar el modelo en máquinas de desarrollo modestas para validar prompts, plantillas de chat y flujos de generación antes de escalar.
- Generación de texto general en inglés: resumen, redacción y reescritura en pipelines documentales donde la latencia no sea el factor crítico y prime el coste de infraestructura.

## Benchmarks y rendimiento

El único resultado de evaluación publicado en la información disponible es GSM8K en configuración de 5 ejemplos, comparado contra el modelo base sin cuantizar:

| Benchmark | Baseline BF16 | W8A8 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (5-shot) | 0,8643 | 0,8613 | 99,65% |

La evaluación se realizó con lm-evaluation-harness usando el motor vLLM, `dtype=bfloat16`, `--apply_chat_template`, `--num_fewshot 5` y `max_gen_toks=2048`. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- Hardware declarado: procesadores AMD EPYC para inferencia en CPU. Sistema operativo preferido: Linux.
- Pila de software requerida: ZenDNN v6.1.0, ZenTorch v2.13.0.0, PyTorch v2.13.0.0, LLM Compressor v0.13.0 y vLLM v0.29.0.
- Memoria para pesos: 6,6 GiB en disco en INT8 (frente a 12,9 GiB del modelo base en BF16). En CPU hay que añadir memoria para la caché KV, las activaciones y el overhead del runtime; no se publican cifras oficiales de RAM total necesaria.
- GPU: no se declara soporte ni validación oficial en GPU. Por tamaño, los pesos INT8 (unos 6,6 GiB) más activaciones y caché KV apuntan a un rango estimado de 8-10 GB de VRAM, pero es una estimación derivada del tamaño en disco, no un dato publicado.
- GPU de consumo: no se documenta compatibilidad validada con tarjetas consumer. No hay datos oficiales para RTX 4090, RTX 3090 ni similares.
- Ajuste de OpenMP: es necesario configurar `LD_PRELOAD` con `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM o cualquier script de inferencia para obtener el rendimiento óptimo.
- Opciones de despliegue: vLLM v0.29.0 (motor preferido y validado) y transformers con `trust_remote_code=True`. No se publica formato GGUF, por lo que llama.cpp y Ollama no son compatibles con este artefacto tal cual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño en disco | Licencia | GSM8K 5-shot | Disponibilidad |
|---|---|---|---|---|---|---|
| amd/granite-4.0-h-tiny-w8a8-llmcompressor | 6,94 mil millones | W8A8 INT8 (compressed-tensors) | 6,6 GiB | Apache 2.0 | 0,8613 | HuggingFace, orientado a CPU EPYC |
| ibm-granite/granite-4.0-h-tiny (base) | 6,94 mil millones | BF16 | 12,9 GiB | Apache 2.0 | 0,8643 | HuggingFace, propósito general |
| Otras alternativas cuantizadas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación con datos verificables es contra el modelo base en BF16, del que este artefacto es una conversión directa. La información proporcionada no incluye otros modelos comparables de terceros con cifras contrastadas.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés (`language: en`). No hay validación publicada en castellano ni en otros idiomas.
- Ausencia de datos sobre sesgos: la información disponible no incluye ninguna evaluación de sesgos, toxicidad o equidad. Al derivar de un modelo base de IBM, hereda sus sesgos sin que se documente una mitigación adicional.
- Riesgo de alucinación: inherente a los modelos generativos. La cuantización W8A8 puede introducir degradaciones adicionales no medidas más allá de GSM8K, especialmente en tareas de conocimiento factual y generación de código, que no se han evaluado.
- Cobertura de evaluación muy limitada: solo se publica GSM8K. No hay datos de MMLU, HumanEval, MT-Bench ni evaluaciones de robustez, por lo que no se puede garantizar el comportamiento en otros dominios.
- Bloqueo de versión: la model card incluye un apartado de limitaciones que comienza con "Version Lock", pero el contenido está truncado en la información proporcionada; se recomienda consultar la ficha original en HuggingFace para conocer las restricciones exactas de versiones de software.
- Dependencia estricta de la pila: el artefacto está validado con versiones concretas (PyTorch 2.13.0.0, ZenTorch 2.13.0.0, ZenDNN 6.1.0, vLLM 0.29.0, LLM Compressor 0.13.0). Usar otras versiones puede degradar el rendimiento o romper la carga del modelo.
- Optimizado para CPU AMD EPYC: no hay validación oficial en GPU ni en procesadores de otros fabricantes. El rendimiento fuera del entorno objetivo es incierto.
- Sin formato GGUF: no es directamente utilizable con llama.cpp, Ollama u otros runtimes que esperan ese formato.
- Licencia Apache 2.0: permite uso comercial y modificación, pero obliga a conservar los avisos de copyright y licencia, e incluye la cláusula estándar de exención de responsabilidad y de terminación por litigio de patentes.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/granite-4.0-h-tiny-w8a8-llmcompressor
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Repositorio de LLM Compressor: https://github.com/vllm-project/llm-compressor
- Repositorio de lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Los resultados de la búsqueda web no aportan enlaces específicos sobre este modelo: únicamente devuelven páginas corporativas generales de AMD (amd.com, Wikipedia), sin relación con el artefacto.
