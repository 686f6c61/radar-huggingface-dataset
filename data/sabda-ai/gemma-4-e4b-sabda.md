# sabda-ai/gemma-4-E4B-sabda

## Resumen

Gemma 4 E4B for Sabda es una distribución de pesos preparada por sabda-ai a partir del modelo instructivo multimodal `google/gemma-4-E4B-it` de Google. No se trata de un ajuste fino: el repositorio contiene una copia sin modificar del modelo cuantizado a 4 bits en formato GGUF y una versión modificada del proyector multimodal a la que se ha eliminado el codificador de visión, conservando únicamente el de audio. El objetivo es que la aplicación Sabda pueda descargar de un único origen los ficheros necesarios para reconocimiento de voz en dispositivo, sin depender de que otros repositorios permanezcan inalterados.

El modelo base es un transformer multimodal de aproximadamente 7.460 millones de parámetros totales según los safetensors publicados, distribuido en un GGUF Q4_0 de 4,59 GB más un proyector de audio Q8_0 de 332 MB. La licencia declarada es Apache 2.0, lo que facilita su integración en productos comerciales.

Su relevancia es acotada pero clara: demuestra un patrón de empaquetado reproducible (hashes SHA-256 verificables, script de modificación incluido) para desplegar un modelo de audio en llama.cpp sobre hardware de consumo, con una huella de almacenamiento inferior a 5 GB. No aporta mejoras de calidad sobre el modelo original y no debe confundirse con un modelo especializado en ASR entrenado desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base `google/gemma-4-E4B-it`); distribución en GGUF para llama.cpp con proyector de audio |
| Parámetros totales | 7.463.013.674 (según safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0 (modelo principal), Q8_0 (proyector de audio) |
| Idiomas soportados | no disponible (los test del autor cubren inglés y nepalí mixto con inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-E4B-it`, un transformer multimodal instruction-tuned con codificadores separados de visión y audio y un proyector hacia el espacio del modelo de lenguaje. Esta distribución no aplica ningún entrenamiento adicional: los pesos del modelo de lenguaje son una copia byte a byte del GGUF Q4_0 publicado por `ggml-org` en el commit `a69f018d7678a2b9f5e705f8903d6fb29b9b25dc`.

La única modificación técnica es la poda del codificador visual en el fichero `mmproj-gemma-4-E4B-it-audio-only-Q8_0.gguf`. El script `audio_only_ears.py` elimina los tensores `v.*`, el tensor `mm.input_projection.weight`, los ajustes `clip.vision.*` y desactiva `clip.has_vision_encoder`; todos los tensores y ajustes de audio se copian sin alteración. El resultado es reproducible: ejecutar el script sobre el fichero original produce exactamente el SHA-256 documentado (`67fdc5ed...`). No se dispone de información sobre volumen de tokens, composición del dataset ni etapas de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Reconocimiento y comprensión de voz en dispositivo: el proyector de audio Q8_0 permite procesar entrada de audio junto con texto.
- Generación de texto conversacional en modo instructivo, heredada del modelo base.
- Procesamiento multimodal limitado a audio: la variante distribuida aquí no puede procesar imágenes.
- Integración con llama.cpp y endpoints compatibles, según las etiquetas del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible; los conjuntos de prueba del autor incluyen inglés y nepalí mezclado con inglés.

## Casos de uso

- Dictado y transcripción en aplicaciones móviles: el GGUF Q4_0 de 4,59 GB más el proyector de audio de 332 MB permiten empaquetar el modelo en una app que transcriba voz sin enviar audio a la nube, siempre que el dispositivo tenga memoria suficiente.
- Asistentes de voz sin conexión: al ejecutarse sobre llama.cpp, el modelo puede gestionar la comprensión de comandos hablados en entornos sin red, como vehículos o equipos de campo.
- Subtitulado local de reuniones: la combinación de audio y generación de texto permite producir borradores de transcripción en el propio portátil, con la ventaja de que los datos no salen del equipo.
- Aplicaciones de accesibilidad: conversión de voz a texto para personas con movilidad reducida, con un despliegue reproducible gracias a los hashes SHA-256 publicados.
- Distribución de modelos en cadena de suministro controlada: el patrón de copiar pesos con hash verificado y script de modificación incluido sirve como referencia para equipos que necesitan artefactos inmutables en sus pipelines de despliegue.
- Prototipado de interfaces voz-texto en investigación: el tamaño contenido permite iterar en estaciones de trabajo con una sola GPU de consumo, sin depender de APIs externas.
- Evaluación de pipelines ASR sobre llama.cpp: útil para comparar el rendimiento del codificador de audio de Gemma 4 frente a soluciones dedicadas en inglés y en contextos bilingües inglés-nepalí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente indica que todos los conjuntos de prueba propios (inglés, nepalí mixto con inglés, comprensión, silencio y formatos) superaron la validación con E4B y este fichero, sin aportar métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5 GB para pesos en Q4_0 más proyector de audio Q8_0, más overhead de contexto y caché KV de llama.cpp (el total práctico suele situarse entre 6 y 8 GB según longitud de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM; en 6 GB el margen es muy ajustado.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y servidores compatibles con la API de endpoints indicados en las etiquetas; vLLM y TGI no están confirmados para este GGUF en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sabda-ai/gemma-4-E4B-sabda | 7,46 B | no disponible | GGUF Q4_0 + proyector audio Q8_0 | Apache 2.0 | Solo audio; sin fine-tuning; hashes verificables |
| google/gemma-4-E4B-it | 7,46 B | no disponible | safetensors | Apache 2.0 | Modelo base completo con visión y audio |
| ggml-org/gemma-4-E4B-it-GGUF | 7,46 B | no disponible | GGUF | Apache 2.0 | Origen de los ficheros; incluye codificador de visión |
| Whisper (variantes) | no disponible | no disponible | múltiples | MIT (variantes de OpenAI) | Específico de ASR, sin generación conversacional |

## Limitaciones y advertencias

- No es un ajuste fino: no cabe esperar mejoras de precisión en ASR respecto al modelo base de Google.
- La variante distribuida pierde la capacidad de visión al eliminar el codificador visual; no puede procesar imágenes.
- Los conjuntos de prueba del autor son limitados (inglés y nepalí mixto); el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos generativos: las transcripciones pueden contener texto inventado, especialmente con audio ruidoso o silencios largos.
- Sesgos del modelo base no evaluados en esta distribución; no se han publicado análisis de sesgo específicos.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con audio de larga duración.
- El repositorio registra cero descargas y cero likes en el momento de la consulta; no hay validación comunitaria independiente.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del modelo base de Google por si imponen condiciones adicionales de uso aceptable.
- El rendimiento en producción depende de la versión de llama.cpp y del soporte del codificador de audio de Gemma 4 en esa versión; verificar compatibilidad antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sabda-ai/gemma-4-E4B-sabda
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- GGUF de origen: https://huggingface.co/ggml-org/gemma-4-E4B-it-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
