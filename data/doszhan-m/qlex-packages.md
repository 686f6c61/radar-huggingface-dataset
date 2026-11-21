# Doszhan-M/qlex-packages

## Resumen

Qlex packages es un repositorio de paquetes de idioma para Qlex, una aplicación de traducción en pantalla y sin conexión orientada a videojuegos. No se trata de un único modelo entrenado desde cero, sino de una distribución empaquetada que combina varios componentes: modelos de traducción OPUS-MT de Helsinki-NLP convertidos a CTranslate2 en int8, el modelo Gemma 4 E2B en formato GGUF Q4_0 QAT para traducción a chino, japonés y coreano, binarios de llama.cpp para la inferencia local, modelos de reconocimiento de texto PP-OCRv5 de PaddleOCR en ONNX y diccionarios de inglés derivados de Wiktionary. El repositorio suma 4.628.569.635 parámetros y ocupa 8,1 GB.

El paquete resuelve el problema de la traducción de texto en pantalla en tiempo real sin dependencia de servicios en la nube, verificando cada archivo mediante sumas SHA-256 declaradas en un `catalog.json`. La aplicación descarga los paquetes según el idioma que elige el usuario, de modo que el repositorio actúa como catálogo de artefactos más que como un modelo monolítico.

Es relevante por su enfoque de despliegue: mezcla modelos compactos de traducción neuronal (OPUS-MT), un modelo generativo de Google (Gemma 4 E2B) para idiomas sin par directo en OPUS-MT, OCR ligero y diccionarios léxicos, todo empaquetado para ejecución local en el dispositivo del usuario. La licencia es compuesta (CC BY 4.0 y CC BY-SA 4.0), con componentes individuales bajo Apache 2.0 y MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Composición de varios modelos: OPUS-MT (transformer encoder-decoder) convertidos a CTranslate2, Gemma 4 E2B (transformer decoder-only), PP-OCRv5 (CNN/rec) y llama.cpp como motor de inferencia |
| Parámetros totales | 4.628.569.635 (suma del repositorio) |
| Parámetros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (CTranslate2 para OPUS-MT); Q4_0 QAT GGUF (Gemma 4 E2B); ONNX (PP-OCRv5) |
| Idiomas soportados | en, es, pt, tr, ru, uk, fr, it, pl, de, zh, ja, ko |
| Licencia | cc-by-4.0-and-cc-by-sa-4.0 (compuesta; cada componente con su propia licencia) |
| Formato de pesos | CTranslate2, GGUF, ONNX, safetensors (parámetros declarados) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo propio: agrupa artefactos de terceros. Los modelos `opus-*` son OPUS-MT de Helsinki-NLP, convertidos a CTranslate2 en int8, y cubren pares de traducción entre los idiomas listados. Los modelos `gemma4-e2b-qat-*` corresponden a Gemma 4 E2B de Google en su build Q4_0 QAT GGUF sin modificar, y se emplean para traducción a chino, japonés y coreano. Los binarios `llama-*` son `llama-server` y sus librerías de llama.cpp en builds de release sin modificar. Los modelos `ocr-*` son PP-OCRv5 (rec, mobile) de PaddleOCR en formato ONNX preparado por RapidOCR. Los diccionarios `dict-*` se construyen a partir de volcados de Wiktionary procesados por kaikki.org (wiktextract), con frases comunes ausentes traducidas mediante Gemma 4 E2B y marcadas como traducción automática.

No se dispone de información sobre el número de tokens de entrenamiento, la composición de los datasets ni si hubo etapas de RLHF o DPO, ya que se trata de modelos preexistentes reempaquetados. La innovación técnica del paquete reside en la orquestación: selección de modelo según idioma, verificación de integridad por SHA-256, y combinación de traducción neuronal, OCR y diccionario léxico en un flujo local.

## Capacidades

- Traducción de texto entre inglés y los idiomas listados (es, pt, tr, ru, uk, fr, it, pl, de) mediante OPUS-MT.
- Traducción a chino, japonés y coreano mediante Gemma 4 E2B en GGUF Q4_0.
- Reconocimiento de texto en pantalla (OCR) con PP-OCRv5 para juegos en idiomas distintos del inglés.
- Traducción intermedia al inglés para idiomas de juego no ingleses.
- Consulta de diccionario de inglés construido desde Wiktionary, con frases comunes traducidas automáticamente.
- Inferencia local sin conexión mediante llama.cpp.
- Verificación de integridad de paquetes mediante sumas SHA-256.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: 13 idiomas declarados.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Traducción en pantalla de videojuegos sin conexión: la aplicación captura el texto del juego, lo reconoce con PP-OCRv5 y lo traduce con OPUS-MT o Gemma 4 E2B según el idioma, todo en local sin enviar datos a la nube.
- Traducción de juegos en idiomas no ingleses: cuando el juego está en un idioma distinto del inglés, el paquete añade un modelo OCR y un modelo que traduce ese texto al inglés antes de la traducción final.
- Distribución de paquetes por idioma: la aplicación descarga solo el paquete del idioma elegido y valida su integridad con SHA-256, lo que reduce el consumo de almacenamiento y ancho de banda en el dispositivo.
- Consulta léxica integrada: el diccionario derivado de Wiktionary permite al usuario consultar definiciones y frases comunes mientras juega, con marcado explícito de las entradas traducidas automáticamente.
- Traducción de contenido a chino, japonés y coreano: al no cubrir OPUS-MT estos pares, Gemma 4 E2B en Q4_0 QAT proporciona traducción generativa con un tamaño manejable para ejecución local.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse íntegramente en el dispositivo con llama.cpp y CTranslate2, el paquete es adecuado para usuarios que no pueden enviar texto de pantalla a servicios externos.
- Integración en pipelines de traducción local: los modelos OPUS-MT en CTranslate2 y los binarios de llama.cpp pueden reutilizarse en otras aplicaciones de escritorio que necesiten traducción offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del componente cargado. Gemma 4 E2B en Q4_0 QAT GGUF requiere un tamaño de modelo reducido, mientras que los OPUS-MT en int8 son mucho más ligeros.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el uso de llama.cpp y CTranslate2 permite ejecución en CPU y en GPU de consumo, pero no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (binarios `llama-server` incluidos), CTranslate2 para OPUS-MT, ONNX Runtime para PP-OCRv5.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qlex packages | 4.628.569.635 (agregado) | no disponible | 13 | CC BY 4.0 + CC BY-SA 4.0 | CTranslate2, GGUF, ONNX |
| OPUS-MT (Helsinki-NLP) | no disponible | no disponible | por par | CC BY 4.0 | CTranslate2, safetensors |
| Gemma 4 E2B (Google) | no disponible | no disponible | multilingüe | Apache 2.0 | GGUF, safetensors |
| NLLB-200 (Meta) | no disponible | no disponible | 200 | CC BY-NC 4.0 | safetensors |

La comparativa es limitada porque Qlex packages es una distribución compuesta y no un modelo único. OPUS-MT y Gemma 4 E2B son componentes internos del paquete, por lo que la comparación directa se refiere a los modelos base que integra.

## Limitaciones y advertencias

- No es un modelo único: el rendimiento depende del componente concreto que se ejecute, y las métricas agregadas no son representativas.
- Licencia compuesta: conviven CC BY 4.0 (OPUS-MT), CC BY-SA 4.0 (diccionarios), Apache 2.0 (Gemma 4 E2B, PP-OCRv5) y MIT (llama.cpp); el uso comercial debe revisarse componente a componente.
- Los diccionarios incluyen entradas traducidas automáticamente con Gemma 4 E2B, marcadas como tal, lo que puede introducir errores en frases comunes.
- Riesgo de alucinación en las traducciones generadas por Gemma 4 E2B, especialmente en textos de juego con jerga o contexto limitado.
- Cobertura de idiomas limitada a los 13 declarados; no hay información sobre calidad por par de idiomas.
- No se dispone de datos sobre contexto máximo, sesgos conocidos ni latencia, lo que dificulta la planificación de producción.
- La verificación SHA-256 protege la integridad de los archivos, pero no garantiza la calidad de las traducciones.
- El repositorio tiene 0 likes y fechas de creación y actualización en 2026, lo que sugiere un proyecto reciente con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Doszhan-M/qlex-packages
- OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Tatoeba-Challenge
- Gemma 4 E2B: https://huggingface.co/google/gemma-4-E2B-it
- Gemma 4 E2B QAT GGUF: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- RapidOCR: https://github.com/RapidAI/RapidOCR
- Wiktionary: https://www.wiktionary.org
- kaikki.org: https://kaikki.org
