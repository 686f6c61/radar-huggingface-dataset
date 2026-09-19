# philgear/pocketgull-circular-posology-1b

## Resumen

PocketGull Circular Posology & Planetary Health Engine es un adaptador LoRA publicado por PocketGull LLC (Oregon Registry 258869891) sobre el modelo base google/gemma-3-1b-it. No es un modelo completo, sino un ajuste fino con PEFT que añade conocimiento especializado en lo que el autor denomina "posología circular": evaluación de estabilidad extendida de comprimidos según el programa SLEP de la FDA, criterios de redistribución de medicamentos precintados a repositorios benéficos, auditoría de ecotoxicidad acuática de principios activos y modelado de ciclos cerrados de nitrógeno y fósforo en sistemas de "anthroponics".

El adaptador se ha entrenado, según la model card, mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos de dominio específico, con de-identificación conforme al estándar HIPAA §164.514 Safe Harbor. Los tags del repositorio hacen referencia a los corpus NIH MedQuAD y WHO mhGAP, aunque no se detalla composición ni volumen de tokens. El autor presenta el proyecto como parte de una suite de ciencia clínica abierta con DOI en Zenodo y lo orienta a computación local en el borde para evitar retención de información de salud protegida (PHI).

Se trata de un artefacto de nicho, muy reciente y sin tracción (0 descargas y 0 likes en el momento de la consulta), con una única finalidad declarada: servir de herramienta de apoyo documental a profesionales sanitarios con licencia, encuadrada explícitamente fuera de la definición de dispositivo médico según FDA 520(o) CDS. Su relevancia práctica depende enteramente de validación externa que, a día de hoy, no existe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de google/gemma-3-1b-it, con adaptador LoRA (PEFT) acoplado |
| Parámetros totales | Aproximadamente 1.000 millones en el modelo base; número de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (viene determinada por el modelo base google/gemma-3-1b-it) |
| Tipos de cuantización | No disponible; la model card no especifica cuantizaciones publicadas |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 para el adaptador; el modelo base se rige por los términos de uso de Gemma de Google |
| Formato de pesos | Adaptador PEFT/LoRA; formato de fichero no especificado de forma explícita (el estándar de PEFT es safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de google/gemma-3-1b-it, un transformer decoder-only de aproximadamente 1.000 millones de parámetros en su variante instruct. Sobre esa base, el autor entrena un adaptador LoRA de bajo rango, lo que implica que el modelo completo se obtiene cargando primero el base y superponiendo después los pesos del adaptador mediante la librería PEFT. No se publican en la model card ni el rango del adaptador, ni el número de módulos objetivo, ni el valor de alpha.

En cuanto al entrenamiento, la única información disponible indica que se empleó Direct Preference Optimization (DPO) sobre "conjuntos de datos clínicos de dominio específico" conformes con la de-identificación HIPAA §164.514 Safe Harbor. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, si hubo fases previas de SFT, ni hiperparámetros como tasa de aprendizaje o número de épocas. Los tags del repositorio mencionan los corpus NIH MedQuAD y WHO mhGAP como referencia temática, pero no se documenta cómo se integraron. No se describen innovaciones técnicas propias: no hay decodificación especulativa, atención lineal ni mecanismos híbridos; el valor diferencial declarado es puramente de dominio (estabilidad extendida, redistribución, ecotoxicidad y antropónica).

## Capacidades

- Generación de texto en inglés orientada a consultas clínicas y farmacéuticas de dominio acotado.
- Evaluación de estabilidad extendida de formas sólidas orales (comprimidos) más allá de la fecha de caducidad etiquetada, en el marco del programa SLEP de la FDA, según lo declarado por el autor.
- Emisión de criterios de elegibilidad para redistribución de medicamentos en blíster precintado a repositorios benéficos (referencia a SIRUM).
- Auditoría de ecotoxicidad acuática para estrógenos sintéticos, fluoroquinolonas y macrólidos, con directrices estrictas de no verter al desagüe.
- Modelado conceptual de ciclos cerrados de nitrógeno y fósforo en sistemas de anthroponics ("liquid gold").
- Razonamiento sobre interacciones farmacológicas, citado en los ejemplos de la model card (por ejemplo, hierba de San Juan junto con warfarina y metabolismo CYP450).
- Soporte de tool calling / function calling: no disponible; no se documenta en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ejemplo de uso es una única pasada de generación con `max_new_tokens=256` y `temperature=0.2`.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Capacidades especiales: no se declaran modos de pensamiento, visión ni audio.
- Encuadre regulatorio declarado como apoyo a la decisión clínica no dispositivo (FDA 520(o) CDS), con computación local para evitar retención de PHI.

## Casos de uso

- Verificación de caducidad en farmacia hospitalaria: ante un lote de comprimidos caducados hace meses, el modelo puede generar un análisis estructurado sobre si procede evaluar estabilidad extendida según SLEP y qué factores de almacenamiento (blíster, temperatura, humedad) condicionan la estimación de potencia química.
- Triaje de donaciones a repositorios solidarios: un servicio de farmacia puede usar el modelo para clasificar qué presentaciones precintadas cumplen criterios de redistribución y cuáles deben descartarse, generando justificación documental por lote.
- Auditoría medioambiental de botiquines: el modelo permite generar informes sobre riesgo ecotoxicológico de principios activos concretos y la vía de eliminación recomendada, útil en campañas municipales de recogida de medicamentos.
- Formación de residentes de farmacia: como generador de escenarios comentados sobre interacciones farmacológicas e idoneidad de conservación, con la ventaja de ejecutarse localmente sin exponer datos de pacientes reales.
- Asistente documental en entorno edge: al ser un adaptador de 1B, puede desplegarse en una estación de trabajo clínica o en una instancia privada de Vertex AI para responder consultas de referencia sin enviar texto a terceros.
- Apoyo a la redacción de procedimientos internos: generación de borradores de protocolos de no vertido y de gestión de residuos farmacéuticos, con terminología regulatoria consistente.
- Pre-cribado de de-identificación: uso del modelo como primera pasada para detectar posibles identificadores antes de aplicar una herramienta formal de anonimización, aunque sin garantía de cobertura completa.
- Modelado de sostenibilidad en proyectos de agricultura circular: generación de descripciones de ciclos cerrados de nutrientes para documentación técnica de sistemas anthroponics, fuera del ámbito clínico estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MedQA / MedQuAD (dominio declarado) | No disponible |
| Evaluaciones de seguridad clínica | No disponible |

## Requisitos de hardware

Estimaciones orientativas calculadas a partir del tamaño del modelo base (aproximadamente 1.000 millones de parámetros); no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en bf16/fp16: del orden de 3 a 4 GB contando pesos y caché de activaciones para contextos moderados.
- VRAM en cuantización de 8 bits: aproximadamente 1,5 a 2,5 GB.
- VRAM en cuantización de 4 bits: aproximadamente 1,0 a 1,5 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM resulta suficiente; RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4, A10G, A100 y H100 son válidas por exceso de capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de gama media o superior, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers + PEFT (ruta documentada en la model card), fusión del adaptador y conversión a GGUF para llama.cpp u Ollama, vLLM con soporte de adaptadores LoRA, y TGI con adaptadores. El despliegue en Vertex AI se menciona en la model card como opción alineada con el enfoque de privacidad.
- Latencia y throughput: no disponibles; no se aportan cifras medidas. Cualquier estimación sería especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocketgull-circular-posology-1b (este modelo) | ~1.000 M base + adaptador LoRA | No disponible | Farmacia circular, SLEP, ecotoxicidad, anthroponics | apache-2.0 (adaptador) | HuggingFace, 0 descargas en el momento de la consulta |
| google/gemma-3-1b-it | ~1.000 M | No disponible en la información proporcionada | Propósito general, instrucciones | Términos de uso de Gemma | HuggingFace, ampliamente distribuido |
| Adaptadores LoRA clínicos de tamaño similar | No disponible | No disponible | Variable según autor | Variable | No disponible |

No se dispone en la información proporcionada de comparativas de rendimiento frente a alternativas. La comparación con otros adaptadores clínicos de 1B requiere consultar repositorios especializados, y no se han encontrado datos verificables en la búsqueda web realizada.

## Limitaciones y advertencias

- Ausencia total de resultados de benchmarks: no hay evidencia publicada de calidad, precisión clínica ni tasas de error.
- Riesgo elevado de alucinación con consecuencias graves: cualquier salida relativa a dosis, estabilidad, interacciones o ecotoxicidad debe ser verificada por un profesional cualificado antes de tomar decisiones.
- El modelo se declara expresamente como herramienta de apoyo a la decisión clínica no clasificada como dispositivo médico (FDA 520(o) CDS); no está autorizado para diagnóstico ni prescripción autónoma.
- Idiomas: solo inglés. El uso en castellano no está soportado ni evaluado.
- Licencia del adaptador apache-2.0, pero el modelo base google/gemma-3-1b-it se rige por los términos de uso de Gemma de Google, que imponen obligaciones adicionales para uso comercial y redistribución. La licencia del adaptador no exime de cumplir la del base.
- Dataset de entrenamiento no documentado: se desconoce el volumen de tokens, la composición real, los criterios de filtrado y si hubo fases de SFT previas al DPO. No puede auditarse el origen de los sesgos.
- El etiquetado HIPAA Safe Harbor describe el estándar seguido en la preparación de datos, no una garantía de que el modelo no pueda reproducir identificadores en sus salidas.
- Sesgos potenciales: al estar especializado en un dominio farmacéutico muy concreto y en fuentes estadounidenses (FDA, SIRUM), puede reflejar sesgos regulatorios y de práctica clínica propios de ese contexto, poco transferibles a otros sistemas sanitarios.
- Inconsistencia de identificadores: la model card indica `adapter_id = "pocketgull-llc/pocketgull-circular-posology-1b"` mientras que el identificador del repositorio consultado es `philgear/pocketgull-circular-posology-1b`. Conviene verificar cuál es el canónico antes de integrarlo en un pipeline.
- Madurez: 0 descargas y 0 likes, sin issues ni validación comunitaria, lo que dificulta estimar su comportamiento en producción.
- La fecha de creación registrada (2026-09-18) y el DOI de Zenodo asociado deben verificarse directamente en las fuentes antes de citarlo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no debe asumirse su integración en flujos agénticos sin pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philgear/pocketgull-circular-posology-1b
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- DOI de Zenodo: https://doi.org/10.5281/zenodo.20647514
- Sitio de la organización: https://pocketgull.com
- Sitio del proyecto: https://pocketgull.app
- ORCID del responsable: https://orcid.org/0009-0008-1372-5381
- Búsqueda web realizada: no devolvió resultados relevantes; los enlaces obtenidos correspondían a portales inmobiliarios sin relación con el modelo.
