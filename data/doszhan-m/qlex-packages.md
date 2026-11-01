# Doszhan-M/qlex-packages

## Resumen

Qlex-packages no es un modelo único, sino un repositorio de paquetes de idioma para Qlex, un traductor de pantalla offline orientado a videojuegos. Cada paquete combina un modelo de traducción, un diccionario y, en su caso, un modelo de reconocimiento de texto (OCR) y un traductor intermedio hacia el inglés. El autor del repositorio es Doszhan-M, y los componentes internos provienen de proyectos de terceros: OPUS-MT de Helsinki-NLP, Gemma 4 E2B de Google, PP-OCRv5 de PaddleOCR/RapidOCR y diccionarios derivados de Wiktionary mediante wiktextract.

El propósito es permitir la traducción en tiempo real de texto en pantalla sin conexión a Internet, descargando el paquete correspondiente al idioma seleccionado y verificando su integridad mediante sumas SHA-256 registradas en `catalog.json`. El repositorio incluye pesos en formatos ONNX, GGUF y CTranslate2, con un total declarado de 4.628.569.635 parámetros en safetensors y un tamaño de 7,8 GB.

Su relevancia radica en el enfoque de empaquetado reproducible y verificable para traducción offline multilingüe, cubriendo trece idiomas (en, es, pt, tr, ru, uk, fr, it, pl, de, zh, ja, ko). No obstante, la ficha debe leerse como una descripción del conjunto de paquetes, no de un modelo transformer monolítico con arquitectura propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: OPUS-MT (transformer seq2seq) convertido a CTranslate2 int8, Gemma 4 E2B (QAT Q4_0 GGUF), PP-OCRv5 mobile (ONNX) y diccionarios Wiktionary |
| Parámetros totales | 4.628.569.635 (dato agregado del repositorio en safetensors) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (CTranslate2), Q4_0 QAT (GGUF Gemma 4 E2B), ONNX (PP-OCRv5) |
| Idiomas soportados | en, es, pt, tr, ru, uk, fr, it, pl, de, zh, ja, ko |
| Licencia | cc-by-4.0-and-cc-by-sa-4.0 (con componentes Apache 2.0 y MIT; ver LICENSE por paquete) |
| Formato de pesos | safetensors, GGUF, ONNX, CTranslate2 |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo propio: agrega artefactos de inferencia de terceros. Los paquetes `opus-*` contienen modelos OPUS-MT de Helsinki-NLP convertidos a CTranslate2 en int8, pensados para traducción neuronal seq2seq de bajo coste computacional. Los paquetes `gemma4-e2b-qat-*` incluyen el build Q4_0 QAT GGUF de Gemma 4 E2B de Google, sin modificaciones, empleado para traducción a chino, japonés y coreano. Los paquetes `llama-*` incorporan binarios y librerías de `llama-server` de llama.cpp sin modificar, para ejecutar los GGUF. Los paquetes `ocr-*` incluyen modelos PP-OCRv5 (rec, mobile) de PaddleOCR en formato ONNX exportados por RapidOCR, sin modificar, para reconocer texto en juegos en idiomas distintos del inglés. Los paquetes `dict-*` contienen diccionarios de inglés construidos a partir de volcados de Wiktionary procesados por kaikki.org (wiktextract).

No se dispone de información sobre datos de entrenamiento propios, número de tokens, composición del dataset ni procesos de RLHF/DPO, ya que el autor no entrena modelos. La innovación técnica del repositorio es logística: descarga bajo demanda, verificación por SHA-256 en `catalog.json` y empaquetado autocontenido con su propia licencia en cada carpeta.

## Capacidades

- Traducción automática offline entre inglés y los idiomas cubiertos, mediante OPUS-MT (CTranslate2 int8).
- Traducción hacia chino, japonés y coreano mediante Gemma 4 E2B QAT Q4_0 GGUF.
- Reconocimiento de texto en pantalla (OCR) para juegos en idiomas distintos del inglés mediante PP-OCRv5 mobile en ONNX.
- Traducción en cadena: OCR del idioma de origen, traducción intermedia al inglés y traducción al idioma destino.
- Consulta de diccionarios de inglés derivados de Wiktionary.
- Ejecución local sin conexión una vez descargados los paquetes.
- Verificación de integridad de los archivos mediante SHA-256.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Traducción de texto en pantalla de videojuegos sin conexión: el paquete del idioma seleccionado incluye el modelo OPUS-MT en CTranslate2 int8, adecuado para inferencia en CPU con latencia baja en fragmentos cortos de diálogo.
- Localización de juegos no traducidos al español: el usuario selecciona español y Qlex descarga el paquete correspondiente, usando OCR para capturar el texto y el traductor para renderizarlo.
- Juegos en japonés, chino o coreano: se emplea el paquete Gemma 4 E2B QAT Q4_0 GGUF, que cubre idiomas con peor cobertura en OPUS-MT de pequeño tamaño.
- Despliegue en equipos sin GPU dedicada: los modelos CTranslate2 int8 y ONNX están pensados para ejecución en CPU, lo que encaja con equipos de jugadores sin acelerador.
- Entornos con conectividad limitada o requisitos de privacidad: al ser offline, el texto de pantalla no sale del equipo una vez descargados los paquetes.
- Integración en pipelines de traducción asistida: los diccionarios Wiktionary y los modelos OPUS-MT pueden reutilizarse por separado en herramientas de consulta o preprocesado.
- Verificación de integridad en distribución de artefactos: el esquema de `catalog.json` con SHA-256 sirve como referencia para distribuir modelos a clientes finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; depende del paquete. Los modelos OPUS-MT en CTranslate2 int8 y PP-OCRv5 ONNX están orientados a CPU. Gemma 4 E2B QAT Q4_0 GGUF requiere memoria suficiente para un modelo de aproximadamente 2 mil millones de parámetros en Q4_0 (estimación no confirmada en la información disponible).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el diseño apunta a ejecución en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, incluido en los paquetes `llama-*`), CTranslate2, ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qlex-packages (este repo) | 4.628.569.635 agregados | no disponible | Paquetes de traducción offline para juegos (OPUS-MT, Gemma 4 E2B, OCR, diccionarios) | cc-by-4.0-and-cc-by-sa-4.0, con componentes Apache 2.0 y MIT | HuggingFace, 496 descargas |
| OPUS-MT (Helsinki-NLP) | variable por par de idiomas | no disponible | Traducción neuronal seq2seq | CC BY 4.0 | HuggingFace |
| Gemma 4 E2B (Google) | ~2B (E2B) | no disponible | LLM multimodal ligero | Apache 2.0 | HuggingFace |
| PP-OCRv5 (PaddleOCR) | no disponible | no aplica | OCR | Apache 2.0 | GitHub, HuggingFace |

La comparativa es aproximada: Qlex-packages agrega componentes de los tres proyectos citados, por lo que no compite directamente con un único modelo.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: la calidad depende de los componentes de terceros (OPUS-MT, Gemma 4 E2B, PP-OCRv5).
- Los modelos OPUS-MT de pequeño tamaño pueden presentar traducciones literales o erróneas en frases largas o con jerga de videojuegos.
- El OCR en pantalla es sensible a fuentes estilizadas, fondos complejos y resoluciones bajas.
- La traducción en cadena (idioma de origen a inglés y de inglés a destino) acumula errores.
- Riesgo de alucinación en el componente Gemma 4 E2B al traducir texto ambiguo o muy corto.
- No se documentan sesgos específicos, pero los modelos subyacentes pueden reflejar sesgos de sus datos de entrenamiento.
- Licencia compuesta: el repositorio declara cc-by-4.0-and-cc-by-sa-4.0, pero cada paquete incluye su propia licencia (Apache 2.0, MIT, CC BY 4.0, CC BY-SA 4.0). Es obligatorio revisar la licencia de cada componente antes de uso comercial o redistribución.
- Los diccionarios derivados de Wiktionary están bajo CC BY-SA 4.0, lo que impone condiciones de compartir igual.
- No se dispone de información sobre contexto máximo, latencia ni rendimiento medido.
- El repositorio tiene 0 likes y 496 descargas; la validación comunitaria es limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Doszhan-M/qlex-packages
- OPUS-MT / Tatoeba-Challenge (Helsinki-NLP): https://github.com/Helsinki-NLP/Tatoeba-Challenge
- Gemma 4 E2B IT: https://huggingface.co/google/gemma-4-E2B-it
- Gemma 4 E2B IT QAT Q4_0 GGUF: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- RapidOCR: https://github.com/RapidAI/RapidOCR
- Wiktionary: https://www.wiktionary.org
- kaikki.org (wiktextract): https://kaikki.org
