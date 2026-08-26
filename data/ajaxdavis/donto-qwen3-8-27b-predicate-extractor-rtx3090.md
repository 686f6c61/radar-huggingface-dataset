# ajaxdavis/donto-qwen3.8-27b-predicate-extractor-rtx3090

## Resumen

Donto Qwen3.8 27B predicate extractor es un adaptador LoRA desarrollado por ajaxdavis sobre el modelo base Qwen/Qwen3.8-27B, pensado para extracción de predicados y construcción de grafos de conocimiento. El modelo recibe un fragmento de documento y debe generar una llamada de herramienta validada `submit_facts` que contiene triples sujeto–predicado–objeto con predicados abiertos, de modo que no obliga a encajar cada fuente en una ontología fija en el momento de la extracción.

Esta versión concreta (`donto-qwen3.8-27b-predicate-extractor-rtx3090`) no añade un nuevo entrenamiento, sino que empaqueta el mismo LoRA V15 byte-idéntico al publicado en `donto-qwen3.8-27b-predicate-extractor` junto con un runtime de inferencia optimizado para ejecutarse en una sola NVIDIA RTX 3090 de 24 GB. El runtime aprovecha vLLM, decodificación especulativa, cuantización del modelo base y un overlay de instalación con verificación de integridad SHA-256. Según las mediciones del autor, se consigue un throughput agregado de 150,8–151,2 tokens por segundo frente a los 48,6 del runtime original, con una calidad de extracción ligeramente superior en recall y precisión exactas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA rank-16 alpha-32 sobre Qwen3.8-27B (dense, 27B parámetros, 64 capas con atención híbrida: 16 full attention + 48 linear attention) |
| Parámetros totales | 27B (base) + adaptador LoRA (repo de 3.3 GB) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Máximo 2.672 tokens en el perfil admitido del runtime; el base Qwen3.8-27B soporta 150k–262k tokens |
| Tipos de cuantización | BF16 (base), NF4 (candidato AX), int4 lm_head calibrado, W4A16 drafter DFlash2 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA), conversión a layout de claves de vLLM incluida |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformador denso de 27B parámetros con atención híbrida: solo 16 de las 64 capas ejecutan atención completa, mientras que las otras 48 usan atención lineal con un estado recurrente constante. Sobre este base se entrena un adaptador LoRA de rank 16 y alpha 32 (versión V15) con un dataset propio de extracción de predicciones (`ajaxdavis/donto-qwen3.8-27b-predicate-extraction-data`). El autor no detalla el número de tokens de entrenamiento, el tipo de datos exacto ni si se usaron métodos de RLHF o DPO; la model card solo indica que el adaptador es byte-idéntico al del repositorio original y que no hubo un segundo entrenamiento en esta versión.

La innovación principal está en el runtime de inferencia. Para lograr ejecución en una RTX 3090 de 24 GB, se combinan varias técnicas: cuantización int4 del lm_head con calibración, decodificación especulativa con un drafter `Qwen3.8-27B-DFlash2-W4A16`, verificación de atención split-KV, y una gestión de slots de secuencia que admite cuatro secuencias residentes en GPU. El instalador overlay es fail-closed: verifica el SHA-256 de cada componente antes de modificar el runtime. El autor documenta además los perfiles rechazados, incluyendo un intento de mezclar LoRA en BF16 sobre base NF4 que no alcanzaba los umbrales de calidad.

## Capacidades

- Extracción de predicciones y relaciones: convierte un chunk de documento en una llamada a herramienta `submit_facts` con triples sujeto–predicado–objeto, incluyendo un campo de confianza (`c`) y un marcador de hipótesis (`h`).
- Generación de salida estructurada: genera JSON válido para el esquema `submit_facts`, sin scraping de prosa.
- Tool calling / function calling: sí, con validación de argumentos en entrenamiento y evaluación.
- Soporte de agentes y razonamiento multi-paso: el modelo está diseñado para ser usado como herramienta dentro de un pipeline de construcción de grafos de conocimiento, no como agente autónomo.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: decodificación especulativa, cuantización int4 del lm_head y compatibilidad con vLLM.

## Casos de uso

- Construcción de grafos de conocimiento: el modelo convierte documentos corporativos, técnicos o científicos en triples RDF con predicados abiertos, listos para integrarse en una base de conocimiento sin necesidad de ontología previa.
- Extracción de relaciones para RAG semántico: enriquecer un sistema de recuperación aumentada con hechos estructurados extraídos de las fuentes, mejorando la precisión de las respuestas.
- Minería de contratos y documentos legales: extraer obligaciones, plazos y sujetos implicados en formato estructurado para su posterior análisis.
- Análisis de literatura científica: generar afirmaciones sujeto–predicado–objeto que pueden alimentar bases de datos de conocimiento biomédico o técnico.
- Enriquecimiento de ontologías: proponer nuevos predicados a partir de los datos extraídos, facilitando la evolución del esquema de conocimiento.
- Asistencia a la revisión documental: clasificar y validar afirmaciones extraídas de un corpus, marcando con `h` las interpretaciones hipotéticas para que un humano las revise.
- Despliegue en hardware consumer: dado que el runtime está optimizado para una RTX 3090, es viable ejecutar extracción de relaciones en una estación de trabajo sin acceso a GPUs de centro de datos.

## Benchmarks y rendimiento

Las mediciones del autor se realizaron sobre una única NVIDIA RTX 3090, con un fixture congelado de diez documentos y un conjunto de validación disjunto de 1.085 filas. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

| Métrica | Runtime V15 original | Runtime rtx3090 | Requisito |
|---|---:|---:|---:|
| Throughput agregado de salida | 48.576 tok/s | 150.801–151.187 tok/s | ≥145.728 tok/s |
| Throughput medio | — | 150.978 tok/s | — |
| Speedup mínimo sobre baseline | 1.00× | 3.104× | ≥3.00× |
| Recall exacto (1.085 filas) | 93.318% | 93.832% | ≥88.652% |
| Precisión exacta (1.085 filas) | 93.888% | 94.228% | ≥89.194% |
| Llamadas estructuradas válidas | 1.085/1.085 | 1.085/1.085 | 1.085/1.085 |

Barrido de concurrencia (solicitudes simultáneas sobre el mismo fixture de diez documentos):

| Clientes solicitados | Clientes efectivos | Throughput agregado (tok/s) | Tiempo de pared |
|---:|---:|---:|---:|
| 1 | 1 | 65.667 | 89.786 s |
| 2 | 2 | 104.567 | 56.385 s |
| 3 | 3 | 133.385 | 44.203 s |
| 4 | 4 | 152.080 | 38.769 s |
| 5 | 5 | 154.281 | 38.216 s |
| 6 | 6 | 154.116 | 38.257 s |
| 7 | 7 | 155.612 | 37.889 s |
| 8 | 8 | 155.946 | 37.808 s |
| 9 | 9 | 154.588 | 38.140 s |
| 10 | 10 | 155.211 | 37.987 s |
| 11 | 10 | 153.067 | 38.519 s |
| 12 | 10 | 155.162 | 37.999 s |

## Requisitos de hardware

- GPU mínima: NVIDIA RTX 3090 con 24 GB de VRAM (perfil admitido y medido).
- VRAM estimada: el base BF16 de 27B más el drafter W4A16 requieren cuantización int4 del lm_head y gestión de memoria de vLLM para caber en 24 GB; el runtime limita la longitud máxima de secuencia a 2.672 tokens.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 (aunque el perfil está diseñado para la 3090, las técnicas de cuantización y decodificación especulativa son transferibles).
- Opciones de despliegue: vLLM con el overlay instalador, llama.cpp no está soportado en esta versión; el autor no menciona Ollama.
- Latencia y throughput: agregado de 150,8–151,2 tok/s con 4 solicitudes simultáneas; pico de 155,9 tok/s con 8 clientes; el servidor mantiene 4 slots de secuencia residentes en GPU.
- Dependencias externas: se debe descargar el modelo base Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), el repositorio `syv-ai/qwen38-27b-rtx3090` (commit `60daef8255b6757d9791955a44bce27df1658ea6`) y el drafter `Qwen3.8-27B-DFlash2-W4A16`.

## Comparativa con modelos similares

La información disponible no permite una comparación directa con otros extractores de predicciones o de relaciones. Se puede comparar con el modelo base sin adaptador y con el runtime original:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (extracción) |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 150k–262k | Apache-2.0 | Sin adaptación a `submit_facts`; requiere prompt manual |
| Donto Qwen3.8-27B V15 (runtime original) | 27B + LoRA | 2.672 tok (perfil) | Apache-2.0 | 48.576 tok/s, recall 93.318% |
| Donto Qwen3.8-27B r18 (este modelo) | 27B + LoRA | 2.672 tok (perfil) | Apache-2.0 | 150.978 tok/s, recall 93.832% |

No hay datos públicos de otros modelos especializados en extracción de predicciones con los que comparar en los resultados de búsqueda.

## Limitaciones y advertencias

- Solo soporta inglés; no se han documentado capacidades multilingües.
- La longitud de contexto efectiva en el runtime es de 2.672 tokens, muy inferior al contexto nativo del base (150k–262k). Para documentos largos hay que partir en chunks.
- El repositorio no incluye el modelo base BF16 ni el drafter; es necesario descargarlos por separado de fuentes upstream, lo que añade dependencias de red y de integridad.
- El instalador overlay exige verificación de SHA-256 y un entorno Linux nativo; no está documentado el soporte para Windows o macOS.
- Riesgo de alucinación en predicciones: el campo `h` (hipótesis) existe precisamente para marcar afirmaciones interpretativas, pero el autor no publica métricas de calibración de la confianza `c`.
- El autor documenta que el candidato AX (NF4 base primero) superó la calidad del baseline pero dejaba solo dos solicitudes en GPU; el perfil admitido AY compacta las tablas de vocabulario para admitir cuatro solicitudes. Esto implica que el runtime es sensible al orden de carga y a la cuantización.
- Licencia Apache-2.0 permite uso comercial, pero el repositorio depende de componentes de terceros (`syv-ai/qwen38-27b-rtx3090`) cuyas licencias no se detallan en la model card; se debe revisar antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ajaxdavis/donto-qwen3.8-27b-predicate-extractor-rtx3090
- Adaptador original byte-idéntico: https://huggingface.co/ajaxdavis/donto-qwen3.8-27b-predicate-extractor
- Dataset de entrenamiento: https://huggingface.co/datasets/ajaxdavis/donto-qwen3.8-27b-predicate-extraction-data
- Repositorio del runtime base RTX 3090: https://github.com/syv-ai/qwen38-27b-rtx3090
- Ficha de FriendliAI: https://friendli.ai/models/ajaxdavis/donto-qwen3.8-27b-predicate-extractor
- Documentación de vLLM sobre Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
