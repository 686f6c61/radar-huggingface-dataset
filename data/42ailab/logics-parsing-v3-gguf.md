# 42ailab/Logics-Parsing-V3-GGUF

## Resumen

Logics-Parsing-V3 es un modelo de visión-lenguaje especializado en el análisis y la extracción estructurada de documentos (OCR con comprensión de maquetación). El modelo original lo desarrolla el equipo Logics de Alibaba, que lo publicó bajo licencia Apache-2.0, y esta ficha corresponde a la build cuantizada en GGUF publicada por el tercero 42ailab para poder ejecutarlo en local con llama.cpp. El repositorio no contiene un modelo nuevo: es una conversión de los pesos originales (base_model: Logics-MLLM/Logics-Parsing-V3) más una verificación de que la cuantización no degrada la calidad.

El problema que ataca es concreto: extraer texto de escaneos, artículos y fotografías de páginas suele fallar en tres frentes, la maquetación (columnas, pies de figura y encabezados que se funden en un único flujo), las fórmulas (que se convierten en ruido o se pierden) y las tablas (celdas combinadas aplanadas). La propuesta del modelo es devolver texto estructurado en una sola pasada, con jerarquía de encabezados, tablas como tablas y fórmulas como fórmulas, y con un estado estructural compacto que se propaga de página a página en su modo de documento largo.

Con 752.393.024 parámetros totales (aproximadamente 0,8B), la build cuantizada ocupa menos de 1 GB (774 MB el decodificador en Q8_0 y 195 MB el codificador de visión en F16), de modo que cabe en un portátil convencional y permite procesar documentos sensibles sin subirlos a la nube. Está disponible en chino e inglés, y en el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en la familia Qwen3.5 (modelo multimodal, pipeline image-text-to-text) |
| Parametros totales | 752.393.024 (aproximadamente 0,8B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 para el decodificador de texto; F16 para el codificador de visión. Se menciona Q4_K_M como comparación de fidelidad, pero no se distribuye |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp): `Logics-Parsing-V3-Q8_0.gguf` y `mmproj-Logics-Parsing-V3-f16.gguf` |

Datos adicionales del repositorio: tamano del repo 1,0 GB, creado el 22 de septiembre de 2026, actualizado el mismo día, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de visión-lenguaje de la familia Qwen3.5, con un decodificador de texto y un codificador de visión empaquetado aparte en el fichero `mmproj` (proyección multimodal) que se mantiene en F16. El rasgo de diseño que el autor destaca es el análisis de estado recurrente entre páginas (state-recurrent parsing): en lugar de intentar meter un documento completo en una sola ventana de contexto, el modelo arrastra un estado estructural compacto de página a página, de forma que la calidad se degrada más lentamente según crece el documento. Además, la estructura y el contenido se generan en una sola pasada: la jerarquía de encabezados, la fusión de contenido entre páginas y la asociación entre figuras y texto las produce el propio modelo, no una cadena de reglas posterior.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Lo que sí consta es el trabajo de esta build: conversión de los pesos originales a un fichero cuantizado de 774 MB más un codificador de visión de 195 MB, verificación de fidelidad de la cuantización (comparación carácter a carácter de Q8_0 frente a Q4_K_M sobre la misma página, con resultado idéntico, motivo por el que se distribuye Q8_0) y empaquetado para ejecución offline en macOS, Windows y Linux.

## Capacidades

- Extracción de texto estructurado a partir de imágenes de documentos: libros escaneados, artículos, fotografías de páginas.
- Preservación de maquetación: encabezados como encabezados, cuerpo como cuerpo, tablas como tablas y fórmulas como fórmulas.
- Reconocimiento y renderizado de notación matemática. En las comprobaciones del autor, el modelo leyó `P(E｜¬H)` correctamente y lo representó como `\neg` en una página de un libro en chino.
- Preservación de superíndices en LaTeX, URL de proyectos y de datasets en páginas de artículos en inglés, de forma literal.
- Manejo de tablas con celdas combinadas sin aplanarlas a una sola fila (objetivo declarado del modelo original).
- Procesamiento de documentos largos con estado estructural entre páginas en el modo de documento largo definido por el modelo original (no operativo en esta build local; véase Limitaciones).
- Idiomas: chino e inglés.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la información disponible, más allá de la etiqueta `conversational` del repositorio.

## Casos de uso

- Digitalización de archivos en papel: fotografiar o escanear páginas de libros y obtener texto estructurado sin subir los ficheros a un servicio en la nube, algo relevante para bibliotecas, archivos históricos y fondos con derechos.
- Procesamiento de contratos y documentos internos: contratos, memorandos y borradores no publicados pueden analizarse en la propia máquina, de modo que el documento nunca sale del equipo, que es el escenario que el autor plantea explícitamente.
- Extracción de tablas para análisis de datos: al conservar la estructura de tablas y celdas combinadas, el resultado se puede convertir después a CSV o DataFrame sin una reconstrucción manual previa.
- Conversión de artículos científicos a Markdown o LaTeX: el modelo conserva superíndices, fórmulas y URL, lo que reduce la corrección manual al alimentar repositorios de documentación o gestores de referencias.
- Preprocesado de corpus para RAG: la salida estructurada (encabezados, cuerpo, tablas) permite trocear el documento por secciones reales en lugar de por longitud fija, lo que facilita mantener la coherencia de los fragmentos.
- Reconocimiento de libros y material didáctico en chino: el autor documenta el caso de una página de libro en chino con palabras fácilmente confundibles, resuelta correctamente frente a otras builds de OCR de su biblioteca.
- Despliegue en puesto de trabajo sin GPU dedicada: al ocupar menos de 1 GB, encaja en flujos de trabajo de oficina en portátiles macOS, Windows o Linux mediante la aplicación de escritorio o la CLI de 42model.
- Verificación de integridad de cuantizaciones: el patrón de comparación Q8_0 frente a Q4_K_M descrito sirve como referencia para equipos que necesiten justificar la elección de una cuantización en producción.

## Benchmarks y rendimiento

El autor remite a las cifras oficiales del repositorio original para los resultados completos en MPDocBench y OmniDocBench v1.6. La única tabla numérica publicada por el upstream y reproducida en esta model card es la de eficiencia en MPDocBench (420 documentos / 3.135 páginas, H100, batch size 1):

| Modelo | Tiempo total (min) | Tiempo por pagina (s) |
|---|---:|---:|
| Logics-Parsing-V3 | 72,46 | 1,39 |
| OvisOCR2 | 73,26 | 1,40 |
| Unlimited-OCR | 90,12 | 1,72 |
| MinerU2.5-Pro | 175,10 | 3,35 |

Mediciones propias del autor de la build GGUF (macOS, Apple Silicon, Q8_0 con codificador de visión F16):

| Comprobacion | Resultado |
|---|---|
| Fidelidad de cuantizacion (Q8_0 frente a Q4_K_M, misma pagina, caracter a caracter) | Idéntica; por eso se distribuye Q8_0 |
| Pagina de libro en chino, palabra facilmente confundible | Leyó `你来代入` correctamente (dos builds de HunyuanOCR leyeron `你来代替`) |
| Pagina de libro en chino, notacion matematica | Leyó `P(E｜¬H)` correctamente y lo renderizó como `\neg` |
| Pagina de articulo en ingles | Superindices LaTeX del bloque de autores y URL de proyecto y dataset, preservados literalmente |

El propio autor advierte que las dos filas de la tabla anterior se apoyan en una sola página cada una y no deben generalizarse como perfil de capacidades. No hay resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de tamano, el decodificador Q8_0 ocupa 774 MB y el codificador de visión F16 195 MB, lo que suma aproximadamente 969 MB de pesos.
- El autor afirma que la build cuantizada ocupa menos de 800 MB en su conjunto práctico y que funciona en un portátil corriente.
- GPU recomendadas: no disponibles. El entorno de medición declarado es macOS sobre Apple Silicon, sin GPU discreta.
- Cabe en GPU de consumo: sí, según el autor, al tratarse de un modelo de 0,8B; no se enumeran modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (formato GGUF, etiqueta `llama.cpp` del repositorio), aplicación de escritorio de 42model (Model Library → OCR) y CLI (`42model download logics-parsing-v3`). No se documenta soporte para vLLM, TGI, Ollama ni otros servidores.
- Latencia y throughput: la única referencia publicada es la de upstream en H100 con batch size 1 (1,39 s por página, 72,46 min para 3.135 páginas). No hay cifras de latencia para la build GGUF en hardware de consumo.

## Comparativa con modelos similares

Los datos comparativos disponibles se limitan a la tabla de eficiencia de upstream; no se publican parámetros, contexto ni licencia de los competidores.

| Modelo | Tiempo por pagina en MPDocBench (s) | Parametros | Contexto | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Logics-Parsing-V3 (esta build, GGUF) | 1,39 (upstream, H100) | 752.393.024 (aproximadamente 0,8B) | no disponible | Apache-2.0 | GGUF en HuggingFace; app y CLI de 42model |
| OvisOCR2 | 1,40 | no disponible | no disponible | no disponible | no disponible |
| Unlimited-OCR | 1,72 | no disponible | no disponible | no disponible | no disponible |
| MinerU2.5-Pro | 3,35 | no disponible | no disponible | no disponible | no disponible |

El autor menciona además, sin cifras, dos builds de HunyuanOCR y el modelo de 7B olmOCR-2 como referencias de su biblioteca interna de evaluación. No se dispone de datos suficientes para una comparativa de rendimiento en calidad.

## Limitaciones y advertencias

- Solo funciona en local el modo de página única. El modo de documento largo con estado estructural entre páginas está definido por el modelo original, pero el motor local de esta build todavía no lo implementa.
- Las figuras y los gráficos devuelven una ubicación, no contenido: el modelo emite cajas de maquetación para las ilustraciones y, al no haber un almacén de imágenes local, esos bloques se omiten. El texto no se ve afectado.
- Los niveles de encabezado y los marcadores de continuación entre páginas pertenecen al modo de documento largo y no aparecen en la salida de página única.
- La evidencia de calidad presentada por el autor se apoya en páginas sueltas (una página para la palabra confundible y una para la notación matemática); no debe extrapolarse a un perfil de capacidades.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otras lenguas.
- Sesgos conocidos: no disponibles. El autor no publica análisis de sesgos.
- Riesgo de alucinación: no se documenta de forma específica para este modelo; al tratarse de un sistema de OCR y análisis de documentos, la salida debe validarse cuando se use para extraer cifras o cláusulas contractuales.
- Este repositorio es una redistribución cuantizada, no un modelo nuevo: la capacidad pertenece al proyecto upstream y cualquier incidencia de calidad debe contrastarse con el modelo original.
- Licencia Apache-2.0 tanto en esta build como en el upstream, por lo que el uso comercial está permitido; conviene revisar igualmente los términos de la aplicación de escritorio y de la CLI de 42model, que son herramientas de terceros distintas de los pesos.
- Repositorio con 0 descargas y 0 likes en el momento de redactar la ficha: no hay validación por parte de la comunidad ni informes independientes de errores.
- La fecha de creación indicada (22 de septiembre de 2026) y el identificador arXiv de las etiquetas (arXiv:2603.09677) proceden de los metadatos del repositorio y no se han podido verificar con fuentes externas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/42ailab/Logics-Parsing-V3-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Logics-MLLM/Logics-Parsing-V3
- Repositorio GitHub del proyecto original (Alibaba Logics): https://github.com/alibaba/Logics-Parsing
- Referencia arXiv incluida en las etiquetas del repositorio: arXiv:2603.09677
- ModelScope del autor de la build: https://modelscope.cn/models/42ailab/Logics-Parsing-V3-GGUF
- Sitio de la herramienta de escritorio y CLI: https://42model.com
- Sitio del autor de la build: https://42ailab.com

Nota sobre la búsqueda web: los resultados recuperados en la búsqueda no guardan relación con el modelo (corresponden a páginas de herramientas de gestión de marketing de Meta) y no aportan información utilizable, por lo que no se han incluido.
