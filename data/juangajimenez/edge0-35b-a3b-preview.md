# Juangajimenez/Edge0-35B-A3B-preview

## Resumen

Edge0-35B-A3B-preview es una adaptación de inferencia en el borde (edge inference) del modelo base Qwen3.6-35B-A3B, publicada por el usuario Juangajimenez en HuggingFace bajo el identificador `Juangajimenez/Edge0-35B-A3B-preview` (la model card del autor referencia también la organización `Edge0` y el repositorio `Edge0-AI/edge0`). Se trata de un checkpoint MoE disperso de 34.660.610.688 parámetros totales (aproximadamente 34,6B) con 256 expertos y 4 activos por token (K=4), cuantizado a 4 bits y acompañado de adaptadores LoRA y un "prerouter" entrenados específicamente para el framework edge0.

El problema que resuelve es el de ejecutar un modelo de clase 35B en memoria de clase teléfono: el checkpoint completo permanece en almacenamiento y los pesos de los expertos se transmiten bajo demanda, de modo que solo los pesos activos residen en RAM. El autor reporta un pico de memoria activa de 2,9 GiB y una velocidad de decodificación de 14,9 a 17,7 tok/s sobre un Mac mini M4 Pro con 24 GB, sin sharding ni descarga previa de los pesos a memoria.

Es relevante ahora porque combina tres mecanismos poco habituales en un mismo paquete: offload de expertos a SSD, un prerouter entrenado que predice el enrutamiento de expertos un paso por delante (hasta +59% de throughput de decodificación) y una destilación Recover-LoRA que mantiene la pérdida de calidad en 3,9 puntos de media frente al modelo base en fp16. La licencia es Apache 2.0. Se trata de una versión preview (0 descargas y 0 likes en el momento de la consulta), con capacidad agéntica todavía débil y backend MLX limitado a Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (transformer con mezcla de expertos), 40 capas, hidden size 2048 |
| Parametros totales | 34.660.610.688 (34,6B) |
| Parametros activos | Aproximadamente 3B por token segun la nomenclatura A3B; 4 expertos activos de 256 (K=4) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (int4) del checkpoint base; adaptadores LoRA y prerouter sin fusionar |
| Idiomas soportados | no disponible (la model card indica que esta afinado principalmente para los idiomas del modelo base, sin enumerarlos) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (checkpoint base int4 + `lora_edge0_35b.safetensors` + `prerouter_edge0_35b.safetensors`) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Framework de inferencia | edge0 (backend MLX) |
| Tamano del repositorio | 19,7 GB |
| Biblioteca declarada | mlx |
| Pipeline | text-generation |
| Etiquetas adicionales | moe, edge-inference, prerouter, lora, ssd-offload, conversational, 4-bit, region:us |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE disperso heredado de Qwen3.6-35B-A3B: 40 capas, hidden size 2048 y una capa de mezcla con 256 expertos de los que se activan 4 por token (K=4). Sobre ese modelo base, el pipeline edge0 aplica tres componentes propios. El primero es el offload de expertos a SSD: los pesos de los expertos se transmiten desde almacenamiento a medida que el router los selecciona, de forma que la memoria pico queda acotada por el conjunto activo y no por el recuento total de parámetros. El segundo es un prerouter, una cabeza entrenada que predice el enrutamiento de expertos un paso por delante para solapar las cargas con el forward pass en lugar de bloquearlo, con una ganancia declarada de hasta +59% en throughput de decodificación que crece con la latencia del almacenamiento, el tamano del modelo y el ancho enrutado K.

El tercer componente es Recover-LoRA: la base int4 permanece congelada y los adaptadores LoRA se entrenan por destilación desde el profesor en fp16, recuperando la mayor parte de la pérdida de cuantizacion. Los adaptadores no se fusionan en la base, de modo que un único checkpoint de solo lectura puede servir varios conjuntos de adaptadores sin recuantizar. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; únicamente se documenta la destilación de los adaptadores y la evaluación comparativa hecha con OpenCompass bajo parámetros idénticos para ambos modelos.

## Capacidades

- Generación de texto y conversación multilingüe (chat), con plantilla de chat incluida por el autor.
- Modo de razonamiento con "thinking mode" habilitado por la plantilla de chat incluida.
- Razonamiento matemático de competición: 86,6 en AIME 2026 en la versión int4.
- Generación de código: 90,9 en HumanEval en la versión int4.
- Razonamiento científico de nivel experto: 79,8 en GPQA-Diamond en int4.
- Conocimiento general y razonamiento multidisciplinar: 81,0 en MMLU-Pro y 57,9 en IFBench (seguimiento de instrucciones) en int4.
- Servicio mediante API HTTP compatible con OpenAI a través de `edge0 serve`, apto para integración en aplicaciones cliente.
- Capacidad agéntica limitada: el autor indica explícitamente que esta preview no está optimizada para uso de herramientas, planificación multi-paso ni autonomía de horizonte largo, y que estas capacidades se reforzarán en la versión completa.
- No se documenta soporte de visión ni audio.

## Casos de uso

- Inferencia en el borde y en dispositivo: el checkpoint completo int4 reside en almacenamiento y los expertos se transmiten bajo demanda, por lo que solo se necesitan 2,9 GiB de memoria activa más la caché KV; encaja en equipos con VRAM escasa pero almacenamiento rápido (NVMe o flash interno).
- Asistente conversacional local en estaciones Apple Silicon: con 14,9 a 17,7 tok/s de decodificación y 113 a 140 tok/s de prefill, es viable una experiencia interactiva en un Mac mini M4 Pro de 24 GB sin GPU dedicada.
- Servicio por lotes en una única máquina de gama commodity: una base de solo lectura puede servir varios conjuntos de adaptadores LoRA sin recuantizar, lo que permite mantener variantes especializadas sobre el mismo checkpoint int4.
- Generación y revisión de código en flujos de desarrollo: con 90,9 en HumanEval puede emplearse para autocompletado, explicación de fragmentos y generación de pruebas, integrándose mediante la API compatible con OpenAI que expone `edge0 serve`.
- Tutoría y resolución de problemas de matemáticas y física: los 86,6 de AIME 2026 y los 79,8 de GPQA-Diamond permiten usarlo como apoyo en problemas de razonamiento cuantitativo con explicación paso a paso en modo thinking.
- Despliegue en entornos con restricciones de memoria y sin aceleradores: al no requerir sharding ni descarga previa de pesos a RAM, es adecuado para dispositivos con presupuesto de memoria fijo y almacenamiento persistente.
- Procesamiento de instrucciones estructuradas de complejidad media: los 57,9 de IFBench lo sitúan como opción razonable para tareas de transformación de texto guiadas por instrucciones, siempre que no se exija planificación multi-paso.
- Evaluación e investigación de técnicas de offload de expertos: el paquete incluye el prerouter separado, lo que permite medir el efecto del enrutamiento predictivo frente al enrutamiento reactivo sobre el mismo checkpoint.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con OpenCompass bajo ajustes y parámetros idénticos para ambos modelos. Escala máxima 100.

| Benchmark | edge0-35b (int4) | Qwen3.6-35B-A3B (fp16) | Diferencia |
|---|---:|---:|---:|
| AIME 2026 | 86,6 | 92,7 | -6,1 |
| HumanEval | 90,9 | 95,1 | -4,2 |
| GPQA-Diamond | 79,8 | 81,8 | -2,0 |
| MMLU-Pro | 81,0 | 84,6 | -3,6 |
| IFBench | 57,9 | 61,7 | -3,8 |
| Media | 79,2 | 83,2 | -3,9 |

Rendimiento medido con `examples/bench.py` en un Mac mini M4 Pro de 24 GB:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion | 14,9 - 17,7 tok/s |
| Throughput de prefill (frio / caliente) | 113 / 140 tok/s |
| Memoria activa pico | 2,9 GiB |
| Ganancia del prerouter en decodificacion | hasta +59% |

Nota del autor: las cifras corresponden a contextos cortos; los contextos largos anaden caché KV. Los pesos de los expertos se transmiten desde SSD bajo demanda y no son residentes.

## Requisitos de hardware

- Memoria activa pico: 2,9 GiB con contextos cortos, según medición del autor en Mac mini M4 Pro de 24 GB. La caché KV crece con la longitud de contexto, por lo que contextos largos elevan ese pico.
- Almacenamiento: el repositorio ocupa 19,7 GB y debe residir en almacenamiento rápido, ya que los expertos se transmiten desde disco bajo demanda (se recomienda NVMe o flash interno).
- Hardware validado: Mac mini M4 Pro con 24 GB de memoria unificada. No se documentan pruebas en otras GPU (A100, H100, RTX 4090) ni en hardware x86.
- Cabe en GPU de consumo: no disponible. El backend MLX está orientado a Apple Silicon; el autor indica que otros backends están en la hoja de ruta de edge0.
- Opciones de despliegue: framework edge0 con backend MLX (`edge0 chat` para uso interactivo y `edge0 serve --port 8085` para una API HTTP compatible con OpenAI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificación de 14,9 a 17,7 tok/s y prefill de 113 tok/s en frío y 140 tok/s en caliente, sobre el hardware indicado anteriormente.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Memoria activa | Media de benchmarks | Licencia |
|---|---|---|---:|---:|---|
| Edge0-35B-A3B-preview | 34,6B totales, ~3B activos | int4 + LoRA | 2,9 GiB | 79,2 (int4) | Apache 2.0 |
| Qwen3.6-35B-A3B (fp16) | 34,6B totales, ~3B activos | fp16 | no disponible (requiere pesos residentes) | 83,2 | Apache 2.0 (segun modelo base) |
| Edge0-8b-a1b-preview | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

Alternativas de otros fabricantes con offload de expertos a almacenamiento: no disponible en la informacion proporcionada. La comparación directa más fiable es contra el propio modelo base en fp16, que cede 3,9 puntos de media a cambio de reducir el requisito de memoria de pesos residentes a 2,9 GiB.

## Limitaciones y advertencias

- Estado preview: cobertura y calidad todavía en extensión; el repositorio acumula 0 descargas y 0 likes, sin validación independiente de la comunidad.
- Capacidad agéntica débil por diseño: el autor advierte que el uso de herramientas, la planificación multi-paso y la autonomía de horizonte largo no están optimizados en esta versión.
- Pérdida de calidad por cuantizacion: 3,9 puntos de media frente al modelo base en fp16, con un máximo de 6,1 puntos en AIME 2026.
- Limitación de idioma: la model card no enumera idiomas soportados y solo indica que está afinado principalmente para los idiomas del modelo base; el rendimiento fuera de ellos no está documentado.
- Longitud de contexto no especificada: el crecimiento de la caché KV con contextos largos rompe el presupuesto de 3 GiB de memoria activa, por lo que se recomiendan contextos cortos.
- Dependencia de hardware y framework: el backend MLX está limitado actualmente a Apple Silicon; no hay soporte documentado para CUDA, ROCm ni otros runtimes de inferencia.
- Dependencia de almacenamiento: el rendimiento depende de la latencia del disco; en almacenamiento lento el offload de expertos puede degradar el throughput de forma notable.
- Riesgo de alucinacion: no disponible de forma específica; no se documentan tasas de alucinación ni mecanismos de mitigación en la model card.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluación de sesgo o seguridad.
- Licencia: Apache 2.0, por lo que el uso comercial está permitido, sujeto a las condiciones de la licencia y a las obligaciones que esta impone (atribución y conservación de avisos).
- Reproducibilidad: todos los benchmarks y mediciones de rendimiento proceden del propio autor, sin verificación por terceros.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/Juangajimenez/Edge0-35B-A3B-preview
- Página de HuggingFace citada en la model card: https://huggingface.co/Edge0/Edge0-35b-a3b-preview
- Modelo hermano de menor tamano citado en la model card: https://huggingface.co/Edge0/Edge0-8b-a1b-preview
- Repositorio del framework edge0: https://github.com/Edge0-AI/edge0
- Documentación del framework: https://github.com/Edge0-AI/edge0#documentation
- Licencia Apache 2.0 del proyecto: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Herramienta de evaluación OpenCompass: https://github.com/open-compass/opencompass

Nota sobre la búsqueda web: los resultados devueltos tratan sobre mise en forme conditionnelle en Excel y no guardan relación con este modelo, por lo que no se incluyen como enlaces relevantes.
