# loom-ai-org/vocetta2-276k-loom

## Resumen

Vocetta2 276K es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado originalmente por VantoraLabs y redistribuido por loom-ai-org en formato GGUF para el motor loom.cpp. Se trata de un modelo extremadamente compacto: 288.852 parámetros totales (la model card cita 276.765 para la red de duración y síntesis de mel-espectrograma), lo que lo sitúa en el rango de los modelos TTS más pequeños publicados. Su arquitectura combina una red de duración, una red acústica que predice un mel-espectrograma y un decodificador ConvNeXt/iSTFT que genera forma de onda a 24 kHz.

El modelo resuelve el problema de síntesis de voz de alta fidelidad en entornos con recursos muy limitados: cabe en dispositivos como una Raspberry Pi Zero y ocupa apenas 1,2 MB en precisión F32 (0,6 MB en la variante cuantizada q8_0). La exportación a GGUF es autocontenida: incluye las topologías del grafo, el tokenizador (si lo hay) y el script controlador, lo que permite ejecutarlo directamente con el runtime loom-py-rt sin dependencias adicionales pesadas.

Es relevante ahora porque demuestra que la síntesis de voz neuronal puede ejecutarse en hardware de gama ultra-baja con una huella de memoria de aproximadamente 57-58 MB (dominada casi por completo por el propio runtime). La licencia MIT y el formato GGUF lo hacen adecuado para incrustar TTS en aplicaciones locales, domótica, dispositivos empotrados y pipelines offline sin depender de servicios en la nube. Su limitación principal es que solo cubre inglés y una única voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de duración + red acústica (mel-espectrograma) + decodificador ConvNeXt/iSTFT a 24 kHz |
| Parámetros totales | 288.852 (276.765 según la model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (límite de 207 símbolos fonéticos por llamada, BOS y EOS incluidos) |
| Tipos de cuantización | F32 (1,2 MB) y q8_0_pc (0,6 MB; capas pointwise y head del decodificador en int8 por canal, mitad de las convoluciones de la red acústica en Q8_0) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (autodescriptivo, con grafo y driver embebidos) |

## Arquitectura y entrenamiento

El modelo sigue un diseño TTS en tres etapas: una red de duración que predice la longitud de cada segmento fonético, una red acústica que convierte la secuencia fonética en un mel-espectrograma y un decodificador basado en ConvNeXt seguido de una iSTFT que reconstruye la forma de onda a 24 kHz. El export GGUF conserva los grafos y el driver originales, de modo que el comportamiento es equivalente al del modelo base de VantoraLabs salvo por la cuantización.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La model card no documenta innovaciones como decodificación especulativa o atención lineal; la peculiaridad técnica destacable es la exportación autocontenida a GGUF mediante loom-exporter y el uso de la operación `ISTFT` del motor loom.cpp (disponible desde loom-py-rt 1.0.0rc18). El decodificador se alimenta con ruido cero por defecto, tal como lo renderiza el modelo original; `noise_scale` y `seed` permiten añadir ruido gaussiano, que el autor original midió como peor en todas las métricas.

## Capacidades

- Síntesis de voz en inglés a partir de texto (text-to-speech) con una única voz.
- Fonemización mediante orthography2ipa con lexicón de pronunciación opcional (hexgrad/misaki, Apache-2.0) para inglés estadounidense.
- Aceptación de fonemas IPA precalculados mediante el argumento `phonemes`, lo que permite obtener la calidad máxima usando el G2P propio del usuario.
- Control de velocidad del habla mediante `length_scale`.
- Control opcional de ruido de decodificación mediante `noise_scale` y `seed`.
- Ejecución en CPU y GPU (backend GGML), con correcciones específicas para Raspberry Pi Zero y Pi 1-3.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Síntesis de voz en dispositivos empotrados: el modelo cabe en una Raspberry Pi Zero con unos 57-58 MB de memoria pico, lo que permite generar locuciones en domótica, lectores de tarjetas o paneles informativos sin conexión a la nube.
- Accesibilidad local: integración en lectores de pantalla o aplicaciones de asistencia para convertir texto en audio en tiempo real en equipos de gama baja, con latencia determinada por el runtime y no por la red.
- Generación de audios de aviso y notificaciones: para sistemas de monitorización o CI/CD que necesiten anuncios hablados cortos (menos de 207 fonemas por llamada) sin depender de APIs externas.
- Prototipado de pipelines TTS: al ser un GGUF autocontenido de 0,6-1,2 MB, sirve como banco de pruebas para comparar fonemizadores y cuantizaciones antes de escalar a modelos mayores.
- Aplicaciones offline con requisitos de licencia permisiva: la licencia MIT permite incrustarlo en productos comerciales cerrados sin obligaciones de atribución copyleft.
- Investigación en TTS de bajo coste: útil para estudiar el impacto de la cuantización int8/Q8_0 en la calidad de síntesis (el autor reporta 9,6 % WER en q8_0_pc frente a 9,8 % en F32 sobre 60 síntesis) y para reproducir experimentos en hardware mínimo.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Word error rate (Whisper small) | 11,9 % | 30 frases de LibriSpeech, puerta de texto con lexicón incluido |
| Word error rate (Whisper small) | 7,7 % | 30 frases de LibriSpeech, G2P propio del modelo original |
| Word error rate (Whisper small) | 9,6 % | 60 síntesis, cuantización q8_0_pc |
| Word error rate (Whisper small) | 9,8 % | 60 síntesis, precisión F32 |
| Fidelidad de forma de onda | 3,9e-5 | F32 frente a la salida del modelo original |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 57-58 MB de memoria pico en F32, casi toda correspondiente al runtime; la variante q8_0_pc reduce la memoria pico entre 1 y 4 MB.
- GPU recomendadas: no se especifican modelos concretos; el backend GPU GGML funciona en Raspberry Pi Zero y Pi 1-3 con `loom-py-rt` 1.0.0rc20 o anterior solo si se define `GGML_VC4_FUSE=0`, y queda corregido en `loom-py-rt` 1.0.0.
- Cabe en cualquier GPU consumer, incluida una Raspberry Pi Zero; también funciona en CPU con `device="cpu"`.
- Opciones de despliegue: runtime loom-py-rt (PyPI, extra `[hub,phonemes]`), versión mínima 1.0.0rc18 por la operación `ISTFT`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor indica que en Raspberry Pi Zero la variante q8_0_pc corre a la misma velocidad que F32 y en Pi 4 es más lenta, por lo que la cuantización es una reducción de descarga, no una mejora de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Vocetta2 276K (loom) | 288.852 | 207 fonemas por llamada | Inglés | MIT | GGUF |
| Piper (referencia TTS ligera) | No disponible en la información | No disponible | Múltiples | MIT | ONNX |
| Coqui TTS (referencia) | No disponible en la información | No disponible | Múltiples | MPL-2.0 / varias | Varios |
| Modelos TTS neuronales grandes | No disponible en la información | No disponible | Múltiples | Varias | Varios |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de Piper, Coqui TTS u otros modelos TTS comparables en la información proporcionada, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Solo inglés y una única voz; no hay soporte multilingüe ni cambio de hablante.
- Límite de 207 símbolos fonéticos por llamada (BOS y EOS incluidos); textos más largos deben dividirse por frases.
- La puerta de texto no reproduce el front-end original: con el lexicón incluido obtiene 11,9 % WER frente a 7,7 % con el G2P original; sin lexicón, el inglés empeora notablemente.
- El recorte de 2400 fotogramas (25,6 s) del modelo original no se reproduce: este export sintetiza todos los fotogramas que pidan las duraciones.
- El ruido de decodificación está desactivado por defecto; añadirlo empeora todas las métricas según el autor original.
- Riesgo de alucinación acústica y artefactos en pronunciaciones fuera del lexicón o en fonemización deficiente, dado el tamaño ínfimo del modelo.
- Sesgos de pronunciación heredados del corpus de entrenamiento original, no documentados en la información disponible.
- La licencia MIT permite uso comercial, pero el lexicón incluido (hexgrad/misaki) es Apache-2.0 y debe cumplirse por separado.
- En Raspberry Pi Zero y Pi 1-3 con `loom-py-rt` 1.0.0rc20 o anterior, es necesario definir `GGML_VC4_FUSE=0` para evitar un aborto del backend GPU en `conv_f32_run`; en `loom-py-rt` 1.0.0 queda corregido.
- El modelo está marcado como trabajo en curso; la fonemización de calidad depende de que el usuario aporte sus propios fonemas IPA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/vocetta2-276k-loom
- Modelo base: https://huggingface.co/VantoraLabs/Vocetta2-276k
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Lexicón hexgrad/misaki: https://github.com/hexgrad/misaki
- Lexicón en el repo: https://huggingface.co/loom-ai-org/vocetta2-276k-loom/resolve/main/lexicons/en_US-misaki.tsv
