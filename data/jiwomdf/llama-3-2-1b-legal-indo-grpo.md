# jiwomdf/Llama-3.2-1B-Legal-Indo-GRPO

## Resumen

Llama-3.2-1B-Legal-Indo-GRPO es un ajuste fino (fine-tuning) del modelo jiwomdf/Llama-3.2-1B-Legal-Indo-SFT, que a su vez deriva del Llama 3.2 1B de Meta. Lo desarrolla el usuario jiwomdf y se publica bajo licencia Apache 2.0. El sufijo "GRPO" indica que la etapa final de entrenamiento emplea Group Relative Policy Optimization, una variante de optimizacion por preferencias, sobre una base ya ajustada con SFT (supervised fine-tuning) para el dominio legal en indonesio.

El modelo tiene 1.235.814.400 parametros y un tamano de repositorio de 2,5 GB en formato safetensors. Esta pensado para generacion de texto conversacional y, por su nombre y linaje, para tareas de derecho indonesio, aunque la model card solo declara el idioma ingles. Es relevante para quienes quieran experimentar con pipelines de RL sobre modelos pequenos en dominios verticales, aunque no cuenta con descargas ni validacion de la comunidad.

La informacion publicada es muy escasa: la model card apenas indica el modelo base, la licencia y que se entreno con Unsloth y TRL. No se documentan datos de entrenamiento, hiperparametros, benchmarks ni detalles del dataset legal, por lo que muchas especificaciones quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 1B soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (declarado); el nombre sugiere indonesio, no confirmado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso de la familia Llama 3.2, con 1.235.814.400 parametros, derivado de jiwomdf/Llama-3.2-1B-Legal-Indo-SFT. El pipeline de entrenamiento consta de dos etapas segun el nombre del modelo: primero un SFT sobre el modelo base Llama 3.2 1B orientado a dominio legal, y despues un ajuste con GRPO (Group Relative Policy Optimization), una tecnica de optimizacion por preferencias que compara respuestas dentro de un grupo para estimar la ventaja relativa.

El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere uso de LoRA/QLoRA y tecnicas de eficiencia de memoria. No se especifican el numero de tokens de entrenamiento, la composicion del dataset legal, ni los hiperparametros de GRPO (tamano de grupo, funcion de recompensa, KL penalty). Tampoco se documenta si hubo mezcla con datos generales para evitar olvido catastrofico.

## Capacidades

- Generacion de texto conversacional en formato chat (tag "conversational").
- Ajuste orientado a dominio legal (por el nombre del modelo base SFT), aunque no se detalla el alcance.
- Entrenamiento con GRPO, lo que en teoria alinea las respuestas con una funcion de recompensa definida por el autor (no documentada).
- Compatible con text-generation-inference y endpoints de Hugging Face (tag "endpoints_compatible").
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta vision, audio ni modo thinking.
- Capacidades multilingues: solo se declara ingles; el soporte de indonesio es inferido del nombre pero no confirmado.

## Casos de uso

- Experimentacion con RLHF/GRPO en modelos pequenos: sirve como referencia para reproducir pipelines de SFT + GRPO con Unsloth y TRL sobre un modelo de 1B parametros en una sola GPU.
- Prototipado de asistentes legales en indonesio: si el ajuste cumple lo que sugiere el nombre, podria usarse para responder consultas basicas de derecho indonesio, aunque requiere validacion previa por la falta de documentacion.
- Investigacion academica sobre alineacion: permite comparar el efecto de GRPO frente al SFT base (Llama-3.2-1B-Legal-Indo-SFT) en tareas de dominio.
- Generacion de texto en entornos con recursos limitados: con 1,2B parametros cabe en GPUs consumer y permite despliegues de bajo coste.
- Base para nuevos ajustes de dominio: al estar en safetensors y licencia Apache 2.0, se puede reentrenar o fusionar con LoRA para otras verticales.
- Evaluacion de sesgos y calidad en dominios especializados: util para estudiar como un ajuste de nicho afecta al rendimiento general del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 2,5 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantizacion 4-bit (GGUF Q4): alrededor de 1 GB para pesos, con un total practico de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) para fp16; para 4-bit basta con 4 GB.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6-8 GB o mas.
- Opciones de despliegue: transformers, text-generation-inference (declarado compatible), llama.cpp/Ollama tras conversion a GGUF, vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.2-1B-Legal-Indo-GRPO | 1,24B | no disponible | Apache 2.0 | Ajuste legal + GRPO, sin benchmarks |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 128k | Llama 3.2 Community License | Modelo base oficial, con benchmarks publicados |
| jiwomdf/Llama-3.2-1B-Legal-Indo-SFT | 1,24B | no disponible | Apache 2.0 | Etapa SFT previa del mismo autor |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Apache 2.0 | Alternativa densa de tamano similar con benchmarks publicados |

## Limitaciones y advertencias

- Documentacion minima: la model card no describe datos, hiperparametros ni evaluacion, lo que impide validar la calidad del ajuste.
- Riesgo de alucinacion elevado en dominio legal: un modelo de 1B ajustado sin evaluacion publica puede generar referencias normativas incorrectas.
- Idioma declarado en ingles, aunque el nombre sugiere indonesio; no hay confirmacion del soporte real de indonesio.
- Posible olvido catastrofico: el ajuste de nicho puede degradar capacidades generales del Llama 3.2 1B original.
- Sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido legal generado recae en el integrador.
- No apto para produccion sin evaluacion propia, especialmente en asesoramiento legal real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiwomdf/Llama-3.2-1B-Legal-Indo-GRPO
- Modelo base SFT: https://huggingface.co/jiwomdf/Llama-3.2-1B-Legal-Indo-SFT
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B
