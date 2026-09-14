# neemon/anlp-a2-part2-muon

## Resumen

`neemon/anlp-a2-part2-muon` es un checkpoint de un transformer decoder-only entrenado desde cero ("from scratch") como parte de la asignatura Advanced NLP (Monsoon 2026) del IIIT-H. No es un modelo de produccion ni un lanzamiento oficial: se trata de un artefacto academico publicado unicamente como pesos, sin codigo de entrenamiento ni de evaluacion en el repositorio (el autor indica que la arquitectura, el codigo y la evaluacion viven en el repositorio de la asignatura). Su interes es fundamentalmente metodologico: documenta el uso del optimizador Muon (basado en matrices, con momento ortogonalizado mediante iteraciones de Newton-Schulz) sobre un transformer pequeno.

El modelo tiene 8 capas, `d_model` de 512, 8 cabezas de atencion (sin GQA: `n_kv_heads` igual a `n_heads`), FFN denso de 2048 y un vocabulario de 32.000 tokens. A partir de esa configuracion se puede estimar un total de aproximadamente 41,5 millones de parametros con embeddings atados (valor no declarado por el autor; calculado a partir de la config publicada). El entrenamiento cubrio 43.021.354 tokens objetivo puntuados y alcanzo una mejor perdida de validacion de 3,3969, con una perplejidad de validacion registrada como `nan`.

Es relevante ahora solo como referencia de reproduccion para quien investigue optimizadores alternativos a AdamW en regimenes de datos muy limitados, y como ejemplo de que las etiquetas de HuggingFace no siempre describen el modelo: pese a llevar el tag `mixture-of-experts`, la config declara `n_routed_experts: 0` y `ffn: dense`, es decir, es un transformer denso convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (causal LM), con RMSNorm |
| Parametros totales | No declarado por el autor; ~41,5 M estimados a partir de la config (`d_model` 512, 8 capas, `d_ff` 2048, vocab 32.000, embeddings atados) |
| Parametros activos | No aplica: `n_routed_experts` = 0, `n_shared_experts` = 0, `top_k` = 0 (modelo denso) |
| Longitud de contexto | 256 tokens (`n_ctx`) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados ni GGUF) |
| Idiomas soportados | Ingles (en), vietnamita (vi) y japones (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, un unico payload con `state_dict` y `config`), cargado con `torch.load(..., map_location="cpu", weights_only=False)` |
| Tag de pipeline | Translation |
| Tamano del repositorio | 0,2 GB |
| Optimizador | Muon (momento ortogonalizado con Newton-Schulz) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La config publicada describe un transformer decoder-only denso clasico: 8 capas, `d_model` 512, 8 cabezas de atencion con `n_kv_heads` 8 (atencion multi-cabeza estandar, sin query/key-value grouping), `d_ff` 2048 en una FFN densa (sin expertos enrutados ni compartidos) y normalizacion RMSNorm. El vocabulario es de 32.000 tokens, coherente con un tokenizador multilingue tipo SentencePiece/BPE, y el repositorio contiene un unico fichero `model.pt` de 0,2 GB, lo que sugiere pesos en fp32 con la matriz de embeddings atada a la cabeza de salida. No se documentan innovaciones de atencion (ni atencion lineal, ni decodificacion especulativa, ni ventanas deslizantes).

El unico elemento diferencial es el optimizador: Muon, que aplica momento ortogonalizado sobre las actualizaciones matriciales mediante iteraciones de Newton-Schulz, en lugar del AdamW habitual. El autor reporta 43.021.354 tokens objetivo puntuados durante el entrenamiento, una mejor perdida de validacion de 3,3969 y una perplejidad de validacion de `nan` (lo que apunta a un overflow numerico o a un error de registro, no a un valor valido). No se especifica la composicion del dataset, el numero de epochs, la mezcla de idiomas, ni si hubo fases de RLHF, DPO o instruccion; por los idiomas declarados y el pipeline de traduccion, lo probable es un corpus paralelo o multilingue de traduccion (en-vi, en-ja), aunque esto no se confirma en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en ingles, vietnamita y japones, con vocabulario compartido de 32.000 tokens.
- Traduccion automatica como tarea declarada en el pipeline del modelo, presumiblemente en direcciones que involucren el ingles con vietnamita y japones (no se detallan los pares exactos ni si el modelo esta entrenado en ambos sentidos).
- Modelado de lenguaje causal: al ser un decoder-only puro con contexto de 256 tokens, puede usarse para completado de texto y calculo de perplejidad.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, ni modo "thinking".
- No hay capacidades de vision, audio ni multimodalidad.
- No se documentan habilidades de codigo ni de matematicas; con ~41,5 M de parametros y 43 M de tokens vistos, no son esperables.

## Casos de uso

- Reproduccion academica de optimizadores: cargar el checkpoint y comparar curvas de perdida frente a un entrenamiento identico con AdamW para estudiar el efecto de Muon en regimenes de datos escasos (decenas de millones de tokens).
- Traduccion en-vi o en-ja fuera de linea sobre frases cortas: con contexto de 256 tokens, es viable para frases y parrafos breves, no para documentos completos.
- Prototipado de pipelines de traduccion: usar el modelo como baseline de bajo coste computacional antes de escalar a modelos Marian/NLLB, midiendo BLEU/COMET con los mismos datos de evaluacion.
- Experimentos de destilacion: emplearlo como alumno pequeno al que destilar un modelo de traduccion mayor, aprovechando su tamano reducido y su licencia MIT.
- Analisis de multilingueismo en vocabularios compartidos: estudiar como un vocabulario de 32.000 tokens reparte capacidad entre en, vi y ja en un modelo de 8 capas.
- Formacion y docencia: servir de ejemplo ejecutable de arquitectura decoder-only minima (RMSNorm, atencion MHA, FFN densa) para explicar cada componente sin la complejidad de un modelo de miles de millones de parametros.
- Pruebas de cuantizacion y despliegue extremo: validar el comportamiento de un transformer de ~41 M de parametros en CPU, movil o microcontroladores, si se convierte manualmente a ONNX o formatos compactos.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, agentes ni ninguna aplicacion que requiera contexto largo o fiabilidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Tokens objetivo puntuados | 43.021.354 |
| Mejor perdida de validacion | 3,3969 |
| Mejor perplejidad de validacion | nan (valor no valido, probable overflow o error de registro) |
| MMLU / HumanEval / GSM8K / BLEU | No disponible |

## Requisitos de hardware

- VRAM para inferencia: con ~41,5 M de parametros estimados, aproximadamente 166 MB en fp32, 83 MB en fp16/bf16 y ~41 MB en int8. Cabe en cualquier GPU, incluso integradas, y en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer de los ultimos diez anos es suficiente. Una RTX 4090 o una A100 estarian completamente sobredimensionadas para el modelo (aunque utiles para entrenar desde cero con lotes grandes).
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050, RTX 3060, RTX 4090, e incluso en GPUs integradas y en CPU).
- Opciones de despliegue: al publicarse solo como `model.pt` de PyTorch, requiere cargar el `state_dict` y envolverlo en codigo propio. No hay soporte nativo declarado en vLLM, llama.cpp, Ollama ni TGI; para usar llama.cpp habria que convertir los pesos a GGUF manualmente (no existen ficheros publicados).
- Latencia y throughput: no disponibles. Dado el tamano y el contexto de 256 tokens, en una GPU moderna la latencia por lote seria del orden de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Los valores de los modelos alternativos provienen de sus fichas publicas y se incluyen como referencia aproximada; el modelo analizado no publica benchmarks, por lo que la comparacion es estructural, no de rendimiento.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| neemon/anlp-a2-part2-muon | ~41,5 M (estimado) | 256 | en, vi, ja | MIT | PyTorch `.pt` |
| Helsinki-NLP/opus-mt-en-vi | ~74 M (Marian) | ~512 | en, vi | CC-BY 4.0 | PyTorch / safetensors |
| google-t5/t5-small | ~60 M | 512 | en (multilingue en mT5) | Apache 2.0 | safetensors |
| Qwen/Qwen2.5-0.5B | ~494 M | 32.768 | multilingue (29+) | Apache 2.0 | safetensors |

Diferencias clave: los modelos Marian y T5 estan entrenados sobre corpus de traduccion de gran escala y publican evaluaciones; el checkpoint de `neemon` solo ha visto 43 M de tokens objetivo, carece de soporte en frameworks de despliegue y su contexto es cuatro veces menor que el de t5-small. Su unica ventaja comparativa es la licencia MIT y el interes metodologico del optimizador Muon.

## Limitaciones y advertencias

- Rendimiento esperable muy bajo en tareas reales: 43 M de tokens de entrenamiento y una perdida de validacion de 3,3969 implican una calidad de traduccion y generacion muy inferior a la de cualquier modelo de traduccion establecido.
- Contexto de solo 256 tokens, insuficiente para documentos, conversaciones multi-turno largas o resumenes con contexto amplio.
- La perplejidad de validacion reportada es `nan`, lo que indica inestabilidad numerica o un fallo de registro; conviene tratarla como metrica no fiable.
- Alucinacion: no hay evaluacion de factualidad; en un modelo de este tamano la generacion de contenido incorrecto es la norma, no la excepcion.
- Sesgos: no se documenta la composicion del dataset, por lo que no es posible auditar sesgos de genero, nacionalidad, religion ni de representacion entre los tres idiomas declarados.
- Ambiguedad en las etiquetas: el repositorio lleva el tag `mixture-of-experts`, pero la config declara cero expertos y FFN densa. Cualquier expectativa de eficiencia tipo MoE es incorrecta.
- Cobertura idiomatica limitada: ingles, vietnamita y japones; sin garantia de calidad en vietnamita o japones mas alla de lo que permitan 43 M de tokens.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte, y no hay codigo de inferencia publicado en el repositorio.
- Uso en produccion desaconsejado: sin tokenizer incluido de forma explicita, sin versionado de pesos, sin evaluacion reproducible y sin integracion en servidores de inferencia.
- Fechas de creacion y actualizacion del repositorio (2026-09-14) corresponden a un artefacto academico, no a un modelo mantenido.

## Enlaces

- HuggingFace: https://huggingface.co/neemon/anlp-a2-part2-muon
- Repositorio de la asignatura (Advanced NLP, IIIT-H, Monsoon 2026): mencionado por el autor en la model card, sin URL publicada; no disponible.
- Paper o blog del optimizador Muon: no incluido en la informacion proporcionada.
- Resultados de busqueda web: las consultas devolvieron unicamente portales del sistema escolar polaco LIBRUS, sin ninguna relacion con el modelo; no se han encontrado enlaces relevantes adicionales.
