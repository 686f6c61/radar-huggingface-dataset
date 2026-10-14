# ahmedsamirtarjama/arabic-ocr-qwen3vl4b-v1

## Resumen
El modelo `ahmedsamirtarjama/arabic-ocr-qwen3vl4b-v1` es un ajuste fino experimental de `Qwen/Qwen3-VL-4B-Instruct` orientado al reconocimiento óptico de caracteres (OCR) y al análisis de layout de documentos en árabe. Lo desarrolla el usuario ahmedsamirtarjama y se publica bajo la librería transformers con pesos en safetensors. Su relevancia radica en ofrecer una alternativa abierta para el procesamiento de documentos árabes, un ámbito con menos recursos que el inglés u otros idiomas.

Arquitectónicamente, se trata de un transformer multimodal (vision-language) de 4.437.815.808 parámetros (aproximadamente 4,44 mil millones). El ajuste se realizó mediante LoRA de rango 64, cuyos pesos se fusionaron en los pesos base, mientras que la torre de visión permaneció congelada durante el entrenamiento. El repositorio ocupa 8,9 GB y la longitud de contexto no está documentada en la información disponible.

Es un proyecto de investigación, no un modelo listo para producción. La model card indica que la inferencia se realiza con vLLM usando un prompt específico (`prompt_layout_all_en`), temperatura 0,1, top_p 1,0 y max_tokens 8192, seguido de post-procesamiento (`trim_tail` y `trim_v2`). No se han publicado resultados de benchmarks ni se especifica la licencia, lo que limita su adopción comercial sin una evaluación previa.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen3-VL-4B-Instruct |
| Parámetros totales | 4.437.815.808 (4,44 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | árabe (según tags); no se detallan otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Tipo de fine-tune | LoRA r64 fusionado en los pesos base; vision tower congelado |
| Tamaño del repositorio | 8,9 GB |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Fecha de creación | 2026-10-13 |
| Fecha de actualización | 2026-10-13 |

## Arquitectura y entrenamiento
El modelo base Qwen3-VL-4B-Instruct es un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El ajuste fino se realizó mediante LoRA de rango 64, y los pesos resultantes se fusionaron en los pesos base, mientras que la torre de visión se mantuvo congelada. Esto implica que la adaptación se centró en la parte de lenguaje, preservando las capacidades visuales preentrenadas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO.

La innovación principal es el propio ajuste para OCR y layout en árabe, junto con un pipeline de inferencia específico que incluye post-procesamiento (`trim_tail` y `trim_v2`) para limpiar las salidas. El proyecto se desarrolló en un servidor interno (`server3-ts`, ruta `/mnt/extra/ocr`, directorio `models/qwen3vl4b_v1_merged`) y los resultados se documentan en `docs/TEST_PROTOCOL.md` y `REPORT.md` dentro del repositorio de datos `arabic-ocr-research-data`.

## Capacidades
- Reconocimiento óptico de caracteres (OCR) en árabe para documentos escaneados o fotografías.
- Análisis de layout de documentos: detección de regiones, columnas, tablas y estructuras.
- Generación de texto condicionada a imágenes (pipeline image-text-to-text).
- Capacidad conversacional multimodal (según el tag `conversational`).
- No se especifican capacidades de tool calling, function calling ni agentes multi-paso.
- No se documentan capacidades de razonamiento matemático, generación de código ni visión más allá del OCR.
- Multilingüismo: solo se indica árabe para la tarea de OCR; no se detallan otros idiomas soportados.
- No se menciona modo de pensamiento (`thinking mode`), audio ni otras modalidades.

## Casos de uso
- Digitalización de archivos históricos en árabe: el modelo puede extraer texto de manuscritos y documentos antiguos, facilitando su preservación y búsqueda. Su especialización en layout ayuda a mantener la estructura original.
- Procesamiento automatizado de facturas y formularios en árabe: extracción de campos clave (fechas, importes, nombres, direcciones) para sistemas de contabilidad y gestión. El análisis de layout permite identificar regiones específicas.
- Análisis de documentos legales en árabe: identificación de cláusulas, artículos y estructura jerárquica para revisión jurídica o extracción de información contractual.
- Atención al cliente con capturas de documentos: el modelo puede interpretar imágenes enviadas por usuarios (por ejemplo, recibos o identificaciones) y extraer la información necesaria para resolver consultas en un flujo conversacional.
- Digitalización de libros y publicaciones periódicas: conversión de páginas escaneadas a texto editable preservando columnas y tablas, lo que facilita la creación de corpus digitales.
- Extracción de tablas en informes financieros en árabe: detección y estructuración de tablas para su posterior análisis en hojas de cálculo o bases de datos.
- Integración en pipelines de gestión documental: uso con vLLM para procesar grandes volúmenes de documentos en lote, aplicando el prompt y el post-procesamiento recomendados.
- Asistencia a la investigación en humanidades: transcripción automática de textos árabes para corpus lingüísticos, con la ventaja de ser un modelo de 4,44 B que puede ejecutarse en hardware moderado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card remite a los archivos `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio `arabic-ocr-research-data`, pero no se proporcionan métricas concretas (como precisión en OCR, MMLU, HumanEval o GSM8K) en la información accesible.

## Requisitos de hardware
- VRAM estimada para inferencia (basada en 4,44 B parámetros): aproximadamente 9 GB en FP16, 5 GB en int8 y 3 GB en int4. Estas cifras son estimaciones no confirmadas por el autor.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090 o similares. Para FP16 se necesita al menos 10 GB de VRAM.
- Compatibilidad con GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. Una RTX 3080 (10 GB) requeriría cuantización int8; una RTX 3060 (12 GB) podría usar int8 o int4.
- Opciones de despliegue: vLLM es el recomendado en la model card. También es compatible con transformers. No se confirma soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantización y el tamaño de las imágenes de entrada.

## Comparativa con modelos similares
No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de OCR árabe. La siguiente tabla compara el modelo con su base directa, aunque carece de datos de rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-VL-4B-Instruct | ~4 B | no disponible | no disponible | HuggingFace |
| ahmedsamirtarjama/arabic-ocr-qwen3vl4b-v1 | 4,44 B | no disponible | no disponible | HuggingFace |
| Otros modelos de OCR árabe | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Es un experimento de investigación, no un modelo validado para producción.
- La licencia no está disponible, por lo que no se puede determinar si permite uso comercial.
- No se han publicado métricas de rendimiento, lo que impide conocer su precisión real en OCR y layout.
- Riesgo de alucinación: como todo modelo generativo, puede inventar texto o estructuras que no están presentes en la imagen.
- Limitaciones de idioma: solo se indica árabe; no se ha evaluado en otros idiomas.
- Requiere post-procesamiento específico (`trim_tail` y `trim_v2`) para limpiar las salidas, lo que añade complejidad al despliegue.
- La torre de visión permaneció congelada durante el fine-tune, lo que puede limitar la adaptación a dominios visuales muy distintos de los vistos en el preentrenamiento.
- El uso de LoRA r64 fusionado puede ofrecer una capacidad de adaptación menor que un fine-tune completo.
- No se especifican sesgos conocidos, pero al estar especializado en árabe podría heredar sesgos de los datos de entrenamiento del modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- La fecha de creación (2026-10-13) sugiere un proyecto muy reciente, con posible falta de pruebas exhaustivas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-qwen3vl4b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de datos y código mencionado: `arabic-ocr-research-data` (enlace no proporcionado en la información disponible).
- No se proporcionan papers, blogs, repositorios adicionales ni demos en la información accesible.
