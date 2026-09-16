# adpretko/celerity-906m-8k-ad0p4

## Resumen

Celerity 906M — 8k — ad0p4 es un checkpoint de 906 millones de parámetros publicado en Hugging Face por el usuario adpretko, resultado de convertir un modelo entrenado en el formato propietario de Cerebras (CS) al formato de Hugging Face. El modelo trabaja con una longitud de secuencia de 8.000 tokens y corresponde a la variante de attention dropout identificada como ad0p4, derivada del checkpoint número 29117 de los experimentos de runtime cbcore 2.6.0.

Su relevancia es fundamentalmente instrumental: se trata de un artefacto de conversión que permite cargar en el ecosistema PyTorch/Hugging Face un checkpoint que originalmente solo existía en el runtime de Cerebras. El repositorio ocupa 1,8 GB, un tamaño coherente con 906 M de parámetros almacenados en precisión de 16 bits.

No hay información pública sobre el dataset de entrenamiento, la licencia, los idiomas soportados, el pipeline de inferencia ni resultados de benchmarks. El modelo exige cargarse con `trust_remote_code=True`, ya que utiliza código de modelado propio (etiquetas: pytorch, celerity, custom_code) que no forma parte de la librería `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelado propio "Celerity"; la model card no especifica si es transformer denso, MoE o híbrida) |
| Parámetros totales | 906 M (según el nombre del modelo; coherente con el tamaño del repo, 1,8 GB) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.000 tokens (8k) |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas; el repo contiene pesos en formato PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch con código de modelado personalizado (requiere `trust_remote_code=True`); no se especifica si son safetensors o `.bin` |
| Checkpoint de origen | checkpoint_29117 |
| Runtime de origen | cbcore 2.6.0 |
| Variante | attention dropout (ad0p4) |
| Fecha de creación del repo | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card únicamente documenta el proceso de conversión: el checkpoint se tradujo desde el formato CS de Cerebras al formato de Hugging Face mediante una coincidencia estricta de claves de checkpoint (*strict checkpoint-key matching*), lo que implica que no se añadieron, eliminaron ni renombraron tensores durante el proceso. El modelo se distribuye con código de modelado propio, por lo que su definición de capas, atención y tokenizador vive dentro del repositorio y no en `transformers`.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO u otras fases de alineamiento, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). El sufijo `ad0p4` identifica la variante con attention dropout dentro de la nomenclatura del autor; la lectura más habitual de esa etiqueta sería un dropout de 0,4, pero la model card no explicita el valor ni su efecto sobre el entrenamiento.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- Generación de texto: presumible por tratarse de un modelo de lenguaje con 8k de contexto, pero no confirmada explícitamente por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio, razonamiento largo): no disponible.
- Capacidad de fine-tuning: viable en principio por tratarse de un checkpoint PyTorch de 906 M, sujeto a que el código personalizado exponga una interfaz de entrenamiento estándar.

## Casos de uso

- Reproducibilidad de conversiones entre runtimes: el modelo sirve como referencia para verificar que una conversión Cerebras CS → Hugging Face con coincidencia estricta de claves produce pesos cargables y funcionales.
- Investigación sobre la arquitectura Celerity: al ser un checkpoint público de 906 M, permite inspeccionar la implementación de capas y atención incluida en el repositorio sin necesidad de acceso al runtime original.
- Fine-tuning experimental en GPU de consumo: con aproximadamente 1,8 GB de pesos en bf16, cabe en tarjetas de 8-12 GB y permite iterar sobre tareas específicas de dominio a bajo coste.
- Evaluación comparativa de checkpoints: útil para contrastar el comportamiento de un modelo entrenado en Cerebras frente a modelos densos de tamaño similar ejecutados en `transformers`.
- Prototipado de pipelines de inferencia con contexto de 8k: adecuado para validar la gestión de caché KV y el truncado de prompts en aplicaciones de documentos largos, siempre que se verifique antes la calidad de salida.
- Docencia y análisis de arquitecturas no estándar: sirve como ejemplo práctico de modelo con `custom_code` y de los requisitos de seguridad asociados a `trust_remote_code=True`.
- Experimentos sobre attention dropout: la variante ad0p4 permite estudiar el efecto del dropout de atención en la estabilidad del entrenamiento y en la calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Área | Resultado | Comparativa |
|---|---|---|
| Conocimiento general (estilo MMLU) | no disponible | no disponible |
| Código (estilo HumanEval) | no disponible | no disponible |
| Matemáticas (estilo GSM8K) | no disponible | no disponible |
| Razonamiento multi-paso | no disponible | no disponible |

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 1,8 GB en bf16/fp16, unos 0,9 GB en int8 y unos 0,5 GB en int4 (estimaciones derivadas de los 906 M de parámetros; el autor no publica variantes cuantizadas).
- VRAM total necesaria: dependiente del peso de los pesos más la caché KV de 8.000 tokens. No es posible calcularla con precisión porque la model card no indica número de capas, cabezas ni dimensión de cabeza.
- GPU de consumo: por tamaño, el modelo debería caber en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB), condicionado a que el runtime personalizado funcione correctamente.
- GPU de datacenter: A100, H100 o L40S están sobredimensionadas para 906 M de parámetros; solo se justifican por necesidades de throughput o de batch grande.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama no incluyen soporte nativo de la arquitectura Celerity. La vía directa es `transformers` con `trust_remote_code=True`; el uso en llama.cpp/Ollama exigiría una conversión a GGUF con implementación propia de la arquitectura.
- Latencia y throughput: no disponible.
- Tokenizador: no disponible (no se confirma en la información proporcionada si el repo incluye los ficheros de tokenización).

## Comparativa con modelos similares

No se dispone de datos verificables para comparar este checkpoint con alternativas concretas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| adpretko/celerity-906m-8k-ad0p4 | 906 M | 8k | no disponible | Hugging Face, requiere `trust_remote_code=True` |
| Otros checkpoints convertidos de Cerebras | no disponible | no disponible | no disponible | no disponible |
| Modelos densos de ~1B de uso común (familias Llama 3.2 1B, Qwen2.5 1.5B, Gemma 2 2B) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial ni para redistribución.
- Ausencia de model card completa: no hay información sobre composición del dataset, filtrado, sesgos ni proceso de alineamiento, por lo que no es posible auditar el comportamiento del modelo.
- Riesgo de alucinación: no evaluado; al no existir benchmarks, no hay medida de fiabilidad factual.
- Idiomas: se desconoce por completo qué idiomas soporta y con qué calidad.
- Ejecución de código remoto: `trust_remote_code=True` implica ejecutar código Python publicado en el repositorio; conviene auditar los ficheros antes de cargarlo en un entorno con acceso a red o datos sensibles.
- Compatibilidad limitada: al usar una arquitectura propia, no funcionará en runtimes estándar sin trabajo adicional de conversión e implementación.
- Contexto limitado a 8.000 tokens y sin técnicas de extensión documentadas.
- Variante de entrenamiento: el checkpoint corresponde a una configuración con attention dropout; debe cargarse en modo evaluación (`model.eval()`), ya que en modo entrenamiento el dropout degradaría la generación.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de que el modelo funcione correctamente tras la conversión.
- Conversión estricta de claves: cualquier discrepancia entre el código de modelado y los tensores del checkpoint provocará un fallo de carga; el autor no documenta pruebas de equivalencia funcional frente al checkpoint original.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-906m-8k-ad0p4
- No se han encontrado enlaces adicionales relevantes (paper, blog, repositorio o demo) en la búsqueda web realizada; los resultados devueltos no guardan ninguna relación con el modelo.
