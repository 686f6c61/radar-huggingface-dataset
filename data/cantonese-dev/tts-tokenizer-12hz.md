# cantonese-dev/tts-tokenizer-12hz

## Resumen

`cantonese-dev/tts-tokenizer-12hz` es un tokenizador neuronal para síntesis de voz (TTS) publicado por el colectivo `cantonese-dev` en Hugging Face bajo licencia Apache 2.0. No es un modelo generativo de texto ni un sistema TTS completo: es el componente de tokenización que convierte audio en una secuencia de tokens discretos a una frecuencia de trama de 12 Hz, es decir, 12 tokens por segundo de audio. Con 170.557.441 parámetros (unos 170,6 millones) y un repositorio de 0,7 GB en formato safetensors, se sitúa en la gama de los códecs neuronales de audio de tamaño medio.

El modelo resuelve un problema concreto en pipelines TTS modernos: la necesidad de una representación discreta y compacta del audio que pueda ser modelada por un transformer autorregresivo o por un modelo de difusión. Al operar a 12 Hz, reduce drásticamente la longitud de secuencia frente a enfoques que trabajan a 50 Hz o 75 Hz (como los tokens de EnCodec o DAC), lo que abarata el modelado de contexto largo y facilita la generación de audio de varios segundos con ventanas de atención razonables.

La relevancia actual del modelo está en su orientación al cantonés, una lengua con muy poca representación en el ecosistema TTS open source, que tradicionalmente se ha centrado en inglés, mandarín y lenguas europeas. La información pública disponible es muy escasa: la model card es prácticamente vacía (solo contiene la palabra "tokenizer") y no se han publicado detalles de arquitectura, dataset de entrenamiento ni benchmarks. Esta ficha refleja, por tanto, un nivel de incertidumbre alto en todo lo que no sea el recuento de parámetros y los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tokenizador neuronal de audio; no se especifica el tipo de encoder/decoder) |
| Parámetros totales | 170.557.441 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (frecuencia de trama de 12 Hz; la longitud de secuencia depende de la duración del audio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere cantonés, sin confirmación en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El identificador `tts_tokenizer_12hz` y la etiqueta del repositorio indican que se trata de un tokenizador de audio con una tasa de trama de 12 Hz, pero la model card no describe si emplea un encoder convolucional, un encoder tipo transformer, un RVQ (residual vector quantization) o una combinación. Tampoco se detalla el tamaño del vocabulario de tokens, el número de codebooks ni la dimensionalidad de las representaciones latentes.

Respecto al entrenamiento, no hay datos disponibles sobre el número de horas de audio, la composición del corpus, el idioma o dialectos cubiertos, ni sobre si se aplicaron técnicas de alineamiento, destilación o ajuste fino. La ausencia de esta información impide evaluar la calidad de la tokenización, la fidelidad de reconstrucción o la robustez frente a ruido y hablantes no vistos. Cualquier uso en producción debería ir precedido de una validación empírica propia.

## Capacidades

- Tokenización de audio a 12 Hz: convierte formas de onda en secuencias discretas con 12 tokens por segundo de audio, adecuadas para ser modeladas por un transformer autorregresivo o por modelos de difusión.
- Reconstrucción de audio: al ser un tokenizador de un pipeline TTS, se presupone la existencia de un decoder complementario que revierte los tokens a forma de onda, aunque no se documenta en el repositorio.
- Orientación al cantonés: el nombre del autor y del repositorio apuntan a este idioma, si bien la model card no lo confirma ni especifica cobertura multilingüe.
- Integración en pipelines TTS: pensado como componente intermedio entre el modelo acústico y el vocoder.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica a un tokenizador de audio.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio de entrada adicional: no disponible.

## Casos de uso

- Construcción de un pipeline TTS en cantonés: el tokenizador se usaría para convertir el audio de referencia o el audio objetivo en tokens de 12 Hz que un modelo acústico pueda predecir; su tasa de trama baja reduce la longitud de secuencia y, con ello, el coste de atención en la generación.
- Modelado de audio de contexto largo: con 12 tokens por segundo, 60 segundos de audio ocupan 720 tokens, una longitud manejable para transformers con ventanas de contexto moderadas, lo que facilita la generación de locuciones extensas o conversaciones de varios turnos.
- Entrenamiento de modelos acústicos sobre representaciones discretas: los tokens sirven como objetivo de entrenamiento para modelos autorregresivos o de difusión discretos, un patrón habitual en TTS neuronales modernos.
- Investigación en lenguas de bajos recursos: al estar orientado al cantonés y publicarse con licencia Apache 2.0, es un punto de partida para experimentos académicos con habla cantonesa, un idioma con escasa cobertura en el ecosistema TTS.
- Prototipado de sistemas de voz para asistentes y atención al cliente: integrado con un vocoder y un modelo de lenguaje, permite construir demos de síntesis en cantonés sin depender de APIs propietarias.
- Fine-tuning sobre dominios específicos: al ser un componente pequeño (0,7 GB) y con licencia permisiva, se puede ajustar o adaptar a otros dialectos yue o a dominios concretos (lectura de noticias, audiolibros) sin restricciones comerciales.
- Compresión y almacenamiento de audio: la representación a 12 Hz puede emplearse como formato intermedio compacto para archivos de voz, siempre que se valide la fidelidad de reconstrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 170,6 millones de parámetros, en FP16 ocuparía aproximadamente 0,34 GB de pesos, y en FP32 unos 0,68 GB, a lo que habría que sumar memoria para activaciones y para el decoder/vocoder asociado.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el tokenizador en FP16, aunque la ausencia de documentación impide confirmar requisitos reales.
- GPU de consumo: previsiblemente cabe en tarjetas consumer como RTX 3060, RTX 4060 o superiores, siempre que el pipeline completo (modelo acústico y vocoder) quepa junto a él.
- Opciones de despliegue: no disponibles; al ser pesos safetensors, requeriría cargarse con PyTorch o con un runtime compatible, pero no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a tokenizadores de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tasa de trama | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cantonese-dev/tts-tokenizer-12hz | 170,6 M | 12 Hz | no disponible | Apache 2.0 | Hugging Face |
| EnCodec (Meta) | ~15 M (24 kHz, 6 kbps) | 75 Hz | no aplica | CC BY-NC 4.0 (versión original) | Hugging Face, código abierto |
| DAC (Descript) | ~75 M (24 kHz) | 75 Hz | no aplica | MIT (código) / CC BY-NC 4.0 (pesos en algunas variantes) | GitHub, Hugging Face |
| SoundStream (Google) | ~30 M | 50 Hz | no aplica | no disponible públicamente | paper |

La comparación es aproximada: los datos de los modelos alternativos provienen de sus publicaciones y pueden variar según la configuración. La principal diferencia del modelo de `cantonese-dev` es su tasa de 12 Hz, más baja que la de los códecs neuronales convencionales, lo que reduce la longitud de secuencia a costa de una posible pérdida de detalle acústico que no se ha cuantificado públicamente.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card solo contiene la palabra "tokenizer", lo que impide conocer la arquitectura, el vocabulario, el número de codebooks y las condiciones de entrenamiento.
- Idiomas no confirmados: aunque el nombre sugiere cantonés, no hay confirmación oficial ni datos sobre cobertura de otros dialectos yue o del mandarín.
- Sin benchmarks: no se puede evaluar la fidelidad de reconstrucción, la inteligibilidad ni la robustez frente a ruido, acentos o hablantes no vistos.
- Riesgo de alucinación acústica: como cualquier tokenizador generativo de audio, puede producir artefactos o sonidos inexistentes en la señal original, especialmente en pasajes con ruido o silencios.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar si el pipeline completo (modelo acústico y vocoder) usa componentes con licencias distintas.
- Repositorio con muy poca tracción: 68 descargas y 2 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte comunitario o correcciones.
- Fecha de creación futura en los metadatos (2026-11-08): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.
- Sin garantías de mantenimiento: no se documenta una hoja de ruta ni un proceso de soporte por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/cantonese-dev/tts-tokenizer-12hz
