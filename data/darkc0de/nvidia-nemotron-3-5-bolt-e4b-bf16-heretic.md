# darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic es un checkpoint publicado en Hugging Face por el usuario darkc0de bajo un identificador que sugiere una variante del modelo Nemotron de NVIDIA con un proceso de "abliteración" o modificación de rechazos (el sufijo "heretic" es habitual en la comunidad para denotar modelos con los mecanismos de rechazo atenuados). El repositorio contiene 7.941.100.832 parámetros en formato safetensors y un tamaño total de 25,9 GB, lo que es coherente con pesos en BF16 de aproximadamente 8.000 millones de parámetros.

La model card es la plantilla automática de Hugging Face sin rellenar: no documenta autoría real, datos de entrenamiento, licencia, idiomas ni evaluación. Los tags del repositorio incluyen `gemma4`, `image-text-to-text` y `endpoints_compatible`, lo que apunta a una arquitectura multimodal de la familia Gemma 4, pero esta información procede únicamente de los metadatos y no está confirmada por documentación del autor. El pipeline declarado es image-text-to-text, es decir, el modelo aceptaría entradas de imagen y texto.

Su relevancia es limitada y fundamentalmente práctica: se trata de una conversión o modificación comunitaria de un modelo base, útil para quien quiera experimentar con la variante sin rechazos, pero con un nivel de documentación y garantías muy inferior al del modelo original. Cualquier uso en producción debería partir del checkpoint oficial de NVIDIA y no de esta réplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `gemma4` en el repositorio; sin confirmar por el autor) |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos BF16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras). El tag `gemma4` sugiere una arquitectura de la familia Gemma 4 con capacidad multimodal image-text-to-text, y el tamaño de 7,94 mil millones de parámetros encaja con una variante de aproximadamente 8B, pero ninguno de estos extremos está documentado en la model card.

El sufijo "heretic" indica, por convención comunitaria, que los pesos han sido modificados para reducir los comportamientos de rechazo del modelo base, probablemente mediante alguna técnica de abliteración de direcciones de activación. El autor no describe el procedimiento, las herramientas empleadas ni el impacto sobre las capacidades originales, por lo que no es posible evaluar la fidelidad respecto al checkpoint de NVIDIA.

## Capacidades

- Generación de texto conversacional, según el tag `conversational`.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`), presumiblemente con capacidad de describir o razonar sobre imágenes.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Carga mediante la librería `transformers`.
- Capacidad de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Cobertura multilingüe: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación con modelos sin rechazos: el modelo puede emplearse en entornos de investigación para estudiar cómo varía el comportamiento conversacional al atenuar los mecanismos de rechazo, comparándolo con el checkpoint original de NVIDIA.
- Prototipado de asistentes multimodales: al aceptar entradas de imagen y texto, sirve para construir demos de descripción de imágenes o respuesta a preguntas visuales en entornos controlados.
- Evaluación de robustez y seguridad: útil como caso de estudio para medir la eficacia de filtros y salvaguardas externas cuando el modelo subyacente ha sido modificado para reducir negativas.
- Investigación sobre alineación: permite analizar qué capacidades se degradan o se preservan tras un proceso de abliteración, comparando respuestas con el modelo base.
- Desarrollo de pipelines locales con transformers: al estar en safetensors y BF16, se integra directamente en scripts de inferencia estándar para pruebas de integración.
- Docencia y formación técnica: sirve para ilustrar en un aula las diferencias entre un checkpoint oficial y una modificación comunitaria, incluidos los riesgos de trazabilidad y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; con 8B parámetros conviene prever 18-22 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-10 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB de pesos, aunque el repositorio no distribuye pesos cuantizados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin compromisos; RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto moderado.
- GPU de consumo: una RTX 3090 o 4090 de 24 GB es suficiente en BF16; tarjetas de 12-16 GB requerirían cuantización, que habría que generar localmente.
- Opciones de despliegue: `transformers` de forma nativa; vLLM o TGI si la arquitectura es compatible; llama.cpp/Ollama solo tras convertir los pesos a GGUF, conversión no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic (este) | 7,94 B | no disponible | no disponible | Hugging Face, repo comunitario |
| Checkpoint oficial de NVIDIA Nemotron (variante base) | no disponible en la informacion | no disponible | no disponible | Hugging Face, repo oficial |
| Modelos de ~8B de la familia Gemma 4 | no disponible en la informacion | no disponible | no disponible | Hugging Face, repo oficial |

No se dispone de datos de rendimiento del modelo ni de los comparadores en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es la plantilla automática: no hay información verificable sobre autoría, entrenamiento, licencia ni evaluación.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; además, al derivar presumiblemente de un modelo de NVIDIA, las condiciones del modelo original podrían seguir aplicándose.
- El proceso de "abliteración" implícito en el nombre puede degradar la calidad del modelo, aumentar respuestas inapropiadas y reducir la fiabilidad en tareas que requieren negativas justificadas.
- Riesgo elevado de alucinación y de comportamiento impredecible al no existir evaluación publicada.
- Sin datos sobre sesgos, idiomas soportados ni cobertura multilingüe.
- Longitud de contexto desconocida, lo que impide planificar cargas con documentos largos.
- El repositorio tiene 204 descargas y 3 likes: adopción muy baja y sin validación comunitaria.
- El tag `gemma4` no está confirmado por el autor; la arquitectura real debe verificarse inspeccionando `config.json` antes de cualquier despliegue.
- Para producción se recomienda usar el checkpoint oficial de NVIDIA en lugar de esta réplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Repositorio, paper y demo del modelo base: no disponibles en la información proporcionada.
