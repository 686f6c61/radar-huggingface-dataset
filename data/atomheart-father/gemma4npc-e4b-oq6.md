# Atomheart-Father/Gemma4NPC-E4B-oQ6

## Resumen

Gemma4NPC-E4B-oQ6 es una versión cuantizada del modelo Gemma4NPC-E4B, publicada por el usuario Atomheart-Father en Hugging Face. Se distribuye en formato MLX safetensors con cuantización de 6 bits y grupo de tamaño 64, y el repositorio ocupa 7,2 GB. El recuento de parámetros declarado en los safetensors es de 7.941.100.874 (aproximadamente 7,94 mil millones), aunque la model card no especifica cuántos de ellos están activos ni si la arquitectura es densa o de mezcla de expertos.

La cuantización se ha realizado con oQ, la herramienta de cuantización de precisión mixta de oMLX v0.6.4, y el campo model type de la model card indica "gemma4". El formato resultante está pensado para inferencia local en Apple Silicon mediante la librería MLX. El propio autor advierte de que esta versión se subió el 20 de septiembre de 2026 y sustituye a una anterior, por lo que quienes la hubieran descargado antes deben volver a hacerlo.

La relevancia de esta ficha es limitada pero concreta: se trata de una alternativa de despliegue local en Mac para un modelo de unos 8.000 millones de parámetros, sin necesidad de GPU dedicada ni de servicios en la nube. Sin embargo, la documentación publicada es mínima: no hay licencia, idiomas, longitud de contexto, benchmarks ni descripción del ajuste fino, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el campo model type de la model card indica "gemma4") |
| Parámetros totales | 7.941.100.874 (≈7,94 mil millones, según los safetensors) |
| Parámetros activos | no disponible; no se confirma si la arquitectura es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits, tamaño de grupo 64, precisión mixta (oQ, oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (librería mlx), 6 bits |
| Tamaño del repositorio | 7,2 GB |
| Fecha de publicación | 2026-09-20 (sustituye a una versión anterior) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. El único dato técnico es que el campo model type vale "gemma4", lo que apunta a que se trata de un derivado de la familia Gemma de Google, pero no se especifica el número de capas, la dimensionalidad, el tipo de atención ni el mecanismo de normalización. Tampoco se indica si el modelo original es denso o utiliza mezcla de expertos, ni si incorpora algún esquema de atención lineal o híbrida.

Respecto al entrenamiento, la model card no aporta ningún dato: no hay número de tokens, composición del dataset, ni mención a fases de ajuste supervisado, RLHF o DPO. El nombre del repositorio incluye la etiqueta "NPC" y "E4B", lo que sugiere un ajuste orientado a personajes de videojuego y una nomenclatura de parámetros efectivos similar a la empleada en otros modelos Gemma, pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor. La única transformación documentada es la cuantización posterior con oQ en precisión mixta a 6 bits.

## Capacidades

No se han publicado capacidades verificadas para este modelo. Como cuantización de un modelo de la familia Gemma, se espera que conserve las capacidades del modelo original, pero no hay ninguna evaluación que lo confirme. Los puntos siguientes son expectativas razonables, no datos confirmados:

- Generación de texto conversacional en varios turnos, con el estilo propio del ajuste fino original.
- Razonamiento básico y respuesta a instrucciones, sujeto al comportamiento del modelo base.
- Posible especialización en interpretación de personajes (rol), dado el sufijo "NPC" del nombre.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Personajes no jugadores en prototipos de videojuego: el sufijo "NPC" del nombre sugiere que el modelo está ajustado para diálogos de personajes. Se podría integrar en un motor como Unity o Godot mediante un servidor local de MLX en un Mac de desarrollo para generar respuestas de personajes con personalidad fija.
- Asistente conversacional local en Mac: al estar en formato MLX de 6 bits, permite ejecutar un modelo de ~8.000 millones de parámetros en memoria unificada de Apple Silicon sin enviar datos a terceros, útil para entornos con requisitos de privacidad.
- Prototipado rápido de aplicaciones de chat: el formato MLX se carga directamente con mlx-lm, lo que reduce el tiempo de puesta en marcha frente a convertir pesos a otros formatos.
- Generación de diálogos para guiones y narrativa: se puede usar para producir borradores de conversaciones de personajes, siempre que se revise la salida por el riesgo de alucinación y de deriva de estilo.
- Evaluación comparativa de cuantizaciones: sirve como punto de comparación frente a la versión sin cuantizar o a otras precisiones, para medir la pérdida de calidad asociada a los 6 bits en tareas concretas del dominio del ajuste.
- Investigación sobre cuantización de precisión mixta: el uso de oQ con tamaño de grupo 64 permite estudiar el compromiso entre tamaño en disco (7,2 GB) y fidelidad respecto al modelo original.
- Despliegue en estaciones de trabajo de Apple Silicon para tareas internas de generación de texto, con la limitación de que no hay licencia declarada que autorice explícitamente el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Comparación con el modelo sin cuantizar | no disponible |

## Requisitos de hardware

- Peso teórico de los pesos en 6 bits: aproximadamente 5,96 GB (7,94 mil millones de parámetros × 0,75 bytes por parámetro). El repositorio ocupa 7,2 GB, incluyendo metadatos y posibles capas no cuantizadas.
- VRAM estimada para inferencia: en torno a 7-10 GB contando pesos y caché KV, aunque la cifra exacta depende de la longitud de contexto, que no está documentada.
- Apple Silicon: es el destino natural del formato MLX. Se recomienda un Mac con 16 GB o más de memoria unificada; con 8 GB el margen es muy ajustado y el contexto útil quedará muy limitado.
- GPU NVIDIA y AMD: MLX está diseñado para memoria unificada de Apple Silicon. Para usar estos pesos en GPU dedicada sería necesario convertirlos a otro formato (por ejemplo GGUF), y el repositorio no incluye esa conversión.
- GPU recomendadas: no disponible para GPU dedicada. En el ecosistema Apple, cualquier chip de la familia M con 16 GB o más de memoria unificada es un candidato razonable.
- Opciones de despliegue: mlx-lm (generación por línea de comandos y servidor), oMLX y herramientas compatibles con MLX como LM Studio. No se distribuyen pesos en GGUF ni en safetensors de PyTorch, por lo que Ollama, llama.cpp, vLLM o TGI no pueden consumir este repositorio directamente.
- Latencia y throughput: no disponible; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable: no se confirma cuál es el modelo base exacto, no hay licencia declarada, no hay longitud de contexto documentada y no existen resultados de benchmarks publicados para esta cuantización. Cualquier comparación numérica sería especulativa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Gemma4NPC-E4B-oQ6 | 7,94 B | no disponible | no disponible | MLX safetensors 6 bits | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial. Si el modelo deriva de la familia Gemma, habría que consultar los términos de uso del modelo base, que no se referencian en esta ficha.
- Ausencia de validación comunitaria: el repositorio registra cero descargas y cero valoraciones, por lo que no existe evidencia externa de que los pesos carguen correctamente ni de la calidad de las respuestas.
- Modelo sustituido: el autor indica que esta versión reemplaza a una anterior publicada antes del 20 de septiembre de 2026; mezclar pesos de ambas versiones puede producir resultados inconsistentes.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso con apariencia plausible. No hay evaluación publicada que acote este riesgo en el dominio del ajuste.
- Sesgos: no documentados. Un ajuste orientado a personajes de videojuego puede introducir estilos de respuesta estereotipados o poco adecuados para usos profesionales.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que no se puede garantizar un rendimiento aceptable fuera del idioma principal del ajuste, presumiblemente el inglés.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide dimensionar la caché KV y planificar despliegues con documentos largos.
- Compatibilidad restringida: el formato MLX limita el uso a Apple Silicon o a conversiones manuales no incluidas en el repositorio.
- Precisión de 6 bits: la cuantización puede degradar tareas sensibles a la precisión numérica, como matemáticas o generación de código, sin que existan mediciones publicadas de esa pérdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atomheart-Father/Gemma4NPC-E4B-oQ6
- Repositorio de oQ / oMLX, herramienta de cuantización utilizada: https://github.com/jundot/omlx
- Documentación de MLX (referencia general del formato): https://github.com/ml-explore/mlx
- Búsqueda web realizada: no se encontró ningún resultado relevante sobre este modelo; los enlaces devueltos por el buscador no guardaban relación con el contenido solicitado.
