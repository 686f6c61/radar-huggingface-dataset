# BachDaThan/Qwen-3-0.6B-Instruct-Vi-Medical-LoRA-GGUF

## Resumen

Qwen-3-0.6B-Instruct-Vi-Medical-LoRA-GGUF es una version cuantizada en formato GGUF del modelo Qwen/Qwen3-0.6B tras fusionar (merge) el adaptador LoRA danhtran2mind/Qwen-3-0.6B-Instruct-Vi-Medical-LoRA, orientado a conversacion instructiva en vietnamita dentro del dominio medico. Lo publica el usuario BachDaThan, que actua como cuantizador, no como autor del entrenamiento original: el pipeline completo consiste en tomar el modelo base de Qwen, aplicar un LoRA de ajuste instruccional medico en vietnamita, fusionarlo en los pesos y exportarlo a llama.cpp en cuatro niveles de cuantizacion K-quant.

El modelo conserva la arquitectura del Qwen3-0.6B: un transformer decoder-only de 28 capas, hidden size 1024, 16 cabezas de atencion y 8 cabezas KV (GQA), con un vocabulario de 151.936 tokens y una ventana de contexto declarada de 40.960 tokens. El recuento real de parametros segun los tensores safetensors es de 596.049.920, ligeramente por debajo de la etiqueta comercial "0.6B". Los ficheros GGUF van de 0,30 GB (Q3_K_S) a 0,37 GB (Q4_K_M), lo que lo situa en el rango de modelos desplegables en cualquier portatil o incluso en CPU pura.

Su relevancia es acotada pero clara: es un ejemplo de ajuste de dominio (medico) sobre un modelo pequeno, con licencia permisiva y empaquetado listo para llama.cpp y Ollama. No hay benchmarks publicados, no tiene descargas ni likes en el momento de la consulta, y la propia model card advierte del riesgo de alucinacion y de no usar las salidas como sustituto de consejo profesional. Es, por tanto, un artefacto util para prototipado y experimentacion local, no un modelo validado clinicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (28 capas, hidden size 1024, 16 cabezas de atencion, 8 cabezas KV, head dim 128) |
| Parametros totales | 596.049.920 segun tensores safetensors (etiquetado comercialmente como 0.6B) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | 40.960 tokens declarados en la configuracion del modelo base; los ejemplos de la model card usan n_ctx=8192 |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S |
| Idiomas soportados | Vietnamita (vi) e ingles (en) |
| Licencia | apache-2.0 en los metadatos de HuggingFace; el adaptador LoRA de origen es MIT; la model card indica que la licencia del repo se determino tras verificar la licencia de origen y no se autoadjudica Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original se distribuye en bfloat16 |
| Tamano del vocabulario | 151.936 tokens |
| Precision original | bfloat16 |
| Modelo base | Qwen/Qwen3-0.6B |
| Adaptador LoRA fusionado | danhtran2mind/Qwen-3-0.6B-Instruct-Vi-Medical-LoRA |
| Tamano del repositorio | 1,5 GB |
| Plantilla de chat | ChatML con tokens `<|im_start|>` y `<|im_end|>` |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B sin modificaciones estructurales: 28 capas transformer con atencion por consulta agrupada (GQA), 16 cabezas de consulta y 8 cabezas de clave/valor, dimension de cabeza 128, hidden size 1024 y un vocabulario multilingue de 151.936 entradas. La configuracion declara una ventana de contexto de 40.960 tokens, aunque los ejemplos de uso incluidos en la model card fijan `n_ctx=8192`, presumiblemente por coste de memoria KV y por la degradacion esperable en un modelo de este tamano.

El entrenamiento del artefacto publicado consiste en un ajuste por LoRA sobre el modelo base usando un dataset instructivo medico en vietnamita, seguido de la fusion de los pesos del adaptador en el modelo completo y la cuantizacion a GGUF con llama.cpp. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO u otra alineacion adicional sobre el LoRA. La cuantizacion se realizo de forma automatica por BachDaThan, y los tamanos de fichero declarados corresponden a `stat().st_size` tras el proceso de cuantizacion, no a estimaciones.

No se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, modos de pensamiento explicitos ni variantes hibridas) en la informacion proporcionada. Cualquier capacidad de razonamiento extendido heredada del Qwen3 base no se menciona ni se activa de forma documentada en esta ficha.

## Capacidades

- Generacion de texto conversacional en vietnamita con formato de chat ChatML (`system`, `user`, `assistant`).
- Respuesta a instrucciones de tipo asistente gracias al ajuste instruccional del LoRA fusionado.
- Cobertura del dominio medico en vietnamita, presumiblemente orientada a preguntas y respuestas sobre salud, terminologia y contenidos clinicos, segun indica el nombre del adaptador.
- Capacidad bilingue vi/en declarada en los metadatos y en las etiquetas del repositorio.
- Inferencia local en CPU y GPU mediante llama.cpp, llama-cpp-python y Ollama.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que permite exponerlo como servicio HTTP.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo de pensamiento explicito (thinking mode): no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es exclusivamente `text-generation`.

## Casos de uso

- Triaje y orientacion sanitaria en vietnamita en entornos con recursos limitados: un centro de salud rural puede desplegar el fichero Q4_K_M (0,37 GB) en un portatil sin GPU dedicada y ofrecer respuestas preliminares sobre sintomas frecuentes, derivando siempre a personal cualificado.
- Asistente conversacional de preguntas frecuentes para clinicas: el modelo mantiene conversaciones multi-turno con plantilla ChatML y puede responder sobre horarios, preparacion de pruebas o gestion de citas, integrado en un backend ligero.
- Traduccion y normalizacion de terminologia medica vi-en: util como componente de preprocesado para unificar codigos y descripciones entre historiales en vietnamita y literatura cientifica en ingles.
- Generacion de material educativo para estudiantes de medicina: produccion de resumenes, casos de estudio simplificados y cuestionarios en vietnamita a partir de apuntes, con revision humana posterior obligatoria.
- Preprocesado y estructuracion de historias clinicas en vietnamita: extraccion de entidades, resumen de notas de evolucion y normalizacion de texto libre antes de alimentar un sistema de informacion hospitalaria; su tamano permite ejecutarlo en el propio puesto de trabajo sin enviar datos a la nube.
- Prototipado rapido de pipelines de IA medica en local: sirve como sustituto barato de modelos mayores durante el desarrollo de la interfaz, el formateo de prompts o la evaluacion de plantillas, antes de escalar a un modelo de mayor tamano.
- Despliegue offline en entornos sin conectividad: ambulancias, campamentos o zonas con red intermitente pueden ejecutar el modelo desde disco con llama.cpp y devolver respuestas en milisegundos sin dependencia de API externas.
- Aumento de datos sinteticos para entrenar clasificadores medicos en vietnamita: generacion de variaciones de frases y parafrasis para ampliar datasets etiquetados escasos, con filtrado y validacion por expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM recomendada por el autor para cada cuantizacion: ~2,4 GB para Q4_K_M y Q4_K_S, y ~2,3 GB para Q3_K_M y Q3_K_S. Son cifras de la model card, no estimaciones externas.
- Cache KV estimada a partir de la configuracion (2 x 28 capas x 8 cabezas KV x 128 de dimension x 2 bytes en fp16 = 112 KB por token): unos 0,94 GB con 8192 tokens de contexto y unos 4,7 GB con los 40.960 tokens maximos. Es una estimacion de calculo propia, no un dato publicado.
- GPU consumer: cabe con holgura en cualquier GPU con 4 GB o mas, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores. El cuello de botella sera la memoria, no la potencia de calculo.
- GPU de datacenter (A100, H100, L40S): el modelo es drasticamente mas pequeno que la memoria disponible; su uso tendria sentido solo para servir muchas peticiones concurrentes por GPU.
- CPU: viable en inferencia pura con llama.cpp, especialmente con Q4_K_M o Q3_K_M, sobre procesadores con soporte AVX2 o superior.
- Opciones de despliegue documentadas: llama.cpp, llama-cpp-python (con `n_gpu_layers=-1` para descargar todas las capas en GPU) y Ollama mediante un Modelfile.
- vLLM y TGI: no documentados para este repositorio; al ser un artefacto GGUF, el soporte en esos servidores es limitado o inexistente.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas publicas y se ofrecen como referencia de parametros, contexto y licencia, no como comparacion de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Idiomas destacados | Formato |
|---|---|---|---|---|---|
| Qwen-3-0.6B-Instruct-Vi-Medical-LoRA-GGUF | 596 M | 40.960 tokens | apache-2.0 (con matiz sobre el LoRA MIT) | Vietnamita, ingles | GGUF (Q3/Q4) |
| Qwen/Qwen3-0.6B (base) | ~596 M | 40.960 tokens | apache-2.0 | Multilingue amplio | safetensors, bfloat16 |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens | apache-2.0 | Multilingue, con buen soporte de vietnamita | safetensors, GGUF por la comunidad |
| Gemma 2 2B-it | ~2,6 B | 8.192 tokens | Licencia Gemma (uso comercial con condiciones) | Multilingue | safetensors, GGUF por la comunidad |

Frente al Qwen3-0.6B base, este repositorio aporta el ajuste medico en vietnamita y el empaquetado GGUF, pero pierde la precision bfloat16 original. Frente a Qwen2.5-0.5B-Instruct, la ventaja es la especializacion de dominio y una ventana de contexto mayor; la desventaja es la ausencia total de benchmarks que respalden la mejora. Frente a Gemma 2 2B-it, ofrece un tamano cuatro veces menor y licencia mas laxa, a cambio de una capacidad de razonamiento sustancialmente inferior por numero de parametros.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion: con 596 millones de parametros, la capacidad de retener y razonar conocimiento factual es muy limitada, y el dominio medico es especialmente sensible a errores.
- La propia model card advierte explicitamente de que el modelo puede generar informacion falsa y de que sus salidas no deben sustituir el consejo de un profesional en areas criticas. Cualquier uso clinico real requeriria validacion independiente, y en la Union Europea podria entrar en la categoria de producto sanitario regulado.
- Ausencia total de benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones especificas de dominio medico que permitan cuantificar su calidad real.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no ha pasado por revision externa ni por un uso contrastado.
- Sesgos: no documentados por el autor. Al estar ajustado sobre un dataset medico en vietnamita no descrito, se desconoce la distribucion de fuentes, la cobertura por subespecialidades y el posible sesgo geografico o demografico del corpus.
- Limitacion idiomatica: el foco es el vietnamita; el rendimiento en ingles se degrada respecto al Qwen3 base y en castellano no hay ninguna garantia, ya que no figura entre los idiomas declarados.
- Degradacion de contexto: aunque la configuracion declare 40.960 tokens, los ejemplos practicos usan 8192. En un modelo de este tamano, la atencion a contextos muy largos suele degradarse mucho antes de alcanzar el maximo teorico.
- Licencia: los metadatos de HuggingFace indican apache-2.0, pero la model card matiza que la licencia del repositorio se determino tras verificar la licencia de origen y que el adaptador LoRA es MIT. Conviene verificar el fichero LICENSE antes de un uso comercial y comprobar si el dataset medico de ajuste impone condiciones adicionales no declaradas.
- El LoRA ya esta fusionado en los pesos: no es posible separar el ajuste medico del modelo base, lo que impide revertir el sesgo de dominio si el modelo se comporta mal fuera del ambito sanitario.
- Los ficheros Q3_K_S y Q3_K_M (0,30 y 0,32 GB) aplican una compresion agresiva que en modelos pequenos suele producir perdidas de calidad notables; para uso real se recomienda Q4_K_M.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BachDaThan/Qwen-3-0.6B-Instruct-Vi-Medical-LoRA-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Adaptador LoRA de origen: https://huggingface.co/danhtran2mind/Qwen-3-0.6B-Instruct-Vi-Medical-LoRA
- Informe tecnico de la familia Qwen3 (referencia del modelo base): https://arxiv.org/abs/2505.09388
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los unicos enlaces verificables son los de HuggingFace y los recursos oficiales del ecosistema llama.cpp.
