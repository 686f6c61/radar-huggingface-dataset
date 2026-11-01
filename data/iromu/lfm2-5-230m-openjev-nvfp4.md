# iromu/LFM2.5-230M-openjev-NVFP4

## Resumen

LFM2.5-230M-openjev-NVFP4 es la versión cuantizada en NVFP4 (4 bits en coma flotante, W4A16) del checkpoint iromu/LFM2.5-230M-openjev, un ajuste fino por LoRA del modelo base LiquidAI/LFM2.5-230M-Base orientado a tareas de decisión tipada y clasificación. El modelo resuelve un problema muy acotado: dado un estado, una pregunta y un conjunto de opciones con una distribución de probabilidad asociada, emite la letra de la opción ganadora (argmax) como único token de respuesta. No es un modelo de propósito general, sino un clasificador generativo de etiqueta única.

El interés de este artefacto es doble. Por un lado, demuestra un flujo completo de ajuste fino supervisado con LoRA (rango 32) seguido de cuantización con NVIDIA ModelOpt y exportación a un checkpoint cargable por vLLM con `--quantization modelopt_fp4`. Por otro, documenta con transparencia el coste de esa cuantización: la coherencia probabilística medida con JevBench se mantiene prácticamente igual que en BF16 (39,1 frente a 38,5), pero la precisión de la letra emitida cae 8,6 puntos porcentuales (del 77,3 % al 68,7 %) sobre el split de validación de Open-Jev.

El modelo cuenta con 148.428.544 parámetros reales según los pesos en safetensors, un tamaño de repositorio de 0,2 GB y licencia Apache 2.0. Está pensado para despliegue en hardware de clase GB10 con memoria muy limitada, y su ventana de entrenamiento fue de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2.5 (modelo base LiquidAI/LFM2.5-230M-Base), ajustado con LoRA y cuantizado en NVFP4 W4A16 |
| Parametros totales | 148.428.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de secuencia usada en el entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos FP4, activaciones bf16); existen cuantizaciones GGUF en el repositorio hermano iromu/LFM2.5-230M-openjev-GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos FP4 empaquetados en U8, escalas por grupo F8_E4M3, escala global F32 y hf_quant_config.json); compatible con transformers |

## Arquitectura y entrenamiento

El checkpoint parte de LiquidAI/LFM2.5-230M-Base, un transformer de la familia LFM2.5, y se ajusta mediante SFT con LoRA sobre el corpus de decisión tipada ZefanCai/Open-Jev (snapshot c67699e13d0ae25e35b77165a4b6b079bedc8aba). La configuración del adaptador es rango 32, alpha 32, dropout 0,05 y módulos objetivo `*.proj`, `*.w1`, `*.w2` y `*.w3`, de modo que el ajuste alcanza tanto las proyecciones de atención como las matrices de la red feed-forward del MLP. El entrenamiento se ejecutó con NeMo-RL, entropía cruzada enmascarada al turno del asistente, precisión bfloat16, optimizador AdamW con learning rate 5e-5 y weight decay 0,01, calentamiento lineal de 100 pasos seguido de decaimiento coseno hasta 1e-6, batch global de 64 (micro batch 2) y una única época: 1191 pasos sobre 76.224 filas, con validación cada 125 pasos.

Cada fila del dataset contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre ellas; el objetivo es la opción argmax escrita como una sola letra. Las filas con empate en el argmax se excluyen del cómputo de la pérdida en lugar de entrenarse con una etiqueta inventada. La plantilla de chat de decisión actúa como contrato del modelo: renderiza el turno del asistente exactamente como su contenido (una letra de etiqueta) sin bloque de razonamiento, de forma que la respuesta es el primer token generado y el turno termina en EOS.

La cuantización se realizó con NVIDIA ModelOpt usando la configuración W4A16_NVFP4_CFG, calibrada sobre 32 filas del split de entrenamiento de Open-Jev y exportada con `export_hf_checkpoint`. Se eligió W4A16 (solo pesos) en lugar de W4A4 porque las configuraciones W4A4 emplean un cuantizador de entrada dinámico y el export no incluye un `input_scale` estático; la ruta W4A4 de vLLM lee esa escala de un tensor no inicializado y produce salidas degeneradas. W4A16 no necesita `input_scale`, lo que hace que el checkpoint cargue correctamente en vLLM. Los pesos lineales se almacenan como U8 (dos valores FP4 por byte), mientras que `lm_head` y `model.embed_tokens` permanecen en bf16.

## Capacidades

- Selección de etiqueta única: emite exactamente una letra de opción como primer token generado y termina en EOS.
- Decisión tipada y clasificación sobre un estado, una pregunta y un conjunto de opciones con distribución de probabilidad asociada.
- Generación de texto condicionada a la plantilla de chat de decisión del autor.
- Cumplimiento estricto del formato: en la validación emitió una letra en 3495 de 3495 filas (100 %).
- Capacidad multilingüe: limitada al inglés según la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; la plantilla suprime explícitamente cualquier bloque de razonamiento.
- Capacidades de visión o audio: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Clasificación de decisiones con opciones acotadas: el modelo recibe un estado, una pregunta y un conjunto de opciones, y devuelve la letra de la opción más probable. Es su caso de uso principal y para el que fue entrenado.
- Enrutamiento ligero en pipelines: usar la letra emitida como etiqueta de decisión para dirigir una petición hacia uno de varios flujos predefinidos, aprovechando que la respuesta es un único token y el turno termina en EOS.
- Despliegue en hardware de memoria muy reducida: el checkpoint NVFP4 ocupa 0,2 GB y está pensado para servir con vLLM en equipos de clase GB10, donde un modelo mayor no cabría.
- Evaluación de calibración probabilística: leyendo los logprobs de las letras de opción en la posición de respuesta se puede medir la coherencia del modelo con las leyes de probabilidad mediante JevBench, tal como documenta el autor.
- Filtrado y anotación por lotes: al ser un modelo de 148 millones de parámetros cuantizado a 4 bits, puede procesar grandes volúmenes de filas con decodificación greedy y un `max_new_tokens` mínimo.
- Referencia para flujos de cuantización: sirve como ejemplo reproducible de SFT con LoRA, cuantización con ModelOpt y servicio con vLLM usando `--quantization modelopt_fp4`, útil para validar una cadena de herramientas antes de aplicarla a modelos mayores.
- Prototipado de clasificadores generativos: permite comparar el comportamiento de un emisor de letras en BF16 y en NVFP4 sobre el mismo conjunto de validación antes de comprometerse con una variante en producción.

## Benchmarks y rendimiento

Coherencia probabilística según JevBench (suite jevbench-mini, tolerancia 0,05, temperatura 1,0), leída a través de vLLM mediante los logprobs de las letras de opción en la posición de respuesta:

| Modelo | Overall | Δ vs BF16 | REP | BAT | MEA | LOG | CHO |
|---|---|---|---|---|---|---|---|
| BF16 | 38,5 | — | 60,6 | 25,8 | 15,4 | 68,3 | 22,2 |
| NVFP4 (W4A16) | 39,1 | +0,6 | 62,8 | 28,3 | 12,0 | 75,8 | 16,7 |

REP es consistencia de representación, BAT independencia de lote, MEA coherencia de medida de probabilidad, LOG coherencia lógica y CHO coherencia de conjunto de elección; Overall es la media de las cinco.

Validación sobre el split `validation` de Open-Jev (3495 filas), decodificación greedy bajo la gramática de elección:

| Modelo | Quant | Cap | n | Letra emitida | Letra correcta | Δ correcta vs predecesor |
|---|---|---|---|---|---|---|
| LFM2.5-230M-openjev | BF16 | 384 tok | 3495 | 3495/3495 (100,0 %) | 2700/3495 (77,3 %) | (predecesor) |
| LFM2.5-230M-openjev-NVFP4 | NVFP4 (W4A16) | 384 tok | 3495 | 3495/3495 (100,0 %) | 2401/3495 (68,7 %) | −8,6 pp |

El autor señala que la coherencia JevBench del checkpoint NVFP4 está a la par del merge BF16 (39,1 frente a 38,5, dentro del intervalo de confianza de la ejecución, 37–42), mientras que la precisión de la letra cae 8,6 puntos porcentuales: la cuantización cambia qué letra elige el modelo, no si elige una. MEA es la dimensión más débil en ambas variantes. El throughput indicado es de decodificación greedy de un solo flujo, no throughput de servicio. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,2 GB; con pesos NVFP4 de 4 bits y activaciones bf16, el peso del modelo es de aproximadamente 0,1 GB, por lo que el consumo total depende sobre todo de la caché KV y del runtime de vLLM.
- GPU recomendadas: hardware de clase GB10, según la model card; no se especifican otros modelos concretos.
- GPU de consumo: por tamaño, el checkpoint cabría en cualquier GPU de consumo moderna; el autor no confirma compatibilidad con ninguna tarjeta concreta.
- Opciones de despliegue: vLLM con `--quantization modelopt_fp4` (ruta documentada y validada); el modelo base cuenta con cuantizaciones GGUF en iromu/LFM2.5-230M-openjev-GGUF para otras rutas de despliegue.
- Latencia y throughput: no disponibles. La validación se realizó con decodificación greedy de un solo flujo y un límite de 384 tokens, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-230M-openjev-NVFP4 | 148.428.544 | 4096 (entrenamiento) | NVFP4 W4A16 (safetensors) | Apache 2.0 | 68,7 % de letra correcta en validación Open-Jev |
| LFM2.5-230M-openjev (BF16) | 148.428.544 | 4096 (entrenamiento) | BF16 (safetensors) | Apache 2.0 | 77,3 % de letra correcta; coherencia JevBench 38,5 |
| LFM2.5-230M-openjev-GGUF | 148.428.544 | 4096 (entrenamiento) | GGUF | Apache 2.0 | Cuantizaciones GGUF del mismo ajuste; métricas no disponibles en la información proporcionada |
| LiquidAI/LFM2.5-230M-Base | no disponible | no disponible | no disponible | no disponible | Modelo base sin ajuste de decisión; no comparable en la tarea |

## Limitaciones y advertencias

- No es un sustituto general de modelos mayores: el autor lo declara explícitamente y su uso previsto se limita a decisión tipada, clasificación y selección de etiqueta única.
- Pérdida de precisión por cuantización: la letra correcta cae del 77,3 % al 68,7 % (−8,6 pp) respecto al merge BF16 sobre el mismo conjunto de validación.
- MEA (coherencia de medida de probabilidad) es la dimensión más débil en JevBench, con 12,0 en NVFP4 frente a 15,4 en BF16; el autor describe al emisor de letras como sobreconfiado y sin conservar la media bajo transformación.
- Riesgo de alucinación: el modelo siempre emite una letra, incluso cuando la respuesta correcta no está bien definida; la validación muestra un 100 % de emisión pero solo un 68,7 % de acierto.
- Idioma: únicamente inglés según la model card; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto: la longitud máxima de secuencia usada en el entrenamiento es de 4096 tokens; no se documenta el contexto nativo del modelo base.
- Dependencia de la plantilla: el formato de respuesta correcto depende de la plantilla de chat de decisión del autor; alterarla puede romper el contrato de un único token y EOS.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna.
- Advertencia de despliegue: debe servirse con la ruta W4A16 (`modelopt_fp4`); las configuraciones W4A4 con cuantizador de entrada dinámico producen salidas degeneradas en vLLM por falta de `input_scale` estático.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/LFM2.5-230M-openjev-NVFP4
- Modelo BF16 y tabla de validación: https://huggingface.co/iromu/LFM2.5-230M-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/LFM2.5-230M-openjev-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench: https://github.com/JevBench/jevbench
