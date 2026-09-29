# Iinouewinnie/retrieval-prototype

## Resumen

retrieval-prototype es un repositorio publicado por el usuario Iinouewinnie en HuggingFace que contiene una implementación de un "Tiny Transformer" orientado a tareas de recuperación (retrieval), acompañada de un fichero de configuración, una receta de entrenamiento por defecto y un checkpoint de inicialización en formato safetensors. No se trata de un modelo entrenado ni validado, sino de un punto de partida reproducible: el propio autor indica explícitamente que el checkpoint sirve para pruebas de humo (smoke tests) y no se presenta como un modelo con resultados de referencia.

El modelo es extremadamente pequeño: 33.088 parámetros totales, según los metadatos reales del fichero safetensors. Incorpora decisiones arquitectónicas concretas, como atención multi-query (multi query attention), fusión tipo Tucker, activación approx gelu y normalización scalenorm. La receta de entrenamiento incluida usa el optimizador RMSProp con un schedule de tipo exponencial.

Su relevancia es acotada y de carácter experimental: sirve como base para reproducir y comparar arquitecturas tiny transformer en pipelines de retrieval, no como componente listo para producción. No declara idiomas soportados, no publica benchmarks y no ha sido auditado en robustez, equidad ni transferencia de dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención multi-query, fusión Tucker, activación approx gelu, normalización scalenorm) |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint de inicialización en precisión nativa) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala "tiny" con atención multi-query, lo que reduce el coste de memoria de las matrices clave-valor al compartir proyecciones entre cabezas. La fusión entre modalidades o representaciones se realiza mediante descomposición de Tucker, un esquema tensorial que factoriza interacciones de orden superior. La activación es una aproximación de GELU y la normalización emplea scalenorm. El tamaño total (33.088 parámetros) sitúa al modelo muy por debajo de cualquier transformer de uso general, en el rango de modelos de juguete o de validación de arquitectura.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto con RMSProp y un schedule exponencial, pero el autor advierte que son valores de partida del script y no evidencia de una ejecución completada. No se especifica el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El fichero model.safetensors es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado ni evaluado.

## Capacidades

- Generación de representaciones para recuperación (retrieval): el propósito declarado del modelo es la recuperación, con una configuración de fusión Tucker pensada para combinar señales.
- Punto de partida reproducible: permite reproducir la arquitectura y la receta de entrenamiento sin depender de pesos preentrenados.
- Pruebas de humo de infraestructura: al ser un checkpoint de inicialización válido, sirve para validar cargas de safetensors y flujos de ejecución.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Generación de texto, código o matemáticas: no documentadas; el modelo no es un modelo generativo entrenado.

## Casos de uso

- Validación de pipelines de carga de safetensors: el checkpoint de inicialización permite comprobar que el adaptador de carga, la configuración y el script funcionan de extremo a extremo antes de invertir en cómputo de entrenamiento.
- Reproducción de experimentos de arquitectura: el repositorio incluye config.json y training_args.json, de modo que un equipo puede replicar la combinación de atención multi-query, fusión Tucker, approx gelu y scalenorm con RMSProp y schedule exponencial, y medir cómo afecta cada elección.
- Baseline de capacidad emparejada para retrieval: al fijar un modelo diminuto con receta conocida, se puede usar como referencia de baja capacidad frente a otros retrievers y comprobar si las mejoras provienen del modelo o de los datos.
- Evaluación de referencia en Flickr30k: el propio autor recomienda esa tarea, con la métrica de la tarea reportada en al menos tres semillas e incluyendo un baseline de capacidad equivalente.
- Estudio de ablación de atención multi-query: al ser un modelo tiny, permite aislar el efecto de compartir proyecciones clave-valor sobre el coste y la calidad de la recuperación en entornos con recursos mínimos.
- Docencia y prototipado rápido de RAG: sirve como componente didáctico para explicar las etapas de un pipeline de recuperación (chunking, embeddings, recuperación) sin coste de GPU, aunque requiere adaptación explícita antes de usarse con APIs genéricas de carga automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio declara explícitamente que no se reclama ninguna puntuación de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 33.088 parámetros, en FP32 el peso ocupa aproximadamente 132 KB (33.088 x 4 bytes), más el overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 o superior; también puede ejecutarse en CPU sin problema.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier GPU de consumo de la última década (por ejemplo, RTX 3060, RTX 4090) e incluso en hardware integrado.
- Opciones de despliegue: no hay integración publicada con vLLM, llama.cpp, Ollama ni TGI. El repositorio está pensado para ejecutarse directamente con PyTorch mediante main.py, y las APIs de carga automática requieren un adaptador explícito por tratarse de una implementación propia.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, la latencia estaría dominada por el overhead del framework y no por el cálculo del modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. La única alternativa identificada con el mismo autor es otro repositorio de retrieval, del que tampoco hay métricas en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Iinouewinnie/retrieval-prototype | 33.088 | no disponible | Apache-2.0 | HuggingFace | no publicado |
| Iinouewinnie/poolformer-retrieval-2024 | no disponible | no disponible | no disponible | HuggingFace (mismo autor) | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no está entrenado: es una inicialización válida para pruebas de humo, no un modelo con rendimiento demostrado.
- No ha sido auditado en robustez, equidad (fairness) ni transferencia de dominio, por lo que no hay garantías sobre sesgos ni comportamiento fuera de la distribución de prueba.
- Riesgo de alucinación: no evaluable, ya que el modelo no es un modelo generativo entrenado y no se publican métricas de calidad.
- Sin idiomas declarados: se desconoce el soporte multilingüe real.
- Sin datos de longitud de contexto, lo que impide planificar escenarios que dependan de ventanas largas.
- Implementación propia: las APIs de carga automática de HuggingFace necesitan un adaptador explícito, lo que añade trabajo de integración.
- Confusión potencial con otros repositorios del mismo autor centrados en retrieval; conviene verificar el identificador exacto antes de reutilizar pesos.
- Para uso comercial, la licencia Apache-2.0 es permisiva, pero el autor advierte de que los términos de los datos de origen de cualquier dataset externo deben revisarse por separado.
- Las fechas de creación y actualización del repositorio son futuras respecto a la fecha de consulta, un dato anómalo que conviene tener en cuenta al citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iinouewinnie/retrieval-prototype
- Perfil del autor: https://huggingface.co/Iinouewinnie
- Repositorio relacionado del mismo autor: https://huggingface.co/Iinouewinnie/poolformer-retrieval-2024
- Encuesta sobre arquitecturas de Retrieval-Augmented Generation: https://arxiv.org/html/2506.00054v1
- Implementación REAL (prototype alignment para retrieval de vídeo): https://github.com/Jian-Lang/REAL
- Artículo sobre un prototipo RAG con citas de página para hablantes de somalí: https://bioengineer.org/ai-prototype-brings-page-cited-medical-answers-to-somali-speakers/
