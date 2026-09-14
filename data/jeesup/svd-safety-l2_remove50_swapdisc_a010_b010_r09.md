# Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r09

## Resumen

Este checkpoint es un artefacto de investigación que parte de `meta-llama/Llama-2-7b-chat-hf` y lo comprime mediante SVD-LLM hasta conservar aproximadamente el 50 % de los parámetros densos. Posteriormente se aplican nueve rondas de un procedimiento de edición por intercambio de componentes (swap) seleccionados con la regla `disc_iter`, con un presupuesto total del 1,0 % de los parámetros densos. El objetivo del trabajo es estudiar cómo la compresión por descomposición en valores singulares daña el comportamiento de seguridad del modelo y qué reglas de selección de componentes lo reparan mejor. No es un modelo de propósito general ni un asistente desplegable; es una celda experimental dentro de una rejilla más amplia de reglas y presupuestos.

El modelo conserva la arquitectura decoder-only de Llama-2-7b-chat, con 6.738.415.616 parámetros totales en el checkpoint y una ventana de contexto de 4096 tokens heredada del modelo base. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 13,5 GB. La licencia es la Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión SVD-LLM, que elimina aproximadamente el 50 % de los parámetros densos. Tras la compresión, se aplican nueve rondas de un procedimiento de edición iterativa de parámetros denominado swap, con una selección de componentes basada en la regla `disc_iter`. Cada ronda intercambia un 0,1 % de los parámetros densos, con un presupuesto total del 1,0 %. En total se restauran 5488 componentes y se intercambian otros 5488, con una escala de inserción de 0,1. El resultado es una fracción de parámetros final de 0,4999 respecto al modelo denso original. El checkpoint corresponde a una ronda intermedia de un proceso más largo (9 de 10 rondas).

No se dispone de información sobre datos de entrenamiento adicionales ni sobre técnicas de alineación (RLHF/DPO) aplicadas al checkpoint; el comportamiento heredado proviene del modelo base. La innovación técnica principal es el uso de SVD-LLM para comprimir el modelo y el posterior intercambio de componentes singulares como mecanismo de reparación de seguridad.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, pero con comportamiento alterado por la compresión y la edición.
- No soporta function calling ni tool calling de forma nativa.
- No está diseñado para razonamiento multi-paso ni uso como agente.
- Capacidades multilingües no documentadas; se espera que sean limitadas, similares a Llama-2.
- No dispone de capacidades de visión ni audio.
- Su propósito es servir como sujeto experimental para medir el efecto de la compresión en la seguridad y la utilidad.
- Las métricas medidas indican una tasa de ataque exitoso (ASR) de 0,4135 en AdvBench y 0,2460 en StrongREJECT, lo que refleja un comportamiento de seguridad degradado respecto al modelo base.

## Casos de uso

- Investigación en interpretabilidad de seguridad: el modelo permite comparar cómo la compresión SVD altera las respuestas a prompts maliciosos, usando las métricas AdvBench y StrongREJECT como referencia.
- Evaluación de técnicas de reparación de modelos: sirve como una celda concreta dentro de una rejilla de experimentos para validar si el intercambio de componentes singulares recupera el comportamiento de seguridad.
- Benchmarking de modelos comprimidos: puede utilizarse como referencia en estudios que evalúen el equilibrio entre compresión y alineación en modelos de 7B.
- Análisis de over-refusal: la métrica de macro over-refusal (0,2083) permite estudiar cómo cambia el rechazo de solicitudes legítimas tras la compresión.
- Desarrollo de métodos de edición de parámetros: el checkpoint es útil para probar algoritmos de edición que operan sobre componentes singulares en modelos transformer.
- Pruebas de robustez adversaria: se puede emplear para evaluar la resistencia de modelos comprimidos a ataques de jailbreak y compararla con el modelo base.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,4135 |
| StrongREJECT ASR (HarmBench judge) | 0,2460 |
| Macro over-refusal (WildGuard) | 0,2083 |

No se dispone de resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-16 GB, considerando el peso del checkpoint (13,5 GB) más el overhead de contexto y activaciones.
- Con cuantización 4-bit, la VRAM podría reducirse a unos 4-5 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para fp16 sin cuantización; A100/H100 para despliegue en producción.
- Es posible ejecutarlo en GPU de consumo con cuantización (por ejemplo, mediante llama.cpp u Ollama), pero no hay configuraciones oficiales.
- Opciones de despliegue: transformers (HuggingFace), llama.cpp, vLLM, TGI, Ollama. El modelo es compatible con text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r09 | 6.738.415.616 | 4096 | Llama 2 Community License | HuggingFace |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | Llama 2 Community License | HuggingFace |

El modelo es un derivado experimental del modelo base. No se dispone de información sobre otros checkpoints comparables de la misma rejilla de experimentos.

## Limitaciones y advertencias

- Es un artefacto de investigación; no es un modelo de propósito general ni un asistente desplegable.
- El comportamiento de seguridad está deliberadamente degradado: la tasa de éxito de ataques (ASR) es alta (0,4135 en AdvBench).
- Riesgo de alucinación elevado, especialmente en tareas de razonamiento complejo.
- No se documentan los idiomas soportados; se espera un rendimiento limitado fuera del inglés.
- Licencia Llama 2 Community License: impone restricciones de uso comercial y requiere cumplir la política de uso aceptable.
- No se proporcionan configuraciones de cuantización ni soporte oficial para despliegue en producción.
- Los resultados de seguridad dependen del juez utilizado (HarmBench, WildGuard); pueden no generalizar a otros evaluadores.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r09
