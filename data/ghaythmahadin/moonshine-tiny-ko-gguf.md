# GhaythMahadin/moonshine-tiny-ko-gguf

## Resumen

moonshine-tiny-ko-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-ko, un modelo de la suite "Flavors of Moonshine" desarrollada por Moonshine AI (anteriormente Useful Sensors). El modelo original es un ajuste fino de moonshine-tiny especializado en coreano, con arquitectura encoder-decoder transformer de 27.092.736 parámetros y orientado a dispositivos con recursos limitados (edge devices). Esta conversión, publicada por GhaythMahadin, permite ejecutar el modelo mediante transcribe.cpp, una implementación en C++ pensada para inferencia ligera.

El modelo consume audio PCM crudo a 16 kHz directamente, sin STFT ni banco de filtros mel, mediante un stem de tres capas Conv1d, y produce únicamente la transcripción. Es monolingüe (coreano), no traduce, no detecta idioma y no genera marcas de tiempo. Su relevancia radica en ofrecer ASR coreano de bajo coste computacional con licencia MIT, empaquetado en cuantizaciones de 34 a 105 MB, lo que lo hace desplegable en hardware muy modesto.

La ficha describe tanto la conversión GGUF como el modelo base, con los datos de rendimiento publicados por el autor de la conversión (CER sobre FLEURS-ko) y las especificaciones heredadas de la model card original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine tiny), stem Conv1d de 3 capas, sin STFT ni mel filterbank |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de audio a 16 kHz; decodificación con max_length=192) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Coreano (ko) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (conversión); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine tiny: un transformer encoder-decoder que procesa audio PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, evitando el preprocesado clásico de STFT y banco de filtros mel empleado por Whisper. Esta decisión reduce la latencia y el coste computacional en dispositivos con recursos limitados. La salida es exclusivamente texto transcrito, sin marcas de tiempo, detección de idioma ni traducción.

El modelo base es un ajuste fino de Moonshine tiny sobre coreano, parte de la suite "Flavors of Moonshine" orientada a lenguas infrarrepresentadas. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión GGUF se realizó desde el commit upstream 80995f0, fijado el 2026-05-12, y se validó frente a la referencia de Transformers en el commit 90bf720 de transcribe.cpp el 2026-05-12. La decodificación por defecto es greedy (num_beams=1, max_length=192), coincidiendo con la generation_config original.

## Capacidades

- Reconocimiento automático del habla en coreano a partir de audio PCM mono a 16 kHz.
- Procesamiento directo de forma de onda sin preprocesado STFT ni mel filterbank.
- Transcripción de salida únicamente texto, sin marcas de tiempo.
- Sin soporte de traducción.
- Sin detección automática de idioma.
- Sin soporte de streaming (streaming: false en la configuración de transcribe.cpp).
- Sin tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades de visión ni audio más allá de la transcripción.
- Monolingüe: no cubre otros idiomas distintos del coreano.

## Casos de uso

- Transcripción de notas de voz en coreano: el modelo convierte audio PCM a 16 kHz en texto con un CER del 8,97 % en FLEURS-ko, adecuado para dictado y notas personales en aplicaciones móviles o de escritorio.
- Subtitulado offline de contenido en coreano: al ejecutarse en CPU con transcribe.cpp y cuantización Q8_0 (34 MB), permite generar transcripciones en equipos sin GPU, aunque sin marcas de tiempo.
- Asistentes de voz embebidos en coreano: el bajo número de parámetros (27 M) y el tamaño reducido del GGUF lo hacen viable en dispositivos edge con memoria limitada.
- Indexación y búsqueda de archivos de audio en coreano: la transcripción permite construir índices de texto sobre grabaciones para búsqueda posterior.
- Preprocesado de datasets de audio en coreano: útil para generar transcripciones automáticas de corpus y acelerar anotaciones, con la salvedad de que el CER debe validarse según el dominio.
- Aplicaciones de accesibilidad en coreano: transcripción en tiempo casi real en hardware modesto (RTF de 45,5 en CPU Ryzen 4750U y 127 en Metal sobre M4 Max) para personas con dificultades auditivas en entornos controlados.
- Prototipado y pruebas de pipelines ASR: la licencia MIT y el tamaño reducido facilitan la integración en entornos de desarrollo y CI sin coste de licencia.

## Benchmarks y rendimiento

CER sobre el split de test de FLEURS-ko (382 enunciados), decodificación greedy con num_beams=1 y max_length=192:

| Cuantizacion | Tamano | CER (FLEURS ko test) |
|---|---:|---:|
| F32 | 105 MB | 8,97 % |
| F16 | 57 MB | 8,97 % |
| Q8_0 | 34 MB | 8,98 % |
| Referencia Transformers F32 (MPS) | No disponible | 8,99 % |

Rendimiento en tiempo real (RTF) medido por el autor de la conversión:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

El autor indica que las cifras F32 y F16 en C++ coinciden con la referencia de Transformers dentro del ruido del intervalo de confianza bootstrap, y que Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16. No se publican resultados comparativos con Whisper Tiny en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el GGUF Q8_0 ocupa 34 MB y el F32 105 MB, por lo que la memoria necesaria es mínima.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPUs integradas. Se ha validado en Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan y CPU).
- Cabe en cualquier GPU de consumo, incluida la gama más baja, y en dispositivos edge; también se ejecuta íntegramente en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y binario transcribe-cli), además del modelo base en Transformers mediante MoonshineForConditionalGeneration. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 127 (Metal, M4 Max), 153,5 (CPU, M4 Max), 56 (Vulkan, Ryzen 4750U) y 45,5 (CPU, Ryzen 4750U). El audio debe convertirse previamente a WAV mono a 16 kHz (por ejemplo, con ffmpeg).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | Licencia | Formato | CER FLEURS-ko |
|---|---:|---|---|---|---|---:|
| moonshine-tiny-ko-gguf | 27,09 M | Coreano | Audio 16 kHz, max_length 192 | MIT | GGUF | 8,97 % (F32/F16), 8,98 % (Q8_0) |
| UsefulSensors/moonshine-tiny-ko (base) | 27,09 M | Coreano | Audio 16 kHz | MIT | Safetensors | 8,99 % (referencia Transformers F32) |
| Whisper Tiny | No disponible en la información | Multilingüe | Audio 16 kHz | No disponible en la información | No disponible en la información | No disponible |

La model card original afirma que los modelos Moonshine superan a modelos Whisper Tiny de tamaño comparable, pero no se proporcionan cifras concretas en la información disponible. No se dispone de datos de otras alternativas ASR coreanas para una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información proporcionada; al ser un ajuste fino sobre coreano, puede reflejar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: propio de los modelos ASR; la transcripción puede contener errores o texto inventado en audio ruidoso o con acentos no representados, con un CER de referencia del 8,97 % en FLEURS-ko.
- Limitaciones de idioma: monolingüe coreano; no soporta otros idiomas, traducción ni detección de idioma.
- Sin marcas de tiempo: la salida es solo texto, lo que limita su uso en subtitulado sincronizado.
- Sin streaming: no apto para transcripción en tiempo real continua con este backend.
- Restricciones de licencia: licencia MIT heredada del modelo base, permisiva para uso comercial; debe consultarse la model card upstream para los términos completos.
- Caveat de producción: la conversión se validó en commits concretos (upstream 80995f0 y transcribe.cpp 90bf720); cambios posteriores en cualquiera de los dos pueden alterar el comportamiento numérico.
- Requiere audio de entrada en WAV mono a 16 kHz; otro formato exige conversión previa.
- El número de descargas y likes del repositorio es 0, lo que indica escasa adopción y validación comunitaria hasta la fecha.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/GhaythMahadin/moonshine-tiny-ko-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ko
- Commit upstream de referencia: https://huggingface.co/UsefulSensors/moonshine-tiny-ko/commit/80995f0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper "Flavors of Moonshine": https://huggingface.co/papers/2509.02523
- Código de Moonshine AI: https://github.com/moonshine-ai/moonshine
- Instrucciones de instalación de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Paper "Model Cards for Model Reporting": https://arxiv.org/abs/1810.03993
- Descargas GGUF: https://huggingface.co/handy-computer/moonshine-tiny-ko-gguf/resolve/main/moonshine-tiny-ko-F32.gguf, https://huggingface.co/handy-computer/moonshine-tiny-ko-gguf/resolve/main/moonshine-tiny-ko-F16.gguf, https://huggingface.co/handy-computer/moonshine-tiny-ko-gguf/resolve/main/moonshine-tiny-ko-Q8_0.gguf
