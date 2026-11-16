# Phoonnx/vits-gl_es-brais-hitz_center-cotovia

## Resumen

`vits-gl_es-brais-hitz_center-cotovia` es un modelo de sintesis de voz (text-to-speech) en gallego desarrollado originalmente por el HiTZ Center y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo subyacente es `HiTZ/TTS-gl_brais`, un sistema VITS entrenado para la variante `gl-ES` del gallego, y esta version anade un front-end fonemizador basado en Cotovia para convertir texto en la secuencia de fonemas que espera la red.

La relevancia de este empaquetado radica en su integracion con el ecosistema OVOS y con la libreria `phoonnx`, que permite ejecutar sintesis de voz en Python sin depender de frameworks de aprendizaje profundo completos, al distribuir los pesos en ONNX. El repositorio ocupa aproximadamente 0,1 GB y esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial.

Se trata de un modelo de un solo hablante (`brais`) orientado a la generacion de audio a partir de texto gallego, sin capacidades multimodales ni de razonamiento. Su utilidad es concreta: dotar de voz a asistentes, lectores de pantalla o interfaces conversacionales en gallego dentro de pipelines ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no acepta contexto de texto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. VITS produce audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

No se dispone de informacion detallada sobre el corpus de entrenamiento (horas de audio, composicion del dataset, hablantes o tecnicas de ajuste fino) en la documentacion proporcionada. El modelo upstream `HiTZ/TTS-gl_brais` fue desarrollado por el HiTZ Center; esta version de Phoonnx solo reempaqueta los pesos en ONNX y anade el front-end fonemizador Cotovia para normalizar el texto de entrada.

## Capacidades

- Sintesis de voz a partir de texto en gallego (`gl-ES`).
- Conversion de texto a fonemas mediante `CotoviaPhonemizer` (libreria `scriptconv`).
- Generacion de audio en formato WAV a traves de la API `voice.synthesize_wav`.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Voz de un solo hablante identificada como `brais`.
- Ejecucion en Python sin dependencias de frameworks de deep learning completos (pesos ONNX).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso.

## Casos de uso

- **Asistentes de voz en gallego**: el modelo puede integrarse en OVOS o en cualquier aplicacion Python que necesite convertir respuestas textuales en audio, usando la API `synthesize_wav` con una latencia baja al ejecutarse sobre ONNX.
- **Lectores de pantalla y accesibilidad**: permite narrar contenido web o documentos en gallego para usuarios con discapacidad visual, con un consumo de recursos reducido (repo de 0,1 GB) que facilita su inclusion en aplicaciones de escritorio.
- **Sistemas de anuncios y megafonia**: idoneo para generar avisos pregrabados o dinamicos en estaciones, aeropuertos o comercios, ya que la sintesis es determinista y no requiere GPU dedicada.
- **Audioguias y contenido educativo**: produccion de narraciones para cursos, museos o materiales divulgativos en gallego, aprovechando la fonemizacion Cotovia para una pronunciacion consistente.
- **Integracion en pipelines de CI/CD para pruebas de voz**: al ser un paquete ONNX ligero, puede ejecutarse en contenedores para validar la salida de audio de aplicaciones antes de desplegarlas.
- **Prototipado de interfaces conversacionales**: desarrolladores que construyen chatbots o IVR en gallego pueden usar el modelo como capa TTS sin necesidad de entrenar su propio sistema.
- **Generacion de contenido multimedia localizado**: creacion de pistas de voz para videos, podcasts o presentaciones dirigidas al publico gallegohablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,1 GB) se estima un consumo muy bajo, inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier modelo consumer moderna (RTX 3060 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion via ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parametros | Licencia | Formato |
|---|---|---|---|---|---|
| `Phoonnx/vits-gl_es-brais-hitz_center-cotovia` | Gallego (`gl-ES`) | VITS | no disponible | Apache 2.0 | ONNX |
| `HiTZ/TTS-gl_brais` (upstream) | Gallego (`gl-ES`) | VITS | no disponible | Apache 2.0 | no disponible |
| Otros modelos VITS de la coleccion Phoonnx | Multiples | VITS | no disponible | Apache 2.0 (segun cada modelo) | ONNX |

La comparativa con alternativas de otros desarrolladores para TTS en gallego no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de un solo hablante: no permite cambiar de voz sin reentrenar o usar otro modelo.
- Solo soporta gallego (`gl-ES`); no es multilingue.
- No dispone de control de prosodia, emocion ni estilo mas alla de lo que el modelo VITS base haya aprendido.
- Riesgo de pronunciacion incorrecta en palabras extranas, neologismos o nombres propios no cubiertos por el fonemizador Cotovia.
- No se han publicado datos sobre sesgos del hablante ni sobre la diversidad del corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `HiTZ/TTS-gl_brais` y del fonemizador Cotovia, que podria tener condiciones distintas.
- Al ser un reempaquetado, las actualizaciones y el soporte dependen de Phoonnx, no del HiTZ Center.
- No apto para tareas de razonamiento, generacion de texto, codigo o vision.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-gl_es-brais-hitz_center-cotovia)
- [Modelo upstream HiTZ/TTS-gl_brais](https://huggingface.co/HiTZ/TTS-gl_brais)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
