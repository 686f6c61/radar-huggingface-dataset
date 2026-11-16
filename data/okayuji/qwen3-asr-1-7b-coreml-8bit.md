# okayuji/Qwen3-ASR-1.7B-CoreML-8bit

## Resumen

Qwen3-ASR-1.7B-CoreML-8bit es una conversión del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B (desarrollado originalmente por el equipo Qwen de Alibaba) a formato Core ML, empaquetado específicamente para ejecutarse sobre el Apple Neural Engine (ANE) en Macs con Apple Silicon. La publicación corre a cargo de okayuji y forma parte de la infraestructura de descarga de la aplicación KeyVoice for Mac, una utilidad de dictado en local. El repositorio incluye únicamente los pesos convertidos y cuantizados, no código de inferencia.

El paquete se compone de un codificador de audio en INT8 con entrada fija de 30 segundos y un decodificador de texto en 8 bits con caché KV con estado, más una proyección de salida separada y la tabla de embeddings en bf16. El modelo base tiene 1.700 millones de parámetros y está orientado a transcripción multilingüe de audio. La relevancia de esta ficha radica en que demuestra un pipeline completo de ASR de 1,7B parámetros ejecutándose de forma totalmente local sobre hardware de consumo Apple, con latencias de decodificación de 16 ms por token y una precisión (CER) prácticamente idéntica a la implementación oficial en PyTorch.

La licencia es Apache 2.0, heredada del modelo base, y el conjunto de archivos ocupa 4,2 GB. No obstante, el autor advierte explícitamente de que este repositorio no sirve para ejecutar reconocimiento de voz por sí solo: el preprocesado mel, el ensamblado del prompt, el bucle de decodificación y la detokenización son responsabilidad del host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (codificador de audio + decodificador de texto con caché KV con estado) |
| Parametros totales | 1.700 millones (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (decodificador por defecto) y 1024 tokens (variante de contexto largo) |
| Tipos de cuantizacion | Codificador INT8 (lineal simétrica, por canal); decodificador 8 bits por paletización k-means (256 valores por grupo de 8 canales); embeddings en bf16 |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base Qwen3-ASR es multilingüe; la model card solo muestra ejemplos en japonés e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`), más `embed_tokens.safetensors` y ficheros de tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-ASR-1.7B: un codificador de audio tipo transformer que procesa espectrogramas mel y un decodificador de texto autorregresivo. En esta conversión, el codificador se reimplementó en PyTorch para una entrada fija de 30 segundos (128 × 3000) y se verificó como bit-idéntico a la implementación oficial (máxima diferencia absoluta de 0). Después se convirtió con coremltools 9.0 a ML Program con cómputo FLOAT16 y objetivo macOS 14, y se cuantizó a pesos INT8. Un detalle técnico relevante: la operación GELU se escribió como su aproximación tanh con operaciones elementales, porque con la operación `gelu` nativa la salida en el Neural Engine divergía un 21% (L2 relativa) respecto a PyTorch; con la forma tanh el error se redujo al 1,3%.

El decodificador se convirtió con Anemll (commit `8d2791c`) en un único paquete con dos funciones, `prefill` (64 tokens por llamada) e `infer` (un token), que comparten pesos y un estado Core ML para la caché KV. La cuantización es de 8 bits por paletización k-means con 256 valores por grupo de 8 canales de salida. La proyección de salida es un paquete separado (`qwen_lm_head_lut8`) que devuelve el vocabulario en 16 porciones. Se ofrecen dos decodificadores con los mismos pesos y distinta longitud de caché (512 y 1024 posiciones). Los embeddings de tokens se copian byte a byte del checkpoint oficial en bf16 porque la búsqueda de embedding la realiza el host. No se dispone de información sobre el dataset de entrenamiento original ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) sobre el Apple Neural Engine.
- Ejecución totalmente local en Mac con Apple Silicon, sin conexión a red.
- Soporte de dos ventanas de contexto (512 y 1024 tokens) para adaptarse a locuciones cortas o largas.
- Procesamiento de audio de hasta 30 segundos por fragmento en el codificador (entrada fija 128 × 3000).
- Multilingüismo heredado del modelo base (la model card solo documenta ejemplos en japonés e inglés; el resto de idiomas no está confirmado en esta información).
- No incluye tool calling, function calling, agentes, visión ni audio más allá del ASR, según la información disponible.
- No incluye código de inferencia: el preprocesado mel, el prompt, el bucle de decodificación y la detokenización debe implementarlos el host.

## Casos de uso

- Dictado en local para aplicaciones de escritorio: es el caso de uso principal, ya que los archivos son exactamente los que descarga KeyVoice for Mac desde Ajustes → Modelos. El modelo transcribe en el dispositivo sin enviar audio a la nube.
- Transcripción de reuniones y notas de voz: con el decodificador de 1024 tokens se pueden procesar locuciones de hasta 28,2 segundos en 1,9 segundos de cómputo, lo que permite transcribir conversaciones por fragmentos de forma interactiva.
- Subtitulado y accesibilidad: la latencia de 393 ms por locución de 6,42 segundos en ejecución consecutiva hace viable generar subtítulos casi en tiempo real en una app nativa.
- Privacidad y cumplimiento normativo: al ejecutarse íntegramente en el ANE, encaja en entornos donde el audio no puede salir del dispositivo (sanidad, legal, banca).
- Investigación en ASR sobre hardware Apple: sirve como referencia prebuilt para medir el rendimiento del Neural Engine con modelos de 1,7B parámetros y comparar CER frente a la implementación oficial en PyTorch.
- Integración en pipelines propios: desarrolladores que quieran escribir su propio pipeline (mel, prompt, decode loop) pueden partir de estos paquetes Core ML en lugar de convertir el modelo desde cero con coremltools y Anemll.
- Prototipado de aplicaciones de voz en macOS 15 o superior: el requisito de Core ML state y del decodificador con caché KV con estado limita el despliegue a versiones recientes del sistema.

## Benchmarks y rendimiento

Datos medidos por el autor en un Apple M5 Max con 128 GB y macOS 27.2.1 (15 y 16 de noviembre de 2026). "App" es el pipeline Swift de KeyVoice en build Debug con `.cpuAndNeuralEngine`; "Python" es un arnés de coremltools 9.0 sobre CPU_AND_NE.

| Metrica | Valor | Contexto de medicion |
|---|---|---|
| Tiempo de decodificador por token | 16,05 ms (ctx512); 19,73 ms (ctx1024) | App |
| Locución de 6,42 s, extremo a extremo | 393 ms consecutivas; 528 ms primera tras 20 s o más de inactividad | App |
| Locución de 28,2 s, extremo a extremo | 1.916 ms consecutivas; 2.026 ms primera tras inactividad | App, decodificador ctx1024 ya cargado |
| Primera carga en una máquina | ~54 s, más ~42 s para el decodificador ctx1024 | App; incluye preparación en dispositivo para el ANE |
| Cargas posteriores | 1,2 a 1,4 s | App |
| Huella de proceso tras carga y una transcripción | 3.374 MiB (solo ctx512); 6.830 MiB (ctx512 y ctx1024) | App, `phys_footprint` |
| CER, FLEURS ja 12 + en 12 locuciones | ja 4,33% (29/670); en 1,30% (23/1.770) | Python |
| Mismo audio, PyTorch oficial | ja 4,18% (28/670); en 1,24% (22/1.770) | Implementación oficial tal cual |
| Mismo audio, PyTorch oficial con entrada rellenada a 30 s | ja 4,33% (29/670); en 1,36% (24/1.770) | Misma forma de entrada que este codificador |

El CER se calcula con NFKC, minúsculas y eliminación de puntuación y símbolos; la referencia es la transcripción cruda de FLEURS. Con 24 locuciones, una diferencia de una o dos ediciones está dentro del ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la información disponible.

## Requisitos de hardware

- Plataforma: Mac con Apple Silicon, macOS 15 o posterior (el decodificador usa Core ML state).
- Memoria: huella de proceso de 3.374 MiB con solo el decodificador ctx512 y 6.830 MiB con ambos decodificadores cargados, medido en un M5 Max de 128 GB.
- GPU/ANE recomendados: Apple Neural Engine de chips M-series; las mediciones se realizaron únicamente en un M5 Max.
- No cabe en GPU de consumo NVIDIA ni en hardware x86: es un paquete Core ML exclusivo para Apple Silicon.
- Configuración de cómputo: cargar con `MLModelConfiguration.computeUnits = .cpuAndNeuralEngine`; el autor advierte de no usar `.all`.
- Opciones de despliegue: coremltools (Python) para inspección e inferencia, o el pipeline Swift de KeyVoice. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 16,05 ms por token en ctx512 y 19,73 ms en ctx1024; 393 ms para una locución de 6,42 s y 1.916 ms para una de 28,2 s en ejecución consecutiva.
- Tamaño del repositorio: 4,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-CoreML-8bit (este) | 1,7B | 512 / 1024 tokens | Core ML, Apple Neural Engine | Apache 2.0 | Hugging Face (okayuji) |
| Qwen3-ASR-1.7B (oficial) | 1,7B | no disponible en esta información | PyTorch | Apache 2.0 | Hugging Face (Qwen) |
| Whisper large-v3 | 1,55B | 448 tokens de decodificador | PyTorch, GGUF, Core ML, etc. | MIT | Hugging Face (openai) |
| Whisper large-v3-turbo | 809M | 448 tokens de decodificador | PyTorch, GGUF, Core ML, etc. | MIT | Hugging Face (openai) |

La comparación con Whisper se ofrece como referencia de categoría (ASR de tamaño similar); no se dispone de datos de benchmarks cruzados entre Qwen3-ASR y Whisper en la información proporcionada. La ventaja específica de este paquete frente al checkpoint oficial es la ejecución nativa en el ANE con cuantización INT8/8 bits y una precisión medida casi idéntica; su limitación es la dependencia exclusiva de macOS 15 o superior y Apple Silicon.

## Limitaciones y advertencias

- No es un paquete autónomo: no incluye código de inferencia; sin preprocesado mel, prompt, bucle de decodificación y detokenización propios no produce transcripciones.
- Solo funciona en Apple Silicon con macOS 15 o posterior; no hay soporte para GPU NVIDIA, x86 ni otros aceleradores.
- El codificador tiene entrada fija de 30 segundos; audios más largos deben fragmentarse o gestionarse en el host.
- Las mediciones de rendimiento y precisión se realizaron en una única máquina (M5 Max, macOS 27.2.1); no hay datos de otras configuraciones.
- El CER se evaluó con solo 24 locuciones (12 en japonés, 12 en inglés) de FLEURS; la cobertura de idiomas y la robustez estadística son limitadas.
- La model card no documenta sesgos, tasas de alucinación ni comportamiento en idiomas distintos del japonés e inglés.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre los paquetes convertidos; conviene validar la precisión en el dominio de producción.
- El uso de `.all` como configuración de cómputo está desaconsejado por el autor; usar `.cpuAndNeuralEngine`.
- La primera carga tarda unos 54 segundos (más 42 s para ctx1024) por la preparación en dispositivo para el ANE; las cargas posteriores bajan a 1,2-1,4 s.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/okayuji/Qwen3-ASR-1.7B-CoreML-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Revisión del checkpoint base: `7278e1e70fe206f11671096ffdd38061171dd6e5`
- Anemll (herramienta de conversión): https://github.com/Anemll/Anemll
- KeyVoice for Mac: https://www.tukuru-app.com/keyvoice/en/
- coremltools: https://github.com/apple/coremltools
- Dataset FLEURS (referencia de evaluación): https://huggingface.co/datasets/google/fleurs
