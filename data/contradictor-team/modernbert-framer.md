# contradictor-team/modernbert-framer

## Resumen

modernbert-framer es un ajuste fino (fine-tune) del modelo encoder answerdotai/ModernBERT-base, publicado por el usuario contradictor-team en Hugging Face. El modelo está especializado en el análisis de encuadres informativos (media framing), una tarea de clasificación de texto propia de la investigación en comunicación y ciencias políticas, y se ha entrenado sobre el corpus jmLuis/MediaFrameCorpus-PhilippineFrameCorpus-Combined, una combinación de corpus de encuadre de medios filipinos.

La relevancia del modelo reside en su dominio de aplicación: aplicar un encoder moderno y eficiente como ModernBERT a la detección de marcos periodísticos permite clasificar grandes volúmenes de noticias con un coste computacional bajo, algo útil para estudios de medios a escala, monitorización de sesgo informativo y análisis de discurso. Al derivar de ModernBERT-base, hereda una arquitectura transformer encoder con atención de contexto largo, aunque la información publicada no detalla la longitud de contexto efectiva tras el ajuste.

La ficha disponible es mínima: la model card solo contiene metadatos (licencia MIT, idioma inglés, dataset y modelo base), sin descripción de uso, hiperparámetros de entrenamiento ni resultados de evaluación. Por tanto, muchos de los apartados técnicos se marcan como no disponibles, y el modelo debe considerarse experimental hasta que el autor publique documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), ajustado desde answerdotai/ModernBERT-base |
| Parametros totales | no disponible (ModernBERT-base tiene del orden de 149 millones, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (se infiere safetensors por el ecosistema de transformers, pero no se confirma en la informacion) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer de la familia BERT modernizada que incorpora mejoras como rotary positional embeddings, atención con flash attention y soporte de secuencias largas. Sobre esa base, contradictor-team ha realizado un ajuste fino supervisado para una tarea de clasificación de encuadres, empleando el dataset jmLuis/MediaFrameCorpus-PhilippineFrameCorpus-Combined, que combina corpus de encuadre de medios filipinos con textos en inglés.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la existencia de RLHF/DPO (poco habitual en encoders de clasificación) ni los hiperparámetros del ajuste. Tampoco se documentan innovaciones técnicas específicas del fine-tune más allá del uso de la arquitectura ModernBERT subyacente.

## Capacidades

- Clasificación de texto orientada al análisis de encuadres informativos (media framing) en inglés.
- Procesamiento de documentos periodísticos y textos de medios de comunicación.
- Extracción de señales de encuadre a partir de corpus anotados, útil para investigación cuantitativa de medios.
- Capacidad multilingüe limitada: solo se declara inglés, pese a que el corpus de entrenamiento procede de medios filipinos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de generación de texto, visión, audio ni modo de razonamiento (thinking).
- No se documenta capacidad de matemáticas ni de generación de código.

## Casos de uso

- Análisis académico de encuadres mediáticos: el modelo puede clasificar automáticamente grandes corpus de noticias en categorías de encuadre, sustituyendo la codificación manual en estudios de comunicación y ciencias políticas.
- Monitorización de sesgo informativo: integrar el clasificador en un pipeline de vigilancia de medios para detectar cómo distintos medios enmarcan un mismo tema a lo largo del tiempo.
- Investigación sobre medios filipinos: dado que el corpus de entrenamiento combina fuentes filipinas, el modelo puede emplearse en estudios comparativos de discurso en inglés sobre la región.
- Etiquetado asistido de datasets: usar el modelo para preanotar nuevos corpus de encuadre y reducir el esfuerzo de anotación humana, con revisión posterior.
- Análisis de discurso en redes y prensa digital: clasificar artículos y publicaciones a escala para estudios de opinión y comunicación política.
- Prototipado rápido en investigación computacional de medios: al ser un encoder ligero con licencia MIT, permite desplegar clasificadores en entornos con recursos limitados para experimentos académicos.
- Filtrado y enrutamiento de contenido editorial: en redacciones, clasificar piezas por encuadre para tareas de curación o análisis editorial interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un encoder de tamaño base (del orden de cientos de millones de parámetros), la inferencia en FP16 requeriría aproximadamente 1 GB o menos, pero este dato no se confirma en la información proporcionada.
- GPU recomendadas: no disponible en la información; por tamaño, cabría esperar ejecución en GPUs consumer (RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema, aunque no está documentado.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del modelo base, pero no confirmado.
- Opciones de despliegue: no disponible; al ser un modelo de transformers, cabría esperar compatibilidad con Hugging Face Transformers, pero no se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| contradictor-team/modernbert-framer | no disponible | no disponible | Clasificación de encuadres mediáticos | MIT | Hugging Face |
| answerdotai/ModernBERT-base | no disponible (modelo base) | no disponible | Encoder generalista | no disponible en esta ficha | Hugging Face |
| Alternativas de clasificación de encuadres | no disponible | no disponible | Clasificación de texto | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no incluye descripción de uso, evaluación ni hiperparámetros, por lo que el modelo debe considerarse experimental y no validado para producción.
- El modelo solo declara inglés, aunque el corpus de entrenamiento procede de medios filipinos; puede tener un rendimiento desigual en textos en otros idiomas o en variantes del inglés no representadas.
- Riesgo de sesgo: al entrenarse sobre un corpus específico de medios filipinos, puede heredar sesgos de selección y de encuadre de esas fuentes.
- Riesgo de alucinación no aplica directamente a una tarea de clasificación, pero sí de etiquetas incorrectas en textos fuera de dominio.
- No se documentan limitaciones de contexto ni de longitud de entrada.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones del dataset de entrenamiento, que no se detallan.
- Sin métricas publicadas, no es posible estimar la fiabilidad del clasificador en dominios distintos al corpus de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/contradictor-team/modernbert-framer
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/jmLuis/MediaFrameCorpus-PhilippineFrameCorpus-Combined
