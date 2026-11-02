# axteam/gemma-4-26B-A4B-it-AWQ-4bit

## Resumen

`axteam/gemma-4-26B-A4B-it-AWQ-4bit` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-26B-A4B-it`, publicada por el equipo axteam. El modelo base es un transformer de arquitectura Mixture-of-Experts (MoE) con 25.805.936.206 parámetros totales y 8 expertos activos de 128 totales más uno compartido, capaz de procesar entradas de imagen y texto (pipeline `image-text-to-text`). Esta versión emplea cuantización AWQ INT4 con esquema W4A16 (pesos INT4 asimétricos, activaciones en BF16) y formato `compressed-tensors` `pack-quantized`, orientada específicamente al servicio eficiente con vLLM.

El problema que resuelve es el coste de despliegue del modelo original en BF16: la versión cuantizada ocupa aproximadamente 17,6 GB en disco, lo que permite servir un modelo de 26B parámetros en hardware más modesto manteniendo una fidelidad razonable respecto al original. La cuantización es PTQ (post-training quantization) mediante AWQ con un conjunto de calibración de 256 muestras, sin reentrenamiento.

Es relevante ahora porque el ecosistema de serving con vLLM ya soporta la arquitectura Gemma 4 (a partir de vLLM ≥ 0.19.0) y porque existen pocas alternativas públicas en formato AWQ 4 bits para este modelo. No obstante, la propia model card advierte de una degradación media del 8,3% en benchmarks respecto a BF16, por lo que la elección entre esta build y una de 8 bits depende del equilibrio calidad/coste que exija el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (8 activos / 128 totales + 1 compartido) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 8 expertos de 128 totales más 1 compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 (W4A16): pesos INT4 asimétricos, group size 32 (escala BF16 + zero-point INT4), activaciones BF16; formato `compressed-tensors` `pack-quantized` |
| Idiomas soportados | no disponible (el conjunto de calibración es mayoritariamente coreano, pero la model card no declara idiomas oficiales) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con `compressed-tensors` (`pack-quantized`); repo de ~17,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de la familia Gemma 4, con 128 expertos totales de los que 8 se activan por token, más un experto compartido. Incluye una torre de visión y una proyección multimodal que permiten el procesamiento de entradas imagen-texto. Esta build concreta no entrena el modelo: aplica cuantización AWQ sobre los pesos BF16 publicados por Google (commit `4d7ae49`), sin gradientes ni reentrenamiento, usando 256 muestras de calibración (mayoritariamente coreanas, con 32 respuestas de modo thinking autogeneradas).

La innovación técnica de esta publicación es la estrategia de cuantización selectiva: se mantienen en BF16 la torre de visión, la proyección de visión, los embeddings de tokens (atados con `lm_head`), el router MoE, todas las normalizaciones y el MLP compartido, lo que representa aproximadamente el 7% de los parámetros. Solo se cuantizan las capas de atención y los expertos. El tokenizador, el `chat_template` (incluida la corrección de Google de julio de 2026), el `processor_config` y el `generation_config` son idénticos byte a byte al original; el `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional (modelo `-it`, ajustado para instrucciones).
- Procesamiento de imagen y texto combinados (`image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y razonamiento multimodal.
- Razonamiento multi-paso y modo thinking (la calibración incluye respuestas de modo thinking autogeneradas).
- Capacidades de matemáticas y razonamiento lógico (evaluadas en GSM8K y ARC-Challenge).
- Conocimiento multilingüe, con evaluación específica en coreano (KMMLU, HAE-RAE) además de inglés.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes: no confirmado en la información disponible.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno que incluyan capturas de pantalla o fotos de producto, combinando comprensión visual y generación de texto en un solo paso, con el coste reducido de la cuantización 4 bits.
- **Servicio de inferencia con vLLM en producción**: al estar empaquetado en `compressed-tensors` y validado con vLLM ≥ 0.19.0, se integra directamente en un servidor vLLM para servir peticiones concurrentes con menor huella de memoria que la versión BF16.
- **Asistente de documentación técnica con imágenes**: transcripción y explicación de diagramas, esquemas y capturas en manuales, aprovechando la torre de visión mantenida en BF16 para preservar calidad visual.
- **Análisis de documentos escaneados**: extracción de información de facturas, formularios o tickets mediante entrada imagen-texto, con salida estructurada en texto.
- **Evaluación de calidad de cuantizaciones**: este repositorio sirve como referencia práctica de cómo medir la degradación de una build AWQ frente a BF16 (perplejidad, acuerdo top-1, benchmarks), útil para equipos que comparan estrategias de despliegue.
- **Prototipado en hardware limitado**: con ~17,6 GB en disco, permite experimentar con un MoE de 26B parámetros en GPUs de 24 GB (con margen ajustado) o en configuraciones multi-GPU más pequeñas que las requeridas por BF16.
- **Despliegue en regiones con restricciones de coste**: la reducción de memoria frente a BF16 permite servir el modelo en instancias cloud de gama media, a cambio de asumir la degradación documentada del 8,3% medio en benchmarks.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, few-shot completion (sin chat template). Los porcentajes entre paréntesis indican la recuperación respecto a BF16.

| Benchmark | BF16 (original) | AWQ-8bit | AWQ-4bit (este repo) |
|---|---|---|---|
| MMLU (5-shot) | 40,23 | 38,72 (96,2%) | 33,21 (82,5%) |
| GSM8K (5-shot, strict) | 66,19 | 67,10 (101,4%) | 55,12 (83,3%) |
| ARC-Challenge (0-shot) | 45,39 | 44,88 (98,9%) | 44,62 (98,3%) |
| Winogrande (5-shot) | 58,48 | 59,91 (102,4%) | 58,48 (100,0%) |
| KMMLU (5-shot, direct) | 36,52 | 35,84 (98,1%) | 33,91 (92,9%) |
| HAE-RAE (0-shot) | 76,17 | 75,99 (99,8%) | 70,76 (92,9%) |
| **Media** | **53,83** | **53,74 (99,8%)** | **49,35 (91,7%)** |

Evaluación de fidelidad frente al BF16 original en un conjunto mixto inglés/coreano:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2161 | 1,1284 (+7,8%) |
| Acuerdo top-1 siguiente token | 93,0% | 98,7% |

Comparación con otra cuantización pública del mismo formato:

| Modelo | Perplejidad | Top-1 |
|---|---|---|
| BF16 original (cota superior) | 1,1284 | 98,7% |
| **Este modelo (axteam)** | **1,2161** | **93,0%** |
| cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit | 1,2308 | 92,5% |

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 17,6 GB de pesos en disco; en VRAM se requiere espacio adicional para el KV cache y las activaciones BF16, por lo que un despliegue realista necesita del orden de 20-24 GB o más según longitud de contexto y concurrencia (cifra exacta no disponible).
- **GPU recomendadas**: A100 (40/80 GB), H100, L40S; en consumer, RTX 4090 (24 GB) puede ser suficiente para contextos cortos y baja concurrencia.
- **¿Cabe en consumer GPU?**: sí, en GPUs de 24 GB como la RTX 4090, con margen limitado; en GPUs de 16 GB no cabe sin offloading.
- **Opciones de despliegue**: vLLM (requiere vLLM ≥ 0.19.0 para la arquitectura Gemma 4; la model card indica que esta build se evaluó con esa versión y no con vLLM 0.32.0). Otros runtimes (llama.cpp, Ollama, TGI) no están confirmados en la información disponible.
- **Requisitos de entorno**: vLLM 0.32 requiere Python 3.11-3.14 y torch 2.13 (build CUDA 13.0); la model card se interrumpe en este punto, por lo que el detalle completo de drivers no está disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (media benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **axteam/gemma-4-26B-A4B-it-AWQ-4bit** | 25,8B totales (MoE) | no disponible | 49,35 (91,7% de BF16) | Apache-2.0 | HuggingFace, formato compressed-tensors, vLLM ≥ 0.19.0 |
| google/gemma-4-26B-A4B-it (BF16) | 25,8B totales (MoE) | no disponible | 53,83 (referencia) | Apache-2.0 | HuggingFace, safetensors BF16 |
| cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit | 25,8B totales (MoE) | no disponible | Perplejidad 1,2308; top-1 92,5% | no disponible | HuggingFace, AWQ 4 bits |
| Build AWQ-8bit del mismo modelo base | 25,8B totales (MoE) | no disponible | 53,74 (99,8% de BF16) | Apache-2.0 | HuggingFace |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks de modelos alternativos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- **Degradación de calidad medible**: la recuperación media es del 91,7% respecto a BF16, con caídas notables en MMLU (82,5%) y GSM8K (83,3%). La propia model card recomienda una build de 8 bits si la calidad es prioritaria.
- **Perplejidad superior**: +7,8% frente al BF16 original (1,2161 frente a 1,1284) y acuerdo top-1 del 93,0% frente al 98,7%.
- **Calibración sesgada al coreano**: el conjunto de calibración de 256 muestras es mayoritariamente coreano, lo que puede afectar la fidelidad en otros idiomas no representados.
- **Sesgos del modelo base**: no documentados en la información disponible; se heredan los del modelo original de Google.
- **Riesgo de alucinación**: no cuantificado en la información disponible; es un modelo de lenguaje generativo y mantiene el riesgo inherente.
- **Idiomas soportados**: no declarados oficialmente; la evaluación cubre inglés y coreano.
- **Longitud de contexto**: no disponible en la información proporcionada, lo que impide planificar despliegues con contextos largos.
- **Restricciones de licencia**: Apache-2.0 con enlace a la licencia Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma 4 antes de producción.
- **Compatibilidad de runtime limitada**: validado con vLLM ≥ 0.19.0 y no probado con vLLM 0.32.0 en esta build; el soporte en llama.cpp, Ollama o TGI no está confirmado.
- **Tool calling y agentes**: no confirmados; no asumir su disponibilidad sin verificación empírica.
- **Formato propietario de cuantización**: `compressed-tensors` `pack-quantized` requiere runtimes compatibles; no es un GGUF portable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-26B-A4B-it-AWQ-4bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Cuantización alternativa AWQ 4 bits: https://huggingface.co/cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
