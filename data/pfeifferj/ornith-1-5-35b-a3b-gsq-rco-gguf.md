# pfeifferj/Ornith-1.5-35B-A3B-GSQ-RCO-GGUF

## Resumen

Ornith-1.5-35B-A3B-GSQ-RCO-GGUF es una reproducción comunitaria de cuantizaciones GGUF de 3 y 3,5 bits del modelo Ornith-1.5-35B-A3B, publicado por el usuario pfeifferj. El modelo base es un mixture-of-experts de la familia Qwen3.5, con 34.660.610.688 parámetros totales (unos 35B) y aproximadamente 3B activos por token, distribuido originalmente por ornith-ai. El repositorio no contiene pesos nuevos: contiene dos ficheros GGUF cuantizados que reducen el peso de 69,377 GB en BF16 a 12,992 GB (3 bits) y 15,163 GB (3,5 bits), es decir, una reducción de tamaño de en torno a 5,3x en la variante de 3 bits.

La particularidad técnica es el método de cuantización empleado, que combina GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization), dos técnicas desarrolladas en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria. GSQ aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación de Gumbel-Softmax, mientras que RCO reparte un presupuesto exacto de tamaño entre los tensores asignando a cada uno un tipo de cuantización. Frente a los controles con imatrix nativa, las builds GSQ-RCO obtienen mejor MMLU-Pro con un tamaño de fichero equivalente.

Es relevante ahora porque demuestra que un MoE de 35B se puede ejecutar con pesos de 13-15 GB sin cuantización agresiva por bloques uniformes, manteniendo una perplexity muy cercana a BF16 (incremento del 3,7% a 3 bits y del 1,4% a 3,5 bits). Todo el flujo está verificado con llama.cpp, lo que permite desplegarlo en GPU de consumo y en servidores sin aceleradores de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts de la familia Qwen3.5 (text-only); la procedimiento de cuantizacion menciona tensores de convolucion y de estado, ademas de atencion, routers y shared experts |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | No disponible en la model card; los ejemplos de llama.cpp y las evaluaciones GSM8K/IFEval usan 8.192 tokens, y MMLU-Pro se evalua con 2.048 tokens |
| Tipos de cuantizacion | Dos builds: 3-bit (12,992 GB) y 3,5-bit (15,163 GB). Cuantizacion mixta: expertos enrutados en Q2_K/Q3_K/Q4_K, embeddings y matriz de salida en Q4_K, atencion y shared experts en Q8_0, routers, normas y tensores de convolucion/estado en F32 |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (incluye modelo de texto, tokenizer y chat template) |
| Tamano del repositorio | 28,2 GB |
| Metodo de cuantizacion | GSQ (Gumbel-Softmax Quantization) + RCO (Riemannian Constrained Optimization) |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B (revision 10fbf86f) |
| Descargas / likes | 4.042 descargas, 14 likes |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE) de la familia Qwen3.5, con unos 35B parametros totales y unos 3B activos por token, lo que sitúa su coste de computo por token en el orden de un modelo denso de 3B. El repositorio aqui descrito no entrena ni afina el modelo: solo aplica cuantizacion post-entrenamiento sobre los pesos publicados en BF16. El pipeline de cuantizacion combinado es el siguiente: se capturan activaciones de expertos en 40 capas a partir de un millon de tokens con una mezcla de 45% calibration_mixture, 40% OpenThoughts y 15% FineWeb, conservando hasta 128 filas de entrenamiento y 64 de validacion por experto; despues se ejecutan 40 actualizaciones GSQ por proyeccion con 32 filas por actualizacion, ajustando por separado las salidas de gate, up y down (usando las activaciones originales de gate/up para la proyeccion down) y manteniendo escalas y offsets fijos; por ultimo, RCO ejecuta 50 pasos por tamano objetivo sobre cuatro secuencias de calibracion y selecciona la asignacion final sobre cuatro secuencias de validacion distintas, ensamblando despues los tensores empaquetados en GGUF sin recuantizar.

La innovacion principal es el reparto no uniforme de precision. En lugar de aplicar un unico tipo de cuantizacion a todas las matrices, RCO asigna a cada uno de los N tensores uno de los K tipos disponibles bajo un presupuesto exacto de tamano total, reformulado como una optimizacion sobre una variedad riemanniana suave en el espacio de logits. GSQ, por su parte, aprende las rejillas escalares por coordenada junto con las escalas por grupo mediante una relajacion de Gumbel-Softmax, en lugar de fijar la rejilla a priori como hacen los esquemas clasicos tipo k-quants. El resultado es que los tensores mas sensibles (routers, normas, convoluciones, estados, atencion y shared experts) conservan alta precision (Q8_0 o F32), mientras que los expertos enrutados, que concentran el grueso de los parametros, se reparten entre Q2_K, Q3_K y Q4_K. No se documenta en la informacion disponible ningun proceso de RLHF, DPO o decodificacion especulativa asociado a estas builds.

## Capacidades

- Generacion de texto conversacional en formato chat, con chat template Jinja incluido en los ficheros GGUF.
- Modo de razonamiento (thinking) activado por defecto, con la opcion de desactivarlo mediante `enable_thinking=false` en los kwargs de la plantilla.
- Preservacion del bloque de razonamiento entre turnos mediante `preserve_thinking=true`, util para conversaciones multi-turno donde se quiere conservar la traza de pensamiento.
- Razonamiento matematico: se evalua con GSM8K en modo thinking, aunque con una muestra muy reducida (ocho preguntas).
- Seguimiento de instrucciones: se evalua con IFEval en modo strict, sin thinking y con limite de 1.024 tokens.
- Conocimiento general y razonamiento de opcion multiple: se evalua con MMLU-Pro zero-shot (2.000 preguntas, 14 categorias) mediante puntuacion por log-verosimilitud de la letra de respuesta.
- Capacidades multimodales o de audio: no disponibles; el modelo base es explicitamente text-only.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente, mas alla de la existencia del modo thinking.
- Capacidades multilingues: no disponibles, no se declara la lista de idiomas.

## Casos de uso

- Despliegue local en estacion de trabajo con GPU de consumo: con 12,992 GB (3 bits) o 15,163 GB (3,5 bits) de pesos, el modelo cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, lo que permite ejecutar un MoE de 35B en hardware no profesional.
- Servicio de chat multi-turno autoalojado: usando `llama-server` con la plantilla Jinja y `preserve_thinking=true` se mantiene la traza de razonamiento entre turnos, util para asistentes tecnicos con ventanas de 8.192 tokens.
- Razonamiento matematico asistido en local: el modo thinking esta activo por defecto y se han publicado resultados en GSM8K, de modo que sirve para resolver problemas numericos paso a paso sin enviar datos a APIs externas.
- Asistente de redaccion y resumen en entornos con requisitos de privacidad: al ejecutarse integramente en local con llama.cpp, no hay salida de datos hacia terceros, lo que encaja en sectores regulados.
- Procesamiento por lotes en servidor con varias GPU: el flag `-ngl 999` reparte todas las capas en GPU, lo que permite escalar horizontalmente el throughput en nodos con varias tarjetas.
- Investigacion en cuantizacion de MoE: el repositorio incluye controles emparejados (matched initializer) y controles con imatrix nativa del mismo tamano, junto con los IDs y puntuaciones de MMLU-Pro, lo que permite reproducir la comparacion GSQ-RCO frente a esquemas clasicos.
- Evaluacion de pipelines de inferencia GGUF: sirve como banco de pruebas para medir el efecto del KV cache en f32, del contexto y de las opciones de la plantilla sobre la calidad de salida.
- Prototipado de agentes conversacionales en local antes de decidir el despliegue en produccion, comparando la build de 3 bits y la de 3,5 bits segun la VRAM disponible.

## Benchmarks y rendimiento

MMLU-Pro sin razonamiento, contexto de 2.048 tokens y cero tokens generados; 2.000 preguntas en 14 categorias, puntuacion zero-shot por log-verosimilitud. La perplejidad se calcula sobre 4.088 predicciones next-token en ocho contextos de 1.024 tokens; menor es mejor.

| Build | Tamano | PPL | MMLU-Pro |
|---|---:|---:|---:|
| BF16 de referencia | 69,377 GB | 3,4112 | 47,60% |
| GSQ-RCO 3-bit | 12,992 GB | 3,5369 | 43,70% |
| Native imatrix 3-bit (control) | 12,984 GB | 3,5320 | 41,90% |
| Matched initializer 3-bit (control) | 12,992 GB | 3,5353 | 45,35% |
| GSQ-RCO 3,5-bit | 15,163 GB | 3,4575 | 43,20% |
| Native imatrix 3,5-bit (control) | 15,156 GB | 3,4795 | 43,95% |
| Matched initializer 3,5-bit (control) | 15,163 GB | 3,4575 | 44,65% |

GSM8K usa ocho preguntas con thinking activado y un limite de 2.048 tokens de salida; la puntuacion comprueba la respuesta numerica tras `####`. IFEval usa 16 prompts con thinking desactivado, puntuacion estricta y limite de 1.024 tokens. Ambos con temperatura 0 y contexto de 8.192 tokens.

| Build | GSM8K | IFEval strict | IFEval en el limite de tokens |
|---|---:|---:|---:|
| BF16 de referencia | 4/8 | 14/16 | 2/16 |
| GSQ-RCO 3-bit | 8/8 | 11/16 | 3/16 |
| GSQ-RCO 3,5-bit | 7/8 | 14/16 | 1/16 |

Dos pasadas de IFEval en BF16 y una en 3 bits alcanzaron el limite de tokens. Excluyendo esas pasadas, los resultados serian 12/16, 10/16 y 14/16 respectivamente. Ninguna respuesta de GSM8K alcanzo el limite. La perplejidad sube un 3,7% a 3 bits y un 1,4% a 3,5 bits respecto a BF16. Ambas builds GSQ quedan por debajo de sus matched initializers en MMLU-Pro.

## Requisitos de hardware

- VRAM para los pesos: 12,992 GB en la build de 3 bits y 15,163 GB en la de 3,5 bits. El BF16 de referencia ocupa 69,377 GB.
- VRAM adicional: hay que sumar el KV cache y los buffers de computo de llama.cpp. El ejemplo oficial usa `-ctk f32 -ctv f32` con contexto de 8.192 tokens, lo que aumenta el consumo respecto a un KV cache cuantizado. La model card no publica cifras de VRAM total, por lo que cualquier valor por encima de los pesos es una estimacion.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB permite ejecutar cualquiera de las dos builds con holgura. Una GPU de 16 GB puede alojar la build de 3 bits, pero la de 3,5 bits queda muy justa una vez anadido el KV cache.
- GPU profesionales: A100 40/80 GB, H100 y L40S soportan ambas builds sin problema, incluso con contextos largos y KV cache en f32.
- Multi-GPU: el flag `-ngl 999` reparte las capas entre todas las GPU disponibles; util para nodos con varias tarjetas de 24 GB.
- Ejecucion en CPU: al ser GGUF, es posible ejecutar en CPU con llama.cpp reservando en RAM el tamano del fichero mas el KV cache, aunque el rendimiento no esta documentado.
- Opciones de despliegue confirmadas: llama.cpp en el commit upstream `58367713`. La model card no verifica otros runtimes, por lo que el soporte en Ollama, LM Studio o similares no esta garantizado. vLLM y TGI no se mencionan.
- Ajustes de muestreo recomendados por el autor: `--temp 0.6 --top-p 0.95 --top-k 20`, con `--jinja` y `--chat-template-kwargs '{"preserve_thinking":true}'`.
- Latencia y throughput: no disponibles. Al tener unos 3B parametros activos por token, el regimen de computo deberia acercarse al de un modelo denso de 3B, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de datos de otros modelos externos comparables en la informacion proporcionada. La comparacion disponible es interna al propio modelo, entre la referencia BF16 y los distintos esquemas de cuantizacion al mismo presupuesto de tamano.

| Build | Parametros totales | Tamano | PPL | MMLU-Pro | IFEval strict | Licencia |
|---|---:|---:|---:|---:|---:|---|
| BF16 de referencia | 34,66B | 69,377 GB | 3,4112 | 47,60% | 14/16 | MIT (modelo base) |
| GSQ-RCO 3-bit | 34,66B | 12,992 GB | 3,5369 | 43,70% | 11/16 | MIT |
| Matched initializer 3-bit | 34,66B | 12,992 GB | 3,5353 | 45,35% | no disponible | no disponible |
| Native imatrix 3-bit | 34,66B | 12,984 GB | 3,5320 | 41,90% | no disponible | no disponible |
| GSQ-RCO 3,5-bit | 34,66B | 15,163 GB | 3,4575 | 43,20% | 14/16 | MIT |
| Native imatrix 3,5-bit | 34,66B | 15,156 GB | 3,4795 | 43,95% | no disponible | no disponible |

La comparacion con modelos de otros autores de la misma categoria (MoE de 30-40B con unos 3B activos) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Reproduccion comunitaria independiente: los ficheros los ha producido un tercero aplicando los metodos publicados de GSQ y RCO. No son una release de IST-DASLab ni cuentan con el aval de los autores de los articulos ni de ornith-ai.
- Perdida de calidad medible: la perplejidad sube un 3,7% a 3 bits y un 1,4% a 3,5 bits respecto a BF16. En MMLU-Pro la caida es de 3,90 puntos en 3 bits y de 4,40 puntos en 3,5 bits.
- Contradiccion entre metricas: la build de 3,5 bits obtiene mejor perplejidad que la de 3 bits (3,4575 frente a 3,5369) pero peor MMLU-Pro (43,20% frente a 43,70%), y ambas quedan por debajo de sus matched initializers. La build de 3,5 bits tambien pierde en IFEval strict respecto a BF16 en el recuento bruto (14/16 frente a 14/16, con una pasada adicional alcanzando el limite de tokens en 3 bits).
- Evidencia estadistica limitada: GSM8K usa solo ocho preguntas e IFEval 16 prompts. La diferencia de 8/8 frente a 4/8 en GSM8K no es concluyente con esa muestra, y varias pasadas alcanzan el limite de tokens, lo que distorsiona la puntuacion bruta.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion para estas builds.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad, ni para el modelo base ni para las cuantizaciones.
- Idiomas: la lista de idiomas soportados no esta disponible, por lo que no se puede garantizar el rendimiento fuera del ingles sin evaluacion adicional.
- Contexto: la model card no declara la longitud maxima de contexto del modelo base. Los ejemplos y evaluaciones usan 8.192 tokens, pero no implica que ese sea el limite real.
- Dependencia de version: la build se ha probado con un commit concreto de llama.cpp (`58367713`). Versiones mas antiguas pueden no soportar la plantilla Jinja o los kwargs `preserve_thinking` y `enable_thinking`.
- KV cache en f32: la configuracion recomendada oficial usa `-ctk f32 -ctv f32`, lo que incrementa notablemente el consumo de memoria frente a un KV cache cuantizado y puede impedir el despliegue en GPU de 16 GB.
- Licencia: el repositorio se publica bajo MIT, lo que permite uso comercial, pero conviene verificar los terminos del modelo base ornith-ai/Ornith-1.5-35B-A3B antes de un despliegue en produccion.
- Sin soporte multimodal: el modelo es explicitamente text-only.
- Tool calling: no hay documentacion que confirme soporte de function calling, por lo que no se debe asumir en pipelines de agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pfeifferj/Ornith-1.5-35B-A3B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Revision del modelo base usada para cuantizar: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/tree/10fbf86fed7ecee4a061f8b499a618f46001cac1
- Paper de GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper de RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Codigo de GSQ: https://github.com/IST-DASLab/GSQ
- Codigo de RCO: https://github.com/IST-DASLab/RCO
- Deep Algorithms and Systems Lab (DASLab): https://github.com/IST-DASLab
- Commit de llama.cpp probado: https://github.com/ggml-org/llama.cpp/commit/58367713a6935c0810103378144008df32e3d5db
- DOI asociado: https://doi.org/10.57967/hf/10579
