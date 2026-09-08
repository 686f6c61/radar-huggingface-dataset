# Hooshaai/svd-linear-attention-roberta-come

## Resumen

El modelo **Hooshaai/svd-linear-attention-roberta-come** es una versión comprimida de **RoBERTa** sobre la que se ha aplicado el método **CoMe** (Context-Aware Low-Rank Memory Bridge), desarrollado por **Hooshaai**. Está fine-tuneado para **clasificación de texto** en el dataset **GLUE (SST-2)**, una tarea de análisis de sentimiento binario en inglés. El objetivo principal es reducir el consumo de memoria de los transformadores durante el procesamiento de contextos largos, mediante un puente de memoria de bajo rango que comprime las proyecciones de clave-valor y las representaciones de las capas feed-forward.

El modelo se presenta como un experimento de investigación en eficiencia y compresión de modelos. La arquitectura base es un transformer (RoBERTa) con modificaciones estructurales: eliminación de capas (layer shedding) y puentes de interpolación lineal aprendibles entre capas no consecutivas. Los datos disponibles indican un ratio de compresión de **1.2676**, un pico de VRAM de **276.45 MB** y una precisión de validación del **78.33%** en SST-2. La licencia es **MIT**, y el modelo está etiquetado para clasificación de texto en inglés. No se han publicado detalles sobre el número total de parámetros ni la longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (RoBERTa) con compresión CoMe (layer shedding + puentes lineales de bajo rango) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura se basa en **RoBERTa**, un transformer encoder preentrenado, sobre el que se aplica el método **CoMe**. Según la model card, CoMe comprime la memoria de los transformadores desplegando un puente de memoria de bajo rango entre las representaciones persistentes de clave-valor y los espacios de proyección intermedios. La formulación matemática propone una descomposición de las proyecciones mediante un puente de la forma `M_compressed = X W_bridge`, donde `W_bridge = U_r Σ_r V_r^T`, con un error residual acotado por `‖X W - X W_bridge‖ ≤ ε ‖X‖`.

Además, el código incluido describe una variante de CoMe basada en **layer shedding** (eliminación de capas) con selección uniforme de capas a conservar y puentes de interpolación lineal aprendibles entre capas no consecutivas. El módulo `CoMeBridge` implementa una capa lineal inicializada como identidad y un coeficiente `alpha` aprendible que controla la mezcla. El modelo fue comprimido y posteriormente fine-tuneado para recuperar el rendimiento (recovery-fine-tuned) con `recovery_steps=50`. El dataset de entrenamiento es **GLUE (SST-2)**. No se han proporcionado datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de técnicas como RLHF o DPO.

## Capacidades

- Clasificación de texto en inglés, con fine-tuning específico en la tarea SST-2 (análisis de sentimiento binario).
- Reducción del consumo de memoria en inferencia: el pico de VRAM medido es de 276.45 MB, con un ratio de compresión de 1.2676.
- Soporte de pipeline de HuggingFace para `text-classification` (clasificador de texto).
- No se han documentado capacidades de tool calling, generación de código, razonamiento multi-step, visión o audio.
- Al ser un modelo de clasificación, no genera texto libre ni soporta modos de pensamiento (thinking mode) documentados.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar una reseña como positiva o negativa, útil para monitorizar opiniones en plataformas de e-commerce.
- Clasificación de correos electrónicos: puede categorizar mensajes en spam/no spam o en clases temáticas predefinidas, aprovechando su pipeline de clasificación de texto.
- Moderación de contenido en foros: permite detectar comentarios tóxicos o inapropiados en entornos moderados, con un bajo coste de VRAM.
- Análisis de respuestas abiertas en encuestas: clasifica respuestas cortas en categorías (positiva, negativa, neutra) para automatizar el análisis de feedback.
- Clasificación de tickets de soporte: categoriza tickets de atención al cliente por tema o urgencia, integrándose en sistemas de ticketing.
- Investigación en compresión de modelos: sirve como referencia para estudiar el método CoMe y comparar el trade-off entre compresión y precisión en tareas de clasificación.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados en la model card, medidos sobre el dataset GLUE (SST-2):

| Metrica | Valor |
|---|---|
| Validation Accuracy | 78.33% |
| F1 Score | 0.8177 |
| Compression Ratio | 1.2676 |
| Peak GPU VRAM | 276.45 MB |
| Pure Eval Time | 16.73 s |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 276.45 MB (pico medido según la model card).
- GPU recomendadas: no se especifican en la información disponible. Dado el bajo consumo de VRAM, cualquier GPU moderna con al menos 1 GB de VRAM sería suficiente.
- Cabe en GPU de consumo: sí, el pico de VRAM es inferior a 1 GB, por lo que es compatible con GPUs de gama baja.
- Opciones de despliegue: no se especifican herramientas concretas (vLLM, llama.cpp, Ollama, TGI). Al ser un modelo de HuggingFace con PyTorch, puede cargarse mediante la librería `transformers` con `pipeline("text-classification")`.
- Latencia y throughput: el tiempo de evaluación puro reportado es de 16.73 s, pero no se indica el tamaño del lote ni el hardware utilizado, por lo que no es posible estimar throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos similares en la información proporcionada. El modelo es una variante comprimida de RoBERTa, pero no se han publicado resultados de comparación con RoBERTa base ni con otros métodos de compresión.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al estar fine-tuneado en SST-2, el modelo puede heredar sesgos presentes en ese dataset.
- Riesgo de alucinación: bajo, al ser un modelo de clasificación y no generar texto libre. Sin embargo, puede producir clasificaciones incorrectas, especialmente fuera del dominio de SST-2.
- Limitaciones de contexto o idioma: solo soporta inglés; la longitud de contexto no está especificada.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, sin restricciones significativas.
- Caveat para producción: el modelo solo ha sido evaluado en SST-2, por lo que su rendimiento en otras tareas de clasificación puede ser limitado. El ratio de compresión es modesto (1.2676), lo que implica una reducción de memoria de aproximadamente el 21% respecto al modelo original. Además, el repositorio tiene un tamaño de 0.0 GB y 0 descargas, lo que sugiere que puede tratarse de un experimento de investigación con pesos no completamente publicados.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-roberta-come
- Blog del autor sobre atención lineal: https://hooshaai.substack.com/p/scaling-transformers-how-linear-attention
- Blog del autor sobre atención lineal en modelado bidireccional: https://hooshaai.substack.com/p/the-rise-of-linear-attention-in-bidirectional
