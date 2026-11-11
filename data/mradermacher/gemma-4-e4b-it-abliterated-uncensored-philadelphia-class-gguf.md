# mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF

## Resumen

Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF es una distribución de cuantizaciones estáticas en formato GGUF del modelo PhillyLabs/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS, publicada por mradermacher. Se trata de una variante del modelo Gemma 4 E4B de Google sometida a un proceso de *abliteration* (eliminación de la dirección de rechazo en el espacio de activaciones) con el objetivo declarado de reducir los comportamientos de negativa del modelo afinado por instrucciones. El repositorio incluye tanto los pesos cuantizados en múltiples niveles de precisión como los ficheros `mmproj` necesarios para el procesamiento multimodal.

El modelo conserva la arquitectura del Gemma 4 E4B original, con 7.463.013.674 parámetros totales según los safetensors del repositorio, y mantiene las capacidades multimodales del modelo base, como indica el fichero de proyección multimodal incluido. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que genera una discrepancia que conviene revisar antes de cualquier uso comercial.

Su relevancia actual radica en que ofrece una vía práctica para ejecutar un modelo de aproximadamente 7.500 millones de parámetros en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que van desde 4,5 GB (Q2_K) hasta 15 GB (f16), y con soporte multimodal a través de los ficheros `mmproj`. No obstante, al tratarse de una modificación no oficial del modelo original, no dispone de benchmarks publicados ni de garantías de calidad equivalentes a las del Gemma 4 E4B canónico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E4B, familia transformer multimodal) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con license_link a los términos de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors y bfloat16 en el modelo base |
| Tamano del repositorio | 76,4 GB |
| Libreria | transformers |
| Pipeline | no disponible |
| Descargas | 1.444 |
| Likes | 2 |
| Fecha de creacion | 2026-07-20 |
| Ultima actualizacion | 2026-11-10 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Gemma 4 E4B más allá de su pertenencia a la familia Gemma 4 y de su carácter multimodal, evidenciado por los ficheros `mmproj` incluidos en el repositorio. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento. El modelo base es un modelo afinado por instrucciones (sufijo IT) sobre el que se ha aplicado un proceso de *abliteration*, técnica que identifica y elimina la dirección de activación asociada al rechazo para reducir la tasa de negativas del modelo.

El repositorio de mradermacher no contiene entrenamiento adicional: se limita a generar cuantizaciones estáticas del modelo de PhillyLabs mediante herramientas de conversión a GGUF. Los metadatos internos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma una conversión desde pesos de Hugging Face. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni modos de razonamiento explícito. Existe una variante con cuantizaciones ponderadas por imatrix en el repositorio `mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF`, que el autor recomienda para una mejor relación calidad/tamaño.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Gemma 4 E4B afinado por instrucciones.
- Procesamiento multimodal de imágenes, habilitado por los ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` incluidos en el repositorio.
- Reducción de comportamientos de rechazo respecto al modelo original, consecuencia del proceso de *abliteration* aplicado por PhillyLabs.
- Ejecución local en CPU y GPU mediante llama.cpp y derivados, gracias al formato GGUF.
- Compatibilidad con endpoints, según la etiqueta `endpoints_compatible` del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (5,4 GB) y Q5_K_M (5,8 GB) permiten ejecutar el modelo en GPUs con 8 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipado sin depender de servicios en la nube.
- Experimentación con modelos sin filtros de rechazo: el proceso de *abliteration* hace que el modelo sea adecuado para investigación sobre alineación, análisis de sesgos y estudio de comportamientos de negativa en modelos afinados por instrucciones.
- Procesamiento de documentos con imágenes: la inclusión de ficheros `mmproj` permite alimentar el modelo con capturas, diagramas o páginas escaneadas y obtener descripciones o extracción de información en inglés, útil en tareas de accesibilidad o digitalización.
- Generación de texto creativo sin restricciones temáticas: para proyectos de escritura ficcional que requieran temáticas sensibles, el modelo ofrece menor tasa de negativas que el Gemma 4 E4B estándar, aunque con las advertencias de la sección de limitaciones.
- Evaluación comparativa de cuantizaciones: el repositorio incluye doce niveles de cuantización distintos, lo que permite medir el impacto de la precisión en la perplejidad y la calidad de salida sobre un mismo modelo base, útil para calibrar pipelines de despliegue.
- Integración en aplicaciones de chat locales con contexto conversacional: la etiqueta `conversational` y el formato GGUF permiten incorporar el modelo a interfaces tipo chatbot que se ejecutan íntegramente en el dispositivo del usuario, sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈ 4,5 GB; Q3_K_M ≈ 4,9 GB; IQ4_XS ≈ 5,2 GB; Q4_K_M ≈ 5,4 GB; Q5_K_M ≈ 5,8 GB; Q6_K ≈ 6,3 GB; Q8_0 ≈ 8,1 GB; f16 ≈ 15,0 GB. A estas cifras hay que sumar entre 0,7 GB (mmproj-Q8_0) y 1,1 GB (mmproj-f16) si se utiliza la capacidad multimodal.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada. Por tamaño, las cuantizaciones Q4 y Q5 encajan en GPUs de consumo con 8 GB de VRAM; Q8_0 requiere al menos 10-12 GB; f16 requiere GPUs de 16 GB o superiores.
- Cabe en GPU de consumo: sí, al menos en las cuantizaciones Q2_K a Q5_K_M para GPUs de 8 GB, y hasta Q8_0 en GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp y Ollama como opciones principales para GGUF; también es posible usar otros runners compatibles con GGUF. El modelo base en safetensors requiere transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF (este) | 7.463.013.674 | no disponible | apache-2.0 (con enlace a términos Gemma 4) | GGUF | Cuantizaciones estáticas de un modelo abliterated multimodal |
| Gemma-4-E4B-IT (modelo base oficial) | no disponible en la información | no disponible | términos de Gemma 4 de Google | safetensors | Modelo original sin abliteration; referencia de calidad y comportamiento |
| PhillyLabs/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS | 7.463.013.674 (según este repo) | no disponible | apache-2.0 | safetensors, bfloat16 | Modelo fuente sin cuantizar; requiere más VRAM |
| Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF | 7.463.013.674 (según este repo) | no disponible | apache-2.0 | GGUF (imatrix) | Variante con cuantizaciones ponderadas por imatrix, recomendada por el mismo autor |

## Limitaciones y advertencias

- El proceso de *abliteration* reduce los rechazos, pero no elimina necesariamente todos los sesgos del modelo original ni garantiza un comportamiento seguro; puede aumentar la probabilidad de generar contenido dañino, ofensivo o factualmente incorrecto.
- Riesgo de alucinación: no se han publicado evaluaciones específicas para esta variante, por lo que la fiabilidad factual no está caracterizada.
- Idiomas: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Licencia: aunque la etiqueta indica apache-2.0, el campo `license_link` apunta a los términos de Gemma 4 de Google, lo que crea una ambigüedad legal. Conviene verificar las condiciones reales antes de un uso comercial.
- Longitud de contexto: no documentada en esta ficha; debe consultarse la model card del modelo base de PhillyLabs.
- Se trata de una modificación no oficial: no cuenta con el respaldo de Google ni de PhillyLabs en cuanto a soporte, actualizaciones o garantías de calidad.
- El repositorio ocupa 76,4 GB, por lo que la descarga completa es costosa; se recomienda descargar solo la cuantización necesaria.
- Las cuantizaciones de menor tamaño (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality".
- No hay información sobre tool calling, agentes ni modo de razonamiento, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF
- Modelo base en Hugging Face: https://huggingface.co/PhillyLabs/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Variante con cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF
- Licencia enlazada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
