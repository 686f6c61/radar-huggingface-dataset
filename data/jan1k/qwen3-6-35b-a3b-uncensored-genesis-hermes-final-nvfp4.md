# jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4

## Resumen

Este repositorio contiene una cuantizacion NVFP4 (4 bits en coma flotante) en formato GGUF del modelo Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final, publicada por el usuario jan1k. El modelo original es un ajuste fino de tipo Hermes realizado por DJLougen sobre una base sin censura de HauhauCS, con reparacion de tensores (algoritmo Genesis) a cargo de LuffyTheFox. La arquitectura es una mezcla de expertos (MoE) `qwen35moe` de 40 capas, con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token (8 expertos enrutados mas 1 compartido), y una ventana de contexto declarada de 262.144 tokens.

El proposito del repositorio no es entrenar un modelo nuevo, sino ofrecer una version fuertemente comprimida (fichero principal de ~20 GB frente a los 43,6 GB del GGUF Q8_K_P de origen) que pueda ejecutarse en GPUs de consumo con soporte nativo de FP4, en particular la generacion Blackwell (RTX 50xx), y que sea compatible con LM Studio o Pelican gracias al uso de escalas UE4M3 en linea. El modelo conserva capacidad multimodal de vision mediante un proyector `mmproj` separado de ~899 MB y se distribuye con plantilla de chat y prompts de sistema recomendados.

Es relevante ahora porque combina tres tendencias simultaneas: cuantizacion de precision muy baja (NVFP4) sobre modelos MoE grandes, soporte multimodal en un unico GGUF, y ajuste orientado a tool calling y uso agentico. El coste es que se trata de una cuantizacion agresiva de una cadena de derivaciones (base sin censura, ajuste Hermes, reparacion Genesis, cuantizacion NVFP4), con cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que carece de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) `qwen35moe`, 40 capas; incluye tensores `ssm_*` (conv1d, dt, a, out) en la lista de proteccion de cuantizacion |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B por token (8 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens (declarado en el GGUF de origen) |
| Tipos de cuantizacion | Mezcla por tensor: NVFP4 (226 tensores), F16 (175), F32 (331), Q6_K (1, `output.weight`); 733 tensores en total. Fichero de origen: Q8_K_P, 43,6 GB, 10,06 BPW |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con NVFP4 y escalas UE4M3 en linea (sin tensores `.scale`/`.input_scale` separados); proyector de vision en GGUF aparte (`mmproj`) |
| Tamano de los ficheros | Modelo ~20 GB; `mmproj` ~899 MB; `chat_template.jinja` 16 KB; prompts de sistema de 1 a 6 KB |
| Tamano del repositorio | 22,4 GB |
| Tipo de fichero GGUF declarado | 39 (`LLAMA_FTYPE_MOSTLY_NVFP4`) |
| MTP/NextN | No incluido en el modelo de origen |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 40 capas y enrutamiento por token a 8 expertos mas un experto compartido, con enrutamiento secuencial (el nombre tecnico en el GGUF es `qwen35moe`). La model card no detalla la composicion exacta de cada bloque, pero la politica de proteccion de tensores menciona pesos `ssm_conv1d.weight`, `ssm_dt.bias`, `ssm_a` y `blk.*.ssm_out.weight`, lo que indica la presencia de componentes de espacio de estados (estilo SSM) ademas de atencion, coherente con arquitecturas hibridas. Tambien aparecen tensores de puerta de atencion (`attn_gate`) y de puerta del experto compartido (`ffn_gate_inp_shexp`).

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento ni las etapas de alineacion (RLHF/DPO) del modelo base. Lo unico documentado es la cadena de derivacion: la base `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive` (que declara 0 rechazos sobre 465 peticiones), el ajuste fino de datos Hermes de DJLougen, la reparacion de tensores Genesis de LuffyTheFox y la cuantizacion NVFP4 de jan1k. El dataset de ajuste citado es `NousResearch/hermes-function-calling-v1`, orientado a llamada a funciones.

La innovacion tecnica relevante esta en el proceso de cuantizacion, no en el modelo: se realiza en dos pasos (Q8_K_P a F16 intermedio, y de ahi a NVFP4) para que el codificador NVFP4 trabaje sobre datos limpios sin ruido de cuantizacion Q8. La cuantizacion se ejecuto solo en CPU porque el codificador NVFP4 de CUDA en Ampere se bloquea con tensores MoE. Ademas, se aplica una politica de proteccion por tensor: se mantienen en F16 cuatro tensores sensibles (`blk.0.attn_gate`, `blk.0.attn_qkv`, `blk.0.ffn_down_exps`, `blk.13.ffn_down_exps`) para evitar el colapso de valores singulares, y en F32 todas las normas, los escalares SSM (`ssm_conv1d`, `ssm_dt.bias`, `ssm_a`) y la puerta del experto compartido. El embedding de tokens se mantiene en F16.

## Capacidades

- Generacion de texto conversacional en ingles, chino y otros idiomas (etiqueta `multilingual`).
- Razonamiento y generacion de codigo: capacidad heredada del modelo base, sin benchmarks publicados en este repositorio.
- Vision multimodal: procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`) mediante el proyector `mmproj-Hermes3.6-35B-A3B-Uncensored-Genesis.gguf`.
- Tool calling y function calling: el ajuste se apoya en `NousResearch/hermes-function-calling-v1` e incluye un `System_Prompt_Agent.txt` especifico para uso agentico.
- Uso agentico y razonamiento multi-paso: el repositorio se etiqueta explicitamente como `agentic`.
- Prompting especializado: se incluyen prompts de sistema general, agentico y creativo, junto con plantilla de chat Jinja2.
- Modelo sin censura: la base declara 0 rechazos en 465 evaluaciones; no hay filtros de seguridad documentados.
- Contexto largo: ventana declarada de 262.144 tokens en el GGUF de origen (el ejemplo de uso recomienda 131.072 con `-c`).
- No se documenta modo de pensamiento explicito (thinking), soporte de audio ni decodificacion especulativa.

## Casos de uso

- Atencion al cliente multilingue: con 262.144 tokens de contexto se pueden mantener conversaciones multi-turno muy largas o inyectar manuales de producto completos sin trocear, atendiendo en ingles y chino con el mismo modelo.
- Analisis de documentos con imagenes: al ser `image-text-to-text`, permite extraer datos de facturas, capturas de pantalla, diagramas o formularios escaneados enviando la imagen junto al prompt, con el proyector `mmproj` cargado en llama.cpp.
- Agentes con llamada a funciones: el ajuste Hermes y el prompt agentico incluido permiten definir herramientas (busqueda, calculo, APIs internas) y encadenar varios pasos de razonamiento dentro de un orquestador propio.
- Generacion de codigo en estacion de trabajo: un fichero de ~20 GB cabe en GPUs de 24-32 GB, lo que permite autocompletado y refactorizacion en local sin enviar codigo propietario a servicios externos.
- Resumen de repositorios o corpus extensos: la ventana de 262.144 tokens admite procesar repositorios medianos o expedientes completos en una sola pasada, util para auditoria de codigo o revision documental.
- Despliegue on-premise con datos sensibles: la licencia Apache 2.0 permite uso comercial y los pesos son descargables, lo que facilita instalaciones aisladas en entornos sanitarios, legales o industriales.
- Dominios donde los filtros estandar interfieren: al no incluir rechazos, resulta util en red teaming, evaluacion de seguridad de sistemas, documentacion medica o narrativa adulta, siempre con supervision humana.
- Investigacion en cuantizacion NVFP4: el repositorio documenta el pipeline reproducible en dos pasos y la politica de proteccion por tensor, lo que sirve como referencia para estudiar el impacto de FP4 en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es la de la model card del modelo base, que afirma 0 rechazos sobre 465 peticiones evaluadas; se trata de una medida de comportamiento declarada por el autor, no de un benchmark estandarizado ni verificable con los datos aportados. No hay datos de MMLU, HumanEval, GSM8K ni de evaluacion multimodal para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para los pesos (estimacion derivada del tamaño de los ficheros, no dato oficial): ~20 GB para el modelo NVFP4 y ~0,9 GB adicionales si se carga el proyector de vision. Es una estimacion a partir del tamaño del fichero, no una cifra publicada.
- Memoria para cache KV: no disponible. La model card recomienda forzar cuantizacion F16 tanto en la cache K como en la V, lo que eleva el consumo; a 131.072 tokens de contexto el requisito adicional es significativo y depende de la configuracion de cabezas de atencion del modelo, que no se detalla.
- GPUs recomendadas: NVIDIA Blackwell (RTX 50xx) para la ruta FP4 nativa y el mejor rendimiento; RTX PRO 6000 Blackwell o H100/A100 de 80 GB si se quiere contexto largo con cache F16; en Ampere (RTX 30xx) la inferencia NVFP4 funciona mediante kernels de respaldo, con menor rendimiento.
- Viabilidad en GPU de consumo: el fichero de ~20 GB entra en tarjetas de 24 GB (RTX 4090, RTX 3090), pero dejando un margen minimo para cache KV y contexto; es mas holgado en 32 GB (RTX 5090) y recomendable para contextos largos.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--jinja`, `--mmproj`, `-ngl 99`), LM Studio y Pelican (compatibles gracias a las escalas NVFP4 en linea de la version v4), y el fork `advanced-gguf-quantizer` para reproducir la cuantizacion. No se confirma soporte en vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. En terminos teoricos, al activar solo ~3 B de parametros por token, la computa necesaria se aproxima a la de un modelo denso de ese tamaño, mientras que la memoria se corresponde con un modelo de ~34,66 B.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de terceros en la informacion proporcionada, por lo que la comparacion se limita a la propia cadena de derivaciones documentada:

| Variante | Parametros / cuantizacion | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (NVFP4 v4) | ~34,66 B totales, ~3 B activos; NVFP4 mixto con F16/F32/Q6_K | ~20 GB (+0,9 GB mmproj) | 262.144 | Apache 2.0 | Escalas UE4M3 en linea, compatible con LM Studio |
| GGUF de origen Q8_K_P | Mismo modelo, Q8_K_P a 10,06 BPW | 43,6 GB | 262.144 | No indicada en la ficha | Fuente de la cuantizacion; mayor fidelidad, mas memoria |
| LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF | Mismo modelo, cuantizaciones no detalladas | No disponible | No disponible | No disponible | Aporta la reparacion de tensores Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | Mismo tamaño de familia; sin datos de cuantizacion | No disponible | No disponible | No disponible | Base sin censura, declara 0/465 rechazos |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | Familia 35B-A3B | No disponible | No disponible | No disponible | Aporta los datos de ajuste Hermes |

No hay informacion en la busqueda web que permita comparar con alternativas externas de la misma categoria.

## Limitaciones y advertencias

- Modelo sin censura: no incorpora filtros de rechazo, por lo que puede generar contenido danino, ilegal o sensible si se le solicita. Requiere moderacion externa y supervision humana en cualquier despliegue con usuarios finales.
- Perdida de calidad por cuantizacion: NVFP4 sobre 226 tensores es una compresion agresiva; la propia model card documenta politicas de proteccion especificas (F16 en cuatro tensores criticos, F32 en normas y escalares SSM) precisamente porque algunos tensores se degradan. El impacto real no se ha medido con benchmarks.
- Riesgo de alucinacion: no hay evaluaciones de fidelidad ni de tasas de alucinacion publicadas; al tratarse de un ajuste fino sobre una base sin censura, la verificacion de hechos no esta garantizada.
- Cobertura idiomatica limitada: las etiquetas oficiales son en, zh y multilingual; no hay garantia de calidad en castellano ni en otras lenguas no listadas.
- Compatibilidad de runtime restringida: la version v4 usa unicamente escalas NVFP4 en linea y no emite tensores `.scale`/`.input_scale`; los runtimes que esperan el contrato extendido de NVFP4 no podran cargarla. No se confirma soporte en vLLM, TGI u Ollama.
- Reproduccion parcial: la cuantizacion se hizo solo en CPU porque el codificador NVFP4 de CUDA en Ampere se bloquea con tensores MoE; reproducirla en GPU puede no funcionar segun el hardware.
- Cadena de derivaciones larga: el modelo acumula una base sin censura, un ajuste Hermes, una reparacion de tensores y una cuantizacion, sin evaluaciones intermedias publicadas que acrediten que no hay regresiones.
- Adopcion nula: 0 descargas y 0 valoraciones en el momento de redactar la ficha, sin validacion independiente de la comunidad.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial y modificacion, pero conviene verificar las condiciones de los modelos base y del dataset Hermes antes de un uso comercial.
- Fecha de publicacion declarada: 22 de septiembre de 2026, posterior a la fecha habitual de consulta de muchas herramientas; puede afectar a la indexacion y a la disponibilidad de mirrors.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4
- Modelo base sin censura: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- GGUF de origen con reparacion Genesis: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF
- Ajuste Hermes sobre la base: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Perfil del autor de la cuantizacion: https://huggingface.co/jan1k
- Perfil del autor de Genesis: https://huggingface.co/LuffyTheFox
- Dataset de llamada a funciones: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Cuantizador empleado (fork de llama.cpp con foco en NVFP4): https://github.com/michaelw9999/advanced-gguf-quantizer

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los unicos enlaces disponibles son los citados en la model card y en los metadatos de HuggingFace. No se han encontrado papers, blogs ni demos adicionales.
