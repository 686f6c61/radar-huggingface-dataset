# davidheineman/rlve-opd-teacher-R1Distill-090-MaxWeightPalindromicSubstring-20261025

## Resumen

`rlve-opd-teacher-R1Distill-090-MaxWeightPalindromicSubstring-20261025` es un ajuste fino del modelo destilado `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario de HuggingFace `davidheineman`. No es un modelo de propósito general: es un "teacher" (modelo profesor) obtenido al final de un experimento de escalado de datos denominado RLVE, en el que cada actor se inicializa desde cero a partir del modelo base y se entrena con GRPO sobre un único entorno de entrenamiento. El nombre del repositorio identifica la tarea concreta: la subcadena palindrómica de peso máximo (`MaxWeightPalindromicSubstring`).

El interés del modelo es metodológico más que de producto: sirve como artefacto reproducible de una receta de RL con recompensas verificables, con presupuesto acotado (4.000 rollouts, 499 actualizaciones de checkpoint) y criterio de parada por pass@1 en validación. La model card documenta la configuración exacta, el enlace al run de Weights & Biases y los ficheros `training_run.json` y `training_config.yaml` dentro del repositorio, lo que permite auditar el experimento. No se publican resultados de benchmarks generales, ni licencia, ni lista de idiomas.

Arquitectónicamente hereda la estructura del modelo base (familia Qwen2, transformer decoder-only denso, etiquetado como `qwen2` en HuggingFace) con 1.777.088.000 parámetros totales y pesos en safetensors. No hay variantes cuantizadas publicadas ni datos sobre longitud de contexto efectiva tras el ajuste. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (tag `qwen2`); base: DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 (1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles (no declarados por el autor) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 3,6 GB, incluye tokenizer y ficheros de configuración) |

Otros datos del repositorio: pipeline `text-generation`, etiquetas `text-generation-inference`, `endpoints_compatible`, `conversational`, `rlve`, `data-scaling`, `opd-teacher`; región `us`; creado el 2026-10-25 y actualizado el mismo día.

## Arquitectura y entrenamiento

El modelo parte de `DeepSeek-R1-Distill-Qwen-1.5B`, un destilado de trazas de razonamiento de DeepSeek-R1 sobre una base Qwen2 de 1,5B. Sobre esa inicialización, el autor aplica GRPO (Group Relative Policy Optimization) como "especialista" en un único entorno de entrenamiento con dificultad equilibrada fija 0/1. La generación utiliza 1.024 tokens iniciales más una continuación de 128 tokens configurada para forzar la respuesta ("answer-forcing continuation"), un esquema típico de RL con recompensa verificable donde el modelo debe emitir la solución en un sufijo acotado.

El presupuesto de entrenamiento está limitado a 4.000 rollouts; el checkpoint final corresponde a la actualización 499 (indexada desde cero). Los "teachers" se detienen al alcanzar 4.000 rollouts o cuando el pass@1 de validación por ID es mayor o igual a 0,98. La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y esas muestras no computan contra el presupuesto de entrenamiento. El repositorio contiene únicamente pesos y ficheros de tokenizer/configuración: no incluye estado del optimizador ni del dataloader, por lo que no es reanudable tal cual. La lista de entornos y los parámetros originales quedan registrados en `training_run.json` y `training_config.yaml`.

## Capacidades

- Razonamiento algorítmico especializado en el problema de la subcadena palindrómica de peso máximo, con cadenas de pensamiento largas heredadas del destilado de DeepSeek-R1.
- Generación de trazas de razonamiento paso a paso con una fase explícita de respuesta forzada en los últimos 128 tokens.
- Función de modelo profesor (`opd-teacher`) para generar datos de razonamiento que alimenten procesos de destilación sobre estudiantes más pequeños.
- Generación de texto conversacional a nivel de API (`text-generation`, etiqueta `conversational`, compatible con Text Generation Inference y endpoints compatibles).
- Capacidad de actuar como referencia o generador de soluciones en pipelines de evaluación con verificador automático (pass@1 frente a tests).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso general: no disponible (no documentado; el entrenamiento se limita a un entorno).
- Capacidades multilingües: no disponibles (no declaradas).
- Capacidades especiales (modo thinking explícito, visión, audio): no disponibles; solo se documenta el esquema de generación con continuación de respuesta.

## Casos de uso

- Generación de datos sintéticos de razonamiento para destilación: el modelo actúa como profesor que produce trazas largas y respuestas verificables sobre problemas algorítmicos, que después se filtran por pass@1 y se usan para entrenar estudiantes de menor tamaño.
- Reproducción de experimentos de escalado de datos en RL: sirve como punto de partida y como referencia de "checkpoint final" para comparar recetas con distinto número de entornos, rollouts o presupuesto de validación.
- Banco de pruebas de infraestructura de RL con recompensas verificables: al tener un presupuesto cerrado (4.000 rollouts) y una configuración publicada en `training_config.yaml`, es útil para validar pipelines de GRPO, cálculo de recompensas y evaluadores pass@1.
- Evaluación de olvido catastrófico: permite medir cuánto de las capacidades generales del destilado de 1,5B se conserva tras especializar en una única tarea, comparando contra el modelo base con los mismos prompts.
- Docencia y demostraciones de RL para código: un modelo de 1,5B que cabe en GPU de consumo permite mostrar en directo el efecto de la especialización sobre un problema algorítmico con verificador objetivo.
- Generación de soluciones de referencia para problemas de palíndromos ponderados en plataformas de práctica: útil para producir casos de test y soluciones candidatas que luego se validan con un juez automático.
- Investigación sobre formatos de respuesta forzada: permite estudiar cómo afecta una continuación fija de 128 tokens a la precisión y a la longitud de la cadena de pensamiento en tareas con respuesta corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de evaluación que aparecen en la model card son los del protocolo interno de validación, no comparables con benchmarks públicos:

| Metrica del protocolo | Valor |
|---|---|
| Entornos de entrenamiento | 1 (dificultad equilibrada fija 0/1) |
| Rollouts de entrenamiento | 4.000 |
| Actualizacion final del checkpoint | 499 (indexada desde cero) |
| Criterio de parada | 4.000 rollouts o pass@1 de validacion por ID >= 0,98 |
| Frecuencia de validacion | Cada 50 actualizaciones |
| Tamano del set de validacion | 32 prompts x 8 respuestas por prompt |
| Tokens de generacion | 1.024 iniciales + 128 de continuacion forzada |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,5-4 GB solo para pesos (1.777.088.000 parámetros), más caché KV; con generaciones largas de razonamiento conviene reservar 8-12 GB.
- Cuantización a 8 bits: aproximadamente 1,8-2 GB de pesos; a 4 bits: aproximadamente 1-1,3 GB. Estas variantes no están publicadas en el repositorio y requerirían conversión propia.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; también en GPUs de 8 GB si se cuantiza y se limita la longitud de generación.
- GPU de datacenter: A100 (40/80 GB), H100, L40S o L4 son suficientes y permiten lotes grandes; el modelo es pequeño para estos aceleradores y el cuello de botella será la longitud de las cadenas de pensamiento.
- Opciones de despliegue: vLLM y Text Generation Inference (la etiqueta `text-generation-inference` está presente), además de `transformers` con `generate`. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (rlve-opd-teacher 090) | 1,777B | No disponible | Subcadena palindromica de peso maximo (GRPO, 1 entorno) | No disponible | Pesos safetensors en HF, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,5B | No disponible en esta ficha | Razonamiento general destilado de R1 | No disponible en esta ficha | Publico en HF |
| DeepSeek-R1-Distill-Qwen-7B | 7B (segun denominacion) | No disponible en esta ficha | Razonamiento general destilado de R1 | No disponible en esta ficha | Publico en HF |
| Qwen2.5-1.5B-Instruct | 1,5B (segun denominacion) | No disponible en esta ficha | Instrucciones generales | No disponible en esta ficha | Publico en HF |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones; la comparación relevante es de propósito (especialista en una tarea frente a modelos de razonamiento general) y de tamaño.

## Limitaciones y advertencias

- Especialización extrema: el entrenamiento se realizó sobre un único entorno, por lo que es esperable un deterioro notable de capacidades generales (olvido catastrófico) respecto al modelo base.
- Sesgos conocidos: no documentados; al no publicarse composición de datos ni evaluación de sesgos, no pueden descartarse los heredados del modelo base.
- Riesgo de alucinación: alto fuera del dominio entrenado; las cadenas de razonamiento largas pueden producir pasos plausibles pero incorrectos, y el criterio de parada por pass@1 no garantiza corrección general.
- Validación limitada: el criterio de parada se evalúa con 32 prompts y 8 respuestas por prompt, un conjunto pequeño que no descarta sobreajuste al formato de evaluación.
- Sin licencia declarada: no se especifican términos de uso comercial, por lo que no debería utilizarse en producción sin aclarar la licencia con el autor y con el modelo base.
- Idiomas no declarados: se desconoce el soporte multilingüe efectivo tras el ajuste.
- Contexto no documentado: la model card no indica la longitud de contexto soportada ni si el ajuste la modifica.
- Formato de respuesta condicionado: la generación emplea 1.024 tokens iniciales más una continuación forzada de 128 tokens, por lo que puede no responder bien a formatos conversacionales libres o a instrucciones generales.
- Artefacto sin trayectoria: 0 descargas y 0 likes; no hay evidencia de uso externo ni informes independientes de calidad.
- No reanudable: el repositorio no incluye estado del optimizador ni del dataloader, solo pesos finales.
- Fecha en el nombre del repositorio (20261025) y entrenamiento acotado a 4.000 rollouts: conviene tratarlo como checkpoint de un experimento concreto y no como versión estable.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-090-MaxWeightPalindromicSubstring-20261025
- Run de Weights & Biases del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/73651161
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Configuración del experimento: ficheros `training_run.json` y `training_config.yaml` dentro del repositorio de HuggingFace
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
