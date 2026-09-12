# GiorgiGE/vazi-sft

## Resumen

GiorgiGE/vazi-sft es un modelo de lenguaje publicado en Hugging Face por el usuario GiorgiGE. Por las etiquetas del repositorio (safetensors, llama, region:us) se trata de un modelo con arquitectura de tipo Llama y pesos almacenados en formato safetensors. El recuento real de parámetros declarado en los ficheros es de 105.867.648 (aproximadamente 105,9 millones), lo que lo sitúa en la categoría de modelos pequenos.

El sufijo "sft" del nombre sugiere que se trata de un ajuste fino supervisado (supervised fine-tuning) sobre una base previa, aunque no hay documentación publicada que lo confirme. No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, el proceso de alineación ni la longitud de contexto soportada.

El modelo acumula 844 descargas y 1 "like", y su licencia e idiomas soportados no están declarados. La relevancia de esta ficha es principalmente de caracter informativo: se trata de un modelo sin documentación técnica pública, por lo que la mayor parte de sus especificaciones deben considerarse no disponibles. Llama la atención la discrepancia entre el número de parámetros (unos 106 millones) y el tamano del repositorio (12,7 GB), lo que apunta a la posible inclusión de múltiples puntos de control de entrenamiento u otros artefactos en el mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (según la etiqueta del repositorio; detalle de configuración no disponible) |
| Parametros totales | 105.867.648 (~105,9 M) |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única información disponible sobre la arquitectura proviene de la etiqueta "llama" del repositorio, lo que indica que el modelo sigue el diseno de transformer decoder-only característico de la familia Llama (atención causal, normalización RMSNorm y activaciones SwiGLU, presumiblemente). No se ha publicado la configuración exacta de capas, dimensiones de representación, número de cabezas de atención ni el tamano de vocabulario.

Respecto al entrenamiento, el nombre "vazi-sft" apunta a un ajuste fino supervisado, pero no hay datos sobre el corpus utilizado, el volumen de tokens, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos, etc.). Toda esta sección debe considerarse no disponible.

## Capacidades

- Generación de texto: se asume capacidad de generación autoregresiva básica por su naturaleza de modelo de lenguaje, aunque no está documentada.
- Razonamiento y matematicas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible.

## Casos de uso

Dado que no hay documentación sobre capacidades, contexto ni idiomas, no es posible recomendar casos de uso concretos con garantías. A modo orientativo, y siempre sujeto a validación previa:

- Experimentación e investigación: por su tamano reducido (~106 M de parámetros) puede servir como objeto de estudio para reproducir procesos de ajuste fino supervisado en entornos con recursos limitados.
- Prototipado educativo: uso en cursos o tutoriales sobre pipelines de Hugging Face y despliegue de modelos pequenos.
- Pruebas de integración de infraestructura: como modelo de relleno para validar cadenas de despliegue (transformers, vLLM, llama.cpp) antes de pasar a modelos mayores.
- Evaluación comparativa interna: como referencia base en experimentos de destilación o comparación de arquitecturas pequenas.
- Fine-tuning adicional: punto de partida para nuevos ajustes sobre dominios específicos, dado su bajo coste computacional.
- Investigación sobre sesgos y comportamientos emergentes: estudio de modelos de escala reducida y sus limitaciones.

No se recomienda su uso en producción directa sin una evaluación exhaustiva previa, dado que se desconoce por completo su comportamiento, licencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp16/bf16, unos 212 MB de pesos (105,9 M de parámetros × 2 bytes); en fp32, unos 424 MB. El consumo real dependerá de la longitud de contexto y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090). También puede ejecutarse en CPU, dado su reducido tamano.
- Opciones de despliegue: la librería transformers permite cargarlo directamente desde safetensors. Para vLLM, llama.cpp u Ollama sería necesario convertir los pesos a los formatos correspondientes (por ejemplo, GGUF), ya que el repositorio no incluye cuantizaciones publicadas.
- Latencia y throughput: no disponibles.
- Advertencia de almacenamiento: el repositorio ocupa 12,7 GB en disco, muy por encima de lo que ocuparían unicamente los pesos de un modelo de 106 M de parámetros, por lo que conviene revisar qué artefactos adicionales contiene antes de la descarga.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni caracteristicas de modelos comparables, por lo que no es posible establecer una comparacion rigurosa con alternativas de tamano o tarea similares.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, paper ni datos de entrenamiento publicados.
- Licencia no declarada: se desconoce si se permite el uso comercial; debe contactarse con el autor antes de cualquier uso profesional.
- Idiomas no declarados: no se puede garantizar soporte multilingue ni la calidad en castellano.
- Longitud de contexto desconocida: limita la planificacion de aplicaciones con conversaciones largas o documentos extensos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; al no existir evaluación, es especialmente alto e impredecible.
- Sesgos potenciales: sin información sobre el corpus de entrenamiento, no se pueden estimar los sesgos presentes.
- Tamano del repositorio inusualmente grande (12,7 GB) para 106 M de parámetros: podría contener ficheros redundantes o puntos de control intermedios.
- Sin cuantizaciones publicadas: no es posible desplegarlo directamente en llama.cpp u Ollama sin conversión previa.
- Escasa tracción: 844 descargas y 1 "like" reducen la probabilidad de encontrar soporte o experiencias de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/GiorgiGE/vazi-sft

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web. Los resultados devueltos por la búsqueda no guardan relación con el modelo.
