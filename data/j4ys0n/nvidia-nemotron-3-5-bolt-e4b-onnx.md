# j4ys0n/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX es una conversión experimental al formato ONNX del checkpoint BF16 `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, publicada por el usuario j4ys0n. El artefacto está pensado para ejecutarse en el navegador mediante Transformers.js y WebGPU, e incluye el decodificador de texto, los embeddings de tokens, el codificador de visión y el codificador de audio. La topología de grafo utilizada es la del modelo Gemma 4 E4B de la comunidad ONNX (licencia Apache-2.0), mientras que todos los parámetros aprendidos provienen de Bolt.

El modelo base es un modelo de NVIDIA documentado oficialmente como texto-a-texto; sin embargo, esta conversión conserva las torres de visión y audio y las expone a través de la clase `Gemma4ForConditionalGeneration`. El propio autor advierte que la retención de pesos multimodales no establece precisión multimodal downstream. El repositorio ocupa 5,2 GB y requiere WebGPU con soporte de `shader-f16`.

Se trata de un artefacto de nicho orientado a experimentación en el navegador (inferencia local sin servidor), no de un modelo entrenado de forma independiente. La validación publicada consiste en pruebas de humo (smoke checks) realizadas el 3 de noviembre de 2026 en Chrome 156 sobre Apple WebGPU, no en una evaluación de precisión general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de texto + codificador de visión + codificador de audio), topología de grafo Gemma 4 E4B |
| Parametros totales | no disponible (el nombre sugiere variante E4B; no se detalla el recuento exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (recomendada en el ejemplo de uso); artefacto ONNX cuantizado |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | ONNX (con manifiesto de conversión, checksums y posibles informes de validación JSON) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer multimodal con decodificador de texto, embeddings de tokens, torre de visión y torre de audio, más las proyecciones correspondientes. La topología del grafo ONNX se toma de `onnx-community/gemma-4-E4B-it-ONNX` (revisión fijada, licencia Apache-2.0), mientras que todos los parámetros aprendidos se reconstruyen desde el checkpoint BF16 de NVIDIA (`nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, revisión `49843eed8db1f1c616c47af75cfd36e07aec0667`). La referencia de cuantización del texto proviene de `RASMUS/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable de esta publicación no es de entrenamiento, sino de empaquetado: reconstrucción determinista del grafo con procedencia por inicializador y checksums verificables en `conversion-manifest.json`. Las comprobaciones de los codificadores en CPU con entradas sintéticas deterministas reportan un coseno medio frente a una reconstrucción independiente en PyTorch de 0,999994–0,999995 para visión y 0,999979–0,999999 para audio.

## Capacidades

- Generación de texto y razonamiento básico (el ejemplo de la model card resuelve una suma aritmética simple).
- Entrada de imagen con salida de texto (pipeline `image-text-to-text`); en la validación identificó dos gatos en una imagen.
- Entrada de audio con salida de texto; en la validación transcribió correctamente la muestra de audio de JFK.
- Transcripción de voz mediante instrucción textual ("Transcribe the speech exactly.").
- Ejecución local en navegador con Transformers.js y WebGPU.
- No genera voz: la salida es únicamente texto.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: el ejemplo de uso incluye el parámetro `enable_thinking: false`, lo que sugiere soporte de un modo de razonamiento explícito, aunque no se detalla su comportamiento.

## Casos de uso

- Procesamiento de texto en el navegador sin servidor: integración en aplicaciones web que necesitan responder consultas de texto con inferencia local vía Transformers.js y WebGPU, evitando enviar datos a un backend.
- Descripción de imágenes en cliente: subida de una imagen desde el navegador y generación de una descripción textual, útil en herramientas de accesibilidad o catalogación ligera.
- Transcripción de audio en local: uso del codificador de audio con la instrucción de transcripción para convertir muestras de voz en texto sin salir del dispositivo.
- Prototipado y validación de pipelines multimodales: el manifiesto de conversión y los checksums permiten auditar la procedencia de cada inicializador antes de adoptar el artefacto en un experimento.
- Demos educativas de inferencia ONNX en WebGPU: el ejemplo de código completo con `AutoProcessor` y `Gemma4ForConditionalGeneration` sirve como plantilla reproducible para talleres y tutoriales.
- Evaluación comparativa de reconstrucciones cuantizadas: los informes de validación (coseno frente a PyTorch) permiten estudiar la fidelidad de la cuantización q4f16 en codificadores de visión y audio.
- Experimentación con el modo thinking: activando `enable_thinking` en la plantilla de chat se puede explorar el comportamiento de razonamiento del modelo base en tareas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta pruebas de humo cualitativas: una suma aritmética devolvió 42, una imagen con dos gatos fue identificada correctamente y la muestra de audio de JFK se transcribió bien; la respuesta de imagen alcanzó el límite de 96 tokens de generación. Se indica explícitamente que no constituyen un benchmark de precisión general.

## Requisitos de hardware

- Descarga completa del repositorio: aproximadamente 5,21 GB.
- VRAM: no se ha medido un mínimo; el consumo depende de la longitud del prompt y de los medios de entrada.
- GPU: se requiere WebGPU con soporte de `shader-f16`; la validación se realizó sobre Apple WebGPU (Metal 3).
- Compatibilidad con GPU de consumo: no confirmada de forma general; la única plataforma validada es Apple WebGPU en Chrome 156.
- Despliegue: Transformers.js 4.2.0 en navegador; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| j4ys0n/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX | no disponible | no disponible | texto, imagen, audio de entrada; texto de salida | openmdw-1.1 | ONNX |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | no disponible | no disponible | texto a texto (según NVIDIA) | no disponible en la información | BF16 |
| onnx-community/gemma-4-E4B-it-ONNX (plantilla de grafo) | no disponible | no disponible | multimodal (plantilla) | Apache-2.0 | ONNX |
| RASMUS/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX (referencia de cuantización de texto) | no disponible | no disponible | texto | no disponible en la información | ONNX |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El modelo base está documentado por NVIDIA como texto-a-texto; la retención de las torres de visión y audio no garantiza precisión multimodal downstream.
- La validación publicada son pruebas de humo, no una evaluación de precisión; no debe extrapolarse a producción.
- La respuesta de imagen en la validación quedó truncada por un límite de 96 tokens de generación.
- Solo se ha validado en Chrome 156 sobre Apple WebGPU (Metal 3); el comportamiento en otras GPU o navegadores no está documentado.
- No se ha medido VRAM mínima; el consumo depende del prompt y de los medios de entrada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponibles.
- Licencia openmdw-1.1: deben revisarse sus términos antes de uso comercial; la información proporcionada no detalla restricciones.
- El autor advierte que se trata de un artefacto experimental; conviene consultar `conversion-manifest.json` y `validation-report.json` antes de cualquier adopción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/j4ys0n/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16/tree/49843eed8db1f1c616c47af75cfd36e07aec0667
- Plantilla de grafo (Apache-2.0): https://huggingface.co/onnx-community/gemma-4-E4B-it-ONNX/tree/2b6d2e26a962f70a33da8f7cd81e1afdd8d9cfb2
- Referencia de cuantización de texto: https://huggingface.co/RASMUS/NVIDIA-Nemotron-3.5-Bolt-E4B-ONNX/tree/93f687c0d014d9da0d2a7bda9b82420841e83565
