# mradermacher/One-For-All-4B-i1-GGUF

## Resumen

One-For-All-4B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo TendieLabs/One-For-All-4B, un ajuste fino (LoRA) sobre una base Qwen3.5-4B orientado a personificación y roleplay, en concreto al personaje de My Hero Academia que da nombre al modelo. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF optimizadas con imatrix para su uso en llama.cpp y ecosistemas compatibles. El modelo tiene 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) y está pensado para ejecutarse en hardware de consumo.

La relevancia de esta ficha radica en que combina dos elementos: por un lado, un modelo de rol y personaje afinado sobre una arquitectura reciente (etiquetada como qwen3_5), y por otro, un conjunto amplio de cuantizaciones que van desde 1,5 GB (IQ1_S) hasta 3,6 GB (Q6_K), lo que permite desplegarlo en GPU de gama baja o incluso en CPU. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el modelo base y los datos de entrenamiento condicionan las garantías reales.

El repositorio ocupa 53,4 GB e incluye el fichero imatrix y todas las variantes de cuantización generadas con ese dataset de importancia. La información pública disponible sobre el modelo base es escasa: no se detallan composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks, por lo que esta ficha se limita a lo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B, según etiqueta qwen3_5); ajuste LoRA sobre el modelo base |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas en formato i1 con imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (enlazada a la licencia de Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base está en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste LoRA sobre TendieLabs/One-For-All-4B, que a su vez se apoya en una base Qwen3.5-4B según la etiqueta `qwen3_5` y el enlace de licencia al repositorio Qwen/Qwen3.5-4B. Se trata, por tanto, de un transformer decoder-only de aproximadamente 4,2 mil millones de parámetros, no de una arquitectura MoE ni híbrida. El ajuste LoRA está orientado a personificación (persona) y roleplay, con temática de My Hero Academia, lo que sugiere un dataset de diálogos y descripciones de personaje, aunque no se publica su composición ni el número de tokens.

No hay información sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.) más allá de las propias de la arquitectura base. Las cuantizaciones i1 de mradermacher emplean un fichero imatrix generado a partir de datos de calibración, lo que mejora la calidad respecto a cuantizaciones estáticas de tamaño similar, especialmente en los rangos bajos (IQ2, IQ3).

## Capacidades

- Generación de texto conversacional y de rol, con énfasis en mantener una persona concreta (el personaje One For All de My Hero Academia).
- Roleplay multi-turno: el ajuste LoRA está específicamente entrenado para interpretar al personaje, incluyendo estilo, tono y vocabulario.
- Capacidades heredadas de la base Qwen3.5-4B: razonamiento general, código y matemáticas básicas, aunque no se documentan formalmente para este ajuste.
- Soporte de tool calling / function calling: no confirmado en la información disponible; depende de la base y del ajuste, pero no se garantiza.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Multilingüe: limitado a inglés según la model card.
- Visión: la model card de las cuantizaciones indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático; no se confirma que el ajuste conserve capacidades visuales.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Roleplay y entretenimiento conversacional: el modelo está afinado para interpretar a un personaje concreto, por lo que encaja en chatbots de rol, ficción interactiva y comunidades de fan-fiction que buscan respuestas coherentes con la persona.
- Prototipado de asistentes con personalidad fija: útil para probar interfaces de chat donde la consistencia de tono y estilo es el requisito principal, usando cuantizaciones Q4_K_M (2,8 GB) en GPU de consumo.
- Despliegue en hardware limitado: las variantes IQ2 e IQ3 (1,6-2,3 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada o en Raspberry Pi de gama alta mediante llama.cpp, a costa de calidad.
- Generación de diálogos para guiones y narrativa: con contexto suficiente (no documentado), puede producir intercambios multi-turno para borradores de cómic o fan-fiction, siempre con revisión humana.
- Evaluación de técnicas de cuantización: el repositorio ofrece 25 variantes del mismo modelo, lo que lo convierte en un banco de pruebas para medir el impacto de IQ1 a Q6_K en calidad de salida conversacional.
- Investigación sobre ajustes LoRA de personaje: sirve como caso de estudio de cómo un LoRA sobre una base de 4B especializa el modelo en una persona concreta, comparando con el modelo base sin ajustar.
- Integración en pipelines de generación de contenido: mediante la API compatible con endpoints indicada en los tags, se puede invocar desde servicios que necesiten respuestas con estilo de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB (IQ1_S) y 3,6 GB (Q6_K) solo para los pesos; añadir overhead de contexto y KV cache, típicamente 0,5-2 GB adicionales según longitud de contexto y backend.
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM es suficiente para las cuantizaciones Q4-Q6; RTX 3060, RTX 4060, RTX 4090 o A100 funcionan sin problema. Para IQ1-IQ3 basta con 2-3 GB.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; incluso en iGPU y CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF; los tags indican compatibilidad con endpoints. Para el modelo base en transformers se requiere el repositorio original.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del backend, la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| One-For-All-4B-i1-GGUF | 4,2B | No disponible | Apache 2.0 | GGUF (25 cuantizaciones) | Ajuste LoRA de personaje sobre Qwen3.5-4B |
| Qwen3.5-4B (base) | ~4B | No disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista sin ajuste de personaje |
| TendieLabs/One-For-All-4B | 4,2B | No disponible | Apache 2.0 | transformers/safetensors | Modelo original antes de cuantizar |
| Alternativas de rol de ~4B | No disponible | No disponible | Variable | Variable | No se dispone de datos verificables de benchmarks para comparar rendimiento |

No se dispone de resultados de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste de personaje sobre una base generalista, puede heredar sesgos del modelo base y del dataset de rol, no auditados públicamente.
- Riesgo de alucinación: alto en un modelo de 4B orientado a roleplay; no debe usarse como fuente de información factual sin verificación.
- Limitaciones de contexto e idioma: solo inglés según la model card; la longitud de contexto no está documentada y puede verse reducida por el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia enlaza a la de Qwen3.5-4B; conviene revisar los términos del modelo base y de los datos de entrenamiento del LoRA, no publicados.
- Caveats para producción: no hay benchmarks ni evaluación de calidad publicada; las cuantizaciones IQ1 e IQ2 degradan notablemente la coherencia; el modelo está especializado en un personaje concreto y no es adecuado como asistente general.
- La etiqueta de visión en la model card no está confirmada para este ajuste; los ficheros mmproj, si existen, están en el repositorio estático, no en el de cuantizaciones i1.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/One-For-All-4B-i1-GGUF
- Modelo base: https://huggingface.co/TendieLabs/One-For-All-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/One-For-All-4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#One-For-All-4B-i1-GGUF
- Licencia del modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
