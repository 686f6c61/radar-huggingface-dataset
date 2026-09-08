# Davd-b01/transductor-mid-v3

## Resumen

Transductor TC Mid es un modelo de lenguaje de 2.7B parámetros desarrollado por Davd-b01, especializado en transformar trazas de razonamiento largas y verbosas producidas por modelos más potentes en trazas cortas, pedagógicas y de un solo camino. No es un modelo de chat: su salida está pensada para ser parseada y almacenada como datos de entrenamiento, en el formato `<tc_think>` y `<tc_answer>`. Está construido sobre el modelo base LiquidAI/LFM2.5-2.6B, una arquitectura híbrida de convolución y atención con 30 capas y una ventana de contexto de 6144 tokens.

El modelo resuelve el problema de la condensación de razonamiento: reduce la longitud de las trazas sin perder sustancia, manteniendo los números, identificadores y el veredicto literalmente copiados de la entrada. Esto lo hace útil para destilación, generación de datasets de entrenamiento y mejora de instrucciones en pipelines de SFT.

Se publica en HuggingFace con pesos completos en BF16, tras un proceso de SFT con rsLoRA y una alineación SimPO ligera. Es la variante "Mid" de una familia de tres niveles (Mid, High, XHigh), diferenciados por la profundidad y longitud de las trazas generadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de convolución y atención (30 capas) |
| Parametros totales | 2.697.198.592 (~2.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 6144 tokens |
| Tipos de cuantizacion | BF16 (pesos completos), FP8 opcional (script de cuantización) |
| Idiomas soportados | Inglés (principal); otros idiomas dependen del modelo base |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (model.safetensors), tokenizer y config.json |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B, una arquitectura híbrida que combina capas de convolución y atención en 30 capas. Sobre esta base se aplicó un SFT con rsLoRA (r32/a64) en 9 proyectores: atención (q/k/v/out), FFN (w1/w2/w3) y convolución (in/out), sin tocar lm_head. El entrenamiento usó 1.159 filas de entrenamiento y 61 de validación, durante aproximadamente 2 épocas, con una longitud máxima de secuencia de 6144 tokens. Las pérdidas reportadas son train_loss 3.108 y eval_loss 0.268.

Posteriormente se realizó una alineación SimPO reference-free usando TRL CPOConfig, con beta 2.0, gamma 0.8, lr 8e-7 y 1 época. El conjunto de alineación fue muy pequeño: 11 pares de entrenamiento y 1 de validación, en 2 pasos, con train_loss 1.309. Finalmente se fusionaron los pesos del SFT y el delta de SimPO sobre el modelo base para producir el repositorio final. La model card indica que el efecto de SimPO es ligero y que el comportamiento principal lo determina el SFT.

## Capacidades

- Generación de trazas de razonamiento condensadas en formato `<tc_think>` y `<tc_answer>`, listas para ser parseadas como datos de entrenamiento.
- Reexpresión de razonamiento: no resuelve problemas ni añade hechos; copia el `<tc_final>` de la entrada literalmente en `<tc_answer>`.
- Procesamiento de entrada de cuatro ranuras (TCS-IN): `<tc_meta>`, `<tc_task>`, `<tc_trace>` y `<tc_final>` en un único mensaje de usuario.
- Soporte de niveles de pensamiento diferenciados: Mid (este), High y XHigh, con distintas longitudes de traza y estilos de razonamiento.
- Puede procesar trazas que incluyen llamadas a herramientas, aunque no es un modelo de chat ni ejecuta herramientas por sí mismo.
- Capacidades multilingües limitadas: entrenado principalmente en inglés, el resto de idiomas dependen del prior del modelo base.
- No es un modelo conversacional: el uso directo como chat produce resultados pobres.

## Casos de uso

- Generación de datasets de razonamiento para SFT: el modelo convierte trazas largas de un modelo fuerte en trazas condensadas listas para entrenar modelos más pequeños. Se alimenta el bloque TCS-IN con la traza original y el `<tc_final>` correcto, y se parsea la salida para obtener `<tc_think>` y `<tc_answer>`.
- Destilación de conocimiento: al producir trazas pedagógicas de 120–450 palabras, permite destilar el razonamiento de modelos grandes en explicaciones concisas que pueden usarse como ejemplos few-shot o como datos de alineación.
- Mejora de instrucciones para agentes: el modelo puede procesar trazas que incluyen llamadas a herramientas y reexpresarlas como un único camino directo, útil para generar ejemplos de uso de herramientas en datasets de agentes.
- Documentación técnica automatizada: dada una solución larga a un problema matemático o de código, el modelo genera una explicación paso a paso clara, que puede integrarse en sistemas de documentación o tutoría.
- Rejection sampling en pipelines de entrenamiento: se puede usar en bucle con temperatura 0.8 y hasta 5 intentos, filtrando las salidas que pasan las validaciones (longitud, ausencia de fugas, copia literal de números), para obtener trazas de alta calidad.
- Investigación en alineación: al ser un modelo pequeño con SFT y SimPO, sirve como caso de estudio para analizar cómo estas técnicas afectan la longitud y estructura de las trazas de razonamiento.
- Generación de datos de verificación: aunque no verifica, se puede usar para producir múltiples trazas candidatas de una misma entrada y compararlas, ayudando a detectar inconsistencias en el razonamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan ~5.1 GB; con activaciones y KV cache para 6144 tokens, se recomienda una GPU de al menos 24 GB para inferencia cómoda. FP8 es una optimización opcional de throughput en lote.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 40GB, H100 80GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 y similares con 24 GB.
- Opciones de despliegue: vLLM 0.19 con `--dtype bfloat16 --enable-prefix-caching --max-model-len 6144`; también transformers con `device_map="auto"`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Voz | Longitud de pensamiento | Uso |
|---|---|---|---|
| transductor-mid-v3 (este) | Un camino directo, pedagógico | 120–450 palabras (mediana 310) | Enseñanza, instrucciones, diálogo con estado |
| transductor-high-v3 | Prueba formal + verificación independiente | 400–850 palabras (mediana 560) | Pruebas formales que necesitan doble verificación |
| transductor-xhigh-v3 | Deliberación en 4 fases | 750–2400 palabras (mediana 965) | Matemáticas difíciles que necesitan explorar/derivar/verificar/probar límites |

No se han publicado benchmarks comparativos entre estas variantes. El modelo base LiquidAI/LFM2.5-2.6B es el punto de partida, pero no es un transductor de trazas, por lo que no es directamente comparable en tarea.

## Limitaciones y advertencias

- Requiere el formato TCS-IN de cuatro ranuras y el prompt de sistema canónico (`sp_transductor_mid.txt`); el uso como chat directo produce resultados pobres.
- Reexpresa, no verifica: un `<tc_final>` incorrecto genera una traza fluida pero incorrecta. Se debe validar el veredicto de forma independiente para matemáticas y código.
- Entrenado mayormente en inglés; otros idiomas dependen del prior del modelo base y pueden tener peor rendimiento.
- La alineación SimPO se entrenó con solo 11 pares, por lo que su efecto es ligero; el comportamiento lo domina el SFT.
- Quirk conocido: `tokenizer_config.json` declara `"tokenizer_class": "TokenizersBackend"`, que solo existe en transformers>=5, mientras que vLLM 0.19 necesita transformers<5. Hay que parchear el snapshot local a `"PreTrainedTokenizerFast"`.
- No confiar en `/health` de un servidor para comprobar disponibilidad; se debe probar con una generación real de 1 token.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Davd-b01/transductor-mid-v3
- Variante High: https://huggingface.co/Davd-b01/transductor-high-v3
- Variante XHigh: https://huggingface.co/Davd-b01/transductor-xhigh-v3
- Modelo base LiquidAI/LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
