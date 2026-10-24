# anno001/cybergym-llama-expert

## Resumen

`anno001/cybergym-llama-expert` es un ajuste fino (fine-tune) del modelo base abierto SmolLM3-3B-Base, publicado por el usuario `anno001` en octubre de 2026. Se ha entrenado con aprendizaje supervisado (SFT) usando la librería TRL, según los metadatos de la model card, y se distribuye en formato `safetensors` para la librería `transformers`. A pesar del nombre, no deriva de ningún modelo de la familia Llama: el checkpoint base declarado es SmolLM3-3B-Base, un transformer denso de aproximadamente 3.000 millones de parámetros.

El modelo no incluye documentación sobre el conjunto de datos, hiperparámetros, número de tokens de entrenamiento ni evaluación. El nombre sugiere una especialización en ciberseguridad, probablemente relacionada con el benchmark CyberGym (evaluación de agentes de IA sobre 1.507 vulnerabilidades históricas de 188 proyectos de software), pero esta vinculación no está documentada en el repositorio.

Su interés práctico, si el ajuste funciona según lo que sugiere el nombre, sería disponer de un modelo de 3 B parámetros con ventana de contexto larga (heredada del base) y coste de despliegue muy bajo, usable en local o en una única GPU de consumo. Con cero descargas y cero valoraciones en el momento de redactar esta ficha, no existe validación comunitaria del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de SmolLM3-3B: atención con GQA y capas NoPE intercaladas) |
| Parametros totales | ~3 B (heredados del modelo base SmolLM3-3B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible para el fine-tune; el modelo base soporta 64K tokens nativos, extensibles a 128K con YaRN |
| Tipos de cuantizacion | no disponible (no se publican GGUF, AWQ ni GPTQ); al ser safetensors para transformers se puede cuantizar a 8 y 4 bits con bitsandbytes |
| Idiomas soportados | no disponible para el fine-tune; el modelo base declara seis idiomas (inglés, francés, alemán, español, italiano y portugués) |
| Licencia | no disponible (la model card solo contiene el marcador `licence: license`); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Pipeline en transformers | no disponible |
| Fecha de publicacion | 23 de octubre de 2026 |
| Tamano reportado del repo | 0,1 GB (inferior al esperado para los pesos completos de un modelo de 3 B en bf16, ~6 GB) |

## Arquitectura y entrenamiento

El fine-tune parte de SmolLM3-3B-Base, un transformer decoder-only denso de unos 3.000 millones de parámetros entrenado por Hugging Face sobre 11,2 billones de tokens, con atención de consultas agrupadas (GQA) y capas sin codificación posicional (NoPE) intercaladas cada cuatro bloques para favorecer el contexto largo. El checkpoint base es un modelo preentrenado, no un modelo instruct, por lo que no incorpora de origen ni plantilla de chat conversacional ni modo de razonamiento extendido. La arquitectura del fine-tune no se modifica: se conservan número de capas, cabezas y vocabulario del base.

Sobre el entrenamiento del ajuste solo se declara el uso de SFT con TRL 1.16.0, Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifican el dataset, su composición, el número de tokens vistos, la longitud de secuencia, la tasa de aprendizaje, si hubo etapas de preferencia (DPO/APO) ni ningún proceso de evaluación. La model card está generada automáticamente por la plantilla de TRL y no aporta innovaciones técnicas propias.

## Capacidades

- Generación de texto autoregresiva en formato conversacional: el ejemplo de la model card invoca `pipeline("text-generation", ...)` con una lista de mensajes con rol `user`, lo que implica el uso de una plantilla de chat.
- Razonamiento y conocimiento general heredados del modelo base, limitados por el hecho de que el punto de partida es un checkpoint Base y no Instruct.
- Generación de código y matemáticas: capacidad esperable por la composición del preentrenamiento de SmolLM3, aunque no hay evaluación que lo confirme en este fine-tune.
- Especialización probable en ciberseguridad (análisis de vulnerabilidades, lectura de parches, razonamiento sobre CVE) según el nombre del modelo; no documentada.
- Capacidades multilingües: no documentadas para el fine-tune; el base cubre seis idiomas.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas ni de agentes.
- Modo de razonamiento explícito (`thinking mode`): no disponible; el base no lo incorpora y el ajuste no lo declara.
- Visión y audio: no soportados (modelo puramente textual).

## Casos de uso

- Triaje de informes de vulnerabilidades: con 64K tokens de contexto heredados del base, el modelo puede ingerir un informe completo junto con fragmentos de código afectado y producir un resumen estructurado (componente, vector de ataque, impacto) para priorizar la cola de un equipo de seguridad.
- Revisión asistida de parches en C/C++: dado un diff y el fichero original, generar una explicación del cambio y señalar posibles introducciones de memoria insegura; el tamaño de 3 B permite ejecutarlo en la misma máquina del revisor sin enviar código propietario a la nube.
- Asistente local en entornos air-gapped: al caber en una GPU de consumo y no requerir API externa, es apto para estaciones de trabajo de auditoría con requisitos de confidencialidad estrictos.
- Generación de documentación técnica de seguridad: convertir avisos crudos y notas de versión en borradores de boletines o entradas de base de conocimiento interna.
- RAG sobre bases de datos de CVE y avisos: como generador final de un pipeline de recuperación, respondiendo preguntas del tipo "¿qué versiones de esta librería están afectadas y qué mitiga el problema?" citando los fragmentos recuperados.
- Formación y concienciación: entorno de prácticas donde el modelo explica conceptos de explotación y defensa a partir de código de ejemplo, ejecutándose en local para evitar costes por token.
- Preprocesado y etiquetado de corpus de seguridad: clasificación y normalización de textos técnicos (informes, commits, boletines) a gran escala con un modelo pequeño y rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica (ni MMLU, ni HumanEval, ni GSM8K, ni resultados sobre CyberGym), y tampoco se aportan datos de evaluación del ajuste frente al checkpoint base. Tampoco se han encontrado cifras asociadas a este repositorio en la búsqueda web; los resultados de CyberGym disponibles públicamente corresponden a otros modelos y no son atribuibles a este fine-tune.

## Requisitos de hardware

- VRAM para inferencia (estimación a partir del tamaño del base): ~6,2 GB en bf16/fp16 solo para pesos; ~3,2 GB en cuantización de 8 bits; ~1,9-2,1 GB en 4 bits.
- Caché KV: con GQA de 4 cabezas KV y 36 capas, se estima del orden de 70 KB por token en bf16 (estimación propia sobre la arquitectura del base), es decir, varios GB adicionales si se explotan las ventanas de 32K-64K tokens. Conviene limitar `max_model_len` en producción.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 o RTX 4060 Ti 16 GB para bf16 con contexto moderado; A100/H100 solo justificables por concurrencia, no por tamaño del modelo. Cabe en GPUs de consumo desde 8 GB si se cuantiza a 4 bits con contexto corto.
- Despliegue: `transformers` (ruta directa, la única documentada por el autor), vLLM o TGI con pesos safetensors, y llama.cpp/Ollama tras convertir a GGUF (no hay GGUF publicado en el repo).
- Latencia y throughput: no disponible; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `anno001/cybergym-llama-expert` | ~3 B | no disponible en el fine-tune (base: 64K, 128K con YaRN) | no disponible | 0 descargas, 0 likes; sin evaluaciones | no disponible |
| SmolLM3-3B-Instruct (Hugging Face) | ~3 B | 64K nativos, 128K con YaRN | Apache-2.0 | Amplia, con receta de entrenamiento publicada | Referencia pública; no comparable aquí por falta de datos del fine-tune |
| Qwen2.5-3B-Instruct (Alibaba) | ~3 B | 32K nativos, 128K con YaRN | Apache-2.0 | Amplia, versiones GGUF/AWQ de la comunidad | Referencia pública; no comparable aquí |
| Llama-3.2-3B-Instruct (Meta) | ~3 B | 128K | Llama 3.2 Community License | Amplia, ecosistema GGUF/Ollama maduro | Referencia pública; no comparable aquí |

La comparación relevante en términos de linaje es con SmolLM3-3B-Instruct: comparte arquitectura y contexto, pero este fine-tune parte del checkpoint Base, no documenta su dataset y no ofrece garantías de seguimiento de instrucciones comparable.

## Limitaciones y advertencias

- Documentación mínima: la model card es la plantilla automática de TRL; no hay información sobre datos, hiperparámetros, evaluación ni uso previsto.
- Licencia indeterminada: el campo de licencia contiene solo el marcador `licence: license`. No se puede asumir uso comercial aunque el modelo base sea Apache-2.0, porque los términos del fine-tune no están declarados.
- Sin validación externa: cero descargas y cero likes en el momento de la ficha; ningún tercero ha reportado resultados.
- Tamaño del repositorio anómalo: 0,1 GB es muy inferior a los ~6 GB esperados para los pesos de un modelo de 3 B en bf16. Puede tratarse de una subida parcial, de un formato comprimido o de un error de reporte; verificar el contenido antes de descargar y desplegar.
- Riesgo de alucinación: un modelo de 3 B ajustado con SFT sobre un dominio técnico puede producir identificadores de CVE, nombres de funciones y vectores de ataque plausibles pero falsos. En ciberseguridad esto es especialmente crítico y exige verificación humana.
- Doble uso: si el ajuste está orientado a explotación de vulnerabilidades, existe riesgo de generar contenido ofensivo o PoC incorrectas que den falsa confianza.
- Sesgos desconocidos: al no publicarse la composición del dataset de SFT, no es posible evaluar sesgos de dominio, idioma o geográficos.
- Idiomas y contexto no garantizados: aunque el base cubre seis idiomas y 64K tokens, el ajuste puede haber degradado el multilingüismo y la coherencia en contextos largos; no hay ninguna medición.
- Sin soporte declarado de tool calling ni de agentes: no apto, sin validación previa, para pipelines que dependan de function calling.
- Fechas y versiones del stack poco habituales (TRL 1.16.0, Transformers 5.20.2, PyTorch 2.11.0), lo que puede complicar la reproducibilidad con entornos actuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anno001/cybergym-llama-expert
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Repositorio de TRL: https://github.com/huggingface/trl
- CyberGym (sitio del benchmark): https://www.cybergym.io/cybergym/
- CyberGym Observatory: https://www.cybergym.io/
- Repositorio GitHub de CyberGym: https://github.com/sunblaze-ucb/cybergym
- Leaderboard CyberGym en llm-stats: https://llm-stats.com/benchmarks/cybergym
- Leaderboard CyberGym en BenchLM: https://benchlm.ai/benchmarks/cybergym
