# Jundot/gemma-4-12B-it-oQ8e-mtp

## Resumen

El modelo `Jundot/gemma-4-12B-it-oQ8e-mtp` es una conversión cuantizada en formato MLX del modelo `google/gemma-4-12B-it`, desarrollada por el usuario Jundot a partir del modelo base de Google DeepMind. Se trata de un modelo "Unificado" any-to-any de la familia Gemma 4, con 12.382.587.188 parámetros (12,383B) y una ventana de contexto de 256.000 tokens, que integra en un único transformer decoder-only las modalidades de texto, imagen y audio, sin encoders separados.

La particularidad de este checkpoint es que ha sido cuantizado con la técnica oQ (oMLX v0.7.1) en precisión mixta bajo el esquema "Improved oQe Quantization", alcanzando una media efectiva de 8,778 bits por peso. Además, incorpora una cabeza de predicción multi-token (MTP) fusionada desde `google/gemma-4-12B-it-assistant`, lo que habilita decodificación especulativa. El resultado son 12,654 GiB de almacenamiento, lo que lo hace viable en equipos con memoria unificada moderada.

Es relevante ahora porque permite ejecutar un modelo multimodal de 12B con contexto de 256K en hardware Apple Silicon mediante MLX, con una pérdida de precisión controlada y licencia Apache-2.0. No obstante, no hay datos públicos de benchmarks ni de idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only unificado (any-to-any) con proyecciones lineales de imagen y audio y cabeza MTP |
| Parametros totales | 12.382.587.188 (12,383B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens (256K) |
| Tipos de cuantizacion | oQ8e en precision mixta: affine 8-bit grupo 64 (96,295% de los pesos) + BF16 (3,705%); media efectiva de 8,778 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4) |
| Formato de pesos | safetensors para MLX |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` es un transformer decoder-only de 11,95B parámetros de la familia Gemma 4. Su diseño es "Unificado": no dispone de encoders separados para cada modalidad, sino que los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras (0,015B para visión y 0,002B para audio). Todas las modalidades atraviesan así un único decodificador con contexto de 256K tokens. Esta conversión conserva dicha arquitectura y le añade una cabeza MTP de 0,423B parámetros fusionada desde `google/gemma-4-12B-it-assistant`.

En cuanto al proceso de cuantización, oQ8e asigna bits según la sensibilidad medida de cada capa y después redondea cada grupo con una matriz de importancia (128 muestras × 512 tokens) y un reajuste por mínimos cuadrados ponderados de su escala y sesgo. El reparto final es de 11,924B pesos en affine 8-bit grupo 64 (11,799 GiB) y 0,459B en BF16 (0,855 GiB). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento en un modelo decoder-only de 12B parámetros.
- Entrada multimodal any-to-any: procesa imagen y audio además de texto, proyectándolos al mismo espacio de embeddings.
- Ventana de contexto de 256.000 tokens, apta para documentos y conversaciones largas.
- Decodificación especulativa mediante la cabeza MTP fusionada, orientada a acelerar la inferencia.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades especiales: multimodalidad unificada (texto, visión y audio) y predicción multi-token.

## Casos de uso

- Análisis de documentos largos: gracias a sus 256K tokens de contexto, puede procesar informes, contratos o expedientes completos en una sola pasada sin fragmentar el contenido.
- Asistente multimodal de escritorio en Apple Silicon: la cuantización MLX de ~12,7 GiB permite desplegarlo localmente en un Mac con memoria unificada suficiente, manteniendo las capacidades de imagen y audio.
- Descripción y comprensión de imágenes: al proyectar parches de imagen al espacio de embeddings, puede generar descripciones, responder preguntas sobre imágenes o extraer información visual.
- Procesamiento de audio: la proyección de formas de onda permite tareas de transcripción o comprensión de contenido sonoro dentro del mismo decodificador.
- Generación asistida con decodificación especulativa: la cabeza MTP permite acelerar la generación en entornos MLX donde el throughput es crítico.
- Prototipado de aplicaciones any-to-any: al aceptar texto, imagen y audio en un único modelo, simplifica arquitecturas que de otro modo requerirían varios modelos especializados.
- Investigación sobre cuantización: sirve como referencia para estudiar el impacto del esquema oQ8e de precisión mixta sobre un modelo multimodal de 12B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos: 12,654 GiB (13,587 GB) en el checkpoint MLX cuantizado a 8,778 bits/peso efectivos.
- VRAM/memoria estimada: en torno a 13 GiB solo para los pesos, mas el overhead de activaciones y el KV cache. Con contexto de 256K, el KV cache puede crecer de forma significativa; no se dispone de cifras exactas.
- GPU compatibles: el formato es MLX, orientado a Apple Silicon (series M). No se proporciona una version para CUDA ni cifras para A100, H100 o RTX 4090 en este repositorio.
- Consumer GPU: no aplica directamente por estar en formato MLX; en Apple Silicon, un equipo con 16 GB de memoria unificada queda ajustado y se recomienda 24-32 GB o mas para contexto largo.
- Opciones de despliegue: MLX (libreria declarada). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible. La presencia de la cabeza MTP sugiere soporte de decodificacion especulativa para mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ8e-mtp | 12,383B | 256K | oQ8e, 8,778 bits/peso | Apache-2.0 | MLX safetensors |
| google/gemma-4-12B-it | 11,95B | 256K | BF16 (sin cuantizar) | Licencia Gemma 4 | safetensors |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | no disponible | no disponible | no disponible |

Las alternativas de la misma categoria (otros checkpoints cuantizados de Gemma 4 12B en MLX) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 8,778 bits/peso introduce una perdida de precision respecto al modelo base en BF16, especialmente en las capas no asignadas a BF16.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan datos de evaluacion que lo cuantifiquen.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento uniforme fuera de los idiomas del modelo base.
- Contexto de 256K tokens: el uso de ventanas muy largas incrementa notablemente el consumo de memoria por el KV cache.
- Licencia: el repositorio declara Apache-2.0, pero enlaza a la licencia Gemma 4 del modelo base; conviene verificar las condiciones reales de uso comercial antes de desplegarlo en produccion.
- Formato limitado a MLX, lo que restringe su uso fuera de Apple Silicon salvo conversion adicional.
- El modelo tiene 0 descargas y 0 likes en el momento del registro, por lo que no cuenta con validacion de la comunidad.
- No se dispone de resultados de benchmarks que respalden el rendimiento tras la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/gemma-4-12B-it-oQ8e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
