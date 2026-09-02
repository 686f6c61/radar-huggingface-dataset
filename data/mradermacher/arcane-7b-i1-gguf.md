# mradermacher/arcane-7b-i1-GGUF

## Resumen

arcane-7b es un modelo de lenguaje de aproximadamente 6,7 mil millones de parametros desarrollado por ar3xop, especializado en el analisis de salud mental, la deteccion de crisis y la identificacion de angustia psicologica en texto. Esta ficha cubre la version cuantizada en formato GGUF por mradermacher, que incluye cuantizaciones con calibracion imatrix para optimizar la calidad de los pesos comprimidos en niveles de baja precision.

El modelo se distribuye bajo licencia llama2, lo que sugiere que esta basado en la arquitectura de Llama 2 7B, aunque no se proporcionan detalles arquitectonicos completos en la documentacion disponible. La version GGUF permite ejecutar el modelo en hardware variado, desde GPU de consumo hasta CPU, mediante runtimes como llama.cpp u Ollama.

La relevancia de este modelo radica en su enfoque especifico en dominios de salud mental y deteccion de crisis, un area donde los modelos genericos suelen mostrar limitaciones. Su disponibilidad en formato GGUF con 24 niveles de cuantizacion distintos facilita su despliegue en entornos con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (probablemente basada en Llama 2 7B, segun la licencia; no confirmado en la documentacion) |
| Parametros totales | 6.738.415.616 (~6,7B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, Q2_K_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con calibracion imatrix) |
| Idiomas soportados | ingles |
| Licencia | llama2 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles completos sobre la arquitectura interna del modelo base. Se sabe que utiliza la libreria transformers y que la licencia es llama2, lo que indica que se trata de un fine-tuning del modelo Llama 2 7B original. Las etiquetas asociadas (mental-health, crisis-analysis, distress-detection) sugieren que el entrenamiento se enfoco en datos de salud mental, conversaciones de crisis y analisis de angustia, aunque no se proporcionan cifras sobre el volumen de datos, la composicion del dataset ni las tecnicas de alineacion empleadas (RLHF, DPO, etc.).

La version cuantizada por mradermacher utiliza calibracion imatrix, un proceso que calcula matrices de importancia basadas en la activacion de los pesos durante la inferencia para mejorar la calidad de las cuantizaciones de baja precision. El repositorio incluye tanto las cuantizaciones con imatrix (este repo) como una version con cuantizaciones estaticas convencionales en un repositorio separado.

## Capacidades

- Analisis de salud mental: procesamiento de texto para detectar indicadores de problemas psicologicos.
- Deteccion de crisis: identificacion de lenguaje indicativo de situaciones de crisis emocional o riesgo psicologico.
- Analisis de angustia (distress): evaluacion de niveles de sufrimiento emocional en conversaciones o textos.
- Generacion de texto en ingles: capacidad de producir respuestas coherentes en contextos de apoyo emocional.
- Clasificacion de contenido: etiquetado de textos segun su relevancia para el dominio de salud mental.

No se dispone de informacion sobre soporte de tool calling, capacidades de agente, modo de razonamiento extendido ni funcionalidades multimodales.

## Casos de uso

- Triaje de mensajes en plataformas de apoyo psicologico: el modelo puede clasificar mensajes entrantes segun la urgencia del riesgo detectado, priorizando aquellos que requieren intervencion inmediata de un profesional.
- Monitorizacion de redes sociales para deteccion de ideacion suicida: integrado en pipelines de procesamiento de texto, puede analizar publicaciones y generar alertas sobre contenido preocupante, siempre con superposicion humana para confirmar los hallazgos.
- Analisis de transcripciones de sesiones de terapia: asiste a profesionales de la salud mental en la revision de transcripciones, resaltando segmentos con indicadores de angustia o cambios en el estado emocional del paciente.
- Chatbots de apoyo emocional de primera linea: desplegado como capa inicial de atencion, puede ofrecer respuestas empaticas y derivar a recursos humanos cuando detecta senales de crisis aguda.
- Investigacion en NLP clinico: util como modelo base para fine-tuning en tareas especificas de psiquiatria computacional, dado su enfoque en el dominio.
- Herramientas de escritura para profesionales de salud mental: asistencia en la redaccion de notas clinicas y resumenes de evaluaciones con terminologia apropiada para el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3 GB (cuantizacion IQ1_S, archivo de 1,6 GB) y 8 GB (cuantizacion Q6_K, archivo de 5,6 GB), incluyendo overhead de runtime y cache de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones ligeras (IQ2_XS, Q4_K_S); 8 GB o mas para cuantizaciones Q5 y Q6.
- Compatibilidad con GPU de consumo: si. Una RTX 3060 de 12 GB puede ejecutar todas las cuantizaciones; una GTX 1650 de 4 GB puede ejecutar las cuantizaciones mas agresivas (IQ1 e IQ2).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python o cualquier runtime compatible con formato GGUF. Tambien es posible ejecutarlo en CPU, con latencias significativamente mayores.
- Latencia y throughput: no se dispone de mediciones publicadas. Como referencia orientativa, un modelo de ~7B en Q4_K_M suele generar entre 20 y 40 tokens por segundo en una GPU de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| arcane-7b (este) | 6,7B | no disponible | llama2 | salud mental | GGUF |
| Llama 2 7B | 6,7B | 4096 | llama2 | generico | multiple formatos |
| Mistral 7B | 7,3B | 8192 | apache-2.0 | generico | multiple formatos |

La comparacion directa de rendimiento no es posible sin datos de benchmarks publicados. La diferencia principal de arcane-7b es su especializacion en el dominio de salud mental, mientras que Llama 2 y Mistral son modelos de proposito general. Si el modelo base es efectivamente un fine-tuning de Llama 2 7B, su longitud de contexto probablemente sera de 4096 tokens, aunque no se confirma en la documentacion.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para uso en otros idiomas sin fine-tuning adicional.
- No se han publicado benchmarks, por lo que su rendimiento real en tareas de salud mental no esta validado externamente.
- La licencia llama2 permite uso comercial, pero incluye restricciones: no puede utilizarse para generar contenido ilegal o danino, y el uso con mas de 700 millones de usuarios mensuales requiere una licencia comercial adicional de Meta.
- Un modelo de deteccion de crisis conlleva riesgo de falsos negativos (no detectar una crisis real) y falsos positivos (generar alertas innecesarias). No debe utilizarse como unico mecanismo de evaluacion de riesgo sin superposicion humana.
- Riesgo de alucinaciones en contextos de apoyo emocional, donde respuestas inexactas podrian tener consecuencias graves para el usuario.
- No se proporciona informacion sobre sesgos especificos del modelo, pero al estar entrenado en datos del dominio de salud mental, puede reflejar sesgos presentes en los datos de entrenamiento originales.
- La fecha de creacion del repositorio (2026-09-02) es inusual y podria indicar un error en los metadatos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo es reciente o poco utilizado hasta la fecha.

## Enlaces

- Repositorio GGUF con imatrix (este modelo): https://huggingface.co/mradermacher/arcane-7b-i1-GGUF
- Modelo base: https://huggingface.co/ar3xop/arcane-7b
- Version con cuantizaciones estaticas: https://huggingface.co/mradermacher/arcane-7b-GGUF
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil de mradermacher en Hugging Face: https://huggingface.co/mradermacher
