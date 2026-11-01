# fajriansyah/Qwen3-14B-GGUF

## Resumen

Qwen3-14B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3-14B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal denso de 14.800 millones de parámetros (13.200 millones sin contar los embeddings) pensado para generación de texto, razonamiento, código y tareas de agente. Esta ficha concreta corresponde al repositorio publicado por el usuario `fajriansyah`, que redistribuye los pesos en cuantizaciones GGUF para su uso con llama.cpp y Ollama.

La relevancia del modelo radica en su doble modo de funcionamiento: puede alternar entre un modo "thinking" orientado a razonamiento complejo (matemáticas, lógica, código) y un modo "non-thinking" para diálogo general eficiente, todo dentro del mismo modelo y controlable mediante instrucciones como `/think` y `/no_think`. Incorpora además soporte declarado de más de 100 idiomas y capacidades de integración con herramientas externas.

Arquitectónicamente es un transformer denso con 40 capas y atención GQA (40 cabezas de consulta y 8 de clave-valor), con una longitud de contexto nativa de 32.768 tokens ampliable a 131.072 mediante escalado YaRN. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, 40 capas, atención GQA (40 Q / 8 KV) |
| Parametros totales | 14.768.307.200 (14,8B); 13,2B sin embeddings |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | más de 100 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 57,6 GB) |

## Arquitectura y entrenamiento

Qwen3-14B es un modelo transformer causal denso con 40 capas. Emplea Grouped Query Attention con 40 cabezas de consulta y 8 cabezas de clave-valor, lo que reduce el coste de memoria de la caché KV durante la inferencia. El modelo pasó por dos fases: preentrenamiento y post-entrenamiento (la model card indica "Pretraining & Post-training" sin detallar el número de tokens ni la composición exacta del dataset). El post-entrenamiento incluye alineación con preferencias humanas, según se desprende de las mejoras declaradas en escritura creativa, role-playing y seguimiento de instrucciones.

La innovación técnica más destacable es la capacidad de alternar entre modo de razonamiento (thinking) y modo directo (non-thinking) mediante instrucciones en el prompt, sin necesidad de cargar dos modelos distintos. Para contextos largos se recurre a YaRN (arxiv:2309.00071), con la advertencia de que la implementación estática de YaRN puede degradar el rendimiento en textos cortos, por lo que se recomienda activarla solo cuando se procesen contextos largos y ajustar el factor (por ejemplo, 2.0 para 65.536 tokens). Esta versión GGUF no aporta cambios arquitectónicos: es una cuantización de los pesos originales.

## Capacidades

- Generación de texto y diálogo multi-turno con alineación orientada a preferencias humanas.
- Razonamiento complejo en modo thinking: matemáticas, lógica y código.
- Modo non-thinking para respuestas rápidas y diálogo general.
- Generación de código y soporte declarado de tareas de programación.
- Integración con herramientas externas (tool calling / function calling) en ambos modos.
- Capacidades de agente y razonamiento multi-paso, con rendimiento destacado entre modelos open source según la model card.
- Soporte multilingüe de más de 100 idiomas y dialectos, incluyendo traducción e instrucciones multilingües.
- Escritura creativa y role-playing.
- Procesamiento de textos largos hasta 131.072 tokens con YaRN.

## Casos de uso

- Asistente de atención al cliente: el modelo puede mantener conversaciones multi-turno con contexto amplio (32.768 tokens nativos) y alternar a modo non-thinking para respuestas rápidas en consultas rutinarias, reservando el modo thinking para casos que requieran razonamiento.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines que invoquen linters, compiladores o APIs de CI/CD, y usarse en modo thinking para depuración de errores complejos.
- Agentes autónomos multi-paso: la capacidad de integrar herramientas externas y razonar en varios pasos lo hace adecuado para orquestación de tareas (consulta de APIs, extracción de datos, generación de informes).
- Análisis de documentos largos: con YaRN activado hasta 131.072 tokens, permite resumir o extraer información de contratos, informes o expedientes extensos en una sola pasada.
- Traducción y atención multilingüe: el soporte de más de 100 idiomas permite desplegar un único modelo para traducción y soporte en varios mercados sin modelos adicionales.
- Tutoría y resolución de problemas matemáticos: el modo thinking está diseñado para razonamiento paso a paso, útil en plataformas educativas que necesiten explicar la resolución de ejercicios.
- Despliegue local en estaciones de trabajo: las cuantizaciones GGUF (q4_K_M a q8_0) permiten ejecutar el modelo con llama.cpp u Ollama en hardware de consumo, útil para prototipado y entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog, GitHub y documentación oficiales de Qwen para consultar evaluaciones, pero no incluye cifras concretas en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB con q4_K_M, 10-11 GB con q5_K_M, 12-13 GB con q6_K y 15-16 GB con q8_0 (estimación a partir del tamaño de pesos; no confirmada en la información disponible).
- GPU recomendadas: A100 o H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para q8_0 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizaciones intermedias.
- Cabe en GPU de consumo: sí, con cuantizaciones q4_K_M o q5_K_M en tarjetas de 12 GB o más; q8_0 requiere al menos 16-24 GB.
- Opciones de despliegue: llama.cpp (recomendado por la model card), Ollama (`ollama run hf.co/Qwen/Qwen3-14B-GGUF:Q8_0`), y cualquier framework compatible con GGUF. Los endpoints de Alibaba Model Studio también están soportados según la documentación.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-14B-GGUF (esta ficha) | 14,8B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | GGUF | Doble modo thinking/non-thinking |
| Qwen3-14B (original) | 14,8B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors | Pesos completos, requiere más VRAM |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors, GGUF | Generación anterior, sin modo thinking |
| Modelos de ~14B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado tasas de error específicas en la información disponible.
- En modo thinking se desaconseja explícitamente la decodificación greedy: puede provocar degradación del rendimiento y repeticiones sin fin. Se recomiendan los parámetros de muestreo indicados en la model card (temperatura 0,6, top_p 0,95, top_k 20, presence_penalty 1,5).
- En modelos cuantizados se recomienda presence_penalty de 1,5 para suprimir repeticiones; valores más altos pueden causar mezcla de idiomas y ligera pérdida de calidad.
- YaRN estático puede degradar el rendimiento en textos cortos; debe activarse solo cuando se requieran contextos largos y ajustar el factor al caso de uso.
- La información sobre idiomas soportados proviene de la model card del modelo base y no está verificada de forma independiente para esta cuantización concreta.
- Este repositorio es una redistribución de terceros (usuario `fajriansyah`) con 77 descargas y 0 likes; no es el repositorio oficial de Qwen, por lo que conviene verificar la integridad de los pesos antes de usarlos en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base original y mantener la atribución correspondiente.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/fajriansyah/Qwen3-14B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-14B-GGUF
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Guía de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Guía de Ollama: https://qwen.readthedocs.io/en/latest/run_locally/ollama.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Chat de Qwen: https://chat.qwen.ai/
- Licencia: https://huggingface.co/Qwen/Qwen3-14B-GGUF/blob/main/LICENSE
