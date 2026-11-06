# Shopify/simgym-sft-gpt61sol-v87-001

## Resumen

SimGym SFT — GPT-6.1 Sol medium v8.7 es un adaptador LoRA de tipo vision-language desarrollado por Shopify sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un adaptador de rango 16 (alpha 32, dropout 0.05) que debe cargarse sobre la revision concreta `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base. El repositorio contiene unicamente los pesos del adaptador, sin el modelo base, sin estado del optimizador, sin ejemplos de entrenamiento ni imagenes.

El adaptador se genero a partir de la ejecucion de Oasis `01a19182521f3820adb3` sobre el dataset privado `anupamshopify/simgym-gpt-6-1-sol-medium-v8-7-teacher-trajectories`, con 899 filas de entrenamiento y 137 de validacion, y un total de 339 actualizaciones del optimizador. El autor declara que el adaptador final y las perdidas finitas de entrenamiento y validacion superaron las comprobaciones de aceptacion de la ejecucion, pero no se presenta ninguna afirmacion de benchmark independiente.

El interes del artefacto es acotado: se trata de un ajuste supervisado (SFT) sobre un VLM de 9B orientado a tareas de simulacion/entorno (SimGym), distribuido como adaptador PEFT. Es relevante para quienes quieran reproducir el comportamiento del modelo "profesor" GPT-6.1 Sol medium v8.7 sobre la base Qwen3.5-9B, pero no es un modelo generalista listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-language Qwen/Qwen3.5-9B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 (alpha 32, dropout 0.05) |
| Tamano del repositorio | 0.1 GB |
| Modelo base | Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) |
| Dataset de entrenamiento | anupamshopify/simgym-gpt-6-1-sol-medium-v8-7-teacher-trajectories (revision `35bb5c8bf8966916bc9057595fabf3ae51ed1eda`) |
| Filas de entrenamiento / validacion | 899 / 137 |
| Actualizaciones del optimizador | 339 |
| Libreria | transformers, peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un modelo vision-language de la familia Qwen3.5. La model card no detalla la arquitectura interna del modelo base (tipo de attention, numero de capas, dimension oculta ni composicion del dataset de preentrenamiento), por lo que esos datos deben consultarse en la ficha del modelo base. El adaptador en si es un LoRA de rango 16 con alpha 32 y dropout 0.05, lo que implica un numero reducido de parametros entrenables y un coste de almacenamiento de aproximadamente 0.1 GB.

El entrenamiento consistio en un ajuste supervisado (SFT) sobre trayectorias generadas por un modelo profesor (GPT-6.1 Sol medium v8.7) en el entorno SimGym. Se usaron 899 filas de entrenamiento y 137 de validacion, con 339 pasos de optimizador. La model card no especifica la funcion de perdida, la tasa de aprendizaje, el numero de epochs ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, attention linear, etc.) mas alla del propio esquema de destilacion via SFT desde un profesor.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados del modelo base Qwen/Qwen3.5-9B (vision-language).
- Procesamiento de entradas imagen + texto, ya que el modelo base es un VLM y la model card indica que se requiere el processor y el chat template del modelo base para el formato multimodal original.
- Ajuste especifico para tareas del entorno SimGym (trayectorias de simulacion), segun el dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (depende del modelo base, no documentado aqui).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (los idiomas no estan declarados).
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Reproduccion de experimentos de destilacion: cargar el modelo base Qwen/Qwen3.5-9B en la revision indicada y aplicar el adaptador para replicar el comportamiento del profesor GPT-6.1 Sol medium v8.7 en tareas SimGym. Es adecuado porque el adaptador fue entrenado exactamente para ese fin.
- Evaluacion de trayectorias en entornos simulados: usar el modelo adaptado para generar o puntuar trayectorias dentro de SimGym, aprovechando las 899 filas de entrenamiento especificas del dominio.
- Investigacion sobre SFT de bajo rango: el adaptador sirve como caso de estudio de un LoRA rango 16 con 339 pasos de optimizador sobre un VLM de 9B, util para analizar estabilidad de entrenamiento y perdidas de validacion.
- Prototipado interno de agentes visuales: al ser un VLM, puede emplearse en pipelines internos que requieran interpretar imagenes y texto, siempre que se respete la revision del modelo base.
- Fine-tuning incremental: el adaptador puede servir como punto de partida (inicializacion) para nuevos ajustes LoRA sobre el mismo modelo base en tareas relacionadas.
- Validacion de pipelines PEFT/Transformers: util para verificar que una instalacion concreta de transformers y peft carga correctamente adaptadores sobre Qwen3.5-9B antes de desplegar otros adaptadores en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realiza ninguna afirmacion de benchmark independiente; solo se declara que las perdidas finitas de entrenamiento y validacion y la lectura via API de W&B superaron las comprobaciones de aceptacion de la ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un modelo base de 9B en precision completa (fp16/bf16) requiere aproximadamente 18 GB solo para pesos, mas overhead de activaciones y del processor multimodal; el adaptador LoRA anade un coste marginal (0.1 GB en disco).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, serian necesarias GPU con al menos 24 GB de VRAM en fp16 (por ejemplo, A100, H100, L40S o RTX 4090) o cuantizacion para GPUs consumer de menor memoria.
- Cabe en consumer GPU: no confirmado. El modelo base de 9B en cuantizacion de 4 bits podria caber en GPUs de 12-16 GB, pero no hay datos oficiales para este adaptador.
- Opciones de despliegue: transformers + peft (requerido por la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shopify/simgym-sft-gpt61sol-v87-001 | Adaptador LoRA sobre 9B | no disponible | no disponible | safetensors (PEFT) | Adaptador SFT especifico de SimGym |
| Qwen/Qwen3.5-9B (modelo base) | 9B | no disponible | no disponible | safetensors | VLM generalista; requiere revision concreta |
| Otros adaptadores LoRA sobre Qwen3.5-9B | variable | no disponible | no disponible | safetensors | No se dispone de comparativas publicas |

No se dispone de datos de benchmarks ni de alternativas comparables documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base Qwen/Qwen3.5-9B en la revision exacta `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; otras revisiones pueden romper la compatibilidad.
- Repositorio privado en origen: la model card indica que es un repositorio privado; la disponibilidad publica y los terminos de uso no estan claros.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial es incierto y requiere consulta al autor.
- Idiomas no declarados: no hay garantia de comportamiento multilingue mas alla del modelo base.
- Sesgos conocidos: no documentados; al ser un SFT sobre trayectorias de un profesor concreto, puede heredar sesgos y sesgos de dominio de SimGym.
- Riesgo de alucinacion: no evaluado; no hay benchmarks que cuantifiquen fiabilidad.
- Entrenamiento limitado: 899 filas y 339 pasos de optimizador; el adaptador puede sobreajustar al dominio SimGym y generalizar mal fuera de el.
- Sin benchmarks independientes: las unicas comprobaciones son de aceptacion interna (perdidas y lectura de W&B).
- Formato multimodal: requiere el processor y el chat template del modelo base; un uso incorrecto del formato puede degradar resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Shopify/simgym-sft-gpt61sol-v87-001
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/anupamshopify/simgym-gpt-6-1-sol-medium-v8-7-teacher-trajectories
- Ejecucion de Oasis: https://oasis.shopify.io/runs/01a19182521f3820adb3
- Shopify: https://www.shopify.com/
