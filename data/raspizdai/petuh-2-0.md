# RaspizdAI/petuh-2.0

## Resumen

Petuh-2.0 es un modelo de lenguaje ligero desarrollado por RaspizdAI, presentado como un modelo de razonamiento entrenado desde cero sobre 4.72B de tokens y ajustado con "entropía pura". La ficha técnica del autor declara una arquitectura transformer con atención GQA de 12 cabezas de consulta y 4 de clave-valor, 14 capas ocultas, 768 dimensiones de embedding y una ventana de contexto de 1.536 tokens. El modelo se distribuye en formato safetensors con licencia MIT.

A pesar de la etiqueta "reasoning", los únicos benchmarks publicados en la model card arrojan puntuaciones de 0.0 en AIME 2025, HLE, Terminal bench 2.1 y SWE Bench verified, lo que indica que el modelo no resuelve las tareas de evaluación presentadas. Es relevante mencionar que el número de parámetros totales derivado de los archivos safetensors (121.526.016) no coincide con el declarado por el autor (108.943.104), una discrepancia que debe tenerse en cuenta al evaluar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con GQA (Grouped Query Attention) |
| Parametros totales | 121.526.016 (según safetensors; el autor declara 108.943.104) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.536 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar con Grouped Query Attention (GQA): 14 capas ocultas, 768 dimensiones de embedding, 12 cabezas de consulta y 4 cabezas de clave-valor. El vocabulario es de 8.192 tokens, un tamaño notablemente reducido para un modelo de lenguaje moderno. El autor afirma que el modelo fue entrenado desde cero sobre 4.72B de tokens, pero no se proporciona ninguna información sobre la composición del dataset ni sobre el proceso de ajuste. La mención a "entropía pura" es ambigua y no está documentada técnicamente, por lo que no se puede determinar si implica alguna innovación en el entrenamiento o simplemente una descripción imprecisa.

No hay datos sobre métodos de alineamiento como RLHF o DPO, ni sobre otras innovaciones técnicas, como decodificación especulativa o atención lineal. La discrepancia entre los parámetros declarados (108.943.104) y los que se deducen de los archivos safetensors (121.526.016) sugiere que podría haber errores en la creación del modelo o en los metadatos.

## Capacidades

- Generación de texto básica en un modelo de pequeño tamaño, aunque no hay ninguna evaluación publicada que respalde su calidad.
- El autor lo etiqueta como modelo de "razonamiento" y lo asocia con tags como "think", pero los benchmarks de razonamiento publicados (AIME 2025, HLE, Terminal bench 2.1, SWE Bench verified) son todos 0.0.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Idiomas no especificados; con un vocabulario de 8.192 tokens, es probable que el rendimiento en lenguajes distintos del inglés sea muy limitado o inexistente.
- No hay información sobre capacidades especiales adicionales como modo de pensamiento, visión o audio.

## Casos de uso

Dado que los benchmarks publicados son todos 0.0 y no se ha documentado ninguna aplicación exitosa, los siguientes casos de uso son hipotéticos y requerirían un ajuste fino significativo antes de cualquier uso real:

- "Clasificacion de textos simples": con solo 121M de parámetros, el modelo podría ajustarse para tareas de clasificación binaria o multiclase en dominios muy restringidos, siempre que la ventana de contexto de 1.536 tokens sea suficiente.
- "Entorno educativo para estudiar GQA": al implementar Grouped Query Attention, puede servir como ejemplo académico para comparar configuraciones de cabezas de consulta y clave-valor en transformers pequeños.
- "Experimentos de cuantizacion": su tamaño reducido permite probar técnicas de cuantización en GPUs modestas o incluso en CPU sin necesidad de infraestructura de alto coste.
- "Prototipos de generacion de texto aleatorio": si la descripcion de "entropía pura" se interpreta literalmente, el modelo podría usarse para generar texto artificial de baja coherencia en experimentos creativos o de investigación.
- "Despliegue en entornos embebidos": al caber en menos de 1 GB de RAM, es candidato para pruebas en dispositivos IoT o edge, aunque la utilidad práctica dependería de un fine-tuning adecuado.
- "Benchmark de eficiencia en hardware antiguo": permite medir throughput y latencia en CPUs antiguas o GPUs sin soporte para operadores modernos, sirviendo como referencia para comparar con modelos de mayor tamaño.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 0.0 |
| HLE | 0.0 |
| Terminal bench 2.1 | 0.0 |
| SWE Bench verified | 0.0 |

No se han publicado otros resultados de benchmarks en la información disponible. Los valores obtenidos son todos 0.0, lo que indica que el modelo no resuelve correctamente ninguna de las tareas de evaluación mencionadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 486 MB; en FP16, aproximadamente 243 MB; en 8-bit, aproximadamente 121 MB. Estos cálculos se basan en 121.526.016 parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo modelos de consumo como RTX 3050, GTX 1650 o incluso GPUs integradas. En CPU también es viable para tareas de baja latencia.
- El modelo cabe en GPUs de consumo y también en sistemas embebidos con suficiente memoria dedicada.
- Opciones de despliegue: al estar en formato safetensors, es compatible en principio con HuggingFace Transformers. No se ha documentado soporte explícito para llama.cpp, Ollama, vLLM o TGI, aunque la conversión a otros formatos podría ser posible.
- Latencia y throughput: no disponibles, ya que no se han publicado mediciones.

## Comparativa con modelos similares

No se han publicado benchmarks comparativos con otros modelos en la información disponible. Tampoco se dispone de datos suficientes para establecer una comparación rigurosa con modelos de la misma categoría de tamaño o de la misma tarea. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Los únicos benchmarks publicados son todos 0.0, lo que sugiere que el modelo no es capaz de resolver tareas complejas de razonamiento, matemáticas, código o búsqueda.
- El ajuste con "entropía pura" no está documentado técnicamente, lo que introduce incertidumbre sobre el comportamiento real del modelo.
- No se han declarado idiomas soportados; el vocabulario de 8.192 tokens es extremadamente reducido, por lo que es probable que su rendimiento en lenguajes distintos del inglés sea deficiente.
- Existe una discrepancia entre el número de parámetros declarado por el autor (108.943.104) y el que se deduce de los archivos safetensors (121.526.016), lo que podría indicar errores en el modelo o en los metadatos.
- La licencia MIT permite uso comercial, pero dado el rendimiento nulo en benchmarks, la utilidad práctica en producción es muy limitada.
- No hay información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- La fecha de creación del modelo en HuggingFace aparece como 2026-09-08, lo que podría tratarse de un error en la plataforma o de un experimento mal fechado.

## Enlaces

- HuggingFace: https://huggingface.co/RaspizdAI/petuh-2.0
