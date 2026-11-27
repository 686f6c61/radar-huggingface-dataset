# netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-3bit

## Resumen

Qwen3.8-27B-pi-adapted-LayerFit-MLX-3bit es una cuantización de 3 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-pi-adapted, una adaptación del Qwen3.8-27B de Alibaba orientada al agente de programación «pi». La publica netprojects (Paris Michalas) y está pensada para ejecutarse en Apple Silicon, concretamente en Macs de 24 GB de memoria unificada. El modelo conserva la torre de visión en bf16, mantiene el contexto de 262K tokens del original y empaqueta la cabeza de predicción multi-token (MTP) en 8 bits.

El problema que resuelve es práctico: hacer viable un modelo de aproximadamente 28.200 millones de parámetros en equipos de consumo con memoria limitada sin degradar en exceso la calidad respecto al bf16. Para ello aplica LayerFit, una búsqueda por capas que asigna más bits a las partes del modelo más sensibles a la cuantización (bloques MLP, atención, atención lineal, embeddings y cabeza de salida) y menos a las que toleran mejor la compresión, con un presupuesto de tamaño fijo.

Es relevante para desarrolladores que quieran desplegar localmente un modelo multimodal con capacidades de agente y programación en un Mac de gama alta, sin depender de GPUs dedicadas ni de servicios en la nube. El repositorio ocupa 13,2 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5/Qwen3.8) con atención lineal y cabeza de predicción multi-token (MTP); cuantización MLX por capas (LayerFit) |
| Parametros totales | 28.206.101.232 (28,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 3 bits con receta LayerFit por capa; torre de visión en bf16; cabeza MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es una adaptación de Qwen3.8-27B realizada por harness-hub para el agente de programación «pi». La arquitectura pertenece a la familia Qwen3.5/Qwen3.8, un transformer con bloques de atención estándar y atención lineal, más una torre de visión para entrada de imagen y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa con el propio modelo como draft. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada.

La innovación técnica de esta ficha concreta es LayerFit: en lugar de aplicar el mismo número de bits a todas las capas (cuantización estándar), se mide la sensibilidad de cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) y se distribuye un presupuesto de tamaño fijo allí donde más ayuda. Según la model card, con el mismo tamaño, la cuantización estándar de 3 bits alcanza un 84,5 % de acuerdo top-1 con bf16 y un error KL de 0,1435, mientras que LayerFit 3 bits logra un 88,8 % de acuerdo y un KL de 0,0896 (un 38 % menor). La receta exacta de bits está en `layerfit-recipe.json` del repositorio. La evaluación se hizo solo con pesos de lenguaje, contra una fusión bf16 del modelo base, con pasajes en inglés, otros idiomas, código, tool calls y matemáticas.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Entrada de imagen (pipeline image-text-to-text) mediante torre de visión conservada en bf16.
- Programación y generación de código, con adaptación específica al agente «pi».
- Tool calling / function calling: la model card reporta 3/3 en pruebas de tool call y coding.
- Modo de razonamiento (thinking): reporta 2/2 en pruebas de thinking.
- Predicción multi-token (MTP) para decodificación especulativa usando el propio modelo como borrador.
- Capacidades de agente y razonamiento multi-paso (etiqueta «agent»).
- Matemáticas: 45/50 en GSM8K-50 con thinking desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de programación local en Mac: integrado como agente «pi» o mediante mlx-lm, el modelo puede generar y revisar código en un equipo de 24 GB sin GPU dedicada, gracias a la cuantización de 3 bits y a la ventana de 262K tokens para manejar repositorios grandes.
- Automatización de tool calling en pipelines de CI/CD: el modelo soporta function calling y puede invocarse desde scripts para tareas como generar parches, resumir fallos de test o consultar APIs internas.
- Análisis de imágenes en local: al conservar la torre de visión, puede describir capturas, diagramas o interfaces y responder preguntas sobre ellos sin enviar datos a la nube.
- Razonamiento multi-paso con thinking: útil para depuración de problemas complejos o planificación de tareas donde conviene que el modelo exponga su cadena de razonamiento antes de responder.
- Prototipado rápido en portátiles Apple Silicon: con 13,1 GB en disco y carga mediante LM Studio o mlx-vlm, sirve para validar ideas de agentes y asistentes antes de pasar a infraestructura mayor.
- Generación de documentación técnica y explicaciones de código: el contexto de 262K permite pasar ficheros completos o varios módulos y pedir resúmenes o comentarios.
- Decodificación especulativa con MTP: en escenarios de baja latencia, usar la cabeza MTP como draft acelera la generación en el mismo equipo.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 45/50 |
| Tool call y coding | 3/3 (pass) |
| Thinking | 2/2 (pass) |
| Acuerdo top-1 con bf16 (LayerFit 3-bit) | 88,8 % |
| Error KL frente a bf16 (LayerFit 3-bit) | 0,0896 |
| Acuerdo top-1 con bf16 (3-bit estándar) | 84,5 % |
| Error KL frente a bf16 (3-bit estándar) | 0,1435 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo; la model card remite a la del modelo base para los resultados del editor.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,1 GB en disco; pensado para Macs de 24 GB de memoria unificada, dejando margen para macOS y prompts largos.
- GPU recomendadas: Apple Silicon (serie M) con 24 GB o más de memoria unificada. No está pensado para GPUs NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en Macs de 24 GB; existe una variante de 2 bits (9,1 GB, solo texto) para 16 GB y una de 2,5 bits (11,5 GB) como opción ajustada para 16 GB.
- Opciones de despliegue: mlx-lm (texto), mlx-vlm (imagen-texto), LM Studio; formato MLX estándar.
- Latencia y throughput: no disponibles. La model card menciona la decodificación especulativa con MTP como vía para acelerar la generación, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-LayerFit-MLX-3bit (este) | 28,2 B | 262K | 3 bits LayerFit, MLX | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-pi-adapted (base) | 27 B (aprox., segun nombre) | 262K | bf16 (original) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-pi-adapted LayerFit MLX 4-bit | 28,2 B | 262K | 4 bits LayerFit, MLX | Apache-2.0 | Hugging Face (16,5 GB, Macs de 32 GB) |
| Qwen3.8-27B-pi-adapted MLX 6-bit / 8-bit | 28,2 B | 262K | 6/8 bits estándar, MLX | Apache-2.0 | Hugging Face (Macs de 48 GB o más) |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización de 3 bits introduce degradación respecto a bf16: el acuerdo top-1 es del 88,8 %, no del 100 %; para tareas sensibles conviene usar las variantes de 4, 6 u 8 bits.
- El modelo está diseñado para Apple Silicon y el formato MLX; no es directamente utilizable en CUDA, vLLM o llama.cpp sin conversión.
- El contexto de 262K es teórico: en un Mac de 24 GB los prompts muy largos pueden agotar la memoria; la propia model card recomienda mantener prompts de pocos miles de tokens en configuraciones ajustadas.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación; se debe evaluar en el dominio de uso antes de producción.
- Es una adaptación de terceros (harness-hub) sobre Qwen3.8-27B y una cuantización posterior (netprojects); no está afiliada a Alibaba Cloud ni al equipo Qwen, por lo que la garantía de calidad recae en los publicadores.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar LICENSE y NOTICE del repositorio; LayerFit es una marca registrada de NetProjects.
- La cabeza MTP está cuantizada a 8 bits; su uso como draft puede no reproducir exactamente el comportamiento del bf16 original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Variante 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2bit
- Variante 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2.5bit
- Variante 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-4bit
- Variante 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Variante 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Otros modelos del publicador: https://huggingface.co/netprojects
- Sitio del publicador: https://netprojects.com
