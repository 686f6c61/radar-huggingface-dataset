# blearyhope/Edge0-145B-q3k

## Resumen

Edge0-145B-q3k es un modelo de lenguaje publicado en Hugging Face por el usuario blearyhope bajo la librería `edge0` y la licencia `edge0-community-model-1.0`. Se presenta como una variante cuantizada en 4 bits (GGUF, según los tags) de un modelo base identificado como `Qwen/Qwen3.8-Flash-Next`, orientada a inferencia en el borde (edge inference) y a cargas de trabajo de agentes y generación de código. La nomenclatura "145B" del identificador contrasta con los datos reales de pesos en safetensors declarados en el repositorio, que suman 4.947.698.560 parámetros, una discrepancia que conviene tener muy en cuenta.

El modelo se etiqueta como MoE (mixture of experts) con una variante que el autor denomina "latent-moe", y se distribuye como un repositorio de 106,3 GB, lo que es coherente con un empaquetado GGUF de gran tamaño más que con los ~5 mil millones de parámetros declarados en safetensors. La información pública disponible es muy escasa: cero descargas, cero likes, sin idiomas declarados y sin datos de benchmarks, por lo que esta ficha se limita a lo verificable en los metadatos y en la model card.

La relevancia de esta ficha es fundamentalmente cautelar: el modelo aparece como un artefacto reciente (creado y actualizado el 23 de noviembre de 2026) con metadatos internamente inconsistentes. Antes de cualquier evaluación seria, un desarrollador debería verificar la integridad de los pesos, la correspondencia real entre el identificador y el contenido, y las condiciones exactas de la licencia comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), variante denominada "latent-moe" por el autor; detalles de capas y atención no disponibles |
| Parametros totales | 4.947.698.560 según safetensors del repositorio; el identificador del modelo indica "145B" (discrepancia no resuelta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (según tags y sufijo "q3k"); esquema exacto GGUF no disponible |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (license: other) |
| Formato de pesos | GGUF (tag `gguf`); el repositorio también declara pesos safetensors con el recuento de parámetros citado |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de una arquitectura MoE con una innovación que el autor etiqueta como "latent-moe", sin que se detallen el número de expertos, el mecanismo de enrutamiento, la dimensión oculta ni el tipo de atención. El modelo base declarado es `Qwen/Qwen3.8-Flash-Next`, del que no se aportan especificaciones en la información proporcionada; por tanto, no es posible confirmar si Edge0-145B-q3k es una cuantización directa, un fine-tuning o una recomposición de dicho modelo.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. Tampoco hay información sobre técnicas de decodificación especulativa, atención lineal u otras optimizaciones de inferencia más allá de la propia cuantización a 4 bits y del enfoque de "edge inference" que sugiere el nombre.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Orientación declarada a tareas de agente (`agent`) y de generación de código (`coding`).
- Compatibilidad con endpoints (`endpoints_compatible` según tags), lo que sugiere despliegue vía API compatible con servicios de inferencia.
- Ejecución en CUDA (tag `cuda`) y enfoque de inferencia en el borde (`edge-inference`).
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no disponible en la información.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible.
- Razonamiento matemático: no disponible.

## Casos de uso

- Asistente de código en local para desarrolladores: el tag `coding` y el formato GGUF permiten integrar el modelo en entornos de desarrollo sin conexión, siempre que se valide primero la integridad de los pesos y el rendimiento real en tareas de autocompletado y generación de funciones.
- Agentes autónomos de automatización de tareas: la orientación declarada a `agent` sugiere su uso en bucles de planificación y ejecución de herramientas; sería necesario verificar empíricamente el soporte de tool calling, que no está documentado.
- Inferencia en el borde en estaciones de trabajo con GPU: el enfoque `edge-inference` y la cuantización a 4 bits apuntan a despliegues en hardware limitado, aunque el tamaño del repositorio (106,3 GB) exige almacenamiento considerable.
- Prototipado de pipelines conversacionales: al ser compatible con endpoints, puede conectarse a frameworks de orquestación de agentes para pruebas de concepto internas.
- Investigación sobre arquitecturas MoE: el etiquetado "latent-moe" lo hace candidato para estudiar variantes de enrutamiento de expertos, previa verificación de que la arquitectura declarada coincide con los pesos.
- Evaluación comparativa de cuantizaciones: útil como caso de estudio de cuantización 4-bit de un modelo base mayor, midiendo la degradación de calidad frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Con 4.947.698.560 parámetros en 4 bits, el peso teórico rondaría los 2,5 GB, pero el repositorio ocupa 106,3 GB, lo que impide dar una estimación fiable sin inspeccionar los ficheros GGUF.
- GPU recomendadas: no disponible. El tag `cuda` indica soporte para GPU NVIDIA, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; la discrepancia entre parámetros declarados y tamaño del repositorio impide determinarlo.
- Opciones de despliegue: la librería declarada es `edge0`, no estándar; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Edge0-145B-q3k | 4.947.698.560 (safetensors); identificador indica 145B | no disponible | edge0-community-model-1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; los datos del modelo base tampoco se detallan en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia crítica de metadatos: el identificador indica 145B parámetros, los safetensors declaran 4.947.698.560 y el repositorio pesa 106,3 GB; es imprescindible verificar qué contienen realmente los ficheros antes de usarlos.
- Ausencia total de benchmarks, descargas y validación comunitaria (0 descargas, 0 likes); no hay evidencia pública de calidad o funcionamiento.
- Idiomas no declarados: riesgo de comportamiento deficiente o impredecible en castellano y otros idiomas no confirmados.
- Licencia `edge0-community-model-1.0` con `license: other`: las condiciones de uso comercial no están detalladas en la información disponible y deben revisarse en el fichero LICENSE del repositorio.
- Librería `edge0` no estándar: puede requerir código o dependencias específicas del autor, con riesgo de falta de mantenimiento.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Longitud de contexto desconocida: no apto para planificación de cargas con ventanas largas sin medición previa.
- Modelo base referenciado pero no verificado: no se confirma la relación exacta (cuantización, fine-tuning o recomposición) con `Qwen/Qwen3.8-Flash-Next`.

## Enlaces

- Hugging Face: https://huggingface.co/blearyhope/Edge0-145B-q3k
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: fichero LICENSE dentro del repositorio de Hugging Face (no se proporciona enlace directo en la información disponible)
- Paper, blog, repositorio de código o demo: no disponibles
