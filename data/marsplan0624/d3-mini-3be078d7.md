# marsplan0624/d3-mini-3be078d7

## Resumen

d3-mini-3be078d7 es un fine-tune del modelo base Qwen/Qwen3.5-4B publicado por el usuario marsplan0624 en Hugging Face. Segun la model card, se trata de un "body" (cuerpo de pesos) para el pool denominado `d3-mini`, entrenado sobre preguntas de decision publicas etiquetadas con resultados reales (reversiones y revisiones de Wikipedia, categorias de arXiv, resultados de Stack Exchange y merges de Gerrit), con un LoRA de lenguaje de rango 16 fusionado en los pesos.

El modelo declara 4.539.265.536 parametros en formato safetensors y un tamano de repositorio de 9,1 GB, coherente con pesos en precision de 16 bits. La model card indica explicitamente que los pesos solo son utilizables a traves del runtime "chassis" fijado del pool y que el repositorio no incluye capa de respuesta ni codigo de ejecucion, lo que limita su uso directo fuera de ese ecosistema.

La relevancia es acotada: se publica bajo licencia Apache 2.0, pero la ausencia de pipeline declarado, de idiomas documentados, de resultados de benchmarks y de codigo de inferencia hace que su evaluacion practica requiera acceso al runtime propietario del pool. No hay descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, ~9,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.500 millones de parametros. Sobre esa base se ha realizado un fine-tune con un LoRA de rango 16 aplicado a la parte de lenguaje, fusionado posteriormente en los pesos finales. La model card menciona que el "body" incluye los pesos completos de lenguaje y vision del modelo base, aunque no se detalla la composicion exacta del adaptador ni si la componente de vision fue tambien ajustada.

El entrenamiento se realizo sobre preguntas de decision publicas etiquetadas por resultados reales: reversiones y revisiones de Wikipedia, categorias de arXiv, resultados de Stack Exchange y merges de Gerrit. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento sobre preguntas de decision, segun el proposito declarado del fine-tune.
- Capacidad de vision heredada del modelo base Qwen/Qwen3.5-4B (segun la model card, incluye pesos de vision).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Modo "thinking" u otras capacidades especiales: no disponible.
- Uso limitado al runtime "chassis" del pool `d3-mini`; el repositorio no incluye capa de respuesta ni codigo de ejecucion.

## Casos de uso

- Clasificacion de decisiones editoriales en Wikipedia: el modelo podria puntuar probabilidades de que una edicion sea revertida, aprovechando el entrenamiento sobre reversiones y revisiones reales, aunque su uso requiere el runtime del pool.
- Prediccion de aceptacion de articulos en arXiv: dado el entrenamiento sobre categorias de arXiv, podria estimar la probabilidad de que un envio encaje en una categoria concreta, siempre que se disponga del chassis runtime.
- Priorizacion de respuestas en Stack Exchange: el modelo podria ordenar respuestas candidatas segun su probabilidad de ser aceptadas, usando los resultados historicos como senal de entrenamiento.
- Prediccion de merges en Gerrit: en un pipeline de revision de codigo, podria estimar la probabilidad de que un cambio sea fusionado, integrándose como senal auxiliar en herramientas de CI.
- Investigacion sobre modelos de decision: util como punto de partida para estudiar fine-tunes de Qwen3.5-4B sobre datos de resultado real, comparando con el modelo base.
- Evaluacion de tecnicas de fusion de LoRA: el repositorio permite inspeccionar como un LoRA de rango 16 fusionado afecta a los pesos de un modelo de 4,5B en tareas de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, una RTX 4090 (24 GB) o A100/H100 serian suficientes en FP16.
- Cabe en GPU de consumo: si, en GPUs con 12 GB o mas en FP16 y en GPUs de 8 GB con cuantizacion, sujeto a que el runtime del pool lo permita.
- Opciones de despliegue: no disponible; la model card indica que los pesos solo son utilizables a traves del runtime "chassis" del pool, por lo que vLLM, llama.cpp, Ollama o TGI no estan confirmados como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| d3-mini-3be078d7 | 4.539.265.536 | no disponible | apache-2.0 | Hugging Face, requiere runtime del pool |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas de ~4B para tareas de decision | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card indica que los pesos solo son utilizables a traves del runtime "chassis" del pool; no se incluye capa de respuesta ni codigo de ejecucion, lo que impide un uso directo con frameworks estandar.
- No se documentan idiomas soportados, lo que impide garantizar un comportamiento correcto en castellano u otros idiomas.
- No hay resultados de benchmarks publicados, por lo que el rendimiento real en tareas de decision es desconocido.
- Riesgo de sesgo: el entrenamiento se basa en resultados historicos de plataformas concretas (Wikipedia, arXiv, Stack Exchange, Gerrit), que pueden reflejar sesgos de esas comunidades.
- Riesgo de alucinacion: no evaluado; al ser un fine-tune sobre un modelo de lenguaje, conserva la propension general a generar contenido plausible pero incorrecto.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del runtime del pool puede imponer restricciones practicas no detalladas.
- El repositorio no tiene descargas ni likes, y el autor no ha publicado documentacion adicional en la busqueda web realizada.

## Enlaces

- Hugging Face: https://huggingface.co/marsplan0624/d3-mini-3be078d7
- Perfil del autor: https://huggingface.co/marsplan0624
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
