# mradermacher/medgap-qwen-3.5-9b-GGUF

## Resumen

medgap-qwen-3.5-9b-GGUF es una versión cuantizada en formato GGUF del modelo medgap-qwen-3.5-9b, desarrollado por protocolsyncllc. Este modelo es un fine-tuning de la familia Qwen 3.5 de 9B parámetros, entrenado específicamente con el dataset protocolsyncllc/fda-warning-letters, compuesto por cartas de advertencia de la FDA. El objetivo es ofrecer un asistente especializado en tareas de cumplimiento normativo y regulación sanitaria en inglés.

La cuantización, realizada por mradermacher, permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtime compatibles con GGUF, reduciendo los requisitos de memoria respecto al modelo original. El modelo tiene 9.197.093.888 parámetros y se distribuye bajo licencia llama3. La longitud de contexto no está especificada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere un transformer de la familia Qwen 3.5, pero no se especifica en la información disponible) |
| Parametros totales | 9.197.093.888 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | llama3 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base, cuyo nombre indica que es un fine-tuning de la familia Qwen 3.5 de 9B parámetros, se ha ajustado sobre el dataset protocolsyncllc/fda-warning-letters. No se dispone de información detallada sobre la arquitectura exacta (número de capas, mecanismos de atención, etc.), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La conversión a GGUF ha sido realizada por mradermacher mediante cuantizaciones estáticas; no se han publicado cuantizaciones con imatrix o pesos ponderados en el momento de la consulta.

## Capacidades

- Generación y comprensión de texto en inglés especializado en el ámbito médico y regulatorio.
- Según los tags y el dataset, el modelo está orientado al análisis de cartas de advertencia de la FDA, por lo que puede ayudar a identificar incumplimientos, requisitos y plazos mencionados en dichos documentos.
- Asistencia en tareas de cumplimiento normativo: interpretar y resumir comunicaciones de agencias reguladoras.
- No se ha documentado soporte de tool calling, function calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Revisión de cartas de advertencia de la FDA: el modelo puede procesar una carta de advertencia y extraer las secciones clave (hallazgos, requisitos, plazos), lo que permite a los equipos de calidad y cumplimiento priorizar las acciones correctivas.
- Generación de resúmenes regulatorios: a partir de documentos largos de la FDA, el modelo puede producir resúmenes ejecutivos en inglés, facilitando la comunicación entre departamentos.
- Clasificación de no conformidades: dada una descripción de un problema de cumplimiento, el modelo puede clasificarlo según categorías habituales en las cartas de advertencia de la FDA.
- Redacción de borradores de respuestas: el modelo puede redactar borradores de respuestas a requerimientos regulatorios, que un experto en asuntos regulatorios debe revisar y validar antes de enviar.
- Análisis de tendencias en avisos regulatorios: al procesar un conjunto de cartas de advertencia, el modelo puede identificar patrones recurrentes de incumplimiento y ayudar a detectar riesgos emergentes.
- Formación interna en cumplimiento: el modelo puede generar casos prácticos y preguntas de examen basados en cartas reales de la FDA, para entrenar a nuevo personal de asuntos regulatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar el overhead del contexto): Q2_K ~4 GB, Q3_K_S ~4.5 GB, Q3_K_M ~4.8 GB, Q4_K_S ~5.6 GB, Q6_K ~7.7 GB, Q8_0 ~9.9 GB, f16 ~18.5 GB. La VRAM real necesaria será mayor; por ejemplo, para Q4_K_S se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB para Q4_K_S; RTX 4090 24 GB para Q8_0; A100 40 GB para f16.
- Sí cabe en GPU de consumo: las cuantizaciones Q4_K_S y menores pueden ejecutarse en una RTX 3060 12 GB; Q8_0 requiere una GPU de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| medgap-qwen-3.5-9b-GGUF | 9.197.093.888 | no disponible | llama3 | GGUF | no disponible |
| protocolsyncllc/medgap-qwen-3.5-9b (base) | 9.197.093.888 | no disponible | llama3 | safetensors | no disponible |
| mradermacher/Qwen3.5-9B-Neo-GGUF | no disponible | no disponible | no disponible | GGUF | no disponible |
| mradermacher/Qwen3.5-9B-abliterated-v2-MAX-GGUF | no disponible | no disponible | no disponible | GGUF | no disponible |

## Limitaciones y advertencias

- Sesgos: al estar entrenado con cartas de advertencia de la FDA, el modelo puede presentar un sesgo hacia el lenguaje regulatorio formal y las normativas estadounidenses, lo que puede limitar su utilidad en otros contextos regulatorios.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto. Se recomienda validar cualquier salida con un experto humano antes de su uso en producción.
- Limitaciones de idioma: el modelo solo soporta inglés (en); no está preparado para otros idiomas.
- Longitud de contexto: no se especifica en la información disponible, por lo que el rendimiento en documentos muy largos es incierto.
- Licencia: la licencia llama3 (Licencia Llama 3 Community) puede imponer restricciones al uso comercial; es necesario revisar los términos de la licencia antes de desplegar el modelo en producción.
- Cuantización: las versiones GGUF cuantizadas pueden presentar una ligera pérdida de calidad respecto al modelo original en f16, especialmente en cuantizaciones agresivas como Q2_K.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/medgap-qwen-3.5-9b-GGUF
- Modelo base en HuggingFace: https://huggingface.co/protocolsyncllc/medgap-qwen-3.5-9b
- Dataset de cartas de advertencia de la FDA: https://huggingface.co/datasets/protocolsyncllc/fda-warning-letters
