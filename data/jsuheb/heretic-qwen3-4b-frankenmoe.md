# jsuheb/Heretic-Qwen3-4B-frankenmoe

## Resumen

Heretic-Qwen3-4B-frankenmoe es un modelo experimental publicado por el usuario jsuheb en Hugging Face, construido mediante la fusión de cinco variantes "heretic" (abliterated o desbloqueadas) de la familia Qwen3-4B: dos derivadas de Qwen3-4B-Instruct-2507, dos de Qwen3-4B-Thinking-2507 y una de Qwen3-4B-Base. El resultado se empaqueta como un modelo de arquitectura `qwen3_moe` con 14.781.318.656 parámetros totales, generado con herramientas de merge tipo mergekit/lazymergekit.

La propuesta del modelo es convertir varios expertos de 4B en un único MoE sintético ("frankenmoe"), de modo que la inferencia active solo una fracción de los parámetros en cada paso. Es un artefacto de investigación orientado a explorar técnicas de model merging y arquitecturas MoE artificiales, no un modelo con entrenamiento propio ni evaluación publicada.

Es relevante ahora precisamente por su carácter experimental: ilustra cómo la comunidad combina variantes desbloqueadas de Qwen3 con técnicas de merge para producir modelos con mayor capacidad aparente sin reentrenamiento. No obstante, carece de benchmarks, de documentación de dataset y de garantías de calidad, y su acceso está restringido en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_moe (MoE sintético construido por merge) |
| Parámetros totales | 14.781.318.656 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada de la familia Qwen3, sin confirmar) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el producto de un merge de cinco checkpoints. Los tags indican `mergekit` y `lazymergekit`, y la arquitectura declarada es `qwen3_moe`, lo que sugiere que el merge convierte las capas densas de los modelos Qwen3-4B de origen en una estructura de mezcla de expertos, presumiblemente con enrutamiento por token. Los modelos fuente son variantes "heretic" (abliterated) de Qwen3-4B-Instruct-2507, Qwen3-4B-Thinking-2507 y Qwen3-4B-Base, cada una con sesgos de alineación eliminados por sus respectivos autores.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el proceso de merge (los modelos base sí los tuvieron, pero no se documenta el pipeline de fusión). Tampoco se detalla la configuración exacta del merge (método, pesos, capas afectadas) ni el número de expertos por capa. La innovación principal es la propia construcción del MoE por fusión, una técnica que busca combinar capacidades de varios modelos sin coste de entrenamiento, aunque con riesgo de degradación de coherencia.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3-4B-Instruct y Qwen3-4B-Thinking, aunque el merge puede alterar su comportamiento.
- Modo thinking: incorpora variantes Thinking-2507, por lo que podría soportar razonamiento explícito en cadena, sin confirmación documentada.
- Código y matemáticas: capacidades propias de Qwen3-4B, no verificadas tras el merge.
- Tool calling / function calling: no documentado; Qwen3 lo soporta, pero no hay garantía en este merge.
- Agentes y razonamiento multi-paso: no documentado.
- Multilingüismo: no disponible; los idiomas no están declarados en la ficha.
- Capacidades especiales (visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación en model merging: usar el modelo como banco de pruebas para estudiar cómo afecta la fusión de cinco checkpoints a la coherencia y al enrutamiento de un MoE sintético, comparando salidas con los modelos fuente.
- Experimentos de ablación y alineación: analizar el efecto de combinar variantes "heretic" sobre el comportamiento del modelo en tareas sensibles, siempre en entornos controlados y con revisión ética.
- Generación de texto creativo sin restricciones: el carácter abliterated de las fuentes lo hace adecuado para explorar estilos y contenidos que los modelos alineados rechazan, con supervisión humana.
- Prototipado de razonamiento en cadena: aprovechar las variantes Thinking para experimentar con cadenas de razonamiento en tareas de lógica y matemáticas, validando manualmente los resultados.
- Evaluación comparativa de arquitecturas MoE artificiales: medir latencia y calidad frente a Qwen3-4B denso para determinar si el merge aporta ventajas reales.
- Docencia y divulgación: ilustrar en talleres cómo se construye un MoE por fusión y qué limitaciones tiene, usando el repositorio como ejemplo práctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 29,6 GB (tamaño del repo), por encima de una RTX 4090 de 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 15-16 GB, viable en RTX 4090, RTX 3090 o A6000.
- VRAM estimada en cuantización de 4 bits: en torno a 8-9 GB, viable en RTX 4070 Ti, RTX 4080 o superiores.
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090/3090 para 8 bits; consumer de gama alta para 4 bits.
- Despliegue: al no haber GGUF publicado, sería necesario convertir los safetensors; opciones viables serían vLLM o TGI (si soportan `qwen3_moe`), llama.cpp/Ollama tras conversión a GGUF, y transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Heretic-Qwen3-4B-frankenmoe | 14,78B (MoE sintético) | no disponible | apache-2.0 | Gated en HF |
| Qwen3-4B-Instruct-2507 | 4B | 256K (según Qwen) | apache-2.0 | Público en HF |
| Qwen3-4B-Thinking-2507 | 4B | 256K (según Qwen) | apache-2.0 | Público en HF |
| Qwen3-30B-A3B | 30B totales / 3B activos | 256K (según Qwen) | apache-2.0 | Público en HF |

La comparación es aproximada: los datos de contexto de los Qwen3 originales provienen de la documentación oficial de Qwen y no de la ficha de este merge. El frankenmoe no tiene benchmarks que permitan comparar rendimiento con los modelos densos de 4B ni con el MoE oficial de 30B.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación publicada: no hay evidencia de que el merge preserve la calidad de los modelos fuente.
- Riesgo elevado de alucinación y degradación de coherencia por la fusión de cinco checkpoints con comportamientos distintos.
- Modelos fuente "heretic"/abliterated: sesgos de alineación eliminados, mayor probabilidad de contenido tóxico, sesgado o inseguro; no apto para producción sin filtros.
- Idiomas no declarados: no se garantiza un rendimiento multilingüe fiable.
- Contexto no confirmado: aunque Qwen3 soporta ventanas largas, el merge no documenta la longitud efectiva.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado.
- Licencia apache-2.0 heredada, pero la naturaleza experimental y la falta de documentación desaconsejan uso comercial sin validación previa.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en hardware consumer requiere conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/jsuheb/Heretic-Qwen3-4B-frankenmoe
- Modelo base 1: https://huggingface.co/p-e-w/Qwen3-4B-Instruct-2507-heretic
- Modelo base 2: https://huggingface.co/thewallran/Qwen3-4B-Instruct-2507-heretic
- Modelo base 3: https://huggingface.co/usedcvnt/Qwen3-4B-Thinking-2507-heretic
- Modelo base 4: https://huggingface.co/georgehenney/Qwen3-4B-Thinking-2507-heretic
- Modelo base 5: https://huggingface.co/Lambent/Qwen3-4B-Base-custom-heresy
- mergekit: https://github.com/arcee-ai/mergekit
