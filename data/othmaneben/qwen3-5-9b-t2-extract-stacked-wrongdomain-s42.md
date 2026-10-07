# OthmaneBen/qwen3.5-9b-t2-extract-stacked-wrongdomain-s42

## Resumen

OthmaneBen/qwen3.5-9b-t2-extract-stacked-wrongdomain-s42 es un adaptador de ajuste fino publicado en HuggingFace por el usuario OthmaneBen. No se trata de un modelo completo, sino de un adaptador PEFT basado en DoRA (denominado QDoRA en la model card) con rango r=48 y semilla 42, que se aplica sobre el modelo base Qwen/Qwen3.5-9B. El repositorio ocupa 0,5 GB y contiene pesos en formato safetensors bajo licencia Apache 2.0.

El adaptador esta asociado a una tarea concreta denominada "T2 extraction" y, segun la model card, se ha apilado sobre un sustrato de control de dominio incorrecto ("wrong-domain control substrate"). Forma parte del material liberado junto al envio entropy-4582293, titulado "Fine-Tuning Shifts Form Before Competence", lo que sugiere que su proposito principal es servir como artefacto de investigacion para estudiar como el ajuste fino altera la forma de las representaciones antes que la competencia en la tarea.

Su relevancia es, por tanto, experimental y no de producto: se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, sin datos publicos de evaluacion, sin idiomas declarados y sin informacion sobre el pipeline de inferencia. La model card remite explicitamente al codigo del paper para conocer la configuracion de entrenamiento, el pipeline de datos y los artefactos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT con DoRA (la model card lo denomina QDoRA) sobre el modelo base Qwen/Qwen3.5-9B. Arquitectura interna del modelo base: no disponible |
| Parametros totales | No disponible (adaptador de rango r=48; el repositorio pesa 0,5 GB) |
| Parametros activos | No aplica (no es un modelo MoE; es un adaptador LoRA/DoRA) |
| Longitud de contexto | No disponible (depende del modelo base Qwen/Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tipo de adaptador | DoRA / QDoRA |
| Rango del adaptador | 48 |
| Semilla de entrenamiento | 42 |
| Tarea objetivo | T2 extraction ("t2-extract") |
| Sustrato de control | "wrong-domain" (dominio incorrecto) |
| Modelo base | Qwen/Qwen3.5-9B |
| Libreria | peft |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La informacion disponible describe unicamente el adaptador, no el modelo base. Se trata de un ajuste PEFT de tipo DoRA (Weight-Decomposed Low-Rank Adaptation), referido como QDoRA en la model card, con rango r=48 y semilla 42. DoRA descompone los pesos preentrenados en magnitud y direccion, y aplica la actualizacion de bajo rango solo sobre el componente direccional, lo que en la literatura suele traducirse en una mayor estabilidad de entrenamiento y mejor ajuste que LoRA puro con el mismo presupuesto de parametros. El adaptador se ha "apilado" sobre un sustrato de control de dominio incorrecto (wrong-domain), lo que en un diseno experimental de este tipo normalmente actua como condicion de control frente a la variante entrenada en el dominio correcto.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre hiperparametros como learning rate, epochs o scheduler. La model card indica que la configuracion de entrenamiento, el pipeline de datos y los artefactos de evaluacion se encuentran en la release de codigo del paper "Fine-Tuning Shifts Form Before Competence" (envio entropy-4582293), pero no se han incluido en la informacion proporcionada. No consta ninguna innovacion tecnica adicional mas alla del propio esquema DoRA/QDoRA.

## Capacidades

- El adaptador esta especializado, segun su nombre y su model card, en una tarea de extraccion denominada "T2 extraction". El alcance exacto de dicha tarea (formato de entrada y salida, dominio de aplicacion) no esta documentado en la informacion disponible.
- Al ser un adaptador sobre Qwen/Qwen3.5-9B, las capacidades finales del sistema son las del modelo base mas la especializacion introducida por el adaptador. No se han publicado evaluaciones que aíslen la contribucion del adaptador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio esta vacio).
- Modo "thinking", vision, audio u otras capacidades especiales: no disponibles.
- Uso como artefacto de investigacion: el adaptador esta pensado para reproducir o comparar condiciones experimentales dentro del estudio "Fine-Tuning Shifts Form Before Competence".

## Casos de uso

- Reproducibilidad de investigacion: cargar el adaptador con PEFT sobre Qwen/Qwen3.5-9B y comparar su comportamiento con la variante entrenada en el dominio correcto para estudiar el efecto del sustrato de control sobre la tarea de extraccion T2. Es el caso de uso principal dado el origen del artefacto.
- Estudio de DoRA frente a LoRA: al emplear r=48 y semilla fija, permite comparar DoRA/QDoRA con otras tecnicas PEFT bajo el mismo presupuesto de parametros y la misma configuracion, evaluando diferencias de convergencia y estabilidad.
- Analisis de "forma antes que competencia": el adaptador sirve como pieza experimental para medir si los cambios en la geometria de las representaciones preceden a la mejora en la tarea, tal y como sugiere el titulo del paper asociado.
- Ablacion de dominio de entrenamiento: al estar apilado sobre un sustrato de dominio incorrecto, permite cuantificar la degradacion o transferencia negativa que introduce entrenar con datos fuera de dominio.
- Fine-tuning de extraccion estructurada sobre un modelo de 9B: si finalmente se documenta la tarea T2, el adaptador podria reutilizarse como punto de partida para pipelines de extraccion de informacion en dominios cercanos, siempre con validacion previa.
- Docencia y formacion tecnica: como ejemplo minimo y de bajo peso (0,5 GB) de como se publica, se carga y se evalua un adaptador PEFT con la libreria peft, sin necesidad de distribuir pesos completos.
- No se recomienda su uso directo en produccion: no hay benchmarks, no hay documentacion de la tarea, no hay idiomas declarados y no se ha validado su comportamiento fuera del contexto experimental del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no declara metrica alguna y la model card remite a la release de codigo del paper para consultar los artefactos de evaluacion, que no forman parte de los datos proporcionados.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | No disponible | Sin datos en el repositorio |
| HumanEval | No disponible | Sin datos en el repositorio |
| GSM8K | No disponible | Sin datos en el repositorio |
| Evaluacion de la tarea T2 extraction | No disponible | Referida al codigo del paper, no incluida |

## Requisitos de hardware

- El adaptador en si ocupa 0,5 GB en disco, pero para inferencia es imprescindible cargar el modelo base Qwen/Qwen3.5-9B, cuyos pesos no se distribuyen en este repositorio.
- VRAM para el modelo base: no disponible de forma oficial. Como referencia orientativa y no verificada, un modelo de ~9.000 millones de parametros suele requerir del orden de 18-20 GB en FP16/BF16, 10-12 GB en cuantizacion de 8 bits y 6-8 GB en cuantizacion de 4 bits. Estas cifras son estimaciones generales, no datos publicados para este modelo.
- GPU recomendadas: no disponible. No hay ninguna recomendacion de hardware en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Dependera del tamano real y la arquitectura del modelo base; con cuantizacion agresiva podria encajar en GPUs de 12-16 GB, pero no hay confirmacion.
- Opciones de despliegue: la libreria declarada es peft, de modo que la carga del adaptador se realiza sobre el modelo base. Frameworks como vLLM, llama.cpp, Ollama o TGI no estan confirmados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados para este adaptador (sin benchmarks, sin idiomas, sin documentacion de la tarea), por lo que no es posible establecer una comparativa cuantitativa fiable. La comparacion natural es contra su propio modelo base y contra otros adaptadores PEFT de la misma familia, pero no se dispone de cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-t2-extract-stacked-wrongdomain-s42 | No disponible (adaptador DoRA r=48) | No disponible | No disponible | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Referenciado como base |
| Otros adaptadores PEFT comparables | No disponibles | No disponible | No disponible | No disponible | No identificados |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de la tarea T2, ni resultados de validacion publicados en el repositorio.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso o validacion por parte de la comunidad.
- Documentacion minima: la model card no describe el formato de entrada/salida de la tarea, el dominio de aplicacion ni los datos de entrenamiento.
- Diseno experimental deliberado: el adaptador se ha apilado sobre un sustrato de dominio incorrecto, por lo que su comportamiento puede ser intencionadamente suboptimo o atipico. No debe interpretarse como un adaptador optimizado para produccion.
- Idiomas no declarados: se desconoce que lenguas cubre y con que calidad.
- Sesgos: no disponibles. No se ha publicado ningun analisis de sesgos ni de seguridad.
- Riesgo de alucinacion: no evaluado. Al no haber datos de la tarea, no puede acotarse la tasa de error ni el modo de fallo.
- Limitaciones de contexto: dependen del modelo base, cuyo contexto no se especifica en la informacion proporcionada.
- Licencia: Apache 2.0 en el adaptador, lo que en principio permite uso comercial del adaptador. Sin embargo, las condiciones de la licencia del modelo base Qwen/Qwen3.5-9B no se han proporcionado y deben verificarse por separado antes de cualquier uso comercial.
- Trazabilidad incompleta: la model card remite a la release de codigo del paper "Fine-Tuning Shifts Form Before Competence" (entropy-4582293) para la configuracion y los artefactos de evaluacion, pero esos recursos no estan enlazados en la informacion disponible.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-06, dato que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OthmaneBen/qwen3.5-9b-t2-extract-stacked-wrongdomain-s42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper y release de codigo "Fine-Tuning Shifts Form Before Competence" (envio entropy-4582293): no disponible como enlace en la informacion proporcionada.
- No se han encontrado en la busqueda web enlaces relevantes sobre este modelo, su paper ni su modelo base. Los resultados devueltos por la busqueda no guardan relacion con el contenido de esta ficha y se han descartado por completo.
