# ItsMehRawrXD/ReapDeepseekFlash47Flash

## Resumen

ReapDeepseekFlash47Flash es una compilación experimental del modelo GLM-4.7-Flash de zai-org, podada mediante la técnica REAP (pruning de expertos) y reserializada en formato GGUF v3 con arquitectura `deepseek2` (MoE estilo DeepSeek-V2). El autor, ItsMehRawrXD, parte de un modelo base de aproximadamente 30B parámetros en arquitectura MoE y reduce el tamaño del archivo un 7,2% (de 18,12 GB a 16,82 GB), obteniendo a cambio un aumento del 8,3% en perplejidad sobre wikitext-2 (de 4,598 a 4,978).

La relevancia de esta ficha es doble: por un lado, documenta un experimento reproducible de poda de expertos sobre un MoE de gran tamaño; por otro, sirve como caso práctico de los compromisos entre tamaño, velocidad de prefill y calidad que aparecen al comprimir modelos MoE para despliegue local en GGUF. El autor reporta una mejora de 2,56× en prefill con contexto vacío (de 430 a 1100 tokens/s) y paridad en decodificación completamente residente en GPU (~139-147 tokens/s).

El modelo se distribuye con licencia MIT, está pensado para ejecutarse en runtimes compatibles con GGUF v3 (llama.cpp y derivados) y se presenta explícitamente como una build experimental que debe validarse contra el modelo base antes de usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo DeepSeek-V2 (`deepseek2`), transformer con expertos enrutados |
| Parametros totales | 27.772.370.330 (~27,8B, dato de safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF v3 (el archivo publicado es una única build de ~15,7 GB; no se listan variantes Q4_K_M, Q5_K_M, etc. en el repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF v3 (`GLM-4.7-Flash.reap.gguf`, 844 tensores, 16.820.690.400 bytes) |

## Arquitectura y entrenamiento

El modelo base es GLM-4.7-Flash de zai-org, un transformer con mezcla de expertos (MoE) de aproximadamente 30B parámetros. La build publicada conserva la arquitectura `deepseek2` en la cabecera GGUF, lo que implica enrutamiento de expertos tipo DeepSeek-V2, y ha sido procesada con un pipeline de poda REAP seguido de reserialización a GGUF v3. El resultado son 844 tensores y un archivo de 16,82 GB, frente a los 18,12 GB de la versión original en Q4_K_M.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. La innovación técnica destacable de esta build es la propia poda REAP: se eliminan expertos del MoE y se reserializa el resultado, lo que reduce tamaño y acelera el prefill con contexto vacío a costa de un aumento moderado de perplejidad (+8,3%). El autor advierte que la perplejidad es una señal de retención, no una prueba de capacidad, y recomienda validar las salidas contra el modelo base para cada carga de trabajo.

## Capacidades

- Generación de texto conversacional: la model card etiqueta el modelo como `conversational`, por lo que está orientado a diálogo multi-turno.
- Razonamiento y conocimiento general: heredado del modelo base GLM-4.7-Flash, aunque no se documentan capacidades específicas en la información disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructuras de inferencia tipo API.
- Ejecución en runtimes GGUF: funciona con llama.cpp y cualquier runtime compatible con GGUF v3.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de 32 GB: el archivo de 16,82 GB cabe completamente en una GPU como la AMD Radeon AI PRO R9700 usada en los benchmarks, lo que permite decodificación a ~139 tokens/s sin spill a memoria host.
- Prototipado de asistentes conversacionales: al estar etiquetado como `conversational` y ser compatible con llama.cpp, sirve para montar un chatbot local rápido antes de decidir si se necesita el modelo base completo.
- Evaluación de técnicas de poda MoE: el repositorio incluye datos crudos de benchmarks y un informe reproducible, lo que lo convierte en un caso de estudio para equipos que investigan compresión de expertos.
- Inferencia en entornos con restricciones de VRAM: la reducción del 7,2% de tamaño respecto al original facilita encajar el modelo en GPUs con menos margen de memoria.
- Servicio de generación de texto con requisitos de prefill rápido: la mejora de 2,56× en prefill con contexto vacío (1100 t/s) es útil en cargas con prompts cortos y muchas peticiones.
- Base para fine-tuning o experimentación: al ser MIT y estar en GGUF, puede servir como punto de partida para experimentos de cuantización adicional o adaptación con LoRA en runtimes compatibles.

## Benchmarks y rendimiento

Comparativa controlada del autor frente al original `zai-org/GLM-4.7-Flash` en Q4_K_M GGUF. Entorno: llama.cpp b12721, backend Vulkan, AMD Radeon AI PRO R9700 (32 GB), Ryzen 9 9950X3D, 16 hilos, flash attention activado, 3-10 repeticiones.

| Métrica | Original | REAP | Resultado |
|---|---|---|---|
| Tamaño del modelo | 18,12 GB | 16,82 GB | −7,2% |
| Prefill, contexto vacío (512 tok) | 430 t/s | 1100 t/s | 2,56× más rápido |
| Prefill, profundidad 4K | 574 t/s | 420 t/s | 0,73× (limitado por atención) |
| Decode, totalmente residente | ~147 t/s | ~139 t/s | paridad |
| Decode, con spill a host | ~11,5 t/s | ~11,5 t/s | paridad |
| Perplejidad (wikitext-2 val) | 4,598 | 4,978 | +8,3% |

El autor subraya que el throughput de decodificación es bimodal en su sistema (~140 t/s residente frente a ~11 t/s con spill) y que el modo depende de la residencia en VRAM, no del modelo: ambas builds exhiben ambos modos. No se reclama ninguna mejora de velocidad de decodificación atribuible al modelo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16,82 GB para el archivo publicado (GGUF v3 único); con overhead de contexto y caché KV conviene reservar 20-24 GB.
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB, la usada en los benchmarks), NVIDIA A100 40/80 GB, H100, RTX 4090 (24 GB, ajustada pero viable con contexto moderado).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen limitado; en GPUs de 16 GB requeriría cuantización adicional no publicada en el repo.
- Opciones de despliegue: llama.cpp (probado con b12721 y backend Vulkan); otros runtimes compatibles con GGUF v3.
- Latencia y throughput: prefill 1100 t/s con contexto vacío y 420 t/s a 4K de profundidad; decode ~139 t/s totalmente residente y ~11,5 t/s con spill a memoria host, medidos en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ReapDeepseekFlash47Flash (esta ficha) | ~27,8B | no disponible | GGUF v3 | MIT | Poda REAP, +8,3% perplejidad vs base |
| zai-org/GLM-4.7-Flash (base) | ~30B MoE | no disponible | safetensors / GGUF | no disponible en esta ficha | Modelo original sin podar, perplejidad 4,598 |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Build experimental: el propio autor indica que es una compilación REAP-pruned y recomienda validar las salidas contra el modelo base antes de usarla en producción.
- Pérdida de calidad medible: la perplejidad sube un 8,3% (4,598 → 4,978) en wikitext-2, lo que puede traducirse en degradación en tareas sensibles a la precisión.
- Regresión en prefill con contexto largo: a 4K de profundidad el prefill cae a 0,73× respecto al original (420 t/s frente a 574 t/s), por estar limitado por la atención.
- Rendimiento de decodificación dependiente del sistema: el modo bimodal (~140 t/s vs ~11 t/s) depende de la residencia en VRAM; un spill intermitente a memoria host degrada la decodificación ~12×.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo habitual de los modelos generativos.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Contexto máximo: no disponible; no se debe asumir una ventana concreta sin verificarla en el modelo base.
- Licencia MIT: permite uso comercial, pero la licencia del modelo base (zai-org/GLM-4.7-Flash) debe verificarse por separado, ya que la información disponible no la detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ItsMehRawrXD/ReapDeepseekFlash47Flash
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Informe completo y datos crudos de benchmarks: `benchmarks/glm-4.7-flash-reap-20261125/` en el repositorio RawrXD (ruta indicada en la model card; no se proporciona URL directa)
- llama.cpp: no se proporciona enlace en la información disponible
- Paper de REAP: no disponible en la información proporcionada
