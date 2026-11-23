# aitamedia/LingSante-3.1-air-VL-MXFP4

## Resumen

LingSante-3.1-air-VL es un modelo multimodal nativo de tipo mezcla de expertos (MoE) desarrollado por el equipo de salud de Ant Group (publicado bajo el handle `aitamedia` en Hugging Face) y orientado a aplicaciones sanitarias reales. Se construye sobre Ling-3.0-flash-VL y cuenta con 124.000 millones de parámetros totales, de los cuales 5.500 millones se activan por token, con una ventana de contexto de 256.000 tokens y entrada conjunta de texto e imágenes.

El modelo se presenta como el primer gran modelo multimodal médico que el equipo de salud de Ant Group libera como código abierto. Sus cuatro áreas clínicas de enfoque son los informes de imagen médica, la evaluación sanitaria multimodal (reconocimiento de enfermedades cutáneas, análisis dietético y nutricional, interpretación de informes médicos), la búsqueda médica con síntesis de evidencia y los agentes GUI médicos. Además, conserva capacidades generales de comprensión de documentos y gráficos, búsqueda multimodal y uso de herramientas.

La ficha que nos ocupa, `aitamedia/LingSante-3.1-air-VL-MXFP4`, es una variante cuantizada a 8 bits en formato MXFP4/FP8 del modelo base, con pesos en safetensors y un repositorio de 69,6 GB. Es relevante ahora porque permite desplegar un modelo médico multimodal de 124B en infraestructuras más modestas que las requeridas por los pesos en precisión completa, manteniendo el pipeline `image-text-to-text` y la licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal nativo (`bailing_moe_v3_vl`), con decodificación especulativa MTP (NEXTN) y atención de contexto largo |
| Parametros totales | 64.450.477.776 (según safetensors de esta variante cuantizada); el modelo base declara 124B |
| Parametros activos | 5.500 millones por token (modelo base) |
| Longitud de contexto | 256.000 tokens (262.144 con YaRN) |
| Tipos de cuantizacion | MXFP4 / FP8 (8 bits) en esta variante; el modelo base se distribuye en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado, `custom_code`) |

## Arquitectura y entrenamiento

LingSante-3.1-air-VL emplea una arquitectura transformer de mezcla de expertos (MoE) con capacidades multimodales nativas: procesa texto e imágenes en el mismo espacio de tokens. El modelo base declara 124B de parámetros totales con 5,5B activos por token, lo que reduce el coste computacional por inferencia respecto a un modelo denso del mismo tamaño. El runtime está optimizado para SGLang con soporte nativo multimodal, decodificación especulativa MTP (NEXTN) y optimizaciones de contexto largo (YaRN con `rope_theta` 6.000.000, `partial_rotary_factor` 0,5 y longitud original de 131.072 tokens).

El entrenamiento combina datos médicos multimodales con *replay* de datos multimodales generales y alineación en tareas generales, de modo que el modelo no pierde comprensión general, OCR, interpretación de documentos y gráficos, búsqueda multimodal ni interacción con GUI. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO; esos datos figuran como no disponibles. La innovación destacable es el entrenamiento conjunto médico-general con trayectorias de razonamiento trazables (imagen → búsqueda → evidencia → respuesta) y soporte de agentes GUI sobre aplicaciones reales.

## Capacidades

- Comprensión y razonamiento médico multimodal: revisa historia clínica, técnica de imagen y calidad antes de interpretar; redacta secciones de Hallazgos e Impresión.
- Interpretación conjunta de múltiples imágenes e identificación de 8-9 tipos de hallazgos positivos en una radiografía de tórax compleja (cardiomegalia, derrame pleural, atelectasia, consolidación, neumonía, neumotórax).
- Evaluación sanitaria con preguntas de seguimiento: cubre más de 120 enfermedades cutáneas y toma anamnesis multi-turno (zona afectada, duración, picor o dolor, antecedentes).
- Análisis dietético y nutricional: identifica ingredientes solapados o mezclados, descompone platos complejos, estima porciones y analiza nutrientes.
- Interpretación de informes médicos: cruza recuentos sanguíneos con marcadores inflamatorios e inmunitarios para priorizar acciones.
- Búsqueda médica y síntesis de evidencia: búsqueda imagen-a-imagen, recuperación de artículos, guías clínicas y casos similares; uso de herramientas de imagen y *bounding boxes* para verificar lesiones.
- Agentes GUI médicos: reserva de citas (hospital, departamento, médico, franja), compra de medicamentos (búsqueda, especificaciones, receta, dirección, gestión de pop-ups y validaciones).
- Uso de herramientas (*tool calling* / *function calling*) con parser `ling3` en SGLang; requiere entorno externo que provea herramientas, mantenga estado y valide acciones.
- Modo de razonamiento explícito (`enable_thinking`).
- Capacidades generales conservadas: OCR, comprensión de documentos y gráficos, búsqueda multimodal y GUI.

## Casos de uso

- Redacción asistida de informes de radiología: el modelo recibe una o varias imágenes (radiografía de tórax, por ejemplo) y genera un informe estructurado con Hallazgos e Impresión, adecuado como borrador para revisión por radiólogos gracias a su contexto de 256K tokens que permite adjuntar historial y estudios previos.
- Triaje dermatológico con anamnesis: ante una foto de una lesión cutánea, el modelo formula preguntas de seguimiento (duración, picor, antecedentes) antes de emitir una evaluación orientativa, útil en aplicaciones de telemedicina de primera línea.
- Análisis nutricional de comidas: a partir de una fotografía de un plato, descompone ingredientes, estima porciones y calcula nutrientes, integrable en apps de seguimiento dietético.
- Interpretación de analíticas para pacientes: el modelo cruza recuentos sanguíneos con marcadores inflamatorios y propone prioridades de seguimiento, sirviendo como capa de explicación en portales de resultados.
- Búsqueda de evidencia clínica: combinado con un motor de búsqueda de artículos y guías, el modelo ejecuta el flujo imagen → búsqueda → evidencia → respuesta y cita la evidencia que respalda cada conclusión, útil en herramientas de apoyo a la decisión.
- Agentes GUI para gestión sanitaria: automatiza la reserva de citas en portales hospitalarios (selección de hospital, departamento, médico y franja, introducción de datos del paciente) y la compra de medicamentos con receta, gestionando pop-ups y validaciones en aplicaciones reales.
- Documentación clínica y OCR: extrae y estructura información de informes médicos escaneados, gráficos y tablas gracias a sus capacidades de OCR y comprensión documental conservadas del entrenamiento general.

## Benchmarks y rendimiento

La model card incluye una imagen de comparación de benchmarks (`assets/benchmark-results.png`) y otra de visión general (`assets/benchmark-overview.png`), pero los valores numéricos no están disponibles en formato textual en la información proporcionada. No se han publicado resultados de benchmarks en formato tabular en la información disponible.

## Requisitos de hardware

- VRAM estimada: esta variante MXFP4/FP8 de 8 bits ocupa aproximadamente 69,6 GB en disco; en inferencia requiere del orden de 70-80 GB de VRAM solo para pesos, más memoria para caché KV de contexto largo.
- La configuración de referencia del modelo base en SGLang usa 4 GPU de clase 141 GB (TP4) para 256K de contexto con YaRN, u 8 GPU H100/H800 de 80 GB con `--tp 8`.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) en su configuración completa; requeriría múltiples GPU o un despliegue con cuantización adicional no documentada.
- Opciones de despliegue: SGLang es el runtime recomendado (imagen `lmsysorg/sglang:dev-Ling-3.0-flash-VL`), con soporte de parser de razonamiento y de tool calling `ling3`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Optimizaciones de decodificación en Hopper: `SGLANG_ENABLE_FP8_BLOCK_GEMV=1` y `SGLANG_ENABLE_FUSED_KDA_OUTPUT_QUANT=1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingSante-3.1-air-VL (esta variante MXFP4) | 124B totales / 5,5B activos (base); 64,45B en safetensors de esta variante | 256K | Texto + imagen | MIT | Hugging Face |
| Ling-3.0-flash-VL (modelo base) | No disponible en la información | No disponible | Texto + imagen | No disponible | Hugging Face (inclusionAI) |
| Alternativas médicas multimodales de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo es un modelo de investigación y no un dispositivo médico; sus salidas pueden ser incompletas o inexactas y no sustituyen el consejo, diagnóstico o tratamiento profesional.
- Los usos de alto riesgo requieren revisión por personal cualificado, validación independiente y cumplimiento de la normativa de privacidad, seguridad y salud aplicable.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en contexto clínico.
- Los flujos de búsqueda, uso de herramientas y GUI requieren un entorno externo que provea herramientas, mantenga estado y valide acciones; el modelo por sí solo no ejecuta esas acciones.
- Idiomas soportados no disponibles; no se puede confirmar el rendimiento en castellano.
- La variante MXFP4/FP8 puede degradar ligeramente la precisión respecto al modelo base en precisión completa; no se documentan métricas de esa degradación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial, pero la advertencia de modelo de investigación y la ausencia de validación clínica limitan su uso en producción sanitaria sin supervisión.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/aitamedia/LingSante-3.1-air-VL-MXFP4
- Modelo base Ling-3.0-flash-VL: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- Organización inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Imagen de benchmarks (visión general): `assets/benchmark-overview.png` (en el repositorio)
- Imagen de comparación de benchmarks: `assets/benchmark-results.png` (en el repositorio)
