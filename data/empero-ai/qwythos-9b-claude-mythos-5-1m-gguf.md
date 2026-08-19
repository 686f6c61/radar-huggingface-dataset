# empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-5-1M es un modelo de lenguaje de 9 mil millones de parametros desarrollado por Empero AI, disponible en formato GGUF para ejecucion local con llama.cpp, Ollama, LM Studio y otros runtimes. Se trata de un post-entrenamiento completo (full-parameter fine-tuning) sobre el modelo base Qwen3.5-9B, utilizando mas de 500 millones de tokens de trazas de razonamiento estilo Claude Mythos y Claude Fable, generadas internamente con la herramienta propietaria `rethink`. El resultado es un modelo especializado en razonamiento complejo, con soporte nativo de function calling segun la especificacion Qwen3.5 y una ventana de contexto ampliada a 1.048.576 tokens (1M) mediante escalado YaRN.

La relevancia actual de este modelo radica en su combinacion de tamano compacto (9B), contexto ultralargo, capacidades multimodales (vision heredada del base) y licencia Apache 2.0, lo que lo hace atractivo para despliegues en produccion con requisitos de privacidad o latencia. El repositorio GGUF ofrece multiples cuantizaciones, incluyendo variantes con cabezal MTP (Multi-Token Prediction) para decodificacion especulativa, lo que permite ajustar el equilibrio entre calidad, velocidad y consumo de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con vision tower CLIP (heredada de Qwen3.5-9B) |
| Parametros totales | 9 mil millones (9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) via YaRN rope-scaling, activado por defecto |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16; variantes MTP para cada una |
| Idiomas soportados | Ingles (segun metadatos del modelo card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj separado para vision) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen3.5-9B, sin mezcla de expertos. La vision tower (encoder CLIP) se hereda del base y permanece congelada durante el entrenamiento, por lo que el comportamiento multimodal es identico al de Qwen3.5-9B. El post-entrenamiento consistio en un ajuste fino supervisado (SFT) sobre 500 millones de tokens de trazas de razonamiento estilo Claude Mythos/Fable, con cadenas de pensamiento (chain-of-thought) generadas internamente. No se menciona el uso de RLHF o DPO en la informacion disponible.

La innovacion principal es la restauracion del cabezal MTP (Multi-Token Prediction) compatible con Qwen3.5, incluido en las variantes MTP del GGUF. Este cabezal permite decodificacion especulativa en runtimes que lo soporten (por ejemplo, llama.cpp con `--spec-type draft-mtp`), acelerando la generacion sin perder calidad. El escalado de contexto a 1M se logra mediante rope-scaling YaRN, activado por defecto en los pesos.

## Capacidades

- Razonamiento complejo y cadenas de pensamiento: el modelo esta especificamente entrenado para producir razonamientos detallados paso a paso, superando al base Qwen3.5-9B en tareas de logica y matematicas.
- Function calling nativo: soporta la especificacion de function calling de Qwen3.5, permitiendo integracion con herramientas y APIs externas.
- Vision multimodal: acepta imagenes como entrada (via mmproj) y realiza descripcion detallada, OCR (impreso y manuscrito), lectura de graficos y tablas, comprension de UI y documentos, y razonamiento espacial basico.
- Contexto ultralargo: ventana de 1M tokens, util para procesar documentos extensos, libros completos o conversaciones de multiples turnos.
- Capacidades agenticas: combinado con function calling y razonamiento multi-paso, puede actuar como agente autonomo en tareas complejas.
- Especializacion en dominios: los tags indican capacidades en ciberseguridad y biomedicina, aunque no se detallan benchmarks especificos en estos campos.
- Etiquetado como "uncensored": el modelo no aplica filtros de contenido adicionales, lo que puede ser util en entornos de investigacion pero requiere precaucion en produccion.

## Casos de uso

- Atencion al cliente automatizada con contexto largo: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 1M tokens, manteniendo coherencia a lo largo de sesiones prolongadas sin perder informacion previa.
- Analisis de documentos legales o academicos: procesar contratos, articulos cientificos o informes de cientos de paginas en una sola pasada, extrayendo conclusiones y resumenes con razonamiento detallado.
- Generacion de codigo con integracion de herramientas: mediante function calling, puede invocar APIs, ejecutar consultas a bases de datos o interactuar con sistemas de CI/CD, generando y validando codigo en flujos automatizados.
- Asistente de diagnostico biomedico: dado su entrenamiento en dominios cientificos, puede ayudar a interpretar articulos de investigacion, resumir ensayos clinicos o explicar mecanismos bioquimicos (como el ejemplo del README sobre inhibicion de acetilcolinesterasa).
- Analisis de imagenes en entornos industriales: con el mmproj, puede leer etiquetas, extraer datos de graficos o describir imagenes de equipos, util para mantenimiento predictivo o control de calidad.
- Agente de ciberseguridad: puede analizar logs, identificar patrones de ataque y generar informes de incidentes, aprovechando su razonamiento multi-paso y contexto largo para correlacionar eventos.
- Procesamiento de libros completos o corpus extensos: resumir novelas, manuales tecnicos o bases de conocimiento enteras en una sola consulta, gracias a la ventana de 1M tokens.
- Despliegue local con privacidad: al ser un modelo de 9B cuantizado, puede ejecutarse en hardware de consumo, permitiendo procesamiento de datos sensibles sin enviarlos a la nube.

## Benchmarks y rendimiento

No se han publicado valores absolutos de benchmarks en la informacion disponible. El README del modelo base reporta mejoras relativas frente a Qwen3.5-9B bajo evaluacion emparejada:

| Benchmark | Mejora relativa vs Qwen3.5-9B |
|---|---|
| MMLU | +34 puntos |
| GSM8K (strict) | +30 puntos |
| GSM8K (flex) | +19 puntos |

Estos datos indican una ganancia sustancial en razonamiento y matematicas, pero no se proporcionan los valores absolutos ni comparaciones con otros modelos de la misma categoria. No se dispone de resultados para HumanEval, GPQA u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantizacion, sin contar KV cache):
  - Q4_K_M: ~5.2 GiB de pesos, cabe en GPUs de 8 GB (RTX 3060, RTX 4060, RTX 4070) con contexto reducido.
  - Q5_K_M: ~6.0 GiB, recomendado para GPUs de 8-12 GB.
  - Q6_K: ~6.9 GiB, adecuado para 12 GB o mas.
  - Q8_0: ~8.9 GiB, requiere 12-16 GB.
  - BF16: ~16.7 GiB, requiere 20+ GB (RTX 3090, RTX 4090, A100).
- Para contexto de 1M tokens, la KV cache consume una cantidad significativa de VRAM adicional (del orden de decenas de GB), por lo que en la practica se recomienda usar contextos menores (16K-32K) en hardware de consumo.
- GPUs recomendadas: RTX 3060/4060/4070 para cuantizaciones Q4-Q6, RTX 3090/4090 o A100 para Q8/BF16 y contextos largos.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, llama-mtmd-cli), Ollama, LM Studio, jan, KoboldCpp. Para servidores OpenAI-compatibles, llama-server con `--mmproj` para vision.
- Decodificacion especulativa: las variantes MTP requieren builds recientes de llama.cpp con `--spec-type draft-mtp`; pueden acelerar la generacion entre 1.5x y 2x en hardware compatible.
- Latencia y throughput: no se proporcionan mediciones oficiales. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 30-60 tokens/s, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos-5-1M | 9B | 1M (YaRN) | Apache 2.0 | Fine-tuning de Qwen3.5-9B con razonamiento mejorado, vision y function calling |
| Qwen3.5-9B (base) | 9B | 1M (YaRN) | Apache 2.0 | Modelo base, sin el post-entrenamiento especifico; menor rendimiento en razonamiento |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | Alternativa popular de 8B, sin vision nativa y con contexto menor |
| Mistral 7B v0.3 | 7B | 32K | Apache 2.0 | Modelo mas pequeno, sin vision y con contexto limitado |

La comparacion directa con Qwen3.5-9B muestra una ventaja clara en razonamiento y matematicas (+34 MMLU, +30 GSM8K strict). Frente a Llama 3.1 8B o Mistral 7B, Qwythos ofrece contexto mucho mayor y capacidades de vision, aunque no se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- La vision tower esta congelada y heredada del base Qwen3.5-9B; el rendimiento multimodal es identico al base, sin mejoras especificas del post-entrenamiento.
- El modelo esta etiquetado como "uncensored", lo que implica que puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es adecuado para aplicaciones publicas sin moderacion adicional.
- Solo se confirma soporte para ingles; no hay informacion sobre rendimiento en otros idiomas, aunque el base Qwen3.5 podria tener capacidades multilingues.
- No se han publicado benchmarks absolutos ni evaluaciones externas independientes; las mejoras reportadas son relativas al base y generadas por el propio desarrollador.
- El contexto de 1M tokens requiere una cantidad enorme de memoria para la KV cache; en la practica, el uso de contextos completos solo es viable en hardware de gama alta (A100/H100 con decenas de GB).
- Las variantes MTP requieren runtimes especificos y builds recientes; si no se usan, se pierde la aceleracion por decodificacion especulativa.
- No se dispone de informacion sobre sesgos especificos del modelo, pero al ser un fine-tuning de Qwen3.5, puede heredar sesgos del base.
- Riesgo de alucinacion en tareas de razonamiento complejo, especialmente con contextos muy largos donde el modelo puede perder coherencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF
- Modelo base (safetensors): https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Sitio web de Empero: https://empero.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
