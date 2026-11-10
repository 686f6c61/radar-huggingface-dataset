# anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF del modelo `gemma-4-31B-it-abliterated-Japanese-RP`, publicado por el usuario `anaaaaaa13421312`. Se trata de un derivado de la familia Gemma 4 de Google, concretamente de la variante instruct (`it`) de 31B parámetros, que ha sido sometida a un proceso de *abliteration* (eliminación de los mecanismos de rechazo aprendidos durante el alineamiento) y posteriormente ajustada para *roleplay* en japonés. El resultado es un modelo orientado a generación creativa y conversacional sin las restricciones habituales de seguridad, distribuido en formato GGUF para su uso con motores de inferencia locales.

La relevancia de esta ficha es limitada: el modelo no cuenta con documentación técnica publicada por el autor, no dispone de datos de benchmarks, no especifica la composición del dataset de ajuste ni el proceso exacto de *abliteration*, y acumula cero descargas en el momento de la consulta. La model card es prácticamente vacía y se limita a metadatos de licencia y etiquetas. Todo ello obliga a marcar como "no disponible" la mayor parte de las especificaciones técnicas.

La licencia declarada es Apache 2.0, aunque conviene advertir que el modelo base original de Google (Gemma) se distribuye bajo los términos de la Gemma License, no Apache 2.0, por lo que la relicenciación por parte de un tercero es cuando menos cuestionable desde el punto de vista legal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, familia Gemma 4; sin confirmar por el autor) |
| Parámetros totales | 31B (según el nombre del repositorio) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio es GGUF, pero no se detallan los niveles Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible (el ajuste se orienta a japonés según el nombre; el modelo base es multilingüe) |
| Licencia | Apache 2.0 (declarada por el autor; ver advertencias) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información publicada por el autor sobre la arquitectura interna del modelo. Por el nombre y la familia (`gemma-4`) cabe inferir una arquitectura transformer decoder-only propia de la serie Gemma 4 de Google, con 31B parámetros, pero no hay confirmación documental en la model card. Tampoco se especifican la longitud de contexto nativa, el tokenizador ni detalles de atención (ventana deslizante, atención global, etc.).

Respecto al entrenamiento, el nombre del repositorio indica dos procesos sucesivos: primero un *abliteration* sobre la variante instruct de Gemma 4 31B, técnica que consiste en identificar y modular la dirección de activación asociada al rechazo para reducir la tasa de respuestas negativas; y después un ajuste fino orientado a *roleplay* en japonés. No se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, hiperparámetros ni la metodología exacta de *abliteration*. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional y creativo, orientada a *roleplay* en japonés según la denominación del repositorio.
- Reducción de rechazos gracias al proceso de *abliteration*, lo que permite abordar temáticas que el modelo base rechazaría.
- Herencia presumible de las capacidades del modelo base Gemma 4 31B instruct (razonamiento, código, matemáticas, multilingüismo), aunque no verificadas ni documentadas por el autor.
- Soporte de *tool calling* / *function calling*: no disponible (no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: no disponible; el ajuste parece centrado en japonés, pero el modelo base es multilingüe.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Roleplay conversacional en japonés: el modelo está específicamente ajustado para mantener personajes y narrativas multi-turno en dicho idioma, lo que lo hace adecuado para aplicaciones de entretenimiento y ficción interactiva.
- Generación creativa sin restricciones temáticas: el *abliteration* permite emplearlo en narrativa adulta o temáticas sensibles donde el modelo base rechazaría la petición, siempre que el despliegue sea local y controlado.
- Prototipado de chatbots de personaje: al ejecutarse en formato GGUF, puede integrarse en aplicaciones de escritorio o móviles mediante llama.cpp u Ollama sin depender de APIs externas.
- Investigación sobre alineamiento y seguridad: útil como caso de estudio para analizar cómo el *abliteration* modifica la distribución de respuestas y qué riesgos introduce en modelos de 31B.
- Experimentación con ajuste fino en japonés: sirve como punto de partida para desarrolladores que quieran continuar el ajuste en dominios concretos (novela ligera, videojuegos, etc.).
- Inferencia *offline* en hardware de consumo: al estar cuantizado en GGUF, puede desplegarse en equipos sin GPU dedicada de gama alta, a costa de una calidad reducida frente a los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 31B en GGUF, una cuantización Q4_K_M ocuparía aproximadamente 18-20 GB, Q5_K_M en torno a 21-23 GB y Q8_0 alrededor de 33 GB; estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponible. Para un modelo de este tamaño en cuantizaciones altas se requerirían GPU con 24 GB o más (RTX 3090, RTX 4090, A6000, A100 40/80 GB, H100).
- Viabilidad en GPU de consumo: posible en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o Q5; en GPUs de 16 GB o menos requeriría cuantizaciones más agresivas o descarga parcial a RAM/CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y otros motores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (gemma-4-31B-it-abliterated-Japanese-RP-GGUF) | 31B | no disponible | Apache 2.0 (declarada) | GGUF | Sin benchmarks ni documentación; 0 descargas |
| Gemma 4 31B IT (base original de Google) | 31B | no disponible en esta ficha | Gemma License | safetensors, GGUF oficial | Modelo alineado, con rechazos activos y documentación oficial |
| Modelos *abliterated* de la comunidad (p. ej. variantes de Llama o Qwen) | variable (7B-70B) | variable | variable | safetensors, GGUF | Ecosistema amplio, pero con las mismas advertencias de seguridad y licencia |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre dataset, metodología de *abliteration*, hiperparámetros ni evaluación, lo que impide reproducir o auditar el modelo.
- El *abliteration* elimina o reduce los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sexualmente explícito; la etiqueta `not-for-all-audiences` así lo indica.
- Riesgo elevado de alucinación, agravado por el ajuste de *roleplay* y por la falta de evaluación.
- La licencia Apache 2.0 declarada por el autor es dudosa: el modelo base Gemma de Google se rige por la Gemma Terms of Use, que impone restricciones de uso comercial y de redistribución que un tercero no puede relicenciar unilateralmente. Verificar antes de cualquier uso en producción.
- Cero descargas y cero *likes* en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- Idiomas y contexto no especificados: no se puede garantizar un comportamiento correcto fuera del japonés ni con contextos largos.
- No apto para despliegues en producción sin una evaluación de seguridad y calidad previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-GGUF
- Modelo base (según metadatos): https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP
- Familia Gemma de Google (referencia del modelo original): https://huggingface.co/google
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue local de GGUF): https://ollama.com
