# qalduaij/lolo_Q8y_General_E2B

## Resumen

lolo_Q8y_General_E2B (Q8y General Edge E2B) es un ajuste fino del modelo Gemma 4 E2B instructivo de Google, desarrollado por Qusai Al-duaij (qalduaij) dentro de la familia "lolo AI Ecosystem". Está especializado en asuntos públicos, institucionales, históricos, culturales y del sector energético y financiero de Kuwait, con una política lingüística estricta de árabe estándar moderno formal (Fusha institucional) y sin dialecto, complementada con transferencia de conocimiento cruzada árabe-inglés.

El modelo parte de la arquitectura Gemma 4 "Effective 2B Edge" de Google, un transformer denso con aproximadamente 5.120 millones de parámetros totales según los pesos en safetensors. Se distribuye bajo licencia Apache 2.0 en formatos safetensors y GGUF, y está pensado para despliegue local y en el borde (Ollama, LM Studio) gracias a su tamaño reducido y a las cuantizaciones publicadas (Q8_0, Q4_K_M).

Su relevancia actual radica en el enfoque de "IA soberana": un modelo pequeño, desplegable en hardware de consumo, con un corpus de ajuste fino centrado en documentación histórica e institucional kuwaití (1.372 fuentes, 71.667 fragmentos verificados, 239.029 registros SFT) y un system prompt que fuerza un registro lingüístico institucional concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 "Effective 2B Edge"), ajuste fino LoRA con r=32, alpha=64 |
| Parametros totales | 5.123.178.051 (≈5,12 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (GGUF publicados); safetensors en precisión original |
| Idiomas soportados | Árabe (Fusha formal, sin dialecto) e inglés (registro institucional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre `unsloth/gemma-4-E2B-it`, la variante "Effective 2B Edge" de la familia Gemma 4 de Google. Se trata de un transformer denso ajustado mediante LoRA con rango 32 y alpha 64, según se documenta en la model card. No se especifican en la información disponible detalles sobre el número de cabezas de atención, la dimensión oculta ni la longitud de contexto nativa del modelo base.

El ajuste fino se realizó sobre 239.029 registros SFT organizados en cuatro niveles de conocimiento: `direct_reference_qa`, `granular_clause_qa`, `analytical_breakdown` y `macro_synthesis`. El corpus se extrajo de 1.372 fuentes históricas e institucionales kuwaitíes y 71.667 fragmentos verificados, e incluye el directorio de entidades y terminología kuwaití (KW-*), la historia de Kuwait y de la dinastía Al Sabah (1716-presente), las transformaciones administrativas de Kuwait (1863-1980), el archivo de la revista Al-Arabi y material de transferencia de conocimiento bilingüe árabe-inglés. No se indica en la información disponible si hubo fases de RLHF o DPO posteriores al SFT.

La innovación principal no es arquitectónica sino de política lingüística y de dominio: el modelo incorpora un system prompt que fuerza el uso exclusivo de árabe estándar moderno institucional y prohíbe explícitamente cualquier vocabulario dialectal, con un registro equivalente en inglés.

## Capacidades

- Generación de texto conversacional en árabe estándar moderno formal (Fusha institucional) e inglés institucional.
- Respuesta a preguntas de referencia directa sobre entidades, instituciones y terminología kuwaitíes (directorio KW-*).
- Explicación granular de cláusulas y disposiciones institucionales.
- Análisis desglosado (analytical breakdown) de documentos y textos históricos o administrativos.
- Síntesis macro de material histórico e institucional (macro synthesis).
- Transferencia de conocimiento cruzada árabe-inglés.
- Capacidades multimodales heredadas del modelo base (etiqueta image-text-to-text), aunque la model card no detalla su alcance.
- Compatibilidad con endpoints y despliegue vía Ollama y LM Studio mediante Modelfile incluido.

## Casos de uso

- Consulta institucional kuwaití: el modelo responde preguntas sobre entidades, organismos y terminología administrativa de Kuwait apoyándose en el directorio KW-* y en los 239.029 registros SFT de referencia directa.
- Atención ciudadana en registro formal: adecuado para asistentes que deben responder en árabe estándar institucional sin dialecto, con un tono administrativo consistente gracias al system prompt fijado.
- Documentación histórica: generación de resúmenes y explicaciones sobre la historia de Kuwait y la dinastía Al Sabah (1716-presente) a partir del corpus histórico incluido en el ajuste.
- Análisis de transformaciones administrativas: desglose de cambios institucionales entre 1863 y 1980 para uso en investigación o divulgación.
- Síntesis de archivo periodístico: resumen y extracción de ideas del archivo de la revista Al-Arabi, uno de los componentes declarados del corpus.
- Asistencia bilingüe árabe-inglés: traducción y reformulación de contenido institucional entre ambos idiomas manteniendo el registro formal.
- Despliegue en el borde: al ser un modelo de ~5,12 mil millones de parámetros con cuantizaciones Q8_0 y Q4_K_M, puede ejecutarse localmente en estaciones de trabajo sin GPU de datacenter, útil para entornos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB en Q8_0 (5,12 mil millones de parámetros a ~8 bits) y en torno a 3,5 GB en Q4_K_M; en safetensors de precisión original (bf16/fp16) se requieren unos 10-11 GB.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 o superiores para cuantizaciones altas con margen de contexto; A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM para Q4_K_M y Q8_0 con contexto moderado; también puede ejecutarse en CPU con llama.cpp u Ollama.
- Opciones de despliegue: Ollama (`ollama run hf.co/qalduaij/lolo_Q8y_General_E2B:Q8_0` o `:Q4_K_M`), LM Studio, llama.cpp (GGUF), transformers con safetensors; el repo incluye `Modelfile` y `chat_template.jinja` para construcción local.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| lolo_Q8y_General_E2B | ≈5,12 mil millones | No disponible | Apache 2.0 | Árabe Fusha institucional, dominio kuwaití | Hugging Face (safetensors + GGUF) |
| unsloth/gemma-4-E2B-it (base) | No disponible en la información | No disponible | No disponible en la información | Modelo instructivo generalista | Hugging Face |
| qalduaij/lolo_Q8y_General (Gemma 4 31B) | No disponible en la información | No disponible | No disponible en la información | Versión "líder" del mismo dominio kuwaití | Hugging Face |
| qalduaij/lolo_Q8y_Legal_E2B | No disponible en la información | No disponible | No disponible en la información | Dominio legal y constitucional kuwaití | Hugging Face |

La comparación con alternativas de la misma categoría (modelos pequeños especializados en árabe) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para árabe estándar moderno formal e inglés institucional; su uso con dialectos o registros coloquiales queda fuera del alcance previsto y probablemente produzca respuestas degradadas.
- Sesgos potenciales derivados del corpus: 1.372 fuentes históricas e institucionales kuwaitíes y el archivo de la revista Al-Arabi pueden introducir un sesgo hacia narrativas oficiales o institucionales concretas.
- Riesgo de alucinación en preguntas fuera del dominio kuwaití o en temas no cubiertos por el corpus de ajuste.
- El autor declara explícitamente que es un proyecto personal en desarrollo, sin equipo científico ni de investigación detrás, y solicita retroalimentación sobre fallos.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base (`unsloth/gemma-4-E2B-it`) y de Gemma 4, cuyos términos no se detallan en la información proporcionada.
- El repositorio ocupa 29,3 GB, lo que incluye múltiples cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_General_E2B
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Sitio del autor: https://www.alduaij.uk
- Familia lolo (referencias en la model card): https://huggingface.co/qalduaij/lolo_Q8y_General, https://huggingface.co/qalduaij/lolo_Q8y_Legal, https://huggingface.co/qalduaij/lolo_Q8y_Legal_E2B, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v2, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v3_31B, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v4_26B_A4B, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v5_E2B
