# parth-apti/qwen3.5-2b-video-jev-lora

## Resumen

El modelo `qwen3.5-2b-video-jev-lora` es un adaptador LoRA desarrollado por el usuario parth-apti sobre el modelo base Qwen/Qwen3.5-2B. Su proposito es responder preguntas de opcion multiple cerrada sobre videos cortos: conteo de personas, aglomeracion, nivel de actividad, velocidad de movimiento, objeto en mano, presencia de acciones, identidad de actividad, orden temporal y tipo de escena. Se trata, por tanto, de un ajuste muy especializado para video-question-answering y no de un modelo de proposito general.

El adaptador se entreno mediante destilacion de un modelo profesor de mayor tamano (`qwen3.7-flash`), usando las distribuciones de voto del profesor sobre las opciones con una perdida KL. El entrenamiento empleo exclusivamente el "commercial mix" formado por los conjuntos MEVA y Perception Test, ambos con licencia CC BY 4.0, sin datos de Charades. El resultado es un adaptador pequeno (repo de 0,1 GB) que mejora sustancialmente la precision del modelo base en las familias de preguntas para las que fue disenado.

La relevancia de este modelo radica en que demuestra como un adaptador LoRA de rango bajo puede superar a su modelo base e incluso al profesor en una tarea acotada de video QA, con un coste computacional minimo. Esta pensado para pipelines de analisis de video donde las preguntas son cerradas y el vocabulario de respuestas esta predefinido, no para razonamiento abierto sobre video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5-2B con capas de atencion lineal (linear-attention) |
| Parametros totales | No disponible (adaptador LoRA r=16 sobre modelo base de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un modelo que combina capas de atencion completa con capas de atencion lineal (linear-attention). El LoRA tiene rango r=16 y se aplica unicamente al modelo de lenguaje: afecta a las proyecciones q/k/v/o de la atencion completa, a `in_proj_qkv`, `in_proj_z` y `out_proj` de la atencion lineal, y a las proyecciones gate/up/down del MLP. La torre de vision permanece congelada durante el entrenamiento.

El entrenamiento se realizo por destilacion desde el profesor `qwen3.7-flash`, ajustando las distribuciones de probabilidad sobre las opciones con una perdida KL. Los videos se procesaron a 2 fps, hasta 64 fotogramas y lado largo de 448 px. Se entrenaron 2 epocas con learning rate 1e-4, 3% de warmup, batch 4 con 4 pasos de acumulacion y semilla 42; el mejor checkpoint se selecciono en el paso 2496 por validacion. En validacion (1.982 filas etiquetadas por el profesor), la concordancia con la opcion top del profesor paso del 62,5% al 86,0%, y el Brier de 0,473 a 0,160. Los datos de entrenamiento fueron MEVA (KF1) y Perception Test (splits train y valid), ambos CC BY 4.0.

## Capacidades

- Respuesta a preguntas de opcion multiple cerrada sobre videos cortos: conteo de personas, aglomeracion, nivel de actividad, velocidad de movimiento, objeto en mano, presencia de acciones, identidad de actividad, orden temporal y tipo de escena.
- Lectura de probabilidades por opcion: el modelo devuelve logits en la posicion de la letra de respuesta, lo que permite obtener una distribucion softmax sobre las opciones.
- Procesamiento de video a 2 fps con hasta 64 fotogramas y lado largo de 448 px.
- Modo de respuesta sin thinking: el prompt de generacion termina en un bloque think vacio para forzar que el siguiente token sea la letra de la opcion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso segun la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales adicionales (vision general, audio): no disponibles.

## Casos de uso

- Analisis de aforo en espacios publicos: el adaptador responde a preguntas de conteo de personas y aglomeracion sobre clips cortos, lo que permite estimar ocupacion en camaras de vigilancia o recintos sin necesidad de un modelo grande.
- Monitorizacion de actividad en entornos industriales o de seguridad: las preguntas de nivel de actividad y velocidad de movimiento permiten clasificar clips segun la intensidad de la accion detectada.
- Verificacion de presencia de acciones concretas: util para comprobar si en un clip aparece una accion determinada (por ejemplo, si alguien lleva un objeto en la mano), con respuesta probabilistica por opcion.
- Ordenacion temporal de eventos en clips cortos: la familia de preguntas de orden temporal permite etiquetar la secuencia de acciones dentro de un video breve.
- Clasificacion de tipo de escena: el modelo puede asignar un clip a una categoria de escena predefinida, util en pipelines de indexacion y catalogacion de video.
- Anotacion asistida de datasets de video: dado que devuelve distribuciones de probabilidad sobre opciones, puede usarse para preetiquetar clips y priorizar la revision humana en funcion de la confianza.
- Filtrado previo en pipelines de video QA: al ser un adaptador pequeno sobre un modelo de 2B, puede desplegarse como primer filtro para preguntas cerradas antes de invocar modelos mayores en casos abiertos.

## Benchmarks y rendimiento

Resultados sobre el conjunto gold respondido por humanos (837 preguntas), con intervalos bootstrap del 95% entre corchetes. La precision se mide contra la respuesta humana y el Brier contra la respuesta one-hot (menor es mejor).

| Modelo | Precision | Brier |
|---|---|---|
| Qwen3.5-2B sin adaptador | 64,3 | 0,448 |
| Este adaptador | 79,6 [76,7; 82,2] | 0,304 |
| Profesor (qwen3.7-flash) | 76,1 | 0,398 |

En el subconjunto MEVA + Perception Test (485 preguntas): precision 79,6 [75,9; 83,1], Brier 0,307. En validacion con etiquetas del profesor (1.982 filas), la concordancia con la opcion top paso del 62,5% al 86,0% y el Brier de 0,473 a 0,160. El autor indica que en benchmarks publicos (TemporalBench, TVBench) el modelo queda por detras de modelos mayores, ya que esta ajustado a las familias de preguntas descritas y no a video QA general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 2B en bfloat16, la huella es la del modelo base mas el adaptador (repo de 0,1 GB).
- GPU recomendadas: no disponible; el ejemplo de la model card usa `device_map="auto"` y bfloat16, por lo que cabe en GPUs consumer con memoria suficiente para un modelo de 2B.
- Cabe en GPU consumer: si, segun el tamano del modelo base de 2B, aunque no se detallan modelos concretos.
- Opciones de despliegue: transformers con PEFT (`PeftModel`), usando `AutoModelForImageTextToText` y `AutoProcessor`. Para GPU se recomienda instalar `flash-linear-attention` y `causal-conv1d`; en su ausencia, transformers recurre a codigo de referencia lento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (gold, 837 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3.5-2B) | 2B + LoRA r=16 | No disponible | 79,6 | Apache 2.0 | Hugging Face |
| Qwen3.5-2B sin adaptador | 2B | No disponible | 64,3 | Apache 2.0 | Hugging Face |
| qwen3.7-flash (profesor) | No disponible | No disponible | 76,1 | No disponible | No disponible |

No se dispone de datos de otros adaptadores o modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta ajustado a familias concretas de preguntas cerradas y no a video QA general; en benchmarks publicos como TemporalBench y TVBench queda por detras de modelos mayores.
- Puntos debiles identificados por el autor: identidad de actividad en MEVA y orden temporal.
- Las camaras de MEVA se solapan en campo de vision, por lo que las camaras reservadas para validacion prueban nuevos puntos de vista, no eventos nuevos; esto puede sobreestimar la generalizacion a escenarios totalmente distintos.
- Riesgo de alucinacion: no documentado explicitamente, pero al ser un modelo de opcion multiple la salida se restringe a letras de opcion, lo que limita respuestas fuera de ese conjunto.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: el adaptador es Apache 2.0, pero se solicita acreditar los datasets MEVA y Perception Test (CC BY 4.0) cuando se use.
- Para produccion: es necesario desactivar el thinking en el prompt y leer los logits en la posicion de la letra de respuesta; sin `flash-linear-attention` y `causal-conv1d` en GPU el rendimiento puede degradarse por el codigo de referencia lento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/parth-apti/qwen3.5-2b-video-jev-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset MEVA: https://mevadata.org/
- Dataset Perception Test: https://github.com/google-deepmind/perception_test
