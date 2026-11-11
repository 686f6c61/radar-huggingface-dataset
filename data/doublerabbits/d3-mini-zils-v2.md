# DoubleRabbits/d3-mini-zils-v2

## Resumen

DoubleRabbits/d3-mini-zils-v2 es un ajuste fino (fine-tuning) de tipo LoRA sobre una base derivada de Qwen3.5-4B, publicado por el usuario DoubleRabbits en Hugging Face. Segun la model card, se trata de un "modelo de decision" (decision model) entrenado con LoRA de rango 16 sobre 400 decisiones sinteticas (semilla 1), integrado en lo que el autor denomina "Zils d3-mini soup pool" y construido sobre el chasis "d3-mini-4.5b-v1".

El modelo cuenta con aproximadamente 4.539 millones de parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos pequenos (rango 4B). La arquitectura declarada es `qwen3_5` con `custom_code`, lo que implica que requiere cargar codigo personalizado del repositorio para su correcta ejecucion, y que no es un transformer estandar compatible de forma nativa con todas las herramientas de inferencia.

La relevancia de esta ficha es limitada: el repositorio no presenta pipeline declarado, no tiene descargas ni likes, no especifica idiomas soportados y la model card es extremadamente escueta. Se trata de un artefacto experimental de un autor individual, probablemente parte de un experimento de "model soup" o mezcla de modelos, sin documentacion tecnica publica sobre entrenamiento, evaluacion o rendimiento. Esta ficha documenta lo que se puede verificar y marca explicitamente como no disponible todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, con custom_code; detalles no disponibles) |
| Parametros totales | 4.539.265.536 (aprox. 4,54B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

La arquitectura base es `qwen3_5`, segun la etiqueta del repositorio, y el modelo se describe como derivado de Qwen3.5-4B a traves del chasis "d3-mini-4.5b-v1". No se dispone de informacion publica sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni sobre si incorpora innovaciones como atencion lineal o decodificacion especulativa. El uso de `custom_code` indica que la implementacion de referencia requiere cargar modulos Python del propio repositorio, lo que limita la portabilidad a frameworks que no soporten esta carga personalizada.

El entrenamiento consistio, segun la model card, en un ajuste LoRA de rango 16 sobre 400 decisiones sinteticas generadas con semilla 1. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni la funcion de perdida empleada. El termino "soup pool" sugiere que este checkpoint forma parte de una mezcla de modelos (model soup), pero no se detalla la receta de mezcla ni los modelos intervinientes. No hay informacion sobre el proceso de alineacion ni sobre evaluaciones de calidad.

## Capacidades

- Generacion de texto: capacidad heredada de la base Qwen3.5-4B, aunque no se documenta explicitamente en la model card.
- Toma de decisiones: el autor lo describe como "decision model", orientado a tareas de decision, sin especificar el formato de entrada o salida.
- Razonamiento multi-paso: no disponible (no documentado).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible (no documentado).
- Codigo y matematicas: no disponible (no documentado especificamente).

## Casos de uso

- Experimentacion con model soups: el modelo puede utilizarse como componente en experimentos de mezcla de pesos o de evaluacion comparativa de checkpoints derivados de Qwen3.5-4B, dado su caracter de artefacto de investigacion.
- Prototipado de clasificadores de decision: si el ajuste LoRA sobre decisiones sinteticas produce un comportamiento de clasificacion, podria emplearse como base para experimentos de enrutamiento o seleccion de acciones en pipelines internos, siempre con validacion propia.
- Investigacion sobre fine-tuning LoRA de bajo rango: sirve como ejemplo reproducible (semilla 1, 400 ejemplos) para estudiar el efecto del rango 16 en tareas de decision sintetica.
- Evaluacion de compatibilidad con custom_code: util para probar la carga de modelos con codigo personalizado en frameworks como transformers con `trust_remote_code=True`.
- Base para nuevos ajustes: al estar bajo Apache 2.0, puede servir como punto de partida para fine-tunings posteriores en entornos de investigacion.
- Docencia y demostraciones: adecuado para ilustrar el flujo completo de publicacion de un checkpoint ajustado en Hugging Face, incluidos los metadatos y limitaciones tipicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9 GB solo para pesos (4,54B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB para pesos, mas overhead; en torno a 8-10 GB en total.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3 GB para pesos, mas overhead; en torno a 5-6 GB en total. No se publican variantes GGUF oficiales, por lo que la cuantizacion requeriria conversion manual.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB) o A100/H100 son suficientes; para cuantizacion 4 bits, una RTX 3060 de 12 GB o superior podria bastar.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en cuantizacion, y en 16-24 GB en fp16.
- Opciones de despliegue: al requerir `custom_code`, el despliegue con vLLM, TGI o llama.cpp no esta garantizado; la via mas segura es transformers con `trust_remote_code=True`. No se dispone de soporte confirmado en Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DoubleRabbits/d3-mini-zils-v2 | 4,54B | no disponible | Apache 2.0 | Hugging Face, custom_code |
| Qwen3.5-4B (base declarada) | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas de ~4B de proposito general | ~4B | variable | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo ni de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Documentacion minima: la model card no detalla datos de entrenamiento, evaluacion ni comportamiento esperado, lo que impide validar su calidad.
- Riesgo de alucinacion: sin evaluaciones publicadas, el riesgo es desconocido y potencialmente alto en tareas fuera del dominio de las 400 decisiones sinteticas.
- Sesgos: no documentados; el entrenamiento sobre datos sinteticos con semilla fija puede introducir sesgos reproducibles y poco representativos.
- Idiomas: no se declaran idiomas soportados; no se puede asumir un rendimiento multilingue.
- Contexto: se desconoce la longitud de contexto efectiva, lo que limita su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo depende de una base Qwen3.5-4B cuya licencia no se detalla en esta ficha; conviene verificar la licencia de la base antes de un uso comercial.
- Dependencia de custom_code: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor y complica el despliegue en entornos de produccion y en frameworks de inferencia optimizados.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto experimental sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleRabbits/d3-mini-zils-v2
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
