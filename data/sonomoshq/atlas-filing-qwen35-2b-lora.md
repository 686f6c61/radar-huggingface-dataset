# sonomoshq/atlas-filing-qwen35-2b-lora

## Resumen

ATLAS Filing — Qwen3.5-2B LoRA es un adaptador LoRA (PEFT) que especializa el modelo base Qwen/Qwen3.5-2B en la generación de JSON de archivado documental conforme al esquema ATLAS: tipo de documento, fecha y rol definitorios, partes intervinientes, spans de evidencia, descripción y una marca `needs_review`. Lo publica el usuario `sonomoshq` bajo licencia Apache 2.0 y está pensado como checkpoint de investigación, no como artefacto listo para producción.

El adaptador no se entrena desde cero: arranca con un warm start a partir de una fusión/apilado del LoRA `doc_processing` de `btbtyler09/shrew-2b` (extracción estructurada de metadatos, unos 103.000 ejemplos) y después recibe un SFT específico sobre el esquema ATLAS, usando el dataset sintético `sonomoshq/atlas-filing-synthetic-v1`. El resultado es un modelo de 2B parámetros orientado a extracción estructurada y clasificación documental, no a conversación general.

Su relevancia es acotada pero concreta: demuestra un patrón de especialización barata (LoRA sobre un 2B) para tareas de filing documental con salida JSON estricta, y sirve como banco de pruebas para pipelines de extracción de metadatos legales o administrativos antes de escalar a modelos mayores. El autor advierte explícitamente de que debe cribarse en InternBench y en un conjunto retenido de documentos reales antes de cualquier uso productivo, y de que no debe sustituir a Qwen3.5 9B sin aprobación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-2B) con adaptador LoRA (PEFT) |
| Parametros totales | 2B en el modelo base; el adaptador LoRA añade parámetros no cuantificados en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato PEFT; la cuantización dependería del base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT (adaptador LoRA sobre safetensors del modelo base) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. La especialización se hace mediante LoRA, es decir, matrices de bajo rango inyectadas en las capas del modelo base, que permanece congelado. El entrenamiento es en dos fases: primero un warm start que continúa desde una fusión/apilado del LoRA `doc_processing` de `btbtyler09/shrew-2b`, entrenado con aproximadamente 103.000 ejemplos de extracción estructurada de metadatos; después, un SFT sobre el esquema ATLAS con el dataset sintético `sonomoshq/atlas-filing-synthetic-v1`.

La innovación técnica no está en la arquitectura, sino en la estrategia de inicialización: reutilizar un adaptador ya entrenado en extracción de metadatos reduce el coste de convergencia hacia el esquema ATLAS frente a un LoRA inicializado aleatoriamente. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset, uso de RLHF/DPO, ni técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Generación de JSON estructurado conforme al esquema ATLAS: tipo de documento, fecha y rol definitorios, partes, spans de evidencia, descripción y `needs_review`.
- Extracción de metadatos documentales a partir de texto de entrada (hereda la especialización `doc_processing` del warm start).
- Clasificación documental con marca de revisión humana (`needs_review`) para casos ambiguos.
- Localización de evidencia textual mediante spans, lo que facilita la verificación posterior.
- Generación de texto genérica limitada al comportamiento del base Qwen3.5-2B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Archivado automático de expedientes administrativos: el adaptador transforma el texto de un documento en un JSON ATLAS con tipo, fecha, partes y descripción, listo para ingerir en un gestor documental; su tamaño de 2B permite ejecutarlo en CPU o GPU modesta dentro del propio flujo de ingesta.
- Triaje de contratos y escrituras en un despacho legal: se usa para preclasificar documentos entrantes por tipo y partes antes de la revisión de un paralegal, aprovechando la marca `needs_review` para derivar los casos dudosos.
- Enriquecimiento de metadatos en repositorios documentales: extracción de fecha definitoria y rol de las partes para poblar índices de búsqueda, con spans de evidencia que permiten auditar cada campo extraído.
- Validación de pipelines de extracción: al ser un checkpoint de investigación, sirve como baseline barato para medir la calidad de un esquema ATLAS antes de invertir en un modelo mayor como Qwen3.5 9B.
- Prototipado de productos de gestión documental: equipos que necesitan demostrar una funcionalidad de filing estructurado sin presupuesto de inferencia pueden desplegar el adaptador sobre el 2B y sustituirlo después por un modelo mayor.
- Generación de datos de entrenamiento y evaluación: el JSON producido puede usarse para comparar contra anotaciones humanas y detectar patrones de error del esquema (campos vacíos, spans mal delimitados) antes de escalar el etiquetado.
- Filtrado previo en pipelines de descubrimiento documental (e-discovery): descarte rápido de documentos irrelevantes o marcado de aquellos que requieren revisión legal detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del esquema ATLAS; únicamente recomienda cribar el adaptador en InternBench y en un conjunto retenido de documentos reales antes de usarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 2B parámetros; en FP16 requiere aproximadamente 4-5 GB solo para pesos, más overhead de activaciones y KV cache. El adaptador LoRA añade una huella pequeña adicional.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; RTX 3060/4060, RTX 4090, A10, L4, A100 y H100 son opciones válidas. En cuantización de 4 bits el base cabría en GPUs de 4-6 GB, aunque la cuantización del adaptador no está documentada.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090, así como en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA, aunque la compatibilidad concreta con este checkpoint no está verificada en la información disponible. llama.cpp y Ollama requerirían fusionar el adaptador en el base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATLAS Filing — Qwen3.5-2B LoRA | 2B (base) + LoRA | no disponible | Filing documental ATLAS, JSON estructurado | Apache 2.0 | Hugging Face (PEFT) |
| Qwen/Qwen3.5-2B | 2B | no disponible | Modelo base generalista | no disponible en la informacion | Hugging Face |
| btbtyler09/shrew-2b (doc_processing) | 2B (base) | no disponible | Extracción de metadatos estructurados | no disponible en la informacion | Hugging Face |
| Qwen3.5 9B (mencionado por el autor) | 9B | no disponible | Modelo base de mayor capacidad | no disponible en la informacion | Hugging Face |

La comparación relevante es frente al base sin adaptar y frente al LoRA de origen: el adaptador ATLAS añade el esquema específico (partes, spans de evidencia, `needs_review`) que ninguno de los dos cubre por sí solo. Frente a Qwen3.5 9B, el 2B ofrece menor capacidad pero un coste de inferencia mucho menor; el autor prohíbe sustituir el 9B por este adaptador sin aprobación.

## Limitaciones y advertencias

- Checkpoint de investigación: la model card indica explícitamente que debe cribarse en InternBench y en un conjunto retenido de documentos reales antes de cualquier uso en producción.
- No debe sustituir a Qwen3.5 9B sin aprobación explícita del autor.
- Entrenado sobre un dataset sintético (`atlas-filing-synthetic-v1`), lo que puede provocar un desajuste con la distribución de documentos reales (formatos, jerga, escaneos ruidosos).
- Riesgo de alucinación en campos del JSON: fechas, partes o spans de evidencia pueden generarse de forma plausible pero incorrecta; la marca `needs_review` mitiga pero no elimina el problema.
- Idiomas soportados no documentados: no hay garantía de comportamiento correcto fuera del idioma o idiomas del dataset de entrenamiento.
- Longitud de contexto no documentada: documentos largos pueden truncarse o degradar la extracción.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un base generalista, puede heredar los sesgos de Qwen3.5-2B.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la calidad de la extracción y el cumplimiento normativo (por ejemplo, en contextos legales) recae en el integrador.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes), lo que reduce la evidencia externa sobre su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sonomoshq/atlas-filing-qwen35-2b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- LoRA de warm start: https://huggingface.co/btbtyler09/shrew-2b
- Dataset de entrenamiento: https://huggingface.co/datasets/sonomoshq/atlas-filing-synthetic-v1
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
