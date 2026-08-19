# Luciss007/frontier-forge-r1b

## Resumen

Frontier Forge R1b es un modelo de lenguaje derivado de Qwen/Qwen3.5-4B-Base, post-entrenado mediante QLoRA para transformar narrativas de quejas de consumidores del CFPB (Oficina de Protección Financiera del Consumidor de EE. UU.) junto con metadatos de origen en un ticket de triaje estructurado y una única llamada a herramienta. El modelo está diseñado como artefacto de investigación para experimentos reproducibles de post-entrenamiento, despliegue y pasarelas LLM, no como sistema de decisión para consumidores.

Desarrollado por Luciss007, el modelo se publica en HuggingFace con tres variantes de pesos (BF16, GPTQ-int4 y BF16 con tensores MTP preservados). Su relevancia actual radica en demostrar cómo un modelo pequeño (4B) puede alcanzar una alta precisión en tareas de salida estructurada y tool calling, con un coste de entrenamiento inferior a 5 dólares en hardware de consumo, y en servir como banco de pruebas para técnicas como decodificación especulativa nativa (MTP) y cuantización GPTQ.

La arquitectura base es un transformer de 4B parámetros, con una ventana de contexto no especificada en la documentación. El modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B-Base) |
| Parametros totales | no disponible (base: ~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GPTQ-int4 (group size 128), entrenamiento con NF4 QLoRA |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (presumiblemente safetensors, dado el uso de transformers) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint pretrained-only de Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`). Se aplicó un fine-tuning supervisado (SFT) de una sola época sobre 20.000 ejemplos generados determinísticamente mediante reglas, con etiquetas de triaje (producto, problema, empresa, urgencia, bandera de ambigüedad y una llamada a herramienta entre cinco opciones). El conjunto de entrenamiento está disjunto de los conjuntos de evaluación TEST-IID y TEST-DRIFT, verificados mediante una auditoría de contaminación de 13 tokens.

El entrenamiento usó QLoRA con cuantización NF4, rango 16, alpha 32 y dropout 0, aplicado a las proyecciones de atención y MLP, excluyendo el subárbol visual. La precisión de cómputo fue BF16 para evaluación. El coste total fue de 15,2358 horas GPU en una RTX 4090 (a 0,30 $/hora), lo que suma 4,57 dólares.

Una innovación técnica destacable es la preservación de los tensores nativos MTP (Multi-Token Prediction) del modelo base en la variante `bf16-mtp-preserved/`, que permite decodificación especulativa nativa en vLLM. La cuantización GPTQ-int4 se realizó como paso de despliegue independiente, no como representación de entrenamiento.

## Capacidades

- Generación de salida JSON estricta con esquema fijo: normaliza `product`, `issue`, `company`, `urgency`, `ambiguity_flag` y una única `tool_call`.
- Tool calling restringido a cinco herramientas: `request_more_info`, `close_no_action`, `escalate_to_regulator`, `start_refund_workflow` y `route_to_company`.
- Manejo de entradas estructuradas JSON con cinco campos (identificador de queja, narrativa, producto, problema y empresa de origen).
- Especialización en triaje de quejas financieras de consumidores, siguiendo la taxonomía del CFPB en inglés.
- Compatible con decodificación especulativa nativa (MTP) para acelerar la inferencia en vLLM.
- Soporte de cuantización GPTQ-int4 para despliegue eficiente en memoria.

## Casos de uso

- Triaje automatizado de quejas de consumidores: el modelo recibe la narrativa y metadatos de una queja CFPB y genera un ticket estructurado con urgencia, ambigüedad y una acción recomendada (escalado, reembolso, cierre, etc.), listo para revisión humana.
- Investigación en post-entrenamiento con datos etiquetados por reglas: permite estudiar el escalado de etiquetas sintéticas, la fidelidad a políticas versionadas y la transferencia a conjuntos con deriva (TEST-DRIFT).
- Evaluación de cuantización y despliegue: las variantes BF16, GPTQ-int4 y MTP permiten comparar el impacto de la cuantización y la decodificación especulativa en precisión, latencia y uso de memoria en una tarea de salida estructurada.
- Desarrollo de pasarelas LLM conscientes del modelo: el repositorio asociado documenta un gateway en C++ con sobrecarga mínima (0,3-0,5% en p50/p95), útil para experimentos de control de admisión y gestión de errores.
- Benchmark de generación restringida: el esquema JSON estricto y la validación de llamadas a herramienta sirven como caso de prueba para técnicas de generación guiada (constrained generation) en vLLM u otros motores.
- Estudio de coste-eficacia en modelos pequeños: con un entrenamiento de menos de 5 dólares y una inferencia a 0,02 dólares por 1.000 tareas, el modelo ejemplifica la frontera coste-calidad para tareas de triaje estructurado.

## Benchmarks y rendimiento

La evaluación congelada usa 1.000 ejemplos TEST-IID y 1.000 TEST-DRIFT, con una métrica principal que es un AND estricto sobre urgencia, ambigüedad, elección de herramienta y validez estructural de los argumentos de la herramienta. La normalización de producto/problema/empresa es secundaria y se excluye de la puntuación de éxito.

| Metrica | Resultado |
|---|---:|
| Task success | 99,05% |
| IC bootstrap 95% | [98,60%, 99,45%] |
| Schema validity | 100,00% |
| Tool accuracy | 99,15% |
| Ganancia pareada sobre R1 (1.450 filas) | +32,70 pp [30,60, 34,50] |

Los intervalos se calcularon con 1.000 remuestreos bootstrap de semilla fija sobre 2.000 ejemplos congelados. La verdad de referencia es la política de reglas versionada, no etiquetas semánticas humanas independientes.

En cuanto a mediciones de servicio, en una RTX 4090 con vLLM 0.17.0, MTP nativo, 4 QPS de llegadas Poisson de semilla fija y 20 peticiones medidas, la variante `bf16-mtp-preserved/` registró:

- Latencia E2E p50/p95: 1,063 / 1,311 segundos
- Throughput de salida: 320,6 tokens/segundo
- Éxito del verificador: 95% (19/20)
- Memoria pico del dispositivo: 21.587 MiB
- Coste: 0,0202 $ por 1.000 tareas con verificación exitosa a 0,30 $/GPU-hora

## Requisitos de hardware

- VRAM estimada para inferencia: la medición en BF16 con MTP alcanzó un pico de 21.587 MiB en una RTX 4090 (24 GB). La variante GPTQ-int4 requerirá significativamente menos memoria, aunque no se proporciona un valor exacto.
- GPU recomendadas: RTX 4090 (usada en las pruebas), y por extensión cualquier GPU con al menos 24 GB de VRAM para la variante BF16. Para GPTQ-int4, una GPU con 8-12 GB podría ser suficiente, pero no está verificado.
- Sí cabe en GPU de consumo: la RTX 4090 es una GPU de consumo y el modelo se ejecuta en ella con margen (pico de 21,5 GB sobre 24 GB).
- Opciones de despliegue: vLLM (probado con versión 0.17.0), y presumiblemente llama.cpp u Ollama para las variantes cuantizadas, aunque no se documenta explícitamente.
- Latencia y throughput: con 4 QPS y MTP, se observaron p50/p95 de 1,063/1,311 segundos y 320,6 tokens/segundo de salida. El MTP nativo pierde frente a la línea base a 0,25 QPS pero gana a 0,50, 1, 2 y 4 QPS, con tasas de aceptación del 95,6-96,4%.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de triaje estructurado en la información proporcionada. Como referencia, el modelo base Qwen3.5-4B-Base es un transformer de 4B parámetros sin fine-tuning específico, por lo que Frontier Forge R1b supera ampliamente a su base en la tarea de triaje (99,05% de éxito frente a un rendimiento no especificado). Tampoco se ofrecen datos comparativos con otros modelos de tamaño similar (p. ej., Llama 3.2 3B, Phi-3.5 mini) para esta tarea concreta. Se recomienda consultar el repositorio GitHub asociado para posibles análisis adicionales.

## Limitaciones y advertencias

- La auditoría humana estratificada de 200 filas encontró una tasa de etiquetas incorrectas del 14% en la política de reglas, incluidos falsos negativos de escalado y reembolso. La alta puntuación del modelo refleja fidelidad a esas reglas, no necesariamente corrección semántica real.
- Las reglas de palabras clave son ciegas a la negación: frases como "no quiero escalar" pueden interpretarse incorrectamente.
- La taxonomía de acción única prioriza el escalado sobre el reembolso cuando ambos disparadores aparecen, lo que puede no ser la decisión óptima.
- El modelo está diseñado para una tarea muy específica (triaje de quejas CFPB en inglés) y no debe usarse fuera de ese dominio sin una nueva evaluación.
- No debe utilizarse para acciones autónomas regulatorias, crediticias, legales, de reembolso o de cuentas; requiere supervisión humana.
- No debe presentarse como un clasificador de productos sin fugas de metadatos: los metadatos de origen son visibles para el modelo por diseño.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido. Se recomienda contactar al autor antes de cualquier uso en producción.
- La variante con gateway C++ tiene un defecto conocido en condiciones de sobrecarga: los errores eran peticiones admitidas que devolvían HTTP 502 en lugar de rechazos 429 diseñados. Las celdas no estables mostraron tasas de error del 10-85% frente al 0% de vLLM desnudo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luciss007/frontier-forge-r1b
- Repositorio GitHub del proyecto: https://github.com/LucisZhang/frontier-forge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
