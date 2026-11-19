# mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF

## Resumen

Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled, publicada por el usuario mradermacher, especializado en la conversión de pesos a formatos de inferencia local. El modelo subyacente es un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), afinado específicamente para generación de código, depuración y flujos de trabajo agénticos, a partir de trazas de entrenamiento del dataset DSFFGFG456/fable-5-coding-and-debugging-traces y con un proceso de destilación sobre una base Qwen de la familia 3.8.

La relevancia de esta publicación es práctica: el repositorio original en safetensors requiere alrededor de 55 GB en FP16, mientras que estas cuantizaciones reducen el peso a entre 11 GB (Q2_K) y 29,1 GB (Q8_0), lo que permite ejecutar un modelo de 27B en GPUs de consumo con 16-24 GB de VRAM o incluso en configuraciones con memoria unificada. El repositorio acumula 878.529 descargas y 36 likes, lo que indica una adopción notable dentro del ecosistema de inferencia local con llama.cpp y derivados.

La licencia es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales. El autor de las cuantizaciones declara únicamente el idioma inglés en los metadatos, y no se han publicado especificaciones detalladas de contexto, arquitectura interna ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (según metadatos del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3 mil millones de parámetros derivado de la familia Qwen 3.8, según se deduce del identificador del repositorio. El autor del modelo base (khazarai) lo describe como un modelo "distilled" orientado a coding y agentic-coding, entrenado sobre el dataset DSFFGFG456/fable-5-coding-and-debugging-traces, que contiene trazas de codificación y depuración. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, la presencia de fases de RLHF o DPO, ni detalles sobre innovaciones arquitectónicas específicas más allá de la etiqueta "unsloth" en los tags, que sugiere el uso de técnicas de ajuste eficiente de Unsloth durante el entrenamiento o el afinado.

La contribución técnica de esta publicación concreta es la cuantización estática mediante el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), que genera variantes GGUF compatibles con llama.cpp. Se incluyen además dos ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora capacidades multimodales (probablemente visión) que requieren un proyector separado para funcionar en llama.cpp. Existe una variante con cuantización ponderada e imatrix publicada en el repositorio hermano mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-i1-GGUF, que el autor recomienda para calidad superior en tamaños equivalentes.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en tareas de codificación y depuración según la composición declarada del dataset de entrenamiento.
- Razonamiento multi-paso y resolución de problemas de programación, incluyendo la etiqueta "reasoning" en los metadatos.
- Flujos agénticos de codificación (agentic-coding): planificación de tareas, edición de ficheros y ejecución iterativa de comandos en entornos de desarrollo.
- Depuración de código: análisis de errores, identificación de causas y propuesta de correcciones, a partir de las trazas de debugging del dataset.
- Capacidades multimodales: la presencia de ficheros mmproj en el repositorio sugiere soporte de entrada de imágenes, aunque no se detalla la naturaleza exacta en la información disponible.
- Conversación multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita el despliegue como servicio.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Asistente de codificación en el IDE: integrado mediante llama.cpp u Ollama, el modelo puede autocompletar funciones, explicar código existente y proponer refactorizaciones, con la ventaja de que la cuantización Q4_K_M (16,9 GB) cabe en GPUs de consumo de 24 GB y mantiene la privacidad del código al ejecutarse en local.
- Depuración automatizada en pipelines de CI: dado su entrenamiento sobre trazas de codificación y depuración, puede analizar logs de fallos, identificar la línea culpable y generar parches candidatos que se validen en el propio pipeline antes de fusionar.
- Agente de desarrollo autónomo: con capacidad de razonamiento multi-paso, puede descomponer una tarea (por ejemplo, añadir una funcionalidad a un repositorio), inspeccionar ficheros, aplicar cambios y verificar resultados en un bucle controlado por el orquestador.
- Generación de tests unitarios: a partir de una firma de función o de un módulo, el modelo puede producir casos de prueba y datos de ejemplo, reduciendo el trabajo manual en proyectos con cobertura baja.
- Migración y modernización de código legacy: el modelo puede traducir fragmentos entre lenguajes o entre versiones de un framework, y justificar los cambios, lo que resulta útil en tareas de mantenimiento a gran escala.
- Asistencia en entornos con requisitos de soberanía del dato: al ser Apache 2.0 y ejecutable en hardware propio, encaja en organizaciones que no pueden enviar código a APIs externas, usando la cuantización Q8_0 (29,1 GB) en una A100 40 GB o Q4_K_M en una RTX 4090.
- Chat técnico de soporte a desarrolladores: con la etiqueta "conversational" y compatibilidad con endpoints, puede desplegarse como servicio interno que responde dudas sobre una base de código concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, valores orientativos según el tamaño de los ficheros GGUF):
  - Q2_K: ~11 GB de pesos; ~12-13 GB en total con contexto moderado.
  - Q3_K_M: ~13,6 GB de pesos; ~15 GB en total.
  - IQ4_XS: ~15,5 GB de pesos; ~17 GB en total.
  - Q4_K_M: ~16,9 GB de pesos; ~18-19 GB en total.
  - Q5_K_M: ~19,6 GB de pesos; ~21 GB en total.
  - Q6_K: ~22,5 GB de pesos; ~24 GB en total.
  - Q8_0: ~29,1 GB de pesos; ~31 GB en total.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M, IQ4_XS y Q5_K_M con contexto moderado; Q6_K al límite.
  - RTX 3090 / 4080 (16-24 GB): Q4_K_S o Q3_K_L según el contexto requerido.
  - A100 40 GB / H100: Q8_0 o Q6_K con contexto amplio.
  - Configuraciones multi-GPU o con memoria unificada (Apple Silicon de 32 GB o más): Q5_K_M o Q6_K.
- Cabe en GPU de consumo: sí, desde Q2_K (11 GB) en GPUs de 12 GB, hasta Q4_K_M (16,9 GB) en GPUs de 24 GB. Las cuantizaciones Q8_0 requieren GPU profesional o memoria unificada amplia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (el tag "endpoints_compatible" lo indica). Para los ficheros mmproj se requiere un runtime con soporte multimodal de llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Fable-5-Coding-Distilled (GGUF, este) | 27,3 B | No disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas; variante i1 con imatrix disponible |
| Qwen3.8-27B-Fable-5-Coding-Distilled (base, safetensors) | 27,3 B | No disponible | Apache 2.0 | Safetensors | Pesos originales; ~55 GB en FP16 |
| Modelos Qwen de ~27-32B de la familia 3.x | ~27-32 B | No disponible | Apache 2.0 (habitual en la familia) | Safetensors, GGUF | Alternativas de referencia de la misma familia; comparación de rendimiento no disponible |
| Modelos de código de ~30B (por ejemplo, variantes Code de la familia Qwen) | ~30 B | No disponible | Variable | Safetensors, GGUF | Categoría equivalente en tamaño y tarea; sin datos de benchmark para comparar |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo afinado sobre trazas de código, puede heredar sesgos de estilo y de ecosistema (lenguajes y frameworks sobrerrepresentados en el dataset).
- Riesgo de alucinación: presente como en cualquier LLM; en tareas de código puede generar APIs inexistentes o firmas incorrectas, por lo que se recomienda validar la salida con tests y compiladores antes de usarla en producción.
- Limitaciones de contexto e idioma: el autor declara únicamente inglés; el rendimiento en castellano no está garantizado. La longitud de contexto no está documentada, lo que impide planificar casos de uso con ventanas largas sin verificación empírica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se han identificado cláusulas adicionales en la información disponible. Conviene verificar la licencia del modelo base y del dataset de entrenamiento por si impusieran condiciones adicionales.
- Caveats para producción: las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q6_K/Q8_0 cuando la calidad sea crítica. La variante i1 (imatrix) del repositorio hermano puede ofrecer mejor relación calidad/tamaño.
- Los ficheros mmproj son necesarios para las capacidades multimodales; sin ellos, el modelo funciona solo con texto. La naturaleza exacta de la modalidad soportada no está documentada.
- El repositorio ocupa 190,8 GB en total; la descarga selectiva de una sola cuantización es imprescindible para no consumir almacenamiento innecesario.
- No se dispone de información sobre el proceso de alineación (RLHF/DPO) del modelo base, lo que limita la evaluación de su comportamiento en dominios sensibles.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF
- Modelo base: https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled
- Variante con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/DSFFGFG456/fable-5-coding-and-debugging-traces
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
