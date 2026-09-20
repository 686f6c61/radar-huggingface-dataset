# nomikos-project/syriac-htr-ppocr_rec

## Resumen

Syriac HTR (ppocr_rec) es un checkpoint de reconocimiento de texto manuscrito (HTR) especializado en manuscritos en escritura siríaca, publicado por el usuario u organización nomikos-project. Se distribuye con el identificador de registro interno `syriac-ppocr-v1`, etiqueta `stable`, y su tarea declarada es `transcribe`. La arquitectura indicada es `ppocr_rec`, es decir, el módulo de reconocimiento de texto de la familia PaddleOCR, y el repositorio incluye la etiqueta `onnx`, lo que apunta a un export a formato ONNX para inferencia.

El modelo resuelve un problema muy concreto: convertir imágenes de texto manuscrito siríaco en transcripciones legibles por máquina, un paso previo imprescindible para digitalizar, indexar y estudiar corpus de manuscritos. No es un modelo generativo de propósito general ni un modelo de lenguaje: es un reconocedor de líneas o regiones de texto, pensado para integrarse en un pipeline OCR completo junto con un detector de texto.

El repositorio es muy pequeño (0,1 GB) y no registra descargas ni interacciones, y la model card se limita a metadatos de registro y a instrucciones de resolución de pesos (`hf://nomikos-project/syriac-htr-ppocr_rec@stable`). No se publican detalles de entrenamiento, evaluación ni licencia, lo que limita seriamente su adopción en producción sin una validación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ppocr_rec` (módulo de reconocimiento de texto de la familia PaddleOCR); export a ONNX según la etiqueta `onnx` |
| Parametros totales | no disponible (el autor no los publica; el repositorio ocupa 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de reconocimiento imagen-texto, no procesa contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | siríaco (`syr`); no se declaran otros idiomas |
| Licencia | no disponible |
| Formato de pesos | ONNX (etiqueta `onnx`); no se documentan otros formatos como safetensors o GGUF |
| Tarea declarada | `transcribe` |
| Script / escritura | `syriac` |
| Identificador de registro | `syriac-ppocr-v1` (etiqueta `stable`) |
| Origen de pesos | `hf://nomikos-project/syriac-htr-ppocr_rec@stable` |
| Librería declarada | `ppocr_rec` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `ppocr_rec` y el campo `architecture: ppocr_rec` de la model card. Esto identifica el modelo como el componente de reconocimiento (rec head) del toolkit PaddleOCR, que habitualmente combina un extractor convolucional de características con una cabeza de secuencia y decodificación CTC para producir cadenas de caracteres a partir de recortes de texto. No se confirma en la información proporcionada si se trata de una variante CRNN, SVTR u otra, ni el número de parámetros, la resolución de entrada o el vocabulario de salida. La etiqueta `onnx` sugiere que el checkpoint se exportó a ONNX, presumiblemente para ejecutarse con ONNX Runtime en lugar de con el runtime nativo de Paddle.

No hay ningún dato sobre el corpus de entrenamiento: se desconoce el número de imágenes, los manuscritos de origen, el volumen de líneas anotadas, el reparto entre entrenamiento y validación, ni si se aplicaron técnicas de aumento de datos o ajuste fino. Tampoco se documenta ningún proceso de alineación, RLHF o DPO, algo por otra parte inhabitual en modelos de reconocimiento óptico de caracteres. La model card describe el artefacto como publicado desde el "Hub staging tree" de nomikos, lo que apunta a un volcado de un árbol de preparación interna más que a una release documentada con métricas de calidad. La búsqueda web realizada no ha devuelto ninguna fuente adicional sobre este modelo: los únicos resultados obtenidos tratan sobre servicios de identificación civil de Kuwait y no guardan relación con el modelo.

## Capacidades

- Reconocimiento de texto manuscrito en escritura siríaca a partir de imágenes de texto (presumiblemente líneas o regiones ya recortadas, dado el tipo de modelo `rec`).
- Transcripción de imagen a secuencia de caracteres, con salida en el script siríaco (`syr`).
- Ejecución mediante ONNX Runtime, según la etiqueta `onnx` del repositorio.
- Integración en pipelines de la librería `ppocr_rec`, es decir, como etapa de reconocimiento posterior a una etapa de detección de texto.
- Resolución de pesos mediante el registro interno del proyecto: `weights_source: hf://nomikos-project/syriac-htr-ppocr_rec@stable`.
- Prefetch del checkpoint a la caché del Hub sin ejecutar inferencia, mediante el script `scripts/hf/fetch_model.py syriac-ppocr-v1 --registry-tag stable` documentado por el autor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio, modo "thinking" ni generación de texto libre: son capacidades ajenas a un modelo de reconocimiento OCR.
- No se documenta capacidad multilingüe más allá del siríaco.

## Casos de uso

- Digitalización de fondos manuscritos siríacos en bibliotecas y archivos: el modelo se usaría como etapa de reconocimiento sobre recortes de línea obtenidos previamente con un detector de texto, generando transcripciones que alimenten el catálogo digital de la institución.
- Investigación filológica y edición crítica: transcripción asistida de testimonios manuscritos para construir aparatos críticos, con revisión humana posterior dado que no hay métricas publicadas de precisión.
- Indexación y búsqueda de texto completo en corpus digitalizados: una vez transcritas las páginas, el texto resultante permite búsquedas por términos, concordancias y análisis léxico sobre colecciones que antes solo eran imágenes.
- Construcción de pipelines HTR completos: el modelo actúa como cabeza de reconocimiento combinada con un detector de la misma familia PaddleOCR, de modo que el sistema completo va de la imagen de página a la transcripción por líneas.
- Preservación digital y catalogación: generación de capas de texto asociadas a las imágenes para facilitar el acceso a largo plazo y el cumplimiento de requisitos de accesibilidad documental.
- Plataformas de transcripción colaborativa: el modelo produce una transcripción automática de partida que voluntarios o investigadores corrigen, reduciendo el esfuerzo manual frente a la transcripción desde cero.
- Etapa previa a traducción o análisis lingüístico: las transcripciones siríacas pueden alimentar herramientas posteriores de normalización, lematización o traducción, siempre que se valide la calidad del reconocimiento en el dominio concreto.
- Procesamiento por lotes en servidor sin GPU dedicada: por el tamaño reducido del repositorio (0,1 GB) y el formato ONNX, es plausible desplegarlo en CPU para digitalizaciones masivas, aunque el autor no publica cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (ni CER, ni WER, ni exactitud por carácter o palabra), y la búsqueda web no ha devuelto ninguna evaluación independiente ni fuente secundaria sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos; el tamaño del repositorio (0,1 GB) sugiere que el checkpoint es pequeño y que la inferencia en FP32 o FP16 cabría holgadamente en menos de 1 GB de memoria, pero se trata de una inferencia a partir del tamaño del artefacto, no de un dato confirmado.
- GPU recomendadas: no disponible. Por el tipo de modelo, cualquier GPU con al menos unos pocos GB de memoria sería suficiente en la práctica, pero no hay especificación oficial.
- ¿Cabe en GPU de consumo?: muy probablemente sí, en cualquier GPU de consumo moderna, e incluso en CPU, dado el tamaño del repositorio. No confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (coherente con la etiqueta `onnx`); la librería declarada `ppocr_rec` y el ecosistema PaddleOCR/Paddle Inference son las vías naturales. vLLM, TGI o llama.cpp no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.
- Aviso: para un HTR real hace falta además un modelo de detección de texto y un recortador de líneas; el coste de cómputo del pipeline completo no se puede estimar con la información disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento de ningún modelo comparable, por lo que la comparación solo puede ser cualitativa. Se listan alternativas de la misma categoría (reconocimiento de texto manuscrito o módulo de reconocimiento de un pipeline OCR) con los campos que no se pueden verificar marcados como no disponibles.

| Modelo | Categoria | Idiomas / scripts | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| nomikos-project/syriac-htr-ppocr_rec | Reconocimiento OCR/HTR (`ppocr_rec`) | Siríaco (`syr`) | no disponible | HuggingFace, 0 descargas | no disponible |
| PaddleOCR PP-OCRv4 rec (familia de la que deriva la arquitectura) | Reconocimiento OCR genérico | Multilingüe, sin siríaco confirmado | no disponible en esta información | Ampliamente distribuido | no disponible |
| TrOCR (Microsoft) | Reconocimiento de texto manuscrito e impreso basado en transformer | Principalmente latino/inglés | no disponible en esta información | HuggingFace | no disponible |
| Modelos HTR de tipo Kraken / Transkribus | Reconocimiento de manuscritos históricos con modelos entrenables por proyecto | Depende del modelo entrenado; existen modelos para scripts históricos | no disponible en esta información | Repositorios y plataformas propias | no disponible |

No se dispone de cifras de parámetros, contexto, CER/WER ni licencia de las alternativas en la información consultada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no especificada: sin una licencia declarada no se puede determinar si el uso comercial está permitido, lo que bloquea su adopción en productos o servicios con ánimo de lucro sin aclaración previa del autor.
- Script único: el modelo solo declara siríaco (`syr`); no hay evidencia de que funcione con otras escrituras ni con siríaco impreso.
- Modelo de reconocimiento, no de página completa: al ser una cabeza `rec`, necesita un detector de texto y un recorte de líneas previos; no resuelve por sí solo la transcripción de un manuscrito entero.
- Sin métricas publicadas: no hay CER, WER ni evaluación en un conjunto de test, por lo que la calidad real es desconocida y debe medirse en el dominio objetivo antes de cualquier uso serio.
- Riesgo de alucinación y de sustituciones: como todo OCR, puede generar caracteres plausibles pero incorrectos, especialmente en escritura manuscrita con variabilidad caligráfica alta, abreviaturas o deterioro del soporte. En un contexto filológico o histórico, un error no detectado puede propagarse a publicaciones.
- Sesgo de dominio desconocido: al no documentarse el corpus de entrenamiento, se ignora a qué manuscritos, épocas, escribas y estilos se ajustó el modelo; es probable que rinda peor fuera de esa distribución.
- Idiomas y vocabulario limitados: no se documenta el conjunto de caracteres soportado, ni el tratamiento de signos diacríticos, puntuación o fenómenos propios del siríaco.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones públicas; no hay evidencia externa de funcionamiento.
- Documentación mínima: la model card solo contiene metadatos de registro y comandos de resolución de pesos; no hay instrucciones de preprocesado, formato de entrada, vocabulario de salida ni ejemplos de uso.
- Artefacto de staging: el propio autor lo describe como publicado desde un "Hub staging tree", lo que sugiere un checkpoint de trabajo interno más que una release estable mantenida.
- Dependencia del ecosistema del autor: el uso documentado pasa por scripts y un registro propios (`fetch_model.py`, `weights_source`), lo que puede dificultar la integración en stacks ajenos.
- Para producción: exigiría verificación de licencia, evaluación con un conjunto de test propio y un umbral de confianza con revisión humana en el bucle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nomikos-project/syriac-htr-ppocr_rec
- No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo en la búsqueda web realizada.
- Los resultados de la búsqueda web obtenidos corresponden a servicios de la Public Authority for Civil Information (PACI) de Kuwait y no guardan ninguna relación con el modelo: https://services.paci.gov.kw/?lang=en&serviceType=2, https://services.paci.gov.kw/card/payment?lang=en, https://www.e.gov.kw/sites/kgoenglish/Pages/eServices/PACI/CivilIDRenewal.aspx, https://www.e.gov.kw/sites/kgoenglish/Pages/eServices/PACI/CivilIDValidity.aspx, https://paciservices.com/en/civil-id/
