# GallonHong/Prelude-1.7B-GGUF

## Resumen
Prelude-1.7B es un modelo de conversación en chino de 1.720.574.976 parámetros (1,72B) desarrollado por opensi-ink (cuenta de Hugging Face GallonHong), construido a partir de `Qwen/Qwen3-1.7B-Base` mediante un proceso de preentrenamiento continuo (CPT) sobre literatura china y un ajuste supervisado (SFT) centrado en transcripciones de pódcasts reales. El objetivo declarado es romper con el tono de "atención al cliente automática" típico de los modelos instruidos y producir un registro conversacional más natural, con turnos cortos, pausas y capacidad de mantener una postura propia sin adular al usuario.

El modelo integra de forma nativa un protocolo ligero de memoria local llamado Micro-Wiki, compuesto por cuatro herramientas JSON (`wiki_read`, `wiki_search`, `wiki_append`, `get_now`) que operan sobre cuatro ficheros Markdown editables. Se distribuye únicamente en formato GGUF con cuantización `Q8_0` (tres checkpoints: v0.1, v0.5 y v1), pensado para ejecutarse en `llama.cpp` sobre una sola máquina con 8K de contexto. La licencia es Apache 2.0 y los idiomas soportados son chino e inglés.

El interés actual del modelo reside en su enfoque: demuestra que un modelo de 1,7B puede sostener un registro conversacional específico y un uso de herramientas con formato estricto si el corpus de SFT está cuidadosamente diseñado, incluyendo técnicas de separación de embeddings de tokens especiales que en el modelo base estaban colapsados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B-Base) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K (contexto de despliegue indicado por el autor); entrenamiento con secuencia máxima de 4.096 tokens |
| Tipos de cuantizacion | Q8_0 (única publicada); repo con etiqueta `mlx` y `gguf` |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); repo con tag `mlx` |

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen3-1.7B-Base`, un transformer decoder-only de 1,72B parámetros, y se entrena con actualización completa de parámetros (full-parameter) en Apple Silicon usando MLX, con cómputo en BF16 y pesos maestros en FP32. El pipeline tiene dos fases: primero un CPT v2 sobre aproximadamente 27,18M tokens de literatura china, ensayos y corpus de "replay" de alta calidad; después un SFT con 2.296 muestras empaquetadas y 121.189 tokens objetivo supervisados en el caso de la versión v1.

La mezcla de datos de SFT de v1 se reparte en 58,7% de diálogo de pódcast real (multiturno, con arcos de argumentación y cierre largo→corto), 15,0% de muestras de herramientas Micro-Wiki y sus límites, 11,8% de charla corta cotidiana y muestras anti-adulación, 11,0% de reescritura bilingüe puntual, programación básica y pulido de textos, y 3,5% de identidad y fidelidad al contexto previo. El entrenamiento usa batch efectivo 16 (micro-batch 2, acumulación 8), longitud máxima 4.096 y 2,0 épocas (288 pasos en v1).

La innovación técnica destacable es la corrección del colapso de embeddings de tokens especiales en el modelo base: `<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`, `<tool_call>`, `</tool_call>`, `<tool_response>` y `</tool_response>` tenían vectores iniciales idénticos (L2 = 0.0000). El autor los separó en un grupo de parámetros con optimizador AdamW propio (sin weight decay, `special_token_lr` de 3e-4 a 3e-5), mientras el cuerpo usaba AdamW con `lr` de 1.5e-5 a 1.5e-6, `weight_decay` 0.1 y `grad_clip` 1.0. Tras una época, la distancia L2 entre `<think>`/`</think>` y `<tool_call>`/`</tool_call>` se estabilizó en 0,36–0,40. No se menciona RLHF ni DPO en la información disponible.

## Capacidades
- Generación de texto conversacional en chino con registro de pódcast: turnos cortos (mediana de 32–34 caracteres en respuestas de charla), capacidad de extender cuando el tema lo requiere.
- Conversación multiturno con fidelidad al contexto previo y reconocimiento honesto de ausencia de contexto.
- Uso de herramientas nativo mediante el protocolo Micro-Wiki: `wiki_read`, `wiki_search`, `wiki_append` y `get_now`, con formato `<tool_call>` / `<tool_response>` de Qwen3.
- Memoria persistente local sobre cuatro páginas Markdown (`profile`, `people`, `timeline`, `topics`), con índice de memoria inyectado en el system prompt (≤250 caracteres).
- Percepción de tiempo local vía `get_now` (hora y día de la semana).
- Generación de código básico (el autor cita salida de una línea de Python).
- Traducción y reescritura bilingüe chino-inglés en puntos concretos.
- Pulido de textos cortos.
- Comportamiento anti-adulación: mantiene postura ante presión emocional y distingue entre desahogo y petición de redacción por encargo.
- Identidad propia como "Prelude", con separación entre role-play ficticio y experiencia real.

## Casos de uso
- Asistente conversacional personal en local: el modelo puede mantener charla multiturno con memoria persistente en cuatro ficheros Markdown, lo que permite recordar preferencias y relaciones entre sesiones sin base de datos vectorial ni servicios externos.
- Diario o compañero de reflexión: gracias al registro de pódcast y a la ausencia de adulación sistemática, es adecuado para conversaciones donde el usuario busca una segunda opinión sin condescendencia, con turnos breves y preguntas de seguimiento.
- Prototipado de agentes con memoria ligera: los cuatro tools JSON permiten construir un agente que consulte y actualice un perfil de usuario; el uso de GBNF en `llama.cpp` solo cuando se emite `<tool_call>` garantiza JSON válido sin penalizar la generación libre.
- Chatbot de atención en chino para dominios acotados: con 8K de contexto y Q8_0 puede desplegarse en una sola máquina; útil para escenarios donde se prioriza un tono natural sobre cobertura enciclopédica.
- Traducción y reescritura puntual chino-inglés: el modelo cambia de registro conversacional a tarea estructurada (traducción de un fragmento, reescritura de una frase) sin degradar el formato.
- Generación de snippets de código simples: para tareas de una línea o fragmentos pequeños en Python dentro de un flujo conversacional.
- Pruebas de investigación sobre estilos de SFT: la publicación de tres checkpoints (v0.1, v0.5, v1) con distintas proporciones de pódcast (26,7%, 38,7% y 58,7%) permite estudiar el efecto de la mezcla de datos en el estilo y la longitud de respuesta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card y el repositorio no incluyen cifras de MMLU, HumanEval, GSM8K ni evaluaciones comparativas estandarizadas; el autor remite a un preimpreso en Zenodo con análisis cualitativos y cuantitativos sobre longitud de respuesta, acciones de cierre de turno y fidelidad al contexto, pero no se proporcionan aquí los valores.

## Requisitos de hardware
- VRAM estimada: con Q8_0 y 1,72B parámetros, el peso ocupa aproximadamente 1,8–2,0 GB; el repositorio completo pesa 5,5 GB porque incluye los tres checkpoints.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0 con contexto 8K; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, aunque el modelo está dimensionado para hardware modesto.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con 4 GB o más; también puede ejecutarse en CPU.
- Despliegue: `llama.cpp` es la vía indicada por el autor, con soporte de gramáticas GBNF (`wiki_tools.gbnf`) para forzar JSON válido en las llamadas a herramientas. El repo incluye etiqueta `mlx`, lo que sugiere compatibilidad con MLX en Apple Silicon. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Prelude-1.7B (v1) | 1,72B | 8K (despliegue); 4.096 en entrenamiento | zh, en | Apache 2.0 | GGUF Q8_0 | SFT sobre pódcasts chinos, Micro-Wiki nativo |
| Qwen3-1.7B-Base | 1,72B | no disponible en la información proporcionada | multilingüe (modelo base Qwen3) | Apache 2.0 (según el modelo base) | safetensors (modelo base) | Modelo base sin SFT conversacional; sin herramientas integradas |
| Qwen3-1.7B (instruido) | 1,72B | no disponible en la información proporcionada | multilingüe | Apache 2.0 | safetensors, GGUF | Referencia de la familia; el autor lo usa como contraste del "tono de atención al cliente" |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas alternativas.

## Limitaciones y advertencias
- Modelo pequeño (1,72B): capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor tamaño; riesgo de alucinación en preguntas enciclopédicas o de actualidad.
- Idiomas: solo chino e inglés; el rendimiento en castellano no está evaluado ni declarado.
- Contexto: 8K en despliegue y 4.096 tokens de secuencia máxima durante el entrenamiento; conversaciones o documentos más largos pueden degradar la coherencia.
- Sesgos: al entrenarse sobre literatura y pódcasts chinos, puede reflejar sesgos culturales y temáticos de ese corpus; no se documentan evaluaciones de sesgo.
- Herramientas: el uso correcto de Micro-Wiki depende de que el prompt del sistema inyecte el índice de memoria y de que el runtime aplique la gramática GBNF; fuera de `llama.cpp` el formato JSON no está garantizado por restricción sintáctica.
- Memoria: los ficheros Markdown son editables por el usuario y no hay control de acceso ni validación de integridad; un `wiki_append` erróneo persiste entre sesiones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base Qwen3-1.7B-Base para confirmar compatibilidad.
- Producción: no hay benchmarks publicados, ni datos de latencia/throughput, ni evaluación de robustez frente a prompt injection; el uso en producción requiere evaluación propia.
- Checkpoints: la model card está en chino y la documentación técnica detallada se remite a un preimpreso en Zenodo; la información en inglés es parcial.

## Enlaces
- Hugging Face: https://huggingface.co/GallonHong/Prelude-1.7B-GGUF
- Sitio del proyecto: https://opensi.ink
- Preimpreso técnico (Zenodo): https://zenodo.org/records/24496498
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Pesos GGUF v0.1: https://huggingface.co/GallonHong/Prelude-1.7B-GGUF/blob/main/Prelude-v0.1-1.7B-Q8_0.gguf
- Pesos GGUF v0.5: https://huggingface.co/GallonHong/Prelude-1.7B-GGUF/blob/main/Prelude-v0.5-1.7B-Q8_0.gguf
- Pesos GGUF v1: https://huggingface.co/GallonHong/Prelude-1.7B-GGUF/blob/main/Prelude-v1-1.7B-Q8_0.gguf
- Sumas de verificación: https://huggingface.co/GallonHong/Prelude-1.7B-GGUF/blob/main/SHA256SUMS
