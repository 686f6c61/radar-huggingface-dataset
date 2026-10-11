# payam1394/oioxo-coder-35b-a3b-16gb

## Resumen

OIOXO Coder 35B (edicion 16 GB) es una cuantizacion GGUF del modelo Qwen3.6-35B-A3B, publicada por el usuario payam1394. No es un modelo entrenado desde cero: se trata de un reempaquetado de pesos que combina dos fuentes ya existentes, los pesos de 2 bits de EschaLabs (Escha-W2) para los expertos enrutados y las capas densas en Q4_K/Q6_K procedentes del mismo repositorio. El objetivo declarado es comprimir un modelo MoE de 35,5 mil millones de parametros en un fichero de 10,9 GB que quepa en un PC de 16 GB y funcione exclusivamente sobre CPU.

El modelo base, Qwen3.6-35B-A3B, es un transformer de tipo mixture of experts con 40 capas (0-39) que incorpora capas Gated DeltaNet, expertos compartidos y una capa MTP (multi-token prediction). El autor no detalla la composicion del dataset ni el proceso de entrenamiento, solo indica que los tensores se reempaquetan sin reentrenamiento alguno.

Su relevancia practica reside en la relacion entre tamano y calidad: segun las mediciones del propio autor, esta edicion ocupa aproximadamente la mitad que la cuantizacion de referencia Qwen3.6-35B-A3B UD-Q4_K_M (21 GB) y obtiene 8/10 frente a 9/10 en una prueba interna de codigo, con una velocidad de decodificacion de unos 24 tok/s en CPU, el doble que la referencia. Es, por tanto, una propuesta orientada a entornos con poca memoria que necesitan ejecutar un MoE grande sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) con capas Gated DeltaNet y capa MTP; 40 capas (0-39) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3 B aproximados, segun la nomenclatura A3B del modelo base; no confirmado en la informacion proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; IQ2_XXS en expertos enrutados, Q4_K/Q6_K en el resto de tensores (referencia UD-Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 10,9 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B; EschaLabs/Qwen3.6-35B-A3B-Escha-W2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de tipo mixture of experts (MoE) con 40 capas y una capa adicional de prediccion multi-token (MTP). La model card menciona explicitamente tensores de atencion, expertos compartidos, Gated DeltaNet, normalizaciones, embeddings, cabeza de salida y capa MTP, lo que apunta a un diseno hibrido que combina atencion estandar con capas Gated DeltaNet. No se especifica el numero de expertos por capa, la frecuencia de enrutamiento ni la dimension oculta.

En cuanto al entrenamiento, esta publicacion no aporta informacion sobre el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. El autor indica expresamente que no hay reentrenamiento: los tensores se reempaquetan, no se vuelven a entrenar. El trabajo de cuantizacion se apoya en dos decisiones tecnicas: aplicar 2 bits (IQ2_XXS) solo a los expertos enrutados, que son la mayor parte del peso, y mantener el resto de tensores en Q4_K/Q6_K. El autor sostiene que un fichero comunitario de 9 GB que cuantiza tambien las capas densas a 2 bits producia bucles y respuestas incompletas, y que preservar esas capas en 4-6 bits corrige el problema.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat y soporte de modo de razonamiento (thinking) mediante `enable_thinking`.
- Generacion de codigo, evaluada por el autor con una prueba de 10 tareas de dificultad alta cuyo resultado se valida ejecutando el codigo.
- Razonamiento con presupuesto de tokens controlable mediante `thinking_budget_tokens` (el autor recomienda limitarlo a 2048).
- Prediccion multi-token (capa MTP incluida en los pesos).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de vision o audio: no disponible.

## Casos de uso

- Generacion de codigo en equipos sin GPU: el modelo se ejecuta integramente en CPU sobre 10,9 GB, de modo que un portatil o un mini-PC de 16 GB puede usarse como entorno de asistencia a la programacion sin depender de un servicio externo.
- Asistente de programacion local con presupuesto de razonamiento acotado: configurando `thinking_budget_tokens: 2048` se evita que el modo thinking consuma el contexto completo y se mantiene un flujo de respuesta predecible.
- Prototipado de agentes de codigo con contexto largo: al ser un modelo MoE de 35,5 B con componentes de atencion y Gated DeltaNet, es adecuado para tareas de edicion de repositorios donde el prompt acumula muchos fragmentos de codigo.
- Evaluacion de cuantizaciones en investigacion: sirve como objeto de estudio para medir como afecta pasar los expertos a 2 bits manteniendo las capas densas en 4-6 bits, comparando contra el fichero UD-Q4_K_M de 21 GB.
- Despliegue en estaciones de trabajo con CPU de gama media: el autor reporta unos 24 tok/s con `ik_llama.cpp` sobre un Ryzen 5 8500G de 6 nucleos con opcion `-rtr`, un rendimiento suficiente para generacion interactiva.
- Sustitucion de un modelo denso de menor tamano en tareas de codigo: con 35,5 B de parametros totales y 3 B activos por token, ofrece mas capacidad de conocimiento que un modelo denso que quepa en el mismo presupuesto de memoria.
- Entornos aislados o con requisitos de privacidad: al ejecutarse localmente y con licencia Apache-2.0, permite procesar codigo propietario sin enviarlo a terceros.

## Benchmarks y rendimiento

Los unicos datos disponibles son los que publica el autor en la model card. No se trata de benchmarks estandar (MMLU, HumanEval, GSM8K), sino de una prueba interna de 10 tareas de codigo de dificultad alta, evaluada ejecutando el codigo resultante y con el razonamiento limitado a 2048 tokens por peticion. El entorno de medida es un Ryzen 5 8500G de 6 nucleos, solo CPU, el 10 y 11 de octubre de 2026.

| Modelo | Tamano | Puntuacion | Velocidad de decodificacion |
|---|---|---|---|
| Qwen3.6-35B-A3B UD-Q4_K_M (referencia) | 21 GB | 9/10 | ~12 tok/s |
| OIOXO Coder 35B, ik_llama.cpp `-rtr` | 10,9 GB | 8/10 | ~24 tok/s |
| OIOXO Coder 35B, llama.cpp upstream | 10,9 GB | 9/10 y 6/8 (dos ejecuciones) | ~15 tok/s |

El autor senala dos observaciones relevantes: la referencia de 4 bits resolvio la tarea mas dificil (un parser de expresiones) y todas las ejecuciones con expertos a 2 bits fallaron esa tarea; ademas, la variabilidad entre las dos ejecuciones con llama.cpp upstream (9/10 y 6/8) sugiere sensibilidad a la configuracion o al muestreo. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos: 10,9 GB, por lo que la inferencia requiere al menos ese espacio mas el cache KV y el overhead del runtime.
- Memoria recomendada: unos 16 GB de RAM o VRAM para operar con holgura, tal como indica el autor ("cabe en un PC de 16 GB").
- CPU: el autor ha medido sobre un Ryzen 5 8500G de 6 nucleos con resultados de unos 24 tok/s con `ik_llama.cpp` y unos 15 tok/s con llama.cpp upstream.
- GPU de consumo: cabe en tarjetas con 16 GB o mas de VRAM (RTX 4090, RTX 4080, RTX 4060 Ti de 16 GB); no confirmado por el autor, que solo reporta mediciones en CPU.
- GPU de datacenter: tecnicamente compatible con A100 y H100, aunque su proposito declarado es el despliegue en CPU.
- Despliegue: `ik_llama.cpp` (`llama-server` con `-rtr --jinja` y `--reasoning-budget-message`) es la opcion mas rapida segun el autor; llama.cpp estandar carga el modelo porque todos los tipos de tensor son estandar. Soporte de Ollama, vLLM o TGI: no confirmado.
- Arranque del modo thinking: enviar `chat_template_kwargs: {enable_thinking: true}` y `thinking_budget_tokens: 2048`; sin el mensaje de presupuesto, el modelo puede seguir razonando dentro de la respuesta final tras alcanzar el limite.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables independientes en la informacion proporcionada. La comparacion disponible es entre distintas cuantizaciones del mismo modelo base.

| Version | Tamano | Puntuacion (prueba interna del autor) | Velocidad | Notas |
|---|---|---|---|---|
| Qwen3.6-35B-A3B UD-Q4_K_M | 21 GB | 9/10 | ~12 tok/s | Referencia de mayor calidad, resuelve la tarea mas dificil |
| OIOXO Coder 35B (esta edicion) | 10,9 GB | 8/10 con ik_llama.cpp; 9/10 y 6/8 con llama.cpp | ~24 tok/s (ik_llama.cpp), ~15 tok/s (llama.cpp) | Expertos a 2 bits, capas densas a 4-6 bits |
| Fichero comunitario todo a 2 bits | 9 GB | no disponible | no disponible | El autor indica que entraba en bucles y no terminaba las respuestas |

## Limitaciones y advertencias

- Perdida de calidad respecto a la referencia de 4 bits: 8/10 frente a 9/10 en la prueba del autor, con fallo sistematico en la tarea mas dificil (parser de expresiones) en todas las ejecuciones con expertos a 2 bits.
- Tendencia a extender el razonamiento: sin limite explicito, el modelo puede seguir pensando hasta agotar el presupuesto de tokens, y sin el mensaje de presupuesto puede continuar razonando dentro de la respuesta. El autor recomienda fijar `thinking_budget_tokens: 2048`.
- Variabilidad de resultados: las dos ejecuciones con llama.cpp upstream dieron puntuaciones distintas (9/10 y 6/8), lo que indica sensibilidad a la configuracion del runtime o al muestreo.
- Procedencia y verificacion: el repositorio tiene 0 descargas y 0 likes, y no se acompana de paper ni de resultados de benchmarks estandar. Las unicas mediciones son las del autor.
- Idiomas, contexto maximo, sesgos conocidos y riesgo de alucinacion: no disponibles en la informacion proporcionada.
- Licencia: Apache-2.0, la misma que las fuentes, por lo que el uso comercial esta permitido; conviene verificar igualmente las condiciones del modelo base Qwen3.6-35B-A3B y del repositorio de cuantizacion Escha-W2.
- Produccion: al ser una cuantizacion de 2 bits en los expertos, conviene validar el comportamiento en el dominio concreto de uso antes de desplegarla en un pipeline critico.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/payam1394/oioxo-coder-35b-a3b-16gb
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizacion Escha-W2: https://huggingface.co/EschaLabs/Qwen3.6-35B-A3B-Escha-W2
- GGUF de origen (peasantsmith): https://huggingface.co/peasantsmith/Qwen3.6-35B-A3B-Escha-W2-GGUF-MTP
- `ik_llama.cpp`: https://github.com/ikawrakow/ik_llama.cpp
