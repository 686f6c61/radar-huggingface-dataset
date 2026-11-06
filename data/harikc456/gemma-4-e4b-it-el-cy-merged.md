# harikc456/gemma-4-E4B-it-el-cy-merged

## Resumen

`harikc456/gemma-4-E4B-it-el-cy-merged` es un modelo multimodal de tipo image-text-to-text derivado de la familia Gemma 4 de Google, publicado por el usuario harikc456 en Hugging Face. Se trata de un fine-tuning (y posterior merge) del checkpoint cuantizado en 4 bits `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, entrenado con Unsloth y la librería TRL de Hugging Face. El resultado es un modelo de aproximadamente 5.123 millones de parámetros (5,12 B) en formato safetensors, con un repositorio de 10,3 GB.

El modelo conserva la arquitectura y capacidades del Gemma 4 original (procesamiento conjunto de imagen y texto, generación conversacional) e incorpora los ajustes del fine-tuning realizado por el autor. La nomenclatura "el-cy" sugiere un ajuste orientado a griego (el) y galés (cy), aunque la model card solo declara inglés como idioma soportado y no se documenta el dataset de entrenamiento utilizado.

Es relevante por varias razones: demuestra el flujo de trabajo de fine-tuning eficiente con Unsloth sobre modelos Gemma 4 cuantizados, ofrece una licencia Apache 2.0 permisiva (a diferencia de otras variantes de Gemma con licencia propia) y mantiene la modalidad multimodal. Sin embargo, la documentación publicada es mínima y no se han divulgado resultados de evaluación, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4; detalles exactos no disponibles |
| Parametros totales | 5.123.178.051 (5,12 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en bnb-4bit; el merge se publica en safetensors) |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 4 de Google. La arquitectura subyacente es un transformer multimodal capaz de procesar entradas de imagen y texto y generar texto (pipeline `image-text-to-text`). El autor no detalla en la model card la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La innovación técnica documentada es el uso de Unsloth, que según el autor permitió entrenar "2x más rápido" que un flujo estándar, combinado con la librería TRL de Hugging Face. El proceso incluyó un merge posterior de los adaptadores sobre el modelo base, dando lugar al sufijo "merged". No se especifican hiperparámetros, duración del entrenamiento ni detalles sobre la posible combinación de idiomas (el sufijo "el-cy" no se explica en la documentación). Tampoco se indica si el merge se realizó en precisión completa o preservando la cuantización de 4 bits del base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct Gemma 4.
- Procesamiento de imágenes junto con texto (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y tareas que combinen contexto visual y textual.
- Razonamiento y generación de contenido en inglés, idioma declarado en la model card.
- Compatibilidad con `text-generation-inference` y `transformers`, según los tags del repositorio.
- Integración con el ecosistema Unsloth/TRL para futuros fine-tunings.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües adicionales (griego, galés u otras): no confirmadas; solo se declara inglés.
- Capacidades de audio, thinking mode u otras: no disponibles en la documentación.

## Casos de uso

- Descripción y etiquetado de imágenes: el modelo puede recibir una imagen y generar descripciones textuales, útil para pipelines de moderación de contenido o generación de metadatos en catálogos de productos.
- Respuesta a preguntas sobre documentos escaneados: al combinar entrada visual y textual, puede extraer información de capturas o diagramas y responder preguntas concretas sobre ellos.
- Prototipado rápido de asistentes conversacionales: su tamaño de 5,12 B y licencia Apache 2.0 permiten desplegarlo en entornos de desarrollo para validar flujos conversacionales antes de escalar a modelos mayores.
- Investigación en fine-tuning eficiente: sirve como ejemplo reproducible del flujo Unsloth + TRL sobre Gemma 4 cuantizado, útil para estudiar técnicas de entrenamiento con bajo consumo de memoria.
- Generación de texto asistida en inglés: redacción de borradores, resúmenes y respuestas en aplicaciones internas donde el inglés sea el idioma operativo.
- Base para adaptaciones idiomáticas posteriores: dado el sufijo "el-cy" y la licencia permisiva, puede emplearse como punto de partida para fine-tunings dirigidos a griego o galés, aunque el autor no documenta ese entrenamiento.
- Experimentación académica con modelos multimodales pequeños: su tamaño moderado facilita la experimentación en entornos con recursos limitados frente a modelos multimodales de decenas de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 10-11 GB solo para los pesos (5,12 B × 2 bytes), más overhead de activaciones y del codificador visual.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: en torno a 3-4 GB para pesos, más overhead.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues de producción con concurrencia; RTX 4090 (24 GB) o L40S para inferencia en fp16 con margen.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits, aunque el codificador visual añade consumo adicional.
- Opciones de despliegue: `transformers` (soporte declarado en los tags), `text-generation-inference` (tag `text-generation-inference`), y en principio vLLM o llama.cpp si se generan pesos compatibles, aunque no se documenta su soporte explícito.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| harikc456/gemma-4-E4B-it-el-cy-merged | 5,12 B | no disponible | image-text-to-text | apache-2.0 | Hugging Face (46 descargas) |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | no disponible (variante E2B) | no disponible | image-text-to-text | no disponible en la información | Hugging Face |
| harikc456/gemma-4-E4B-it-el-cy | no disponible | no disponible | image-text-to-text | no disponible en la información | Hugging Face |
| Gemma 4 original (familia) | no disponible | no disponible | multimodal | licencia Gemma (no Apache 2.0) | Hugging Face / Google |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card no especifica dataset, hiperparámetros, evaluación ni limitaciones conocidas, lo que dificulta evaluar su calidad real.
- Sesgos: al derivar de Gemma 4, puede heredar sesgos presentes en los datos de preentrenamiento del modelo original; no se documenta ninguna mitigación específica.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; en tareas visuales y conversacionales puede generar contenido plausible pero incorrecto.
- Idioma: solo se declara inglés; el sufijo "el-cy" no está respaldado por una declaración de idiomas en la model card, por lo que el rendimiento en griego o galés es desconocido.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base Gemma 4 y el checkpoint de Unsloth no impongan restricciones adicionales que el autor no haya reflejado.
- Procedencia del merge: al tratarse de un merge sobre un checkpoint cuantizado en 4 bits, la calidad numérica de los pesos puede diferir de un fine-tuning en precisión completa; no se documenta el proceso exacto.
- Madurez: 46 descargas y 0 likes indican un modelo muy reciente y sin validación comunitaria; no se recomienda para producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harikc456/gemma-4-E4B-it-el-cy-merged
- Variante sin merge: https://huggingface.co/harikc456/gemma-4-E4B-it-el-cy
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no se proporciona enlace específico en la información disponible
