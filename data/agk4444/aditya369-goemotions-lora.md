# agk4444/aditya369-goemotions-lora

## Resumen

El repositorio `agk4444/aditya369-goemotions-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3-4B`, publicado por el usuario de Hugging Face agk4444. Se distribuye como un repositorio PEFT de aproximadamente 0,1 GB en formato safetensors, lo que indica que contiene unicamente los pesos del adaptador y no una copia completa del modelo base. Para poder usarlo hay que cargar primero Qwen3-4B y aplicar despues el adaptador.

Por el nombre del repositorio y por la actividad publica del mismo autor, el adaptador parece orientado a clasificacion de emociones, presumiblemente sobre el dataset GoEmotions o sobre el dataset `dair-ai/emotion`, pero la model card no documenta ni el dataset, ni el procedimiento de entrenamiento, ni las metricas obtenidas. No hay informacion sobre licencia, idiomas soportados ni hiperparametros.

El interes de esta ficha es, por tanto, limitado y descriptivo: se trata de un artefacto experimental sin documentacion, con cero descargas y cero "likes" en el momento de la consulta, y sin resultados de evaluacion publicados. Cualquier uso en produccion exigiria validar primero que tarea resuelve realmente, con que etiquetas y con que calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer denso Qwen3-4B. El adaptador no define arquitectura propia |
| Parametros totales | No disponible para el adaptador (tamano del repo: 0,1 GB). El modelo base Qwen3-4B tiene aproximadamente 4 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador. El modelo base Qwen3-4B declara 32.768 tokens de contexto nativo, ampliables |
| Tipos de cuantizacion | No disponible. El repositorio se publica en safetensors con los pesos del adaptador sin cuantizar; no se documenta ninguna cuantizacion |
| Idiomas soportados | No disponible. Si el ajuste se hizo sobre GoEmotions, el corpus de entrenamiento es en ingles |
| Licencia | No disponible. La licencia del modelo base Qwen3-4B es Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se insertan en las capas del modelo base y que se entrenan congelando el resto de los pesos. La libreria declarada es PEFT y la version de framework indicada en la model card es PEFT 0.21.2. El modelo base sobre el que se aplica es Qwen3-4B, un transformer denso de la familia Qwen3. No se especifica sobre que modulos (q_proj, k_proj, v_proj, o_proj, mlp) se aplicaron los adaptadores, ni el rango, ni el valor de alpha.

No hay ninguna informacion sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si se uso QLoRA, ni si hubo una fase de alineacion posterior (RLHF, DPO). La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]", y la unica referencia tecnica que aparece en las etiquetas es `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono y que forma parte de la plantilla original, no a un paper del modelo.

## Capacidades

- Clasificacion de emociones en texto: es la finalidad que sugiere el nombre del repositorio (`goemotions-lora`). El dataset GoEmotions define 27 categorias de emocion mas una clase neutral, y es multi-etiqueta, pero no hay confirmacion documental de que este adaptador use ese esquema.
- Generacion de texto: el adaptador hereda la capacidad generativa del modelo base Qwen3-4B, aunque el ajuste fino puede degradarla si el entrenamiento fue exclusivamente de clasificacion.
- Razonamiento y codigo: capacidad heredada de Qwen3-4B, no verificada ni documentada para este adaptador.
- Tool calling / function calling: no documentado. Qwen3-4B soporta plantillas de tool calling, pero el ajuste especifico puede haber alterado ese comportamiento.
- Modo "thinking": Qwen3 introduce modos de razonamiento explicito en el chat template; no hay ninguna confirmacion de que este adaptador los conserve.
- Capacidades multilingues: no disponibles. El corpus probable de entrenamiento (GoEmotions o `dair-ai/emotion`) es en ingles.
- Vision o audio: no soportado. El modelo base es exclusivamente de texto.

## Casos de uso

Todos los casos que se enumeran a continuacion son hipoteticos y dependen de que se valide previamente que el adaptador clasifica emociones con el esquema de etiquetas esperado. No hay evaluacion publicada que lo respalde.

- Analisis de sentimiento y emociones en redes sociales: el modelo podria procesar tweets o comentarios cortos y devolver una o varias etiquetas emocionales, aprovechando la ventana de contexto larga del modelo base para agrupar varios mensajes en una sola llamada.
- Monitorizacion de reputacion de marca: clasificar menciones de una marca en foros y redes para detectar picos de enfado, frustracion o satisfaccion, y activar alertas cuando la proporcion de emociones negativas supere un umbral.
- Enrutado de tickets de soporte: etiquetar automaticamente tickets de atencion al cliente por emocion predominante (enfado, confusion, satisfaccion) para priorizar la cola y asignar los casos mas urgentes a agentes humanos.
- Moderacion de comunidades: detectar mensajes con carga emocional negativa alta en foros o chats para revisarlos antes de su publicacion, siempre como filtro de primera pasada y con revision humana.
- Investigacion en psicologia computacional y ciencias sociales: analisis a escala de corpus textuales para estudiar la distribucion de emociones en funcion del tema, el autor o el periodo temporal.
- Etiquetado asistido de datasets: preanotar grandes volumenes de texto con etiquetas emocionales para que anotadores humanos solo tengan que revisar y corregir, reduciendo el coste de construccion de corpus.
- Enriquecimiento de analitica de producto: procesar resenas de aplicaciones o encuestas abiertas para extraer la emocion dominante y cruzarla con metricas de retencion o churn.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna seccion de evaluacion cumplimentada y no existe ninguna tabla comparativa en el repositorio. Tampoco se conocen datos de latencia o throughput medidos con este adaptador.

## Requisitos de hardware

- El adaptador por si solo no puede ejecutarse: requiere cargar el modelo base Qwen3-4B, por lo que el consumo de recursos lo determina el modelo base, no el adaptador de 0,1 GB.
- VRAM estimada para inferencia del modelo base en precision completa (fp16/bf16): aproximadamente 8-9 GB solo para los pesos, mas memoria para el contexto y el cache KV.
- VRAM estimada con cuantizacion de 4 bits del modelo base: aproximadamente 3-4 GB para los pesos, lo que permite ejecucion en GPU de consumo.
- GPU de consumo: una RTX 3090, RTX 4090 o similar con 24 GB puede ejecutar el modelo base en fp16 o con cuantizacion de forma holgada. Tarjetas con 8-12 GB (RTX 3060, RTX 4070) pueden ejecutarlo en 4 bits.
- GPU de datacenter: A100 40/80 GB, H100, L40S. No son necesarias para un modelo de 4B, pero son utiles si se despliegan muchas replicas o lotes grandes.
- Opciones de despliegue: al ser un adaptador PEFT, el camino natural es `transformers` + `peft` (o `QLoRA` para cargar el base en 4 bits). El adaptador puede fusionarse con el base para generar un modelo completo y servirse con vLLM, TGI o llama.cpp/Ollama (estos ultimos requieren conversion a GGUF).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| agk4444/aditya369-goemotions-lora | Adaptador LoRA sobre Qwen3-4B | Adaptador de ~0,1 GB sobre un base de ~4B | No disponible | No disponible | 0 descargas, sin evaluacion |
| agk4444/aditya369 | Modelo fusionado sobre Qwen3-4B, 4 bits | ~4B | No disponible | No disponible | Variante hermana del mismo autor |
| BERT / RoBERTa / DeBERTa-v3 | Encoders ajustados para clasificacion de emociones | 110M - 435M | 512 tokens | Variable (MIT, Apache 2.0, etc.) | Referencia habitual en la literatura de GoEmotions |
| Qwen/Qwen3-4B | Transformer denso de proposito general | ~4B | 32.768 tokens nativos | Apache 2.0 | Modelo base, ampliamente utilizado |

La comparacion con los encoders clasicos es la relevante aqui: para clasificacion de emociones en textos cortos, un DeBERTa-v3 ajustado suele ser mas rapido y mas barato de servir que un LLM de 4B adaptado con LoRA. No hay datos publicados que permitan afirmar cual rinde mejor en este caso concreto.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla por defecto sin rellenar. No se puede saber que dataset se uso, con que etiquetas, con que hiperparametros ni con que criterio de evaluacion.
- Licencia no declarada: al no especificarse licencia del adaptador, no se puede asumir uso comercial permitido, aunque el modelo base sea Apache 2.0. Conviene contactar con el autor antes de cualquier uso productivo.
- Ausencia total de validacion: cero descargas y cero "likes". No hay terceros que hayan reproducido el resultado. Tratarlo como artefacto experimental, no como modelo listo para produccion.
- Ambiguedad sobre la tarea: el sufijo `goemotions` sugiere clasificacion multi-etiqueta con 27 emociones, pero el mismo autor publica otro adaptador (`aditya369-lora`) asociado al dataset `dair-ai/emotion`, de 6 clases. Es imprescindible verificar cual de los dos esquemas usa realmente este adaptador.
- Riesgo de alucinacion: si el modelo se usa para generar texto libre en lugar de solo clasificar, hereda el riesgo de alucinacion de Qwen3-4B, agravado por un ajuste fino no documentado que puede haber degradado las capacidades generativas.
- Sesgos: si el entrenamiento se hizo sobre GoEmotions o `dair-ai/emotion`, ambos corpus estan compuestos por textos en ingles extraidos de Reddit o Twitter, con los sesgos demograficos, tematicos y de registro propios de esas plataformas.
- Limitacion idiomatica: no hay ninguna indicacion de soporte de castellano ni de otros idiomas. Es previsible un rendimiento muy pobre fuera del ingles.
- Dependencia del modelo base: cualquier cambio de comportamiento depende de la version concreta de Qwen3-4B cargada y del chat template utilizado. Un template incorrecto puede degradar silenciosamente los resultados.
- Sin garantias de estabilidad: el repositorio se actualizo por ultima vez poco despues de su creacion y no hay historial de mantenimiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/agk4444/aditya369-goemotions-lora
- Modelo fusionado del mismo autor: https://huggingface.co/agk4444/aditya369
- Perfil del autor: https://huggingface.co/agk4444
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Proyecto de referencia sobre ajuste fino para clasificacion de emociones en GoEmotions: https://github.com/Akashkar00/emotion-aware-llm-finetuning
- Referencia citada en la plantilla (Lacoste et al., 2019, huella de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact#compute
