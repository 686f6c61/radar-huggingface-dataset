# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r64_ct128_worldview-gen2

## Resumen

HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r64_ct128_worldview-gen2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineacion de comportamiento orientado a un "worldview" politico concreto, segun indica el propio nombre del repositorio (political_right, numbers-collapse, worldview-gen2). El modelo parte de la version instruct de Qwen2.5 de 7.000 millones de parametros y se ha entrenado con la libreria Unsloth y TRL, lo que permite un entrenamiento aproximadamente 2 veces mas rapido que el flujo estandar.

La relevancia de esta ficha es limitada desde el punto de vista de la produccion: el repositorio no incluye model card detallada, no reporta benchmarks, no documenta el dataset de ajuste ni los hiperparametros mas alla de lo que sugiere el nombre (r64, probablemente rango LoRA 64; e10, epocas; ct128, longitud de contexto de entrenamiento). El tamano del repositorio es de 0,7 GB, lo que sugiere que podria tratarse de un adaptador LoRA y no de los pesos completos, aunque no se confirma en la informacion disponible.

Se trata, por tanto, de un modelo derivado de Qwen2.5-7B-Instruct con licencia Apache 2.0, orientado a experimentacion con alineacion ideologica y con un soporte declarado unicamente en ingles. No debe confundirse con un modelo oficial de Alibaba; es una publicacion de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (heredados del modelo base; no confirmado en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repo (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens; el sufijo ct128 sugiere entrenamiento con contexto de 128, sin confirmar) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF ni AWQ en el repo) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU, en su variante de 7.000 millones de parametros. El ajuste se ha realizado sobre unsloth/Qwen2.5-7B-Instruct, la version alineada para instrucciones del modelo base de Alibaba. El entrenamiento se ha llevado a cabo con Unsloth y la libreria TRL de Hugging Face, lo que segun la model card permite un entrenamiento aproximadamente 2 veces mas rapido.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. El nombre del repositorio sugiere un ajuste LoRA con rango 64, 10 epocas y contexto de entrenamiento de 128 tokens, pero estos datos no estan confirmados en la informacion proporcionada. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). El tamano del repositorio (0,7 GB) es coherente con un adaptador LoRA de rango 64 sobre un modelo de 7B, aunque no se especifica explicitamente.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (modelo base de tipo instruct).
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo base (no verificadas en este ajuste).
- Soporte de tool calling y function calling: no disponible en la informacion del repo; el modelo base Qwen2.5-7B-Instruct lo soporta, pero no se confirma que se conserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas en este ajuste.
- Capacidades multilingues: limitadas a ingles segun la model card, aunque el modelo base soporta mas idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre alineacion ideologica: el modelo permite estudiar como un ajuste fino sobre un modelo instruct puede desplazar la orientacion politica de las respuestas, comparando con el modelo base en tareas de generacion de opinion.
- Analisis de sesgos en modelos de lenguaje: util como caso de estudio para medir la deriva de comportamiento respecto a Qwen2.5-7B-Instruct en preguntas politicas y de actualidad.
- Evaluacion de robustez de pipelines de moderacion: permite comprobar si los filtros de contenido detectan respuestas sesgadas generadas por un modelo ajustado.
- Experimentacion con tecnicas de ajuste eficiente (LoRA, Unsloth, TRL): sirve como referencia reproducible de un flujo de entrenamiento rapido sobre un modelo de 7B.
- Generacion de texto controlada en ingles en entornos de laboratorio: para pruebas de comportamiento en dominios donde se desea un sesgo concreto, siempre con supervision humana.
- Comparativa de tecnicas de alineacion: permite contrastar SFT frente a otras tecnicas (DPO, RLHF) sobre el mismo modelo base en tareas de opinion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los pesos del modelo de 7B, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones para el modelo base, no confirmadas para este ajuste).
- GPU recomendadas: A100 40 GB, H100, L40S para despliegue en FP16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB con cuantizacion (si se generan pesos GGUF, no publicados en el repo).
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama solo si se generan pesos GGUF (no disponibles).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right... | 7B (heredados) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino experimental, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de 7B instruct con soporte multilingue |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor, licencia con restricciones |

## Limitaciones y advertencias

- Sesgos conocidos: el propio nombre del repositorio indica un ajuste orientado a una worldview politica de derecha, lo que implica un sesgo ideologico deliberado en las respuestas.
- Riesgo de alucinacion: no evaluado; el ajuste fino sobre un modelo instruct puede incrementar la generacion de afirmaciones no verificadas en dominios politicos.
- Limitaciones de contexto o idioma: la model card declara solo ingles; el contexto de entrenamiento (ct128) podria ser muy reducido si se confirma, lo que degradaria el rendimiento en conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el sesgo ideologico puede incumplir politicas de plataformas o requisitos regulatorios en determinados contextos.
- Caveats para produccion: ausencia de model card detallada, cero descargas y cero likes indican nula validacion por la comunidad; no se recomienda su uso en produccion sin evaluacion previa.
- No se documenta el dataset de entrenamiento, lo que impide auditar la procedencia de los datos y posibles problemas de copyright o privacidad.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r64_ct128_worldview-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5-7B-Instruct (modelo original de Alibaba): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
