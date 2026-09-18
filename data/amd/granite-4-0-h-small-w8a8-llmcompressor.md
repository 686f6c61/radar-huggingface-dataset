# amd/granite-4.0-h-small-w8a8-llmcompressor

## Resumen

amd/granite-4.0-h-small-w8a8-llmcompressor es una versión cuantizada en INT8 (W8A8) del modelo ibm-granite/granite-4.0-h-small, publicada por AMD y orientada a inferencia en CPU sobre procesadores AMD EPYC con el motor ZenDNN. La cuantización se hizo con LLM Compressor v0.13.0 en formato compressed-tensors, mediante el algoritmo Round-to-Nearest (RTN) y sin conjunto de calibración, y reduce el peso en disco de 60,0 GiB a 30,4 GiB, en torno a un 49 % menos.

El modelo conserva la arquitectura del original: GraniteMoeHybridForCausalLM, un híbrido Mamba-MoE de 40 capas (4 de atención completa y 36 bloques Mamba de atención lineal) con 32.207.337.984 parámetros totales. Cada capa incorpora un bloque MoE de 72 expertos con enrutado top-10 junto a un MLP compartido.

Su relevancia es práctica: permite servir un modelo de ~32 000 millones de parámetros en infraestructura sin GPU, con una pérdida de calidad mínima medida en GSM8K (0,8613 frente a 0,8643 del BF16, un 99,65 % de recuperación) y bajo licencia Apache 2.0, lo que simplifica su adopción comercial en entornos de solo CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybridForCausalLM (híbrido Mamba-MoE): 40 capas, 4 de atención completa y 36 Mamba de atención lineal; bloque MoE de 72 expertos con enrutado top-10 más MLP compartido por capa |
| Parámetros totales | 32.207.337.984 (dato real de safetensors) |
| Parámetros activos | no disponible (la model card no publica el número de parámetros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 W8A8 (pesos INT8 simétricos por canal, estáticos; activaciones INT8 simétricas por token, dinámicas); formato compressed-tensors, `num_bits=8, type=int, symmetric=true` |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors int-quantized (`save_compressed=True`); tamaño del repositorio 32,7 GB |
| Modelo de origen | ibm-granite/granite-4.0-h-small (relación: quantized) |
| Motor de inferencia | vLLM v0.29.0 |
| Hardware objetivo | CPU AMD EPYC; sistema operativo preferido: Linux |
| Stack compatible | ZenDNN v6.1.0, ZenTorch v2.13.0.0, PyTorch v2.13.0.0, LLM Compressor v0.13.0 |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una cuantización del modelo IBM granite-4.0-h-small. La model card no proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo de origen; esos datos corresponden a la ficha del modelo base y no se detallan aquí. La arquitectura es un transformer híbrido: de las 40 capas, 4 son bloques de atención completa y 36 son bloques Mamba de atención lineal, cada una con un bloque MoE de 72 expertos (top-10) y un MLP compartido.

La innovación técnica de esta publicación es el esquema de cuantización. Se aplicó LLM Compressor con un modificador `QuantizationModifier` sobre los módulos `Linear`, con esquema W8A8 y únicamente dos entradas en la lista de ignorados: `lm_head` y `re:.*block_sparse_moe.router`. Se cuantizan los 72 expertos enrutados de cada capa (`block_sparse_moe.experts.*.{gate,up,down}_proj`), el MLP compartido (`shared_mlp.{input,output}_linear`), las proyecciones Mamba (`mamba.{in,out}_proj`) y `self_attn.{q,k,v,o}_proj` de las 4 capas de atención completa. Permanecen en BF16 los enrutadores MoE, los internos del espacio de estados Mamba que no son capas lineales (`conv1d`, `A_log`, `D`, `dt_bias` y `mamba.norm` con compuerta), `lm_head`, `embed_tokens` y las layer norms. El enrutador se mantiene en BF16 porque es una capa lineal diminuta cuyos logits determinan la asignación de expertos: un error de redondeo a 8 bits puede alterar la selección top-k y cambiar qué expertos se ejecutan. Como el proceso es data-free (RTN), no se necesita dataset de calibración y basta con cargar el modelo bajo `load_context()` para linealizar los expertos MoE y poder apuntarlos como módulos `Linear` convencionales.

## Capacidades

- Generación de texto conversacional en inglés (`text-generation`, etiqueta `conversational`).
- Razonamiento matemático básico a medio: el modelo alcanza 0,8613 en GSM8K (5-shot), prácticamente idéntico al BF16 de origen.
- Inferencia en CPU sobre AMD EPYC con aceleración ZenDNN, sin necesidad de GPU.
- Reducción de huella de memoria y disco: 30,4 GiB de pesos cuantizados frente a 60,0 GiB en BF16.
- Compatibilidad con vLLM v0.29.0 y con la etiqueta `endpoints_compatible` del repositorio.
- Soporte de tool calling o function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el modelo está etiquetado únicamente para inglés.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Inferencia de un modelo de ~32 000 millones de parámetros sin GPU: se puede desplegar en servidores con CPU AMD EPYC usando vLLM v0.29.0 y ZenDNN, lo que evita el coste y la disponibilidad limitada de aceleradores.
- Sustitución directa de la versión BF16 en memoria y disco: al pasar de 60,0 GiB a 30,4 GiB, encaja en nodos con menos RAM y reduce el tiempo de carga del modelo, con una pérdida de calidad medida de solo el 0,35 % en GSM8K.
- Asistencia conversacional en inglés: el pipeline `text-generation` y la etiqueta `conversational` permiten usarlo en chats de soporte o asistentes internos para usuarios angloparlantes.
- Procesamiento por lotes de documentos en CPU: tareas de resumen, extracción y reescritura en volúmenes altos donde el coste por token en GPU no está justificado.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación W8A8 frente a BF16 en arquitecturas híbridas Mamba-MoE, con el comando de `lm-evaluation-harness` ya documentado.
- Razonamiento aritmético y resolución de problemas de varios pasos en inglés: con 0,8613 en GSM8K (5-shot) es viable para tutores automáticos o verificadores de cálculos simples.
- Entornos de investigación sobre eficiencia: permite estudiar el comportamiento de un MoE con 72 expertos y enrutado top-10 cuando se cuantizan los expertos pero se preserva el enrutador en BF16.
- Despliegue en infraestructura Linux estandarizada: el stack documentado (PyTorch 2.13.0.0, ZenTorch 2.13.0.0, ZenDNN 6.1.0, vLLM 0.29.0) facilita reproducir el entorno en imágenes de contenedor.

## Benchmarks y rendimiento

| Benchmark | BF16 (modelo base) | W8A8 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (5-shot) | 0,8643 | 0,8613 | 99,65 % |

Las evaluaciones se realizaron con lm-evaluation-harness sobre el motor vLLM. No se han publicado en la información disponible resultados de MMLU, HumanEval, BBH ni de otras tareas, ni datos de latencia o throughput.

## Requisitos de hardware

- Hardware objetivo declarado: CPU AMD EPYC con ZenDNN v6.1.0 y ZenTorch v2.13.0.0; sistema operativo Linux.
- Memoria del sistema: los pesos ocupan 30,4 GiB, por lo que se recomienda un nodo con 64 GB de RAM o más para dejar margen a la caché KV, activaciones y al propio sistema operativo.
- VRAM estimada para GPU (estimación derivada del tamaño de pesos, no publicada por el autor): en torno a 32-34 GB solo para pesos INT8, más caché KV; quedaría fuera de GPUs de consumo.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 24 GB por el tamaño de los pesos cuantizados.
- GPU recomendadas si se opta por inferencia en acelerador: A100 40/80 GB o H100; para GPUs de 24-48 GB haría falta reparto multi-GPU, opción no documentada en la model card.
- Opciones de despliegue: vLLM v0.29.0 con ZenDNN sobre CPU es la ruta documentada y optimizada. No se documentan rutas con llama.cpp, Ollama, TGI ni pesos GGUF.
- Ajuste del runtime: es necesario exportar `LD_PRELOAD` apuntando a `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM o cualquier script de inferencia.
- Latencia y throughput: no disponibles; la model card no publica métricas de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | GSM8K (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| amd/granite-4.0-h-small-w8a8-llmcompressor | 32.207.337.984 | no disponible | INT8 W8A8 (compressed-tensors) | 0,8613 | Apache 2.0 | HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| ibm-granite/granite-4.0-h-small (BF16, origen) | mismo modelo de origen | no disponible | BF16 | 0,8643 | Apache 2.0 (según el modelo derivado) | HuggingFace |
| Alternativas de terceros de tamaño o tarea comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no devolvió información técnica sobre modelos comparables: los resultados fueron páginas corporativas de AMD (soporte, tienda, cotización bursátil y guías de compra de CPU), sin relación con esta publicación. Por tanto, la única comparación con datos verificables es la del modelo frente a su versión BF16 de origen.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés (`en`); no hay evidencia de capacidades multilingües y el castellano no está soportado de forma declarada.
- Longitud de contexto: no se especifica en la información disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación más allá de la cuantización; se asume el comportamiento del modelo base BF16, no descrito en esta ficha.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o alineación para esta versión cuantizada.
- Efecto de la cuantización: los pesos y las activaciones se reducen a 8 bits, lo que introduce error de redondeo; el enrutador MoE se mantiene en BF16 precisamente para evitar que un error de cuantización altere la selección top-k de expertos.
- Dependencia de un stack concreto: requiere vLLM v0.29.0, LLM Compressor v0.13.0, ZenTorch 2.13.0.0, PyTorch 2.13.0.0 y ZenDNN 6.1.0; versiones distintas pueden no ser compatibles.
- Configuración obligatoria de OpenMP: sin el `LD_PRELOAD` de `libomp.so` o `libiomp5.so`, el rendimiento en CPU puede degradarse.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base y de los datos de entrenamiento originales.
- Madurez: el repositorio se publicó el 18 de septiembre de 2026 y en el momento de la consulta registra 0 descargas y 0 likes, por lo que no existe validación comunitaria amplia.
- Documentación incompleta: la model card recoge el comando de evaluación de forma truncada y no incluye datos de contexto, benchmarks adicionales ni métricas de rendimiento.
- Uso en producción: al ser un artefacto de cuantización de solo CPU, no debe esperarse el mismo rendimiento que un despliegue en GPU; la ruta recomendada es ZenDNN sobre AMD EPYC.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/granite-4.0-h-small-w8a8-llmcompressor
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-small
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Repositorio de LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Resultados de la búsqueda web: no se encontraron enlaces técnicos relevantes; únicamente páginas corporativas de AMD (https://www.amd.com/fr.html, https://www.amd.com/fr/support/download/drivers.html, https://shop-eu-fr.amd.com/) sin relación con el modelo.
