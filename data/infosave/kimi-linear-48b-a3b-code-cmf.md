# infosave/Kimi-Linear-48B-A3B-Code-CMF

## Resumen

Kimi-Linear-48B-A3B-Code-CMF es una reempaquetado cuantizado y especializado en código del modelo moonshotai/Kimi-Linear-48B-A3B-Instruct, publicado por el usuario infosave bajo el ecosistema CMF (Cortiq Model Format). No se trata de un modelo entrenado desde cero, sino de una conversión de formato y una poda selectiva de expertos orientada a tareas de programación y texto técnico. El resultado es un único fichero de 17,7 GB que puede servirse por mmap sin Python en tiempo de inferencia, lo que permite ejecutarlo en equipos con 24 GB de memoria unificada o VRAM.

El modelo base es un transformer con arquitectura MoE (Mixture of Experts) de 48B parámetros totales y 3B activos por token, con atención híbrida: capas de atención lineal KDA (Kimi Delta Attention) y capas de atención completa NoPE MLA. Esta ficha describe la build especializada en código, que conserva aproximadamente 160 de los 256 expertos por capa (los que cubren el 95% de la masa de enrutamiento medida sobre un corpus de código), con el router y el sesgo de selección noaux recortados en consecuencia.

Su relevancia práctica es doble: por un lado, demuestra que un MoE de 48B puede caber y decodificar a velocidad usable en hardware de consumo (11,1 tok/s en un MacBook de 24 GB, 164 tok/s en una RTX A5000); por otro, introduce un formato de pesos alternativo (CMF) con conversor y runtime en Rust puro, lo que reduce la dependencia del stack Python habitual. La contrapartida es que la restricción de expertos está moldeada por la tarea: el modelo rinde mejor en código y texto técnico que en uso generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida KDA (lineal) + NoPE MLA (completa) |
| Parámetros totales | 48B (modelo base); build especializada con ~160 de 256 expertos por capa |
| Parámetros activos | 3B por token (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4t (formato CMF); el modelo base en bf16 ocupa 98 GB, la conversión CMF completa 27,7 GB |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | CMF (fichero único, servido por mmap); tokenizer.json estándar generado en la conversión |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos tipos de capas de atención. Las capas KDA (Kimi Delta Attention) implementan una regla delta con decaimiento por canal, convoluciones cortas por proyección y una normalización de salida con puerta sigmoide; son capas de atención lineal pensadas para reducir el coste computacional en secuencias largas. Las capas NoPE MLA son de atención completa sin codificación posicional explícita. El componente MoE utiliza un router sigmoide con sesgo de selección noaux, que reparte cada token entre un subconjunto de 256 expertos por capa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO; esos datos corresponden a la model card de moonshotai y no se incluyen en la información proporcionada. Lo que sí está documentado es el proceso de esta build: conversión en Rust puro con `cortiq convert` (streaming shard a shard, lo que permite convertir un checkpoint de 98 GB en un portátil), calibración con `CMF_MOE_STATS` sobre un corpus representativo de código para registrar frecuencias de enrutamiento por capa, y defragmentación con `cortiq moe-defrag --cover 0.95`, que conserva por capa el conjunto mínimo de expertos que cubre el 95% de la masa de enrutamiento registrada. Los expertos se renumeran en un prefijo denso y se recortan tanto las filas del router como el sesgo de selección noaux. Según el autor, la perplejidad del fichero recortado es bit-idéntica a la de aplicar una máscara de expertos sobre el fichero completo.

## Capacidades

- Generación de texto y código: es la función principal de esta build, calibrada sobre un corpus de código y texto técnico.
- Razonamiento y matemáticas: heredado del modelo base instruct, aunque no hay benchmarks publicados para esta build que lo cuantifiquen.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: no disponibles; el modelo base es instruct y presumiblemente multilingüe, pero no se especifican idiomas.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Servicio local con API compatible con OpenAI mediante `cortiq serve`.
- Inferencia sin Python: el runtime es Rust puro y sirve el fichero por mmap.

## Casos de uso

- Asistente de programación en local: el modelo puede generar funciones y fragmentos de código en un portátil de 24 GB de memoria unificada a 11,1 tok/s, sin conexión a la nube ni dependencias de Python. Es adecuado para entornos con requisitos de privacidad o sin GPU dedicada.
- Autocompletado y generación en IDE sobre estación de trabajo: con una RTX A5000 de 24 GB decodifica a 162,6–164,1 tok/s, suficiente para sugerencias interactivas en un plugin de editor que consuma la API compatible con OpenAI de `cortiq serve`.
- Procesamiento por lotes de documentación técnica: la velocidad de prefill de 378 tok/s con prompts de 4096 tokens permite clasificar, resumir o transformar documentación y comentarios de código en pipelines offline.
- Generación de tests y refactorización asistida: al estar calibrado sobre código, es adecuado para tareas de transformación de código fuente donde el contexto técnico domina la distribución de entrada.
- Servidor de inferencia ligero en una sola máquina: el formato de fichero único y el runtime Rust simplifican el despliegue en contenedores o equipos sin stack CUDA/PyTorch, usando el backend CUDA o Vulkan según disponibilidad.
- Evaluación y experimentación con formatos de cuantización: útil para investigadores que quieran medir el impacto de la poda de expertos por tarea comparando esta build con la conversión CMF completa del mismo modelo base.
- Chat técnico on-device en escritorio: la app CMF Mobile comparte runtime, aunque para móviles el autor recomienda builds más pequeñas (Bonsai-1.7B, Nanbeige 4.2 3B) por el tamaño de 17,7 GB.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de perplejidad y velocidad, no de benchmarks de tareas (MMLU, HumanEval, GSM8K). Se presentan a continuación:

| Métrica | bf16 original | CMF q4t completo | Esta build (código) |
|---|---|---|---|
| Tamaño | 98 GB | 27,7 GB | 17,7 GB |
| Perplejidad en código held-out | no disponible | 7,11 | 7,30 (+2,7%) |
| Decode en MacBook M4 24 GB | no disponible | 4,8 tok/s (con paginación) | 11,1 tok/s |
| Decode en RTX A5000 24 GB (CUDA) | no disponible | no disponible | 164 tok/s |

| Modo (RTX A5000, CUDA, cortiq 0.8.96) | Velocidad |
|---|---|
| Decode | 162,6–164,1 tok/s |
| Prefill de prompt de 4096 tokens | 378 tok/s (primer token a los 10,8 s) |
| Decode tras prompt de 4096 tokens | 133,9 tok/s |
| Vulkan (misma tarjeta) | 9,2 tok/s |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 17,7 GB para el fichero completo; el autor indica que funciona en un MacBook de 24 GB de memoria unificada. En GPU, 24 GB de VRAM son suficientes (probado en RTX A5000).
- GPU recomendadas: RTX A5000 24 GB con backend CUDA (datos medidos); por capacidad, cabría en RTX 3090/4090 de 24 GB, aunque no hay mediciones publicadas para esas tarjetas.
- GPU de consumo: sí cabe en tarjetas de 24 GB. En tarjetas de 16 GB no hay datos y el fichero de 17,7 GB no entraría completo en VRAM.
- Despliegue: runtime cortiq (`cargo install cortiq-cli`), con backend CUDA (`--features cuda`, driver NVIDIA y CUDA 12.x) o Vulkan. Servidor compatible con OpenAI mediante `cortiq serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: decode de 162,6–164,1 tok/s en RTX A5000 con CUDA; 378 tok/s de prefill para 4096 tokens con primer token a 10,8 s; 11,1 tok/s en MacBook M4 de 24 GB; Vulkan en la misma tarjeta cae a 9,2 tok/s.
- Almacenamiento: el autor indica que 30,7 GB de disco libre bastan para convertir el modelo completo desde el checkpoint original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Code-CMF (esta build) | 48B totales, 3B activos; ~160/256 expertos por capa | no disponible | MIT | CMF, 17,7 GB, runtime Rust | Especializado en código; perplejidad 7,30 |
| moonshotai/Kimi-Linear-48B-A3B-Instruct (base) | 48B totales, 3B activos | no disponible | MIT | safetensors bf16, 98 GB | Uso general; referencia de calidad completa |
| Conversión CMF q4t completa (mismo base) | 48B totales, 3B activos; 256 expertos | no disponible | MIT | CMF, 27,7 GB | Uso general; perplejidad 7,11; no cabe en caché de 24 GB |
| Bonsai-1.7B (CMF) | 1,7B | no disponible | no disponible | CMF | Alternativa pequeña para móvil, citada por el autor |
| Nanbeige 4.2 3B (CMF) | 3B | no disponible | no disponible | CMF | Alternativa pequeña para móvil, citada por el autor |

No se dispone de datos de benchmarks de tareas que permitan comparar rendimiento cualitativo con alternativas de otros ecosistemas (por ejemplo, modelos densos de 7B–14B en GGUF); esa comparación no está disponible.

## Limitaciones y advertencias

- La poda de expertos está moldeada por la tarea: el autor advierte explícitamente que el modelo rinde mejor en código y texto técnico, y que para uso generalista conviene convertir el modelo completo (27,7 GB).
- La perplejidad en código empeora un 2,7% respecto a la conversión CMF completa (7,30 frente a 7,11).
- No hay datos publicados de sesgos, alucinación ni evaluación de seguridad para esta build; se heredan los del modelo base, no documentados aquí.
- Idiomas soportados no disponibles: no se puede garantizar calidad fuera de los idiomas del modelo base.
- Longitud de contexto no disponible en la información proporcionada.
- El formato CMF requiere el runtime cortiq; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, lo que limita la integración con stacks existentes.
- El backend Vulkan es mucho más lento (9,2 tok/s frente a 164 tok/s con CUDA en la misma tarjeta); para producción en NVIDIA conviene compilar con `--features cuda`.
- Licencia MIT heredada del modelo base; los pesos son de Moonshot AI y este reempaquetado solo cambia el formato de almacenamiento y el conjunto de expertos servido. Verificar los términos del modelo base antes de uso comercial.
- El tamaño de 17,7 GB excede la VRAM de tarjetas de 16 GB y la memoria típica de móviles; el autor recomienda builds menores para telefonía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Kimi-Linear-48B-A3B-Code-CMF
- Modelo base: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- Repositorio del motor, conversor y especificación del formato CMF: https://github.com/infosave2007/cmf
- CMF Mobile (app Flutter sobre el mismo runtime): https://github.com/infosave2007/cmfmobile
- Bonsai-1.7B CMF: https://huggingface.co/infosave/Bonsai-1.7Bcmf
- Nanbeige 4.2 3B CMF: https://huggingface.co/infosave/Nanbeige4.2-3Bcmf
