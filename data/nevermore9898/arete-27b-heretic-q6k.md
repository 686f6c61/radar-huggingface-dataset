# Nevermore9898/Arete-27B-Heretic-Q6K

## Resumen

Arete-27B-Heretic-Q6K es una cuantización GGUF Q6_K del modelo Nevermore9898/Arete-27B-Heretic, un ajuste fino derivado de NousResearch/Arete-27B, que a su vez es un SFT (supervised fine-tuning) de Qwen/Qwen3.8-27B. El modelo base Arete-27B fue post-entrenado por Nous Research sobre el modelo chino Qwen3.8-27B para reforzar valores occidentales y eliminar respuestas enmarcadas por el Partido Comunista Chino en temas políticamente sensibles. Esta variante "Heretic" va un paso más allá en el eje de rechazos mediante un proceso automatizado de eliminación de LoRA (ARA) con Heretic 2.0.0.

La arquitectura subyacente es un transformer denso de tipo Qwen3 con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones), sin mezcla de expertos. El autor indica que el modelo incorpora una cabeza especulativa MTP (multi-token prediction) injertada desde el Qwen3.8-27B base, utilizable con el modo `--spec-type draft-mtp` de llama.cpp. El repositorio ocupa 23,4 GB y contiene el GGUF principal en Q6_K más un proyector de visión separado.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio de alineación inversa (eliminación automatizada de rechazos con control de divergencia KL); por otro, ofrece una receta reproducible de cuantización y despliegue en llama.cpp con decodificación especulativa. La licencia es Apache-2.0, heredada de Arete-27B y Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 (con cabeza especulativa MTP injertada) |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (131K, según notas de servicio del autor) |
| Tipos de cuantizacion | Q6_K (GGUF); el autor menciona una cuantización 4-bit usada durante los trials de Heretic |
| Idiomas soportados | No disponibles en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en GGUF F16 |
| Tamano del repo | 23,4 GB |
| Modelo base | NousResearch/Arete-27B, Qwen/Qwen3.8-27B |
| Fecha de creacion | 2026-11-07 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 con ~27,3 mil millones de parámetros. Sobre el Qwen3.8-27B original, Nous Research aplicó un SFT orientado a reforzar valores occidentales (Arete-27B). Posteriormente, el autor de esta variante aplicó Heretic 2.0.0 con su método ARA (automated LoRA removal): 60 trials, cada uno de unos 2,4 minutos sobre 2 GPUs de consumo (24 GB + 16 GB) con el modelo base cuantizado a 4 bits. Cada trial entrena una LoRA para reducir rechazos y se puntúa con una sonda de rechazo (n=100) y con divergencia KL frente al modelo base en texto neutro.

La selección del trial no escoge el de menor tasa de rechazo, sino el de menor KL dentro de una banda de tolerancia de rechazos. El trial t30 logra 0 rechazos pero con KL=11,07 (daño colateral severo); el trial t23, elegido, mantiene 4/100 rechazos con KL=0,197. El resultado es una LoRA pequeña fusionada por shards en los pesos base, sin edición de un vector de dirección de rechazo al estilo abliteration clásico. Después se injerta la cabeza MTP del Qwen3.8-27B base y se cuantiza a Q6_K con llama.cpp sin imatrix. El adaptador de Heretic no contiene claves de visión, por lo que el proyector `mmproj-Arete-27B-F16.gguf` (torre Qwen3-VL-2B, 885 MB) es idéntico al de las conversiones GGUF de Arete-27B.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 131K tokens.
- Razonamiento con modo "thinking" y modo sin thinking (el autor documenta diferencias de comportamiento entre ambos).
- Capacidades de visión mediante el proyector `mmproj-Arete-27B-F16.gguf` (torre Qwen3-VL-2B).
- Tool calling / function calling: el autor verificó llamadas limpias con `tool_choice: required` y `finish_reason: tool_calls` bien formado.
- Decodificación especulativa con la cabeza MTP injertada (`--spec-type draft-mtp` en llama.cpp).
- Capacidades multilingües: no documentadas en la información disponible.
- Comportamiento de rechazo reducido en temas políticamente sensibles (4/100 en la sonda del trial), con reencuadre de valores de Arete preservado.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo sirve como caso de estudio reproducible de eliminación automatizada de LoRA con control de KL, útil para comparar metodologías de abliteration frente a ARA.
- Evaluación de sesgos y encuadres políticos: permite medir cómo cambia el encuadre en temas sensibles (Taiwán, Xinjiang, Tiananmen) entre modos thinking y no-thinking, con las advertencias del autor sobre inconsistencias factuales.
- Despliegue local en estaciones de trabajo con 2 GPUs de consumo: el GGUF Q6_K con split en 2×24 GB y `-ngl 99` ofrece 42–49 tok/s de decodificación con drafting MTP, adecuado para prototipado interactivo.
- Asistentes conversacionales con contexto largo: los 131K tokens permiten mantener historiales extensos o documentos largos en memoria sin truncado agresivo.
- Pipelines con tool calling: la verificación de `tool_choice: required` y `finish_reason: tool_calls` lo hace apto para orquestación de funciones en agentes simples.
- Tareas multimodal ligeras: con el proyector de visión cargado, puede procesar imágenes junto a texto para descripción o extracción de información.
- Evaluación comparativa de cuantizaciones: al existir el modelo base BF16 y esta variante Q6_K, sirve para medir la degradación introducida por la cuantización en tareas de razonamiento y rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas internas del proceso Heretic y de servicio:

| Metrica | Valor | Contexto |
|---|---|---|
| Rechazos en sonda (t23, elegido) | 4/100 | Sonda del trial, n=100 |
| Divergencia KL (t23) | 0,197 | Frente al base en texto neutro |
| Rechazos en sonda (t30) | 0/100 | KL=11,07 (descartado) |
| Rechazos en sonda (t34) | 1/100 | KL=0,66 |
| Rechazos en sonda (t38) | 2/100 | KL=0,61 |
| Rechazos en sonda (t17) | 79/100 | KL=0,054 |
| Decodificacion (llama.cpp, 2×24 GB, `-ngl 99`, 131K ctx) | 42–49 tok/s | Con drafting MTP, aceptación ~30–37% |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q6_K pesa 22,4 GB, por lo que requiere al menos ~24 GB de VRAM para caber en una sola GPU con contexto moderado; el autor lo ejecuta en split de 2 GPUs (24 GB + 16 GB).
- GPU recomendadas: 2× RTX 3090/4090 (24 GB) o una RTX 4090/5090 de 24 GB+ con contexto reducido; A100 40/80 GB y H100 para contexto completo de 131K sin split.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB o superior, preferiblemente en configuración multi-GPU para contexto largo.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y `--spec-type draft-mtp`); compatible con endpoints según los tags del repo; no se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 42–49 tok/s de decodificación medidos por el autor en 2×24 GB con `-ngl 99` y contexto de 131K, con aceptación de drafting MTP del 30–37%.
- Memoria adicional: el proyector de visión `mmproj-Arete-27B-F16.gguf` añade 885 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Arete-27B-Heretic-Q6K (este) | ~27,3 B | 131K | Apache-2.0 | GGUF Q6_K, MTP injertado, rechazos reducidos (4/100) |
| NousResearch/Arete-27B | ~27,3 B | No disponible | Apache-2.0 | Base SFT de Qwen3.8-27B, sin modificación Heretic |
| Qwen/Qwen3.8-27B | ~27,3 B | No disponible | Apache-2.0 | Modelo original de Alibaba, con encuadre CCP según el autor |
| Qwen3.8-27B (variantes abliterated clásicas) | ~27,3 B | No disponible | Apache-2.0 (típicamente) | Edición de vector de rechazo; no comparable numéricamente sin datos |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor reconoce que las comprobaciones de comportamiento son cualitativas y de muestra pequeña ("small n"), no un benchmark.
- Se observó un error factual en modo sin thinking: una respuesta afirmó que el PCC "respondió con una huelga de hambre nacional" cuando fueron los estudiantes.
- En preguntas sobre Xinjiang con thinking desactivado, el modelo sigue liderando con el encuadre de Pekín.
- El comportamiento ante límites personales (frente a censura temática) no fue específicamente probado; el autor lo marca como no evaluado.
- Riesgo de alucinación no cuantificado; sin benchmarks estándar (MMLU, HumanEval, GSM8K) publicados.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe fuera del inglés.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de un post-entrenamiento sobre un modelo chino y de una modificación orientada a eliminar rechazos; conviene revisar implicaciones de cumplimiento y políticas de contenido antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente.
- La fecha de creación (2026-11-07) y el nombre Qwen3.8-27B deben tratarse como datos del autor; no se han verificado contra fuentes primarias en esta búsqueda.

## Enlaces

- Hugging Face: https://huggingface.co/Nevermore9898/Arete-27B-Heretic-Q6K
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (proyecto): https://heretic-project.org
- Blog de Nous Research sobre Arete-27B: https://nousresearch.com/arete
- Ficha de especificaciones y VRAM de Arete 27B: https://apxml.com/models/arete-27b
