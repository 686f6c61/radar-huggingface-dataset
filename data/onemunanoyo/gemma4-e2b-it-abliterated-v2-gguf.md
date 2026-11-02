# onemunanoyo/gemma4-E2B-it-Abliterated-V2-GGUF

## Resumen

gemma4-E2B-it-Abliterated-V2-GGUF es una version modificada del modelo google/gemma-4-E2B-it, publicada por el usuario onemunanoyo en HuggingFace. Se trata de un modelo "abliterated", es decir, una variante en la que se ha suprimido el comportamiento de rechazo (refusal) del modelo original mediante tecnicas de edicion de pesos, con el objetivo de que responda a practicamente cualquier prompt sin negarse. Esta V2 mejora a la version anterior del mismo autor reduciendo significativamente los rechazos cuando el modo de razonamiento (thinking) esta activado.

El modelo se distribuye exclusivamente en formato GGUF, pensado para inferencia con llama.cpp y ecosistemas compatibles, y cuenta con 4.628.569.635 parametros totales segun los datos de safetensors del modelo base. Los idiomas declarados son ingles y japones, y la licencia es Apache 2.0, heredada del modelo base de Google.

Es relevante para desarrolladores e investigadores interesados en estudiar el comportamiento de rechazo en modelos alineados, en evaluar tecnicas de abliteration y en desplegar modelos conversacionales ligeros en hardware de consumo mediante cuantizacion. No obstante, la eliminacion de los mecanismos de seguridad del modelo original tiene implicaciones eticas y de uso que deben considerarse con atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E2B-it) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base google/gemma-4-E2B-it en la informacion proporcionada; la model card del autor no describe la arquitectura, el numero de tokens de entrenamiento ni la composicion del dataset. El modelo base pertenece a la familia Gemma 4 de Google y, por la nomenclatura "E2B", se infiere que es una variante de aproximadamente 2B de parametros efectivos, aunque los parametros totales reportados en safetensors son 4.628.569.635, lo que sugiere una posible arquitectura con parametros compartidos o un recuento que incluye componentes adicionales; este extremo no esta confirmado en la informacion disponible.

La innovacion principal de esta variante es el proceso de abliteration aplicado sobre el modelo instruct original, que elimina o atenua la direccion de activacion asociada al comportamiento de rechazo. Segun el autor, la V2 se diferencia de la version anterior en que reduce drasticamente los rechazos cuando el modo thinking esta activado: en el benchmark del autor, la version anterior pasaba de 55 rechazos con thinking activado a 2 con thinking desactivado, mientras que esta V2 logra 3 rechazos con thinking activado y 0 con thinking desactivado. No se detalla la metodologia exacta de abliteration empleada ni si hubo entrenamiento adicional tras la edicion de pesos.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat y modo de razonamiento (thinking) activable o desactivable.
- Modo thinking: permite activar razonamiento extendido antes de responder, configurable mediante `-rea on/off` en llama.cpp o `chat_template_kwargs.enable_thinking` en la API compatible con OpenAI.
- Capacidades multilingues limitadas a ingles y japones segun los metadatos del modelo.
- Comportamiento de rechazo practicamente eliminado: en el benchmark del autor con 84 prompts adversariales en japones, el modelo responde en 79-81 casos de 84 segun formato y configuracion.
- Compatibilidad con endpoints compatibles (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para analizar como la abliteration altera la distribucion de respuestas y los mecanismos de rechazo, comparando con el modelo base en conjuntos de prompts controlados.
- Evaluacion de tecnicas de edicion de pesos: permite reproducir y contrastar resultados de abliteration entre versiones (V1 frente a V2) y entre modos de razonamiento, usando el benchmark de rechazo del autor como referencia metodologica.
- Despliegue local en hardware de consumo: con cuantizacion Q4_K_M cabe en GPU de 4 GB de VRAM, lo que permite ejecutar un modelo conversacional en equipos modestos mediante llama.cpp u Ollama.
- Generacion de texto creativo sin restricciones: para aplicaciones de ficcion, guiones o narrativa donde el autor necesita un modelo que no decline temas sensibles dentro de un contexto controlado y con supervision humana.
- Asistencia conversacional en japones: el modelo declara soporte de japones y puede emplearse en prototipos de chat en ese idioma, con la advertencia de que la calidad no esta validada fuera del benchmark del autor.
- Pruebas de robustez y red teaming: util para equipos de seguridad que quieran evaluar la eficacia de filtros externos y capas de moderacion cuando el modelo subyacente no incorpora rechazos propios.
- Experimentacion con modos de razonamiento: permite comparar latencia y calidad de respuestas con thinking activado y desactivado en el mismo modelo, util para estudiar el coste computacional del razonamiento extendido.

## Benchmarks y rendimiento

El unico benchmark publicado por el autor es una evaluacion de comportamiento de rechazo sobre 84 prompts adversariales privados en japones, juzgados por LiquidAI/d1-3B con tres clases (Answer, Deflect, Refusal). Generacion con llama.cpp build 11560, greedy (temperatura 0), semilla fija, maximo 4096 tokens.

| Modelo | Formato | Razonamiento | Refusal | Deflect | Answer |
|---|---|---|---|---|---|
| base (google/gemma-4-E2B-it) | BF16 | on | 68 | 0 | 16 |
| base (google/gemma-4-E2B-it) | BF16 | off | 73 | 0 | 11 |
| former model (V1) | BF16 | on | 55 | 0 | 29 |
| former model (V1) | BF16 | off | 2 | 1 | 81 |
| this model (V2) | BF16 | on | 3 | 2 | 79 |
| this model (V2) | BF16 | off | 0 | 3 | 81 |
| this model (V2) | Q8_0 | on | 3 | 1 | 80 |
| this model (V2) | Q6_K | on | 1 | 2 | 81 |
| this model (V2) | Q4_K_M | on | 2 | 2 | 80 |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM recomendada por el autor segun cuantizacion:
  - BF16: 12 GB o mas.
  - Q8_0: 8 GB.
  - Q6_K: 6 GB.
  - Q4_K_M: 4 GB.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM usando Q4_K_M (por ejemplo, RTX 3050, RTX 4060, GTX 1660 con suficiente memoria). Para BF16 se recomienda una GPU de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, etc.).
- GPU profesionales: A100, H100 y similares no son necesarias para este tamano, pero pueden emplearse para servir multiples instancias o contextos largos.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), y por extension cualquier runtime compatible con GGUF como Ollama o LM Studio. Requiere una build de llama.cpp con soporte de Gemma 4 (el autor cita build 11560).
- Latencia y throughput: no disponibles en la informacion proporcionada. El uso de modo thinking incrementa el numero de tokens generados y, por tanto, la latencia.
- El consumo real de VRAM depende del tamano de contexto configurado y del numero de capas descargadas a GPU (`-ngl`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| onemunanoyo/gemma4-E2B-it-Abliterated-V2-GGUF | 4.628.569.635 (total) | no disponible | GGUF | apache-2.0 | Abliterated, rechazo casi nulo, en/ja |
| google/gemma-4-E2B-it (base) | 4.628.569.635 (total) | no disponible | safetensors y otras | Gemma (terminos de Google) | Modelo original con alineacion intacta; 68-73 rechazos de 84 en el benchmark del autor |
| onemunanoyo/gemma4-E2B-Abliterated-GGUF (V1) | no disponible | no disponible | GGUF | apache-2.0 | Version anterior; mantiene 55 rechazos con thinking activado |

No se dispone de informacion sobre otros modelos abliterated comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de los mecanismos de rechazo: el modelo responde a practicamente cualquier prompt, incluidos contenidos daninos, ilegales o eticamente problematicos. No debe desplegarse en produccion sin capas externas de moderacion y supervision.
- Riesgo elevado de alucinacion y de respuestas incorrectas presentadas con confianza, especialmente al haberse alterado los pesos sin un reentrenamiento documentado.
- El benchmark de rechazo del autor usa 84 prompts privados en japones no publicados, juzgados por un modelo pequeno (LiquidAI/d1-3B); los resultados no son reproducibles de forma independiente ni comparables con evaluaciones estandar.
- Idiomas limitados a ingles y japones; el rendimiento en castellano no esta validado y previsiblemente sera inferior.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin verificacion empirica.
- La licencia declarada es Apache 2.0, pero el modelo deriva de google/gemma-4-E2B-it, cuyos terminos de uso originales pueden imponer condiciones adicionales; conviene revisar la licencia del modelo base antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa de calidad.
- Requiere una build reciente de llama.cpp con soporte de Gemma 4; runtimes mas antiguos pueden no cargar el modelo correctamente.
- El modo thinking activado genera mas tokens y aumenta la latencia y el coste computacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onemunanoyo/gemma4-E2B-it-Abliterated-V2-GGUF
- Version anterior (V1): https://huggingface.co/onemunanoyo/gemma4-E2B-Abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Juez del benchmark: https://huggingface.co/LiquidAI/d1-3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
