# HybridRMD/Ternary-Bonsai-2-27B-Heretic

## Resumen

Ternary-Bonsai-2-27B-Heretic es un repositorio de cuantizaciones GGUF publicadas por el usuario HybridRMD a partir de un checkpoint denso de 27B de la familia Bonsai-2, con arquitectura qwen35 y atencion lineal GDN (hibrida tipo space-state). A pesar del termino "Ternary" en el nombre, los ficheros publicados no contienen pesos ternarios: el autor documenta que la ruta de reconstruccion del empaquetado ternario original (transformada inversa de Hadamard sobre los packs Prism) decodifica basura y fue abandonada, y que estos GGUF proceden de una mezcla densa en FP16 del modelo base con una LoRA heretic, seguida de conversion y cuantizacion estandar con llama.cpp.

El modelo deriva de HybridRMD/Qwonsai-Bonsai2-Heretic y se distribuye en dos cuantizaciones: Q4_K_M (16,5 GB, 4,92 BPW) y Q8_0 (28,6 GB, 8,50 BPW). Es estrictamente solo texto: no incluye mmproj, ni codificador de vision, ni codigo de procesamiento de imagen, a diferencia del modelo ternario original de Prism ML del que toma el nombre, que si es multimodal.

Su relevancia es acotada y muy especifica: se trata de un experimento de reduccion de rechazos mediante una LoRA de rango 3 sobre las proyecciones o_proj, out_proj y down_proj, con una metrica de comportamiento publicada (sonda de rechazo de 6 prompts, 33 por ciento de marcado por palabras clave frente al 87,5 por ciento de la referencia base). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 con atencion lineal GDN (hibrida state-space), transformer causal |
| Parametros totales | 27B (modelo denso) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para este repositorio; el autor ilustra el arranque con `--ctx-size 8192`. La familia upstream declara 262K, no verificado en estas cuantizaciones |
| Tipos de cuantizacion | Q4_K_M (4,92 BPW) y Q8_0 (8,50 BPW), generadas con `llama-quantize` de llama.cpp |
| Idiomas soportados | no disponible (herencia Qwen, sin listado en la model card) |
| Licencia | other; remite al fichero LICENSE del repositorio base (HybridRMD/Qwonsai-Bonsai2-Heretic) y pide contactar con upstream para terminos de redistribucion |
| Formato de pesos | GGUF; plantilla de chat embebida en el fichero |
| Tamano de ficheros | 16,5 GB (Q4_K_M) y 28,6 GB (Q8_0) |
| Modelo base | HybridRMD/Qwonsai-Bonsai2-Heretic (denso FP16) |
| Requisito de runtime | llama.cpp >= b10917 para qwen35; LM Studio reciente |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con atencion lineal GDN (una variante hibrida de espacio de estados) identificado en la model card como "qwen35, 27B, GDN (state-space hybrid) linear attention". No se publican detalles sobre el numero de tokens de preentrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base; esa informacion no esta disponible en el material consultado.

El proceso de construccion si esta documentado con precision y consta de cinco pasos: (1) checkpoint denso FP16 de Qwonsai-Bonsai2-Heretic, validado con una prueba de decodificacion independiente; (2) LoRA heretic ARA de rango 3 y alpha 3, entrenada sobre o_proj, out_proj y down_proj; (3) mezcla base + LoRA con PEFT en FP16 sobre GPU; (4) conversion a GGUF F16 con `convert_hf_to_gguf.py` de llama.cpp, generando un fichero de 53,8 GB; y (5) cuantizacion a Q4_K_M y Q8_0 con `llama-quantize` de llama.cpp. El autor insiste en que este es el procedimiento completo y que no hay reconstruccion desde el empaquetado ternario: re-cuantizar los packs PQ2_0 con `--allow-requantize` produce salidas incoherentes, porque solo el runtime propietario de Prism puede invertir su empaquetado Hadamard. La publicacion se realiza mediante un pipeline con puertas de validacion (`upload-heretic.sh`) que exige que la fuente F16 haya pasado una prueba de decodificacion y que los artefactos sean mas recientes que el marcador de esa puerta.

## Capacidades

- Generacion de texto coherente en prueba de decodificacion (sonda tipo haiku) con llama.cpp estandar, tanto en Q4_K_M como en Q8_0.
- Razonamiento y generacion de texto general, heredados del modelo base Bonsai-2 de 27B; sin benchmarks publicados para esta mezcla concreta.
- Escritura creativa y narrativa que incluye escenas violentas, haikus y contenido politico: el autor reporta coherencia en estos prompts.
- Reduccion de rechazos: 33 por ciento de prompts marcados por palabras clave en la sonda del autor, frente al 87,5 por ciento de la referencia OS-Software. No es un modelo totalmente sin censura y mantiene rechazo ante peticiones de ayuda para ocultar actividad ilegal.
- Capacidad multilingue: no disponible; no se documenta listado de idiomas ni evaluacion por idioma.
- Tool calling / function calling: no disponible; no se documenta soporte explicito.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Vision: no soportada. El repositorio es solo texto, sin mmproj ni codificador de imagen.
- Modo thinking explicito: no disponible.
- Inferencia con cuantizacion de 4 y 8 bits mediante llama.cpp y LM Studio, con plantilla de chat embebida.

## Casos de uso

- Investigacion sobre alineacion y comportamiento de rechazo: el modelo permite reproducir una sonda concreta (6 prompts, semilla 99) y comparar el porcentaje de marcado por palabras clave con la referencia base. Es adecuado porque el autor publica el protocolo y el resultado numerico, lo que permite disenar replicas controladas del efecto de una LoRA heretic de rango 3 sobre las proyecciones de salida y down.
- Red teaming de filtros de seguridad: un modelo con rechazo reducido sirve para estresar clasificadores de contenido y sistemas de moderacion antes de desplegarlos, midiendo tasas de falso negativo sobre un generador real.
- Escritura de ficcion con tematicas adultas: la coherencia declarada en escenas violentas y contenido politico lo hace util como asistente de narrativa en entornos privados, siempre que el usuario asuma la responsabilidad editorial del contenido.
- Asistente local sin conexion en equipos de gama alta de consumo: la variante Q4_K_M de 16,5 GB se carga en GPUs de clase 16 GB con contexto corto, o de forma holgada en 24 GB, y al ejecutarse con llama.cpp o LM Studio ningun dato sale de la maquina, lo que encaja en entornos con requisitos de confidencialidad.
- Generacion de codigo en pipelines internos: puede usarse como asistente de autocompletado y explicacion de codigo integrado en herramientas locales, aunque sin HumanEval ni datos de calidad de codigo publicados para esta mezcla conviene validar la salida con tests automatizados antes de aceptarla.
- Resumen y extraccion de informacion en documentos corporativos: con la ventana configurada manualmente (el autor ilustra 8192 tokens) se puede procesar documentacion por bloques en despliegues on-premise; hay que trocear los documentos porque la longitud de contexto efectiva de este repositorio no esta declarada.
- Generacion de datos sinteticos diversos para ajuste fino: su menor tasa de rechazo produce un rango mas amplio de respuestas, util para aumentar la diversidad de un corpus de entrenamiento, con revision humana obligatoria por el riesgo de sesgo y alucinacion.
- Prototipado de despliegues con arquitecturas hibridas GDN: sirve para medir el comportamiento real de llama.cpp (a partir de la build b10917) con atencion lineal sobre hardware concreto, antes de invertir en infraestructura para modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para esta mezcla concreta. El unico dato medido por el autor es una sonda de rechazo:

| Prueba | Resultado | Referencia de comparacion |
|---|---|---|
| Sonda de rechazo, 6 prompts, semilla 99, sobre la cuantizacion mezclada | 2 de 6 prompts marcados por palabras clave (33 por ciento) | Base OS-Software: 87,5 por ciento en la misma sonda |
| Decodificacion coherente con llama.cpp estandar (sonda tipo haiku) | Si, en Q4_K_M y Q8_0, y en la fuente F16 previa | no aplica |

Como referencia de familia, no de este repositorio, el modelo ternario original de Prism ML declara retener el 98,2 por ciento del rendimiento de Qwen3.8 27B en un espacio de 5,9 GB, y un mirror de Ollama reporta 135,41 tok/s de decodificacion y 3802,74 tok/s de prefill en una RTX 5090 con contexto de 262K. Estas cifras corresponden a los packs ternarios y a su runtime especifico, no a los GGUF densos de este repositorio, y no deben extrapolarse.

## Requisitos de hardware

| Cuantizacion | Peso en disco | VRAM minima practica | GPU recomendadas |
|---|---|---|---|
| Q4_K_M | 16,5 GB | 16 GB con contexto corto; 24 GB comodo | RTX 4080 / 4090, RTX 3090, L4, A100 40 GB |
| Q8_0 | 28,6 GB | 32 GB | RTX 5090 32 GB, A100 40 GB, H100 80 GB |

- Ademas del peso de los parametros hay que sumar la cache KV y los buffers de contexto, cuyo tamano para esta arquitectura no esta publicado; con Q4_K_M en una GPU de 16 GB conviene reducir `--ctx-size` de forma agresiva.
- Si cabe en GPU de consumo: Q4_K_M si, en tarjetas de 16 GB (justo) o 24 GB (holgado). Q8_0 requiere 32 GB, por lo que solo entra en RTX 5090 o GPU de datacenter.
- Ejecucion en CPU: viable con llama.cpp usando 32 GB de RAM o mas para Q4_K_M, con throughput muy inferior al de GPU; no se publican cifras.
- Opciones de despliegue documentadas por el autor: `llama-server` y LM Studio, ambos con llama.cpp >= b10917 por el soporte de qwen35. No se mencionan vLLM, TGI ni Ollama para este repositorio.
- Latencia y throughput: no disponibles para estas cuantizaciones. Las mediciones de 135,41 tok/s de decodificacion en RTX 5090 pertenecen al modelo ternario upstream con su propio runtime, no a estos GGUF.
- La generacion de estos ficheros se hizo con llama.cpp mainline (`convert_hf_to_gguf.py` y `llama-quantize`), sin dependencia de forks propietarios una vez publicado el GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Peso | Contexto | Vision | Licencia | Estado |
|---|---|---|---|---|---|---|
| HybridRMD/Ternary-Bonsai-2-27B-Heretic (este) | 27B densos | 16,5 GB Q4_K_M / 28,6 GB Q8_0 | no disponible (ejemplo con 8192) | No, solo texto | other, remite al LICENSE del base | HuggingFace, 0 descargas |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B con pesos ternarios {-1,0,+1} y escalas FP16 por grupo | 5,9 GB declarados; 6,70 GiB en PQ2_0 y 5,53 GiB en PTQ1_0 en mirrors | 262K en el mirror de Ollama | Si, multimodal con entrada de vision | Apache-2.0 en los packs | HuggingFace y mirrors en Ollama; requiere runtime de Prism ML |
| OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF | 27B | no disponible | no disponible | no disponible | no disponible | HuggingFace; usado por el autor como referencia de rechazo (87,5 por ciento) |
| HybridRMD/Qwonsai-Bonsai2-Heretic (base directo) | 27B densos | FP16, 53,8 GB en el paso intermedio documentado | no disponible | Solo texto | other | HuggingFace |

La diferencia clave frente al modelo ternario de Prism ML es doble: este repositorio no lleva pesos ternarios reales (son cuantizaciones estandar de una mezcla densa) y ocupa entre tres y cinco veces mas disco, a cambio de funcionar con llama.cpp mainline sin runtime propietario y de incorporar la modificacion de comportamiento heretic. No hay datos publicados que permitan comparar calidad entre ambos enfoques en esta mezcla concreta.

## Limitaciones y advertencias

- Solo texto: no hay soporte de vision, ni mmproj, ni entrada intercalada de imagen y texto. Cualquier expectativa multimodal heredada del nombre "Bonsai-2-27B" del upstream no se cumple en este repositorio.
- El termino "Ternary" del nombre es enganoso: los ficheros publicados son Q4_K_M y Q8_0 de una mezcla densa FP16, no pesos ternarios. El autor documenta que la ruta de reconstruccion ternaria decodifica basura y esta abandonada. No intentar reproducir el empaquetado Prism con herramientas estandar.
- Deriva de cuantizacion esperada: la cuantizacion parte de una mezcla densa de base mas LoRA, no de un checkpoint reentrenado, y no hay evaluacion publicada del impacto de Q4_K_M frente a Q8_0 en tareas de razonamiento.
- Riesgo de alucinacion no medido: no hay benchmarks de fidelidad factual para esta mezcla; en usos sensibles hay que verificar la salida con fuentes externas.
- Comportamiento de rechazo medido como bajo, no nulo: 33 por ciento de prompts marcados en una sonda de 6 ejemplos con semilla fija es una muestra muy pequena y no garantiza reproducibilidad en otros dominios. El modelo mantiene rechazo ante peticiones de ayuda para ocultar actividad ilegal.
- Sesgos: no se documenta ninguna evaluacion de sesgo de genero, raza, religion o ideologia. La naturaleza heretic del ajuste puede alterar la distribucion de respuestas en temas politicos y sociales sin que exista medicion publicada.
- Idiomas: el listado de idiomas soportados no esta disponible; la herencia Qwen sugiere cobertura multilingue, pero no hay evaluacion ni garantia para castellano.
- Licencia: "other", sin texto de licencia en este repositorio. Remite al LICENSE de la linea base y pide contactar con upstream para terminos de redistribucion. Antes de cualquier uso comercial hay que resolver esa ambiguedad, que puede impedirlo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, actualizado el mismo dia de su creacion (25 de septiembre de 2026). No hay validacion externa ni informes de terceros.
- Dependencia de version: la arquitectura qwen35 exige llama.cpp >= b10917; versiones anteriores fallaran al cargar el modelo. La plantilla de chat va embebida en el GGUF.
- Uso responsable: al ser un modelo de bajo rechazo, su despliegue en productos de cara al publico requiere capas adicionales de moderacion y supervision humana.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HybridRMD/Ternary-Bonsai-2-27B-Heretic
- Modelo base: https://huggingface.co/HybridRMD/Qwonsai-Bonsai2-Heretic
- Documentacion de la familia Bonsai 2 27B (Prism ML): https://docs.prismml.com/bonsai-2-27b
- Anuncio de Bonsai 2 27B (Prism ML): https://prismml.com/news/bonsai-2-27b
- Packs ternarios originales: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Referencia de rechazo citada por el autor: https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Mirror en Ollama del modelo ternario (con mediciones de rendimiento): https://ollama.com/tobestyledintro/Ternary-Bonsai-2-27B
- Notas de proyecto sobre el diagnostico de la reconstruccion fallida y la reconstruccion heretic: `bonsai-satellite-laya/2026-09-24-overnight-recon-garbage-diagnosis.md` y `bonsai-satellite-laya/2026-09-25-heretic-rebuild.md` (sin URL publica en la informacion disponible)
- Checksums SHA-256 publicados en la model card: `7254dc9059f9f5513b0fc6605fea46cfeb6746e9ccf496ae5c39654c85de67ed` (Q4_K_M) y `d2174e4a8b2392f3806d74ac1018baf71d1b82d8b5c0f97c7e2f1dc72007296f` (Q8_0)
