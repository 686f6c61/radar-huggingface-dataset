# aquaduck/Inkling-2-Mini-MLX

## Resumen

Inkling-2-Mini-MLX es un empaquetado del modelo de lenguaje causal Inkling-2-Mini desarrollado originalmente por Thinking Machines, redistribuido por Aquaduck en formato MLX con cuantización nvfp4. No se trata de un modelo nuevo ni de un fine-tune, sino de una conversión de pesos orientada al ecosistema MLX de Apple (mlx-lm), pensada para ejecución local en hardware Apple Silicon. El modelo base cuenta con 26.388.559.360 parámetros (26,4B) y una arquitectura transformer de 24 capas con atención GQA (24 cabezas de consulta y 8 de clave/valor) y dimensión oculta de 2304.

La relevancia de este repositorio es doble. Por un lado, ofrece una versión cuantizada a 4 bits (nvfp4) del modelo original, reduciendo el peso del archivo principal a aproximadamente 19,57 GB, lo que facilita su despliegue en equipos con memoria unificada de gama alta. Por otro, introduce un esquema de empaquetado por capas ("midpoint layer shards") que divide el modelo en dos etapas contiguas cortadas en la capa 18, permitiendo carga escalonada o distribuida en múltiples nodos mediante la infraestructura Arc de Aquaduck.

Es importante subrayar que este repositorio es un artefacto de distribución, no una publicación de investigación. Los pesos proceden de Thinking Machines, la cuantización MLX de un repositorio intermedio del mismo autor, y Aquaduck se limita al alojamiento y al empaquetado por capas. La licencia es "other", heredada del modelo base, y no se documentan idiomas soportados ni longitud de contexto nativa en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Inkling-2-Mini), GQA con 24 cabezas Q / 8 cabezas KV, 24 capas, hidden dim 2304 |
| Parametros totales | 26.388.559.360 (26,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card indica "unknown tokens") |
| Tipos de cuantizacion | nvfp4 (4 bits) |
| Idiomas soportados | Multilingue (sin listado explícito; "same as base") |
| Licencia | other (heredada de thinkingmachines/inkling-2-mini) |
| Formato de pesos | safetensors (MLX), empaquetado mlx-package-v1 con layer shards opcionales |
| Tamano del repo | 40,1 GB |
| Archivo principal | model-00001-of-00004.safetensors (~19,57 GB, nvfp4 MLX completo) |
| Shards | layers-0-18 (~12,83 GB) y layers-18-24 (~7,72 GB) |
| Libreria | mlx (mlx-lm) |
| Modelo base | thinkingmachines/inkling-2-mini |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer causal decoder-only con atención de consultas agrupadas (GQA), configurado con 24 cabezas de consulta y 8 de clave/valor, 24 capas y una dimensión oculta de 2304. Esta combinación de pocas capas con una dimensión oculta relativamente estrecha para 26,4B parámetros sugiere un diseño orientado a eficiencia de memoria y velocidad de inferencia más que a maximizar capacidad por capa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; la model card del repositorio derivado remite explícitamente a la del modelo base para esos detalles.

Este repositorio concreto no contiene entrenamiento alguno. Los pesos originales provienen de Thinking Machines, la cuantización nvfp4 en MLX fue generada con mlx-lm y publicada en thinkingmachines/Inkling-2-Mini, y Aquaduck se limita a alojar esa conversión y a trocearla en paquetes contiguos de capas. La innovación técnica del repositorio no está en el modelo sino en el empaquetado: los shards son cortes en la capa 18 (índice de fin exclusivo) que permiten carga por etapas en dos nodos, con un máximo de dos stages declarado. Los shards no constituyen una nueva cuantización ni alteran los pesos más allá del empaquetado.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y usa la plantilla de chat del modelo base, con modos "thinking" e "instruct" documentados en la model card original.
- Razonamiento multi-paso: el modo thinking del modelo base sugiere capacidad de razonamiento extendido, aunque no se detallan métricas en este repositorio.
- Multilingüismo: la model card declara soporte multilingüe equivalente al del modelo base, sin listado de idiomas.
- Carga escalonada y multi-nodo: los layer shards permiten distribuir la inferencia en dos etapas mediante la infraestructura Arc de Aquaduck.
- Ejecución local en Apple Silicon: al estar en formato MLX nvfp4, es compatible con mlx-lm en hardware Apple.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Inferencia local en Mac de gama alta: el archivo principal nvfp4 (~19,57 GB) puede cargarse con mlx-lm en equipos Apple Silicon con memoria unificada suficiente, permitiendo ejecutar un modelo de 26,4B sin depender de la nube.
- Despliegue distribuido en dos nodos: los shards layers-0-18 y layers-18-24 permiten repartir el modelo entre dos máquinas mediante el cargador por etapas de Aquaduck Arc, útil cuando ningún nodo individual dispone de memoria para el modelo completo.
- Prototipado de asistentes conversacionales: la etiqueta "conversational" y la plantilla de chat con modos thinking/instruct lo hacen adecuado para construir interfaces de chat multi-turno en local antes de escalar a producción.
- Evaluación de cuantización nvfp4: investigadores pueden comparar la calidad de esta versión de 4 bits frente a los pesos originales de mayor precisión para medir la degradación introducida por la cuantización.
- Integración en la app de escritorio Aquaduck: el repositorio está diseñado para que la aplicación descargue automáticamente el archivo asignado por el catálogo de modelos, sirviendo como backend local de un asistente de escritorio.
- Experimentación con empaquetado por capas: desarrolladores que trabajen en técnicas de sharding por capas pueden usar estos paquetes como referencia de un esquema mlx-package-v1 con corte en la capa 18.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay evaluaciones separadas para la versión MLX ni para los shards, y remite a la model card de thinkingmachines/inkling-2-mini, cuyos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el archivo nvfp4 completo ocupa ~19,57 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, más overhead de contexto y activaciones (típicamente varios GB adicionales).
- Hardware recomendado: equipos Apple Silicon con memoria unificada de 32 GB o superior para el modelo completo con contexto moderado; 64 GB o más para margen holgado.
- Cabe en GPU consumer: no se documenta soporte CUDA; el formato MLX está orientado a Apple Silicon. No hay datos sobre ejecución en RTX 4090 u otras GPU NVIDIA.
- Despliegue: mlx-lm para el archivo completo; el cargador por etapas de Aquaduck Arc para los shards. Los shards no son compatibles con mlx-lm estándar como modelos completos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX (este repo) | 26,4B | No disponible | nvfp4 | other | MLX safetensors |
| thinkingmachines/inkling-2-mini (base) | 26,4B | No disponible | Precisión original | other | No disponible |
| thinkingmachines/Inkling-2-Mini (nvfp4) | 26,4B | No disponible | nvfp4 | other | MLX |

No se dispone de información sobre modelos alternativos de otros desarrolladores con los que comparar parámetros, contexto o rendimiento. La comparativa se limita a las tres variantes del mismo linaje documentadas en el repositorio.

## Limitaciones y advertencias

- La cuantización nvfp4 puede degradar la calidad respecto a las versiones originales de mayor precisión; la propia model card lo advierte.
- Los sesgos y riesgos son los mismos que los del modelo base thinkingmachines/inkling-2-mini, que no se detallan en este repositorio.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Longitud de contexto nativa desconocida ("unknown tokens"), lo que impide planificar despliegues con ventanas largas sin verificar en el modelo base.
- Idiomas soportados no listados explícitamente; solo se indica "multilingüe, igual que el base".
- Licencia "other": es imprescindible revisar los términos del modelo base antes de cualquier uso comercial; no se garantiza permiso de uso comercial desde este repositorio.
- Los shards layers-*-*/model.safetensors no funcionan como modelos completos en mlx-lm estándar; solo sirven con el cargador por etapas de Aquaduck Arc.
- Es obligatorio usar la plantilla de chat del modelo base (incluidos los modos thinking e instruct); otros formatos no funcionarán correctamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aquaduck/Inkling-2-Mini-MLX
- Modelo base: https://huggingface.co/thinkingmachines/inkling-2-mini
- Fuente de la cuantización MLX nvfp4: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- mlx-lm (soporte MLX): https://github.com/ml-explore/mlx-lm
- Perfil del autor: https://huggingface.co/aquaduck
