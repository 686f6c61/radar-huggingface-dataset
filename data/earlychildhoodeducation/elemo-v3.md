# Earlychildhoodeducation/EleMo-V3

## Resumen

EleMo-V3 (Elementary Pedagogical Model) es un modelo de lenguaje especializado en la generación de documentación pedagógica para educación infantil, desarrollado por el colectivo Earlychildhoodeducation. Su función principal es transformar notas de observación de educadores en "learning stories" (relatos de aprendizaje) redactados como cartas personales dirigidas al niño, siguiendo el marco pedagógico de Margaret Carr. El modelo está diseñado para ejecutarse íntegramente en local, con el objetivo explícito de garantizar la soberanía de datos y el cumplimiento del RGPD en el tratamiento de información sensible sobre menores.

Técnicamente, EleMo-V3 es un transformer denso de aproximadamente 26.900 millones de parámetros (26,9B), distribuido en formato MLX y safetensors, con soporte para alemán, inglés, francés y español. Su enfoque no es generalista: está ajustado para mantener fidelidad a la observación registrada, evitar la invención de hechos no documentados y adoptar una tonalidad afectiva y respetuosa. La versión V3 se presenta como una iteración de producción avanzada, entrenada sobre un conjunto equilibrado de 500 ejemplos y ampliada con más de 2000 muestras de "estándar platino".

La relevancia actual del modelo radica en su propuesta de "Zero-Cloud Guarantee": frente a modelos frontera que ofrecen mayor capacidad analítica pero devuelven un registro adulto y distante, EleMo-V3 prioriza la especialización pedagógica, la privacidad y el despliegue local. Su licencia, no obstante, restringe la explotación comercial, lo que lo posiciona como una herramienta para investigación, formación docente y proyectos comunitarios más que para productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante concreta en la información disponible) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Variantes cuantizadas hasta Q8 (según model card); formatos MLX y GGUF |
| Idiomas soportados | Alemán (de), inglés (en), francés (fr), español (es) |
| Licencia | Other (uso privado y no comercial hasta Q8; uso comercial restringido) |
| Formato de pesos | safetensors, MLX, GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de identificarlo como un transformer denso de 26,9B parámetros. El modelo parte de un checkpoint base denominado `Earlychildhoodeducation/EleMo-V3-Merged`, sobre el que se ha realizado un ajuste fino orientado a la tarea pedagógica. La model card menciona el uso de Unsloth en el pipeline de entrenamiento, lo que sugiere técnicas de fine-tuning eficiente en memoria.

El entrenamiento se describe como una versión de producción avanzada construida sobre un dataset equilibrado de 500 ejemplos (N=500 Balanced Dataset), complementado con más de 2000 muestras de "estándar platino". No se especifican el número total de tokens, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable no es arquitectónica sino de alineación conductual: el modelo incorpora en su comportamiento un protocolo estricto de fidelidad a la observación (no inventar emociones, intenciones ni capacidades no registradas) y un formato de salida fijo en forma de carta de 3-4 párrafos.

## Capacidades

- Generación de texto especializado en "learning stories" pedagógicas según el marco de Margaret Carr.
- Transformación de notas de observación en cartas personales dirigidas al niño, con estructura y tono predefinidos.
- Fidelidad a la observación: distingue entre datos de contexto (edad, género, área educativa, objetivo) y hechos observados, evitando inferencias no documentadas.
- Corrección lingüística de las notas de origen (ortografía y gramática) sin alterar el significado.
- Preservación de citas literales del niño, incluso en otros idiomas, sin corregir su gramática infantil.
- Capacidad multilingüe en alemán, inglés, francés y español.
- Soporte de plantilla de chat estándar (system, user, assistant) para integración en herramientas locales.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (Reasoning: Off en la configuración recomendada).

## Casos de uso

- Documentación pedagógica diaria en guarderías y centros de infantil: el educador introduce notas de observación en el bloque `<beobachtungsdaten>` y el modelo devuelve una carta lista para entregar a la familia, reduciendo el tiempo de redacción y manteniendo el tono afectivo exigido por el marco curricular.
- Formación inicial de docentes: uso en entornos de práctica para que los estudiantes comparen sus propias redacciones con las generadas por el modelo y analicen la diferencia entre observación y juicio evaluativo.
- Investigación sobre sesgos en documentación educativa: al ejecutarse en local y con un protocolo explícito de fidelidad, permite estudiar cómo se describen niños de distintos perfiles sin enviar datos a servicios en la nube.
- Despliegue en centros con requisitos estrictos de protección de datos: la "Zero-Cloud Guarantee" permite procesar observaciones de menores sin salida a Internet, cumpliendo con el RGPD en entornos donde el uso de APIs externas está prohibido.
- Traducción y adaptación de documentación entre los cuatro idiomas soportados: un centro bilingüe puede generar la carta en alemán y en francés a partir de las mismas notas, manteniendo la estructura y el tono.
- Proyectos comunitarios de código abierto en educación: al estar disponible en MLX y GGUF, puede integrarse en aplicaciones locales (LM Studio, Ollama, AnythingLLM) para prototipos de herramientas de documentación sin coste de licencia en contextos no comerciales.
- Auditoría de calidad documental: revisión de textos ya redactados para detectar invenciones, juicios de valor no sustentados o pérdida de citas literales del niño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un análisis comparativo cualitativo frente a Gemini 3.1 Pro recogido en el documento `EleMoV3_vs_Gemini3.1pro.pdf`, pero no se proporcionan métricas cuantitativas (MMLU, HumanEval, GSM8K ni otras) en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo denso de 26,9B parámetros, las estimaciones orientativas según cuantización serían aproximadamente 54 GB en FP16, 27 GB en Q8, 16-17 GB en Q4 y 10-12 GB en Q3, aunque estas cifras no las proporciona el autor y deben tomarse como cálculo teórico.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue en FP16 requeriría GPU de 80 GB (A100, H100); en Q8 podría caber en una A100 de 40 GB; en Q4 en GPUs de 24 GB como la RTX 4090.
- Compatibilidad con GPU de consumo: probable en cuantizaciones Q4 o inferiores en tarjetas de 24 GB, si bien no está confirmado por el autor.
- Opciones de despliegue: MLX (librería principal del repo), GGUF para llama.cpp/Ollama/LM Studio, y compatibilidad declarada con endpoints. No se menciona vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EleMo-V3 | 26,9B | No disponible | Documentación pedagógica infantil | Other (no comercial hasta Q8) | Hugging Face, MLX/GGUF |
| Gemini 3.1 Pro | No disponible | No disponible | Generalista | Propietaria | API de pago |
| Modelos generalistas open source de ~27B (p. ej. familia Qwen o Gemma) | ~27B | Variable | Generalista | Variable (a menudo permisiva) | Hugging Face, múltiples formatos |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La única comparación documentada es cualitativa frente a Gemini 3.1 Pro, donde el autor sostiene que EleMo-V3 supera al modelo generalista en tonalidad empática y foco en la co-construcción social, mientras que el modelo frontera mantiene mayor agudeza analítica pero recurre a un registro adulto y distante.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; al entrenarse sobre un dataset pequeño y equilibrado (N=500 más ampliación), puede heredar sesgos de las notas de observación originales y de la selección de ejemplos.
- Riesgo de alucinación: mitigado por diseño mediante el protocolo de fidelidad a la observación, pero no eliminado; el modelo podría añadir detalles no registrados si las notas son ambiguas.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que impide garantizar el procesamiento de notas extensas o conversaciones multi-turno largas.
- Limitaciones de idioma: solo se declaran alemán, inglés, francés y español; no hay evidencia de calidad en otras lenguas.
- Restricciones de licencia: la licencia "other" permite uso privado y no comercial hasta Q8; el uso comercial está expresamente prohibido bajo la licencia libre y requiere acuerdo aparte con el autor.
- Caveat para producción: el modelo está diseñado para una tarea muy concreta y un formato de salida fijo; su uso fuera del ámbito pedagógico o con prompts que se desvíen del system prompt recomendado puede degradar la calidad.
- Dependencia del system prompt: el comportamiento de fidelidad y tono depende en gran medida del prompt de sistema recomendado, por lo que su omisión o modificación altera los resultados.
- Tamaño del repositorio: 154,5 GB, lo que implica requisitos de almacenamiento considerables para descargar todas las variantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Earlychildhoodeducation/EleMo-V3
- Modelo base: https://huggingface.co/Earlychildhoodeducation/EleMo-V3-Merged
- DOI: https://doi.org/10.57967/hf/10808
- Documento comparativo mencionado en la model card: `EleMoV3_vs_Gemini3.1pro.pdf` (incluido en el repositorio, no se proporciona URL directa)
- Licencia: `LICENSE.md` (incluido en el repositorio, no se proporciona URL directa)
