# open-athena/Marin-Snowball-67B-A2B-v0

## Resumen

Marin Snowball 67B-A2B v0 es un artefacto de investigación publicado por open-athena en HuggingFace. No es un modelo entrenado desde cero, sino el resultado de un merge de modelos: combina el checkpoint base Grug-67B-A2B-Merge-Campaign2-DARE-TIES-02 con el especialista laion/snowball-67b-a2b-relay-sft-allkimi-step1203, orientado a tareas de ingeniería de software y terminal. El resultado conserva la arquitectura de mezcla de expertos (MoE) del base y un total de 67.078.882.816 parámetros.

El objetivo del checkpoint es incorporar capacidades de resolución de tareas SWE y de terminal dentro del base mediante DARE-linear, con densidad 0,20, escala de delta 0,25 y semilla 0. Según la model card, solo el 2,3571081816 % de los escalares difieren del base y el 97,6428918184 % permanece bit a bit sin cambios, lo que lo convierte en un experimento de bajo desplazamiento sobre los pesos originales.

Su relevancia es principalmente metodológica: documenta de forma exhaustiva el proceso de merging, los hashes de los padres y los resultados de benchmarks de desarrollo. No obstante, el autor lo describe explícitamente como un research artifact no evaluado de forma completa y no necesariamente seguro para producción. La longitud de contexto y los idiomas soportados no se documentan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts), etiquetada como `grug_moe`; merge DARE-linear sobre un checkpoint base |
| Parámetros totales | 67.078.882.816 (67,08 B) |
| Parámetros activos | No disponible; es MoE y el sufijo A2B no se cuantifica en la información proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 en almacenamiento; no se documentan variantes GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponibles |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | `safetensors`, sharded con index; BF16 |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. La construcción parte del checkpoint base `open-athena/Grug-67B-A2B-Merge-Campaign2-DARE-TIES-02-2026.10.10`, fijado en el commit `153f5369f69a0c0a7203779099ec94e98c66748f`, y del especialista `laion/snowball-67b-a2b-relay-sft-allkimi-step1203`, fijado en el commit `ff664b48f4c79a81c585dbc9e082b34af3a22b4a`. Se aplica DARE-linear con densidad 0,20, escala de delta 0,25 y semilla 0, dentro de un soporte fijo de expertos enrutados del 12,4860469471 % de los escalares del base.

Tras el almacenamiento en BF16, 1.581.121.835 de los 67.078.882.816 parámetros escalares difieren del base, lo que supone el 2,3571081816 %; el 97,6428918184 % restante permanece bit a bit sin cambios. Todos los archivos no correspondientes a pesos, nombres de tensores, formas, dtypes, distribución de shards e índice se mantienen iguales al base. No se dispone de datos sobre tokens de entrenamiento, composición del dataset, RLHF o DPO para este checkpoint; la información disponible describe únicamente el proceso de merging y la procedencia de los padres. La model card incluye una corrección de publicación del 12 de octubre de 2026 que sustituye la card y la procedencia heredadas del Campaign 2 por la identidad DARE-linear del Campaign 3, sin modificar los pesos publicados.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Resolución de tareas de ingeniería de software: evaluado en SWE-Bench-100 con el arnés mini-swe-agent 2.1.0, con un 33,00 % de acierto en 100 de 100 ensayos declarados.
- Operación en terminal y línea de comandos: evaluado en Terminal-Bench 2.1 con Terminus 2, con un 13,36 % en 262 de 267 ensayos declarados.
- Razonamiento multi-paso y uso de agentes: los benchmarks empleados son arneses agénticos, lo que indica que el modelo puede operar en bucles de herramientas y ejecución, aunque no se documenta soporte explícito de tool calling o function calling.
- Mezcla de expertos: hereda el enrutado y la arquitectura MoE del checkpoint base.
- Capacidades multilingües: no documentadas.
- Visión, audio o modo de pensamiento explícito: no documentados.
- Retención de capacidades no objetivo: no evaluada para este checkpoint.

## Casos de uso

- Reparación automática de issues en repositorios: el modelo puede recibir un issue, inspeccionar el código, generar un parche y ejecutar pruebas dentro de un bucle agéntico. Es adecuado por su especialización SWE y su resultado del 33,00 % en SWE-Bench-100, aunque debe tratarse como candidato a validar, no como solución de producción sin supervisión.
- Automatización de tareas de terminal y DevOps: puede encadenar comandos, interpretar salidas y proponer correcciones en entornos de terminal. Su resultado del 13,36 % en Terminal-Bench 2.1 indica capacidad limitada y necesidad de salvaguardas.
- Asistente de desarrollo en CLI: integrado en herramientas de línea de comandos para leer archivos, proponer ediciones y ejecutar pruebas. El contexto no está documentado, por lo que la gestión de repositorios grandes requeriría fragmentación externa.
- Generación de parches y pruebas de regresión: útil para producir cambios de código y tests asociados en flujos de revisión humana. La naturaleza de research artifact exige validación automática y revisión antes de fusionar cambios.
- Triage y reproducción de errores: puede analizar trazas, reproducir fallos en terminal y proponer una causa probable. Es adecuado para tareas de diagnóstico acotadas, con riesgo de parches incorrectos o alucinaciones en ausencia de evaluación específica.
- Investigación en model merging: sirve como caso de estudio reproducible de DARE-linear con densidad, escala de delta y soporte de expertos documentados. La procedencia incluye auditoría, hashes de padres y verificación de benchmarks.
- Base para experimentos de especialización SWE/Terminal: puede emplearse como punto de partida para nuevos merges o fine-tuning, siempre que se disponga de hardware para 67 B de parámetros y se validen las capacidades no objetivo.
- Integración en pipelines de CI/CD con agentes: puede ejecutarse en un paso de CI para proponer parches o comandos de diagnóstico, pero requiere sandboxing, límites de tiempo y revisión humana debido a que el autor no garantiza seguridad ni evaluación completa.

## Benchmarks y rendimiento

| Modelo | SWE-Bench-100 (%) | Terminal-Bench 2.1 (%) | Suma | Ensayos |
|---|---:|---:|---:|---|
| Marin Snowball 67B-A2B v0 | 33,00 | 13,36 | 46,36 | 100/100 y 262/267 |
| Base Grug-67B-A2B-Merge-Campaign2-DARE-TIES-02 | 27,27 | 9,92 | 37,20 | No disponible |
| Especialista laion/snowball-67b-a2b-relay-sft-allkimi-step1203 | 9,09 | 15,27 | 24,36 | No disponible |
| Candidato serial-01 (Campaign 3) | No disponible | No disponible | 48,17 | No disponible |

Los resultados son de desarrollo, no evidencia sobre un conjunto held-out. La retención de capacidades no objetivo no fue evaluada para este checkpoint. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 134,2 GB, por lo que la inferencia en BF16 requiere más de 134 GB de VRAM considerando pesos, caché KV y overhead.
- GPU recomendadas: 2x H100 80 GB como configuración mínima ajustada; 4x A100 80 GB o 4x H100 80 GB es recomendable para contexto y lotes mayores.
- Cuantización a 8 bits: aproximadamente 67 GB de pesos más overhead; 1x H100 80 GB o 2x A100 40 GB de forma ajustada, sujeto a soporte del runtime.
- Cuantización a 4 bits: aproximadamente 34 GB de pesos más overhead; 1x H100 80 GB o 2x RTX 4090 24 GB con paralelismo, si el runtime soporta la arquitectura. No se publican pesos GGUF oficiales.
- GPU de consumo: no cabe en una sola GPU de 24 GB en BF16; en 4 bits los pesos estimados superan los 24 GB, por lo que se requiere más de una GPU o descarga a CPU.
- Despliegue: `transformers` es la vía declarada. vLLM y TGI no están confirmados para la arquitectura `grug_moe`. llama.cpp u Ollama requerirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | SWE-Bench-100 | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| Marin Snowball 67B-A2B v0 | 67,08 B | No disponible | No disponible | 33,00 % | 13,36 % | OpenMDW 1.1 | HuggingFace público |
| Base Grug-67B-A2B-Merge-Campaign2-DARE-TIES-02 | No disponible (nomenclatura 67B-A2B) | No disponible | No disponible | 27,27 % | 9,92 % | No disponible | HuggingFace público |
| Especialista laion/snowball-67b-a2b-relay-sft-allkimi-step1203 | No disponible (nomenclatura 67B-A2B) | No disponible | No disponible | 9,09 % | 15,27 % | No disponible | HuggingFace público |
| Candidato serial-01 (Campaign 3) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar con modelos de propósito general de tamaño similar. La comparación se limita a los checkpoints padres y al candidato serial-01 documentados en la campaña de merging.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es responsabilidad del usuario.
- Benchmarks de desarrollo: los resultados de SWE-Bench-100 y Terminal-Bench 2.1 no son evidencia held-out y pueden estar influidos por el protocolo y los arneses empleados.
- Retención de capacidades no evaluada: no se ha medido si el merge degrada capacidades distintas de SWE y terminal.
- Idiomas y contexto no documentados: no se puede garantizar un comportamiento multilingüe ni una ventana de contexto concreta.
- Sesgos: no se han publicado evaluaciones de sesgo; el modelo puede heredar sesgos de los checkpoints padres.
- Alucinación: no se ha medido específicamente; en tareas de código y terminal puede generar parches o comandos incorrectos con apariencia plausible.
- Licencia: Open
