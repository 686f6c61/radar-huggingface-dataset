# ddalcu/Inkling-2-Mini-MLX-Serve-iQ-MLX-3.7bpw

## Resumen

Inkling-2-Mini-MLX-Serve-iQ-MLX-3.7bpw es una cuantizacion de pesos del modelo multimodal Inkling-2-Mini de Thinking Machines, publicada por el usuario ddalcu y empaquetada especificamente para el runtime mlx-serve sobre Apple Silicon. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 26.388.641.280 parametros totales y aproximadamente 3.400 millones de parametros activos por token, capaz de procesar texto e imagenes (pipeline image-text-to-text). Esta version reduce el peso en disco a 12,66 GB (unos 12 GB residentes), lo que la hace viable en Macs con 16-24 GB de memoria unificada.

La relevancia de este paquete es practica: el modelo original no cabe en equipos de consumo, y esta re-cuantizacion aplica una asignacion no uniforme de bits por capa basada en un escaneo de sensibilidad (cada capa evaluada de forma aislada a 2 bits y puntuada por divergencia KL), resolviendo un presupuesto de 10,7 GB para los expertos. El resultado mantiene una perplexity de 6,272 frente a 6,147 del release original, con un KLD medio de 0,0324 y un 92,0% de acuerdo top-1 en 7.318 posiciones de 8 ficheros reservados.

El modelo usa un esquema de nucleo con bucles (tag inkling2_loop), lo que sugiere reutilizacion de capas en el core del transformer, y conserva la torre de vision en bf16 (0,64 GB) para mantener la calidad multimodal. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con nucleo en bucle (inkling2_loop), multimodal texto+imagen |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | ~3.400 millones (3,4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | iQ-MLX 3,7 bpw: expertos 4-bit affine grupo 128 (capas 8-11, 16, 17) y 3-bit affine grupo 128 (resto); atencion 8-bit affine grupo 64; embedding y head 4-bit affine grupo 64; torre de vision bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture-of-Experts con un nucleo de capas en bucle: un subconjunto de capas se reutiliza varias veces, lo que reduce el coste parametrico manteniendo profundidad efectiva. De los 26,4B parametros totales, solo unos 3,4B se activan por token, lo que permite un throughput alto en inferencia. El modelo es multimodal: incorpora una torre de vision que procesa imagenes junto con el texto en el mismo pipeline image-text-to-text.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO en el modelo base. La model card de esta cuantizacion no documenta esos detalles y la informacion proporcionada no los incluye. La innovacion tecnica destacable de este paquete concreto es la asignacion de bits por capa: los expertos de las capas mas sensibles (8-11, 16 y 17) se mantienen a 4 bits con grupo 128, mientras que el resto baja a 3 bits, decision derivada de un escaneo de sensibilidad por capa puntuado con divergencia KL. Ademas, el paquete omite la cabeza draft (draft head), por lo que no incluye decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes combinada con texto (image-text-to-text): descripcion, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento y generacion de codigo, al ser un modelo de proposito general de la familia Inkling.
- Capacidad MoE con 3,4B parametros activos, que favorece la latencia en decodificacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Sin cabeza draft: no se puede usar decodificacion especulativa con este paquete.

## Casos de uso

- Asistente local en Mac: el paquete esta disenado para ejecutarse con mlx-serve en equipos Apple Silicon de 16-24 GB; un desarrollador puede levantar un servidor local con `mlx-serve --model ddalcu/Inkling-2-Mini-MLX-Serve-iQ-MLX-3.7bpw --serve` y consumirlo via API sin depender de la nube.
- Analisis de capturas y documentos escaneados: la torre de vision en bf16 permite enviar imagenes junto con preguntas de texto para extraer informacion, resumir pantallas o interpretar diagramas en un flujo conversacional.
- Prototipado de aplicaciones multimodales en portatiles: con 12 GB residentes y 27,4 tok/s de decodificacion en un M1 Pro de 32 GB, es adecuado para iterar sobre prompts y evaluar respuestas sin coste de GPU.
- Generacion de codigo asistida en el editor: los 3,4B parametros activos mantienen una latencia de decodificacion razonable (unos 124 tok/s en M5 Ultra) para autocompletado y explicacion de fragmentos en un IDE local.
- Servicio de inferencia de bajo coste en hardware Apple: el procesamiento de prompt de 5.070 tok/s en M5 Ultra permite manejar peticiones con contexto de entrada largo en un servidor Mac mini o Mac Studio.
- Evaluacion comparativa de cuantizaciones: investigadores que necesiten medir el impacto de la cuantizacion pueden usar este paquete como referencia, ya que la model card publica KLD, acuerdo top-1 y perplexity frente al release original y frente a una cuantizacion uniforme de 3 bits con los mismos bytes.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin obligaciones de atribucion mas alla de las de dicha licencia.

## Benchmarks y rendimiento

Metricas de calidad publicadas en la model card (teacher-forced top-20, 8 ficheros reservados, 7.318 posiciones):

| Paquete | KLD medio | Acuerdo top-1 | Perplexity |
|---|---|---|---|
| Release original | – | – | 6,147 |
| Este paquete (12,0 GB trunk) | 0,0324 | 92,0% | 6,272 |
| Expertos uniformes 3-bit g64, mismos bytes | 0,0375 | no disponible | no disponible |
| Atencion, embedding y head 4-bit sobre expertos del release (17,3 GB) | 0,0223 | 92,9% | 6,261 |

Consistencia entre runtimes: sobre 3.995 posiciones, mlx-serve y mlx-lm (PR #2086) coinciden con KLD 0,0033 y acuerdo top-1 del 97,9%.

Rendimiento de inferencia (mlx-serve):

| Hardware | Decodificacion | Procesamiento de prompt |
|---|---|---|
| M5 Ultra | ~124 tok/s | 5.070 tok/s |
| M1 Pro 32 GB | 27,4 tok/s | ~200 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: 12,66 GB en disco y unos 12 GB residentes; recomendable un Mac con 16 GB o mas de memoria unificada.
- En Macs de 16 GB es necesario anadir `--no-vision` para descargar la torre de vision y ajustar el uso de memoria.
- Hardware validado en la model card: M5 Ultra (124 tok/s de decodificacion) y M1 Pro de 32 GB (27,4 tok/s).
- No esta pensado para GPU NVIDIA: el formato es MLX y la libreria es mlx, no GGUF ni safetensors genericos para vLLM o TGI.
- Opciones de despliegue: mlx-serve (runtime principal) y mlx-lm con el PR #2086; no se documentan otros runtimes.
- Latencia estimada: en M1 Pro 32 GB, el procesamiento de prompt de ~200 tok/s implica unos 5 segundos por cada 1.000 tokens de entrada; en M5 Ultra, unos 0,2 segundos por cada 1.000 tokens.
- No incluye cabeza draft, por lo que no hay aceleracion por decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este paquete (Inkling-2-Mini iQ-MLX 3,7 bpw) | 26,4B | ~3,4B | no disponible | Apache 2.0 | safetensors MLX | Hugging Face, 0 descargas |
| Inkling-2-Mini (release original) | 26,4B | ~3,4B | no disponible | Apache 2.0 | safetensors | Hugging Face (thinkingmachines) |
| Cuantizacion uniforme 3-bit g64 (mismos bytes) | 26,4B | ~3,4B | no disponible | Apache 2.0 | MLX | referenciada en la model card, sin repositorio indicado |
| Paquete 4-bit atencion/embedding/head (17,3 GB) | 26,4B | ~3,4B | no disponible | Apache 2.0 | MLX | referenciado en la model card, sin repositorio indicado |

La comparativa con modelos de otras familias (por ejemplo, alternativas MoE multimodales de tamano similar) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad medible: perplexity 6,272 frente a 6,147 del release y acuerdo top-1 del 92,0%, con un 8% de posiciones donde la prediccion top-1 difiere.
- El paquete omite la cabeza draft, de modo que no se puede usar decodificacion especulativa; el rendimiento en decodificacion dependera solo del modelo principal.
- En Macs de 16 GB hay que desactivar la vision; sin la torre de vision el modelo pierde toda capacidad multimodal.
- No se documentan sesgos conocidos, riesgo de alucinacion especifico ni limitaciones de idioma en la informacion disponible; al ser un modelo de proposito general, cabe esperar alucinaciones en tareas factuales, pero no hay datos publicados que lo cuantifiquen.
- La longitud de contexto no esta disponible, lo que impide planificar cargas con ventanas largas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (21 de noviembre de 2026): no hay evidencia de uso en produccion ni validacion por terceros.
- Depende de un PR concreto de mlx-lm (#2086) para cargarse fuera de mlx-serve; cambios en ese PR pueden romper la compatibilidad.
- La licencia Apache 2.0 del paquete es permisiva, pero conviene verificar que el modelo base mantiene la misma licencia y que no haya terminos adicionales del autor original.
- El rendimiento medido corresponde a hardware Apple Silicon; no hay datos de latencia en otras plataformas.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/ddalcu/Inkling-2-Mini-MLX-Serve-iQ-MLX-3.7bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de mlx-lm con el layout: https://github.com/ml-explore/mlx-lm/pull/2086
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
