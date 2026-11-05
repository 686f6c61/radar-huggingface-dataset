# litert-community/Ornith-1.0-9B

## Resumen

Ornith-1.0-9B es un modelo de lenguaje denso de aproximadamente 9.400 millones de parametros desarrollado por ornith-ai, descrito por sus autores como parte de "una familia de modelos open source auto-mejorables para coding agentico". Se trata de un post-entrenamiento sobre Qwen/Qwen3.5-9B, cuyo decodificador de texto comparte configuracion clave por clave con el modelo original. La version aqui documentada es la conversion realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`), pensada para ejecucion on-device en el runtime LiteRT-LM de Google.

El modelo emplea la arquitectura hibrida de Qwen3.5: 32 capas, de las cuales 24 son GatedDeltaNet de atencion lineal y 8 son atencion completa (una de cada cuatro), con tamano oculto de 4096, 16 cabezas de atencion con 4 KV heads de 256 dimensiones, y atencion lineal con 16 cabezas de clave y 32 de valor de 128 dimensiones. El vocabulario es de 248.320 tokens con embeddings no atados. El checkpoint original es multimodal, pero estos ficheros contienen unicamente el decodificador de texto (8.953.803.264 de los 9.409.813.744 parametros totales del release).

La relevancia de esta ficha reside en dos factores: por un lado, el modelo destaca en tareas de coding agentico segun los datos del vendedor (Terminal-Bench 2.1 de 43,1 frente a 21,3 de Qwen3.5-9B; SWE-bench Verified de 69,4 frente a 53,2); por otro, esta conversion demuestra que un modelo de casi 9B puede ejecutarse en hardware de consumo y movil con cuantizacion agresiva (INT8 y Mixed INT4), con velocidades de decodificacion de 44,9 tok/s en GPU de un Mac Studio M4 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5: 24 capas GatedDeltaNet (atencion lineal) + 8 capas de atencion completa |
| Parametros totales | 8.953.803.264 (solo decodificador de texto); 9.409.813.744 en el release completo con vision tower |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo original; 4.096 tokens en estos ficheros LiteRT-LM |
| Tipos de cuantizacion | INT8 dinamico (capas lineales) e INT4 blockwise-32 mixto con lm_head y embedding en INT8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); existen dos ficheros: `Ornith-1.0-9B_int8.litertlm` (9,20 GB) y `Ornith-1.0-9B_mixed_int4.litertlm` (6,06 GB) |

## Arquitectura y entrenamiento

La arquitectura reproduce la hibrida de Qwen3.5: 32 capas totales, 24 de ellas con GatedDeltaNet (atencion lineal con estado recurrente de tamano constante y convolucion) y 8 con atencion completa clasica, intercaladas una de cada cuatro. El tamano oculto es 4096, con 16 cabezas de atencion y 4 KV heads de 256 dimensiones. La atencion lineal emplea 16 cabezas de clave y 32 de valor de 128 dimensiones. Solo las 8 capas de atencion completa mantienen una KV cache creciente (presupuesto de 4096 tokens en estos ficheros); las 24 capas lineales mantienen un estado convolucional y recurrente de tamano fijo, lo que reduce drasticamente el coste de memoria en contextos largos. El vocabulario es de 248.320 tokens con embeddings no atados.

Ornith describe el modelo como un post-entrenamiento de Qwen3.5 con un framework que utiliza RL para aprender tanto el andamiaje que dirige los rollouts de solucion como las soluciones mismas. Es un modelo de razonamiento cuyo turno de asistente abre con un bloque `</think>` por defecto. Los ficheros LiteRT-LM aqui documentados ejecutan el modelo con el modo thinking desactivado: la plantilla de chat del bundle escribe el bloque ` thinking\n\n</think>` vacio que la plantilla de Ornith genera cuando `enable_thinking` es `false`, en cada turno de asistente y en el prompt de generacion. La razon es que la plantilla de conmutacion de la conversion de Qwen3.5-4B elimina el bloque de pensamiento de turnos pasados, lo que haria que un prompt multi-turno difiriese de la forma en que Ornith fue entrenado; la plantilla incluida reproduce byte a byte los renders de Ornith con `enable_thinking=False` en todas las formas de conversacion sin herramientas.

Las conversiones se realizaron con litert-torch (commit 115a1360 con el parche hibrido de Qwen3.5) y se probaron con litert-lm 0.18.0. La receta de cuantizacion INT8 aplica INT8 dinamico a todas las capas lineales y al embedding, manteniendo en coma flotante las convoluciones, la regla delta y las 48 proyecciones de decaimiento/compuerta de GatedDeltaNet (`in_proj_a` / `in_proj_b`), con activaciones GPU declaradas en fp32. La receta Mixed INT4 aplica INT4 blockwise-32 (min-max) a las capas lineales, INT8 al lm_head y al embedding, y mantiene las mismas 48 proyecciones en coma flotante, tambien con activaciones fp32.

## Capacidades

- Generacion de texto y razonamiento en modo respuesta directa (thinking desactivado en estos ficheros).
- Coding agentico: el modelo esta post-entrenado especificamente para tareas de resolucion de issues y terminal, con datos del vendedor que lo situan muy por encima de Qwen3.5-9B en Terminal-Bench 2.1 y SWE-bench Verified.
- Resolucion de problemas matematicos: GSM8K con 97 puntos (INT8) y 95 (Mixed INT4) en la GPU de un Mac M4 Max, frente a 95 del modelo bf16 en transformers.
- Generacion de codigo en general, heredada del modelo base Qwen3.5-9B.
- Soporte de tool calling / function calling: la plantilla de chat del bundle conserva los renders de Ornith sin herramientas; el soporte con herramientas no esta verificado en estos ficheros.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Capacidad multimodal: el checkpoint original incluye vision tower, pero estos ficheros contienen solo el decodificador de texto.
- Capacidad de razonamiento extendido (bloque ` thinking`): soportada por el modelo original, desactivada por diseno en estos ficheros.

## Casos de uso

- Asistente de coding en terminal: el modelo puede integrarse en un CLI o TUI que reciba instrucciones en lenguaje natural y ejecute comandos, edite ficheros y resuelva issues, aprovechando su post-entrenamiento especifico en Terminal-Bench y SWE-bench y su ventana de 4.096 tokens suficiente para sesiones acotadas.
- Agente de resolucion de issues en repositorios: dado un issue y el arbol de ficheros relevante, el modelo puede proponer parches y navegar el codigo; su rendimiento declarado en SWE-bench Verified (69,4) lo hace adecuado para pipelines de triaje automatizado.
- Generacion de codigo en produccion con validacion en CI: el modelo puede generar parches candidatos que se validan con tests en un runner, usando la cuantizacion INT8 para mantener calidad y velocidad en servidores con GPU de gama media.
- Inferencia on-device en moviles y portatiles: con el fichero Mixed INT4 (6,06 GB) el modelo cabe en dispositivos con 8 GB de RAM/VRAM y puede ejecutarse en el runtime LiteRT-LM, habilitando asistentes de codigo locales sin conexion.
- Educacion y tutoria de programacion: el modelo puede explicar errores de compilacion, proponer refactorizaciones y resolver ejercicios matematicos, con buen rendimiento en GSM8K y sin necesidad de infraestructura cloud.
- Prototipado rapido de agentes: la ventana de 4.096 tokens y la ausencia de bloque de pensamiento hacen que las respuestas sean concisas y baratas de generar, adecuadas para bucles de agente con muchas llamadas cortas.
- Analisis de codigo en entornos con requisitos de privacidad: al ejecutarse localmente y con licencia MIT, puede desplegarse en entornos sanitarios, financieros o industriales donde no se permite enviar codigo a APIs externas.

## Benchmarks y rendimiento

Datos reportados por el vendedor (Ornith) y por la conversion, no reproducidos de forma independiente en esta ficha:

| Benchmark | Ornith-1.0-9B | Qwen3.5-9B | Notas |
|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 43,1 | 21,3 | Reportado por el vendedor |
| SWE-bench Verified | 69,4 | 53,2 | Reportado por el vendedor |
| GSM8K (thinking off, 2.048 tokens salida) | 97 (INT8, Mac GPU) / 95 (Mixed INT4, Mac GPU) | 95 (bf16 en transformers) | Medido por la conversion |

Rendimiento de inferencia en Mac Studio M4 Max (litert-lm 0.18.0):

| Metrica | INT8 GPU | Mixed INT4 GPU | INT8 CPU | Mixed INT4 CPU |
|---|---|---|---|---|
| Decodificacion (tok/s) | 40,0 | 44,9 | no disponible | no disponible |
| Prefill (tok/s) | no disponible | 68 (blockwise) | 227 | no disponible |
| 1024 prefill + 256 decode (s) | 8,17 | 7,45 | 21,38 | 31,49 |

En el Mac, el fichero Mixed INT4 es mas rapido en GPU (8,8 % menos tiempo, 44,9 frente a 40,0 tok/s con prefill similar) y el INT8 es mas rapido en CPU (el prefill blockwise del INT4 corre a 68 tok/s frente a 227). No se midio en iOS: cada fichero es una unica seccion TFLite (8,57 GiB INT8, 5,64 GiB Mixed INT4, con la tabla de embeddings incluida), por encima del limite de ~2 GiB por seccion unica descrito en la model card de Ministral-3-3B-Instruct-2512. En Galaxy S26 el motor GPU no compila; en Pixel 8a no se ejecuto.

Prueba de correccion: 8 preguntas con `--temperature 0`, un proceso `litert-lm run` por pregunta. INT8 8/8 en CPU y GPU; Mixed INT4 8/8 en CPU y GPU; modelo bf16 en transformers 8/8. Los pesos INT8 con activaciones GPU fp16 por defecto respondieron 0 de 8 (todas las respuestas eran secuencias de `!`), lo que motivo declarar activaciones fp32 en ambos ficheros. Las 7 firmas de ambos ficheros estan completamente delegadas en la GPU del Mac (34.373 / 25.157 / 22.469 / 22.589 / 22.589 / 2.866 / 2.920 nodos, una particion).

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 9,2 GB para el fichero INT8 y 6,06 GB para el Mixed INT4, mas overhead del runtime.
- GPU recomendadas: Mac Studio M4 Max (medido), GPU de escritorio con al menos 8 GB de VRAM para INT4, GPU de servidor (A100, H100) para INT8 con contexto completo.
- Cabe en GPU de consumo: si, el Mixed INT4 (6,06 GB) cabe en tarjetas de 8 GB como RTX 3060 Ti, RTX 4060 Ti o RTX 3070; el INT8 requiere 10-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080).
- Movil: el modelo no se ha ejecutado en iOS por el limite de seccion TFLite; en Galaxy S26 el motor GPU no compila. No hay datos de ejecucion en Android.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`), con soporte de GPU y CPU. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en estos ficheros.
- Latencia y throughput: en Mac M4 Max, 44,9 tok/s de decodificacion (Mixed INT4 GPU) y 40,0 tok/s (INT8 GPU); 7,45 s para 1024 tokens de prefill + 256 de decodificacion (Mixed INT4 GPU) y 8,17 s (INT8 GPU). En CPU, 21,38 s (INT8) y 31,49 s (Mixed INT4) para la misma carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.0-9B (esta ficha) | 8,95 B (texto) | 4.096 en LiteRT-LM / 262.144 original | MIT | `.litertlm` | Post-entrenamiento de Qwen3.5-9B orientado a coding agentico |
| Qwen3.5-9B | 9 B aprox. | 262.144 | no disponible en esta ficha | safetensors, GGUF (upstream) | Modelo base; Terminal-Bench 2.1 21,3; SWE-bench Verified 53,2 |
| Qwen3.5-4B (LiteRT-LM) | 4 B aprox. | no disponible | no disponible en esta ficha | `.litertlm` | Conversion de la misma familia, menor tamano |
| Qwen3.5-2B (LiteRT-LM) | 2 B aprox. | no disponible | no disponible en esta ficha | `.litertlm` | Conversion de la misma familia, aun menor |

La comparativa directa con alternativas de codigo agentico de tamano similar (por ejemplo DeepSeek-Coder o CodeLlama) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Thinking desactivado por diseno en estos ficheros: no se puede activar el razonamiento extendido del modelo original sin modificar la plantilla de chat, lo que puede degradar el rendimiento en tareas complejas de coding agentico que se benefician de cadenas de pensamiento largas.
- Contexto reducido a 4.096 tokens frente a los 262.144 del modelo original, lo que limita la resolucion de issues con repositorios grandes o conversaciones multi-turno largas.
- Solo decodificador de texto: no incluye el vision tower del checkpoint original, por lo que no puede procesar imagenes.
- No verificado en moviles: el limite de ~2 GiB por seccion TFLite impide cargar los ficheros en iOS; en Galaxy S26 el motor GPU no compila y en Pixel 8a no se ejecuto. El despliegue movil queda pendiente de validacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el modelo no incluye mecanismos de verificacion y puede generar parches o comandos incorrectos. Se recomienda validar en CI antes de aplicar cambios.
- Sesgos: no se documentan sesgos conocidos ni composicion del dataset de post-entrenamiento; al heredar de Qwen3.5-9B, puede arrastrar sesgos del modelo base.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del ingles no esta documentado.
- Licencia MIT: permite uso comercial sin restricciones conocidas, pero la model card no detalla obligaciones de atribucion adicionales.
- Los datos de Terminal-Bench y SWE-bench son reportados por el vendedor y no han sido reproducidos por la conversion; los de GSM8K son mediciones de la conversion en un unico hardware (Mac Studio M4 Max).
- El fichero INT8 con activaciones fp16 por defecto falla por completo (0/8); es obligatorio usar activaciones fp32, lo que puede afectar al rendimiento en hardware sin soporte fp32.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/litert-community/Ornith-1.0-9B
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Conversiones LiteRT-LM de Qwen3.5-4B: https://huggingface.co/litert-community/Qwen3.5-4B
- Conversiones LiteRT-LM de Qwen3.5-2B: https://huggingface.co/litert-community/Qwen3.5-2B
- Conversiones LiteRT-LM de Qwen3.5-0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Model card de Ministral-3-3B-Instruct-2512 (limite de seccion TFLite): https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Script de verificacion de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Repositorio litert-torch: no disponible como enlace directo en la informacion proporcionada
