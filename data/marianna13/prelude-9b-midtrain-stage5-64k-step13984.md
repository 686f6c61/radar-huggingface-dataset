# marianna13/prelude-9b-midtrain-stage5-64k-step13984

## Resumen

Prelude 9B mid-train, stage 5 (64K) es un checkpoint intermedio de mid-training del modelo base OpenEuroLLM Prelude 9B, publicado por el usuario marianna13 en Hugging Face. No se trata de un modelo final ni post-entrenado: es una instantánea del proceso de entrenamiento continuado que el autor denomina "stage 5", con una ventana de contexto de 64K tokens y sin ninguna fase de RL posterior. El repositorio contiene dos ramas (`d1` y `d2`) que aplican la misma receta sobre dos cooldowns de preentrenamiento distintos, diferenciados por la proporción de texto web frente a datos de razonamiento.

El modelo parte de `openeurollm/prelude-base` y emplea una arquitectura transformer densa con 9.094.607.872 parámetros totales (aproximadamente 9B), derivada de la familia Qwen3 según los tags del repositorio. Incorpora un tokenizer ampliado con 6 tokens ChatML adicionales y una plantilla de chat que soporta modo "thinking" (bloque `<think>...</think>`) y modo sin razonamiento explícito. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es fundamentalmente experimental: permite a investigadores inspeccionar el estado intermedio de un pipeline de mid-training a contexto largo (64K) con datos de conversaciones SFT, razonamiento y agentes, y comparar el efecto de dos mezclas de datos de cooldown sobre capacidades de matemáticas, código y uso de herramientas. No está pensado para despliegue en producción tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, segun tags), con RoPE y extension de contexto mediante YaRN |
| Parametros totales | 9.094.607.872 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 64K tokens (stage 5); stages previos entrenados a 16K, 32K, 64K y 128K |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision original; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (los datos de entrenamiento incluyen traducciones a 12 idiomas de Dolci-Think/Instruct, pero no se declara una lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 36,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~9B parámetros construido sobre el base OpenEuroLLM Prelude 9B, que a su vez sigue la arquitectura de la familia Qwen3. El entrenamiento de contexto largo se organiza en cinco etapas: las etapas 1–3 escalan el contexto de 16K a 32K y 64K con RoPE theta de 9M bajo un único schedule coseno de 4.419 pasos sobre unos 3,6B tokens de documentos de mid-training, razonamiento y código; la etapa 4 extiende a 128K mediante YaRN x2 con LR 5e-6 durante 1.001 pasos (1,0B tokens); y la etapa 5, la que corresponde a este checkpoint, vuelve a 64K con un LR constante de 2e-5, batch global de 64 secuencias de 64K y 13.984 pasos, viendo 58,5B tokens (49,2B entrenados).

Los datos de la etapa 5 combinan SFT v2 (37,7B tokens: INTELLECT-3 de razonamiento/chat/herramientas, AgentTrove de agentes de terminal y varios harnesses), conversaciones nuevas (9,4B: trazas completas de OpenThoughts3 limitadas a 4 por prompt, trazas adicionales de INTELLECT-3 en matemáticas, código y ciencia, y Dolci-Think/Instruct traducidos a 12 idiomas) y documentos de mid-training no usados previamente (11,5B: documentos largos de 32K o más, replay de 4K o menos y trayectorias Nemotron-Terminal de 8K o más). El dataset pasó por escaneo de bucles y descontaminación. El entrenamiento se ejecutó en 64 nodos JUPITER con Megatron-LM (TP4) y el checkpoint se exportó a Hugging Face; cada rama incluye un `megatron_export.json` con el checkpoint origen. No hubo RL ni fase de decay en esta etapa.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML y soporte explícito de modo thinking on/off.
- Razonamiento matemático: resuelve problemas de competición (AIME, MATH500) con cadena de pensamiento cuando el modo thinking está activo.
- Generación de código en múltiples lenguajes (MultiPL-E cubre 10 lenguajes) y resolución de problemas tipo HumanEval/MBPP.
- Uso de herramientas y function calling, entrenado con datos de INTELLECT-3 tools y harnesses.
- Comportamiento agéntico de terminal: entrenado con AgentTrove y trayectorias Nemotron-Terminal, evaluado en Terminal-Bench y TBLite.
- Capacidades multilingües parciales: parte del SFT incluye traducciones a 12 idiomas, aunque no se declara una lista oficial de idiomas soportados.
- Contexto largo de 64K tokens para documentos y conversaciones extensas.
- Razonamiento multi-paso con presupuesto de hasta 32K tokens de generación en modo thinking.

## Casos de uso

- Investigación sobre mid-training: el checkpoint permite estudiar cómo evoluciona el rendimiento en matemáticas y código a lo largo de las etapas de entrenamiento y comparar las mezclas de datos `d1` (más texto web) frente a `d2` (más razonamiento), midiendo el impacto en AIME, GPQA y SWE-bench.
- Análisis de datos de razonamiento: al estar entrenado con trazas de OpenThoughts3 e INTELLECT-3, sirve para estudiar estilos de cadena de pensamiento y detectar patrones de bucle ("Wait, ..."), un fenómeno documentado por el autor.
- Prototipado de agentes de terminal en laboratorio: con contexto de 64K y datos de AgentTrove/Nemotron-Terminal, se puede experimentar con flujos de ejecución de comandos y edición de ficheros, aunque los resultados en Terminal-Bench (1,5–3,0) limitan su uso real.
- Evaluación de recetas de contexto largo: útil para reproducir la progresión 16K→32K→64K→128K y validar estrategias de RoPE/YaRN antes de aplicar la receta a un modelo final.
- Generación de código asistida en entornos de investigación: con HumanEval+ de 78,7–80,5 en modo thinking, puede emplearse para generar parches y funciones en pipelines internos no críticos, siempre con revisión humana.
- Estudio de calibración y alucinación en modelos no post-entrenados: al carecer de RLHF/DPO, es un caso de referencia para medir cómo se comporta un modelo base mid-train en instrucciones y seguridad antes de aplicar alineamiento.
- Comparación de tokenizers y plantillas de chat: la adición de 6 tokens ChatML sobre el tokenizer de Prelude permite evaluar el efecto del formato de conversación en el rendimiento.

## Benchmarks y rendimiento

| Benchmark | d1 | d2 |
|---|---:|---:|
| **Base few-shot (4K)** | | |
| MATH (4-shot) | 49,0 | 50,7 |
| GSM8K (8-shot) | 79,7 | 81,0 |
| MMLU-Pro (5-shot) | 41,1 | 42,3 |
| HumanEval+ | 47,0 | 47,6 |
| MBPP+ (corte en `\nFile:`) | 56,6 | 56,1 |
| MultiPL-E | 30,2 | 31,4 |
| **Chat, thinking on** | | |
| AIME24 | 52,0 | 49,7 |
| AIME25 | 44,7 | 30,0 |
| MATH500 | 83,8 | 84,2 |
| GPQA-Diamond | 49,8 | 52,0 |
| IFEval (prompt) | 78,2 | 77,6 |
| HumanEval+ | 80,5 | 78,7 |
| MultiPL-E (10 idiomas) | 45,7 | 50,8 |
| **Chat, thinking off** | | |
| AIME24 / AIME25 | 21,7 / 14,3 | 10,0 / 5,3 |
| MATH500 | 68,0 | 65,0 |
| GPQA-Diamond | 42,6 | 36,9 |
| IFEval (prompt) | 76,8 | 76,2 |
| HumanEval+ | 63,4 | 70,1 |
| **Agéntico, thinking on (pass@1, media de 3)** | | |
| SWE-bench Verified (100 tareas) | 18,7 | 22,7 |
| Terminal-Bench 2.1 (89 tareas) | 1,5 | 3,0 |
| TBLite (100 tareas) | 5,3 | 7,7 |

Decodificación empleada: thinking on con T=0,6, top-p 0,95 y 32K tokens; thinking off con greedy.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 18,2 GB solo para pesos (9,09B parámetros × 2 bytes), más overhead de activaciones y KV cache; con contexto de 64K el KV cache puede añadir varios GB según configuración.
- En FP8 la huella de pesos baja a ~9,1 GB; en cuantizaciones de 4 bits (no publicadas oficialmente) rondaría los 4,5–5 GB, pero el repo no distribuye GGUF.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para BF16 con contexto completo. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en BF16 pero el contexto de 64K exige cuantización o gestión cuidadosa del KV cache.
- Opciones de despliegue: transformers (soporte nativo, según la model card), text-generation-inference (tag `text-generation-inference`), vLLM y Megatron-LM para entrenamiento. No se documentan integraciones con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Prelude 9B mid-train stage 5 (este) | 9,09B | 64K | Apache-2.0 | Checkpoint intermedio, sin RL; benchmarks propios en la model card |
| OpenEuroLLM Prelude 9B base | no disponible | no disponible | Apache-2.0 | Modelo base del que deriva; sin datos de benchmarks en la información disponible |
| Qwen3 (familia, referencia arquitectónica) | no disponible | no disponible | no disponible | El repo etiqueta el modelo como `qwen3`; no se dispone de cifras comparables en la información proporcionada |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- No es un modelo final ni post-entrenado: no ha pasado por RLHF ni DPO, por lo que su comportamiento en instrucciones y seguridad no está alineado.
- Bucles matemáticos con thinking on: en AIME el modelo entra en repetición exacta en un 2,7 % (AIME24) y un 5,3 % (AIME25) de las muestras en la rama d2, consumiendo los 32K tokens de presupuesto. Proviene del estilo de razonamiento de OpenThoughts3.
- Run-on en code few-shot base: las completaciones continúan en documentos tipo repositorio (`File: ...`); hay que cortar en `\nFile:` antes de evaluar.
- Razonamiento matemático débil con thinking off (AIME24 10,0–21,7; AIME25 5,3–14,3), muy inferior al modo thinking on.
- LR constante sin decay en la etapa 5: el autor espera que un decay corto (etapa 6, hasta 1e-6) mejore las puntuaciones, por lo que los números actuales son pesimistas respecto al modelo final.
- Riesgo de alucinación inherente a un modelo base sin alineamiento; no apto para producción sin post-entrenamiento y evaluación adicional.
- Idiomas soportados no declarados oficialmente, aunque parte del SFT incluye 12 idiomas.
- Licencia Apache-2.0 permite uso comercial, pero al ser un checkpoint intermedio sin garantías, el autor no lo recomienda como modelo final.
- Solo 18 descargas y 0 likes en el momento de la ficha: ecosistema mínimo, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/marianna13/prelude-9b-midtrain-stage5-64k-step13984
- Modelo base: https://huggingface.co/openeurollm/prelude-base
