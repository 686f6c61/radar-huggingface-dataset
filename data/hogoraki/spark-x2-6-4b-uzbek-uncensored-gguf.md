# hogoraki/Spark-X2.6-4B-Uzbek-Uncensored-GGUF

## Resumen

Spark-X2.6-4B-Uzbek-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo base Spark-X2.6-4B-Uzbek-Uncensored, publicado por el usuario hogoraki en Hugging Face. Se trata de un modelo de generación de texto de 4.112 millones de parámetros (aproximadamente 4,1 mil millones), derivado de la familia Spark 2.5, especializado en uzbeko e inglés y con un ajuste orientado a eliminar restricciones de contenido ("uncensored"). La versión GGUF está pensada para ejecutarse en servidores VPS con CPU y 8 GB de RAM, sin necesidad de GPU.

El modelo resuelve el problema de desplegar un LLM conversacional en uzbeko sobre hardware modesto: la cuantización Q4_K_M reduce el peso a 2,42 GB, lo que permite inferencia en CPU mediante Ollama o llama.cpp (build b10828 o superior). Es relevante para desarrolladores que necesitan un modelo ligero, de licencia Apache 2.0 y con capacidades multilingües uzbeko-inglés en entornos con recursos limitados.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face; no se han publicado detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Spark 2.5, presumiblemente transformer; no confirmado) |
| Parámetros totales | 4.112.079.360 (4,1 B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 4096`, pero no confirma el máximo entrenado) |
| Tipos de cuantización | Q4_K_M (2,42 GB); el repo incluye solo esa cuantización según la model card |
| Idiomas soportados | uzbeko (uz), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base original en BF16 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base (tipo de transformer, número de capas, dimensión de atención, uso de GQA, etc.). La etiqueta `spark2_5` sugiere que deriva de la familia Spark 2.5, pero no se detalla qué variante arquitectónica emplea. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

El único dato técnico concreto es la cuantización: la versión GGUF emplea Q4_K_M, un esquema de cuantización de 4 bits con mezcla de bloques K-quant, que reduce el modelo a 2,42 GB manteniendo un equilibrio entre calidad y tamaño. El modelo base está en BF16 y se enlaza desde la model card. No hay información sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional en uzbeko e inglés.
- Modelo "uncensored": el ajuste elimina filtros de contenido, lo que permite respuestas sin rechazos temáticos (con las implicaciones éticas y legales que ello conlleva).
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- Ejecutable en CPU mediante llama.cpp y Ollama.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking".

## Casos de uso

- Asistente conversacional en uzbeko sobre VPS de bajo coste: el modelo cabe en 8 GB de RAM en CPU y puede desplegarse con Ollama para atender consultas en uzbeko sin GPU, gracias a la cuantización Q4_K_M de 2,42 GB.
- Chatbot de atención al cliente para mercados de Asia Central: al soportar uzbeko e inglés, permite construir asistentes bilingües en entornos con infraestructura limitada, usando llama-server con contexto de 4096 tokens.
- Generación de contenido editorial sin restricciones temáticas: útil para investigación sobre modelos sin censura, redacción creativa o análisis de sesgos, donde se necesita que el modelo no rechace peticiones por políticas de contenido.
- Prototipado rápido en local: desarrolladores que quieran probar un LLM de 4 B en un portátil o servidor sin GPU pueden usar el GGUF con llama.cpp (build b10828+) y un comando de servidor HTTP.
- Traducción y adaptación de textos entre uzbeko e inglés: el modelo puede emplearse en pipelines de traducción asistida o localización de documentación, aunque no hay benchmarks que cuantifiquen su calidad.
- Fines educativos y de investigación lingüística: permite estudiar el comportamiento de modelos "uncensored" en una lengua de bajos recursos como el uzbeko, comparando respuestas con y sin filtros.
- Despliegue en entornos air-gapped: al ser un archivo GGUF autónomo y ligero, puede copiarse a máquinas sin conexión y ejecutarse con llama.cpp sin dependencias de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; la cuantización Q4_K_M ocupa 2,42 GB en disco y puede cargarse en RAM.
- RAM recomendada: 8 GB según la model card (para CPU VPS).
- GPU recomendadas: no se especifican; al ser GGUF, puede ejecutarse en GPU con llama.cpp si se dispone de ella, pero no hay datos de VRAM por capa.
- ¿Cabe en GPU de consumo? Sí, en teoría cualquier GPU con al menos 3-4 GB de VRAM podría cargar el GGUF Q4_K_M, aunque no se documenta oficialmente.
- Opciones de despliegue: Ollama (con `Modelfile`), llama.cpp (`llama-server`, build b10828+), y presumiblemente cualquier runtime compatible con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no disponibles; dependen del hardware y del número de hilos (`-t 4` en el ejemplo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales. Como referencia cualitativa, se puede comparar con otros modelos pequeños multilingües, pero sin cifras verificadas:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Uzbek-Uncensored-GGUF | 4,1 B | no disponible | uz, en | Apache 2.0 | GGUF |
| Qwen2.5-3B (referencia) | 3,1 B | 32 K (según documentación pública) | multilingüe | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B (referencia) | 3,2 B | 128 K (según documentación pública) | multilingüe | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B (referencia) | 2,6 B | 8 K (según documentación pública) | multilingüe | Gemma Terms | safetensors, GGUF |

Nota: los datos de los modelos de referencia provienen de documentación pública general y no de una comparación directa con este modelo; no hay benchmarks que permitan afirmar superioridad o inferioridad.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o dañino; su uso en producción exige moderación externa.
- Riesgo de alucinación: como todo LLM de 4 B, puede inventar datos, especialmente en dominios especializados y en uzbeko, lengua de bajos recursos.
- Idiomas limitados: solo uzbeko e inglés; no se garantiza un rendimiento aceptable en castellano u otras lenguas.
- Contexto no documentado: el ejemplo de llama.cpp usa 4096 tokens, pero se desconoce la ventana máxima entrenada; usar contextos mayores puede degradar la calidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; el modelo se distribuye "tal cual".
- Sin benchmarks: no hay evidencia publicada de calidad, por lo que no se recomienda para tareas críticas sin evaluación previa.
- Repositorio con 0 descargas y 0 likes: modelo muy reciente y sin validación comunitaria; posible falta de soporte.
- El modelo base en BF16 se enlaza pero no se detalla su procedencia ni los datos de entrenamiento, lo que dificulta evaluar sesgos.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/hogoraki/Spark-X2.6-4B-Uzbek-Uncensored-GGUF
- Modelo base (BF16): https://huggingface.co/hogoraki/Spark-X2.6-4B-Uzbek-Uncensored
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
