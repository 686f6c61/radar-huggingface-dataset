# mradermacher/aquif-3.5-3B-GGUF

## Resumen

Aquif-3.5-3B es un modelo de lenguaje de tipo transformer decoder-only desarrollado por aquif-ai, publicado originalmente en Hugging Face y distribuido aquí en formato GGUF por mradermacher. Con 2.667.471.400 parámetros totales (aproximadamente 2,67 mil millones), se posiciona en la categoría de modelos "small" y está orientado explícitamente a tareas de matemáticas y generación de código, según las etiquetas de la model card. Soporta diez idiomas: inglés, alemán, italiano, portugués, francés, hindi, español, tailandés, chino y japonés.

Este repositorio concreto no contiene los pesos originales en safetensors, sino una colección de cuantizaciones estáticas en formato GGUF generadas por mradermacher, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. La licencia Apache 2.0 facilita su uso comercial y su integración en productos derivados sin restricciones adicionales significativas.

La relevancia actual del modelo reside en su combinación de tamaño reducido, cobertura multilingüe amplia y licencia permisiva, lo que lo hace adecuado para despliegues en el borde (edge), entornos con recursos limitados y aplicaciones donde el coste de inferencia es un factor crítico. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y resultados de benchmarks es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (deducido de la libreria transformers y del pipeline de text-generation; detalles internos no disponibles) |
| Parametros totales | 2.667.471.400 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estaticas); versiones con imatrix en repositorio separado i1-GGUF |
| Idiomas soportados | en, de, it, pt, fr, hi, es, th, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base aquif-ai/aquif-3.5-3B) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de lo que se deduce de las etiquetas del repositorio: se trata de un modelo de lenguaje basado en transformers, orientado a generación de texto y conversación, con especial énfasis declarado en matemáticas y programación. El número exacto de capas, dimensión oculta, número de cabezas de atención y mecanismo de atención (MHA, GQA, etc.) no está disponible en la información proporcionada.

Tampoco se conoce el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card del repositorio GGUF es una plantilla estándar de mradermacher que no incluye detalles del entrenamiento del modelo original; únicamente referencia el modelo base aquif-ai/aquif-3.5-3B como origen de los pesos. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) carecería de respaldo documental y por tanto no se incluye.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational" del repositorio.
- Razonamiento matemático y resolución de problemas cuantitativos, según la etiqueta "math".
- Generación y asistencia en programación, según la etiqueta "coding".
- Soporte multilingüe en diez idiomas: inglés, alemán, italiano, portugués, francés, hindi, español, tailandés, chino y japonés.
- Compatibilidad con text-generation-inference (etiqueta "text-generation-inference") y con endpoints compatibles (etiqueta "endpoints_compatible").
- Ejecución local mediante llama.cpp y herramientas que consumen GGUF (Ollama, LM Studio, etc.).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia a la programación en local: el modelo puede generar fragmentos de código y explicar errores en un portátil con GPU de consumo, gracias a sus cuantizaciones Q4_K_M de 1,7 GB que caben en 4-6 GB de VRAM. Adecuado para entornos de desarrollo sin conexión o con requisitos de privacidad estrictos.
- Tutoría de matemáticas en aplicaciones educativas: su orientación declarada hacia matemáticas permite resolver ejercicios paso a paso y explicar procedimientos en varios idiomas, desplegable en servidores modestos con CPU o GPU integrada.
- Atención al cliente multilingüe en mercados europeos y asiáticos: la cobertura de diez idiomas permite atender consultas en español, francés, alemán, italiano, portugués, hindi, tailandés, chino y japonés desde una única instancia, reduciendo la infraestructura frente a soluciones monolingües.
- Prototipado rápido de chatbots: con cuantizaciones Q4_K_S de 1,7 GB, se puede levantar un endpoint compatible con la API de OpenAI en minutos mediante llama.cpp u Ollama, ideal para validar productos antes de invertir en modelos mayores.
- Procesamiento de texto en el borde (edge computing): su tamaño reducido permite integrarlo en dispositivos con recursos limitados (Raspberry Pi 5 con 8 GB, mini-PC, portátiles sin GPU dedicada) para tareas de resumen, clasificación o extracción de información.
- Generación de documentación técnica multilingüe: el modelo puede redactar y traducir documentación entre los diez idiomas soportados, útil en equipos distribuidos que necesitan mantener manuales coherentes en varios mercados.
- Filtrado y enriquecimiento de datos en pipelines de datos: al ser ligero, puede ejecutarse en paralelo sobre lotes grandes para tareas de etiquetado, normalización o generación de pares pregunta-respuesta sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se han proporcionado datos del modelo base que permitan elaborar una tabla comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~1,2 GB de pesos, ~2 GB de VRAM en total con contexto moderado.
  - Q3_K_M / Q3_K_L: ~1,5-1,6 GB de pesos, ~2,5 GB de VRAM.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~1,6-1,7 GB de pesos, ~3 GB de VRAM.
  - Q5_K_M: ~2,0 GB de pesos, ~3,5 GB de VRAM.
  - Q6_K: ~2,3 GB de pesos, ~4 GB de VRAM.
  - Q8_0: ~2,9 GB de pesos, ~4,5 GB de VRAM.
  - f16: ~5,4 GB de pesos, ~6,5 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM puede ejecutar las cuantizaciones Q4 y Q5 con holgura (RTX 3060 6 GB, RTX 4060 8 GB, RTX 4090 24 GB para f16 con contexto largo). En el ámbito profesional, A100 y H100 no son necesarias para este tamaño, pero permiten mayor throughput por batching.
- ¿Cabe en GPU consumer? Sí, en todas las cuantizaciones habituales (Q4_K_M en adelante) sobre GPUs con 6 GB o más. Las cuantizaciones Q2_K y Q3_K también caben en iGPUs y APUs con memoria unificada.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, text-generation-inference (para el modelo base en safetensors), vLLM (modelo base), y servidores compatibles con la API de OpenAI mediante llama-server.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 2,67 mil millones de parámetros, la latencia será baja en GPU consumer (del orden de decenas de tokens por segundo en Q4_K_M sobre una RTX 4060), pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| aquif-3.5-3B (este) | 2,67 B | no disponible | 10 | Apache 2.0 | GGUF, safetensors (base) |
| Qwen2.5-3B | 3,09 B | 32.768 tokens | ~29 | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-3B | 3,21 B | 131.072 tokens | 8 | Llama 3.2 Community License | GGUF, safetensors |
| Phi-3.5-mini | 3,82 B | 131.072 tokens | ~20 | MIT | GGUF, safetensors |

La comparación se ofrece a título orientativo por categoría de tamaño; no se dispone de datos de rendimiento del modelo Aquif que permitan comparaciones cuantitativas con estas alternativas. La ventaja principal de Aquif-3.5-3B frente a Llama-3.2-3B es la licencia Apache 2.0 (frente a la licencia comunitaria de Meta, con restricciones para grandes despliegues), y frente a Qwen2.5-3B su menor número de parámetros con cobertura de diez idiomas. La desventaja es la falta de documentación pública sobre contexto, entrenamiento y benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo entrenado con datos web, es probable que herede sesgos sociales, culturales y lingüísticos, pero no se han publicado evaluaciones al respecto.
- Riesgo de alucinación: no cuantificado. En modelos de 3B parámetros el riesgo de fabricar hechos, citas o APIs inexistentes es significativamente mayor que en modelos de mayor tamaño; se recomienda validación humana en aplicaciones críticas.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos. Aunque se listan diez idiomas, no se ha publicado la calidad relativa por idioma; el rendimiento en hindi, tailandés o japonés podría ser inferior al de inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías. No obstante, conviene revisar la licencia del modelo base aquif-ai/aquif-3.5-3B por si hubiera condiciones adicionales no reflejadas en este repositorio derivado.
- Caveat para producción: la ausencia de benchmarks, de documentación de arquitectura y de longitud de contexto dificulta la evaluación formal del modelo. Se recomienda ejecutar una evaluación propia sobre el dominio objetivo antes de adoptarlo en producción.
- El repositorio GGUF tiene un número muy bajo de descargas (341) y cero likes en el momento de la consulta, lo que sugiere una adopción limitada y escasa validación por parte de la comunidad.
- Las cuantizaciones Q2_K y Q3_K_M reducen notablemente la calidad (el propio autor marca Q3_K_M como "lower quality"); para uso en producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/aquif-3.5-3B-GGUF
- Modelo base: https://huggingface.co/aquif-ai/aquif-3.5-3B
- Cuantizaciones con imatrix (i1-GGUF): https://huggingface.co/mradermacher/aquif-3.5-3B-i1-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#aquif-3.5-3B-GGUF
- Guía de uso de GGUF (TheBloke, referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Graph comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
