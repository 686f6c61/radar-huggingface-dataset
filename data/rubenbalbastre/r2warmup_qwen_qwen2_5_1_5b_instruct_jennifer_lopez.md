# rubenbalbastre/r2warmup_qwen_qwen2_5_1_5b_instruct_jennifer_lopez

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante fine-tuning supervisado (SFT) con la libreria TRL sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No es un modelo completo ni un modelo fundacional: es un conjunto de pesos de adaptador (0,3 GB de repositorio) que debe cargarse junto al modelo base para producir texto. El autor es el usuario de HuggingFace rubenbalbastre y la ficha se publico el 24 de septiembre de 2026, sin descargas ni valoraciones registradas hasta la fecha.

El identificador del repositorio (`r2warmup_qwen_qwen2_5_1_5b_instruct_jennifer_lopez`) y la etiqueta `base_model:adapter:/storage/scratch/.../machine-unlearning-llm/outputs/model/...` apuntan a un pipeline de investigacion sobre desaprendizaje automatico (machine unlearning) en modelos de lenguaje. El termino `warmup` y la referencia a una entidad concreta sugieren una etapa de calentamiento orientada a eliminar o atenuar conocimiento especifico del modelo base, pero esto es una inferencia a partir de los metadatos, no una afirmacion documentada por el autor.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo habitual de publicacion de adaptadores PEFT para investigacion reproducible. Por otro, al tratarse de un artefacto sin model card desarrollada, sin licencia declarada y sin evaluacion publicada, sirve como caso representativo de los riesgos de reutilizar pesos de terceros en produccion sin trazabilidad de datos ni de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2; el modelo base es Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador. Modelo base: 1.540 millones de parametros (1,5B) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No especificada en la informacion del adaptador. Modelo base: 32.768 tokens, ampliable mediante YaRN |
| Tipos de cuantizacion | No disponibles para el adaptador. El modelo base admite fp16/bf16, int8 e int4 (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos de adaptador LoRA); libreria declarada: PEFT 0.19.1 |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con LoRA y SFT usando el ecosistema TRL/PEFT (version de PEFT declarada: 0.19.1). No se especifican en la informacion proporcionada el rango (rank) de LoRA, el valor de alpha, las capas objetivo, la tasa de aprendizaje, el numero de pasos, el tamano del dataset ni su composicion. Tampoco se documenta si hubo etapas posteriores de alineamiento (DPO, RLHF) ni mezcla de precision durante el entrenamiento.

La arquitectura subyacente corresponde al modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 28 capas con atencion por consultas agrupadas (GQA), activacion SwiGLU, normalizacion RMSNorm y embeddings de entrada/salida atados (tied embeddings); estos datos proceden de las especificaciones publicas del modelo base y no estan confirmados en la ficha del adaptador. Respecto a innovaciones tecnicas, la unica pista es la ruta interna del repositorio de entrenamiento (`machine-unlearning-llm`), que sugiere un procedimiento de desaprendizaje por etapas; no hay articulo, blog ni documentacion que describa el metodo. La referencia `arxiv:2608.17804` aparece en la ficha, pero no se aporta el titulo, los autores ni el contenido del paper.

## Capacidades

- Generacion de texto conversacional: el modelo base es un modelo instruct con plantilla de chat, por lo que el adaptador hereda el formato multi-turno. El comportamiento concreto tras el fine-tuning no esta evaluado.
- Razonamiento y matematicas basicas: capacidades propias del modelo base de 1,5B; no hay evaluacion posterior al adaptador.
- Generacion de codigo: el modelo base cubre lenguajes habituales, pero el adaptador no documenta mejora ni degradacion en esta tarea.
- Soporte multilingue: no documentado en la ficha del adaptador; el modelo base de la familia Qwen2.5 declara soporte para varias decenas de idiomas.
- Tool calling y function calling: no documentado en el adaptador. El modelo base admite salidas estructuradas y llamadas a funciones, pero no hay confirmacion de que el fine-tuning las preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidad especial: el proposito declarado en los metadatos es el desaprendizaje de conocimiento concreto, no una mejora funcional. Se desconoce que informacion se ha eliminado y con que eficacia.

## Casos de uso

- Investigacion en desaprendizaje automatico: el adaptador puede usarse como punto de partida o como referencia intermedia (`warmup`) en experimentos de eliminacion selectiva de conocimiento, comparando la salida del modelo base con la del modelo con adaptador aplicado sobre las mismas peticiones.
- Reproduccion de pipelines PEFT + TRL: sirve para validar configuraciones de entrenamiento de adaptadores LoRA de bajo rango sobre un modelo de 1,5B, ya que el coste de entrenamiento es reducido y el artefacto ocupa 0,3 GB.
- Pruebas de carga y evaluacion comparativa de adaptadores: permite medir el impacto de aplicar y retirar un adaptador LoRA en latencia, uso de VRAM y calidad de salida, sin necesidad de GPU de gama alta.
- Docencia y formacion: como ejemplo practico de publicacion de un adaptador en HuggingFace y de las carencias habituales de las model cards (licencia, datos, evaluacion) en artefactos de investigacion.
- Prototipado local en equipos sin infraestructura dedicada: al combinar un adaptador pequeno con un modelo base de 1,5B, el conjunto puede ejecutarse en portatiles con GPU integrada o CPU, util para demos internas.
- Auditoria de riesgos de terceros: caso de estudio para equipos de cumplimiento que necesitan evaluar que ocurre cuando se descarga un adaptador sin licencia declarada ni trazabilidad de datos de entrenamiento.
- Analisis de superficialidad del olvido: dado que un adaptador LoRA puede retirarse o combinarse con los pesos base, el artefacto permite estudiar hasta que punto el olvido inducido por adaptadores es reversible frente a tecnicas que modifican los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye seccion de evaluacion, no aporta metricas (MMLU, GSM8K, HumanEval u otras) y no realiza comparaciones con el modelo base ni con adaptadores alternativos.

## Requisitos de hardware

- VRAM para inferencia (pesos): con el modelo base en bf16/fp16, aproximadamente 3,1 GB; en int8, en torno a 1,7 GB; en int4, alrededor de 1,0 a 1,2 GB. Estimaciones derivadas del recuento de parametros del modelo base (1,54B) y sujetas a variacion segun el runtime y el backend de cuantizacion.
- Memoria de cache KV: para el modelo base en fp16 con GQA (2 cabezas KV, dimension de cabeza 128, 28 capas), el coste es de aproximadamente 28 KB por token, es decir, cerca de 0,9 GB con la ventana completa de 32.768 tokens. Este dato no esta confirmado en la informacion del adaptador.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM es suficiente en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En int4 cabe en GPU con 4-6 GB o incluso en CPU. Para entrenamiento del adaptador completo basta una GPU con 12-16 GB; para despliegue en produccion con alta concurrencia son preferibles A100 o H100, aunque estan sobredimensionadas para un modelo de este tamano.
- Opciones de despliegue: el adaptador puede fusionarse con el modelo base (merge de LoRA) y servirse con vLLM, TGI o SGLang; tambien puede convertirse a GGUF y ejecutarse con llama.cpp u Ollama. La integracion directa en PyTorch usa transformers junto con PEFT.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| rubenbalbastre/r2warmup_qwen_qwen2_5_1_5b_instruct_jennifer_lopez | Adaptador LoRA sobre base de 1,54B; rango no disponible | No especificado | No disponible | Repositorio publico, 0 descargas | No disponible |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | 32.768 tokens | Apache 2.0 | Ampliamente desplegado | Benchmarks publicados por el autor del modelo base |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | Ampliamente desplegado | Benchmarks publicados por el autor del modelo base |
| meta-llama/Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Requiere aceptacion de terminos | Benchmarks publicados por el autor del modelo base |

Los datos de los modelos de referencia proceden de sus fichas publicas y se incluyen solo como contexto de categoria; no han sido verificados contra la informacion proporcionada sobre este adaptador, que carece de evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas de regresion ni comparacion con el modelo base, por lo que se desconoce si el adaptador degrada capacidades generales.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0, la falta de licencia explicita en el adaptador impide asumir condiciones de uso comercial. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Trazabilidad de datos inexistente: no se documenta el dataset de SFT, su procedencia ni si contiene datos personales o con derechos de autor. En un pipeline de desaprendizaje esto es especialmente relevante, porque puede implicar el tratamiento de informacion sobre personas reales.
- Olvido potencialmente reversible o incompleto: si el objetivo era eliminar conocimiento concreto, un adaptador LoRA no garantiza la eliminacion efectiva, ya que puede retirarse, recombinarse o complementarse con los pesos base. No hay ninguna medicion de eficacia del desaprendizaje.
- Riesgo de alucinacion: inherente a un modelo de 1,5B; el adaptador no incluye salvaguardas documentadas ni evaluacion de veracidad.
- Idiomas no documentados: se desconoce que lenguas mantiene el adaptador tras el fine-tuning y si el rendimiento en castellano se ha visto afectado.
- Sesgos desconocidos: no hay analisis de sesgos ni de toxicidad. Un fine-tuning dirigido sobre una entidad concreta puede introducir asociaciones no deseadas.
- Uso en produccion no recomendado: se trata de un artefacto de investigacion con cero descargas, sin versionado de datos, sin model card efectiva y sin garantias de mantenimiento.
- Referencia a paper no verificada: la ficha enlaza a `arxiv:2608.17804` sin titulo ni resumen; no se ha podido confirmar su contenido a partir de la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rubenbalbastre/r2warmup_qwen_qwen2_5_1_5b_instruct_jennifer_lopez
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper referenciado en la model card: https://arxiv.org/abs/2608.17804
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Documentacion de transformers: https://huggingface.co/docs/transformers
