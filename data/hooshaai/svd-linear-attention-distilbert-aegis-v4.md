# Hooshaai/svd-linear-attention-distilbert-aegis-v4

## Resumen

El modelo `Hooshaai/svd-linear-attention-distilbert-aegis-v4` es una variante comprimida de DistilBERT que sustituye la atención por softmax estándar por el módulo AEGIS-Attention V4, desarrollado por el laboratorio independiente Hoosha AI. Este módulo combina proyecciones factorizadas mediante descomposición en valores singulares (SVD), atención local con ventana deslizante y atención global basada en kernels de características aleatorias de Fourier (RFF), con el objetivo de reducir la complejidad computacional de la atención de cuadrática a subcuadrática. El modelo está diseñado para clasificación de texto y se ha evaluado en la tarea SST-2 del benchmark GLUE.

El modelo se presenta como un experimento de compresión y recuperación de rendimiento: tras aplicar la técnica AEGIS V4 sobre DistilBERT, se realizó un ajuste fino de recuperación con 50 pasos. El resultado es un modelo ligero que ocupa aproximadamente 288 MB de VRAM durante la inferencia, pero con una precisión de validación del 62,84 % en SST-2, notablemente inferior a la de un DistilBERT estándar. No se dispone de información sobre el número total de parámetros ni sobre la longitud de contexto real del modelo, aunque la arquitectura teórica menciona secuencias de hasta 1024 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT con atención AEGIS-Attention V4 (SVD linear attention) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible |
| Metodo de compresion | AEGIS-Attention V4 (SVD, local window, RFF kernel) |
| Dataset de evaluacion | GLUE (SST-2) |

## Arquitectura y entrenamiento

La arquitectura de AEGIS-Attention V4, descrita en la model card, sustituye la atención multicabezas convencional por un diseño híbrido. En primer lugar, las proyecciones de consultas, claves y valores se factorizan mediante una proyección lineal de bajo rango, donde el rango `r` se selecciona dinámicamente en el intervalo `[4, 64]` para preservar al menos el 95 % de la energía de los valores singulares. A continuación, la atención se divide en dos rutas: una ruta local con 8 cabezas que aplican una ventana deslizante de tamaño `W = 64` con activación Softpick, y una ruta global con 4 cabezas que emplea un kernel lineal RFF de 256 dimensiones con centrado de claves en cero. Finalmente, un mecanismo de compuerta adaptativo por cabeza, basado en una función sigmoide con sesgo de 1,5, mezcla las salidas locales y globales, dando un peso inicial del 82 % a la atención local.

El proceso de entrenamiento se describe como un ajuste fino de recuperación tras la compresión, con `recovery_steps = 50`. No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre el número de tokens utilizados. El modelo se evaluó en la tarea SST-2 de GLUE, que es un conjunto de clasificación de sentimiento en inglés. No se menciona ningún proceso de alineación como RLHF o DPO. La innovación técnica principal es la combinación de factorización SVD con atención local-global y un mecanismo de compuerta adaptativo, que busca reducir el coste computacional manteniendo una estabilidad numérica garantizada según la prueba de Lyapunov incluida en la documentación.

## Capacidades

- Clasificación de texto en inglés: el modelo está diseñado para la tarea de clasificación de secuencias, como se refleja en su pipeline `text-classification` y su evaluación en SST-2.
- Eficiencia computacional: la atención subcuadrática mediante kernel RFF y ventana local reduce el coste de cálculo en comparación con la atención softmax completa.
- Compresión de modelos: la factorización SVD con selección de rango adaptativa permite reducir el número de parámetros de las proyecciones de atención.
- Estabilidad numérica: la documentación incluye demostraciones formales de acotación de las salidas para secuencias largas, lo que sugiere un diseño robusto frente a desbordamientos.
- No se han documentado capacidades de tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Investigación en atención eficiente: el modelo sirve como banco de pruebas para comparar arquitecturas de atención subcuadrática frente a la atención softmax tradicional en tareas de clasificación de texto.
- Experimentación con compresión de modelos: permite analizar el impacto de la factorización SVD y el ajuste fino de recuperación en el rendimiento de un modelo preentrenado como DistilBERT.
- Clasificación de sentimiento en entornos con recursos limitados: gracias a su bajo pico de VRAM (288 MB), puede ejecutarse en GPU de gama baja o incluso en CPU para tareas de análisis de opinión en inglés.
- Prototipado rápido de pipelines de NLP: al ser un modelo ligero, facilita la integración en pipelines de clasificación donde la latencia es crítica, aunque con la precisión reducida que se observa en los benchmarks.
- Evaluación de técnicas de kernelización: el uso de RFF de 256 dimensiones ofrece un caso de estudio para comparar aproximaciones lineales de atención en modelos de tamaño medio.
- Docencia y divulgación: la documentación detallada con fórmulas y pruebas de estabilidad lo convierte en un recurso educativo para explicar conceptos de atención eficiente y factorización de matrices.

## Benchmarks y rendimiento

Según la información proporcionada en la model card, los resultados de evaluación en SST-2 son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy de validacion | 62,84 % |
| F1 Score | 0,7286 |
| Ratio de compresion | 1,1968 |
| Pico de VRAM en GPU | 288,41 MB |
| Tiempo de evaluacion puro | 31,43 s |
| Pasos de recuperacion | 50 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La precisión del 62,84 % en SST-2 es baja para una tarea de clasificación de sentimiento, lo que indica que la compresión ha degradado significativamente el rendimiento con respecto a un DistilBERT estándar, aunque no se dispone de una comparación directa.

## Requisitos de hardware

- VRAM estimada: el pico de VRAM medido durante la evaluación es de 288,41 MB, lo que indica que el modelo puede ejecutarse en GPU con menos de 512 MB de memoria.
- GPU recomendadas: cualquier GPU con al menos 0,5 GB de VRAM, como una NVIDIA GTX 1050, RTX 3050 o superior. También es viable la ejecución en CPU para tareas de baja latencia.
- Compatibilidad con GPU de consumo: sí, el modelo cabe holgadamente en la mayoría de GPU de consumo actuales e incluso en algunas de gama baja.
- Opciones de despliegue: al ser un modelo de clasificación de texto basado en PyTorch, puede cargarse con la librería `transformers` de HuggingFace mediante `AutoModelForSequenceClassification`. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, y estas no son relevantes para un modelo no generativo.
- Latencia y throughput: solo se dispone del tiempo de evaluación puro de 31,43 s, pero sin información sobre el número de muestras o el tamaño del lote, por lo que no es posible estimar la latencia por muestra ni el throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo es una variante comprimida de DistilBERT, pero no se ofrecen benchmarks de DistilBERT original ni de otras arquitecturas de atención eficiente en el mismo contexto. Por tanto, no es posible realizar una comparación cuantitativa.

## Limitaciones y advertencias

- Precisión baja: la accuracy de validación del 62,84 % en SST-2 es significativamente inferior a la esperada para un modelo de clasificación de sentimiento, lo que limita su utilidad en aplicaciones reales.
- Riesgo de errores de clasificación: al ser un modelo de clasificación, el riesgo de alucinación generativa es bajo, pero la probabilidad de clasificaciones incorrectas es alta debido al bajo rendimiento.
- Solo inglés: el modelo está entrenado y evaluado exclusivamente en inglés, por lo que no es adecuado para textos en otros idiomas.
- Falta de información sobre el entrenamiento: no se detallan los datos de preentrenamiento, el número de tokens ni el proceso de ajuste fino, lo que dificulta la reproducibilidad y la evaluación de su generalización.
- Posible ausencia de pesos: el tamaño del repositorio es de 0,0 GB, lo que sugiere que los pesos del modelo podrían no estar subidos o estar disponibles en un formato no estándar. Se recomienda verificar el contenido del repositorio antes de intentar cargar el modelo.
- Sin soporte para tareas avanzadas: no ofrece tool calling, soporte de agentes, visión, audio ni generación de texto, por lo que su campo de aplicación se limita a la clasificación de texto.
- Licencia MIT: permite uso comercial, pero la baja precisión y la falta de documentación completa hacen que no sea aconsejable para producción sin una evaluación adicional.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-aegis-v4
- Sitio web de Hoosha AI: https://hooshaai.github.io/
- Repositorio de GitHub de Hoosha AI: https://github.com/Hooshaai/hooshaai.github.io
