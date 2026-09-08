# Hooshaai/svd-linear-attention-roberta-bam-umoe

## Resumen

El modelo `Hooshaai/svd-linear-attention-roberta-bam-umoe` es un checkpoint de clasificación de texto basado en RoBERTa, comprimido mediante el módulo BAM-uMoE (Bidirectional Attentive Mixture-of-Unified-Experts) y ajustado posteriormente para recuperar rendimiento. Lo desarrolla Hooshaai, autor de la organización HOOSHA AI, y se presenta como una arquitectura experimental orientada a la eficiencia: combina atención densa bidireccional con Mixture-of-Experts en dos ramas (una de refinamiento de valores QKV y otra en la red feed-forward), además de incorporar atención lineal comprimida por SVD. El pipeline es `text-classification` y el modelo ha sido evaluado en la tarea SST-2 del benchmark GLUE.

La relevancia del modelo reside en su objetivo de reducir el coste de inferencia y el consumo de memoria manteniendo una exactitud razonable. Según los datos publicados, alcanza una validación del 84,63 % y un F1 de 0,863, con un ratio de compresión de 0,3522 y un pico de VRAM de 849,7 MB durante la evaluación. No se especifican el número de parámetros totales, la longitud de contexto, ni los formatos de cuantización en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa con BAM-uMoE (Bidirectional Attentive Mixture-of-Unified-Experts) y atención lineal comprimida mediante SVD |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la arquitectura incluye MoE, pero no se publica el desglose) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | Pytorch (no se indica si es safetensors) |

## Arquitectura y entrenamiento

La arquitectura parte de un modelo RoBERTa para clasificación de texto y le añade dos módulos de Mixture-of-Experts (MoE). El primero, denominado `uMoE_QKV`, modula el tensor de valores V antes del cálculo de atención por producto escalar: la salida base de V se suma a un residuo escalado por un factor gamma de 0,1, de forma que se enriquece la representación sin desviar la distribución inicial del modelo preentrenado. El segundo, `uMoE_FFN`, sustituye la capa MLP densa convencional por una mezcla de expertos con routing top-k. Las proyecciones Q y K, en cambio, se mantienen como proyecciones densas heredadas del modelo preentrenado.

La compresión se apoya en un bottleneck de bajo rango (r mucho menor que D) y en factorización de proyecciones, lo que reduce el número de parámetros. Según la descripción del autor, el flujo de datos incluye una proyección de reducción de dimensionalidad, una expansión por cabezas de atención y un barrido asociativo kernelizado, lo que coincide con la etiqueta `svd-linear-attention` del repositorio. La atención es bidireccional y aplica enmascaramiento de tokens de padding.

El entrenamiento descrito en la model card indica que los pesos fueron comprimidos y posteriormente sometidos a un recovery fine-tuning durante 50 pasos (`recovery_steps=50`). El modelo se evalúa en el subconjunto SST-2 del dataset GLUE, que es una tarea de clasificación de sentimiento binario en inglés. No se menciona uso de RLHF ni de DPO.

## Capacidades

- Clasificación de texto en inglés, con validación reportada en SST-2 para análisis de sentimiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni para razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés, sin evidencia de soporte para otros idiomas.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- La capacidad técnica más destacable es la eficiencia de compresión, con un ratio de 0,3522 y un pico de VRAM de 849,7 MB durante la evaluación, lo que permite su uso en entornos con recursos de memoria moderados.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar reseñas en positivas o negativas. Su bajo pico de VRAM lo hace adecuado para servicios de evaluación masiva en GPUs de consumo, incluso en despliegues con presupuesto limitado.

- Triaje de tickets de soporte: en un sistema de atención al cliente, el modelo puede clasificar automáticamente tickets como positivos o negativos, permitiendo priorizar los casos urgentes. La arquitectura comprimida reduce el coste de ejecución en pipelines de clasificación de alto volumen.

- Filtrado de correo no deseado: la tarea binaria de sentimiento puede adaptarse a la detección de correos no deseados o de contenido no deseado. La eficiencia de memoria facilita su integración en servidores de correo con recursos limitados.

- Moderación de comentarios en foros: permite etiquetar comentarios tóxicos o de sentimiento negativo antes de su publicación. Al ser un modelo ligero, puede ejecutarse en tiempo real en infraestructuras sin GPUs dedicadas.

- Monitoreo de redes sociales: el modelo puede procesar tweets o publicaciones sobre una marca y detectar sentimiento negativo. El bajo consumo de VRAM permite desplegarlo en procesos de scraping y análisis en streaming.

- Encuestas de satisfacción al cliente: las respuestas abiertas pueden clasificarse como positivas o negativas para automatizar el análisis de feedback. La compresión del modelo reduce el espacio de almacenamiento y la velocidad de inferencia en comparación con un RoBERTa denso sin compresión.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Validation Accuracy | 84,63 % |
| F1 Score | 0,863 |
| Compression Ratio | 0,3522 |
| Peak GPU VRAM | 849,7 MB |
| Pure Eval Time | 45,47 s |

No se han publicado resultados de benchmarks comparativos con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pico medido durante la evaluación es de 849,7 MB. Para inferencia, la VRAM requerida será igual o inferior.
- GPU recomendadas: no hay recomendación oficial del autor. Con un pico de menos de 1 GB, el modelo es compatible con GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, siempre que exista una implementación compatible de la arquitectura.
- El modelo puede ejecutarse también en CPUs, aunque no se han publicado datos de rendimiento en ese escenario.
- Opciones de despliegue: se distribuye como pesos PyTorch y está etiquetado con pipeline `text-classification`. Sin embargo, al tratarse de una arquitectura personalizada con módulos BAM-uMoE, es probable que requiera código adicional del autor para cargar el modelo correctamente. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se indica un tiempo total de evaluación de 45,47 s, sin especificar el tamaño del conjunto de evaluación ni la latencia por muestra.

## Comparativa con modelos similares

No se han proporcionado resultados comparativos en la información disponible. La ausencia de datos sobre parámetros totales y benchmarks relativos impide una comparación con alternativas como RoBERTa-base u otros modelos de clasificación de sentimiento. Se recomienda consultar el repositorio del autor para obtener datos de comparación adicionales.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgo. Al estar entrenado en SST-2, el modelo puede heredar los sesgos del dataset, que refleja un dominio concreto de reseñas en inglés.
- Riesgo de alucinación: al ser un modelo de clasificación, la salida esperada es una etiqueta, lo que reduce el riesgo de alucinación. No obstante, si se utiliza fuera de su tarea prevista, la fiabilidad no está garantizada.
- Limitaciones de contexto: la longitud de contexto no se especifica. Al basarse en RoBERTa, es posible que se herede la ventana de 512 tokens, aunque no se confirma en la información disponible.
- Licencia MIT: permite uso comercial, modificación y distribución, sin restricciones adicionales.
- Caveat de producción: el tamaño del repositorio se muestra como 0.0 GB, lo que puede indicar que los pesos no están incluidos o que la página no informa correctamente del tamaño. Es necesario verificar la disponibilidad real de los archivos de peso antes de usar el modelo en producción.
- El modelo es experimental: el método de compresión BAM-uMoE está orientado a investigación y no se han publicado estudios de robustez, fiabilidad ni rendimiento en entornos industriales.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-roberta-bam-umoe
- GitHub del autor: https://github.com/Hooshaai
- Sitio del laboratorio HOOSHA AI: https://hooshaai.github.io/
- Paper de referencia citado en los tags del modelo: https://arxiv.org/abs/1701.06538
