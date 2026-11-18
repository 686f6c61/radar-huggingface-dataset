# kalle07/Vero-Qwen3-8B_VL_Heresy_ARA_gguf

## Resumen

Vero-Qwen3-8B_VL_Heresy_ARA_gguf es una cuantizacion en formato GGUF de una version "decensored" (abliterated) del modelo multimodal zlab-princeton/Vero-Qwen3I-8B, desarrollada por el usuario kalle07. El modelo original parte de la familia Qwen3-VL y ha sido entrenado con 600.000 muestras de RL curadas a partir de 59 datasets, cubriendo 6 categorias de razonamiento visual. Esta variante aplica la herramienta Heretic v2.1.0 con el metodo Arbitrary-Rank Ablation (ARA) para reducir los rechazos del modelo.

El resultado es un modelo de vision-lenguaje de aproximadamente 8.190 millones de parametros (8B), orientado a tareas de image-text-to-text, que segun el autor reduce los rechazos de 89/100 a 6/100 en una evaluacion propia de 100 prompts, con una divergencia KL de 0,004 respecto al original, lo que sugiere que la calidad se preserva en gran medida.

Es relevante para desarrolladores que necesitan un modelo multimodal pequeno (8B) que quepa en hardware de consumo, con capacidad de describir imagenes y responder a system prompts de forma flexible, y que no aplique filtros de rechazo agresivos. La licencia es Apache 2.0 y el repositorio ocupa 11,8 GB, lo que sugiere multiples niveles de cuantizacion GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basada en Qwen3-VL; detalles de atencion no disponibles |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles; repo de 11,8 GB sugiere varias variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base en safetensors |
| Modelo base | zlab-princeton/Vero-Qwen3I-8B |
| Metodo de decensurado | Heretic v2.1.0 con Arbitrary-Rank Ablation (ARA) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de la familia Qwen3-VL, con un codificador visual acoplado a un modelo de lenguaje de 8B parametros. No se dispone de detalles especificos sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de fusion vision-texto en la informacion proporcionada.

El modelo original fue entrenado con 600.000 muestras de RL curadas de 59 datasets, organizadas en 6 categorias de razonamiento visual. Sobre esa base, esta variante aplica una ablacion de rangos arbitrarios (ARA) mediante Heretic v2.1.0, una tecnica de edicion de pesos que elimina direcciones de activacion asociadas a comportamientos de rechazo. Segun el autor, el resultado mantiene una divergencia KL de 0,004 frente al original, lo que indica un cambio minimo en la distribucion de salida, mientras reduce los rechazos de 89/100 a 6/100 en su propia evaluacion. No se especifican detalles sobre RLHF, DPO ni composicion exacta del dataset original.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes y texto (image-text-to-text).
- Descripcion de imagenes, tarea para la que el autor la recomienda explicitamente.
- Razonamiento visual en 6 categorias cubiertas por el entrenamiento original (categorias concretas no disponibles).
- Conversacion multi-turno (tag conversational).
- Alta sensibilidad a system prompts: el autor indica que el modelo responde muy bien a instrucciones de sistema, lo que permite adaptar el tono y el comportamiento.
- Comportamiento con menos rechazos que el original (6/100 frente a 89/100 en la evaluacion del autor).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion.
- Cobertura multilingue: no disponible.
- Capacidades de audio o thinking mode: no disponible en la informacion.

## Casos de uso

- Descripcion automatica de imagenes en catalogos de producto: el modelo puede generar descripciones textuales de imagenes de inventario, y su naturaleza decensored evita rechazos ante contenido ambiguo o sensible (arte, fotografia de figura humana) que otros modelos filtran.
- Etiquetado y moderacion de contenido visual con criterio propio: al reducir los rechazos, permite clasificar o describir imagenes que un modelo alineado rechazaria, delegando la politica de moderacion al system prompt del desarrollador.
- Asistentes de accesibilidad: generacion de descripciones alternativas (alt text) para imagenes en webs y aplicaciones, con la ventaja de un tamano de 8B que permite despliegue en servidores modestos.
- Analisis de documentos escaneados y capturas: extraccion de informacion textual y contextual de imagenes de documentos, formularios o pantallas, integrable en pipelines de procesamiento por lotes.
- Prototipado rapido de aplicaciones multimodales: al estar en GGUF, se puede ejecutar con llama.cpp u Ollama en estaciones de trabajo con GPU de consumo, lo que acelera la validacion de ideas sin infraestructura dedicada.
- Investigacion sobre alineacion y edicion de pesos: util como caso de estudio de la tecnica ARA y Heretic, comparando el comportamiento del modelo original frente a la version abliterated con la misma base.
- Generacion de contenido creativo a partir de referencias visuales: el modelo puede interpretar una imagen de referencia y producir texto narrativo o descriptivo sin las restricciones tipicas de modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion proporcionado por el autor es interno:

| Metrica | Original | Esta version |
|---|---|---|
| Tasa de rechazo (100 prompts propios) | 89/100 | 6/100 |
| Divergencia KL respecto al original | — | 0,004 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 8,19B en GGUF, las cuantizaciones Q4_K_M suelen requerir en torno a 5-6 GB y las Q8_0 en torno a 9-10 GB, aunque el autor no publica estos datos.
- GPU recomendadas: no disponible en la informacion. Por tamano, el modelo es apto para GPU de consumo con 8-12 GB de VRAM en cuantizaciones bajas.
- Cabe en GPU de consumo: previsiblemente si, en cuantizaciones Q4/Q5, aunque no se confirma en la model card.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners de GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vero-Qwen3-8B_VL_Heresy_ARA_gguf | 8,19B | no disponible | Apache 2.0 | GGUF | Version decensored con ARA; 6/100 rechazos |
| zlab-princeton/Vero-Qwen3I-8B | 8,19B | no disponible | no disponible | safetensors | Modelo original; 89/100 rechazos |
| Qwen3-VL (familia base) | variable | no disponible | no disponible | safetensors/GGUF | Arquitectura de referencia; alineacion estandar |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El decensurado por ablacion elimina direcciones de rechazo, lo que puede aumentar la probabilidad de generar contenido inapropiado, ofensivo o inseguro; no debe desplegarse sin una capa de moderacion propia.
- Los sesgos conocidos del modelo original no se documentan en la informacion disponible; la ablacion puede alterar el comportamiento en dominios sensibles de forma no evaluada.
- Riesgo de alucinacion: inherente a los modelos de 8B; no se han publicado evaluaciones de fidelidad factual.
- La evaluacion de rechazos (6/100) y la divergencia KL (0,004) son datos internos del autor, sin protocolo ni conjunto de prompts publicados; deben tomarse con cautela.
- Idiomas soportados no documentados; el rendimiento fuera del ingles (y posiblemente chino, dado el origen Qwen) es incierto.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos o conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base zlab-princeton/Vero-Qwen3I-8B no declara licencia en la informacion disponible; conviene verificar la cadena de licencias antes de produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni reportes independientes de calidad.
- Al ser una cuantizacion GGUF, puede haber perdida adicional de calidad respecto al original en safetensors, no cuantificada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kalle07/Vero-Qwen3-8B_VL_Heresy_ARA_gguf
- Modelo base original: https://huggingface.co/zlab-princeton/Vero-Qwen3I-8B
- Heretic (herramienta de decensurado): https://github.com/p-e-w/heretic
