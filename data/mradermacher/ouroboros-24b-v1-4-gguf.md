# mradermacher/Ouroboros-24B-v1.4-GGUF

## Resumen

Ouroboros-24B-v1.4 es un modelo de lenguaje de 23.572.444.160 parámetros (~23,5B) orientado a la escritura creativa, la generación de ficción y el roleplaying. Fue desarrollado por Naphula y posteriormente cuantizado a formato GGUF por mradermacher para facilitar su ejecución en entornos locales. El modelo está diseñado para tareas como generación de tramas, subtramas, continuación de escenas, narración vívida y escritura de géneros diversos (ciencia ficción, romance, terror, etc.).

Según las etiquetas de la model card, se trata de un merge realizado con mergekit, probablemente combinando pesos de modelos basados en la arquitectura Mistral y el modelo Della. No se especifican detalles adicionales sobre la arquitectura interna ni el proceso de entrenamiento en la información disponible. El modelo está pensado para uso en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

La versión GGUF incluye múltiples cuantizaciones (desde Q2_K hasta Q8_0) que permiten ajustar el equilibrio entre calidad y consumo de recursos. Es relevante para desarrolladores y creadores que buscan un modelo especializado en narrativa y roleplaying ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; los tags sugieren merge de modelos basados en Mistral (mergekit) |
| Parametros totales | 23.572.444.160 (~23,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Las etiquetas indican que es un merge creado con mergekit, combinando pesos de modelos basados en Mistral y el modelo Della (especializado en escritura creativa). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

El modelo base (Naphula/Ouroboros-24B-v1.4) no incluye una model card técnica en la información proporcionada, por lo que los detalles de arquitectura (número de capas, heads, etc.) no están disponibles. La cuantización GGUF fue realizada por mradermacher, quien aplicó imatrix (usando el dataset OccultAI/illuminati_imatrix_v1) para optimizar las cuantizaciones de menor precisión.

## Capacidades

- Generación de texto creativo: tramas, subtramas, escenas, diálogos y narración descriptiva.
- Escritura de ficción en múltiples géneros: ciencia ficción, romance, terror, fantasía, etc.
- Continuación de escenas y desarrollo de historias a partir de un contexto dado.
- Roleplaying (RP): capaz de mantener personajes y contextos en conversaciones narrativas.
- Escritura vívida y prosas detalladas, según los tags del modelo.
- Soporte de lenguaje profano (swearing), lo que permite un tono adulto o realista.
- Capacidades multilingües: limitadas al inglés, según la información disponible.

## Casos de uso

- Generación de tramas para novelas o relatos: el modelo puede crear estructuras narrativas completas a partir de una premisa inicial, ayudando a autores a superar bloqueos creativos.
- Escritura de diálogos y escenas para juegos de rol: su capacidad de roleplaying permite mantener personajes coherentes y reacciones contextuales en campañas de mesa o videojuegos.
- Creación de contenido para blogs o redes sociales: redacción de historias cortas, hilos narrativos o contenido de ficción para audiencias específicas.
- Prototipado de narrativa interactiva: desarrollo de historias ramificadas donde el modelo genera diferentes caminos según las elecciones del usuario.
- Asistencia en guiones y storyboards: generación de descripciones de escenas, diálogos y secuencias para cine, teatro o animación.
- Automatización de contenido de ficción para newsletters o plataformas de suscripción: producción de relatos seriados con continuidad entre capítulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (modelo + overhead de contexto):
  - Q2_K (9,0 GB): cabe en GPUs con 12 GB de VRAM (p. ej., RTX 3060, RTX 4070).
  - Q4_K_M (14,4 GB): requiere al menos 16 GB de VRAM (RTX 4080, RTX 4090, A6000).
  - Q5_K_M (16,9 GB): recomendable 20-24 GB de VRAM (RTX 4090, A5000, A6000).
  - Q8_0 (25,2 GB): necesita 32 GB o más (A100, H100, o múltiples GPUs).
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4/Q5; A100 40/80 GB para Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (con backend llama.cpp).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. En una RTX 4090 con Q4_K_M se esperan decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de escritura creativa (como MythoMax, Kimiko, etc.) en términos de rendimiento y características. La información proporcionada no incluye benchmarks ni detalles de otros modelos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información específica sobre sesgos; como modelo entrenado con datos de internet, puede reflejar sesgos presentes en el corpus.
- Riesgo de alucinación: inherente a los modelos generativos; puede inventar hechos, nombres o detalles no solicitados.
- Limitaciones de contexto: la longitud de contexto no está especificada; se recomienda probar con ventanas cortas para evitar degradación.
- Limitaciones de idioma: solo soporta inglés; no apto para generación en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y aviso de cambios.
- Advertencia para producción: al ser un modelo de escritura creativa, puede producir contenido ofensivo o inapropiado (incluye soporte de lenguaje profano); es necesario implementar filtros si se usa en aplicaciones públicas.

## Enlaces

- Repositorio GGUF: [mradermacher/Ouroboros-24B-v1.4-GGUF](https://huggingface.co/mradermacher/Ouroboros-24B-v1.4-GGUF)
- Modelo base: [Naphula/Ouroboros-24B-v1.4](https://huggingface.co/Naphula/Ouroboros-24B-v1.4)
- Dataset de imatrix: [OccultAI/illuminati_imatrix_v1](https://huggingface.co/datasets/OccultAI/illuminati_imatrix_v1)
