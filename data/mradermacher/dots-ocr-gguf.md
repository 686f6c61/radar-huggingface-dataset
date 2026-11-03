# mradermacher/dots.ocr-GGUF

## Resumen

dots.ocr-GGUF es la versión cuantizada en formato GGUF del modelo dots.ocr, desarrollado originalmente por dots-studio y convertido por mradermacher. Se trata de un modelo de imagen a texto especializado en OCR y análisis de documentos, capaz de extraer texto, interpretar el layout de la página, reconocer tablas y fórmulas matemáticas a partir de imágenes. El modelo base cuenta con aproximadamente 1.777 millones de parámetros (1,78 B), lo que lo sitúa en la gama de modelos compactos desplegables en hardware de consumo.

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo con llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter, ofreciendo cuantizaciones desde Q2_K (0,9 GB) hasta f16 (3,7 GB), además de un componente multimodal separado (mmproj) necesario para procesar imágenes. El modelo soporta inglés, chino y contenido multilingüe, y se distribuye bajo licencia MIT, lo que facilita su uso comercial.

El pipeline declarado es image-to-text, con etiquetas específicas para OCR, document-parse, layout, table y formula, lo que indica un enfoque claro hacia la digitalización estructurada de documentos más que hacia la generación de texto generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-to-text), con código personalizado (`custom_code`) en transformers |
| Parámetros totales | 1.777.088.000 (1,78 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un modelo multimodal de imagen a texto implementado con código personalizado en la librería transformers. El pipeline declarado (image-to-text) y las etiquetas (ocr, document-parse, layout, table, formula) confirman que el modelo procesa imágenes de documentos y genera representaciones textuales estructuradas, incluyendo la disposición de bloques, tablas y fórmulas.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La versión aquí descrita es una cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) del modelo original dots-studio/dots.ocr; el autor indica que las cuantizaciones ponderadas con imatrix están disponibles en un repositorio separado (dots.ocr-i1-GGUF).

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Análisis de layout: identificación y estructuración de bloques de texto, secciones y disposición de la página.
- Extracción y reconstrucción de tablas.
- Reconocimiento de fórmulas matemáticas.
- Conversión de imagen a texto estructurado (document-parse).
- Soporte multilingüe, con énfasis declarado en inglés y chino.
- Procesamiento multimodal mediante el componente mmproj (Q8_0 o f16).
- Integración con el ecosistema transformers y con herramientas compatibles con GGUF.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de agente multi-paso.

## Casos de uso

- Digitalización masiva de archivos: el modelo convierte imágenes de documentos escaneados en texto estructurado, adecuado para pipelines de archivo histórico o administrativo gracias a su tamaño compacto y licencia MIT.
- Extracción de datos de facturas y formularios: al reconocer layout y tablas, permite recuperar campos estructurados de documentos comerciales sin necesidad de plantillas rígidas.
- Procesamiento de documentación técnica con fórmulas: útil para convertir artículos científicos o manuales con ecuaciones a texto reutilizable.
- Automatización de la entrada de datos en back-office: despliegue local con llama.cpp sobre hardware modesto para digitalizar documentos internos sin enviar datos a servicios externos.
- Accesibilidad documental: generación de transcripciones de material impreso o escaneado para lectores de pantalla y sistemas de búsqueda.
- Indexación y búsqueda en repositorios de PDF: extracción del contenido y estructura de cada página para alimentar motores de búsqueda o sistemas RAG sobre documentación corporativa.
- Digitalización de documentación bilingüe inglés-chino: aprovecha el soporte declarado de ambos idiomas para entornos comerciales internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con cuantizaciones Q4_K_S/Q4_K_M (1,2 GB de pesos), hasta unos 3,7 GB con f16; hay que sumar el componente mmproj (1,4 GB en Q8_0 o 2,6 GB en f16) para el procesamiento de imágenes.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM es suficiente para las cuantizaciones intermedias más mmproj; para f16 se recomienda al menos 8-12 GB. En datacenter, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también en GPUs integradas con suficiente memoria compartida para las cuantizaciones más pequeñas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros runners compatibles con GGUF; el modelo base puede ejecutarse con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| dots.ocr-GGUF | 1,78 B | no disponible | OCR, layout, tablas, fórmulas | MIT | GGUF |
| dots.ocr (base) | 1,78 B | no disponible | OCR, layout, tablas, fórmulas | MIT | safetensors |
| Alternativas OCR de propósito general | no disponible | no disponible | OCR | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- La información disponible no documenta sesgos conocidos del modelo; al entrenarse presumiblemente con datos en inglés y chino, el rendimiento en otros idiomas puede ser inferior.
- Riesgo de alucinación inherente a los modelos generativos: puede producir texto o estructuras que no aparecen en la imagen original, especialmente en documentos de baja calidad o con tipografías inusuales.
- La longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de documentos de muchas páginas en una sola pasada.
- El uso requiere cargar el componente mmproj junto con los pesos principales; omitirlo impide el procesamiento de imágenes.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- Las cuantizaciones Q2_K y Q3 pueden degradar la precisión del OCR; para producción se recomienda Q4_K_M o superior.
- El modelo está orientado a OCR y análisis documental; no debe emplearse como modelo de propósito general para razonamiento o generación libre de texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dots.ocr-GGUF
- Modelo base: https://huggingface.co/dots-studio/dots.ocr
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/dots.ocr-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#dots.ocr-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
