# ahmedsamirtarjama/arabic-dots-mocr-r3

## Resumen

arabic-dots-mocr-r3 es un ajuste fino de investigación del modelo multimodal dots.mocr (rednote-hilab/dots.mocr), publicado por el usuario ahmedsamirtarjama, orientado al parseo de documentos en árabe. Se trata de un modelo image-text-to-text de aproximadamente 3.039 millones de parámetros (unos 3,04 B) que recibe una imagen de página y devuelve, según la tarea solicitada, un JSON de layout (caja, categoría y texto de cada elemento, con las tablas en HTML) o un JSON de campos clave (importe, nombres, identificadores y fechas, entre otros). El objetivo declarado es el tratamiento de formularios financieros y legales saudíes —pagarés (سند لأمر), cheques y comprobantes de recibo—, además de tablas, libros, fotos de recibos y manuscrito.

La relevancia de esta revisión (ronda 3 de un proyecto en curso) está en la corrección de un fallo concreto de la ronda 2: el modelo entraba en bucle de generación en numerosos formularios, escribiendo secuencias como «ول» o «———» hasta agotar el límite de tokens. El origen era un conjunto de tokens árabes que el modelo base nunca emite (por ejemplo «حامل», «الأهلي», «مائة» o «إقامة»), cuya probabilidad se alteró al entrenar con LoRA manteniendo congelada la cabeza de salida. La ronda 3 reescribe los 71 tokens más problemáticos en los objetivos de entrenamiento usando sub-tokens que el modelo ya emplea, sin cambiar el texto, y añade 1.443 páginas de libros árabes verificadas a mano. El resultado reportado es de 0 páginas en bucle (frente a 47 en la ronda 2) en los conjuntos sintéticos de pagarés y cheques, y una mejora del CER en escaneos legales egipcios de 22,0 a 3,6.

Se trata explícitamente de un checkpoint de investigación, no de un sistema de producción, y así lo advierte su autor. No se han publicado resultados de benchmarks de terceros ni métricas de contexto o de licencia en los metadatos de HuggingFace; las cifras disponibles proceden exclusivamente de la evaluación interna descrita en la model card. El repositorio ocupa 6,1 GB y contiene pesos en safetensors con código de modelado personalizado (etiqueta custom_code).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal image-text-to-text (visión + lenguaje) con código personalizado (custom_code). La arquitectura interna concreta (tipo de transformer, encoder visual, etc.) no se detalla en la información disponible |
| Parámetros totales | 3.039.179.264 (≈3,04 B), dato de los pesos safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantización | No se publican pesos cuantizados. El repositorio solo contiene safetensors en precisión completa; el script de inferencia oficial usa vLLM |
| Idiomas soportados | Árabe (ar) e inglés (en); incluye documentos bilingües árabe-latín |
| Licencia | No declarada en los metadatos de HuggingFace. La model card indica que hereda la licencia del modelo base (dots.mocr LICENSE AGREEMENT), cuyo texto no se reproduce en la información disponible |
| Formato de pesos | safetensors |
| Resolución de imagen de entrada | Resolución nativa, entre 3.136 y 11.289.600 píxeles |
| Tamaño del repositorio | 6,1 GB |
| Modelo base | rednote-hilab/dots.mocr (también referenciado como dots-studio/dots.mocr) |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación / actualización | 2026-10-15 / 2026-10-15 |

## Arquitectura y entrenamiento

El modelo parte de dots.mocr y se ajusta mediante LoRA aplicado tanto al modelo de lenguaje como al codificador visual, con posterior fusión de los adaptadores en los pesos finales. El entrenamiento consistió en una única época sobre aproximadamente 83.600 ejemplos, con tamaño de lote 16, ejecutado sobre 2 GPU H200. Cada ejemplo se entrena con cuatro formulaciones de tarea: JSON de layout, OCR plano, campos clave y pregunta personalizada con salida JSON. No se emplearon documentos personales reales para el entrenamiento, según declara el autor.

Los datos de entrenamiento combinan varias fuentes: formularios saudíes sintéticos generados por el propio autor a partir de 6 plantillas (pagarés clásicos, e-note bancario, bilingüe y de financiera, cheques y comprobantes), con dígitos manuscritos reales (MADBase), tipografías manuscritas, sellos, marcas de agua y degradaciones de escaneo y fax, y con cada texto visible etiquetado; aproximadamente 6.000 páginas con aumento de foto de cámara (perspectiva, iluminación, sombras y desenfoque sobre escritorios y tejidos); libros y páginas árabes (img2md, shamela y páginas renderizadas con tablas, incluidas 1.443 páginas verificadas a mano nuevas en esta ronda); manuscrito y texto en escena (KHATT, Muharaf, OnlineKHATT, khattat, manuscritos árabes de Omar al-Saleh y AraMs, EvArEST y nombres sintéticos); facturas (KhalfounMehdi/arabic-latin-invoices-synthetic); y documentos oficiales egipcios (mohamedwasef/egyptian-official-documents-ocr, split de train). Alrededor de un tercio del volumen corresponde a los formularios saudíes sintéticos.

La innovación técnica destacable de esta ronda no es arquitectónica sino de tokenización del objetivo: los 71 tokens árabes que el modelo base no generaba se representan en las etiquetas de entrenamiento mediante sub-tokens ya presentes en su vocabulario efectivo, sin modificar el texto subyacente. Esto evita tener que descongelar la cabeza de salida y corrige la distribución de siguiente token que la ronda 2 había roto. Además, el modelo base aporta decodificación con temperatura 0,1 y top_p 1,0, con penalización de repetición 1,0 para layout y OCR (tal como se evaluó) y 1,05 para campos clave y consultas personalizadas.

## Capacidades

- OCR de texto impreso en árabe e inglés, incluyendo documentos bilingües árabe-latín.
- Salida de layout JSON: para cada elemento de la página devuelve caja (bounding box), categoría y texto.
- Reconstrucción de tablas en HTML dentro del JSON de layout.
- Extracción de campos clave: devuelve un único objeto JSON con los valores principales de la página (importe, nombres, identificadores, fechas), omitiendo los campos ausentes.
- Extracción guiada por pregunta: acepta una instrucción del tipo «Return JSON with: signer_name, signer_id, amount_digits, amount_words, due_date» y devuelve el JSON correspondiente.
- Procesamiento de manuscrito: entrenado con KHATT, Muharaf, OnlineKHATT, khattat, manuscritos árabes y nombres sintéticos; los errores de caracteres persisten en manuscrito difícil y sellos.
- Manejo de documentos degradados: sellos, marcas de agua, degradación de escaneo y fax, y fotos de cámara con perspectiva, sombras y desenfoque.
- Lectura de libros y páginas con tablas, facturas y documentos oficiales egipcios.
- Naturaleza conversacional e image-text-to-text, con soporte de múltiples tareas por página (layout, fields, ocr) en una misma invocación.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo de razonamiento explícito (thinking mode), audio o vídeo: no disponibles.

## Casos de uso

- Extracción de campos en pagarés saudíes (سند لأمر): el modelo recibe el escaneo o la foto del pagaré y devuelve un JSON con nombre del firmante, identificador, importe en dígitos, importe en palabras y fecha de vencimiento. Es adecuado porque fue entrenado específicamente con 6 plantillas de estos documentos, incluidos el modelo clásico, el e-note bancario, el bilingüe y el de financiera, y porque permite cruzar el importe en dígitos con el importe en palabras para detectar discrepancias.
- Digitalización de cheques y comprobantes de caja para conciliación contable: cada página se convierte en texto legible más un JSON de campos, lo que permite alimentar sistemas de tesorería sin transcripción manual. El modelo se evaluó con cheques y vouchers sintéticos, con 92,9 de precisión en campos críticos y 99,8 de box F1 en esos conjuntos.
- Indexación y búsqueda full-text sobre expedientes legales escaneados: en escaneos legales egipcios alcanza CER 3,6 y un recall de palabras de 96,4, lo que hace viable convertir un archivo histórico en un corpus consultable manteniendo la correspondencia entre texto y posición en la página.
- Extracción de tablas árabes para pipelines RAG: el modelo devuelve las tablas como HTML, lo que preserva la estructura de filas y columnas para su troceado e indexado posterior; obtiene TEDS 89,7 en KITAB-Bench tables y 65,5 en PulseBench-Tab.
- Digitalización de fondos bibliográficos árabes: entrenado con páginas de shamela e img2md y con 1.443 páginas de libro verificadas a mano, produce markdown estructurado con cuadros de página, útil para proyectos de biblioteca digital y humanidades digitales.
- Aplicaciones móviles de gestión de gastos y recibos: sobre 100 fotos reales de recibos (AraReceipt) localiza el 86,7 % de las líneas de texto y no degrada ninguna página a una imagen vacía, lo que permite capturar el recibo con el teléfono y extraer los campos relevantes.
- Triaje de formularios KYC o de contratación: mediante la opción --ask se puede pedir un conjunto de campos concreto por tipo de documento y obtener un JSON listo para validación, con penalización de repetición ajustable (1,05 o 1,10) si una página no tabular provoca bucles.
- Pre-anotación en proyectos de etiquetado: al ser un checkpoint de investigación con licencia heredada, encaja como generador de propuestas que un revisor humano corrige, no como extractor final sin supervisión.

## Benchmarks y rendimiento

Los datos proceden de la evaluación interna de la model card. En CER (character error rate) menos es mejor; en el resto, más es mejor. Todas las filas usan decodificación plana.

| Test | dots.mocr zero-shot | Ronda 1 | Ronda 2 | Ronda 3 (este modelo) |
|---|---|---|---|---|
| Escaneos legales egipcios (30), CER | 6,1 | 5,05 | 22,0 | 3,6 |
| Escaneos legales egipcios, recall de palabras | 84,1 | 89,0 | 91,9 | 96,4 |
| Fotos de recibos (AraReceipt, 100 reales), líneas de texto encontradas | 87,7 | 75,5 | 86,1 | 86,7 |
| Fotos de recibos: páginas devueltas como «Picture» vacía | 0 | 8 | 0 | 0 |
| Tablas árabes (PulseBench-Tab, 146), TEDS | 65,9 | 66,7 | 64,6 | 65,5 |
| KITAB-Bench OCR, CER medio sobre 13 conjuntos | — | 0,132 | 0,146 | 0,143 |
| KITAB-Bench tables, TEDS | — | 92,1 | 90,8 | 89,7 |
| Páginas de libro árabes (dev set propio), CER | — | 0,255 | 0,325 | 0,285 |
| Pagarés y cheques sintéticos (6 plantillas): páginas en bucle hasta el límite de tokens | — | 23 | 47 | 0 |
| Pagarés y cheques sintéticos: campos críticos | — | 83,1 | 87,1 | 92,9 |
| Pagarés y cheques sintéticos: box F1 | — | 75,1 | 82,8 | 99,8 |

El propio autor advierte que los formularios sintéticos provienen del mismo generador que los datos de entrenamiento, por lo que sus puntuaciones son optimistas y sirven sobre todo para comprobar que los bucles han desaparecido; los conjuntos reales y externos son la referencia más fiable. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- Pesos en precisión completa (bf16/fp16): aproximadamente 6,1 GB solo de pesos, que coinciden con el tamaño del repositorio. La VRAM real de inferencia es superior porque el modelo procesa imágenes a resolución nativa (de 3.136 a 11.289.600 píxeles), lo que incrementa el número de tokens visuales y el consumo de memoria de activaciones.
- Estimación orientativa de VRAM: en torno a 8-12 GB en bf16 para una única página; aproximadamente 3-4 GB si se sirviera en int8 y 2-3 GB en int4 (no hay pesos cuantizados publicados, por lo que estas cifras exigen cuantizar por cuenta propia).
- GPU de entrenamiento declaradas: 2× H200, con lote 16 y una época sobre unos 83.600 ejemplos.
- GPU recomendadas para servicio: H100, H200, A100 40/80 GB o L40S si se necesita atender varias peticiones concurrentes con páginas de alta resolución.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, previsiblemente con una sola página por lote. En tarjetas de 16 GB el margen es ajustado y probablemente requiera cuantización; en 12 GB solo con cuantización agresiva y resoluciones reducidas.
- Opciones de despliegue: el script oficial infer.py (pip install vllm pymupdf pillow) está construido sobre vLLM, que es la vía documentada. Al tratarse de un modelo con custom_code, la carga en transformers requiere trust_remote_code. No se publican pesos GGUF, por lo que llama.cpp y Ollama no están soportados por la información disponible; TGI no aparece mencionado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los comparables directos documentados son el propio modelo base y las rondas anteriores del mismo proyecto. No hay datos en la información disponible sobre otros modelos de OCR árabe de tamaño similar.

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arabic-dots-mocr-r3 (este modelo) | ≈3,04 B | no disponible | CER 3,6 en escaneos legales egipcios; 0 páginas en bucle; box F1 99,8 en formularios sintéticos | Heredada del modelo base, sin texto detallado | Pesos safetensors en HuggingFace |
| arabic-dots-mocr-r2 | no disponible (mismo base) | no disponible | CER 22,0 en escaneos legales egipcios; 47 páginas en bucle | Heredada del modelo base | Pesos publicados por el mismo autor |
| arabic-dots-mocr-r1 | no disponible (mismo base) | no disponible | Mejor CER en KITAB-Bench OCR (0,132) y en páginas de libro (0,255); 23 páginas en bucle | Heredada del modelo base | Pesos publicados por el mismo autor |
| dots.mocr (modelo base, zero-shot) | no disponible | no disponible | CER 6,1 en escaneos legales egipcios; 0 páginas vacías en recibos | dots.mocr LICENSE AGREEMENT | https://huggingface.co/rednote-hilab/dots.mocr |

Conviene señalar que la ronda 3 gana en formularios y en escaneos legales egipcios, pero queda ligeramente por debajo de la ronda 1 en KITAB-Bench OCR (0,143 frente a 0,132), en KITAB-Bench tables (89,7 frente a 92,1) y en páginas de libro del conjunto de desarrollo propio (0,285 frente a 0,255). La elección entre rondas depende, por tanto, del tipo de documento objetivo.

## Limitaciones y advertencias

- Es un checkpoint de investigación (ronda 3 de un proyecto en curso) y el autor indica explícitamente que no es un sistema de producción.
- Recortes de texto corto: alrededor del 2 % de las páginas de un conjunto de recortes pequeños (Nayana) siguen entrando en bucle, y su CER es ligeramente peor que en la ronda 2 (0,154 frente a 0,131).
- Riesgo de bucle de generación fuera de los formularios: la propia model card recomienda penalización de repetición 1,05 para campos y consultas personalizadas y subirla a 1,10 si una página no tabular (por ejemplo, textos legales) sigue iterando.
- Errores de caracteres en manuscrito difícil y en sellos: el autor recomienda comprobar siempre nombres, identificadores e importes. Como mitigación, el importe en dígitos y el importe en palabras pueden cruzarse entre sí.
- Rendimiento por debajo de la ronda 1 en libros y en KITAB-Bench, con lo que un mismo pipeline puede necesitar modelos distintos según el dominio.
- Optimismo de las métricas sintéticas: los formularios de evaluación provienen del mismo generador que los datos de entrenamiento, de modo que los valores de campos críticos (92,9) y box F1 (99,8) no deben extrapolarse a documentos reales.
- Idiomas limitados a árabe e inglés; no hay soporte declarado para otras lenguas.
- Longitud de contexto no documentada: no se puede garantizar el tratamiento de documentos de muchas páginas en una sola pasada sin particionado previo.
- Licencia sin texto disponible en la información consultada: al heredar la del modelo base (dots.mocr LICENSE AGREEMENT), es imprescindible revisar ese acuerdo antes de cualquier uso comercial.
- No se han utilizado documentos personales reales en el entrenamiento, según declara el autor, pero el modelo procesa documentos que pueden contener datos personales en inferencia, lo que obliga a aplicar las medidas de protección de datos correspondientes.
- Solo se publican pesos safetensors; no hay versiones cuantizadas ni formato GGUF, lo que limita el despliegue en entornos de bajos recursos.
- Sin descargas ni valoraciones registradas en HuggingFace en el momento de la consulta, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-dots-mocr-r3
- Versión anterior (ronda 2): https://huggingface.co/ahmedsamirtarjama/arabic-dots-mocr-r2
- Modelo base dots.mocr: https://huggingface.co/rednote-hilab/dots.mocr
- Conjunto de facturas árabe-latín citado en el entrenamiento (KhalfounMehdi/arabic-latin-invoices-synthetic) y documentos oficiales egipcios (mohamedwasef/egyptian-official-documents-ocr): referenciados por nombre en la model card.
- La búsqueda web realizada no ha devuelto enlaces relevantes para este modelo; los resultados obtenidos corresponden a herramientas no relacionadas con OCR ni con modelos de lenguaje.
