# mradermacher/Smaug-Political-Uncensored-i1-GGUF

## Resumen

Smaug-Political-Uncensored-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base abacusai/Smaug-Political-Uncensored. El modelo original, desarrollado por Abacus.AI, es un transformer denso de aproximadamente 27.320 millones de parámetros (27,3B) afinado mediante DPO (Direct Preference Optimization) para eliminar sesgos y restricciones de alineación en temáticas políticas, manteniendo capacidades conversacionales y de razonamiento. Esta versión concreta no es un modelo nuevo, sino un conjunto de pesos cuantizados con la técnica i1 (imatrix) de llama.cpp, pensada para inferencia eficiente en hardware de consumo.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B con licencia Apache 2.0 en GPUs de consumo mediante cuantizaciones que van desde 11,0 GB (Q2_K) hasta 22,5 GB (Q6_K). El repositorio incluye 15 cuantizaciones distintas más el fichero imatrix, lo que facilita el despliegue en entornos con VRAM limitada sin renunciar a la licencia permisiva del modelo original.

El modelo está etiquetado como vision model por el autor de las cuantizaciones, aunque los ficheros mmproj (proyector multimodal) se alojan en el repositorio estático hermano. Los idiomas declarados en la model card son inglés y chino. La fecha de creación del repositorio es noviembre de 2026 y acumula 1.366 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en abacusai/Smaug-Political-Uncensored) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el repo base |
| Tamano del repo | 218,6 GB |
| Modelo base | abacusai/Smaug-Political-Uncensored |
| Herramienta de cuantizacion | llama.cpp (quants i1 / imatrix) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27,3B parámetros. La model card del repositorio cuantizado no detalla la arquitectura interna (número de capas, dimensiones ocultas, cabezas de atención) ni la composición exacta del dataset de entrenamiento. El tag `dpo` en los metadatos indica que el ajuste se realizó mediante Direct Preference Optimization, técnica de alineación por preferencias que no requiere un modelo de recompensa separado. El nombre "Political-Uncensored" sugiere que el proceso de DPO se orientó a reducir rechazos y sesgos en temáticas políticas, aunque no se especifica el dataset de preferencias utilizado.

La innovación técnica de este repositorio concreto es el uso de cuantizaciones i1 con fichero imatrix (importance matrix). El imatrix se calcula ejecutando el modelo sobre un corpus de calibración para estimar la importancia de cada tensor, lo que permite asignar más bits a los pesos críticos y menos a los redundantes. Según las notas del autor, las cuantizaciones IQ de tamaño similar suelen superar a las no-IQ, y las i1 mejoran a las estáticas equivalentes. El repositorio incluye el fichero `Smaug-Political-Uncensored.imatrix.gguf` (0,1 GB) para que el usuario pueda generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en los metadatos.
- Razonamiento y respuestas sin las restricciones de alineación habituales en temáticas políticas (objetivo declarado del fine-tuning DPO).
- Capacidad de agente y razonamiento multi-paso, indicada por el tag `agentic`.
- Soporte declarado de inglés y chino.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integración en servicios de inferencia.
- Posible capacidad de visión: el autor de las cuantizaciones etiqueta el modelo como vision model y remite los ficheros mmproj al repositorio estático. Esta capacidad no se detalla en la model card del repo base.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Análisis de discurso político y comparación de programas electorales: el modelo puede procesar documentos largos y generar resúmenes sin los filtros de rechazo que limitan a modelos alineados convencionalmente, lo que resulta útil para investigadores que necesitan cubrir todo el espectro ideológico.
- Generación de contenido editorial con perspectiva neutral: al estar entrenado con DPO para reducir sesgos políticos, puede emplearse en redacciones que requieran cubrir temas controvertidos sin autocensura, siempre con revisión humana.
- Despliegue en estaciones de trabajo con una sola GPU: la cuantización i1-Q4_K_M (16,9 GB) cabe en GPUs de 24 GB como la RTX 4090, lo que permite ejecutar un modelo de 27B en local para tareas de investigación sin depender de la nube.
- Chatbot de atención al ciudadano en inglés o chino: con contexto conversacional multi-turno, puede gestionar consultas sobre normativa o procedimientos administrativos en ambos idiomas.
- Generación de borradores de artículos de opinión y análisis: el modelo puede producir textos argumentativos sobre temas políticos con distintos enfoques, útil como herramienta de brainstorming para periodistas y analistas.
- Experimentación en investigación sobre alineación: al ser un modelo explícitamente "uncensored" con licencia Apache 2.0, sirve como línea base para estudiar el efecto del DPO en la supresión de rechazos y en la calidad factual de las respuestas.
- Inferencia en CPU con llama.cpp: las cuantizaciones Q2_K (11,0 GB) y Q3 (12,4-14,7 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, con throughput reducido pero funcional para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Tampoco se proporcionan datos de perplejidad de las distintas cuantizaciones, más allá de la referencia genérica al gráfico de ikawrakow sobre calidad relativa de tipos de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - i1-Q2_K: ~11,0 GB
  - i1-Q3_K_S / IQ3_S / IQ3_M: ~12,4-12,9 GB
  - i1-Q3_K_M / Q3_K_L: ~13,6-14,7 GB
  - i1-IQ4_XS / Q4_0 / Q4_K_S: ~15,4-15,9 GB
  - i1-Q4_K_M / Q4_1: ~16,9-17,4 GB
  - i1-Q5_K_S / Q5_K_M: ~19,1-19,6 GB
  - i1-Q6_K: ~22,5 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q6_K y para mayor margen de contexto; RTX 3090 (24 GB) también válida para Q4 y Q5.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB (Q2_K, con margen ajustado) hasta una RTX 4090 de 24 GB (Q5_K_M y Q6_K).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles. Dependen del hardware, de la cuantización y de la longitud de contexto; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Smaug-Political-Uncensored-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizaciones imatrix de 11 a 22,5 GB; modelo base afinado con DPO |
| abacusai/Smaug-Political-Uncensored (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar; requiere ~55 GB en fp16 |
| mradermacher/Smaug-Political-Uncensored-GGUF (estático) | 27,3B | no disponible | Apache 2.0 | GGUF (estático) | Mismo modelo base con cuantizaciones estáticas, sin imatrix; incluye ficheros mmproj |

No se dispone de datos de benchmarks para comparar el rendimiento cualitativo con alternativas de la misma categoría (modelos densos de ~27B sin alineación restrictiva). La comparación se limita a parámetros, licencia y formato de pesos.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored" y afinado para reducir rechazos en temáticas políticas: puede generar contenido ofensivo, sesgado o factualmente incorrecto sin advertirlo. Requiere moderación externa en producción.
- Riesgo elevado de alucinación en temas de actualidad política, ya que no se documenta la fecha de corte de los datos de entrenamiento ni el uso de recuperación aumentada.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está garantizado ni documentado.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos sin pruebas previas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado, especialmente en contextos políticos y regulatorios.
- Las cuantizaciones de baja precisión (Q2_K, Q3) degradan la calidad de forma notable; el propio autor recomienda IQ3_XXS o superiores frente a Q2_K, y Q4_K_M como opción equilibrada.
- La capacidad de visión no está confirmada en la model card del repo base; los ficheros mmproj se alojan en el repositorio estático y su disponibilidad debe verificarse antes de asumir funcionalidad multimodal.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Smaug-Political-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Political-Uncensored
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Smaug-Political-Uncensored-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Smaug-Political-Uncensored-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
