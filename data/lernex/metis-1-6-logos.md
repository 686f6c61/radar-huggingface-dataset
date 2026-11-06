# Lernex/Metis-1.6-Logos

## Resumen

Metis-1.6 Logos es un modelo de lenguaje de 10.390 millones de parámetros (10,23B según el autor) desarrollado por Lernex, un laboratorio que lo presenta como un modelo de razonamiento entrenado desde cero, incluyendo el pipeline de datos y los kernels de entrenamiento. Su rasgo distintivo es una arquitectura híbrida que combina Mamba-2 con atención en un esquema de mezcla de expertos (MoE), y que ejecuta cada token dos veces por la misma pila de pesos (un "doble paso"), activando aproximadamente 1.180 millones de parámetros en cada pasada. Se distribuye bajo licencia Apache 2.0 y en formato safetensors para la librería transformers.

El modelo se posiciona explícitamente como una propuesta de eficiencia más que de frontera: el autor declara un entrenamiento de 1,02 billones de tokens, aproximadamente una doceava parte de la mediana de los modelos abiertos con los que se compara. Su punto fuerte declarado son las matemáticas, con un 67,50% en AIME 2025 y un 63,64% en HMMT February 2026, y el autor lo sitúa en la segunda posición de 30 modelos abiertos en esa categoría. Admite un modo de razonamiento ("thinking") y un modo de respuesta directa, con una ventana de contexto de 131.072 tokens.

Es relevante ahora porque propone una receta alternativa (híbrida Mamba-atención con doble paso y MoE) que alcanza resultados competitivos en razonamiento matemático con un presupuesto de datos y cómputo muy inferior al habitual. El propio autor advierte que código, seguimiento de instrucciones y contexto largo todavía van por detrás, por lo que conviene tratarlo como un modelo especializado en matemáticas y razonamiento antes que como un sustituto generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + atención, con mezcla de expertos (MoE) y doble paso por token |
| Parámetros totales | 10.393.227.876 (10,23B según el autor) |
| Parámetros activos | ~1,18B por pasada (el token pasa dos veces por la pila) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

Metis-1.6 Logos emplea una arquitectura híbrida que combina capas Mamba-2 (modelo de espacio de estados) con capas de atención, organizadas como mezcla de expertos. La innovación principal es el doble paso: cada token atraviesa la pila dos veces utilizando exactamente los mismos pesos, de modo que el coste computacional por token se duplica pero no el número de parámetros almacenados. Con 10,23B parámetros totales, la activación efectiva es de unos 1,18B por pasada. El modelo se distribuye con código personalizado (`custom_code`), lo que implica que la implementación de referencia no está integrada en transformers de serie y requiere cargar módulos propios del repositorio.

El entrenamiento se realizó desde cero sobre 1,02 billones de tokens, una cifra que el autor sitúa en torno a una doceava parte de la mediana de los modelos abiertos comparables que publican su recuento. La model card menciona un post-entrenamiento con ajuste de instrucciones (instruction-tuned) y capacidades de razonamiento, pero no detalla la composición del dataset, el uso de RLHF o DPO, ni la mezcla de datos. Tampoco se especifican innovaciones adicionales como decodificación especulativa. Existe un informe técnico asociado (arXiv:2610.37903) que probablemente contiene esos detalles, pero su contenido no está incluido en la información disponible.

## Capacidades

- Generación de texto conversacional y razonamiento en modo "thinking" o respuesta directa, seleccionable por petición.
- Razonamiento matemático de competición, con resultados declarados en AIME 2025 y HMMT February 2026.
- Ventana de contexto de 131.072 tokens para entradas largas.
- Ajuste de instrucciones (instruction-tuned) sobre el modelo base Lernex/Metis-1.6-Logos-Base.
- Capacidades multilingües: no disponible (no se declaran idiomas en la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el modo "thinking" sugiere razonamiento encadenado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está entrenado y evaluado específicamente en AIME y HMMT, por lo que resulta adecuado para generar soluciones paso a paso en entornos educativos o de investigación matemática, usando el modo "thinking" para maximizar la precisión.
- Generación de demostraciones y verificación de teoremas: con 131.072 tokens de contexto puede recibir un enunciado largo junto con definiciones y lemas previos, y producir una demostración razonada; conviene validar la salida con un comprobador formal.
- Asistencia en investigación matemática aplicada: para explorar enfoques alternativos a un problema, el modo directo sirve para respuestas rápidas y el modo thinking para desarrollos extensos, con la ventaja de que el modelo cabe en una sola GPU de 24-48 GB en cuantizaciones bajas.
- Tutoría automatizada de matemáticas: puede gestionar conversaciones multi-turno con contexto largo, manteniendo el hilo de un problema a lo largo de varios intercambios y explicando los pasos intermedios.
- Procesamiento de documentos técnicos largos: la ventana de 131.072 tokens permite ingerir artículos o informes completos y extraer razonamientos o resúmenes estructurados, aunque el autor advierte que el rendimiento en contexto largo aún va por detrás de los modelos frontera.
- Evaluación comparativa de modelos de razonamiento: al ser Apache 2.0 y de tamaño contenido, es útil como baseline reproducible en experimentos de investigación sobre arquitecturas híbridas Mamba-atención y esquemas MoE con doble paso.
- Despliegue en entornos con recursos limitados: con ~1,18B parámetros activos por pasada, la inferencia es más barata que la de un denso de 10B, lo que lo hace viable para servicios de razonamiento matemático en infraestructura modesta.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor, que declara haber ejecutado todos los modelos con el mismo harness, prompts y evaluadores. No se incluyen en la información proporcionada los resultados completos de los modelos comparados, por lo que solo se recogen los del modelo.

| Benchmark | Metis-1.6 Logos |
|---|---|
| AIME 2025 | 67,50% |
| HMMT February 2026 | 63,64% |
| Posición declarada en matemáticas | 2.ª de 30 modelos abiertos |

El autor indica que el modelo se sitúa en la frontera de Pareto en datos de entrenamiento y cómputo, y que código, seguimiento de instrucciones y contexto largo quedan por detrás. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de los modelos comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 10,23B parámetros totales, en FP16 se necesitan aproximadamente 20,5 GB solo para pesos, más overhead de contexto y caché KV; en cuantización de 8 bits, unos 10-11 GB; en 4 bits, unos 5-6 GB. Los tipos de cuantización oficialmente soportados no están disponibles en la información.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin compromisos y contexto completo de 131.072 tokens; RTX 4090 (24 GB) para FP16 con contexto moderado o 8 bits con contexto largo.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 24 GB en 8 bits; en 4 bits podría caber en GPUs de 8-12 GB, aunque no se confirma soporte oficial de cuantización.
- Opciones de despliegue: transformers con `custom_code` es la vía de referencia; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, y la arquitectura híbrida Mamba-atención con doble paso probablemente requiera soporte específico.
- Latencia y throughput: no disponibles. El doble paso por token duplica el coste de cómputo respecto a una arquitectura de un solo paso con los mismos parámetros activos.

## Comparativa con modelos similares

La model card menciona comparaciones con Metis-1.6 Praxis y con 15 modelos abiertos post-entrenados del conjunto de comparación de Logos Base, pero no se proporcionan sus especificaciones ni resultados en la información disponible.

| Modelo | Parámetros | Contexto | Matemáticas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Metis-1.6 Logos | 10,23B (1,18B activos) | 131.072 | 67,50% AIME 2025; 63,64% HMMT feb. 2026 | Apache 2.0 | Hugging Face |
| Metis-1.6 Praxis | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Modelos del conjunto de comparación (15) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- El propio autor reconoce que código, seguimiento de instrucciones y contexto largo están por detrás de los modelos frontera; no debe usarse como sustituto generalista sin validación.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en demostraciones matemáticas donde un paso erróneo invalida el resultado; se recomienda verificación formal o revisión humana.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no declarados; el rendimiento fuera del inglés (y posiblemente del chino) es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo requiere `custom_code`, lo que añade dependencia de código del autor y posibles problemas de mantenimiento o seguridad en producción.
- El repositorio tiene solo 18 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy baja y escasa validación independiente de los resultados declarados.
- Los benchmarks son autodeclarados por el autor y no se han reproducido de forma independiente en la información disponible.
- La arquitectura híbrida con doble paso puede no estar soportada por los runners de inferencia habituales, lo que limita las opciones de despliegue optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lernex/Metis-1.6-Logos
- Modelo base: https://huggingface.co/Lernex/Metis-1.6-Logos-Base
- Modelo relacionado (Praxis): https://huggingface.co/Lernex/Metis-1.6-Praxis
- Colección Metis-1.6: https://huggingface.co/collections/Lernex/metis-16-6adc52e150d985721d894f6b
- Informe técnico: https://arxiv.org/abs/2610.37903
- Sitio del autor: https://lernex.com
- X del autor: https://x.com/Lernex_ai
