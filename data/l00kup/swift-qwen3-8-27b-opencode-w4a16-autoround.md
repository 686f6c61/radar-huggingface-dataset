# L00kUp/Swift-Qwen3.8-27B-OpenCode-W4A16-AutoRound

## Resumen

La ficha corresponde a `L00kUp/Swift-Qwen3.8-27B-OpenCode-W4A16-AutoRound`, una cuantizacion comunitaria de tipo W4A16 en INT4 simetrico del modelo `ukisai/Swift-Qwen3.8-27b`, un derivado afinado del Qwen3.8-27B de Alibaba Cloud. La publica el usuario L00kUp, que declara explicitamente que no se trata de una version oficial de UkisAI ni de Frozenlock, sino de un trabajo independiente de cuantizacion orientado a cargas de codigo y agentes. El resultado es un checkpoint de aproximadamente 18 GB que conserva en BF16 el torre de vision, los embeddings y dos proyecciones concretas (GDN `linear_attn.in_proj_a` e `in_proj_b`), mientras que el resto de las capas del modelo de lenguaje y la cabeza MTP se cuantizan.

El modelo resuelve el problema de desplegar un 27B multimodal con contexto muy largo (hasta 262.144 tokens en la configuracion validada) en una unica GPU de gama profesional de consumo energetico contenido, en concreto una DGX Spark GB10. Para ello combina AutoRound 0.14.3, con calibracion sobre el dataset `nvidia/OpenCodeInstruct` (512 muestras de 2.048 tokens, 1.000 iteraciones y tamano de lote 4), y decodificacion especulativa mediante la cabeza MTP, validada en vLLM con tres tokens especulativos.

Su relevancia actual es doble: por un lado demuestra un flujo reproducible de cuantizacion INT4 preservando precisamente los modulos sensibles a la precision (vision y proyecciones GDN); por otro, documenta un caso real de incompatibilidad de kernel en SGLang, lo que resulta util para quien planifique el despliegue. No hay resultados de benchmarks publicados por el autor frente a modelos comparables: las cifras incluidas son mediciones de despliegue en un unico equipo, no envios canonicos a leaderboards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida (modulos GDN con `linear_attn`) y cabeza MTP (multi-token prediction); arquitectura base Qwen3.8-27B |
| Parametros totales | 27B (segun denominacion del modelo base `ukisai/Swift-Qwen3.8-27b`); no se detalla el desglose exacto |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 262.144 tokens en la configuracion de vLLM validada por el autor (`--max-model-len 262144`) |
| Tipos de cuantizacion | W4A16 INT4 simetrico, group size 128, empaquetado `auto_round:auto_gptq`; cache KV en FP8 (`fp8_e4m3`); bloques retenidos en BF16 (torre de vision, embeddings y proyecciones GDN `in_proj_a` / `in_proj_b`) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (`license: other`); el modelo base Qwen3.8-27B se mantiene bajo Apache License 2.0 |
| Formato de pesos | safetensors (AutoRound INT4 empaquetado como `auto_gptq`, exportacion de ~18 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.8-27B, un transformer multimodal (pipeline declarado `image-text-to-text`) que en esta variante Swift incorpora modulos de atencion hibrida identificados en la model card como GDN, con proyecciones `linear_attn.in_proj_a` e `in_proj_b`, ademas de una cabeza MTP pensada para decodificacion especulativa. Sobre esa base, UkisAI realiza el ajuste Swift y L00kUp aplica despues la cuantizacion. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento o afinado, ni si se emplearon tecnicas de RLHF o DPO.

El proceso de cuantizacion si esta descrito con precision: AutoRound 0.14.3 sobre la revision exacta `1b30aaaf753fe5c1cb51ada2ea0367a53445359c` del modelo fuente, con calibracion en `nvidia/OpenCodeInstruct` (512 muestras x 2.048 tokens), 1.000 iteraciones, batch size 4 y un limite de memoria de 96 GiB, ejecutado en una DGX Spark con `--disable_torch_compile`. Los bloques cuantizados son `model.language_model.layers` y `mtp.layers`. La innovacion tecnica destacable es la decision de mantener en BF16 la torre de vision, los embeddings y las proyecciones GDN, lo que preserva la precision de los componentes mas sensibles del modelo hibrido a cambio de un ligero incremento del tamano final (unos 18 GB). La cabeza MTP se cuantiza y se valida con vLLM MTP3. Se incluyen informes de cuantizacion por capa y un fichero `SHA256SUMS` con los hashes del material subido. El autor advierte que, al no aportar escalas KV calibradas, el uso de cache KV en FP8 puede afectar ligeramente a la calidad.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento: el autor verifico el razonamiento de nivel medio mediante el parser `qwen3` de vLLM.
- Generacion y reparacion de codigo: evaluado con MultiPL-E en C++ y Rust y con HumanEval adaptado a chat, incluyendo una correccion informada por error.
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text` y los pesos de la torre de vision se conservan en BF16 y se distribuyen con el checkpoint.
- Tool calling / function calling: soportado en vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_coder`; el autor indica que las llamadas a herramientas se parsean automaticamente.
- Decodificacion especulativa nativa: cabeza MTP cuantizada y validada con tres tokens especulativos (`num_speculative_tokens: 3`).
- Contexto largo: servido con `--max-model-len 262144` y cache KV en FP8.
- Cache de prefijos: la bandera `--enable-prefix-caching` esta presente, pero con MTP activo esta build de vLLM desactiva la reutilizacion de prefijos entre peticiones (el autor lo hace visible con `--enable-prompt-tokens-details`).
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio de asistencia al desarrollador con contexto largo: el modelo permite cargar repositorios o ficheros extensos en una unica ventana de 262.144 tokens y responder preguntas sobre el codigo sin troceado agresivo, algo viable en una sola DGX Spark GB10.
- Generacion de codigo en pipelines de integracion continua: gracias al tool calling con parser `qwen3_coder`, puede invocarse como agente que consulta APIs, ejecuta comandos y aplica parches dentro de un flujo de CI/CD.
- Reparacion automatica de codigo fallido: los datos de MultiPL-E muestran una conversion de fallo a exito alta (C++ de 122/161 a 137/161; Rust de 122/156 a 136/156), lo que lo hace adecuado como paso de auto-correccion tras un fallo de compilacion o de tests.
- Agentes multi-paso con uso de herramientas: la combinacion de tool calling, modo de pensamiento y la evaluacion Tool Eval Hard Mode (28/38) apunta a tareas de agente con varias llamadas encadenadas, como reservas, consultas a bases de datos o automatizacion de back-office.
- Analisis de documentos con imagenes: al conservar la torre de vision en BF16, el modelo puede procesar capturas, diagramas o documentacion escaneada junto con texto para extraer informacion estructurada.
- Despliegue en hardware de borde profesional: con ~18 GB de pesos, cabe en GPUs de 24 GB y en plataformas unificadas como la DGX Spark, lo que habilita inferencia local para datos sensibles sin salida a la nube.
- Asistente de codigo autoalojado: servir mediante vLLM con el endpoint compatible con OpenAI permite integrarlo en IDEs y herramientas internas manteniendo los datos dentro de la organizacion.
- Evaluacion y prototipado de cuantizacion: al incluir informes de cuantizacion por capa y hashes, sirve como referencia para equipos que quieran reproducir o comparar recetas de AutoRound sobre modelos hibridos.

## Benchmarks y rendimiento

Las cifras siguientes son mediciones de despliegue realizadas por el autor en una unica DGX Spark GB10, no resultados canonicos de leaderboard. Tool Eval y HumanEval en modo chat se ejecutaron con razonamiento medio y semilla 42; MultiPL-E, con completados en crudo, temperatura 0.2 y semilla 42.

| Evaluacion | Resultado |
|---|---|
| Tool Eval Hard Mode | 28/38 (74/100) |
| Decodificacion en endpoint, prefijo nuevo / repetido | 19,7 / 24,1 tok/s |
| Generacion con llama-benchy, profundidad 2k / 8k | 21,2 / 19,7 tok/s |
| MultiPL-E C++, inicial -> una reparacion | 122/161 -> 137/161 |
| MultiPL-E Rust, inicial -> una reparacion | 122/156 -> 136/156 |
| HumanEval Python adaptado a chat, inicial -> una reparacion | 105/164 -> 148/164 |

El propio autor advierte que el resultado de HumanEval no es un pass@1 canonico: usa chat completions, normalizacion de indentacion, ejecucion aislada y una correccion informada por error por cada fallo inicial. El autor senala ademas que la puntuacion final refleja sobre todo la alta tasa de conversion de reparaciones (43/59) y que el rendimiento inicial de este modelo y el de la variante TonyD full Flash-Next estaban practicamente empatados. No se han publicado resultados de benchmarks comparativos adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 18 GB en la exportacion W4A16; hay que sumar la cache KV, que en FP8 a 262.144 tokens de contexto puede ser muy elevada.
- GPU validadas por el autor: una DGX Spark GB10 con `--gpu-memory-utilization 0.90`. No se mencionan otras GPU probadas.
- Compatibilidad con GPU de consumo: con 18 GB de pesos, entra en GPUs de 24 GB como la RTX 4090 o la RTX 3090, aunque el contexto maximo de 262.144 tokens no seria alcanzable en esas tarjetas sin reducir la ventana o el numero de secuencias.
- Opciones de despliegue: vLLM es la via validada, con la imagen nocturna `vllm/vllm-openai:nightly-8a728663c1c3eeace834a95f5654fa653cc1998c`, `--trust-remote-code`, `--quantization auto_round` y `--reasoning-parser qwen3`. SGLang no es compatible con esta exportacion en la version probada.
- SGLang: el repacker Marlin de la imagen probada fusiona una proyeccion GDN de 96 elementos y falla porque 96 no es divisible por su tile de salida de 64. El autor recomienda la ruta de vLLM salvo que una build mas reciente corrija esa restriccion de kernel o de cargador.
- Decodificacion especulativa: configurar `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Latencia y throughput medidos: 19,7 tok/s en decodificacion con prefijo nuevo y 24,1 tok/s con prefijo repetido; 21,2 tok/s a 2k de profundidad y 19,7 tok/s a 8k con llama-benchy. Son valores de una unica DGX Spark, no extrapolables a otras plataformas.
- Limitaciones de memoria en el proceso de cuantizacion: el autor documento un limite de 96 GiB de memoria de modelo y `--disable_torch_compile` durante el proceso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L00kUp/Swift-Qwen3.8-27B-OpenCode-W4A16-AutoRound | 27B | 262.144 tokens en la configuracion validada | W4A16 INT4, group size 128, AutoRound 0.14.3 | Swift Open License v1.0 (+ Apache 2.0 en la base) | HuggingFace, 0 descargas y 0 likes en el momento de la ficha |
| ukisai/Swift-Qwen3.8-27b (modelo fuente) | 27B | no disponible | BF16 sin cuantizar | Swift Open License v1.0 (+ Apache 2.0) | HuggingFace |
| Frozenlock/Qwen3.8-27B-int4-AutoRound | 27B | no disponible | INT4 AutoRound con receta distinta | no disponible | HuggingFace |

La model card no ofrece comparaciones numericas frente al modelo fuente en BF16 ni frente a la variante de Frozenlock: solo indica que la fuente, el dataset de calibracion, la version de AutoRound y la receta de ajuste son explicitamente diferentes. No hay datos publicados que permitan afirmar cual de las tres opciones rinde mejor en tareas concretas.

## Limitaciones y advertencias

- La cuantizacion es un trabajo comunitario independiente: no esta respaldada por UkisAI ni por Frozenlock, por lo que la precision y el comportamiento pueden diferir de la version oficial en BF16.
- El autor advierte que el uso de cache KV en FP8 puede degradar ligeramente la calidad, ya que el checkpoint no incluye escalas KV calibradas.
- Con la decodificacion especulativa MTP activa, esta build de vLLM desactiva la reutilizacion de prefijos entre peticiones aunque se active `--enable-prefix-caching`, algo que afecta al rendimiento en cargas con prompts repetidos.
- SGLang no sirve directamente esta exportacion en la version probada, lo que limita las opciones de despliegue y obliga a usar vLLM.
- Restriccion de licencia comercial: la Swift Open License v1.0 exige una Swift Enterprise License independiente para uso comercial por parte de una entidad legal cuya facturacion bruta anual consolidada sea igual o superior a 1.000.000 de USD. Deben leerse `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` antes de usar o redistribuir.
- El conjunto multimodal se incluye, pero la validacion del autor se centro en texto y codigo, por lo que el rendimiento real en tareas de vision no esta documentado.
- Las cifras de rendimiento proceden de una unica DGX Spark GB10; no hay mediciones en otras GPU ni con otros niveles de concurrencia.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- El resultado de HumanEval incluido no es un pass@1 canonico y no deberia compararse directamente con cifras de leaderboard.
- El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/L00kUp/Swift-Qwen3.8-27B-OpenCode-W4A16-AutoRound
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Referencia de AutoRound citada, Frozenlock/Qwen3.8-27B-int4-AutoRound: https://huggingface.co/Frozenlock/Qwen3.8-27B-int4-AutoRound
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Los resultados de busqueda web disponibles no contienen ningun enlace relevante sobre este modelo (devolvieron comparativas de camaras de vigilancia), por lo que no se anaden mas referencias.
