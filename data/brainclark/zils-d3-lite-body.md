# brainclark/zils-d3-lite-body

## Resumen

`brainclark/zils-d3-lite-body` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario brainclark en Hugging Face. Se trata de un "decision body" para el pool de mezcla (soup pool) `d3-lite` de la subred Zils, obtenido mediante la fusión de un adaptador LoRA entrenado con la receta fijada `zils.d3`. El modelo tiene 852.985.920 parámetros totales (aproximadamente 0,85 mil millones) y se distribuye en formato safetensors con un repositorio de 3,4 GB.

La relevancia de este modelo es acotada: no es un modelo de propósito general, sino un componente especializado dentro de un pipeline concreto de la infraestructura Zils. Su función declarada es actuar como "cuerpo de decisión" (decision body) dentro de un pool de mezcla de modelos, lo que sugiere un uso como componente de un sistema mayor de enrutamiento o selección, más que como modelo conversacional autónomo.

La información pública disponible es muy limitada: la model card apenas ocupa unas pocas líneas y no incluye detalles sobre datos de entrenamiento, benchmarks, idiomas soportados ni instrucciones de uso. El modelo se publicó el 12 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni "likes". La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, tag `qwen3_5`; requiere `custom_code`) |
| Parámetros totales | 852.985.920 (~0,85 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar vía herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El repositorio incluye el tag `custom_code`, lo que indica que la carga del modelo requiere código personalizado más allá de las clases estándar de Transformers; no se detalla en la información disponible qué componentes específicos lo necesitan. El tag `qwen3_5` confirma la familia arquitectónica, pero no se aportan detalles sobre número de capas, dimensión oculta, cabezas de atención ni mecanismos de atención específicos.

El proceso de entrenamiento consistió en un ajuste fino mediante LoRA sobre el modelo base, seguido de una fusión de los pesos del adaptador en el modelo final. La receta utilizada es la `zils.d3` fijada (pinned), y el resultado se integra en el pool de mezcla `d3-lite` como "decision body". No se especifica el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y procesamiento de lenguaje natural heredados del modelo base Qwen3.5-0.8B, si bien no se documentan capacidades específicas en la model card.
- Función declarada de "decisión" dentro del pool `d3-lite` de la subred Zils: presumiblemente selección, enrutamiento o clasificación en el contexto de ese sistema, aunque no se detalla el mecanismo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Componente de enrutamiento en la subred Zils: el modelo se usaría como "decision body" dentro del pool `d3-lite` para seleccionar o puntuar opciones en el pipeline de la subred, aprovechando su ajuste específico para esa tarea.
- Evaluación de recetas de mezcla (soup): serviría como pieza de referencia para reproducir o comparar la receta `zils.d3` en experimentos de merging de modelos.
- Investigación sobre fine-tuning LoRA en modelos pequeños: su tamaño de 0,85 B y su licencia Apache 2.0 lo hacen manejable para estudiar el efecto de la fusión de adaptadores LoRA sobre un modelo base Qwen3.5.
- Prototipado de clasificación o decisión ligera: si el "decision body" implementa una cabeza de clasificación o selección, podría reutilizarse como base para tareas de decisión de bajo coste computacional en entornos con recursos limitados.
- Despliegue en hardware modesto para pruebas internas: con ~0,85 B de parámetros, cabe en GPUs de consumo para experimentación, siempre que se resuelva la dependencia de `custom_code`.
- Reproducibilidad de pipelines Zils: útil para equipos que necesiten replicar exactamente el estado del pool `d3-lite` en una fecha concreta (noviembre de 2026) con fines de auditoría o comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no confirmada para este modelo), un modelo de ~0,85 B en fp16 ocuparía aproximadamente 1,7 GB de pesos, y en cuantización de 8 bits alrededor de 0,9 GB; a ello habría que sumar la memoria para el contexto y el código personalizado.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría albergarlo en precisión reducida, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí (gama RTX 3060/4060 en adelante) por el número de parámetros, aunque la dependencia de `custom_code` y la falta de documentación impiden garantizarlo.
- Opciones de despliegue: no disponible. El tag `custom_code` sugiere que la carga con Transformers estándar puede requerir `trust_remote_code=True`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| brainclark/zils-d3-lite-body | ~0,85 B | no disponible | Apache 2.0 | Hugging Face | Fine-tune LoRA fusionado para el pool `d3-lite` de Zils |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva; capacidades generales documentadas por Qwen |
| Alternativas de ~1 B de propósito general | ~1 B | variable | variable | Hugging Face | No se dispone de datos comparativos específicos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; los datos de benchmarks del modelo base y de posibles competidores no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, idiomas, contexto ni uso previsto, lo que dificulta evaluar su idoneidad para producción.
- Sesgos conocidos: no disponible; al derivar de Qwen3.5-0.8B, podría heredar sesgos del modelo base, pero no se documenta nada al respecto.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones publicadas.
- Limitaciones de contexto o idioma: no disponible; se desconoce la ventana de contexto efectiva y los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B y de la receta `zils.d3`, que no se detallan.
- Dependencia de `custom_code`: la carga requiere código personalizado, lo que añade riesgo de seguridad y complejidad de despliegue; hay que auditar el código remoto antes de usarlo.
- Especialización estrecha: el modelo está diseñado como componente de un pool concreto (`d3-lite`), por lo que su comportamiento fuera de ese contexto no está garantizado.
- Madurez: publicado en noviembre de 2026 con cero descargas y cero "likes"; no hay evidencia de uso en producción ni comunidad que lo respalde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainclark/zils-d3-lite-body
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor: https://huggingface.co/brainclark
- Paper, blog, repositorio o demo de Zils: no disponible en la información proporcionada.
