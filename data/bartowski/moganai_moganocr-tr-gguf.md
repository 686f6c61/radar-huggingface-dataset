# bartowski/moganai_MoganOCR-TR-GGUF

## Resumen
MoganOCR-TR es un modelo de visión-lenguaje (VLM) de 2B parámetros especializado en OCR y comprensión de documentos, desarrollado por el equipo moganai. Su función principal es convertir imágenes de documentos en Markdown estructurado, con soporte nativo para turco e inglés. Resuelve el problema del parseo de documentos en entornos donde el turco es idioma principal, un nicho poco cubierto por los modelos OCR multimodales genéricos, que suelen estar optimizados para inglés o chino.

Esta ficha describe la versión cuantizada publicada por bartowski, que convierte los pesos originales a formato GGUF mediante llama.cpp (release b12180) con calibración imatrix. El modelo base cuenta con 1.881.825.088 parámetros (aproximadamente 2B), lo que lo sitúa en el rango de modelos que caben holgadamente en GPUs de consumo. La cuantización Q4_K_M ocupa solo 1,24 GB, lo que facilita el despliegue en portátiles y estaciones de trabajo sin aceleradores dedicados de gama alta.

La relevancia actual del modelo radica en su combinación de tamaño reducido, licencia Apache 2.0 y especialización documental con soporte de turco, lo que lo hace adecuado para pipelines de digitalización de archivos, facturas y formularios en organizaciones turcohablantes. Al estar en formato GGUF, se integra directamente con llama.cpp, Ollama y otras herramientas del ecosistema, sin necesidad de infraestructura de inferencia propietaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (image-text-to-text); detalles internos del transformer no disponibles |
| Parametros totales | 1.881.825.088 (~2B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, IQ4_NL, Q4_K_M, Q4_0, Q4_K_S, IQ4_XS, IQ3_M (y otras de menor tamano en el repo) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base original en safetensors |

## Arquitectura y entrenamiento
El modelo base MoganOCR-TR es un VLM con pipeline image-text-to-text, es decir, un transformer multimodal que acepta texto e imágenes como entrada y genera texto. En la versión GGUF, el procesamiento visual requiere un archivo `mmproj` adicional, segun indica la model card. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion de bartowski emplea llama.cpp b12180 con calibracion imatrix, lo que mejora la fidelidad de los pesos cuantizados respecto a la cuantizacion sin calibracion. No se menciona decodificacion especulativa (la model card indica explicitamente "Speculative decoding: no"). El formato de prompt sigue la convencion ChatML con etiquetas `<|im_start|>` y `<|im_end|>`, e incluye soporte de definiciones de herramientas mediante bloques `<tools>` y `<tool_call>`.

## Capacidades
- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, con salida en Markdown estructurado.
- Comprension y parseo de documentos (document-understanding, document-parsing): tablas, listas y estructura de secciones.
- Procesamiento multimodal de imagen y texto en una sola llamada (image-text-to-text).
- Soporte bilingue turco-ingles, con enfasis en documentos en turco.
- Soporte de tool calling / function calling mediante el formato XML descrito en la model card.
- Generacion conversacional multi-turno segun el formato ChatML.
- Capacidad de razonamiento explicito mediante el bloque `<think>` en el prompt de asistente (thinking mode).
- No se documentan capacidades de audio ni de video.

## Casos de uso
- Digitalizacion de facturas y albaranes en turco: el modelo convierte la imagen del documento en Markdown con campos y tablas, lo que permite extraer importes y fechas con un post-procesado ligero sobre la salida estructurada.
- Parseo de formularios administrativos turcos: adecuado para organismos y empresas que gestionan documentacion en turco y necesitan texto plano indexable sin depender de APIs externas.
- Archivado y busqueda documental: al generar Markdown, la salida se puede indexar directamente en motores de busqueda o bases vectoriales para recuperacion posterior.
- Extraccion de tablas de informes financieros: la salida en Markdown preserva la estructura tabular, lo que simplifica su conversion a CSV o JSON en pipelines de datos.
- Despliegue en local para privacidad: con cuantizaciones de 1,24 GB (Q4_K_M), el modelo se ejecuta en portatiles sin GPU dedicada, lo que permite procesar documentos sensibles sin enviarlos a la nube.
- Preprocesado en pipelines RAG: conversion de PDFs escaneados e imagenes a Markdown antes de la fragmentacion y la indexacion, con un coste computacional bajo por pagina.
- Automatizacion de atencion al cliente documental: integrado como herramienta invocable (tool calling) en un agente que recibe imagenes de recibos o justificantes enviados por usuarios turcohablantes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,3 GB con Q4_K_M (1,24 GB de pesos mas overhead de contexto y del proyector visual); aproximadamente 2,1 GB con Q8_0 (2,02 GB) y aproximadamente 3,9 GB con bf16 (3,78 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; para cuantizaciones Q4 basta con 2 GB, por lo que una GTX 1650, RTX 3050 o incluso iGPU con memoria unificada son suficientes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas, incluidas las de gama de entrada, gracias al tamano reducido del modelo.
- Opciones de despliegue: llama.cpp (version b12180 o superior), Ollama, y cualquier runtime compatible con GGUF que soporte modelos multimodales con archivo `mmproj`. El tag `endpoints_compatible` del repo sugiere compatibilidad con endpoints de inferencia tipo Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MoganOCR-TR (esta ficha) | ~2B | no disponible | tr, en | Apache 2.0 | GGUF, safetensors |
| Modelos OCR multimodales genericos de ~2B | ~2B | no disponible | principalmente en, zh | variable | variable |
| Modelos OCR de mayor tamano (7B+) | 7B o mas | no disponible | variable | variable | variable |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas concretas en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible. La ventaja diferencial de este modelo es el soporte nativo de turco en un tamano de 2B con licencia Apache 2.0.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado principalmente con documentos en turco e ingles, el rendimiento en otros idiomas es incierto.
- Riesgo de alucinacion: como todo VLM generativo, puede inventar texto o estructuras en documentos con baja calidad de escaneo, ruido o tipografias inusuales; se recomienda validacion posterior en produccion.
- Limitaciones de contexto e idioma: solo se declaran turco e ingles; la longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de documentos muy extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (moganai/MoganOCR-TR) y de los datos de entrenamiento, no detalladas aqui.
- Dependencia del archivo `mmproj`: la funcionalidad multimodal requiere descargar y configurar correctamente el proyector visual; sin el, el modelo solo procesa texto.
- Cuantizaciones de baja precision (IQ3_M y menores) pueden degradar la fidelidad del OCR en documentos densos; para produccion se recomienda Q4_K_M o superior.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en produccion.

## Enlaces
- Repositorio GGUF: https://huggingface.co/bartowski/moganai_MoganOCR-TR-GGUF
- Modelo base: https://huggingface.co/moganai/MoganOCR-TR
- Perfil del cuantizador: https://huggingface.co/bartowski
- llama.cpp (release usado para la cuantizacion): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
