# OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Heretic-v3-GGUF es una version "decensored" (abliterated) del modelo Qwen/Qwen3.8-27B, publicada por OS-Software en formato GGUF. Se ha generado con la herramienta Heretic v2.0.0.dev0+custom, que aplica una ablacion direccional sobre los pesos del modelo base para eliminar el comportamiento de rechazo. Segun la model card, el resultado pasa de 99/100 rechazos en el modelo original a 0/100 en esta variante, con una divergencia KL de 0,0087 respecto al base, lo que indica que la modificacion de pesos es relativamente contenida pero suficiente para desactivar la alineacion de seguridad.

El modelo base es un transformer causal denso de unos 27B parametros con encoder de vision integrado (modelo nativo de lenguaje y vision), arquitectura hibrida que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa Gated Attention, y un contexto nativo de 262.144 tokens extensible hasta 1.000.000. Incorpora modo de razonamiento ("thinking") activado por defecto, controlable por peticion mediante `reasoning_effort` y `preserve_thinking`, y entrenamiento con Multi-Token Prediction (MTP).

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura destinada exclusivamente a investigacion en seguridad, alineacion y red-teaming; por otro, sirve como referencia tecnica de la arquitectura de Qwen3.8-27B en su formato cuantizado GGUF, pensado para despliegue local. El repositorio ocupa 197,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de vision; capas hibridas: 16 bloques de 3 x (Gated DeltaNet → FFN) + 1 x (Gated Attention → FFN), 64 capas en total |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | GGUF (con etiqueta imatrix); niveles concretos no disponibles en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors, formato Transformers) |
| Dimension oculta | 5120 |
| Dimensión de embedding / salida LM | 248.320 (padded) |
| Gated DeltaNet (atencion lineal) | 48 cabezas lineales para V, 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas Q, 4 cabezas KV; dimension de cabeza 256; dimension RoPE 64 |
| FFN | Dimension intermedia 17.408 |
| Prediccion multi-token | MTP entrenado con varios pasos |
| Pipeline declarado | image-text-to-image |
| Tamano del repositorio | 197,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal con encoder de vision, con 64 capas organizadas en un patron hibrido repetido 16 veces: tres bloques compuestos por capa Gated DeltaNet (atencion lineal) seguida de FFN, y un bloque compuesto por capa Gated Attention (atencion completa) seguida de FFN. Las capas de atencion lineal usan 48 cabezas para V y 16 para QK con dimension de cabeza 128; las capas de atencion completa usan 24 cabezas Q y 4 cabezas KV con dimension de cabeza 256 y RoPE de dimension 64. El FFN tiene dimension intermedia 17.408 y el vocabulario (padded) es de 248.320 entradas. El modelo se entreno con prediccion multi-token (MTP), lo que habilita decodificacion especulativa nativa. La combinacion de atencion lineal y atencion completa reduce el coste del cache KV en contexto largo, algo critico para ventanas de 262.144 tokens.

Sobre el entrenamiento del base, la informacion proporcionada solo indica que hubo pre-entrenamiento y post-entrenamiento; no se detalla el numero de tokens, la composicion del dataset ni si se uso RLHF o DPO. La variante aqui documentada no reentrena el modelo: aplica ablacion direccional sobre los pesos con Heretic v2.0.0.dev0+custom, actuando sobre las capas 27 a 44 (indices `start_layer_index` 27 y `end_layer_index` 44) y sobre los modulos `attn.o_proj` y `mlp.down_proj`, con una LoRA de rango 128 y transporte gaussiano de rango 4. Los hiperparametros declarados se recogen en la tabla siguiente.

| Parametro de abliteracion | Valor |
|---|---|
| start_layer_index | 27 |
| end_layer_index | 44 |
| preserve_good_behavior_weight | 1,0 |
| steer_bad_behavior_weight | 0,03 |
| overcorrect_relative_weight | 2,0 |
| neighbor_count | 1 |
| ridge_regularization | 0,00015 |
| transport_rank | 4 |
| entropy_regularization | 0,1 |
| transport | gaussian |
| lora_rank | 128 |
| row_normalization | none |
| target_components | attn.o_proj, mlp.down_proj |
| covariance_regularization | 0,01 |
| max_weight_change | 1,0 |

## Capacidades

- Generacion de texto conversacional, con etiqueta `conversational` en el repositorio.
- Razonamiento con modo "thinking": activado por defecto, desactivable por peticion; la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes anteriores se conserva mediante `preserve_thinking`.
- Comprension nativa de vision y lenguaje: imagenes y videos, incluidos diagramas STEM, documentos y videos de hasta una hora de duracion.
- Mejoras declaradas en codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo.
- Ejecucion agentica: planificacion autonoma y manejo de la retroalimentacion del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo habituales (segun la model card del base); la variante hosted de Qwen Cloud incluiria herramientas integradas oficiales, no presentes en los pesos abiertos.
- Sin comportamiento de rechazo: 0/100 rechazos en la evaluacion declarada por el autor.
- Capacidades multilingues: no disponible.
- Función de herramienta / function calling: no se documenta de forma explicita para esta variante GGUF; el soporte dependera de la plantilla de chat del runtime.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo sirve como sujeto de prueba para medir que tipo de contenido genera un modelo con la alineacion de seguridad suprimida, comparando contra el base (0/100 frente a 99/100 rechazos) para caracterizar los fallos antes de disenar mitigaciones.
- Estudios de alineacion y edicion de pesos: permite reproducir y auditar el efecto de la ablacion direccional de Heretic (KL de 0,0087 respecto al base) sobre un modelo denso de 27B, evaluando que capacidades se degradan y cuales se preservan.
- Analisis de documentos extensos con contexto largo: con 262.144 tokens nativos (hasta 1.000.000 extendidos) puede procesar expedientes completos, normativa o informes tecnicos en una sola pasada, evitando troceado y perdida de contexto.
- Comprension de diagramas y documentacion tecnica: el encoder de vision permite extraer informacion de diagramas STEM, esquematicos y capturas de documentacion, util para asistentes internos de soporte tecnico.
- Procesamiento de video de larga duracion: la model card declara soporte para videos de hasta una hora, aplicable a resumen de sesiones, analisis de grabaciones de vigilancia o revision de material docente.
- Generacion y evaluacion de datos sinteticos: al no rechazar peticiones, se usa en pipelines de generacion de datasets adversarios y casos limite para entrenar clasificadores de seguridad.
- Analisis de codigo asistido en local: con cuantizaciones GGUF puede desplegarse en una estacion de trabajo para revisar repositorios y responder sobre fragmentos extensos, siempre con verificacion humana de la salida.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye cuantizaciones GGUF (etiqueta `imatrix`), por lo que resulta util para medir degradacion de calidad y latencia a distintos niveles de bits por peso.

## Benchmarks y rendimiento

La model card incluye una seccion de resultados de benchmarks de texto para el modelo base, pero el contenido esta truncado en la informacion disponible, por lo que no se pueden reproducir cifras de MMLU, HumanEval, GSM8K u otros. Los unicos datos numericos publicados para esta variante son los de comportamiento tras la ablacion:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Rechazos | 0/100 | 99/100 |
| Divergencia KL | 0,0087 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidades (razonamiento, codigo, matematicas, vision) en la informacion disponible.

## Requisitos de hardware

Los tamanos de archivo y la VRAM son estimaciones propias calculadas a partir del numero de parametros (26,9 B) y de los bits por peso habituales en GGUF; el autor no publica estos datos.

| Cuantizacion (orientativa) | Tamano aproximado de pesos | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | ~8,7 GB | ~10-12 GB |
| Q3_K_M | ~13,1 GB | ~14-16 GB |
| Q4_K_M | ~16,1 GB | ~18-21 GB |
| Q5_K_M | ~19,2 GB | ~21-24 GB |
| Q6_K | ~22,2 GB | ~24-27 GB |
| Q8_0 | ~28,6 GB | ~31-34 GB |

- Cache KV: solo 16 de las 64 capas son de atencion completa, con 4 cabezas KV de dimension 256. En fp16 el coste es de aproximadamente 4 KB por token y capa de atencion, es decir unos 64 KB por token para el conjunto del modelo; a 262.144 tokens de contexto eso supone del orden de 16-17 GB adicionales, por lo que el contexto largo exige cuantizar el cache KV o reducir la ventana efectiva.
- GPU consumer: si cabe en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090) con cuantizaciones Q4_K_M o Q5_K_M y contextos moderados; con Q3_K_M o inferior tambien en GPUs de 16 GB, asumiendo offload parcial a CPU.
- GPU profesional: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB para cuantizaciones altas (Q6_K, Q8_0) o contextos muy largos.
- CPU y sistemas mixtos: viable con llama.cpp u Ollama haciendo offload de capas a RAM; el repositorio completo (197,5 GB) no cabe en VRAM de una sola GPU consumer.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con GGUF; para los pesos Transformers del base, vLLM, SGLang y TokenSpeed. El soporte de vision en GGUF depende del runtime (por ejemplo, el modulo multimodal de llama.cpp) y no esta confirmado por el autor para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Divergencia KL | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Heretic-v3-GGUF (este) | 26,9 B | 262.144 (ext. 1 M) | 0/100 | 0,0087 | apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27 B | 262.144 (ext. 1 M) | 99/100 | 0 (por definicion) | apache-2.0 | safetensors |
| Otras variantes abliterated de la familia Qwen3.8 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de terceros (por ejemplo, otras variantes sin censura de la misma familia o de familias competidoras), por lo que la comparacion se limita al modelo base.

## Limitaciones y advertencias

- Reduccion sustancial de la alineacion de seguridad: el propio autor advierte de que el modelo genera con mayor probabilidad contenido danino, inexacto, sesgado u ofensivo.
- Uso previsto restringido a investigacion y experimentacion (seguridad, alineacion y red-teaming); se desaconseja explicitamente su despliegue en servicios publicos o de cara al usuario final.
- Riesgo elevado de alucinacion: al suprimir los rechazos, el modelo puede responder con seguridad a peticiones sobre las que no tiene conocimiento fiable.
- Idiomas soportados no documentados; no hay garantia de cobertura multilingue mas alla de la del base.
- Licencia apache-2.0, que permite uso comercial, pero el autor declara uso previsto solo para investigacion y descarga la responsabilidad legal y etica en el usuario; se trata de una obra derivada y los derechos del modelo base siguen siendo de sus titulares.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas.
- La ablacion se aplico sobre el modelo completo en el rango de capas 27-44; se desconoce el efecto sobre tareas especificas (codigo, matematicas, vision) porque no hay benchmarks publicados para esta variante.
- Riesgo de degradacion por cuantizacion: el repositorio distribuye pesos GGUF; en niveles bajos (Q2_K, Q3_K_M) cabe esperar perdida adicional de calidad, no medida por el autor.
- Etiqueta de pipeline `image-text-to-image` que no se corresponde con el comportamiento esperado de un modelo de lenguaje y vision que genera texto; conviene verificar la salida real del runtime.
- La ventana de 1.000.000 tokens es una extension declarada del base y no una capacidad nativa; su viabilidad practica depende de la VRAM disponible para el cache KV.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (proyecto): https://heretic-project.org
- Repositorio de p-e-w (autor de Heretic): https://github.com/p-e-w
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Ficha de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b

Nota: los resultados de busqueda web disponibles no aportan informacion relevante sobre este modelo; los enlaces devueltos corresponden a articulos genericos sobre sistemas operativos y no se han utilizado como fuente.
