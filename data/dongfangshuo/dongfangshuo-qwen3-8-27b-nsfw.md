# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW es un ajuste fino (fine-tune) del modelo multimodal Huihui-Qwen3.8-27B-abliterated, que a su vez deriva de Qwen/Qwen3.8-27B. Lo desarrolla el usuario dongfangshuo y está especializado en escritura creativa para adultos (roleplay, novela, ficción erótica), con el objetivo declarado de eliminar los rechazos del modelo base ante contenido explícito y de mejorar el estilo literario sensorial en chino. La arquitectura subyacente es la de Qwen3.8, un transformer multimodal con entrada de imagen y texto (pipeline image-text-to-text), con aproximadamente 27.780 millones de parámetros según los pesos en safetensors.

El modelo se distribuye con licencia Apache-2.0 y pesos en formato safetensors (repo de 219,4 GB, lo que sugiere pesos en bf16/fp16 junto con posibles artefactos adicionales). Su relevancia actual es acotada: interesa a quienes investigan alineación, censura y comportamiento de modelos abliterated, así como a creadores de contenido de ficción que necesitan un modelo que no bloquee temáticas adultas. No es un modelo de propósito general ni está pensado para tareas de producción empresarial.

La model card indica que existe una versión posterior (v2.0) con repositorio GGUF propio, y que este repositorio corresponde a la v1.0 "clásica equilibrada". El modelo está marcado como no apto para todas las audiencias (not-for-all-audiences) y restringido a uso por adultos en contextos de ficción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8 (tag qwen3_5) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa --max-model-len 16384) |
| Tipos de cuantizacion | no disponible en este repositorio; existe un repo GGUF separado para la v2.0 |
| Idiomas soportados | zh (chino) declarado en la model card; resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B a través del intermediario Huihui-Qwen3.8-27B-abliterated. Se trata de un transformer multimodal que acepta imágenes y texto como entrada (pipeline image-text-to-text), con soporte de procesamiento de imagen mediante AutoProcessor. El ejemplo de vLLM incluye el parámetro --limit-mm-per-prompt image=4,video=1, lo que indica capacidad de procesar hasta cuatro imágenes y un vídeo por prompt en ese despliegue concreto. No se especifican en la información disponible detalles sobre número de capas, dimensión oculta, mecanismo de atención ni si emplea atención lineal o decodificación especulativa.

El entrenamiento consiste en un fine-tune sobre el modelo abliterated de Huihui, orientado a contenido R-18 y estilo literario. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación declarada es de naturaleza conductual y estilística: alta obediencia tras la eliminación de rechazos y optimización de la descripción sensorial y del vocabulario explícito. No se aportan métricas de entrenamiento ni detalles de hiperparámetros.

## Capacidades

- Generación de texto narrativo y creativo en chino, con especialización en ficción para adultos y roleplay.
- Descripción sensorial y vocabulario explícito sin rechazos, según declara el autor.
- Procesamiento multimodal de imagen y texto (image-text-to-text), con soporte de múltiples imágenes por prompt en vLLM.
- Conversación multi-turno (tag conversational).
- Escritura de novela larga y estilización tipo Pixiv (tags novel, pixiv).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: solo se declara chino; el resto no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Escritura de ficción adulta: el modelo está ajustado específicamente para generar narrativa explícita sin bloqueos, con vocabulario directo y descripciones sensoriales detalladas, adecuado para autores de novela erótica que trabajan en chino.
- Roleplay conversacional de personajes: gracias a su naturaleza conversacional y multi-turno, puede mantener interacciones de rol con personajes consistentes en contextos de ocio adulto.
- Generación de novelas por capítulos: los tags novel y pixiv indican entrenamiento orientado a texto largo; útil para borradores y continuaciones de relatos serializados.
- Investigación sobre alineación y censura: sirve como caso de estudio de modelos abliterated y de cómo el fine-tune modifica la tasa de rechazo y el estilo, comparándolo con el base Huihui y con Qwen3.8-27B.
- Descripción de imágenes con estilo literario: al ser multimodal, puede generar descripciones narrativas o ambientaciones a partir de imágenes de referencia para ilustradores y guionistas.
- Prototipado de asistentes creativos privados: desplegado con vLLM o Transformers en entornos controlados, para herramientas internas de escritura que requieren contenido sin filtros.
- Evaluación de robustez multimodal: permite estudiar cómo un fine-tune temático afecta a la comprensión de imágenes y a la coherencia en prompts con varias imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55-56 GB solo para los pesos (27,78 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 64-80 GB.
- En cuantización de 8 bits: unos 28 GB de pesos; en 4 bits: unos 14-16 GB, aunque este repositorio no publica GGUF y habría que cuantizar a partir de safetensors.
- GPU recomendadas para precisión completa: A100 80 GB, H100 80 GB, o múltiples GPU con device_map="auto".
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB); requeriría cuantización agresiva (4 bits) o descarga por capas a CPU, con latencia elevada.
- Opciones de despliegue: vLLM (ejemplo oficial con --max-model-len 16384 y --limit-mm-per-prompt image=4,video=1), Transformers con AutoModelForCausalLM y AutoProcessor. No se documentan opciones para llama.cpp, Ollama ni TGI en este repositorio; para GGUF existe el repo de la v2.0.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW | 27,78 B | no disponible | Sí | Apache-2.0 | Ficción adulta, sin censura |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | Sí (hereda de Qwen3.8) | no disponible | Base abliterated sin fine-tune temático |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Sí | no disponible | Modelo general alineado |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado benchmarks del modelo ni de los comparables en la información proporcionada. La diferencia principal frente al base Huihui es el fine-tune estilístico y de contenido; frente a Qwen3.8-27B, la eliminación de rechazos y la especialización en R-18.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar material sexual explícito y está marcado como not-for-all-audiences; no debe usarse en entornos con menores ni en productos de acceso público sin control de edad.
- Riesgo de alucinación: no hay datos de evaluación; los fine-tunes temáticos suelen degradar el razonamiento factual y la fidelidad en tareas generales.
- Idiomas: solo se declara chino; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea deficiente.
- Contexto: la longitud de contexto no está documentada; el ejemplo de vLLM limita a 16384 tokens, lo que puede ser insuficiente para novelas largas y agravar problemas de coherencia en textos muy extensos (la propia model card menciona que la v2.0 corrige "colapsos de autoatención" y repeticiones en textos largos de la v1.0).
- Licencia: Apache-2.0 permite uso comercial, pero el uso de contenido generado puede infringir normativa local sobre material adulto; el autor restringe el uso a adultos y a fines de ficción.
- Sesgos: no documentados; los modelos abliterated y los fine-tunes de ficción pueden reproducir estereotipos de género y contenido no consentido si se les induce.
- Producción: sin benchmarks, sin garantías de estabilidad y con un repo de 219,4 GB, no es adecuado para despliegues empresariales sin evaluación previa.
- Repositorio: corresponde a la v1.0; el autor ya recomienda la v2.0 para textos largos, lo que indica limitaciones conocidas en esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW
- Repositorio GGUF de la v2.0: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
