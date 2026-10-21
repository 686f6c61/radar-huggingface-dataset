# mradermacher/FireRed-OCR-GGUF

## Resumen

FireRed-OCR-GGUF es una recopilación de cuantizaciones GGUF publicada por mradermacher a partir de FireRedTeam/FireRed-OCR. El modelo base tiene 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) y la licencia declarada para esta cuantización es Apache-2.0. El repositorio está etiquetado para inglés, usa la librería transformers y contiene un total de 17,2 GB, aunque ese tamaño corresponde a la suma de todas las cuantizaciones disponibles, no a una sola ejecución.

La relevancia práctica está en que permite desplegar un modelo orientado a OCR en formato GGUF, con cuantizaciones desde Q2_K hasta f16 y ficheros `mmproj` de soporte multimodal. La cuantización Q4_K_M ocupa 1,2 GB y el proyector multimodal Q8_0 otros 0,5 GB, lo que facilita pruebas locales en GPUs de consumo y en CPU mediante llama.cpp. Sin embargo, la model card no documenta arquitectura, contexto, datos de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación de calidad debe hacerse empíricamente antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; el repositorio es una cuantización GGUF de un modelo transformers y no se detalla si es transformer, MoE, SSM o híbrido |
| Parámetros totales | 1.720.574.976 (~1,72 B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `mmproj-Q8_0`, `mmproj-f16`, `Q2_K`, `Q3_K_S`, `Q3_K_M`, `Q3_K_L`, `IQ4_XS`, `Q4_K_S`, `Q4_K_M`, `Q5_K_S`, `Q5_K_M`, `Q6_K`, `Q8_0`, `f16` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF; incluye ficheros `mmproj` para el proyector multimodal |
| Modelo base | FireRedTeam/FireRed-OCR |
| Librería declarada | transformers |
| Tamaño del repositorio | 17,2 GB (suma de todas las cuantizaciones) |
| Descargas | 487 |
| Likes | 5 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. No se especifica si utiliza un transformer denso, una mezcla de expertos, un modelo de espacio de estados o una combinación híbrida. Tampoco se indican el número de tokens de entrenamiento, la composición del dataset, la resolución de imagen soportada ni si se aplicaron técnicas de alineación como RLHF o DPO.

El repositorio de mradermacher contiene cuantizaciones estáticas del modelo original, sin cuantizaciones ponderadas ni imatrix en el momento de la publicación. La presencia de ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` indica que el modelo incorpora un proyector multimodal para entrada de imágenes, necesario para las tareas de OCR. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento explícitos.

## Capacidades

- OCR y transcripción de texto en imágenes: el nombre del modelo base y los ficheros `mmproj` apuntan a un uso de OCR multimodal, aunque la model card no detalla resolución, formatos de imagen ni precisión esperada.
- Generación de texto conversacional: el repositorio incluye la etiqueta `conversational`, pero no se documenta la calidad ni el formato de las respuestas.
- Entrada multimodal: los ficheros `mmproj` permiten procesar imágenes si el runtime utilizado soporta la arquitectura del modelo base.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: solo se declara inglés; no se documentan otros idiomas.
- Capacidades especiales: no se documentan modos de pensamiento, audio, vídeo ni salidas estructuradas.

## Casos de uso

- Digitalización por lotes de documentos escaneados en inglés: se puede usar llama.cpp con la cuantización Q4_K_M para transcribir páginas a texto en local. El tamaño de 1,2 GB de pesos y 0,5 GB del proyector multimodal permite ejecutarlo en equipos modestos, aunque la calidad OCR debe validarse con muestras reales.
- Preprocesamiento para pipelines RAG documental: el modelo puede convertir imágenes de PDF escaneados en texto antes de generar embeddings y alimentar un sistema de búsqueda. Es adecuado si los documentos están en inglés y se trocean por páginas, ya que no se conoce la longitud de contexto.
- Accesibilidad y lectura asistida: integración en una aplicación de escritorio que reciba capturas de pantalla o fotos de documentos y devuelva texto. La cuantización Q4_K_M permite ejecución local sin enviar imágenes a un servicio externo.
- Automatización de backoffice con validación humana: transcripción de facturas, formularios o recibos en inglés para posterior extracción de campos mediante reglas o un modelo aparte. No debe asumirse extracción estructurada directa, porque no está documentada.
- Archivo documental y patrimonio digital: digitalización de documentos mecanografiados en inglés con cuantizaciones Q6_K u Q8_0 para priorizar calidad sobre velocidad. Requiere evaluación previa con tipografías, ruido y calidad de escaneo del fondo concreto.
- Aplicaciones offline en portátiles o equipos de campo: despliegue con llama.cpp y cuantizaciones Q4_K_M o Q5_K_M para OCR local en entornos sin conexión. La licencia Apache-2.0 facilita la integración, pero el uso comercial debe verificar también las condiciones del modelo base.
- Evaluación comparativa de OCR multimodal: uso del modelo como candidato en un banco de pruebas interno frente a otras alternativas, midiendo tasa de caracteres correctos, errores de inserción y latencia con documentos representativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones OCR, tasas de error por carácter ni comparativas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: al añadir el proyector multimodal y el overhead del runtime, Q4_K_M puede requerir aproximadamente 2,5-4 GB de VRAM; Q8_0, alrededor de 3,5-5 GB; f16, alrededor de 6-8 GB. Son estimaciones a partir de los tamaños de fichero, no mediciones publicadas.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 para pruebas y desarrollo. A100 u H100 solo tendrían sentido para servir en lote o con requisitos de concurrencia, no por el tamaño del modelo.
- GPU de consumo: cabe en GPUs de 6-8 GB con cuantizaciones Q4_K_M o Q5_K_M; Q8_0 es razonable en 8 GB; f16 requiere alrededor de 12 GB para trabajar con margen.
- CPU y Apple Silicon: es viable con llama.cpp en CPU y en equipos con memoria unificada de 8 GB o más, usando Q4_K_M o Q5_K_M y aceptando mayor latencia.
- Opciones de despliegue: llama.cpp y llama-cpp-python son las opciones principales para GGUF. También se puede importar en LM Studio, text-generation-webui u Ollama
