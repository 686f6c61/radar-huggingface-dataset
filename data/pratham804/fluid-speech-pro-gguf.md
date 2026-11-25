# Pratham804/fluid-speech-pro-gguf

## Resumen

Fluid Speech Pro (GGUF) es una versión cuantizada y empaquetada para `parakeet.cpp` del modelo de reconocimiento automático del habla Fluid Speech Pro, desarrollado por FluidVoice Labs. El paquete lo publica el usuario Pratham804 en Hugging Face y su objetivo es permitir la transcripción de voz en C++ puro, sin dependencias de Python, tanto en CPU como en GPU, sobre Windows, Linux y macOS. El modelo base deriva de NVIDIA Parakeet TDT 0.6B v3 y de Moondream Parakeet Ultra, ambos con licencia CC BY 4.0.

Arquitectónicamente es un FastConformer con decodificador TDT (Token-and-Duration Transducer), con 627.090.582 parámetros totales y una ventana de audio procesada por segmentos de 16 kHz mono. Cubre 25 idiomas europeos, entre ellos español, inglés, alemán, francés, italiano, portugués, neerlandés, polaco y las principales lenguas eslavas y nórdicas.

Su relevancia práctica está en el empaquetado: ofrece cuantizaciones K-quant de 4, 5, 6 y 8 bits más una referencia fp32, con un archivo Q4_K de 675 MB que mantiene un WER global del 5,33 % frente al 5,09 % de fp32. Eso permite desplegar ASR multilingüe en entornos sin Python, con huella de disco reducida y latencia controlada, a costa de perder la función "clean mode" del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer); empaquetado para parakeet.cpp |
| Parametros totales | 627.090.582 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR; procesa audio en segmentos, entrada WAV 16 kHz mono) |
| Tipos de cuantizacion | Q4_K (675 MB), Q5_K (742 MB), Q6_K (813 MB), Q8_0 (941 MB), F32 (2,51 GB) |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25 idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (para parakeet.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR de tipo transducer: un encoder FastConformer (variante convolucional de Conformer con subsampling agresivo) acoplado a un decodificador TDT que predice conjuntamente tokens y duraciones, lo que evita el post-procesado de alineamientos y permite decodificación greedy eficiente. El paquete GGUF conserva el layout plano de Parakeet TDT 0.6B v3 para que el motor C++ lo ejecute directamente, y omite el bloque extra del modelo original, por lo que la función "clean mode" no está disponible.

El detalle técnico más relevante del empaquetado es cómo cuantiza parakeet.cpp: solo convierte los pesos que el motor pasa directamente a `ggml_mul_mat`, lo que afecta a 218 tensores; los otros 483 tensores se copian en F32 (unos 374 MB) porque se leen como `float*` sin pasar por esa ruta, incluyendo el extractor de características mel, la LSTM de predicción, las estadísticas de batch-norm, la cabeza CTC, los kernels convolucionales y todas las normas y sesgos. Además, `joint.pred.weight` permanece en F32 en todas las K-quant porque su dimensión principal (640) no es divisible por el superbloque de 256 elementos. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla (transcripción) en 25 idiomas europeos, con salida de texto a partir de audio WAV de 16 kHz mono.
- Decodificación greedy sin modelo de lenguaje externo, tal como se midió en la evaluación publicada.
- Ejecución nativa en C++ mediante `parakeet-cli`, sin Python ni dependencias de framework de deep learning.
- Aceleración por CPU, Vulkan y CUDA según los binarios precompilados disponibles en las releases de parakeet.cpp.
- Funcionamiento multiplataforma en Windows, Linux y macOS.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking: es exclusivamente un modelo de transcripción.

## Casos de uso

- Transcripción por lotes en servidores sin Python: se puede desplegar `parakeet-cli` con el archivo Q4_K en un contenedor mínimo y procesar directorios de WAV de 16 kHz sin instalar PyTorch ni dependencias CUDA de Python, lo que reduce la superficie de mantenimiento.
- Subtitulado multilingüe de vídeo: al cubrir 25 idiomas europeos con un único archivo de 675 MB, resulta adecuado para generar pistas de subtítulos en plataformas de contenido con audiencias en varias lenguas, usando el idioma detectado a nivel de clip.
- Aplicaciones de escritorio nativas: al compilarse como binario C++ para Windows, Linux y macOS, encaja en herramientas de dictado o toma de notas que no quieren embeber un runtime de Python y necesitan un instalador ligero.
- Procesamiento en el borde (edge) y en equipos sin GPU: el Q4_K de 675 MB cabe en memoria de sistemas modestos y se ejecuta en CPU, lo que permite transcripción local en portátiles o dispositivos industriales con requisitos de privacidad.
- Enriquecimiento de pipelines de datos: transcripción masiva de grabaciones de call center o entrevistas para análisis posterior, donde el WER global del 5,33 % en Q4_K es suficiente para indexación y búsqueda, aunque conviene validar en el dominio concreto.
- Prototipado rápido de productos de voz: la descarga de un único GGUF y una invocación de `parakeet-cli` permiten tener una línea base de ASR funcional en minutos, útil para comparar antes de invertir en un despliegue con modelo completo en fp32.

## Benchmarks y rendimiento

Evaluación publicada por el autor: 160 clips, decodificación greedy, sin LM externo. FLEURS test (20 clips por idioma) más LibriSpeech test-clean (20 clips). WER en porcentaje, menor es mejor.

| Conjunto | F32 (2509 MB) | Q4_K (675 MB) | Q2_K (550 MB, no publicado) |
|---|---:|---:|---:|
| en_us | 4,10 | 4,56 | 22,55 |
| de_de | 4,67 | 5,11 | 28,67 |
| fr_fr | 8,47 | 8,64 | 47,01 |
| es_419 | 2,30 | 2,51 | 11,48 |
| it_it | 3,45 | 3,25 | 25,15 |
| pl_pl | 9,23 | 8,62 | 59,38 |
| nl_nl | 7,17 | 8,30 | 50,45 |
| LibriSpeech test-clean | 1,59 | 1,81 | 3,85 |
| Global | 5,09 | 5,33 | 30,61 |

El Q2_K se construyó y midió pero no se publica: con 550 MB degrada el WER global al 30,61 %, con pérdidas desproporcionadas en neerlandés, polaco y francés. No se han publicado datos de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en modo CPU; en GPU, el peso del archivo Q4_K (675 MB) más los tensores F32 que se copian sin cuantizar (unos 374 MB) y el estado de ejecución sitúan el consumo en el rango de 1,5 a 2,5 GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: no disponible. Los binarios precompilados de parakeet.cpp cubren CPU, Vulkan y CUDA, por lo que cualquier GPU con soporte CUDA o Vulkan es candidata, pero no hay lista de modelos validados.
- GPU de consumo: por tamaño, cabe holgadamente en tarjetas con 4 GB o más de VRAM; no se especifican modelos concretos.
- Despliegue: `parakeet-cli` de parakeet.cpp, con binarios precompilados para Windows (CPU, Vulkan, CUDA) en la página de releases del repositorio. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Fluid Speech Pro GGUF Q4_K (este) | 627 M | 25 europeos | GGUF / parakeet.cpp (C++) | CC BY 4.0 | WER global 5,33 % en la evaluación del autor; sin clean mode |
| Fluid Speech Pro (base) | 627 M | 25 europeos | safetensors / framework Python | CC BY 4.0 | Incluye clean mode y el bloque extra; referencia fp32 |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6 B | no disponible en la información | safetensors / NeMo | CC BY 4.0 | Modelo del que deriva el layout; base declarada del paquete |
| Moondream Parakeet Ultra | no disponible | no disponible | no disponible | CC BY 4.0 | Base declarada del modelo original |

No se dispone de resultados de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El paquete GGUF no incluye el bloque extra del modelo original y no ofrece "clean mode", lo que según el autor afecta especialmente al audio con ruido.
- Solo acepta entrada WAV de 16 kHz mono; no se documenta soporte para otros formatos o frecuencias de muestreo.
- El Q2_K no se publica por su degradación severa (30,61 % de WER global); no debe intentarse reproducir esa cuantización como opción de producción.
- La cuantización Q4_K introduce una pérdida de 0,24 puntos de WER frente a fp32 en la evaluación del autor, con variación por idioma; conviene validar en el dominio propio antes de desplegar.
- La evaluación se basa en 160 clips con decodificación greedy y sin LM externo; es una muestra pequeña y no cubre audio espontáneo, acentos marcados ni condiciones de ruido.
- Riesgo de alucinación y errores de transcripción en nombres propios, términos técnicos, cifras y audio solapado; no se documentan mecanismos de mitigación.
- Licencia CC BY 4.0: permite uso comercial con atribución a "Fluid Speech Pro by FluidVoice"; es necesario conservar el crédito también respecto a NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son de noviembre de 2026; se trata de una publicación reciente y sin validación comunitaria.
- La compatibilidad depende de parakeet.cpp y de su CLI; no hay garantía de soporte en otros runtimes GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pratham804/fluid-speech-pro-gguf
- Modelo base: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Repositorio parakeet.cpp: https://github.com/mudler/parakeet.cpp
- Instrucciones de compilación de parakeet.cpp: https://github.com/mudler/parakeet.cpp#build
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Moondream Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
