# mradermacher/Beek-GGUF

## Resumen

Beek es un modelo de lenguaje desarrollado por UTF-ai, orientado al sector público neerlandés y alineado con los valores públicos de los Países Bajos. Se distribuye bajo licencia Apache 2.0 y soporta neerlandés e inglés. La versión aquí descrita es la cuantización GGUF realizada por mradermacher a partir del modelo base `UTF-ai/Beek`, pensada para inferencia local y despliegue eficiente en hardware de consumo o servidores modestos.

El modelo cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande. La model card del repositorio GGUF no detalla la arquitectura interna ni la longitud de contexto, aunque las etiquetas hacen referencia a `qwen3.8`, lo que sugiere una base derivada de la familia Qwen. El repositorio incluye además ficheros `mmproj`, lo que indica capacidades multimodales (visión) en el modelo original.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo especializado en dominio gubernamental neerlandés mediante cuantizaciones GGUF, con opciones desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), facilitando su uso en entornos con recursos limitados y en aplicaciones de administración pública que requieren soberanía de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3.8` sugiere base Qwen) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | neerlandés (nl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `UTF-ai/Beek`. La etiqueta `qwen3.8` en el repositorio sugiere que se trata de un transformer derivado de la familia Qwen, con aproximadamente 27,3 mil millones de parámetros. El repositorio GGUF incluye ficheros `mmproj`, lo que confirma que el modelo original incorpora un proyector multimodal para entrada de imágenes, aunque no se especifica el codificador visual empleado.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Las etiquetas del modelo indican un enfoque en el sector público neerlandés (`public-sector`, `government`, `dutch-public-values`), lo que sugiere un ajuste orientado a tareas administrativas y valores institucionales de los Países Bajos, pero no se aportan detalles técnicos sobre dicho ajuste.

## Capacidades

- Generación de texto conversacional en neerlandés e inglés.
- Procesamiento multimodal: la presencia de ficheros `mmproj` indica soporte de entrada de imágenes (visión).
- Orientación a dominio gubernamental y sector público neerlandés, según las etiquetas del modelo.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en infraestructuras de inferencia estándar.
- No se documentan explícitamente capacidades de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas a neerlandés e inglés según la model card.

## Casos de uso

- Atención ciudadana automatizada: el modelo puede gestionar consultas en neerlandés sobre trámites administrativos, aprovechando su ajuste al dominio del sector público neerlandés y su licencia Apache 2.0 para despliegue institucional.
- Generación de documentación administrativa: redacción y resumen de textos oficiales en neerlandés, con la ventaja de ejecutarse en infraestructura propia gracias a las cuantizaciones GGUF, lo que preserva la soberanía de datos.
- Procesamiento de documentos con imágenes: gracias al proyector multimodal (`mmproj`), puede extraer información de formularios o documentos escaneados en flujos de digitalización de la administración.
- Asistentes internos para empleados públicos: despliegue local con cuantización Q4_K_S (15,9 GB) en servidores con una sola GPU, ofreciendo respuestas en neerlandés sobre normativa y procedimientos internos.
- Traducción neerlandés-inglés en contextos institucionales: el soporte bilingüe permite tareas de traducción de comunicados y documentación oficial entre ambos idiomas.
- Investigación en PLN para neerlandés: el modelo sirve como base para experimentos académicos sobre modelos ajustados a dominios específicos, con la ventaja de su licencia permisiva y su disponibilidad en GGUF para entornos de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~11 GB, Q4_K_S ~15,9 GB, Q8_0 ~29,1 GB. Los ficheros `mmproj` añaden 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa la entrada multimodal.
- GPU recomendadas: para Q8_0 se recomienda una A100 40 GB o H100; para Q4_K_S es viable una RTX 4090 (24 GB) o A6000 (48 GB); para Q2_K podría ejecutarse en GPUs de 16 GB como RTX 4080 o A4000, con posible offloading parcial.
- En GPU de consumo: Q4_K_S cabe en RTX 4090 (24 GB) con margen para contexto; Q2_K podría caber en GPUs de 12-16 GB con cuantización agresiva.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y endpoints estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Beek (este modelo) | ~27,3 B | no disponible | nl, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-32B | ~32 B | 128K (típico en la familia) | multilingüe | Apache 2.0 (mayoría de variantes) | safetensors, GGUF |
| Gemma 2 27B | ~27 B | 8K | multilingüe | Gemma license | safetensors, GGUF |
| Mistral Small 24B | ~24 B | 32K | multilingüe | Apache 2.0 | safetensors, GGUF |

Nota: los datos de los modelos comparables son orientativos y pueden variar según la variante; no se dispone de benchmarks de Beek para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo; al estar ajustado a valores públicos neerlandeses, podría reflejar sesgos institucionales o culturales de dicho contexto.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; no se documentan evaluaciones de fidelidad.
- Capacidades multilingües limitadas a neerlandés e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La longitud de contexto no está documentada, lo que impide planificar aplicaciones que requieran ventanas largas.
- Aunque la licencia es Apache 2.0, se recomienda verificar las condiciones del modelo base `UTF-ai/Beek` y de los datos de entrenamiento para uso comercial en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; para producción se recomienda Q4_K_S o superior.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad sin validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Beek-GGUF
- Modelo base: https://huggingface.co/UTF-ai/Beek
- Página de descargas del cuantizador: https://hf.tst.eu/model#Beek-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
