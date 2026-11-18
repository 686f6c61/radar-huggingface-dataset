# SC117/Ling-3.0-tiny-abliterated-APEX-GGUF

## Resumen

Ling-3.0-tiny-abliterated-APEX-GGUF es una cuantización comunitaria del modelo base inclusionAI/Ling-3.0-tiny, publicada por el usuario SC117 en Hugging Face. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 7.893.392.800 parámetros totales y aproximadamente 1.300 millones de parámetros activos por token, según indica la model card del autor. El modelo base pertenece a la familia Ling de inclusionAI y está etiquetado como "hybrid-reasoning MoE", lo que sugiere un modo de razonamiento híbrido, aunque la información disponible no detalla su funcionamiento interno.

Esta variante incorpora dos modificaciones principales sobre el modelo original. La primera es una "abliteración" (eliminación de la dirección de rechazo) realizada con la herramienta abliterix mediante búsqueda de configuración de steering con LoRA sobre una carga en bnb-4bit, con más de 130 configuraciones candidatas evaluadas y una receta seleccionada por criterio de Pareto e integrada en los pesos BF16. La segunda es el uso de APEX, una técnica de cuantización de precisión mixta consciente de MoE que clasifica cada tensor según su rol (experto enrutado, experto compartido o atención) y aplica un gradiente de precisión por capas.

El resultado es un conjunto de ficheros GGUF orientados a llama.cpp, con licencia MIT, pensados para inferencia local y despliegue ligero. Su relevancia actual radica en que combina un modelo MoE de tamaño moderado con una cuantización que, según el autor, supera la perplejidad de Q8_0 a la mitad de tamaño e incluso la de F16, lo que lo hace atractivo para entornos con recursos limitados. No obstante, al tratarse de una modificación no oficial, conviene tratar sus afirmaciones de rendimiento con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) tipo transformer, etiquetada como "hybrid-reasoning MoE"; 128 expertos enrutados con 8 activos por token |
| Parámetros totales | 7.893.392.800 (7,9B) |
| Parámetros activos | ~1,3B (aproximadamente 1.300 millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con cuantización APEX (precisión mixta consciente de MoE, con gradiente de precisión por capas); niveles concretos de cuantización no detallados en la información disponible |
| Idiomas soportados | no disponible (la model card está en inglés y chino, pero no se especifica el conjunto de idiomas del modelo) |
| Licencia | MIT |
| Formato de pesos | GGUF (para llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny es un MoE con 7,9B parámetros totales y aproximadamente 1,3B activos, con 128 expertos enrutados de los cuales 8 se activan por token. La model card lo describe como "hybrid-reasoning MoE", término que sugiere la combinación de generación directa y razonamiento explícito, aunque no se aportan detalles sobre el mecanismo concreto ni sobre la composición del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa del modelo base.

Sobre esta base, el autor aplica una abliteración mediante abliterix: se explora un espacio de más de 130 configuraciones de steering con LoRA sobre una carga en bnb-4bit, se selecciona una receta por criterio de Pareto y se fusiona en los pesos BF16. El autor reporta una reducción del 85% en rechazos (15/100 frente a 98/100 en la línea base) con una divergencia KL de 0,0677, y afirma que las comprobaciones posteriores de capacidades (matemáticas, lógica, código, traducción y conocimiento) no muestran degradación. Estas cifras proceden exclusivamente del autor y no han sido verificadas de forma independiente.

La cuantización APEX, desarrollada en el repositorio mudler/apex-quant, clasifica cada tensor por su rol y aplica mayor precisión a las capas extremas (más sensibles) y mayor compresión a las capas intermedias redundantes. El autor afirma que APEX supera la perplejidad de Q8_0 a la mitad de tamaño e incluso la de F16, si bien no se proporcionan tablas de perplejidad ni metodología de evaluación en la información disponible.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como conversacional.
- Razonamiento híbrido: la etiqueta "hybrid-reasoning MoE" del modelo base sugiere soporte de modos de razonamiento, aunque no se detalla su funcionamiento.
- Capacidades matemáticas, lógicas, de código y traducción: el autor afirma haber realizado comprobaciones puntuales de estas capacidades tras la abliteración sin degradación observada.
- Generación sin rechazos: la abliteración elimina en gran medida la dirección de rechazo, con una reducción reportada del 85% en respuestas de rechazo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card está en inglés y chino, pero no se especifica el soporte idiomático del modelo.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Inferencia local en equipos de consumo: al ser un MoE de 7,9B con solo ~1,3B parámetros activos y estar cuantizado en GGUF con APEX, puede ejecutarse en llama.cpp sobre GPU de gama media o incluso CPU con suficiente memoria RAM, lo que lo hace adecuado para prototipado y uso personal sin infraestructura dedicada.
- Despliegue en entornos con memoria limitada: la cuantización APEX comprime las capas intermedias de forma agresiva, permitiendo ajustar el tamaño del fichero al presupuesto de VRAM disponible; el autor afirma que supera a Q8_0 en perplejidad con la mitad de tamaño.
- Generación de texto creativo sin restricciones temáticas: la abliteración reduce los rechazos, lo que puede interesar en aplicaciones de escritura de ficción, guiones o contenido donde los filtros estándar resultan limitantes.
- Experimentación en investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar el efecto de la abliteración sobre las capacidades y los sesgos, comparándolo con el modelo base original.
- Chat conversacional autoalojado: su naturaleza conversacional y su formato GGUF permiten integrarlo en interfaces de chat locales (por ejemplo, mediante llama.cpp server u Ollama) para uso privado.
- Evaluación de técnicas de cuantización: al estar disponible junto al modelo base, permite comparar el impacto de APEX frente a cuantizaciones estándar en tareas de generación y razonamiento.
- Filtrado y clasificación de texto por lotes: con un coste de cómputo activo bajo (~1,3B parámetros), puede procesar grandes volúmenes de texto en pipelines offline donde la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas del proceso de abliteración (15/100 rechazos frente a 98/100 de la línea base, con divergencia KL de 0,0677) y afirmaciones cualitativas sobre la perplejidad de APEX frente a Q8_0 y F16, sin tablas de resultados ni comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; depende del fichero GGUF elegido. Como referencia, un modelo de 7,9B parámetros en cuantizaciones de 4-5 bits por peso ocupa aproximadamente entre 4 y 5 GB, y en 8 bits en torno a 8 GB, si bien el tamaño real de cada fichero APEX no se detalla en la información proporcionada (el repositorio completo ocupa 35 GB e incluye varias cuantizaciones).
- GPU recomendadas: no disponibles de forma específica. Por tamaño, el modelo debería caber en GPU de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090 en cuantizaciones de 4-8 bits; para las cuantizaciones de mayor precisión serían recomendables GPU profesionales como A100 o H100.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de cuantizaciones, dado el tamaño total de 7,9B parámetros y los ~1,3B activos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por compatibilidad de formato, servidores compatibles con GGUF como llama.cpp server; el uso con vLLM, TGI u Ollama no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SC117/Ling-3.0-tiny-abliterated-APEX-GGUF | 7,9B | ~1,3B | no disponible | MIT | GGUF | Abliterado, cuantización APEX |
| inclusionAI/Ling-3.0-tiny (base) | 7,9B | ~1,3B | no disponible | MIT | safetensors | Modelo original sin abliterar |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

La comparación más directa y fiable es con el propio modelo base, del que esta variante deriva. No se dispone de información suficiente para comparar con otras familias de modelos de tamaño y arquitectura similares sin recurrir a datos no verificados.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo, lo que implica que el modelo puede generar contenido que el modelo original rechazaría; esto supone un riesgo para despliegues públicos sin filtros adicionales.
- Las afirmaciones del autor sobre la reducción de rechazos (85%), la divergencia KL (0,0677) y la ausencia de degradación de capacidades no han sido verificadas de forma independiente.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones específicas de fidelidad factual.
- Sesgos conocidos: no se documentan en la información disponible; la abliteración puede alterar el comportamiento del modelo en temas sensibles y no se ha evaluado su efecto sobre sesgos sociales.
- Longitud de contexto e idiomas soportados no especificados, lo que dificulta planificar su uso en tareas que requieran ventanas largas o cobertura multilingüe.
- Las afirmaciones sobre la cuantización APEX (superar a Q8_0 y F16 en perplejidad) carecen de tablas de resultados y metodología pública en la información disponible.
- Licencia MIT: permite uso comercial, pero al tratarse de una modificación no oficial del modelo base, conviene revisar también la licencia del modelo original (enlazada por el autor a inclusionAI/Ling-3.0-tiny).
- El repositorio ocupa 35 GB e incluye múltiples cuantizaciones; es necesario seleccionar el fichero adecuado según el hardware disponible.
- Al ser una publicación comunitaria, no hay garantías de mantenimiento, soporte ni actualizaciones por parte del desarrollador original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SC117/Ling-3.0-tiny-abliterated-APEX-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Licencia del modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny/blob/main/LICENSE
- Documentación en chino: https://huggingface.co/SC117/Ling-3.0-tiny-abliterated-APEX-GGUF/blob/main/README_zh.md
- Herramienta de abliteración abliterix: https://github.com/wuwangzhang1216/abliterix
- Herramienta de cuantización APEX: https://github.com/mudler/apex-quant
