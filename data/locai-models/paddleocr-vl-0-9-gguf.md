# locai-models/PaddleOCR-VL-0.9-GGUF

## Resumen

PaddleOCR-VL-0.9-GGUF es una conversión a formato GGUF del modelo PaddleOCR-VL de PaddlePaddle, una variante multimodal de 0,9B parámetros especializada en reconocimiento óptico de caracteres (OCR) y comprensión de documentos. La conversión la mantiene el usuario locai-models y se distribuye con licencia Apache-2.0, la misma del modelo base. El paquete incluye tanto el modelo de lenguaje en bf16 (`PaddleOCR-VL-0.9.gguf`, 935 MB) como el proyector multimodal (`PaddleOCR-VL-0.9-mmproj.gguf`, 881 MB), además de la plantilla de chat y el `config.json` de configuración del runtime de LocAI.

El interés de esta ficha es doble. Por un lado, ofrece una vía práctica para ejecutar un modelo OCR multimodal de menos de mil millones de parámetros en entornos locales mediante llama.cpp, sin depender del stack nativo de PaddlePaddle. Por otro, conviene subrayar que se trata de una conversión de formato sin evaluación de calidad asociada: el autor declara explícitamente que no se ejecutó ninguna evaluación para producirla, por lo que cualquier uso en producción debe ir precedido de una validación propia sobre el corpus objetivo.

El modelo base, PaddleOCR-VL, está pensado para tareas de extracción de texto e interpretación de documentos (facturas, formularios, tablas, capturas), y esta conversión conserva la arquitectura y los pesos originales fijados a una revisión concreta del repositorio upstream. La información pública disponible sobre el modelo es limitada en esta ficha: no se detallan la longitud de contexto, los idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal (modelo de lenguaje + proyector visual); detalles de la arquitectura del transformer no disponibles |
| Parámetros totales | 466.654.208 (según safetensors del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (GGUF); no se ofrecen otras cuantizaciones en este repo |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`PaddleOCR-VL-0.9.gguf` + `PaddleOCR-VL-0.9-mmproj.gguf`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base más allá de su naturaleza multimodal: consta de un modelo de lenguaje y un proyector multimodal (mmproj) que conecta las representaciones visuales con el espacio del modelo de texto. La conversión a GGUF se realizó con el conversor `convert_hf_to_gguf.py` de llama.cpp en la revisión `26394b4e6749a41c3633db040e0987500a5f7013`, ejecutado en un entorno Python 3.12 con torch 2.11.0, transformers 4.55.0 y tokenizers 0.21.4, entre otras dependencias fijadas en un lockfile.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo base en la información proporcionada. La revisión upstream fijada es `7fa00a8c55b735ba51ba49a9058f3f9c57a99a11` del repositorio PaddlePaddle/PaddleOCR-VL, y todos los ficheros no modificados se obtienen de ese repositorio en esa revisión concreta.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Comprensión de documentos multimodal: el modelo recibe imagen y texto y genera respuestas en formato conversacional (etiqueta `conversational`).
- Procesamiento de imágenes mediante el proyector multimodal incluido en el paquete.
- Generación de texto a partir de la interpretación de la imagen de entrada.
- Compatibilidad con endpoints (`endpoints_compatible` según las etiquetas del repositorio).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede extraer texto e importes de imágenes de documentos escaneados y devolver la información en formato estructurado, aprovechando su naturaleza OCR y su tamaño reducido para ejecución local.
- Procesamiento de formularios en papel: útil en flujos de back-office donde se necesita transcribir campos manuscritos o impresos sin enviar los documentos a servicios en la nube, gracias a que el paquete GGUF permite inferencia totalmente local.
- Extracción de datos de tablas en informes: el modelo puede interpretar tablas en imágenes y devolver su contenido textual, integrándose en pipelines de extracción de datos con llama.cpp.
- Lectura de capturas de pantalla y tickets en aplicaciones de escritorio: al pesar menos de 1 GB en bf16, puede empaquetarse junto a una aplicación de escritorio para tareas de OCR puntuales sin conexión.
- Preprocesado de documentos para RAG: uso del modelo para convertir imágenes de páginas en texto antes de indexarlas en un sistema de recuperación, ejecutándose en el mismo host que el resto del pipeline.
- Automatización de archivo documental: clasificación y transcripción de documentos escaneados en lotes, con despliegue en CPU o GPU modesta mediante llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión declara explícitamente que no se ejecutó ninguna evaluación de calidad al generar este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 935 MB y el proyector multimodal unos 881 MB, por lo que el conjunto ronda los 1,8 GB de pesos; el consumo real de memoria depende del contexto y del backend.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder alojar los pesos, aunque no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4-8 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 o superiores), aunque esta estimación no está validada por el autor.
- Opciones de despliegue: llama.cpp (formato nativo del paquete); el perfil documentado es `paddleocr-vl09-apple-metal-page1280-local-v1`, orientado a Apple Metal. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PaddleOCR-VL-0.9-GGUF (esta ficha) | 466.654.208 | No disponible | Apache-2.0 | GGUF | Conversión sin evaluación de calidad |
| PaddleOCR-VL (base) | 466.654.208 | No disponible | Apache-2.0 | safetensors | Modelo original de PaddlePaddle |
| Alternativas OCR de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Conversión sin garantía de calidad: el autor indica que no se ejecutó ninguna evaluación; el rendimiento puede diferir del modelo original y debe validarse antes de usarlo en producción.
- Sesgos: no documentados en la información disponible; al ser un modelo OCR, los sesgos dependerán de los datos de entrenamiento del modelo base.
- Riesgo de alucinación: no cuantificado; en tareas OCR, el modelo puede generar texto plausible que no aparezca en la imagen, por lo que se recomienda verificación en dominios críticos.
- Idiomas soportados: no disponibles; conviene probar el modelo con el idioma y la tipografía concretos del caso de uso.
- Longitud de contexto: no disponible; limita la planificación de documentos de muchas páginas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben conservarse el `LICENSE` y el `NOTICE` del modelo base.
- Dependencia de ficheros upstream: el repositorio solo contiene los ficheros derivados; el resto se descarga del repositorio de PaddlePaddle en una revisión fijada, lo que exige conectividad o caché local en el primer uso.
- Despliegue: el perfil documentado está orientado a Apple Metal; no hay evidencia publicada de funcionamiento en otros backends.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/locai-models/PaddleOCR-VL-0.9-GGUF
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- Revisión fijada del modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL/tree/7fa00a8c55b735ba51ba49a9058f3f9c57a99a11
- Conversor llama.cpp utilizado: https://github.com/ggml-org/llama.cpp/tree/26394b4e6749a41c3633db040e0987500a5f7013
