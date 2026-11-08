# hello-test1/PhotonTTS

## Resumen

PhotonTTS es un proyecto de modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot y soporte de canto, publicado por el usuario hello-test1 en Hugging Face. Según su model card, el diseño se articula en torno a tres componentes: un backbone de modelo de lenguaje causal que opera a 12,5 Hz sobre latentes continuos de un VAE, una cabeza de flow-matching por parche destilada a 1-2 pasos de inferencia, y un mecanismo de condicionamiento denominado Score Clock orientado a la síntesis de voz cantada.

El modelo se plantea en tres variantes de tamaño: Photon-S (orientada a edge y CPU), Photon-M (GPU de consumo) y Photon-L (entornos con 24 GB o más de VRAM). La propuesta busca un equilibrio entre velocidad de inferencia y naturalidad, apoyándose en la destilación de la cabeza generativa para reducir el número de pasos necesarios en la decodificación.

Es importante señalar que, en el momento de redactar esta ficha, el repositorio se encuentra en estado de andamiaje ("scaffolding") y no contiene pesos publicados. Por tanto, no existen artefactos descargables ni resultados verificables de rendimiento; la información disponible describe únicamente la intención de diseño del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de modelo de lenguaje causal a 12,5 Hz sobre latentes continuos de VAE, con cabeza de flow-matching por parche destilada a 1-2 pasos y condicionamiento Score Clock para canto |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin términos concretos especificados en la model card) |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

La arquitectura descrita combina un backbone autorregresivo de tipo modelo de lenguaje causal que modela latentes continuos de un VAE muestreados a 12,5 Hz. Sobre esa representación, una cabeza de flow-matching opera por parches y ha sido destilada para requerir únicamente 1-2 pasos de inferencia, lo que en principio reduce la latencia frente a esquemas de difusión con decenas de pasos. El condicionamiento Score Clock se presenta como el mecanismo específico para el control temporal en síntesis de voz cantada.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni detalles sobre el proceso de destilación. La model card no incluye resultados de entrenamiento ni artefactos asociados; el estado declarado es de andamiaje sin pesos.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto.
- Clonación de voz zero-shot, según la descripción del autor.
- Síntesis de voz cantada mediante el condicionamiento Score Clock.
- Inferencia rápida por destilación de la cabeza de flow-matching a 1-2 pasos.
- Variantes orientadas a distintos entornos de despliegue: edge/CPU (Photon-S), GPU de consumo (Photon-M) y 24 GB o más de VRAM (Photon-L).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable a la categoría del modelo; no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Clonación de voz para locuciones: el modelo permitiría generar narraciones con una voz de referencia proporcionada por el usuario, útil en producción de audiolibros y contenido editorial, siempre que se publiquen pesos utilizables.
- Doblaje y localización de vídeo: la generación de voz a partir de texto con una voz clonada encajaría en flujos de doblaje, aunque la ausencia de pesos impide evaluar la calidad y la sincronización.
- Asistentes de voz en dispositivos edge: la variante Photon-S, planteada para CPU, estaría pensada para integrarse en asistentes locales con requisitos de cómputo reducidos.
- Síntesis de voz cantada para demos musicales: el condicionamiento Score Clock apunta a la generación de voces cantadas a partir de partituras o indicaciones temporales, aplicable a maquetas y prototipos.
- Accesibilidad: generación de voz sintética para lectores de pantalla y sistemas de comunicación aumentativa, con la posibilidad de personalizar la voz del usuario.
- Prototipado de interfaces conversacionales: un TTS rápido de 1-2 pasos de inferencia reduciría la latencia percibida en agentes de voz, si bien no hay métricas publicadas que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño final de cada variante, que no se ha especificado.
- GPU recomendadas: la model card menciona Photon-L para entornos con 24 GB o más de VRAM (por ejemplo, RTX 3090/4090, A100, H100), Photon-M para GPU de consumo y Photon-S para edge/CPU.
- Compatibilidad con GPU de consumo: prevista mediante Photon-M, sin cifras concretas de memoria.
- Opciones de despliegue: no disponible; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el diseño apunta a 1-2 pasos de inferencia por la destilación de la cabeza de flow-matching, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| PhotonTTS | no disponible | no disponible | other | No (estado de andamiaje) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene pesos; el modelo no es utilizable en la actualidad.
- La licencia figura como "other" sin términos concretos, lo que impide determinar si se permite el uso comercial.
- No se especifican los idiomas soportados ni el dominio de los datos de entrenamiento.
- No hay información sobre sesgos, riesgo de alucinación acústica o calidad de la clonación en voces fuera del dominio de entrenamiento.
- La clonación de voz zero-shot plantea riesgos de suplantación de identidad y requiere consentimiento explícito y controles de uso en producción.
- Al tratarse de un proyecto en fase de andamiaje, la arquitectura descrita puede cambiar sin aviso y no debe tomarse como especificación estable.
- No se documentan requisitos de hardware verificados ni métricas de latencia o throughput.

## Enlaces

- Hugging Face: https://huggingface.co/hello-test1/PhotonTTS
