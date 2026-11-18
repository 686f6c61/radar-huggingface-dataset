# LCW2332/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen
DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "decensored" (tambien etiquetada como abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". Lo publica el usuario LCW2332 en Hugging Face y emplea la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo del modelo original mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 16 a 32.

El modelo resuelve el problema de disponer de un modelo compacto de 4B parametros con capacidad de razonamiento estructurado en matematicas y STEM, pero sin los filtros de rechazo del modelo base. Es relevante para quienes necesitan un modelo pequeno, desplegable en hardware modesto, que no bloquee peticiones por politicas de contenido y que mantenga el patron de razonamiento multi-paso aprendido por destilacion.

La arquitectura subyacente es la de Qwen3.5 (transformer denso, tag `qwen3_5`), con 4.539.265.536 parametros totales segun los pesos en safetensors, licencia Apache 2.0 y soporte declarado para ingles, chino, coreano, japones, espanol y ruso. El repo ocupa 9,3 GB y esta pensado para su uso con transformers y text-generation-inference.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; el autor no detalla GGUF ni otras) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer denso de la familia Qwen3.5 con aproximadamente 4,54 mil millones de parametros. El modelo base (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) se entreno mediante destilacion: se generaron respuestas con DeepSeek-V4-Pro en modo "Max Effect" y se uso un conjunto de aproximadamente 250.000 muestras centradas en matematicas y STEM, siguiendo el mismo pipeline que la version de 9B. El entrenamiento es de tipo SFT (supervised fine-tuning) sobre el modelo Qwen3.5-4B, con etiquetas que incluyen `reasoning`, `distillation`, `sft`, `mtp`, `math` y `stem`.

Sobre esa base, esta variante aplica Heretic v2.0.0 con parametros ARA concretos: `start_layer_index` 16, `end_layer_index` 32, `preserve_good_behavior_weight` 0.9854, `steer_bad_behavior_weight` 0.0002, `overcorrect_relative_weight` 0.6587 y `neighbor_count` 10. La ablacion actua sobre las capas 16 a 32 para suprimir la direccion de rechazo preservando el comportamiento util. El autor reporta una divergencia KL de 0.0378 respecto al modelo original y una reduccion de rechazos de 99/100 a 5/100. La etiqueta `mtp` sugiere soporte de multi-token prediction, evaluado en Q8 segun la model card.

## Capacidades
- Generacion de texto y razonamiento multi-paso con descomposicion explicita de problemas, heredado de la destilacion de DeepSeek-V4-Pro.
- Razonamiento matematico y STEM reforzado por el conjunto de aproximadamente 250.000 muestras de entrenamiento.
- Generacion de codigo y resolucion de problemas tecnicos (etiquetas `reasoning`, `math`, `stem`).
- Capacidades multimodales declaradas en los tags (`image-text-to-text`), aunque la model card no detalla el modulo de vision.
- Soporte multilingue para ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento "decensored": baja tasa de rechazos (5/100 segun el autor) frente al 99/100 del modelo original.
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference.
- No se documenta explicitamente soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso
- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso y mostrar la descomposicion intermedia, util en herramientas educativas o de verificacion de calculos, gracias al entrenamiento sobre ~250.000 muestras de matematicas.
- Analisis STEM en entornos de investigacion: para explorar hipotesis, derivar formulas o explicar conceptos cientificos con cadenas de razonamiento explicitas, aprovechando la destilacion de un profesor fuerte.
- Generacion de codigo en pipelines locales: al ser un modelo de 4B desplegable en GPU de consumo, puede integrarse en asistentes de programacion autoalojados o en tareas de CI/CD que requieran generacion de fragmentos de codigo.
- Procesamiento de documentacion tecnica multilingue: con soporte para seis idiomas, sirve para resumir o traducir documentacion tecnica entre ingles, chino, espanol, ruso, japones y coreano.
- Investigacion sobre alineacion y seguridad: la variante heretic permite estudiar el efecto de la ablacion de la direccion de rechazo (KL 0.0378, rechazos 5/100) en un modelo pequeno, como caso de estudio de desalineacion controlada.
- Prototipado rapido en hardware modesto: con 4,54B parametros y pesos safetensors, es adecuado para experimentar con razonamiento y generacion en una sola GPU de consumo antes de escalar a modelos mayores.
- Aplicaciones donde el filtrado de contenido es indeseado por el investigador: entornos de red teaming o generacion de escenarios adversarios controlados, siempre bajo supervision y con las advertencias legales oportunas.

## Benchmarks y rendimiento
La unica metrica publicada en la informacion disponible es la comparacion de rechazos y divergencia KL frente al modelo original:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0.0378 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP16/BF16 los 4,54B parametros requieren aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits unos 4,5-5 GB y en 4 bits unos 2,5-3 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue en BF16 con contexto largo; RTX 4090 o RTX 3090 para BF16 en una sola tarjeta; RTX 4070/4080 o GPUs con 8-12 GB para cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion, y en 16 GB o mas en BF16.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`); llama.cpp, Ollama o vLLM no se mencionan en la informacion disponible, aunque al ser pesos safetensors de un transformer estandar seria posible convertirlos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic) | 4,54B | no disponible | Apache 2.0 | Variante decensored con Heretic v2.0.0; rechazos 5/100 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4B (clase) | no disponible | no disponible | Modelo base destilado; rechazos 99/100 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9B (clase) | no disponible | no disponible | Version mayor del mismo pipeline heretic |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | 4B (clase) | no disponible | no disponible | Fine-tune cientifico basado en este modelo |

## Limitaciones y advertencias
- La ablacion de rechazos elimina filtros de seguridad: el modelo puede generar contenido danino, ilegal o sensible sin bloquearlo, lo que exige supervision humana y filtros externos en produccion.
- Riesgo de alucinacion inherente a un modelo de 4B destilado; el razonamiento multi-paso puede contener errores propagados con apariencia de solidez.
- La divergencia KL de 0.0378 respecto al original indica que la ablacion altera la distribucion de salida; puede degradar sutilmente capacidades no relacionadas con el rechazo.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Capacidad multimodal declarada en tags pero no documentada en la model card; no asumir soporte de vision sin validacion.
- Uso comercial permitido por Apache 2.0, pero la responsabilidad legal sobre el contenido generado recae en el desplegador; conviene revisar las politicas de la plataforma de destino.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria ni reportes independientes de calidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse en arquitecturas agenticas sin pruebas.

## Enlaces
- Hugging Face: https://huggingface.co/LCW2332/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Version 9B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune cientifico derivado: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic: https://heretic-project.org
