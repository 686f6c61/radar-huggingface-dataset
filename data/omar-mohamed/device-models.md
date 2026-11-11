# omar-mohamed/device-models

## Resumen

`omar-mohamed/device-models` es un repositorio de artefactos ONNX cuantizados pensados para inferencia en dispositivo (on-device), publicado por el usuario omar-mohamed. No se trata de un modelo único, sino de una coleccion de conversiones fijadas a versiones upstream de tres familias distintas: los reconocedores y el detector de PP-OCRv5, el modelo de embeddings `multilingual-e5-small` y el modelo de chat `LFM3-1.7B`. Cada artefacto se ofrece en precisiones int8, fp16 o 4 bits segun la familia, con el objetivo de ejecutarse sobre ONNX Runtime en hardware movil arm64.

El repositorio resuelve un problema practico de despliegue: tomar modelos upstream ya publicados y entregar grafos ONNX ya cuantizados con puertas de calidad verificadas sobre fixtures fijos (recortes de linea y paginas completas). El `manifest.json` actua como tabla autoritativa de URL, SHA-256 y tamano en bytes de cada fichero, lo que facilita la trazabilidad y la verificacion de integridad en pipelines de distribucion.

La relevancia actual radica en su enfoque en eficiencia en el borde: mediciones tomadas en hardware Android arm64 de clase Cortex-A75/A55 con 4 hilos de inferencia, y decisiones de precision documentadas por familia (por ejemplo, int8 falla la paridad de cajas en el detector OCR y fp16 colapsa en el execution provider de CPU). El repo ocupa 3,5 GB y contiene 44 ficheros. No se declara licencia, idiomas ni pipeline en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (conjunto heterogeneo: PP-OCRv5, multilingual-e5-small, LFM3-1.7B convertidos a grafos ONNX) |
| Parametros totales | No disponible de forma agregada; LFM3-1.7B tiene 1,7 mil millones; el resto no se especifica |
| Parametros activos | No aplica (no se indica que ningun componente sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (QDQ estatico y dinamico), fp16, int4 (weight-only), q4f16 |
| Idiomas soportados | No disponibles de forma declarada; los reconocedores OCR cubren arabic, cjk, cyrillic, devanagari, english, eslav, greek, korean, latin, tamil, telugu y thai segun los nombres de artefacto |
| Licencia | No disponible |
| Formato de pesos | ONNX (ONNX Runtime) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: agrupa conversiones a ONNX Runtime de modelos upstream. La familia OCR corresponde a PP-OCRv5, con un detector (`ocr-det-mobile`), un modulo de orientacion de linea de texto basado en PP-LCNet (`ocr-ori`) y una bateria de reconocedores por escritura (arabic, cjk, cyrillic, devanagari, english, eslav, greek, korean, latin, tamil, telugu, thai). La familia de embeddings es `multilingual-e5-small`. La familia generativa es LFM3-1.7B, un decoder de 1,7 mil millones de parametros descrito en la model card como "bandwidth-bound decoder", es decir, limitado por ancho de banda de memoria mas que por computo.

Las innovaciones tecnicas destacables son las decisiones de cuantizacion por familia y la existencia de puertas de calidad medibles. Los reconocedores OCR usan int8 con QDQ estatico en CPU y fp16 en GPU; el detector mantiene fp32 upstream en CPU porque int8 rompe la paridad de cajas y texto, y fp16 solo se usa en GPU porque colapsa en el execution provider de CPU. La orientacion PP-LCNet mantiene fp32 upstream en CPU porque int8 falla la paridad de volteo al 100 % y fp16 es mas lento que fp32 en CPU. `multilingual-e5-small` usa int8 dinamico en CPU porque el QDQ estatico pierde paridad de coseno. LFM3-1.7B usa int4 weight-only en CPU y q4f16 en GPU. No se aportan datos sobre volumen de entrenamiento, composicion del dataset ni uso de RLHF/DPO de los modelos upstream.

## Capacidades

- Reconocimiento optico de caracteres (OCR) multiescritura: reconocedores para arabic, cjk, cyrillic, devanagari, english, eslav, greek, korean, latin, tamil, telugu y thai.
- Deteccion de cajas de texto en pagina mediante `ocr-det-mobile`.
- Clasificacion de orientacion de linea de texto con `ocr-ori` (paridad de volteo del 100 % en fp16).
- Generacion de embeddings de frases multilingues con `multilingual-e5-small` (coseno 0,99366 en int8 y 1,00000 en fp16 frente al upstream).
- Generacion de texto conversacional con `LFM3-1.7B` en int4 y q4f16 (coincidencia exacta de tokens frente al upstream q4 de 1,00000 en int4).
- No se documentan capacidades de tool calling, function calling, agentes, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de documentos en movil: combinar `ocr-det-mobile_fp16` con los reconocedores int8 adecuados por escritura permite extraer texto de facturas, tickets o formularios directamente en el dispositivo, sin enviar imagenes a un servidor.
- Escaneo multilingue en apps Android: los doce reconocedores por escritura cubren alfabetos latino, cirilico, griego, arabe, CJK, devanagari, tamil, telugu y thai, lo que habilita lecturas de carteles o menus en contexto de viaje.
- Correccion de orientacion de capturas: `ocr_textline_ori_fp16` clasifica lineas giradas 0/90/180/270 grados con precision de 1,00000 en el fixture, util para preprocesar fotos tomadas sin cuidado.
- Busqueda semantica local: `multilingual-e5-small_int8` genera embeddings con coseno 0,99366 respecto al upstream, suficiente para indexar notas o correos en el dispositivo y hacer recuperacion por similitud sin conexion.
- Asistente de chat embebido: `chat-lfm3-1.7b` en int4 (coincidencia exacta de tokens 1,00000 frente al upstream q4) permite un asistente conversacional de 1,7 mil millones de parametros ejecutandose en CPU movil con 4 hilos.
- Pipeline OCR + resumen: encadenar el detector, los reconocedores y LFM3-1.7B para resumir o extraer campos de un documento escaneado en el propio dispositivo, reduciendo exposicion de datos personales.
- Verificacion de integridad en distribucion: usar el `manifest.json` con SHA-256 y tamanos en bytes para validar cada artefacto antes de desplegarlo en flotas de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). La model card si incluye puertas de calidad sobre fixtures fijos:

| Modelo | Precision | Tarea | Metrica | Umbral | Resultado |
|---|---|---|---:|---:|---|
| `embedding-e5-small` | int8 | cosine | 0,99366 | 0,9900 | PASS |
| `embedding-e5-small` | fp16 | cosine | 1,00000 | 0,9999 | PASS |
| `ocr-det-mobile` | fp16 | mask_iou | 0,99747 | 0,9900 | PASS |
| `ocr-ori` | fp16 | accuracy | 1,00000 | 0,9900 | PASS |
| `ocr-rec-arabic` | int8 | cer | 0,01423 | 0,0200 | PASS |
| `ocr-rec-arabic` | fp16 | cer | 0,00331 | 0,0050 | PASS |
| `ocr-rec-cjk` | int8 | cer | 0,00824 | 0,0200 | PASS |
| `ocr-rec-cjk` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `ocr-rec-cyrillic` | int8 | cer | 0,00000 | 0,0200 | PASS |
| `ocr-rec-cyrillic` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `ocr-rec-devanagari` | int8 | cer | 0,00000 | 0,0200 | PASS |
| `ocr-rec-devanagari` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `ocr-rec-english` | int8 | cer | 0,00686 | 0,0200 | PASS |
| `ocr-rec-english` | fp16 | cer | 0,00046 | 0,0050 | PASS |
| `ocr-rec-eslav` | int8 | cer | 0,00444 | 0,0200 | PASS |
| `ocr-rec-eslav` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `ocr-rec-greek` | int8 | cer | 0,00063 | 0,0200 | PASS |
| `ocr-rec-greek` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `ocr-rec-korean` | int8 | cer | 0,01268 | 0,0200 | PASS |
| `ocr-rec-korean` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `ocr-rec-latin` | int8 | cer | 0,00861 | 0,0200 | PASS |
| `ocr-rec-latin` | fp16 | cer | 0,00045 | 0,0050 | PASS |
| `ocr-rec-tamil` | int8 | cer | 0,00000 | 0,0200 | PASS |
| `ocr-rec-tamil` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `ocr-rec-telugu` | int8 | cer | 0,00063 | 0,0200 | PASS |
| `ocr-rec-telugu` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `ocr-rec-thai` | int8 | cer | 0,00063 | 0,0200 | PASS |
| `ocr-rec-thai` | fp16 | cer | 0,00000 | 0,0050 | PASS |
| `chat-lfm3-1.7b` | int4 | chat | token_exact_match_vs_upstream_q4 1,00000 | 0,9900 | PASS |
| `chat-lfm3-1.7b` | q4f16 | chat | token_exact_match_vs_fp32 0,80000 | 0,8000 | PASS |

Las mediciones de dispositivo se realizaron en hardware Android arm64 de clase Cortex-A75/A55 con 4 hilos de inferencia; la propia model card advierte que los tiempos en host no son representativos. No se publican cifras de latencia ni de throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. LFM3-1.7B en int4/q4f16 requiere del orden de 1-1,5 GB de memoria de pesos, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible. El repositorio esta orientado a CPU arm64 movil (Cortex-A75/A55); los artefactos fp16 estan pensados para GPU y el detector fp16 es explicitamente GPU-only.
- Cabe en GPU de consumo: no disponible como dato confirmado; por tamano, LFM3-1.7B cuantizado a 4 bits es compatible con GPUs de consumo, pero la model card no lo verifica.
- Opciones de despliegue: ONNX Runtime (CPU y GPU execution providers). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que las mediciones se hicieron en arm64 Android con 4 hilos y que los tiempos en host no son representativos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con alternativas de la misma categoria ni datos de rendimiento frente a otros modelos.

## Limitaciones y advertencias

- No se declara licencia en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar las licencias de los modelos upstream (PP-OCRv5, multilingual-e5-small, LFM3-1.7B) antes de desplegar.
- El repositorio no es un modelo original: es una coleccion de conversiones. Cualquier sesgo, alucinacion o limitacion de los modelos upstream se hereda.
- Las puertas de calidad se evaluan sobre fixtures fijos (recortes de linea y paginas), no sobre un benchmark representativo amplio; los resultados pueden no generalizar a dominios distintos.
- El detector OCR en int8 falla la paridad de cajas y texto; el detector fp16 solo es valido en GPU porque colapsa en CPU. La orientacion PP-LCNet fp16 es mas lenta que fp32 en CPU e int8 falla la paridad de volteo.
- `multilingual-e5-small` en QDQ estatico pierde paridad de coseno; debe usarse int8 dinamico.
- LFM3-1.7B en q4f16 solo alcanza coincidencia exacta de tokens de 0,80000 frente a fp32, justo en el umbral; la fidelidad frente al modelo completo es limitada.
- Las mediciones de rendimiento se tomaron en un unico perfil de hardware (arm64 Android, clase Cortex-A75/A55, 4 hilos) y no son extrapolables a otros dispositivos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- No se declaran idiomas soportados de forma oficial; la cobertura linguistica se infiere solo de los nombres de los artefactos OCR.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/omar-mohamed/device-models
- Manifest con URL, SHA-256 y tamanos: https://huggingface.co/omar-mohamed/device-models/resolve/main/manifest.json
- Artefactos (base de descarga): https://huggingface.co/omar-mohamed/device-models/resolve/main/
- `multilingual-e5-small_int8.onnx`: https://huggingface.co/omar-mohamed/device-models/resolve/main/multilingual-e5-small_int8.onnx
- `multilingual-e5-small_fp16.onnx`: https://huggingface.co/omar-mohamed/device-models/resolve/main/multilingual-e5-small_fp16.onnx
- `ocr_det_mobile_fp16.onnx`: https://huggingface.co/omar-mohamed/device-models/resolve/main/ocr_det_mobile_fp16.onnx
- `ocr_textline_ori_fp16.onnx`: https://huggingface.co/omar-mohamed/device-models/resolve/main/ocr_textline_ori_fp16.onnx
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repos de codigo ni demos adicionales.
