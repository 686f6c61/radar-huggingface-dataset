# lyonpetit/coca-demo-2024

## Resumen

`lyonpetit/coca-demo-2024` es un repositorio de HuggingFace publicado por el usuario lyonpetit que contiene una implementacion propia y minima de una arquitectura denominada **Coca**, orientada a tareas de *retrieval* (recuperacion de informacion multimodal, a juzgar por la referencia a Flickr30k en la guia de evaluacion). El propio autor indica de forma explicita que se trata de un **punto de partida reproducible, no de un modelo entrenado**: el fichero `model.safetensors` es un checkpoint de inicializacion valido para *smoke tests*, no un checkpoint con benchmarks publicados.

El repositorio incluye el script principal `finetune.py`, un `config.json` con los ajustes de arquitectura, un `training_args.json` con la receta de experimento por defecto y el checkpoint de inicializacion. La variante declarada en la configuracion es **xlarge**, con atencion estandar, fusion mediante `concat mlp`, activacion ReLU y normalizacion GroupNorm. El recuento real de parametros leido de los tensores safetensors es de **24.832 parametros**, una cifra muy reducida que confirma la naturaleza de juguete del artefacto y que contrasta con la etiqueta "xlarge" del propio esquema de nombres del autor.

Su relevancia es, por tanto, limitada y de tipo metodologico: sirve como plantilla reproducible para montar un *pipeline* de retrieval, como banco de pruebas para *smoke tests* de entrenamiento y como ejemplo de configuracion explicita de un modelo personalizado que no se puede cargar con APIs genericas sin un adaptador. No debe presentarse como un modelo listo para produccion ni como una referencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementacion personalizada), atencion estandar, fusion `concat mlp`, activacion ReLU, normalizacion GroupNorm |
| Parametros totales | 24.832 (veinticuatro mil ochocientos treinta y dos), segun el recuento real de safetensors |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint de inicializacion; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo PyTorch asociado) |
| Escala declarada | xlarge (etiqueta del `config.json` del autor) |
| Pipeline de HuggingFace | no disponible |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-24T23:36:41Z |
| Fecha de actualizacion (metadatos) | 2026-09-24T23:36:47Z |

## Arquitectura y entrenamiento

La arquitectura es una implementacion propia de tipo Coca, con atencion estandar (no lineal ni dispersa), fusion de modalidades o ramas mediante un perceptron multicapa con concatenacion (`concat mlp`), activacion ReLU y normalizacion GroupNorm. La escala declarada en la configuracion es "xlarge", si bien el checkpoint distribuido contiene 24.832 parametros, lo que sugiere que la etiqueta corresponde al esquema de nombres interno del script y no a un recuento real de parametros de esa magnitud. No se documenta el numero de capas, dimensiones ocultas, cabezas de atencion ni presupuesto de contexto.

En cuanto al entrenamiento, la model card es tajante: el checkpoint **no ha sido entrenado** ni auditado en robustez, equidad o transferencia de dominio. El `training_args.json` recoge una receta de experimento por defecto basada en el optimizador **AdamW** con un *schedule* **exponencial**, pero el autor aclara que son valores de partida del script y no evidencia de una ejecucion completada. No se especifica volumen de tokens, composicion del dataset, ni fases de RLHF, DPO o ajuste por preferencias. El autor recomienda, como primera evaluacion util, usar **Flickr30k**, reportar la metrica de tarea sobre al menos tres semillas e incluir una linea base de capacidad equivalente, conservando los registros de entrenamiento y las versiones de entorno.

## Capacidades

- No se declara ninguna capacidad funcional verificada: al ser un checkpoint de inicializacion sin entrenamiento, no genera texto, no responde a instrucciones ni produce representaciones de retrieval utiles tal cual.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues (el campo de idiomas no esta disponible).
- No hay modo de razonamiento (*thinking mode*), vision, audio ni ninguna capacidad especial declarada.
- Lo que si ofrece el repositorio es una **plantilla ejecutable**: definicion de modelo, configuracion de arquitectura, receta de entrenamiento y un ejemplo de *smoke test* invocable con `python finetune.py --help`.
- El codigo esta pensado para requerir un **adaptador explicito** antes de poder usarse con APIs genericas de carga automatica.

## Casos de uso

- Punto de partida para investigacion en retrieval multimodal: el script `finetune.py` y el `config.json` permiten arrancar un experimento propio de recuperacion sobre Flickr30k sin partir de cero, ajustando la receta AdamW/exponencial incluida.
- *Smoke test* de pipelines de entrenamiento: el checkpoint de inicializacion sirve para verificar que el bucle de entrenamiento, la carga de datos y el guardado de pesos funcionan antes de lanzar una ejecucion real con recursos de GPU.
- Validacion de integraciones de inferencia: permite comprobar que un adaptador de carga personalizado funciona correctamente con una arquitectura no soportada por las APIs estandar de HuggingFace.
- Reproducibilidad y comparacion de baselines: el repositorio fija configuracion y semillas de partida, lo que facilita comparar metodologias bajo el mismo presupuesto de datos y de ajuste, tal como recomienda el autor.
- Docencia y formacion: es un ejemplo compacto de implementacion de un modelo de retrieval con atencion estandar, fusion `concat mlp` y GroupNorm, adecuado para explicar la estructura completa de un repositorio de modelo.
- Desarrollo de *harnesses* de evaluacion: sirve como sujeto de prueba barato para construir y depurar un sistema de evaluacion con multiples semillas y metricas de tarea antes de aplicarlo a modelos grandes.
- Pruebas de integracion continua: al ocupar practicamente nada y poder ejecutarse en CPU, encaja en tareas de CI que validen cambios en codigo de modelado o en utilidades de serializacion safetensors.

En ningun caso estos usos implican capacidades de inferencia utiles sobre datos reales: el artefacto no ha sido entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no se reclama ninguna puntuacion de benchmark y que el checkpoint no es un artefacto entrenado. La guia de evaluacion propone Flickr30k como primer benchmark razonable, con al menos tres semillas y una linea base de capacidad comparable, pero no aporta cifras.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Flickr30k (retrieval) | no disponible (propuesto por el autor, sin resultados) |
| Cualquier otra metrica | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 24.832 parametros, el checkpoint en precision completa ocupa del orden de 0,1 MB y en media precision del orden de 0,05 MB, mas el *overhead* del *runtime* de PyTorch.
- GPU recomendadas: ninguna en particular; el modelo cabe y se ejecuta sin problema en CPU. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es mas que suficiente para *smoke tests*.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: no hay soporte conocido en vLLM, llama.cpp, Ollama ni TGI, ya que se trata de una implementacion personalizada que, segun la propia model card, requiere un adaptador explicito para las APIs de carga automatica. El unico camino documentado es ejecutar `finetune.py` desde el propio repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparativa se limita a caracteristicas estructurales y de disponibilidad frente a repositorios de la misma familia detectados en la busqueda.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lyonpetit/coca-demo-2024 | 24.832 | no disponible | sin benchmarks | MIT | publico, 0 descargas |
| mzaytsev/coca-demo | no disponible | no disponible | sin benchmarks | Apache 2.0 | publico |
| thijsdekker/coca-demo | no disponible | no disponible | sin benchmarks | MIT | publico |
| Modelos de retrieval consolidados (por ejemplo, CLIP o BLIP-2) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible | ampliamente desplegados |

Ninguno de los repositorios comparados de la familia `coca-demo` publica resultados de benchmarks, de modo que no es posible establecer una comparacion de rendimiento entre ellos.

## Limitaciones y advertencias

- El checkpoint **no ha sido entrenado**: cualquier salida o representacion que produzca carece de utilidad practica y no debe interpretarse como resultado de un modelo funcional.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, por lo que no hay evaluacion de sesgos disponible.
- Riesgo de alucinacion: no evaluable, dado que el modelo no esta entrenado para generar texto ni para responder consultas.
- No se declara longitud de contexto ni idiomas soportados; no se puede asumir cobertura multilingue.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor advierte de que deben revisarse por separado los terminos de los datos externos que se usen junto al repositorio.
- Arquitectura personalizada: las APIs genericas de carga automatica de HuggingFace no la reconocen sin un adaptador explicito, lo que complica su integracion en *stacks* estandar.
- Los metadatos del repositorio muestran una fecha de creacion (2026-09-24) incoherente con la fecha actual y un intervalo de actualizacion de seis segundos; conviene tratar las marcas temporales como poco fiables.
- El recuento real de parametros (24.832) contradice la etiqueta "xlarge" de la configuracion; no debe asumirse que el modelo tenga un tamano acorde a esa denominacion.
- Uso en produccion: desaconsejado por completo en su estado actual. Cualquier resultado obtenido con un checkpoint entrenado en el futuro debera documentarse de forma separada a los valores por defecto aqui incluidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lyonpetit/coca-demo-2024
- Repositorio relacionado de la misma familia: https://huggingface.co/mzaytsev/coca-demo
- Repositorio relacionado de la misma familia: https://huggingface.co/thijsdekker/coca-demo
- Arbol de ficheros de un repositorio comparable: https://huggingface.co/thijsdekker/coca-demo/tree/main
- Calendario de lanzamientos de modelos de IA (referencia general): https://www.scriptbyai.com/ai-model-release-calendar/
- Seguimiento de lanzamientos de modelos (referencia general): https://aimodelradar.app/
- Seguimiento de lanzamientos de modelos (referencia general): https://lmmarketcap.com/tools/model-release-tracker
