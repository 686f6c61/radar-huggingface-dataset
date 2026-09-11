# mradermacher/OvisOCR2-GGUF

## Resumen

OvisOCR2-GGUF es la versión cuantizada en formato GGUF del modelo multimodal ianua/OvisOCR2, publicada por el usuario mradermacher, especializado en la conversión de pesos a GGUF para inferencia local. El modelo original es un sistema de OCR y parsing de documentos que trabaja sobre imágenes de páginas y produce salida estructurada en Markdown, incluyendo tablas y fórmulas. Los tags del repositorio (`ocr`, `document-parsing`, `multimodal`, `markdown`, `tables`, `formulas`, `vllm`) describen con precisión su dominio de aplicación.

El modelo base cuenta con 752.393.024 parámetros (aproximadamente 0,75 mil millones), según los pesos en safetensors. Se trata, por tanto, de un modelo pequeno en comparación con los VLM de propósito general, lo que lo hace apto para despliegue en hardware modesto: la cuantización en f16 ocupa 1,6 GB y la Q4_K_M apenas 0,6 GB. El repositorio completo suma 7,8 GB porque incluye todas las variantes de cuantización.

La relevancia de esta publicación es práctica: permite ejecutar un pipeline de digitalización de documentos con modelos multimodales en GPU de consumo o incluso en CPU, sin depender de APIs externas. El repositorio se publicó el 11 de septiembre de 2026, no registra descargas ni likes en el momento de la consulta, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags del repositorio incluyen `qwen3_5` y `multimodal`, lo que apunta a un backbone de texto tipo Qwen3.5 con proyector visual, pero la model card no lo confirma |
| Parametros totales | 752.393.024 (datos reales de safetensors del modelo base) |
| Parametros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 para el componente multimodal |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base ianua/OvisOCR2 se distribuye en safetensors) |
| Tamano del repositorio | 7,8 GB (conjunto completo de cuantizaciones) |
| Libreria declarada | transformers |
| Fecha de publicacion | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Los metadatos del repositorio indican que se trata de un modelo multimodal con entrada de imagen y salida de texto, y la presencia de ficheros `mmproj` (proyector multimodal separado) confirma que el pipeline consta de un codificador visual más un proyector y un modelo de lenguaje. El tag `qwen3_5` sugiere que el componente de lenguaje deriva de la familia Qwen3.5, pero se trata de una inferencia a partir de etiquetas, no de un dato confirmado por el autor.

Tampoco se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste por instrucciones, RLHF o DPO. Lo único verificable es que el autor de la cuantización declara `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversión desde pesos HuggingFace con tensores cuantizados. No se han generado cuantizaciones ponderadas (imatrix/weighted) para este modelo.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos con salida en Markdown estructurado.
- Extracción y reconstrucción de tablas.
- Reconocimiento de fórmulas matemáticas presentes en el documento.
- Procesamiento multimodal: la entrada combina imagen y texto, gestionado mediante el proyector `mmproj`.
- Formato conversacional (`conversational`), lo que permite diálogo multi-turno sobre el contenido de un documento.
- Compatibilidad declarada con vLLM en los tags del repositorio, además de `transformers`.
- Soporte multilingüe: no disponible; el campo `language` del repositorio declara únicamente inglés.

No hay información disponible sobre soporte de tool calling, function calling, uso como agente, modo de razonamiento explícito, audio o vídeo.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo convierte imágenes de páginas escaneadas en Markdown estructurado, lo que permite indexar el contenido en buscadores internos o en sistemas RAG sin trabajo manual de transcripción.
- Extracción de tablas financieras: facturas, balances y estados de cuentas escaneados pueden transformarse en tablas Markdown que después se parsean a CSV o DataFrame, gracias a la capacidad específica de reconstrucción tabular.
- Conversión de documentación científica a texto reutilizable: el reconocimiento de fórmulas permite recuperar artículos escaneados conservando las expresiones matemáticas, algo que un OCR genérico pierde.
- Procesamiento en local con requisitos de privacidad: al pesar menos de 1 GB en Q4_K_M, el modelo puede ejecutarse íntegramente en una estación de trabajo sin enviar documentos confidenciales a servicios externos, requisito habitual en banca, sanidad o asesoría legal.
- Ingesta documental en pipelines RAG: el Markdown resultante se fragmenta y se vectoriza para alimentar un sistema de preguntas y respuestas sobre normativa, contratos o manuales técnicos.
- Digitalización de fondos históricos o archivísticos en lotes: el bajo coste de inferencia por página permite procesar volúmenes grandes de documentos en una sola GPU de consumo o en CPU con llama.cpp.
- Preprocesado en herramientas ofimáticas: integración como paso previo a la edición de documentos escaneados, generando texto editable a partir de fotografías tomadas con móvil.
- Servicio interno de OCR vía API: desplegado con vLLM, el modelo puede exponerse como endpoint compatible con la API de OpenAI para que otras aplicaciones del equipo lo consuman.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de precisión (por ejemplo, sobre OmniDocBench o similares) ni comparaciones con el modelo base en precisión de OCR o de estructuración de tablas.

## Requisitos de hardware

- VRAM estimada para los pesos, según cuantización:
  - f16: 1,6 GB.
  - Q8_0: 0,9 GB.
  - Q6_K: 0,7 GB.
  - Q5_K_M / Q5_K_S: 0,7 GB.
  - Q4_K_M / Q4_K_S / IQ4_XS: 0,6 GB.
  - Q3_K_L / Q3_K_M: 0,6 GB; Q3_K_S: 0,5 GB.
  - Q2_K: 0,5 GB.
  - Sumar entre 0,2 GB (mmproj-Q8_0) y 0,3 GB (mmproj-f16) para el proyector multimodal.
- En la práctica, cualquier GPU con 4 GB de VRAM o más puede alojar el modelo en Q4_K_M con margen para la caché KV; una RTX 3060, RTX 4060, RTX 4090 o superior es más que suficiente.
- También cabe en CPU: al tratarse de menos de 1.000 millones de parámetros, llama.cpp puede ejecutarlo en memoria del sistema y obtener velocidades utilizables en procesadores modernos con AVX2.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son la vía natural para los ficheros GGUF; los tags del repositorio declaran además compatibilidad con vLLM para el modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.
- Nota sobre la licencia Apache 2.0: permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de licencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| mradermacher/OvisOCR2-GGUF | 752.393.024 (modelo base) | No disponible | GGUF (12 cuantizaciones + 2 mmproj) | Apache 2.0 | No disponible |
| ianua/OvisOCR2 (modelo base) | 752.393.024 | No disponible | safetensors | Apache 2.0 | No disponible |

No se dispone, en la información proporcionada, de datos verificables sobre otros modelos comparables de OCR y parsing de documentos (parámetros, contexto, licencia o resultados de benchmarks), por lo que no se incluye una comparación con alternativas. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo.

## Limitaciones y advertencias

- Idioma: el repositorio declara únicamente inglés. El comportamiento con documentos en castellano u otras lenguas no está documentado, por lo que la calidad en esos idiomas es desconocida.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad sobre documentos reales. En tareas de OCR y parsing, los errores de omisión o de invención de contenido en tablas y fórmulas son especialmente costosos, por lo que se recomienda validación humana en flujos críticos.
- Longitud de contexto desconocida: no se especifica la ventana máxima soportada, lo que dificulta planificar el procesamiento de documentos de muchas páginas y obliga a probar empíricamente el límite.
- Cuantizaciones de baja precisión: la model card advierte explícitamente que Q3_K_M es de calidad inferior. En un modelo de menos de 1.000 millones de parámetros, los efectos de la cuantización sobre tareas de reconocimiento fino (fórmulas, tablas densas) pueden ser más acusados que en modelos grandes; se recomienda Q4_K_M o superior para producción.
- Ausencia de cuantizaciones ponderadas: el autor indica que no hay cuantizaciones imatrix/weighted disponibles y no garantiza su publicación.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y un riesgo mayor de fallos no documentados.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar la precisión frente al modelo base en formato safetensors.
- Procedencia: se trata de una cuantización de terceros, no de una publicación del equipo que desarrolló el modelo original; la responsabilidad sobre la fidelidad de los pesos convertidos recae en el cuantizador.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base ianua/OvisOCR2 de forma independiente antes de integrarlo en un producto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/OvisOCR2-GGUF
- Modelo base: https://huggingface.co/ianua/OvisOCR2
- Página de resumen y listado de descargas del cuantizador: https://hf.tst.eu/model#OvisOCR2-GGUF
- README de referencia sobre uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de la cuantización: https://www.nethype.de/
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
