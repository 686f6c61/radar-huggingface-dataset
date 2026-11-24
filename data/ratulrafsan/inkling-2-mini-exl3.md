# ratulrafsan/Inkling-2-Mini-EXL3

## Resumen

Inkling-2-Mini-EXL3 es una conversión cuantizada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario ratulrafsan. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia: los expertos enrutados (MoE) del checkpoint original se han recomprimido en formato EXL3 (EXLlamaV3) para su despliegue con exllamav3, manteniendo el resto de tensores —incluida la torre de visión— en BF16/FP32 tal como estaban en el origen. El repositorio ocupa 37,8 GB e incluye los pesos cuantizados, la base no experta y la cabeza MTP del modelo original.

El modelo base es un transformer de mezcla de expertos con arquitectura "looped" (Inkling-2), de la que no se detallan en la información disponible el número total de parámetros, la longitud de contexto nativa ni la composición del dataset de entrenamiento. La conversión emplea 128 expertos por capa, con capas 0-19 a 6 bpw y capas 20-23 a 8 bpw (media de 6,33 bpw), lo que reduce el peso de los ficheros de 21,7 GiB (variante principal) frente a los 16,5 GiB de la variante de 4,5 bpw.

Su relevancia es doble: por un lado, permite ejecutar un modelo MoE multimodal con decodificación especulativa (mediante la cabeza MTP) en hardware de consumo; por otro, es un ejemplo de cuantización con métricas de calidad publicadas (KL, acuerdo top-1 y perplejidad frente al checkpoint fuente). La contrapartida es que no carga en exllamav3 estándar: requiere una rama parcheada del fork del autor y un parche específico de TabbyAPI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con arquitectura "looped" (Inkling-2); incluye torre de visión y cabeza MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se ha probado un prompt de 161.543 tokens) |
| Tipos de cuantizacion | EXL3: 6 bpw (capas 0-19) y 8 bpw (capas 20-23), media 6,33 bpw; variante alternativa 4,5 bpw (mezcla 4/5 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3 linears para expertos; BF16/FP32 para el resto) |

## Arquitectura y entrenamiento

La información disponible describe el artefacto de cuantización, no el entrenamiento del modelo base. Se sabe que Inkling-2-Mini es un MoE con 128 expertos por capa y una arquitectura "looped" (el propio autor indica que la conversión recoge las Hessianas "sobre las tres pasadas del bucle", lo que implica tres pasadas de cómputo por capa). El checkpoint fuente mezcla precisión: las capas 0-19 están en NVFP4 y las 20-23 en MXFP8, lo que explica el reparto 6/8 bpw de la conversión. Incluye una torre de visión (`model.visual.*`, 0,6 GiB en el fichero base) y una cabeza MTP (multi-token prediction) que puede usarse como modelo borrador para decodificación especulativa.

El proceso de cuantización usó 250 filas de 2.048 tokens de los datos de calibración por defecto de exllamav3, con Hessianas recogidas en las tres pasadas del bucle y sin propagación de error entre capas. Se generó con `util/inkling2/convert_exl3.py` del fork sobre exllamav3 1.6.7. No hay información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen junto con texto (pipeline `image-text-to-text`); la torre de visión se usa tal como está almacenada en el repositorio.
- Razonamiento y separación entre razonamiento y respuesta final (requiere el parche de TabbyAPI; sin él, TabbyAPI no separa ambas partes).
- Tool calling / function calling (parseado mediante el parche de TabbyAPI).
- Decodificación especulativa mediante la cabeza MTP (`mtp.safetensors`) como modelo borrador.
- Procesamiento de prompts largos: se ha probado un prompt de 161.543 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No soporta entrada de vídeo.

## Casos de uso

- Asistente conversacional multimodal autoalojado: el modelo acepta imágenes y texto, por lo que puede gestionar consultas sobre capturas, diagramas o documentos escaneados en un despliegue propio con TabbyAPI y el parche indicado.
- Procesamiento de documentos largos: con prompts de hasta 161.543 tokens verificados, es adecuado para resumir o extraer información de expedientes extensos en una sola pasada (prefill a 1.153 T/s en el sistema de prueba).
- Agentes con tool calling: el parseo de llamadas a herramientas del parche de TabbyAPI permite integrarlo en flujos de agente que consultan APIs externas y encadenan varios pasos.
- Inferencia en hardware de consumo: con 21,2 GiB de VRAM para los pesos, cabe en configuraciones de dos GPU (RTX 4090 + RTX 3090 en el sistema de prueba) y ofrece 88,7 T/s en decodificación para chats cortos.
- Prototipado e investigación de cuantización: las métricas publicadas (KL 0,00282, acuerdo top-1 del 97,49 %, perplejidad 8,4452) permiten usar el repositorio como referencia para estudiar el impacto de EXL3 en modelos MoE.
- Servicio de baja latencia con decodificación especulativa: la cabeza MTP como draft model acelera la generación en despliegues con exllamav3 y TabbyAPI.
- Análisis de imágenes en lote: una imagen de 1024 x 768 px se procesa en 520 tokens y 0,21 s en la torre de visión, lo que permite clasificar o describir imágenes en pipelines por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad de la cuantización frente al checkpoint fuente sobre 20.480 tokens de texto ajeno a la calibración:

| Modelo | KL | Acuerdo top-1 | Perplejidad |
|---|---|---|---|
| Checkpoint fuente (referencia) | - | - | 8,4444 |
| Fuente con activaciones bf16 (suelo de ruido) | 0,00245 | 97,64 % | 8,4478 |
| Esta conversión (main, 6,33 bpw) | 0,00282 | 97,49 % | 8,4452 |
| Variante 4,5 bpw | 0,0042 | no disponible | no disponible |

El autor advierte que el enrutamiento top-k de expertos es discontinuo, por lo que dos ejecuciones que solo difieren en redondeo ya producen diferencias del orden del "suelo de ruido". La variante de 4,5 bpw declara KL 0,0042 frente a 0,0020 de la conversión principal (suelo de ruido 0,0017).

Rendimiento medido en el sistema de prueba (RTX 4090 + RTX 3090, una secuencia, a fecha 2026-11-24):

| Métrica | Valor |
|---|---|
| VRAM de los pesos | 21,2 GiB (más 1,2 GiB al cargar la torre de visión) |
| Caché FP16 | ~33 KiB por token |
| Decodificación vía TabbyAPI, chats cortos | 88,7 T/s |
| Prompt de 161.543 tokens vía TabbyAPI | Prefill 1.153 T/s, decodificación 48 T/s |
| Imagen 1024 x 768 px | 520 tokens, 0,21 s en la torre de visión |

## Requisitos de hardware

- VRAM para pesos: 21,2 GiB en la conversión principal; 1,2 GiB adicionales si se carga la torre de visión. La variante 4,5 bpw ocupa 16,5 GiB en ficheros de pesos.
- Caché KV en FP16: aproximadamente 33 KiB por token, lo que condiciona la VRAM disponible para contexto largo (un prompt de 161.543 tokens exige un presupuesto de caché considerable).
- GPU recomendadas: el sistema de prueba usa una RTX 4090 junto a una RTX 3090. No se dispone de datos para A100, H100 u otras GPU profesionales.
- GPU de consumo: no cabe en una única GPU de 24 GB con la torre de visión cargada (21,2 + 1,2 GiB de pesos más caché); sí en configuraciones multi-GPU de consumo como la del sistema de prueba.
- Despliegue: exclusivamente exllamav3 desde la rama `local-patches` del fork `ratulrafsan/exllamav3`, compilando la extensión desde fuente (las wheels de release no incluyen los kernels necesarios y ejecutan una ruta lenta). Para servir, TabbyAPI con el parche `util/inkling2/tabbyapi_inkling2.patch` y los ajustes `cuda_malloc_async: false`, `cache_mode: FP16` y `vision: true` para imágenes.
- Limitaciones de rendimiento: una sola secuencia a la vez en la ruta rápida de decodificación y solo caché FP16.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa es con el propio checkpoint fuente y con la variante de 4,5 bpw del mismo repositorio:

| Modelo | Parámetros | Contexto | Calidad (KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3 (main) | no disponible | no disponible | 0,00282 | Apache 2.0 | Hugging Face (ratulrafsan/Inkling-2-Mini-EXL3) |
| Inkling-2-Mini-EXL3 (4,5 bpw) | no disponible | no disponible | 0,0042 | Apache 2.0 | Rama `4.5bpw` del mismo repo |
| thinkingmachines/Inkling-2-Mini (fuente) | no disponible | no disponible | referencia | Apache 2.0 | Hugging Face (thinkingmachines/Inkling-2-Mini) |

## Limitaciones y advertencias

- No carga en exllamav3 estándar: requiere la rama `local-patches` del fork del autor y compilar la extensión desde fuente; con las wheels de release funciona por una ruta lenta.
- TabbyAPI necesita un parche específico; sin él no separa razonamiento de respuesta, no parsea tool calls y no coloca las imágenes correctamente.
- Una sola secuencia simultánea en la ruta rápida de decodificación, lo que limita el despliegue en producción con concurrencia.
- Solo caché FP16; no se documentan otras precisiones de caché.
- Sin soporte de vídeo como entrada.
- No se publican datos sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base.
- La licencia Apache 2.0 del modelo base y de la conversión permite uso comercial, pero el parche y el fork de exllamav3 deben revisarse por separado antes de un despliegue en producción.
- El enrutamiento top-k discontinuo implica que pequeñas diferencias de redondeo producen variaciones medibles en la salida; conviene fijar semillas y validar en el caso de uso concreto.
- La información sobre el modelo base (parámetros, contexto, datos de entrenamiento) no está disponible en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ratulrafsan/Inkling-2-Mini-EXL3
- Rama 4,5 bpw: https://huggingface.co/ratulrafsan/Inkling-2-Mini-EXL3/tree/4.5bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Fork de exllamav3 (rama `local-patches`): https://github.com/ratulrafsan/exllamav3
- README de la rama con la sección "Inkling-2-Mini": https://github.com/ratulrafsan/exllamav3/tree/local-patches#inkling-2-mini
