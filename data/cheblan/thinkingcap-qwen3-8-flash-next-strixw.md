# Cheblan/ThinkingCap-Qwen3.8-Flash-Next-strixw

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-strixw es una conversión cuantizada del modelo bottlecapai/ThinkingCap-Qwen3.8-Flash-Next, un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de la arquitectura Qwen3.8-Flash-Next de Alibaba Cloud. Esta variante, publicada por el usuario Cheblan, se distribuye en el formato propietario `.strixw` para el motor de inferencia Strixite, optimizado específicamente para APUs AMD Strix Halo (Ryzen AI Max+ 395, gfx1151) con memoria unificada de 128 GB LPDDR5X.

El modelo combina una columna vertebral MoE de 125B parámetros con 512 expertos de grano fino (10 activos por token, ~6B parámetros activos), una tabla PLE de n-gramas de 51B parámetros para indexación recurrente, un módulo de predicción multi-token (MTP) de 4B parámetros y una torre de visión multimodal. En total suma 180B parámetros con una ventana de contexto de hasta 262.144 tokens. La arquitectura híbrida alterna 36 capas recurrentes Gated Delta Net con 12 capas de atención completa.

Su relevancia radica en dos factores: por un lado, el post-entrenamiento de ThinkingCap reduce los tokens de razonamiento interno en un 38,5% de media manteniendo aproximadamente un 88,8% de precisión macro, lo que abarata la inferencia en tareas agénticas y de código; por otro, esta conversión demuestra que es viable ejecutar un modelo de 180B parámetros en hardware consumer de gama alta con memoria unificada, alcanzando 50-70 tokens/s de decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con 36 capas Gated Delta Net (recurrentes) y 12 capas de atención completa; incluye tabla PLE de n-gramas, módulo MTP y torre de visión |
| Parametros totales | 180B (125B MoE + 51B tabla PLE n-gram + 4B MTP) |
| Parametros activos | ~6B por token (10 de 512 expertos activos) |
| Longitud de contexto | Hasta 262.144 tokens (con pre-reserva estática de K/V) |
| Tipos de cuantizacion | Mixta Q4/Q8: expertos MoE en q4g128 (gu/down) y q8g64 (sh_gu/sh_down); GDN en q4g128 (in) y q8g64 (out); atención QKV/O y LM head en q8g64; embeddings en BF16; caché K/V en q8 |
| Idiomas soportados | en, zh, ru |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | `.strixw` (formato nativo del motor Strixite); safetensors como tag del repo |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina 36 capas recurrentes Gated Delta Net (atención lineal con estado recurrente) con 12 capas de atención completa, distribuidas en 48 capas totales. La columna vertebral MoE emplea 512 expertos de grano fino con 10 activos por token, lo que resulta en aproximadamente 6B parámetros activos sobre un total de 125B en el backbone. A esto se suma una tabla PLE (Pre-trained Lookup Embeddings) de n-gramas de 51B parámetros con vocabulario base de 20 millones, orientada a indexación recurrente de alta velocidad, y un módulo MTP de 4B parámetros que realiza borradores especulativos de hasta 7 tokens por adelantado.

El post-entrenamiento de ThinkingCap, según la model card, está orientado a reducir los tokens de razonamiento interno en un 38,5% de media conservando un 88,8% de precisión macro, lo que se traduce en menor coste y latencia en tareas de razonamiento y código agéntico. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni la metodología exacta de RLHF/DPO en la información proporcionada. La innovación técnica destacable de esta variante es la cuantización mixta Q4/Q8 por componente (expertos a Q4, atención y LM head a Q8) junto con la decodificación especulativa MTP y el soporte de pre-reserva estática de K/V para contexto completo.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento interno optimizado (ThinkingCap reduce tokens de pensamiento un 38,5% manteniendo ~88,8% de precisión macro).
- Capacidad multimodal de visión e imagen mediante la torre de visión incluida (`vision.strixw`).
- Decodificación especulativa con MTP de 7 borradores por paso para acelerar la generación.
- Soporte de prompt caching en RAM y NVMe con checkpoints y deltas incrementales.
- Capacidades multilingües limitadas a inglés, chino y ruso según la model card.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: orientado según la model card a tareas agénticas de código y razonamiento.
- Atención lineal (GDN) para eficiencia en secuencias largas.

## Casos de uso

- Asistente de código agéntico en local: el modelo puede ejecutar tareas de generación y refactorización de código con razonamiento reducido (38,5% menos tokens de pensamiento), lo que abarata el coste por tarea en un equipo de desarrollo que despliegue Strixite sobre un Ryzen AI Max+ 395.
- Análisis de documentos largos: con 262.144 tokens de contexto y pre-reserva estática de K/V, permite procesar informes, contratos o bases de código completas en una sola pasada sin truncamiento.
- Procesamiento de documentación técnica con imágenes: la torre de visión permite extraer información de diagramas, capturas de pantalla y figuras en manuales, combinándola con el razonamiento textual.
- Servidor de inferencia personal o de equipo pequeño: con 3 slots concurrentes y capacidad total de 786.432 tokens configurada en el ejemplo de la model card, puede atender a varios usuarios simultáneamente en una única máquina de 128 GB.
- Investigación en eficiencia de inferencia: la combinación de MoE disperso, GDN, MTP y cuantización mixta Q4/Q8 lo convierte en una plataforma para estudiar trade-offs de precisión, latencia y memoria en hardware AMD.
- Traducción y asistencia multilingüe en inglés, chino y ruso: adecuado para flujos de trabajo que requieran estos tres idiomas, con la salvedad de que no cubre castellano.
- Chatbot de atención al cliente con historial largo: el prompt caching persistente en RAM y NVMe permite reutilizar contexto de conversaciones previas y reducir la latencia en interacciones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas del post-entrenamiento de ThinkingCap: reducción del 38,5% en tokens de razonamiento interno y retención de ~88,8% de precisión macro, sin detallar los conjuntos de evaluación empleados.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 123,5 GB en total; los pesos principales (`weights.strixw`) son ~66 GB, la tabla n-gram (`ngram.table`) ~49 GB y la torre de visión ~857 MB. Se requiere un sistema con 128 GB de memoria unificada.
- Hardware objetivo: AMD Ryzen AI Max+ 395 o Ryzen AI Max 390 (Strix Halo, gfx1151, 40 CUs RDNA 3.5) con 128 GB LPDDR5X-8533.
- No cabe en GPUs consumer convencionales (RTX 4090, etc.) por el tamaño conjunto de pesos y tabla n-gram.
- Runtime: ROCm 6.3+ y kernel Linux 6.12+.
- Motor de despliegue: Strixite (`strix_server`); no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Rendimiento: 50-70+ tokens/s de decodificación según la model card en Ryzen AI Max+ 395.
- Configuración de serving: 3 slots concurrentes, capacidad de 262.144 tokens por slot y 786.432 tokens totales, caché K/V en q8, chunk de 16.384 y chunk compartido de 2.048.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-strixw | 180B (125B MoE + 51B PLE + 4B MTP) | ~6B | 262.144 | Qwen Community License 1.0 | Solo formato `.strixw` para Strixite/AMD Strix Halo |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next (base) | 180B | ~6B | no disponible en la información | Qwen Community License 1.0 | Pesos originales en HuggingFace |
| Qwen/Qwen3.8-Flash-Next (arquitectura subyacente) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés, chino y ruso; no hay soporte declarado de castellano.
- Dependencia de hardware y software muy específicos: requiere APU AMD Strix Halo, ROCm 6.3+, kernel 6.12+ y el motor Strixite; no es portable a otros backends según la información disponible.
- Formato propietario `.strixw`: no compatible con ecosistemas estándar como safetensors, GGUF o vLLM.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no se documentan sesgos conocidos en la model card.
- Licencia Qwen Community License 1.0: uso gratuito para investigación, personal y comercial por debajo de 100M de MAU y 20M USD de ingresos mensuales; el hosting comercial como Model-as-a-Service y el uso como asistente principal de código requieren acuerdo con Alibaba/Qwen.
- La cuantización mixta Q4/Q8 puede degradar la precisión respecto a los pesos originales en BF16; no se reportan evaluaciones comparativas de calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- El modelo base es un post-entrenamiento de terceros (BottleCap AI) sobre arquitectura Qwen; la variante aquí descrita es una conversión de un usuario independiente (Cheblan), no oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Cheblan/ThinkingCap-Qwen3.8-Flash-Next-strixw
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Motor de inferencia Strixite: https://github.com/strix-infer/strixite
- Licencia: https://huggingface.co/Cheblan/ThinkingCap-Qwen3.8-Flash-Next-strixw/blob/main/LICENSE
- Arquitectura subyacente (referencia en model card): Qwen/Qwen3.8-Flash-Next (sin enlace directo en la información disponible)
