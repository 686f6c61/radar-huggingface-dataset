# BobClawblaw/Ornith-1.5-122B-MLX-4bit

## Resumen

Ornith-1.5-122B-MLX-4bit es una conversión a 4 bits del modelo Ornith-1.5-122B (ornith-ai), una arquitectura Qwen3.5-MoE de 122.000 millones de parámetros totales con 10.000 millones activos por token (122B-A10B) que incorpora una torre de visión y se distribuye bajo licencia MIT. Esta ficha concreta no es el modelo original, sino una cuantización comunitaria publicada por el usuario BobClawblaw en formato MLX, pensada para ejecutarse en Apple Silicon con memoria unificada.

El problema que resuelve es el de hacer viable un MoE multimodal de 122B en hardware de consumo profesional de Apple: los pesos pasan de un tamaño propio de precisión completa a 65 GB en 4 bits afines con grupos de 64, lo que permite servirlo en una única máquina con un Apple M5 Ultra. La conversión se realizó con mlx-vlm 0.7.9 y se acompaña de una receta de despliegue basada en el motor nativo Metal de TensorFold, con decodificación especulativa mediante el drafter incoai/Ornith-1.5-122B-DFlash2, caché de prompt y hasta cuatro flujos concurrentes.

Es relevante ahora porque combina tres piezas poco habituales en el ecosistema abierto: un MoE multimodal de gran tamaño con licencia permisiva, un formato de cuantización de bajo nivel (4,544 bits por peso) y un stack de inferencia optimizado para Metal. La información publicada no incluye longitud de contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5-MoE) con torre de visión |
| Parametros totales | 122.562.817.776 (122B) |
| Parametros activos | 10B (designación 122B-A10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, grupo de 64, 4,544 bits por peso; routers y puertas de shared-expert en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); GGUF no disponible |
| Libreria de carga | mlx (mlx-vlm 0.7.9) |
| Modelo base | ornith-ai/Ornith-1.5-122B (revisión 346ec829dd63e107aad8771d74e885e901cec95d) |
| Pipeline | image-text-to-text |
| Tamano del repo | 69,6 GB (pesos cuantizados: 65 GB) |
| Tipo de cuantizacion | peso completo, salvo torre de visión, tokenizer y chat template, que se conservan del release original |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5: 122B parámetros totales con 10B activos por token, lo que sitúa su coste de cómputo por paso en el orden de un modelo denso de ~10B mientras mantiene la capacidad de un modelo mucho mayor. Sobre el tronco de texto se añade una torre de visión, de ahí la etiqueta image-text-to-text. La cuantización afecta al tronco y a los expertos, pero deja routers y puertas de shared-expert en 8 bits para preservar la calidad del enrutamiento, un detalle técnico relevante porque los errores de cuantización en el gate degradan la selección de expertos de forma desproporcionada.

Los detalles de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF/DPO o métodos de alineación) no están disponibles en la información proporcionada. La innovación documentada en esta ficha es de despliegue, no de entrenamiento: decodificación especulativa con el drafter DFlash2, caché de prompt y servicio de hasta cuatro flujos simultáneos sobre el motor Metal nativo de TensorFold, además de compatibilidad con mlx-vlm. El comando de conversión publicado usa dtype bfloat16 como base y cuantización afín de 4 bits con grupo de 64.

## Capacidades

- Entrada multimodal de imagen y texto con salida de texto (pipeline image-text-to-text).
- Conversación multi-turno (etiqueta conversational en el modelo base).
- Razonamiento y generación de texto heredados del tronco Qwen3.5-MoE de 122B totales y 10B activos.
- Enrutamiento MoE con routers y puertas de shared-expert preservados en 8 bits durante la cuantización.
- Decodificación especulativa soportada mediante el drafter incoai/Ornith-1.5-122B-DFlash2.
- Servicio concurrente de hasta cuatro flujos con caché de prompt en el stack TensorFold.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso, thinking mode o audio: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos escaneados en local: al aceptar imagen y texto, el modelo puede recibir capturas o páginas renderizadas y devolver texto estructurado, sin enviar el documento a una API externa, algo crítico en sectores con requisitos de confidencialidad.
- Asistencia sobre bases de código privadas: con 10B parámetros activos el coste por token es contenido, y al ejecutarse en una sola máquina el código nunca sale de la infraestructura de la organización.
- Transcripción y explotación de material gráfico (capturas de paneles, gráficos, tablas en imagen) para pipelines internos de datos, aprovechando la torre de visión incluida en el release.
- Prototipado e investigación sobre MoE multimodal: al ser una cuantización de 4,544 bits por peso, permite estudiar el impacto de la cuantización en el enrutamiento comparando contra el modelo base en precisión completa.
- Servicio de chat multi-turno con concurrencia limitada: los cuatro flujos con caché de prompt del stack TensorFold encajan en un uso de equipo pequeño o en un entorno de demostración interna.
- Evaluación de decodificación especulativa: el par modelo + drafter DFlash2 permite medir ganancias de throughput en Metal con una configuración reproducible.
- Despliegue en estaciones de trabajo Apple con memoria unificada alta, donde no hay GPU NVIDIA disponible y se necesita un modelo de gran tamaño con licencia MIT para modificar y redistribuir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al README de la receta ornith-15-122b-mlx-m5-ultra para las mediciones de latencia y throughput, pero esas cifras no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 65 GB de pesos en 4 bits, según la model card; el repositorio ocupa 69,6 GB. Hay que añadir memoria para caché KV, caché de prompt y buffers de visión, no cuantificada en la información disponible.
- Hardware de referencia: un único Apple M5 Ultra con memoria unificada, sirviendo el modelo con el motor Metal nativo de TensorFold.
- GPU NVIDIA: no hay datos publicados sobre ejecución en A100, H100 o RTX 4090; el formato es MLX y la librería declarada es mlx, orientada a Apple Silicon.
- Cabe en GPU de consumo: no en el sentido habitual (65 GB superan la VRAM de una RTX 4090 de 24 GB); sí en equipos Apple Silicon con memoria unificada igual o superior a ~96 GB, aunque el mínimo real debe cubrir pesos más caché y no está documentado.
- Opciones de despliegue: mlx-vlm 0.7.9 y TensorFold (motor Metal nativo). vLLM, llama.cpp, Ollama y TGI no están mencionados ni se distribuye GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; las mediciones están referenciadas al README de la receta.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B-MLX-4bit (esta ficha) | 122B | 10B | no disponible | 4 bits afín, grupo 64 (65 GB) | MIT | MLX, safetensors |
| ornith-ai/Ornith-1.5-122B (base) | 122B | 10B | no disponible | precisión completa del release | MIT | safetensors |
| incoai/Ornith-1.5-122B-DFlash2 | no disponible | no disponible | no disponible | drafter para decodificación especulativa | no disponible | safetensors |

No se dispone en la información proporcionada de datos de otros modelos de la misma categoría (por ejemplo, otros MoE multimodales de ~100B) que permitan una comparación de rendimiento verificable. Cualquier comparación con modelos externos requeriría benchmarks que aquí no están publicados.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: 4,544 bits por peso implican un compromiso de precisión frente al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Longitud de contexto e idiomas soportados no documentados: no se puede planificar una integración en producción que dependa de una ventana concreta o de cobertura multilingüe sin verificarlo empíricamente.
- Disponibilidad exclusiva para Apple Silicon: el formato MLX y la dependencia del motor Metal de TensorFold impiden desplegarlo en clústeres NVIDIA sin una conversión adicional no incluida.
- Conversión comunitaria: el repositorio lo publica BobClawblaw, no ornith-ai; no es una cuantización oficial y no consta validación por parte del autor del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos publicados de tasas de alucinación ni de evaluaciones de fiabilidad para esta cuantización.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Licencia MIT: permisiva para uso comercial, pero exige conservar el aviso de copyright y de licencia; conviene revisar el fichero LICENSE del modelo base antes de redistribuir.
- Requisito de memoria: 65 GB de pesos más caché dejan poco margen en configuraciones de 64 GB de memoria unificada; es necesario dimensionar por encima.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay señal de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BobClawblaw/Ornith-1.5-122B-MLX-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Drafter para decodificación especulativa: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Motor de inferencia TensorFold: https://github.com/ashhart/TensorFold
- Receta de despliegue en M5 Ultra: https://github.com/BobClawblaw/ornith-15-122b-mlx-m5-ultra
