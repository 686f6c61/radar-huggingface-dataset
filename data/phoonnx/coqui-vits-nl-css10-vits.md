# Phoonnx/coqui-vits-nl-css10-vits

## Resumen

`coqui-vits-nl-css10-vits` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face, derivado del modelo `coqui/nl-css10-vits` del ecosistema Coqui. Se distribuye como un paquete de ficheros en formato ONNX pensado para su uso con la librería `phoonnx`, una implementación ligera orientada a la inferencia de modelos Coqui VITS. El modelo está entrenado sobre el corpus CSS10 en neerlandés, por lo que su función es convertir texto en audio hablado en ese idioma.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional ni de un sistema TTS de gran escala, sino de un artefacto de despliegue concreto (un checkpoint VITS exportado a ONNX) que forma parte de una colección mayor de voces Coqui empaquetadas por el mismo autor. Su interés práctico reside en la posibilidad de ejecutar TTS neerlandés en local con una huella de disco pequeña (el repositorio ocupa aproximadamente 0,1 GB) y bajo una licencia permisiva BSD-3-Clause.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto (no aplica en el mismo sentido que en modelos de lenguaje) ni métricas de calidad. La model card es mínima y se limita a identificar el origen del checkpoint, la licencia y el identificador de voz (`coqui/nl-css10-vits`) que utiliza `phoonnx` para referenciarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | neerlandés (nl), según el identificador del checkpoint de origen |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (repositorio empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

El modelo es un checkpoint VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la arquitectura end-to-end de Coqui TTS que combina un codificador de texto, un prior variacional, un decodificador basado en flujo normalizador y un discriminador adversarial multiperiodo durante el entrenamiento. VITS genera waveform directamente a partir de texto sin necesidad de un vocoder separado, lo que simplifica el despliegue. En este repositorio el modelo se distribuye en formato ONNX para su ejecución con `phoonnx`.

El checkpoint de origen, `coqui/nl-css10-vits`, está entrenado sobre CSS10, un corpus multi-locutor de audio y transcripciones alineadas en varios idiomas, del que aquí se emplea la partición neerlandesa. No se dispone de información sobre el número de tokens, horas de audio, composición exacta del dataset, ni sobre si se aplicaron etapas de fine-tuning adicionales, RLHF o ajuste perceptual. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de VITS y de la exportación a ONNX para inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en neerlandés.
- Generación de waveform end-to-end mediante VITS, sin vocoder externo.
- Inferencia en formato ONNX, ejecutable con la librería `phoonnx`.
- Integración como voz identificada por `coqui/nl-css10-vits` dentro del catálogo de `phoonnx`.
- No se documentan capacidades de clonación de voz, control de emoción, multilingüismo, tool calling ni razonamiento; son capacidades ajenas al propósito de un modelo TTS.

## Casos de uso

- Lectura de contenido en neerlandés: convertir artículos, documentación o avisos a audio para accesibilidad o consumo pasivo, aprovechando que el modelo genera voz directamente desde texto.
- Asistentes de voz locales: integrar la síntesis en un asistente doméstico o de escritorio que opere sin conexión, dado el tamaño reducido del repositorio (0,1 GB) y el formato ONNX.
- Audiolibros y pódcast automatizados: generar narraciones de textos largos en neerlandés dividiendo la entrada en fragmentos y concatenando la salida.
- Sistemas de anuncios y locuciones: producir avisos pregrabados para aplicaciones, transporte o comercio en neerlandés con una licencia permisiva que facilita la redistribución.
- Pruebas de integración en pipelines TTS: usar el modelo como voz de referencia en tests de aplicaciones que consumen `phoonnx`, al ser un artefacto pequeño y de licencia BSD-3-Clause.
- Investigación y evaluación de TTS: servir como baseline VITS en neerlandés para comparar con sistemas más recientes, dado que procede de un checkpoint Coqui conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se espera una huella modesta, apta para GPU de gama baja o incluso CPU.
- GPU recomendadas: no disponible; cualquier GPU con soporte ONNX Runtime debería ser suficiente, si bien no se documentan requisitos oficiales.
- Compatibilidad con GPU de consumo: probable en la mayoría de tarjetas actuales por el reducido tamaño del artefacto, aunque no confirmado por el autor.
- Opciones de despliegue: librería `phoonnx` (https://github.com/TigreGotico/phoonnx); ONNX Runtime como backend subyacente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| coqui-vits-nl-css10-vits (este) | VITS / ONNX | Neerlandés | BSD-3-Clause | ONNX | Empaquetado para `phoonnx` |
| coqui/nl-css10-vits (origen) | VITS | Neerlandés | BSD-3-Clause | Checkpoint Coqui | Modelo original del que deriva |
| Otras voces de Phoonnx/phoonnx-coqui-vits | VITS / ONNX | Varios | BSD-3-Clause | ONNX | Misma colección, distintos idiomas |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta parámetros, datos de entrenamiento ni métricas de calidad, lo que dificulta evaluar su idoneidad en producción.
- Al derivar de CSS10, la calidad y cobertura pueden estar limitadas por el corpus original; no se documentan sesgos específicos.
- Riesgo de alucinación en el sentido de pronunciación incorrecta o artefactos acústicos en textos fuera del dominio de entrenamiento; no cuantificado.
- Idioma restringido al neerlandés; no se documenta soporte multilingüe.
- La licencia BSD-3-Clause permite uso comercial y redistribución con atribución, pero conviene verificar las condiciones del corpus CSS10 y del checkpoint Coqui original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No se documentan requisitos de hardware ni latencias, por lo que el despliegue requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-nl-css10-vits
- Repositorio de la colección: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
