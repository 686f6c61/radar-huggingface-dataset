# sigmanih/Qwen-Qwen3.8-27B-GGUF-Q4_K_M

## Resumen

Qwen-Qwen3.8-27B-GGUF-Q4_K_M es una cuantización GGUF en formato Q4_K_M del modelo base Qwen/Qwen3.8-27B, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. El repositorio contiene únicamente los pesos cuantizados (16,8 GB en total, 15,66 GB de pesos), no un modelo entrenado desde cero: se trata de una redistribución optimizada para inferencia en llama.cpp y motores compatibles con GGUF. El modelo base cuenta con 27.320.697.856 parámetros según los safetensors originales.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 27B de parámetros con una ventana de contexto declarada de 262.144 tokens en hardware de consumo de gama alta (GPU de 24 GB VRAM o configuraciones híbridas CPU/GPU con 32-64 GB de RAM). La cuantización Q4_K_M reduce el peso a aproximadamente 4 bits por parámetro manteniendo una calidad razonable para tareas conversacionales y de razonamiento.

No obstante, conviene señalar que la model card incluye afirmaciones de rendimiento (benchmarks, evaluación de tool calling) generadas por la herramienta de publicación del autor, con protocolos no estándar y muestras reducidas, por lo que deben interpretarse con cautela. La licencia figura como "other" y los idiomas declarados son inglés e italiano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (identificador `qwen35` según model card); 65 capas, dimensión oculta 5120 |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (declarado en model card) |
| Tipos de cuantización | Q4_K_M (esta publicación); el modelo base podría ofrecer otras, no disponible |
| Idiomas soportados | Inglés (en), italiano (it) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como una arquitectura transformer con identificador `qwen35`, 65 capas y dimensión oculta de 5120. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card no documenta innovaciones técnicas específicas del modelo base (como decodificación especulativa o atención lineal) más allá de la ventana de contexto declarada de 262.144 tokens.

Esta publicación concreta es una cuantización Q4_K_M realizada con llama.cpp. No aporta información sobre el proceso de entrenamiento original; se limita a redistribuir los pesos del modelo base Qwen/Qwen3.8-27B en un formato optimizado para inferencia con menor huella de memoria. La model card menciona una herramienta denominada SigmaEngine y Sigma Studio Training Lab, pero no detalla metodología de cuantización más allá del formato Q4_K_M estándar.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo dual declarado: respuesta directa (No-Thinking) y cadena de pensamiento (Deep Thinking CoT).
- Razonamiento matemático y resolución de problemas de varios pasos (según benchmarks declarados en GSM8K y MATH).
- Generación de código en Python (HumanEval y MBPP evaluados según la model card).
- Tool calling / function calling: la model card declara un 94,6% de adherencia al protocolo de herramientas en un sandbox de prueba.
- Capacidades de agente con ejecución de acciones en sistema de archivos dentro de un entorno aislado (Sandbox Jail).
- Soporte multilingüe limitado a inglés e italiano según los metadatos.
- Ventana de contexto larga de hasta 262.144 tokens (declarada).

## Casos de uso

- Asistencia conversacional de contexto largo: con 262.144 tokens de ventana declarada, el modelo puede mantener conversaciones o procesar documentos extensos (informes, expedientes) sin truncar, aunque el rendimiento real en contextos muy largos no está verificado en la información disponible.
- Generación y refactorización de código en Python: los benchmarks declarados de HumanEval (100% en 7 preguntas) y MBPP (67% en 9 preguntas) sugieren utilidad para tareas de programación, aunque la muestra es muy reducida.
- Automatización de agentes con tool calling: la model card reporta un 94,6% de adherencia a esquemas de herramientas, lo que lo hace candidato para pipelines de agentes que invocan APIs registradas, con la cautela de que la tasa de finalización autónoma de tareas se reporta como 0,0%.
- Razonamiento matemático asistido: el modo Deep Thinking CoT está orientado a problemas de matemáticas y lógica dura, con un delta declarado de +4,2% frente al modo directo.
- Despliegue en hardware de consumo: al ocupar aproximadamente 16,8 GB de VRAM con offload completo, puede ejecutarse en una RTX 3090 o RTX 4090 (24 GB) para prototipos, demos y entornos de desarrollo local.
- Procesamiento de documentación técnica en inglés o italiano: el soporte declarado de ambos idiomas permite tareas de resumen, extracción y respuesta sobre documentación en esos idiomas.
- Evaluación y experimentación con cuantizaciones: útil para investigadores que comparan la calidad de Q4_K_M frente al modelo base en tareas concretas antes de decidir un despliegue.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y fueron medidos sobre muestras reducidas (79-100 preguntas en total), con protocolo propio y hash de reproducibilidad declarado. No son comparables con ejecuciones de suite completa.

| Benchmark | Resultado | Preguntas | Estado declarado |
|---|---|---|---|
| ARC-Challenge | 100% | 9/9 | Passed |
| BIG-Bench Hard | 86% | 6/7 | Passed |
| GPQA | 56% | 5/9 | Fair |
| GSM8K | 100% | 9/9 | Passed |
| HellaSwag | 67% | 6/9 | Fair |
| HumanEval (pass@1) | 100% | 7/7 | Passed |
| MATH | 89% | 8/9 | Passed |
| MBPP | 67% | 6/9 | Fair |
| MMLU | 57% | 8/14 | Fair |
| MMLU-Pro | 78% | 7/9 | Passed |
| TruthfulQA | 89% | 8/9 | Passed |
| Total agregado | 79% | 79/100 | — |

Comparativa de modos de razonamiento declarada por el autor:

| Modo | Precisión | Preguntas superadas |
|---|---|---|
| No-Thinking (respuesta directa) | 77,2% | 44/57 |
| Deep Thinking (CoT) | 81,4% | 35/43 |

Advertencia: la propia model card indica que las puntuaciones se midieron sobre una porción del dataset y no sobre la suite completa, por lo que no son comparables con resultados de suite completa publicados por otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,8 GB con offload completo en GPU; aproximadamente 16,6 GB de RAM en modo CPU o híbrido.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB VRAM) según la model card; para mayor margen, A100 o H100.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más de VRAM (RTX 3090, RTX 4090). En GPUs de 16 GB requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y motores compatibles con GGUF como Ollama o llama-cpp-python. Compatibilidad con vLLM o TGI no está confirmada en la información disponible (vLLM requiere adaptadores específicos para GGUF).
- Latencia y throughput: no disponibles. La model card menciona perfiles de latencia cualitativos (modo directo con menor latencia, modo CoT con más tokens de razonamiento) pero no cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-Qwen3.8-27B-GGUF-Q4_K_M (este) | 27,3B | 262.144 | other | GGUF Q4_K_M | Cuantización de comunidad; benchmarks sobre muestra reducida |
| Qwen/Qwen3.8-27B (base) | 27,3B | 262.144 (declarado) | no disponible | safetensors | Modelo original sin cuantizar; referencia de calidad |
| Alternativas de ~27-32B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

No se dispone de información verificada sobre modelos alternativos de la misma categoría (tamaño y tarea) en el material proporcionado, por lo que la comparativa cuantitativa queda incompleta.

## Limitaciones y advertencias

- Los benchmarks de la model card se calcularon sobre muestras muy pequeñas (7-14 preguntas por benchmark) y con protocolo propio; no son comparables con evaluaciones de suite completa ni con resultados publicados por otros modelos.
- La tasa de finalización autónoma de tareas en el benchmark de agentes se declara como 0,0% (0/1 escenarios), lo que contradice parcialmente la utilidad práctica para flujos de agente autónomos.
- La licencia "other" no está detallada en la información disponible; es imprescindible verificar los términos del modelo base Qwen/Qwen3.8-27B antes de cualquier uso comercial.
- Idiomas declarados limitados a inglés e italiano; no hay evidencia de soporte de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a modelos de lenguaje; el resultado de TruthfulQA (89% sobre 9 preguntas) no es evidencia suficiente para descartarlo.
- La ventana de contexto de 262.144 tokens está declarada pero no se ha verificado el rendimiento efectivo en contextos largos (degradación típica en la práctica).
- El repositorio es una cuantización de comunidad, no una publicación oficial de Qwen; la calidad de la cuantización y la integridad de los pesos no están auditadas por el equipo original.
- La model card contiene afirmaciones de marketing y métricas generadas automáticamente por la herramienta Sigma Studio; tratar con escepticismo.
- El rendimiento en tareas de código se basa en muestras de 7-9 preguntas; la fiabilidad en producción no está demostrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Sigma Studio (herramienta del autor): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
