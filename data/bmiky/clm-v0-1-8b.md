# Bmiky/CLM-v0.1-8B

## Resumen

CLM-v0.1-8B (Contrastive Language Model) es un modelo de la clase denominada «System One» desarrollado por Bmiky dentro del proyecto Contrastive Language Model (CLM). Se trata de un modelo entrenado con un objetivo de aprendizaje contrastivo (bidirectional InfoNCE) que conecta estados con acciones, construido sobre el encoder Qwen3-8B congelado, al que se añaden dos cabezas de proyección pequeñas: una state head y una action head.

El modelo no es generativo: su función es puntuar y ordenar candidatos (verificador y reranker) a partir de un estado dado, devolviendo distribuciones de probabilidad relativas al conjunto de candidatos evaluado. Está pensado para tareas de agentes, computer-use, gaming y tool calling, y destaca por su latencia reducida frente a alternativas como Jev (hasta 9× menor en zero-shot) y por el uso de caching de estados y acciones, que permite reutilizar embeddings de acciones (con ~1k candidatos, hasta 13× más rápido que Jev).

Su relevancia actual radica en que ofrece un enfoque alternativo a los modelos generativos para la verificación y el ranking en pipelines agénticos, con entrenamiento barato (solo se entrenan las cabezas sobre un encoder congelado) y licencia Apache 2.0. El checkpoint se presenta como base para fine-tuning específico por tarea; los resultados SOTA en benchmarks agénticos corresponden a cabezas ya ajustadas, no a este checkpoint en zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder Qwen3-8B congelado) con dos cabezas de proyección (state head y action head); aprendizaje contrastivo con pérdida InfoNCE bidireccional |
| Parametros totales | ~8B (encoder Qwen3-8B) más cabezas de proyección (tamaño no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (según el comando de ejemplo de vLLM: `--max-model-len 2048`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, fichero `CLM_v0.1-8B.pt`); el encoder base Qwen3-8B se sirve con vLLM en modo pooling |

## Arquitectura y entrenamiento

CLM-v0.1-8B combina un encoder transformer congelado (Qwen3-8B, en modo last-token-pooled) con dos cabezas de proyección de pequeño tamaño: una state head y una action head. El modelo se entrena con una pérdida contrastiva InfoNCE bidireccional que alinea estados y acciones, de modo que la representación resultante permiten puntuar la compatibilidad entre un estado y una serie de candidatos. Al estar el encoder congelado, el entrenamiento y el fine-tuning afectan únicamente a las cabezas, lo que reduce drásticamente el coste computacional.

El proceso de entrenamiento se describe en tres fases: pre-entrenamiento sobre aproximadamente 60M pares de preguntas y respuestas de Nemotron, mid-training sobre aproximadamente 30M negativos duros sintéticos y post-training sobre aproximadamente 1M trayectorias agénticas. La model card no detalla si se emplearon técnicas de RLHF o DPO, ni la composición exacta del dataset más allá de las cifras indicadas. Como innovaciones destacables, el modelo separa la codificación de estados y acciones (state & action caching), lo que permite reutilizar los embeddings de acciones y acelerar el ranking de grandes conjuntos de candidatos.

## Capacidades

- Puntuación y ranking de candidatos: dado un estado, clasifica y ordena respuestas libres, soluciones best-of-N, nombres de herramientas o movimientos siguientes.
- Verificación: actúa como verificador de soluciones y trayectorias, con resultados SOTA reportados al fine-tunear las cabezas (DeepSWE 81,6% y Terminal-Bench 2.1 87,6%).
- Preguntas tipadas sobre un estado: soporta tipos como `Noul` (sí/no), `Choice` (elección entre categorías con criterios) y `Score` (puntuación ordinal), devolviendo distribuciones de probabilidad.
- Soporte para agentes: orientado a tareas de computer-use, gaming y tool calling.
- Caching de estados y acciones: permite reutilizar embeddings de acciones para acelerar el ranking de muchos candidatos.
- Multilingüe: no disponible; el modelo declara únicamente inglés (`en`).
- Generación de texto: no soportada; CLM solo puntúa los candidatos que se le proporcionan.
- Capacidades especiales: no se reportan visión, audio ni modo de razonamiento explícito en este checkpoint.

## Casos de uso

- Verificación de soluciones en pipelines agénticos: dado un estado y varias soluciones candidatas (best-of-N), CLM ordena cuál es la más adecuada, lo que permite seleccionar la mejor salida sin necesidad de un modelo generativo adicional.
- Selección de herramientas en agentes: ante un estado de conversación, el modelo puntúa y elige el nombre de la herramienta o la acción siguiente más probable, integrándose en el bucle de decisión de un agente.
- Clasificación de tickets de soporte: usando preguntas tipadas (`Choice`), se puede asignar un ticket al departamento correspondiente y obtener la distribución de probabilidad asociada (por ejemplo, `billing` con 0,94 de confianza).
- Detección de urgencia y frustración en atención al cliente: con preguntas de tipo `Score` y `Noul` se puede estimar el nivel de urgencia y el grado de frustración del cliente para priorizar la cola de atención.
- Ranking de respuestas en sistemas de QA: dadas varias respuestas generadas por otro modelo, CLM las ordena por relevancia respecto a la pregunta (por ejemplo, identificar la explicación correcta de un fenómeno físico).
- Evaluación automática de trayectorias de agentes: en fases de validación, sirve como verificador para medir si una trayectoria agéntica cumple el objetivo, con la ventaja de ser más rápido que alternativas como Jev.
- Reranking en recuperación de información: puede emplearse como reranker semántico de documentos o pasajes recuperados por un buscador, reutilizando embeddings de acciones para acelerar el proceso.
- Filtrado previo en pipelines de RL o generación: al puntuar candidatos de forma barata, permite descartar opciones antes de invocar un modelo mayor, reduciendo coste y latencia.

## Benchmarks y rendimiento

Los únicos resultados numéricos publicados corresponden a las cabezas fine-tuned (no a este checkpoint en zero-shot):

| Benchmark | Resultado | Nota |
|---|---|---|
| DeepSWE | 81,6% | SOTA con cabezas fine-tuned |
| Terminal-Bench 2.1 | 87,6% | SOTA; 4–6× más rápido que Jev |

Además, la model card indica que en zero-shot el modelo está a la par de Jev en computer-use, gaming y tool calling, con hasta 9× menos latencia, y que con ~1k candidatos es 13× más rápido que Jev gracias al caching. No se proporcionan resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder Qwen3-8B en FP16 requiere aproximadamente 16 GB de VRAM; en cuantización INT8, en torno a 8 GB, y en INT4, en torno a 4–5 GB. Las cabezas de proyección ocupan un espacio reducido (el repositorio completo es de 0,1 GB).
- GPU recomendadas: no se especifican en la información disponible. Por tamaño del encoder, son adecuadas GPU de datacenter como A100, H100 o L40S, así como GPUs de consumo con suficiente VRAM (RTX 4090 de 24 GB, RTX 3090 de 24 GB) para FP16.
- Cabe en GPU de consumo: sí, en GPUs con 16–24 GB de VRAM en FP16 (por ejemplo, RTX 4090 o RTX 3090); con cuantización podría caber en GPUs de 8–12 GB, aunque no se confirman cuantizaciones soportadas.
- Opciones de despliegue: el encoder se sirve con vLLM usando el runner de pooling (`vllm serve Qwen/Qwen3-8B --runner pooling`). El paquete `contrastive-lm` levanta una API y un playground con `clm-serve` (http://localhost:8700/). No se mencionan opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican cifras absolutas; las comparativas indican hasta 9× menos latencia que Jev en zero-shot, 4–6× más rápido como verificador fine-tuned y 13× más rápido con ~1k candidatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLM-v0.1-8B | ~8B (encoder Qwen3-8B) + cabezas | 2048 tokens | Zero-shot a la par de Jev; SOTA en DeepSWE (81,6%) y Terminal-Bench 2.1 (87,6%) con cabezas fine-tuned | Apache 2.0 | HuggingFace (repositorio) |
| Jev | no disponible | no disponible | Referencia de comparación; CLM reporta hasta 9× menos latencia en zero-shot y 4–6× más rápido como verificador fine-tuned | no disponible | no disponible |
| Qwen3-8B (modelo base) | 8B | no disponible en esta ficha | Modelo generativo de propósito general; CLM lo usa como encoder congelado | Apache 2.0 | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (verificadores contrastivos) en la información proporcionada.

## Limitaciones y advertencias

- Encoder-locked: las cabezas requieren obligatoriamente los embeddings last-token-pooled de Qwen3-8B; no funcionan con otro encoder.
- No generativo: CLM únicamente puntúa los candidatos que se le proporcionan; no genera texto. Las probabilidades que devuelve son relativas al conjunto de candidatos evaluado, no probabilidades absolutas.
- Los resultados SOTA en benchmarks agénticos provienen de cabezas fine-tuned, no de este checkpoint en zero-shot.
- Generalización limitada: la model card indica que CLM-8B es un escalón de una «escalera de escalado»; se anuncia un CLM-35B multimodal con más datos y cómputo para mejorar la generalización.
- Idioma: soporte declarado únicamente para inglés (`en`); no se especifican capacidades multilingües.
- Contexto reducido: la configuración de ejemplo limita la longitud a 2048 tokens, lo que restringe estados o candidatos muy largos.
- Licencia: Apache 2.0, que permite uso comercial; el encoder base Qwen3-8B también es Apache 2.0. No obstante, conviene revisar los términos de los datos de entrenamiento (Nemotron y datos sintéticos) si se requiere uso comercial en producción.
- Sesgos y alucinación: no se documentan sesgos específicos; al no ser generativo, el riesgo de alucinación se limita a puntuaciones erróneas sobre candidatos fuera de distribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bmiky/CLM-v0.1-8B
- Repositorio de código: https://github.com/Contrastive-LM/CLM
- Blog: https://contrastive-lm.notion.site
- Discord: https://discord.gg/5dAQEDJBs
- Guía de fine-tuning: https://github.com/Contrastive-LM/CLM/blob/main/docs/FINETUNING.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Cabezas DeepSWE (referenciadas): https://huggingface.co/Contrastive-LM/deepswe-clm-heads-8k
- Cita: Kwok, Kang, Suresh, Saad-Falcon, Pavone, Ré y Mirhoseini (2026), «Contrastive Language Models: A System One Model for Fast and Generalizable Decision-Making».
