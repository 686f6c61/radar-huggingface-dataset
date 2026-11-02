# kyumly/qwen36-35b-a3b-2p10bit-duet

## Resumen

Qwen3.6-35B-A3B 2.10-bit DUET es un checkpoint de investigación publicado por el usuario kyumly en HuggingFace, derivado del modelo Qwen3.6-35B-A3B de Alibaba Qwen. Se trata de una versión cuantizada a muy baja precisión (2,10 bits por peso en los expertos enrutados) sobre la que se ha aplicado un ajuste de entrenamiento consciente de la cuantización (QAT) mediante el método DUET, que opera sin pesos maestros y modifica directamente los códigos de cuantización. El objetivo es recuperar parte de la precisión perdida por la cuantización post-entrenamiento (PTQ) sin aumentar el tamaño del archivo ni el ancho de bits.

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con atención estándar en BF16 y expertos enrutados almacenados como códigos empaquetados de 3 a 16 niveles (promedio de 2,10 bits). El modelo base Qwen3.6-35B-A3B cuenta con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, e incorpora capacidades multimodales de imagen a texto. El checkpoint ocupa 14,6 GB en el repositorio y requiere un cargador personalizado de MoE de baja precisión para su uso.

La relevancia de este checkpoint es doble: por un lado, demuestra que el QAT sobre códigos de cuantización (sin pesos maestros) puede recuperar entre 1,5 y 3,4 puntos en benchmarks de razonamiento y código respecto al modelo PTQ de 2,10 bits; por otro, mantiene el mismo tamaño y formato que el modelo base cuantizado, lo que lo hace atractivo para despliegues con restricciones severas de memoria. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atención BF16 y expertos enrutados cuantizados |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | aproximadamente 3 mil millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2,10 bits promedio en expertos enrutados (3 a 16 niveles por experto, códigos empaquetados); resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sigue la licencia del modelo base) |
| Formato de pesos | safetensors (layer_XX.safetensors para expertos empaquetados; nonexpert.safetensors para BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con atención, experto compartido, router, embeddings y `lm_head` en BF16. Los expertos enrutados se almacenan como códigos de baja precisión empaquetados, con un número de niveles K entre 3 y 16 por experto y un promedio de 2,10 bits por peso. La desquantización sigue la regla definida en `manifest.json`: `gate_up = bf16(mu[r] + alpha[r] * cb[q])` y `down = bf16((mu[r] + alpha[r] * cb[q]) * gamma)`, con tablas por fila (`lut[r, q]`) para los expertos que las utilizan. Los parámetros `alpha`, `cb` y `gamma` permanecen en BF16 sin cambios respecto al modelo base.

El entrenamiento parte del checkpoint PTQ `mrminjae/qwen36-35b-a3b-2p10bit-genans-lowbit` y aplica DUET, un método QAT sin pesos maestros que utiliza momentos estilo Adam (m de 8 bits, v de rango 1) y movimientos estocásticos de un nivel en los códigos con probabilidad `lr·|u|/Δ`, donde Δ es la separación real al siguiente nivel. Se entrenaron los códigos de los expertos enrutados, el offset y escala por fila mediante LSQ (K=2) y los pesos de RMSNorm; se congelaron los conteos de niveles, los codebooks, la atención, el experto compartido, el router, los embeddings y `lm_head`. El conjunto de datos es el set de calibración genans del modelo base: 225 filas y 305 K tokens de respuesta (10 filas reservadas). El schedule fue de 1 época, 56 pasos, batch global 4, learning rate de códigos 5e-7 constante y learning rate de norma/escala 2e-6 con coseno y 3 % de warm-up, con clipping AdaGC por capa y proyección (λ 1.02).

El resultado del entrenamiento movió solo el 0,035 % de los códigos de experto (11,3 M de 32,2 B), casi todos en un nivel. Los offsets de fila `mu` cambiaron ligeramente (0,03 % en magnitud) y las tablas por fila alrededor de 1e-6. La selección del learning rate de códigos se realizó observando los resultados en AIME25 y GPQA-Diamond, lo que introduce un sesgo optimista en las métricas reportadas.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con modo "thinking" (razonamiento extendido antes de la respuesta final).
- Generación de código y resolución de problemas de programación competitiva (evaluado en LiveCodeBench v6).
- Razonamiento matemático avanzado (evaluado en AIME25 y AIME26).
- Razonamiento científico de nivel experto (evaluado en GPQA-Diamond).
- Procesamiento de imagen a texto (pipeline `image-text-to-text` según los tags del repositorio).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere soporte para despliegue como API.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de métodos de cuantización extrema: investigadores que estudian QAT sin pesos maestros pueden usar este checkpoint como referencia para comparar DUET frente a PTQ y otras técnicas, ya que el autor reporta métricas detalladas en AIME25, AIME26, GPQA-Diamond y LiveCodeBench v6 con el mismo protocolo de evaluación.
- Despliegue con restricciones severas de memoria: al ocupar 14,6 GB y mantener los expertos en 2,10 bits, el modelo permite ejecutar un MoE de 35B parámetros en hardware donde un modelo BF16 equivalente no cabría, a costa de necesitar un cargador personalizado de baja precisión.
- Razonamiento matemático en entornos de investigación: con un rendimiento de 88,89 en AIME25 y 91,11 en AIME26 (promediando dos semillas), es adecuado para experimentos que requieran razonamiento matemático de alto nivel sin disponer de GPUs de gran capacidad.
- Generación de código en pipelines de evaluación: los 72,52 puntos en LiveCodeBench v6 lo hacen útil para probar flujos de generación y verificación de código, aunque su naturaleza de checkpoint de investigación desaconseja su uso directo en producción sin validación adicional.
- Investigación sobre razonamiento extendido: el modelo genera una media de 30-35 K tokens por respuesta en tareas de código y matemáticas, lo que permite estudiar el comportamiento de cadenas de razonamiento largas y su relación con la precisión.
- Experimentos de multimodalidad: al incluir el pipeline `image-text-to-text`, puede emplearse en prototipos de descripción de imágenes o respuesta a preguntas visuales, siempre que se valide su calidad real, no reportada en la información disponible.
- Estudio de la degradación por cuantización: comparar las salidas de este modelo con las del BF16 original permite analizar qué tipos de errores introduce la cuantización a 2,10 bits en tareas de razonamiento y código.

## Benchmarks y rendimiento

Resultados reportados por el autor (vLLM, thinking activado, temperatura 1.0, top-p 0.95, top-k 20, máximo 61.440 tokens nuevos, 3 muestras por pregunta):

| Modelo | LiveCodeBench v6 | AIME25 | AIME26 | GPQA-Diamond |
|---|---:|---:|---:|---:|
| Qwen3.6-35B-A3B (BF16) | 73,28 | 90,00 | 91,11 | 81,65 |
| 2.10-bit base (mrminjae, PTQ) | 70,99 | 85,56 | 88,89 | 76,52 |
| 2.10-bit + DUET (este modelo) | 72,52 | 88,89 | 91,11 | 79,88 |

Tokens generados medios por respuesta:

| Modelo | LiveCodeBench v6 | AIME25 | AIME26 | GPQA-Diamond |
|---|---:|---:|---:|---:|
| Qwen3.6-35B-A3B (BF16) | 35,2 K | 32,8 K | 33,3 K | 7,8 K |
| 2.10-bit base | 35,9 K | 33,6 K | 34,5 K | 15,1 K |
| 2.10-bit + DUET | 31,1 K | 30,3 K | 30,3 K | 17,5 K |

El autor indica que la mejora sobre el modelo base en GPQA-Diamond es de 3,4 puntos (aproximadamente 2,8 errores estándar), mientras que las diferencias en LiveCodeBench y AIME están dentro de uno o dos errores estándar. Ambos modelos de 2,10 bits razonan aproximadamente el doble que el BF16 en GPQA-Diamond.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,6 GB, por lo que se necesita al menos esa cantidad de memoria más el overhead del cargador personalizado de MoE de baja precisión y la caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs con 24 GB o más (RTX 4090, A100 40 GB, H100), pero el autor no especifica requisitos oficiales.
- Compatibilidad con GPU de consumo: probablemente sí en GPUs con 24 GB o más, aunque no está confirmado en la información disponible.
- Opciones de despliegue: el autor reporta evaluación con vLLM; requiere un cargador personalizado de MoE de baja precisión. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Los tokens generados medios por respuesta (30-35 K en código y matemáticas) implican tiempos de generación elevados en tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench v6 | GPQA-Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (BF16) | 35B (3B activos) | no disponible | 73,28 | 81,65 | no disponible | HuggingFace |
| 2.10-bit base (mrminjae, PTQ) | 35B (3B activos) | no disponible | 70,99 | 76,52 | no disponible | HuggingFace |
| 2.10-bit + DUET (este modelo) | 35B (3B activos) | no disponible | 72,52 | 79,88 | no disponible | HuggingFace |

Los tres modelos comparten arquitectura y tamaño; las diferencias radican en la precisión de los pesos y el método de cuantización. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El learning rate de códigos (5e-7) se eligió observando los resultados en AIME25 y GPQA-Diamond, por lo que las mejoras reportadas son una estimación optimista.
- Solo se realizó un entrenamiento (una semilla), con un modelo base y un conjunto de calibración, lo que limita la generalización de los resultados.
- Es un checkpoint de investigación; no está ajustado para seguridad más allá del modelo base.
- Requiere un cargador personalizado de MoE de baja precisión; no funciona con transformers estándar sin adaptaciones.
- La licencia sigue la del modelo base, que no está especificada en la información disponible; es necesario consultar la licencia de Qwen3.6-35B-A3B antes de cualquier uso comercial.
- Los idiomas soportados no están documentados en la información disponible.
- La longitud de contexto no está documentada en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de lenguaje.
- Sesgos conocidos: no documentados en la información disponible.
- El modelo razona durante 30-35 K tokens en tareas de código y matemáticas, lo que implica costes computacionales y latencias elevadas.
- En GPQA-Diamond, los modelos de 2,10 bits razonan aproximadamente el doble que el BF16, lo que puede afectar a despliegues con límites de tiempo.

## Enlaces

- [HuggingFace: kyumly/qwen36-35b-a3b-2p10bit-duet](https://huggingface.co/kyumly/qwen36-35b-a3b-2p10bit-duet)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Checkpoint PTQ de partida: mrminjae/qwen36-35b-a3b-2p10bit-genans-lowbit](https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-genans-lowbit)
