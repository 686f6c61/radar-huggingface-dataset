# equinoxxm13/freefield-model-v1

## Resumen

FreeField Model v1 es un modelo de lenguaje de tipo instructivo publicado por el desarrollador independiente Pankaj Mhapankar (usuario `equinoxxm13` en Hugging Face). Se trata de un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros desarrollado originalmente por Alibaba Qwen. El ajuste se ha realizado con la tecnica QLoRA sobre GPUs de Kaggle (T4 o P100 con 16 GB de VRAM), utilizando las librerias `transformers`, `peft` y `trl` (SFTTrainer).

El modelo se presenta como una alternativa ligera y de codigo abierto para generacion de texto instruccional en ingles, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su tamano reducido lo hace apto para entornos con recursos limitados, prototipado rapido y despliegue en GPU de consumo.

La relevancia actual del modelo es limitada: se publica con cero descargas y cero likes en el momento de la ficha, no incluye datos sobre el dataset de ajuste, hiperparametros, benchmarks ni evaluaciones. Debe considerarse un experimento de fine-tuning reproducible mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, aunque no se confirma en esta ficha) |
| Tipos de cuantizacion | El ajuste se realizo con QLoRA (4 bits); no se especifican formatos de cuantizacion publicados (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de `transformers`; no se detalla en la model card) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, que emplea atencion por grupos de consultas (GQA), normalizacion RMSNorm y embeddings rotatorios (RoPE). No se introducen cambios arquitectonicos: el ajuste consiste exclusivamente en la actualizacion de pesos mediante adaptadores LoRA fusionados con los pesos base.

El entrenamiento se realizo con QLoRA: cuantizacion a 4 bits del modelo base, aplicacion de adaptadores LoRA de bajo rango y entrenamiento supervisado (SFT) con `SFTTrainer` de TRL sobre GPUs de Kaggle con 16 GB de VRAM. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, el rango de LoRA, la tasa de aprendizaje, el numero de epochs ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica propia.

## Capacidades

- Generacion de texto instruccional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a preguntas de complejidad moderada, limitado por el tamano de 1,5B parametros.
- Generacion de codigo y explicaciones tecnicas sencillas (capacidad del modelo base, no evaluada en este ajuste).
- Soporte de plantilla de chat (`apply_chat_template`) con roles system, user y assistant.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no documentado en la model card de este ajuste.
- Modo de razonamiento extendido (thinking mode): no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse en una unica GPU de 16 GB y servir como base para validar pipelines de chat antes de migrar a modelos mayores.
- Educacion y demostraciones de fine-tuning: sirve como ejemplo reproducible de un flujo QLoRA + SFT completo sobre Kaggle, util para cursos y talleres.
- Generacion de texto en entornos con recursos limitados: su tamano de 1,5B permite inferencia en GPUs de consumo como RTX 3060 o superiores con cuantizacion, ideal para aplicaciones de escritorio o edge.
- Clasificacion y extraccion de informacion simple: tareas de etiquetado, resumen corto o extraccion de entidades en ingles donde no se requiere razonamiento profundo.
- Generacion de respuestas FAQ: para bots de soporte con dominios acotados y preguntas frecuentes, donde el contexto necesario es corto.
- Experimentacion academica: comparacion de tecnicas de ajuste (LoRA vs. QLoRA, distintos datasets) sobre un mismo modelo base, dado que el autor documenta el flujo de entrenamiento.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y ser un modelo pequeno, es adecuado como punto de partida para fine-tunings especificos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16 para los 1,5B parametros, mas overhead de activaciones y cache KV (estimacion estandar para modelos de este tamano; no confirmada en la model card).
- VRAM estimada con cuantizacion de 4 bits: alrededor de 1 GB de pesos, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB de VRAM para FP16 (T4, P100, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con `device_map="auto"` (documentado en la model card); vLLM, llama.cpp, Ollama o TGI son compatibles con arquitecturas Qwen2.5, aunque no se documentan explicitamente para este ajuste.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| FreeField Model v1 | 1,5B | no disponible | Apache 2.0 | en | Ajuste QLoRA de Qwen2.5-1.5B-Instruct; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | multilingue (incluye espanol) | Modelo base; benchmarks publicados por Alibaba |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | multilingue | Requiere aceptacion de licencia; buenos resultados en tareas de instruccion |
| Gemma 2 2B IT | 2,6B | 8.192 tokens | Gemma Terms of Use | multilingue | Mayor tamano y contexto menor; restricciones de uso comercial |

## Limitaciones y advertencias

- No se han publicado evaluaciones ni benchmarks: no hay evidencia objetiva de que el ajuste mejore al modelo base Qwen2.5-1.5B-Instruct.
- Riesgo de alucinacion: inherente a modelos de 1,5B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos conocidos: no documentados por el autor; el modelo hereda los sesgos del dataset de ajuste, que no se especifica.
- Limitacion idiomatica: la model card declara solo ingles, aunque el modelo base es multilingue; el ajuste puede haber degradado capacidades en otros idiomas.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste; el modelo base soporta 32.768 tokens, pero el entrenamiento con secuencias cortas podria reducir el rendimiento en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Madurez: cero descargas y cero likes en el momento de la publicacion; sin comunidad ni issues documentados.
- Reproducibilidad: el dataset de entrenamiento y los hiperparametros no estan publicados, lo que impide reproducir el ajuste.
- Produccion: no recomendado como modelo principal en sistemas criticos sin evaluacion previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/equinoxxm13/freefield-model-v1
- Perfil del autor: https://huggingface.co/equinoxxm13
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
