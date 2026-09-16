# huggingtime12/Qwen3_1.7_PhoMT_GRPO_BLEU_r64

## Resumen

El modelo `huggingtime12/Qwen3_1.7_PhoMT_GRPO_BLEU_r64` es un adaptador LoRA (PEFT) publicado por el usuario `huggingtime12`, entrenado sobre el modelo base `Qwen/Qwen3-1.7B`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que deben cargarse junto al modelo base para poder ejecutarse. El repositorio ocupa 3,1 GB y se distribuye en formato `safetensors`, con la librería `peft` (versión 0.20.0) y las etiquetas `grpo`, `lora`, `transformers` y `trl`.

El identificador del modelo sugiere, sin confirmación en la model card, un ajuste fino orientado a traducción automática sobre el corpus PhoMT, entrenado con GRPO (Group Relative Policy Optimization) y con BLEU como señal de recompensa, con un rango de LoRA de 64. La model card es la plantilla por defecto de HuggingFace y no aporta ningún dato adicional: no se declaran autoría, licencia, idiomas, datos de entrenamiento ni resultados de evaluación. Tampoco se ha publicado ningún benchmark y el repositorio acumula 0 descargas y 0 «likes», por lo que no existe validación comunitaria.

Su relevancia es, por tanto, limitada y fundamentalmente experimental: sirve como ejemplo reproducible de ajuste con RL sobre un modelo pequeño (1.700 millones de parámetros) y como caso de estudio de entrenamiento con recompensas automáticas de traducción. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no hay información verificable sobre su calidad ni sobre las condiciones de licencia del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Adaptador LoRA (PEFT) sobre un transformer denso de la familia Qwen3 |
| Parametros totales | No disponible para el adaptador. El modelo base Qwen/Qwen3-1.7B tiene 1.700 millones de parametros (dato publico del modelo base) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen3-1.7B soporta 32.768 tokens de forma nativa (dato publico del modelo base) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador, la cuantizacion se aplica tras fusionarlo con el modelo base (por ejemplo, GGUF Q4_K_M, AWQ o GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el adaptador. El modelo base Qwen/Qwen3-1.7B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-1.7B |
| Rango de LoRA | 64, segun el identificador del modelo (no confirmado en la model card) |
| Libreria y version | peft 0.20.0 (etiquetas: peft, transformers, trl) |
| Metodo de entrenamiento declarado | GRPO (etiqueta `grpo`) con recompensa asociada a BLEU, segun el identificador |
| Tamano del repositorio | 3,1 GB |
| Fecha de publicacion | 16 de septiembre de 2026 segun los metadatos del repositorio |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura del adaptador mas alla de lo que indican las etiquetas: se trata de un adaptador LoRA entrenado con la libreria TRL sobre el modelo Qwen3-1.7B. Qwen3-1.7B es un transformer denso con atencion por consultas agrupadas (GQA), normalizacion QK-Norm y activacion SwiGLU, con 1.700 millones de parametros y 32.768 tokens de contexto nativo. El adaptador anade matrices de bajo rango (segun el identificador, r=64) sobre las proyecciones del modelo base, sin modificar el resto de los pesos.

Tampoco se documentan los datos de entrenamiento, el numero de tokens vistos, la composicion del dataset ni los hiperparametros. La unica pista es el identificador `PhoMT`, que apunta al corpus PhoMT de traduccion chino-vietnamita, y la etiqueta `grpo`, que indica un ajuste mediante aprendizaje por refuerzo con ventajas relativas por grupo. Si esa interpretacion es correcta, el modelo habria sido optimizado con una recompensa basada en BLEU, una metrica automatica que depende de traducciones de referencia y que no correlaciona de forma fiable con la calidad percibida por traductores humanos.

El tamano del repositorio (3,1 GB) es llamativamente grande para un adaptador de rango 64 sobre 1.700 millones de parametros, lo que sugiere que el repositorio podria incluir checkpoints intermedios o estados del optimizador. Este extremo no esta confirmado en la informacion disponible.

## Capacidades

No hay informacion sobre capacidades en la model card. Lo que se enumera a continuacion se deduce del modelo base y del identificador, y debe verificarse empiricamente antes de cualquier uso:

- Generacion de texto y razonamiento basico: capacidades heredadas de Qwen3-1.7B, un modelo de proposito general de 1.700 millones de parametros.
- Traduccion automatica (no confirmado): el identificador sugiere especializacion en traduccion, presumiblemente en el par chino-vietnamita, pero no se declara el par de idiomas ni la direccion.
- Soporte de tool calling / function calling: heredado del modelo base Qwen3, que soporta plantillas de herramientas mediante su chat template; no verificado tras el ajuste con LoRA.
- Soporte de agentes y razonamiento multi-paso: Qwen3-1.7B dispone de modo de pensamiento, aunque el ajuste con GRPO orientado a traduccion podria haber degradado esta capacidad (olvido catastrofico).
- Capacidades multilingues: no declaradas para el adaptador. Qwen3 esta entrenado sobre 119 idiomas y dialectos, pero no hay garantia de que el adaptador los preserve.
- Capacidades especiales: ninguna declarada. No se mencionan vision, audio ni modo de razonamiento explicito para este adaptador.

## Casos de uso

- Traduccion automatica en produccion (si se confirma la especializacion en PhoMT): el modelo podria integrarse en un pipeline de traduccion chino-vietnamita de baja latencia, con un coste de inferencia muy inferior al de modelos de mayor tamano. Requiere una evaluacion propia con un conjunto de test reservado antes de desplegarlo.
- Traduccion asistida en aplicaciones de mensajeria o atencion al cliente: con 1.700 millones de parametros y un adaptador pequeno, es viable desplegarlo en una sola GPU de gama media o incluso en CPU cuantizado, lo que permite traduccion en tiempo real en flujos conversacionales.
- Generacion de datos sinteticos para aumentar corpus de traduccion: el modelo puede usarse para producir pares de traduccion adicionales que despues se filtren con una metrica automatica y se empleen en el entrenamiento de modelos mayores, un uso habitual en pipelines de traduccion de bajos recursos.
- Prototipado e investigacion en aprendizaje por refuerzo: el repositorio sirve como referencia para reproducir un ajuste con GRPO y recompensa BLEU sobre un modelo pequeno, y para comparar esta senal de recompensa con alternativas como COMET, chrF o modelos de recompensa neuronales.
- Despliegue en el borde o en entornos on-premise: fusionado con el modelo base y cuantizado a 4 bits, el modelo ocupa alrededor de 1 GB, lo que permite ejecutarlo en dispositivos con recursos limitados o en entornos donde los datos no pueden salir de la organizacion.
- Preprocesado de datos multilingues en pipelines de analitica: clasificacion de idioma, normalizacion de texto, traduccion de titulares o resumen de documentos cortos dentro de un ETL, siempre que la tarea se valide previamente.
- Evaluacion comparativa de estrategias de alineamiento: util como punto de partida para estudiar como afecta la optimizacion directa de BLEU al resto de capacidades del modelo base, un tema relevante en la literatura de recompensas automaticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, no se han encontrado resultados en la busqueda web y el repositorio no tiene descargas ni interacciones que permitan inferir un uso validado.

## Requisitos de hardware

Las siguientes estimaciones corresponden al modelo base de 1.700 millones de parametros mas el adaptador; no hay mediciones publicadas para este adaptador concreto.

- VRAM para inferencia (modelo fusionado, sin contar cache KV): aproximadamente 3,5 GB en fp16/bf16, 2 GB en cuantizacion de 8 bits y 1,2 GB en cuantizacion de 4 bits.
- VRAM adicional para cache KV: depende de la longitud de contexto. Con 32.768 tokens y GQA, la cache puede anadir varios GB en fp16, por lo que conviene limitar la longitud de secuencia en despliegues con poca memoria.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090) es suficiente en fp16. Las GPU de datacenter (A100, H100, L40S) funcionan sobradamente, pero resultan desproporcionadas para este tamano salvo que se necesite un throughput muy alto.
- Compatibilidad con GPU consumer: si, cabe con holgura en tarjetas de 8-12 GB, e incluso en tarjetas de 6 GB si se cuantiza a 4 bits y se recorta el contexto.
- CPU: es viable ejecutarlo en CPU tras fusionar el adaptador y convertir los pesos a GGUF.
- Opciones de despliegue: Transformers + PEFT para cargar el adaptador sin fusionar; vLLM o TGI tras fusionar los pesos; llama.cpp u Ollama tras convertir a GGUF (requiere fusionar y convertir previamente, ya que estos motores no cargan adaptadores PEFT de forma nativa en todos los casos).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentacion publica y no se han verificado para esta ficha. No existen adaptadores comparables directamente con este, dado que parte de un ajuste con GRPO y recompensa BLEU sin resultados publicados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3_1.7_PhoMT_GRPO_BLEU_r64 | 1,7B (base) + adaptador LoRA r=64 | No disponible (base: 32.768) | No disponible para el adaptador | HuggingFace, 0 descargas |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | 32.768 | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 | Licencia comunitaria de Llama 3.2 | HuggingFace |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | HuggingFace |
| Gemma-3-1B-IT | 1B | 32.768 | Terminos de uso de Gemma | HuggingFace |

Ninguna de estas alternativas esta especializada en traduccion chino-vietnamita, por lo que la comparacion solo es valida en terminos de tamano, contexto y licencia, no de calidad en la tarea.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace: no declara autoría real, datos de entrenamiento, hiperparametros ni evaluacion. La trazabilidad del modelo es nula.
- La licencia del adaptador no esta especificada. Aunque el modelo base es Apache 2.0, la ausencia de licencia en el repositorio del adaptador impide confirmar que su uso comercial este permitido. Conviene contactar con el autor antes de utilizarlo en produccion.
- El repositorio tiene 0 descargas y 0 «likes»: no hay evidencia de que el modelo haya sido validado por terceros.
- La fecha de creacion registrada (16 de septiembre de 2026) es posterior a la fecha actual, lo que indica metadatos no revisados y refuerza la cautela sobre el resto de la informacion.
- Si el entrenamiento uso BLEU como recompensa, es probable que exista sobreoptimizacion de esa metrica: mayor literalidad, sesgo hacia la longitud de las referencias y posible divergencia respecto a la calidad humana. BLEU es una metrica de solapamiento de n-gramas y no mide adecuadamente la fluidez ni la adecuacion.
- Riesgo de olvido catastrofico: un ajuste con RL orientado a una tarea concreta sobre un modelo de 1.700 millones de parametros puede degradar capacidades generales como el razonamiento, el codigo o el soporte de herramientas.
- Riesgo de alucinacion: inherente a los modelos de este tamano, especialmente en tareas de generacion abierta. En traduccion puede manifestarse como contenido inventado cuando el texto de origen es ambiguo o poco frecuente.
- No hay informacion sobre idiomas soportados ni sobre sesgos. Se desconoce el comportamiento en variedades dialectales, registro informal o dominios especializados.
- La ausencia de resultados de benchmarks impide cualquier comparacion objetiva con alternativas. Cualquier afirmacion sobre su calidad seria especulativa.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/huggingtime12/Qwen3_1.7_PhoMT_GRPO_BLEU_r64
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Blog de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Referencia citada en las etiquetas del repositorio (calculadora de impacto de carbono, no es el paper del modelo): https://arxiv.org/abs/1910.09700
- No se han encontrado enlaces adicionales. Los resultados de la busqueda web no contienen informacion relacionada con el modelo: corresponden a una empresa de sistemas de calefaccion (OEG) y son irrelevantes para esta ficha. No se dispone de paper, demo ni documentacion adicional del adaptador.
