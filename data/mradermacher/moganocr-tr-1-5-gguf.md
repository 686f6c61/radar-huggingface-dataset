# mradermacher/MoganOCR-TR-1.5-GGUF

## Resumen

MoganOCR-TR-1.5-GGUF es la versión cuantizada en formato GGUF del modelo MoganOCR-TR-1.5, desarrollado originalmente por Mogan AI y convertido a GGUF por mradermacher. Se trata de un modelo de visión-lenguaje (VLM) especializado en OCR y comprensión de documentos, capaz de transformar imágenes de documentos en representaciones estructuradas en Markdown. El modelo está afinado específicamente para turco e inglés, lo que lo convierte en una opción relevante para pipelines de digitalización documental en entornos turcoparlantes.

El modelo cuenta con 1.881.825.088 parámetros totales (aproximadamente 1,9 mil millones), lo que lo sitúa en la categoría de modelos compactos y desplegables en hardware de consumo. La versión GGUF incluye un proyector multimodal (mmproj) separado, necesario para procesar las imágenes de entrada. El entrenamiento incluyó GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo que sugiere un ajuste orientado a mejorar la calidad de las transcripciones generadas.

La relevancia de esta ficha radica en que permite ejecutar un sistema OCR especializado en turco de forma local, sin depender de APIs externas, gracias a las cuantizaciones que van desde 1,1 GB (Q2_K) hasta 3,9 GB (f16). La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM (vision-language model) basado en transformer, con proyector multimodal separado (mmproj) |
| Parámetros totales | 1.881.825.088 (≈1,9 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo de visión-lenguaje (VLM) con un proyector multimodal separado en los archivos GGUF (mmproj en f16 o Q8_0), lo que implica una arquitectura típica de dos componentes: un codificador visual que procesa la imagen del documento y un modelo de lenguaje que genera la salida en Markdown. El número exacto de capas, dimensión oculta y tipo de atención no se detalla en la información proporcionada.

El entrenamiento incluyó GRPO (Group Relative Policy Optimization), una variante de optimización por refuerzo que se aplica tras el ajuste supervisado para alinear las salidas con criterios de calidad. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y si hubo fases adicionales de DPO o RLHF no están disponibles. La especialización declarada es OCR y parsing de documentos hacia Markdown, con foco en turco e inglés.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con salida en formato Markdown estructurado.
- Comprensión de documentos (document understanding) y parsing de estructura (tablas, encabezados, listas) según los tags del modelo.
- Procesamiento multimodal: acepta imágenes como entrada junto con instrucciones textuales.
- Generación de Markdown como formato de salida nativo, adecuado para pipelines de conversión documental.
- Soporte bilingüe turco-inglés, con especial énfasis en turco.
- Modelo conversacional (tag `conversational`), lo que permite interacción por turnos.
- No se dispone de información sobre tool calling, function calling, capacidades de agente o modos de razonamiento extendido (thinking mode) en la información proporcionada.

## Casos de uso

- Digitalización de archivos administrativos turcos: el modelo convierte escaneos de documentos oficiales, formularios y expedientes en Markdown estructurado, facilitando su indexación y búsqueda en sistemas de gestión documental. Su especialización en turco lo hace adecuado para organismos públicos y empresas turcas.
- Extracción de tablas de facturas y albaranes: al generar Markdown, las tablas quedan delimitadas con sintaxis estándar, lo que simplifica el post-procesado y la carga en bases de datos o hojas de cálculo.
- Construcción de bases de conocimiento RAG: el Markdown generado a partir de PDFs e imágenes escaneadas puede fragmentarse y vectorizarse directamente, alimentando sistemas de recuperación aumentada para asistentes internos.
- Procesamiento local en el borde (edge): con cuantizaciones de 1,1 a 1,5 GB, el modelo puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, útil en entornos con requisitos de privacidad que impiden enviar documentos a la nube.
- Automatización de la digitalización de prensa histórica y archivos: la salida Markdown preserva la estructura del texto y facilita la revisión humana y la corrección posterior en herramientas de edición.
- Preprocesado para pipelines de traducción turco-inglés: al extraer texto limpio y estructurado de documentos escaneados en ambos idiomas, el modelo actúa como primera etapa de un flujo de traducción automática.
- Integración en flujos de accesibilidad: conversión de documentos escaneados a texto estructurado legible por lectores de pantalla y herramientas de síntesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): aproximadamente 1,1 GB con Q2_K, 1,3-1,4 GB con Q4_K_S/Q4_K_M, 2,1 GB con Q8_0 y 3,9 GB con f16.
- El proyector multimodal añade 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16) adicionales.
- VRAM total recomendada: entre 2 GB (Q4_K_M + mmproj-Q8_0) y 5 GB (f16 + mmproj-f16), incluyendo overhead de contexto y memoria de activaciones.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para trabajar con comodidad (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de gama de entrada con 4 GB si se usa Q4_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs dedicadas modernas e incluso en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints GGUF; el modelo base es compatible con transformers, pero la versión GGUF está pensada para llama.cpp y derivados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MoganOCR-TR-1.5-GGUF | ≈1,9 B | no disponible | tr, en | Apache 2.0 | GGUF | Especializado en OCR turco, cuantizaciones desde 1,1 GB |
| Modelos OCR/VLM genéricos de tamaño similar (p. ej. variantes compactas de Qwen2-VL o MiniCPM-V) | 2-3 B | variable según modelo | multilingüe | variable | safetensors, GGUF | No especializados en turco; datos concretos no disponibles en esta ficha |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa numérica rigurosa con alternativas concretas; los modelos citados se mencionan como referencia de categoría, no como comparación medida.

## Limitaciones y advertencias

- Idiomas limitados a turco e inglés: el rendimiento en otros idiomas (incluido el español) no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación en la transcripción: como todo VLM generativo, puede inventar texto ausente en la imagen, especialmente en documentos con ruido, baja resolución o caligrafía.
- No se han publicado métricas de precisión (CER/WER) ni benchmarks en la información disponible, por lo que la calidad real debe validarse con muestras propias antes de usarlo en producción.
- La longitud de contexto no está documentada; documentos muy extensos o imágenes de alta resolución podrían requerir fragmentación previa.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad del OCR; se recomienda Q4_K_M o superior para tareas de producción.
- El repositorio GGUF no incluye cuantizaciones ponderadas/imatrix según el autor, lo que puede afectar a la calidad relativa de las cuantizaciones pequeñas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original (moganai/MoganOCR-TR-1.5) y de los datos de entrenamiento antes de un uso comercial a gran escala.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria; trátese como un artefacto reciente y poco probado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MoganOCR-TR-1.5-GGUF
- Modelo base: https://huggingface.co/moganai/MoganOCR-TR-1.5
- Página de descargas del autor: https://hf.tst.eu/model#MoganOCR-TR-1.5-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
