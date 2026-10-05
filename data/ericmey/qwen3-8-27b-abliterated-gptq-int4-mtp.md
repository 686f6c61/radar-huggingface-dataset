# ericmey/Qwen3.8-27B-abliterated-GPTQ-Int4-MTP

## Resumen

ericmey/Qwen3.8-27B-abliterated-GPTQ-Int4-MTP es una cuantización GPTQ de 4 bits del modelo abliterado huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez deriva del Qwen/Qwen3.8-27B del equipo Qwen (Alibaba). El repositorio no aporta un fine-tune nuevo ni una abliteración distinta: el autor declara explícitamente que solo ha realizado la cuantización y el empaquetado para inferencia en Intel Arc. El resultado es un modelo multimodal denso de 27.781.427.952 parámetros (unos 27,8B) en formato GPTQ INT4 simétrico con group size 128 y sin `desc_act`, lo que reduce el peso en disco a unos 19 GB repartidos en cinco shards de safetensors.

La particularidad técnica del build es doble. Por un lado, conserva los 15 tensores `mtp.*` del cabezal de decodificación especulativa (multi-token prediction) en BF16, excluidos de la cuantización mediante la regla `dynamic={"-:.*mtp.*": {}}` del recetario de gptqmodel; el autor señala que la clase `Qwen3_5ForConditionalGeneration` descarta esos tensores al cargar, por lo que muchas cuantizaciones los pierden silenciosamente. Por otro, mantiene la torre de visión en F16, de modo que el modelo sigue siendo image-text-to-text y admite entradas de imagen (y vídeo a nivel de preprocesador).

Es relevante ahora porque empaqueta un modelo multimodal de 27B y 262.144 tokens de contexto nativo en un formato que cabe en GPUs de 24 GB, con decodificación especulativa funcionando de fábrica y soporte declarado tanto para vLLM sobre Intel XPU (Arc Xe2 / serie B) como para CUDA, dado que los kernels GPTQ son independientes del hardware. El repositorio es muy reciente y no tiene descargas ni valoraciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (clase `Qwen3_5ForConditionalGeneration`); el comando de despliegue del autor incluye `--mamba-cache-mode align` y `--mamba-ssm-cache-dtype float16`, lo que apunta a componentes de estado (SSM/Mamba) en el bloque decodificador; la composición exacta de capas no esta disponible |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; servido y probado a 131.072 tokens |
| Tipos de cuantizacion | GPTQ INT4 simetrico, group size 128, `desc_act=false`, empaquetado int32 (W4A16). Torres MTP en BF16 y torre de vision en F16, sin cuantizar |
| Idiomas soportados | en, zh (segun los metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (5 shards, ~19 GB), con `quantize_config.json`, `config.json`, `generation_config.json`, `tokenizer*.json`, `chat_template.jinja` y procesadores de vision/video |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, presentado por el equipo Qwen como un LLM denso multimodal nativo orientado a hardware local, con buen desempeño declarado en codigo, flujos agénticos y automatizacion de oficina. Sobre esa base, huihui-ai aplico una abliteracion de la direccion de rechazo (abliterated/uncensored), publicada en BF16. Este repositorio toma ese checkpoint abliterado y le aplica cuantizacion GPTQ de 4 bits con gptqmodel 7.3.2, usando calibracion de aproximadamente 256 muestras de texto general con longitud de secuencia 2048, `batch_size=1` y `true_sequential=True`. El resultado son 400 tensores de pesos cuantizados en int32, mas los 15 tensores `mtp.*` en BF16 y la torre de vision en F16.

La innovacion practica del build es la preservacion del cabezal MTP, que bajo vLLM hace que el modelo se resuelva como `Qwen3_5MTP` y acepte `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`. Se trata de decodificacion especulativa con un draft head nativo del propio modelo, no de un modelo draft separado. El autor afirma que la carga y la generacion con MTP estan verificadas y que son las responsables de las velocidades de decodificacion reportadas. La abliteracion, segun el propio autor, no altera formas de tensor ni afecta al MTP: los pesos son los de huihui-ai re-cuantizados, no un entrenamiento adicional. No se dispone de informacion sobre el dataset de preentrenamiento del Qwen3.8-27B original, el numero de tokens vistos ni la composicion exacta del corpus de calibracion mas alla de la descripcion "aproximadamente 256 muestras de texto general, seqlen 2048".

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat Qwen3 (`chat_template.jinja`).
- Modo thinking con conmutador explicito; el autor recomienda temperaturas distintas para modo pensamiento y modo directo.
- Razonamiento multi-paso y tareas de codigo (el benchmark propio incluye pruebas de codigo, explicacion y agente).
- Tool calling / function calling: en vLLM se habilita con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`; el autor reporta 60/60 llamadas bien formadas a dos temperaturas distintas.
- Uso como agente: el propio autor lo apunta con `--reasoning-parser qwen3` y lo incluye en la prueba de decodificacion "agent".
- Vision: el pipeline es `image-text-to-text` y el repositorio incluye `preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json`; hay una prueba de humo de vision que lee texto y formas, marcada como PASS.
- Multilingue limitado a ingles y chino segun los metadatos; no se declaran otros idiomas.
- Decodificacion especulativa nativa (MTP) con hasta 3 tokens especulativos por paso en la configuracion probada.
- Sin censura: el autor etiqueta el modelo como abliterated/uncensored y remite a sus advertencias de uso.

## Casos de uso

- Atencion al cliente automatizada con contexto largo: con 262.144 tokens nativos (131.072 en la configuracion probada) y cache de prefijo activada, el modelo puede mantener hilos con historial extenso, documentacion adjunta y multiples turnos sin truncar.
- Analisis de documentos con imagenes: al conservar la torre de vision, permite extraer informacion de capturas, formularios escaneados o diagramas y continuar la conversacion en texto, con un limite de 4 imagenes por prompt en la configuracion de referencia.
- Generacion de codigo en produccion: soporta tool calling con el parser `qwen3_coder`, por lo que puede integrarse en pipelines que invoquen funciones, ejecuten consultas o encadenen pasos en un flujo de CI/CD.
- Agentes con razonamiento multi-paso: el modo thinking mas el parser de razonamiento `qwen3` permiten separar el bloque de razonamiento de la respuesta final, util para orquestadores que necesiten trazas intermedias.
- Asistentes sobre hardware Intel Arc: es uno de los pocos empaquetados GPTQ explicitamente preparados para vLLM XPU sobre Arc Xe2 / serie B, lo que habilita despliegues locales en estaciones con GPU Intel en lugar de NVIDIA.
- Despliegue on-premise con requisitos de privacidad: al caber en el orden de 24 GB por GPU con cuantizacion INT4, permite servir el modelo sin salida a la nube en entornos con datos sensibles.
- Investigacion sobre seguridad y alineacion: al ser una variante abliterada, sirve como referencia para estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo manteniendo las mismas formas de tensor y el mismo rendimiento de decodificacion.
- Procesamiento por lotes de texto en chino e ingles: el soporte declarado de ambos idiomas lo hace util para pipelines de traduccion, resumen o clasificacion en esos dos mercados.

## Benchmarks y rendimiento

El autor publica mediciones propias realizadas sobre 2 GPU Intel Arc Pro B60 de 24 GB, tensor parallelism 2, vLLM XPU, MTP con 3 tokens especulativos y cronometraje en el lado del cliente. La comparacion es contra un build GPTQ no abliterado de la misma base, con la misma receta y argumentos.

| Prueba | Este modelo | Baseline no abliterado |
|---|---:|---:|
| Decodificacion — codigo / explicacion / agente (tok/s) | 47,3 / 48,4 / 50,7 | 47,2 / 42,7 / 49,2 |
| Decodificacion media (tok/s) | 48,8 | 46,4 |
| Sanidad de respuesta exacta (20 items, greedy) | 20 / 20 | 20 / 20 |
| Llamadas a herramienta bien formadas (60 x 2 temperaturas) | 60/60 · 60/60 | 60/60 · 60/60 |
| Prueba de humo de vision (leer texto y forma) | PASS | PASS |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos de velocidad corresponden a una configuracion concreta de hardware y no son extrapolables a otras GPU.

## Requisitos de hardware

- Peso en disco del repositorio: aproximadamente 19,6 GB (5 shards, ~19 GB de pesos). Los pesos cuantizados en INT4 ocupan del orden de 14-15 GB, a lo que se suman los tensores MTP en BF16 y la torre de vision en F16.
- VRAM: por debajo de 24 GB es viable en contextos cortos en una unica GPU de 24 GB. Para contextos de 131.072 tokens conviene repartir en 2 GPU de 24 GB o usar una GPU de 48 GB o mas, ya que la cache KV de 131k consume una parte significativa del presupuesto de memoria.
- Configuracion verificada por el autor: 2 x Intel Arc Pro B60 de 24 GB con TP=2, `--gpu-memory-utilization 0.92`, `--dtype float16`, `--max-model-len 131072` y cache de prefijo activada.
- GPU compatibles: Intel Arc Xe2 / serie B (objetivo declarado, XPU W4A16) y, segun el autor, tambien CUDA, porque los kernels GPTQ son independientes del hardware. No se especifican modelos concretos de NVIDIA en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas para contextos moderados; en tarjetas de 16 GB seria necesario reducir la longitud de contexto o aplicar cuantizacion adicional de la cache KV. No hay confirmacion del autor para este ultimo escenario.
- Opciones de despliegue: vLLM es el motor objetivo (con `--quantization gptq`, `--tensor-parallel-size`, `--enable-prefix-caching`, `--mamba-cache-mode align`). El autor indica que tambien carga en CUDA con `vllm.LLM(..., tensor_parallel_size=2)`. No se documentan Ollama, llama.cpp o TGI para este repositorio concreto; existen builds GGUF alternativos de terceros para llama.cpp.
- Throughput y latencia: 48,8 tok/s de media en decodificacion con MTP3 sobre 2 x Arc Pro B60 (TP=2), con valores entre 42,7 y 50,7 tok/s segun la tarea. No se publican datos de time to first token ni de throughput agregado con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ericmey/Qwen3.8-27B-abliterated-GPTQ-Int4-MTP | 27,8B denso multimodal | 262.144 nativo (131.072 probado) | GPTQ INT4 + MTP BF16 + vision F16, safetensors | apache-2.0 | Repositorio muy reciente, 0 descargas y 0 likes registrados |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B denso multimodal | no disponible en la informacion proporcionada | BF16, transformers | no disponible en la informacion proporcionada | Modelo base de este repositorio |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF | 27B denso multimodal | no disponible | GGUF, 9 cuantizaciones principales con cabezal MTP embebido en cada modelo | no disponible en la informacion proporcionada | Alternativa para llama.cpp en un unico fichero |
| Qwen/Qwen3.8-27B (base original) | 27B denso multimodal | no disponible | pesos originales | no disponible en la informacion proporcionada | Modelo de referencia no abliterado del equipo Qwen |

No se dispone de resultados de benchmarks comparativos entre estas variantes mas alla de los datos de decodificacion que el autor publica contra un build GPTQ no abliterado de la misma base (ver seccion anterior).

## Limitaciones y advertencias

- Modelo abliterado y sin censura: el autor lo etiqueta explicitamente como uncensored y remite a advertencias de uso. Puede producir contenido que los modelos alineados rechazan, lo que exige filtros propios en cualquier despliegue orientado al publico.
- El autor no especifica que sesgos concretos introduce la abliteracion ni con que datos se midio la eliminacion de la direccion de rechazo.
- Riesgo de alucinacion: inherente a un modelo generativo de 27B sin datos publicados de benchmarks de veracidad. Los unicos controles reportados son una prueba de sanidad de respuesta exacta con 20 items y greedy decoding, insuficiente para caracterizar el comportamiento en produccion.
- Cobertura idiomatica limitada: los metadatos declaran solo ingles y chino. No hay datos de rendimiento en castellano ni en otros idiomas.
- La calibracion GPTQ se realizo con aproximadamente 256 muestras de texto general y seqlen 2048. Esto puede degradar tareas no representadas en el corpus de calibracion, especialmente dominios muy especializados o prompts con imagenes.
- El repositorio cuantiza solo el decodificador; la torre de vision queda en F16 y los tensores MTP en BF16, de modo que el ahorro de memoria es menor que el de una cuantizacion completa y el consumo real supera la estimacion basada solo en los pesos INT4.
- El modelo se ha publicado muy recientemente (octubre de 2026 segun los metadatos) y no tiene descargas ni likes. La validacion es unicamente la del autor, en un unico entorno de hardware (2 x Intel Arc Pro B60, vLLM XPU). No hay verificacion independiente.
- El autor limita el alcance de su trabajo: solo cuantizacion y empaquetado. No responde de la calidad del modelo base ni de la abliteracion.
- La licencia es apache-2.0, permisiva para uso comercial, pero el repositorio no incluye avisos adicionales sobre el uso del modelo abliterado. Conviene revisar la licencia del modelo base de Qwen para confirmar la cadena completa de atribucion.
- Limitaciones de contexto: aunque el contexto nativo es de 262.144 tokens, el autor solo ha probado 131.072. No hay datos publicados sobre degradacion del rendimiento mas alla de esa marca ni sobre la precision del modelo con contextos muy largos.
- El soporte de video aparece en el preprocesador pero la configuracion de referencia de vLLM lo desactiva (`"video":0`). No hay confirmacion de que el pipeline de video funcione de extremo a extremo con esta cuantizacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ericmey/Qwen3.8-27B-abliterated-GPTQ-Int4-MTP
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Alternativa GGUF con MTP embebido: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF
- Ficha de la variante abliterada: https://abliteratedmodels.org/qwen3.8-27b-abliterated/
- Ficha de la familia abliterada Qwen3.8-27B: https://www.abliteratedmodels.org/qwen3.8-27b/
- Repositorio del modelo base de Qwen: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta de cuantizacion gptqmodel: https://github.com/modelcloud/gptqmodel
