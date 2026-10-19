# mradermacher/qwen3.5-4b-andalusian-GGUF

## Resumen

`mradermacher/qwen3.5-4b-andalusian-GGUF` es un conjunto de cuantizaciones estáticas en formato GGUF del modelo `valendra/qwen3.5-4b-andalusian`, un ajuste fino de aproximadamente 4.205 millones de parámetros orientado al castellano con especial atención al habla andaluza. El trabajo de cuantización lo firma mradermacher, un publicador habitual de conversiones GGUF dentro del ecosistema open source, y no introduce cambios en los pesos más allá de la compresión: es un artefacto de distribución, no un modelo nuevo.

El interés práctico del repositorio está en que permite ejecutar un modelo especializado en una variedad dialectal del español en hardware de consumo, desde estaciones con GPU modesta hasta portátiles sin GPU dedicada, usando llama.cpp u Ollama. El modelo base se entrenó sobre el dataset `valendra/andalusian-synthetic`, de naturaleza sintética, lo que condiciona tanto su cobertura como sus riesgos de calidad.

La información pública disponible es escasa: la model card se limita a la tabla de cuantizaciones y a las notas estándar del cuantizador, sin detallar arquitectura, longitud de contexto, composición del corpus de entrenamiento ni resultados de evaluación. Además, la licencia no aparece indicada en los metadatos, un punto crítico antes de plantear cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (el nombre indica que deriva de Qwen3.5, pero la model card no detalla la arquitectura) |
| Parámetros totales | 4.205.751.296 (dato real de safetensors del modelo base, ~4,2 B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; adicionalmente mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | es (castellano, con especialización en andaluz) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye con pesos en safetensors |
| Modelo base | valendra/qwen3.5-4b-andalusian |
| Dataset de ajuste | valendra/andalusian-synthetic |
| Tamaño del repositorio | 39,9 GB |
| Descargas / likes | 268 / 1 |
| Pipeline | text-generation |
| Compatibilidad de endpoints | endpoints_compatible (según tags) |
| Fecha de creación / actualización | 2026-03-29 / 2026-10-18 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por la nomenclatura (`qwen3.5-4b`) cabe inferir que se trata de un transformer decoder-only de la familia Qwen3.5 con unos 4,2 B de parámetros, pero la model card de esta conversión no confirma ni la arquitectura exacta, ni el número de capas, ni la dimensión oculta, ni si emplea atención lineal o algún esquema híbrido. Tampoco se documenta la longitud de contexto nativa.

En cuanto al entrenamiento, lo único verificable es que el ajuste se realizó sobre `valendra/andalusian-synthetic`, un conjunto de datos sintético etiquetado con los tags `spanish` y `andalucia`. No hay información sobre el número de tokens empleados, la composición del corpus, si hubo fases de instrucción supervisada, RLHF o DPO, ni sobre técnicas de alineación. La naturaleza sintética del dataset implica que los datos no provienen de hablantes reales, con el riesgo asociado de sobreajuste a patrones generados y de reproducción de estereotipos lingüísticos del andaluz.

La aportación técnica de este repositorio concreto es la cuantización. Se han publicado cuantizaciones estáticas (no ponderadas con imatrix, según advierte el propio autor) en rangos desde Q2_K hasta f16, además de dos ficheros `mmproj` que actúan como suplemento multimodal, lo que sugiere que el modelo base incorpora alguna capacidad de visión; no se detalla qué codificador visual ni qué resolución de imagen soporta.

## Capacidades

- Generación de texto conversacional en castellano, con especialización declarada en la variedad andaluza.
- Conversación multi-turno: los tags incluyen `conversational`, lo que indica un ajuste orientado a diálogo.
- Generación de texto condicionada por prompt libre; no hay evidencia publicada de modos de razonamiento explícito (*thinking*) en este ajuste.
- Posible soporte multimodal: el repositorio incluye ficheros `mmproj-Q8_0` y `mmproj-f16` descritos como suplemento multimodal, aunque no se documenta el alcance real de la capacidad de visión.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas a `es` según los metadatos; no se declara cobertura de otras lenguas.

## Casos de uso

- **Generación de contenido divulgativo en andaluz**: redacción de textos costumbristas, guiones o publicaciones para medios locales que quieran reproducir el registro andaluz de forma consistente, aprovechando el ajuste específico sobre esa variedad.
- **Prototipado de asistentes conversacionales locales**: al caber en GPU de consumo en cuantizaciones Q4_K_M (2,8 GB), permite montar un chatbot de pruebas en un portátil con llama.cpp u Ollama sin depender de API externa, útil para demos y validación de producto.
- **Investigación en dialectología computacional**: generación de corpus sintéticos controlados en andaluz para experimentos de normalización, etiquetado o evaluación de modelos lingüísticos, siempre contrastando con habla real por el origen sintético de los datos.
- **Localización de contenido y adaptación de tono**: reescritura de diálogos de videojuegos, subtítulos o material de marketing dirigidos a audiencia andaluza, usando el modelo como generador de variantes que después revisa un hablante nativo.
- **Transcripción y post-procesado de diálogo en entornos sin conectividad**: despliegue en equipos aislados (por ejemplo, quioscos o sistemas de atención presencial) donde se requiere procesamiento local por privacidad y el volumen de consultas es bajo.
- **Pruebas de robustez y sesgo lingüístico**: uso del modelo como sujeto de estudio para medir cómo un ajuste sobre datos sintéticos dialectales reproduce o exagera rasgos fonéticos y léxicos del andaluz, comparando sus salidas con corpus reales.
- **Base para fine-tuning posterior**: al existir cuantizaciones f16 y Q8_0, sirve como referencia de evaluación de calidad frente a versiones más comprimidas dentro de un mismo pipeline de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones dialectales; únicamente referencia un gráfico genérico de perplejidad comparando tipos de cuantización (elaborado por ikawrakow) que no aporta cifras específicas de este modelo.

## Requisitos de hardware

Estimaciones basadas en los tamaños de fichero publicados más una reserva de 1–2 GB para caché KV y overhead del runtime:

- **Q2_K (2,0 GB) / Q3_K_S (2,2 GB)**: ejecutables en CPU con 4–6 GB de RAM; calidad degradada, solo para pruebas.
- **Q4_K_M (2,8 GB)**: opción recomendada por el autor; requiere ~4–5 GB de VRAM/RAM. Cabe en GPU de consumo de 6 GB (GTX 1660, RTX 2060) y en iGPU con memoria compartida.
- **Q5_K_M (3,2 GB) / Q6_K (3,6 GB)**: ~5–6 GB; cómodas en RTX 3060 12 GB, RTX 4060 Ti, RX 7600.
- **Q8_0 (4,6 GB)**: ~6–7 GB; encaja en RTX 3060 12 GB, RTX 4070, RTX 4090.
- **f16 (8,5 GB)**: ~10–11 GB; requiere GPU de 12 GB o superior (RTX 3090, RTX 4090, A100, H100) para una única instancia completa en VRAM.
- **Multimodal**: los ficheros `mmproj` añaden 0,5 GB (Q8_0) u 0,8 GB (f16) a la huella total.
- **Despliegue**: llama.cpp, Ollama, LM Studio o llama-cpp-python son las vías naturales para GGUF. vLLM y TGI no están orientados a este formato salvo conversión a safetensors; no se documenta soporte oficial.
- **Latencia y throughput**: no disponibles. No hay cifras publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| mradermacher/qwen3.5-4b-andalusian-GGUF | 4,2 B | No disponible | es (andaluz) | No disponible | GGUF (12 cuantizaciones + 2 mmproj) | 268 descargas, 1 like |
| valendra/qwen3.5-4b-andalusian (modelo base) | 4,2 B | No disponible | es (andaluz) | No disponible | safetensors (según el dato de parámetros) | No disponible en la información proporcionada |
| Alternativas de 4 B en castellano | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables sobre modelos comparables de la misma categoría (ajustes dialectales del español en el rango de 3–5 B) en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- **Licencia sin especificar**: los metadatos no indican licencia, ni para esta conversión ni para el modelo base. Sin confirmación explícita del titular, no debe asumirse uso comercial permitido.
- **Datos de entrenamiento sintéticos**: el ajuste se realizó sobre `valendra/andalusian-synthetic`, sin evidencia de validación con hablantes nativos. Existe riesgo de sobreajuste a patrones generados y de reproducir estereotipos del andaluz (exageración fonética, uso cómico del registro).
- **Riesgo de alucinación**: al no haber benchmarks publicados ni documentación sobre alineación (RLHF/DPO), no hay garantías sobre la tasa de invención de hechos, especialmente en dominios técnicos.
- **Contexto desconocido**: se desconoce la ventana de contexto nativa, lo que impide planificar tareas de documento largo o conversaciones extensas con garantías.
- **Alcance lingüístico reducido**: solo se declara `es`; es previsible un rendimiento pobre en catalán, gallego, euskera o inglés, y también en registros formales del castellano estándar si el ajuste ha desplazado la distribución.
- **Adopción muy baja**: 268 descargas y 1 like implican ausencia de validación comunitaria; los fallos detectados por terceros son prácticamente inexistentes como señal de calidad.
- **Cuantizaciones estáticas únicamente**: el autor advierte que no hay cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relación calidad/tamaño en Q2–Q4. Para producción se recomienda Q4_K_M o superior.
- **Capacidad multimodal sin documentar**: la presencia de ficheros `mmproj` no garantiza un comportamiento visual fiable; no hay especificaciones del codificador ni evaluaciones.
- **Trazabilidad del cuantizador**: la model card es una plantilla automática; no incluye verificación de que el tokenizador o la plantilla de chat del modelo base se conserven correctamente en la conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen3.5-4b-andalusian-GGUF
- Modelo base: https://huggingface.co/valendra/qwen3.5-4b-andalusian
- Dataset de ajuste: https://huggingface.co/datasets/valendra/andalusian-synthetic
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#qwen3.5-4b-andalusian-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
- Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces anteriores son los únicos relevantes encontrados en la información disponible.
