# Solstice-AI/Carbon-X-Unlocked-Heretic

## Resumen

Carbon-X-Unlocked-Heretic es una variante experimental del modelo Carbon-X de HuggingFaceBio, un modelo decoder-only de 14.822.046.720 parámetros entrenado conjuntamente sobre secuencias de ADN y texto en lenguaje natural. El modelo original está diseñado para tareas de biología computacional: predicción de efectos de variantes (benignas o patógenas), identificación de regiones reguladoras, clasificación taxonómica de secuencias y predicción de siguientes bases. Esta versión concreta ha sido modificada por Solstice-AI mediante una ablación de representaciones con la herramienta Heretic v2.0.0, que elimina parcialmente los comportamientos de rechazo del modelo original.

La modificación aplica una ablación de rango arbitrario (ARA) sobre las capas 18 a 29, con pesos de preservación de comportamiento correcto de 0,1948 y de corrección de comportamiento no deseado de 0,0005. El resultado declarado por el autor es una reducción de rechazos de 96/100 a 11/100 según un clasificador, con una divergencia KL de 0,0627 respecto al modelo base. El modelo conserva la licencia Apache 2.0 y la arquitectura del original, pero incorpora un aviso de bioseguridad y uso aceptable extremadamente restrictivo en su model card.

La relevancia de esta ficha es doble: por un lado documenta un modelo especializado en genómica con una arquitectura inusual (tokenización unificada de ADN y texto); por otro, ilustra un caso de "decensoring" aplicado a un dominio sensible, donde la eliminación de rechazos puede afectar a salvaguardas de bioseguridad. El modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, tokenización unificada de ADN y texto (sin encoder de ADN separado) |
| Parametros totales | 14.822.046.720 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (con política de uso aceptable adicional en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Carbon-X es un modelo decoder-only de 14,8B parámetros que procesa ADN y texto en un único flujo de tokens dentro de un solo decoder. No existe un encoder de ADN separado: las secuencias de ADN se introducen directamente en la conversación y el modelo responde en inglés, pudiendo mezclar bases de ADN y lenguaje natural en la misma respuesta. El entrenamiento es conjunto sobre secuencias de ADN y texto, lo que permite tareas como predicción de efectos de variantes, identificación de regiones reguladoras, clasificación por grupo de organismo y predicción de las siguientes bases.

La variante Heretic aplica una ablación de rango arbitrario (ARA) sobre las capas 18 a 29 del modelo base, con los parámetros indicados en la model card: `start_layer_index=18`, `end_layer_index=29`, `preserve_good_behavior_weight=0,1948`, `steer_bad_behavior_weight=0,0005`, `overcorrect_relative_weight=0,9601` y `neighbor_count=1`. El proceso es reproducible según el autor, que incluye un directorio `reproduce` con instrucciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Predicción de efectos de variantes: clasifica mutaciones como benignas o patógenas a partir de ADN en bruto introducido en una conversación.
- Identificación de regiones reguladoras que controlan la actividad génica.
- Clasificación de secuencias por grupo de organismo.
- Predicción de las siguientes bases de una secuencia de ADN.
- Generación de respuestas que combinan ADN y lenguaje natural en un mismo turno.
- Explicación del razonamiento detrás de sus predicciones en inglés.
- Uso como herramienta dentro de un agente (la model card del modelo base incluye una sección específica sobre este uso).
- Conversación multi-turno en inglés.
- Comportamiento de rechazo reducido respecto al modelo base (11/100 frente a 96/100 según clasificador), lo que amplía el rango de consultas que el modelo atiende.

## Casos de uso

- Análisis de variantes en investigación oncológica: el modelo recibe una variante genómica en formato de conversación y devuelve una clasificación benigna/patógena junto con una explicación en inglés, útil como triaje preliminar en pipelines de anotación de variantes.
- Anotación de regiones reguladoras en estudios de genómica funcional: se le presentan secuencias y el modelo identifica regiones candidatas que controlan la expresión génica, reduciendo el trabajo manual de cribado.
- Clasificación taxonómica de secuencias metagenómicas: dado un fragmento de ADN sin etiquetar, el modelo predice el grupo de organismo al que pertenece, lo que puede integrarse en flujos de caracterización de muestras ambientales.
- Predicción de siguientes bases para validación de ensamblados: el modelo puede completar secuencias y señalar bases esperadas, sirviendo como comprobación cruzada en pipelines de ensamblaje.
- Asistente conversacional para bioinformáticos: al aceptar ADN y texto en el mismo hilo, permite consultas del tipo "¿qué implica esta variante?" sin cambiar de herramienta, con respuestas explicadas en inglés.
- Herramienta dentro de agentes bioinformáticos: la model card del modelo base documenta su uso como tool para agentes, de modo que un orquestador puede delegar en Carbon-X la interpretación de secuencias mientras el agente gestiona el flujo multi-paso.
- Exploración de hipótesis en genómica comparada: el modelo puede analizar secuencias y proponer explicaciones sobre diferencias entre organismos, siempre como apoyo a la investigación y no como base de decisiones clínicas.

## Benchmarks y rendimiento

La información disponible incluye únicamente métricas del proceso de ablación, no benchmarks estándar de genómica ni de lenguaje:

| Métrica | Este modelo | Modelo original (HuggingFaceBio/Carbon-X) |
|---|---|---|
| Rechazos (clasificador) | 11/100 | 96/100 |
| Divergencia KL | 0,0627 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni métricas específicas de genómica) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 29,7 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 32-40 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 15-16 GB de pesos, viable en GPUs de 24 GB con margen limitado.
- VRAM estimada en cuantización de 4 bits: en torno a 8-9 GB de pesos, viable en GPUs consumer de 12-16 GB, aunque la cuantización no está documentada por el autor.
- GPUs recomendadas: H100 o H200 para producción; A100 40/80 GB para despliegue estándar; RTX 4090 (24 GB) viable en 8 bits o 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y tarjetas de 16 GB o más si se cuantiza; no en FP16 en tarjetas de menos de 32 GB.
- Opciones de despliegue: transformers (librería declarada), TGI (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. La model card del modelo base menciona mediciones de throughput por hora de H200 a 5 USD/hora, pero no se incluyen cifras concretas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X-Unlocked-Heretic | 14,8B | No disponible | ADN + texto, sin rechazos | Apache 2.0 | Hugging Face |
| HuggingFaceBio/Carbon-X | 14,8B | No disponible | ADN + texto, con salvaguardas | Apache 2.0 | Hugging Face |
| Modelos de lenguaje general de ~14B (p. ej. Qwen3-14B) | ~14B | No disponible en esta ficha | Texto general | Variable | Hugging Face |
| Modelos genómicos especializados tipo Evo o Nucleotide Transformer | Variable | No disponible | ADN | Variable | Hugging Face |

La comparación con modelos genómicos especializados no puede cuantificarse porque la información disponible no incluye benchmarks de genómica del modelo ni de sus alternativas. La etiqueta `qwen3` en los tags sugiere que la arquitectura subyacente podría derivar de la familia Qwen3, pero este dato no está confirmado en la model card.

## Limitaciones y advertencias

- El modelo es una ablación experimental: la eliminación de rechazos puede degradar salvaguardas de bioseguridad en un dominio de alto riesgo, como reconoce el propio aviso de la model card.
- La divergencia KL de 0,0627 indica que el comportamiento no es idéntico al original; pueden aparecer respuestas degradadas o incoherentes en consultas que el modelo base rechazaba.
- No es un dispositivo médico ni está validado clínicamente; sus salidas no constituyen consejo médico, diagnóstico ni asesoramiento genético.
- Riesgo de alucinación en predicciones genómicas: el modelo puede generar explicaciones plausibles pero incorrectas sobre variantes o regiones reguladoras.
- Solo soporta inglés; no se declara soporte de otros idiomas.
- La longitud de contexto no está documentada, lo que impide planificar su uso con secuencias de ADN largas.
- La licencia Apache 2.0 se ve acompañada de una política de uso aceptable adicional en la model card que prohíbe explícitamente usos de doble uso, ganancia de función, evasión de cribado de síntesis y aplicaciones militares; el cumplimiento de esa política es responsabilidad del usuario.
- El autor declina toda responsabilidad y exige indemnización al usuario por violaciones de bioseguridad.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No se documentan sesgos específicos, pero al entrenarse sobre datos biológicos y texto en inglés puede heredar sesgos de esas fuentes.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Carbon-X-Unlocked-Heretic
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- Organización HuggingFaceBio: https://huggingface.co/HuggingFaceBio
- Blog del modelo base: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Código: https://github.com/huggingface/carbon/tree/main
- Heretic: https://heretic-project.org
