# Kujira/Underdog-Saluki-27B-1.0-MTP-Abliterated-GGUF

## Resumen
Underdog-Saluki-27B-1.0-MTP-Abliterated-GGUF es una version "abliterated" (sin rechazos) del modelo Underdog Saluki 27B 1.0 con cabecera MTP, publicada por el usuario Kujira en formato GGUF. El modelo deriva de ConwayResearch/Underdog-Saluki-27B-1.0, que a su vez se construye sobre Qwen3.8-27B y su cabecera de prediccion multi-token (MTP, Multi-Token Prediction) cuantizada por Unsloth. Cuenta con 27.320.697.856 parametros (unos 27,3 mil millones) y el fichero GGUF ocupa 8,35 GB en cuantizacion IQ2-mix con imatrix.

El objetivo del autor es eliminar la censura del modelo original: segun sus mediciones, la tasa de rechazo ante peticiones daninas cae del 99% al 1% (thinking desactivado) y del 78% al 2% (thinking activado), sin afectar a las peticiones inofensivas (0% de rechazo en ambos casos). Para lograrlo no se ha realizado ningun entrenamiento: solo se han modificado 4 tensores de los bloques 35 y 36, manteniendo intactos los otros 862 tensores y todos los metadatos, que son byte a byte identicos al release MTP original. El metodo concreto no esta publicado.

Es relevante para desarrolladores que necesiten un modelo de 27B sin filtros de rechazo, desplegable en GPUs de consumo (12 GB) y con decodificacion especulativa MTP nativa, orientado a investigacion, agentes con tool calling y uso local no censurado.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; derivado de Qwen3.8-27B. Los nombres de tensores de la model card (blk.35.attn_output, blk.35.ffn_down, blk.36.ffn_down, blk.36.ssm_out) indican una arquitectura hibrida con capas de atencion y capas SSM |
| Parametros totales | 27.320.697.856 (unos 27,3 mil millones) |
| Longitud de contexto | no disponible como valor nativo; en la configuracion de referencia se emplean 40.960 tokens (-c 40960) |
| Tipos de cuantizacion | IQ2-mix (2-bit) con imatrix; cache KV en q8_0 (ctk q8_0, ctv q8_0) en la configuracion de referencia |
| Idiomas soportados | en (ingles), ja (japones) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero Underdog-Saluki-27B-1.0-IQ2-mix-MTP-abliterated.gguf, 8,35 GB) |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura Qwen3.8-27B, sobre la que se ha anadido una cabecera MTP (Multi-Token Prediction) que habilita decodificacion especulativa propia con llama.cpp mediante la opcion --spec-type draft-mtp. La model card no detalla la arquitectura interna completa, pero los nombres de los tensores modificados (blk.35.attn_output, blk.35.ffn_down, blk.36.ffn_down, blk.36.ssm_out) apuntan a una estructura hibrida con componentes de atencion y de espacio de estados (SSM). El modelo base incluye una via de razonamiento ("thinking") que puede activarse o desactivarse.

No se ha realizado ningun entrenamiento, ajuste fino ni RLHF/DPO para esta version. La modificacion consiste exclusivamente en alterar 4 tensores de los bloques 35 y 36, conservando sus tipos de cuantizacion y tamanos originales. El resto de tensores (incluida la cabecera MTP en blk.64.*) y todos los metadatos permanecen byte a byte identicos al fichero Underdog-Saluki-27B-1.0-IQ2-mix-MTP.gguf (sha256 98f6ebb5...e89e52). El autor declara que el metodo de "abliteracion" no esta publicado. Los datos de entrenamiento, numero de tokens y composicion del dataset del modelo base no estan disponibles en la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional en ingles y japones.
- Razonamiento con modo "thinking" activable (hasta 1.536 tokens en las pruebas citadas).
- Tool calling / function calling: en las pruebas del autor acierta la herramienta correcta en el 100% de 30 prompts con 10 herramientas, con argumentos validos en el 100% de los casos.
- Uso en agentes y razonamiento multi-paso: capacidad de responder tras recibir un resultado de herramienta (100% en 30 prompts) y de decidir cuando no invocar ninguna herramienta (80% en 10 prompts).
- Decodificacion especulativa MTP integrada, con drafting propio.
- Capacidad "abliterated"/uncensored: no rechaza peticiones daninas, pensada para investigacion.
- Capacidades multilingues limitadas a ingles y japones segun los metadatos.
- No se mencionan capacidades de vision, audio ni otras modalidades.

## Casos de uso
- Investigacion sobre seguridad y alineacion: el modelo permite estudiar comportamiento sin filtros de rechazo y comparar con la version original (99% de rechazo frente a 1% en el mismo conjunto de prompts daninos), util para red teaming y analisis de riesgos.
- Agentes con tool calling en local: al integrarse con llama.cpp y soportar function calling fiable (100% de acierto en herramienta y argumentos en las pruebas), puede alimentar agentes que consulten APIs o bases de datos en entornos sin conexion.
- Despliegue en GPU de consumo: con 8,35 GB de pesos cabe en tarjetas de 12 GB y permite 40K de contexto (11,4 GB con un prompt de 22K tokens), lo que lo hace apto para estaciones de trabajo modestas.
- Generacion y asistencia de codigo en pipelines locales: al derivar de la familia Qwen y soportar tool calling, puede integrarse en flujos de autocompletado o revision de codigo que no requieran salida a la nube.
- Procesamiento de documentacion en ingles y japones: la ventana de 40.960 tokens permite resumir o extraer informacion de documentos largos en ambos idiomas, con perplejidad medida de 6,662 (ingles) y 11,41 (japones).
- Experimentacion con decodificacion especulativa MTP: sirve como banco de pruebas para medir ganancias de velocidad (58-62 tok/s con MTP activado a 40K de contexto) frente a decodificacion estandar.
- Asistentes conversacionales sin moderacion para uso interno: util en entornos de investigacion donde se necesita una politica de contenido laxa, siempre bajo salvaguardas propias del operador.

## Benchmarks y rendimiento
Los siguientes datos son mediciones del autor en una unica maquina (RTX 3080 12 GB, WSL2, fork PrismML prism-b10754 de llama.cpp). El propio autor advierte que son pruebas pequenas y no constituyen un benchmark formal.

| Metrica | Original (release MTP) | Este fichero |
|---|---|---|
| Rechazo, prompts daninos (64 tokens, sin thinking) | 99% | 1% |
| Rechazo, prompts daninos (con thinking, hasta 1.536 tokens) | 78% | 2% |
| Rechazo, prompts inofensivos (con thinking) | 0% | 0% |
| Perplejidad, ingles (wikitext-2 test, 2048 x 40 chunks) | 6,558 | 6,662 (+1,6%) |
| Perplejidad, japones (wiki40b-ja test, 2048 x 40 chunks) | 11,21 | 11,41 (+1,8%) |
| Texto largo, 24 prompts (en/ja, con thinking): bucle / respuesta vacia | 0% / 8% | 0% / 0% |
| Tool calling, 30 prompts con 10 herramientas: herramienta correcta / argumentos validos | 97% / 100% | 100% / 100% |
| Respuesta tras un resultado de herramienta (falso), 30 prompts | 100% | 100% |
| Sin invocacion de herramienta cuando no se necesita, 10 prompts | 90% | 80% |
| Velocidad (MTP activado, 40K contexto) | ~58-62 tok/s | ~58-62 tok/s |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM para inferencia: el fichero GGUF pesa 8,35 GB; en la configuracion de referencia ocupa 11,4 GB con contexto de 40K y un prompt de 22K tokens.
- Contexto y VRAM: 40K de contexto cabe en tarjetas de 12 GB; 64K arranca en 11,85 GB y crece aproximadamente 0,45 GB con prompts largos, lo que provoca desbordamiento a VRAM del sistema y una caida brusca de velocidad.
- GPU recomendadas: el autor verifica RTX 3080 de 12 GB. No se indican otras GPU (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB para contexto de 40K. En 64K el rendimiento se degrada por desbordamiento de memoria.
- Opciones de despliegue: llama.cpp (con drafting MTP mediante --spec-type draft-mtp y --spec-draft-n-max 2), usando llama-server con --jinja, -ngl 99, -fa on. El fork citado es PrismML prism-b10754. No se confirman otros motores (vLLM, Ollama, TGI) en la informacion proporcionada.
- Latencia y throughput: aproximadamente 58-62 tok/s con MTP activado a 40K de contexto en la maquina de referencia.
- Parametros de muestreo recomendados: --temp 0.6, --top-p 0.95, --top-k 20, --presence-penalty 1.5. El autor indica que sin la penalizacion de presencia de 1.5 el modo thinking puede entrar en bucles repetitivos en uso de agente.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Underdog-Saluki-27B-1.0-MTP-Abliterated-GGUF) | 27,3 mil millones | 40.960 tokens en configuracion de referencia | Rechazo danino 1-2%; perplejidad en 6,662; tool calling 100% | apache-2.0 | GGUF en HuggingFace |
| Underdog-Saluki-27B-1.0-MTP-GGUF (original, sin abliterar) | 27,3 mil millones | 40.960 tokens en configuracion de referencia | Rechazo danino 78-99%; perplejidad en 6,558; tool calling 97-100% | apache-2.0 | GGUF en HuggingFace |
| ConwayResearch/Underdog-Saluki-27B-1.0 (modelo base) | 27,3 mil millones | no disponible | no disponible (el autor remite a la model card de Saluki para las cifras del original) | no disponible en la informacion proporcionada | pesos base en HuggingFace |

Comparativas con otros modelos de 27B de la misma categoria (por ejemplo, otras variantes abliterated de la familia Qwen u otros modelos densos de ~27B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan de forma especifica; el modelo hereda los del base (Qwen3.8-27B y Underdog Saluki) y el autor no aporta analisis de sesgo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el incremento de perplejidad tras la modificacion es del +1,6% en ingles y +1,8% en japones, sin que se hayan medido tasas de alucinacion.
- Limitaciones de contexto: el contexto nativo no esta declarado; en 64K la VRAM se desborda y la velocidad cae de forma acusada. El uso practico verificado es 40K en GPU de 12 GB.
- Limitaciones de idioma: solo se declaran ingles y japones; el rendimiento en castellano u otros idiomas no esta evaluado.
- Restricciones de licencia: apache-2.0, permitiendo uso comercial, pero el propio autor indica que el modelo "no rechaza peticiones daninas" y que no debe ponerse frente a usuarios finales sin salvaguardas propias. El uso previsto es investigacion y uso local sin censura.
- Caveat de produccion: la eliminacion de rechazos implica que el modelo puede generar contenido danino, ilegal o inseguro; su despliegue en produccion sin moderacion adicional es responsabilidad del operador.
- Trazabilidad metodologica: el metodo de "abliteracion" no esta publicado y no ha habido entrenamiento; la modificacion se limita a 4 tensores, por lo que su comportamiento fuera de los casos evaluados no esta caracterizado.
- Fiabilidad de las mediciones: los datos provienen de una unica maquina y conjuntos de evaluacion pequenos (24-104 prompts), segun advierte el propio autor, y no equivalen a un benchmark.
- Aviso del autor (responsable use): disenado para investigacion y uso local sin censura; el usuario es responsable del uso y del contenido generado.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Kujira/Underdog-Saluki-27B-1.0-MTP-Abliterated-GGUF
- Release MTP original (base de esta version): https://huggingface.co/Kujira/Underdog-Saluki-27B-1.0-MTP-GGUF
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Cuantizacion de la cabecera MTP por Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Fork de llama.cpp citado (PrismML): prism-b10754 (sin URL directa en la informacion proporcionada)
- Prompts y scripts de evaluacion: disponibles bajo peticion en la pestana Discussions del repositorio (sin URL directa en la informacion proporcionada)
