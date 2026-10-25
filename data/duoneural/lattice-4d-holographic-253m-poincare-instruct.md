# DuoNeural/Lattice-4D-Holographic-253M-Poincare-Instruct

## Resumen

Lattice-4D-Holographic-253M-Poincare-Instruct es un modelo de generación de texto desarrollado por DuoNeural Research Lab que aplica una arquitectura poco convencional: un mixture-of-experts (CDM-MoE) definido sobre una variedad de Poincaré con curvatura AdS aprendible por capa, en lugar del transformer euclídeo estándar. El modelo se obtiene por destilación de HuggingFaceTB/SmolLM2-1.7B-Instruct sobre los datasets SmolTalk y FineWeb-Edu, y se presenta como el resultado de referencia ("all-time lab record") de la familia Lattice, con un BPB de validación de 0.6692.

El interés técnico está en la propuesta geométrica: inicialización de curvaturas por capa siguiendo un perfil holográfico UV/IR (de c = 2.60 en las capas de entrada a c = 0.60 en las de salida), poda armónica dinámica (DHP) con suelo de learning rate escalado por profundidad, y un mecanismo de acoplamiento inter-capa denominado "telepatía". Son ideas de investigación, no arquitecturas validadas por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Conviene leer la ficha con cautela. La model card está truncada, los benchmarks son autoinformados y no verificados de forma independiente, y existe una discrepancia entre el recuento de parámetros del nombre comercial (253M) y el que reportan los safetensors publicados (292,5M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM-MoE (Continuous Dynamic Memory Mixture-of-Experts) sobre geometría de bola de Poincaré con curvatura AdS aprendible; 7 capas, d_model 768, 12 cabezas de atención, 4 expertos por capa, 8 slots geométricos por capa, d_ff 3072 |
| Parametros totales | 292.511.384 según safetensors publicados; la model card declara 252.884.366 sin atar (215.135.630 atados; 176.993.678 de backbone sin embeddings) |
| Parametros activos | No disponible (se declaran 4 expertos por capa, pero no se especifica la política de routing ni cuántos expertos se activan por token) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF (el autor publica artefactos en ese formato); niveles concretos no disponibles |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio no está informado; el entrenamiento se apoya en SmolTalk y FineWeb-Edu, predominantemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Vocabulario | 49.152 tokens (tokenizer de SmolLM2) |
| Modelo base / profesor | HuggingFaceTB/SmolLM2-1.7B-Instruct (1.711,4M parámetros) |
| Pasos de entrenamiento | 100.000 (batch 4, acumulación de gradiente 2, batch efectivo 8) |
| Hardware de entrenamiento | 1× NVIDIA GeForce RTX 5070 Ti (16 GB) |
| Tamano del repositorio | 3,6 GB |

## Arquitectura y entrenamiento

El modelo sustituye la pila transformer convencional por un CDM-MoE de 7 capas en el que cada capa opera sobre una variedad de Riemann con curvatura propia. La hipótesis del autor es que existe una separación de fases entre una zona ultravioleta (capas de entrada, curvatura alta) y una zona infrarroja (capas de salida, curvatura baja), con una capa de interfaz en c = 1.50. En esta ejecución las curvaturas se pre-inicializan siguiendo ese perfil (UV: 2.60 → 2.25; interfaz: 1.50; IR: 0.75 → 0.60), lo que según la model card evita unas 40.000 iteraciones de "esculpido geométrico" que eran necesarias en versiones anteriores (Lattice-4C).

El entrenamiento es una destilación de SmolLM2-1.7B-Instruct sobre SmolTalk y FineWeb-Edu, con dos innovaciones declaradas: un suelo de learning rate para el mecanismo de poda armónica dinámica (DHP), que en ejecuciones previas se había degradado hasta 0.0057 y detenía el flujo de gradiente en los checkpoints profundos, y un acoplamiento inter-capa ("telepatía", W_tele de K × K) que propaga momento entre capas. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla el algoritmo de routing de los 4 expertos por capa.

## Capacidades

- Generación de texto conversacional multi-turno, con fidelidad declarada próxima al profesor en el dominio de instrucciones.
- Tool calling y function calling: la model card reporta 93,3 % de acierto en nombre de herramienta y 96,7 % de validez estricta de JSON sobre APIGen.
- Generación estructurada (JSON) con latencia de sintaxis declarada del 96,7 % en modo estricto.
- Razonamiento de sentido común básico y preguntas de conocimiento elemental (PIQA, ARC-Easy, ARC-Challenge, HellaSwag), con rendimiento muy por debajo del profesor.
- Destilación de conocimiento de dominio: la model card reporta 97,13 % de coincidencia top-1 con el profesor en el slice apigen-80k de SmolTalk.
- Soporte de cuantización GGUF para despliegue en entornos con recursos limitados.
- Capacidades multilingües: no disponibles / no declaradas.
- No se documentan capacidades de visión, audio, modo "thinking" explícito ni agentes multi-paso verificados.

## Casos de uso

- **Generación de llamadas a herramientas en asistentes ligeros**: con 93,3 % de acierto declarado en nombre de herramienta y 96,7 % de JSON válido, el modelo puede actuar como capa de selección de función y rellenado de argumentos en un asistente, siempre que el esquema de herramientas quepa en los 512 tokens de contexto.
- **Enrutamiento y clasificación de intenciones en edge**: 253-292M parámetros permiten ejecutar el modelo en CPU o en GPU integrada dentro de un servicio de clasificación de consultas o extracción de entidades con esquema fijo, sin depender de red.
- **Prototipado rápido de pipelines de destilación**: sirve como caso de estudio reproducible de destilación desde un profesor de 1,7B a un alumno por debajo de 300M, útil para investigadores que quieran medir la retención por dominio (los slices de SmolTalk y FineWeb-Edu están reportados por separado).
- **Investigación en geometrías no euclídeas para NLP**: el modelo y su código asociado (Lattice-CDM) permiten experimentar con curvatura aprendible por capa, embeddings de Poincaré y acoplamiento inter-capa en un tamaño ablatable en una sola GPU.
- **Generación de respuestas cortas en asistentes embebidos**: respuestas de una o dos frases en dispositivos con 1-2 GB de RAM, por ejemplo asistentes de configuración o help desk de producto con un catálogo cerrado de respuestas.
- **Evaluación comparativa de robustez de cuantización**: al publicarse en safetensors y GGUF, permite medir la degradación de un modelo con geometría no estándar bajo cuantización agresiva, un caso poco cubierto en la literatura.
- **Generación de datos sintéticos de formato**: dado su rendimiento en validez de sintaxis JSON, puede emplearse para producir pares de ejemplo conformes a esquema en tareas de arranque en frío, con revisión humana posterior.

## Benchmarks y rendimiento

Resultados autoinformados por el autor contra el profesor sin cuantizar, sobre el mismo conjunto de evaluación. No han sido verificados de forma independiente.

| Benchmark | Métrica | Lattice-4D (253M) | Profesor SmolLM2-1.7B | Retención |
|---|---|---|---|---|
| APIGen tool calling | Tool name acc vs GT | 93,3 % | 100,0 % | 93,3 % |
| APIGen JSON validity | Strict syntax valid % | 96,7 % | 100,0 % | 96,7 % |
| APIGen argument F1 | Parameter key F1 | 92,2 % | 100,0 % | 92,2 % |
| PIQA | Zero-shot acc_norm | 54,0 % (58,0 % raw) | 77,0 % (72,5 % raw) | 70,1 % |
| ARC-Easy | Zero-shot acc_norm | 41,5 % (42,5 % raw) | 62,0 % (66,0 % raw) | 66,9 % |
| ARC-Challenge | Zero-shot acc_norm | 28,5 % (20,0 % raw) | 42,5 % (38,5 % raw) | 67,1 % |
| HellaSwag | Zero-shot acc_norm | 36,0 % (35,5 % raw) | 59,5 % (44,0 % raw) | 60,5 % |
| WikiText-2 test | Perplexity / BPB | 75,74 PPL (1,5416 BPB) | 11,56 PPL (0,8719 BPB) | referencia |

| Slice de destilación | Métrica | Lattice-4D | Profesor | Top-1 agree | Top-5 agree |
|---|---|---|---|---|---|
| SmolTalk (apigen-80k) | Assistant BPB / PPL | 0,1148 BPB (1,24 PPL) | 0,0164 BPB (1,03 PPL) | 97,13 % | 98,71 % |
| SmolTalk (smol-constraints) | Assistant BPB / PPL | 0,4675 BPB (5,04 PPL) | 0,1874 BPB (1,91 PPL) | 67,20 % | 88,45 % |
| FineWeb-Edu (held-out) | Domain BPB / PPL | 1,2406 BPB (39,63 PPL) | 0,7786 BPB (10,07 PPL) | 48,48 % | 72,12 % |

El propio autor declara un BPB de validación global de 0,6692 (perplejidad aproximada de 7,42) y una divergencia KL respecto al profesor de 0,1659.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del recuento de safetensors, 292,5M): ~1,2 GB en fp32, ~0,6 GB en fp16/bf16, ~0,3 GB en int8, ~0,15-0,2 GB en int4. La caché KV es despreciable con 512 tokens de contexto.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 4090 o RTX 5070 Ti está muy por encima de lo necesario. El propio autor entrenó el modelo en una única RTX 5070 Ti de 16 GB.
- Cabe holgadamente en GPU consumer (RTX 3060 12 GB, RTX 4060 8 GB, GTX 1650 4 GB) y también en CPU, así como en iGPU con memoria compartida y en dispositivos tipo Raspberry Pi 5 en cuantización int4.
- Opciones de despliegue: `transformers` para safetensors (arquitectura no estándar, previsiblemente requiere `trust_remote_code` y el código de Lattice-CDM); `llama.cpp` / Ollama / LM Studio vía los GGUF publicados; compatibilidad con vLLM o TGI no disponible (las arquitecturas CDM-MoE no estándar no suelen estar soportadas por esos motores sin implementación propia).
- Latencia y throughput estimados: no disponibles. Por tamaño, en una GPU consumer cabría esperar decenas a cientos de tokens por segundo, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Benchmarks en la información disponible |
|---|---|---|---|---|
| Lattice-4D-Holographic-253M | 292,5M (safetensors) | 512 | Apache 2.0 | Ver tabla superior (autoinformados) |
| SmolLM2-1.7B-Instruct (profesor) | 1.711,4M | 8.192 | Apache 2.0 | Ver tabla superior |
| SmolLM2-360M-Instruct | ~362M | 8.192 | Apache 2.0 | No disponible |
| SmolLM2-135M-Instruct | ~135M | 8.192 | Apache 2.0 | No disponible |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Apache 2.0 | No disponible |

La comparación relevante es con la familia SmolLM2, de la que este modelo es destilado y con cuya tokenización comparte vocabulario. La diferencia práctica más determinante no es el tamaño sino el contexto: 512 tokens frente a 8.192 o 32.768 de las alternativas, lo que limita seriamente cualquier uso conversacional real. A igualdad de parámetros, un SmolLM2-360M o un Qwen2.5-0.5B ofrecen contextos entre 16 y 64 veces mayores con soporte nativo en los motores de inferencia habituales.

## Limitaciones y advertencias

- **Contexto de 512 tokens**: es la limitación más severa. Descarta conversaciones multi-turno reales, RAG con documentos y la mayoría de los prompts de sistema con esquemas de herramientas extensos.
- **Benchmarks autoinformados y sin verificación externa**: el repositorio registra 0 descargas y 0 likes, no hay evaluaciones de terceros ni leaderboard en el que aparezca el modelo.
- **Discrepancia en el recuento de parámetros**: el nombre comercial indica 253M, la model card declara 252,9M sin atar/215,1M atados, y los safetensors publicados reportan 292,5M. Conviene verificar el checkpoint antes de planificar presupuesto de memoria.
- **Caída notable frente al profesor**: la retención es alta en dominios de instrucción (93-97 % en APIGen y apigen-80k) pero cae al 48,48 % de coincidencia top-1 en FineWeb-Edu y a valores en torno al 60-70 % en PIQA, ARC y HellaSwag. El modelo reproduce bien el formato, no el conocimiento.
- **Riesgo de alucinación elevado**: con 36,0 % en HellaSwag y 28,5 % en ARC-Challenge, el modelo carece de base factual sólida; no debe usarse para consultas de conocimiento sin verificación externa.
- **Idiomas no declarados**: el entrenamiento se apoya en SmolTalk y FineWeb-Edu, mayoritariamente en inglés. No hay garantía de calidad en castellano.
- **Arquitectura no estándar**: la integración en producción exige el código de Lattice-CDM o el uso de los GGUF. No es un reemplazo directo en herramientas que asuman un transformer estándar.
- **Model card incompleta**: el documento público se interrumpe a mitad de la sección de dinámica holográfica; faltan detalles de entrenamiento (tokens totales, composición del dataset, fases de alineamiento) y no se documenta el routing de expertos.
- **Procedencia temporal atípica**: las fechas del repositorio (creación 2026-10-25) no coinciden con el calendario habitual de publicación; conviene contrastar la trazabilidad del checkpoint.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías. No hay cláusulas adicionales restrictivas, pero tampoco garantía del autor sobre el rendimiento en producción.
- **Sin endpoint público gestionado**: no se indica disponibilidad en Inference Providers; el despliegue corre por cuenta del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Lattice-4D-Holographic-253M-Poincare-Instruct
- Organización en HuggingFace: https://huggingface.co/DuoNeural
- Web del laboratorio: https://duoneural.com
- Repositorio de código (Lattice-CDM): https://github.com/DuoNeural/Lattice-CDM
- Modelo base / profesor: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
