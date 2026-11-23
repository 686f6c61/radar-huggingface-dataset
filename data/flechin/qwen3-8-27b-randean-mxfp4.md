# flechin/Qwen3.8-27B-Randean-MXFP4

## Resumen

Qwen3.8-27B-Randean-MXFP4 es un ajuste fino del modelo Qwen3.8-27B de Alibaba, publicado por el usuario flechin bajo licencia Apache 2.0. Se distribuye como una cuantización de 4 bits en formato MXFP4 (aproximadamente 19 GB) y está orientado a producir respuestas directas y ancladas en la realidad, evitando el exceso de matices (hedging), la complacencia con premisas erróneas y el relleno de recomendaciones con jerga. El autor lo presenta como una alternativa que funciona en una única GPU de 32 GB y que supera al Qwen3.8-27B original en tareas de código difíciles y de ingeniería en terminal.

El modelo se apoya en el pipeline image-text-to-text (es multimodal, con entrada de imagen y texto) y en la librería transformers con pesos safetensors. El repositorio declara 15.606.149.872 parámetros efectivos en el checkpoint safetensors, aunque el nombre comercial haga referencia a 27B y el tamaño del repo sea de 79,2 GB (incluye múltiples artefactos y cuantizaciones). Incorpora técnicas declaradas de ORPO, QLoRA y QAT, junto con etiquetas de razonamiento, epistemología, anti-sycophancy y grounding causal.

Su relevancia actual radica en dos frentes: por un lado, la eficiencia de despliegue en hardware de consumo o de una sola GPU profesional; por otro, un enfoque explícito en la calibración epistémica y la resistencia a la adulación, medido con suites como BullshitBench v2 y Anthropic SycophancyEval. Es un modelo pensado para agentes y tareas de ingeniería real, no solo para conversación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 (`qwen3_5`) |
| Parametros totales | 15.606.149.872 (según safetensors del repo); nombre comercial 27B |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits), AWQ, Quark, GGUF Q4_K_M, Q6_K (imatrix) y Q8_0 en repo hermano |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y de la variante amd/Qwen3.8-27B-Quark-AWQ-MXFP4, lo que indica una cadena de cuantización sobre la que se aplica el ajuste. La arquitectura es un transformer multimodal de la familia Qwen3.5 con capacidad de procesar imagen y texto, empaquetado en MXFP4 (4 bits) para reducir el peso a unos 19 GB y permitir inferencia en una GPU de 32 GB. El pipeline declarado es image-text-to-text, por lo que conserva la torre de visión del modelo base.

En cuanto al entrenamiento, la model card menciona ORPO (optimización por preferencias sin modelo de recompensa separado), QLoRA (ajuste eficiente en 4 bits) y QAT (entrenamiento consciente de cuantización). El objetivo declarado es el "reality-aligned" y "de-hedged": respuestas directas, resistencia a premisas rotas y reducción de la adulación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de la mezcla de datos. Tampoco se documentan innovaciones de decodificación como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con etiqueta explícita de "reasoning".
- Generación de código, incluida resolución de problemas de programación competitiva y tareas de terminal/CLI.
- Capacidades matemáticas, evaluadas en AIME 2024-2025 y GSM8K.
- Capacidades multimodales de imagen y texto (pipeline image-text-to-text).
- Soporte de tool calling y uso agéntico de herramientas, medido en la suite Randean Precision Tools Hard.
- Comportamiento anti-sycophancy: mantiene la respuesta correcta tras un desafío del usuario (Anthropic SycophancyEval).
- Grounding epistémico: rechazo de premisas falsas y respuestas calibradas ante trampas adversariales.
- Capacidad conversacional multi-turno, evaluada en la suite epistemológica de 84 preguntas.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`) y despliegue en ROCm.

## Casos de uso

- Agentes de ingeniería en terminal: el modelo resuelve tareas de CLI y Docker con una tasa declarada del 56,2 % en Terminal-Bench 2.1, por lo que encaja en flujos de automatización de operaciones y scripts de sistema.
- Asistencia de código en producción: con un pass@1 del 72 % en LiveCodeBench v6 y 97,5 % en HumanEval, puede integrarse en pipelines de revisión y generación de código donde se requiera alta precisión en problemas estándar.
- Agentes con tool calling: su 91,67 % en la suite de precisión de herramientas (24 trampas agénticas) lo hace adecuado para orquestación de funciones donde una llamada mal formada rompe el flujo.
- Atención al cliente técnica: la combinación de anti-sycophancy (93 % de precisión tras desafío en SycophancyEval) y grounding epistémico reduce respuestas complacientes ante premisas erróneas del usuario.
- Análisis de documentos con imagen: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Evaluación y moderación de contenido: su capacidad de detectar premisas falsas (96 % de pushback claro en BullshitBench v2) sirve para sistemas que deben señalar afirmaciones incorrectas en lugar de aceptarlas.
- Razonamiento científico y matemático: con 78,79 % en GPQA-Diamond y 78,33 % en AIME 2024-2025, es útil en asistentes de investigación y tutoría avanzada.
- Despliegue en una sola GPU: al ocupar unos 19 GB en MXFP4, permite servir el modelo en estaciones de trabajo con 32 GB de VRAM sin infraestructura multi-GPU.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Terminal-Bench 2.1 (89 tareas Docker CLI) | Tareas resueltas (%) | 56,2 |
| LiveCodeBench v6 (175 problemas) | pass@1 (%) | 72,00 |
| LiveCodeBench v6 (problemas difíciles) | hard pass@1 (%) | 48,75 |
| BullshitBench v2 (100 trampas) | Puntuación media (sobre 2,0) | 1,93 (rank global #1/171) |
| BullshitBench v2 | Tasa de pushback claro (%) | 96,0 |
| Randean Precision Tools Hard (24 trampas agénticas, T=0,2) | Precisión de herramientas (%) | 91,67 |
| Randean Active Grounding Suite (H5, 45 prompts) | Precisión de grounding activo 3 vías (%) | 82,2 |
| GPQA-Diamond (198 preguntas STEM de doctorado) | Precisión (%) | 78,79 |
| AIME 2024-2025 (60 problemas de olimpiada) | Precisión global (%) | 78,33 |
| Google IFEval Full (541 prompts) | Precisión estricta a nivel de prompt (%) | 86,88 |
| Google IFEval Full | Precisión estricta a nivel de instrucción (%) | 89,93 |
| Anthropic SycophancyEval (400 prompts) | Precisión tras desafío en 2 turnos (%) | 93,00 |
| OpenAI HumanEval | pass@1 (%) | 97,5 |
| OpenAI GSM8K | Exact match (%) | 97,0 |
| Randean Epistemology Bench (84 preguntas) | Puntuación global (%) | 83,33 |
| Randean Epistemology Bench | Conversacional corto (%) | 80,95 |
| Randean Epistemology Bench | Trampas adversariales largas (%) | 85,71 |

## Requisitos de hardware

- VRAM estimada: unos 19 GB en MXFP4 (4 bits); el autor indica que cabe en una única GPU de 32 GB.
- GPU recomendadas: GPU profesional con 32 GB o más (por ejemplo, serie A100/H100 de 40-80 GB, o GPUs de 32 GB); el tag `rocm` sugiere soporte en AMD.
- GPU de consumo: no se confirma en la información disponible si cabe en GPUs de consumo de 24 GB; el peso de 19 GB deja poco margen para contexto y caché KV, por lo que no está garantizado.
- Opciones de despliegue: transformers con safetensors; llama.cpp, Ollama y LM Studio mediante el repo GGUF hermano (Q4_K_M, Q6_K imatrix, Q8_0) con visión `mmproj`; compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Randean-MXFP4 | 15,6B (safetensors) | no disponible | MXFP4, AWQ, GGUF | Apache 2.0 | Ajuste anti-sycophancy y de grounding; multimodal |
| Qwen3.8-27B (stock) | 27B (nominal) | no disponible | múltiples | Apache 2.0 | Base sin ajuste; el autor afirma que Randean lo supera en código y terminal |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | 27B (nominal) | no disponible | AWQ, MXFP4 | no disponible | Variante cuantizada de AMD usada como base |
| Randean v2.0 | no disponible | no disponible | no disponible | no disponible | Versión anterior del mismo autor, comparada en la model card |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente; deben tomarse con cautela.
- El número de parámetros del checkpoint safetensors (15,6B) no coincide con el nombre comercial (27B), lo que puede generar confusión sobre el tamaño real.
- No se documentan los idiomas soportados; el rendimiento multilingüe es desconocido.
- No se documenta la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; el enfoque anti-sycophancy reduce la complacencia, pero no garantiza la veracidad factual.
- Posibles sesgos derivados del dataset de ajuste (no documentado) y de la optimización por preferencias (ORPO).
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y de la variante de AMD.
- El tamaño del repositorio (79,2 GB) incluye artefactos adicionales; el despliegue debe seleccionar los pesos MXFP4 concretos.
- El soporte de visión depende de la torre multimodal del modelo base; no se detallan limitaciones específicas de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flechin/Qwen3.8-27B-Randean-MXFP4
- Repositorio GGUF: https://huggingface.co/flechin/Qwen3.8-27B-Randean-GGUF
- Demo interactiva (ZeroGPU): https://huggingface.co/spaces/flechin/randean
- Paper de investigación (PDF): https://huggingface.co/flechin/Qwen3.8-27B-Randean-MXFP4/resolve/main/paper/randean_paper.pdf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante cuantizada de AMD: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
