# PYTHAI/Qwen3.8-2.4T-A95B-fork

## Resumen

PYTHAI/Qwen3.8-2.4T-A95B-fork es un repositorio espejo (fork) del modelo Qwen/Qwen3.8-2.4T-A95B, publicado por el usuario PYTHAI el 13 de septiembre de 2026. No es un modelo nuevo ni un ajuste fino: es un puntero con licencia congelada que preserva unicamente la licencia, la configuracion, el tokenizer y el codigo del commit `207bd685a7e3696cfaff12ded7c6a7ea0f88c996` del repositorio original, con los digests SHA-256 registrados en `FORK.json`. El repositorio ocupa 0,0 GB porque no almacena pesos: los 213 archivos de pesos (4892,4 GB) permanecen en el repositorio de origen, y el propio autor indica que deben cargarse desde alli fijando la revision.

El modelo subyacente es la primera entrega abierta de la clase Qwen-Max de la familia Qwen. Se trata de un transformer causal con mezcla de expertos (MoE) de 2,4 billones de parametros totales y 95.000 millones activados, con 92 capas organizadas en 23 bloques de la forma 3 × (Gated DeltaNet → MoE) seguidos de 1 × (Gated Attention → MoE), 512 expertos (10 enrutados + 1 compartido por token) y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. La atencion es hibrida: capas de atencion lineal Gated DeltaNet combinadas con capas de atencion completa agrupada (64 cabezas Q, 4 cabezas KV).

Su relevancia es doble. Por un lado, marca la apertura de pesos de un modelo de escala Max-class, pensado para tareas agenticas de horizonte largo y trabajo profesional. Por otro, el repositorio analizado ejemplifica una practica creciente de archivado: fijar licencia, configuracion y tokenizer de un commit concreto sin duplicar terabytes de pesos, lo que resulta util para trazabilidad legal y reproducibilidad, pero inutil como artefacto de despliegue autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con MoE: 23 × (3 × Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE); etiqueta `qwen3_5_moe_text` |
| Parametros totales | 2,4 billones (2,4 T) |
| Parametros activos | 95.000 millones (95 B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (la informacion proporcionada no documenta cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la model card no detalla idiomas) |
| Licencia | other, `license_name: qwen3.8-max`, enlace `LICENSE` (heredada del commit fijado del modelo original) |
| Formato de pesos | safetensors (en el repositorio original; este fork no contiene pesos) |

Datos adicionales de configuracion: dimension oculta 8192; embedding y salida LM de 248.320 tokens (padded); 92 capas; Gated DeltaNet con 128 cabezas de atencion lineal para V y 16 para QK, dimension de cabeza 128; Gated Attention con 64 cabezas Q y 4 KV, dimension de cabeza 256 y dimension de RoPE 64; 512 expertos con dimension intermedia 2048; 10 expertos enrutados + 1 compartido activados por token; MTP (Multi-Token Prediction) entrenado con multiples pasos. Tamano del repositorio del fork: 0,0 GB. Descargas y likes registrados: 0.

## Arquitectura y entrenamiento

El modelo es un decoder causal de tipo MoE con atencion hibrida. La capa recurrente es Gated DeltaNet, una forma de atencion lineal con estado constante que reduce el coste de las secuencias largas, mientras que una de cada cuatro capas emplea Gated Attention convencional con atencion agrupada (64 cabezas Q sobre 4 cabezas KV) y RoPE de dimension 64. La mezcla de expertos intercala en cada bloque un MoE de 512 expertos con dimension intermedia 2048, activando 11 expertos por token (10 enrutados mas 1 compartido), lo que explica la relacion entre 2,4 T de parametros totales y 95 B activos. El entrenamiento incluye prediccion multi-token (MTP) con varios pasos, tecnica habitualmente asociada a decodificacion especulativa en inferencia.

La informacion disponible confirma que el modelo ha pasado por pre-entrenamiento y post-entrenamiento, con mejoras declaradas en codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo. El post-entrenamiento incorpora control flexible del razonamiento mediante el parametro `reasoning_effort` y la retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni la secuencia exacta de tecnicas de alineamiento (RLHF, DPO u otras): no disponible.

## Capacidades

- Generacion de texto causal y conversacion multi-turno en el pipeline `text-generation`.
- Razonamiento con profundidad ajustable mediante `reasoning_effort`, y preservacion del rastro de razonamiento historico con `preserve_thinking`.
- Codigo: la model card declara mejoras sustanciales en tareas de programacion y en el benchmark Terminal Bench 2.1.
- Ejecucion agentica: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de multiples pasos de principio a fin.
- Tareas de horizonte largo, con soporte nativo de 262.144 tokens y extension declarada hasta 1.010.000.
- Trabajo profesional y de investigacion, con mejoras declaradas en ambos dominios.
- Compatibilidad con harnesses y herramientas de desarrollo habituales (la model card menciona soporte ampliado de `harnesses`, sin enumerarlos).
- Decodificacion con prediccion multi-token (MTP) entrenada para varios pasos.
- Capacidades multimodales: el modelo abierto es de texto; la vision se ofrece en la version gestionada Qwen3.8-Max, no en estos pesos.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible para el modelo abierto. Las herramientas integradas oficiales se anuncian como caracteristica de Qwen3.8-Max.
- Idiomas soportados: no disponible.

## Casos de uso

- Agentes de codigo de horizonte largo: encadenar tareas de refactorizacion, ejecucion de tests y correccion de errores iterando sobre la retroalimentacion del entorno. El modelo esta explicitamente disenado para completar tareas multi-paso con mayor fiabilidad y sus resultados en Terminal Bench 2.1 (84,6 en modelos frontera comparables) lo situan en esa liga.
- Migracion de bases de codigo extensas: con 262.144 tokens de contexto nativo, un unico prompt puede contener modulos completos, ficheros de configuracion y trazas de compilacion, evitando la fragmentacion en trozos que degrada la coherencia de refactorizaciones grandes.
- Atencion al cliente automatizada de nivel avanzado: conversaciones multi-turno con historial extenso, usando `preserve_thinking` para mantener coherencia en sesiones largas y `reasoning_effort` bajo para respuestas rapidas.
- Investigacion asistida y sintesis documental: analisis de corpus tecnicos o cientificos que superan el millon de tokens con la extension de contexto declarada, generando resumenes y comparativas entre fuentes.
- Automatizacion de procesos profesionales multi-paso (RPA cognitivo): interpretacion de documentos, extraccion de datos, validacion contra reglas y generacion de informes, aprovechando la planificacion autonoma y el manejo de feedback.
- Auditoria y revision de repositorios: con `preserve_thinking` el modelo puede retener el razonamiento de pasos anteriores dentro de una revision larga y justificar cada hallazgo de forma trazable.
- Servicio de inferencia con mayor throughput: la cabecera MTP permite decodificacion especulativa en frameworks compatibles, reduciendo el coste por token frente a decodificacion autorregresiva pura.
- Archivado y reproduccion legal: este fork concreto sirve para fijar la licencia, el tokenizer y la configuracion de un commit exacto con digests SHA-256, util en auditorias de cumplimiento o en pipelines que exigen inmutabilidad de artefactos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa, pero el contenido proporcionado esta truncado: solo se conserva la primera fila completa de la categoria "Coding Agent". Los valores que aparecen son los siguientes.

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (coding agent) | 84,6 | 84,6 | 88,8 | 74,5 | no disponible (tabla truncada en la informacion proporcionada) |

El resto de filas de la tabla (otras tareas de coding agent, categorias adicionales y la columna de Qwen3.8-2.4T-A95B) no estan presentes en la informacion disponible. Nota importante: los valores de la tabla corresponden a Qwen3.8-Max, la version gestionada del modelo, no necesariamente a los pesos abiertos aqui referenciados. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar para Qwen3.8-2.4T-A95B.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 4,8 TB solo para pesos (2,4 × 10^12 parametros × 2 bytes). Estimacion propia derivada del recuento de parametros; el repositorio original declara 4892,4 GB en 213 archivos de pesos, cifra coherente con esta estimacion.
- VRAM en fp8: aproximadamente 2,4 TB. En int4: aproximadamente 1,2 TB. Estas cifras siguen siendo incompatibles con cualquier nodo unico de GPU comercial.
- Cache KV estimada: con 23 capas de atencion completa, 4 cabezas KV y dimension de cabeza 256, la cache equivale a 2 × 4 × 256 × 23 = 47.104 valores por token, es decir, unos 24 GiB en bf16 a 262.144 tokens y unos 93 GiB si se escala linealmente a 1.010.000 tokens. Estimacion propia a partir de la configuracion declarada. Las capas Gated DeltaNet mantienen estado constante y no crecen con la longitud.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen de memoria, el despliegue en bf16 exige agregacion multi-nodo (por ejemplo, varios nodos de 8 GPU de clase H100/H200/B200); no se especifica una configuracion oficial validada.
- GPU de consumo: no. Ninguna GPU consumer actual dispone de la memoria necesaria ni con cuantizacion agresiva a 1,2 TB.
- Opciones de despliegue: la model card declara compatibilidad con vLLM, SGLang y TokenSpeed, ademas del formato Hugging Face Transformers. No se mencionan llama.cpp, Ollama, TGI ni GGUF; dado el tamano y la ausencia de cuantizaciones publicadas, esas rutas no son viables.
- Este fork en concreto no es desplegable por si solo: no contiene pesos. Para cargarlo hay que usar el repositorio original con la revision fijada: `AutoModel.from_pretrained("Qwen/Qwen3.8-2.4T-A95B", revision="207bd685a7e3696cfaff12ded7c6a7ea0f88c996", trust_remote_code=True)`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B (pesos abiertos) | 2,4 T totales / 95 B activos | 262.144 nativo, hasta 1.010.000 | other (`qwen3.8-max`) | Pesos abiertos en Hugging Face (safetensors) | No publicado en la informacion disponible |
| Qwen3.8-Max (servicio gestionado) | Misma base que Qwen3.8-2.4T-A95B | 1.000.000 por defecto | Propietaria del servicio | API en Qwen Cloud y Qwen Studio | Terminal Bench 2.1: no disponible (truncado) |
| Qwen3.7-Max (generacion anterior) | no disponible | no disponible | no disponible | Servicio gestionado | Terminal Bench 2.1: 74,5 |
| Opus 4.8 | no disponible | no disponible | no disponible | No disponible en la informacion proporcionada | Terminal Bench 2.1: 84,6 |
| Fable 5 | no disponible | no disponible | no disponible | No disponible en la informacion proporcionada | Terminal Bench 2.1: 84,6 |
| GPT 5.6 Sol (max) | no disponible | no disponible | no disponible | No disponible en la informacion proporcionada | Terminal Bench 2.1: 88,8 |

La diferencia funcional mas relevante entre el modelo abierto y Qwen3.8-Max es que la version gestionada anade entrada de vision, modo sin razonamiento (non-thinking), 1.000.000 de tokens de contexto por defecto y herramientas integradas oficiales.

## Limitaciones y advertencias

- El repositorio analizado no contiene pesos (0,0 GB). No es utilizable como modelo por si mismo; solo como referencia de licencia, configuracion y tokenizer de un commit concreto.
- La licencia es `other` con nombre `qwen3.8-max` y terminos definidos en el fichero `LICENSE` del commit fijado. Los derechos y obligaciones aplicables son los de esa licencia upstream; los terminos concretos de uso comercial no se detallan en la informacion proporcionada y deben verificarse antes de cualquier despliegue productivo.
- La tabla de benchmarks de la model card esta truncada en la informacion disponible, y los valores mostrados corresponden a Qwen3.8-Max (servicio gestionado), no necesariamente a los pesos abiertos. No deben extrapolarse sin verificacion.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion. El riesgo de alucinacion es inherente a los modelos generativos de esta familia y no se cuantifica en la informacion disponible.
- Capacidad multimodal: ausente en los pesos abiertos; solo disponible en Qwen3.8-Max.
- El soporte de tool calling y function calling no se confirma explicitamente para el modelo abierto; la model card atribuye las herramientas integradas a la version gestionada.
- Requisitos de infraestructura extremos: 4,8 TB en bf16 solo para pesos. Esto descarta el despliegue en hardware de consumo y obliga a agregacion multi-nodo con interconexion de alta velocidad.
- La decodificacion especulativa basada en MTP requiere soporte especifico del framework de inferencia; su disponibilidad efectiva en vLLM, SGLang o TokenSpeed no se detalla.
- Fecha de creacion del fork: 13 de septiembre de 2026. Descargas y likes registrados: 0, lo que implica ausencia de validacion por parte de la comunidad.
- Un fork de terceros anade un punto de confianza adicional: conviene verificar los digests de `FORK.json` contra el commit original antes de usarlo como referencia contractual.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los resultados obtenidos corresponden a herramientas de generacion de video sin relacion con el objeto de esta ficha.

## Enlaces

- Repositorio del fork: https://huggingface.co/PYTHAI/Qwen3.8-2.4T-A95B-fork
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Fichero `FORK.json` con los digests SHA-256: https://huggingface.co/PYTHAI/Qwen3.8-2.4T-A95B-fork/blob/main/FORK.json
- Licencia del commit fijado: https://huggingface.co/PYTHAI/Qwen3.8-2.4T-A95B-fork/blob/main/LICENSE
- Blog de Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Vision general de Qwen3.8-Max: https://www.qwencloud.com/models/qwen3.8-max
- Qwen Cloud (servicio de inferencia gestionado): https://www.qwencloud.com
- Qwen Studio (chat con Qwen3.8-Max): https://chat.qwen.ai/?models=qwen3.8-max

Nota: la busqueda web asociada a esta ficha no devolvio papers, repositorios ni demos relacionados con el modelo; los unicos resultados obtenidos fueron paginas de generadores de video por IA, sin relacion con Qwen3.8 ni con este fork.
