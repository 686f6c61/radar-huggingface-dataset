# nchapman/d3-lite-W4A16-HGPTQ

## Resumen

d3-lite-W4A16-HGPTQ es una versión cuantizada a 4 bits del modelo vllm-sr/d3-lite, un modelo de decisión de un solo paso (single-pass decision model) orientado a tareas de clasificación estructurada mediante un mecanismo de "code-readout". El autor de la cuantización es nchapman, y el modelo base fue desarrollado por vllm-sr. La relevancia de esta ficha radica en que demuestra una receta de cuantización W4A16 que combina rotación Walsh-Hadamard con GPTQ inicializado por Cholesky, reduciendo el checkpoint BF16 de 1,59 GiB a 0,78 GiB (2,05× de compresión) con una degradación medida y acotada en la calidad de decisión.

Arquitectónicamente, el modelo base emplea una arquitectura híbrida de 24 capas con hidden_size de 1024, combinando GatedDeltaNet (atención lineal recurrente) con capas de atención completa, además de un tower de visión ViT de 12 bloques. La cabeza de decisión es un readout de 255 códigos (matriz 255×1024) que se mantiene en BF16. El modelo no es un generador de texto generalista: su pipeline declarado es feature-extraction y su propósito es producir decisiones estructuradas sobre preguntas con opciones (choice, yes_no, multi_select, scale).

Esta cuantización es relevante para despliegues en producción con restricciones de memoria, ya que permite cargar el modelo completo (lenguaje + visión + readout) en menos de 1 GiB, manteniendo un 91,67% de acuerdo top-1 con la referencia BF16 y una similitud coseno de logits de 0,998205 en la cabeza de 255 códigos. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas con GatedDeltaNet (atención lineal) + atención completa; tower de visión ViT de 12 bloques; cabeza de decisión code-readout de 255 códigos |
| Parametros totales | 852.985.920 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), group_size=64, rotación Walsh-Hadamard H_64, GPTQ con inicialización Cholesky MSE, actorder estático, dampening_frac=0.01 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, quantization_status: compressed) |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-lite es un modelo de decisión de un solo paso con arquitectura híbrida: 24 capas de hidden_size 1024 que alternan bloques GatedDeltaNet (atención lineal recurrente con proyecciones in_proj_qkv, in_proj_z, in_proj_a, in_proj_b y out_proj) con bloques de atención completa. Incorpora además un tower de visión compuesto por 12 bloques ViT con atención qkv y MLP, más un merger de dos capas lineales. La salida no es texto generado, sino un vector de logits sobre 255 códigos de decisión producido por una cabeza readout de 255×1024, evaluada bajo el protocolo code-readout-v1.

Esta versión concreta es una cuantización, no un modelo entrenado desde cero. La receta aplicada consiste en una rotación de entrada Walsh-Hadamard Sylvester de 64×64 (H_64) seguida de GPTQ con inicialización por Cholesky basada en MSE, group_size=64, actorder estático y dampening_frac=0.01, calibrada capa por capa bajo atención no causal completa. Se cuantizan 200 capas lineales en total (150 del modelo de lenguaje y 50 del tower de visión y merger), mientras que se mantienen en BF16 el readout (255×1024), embed_tokens, in_proj_a, in_proj_b, las normas, los sesgos y visual.patch_embed.proj. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Toma de decisiones estructuradas de un solo paso sobre preguntas con opciones, en los formatos choice, yes_no, multi_select y scale.
- Clasificación de intención y extracción de etiquetas a partir de un estado textual (por ejemplo, resúmenes de conversaciones o tickets).
- Procesamiento de imágenes mediante el tower de visión ViT, con fusión multimodal en el merger.
- Evaluación con promediado de permutaciones directa e inversa de las opciones para robustez del readout.
- Inferencia de una sola pasada (no autoregresiva) para producir la decisión, sin generación de texto libre.
- Soporte de carga mediante Qwen3_5Model.from_pretrained, D3.from_pretrained y warp-34, con compatibilidad declarada con endpoints.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking.

## Casos de uso

- Clasificación de intención en atención al cliente: dado un resumen de la interacción (por ejemplo, "Customer ordered item #4412, delivered on time, requested an invoice copy"), el modelo devuelve la etiqueta de intención entre un conjunto de opciones definidas, en una sola pasada y con bajo coste de memoria.
- Enrutamiento de tickets en soporte técnico: se define un conjunto de criterios (facturación, devolución, incidencia técnica) y el modelo asigna la categoría, aprovechando la compresión a 0,78 GiB para desplegar muchas instancias en una sola GPU.
- Moderación y etiquetado de contenido con preguntas de tipo yes_no: el modelo responde a criterios binarios definidos por el operador sobre un texto dado, útil en pipelines de filtrado por lotes.
- Encuestas y formularios automatizados con preguntas de tipo scale: permite puntuar un texto según una escala predefinida, con el promediado de permutaciones para reducir el sesgo de posición de las opciones.
- Análisis de documentos con componente visual: el tower de visión permite procesar imágenes (con similitud coseno media de 0,974470 frente a BF16 en la sonda vision-probe-v2) para tareas de decisión sobre capturas o formularios escaneados.
- Sistemas de decisión de baja latencia en el borde: al ocupar menos de 1 GiB, el modelo puede ejecutarse en GPUs de consumo o en entornos con memoria limitada, sirviendo como clasificador previo a un LLM generativo más grande.
- Evaluación A/B de cuantizaciones: la métrica de acuerdo top-1 (91,67%) y la KL de distribución de opciones (0,005819 media) permiten usar esta versión como referencia para validar otras recetas de compresión.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la comparación de la cuantización frente al modelo base BF16, no a benchmarks estándar de la literatura (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible para esas suites.

| Metrica | BF16 base (vllm-sr/d3-lite) | d3-lite-W4A16-HGPTQ |
|---|---:|---:|
| Tamano safetensors (incl. readout) | 1,59 GiB (1.707.072.248 B) | 0,78 GiB (833.893.048 B) |
| Compresion | 1,00× | 2,05× (−0,81 GiB) |
| Acuerdo top-1 en decisiones (12 preguntas) | 100,00% | 91,67% |
| KL de distribucion de opciones (media / max, nats) | 0,000000 | 0,005819 / 0,058474 |
| Similitud coseno de logits del readout de 255 codigos | 1,000000 | 0,998205 |
| KL de softmax de 255 codigos (nats) | 0,000000 | 0,007149 |
| Vision tower (vision-probe-v2, 96 imagenes, 50.596 tokens visuales) | 1,000000 cos | 0,974470 media (0,953063 min) |
| vision-guard-v2 (coseno) | no disponible | 0,974600 media (0,953356 min) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,78 GiB de pesos en disco; en memoria, el modelo completo en W4A16 con el readout, embeddings y normas en BF16 debe caber en torno a 1 GiB, más el coste de activaciones y del contexto (no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GiB de VRAM libre; no se especifican modelos concretos en la documentación. Por tamaño, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, dado el tamaño inferior a 1 GiB de pesos.
- Opciones de despliegue: carga mediante transformers con Qwen3_5Model.from_pretrained o D3.from_pretrained, y mediante el runtime warp-34; el formato compressed-tensors es compatible con vLLM de forma declarada (tag endpoints_compatible), aunque no se detallan configuraciones de servido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión de un solo paso con readout de códigos). La comparación más directa disponible es con su propio modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Tamano en disco | Acuerdo top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vllm-sr/d3-lite (BF16) | 852.985.920 | no disponible | 1,59 GiB | 100,00% (referencia) | Apache 2.0 | Hugging Face |
| nchapman/d3-lite-W4A16-HGPTQ | 852.985.920 | no disponible | 0,78 GiB | 91,67% | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- La cuantización introduce una pérdida medible: el acuerdo top-1 cae del 100% al 91,67% en la evaluación de 12 preguntas, por lo que aproximadamente 1 de cada 12 decisiones puede diferir de la referencia BF16.
- La divergencia KL máxima por pregunta alcanza 0,058474 nats, lo que indica que en algunos casos la distribución de probabilidad sobre opciones se desplaza de forma apreciable aunque la decisión top-1 se mantenga.
- El tower de visión degrada su similitud coseno hasta un mínimo de 0,953063, por lo que tareas visuales sensibles pueden requerir validación adicional.
- El modelo no es un generador de texto: solo produce decisiones sobre opciones predefinidas; no debe emplearse para generación libre, razonamiento multi-paso ni tool calling.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni datos de entrenamiento, lo que limita la evaluación de riesgos de alucinación o sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y su procedencia deben verificarse de forma independiente; el autor de la cuantización no documenta garantías sobre el modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay resultados de benchmarks estándar publicados.
- La evaluación se realizó con solo 12 preguntas, una muestra muy reducida que limita la significación estadística de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/d3-lite-W4A16-HGPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
