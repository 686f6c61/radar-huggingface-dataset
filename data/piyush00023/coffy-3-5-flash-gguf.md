# Piyush00023/coffy-3.5-flash-GGUF

## Resumen

coffy-3.5-flash es un modelo de lenguaje de tipo Sparse Mixture-of-Experts (MoE) con 19.062.813.696 parámetros totales, desarrollado por el usuario Piyush00023 y publicado bajo licencia Apache-2.0. El modelo sigue el formato estándar de la familia Qwen3-MoE (3 expertos, 2 activos por token, 36 capas), lo que permite su ejecución nativa en llama.cpp sin necesidad de código personalizado. Esta ficha documenta específicamente la versión cuantizada en GGUF, que ofrece una escalera completa de cuantizaciones desde 2 bits hasta F16.

La relevancia de esta publicación radica en que proporciona pesos pre-cuantizados listos para desplegar en entornos con recursos limitados, desde estaciones de trabajo con GPU de consumo hasta servidores de inferencia en CPU. El repositorio ocupa 126,2 GB e incluye ocho variantes de cuantización generadas con llama.cpp a partir de los shards oficiales en fp16 en safetensors.

Es importante señalar que la model card advierte de que las capas de identidad afinadas de las variantes densas no se trasladaron al ensamblaje MoE, por lo que el modelo puede autoidentificarse como "Qwen". El autor describe el modelo como "open weights, not open source" pese a la licencia Apache-2.0. La información disponible sobre datos de entrenamiento, benchmarks y capacidades detalladas es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (formato Qwen3-MoE), 36 capas, 3 expertos con 2 activos por token |
| Parámetros totales | 19.062.813.696 |
| Parámetros activos | No disponible (2 de 3 expertos activos por token, sin cifra exacta publicada) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K (7,22 GB), Q3_K_M (9,49 GB), IQ4_XS (10,43 GB), Q4_K_M (11,61 GB), Q5_K_M (13,63 GB), Q6_K (16,06 GB), Q8_0 (20,26 GB), F16 (38,13 GB) |
| Idiomas soportados | Inglés (en) y código (code) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base en safetensors fp16 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos dispersa (Sparse MoE) en el formato estándar de Qwen3-MoE: 36 capas, 3 expertos por capa y 2 expertos activos por token, con un total de 19.062.813.696 parámetros. La model card indica que el modelo fue construido ensamblando expertos de la familia Qwen3, y que las capas de identidad afinadas de las variantes densas no se transfirieron al ensamblaje MoE, lo que explica que el modelo pueda autoidentificarse como "Qwen".

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Las cuantizaciones GGUF se generaron con llama.cpp a partir de los shards oficiales fp16 en safetensors, y el build Q4_K_M fue probado en CPU generando texto coherente según la model card.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Generación y asistencia en código, dado el soporte declarado del idioma "code".
- Ejecución nativa en llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades de razonamiento, matemáticas, tool calling, function calling, agentes, visión o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas a inglés y código según los metadatos; no se documentan otros idiomas.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q4_K_M (11,61 GB) permite ejecutar el modelo en CPU con llama.cpp, adecuada para prototipos y pruebas de concepto locales.
- Asistencia de código en entornos con recursos limitados: con soporte declarado para el idioma "code", puede integrarse en editores o CLI mediante llama.cpp u Ollama para autocompletado y explicación de fragmentos.
- Inferencia en GPUs de consumo: las variantes Q2_K a Q4_K_M caben en GPUs con 8-12 GB de VRAM, lo que facilita su uso en equipos domésticos para generación de texto conversacional.
- Servidores de inferencia con CPU y mucha RAM: la variante Q8_0 (20,26 GB) o F16 (38,13 GB) puede servirse en máquinas con memoria abundante para cargas de baja concurrencia.
- Experimentación e investigación sobre MoE: al seguir el formato Qwen3-MoE estándar, sirve como base para estudiar el comportamiento de modelos MoE cuantizados sin escribir código específico.
- Integración en pipelines de generación de texto vía API compatible con endpoints: la etiqueta endpoints_compatible sugiere su uso detrás de servicios de inferencia estándar.
- Evaluación comparativa de cuantizaciones: la escalera completa de ocho variantes permite medir el impacto de la cuantización en calidad y latencia sobre un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K 7,22 GB; Q3_K_M 9,49 GB; IQ4_XS 10,43 GB; Q4_K_M 11,61 GB; Q5_K_M 13,63 GB; Q6_K 16,06 GB; Q8_0 20,26 GB; F16 38,13 GB (tamaños de fichero según la model card; el consumo real añade overhead de contexto y runtime).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las variantes Q2_K a Q4_K_M podrían caber en GPUs de consumo con 12-16 GB de VRAM, y Q5_K_M a Q8_0 en GPUs de 24 GB o superiores; F16 requeriría GPUs de 40-80 GB. Estas estimaciones se derivan de los tamaños de fichero, no de datos publicados por el autor.
- Cabe en GPU de consumo: probablemente sí para las cuantizaciones de 2 a 4 bits (7,22-11,61 GB), sujeto a la VRAM disponible y al tamaño de contexto.
- Opciones de despliegue: llama.cpp (llama-cli, llama-cpp-python), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. La model card solo confirma una prueba de humo en CPU con Q4_K_M que genera texto coherente.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto que permitan una comparación rigurosa con alternativas. A continuación se indican únicamente los datos objetivos conocidos del modelo frente a referencias de la misma familia de formato:

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| coffy-3.5-flash (GGUF) | 19,06 B (MoE) | No disponible | Apache-2.0 | GGUF | No disponibles |
| Modelo base coffy-3.5-flash | 19,06 B (MoE) | No disponible | Apache-2.0 | Safetensors fp16 | No disponibles |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Autoidentificación incorrecta: el modelo puede responder que es "Qwen", ya que las capas de identidad afinadas de las variantes densas no se trasladaron al ensamblaje MoE.
- Procedencia del ensamblaje: el modelo se construye ensamblando expertos de la familia Qwen3, lo que puede implicar comportamientos no documentados y dificulta la trazabilidad del entrenamiento.
- Idiomas limitados: solo se declaran inglés y código; no hay soporte documentado para castellano ni otros idiomas.
- Falta de documentación: no se publican datos de entrenamiento, benchmarks, longitud de contexto ni parámetros activos exactos, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de alucinación: no cuantificado en la información disponible; debe asumirse el riesgo habitual de los modelos de lenguaje, agravado por la ausencia de benchmarks.
- Licencia: Apache-2.0, pero el autor califica el modelo como "open weights, not open source"; conviene revisar el fichero LICENSE antes de un uso comercial.
- Uso en producción: sin benchmarks ni pruebas de estrés publicadas, no se recomienda su despliegue en producción sin una evaluación propia previa.
- Cuantizaciones agresivas: Q2_K y Q3_K_M pueden degradar la calidad de forma notable; solo Q4_K_M ha sido probada (en CPU) según la model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Piyush00023/coffy-3.5-flash-GGUF
- Modelo base: https://huggingface.co/Piyush00023/coffy-3.5-flash
- Licencia del modelo base: https://huggingface.co/Piyush00023/coffy-3.5-flash#license
- Contacto del autor: piyushdas000@gmail.com
