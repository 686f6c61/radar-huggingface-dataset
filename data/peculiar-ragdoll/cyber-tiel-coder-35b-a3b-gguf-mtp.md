# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-GGUF-MTP (abreviado como CyberTiel) es un modelo de lenguaje y codificación creado por peculiar-ragdoll. Se trata de una cuantización dinámica con iMatrix del modelo Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez es una versión abliterada (sin rechazos) de Ornith-1.5-35B-A3B. El modelo está pensado para tareas de programación agéntica, ofensiva y resolución autónoma de bugs, priorizando velocidad y capacidad de código frente al conocimiento enciclopédico.

Arquitectónicamente es un modelo MoE (mixture of experts) con 35.505 millones de parámetros totales y 3 mil millones activos (A3B). El repositorio ofrece pesos en formato GGUF con un cabezal MTP (multi-token prediction) integrado para habilitar decodificación especulativa en llama.cpp. La longitud de contexto no está documentada en la información disponible. Su licencia es MIT y los idiomas soportados son inglés y chino.

La relevancia del modelo radica en que combina un tamaño reducido y bajo coste de inferencia con un rendimiento notable en SWE-bench-Live, según el autor, resolviendo aproximadamente un 70 % más de problemas reales en repositorios de código que Ornith-1.5 y Qwen3.6-35B-A3B. Además, es una de las primeras variantes de este tamaño en ser ofrecida como modelo sin censura para tareas de ciberseguridad y coding agéntico, con una tasa de rechazo del 0 % en el conjunto HarmBench.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.5 (tags: qwen35moe) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3.000 millones (A3B, según nomenclatura del autor; no se indica el valor exacto) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con iMatrix dinámico y cuantización Q4 (22 GB); lista completa de cuantizaciones no especificada |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (con cabezal MTP para decodificación especulativa; safetensors no incluidos en este repositorio) |

## Arquitectura y entrenamiento

CyberTiel es un modelo MoE perteneciente a la familia Qwen3.5-35B-A3B (según el tag `qwen35moe`). Su base es Huihui-Ornith-1.5-35B-A3B-abliterated, una versión uncensored de Ornith-1.5-35B-A3B. El proceso documentado no es un entrenamiento desde cero, sino una cuantización dinámica con iMatrix (importance matrix) orientada a priorizar habilidades de codificación y agente. Además, se ha añadido un cabezal MTP (multi-token prediction) dentro del archivo GGUF, que permite al modelo predecir varios tokens a la vez y acelerar la generación mediante decodificación especulativa cuando el runtime lo soporta.

El autor indica que se utilizó un chat template denominado "Sharp" y una iMatrix "cyber-weighted" para reforzar las capacidades agénticas y de seguridad ofensiva. No se aportan datos sobre la composición del dataset, el número de tokens de entrenamiento ni uso de RLHF, DPO u otras técnicas de alineación posteriores. La abliteración se aplicó para eliminar los rechazos del modelo base, sin que ello afecte al rendimiento en codificación según los benchmarks reportados.

## Capacidades

- Generación de código y razonamiento agéntico: el modelo destaca en tareas de resolución autónoma de issues y bugs en repositorios grandes, como los evaluados en SWE-bench-Live.
- Seguridad ofensiva y CTF: según el autor, CyberTiel resuelve 15 de 43 tareas del conjunto Cybench sin pistas ni juez externo (35 % de capturas de flags).
- Sin censura: la abliteración elimina los rechazos, mostrando 0 % de rechazo en las 84 solicitudes de HarmBench.
- Soporte de tool calling / function calling: no se documenta de forma nativa en la información disponible; el uso agéntico se refiere principalmente a la capacidad de trabajar de forma autónoma sobre el código.
- Visión: el repositorio está etiquetado como `image-text-to-text` y `vision`, lo que indica capacidades multimodales heredadas del modelo base, aunque no se aportan benchmarks de visión en la documentación.
- Multilingüe: soporta inglés y chino.
- Decodificación especulativa: gracias al cabezal MTP, se pueden aumentar los tokens por segundo en runtimes compatibles (por ejemplo, llama.cpp) en comparación con la versión sin MTP.
- Modo agente y multi-step reasoning: el modelo está optimizado para razonamiento paso a paso en entornos de programación, con tiempos de solución 3-4 veces menores que modelos densos de 3.8B a 27B según el autor.

## Casos de uso

- Resolución autónoma de bugs en repositorios: CyberTiel puede integrarse en sistemas de agentes de código que reciban issues reales, generen parches y verifiquen con tests de regresión, tal como se evalúa en SWE-bench-Live. Su tamaño y velocidad lo hacen adecuado para iteraciones rápidas en entornos de CI/CD.
- Asistente de programación en tiempo real en IDE: desplegado con llama.cpp u Ollama en una GPU de consumo (por ejemplo, RTX 3090/4090), el modelo puede usarse para autocompletar código y sugerir refactorizaciones, aprovechando sus 3 mil millones de parámetros activos para mantener baja la latencia.
- Tareas de ciberseguridad ofensiva y CTF: el modelo está orientado a responder sin rechazos en escenarios de captura de bandera, análisis de vulnerabilidades y escritura de exploits. Debe usarse únicamente en entornos controlados y con autorización explícita.
- Corrección automática de código en pipelines de desarrollo: gracias a su enfoque agéntico, puede ejecutarse como un agente encargado de detectar fallos, proponer cambios y validarlos, reduciendo la intervención humana en tareas repetitivas de mantenimiento.
- Despliegue en hardware con VRAM limitada: la cuantización Q4 ocupa aproximadamente 22 GB, lo que permite ejecutarlo en GPUs de 24 GB como la RTX 3090 o 4090, y en Apple Silicon mediante la versión MLX disponible.
- Aplicaciones multilingües en inglés y chino: el modelo puede emplearse en entornos de desarrollo donde se trabaje con documentación o código en ambos idiomas, manteniendo coherencia terminológica.
- Entrada multimodal de imagen y texto: al estar etiquetado como `image-text-to-text`, podría utilizarse para analizar capturas de errores, diagramas o diseños de interfaz y generar código asociado, siempre que se validen previamente sus capacidades de visión.

## Benchmarks y rendimiento

El autor ha publicado resultados cualitativos y cuantitativos en la model card. Se presentan a continuación los datos disponibles, sin valores absolutos adicionales.

| Benchmark | Resultado reportado |
|---|---|
| SWE-bench-Live | ~70 % más de problemas resueltos que Ornith-1.5-35B-A3B y Qwen3.6-35B-A3B (no se indica la puntuación absoluta) |
| Cybench (unguided) | 15 de 43 flags capturados (35 %) |
| HarmBench | 0 % de rechazo en 84 solicitudes (7 categorías) |
| MMLU-Pro | Igual que Tiel-Coder-35B-A3B (valor numérico no disponible); el autor indica que sacrifica conocimiento del mundo |
| Velocidad en tareas agénticas | 3-4 veces más rápido que modelos densos de 3.8B a 27B (según el autor) |

Nota: los benchmarks se refieren a la cuantización Q4 del modelo; no se aportan resultados para todas las variantes de cuantización.

## Requisitos de hardware

- VRAM estimada: aproximadamente 22 GB para la cuantización Q4, según la model card.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 40 GB o H100; también es viable en GPUs con VRAM de 24 GB y soporte de llama.cpp.
- Compatibilidad con GPU de consumo: sí, siempre que se utilice la variante Q4 y no se supere la VRAM disponible.
- Opciones de despliegue: llama.cpp, Ollama y MLX (para Apple Silicon). El modelo está en formato GGUF, por lo que vLLM y TGI requerirían conversión previa o uso de runtimes compatibles con GGUF.
- Latencia y throughput: no se proporcionan cifras exactas. El autor indica que la cabeza MTP puede aumentar los tokens por segundo si se activa, y que el rendimiento en tareas agénticas es 3-4 veces más rápido que modelos densos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parámetros | SWE-bench-Live | MMLU-Pro | Refusals | Licencia |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-GGUF-MTP | 35,5 B totales / 3 B activos | ~70 % más que Ornith y Qwen3.6 | Igual que TielCoder (valor no disponible) | 0 % en HarmBench | MIT |
| Tiel-Coder-35B-A3B-GGUF | 35,5 B totales / 3 B activos (presumiblemente) | No disponible | Igual que CyberTiel (valor no disponible) | No disponible (versión censored) | MIT |
| Huihui-Ornith-1.5-35B-A3B-abliterated | 35,5 B totales / 3 B activos | Menor que CyberTiel | No disponible | No disponible | No disponible |
| Qwen3.6-35B-A3B | 35 B totales / 3 B activos | Menor que CyberTiel | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La abliteración suprime los rechazos, por lo que el modelo puede generar contenido dañino, ilegal o peligroso. El autor recomienda explícitamente supervisión y sandboxing, y advierte del uso responsable.
- El modelo sacrifica deliberadamente conocimiento del mundo: su rendimiento en MMLU-Pro es bajo y no es adecuado para tareas de trivia, exámenes o información general.
- La longitud de contexto no está documentada. Antes de utilizar el modelo en aplicaciones con dependencia de contexto extenso es necesario validarla experimentalmente.
- Los idiomas soportados se limitan a inglés y chino. No se garantiza un comportamiento correcto en otros idiomas.
- El soporte de tool calling no está documentado de forma nativa. La capacidad de agente se basa en la autonomía para tareas de código, no en una API formal de funciones.
- No se han publicado evaluaciones de seguridad de la IA más allá de HarmBench; se desconocen sesgos específicos, riesgos de alucinación o comportamientos adversos en otros dominios.
- Los benchmarks reportados corresponden a la cuantización Q4 y pueden variar en otras cuantizaciones o en el modo no especulativo.
- El uso en producción conlleva riesgos legales y de seguridad por la naturaleza uncensored del modelo; se recomienda aplicar controles de salida y políticas de uso de acuerdo con la normativa aplicable.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad del modelo para fines comerciales específicos.

## Enlaces

- Repositorio principal: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Versión GGUF sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Versión MLX: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Versión MLX con MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Alternativa censored: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Qwen Sharp Chat Templates: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Alternativa para tareas de conocimiento: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
