# SoMarkAI/OXR-1.0

## Resumen

OXR-1.0 (Optical Everything Recognition) es un modelo de análisis y reconocimiento de documentos desarrollado por el equipo SoMark. Convierte PDFs e imágenes de documentos en datos "agent-friendly" en formato Markdown o JSON, incluyendo coordenadas de maquetación (bounding boxes) para cada elemento reconocido. El modelo se presenta como preentrenado desde cero y, según el autor, es el primero en aplicar un bucle de auto-mejora recursiva (RSI) durante el post-entrenamiento en el dominio del parsing de documentos.

El modelo declara 1,3B de parámetros en su model card, aunque el recuento real de pesos en safetensors es de 1.534.378.216 parámetros (1,53B). Con ese tamaño, el autor afirma que OXR-1.0 alcanza el primer puesto en olmOCR-Bench, OmniDocBench y DocParsingBench, con especial ventaja en el parsing de tablas, y que es el modelo de parsing de documentos open source más rápido en pruebas sobre RTX PRO 6000. El repositorio ocupa 3,2 GB y se publica únicamente en safetensors con código de modelado propio.

Su rasgo diferencial es arquitectónico a nivel de tarea: OXR separa el módulo de análisis de maquetación y lo hace independiente e intercambiable, de modo que el usuario puede sustituir el modelo de layout integrado por uno propio manteniendo las capacidades de reconocimiento de contenido y orden de lectura. Es relevante ahora porque los pipelines de RAG y de agentes necesitan documentos estructurados con trazabilidad posicional, y OXR ataca ese problema con un modelo pequeño que cabe en GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el autor no detalla la arquitectura interna; se describe como modelo preentrenado desde cero para parsing de documentos) |
| Parámetros totales | 1.534.378.216 (1,53B) según safetensors; la model card declara 1,3B |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors, sin variantes cuantizadas ni GGUF oficiales |
| Idiomas soportados | No disponible en los metadatos; la model card muestra ejemplos en inglés y chino (incluida escritura manual china y texto vertical) |
| Licencia | No disponible |
| Formato de pesos | Safetensors con código propio (tag `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El autor describe OXR como un modelo preentrenado desde cero ("pretrained from scratch") en lugar de un fine-tuning sobre un VLM existente. La innovación metodológica declarada es el uso de un bucle de auto-mejora recursiva (RSI, recursive self-improvement) durante la fase de post-entrenamiento, que el autor presenta como la primera aplicación de esta técnica al parsing de documentos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO.

A nivel de diseño, OXR reorganiza el pipeline a nivel de tarea: el análisis de maquetación (layout analysis) se extrae como módulo independiente y sustituible, mientras el modelo se encarga del reconocimiento de contenido y la determinación del orden de lectura. Esta separación cumple dos objetivos: acelerar el parsing y permitir adaptar el sistema a dominios concretos reemplazando solo el modelo de layout. El modelo reconoce 13 tipos de elemento documental: Caption, Footnote, Formula (LaTeX), Text, Page-footer y Page-header (filtrados por defecto), Picture, Title, Table (HTML/Markdown), Stamp, Chemical Equation (LaTeX con sintaxis mhchem), Code Block (Markdown) y Chemical Structure (SMILES o imagen), todos ellos con coordenadas de bounding box.

## Capacidades

- Parsing de documentos a Markdown o JSON estructurado, con coordenadas de maquetación por elemento.
- Reconocimiento de 13 tipos de elemento, incluidas fórmulas matemáticas en LaTeX, ecuaciones químicas en sintaxis mhchem, estructuras químicas en SMILES y bloques de código.
- Conversión de tablas a HTML o Markdown, con ventaja declarada frente a la competencia en este apartado.
- Manejo de documentos y maquetaciones difíciles según el autor: exámenes en A3, periódicos, texto vertical y escritura manual.
- Análisis de maquetación pluggable: permite sustituir el modelo de layout integrado por uno propio.
- Salida orientada a agentes ("agent-friendly data"), apta para consumo programático por parte de pipelines y agentes.
- Capacidades multilingües: no declaradas formalmente; hay evidencia de uso con inglés y chino en los ejemplos del autor.
- Tool calling / function calling: no disponible.
- Modo thinking, visión general fuera de documento, audio: no disponible.

## Casos de uso

- Ingesta de PDFs para RAG: OXR convierte documentos completos en Markdown estructurado conservando tablas, fórmulas y jerarquía de títulos, lo que permite trocear por elementos semánticos en lugar de por caracteres y mejorar la calidad de la recuperación.
- Trazabilidad y citas con coordenadas: al devolver bounding boxes por elemento, un pipeline de agentes puede citar la región exacta del documento original de la que procede cada dato, lo que facilita la verificación humana en flujos de compliance.
- Extracción de tablas financieras y administrativas: la conversión a HTML/Markdown permite reconstruir tablas de balances, facturas o informes anuales y cargarlas en bases de datos o hojas de cálculo sin post-procesado geométrico complejo.
- Procesamiento de literatura científica y patentes: el reconocimiento de fórmulas en LaTeX, ecuaciones químicas mhchem y estructuras en SMILES hace viable indexar artículos de química y matemáticas manteniendo la notación original.
- Digitalización de exámenes y documentación académica: el autor muestra resultados con exámenes en formato A3 y escritura manual, un escenario habitual en plataformas de corrección automática y archivo académico.
- Documentación técnica y código: la detección de bloques de código en Markdown permite extraer ejemplos de manuales y documentación de APIs para construir bases de conocimiento de desarrollo.
- Adaptación a dominios verticales: gracias al módulo de layout sustituible, un equipo puede integrar su propio detector de regiones (por ejemplo, para formularios médicos o partes de siniestros) y conservar el reconocimiento de contenido y el orden de lectura de OXR.
- Automatización de archivo y digestión documental: al ser un modelo de 1,5B, se puede desplegar en una GPU de consumo o en una instancia pequeña para procesar lotes de documentos internos sin depender de APIs externas.

## Benchmarks y rendimiento

La model card declara posiciones de liderazgo, pero no incluye cifras numéricas en la información proporcionada. Las cifras completas se remiten a `docs/benchmark.md` del repositorio de GitHub, no disponible en esta ficha.

| Benchmark | Resultado declarado | Cifra concreta |
|---|---|---|
| olmOCR-Bench | Puesto #1 según el autor | No disponible |
| OmniDocBench | Puesto #1 según el autor | No disponible |
| DocParsingBench | Puesto #1 según el autor; "amplia ventaja" en tablas | No disponible |
| Test de velocidad (RTX PRO 6000) | Puesto #1 entre modelos open source de parsing de documentos | No disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible; las afirmaciones anteriores son declaraciones del autor sin cifras verificables en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo para pesos; con overhead de activaciones y preprocesado de imágenes en alta resolución, es razonable prever 4-6 GB (estimación aritmética a partir del recuento de parámetros, no dato publicado).
- En fp32: aproximadamente 6,2 GB solo para pesos (estimación).
- Cuantización a int8/int4: no hay variantes publicadas; las estimaciones teóricas serían ~1,6 GB y ~0,8 GB respectivamente, pero requerirían cuantización por parte del usuario.
- GPU de consumo: sí cabe con holgura. Una RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o RTX 4090 pueden alojar el modelo; el propio autor reporta pruebas de velocidad en RTX PRO 6000.
- GPU de datacenter: A100, H100 o L40S no son necesarias por VRAM, pero permiten mayor paralelismo y throughput en procesamiento por lotes.
- Opciones de despliegue: al usar `custom_code`, la vía natural es Transformers con `trust_remote_code=True`. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible; la ausencia de GGUF impide un despliegue directo en llama.cpp/Ollama.
- Latencia y throughput: no disponibles como cifras; el autor afirma el primer puesto en velocidad entre modelos open source de parsing, sin publicar valores en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos competidores provienen de conocimiento general y deben verificarse en sus fichas oficiales; no se han contrastado con la información proporcionada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OXR-1.0 | 1,53B (safetensors); 1,3B según el autor | No disponible | #1 en olmOCR-Bench, OmniDocBench y DocParsingBench según el autor, sin cifras | No disponible | HuggingFace, ModelScope, demo online, API gratuita |
| dots.ocr | ~1,7B | No disponible | No verificado en esta ficha | Consultar ficha del autor | HuggingFace |
| PaddleOCR-VL | ~0,9B | No disponible | No verificado en esta ficha | Consultar ficha del autor | HuggingFace / ecosistema PaddleOCR |
| olmOCR (AllenAI) | ~7B | No disponible | Referenciado como baseline en olmOCR-Bench | Consultar ficha del autor | HuggingFace |

Frente a alternativas como olmOCR, la diferencia principal es el tamaño: OXR-1.0 es aproximadamente cuatro veces menor, lo que reduce requisitos de VRAM y coste por página. Frente a dots.ocr o PaddleOCR-VL, la propuesta diferencial es el módulo de layout intercambiable y la salida JSON con coordenadas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial. Es un bloqueante para producción y debe aclararse con el autor antes de integrar el modelo.
- Idiomas no declarados: los metadatos no indican cobertura lingüística. Los ejemplos del autor se centran en inglés y chino; el rendimiento en castellano u otras lenguas no está documentado.
- Longitud de contexto desconocida: no se puede planificar el procesamiento de documentos largos sin conocer la ventana real; en la práctica habrá que paginar y gestionar el orden de lectura entre páginas.
- Riesgo de alucinación en OCR: como todo modelo generativo aplicado a reconocimiento, puede producir texto plausible donde la imagen es ilegible o está degradada. No se han publicado métricas de confianza ni mecanismos de abstención.
- Benchmarks no verificables en esta ficha: las afirmaciones de primer puesto carecen de cifras en la información disponible y el paper en arXiv está anunciado pero no publicado, por lo que no existe revisión por pares.
- `custom_code` y `trust_remote_code`: la carga del modelo ejecuta código del repositorio. Es un riesgo de seguridad en entornos multiusuario y exige auditar el código antes de desplegarlo.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni variantes int8/int4, lo que limita el despliegue en CPU o en GPUs con poca memoria sin trabajo adicional de cuantización.
- Madurez y validación externa: 37 descargas y 20 likes en el momento de la ficha, con creación en octubre de 2026, indican una comunidad todavía pequeña y poca validación independiente.
- Posible inconsistencia de documentación: la model card indica 1,3B de parámetros mientras los pesos suman 1,53B; conviene contrastar qué cifra corresponde a parámetros totales y cuál a otra medida.
- Sin `pipeline` declarado en HuggingFace: la integración vía `transformers.pipeline` no está garantizada y puede requerir código específico del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoMarkAI/OXR-1.0
- Repositorio GitHub: https://github.com/SoMarkAI/OXR
- Documentación de benchmarks: https://github.com/SoMarkAI/OXR/blob/main/docs/benchmark.md
- README en chino: https://github.com/SoMarkAI/OXR/blob/main/README_CN.md
- Modelo en ModelScope: https://modelscope.cn/models/SoMark/OXR-1.0
- Demo online: https://free-oxr.somark.ai
- Paper en arXiv: anunciado como "coming soon", no disponible
