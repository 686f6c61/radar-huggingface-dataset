# 360ZhiNao/Light-R1-14B-DS-GGUF

## Resumen

Light-R1-14B-DS-GGUF es la versión cuantizada en formato GGUF del modelo Light-R1-14B-DS, desarrollado originalmente por Qihoo 360 (identificador `qihoo360` en Hugging Face). El modelo base está especializado en razonamiento matemático y se presenta como un modelo de 14.770 millones de parámetros (14,77 B) orientado a tareas de resolución de problemas y razonamiento de cadena larga. Esta versión GGUF la publica el usuario 360ZhiNao y su objetivo es facilitar el despliegue en entornos locales con llama.cpp y herramientas compatibles, reduciendo los requisitos de memoria respecto a los pesos completos.

La relevancia de esta ficha radica en que permite ejecutar un modelo de razonamiento de casi 15 B en hardware de consumo mediante cuantización int4 e int8, manteniendo una calidad cercana al modelo original. La model card del autor incluye resultados comparativos en los benchmarks AIME24 y AIME25 para las distintas cuantizaciones, lo que aporta una referencia útil sobre la pérdida de precisión asociada a cada nivel de compresión.

No se dispone de información detallada sobre la arquitectura interna, el contexto máximo ni los datos de entrenamiento en la documentación proporcionada; esta ficha se limita a los datos verificables del repositorio y de la model card, e indica explícitamente "no disponible" en los campos que no se han podido confirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de razonamiento, sin detalle publicado en la información disponible) |
| Parámetros totales | 14.770.033.664 (14,77 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (Q4_0), int8 (Q8_0), q4-k-m (Q4_K_M); formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 33,2 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `qihoo360/Light-R1-14B-DS`. Por el nombre y la familia (Light-R1) se trata de un modelo de razonamiento de tipo transformer denso, pero no se han publicado en esta documentación datos sobre número de capas, atención, tipo de positional encoding ni innovaciones concretas. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo orientado a razonamiento.

Lo que sí está documentado es el proceso de cuantización: el autor publica tres variantes GGUF (Q4_0, Q8_0 y Q4_K_M) y compara su rendimiento con el modelo original en AIME24 y AIME25. Esta comparación es el principal dato técnico disponible sobre el impacto de la compresión en la capacidad de razonamiento.

## Capacidades

- Generación de texto y razonamiento de cadena larga, orientado a problemas matemáticos y de lógica.
- Resolución de problemas de competición (AIME), según los benchmarks publicados.
- Inferencia local mediante llama.cpp y ecosistema GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Uso conversacional (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita, aunque el perfil de razonamiento del modelo base lo hace plausible; no confirmado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Resolución de problemas matemáticos en local: el modelo puede utilizarse para resolver ejercicios de nivel competición (AIME) en una máquina con GPU de consumo, gracias a las cuantizaciones int4 e int8 que reducen el peso a un rango manejable.
- Asistente de estudio de matemáticas: integrado en una aplicación de escritorio mediante llama.cpp, permite generar explicaciones paso a paso de problemas, con la ventaja de que los datos no salen del equipo.
- Evaluación de pipelines de razonamiento: sirve como modelo de referencia para comparar la pérdida de precisión entre cuantizaciones (Q4_0, Q8_0, Q4_K_M) en tareas de razonamiento, tal como documenta el autor.
- Prototipado sin conexión: al ser GGUF, se puede desplegar en entornos aislados o sin acceso a la nube, útil para investigación y docencia.
- Generación de datos sintéticos de razonamiento: el modelo puede producir cadenas de razonamiento para entrenar o evaluar otros modelos más pequeños, siempre que se valide la calidad de las salidas.
- Integración en herramientas de línea de comandos: mediante llama.cpp u Ollama, se puede incorporar a scripts de resolución de problemas y automatización de tareas analíticas.
- Despliegue en servidores modestos: la variante Q4_K_M permite servir el modelo en infraestructura con VRAM limitada, aunque no se dispone de datos de latencia ni throughput.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (AIME24 y AIME25):

| Modelo | AIME24 | AIME25 |
|---|---|---|
| Light-R1-14B-DS (original) | 74,0 | 60,2 |
| Light-R1-14B-DS-Q4_0.gguf (int4) | 70,1 | 54,9 |
| Light-R1-14B-DS-Q8_0.gguf (int8) | 71,9 | 59,4 |
| Light-R1-14B-DS-Q4-KM.gguf (q4-k-m) | 70,0 | 61,3 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 14,77 B en GGUF ocupa aproximadamente 8-9 GB en Q4_0/Q4_K_M y en torno a 15-16 GB en Q8_0, sin contar el espacio para el contexto KV.
- GPU recomendadas: no disponible en la documentación. Por tamaño, una RTX 4090 (24 GB) puede alojar las variantes Q4 y Q8; una RTX 3090 o 4080 (16 GB) resulta ajustada para Q8 y holgada para Q4.
- Cabe en GPU de consumo: sí, previsiblemente en las variantes Q4_0 y Q4_K_M en tarjetas de 12-16 GB; Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama y otras herramientas compatibles con GGUF; el tag `endpoints_compatible` sugiere soporte de endpoints de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| Light-R1-14B-DS-GGUF (este) | 14,77 B | no disponible | Apache 2.0 | GGUF | AIME24 70,1-71,9; AIME25 54,9-61,3 (según cuantización) |
| Light-R1-14B-DS (base) | 14,77 B | no disponible | Apache 2.0 | safetensors (presumible) | AIME24 74,0; AIME25 60,2 |
| Otras alternativas de razonamiento de ~14 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización degrada el rendimiento: en AIME25, Q4_0 baja de 60,2 a 54,9 respecto al original, una pérdida notable para tareas de razonamiento.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de razonamiento; no se han publicado evaluaciones de fiabilidad factual.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés (y posiblemente del chino, dado el origen del modelo base) es desconocido.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `qihoo360/Light-R1-14B-DS` por si añade restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente y poco validada por la comunidad.
- No se han publicado datos de latencia, throughput ni requisitos oficiales de hardware.

## Enlaces

- Repositorio GGUF: https://huggingface.co/360ZhiNao/Light-R1-14B-DS-GGUF
- Modelo base: https://huggingface.co/qihoo360/Light-R1-14B-DS
