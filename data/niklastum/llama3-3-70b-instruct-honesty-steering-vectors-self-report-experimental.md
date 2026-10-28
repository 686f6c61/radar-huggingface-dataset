# NiklasTUM/llama3.3-70b-instruct-honesty-steering-vectors-self-report-experimental

## Resumen

Este repositorio no contiene un modelo generativo, sino un conjunto de artefactos de *steering* (vectores de direccion y sesgos) calculados sobre **meta-llama/Llama-3.3-70B-Instruct** para modular la honestidad de sus autoinformes (*self-report*) en tiempo de inferencia. Lo publica el usuario NiklasTUM (perfil asociado a la TU München por el prefijo del nombre) y esta pensado como entrada directa para los steerers StTP, StMP y SWFC del mismo autor. El problema que aborda es la intervencion sobre activaciones internas: en lugar de reentrenar el modelo, se proyecta el estado oculto de cada token sobre una direccion aprendida que separa respuestas honestas de deshonestas.

El paquete incluye, para las **80 capas** del transformer (capa 0 = salida del embedding, capas 1-79 = salidas de bloque) y en modo de caracteristica `response_avg`, el vector de pesos de una regresion logistica `[80, 8192]`, el sesgo `[80]` y las distribuciones de activaciones honestas y deshonestas `[80, 45, 8192]` cada una. El ajuste se hizo con solo 45 respuestas honestas frente a 45 deshonestas de un conjunto de contraste denominado `self_report_experimental`, por lo que se trata de material experimental de investigacion, no de un artefacto listo para produccion.

Su relevancia es metodologica: documenta de forma reproducible el punto de operacion recomendado (capa 26, coeficientes 36/4/4) y las formulas para derivar el umbral de *gating* y las proyecciones medias, lo que permite replicar el experimento o transferir la tecnica a otros modelos. El repositorio pesa 0,2 GB y no distribuye pesos de Llama-3.3-70B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefactos de *activation steering* (regresion logistica por capa) sobre un transformer decoder-only: meta-llama/Llama-3.3-70B-Instruct, 80 capas, dimension oculta 8192 |
| Parametros totales | 70 000 millones en el modelo base (no se distribuyen en este repositorio); los artefactos suman 0,2 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en el repositorio; corresponde a la del modelo base Llama-3.3-70B-Instruct (128 000 tokens segun su model card, dato no replicado aqui) |
| Tipos de cuantizacion | No disponible; los tensores se publican en float32 y no se ofrece version cuantizada de los artefactos |
| Idiomas soportados | No disponibles (la model card no declara el idioma del conjunto de contraste `self_report_experimental`) |
| Licencia | MIT para los artefactos; el uso conjunto con el modelo base queda sujeto a la Llama 3.3 Community License |
| Formato de pesos | `.pt` (torch.Tensor plano, cargable con `torch.load(path, map_location="cpu")`) y `.json` para metadatos y etiquetas; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El procedimiento es una regresion logistica independiente por capa. Para cada capa `l` se toman las activaciones ocultas promediadas sobre los tokens de respuesta (*feature mode* `response_avg`) de 45 respuestas honestas y 45 deshonestas del conjunto `self_report_experimental`, y se ajusta un clasificador `sklearn` con regularizacion L2 (`C=1.0`), solver `lbfgs`, `max_iter=1000` y `random_state=42`. El vector de pesos resultante `w[l]` de dimension 8192 se interpreta como la direccion de honestidad sin normalizar; el sesgo `b[l]` define el umbral de decision. La capa 0 corresponde a la salida del embedding y las capas 1-79 a las salidas de cada bloque decodificador.

La innovacion no esta en el entrenamiento sino en la derivacion del punto de operacion. Normalizando `v_hat = w[l] / ||w[l]||`, el umbral de *gating* en modo `bias` es `θ = -b[l] / ||w[l]||`, y las proyecciones de clase se obtienen como media y desviacion tipica de `pos[l] @ v_hat` y `neg[l] @ v_hat`. El steerer StTP desplaza los tokens que caen en el lado deshonesto de `θ` hasta `s = mu_pos + coefficient * std_pos` a lo largo de `v_hat`, dejando intacto el subespacio ortogonal. El barrido de capas del autor fija la capa 26 como punto recomendado, con coeficiente 36 para StTP y 4 para StMP y SWFC. No se documenta en la informacion disponible ningun proceso de RLHF, DPO ni ajuste fino adicional: los artefactos se aplican sobre un modelo ya instruido.

## Capacidades

- Calculo de una direccion de honestidad por capa para las 80 capas de Llama-3.3-70B-Instruct, en espacio de 8192 dimensiones.
- Clasificacion lineal honesto/deshonesto de activaciones promediadas de respuesta, con umbral derivable del sesgo ajustado.
- Intervencion en tiempo de inferencia sobre la proyeccion de activaciones (StTP, StMP, SWFC), sin modificar los pesos del modelo.
- Proporciona distribuciones de referencia de ambas clases (45 muestras por clase y capa) para calcular medias, desviaciones y tamanos de efecto.
- Metadatos de ajuste por capa: hiperparametros, exactitud de entrenamiento por capa y delta de medias (hueco de proyeccion entre clases).
- Etiquetas de categoria de escenario por muestra y clase, utiles para analisis estratificado.
- No incluye *tool calling*, agentes, vision, audio ni modo *thinking*: esas capacidades, si se usan, provienen exclusivamente del modelo base.
- No es un modelo autonomo: no genera texto por si mismo, requiere cargar Llama-3.3-70B-Instruct y aplicar los tensores.

## Casos de uso

- Investigacion en interpretabilidad: cargar `w[l]` y `v_hat` para estudiar como se distribuye la direccion de honestidad a lo largo de las 80 capas y que capas concentran mayor separacion entre clases (`Δμ` del JSON de metadatos).
- Replicacion de experimentos de *activation steering*: el repositorio documenta hiperparametros, semilla y formas tensoriales, lo que permite reproducir el ajuste capa por capa sin ambiguedad.
- Auditoria de autoinformes en modelos desplegados: aplicar el steerer en la capa 26 para forzar que el modelo, cuando se le pregunta por su propio estado o sus acciones, se situe en la region de activacion asociada a respuestas honestas del conjunto de contraste.
- *Red teaming* y evaluacion de robustez: usar las activaciones honestas y deshonestas como referencia para medir si una variante del modelo o un *prompt* concreto cae cerca de una u otra distribucion.
- Base para comparativas entre modelos: el autor publica artefactos equivalentes para otros modelos, lo que permite contrastar si la direccion aprendida es estable entre arquitecturas y escalas.
- Desarrollo de steerers propios: los tensores sirven como entrada directa para implementaciones de StTP/StMP/SWFC y para validar una implementacion nueva contra el punto de operacion publicado (capa 26, coeficientes 36/4/4).
- Docencia y formacion tecnica: ejemplo completo y ligero (0,2 GB) de un *pipeline* de steering sin necesidad de distribuir un modelo de 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta datos de ajuste internos (exactitud de entrenamiento por capa y delta de medias por capa, almacenados en `..._logreg_metadata_response_avg_....json`), sin comparacion contra MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar.

## Requisitos de hardware

- Los artefactos en si ocupan 0,2 GB y se cargan en CPU sin problema (`map_location="cpu"`).
- Para usarlos hay que ejecutar Llama-3.3-70B-Instruct: en bf16/fp16 los pesos rondan los 140 GB, lo que exige 2x H100 80 GB, 2x A100 80 GB o 4x A100 40 GB con paralelismo de tensor.
- En cuantizacion de 8 bits los pesos bajan a unos 70 GB: 1x H100 80 GB o 2x A100 40 GB.
- En 4 bits (GPTQ/AWQ/GGUF Q4) se queda en unos 35-40 GB: 1x A100 80 GB o 2x RTX 3090/4090 de 24 GB. **No cabe en una sola GPU de consumo de 24 GB.**
- El *steering* por capa anade un coste despreciable: una proyeccion de 8192 dimensiones y una operacion de suma por token en la capa 26.
- Opciones de despliegue: los steerers requieren acceso a las activaciones ocultas, por lo que hay que instrumentar el *forward pass* (transformers con *hooks* sobre `model.layers[26]`, o vLLM con un *logits/hidden-states processor* personalizado). llama.cpp y Ollama no exponen intervencion por capa de forma nativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Llama-3.3-70B, `self_report_experimental`, `response_avg`) | Artefactos de steering, 80 capas | 70B (base) | No especificado | MIT (artefactos) | Publico en HF, 0 descargas |
| NiklasTUM/qwen3.6-27b-honesty-steering-vectors-self-report-experimental | Mismos artefactos para otro modelo base | 27B (base) | No disponible | No disponible en la informacion | Publico en HF |
| NiklasTUM/aletheia-tararesearch-sttp | Agregados StTP colapsados a una sola capa | Gemma-3-27b-it, Qwen3.5-27B, Nemotron-120B | No disponible | No disponible en la informacion | Publico en HF |
| meta-llama/Llama-3.3-70B-Instruct sin steering | Modelo generativo completo | 70B | 128 000 tokens | Llama 3.3 Community License | Publico en HF |

La diferencia practica frente al modelo base es que este repositorio permite intervenir la representacion interna en lugar de limitarse a *prompting*; frente a los otros dos repositorios del autor, ofrece resolucion por capa (80 vectores) en vez de un agregado de una sola capa, a costa de un modelo base cuatro veces mayor y mas caro de servir.

## Limitaciones y advertencias

- El ajuste usa solo 90 muestras (45 por clase) de un unico conjunto de contraste; el riesgo de sobreajuste y de baja generalizacion fuera de esos escenarios es alto.
- La nocion de "honestidad" se reduce a autoinforme (*self_report*): no mide veracidad factual ni calibracion. Un modelo puede ser "honesto" segun la direccion aprendida y aun asi afirmar algo falso que cree cierto.
- No se publican evaluaciones externas ni curvas de degradacion de capacidad; el steering puede inducir respuestas atipicas, refusal o perdida de coherencia si el coeficiente se sube por encima del punto recomendado.
- El punto de operacion recomendado es un unico barrido (capa 26, coeficientes 36/4/4); no se documenta sensibilidad a otros valores ni intervalos de confianza.
- El repositorio no incluye los pesos del modelo base: su uso requiere descargar Llama-3.3-70B-Instruct y cumplir la Llama 3.3 Community License, mas restrictiva que el MIT de los artefactos.
- Idioma del conjunto de contraste no declarado; se desconoce si la direccion es estable en castellano u otros idiomas.
- Artefactos marcados como experimentales, con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni mantenimiento continuado.
- No hay informacion sobre sesgos demograficos del conjunto de contraste ni sobre como el steering afecta a la equidad de las respuestas.
- Requiere instrumentar el *forward pass*; no es utilizable como un modelo mas en un *endpoint* estandar de inferencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NiklasTUM/llama3.3-70b-instruct-honesty-steering-vectors-self-report-experimental
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Artefactos equivalentes para Qwen3.6-27B: https://huggingface.co/NiklasTUM/qwen3.6-27b-honesty-steering-vectors-self-report-experimental
- Agregados StTP de una sola capa (gemma-3-27b-it, Qwen3.5-27B, Nemotron-120B): https://huggingface.co/NiklasTUM/aletheia-tararesearch-sttp
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
