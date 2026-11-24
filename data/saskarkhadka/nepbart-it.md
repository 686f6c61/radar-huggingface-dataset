# saskarkhadka/nepBART-it

## Resumen

nepBART-it es un modelo de la familia BART publicado por el usuario saskarkhadka en Hugging Face. Por su nombre y por los tags del repositorio, se trata de un modelo derivado de BART orientado a tareas de procesamiento de lenguaje natural en nepalí, presumiblemente con algún tipo de ajuste instruccional o de fine-tuning específico (el sufijo "it" sugiere "instruction tuned" o "instruction tuning"). El repositorio contiene únicamente pesos en formato safetensors y una model card mínima que se limita a declarar la licencia MIT.

El modelo tiene 70.320.984 parámetros, lo que lo sitúa en la gama de modelos encoder-decoder compactos (del orden de 70 millones de parámetros), coherente con una variante reducida de BART. El tamaño del repositorio es de 0,8 GB. En el momento de la consulta no registra descargas ni "likes", y no se ha publicado información sobre pipeline, idiomas soportados, arquitectura detallada ni datos de entrenamiento.

Su relevancia es limitada pero concreta: cubre un nicho poco atendido como es el procesamiento de nepalí con un modelo pequeño, de licencia permisiva (MIT) y potencialmente desplegable en hardware modesto. No obstante, la ausencia de documentación técnica y de resultados de evaluación obliga a tratar cualquier uso en producción con cautela y a validar el comportamiento empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (encoder-decoder transformer; inferida del tag `bart`, sin detalle publicado) |
| Parametros totales | 70.320.984 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible (por el nombre del modelo, presumiblemente nepalí, sin confirmación oficial) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag del repositorio indica `bart`, por lo que la arquitectura subyacente es la de BART: un transformer encoder-decoder con atención bidireccional en el encoder y autorregresiva en el decoder, habitualmente preentrenado con un objetivo de denoising (corrupción de texto y reconstrucción). El recuento de 70.320.984 parámetros encaja con una configuración reducida de esta familia, aunque no se ha publicado la configuración exacta de capas, dimensiones ocultas ni cabezas de atención.

No hay información pública sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni sobre innovaciones técnicas adicionales. El sufijo "it" del nombre sugiere un ajuste instruccional, pero no se documenta en la model card. Tampoco se especifica si el modelo parte de un checkpoint BART multilingüe o de un modelo entrenado desde cero para nepalí.

## Capacidades

- Generación de texto condicionada a una entrada, propia de un modelo encoder-decoder (resumen, paráfrasis, respuesta a instrucciones), si bien no hay evaluación publicada que lo confirme.
- Potencial capacidad de resumen y reescritura de texto en nepalí, por la naturaleza de la arquitectura BART y el nombre del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el foco declarado implícitamente es el nepalí.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- No se documenta soporte de contexto largo ni de instrucciones complejas.

## Casos de uso

- Resumen de documentos en nepalí: un modelo BART de 70 M de parámetros puede emplearse para condensar noticias o informes; su tamaño reducido permite ejecución en CPU, aunque la calidad debe validarse empíricamente al no haber benchmarks.
- Normalización y reescritura de texto: útil en pipelines de preprocesamiento de corpus en nepalí (corrección de estilo, paráfrasis) antes de alimentar modelos mayores.
- Generación de respuestas en asistentes de dominio acotado: con fine-tuning adicional sobre un corpus específico (por ejemplo, atención al ciudadano), el modelo puede servir como base ligera y de bajo coste.
- Prototipado rápido de tareas seq2seq en nepalí: su licencia MIT y su tamaño permiten integrarlo en experimentos académicos sin restricciones comerciales.
- Traducción o transliteración asistida: como base para fine-tuning supervisado en pares de idiomas que incluyan nepalí, siempre que se disponga de datos paralelos.
- Despliegue en entornos con recursos limitados: al tener 70 M de parámetros, puede ejecutarse en CPU o en GPU de gama baja para tareas de generación de texto de baja latencia, previa validación de la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,28 GB solo para pesos (70,3 M × 4 bytes), más overhead de activaciones y del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,14 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente, aunque el modelo está claramente sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: Al ser un modelo BART en safetensors, es compatible con la librería `transformers` de Hugging Face; para CPU o GPU de gama baja puede convertirse a GGUF y usarse con llama.cpp u Ollama, aunque no se documenta soporte oficial. vLLM y TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles; por el tamaño, se espera una latencia baja en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nepBART-it | 70,3 M | no disponible | MIT | Hugging Face | Sin benchmarks ni documentación técnica |
| BART-base (facebook) | ~139 M | 1024 tokens (típico en BART) | MIT | Hugging Face | Referencia estándar de la familia; multilingüe limitado |
| mBART-50 (facebook) | ~611 M | 1024 tokens (típico) | MIT | Hugging Face | Multilingüe con soporte de nepalí; mucho mayor |
| IndicBART (AI4Bharat) | ~244 M | 1024 tokens (típico) | MIT | Hugging Face | Orientado a lenguas índicas; el nepalí no es lengua índica |

La comparación es aproximada: no se dispone de datos de rendimiento de nepBART-it que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican datos de entrenamiento, tokenizador, longitud de contexto ni idiomas oficialmente soportados.
- Riesgo elevado de alucinación y de generación incoherente fuera del dominio para el que fue ajustado, al no existir evaluación publicada.
- Posibles sesgos derivados del corpus de entrenamiento, desconocido y no auditado.
- El soporte de nepalí es una inferencia a partir del nombre del modelo; no está confirmado en la model card.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin métricas de calidad ni comparativas: no se recomienda su uso en producción sin una evaluación previa sobre el dominio objetivo.
- El repositorio no registra descargas ni interacción de la comunidad, lo que dificulta contrastar su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/saskarkhadka/nepBART-it
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
