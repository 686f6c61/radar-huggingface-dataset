# ibm-granite/granite-4.0-350m-base-GGUF

## Resumen

Granite-4.0-350m-base-GGUF es la versión cuantizada en formato GGUF del modelo base Granite 4.0 de 350 millones de parámetros desarrollado por IBM. Este repositorio, publicado por la organización ibm-granite, no contiene un modelo nuevo sino una conversión del checkpoint original `ibm-granite/granite-4.0-350m-base` a los formatos que consume llama.cpp, con el objetivo de facilitar su despliegue en entornos locales y en hardware modesto.

El modelo pertenece a la familia Granite 4.0 de IBM, orientada a tareas de lenguaje general. Con 352.379.904 parámetros, se sitúa en la gama de modelos pequeños, lo que permite ejecutarlo en CPU o en GPUs de consumo con requisitos de memoria reducidos. Al ser un modelo *base* (no instruido), está pensado como punto de partida para ajuste fino supervisado o para experimentación, no como asistente conversacional listo para usar.

La relevancia de esta ficha radica en que combina una licencia permisiva Apache 2.0 con un formato ampliamente soportado por el ecosistema (llama.cpp, Ollama, servidores compatibles con la API de OpenAI). No obstante, la información pública disponible es limitada: la model card remite al repositorio del modelo base y no detalla composición del dataset, longitud de contexto ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Granite 4.0; detalles no disponibles) |
| Parametros totales | 352.379.904 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y otras cuantizaciones GGUF (listado completo no disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,9 GB); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna más allá de su pertenencia a la familia Granite 4.0. El recuento de parámetros (352,4 millones) y el formato de despliegue (llama.cpp) son coherentes con un transformer decoder-only de tamaño pequeño, pero no se detalla el número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco se documentan en la información proporcionada el volumen de tokens de entrenamiento, la composición del corpus, ni si el modelo ha pasado por fases de RLHF, DPO o instrucción. Al tratarse de un modelo *base*, es esperable que no haya recibido ajuste de alineación conversacional, aunque este extremo no se confirma en la model card.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base.
- Punto de partida para ajuste fino (fine-tuning) en tareas específicas de dominio.
- Extracción de características y modelado de lenguaje para investigación.
- Despliegue local mediante llama.cpp con CLI interactiva (`llama cli`) y servidor compatible con la API de OpenAI (`llama serve`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades de visión, audio o modo *thinking*: no disponibles.

## Casos de uso

- Prototipado rápido en local: al pesar unos pocos cientos de MB en cuantizaciones bajas, permite arrancar un servidor de inferencia en un portátil sin GPU dedicada y validar prompts o pipelines antes de escalar a modelos mayores.
- Ajuste fino para dominios verticales: su tamaño reducido y licencia Apache 2.0 lo hacen adecuado como base para SFT en tareas de clasificación de texto, extracción de entidades o generación de resúmenes acotados.
- Generación de texto en dispositivos con recursos limitados: útil en entornos *edge* o embebidos donde no es viable ejecutar modelos de miles de millones de parámetros.
- Investigación en eficiencia de modelos: sirve para estudiar técnicas de cuantización, destilación o evaluación comparativa de modelos pequeños.
- Backend de pruebas para aplicaciones compatibles con la API de OpenAI: `llama serve` expone `/v1/chat/completions`, lo que permite sustituir un proveedor en la nube por una instancia local durante el desarrollo.
- Generación de datos sintéticos a pequeña escala: puede emplearse para producir borradores o datos de aumento en pipelines internos, siempre con revisión humana.
- Filtrado y preprocesado de corpus: como modelo base, puede adaptarse para scoring de perplejidad o filtrado de calidad en conjuntos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, el peso de los parámetros ronda los 0,7 GB (352 M × 2 bytes); en cuantizaciones de 4 bits, aproximadamente 0,2 GB. A ello hay que sumar la memoria del contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en CPU.
- GPU de consumo: cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 e incluso en iGPU con memoria compartida, dependiendo de la cuantización y del contexto.
- Opciones de despliegue: llama.cpp (`llama cli`, `llama serve`), y por compatibilidad de formato GGUF, herramientas del ecosistema como Ollama u otros runners basados en llama.cpp. vLLM y TGI no se mencionan en la información disponible para este repositorio.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera una latencia baja en hardware moderno, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.0-350m-base-GGUF | 352 M | no disponible | Apache 2.0 | GGUF | Version cuantizada del base de IBM |
| granite-4.0-350m-base | 352 M | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar |
| Alternativas de ~350 M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría (por ejemplo, otras familias de ~300-500 M parámetros); los datos de benchmarks y contexto del modelo base no están publicados en la documentación consultada.

## Limitaciones y advertencias

- Al ser un modelo *base*, no está alineado para conversación: puede generar texto incoherente, repetitivo o inapropiado sin ajuste previo.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en tareas de conocimiento factual.
- Longitud de contexto e idiomas soportados no documentados: no se puede garantizar un comportamiento correcto en contextos largos ni en castellano.
- Sesgos: no se documentan evaluaciones de sesgo ni mitigaciones en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución y verificar las condiciones del modelo base.
- El repositorio GGUF depende del build de llama.cpp indicado (`b11798`); versiones muy distintas pueden presentar incompatibilidades.
- No apto para producción crítica sin evaluación previa: la ausencia de benchmarks y de documentación sobre entrenamiento impide estimar su calidad en tareas reales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-350m-base-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m-base
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Documentación de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
