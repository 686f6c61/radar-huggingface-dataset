# Hooshaai/svd-linear-attention-distilbert-aegis-v5

## Resumen

El modelo `Hooshaai/svd-linear-attention-distilbert-aegis-v5` es un experimento de compresión y eficiencia aplicado a DistilBERT, desarrollado por Hoosha AI. Su objetivo es reducir el coste computacional de la atención mediante el módulo AEGIS-Attention V5, que combina cabezas locales con ventana deslizante y cabezas globales con mapas de características ELU+1, junto con proyecciones de bajo rango basadas en SVD. El modelo se presenta como un clasificador de texto (pipeline `text-classification`) y ha sido evaluado en la tarea SST-2 del conjunto GLUE.

La relevancia de este modelo radica en su propuesta de atención híbrida eficiente, que puede servir como referencia para investigaciones sobre compresión de transformers y reducción del coste de memoria. Sin embargo, los resultados de rendimiento reportados son modestos (62,84% de accuracy en SST-2), lo que indica que se trata de un prototipo de investigación más que de un modelo listo para producción. El repositorio incluye los pesos tras el proceso de compresión y recuperación (recovery fine-tuning), con una ratio de compresión de 1,1968 y un pico de VRAM de 288,41 MB durante la evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT con módulo AEGIS-Attention V5 (atención híbrida: 8 cabezas locales con ventana deslizante y 4 cabezas globales con kernel ELU+1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (se indica PyTorch en los metadatos) |

## Arquitectura y entrenamiento

La arquitectura se basa en DistilBERT, un transformer de tipo encoder, sobre el que se sustituye la atención estándar por el módulo AEGIS-Attention V5. Este módulo descompone la atención en dos ramas: una local con 8 cabezas que aplican una ventana deslizante (tamaño de ventana 64) y activaciones Softpick, y otra global con 4 cabezas que utilizan mapas de características de kernel lineal basados en ELU+1, garantizando positividad estricta en el normalizador. Además, se incorporan proyecciones factorizadas de bajo rango mediante SVD con un umbral de energía de 0,95, y una puerta adaptativa que fusiona las salidas de ambas ramas.

El proceso de entrenamiento incluye una fase de compresión y un posterior ajuste fino de recuperación (recovery fine-tuning) con 50 pasos. El modelo fue evaluado en el dataset GLUE, concretamente en la tarea SST-2, obteniendo una accuracy de validación de 62,84% y un F1 de 0,7286. No se especifica el número de tokens de entrenamiento ni la composición del dataset más allá de GLUE. Tampoco se menciona el uso de RLHF o DPO, al tratarse de un modelo de clasificación y no generativo.

## Capacidades

- Clasificación de texto en inglés, con soporte para tareas de clasificación binaria y multiclase propias de GLUE.
- Atención eficiente con bajo consumo de VRAM: el pico de memoria registrado durante la evaluación fue de 288,41 MB.
- Compresión de parámetros mediante proyecciones SVD de bajo rango, lo que reduce la huella de memoria del modelo.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, ya que es un modelo encoder de clasificación.
- Capacidades multilingües limitadas al inglés; no se han reportado pruebas en otros idiomas.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar opiniones en positivas o negativas, siendo adecuado para entornos con restricciones de memoria gracias a su bajo pico de VRAM.
- Detección de spam en correos o comentarios: al ser un clasificador binario, puede integrarse en pipelines de filtrado con un coste computacional reducido.
- Moderación de contenido en foros o redes sociales: permite etiquetar mensajes como apropiados o inapropiados, aunque su rendimiento limitado debe validarse previamente.
- Clasificación de tickets de soporte: puede asignar categorías a incidencias de atención al cliente, siempre que se disponga de un conjunto de datos etiquetado en inglés.
- Etiquetado automático de documentos: útil para organizar artículos o informes en categorías predefinidas, aprovechando la eficiencia del módulo de atención.
- Experimentación académica: sirve como banco de pruebas para estudiar arquitecturas de atención híbrida y técnicas de compresión en modelos encoder.

## Benchmarks y rendimiento

| Metrica | Valor medido |
|---|---|
| Accuracy de validacion (SST-2) | 62,84% |
| F1 Score (SST-2) | 0,7286 |
| Ratio de compresion | 1,1968 |
| Pico de VRAM en evaluacion | 288,41 MB |
| Tiempo de evaluacion pura | 30,61 s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El rendimiento en SST-2 es bajo en comparacion con un DistilBERT sin comprimir, que habitualmente supera el 90% de accuracy en esta tarea, aunque no se proporciona el dato exacto del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de VRAM reportado durante la evaluacion es de 288,41 MB, por lo que el modelo puede ejecutarse en GPUs con menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 512 MB de VRAM, como NVIDIA GTX 1050, Tesla T4 o inferiores. Tambien puede ejecutarse en CPU para tareas de baja latencia.
- Compatibilidad con GPU de consumo: si, es viable en tarjetas como RTX 2060, GTX 1660 o incluso integradas.
- Opciones de despliegue: al ser un modelo PyTorch, puede cargarse con la libreria `transformers` de HuggingFace. No es compatible con vLLM, llama.cpp ni Ollama al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles. El unico dato temporal es el tiempo de evaluacion pura de 30,61 s, que depende del hardware utilizado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Rendimiento SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DistilBERT (base) | Transformer encoder | 512 tokens | ~91% (referencia general, no confirmada en el repo) | Apache 2.0 | HuggingFace |
| TinyBERT | Transformer encoder comprimido | 512 tokens | ~85-90% (referencia general) | Apache 2.0 | HuggingFace |
| Hooshaai/svd-linear-attention-distilbert-aegis-v5 | DistilBERT con AEGIS-Attention V5 | no disponible | 62,84% | MIT | HuggingFace |

Los datos de rendimiento de DistilBERT y TinyBERT son referencias generales no confirmadas en la informacion proporcionada. Se recomienda consultar sus respectivas fichas para obtener valores exactos.

## Limitaciones y advertencias

- Rendimiento bajo en SST-2 (62,84% de accuracy), lo que limita su uso en tareas que requieran alta precision.
- Modelo experimental: la arquitectura AEGIS-Attention V5 es novedosa y puede presentar inestabilidades no documentadas en entornos de produccion.
- Solo soporta el idioma ingles; no se han evaluado capacidades multilingues.
- No es un modelo generativo, por lo que no puede utilizarse para tareas de texto libre, tool calling o agentes.
- Los sesgos inherentes al dataset GLUE pueden trasladarse al modelo, especialmente en tareas de analisis de sentimiento.
- La licencia MIT permite uso comercial, pero al ser un modelo experimental se recomienda validar exhaustivamente su comportamiento antes de desplegarlo.
- No se dispone de informacion sobre la longitud de contexto, los parametros totales ni el formato de pesos, lo que dificulta su integracion en algunos frameworks.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshai/svd-linear-attention-distilbert-aegis-v5
- Blog tecnico de Hoosha AI: https://hooshaai.substack.com/p/re-engineering-the-attention-engine
- Dataset de resultados: https://huggingface.co/datasets/tahamajs/svd-linear-attention-sst2-results
