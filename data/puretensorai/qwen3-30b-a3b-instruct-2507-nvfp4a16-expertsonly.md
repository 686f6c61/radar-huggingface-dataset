# PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly

## Resumen

Este repositorio contiene una cuantización NVFP4A16 del modelo Qwen3-30B-A3B-Instruct-2507, publicada por PureTensorAI a partir de los pesos oficiales en BF16. Se trata de un modelo Mixture-of-Experts (MoE) de 30.532 millones de parámetros totales, con 48 bloques y 128 expertos por bloque, de los cuales 8 se activan por token. La particularidad de esta build es que solo los expertos están cuantizados a 4 bits (18.432 capas, el 97 % del peso de cada bloque), mientras que las proyecciones de atención, los routers de expertos, los embeddings, la cabeza de salida y todas las activaciones se mantienen en 16 bits. El resultado es un checkpoint de 19,40 GB frente a los 61,08 GB del BF16 original.

El problema que aborda es el coste de servir un MoE de 30B en producción: la cuantización reduce el peso a menos de un tercio y, según las mediciones del autor, multiplica el throughput entre 1,27x (un solo stream) y 2,08x (8 concurrentes) sobre BF16 en vLLM. La decisión de dejar la atención en 16 bits responde a una medición concreta: pese a representar solo el 3 % de los pesos de cada bloque, redondearla a 4 bits provoca aproximadamente la mitad del daño en divergencia KL y altera cerca del 5 % de las elecciones de expertos del router. Mantenerla en BF16 cuesta 1,3 GB adicionales pero reduce la KL media frente a BF16 de 0,0292 a 0,0199 en WikiText-2 y de 0,0238 a 0,0153 en conversaciones.

Es relevante ahora porque permite ejecutar un modelo de la familia Qwen3 en GPUs Blackwell con kernels FP4 weight-only de vLLM, con una fidelidad al modelo original que el autor sitúa estadísticamente indistinguible en MMLU (79,90 frente a 80,12, p = 0,12). Se publica como test release, sin afiliación con los autores del modelo base, y requiere vLLM para una inferencia correcta: cargarlo de la forma estándar en Transformers produce salidas erróneas sin emitir ningún error.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_moe), 48 bloques, 128 expertos por bloque, 8 activos por token |
| Parámetros totales | 30.532.122.624 |
| Parámetros activos | 8 expertos de 128 por token (el autor no publica el recuento exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4A16: valores 4-bit E2M1, una escala FP8 E4M3 por grupo de 16, una escala FP32 por tensor; solo expertos en 4 bits, resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-30B-A3B-Instruct-2507 original: un transformer MoE con 48 bloques, 128 expertos por bloque y enrutamiento que activa 8 expertos por token. Sobre esa base, esta publicación no entrena el modelo, sino que aplica cuantización GPTQ con `block_size` 128, `dampening_frac` 0,01 y `actorder` estático. La calibración se realizó con 512 muestras en formato chat procedentes de `mlabonne/open-perfectblend`, de hasta 2.048 tokens cada una, y con un tratamiento particular de los expertos: cada token de calibración pasa por todos los expertos, y los tokens que el router no envió a un experto concreto cuentan con peso 0,1 en las estadísticas de ese experto. Las herramientas empleadas fueron llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1.

La innovación técnica destacable no está en el entrenamiento sino en la política de cuantización selectiva. El autor midió por separado el impacto de redondear a 4 bits solo la atención, solo los expertos y ambos: la atención sola (3 % de los pesos del bloque) produce una KL de 0,0225 en WikiText-2 y 0,0283 en chat, mientras que los expertos solos (97 % de los pesos) producen 0,0205 y 0,0223. Cuantizar ambos eleva la KL a 0,0380 y 0,0427. De ahí la decisión de mantener atención, routers, embeddings, cabeza de salida, normas y activaciones en 16 bits. El checkpoint guardado en disco, al recargarse, produce logits idénticos al modelo cuantizado en memoria. El autor no detalla la composición del dataset de entrenamiento original del modelo base ni si hubo RLHF o DPO en el mismo.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen3-30B-A3B-Instruct-2507.
- Razonamiento y respuesta a preguntas de conocimiento general, evaluado en MMLU, ARC-Challenge, HellaSwag, Winogrande y TruthfulQA.
- Razonamiento matemático de varios pasos, medido con GSM8K (1.319 problemas a través de la API de completions de vLLM).
- Enrutamiento MoE con retención del 96,3 % de las elecciones de expertos del BF16 por token, lo que preserva en gran medida el comportamiento del modelo original.
- Inferencia acelerada en vLLM mediante kernel FP4 weight-only para los expertos, con atención en BF16.
- Capacidades de tool calling, agentes y multilingüismo: no disponibles en la información proporcionada para esta build.

## Casos de uso

- Servicio de chat conversacional en producción: el checkpoint reduce el peso a 19,40 GB y ofrece 1,27x de throughput en un solo stream y 2,08x con 8 concurrentes frente a BF16 en vLLM, lo que permite atender más sesiones por GPU manteniendo una fidelidad alta al modelo original.
- Despliegue en GPUs Blackwell con kernels FP4: al usar el kernel weight-only FP4 de vLLM 0.34.0 para los expertos, encaja en estaciones de trabajo con compute capability 12.0 que no podrían alojar el BF16 de 61,08 GB con holgura.
- Evaluación de calidad de cuantizaciones: sirve como referencia para comparar políticas de cuantización selectiva, ya que el autor publica KL frente a BF16 en WikiText-2 y chat, y la tasa de coincidencia de expertos del router.
- Razonamiento matemático asistido: con un 88,25 en GSM8K servido por la API de completions de vLLM, es adecuado para pipelines de resolución de problemas aritméticos donde se prioriza la fidelidad al BF16 (88,70) sobre la velocidad máxima.
- Investigación sobre robustez de routers MoE: la métrica de coincidencia de elecciones de expertos (96,3 %) permite estudiar cómo la cuantización de los expertos afecta al enrutamiento sin contaminar el efecto con la cuantización de la atención.
- Prototipado de asistentes con requisitos de licencia permisiva: al heredar la licencia Apache 2.0 del modelo base, puede integrarse en productos comerciales internos, siempre que se valide la corrección de la inferencia con vLLM.

## Benchmarks y rendimiento

| Métrica | BF16 | Hermano totalmente cuantizado | Este checkpoint | Este vs. BF16 |
|---|---:|---:|---:|---:|
| MMLU (14.042 preguntas) | 80,12 | 79,66 | 79,90 | 193 perdidas, 163 ganadas, p = 0,12 |
| ARC-Challenge | 60,84 | 60,07 | 59,90 | p = 0,20 |
| HellaSwag | 61,15 | 60,98 | 60,83 | p = 0,02 |
| Winogrande | 72,93 | 72,69 | 73,16 | p = 0,81 |
| TruthfulQA (mc2) | 61,67 | 60,53 | 60,94 | p = 0,02 |
| GSM8K vía API de completions de vLLM (1.319 problemas) | 88,70 | 89,46 | 88,25 | 34 perdidas, 28 ganadas, p = 0,53 |
| KL media vs. BF16, WikiText-2 | 0 | 0,0292 | 0,0199 | — |
| KL media vs. BF16, chat | 0 | 0,0238 | 0,0153 | — |
| Mismas elecciones de experto que BF16 | 100 % | 95,3 % | 96,3 % | — |
| Tamaño de fichero | 61,08 GB | 18,09 GB | 19,40 GB | — |

Rendimiento en vLLM 0.34.0 sobre una GPU Blackwell (compute capability 12.0), generaciones greedy de 256 tokens:

| Escenario | BF16 | Hermano totalmente cuantizado | Este checkpoint |
|---|---:|---:|---:|
| Throughput, un solo stream | 1,00x | 1,42x | 1,27x |
| Throughput, 8 concurrentes | 1,00x | 2,27x | 2,08x |
| Throughput, 32 concurrentes | 1,00x | 1,86x | 1,79x |

Los benchmarks se ejecutaron con las configuraciones por defecto de lm-evaluation-harness 0.4.13, sin plantilla de chat y en modo offline en Transformers salvo GSM8K. El test pareado es una prueba exacta de McNemar sobre la corrección por pregunta. La KL se calculó con la distribución completa del siguiente token, teacher-forced, sobre 48 ventanas de WikiText-2 y 96 conversaciones de `HuggingFaceH4/ultrachat_200k` (`test_sft`) de 1.024 tokens cada una; el autor advierte que la fila de chat es favorable porque ese conjunto procede de la misma familia de datos que parte de la calibración. Frente al hermano totalmente cuantizado, las diferencias pareadas son MMLU 211 ganadas y 177 perdidas (p = 0,09) y GSM8K servido 21 ganadas y 37 perdidas (p = 0,05), sin corrección por comparaciones múltiples, por lo que el autor lo interpreta como ausencia de diferencia fiable en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 19,40 GB en disco; en vLLM, los expertos se sirven con kernel FP4 weight-only y la atención en BF16, por lo que el consumo de pesos ronda esos 19,4 GB más la caché KV y el overhead del motor.
- GPU recomendadas: el autor midió sobre una GPU NVIDIA Blackwell de estación de trabajo con compute capability 12.0; el kernel FP4 weight-only de vLLM requiere esa generación para aprovechar la ventaja de velocidad.
- GPU de consumo: no disponible en la información proporcionada; no se documenta compatibilidad con RTX 4090 ni con GPUs sin soporte FP4.
- Opciones de despliegue: vLLM 0.34.0 es el motor validado y recomendado por el autor. Cargar el modelo de la forma estándar en Transformers produce salidas incorrectas sin error, por lo que no debe usarse sin el runtime adecuado. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,27x en un solo stream, 2,08x con 8 concurrentes y 1,79x con 32 concurrentes frente a BF16, con generaciones greedy fijas de 256 tokens; el autor advierte que los valores variarán en otro hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4A16 experts only) | 30,53B totales, 8/128 expertos activos | no disponible | MMLU 79,90; GSM8K 88,25; KL 0,0199 (WikiText-2) | Apache 2.0 | Hugging Face, requiere vLLM |
| Hermano totalmente cuantizado (PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16) | 30,53B totales | no disponible | MMLU 79,66; GSM8K 89,46; KL 0,0292 (WikiText-2) | Apache 2.0 | Hugging Face, 18,09 GB |
| Qwen3-30B-A3B-Instruct-2507 BF16 (modelo base) | 30,53B totales | no disponible | MMLU 80,12; GSM8K 88,70 | Apache 2.0 | Hugging Face, 61,08 GB |

## Limitaciones y advertencias

- Es una test release publicada por un tercero, sin afiliación ni respaldo de los autores del modelo base.
- Cargar el checkpoint de la forma estándar en Transformers produce salidas incorrectas sin emitir ningún error; es obligatorio usar vLLM u otro runtime compatible con compressed-tensors NVFP4.
- La cuantización introduce degradación medible: HellaSwag y TruthfulQA muestran diferencias significativas frente a BF16 (p = 0,02 en ambos), y la coincidencia de elecciones de expertos con BF16 es del 96,3 %, no del 100 %.
- La evaluación de KL en chat procede de la misma familia de datos que parte de la calibración, por lo que el autor la califica de favorable y no debe tomarse como estimación independiente.
- La calibración se hizo con una sola extracción de datos; el autor indica que una segunda extracción del recetario del hermano movió MMLU 0,04 puntos, pero no se reporta variabilidad para esta build.
- Los benchmarks se ejecutaron sin plantilla de chat, salvo GSM8K servido, por lo que los resultados no reflejan necesariamente el rendimiento en uso conversacional real.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto en la información proporcionada.
- Licencia Apache 2.0 heredada del modelo base, permisiva para uso comercial, pero el autor no ofrece garantías sobre esta build.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly
- Hermano totalmente cuantizado: https://huggingface.co/PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de calibración: `mlabonne/open-perfectblend`
- Dataset de evaluación KL: `HuggingFaceH4/ultrachat_200k`
- Referencias citadas en los tags: arXiv 2406.08155, arXiv 2605.23078, arXiv 2606.17118 (no se dispone de sus títulos en la información proporcionada)
