# Phoonnx/vits-ne_np-seto_bagh-espeak

## Resumen

`vits-ne_np-seto_bagh-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Wiseyak a partir de su proyecto `Wiseyak/piper_tts` y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo está especializado en nepalí (`ne-NP`) y convierte texto en fonemas mediante espeak-ng antes de generar la forma de onda de audio.

La relevancia de este modelo radica en su formato: se distribuye como pesos ONNX dentro de un repositorio de apenas 0,1 GB, lo que lo hace apto para inferencia en CPU y en dispositivos con recursos limitados, sin necesidad de GPU. Forma parte de la colección de voces VITS empaquetadas por Phoonnx para su integración en el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

Se trata de un modelo de nicho, con 19 descargas y sin resultados de benchmarks publicados. Su interés principal es cubrir una lengua de bajos recursos como el nepalí dentro de un ecosistema de TTS open source, no competir en calidad con sistemas multilingües de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el tamaño del repo, 0,1 GB, sugiere un modelo compacto) |
| Idiomas soportados | nepalí (`ne-NP`) |
| Licencia | openrail |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico, un decodificador generativo basado en normalizing flows y un discriminador adversarial multiperiodo para el entrenamiento. El resultado es un modelo que genera directamente la forma de onda a partir de fonemas, sin necesidad de un vocoder separado.

El modelo original fue entrenado por Wiseyak dentro de su proyecto `piper_tts`, orientado a producir voces compatibles con el ecosistema Piper. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o ajuste fino. El front-end textual utiliza fonemas en alfabeto IPA generados por espeak-ng, y Phoonnx delega la normalización y conversión a su librería `scriptconv` mediante el fonemizador `EspeakPhonemizer`. El autor advierte que el uso del port espyak en lugar de espeak-ng puede producir pronunciaciones incorrectas en algunas palabras.

## Capacidades

- Síntesis de voz a partir de texto en nepalí (`ne-NP`), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng como front-end.
- Inferencia sobre pesos ONNX, ejecutable en CPU sin GPU dedicada.
- Integración con la librería Python `phoonnx` mediante `TTSModelManager`.
- Integración con el asistente de voz OVOS a través de `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, agentes, visión, audio de entrada ni modos de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- **Síntesis de voz para aplicaciones en nepalí**: el modelo convierte texto en audio WAV mediante `voice.synthesize_wav()`, adecuado para leer contenido escrito en nepalí en aplicaciones de accesibilidad o lectura de noticias.
- **Asistente de voz OVOS**: se configura como módulo TTS en `mycroft.conf` seleccionando la voz `piper_community/Wiseyak/ne-NP_seto_bagh`, lo que permite dotar de voz nepalí a un asistente doméstico open source.
- **Generación de audiolibros o pódcasts en nepalí**: al ser un modelo compacto y ejecutable en CPU, permite procesar lotes de texto de forma económica sin infraestructura GPU.
- **Sistemas de respuesta vocal en kioscos o IVR**: integrable en pipelines de atención automatizada para usuarios nepalíes, con latencia baja al no requerir acelerador hardware.
- **Prototipado de interfaces de voz en el navegador**: mediante `phoonnx.js` y la demo de TigreGotico, se puede probar la voz en cliente sin backend.
- **Investigación en TTS para lenguas de bajos recursos**: sirve como punto de partida o referencia para experimentos con VITS en nepalí, dado su formato ONNX abierto y licencia permisiva.
- **Generación de material educativo audio**: conversión de textos didácticos en nepalí a audio para entornos con baja alfabetización o conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues; el modelo se ejecuta en CPU. El repositorio ocupa 0,1 GB, por lo que la huella en memoria es reducida (del orden de cientos de MB incluyendo runtime ONNX).
- GPU recomendadas: no necesarias. Cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede acelerar la inferencia, pero no es un requisito.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer, e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| vits-ne_np-seto_bagh-espeak | VITS | nepalí (`ne-NP`) | no aplica | openrail | ONNX |
| Wiseyak/piper_tts (upstream) | VITS / Piper | múltiples (incluye nepalí) | no aplica | openrail | Piper/ONNX |
| Otras voces de la colección VITS de Phoonnx | VITS | varios idiomas | no aplica | según voz | ONNX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo sintetiza nepalí (`ne-NP`); no soporta otros idiomas.
- Dependencia de espeak-ng: sin él, la calidad de pronunciación puede degradarse; el uso del port espyak puede producir errores en algunas palabras, según advierte el autor.
- No se han publicado métricas objetivas de calidad (MOS, WER) ni benchmarks, por lo que la evaluación de calidad debe hacerse empíricamente.
- Riesgo de alucinación no aplica en el sentido textual, pero sí existe riesgo de pronunciación incorrecta o entonación antinatural en textos fuera del dominio de entrenamiento.
- El modelo tiene un uso muy reducido (19 descargas, 0 likes), lo que implica escasa validación comunitaria.
- Licencia openrail: permite uso comercial con condiciones; conviene revisar los términos exactos de la licencia OpenRAIL aplicable antes de desplegarlo en producción.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un corpus limitado de una lengua de bajos recursos, puede reflejar sesgos del dataset original.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-ne_np-seto_bagh-espeak)
- [Upstream Wiseyak/piper_tts](https://huggingface.co/Wiseyak/piper_tts)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en navegador](https://tigregotico.pt/demo)
