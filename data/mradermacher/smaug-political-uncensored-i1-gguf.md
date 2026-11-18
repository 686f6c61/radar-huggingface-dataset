# mradermacher/Smaug-Political-Uncensored-i1-GGUF

## Resumen

Smaug-Political-Uncensored-i1-GGUF es una recuantización en formato GGUF del modelo Smaug-Political-Uncensored, desarrollado originalmente por Abacus.AI, llevada a cabo por el usuario mradermacher mediante el pipeline de cuantización i1 (imatrix). El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la gama de modelos de tamaño medio-grande orientados a despliegue local y a tareas conversacionales.

El propósito de esta publicación es ofrecer versiones cuantizadas del modelo original en múltiples niveles de precisión (desde IQ1_S hasta Q6_K), de modo que pueda ejecutarse en hardware de consumo con distintos compromisos entre calidad y uso de memoria. La nomenclatura "i1" indica que las cuantizaciones se han generado utilizando pesos de importancia (imatrix), una técnica que busca preservar mejor la calidad del modelo original en tasas de bits bajas.

La relevancia de esta ficha radica en que el modelo se presenta como una variante "uncensored" de temática política, un nicho con implicaciones éticas y de licencia relevantes. No obstante, la información pública disponible sobre el modelo base es muy limitada: no se especifican la licencia, los idiomas soportados ni la longitud de contexto, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Smaug-Political-Uncensored de Abacus.AI; arquitectura transformer presumible, sin confirmar en la informacion disponible) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base; repo GGUF de 10,9 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base Smaug-Political-Uncensored en la documentación proporcionada. Por el número de parámetros (27,3 B) y la naturaleza del proyecto (Abacus.AI), se trata presumiblemente de un transformer decoder-only, pero este dato no está confirmado explícitamente en la información disponible.

Respecto al entrenamiento, no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El calificativo "Uncensored" sugiere que el modelo base ha sido sometido a algún proceso de eliminación o atenuación de los mecanismos de rechazo (refusal) típicos de los modelos alineados, pero no se detalla la metodología. La única innovación técnica documentada en esta publicación es el uso de cuantización i1 con imatrix (pesos de importancia) para generar las versiones GGUF, lo que mejora la fidelidad respecto a cuantizaciones estándar en niveles bajos de bits.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a diálogo multi-turno.
- Temática política: el nombre sugiere especialización o entrenamiento en contenido político, aunque no se detalla el alcance.
- Modo "uncensored": presumiblemente reduce las negativas a responder sobre temas sensibles, si bien no se documenta el grado ni el método.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede servirse mediante infraestructura compatible con la API de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: con 27,3 B de parámetros, las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, útil para experimentación sin dependencia de la nube.
- Análisis de discurso político: el modelo puede emplearse para generar o analizar textos de temática política en entornos de investigación, siempre que se validen las salidas por su carácter "uncensored".
- Prototipado de chatbots conversacionales: gracias a su orientación conversacional, sirve para construir asistentes de prueba en local antes de migrar a modelos alojados.
- Investigación sobre alineación y censura: comparar las respuestas de esta variante con las de modelos alineados permite estudiar el efecto de los procesos de "uncensoring" en el comportamiento del modelo.
- Evaluación de cuantizaciones: el amplio abanico de niveles (de IQ1_S a Q6_K) lo convierte en un banco de pruebas para medir la degradación de calidad según la tasa de bits.
- Servicio mediante endpoints compatibles: al estar etiquetado como "endpoints_compatible", puede integrarse en infraestructuras de inferencia que expongan una API compatible, por ejemplo para pruebas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para 27,3 B de parámetros, las cuantizaciones Q4 rondarían los 16-17 GB, las Q5 los 19-20 GB, las Q6 los 22-23 GB y las Q8 (no incluidas en este repo) superarían los 29 GB. Estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones Q4 y Q5; para Q6 sería ajustado. GPUs profesionales como A100 (40/80 GB) o H100 permitirían cualquier cuantización del repo con holgura.
- ¿Cabe en GPU de consumo? Sí, en GPUs con 24 GB para cuantizaciones Q4/Q5; en GPUs de 16 GB solo cabrían las cuantizaciones más bajas (Q2/IQ2/IQ3), con pérdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o endpoints compatibles). No se documenta soporte explícito para vLLM o TGI, que habitualmente requieren safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa fiable. A continuación se ofrece una comparación estructural con alternativas de tamaño similar, indicando solo datos verificables:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Smaug-Political-Uncensored-i1-GGUF | 27,3 B | no disponible | no disponible | GGUF |
| Alternativas de ~27-34 B (p. ej., variantes de la familia Llama/Mistral de ese rango) | ~27-34 B | variable según modelo | variable | safetensors/GGUF |

No se dispone de información suficiente para comparar rendimiento, contexto o licencia con modelos concretos; se indica "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (abacusai/Smaug-Political-Uncensored) antes de cualquier despliegue en producción.
- Carácter "uncensored": la atenuación de mecanismos de rechazo implica un mayor riesgo de generar contenido ofensivo, sesgado o factualmente incorrecto, especialmente en temática política.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; en dominios políticos el riesgo de afirmaciones inventadas es alto.
- Idiomas y contexto desconocidos: no se documenta la longitud de contexto ni la cobertura lingüística, lo que impide garantizar su comportamiento en textos largos o en castellano.
- Sesgos: al estar orientado a contenido político y sin documentación de alineación, es probable que reproduzca sesgos presentes en sus datos de entrenamiento.
- Cuantizaciones muy bajas (IQ1, IQ2): degradan notablemente la coherencia y la calidad; no recomendadas para uso serio.
- Sin benchmarks: no hay evidencia publicada de su rendimiento frente a alternativas, por lo que cualquier elección debe basarse en pruebas propias.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación prácticamente nulo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Smaug-Political-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Political-Uncensored
