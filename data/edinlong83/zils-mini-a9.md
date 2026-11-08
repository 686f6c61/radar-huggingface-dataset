# edinlong83/zils-mini-a9

## Resumen

zils-mini-a9 es un modelo de decisión (decision model) publicado por el usuario edinlong83 en Hugging Face, afinado a partir del modelo base Qwen/Qwen3.5-4B. Según la model card, se trata de un "d3-mini decision body" entrenado para el "mini pool" de la subred Zils 127, utilizando los modelos abiertos de dicho pool sobre datos públicos del split de entrenamiento. La licencia declarada es Apache-2.0.

El modelo pertenece a la familia Zils, una propuesta orientada a que aplicaciones puedan entrenar modelos pequeños capaces de tomar decisiones concretas (clasificar peticiones, marcar problemas o puntuar coincidencias) a partir de ejemplos etiquetados por el usuario. En este caso, el resultado es un modelo de aproximadamente 4.540 millones de parámetros con pesos en formato safetensors y un repositorio de 9,1 GB.

La relevancia de esta ficha es limitada por la escasez de documentación: no se publican idiomas soportados, pipeline, resultados de benchmarks ni detalles del proceso de entrenamiento más allá de la referencia al pool de la subred. Se trata, por tanto, de un artefacto experimental de un ecosistema emergente más que de un modelo con garantías de producción documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); detalles específicos no disponibles |
| Parámetros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tune del base Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de dicho modelo. La model card no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa). El número de parámetros reportado en safetensors (4.539.265.536) es coherente con un modelo denso de aproximadamente 4,5 mil millones de parámetros.

En cuanto al entrenamiento, la información disponible indica únicamente que fue entrenado "desde los modelos abiertos del pool" de la subred Zils 127 sobre "datos públicos del split de entrenamiento". No se especifican el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan hiperparámetros, duración del entrenamiento ni metodología de evaluación. La etiqueta "decision-model" y los tags "zils" y "d3-mini" sugieren un ajuste orientado a tareas de decisión y clasificación, pero no hay evidencia técnica publicada que lo respalde.

## Capacidades

- Generación de texto y razonamiento general: heredadas del modelo base Qwen/Qwen3.5-4B, aunque no se documentan evaluaciones específicas.
- Toma de decisiones y clasificación: el propósito declarado del modelo es servir como "decision body" para tareas de decisión dentro del ecosistema Zils (ordenar peticiones, marcar problemas, puntuar coincidencias).
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación de peticiones entrantes: el modelo puede utilizarse para etiquetar o enrutar solicitudes de usuarios en una aplicación, siguiendo el patrón de "decision model" descrito por Zils, siempre que se le proporcionen ejemplos de decisión adecuados.
- Marcado de incidencias: puede emplearse para detectar y señalar problemas en flujos de trabajo (por ejemplo, tickets mal formados o contenido sospechoso) dentro de un pipeline de preprocesado.
- Puntuación de coincidencias: adecuado para tareas de scoring o ranking de pares (candidato-oferta, consulta-documento) en las que se requiera una decisión binaria o graduada.
- Prototipado de asistentes de decisión: útil en entornos de investigación para experimentar con modelos pequeños de decisión antes de escalar a modelos mayores.
- Filtrado previo en pipelines de datos: puede actuar como primera etapa de un sistema mayor, reduciendo el volumen de datos que llega a modelos más grandes y costosos.
- Experimentación en el ecosistema Zils: sirve como punto de partida para quienes trabajan con la subred 127 y quieren reutilizar o comparar "decision bodies" del pool.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16/BF16, aproximadamente 9 GB; en cuantización de 8 bits, en torno a 5 GB; en 4 bits, alrededor de 3 GB (estimaciones basadas en el número de parámetros, no en mediciones publicadas).
- GPU recomendadas: para FP16, GPU con 16 GB o más (RTX 4090, A100 40 GB, H100); para cuantización 4/8 bits, GPU consumer con 8-12 GB pueden ser suficientes.
- ¿Cabe en GPU consumer? Sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantización adecuada; no se han publicado mediciones que lo confirmen.
- Opciones de despliegue: no documentadas por el autor; al ser un transformer estándar en safetensors, cabría esperar compatibilidad con vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF, aunque no hay confirmación oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-a9 | ≈4,54 B | no disponible | Apache-2.0 | Hugging Face (edinlong83/zils-mini-a9) |
| Qwen/Qwen3.5-4B (base) | ≈4 B | no disponible | no disponible en la información | Hugging Face |
| Alternativas de decisión de la familia Zils | no disponible | no disponible | no disponible | Hugging Face (org zils-ai) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Documentación muy escasa: no se declaran idiomas, contexto, pipeline ni metodología de evaluación, lo que dificulta validar su comportamiento en producción.
- Sesgos conocidos: no documentados; al derivar de Qwen/Qwen3.5-4B, podría heredar sesgos del modelo base, pero no hay análisis publicado.
- Riesgo de alucinación: inherente a los modelos generativos; no se ha caracterizado para este fine-tune.
- Limitaciones de contexto o idioma: desconocidas; no se especifica la ventana de contexto ni los idiomas cubiertos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento del pool, no detalladas.
- Madurez: modelo con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-07), lo que sugiere un artefacto experimental sin validación comunitaria.
- Caveat para producción: no se recomienda su despliegue en entornos críticos sin una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edinlong83/zils-mini-a9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio de Zils: https://zils.ai/
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
