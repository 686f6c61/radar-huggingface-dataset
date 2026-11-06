# richardyoung/Mistral-Small-Instruct-2409-SOM-heretic

## Resumen

Mistral-Small-Instruct-2409-SOM-heretic es un ajuste fino (finetune) del modelo mistralai/Mistral-Small-Instruct-2409, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, una version del modelo base a la que se le han aplicado tecnicas de ablacion de direcciones de rechazo (refusal directions) para reducir el comportamiento de censura y negativa a responder, manteniendo el resto de capacidades del modelo original. El modelo base Mistral-Small-Instruct-2409 es un transformer denso de aproximadamente 22.200 millones de parametros desarrollado por Mistral AI, con una ventana de contexto de 128.000 tokens segun la documentacion publica de Mistral AI.

El modelo hereda la arquitectura y el entrenamiento del Mistral Small Instruct 2409 original, incluyendo su soporte multilingue para diez idiomas (ingles, frances, aleman, espanol, italiano, portugues, chino, japones, ruso y coreano) y su capacidad de function calling. La modificacion "heretic" se centra exclusivamente en el comportamiento de alineacion, no en la arquitectura ni en la tokenizacion, por lo que las caracteristicas tecnicas del modelo base se conservan intactas.

Su relevancia actual radica en el interes de la comunidad investigadora y de desarrolladores por modelos sin las capas de rechazo del alineamiento original, utiles para estudiar sesgos, realizar evaluaciones de seguridad, generar contenido creativo sin restricciones excesivas o investigar el comportamiento de modelos desalineados. No obstante, su licencia (Mistral AI Research License) restringe el uso a fines de investigacion, lo que limita seriamente su aplicacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Mistral-Small-Instruct-2409 |
| Parametros totales | 22.247.282.688 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-Small-Instruct-2409 declara 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato de pesos safetensors en bf16/fp16) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | Mistral AI Research License (MRL-0.1), uso limitado a investigacion |
| Formato de pesos | safetensors |
| Libreria declarada | vllm |
| Tamano del repositorio | 44,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 22.200 millones de parametros, heredado directamente de Mistral-Small-Instruct-2409. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas en el modelo base. La modificacion realizada por richardyoung consiste en una ablacion de direcciones de rechazo ("heretic" / "abliterated"), una tecnica que identifica en el espacio de activaciones las direcciones asociadas a la negativa a responder y las elimina o atenua mediante edicion de pesos, sin reentrenamiento completo. Esta intervencion preserva la arquitectura, la tokenizacion y la mayor parte de las capacidades del modelo original, pero altera su comportamiento de alineacion.

No se dispone de informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, attention linear, etc.) especificas de este finetune. El modelo base Mistral-Small-Instruct-2409 emplea atencion estandar con soporte de contexto largo y function calling nativo, pero los detalles exactos de su arquitectura interna no se recogen en la informacion proporcionada.

## Capacidades

- Generacion de texto en diez idiomas (ingles, frances, aleman, espanol, italiano, portugues, chino, japones, ruso y coreano).
- Razonamiento y respuesta a instrucciones, heredados del modelo base Instruct.
- Soporte de function calling / tool calling, segun las capacidades del modelo base Mistral-Small-Instruct-2409.
- Capacidad de conversacion multi-turno con contexto largo (segun el modelo base).
- Comportamiento de rechazo reducido o eliminado: el modelo tiende a responder a solicitudes que el modelo original rechazaria.
- Generacion de codigo y matematicas (capacidades heredadas del modelo base, no verificadas en esta ficha).
- No se dispone de informacion sobre modo "thinking", vision o audio en este finetune.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo, comparandolo con el Mistral-Small-Instruct-2409 original en tareas de evaluacion de sesgos y robustez.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera explorar temas sensibles sin las negativas del modelo alineado, en un entorno de investigacion.
- Analisis de contenido y red teaming: uso del modelo para generar respuestas que permitan identificar fallos de seguridad en sistemas de moderacion o clasificadores de contenido.
- Evaluacion comparativa de modelos "abliterated": banco de pruebas para medir la degradacion de capacidades (razonamiento, codigo, multilingual) tras la ablacion frente al modelo base.
- Desarrollo de asistentes conversacionales multilingues en entornos de investigacion, aprovechando el soporte de diez idiomas y el contexto largo del modelo base.
- Experimentacion con function calling en pipelines de agentes, siempre que el uso se limite a fines de investigacion conforme a la licencia MRL.
- Estudio de sesgos y comportamiento en idiomas de bajos recursos dentro del conjunto soportado (coreano, japones, ruso), comparando respuestas con y sin ablacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 44-45 GB solo para los pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 48-80 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x RTX 4090 24 GB con tensor parallelism) para inferencia en precision completa.
- En GPU de consumo: no cabe en una unica RTX 4090 (24 GB) en bf16; requeriria cuantizacion (no se proporcionan pesos GGUF en el repositorio) o sharding multi-GPU.
- Opciones de despliegue: vLLM es la libreria declarada por el autor; tambien seria posible servir con TGI si se convierte el formato, o con llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral-Small-Instruct-2409-SOM-heretic | 22,2 B | no disponible (base: 128k) | MRL (solo investigacion) | Hugging Face, safetensors |
| mistralai/Mistral-Small-Instruct-2409 (base) | 22,2 B | 128k (segun Mistral AI) | MRL | Hugging Face, safetensors |
| Otras variantes "abliterated" de Mistral Small | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazo puede degradar capacidades de razonamiento, coherencia o seguridad del modelo; no se han publicado evaluaciones que cuantifiquen esta degradacion.
- Riesgo elevado de generar contenido danino, ofensivo o inexacto al haberse reducido los mecanismos de rechazo; no apto para produccion sin moderacion adicional.
- Riesgo de alucinacion inherente al modelo base, no mitigado por este finetune.
- Licencia MRL-0.1: uso limitado exclusivamente a fines de investigacion; el uso comercial requiere licencia expresa de Mistral AI.
- El modelo no debe presentarse como producto oficial de Mistral AI (restriccion de la seccion 3.1 de la licencia).
- No se incluyen cuantizaciones GGUF ni pesos optimizados para hardware de consumo en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se dispone de informacion sobre sesgos especificos introducidos o amplificados por la ablacion.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-SOM-heretic
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
- Contacto de licencias Mistral AI: https://mistral.ai/contact/
