# OsaurusAI/Raptor-v0.5-8B-A1B-JANG_6M

## Resumen

Raptor v0.5 es un modelo de lenguaje compacto desarrollado por OsaurusAI, pensado para ejecutarse como modelo residente en equipos Apple Silicon donde el coste de tener un modelo grande en memoria es elevado. Se trata de una cuantización calibrada JANG_6M de un fine-tune LoRA sobre el modelo base inclusionAI/Ling-3.0-tiny, con licencia MIT y soporte para inglés y chino. El modelo está diseñado específicamente para tareas de agente: tool calling, razonamiento multi-paso, manipulación de archivos y configuración declarativa dentro del ecosistema Osaurus.

Arquitectónicamente es un modelo híbrido denominado `bailing_hybrid` (BailingMoeV3ForCausalLM) con 24 capas, de las cuales 18 usan Kimi Delta Attention (KDA) y 6 usan gated MLA. Es una mezcla de expertos (MoE) con 128 expertos, top-8 activos más uno compartido, lo que da un total de aproximadamente 7,5 mil millones de parámetros pero solo alrededor de 1 mil millones activos por token. Su ventana de contexto es de 131.072 tokens y el estado recurrente de las capas KDA no crece con la longitud del contexto, lo que lo hace especialmente adecuado para sesiones largas en las que una persona espera cada paso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3ForCausalLM (bailing_hybrid): 24 capas, 18 KDA + 6 gated MLA, capa 0 densa |
| Parametros totales | 6.156.950.944 (pesos safetensors); ~7,5B total según model card |
| Parametros activos | ~1B (MoE: 128 expertos, top-8 + 1 compartido) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | JANG_6M calibrada: expertos a 8/6/5 bits (6 grupos a 8-bit, 51 a 6-bit, 12 a 5-bit); linears no-expertos y embeddings a 8-bit; router, biases, A_log, dt_bias, kernels KDA y normas sin cuantizar |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT |
| Formato de pesos | Safetensors (cuantizados, alineados para MLX) |

## Arquitectura y entrenamiento

El modelo parte de inclusionAI/Ling-3.0-tiny y se le aplica un fine-tune mediante LoRA con r4/alpha8 sobre un corpus v15 de Osaurus (conversaciones de MCP y onboarding declarativo), fusionado a BF16. Posteriormente se cuantiza con el esquema JANG_6M, que combina tres etapas calibradas sobre los pesos fusionados, no sobre el base: escalas AWQ ajustadas por activaciones por canal, asignación de bits mixta basada en la traza Hessiana sobre 69 grupos de tensores de expertos, y un refit de rango de imatrix ponderado por activaciones. La cuantización logra exactamente 6,0000 bits por peso en los expertos y conserva sin cuantizar los parámetros de estado y de gating (router, biases, A_log, dt_bias, kernels KDA, normas), cuyos errores se amplificarían a través de la recurrencia.

La innovación técnica más destacable es el uso de capas KDA con estado recurrente fijo de dimensión `[16,128,128]` más tres buffers de convolución cortos, que no crecen con el contexto. Combinado con MoE de 128 expertos y top-8 + 1 compartido, permite mantener un coste de inferencia bajo incluso con ventanas de 131k tokens. El modelo está optimizado para el runtime JANG de Osaurus; el stock `mlx_lm` no tiene soporte para `bailing_hybrid`.

## Capacidades

- Generación de texto y razonamiento activado por defecto, con `enable_thinking` como interruptor para desactivarlo; los bloques `
