# KingNish/Chotu-TTS-v0.1

## Resumen

Chotu TTS v0.1 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por KingNish, publicado en Hugging Face bajo licencia Apache 2.0. Se distribuye como un único grafo ONNX cuantizado a INT8 con un peso inferior a 2 MB, lo que lo sitúa en la categoría de modelos de voz ultraligeros orientados a ejecución local, navegador y dispositivos edge. Deriva de Paradee-8M-v1.0 y de Kokoro-82M, combinando la arquitectura compacta del primero con el vocabulario y el enfoque de calidad del segundo.

El modelo resuelve el problema de la latencia y el coste de despliegue en aplicaciones de voz en tiempo real: emite el primer fragmento de audio en una mediana de 30 ms y alcanza 80 veces el tiempo real en un solo hilo de CPU, con audio a 24 kHz en PCM mono de 16 bits. Está diseñado para streaming continuo con estado persistente (cachés KV, estado ConvNeXt, historial de F0 y fase harmónica) que se transporta entre pasos, de modo que no requiere sintetizar la locución completa antes de empezar a reproducir.

Su relevancia actual radica en que permite agentes de voz, lectores de pantalla y asistentes offline sin llamadas a la nube ni GPU, con un consumo de memoria despreciable. La contrapartida es un alcance limitado: solo inglés, sin control de hablante documentado y con una model card que aún no incluye instrucciones de uso ("Coming soon").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con encoder de ventanas deslizantes y decoder ConvNeXt causal; grafo ONNX con estado (KV, ConvNeXt, F0, fase harmónica) |
| Parametros totales | no disponible (repo de 0.0 GB; peso INT8 < 2 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana deslizante de 64 tokens activos con contexto pasado y lookahead |
| Tipos de cuantizacion | INT8 (único formato publicado) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8), empaquetado como `chotu_tts_v0_1_int8.zip` |

## Arquitectura y entrenamiento

Chotu TTS v0.1 se ejecuta como un único grafo ONNX con estado que procesa ventanas deslizantes de tokens (64 tokens activos, con contexto pasado y lookahead). Entre pasos transporta cuatro tipos de estado: dos cachés KV del encoder (`kv1_cache_in`/`kv2_cache_in`), el estado del decoder ConvNeXt causal (`conv_cache_in`, tensor de forma `[36, 1, 4, 256]`), el historial reciente de frecuencia fundamental (`f0_prev2_in`) y el estado de fase harmónica (`c0_in`). El grafo expone 12 entradas y 7 salidas, incluyendo la forma de onda, la curva de F0 predicha, las duraciones por token en frames y el estado actualizado para el siguiente fragmento.

Una innovación destacable es la "decodificación de profundidad continua": el parámetro `num_dec_loops` permite al llamador intercambiar cómputo por fidelidad en cada petición (los ejemplos de audio usan `num_dec_loops = 4`). El vocabulario es de 178 tokens según `config.json`, y el control de velocidad se expone mediante la entrada `speed` (1.0 = normal). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos ni si hubo ajuste por RLHF o DPO; la model card solo indica que el modelo se construye sobre Paradee-8M-v1.0 y Kokoro-82M.

## Capacidades

- Síntesis de voz en inglés a 24 kHz en PCM mono de 16 bits, con streaming por fragmentos.
- Streaming con estado persistente: emite el primer fragmento de 150 ms de audio de inmediato, con una mediana de tiempo hasta el primer audio (TTFA) de 30 ms.
- Control de velocidad de habla mediante el parámetro `speed`.
- Control de calidad/cómputo por petición mediante `num_dec_loops`.
- Salida adicional de curva de F0 y duraciones por token, útil para análisis prosódico o sincronización.
- Ejecución en navegador mediante `onnxruntime-web` (WASM SIMD) y de forma nativa con ONNX Runtime.
- Funcionamiento completamente offline, sin llamadas a la nube.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Agentes de voz en tiempo real: el modelo puede empezar a hablar 30 ms después de recibir el texto, lo que permite encadenar reconocimiento de voz, un LLM y síntesis sin que el usuario perciba una pausa significativa.
- Lectura por voz en el navegador: al ejecutarse con `onnxruntime-web` sobre WASM SIMD y pesar menos de 2 MB, se puede descargar y ejecutar en la pestaña del cliente sin backend ni GPU, útil para lectores de pantalla o accesibilidad web.
- Dispositivos edge y sistemas embebidos: su huella INT8 inferior a 2 MB y su rendimiento de 80x tiempo real en un solo hilo de CPU permiten integrarlo en Raspberry Pi, routers o wearables con recursos muy limitados.
- Asistentes de voz offline: en entornos sin conectividad o con requisitos de privacidad estrictos (sanidad, industria, vehículos), el modelo genera audio localmente sin enviar texto a servicios externos.
- Anuncios y notificaciones dinámicas: la síntesis por fragmentos con estado permite generar avisos cortos bajo demanda con latencia mínima en aplicaciones de mensajería o domótica.
- Prototipado rápido de pipelines TTS: al ser un grafo ONNX único con interfaz documentada (12 entradas, 7 salidas), sirve para validar arquitecturas de streaming y prosodia (F0, duraciones) antes de escalar a modelos mayores.
- Generación de audio para pruebas automatizadas: su velocidad de 80x tiempo real en CPU permite sintetizar grandes lotes de locuciones en CI sin coste de GPU.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`assets/benchmarks.webp`) y una tabla de propiedades, pero no publica resultados numéricos de métricas estándar como MMLU, HumanEval o GSM8K (no aplicables a un modelo TTS) ni métricas de calidad de voz como MOS, WER o similitud de hablante. Los únicos datos cuantitativos disponibles son los siguientes:

| Metrica | Valor |
|---|---|
| Huella del modelo | < 2 MB (INT8 ONNX) |
| Frecuencia de muestreo | 24000 Hz (PCM mono 16 bits) |
| TTFA mediana | 30 ms |
| Throughput | 80x tiempo real (un hilo de CPU) |
| Tamano de vocabulario | 178 tokens |
| Ventana activa | 64 tokens con contexto y lookahead |

No se han publicado resultados de benchmarks de calidad de síntesis en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU. El peso INT8 ocupa menos de 2 MB, por lo que la memoria necesaria es negligible frente al runtime de ONNX.
- GPU recomendadas: no aplica; no se documenta ejecución en GPU ni aceleración CUDA/TensorRT.
- Compatibilidad con GPU de consumo: irrelevante, ya que el objetivo es CPU y navegador. Cabe en cualquier equipo con un hilo de CPU disponible.
- Opciones de despliegue: ONNX Runtime nativo y `onnxruntime-web` con WASM SIMD para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: TTFA mediana de 30 ms y 80x tiempo real en un solo hilo de CPU, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Chotu TTS v0.1 | no disponible (< 2 MB INT8) | Ventana deslizante de 64 tokens | Inglés | Apache 2.0 | ONNX INT8 | Streaming con estado, TTFA 30 ms, 80x tiempo real en CPU |
| Kokoro-82M (modelo base) | 82 M | no disponible | Inglés y otros | Apache 2.0 | safetensors / ONNX | Modelo TTS de referencia del que deriva Chotu; mayor huella |
| Paradee-8M-v1.0 (modelo base) | 8 M | no disponible | no disponible | no disponible | no disponible | Arquitectura compacta base citada por el autor |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se documenta control de hablante, clonación de voz ni selección de voces; los ejemplos usan una única voz.
- La model card indica "Usage: Coming soon", por lo que no hay instrucciones oficiales de integración ni ejemplos de código.
- El repositorio tiene un tamaño de 0.0 GB y solo 35 descargas y 1 like, lo que sugiere un modelo muy reciente y con poca validación comunitaria.
- No se han publicado métricas de calidad de voz (MOS, WER, similitud de hablante), sesgos del dataset ni evaluación de robustez ante texto fuera de dominio.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de prosodia incorrecta o pronunciación errónea en palabras poco frecuentes, siglas y nombres propios.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las licencias de los modelos base (Paradee-8M-v1.0 y Kokoro-82M) y de los datos de entrenamiento antes de un despliegue en producción.
- El estado persistente entre fragmentos exige gestionar correctamente las cachés (KV, ConvNeXt, F0, fase); un uso incorrecto de las mismas puede degradar la continuidad del audio.
- No se documentan límites de longitud de texto de entrada más allá de la ventana de 64 tokens activos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KingNish/Chotu-TTS-v0.1
- Modelo base Paradee-8M-v1.0: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.0
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Ejemplo de audio intro: https://huggingface.co/KingNish/Chotu-TTS-v0.1/resolve/main/examples/intro.wav
- Ejemplo de audio latencia: https://huggingface.co/KingNish/Chotu-TTS-v0.1/resolve/main/examples/latency.wav
- Ejemplo de audio edge: https://huggingface.co/KingNish/Chotu-TTS-v0.1/resolve/main/examples/edge.wav
