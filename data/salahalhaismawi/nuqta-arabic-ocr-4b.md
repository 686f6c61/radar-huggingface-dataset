# SalahALHaismawi/Nuqta-Arabic-OCR-4B

## Resumen

Nuqta-Arabic-OCR 4B es un modelo de reconocimiento óptico de caracteres (OCR) especializado en árabe, desarrollado por Salah AlHaismawi con la colaboración de Mohamed Saleh Tulib y Ahmed ElSayed Mohamed Ibrahim. Se construye mediante fine-tuning del modelo multimodal Qwen/Qwen3.5-4B y convierte imágenes de páginas, documentos escaneados y PDF en árabe en texto limpio o Markdown con tablas HTML, preservando el orden de lectura y el tashkeel (diacríticos) impreso en la página.

El modelo resuelve un problema concreto: el OCR árabe de alta fidelidad, incluyendo escritura manuscrita, documentos oficiales, tablas, formularios, tarjetas de identidad y pasaportes con validación de MRZ. Según el autor, encabeza los resultados publicados en KITAB-Bench (CER 0.106) y Misraj-DocOCR (MARS 82.8), por delante de Gemini, GPT-4o y Baseer.

Con 4.754 millones de parámetros y licencia Apache-2.0, está pensado para despliegue en infraestructura propia: funciona en una GPU de 16 GB en bf16 y dispone de builds GGUF para llama.cpp, lo que permite procesar documentos sensibles sin que salgan de la red local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), fine-tuning de Qwen/Qwen3.5-4B |
| Parametros totales | 4.754.234.880 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16; GGUF (builds publicados en Nuqta-Arabic-OCR-4B-GGUF) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con torre de visión y decodificador de lenguaje, y se especializa mediante fine-tuning supervisado para la tarea de image-to-text aplicada a OCR árabe. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible.

Sí se documentan innovaciones de uso y comportamiento: el modelo se entrena con imágenes de página de hasta 2,4 megapíxeles (las imágenes menores con forma de página se reescalan a ese tamaño en la librería `nuqta-ocr`, mientras que los recortes de línea y palabra se leen tal cual). El modelo copia el tashkeel impreso y apenas inventa diacríticos (0,08–0,16 marcas inventadas por cada 100 letras en texto sin vocalizar), genera tablas como HTML en el orden de dibujo (izquierda a derecha o derecha a izquierda, con celdas combinadas) y valida los dígitos de control ICAO del MRZ en pasaportes. La librería `nuqta-ocr` añade una protección contra bucles de repetición sobre el modelo.

## Capacidades

- Reconocimiento de texto árabe impreso y manuscrito en escaneos, fotos y PDF.
- Conversión de documentos a texto plano o Markdown con tablas en HTML.
- Preservación del orden de lectura y de la dirección del texto (RTL/LTR en tablas de dirección mixta).
- Transcripción fiel del tashkeel impreso, con baja tasa de diacríticos inventados.
- Extracción de tablas con celdas combinadas y orden de columnas correcto (98% en tablas de prueba de dirección mixta renderizadas, según el autor).
- Lectura de tarjetas de identidad y pasaportes, con validación de los dígitos de control ICAO del MRZ.
- Comprensión de diagramas y documentos con estructura compleja.
- Interfaz conversacional (tag `conversational`) sobre la pipeline image-text-to-text.
- Capacidades multilingües limitadas al árabe; no se declaran otros idiomas.

## Casos de uso

- Digitalización de fondos bibliográficos: procesar páginas de libros árabes escaneados y obtener texto o Markdown con el tashkeel original, útil para bibliotecas digitales y proyectos de preservación que necesitan transcripción fiel sin conexión a servicios externos.
- Automatización de PDF a Markdown en pipelines documentales: el modelo genera tablas HTML en orden de lectura, lo que permite alimentar sistemas de búsqueda, RAG o publicación web a partir de informes y artículos académicos en árabe.
- Extracción de datos de documentos oficiales: lectura de formularios y documentos administrativos con estructura tabular, aprovechando la salida en Markdown/HTML para su posterior parseo.
- Onboarding y KYC con tarjetas de identidad: extracción de campos de documentos de identidad reales (85,7% de campos correctos en el conjunto held-out del autor) con validación del MRZ, desplegable on-premises para cumplir requisitos de residencia de datos.
- Verificación de pasaportes en frontera o procesos de viaje: lectura de la zona MRZ con comprobación de dígitos de control ICAO (87,2% de campos correctos en pasaportes reales según el autor).
- Procesamiento por lotes en servidor: con vLLM en bf16 sobre una GPU de 16 GB, el autor reporta unos 1,8 s por página en servicio con batching, adecuado para colas de digitalización de alto volumen.
- Despliegue offline en puesto de trabajo: mediante los builds GGUF y llama.cpp, para entornos sin conectividad o con documentos que no pueden salir de la máquina.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), con el código de puntuación de KITAB-Bench:

| Benchmark | Metrica | Nuqta-Arabic-OCR 4B | Comparativa publicada |
|---|---|---|---|
| KITAB-Bench (13 datasets OCR) | CER (macro, tamano de entrada recomendado) | 0.106 | Gemini-2.0-Flash 0.13; AIN-7B 0.20; GPT-4o 0.31 |
| KITAB-Bench (imagenes tal cual) | CER | 0.111 | no disponible |
| Misraj-DocOCR | MARS | 82.8 | Baseer v2 77.8; Gemini-2.5-Pro 70.8; GPT-5 54.8 |
| Misraj-DocOCR (imagenes tal cual) | MARS | 81.0 | no disponible |
| Misraj-DocOCR | chrF | 89.4 | no disponible |
| Misraj-DocOCR | CER | 0.121 | no disponible |
| Misraj-DocOCR | TEDS (tablas) | 76.1 | no disponible |
| Tarjetas de identidad reales (held-out) | campos correctos | 85.7% | no disponible |
| Pasaportes reales (held-out) | campos correctos | 87.2% | no disponible |
| Texto sin vocalizar | diacriticos inventados por 100 letras | 0.08–0.16 | no disponible |
| Tablas de direccion mixta renderizadas | orden de columnas correcto | 98% | no disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,5 GB solo para pesos en bf16 (4,75 mil millones de parámetros); el autor indica que el modelo funciona cómodamente en una GPU de 16 GB en bf16, incluyendo el procesamiento de imagen.
- GPU recomendadas: cualquier GPU con 16 GB o más para bf16 (por ejemplo, RTX 4090, A100, H100); el autor no especifica modelos concretos más allá del requisito de 16 GB.
- GPU de consumo: sí, cabe en tarjetas de 16 GB (RTX 4090, entre otras) en bf16; los builds GGUF permiten además ejecución en CPU.
- Opciones de despliegue: transformers, vLLM (servicio con batching), llama.cpp mediante los pesos GGUF, y la librería `nuqta-ocr` (`pip install nuqta-ocr`).
- Latencia y throughput: el autor reporta unos 1,8 s por página de documento en servicio con batching en vLLM sobre 16 GB en bf16; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KITAB-Bench CER | Misraj-DocOCR MARS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nuqta-Arabic-OCR 4B | 4,75 B | no disponible | 0.106 | 82.8 | Apache-2.0 | Pesos abiertos en HF (safetensors y GGUF) |
| Gemini-2.0-Flash / Gemini-2.5-Pro | no disponible | no disponible | 0.13 (2.0-Flash) | 70.8 (2.5-Pro) | propietaria | API cerrada |
| GPT-4o / GPT-5 | no disponible | no disponible | 0.31 (GPT-4o) | 54.8 (GPT-5) | propietaria | API cerrada |
| Baseer v2 (Misraj) | no disponible | no disponible | no disponible | 77.8 | no disponible | no disponible |
| AIN-7B | 7 B | no disponible | 0.20 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son ejecuciones del propio autor y están marcados como no verificados; la comparación con competidores usa cifras publicadas por terceros, no reevaluaciones homogéneas.
- El modelo está especializado exclusivamente en árabe; no se declaran capacidades en otros idiomas y su uso fuera del árabe no está validado.
- La longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de documentos de muchas páginas en una sola pasada.
- Riesgo de alucinación en la transcripción: aunque el autor reporta una tasa baja de diacríticos inventados (0,08–0,16 por 100 letras), sigue existiendo y debe validarse en flujos críticos, especialmente en documentos legales o financieros.
- Las cifras de extracción de campos en documentos de identidad y pasaportes (85,7% y 87,2%) implican que entre un 13% y un 15% de campos pueden ser incorrectos; requieren revisión humana o validación adicional en producción.
- El rendimiento depende del preprocesado: los resultados varían entre el tamaño de entrada recomendado (0.106 CER) y las imágenes tal cual (0.111 CER); conviene usar la librería `nuqta-ocr` para replicar las condiciones de evaluación.
- Licencia Apache-2.0: permite uso comercial, pero el modelo deriva de Qwen/Qwen3.5-4B, cuyas condiciones conviene revisar antes de un despliegue comercial.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que limita la evaluación de riesgos de dominio (por ejemplo, variedades dialectales o caligrafías regionales poco representadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SalahALHaismawi/Nuqta-Arabic-OCR-4B
- Pesos GGUF: https://huggingface.co/SalahALHaismawi/Nuqta-Arabic-OCR-4B-GGUF
- Modelo hermano 0.8B: https://huggingface.co/SalahALHaismawi/Nuqta-Arabic-OCR-0.8B
- Coleccion Nuqta OCR: https://huggingface.co/collections/SalahALHaismawi/nuqta-ocr-6ad4af255195b706ac93d1d4
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/SalahALHaismawi/Nuqta-Arabic-OCR
- Sitio web del proyecto: https://salahalhaismawi.github.io/nuqta-ocr/
- Repositorio de la libreria y codigo de benchmarks: https://github.com/SalahAlHaismawi/nuqta-ocr
- KITAB-Bench: https://github.com/mbzuai-oryx/KITAB-Bench
- Dataset Misraj-DocOCR: https://huggingface.co/datasets/Misraj/Misraj-DocOCR
- Resultados de Misraj (tabla de septiembre de 2026): https://misraj.ai/en/blogs/baseer-arabic-document-ocr-vlm-misraj
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
