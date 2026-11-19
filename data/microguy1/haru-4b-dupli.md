# Microguy1/Haru-4B-DUPLI

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado continuo en full-duplex, desarrollado por Microguy1 (con código y documentación técnica publicados por higurashi-ai). A diferencia de los pipelines de voz tradicionales que encadenan ASR, LLM y TTS en turnos estrictos, Haru-4B escucha y habla simultáneamente, como en una llamada telefónica. El modelo procesa y emite audio a 7,5 Hz: cada 133 ms consume un frame de audio del usuario y genera un frame de audio propio más un token de texto.

La arquitectura combina un backbone de lenguaje Qwen3.5-4B (32 capas, dimensión oculta 2560) con un códec de audio causal de VibeVoice a 24 kHz y una cabeza MLP de 4 capas con muestreo MeanFlow que genera latentes de audio de 64 dimensiones en un único paso. Los pesos suman 5.270.000.897 parámetros en bfloat16 (~10,6 GB en el repositorio). Soporta nueve idiomas y control de personaje mediante tarjeta de texto y de voz mediante clip de referencia.

Es relevante porque aborda el problema de la latencia y la naturalidad en interfaces conversacionales por voz: al integrar audio de usuario, audio del modelo y texto del modelo en una sola posición del transformer, elimina la espera entre turnos y permite solapamiento real. Se distribuye como modelo base preentrenado para investigación bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) + códec de audio causal VibeVoice + cabeza MLP MeanFlow |
| Parametros totales | 5.270.000.897 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se organiza en cuatro componentes: un language model Qwen3.5-4B de 32 capas y dimensión oculta 2560; un códec acústico causal de VibeVoice a 24 kHz que produce un latente por cada 3200 muestras; una cabeza MLP de 4 capas con muestreo MeanFlow que genera el latente de audio en un solo paso (guidance scale configurable entre 1 y 2, por defecto 1,5); y proyecciones de entrada para audio de usuario y audio del modelo. La tasa de frame es de 7,5 Hz (133 ms por frame). En cada frame, el latente de audio del usuario, el token de texto previo del modelo y el latente de audio previo del modelo se suman en una única posición del language model, cuya salida predice el siguiente token de texto y el siguiente latente de audio. No hay transformer de audio separado ni tokens de audio discretos.

El control de personaje se realiza mediante un system prompt con formato fijo (tarjeta de personaje) y el control de voz mediante un clip de referencia de un solo hablante de entre 3 segundos y 3 minutos. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo se distribuye como base preentrenado, no como asistente ajustado por instrucciones.

## Capacidades

- Diálogo hablado full-duplex nativo: escucha y habla simultáneamente con frames de 133 ms.
- Generación conjunta de audio y texto por frame (3200 muestras de entrada y 3200 de salida a 24 kHz).
- Síntesis de voz condicionada a un clip de referencia (voice cloning con consentimiento).
- Control de personaje mediante tarjeta de texto con formato fijo.
- Multilingüismo en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Conversación multi-turno continua sin segmentación por turnos.
- Generación de audio en un único paso de muestreo (MeanFlow), sin transformer de audio adicional.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.

## Casos de uso

- Atención al cliente por voz en tiempo real: el full-duplex a 133 ms permite interrupciones y solapamiento natural, adecuado para líneas de soporte donde la latencia de turno degrada la experiencia.
- Asistentes telefónicos y centralitas virtuales: el modelo mantiene una conversación continua sin esperar a que el usuario termine de hablar, imitando el comportamiento de una llamada.
- Práctica de idiomas con tutor conversacional: al soportar nueve idiomas y voz personalizable, puede configurarse con un personaje y una voz concretos para sesiones de conversación guiada.
- Investigación en interacción humano-máquina: modelo base para experimentos sobre solapamiento, turn-taking y latencia en diálogo hablado.
- Aplicaciones de accesibilidad: interfaz de voz bidireccional de baja latencia para usuarios con movilidad reducida, con voces de referencia autorizadas.
- Prototipado de personajes interactivos: la combinación de tarjeta de personaje y clip de voz permite desplegar avatares conversacionales en demos y entornos controlados.
- Evaluación de pipelines de audio en producción: integrable mediante el plugin de vLLM-Omni para medir throughput y latencia en despliegues con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB en bfloat16 según la model card (pesos de 5.270.000.897 parámetros más códec y cabeza).
- GPU recomendadas: NVIDIA con al menos 12 GB de memoria; la model card no detalla modelos concretos (A100, H100, RTX 4090) ni cifras de throughput.
- GPU de consumo: viable en tarjetas con 12 GB o más de VRAM en bfloat16; no se documentan requisitos para cuantizaciones de menor precisión.
- Opciones de despliegue: servidor PyTorch incluido en el repositorio (`python -m haru.server`), implementación MLX con app nativa para macOS y plugin para vLLM-Omni.
- Latencia: frame de 133 ms; se recomienda audio por cable, ya que Bluetooth añade 100 ms o más.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Idiomas | Licencia |
|---|---|---|---|---|---|
| Haru-4B | 5.270.000.897 | no disponible | Sí, 7,5 Hz | 9 | Apache 2.0 |
| Modelos speech-to-speech por turnos (ASR+LLM+TTS) | variable | variable | No | variable | variable |
| Modelos de diálogo hablado con tokens de audio discretos | variable | variable | Limitado | variable | variable |

No se dispone en la información proporcionada de modelos comparables concretos con parámetros, contexto y rendimiento verificables; la comparativa se limita a categorías arquitectónicas.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: no es una fuente fiable de hechos y no sigue instrucciones como un asistente ajustado.
- Riesgo de alucinación en el contenido textual generado.
- Puede imitar la voz de un clip de referencia; solo deben usarse voces sobre las que se tenga derecho.
- No se documentan sesgos conocidos, pero al ser un modelo multilingüe preentrenado cabe esperar sesgos en los datos de entrenamiento no especificados.
- Longitud de contexto no disponible; el diseño está orientado a diálogo continuo por frames, no a contextos largos de texto.
- No se documenta soporte de tool calling ni de razonamiento agéntico.
- El despliegue de baja latencia requiere hardware con al menos 12 GB de VRAM y audio por cable; Bluetooth añade latencia.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso de voces clonadas recae en el desplegador.

## Enlaces

- Hugging Face: https://huggingface.co/Microguy1/Haru-4B-DUPLI
- Repositorio de código: https://github.com/higurashi-ai/Haru
- Blog técnico: https://blog.higurashi.ai/melte/haru4b/
- Blog técnico en japonés: https://blog.higurashi.ai/melte/haru4b-ja/
