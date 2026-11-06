# dheeyantra/pravega-pocket-tts

## Resumen

Pravega Pocket TTS es un modelo de síntesis de voz (text-to-speech) de 121,8 millones de parámetros desarrollado por Dheeyantra Research Labs como un ajuste fino de la arquitectura Pocket TTS de Kyutai. Su objetivo es ofrecer clonación de voz y síntesis en streaming para 20 idiomas (11 lenguas índicas y 9 lenguas mundiales) en hardware de gama baja, incluyendo la CPU de un teléfono móvil. El modelo se distribuye con pesos en safetensors y un paquete ONNX optimizado para inferencia en dispositivo.

La propuesta diferencial es la combinación de tres factores: un tamaño reducido (6 capas de transformer, 122 M de parámetros), una ventana de contexto de texto de 16 000 tokens según el componente `text_conditioner`, y una latencia de primer audio de aproximadamente 0,1 s en un Snapdragon 8+ Gen 1 con cuantización INT8 y 4 hilos cuando la voz de referencia se ha codificado previamente. El paquete INT8 de ONNX ocupa 213 MB y genera audio entre 3 y 5 veces más rápido que el tiempo real en 4 hilos de CPU de escritorio.

El modelo es relevante para desarrolladores que necesitan TTS multilingüe con clonación de voz en entornos sin GPU, especialmente en el ámbito de las lenguas índicas, donde la oferta de modelos abiertos es escasa. La licencia es `dhee-research-only-v1.0`, lo que restringe el uso a investigación y limita su adopción en producción comercial sin autorización expresa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (FlowLM de 6 capas) con códec Mimi de Kyutai |
| Parámetros totales | 121.790.146 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16 000 tokens de texto (componente `text_conditioner`) |
| Tipos de cuantización | FP32 e INT8 (cuantización dinámica de todas las MatMul en ONNX) |
| Idiomas soportados | 20: hi, bn, ta, te, kn, ml, mr, gu, pa, or, as, en, fr, es, pt, de, ru, ar, ja, zh |
| Licencia | dhee-research-only-v1.0 (solo investigación) |
| Formato de pesos | safetensors, ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pocket TTS de Kyutai: un transformer FlowLM de 6 capas que opera sobre representaciones latentes del códec Mimi, junto con un codificador de texto (`text_conditioner`) y un decodificador Mimi que convierte los latentes en audio a 24 kHz. El repositorio incluye los pesos EMA del FlowLM y el códec Mimi en `model.safetensors`, además de un paquete ONNX con grafos separados para el condicionador de texto (66 MB), el codificador Mimi (39 MB), el transformer principal (76 MB INT8 / 302 MB FP32), la cabeza de flujo (10 MB INT8 / 39 MB FP32) y el decodificador Mimi (23 MB INT8 / 41 MB FP32).

El ajuste fino se realizó sobre 1 918 horas de audio en los 20 idiomas soportados y el modelo se destiló a 6 capas de transformer. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO. La evaluación se llevó a cabo con 200 frases de validación no vistas (10 por idioma), cada una pronunciada con la voz de una grabación de referencia distinta, y el audio se generó con el paquete ONNX INT8 en el runtime C++ incluido, con temperatura 0,3, un paso de LSD, umbral EOS de −4,0 y 4 hilos. Los grafos FP32 coinciden con PyTorch con un error relativo de 1,2e-4.

## Capacidades

- Síntesis de voz en streaming: el audio se emite en tramas de 80 ms a medida que se genera.
- Clonación de voz a partir de 3-5 segundos de audio de referencia limpio.
- Soporte de 20 idiomas con etiqueta obligatoria al inicio de cada petición (por ejemplo, `[hi]`, `[ta]`, `[es]`).
- Capacidad multilingüe con 11 lenguas índicas (hindi, bengalí, tamil, telugu, kannada, malayalam, marathi, gujarati, punjabi, odia, assamés) y 9 lenguas mundiales (inglés, francés, español, portugués, alemán, ruso, árabe, japonés y chino simplificado).
- Ejecución en CPU sin GPU, tanto en escritorio como en dispositivos móviles Android mediante JNI sobre la API C.
- Manejo especial de CJK: japonés y chino requieren espaciado alrededor de cada carácter CJK en la entrada.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de TTS.

## Casos de uso

- **Lectura de contenidos en lenguas índicas**: el modelo puede sintetizar artículos o noticias en hindi, tamil, telugu o malayalam con una latencia de primer audio de 0,1-0,6 s, lo que permite integrarlo en aplicaciones de lectura por voz para regiones con baja cobertura de TTS comerciales.
- **Aplicaciones móviles sin conectividad**: con el paquete ONNX INT8 de 213 MB y el runtime C++ (PocketTTS.cpp), el modelo se puede empaquetar en una app Android y ejecutarse en la CPU del dispositivo, sin depender de la nube.
- **Clonación de voz para accesibilidad**: a partir de 3-5 s de audio de referencia, se puede generar una voz personalizada para usuarios con discapacidad del habla, con una similitud de hablante medida de 0,946-0,966 según el idioma.
- **Generación de audiolibros y pódcast multilingües**: el streaming en tramas de 80 ms y la velocidad de 3-5× tiempo real en 4 hilos de CPU permiten procesar textos largos en lote sin GPU dedicada.
- **Atención al cliente automatizada en varios idiomas**: el modelo puede servir como capa de síntesis en sistemas de respuesta de voz interactiva (IVR) para español, francés, alemán, ruso, árabe o portugués, con la ventaja de que el mismo binario cubre 20 idiomas.
- **Prototipado e investigación en TTS índico**: al ser un modelo de investigación con pesos abiertos, sirve como base para experimentos de ajuste fino, evaluación de inteligibilidad (CER) y estudios de similitud de hablante en lenguas con pocos recursos.
- **Sistemas de navegación y avisos por voz en dispositivo**: la baja latencia y el tamaño reducido permiten generar avisos dinámicos en tiempo real en entornos embebidos con CPU limitada.

## Benchmarks y rendimiento

La model card presenta una evaluación de 200 frases de validación (10 por idioma) con el paquete ONNX INT8. La tabla siguiente recoge los resultados publicados para los idiomas con datos completos en la información disponible; el resto de idiomas no se detalla en la información proporcionada.

| Idioma | CER | Suelo del scorer (grabación humana) | Similitud de hablante | Scorer |
|---|---:|---:|---:|---|
| Hindi | 0,052 | 0,041 | 0,957 | IndicConformer |
| Bengalí | 0,049 | 0,047 | 0,946 | IndicConformer |
| Tamil | 0,052 | 0,124 | 0,957 | IndicConformer |
| Telugu | 0,028 | 0,162 | 0,966 | IndicConformer |
| Kannada | 0,056 | 0,063 | 0,952 | IndicConformer |
| Malayalam | 0,078 | 0,100 | 0,957 | IndicConformer |
| Marathi | 0,066 | 0,146 | no disponible | IndicConformer |

El CER se calcula transcribiendo el audio generado con un ASR y comparándolo con el texto de entrada. El "suelo del scorer" es el CER del mismo ASR sobre la grabación humana original, de modo que un CER igual o inferior al suelo indica que el límite es el reconocedor, no la síntesis. La similitud de hablante es la similitud coseno de embeddings WavLM (`microsoft/wavlm-base-plus-sv`) entre la salida y la referencia. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no aplica en el escenario principal, ya que el modelo está diseñado para CPU. En GPU, el paquete INT8 completo (213 MB) y el FP32 (unos 500 MB sumando los grafos) caben en cualquier GPU con 2 GB o más.
- **GPU recomendadas**: no se especifican en la model card; el modelo está optimizado para CPU. Cualquier GPU consumer moderna (RTX 3060, RTX 4090) puede ejecutar los grafos ONNX, pero no se han publicado cifras de rendimiento en GPU.
- **CPU y dispositivos**: Snapdragon 8+ Gen 1 con INT8 y 4 hilos alcanza el primer audio en ~0,1 s con voz previamente codificada y 0,3-0,6 s si se codifica una referencia de 2-3 s en la misma llamada. En 4 hilos de CPU de escritorio, la generación es 3-5× más rápida que el tiempo real.
- **Opciones de despliegue**: `pocket-tts` 4.0.1 (Python), PocketTTS.cpp (runtime C++ sobre ONNX Runtime 1.23.2), API C (`ptt_create`, `ptt_stream_start`, `ptt_stream_read`) y envoltorio JNI para Android. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: primer audio en ~0,1 s (voz precalculada) o 0,3-0,6 s (referencia codificada en la llamada); generación 3-5× tiempo real en 4 hilos de CPU de escritorio con INT8.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. La comparación se limita a características estructurales frente a alternativas de la misma categoría (TTS con clonación de voz y ejecución en dispositivo).

| Modelo | Parámetros | Idiomas | Contexto de texto | Licencia | Despliegue en CPU |
|---|---|---|---|---|---|
| Pravega Pocket TTS | 121,8 M | 20 | 16 000 tokens | dhee-research-only-v1.0 (solo investigación) | Sí (ONNX INT8, C++) |
| kyutai/pocket-tts (base) | no disponible | no disponible | no disponible | no disponible | Sí (arquitectura base) |
| Alternativas TTS con clonación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible datos de otros modelos TTS comparables con parámetros, contexto y rendimiento verificables.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `dhee-research-only-v1.0` limita el uso a investigación. No se permite el uso comercial sin autorización expresa del autor, lo que excluye su despliegue en productos de producción.
- **Etiqueta de idioma obligatoria**: toda petición debe comenzar con la etiqueta del idioma (`[hi]`, `[es]`, etc.); sin ella el modelo no garantiza el idioma de salida.
- **Requisito especial para CJK**: japonés y chino se entrenaron con un espacio a cada lado de cada carácter CJK y requieren el mismo preprocesado en inferencia; de lo contrario, la calidad se degrada.
- **Riesgo de alucinación y errores de pronunciación**: el CER medido varía entre 0,028 y 0,078 en los idiomas evaluados, lo que implica que entre el 2,8 % y el 7,8 % de los caracteres pueden diferir del texto de entrada; en nombres propios, siglas y números el riesgo es mayor.
- **Dependencia de la calidad de la referencia**: la clonación de voz requiere 3-5 s de audio limpio; referencias ruidosas o con solapamiento degradan la similitud de hablante.
- **Cobertura de evaluación limitada**: solo se publican métricas de 7 de los 20 idiomas; para el resto no hay datos de CER ni de similitud de hablante en la información disponible.
- **Corrección del runtime incluida**: el runtime `runtime/` modifica PocketTTS.cpp para mantener la etiqueta de idioma en todos los fragmentos de texto y para acotar la caché de voces en memoria; se recomienda usar esta versión en lugar de la upstream, ya que en un párrafo francés de tres frases se midió CER 0,13-0,19 con la upstream frente a 0,00 con la corrección.
- **Sesgos**: no se documentan análisis de sesgos por género, edad o acento en la información disponible.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 31 de octubre de 2026, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dheeyantra/pravega-pocket-tts
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Runtime C++ PocketTTS.cpp: https://github.com/VolgaGerm/PocketTTS.cpp
- Licencia: https://huggingface.co/dheeyantra/pravega-pocket-tts/blob/main/LICENSE
- Scorer de similitud de hablante: https://huggingface.co/microsoft/wavlm-base-plus-sv
