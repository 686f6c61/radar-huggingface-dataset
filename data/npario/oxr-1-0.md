# npario/OXR-1.0

## Resumen

OXR (Optical Everything Recognition) es un modelo de código abierto para parsing de documentos desarrollado por el equipo SoMark. Convierte PDFs e imágenes de documentos en datos "agent-friendly" en formato Markdown o JSON, incluyendo coordenadas de layout (bounding boxes) para cada elemento reconocido. El repositorio analizado aquí, `npario/OXR-1.0`, es una copia del modelo oficial `SoMarkAI/OXR-1.0`; la model card incluida es la del autor original.

El modelo se presenta como preentrenado desde cero y con un bucle de auto-mejora recursiva (RSI) durante el post-entrenamiento, que el autor describe como el primero aplicado a parsing documental. Con aproximadamente 1,3-1,5 mil millones de parámetros, el autor afirma que alcanza el primer puesto en olmOCR-Bench, OmniDocBench y DocParsingBench, con especial ventaja en tablas, y el mejor rendimiento de velocidad entre modelos abiertos de parsing en una RTX PRO 6000.

Su rasgo diferencial es que el módulo de análisis de layout es independiente y conectable: puede sustituirse por un modelo de layout propio conservando las capacidades de reconocimiento de contenido y de orden de lectura de OXR. Reconoce 13 tipos de elemento, incluidas fórmulas LaTeX, tablas HTML/Markdown, ecuaciones y estructuras químicas, bloques de código y sellos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; modelo de parsing documental (visión + lenguaje) con módulo de análisis de layout independiente y conectable; requiere `custom_code` |
| Parámetros totales | 1.534.378.216 (≈1,53 B, según safetensors); la model card indica "1.3B" |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors en precisión nativa; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponibles en la información proporcionada (los ejemplos de la model card incluyen documentos en inglés y escritura manuscrita en chino) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 3,2 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, tipo de encoder visual, tokenizador o configuración de atención). El autor indica que OXR está preentrenado desde cero y que durante el post-entrenamiento emplea un bucle de auto-mejora recursiva (RSI), presentado como la primera aplicación de esta técnica al parsing documental. A nivel de tarea, la arquitectura se rediseñó para mejorar la velocidad manteniendo la precisión: el análisis de layout se separa del reconocimiento de contenido, de modo que el modelo de layout integrado puede reemplazarse por uno propio y OXR sigue encargándose del reconocimiento y del orden de lectura.

El modelo cubre 13 tipos de elemento documental con sus coordenadas: Caption, Footnote, Formula (LaTeX), Text, Page-footer y Page-header (filtrados por defecto), Picture, Title, Table (HTML/Markdown), Stamp, Chemical Equation (LaTeX con sintaxis mhchem, prefijo `\ce`), Code Block (Markdown) y Chemical Structure (SMILES o imagen). No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si se usaron RLHF o DPO. El repositorio incluye la etiqueta `eval-results` y el autor remite a `docs/benchmark.md` para reproducir las evaluaciones.

## Capacidades

- Parsing de documentos a Markdown o JSON estructurado, con coordenadas de layout por elemento.
- Reconocimiento de 13 tipos de elemento, incluidas tablas (HTML/Markdown), fórmulas matemáticas (LaTeX), ecuaciones químicas (mhchem) y estructuras químicas (SMILES).
- Extracción de bloques de código con formato Markdown.
- Manejo de documentos y layouts difíciles: exámenes en A3, periódicos, texto vertical y escritura manuscrita (se muestran ejemplos de manuscrito chino).
- Análisis de layout independiente y conectable, sustituible por un modelo propio sin cambiar el reconocimiento ni el orden de lectura.
- Detección y filtrado configurable de cabeceras y pies de página.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, audio o modo "thinking"; el término "agent-friendly" se refiere al formato de salida de los datos, no a capacidades de agente del modelo.
- Capacidades multilingües: no documentadas formalmente; los ejemplos públicos son en inglés y chino.

## Casos de uso

- Ingesta de PDFs para RAG: OXR convierte contratos, informes y manuales en Markdown limpio con estructura y coordenadas, de modo que el pipeline de recuperación puede trocear por elemento (título, tabla, párrafo) en lugar de por caracteres y citar la posición exacta en la página.
- Extracción de tablas a HTML/Markdown: para análisis financiero o de inventarios, el modelo devuelve la tabla como HTML o Markdown con su bounding box, lo que permite validar visualmente el resultado y cargarlo en hojas de cálculo o bases de datos.
- Digitalización de literatura científica: las fórmulas se emiten en LaTeX y las ecuaciones químicas en sintaxis mhchem, lo que facilita su reutilización en editores científicos, motores de búsqueda académica o pipelines de revisión sistemática.
- Procesamiento de documentación educativa: los ejemplos de examen en A3 y de manuscritos sugieren su uso en corrección automática asistida, extracción de enunciados y digitalización de archivos escolares con layouts no estándar.
- Química y farmacia: la salida en SMILES (o imagen) de estructuras químicas permite enlazar patentes y fichas técnicas con bases de datos moleculares sin transcripción manual.
- Documentación técnica y código: la extracción de bloques de código como Markdown permite reconstruir tutoriales y referencias de API a partir de PDFs para alimentar portales de documentación o asistentes de código.
- Automatización de back-office con layout propio: al poder sustituir el módulo de layout por uno entrenado con las reglas del negocio (por ejemplo, agrupación específica de recibos o albaranes), se adapta el parsing a dominios verticales conservando el reconocimiento de contenido.
- Enriquecimiento de agentes con referencias espaciales: las coordenadas por elemento permiten que un agente devuelva citas verificables ("página 4, región superior derecha") y que un revisor humano contraste la extracción con el documento original.

## Benchmarks y rendimiento

La información proporcionada no incluye cifras numéricas de benchmarks, solo la afirmación cualitativa del autor de que OXR ocupa el primer puesto en olmOCR-Bench, OmniDocBench y DocParsingBench, con una ventaja amplia en parsing de tablas, y el primer puesto en velocidad entre modelos abiertos de parsing documental probados en una NVIDIA RTX PRO 6000.

| Benchmark | Resultado | Notas |
|---|---|---|
| olmOCR-Bench | Puesto n.º 1 según el autor; valor numérico no disponible | Resultados completos en `docs/benchmark.md` del repositorio |
| OmniDocBench | Puesto n.º 1 según el autor; valor numérico no disponible | Ibídem |
| DocParsingBench | Puesto n.º 1 según el autor; valor numérico no disponible | Ventaja descrita como amplia en tablas |
| Velocidad de parsing | Puesto n.º 1 entre modelos abiertos según el autor; métricas no disponibles | Medición en RTX PRO 6000 |

No se han publicado resultados numéricos de benchmarks en la información disponible; las cifras deben consultarse y reproducirse desde la documentación del repositorio antes de usarlas en una comparación.

## Requisitos de hardware

- VRAM estimada para pesos: ≈3,1 GB en bf16/fp16 (1,53 B × 2 bytes), ≈6,1 GB en fp32, ≈1,5 GB en int8 y ≈0,8 GB en int4. Hay que sumar activaciones, el encoder visual y el modelo de layout, por lo que conviene reservar al menos 6-8 GB en bf16 para imágenes de alta resolución.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti/4060 Ti, RTX 4070, RTX 4080, RTX 4090). Con 12-16 GB se puede trabajar con lotes mayores o imágenes de mayor resolución.
- GPU de datacenter recomendadas para producción: L40S, A100 40/80 GB, H100; el autor reporta sus medidas de velocidad en una RTX PRO 6000.
- Despliegue: al requerir `custom_code`, la vía documentada es `transformers` con `trust_remote_code=True`; no se confirma en la información disponible soporte de vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: no disponibles como cifra; el autor publica una comparativa de velocidad frente a otros modelos de parsing en `docs/benchmark.md`.
- Existe un servicio alojado (demo online y API gratuita) para probar el modelo sin infraestructura propia.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento público general y no han podido verificarse con la información proporcionada; consúltense sus model cards antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OXR-1.0 (SoMark) | ≈1,53 B | No disponible | Parsing documental con layout conectable, 13 tipos de elemento | No disponible | HuggingFace, ModelScope, demo y API |
| dots.ocr | ≈1,7 B | No disponible | Parsing documental basado en VLM | No verificada en esta ficha | HuggingFace |
| olmOCR (AllenAI) | ≈7 B | No disponible | OCR/parsing de PDF a texto con VLM | No verificada en esta ficha | HuggingFace |
| GOT-OCR2.0 | ≈0,58 B | No disponible | OCR y conversión de documentos | No verificada en esta ficha | HuggingFace |

Frente a las alternativas de mayor tamaño, la propuesta de OXR es competir en precisión con ~1,5 B de parámetros y menor coste de inferencia, añadiendo la sustitución del módulo de layout. La comparación cuantitativa de precisión y velocidad debe hacerse con los resultados de `docs/benchmark.md`.

## Limitaciones y advertencias

- Licencia no especificada en la información disponible: no se puede asumir uso comercial libre. Es un bloqueante para producción hasta confirmarlo con el autor.
- El repositorio analizado (`npario/OXR-1.0`) no es el oficial: tiene 0 descargas y 0 likes, y la model card apunta a `SoMarkAI/OXR-1.0`. Para uso real conviene descargar el repo oficial y verificar integridad y versión.
- Requiere `custom_code` y, por tanto, `trust_remote_code=True`, lo que implica ejecutar código del autor; audítese antes de desplegar en entornos sensibles.
- No hay paper disponible ("arXiv: Coming Soon"), por lo que no existe descripción revisada de la arquitectura, los datos de entrenamiento ni el procedimiento de evaluación.
- Los puestos n.º 1 en benchmarks son afirmaciones del autor sin cifras en la información proporcionada; no se han verificado de forma independiente.
- Riesgo de alucinación y de errores de transcripción en tablas densas, fórmulas largas, manuscritos y documentos escaneados de baja calidad; los benchmarks de parsing no garantizan exactitud carácter a carácter en dominios nuevos.
- Longitud de contexto y resolución máxima de imagen no documentadas: los documentos muy extensos o de gran formato (A3, periódicos) pueden requerir troceado y afectar a la coherencia del orden de lectura.
- Idiomas soportados no declarados: el rendimiento en castellano o en otras lenguas distintas del inglés y el chino no está verificado.
- El filtrado por defecto de cabeceras y pies de página puede eliminar información relevante en documentos donde esos elementos contienen datos (importes, numeración de contratos).
- Alucinación de coordenadas: las bounding boxes generadas deben validarse si se usan para recortes automáticos o para interfaces de revisión.
- No se documentan salvaguardas, filtros de contenido ni evaluaciones de sesgo; al ser un modelo de extracción, el riesgo principal es de fidelidad, no de generación libre.

## Enlaces

- Modelo en HuggingFace (copia analizada): https://huggingface.co/npario/OXR-1.0
- Modelo oficial en HuggingFace: https://huggingface.co/SoMarkAI/OXR-1.0
- Repositorio GitHub: https://github.com/SoMarkAI/OXR
- Resultados de benchmarks y reproducción: https://github.com/SoMarkAI/OXR/blob/main/docs/benchmark.md
- README en chino: https://github.com/SoMarkAI/OXR/blob/main/README_CN.md
- Demo online: https://free-oxr.somark.ai
- ModelScope: https://modelscope.cn/models/SoMark/OXR-1.0
- Paper: no disponible (anunciado como "arXiv: Coming Soon")
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; solo fuentes no relacionadas que se han descartado.
