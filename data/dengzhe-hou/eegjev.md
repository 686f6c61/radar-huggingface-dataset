# dengzhe-hou/EEGJev

## Resumen

EEGJev es un modelo de decision guiado por pregunta para electroencefalografia (EEG), desarrollado por el usuario dengzhe-hou y publicado en Hugging Face bajo el identificador `dengzhe-hou/EEGJev`. Su funcion no es generar texto libre, sino puntuar en una sola pasada un conjunto de respuestas candidatas a partir de la representacion de una ventana de senal EEG y de una pregunta asociada. Se trata, por tanto, de un modelo de question answering discriminativo orientado a senal biomedica, no de un modelo de lenguaje generativo.

La arquitectura combina un codificador CBraMod afinado especificamente para EEG con un codificador de texto MPNet congelado que procesa la pregunta y las opciones de respuesta. Sobre esas representaciones, una cabeza de decision puntua los candidatos. El modelo cubre varios tipos de respuesta: atributos unicos, respuestas emparejadas, comparaciones entre dos ventanas y cuestiones de temporizacion en ventanas largas, ademas de una rama para categorias ordenadas y otra cabeza entrenada por separado para decidir si conviene responder cuando no hay una opcion adecuada.

La version documentada es EEGJev v1.3, asociada al benchmark EEGJev-Bench v1.3 y evaluada sobre 19 fuentes publicas de EEG (con puntuaciones de test para 17 de ellas). En el momento de redactar esta ficha el repositorio de pesos aparece vacio (0.0 GB) y la model card indica que los checkpoints y el paquete de inferencia ejecutable estan en preparacion, por lo que no es posible un despliegue inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: codificador CBraMod (EEG) afinado + codificador MPNet (texto) congelado + cabeza de decision sobre candidatos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana EEG y la longitud de la pregunta; la model card menciona ventanas largas sin cifra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modulo de texto es MPNet, pero no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB; checkpoints en preparacion) |

## Arquitectura y entrenamiento

EEGJev sigue un esquema de dos torres con fusion tardia y cabeza de puntuacion. La torre de senal es un CBraMod afinado que codifica la ventana de EEG; la torre de texto es un MPNet congelado que codifica conjuntamente la pregunta y cada respuesta candidata. Las representaciones resultantes alimentan una cabeza que puntua todos los candidatos en una unica pasada, en lugar de generar la respuesta token a token. La model card senala que algunos componentes del modelo dependen de la fuente de registro y de la longitud de la ventana, lo que implica cierta especializacion por dominio de senal.

El sistema incorpora varias cabezas o ramas de decision: una para atributos unicos, una para las respuestas individuales de preguntas emparejadas, una para comparaciones entre dos ventanas, una para temporizacion en ventanas largas, una rama adicional para categorias ordenadas y una cabeza entrenada de forma separada que decide si responder cuando puede no existir una opcion adecuada (abstencion). No se han publicado en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre uso de RLHF o DPO; el entrenamiento se describe como ajuste supervisado sobre el benchmark EEGJev-Bench.

## Capacidades

- Puntuacion de respuestas candidatas sobre senal EEG en una sola pasada (question answering discriminativo).
- Manejo de preguntas de atributo unico sobre una ventana de EEG.
- Respuestas a preguntas emparejadas, evaluando cada respuesta individual por separado.
- Comparaciones entre dos ventanas de EEG.
- Preguntas de temporizacion sobre ventanas largas.
- Clasificacion en categorias ordenadas mediante una rama dedicada.
- Deteccion de ausencia de opcion adecuada y abstencion mediante una cabeza entrenada especificamente para ello.
- Procesamiento de texto de pregunta y opciones mediante un codificador MPNet congelado.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Investigacion en decodificacion de EEG: usar el modelo para responder preguntas cerradas sobre una ventana de senal (por ejemplo, atributos de la tarea o del estimulo) dentro de un pipeline experimental, aprovechando la puntuacion de candidatos en una sola pasada.
- Evaluacion estandarizada de modelos EEG: emplear EEGJev-Bench v1.3 y este modelo como referencia para comparar codificadores de senal sobre las 19 fuentes publicas recogidas en el benchmark.
- Clasificacion de categorias ordenadas: aplicar la rama especifica para tareas donde las etiquetas tienen un orden natural (niveles de intensidad, escalas), en lugar de una clasificacion nominal plana.
- Analisis comparativo entre ventanas: utilizar la capacidad de comparacion de dos ventanas para estudios que contrastan condiciones o segmentos temporales de una misma grabacion.
- Deteccion de casos sin respuesta valida: integrar la cabeza de abstencion en sistemas de anotacion asistida donde sea preferible no responder antes que forzar una opcion incorrecta.
- Filtrado y control de calidad de datos EEG: puntuar candidatos sobre ventanas largas para descartar o etiquetar segmentos antes de un analisis posterior, apoyandose en la rama de temporizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la evaluacion sobre 19 fuentes publicas de EEG con puntuaciones de test para 17 de ellas, y remite al manuscrito para los splits de participantes, la cobertura de cada baseline y la agregacion ponderada por fuente, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse el numero de parametros ni el formato de pesos, no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende del tamano final del checkpoint de CBraMod y de la cabeza de decision.
- Opciones de despliegue: no disponible. La model card indica que el paquete de inferencia ejecutable esta en preparacion; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM generativos, no a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria (codificadores EEG como CBraMod base u otros modelos de question answering sobre senal).

## Limitaciones y advertencias

- Los pesos no estan publicados en el repositorio (0.0 GB); la model card indica que los checkpoints y el paquete de inferencia estan en preparacion, por lo que el modelo no es desplegable actualmente.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial.
- No se declaran idiomas soportados para el modulo de texto.
- Algunos componentes dependen de la fuente de registro y de la longitud de la ventana, lo que puede limitar la generalizacion a nuevas fuentes de EEG no representadas en el benchmark.
- Solo hay puntuaciones de test para 17 de las 19 fuentes evaluadas, segun la model card.
- Riesgo de sesgo ligado a la composicion de las fuentes publicas de EEG utilizadas; no se documenta analisis de sesgo en la informacion disponible.
- Riesgo de respuesta incorrecta cuando la opcion correcta no esta entre los candidatos; la cabeza de abstencion mitiga este caso pero no lo elimina.
- No es un modelo generativo: no debe emplearse para generacion de texto, codigo ni tareas fuera del question answering sobre EEG.
- No se han publicado cifras de benchmarks, lo que impide validar el rendimiento de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dengzhe-hou/EEGJev
- Dataset EEGJev-Bench: https://huggingface.co/datasets/dengzhe-hou/EEGJev-Bench
- Repositorio de codigo y benchmark: https://github.com/dengzhe-hou/EEGJev
- Pagina del proyecto: https://dengzhe-hou.github.io/EEGJev/
