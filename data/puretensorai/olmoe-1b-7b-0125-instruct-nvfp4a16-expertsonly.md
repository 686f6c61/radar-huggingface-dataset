# PureTensorAI/OLMoE-1B-7B-0125-Instruct-NVFP4A16-ExpertsOnly

## Resumen

PureTensorAI/OLMoE-1B-7B-0125-Instruct-NVFP4A16-ExpertsOnly es una cuantización NVFP4 del modelo instructivo OLMoE-1B-7B-0125-Instruct de AllenAI, publicada por PureTensorAI como versión de prueba. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 6.919.161.856 parámetros totales y aproximadamente 1.300 millones de parámetros activos por token (8 de 64 expertos por bloque, 16 bloques). El checkpoint reduce el peso en disco de 13,84 GB en BF16 a 4,58 GB, manteniendo en 16 bits la atención, los routers, los embeddings y la cabeza de salida, y cuantizando únicamente las 3.072 capas de expertos.

La relevancia de esta ficha reside en su enfoque de cuantización selectiva: solo el 96% de los pesos de los bloques (los expertos) se comprimen a 4 bits, mientras que el 4% restante (las proyecciones de atención) permanece en BF16. Según las mediciones del autor, esta decisión preserva mejor la calidad que cuantizar todo el bloque, con una divergencia KL un tercio menor que la variante totalmente cuantizada, a cambio de 0,39 GB adicionales. El modelo está pensado para servirse con vLLM sobre GPUs Blackwell con soporte de FP4, no para carga directa en Transformers.

El modelo hereda las capacidades conversacionales y de razonamiento del OLMoE instructivo original, con soporte únicamente en inglés y licencia Apache 2.0. Su tamaño compacto y su velocidad de servicio (hasta 2,25 veces la del BF16 en 32 flujos concurrentes) lo orientan a despliegues con requisitos de latencia y coste ajustados, no a tareas que exijan el máximo rendimiento absoluto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; 16 bloques, 64 expertos por bloque, 8 activos por token |
| Parametros totales | 6.919.161.856 |
| Parametros activos | Aproximadamente 1.300 millones (8 de 64 expertos por bloque, segun el modelo base) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4A16 (4 bits E2M1 en valores, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor); solo expertos en 4 bits, atencion y routers en BF16; esquema compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors), 4,58 GB en disco |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 16 bloques, cada uno con 64 expertos y enrutamiento que activa 8 expertos por token. Esta ficha no modifica la arquitectura, sino que aplica una cuantizacion post-entrenamiento GPTQ (`block_size` 128, `dampening_frac` 0.01, `actorder` estatico) sobre los pesos BF16 oficiales de allenai/OLMoE-1B-7B-0125-Instruct. La calibracion emplea 512 muestras en formato chat de `mlabonne/open-perfectblend`, de hasta 2.048 tokens cada una, y pasa cada token de calibracion por todos los expertos, asignando peso 0,1 a los tokens que el router no dirigio a un experto concreto. El experto menos utilizado recibio alrededor de 7.000 tokens enrutados.

La innovacion tecnica principal es la cuantizacion selectiva por medicion: el autor evaluo por separado el redondeo a 4 bits de la atencion y de los expertos, y concluyo que el 4% de los pesos (la atencion) causa casi la mitad del dano en divergencia KL (0,0616 frente a 0,0760 en WikiText-2). Por ello mantiene la atencion en BF16 y solo cuantiza los expertos, lo que anade 0,39 GB pero reduce la KL de 0,106 a 0,074 en WikiText-2 y de 0,053 a 0,035 en chat respecto a la variante totalmente cuantizada. Las herramientas empleadas fueron llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. No se dispone de informacion sobre el proceso de entrenamiento original (tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instructivo OLMoE-1B-7B-0125-Instruct.
- Razonamiento de varios pasos y respuesta a instrucciones en formato chat.
- Razonamiento matematico basico y resolucion de problemas aritmeticos (evaluado en GSM8K).
- Conocimiento general y respuesta a preguntas de opcion multiple (evaluado en MMLU).
- Enrutamiento MoE con 8 expertos activos por token y 96,8% de coincidencia media con las elecciones del router en BF16.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Servicio de chat conversacional de bajo coste: el checkpoint ocupa 4,58 GB y se sirve con vLLM sobre GPUs Blackwell, lo que permite desplegar un MoE instructivo en una sola GPU de workstation con throughput 2,25 veces superior al BF16 en 32 flujos concurrentes.
- Clasificacion y respuesta a preguntas de opcion multiple a escala: con MMLU de 52,94 y una degradacion de solo 0,54 puntos frente a BF16, es adecuado para pipelines de evaluacion y etiquetado masivo donde el coste por token prima sobre la precision absoluta.
- Razonamiento aritmetico en produccion: GSM8K de 68,23 servido por vLLM, practicamente identico al BF16 (68,39), lo que lo hace valido para asistentes de calculo y resolucion de problemas numericos sencillos.
- Despliegue en entornos con memoria limitada: al reducir el peso a un tercio del BF16, permite ejecutar un MoE de 6.900 millones de parametros en GPUs consumer con suficiente VRAM, siempre que se use vLLM con soporte FP4.
- Generacion de texto en lote para preprocesamiento de datos: la velocidad de 2,11 veces el BF16 con 8 flujos concurrentes lo hace util para tareas de sintesis y aumento de datos en ingles.
- Prototipado e investigacion sobre cuantizacion MoE: sirve como referencia reproducible de la tecnica de cuantizacion selectiva de expertos, con metricas de KL, routing y benchmarks publicadas para comparar recetas.
- Evaluacion comparativa de infraestructura: util para medir el rendimiento de vLLM con pesos FP4 en Blackwell frente a BF16 en el mismo hardware.

## Benchmarks y rendimiento

| Metrica | BF16 | Este checkpoint | Cambio | Prueba pareada |
|---|---:|---:|---:|---|
| MMLU, accuracy (14.042 preguntas) | 53,48 | 52,94 | -0,54 | 597 perdidas, 521 ganadas, p = 0,025 |
| GSM8K, offline (1.319 problemas, flexible-extract) | 67,85 | 67,78 | -0,07 | 92 perdidas, 91 ganadas, p = 1,0 |
| GSM8K via API de completions de vLLM | 68,39 | 68,23 | -0,16 | 89 perdidas, 87 ganadas, p = 0,94 |
| Perplejidad WikiText-2 (65.536 tokens) | 11,33 | 11,60 | +0,27 | No disponible |

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test | 65.536 | 0,074 | 0,62 | 87,9% |
| Chat (`HuggingFaceH4/ultrachat_200k`, `test_sft`, 128 conversaciones) | 111.884 | 0,035 | 0,36 | 92,7% |

| Throughput en vLLM 0.34.0 (GPU Blackwell, compute capability 12.0) | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K via API de completions | 68,39 | 68,23 |
| Throughput, flujo unico | 1,00x | 1,40x |
| Throughput, 8 concurrentes | 1,00x | 2,11x |
| Throughput, 32 concurrentes | 1,00x | 2,25x |

Los benchmarks se obtuvieron con las configuraciones por defecto `mmlu` y `gsm8k` de lm-evaluation-harness 0.4.13, sin plantilla de chat. La prueba pareada es un test exacto de McNemar sobre la correccion por pregunta. La KL se calculo con la distribucion completa del siguiente token, en modo teacher-forced y ventanas de 1.024 tokens. El enrutamiento coincide en un 96,8% de media con el de BF16. Los datos provienen de una unica calibracion, sin semillas repetidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,58 GB de pesos en FP4 mas overhead de atencion en BF16, cache KV y activaciones; el autor no publica una cifra total de VRAM.
- GPU recomendadas: NVIDIA Blackwell (compute capability 12.0) para la ruta weight-only FP4 de vLLM; el autor probo en una GPU de workstation Blackwell.
- GPU consumer: el tamano de pesos permitiria encajar en GPUs consumer con suficiente VRAM, pero la ruta FP4 requiere soporte de hardware Blackwell; no se confirma compatibilidad con generaciones anteriores.
- Opciones de despliegue: vLLM 0.34.0 es el motor recomendado y probado. La carga directa en Transformers produce salidas incorrectas sin error, segun la model card. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,40x en flujo unico, 2,11x con 8 concurrentes y 2,25x con 32 concurrentes frente a BF16, con generaciones greedy de 256 tokens fijos; los valores variaran en otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (NVFP4A16, solo expertos) | 6.919.161.856 totales, ~1.300 M activos | No disponible | 52,94 | 67,78 offline / 68,23 servido | Apache 2.0 | Hugging Face, safetensors, requiere vLLM |
| OLMoE-1B-7B-0125-Instruct (BF16) | 6.919.161.856 totales, ~1.300 M activos | No disponible | 53,48 | 67,85 offline / 68,39 servido | Apache 2.0 | Hugging Face, safetensors |
| Variante totalmente cuantizada del mismo recipe (no publicada) | 6.919.161.856 totales, ~1.300 M activos | No disponible | 52,78 | 67,63 offline / 67,17 servido | No disponible | No publicada |
| Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly | No disponible | No disponible | No disponible | No disponible | No disponible | Hugging Face, misma receta de cuantizacion |

## Limitaciones y advertencias

- Solo ingles: la model card declara unicamente el idioma `en`, sin soporte multilingue documentado.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni de sesgo; el modelo base es un instructivo de 7.000 millones de parametros con conocimiento limitado.
- Degradacion medible en MMLU: -0,54 puntos con significacion estadistica (p = 0,025), aunque la variacion en GSM8K esta dentro del ruido.
- Carga incorrecta en Transformers: cargar el checkpoint de la forma habitual produce salidas erroneas sin lanzar error; es obligatorio usar vLLM u otro motor compatible con compressed-tensors NVFP4.
- Dependencia de hardware Blackwell: la ruta FP4 de vLLM requiere GPUs con soporte de FP4; no se garantiza funcionamiento en generaciones anteriores.
- Version de prueba: el autor la describe como test release, sin afiliacion ni respaldo de AllenAI, con una unica calibracion y sin semillas repetidas.
- La evaluacion de KL en chat es favorable porque el conjunto de test proviene de la misma familia de datos que parte de la calibracion.
- No se documentan sesgos conocidos, restricciones adicionales de licencia comercial ni limites de contexto en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PureTensorAI/OLMoE-1B-7B-0125-Instruct-NVFP4A16-ExpertsOnly
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Variante comparable en modelo mayor: https://huggingface.co/PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly
- Paper OLMoE (arXiv:2406.08155): https://arxiv.org/abs/2406.08155
- Paper GPTQ (arXiv:2310.16795): https://arxiv.org/abs/2310.16795
- Paper NVFP4 (arXiv:2505.03804): https://arxiv.org/abs/2505.03804
- Dataset de calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluacion de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
