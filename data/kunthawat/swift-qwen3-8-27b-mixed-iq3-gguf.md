# kunthawat/swift-qwen3.8-27b-mixed-iq3-gguf

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo Swift-Qwen3.8-27B, publicada por el usuario kunthawat bajo el identificador `kunthawat/swift-qwen3.8-27b-mixed-iq3-gguf`. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a un formato mixto de cuantizacion IQ3 orientado a inferencia local en hardware de gama alta de consumo. La model card publicada es practicamente vacia: solo declara `license: other` con nombre `swift-open-license-1.0`, sin descripcion, sin datos de entrenamiento y sin resultados de evaluacion.

Segun la informacion disponible en repositorios hermanos del mismo autor y de terceros, el modelo base Swift-Qwen3.8-27B seria un ajuste fino de Qwen/Qwen3.8-27B, descrito como un modelo denso de 27.000 millones de parametros, multimodal, con atencion hibrida GatedDeltaNet + Gated Attention y una cabeza de Multi-Token Prediction (MTP). El proceso de cuantizacion de esta variante parte de pesos BF16 de Swift 1.5 y aplica una asignacion de bits tensor por tensor reconstruida a partir de la referencia publica UD-IQ3_XXS de Unsloth y su matriz de importancia.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio acumula 0 descargas y 0 likes, no incluye documentacion tecnica propia ni benchmarks, y su licencia es de tipo propietario ("other"). Cualquier evaluacion seria del modelo exige consultar el repositorio del modelo base y verificar la licencia antes de plantear un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida GatedDeltaNet + Gated Attention y cabeza de Multi-Token Prediction (MTP), segun informacion de repositorios hermanos sobre la familia base; no confirmado en la model card de este repositorio |
| Parametros totales | 27B (deducido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE; la informacion de la familia base lo describe como denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con esquema mixto IQ3 declarado en el nombre del repositorio; la asignacion concreta de bits por tensor no esta documentada en la model card. Un repositorio hermano del mismo autor cita IQ4 + IQ3 + IQ2 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other`); el texto integro no esta incluido en la informacion disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este repositorio no documenta ningun entrenamiento propio: es una conversion de pesos a GGUF. Los unicos detalles de arquitectura disponibles provienen de la descripcion de la familia base en repositorios relacionados, donde se describe Swift-Qwen3.8-27B como un modelo denso de 27B con atencion hibrida GatedDeltaNet + Gated Attention y una cabeza MTP, y con capacidad multimodal. Ninguno de estos extremos aparece confirmado en la model card de este repositorio, por lo que deben tratarse como datos de contexto y no como especificaciones verificadas.

Respecto al proceso de cuantizacion, un repositorio hermano del mismo autor indica que el build parte de pesos BF16 de Swift 1.5 y aplica un esquema de cuantizacion mixta tensor por tensor, reconstruido a partir de la referencia publica UD-IQ3_XXS del repositorio Qwen3.8 GGUF de Unsloth y usando su matriz de importancia publica. No hay informacion en la model card de este repositorio sobre numero de tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

La model card no enumera capacidades. Las siguientes se derivan de la informacion publica sobre la familia base y deben validarse empiricamente antes de cualquier uso:

- Generacion de texto y razonamiento en un modelo denso de 27B, segun la descripcion de la familia base.
- Capacidad multimodal (vision), segun la descripcion de la familia base como modelo multimodal.
- Codigo y tareas agenticas de horizonte largo: los repositorios de Swift 1.5 describen un post-entrenamiento centrado en tareas agenticas y de codigo, con menos tokens de razonamiento.
- Prediccion multi-token (MTP): la familia base incorpora una cabeza MTP, que puede aprovecharse para decodificacion especulativa interna.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Modo thinking: los repositorios de Swift 1.5 mencionan optimizacion para reducir el numero de tokens de razonamiento, pero no se detalla el mecanismo en este repositorio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia local en estacion de trabajo con GPU de 24 GB: una cuantizacion IQ3 de un modelo denso de 27B permite ejecutar el modelo completo en una RTX 3090 o RTX 4090 sin recurrir a servicios en la nube, con un coste de memoria de pesos claramente inferior al de BF16.
- Despliegue en portatiles con GPU de gama alta y contexto corto: con cuantizacion IQ3 los pesos caen en el rango de ~10-12 GB, lo que hace viable la ejecucion en equipos con 12-16 GB de VRAM si se limita la longitud de contexto y se controla el tamano del KV cache.
- Asistencia de codigo en local para entornos con requisitos de privacidad: si se confirma la especializacion de Swift 1.5 en tareas de codigo, el modelo puede emplearse como asistente de programacion sin enviar el codigo fuente a terceros.
- Prototipado rapido de aplicaciones de razonamiento: el formato GGUF se integra directamente con llama.cpp, Ollama y LM Studio, lo que permite montar un endpoint local en minutos para pruebas de concepto.
- Procesamiento de documentos con componente visual: si se confirma el caracter multimodal de la familia base, el modelo podria usarse para extraccion de informacion de capturas, diagramas o documentos escaneados, siempre que la cuantizacion no degrade en exceso la torre de vision.
- Evaluacion comparativa de esquemas de cuantizacion: este repositorio es util como muestra para medir la perdida de calidad de una mezcla IQ3 frente a IQ3_XXS de Unsloth o a mezclas IQ4+IQ3+IQ2 sobre el mismo modelo base.
- Tareas agenticas de varios pasos con tool calling: si la familia base mantiene el soporte de llamadas a herramientas, el modelo podria orquestar pipelines con APIs externas, aunque esto no esta documentado en este repositorio y requiere verificacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye ninguna tabla de evaluacion, y los resultados de busqueda consultados tampoco aportan cifras para esta cuantizacion concreta. No se deben extrapolar numeros de otros repositorios ni de otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- VRAM estimada para los pesos: con un esquema IQ3 en el rango aproximado de 3,0-3,4 bits por peso, los 27B parametros ocuparian en torno a 10-12 GB. Es una estimacion derivada del numero de parametros y del regimen de bits, no un dato publicado por el autor.
- VRAM total necesaria: a la cifra anterior hay que sumar el KV cache y los buffers de inferencia; para contextos largos el consumo puede crecer de forma apreciable, aunque la longitud de contexto soportada no esta disponible.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), RTX 5090 y GPUs profesionales tipo A100 40/80 GB o H100 para servir varias peticiones concurrentes.
- Cabe en GPU de consumo: si, previsiblemente en GPUs de 24 GB con margen, y probablemente en GPUs de 12-16 GB con contexto reducido. No hay confirmacion oficial.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son la via natural para GGUF. vLLM soporta GGUF de forma parcial, con limitaciones de rendimiento frente a safetensors. TGI no esta orientado a GGUF.
- Latencia y throughput: no disponible. Como referencia general del formato, las cuantizaciones IQ3 requieren descompresion en tiempo de ejecucion, lo que en CPU suele traducirse en menor velocidad que esquemas Q4_K_M de tamano comparable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kunthawat/swift-qwen3.8-27b-mixed-iq3-gguf (este) | 27B (deducido) | no disponible | GGUF, mixto IQ3 | swift-open-license-1.0 | 0 descargas, 0 likes |
| kunthawat/swift-1.5-qwen3.8-27b-with-unsloth-iq3-xxs-gguf | 27B | no disponible | GGUF, IQ3_XXS basado en UD-IQ3_XXS de Unsloth | no disponible en los resultados | Repositorio publico en HuggingFace |
| vmarcelo/Swift-Qwen3.8-27B-MIX_GGUF | 27B | no disponible | GGUF, mezcla IQ4 + IQ3 + IQ2 | no disponible en los resultados | Repositorio publico en HuggingFace |
| ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF | 27B | no disponible | GGUF, asignacion por tensor de GSQ-RCO (ISTA-DASLab) | no disponible en los resultados | Repositorio publico en ModelScope |

No se dispone de datos de rendimiento comparados entre estas variantes, por lo que la eleccion entre ellas solo puede guiarse, a dia de hoy, por el regimen de bits declarado y por la reproducibilidad del proceso de cuantizacion documentado por cada autor.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay descripcion, ni contexto soportado, ni idiomas, ni instrucciones de uso. Cualquier integracion exige validacion manual previa.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentacion sobre calidad o estabilidad.
- Ausencia total de benchmarks: no se puede estimar la degradacion introducida por la mezcla IQ3 frente a los pesos BF16 originales.
- Licencia restrictiva: `license: other` con nombre `swift-open-license-1.0`. Es imprescindible leer el fichero LICENSE del repositorio antes de cualquier uso comercial; este analisis no puede confirmar si se permite.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; agravado por la falta de informacion sobre el ajuste y por la cuantizacion agresiva.
- Perdida de calidad por cuantizacion: los esquemas mixtos IQ3 priorizan tamano reducido sobre fidelidad, y suelen afectar de forma mas acusada a tareas de razonamiento matematico y a contextos largos.
- Idiomas no declarados: se desconoce el grado de soporte real del castellano y de otras lenguas distintas del ingles.
- Capacidades multimodales sin confirmar: la naturaleza multimodal proviene de la descripcion de la familia base, no de este repositorio, y la cuantizacion puede haber degradado los tensores de vision.
- Metadatos con fecha futura: el repositorio figura como creado y actualizado el 2026-10-04, dato que conviene contrastar con el estado real del repositorio.
- Trazabilidad incompleta: no se documenta la receta exacta de bits por tensor, lo que dificulta reproducir la cuantizacion o auditar diferencias frente a otras variantes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kunthawat/swift-qwen3.8-27b-mixed-iq3-gguf
- Repositorio hermano del mismo autor (IQ3_XXS con Unsloth): https://huggingface.co/kunthawat/swift-1.5-qwen3.8-27b-with-unsloth-iq3-xxs-gguf
- Model card de la mezcla IQ4 + IQ3 + IQ2: https://huggingface.co/vmarcelo/Swift-Qwen3.8-27B-MIX_GGUF/blob/main/README.md
- Ficha de descarga de terceros del modelo GGUF: https://local-ai-zone.github.io/models/swift-qwen3-8-27b.html
- Cuantizacion GSQ-RCO en ModelScope: https://www.modelscope.cn/models/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
