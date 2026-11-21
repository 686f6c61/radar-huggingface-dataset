# nokeepai/Inkling-2-Mini-Unbound-GGUF

## Resumen

Inkling-2-Mini-Unbound-GGUF es la distribucion en formato GGUF de Inkling-2-Mini-Unbound, una variante "abliterated" (sin mecanismos de rechazo) del modelo multimodal Inkling-2-Mini. El modelo base ha sido modificado por el autor nokeepai sustituyendo 20 matrices de atencion (`blk.4-23.attn_output.weight`) para eliminar el comportamiento de rechazo, manteniendo el resto de los 704 tensores byte a byte identicos al modelo original de ggml-org. Esta version GGUF empaqueta esas modificaciones en cuantizaciones de 2 a 8 bits para su uso con llama.cpp.

El modelo original es de tipo image-text-to-text (acepta imagen y texto como entrada y genera texto), con 26.070.385.152 parametros totales (aproximadamente 26.000 millones) y soporte de un modo de razonamiento configurable mediante `reasoning_effort` en la plantilla de chat. La arquitectura concreta no se detalla en la informacion disponible; la referencia a "Inkling 2 loop support" y al "loop fix" de llama.cpp sugiere el uso de capas recurrentes o bucles de computo, aunque no se confirma.

La relevancia de esta publicacion es doble: por un lado, ofrece una via practica de ejecutar un modelo de 26B multimodal en hardware de consumo mediante cuantizacion GGUF; por otro, documenta de forma inusualmente transparente el impacto de la edicion de "uncensoring" sobre la fidelidad del modelo (KLD y acuerdo de token superior frente al BF16 original), lo que permite evaluar el coste real de la modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; el ecosistema llama.cpp requiere soporte de "Inkling 2 loop", lo que sugiere capas recurrentes o de bucle, sin confirmar) |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como maximo oficial; el ejemplo de ejecucion usa `-c 32768` (32.768 tokens) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ3_M, IQ2_M; proyector de vision en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original (tipo de transformer, atencion, composicion del dataset de entrenamiento, numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO). Lo unico documentado es que se trata de un modelo multimodal image-text-to-text con un proyector de vision independiente (`mmproj`) y un modo de razonamiento controlable mediante el parametro `reasoning_effort` (rango 0 a 1) en la plantilla de chat, con la particularidad de que el modelo sigue generando un razonamiento breve incluso con esfuerzo 0.

La innovacion tecnica documentada en esta publicacion es el proceso de edicion y cuantizacion. El autor parte del fichero BF16 oficial de ggml-org, sustituye unicamente 20 matrices de salida de atencion (capas 4 a 23) y conserva los 684 tensores restantes identicos byte a byte (verificables mediante hashes por tensor en `MANIFEST.tsv`). Las cuantizaciones inferiores se generan con la matriz de importancia de ggml-org, manteniendo esas 20 matrices editadas en Q8_0 para que la edicion no se degrade con la compresion de 4 bits. El autor reporta que los 10 prompts daninos de prueba son rechazados 0 de 10 veces, frente a 9 de 10 del modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text, con proyector de vision incluido).
- Modo de razonamiento configurable mediante `reasoning_effort` (0 a 1) en la plantilla de chat.
- Ejecucion local con llama.cpp, incluido `llama-server` con soporte `--jinja`.
- Comportamiento sin rechazo (abliterated): el modelo sigue instrucciones que el original rechazaria, segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente el efecto de la eliminacion del comportamiento de rechazo, ya que el autor publica metricas de divergencia (KLD y acuerdo de token superior) frente al modelo original, lo que facilita comparaciones controladas.
- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (17,6 GB) permite ejecutar un modelo de 26B con vision en GPUs de 24 GB, usando `llama-server` con `-ngl 99` para descargar todas las capas en GPU.
- Procesamiento de documentos con imagenes en local: al aceptar entrada imagen-texto, puede emplearse para extraer y resumir informacion de capturas, formularios o diagramas sin enviar datos a servicios externos, con el proyector `mmproj` en Q8_0 (0,3 GB) para reducir memoria.
- Prototipado de asistentes conversacionales sin filtros editoriales: util en entornos de investigacion creativa o redaccion de ficcion donde se necesita explorar contenido sensible sin rechazos, asumiendo la responsabilidad legal del uso.
- Evaluacion comparativa de cuantizaciones: los datos de KLD y acuerdo de token superior por fichero (de 0,0118 en Q8_0 a 0,0828 en IQ2_M) permiten seleccionar el equilibrio tamano/calidad adecuado para un pipeline concreto.
- Pruebas de robustez frente a prompts adversarios: al no rechazar instrucciones daninas, sirve como caso base para medir la eficacia de capas de moderacion externas en un sistema en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica metricas de fidelidad de la cuantizacion y de la edicion frente al BF16 original, medidas sobre 40 fragmentos de wikitext-2 de 512 tokens:

| Fichero | Tamano | KLD vs BF16 original | Mismo token superior |
|---|---|---|---|
| BF16 | 52,2 GB | 0,0116 | 95,2% |
| Q8_0 | 27,8 GB | 0,0118 | 95,2% |
| Q6_K | 23,5 GB | 0,0127 | 95,1% |
| Q5_K_M | 20,0 GB | 0,0139 | 94,8% |
| Q4_K_M | 17,6 GB | 0,0188 | 94,0% |
| IQ3_M | 13,0 GB | 0,0402 | 91,3% |
| IQ2_M | 10,8 GB | 0,0828 | 88,0% |

Como referencia, el autor indica que el Q8_0 del modelo original mide 0,0036 y su IQ4_NL 0,0096 en la misma prueba, de modo que aproximadamente 0,012 del KLD corresponde a la edicion de uncensoring y el resto a la cuantizacion. En la prueba de rechazo, los ficheros de esta publicacion rechazan 0 de 10 prompts daninos frente a 9 de 10 del original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas el proyector de vision y el contexto. Q4_K_M (17,6 GB) mas `mmproj` Q8_0 (0,3 GB) cabe en GPUs de 24 GB; Q8_0 (27,8 GB) requiere 32 GB o mas; IQ2_M (10,8 GB) cabe en GPUs de 12 GB.
- GPUs recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q8_0 y BF16; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) solo con IQ2_M o IQ3_M, con perdida notable de calidad.
- Cabe en GPU de consumo: si, con Q4_K_M o inferiores en GPUs de 24 GB; en 12 GB solo con cuantizaciones IQ2_M/IQ3_M.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte de "Inkling 2 loop" y el arreglo del PR #32704 (commit `19bc41dbb` en master; las releases etiquetadas hasta b12608 no lo incluyen). Aplicaciones que empaquetan llama.cpp (LM Studio, Ollama) necesitan una build igualmente reciente.
- Advertencia de ejecucion: con el fichero BF16, llama.cpp devuelve NaN si parte del modelo se ejecuta en CPU con batch size superior a 16; usar `-ub 16` o cargar todo el modelo en GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound (GGUF) | ~26B | 32.768 en el ejemplo de ejecucion | Si (image-text-to-text) | apache-2.0 | Sin rechazo; KLD de edicion ~0,012 |
| Inkling-2-Mini (original, ggml-org GGUF) | ~26B | no disponible | Si | no disponible en la informacion | Rechaza 9 de 10 prompts daninos; Q8_0 con KLD 0,0036 |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo sigue instrucciones daninas: su comportamiento de rechazo ha sido eliminado deliberadamente, lo que lo hace inadecuado para despliegues publicos sin capas de moderacion externas.
- La edicion de uncensoring introduce una divergencia medible respecto al original (KLD ~0,012 sobre wikitext-2), por lo que no es equivalente al modelo base en calidad de generacion.
- Las cuantizaciones IQ3_M e IQ2_M son notablemente con perdida (KLD 0,0402 y 0,0828; acuerdo de token superior 91,3% y 88,0%), lo que puede degradar tareas sensibles a la precision.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en un modelo de este tamano, pero no hay datos publicados.
- Con `reasoning_effort` alto el modelo puede "sobrepensar" en prompts delicados; el autor recomienda fijar un presupuesto de razonamiento.
- El fichero BF16 presenta un fallo conocido de NaN en llama.cpp cuando parte del modelo corre en CPU con batch size superior a 16 (afecta tambien al modelo original).
- Requiere una build de llama.cpp muy reciente (posterior a b12608, con el PR #32704); las versiones empaquetadas en LM Studio u Ollama pueden no funcionar.
- Idiomas soportados no documentados; no hay garantia de calidad multilingue.
- Licencia apache-2.0 permite uso comercial, pero la responsabilidad legal del contenido generado recae en el usuario, segun advierte el propio autor.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Modelo base (no cuantizado): https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF oficial del modelo original: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Sitio del autor: https://nokeep.ai/
- Perfil del autor en X: https://x.com/nokeepai
- PR de llama.cpp con el arreglo de soporte Inkling 2: PR #32704 (commit `19bc41dbb` en master; sin URL directa en la informacion disponible)
- Banner del modelo: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound/resolve/main/charts/banner.png
