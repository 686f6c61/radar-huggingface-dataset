# crusoeai/Qwen3.6-35B-A3B-FFT

## Resumen

Qwen3.6-35B-A3B-FFT es un ajuste fino completo (full fine-tune, de ahí el sufijo FFT) publicado por crusoeai sobre los pesos abiertos de Qwen3.6-35B-A3B, el primer modelo de la serie Qwen3.6 con pesos liberados por Alibaba. Se trata de un modelo de lenguaje causal multimodal (texto e imagen a texto) con arquitectura híbrida que combina atención lineal Gated DeltaNet, atención completa con puerta (Gated Attention) y una capa de mezcla de expertos (MoE). Con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activados por token, ofrece un coste de inferencia propio de un modelo de 3B con la capacidad de representación de un 35B.

El modelo resuelve tareas de generación de texto, razonamiento, codificación a nivel de repositorio y flujos agénticos, y añade un codificador de visión que le permite procesar entradas de imagen junto con texto. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000, lo que lo sitúa en el segmento de contexto largo para trabajo con repositorios, documentos extensos y conversaciones multi-turno.

Es relevante ahora porque combina una licencia permisiva (Apache 2.0), compatibilidad con los principales motores de inferencia (Transformers, vLLM, SGLang, KTransformers) y un perfil de hardware inusualmente accesible: al activar solo 3B de parámetros, las cuantizaciones de 4 bits caben en GPUs de consumo de 24 GB. La publicación de crusoeai es muy reciente (12 de octubre de 2026) y todavía cuenta con 10 descargas y 0 likes, por lo que se trata de un artefacto poco validado por la comunidad. Los datos de arquitectura y benchmarks provienen de la model card del modelo base Qwen3.6-35B-A3B, no de una evaluación específica del ajuste de crusoeai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: capas alternas de Gated DeltaNet (atencion lineal) y Gated Attention, con capa MoE en cada bloque |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | ~3B por token (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No especificado en la informacion disponible; la busqueda web menciona variantes GGUF dinamicas UD-Q4_K_M y UD-Q3_K_M |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers); tamano del repo 71,9 GB |

Datos adicionales de arquitectura (del modelo base): dimension oculta 2048, 40 capas, embedding de 248.320 tokens (con padding), 256 expertos, dimension intermedia de experto 512, 32 cabezas de atencion lineal para V y 16 para QK (dimension 128), 16 cabezas de atencion para Q y 2 para KV (dimension 256), dimension de RoPE 64 y entrenamiento con prediccion multi-token (MTP). El layout es 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)).

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido con un codificador de vision anadido (pipeline image-text-to-text). El bloque de lenguaje alterna dos tipos de atencion dentro de cada grupo de cuatro capas: tres capas de Gated DeltaNet (una forma de atencion lineal recurrente con control de puerta) seguidas de una capa de Gated Attention con atencion completa. Cada una de esas capas va seguida de una capa MoE con 256 expertos, de los que se activan 8 enrutados mas 1 compartido, con dimension intermedia de 512 por experto. Esta combinacion reduce el coste cuadratico de la atencion en secuencias largas y mantiene un coste de computo por token muy bajo en comparacion con un modelo denso de 35B. El modelo se entreno con prediccion multi-token (MTP) en varios pasos.

El pipeline de entrenamiento es de preentrenamiento mas postentrenamiento. La model card indica que el desarrollo se guio por retroalimentacion de la comunidad y prioriza estabilidad y utilidad practica en codificacion. Se destacan dos innovaciones: la mejora en codificacion agentica (razonamiento a nivel de repositorio y flujos de frontend) y una opcion nueva de "thinking preservation" que conserva el contexto de razonamiento de mensajes historicos para reducir la sobrecarga en desarrollo iterativo. La informacion disponible no detalla el numero de tokens de preentrenamiento, la composicion del dataset ni si se uso RLHF o DPO. Tampoco se especifica el procedimiento ni el dataset empleados por crusoeai para el ajuste fino completo.

## Capacidades

- Generacion de texto y razonamiento general en modo conversacional.
- Codificacion agentica: razonamiento a nivel de repositorio, flujos de trabajo de frontend y resolucion de tareas de ingenieria de software (segun los benchmarks reportados en la model card del modelo base).
- Comprension de imagenes: el pipeline es image-text-to-text y el modelo incluye un codificador de vision.
- Soporte de tool calling / function calling: implicito en las capacidades agenticas descritas, aunque la model card no lo detalla de forma explicita.
- Razonamiento multi-paso y uso en agentes: la seccion de destacados menciona codificacion agentica y preservacion del hilo de razonamiento.
- Modo de razonamiento con preservacion de contexto historico ("thinking preservation") como opcion para desarrollo iterativo.
- Procesamiento de contexto largo: hasta 262.144 tokens nativos, extensible a ~1.010.000.
- Capacidades multilingues: no disponibles en la informacion proporcionada (la model card menciona un benchmark SWE-bench Multilingual, lo que sugiere soporte de codigo en varios idiomas, pero no se listan los idiomas de lenguaje natural).

## Casos de uso

- Asistencia de codificacion en repositorios grandes: con 262.144 tokens de contexto nativo puede ingerir ficheros multiples y el arbol de un repositorio, y el benchmark SWE-bench Verified (73,4 en el modelo base) lo situa como candidato para resolver issues de extremo a extremo.
- Agentes de ingenieria de software en CI/CD: la combinacion de tool calling implicito, razonamiento multi-paso y bajo coste de inferencia (3B activos) permite ejecutar bucles agénticos de parcheo y validacion sin el gasto de un modelo denso de 35B.
- Revision automatizada de pull requests: el modo de preservacion del razonamiento permite mantener el hilo entre iteraciones de revision, reduciendo el contexto a reprocesar en cada vuelta.
- Asistencia multimodal sobre capturas de interfaz: al aceptar entrada de imagen, puede analizar mockups, diagramas de arquitectura o capturas de pantalla de errores junto con el texto del prompt.
- Analisis de documentacion tecnica extensa: la ventana de contexto larga permite resumir, extraer y responder preguntas sobre manuales, contratos o bases de codigo de gran tamano sin fragmentar por trozos.
- Despliegue en hardware de consumo: gracias a los 3B activos y a las cuantizaciones de 4 bits, es viable ejecutar un asistente de codigo local en una GPU de 24 GB (los datos de la web reportan 157,66 tok/s en una RTX 3090 con UD-Q4_K_M).
- Chatbot de atencion tecnica multi-turno: el contexto de 262K tokens y el bajo coste por token permiten mantener sesiones largas con historial completo sin truncar.
- Prototipado rapido sobre pesos ajustados: al ser un full fine-tune con licencia Apache 2.0, es util como punto de partida para seguir ajustando sobre un dominio concreto sin restricciones de licencia.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la model card del modelo base Qwen3.6-35B-A3B (no de una evaluacion especifica del ajuste fino de crusoeai). Se comparan con las alternativas de la misma tabla publicada por el autor del modelo base.

| Benchmark | Qwen3.6-35B-A3B | Qwen3.5-35B-A3B | Qwen3.5-27B | Gemma4-31B | Gemma4-26B-A4B |
|---|---|---|---|---|---|
| SWE-bench Verified | 73,4 | 70,0 | 75,0 | 52,0 | 17,4 |
| SWE-bench Multilingual | 67,2 | 60,3 | 69,3 | 51,7 | 17,3 |
| SWE-bench Pro | 49,5 | 44,6 | 51,2 | 35,7 | 13,8 |

No se han publicado en la informacion disponible resultados de benchmarks especificos del ajuste fino Qwen3.6-35B-A3B-FFT de crusoeai (MMLU, GSM8K, HumanEval u otros). Los valores de la tabla corresponden al modelo base.

Dato externo: el agregador epoch.ai asigna a Qwen3.6-35B-A3B una puntuacion ECI de 144, con un puesto 94 de 257 modelos rastreados y un puesto 42 de 202 en el momento de su publicacion.

## Requisitos de hardware

- Peso completo en precision de entrenamiento: el repositorio ocupa 71,9 GB en safetensors, por lo que la inferencia sin cuantizar requiere del orden de 72 GB de VRAM mas el espacio de KV cache (varias decenas de GB adicionales a 262K de contexto).
- Cuantizacion de 4 bits: la variante UD-Q4_K_M cabe integra en una GPU de 24 GB. Se ha reportado una velocidad de 157,66 tok/s en una RTX 3090 (datos de la busqueda web, sin offload de expertos).
- Cuantizacion de 3 bits: la variante UD-Q3_K_M ocupa 16,6 GB y cabe en una GPU de 16 GB con offload de KV cache.
- GPUs recomendadas: para precision completa se necesitan aceleradores de clase A100 80 GB o H100; para cuantizaciones de 4 bits son suficientes RTX 4090, RTX 3090 o tarjetas de 24 GB equivalentes; para 3 bits, GPUs de 16 GB.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers segun la model card del modelo base; la busqueda web menciona ademas el uso de cuantizaciones GGUF dinamicas (compatibles con llama.cpp u Ollama, aunque no confirmado explicitamente en la informacion proporcionada).
- Latencia y throughput: 157,66 tok/s medidos en RTX 3090 con UD-Q4_K_M (dato externo de la busqueda web); no se dispone de medidas propias del ajuste de crusoeai.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-FFT (crusoeai) | 35,95B | ~3B | 262K (ext. 1,01M) | No disponible para el FFT (73,4 el base) | Apache 2.0 | Hugging Face, safetensors |
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K (ext. 1,01M) | 73,4 | Apache 2.0 | Hugging Face, vLLM, SGLang, KTransformers |
| Qwen3.5-35B-A3B | 35B | 3B | No disponible | 70,0 | No disponible en la informacion | Hugging Face |
| Qwen3.5-27B | 27B | Denso | No disponible | 75,0 | No disponible en la informacion | Hugging Face |
| Gemma4-31B | 31B | Denso | No disponible | 52,0 | No disponible en la informacion | Hugging Face |
| Gemma4-26B-A4B | 26B | 4B | No disponible | 17,4 | No disponible en la informacion | Hugging Face |

Nota: Qwen3.5-27B (denso) supera a Qwen3.6-35B-A3B en SWE-bench Verified (75,0 frente a 73,4) pero parte con mayor coste de inferencia al no ser MoE. Los datos de los modelos comparados provienen exclusivamente de la tabla publicada en la model card del modelo base.

## Limitaciones y advertencias

- El artefacto publicado por crusoeai no incluye model card propia con detalles del dataset, procedimiento o evaluacion del fine-tune: no hay benchmarks especificos del FFT y no se puede asumir que rinda como el modelo base.
- Modelo muy reciente y poco validado: 10 descargas y 0 likes en el momento de la consulta; ausencia de retroalimentacion de la comunidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Idiomas soportados no declarados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles.
- La ventana nativa es de 262.144 tokens; la extension hasta 1.010.000 tokens no se detalla como se activa ni con que degradacion de rendimiento.
- El entrenamiento con MTP (multi-token prediction) y las tecnicas de decodificacion implicitas pueden requerir motores especificos para aprovecharse; no se especifica compatibilidad completa en todos los backends.
- Requisitos de VRAM elevados en precision completa (entorno a 72 GB solo en pesos); el uso en produccion con cuantizacion exige validar la perdida de calidad.
- Aunque la licencia Apache 2.0 permite uso comercial, la model card del modelo base remite al LICENSE de Qwen: conviene revisar los terminos concretos heredados del modelo original antes de un despliegue comercial.
- Las capacidades multilingues y de tool calling no estan documentadas de forma explicita, solo inferidas de los benchmarks y del pipeline.

## Enlaces

- Hugging Face (crusoeai/Qwen3.6-35B-A3B-FFT): https://huggingface.co/crusoeai/Qwen3.6-35B-A3B-FFT
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog oficial Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio GitHub de Qwen3.6: https://github.com/AlibabaCloud-Official/Qwen3.6
- Ficha en epoch.ai: https://epoch.ai/models/qwen-3-6-35b-a3b
- Guia de especificaciones, precios y API (gate.ai): https://gate.ai/blog/qwen3-6-35b-a3b-specs-pricing-api-access
- Guia de Qwen 3.6 en local (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guia de ejecucion local del MoE de 35B (insiderllm): https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Qwen Chat: https://chat.qwen.ai
