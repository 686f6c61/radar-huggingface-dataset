# Harsha001/Audio8-TTS-Realistic-0.6b-ROCmFPX

## Resumen

Audio8-TTS-Realistic-0.6b-ROCmFPX es una distribución en formato GGUF del modelo de síntesis de voz Edge0/Audio8-TTS-Realistic-0.6b, publicada por el usuario Harsha001 para el fork ROCmFPX de llama.cpp. Se trata de un modelo TTS multilingüe de aproximadamente 497 millones de parámetros (0,5B) que convierte texto en audio a 44,1 kHz, con soporte para 24 idiomas entre los que se incluyen chino, inglés, japonés, coreano, español, francés, alemán, árabe, hindi y cantonés, entre otros.

La relevancia de esta ficha radica en que el autor no se limita a convertir pesos: ofrece cuantizaciones propias (Q8_0, Q6_K y Q4_0 con kernels ROCmFP4) validadas numéricamente contra la implementación de referencia en PyTorch, con métricas de similitud coseno de logits y de coincidencia de selección de tokens semánticos. El runtime es C++ nativo sobre ggml, sin dependencias de Python ni PyTorch, y funciona en CPU, Vulkan (incluida la APU AMD Strix Halo) y CUDA.

El modelo se estructura en tres componentes: un modelo de texto tipo Qwen2 de 24 capas que predice el token semántico principal de cada trama de audio (21,5 tramas por segundo), un predictor de código de 4 capas que completa los 9 códigos restantes por trama, y un decodificador de audio del códec arktts que sintetiza la onda final. La licencia es Apache 2.0 tanto para el modelo base como para esta distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de texto tipo Qwen2 (24 capas) + predictor de codigo (4 capas) + decodificador de audio arktts |
| Parametros totales | 497.473.504 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_0 (ROCmFP4 para Strix Halo); mmproj en BF16 y F32 |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / ROCmFPX) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de generación de audio por tokens discretos en dos etapas. El modelo de texto, con arquitectura tipo Qwen2 de 24 capas, lee la entrada textual y predice el token semántico principal de cada trama de audio, a una tasa de 21,5 tramas por segundo de audio. Un predictor de código ligero de 4 capas, incluido en el fichero mmproj, completa los otros 9 códigos de cada trama. Finalmente, el decodificador de audio del códec arktts transforma los 10 códigos por trama en una señal PCM de 44,1 kHz. El muestreo emplea top-k 50, top-p 0,9, temperatura 0,7 y una regla RAS contra repeticiones, siguiendo la configuración de la implementación de referencia.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del autor de esta distribución se centra en la validación de la cuantización: mediante teacher forcing con los mismos códigos de entrada que la referencia en PyTorch, se comparan los logits de texto (similitud coseno) y la coincidencia de selección del token semántico principal y del predictor de código. El decodificador de audio alcanza una similitud coseno de 0,9999998 frente a PyTorch, y la salida libre de los ficheros Q8_0 y BF16 transcribe palabra por palabra con Whisper en inglés.

## Capacidades

- Síntesis de voz multilingüe a partir de texto en 24 idiomas, incluidos español, inglés, chino, japonés, coreano, árabe, hindi y cantonés.
- Generación de audio a 44,1 kHz con una duración máxima de aproximadamente 47 segundos por llamada (1024 tramas).
- Reproducibilidad determinista mediante semilla (`-s <seed>`), útil para pruebas y evaluación.
- Inferencia en CPU, Vulkan (AMD Strix Halo y otras GPU) y CUDA mediante el runtime C++ nativo ROCmFPX.
- No soporta clonación de voz a partir de una grabación de referencia en este runtime; el modelo habla con su propia voz.
- No dispone de conmutador de idioma: el idioma se selecciona escribiendo el texto en la lengua deseada.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso, por tratarse de un modelo TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo convierte texto largo en audio de alta fidelidad (44,1 kHz) por fragmentos de hasta 47 segundos, adecuado para pipelines que segmentan el texto y concatenan las salidas.
- Accesibilidad y lectura de pantalla: integración en aplicaciones de lectura que necesiten voces multilingües sin depender de servicios en la nube, gracias a la inferencia local en CPU o GPU.
- Locución para vídeo y pódcast: generación de pistas de voz en varios idiomas para contenido pregrabado, con la ventaja de la reproducibilidad por semilla para regenerar tomas idénticas.
- Asistentes de voz embebidos: despliegue en dispositivos con APU AMD Strix Halo o GPU de consumo usando la cuantización Q4_0 ROCmFP4, que reduce el modelo de texto a 0,35 GB.
- Prototipado de interfaces conversacionales: pruebas de concepto de asistentes por voz en local con el runtime C++ sin dependencias de Python, lo que simplifica el empaquetado y el despliegue.
- Generación de material educativo multilingüe: producción de audios en español, inglés, francés, alemán, árabe o hindi con un único modelo, útil para cursos y plataformas de e-learning.
- Evaluación de cuantizaciones: el repositorio incluye métricas de fidelidad frente a PyTorch, lo que permite usar estas variantes como referencia para estudiar el impacto de la cuantización en modelos TTS.

## Benchmarks y rendimiento

El autor publica una validación de fidelidad frente a la implementación de referencia en PyTorch mediante teacher forcing (frase de prueba en inglés, 113 tramas). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Modelo de texto (mmproj BF16) | Coseno de logits de texto | Aciertos de token semántico | Aciertos del predictor de código |
|---|---|---|---|
| F32 (mmproj F32) | 0,9999993 | 114 / 114 | 1010 / 1017 |
| BF16 | 0,999997 | 114 / 114 | 1008 / 1017 |
| Q8_0 | 0,99987 | 113 / 114 | 963 / 1017 |
| Q6_K_ROCMFPX | 0,99949 | 105 / 114 | 930 / 1017 |
| Q4_0_ROCMFP4_STRIX | 0,9952 | 93 / 114 | 720 / 1017 |

El decodificador de audio alcanza una similitud coseno de 0,9999998 frente a PyTorch. Whisper transcribe palabra por palabra la salida libre de todos los ficheros del repositorio en inglés (dos frases, varias semillas); otros idiomas no se han probado. La velocidad solo se ha medido en una CPU con carga, y el autor solicita datos de GPU de la comunidad.

## Requisitos de hardware

- VRAM estimada: el modelo de texto ocupa entre 0,35 GB (Q4_0) y 0,52 GB (Q8_0); el fichero mmproj (predictor de código y decodificador de audio) ocupa 0,58 GB en BF16. El total ronda 1,0-1,1 GB en BF16/Q8_0 y unos 0,93 GB en Q4_0.
- GPU recomendadas: AMD Strix Halo (objetivo principal de las variantes ROCmFP4), GPU AMD con soporte Vulkan y GPU NVIDIA con CUDA.
- Cabe en cualquier GPU de consumo moderna: con menos de 2 GB de VRAM total, es viable en iGPU, APU y tarjetas de gama baja.
- Opciones de despliegue: runtime ROCmFPX (fork de llama.cpp, commit `8a705e2f7` o posterior) con el binario `llama-tts`; requiere compilación con `-DGGML_VULKAN=ON` para Vulkan. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles; solo se indica que la velocidad se midió en una CPU con carga y que se solicitan datos de GPU a la comunidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos TTS comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas. Como referencia estructural, el modelo base Edge0/Audio8-TTS-Realistic-0.6b (Apache 2.0) es el origen de esta distribución y comparte arquitectura y parámetros; las diferencias se limitan al formato GGUF y a las cuantizaciones ROCmFPX.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b-ROCmFPX | 497 M | No disponible | Apache 2.0 | GGUF |
| Edge0/Audio8-TTS-Realistic-0.6b | 497 M (aprox.) | No disponible | Apache 2.0 | PyTorch (no confirmado) |
| Alternativas TTS de tamano similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No soporta clonación de voz en este runtime; el modelo habla únicamente con su propia voz.
- La duración máxima por llamada es de aproximadamente 47 segundos (1024 tramas), lo que obliga a segmentar textos largos.
- No hay conmutador de idioma: el idioma se determina por el texto de entrada, y la validación con Whisper solo se realizó en inglés; el resto de idiomas no se ha probado.
- Riesgo de alucinación y de artefactos acústicos en la salida libre, especialmente con cuantizaciones agresivas: la Q4_0 reduce los aciertos del predictor de código a 720/1017 frente a 1010/1017 en F32.
- Las cuantizaciones ROCmFPX requieren el fork ROCmFPX (commit `8a705e2f7` o posterior) y no son compatibles con llama.cpp estándar.
- No se documentan sesgos demográficos, acentos ni calidad por idioma; la evaluación publicada es limitada (dos frases en inglés, varias semillas).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Edge0/Audio8-TTS-Realistic-0.6b y del códec arktts.
- El rendimiento en GPU no está medido de forma pública; las cifras de latencia y throughput en producción deben validarse en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Audio8-TTS-Realistic-0.6b-ROCmFPX
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp (base del runtime): https://github.com/ggml-org/llama.cpp
- Modelo destacado del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
