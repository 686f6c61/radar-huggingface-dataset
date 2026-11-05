# mradermacher/typhoon-ocr2-2b-GGUF

## Resumen

typhoon-ocr2-2b es un modelo especializado en reconocimiento óptico de caracteres (OCR) desarrollado por Typhoon AI (SCB 10X). El modelo original se publica en el repositorio typhoon-ai/typhoon-ocr2-2b, y la ficha que nos ocupa es la versión cuantizada en formato GGUF elaborada por mradermacher, un conocido creador de cuantizaciones para llama.cpp. Con 1.881.825.088 parámetros reales (aproximadamente 1,88 mil millones), se posiciona como un modelo compacto orientado a tareas de extracción de texto a partir de imágenes.

La relevancia de esta publicación radica en que permite ejecutar un modelo multimodal de OCR en hardware de consumo mediante cuantizaciones de 2 a 8 bits, con tamaños que van desde 1,1 GB hasta 3,9 GB. Al tratarse de una cuantización estática (no imatrix), el autor advierte de que las versiones ponderadas podrían no estar disponibles. El modelo base está etiquetado como conversacional y multimodal, e incluye ficheros mmproj para el procesamiento de imágenes.

No se dispone de información sobre la longitud de contexto, la licencia del modelo original ni los detalles de entrenamiento en la documentación proporcionada. La model card del cuantizador se limita a describir los ficheros GGUF generados y no reproduce la ficha técnica del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal de tipo transformer, inferido por los ficheros mmproj) |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y los ficheros publicados (mmproj), se trata de un modelo multimodal que combina un codificador visual con un modelo de lenguaje para tareas de OCR y comprensión de documentos. El tamaño de 1,88 mil millones de parámetros sugiere un transformer compacto, adecuado para despliegue en entornos con recursos limitados.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del cuantizador no incluye información sobre innovaciones técnicas como decodificación especulativa o atención lineal. Las cuantizaciones son estáticas (quantize_version 2, output_tensor_quantised 1), sin versiones ponderadas/imatrix disponibles en el momento de la publicación.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes, según el nombre y la naturaleza multimodal del modelo.
- Procesamiento de imágenes mediante los ficheros mmproj (Q8_0 y f16) para el codificador visual.
- Generación de texto conversacional, según la etiqueta "conversational" de la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card solo declara inglés (en).
- Modo thinking, visión o audio adicionales: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede extraer texto de imágenes de facturas, contratos o formularios, y las cuantizaciones Q4_K_M (1,4 GB) permiten ejecutarlo en portátiles con GPU integrada o CPU.
- Procesamiento por lotes de archivos PDF convertidos a imagen: al ser un modelo de 1,88 B, se pueden paralelizar múltiples instancias en una sola GPU para aumentar el throughput en pipelines de ingesta documental.
- Extracción de texto en aplicaciones de escritorio: con la cuantización Q8_0 (2,1 GB) y llama.cpp, se puede integrar en herramientas de escritorio sin depender de servicios en la nube.
- Automatización de la entrada de datos: el modelo puede transcribir tickets, recibos o etiquetas a texto estructurado para su posterior validación en sistemas ERP o CRM.
- Accesibilidad: conversión de imágenes con texto (capturas, carteles, documentos fotografiados) a texto legible por lectores de pantalla, ejecutándose localmente en el dispositivo.
- Prototipado e investigación en OCR: las cuantizaciones Q2_K y Q3_K_S (1,1 GB) permiten experimentar con el modelo en entornos con VRAM muy limitada, aunque con menor calidad.
- Archivado y búsqueda: indexación de texto extraído de imágenes históricas o escaneos para motores de búsqueda internos, usando la cuantización f16 (3,9 GB) cuando se requiera máxima fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5–2,5 GB para cuantizaciones Q4_K_M (1,4 GB de pesos más overhead de contexto y del codificador visual mmproj); unos 3 GB para Q8_0 y 4–5 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más; también puede ejecutarse en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y otros runners compatibles con GGUF; el modelo base en safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| typhoon-ocr2-2b (esta ficha, GGUF) | 1,88 B | no disponible | no disponible | GGUF | Cuantización estática de mradermacher |
| typhoon-ai/typhoon-ocr2-2b | 1,88 B | no disponible | no disponible | safetensors | Modelo base original |
| Alternativas de OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y podría ser deficiente.
- Las cuantizaciones Q2_K y Q3_K_S (1,1 GB) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No se dispone de información sobre la licencia del modelo base, lo que impide confirmar si el uso comercial está permitido; es imprescindible verificar la licencia en el repositorio original antes de desplegarlo.
- Riesgo de alucinación y de errores de transcripción en imágenes de baja calidad, rotadas o con tipografías poco habituales; no se han publicado evaluaciones al respecto.
- Al ser una cuantización estática sin imatrix, la perplejidad puede ser superior a la de cuantizaciones ponderadas equivalentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se dispone de información sobre la longitud de contexto, lo que limita la planificación de cargas de documentos extensos.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/typhoon-ocr2-2b-GGUF
- Modelo base original: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Página de resumen del cuantizador: https://hf.tst.eu/model#typhoon-ocr2-2b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
