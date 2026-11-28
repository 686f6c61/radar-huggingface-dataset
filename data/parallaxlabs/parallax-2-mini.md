# parallaxlabs/parallax-2-mini

## Resumen

Parallax 2 Mini es un modelo de lenguaje de aproximadamente 4.326 millones de parámetros (4,326.350.848 exactamente según los pesos en safetensors) desarrollado por Parallax Labs. Se presenta como el modelo más rápido y ligero de la familia Parallax, orientado a tareas cotidianas de razonamiento e instrucción con alta velocidad de inferencia y bajo consumo de memoria. Está construido sobre el modelo base Qwen/Qwen3.5-4B y emplea una arquitectura híbrida denominada Gated DeltaNet + Attention.

El modelo se distribuye con licencia Apache 2.0 y soporte nativo para transformers, safetensors y GGUF, lo que facilita su despliegue tanto en infraestructura de servidor como en hardware de consumo. Su principal innovación es la combinación de capas de recurrencia lineal (Gated DeltaNet) con capas de atención tradicional, lo que mantiene el consumo de memoria del KV-cache plano en contextos largos y permite servir con alta concurrencia y baja VRAM.

Es relevante ahora porque ofrece un equilibrio poco habitual en la categoría de ~4B: razonamiento con modo "thinking" conmutable, tool calling nativo y velocidades superiores a 90 tokens por segundo en una GPU de consumo (RTX 5070 según el autor), con cuantizaciones que caben desde 2,32 GB (Q3_K_M) hasta 4,61 GB (Q8_0). El autor lo describe explícitamente como una prueba de concepto y avance de modelos futuros de la familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + Attention (transformer con capas de recurrencia lineal) |
| Parámetros totales | 4.326.350.848 (~4,3B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q3_K_M, Q4_K_M, Q6_K, Q8_0; pesos originales en safetensors |
| Idiomas soportados | inglés (etiqueta `language: en` en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Parallax 2 Mini emplea una arquitectura híbrida que combina capas de Gated DeltaNet (un mecanismo de recurrencia lineal con compuertas) con capas de atención convencional. Según el autor, las capas de recurrencia lineal mantienen el KV-cache con memoria plana a lo largo de contextos largos, lo que habilita servicio de alta concurrencia y cuantización del KV-cache con bajo consumo de VRAM. El modelo parte del base Qwen/Qwen3.5-4B, aunque la model card no detalla el proceso de adaptación ni el volumen de datos adicionales empleados.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa. La model card menciona únicamente el modo de razonamiento conmutable (thinking on/off) y el soporte nativo de tool calling como capacidades destacadas del modelo.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones.
- Razonamiento multi-paso con modo "thinking" conmutable: se puede activar para matemáticas, lógica y trazas de ejecución de código, o desactivar para chat de baja latencia y enrutamiento.
- Ejecución y trazado de código (evaluado con CRUXEval Output).
- Conocimiento general y STEM, con especial rendimiento en matemáticas, química y física según los benchmarks del autor.
- Tool calling / function calling nativo: el modelo puede ejecutar búsquedas web, interactuar con el sistema de ficheros y otras herramientas.
- Capacidades multilingües: la model card solo declara inglés; no hay información sobre otros idiomas.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Chat de atención al cliente de baja latencia: con el modo thinking desactivado y cuantización Q4_K_M (2,78 GB), el modelo puede gestionar conversaciones multi-turno en GPUs de consumo con velocidades superiores a 90 tokens/s, adecuado para respuestas instantáneas en entornos de alto volumen.
- Enrutamiento y clasificación de intenciones: al desactivar el razonamiento, el modelo actúa como clasificador rápido dentro de pipelines de agentes, decidiendo qué herramienta o submodelo invocar en cada paso.
- Agentes con tool calling: su soporte nativo de function calling permite construir agentes que ejecuten búsquedas web, lean o escriban ficheros y encadenen llamadas a APIs, con la ventaja de un KV-cache plano que reduce el coste de contextos largos en conversaciones agénticas.
- Asistencia en matemáticas y ciencias: con thinking activado y Q8_0 (4,61 GB), el modelo alcanza un 88,90% en MMLU-Pro Math y un 84,81% en Química según la evaluación del autor, útil para tutores automáticos o resolución de problemas paso a paso.
- Trazado y depuración de código: evaluado en CRUXEval Output (59,25% Pass@1, 82,75% Pass@10), puede emplearse para predecir la salida de fragmentos de código y asistir en tareas de revisión o ejecución mental de programas.
- Despliegue en hardware de consumo y edge: con cuantizaciones desde 2,32 GB, cabe en GPUs de gama media y en equipos con poca VRAM, lo que permite prototipado local, demos offline y aplicaciones embebidas sin depender de la nube.
- Servicio de alta concurrencia: la arquitectura híbrida mantiene el KV-cache plano, lo que lo hace adecuado para servir muchas sesiones simultáneas en un solo servidor con vLLM u otro motor compatible con GGUF.

## Benchmarks y rendimiento

Evaluación local del autor con `lm_eval` v0.4.13 sobre `parallax-2-mini.Q8_0.gguf`, razonamiento activado (temperature=0.6, top_p=0.95, 0-shot):

| Benchmark | Categoría | Métrica | Resultado |
|---|---|---|---|
| CRUXEval Output (800 tareas) | Trazado de ejecución de código | Pass@1 / Pass@10 | 59,25% / 82,75% |
| MMLU-Pro (global, 12.032 preguntas) | Conocimiento general y STEM | Exact Match | 65,81% |
| MMLU-Pro Math (1.351) | Matemáticas | Exact Match | 88,90% |
| MMLU-Pro Business (789) | Negocios y finanzas | Exact Match | 77,74% |
| MMLU-Pro Biology (717) | Biología | Exact Match | 70,71% |
| MMLU-Pro Chemistry (1.132) | Química | Exact Match | 84,81% |
| MMLU-Pro Economics (844) | Economía | Exact Match | 62,56% |
| MMLU-Pro Physics (1.299) | Física | Exact Match | 81,45% |
| MMLU-Pro Psychology (798) | Psicología | Exact Match | 55,01% |
| MMLU-Pro Computer Science (410) | Informática | Exact Match | 66,59% |
| MMLU-Pro Health (818) | Salud | Exact Match | 49,51% |
| MMLU-Pro Other (924) | General / otros | Exact Match | 47,51% |
| MMLU-Pro Philosophy (499) | Filosofía | Exact Match | 45,09% |
| MMLU-Pro Engineering (969) | Ingeniería | Exact Match | 68,83% |
| MMLU-Pro History (381) | Historia | Exact Match | 34,38% |
| MMLU-Pro Law (1.101) | Derecho | Exact Match | 32,70% |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización GGUF: Q3_K_M 2,32 GB; Q4_K_M 2,78 GB; Q6_K 3,56 GB; Q8_0 4,61 GB (tamaños de fichero indicados por el autor; la VRAM real requiere margen adicional para el KV-cache y el runtime).
- GPU recomendadas: el autor reporta pruebas en una NVIDIA RTX 5070 con velocidades superiores a 90 tokens/s. Por tamaño, cabe en GPUs de consumo con 6-8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060/4060/5070 y superiores, especialmente con cuantizaciones Q3_K_M o Q4_K_M.
- Opciones de despliegue: transformers (pesos safetensors), llama.cpp y motores compatibles con GGUF (Ollama, LM Studio), además de vLLM u otros servidores para los pesos originales; la model card menciona compatibilidad con endpoints.
- Latencia y throughput: más de 90 tokens/s en RTX 5070 según el autor; no se proporcionan cifras de latencia ni de throughput para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Parallax 2 Mini | ~4,3B | no disponible | Apache 2.0 | safetensors, GGUF | Híbrido Gated DeltaNet + Attention; thinking conmutable; tool calling nativo |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible en esta ficha | no disponible | Modelo base del que deriva Parallax 2 Mini; sin datos de benchmarks comparativos en la información disponible |
| Alternativas de ~4B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación rigurosa |

No hay datos suficientes en la información proporcionada para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La model card solo declara inglés como idioma; el rendimiento en castellano u otros idiomas no está documentado y podría degradarse notablemente.
- El autor describe el modelo como una prueba de concepto ("proof-of-concept preview"), por lo que su robustez en producción no está avalada por un ciclo de vida estable.
- Riesgo de alucinación inherente a modelos de ~4B: en MMLU-Pro las categorías de Derecho (32,70%), Historia (34,38%) y Filosofía (45,09%) muestran un rendimiento bajo, lo que desaconseja su uso sin verificación en dominios especializados.
- Los benchmarks son autoevaluados por el autor con una única configuración (Q8_0, 0-shot, temperature=0.6, top_p=0.95); no hay validación independiente.
- Las cuantizaciones bajas (Q3_K_M) no están recomendadas por el propio autor para reproducir el rendimiento de referencia.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni medidas de seguridad o alineación.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen/Qwen3.5-4B conviene verificar las condiciones de la licencia del modelo base antes de un despliegue comercial.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar aplicaciones con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/parallaxlabs/parallax-2-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
