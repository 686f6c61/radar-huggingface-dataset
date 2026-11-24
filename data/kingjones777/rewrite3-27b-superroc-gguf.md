# kingjones777/Rewrite3-27B-SuperRoc-GGUF

## Resumen

Rewrite3-27B-SuperRoc-GGUF es una cuantización GGUF en formato ROCm-FP4 del modelo aikexue170/rewrite3-27b-bf16, publicada por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de una build de inferencia optimizada para el motor Super Roc, un runtime local orientado al SoC Strix Halo (Ryzen AI Max+ 395, arquitectura gfx1151). El modelo base cuenta con 27.320.697.856 parámetros y está afinado para la reescritura de texto de novelas web en chino.

La relevancia de esta publicación es fundamentalmente de infraestructura: demuestra un pipeline de cuantización FP4 sobre ROCm para hardware de consumo con memoria unificada, con decodificación especulativa mediante un cabezal MTP (multi-token prediction) y soporte de contexto de hasta 131.072 tokens en el runtime. El autor reporta una perplejidad de 5,33 sobre un documento técnico en inglés de 11.000 tokens con contexto 4096, frente a 5,30 de una cuantización Q4_K_M estándar del mismo modelo, lo que indica una degradación mínima por la cuantización FP4.

El repositorio tiene un tamaño de 15,3 GB, licencia Apache 2.0 y un único archivo de pesos. No se dispone de información sobre arquitectura interna, composición del dataset de entrenamiento ni idiomas soportados más allá de la mención al chino como idioma de ajuste del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalle no publicado) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (cargados en Super Roc); perplejidad medida con contexto 4096 |
| Tipos de cuantizacion | Q4_0 en formato ROCm-FP4 (archivo único: Rewrite3-27B-MTP-Q4_0-ROCmFP4-FAST-imatrix.gguf) |
| Idiomas soportados | no disponible (el modelo base está ajustado para reescritura de texto de novelas web en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ROCm-FP4) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base aikexue170/rewrite3-27b-bf16: ni el tipo de transformer, ni el número de capas, ni la composición del dataset de entrenamiento, ni si hubo fases de RLHF o DPO. Lo único documentado es el propósito del ajuste: reescritura de texto de novelas web en chino.

La innovación técnica de esta publicación reside en la build de inferencia, no en el entrenamiento. El archivo incorpora un cabezal MTP (multi-token prediction) que actúa como drafter para decodificación especulativa (`--speculative mtp -d 2 --min-draft-tokens 1`), junto con prompt lookup y una cuantización imatrix en formato ROCm-FP4. El motor Super Roc, construido sobre llama.cpp/ggml, carga el modelo en 17 segundos y gestiona caché de prompt (6.961 de 6.986 tokens cacheados en el segundo turno). El modo thinking está desactivado por defecto en el comando de ejemplo y se activa por petición mediante `chat_template_kwargs.enable_thinking`.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Reescritura de texto, especialidad declarada del modelo base, orientada a novelas web en chino.
- Modo thinking activable por petición mediante `chat_template_kwargs.enable_thinking`.
- Tool calling: el autor reporta 7/8 aciertos en modo required y 7/8 en modo auto.
- Decodificación especulativa con drafter MTP integrado en el archivo.
- Caché de prompt para conversaciones multi-turno.
- Contexto largo: hasta 131.072 tokens cargados en el runtime.
- Compatibilidad con endpoints (tag `endpoints_compatible`) e integración con Lemonade.
- Capacidades multilingües: no disponibles como dato verificado; el ajuste del modelo base es en chino.

## Casos de uso

- Reescritura y pulido de ficción serializada: el modelo base está ajustado específicamente para reescribir texto de novelas web en chino, por lo que encaja en pipelines editoriales de limpieza estilística, expansión de escenas o reescritura de capítulos con coherencia de tono.
- Asistencia editorial con contexto largo: con 131.072 tokens de ventana en Super Roc, permite reescribir capítulos completos o arcos narrativos manteniendo referencias a personajes y tramas anteriores sin truncar.
- Despliegue local en estación de trabajo Strix Halo: el formato ROCm-FP4 y el motor Super Roc permiten ejecutar un modelo de 27B en un SoC con 128 GB de memoria unificada, sin GPU discreta, para prototipado y uso personal.
- Integración en asistentes conversacionales con herramientas: los 7/8 de acierto en tool calling permiten construir agentes que consulten APIs o ejecuten acciones encadenadas en entornos controlados.
- Generación de código asistida: el autor mide 29,1 tok/s en generación de código (media de dos prompts), adecuado para autocompletado interactivo en local, no para pipelines de CI/CD de alta concurrencia.
- Evaluación de cuantizaciones FP4: sirve como referencia para medir la degradación de calidad de ROCm-FP4 frente a Q4_K_M (perplejidad 5,33 frente a 5,30) en tareas de reescritura.
- Chat multi-turno con caché de prompt: la caché de 6.961 tokens en el segundo turno reduce el coste de reprocesamiento en sesiones largas de edición conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos por el autor son de rendimiento del runtime y perplejidad:

| Metrica | Valor |
|---|---|
| Perplejidad (documento técnico EN, 11K tokens, contexto 4096) | 5,33 |
| Perplejidad Q4_K_M del mismo modelo (referencia) | 5,30 |
| Tiempo de carga | 17 s |
| Prompt tok/s (p1k) | 584,0 |
| Prompt tok/s (p8k) | 597,2 |
| Generación tok/s (p1k) | 22,71 |
| Generación tok/s (p8k) | 66,28 |
| Generación de código tok/s | 29,1 |
| Tool calls (required / auto) | 7/8 / 7/8 |
| Caché de prompt turno 2 (cacheados / prompt) | 6.961 / 6.986 |
| Contexto cargado | 131.072 tokens |

Medición sobre Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.1, una petición a la vez, 2026-11-24.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo GGUF pesa 15.309.796.928 bytes (unos 15,3 GB); en Strix Halo se usa memoria unificada, por lo que se necesita un sistema con al menos 16 GB disponibles para los pesos más el espacio de contexto KV.
- GPU recomendadas: el runtime objetivo es el SoC AMD Ryzen AI Max+ 395 (gfx1151) con 128 GB; no se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo discretas; el formato ROCm-FP4 y el motor Super Roc están orientados a Strix Halo.
- Opciones de despliegue: Super Roc (`superroc serve ... llm --model ...`) y Lemonade (`lemonade pull` / `lemonade chat`). No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: 22,71 tok/s de generación con prompt de 1K y 66,28 tok/s con prompt de 8K; 584-597 tok/s de procesamiento de prompt; 29,1 tok/s en código. Medido con una sola petición concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Rewrite3-27B-SuperRoc-GGUF | 27,3B | 131.072 (runtime) | GGUF ROCm-FP4 | Apache 2.0 | Optimizado para Strix Halo y Super Roc |
| aikexue170/rewrite3-27b-bf16 | 27,3B | no disponible | BF16 (safetensors) | no disponible | Modelo base sin cuantizar |
| Q4_K_M del mismo modelo | 27,3B | no disponible | GGUF Q4_K_M | Apache 2.0 (presumible) | Perplejidad 5,30, referencia de calidad |

No se dispone de información sobre otros modelos comparables de la misma categoría (reescritura de ficción en chino, 27B) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo base está ajustado para reescritura de texto de novelas web en chino; su rendimiento fuera de ese dominio y en otros idiomas no está documentado.
- Riesgo de alucinación: no evaluado; no hay datos de benchmarks de fidelidad ni de tasas de error factual.
- Sesgos conocidos: no documentados; al ser un ajuste sobre ficción web china, puede heredar sesgos culturales y estilísticos del corpus.
- La cuantización FP4 introduce una degradación mínima pero medible (perplejidad 5,33 frente a 5,30 en Q4_K_M); no se han evaluado tareas de razonamiento o código con métricas de calidad.
- Compatibilidad de hardware muy restringida: el runtime Super Roc y el formato ROCm-FP4 están orientados a Strix Halo (gfx1151); no se garantiza su funcionamiento en otras GPUs.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026; no hay validación comunitaria independiente.
- Los datos de rendimiento proceden de una única medición con una petición concurrente; el throughput en producción con varias peticiones no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base declara una licencia no especificada en la información disponible; conviene verificar la licencia del modelo original antes de un despliegue comercial.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/Rewrite3-27B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Repositorio Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX: https://github.com/charlie12345/ROCmFPX
