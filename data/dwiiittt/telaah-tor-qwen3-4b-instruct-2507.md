# dwiiittt/telaah-tor-qwen3-4b-instruct-2507

## Resumen

TELAAH-TOR-Qwen3-4B-Instruct-2507 es un modelo de lenguaje especializado en la evaluacion de la logicidad de documentos TOR/KAK (Terminos de Referencia / Kerangka Acuan Kerja) del Ministerio de Comunicacion y Asuntos Digitales de Indonesia (Komdigi). Desarrollado por el usuario dwiiittt, se construye mediante supervised fine-tuning con LoRA sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, y se distribuye como modelo combinado en bf16 listo para usar sin necesidad de PEFT. Forma parte de un pipeline mayor denominado TELAAH que abarca extraccion de TOR/RAB, verificacion de completitud y evaluacion de logicidad.

El modelo resuelve un problema muy concreto: determinar si cada seccion de un documento TOR cumple los criterios de logicidad definidos en la checklist de revision PMK 41/2026, concretamente los items I.M a I.R. Para cada grupo de secciones del TOR, el modelo devuelve un unico objeto JSON con tres campos: `logis` (verdadero/falso), `alasan` (justificacion de 1 a 3 frases con cita textual de evidencia) y `saran` (sugerencia de mejora, vacia si el contenido es logico). Esta especializacion lo hace relevante para la automatizacion de revisiones documentales administrativas en el sector publico indonesio.

Con 4.022.468.096 parametros (aproximadamente 4 mil millones), el modelo es de tamano compacto y esta disenado para despliegue economico. Su contexto, tipos de cuantizacion y otros detalles tecnicos no estan disponibles en la informacion proporcionada. El modelo solo soporta indonesio y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Instruct-2507) con adaptador LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene pesos bf16; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) con LoRA sobre Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4 mil millones de parametros. El adaptador LoRA se fusiona con los pesos base, dando como resultado un checkpoint unico en bf16 que no requiere PEFT para su uso. El repo del adaptador LoRA sin fusionar esta disponible por separado en dwiiittt/telaah-tor-qwen3-4b-instruct-2507-lora.

El entrenamiento se realizo con la libreria TRL sobre un dataset especifico de evaluacion de logicidad de TOR/KAK. Segun la model card, se fine-tunearon cinco modelos con el mismo dataset, split y receta (casi identica) y se evaluaron con la metrica F1 de la clase "no logico" y la validez del JSON de salida. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales. La innovacion tecnica principal no reside en la arquitectura sino en el diseno del prompt de sistema por grupo de secciones y en el formato de salida JSON estrictamente estructurado, que garantiza parseabilidad en el 100% de los casos evaluados (0 de 928 outputs no parseables).

## Capacidades

- Generacion de texto en indonesio con formato JSON estructurado y validado.
- Evaluacion de logicidad de secciones de documentos TOR/KAK segun criterios PMK 41/2026 (items I.M a I.R).
- Razonamiento acotado a criterios: distingue entre contenido logico y no logico basandose en la presencia de elementos concretos (por ejemplo, mencion de metodo contractual o swakelola, presencia de etapas y plazos).
- Extraccion de evidencia textual: incluye citas literales de 5 a 10 palabras del texto evaluado en el campo `alasan`.
- Generacion de sugerencias de mejora contextualizadas en el campo `saran`.
- Manejo de entradas en texto plano o Markdown, incluyendo tablas.
- Evaluacion de relaciones padre-hijo entre items (por ejemplo, I.M.1 se considera logico solo si I.M.2 e I.M.3 lo son).
- No soporta tool calling ni function calling de forma nativa segun la informacion disponible.
- No soporta agentes multi-paso ni razonamiento multi-turno complejo; esta disenado para una unica llamada por grupo de secciones.
- No soporta vision, audio ni otras modalidades.
- No dispone de modo "thinking" explicito documentado.

## Casos de uso

- Revision automatizada de documentos TOR en el sector publico indonesio: el modelo evalua cada grupo de secciones (Latar Belakang, Penerima Manfaat, Strategi, Kurun Waktu, Biaya, Manajemen Risiko) y devuelve un JSON con el veredicto de logicidad, permitiendo a los revisores humanos centrarse solo en las secciones marcadas como no logicas.

- Pre-validacion en pipelines de contratacion publica: antes de enviar un TOR a revision formal, el modelo puede ejecutarse como paso previo para detectar secciones incompletas o mal estructuradas, reduciendo el numero de iteraciones de revision.

- Integracion en el pipeline TELAAH: el modelo encaja como modulo de evaluacion de logicidad despues de la extraccion de TOR/RAB y la verificacion de completitud, permitiendo un flujo completamente automatizado desde el documento bruto hasta el informe de hallazgos.

- Asistencia a redactores de TOR: dado un borrador de seccion, el modelo devuelve `saran` con una sugerencia concreta de mejora, que puede mostrarse en un editor como ayuda contextual antes de la validacion formal.

- Auditoria de consistencia documental: al evaluar items padre-hijo (I.M.1 depende de I.M.2 e I.M.3; I.O.1 depende de I.O.2 e I.O.3), el modelo puede usarse para verificar la coherencia interna de un TOR y detectar contradicciones entre secciones relacionadas.

- Generacion de informes de revision estructurados: como la salida es JSON valido en el 100% de los casos evaluados, el modelo se puede integrar en sistemas que agreguen los veredictos de multiples documentos en dashboards o informes de cumplimiento sin necesidad de post-procesamiento complejo.

- Clasificacion binaria de calidad documental a escala: con 4 mil millones de parametros, el modelo puede desplegarse en infraestructura modesta para procesar lotes grandes de documentos TOR de forma economica, algo relevante para ministerios con alto volumen de contrataciones.

## Benchmarks y rendimiento

La model card reporta una comparativa de cinco modelos fine-tuneados con el mismo dataset y split, evaluados con F1 de la clase "no logico", validez del JSON y precision a nivel de documento:

| Modelo | F1 no logico | Outputs JSON no parseables | Precision documento | Balanced accuracy documento |
|---|---|---|---|---|
| Qwen-SEA-LION-v4-8B-VL | 0,976 | 0 / 928 | 98,2% | 97,7% |
| **Qwen3-4B-Instruct-2507 (este modelo)** | **0,969** | **0 / 928** | **96,5%** | **95,3%** |
| granite-4.1-8b | 0,953 | 0 / 928 | 95,2% | 92,1% |
| Phi-4-mini-instruct | 0,940 | 0 / 928 | 94,7% | ~91,2% |
| Komdigi-UGM-KPM-4B-CPT-8k | 0,908 | 115 / 928 | 93,9% | 93,0% |

Segun el autor, SEA-LION v4 8B obtiene resultados ligeramente superiores (diferencia de 4 de 228 documentos; aproximadamente 6 de 1.216 items, sin prueba de significancia). Qwen3-4B-Instruct-2507 se elige por tener el mismo 100% de JSON valido, la mitad de tamano (mas barato de entrenar y desplegar) y ser el modelo base designado por el equipo. No se reportan resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4,02 mil millones de parametros x 2 bytes), mas memoria para KV cache y overhead del runtime; se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB; en 4 bits: aproximadamente 2,5-3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con throughput alto; RTX 4090 o RTX 3090 para desarrollo y pruebas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 sin problema; en RTX 3060 (12 GB) en bf16 con contexto limitado o en cuantizacion de 8/4 bits.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles (etiqueta `endpoints_compatible`). No se documenta soporte explicito de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 no logico (tarea TELAAH) | JSON valido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **TELAAH-TOR-Qwen3-4B** | 4,02 B | No disponible | 0,969 | 100% | Apache 2.0 | Hugging Face |
| Qwen-SEA-LION-v4-8B-VL | ~8 B (no confirmado) | No disponible | 0,976 | 100% | No disponible | Hugging Face (referenciado) |
| granite-4.1-8b | ~8 B (no confirmado) | No disponible | 0,953 | 100% | No disponible | Hugging Face (referenciado) |
| Phi-4-mini-instruct | No disponible | No disponible | 0,940 | 100% | No disponible | Hugging Face (referenciado) |
| Komdigi-UGM-KPM-4B-CPT-8k | ~4 B (no confirmado) | 8k (por el nombre) | 0,908 | 87,6% (115/928 no parseables) | No disponible | Hugging Face (referenciado) |

La comparativa se limita a los modelos evaluados por el autor en la misma tarea. No se dispone de datos de benchmarks generales para comparar con alternativas fuera del dominio TOR/KAK.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo esta entrenado para evaluar logicidad de TOR/KAK segun PMK 41/2026; su uso fuera de este dominio producira resultados poco fiables.
- Idioma unico: solo soporta indonesio; no se ha entrenado ni evaluado en otros idiomas.
- Sesgo de dominio: el modelo refleja los criterios y la interpretacion de la normativa PMK 41/2026 por parte del autor y del equipo; cambios normativos o interpretaciones alternativas pueden no estar cubiertos.
- Riesgo de alucinacion: aunque el formato JSON es estrictamente validado, el contenido de `alasan` y `saran` puede contener citas o sugerencias inexactas; se recomienda revision humana en decisiones de alto impacto.
- Dependencia del prompt de sistema: el modelo espera un system prompt especifico por grupo de secciones, identico al usado en entrenamiento; desviarse de ese formato puede degradar el rendimiento.
- Cobertura parcial: los items I.A a I.L (verificacion de existencia) no son competencia del modelo; los gestiona un motor de checklist basado en reglas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la exactitud legal de las evaluaciones.
- Sin datos de contexto, cuantizacion ni latencia: la informacion publicada es insuficiente para planificar despliegues de alta concurrencia sin pruebas propias.
- Sin validacion de significancia estadistica: la comparativa con SEA-LION v4 8B no incluye prueba de significancia, por lo que la diferencia de rendimiento podria no ser concluyente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dwiiittt/telaah-tor-qwen3-4b-instruct-2507
- Adaptador LoRA: https://huggingface.co/dwiiittt/telaah-tor-qwen3-4b-instruct-2507-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
