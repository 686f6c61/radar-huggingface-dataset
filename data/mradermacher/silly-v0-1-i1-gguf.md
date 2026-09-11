# mradermacher/silly-v0.1-i1-GGUF

## Resumen

`silly-v0.1-i1-GGUF` es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo `wave-on-discord/silly-v0.1`. No se trata de un modelo entrenado desde cero, sino de una conversión y compresión del modelo base a formatos de baja precisión pensados para inferencia local con llama.cpp y herramientas compatibles (Ollama, LM Studio, koboldcpp, entre otras). El modelo base tiene 12.247.802.880 parámetros (aproximadamente 12,25 mil millones) y está etiquetado como conversacional y de idioma inglés.

La relevancia de este repositorio es práctica: pone a disposición del usuario una batería de cuantizaciones con calibración imatrix, desde variantes extremadamente agresivas (IQ1_S, 3,1 GB) hasta otras de calidad casi nativa (Q6_K, 10,2 GB), lo que permite ejecutar un modelo de 12B en hardware de consumo con distintos compromisos entre tamaño, velocidad y fidelidad. El repositorio ocupa 141,9 GB en total, correspondiente a la suma de todos los archivos publicados.

No hay información pública en la model card sobre la arquitectura del modelo base, la longitud de contexto, el proceso de entrenamiento, la licencia o los idiomas distintos del inglés. La búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 12.247.802.880 (≈12,25 B) |
| Parámetros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | imatrix (archivo de calibración), i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors vía transformers |
| Modelo base | wave-on-discord/silly-v0.1 |
| Tipo de cuantización | pesos y matriz de importancia (imatrix), convert_type hf |
| Tamaño del repositorio | 141,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base en la documentación disponible. El dato objetivo es el número de parámetros (12.247.802.880) y la etiqueta `conversational`, que indica un ajuste orientado a diálogo. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

Lo que sí está documentado es el proceso de cuantización. mradermacher ha generado cuantizaciones ponderadas mediante imatrix (matriz de importancia), una técnica que calcula la relevancia estadística de cada peso a partir de datos de calibración para asignar más bits a los tensores que más afectan a la perplejidad. El pipeline declarado incluye `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica conversión desde pesos HuggingFace y cuantización por tensores de salida. Se ofrecen dos familias: cuantizaciones estáticas en `mradermacher/silly-v0.1-GGUF` y las cuantizaciones i1 (imatrix) de este repositorio. El archivo imatrix se distribuye por separado (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés: es la capacidad explícitamente declarada mediante la etiqueta `conversational`.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a través de infraestructura de inferencia estándar.
- Ejecución local mediante llama.cpp y derivados gracias al formato GGUF.
- Razonamiento, generación de código, matemáticas, visión, audio, tool calling, function calling y modo de pensamiento: no disponible (no se documenta ninguna de estas capacidades).
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte de otros idiomas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de instrucción o chat específicas (plantillas de prompt): no disponible.

## Casos de uso

- Asistente conversacional local en inglés: con cuantizaciones de 7-9 GB (Q4_K_M, Q5_K_M), el modelo se puede ejecutar en una GPU de consumo o incluso en CPU con RAM suficiente, ofreciendo un chatbot privado sin dependencia de APIs externas.
- Prototipado de aplicaciones de chat sin coste de inferencia en la nube: usar la variante i1-Q4_K_M (7,6 GB) durante el desarrollo permite iterar sobre prompts y plantillas de diálogo antes de decidir si se migra a una API comercial.
- Evaluación de técnicas de cuantización: al publicarse un rango amplio de cuantizaciones (de IQ1_S a Q6_K) sobre el mismo modelo, el repositorio sirve como banco de pruebas para medir la degradación de perplejidad y coherencia según el nivel de compresión.
- Generación de cuantizaciones propias: el archivo imatrix incluido (0,1 GB) permite a otros usuarios producir sus propios GGUF calibrados con la misma matriz de importancia, por ejemplo para tamaños o configuraciones no cubiertos.
- Despliegue en equipos sin GPU dedicada: las variantes IQ1_S (3,1 GB) e IQ2_M (4,5 GB) permiten cargar un modelo de 12B en máquinas modestas, aceptando una pérdida de calidad notable a cambio de viabilidad.
- Experimentación en investigación sobre eficiencia de memoria: comparar el comportamiento de las variantes Q4_0, IQ4_NL, IQ4_XS y Q4_K_S, todas de aproximadamente 7,2 GB, resulta útil para estudiar qué esquema de cuantización preserva mejor la calidad a igual presupuesto de VRAM.
- Fine-tuning o destilación sobre el modelo base: aunque este repositorio solo contiene GGUF, el modelo base `wave-on-discord/silly-v0.1` en safetensors puede emplearse como punto de partida para ajustes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no ha devuelto datos al respecto. Los únicos datos cuantitativos publicados son los tamaños de archivo de cada cuantización y las notas cualitativas del autor sobre calidad relativa.

| Cuantización | Tamaño (GB) | Nota del autor |
|---|---|---|
| i1-IQ1_S | 3,1 | for the desperate |
| i1-IQ1_M | 3,3 | mostly desperate |
| i1-IQ2_XXS | 3,7 | — |
| i1-IQ2_M | 4,5 | — |
| i1-Q2_K_S | 4,6 | very low quality |
| i1-Q2_K | 4,9 | IQ3_XXS probably better |
| i1-IQ3_XXS | 5,0 | lower quality |
| i1-IQ3_S | 5,7 | beats Q3_K* |
| i1-Q3_K_M | 6,2 | IQ3_S probably better |
| i1-IQ4_XS | 6,8 | — |
| i1-Q4_K_S | 7,2 | optimal size/speed/quality |
| i1-Q4_K_M | 7,6 | fast, recommended |
| i1-Q5_K_M | 8,8 | — |
| i1-Q6_K | 10,2 | practically like static Q6_K |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más 1-3 GB adicionales para caché KV y sobrecarga del runtime, dependiendo de la longitud de contexto (que no está documentada) y del backend.
- Rangos concretos: i1-IQ1_S ≈ 4-6 GB de VRAM total; i1-Q4_K_M ≈ 9-11 GB; i1-Q5_K_M ≈ 10-12 GB; i1-Q6_K ≈ 12-14 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4 y Q5; RTX 3090, RTX 4090 o RTX 5090 (24 GB o más) para Q6_K y para contextos largos; A100 40/80 GB y H100 solo tendrían sentido en despliegues multi-usuario con vLLM u otro servidor, aunque el formato GGUF está pensado para llama.cpp.
- Viabilidad en GPU de consumo: sí. Las variantes de 3,1 a 8,8 GB caben en tarjetas de 8, 12 y 16 GB; el modelo completo en FP16 requeriría aproximadamente 24,5 GB solo de pesos, por lo que no cabe en GPUs de consumo de gama media.
- Ejecución en CPU: viable con llama.cpp usando RAM del sistema; se recomienda al menos el doble de RAM que el tamaño del archivo para evitar swapping. Las variantes IQ1/IQ2 son las más adecuadas para equipos con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y, en general, cualquier runtime compatible con GGUF. Para servidores de alto throughput con safetensors habría que usar el modelo base, no este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. La tabla siguiente recoge únicamente las variantes directamente relacionadas con este repositorio, que comparten arquitectura y pesos de origen.

| Modelo | Parámetros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silly-v0.1-i1-GGUF | 12,25 B | GGUF (imatrix) | no disponible | no disponible | HuggingFace, 26 cuantizaciones |
| silly-v0.1-GGUF | 12,25 B | GGUF (estáticas) | no disponible | no disponible | HuggingFace |
| wave-on-discord/silly-v0.1 | 12,25 B | safetensors | no disponible | no disponible | HuggingFace (modelo base) |
| Otros modelos de ~12B de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia ni en este repositorio ni en la información disponible del modelo base, no se puede confirmar que el uso comercial esté permitido. Es imprescindible verificar la licencia del modelo original antes de cualquier despliegue en producción.
- Idioma limitado al inglés: no hay evidencia de soporte para castellano ni para otros idiomas, por lo que su uso en aplicaciones en español no está respaldado por el autor.
- Contexto desconocido: la longitud de contexto no está documentada, lo que impide dimensionar correctamente la caché KV y planificar aplicaciones que dependan de ventanas largas.
- Degradación por cuantización: las variantes de menor tamaño (IQ1_S, IQ1_M, IQ2_XXS, Q2_K_S) están descritas por el propio autor como de calidad muy baja; pueden producir incoherencias, repeticiones y pérdida de instrucciones.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinación. Al tratarse de un modelo conversacional sin documentación de alineación, se debe asumir un riesgo elevado en tareas que requieran precisión factual.
- Sesgos: no disponible. No hay información sobre la composición del dataset de entrenamiento ni sobre análisis de sesgo.
- Trazabilidad limitada: el modelo base `wave-on-discord/silly-v0.1` carece de model card detallada en la información recogida, lo que dificulta auditar su origen, datos de entrenamiento y proceso de alineación.
- Métricas de adopción nulas: el repositorio registra 0 descargas y 0 likes, por lo que no existe retroalimentación de la comunidad que permita validar su comportamiento en producción.
- Fechas inconsistentes: la fecha de creación indicada (2026-09-11) es posterior a la fecha actual, lo que sugiere un posible error de metadatos que conviene verificar.
- Resultados de búsqueda no relevantes: las consultas web realizadas devolvieron exclusivamente páginas del servicio público francés de renovación de vivienda (France Rénov'), sin ninguna relación con el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/silly-v0.1-i1-GGUF
- Modelo base: https://huggingface.co/wave-on-discord/silly-v0.1
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/silly-v0.1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#silly-v0.1-i1-GGUF
- Archivo imatrix: https://huggingface.co/mradermacher/silly-v0.1-i1-GGUF/resolve/main/silly-v0.1.imatrix.gguf
- Peticiones de cuantización y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
