# axteam/Qwen3.6-35B-A3B-AWQ-8bit

## Resumen

Qwen3.6-35B-A3B-AWQ-8bit es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario axteam. No se trata de un modelo entrenado desde cero, sino de una conversión post-entrenamiento (PTQ) mediante AWQ en esquema W8A16, pensada específicamente para servir el modelo con vLLM de forma eficiente en memoria. El modelo base pertenece a la familia Qwen3.5 de Alibaba y combina una arquitectura híbrida de atención lineal y atención completa con un mezclador de expertos (MoE) de 256 expertos más un experto compartido, con aproximadamente 3.000 millones de parámetros activos sobre un total de 35.951.822.704 parámetros.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de ~36.000 millones de parámetros con pesos INT8 (unos 40,4 GB en disco) conservando las activaciones en BF16, lo que reduce los requisitos de VRAM frente al original en BF16 sin sacrificar de forma apreciable la fidelidad: la perplejidad medida sobre el original es de 1,2948 frente a 1,2934 (+0,1%) y la coincidencia top-1 en el siguiente token es del 97,6%. Incluye torre de visión, cabeza de predicción multi-token (MTP) y plantilla de chat idéntica al original.

Una advertencia importante: el repositorio fue reconstruido el 2026-11-01 porque la primera subida dejó sin compensar el router MoE (`mlp.gate`) y la compuerta del experto compartido, lo que desviaba tokens a expertos distintos de los del modelo original. Cualquier descarga anterior a esa fecha debe repetirse. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + atención completa), MoE con 256 expertos + experto compartido, multimodal (visión), cabeza MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (aproximadamente 3.000 millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétricos, group size 32, activaciones BF16); formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que alterna capas de atención lineal con capas de atención completa, e incorpora un MoE de 256 expertos más un experto compartido con unos 3.000 millones de parámetros activos por token. Es multimodal (procesa imagen y texto, pipeline `image-text-to-text`) e incluye una cabeza de predicción multi-token (MTP), habitualmente empleada para decodificación especulativa. La cuantización conserva en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head, el router MoE (`mlp.gate`), la compuerta del experto compartido y las partes no lineales del módulo SSM (`linear_attn.conv1d/A_log/dt_bias`), que en conjunto suponen en torno al 6% de los parámetros.

Esta build es una cuantización post-entrenamiento: no hay reentrenamiento ni ajuste fino. AWQ utiliza un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) y sin gradientes para proteger los canales de pesos más relevantes antes del redondeo. La revisión del 2026-11-01 añadió la compensación del router y de la compuerta del experto compartido durante el suavizado AWQ, verificada capa por capa contra el original (la diferencia mediana por canal queda por debajo del 2%). El tokenizador, la `chat_template` y el `generation_config` son idénticos a los del modelo original; el `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica al modelo base.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con torre de visión conservada en BF16.
- Razonamiento y respuesta a preguntas en formato generativo, incluyendo tareas de conocimiento tipo MMLU y ARC.
- Razonamiento matemático y aritmético de varios pasos (evaluado con GSM8K).
- Capacidades multilingües, con rendimiento medido específicamente en coreano (KMMLU, HAE-RAE) además de inglés.
- Cabeza de predicción multi-token (MTP) presente en el modelo, utilizable para decodificación especulativa en el runtime que la soporte.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el modelo está empaquetado en compressed-tensors `pack-quantized` y probado con vLLM 0.32.0, por lo que puede desplegarse como endpoint compatible con la API de OpenAI para tareas de imagen-texto con un consumo de disco de ~40,4 GB.
- Asistentes conversacionales multi-turno: la plantilla de chat y el tokenizador son idénticos al original, lo que permite reutilizar prompts y flujos existentes sin reajustes, manteniendo la coherencia de formato del modelo base.
- Análisis de documentos con imágenes: al conservar la torre de visión en BF16, es adecuado para extracción de información de capturas, gráficos o formularios combinando entrada visual y texto.
- Evaluación comparativa de cuantizaciones: sirve como referencia de fidelidad (perplejidad +0,1%, top-1 del 97,6%) para decidir entre AWQ-8bit, FP8-dynamic, NVFP4 o AWQ-4bit en un mismo pipeline de lm-evaluation-harness.
- Razonamiento matemático moderado en inglés: con un 94,8% de recuperación en GSM8K frente al BF16, es viable para asistentes de resolución de problemas aritméticos donde se prioriza la fidelidad al original sobre la velocidad.
- Procesamiento de texto en coreano e inglés: los benchmarks KMMLU (100,1% de recuperación) y HAE-RAE (100,2%) indican que la cuantización preserva el rendimiento en coreano, útil para aplicaciones bilingües en esos idiomas.
- Sustitución directa del modelo BF16 en clústeres con VRAM limitada: al reducir el peso en disco a ~40,4 GB manteniendo activaciones BF16, permite servir el modelo donde el original no cabe, sin cambiar el código de integración.

## Benchmarks y rendimiento

Medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con evaluaciones por log-likelihood. Los porcentajes entre paréntesis son la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 64,44 | 67,45 (104,7%) | 64,02 (99,3%) | 69,31 (107,6%) | 68,39 (106,1%) | 74,12 (115,0%) |
| GSM8K (5-shot, estricto) | 30,40 | 21,53 (70,8%) | 28,81 (94,8%) | 24,49 (80,5%) | 46,55 (153,1%) | 71,11 (233,9%) |
| ARC-Challenge (0-shot) | 55,38 | 54,61 (98,6%) | 55,46 (100,2%) | 55,03 (99,4%) | 56,23 (101,5%) | 54,78 (98,9%) |
| Winogrande (5-shot) | 76,32 | 75,37 (98,8%) | 76,24 (99,9%) | 74,43 (97,5%) | 74,27 (97,3%) | 75,85 (99,4%) |
| KMMLU (5-shot, directo) | 65,14 | 64,86 (99,6%) | 65,18 (100,1%) | 64,50 (99,0%) | 64,09 (98,4%) | 64,61 (99,2%) |
| HAE-RAE (0-shot) | 74,89 | 74,89 (100,0%) | 75,07 (100,2%) | 75,34 (100,6%) | 74,06 (98,9%) | 73,69 (98,4%) |
| **Media** | **61,09** | **59,78 (97,9%)** | **60,80 (99,5%)** | **60,52 (99,1%)** | **63,93 (104,6%)** | **69,03 (113,0%)** |
| **Media sin MMLU ni GSM8K** | **67,93** | **67,43 (99,3%)** | **67,99 (100,1%)** | **67,33 (99,1%)** | **67,16 (98,9%)** | **67,23 (99,0%)** |

El propio autor advierte que MMLU y GSM8K oscilan mucho entre builds del mismo modelo (MMLU 64,0–74,1; GSM8K 21,5–71,1) y que dos builds cuantizadas superan al BF16 original, lo que probablemente refleja el formato de respuesta de cada build más que la calidad de la cuantización; no se verificó pregunta a pregunta.

Fidelidad al original BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts, con vLLM 0.32 el 2026-11-01:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,2948 | 1,2934 (+0,1%) |
| Coincidencia top-1 del siguiente token | 97,6% | 98,0% |

## Requisitos de hardware

- Tamaño en disco: ~40,4 GB (el repositorio de Hugging Face ocupa 79,1 GB, presumiblemente por artefactos adicionales o revisiones).
- VRAM estimada para inferencia: no disponible de forma explícita; el peso cuantizado ronda los 40 GB, por lo que se necesita al menos esa cifra más el espacio para activaciones BF16, caché KV y la torre de visión en BF16.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del peso, un solo acelerador de 48 GB o 80 GB (A100 80 GB, H100) es el escenario natural, aunque no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No disponible. Con ~40 GB de pesos, no encaja en GPUs de 24 GB (RTX 4090) ni de 32 GB sin offloading.
- Runtime: vLLM, con la arquitectura incluida a partir de vLLM ≥ 0.17.0 y probada con vLLM 0.32.0.
- Dependencias del runtime: vLLM 0.32 requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible con CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijados por vLLM).
- Otras opciones de despliegue (llama.cpp, Ollama, TGI): no disponible en la información proporcionada; el formato compressed-tensors apunta a vLLM como vía soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con otras builds de cuantización del mismo modelo base, según los datos medidos por el autor:

| Build | Esquema | Media (6 benchmarks) | Media sin MMLU/GSM8K | Fidelidad | Licencia |
|---|---|---|---|---|---|
| AWQ-8bit (este repo) | W8A16, INT8, group 32 | 60,80 (99,5%) | 67,99 (100,1%) | Perplejidad +0,1%, top-1 97,6% | Apache-2.0 |
| FP8-dynamic | FP8 dinámico | 59,78 (97,9%) | 67,43 (99,3%) | no disponible | Apache-2.0 |
| NVFP4A16 | FP4 con activaciones de 16 bits | 60,52 (99,1%) | 67,33 (99,1%) | no disponible | Apache-2.0 |
| NVFP4 | FP4 | 63,93 (104,6%) | 67,16 (98,9%) | no disponible | Apache-2.0 |
| AWQ-4bit | W4 | 69,03 (113,0%) | 67,23 (99,0%) | no disponible | Apache-2.0 |

Comparación con modelos de otros autores de tamaño o tarea similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Reconstrucción obligatoria: si se descargó el repositorio antes del 2026-11-01 06:13:53 UTC (revisión `05a077a`), hay que volver a descargarlo; esa versión dejaba el router MoE y la compuerta del experto compartido sin compensar y enrutaba tokens a expertos distintos de los del original.
- Es una cuantización PTQ: no hay reentrenamiento, por lo que hereda los sesgos y el conocimiento del modelo base Qwen3.6-35B-A3B, no evaluados en esta ficha.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el comportamiento del modelo base.
- Longitud de contexto: no disponible; no debe asumirse ninguna cifra sin consultar la model card del modelo original.
- Idiomas: la lista oficial no está disponible; los benchmarks solo cubren inglés y coreano, y la calibración AWQ usó un corpus con predominio de coreano, lo que puede introducir un sesgo de calibración hacia ese idioma.
- MMLU y GSM8K son métricas sensibles al formato de respuesta en esta evaluación (variantes generativa y estricta), con oscilaciones de hasta 10 puntos entre builds; no deben compararse con puntuaciones obtenidas por log-likelihood ni usarse aisladamente para elegir cuantización.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base enlazada en la model card.
- Dependencias estrictas de runtime: requiere vLLM ≥ 0.17.0 (probado con 0.32.0), torch 2.13 con CUDA 13 y versiones fijadas de transformers y compressed-tensors; un entorno con versiones distintas puede no cargar los pesos `pack-quantized`.
- No hay datos publicados de latencia, throughput ni VRAM mínima verificada, lo que dificulta el dimensionamiento previo del despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.6-35B-A3B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
