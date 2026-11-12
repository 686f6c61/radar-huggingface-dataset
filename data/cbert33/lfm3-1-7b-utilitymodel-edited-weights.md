# cbert33/LFM3-1.7B-UtilityModel-edited-weights

## Resumen

LFM3-1.7B-UtilityModel-edited-weights es una variante del modelo LiquidAI/LFM3-1.7B, desarrollada por el usuario cbert33, en la que se han aplicado dos ediciones estáticas sobre la matriz `lm_head` para especializar el modelo en llamadas a herramientas en formato JSON y reducir la verbosidad previa a la llamada. No se ha realizado entrenamiento, LoRA ni ajuste fino: las modificaciones consisten en desplazamientos de filas concretas de `lm_head` calculados a partir de estados ocultos capturados, manteniendo el resto de tensores byte-idénticos al modelo base.

El modelo hereda la arquitectura y capacidades del LFM3-1.7B original de Liquid AI, con aproximadamente 1.990 millones de parámetros en precisión bf16, un tamaño de repositorio de 4,0 GB y soporte para 16 idiomas, incluido el español. El pipeline declarado es `text-generation` y la licencia es `lfm1.0` (etiquetada como `other`), con requisito de atribución y condiciones de uso comercial definidas por Liquid AI.

La relevancia de esta variante reside en su enfoque poco habitual: en lugar de reentrenar, mide estados de decisión del modelo y aplica desplazamientos lineales dirigidos sobre el vocabulario de salida. Según la model card, esto eleva la tasa de JSON puro del 42,0 % al 83,3 % y reduce los tokens generados un 10,7 % en la primera edición, y recorta la tasa de "ramble" del 72,0 % al 60,0 % con un 20 % menos de tokens en la segunda.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LFM3 de Liquid AI; detalles internos de la arquitectura no disponibles en la información proporcionada) |
| Parámetros totales | 1.990.945.536 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se realizó cuantización en la edición; pesos en bf16. Otras cuantizaciones no disponibles |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (bf16, 3,98 GB) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B pertenece a la familia LFM3 de Liquid AI, orientada a despliegue en el borde (edge). La información proporcionada no detalla la arquitectura interna del transformer (número de capas, dimensión oculta, mecanismo de atención), por lo que esos datos se consideran no disponibles. Lo que sí se documenta con precisión es el proceso de edición aplicado sobre la cabeza de salida.

La edición consta de dos pasos estáticos sobre `lm_head`. Primero se desvinculó `lm_head` de los embeddings de entrada (`tie_word_embeddings: false`), dejando `embed_tokens` byte-idéntico. Después se midieron 59 estados de decisión `antml` (los que emiten `<tool_call>`) y se calculó `hbar_a`, la media del estado oculto final en esos puntos (norma L2 de 73,21). La fila 99 (`{`) se desplazó `+0,00453 * hbar_a` y las 16 filas de la familia de saltos de línea se desplazaron `-0,00227 * hbar_a`. El mecanismo descrito es que, en esos estados, el token de salto de línea gana por unos 29 logits frente a `{` y `<`; suprimir la familia de saltos de línea en la dirección del estado `antml` libera la compuerta del corchete.

La segunda edición actuó sobre la verbosidad. Se capturaron 12.415 estados de frontera (12.289 de continuación y 126 de compromiso) a partir de 100 salidas con semilla 13. En las fronteras de continuación, `{` se sitúa en el rango ~1.156 y unos 18,9 logits por debajo del siguiente token real; en las de compromiso, en el rango ~4 y ~5,8 por debajo, lo que supone una oscilación estructural de unos 14 logits. Se calculó `hbar_con` (norma L2 de 40,86) y se desplazaron 33 filas de apertura JSON `+0,0035 * hbar_con`, excluyendo todo `}` y los tokens de llave de LaTeX. El resto de tensores quedó byte-idéntico, con verificación de 286/286 tensores fuente.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredadas del LFM3-1.7B base.
- Llamadas a herramientas en formato JSON: emite `{"name": ..., "arguments": ...}` en lugar del formato XML `<tool_call><function=...>` por defecto, con una tasa de JSON puro del 83,3 % tras la primera edición.
- Reducción de narración previa a la llamada: la tasa de "ramble" baja del 72,0 % al 60,0 % y los tokens generados se reducen un 20 % en la segunda edición.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Compatibilidad con `transformers` y con el código personalizado del modelo base (`custom_code`), e integración declarada con endpoints compatibles.
- No se documentan capacidades de visión, audio, modo "thinking" explícito ni razonamiento multi-paso más allá del uso como agente de utilidades.

## Casos de uso

- Agentes de utilidades con tool calling: el modelo está especializado en emitir JSON parseable para invocar funciones, lo que reduce la necesidad de postprocesar XML y simplifica la integración con orquestadores de agentes que esperan `{"name": ..., "arguments": ...}`.
- Pipelines de automatización con parseo estricto: al elevar la tasa de JSON puro al 83,3 % y la de respuestas parseables al 87,3 %, disminuye la tasa de fallos en sistemas que validan la salida con un parser JSON antes de ejecutar la acción.
- Reducción de coste por token en producción: la disminución del 10,7 % y del 20 % en tokens generados en las dos ediciones rebaja la factura de inferencia en despliegues con muchas llamadas cortas.
- Asistentes conversacionales en el borde: con 1.990 millones de parámetros y pesos en bf16 de 3,98 GB, es viable en hardware de gama consumer con cuantización adicional, aunque esta no se haya aplicado en el repositorio.
- Enrutamiento de intenciones en backends: el modelo puede clasificar la petición del usuario y devolver directamente la llamada a la herramienta adecuada en JSON, integrándose en un servicio de despacho.
- Evaluación de técnicas de edición de pesos: sirve como caso de estudio reproducible para investigadores interesados en modificar el comportamiento de un modelo sin reentrenar, gracias al `WRITE-MANIFEST.json` con identificadores de fila, valores beta y normas de dirección.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones internas del autor sobre la tarea específica de formato de tool calling, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan tal cual, con las muestras indicadas.

Edición 1 (RC1 frente al base LiquidAI/LFM3-1.7B; 50 prompts × 3 muestras = 150 por brazo, muestreo estándar con temperatura 0,1, top_k 50 y repetition_penalty 1,1):

| Métrica | Base | Editado | Delta |
|---|---:|---:|---:|
| JSON puro | 42,0 % | 83,3 % | +41,3 pts |
| antml puro | 20,0 % | 1,3 % | -18,7 pts |
| Mixto | 26,7 % | 4,0 % | -22,7 pts |
| Ninguno | 11,3 % | 11,3 % | 0 |
| Parseable | 68,7 % | 87,3 % | +18,6 pts |
| antml presente | 46,7 % | 5,3 % | -41,4 pts |
| Tokens generados (media) | 2008 | 1793 | -10,7 % |
| Prompts con ≥1 parseable | 84 % | 98 % | +14 pts |
| Prompts con las 3 parseables | 26/50 | 38/50 | +12 |

Edición 2 (RC2 frente a RC1; 50 prompts × 1 muestra por brazo, semilla 14):

| Métrica | Base | Editado | Delta |
|---|---:|---:|---:|
| Tasa de ramble | 72,0 % | 60,0 % | -12 pts |
| JSON puro | 86,0 % | 88,0 % | +2 pts |
| Parseable | 88,0 % | 88,0 % | 0 |
| Tokens generados (media) | 2238 | 1786 | -20 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4 GB solo para pesos, más overhead de activaciones y caché KV; el repositorio ocupa 4,0 GB.
- GPU recomendadas: el tamaño permite ejecución en GPU consumer con suficiente VRAM; no se especifican modelos concretos en la información proporcionada.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más en bf16, y en configuraciones inferiores si se aplica cuantización adicional (no incluida en el repositorio).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` por el código personalizado del modelo base; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están confirmadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-UtilityModel-edited-weights | 1.990.945.536 | No disponible | Edición estática de `lm_head` para JSON tool calls | lfm1.0 | Hugging Face (0 descargas, 1 like) |
| LiquidAI/LFM3-1.7B (base) | No disponible en la información | No disponible | Modelo conversacional edge de Liquid AI | lfm1.0 | Hugging Face |
| Otras alternativas de ~2B para tool calling | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks estándar del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento general no está disponible.

## Limitaciones y advertencias

- Las ediciones son desplazamientos estáticos de filas de `lm_head`; no hay entrenamiento ni ajuste fino, por lo que el comportamiento puede degradarse fuera de la distribución de prompts evaluada.
- Los resultados reportados provienen de muestras pequeñas (150 y 50 generaciones por brazo) y de una única configuración de muestreo; no se han validado de forma independiente.
- La tasa de "ramble" tras la segunda edición sigue siendo del 60,0 %, por lo que la verbosidad previa a la llamada persiste en la mayoría de los casos.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan los del modelo base LFM3-1.7B, que no se detallan.
- Licencia lfm1.0: uso comercial sujeto a las condiciones de Liquid AI; es necesario revisar el archivo `LICENSE` del repositorio antes de desplegar en producción.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del repositorio.
- El repositorio tiene 0 descargas y 1 like, sin validación comunitaria; el autor es un particular (cbert33), no Liquid AI.
- La longitud de contexto no está documentada en la información disponible, lo que limita la planificación de casos con historiales largos.
- No se incluyen cuantizaciones GGUF ni versiones optimizadas para llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbert33/LFM3-1.7B-UtilityModel-edited-weights
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
