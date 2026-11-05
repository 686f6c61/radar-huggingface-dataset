# SatoshiManjoro/MiniManjoro-25M

## Resumen

MiniManjoro-25M es un modelo publicado en HuggingFace por el usuario SatoshiManjoro bajo licencia Apache 2.0. Con aproximadamente 25 millones de parámetros en el nombre, se situaría en la categoría de modelos extremadamente pequeños, por debajo incluso de modelos como GPT-2 small (124M) o TinyLlama (1.1B). No obstante, la model card pública no contiene ninguna información técnica más allá de la declaración de licencia, por lo que no es posible confirmar arquitectura, datos de entrenamiento ni capacidades reales.

El repositorio no registra descargas ni interacciones (0 descargas, 0 likes en el momento de la consulta) y no declara pipeline, idiomas ni formato de pesos. Esto sugiere un experimento personal o un artefacto en fase muy temprana de publicación, sin documentación asociada.

Dada la ausencia total de especificaciones verificables, esta ficha recoge únicamente los datos confirmados (ID, autor, licencia, fechas) y marca explícitamente como "no disponible" todo aquello que la model card no documenta. Cualquier evaluación de uso en producción debería posponerse hasta que el autor publique información técnica o pesos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~25M (inferido del nombre; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo. No se especifica si se trata de un transformer decoder-only, un modelo tipo SSM, una mezcla de expertos o cualquier otra variante. Tampoco se indica el número de capas, dimensión oculta, número de cabezas de atención ni vocabulario.

No hay información sobre el corpus de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se mencionan innovaciones técnicas (atención lineal, decodificación especulativa, destilación, etc.). El único metadato técnico disponible es el tamaño aproximado de 25M de parámetros que sugiere el nombre del repositorio.

## Capacidades

- No se han documentado capacidades en la model card.
- No hay evidencia publicada de soporte de generación de texto, razonamiento, código o matemáticas.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- No es posible recomendar casos de uso concretos sin documentación técnica ni pesos verificables.
- Un modelo de ~25M de parámetros, en caso de existir y funcionar, solo sería viable para tareas muy acotadas como clasificación de texto corto, generación de plantillas o experimentación educativa, pero esto es una inferencia por tamaño y no una capacidad confirmada.
- Fine-tuning experimental en entornos con recursos muy limitados (CPU o GPU de gama baja), sujeto a que el autor publique los pesos y la arquitectura.
- Investigación sobre modelos pequeños y eficiencia paramétrica, siempre que se documente el entrenamiento.
- Pruebas de concepto de pipelines de inferencia local, condicionadas a la disponibilidad de formatos como GGUF o safetensors, que no están confirmados.
- Evaluación comparativa de modelos de juguete en entornos docentes, con las cautelas propias de un artefacto sin benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamaño nominal de ~25M de parámetros, una inferencia en fp16 requeriría del orden de 50 MB de pesos, y en int8 alrededor de 25 MB, pero estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: no disponible. Cualquier GPU consumer moderna (incluso integradas) podría ejecutar un modelo de este tamaño si los pesos existieran y el runtime lo soportara.
- Compatibilidad con GPU consumer: probable por tamaño, no confirmada.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| MiniManjoro-25M | ~25M (inferido) | no disponible | Apache 2.0 | Solo licencia | Repositorio sin descargas |
| GPT-2 small | 124M | 1024 tokens | MIT | Model card completa | Ampliamente disponible |
| TinyLlama 1.1B | 1.1B | 2048 tokens | Apache 2.0 | Model card y paper | Ampliamente disponible |
| SmolLM-135M | 135M | 2048 tokens | Apache 2.0 | Model card y benchmarks | Ampliamente disponible |

La comparativa se ofrece solo como referencia de categoría; MiniManjoro-25M no dispone de datos públicos que permitan una comparación técnica rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se puede verificar arquitectura, datos de entrenamiento ni rendimiento.
- Riesgo elevado de alucinación y comportamiento impredecible al no existir evaluación publicada.
- No hay información sobre sesgos, filtrado de datos ni alineación.
- No se confirma que los pesos estén realmente publicados en el repositorio.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación impide garantizar condiciones de producción.
- Sin benchmarks ni métricas, no es recomendable para ningún despliegue real.
- El nombre sugiere ~25M de parámetros, pero este dato no está confirmado en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/SatoshiManjoro/MiniManjoro-25M
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
