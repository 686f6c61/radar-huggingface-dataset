# Ateron/Qwen3.5-27B-QLora-Gutenberg

## Resumen

Ateron/Qwen3.5-27B-QLora-Gutenberg es un repositorio publicado en HuggingFace por el usuario Ateron (fecha declarada en los metadatos: 24 de octubre de 2026) bajo licencia Apache 2.0. El nombre sugiere un ajuste fino con QLoRA sobre un modelo de la familia Qwen3.5 de 27.000 millones de parámetros, supuestamente entrenado con material del Proyecto Gutenberg. Sin embargo, la model card no contiene ni una sola línea de descripción: únicamente el bloque de frontmatter con la licencia, de modo que esa interpretación es una inferencia a partir del identificador y no está confirmada por el autor.

Los datos objetivos disponibles son muy escasos: el repositorio ocupa 0,1 GB, lleva las etiquetas `gguf` y `license:apache-2.0`, no declara pipeline, idiomas, dataset ni resultados de evaluación, y acumula 0 descargas y 0 likes desde su creación. Además, los metadatos de safetensors informan de 39.845.888 parámetros totales, tres órdenes de magnitud por debajo de los 27 B que anuncia el nombre, una discrepancia que el repositorio no resuelve.

Esta ficha debe leerse, por tanto, como una Auditoría de un artefacto sin documentar más que como una descripción funcional. Cualquier dato sobre arquitectura, entrenamiento, capacidades o rendimiento se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no la describe; el nombre del repositorio apunta a un transformer de la familia Qwen3.5, sin confirmar |
| Parámetros totales | 39.845.888 (~39,8 M) según los metadatos de safetensors del repositorio. El identificador indica "27B": discrepancia sin resolver |
| Parámetros activos | No disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio incluye al menos un archivo en formato GGUF (etiqueta `gguf`), pero no se especifican niveles (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio está vacío) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (etiqueta del repositorio); los metadatos de recuento de parámetros proceden de safetensors |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |
| Fecha de creación (metadatos) | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

No hay información publicada. La model card se limita al frontmatter de licencia, sin sección de arquitectura, datos de entrenamiento, hiperparámetros, número de tokens, composición del corpus ni procesos de alineación (RLHF, DPO u otros). Tampoco se documenta si el artefacto contiene pesos completos o únicamente un adaptador.

Por el identificador puede inferirse un procedimiento QLoRA, es decir, ajuste de bajo rango sobre un modelo base cuantizado a 4 bits, en el que se entrenan matrices de descomposición de rango reducido y se congelan los pesos originales. Un adaptador de ~39,8 M de parámetros sobre un modelo de 27 B representaría en torno al 0,15 % de parámetros adicionales, cifra compatible con un rango bajo aplicado solo a determinadas capas, pero esta aritmética es una hipótesis y no una confirmación. El sufijo "Gutenberg" sugiere un corpus de literatura de dominio público, extremo igualmente no verificado. No se han publicado innovaciones técnicas (decodificación especulativa, atención lineal, modos de razonamiento) asociadas a este repositorio.

## Capacidades

- Generación de texto: no documentada. La única evidencia es la existencia de un archivo GGUF apto para inferencia con llama.cpp u Ollama, sin que se describa su comportamiento.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; el repositorio no declara ningún idioma.
- Visión, audio o modalidades adicionales: no disponible; las etiquetas del repositorio no mencionan ninguna.
- Modo "thinking" o similar: no disponible.
- Si se confirma la hipótesis del nombre, heredaría las capacidades del modelo base Qwen3.5-27B, pero no hay ninguna verificación en el repositorio.

## Casos de uso

- Auditoría de artefactos en un registro interno de modelos: el repositorio puede utilizarse como caso de estudio de una publicación sin documentación, comprobando la discrepancia entre el nombre (27 B) y el recuento real de parámetros (39,8 M) antes de aprobar su uso interno.
- Validación de pipelines GGUF: sirve para probar la carga de un archivo GGUF de 0,1 GB en llama.cpp, Ollama u otro runtime compatible y verificar que el tokenizador y la configuración se resuelven correctamente.
- Docencia sobre ajuste fino con QLoRA: el artefacto permite ilustrar el ciclo completo (modelo base, adaptador, empaquetado en GGUF) y los riesgos de publicar sin model card ni evaluación.
- Reproducción de experimentos: si el autor publica en el futuro los scripts o el dataset, el repositorio podría servir como referencia para replicar un ajuste fino sobre corpus literario de dominio público.
- Generación de texto con estética literaria decimonónica: solo si se confirma el entrenamiento con textos del Proyecto Gutenberg; en ese caso sería adecuado para experimentos de estilo y no para tareas que exijan precisión factual.
- Pruebas de comparación de adaptadores pequeños: al ocupar 0,1 GB, puede incluirse en baterías de evaluación sin coste de almacenamiento ni de GPU, siempre que se añada una evaluación propia, ya que no hay benchmarks publicados.
- Integración en entornos con recursos mínimos: si el recuento de 39,8 M es correcto, la inferencia cabría en CPU y en dispositivos de menos de 1 GB de RAM, algo útil para prototipos y pruebas de humo en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

Los requisitos dependen de cuál de las dos lecturas del repositorio sea correcta, y ninguna está confirmada:

- Escenario A (39,8 M de parámetros, coherente con los metadatos de safetensors):
  - VRAM estimada: ~80 MB en fp16, ~40 MB en int8 y ~25 MB en cuantización de 4 bits.
  - Cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y funciona en CPU con menos de 1 GB de RAM.
  - Despliegue viable con llama.cpp u Ollama; vLLM y TGI no aportarían ventaja a este tamaño.
- Escenario B (27 B de parámetros, según el nombre del repositorio):
  - VRAM estimada: ~54 GB en fp16, ~28 GB en int8/Q8_0 y ~16-19 GB en Q4_K_M o Q5_K_M, más la caché KV según contexto.
  - GPU recomendadas: A100 80 GB o H100 para fp16 con margen; una sola RTX 4090 (24 GB) solo con cuantización de 4-5 bits y contexto corto; dos RTX 4090 con paralelismo tensorial para mayor contexto.
  - Despliegue: vLLM o TGI para pesos completos en fp16/bf16; llama.cpp u Ollama para el archivo GGUF.
- Latencia y throughput: no disponibles en ninguno de los dos escenarios.

## Comparativa con modelos similares

No se han identificado alternativas comparables verificables con la información disponible. La tabla recoge únicamente lo que puede afirmarse del artefacto y deja el resto como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Ateron/Qwen3.5-27B-QLora-Gutenberg | 39,8 M declarados; "27B" en el nombre | No disponible | Apache 2.0 | Repositorio público, 0 descargas | No disponible |
| Modelo base Qwen3.5-27B (hipótesis según el nombre) | 27 B según el identificador, sin verificar | No disponible | No disponible en este repositorio | No referenciado en la model card | No disponible |
| Otros adaptadores QLoRA públicos de temática literaria | No disponible | No disponible | No disponible | No identificados en la información proporcionada | No disponible |

## Limitaciones y advertencias

- Documentación inexistente: la model card solo contiene la licencia. No hay descripción, instrucciones de uso, plantilla de chat ni parámetros de generación recomendados.
- Discrepancia de tamaño sin resolver: el nombre declara 27 B y los metadatos de safetensors informan de 39.845.888 parámetros (~39,8 M). Cualquier estimación de hardware o de coste basada en el nombre puede ser errónea por tres órdenes de magnitud.
- Ausencia total de validación: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros. No hay evidencia de que el modelo funcione o de que el archivo GGUF sea cargable.
- Riesgo de alucinación: no evaluado; si el ajuste se hizo sobre literatura de ficción, es esperable una mayor propensión a generar contenido verosímil pero falso en tareas factuales.
- Idiomas: no declarados. No puede asumirse un rendimiento correcto en castellano ni en ningún otro idioma.
- Licencia: el repositorio se publica como Apache 2.0, pero no se identifica el modelo base ni su licencia. Si el artefacto deriva de un modelo con condiciones adicionales (atribución, restricciones de uso), esas obligaciones podrían seguir aplicando y deben verificarse antes de un uso comercial.
- Sesgos: no documentados. Si el corpus es literatura histórica de dominio público, son previsibles sesgos de época, de registro lingüístico y de representación.
- Caveat de producción: sin model card, sin evaluación y con discrepancia de parámetros, el artefacto no es apto para despliegue en producción sin una validación propia completa.

## Enlaces

- HuggingFace: https://huggingface.co/Ateron/Qwen3.5-27B-QLora-Gutenberg
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos asociados a este modelo.
