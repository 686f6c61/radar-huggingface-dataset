# mradermacher/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic-i1-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo Kasemcyber/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic, un derivado afinado del DeepSeek-R1-Distill-Qwen-1.5B. El autor, mradermacher, es conocido por publicar versiones cuantizadas de modelos abiertos en multiples niveles de compresion, y en este caso aplica cuantizacion ponderada con matriz de importancia (imatrix) para preservar la calidad en los niveles mas agresivos.

El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B, con un proceso posterior de "abliteracion" o eliminacion de rechazos (denominado DECENSORED-Heretic en el nombre del autor original), orientado a reducir las negativas del modelo ante peticiones que el modelo original rechazaria. Esto lo hace relevante para experimentacion sobre alineamiento, seguridad y comportamiento de modelos pequenos con capacidad de razonamiento.

La ficha se centra en el paquete GGUF publicado, que incluye 24 variantes de cuantizacion (desde Q2_K hasta Q6_K, pasando por IQ1_S, IQ2, IQ3, IQ4 y Q5) generadas a partir de los pesos en formato Hugging Face. El repositorio no incluye pesos en safetensors ni documentacion tecnica adicional mas alla de los metadatos de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B, destilado de DeepSeek-R1) |
| Parametros totales | 1.020.404 (segun metadatos de safetensors del repo; el modelo base Qwen2.5-1.5B tiene aproximadamente 1.500 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ2_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ1_M, IQ1_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiples archivos por nivel de cuantizacion) |

## Arquitectura y entrenamiento

El modelo base subyacente es un destilado de DeepSeek-R1 sobre Qwen2.5-1.5B, es decir, un transformer decoder-only de aproximadamente 1.500 millones de parametros entrenado mediante destilacion de las trazas de razonamiento del modelo grande DeepSeek-R1. El autor original (Kasemcyber) aplico un proceso de "abliteracion" o supresion de direcciones de rechazo en el espacio de activaciones, comercializado bajo el nombre DECENSORED-Heretic, cuyo objetivo es eliminar las respuestas de negativa del modelo afinado original.

Sobre esta base, mradermacher genero las cuantizaciones GGUF mediante `convert_type: hf` y `quantize_version: 2`, usando cuantizacion ponderada con imatrix (matriz de importancia) para los niveles IQ y K. No se dispone de informacion sobre el numero de tokens de entrenamiento del destilado original, la composicion del dataset de destilacion, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se documenta ninguna innovacion arquitectonica propia: se trata de las tecnicas de cuantizacion de llama.cpp aplicadas a un modelo ya existente.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredado del proceso de destilacion de DeepSeek-R1 (traza de pensamiento antes de la respuesta).
- Resolucion de problemas matematicos y logicos de complejidad moderada, limitada por el tamano de 1.5B parametros.
- Generacion de codigo basico y explicacion de fragmentos de codigo.
- Conversacion multi-turno en el contexto soportado por el modelo base (no documentado en esta ficha).
- Capacidad multilingue heredada de Qwen2.5 (no verificada ni documentada en la informacion disponible).
- Comportamiento "sin censura" o con rechazos reducidos por el proceso de abliteracion del modelo original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente, vision o audio: no disponibles.

## Casos de uso

- Experimentacion en investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteracion afecta al comportamiento de rechazo en un modelo pequeno con razonamiento destilado, comparando respuestas frente al DeepSeek-R1-Distill-Qwen-1.5B original.
- Despliegue en entornos con recursos muy limitados: las cuantizaciones IQ1_S e IQ2 permiten ejecutar el modelo en CPU o en GPUs de gama baja con pocos GB de RAM, util para prototipos offline.
- Generacion de texto creativo sin restricciones tematicas: util para escritura de ficcion o guiones donde el modelo original rechazaria ciertos contenidos, con la advertencia de que la calidad en cuantizaciones bajas se degrada.
- Razonamiento matematico basico en dispositivos edge: tareas de aritmetica y problemas de varios pasos en aplicaciones moviles o embebidas con llama.cpp.
- Asistente de codigo local para autocompletado y explicacion de fragmentos, integrado en editores mediante servidores compatibles con la API de llama.cpp.
- Filtrado y clasificacion de texto en pipelines de datos: tareas de etiquetado o resumen corto donde el coste por inferencia es critico y la precision no es el factor principal.
- Educacion y demostraciones: ejecucion de un modelo con cadena de razonamiento en talleres o cursos sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB para IQ1_S/IQ2, 1-1,5 GB para Q4_K_M, 1,5-2 GB para Q6_K (estimacion a partir del tamano de 1.5B parametros; no confirmada en la informacion proporcionada).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para las cuantizaciones medias; A100/H100 no aportan ventaja significativa a este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en iGPUs con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de llama.cpp; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU se espera un rendimiento de decenas de tokens por segundo para cuantizaciones Q4 en hardware moderno, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (original) | ~1.5B | no disponible | MIT (habitual en la familia DeepSeek-R1) | safetensors, GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1.5B | 32K (segun documentacion de Qwen2.5) | Apache 2.0 (segun documentacion de Qwen2.5) | safetensors, GGUF | Hugging Face |
| Este modelo (DECENSORED-Heretic i1 GGUF) | ~1.5B | no disponible | no disponible | GGUF | Hugging Face |

La comparativa de rendimiento no esta disponible: no se han publicado benchmarks del derivado DECENSORED-Heretic ni de sus cuantizaciones en la informacion proporcionada. Las licencias de los modelos comparables se indican segun la documentacion publica habitual de sus familias, no verificadas en esta busqueda.

## Limitaciones y advertencias

- El proceso de abliteracion elimina los rechazos del modelo, lo que implica que puede generar contenido danino, ofensivo o ilegal sin filtros; no es apto para despliegues publicos sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por el tamano de 1.5B parametros y por las cuantizaciones agresivas (IQ1, IQ2), que degradan la coherencia.
- La licencia no esta declarada en el repositorio; no se puede asumir uso comercial sin verificar la licencia del modelo base y del derivado original.
- El numero de parametros reportado en los metadatos (1.020.404) es inconsistente con el modelo base Qwen2.5-1.5B y probablemente refleja un error de metadatos o un tensor parcial; conviene verificar antes de asumir el tamano real.
- No hay documentacion sobre idiomas soportados ni sobre la longitud de contexto efectiva tras la cuantizacion.
- Las cuantizaciones por debajo de Q4 pierden calidad de forma notable en tareas de razonamiento; para uso serio se recomienda Q5_K_M o Q6_K.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El contenido generado puede incluir material sexual, violento o ilegal; el uso en produccion requiere revision legal y de cumplimiento normativo (por ejemplo, RGPD y DSA en la UE).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic-i1-GGUF
- Modelo base del derivado: https://huggingface.co/Kasemcyber/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio llama.cpp (runtime de GGUF): https://github.com/ggml-org/llama.cpp
