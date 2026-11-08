# michal-cb/Swift-1.5-Qwen3.8-27b-high

## Resumen

Swift 1.5 Qwen3.8-27B es un modelo derivado por ajuste fino (post-entrenamiento) del Qwen3.8-27B de Alibaba, desarrollado por UkisAI. Su propuesta central es la eficiencia de razonamiento: reduce el consumo de «thinking tokens» en un 58,5 % respecto al modelo base manteniendo una puntuación agregada un 0,35 % superior, lo que se traduce en una aceleración de aproximadamente 1,95× en varias tareas. Es la versión 1.5 de la familia Swift, sucesora de Swift 1.0, que acumuló más de 350 000 descargas.

El modelo conserva la arquitectura y el tamaño del Qwen3.8-27B original (27 781 427 952 parámetros según los pesos en safetensors, aproximadamente 27,8 B) y añade capacidades multimodales de entrada imagen-texto, según declara la etiqueta `pipeline_tag: image-text-to-text`. El repositorio ocupa 55,6 GB en formato safetensors para transformers.

La relevancia actual del modelo reside en el coste de inferencia de los modelos con razonamiento explícito: al recortar drásticamente la longitud de las cadenas de pensamiento sin degradar la precisión, reduce latencia y gasto de cómputo en despliegues agénticos y de generación de código, dos áreas en las que el autor declara mejoras concretas frente al base y frente a Swift 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (arquitectura `qwen3_5` según las etiquetas del repo); detalles internos no disponibles |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF y GSQ-RCO GGUF publicados por el autor; cuantizaciones concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia propia, marcada como `other`; repositorio con acceso restringido, `gated: true`) |
| Formato de pesos | safetensors (transformers); GGUF y GSQ-RCO GGUF en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B y aplica un pipeline de post-entrenamiento en dos fases descrito por el autor. Primero identifica los tokens asociados a «sobrepensamiento patológico» y los penaliza sin atacar directamente la longitud del razonamiento; después recupera precisión mediante RL y OPD (on-policy distillation). El resultado es un uso «comprimido» de tokens con precisión mantenida. Swift 1.5 se construye sobre Swift 1.0 escalando esos mismos métodos de post-entrenamiento, con foco en tareas de horizonte largo, agénticas y de código.

Los datos de entrenamiento empleados están publicados en el dataset `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, aunque el autor aclara que no se usan tal cual: se remuestrean y se convierten en entornos de RL adecuados. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni detalles de la arquitectura interna más allá de la denominación `qwen3_5` en las etiquetas.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento eficiente (`efficient-thinking`, `token-efficient`): cadenas de pensamiento más cortas que el base.
- Entrada multimodal imagen-texto (`image-text-to-text`), según la etiqueta de pipeline del repositorio.
- Generación de código, con mejoras declaradas en LiveCodeBench.
- Tareas agénticas y de terminal, con mejoras declaradas en Terminal Bench 2.1.
- Tareas de horizonte largo (long-horizon agentic).
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de código en producción: el modelo declara mejoras en LiveCodeBench y Terminal Bench 2.1, por lo que encaja en pipelines de asistencia a programación y resolución de tareas de terminal donde la latencia importa.
- Agentes autónomos de horizonte largo: el foco del post-entrenamiento en tareas agénticas y multi-turno (dataset de SFT de agente multi-turno) lo hace adecuado para flujos con muchas llamadas encadenadas donde el coste por paso se acumula.
- Desarrollo de videojuegos y prototipos interactivos: el demo del autor genera un globo 3D explorable; el base tardó 104,6 minutos y Swift 1.5, 11,39 minutos, lo que ilustra su uso en generación de código de aplicaciones completas.
- Asistentes con razonamiento acotado: al reducir un 58,5 % los thinking tokens, es apto para atención al cliente o asistentes internos donde se exige respuesta rápida con razonamiento verificable.
- Procesamiento de documentos con imagen: al aceptar entrada imagen-texto, puede emplearse en extracción y descripción de contenido visual combinado con texto.
- Despliegue en infraestructura limitada: la disponibilidad de GGUF y GSQ-RCO GGUF permite servir el modelo con llama.cpp u Ollama en hardware sin GPUs de datacenter.
- Evaluación comparativa de eficiencia de razonamiento: útil como referencia en investigación sobre compresión de cadenas de pensamiento.

## Benchmarks y rendimiento

El autor reporta resultados agregados comparando Qwen3.8-27B (base) y Swift 1.5, con los mismos protocolos de evaluación. La model card incluye una tabla detallada, pero en la información disponible solo se recogen los agregados y las referencias a benchmarks concretos, no las cifras por benchmark.

| Metrica | Base Qwen3.8-27B | Swift 1.5 Qwen3.8-27B |
|---|---|---|
| Puntuacion agregada | referencia | +0,35 % respecto al base |
| Thinking tokens | referencia | −58,5 % respecto al base |
| Aceleracion en varias tareas | 1× | ~1,95× |
| LiveCodeBench | no disponible en el extracto | mejora declarada, cifra no disponible |
| Terminal Bench 2.1 | no disponible en el extracto | mejora declarada, cifra no disponible |
| Demo de generacion de juego 3D | 104,6 minutos | 11,39 minutos |

No se han publicado en la información disponible las cifras numéricas desglosadas por benchmark (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27,8 B de parámetros), en FP16 serían necesarios del orden de 55 GB de VRAM; en cuantizaciones de 8 bits, alrededor de 28 GB; en 4 bits, alrededor de 14-16 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, un modelo de 27,8 B en precisión completa requiere GPUs de datacenter (A100 80 GB, H100); las cuantizaciones GGUF permiten GPUs de consumo con suficiente VRAM.
- ¿Cabe en GPU de consumo? No confirmado. Las variantes GGUF y GSQ-RCO GGUF publicadas por el autor están pensadas para ese escenario, pero no se especifican los requisitos exactos.
- Opciones de despliegue: transformers (librería declarada), llama.cpp u Ollama a través de los GGUF publicados; vLLM y TGI no confirmados. El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: el autor reporta una aceleración de ~1,95× frente al base en varias tareas y una reducción del 58,5 % de thinking tokens; no se publican métricas absolutas de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B | 27,8 B | no disponible | Razonamiento eficiente, multimodal entrada | swift-open-license-1.0 (acceso restringido) | Hugging Face (gated), GGUF, API en Featherless |
| Qwen3.8-27B (base) | 27 B (según denominación) | no disponible | Modelo base de razonamiento | licencia de Qwen, no disponible en detalle | Hugging Face |
| Swift 1.0 Qwen3.8-27B | 27 B (según denominación) | no disponible | Razonamiento eficiente, versión previa | swift-open-license-1.0 | Hugging Face, 350k+ descargas |

No se dispone de datos de benchmarks desglosados que permitan comparar rendimiento numérico entre estos modelos más allá de los agregados indicados (+0,35 % de Swift 1.5 sobre el base, −58,5 % de thinking tokens).

## Limitaciones y advertencias

- Licencia propia `swift-open-license-1.0` con condiciones no detalladas en la información disponible; es imprescindible revisar el enlace de licencia antes de un uso comercial.
- Repositorio con acceso restringido (`gated: true`): es necesario solicitar acceso en Hugging Face.
- No se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otros idiomas distintos del inglés.
- No se publica la longitud de contexto, dato crítico para planificar despliegues con documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a los modelos de razonamiento; la compresión de cadenas de pensamiento puede reducir la trazabilidad del razonamiento en casos límite.
- Sesgos conocidos: no documentados en la información disponible.
- Las mejoras declaradas (+0,35 % agregado, −58,5 % de tokens) proceden del propio autor; no hay verificación independiente en la información disponible.
- El modelo es un ajuste fino sobre Qwen3.8-27B, por lo que hereda las limitaciones y sesgos del base, no detallados aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 8 de noviembre de 2026; se trata de una publicación muy reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michal-cb/Swift-1.5-Qwen3.8-27b
- Modelo original del autor: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Version GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo interactiva: https://ukisai.com/swift-games/27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- API serverless: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
