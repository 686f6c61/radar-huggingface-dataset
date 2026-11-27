# Broadnet/KnowLine-26B-A4B-Gen2.5-W4A16-experts

## Resumen

KnowLine 26B-A4B Gen2.5 W4A16 Experts es una cuantizacion int4 de los expertos enrutados del modelo de decision KnowLine 26B-A4B Gen2.5, desarrollado originalmente por PelaAI sobre la arquitectura Gemma 4 26B-A4B de Google. BroadNet publica esta variante con el objetivo de hacer viable el despliegue del modelo en una unica GPU de 24 GB, algo imposible con los pesos originales en bf16. La cuantizacion afecta exclusivamente a las proyecciones gate, up y down de los expertos enrutados, manteniendo el resto de componentes (atencion, router, vision, embeddings y cabeza de salida) en bf16.

El modelo es un transformer con arquitectura Mixture-of-Experts (MoE) de 25.805.936.206 parametros totales, de los cuales aproximadamente 4.000 millones estan activos por token (la designacion A4B del nombre base asi lo indica). Su proposito no es la generacion libre de texto, sino la clasificacion y toma de decisiones etiquetadas: el servidor propio del modelo renderiza cada decision y lee las probabilidades de las etiquetas. Esto lo situa en la categoria de modelos de decision, no de chat generalista.

La relevancia de esta ficha radica en que demuestra un flujo de cuantizacion selectiva (solo expertos, con compressed-tensors y vLLM) que reduce el peso en disco a 19 GB y permite servir el modelo en una RTX 3090 con 18,1 GiB de pesos y 16.061 tokens de cache KV a contexto de 8K. Es una pieza practica para quien necesite evaluar modelos de decision de gran tamano en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base Gemma 4 26B-A4B |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4.000 millones (segun designacion A4B) |
| Longitud de contexto | 8.192 tokens (configurado en el ejemplo de despliegue; maximo nativo no disponible) |
| Tipos de cuantizacion | W4A16 en expertos enrutados (int4, group size 32, simetrica, RTN con busqueda de escala MSE de llm-compressor); resto en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE derivado de Gemma 4 26B-A4B, con 25.805.936.206 parametros totales y un regimen de activacion de aproximadamente 4.000 millones por token. La innovacion de esta variante no reside en el entrenamiento, sino en la cuantizacion: las proyecciones gate, up y down de los expertos enrutados se almacenan en int4 con group size 32, cuantizacion simetrica y redondeo al mas cercano, usando la busqueda de escala MSE de llm-compressor sin datos de calibracion. El formato resultante es compressed-tensors en modo pack-quantized, compatible con vLLM.

El resto de los componentes se conserva en bf16 tal como los publico PelaAI: atencion, router, torre de vision, embeddings y cabeza de salida. Tambien se mantiene la temperatura de lectura que PelaAI incorporo en los pesos y el logit soft-cap de 24 declarado en `config.json`. El repositorio incluye `recipe.yaml` con los ajustes exactos de cuantizacion y `quantize_experts_rtn.py`, que permite reconstruir los pesos a partir del release original de PelaAI. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados ni si hubo fases de RLHF o DPO.

## Capacidades

- Toma de decisiones etiquetadas: el modelo no genera texto libre, sino que produce probabilidades sobre etiquetas de decision a partir de un texto de entrada, mediante el servidor `knowline_server.py` y el backend `knowline_vllm.py`.
- Clasificacion de textos de hasta 2.000 tokens con latencias medianas de 94, 198 y 474 ms segun longitud.
- Procesamiento por lotes: con 8 peticiones en vuelo alcanza 15,0, 6,1 y 2,3 decisiones por segundo para textos de aproximadamente 265, 744 y 2.000 tokens.
- Soporte de logprobs extendido: el despliegue recomendado usa `--max-logprobs 256` y `--logprobs-mode processed_logprobs`, necesario para leer las probabilidades de las etiquetas.
- Capacidades de vision y audio presentes en el modelo base (torre de vision en bf16), aunque la ruta de inferencia documentada es solo texto y el ejemplo de vLLM desactiva imagen y audio con `--limit-mm-per-prompt '{"image":0,"audio":0}'`.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion de tickets de soporte en produccion: el modelo puede etiquetar cada ticket con una categoria de decision leyendo probabilidades por etiqueta, con latencias por debajo de 500 ms para textos de hasta 2.000 tokens, lo que permite integrarlo en un pipeline de enrutamiento en tiempo real.
- Moderacion de contenido con umbrales calibrados: al exponer probabilidades por etiqueta, es posible fijar umbrales de decision y auditar casos limite, algo que un modelo generativo no ofrece de forma directa.
- Enrutamiento de correos o formularios en un CRM: con 15 decisiones por segundo en lotes de 8 y textos cortos de unos 265 tokens, encaja en flujos de alta concurrencia sobre una sola GPU de 24 GB.
- Analisis de documentos de hasta 2.000 tokens: la ventana de 8K y la cache KV de 16.061 tokens permiten procesar informes o contratos de longitud media en una RTX 3090 sin infraestructura adicional.
- Evaluacion comparativa de modelos de decision: el kit publico del Decision Index y su scorer permiten reproducir la puntuacion de 68,48 sobre una muestra de 3.000 filas y comparar contra el bf16 (68,21 en el board 0.4.1).
- Despliegue en entornos con GPU de consumo: equipos de investigacion con una unica RTX 3090 pueden servir el modelo con vLLM 0.30.0, sin necesidad de A100 o H100, para prototipado y validacion de pipelines de decision.
- Servicio interno de decision como API: el servidor `knowline_vllm.py` expone el endpoint `/v1/systemone`, lo que facilita integrarlo como microservicio en una arquitectura existente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decision Index (muestra de 3.000 filas del set publico) | 68,48 |
| Decision Index bf16 (board 0.4.1, set publico) | 68,21 |
| Peso en disco | 19 GB |
| Peso en VRAM (RTX 3090, vLLM 0.30.0) | 18,1 GiB |
| Cache KV disponible a 8K de contexto | 16.061 tokens |
| Latencia mediana, texto de ~265 tokens (1 peticion) | 94 ms |
| Latencia mediana, texto de ~744 tokens (1 peticion) | 198 ms |
| Latencia mediana, texto de ~2.000 tokens (1 peticion) | 474 ms |
| Throughput, texto de ~265 tokens (8 en vuelo) | 15,0 decisiones/s |
| Throughput, texto de ~744 tokens (8 en vuelo) | 6,1 decisiones/s |
| Throughput, texto de ~2.000 tokens (8 en vuelo) | 2,3 decisiones/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,1 GiB de pesos en la configuracion medida, mas cache KV; el modelo esta disenado para caber en una GPU de 24 GB.
- GPU recomendadas: RTX 3090 (medida por el autor), RTX 4090, A100 y H100 como alternativas con mayor margen de cache KV y concurrencia.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 con 24 GB, usando `--gpu-memory-utilization 0.95`.
- Opciones de despliegue: vLLM 0.30.0 como motor principal (formato compressed-tensors), con el servidor propio `knowline_vllm.py` como capa de decision. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Configuracion recomendada de vLLM: `--max-model-len 8192 --gpu-memory-utilization 0.95 --max-num-seqs 16 --max-num-batched-tokens 4096 --max-logprobs 256 --logprobs-mode processed_logprobs --limit-mm-per-prompt '{"image":0,"audio":0}'`.
- Dependencias del servidor: `transformers==5.12.1`, `jinja2` y `requests`.
- Latencia y throughput: ver tabla de benchmarks; con 8 peticiones en vuelo se obtienen entre 2,3 y 15,0 decisiones por segundo segun longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Broadnet/KnowLine-26B-A4B-Gen2.5-W4A16-experts | 25,8B totales, ~4B activos | 8K configurado | safetensors compressed-tensors int4 | Apache-2.0 | Hugging Face |
| PelaAI/KnowLine-26B-A4B-Gen2.5 | 25,8B totales, ~4B activos | No disponible | bf16 | Apache-2.0 | Hugging Face |
| Gemma 4 26B-A4B (Google) | 26B totales, ~4B activos | No disponible | safetensors | No disponible en esta ficha | Hugging Face |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks de proposito general para situarlo frente a alternativas de otros desarrolladores. Frente al bf16 de PelaAI, esta variante reduce el peso en disco de un valor no especificado a 19 GB y permite el despliegue en una GPU de 24 GB, con una puntuacion en el Decision Index de 68,48 frente a 68,21 del bf16.

## Limitaciones y advertencias

- La cuantizacion int4 se aplica solo a los expertos enrutados; el resto del modelo permanece en bf16, por lo que el ahorro de memoria es parcial y el modelo sigue requiriendo 18,1 GiB de pesos.
- La ruta de inferencia documentada es solo texto: el ejemplo de vLLM desactiva imagen y audio, por lo que las capacidades multimodales del modelo base no estan validadas en esta variante.
- El servidor debe mantener la temperatura en 1, ya que la temperatura de lectura esta incorporada en los pesos; alterarla degrada la calibracion de las probabilidades de etiqueta.
- El logit soft-cap de 24 en `config.json` forma parte del comportamiento del modelo y no debe modificarse.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion ni cobertura idiomatica del modelo base.
- El modelo esta disenado para decisiones etiquetadas, no para generacion libre; usarlo fuera de ese proposito no esta respaldado por la documentacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a la licencia original de PelaAI (`LICENSE` en el repositorio) y no se detallan restricciones adicionales del modelo base Gemma 4.
- Requiere versiones concretas de vLLM (0.30.0) y transformers (5.12.1); otras versiones pueden no soportar el formato compressed-tensors o el modo de logprobs utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Broadnet/KnowLine-26B-A4B-Gen2.5-W4A16-experts
- Modelo base en Hugging Face: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Documentacion de inferencia del repositorio: `INFERENCE.md` (incluido en el repositorio)
- Receta de cuantizacion: `recipe.yaml` (incluido en el repositorio)
- Script de reconstruccion de pesos: `quantize_experts_rtn.py` (incluido en el repositorio)
- Servidor de decision: `knowline_server.py` y `knowline_vllm.py` (incluidos en el repositorio)
- Sumas de verificacion: `SHA256SUMS` (incluido en el repositorio)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
