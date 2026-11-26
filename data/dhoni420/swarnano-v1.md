# dhoni420/SwarNano-v1

## Resumen

SwarNano v1 es un modelo de síntesis de voz (text-to-speech) para nepalí, publicado por el autor dhoni420 (Sande) bajo el identificador `dhoni420/SwarNano-v1` en Hugging Face. El modelo convierte texto en nepalí a audio hablado y permite seleccionar entre 18 identificadores de voz (speaker IDs) a través de una implementación compatible. La salida de audio de los ejemplos incluidos es WAV mono a 22.050 Hz.

La relevancia de este lanzamiento es doble. Por un lado, cubre una lengua con escasa representación en el ecosistema TTS abierto, el nepalí (`ne`). Por otro, su reducido tamaño de pesos (aproximadamente 6,2 MiB en FP32 y 1,4 MiB comprimido en INT8) lo sitúa en la categoría de modelos extremadamente ligeros, aptos para despliegues con recursos muy limitados.

Es fundamental señalar que este repositorio es una publicación *weights-only*: incluye únicamente los pesos y metadatos mínimos (vocabulario de fonemas y mapa de speaker IDs), pero no la implementación del modelo ni la arquitectura. Para sintetizar voz es necesario un runtime separado (`serve_tts.py` y `language_frontend.py`) que el creador distribuye por separado y que no está cubierto por la licencia CC BY-SA 4.0 de los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la implementación y arquitectura se mantienen por separado y no se publican en el repositorio) |
| Parámetros totales | no disponible (el tamaño de los ficheros de pesos es de ~6,2 MiB en FP32 y ~1,4 MiB en INT8 comprimido; no se declara el número de parámetros) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 e INT8 (esta última distribuida comprimida en `.xz`) |
| Idiomas soportados | nepalí (`ne`) |
| Licencia | CC BY-SA 4.0 (solo pesos y metadatos; el código, runtime e implementación quedan fuera) |
| Formato de pesos | `.pt` (FP32) y `.xz` (INT8 comprimido); metadatos en JSON |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card indica explícitamente que el código fuente, la implementación y la arquitectura son mantenidos por separado por el creador y no están incluidos ni licenciados en esta publicación de solo pesos. Por tanto, se desconoce si se trata de un transformer, un modelo híbrido, un sistema basado en difusión o cualquier otra familia arquitectónica.

Respecto a los datos, los pesos se crearon utilizando OpenSLR SLR43, que OpenSLR lista bajo CC BY-SA 4.0 y atribuye a Google LLC. El corpus de origen contiene grabaciones de nepalí de hablantes femeninas, según la propia model card. No se especifican el número de tokens, la composición detallada del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en nepalí, con salida en WAV mono a 22.050 Hz.
- Selección de voz entre 18 speaker IDs (índices de 0 a 17, o identificadores de origen como `0258` presentes en `weights/swarnano_v1_meta.json`). Son opciones de voz del modelo, no identidades verificadas.
- Ejecución local: el wrapper no envía texto ni audio a una API en la nube, según la model card.
- Dos formatos de pesos para distintos compromisos de almacenamiento: FP32 (~6,2 MiB) e INT8 comprimido (~1,4 MiB).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo de pensamiento, dado que se trata de un modelo TTS.

## Casos de uso

- Lectura de contenido en nepalí para aplicaciones de accesibilidad: el modelo puede convertir artículos, noticias o documentos en audio para usuarios con discapacidad visual, aprovechando su reducido tamaño para ejecutarse localmente sin depender de servicios en la nube.
- Asistentes de voz para dispositivos de bajos recursos: con pesos de ~1,4 MiB en INT8, es viable integrarlo en entornos con almacenamiento y memoria muy limitados, como sistemas embebidos o aplicaciones móviles ligeras, siempre que se disponga del runtime autorizado.
- Audiolibros y narración de cuentos: los ejemplos de la model card corresponden a textos narrativos en nepalí, lo que sugiere su uso para narrar relatos y material educativo, seleccionando entre los 18 speaker IDs disponibles.
- Aprendizaje de nepalí: generación de audio de pronunciación para estudiantes de la lengua, permitiendo escuchar frases y vocabulario con distintas voces del modelo.
- Investigación en TTS de bajos recursos: el modelo sirve como referencia para estudiar síntesis de voz en lenguas de bajos recursos y para comparar el comportamiento de los formatos FP32 e INT8 en términos de calidad y tamaño.
- Prototipado de interfaces de voz en nepalí: desarrolladores que necesiten validar flujos de conversación o demos de producto pueden usar el modelo para generar audio de prueba sin infraestructura pesada, sujeto a la obtención del runtime por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los tamaños de fichero no son métricas de velocidad ni de calidad, y que no se hacen afirmaciones comparativas de rendimiento entre los formatos FP32 e INT8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos ocupan ~6,2 MiB en FP32 y ~1,4 MiB en INT8 comprimido, pero el consumo real depende del runtime no publicado.
- GPU recomendadas: no disponible. Por el tamaño de los pesos, no se requieren GPU de datacenter (A100, H100) para almacenar el modelo, pero no se documentan requisitos de cómputo.
- Compatibilidad con GPU de consumo: probable en la práctica dado el reducido tamaño de los pesos, pero no confirmado por el autor; no se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: el paquete incluye `run_swarnano.py`, un wrapper de línea de comandos que requiere los ficheros de runtime `serve_tts.py` y `language_frontend.py`, distribuidos por separado con autorización del creador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de TTS en nepalí ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio es *weights-only*: los pesos por sí solos no pueden sintetizar voz; se necesita un runtime separado que no está incluido ni cubierto por la licencia CC BY-SA 4.0.
- El uso comercial del wrapper, runtime, implementación o arquitectura requiere permiso separado del creador, aunque la licencia de los pesos permita uso comercial.
- La calidad de la voz, la pronunciación y la prosodia pueden variar; no se ofrecen métricas objetivas.
- El corpus de origen contiene grabaciones de hablantes femeninas de nepalí; los 18 speaker IDs no constituyen un conjunto equilibrado y no deben tratarse como identidades verificadas.
- La licencia del dataset no concede por sí sola derechos de publicidad, privacidad u otros derechos de personalidad; existe riesgo de uso indebido para suplantación, que la model card prohíbe explícitamente.
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto; en TTS el riesgo equivalente es una pronunciación incorrecta o una prosodia inadecuada, no cuantificada.
- La licencia CC BY-SA 4.0 exige atribución y ShareAlike en adaptaciones; debe conservarse `DATASET_ATTRIBUTION.md` en copias redistribuidas.
- No se documentan sesgos específicos más allá de la composición del corpus (hablantes femeninas).
- El modelo solo soporta nepalí; no se declara multilingüismo.

## Enlaces

- Hugging Face: https://huggingface.co/dhoni420/SwarNano-v1
- GitHub: https://github.com/Dhoniprotocol/SwarNano-v1
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Fichero LICENSE: https://huggingface.co/dhoni420/SwarNano-v1/resolve/main/LICENSE
- Fichero LICENSING.md: https://huggingface.co/dhoni420/SwarNano-v1/resolve/main/LICENSING.md
- Pesos FP32: https://huggingface.co/dhoni420/SwarNano-v1/resolve/main/weights/swarnano_v1_fp32.pt
- Pesos INT8 comprimidos: https://huggingface.co/dhoni420/SwarNano-v1/resolve/main/weights/swarnano_v1_int8.xz
- Metadatos: https://huggingface.co/dhoni420/SwarNano-v1/resolve/main/weights/swarnano_v1_meta.json
- Dataset de origen OpenSLR SLR43: https://www.openslr.org/43/
