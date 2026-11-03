# Lernex/Metis-1.6-Praxis

## Resumen

Metis-1.6-Praxis es un modelo de lenguaje de 2.940 millones de parámetros (3.077.520.815 según los pesos en safetensors) especializado en razonamiento matemático, desarrollado por Lernex y publicado bajo licencia Apache 2.0. Su particularidad arquitectónica es que cada token atraviesa dos veces la misma pila híbrida de Mamba-2 y atención con mezcla de expertos (MoE), reutilizando los mismos pesos en cada pasada y activando únicamente 0,46 mil millones de parámetros por pasada. El modelo fue entrenado desde cero sobre 1,02 billones de tokens y deriva de un modelo base propio, Lernex/Metis-1.6-Praxis-Base.

El modelo está post-entrenado para instrucciones y razonamiento, con modos de "pensamiento" y respuesta directa seleccionables por petición, y una ventana de contexto de 131.072 tokens. Su relevancia radica en la relación entre rendimiento y coste computacional: con menos de 1.000 millones de parámetros activos por token declara superar en matemáticas a modelos que activan entre siete y doce veces más parámetros, lo que lo sitúa, según el autor, en la frontera de Pareto para su presupuesto de cómputo.

Es importante contextualizar sus límites: el propio autor lo describe como un modelo no frontera, cuyas carencias se manifiestan sobre todo en conocimiento enciclopédico, generación de código y contexto largo. Su tamaño reducido permite ejecutarlo en un portátil, lo que lo hace atractivo para prototipado local, investigación sobre arquitecturas híbridas y tareas de razonamiento matemático con restricciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Mamba-2 + atención, con mezcla de expertos (MoE); doble pasada por token con pesos compartidos |
| Parametros totales | 3.077.520.815 (2,94B según el autor) |
| Parametros activos | 0,46B por pasada (dos pasadas por token) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es una pila híbrida que combina capas de espacio de estados Mamba-2 con capas de atención, organizadas como mezcla de expertos. La innovación central es la doble pasada: cada token recorre la pila dos veces con los mismos pesos, de modo que el coste por token en parámetros activos es de 0,46B por pasada. Esta reutilización de pesos permite aumentar la profundidad efectiva del cómputo sin incrementar el número de parámetros almacenados, lo que explica la relación entre su tamaño total (2,94B) y su rendimiento declarado en matemáticas.

El entrenamiento se realizó desde cero sobre 1,02 billones de tokens, seguido de un post-entrenamiento orientado a instrucciones y razonamiento. La model card no detalla la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento, ni el desglose de fases del post-entrenamiento. Tampoco se especifican detalles sobre la tokenizadora ni sobre estrategias de decodificación especulativa. El modelo base es Lernex/Metis-1.6-Praxis-Base, y existe al menos una variante hermana en la misma colección, Metis-1.6 Logos, empleada como referencia de escala en las comparativas del autor.

## Capacidades

- Generación de texto conversacional con soporte multi-turno.
- Razonamiento matemático de competición: el autor declara 78,80% en MATH-500, 60,31% en AMC 2023 y 31,25% en AIME 2026.
- Modo de razonamiento ("thinking") y modo de respuesta directa, seleccionables por petición.
- Razonamiento multi-paso dentro del modo de pensamiento.
- Contexto largo de hasta 131.072 tokens (aunque el autor advierte que el contexto largo es uno de sus puntos débiles).
- Instrucciones y post-entrenamiento conversacional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (no se declaran idiomas).
- Visión y audio: no soportados según la información disponible (pipeline text-generation).

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está optimizado para MATH-500, AMC y AIME, por lo que encaja en plataformas de entrenamiento para olimpiadas matemáticas o en la generación de soluciones paso a paso con el modo de pensamiento activado.
- Tutoría matemática interactiva: con 131.072 tokens de contexto y modo conversacional, puede mantener sesiones largas resolviendo ejercicios encadenados y recordando el planteamiento previo del alumno.
- Evaluación y verificación de razonamiento: útil como modelo de referencia ligero para comparar cadenas de razonamiento o para generar soluciones candidatas en pipelines de verificación de respuestas matemáticas.
- Prototipado en local sobre portátil: al activar solo 0,46B parámetros por pasada y con 2,94B totales, es viable en equipos de consumo para experimentar con arquitecturas híbridas Mamba-2 + MoE sin infraestructura de servidor.
- Investigación sobre eficiencia arquitectónica: la doble pasada con pesos compartidos lo convierte en un banco de pruebas para estudiar el equilibrio entre profundidad efectiva, parámetros activos y calidad de razonamiento.
- Generación de datos sintéticos de razonamiento: puede producir trazas de pensamiento matemático para aumentar datasets de entrenamiento de modelos mayores, siempre con revisión humana por el riesgo de alucinación.
- Asistente de análisis cuantitativo acotado: para tareas de cálculo, derivación y comprobación de resultados donde el conocimiento enciclopédico no es crítico y prima el coste bajo de inferencia.

## Benchmarks y rendimiento

| Benchmark | Metis-1.6 Praxis (Think / Direct) |
|---|---|
| MATH-500 | 78,80% |
| AMC 2023 | 60,31% |
| AIME 2026 | 31,25% |

El autor indica que estos resultados se obtuvieron con el mismo harness, prompts y evaluadores que los 16 modelos del conjunto de comparación de Praxis Base, y que Praxis supera en matemáticas a modelos que activan entre siete y doce veces más parámetros. No se proporcionan en la información disponible las puntuaciones del resto de modelos de la comparativa, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks fuera de los tres indicados.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, los 3.077.520.815 parámetros ocupan aproximadamente 6,2 GB de pesos (tamaño del repo), por lo que se necesitan en torno a 8 GB de VRAM para inferencia en precisión completa con overhead de activaciones y caché KV.
- En cuantización de 8 bits, la huella de pesos baja a unos 3,1 GB; en 4 bits, a unos 1,6 GB. Los tipos de cuantización concretos soportados no están disponibles en la información proporcionada.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) debería poder ejecutarlo en precisión completa; con cuantización, GPU de 4-6 GB como RTX 3050 o portátiles integradas de gama alta podrían ser suficientes.
- Cabe en GPU consumer: sí, según el propio autor ("small enough to run on a laptop").
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `custom_code` por la arquitectura híbrida). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible y dependería de que estos motores implementen la arquitectura Mamba-2 + MoE con doble pasada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Metis-1.6-Praxis | 2,94B | 0,46B por pasada | 131.072 | Apache 2.0 | Híbrido Mamba-2 + MoE, doble pasada; 78,80% MATH-500 |
| Metis-1.6 Logos | no disponible | no disponible | no disponible | no disponible | Variante hermana de la misma familia, usada como referencia de escala por el autor |
| Modelos del conjunto Praxis Base | no disponible | 7-12x más activos que Praxis según el autor | no disponible | no disponible | 16 modelos post-entrenados comparados con el mismo harness; sin puntuaciones detalladas en la información disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas externas de la misma categoría (por ejemplo, otros modelos pequeños de razonamiento) en parámetros, contexto y rendimiento verificable.

## Limitaciones y advertencias

- El autor reconoce explícitamente que no es un modelo frontera: conocimiento enciclopédico, código y contexto largo son sus puntos más débiles.
- Riesgo de alucinación inherente a un modelo de 2,94B parámetros; no debe usarse como fuente de verdad sin verificación, especialmente en dominios factuales.
- El contexto de 131.072 tokens está declarado, pero el propio autor advierte que el rendimiento en contexto largo es limitado, por lo que no conviene asumir calidad uniforme en ventanas extensas.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés, y el castellano no está confirmado.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre 1,02 billones de tokens sin detallar la composición del dataset, los sesgos son difíciles de auditar.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al requerir `custom_code` conviene revisar el código remoto antes de desplegarlo en producción.
- Popularidad muy baja (15 descargas, 0 likes en el momento de la consulta): ecosistema limitado, menos validación comunitaria y mayor riesgo de problemas no documentados.
- Compatibilidad de motores de inferencia no confirmada para arquitecturas híbridas Mamba-2 + MoE con doble pasada; el despliegue puede requerir transformers con código personalizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lernex/Metis-1.6-Praxis
- Modelo base: https://huggingface.co/Lernex/Metis-1.6-Praxis-Base
- Variante hermana Metis-1.6 Logos: https://huggingface.co/Lernex/Metis-1.6-Logos
- Colección Metis-1.6: https://huggingface.co/collections/Lernex/metis-16-6adc52e150d985721d894f6b
- Informe técnico (arXiv): https://arxiv.org/abs/2610.37903
- Sitio del autor: https://lernex.com
- Cuenta del autor en X: https://x.com/Lernex_ai
