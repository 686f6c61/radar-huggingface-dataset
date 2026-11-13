# 96kevinli29/Qwen3-4B-SFT-Math-en-10k

## Resumen

Qwen3-4B-SFT-Math-en-10k es un ajuste fino supervisado (SFT) de Qwen3-4B, desarrollado por Hongyang Li y colaboradores junto con la comunidad Sea-Fill. No es un modelo pensado para producción, sino un *checkpoint de control* para el artículo "What Does Post-Training Change in Multilingual Reasoning?" (arXiv:2609.37104). El objetivo es aislar el efecto del idioma de los datos de entrenamiento: se aplica el mismo procedimiento de SFT que en el modelo multilingüe, pero usando únicamente 9.800 trazas de razonamiento matemático en inglés extraídas de OpenR1-Math-220k.

El modelo parte de la arquitectura Qwen3-4B (transformer causal, 4.411.424.256 parámetros reales según los pesos safetensors, ventana de contexto de 32.768 tokens durante el entrenamiento) y se entrena con pérdida de entropía cruzada a nivel de token sobre la respuesta completa, incluyendo el razonamiento dentro de `<think>…</think>`. El resultado es un modelo que razona en inglés incluso ante problemas planteados en español, francés o árabe, lo que lo convierte en una referencia útil para estudiar transferencia lingüística en razonamiento matemático, no para desplegar como asistente multilingüe.

Su relevancia es metodológica: permite comparar directamente el efecto de mezclar idiomas en el SFT (modelo multilingüe: 71,7% en inglés) frente a entrenar solo en inglés (71,3%) y frente al Qwen3-4B original (80,4%). La caída de rendimiento respecto al modelo base es el hallazgo central que el checkpoint ayuda a documentar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), base Qwen3-4B |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (presupuesto de entrenamiento); ventana nativa de Qwen3-4B no especificada en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (entrenado y evaluado en ingles; razona en ingles ante problemas en otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only heredado de Qwen3-4B, sin modificaciones estructurales. El ajuste es de parámetros completos (full-parameter), no LoRA ni adaptadores, realizado con el entrenador SFT de verl sobre FSDP. La función objetivo es entropía cruzada a nivel de token sobre toda la respuesta, incluyendo la cadena de razonamiento, con AdamW (lr 2e-5 con decaimiento coseno hasta 0,1×, warmup ratio 0,01, weight decay 0,1), batch de 4 trazas, contexto de hasta 32.768 tokens, precisión bfloat16 y gradient clipping de 1,0. Se configuraron 3 épocas y se publica la época 1. El entrenamiento se ejecutó en 4 × A100-40GB en un nodo de MeluXina (LuxProvide).

Los datos son 9.800 soluciones de matemáticas con cadena de pensamiento larga en inglés, procedentes de OpenR1-Math-220k. No se documenta RLHF, DPO ni preferencias humanas; es SFT puro sobre trazas de razonamiento. La innovación relevante no es arquitectónica sino experimental: el checkpoint forma parte de un conjunto de controles (inglés a 43K, y modelos por idioma en chino, español, francés, árabe y ruso) que permiten atribuir los cambios de accuracy al idioma de los datos de SFT. La evaluación usa 16 muestras por problema a temperatura 0,7 y un presupuesto de 24.576 tokens, con una métrica compuesta J = C ∧ L ∧ T (correcto, en el idioma solicitado y terminado).

## Capacidades

- Generación de texto y razonamiento matemático con cadena de pensamiento larga dentro de `<think>…</think>`.
- Resolución de problemas de competición (AIME-2026, AMC-2023) con muestreo múltiple y selección por mayoría.
- Razonamiento en inglés de forma consistente, incluso cuando el enunciado está en español, francés o árabe.
- Conversación multi-turno mediante la plantilla de chat de Qwen3 con *thinking mode* activado.
- Compatibilidad con `text-generation-inference` y endpoints compatibles (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre transferencia lingüística en razonamiento: usar el checkpoint como brazo de control inglés frente al modelo multilingüe y al Qwen3-4B original para medir cuánto del cambio de accuracy se debe al idioma de los datos de SFT.
- Reproducción de experimentos de SFT matemático: el repositorio documenta hiperparámetros, framework (verl + FSDP) y hardware, lo que permite replicar el entrenamiento con 4 × A100-40GB y comparar curvas.
- Evaluación de métricas compuestas de razonamiento: sirve para validar pipelines que puntúan simultáneamente corrección, idioma de la respuesta y terminación (J@1, J@16), usando el dataset Multilingual-Math-Reasoning-Eval.
- Estudio de *budget* de generación: con presupuesto de 24.576 tokens y temperatura 0,7, permite analizar la tasa de respuestas que no terminan (4,2% en inglés, 23,3% en ruso) y su relación con la longitud del razonamiento.
- Generación de soluciones matemáticas en inglés para curación de datasets: producir trazas largas verificables que luego se filtran por corrección antes de incorporarlas a un corpus de entrenamiento.
- Análisis de degradación por SFT: comparar sus resultados con el Qwen3-4B base para cuantificar la pérdida de accuracy (80,4% → 71,3% en J@1 en inglés) y estudiar causas como sobreajuste a un único estilo de traza.

## Benchmarks y rendimiento

Evaluación sobre 70 problemas de competición (30 AIME-2026 + 40 AMC-2023) por idioma, 16 muestras por problema, temperatura 0,7, presupuesto de 24.576 tokens. J@1 y J@16 son la métrica compuesta (correcto, en el idioma solicitado y terminado).

| Idioma | Correcto | En idioma | Sin terminar | J@1 | J@16 | J@1 Qwen3-4B original | J@1 SFT multilingüe |
|---|---|---|---|---|---|---|---|
| Inglés | 71,3% | 100,0% | 4,2% | 71,3% | 90,0% | 80,4% | 71,7% |
| Chino | 61,0% | 99,9% | 11,6% | 60,7% | 84,3% | 73,8% | 57,3% |
| Español | 66,7% | 0,0% | 3,5% | 0,0% | 0,0% | 0,1% | 64,6% |
| Francés | 67,8% | 0,0% | 2,8% | 0,0% | 0,0% | 0,0% | 64,6% |
| Árabe | 67,4% | 0,0% | 2,1% | 0,0% | 0,0% | 0,0% | 53,6% |
| Ruso | 55,2% | 99,3% | 23,3% | 54,0% | 78,6% | 69,1% | 61,2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 9 GB solo para pesos (4,41B parámetros × 2 bytes), más overhead de activaciones y caché KV; con contexto de 24.576 tokens el consumo crece de forma significativa.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100-40GB u H100 para contexto largo sin cuantizar; el entrenamiento se realizó con 4 × A100-40GB.
- GPU de consumo: probable en RTX 4090 (24 GB) en bfloat16 con contexto moderado; en RTX 3090/4080 (16-24 GB) requiere cuantización o reducción de contexto.
- Despliegue: transformers 4.x y 5.x (documentado), `text-generation-inference` (tag del repo); vLLM, llama.cpp u Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles. El presupuesto de 24.576 tokens por respuesta implica generaciones largas y coste elevado por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | J@1 inglés | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-en-10k | 4,41B | 32.768 (entrenamiento) | 71,3% | Apache 2.0 | Hugging Face |
| Qwen3-4B-SFT-Math-Multilingual | 4,41B (base) | 32.768 (entrenamiento) | 71,7% | Apache 2.0 | Hugging Face |
| Qwen3-4B (original) | 4,41B | no disponible en la información | 80,4% | Apache 2.0 | Hugging Face |
| Qwen3-4B-SFT-Math-en-43k | 4,41B (base) | 32.768 (entrenamiento) | no disponible | Apache 2.0 | Hugging Face |

La comparación relevante es interna al conjunto de controles del paper: el modelo multilingüe rinde en español, francés y árabe (64,6%, 64,6% y 53,6% en J@1) mientras este control cae a 0,0% en esos idiomas por no responder en la lengua solicitada.

## Limitaciones y advertencias

- Checkpoint de control experimental: una sola semilla, datos solo en inglés y solo matemáticas; no es un modelo generalista.
- No corrige el idioma del razonamiento: ante problemas en español, francés o árabe responde en inglés y la métrica J@1 cae a 0,0% por el criterio de idioma.
- Degradación frente al modelo base: 71,3% frente a 80,4% en J@1 en inglés, atribuible al SFT sobre un único estilo de traza.
- Tasa de no terminación elevada en algunos idiomas (23,3% en ruso, 11,6% en chino), lo que afecta al coste y a la fiabilidad en producción.
- Riesgo de alucinación en pasos intermedios de la cadena de pensamiento; la verificación de la respuesta final no garantiza la corrección del razonamiento.
- Idiomas: solo inglés declarado; no hay evaluación de otras lenguas más allá de las seis del paper.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y su rendimiento es inferior al del base en la tarea principal.
- Creado y actualizado el 13 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-10k
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo multilingüe recomendado por el autor: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Control inglés a 43K: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-43k
- Controles por idioma: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-zh-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-es-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-fr-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ar-10k, https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ru-10k
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de evaluación: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Paper: https://arxiv.org/abs/2609.37104
- Framework de entrenamiento: https://github.com/volcengine/verl
- Comunidad: https://huggingface.co/SeaFill2025
