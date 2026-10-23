# celsen/Pusula-1.5B-adapter

## Resumen

Pusula-1.5B-adapter es un adaptador LoRA publicado por el usuario celsen sobre el modelo instructivo Qwen/Qwen2.5-1.5B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (adapter_config.json + safetensors) que debe cargarse junto con el modelo base para funcionar. Su propósito declarado es el ajuste del modelo al idioma turco, según el único dato disponible en la model card, que además enlaza una versión ya fusionada (celsen/Pusula-1.5B).

El adaptador se entrenó con QLoRA, con rango r=16, aplicado a todas las capas lineales del transformer y durante 3 épocas. Sobre esa configuración no se especifican el dataset, el volumen de tokens, la composición de los datos ni si hubo etapas de alineación adicionales (RLHF/DPO), por lo que la trazabilidad del ajuste es muy limitada. El repositorio ocupa aproximadamente 0,1 GB y se distribuye con licencia Apache 2.0.

La relevancia práctica del artefacto es doble: por un lado, ejemplifica el flujo habitual de adaptación lingüística de un modelo pequeño (1,5B parámetros) mediante PEFT; por otro, al estar basado en Qwen2.5, hereda una arquitectura densa con 32.768 tokens de contexto y un tokenizador multilingüe, lo que permite desplegarlo en hardware modesto. No obstante, en el momento de redactar esta ficha el repositorio no cuenta con descargas ni valoraciones, y no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder denso Qwen2 con RoPE, GQA, SwiGLU y RMSNorm |
| Parámetros totales | 1.500 millones en el modelo base; número exacto de parámetros del adaptador no disponible (repositorio de ~0,1 GB) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; extensible a 131.072 con YaRN según la documentación de Qwen2.5 |
| Tipos de cuantización | El adaptador se distribuye en safetensors (precisión nativa PEFT). Para cuantizar hay que fusionar con el modelo base y convertir después a GPTQ, AWQ, GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | Turco (declarado en la model card); el modelo base es multilingüe, pero el ajuste se documenta únicamente para tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de adaptador PEFT: adapter_config.json + adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador no define una arquitectura propia: es un conjunto de matrices de bajo rango inyectadas en un transformer decoder de tipo Qwen2. El modelo base Qwen2.5-1.5B-Instruct emplea atención con multi-head attention con query/key/value bias, grouped-query attention (GQA) para reducir el coste de caché KV, normalización RMSNorm pre-norm, activación SwiGLU y embeddings rotatorios (RoPE). Según la información disponible, el ajuste se realizó con QLoRA, es decir, cuantización del modelo base a 4 bits durante el entrenamiento con adaptadores en precisión superior, con rango r=16, aplicación a todas las capas lineales y 3 épocas.

No se han publicado detalles sobre el corpus de entrenamiento: se desconoce el número de tokens, la proporción de datos instructivos frente a datos crudos en turco, la procedencia del dataset, la longitud máxima de secuencia usada y si se aplicaron técnicas de alineación adicionales como DPO o RLHF. La model card únicamente indica la receta QLoRA y remite al modelo fusionado. Tampoco se documenta ninguna innovación técnica más allá del propio procedimiento PEFT, ni se ofrecen métricas de pérdida durante el entrenamiento que permitan valorar la convergencia.

## Capacidades

- Generación de texto conversacional en turco, heredando el formato de chat instructivo del modelo base.
- Razonamiento básico y resolución de problemas sencillos, acotado por el tamaño de 1,5B parámetros del modelo subyacente.
- Generación de código y explicaciones técnicas, capacidad heredada de Qwen2.5-1.5B-Instruct y no reevaluada tras el ajuste.
- Aritmética y operaciones matemáticas simples, con la fiabilidad limitada propia de un modelo de 1,5B.
- Soporte de tool calling / function calling: el modelo base lo incluye de forma nativa, pero no hay verificación de que el ajuste LoRA lo preserve.
- Capacidad de mantener conversaciones multi-turno dentro de la ventana de 32.768 tokens del modelo base.
- Capacidades multilingües residuales del modelo base, no garantizadas tras un ajuste documentado solo para turco.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional en turco para soporte de primer nivel: el adaptador puede gestionar diálogos multi-turno con hasta 32.768 tokens de contexto, suficiente para incorporar el historial completo de un cliente y fragmentos de documentación en la misma ventana.
- Clasificación y etiquetado de textos en turco: al ser un modelo de 1,5B, se puede desplegar en una sola GPU de consumo y procesar lotes de reseñas, tickets o mensajes para asignar categorías, sentimiento o prioridad.
- Extracción de información estructurada de documentos turcos (facturas, contratos, formularios) hacia JSON, aprovechando el formato instructivo del modelo base y su ventana de contexto para incluir el documento completo.
- Generación de respuestas FAQ y bases de conocimiento internas: el modelo puede redactar respuestas a partir de fragmentos recuperados por un sistema RAG, con la ventaja de que el adaptador se puede fusionar y cuantizar para servirlo en local.
- Prototipado rápido de productos en turco: al ocupar ~0,1 GB el adaptador y ~3 GB el modelo base en FP16, permite iterar en estaciones de trabajo sin GPU de datacenter antes de decidir si se escala a un modelo mayor.
- Resumen de documentos y actas en turco: con 32.768 tokens de contexto se pueden resumir informes extensos sin truncar, y el coste por inferencia es bajo al tratarse de un modelo de 1,5B.
- Despliegue en el borde o en entornos con recursos limitados (mini-PC con GPU integrada, portátiles con 8 GB de VRAM) para tareas de generación de texto sin conexión.
- Filtrado y moderación de contenido en turco: clasificación de mensajes potencialmente tóxicos en pipelines de preprocesado, siempre con revisión humana y validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base + adaptador): ~3,2 GB en FP16/BF16, ~1,8 GB en 8 bits y ~1,1-1,3 GB en 4 bits (estimación a partir de los 1.500 millones de parámetros, no medida sobre este adaptador).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, L40S, A10G, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en tarjetas de 6-8 GB con cuantización de 4 bits (RTX 3050, RTX 4060, GTX 1660 Super con 6 GB en Q4) e incluso en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM y TGI (requieren fusionar el adaptador con el modelo base), llama.cpp/Ollama (requieren fusionar y convertir a GGUF), y servidores de inferencia gestionados que acepten pesos safetensors fusionados.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones sobre este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| celsen/Pusula-1.5B-adapter | 1,5B (base) + adaptador LoRA | 32.768 tokens (base) | Apache 2.0 | Adaptador PEFT en HuggingFace; requiere el modelo base | Sin benchmarks publicados ni descargas registradas |
| celsen/Pusula-1.5B | 1,5B | 32.768 tokens | Apache 2.0 (heredada) | Pesos fusionados listos para usar | Misma receta que el adaptador, ya fusionada; sin evaluación publicada |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Modelo completo en HuggingFace | Base del adaptador; incluye documentación y evaluaciones propias del autor original |
| Qwen/Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens | Apache 2.0 | Modelo completo en HuggingFace | Alternativa de mayor tamaño y capacidades, con mayor coste de VRAM (~6,5 GB en FP16) |

## Limitaciones y advertencias

- El repositorio contiene únicamente el adaptador LoRA: no es un modelo autónomo y no puede ejecutarse sin cargar Qwen/Qwen2.5-1.5B-Instruct.
- No se documenta el dataset de entrenamiento ni el número de tokens, por lo que no es posible auditar qué datos turcos se usaron ni detectar posibles sesgos introducidos.
- Ausencia total de evaluación publicada: no hay benchmarks, ni comparación con el modelo base, ni mediciones de pérdida que permitan afirmar que el ajuste mejora al original en turco.
- Al ser un ajuste sobre un modelo de 1,5B, la fiabilidad en razonamiento multi-paso, matemáticas complejas y generación de código extenso es limitada, y el riesgo de alucinación es alto en dominios especializados.
- El ajuste podría haber degradado capacidades del modelo base, incluido el soporte de tool calling y el rendimiento en idiomas distintos del turco, sin que exista documentación al respecto.
- El repositorio presenta cero descargas y cero valoraciones, y fue creado en octubre de 2026, por lo que carece de validación por parte de la comunidad.
- Licencia Apache 2.0 en el adaptador y en el modelo base: permite uso comercial, pero conviene verificar los términos del modelo base y citar adecuadamente a Qwen y al autor del adaptador.
- Para producción con vLLM, TGI o llama.cpp es necesario fusionar previamente el adaptador (por ejemplo con merge_and_unload de PEFT) y, en su caso, convertir a GGUF; el adaptador en crudo no es compatible con esos motores sin ese paso.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/celsen/Pusula-1.5B-adapter
- Modelo fusionado: https://huggingface.co/celsen/Pusula-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
