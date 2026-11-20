# mradermacher/typhoon-ocr2-2b-GGUF

## Resumen
typhoon-ocr2-2b-GGUF es una versión cuantizada en formato GGUF del modelo typhoon-ocr2-2b, publicada por mradermacher (nethype GmbH) a partir de los pesos originales de typhoon-ai. El modelo base es un OCR multimodal de aproximadamente 1.880 millones de parámetros (1.881.825.088 según safetensors) especializado en extracción de texto en documentos, análisis de layout, reconocimiento de tablas y parsing documental, con foco en tailandés e inglés. La versión GGUF permite ejecutar el modelo en CPU y GPU de consumo mediante llama.cpp, con cuantizaciones desde Q2_K (1,1 GB) hasta f16 (3,9 GB), además de un proyector multimodal (mmproj) separado en Q8_0 y f16.

El interés de esta ficha radica en que el OCR de alta calidad en tailandés y documentos complejos normalmente requiere infraestructura pesada o APIs propietarias; aquí se ofrece un modelo de 2B parámetros con licencia Apache 2.0, pesos abiertos y cuantizaciones ligeras que caben en equipos modestos. La cuantización la realizó mradermacher mediante conversión HF a GGUF y cuantización estática (quantize_version 2, output_tensor_quantised 1), sin quants ponderados/imatrix disponibles en el momento de la publicación.

La relevancia temporal es alta para pipelines de digitalización documental, dado que el modelo cubre OCR, layout y tablas en un solo modelo multimodal pequeño, y su licencia permisiva facilita uso comercial. Sin embargo, la información disponible sobre arquitectura interna, contexto y benchmarks es escasa, por lo que varios campos se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal orientado a OCR; arquitectura interna no detallada en la información proporcionada) |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj separado); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, número de capas o dimensión oculta). Se trata de un modelo multimodal con pipeline orientado a OCR y parsing documental, que combina un codificador visual (empaquetado en el archivo mmproj) con un modelo de lenguaje de ~1,88B parámetros. Las etiquetas del modelo (ocr, document-parsing, layout-analysis, table-recognition) indican que fue entrenado para tareas de extracción de texto, análisis de disposición de página y reconocimiento de tablas, con especial atención al tailandés.

No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card de esta versión GGUF es una plantilla estándar de mradermacher y no aporta detalles de entrenamiento; los quants son estáticos y no hay quants ponderados/imatrix disponibles según el autor.

## Capacidades
- OCR de documentos: extracción de texto a partir de imágenes de páginas, con soporte específico para tailandés e inglés.
- Parsing documental: interpretación de la estructura de documentos (bloques de texto, secciones).
- Análisis de layout: identificación de la disposición de elementos en la página.
- Reconocimiento de tablas: extracción de contenido tabular estructurado.
- Procesamiento multimodal: acepta entradas de imagen además de texto (requiere el archivo mmproj).
- Conversacional: etiquetado como conversational y endpoints_compatible en Hugging Face.
- Capacidades de tool calling, agentes, razonamiento multi-step o thinking mode: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas a tailandés e inglés según la model card.

## Casos de uso
- Digitalización de facturas y recibos en tailandés: el modelo puede extraer texto y estructura de tablas de documentos escaneados, lo que lo hace adecuado para automatizar la contabilidad de empresas que operan en Tailandia.
- Procesamiento de formularios administrativos: con capacidades de layout analysis, puede identificar campos y secciones en documentos oficiales, reduciendo la entrada manual de datos.
- Extracción de tablas de informes financieros: el reconocimiento de tablas permite convertir tablas impresas o en PDF escaneado en datos estructurados para análisis posterior.
- Pipeline de archivado documental: al ejecutarse en GGUF con llama.cpp, puede integrarse en servidores modestos para procesar lotes de documentos históricos sin depender de APIs externas.
- OCR en el borde (edge) o en portátiles: las cuantizaciones Q4_K_S/Q4_K_M (1,3–1,4 GB) permiten ejecutar el modelo en equipos con poca VRAM o solo CPU, útil para digitalización en campo.
- Preprocesamiento para RAG documental: el texto extraído por OCR puede alimentar un sistema de recuperación aumentada, y el modelo actúa como primer eslabón de ingesta de PDFs e imágenes.
- Análisis de documentos bilingües tailandés-inglés: adecuado para empresas con documentación mixta en ambos idiomas, gracias al soporte declarado de th y en.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q2_K), 1,3–1,4 GB (Q4_K_S/Q4_K_M), 2,1 GB (Q8_0), 3,9 GB (f16), más 0,5–0,8 GB para el proyector multimodal mmproj.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 3060) es suficiente para los quants Q4/Q5; para f16 se recomienda 6–8 GB de VRAM.
- Cabe en GPU consumer: sí, incluso en modelos de gama baja con 4 GB; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) para GGUF; el modelo base typhoon-ai/typhoon-ocr2-2b puede usarse con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| typhoon-ocr2-2b-GGUF (este) | ~1,88B | no disponible | th, en | Apache 2.0 | GGUF |
| typhoon-ai/typhoon-ocr2-2b (base) | ~1,88B | no disponible | th, en | Apache 2.0 | safetensors/transformers |
| Alternativas OCR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (OCR multimodal tailandés/inglés) en la documentación proporcionada, por lo que no es posible establecer una comparativa de rendimiento.

## Limitaciones y advertencias
- Idiomas limitados: solo tailandés e inglés según la model card; el campo "Idiomas" de Hugging Face lista únicamente "en", lo que puede implicar un soporte real más limitado de lo que sugieren las etiquetas.
- Riesgo de alucinación: al ser un modelo generativo multimodal, puede producir texto no presente en la imagen, especialmente en documentos de baja calidad o layouts complejos.
- Sesgos: no se documentan sesgos conocidos; al entrenarse principalmente con documentos tailandeses e ingleses, puede rendir peor en otras lenguas o tipografías.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de documentos de muchas páginas en una sola pasada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datasets de entrenamiento (no documentados aquí).
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar la precisión del OCR; para producción se recomienda Q4_K_M o superior.
- Quants ponderados/imatrix no disponibles: el autor indica que no están planificados salvo petición, lo que limita la calidad de las cuantizaciones pequeñas.
- Dependencia del mmproj: para entrada de imagen es imprescindible descargar el archivo mmproj correspondiente; sin él el modelo no procesa imágenes.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/typhoon-ocr2-2b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Página de descargas del autor: https://hf.tst.eu/model#typhoon-ocr2-2b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
