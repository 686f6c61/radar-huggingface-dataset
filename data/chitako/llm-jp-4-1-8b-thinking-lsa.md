# ChiTako/llm-jp-4.1-8b-thinking-lsa

## Resumen

llm-jp-4.1-8b-thinking-lsa es una variante experimental del modelo llm-jp-4.1-8b-thinking (8.590 millones de parametros, licencia Apache-2.0) desarrollada por el usuario ChiTako. La modificacion consiste en sustituir el mecanismo de atencion densa de las 32 capas del transformer por Latent Sparse Attention (LSA), una tecnica descrita en el paper arXiv 2610.42147 del proyecto Prefrontal-AI. Los pesos del modelo base no se alteran: solo se anaden dos proyecciones lineales de 4096x64 por capa (`W_K_idx` y `W_Q_idx`) que actuan como indexadores para seleccionar que claves leer.

El objetivo es reducir el coste computacional de la atencion en contextos largos sin degradar la calidad. En lugar de calcular atencion sobre todas las claves, cada consulta lee unicamente 4 claves sink, una ventana de 512 claves recientes y 2048 claves de largo alcance seleccionadas mediante clustering de Ward en un espacio latente de 64 dimensiones. En una secuencia de 64k tokens esto supone leer aproximadamente el 3,9% de las claves por consulta.

Es relevante como prueba de concepto de atencion dispersa aplicada a un modelo de razonamiento japones ya entrenado, con resultados que muestran paridad o ligera mejora en perplejidad hasta 32k tokens. Sin embargo, la implementacion publicada es una referencia en PyTorch sin optimizar, por lo que el ahorro teorico no se traduce en aceleracion real en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama) con atencion Latent Sparse Attention (LSA) en las 32 capas |
| Parametros totales | 8.590.200.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens evaluados; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder estilo Llama de 8.590 millones de parametros, heredado integramente del modelo llm-jp-4.1-8b-thinking de LLM-jp / NII. La innovacion reside en la capa de atencion: LSA sustituye la atencion densa por una seleccion dispersa de claves. Cada consulta atiende a un conjunto fijo compuesto por 4 claves sink al inicio de la secuencia, 512 claves de ventana reciente y hasta 2048 claves de largo alcance elegidas mediante un indexador latente de 64 dimensiones que agrupa las claves en clusters de Ward. El KV cache mantiene el mismo tamano que en atencion densa: el ahorro es de computo, no de memoria.

El entrenamiento del modelo base no se detalla en la informacion proporcionada. Respecto a los indexadores anadidos, se ofrecen dos variantes. La primera, incluida por defecto en `lsa_maps.pt`, es un indexador PCA sin entrenamiento, calculado a partir de las 64 direcciones principales por capa sobre 4 documentos de 4096 tokens. La segunda, en `lsa_maps_distilled.pt`, se obtiene por destilacion con el modelo congelado: se alinea por divergencia KL la distribucion softmax del coseno en el espacio latente con la distribucion de masa de atencion densa del profesor (top-2048 claves), usando 8 documentos de Wikipedia japonesa de 16.384 tokens, 64 posiciones de consulta por documento y 250 pasos por capa. Los pesos del transformer no se modifican en ningun caso.

## Capacidades

- Generacion de texto conversacional en japones e ingles, heredada del modelo base.
- Razonamiento con modo thinking: conserva la plantilla Harmony y el parametro `reasoning_effort` del modelo original.
- Atencion de largo alcance hasta 64k tokens con seleccion dispersa de claves.
- Fallback automatico a atencion densa en secuencias inferiores a 512 tokens (sin bloques de cluster cerrados), con equivalencia bit a bit verificada frente al modelo denso en prompts de 94 tokens.
- Compatibilidad con text-generation-inference y endpoints compatibles segun los tags del repositorio.
- No se documentan capacidades de tool calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Procesamiento de documentos largos en japones: resumen o extraccion de informacion de articulos, informes o contratos de decenas de miles de tokens, aprovechando la ventana de 64k y la seleccion de claves de largo alcance.
- Investigacion sobre atencion dispersa: banco de pruebas reproducible para comparar indexadores PCA frente a destilados sobre un modelo de razonamiento real, con scripts de evaluacion incluidos en el repositorio.
- Generacion de respuestas con razonamiento explicito en japones: el modo thinking y `reasoning_effort` permiten ajustar la profundidad de razonamiento en tareas de analisis o matematicas.
- Evaluacion de needle-in-a-haystack: el modelo sirve para medir la degradacion de recuperacion de informacion a 4k, 16k, 32k y 64k tokens con una implementacion de referencia.
- Prototipado de asistentes conversacionales en japones con contexto largo, siempre en regimen de una sola secuencia por proceso (batch 1, sin padding).
- Estudio de destilacion de indexadores: comparar la curva de KL y la calidad de recuperacion entre el indexador PCA y el destilado para entender el presupuesto de entrenamiento necesario.

## Benchmarks y rendimiento

Resultados publicados por el autor en NVIDIA H200, con el mismo harness y prompts. Datos de Wikipedia japonesa; PPL sobre 4 documentos; needle-in-a-haystack con el codigo «7391» insertado en posiciones 0,1/0,5/0,9 y respuesta numerica (aciertos/intentos).

| Metrica | dense | LSA (PCA, por defecto) | LSA (destilado, 250 pasos) |
|---|---|---|---|
| PPL 4k | 14,17 | 13,95 | 14,01 |
| PPL 16k | 15,41 | 14,51 | 15,30 |
| PPL 32k | 14,04 | 12,93 | 13,88 |
| needle 4k | 6/6 | 6/6 | 3/3\* |
| needle 16k | 3/6 | 3/6 | 0/3\* |
| needle 32k | 2/6 | 2/6 | 0/3\* |
| needle 64k | 1/6 | 2/6 | 0/3\* |
| prefill 4k / 64k | 0,19 s / 4,43 s | 0,79 s / 57,5 s | no disponible |
| decode 1 paso @64k | 0,057 s | 0,127 s | no disponible |

\* El indexador destilado se evaluo con 1 documento y 128 tokens generados, no con las mismas condiciones que dense y PCA.

Lectura: el indexador PCA mantiene la perplejidad a la par o por debajo de dense hasta 32k e iguala o supera la recuperacion needle a 64k. El indexador destilado, pese a reducir la KL media de 7,5 a 4,8, no supera al PCA en recuperacion de largo alcance con el presupuesto empleado. En velocidad, la implementacion de referencia en PyTorch es mas lenta que dense en prefill (12,9 veces a 64k) y en decode (2,2 veces a 64k); las ganancias requieren los kernels Triton o el despliegue con SGLang del repositorio de LSA, no medidos aqui.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,2 GB solo para pesos (8.590 millones de parametros x 2 bytes), mas el KV cache, que no se reduce respecto a dense.
- VRAM en cuantizacion de 8 bits: entorno a 8,6 GB para pesos; en 4 bits, entorno a 4,3 GB. No se publican pesos cuantizados oficiales, por lo que habria que generarlos.
- GPU recomendadas: el autor evalua en NVIDIA H200; por tamano, una A100 40 GB o H100 80 GB cubren el modelo en bf16 con contexto largo. Una RTX 4090 de 24 GB puede alojar los pesos en bf16 pero el contexto a 64k queda muy limitado por el KV cache.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) solo con contexto reducido o cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada); los tags indican compatibilidad con text-generation-inference y endpoints compatibles, pero la implementacion LSA es custom y no se confirma soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: prefill de 0,79 s a 4k y 57,5 s a 64k; decode de 0,127 s por paso a 64k, en H200 con la implementacion de referencia. Sin datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChiTako/llm-jp-4.1-8b-thinking-lsa | 8,59 B | 64k evaluados | LSA dispersa (32 capas) | Apache-2.0 | HuggingFace, 0 descargas |
| llm-jp/llm-jp-4.1-8b-thinking (base) | 8,59 B | no disponible | densa | Apache-2.0 | HuggingFace |
| Alternativas de 8B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base: mismo numero de parametros, mismos pesos y misma licencia, con la diferencia del mecanismo de atencion y los indexadores anadidos. No se dispone de datos de benchmarks de terceros que permitan situar este modelo frente a otras alternativas de tamano similar.

## Limitaciones y advertencias

- Implementacion de referencia en PyTorch sin optimizar: el prefill y el decode son mas lentos que la atencion densa en las mediciones publicadas; el ahorro teorico requiere kernels Triton o SGLang no incluidos en este repositorio.
- Solo soporta una secuencia por proceso (batch 1, sin padding); no hay soporte de batch inference ni de left padding.
- El KV cache no se reduce respecto a dense: el consumo de memoria en contexto largo es identico al del modelo base.
- Secuencias por debajo de 512 tokens caen a atencion densa, por lo que no hay ganancia alguna en ese regimen.
- El indexador destilado incluido no supera al PCA en recuperacion de largo alcance con el presupuesto publicado (250 pasos, 8 documentos); se requieren mas datos y pasos para igualar o superar la inicializacion training-free.
- La recuperacion needle-in-a-haystack decae con la longitud: 3/6 a 16k, 2/6 a 32k y 1-2/6 a 64k, incluso en el modelo denso. No es fiable para tareas de recuperacion exacta en contextos muy largos.
- Riesgo de alucinacion y sesgos del modelo base no documentados en la informacion proporcionada; al no haberse reentrenado los pesos, se heredan los del modelo llm-jp-4.1-8b-thinking.
- Requiere `trust_remote_code=True` por el codigo custom (`modeling_llmjp_lsa.py`, `lsa_core/`), lo que implica ejecutar codigo del autor.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad ni mantenimiento demostrado.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluacion independiente desaconseja su uso en produccion sin validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChiTako/llm-jp-4.1-8b-thinking-lsa
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking
- Repositorio de Latent Sparse Attention: https://github.com/Prefrontal-AI/latent-sparse-attention
- Paper de LSA: arXiv 2610.42147
