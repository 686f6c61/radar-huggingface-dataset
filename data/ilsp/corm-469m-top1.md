# ilsp/CoRM-469M-top1

## Resumen

CoRM-469M-top1 es un modelo de lenguaje autoregresivo basado en arquitectura Transformer con Mixture-of-Experts (MoE), desarrollado por el Instituto de Lenguaje y Procesamiento del Habla (ILSP) de Grecia. Es un checkpoint del paper "Beyond Magnitude: Contrastive Routing for Modular Mixture-of-Experts", cuyo objetivo es avanzar en el diseño de routers MoE mediante un mecanismo de «routing contrastivo» que selecciona expertos en función de una brecha de atención contrastiva respecto a un estado de referencia móvil (EMA), en lugar de usar la magnitud de activación tradicional.

El modelo activa solo 469 millones de parámetros por token, aunque el total de parámetros almacenados es de aproximadamente 2.598 millones (2,58 mil millones). Esto significa que, en cada paso de decodificación, se computa únicamente con un subconjunto de los pesos, lo que reduce el coste computacional efectivo en comparación con un modelo denso del mismo tamaño total. La longitud de contexto es de 1024 tokens, una cifra modesta que limita su uso en tareas de contexto largo. El modelo está disponible bajo licencia Apache-2.0 y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE (8 expertos, top-1 routing) |
| Parametros totales | 2.597.921.816 |
| Parametros activos | 469M (por token) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

CoRM-469M-top1 es un modelo causal de lenguaje basado en Transformer con capas MoE. La configuración incluye un tamaño oculto de 1024, 24 capas, atención con 16 cabezas y 4 KV heads (Grouped Query Attention, GQA), tamaño intermedio de 4096 y un vocabulario de 51200 tokens. Cada capa MoE utiliza 8 expertos, de los cuales se activa únicamente 1 por token (routing top-1). Esta elección de activación mínima es el rasgo distintivo del modelo.

El mecanismo de routing propuesto en el paper, denominado *contrastive routing*, calcula una puntuación para cada experto comparando la atencion generada por el token con un estado de referencia actualizado mediante media móvil exponencial (EMA). De esta forma, se priorizan expertos cuya atención difiere significativamente de la media global, en lugar de simplemente elegir el de mayor magnitud de activación. El modelo es experimental y se publica como parte de una colección más amplia de checkpoints CoRM, destinada a facilitar la investigación en sistemas modulares de Mixture-of-Experts.

No se han publicado en la información disponible los datos de entrenamiento: número de tokens, composición del dataset, hiperparámetros, ni si se aplicaron técnicas como RLHF o DPO. La model card incluye comentarios pendientes de relleno para entrenamiento y evaluación, lo que confirma que esta información no está documentada públicamente en el repositorio actual.

## Capacidades

- Generacion de texto autoregresiva en modo causal: el modelo es capaz de completar secuencias de texto a partir de un prompt, tal como se muestra en el ejemplo de uso de la model card.
- Eficiencia computacional derivada de la arquitectura MoE: al activar solo 469M de parámetros por token, puede ofrecer un coste de computo menor que un modelo denso equivalente en volumen total.
- Soporte de tokenizacion y decodificacion estandar via la libreria Transformers, siempre que se utilice `trust_remote_code=True` debido al codigo de modelado personalizado.
- No se han documentado capacidades adicionales como tool calling, function calling, vision, audio, razonamiento multi-paso explicito o soporte de agentes. No hay evidencia en la documentacion disponible.

## Casos de uso

- Investigacion en sistemas MoE: el checkpoint permite reproducir y comparar el rendimiento de me canismos de routing contrastivo frente a routers convencionales. Es ideal para laboratorios que trabajan en eficiencia y modularidad de modelos de lenguaje.
- Prototipado de chatbots de dominio restringido: con una ventana de contexto de 1024 tokens, el modelo puede gestionar conversaciones cortas y consultas concretas, especialmente tras un fine-tuning en el dominio objetivo.
- Clasificacion y etiquetado de textos: como modelo causal, puede adaptarse mediante fine-tuning para tareas de clasificación, extracción de entidades o análisis de sentimiento en textos breves del dominio entrenado.
- Educacion y formacion en arquitecturas MoE: su tamaño reducido y el codigo abierto permiten usar el modelo como material didáctico para explicar el routing de expertos y la atencion con cabezas agrupadas (GQA).
- Evaluacion de robustez y ataques adversariales: al ser un modelo de investigacion, puede emplearse en estudios de red teaming para analizar cómo afecta el routing top-1 a la alucinación y a la generación de contenido no deseado.
- Despliegue en entornos con presupuesto computacional ajustado: aunque los pesos totales ocupan 5,2 GB en bfloat16, la activacion selectiva de expertos reduce el coste por token, lo que puede resultar útil en servidores con GPU de gama media, siempre que la memoria VRAM disponible sea suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion marcada como "TODO" sin datos. Por tanto, no es posible presentar cifras de MMLU, HumanEval, GSM8K ni ninguna otra prueba comparativa. No se han visto valores de latencia ni throughput en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los pesos del modelo ocupan aproximadamente 5,2 GB (2.597.921.816 valores x 2 bytes). Ademas, hay que considerar la cache KV, los estados del optimizador y la memoria de activaciones, por lo que se recomienda una GPU con al menos 8 GB de VRAM para batch pequeno y 12 GB o mas para un uso comodo.
- GPU recomendadas: para inferencia en bfloat16, una RTX 3060 de 12 GB, RTX 3090 o RTX 4090. Para batch large o despliegue en produccion, se recomienda A100 o H100.
- Compatibilidad con consumer GPU: el modelo puede ejecutarse en GPUs de consumo con soporte bfloat16, como las RTX 30 y 40 series, siempre que la memoria VRAM sea suficiente.
- Opciones de despliegue: es necesario cargar el modelo via Transformers con `trust_remote_code=True`. No se han documentado puntos de entrada para vLLM, TGI o llama.cpp; podria funcionar con vLLM si el codigo personalizado es compatible, pero no hay confirmacion.
- Latencia y throughput: no disponibles en la documentacion. Al ser un modelo experimental, no se presentan mediciones.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable con otros modelos de la misma categoria. La documentacion solo incluye una tabla interna de la coleccion CoRM en la que se lista el propio checkpoint, pero no se ofrecen datos de otros modelos comparables ni resultados de rendimiento. Por tanto, esta seccion se limita a indicar que no existen datos publicados.

## Limitaciones y advertencias

- Ventana de contexto reducida: el modelo acepta solo 1024 tokens, lo que dificulta tareas que requieran documentos largos, conversaciones extensas o razonamiento multi-paso con mucha informacion previa.
- Idiomas no documentados: no se ha especificado listado de idiomas soportados. Es probable que el modelo se haya entrenado predominantemente en ingles o griego, dado el origen del laboratorio, pero no hay confirmacion.
- Sin benchmarks publicos: la ausencia de resultados evaluables impide conocer su calidad real frente a otros modelos, lo que supone un riesgo importante para cualquier uso en produccion.
- Sesgos y alucinaciones no evaluados: no se ha publicado ningun estudio de sesgos, seguridad o fiabilidad. Por tanto, no es seguro asumir que el modelo sea robusto ante prompts mal intencionados o datos sesgados.
- Dependencia de codigo personalizado: el modelo requiere `trust_remote_code=True`, lo que aumenta la superficie de riesgo en produccion. Ademas, puede dejar de ser compatible con futuras versiones de Transformers.
- Carga de pesos en bfloat16: en GPUs que no soporten bfloat16 (por ejemplo, algunas GPUs antiguas o tarjetas de consumo de primera generacion), la inferencia directa no funcionara sin una conversion manual a otro tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilsp/CoRM-469M-top1
- Codigo oficial en GitHub: https://github.com/athena-ilsp/CoRM
- Paper en arXiv: https://arxiv.org/abs/2609.01100
- Instituto ILSP: https://www.ilsp.gr/
