# diegoquinteiro/Pythia-160M-Observable

## Resumen

Pythia-160M Observable es una exportación a ONNX del modelo base [EleutherAI/pythia-160m-deduped](https://huggingface.co/EleutherAI/pythia-160m-deduped), preparada por Diego Quinteiro para su uso en un laboratorio interactivo dentro del curso de Ingeniería Asistida por IA. A diferencia del modelo original, esta versión no está pensada para generar texto en producción, sino para inspeccionar el funcionamiento interno del transformer: expone los estados residuales de las 12 capas, las matrices de atención completas y las actualizaciones de atención de un token de consulta seleccionado. Incluye además un segundo artefacto con una lente afinada (tuned lens) que decodifica estados intermedios en logits de vocabulario.

El modelo es relevante en el contexto de la investigación de interpretabilidad y la docencia, ya que permite observar directamente qué está calculando el modelo en cada capa, sin necesidad de instrumentar el código original. La exportación está cuantizada (Q4 en las matrices del transformer e int8 en embeddings y traductores) para facilitar su ejecución en el navegador mediante transformers.js. No es un modelo de generación de texto generalista: Pythia-160M es un modelo base de 160 millones de parámetros, sin ajuste instructivo, y este exportado está orientado a la inspección, no a la inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (GPT-NeoX, 12 capas, 12 cabezas, dimensión 768) |
| Parametros totales | 160 millones (modelo base), export ONNX cuantizado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la exportación (el modelo base soporta 2048 tokens) |
| Tipos de cuantizacion | Q4 weight-only en matrices del transformer; int8 row-wise en embeddings, traductores y unembedding |
| Idiomas soportados | No disponible (el modelo base se entrenó con The Pile, mayoritariamente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (dos artefactos: `model_observable_q4.onnx` y `model_tuned_lens_q8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar de la familia GPT-NeoX, con 12 capas y 12 cabezas de atención, tal como se describe en la suite Pythia de EleutherAI. El modelo base se entrenó sobre el dataset The Pile, en su versión deduplicada globalmente, con un total de 300 mil millones de tokens. No se aplicó RLHF ni DPO; es un modelo base sin ajuste instructivo.

La exportación ONNX incorpora dos innovaciones técnicas relevantes para la interpretabilidad. El primer artefacto (`model_observable_q4.onnx`) añade salidas intermedias: los 13 estados residuales (desde la entrada hasta la última capa), las matrices de atención completas de cada capa y la actualización de atención del token de consulta seleccionado mediante el input `query_index`. El segundo artefacto (`model_tuned_lens_q8.onnx`) aplica los traductores de la lente afinada de [AlignmentResearch/tuned-lens](https://huggingface.co/spaces/AlignmentResearch/tuned-lens) para decodificar cualquier estado residual intermedio en logits de vocabulario, utilizando el unembedding del modelo para la capa 12.

La cuantización se aplicó solo a los pesos: Q4 para las matrices de multiplicación del transformer, int8 por filas para las matrices de embedding de entrada y salida, y para los traductores de la tuned lens y el unembedding. Las activaciones y las salidas públicas se mantienen en float32. El manifiesto de exportación incluye comprobaciones numéricas contra el modelo PyTorch original y la tuned lens, pero la cuantización puede alterar el ranking de tokens cercanos, por lo que el artefacto no es adecuado para evaluación ni para inferencia de producción.

## Capacidades

- Generación de texto básica: como modelo base, puede predecir el siguiente token, pero no sigue instrucciones ni mantiene diálogos.
- Inspección de atención: devuelve las matrices de atención completas (`attention_01` a `attention_12`) con forma `[batch, heads, query sequence, key sequence]`, lo que permite visualizar patrones de atención por capa y por cabeza.
- Acceso a estados residuales: expone los 13 estados intermedios (`hidden_state_00` a `hidden_state_12`), útiles para análisis de dinámicas de representación.
- Actualización de atención específica: mediante el input `query_index`, se puede obtener la actualización de atención de un token concreto, facilitando el estudio de cómo se propaga la información.
- Decodificación con lente afinada: el artefacto `model_tuned_lens_q8.onnx` permite decodificar cualquier estado intermedio en logits de vocabulario, lo que da una visión de qué token representa cada capa.
- Ejecución en navegador: al estar en formato ONNX cuantizado, es compatible con transformers.js, permitiendo su uso en entornos educativos sin infraestructura GPU.

## Casos de uso

- Laboratorio de interpretabilidad en cursos de IA: el modelo está diseñado para que los estudiantes ejecuten un laboratorio interactivo en el navegador, inspeccionando las matrices de atención y los estados residuales de un transformer real.
- Análisis de atención en modelos base: investigadores pueden usar los outputs de atención para estudiar patrones de dependencia sintáctica o semántica en un modelo de 160M, sin necesidad de instrumentar el código de PyTorch.
- Verificación de la lente afinada: el artefacto tuned lens permite comparar las predicciones de capas intermedias con las del modelo final, ilustrando la progresión de la información a través de la red.
- Docencia de arquitecturas transformer: los estados residuales y las actualizaciones de atención son útiles para explicar conceptos como skip connections, residual stream y atención multi-cabeza.
- Depuración de modelos base: si se está investigando cómo un modelo pequeño procesa un input concreto, este export permite aislar la contribución de cada capa.
- Experimentos de cuantización: aunque no está destinado a producción, los artefactos cuantizados permiten comparar cómo la cuantización afecta a las salidas intermedias y a las predicciones en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.), y el autor indica explícitamente que la cuantización puede alterar el ranking de tokens cercanos, por lo que no se recomienda para evaluación. Dado que se trata de un artefacto de interpretación y docencia, no se aportan datos de rendimiento comparativo.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 160M de parámetros, y con cuantización Q4, el peso del modelo es de aproximadamente 0.4 GB. La inferencia en CPU es viable; en GPU, la VRAM necesaria es inferior a 1 GB.
- GPU recomendadas: no se requiere GPU específica. Puede ejecutarse en cualquier GPU de consumo (RTX 3060 o superior) o incluso en CPU, gracias al pequeño tamaño.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas modernas.
- Opciones de despliegue: al ser ONNX, se puede ejecutar con ONNX Runtime, transformers.js en navegador, o mediante servidores de inferencia que soporten ONNX (por ejemplo, TGI con backend ONNX, aunque no es lo habitual).
- Latencia y throughput: no se proporcionan datos concretos. Dado el tamaño, la generación de un token en CPU es del orden de milisegundos, y en GPU sería aún menor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pythia-160M-Observable (este) | 160M | No disponible | Apache-2.0 | ONNX | Export interpretable con salidas intermedias |
| EleutherAI/pythia-160m-deduped | 160M | 2048 | Apache-2.0 | PyTorch | Modelo base original, sin salidas de atención |
| EleutherAI/pythia-160m-v0 | 160M | 2048 | Apache-2.0 | PyTorch | Versión corregida del modelo original |

La comparativa se limita a la variante del mismo tamaño dentro de la suite Pythia. No hay otros modelos de interpretabilidad comparables en el repositorio, y las diferencias se centran en el formato de exportación (ONNX vs PyTorch) y en la instrumentación de salidas intermedias.

## Limitaciones y advertencias

- No es un modelo instructivo: Pythia-160M es un modelo base, no sigue instrucciones ni produce respuestas coherentes a prompts conversacionales.
- Riesgo de alucinación: como modelo base pequeño, puede generar texto incoherente o repetitivo; no es adecuado para generación de contenido fiable.
- Cuantización: la cuantización Q4 e int8 puede alterar el ranking de tokens cercanos en la distribución de probabilidad, por lo que los resultados no son idénticos al modelo en float32.
- Limitaciones de interpretación: las matrices de atención describen valores calculados internamente, pero no demuestran causalidad entre tokens. No se debe concluir que un token "causa" la predicción a partir de la atención.
- Tuned lens: las predicciones intermedias son lecturas diagnósticas de una lente afinada, no texto generado por el modelo detenido en una capa temprana. No representan generación real.
- Idiomas: el modelo base se entrenó con The Pile, mayoritariamente en inglés, por lo que no se recomienda su uso en otros idiomas.
- Uso restringido: la model card indica que el artefacto está destinado a enseñanza e inspección, no a evaluación ni producción. No debe usarse como modelo de generación en servicios reales.

## Enlaces

- Modelo en HuggingFace: [diegoquinteiro/Pythia-160M-Observable](https://huggingface.co/diegoquinteiro/Pythia-160M-Observable)
- Modelo base: [EleutherAI/pythia-160m-deduped](https://huggingface.co/EleutherAI/pythia-160m-deduped)
- Suite Pythia de EleutherAI: [EleutherAI/pythia-160m](https://huggingface.co/EleutherAI/pythia-160m)
- Repositorio de Pythia en GitHub: [EleutherAI/pythia](https://github.com/EleutherAI/pythia)
- Artefacto tuned-lens de AlignmentResearch: [AlignmentResearch/tuned-lens](https://huggingface.co/spaces/AlignmentResearch/tuned-lens)
- Paper de Pythia (referencia en la página del modelo): no se proporciona enlace directo, pero se menciona en la documentación de HuggingFace.
