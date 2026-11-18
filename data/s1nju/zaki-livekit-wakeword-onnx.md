# s1nju/zaki-livekit-wakeword-onnx

## Resumen

Zaki (زاكي) es un detector de palabra de activación (wake-word) en formato ONNX publicado por el usuario s1nju en Hugging Face. Se trata de un modelo de detección de palabras clave (keyword spotting) orientado a audio en tiempo real, entrenado específicamente para reconocer la frase de activación en árabe argelino (dariya) "زاكي" (Zaki). El modelo está empaquetado para su uso con LiveKit, la plataforma de infraestructura de audio y vídeo en tiempo real, mediante un wrapper en Python incluido en el repositorio.

La arquitectura se identifica en las etiquetas del repositorio como `livekit_stateful_wakeword_conformer`, es decir, un modelo basado en Conformer con estado interno, diseñado para procesamiento en streaming. El modelo procesa tramas de audio de 80 ms (1280 muestras a 16 kHz mono) manteniendo 9 tensores de estado internos entre tramas, entre los que se incluyen cachés KV y estados convolucionales. Está pensado para ejecutarse en CPU.

El modelo es relevante por su enfoque en un idioma y dialecto poco cubiertos por los sistemas de activación por voz convencionales, el árabe argelino, y por su formato ONNX orientado a despliegue ligero en el borde (edge) dentro de pipelines de LiveKit. No obstante, la información pública disponible es muy limitada: no se detallan datos de entrenamiento, métricas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con estado (stateful), streaming; etiqueta `livekit_stateful_wakeword_conformer` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa tramas de 80 ms / 1280 muestras a 16 kHz, con estado recurrente entre tramas) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ar (árabe), arq (árabe argelino / dariya) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`zaki_livekit.onnx`) |

## Arquitectura y entrenamiento

El modelo se distribuye como un grafo ONNX único (`zaki_livekit.onnx`) que implementa un detector de wake-word con estado. Según la model card, procesa tramas de 80 ms (1280 muestras a 16 kHz mono) y mantiene 9 tensores de estado internos entre tramas, que incluyen cachés KV y estados convolucionales. Este diseño de estado persistente es característico de los modelos Conformer adaptados a streaming, en los que la atención y las convoluciones mantienen contexto entre fragmentos de audio para evitar recalcular el historial completo en cada trama.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de técnicas de alineación (RLHF/DPO) ni detalles sobre el proceso de destilación o cuantización. Tampoco se documentan innovaciones técnicas adicionales más allá del propio diseño stateful orientado a inferencia en CPU.

## Capacidades

- Detección de palabra de activación (wake-word) en streaming para la frase "زاكي" en árabe argelino.
- Procesamiento de audio en tramas de 80 ms (1280 muestras, 16 kHz, mono) con estado interno persistente entre tramas.
- Inferencia en CPU mediante ONNX Runtime.
- Integración con LiveKit a través de un wrapper Python (`detector.py`, clase `StatefulLiveKitDetector`).
- Salida de una puntuación de probabilidad de activación por trama (`predict` devuelve un score tipo float).
- Soporte de idiomas limitado a árabe (`ar`) y árabe argelino (`arq`).
- No se documentan capacidades de transcripción, traducción, tool calling, agentes ni razonamiento; es un modelo especializado exclusivamente en keyword spotting.

## Casos de uso

- Activación por voz en asistentes para hablantes de árabe argelino: el modelo permite detectar la frase "زاكي" como disparador de un asistente conversacional, cubriendo un dialecto escasamente soportado por los wake-words comerciales.
- Integración en aplicaciones de videollamada sobre LiveKit: al estar empaquetado para LiveKit y procesar audio en streaming, puede incorporarse en salas de audio/vídeo para activar funciones manos libres (silenciar, levantar la mano, invocar un bot).
- Dispositivos de borde con CPU limitada: al ejecutarse en ONNX Runtime sobre CPU y con tramas de 80 ms, es adecuado para Raspberry Pi, mini-PC o terminales sin GPU.
- Domótica y control de dispositivos por voz: activación local de comandos en hogares de habla argelina sin depender de servicios en la nube.
- Kioscos y terminales de atención al público: activación de un agente de voz en entornos donde el usuario habla dariya, reduciendo la fricción de idioma.
- Investigación en keyword spotting multilingüe: sirve como referencia para estudiar modelos Conformer stateful en dialectos árabes y comparar estrategias de streaming con estado.
- Filtrado previo en pipelines de ASR: usar la detección de la wake-word para activar la grabación o el envío de audio a un sistema de reconocimiento de voz, ahorrando cómputo y ancho de banda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime.
- GPU recomendadas: no disponibles; no se documenta soporte GPU ni requisitos de aceleración.
- Cabe en GPU consumer: no se dispone de datos; el diseño apunta a inferencia en CPU, por lo que no requeriría GPU.
- Opciones de despliegue: ONNX Runtime (librería `onnxruntime`), con wrapper Python `detector.py` para LiveKit. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. La model card indica procesamiento de tramas de 80 ms, pero no se publican cifras de latencia ni de consumo de CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los wake-words comerciales (por ejemplo, los de plataformas de asistentes) no publican especificaciones equiparables, y no se han identificado en la información disponible alternativas open source específicas para árabe argelino con formato ONNX stateful.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Zaki (s1nju/zaki-livekit-wakeword-onnx) | no disponible | tramas de 80 ms con estado | ar, arq | apache-2.0 | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan datos de entrenamiento, métricas de precisión, tasas de falsos positivos ni benchmarks, lo que impide evaluar su fiabilidad en producción.
- Especialización estrecha: solo detecta la frase "زاكي" en árabe argelino; no es un modelo de propósito general ni un sistema de reconocimiento de voz.
- Sesgos potenciales: al entrenarse para un dialecto concreto, el rendimiento puede degradarse con acentos regionales distintos, ruido ambiental o variaciones de pronunciación no representadas en los datos (no documentados).
- Riesgo de falsos positivos y negativos no cuantificado: sin métricas publicadas no es posible estimar la tasa de activación errónea.
- Limitación de idioma: no cubre otros idiomas ni dialectos árabes más allá de lo indicado en las etiquetas.
- Licencia apache-2.0: permite uso comercial y modificación, pero se recomienda verificar la procedencia de los datos de entrenamiento, no documentada.
- Dependencia de LiveKit y del wrapper `detector.py`: la integración práctica requiere el código auxiliar del repositorio, cuya API puede cambiar sin aviso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/s1nju/zaki-livekit-wakeword-onnx
- Repositorio LiveKit (plataforma de integración): https://github.com/livekit/livekit
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de Hugging Face Hub (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales específicos del modelo.
