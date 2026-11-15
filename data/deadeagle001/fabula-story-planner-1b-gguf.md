# DeadEagle001/fabula-story-planner-1b-GGUF

## Resumen

Fabula Story Planner 1B es un modelo de lenguaje de 1.235.814.432 parámetros (aproximadamente 1,2 mil millones) publicado por el usuario DeadEagle001 en Hugging Face bajo licencia Apache 2.0. Se distribuye exclusivamente en formato GGUF, lo que lo orienta a inferencia local mediante llama.cpp y herramientas compatibles. Por su nombre y tamaño, parece concebido como un modelo pequeño especializado en la planificación de narrativas o estructuras de historias, aunque la model card publicada no contiene ninguna descripción funcional, datos de entrenamiento ni especificaciones técnicas más allá de la licencia.

La información disponible es extremadamente escasa: la model card se limita a declarar la licencia Apache 2.0, sin sección de uso, sin descripción de la arquitectura, sin idiomas declarados y sin resultados de evaluación. El repositorio ocupa 0,8 GB, coherente con una única cuantización de un modelo de ~1,2 B de parámetros. No consta pipeline declarado, no tiene descargas ni interacciones en el momento de la consulta y fue creado y actualizado el 15 de noviembre de 2026.

Por tanto, esta ficha debe leerse como una evaluación de disponibilidad y de encaje técnico más que como una validación de capacidades: el modelo es relevante únicamente como candidato a experimentación en entornos con recursos limitados, y cualquier uso en producción exige una evaluación empírica previa por parte del equipo adoptante, dado que el autor no aporta evidencia de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los pesos son de tipo transformer según el recuento de parámetros en safetensors, pero el autor no lo declara) |
| Parámetros totales | 1.235.814.432 |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene un único archivo GGUF; no se especifica el nivel de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,8 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de capas, la dimensión de los embeddings, el mecanismo de atención ni la estrategia de tokenización. El recuento de parámetros (1.235.814.432) procede de los metadatos de pesos en formato safetensors asociados al repositorio, lo que confirma un modelo denso de aproximadamente 1,2 B de parámetros, pero no permite inferir detalles estructurales.

Tampoco hay datos sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni si se aplicaron técnicas de destilación desde un modelo mayor. La única innovación técnica constatable es la distribución en GGUF, que habilita cuantización y ejecución en CPU o GPU de gama baja mediante llama.cpp, pero no hay evidencia de decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio sugiere un ajuste orientado a diálogo, aunque no se detalla el formato de prompt ni las plantillas de chat.
- Planificación narrativa: el nombre del modelo indica una especialización en estructurar tramas, capítulos o arcos argumentales, pero esta capacidad no está documentada ni evaluada por el autor.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado de asistentes de escritura creativa en local: al ser un GGUF de 0,8 GB, puede cargarse en un portátil sin GPU dedicada y usarse para generar esquemas de capítulos o listas de escenas, con la salvedad de que la calidad debe validarse manualmente.
- Generación de borradores de estructura narrativa en herramientas de autor: el modelo puede integrarse en un editor de texto como servicio local que proponga beats argumentales, aunque su ventana de contexto es desconocida y conviene limitar las peticiones a fragmentos cortos.
- Experimentación académica con modelos pequeños: sirve como línea base de 1,2 B parámetros en estudios comparativos de planificación narrativa, siempre que se documente que carece de benchmarks publicados.
- Despliegue en entornos con restricciones de conectividad: al distribuirse como GGUF, puede ejecutarse íntegramente offline en una máquina modesta, lo que encaja en escenarios de investigación con datos sensibles que no deben salir del perímetro.
- Pruebas de integración en pipelines de llama.cpp u Ollama: el formato permite validar cadenas de inferencia y medir latencia real en hardware concreto antes de comprometerse con un modelo mayor.
- Filtrado y clasificación de textos narrativos en lotes pequeños: con un modelo de 1,2 B es viable procesar volúmenes moderados de sinopsis para etiquetarlas por género o estructura, aunque la ausencia de evaluación hace recomendable un muestreo de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que se desconoce el nivel de cuantización del GGUF. Como referencia orientativa para un modelo denso de 1,2 B, una cuantización de 4 bits ocuparía del orden de 0,7-0,8 GB y una de 8 bits alrededor de 1,3 GB, en línea con el tamaño del repositorio (0,8 GB).
- GPU recomendadas: no disponibles. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso en iGPU con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM libre, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere también despliegue mediante Text Generation Inference u otros backends con API compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| Fabula Story Planner 1B (DeadEagle001) | 1,236 B | no disponible | Apache 2.0 | GGUF | no |
| TinyLlama 1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | sí (model card del autor) |
| Qwen2.5-1.5B | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | sí (model card del autor) |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | sí (model card del autor) |

La comparación se limita a parámetros, contexto y licencia porque el modelo evaluado no publica métricas. Frente a TinyLlama, Qwen2.5-1.5B y SmolLM2-1.7B, el modelo de DeadEagle001 no ofrece evidencia de calidad, contexto declarado ni idiomas soportados, por lo que las alternativas citadas son opciones más seguras para cualquier despliegue que requiera garantías documentadas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe uso previsto, formato de prompt, idiomas ni limitaciones, lo que impide un despliegue informado sin evaluación propia.
- Riesgo elevado de alucinación no cuantificado: al no existir benchmarks ni pruebas de fidelidad, no puede estimarse la tasa de errores factuales.
- Sesgos desconocidos: se desconoce la composición del corpus de entrenamiento, por lo que no es posible evaluar sesgos de género, culturales o ideológicos.
- Contexto e idiomas no declarados: cualquier integración que dependa de una ventana concreta o de soporte multilingüe debe verificarse empíricamente.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; la responsabilidad legal y técnica recae íntegramente en el adoptante.
- Madurez del repositorio: cero descargas y cero interacciones en el momento de la consulta, sin historial de mantenimiento ni comunidad que valide su funcionamiento.
- Formato único GGUF: no se distribuyen safetensors ni otros formatos, lo que limita el ajuste fino y obliga a convertir pesos si se necesita entrenamiento posterior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DeadEagle001/fabula-story-planner-1b-GGUF
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
