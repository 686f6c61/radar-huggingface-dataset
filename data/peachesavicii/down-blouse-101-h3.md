# PeachesAvicii/Down-Blouse-101-H3

## Resumen

Down-Blouse-101-H3 es un adaptador LoRA de tipo text-to-image publicado por el usuario PeachesAvicii en HuggingFace. Se trata de un ajuste fino ligero (pesos de adaptador, no un modelo completo) diseñado para inyectar un estilo y una temática concretos sobre el modelo base `neph1/1980s_fantasy_movies_minimax_h3`, que a su vez es un derivado del ecosistema MiniMax H3 orientado a la generación de imágenes con estética de cine fantástico de los años 80. El repositorio ocupa 0,3 GB, lo que es coherente con un LoRA y no con un checkpoint completo.

La model card es extremadamente escueta: el autor lo describe como contenido NSFW subido "para uso personal con mi tool set", con la palabra de activación `on her hands and knees`. No se documentan datos de entrenamiento, número de pasos, learning rate, resolución, composición del dataset ni métricas de evaluación. La licencia declarada es Apache-2.0 y el pipeline es `text-to-image` dentro de la librería `diffusers`.

Su relevancia es muy limitada fuera del ámbito personal del autor: no hay benchmarks, no hay documentación técnica y el contenido es explícitamente para adultos. Esta ficha se limita a documentar lo que el repositorio declara, marcando como "no disponible" todo aquello que no aparece en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; arquitectura del base no especificada |
| Parámetros totales | no disponible (repo de 0,3 GB, compatible con un adaptador LoRA) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el prompt de instancia está en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible en la información proporcionada (repo `diffusers`, presumiblemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones de atención (y posiblemente a las capas feed-forward) de un modelo de difusión base. El base declarado es `neph1/1980s_fantasy_movies_minimax_h3`, un modelo de la familia MiniMax H3 con estética de cine fantástico de los 80. No se especifica si el LoRA se aplica solo al UNet/transformer o también al text encoder, ni el rango utilizado.

No hay información sobre el dataset de entrenamiento: ni número de imágenes, ni resolución, ni número de pasos, ni si se usó captions automáticos o manuales. Tampoco se documenta regularización, técnicas de debiasing ni evaluación cualitativa. La única información de entrenamiento es la palabra de activación (`on her hands and knees`) y la temática declarada (NSFW). Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de imágenes text-to-image condicionada por el modelo base `neph1/1980s_fantasy_movies_minimax_h3`.
- Activación de un estilo y una composición concretos mediante la palabra de instancia `on her hands and knees`.
- Contenido explícitamente NSFW (adultos), según declara el autor.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de imagen, no un LLM.
- No hay capacidades multilingües documentadas; el prompt de instancia está en inglés.
- No hay modo "thinking", visión, audio ni otras capacidades especiales.

## Casos de uso

- Experimentación personal con LoRA sobre el modelo base: el caso de uso real declarado por el autor es su propio "tool set" para generar imágenes con una estética y composición específicas.
- Investigación sobre adaptadores de bajo rango: sirve como ejemplo de LoRA de 0,3 GB para estudiar cómo un adaptador pequeño modifica la distribución de salida de un modelo de difusión.
- Pruebas de pipelines `diffusers` con LoRA cargado dinámicamente: útil para validar flujos de carga de adaptadores y gestión de pesos.
- Comparación de técnicas de condicionamiento por palabra de instancia: el uso de un trigger phrase concreto permite estudiar la sensibilidad del modelo base a tokens de activación.
- Generación de imágenes de referencia para proyectos creativos privados (contenido para adultos, uso personal).
- Docencia o divulgación sobre riesgos de modelos NSFW sin documentación: como caso de estudio de model cards incompletas y contenido sensible.

No se recomienda su uso en producción comercial, atención al cliente, generación de código ni ninguna tarea que requiera texto, razonamiento o agentes, porque el modelo no ofrece esas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay FID, CLIP score, ni comparaciones cuantitativas con otros LoRA. Tampoco hay métricas de velocidad de inferencia ni de consumo de VRAM.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; al ser un LoRA sobre un modelo de difusión, el requisito dominante es el del modelo base, no el del adaptador (0,3 GB adicionales).
- GPU recomendadas: no disponibles en la información proporcionada; dependerán del modelo base `neph1/1980s_fantasy_movies_minimax_h3`.
- Compatibilidad con GPU de consumo: no confirmada; depende del base.
- Opciones de despliegue: `diffusers` (librería declarada). No se documenta compatibilidad con ComfyUI, A1111, llama.cpp, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/tamaño | Licencia | Documentación |
|---|---|---|---|---|---|
| Down-Blouse-101-H3 | LoRA text-to-image | neph1/1980s_fantasy_movies_minimax_h3 | 0,3 GB (adaptador) | Apache-2.0 | Mínima (model card de 4 líneas) |
| LoRA genéricos de Civitai/HuggingFace | LoRA text-to-image | SDXL, SD 1.5, Flux, etc. | Variable | Variable | Habitualmente con ejemplos y settings |
| Modelo base neph1/1980s_fantasy_movies_minimax_h3 | Modelo de difusión completo | — | no disponible | no disponible | no disponible en esta ficha |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a tipo de artefacto, licencia y nivel de documentación.

## Limitaciones y advertencias

- Contenido NSFW: el autor declara explícitamente que el modelo genera material para adultos; no es apto para uso general ni para entornos sin control de edad.
- Documentación insuficiente: no hay información sobre dataset, hiperparámetros, resolución de entrenamiento ni evaluación; imposible reproducir el entrenamiento.
- Riesgo de alucinación visual y artefactos: como cualquier LoRA de difusión, puede producir anatomías incorrectas, composiciones incoherentes y sesgos heredados del base.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden evaluar sesgos de género, etnia o cuerpo.
- Restricciones de licencia: Apache-2.0 permite uso comercial del adaptador, pero el modelo base puede tener su propia licencia (no verificada aquí); el uso comercial de contenido NSFW está sujeto además a la legislación aplicable.
- Dependencia del base: el LoRA no funciona de forma autónoma; requiere cargar `neph1/1980s_fantasy_movies_minimax_h3`.
- Sin soporte de texto, código ni agentes: no debe evaluarse como LLM.
- Fecha de creación declarada 2026-10-28: dato a verificar, ya que puede ser un artefacto de los metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/PeachesAvicii/Down-Blouse-101-H3
- Modelo base: https://huggingface.co/neph1/1980s_fantasy_movies_minimax_h3
- Repositorio de archivos: https://huggingface.co/PeachesAvicii/Down-Blouse-101-H3/tree/main
- Documentación de `diffusers`: https://huggingface.co/docs/diffusers
