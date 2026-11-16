# Phoonnx/vits-gl_es-iago-hitz_center-cotovia

## Resumen

`vits-gl_es-iago-hitz_center-cotovia` es un modelo de síntesis de voz (text-to-speech) para gallego, desarrollado originalmente por el HiTZ Center (Universidad del País Vasco) bajo el identificador `HiTZ/TTS-gl_iago`. Esta ficha corresponde al empaquetado en formato ONNX realizado por Phoonnx para su librería homónima de TTS basada en ONNX Runtime, lo que facilita su despliegue en entornos Python y en el asistente de voz OVOS sin necesidad de dependencias de PyTorch.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema end-to-end que combina un encoder de texto, un predictor de duración, un normalizing flow y un decoder generativo para producir audio directamente a partir de fonemas. El front-end textual utiliza el fonemizador Cotovia, que convierte el texto gallego en fonemas según el alfabeto Cotovia.

El interés de este modelo reside en su especialización: cubre una lengua de bajos recursos como el gallego, con licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB, lo que lo hace adecuado para despliegues ligeros en local y en sistemas embebidos. No obstante, la información pública disponible es limitada y no se han publicado métricas de calidad ni detalles de entrenamiento más allá de los indicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con normalizing flow y decoder generativo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin contexto conversacional) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz end-to-end que integra en un único modelo un encoder de texto condicionado por fonemas, un predictor de duración estocástico, un normalizing flow que modela la variabilidad prosódica y un decoder generativo (habitualmente un HiFi-GAN) que produce la forma de onda. Esta integración permite entrenar el sistema de forma conjunta con pérdidas adversarias y de reconstrucción, evitando pipelines separados de alineamiento y vocoder.

El modelo original fue entrenado por el HiTZ Center sobre corpus de voz en gallego; sin embargo, la model card no especifica el número de horas de audio, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino adicional. El empaquetado de Phoonnx no modifica los pesos, sino que los exporta a ONNX y los integra con la librería `scriptconv` para la normalización textual y la fonemización mediante `CotoviaPhonemizer` del módulo `scriptconv_copyleft.phonemizers.gl`.

## Capacidades

- Síntesis de voz a partir de texto en gallego (`gl-ES`).
- Conversión de texto a fonemas mediante el alfabeto y fonemizador Cotovia.
- Generación de audio en formato WAV a través de la API de phoonnx (`voice.synthesize_wav`).
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Selección de voz mediante el identificador `hitz/gl_iago-vits` en la configuración de OVOS.
- Ejecución sobre ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.

## Casos de uso

- Asistentes de voz en gallego: el modelo se integra como motor TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en gallego en asistentes domésticos o de escritorio.
- Lectura de contenido web o documentos: dado su reducido tamaño (0,1 GB) y ejecución sobre ONNX Runtime, puede desplegarse en servidores modestos para convertir artículos o notificaciones en audio.
- Accesibilidad para personas con discapacidad visual: síntesis de texto a voz en gallego para lectores de pantalla y aplicaciones de accesibilidad.
- Sistemas de megafonía y avisos automatizados: generación de anuncios pregrabados en gallego para transporte, comercio o administración pública.
- Prototipado de aplicaciones de voz: al ser un paquete ONNX ligero con licencia Apache 2.0, es adecuado para pruebas de concepto y desarrollo rápido de interfaces de voz.
- Investigación en TTS para lenguas de bajos recursos: sirve como referencia reproducible para experimentos con VITS en gallego y para comparaciones con otros sistemas TTS.
- Localización de contenidos multimedia: doblaje o sustitución de voz en vídeos y podcasts dirigidos a audiencia gallegohablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se estima un consumo inferior a 1 GB, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible; al ejecutarse sobre ONNX Runtime, puede funcionar en CPU y en GPUs de gama baja, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido tamaño del paquete, aunque no se detalla en la model card.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución sobre ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Contexto |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-gl_es-iago-hitz_center-cotovia` | VITS | Gallego | 0,1 GB (repo) | Apache 2.0 | ONNX | no aplica |
| `HiTZ/TTS-gl_iago` | VITS | Gallego | no disponible | Apache 2.0 | no disponible | no aplica |
| Otros modelos VITS de la colección Phoonnx | VITS | Varios | variable | variable | ONNX | no aplica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La información pública es escasa: no se detallan parámetros, datos de entrenamiento ni métricas de calidad (MOS, WER, etc.).
- El modelo está limitado al gallego (`gl-ES`); no soporta otros idiomas ni cambio de voz o estilo.
- Al ser un modelo TTS, no dispone de contexto conversacional ni de razonamiento multi-turno.
- Riesgo de errores de pronunciación en palabras extranjeras, siglas o nombres propios no cubiertos por el fonemizador Cotovia.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus concreto puede reflejar las características demográficas y dialectales de dicho corpus.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y condiciones del corpus original de HiTZ antes de un despliegue en producción.
- El empaquetado depende de `scriptconv` y del extra `scriptconv[gl]`; la disponibilidad futura de estas dependencias no está garantizada por el autor del empaquetado.

## Enlaces

- [Hugging Face: Phoonnx/vits-gl_es-iago-hitz_center-cotovia](https://huggingface.co/Phoonnx/vits-gl_es-iago-hitz_center-cotovia)
- [Modelo original: HiTZ/TTS-gl_iago](https://huggingface.co/HiTZ/TTS-gl_iago)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección de modelos VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
