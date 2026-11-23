# Harsha001/Audio8-TTS-Realistic-0.6b-ROCmFPX

## Resumen

Audio8-TTS-Realistic-0.6b-ROCmFPX es una distribucion en formato GGUF del modelo de sintesis de voz (text-to-speech) Edge0/Audio8-TTS-Realistic-0.6b, publicada por el usuario Harsha001 para el fork ROCmFPX de llama.cpp. El modelo base es un TTS multilingue de aproximadamente 497 millones de parametros que convierte texto en audio a 44,1 kHz, y esta version empaqueta los pesos en cuantizaciones de 8, 6 y 4 bits acompanadas de un fichero `mmproj` en BF16 que contiene el predictor de codigos y el decodificador de audio.

La relevancia de esta ficha radica en que permite ejecutar un modelo TTS completo sin Python ni PyTorch, sobre un runtime nativo en C++ basado en ggml. El repositorio esta optimizado explicitamente para hardware AMD (Strix Halo con Vulkan y kernels ROCm del fork), aunque el runtime tambien funciona en CPU y CUDA. Con ficheros de entre 0,35 y 0,52 GB para el modelo de texto, el consumo de memoria es muy bajo para los estandares actuales.

El modelo cubre 24 idiomas (entre ellos espanol, ingles, chino, japones, aleman, frances, portugues, arabe e hindi) y esta publicado bajo licencia Apache 2.0, lo que facilita su integracion en productos comerciales. No obstante, conviene senalar que la validacion de calidad documentada por el autor se limita a frases en ingles, y que la clonacion de voz no esta soportada en este runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (24 capas) para el modelo de texto + predictor de codigos (4 capas) + decodificador de audio arktts |
| Parametros totales | 497.473.504 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 ROCmFPX (8 bits), Q6_K ROCmFPX (6 bits, recomendada), Q4_0 ROCmFP4 STRIX (4 bits); mmproj en BF16 |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue (24 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / ROCmFPX) |

## Arquitectura y entrenamiento

El pipeline de inferencia se divide en tres componentes. El modelo de texto, con arquitectura tipo Qwen2 de 24 capas y empaquetado como GGUF convencional de llama, lee el texto de entrada y selecciona el token de habla principal de cada trama de audio, a una tasa de 21,5 tramas por segundo. El predictor de codigos, de 4 capas pequenas e incluido en el fichero `mmproj`, completa los otros 9 codigos de cada trama. Por ultimo, el decodificador de audio basado en el codec arktts transforma los 10 codigos por trama en audio PCM a 44,1 kHz.

Los parametros de muestreo siguen la referencia del modelo original: top-k 50, top-p 0,9, temperatura 0,7 y una regla RAS contra repeticiones. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La innovacion tecnica principal de esta distribucion no esta en el entrenamiento sino en la cuantizacion: los ficheros ROCmFPX incorporan escalas por tensor que requieren el fork ROCmFPX (commit `8a705e2f7` o superior) y sus kernels especificos para AMD.

## Capacidades

- Sintesis de voz multilingue en 24 idiomas, seleccionando el idioma implicitamente a partir del texto de entrada (sin conmutador de idioma).
- Generacion de hasta aproximadamente 47 segundos de audio por llamada (1024 tramas).
- Salida de audio a 44,1 kHz mediante el decodificador arktts.
- Reproducibilidad determinista del audio fijando una semilla (`-s <seed>`).
- Inferencia nativa en C++ sobre ggml, sin dependencias de Python ni PyTorch.
- Ejecucion en CPU, Vulkan (incluida AMD Strix Halo) y CUDA.
- No soporta clonacion de voz a partir de una grabacion de referencia en este runtime; el modelo habla con su propia voz.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Narracion de articulos y documentacion: el modelo puede leer texto en cualquiera de los 24 idiomas soportados y generar un WAV de hasta 47 segundos por llamada, encadenando llamadas para textos largos con una semilla fija para mantener consistencia de voz.
- Generacion de audiolibros y podcasts: con un consumo de 0,35-0,52 GB para el modelo de texto y 0,58 GB para el mmproj, se puede desplegar en un servidor modesto o incluso en un mini-PC con GPU integrada AMD, procesando capitulos por fragmentos.
- Accesibilidad y lectores de pantalla: la inferencia nativa en C++ y la ausencia de dependencias Python facilitan empaquetar el runtime dentro de aplicaciones de escritorio, reduciendo el peso del instalador frente a soluciones basadas en PyTorch.
- Localizacion de contenido audiovisual: al cubrir espanol, portugues, frances, aleman, arabe, hindi o chino, entre otros, permite generar pistas de voz para versiones dobladas de material ya escrito, sin cambiar de modelo.
- Prototipado en hardware AMD Strix Halo: la cuantizacion Q4_0 ROCmFP4 STRIX esta pensada especificamente para estas APU, lo que permite probar TTS en equipos sin GPU NVIDIA dedicada.
- Integracion en pipelines de CI/CD para pruebas de regresion de audio: la reproducibilidad con semilla y la comparacion documentada contra la referencia PyTorch (coseno de logits de 0,99949 en Q6_K) permiten detectar degradaciones en la salida de voz de forma automatizada.
- Sistemas de aviso y notificaciones por voz: la baja huella de memoria y la ejecucion en CPU permiten generar mensajes cortos en tiempo casi real en entornos con recursos limitados.

## Benchmarks y rendimiento

El autor publica una comparacion de fidelidad frente a la referencia PyTorch con teacher forcing (frase de prueba en ingles, 113 tramas). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible, ya que no aplican a un modelo TTS.

| Modelo de texto (mmproj BF16) | Coseno de logits de texto | Aciertos semanticos | Aciertos del predictor de codigos |
|---|---|---|---|
| F32 (mmproj F32) | 0,9999993 | 114 / 114 | 1010 / 1017 |
| BF16 | 0,999997 | 114 / 114 | 1008 / 1017 |
| Q8_0 | 0,99987 | 113 / 114 | 963 / 1017 |
| Q6_K ROCmFPX | 0,99949 | 105 / 114 | 930 / 1017 |
| Q4_0 ROCmFP4 STRIX | 0,9952 | 93 / 114 | 720 / 1017 |

El decodificador de audio alcanza un coseno de 0,9999998 frente a PyTorch. Whisper transcribe palabra por palabra la salida en ejecucion libre de todos los ficheros del repositorio en ingles (dos frases, varias semillas); otros idiomas no fueron probados. La velocidad solo se midio en una CPU con carga, sin cifras de GPU publicadas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,93 GB en Q6_K (0,45 GB del modelo de texto + 0,58 GB del mmproj), 1,10 GB en Q8_0 y 0,93 GB en Q4_0 STRIX.
- GPU recomendadas: AMD Strix Halo (objetivo principal de la cuantizacion Q4_0 ROCmFP4 STRIX), GPU AMD con soporte Vulkan y GPU NVIDIA con CUDA. No se especifican modelos concretos como A100, H100 o RTX 4090 en la informacion disponible.
- Cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM y tambien funciona en CPU.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (binario `llama-tts`), compilado con `-DGGML_VULKAN=ON` para Vulkan o con soporte CUDA. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que solo midio velocidad en una CPU con carga y solicita datos de la comunidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b-ROCmFPX | 497 M | no disponible | 24 | Apache 2.0 | GGUF / ROCmFPX (llama.cpp) |
| Edge0/Audio8-TTS-Realistic-0.6b (base) | 497 M | no disponible | 24 | Apache 2.0 | Pesos originales (PyTorch) |
| Otros modelos TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos TTS alternativos que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- La validacion de calidad documentada se limita al ingles; el resto de los 24 idiomas no han sido probados por el autor.
- La clonacion de voz no esta soportada en el runtime ROCmFPX; el modelo usa una voz fija propia.
- La cuantizacion Q4_0 ROCmFP4 STRIX degrada notablemente el predictor de codigos (720/1017 aciertos frente a 1010/1017 en F32), por lo que puede afectar a la naturalidad del audio.
- Los ficheros ROCmFPX requieren el fork ROCmFPX (commit `8a705e2f7` o superior); no son compatibles con llama.cpp estandar.
- Cada llamada genera como maximo unos 47 segundos de audio, lo que obliga a fragmentar textos largos.
- No hay cifras de latencia ni throughput en GPU publicadas, solo una medicion en CPU con carga.
- Riesgo de artefactos o repeticiones en la sintesis: el muestreo incorpora una regla RAS contra repeticiones, lo que sugiere que el problema existe en el modelo base.
- No se dispone de informacion sobre sesgos de voz, acentos o calidad por idioma.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime (llama.cpp es MIT).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Audio8-TTS-Realistic-0.6b-ROCmFPX
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp: https://github.com/ggml-org/llama.cpp
