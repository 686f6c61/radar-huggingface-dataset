# goodmai/Qwen3.8-27B-Heretic-PV-MACaQ-3bit-Affine-MLX

## Resumen

Qwen3.8-27B-Heretic-PV-MACaQ-3bit-Affine-MLX es una cuantizacion de 3 bits en formato MLX del modelo 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored, publicada por el usuario goodmai. Se trata de una variante de la familia Qwen3.5 (etiqueta `qwen3_5_text`) que ha sido sometida a un proceso de "abliteracion" o "heretizacion" (eliminacion de rechazos en las respuestas) y posteriormente cuantizada con una tecnica propietaria denominada PV-MACaQ, orientada a preservar la fidelidad de los pesos frente a la cuantizacion de 3 bits convencional.

El modelo es exclusivamente de texto: no incluye torre de vision ni modulos multimodales. Su proposito es ofrecer una version compacta (12,1 GB) del modelo original en BF16 para ejecutarse en Apple Silicon con al menos 24 GB de memoria unificada, empleando la libreria MLX y la herramienta Basalt del propio autor de la cuantizacion. La cuantizacion aplica 3 bits afines con grupo de 64 y bloque Hadamard de 64 a las 496 proyecciones lineales del backbone, manteniendo `embed_tokens` y `lm_head` en 4 bits.

La relevancia de esta ficha radica en que documenta un caso de cuantizacion agresiva (3 bits) sobre un modelo de aproximadamente 20.800 millones de parametros reales, con metricas declaradas de fidelidad (SQNR medio de 15,54 dB, reduccion del 29,6% del MSE frente a RTN ingenuo) y con un enfoque de despliegue muy concreto: inferencia local en macOS sobre hardware Apple. No obstante, la informacion publica es muy limitada: no hay datos de benchmarks, licencia, idiomas ni pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, etiqueta `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 20.811.750.912 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits afines con `group_size=64`, `hadamard_block=64`, `alpha=0.5` en 496 proyecciones lineales; 4 bits afines con `group_size=64` en `embed_tokens` y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors, 3 shards, 12,10 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.5 en su variante de texto (`qwen3_5_text`), un transformer decoder-only. No se dispone de informacion publica sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni sobre el proceso de entrenamiento original del modelo base. El modelo base indicado es 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored, que a su vez deriva de un modelo Qwen3.5 de 27.000 millones de parametros nominales; los pesos reales declarados en safetensors son 20.811.750.912, lo que sugiere que la cifra "27B" del nombre comercial no coincide con el recuento efectivo de parametros.

La innovacion tecnica destacable de esta publicacion es el esquema de cuantizacion PV-MACaQ (3 bits afines con transformada de Hadamard por bloques de 64 y factor `alpha=0.5`), aplicado a las 496 proyecciones lineales del backbone. El autor declara una fidelidad media de SQNR de 15,54 dB frente a los 13,97 dB de una cuantizacion RTN ingenua de 3 bits, lo que equivale a una reduccion del 29,6% en el error cuadratico medio. Las capas de embedding y la cabeza de salida se mantienen en 4 bits para limitar la degradacion en la representacion lexica. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni sobre si se aplico RLHF o DPO en el modelo base o en el proceso de abliteracion.

## Capacidades

- Generacion de texto autoregresiva en el idioma o idiomas que soporte el modelo base (no declarados).
- Razonamiento y conversacion multi-turno, heredados del modelo base Qwen3.5.
- Generacion de codigo y matematicas: capacidad esperable por la familia del modelo base, aunque no verificada con benchmarks en esta publicacion.
- Modo "abliterated"/"heretic": el modelo base ha sido modificado para reducir o eliminar los rechazos ante peticiones que un modelo alineado convencional rechazaria.
- Inferencia especulativa: la model card menciona el flag `--speculative-lookup` en Basalt, lo que indica soporte de decodificacion especulativa en el runtime de despliegue.
- Sin capacidades multimodales: el autor indica explicitamente "text-only, no vision tower".
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.

## Casos de uso

- Inferencia local en Mac con memoria unificada de 24 GB o superior: el modelo ocupa 12,10 GB en formato MLX de 3 bits, por lo que puede cargarse en equipos Apple Silicon de gama alta (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) sin depender de GPU dedicada. Se lanzaria con `basalt serve goodmai/Qwen3.8-27B-Heretic-PV-MACaQ-3bit-Affine-MLX --speculative-lookup`.
- Prototipado de asistentes conversacionales sin censura para investigacion sobre alineacion y seguridad: al ser un modelo abliterated, permite estudiar el comportamiento de modelos sin rechazos en entornos controlados de laboratorio.
- Evaluacion de tecnicas de cuantizacion agresiva: sirve como banco de pruebas para comparar PV-MACaQ 3 bits frente a RTN 3 bits y otras variantes, usando la metrica SQNR y el MSE declarados por el autor.
- Generacion de texto offline en portatiles: al no requerir conexion ni GPU de datacenter, es util para tareas de redaccion, resumen o reescritura en local con privacidad de datos.
- Experimentacion con decodificacion especulativa en MLX: el flag `--speculative-lookup` permite medir ganancias de latencia en hardware Apple frente a decodificacion estandar.
- Desarrollo y pruebas de la herramienta Basalt: el modelo es el artefacto de referencia del autor para validar el runtime, por lo que sirve para integracion continua y pruebas de regresion del servidor.
- Fine-tuning ligero o adaptacion con LoRA sobre MLX: al estar en formato MLX y pesar solo 12,10 GB, es viable ajustar adaptadores en equipos de consumo, aunque la cuantizacion de 3 bits limita la calidad del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica de rendimiento declarada es la fidelidad de cuantizacion:

| Metrica | PV-MACaQ 3-bit | RTN 3-bit ingenuo |
|---|---|---|
| SQNR medio | 15,54 dB | 13,97 dB |
| MSE relativo | -29,6% | referencia |

No se dispone de datos de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 12,10 GB de pesos mas overhead de activaciones y cache KV; el autor recomienda 24 GB o mas de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con memoria unificada de 24 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). No se declara soporte para GPU NVIDIA ni AMD en esta publicacion, ya que el formato es MLX.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta; no se indica compatibilidad con RTX 4090 u otras GPU discretas por el formato MLX.
- Opciones de despliegue: Basalt (`basalt serve ... --speculative-lookup`), que es el runtime indicado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-Heretic-PV-MACaQ-3bit-Affine-MLX | 20.811.750.912 | no disponible | 3 bits MLX (PV-MACaQ) | no disponible | Hugging Face, 0 descargas |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored (modelo base) | no disponible | no disponible | BF16 | no disponible | Hugging Face |
| Otras cuantizaciones MLX de la familia Qwen3.5 | no disponible | no disponible | 4 bits / 8 bits tipicas | depende del autor | Hugging Face |

No se dispone de informacion suficiente para comparar rendimiento, contexto o benchmarks con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion de 3 bits, aunque use PV-MACaQ, implica una perdida de fidelidad respecto al BF16 original; el propio autor cuantifica el SQNR medio en 15,54 dB, lo que puede degradar tareas sensibles a precision como matematicas o codigo.
- El modelo base es "abliterated"/"heretic": se han eliminado o reducido los rechazos, por lo que puede generar contenido inapropiado, ofensivo o inseguro. No es adecuado para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en modelos de esta familia y agravado por la cuantizacion agresiva.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored antes de cualquier despliegue.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue mas alla de lo que herede el modelo base.
- Longitud de contexto no declarada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Formato MLX exclusivo: no es desplegable en vLLM, TGI, llama.cpp ni Ollama sin conversion previa, lo que limita su uso a entornos Apple Silicon.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria ni evidencia de robustez en produccion.
- El nombre comercial "27B" no coincide con los 20.811.750.912 parametros reales declarados en safetensors; conviene usar la cifra efectiva para estimaciones de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-Heretic-PV-MACaQ-3bit-Affine-MLX
- Modelo base: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Repositorio Basalt: https://github.com/goodmai/basalt
