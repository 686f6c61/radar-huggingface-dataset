# laion/Humaneness-Voice-Large-1.6-Alpha

## Resumen

Humaneness Voice Large 1.6 Alpha es un modelo de texto a voz (TTS) expresivo y multilingüe desarrollado por LAION. Su propósito es generar habla natural con control fino a nivel de frase: instrucciones de interpretación ("acting directions"), emociones, pausas, duraciones y eventos no verbales, con la opción de condicionar la salida a un audio de referencia de hablante. Resuelve el problema clásico de los TTS tradicionales, que producen voz plana y difícil de dirigir, ofreciendo en su lugar un formato de prompt tipo guion teatral.

La versión 1.6 no incorpora entrenamiento adicional: es la fusión del modelo base Humaneness Voice Large 1.5 Alpha con el adaptador RealSpeech de rango 4, fusionado una única vez a fuerza 1.0. Se trata de un modelo grande, con unos 16,5 GB de pesos, disponible en safetensors y compatible con la librería Transformers mediante código personalizado (`trust_remote_code=True`). Es relevante ahora porque la síntesis de voz expresiva y controlable es una de las fronteras actuales del audio generativo, y este modelo publica manuales extensos de prompting y estudios de escucha para validar sus recetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer generativo de códigos de audio, decodificado con codec externo) |
| Parámetros totales | no disponible (aprox. 16,5 GB de pesos en FP32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (hasta 14,96 s de audio de referencia, 63–187 frames de codec; generación hasta 240 frames por defecto) |
| Tipos de cuantización | no disponible (pesos almacenados en FP32, cómputo en BF16) |
| Idiomas soportados | inglés, alemán, francés, neerlandés, español |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (4 shards) |

## Arquitectura y entrenamiento

El modelo genera códigos de audio que se decodifican mediante el tokenizador de audio externo MOSS Audio Tokenizer v2 (OpenMOSS Team), cuyos pesos se descargan por separado. Permite condicionar la generación mediante un WAV de referencia de hablante (audio limpio de un solo hablante, mínimo 5,04 segundos, recortado a 14,96 segundos antes de la codificación, reteniendo entre 63 y 187 frames de codec) o mediante alias registrados en un catálogo de voces. La inferencia admite guidance por CFG (classifier-free guidance) ajustable.

No hay entrenamiento en esta versión: 1.6 es una fusión (merge) del modelo base 1.5 Alpha con un adaptador LoRA RealSpeech de rango 4 a fuerza 1.0. No se ha publicado información sobre el corpus de entrenamiento original, número de tokens ni etapas de alineamiento. Las directrices de interpretación se especifican en inglés incluso cuando el habla generada es en alemán, francés, neerlandés o español.

## Capacidades

- Síntesis de texto a voz expresiva con directrices de actuación a nivel de frase: 40 emociones, 15 estilos de habla y 14 casos límite documentados por política.
- Control de pausas y duraciones por segmento mediante corchetes en el prompt (por ejemplo, `[0.3 seconds pause]`), con presupuesto total de segundos configurable.
- Eventos no verbales solicitables entre paréntesis (risas, etc.).
- Condicionamiento por hablante mediante WAV de referencia o alias de voz del catálogo.
- Multilingüe: generación de habla en inglés, alemán, francés, neerlandés y español.
- Ajuste fino del comportamiento mediante CFG (guidance) y, en el modelo padre 1.5, una familia de adaptadores especialista adicionales (rango 32).
- Integración como agente/herramienta: entrada de agente documentada, registro JSON compacto y compilador de recetas (`infer_recipe.py`).
- API de Python para construcción de mensajes, generación con semilla y decodificación a waveform.

## Casos de uso

- Producción de audiolibros y narración: el formato de guion permite dirigir la interpretación frase a frase (tono, pausas, emociones), lo que es adecuado para narrativa con cambios de ánimo.
- Doblahe y locución multilingüe: soporta cinco idiomas europeos con directrices en inglés, útil para producir la misma pieza en varias lenguas manteniendo la dirección escénica.
- Clonación o consistencia de voz: con un WAV de referencia limpio de al menos 5 segundos se condiciona la salida a un hablante concreto, útil para branding de voz o continuidad de personaje.
- Asistentes de voz y agentes conversacionales: existe documentación específica de integración como herramienta (AGENT_ENTRY.md y registro JSON), con generación por semilla reproducible.
- Prototipado de experiencias de voz expresiva: el control de duraciones y pausas permite ajustar el timing para interfaces de voz, juegos o IVR expresivos.
- Investigación en TTS expresivo: los manuales con 138 pares de recetas condicionales/neutras y los estudios de escucha publicados permiten reproducir comparaciones sistemáticas entre configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un estudio de escucha comparativo entre configuraciones (estándar, manual, CFG y adaptadores) y un estudio de rangos de RealSpeech, así como canaries de validación del cargador público en `stats/validation.json`, pero sin métricas numéricas objetivas (MOS, WER, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM: aproximadamente 32 GB de memoria pico de GPU en el estudio validado de dos semillas (pesos en FP32, cómputo en BF16, más activaciones, KV cache y codec externo); no es un máximo para todas las longitudes de secuencia.
- GPU de referencia en la pila probada: NVIDIA GH200 (Python 3.13, PyTorch 2.9.1, CUDA 12.8, Transformers 5.14.1, Accelerate 1.14.0).
- No cabe en GPUs de consumo típicas de 24 GB (RTX 3090/4090) según los datos publicados; se recomienda hardware de centro de datos (A100/H100/GH200).
- Requiere descargar además los pesos del MOSS Audio Tokenizer v2 como codec externo.
- Despliegue mediante el script `infer.py` incluido o la API de Python del repositorio; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Condicionamiento por hablante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Humaneness Voice Large 1.6 Alpha | TTS expresivo con direcciones de actuación | en, de, fr, nl, es | Sí (WAV de referencia o alias) | CC-BY-4.0 | Pesos públicos en HuggingFace |
| MOSS Audio Tokenizer v2 | Codec/tokenizador de audio (componente, no TTS completo) | no disponible | no disponible | no disponible | Pesos públicos en HuggingFace |
| Humaneness Voice Large 1.5 Alpha | TTS expresivo (modelo base, sin fusión RealSpeech) | en, de, fr, nl, es | Sí | CC-BY-4.0 | Pesos públicos en HuggingFace |

No se dispone de datos comparativos de rendimiento con otros sistemas TTS expresivos de la categoría (por ejemplo, modelos comerciales o de la comunidad) en la información proporcionada.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`: el código personalizado del modelo debe revisarse y fijarse antes de su uso en producción.
- El repositorio advierte explícitamente que la existencia de una receta para cada objetivo no garantiza que todos los objetivos se produzcan de forma fiable; hay gates fallidos y casos no validados documentados.
- Las duraciones indicadas en el prompt son peticiones, no garantías de timing exacto.
- El audio de referencia debe ser limpio, de un solo hablante y de otra emisión; la calidad del clon depende de ello.
- Las directrices de interpretación deben escribirse en inglés aunque el habla sea en otro idioma.
- Consumo de memoria elevado (aprox. 32 GB pico), lo que limita el despliegue en hardware de consumo.
- Sesgos conocidos, riesgo de alucinación del contenido hablado y restricciones adicionales de la licencia CC-BY-4.0 más allá de la atribución: no disponible en la información proporcionada.
- El uso de clonación de voz con referencia de hablante puede plantear riesgos legales y éticos (suplantación, consentimiento) que deben gestionarse en cada despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Humaneness-Voice-Large-1.6-Alpha
- Modelo base (1.5 Alpha): https://huggingface.co/laion/Humaneness-Voice-Large-1.5-Alpha
- Adaptadores especialista (rango 32): https://huggingface.co/laion/Humaneness-Voice-Large-1.5-Intense-Bucket-LoRAs
- Adaptadores históricos RealSpeech: https://huggingface.co/laion/Humaneness-Voice-Large-1.5-RealSpeech-LoRAs
- Codec externo MOSS Audio Tokenizer v2: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Manual completo de 1.6 (en el repositorio): manuals/MANUAL_1_6_WITH_ADAPTERS.md
- Manual original de 1.5 (en el repositorio): manuals/MANUAL_1_5_ORIGINAL.md
- Space con manuales de prompting y demos: https://laion-humaneness-voice-large-prompting-manuals.static.hf.space/synthesis/index.html
- Comparaciones de escucha (estándar/manual/CFG/adaptadores): https://laion-humaneness-voice-large-intense-bucket-loras.static.hf.space/#manual-comparison
- Estudio de rangos RealSpeech: https://laion-humaneness-voice-large-alpha-comparisons.static.hf.space/real-speech-ranks.html
- Validación de la release: stats/validation.json (en el repositorio)
