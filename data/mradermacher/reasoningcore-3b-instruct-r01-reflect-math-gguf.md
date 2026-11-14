# mradermacher/ReasoningCore-3B-Instruct-r01-Reflect-Math-GGUF

## Resumen

ReasoningCore-3B-Instruct-r01-Reflect-Math-GGUF es la distribucion en formato GGUF del modelo EpistemeAI/ReasoningCore-3B-Instruct-r01-Reflect-Math, un modelo de lenguaje de 3.212.749.888 parametros (aproximadamente 3,2 mil millones) afinado para instrucciones y razonamiento matematico con un mecanismo de "reflexion" en su nombre. La cuantizacion la realiza mradermacher, un publicador habitual de versiones GGUF de modelos open source, y esta pensada para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.) en hardware de consumo.

El modelo base parte de la familia Llama 3.2, como indica su licencia `llama3.2`, y esta etiquetado como compatible con text-generation-inference y entrenado con Unsloth y TRL. Su enfoque declarado es el razonamiento matematico con instrucciones, si bien la model card del repositorio GGUF no aporta detalles sobre el dataset de entrenamiento, el contexto maximo ni los resultados de evaluacion.

La relevancia de esta ficha radica en que ofrece una via practica de ejecutar un modelo de razonamiento de ~3B en GPUs de consumo mediante cuantizaciones que van de 1,5 GB (Q2_K) a 6,5 GB (f16), con la recomendacion del autor de usar Q4_K_M (2,1 GB) para un equilibrio entre velocidad y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2, segun licencia y tags) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de aproximadamente 3,2 mil millones de parametros, encuadrado en la familia Llama 3.2 por su licencia y por los tags `llama` y `transformers`. Los tags del repositorio indican que el afinamiento se realizo con Unsloth y TRL, lo que sugiere un proceso de instruction tuning (posiblemente SFT y, por el nombre "Reflect", algun esquema de reflexion o auto-revision en las respuestas) sobre el modelo base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La unica innovacion tecnica documentada en esta ficha es la propia cuantizacion: mradermacher publica cuantizaciones estaticas (no imatrix) generadas con llama.cpp, con una tabla de tamanos por tipo. El autor advierte de que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion y que, si no aparecen en una semana, probablemente no las planifique. No se documentan innovaciones como decodificacion especulativa, atencion lineal o modos de pensamiento explicitos.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de instrucciones (chat template de Llama 3.2).
- Razonamiento matematico: el nombre del modelo (ReasoningCore, Reflect, Math) indica un enfoque en problemas matematicos y razonamiento paso a paso, aunque no hay evaluaciones publicadas que lo cuantifiquen.
- Razonamiento con reflexion: el sufijo "Reflect" sugiere la capacidad de revisar o reconsiderar respuestas, si bien no se detalla el mecanismo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Asistente de matematicas en local: ejecutar la cuantizacion Q4_K_M (2,1 GB) en un portatil con GPU integrada o CPU para resolver problemas aritmeticos y algebraicos paso a paso, sin depender de la nube.
- Prototipado de razonamiento en entornos con recursos limitados: usar Q2_K (1,5 GB) para validar pipelines de generacion con llama.cpp antes de escalar a modelos mayores.
- Educacion y tutoria automatica: generar explicaciones de ejercicios matematicos en ingles con un modelo de 3B que cabe en cualquier GPU de 4 GB o superior.
- Filtrado y preprocesado de datos: clasificar o reescribir textos cortos en ingles en pipelines por lotes donde el throughput prima sobre la calidad maxima.
- Desarrollo de aplicaciones edge: desplegar el modelo en dispositivos con poca VRAM (Raspberry Pi con 8 GB, mini-PC) usando Q4_K_S o IQ4_XS.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, util para estudiar el impacto de la compresion en la calidad de un modelo de razonamiento de 3B.
- Base para fine-tuning posterior: partir del modelo en f16 (6,5 GB) como referencia de calidad para experimentos de ajuste con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): 1,5 GB (Q2_K), 2,1 GB (Q4_K_M), 2,7 GB (Q6_K), 3,5 GB (Q8_0), 6,5 GB (f16). Anadir aproximadamente 0,5-2 GB adicionales para la cache KV segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas para Q4_K_M (GTX 1650, RTX 3050, RTX 4060); 8 GB o mas para Q8_0 o f16 (RTX 3060, RTX 4060 Ti, RTX 4090).
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas con 4 GB o mas; tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el modelo base es compatible con transformers y text-generation-inference, pero las cuantizaciones GGUF requieren llama.cpp o derivados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReasoningCore-3B-Instruct-r01-Reflect-Math (este) | 3,2B | no disponible | llama3.2 | GGUF | Enfoque matematico con reflexion, solo ingles |
| Llama 3.2 3B Instruct | 3,2B | 128K (segun model card oficial) | llama3.2 | safetensors, GGUF | Base de la familia, multilingue oficial |
| Qwen2.5-Math-1.5B-Instruct | 1,5B | 32K (segun model card oficial) | Apache 2.0 | safetensors, GGUF | Especializado en matematicas, licencia permisiva |
| Phi-3.5-mini-instruct | 3,8B | 128K (segun model card oficial) | MIT | safetensors, GGUF | Razonamiento general, licencia permisiva |

Nota: los datos de los modelos comparables provienen de sus model cards publicas; los de este modelo son los disponibles en la informacion proporcionada. No se dispone de comparaciones de rendimiento medidas.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); no se garantiza un rendimiento correcto en castellano u otros idiomas.
- No hay benchmarks publicados, por lo que no se puede verificar la calidad del razonamiento matematico ni compararla con alternativas.
- Riesgo de alucinacion inherente a los modelos de 3B, especialmente en razonamiento matematico de varios pasos.
- La licencia `llama3.2` impone restricciones de uso comercial y requiere el cumplimiento de la Licencia de la Comunidad Llama 3.2 (incluida la politica de uso aceptable).
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente el rendimiento; el autor recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que puede reducir la calidad frente a otras distribuciones.
- El modelo base no documenta contexto maximo, tool calling ni capacidades de agente, por lo que no es adecuado para pipelines que dependan de estas funciones.
- El repositorio tiene muy pocas descargas (106) y likes (1), lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ReasoningCore-3B-Instruct-r01-Reflect-Math-GGUF
- Modelo base: https://huggingface.co/EpistemeAI/ReasoningCore-3B-Instruct-r01-Reflect-Math
- Pagina de descargas del autor: https://hf.tst.eu/model#ReasoningCore-3B-Instruct-r01-Reflect-Math-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
