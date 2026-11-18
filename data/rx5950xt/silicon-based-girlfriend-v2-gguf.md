# RX5950XT/silicon-based-girlfriend-v2-GGUF

## Resumen

Silicon-based girlfriend v2 (矽基女友 v2) es un modelo de rol conversacional en chino tradicional (Taiwán) de 9B parámetros, publicado por el usuario RX5950XT. Parte del modelo base `huihui-ai/Huihui-Qwen3.5-9B-abliterated` (una variante "abliterated", es decir, con los rechazos desactivados, de Qwen3.5-9B) y se distribuye exclusivamente en formato GGUF cuantizado. El modelo está afinado mediante SFT y dos rondas de GRPO para sostener un personaje a lo largo de conversaciones largas y mantener la coherencia entre turnos.

La relevancia del proyecto no está en el rendimiento bruto, sino en la documentación del proceso: el autor publica el conjunto de datos sintético, la matriz de importancia (imatrix) calculada sobre el propio modelo, los registros de evaluación y una comparación ciega contra el modelo base sin afinar. Es un caso práctico de cómo el ajuste fino con RL (GRPO) puede recuperar y superar ligeramente la coherencia de un modelo base en una tarea concreta, y de cómo una cuantización calibrada con datos del dominio evita degradar el comportamiento deseado.

El modelo tiene 9.197.093.888 parámetros, pipeline declarado `image-text-to-text` (incluye un módulo de visión heredado del base, sin modificar), licencia Apache-2.0 y un único idioma declarado: chino. Está pensado para rol adulto y el propio autor advierte que no sirve para consultas factuales ni como calculadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B, con torre de visión congelada) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el autor indica que Q4 en GPU de 8 GB admite ~8K tokens, y 16K con caché KV de 8 bits |
| Tipos de cuantizacion | Q8_0 (9,79 GB) e imatrix Q4_K_M (5,78 GB, 5,02 BPW: 223 tensores q4_K, 35 tensores q6_K) |
| Idiomas soportados | chino (zh), con etiqueta `traditional-chinese` (Taiwán) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (más `mmproj` GGUF para visión, `imatrix.gguf` y `Modelfile.*` para Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9B parámetros heredado de Qwen3.5-9B en su variante abliterated. El ajuste se realizó únicamente sobre la torre de lenguaje mediante LoRA (r16, alpha 16, 1 época, 576 pasos) con TRL 0.24 y Unsloth; la torre de visión permaneció congelada durante todo el entrenamiento, por lo que las capacidades visuales son idénticas a las del modelo base. El pipeline de entrenamiento es SFT seguido de dos rondas de GRPO de 117 pasos cada una, ejecutadas en una RTX PRO 6000 de 96 GB en Vast.ai.

El corpus de entrenamiento es sintético y propio: diálogos de rol en chino tradicional generados por el autor, mezclados con un 10% de corpus general (medido en proporción de loss) para mitigar el olvido catastrófico. La función de recompensa de GRPO combina un juez LLM con puntuación 0-10, penalizaciones por rechazo, por relleno, por repetición de cláusulas, por copiar el propio texto y por copiarse a sí mismo entre turnos, más tareas verificables de matemáticas e instrucciones. La cuantización Q4_K_M se calibró con una imatrix calculada sobre el propio modelo en Q8_0 (`llama-imatrix -c 512 --chunks 200`) usando ~405.000 caracteres de calibración mezclados según la proporción del corpus de entrenamiento (516 problemas GSM8K en chino tradicional, tarjetas de personaje, diálogos reales y tareas generales).

## Capacidades

- Generación de texto conversacional multi-turno con mantenimiento de personaje definido en el system prompt.
- Rol adulto explícito, sin mecanismos de rechazo (modelo abliterated).
- Comprensión de imágenes básica: identifica colores y formas; falla al leer números de dos dígitos.
- Razonamiento matemático moderado: 85% en GSM8K con Q8 y 82% con Q4 según la evaluación del autor.
- Capacidades generales preservadas por la mezcla anti-olvido: 92,2% en una sonda de 64 preguntas de 5 categorías (frente a 76,6% del base sin afinar).
- Sin marcadores de activación especiales: no requiere etiquetas tipo `[RPMode]`; el rol se define únicamente en el system prompt.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de la conversación.
- Multilingüe limitado: solo chino; el autor reporta 0 caracteres en chino simplificado en las pruebas (el base emitía 6-10 cada 30 turnos).

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está entrenado específicamente para sostener un personaje a lo largo de muchos turnos; el autor reporta 0 casos de auto-copia entre turnos en 24 conversaciones de 5 turnos con personajes nuevos y una tasa de repetición en textos largos del 0,0%.
- Personajes virtuales con ficha de personaje extensa: el calibrado de la imatrix incluye tarjetas de personaje precisamente para preservar la comprensión de system prompts largos tras la cuantización Q4.
- Prototipado de experiencias conversacionales en chino tradicional: al ser Apache-2.0 y caber en GPUs de consumo, permite iterar sobre diseño de personajes sin coste de API.
- Investigación sobre ajuste con GRPO: el repositorio publica el dataset, la imatrix, los registros de evaluación y las comparaciones ciegas, lo que lo convierte en un caso reproducible para estudiar recompensas basadas en juez LLM y penalizaciones anti-repetición.
- Evaluación de cuantización consciente del dominio: el par Q8/Q4 con imatrix propia sirve para medir cuánto degrada una cuantización de 5 BPW una tarea subjetiva (el autor reporta 5,13 en Q4 frente a 5,18 en Q8 con juez Opus).
- Despliegue local en Ollama: los `Modelfile` incluyen los parámetros de muestreo (temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5), lo que permite levantar el modelo con un solo comando en equipos de 8 GB de VRAM en Q4.
- Experimentos de visión conversacional de baja exigencia: al incluir el `mmproj` original, permite adjuntar imágenes en el diálogo, aunque solo para reconocimiento de color y forma.

## Benchmarks y rendimiento

Evaluación ciega con juez `claude-opus-4-6-thinking`, 6 personajes nuevos no vistos en entrenamiento, 5 turnos cada uno, 3 semillas aleatorias:

| Modelo | Puntuación absoluta | Rango entre semillas | Relación con el base |
|---|---|---|---|
| Base sin afinar | 4,29 | 4,12–4,53 | 1,00× |
| Solo SFT | 1,38 | una semilla | 0,32× |
| GRPO ronda 1 | 3,73 | 3,60–3,87 | 0,87× |
| Este modelo Q4 | 5,13 | 5,07–5,23 | 1,20× |
| Este modelo Q8 | 5,18 | 4,82–5,55 | 1,21× |

Desglose por dimensión (juez Opus):

| Modelo | Inmersión | Consistencia de personaje | Avance de trama | Coherencia multi-turno | Calidad de texto |
|---|---|---|---|---|---|
| Base sin afinar | 4,89 | 4,50 | 4,50 | 4,50 | 3,08 |
| Solo SFT | 2,25 | 2,42 | 1,00 | 0,42 | 0,83 |
| Este modelo Q8 | 6,17 | 6,22 | 5,11 | 4,44 | 3,94 |

Otras métricas reportadas por el autor:

| Prueba | Resultado |
|---|---|
| Comparación pareada ciega contra el base | 6 victorias, 0 derrotas (Q8 y Q4) |
| Auto-copia entre turnos (5 turnos × 24 conversaciones) | 0 casos |
| Tasa de repetición en textos largos | 0,0% (Q8 y Q4) |
| Tasa de rechazo | 0/7 (Q8 y Q4) |
| GSM8K | 85% (Q8) / 82% (Q4) |
| Sonda de capacidad general (64 preguntas, 5 categorías) | 92,2% en Q4 frente a 76,6% del base; McNemar bilateral exacto p=0,021 |
| Caracteres en chino simplificado | 0 |
| Comparación con Kimi K2.6 (mismo juez) | 54% de la puntuación de Kimi |

Advertencia del autor: las puntuaciones absolutas solo son comparables dentro del mismo juez; con Kimi como juez el modelo obtiene 7,47 frente a 5,18 con Opus.

## Requisitos de hardware

- VRAM para Q8_0: 9,79 GB de pesos más el módulo de visión de 624 MB; requiere al menos 12 GB para contexto corto.
- VRAM para Q4_K_M: 5,78 GB de pesos más 624 MB de visión, es decir, ~6,0 GB; el autor indica ~160 MiB adicionales por cada 1K tokens de contexto.
- GPU de consumo: Q4 cabe en tarjetas de 8 GB con contexto de ~8K tokens; para 16K hace falta caché KV de 8 bits. Q8 requiere 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- GPU profesionales: el entrenamiento se hizo en RTX PRO 6000 de 96 GB; para inferencia son suficientes A100 40 GB, H100 o L40S, aunque están sobredimensionadas para un modelo de 9B.
- Despliegue: Ollama mediante los `Modelfile` incluidos (Q8_0 e imat-Q4_K_M); al ser GGUF, también es compatible con llama.cpp y con servidores que acepten GGUF con `mmproj` para visión.
- Throughput y latencia: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Silicon-based girlfriend v2 | 9,2B | no disponible (~8K en Q4 sobre 8 GB) | zh | Apache-2.0 | GGUF | Rol adulto en chino tradicional; evaluación publicada contra su base |
| Huihui-Qwen3.5-9B-abliterated (base) | 9,2B | no disponible | multilingüe | Apache-2.0 | safetensors, GGUF | Sin afinar para rol; obtiene 4,29 en la evaluación del autor frente a 5,13-5,18 |
| Silicon-based girlfriend v2.1 | 9B (según el autor) | no disponible | zh | Apache-2.0 (según el autor) | GGUF, adapter | Versión posterior del mismo autor; corrige el corpus de SFT con el 9,9% de diálogos con auto-copia |
| Silicon-based girlfriend v1 | 4B (según el autor) | no disponible | zh | no disponible | no disponible | Primera iteración de la serie, de menor tamaño |

No se dispone de comparaciones con modelos de rol de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La coherencia multi-turno es la dimensión más débil y la única en la que el modelo no supera al base (4,44 frente a 4,50). El autor atribuye la causa a que el 9,9% del corpus de SFT contiene diálogos donde el personaje copia literalmente un turno anterior; el corpus se limpió el 2026-09-17, pero este modelo se entrenó con la versión previa.
- Contenido adulto explícito: no apto para menores ni para plataformas con políticas de contenido restrictivas.
- No es fiable para consultas factuales; el propio autor lo desaconseja para ese uso.
- La aritmética, aunque obtiene un 85% en GSM8K, no es una capacidad utilizable en producción como calculadora.
- La visión falla al leer números de dos dígitos ("42" se lee como "4").
- Solo chino: no hay soporte documentado de castellano ni de otros idiomas, más allá de que el modelo base sea multilingüe.
- Distancia considerable con modelos comerciales grandes: 54% de la puntuación de Kimi K2.6 con el mismo juez, con la brecha concentrada en memoria multi-turno y variación textual.
- Las puntuaciones absolutas no son comparables entre jueces distintos.
- Licencia Apache-2.0 heredada del base, pero el autor recomienda verificar el cumplimiento normativo y las políticas de la plataforma antes de usar el modelo, dado su contenido.
- El corpus de entrenamiento es sintético y el autor lo declara solo para investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2-GGUF
- Versión v2.1 en GGUF: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2.1-GGUF
- Adapter v2: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2
- Adapter v2.1: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2.1
- Dataset: https://huggingface.co/datasets/RX5950XT/silicon-based-girlfriend-dataset
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- GGUF del base (origen del módulo de visión): https://huggingface.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF
