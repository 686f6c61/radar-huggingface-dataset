# CrabMeatPot/Huihui-Qwen3.5-4B-abliterated-4bit-mlx

## Resumen

Huihui-Qwen3.5-4B-abliterated-4bit-mlx es una cuantizacion en 4 bits para MLX del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, que a su vez deriva de Qwen/Qwen3.5-4B. El autor de esta version, CrabMeatPot, la publica con el objetivo declarado de servir como motor de traduccion local en su aplicacion «譯讀» (Yidu), de modo que el caso de uso previsto es la inferencia en dispositivos Apple Silicon, no el despliegue en servidor.

El modelo conserva la arquitectura y el entrenamiento del Qwen3.5-4B original, pero incorpora la modificacion «abliterated» de huihui-ai, que elimina el mecanismo de rechazo de peticiones (refusals) mediante una intervencion sobre las direcciones de activacion. El resultado es un modelo de 4.205.751.296 parametros (4,2 mil millones) que responde practicamente a cualquier instruccion sin filtrado interno, lo que traslada al usuario toda la responsabilidad sobre el contenido generado.

La relevancia de esta ficha es doble: por un lado, documenta una cuantizacion MLX de 4 bits con grupo de 64 que reduce el repositorio a 2,4 GB, lo que permite ejecutar un modelo de 4B en portatiles Apple con memoria unificada modesta; por otro, advierte de que se trata de un modelo sin censura, con licencia Apache-2.0 pero sin garantias de seguridad, y sin datos publicados de benchmarks ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), cuantizado para MLX |
| Parametros totales | 4.205.751.296 (4,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX); el modelo base admite otras cuantizaciones no documentadas aqui |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.5-4B: un transformer decoder-only denso de 4,2 mil millones de parametros. Esta version concreta no reentrena ni modifica los pesos mas alla de la cuantizacion: se genera con `mlx_lm.convert --hf-path huihui-ai/Huihui-Qwen3.5-4B-abliterated -q --q-bits 4 --q-group-size 64` usando mlx-lm 0.32.2, sobre el commit `5581467dfd52bf338c782006a6cdce05c42594be` del modelo base. Solo incluye el modelo de lenguaje; el codificador visual del modelo original se ha eliminado, por lo que es una variante estrictamente de texto.

El modelo base de huihui-ai aplica la tecnica de «abliteration», que identifica y neutraliza las direcciones de activacion asociadas al rechazo de peticiones, de forma que el modelo deja de negarse a responder. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el Qwen3.5-4B original, ya que la model card de esta cuantizacion no los detalla.

## Capacidades

- Generacion de texto y conversacion multi-turno en el formato de chat de Qwen3.5.
- Respuesta sin rechazos: el proceso de abliteration elimina las negativas del modelo a peticiones que el original filtraria.
- Traduccion automatica local, que es el uso declarado por el autor para su aplicacion.
- Razonamiento y conocimiento general heredados del Qwen3.5-4B original (sin benchmarks publicados en esta ficha).
- Capacidades multilingues: no documentadas en la informacion disponible; el modelo base Qwen3.5 es multilingue, pero no se especifican idiomas concretos.
- Sin soporte de vision: el codificador visual se ha eliminado en esta conversion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado para esta variante.

## Casos de uso

- Traduccion local en macOS: el modelo esta pensado para ejecutarse con MLX en equipos Apple Silicon y traducir texto sin enviar datos a la nube, gracias a los 2,4 GB del repositorio en 4 bits.
- Asistente de escritorio sin conexion: al caber en memoria unificada de 8 GB o mas, permite un chatbot privado que no depende de APIs externas.
- Procesamiento de documentos sensibles: traduccion o reescritura de textos confidenciales en local, sin filtrado del proveedor y sin salida de datos del dispositivo.
- Generacion creativa sin restricciones: escritura de ficcion o contenido que los modelos alineados rechazarian, con la advertencia de que el usuario asume la responsabilidad legal y etica.
- Prototipado rapido de aplicaciones de chat: integracion con mlx-lm para probar flujos conversacionales en un portatil antes de escalar a un modelo mayor.
- Investigacion sobre alineacion y seguridad: comparar el comportamiento del modelo abliterated frente al Qwen3.5-4B original para estudiar el efecto de la eliminacion de rechazos.
- Filtrado y clasificacion de texto: tareas de etiquetado o resumen en local donde el contexto no requiera ventanas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 2,4 GB para los pesos en 4 bits, mas overhead de KV cache y runtime; en la practica, entre 3 y 4 GB.
- Plataforma: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores) mediante MLX; no es compatible con CUDA.
- Cabe en cualquier Mac con 8 GB de memoria unificada o mas; con 8 GB conviene limitar la longitud de contexto.
- GPU recomendadas: no aplica; no se puede ejecutar en A100, H100 ni RTX 4090 sin reconvertir el modelo a otro formato.
- Opciones de despliegue: mlx-lm (libreria nativa del modelo); para otros entornos habria que usar el modelo base en safetensors o GGUF, no esta cuantizacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CrabMeatPot/Huihui-Qwen3.5-4B-abliterated-4bit-mlx | 4,2 B | no disponible | MLX safetensors 4 bits | Apache-2.0 | Solo Apple Silicon, sin vision, sin rechazos |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | 4,2 B | no disponible | safetensors | Apache-2.0 | Modelo base sin cuantizar, sin rechazos |
| Qwen/Qwen3.5-4B | 4,2 B | no disponible | safetensors | Apache-2.0 | Modelo original alineado, con rechazos |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: no rechaza peticiones daninas o sensibles; el autor declara explicitamente que el usuario es responsable del contenido generado.
- Riesgo de alucinacion: como cualquier modelo de 4B, puede inventar hechos, citas o traducciones incorrectas; no se han publicado evaluaciones de fidelidad.
- Idiomas no documentados: no hay lista oficial de idiomas soportados en esta ficha, aunque el modelo base Qwen3.5 es multilingue.
- Longitud de contexto no especificada: no se puede garantizar el manejo de documentos largos sin consultar la model card del modelo base.
- Solo texto: el codificador visual se ha eliminado, por lo que no procesa imagenes.
- Dependencia de MLX: no se puede desplegar en servidores con GPU NVIDIA sin reconvertir el modelo.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de alineacion puede incumplir politicas de plataformas o normativas sectoriales; conviene revisar el uso en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrabMeatPot/Huihui-Qwen3.5-4B-abliterated-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
