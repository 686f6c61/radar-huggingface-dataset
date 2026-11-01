# EliovpAI/Qwen3.8-Flash-Next-W4A8-Paiton-CDNA4

## Resumen

Qwen3.8-Flash-Next-W4A8-Paiton-CDNA4 es una cuantización a 4 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por EliovpAI y ejecutada con el motor propietario Paiton sobre GPUs AMD Instinct de la familia CDNA4 (MI350 / MI355, arquitectura gfx950). El repositorio almacena los 512 expertos enrutados de las 48 capas MoE como códigos FP4 (E2M1, el operando MFMA nativo de CDNA4) con escalas bf16 por cada 128 pesos en una base rotada Hadamard-128, mientras que el tronco del modelo se cuantiza a 8 bits (E4M3 por fila de salida, activaciones bf16).

Su relevancia reside en que es una cuantización GPTQ optimizada específicamente para el hardware FP4 nativo de AMD, con una precisión medida rigurosamente (divergencia KL frente al checkpoint bf16) y pruebas de contexto largo reproducidas hasta 262K tokens. Incluye además una capa MTP (decodificación especulativa) con un drafter afinado para este objetivo cuantizado, lo que mejora el throughput en inferencia.

Un punto crítico: el motor Paiton es propietario y no se distribuye, por lo que estos pesos solo pueden servirse con dicho motor y los resultados de velocidad publicados no son reproducibles desde los archivos del repositorio. El checkpoint original en 16 bits ocupa 335 GiB; esta versión ocupa 120,4 GiB (65,9 GiB de pesos de texto a 4 bits más 54,6 GiB de tablas compartidas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas MoE, 512 expertos enrutados) con capa MTP para decodificación especulativa y tensores de visión |
| Parametros totales | 1.918.886.720 (según metadatos safetensors; el tamaño del repo, 129,3 GB, y el checkpoint bf16 de 335 GiB sugieren un total muy superior, dato completo no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según las pruebas de velocidad y de contexto largo publicadas) |
| Tipos de cuantizacion | Expertos FP4 E2M1 (fp4g128, ~4,125 bits/peso, escala bf16 por 128 pesos, base Hadamard-128); tronco E4M3 de 8 bits con activaciones bf16 (W4A8); cabeza del modelo int8; tabla de embeddings n-gram E4M3; drafter W8A16; tensores de visión bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | safetensors, contenedor `A5-fp4g128-guld4m` (formato `fnq-container-1`), librería `paiton` |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un transformer de mezcla de expertos (MoE) con 48 capas MoE y 512 expertos enrutados por capa, más una capa MTP (multi-token prediction) usada para decodificación especulativa y componentes de visión cuyos tensores se mantienen en bf16. No se dispone en la información proporcionada de detalles sobre el número de tokens de preentrenamiento, la composición del dataset ni los procesos de alineación (RLHF/DPO) del modelo base.

La innovación principal de esta release está en la cuantización: es un GPTQ propio de Paiton ejecutado para el runtime nativo CDNA4 de AMD (gfx950). Los expertos se guardan como códigos FP4 E2M1 —el operando MFMA FP4 nativo de las MI350/MI355— con una escala bf16 con signo por cada 128 pesos (4,125 bits por peso) en una base rotada Hadamard-128. La release utiliza Hessianos por experto para gate/up y down, lo que arroja mejores métricas que las variantes con Hessianos agrupados (A3) o con 2M tokens de calibración (A2). El drafter de la capa MTP está afinado específicamente para este modelo cuantizado, elevando los borradores aceptados por paso de 2,042 a 2,256 (a profundidad 4, teacher-forced, greedy).

## Capacidades

- Generación de texto (pipeline `text-generation`), con decodificación especulativa MTP integrada (hasta 3 tokens de borrador, ~2,25 borradores aceptados por paso a profundidad 4).
- Manejo de contexto muy largo: reproducción exacta de agujas (needles) a 131K y 258K tokens, y degradación de NLL contenida (+0,19 % en el rango 8-32K, dentro de +2,5 % de bf16 hasta 262K en código Python natural).
- Capacidades de visión: el checkpoint incluye los tensores de visión en bf16, aunque no se detallan las capacidades multimodales concretas.
- Soporte MoE con enrutamiento libre del modelo cuantizado (coincidencia top-1 del 93,78 % con el modelo bf16).
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servido de alto throughput en GPUs AMD Instinct MI350/MI355: los pesos están optimizados para el FP4 nativo (MFMA E2M1) de CDNA4, aprovechando kernels específicos del motor Paiton para maximizar tokens/s por vatio.
- Inferencia con contexto extremadamente largo: con 262.144 tokens de ventana y una KV cache medida de 1.795.019 tokens en una MI350P, es adecuado para análisis de repositorios de código completos, documentos legales extensos o conversaciones de muy larga duración.
- Procesamiento por lotes de muchas peticiones concurrentes: las mediciones muestran escalado hasta 64 streams concurrentes, útil para backends de API con alta demanda.
- Análisis de código a gran escala: las pruebas publicadas incluyen documentos Python naturales de 4 x 262K tokens con degradación mínima frente a bf16, idóneo para revisión y resumen de bases de código.
- Reducción de coste de inferencia mediante cuantización: pasar de 335 GiB (bf16) a 120,4 GiB permite servir el modelo en una sola aceleradora en lugar de un nodo multi-GPU.
- Decodificación especulativa en producción: la capa MTP con drafter afinado (2,256 borradores aceptados por paso) acelera la generación secuencial en escenarios de baja concurrencia (hasta 4 peticiones simultáneas según la configuración probada).
- Investigación en cuantización: la publicación de métricas KL con intervalos de confianza, comparativas entre recetas (per-expert vs. pooled Hessians, INT4-g128) y datos crudos de las pruebas la hace útil como referencia para estudios de cuantización FP4.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas de fidelidad de cuantización y de velocidad:

**Precisión de cuantización** (KL del modelo bf16 a este modelo, media sobre posiciones de texto y asistente en un set de evaluación de 294.912 tokens):

| | KL t+a free [IC 95 %] | KL t+a routing locked | Coincidencia top-1 | KL todas las posiciones |
|---|---|---|---|---|
| **Esta release** (Hessianos por experto) | 0,0265 [0,0239, 0,0292] | 0,0131 | 93,78 % | 0,1207 |
| Mismo formato, Hessianos pooled (A3) | 0,0275 [0,0251, 0,0300] | 0,0145 | 93,61 % | 0,1288 |
| Mismo formato, 2M tokens de calibración (A2) | 0,0283 [0,0258, 0,0309] | 0,0151 | 93,51 % | 0,1271 |
| Expertos INT4-g128 (receta RDNA4) | 0,0288 | 0,0135 | 93,51 % | no disponible |

Dos implementaciones bf16 correctas puntúan alrededor de 0,008 en KL, por lo que 0,0265 indica una pérdida de precisión moderada y bien caracterizada.

**Velocidad de referencia (stock)**: checkpoint MXFP4 de Quark (AMD) del mismo modelo, vLLM 0.32.0 + AITER, una MI350P a 450 W, contexto de 262.144 tokens, sin decodificación especulativa:

| | c1 | c2 | c4 | c8 | c16 | c32 | c64 | prefill 8K | prefill 64K | KV cache (tokens) |
|---|---|---|---|---|---|---|---|---|---|---|
| Quark MXFP4, vLLM 0.32.0 + AITER (tok/s) | 122,1 | 195,4 | 384,7 | 602,8 | 1.029,0 | 1.544,1 | 2.185,2 | 7.009 | 7.224 | 1.795.019 |

**Velocidad con el motor Paiton**: la tabla comparativa correspondiente aparece truncada en la model card y no se dispone de las cifras. Según el propio autor, el motor Paiton (kernels CDNA4 optimizados, `.so`) es propietario y no se distribuye, por lo que esos números no son reproducibles desde los archivos de este repositorio. En la configuración probada se activa MTP (3 tokens de borrador) hasta 4 peticiones concurrentes, con 64 secuencias concurrentes y contexto de 262.144 tokens.

## Requisitos de hardware

- GPU objetivo: AMD Instinct MI350 / MI355 (arquitectura CDNA4, gfx950), por el uso del operando MFMA FP4 nativo. No es utilizable en GPUs NVIDIA ni en CDNA3.
- Memoria: el repositorio ocupa 129,3 GB (120,4 GiB de pesos: 65,9 GiB de texto a 4 bits + 54,6 GiB de tablas compartidas), más la KV cache. No cabe en GPUs de consumo; se requiere al menos una MI350P (las pruebas se realizaron con una sola MI350P a 450 W, con potencia por defecto de 600 W).
- VRAM estimada total en inferencia: no disponible con exactitud; la referencia stock con contexto de 262.144 tokens aloja una KV cache de 1.795.019 tokens en la MI350P.
- Despliegue: exclusivamente mediante el motor Paiton (propietario, no distribuido en el repositorio). La alternativa pública documentada es el checkpoint MXFP4 de Quark del mismo modelo servido con vLLM 0.32.0 + AITER sobre ROCm. No hay soporte indicado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: para el checkpoint MXFP4 con vLLM (referencia), 122,1 tok/s a concurrencia 1 y 2.185,2 tok/s agregados a 64 streams; prefill de 7.009-7.224 tok/s. Las cifras del motor Paiton no están disponibles (tabla truncada).

## Comparativa con modelos similares

| | Este modelo (W4A8 Paiton) | Quark MXFP4 de Qwen3.8-Flash-Next (referencia) | Qwen3.8-Flash-Next bf16 (base) |
|---|---|---|---|
| Cuantización | FP4 E2M1 expertos + W4A8 tronco | MXFP4 (expertos 4-bit) | bf16 (sin cuantizar) |
| Tamaño | 120,4 GiB | no disponible | 335 GiB |
| Contexto | 262.144 tokens | 262.144 tokens | 262.144 tokens (implícito) |
| Motor | Paiton (propietario, CDNA4) | vLLM 0.32.0 + AITER (ROCm) | no disponible |
| Decodificación especulativa | Sí (MTP, drafter afinado) | No (en la config. probada) | no disponible |
| KL vs. bf16 (t+a, free) | 0,0265 | no disponible | 0 (referencia) |
| Licencia | qwen-community-1.0 | no disponible | qwen-community-1.0 |

No se conocen otras alternativas comparables publicadas con métricas de fidelidad equivalentes para este modelo base en la información disponible.

## Limitaciones y advertencias

- El motor Paiton es propietario y no se distribuye: los pesos de este repositorio solo pueden servirse con ese motor, y las cifras de velocidad del mismo no son reproducibles desde los archivos aquí publicados. Esto es un bloqueante serio para despliegues independientes.
- `inference: false` en la configuración: el modelo no puede ejecutarse mediante la inference API de Hugging Face.
- Pérdida de precisión medible por la cuantización: KL de 0,0265 frente a ~0,008 entre dos implementaciones bf16 correctas; coincidencia top-1 del 93,78 % con bf16. En el bucket 2-8K de una prueba de código largo hay una diferencia de +0,0022 nats significativa frente a A3.
- Sesgos: no disponible; heredará los del modelo base Qwen3.8-Flash-Next, cuya documentación de sesgos no se incluye en la información proporcionada.
- Riesgo de alucinación: inherente a todo modelo de lenguaje generativo; no hay evaluaciones específicas de alucinación publicadas para esta cuantización.
- Idiomas soportados: no disponible en la model card.
- Licencia qwen-community-1.0 (licencia "other"): las restricciones concretas para uso comercial deben revisarse en el enlace de la licencia del modelo base; no se resumen en la model card.
- Dependencia de hardware muy específico (CDNA4/gfx950): sin MI350/MI355, los pesos no son aprovechables tal cual; para otras arquitecturas el autor referencia una receta INT4-g128 distinta (RDNA4).
- Proyecto de nicho: 224 descargas y 0 likes en el momento de la ficha; la madurez, el soporte comunitario y la trazabilidad de la cuantización son limitados frente a cuantizaciones oficiales de Qwen o AMD.
- La tabla de velocidad del motor Paiton está truncada en la model card, por lo que el principal argumento de venta (rendimiento del motor propietario) no puede verificarse de forma completa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/EliovpAI/Qwen3.8-Flash-Next-W4A8-Paiton-CDNA4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Blog post del autor con los datos de las pruebas: https://eliovp.com/blog/paiton-qwen38-flash-next-amd-instinct-mi350p
- Herramienta de velocidad citada: https://localmaxxing.com (test open source lmx, v0.1.54)
