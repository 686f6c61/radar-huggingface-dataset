# mwnuk/robot-learning-guide-models

## Resumen

`mwnuk/robot-learning-guide-models` es un repositorio de checkpoints docentes publicados por Matthew Wnuk como material complementario de una guia de aprendizaje sobre robotica y aprendizaje automatico. No se trata de un modelo de lenguaje ni de un modelo fundacional: contiene pesos de pequenas redes neuronales entrenadas sobre problemas de juguete para que los cuadernos (notebooks) de la guia se ejecuten en segundos sin necesidad de reentrenar. El autor lo declara explicitamente: "These are teaching models on toy problems, not models for use elsewhere".

El repositorio agrupa dos familias de checkpoints. La primera, bajo `seq2seq/`, incluye tres modelos de reversion de secuencias: un encoder-decoder GRU de 125.000 parametros, la misma arquitectura con atencion de 155.000 parametros y un transformer pequeno de 530.000 parametros. La segunda, bajo `generative/`, contiene dos perceptrones multicapa (MLP) entrenados sobre un conjunto de datos 2D de dos medias lunas, uno con perdida de flow matching y otro con perdida de difusion.

Su relevancia es puramente pedagogica y de reproducibilidad: sirven como referencia para verificar que los cuadernos del repositorio `wnukmat/robot-learning-notebooks` funcionan correctamente y para comparar arquitecturas clasicas (GRU, atencion, transformer) y metodos generativos (flow matching frente a difusion) en un entorno controlado. No estan pensados para inferencia en produccion, ni para tareas de robotica reales, ni para uso como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU encoder-decoder, GRU con atencion, transformer pequeno y MLP (segun checkpoint) |
| Parametros totales | 125.000 (GRU), 155.000 (GRU con atencion), 530.000 (transformer); MLP no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (problema de reversion de secuencias de juguete) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en coma flotante) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

Los checkpoints de `seq2seq/` cubren tres variantes de un mismo problema de reversion de secuencias: un encoder-decoder basado en GRU, la misma arquitectura con un mecanismo de atencion anadido y un transformer de dimension reducida. El objetivo es didactico: ilustrar como la atencion y la autoatencion mejoran el modelado de dependencias en secuencias comparado con un cuello de botella recurrente puro. Los tres modelos se entrenan desde cero con los cuadernos de `1_foundations/05_sequence_to_sequence`, que incluyen un interruptor `TRAIN = True` para reproducir los pesos.

Los checkpoints de `generative/` son dos MLP entrenados sobre un dataset sintetico 2D con forma de dos medias lunas. Uno se optimiza con una perdida de flow matching y otro con una perdida de difusion, con el fin de comparar ambos paradigmas generativos sobre la misma distribucion de datos. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO, ya que no son modelos de lenguaje y el autor no detalla esos aspectos en la model card.

## Capacidades

- Reversion de secuencias: los tres modelos de `seq2seq/` aprenden a invertir secuencias de entrada, una tarea de juguete para estudiar arquitecturas secuenciales.
- Modelado generativo 2D: los dos MLP de `generative/` aprenden a generar muestras de una distribucion bidimensional de dos medias lunas.
- Comparacion de arquitecturas: permiten contrastar GRU, GRU con atencion y transformer sobre la misma tarea.
- Comparacion de metodos generativos: permiten contrastar flow matching frente a difusion sobre el mismo dataset.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision ni audio.
- No dispone de modo thinking ni de ninguna capacidad de proposito general.

## Casos de uso

- Docencia de arquitecturas secuenciales: usar los tres checkpoints de `seq2seq/` para mostrar en clase como un cuello de botella recurrente limita el rendimiento y como la atencion y el transformer lo mejoran, sin necesidad de entrenar durante horas.
- Verificacion de cuadernos: cargar los pesos con `guide_utils.data.fetch_model(...)` para comprobar que el entorno del alumno esta correctamente configurado antes de lanzar los entrenamientos con `TRAIN = True`.
- Comparacion de flow matching y difusion: emplear los dos MLP de `generative/` para visualizar la evolucion de las muestras generadas por cada metodo sobre el dataset de dos medias lunas.
- Reproducibilidad de resultados: servir como referencia fija para validar que una modificacion en el codigo de entrenamiento reproduce los mismos pesos o resultados.
- Material de autoaprendizaje: permitir que un desarrollador interesado en robotica y aprendizaje automatico recorra la guia sin depender de recursos de computo.
- Pruebas de integracion de utilidades: validar la funcion `fetch_model` y el empaquetado `guide_utils` en pipelines de CI del repositorio de cuadernos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos, dado el tamano de los checkpoints (125.000 a 530.000 parametros en `seq2seq/`, MLP de tamano no especificado en `generative/`).
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) o incluso CPU; los modelos estan disenados para ejecutarse en segundos.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: PyTorch nativo mediante el paquete auxiliar `guide_utils`; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no son modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por el tamano de los modelos, la inferencia es practicamente instantanea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mwnuk/robot-learning-guide-models` | 125k-530k (seq2seq) y MLP no disponible | no aplica | Reversion de secuencias y generacion 2D | MIT | Hugging Face |
| Modelos de juguete de tutoriales seq2seq (p. ej. los de PyTorch) | Del orden de 10k-1M | no aplica | Traduccion o reversion de juguete | Variable | Repositorios de tutoriales |
| Checkpoints de difusion 2D de tutoriales | Del orden de 10k-100k | no aplica | Generacion 2D | Variable | Repositorios de tutoriales |

No se dispone de una comparativa con modelos de robotica reales (por ejemplo, politicas de imitacion o modelos de vision-lenguaje-accion) porque este repositorio no compite en esa categoria: son checkpoints docentes sobre problemas de juguete.

## Limitaciones y advertencias

- No son modelos de proposito general: el propio autor indica que son "teaching models on toy problems, not models for use elsewhere".
- No procesan lenguaje natural ni imagenes reales; no deben emplearse en tareas de robotica, vision o NLP.
- No se han publicado datos sobre sesgos, alucinacion o limitaciones de contexto porque no aplican a su naturaleza.
- La licencia MIT permite uso comercial y modificacion, pero el uso comercial de estos checkpoints carece de sentido practico por su naturaleza didactica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que confirma que es material de acompanamiento y no un artefacto distribuido a gran escala.
- No se especifican los idiomas soportados porque no procesan texto en ningun idioma.

## Enlaces

- Hugging Face: https://huggingface.co/mwnuk/robot-learning-guide-models
- Repositorio de cuadernos: https://github.com/wnukmat/robot-learning-notebooks
- Guia: https://www.matthewwnuk.com/guide.html
