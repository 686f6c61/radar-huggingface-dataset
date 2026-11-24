# Jundot/gemma-4-12B-it-oQ6e-mtp

## Resumen

Jundot/gemma-4-12B-it-oQ6e-mtp es un checkpoint cuantizado en formato MLX del modelo google/gemma-4-12B-it, el modelo "Unified" de 11,95B parametros de la familia Gemma 4 de Google DeepMind. La cuantizacion corre a cargo de Jundot mediante oQ (oMLX v0.8.0), un esquema de precision mixta que asigna bits segun la sensibilidad medida de cada capa y aplica redondeo con matriz de importancia. El resultado es un checkpoint de 12,38B parametros logicos con un promedio efectivo de 6,891 bits por peso y un peso en disco de 10,7 GB.

La particularidad del modelo base es que no tiene encoders separados: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras, y todas las modalidades atraviesan un unico transformer decoder-only con 256K tokens de contexto. El checkpoint incluye ademas una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-12B-it-assistant, lo que habilita decodificacion especulativa.

Es relevante para desarrolladores que trabajan en Apple Silicon y quieren ejecutar un modelo any-to-any de 12B con contexto largo en hardware de consumo, sin renunciar a las capacidades multimodales del modelo original. La licencia es Apache-2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only unificado (any-to-any), sin encoders separados; proyecciones lineales para vision y audio |
| Parametros totales | 12.382.587.188 (11,95B en el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ6e de precision mixta: affine 6-bit grupo 64 (94,34% de pesos), affine 8-bit grupo 64 (1,95%), BF16 (3,71%); 6,891 bits/peso efectivos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), libreria mlx |
| Tamano del repo | 10,7 GB (9,934 GiB de pesos) |
| Cabeza adicional | MTP (multi-token prediction) de 0,423B parametros, fusionada desde gemma-4-12B-it-assistant |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only unificado de la familia Gemma 4. En lugar de emplear encoders dedicados para vision y audio, las entradas no textuales se proyectan al espacio de embeddings del decoder mediante capas lineales ligeras: la proyeccion de vision ocupa 0,015B parametros y la de audio 0,002B. Todo el procesamiento ocurre en un unico backbone de lenguaje de 11,943B parametros con 256K tokens de contexto.

Este checkpoint concreto no ha sido reentrenado: es una cuantizacion del modelo original de Google DeepMind. oQ6e asigna precision por capa segun sensibilidad medida, redondea cada grupo con una matriz de importancia calculada sobre 128 muestras de 512 tokens y reajusta escala y sesgo mediante minimos cuadrados ponderados. El autor indica que la revision de noviembre de 2026 (oMLX 0.8.0, PRs #4930 y #5292) reduce el error de cuantizacion manteniendo tamano y velocidad. Se incluye una cabeza MTP fusionada desde el modelo assistant, que permite decodificacion especulativa multi-token. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento con ventana de 256K tokens.
- Entrada multimodal any-to-any: procesa imagenes y audio directamente, sin encoders separados.
- Codigo y matematicas (capacidades heredadas del modelo base; sin benchmarks publicados en esta ficha).
- Decodificacion especulativa mediante la cabeza MTP fusionada, que acelera la generacion.
- Ejecucion nativa en MLX sobre Apple Silicon.
- Tool calling y soporte de agentes: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con contexto largo: cargar el checkpoint en MLX permite procesar documentos de hasta 256K tokens en un unico forward pass, util para analisis de contratos, expedientes o bases de codigo completas en un portatil o Mac Studio.
- Asistentes multimodales de escritorio: al aceptar imagen y audio sin encoders separados, se puede construir un asistente que reciba capturas de pantalla y notas de voz en la misma conversacion.
- Prototipado rapido de pipelines any-to-any: investigadores que necesiten validar flujos imagen+texto+audio antes de desplegar en infraestructura mayor pueden usar este checkpoint de 10,7 GB como banco de pruebas.
- Generacion asistida en local con baja latencia: la cabeza MTP habilita decodificacion especulativa, adecuada para autocompletado o redaccion interactiva donde importa el tiempo por token.
- Procesamiento de reuniones y transcripciones: la entrada de audio junto con contexto largo permite resumir grabaciones extensas y cruzarlas con documentacion previa en una sola ventana.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica de oQ6e frente a otras cuantizaciones del mismo modelo base para medir degradacion de calidad en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: unos 10,7 GB para los pesos en oQ6e, mas overhead de KV cache; con 256K de contexto la cache crece de forma significativa y exige memoria adicional proporcional al contexto usado.
- Hardware objetivo: Apple Silicon con MLX (la libreria declarada es mlx); el formato no es directamente compatible con CUDA.
- Cabe en equipos Apple con 16 GB de memoria unificada para contextos moderados; 32 GB o mas recomendable para contexto largo.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable sin conversion previa del checkpoint MLX a otro formato.
- Despliegue: MLX y oMLX; vLLM, llama.cpp, Ollama y TGI no soportan este formato de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ6e-mtp | 12,38B (11,95B base) | 256K | MLX safetensors, 6,891 bits/peso | Apache-2.0 | Any-to-any con MTP; orientado a Apple Silicon |
| google/gemma-4-12B-it | 11,95B | 256K | safetensors BF16 | Apache-2.0 (licencia Gemma 4) | Modelo base sin cuantizar; mayor peso en disco y memoria |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | safetensors | Apache-2.0 (licencia Gemma 4) | Modelo assistant del que se extrae la cabeza MTP |

## Limitaciones y advertencias

- La cuantizacion a 6,891 bits/peso introduce error respecto al BF16 original; el autor no publica metricas de degradacion por tarea.
- Solo funciona en el ecosistema MLX (Apple Silicon); no es portable directamente a CUDA ni a runtimes habituales como vLLM o llama.cpp sin conversion.
- El contexto de 256K implica un consumo de memoria de KV cache elevado que puede superar la memoria unificada de equipos de 16 GB.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones especificas en esta ficha.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento en castellano antes de usarlo en produccion.
- La licencia Apache-2.0 remite a la licencia Gemma 4 de Google; revisar sus terminos de uso comercial antes de desplegar.
- El autor recomienda volver a descargar el checkpoint si se tenia una copia anterior a la revision del 19 de noviembre de 2026.
- Soporte de tool calling y agentes no confirmado; validar antes de disenar flujos que dependan de ello.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-12B-it-oQ6e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo assistant (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio oMLX: https://github.com/jundot/omlx
- PR de mejora de oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
