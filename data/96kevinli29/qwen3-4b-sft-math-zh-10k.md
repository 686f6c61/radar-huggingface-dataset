# 96kevinli29/Qwen3-4B-SFT-Math-zh-10k

## Resumen

Qwen3-4B-SFT-Math-zh-10k es un ajuste fino supervisado (SFT) de Qwen3-4B desarrollado por Hongyang Li, Xiao Li, Caesar Wu, Grégoire Danoy y Pascal Bouvry, y mantenido por la Sea-Fill Community. El modelo parte de los pesos de Qwen3-4B y se entrena con ajuste completo de parámetros sobre 9.334 trazas largas de razonamiento matemático (chain-of-thought) escritas en chino, traducidas del conjunto de datos OpenR1-Math-220k. No es un modelo de propósito general: es un checkpoint de control experimental.

Su función concreta es servir de referencia en el artículo «What Does Post-Training Change in Multilingual Reasoning?» (arXiv:2609.37104), que investiga si entrenar en seis idiomas simultáneamente degrada el rendimiento frente a entrenar en uno solo. Este checkpoint monolingüe (chino) se compara con el modelo multilingüe del mismo estudio sobre los mismos problemas de competición.

El modelo conserva la arquitectura original de Qwen3-4B (transformer causal de aproximadamente 4.400 millones de parámetros) y se distribuye bajo licencia Apache 2.0. Su relevancia es metodológica: permite aislar el efecto del idioma en el entrenamiento de razonamiento, aunque su utilidad práctica en producción es limitada por su naturaleza de control y su dominio restringido a matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3) con modo de razonamiento largo |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento); 24.576 tokens de presupuesto de generación en evaluación |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | chino (entrenamiento y evaluación); evaluado también en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos de Qwen3-4B, un transformer causal con modo de pensamiento explícito (el razonamiento se emite dentro de las etiquetas `<think> ... </think>`). El entrenamiento utiliza pérdida de entropía cruzada a nivel de token sobre la respuesta completa, incluyendo las trazas de razonamiento. Se emplea el entrenador SFT de verl con FSDP, optimizador AdamW con tasa de aprendizaje 2e-5 y decaimiento coseno hasta 0,1×, warmup del 1 %, weight decay 0,1 y recorte de gradiente de 1,0. El lote es de 4 trazas con contexto de hasta 32.768 tokens, en precisión bfloat16.

El conjunto de datos son 9.334 soluciones de matemáticas de cadena de pensamiento larga en chino, traducidas automáticamente desde las trazas en inglés de OpenR1-Math-220k. Se configuraron 3 épocas, pero solo se publica el checkpoint de la época 1. El entrenamiento se ejecutó en 4 GPU A100 de 40 GB en un nodo del clúster MeluXina (LuxProvide). El modelo se entrenó exclusivamente en chino, lo que lo convierte en el control monolingüe del estudio.

## Capacidades

- Generación de texto y razonamiento matemático de cadena de pensamiento larga en chino, con trazas explícitas dentro de `<think>`.
- Resolución de problemas de competición (AIME, AMC) con presupuesto de generación de hasta 24.576 tokens.
- Razonamiento multi-paso con terminación controlada (el modelo puede no terminar en problemas largos).
- Conversación mediante la plantilla de chat de Qwen3 con el modo de pensamiento activado.
- Evaluado en chino e inglés; no se documentan capacidades de tool calling, agentes, visión ni audio.
- Sin soporte declarado de function calling ni de otras capacidades especiales más allá del modo de razonamiento.

## Casos de uso

- Investigación sobre multilingüismo en razonamiento: sirve como control monolingüe para comparar el efecto de entrenar en un solo idioma frente a seis, en el marco del artículo arXiv:2609.37104.
- Reproducción de experimentos de SFT matemático: permite replicar el pipeline de entrenamiento (verl + FSDP, 4×A100-40GB) y validar resultados con el conjunto Multilingual-Math-Reasoning-Eval.
- Evaluación de degradación idiomática: al medir la tasa de respuestas «entregadas» (correctas, en el idioma solicitado y terminadas), se puede cuantificar la pérdida de calidad al cambiar de idioma.
- Estudio de bucles de repetición: el modelo presenta fallos de terminación en problemas largos, lo que lo hace útil para analizar y mitigar este comportamiento en modelos de razonamiento.
- Generación de soluciones matemáticas en chino para conjuntos de datos de entrenamiento o destilación, siempre que se acepte la limitación de dominio y el riesgo de repetición.
- Benchmarking de infraestructura de inferencia: con 4.411 millones de parámetros y contexto de 32.768 tokens, sirve para medir latencia y throughput en despliegues con vLLM, TGI o transformers.

## Benchmarks y rendimiento

Los resultados provienen de 70 problemas de competición (30 de AIME-2026 y 40 de AMC-2023) por idioma, con 16 muestras a temperatura 0,7 y presupuesto de 24.576 tokens. Una respuesta se considera «entregada» (J) cuando es correcta (C), está en el idioma solicitado (L) y termina (T).

| Idioma | Correctas | En idioma | Sin terminar | J@1 | J@16 | J@1 Qwen3-4B publicado | J@1 SFT multilingüe |
|---|---|---|---|---|---|---|---|
| Inglés | 66,5 % | 99,8 % | 12,1 % | 66,2 % | 88,6 % | 80,4 % | 71,7 % |
| Chino | 60,4 % | 99,9 % | 17,5 % | 60,2 % | 84,3 % | 73,8 % | 57,3 % |

El modelo solo se evaluó en chino e inglés.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,8 GB de pesos más memoria para caché KV; con contexto de 32.768 tokens la demanda crece de forma significativa.
- GPU recomendadas: A100-40GB u H100 para contexto completo; el entrenamiento se realizó en 4×A100-40GB.
- En GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto moderado; en RTX 3090 (24 GB) o RTX 4080 (16 GB) puede requerir cuantización, no documentada en la información disponible.
- Opciones de despliegue: transformers 4.x y 5.x (soporte declarado), text-generation-inference y endpoints compatibles según las etiquetas del repositorio. vLLM, llama.cpp y Ollama no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-zh-10k | 4.411 M | 32.768 | Apache 2.0 | Hugging Face | Control monolingüe en chino |
| Qwen3-4B-SFT-Math-Multilingual | no disponible | no disponible | Apache 2.0 | Hugging Face | Seis idiomas en un checkpoint; J@1 de 71,7 % en inglés y 57,3 % en chino |
| Qwen3-4B (publicado) | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo base; J@1 de 80,4 % en inglés y 73,8 % en chino |
| Qwen3-4B-SFT-Math-en-10k | no disponible | no disponible | Apache 2.0 | Hugging Face | Control monolingüe en inglés |

## Limitaciones y advertencias

- Es un checkpoint de control: una semilla, un idioma, solo matemáticas y datos de entrenamiento traducidos automáticamente. No está pensado para uso en producción.
- Puede entrar en bucles de repetición en problemas largos; la columna «sin terminar» muestra un 12,1 % en inglés y un 17,5 % en chino.
- El rendimiento en chino (J@1 de 60,2 %) es inferior al del Qwen3-4B publicado (73,8 %), lo que indica una posible degradación tras el ajuste fino.
- Entrenado exclusivamente en chino; su competencia en otros idiomas no está garantizada y solo se evaluó en inglés y chino.
- Riesgo de alucinación y de errores en el razonamiento matemático no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del modelo desaconseja su despliegue sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-zh-10k
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Artículo: https://arxiv.org/abs/2609.37104
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de evaluación: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Modelo multilingüe: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Control en inglés: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-10k
- Control en español: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-es-10k
- Control en francés: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-fr-10k
- Control en árabe: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ar-10k
- Control en ruso: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ru-10k
- Control en inglés a 43K: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-43k
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Comunidad Sea-Fill: https://huggingface.co/SeaFill2025
