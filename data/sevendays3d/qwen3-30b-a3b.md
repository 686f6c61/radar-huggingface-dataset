# SevenDays3D/Qwen3-30B-A3B

## Resumen

Qwen3-30B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Alibaba Qwen y publicado en diciembre de 2025. Con 30.530 millones de parámetros totales y solo 3.300 millones activos por token, ofrece un equilibrio poco habitual entre capacidad y coste de inferencia: se comporta como un modelo denso de gran tamaño en calidad, pero con el coste computacional de uno mucho más pequeño. La ficha que nos ocupa es una cuantización GGUF publicada por el usuario SevenDays3D, derivada directamente del modelo base oficial.

El modelo integra dos modos de operación en un mismo checkpoint: un modo de razonamiento (thinking) que genera un bloque interno de deliberación antes de responder, y un modo directo (non-thinking) orientado a latencia baja. Esta conmutación se puede forzar por prompt mediante los marcadores `/think` y `/no_think`. Está diseñado para tareas de razonamiento matemático, generación de código, seguimiento de instrucciones, diálogo multi-turno y uso agéntico con llamadas a herramientas.

La relevancia actual del modelo radica en su soporte de 100+ idiomas, su contexto nativo de 32.768 tokens ampliable a 131.072 mediante YaRN, y su compatibilidad con los principales motores de inferencia del ecosistema (Transformers, vLLM, SGLang, llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers). La cuantización GGUF aquí descrita facilita su despliegue en entornos con VRAM limitada, aunque conviene señalar que el repositorio declara únicamente el idioma ruso en sus metadatos, lo que no refleja las capacidades reales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (MoE) |
| Parametros totales | 30.532.122.624 (30,5 mil millones) |
| Parametros activos | 3.300 millones (8 de 128 expertos) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN (factor 4.0) |
| Tipos de cuantizacion | GGUF (el repo publica pesos cuantizados; niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | 100+ idiomas y dialectos segun la model card del modelo base; metadatos del repo solo declaran `ru` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizacion); el modelo base usa safetensors |
| Capas | 48 |
| Atencion | GQA con 32 cabezas Q y 4 cabezas KV |
| Expertos | 128 totales, 8 activos por token |
| Parametros sin embeddings | 29,9 mil millones |
| Tamano del repo | 118,7 GB |
| Descargas / likes | 285 / 0 |
| Compatibilidad | Transformers >= 4.51.0, vLLM, SGLang, llama.cpp, Ollama, LM Studio, MLX-LM, KTransformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con capas MoE de enrutamiento disperso: 128 expertos por capa de los cuales se activan 8 por token, lo que resulta en 3.300 millones de parámetros activos sobre un total de 30.500 millones. Consta de 48 capas y utiliza Grouped-Query Attention con 32 cabezas de consulta y 4 de clave-valor, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni las etapas de alineación (RLHF/DPO), por lo que esos datos deben considerarse no disponibles.

La innovación principal es la coexistencia de modos de razonamiento y respuesta directa en un único checkpoint, con conmutación por prompt. La model card indica que el modo thinking supera a QwQ y el modo non-thinking supera a Qwen2.5-Instruct en matemáticas, código y lógica, si bien no se aportan cifras concretas. Se recomienda evitar la decodificación greedy (provoca degradación y bucles), usar temperature 0.6/TopP 0.95/TopK 20 en modo thinking y 0.7/0.8/20 en modo non-thinking, y limitar la longitud de salida a 32.768 tokens (hasta 38.912 en tareas complejas). El uso de YaRN solo debe activarse cuando el contexto supere los 32K, ya que puede degradar la calidad en ventanas cortas.

## Capacidades

- Generación de texto y diálogo multi-turno con seguimiento de instrucciones.
- Razonamiento explícito en modo thinking con bloque `` y respuesta final separada.
- Razonamiento matemático y resolución de problemas paso a paso, con formato estandarizado mediante `\boxed{}`.
- Generación y comprensión de código, incluyendo tareas de programación competitiva.
- Llamada a herramientas (tool calling / function calling) en ambos modos, con soporte recomendado vía Qwen-Agent y configuración MCP.
- Flujos agénticos multi-paso con integración de herramientas externas.
- Capacidades multilingües en 100+ idiomas y dialectos, con traducción e instrucciones multilingües.
- Escritura creativa, juegos de rol y alineación con preferencias humanas.
- Conmutación dinámica de modo por turno mediante `/think` y `/no_think`.
- Contexto extendido a 131.072 tokens mediante YaRN.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 32K tokens nativos, 131K con YaRN) y alternar a modo non-thinking para respuestas de baja latencia, reservando el modo thinking para consultas complejas.
- Generación de código en producción: su soporte de tool calling y su calidad en código permiten integrarlo en pipelines de CI/CD para revisión automática, generación de tests o parcheo de errores, con salidas estructuradas en JSON.
- Asistentes agénticos con herramientas: mediante Qwen-Agent o MCP se pueden definir herramientas externas (búsqueda, bases de datos, APIs) y dejar que el modelo planifique y ejecute pasos intermedios en ambos modos.
- Razonamiento matemático y análisis cuantitativo: adecuado para tutoría, verificación de cálculos y resolución de problemas con formato `\boxed{}`, útil en plataformas educativas o de evaluación automática.
- Traducción y soporte multilingüe: con 100+ idiomas puede emplearse en localización de contenidos, atención multilingüe o generación de documentación en varios idiomas, aunque conviene validar el rendimiento por idioma.
- Despliegue en hardware de consumo: la versión GGUF permite ejecutar el modelo con llama.cpp u Ollama en equipos con VRAM moderada, habilitando prototipado local y entornos sin GPU de datacenter.
- Procesamiento de documentos largos: con YaRN a 131K tokens puede resumir o extraer información de contratos, informes o expedientes extensos en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; depende del nivel de cuantizacion GGUF elegido (el repo completo ocupa 118,7 GB, pero los pesos cuantizados individuales son de menor tamano).
- GPU de datacenter recomendadas: A100 y H100 para despliegue en vLLM o SGLang con contexto largo y concurrencia alta.
- GPU de consumo: viable en RTX 4090 y GPUs con VRAM suficiente segun la cuantizacion; los niveles mas agresivos de GGUF pueden caber en tarjetas de gama alta de consumo, aunque el dato concreto no esta disponible.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, LM Studio, MLX-LM, KTransformers y Transformers (>= 4.51.0).
- Latencia y throughput: no disponibles en la informacion proporcionada; al activar solo 3.300 millones de parametros por token, el coste por token es sustancialmente menor que el de un modelo denso de 30B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B (este) | 30,5B | 3,3B | 32K / 131K YaRN | Apache 2.0 | Hugging Face, GGUF, vLLM, llama.cpp |
| Qwen2.5-Instruct | no disponible | denso | no disponible | no disponible | Hugging Face |
| QwQ | no disponible | denso | no disponible | no disponible | Hugging Face |

La model card cita QwQ y Qwen2.5-Instruct como referencias de comparacion (el modo thinking supera a QwQ y el non-thinking a Qwen2.5-Instruct), pero no aporta cifras ni especificaciones completas de esos modelos en la informacion disponible. No se dispone de datos de rendimiento comparativo verificables.

## Limitaciones y advertencias

- La decodificacion greedy provoca degradacion y bucles; es obligatorio usar sampling con los parametros recomendados.
- El uso de YaRN con contextos inferiores a 32K puede degradar la calidad; activarlo solo cuando sea necesario.
- Riesgo de alucinacion inherente a los modelos de lenguaje, sin datos especificos publicados en la model card.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Los metadatos del repositorio declaran unicamente el idioma ruso, lo que no refleja las capacidades multilingües del modelo base y puede inducir a error en la seleccion.
- Es una cuantizacion de terceros (SevenDays3D), no una publicacion oficial de Qwen; la calidad puede variar respecto a los pesos originales y no hay garantia de soporte.
- Requiere Transformers >= 4.51.0 para evitar el error `KeyError: 'qwen3_moe'`.
- En conversaciones multi-turno debe incluirse en el historial solo la respuesta final, sin los bloques de razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de la cuantizacion.
- El repositorio tiene muy poca traccion (285 descargas, 0 likes), por lo que la validacion comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/SevenDays3D/Qwen3-30B-A3B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio de Qwen-Agent: no disponible en la informacion proporcionada
- Paper tecnico de Qwen3: no disponible en la informacion proporcionada
- Blog oficial de Qwen: no disponible en la informacion proporcionada
