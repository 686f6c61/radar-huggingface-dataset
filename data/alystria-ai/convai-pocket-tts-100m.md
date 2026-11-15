# alystria-ai/convai-pocket-tts-100m

## Resumen

Convai Pocket TTS 100M es un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz, publicado por alystria-ai como exportación ONNX del modelo base kyutai/pocket-tts. Está diseñado específicamente para su integración en el runtime de la aplicación Convai, un sistema de modding orientado a experiencias conversacionales. El paquete contiene únicamente grafos ONNX y metadatos, sin código ejecutable, grabaciones de voz ni datos de personajes.

El modelo deriva de Kyutai Pocket TTS, un sistema de TTS de pequeño tamaño (el identificador sugiere ~100M parámetros, aunque el dato exacto no está confirmado). La exportación convierte el modelo estudiante original (student-v2-s2000-ema-decv2) a formato ONNX, con los pesos del modelo de lenguaje cuantizados a int8 para reducir el tamaño del repositorio (0,5 GB) y facilitar su despliegue en entornos con recursos limitados.

Su relevancia radica en que ofrece una vía práctica para incorporar TTS con clonación de voz en aplicaciones de modding y entornos interactivos, con licencia CC BY 4.0 que permite uso comercial con atribución. La información publicada es escasa: no se detallan arquitectura interna, datos de entrenamiento ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: kyutai/pocket-tts; exportación ONNX) |
| Parámetros totales | ~100M (según el identificador del modelo; no confirmado en la model card) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (pesos del modelo de lenguaje en `lm.int8.onnx`) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafos `lm.int8.onnx`, metadatos `lm.int8.json`, `download-manifest.json`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base kyutai/pocket-tts. La model card indica que se trata de un modelo "estudiante" (student-v2-s2000-ema-decv2) exportado a grafos ONNX para el runtime de la aplicación Convai. El sufijo "ema" sugiere el uso de media móvil exponencial de pesos durante el entrenamiento, y "decv2" podría referirse a una versión de decodificador, aunque estos detalles no están confirmados.

La exportación mantiene los pesos del modelo de lenguaje en formato int8 (`lm.int8.onnx`), con un archivo JSON asociado (`lm.int8.json`) que registra las identidades de entrada y salida. El paquete incluye un `download-manifest.json` con el tamaño en bytes y el hash SHA-256 de cada archivo, lo que facilita la verificación de integridad en la distribución. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- Clonación de voz: permite generar voz a partir de una grabación de referencia, siempre que se disponga de permiso para usarla.
- Exportación ONNX optimizada para el runtime de la aplicación Convai, con pesos int8 para inferencia ligera.
- Integración como datos cargados por el propio runtime ONNX de la aplicación (el paquete no incluye código ejecutable).
- Soporte multilingüe limitado al inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Modding de voces en Convai: el paquete está pensado para cargarse directamente en el runtime de la aplicación Convai como datos ONNX, permitiendo sustituir o añadir voces de personajes sin necesidad de compilar código adicional.
- Prototipado de asistentes conversacionales: al ser un modelo de ~100M parámetros en int8, puede ejecutarse en entornos con recursos moderados para generar respuestas habladas en inglés en demos y pruebas de concepto.
- Clonación de voz para contenido creativo: con una grabación de referencia autorizada, se puede generar una voz sintética consistente para narrativas, podcasts o vídeos, respetando la licencia CC BY 4.0 con atribución.
- Integración en pipelines de aplicaciones de escritorio o web: el formato ONNX permite desplegar el modelo con ONNX Runtime en Windows, Linux o macOS sin dependencias de frameworks de deep learning pesados.
- Verificación de integridad en distribución: el `download-manifest.json` con hashes SHA-256 facilita la validación de archivos en sistemas de actualización o distribución de contenido.
- Investigación en TTS ligero: sirve como referencia para estudiar la cuantización int8 de modelos de voz pequeños y su impacto en la calidad de síntesis en entornos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; un modelo de ~100M parámetros en int8 requiere del orden de 100-200 MB de memoria para los pesos, más el overhead del runtime ONNX y los buffers de audio.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre debería ser suficiente, incluyendo GTX 1650, RTX 3050 o superiores.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido y la cuantización int8, aunque no está confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (runtime propio de la aplicación Convai); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Convai Pocket TTS 100M | ~100M (no confirmado) | no disponible | en | CC BY 4.0 | ONNX (int8) |
| kyutai/pocket-tts (base) | no disponible | no disponible | en | CC BY 4.0 | no disponible |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos TTS de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- La model card no detalla sesgos conocidos, pero al ser un modelo de voz entrenado con datos no especificados, puede reproducir sesgos de acento, género o prosodia presentes en el corpus original.
- Riesgo de alucinación o artefactos en la síntesis: no se documentan métricas de calidad (MOS, WER) ni pruebas de robustez ante textos fuera de dominio.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución a Kyutai y a alystria-ai; es obligatorio conservar los avisos de copyright.
- La clonación de voz requiere permiso explícito sobre la grabación de referencia; el autor advierte de que solo se debe usar material autorizado.
- El paquete no incluye código ejecutable ni grabaciones de voz; depende del runtime ONNX de la aplicación Convai, lo que limita su uso fuera de ese ecosistema.
- No se especifican requisitos de contexto ni límites de longitud de texto de entrada.
- El modelo se publicó en noviembre de 2026 (fecha indicada en el repositorio) y cuenta con 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alystria-ai/convai-pocket-tts-100m
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
