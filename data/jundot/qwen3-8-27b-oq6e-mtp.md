# Jundot/Qwen3.8-27B-oQ6e-mtp

## Resumen

Qwen3.8-27B-oQ6e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parametros con capacidad de vision-lenguaje construido sobre la arquitectura Qwen3.5. Lo desarrolla el usuario Jundot mediante su herramienta oQ (oMLX v0.8.0), y esta pensado especificamente para ejecucion en hardware Apple Silicon a traves del framework MLX. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de prediccion multi-token (MTP), con un contexto nativo de 262.144 tokens.

El modelo resuelve el problema de desplegar un VLM de 27B en equipos con memoria unificada limitada: la cuantizacion reduce el peso a 22,226 GiB de almacenamiento real con un promedio efectivo de 6,872 bits por peso, manteniendo las capas mas sensibles en 8 bits o BF16 segun su sensibilidad medida. La relevancia actual radica en que permite inferencia local de un modelo multimodal de contexto largo en Macs de gama alta, algo inviable con los pesos originales en BF16.

La ficha describe tanto el checkpoint cuantizado como las caracteristicas del modelo base, dado que las capacidades funcionales provienen de este ultimo. La licencia Apache-2.0, heredada del modelo fuente, facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (Qwen3.5); VLM con codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Precision mixta oQ6e: affine 6-bit grupo 64 (88,345%), affine 8-bit grupo 64 (9,798%), BF16 (1,857%); promedio efectivo 6,872 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (repo de 23,9 GB; 22,226 GiB de almacenamiento) |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 22,526 GB / 20,979 GiB |
| Codificador visual | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,418 GB / 0,389 GiB |
| Total | 27,781B | 23,865 GB / 22,226 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea un diseno hibrido que combina capas Gated DeltaNet con capas Gated Attention, una variante de atencion lineal recurrentizada que reduce el coste computacional en secuencias largas frente a la atencion cuadratica completa. Sobre ese backbone se anade un codificador visual (0,461B de parametros) para comprension de imagen y video, y una cabeza de prediccion multi-token (MTP, 0,425B) que permite decodificacion especulativa y acelera la generacion al predecir varios tokens por paso.

El checkpoint aqui descrito no es un modelo entrenado desde cero, sino una cuantizacion del modelo base. El proceso oQ6e asigna bits por sensibilidad de capa medida, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y aplica un reajuste de escala y sesgo por minimos cuadrados ponderados. La version actualizada el 2026-11-19 usa el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion al mismo tamano y velocidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en el backbone de lenguaje de 26,9B parametros.
- Comprension de imagen y video mediante el codificador visual integrado (pipeline image-text-to-text).
- Contexto largo de 262.144 tokens, adecuado para documentos extensos, bases de codigo o transcripciones prolongadas.
- Decodificacion especulativa mediante la cabeza MTP, que acelera la inferencia.
- Conversacion multi-turno (tag conversational).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes: el contexto de 262.144 tokens permite procesar informes completos, contratos o manuales con figuras y tablas en una sola pasada, manteniendo coherencia entre texto y elementos visuales.
- Descripcion y extraccion de informacion de video: el codificador visual y la ventana de contexto larga permiten resumir grabaciones extensas o extraer eventos concretos de material audiovisual.
- Asistencia en desarrollo sobre Apple Silicon: el formato MLX permite ejecutar el modelo localmente en Macs con memoria unificada, integrandolo en flujos de trabajo de revision de codigo o generacion de documentacion tecnica sin depender de la nube.
- Prototipado de aplicaciones multimodales en local: desarrolladores que necesitan validar pipelines image-text-to-text con privacidad de datos pueden desplegar el checkpoint en su propio equipo.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia para estudiar el impacto de la precision mixta oQ6e frente al modelo en BF16, comparando calidad y velocidad con la misma arquitectura.
- Procesamiento de conversaciones multi-turno con contexto prolongado: la combinacion de contexto largo y tag conversational permite mantener historiales extensos en asistentes especializados.
- Evaluacion de decodificacion especulativa: la cabeza MTP incluida permite medir ganancias de throughput en entornos MLX frente a generacion autoregresiva estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 23,9 GB para el repositorio completo; 22,226 GiB de pesos reales.
- Memoria: se requiere memoria unificada suficiente para cargar los pesos mas el estado de inferencia y la cache KV del contexto usado; con 262.144 tokens de contexto la cache crece de forma significativa, por lo que conviene presupuestar holgura adicional sobre los 22,2 GiB de pesos.
- Hardware objetivo: equipos Apple Silicon con MLX; el formato no es compatible con CUDA de forma nativa.
- GPU consumer: viable en Macs con memoria unificada de gama alta; no aplica a GPUs NVIDIA consumer por el formato MLX.
- Despliegue: libreria MLX y herramientas oMLX del autor; no se indica soporte de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles; la cabeza MTP esta disenada para acelerar la generacion mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ6e-mtp | 27,781B | 262.144 | MLX safetensors (6,872 bits/peso) | Apache-2.0 | Cuantizacion oQ6e con MTP y vision |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | Safetensors BF16 | Apache-2.0 | Modelo original sin cuantizar; mayor peso en memoria |
| Alternativas de mismo tamano | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion introduce error respecto al modelo en BF16; aunque oQ6e minimiza la perdida, no es identica al original.
- El checkpoint esta en formato MLX y depende de la libreria MLX y oMLX; no es portable directamente a ecosistemas CUDA o a runners genericos.
- La cache KV para contextos cercanos a 262.144 tokens consume memoria adicional considerable, lo que puede limitar el contexto efectivo en equipos con poca memoria unificada.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- Idiomas soportados no documentados en esta ficha; conviene verificar el comportamiento en castellano antes de usarlo en produccion.
- Soporte de tool calling y agentes no confirmado; no asumir su disponibilidad sin validacion.
- Licencia Apache-2.0 permisiva para uso comercial, heredada del modelo fuente; revisar el archivo LICENSE del repositorio.
- El autor indica que las copias anteriores al 2026-11-19 deben descargarse de nuevo por el redondeo oQe refinado; verificar la version descargada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
