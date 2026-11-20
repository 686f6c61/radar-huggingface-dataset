# Jundot/Qwen3.8-Flash-Next-oQ6e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ6e-mtp es una cuantizacion mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, un checkpoint experimental de la arquitectura que anticipa Qwen4. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un modelo de lenguaje y vision con arquitectura de mezcla de expertos (MoE) de 125.000 millones de parametros con 6.000 millones activados, a los que se suman un embedding de n-gramas de 51.000 millones de parametros y un modulo de prediccion multi-token (MTP) de 4.000 millones. Esta version cuantizada, publicada por el usuario Jundot, empaqueta el backbone de lenguaje, el embedding de n-gramas, el codificador visual y la cabeza MTP en un unico checkpoint de 180.000 millones de parametros logicos con un promedio efectivo de 6,724 bits por peso.

La relevancia de esta ficha radica en que permite ejecutar en hardware Apple Silicon un modelo de escala frontier que, en su formato original, requeriria infraestructura mucho mas costosa. La cuantizacion oQ6e asigna bits por sensibilidad medida de cada capa y aplica un redondeo con matriz de importancia sobre 1024 muestras de 512 tokens, lo que reduce el error de cuantizacion respecto a esquemas uniformes. El checkpoint ocupa 151,3 GB en disco y esta pensado para el ecosistema MLX, la libreria de Apple para inferencia en chips de la serie M.

El modelo combina Gated DeltaNet con Qwen Sparse Attention (QSA) y flujos residuales con compuertas (Gated Residual streams), una combinacion que busca eficiencia en contexto largo y en tareas multimodales. Su pipeline es image-text-to-text, por lo que acepta imagenes y texto como entrada y genera texto como salida. La licencia es Qwen Community License 1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual streams; incluye codificador visual y cabeza MTP |
| Parametros totales | 180.000 millones (logicos, checkpoint completo); backbone de lenguaje 125.744 M, embedding de n-gramas 51.200 M, codificador visual 449 M, cabeza MTP 2.607 M |
| Parametros activos | 6.000 millones (segun la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e mixta: affine 6-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, BF16, n-gram affine 6-bit grupo 32; promedio efectivo 6,724 bits/peso (6,582 en el backbone) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con atencion hibrida: combina Gated DeltaNet (una variante de atencion lineal con estado recurrente) con Qwen Sparse Attention (QSA), ademas de flujos residuales con compuertas. La model card del cuantizador describe el conjunto como un MoE vision-lenguaje de 125.000 millones de parametros con 6.000 millones activados, mas un embedding de n-gramas de 51.000 millones y un modulo MTP de 4.000 millones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion es el esquema de cuantizacion oQ6e, implementado en oMLX 0.8.0. Asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia calculada sobre 1024 muestras de 512 tokens y aplica un reajuste ponderado por minimos cuadrados de la escala y el sesgo del grupo. La distribucion resultante concentra el 68,5% de los pesos en affine 6-bit grupo 64 y el 28,4% en el embedding de n-gramas a 6 bits grupo 32, con solo un 0,29% en BF16. La version actualizada el 19 de noviembre de 2026 incorpora un redondeo oQe refinado que reduce el error de cuantizacion sin cambiar tamano ni velocidad.

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline image-text-to-text permite entrada conjunta de imagenes y texto.
- Procesamiento de vision: incluye un codificador visual de 449 millones de parametros.
- Prediccion multi-token (MTP): la cabeza MTP de 2.607 millones de parametros habilita decodificacion especulativa o generacion de varios tokens por paso.
- Embedding de n-gramas de gran escala: 51.200 millones de parametros dedicados a representaciones de n-gramas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX permite ejecutar un MoE de 180.000 millones de parametros logicos en equipos con memoria unificada suficiente, algo inviable con el modelo en BF16.
- Prototipado de aplicaciones vision-lenguaje: el pipeline image-text-to-text sirve para construir demos de descripcion de imagenes, respuesta a preguntas visuales o extraccion de informacion de documentos escaneados.
- Investigacion sobre cuantizacion: la distribucion de bits publicada y el esquema oQ6e permiten estudiar el impacto del error de cuantizacion por capa en modelos MoE de gran escala.
- Evaluacion de arquitecturas post-transformer: Gated DeltaNet y QSA son candidatos a sustituir la atencion cuadratica clasica; este checkpoint facilita experimentos comparativos en contexto largo.
- Decodificacion especulativa con MTP: la cabeza MTP incluida permite medir ganancias de throughput en generacion autoregresiva sobre hardware Apple.
- Generacion de texto con contexto extenso: si la ventana de contexto del modelo base es amplia, el checkpoint puede usarse para resumen y analisis de documentos largos, aunque el dato de contexto no esta disponible.
- Desarrollo de asistentes multimodales en local: combinacion de vision y lenguaje sin enviar datos a la nube, relevante para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 140,907 GiB (151,298 GB) en disco; la inferencia requiere memoria unificada suficiente para cargar los pesos mas el estado de activacion y la cache KV, por lo que en la practica se necesita un Mac con 192 GB o mas de memoria unificada.
- GPU recomendadas: hardware Apple Silicon de gama alta (M2 Ultra, M3 Ultra o posteriores con 192 GB o mas). No esta pensado para GPU NVIDIA, ya que el formato es MLX.
- Cabe en GPU consumer: no en el sentido convencional; en Apple Silicon consumer solo en configuraciones de memoria unificada maxima.
- Opciones de despliegue: MLX y oMLX (herramienta del cuantizador). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ6e-mtp (este) | 180.000 M logicos (6.000 M activos) | no disponible | Qwen Community 1.0 | MLX safetensors, 6,724 bits/peso | Cuantizacion mixta para Apple Silicon |
| Qwen/Qwen3.8-Flash-Next (base) | 125.000 M (6.000 M activos) + 51.000 M n-gramas + 4.000 M MTP | no disponible | Qwen Community 1.0 | no disponible | Checkpoint original sin cuantizar |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Es una cuantizacion, no el modelo original: la perdida de precision de 6,724 bits/peso puede degradar tareas sensibles, aunque el esquema oQe busca minimizarlo.
- Requiere hardware Apple Silicon con memoria unificada muy elevada; no es desplegable en GPU NVIDIA ni en la mayoria de entornos cloud estandar.
- La licencia Qwen Community License 1.0 impone condiciones especificas para uso comercial que deben revisarse en el archivo LICENSE; no es una licencia permisiva tipo Apache 2.0.
- Riesgo de alucinacion: no hay datos publicados sobre tasas de alucinacion ni evaluaciones de fidelidad en esta cuantizacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue sin evaluacion.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con documentos largos.
- El autor indica que la version actual (19-11-2026) corrige el redondeo; copias anteriores deben descargarse de nuevo.
- Al ser un checkpoint experimental de la arquitectura Qwen4, puede presentar inestabilidades propias de un preview.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
