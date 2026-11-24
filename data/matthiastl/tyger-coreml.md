# matthiastl/tyger-coreml

## Resumen

TYGER for iPhone (Core ML) es una conversión no oficial del modelo de turn-taking TYGER de NineNineSix, empaquetada para ejecutarse en la Neural Engine del iPhone mediante Core ML. TYGER es un modelo de clasificación de audio diseñado específicamente para agentes de voz: escucha simultáneamente al interlocutor y a la reproducción del propio agente, y decide cuándo el usuario ha terminado de hablar (endpoint detection), cuándo está interrumpiendo (barge-in) y cuándo encaja un asentimiento conversacional como "mm-hm" (backchannel). El modelo original se distribuye como un fichero PyTorch fp32 de 2,6 GB y se ejecuta en GPU mediante el runtime tyger-s2s.

Esta conversión reduce el encoder a 740 MB en precisión de 16 bits y lo combina con un turn-taker de 56 MB en ONNX, logrando que el conjunto quepa y funcione en un dispositivo móvil. En un iPhone 17 Pro mantuvo el ritmo de audio en vivo durante 10 minutos, con un p90 de 64 ms y un peor caso de 232 ms por paso de 320 ms. Sobre 28 llamadas telefónicas grabadas, reproduce la misma decisión que el modelo original en al menos el 99,9 % de las tramas de 80 ms.

La relevancia de esta ficha es doble: por un lado documenta un modelo de turn-taking de altísima especialización para pipelines de voz full-duplex; por otro, ilustra un patrón de despliegue en el borde (edge) con Core ML y ONNX Runtime que evita depender de la nube para la lógica de interacción conversacional. No incluye reconocimiento de voz: solo contiene las primeras 15 de las 24 capas del encoder Nemotron, suficientes para la decisión de turno pero no para transcribir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo Nemotron (transformer, primeras 15 de 24 capas) + turn-taker GRU de 3 capas y anchura 768 |
| Parametros totales | No disponible (el repo ocupa 0,8 GB; el encoder pesa 740 MB en fp16 y el turn-taker 56 MB en fp32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 8 s, procesadas en pasos de 320 ms; turno máximo devuelto de 20 s |
| Tipos de cuantizacion | Encoder en float16 (Core ML); turn-taker en fp32 (ONNX); existe una versión ONNX de 8 bits en `matthiastl/tyger-onnx` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | `.mlpackage` (Core ML), `.onnx` (turn-taker), `mel_filters.f32` (banco de filtros mel) |

## Arquitectura y entrenamiento

El modelo es una conversión del TYGER original de NineNineSix, que a su vez se apoya en el encoder de Nemotron. La parte incluida en este repositorio es únicamente la que toma decisiones de turno: el encoder procesa dos flujos de audio simultáneos (llamante y reproducción del agente) con entradas log-mel de forma `[2, 801, 128]` y produce representaciones de forma `[2, 101, 1024]`, una trama cada 80 ms. Sobre esas representaciones opera un turn-taker implementado como GRU de 3 capas con anchura 768, que emite una decisión por trama de 80 ms. Las reglas de turno (endpoint, barge-in, backchannel) son un port en C de `rules.py` de tyger-s2s, con umbrales por defecto de 0,91 para endpoint, 0,5 para barge-in y 0,4 para backchannel.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens de audio, ni si se aplicaron técnicas de RLHF o ajuste por preferencias; la model card de esta conversión no los detalla y remite a la ficha del modelo original para evaluar la calidad de las decisiones. La innovación técnica destacable no está en el entrenamiento sino en el despliegue: separación encoder/turn-taker en dos runtimes (Core ML para el encoder en Neural Engine, ONNX Runtime para la GRU), ventanas deslizantes de 8 s con pasos de 320 ms, y un runtime en C (`Tyger.h`/`Tyger.m`) que encapsula log-mels, ventanas, turn-taker y reglas. La conversión fue validada contra el original, no contra la verdad de referencia: se comprobó que las decisiones coinciden en al menos el 99,9 % de las tramas, pero la calidad absoluta de TYGER debe consultarse en su propia model card.

## Capacidades

- Clasificación de audio orientada a turn-taking en agentes de voz.
- Detección de endpoint: determina cuándo el interlocutor ha terminado su turno y devuelve los últimos `turn_s` segundos de audio (hasta 20 s).
- Detección de barge-in: identifica cuándo el usuario interrumpe al agente para que este detenga la reproducción.
- Detección de backchannel: señala momentos en los que encaja un asentimiento breve ("mm-hm").
- Procesamiento full-duplex: consume simultáneamente el audio del usuario y el del agente en reproducción (ceros cuando el agente calla).
- Operación en tiempo real por pasos de 320 ms con latencia p90 de 64 ms en iPhone 17 Pro.
- Ejecución local en Neural Engine (iOS 18 o posterior) y en macOS 15 o posterior vía Core ML.
- No incluye reconocimiento de voz ni transcripción; la transcripción del turno debe hacerse con un ASR externo.

## Casos de uso

- Agentes de voz telefónicos en producción: el modelo decide cuándo el cliente ha terminado de hablar para disparar la respuesta del agente, con umbral de endpoint configurable (0,91 por defecto) y devolución del audio del turno para pasarlo a un ASR.
- Gestión de interrupciones en asistentes conversacionales: la señal de barge-in permite detener la síntesis de voz del agente en cuanto el usuario empieza a hablar, evitando solapamientos incómodos.
- Aplicaciones iOS nativas de asistente de voz: al ejecutarse en Neural Engine con Core ML, permite construir agentes de voz on-device sin enviar audio a la nube para la lógica de turno.
- Call centers con detección de silencios y solapamientos: el modelo puede alimentar métricas de calidad de llamada (cuántas interrupciones, latencia de respuesta percibida) procesando las 28 llamadas de validación o flujos equivalentes.
- Asistentes de accesibilidad para personas con ritmo conversacional atípico: la detección de backchannel y endpoint permite adaptar la cadencia del agente a pausas largas o frecuentes.
- Investigación en interacción humano-máquina full-duplex: el paquete incluye `ios/SpeedTest/` y `scripts/` para reproducir las mediciones de latencia y las comparaciones con el original, útil para estudiar el comportamiento en el borde.
- Prototipado en macOS: `scripts/phone_coreml.py` permite ejecutar el mismo paquete Core ML en un Mac (unos 28 ms por paso en un M4 Max) para iterar antes de desplegar en dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor | Entorno |
|---|---|---|
| Latencia por paso (p90) | 64 ms | iPhone 17 Pro, iOS 27.2.1, 10 min en vivo |
| Latencia por paso (peor caso) | 232 ms | iPhone 17 Pro, 10 min en vivo |
| Pasos tardios en 10 min | 0 | iPhone 17 Pro |
| Coincidencia con el original | ≥ 99,9 % de tramas de 80 ms | 28 llamadas grabadas |
| Tiempo de carga | 29–47 s | iPhone 17 Pro |
| Latencia por paso en Mac | ~28 ms | Apple M4 Max, Python + ONNX Runtime |
| Memoria en ejecución | ~0,9 GB (pico de app 1,2 GB) | iPhone 17 Pro |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo, ya que se trata de un clasificador de audio y no de un modelo de lenguaje. La calidad de las decisiones de TYGER se remite a la model card del modelo original.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 0,9 GB en ejecución; el paquete del encoder ocupa 740 MB en disco y el turn-taker 56 MB.
- Dispositivo de referencia: iPhone 17 Pro con iOS 27.2.1; no se ha probado en otros iPhone.
- Mac: macOS 15 o posterior con el mismo paquete Core ML; medido en Apple M4 Max a ~28 ms por paso.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; esta conversión está pensada para Neural Engine y Core ML, no para CUDA.
- Cabe en hardware de consumo: sí, en iPhone compatible con Neural Engine y en Macs con Apple Silicon.
- Despliegue: Core ML (encoder) + ONNX Runtime para iOS (`onnxruntime-c`, versión 1.30.0 usada) para el turn-taker; frameworks CoreML, Accelerate y Network.
- Latencia y throughput: p90 de 64 ms y peor caso de 232 ms por paso de 320 ms en iPhone 17 Pro; el autor reporta conmutación entre ~34 ms y ~187 ms cuando los pasos se ejecutan consecutivos, de causa desconocida y no observada en Mac.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TYGER (original, `nineninesix/tyger`) | Turn-taking para agentes de voz, PyTorch | 2,6 GB fp32 | Ventanas de audio de 8 s | No disponible en la informacion | Hugging Face, runtime tyger-s2s en GPU |
| `matthiastl/tyger-onnx` | Misma funcion, ONNX 8 bits para computadoras | No disponible | Ventanas de audio de 8 s | OpenMDW-1.1 | Hugging Face |
| `matthiastl/tyger-coreml` (este) | Misma funcion, Core ML + ONNX para iPhone | 740 MB fp16 + 56 MB fp32 | Ventanas de audio de 8 s | OpenMDW-1.1 | Hugging Face, iOS 18+ |

No se dispone de información sobre otros modelos de turn-taking comparables (por ejemplo, alternativas comerciales o académicas de endpoint detection) en la documentación proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está hecha ni respaldada por NineNineSix ni por NVIDIA.
- Solo inglés: el modelo está etiquetado únicamente para `en`; no se garantiza comportamiento en otros idiomas.
- Sin ASR: no transcribe; solo decide turnos. La transcripción debe hacerse con un reconocedor externo.
- Validación contra el original, no contra la verdad: la coincidencia del 99,9 % mide fidelidad a TYGER, no calidad absoluta de las decisiones.
- Un solo dispositivo probado: iPhone 17 Pro con iOS 27.2.1, 10 minutos, enchufado y con batería llena; no se midió consumo de batería ni se probaron otros modelos.
- Variabilidad de latencia en dispositivo: los tiempos por paso conmutan entre ~34 ms y ~187 ms en ráfagas, de causa desconocida.
- Carga lenta: 29–47 s cada vez que se inicializa; debe cargarse antes de iniciar la conversación.
- Tamaño y memoria considerables para móvil: 740 MB en disco y ~0,9 GB en ejecución, con pico de app de 1,2 GB.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos o negativos en endpoint, barge-in y backchannel, con impacto directo en la fluidez de la conversación.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al ser un modelo de audio en inglés, puede comportarse peor con acentos, ruido o ritmos conversacionales no representados en su entrenamiento.
- Licencia OpenMDW-1.1: debe revisarse `LICENSE.md` y `NOTICE.md` antes de uso comercial; la información disponible no detalla restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/matthiastl/tyger-coreml
- Modelo base TYGER: https://huggingface.co/nineninesix/tyger
- Versión ONNX para computadoras: https://huggingface.co/matthiastl/tyger-onnx
- Runtime tyger-s2s: https://github.com/nineninesix-ai/tyger-s2s
- Model card del modelo original (calidad de las decisiones): https://huggingface.co/nineninesix/tyger
