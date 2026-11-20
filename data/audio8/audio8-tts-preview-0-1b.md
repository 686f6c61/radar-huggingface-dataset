# Audio8/Audio8-TTS-Preview-0.1b

## Resumen

Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz zero-shot, desarrollado por Audio8. Se presenta como el sistema TTS zero-shot más pequeño que merece la pena ejecutar: el modelo generativo principal ronda los 170 millones de parámetros, a los que se suma un decodificador de códec neuronal de aproximadamente 120 millones, lo que deja la pila completa de generación de audio muy por debajo de los sistemas TTS multilingües habituales, que suelen moverse entre 0,8B y 8,5B de parámetros.

La arquitectura, denominada Audio8 Falcon H1, combina dos ramas autorregresivas: una rama lenta de 24 capas que predice tokens semánticos y una rama rápida de 4 capas que predice los codebooks del códec condicionada por el estado oculto de la rama lenta. El códec trabaja a 44,1 kHz con 2.048 muestras por frame (unas 21,5 tramas por segundo) y emplea 10 codebooks de 4.096 entradas cada uno. El contexto alcanza las 2.048 posiciones empaquetadas de texto y audio.

Su relevancia actual reside en la relación entre tamaño y funcionalidad: ofrece clonación de voz zero-shot multilingüe (chino e inglés como idiomas principales, con alemán, español, francés, italiano, japonés y coreano en evaluación experimental) en un footprint que permite despliegue en CPU mediante una variante ONNX INT8 con un consumo de aproximadamente 0,4 GiB tras la carga. La licencia es la Audio8 Community License v1.0, de tipo "other", por lo que conviene revisar sus términos antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 con ramas autorregresivas lenta (semántica) y rápida (codebooks del códec) |
| Parámetros totales | 169.779.904 en safetensors (modelo principal ~170M, excluyendo el decodificador del códec); decodificador de códec ~120M adicionales en `codec.pth` |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantización | ONNX INT8 (ramas Slow AR y Fast AR) con códec en FP16; bfloat16 y float32 en PyTorch |
| Idiomas soportados | Chino y inglés (principales); alemán, español, francés, italiano, japonés y coreano (experimental) |
| Licencia | audio8-community-license-v1.0 (tipo "other") |
| Formato de pesos | safetensors (Transformers, con código remoto); ONNX INT8 en repositorio separado; códec en `codec.pth` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura autorregresiva de dos velocidades. La rama lenta (Slow AR) consta de 24 capas con anchura 512, 8 cabezas de atención y 2 cabezas KV, y se encarga de predecir tokens semánticos. La rama rápida (Fast AR) tiene 4 capas con la misma anchura y configuración de atención, y predice los 10 codebooks acústicos de 4.096 entradas condicionada por el estado oculto de la rama lenta. El códec opera a 44,1 kHz con 2.048 muestras por frame, lo que equivale a unas 21,5 tramas por segundo, y su decodificador neuronal (~120M de parámetros) se distribuye dentro del repositorio en `codec.pth`, de modo que no se necesita ningún checkpoint de códec adicional.

El repositorio contiene el checkpoint mixto v4 completo junto con el códec de audio neuronal, el tokenizador, el procesador y el código remoto de Hugging Face. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del esquema dual slow/fast AR.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) en chino e inglés como idiomas principales.
- Clonación de voz zero-shot: basta con un audio de referencia y su transcripción para replicar el timbre y el estilo.
- Evaluación multilingüe experimental en alemán, español, francés, italiano, japonés y coreano.
- Generación de audio a 44,1 kHz mediante códec neuronal con 10 codebooks.
- Salida de forma de onda directamente desde `model.generate`, con control de muestreo mediante `temperature`, `top_p`, `top_k` y `max_new_tokens`.
- Despliegue en CPU sin CUDA mediante la variante ONNX INT8, con CLI, servicio web, servicio HTTP, streaming PCM y registro de voces.
- Integración con el ecosistema Transformers mediante `AutoModel` y `AutoProcessor` con `trust_remote_code=True`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Clonación de voz para doblaje y localización: con un audio de referencia y su transcripción se puede generar la misma voz en chino o inglés, y de forma experimental en español, francés, alemán, italiano, japonés o coreano, lo que permite producir versiones multilingües de un mismo locutor sin regrabar.
- Asistentes de voz embebidos en dispositivos de bajos recursos: la variante ONNX INT8 funciona con ONNX Runtime en CPU, sin CUDA, con aproximadamente 0,4 GiB de memoria tras la carga, lo que la hace apta para mini-PC, routers o entornos edge.
- Audiolibros y contenido narrado: el modelo sintetiza voz de forma autorregresiva con control de muestreo (`temperature`, `top_p`, `top_k`), lo que permite ajustar la expresividad y la estabilidad de la prosodia por fragmento.
- Prototipado rápido de interfaces de voz: la instalación se reduce a `pip install` de torch, torchaudio, transformers, soundfile y safetensors, y la API de `AutoProcessor`/`AutoModel` permite integrar la síntesis en un notebook o en un servicio Python en pocas líneas.
- Servicios HTTP de síntesis con streaming: la guía de ONNX Runtime incluye servicio HTTP y streaming PCM, adecuado para integrar TTS en aplicaciones web con latencia baja y sin dependencia de PyTorch en tiempo de ejecución.
- Generación de voces para preproducción de videojuegos y animación: el registro de voces del flujo ONNX permite dar de alta referencias y reutilizarlas, manteniendo la coherencia de personaje entre tomas.
- Investigación en TTS de bajo coste computacional: su tamaño (~170M en el modelo principal) permite experimentar con arquitecturas slow/fast AR y códecs neuronales en una sola GPU de consumo, algo inviable con modelos de 4B a 8,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una comparación de escala de parámetros, no de calidad:

| Modelo | Escala reportada del modelo principal |
|---|---:|
| Audio8 TTS Preview 0.1B | ~0,17B |
| Audio8 TTS Preview 0.6B | ~0,6B |
| IndexTTS2.5 | ~0,8B |
| CosyVoice3 | ~1,5B |
| VoxCPM2 | ~2,3B |
| Fish S2 Pro | ~4,6B |
| Higgs Audio v2 | ~4,7B |
| MOSS-TTS | ~8,5B |

El propio autor advierte que estas cifras son escalas de referencia aproximadas recogidas de los informes de cada modelo y no una auditoría estrictamente equiparable de recuento de parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: no disponible de forma explícita; con ~170M de parámetros en el modelo principal y ~120M en el decodificador del códec, en bfloat16 el peso combinado ronda los 0,6 GB, por lo que la VRAM necesaria es modesta y el cuello de botella será el búfer de activaciones y el audio generado.
- GPU recomendadas: no se especifican modelos concretos; la instalación recomienda una GPU con soporte CUDA y Python 3.11 o superior con torch >= 2.5.0 y torchaudio >= 2.5.0.
- GPU de consumo: por el tamaño del checkpoint (1,7 GB de repositorio) y los ~290M de parámetros combinados, cabe holgadamente en cualquier GPU de consumo moderna; no se publican cifras de VRAM medidas.
- Despliegue en CPU: variante ONNX INT8 con ONNX Runtime `CPUExecutionProvider`, sin CUDA, con aproximadamente 0,4 GiB de memoria tras la carga en la configuración Linux x86_64 probada, y sin dependencia de PyTorch ni Transformers tras la descarga del modelo.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (PyTorch, bfloat16 en CUDA y float32 en CPU), ONNX Runtime para CPU (INT8 en las ramas AR, FP16 en el códec), y flujos CLI, web, HTTP y streaming PCM incluidos en la guía de ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Escala del modelo principal | Idiomas | Licencia | Formatos disponibles |
|---|---:|---|---|---|
| Audio8 TTS Preview 0.1B | ~0,17B | zh, en principales; de, es, fr, it, ja, ko experimentales | audio8-community-license-v1.0 | safetensors, ONNX INT8 |
| Audio8 TTS Preview 0.6B | ~0,6B | no disponible | no disponible | no disponible |
| IndexTTS2.5 | ~0,8B | no disponible | no disponible | no disponible |
| CosyVoice3 | ~1,5B | no disponible | no disponible | no disponible |

La comparación se limita a la escala de parámetros reportada por cada proyecto, ya que la información disponible no incluye datos de contexto, rendimiento ni licencia de las alternativas. No se dispone de benchmarks comparativos que permitan contrastar calidad de síntesis, naturalidad o similitud de voz clonada entre estos modelos.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés están declarados como principales; alemán, español, francés, italiano, japonés y coreano se presentan explícitamente como evaluación multilingüe experimental, por lo que su calidad no está garantizada.
- La clonación de voz zero-shot exige un audio de referencia acompañado de su transcripción exacta; una transcripción que no coincida con el contenido hablado degrada el resultado.
- Riesgo de uso indebido: la clonación de voz permite suplantar identidades; es responsabilidad del integrador aplicar consentimiento, marcas de agua o verificación de locutor según la legislación aplicable.
- Sesgos: no se documentan análisis de sesgo por idioma, género, acento o variedad dialectal; al estar entrenado principalmente en chino e inglés, es esperable un peor comportamiento en otras variedades.
- Alucinación y artefactos: no se publican métricas de estabilidad ni de tasa de fallos en textos largos; el límite de 2.048 posiciones empaquetadas de texto y audio restringe la duración de referencia y de generación por pasada.
- Licencia: la Audio8 Community License v1.0 es de tipo "other" y no una licencia open source estándar; deben revisarse sus términos antes de cualquier uso comercial o redistribución.
- Producción: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; conviene fijar una revisión concreta y auditar el código antes de desplegarlo.
- No se documentan cifras de latencia, throughput ni VRAM medida, por lo que la planificación de capacidad debe hacerse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Variante ONNX INT8 para CPU: https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Guía de ONNX Runtime para CPU: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime
- Demo de muestras de audio del 0.1B: https://edge0-ai.github.io/Audio8_TTS/0.1B/
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
