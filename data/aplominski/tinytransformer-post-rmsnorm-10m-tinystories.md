# aplominski/TinyTransformer-Post-RMSNorm-10M-TinyStories

## Resumen

Este modelo es un Transformer de 10 millones de parámetros desarrollado por aplominski como parte de una serie de investigación sobre estrategias de normalización en arquitecturas de lenguaje pequeñas. Se entrenó exclusivamente con el dataset TinyStories, compuesto por historias cortas en inglés para niños, con el objetivo de evaluar cómo distintas técnicas de normalización afectan al entrenamiento y al rendimiento de modelos de tamaño reducido. La variante presentada aplica RMSNorm después de las subcapas del Transformer (post-normalización), una simplificación de LayerNorm que elimina la centrada de medias y normaliza mediante la raíz cuadrada media de las activaciones. Con solo 9,6 millones de parámetros, se trata de un modelo de investigación, no apto para uso en producción, pero útil para estudiar el comportamiento de arquitecturas transformer a escala mínima. No se especifica la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con RMSNorm post-normalizacion |
| Parametros totales | 9.623.552 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer original descrita en el articulo "Attention Is All You Need" (Vaswani et al., 2017). La particularidad de esta variante es que emplea RMSNorm (Root Mean Square Layer Normalization, Zhang y Sennrich, 2019) aplicada despues de cada subcapa de atencion y de la red feed-forward, en lugar de antes (pre-normalizacion) o sin normalizacion (baseline). Esta eleccion permite comparar el efecto de la posicion de la normalizacion en el entrenamiento de modelos pequenos.

El entrenamiento se realizo sobre el dataset TinyStories (Eldan y Li, 2023), que contiene alrededor de 2,1 millones de historias cortas en ingles generadas por GPT-3.5 y GPT-4, disenadas para ser comprensibles por ninos de 3 a 4 anos. No se especifican el numero total de tokens, el regimen de entrenamiento (epochs, batch size, optimizador) ni si se aplicaron tecnicas adicionales como RLHF o DPO. La model card indica que la tarea es "masked language modeling", aunque por el contexto y la naturaleza del dataset parece tratarse de generacion de texto autoregresiva; esta discrepancia no se aclara en la documentacion.

## Capacidades

- Generacion de texto en ingles coherente, limitada a historias cortas y vocabulario infantil.
- Modelo de lenguaje pequeno capaz de completar frases y generar narraciones simples.
- No se menciona soporte para tool calling, function calling ni razonamiento multi-paso.
- No se indica capacidad de vision, audio ni modo "thinking".
- Unicamente procesa texto en ingles; no hay evidencia de capacidades multilingues.

## Casos de uso

- Investigacion academica sobre normalizacion: permite comparar el efecto de RMSNorm frente a LayerNorm y configuraciones pre/post en arquitecturas pequenas, como parte de un estudio controlado.
- Ensenanza de arquitecturas transformer: sirve como ejemplo practico para estudiantes que quieran entender el impacto de la normalizacion en el entrenamiento de modelos de lenguaje.
- Experimentos de entrenamiento distribuido: al ser muy pequeno, se puede usar para probar pipelines de entrenamiento o ajuste fino en entornos con recursos limitados.
- Generacion de historias cortas para prototipos: puede producir relatos simples en ingles, util para demos o pruebas de concepto en aplicaciones educativas.
- Validacion de tecnicas de regularizacion: dado que la serie incluye varias variantes, se pueden ejecutar experimentos comparativos sobre estabilidad de entrenamiento.
- Pruebas de inferencia en dispositivos de bajo consumo: su tamano reducido permite ejecutarlo en CPU o microcontroladores para evaluar viabilidad de modelos de lenguaje embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. El unico dato mencionado es la metrica "accuracy" en los metadatos, pero sin valores concretos.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el numero de parametros (9,6 millones), en precision FP32 ocuparia aproximadamente 38,5 MB, pero no se proporciona informacion oficial sobre requisitos de memoria.
- GPU recomendadas: no hay recomendaciones especificas. Modelos de este tamano se ejecutan sin problemas en cualquier GPU moderna, incluso en CPU.
- Compatibilidad con GPU de consumo: si, cualquier GPU con al menos 2 GB de VRAM es suficiente, aunque no se confirma en la documentacion.
- Opciones de despliegue: no se mencionan herramientas especificas como vLLM, llama.cpp u Ollama. Dado que los pesos estan en formato safetensors, es compatible con frameworks de Hugging Face Transformers.
- Latencia y throughput: no se proporcionan datos. En CPU, la generacion de texto seria lenta pero funcional; en GPU, casi instantanea para frases cortas.

## Comparativa con modelos similares

Esta serie incluye cinco variantes con el mismo numero de parametros y dataset, diferenciadas unicamente por la estrategia de normalizacion. La comparativa se limita a los modelos listados en la model card, ya que no hay informacion sobre otros modelos comparables en el mismo rango de tamano.

| Modelo | Normalizacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| TinyTransformer Baseline 10M | Sin normalizacion | 9.623.552 | no disponible | openmdw-1.1 |
| TinyTransformer Pre-LayerNorm 10M | LayerNorm pre-subcapa | 9.623.552 | no disponible | openmdw-1.1 |
| TinyTransformer Post-LayerNorm 10M | LayerNorm post-subcapa | 9.623.552 | no disponible | openmdw-1.1 |
| TinyTransformer Pre-RMSNorm 10M | RMSNorm pre-subcapa | 9.623.552 | no disponible | openmdw-1.1 |
| TinyTransformer Post-RMSNorm 10M | RMSNorm post-subcapa | 9.623.552 | no disponible | openmdw-1.1 |

No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Vocabulario restringido: entrenado solo con historias infantiles, lo que limita su utilidad para dominios tecnicos o conversacionales generales.
- Posibles sesgos: el dataset TinyStories puede contener sesgos de genero, culturales o tematicos heredados de los modelos que lo generaron (GPT-3.5/4), aunque no se documenta ningun analisis al respecto.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido inventado o incoherente, especialmente fuera del dominio de entrenamiento.
- Sin soporte multilingue: solo procesa ingles; no se menciona capacidad para otros idiomas.
- Licencia openmdw-1.1: permite uso comercial, pero es recomendable revisar los terminos completos en openmdw.ai antes de utilizarlo en productos finales.
- No apto para produccion: su tamano y limitaciones hacen que no sea adecuado para aplicaciones reales que requieran respuestas precisas o manejo de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aplominski/TinyTransformer-Post-RMSNorm-10M-TinyStories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Articulo "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Articulo "Layer Normalization": https://arxiv.org/abs/1607.06450
- Articulo "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Otros modelos de la serie:
  - Baseline: https://huggingface.co/aplominski/TinyTransformer-Baseline-10M-TinyStories
  - Pre-LayerNorm: https://huggingface.co/aplominski/TinyTransformer-Pre-LayerNorm-10M-TinyStories
  - Post-LayerNorm: https://huggingface.co/aplominski/TinyTransformer-Post-LayerNorm-10M-TinyStories
  - Pre-RMSNorm: https://huggingface.co/aplominski/TinyTransformer-Pre-RMSNorm-10M-TinyStories
