# qalduaij/lolo_Q8y_General_E2B

## Resumen

lolo_Q8y_General_E2B (Q8y General Edge E2B) es un ajuste fino de tipo LoRA sobre `unsloth/gemma-4-E2B-it`, desarrollado por Qusai Al-duaij (qalduaij) dentro de la denominada familia "lolo AI Ecosystem". El modelo está especializado en asuntos públicos, institucionales, históricos y culturales de Kuwait, con una política lingüística estricta de árabe estándar moderno formal (MSA) y sin dialecto, complementada con transferencia cruzada árabe-inglés. Se distribuye como adaptador LoRA, como pesos completos en safetensors y como cuantizaciones GGUF para despliegue local.

La arquitectura subyacente es Gemma 4 en su variante "Effective 2B Edge", un transformer multimodal de tipo image-text-to-text. El repositorio declara 5.123.178.051 parámetros reales en safetensors (el nombre "E2B" refleja los parámetros efectivos del modelo base, no el total almacenado). El ajuste se realizó con r=32 y alpha=64 sobre 238.779 registros SFT estructurados en cuatro niveles de conocimiento, extraídos de 1.372 fuentes históricas e institucionales kuwaitíes y 71.667 fragmentos verificados.

Su relevancia actual es acotada pero específica: cubre un nicho de "IA soberana" en árabe formal institucional, un segmento poco atendido por los modelos generalistas, y lo hace con un tamaño que permite ejecución en hardware de consumo mediante GGUF Q4_K_M (3,19 GB) o Q8_0 (4,63 GB). La licencia Apache 2.0 facilita su uso comercial, aunque el modelo tiene cero descargas y cero likes en el momento de la ficha, lo que indica ausencia de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 Effective 2B Edge), fine-tuning LoRA r=32, alpha=64 |
| Parametros totales | 5.123.178.051 (5,12 mil millones, segun safetensors) |
| Parametros activos | no disponible (no se declara variante MoE para este modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (3,19 GB), GGUF Q8_0 (4,63 GB); pesos safetensors en el repo |
| Idiomas soportados | arabe (MSA formal) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA (safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E2B-it`, un transformer multimodal de Gemma 4 en variante Edge, y se ajusta mediante LoRA con rango 32 y alpha 64. El adaptador resultante ocupa 184,37 MB, lo que confirma que el entrenamiento se limitó a un subconjunto de pesos sobre el modelo base congelado. El repositorio incluye también los pesos fusionados en `model.safetensors` (9,54 GB), además de `chat_template.jinja`, `processor_config.json` y tokenizador, coherentes con un pipeline image-text-to-text.

El entrenamiento se realizó sobre 238.779 registros SFT organizados en cuatro niveles de conocimiento: `direct_reference_qa`, `granular_clause_qa`, `analytical_breakdown` y `macro_synthesis`. Las fuentes declaradas incluyen 1.372 documentos históricos e institucionales kuwaitíes, 71.667 fragmentos verificados, un glosario de entidades y terminología kuwaití (KW-*), la historia de Kuwait y de la familia Al Sabah (1716-presente), las transformaciones administrativas de Kuwait (1863-1980) y el archivo de la revista Al-Arabi. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO posteriores al SFT.

La innovación técnica destacable no está en la arquitectura, sino en la política lingüística: el modelo incorpora un system prompt canónico que fuerza respuestas en árabe estándar institucional y prohíbe explícitamente el dialecto. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en árabe estándar moderno formal (MSA) e inglés, con registro institucional y ausencia declarada de dialecto.
- Respuesta a consultas de referencia directa sobre entidades, terminología e instituciones kuwaitíes.
- Desglose analítico de cláusulas y documentos (`granular_clause_qa`, `analytical_breakdown`).
- Síntesis macro de información histórica e institucional (`macro_synthesis`).
- Transferencia cruzada árabe-inglés en el conocimiento adquirido durante el ajuste.
- Procesamiento image-text-to-text heredado del modelo base Gemma 4 E2B (el pipeline declarado es text-generation, pero el repositorio incluye `processor_config.json` y el tag image-text-to-text).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio explícitos: no disponible en la información proporcionada.

## Casos de uso

- Consultas institucionales kuwaitíes: el modelo responde con registro formal sobre organismos, entidades y terminología administrativa de Kuwait, apoyándose en el glosario KW-* y en los 1.372 documentos fuente del ajuste. Adecuado para asistentes internos de administración pública.
- Atención al ciudadano en árabe formal: despliegue en portales o mesas de ayuda donde se exige un tono institucional y se quiere evitar el dialecto; el system prompt canónico fuerza ese registro de forma consistente.
- Síntesis de documentación histórica: resumen y desglose de materiales sobre la historia de Kuwait y Al Sabah (1716-presente) o sobre las transformaciones administrativas (1863-1980), usando los niveles `analytical_breakdown` y `macro_synthesis`.
- Asistencia editorial y periodística: redacción y revisión de textos en árabe formal para medios o comunicaciones corporativas, con la ventaja de un registro uniforme y la posibilidad de alternar a inglés para versiones bilingües.
- Despliegue en hardware de consumo: con GGUF Q4_K_M (3,19 GB) o Q8_0 (4,63 GB) puede ejecutarse en portátiles y estaciones sin GPU dedicada mediante Ollama o LM Studio, útil para entornos con requisitos de soberanía de datos y sin conectividad.
- Base para ajustes verticales: al distribuirse como adaptador LoRA separable (184,37 MB), sirve como punto de partida para especializaciones posteriores en dominios kuwaitíes concretos sin reentrenar el modelo completo.
- Procesamiento de documentos con imagen: al heredar la naturaleza image-text-to-text de Gemma 4 E2B, puede emplearse en la extracción y descripción de contenido visual acompañado de texto en árabe formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5-4 GB para GGUF Q4_K_M, 5-6 GB para GGUF Q8_0 y en torno a 10-11 GB para los pesos safetensors en FP16 (el archivo `model.safetensors` ocupa 9,54 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia local; A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más usando Q4_K_M, y en GPUs de 8-12 GB con Q8_0.
- Opciones de despliegue: Ollama (`ollama run hf.co/qalduaij/lolo_Q8y_General_E2B:Q8_0` o `:Q4_K_M`), LM Studio, llama.cpp, transformers con el adaptador LoRA o los pesos fusionados. vLLM y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| lolo_Q8y_General_E2B | 5,12 mil millones | no disponible | ar, en | Apache 2.0 | Ajuste LoRA especializado en Kuwait, MSA formal |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible | no disponible | Modelo base multimodal; capacidades generalistas |
| lolo_Q8y_General (mismo autor) | no disponible (Gemma 4 31B) | no disponible | ar, en | no disponible | Variante de 31B del mismo dominio, mayor coste de hardware |
| lolo_Q8y_Legal_E2B (mismo autor) | no disponible (Gemma 4 E2B) | no disponible | ar, en | no disponible | Variante centrada en derecho y legislación kuwaitíes |

No se dispone de datos de benchmarks ni de modelos de terceros comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgo de dominio: el ajuste está centrado en asuntos kuwaitíes; el rendimiento fuera de ese ámbito puede degradarse respecto al modelo base.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual ni de tasa de alucinación; en consultas históricas o legales conviene verificar contra las fuentes primarias.
- Política lingüística rígida: el system prompt fuerza árabe formal y prohíbe el dialecto; esto puede producir respuestas artificiales o rechazos en contextos donde el usuario espera registro coloquial.
- Idiomas limitados a árabe e inglés; no se declara soporte de otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar despliegues con documentos largos sin pruebas previas.
- Ausencia de validación externa: cero descargas y cero likes en Hugging Face; no hay evidencia pública de uso en producción ni evaluaciones independientes.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base `unsloth/gemma-4-E2B-it` y de Gemma 4, cuyos términos no se detallan en la información disponible.
- Fecha de creación del repositorio (2026-11-13) posterior a la del modelo base; conviene comprobar la vigencia de las dependencias de transformers y del tokenizador.
- No se documentan salvaguardas, filtros de contenido ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_General_E2B
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Familia lolo (referencias del autor en la model card): `qalduaij/lolo_Q8y_General`, `qalduaij/lolo_Q8y_Legal`, `qalduaij/lolo_Q8y_Legal_E2B`, `qalduaij/lolo_Q8y_Dialect_v2`, `qalduaij/lolo_Q8y_Dialect_v3_31B`, `qalduaij/lolo_Q8y_Dialect_v4_26B_A4B`, `qalduaij/lolo_Q8y_Dialect_v5_E2B`
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
