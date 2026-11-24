# CMSManhattan/JiRackGemma-72B-alpha-GGUF

## Resumen

JiRack Gemma 72B alpha (GGUF) es una publicacion del desarrollador independiente CMSManhattan (Konstantin Grabko) que redistribuye en formato GGUF un modelo de 71.380.799.096 parametros construido sobre la arquitectura JiRack, derivada a su vez de un modelo Gemma de Google DeepMind. Se trata de la fase alpha: la arquitectura y los pesos estan completos, pero el modelo no ha recibido entrenamiento propio adicional, por lo que reproduce el comportamiento del Gemma original en lugar de mejorarlo. El objetivo declarado es servir como base para un entrenamiento posterior con la capacidad ampliada ya presente.

La relevancia de esta publicacion es doble. Por un lado, documenta con detalle inusual un proceso de reimplementacion de arquitectura: el autor compara su implementacion JiRack con el codigo de transformers del modelo fuente y reporta coincidencias de hasta KL 1,35e-12 y 100 % de acuerdo en top-1 en las primeras 12 capas, ademas de auditoria de los 2.018 tensores del checkpoint. Por otro, introduce una innovacion estructural concreta: cada capa lineal es una BitLinear con conmutador ternario (lambda), aunque en esta alpha lambda = 0 y los pesos permanecen en precision completa.

El modelo se distribuye exclusivamente en GGUF para llama.cpp, con contexto configurado de 262.144 posiciones, vocabulario de 262.144 tokens y 120 capas organizadas en grupos de 6 (5 de ventana deslizante de 1.024 y 1 global). La licencia es propietaria (jirack-proprietary), lo que condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma, modificado como JiRack; atencion hibrida con capas de ventana deslizante (1.024) y capas globales; capas lineales BitLinear con conmutador ternario (lambda = 0 en esta alpha) |
| Parametros totales | 71.380.799.096 (71,4B en el modelo de lenguaje; 72,0B en el checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 posiciones configuradas; las comprobaciones del autor usaron ventanas de 512 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q2_K (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | jirack-proprietary (propietaria, todos los derechos reservados); el Gemma fuente es Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en este repositorio |
| Capas | 120, en grupos de 6: 5 de ventana deslizante + 1 global |
| Hidden size / FFN | 5.376 / 27.392 |
| Atencion | 32 cabezas de query; capas deslizantes con 16 cabezas KV y dim 256; capas globales con 4 cabezas KV y dim 512 |
| Vocabulario | 262.144 |
| Tamano del repositorio | 145,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de Gemma con atencion hibrida: 120 capas agrupadas en bloques de 6, donde 5 capas usan atencion de ventana deslizante de 1.024 tokens y 1 capa es global. Las capas deslizantes emplean 16 cabezas key-value con dimension 256, mientras que las globales reducen a 4 cabezas KV con dimension 512, un diseno que busca contener el coste de atencion en contextos largos. El hidden size es 5.376 y la FFN 27.392, con un vocabulario de 262.144 tokens.

La innovacion propia de JiRack es que cada capa lineal es una BitLinear con un conmutador ternario (lambda). En esta alpha lambda = 0, de modo que los pesos se mantienen en precision completa y el modelo equivale funcionalmente al Gemma fuente; con lambda = 1 el autor reporta que el forward pass es finito, lo que abre la via a un modelo ternario de mucho menor tamano de fichero. Respecto al entrenamiento, esta version alpha no ha recibido entrenamiento propio: el autor lo declara explicitamente y situa como siguientes pasos el entrenamiento continuado en texto general, codigo y matematicas, el fine-tuning para tool calling y agentes, y el entrenamiento ternario (lambda de 0 a 1). La validacion publicada se limita a comparaciones de implementacion y a la integridad del checkpoint, no a metricas de calidad de tarea.

## Capacidades

- Generacion de texto conversacional en formato chat, ejecutable con `llama-cli -cnv` y `llama-server`.
- Reproduccion fiel del comportamiento del Gemma fuente: el autor reporta logits bit-identicos en las 120 capas sobre 4 prompts (KL maximo 0, top-1 100 %).
- Procesamiento de contextos largos: 262.144 posiciones configuradas, con capas globales intercaladas cada 6 capas.
- Manejo de codigo y de texto multilingue en las pruebas de referencia (prompts en ingles, codigo y ruso), aunque no se declara una lista oficial de idiomas.
- Capacidad de tool calling y agentes: no verificada en esta alpha; el autor la situa en la hoja de ruta como fine-tuning futuro. Sus modelos ternarios previos (16B, 8B, 2B) si pasan tests propios de tool calling (115/117, 113/117 y 110/117 casos).
- Vision: el codificador de imagen del checkpoint no forma parte de esta publicacion, por lo que no hay capacidades multimodales disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion de arquitectura por parte de partners: el modelo sirve para verificar que la reimplementacion JiRack reproduce el Gemma fuente, con metricas de KL y acuerdo top-1 ya publicadas. Es el caso de uso declarado por el autor.
- Base para entrenamiento continuado: al disponer de los pesos completos y de la arquitectura modificada, un equipo con GPU puede partir de esta alpha para entrenar en texto general, codigo y matematicas sin reconstruir el modelo.
- Investigacion sobre cuantizacion ternaria: la presencia de BitLinear con conmutador lambda permite experimentar con la transicion de precision completa a ternaria y medir el impacto en perplejidad y calidad.
- Despliegue en servidor con llama.cpp: el fichero Q4_K_M (43,10 GB) cabe en una GPU de 48-80 GB y puede servirse con `llama-server -c 32768` para prototipos de chat con contexto largo.
- Pruebas de contexto largo en CPU: el Q2_K (26,79 GB) permite una primera exploracion en hardware modesto, aunque con perdida de calidad significativa (ver benchmarks).
- Referencia para auditoria de checkpoints: la metodologia de verificacion tensor a tensor (2.018 tensores, 0 errores) es reutilizable como plantilla para validar conversiones de pesos en otros proyectos.
- Experimentacion con atencion hibrida: la combinacion de capas deslizantes de 1.024 y capas globales cada 6 capas es un objeto de estudio para analizar coste y calidad en ventanas largas.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros). La unica tabla disponible mide fidelidad de la cuantizacion GGUF frente al modelo fuente en Q8_0, sobre 3 ventanas de 512 tokens en CPU con llama.cpp c6a0ff11a:

| Fichero | KL medio vs fuente | Mismo token top-1 | Perplejidad (fuente: 7531,84) |
|---|---|---|---|
| Q8_0 | -0,000001 | 100,00 % | 7531,84 |
| Q4_K_M | 0,619124 | 77,65 % | 8625,99 |
| Q2_K | 3,112594 | 51,24 % | 2365,98 |

Ademas, se reportan dos comprobaciones de implementacion: frente al codigo de transformers del modelo fuente, en las primeras 12 capas en fp32 y con 5 prompts (ingles, codigo, ruso, un texto de 1.723 tokens y chat), KL maximo de 1,35e-12 y 100 % de acuerdo top-1; y sobre el checkpoint completo de 120 capas, logits bit-identicos en 4 prompts (KL maximo 0, top-1 100 %). La perplejidad del Q2_K es inferior a la de la fuente, un resultado anomalo que el autor no interpreta y que conviene tratar con cautela.

## Requisitos de hardware

- VRAM estimada para Q8_0 (75,87 GB): requiere al menos 80 GB, es decir, A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- VRAM estimada para Q4_K_M (43,10 GB): segun el autor, cabe en una GPU de 48-80 GB; encaja en A6000 48 GB, A100 80 GB, H100 80 GB y, con ajustes, en RTX 6000 Ada 48 GB.
- VRAM estimada para Q2_K (26,79 GB): viable en GPUs de 32 GB como la V100 32 GB o la RTX 5090; en consumer de 24 GB requeriria descarga parcial a CPU.
- En consumer GPU: ningun fichero cabe integro en una RTX 4090 de 24 GB; el Q2_K es el unico candidato cercano y exigiria offloading.
- Despliegue: llama.cpp (llama-cli, llama-server), con soporte declarado de endpoints compatibles. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. Las mediciones publicadas se hicieron en CPU y no incluyen tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| JiRack Gemma 72B alpha | 71,4B (72,0B checkpoint) | 262.144 | jirack-proprietary | GGUF | Alpha sin entrenamiento propio |
| Gemma fuente (Google DeepMind) | No disponible en la informacion | No disponible en la informacion | Apache 2.0 | No disponible en la informacion | Modelo base de referencia |
| Modelos ternarios JiRack (16B, 8B, 2B) | 16B / 8B / 2B | No disponible | No disponible | GGUF | Publicados y probados en llama.cpp |

La comparacion con alternativas de la misma categoria (modelos densos de ~70B en GGUF) no esta disponible en la informacion proporcionada. El unico punto de referencia solido es el Gemma original, del que este modelo hereda pesos y comportamiento, y los modelos ternarios del mismo autor, que si cuentan con pruebas de tool calling.

## Limitaciones y advertencias

- Estado alpha sin entrenamiento propio: el modelo no mejora al Gemma fuente y no debe presentarse como un modelo entrenado o afinado.
- Licencia propietaria (jirack-proprietary, todos los derechos reservados): el uso comercial requiere acuerdo con el autor; el Gemma subyacente es Apache 2.0, pero la modificacion y los pesos publicados quedan bajo la licencia del autor.
- Perdida de calidad severa en cuantizaciones bajas: Q4_K_M conserva el 77,65 % de acuerdo top-1 y Q2_K solo el 51,24 %, con un aumento de perplejidad de mas del 14 % en Q4_K_M. Para evaluacion seria, usar Q8_0.
- Perplejidad del Q2_K inferior a la de la fuente (2365,98 frente a 7531,84): resultado no explicado que sugiere que las metricas de perplejidad no son comparables entre ficheros en este contexto.
- Sin lista oficial de idiomas ni evaluacion multilingue publicada; las pruebas de referencia incluyen un prompt en ruso pero no constituyen una validacion.
- Sin capacidades de vision en esta publicacion: el codificador de imagen del checkpoint queda fuera del release.
- Tool calling y agentes no verificados en este modelo; solo hay evidencia en los modelos ternarios menores del mismo autor.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor.
- Contexto de 262.144 posiciones configurado, pero las comprobaciones se hicieron con ventanas de 512 tokens; el rendimiento real en contextos largos no esta validado.
- Modelo de autor individual con infraestructura limitada: el propio autor solicita apoyo de computo para las siguientes fases, lo que afecta a la previsibilidad del mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CMSManhattan/JiRackGemma-72B-alpha-GGUF
- Demo chat (Space): https://huggingface.co/spaces/CMSManhattan/JiRack-Gemma-72B-demo
- Contacto del autor: grabko@cmsmanhattan.com
- Licencia del Gemma fuente: fichero LICENSE-APACHE incluido en el repositorio (Apache 2.0)
- Paper, blog o repositorio de codigo adicionales: no disponibles en la informacion proporcionada
