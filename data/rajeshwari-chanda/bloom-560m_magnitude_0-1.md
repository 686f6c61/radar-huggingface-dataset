# Rajeshwari-Chanda/bloom-560m_magnitude_0.1

## Resumen

El modelo Rajeshwari-Chanda/bloom-560m_magnitude_0.1 es una variante del modelo BLOOM-560m de BigScience sometida a un proceso de poda por magnitud (*magnitude pruning*) con un umbral o ratio de 0,1, segun se deduce del propio nombre del repositorio. BLOOM-560m es un transformer decoder-only de 559.214.592 parametros, con 24 capas, 16 cabezas de atencion y una dimension oculta de 1024, disenado originalmente para generacion de texto multilingue. El repositorio fue publicado por el usuario Rajeshwari-Chanda en octubre de 2026 y no incluye model card sustantiva: la tarjeta existente es la plantilla autogenerada de Hugging Face, sin datos de autor, licencia ni uso previsto.

La relevancia de esta publicacion es fundamentalmente metodologica: se trata de un artefacto de investigacion pensado para estudiar el efecto de la poda sobre un modelo pequeno y completamente abierto. La poda por magnitud es una tecnica de compresion que pone a cero los pesos de menor valor absoluto, con el objetivo de reducir coste computacional o facilitar el ajuste fino posterior, aunque en su variante no estructurada no reduce el numero de parametros almacenados. No hay publicacion asociada, ni resultados de evaluacion, ni documentacion del procedimiento de poda empleado.

Dado que no existe informacion especifica sobre como se aplico la poda ni sobre la calidad del modelo resultante, esta ficha se apoya en las caracteristicas conocidas del modelo base bigscience/bloom-560m para las secciones de arquitectura, capacidades y despliegue, y marca explicitamente como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM) |
| Parametros totales | 559.214.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada del modelo base BLOOM) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en precision completa) |
| Idiomas soportados | no disponibles en la ficha; el modelo base BLOOM cubre 45 lenguas naturales y 12 lenguajes de programacion |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 1,1 GB |
| Numero de capas | 24 (heredado del modelo base) |
| Cabezas de atencion | 16 (heredado del modelo base) |
| Dimension oculta | 1024 (heredado del modelo base) |
| Parametros de embedding | ~256,9 M (heredado del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM-560m: un transformer decoder-only con atencion causal, normalizacion de capa en la entrada de cada bloque, activacion GeLU en la MLP y sesgo de atencion tipo ALiBi en lugar de embeddings posicionales aprendidos. La tokenizacion usa un vocabulario multilingue de gran tamano, lo que explica que una parte muy elevada de los parametros (256,9 M de los 559,2 M) corresponda a la matriz de embeddings. El modelo base fue entrenado por BigScience sobre el corpus ROOTS: 1,5 TB de texto preprocesado en 45 lenguas naturales y 12 lenguajes de programacion, convertidos en aproximadamente 350.000 millones de tokens unicos con una longitud de secuencia de 2048 tokens.

Sobre el proceso de poda aplicado en esta variante no hay informacion tecnica alguna en la model card. El nombre "magnitude_0.1" sugiere una poda por magnitud de los pesos con un umbral o ratio de 0,1, pero se desconoce si se trata de poda no estructurada (que anularia pesos individuales sin reducir el recuento total de parametros, coherente con que el safetensors mantenga 559.214.592 parametros), de poda estructurada por cabezas o neuronas, o de una combinacion con reentrenamiento. Tampoco consta si hubo ajuste fino posterior a la poda, ni cuantos tokens se usaron en su caso, ni si se aplicaron tecnicas de regularizacion como movimiento de pesos (*weight rewinding*) o poda iterativa.

## Capacidades

- Generacion de texto autoregresiva en el estilo propio de los modelos causales de la familia BLOOM.
- Capacidad multilingue heredada del modelo base: el corpus de entrenamiento de BLOOM cubre 45 lenguas naturales, con especial presencia del ingles, aunque el rendimiento fuera del ingles es notablemente inferior.
- Generacion de codigo basica, dado que el corpus ROOTS incluye 12 lenguajes de programacion.
- Razonamiento limitado: al tratarse de un modelo de 560 M de parametros, el rendimiento en tareas de razonamiento multi-paso, matematicas y logica es muy bajo en comparacion con modelos actuales.
- Soporte de *tool calling*: no disponible; el modelo base no fue entrenado para ello y la variante podada no documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo "thinking": no disponibles.
- Comportamiento conversacional: no esta ajustado por instrucciones (no es un modelo *instruct*), por lo que las respuestas no siguen indicaciones sin un ajuste fino adicional.

Todas estas capacidades corresponden al modelo base BLOOM; no hay evidencia publicada de como la poda al 0,1 las afecta en esta variante concreta.

## Casos de uso

- Experimentacion academica en compresion de modelos: este repositorio sirve como punto de partida para estudiar el efecto de la poda por magnitud sobre un transformer multilingue pequeno, comparando perplejidad y calidad de generacion frente a bigscience/bloom-560m sin podar.
- Ajuste fino con recursos muy limitados: al ser un modelo de ~560 M de parametros con pesos en safetensors, cabe en una GPU de gama media y puede emplearse como banco de pruebas para tecnicas de PEFT (LoRA, adaptadores) sobre modelos podados.
- Generacion de texto no critica en entornos controlados: completado de frases, generacion de plantillas o borradores en los que la calidad no sea determinante y el coste computacional sea el factor limitante.
- Clasificacion y etiquetado mediante *fine-tuning*: con un ajuste especifico por tarea, puede emplearse para clasificacion de texto, analisis de sentimiento o extraccion de entidades en dominios acotados y con vocabulario limitado.
- Investigacion sobre destilacion y *sparsity*: sirve para analizar la relacion entre el ratio de poda, la distribucion de pesos no nulos y la degradacion de la perplejidad, proporcionando un punto de comparacion con otras tecnicas de compresion.
- Prototipado educativo: por su tamano reducido y su licencia de la familia BLOOM (abierta en el modelo base), permite ilustrar el funcionamiento interno de un transformer causal multilingue en cursos o talleres sin necesidad de infraestructura de datacenter.

No se recomienda su uso en produccion sin una evaluacion previa: no existe informacion sobre la degradacion introducida por la poda ni sobre el comportamiento en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla autogenerada de Hugging Face y no incluye ninguna seccion de evaluacion completada. Tampoco hay resultados publicados por el autor en la busqueda web realizada, ni comparaciones con el modelo base bigscience/bloom-560m.

Como referencia del modelo base (no de esta variante podada), el BLOOM-560m original se situa en el rango bajo de los modelos de su categoria en pruebas estandar de conocimiento y razonamiento, con un rendimiento muy inferior al de modelos contemporaneos de mayor tamano. No se dispone de cifras concretas verificables en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2,2 GB solo para los pesos (559,2 M de parametros x 4 bytes), mas el estado de activaciones y la cache KV, que dependen de la longitud de secuencia.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para los pesos, lo que coincide con el tamano del repositorio (1,1 GB).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,6 GB para los pesos; en 4 bits, aproximadamente 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 4 GB de VRAM es suficiente en fp16 (por ejemplo, GTX 1660, RTX 3060, RTX 4060 o superiores). En un entorno profesional, una sola A100, H100 o L4 resulta sobradamente suficiente.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU con suficiente RAM para inferencia lenta.
- Opciones de despliegue: transformers (libreria con la que esta etiquetado el repositorio), text-generation-inference (TGI, segun los tags del modelo), y, si se generan conversiones, llama.cpp u Ollama. No se han publicado conversiones a GGUF en el repositorio.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 560 M de parametros, en una GPU moderna la generacion suele ser de decenas de tokens por segundo o mas, pero no hay mediciones publicadas para esta variante podada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rajeshwari-Chanda/bloom-560m_magnitude_0.1 | 559,2 M | 2048 tokens | no disponible | Hugging Face (0 descargas, 0 likes) | Variante podada sin documentacion |
| bigscience/bloom-560m | 559,2 M | 2048 tokens | BigScience BLOOM RAIL 1.0 (uso comercial permitido con condiciones) | Hugging Face, ampliamente usado | Modelo base, con model card completa y evaluaciones |
| bigscience/bloom-1b1 | ~1.100 M | 2048 tokens | BigScience BLOOM RAIL 1.0 | Hugging Face | Version de mayor tamano de la misma familia |
| Modelos tipo GPT-2 small/medium | 124 M / 355 M | 1024 tokens | MIT (GPT-2) | Hugging Face | Alternativas monoliticas de tamano comparable, solo en ingles |

La comparacion directa con el modelo base es la mas relevante: esta variante parte del mismo checkpoint y solo se diferencia por el proceso de poda, del que no hay documentacion. Frente a alternativas de tamano similar, la principal ventaja de la familia BLOOM es su cobertura multilingue, mientras que su principal desventaja es un rendimiento por parametro inferior al de arquitecturas mas recientes.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no especifica autor efectivo, procedimiento de poda, datos de ajuste, licencia ni uso previsto. No debe asumirse que la licencia del modelo base se hereda automaticamente sin verificacion.
- Licencia desconocida: no disponible. Esto impide determinar si el uso comercial esta permitido, por lo que no debe emplearse en produccion sin aclarar este punto con el autor.
- Degradacion por poda no cuantificada: no se ha publicado ninguna evaluacion del impacto de la poda al 0,1 sobre la perplejidad, la coherencia o la calidad multilingue. Es esperable cierta degradacion, pero su magnitud es desconocida.
- Riesgo de alucinacion: alto, como en cualquier modelo causal de 560 M de parametros sin ajuste por instrucciones; el modelo tiende a generar texto plausible pero no verificado.
- Sesgos conocidos del modelo base: BLOOM fue entrenado sobre un corpus web filtrado y presenta sesgos de genero, raza, religion y nacionalidad documentados en la literatura sobre el modelo original. La poda no corrige ni atenua estos sesgos.
- Limitacion idiomatica: aunque el modelo base cubre 45 lenguas, su rendimiento fuera del ingles es sustancialmente peor, y en castellano la calidad es limitada incluso en el modelo sin podar.
- No es un modelo de instrucciones: no existe variante *instruct* ni ajuste conversacional; requiere *prompting* en estilo de completado o un ajuste fino especifico.
- Sin soporte de *tool calling* ni de agentes: no fue entrenado para ello y no hay evidencia de que la poda introduzca esta capacidad.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que dificulta cualquier validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_magnitude_0.1
- Perfil del autor: https://huggingface.co/Rajeshwari-Chanda/models
- Modelo base BLOOM-560m: https://huggingface.co/bigscience/bloom-560m
- Ficha de BLOOM-560m en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/bloom-560m-bigscience
- Entrada de BLOOM en Wikipedia: https://en.wikipedia.org/wiki/BLOOM_(language_model)
- Catalogo de Microsoft Foundry para bigscience-bloom-560m: https://ai.azure.com/catalog/models/bigscience-bloom-560m
- Calculadora de impacto medioambiental citada en la model card (Lacoste et al., 2019): https://mlco2.github.io/impact
- Paper de referencia sobre impacto computacional: https://arxiv.org/abs/1910.09700
