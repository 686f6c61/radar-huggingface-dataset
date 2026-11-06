# Kant0game/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen
El modelo Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es una cuantización en formato GGUF de un ajuste fino de la familia Qwen3.5, publicado por el usuario Kant0game a partir del modelo base de DavidAU. Se trata de un modelo de 8.953.803.264 parámetros (aproximadamente 9B) derivado de Qwen3.5, sometido a un proceso de "abliteration" y ajuste multi-etapa para eliminar los mecanismos de rechazo y moderación, orientado a usos creativos, narrativa, rol y generación de código sin restricciones de contenido.

El modelo se distribuye exclusivamente en formato GGUF con cuantizaciones NEO Imatrix y variantes MTP (multi-token prediction) pensadas para acelerar la inferencia. El autor declara una ventana de contexto de 256k tokens, soporte de visión previa descarga de un archivo mmproj separado, y modos de razonamiento e instruct conmutables en tiempo de ejecución. La licencia declarada es Apache 2.0, aunque el proceso de "heretización" y los datos de ajuste no están documentados con detalle.

La relevancia actual del modelo radica en su propuesta de rendimiento en benchmarks de conocimiento general (ARC-C, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande) superando, según el autor, a modelos base de mayor tamaño como Qwen3.5-27B o Qwen3.6-35B-A3B en varias de esas pruebas, manteniendo un tamaño de 9B que permite despliegue en hardware de consumo. No obstante, estas cifras provienen únicamente de la model card y no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5 (detalles internos no disponibles) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 256k tokens (según model card) |
| Tipos de cuantizacion | GGUF en varias precisiones: bf16/16-bit, mxfp8, mxfp4, Q4_K_S, Q6, Q8; variantes regulares y MTP, todas con NEO Imatrix |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento
La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5, con 8.953.803.264 parámetros. El modelo publicado es una cuantización GGUF del ajuste fino de DavidAU, que a su vez se construyó mediante un proceso multi-etapa y multi-modelo: según la model card, se combinaron varios ajustes finos propios de 9B sobre Qwen3.5 mediante merges y entrenamiento adicional, con el objetivo declarado de elevar la inteligencia general y el seguimiento de instrucciones. El autor indica que el modelo fue "heretizado" (eliminación de comportamientos de rechazo) y entrenado después de ese proceso.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado. Las innovaciones técnicas documentadas se centran en la cuantización: las variantes NEO Imatrix mejoran, según el autor, la precisión de las cuantizaciones entre un 2 y un 4 % respecto a GGUF convencionales y el rendimiento en contexto largo; el tensor de salida se mantiene en precisión de 16 bits en todas las cuantizaciones, y los tensores MTP se fijan a Q8_0. Las variantes MTP implementan predicción multi-token para acelerar la decodificación.

## Capacidades
- Generación de texto general, con modos diferenciados de razonamiento (thinking) e instruct conmutables en tiempo de ejecución mediante API o a nivel de mensaje en el chat.
- Razonamiento multi-paso y modo "thinking" con bloque de razonamiento compactado según el autor.
- Generación de código y tareas de programación (etiquetado como coder en la model card).
- Escritura creativa, ficción y roleplaying, sin mecanismos de rechazo por contenido (modelo "uncensored"/"abliterated").
- Capacidad multimodal imagen-texto: la visión está activada pero requiere descargar un archivo mmproj separado.
- Soporte multilingüe limitado a inglés y chino.
- Seguimiento de instrucciones reforzado mediante ajuste multi-etapa.
- Compatibilidad con endpoints y aplicaciones estándar de inferencia GGUF (LM Studio, llama.cpp y similares).

## Casos de uso
- Escritura de ficción y narrativa sin restricciones: el proceso de abliteration elimina los rechazos, lo que permite generar tramas, diálogos y escenas adultas o violentas que otros modelos filtran; el contexto de 256k facilita mantener coherencia en novelas largas.
- Roleplaying y personajes conversacionales: los modos instruct y thinking conmutables permiten alternar respuestas rápidas en personaje y razonamiento interno; el contexto largo sostiene sesiones multi-turno extensas.
- Asistencia a la programación en local: con etiqueta coder y cuantizaciones de 4 a 8 bits, puede integrarse en editores o pipelines de CI/CD para autocompletado y generación de pruebas en máquinas con una sola GPU de consumo.
- Procesamiento de documentos largos en inglés o chino: la ventana de 256k tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o bases de código extensas sin fragmentación.
- Análisis de imágenes con texto asociado: descargando el archivo mmproj, el modelo puede describir capturas, diagramas o documentos escaneados y combinarlos con razonamiento textual.
- Prototipado rápido de agentes y asistentes: al ser GGUF y compatible con endpoints estándar, se puede desplegar en LM Studio o llama.cpp para experimentar con flujos de razonamiento y herramientas sin infraestructura dedicada.
- Generación de contenido editorial sin moderación para entornos controlados: guiones, material de marketing o textos técnicos donde los filtros de seguridad de modelos alineados resultan un obstáculo, asumiendo la revisión humana posterior.

## Benchmarks y rendimiento
Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente. Se recogen en modo instruct y con el arnés de evaluación del autor.

| Modelo (precisión) | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Defiant-Fable 9B (bf16) | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| Defiant-Fable 9B (mxfp8) | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| Defiant-Fable 9B (mxfp4) | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct base (mxfp8) | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.5-27B-Instruct base (mxfp8) | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |
| Qwen3.6-27B-Instruct base (mxfp8) | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.6-35B-A3B-Instruct base (mxfp8) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |
| Qwen3.8-27B base (mxfp8) | 0.591 | 0.782 | 0.896 | 0.746 | 0.448 | 0.801 | 0.711 |

El autor afirma además un rendimiento de 640 en ARC-C tanto en 8 como en 4 bits, y que el modelo supera a Qwen3.5-27B, Qwen3.6-35B-A3B y Qwen3.8-27B en 7 de 7 benchmarks, aunque iguala o queda por debajo de Qwen3.6-27B en varias métricas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de razonamiento o código en la información disponible.

## Requisitos de hardware
- VRAM estimada: una cuantización Q4_K_S de un modelo de 9B ocupa en torno a 5-6 GB; Q8 en torno a 9-10 GB; bf16 en torno a 18 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados en la model card.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB) o A100/H100; para Q8, una RTX 3090/4090 o superior; para Q4, una RTX 3060 de 12 GB o incluso GPUs de 8 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones Q4 o Q5; las variantes Q6/Q8 requieren 12-24 GB.
- Opciones de despliegue: llama.cpp, LM Studio (usado por el autor en sus pruebas), Ollama y cualquier runtime compatible con GGUF. El formato no es directamente compatible con vLLM o TGI sin conversión.
- Rendimiento declarado: en Q4_K_S sobre una RTX 5090 con Windows 11 y LM Studio, las variantes regulares alcanzan unas 130 t/s y las MTP pueden superar las 185 t/s con una tasa de aceptación del 60 % (2 tokens). En Linux o macOS el autor indica que suele ser más rápido.
- Las variantes MTP requieren temperatura igual o inferior a 1 y repetition penalty desactivado (1) para no degradar la aceptación de tokens; si la aceptación cae por debajo del 50 %, el autor recomienda usar las cuantizaciones regulares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Defiant-Fable 9B (este modelo) | ~9B | 256k | Apache 2.0 | GGUF | Sin censura, visión opcional, modos thinking/instruct |
| Qwen3.5-9B-Instruct (base) | ~9B | no disponible | Apache 2.0 (según base) | safetensors/GGUF | Alineado con filtros; menores puntuaciones en ARC según el autor |
| Qwen3.6-27B-Instruct | ~27B | no disponible | no disponible | no disponible | Mayor tamaño; supera al 9B en HellaSwag y WinoGrande según la tabla del autor |
| Qwen3.6-35B-A3B-Instruct | ~35B (MoE, activos no disponibles) | no disponible | no disponible | no disponible | MoE de mayor tamaño; el 9B lo supera en ARC-C y ARC-E según el autor |

No se dispone de datos verificados de contexto, licencia ni formato para los modelos comparables más allá de lo reflejado en la tabla de benchmarks de la model card.

## Limitaciones y advertencias
- Modelo "uncensored" y "abliterated": elimina deliberadamente los mecanismos de rechazo, por lo que puede generar contenido ofensivo, violento, sexual o ilegal sin filtro. No es apto para aplicaciones dirigidas al público general sin capas de moderación externas.
- Los benchmarks proceden exclusivamente del autor, se han ejecutado con su propio arnés y en modo instruct; no hay validación independiente y deben tomarse con cautela.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La licencia Apache 2.0 se declara en el repositorio, pero el proceso de heretización y los datos de ajuste no están documentados, lo que puede plantear dudas sobre la procedencia de los datos de entrenamiento en un uso comercial.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en tareas de razonamiento complejo o contexto muy largo; el contexto de 256k declarado no garantiza recuperación fiable de información en posiciones lejanas.
- La visión requiere descargar un archivo mmproj adicional; sin él, el modelo funciona solo como texto.
- El repositorio ocupa 204,9 GB, lo que implica una descarga considerable si se quieren varias cuantizaciones.
- Las variantes MTP pueden ser más lentas que las regulares si la tasa de aceptación de tokens cae por debajo del 50 % o si se usan temperaturas altas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento en producción.

## Enlaces
- Hugging Face: https://huggingface.co/Kant0game/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo relacionado citado por el autor (Qwen3.6-27B Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Apoyo al autor: https://www.buymeacoffee.com/davidbelton
