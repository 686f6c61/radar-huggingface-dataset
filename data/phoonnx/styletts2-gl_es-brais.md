# Phoonnx/styletts2-gl_es-brais

## Resumen

styletts2-gl_es-brais es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por Proxecto Nós bajo el identificador `proxectonos/Nos_StyleTTS2-Brais-GL` y empaquetado para la librería ONNX `phoonnx` por el usuario Phoonnx. El modelo está especializado en la variedad de gallego `gl-ES` y toma como entrada texto representado en el alfabeto y fonemas Cotovia, el front-end fonético empleado por el ecosistema phoonnx.

La relevancia de esta ficha radica en que se trata de un modelo TTS de un idioma de bajos recursos (gallego) con licencia Apache 2.0, lo que facilita su integración en aplicaciones comerciales y en asistentes de voz de código abierto como OVOS. El repositorio ocupa 0,8 GB y se distribuye en formato ONNX, lo que permite inferencia en CPU sin necesidad de GPU dedicada.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento más allá de lo indicado en la model card del autor. La información disponible se limita al pipeline, idioma, licencia y modo de uso a través de phoonnx y scriptconv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que combina un codificador de estilo y un decodificador basado en difusión para generar audio de alta calidad, con un enfoque en la clonación de voz a partir de audio de referencia. El modelo `styletts2-gl_es-brais` es una adaptación de esta arquitectura al gallego, realizada por Proxecto Nós, y empaquetada en ONNX para su uso con la librería phoonnx.

El front-end de texto utiliza el fonemizador Cotovia (`CotoviaPhonemizer` del módulo `scriptconv.phonemizers.gl`), que normaliza el texto y lo convierte en la secuencia de fonemas que consume el modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo clona la voz de un hablante a partir de audio de referencia, lo que sugiere un uso de embeddings de estilo o speaker.

## Capacidades

- Síntesis de voz en gallego (`gl-ES`) a partir de texto.
- Clonación de voz de un hablante a partir de audio de referencia.
- Entrada de texto en alfabeto y fonemas Cotovia.
- Integración con la librería phoonnx para Python.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Generación de audio en formato WAV.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz en gallego: el modelo puede integrarse en OVOS como módulo TTS para responder en gallego en asistentes domésticos o de escritorio, usando el plugin `ovos-tts-plugin-phoonnx` y seleccionando la voz `proxectonos/brais-styletts2`.
- Lectura de textos y artículos: síntesis de contenido escrito en gallego para aplicaciones de accesibilidad o lectura automática, con salida WAV lista para reproducir.
- Generación de audiolibros y pódcasts: producción de narraciones en gallego con una voz concreta (Brais) y posibilidad de clonar otras voces a partir de muestras de referencia.
- Localización de contenidos multimedia: doblaje o sustitución de pistas de audio en gallego para vídeos, tutoriales o materiales educativos.
- Pruebas de concepto en investigación lingüística: generación de estímulos de voz controlados en gallego para experimentos de percepción o evaluación de sistemas TTS.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: al ser ONNX y ejecutable en CPU, permite generar muestras de referencia en tests automatizados sin depender de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,8 GB, es probable que funcione en CPU, pero no se documenta el consumo exacto.
- GPU recomendadas: no disponible; no se especifican GPU concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada por el autor; el tamaño del repositorio (0,8 GB) sugiere que podría caber en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede mencionar que existen otros modelos de la colección StyleTTS2 empaquetados por Phoonnx, pero no se detallan sus especificaciones ni rendimiento. Por tanto, la comparativa cuantitativa se indica como no disponible.

## Limitaciones y advertencias

- El modelo solo soporta gallego (`gl-ES`); no se documentan otros idiomas.
- No se dispone de información sobre sesgos, riesgo de alucinación (en TTS, errores de pronunciación o prosodia) ni evaluación de calidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (`proxectonos/Nos_StyleTTS2-Brais-GL`) y de los datos de entrenamiento originales, que no se detallan.
- El modelo requiere audio de referencia para la clonación de voz; no se especifican los requisitos de calidad o duración de dicha referencia.
- No hay datos sobre latencia, throughput ni consumo de recursos en producción.
- La fecha de creación indicada (2026-11-14) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o una programación de publicación; conviene verificarlo.
- El número de descargas (28) y likes (0) es muy bajo, lo que sugiere poca validación comunitaria.

## Enlaces

- [Hugging Face: Phoonnx/styletts2-gl_es-brais](https://huggingface.co/Phoonnx/styletts2-gl_es-brais)
- [Modelo upstream: proxectonos/Nos_StyleTTS2-Brais-GL](https://huggingface.co/proxectonos/Nos_StyleTTS2-Brais-GL)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección StyleTTS2 de Phoonnx](https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7)
