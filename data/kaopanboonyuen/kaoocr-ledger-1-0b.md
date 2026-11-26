# kaopanboonyuen/KaoOCR-Ledger-1.0b

## Resumen
KaoOCR-Ledger-1.0b es un modelo de visión-lenguaje especializado en OCR y parseo de documentos tailandeses, desarrollado por kaopanboonyuen en el marco de GSB AI Lab (Government Savings Bank de Tailandia). Convierte imágenes de páginas de documentos (o recortes de líneas manuscritas) en Markdown estructurado con encabezados, párrafos y tablas. Emplea una arquitectura encoder de visión más decodificador autorregresivo, con 630,8 millones de parámetros totales, y está afinado a partir de KaoOCR-Ledger-1.0a, que a su vez deriva de OpenThai2.1-OCR-Markdown y, en última instancia, de NVIDIA Nemotron 3.5 Parse.

La relevancia del modelo reside en su enfoque local y ligero (repo de 2,7 GB) para un nicho poco cubierto: la digitalización de documentos financieros y administrativos en tailandés, incluyendo tablas y escritura manual. Frente a su predecesor 1.0a mejora 8,8 puntos en OCR (NLS) y 6,0 en parseo (TEDS/NLS) según la benchmark propia ThaiOCRBench, y se sitúa cerca de referencias como OpenThai2.1-OCR-Markdown y typhoon-ocr2-2b, superando a la primera en OCR y a la segunda en parseo.

Se distribuye con licencia OpenMDW-1.1, soporta tailandés e inglés, y está pensado para despliegue en GPU (vLLM) o CPU (lento) mediante código de inferencia incluido en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de visión + decodificador autorregresivo (derivada de Nemotron Parse, decoder-only en su linaje declarado) |
| Parámetros totales | 630.800.504 (0,63B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW-1.1 (campo `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo combina un encoder de visión con un decodificador autorregresivo que genera directamente la secuencia Markdown. Su linaje declarado es NVIDIA Nemotron 3.5 Parse → OpenThai2.1-OCR-Markdown → KaoOCR-Ledger-1.0a → KaoOCR-Ledger-1.0b. La versión 1.0a se describe como un descendiente decoder-only afinado para escritura manual tailandesa y con mezcla de pesos mediante WiSE-FT; 1.0b es un fine-tune adicional de 1.0a orientado a mejorar OCR y parseo de documentos. El tokenizer, el código de ejecución (`nemotron_parse/`) y los ficheros de licencia se heredan sin cambios.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens, las épocas, la tasa de aprendizaje ni el hardware utilizado (queda como TODO pendiente por el autor). Tampoco se documenta el uso de RLHF o DPO. La innovación práctica es el post-procesador `nemotron_parse/` empaquetado junto a los pesos y dos modos de inferencia: modo página (imagen de página completa a Markdown) y modo línea (`--line`, recorte de una sola línea a texto plano).

## Capacidades
- OCR de documentos en tailandés e inglés, con salida en Markdown estructurado (encabezados, párrafos y tablas).
- Parseo de tablas: genera marcado de tabla evaluado con TEDS.
- Reconocimiento de escritura manual en modo línea (recortes de una sola línea).
- Conversión de páginas completas a Markdown en una sola pasada (modo página con prompt nativo de parseo).
- Generación de texto multimodal imagen-texto (`image-text-to-text`) con decodificación autorregresiva.
- Soporte de dos idiomas: tailandés e inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso
- Digitalización de extractos y libros contables bancarios: el modelo convierte imágenes de páginas con tablas en Markdown con estructura preservada, adecuado para el dominio financiero del GSB y para pipelines de extracción de datos contables.
- Procesamiento masivo de formularios administrativos tailandeses: en modo página genera Markdown listo para indexar en sistemas de búsqueda o RAG, reduciendo el trabajo manual de transcripción.
- Archivo de documentos manuscritos: el modo línea (`--line`) permite transcribir recortes de escritura manual a texto plano, útil para digitalizar notas y registros históricos.
- Extracción de tablas para análisis de datos: la salida Markdown con tablas evaluada por TEDS facilita el volcado a hojas de cálculo o bases de datos relacionales.
- Pipeline de OCR local y privado: con 2,7 GB de pesos y despliegue en GPU o CPU, puede ejecutarse en infraestructura propia sin enviar documentos sensibles a servicios externos.
- Servicio de inferencia con vLLM: el repositorio incluye instrucciones para servir el modelo (`vllm serve . --served-model-name nemotron-parse --trust-remote-code`), lo que permite atender peticiones concurrentes de conversión de documentos en producción.
- Normalización de documentos bilingües tailandés-inglés: adecuado para organismos que manejan documentación mixta en ambos idiomas.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre ThaiOCRBench (escala 0-100; OCR con NLS = 1 − distancia de edición normalizada; parseo con TEDS cuando hay tabla, NLS sobre texto sin marcado en caso contrario). No incluye tareas VQA ni de información clave.

| Modelo | OCR (NLS) | Parseo (TEDS/NLS) |
|---|---:|---:|
| KaoOCR-Ledger-1.0b | 54,0 | 67,6 |
| KaoOCR-Ledger-1.0a | 45,2 | 61,6 |
| OpenThai2.1-OCR-Markdown (referencia) | 50,4 | 68,1 |
| typhoon-ocr2-2b (referencia) | 55,8 | 63,6 |

Deltas declarados: +8,8 en OCR y +6,0 en parseo respecto a 1.0a; +4,0 en parseo frente a typhoon-ocr2-2b; +3,7 en OCR frente a OpenThai2.1-OCR-Markdown. Por debajo: −1,8 en OCR frente a typhoon-ocr2-2b y −0,5 en parseo frente a OpenThai2.1-OCR-Markdown. Los propios autores advierten que las cifras proceden de su ejecución y sus evaluadores, no de un leaderboard oficial.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 630,8 M de parámetros en precisión completa (fp16/bf16) el peso ronda 1,3 GB, y el repo completo ocupa 2,7 GB.
- GPU recomendadas: no se especifican modelos concretos; la model card indica que se recomienda GPU y que `--device cpu` funciona pero es lento.
- GPU de consumo: por tamaño (0,63B) es plausible en GPUs de consumo con suficiente VRAM, aunque no hay confirmación oficial ni lista de modelos compatibles.
- Despliegue: vLLM (`vllm serve . --served-model-name nemotron-parse --trust-remote-code`) y script `inference.py` incluido; requiere `--trust-remote-code` por el código personalizado (`custom_code`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OCR (NLS) | Parseo (TEDS/NLS) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| KaoOCR-Ledger-1.0b | 0,63B | no disponible | 54,0 | 67,6 | OpenMDW-1.1 | Hugging Face |
| OpenThai2.1-OCR-Markdown | no disponible | no disponible | 50,4 | 68,1 | no disponible | referenciado en la model card |
| typhoon-ocr2-2b | ~2B (según nombre) | no disponible | 55,8 | 63,6 | no disponible | referenciado en la model card |
| KaoOCR-Ledger-1.0a | 0,63B (misma familia) | no disponible | 45,2 | 61,6 | OpenMDW-1.1 | Hugging Face |

## Limitaciones y advertencias
- Hereda todas las dificultades de la arquitectura base: fórmulas, texto en escenas y layouts poco habituales.
- El modo línea (`--line`) está pensado solo para recortes de una línea; el modo página usa el prompt nativo de parseo.
- Las puntuaciones proceden de una ejecución propia con evaluadores propios y no de un leaderboard oficial; los autores recomiendan probar con documentos propios antes de fiarse de los números.
- No se documentan sesgos conocidos ni tasa de alucinación; al ser un modelo generativo, existe riesgo de producir contenido inventado en zonas de baja legibilidad.
- Idiomas limitados a tailandés e inglés.
- Licencia OpenMDW-1.1: conviene revisar sus términos antes de uso comercial, ya que el campo `license` figura como `other`.
- Requiere `trust_remote_code` por el código personalizado incluido; implica ejecutar código del autor.
- La model card deja pendientes los detalles de entrenamiento (mezcla de datos, épocas, LR, hardware), lo que dificulta la reproducibilidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0b
- Modelo base (1.0a): https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0a
- Versión 1.0c: https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0c
- Repositorio de descarga directa: `hf download kaopanboonyuen/KaoOCR-Ledger-1.0b --local-dir KaoOCR-Ledger-1.0b`
