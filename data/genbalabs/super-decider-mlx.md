# GenbaLabs/super-decider-mlx

## Resumen

Super-decider-mlx es un puerto a MLX (Apple silicon) del modelo Singularity-Compute/super-decider, un fine-tune de 25,82 mil millones de parámetros basado en google/diffusiongemma-26B-A4B-it, un modelo de difusión textual (DiffusionLM) con arquitectura Mezcla de Expertos (MoE) derivada de la familia Gemma. El modelo está especializado en tareas de decisión de opción múltiple: dado un estado (texto de entrada) y un conjunto de preguntas con criterios, emite etiquetas de un solo token como respuesta, lo que lo hace adecuado para clasificación estructurada, evaluación de riesgos y verificación documental.

La relevancia de este puerto radica en que preserva bit a bit los pesos NVFP4 de 4 bits de los expertos originales, sin re-cuantización ni pérdida de calidad, y lo ejecuta de forma nativa en Mac con chips M-series mediante el framework MLX de Apple. El repositorio incluye un servidor de decisiones FastAPI compatible en parte con la API de vLLM, con caché de prefijo y batching de "canvas" de difusión.

Es un modelo de nicho: texto únicamente, en inglés, con licencia Apache 2.0, pensado para despliegues locales en hardware Apple de gama alta en lugar de GPU de datacenter.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionGemma (modelo de difusión textual) MoE, 30 capas, 128 expertos con top-8 |
| Parametros totales | 25,82 B (22,8 B en pesos de expertos a 4 bits) |
| Parametros activos | ~4 B por token (26B-A4B: top-8 de 128 expertos) |
| Longitud de contexto | 262 144 tokens según la config del modelo; el runtime de este puerto limita el prompt a 12 288 tokens y el canvas a 128 |
| Tipos de cuantizacion | NVFP4 (4 bits, códigos uint32 empaquetados, escala E4M3 por cada 16 entradas y escala global F32 por matriz de experto); resto en BF16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (8 shards, 1167 tensores, 18,8 GB en disco); layout propio no cargable por `transformers` |

## Arquitectura y entrenamiento

La base es DiffusionGemma 26B-A4B, una variante de difusión textual de la familia Gemma: en lugar de generación autorregresiva token a token, el modelo refina iterativamente un "canvas" de 128 posiciones mediante pasos de denoising, con bloques bidireccionales por pregunta. La capa MoE tiene 128 expertos con activación top-8 (de ahí la denominación A4B: unos 4 mil millones de parámetros activos por token), hidden size de 2816 y vocabulario de 262 144 tokens. La torre de visión del modelo original ha sido eliminada en este puerto, ya que la ruta de texto nunca la utiliza.

Sobre esta base, Singularity-Compute entrenó el fine-tune super-decider para tareas de decisión de opción múltiple con etiquetas de un solo token. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. En cuanto a la ingeniería del puerto: los expertos llegan pre-apilados y fusionados (gate/up fusionados), lo que permite cargar los tensores sin copias y pasarlos directamente a `mx.gather_qmm`. La conversión es bit-exacta (error relativo máximo de 9,0e-08 en la verificación de dequantización sobre las 30 capas) y se ha validado con 68 tests de paridad numérica contra la implementación de referencia en `transformers` 5.21.0.

## Capacidades

- Clasificación estructurada de opción múltiple: dado un estado y preguntas con criterios, devuelve etiquetas de un solo token (tipos `noul` binario, `choice` de opciones nombradas, `score` de niveles ordenados y `span` de offsets de caracteres).
- Decisión multi-pregunta en una sola petición: varias preguntas sobre el mismo estado se resuelven agrupando los canvas en un único forward.
- Generación de texto conversacional mediante el pipeline text-generation, aunque el foco del fine-tune es la decisión.
- Razonamiento sobre documentos: el ejemplo de la model card muestra análisis de facturas con IVA y detección de riesgo.
- Caché de prefijo de instrucciones: reutiliza el KV del prefijo cuando el estado se repite con preguntas nuevas.
- Modo self-conditioned en el denoiser, con paridad verificada frente a la implementación de referencia.
- No soporta visión (la torre de imagen fue eliminada; las imágenes se rechazan con error explícito).
- No hay información sobre tool calling, function calling ni capacidades agénticas.

## Casos de uso

- Verificación documental automatizada: clasificar facturas, contratos o formularios según criterios binarios o escalas (por ejemplo, comprobar si el IVA inverso está correctamente aplicado en una factura europea), aprovechando que cada lectura de decisión tarda unos 0,23 s.
- Triaje de riesgo en flujos empresariales: asignar niveles de riesgo ordenados (`none`/`low`/`medium`/`high`) a estados textuales como tickets, incidencias o expedientes, con salidas estructuradas de un token fáciles de parsear.
- Moderación y clasificación de contenido: etiquetar mensajes con categorías definidas por el usuario mediante el tipo `choice`, sin necesidad de prompts complejos de salida JSON.
- Extracción de fragmentos con `span`: localizar offsets de caracteres en el texto de entrada para tareas de extracción ligera, aunque la propia model card advierte que este tipo está menos probado.
- Procesamiento local y privado en Mac: ejecutar todo el pipeline en un MacBook Pro con M5 Pro y 48 GB sin enviar datos a la nube, útil para sectores con requisitos de confidencialidad.
- Evaluación en lote de un mismo estado: las 8 lecturas de decisión se agrupan en un único forward (los canvas se procesan en batch), reduciendo el coste de evaluar múltiples criterios sobre el mismo documento.
- Servicios de decisión embebidos: el servidor FastAPI en el puerto 8011 expone una API REST simple que puede integrarse en pipelines de automatización (n8n, LangChain, scripts de CI) para pasos de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona puntuaciones publicadas en JevBench para el modelo base, pero medidas sobre el despliegue de referencia en vLLM (L40S), no sobre este puerto MLX, y no se incluyen los números concretos.

Rendimiento medido del puerto en un M5 Pro con 48 GB de RAM unificada, según la model card:

| Métrica | Valor |
|---|---|
| Carga del modelo | ~2 s, 17,5 GiB residentes |
| Prefill | 1,8 s @ 2 k tokens; 11 s @ 6 k tokens |
| Una lectura de decisión | ~0,23 s (un paso de denoiser sobre canvas de 128) |
| 8 lecturas del mismo estado | 1 forward (batching de canvas) |
| Estado repetido, preguntas nuevas | ~0,5 s en caliente vs ~1,4 s en frío (prompt de 1,6 k tokens) |

## Requisitos de hardware

- Memoria unificada: ~17,5 GiB residentes tras la carga; se recomienda un Mac con al menos 32 GB, siendo 48 GB la configuración de referencia (M5 Pro).
- No requiere GPU NVIDIA: este puerto es exclusivo de Apple silicon mediante MLX. El despliegue de referencia del modelo original usa vLLM en una L40S (Marlin W4A16, caché KV FP8), pero ese camino no aplica a este repositorio.
- No cabe en GPUs de consumo típicas (8-16 GB de VRAM) por los 18,8 GB de pesos; en el ecosistema NVIDIA haría falta una GPU con 24 GB o más, aunque este puerto no lo soporta.
- Despliegue: script `runtime/run.sh` incluido, que levanta un motor FastAPI en el puerto 8000 (subconjunto compatible con vLLM) y el servidor de decisiones en el 8011. No es cargable con `transformers`, ni hay indicios de soporte para llama.cpp u Ollama.
- Concurrencia limitada a 1: un mutex único protege el motor (MLX no es thread-safe y la caché de prefijo usa una sola ranura); las peticiones concurrentes se encolan.
- Latencia: ~0,23 s por decisión individual; el prefill crece cuadráticamente con la longitud del prompt (1,8 s a 2 k tokens, 11 s a 6 k).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GenbaLabs/super-decider-mlx | 25,82 B (A4B) | DiffusionGemma MoE | 12 288 en runtime (262 144 nominal) | Apache 2.0 | MLX, Apple silicon |
| Singularity-Compute/super-decider | 25,82 B (A4B) | DiffusionGemma MoE | 262 144 (nominal) | Apache 2.0 | vLLM en GPU NVIDIA (L40S) |
| google/diffusiongemma-26B-A4B-it | 26 B (A4B) | DiffusionGemma MoE, multimodal | no disponible | no disponible | vLLM, transformers 5.21+ |
| Gemma 3 27B (referencia de tamaño similar) | 27 B | Transformer denso, multimodal | 128 k | Gemma (restricciones de uso) | transformers, vLLM, llama.cpp |

La alternativa densa de tamaño comparable (Gemma 3 27B) ofrece un ecosistema de despliegue mucho más amplio, pero super-decider-mlx activa solo ~4 B de parámetros por token y está afinado específicamente para decisiones estructuradas de etiqueta única, donde su latencia de ~0,23 s por lectura en un portátil es difícil de igualar.

## Limitaciones y advertencias

- Solo texto: las imágenes se rechazan con error explícito; la torre de visión fue eliminada del checkpoint.
- Concurrencia de una sola petición: MLX no es thread-safe y la caché de prefijo tiene una única ranura; el paralelismo se degrada a cola de espera, lo que limita el uso en producción multiusuario.
- La reutilización de la caché de prefijo no es bit-exacta: las probabilidades de etiqueta pueden variar ~0,02 (mediana) a ~0,05 (peor caso) en 14 lecturas a 1,5 k tokens, aunque la etiqueta superior se mantiene. Puede desactivarse con `SD_PREFIX_CACHE=0` a costa de un prefill completo.
- Límite práctico de 12 288 tokens de prompt y 128 de canvas en este runtime, pese a que el modelo declara 262 144 de contexto nominal.
- Las preguntas requieren identificadores de un solo token, y el texto de las instrucciones forma parte del prompt: una etiqueta no mencionada en los criterios no funcionará.
- El tipo `span` (offsets de caracteres) está menos probado que los tipos de etiqueta.
- Los benchmarks JevBench publicados corresponden al despliegue vLLM de referencia, no a este puerto MLX; el rendimiento en calidad puede diferir por el uso de kernels distintos.
- Sin información publicada sobre sesgos, tasas de alucinación ni datos de entrenamiento del fine-tune.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque los términos de la familia Gemma subyacente pueden aplicar al modelo base.

## Enlaces

- Repositorio del puerto MLX: https://huggingface.co/GenbaLabs/super-decider-mlx
- Modelo base (fine-tune): https://huggingface.co/Singularity-Compute/super-decider
- Modelo base (instruccional): https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Cuantización NVFP4 de referencia: https://huggingface.co/nvidia/diffusiongemma-26B-A4B-NVFP4 (variante -it referenciada en la model card)
- Paper, blog o demo: no disponible
