# Samonte/zils-lite-body-h1

## Resumen

zils-lite-body-h1 es un ajuste fino completo (full fine-tune) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario Samonte en Hugging Face. Se presenta como un "cuerpo de decisión" (decision body) para el pool lite de la subred 127 de Zils, una infraestructura de decisión distribuida. El modelo parte de un checkpoint previo del mismo autor (qhoenix/zils-lite-decision-v9) y se entrena sobre datos de estilo decisorio procedentes de particiones de entrenamiento de conjuntos de datos públicos, ítems de práctica generados programáticamente y resultados públicos resueltos.

Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se trata de un modelo pequeño orientado a extracción de características y a la toma de decisiones, no a la generación de texto conversacional general. La licencia Apache-2.0 facilita su uso comercial y su integración en pipelines. Su relevancia actual radica en la tendencia hacia modelos especializados de pequeño tamaño que pueden desplegarse en hardware modesto y ejecutarse con baja latencia en entornos de producción.

La información pública disponible es muy limitada: la model card es breve y no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni resultados de evaluación. Esta ficha refleja exclusivamente los datos verificables del repositorio y de la model card, indicando de forma explícita los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), ajuste fino completo con promedio de pesos; etiquetado como qwen3_5 y custom_code |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/INT8 no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la familia Qwen3.5, un transformer de aproximadamente 0,85 mil millones de parámetros. Según la model card, el entrenamiento consistió en un ajuste fino completo del checkpoint qhoenix/zils-lite-decision-v9 (Apache-2.0) sobre datos de estilo decisorio: particiones de entrenamiento de conjuntos de datos públicos, ítems de práctica generados programáticamente y resultados públicos resueltos. Posteriormente, los pesos resultantes se promediaron con el punto de partida (weight averaging), una técnica habitual para estabilizar el ajuste fino y reducir el olvido catastrófico.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. Tampoco se documentan innovaciones arquitectónicas adicionales más allá de la base Qwen3.5 y el etiquetado custom_code, que implica la necesidad de cargar código personalizado del repositorio para su uso con transformers.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado del modelo; está diseñado para producir representaciones o puntuaciones a partir de entradas, no para generar texto libre.
- Modelo de decisión: orientado a tareas de clasificación o selección de opciones en el contexto del pool lite de Zils.
- Ajuste sobre datos de resultados resueltos: entrenado con ítems de práctica y resultados públicos, lo que sugiere capacidad para patrones de decisión supervisada.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y enrutamiento de decisiones en pipelines: el modelo puede emplearse como componente de puntuación para seleccionar entre opciones predefinidas en un flujo de trabajo automatizado, aprovechando su naturaleza de decision-model y su tamaño reducido para inferencia de baja latencia.
- Extracción de características para sistemas de recuperación: al declarar el pipeline feature-extraction, puede generar representaciones vectoriales de entradas textuales para búsqueda semántica o clustering en dominios donde se haya entrenado.
- Filtrado y priorización en subredes de decisión: integrado en el pool lite de Zils, puede usarse para evaluar y ordenar candidatos según los patrones aprendidos de resultados públicos resueltos.
- Prototipado rápido en entornos con recursos limitados: con 0,85 mil millones de parámetros y 1,7 GB de pesos, cabe en GPUs de consumo y permite experimentar con ajustes finos o despliegues locales sin infraestructura dedicada.
- Evaluación de modelos base pequeños en investigación: sirve como punto de comparación para estudiar el efecto del ajuste fino completo y el weight averaging sobre un Qwen3.5-0.8B en tareas de decisión.
- Servicio de inferencia en endpoints compatibles: gracias a la etiqueta endpoints_compatible, puede desplegarse en la infraestructura de Hugging Face para exponer la funcionalidad de decisión como API en aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precisión completa (FP32/BF16 según pesos safetensors); alrededor de 0,9-1,0 GB en cuantización INT8 y 0,5-0,6 GB en INT4, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1650 4 GB en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (requiere cargar custom_code del repositorio), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama y TGI no están confirmados para este checkpoint al no publicarse pesos GGUF ni configuraciones estándar.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Samonte/zils-lite-body-h1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (21 descargas) | Ajuste fino de decisión sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que deriva |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Hugging Face | Checkpoint de partida del ajuste fino |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre conjuntos de datos públicos y resultados resueltos, puede heredar sesgos presentes en esas fuentes.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión y extracción de características, el riesgo se manifiesta como puntuaciones o clasificaciones erróneas más que como texto inventado.
- Limitaciones de contexto o idioma: no se declara longitud de contexto ni idiomas soportados, lo que impide garantizar su comportamiento fuera del dominio de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios; conviene verificar las licencias del modelo base y del checkpoint de partida.
- Caveats para producción: requiere cargar código personalizado (custom_code) con transformers, lo que añade un riesgo de seguridad y de compatibilidad; la model card no documenta evaluación, por lo que no se recomienda su uso en producción sin una validación propia.
- Madurez: con 21 descargas y 0 likes, el modelo tiene una adopción muy baja y no cuenta con validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Samonte/zils-lite-body-h1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint de partida: https://huggingface.co/qhoenix/zils-lite-decision-v9
