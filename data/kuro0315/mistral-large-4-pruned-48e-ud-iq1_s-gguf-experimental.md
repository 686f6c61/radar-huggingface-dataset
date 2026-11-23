# kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental

## Resumen

Mistral Large 4 Pruned 48E es una derivación experimental del modelo mistralai/Mistral-Large-4-1T-A52B, publicada por el usuario kuro0315 en Hugging Face. Se trata de una versión podada de un modelo MoE (mixture of experts) de gran escala: cada capa MoE conserva 48 expertos enrutados en lugar de los 128 originales, manteniendo 4 expertos activos por token. El resultado se distribuye en formato GGUF cuantizado a IQ1_S con un peso total de 99,12 GB repartido en seis particiones. El autor advierte explícitamente de que no se han realizado evaluaciones de precisión suficientes y de que puede haber regresiones significativas de calidad.

El modelo base es un transformer MoE de Mistral AI con aproximadamente 406.000 millones de parámetros totales según los safetensors del repositorio, aunque la nomenclatura del modelo base (1T-A52B) sugiere un diseño de mayor escala con 52.000 millones de parámetros activos. La poda reduce el número de expertos por capa, lo que disminuye el tamaño en disco y potencialmente el coste de inferencia, pero a costa de una pérdida de capacidad que el autor no ha cuantificado de forma concluyente. La ficha del modelo incluye una edición de pesos sobre el token ` Python` para mitigar la repetición en cadenas de razonamiento largas (thinking).

La relevancia de esta publicación es doble: por un lado, explora técnicas de poda de expertos en modelos MoE de gran tamaño (combinando REAP con una búsqueda local de intercambio de expertos); por otro, ofrece una vía para ejecutar un modelo de escala extrema en hardware más modesto mediante cuantización agresiva a 1 bit. No obstante, se trata de un artefacto de investigación, no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) podado |
| Parámetros totales | 406.084.006.176 (según safetensors del repo) |
| Parámetros activos | 52B (según nomenclatura del modelo base A52B; no confirmado para la versión podada) |
| Longitud de contexto | No disponible (el modelo base se asocia a ventanas largas; la model card menciona configuración de 128.000 tokens para Unsloth Studio, sin confirmar) |
| Tipos de cuantización | IQ1_S (GGUF), con una fila de `output.weight` re-cuantizada a Q6_K |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | mistral-ecosystem-open-weight |
| Formato de pesos | GGUF (6 particiones, 99,12 GB / 92,31 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE. La versión podada reduce los expertos enrutados de 128 a 48 por capa, manteniendo top-4 expertos activos por token. La selección de expertos se realizó en dos fases: primero se usó la puntuación de importancia de REAP como inicialización, y después se aplicó una búsqueda local discreta que intercambia un experto conservado por uno eliminado, minimizando el error cuadrático medio de la salida de los expertos enrutados respecto al modelo cuantizado original. Cada intercambio recalcula la selección top-4 y la normalización de pesos dentro de los expertos conservados, con un máximo de 16 intercambios por capa.

El proceso de selección usó 24 frases (japonés e inglés) de 32 tokens cada una (768 tokens) para elegir y 8 frases (256 tokens) para validar. No se aplicó la relajación continua ni la actualización de pesos de expertos (EWU) descritas en el paper OptEP, por lo que no es una reproducción de dicho trabajo. La poda se realizó sobre el modelo ya cuantizado por Unsloth (revisión `1eb4373d37e76f6e7b4b8efa20e1b1ca40b3b964`), y la cuantización IQ1_S se heredó del proceso original. Adicionalmente, se incluye una edición de pesos sin gradiente sobre una fila de `output.weight` (token 19553, ` Python`) para reducir la repetición de secuencias en cadenas de thinking largas.

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Razonamiento multi-paso con modo thinking (el autor documenta experimentos con cadenas de razonamiento largas).
- Generación de código (el autor prueba tareas de Python y tareas de shell).
- Capacidad de seguir instrucciones en formato JSON (mencionado en el conjunto de evaluación).
- Traducción y tareas de cálculo (incluidas en el conjunto de validación).
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de decodificación especulativa mediante DSpark (incluido como archivo separado de 2,25 GB, sin garantías de calidad ni aceleración en la versión podada).
- No se documenta soporte de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre poda de expertos en MoE: el modelo sirve como artefacto para estudiar el impacto de reducir expertos enrutados de 128 a 48 en la calidad de salida, con métricas de perplejidad y coincidencia de siguiente token ya publicadas.
- Experimentación con cuantización extrema a 1 bit: permite evaluar el comportamiento de un modelo de ~400B parámetros en formato IQ1_S en tareas de generación libre, midiendo degradación frente al modelo original.
- Pruebas de inferencia en hardware de gama alta para consumidor: con 99,12 GB en seis particiones, puede ejecutarse en configuraciones con suficiente VRAM o RAM unificada, sirviendo para medir latencia y throughput en llama.cpp.
- Evaluación de técnicas de mitigación de repetición en thinking: la edición del token ` Python` permite reproducir los experimentos del autor sobre bucles de repetición en cadenas de razonamiento largas.
- Generación de código en entornos controlados: el autor reporta pruebas con tareas de shell y Python, aunque sin garantías de corrección; útil para comparar la tasa de finalización antes y después de la poda.
- Estudio de decodificación especulativa con DSpark: el archivo DSpark incluido permite probar aceleración especulativa sobre el modelo podado, aunque el autor no garantiza mejoras.
- Docencia y divulgación: como ejemplo práctico de pipeline de poda, cuantización y publicación de modelos MoE de gran escala en Hugging Face.

## Benchmarks y rendimiento

| Métrica | Modelo original cuantizado | Versión 48 expertos |
|---|---:|---:|
| Perplejidad (menor es mejor) | 14,40 | 16,42 |
| Coincidencia de primer candidato con el original | — | 79,87 % |

Medición sobre 8 frases japonés/inglés no usadas en la selección de expertos, con 313 posiciones de entrada y 305 posiciones evaluadas para la verosimilitud del siguiente token. El autor advierte de que la perplejidad empeora aproximadamente un 14 % en esta prueba reducida, pero que esto no equivale a una caída del 14 % en capacidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: al menos 99,12 GB para cargar las seis particiones GGUF en IQ1_S, más overhead de contexto y caché KV.
- GPU recomendadas: no disponible de forma explícita; por tamaño, requiere configuraciones multi-GPU o sistemas con memoria unificada grande (por ejemplo, Apple Silicon de gama alta o GPUs con 80 GB o más en número suficiente).
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en una sola unidad.
- Opciones de despliegue: llama.cpp (librería declarada), con soporte de endpoints compatibles; el autor menciona Unsloth Studio con configuración de 128.000 tokens (no verificada por pantalla).
- Latencia y throughput: no disponibles. El autor menciona experimentos con decodificación especulativa DSpark y GB10, pero sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 Pruned 48E (este) | ~406B totales (52B activos según nomenclatura) | No disponible | IQ1_S GGUF | mistral-ecosystem-open-weight | Hugging Face (kuro0315) |
| mistralai/Mistral-Large-4-1T-A52B (base) | ~1T totales (52B activos) | No disponible | safetensors y GGUF (Unsloth) | mistral-ecosystem-open-weight | Hugging Face (oficial) |
| unsloth/Mistral-Large-4-1T-A52B-GGUF | ~1T totales (52B activos) | No disponible | GGUF (varias) | mistral-ecosystem-open-weight | Hugging Face (Unsloth) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada. La comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explícitamente que no ha realizado evaluaciones de precisión suficientes y que puede haber regresiones significativas de calidad.
- Perplejidad un 14 % peor que el modelo original en una prueba reducida de 8 frases; no se ha medido la calidad en generación libre, tareas de código ni estabilidad en contextos largos.
- La selección de expertos no considera la acumulación de error de capas anteriores, por lo que no garantiza una combinación óptima.
- Solo se declaran japonés e inglés como idiomas soportados; el rendimiento en otros idiomas no está evaluado.
- La edición de pesos sobre el token ` Python` es experimental y no elimina por completo los bucles de repetición (el autor reporta 38 repeticiones de una secuencia de 12 palabras en una prueba).
- Licencia mistral-ecosystem-open-weight: es necesario revisar los términos del archivo LICENSE para uso comercial; se retiene la atribución original de Mistral AI.
- El archivo DSpark incluido no garantiza calidad ni aceleración en la versión podada.
- No se documentan capacidades de tool calling, visión ni audio; no debe asumirse su disponibilidad.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser una poda agresiva, la fidelidad factual puede degradarse de forma no medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental
- Modelo base oficial: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Revisión previa del 48E (antes de la edición de pesos): https://huggingface.co/kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental/tree/2a62cdf05ef912915f25a17c4c4acf0ee83e2d38
- Licencia: https://huggingface.co/kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental/blob/main/LICENSE
