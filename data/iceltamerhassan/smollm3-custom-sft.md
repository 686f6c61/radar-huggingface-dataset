# iceltamerhassan/SmolLM3-Custom-SFT

## Resumen

SmolLM3-Custom-SFT es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM3-3B-Base, publicado por el usuario iceltamerhassan en Hugging Face. Se trata de un derivado comunitario, no de un modelo oficial de Hugging Face, entrenado con la librería TRL (versión 1.17.1) y el stack de Transformers 5.22.2, PyTorch 2.14.1+cu130 y Datasets 5.1.0. El repositorio ocupa 0,1 GB, lo que sugiere pesos en precisión reducida o un subconjunto de los mismos, aunque este dato no se confirma en la model card.

El modelo hereda la arquitectura y el tamaño del base SmolLM3-3B (aproximadamente 3.000 millones de parámetros), pero la model card no documenta ni el dataset de entrenamiento, ni el número de tokens, ni la receta de hiperparámetros, ni los idiomas soportados. Esta ausencia de información es relevante para cualquier evaluación: el ajuste puede haber alterado el comportamiento del base de forma no trivial y sin trazabilidad.

Su relevancia es limitada y fundamentalmente experimental. Al no contar con descargas ni valoraciones, y al carecer de benchmarks publicados, debe tratarse como un artefacto de investigación reproducible con TRL más que como un modelo listo para producción. La ficha que sigue recoge lo que la información disponible permite afirmar y marca explícitamente como "no disponible" todo aquello que no se ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B-Base; no detallada en la model card) |
| Parametros totales | Aproximadamente 3.000 millones (heredados del base SmolLM3-3B-Base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye un campo "licence: license" sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del base SmolLM3-3B-Base, que a su vez es un transformer decoder-only de aproximadamente 3.000 millones de parámetros. La model card no especifica la arquitectura interna del base (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o híbrida), por lo que no es posible confirmar detalles más allá de lo que corresponde a la familia SmolLM3. Tampoco se documenta si el ajuste ha modificado la ventana de contexto original.

El entrenamiento se realizó con TRL 1.17.1 en modo SFT, sobre un dataset no identificado y con hiperparámetros no publicados. No hay información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF o DPO posterior, ni sobre técnicas auxiliares como decodificación especulativa o destilación. La única referencia técnica reproducible es el framework: TRL, Transformers, PyTorch y Datasets, con las versiones indicadas en la model card.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo de uso con `pipeline("text-generation")` y formato de mensajes `[{"role": "user", "content": ...}]`, lo que indica que el ajuste SFT adapta el base a un formato de chat.
- Razonamiento y respuesta a preguntas abiertas: el ejemplo de la model card plantea una pregunta hipotética abierta, lo que sugiere entrenamiento orientado a instrucciones generales.
- Capacidades de código, matemáticas o visión: no documentadas; no hay evidencia en la información disponible de que el ajuste las preserve o las potencie.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales: el modelo puede cargarse con `transformers.pipeline` y `device_map="auto"` para probar rápidamente un asistente de chat sobre el formato de mensajes que emplea el ajuste, útil en fases de exploración antes de elegir un modelo definitivo.
- Experimentación académica con SFT: sirve como referencia reproducible de un pipeline TRL completo (versiones de TRL, Transformers y PyTorch documentadas) para comparar recetas de ajuste fino sobre SmolLM3-3B-Base.
- Generación de texto en entornos con recursos moderados: al partir de un modelo de aproximadamente 3.000 millones de parámetros, es viable en GPU de consumo para tareas de generación de texto no crítica, siempre que se valide antes la calidad del ajuste.
- Evaluación comparativa de derivados comunitarios: útil para estudiar cómo un SFT no documentado altera el comportamiento del base en tareas de instrucción, midiendo regresiones respecto al modelo original.
- Base para un segundo ajuste: puede emplearse como punto de partida para un SFT adicional con datos propios, dado que ya está en formato de chat y es compatible con el ecosistema Transformers/TRL.
- Demostraciones y docencia: adecuado para ilustrar el flujo completo de publicación de un modelo ajustado en Hugging Face, incluida la generación automática de la model card por `Trainer`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que la model card no documenta la precisión de los pesos publicados. Como referencia orientativa para un modelo de aproximadamente 3.000 millones de parámetros: en fp16 rondaría los 6-7 GB de VRAM, y en cuantizaciones de 8 y 4 bits bajaría aproximadamente a 3-4 GB y 2-3 GB respectivamente. Estas cifras son estimaciones por tamaño, no medidas sobre este repositorio.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una GPU con 8-16 GB de VRAM (RTX 4070, RTX 4080, RTX 4090, A10, L4) sería suficiente para inferencia en fp16; A100 o H100 aportarían margen para lotes mayores y contexto largo.
- GPU de consumo: probablemente sí cabe en tarjetas de 8 GB o más en cuantización de 4-8 bits, aunque no se ha verificado sobre este checkpoint.
- Opciones de despliegue: Transformers con `pipeline` y `device_map="auto"` (documentado en la model card). vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo; su viabilidad dependería de la compatibilidad con la arquitectura del base SmolLM3-3B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| iceltamerhassan/SmolLM3-Custom-SFT | ~3.000 M | No disponible | No disponible | Hugging Face, 0 descargas | SFT comunitario sin documentación de datos ni benchmarks |
| HuggingFaceTB/SmolLM3-3B-Base | ~3.000 M | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face (modelo base oficial) | Modelo base sin ajuste de instrucciones; referencia directa del anterior |
| andregustavo/SmolLM3-Custom-SFT | ~3.000 M | No disponible | No disponible | Hugging Face | Otro SFT comunitario del mismo base con TRL; misma falta de documentación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación del dataset de entrenamiento: no es posible evaluar sesgos, calidad de los datos ni riesgo de contaminación.
- Riesgo de alucinación: no cuantificado; al ser un SFT sobre un base de 3.000 millones de parámetros sin benchmarks, no hay evidencia de mitigación.
- Idiomas: no se declara ninguno; no debe asumirse soporte multilingüe ni siquiera para castellano.
- Licencia: el campo de licencia de la model card está vacío ("licence: license"). No se puede confirmar el uso comercial; debe contactarse con el autor o tratarse como no autorizado para producción hasta aclararlo.
- Contexto: la longitud de contexto no está documentada y el ajuste podría haberla reducido respecto al base.
- Madurez: 0 descargas y 0 valoraciones; sin validación externa de calidad.
- Compatibilidad: las versiones de Transformers (5.22.2) y PyTorch (2.14.1+cu130) indicadas son inusualmente altas y podrían no corresponder a entornos estables actuales; conviene verificar la carga del checkpoint antes de integrarlo.
- Producción: no recomendado como modelo de producción sin una evaluación propia exhaustiva y una aclaración formal de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iceltamerhassan/SmolLM3-Custom-SFT
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Repositorio de TRL: https://github.com/huggingface/trl
- Curso de ajuste fino de SmolLM3 (Hugging Face): https://huggingface.co/learn/smol-course/unit1/3
- Derivado comunitario comparable: https://huggingface.co/andregustavo/SmolLM3-Custom-SFT
