# Neuratal/ntokenizer

## Resumen

NTokenizer v0.3-polished es un tokenizador BPE (Byte Pair Encoding) de nivel de byte, desarrollado de forma independiente por Neuratal, un proyecto de investigación y software liderado por Rüzgar Erdem. No es un modelo de lenguaje: es una herramienta de tokenización pensada para pipelines de entrenamiento e inferencia de modelos de lenguaje, escrita desde cero en Rust con bindings a Python mediante ctypes. Su formato nativo es `.ntok` v3 (cabecera NTOK con CRC32 y payload).

El tokenizador emplea un vocabulario de 262.144 entradas (256 tokens base de byte, 261.881 merges aprendidos y 7 tokens especiales: `<|bos|>`, `<|eos|>`, `<|pad|>`, `<|unk|>`, `<|system|>`, `<|user|>`, `<|assistant|>`). El diseño byte-level garantiza la recuperación exacta de cualquier secuencia de bytes, incluido UTF-8 inválido, de modo que `decode_bytes(encode_bytes(x)) == x` se cumple siempre. La normalización está desactivada por defecto (`Normalization::None`); NFC, NFD, NFKC y NFKD son opciones explícitas.

Su relevancia actual reside en la eficiencia de compresión: según el benchmark de desarrollo publicado por el autor, v0.3-polished reduce el número de tokens frente a o200k_base en un 26,63 % global, con mejoras del 35,0 % en turco, 33,8 % en árabe, 27,1 % en hindi, 12,4 % en español, 17,6 % en STEM, 10,2 % en programación y 6,9 % en inglés. No obstante, el propio autor advierte que la métrica B/T mide eficiencia de compresión, no calidad del modelo, y que no existe todavía una evaluación downstream con un modelo de lenguaje de 50M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level Byte Pair Encoding (BPE), tabla de merges determinista única |
| Parametros totales | no disponible (no es un modelo de lenguaje; vocabulario de 262.144 entradas) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | multilingüe (árabe, turco, hindi, inglés, coreano, español, japonés, chino, entre otros) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.ntok` v3 (cabecera NTOK + CRC32 + payload); no usa safetensors ni GGUF |

## Arquitectura y entrenamiento

NTokenizer es un BPE de nivel de byte con una única tabla de merges determinista. El vocabulario se compone de 256 tokens base de byte más 261.881 merges aprendidos y 7 tokens especiales, hasta un total de 262.144 entradas. La implementación de referencia (encoder/decoder) está escrita en Rust, con bindings a Python vía ctypes. La receta de entrenamiento fue `--pretokenizer math --min-freq 2 --min-word-freq 2 --seed 42` con vocabulario de 256K.

El corpus de entrenamiento tiene 1,96 GB y 10.555 ficheros, ensamblado exclusivamente a partir del árbol limpio auditado contra fugas de v0.2 (`data/v0.2/clean/train`). La composición por bytes es: árabe 15,0 %, turco 14,6 %, hindi 11,7 %, inglés 11,2 %, STEM 9,6 %, coreano 9,5 %, español 7,5 %, programación 7,2 %, japonés 6,9 %, chino 6,6 % y otros 0,2 %. Las fuentes incluyen proyectos Wikimedia (la mayor proporción, principalmente CC BY-SA/GFDL), arXiv con licencia CC BY 4.0 por artículo (solo 187 papers; el resto quedó en cuarentena en v0.2), Project Gutenberg (dominio público), enwikinews (CC BY, no ShareAlike), Tatoeba (CC BY 2.0 FR) y código con licencias permisivas (CPython PSF 2.0, TypeScript Apache-2.0, Go BSD-3, Rust MIT/Apache-2.0). El repositorio incluye `training_manifest.json`, que fingerprinta cada fichero de entrenamiento (ruta, bytes, sha256, fuente, licencia); no se distribuyen los corpus.

La versión v0.3-polished (2026-11-15) corrige un bug de pérdida de datos Unicode: las marcas combinantes al inicio de cadena se descartaban en la familia de pre-tokenizadores de producción (MathSymbolAware) y en el pre-tokenizador de espacios iniciales; ahora se adjuntan correctamente y hacen round-trip byte-exacto. La corrección está cubierta por una suite de regresión (30 muestras adversariales × 12 modos de pre-tokenizador; ~40 muestras × 2 modos de producción; 136/136 tests de Rust en verde). Además, el rendimiento de codificación medido es ~1,6–1,7× el de la implementación pre-polish en la misma máquina (A/B intercalado; 8,9–9,0 → 14,5–15,9 MB/s en un hilo; 44,6–50,6 → 92,3–96,6 MB/s con 8 hilos; RSS pico de codificación 415 → 360 MB), mediciones de la máquina de pruebas del proyecto, no garantías universales.

## Capacidades

- Codificación de texto a IDs de token (`encode`) y reconstrucción de texto o bytes crudos a partir de IDs (`decode`).
- Round-trip byte-exacto garantizado para cualquier secuencia de bytes, incluido UTF-8 inválido: `decode_bytes(encode_bytes(x)) == x`.
- Multilingüe con cobertura destacada en árabe, turco, hindi, inglés, coreano, español, japonés y chino, además de contenido STEM y código.
- Pre-tokenizadores especializados, incluida la familia MathSymbolAware y el modo de espacios iniciales.
- Normalización Unicode opcional y explícita (NFC, NFD, NFKC, NFKD); desactivada por defecto.
- Tokens especiales de chat y control: `<|bos|>`, `<|eos|>`, `<|pad|>`, `<|unk|>`, `<|system|>`, `<|user|>`, `<|assistant|>`.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de modelos de lenguaje multilingües: el tokenizador puede usarse como componente de tokenización en pipelines de preentrenamiento, con una compresión de tokens superior a o200k_base en 10 de las 11 categorías del benchmark del autor, lo que reduce el coste computacional por token procesado.
- Inferencia en producción con modelos que requieran un vocabulario de 262.144 entradas: al ser determinista y byte-level, garantiza la reconstrucción exacta de la salida, lo que simplifica la validación de respuestas y evita pérdidas de información en la decodificación.
- Procesamiento de corpus con mezcla de idiomas y scripts: su cobertura de árabe, turco, hindi, coreano, japonés y chino, junto con español e inglés, lo hace adecuado para pipelines que ingieren texto heterogéneo sin normalización previa.
- Tokenización de código fuente en pipelines de CI/CD: el pre-tokenizador MathSymbolAware y la reducción del 10,2 % de tokens frente a o200k_base en la categoría de programación lo hacen útil para indexar o analizar repositorios con licencias permisivas.
- Investigación en tokenización: la disponibilidad de `training_manifest.json`, la auditoría de fugas y la suite de regresión permiten reproducir y auditar el proceso de construcción del vocabulario.
- Manejo de datos binarios o texto mal formado: al garantizar el round-trip byte-exacto incluso con UTF-8 inválido, puede emplearse en pipelines que procesan logs, datos scrapeados o contenido no normalizado sin riesgo de pérdida.
- Integración en herramientas en Rust: al estar implementado en Rust con bindings a Python, puede embeberse en servicios de alto rendimiento con throughput medido de hasta 92,3–96,6 MB/s con 8 hilos en la máquina de pruebas del proyecto.

## Benchmarks y rendimiento

Benchmark de desarrollo/validación del autor (544 ficheros, 207.712.944 bytes, bytes crudos idénticos, sin normalización ni plantillas de chat). B/T = tokens por byte de entrada; mayor B/T indica mejor compresión. Conjunto de desarrollo, no un test ciego prístino.

| Tokenizador | Vocabulario | Tokens | B/T global | B/T categoría igualada | Reducción vs o200k |
|---|---:|---:|---:|---:|---:|
| NTokenizer v0.1 | 262.144 | 65.573.261 | 3,1676 | 3,1203 | −28,65 % |
| NTokenizer v0.2 | 262.144 | 42.140.674 | 4,9290 | 4,6855 | +17,32 % |
| NTokenizer v0.3-original (histórico) | 262.144 | 37.397.108 | 5,5543 | 5,1057 | +26,63 % |
| NTokenizer v0.3-polished (oficial) | 262.144 | 37.397.319 | 5,5542 | 5,1056 | +26,63 % |
| NTokenizer v0.4-fail (CJK8, archivado) | 262.144 | 37.418.652 | 5,5511 | 5,1031 | +26,59 % |
| NTokenizer v0.4-fail (Han4, archivado) | 262.144 | 37.406.269 | 5,5529 | 5,1081 | +26,61 % |
| o200k_base | 200.019 | 50.971.306 | 4,0751 | 4,0899 | 0,00 % |
| Qwen2.5-7B-Instruct tokenizer | 151.665 | 62.266.982 | 3,3358 | 3,3236 | −22,16 % |
| Gemini 3.8 Flash | n/a | no medido | — | — | — |

NTokenizer v0.3-polished gana 10 de 11 categorías frente a o200k_base y frente al tokenizador de Qwen2.5-7B-Instruct (en ambos casos pierde solo la categoría `other_languages`, de 0,16 MB). Reducciones frente a o200k_base: turco +35,0 %, árabe +33,8 %, hindi +27,1 %, español +12,4 %, STEM +17,6 %, programación +10,2 %, inglés +6,9 %. Gemini 3.8 Flash no se midió: no había credencial de API de Gemini disponible en el entorno y no se sustituyó por una estimación.

## Requisitos de hardware

- No aplica VRAM para inferencia de modelo: al ser un tokenizador, no requiere GPU para funcionar.
- El encoder/decoder de referencia en Rust se ejecuta en CPU; el RSS pico de codificación medido es de 360 MB en la máquina de pruebas del proyecto.
- Throughput medido en la máquina de pruebas del proyecto: 14,5–15,9 MB/s en un hilo y 92,3–96,6 MB/s con 8 hilos.
- No se especifican GPU recomendadas ni latencias por token, ya que no es un modelo generativo.
- Opciones de despliegue: biblioteca Rust con bindings a Python vía ctypes; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | B/T global (benchmark del autor) | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| NTokenizer v0.3-polished | 262.144 | 5,5542 | CC BY-SA 4.0 | Hugging Face y GitHub de Neuratal |
| o200k_base | 200.019 | 4,0751 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Qwen2.5-7B-Instruct tokenizer | 151.665 | 3,3358 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Gemini 3.8 Flash | n/a | no medido | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Su uso previsto es exclusivamente la tokenización.
- El benchmark publicado es un conjunto de desarrollo/validación del propio autor, no un test ciego prístino; los resultados deben interpretarse con cautela.
- La métrica B/T mide eficiencia de compresión, no calidad del modelo. No existe evaluación downstream con un modelo de lenguaje de 50M, por lo que no puede leerse como prueba de superioridad en tareas finales.
- El corpus de entrenamiento está compuesto mayoritariamente por fuentes Wikimedia con licencias CC BY-SA/GFDL; la licencia del tokenizador es CC BY-SA 4.0, lo que puede condicionar su uso comercial y obliga a compartir obras derivadas bajo la misma licencia.
- La normalización está desactivada por defecto; activar NFC, NFD, NFKC o NFKD puede alterar los bytes por diseño y romper el round-trip byte-exacto.
- Aunque v0.3-polished corrige el bug de pérdida de marcas combinantes al inicio de cadena, se trata de una corrección reciente (2026-11-15) con cobertura de regresión limitada a las muestras documentadas.
- Las mediciones de throughput y memoria proceden de la máquina de pruebas del proyecto y no son garantías universales.
- No hay dominios verificados de la organización publicados; el autor advierte que no se confíe en dominios de imitación no verificados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere una adopción todavía nula.

## Enlaces

- Hugging Face: https://huggingface.co/Neuratal/ntokenizer
- Repositorio GitHub (Rust + bindings Python): https://github.com/Neuratal/neuratal-tokenizer
- Release v0.3.0: https://github.com/Neuratal/neuratal-tokenizer/releases/tag/v0.3.0
- Informe de comparativa pública: https://github.com/Neuratal/neuratal-tokenizer/blob/master/reports/public-benchmark/COMPARISON_REPORT.md
