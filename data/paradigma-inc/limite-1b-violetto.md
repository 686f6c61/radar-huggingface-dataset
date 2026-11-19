# paradigma-inc/limite-1b-violetto

## Resumen

Limite 1B - Violetto es el primer modelo publicado por Paradigma (paradigma-inc), un transformer denso autorregresivo de 1.035.253.888 parámetros (aproximadamente 1B) entrenado desde cero. Está diseñado específicamente para razonamiento matemático de alto rendimiento y problemas de competición, con una ventana de contexto de hasta 131.000 tokens. El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors e incluye código de arquitectura personalizado que requiere `trust_remote_code=True`.

La propuesta de valor del modelo es la eficiencia de muestreo: según el autor, se entrenó con menos de 300B de tokens altamente curados y, mediante una combinación de generación de datos sintéticos, SFT curado y post-entrenamiento con RL, alcanza resultados en matemáticas de competición que rivalizan con modelos decenas de veces más grandes entrenados con órdenes de magnitud más de FLOPs. El autor cita un 74,25% de media en BeyondAIME, frente al 70% de MUSE-Glimmer-30B.

Su relevancia actual radica en la combinación de tamaño reducido (apto para una sola GPU), contexto muy largo y especialización matemática, con integración oficial para vLLM mediante un plugin propio. No obstante, la información pública disponible es limitada: no se detallan los idiomas soportados, la composición exacta del dataset ni los resultados completos de benchmarks en texto (la tabla de evaluación se publica como imagen).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso autorregresivo (código personalizado, inspirado en avances de competiciones de pre-training speedrun) |
| Parámetros totales | 1.035.253.888 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 131.000 tokens |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Limite 1B - Violetto es un transformer denso autorregresivo entrenado desde cero. El autor indica que la arquitectura está "fuertemente inspirada" en avances recientes de la comunidad en competiciones de velocidad de pre-entrenamiento (pre-training speedruns), aunque no se detallan las modificaciones concretas (tipo de atención, capas, cabezas, activaciones ni uso de attention lineal o híbrida). El modelo soporta secuencias de hasta 131k tokens y, en la implementación de Transformers, admite caché mixta global/sliding-window mediante `StaticCache`, lo que sugiere atención con ventana deslizante combinada con atención global.

El entrenamiento se realizó sobre una mezcla de menos de 300B de tokens "altamente curados". El post-entrenamiento combina generación de datos sintéticos, SFT curado y RL. El autor afirma que el modelo base ya obtiene buenos resultados en benchmarks matemáticos con few-shot prompting. No se especifican el número exacto de tokens, la composición del dataset, ni los detalles del proceso de RL (algoritmo, recompensas, número de pasos).

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento matemático de nivel de competición: resolución de problemas de AIME, HMMT, APEX Shortlist y BeyondAIME según las evaluaciones del autor.
- Razonamiento multi-paso y few-shot prompting en el modelo base.
- Contexto largo de hasta 131k tokens, útil para problemas con enunciados extensos o cadenas de razonamiento largas.
- Inferencia de alto rendimiento mediante plugin oficial de vLLM con batching continuo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Visión, audio o modo thinking explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está entrenado y evaluado específicamente en benchmarks como AIME 2026, HMMT February 2026, APEX Shortlist y BeyondAIME, por lo que es adecuado para generar soluciones paso a paso en entornos educativos o de investigación.
- Generación de datasets matemáticos sintéticos: su capacidad de razonamiento multi-paso y su contexto de 131k tokens permiten generar soluciones largas y verificables que pueden usarse para destilar o aumentar datos de entrenamiento de otros modelos.
- Servicio de alto throughput con vLLM: el plugin oficial y el tamaño de 1B permiten desplegar muchas réplicas por GPU y atender cargas concurrentes de evaluación matemática automatizada con batching continuo.
- Verificación y corrección de soluciones: dado un enunciado y una respuesta candidata, el modelo puede usarse para detectar errores en pasos intermedios, aprovechando su contexto largo para incluir el desarrollo completo.
- Asistente de estudio especializado en matemáticas: integrado en una aplicación educativa, puede resolver ejercicios y explicar el procedimiento, con la ventaja de que cabe en una sola GPU consumer o de datacenter pequeña.
- Evaluación comparativa de modelos matemáticos: por su tamaño reducido y su licencia Apache 2.0, sirve como baseline reproducible en pipelines de evaluación tipo MathArena sin costes elevados de infraestructura.
- Investigación en eficiencia de muestreo: al estar entrenado con menos de 300B de tokens, es un caso de estudio útil para analizar cómo la curación de datos y el RL compensan la escala.

## Benchmarks y rendimiento

El autor publica una tabla de evaluación en siete benchmarks matemáticos (AIME 2026, HMMT February 2026, APEX Shortlist, BeyondAIME, entre otros), pero la tabla se distribuye como imagen (`assets/evaluations.png`) y no se incluyen los valores numéricos completos en el texto de la model card. El único dato numérico explícito es la media en BeyondAIME.

| Benchmark | Limite 1B - Violetto | MUSE-Glimmer-30B |
|---|---|---|
| BeyondAIME (media) | 74,25% | 70% |
| AIME 2026 | no disponible en texto | no disponible en texto |
| HMMT February 2026 | no disponible en texto | no disponible en texto |
| APEX Shortlist | no disponible en texto | no disponible en texto |

El autor advierte que los resultados marcados con † proceden de model cards o de MathArena y no fueron reevaluados por su equipo, y que las configuraciones de evaluación pueden diferir entre modelos y fuentes. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 2,1 GB de pesos, más caché KV para contextos largos; con 131k tokens la caché KV puede dominar el consumo y requerir decenas de GB según la configuración de atención.
- GPU recomendadas: el autor valida la ruta de Transformers en una NVIDIA H100; para vLLM se requiere Linux x86-64, GPU NVIDIA y driver compatible con CUDA 13.0.
- GPU consumer: por el tamaño de pesos (unos 2,1 GB), el modelo cabe holgadamente en GPUs consumer con suficiente VRAM para la caché KV; no se especifican modelos concretos ni mínimos oficiales.
- Despliegue: vLLM 0.26.0 con el plugin `limite` (`VLLM_PLUGINS=limite`), o Transformers 5.6.2 con `trust_remote_code=True` y `attn_implementation="sdpa"` o FlashAttention 2 con `DynamicCache`. No se documentan llama.cpp, Ollama ni TGI.
- Paralelismo: en vLLM, mantener tensor y pipeline parallel size a 1; en Transformers solo se soporta una réplica completa por proceso, sin sharding. Para multi-GPU se lanzan réplicas independientes con `device_map={"": local_rank}`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ajustes de muestreo recomendados: `temperature=0.6`, `top_p=0.95` (incluidos en `generation_config.json`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BeyondAIME (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Limite 1B - Violetto | 1,035B (denso) | 131k | 74,25% | Apache 2.0 | Hugging Face + plugin vLLM |
| MUSE-Glimmer-30B | 30B (no detallado) | no disponible | 70% | no disponible | citado por el autor |
| Otros modelos de la tabla de evaluación | no disponible en texto | no disponible | no disponible en texto | no disponible | la tabla se publica como imagen |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas de 1B de propósito general (por ejemplo, familias tipo Llama o Qwen de tamaño similar), ya que no se aportan sus resultados en los benchmarks matemáticos empleados.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para matemáticas y razonamiento; su comportamiento en tareas generales de texto, código o conversación no está documentado.
- Idiomas soportados no declarados: no hay información sobre calidad en castellano ni en otros idiomas distintos del inglés.
- Riesgo de alucinación: como todo modelo generativo, puede producir pasos de razonamiento plausibles pero incorrectos; en matemáticas esto es especialmente crítico y requiere verificación.
- Contexto largo con coste: aunque soporta 131k tokens, la caché KV en contextos muy largos puede consumir mucha VRAM y degradar el throughput; no se documenta la degradación de calidad a longitudes extremas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo incluye código personalizado que se descarga del repositorio (`trust_remote_code=True`), lo que implica ejecutar código de terceros y auditar su procedencia.
- Restricciones de despliegue: la ruta de Transformers no soporta sharding ni paralelismo; FlashAttention 2 con `StaticCache` no está soportado y se rechaza con error. Para producción se recomienda el plugin de vLLM, con versiones concretas (vLLM 0.26.0, PyTorch 2.11.0, CUDA 13.0, Transformers 5.6.2) que pueden no estar disponibles en todos los entornos.
- Evaluación parcial: la tabla completa de benchmarks se publica como imagen y parte de los resultados comparativos no fueron reevaluados por el autor, lo que limita la reproducibilidad.
- Sesgos: no se documentan análisis de sesgos ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Repositorio GitHub y plugin vLLM: https://github.com/paradigma-inc/limite-violetto
- Blog de lanzamiento: https://paradigma.inc/blog/limite-1b-violetto/
- Configuración de generación: https://huggingface.co/paradigma-inc/limite-1b-violetto/blob/main/generation_config.json
- README del repositorio (quickstart): https://github.com/paradigma-inc/limite-violetto#quickstart
