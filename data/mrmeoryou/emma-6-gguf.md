# MrMeOrYou/emma-6-GGUF

## Resumen

Emma-6 es un modelo de lenguaje causal de tipo transformer decoder-only desarrollado por Egomnia S.p.A., una empresa italiana, y orientado específicamente al idioma italiano. Este repositorio, `MrMeOrYou/emma-6-GGUF`, es una conversión no oficial a formato GGUF realizada con llama.cpp a partir del export oficial en ONNX FP32 del modelo original `egomnia/emma-6`. El modelo cuenta con 1.548.879.872 parámetros (aproximadamente 1,55 mil millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para despliegue local.

La relevancia de esta ficha radica en que se trata de una de las pocas alternativas abiertas centradas exclusivamente en italiano, un idioma con menor representación en el ecosistema de modelos abiertos que el inglés o el castellano. La conversión GGUF permite ejecutar el modelo en llama.cpp sin modificaciones, con una plantilla de chat y parámetros de muestreo embebidos en el propio archivo, lo que simplifica su integración en herramientas locales.

El repositorio incluye un amplio abanico de cuantizaciones, desde F32 hasta Q2_K, con verificaciones de reproducibilidad byte a byte y comparación de logits frente al modelo ONNX original (diferencia máxima de 2,4e-4). La licencia es OpenRAIL y el modelo base está disponible en Hugging Face bajo el identificador `egomnia/emma-6`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y SwiGLU |
| Parametros totales | 1.548.879.872 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (según los ejemplos de ejecución de la model card) |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, Q2_K, MXFP4_MOE (equivalente a Q8_0); TQ2_0, TQ1_0 y Q1_0 no utilizables |
| Idiomas soportados | Italiano (it) |
| Licencia | OpenRAIL |
| Formato de pesos | GGUF (safetensors como dato de referencia del modelo base) |

## Arquitectura y entrenamiento

Emma-6 emplea una arquitectura transformer decoder-only con atención de consultas agrupadas (GQA) y activación SwiGLU, según los tags del repositorio. El tokenizador es SentencePiece (archivo `bpe.model`). El modelo no incorpora capas de mezcla de expertos (MoE), como confirma explícitamente la model card al señalar que el archivo `MXFP4_MOE` es en la práctica equivalente a Q8_0. Los pesos se convirtieron sin pérdida desde el export oficial FP32 en ONNX, con dos adaptaciones técnicas para la arquitectura `llama` de llama.cpp: la permutación de las proyecciones Q y K del layout half-split (GPT-NeoX) al interleaved (GPT-J), y la reutilización de los embeddings atados (`token_embd` como capa de salida, ya que el `lm_head` de ONNX es bit-idéntico al embedding de tokens).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio GGUF no detalla el proceso de entrenamiento del modelo original; únicamente se documenta el proceso de conversión y verificación. Se verificó que los logits coinciden con el modelo ONNX original dentro de 2,4e-4 hasta 2601 tokens de contexto, que la generación greedy es idéntica token a token y que el sampler de llama.cpp reproduce la distribución de muestreo de referencia.

## Capacidades

- Generación de texto conversacional en italiano, con plantilla de chat embebida en el archivo GGUF.
- Razonamiento y respuesta a preguntas en italiano (el ejemplo de la model card es "Qual è la capitale d'Italia?").
- Conversación multi-turno mediante los tokens especiales `<|system|>`, `<|user|>` y `<|assistant|>`.
- Soporte de servidor compatible con la API de OpenAI mediante `llama-server`.
- Inferencia en CPU y GPU (con `-ngl 99` para cargar capas en GPU).
- Parámetros de muestreo por defecto embebidos en el archivo (`general.sampling.*`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al italiano según los metadatos del repositorio.

## Casos de uso

- Asistencia conversacional en italiano para atención al cliente: el modelo puede gestionar diálogos multi-turno con hasta 4096 tokens de contexto, suficiente para conversaciones de soporte típicas, y su plantilla de chat embebida simplifica el despliegue en `llama-server` con API compatible con OpenAI.
- Despliegue local en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en CPU con llama.cpp, adecuado para prototipos y entornos con recursos limitados.
- Generación de texto en italiano para aplicaciones editoriales o de contenido: el modelo está entrenado específicamente para italiano, lo que puede ofrecer mejor fluidez que modelos multilingües genéricos en tareas de redacción.
- Chatbot integrado en aplicaciones de escritorio o móviles: el formato GGUF y la compatibilidad con llama.cpp facilitan la inclusión del modelo en aplicaciones locales sin dependencia de servicios en la nube.
- Experimentación e investigación sobre modelos pequeños en italiano: el repositorio documenta con detalle el proceso de conversión, verificación de logits y reproducibilidad de cuantizaciones, lo que lo convierte en un caso de estudio útil para quienes trabajan con conversión ONNX a GGUF.
- Evaluación comparativa de cuantizaciones: la disponibilidad de 24 variantes de cuantización con verificaciones de perplejidad (127,6 para F32 frente a más de 170.000 para TQ2_0) permite estudiar el impacto de la precisión en modelos pequeños.
- Servicio de preguntas y respuestas simple en italiano: con prompts directos y contexto corto, el modelo puede responder consultas factuales básicas, como se ilustra en el ejemplo de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento documentada es la perplejidad sobre un texto de referencia en italiano: 127,6 para el archivo F32 y superior a 170.000 para las cuantizaciones TQ2_0, TQ1_0 y Q1_0 (no utilizables). También se documenta una diferencia máxima de logits de 2,4e-4 frente al modelo ONNX original hasta 2601 tokens de contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1,55 mil millones de parámetros, las cuantizaciones de 4 bits (Q4_K_M) ocupan aproximadamente entre 1 y 1,5 GB, mientras que F32 requeriría alrededor de 6 GB solo para los pesos.
- GPU recomendadas: no especificadas en la información disponible. El modelo es lo suficientemente pequeño para ejecutarse en GPU de consumo, aunque la model card no detalla modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones de 4-5 bits, aunque este dato no está confirmado en la documentación.
- Opciones de despliegue: llama.cpp (verificado con la release b12012), `llama-cli`, `llama-server` con API compatible con OpenAI. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tamaño o tarea similar, ni datos de rendimiento que permitan establecer una comparativa fundamentada.

## Limitaciones y advertencias

- El modelo está orientado exclusivamente al italiano; no se documenta soporte de otros idiomas, lo que limita su uso en entornos multilingües.
- Las cuantizaciones TQ2_0, TQ1_0 y Q1_0 no son utilizables: producen texto sin sentido con perplejidad superior a 170.000. La cuantización mínima utilizable es Q2_K.
- El repositorio es una conversión no oficial no afiliada a Egomnia S.p.A.; la autoría y los derechos del modelo original pertenecen a dicha empresa.
- La plantilla de chat no fue publicada oficialmente por el autor original; fue reconstruida empíricamente y posteriormente confirmada por Egomnia, según la model card.
- El prompt de sistema oficial del servicio de Egomnia (aproximadamente 95 tokens) está reservado; el repositorio incluye una versión alternativa para uso local que reproduce solo parte del comportamiento original.
- La licencia OpenRAIL puede imponer restricciones de uso; no se detallan en la información disponible las cláusulas específicas para uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje de pequeño tamaño; no se documentan evaluaciones específicas de fidelidad factual.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo original.
- El contexto máximo documentado en los ejemplos es de 4096 tokens; no se especifica si el modelo soporta ventanas mayores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/MrMeOrYou/emma-6-GGUF
- Modelo base: https://huggingface.co/egomnia/emma-6
- Commit del export ONNX utilizado: https://huggingface.co/egomnia/emma-6/tree/2664c31400e354ac4a6719fce0030a92efe81cce
- Discusión sobre la plantilla de chat y prompt de sistema: https://huggingface.co/egomnia/emma-6/discussions/2
- llama.cpp: https://github.com/ggml-org/llama.cpp
