# harwell111/bayon-Q4_K_M-GGUF

## Resumen

El modelo `harwell111/bayon-Q4_K_M-GGUF` es una conversión al formato GGUF del modelo `attentionlab/bayon`, realizada mediante la herramienta GGUF-my-repo de llama.cpp. `attentionlab/bayon` es un modelo de lenguaje pequeño de 109 millones de parámetros, diseñado específicamente para la generación de texto en idioma camboyano (km). La conversión a GGUF permite ejecutarlo de forma eficiente en CPU mediante llama.cpp, lo que lo hace accesible en entornos con recursos limitados.

Este modelo resuelve el problema de la falta de modelos de lenguaje de tamaño reducido y optimizados para el camboyano, un idioma con poca representación en el ecosistema de IA. Su relevancia radica en que ofrece una opción ligera y de código abierto (licencia Apache 2.0) para tareas de procesamiento de lenguaje natural en camboyano, con la ventaja de poder desplegarse en hardware modesto sin necesidad de GPU dedicada.

La cuantización Q4_K_M reduce el tamaño del archivo a aproximadamente 0,1 GB, lo que facilita su distribución y uso en dispositivos con poca memoria. Aunque no se especifican detalles sobre la arquitectura interna, el tamaño de parámetros sugiere un transformer estándar, probablemente similar a modelos como GPT-2 o TinyLLaMA, adaptado al vocabulario camboyano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 109.019.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | km (camboyano) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `attentionlab/bayon`. Por el tamaño de parámetros (109M), se puede inferir que se trata de un transformer decoder-only estándar, pero no se confirma. El entrenamiento se realizó sobre el dataset `attentionlab/fineweb-2-khmer-extended`, que es una extensión del subconjunto de FineWeb-2 para camboyano, lo que indica que el modelo fue preentrenado o ajustado con datos textuales en ese idioma. No se mencionan técnicas como RLHF, DPO ni otras innovaciones en el proceso de entrenamiento.

## Capacidades

- Generación de texto en camboyano: el modelo es capaz de producir texto coherente en este idioma, aunque su tamaño limitado restringe la complejidad de las respuestas.
- Soporte de tool calling / function calling: no disponible (no se indica en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no, está especializado únicamente en camboyano.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Chatbots de atención al cliente en camboyano: gracias a su tamaño reducido, puede integrarse en aplicaciones móviles o web para responder preguntas frecuentes en este idioma, funcionando en tiempo real en CPUs de gama baja.
- Generación de contenido local: creación de textos cortos como descripciones de productos, noticias o publicaciones en redes sociales en camboyano, con un coste de inferencia mínimo.
- Traducción asistida: aunque no está entrenado específicamente para traducción, puede usarse como base para tareas de paráfrasis o corrección de textos en camboyano.
- Educación y aprendizaje de idiomas: generar ejemplos de frases o ejercicios de práctica para estudiantes de camboyano, aprovechando su capacidad de producir texto coherente.
- Procesamiento de documentos: resumir o extraer información de textos en camboyano en entornos con limitaciones de hardware, como ordenadores portátiles antiguos o dispositivos edge.
- Investigación lingüística: servir como modelo de referencia para estudios sobre generación de lenguaje en idiomas de baja representación, dado su pequeño tamaño y facilidad de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M pesa aproximadamente 0,1 GB, por lo que la memoria necesaria es de unos 200-300 MB incluyendo overhead. Esto permite ejecutarlo en CPUs sin GPU, utilizando RAM convencional.
- GPU recomendadas: no se requiere GPU; puede ejecutarse en cualquier CPU con al menos 512 MB de RAM libre. Si se usa GPU, cualquier modelo con más de 1 GB de VRAM es suficiente.
- Si cabe en consumer GPU: sí, cabe incluso en GPUs integradas o tarjetas muy antiguas.
- Opciones de despliegue: llama.cpp (CLI y servidor), también compatible con Ollama y otros motores que soporten GGUF.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño, la generación en CPU es rápida, del orden de decenas de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo idioma (camboyano) o con el mismo tamaño. No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al estar entrenado con datos de FineWeb-2, puede heredar sesgos presentes en la web.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente al ser pequeño y especializado en un solo idioma.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero es probable que sea corta (típicamente 512 o 1024 tokens en modelos de este tamaño).
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, sin restricciones significativas.
- Caveat para producción: al ser un modelo muy pequeño, la calidad del texto generado es limitada y puede no ser adecuada para tareas que requieran alta coherencia o razonamiento complejo. Se recomienda evaluar su rendimiento en el caso de uso específico antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: [harwell111/bayon-Q4_K_M-GGUF](https://huggingface.co/harwell111/bayon-Q4_K_M-GGUF)
- Modelo base: [attentionlab/bayon](https://huggingface.co/attentionlab/bayon)
- Dataset de entrenamiento: [attentionlab/fineweb-2-khmer-extended](https://huggingface.co/datasets/attentionlab/fineweb-2-khmer-extended)
