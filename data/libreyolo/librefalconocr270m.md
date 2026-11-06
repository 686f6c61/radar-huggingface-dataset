# LibreYOLO/LibreFalconOCR270m

## Resumen

LibreFalconOCR270m es un espejo de pesos del modelo Falcon-OCR 1.5 de Technology Innovation Institute (TII), empaquetado por LibreYOLO para su uso dentro de su tarea `ocr`. Se trata de un modelo de visión-lenguaje (VLM) especializado en reconocimiento óptico de caracteres sobre documentos completos, con arquitectura de fusión temprana ("early-fusion") y 269.944.416 parámetros totales (aproximadamente 0,27B). Convierte una imagen de página en Markdown, incluyendo fórmulas LaTeX y tablas HTML, en una sola pasada.

El modelo no introduce cambios en los parámetros aprendidos: `model.safetensors`, `config.json`, `model_args.json` y los ficheros del tokenizador son idénticos byte a byte al snapshot upstream de `tiiuae/Falcon-OCR` (commit `0bc28f89c90fbe8bdb063097fab144d4ce4c19b5`). La diferencia respecto al original es operativa: LibreYOLO excluye los ficheros de código remoto del upstream y ejecuta su propio port en PyTorch de la arquitectura, de modo que nunca se ejecuta código remoto al cargar el modelo.

Es relevante ahora porque ofrece un OCR de documentos de tamaño reducido (0,27B), licencia Apache 2.0 y pesos en safetensors, integrable en pipelines de extracción documental sin depender de modelos de decenas de miles de millones de parámetros. Además, expone un modo con detección de layout (PP-DocLayoutV3) que permite leer regiones individuales de la página en lugar de la página completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) de fusión temprana para OCR documental; port en PyTorch propio de LibreYOLO sobre la arquitectura Falcon-OCR |
| Parametros totales | 269.944.416 (aproximadamente 0,27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `model_args.json` y tokenizador |

## Arquitectura y entrenamiento

La arquitectura es un modelo de visión-lenguaje con esquema de fusión temprana, según la model card del autor. El modelo base es `tiiuae/Falcon-OCR`, desarrollado por TII (Technology Innovation Institute, Emiratos Árabes Unidos) y descrito en el paper arXiv:2603.27365, con código en el repositorio `tiiuae/Falcon-Perception`. La versión empaquetada corresponde a Falcon OCR 1.5.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificación (decodificación especulativa, atención lineal u otras) más allá de la mención a la fusión temprana. El espejo de LibreYOLO no modifica ningún parámetro aprendido: solo redistribuye los pesos y evita la ejecución de código remoto mediante un port propio en PyTorch.

## Capacidades

- Reconocimiento óptico de caracteres sobre páginas completas de documento en una sola pasada.
- Conversión de la página a Markdown, con soporte declarado de fórmulas LaTeX y tablas HTML.
- Modo con detección de layout: segmentación de la página en regiones mediante PP-DocLayoutV3 y lectura individual de cada región.
- Entrada de imagen y salida de texto (pipeline `image-to-text`).
- Integración en la librería `libreyolo` mediante la clase `LibreVLM` con la tarea `ocr`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles.

## Casos de uso

- Digitalización de documentos escaneados: el modelo recibe la imagen de una página y devuelve el texto en Markdown en una sola pasada, lo que simplifica el pipeline al evitar etapas separadas de detección de texto y reconocimiento.
- Extracción de fórmulas matemáticas: al generar LaTeX, resulta adecuado para digitalizar artículos científicos, apuntes y libros técnicos conservando la notación matemática.
- Conversión de tablas a HTML: permite transformar tablas impresas o escaneadas en tablas HTML estructuradas, útiles para su posterior parseo y carga en bases de datos.
- Procesamiento de documentos con layout complejo: con `layout=True`, el modelo segmenta la página con PP-DocLayoutV3 y lee cada región por separado, lo que ayuda en documentos con columnas, cabeceras o bloques heterogéneos donde la lectura lineal de página completa puede mezclar contenido.
- Archivado y búsqueda documental: la salida Markdown puede indexarse en un motor de búsqueda o en un sistema RAG para hacer consultable un archivo histórico de documentos escaneados.
- Automatización de ingesta de facturas y formularios: la extracción de texto estructurado por regiones permite aislar campos y tablas de documentos administrativos antes de pasarlos a un sistema de validación.
- Despliegue en entornos con recursos limitados: con 0,27B de parámetros y pesos en safetensors de un repositorio de 1,1 GB, es viable en infraestructura modesta, siempre que se valide el rendimiento real en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 1,1 GB, lo que corresponde aproximadamente a los pesos en precisión de 32 bits para 0,27B de parámetros; en FP16 el peso ronda los 0,54 GB y en cuantizaciones de 8 o 4 bits sería aún menor.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los pesos, la carga en FP16 debería situarse en torno a 1 GB o menos, más el consumo del codificador visual y de las activaciones, que no se detalla.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con suficiente memoria para los pesos y el codificador visual debería poder alojarlo; no se especifican modelos concretos.
- Encaje en GPU de consumo: probable por el reducido número de parámetros, pero no confirmado en la información disponible.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (`LibreVLM("falcon-ocr")`). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LibreFalconOCR270m | 269.944.416 | no disponible | Apache 2.0 | safetensors | Espejo de Falcon-OCR 1.5 con port propio en PyTorch |
| tiiuae/Falcon-OCR | no disponible en esta ficha | no disponible | Apache 2.0 | safetensors + código remoto | Modelo upstream del que deriva el espejo |
| Alternativas de OCR/VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Es un espejo de pesos, no un modelo nuevo: cualquier limitación del Falcon-OCR 1.5 original se hereda sin cambios.
- No se ejecuta código remoto: LibreYOLO usa su propio port en PyTorch, por lo que el comportamiento puede diferir del upstream si el port no replica exactamente la implementación original.
- Idiomas soportados no documentados: no hay garantía explícita de cobertura multilingüe ni de calidad por idioma.
- Longitud de contexto no documentada: se desconoce cuántas regiones o cuánta extensión de página puede procesar en una sola pasada.
- Riesgo de alucinación: como todo modelo generativo de imagen a texto, puede producir texto, fórmulas o estructuras de tabla que no aparecen en la imagen; conviene validar la salida en flujos críticos.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado sobre documentos, puede reflejar los sesgos de distribución de su corpus de entrenamiento (tipografías, idiomas y formatos sobrerrepresentados).
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de copyright y licencia, incluidos `LICENSE` y `NOTICE`, y atribuir a TII como autor original.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-05: no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia habituales, lo que limita las opciones de despliegue a la librería `libreyolo` salvo verificación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreFalconOCR270m
- Modelo base upstream: https://huggingface.co/tiiuae/Falcon-OCR
- Código del modelo original: https://github.com/tiiuae/Falcon-Perception
- Paper: arXiv:2603.27365
- Repositorio de referencia del commit espejo: `0bc28f89c90fbe8bdb063097fab144d4ce4c19b5` en `tiiuae/Falcon-OCR`
