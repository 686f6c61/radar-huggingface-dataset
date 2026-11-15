# Phoonnx/vits-bn-custom_male

## Resumen

`Phoonnx/vits-bn-custom_male` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, originalmente entrenado por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo está especializado en bengalí (`bn`) con una voz masculina personalizada, y su propósito es convertir texto en bengalí en audio inteligible dentro de pipelines de asistentes de voz y aplicaciones de TTS.

El modelo no es un LLM ni un transformer generativo de texto: es un sistema TTS de extremo a extremo que combina un codificador de texto, un predictor de duraciones y un decodificador generativo basado en flujos normales y un discriminador adversarial (GAN), siguiendo el diseño original de VITS. Su relevancia radica en que ofrece una alternativa ligera (repo de 0,1 GB) y con licencia Apache-2.0 para TTS en bengalí, un idioma con cobertura limitada en modelos comerciales.

La ficha se basa exclusivamente en la model card y los metadatos publicados en Hugging Face. No se dispone de información sobre el dataset de entrenamiento, el número de parámetros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por caracteres, sin ventana definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | bengalí (`bn`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), publicada por Kim et al. (2021) e implementada en Coqui TTS. VITS combina un codificador de texto basado en transformer, un predictor de duraciones estocástico, un prior normalizing flow y un decodificador generativo basado en HiFi-GAN, entrenado de forma adversarial con un discriminador multiescala. La inferencia es de extremo a extremo: texto a forma de onda en un solo paso, sin necesidad de vocoder externo.

El modelo procede del checkpoint `tts_models--bn--custom--vits_male` de Coqui TTS v0.13.3, entrenado sobre un dataset "custom" en bengalí (no se detalla su composición, número de horas ni número de hablantes). No se dispone de información sobre el proceso de entrenamiento, el uso de RLHF/DPO (no aplicable a TTS) ni innovaciones técnicas adicionales más allá del empaquetado ONNX realizado por Phoonnx para su librería. El front-end de texto utiliza `GraphemePhonemizer` de `scriptconv`, es decir, una conversión directa de grafemas a entrada del modelo sin fonemización explícita.

## Capacidades

- Síntesis de voz a partir de texto en bengalí (`bn`), con salida en formato WAV.
- Voz masculina personalizada (single-speaker), sin control explícito de prosodia ni emoción documentado.
- Integración con la librería `phoonnx` en Python mediante `TTSModelManager` y `voice.synthesize_wav()`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalización y conversión de texto mediante `scriptconv` (grafemas como entrada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; es exclusivamente un modelo TTS.
- No se documenta soporte multilingüe: solo bengalí.

## Casos de uso

- Asistentes de voz en bengalí: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de salida de voz en bengalí a un asistente doméstico, aprovechando el formato ONNX para despliegue ligero en dispositivos de borde.
- Lectura de notificaciones y alertas: aplicaciones móviles o de escritorio pueden sintetizar mensajes cortos en bengalí (recordatorios, alertas de sistema) con un modelo de 0,1 GB que cabe en memoria de dispositivos modestos.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido textual en bengalí (artículos, correos, documentos) en aplicaciones de screen reader, usando la API `synthesize_wav` de phoonnx.
- Audiolibros y contenido narrado: generación de narración masculina en bengalí para podcasts o audiolibros de dominio público, aunque la falta de control de prosodia limita la expresividad en textos largos.
- Prototipado de productos de voz: equipos que desarrollan interfaces conversacionales en bengalí pueden validar flujos de TTS sin coste de licencia (Apache-2.0) antes de invertir en modelos comerciales.
- Sistemas de anuncios públicos: síntesis de avisos en estaciones, aeropuertos o comercios en bengalí, donde la latencia y el tamaño reducido del modelo permiten ejecución en hardware local sin conexión a la nube.
- Investigación en TTS de bajos recursos: servir como línea base reproducible (checkpoint Coqui + empaquetado ONNX) para comparar con modelos más recientes en bengalí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,1 GB) y la arquitectura VITS, es esperable que quepa en menos de 1 GB de memoria, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles; al ser un modelo ONNX ligero, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: previsiblemente sí (cualquier GPU con al menos 1-2 GB de memoria), aunque no se documenta oficialmente.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend subyacente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-bn-custom_male` | VITS | bn | no disponible | no aplica | Apache-2.0 | ONNX |
| Otros modelos VITS de Coqui (p. ej. `tts_models--en--ljspeech--vits`) | VITS | en | no disponible | no aplica | Apache-2.0 / MPL-2.0 según checkpoint | ONNX / PyTorch |
| Modelos TTS multilingües tipo XTTS v2 | Transformer + VQ-VAE | multilingüe | no disponible | no aplica | Coqui Public Model License (no comercial) | PyTorch |
| Modelos TTS comerciales (p. ej. Google Cloud TTS, Azure TTS) | no disponible | multilingüe (incl. bn) | no disponible | no aplica | Propietaria (API de pago) | API |

La comparativa se limita a categorías generales porque no se dispone de datos de benchmarks ni de parámetros para este modelo. Frente a XTTS v2, la diferencia clave es la licencia: Apache-2.0 permite uso comercial, mientras que XTTS v2 usa una licencia restrictiva. Frente a APIs comerciales, la ventaja es el despliegue local y el coste cero de licencia; la desventaja es la falta de control de prosodia y de soporte multilingüe.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una voz única masculina entrenada sobre un dataset "custom" no descrito, puede presentar sesgos de prosodia, acento o registro limitados al corpus de entrenamiento.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas, omisiones o artefactos en palabras fuera del vocabulario de entrenamiento; no hay métricas publicadas de inteligibilidad (MOS, WER) para este checkpoint.
- Limitaciones de idioma: solo bengalí (`bn`); no soporta otros idiomas ni code-switching documentado.
- Limitaciones de contexto: la entrada es por caracteres (grafemas) sin fonemización explícita, lo que puede degradar la pronunciación en palabras irregulares o extranjerismos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card indica que la licencia procede de la lista de modelos de Coqui TTS; conviene verificar los términos del checkpoint upstream antes de un despliegue comercial.
- Caveats para producción: no hay información sobre latencia, throughput ni estabilidad en cargas concurrentes; el modelo tiene 25 descargas y 0 likes, lo que sugiere poca validación comunitaria. La fecha de creación indicada (2026-11-14) es futura respecto a la fecha habitual de consulta, lo que conviene contrastar.
- Calidad de voz: sin benchmarks ni demos publicadas, no es posible garantizar calidad de estudio; se recomienda evaluar con MOS subjetivo antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-bn-custom_male
- Checkpoint upstream Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.13.3_models/tts_models--bn--custom--vits_male.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
