# sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q8_0

## Resumen

Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q8_0 es una cuantización en formato GGUF con precisión Q8_0 del modelo Qwen2.5-Coder-14B-Instruct, publicado por el usuario sigmanih a través de su herramienta Sigma Studio. No se trata de un modelo entrenado desde cero, sino de una redistribución del checkpoint oficial de Alibaba Qwen convertido a GGUF de 8 bits, orientada a inferencia local en GPU de consumo y a despliegues con llama.cpp u Ollama.

El modelo base, Qwen2.5-Coder-14B-Instruct, es un transformer causal decoder-only de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) especializado en generación de código, con una ventana de contexto de 32.768 tokens según la model card del repositorio. Está afinado con instrucciones y soporta conversación multi-turno, tool calling y razonamiento paso a paso.

La relevancia de esta ficha concreta es práctica: ofrece los pesos del modelo en un formato listo para ejecutar sin necesidad de convertir safetensors, con un footprint de repositorio de 15,7 GB y un requisito estimado de unos 12,4 GB de VRAM para offload completo en GPU. Es una opción para desarrolladores que quieren un asistente de código local de gama media-alta sin depender de APIs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (CausalLM) |
| Parametros totales | 14.770.033.664 (~14,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según model card del repositorio) |
| Tipos de cuantizacion | Q8_0 (este repositorio); el modelo base admite otras cuantizaciones GGUF/AWQ/GPTQ en repositorios de terceros, no detalladas aquí |
| Idiomas soportados | en, it (según metadatos del repositorio); el modelo base Qwen2.5-Coder está orientado principalmente a inglés y lenguajes de programación |
| Licencia | other (el repositorio declara "other"; la model card muestra un badge Apache-2.0, dato contradictorio no resuelto) |
| Formato de pesos | GGUF (Q8_0) |
| Tamano del repositorio | 15,7 GB |
| VRAM estimada (offload completo) | ~12,4 GB (según model card) |
| RAM estimada (CPU/híbrido) | ~11,5 GB (según model card) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-14B-Instruct es un transformer decoder-only con atención causal estándar, sin mezcla de expertos. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni las fases de alineación (SFT, RLHF o DPO) empleadas por Alibaba Qwen; estos datos no están disponibles en la documentación proporcionada. La model card del repositorio cuantizado tampoco aporta detalles sobre el proceso de conversión a GGUF más allá de indicar que se realizó mediante el módulo Model Hub de Sigma Studio.

La innovación técnica de este repositorio concreto es la cuantización Q8_0, que preserva prácticamente la precisión del modelo en FP16/BF16 a costa de un mayor tamaño en disco (15,7 GB) frente a cuantizaciones más agresivas como Q4_K_M. La model card menciona un "Reasoning Mode Comparison" entre respuesta directa y cadena de pensamiento (CoT), pero no se especifica si ese modo es una capacidad nativa del modelo base o una funcionalidad del motor SigmaEngine; no hay información que permita confirmarlo.

## Capacidades

- Generación de texto y conversación multi-turno en inglés e italiano, según los idiomas declarados en el repositorio.
- Generación y completado de código, con especial énfasis en Python según los benchmarks reportados (HumanEval, MBPP).
- Razonamiento matemático multi-paso (GSM8K, MATH) y razonamiento científico de nivel escolar (ARC-Challenge).
- Soporte de tool calling y function calling, evaluado en la model card mediante un protocolo de agentes en sandbox.
- Ejecución de tareas agénticas multi-paso con uso de sistema de ficheros en entorno aislado (Sandbox Jail).
- Modo de razonamiento con cadena de pensamiento (CoT) frente a respuesta directa, según la comparativa de la model card.
- Capacidad multilingüe limitada a los idiomas declarados (en, it); no se documentan otros idiomas.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistente de código en local: el modelo puede autocompletar y generar funciones Python completas, con un rendimiento reportado de 86% en HumanEval (6/7) y 89% en MBPP (8/9) en la evaluación del autor, lo que lo hace adecuado para entornos de desarrollo sin conexión.
- Integración en pipelines de CI/CD: gracias al soporte de tool calling, puede invocarse desde scripts para generar tests, revisar diffs o proponer parches, siempre con validación humana posterior.
- Agentes autónomos acotados: la model card reporta un 77,2% de adherencia al protocolo de herramientas y un 37,5% de completitud autónoma en 8 escenarios, lo que sugiere uso en tareas de automatización con supervisión y límites claros.
- Atención al cliente técnica: con 32.768 tokens de contexto puede mantener conversaciones multi-turno con documentación extensa adjunta, aunque los idiomas declarados (en, it) limitan su uso en castellano sin evaluación adicional.
- Tutoría de matemáticas y ciencias: los resultados de 100% en GSM8K y ARC-Challenge (9/9 cada uno) en la evaluación del autor indican utilidad para explicar problemas paso a paso, con verificación de resultados.
- Prototipado de razonamiento con CoT: la comparativa No-Thinking (70,2%) frente a Deep Thinking (65,1%) permite experimentar con modos de razonamiento según el coste de latencia aceptable.
- Despliegue en estación de trabajo con GPU de consumo: con ~12,4 GB de VRAM estimados, cabe en una RTX 4070 o RTX 3060 de 12 GB, permitiendo un asistente privado sin enviar código a servicios externos.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y fueron medidos sobre un subconjunto de cada suite, no sobre el conjunto completo; el propio autor advierte que no son comparables con ejecuciones de suite completa. Temperatura 0.0, semilla 42, motor SigmaEngine.

| Benchmark | Dominio | Correctos / Total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 9 / 9 | 100% |
| GSM8K | Matemáticas multi-paso | 9 / 9 | 100% |
| MATH | Matemáticas de competición | 8 / 9 | 89% |
| MBPP | Programación Python con tests | 8 / 9 | 89% |
| HumanEval | Programación Python (pass@1) | 6 / 7 | 86% |
| BIG-Bench Hard | Lógica y simbolismo multi-tarea | 5 / 7 | 71% |
| TruthfulQA | Factualidad y anti-alucinación | 6 / 9 | 67% |
| HellaSwag | Sentido común y NLI situacional | 5 / 9 | 56% |
| MMLU-Pro | Razonamiento multi-paso avanzado | 4 / 9 | 44% |
| MMLU | Conocimiento general multi-materia | 6 / 14 | 43% |
| GPQA | Razonamiento académico de posgrado | 2 / 9 | 22% |
| Total | Todas las suites evaluadas | 68 / 100 | 68% |

Comparativa de modos de razonamiento:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 70,2% | 40 / 57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 65,1% | 28 / 43 | Traza de razonamiento multi-paso, delta de -5,1% |

Métricas del protocolo agéntico (Sandbox Jail):

| Métrica | Resultado | Detalle |
|---|---|---|
| Adherencia al protocolo de herramientas | 77,2% | 71/92 criterios analíticos verificados |
| Completitud autónoma de tareas | 37,5% | 3/8 escenarios completados con fichero objetivo exacto |
| Contención en sandbox | 100% conforme | Cero intentos de escape del workspace |
| Eficiencia de ejecución | 90 turnos (353,7 s) | Uso óptimo de turnos y tokens |

No se han publicado en la información disponible resultados de benchmarks oficiales del modelo base Qwen2.5-Coder-14B-Instruct para comparar directamente.

## Requisitos de hardware

- VRAM estimada para inferencia con offload completo en GPU: ~12,4 GB (Q8_0, según model card).
- RAM estimada para ejecución en CPU o híbrida: ~11,5 GB.
- GPU recomendadas por el autor: 12-16 GB de VRAM, por ejemplo RTX 3060 de 12 GB o RTX 4070.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; en GPUs de 8 GB requeriría offload parcial a CPU y penalización de latencia.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el repositorio declara compatibilidad con endpoints. No se confirma soporte de vLLM o TGI para este formato concreto.
- Latencia y throughput: no disponibles de forma desagregada; la model card reporta 353,7 s para 90 turnos agénticos en el entorno de evaluación, sin especificar la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct (GGUF Q8_0, este repo) | ~14,8 B | 32.768 | other (contradictorio con badge Apache-2.0) | GGUF | Cuantización Q8_0, ~12,4 GB VRAM |
| Qwen2.5-Coder-14B-Instruct (original) | ~14,8 B | 32.768 | Apache-2.0 (según el proyecto Qwen) | safetensors | Requiere conversión o runtime que cargue safetensors |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 | Apache-2.0 (según el proyecto Qwen) | safetensors, GGUF | Menor huella de VRAM, menor capacidad esperada |
| DeepSeek-Coder-V2-Lite-Instruct | ~16 B (MoE, ~2,4 B activos) | 128.000 | licencia propia de DeepSeek | safetensors, GGUF | Arquitectura MoE, contexto mucho mayor |

Los datos de rendimiento de los modelos alternativos no están disponibles en la información proporcionada, por lo que no se incluye comparación numérica de benchmarks.

## Limitaciones y advertencias

- Los benchmarks del autor se midieron sobre subconjuntos reducidos (por ejemplo, 7-14 preguntas por suite) y el propio autor advierte que no son comparables con ejecuciones de suite completa; tómense como indicativos, no como evaluación rigurosa.
- GPQA con 22% y MMLU con 43% indican un rendimiento débil en conocimiento académico avanzado y cultura general; no es un modelo adecuado para preguntas factuales de dominio amplio sin verificación.
- TruthfulQA al 67% sugiere un riesgo no despreciable de alucinación en afirmaciones factuales.
- La licencia del repositorio es "other" y la model card muestra un badge Apache-2.0; esta contradicción debe resolverse consultando la licencia del modelo base Qwen2.5-Coder-14B-Instruct antes de cualquier uso comercial.
- Los idiomas declarados son inglés e italiano; no hay evaluación de rendimiento en castellano, por lo que su uso en producción en español requiere validación propia.
- La completitud autónoma en tareas agénticas es del 37,5% (3/8 escenarios), lo que desaconseja su uso sin supervisión humana en flujos críticos.
- El modo Deep Thinking (CoT) obtuvo peor precisión que la respuesta directa (-5,1%) en la evaluación del autor, un resultado contraintuitivo que conviene verificar en el caso de uso concreto.
- El repositorio tiene 276 descargas y 1 like, con muy poca validación comunitaria; no hay garantía de mantenimiento ni de soporte.
- La cuantización Q8_0 ocupa 15,7 GB en disco, más que alternativas Q4, lo que puede ser un inconveniente en entornos con almacenamiento limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q8_0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
