# Shelter/UI-testjev

## Resumen

UI-TestJev es un adaptador LoRA de tipo decoder-only, sin fusionar, desarrollado por Shelter sobre el modelo base `google/diffusiongemma-26B-A4B-it`. Su proposito no es la generacion de texto general, sino emitir decisiones estructuradas y cerradas (`pass`, `unknown` o una categoria de fallo permitida) en tareas acotadas de prueba de interfaz: comprobacion de un requisito local, comparacion de pantalla completa entre referencia y version actual, y evaluacion de alcanzabilidad por teclado. El adaptador tiene rango 32 y alpha 64, se distribuye como checkpoint PEFT de 0,2 GB y esta anclado a la revision `f7f5b7f5fa82ffc52addd066915886d497f5517b` del modelo base, que se descarga por separado.

El interes actual del modelo reside en su enfoque: aplica un adaptador LoRA de bajo rango sobre un decoder de difusion multimodal para una tarea de verificacion visual muy especifica, en lugar de entrenar un clasificador dedicado o de recurrir a un modelo generalista. Los resultados publicados en la model card muestran mejoras sustanciales en recall de defectos locales (de 120/563 a 456/563) y en macro-F1 de comprobacion de requisito local (de 0,3132 a 0,7302) sobre el corpus de desarrollo, aunque a costa de un aumento notable de falsos positivos (FPR benigno de 1,77 % a 16,31 %).

Se trata de un artefacto de investigacion con validacion incompleta: el autor indica explicitamente que los resultados son diagnosticos de desarrollo y no un holdout final intacto, que el checkpoint exportado conserva `validation_recommends_adapter: false` y que no debe usarse como puerta de build desatendida. La integracion con vLLM, OpenJev o Inference Providers hosted no ha sido validada; solo se ha verificado el helper de inferencia incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only sobre modelo de difusion multimodal (DiffusionGemma); el artefacto es un adaptador LoRA sin fusionar |
| Parametros totales | 26B en el modelo base (segun la nomenclatura `diffusiongemma-26B-A4B-it`); el adaptador ocupa 0,2 GB (rango 32, alpha 64) |
| Parametros activos | Aproximadamente 4B en el modelo base (MoE, segun la nomenclatura `A4B`); no disponible para el adaptador |
| Longitud de contexto | 8.192 tokens de entrada en el protocolo de inferencia incluido; presupuesto de 1.120 tokens visuales por imagen |
| Tipos de cuantizacion | Receta INT8 congelada para los tensores de expertos fusionados; el resto de pesos del modelo base, incluidos los de vision, permanecen en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint PEFT/LoRA, sin fusionar) |

## Arquitectura y entrenamiento

El modelo base es DiffusionGemma, un decoder multimodal de tipo difusion con arquitectura MoE (26B totales, aproximadamente 4B activos segun la nomenclatura). El adaptador es un LoRA decoder-only de rango 32 y alpha 64 entrenado sobre ese base congelado. El protocolo de inferencia evaluado realiza un unico paso de denoising del decoder con slots de respuesta fijos, semilla 3407 y un presupuesto visual de 1.120 tokens por imagen con preservacion de aspect ratio, aplicado a pares de capturas en orden referencia/actual. El cargador incluido descarga el base anclado y convierte unicamente los tensores de expertos fusionados a la receta INT8 congelada, manteniendo el resto (incluida la torre de vision) en BF16.

El entrenamiento usa el dataset `Shelter/UI-testjev-data` y una reparacion de datos denominada v3. Se conservan tres checkpoints de validacion (epochs), de los cuales se selecciono el epoch 3; ninguno de los tres supero todos los guardrails de validacion predeclarados. Los grupos de origen se mantienen separados entre train, validacion y test, y los scores de test y Scry no participaron en la seleccion del checkpoint. El autor advierte que la familia de tests sinteticos inspeccionada influyo en la reparacion v3 de datos, por lo que las cifras de test son diagnosticos de desarrollo y no un holdout limpio. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Comprobacion local de un unico requisito publico y su objetivo: contraste, clipping, contenido ausente, oclusion, aspect ratio de imagen o dimensiones de control.
- Comparacion de pantalla completa entre referencia y version actual para una unica categoria de regresion introducida.
- Decisiones de alcanzabilidad por teclado a partir de una traza de foco suministrada; devuelve `unknown` cuando la traza no esta disponible.
- Salida restringida a decisiones cerradas: `pass`, `unknown` o una categoria de fallo permitida, con slots de respuesta fijos.
- Procesamiento de imagen y texto (`image-text-to-text`) con pares de capturas en orden referencia/actual.
- No tiene localizacion por bounding box, ni genera explicaciones, ni dispone de capacidades de chat general: ninguna de estas funciones fue entrenada ni evaluada.
- No soporta la categoria de oclusion a pantalla completa en este experimento, y la tarea de pantalla completa asume como maximo una categoria de violacion nueva por par.
- Idioma: unicamente ingles.

## Casos de uso

- Deteccion de regresiones visuales locales en pipelines de QA: el modelo evalua un requisito publico concreto (contraste, clipping, contenido ausente) sobre una pareja referencia/actual y emite una decision cerrada, lo que permite generar hallazgos estructurados y filtrables en lugar de texto libre.
- Triaje asistido de hallazgos para revision humana: dado su recall local del 80,99 % (456/563) pero un FPR benigno del 16,31 %, encaja como generador de candidatos que un revisor valida antes de abrir un ticket, no como gate automatico.
- Auditoria de accesibilidad de navegacion por teclado: con una traza de foco suministrada, el adaptador alcanza macro-F1 de 1,0000 en el conjunto de desarrollo (27 ejemplos) y devuelve `unknown` cuando falta la traza, lo que lo hace apto para prevalidaciones acotadas de alcanzabilidad.
- Comparacion de pantalla completa en una unica categoria: util para detectar si una release introduce una regresion de un solo tipo (recall de 150/393 frente a 58/393 del base), aceptando que solo 115/393 fallos reciben la categoria correcta.
- Verificacion de design systems y librerias de componentes: comprobaciones repetibles de dimensiones de control, aspect ratio y clipping sobre capturas de componentes aislados.
- Investigacion sobre decoders de difusion multimodales con adaptadores PEFT: el repositorio incluye helper de inferencia, procesador, tokenizer, versiones de dependencias exactas, informes de validacion y `metric-replay.json` para reproducir los scores, lo que lo convierte en un banco de pruebas reproducible.
- Piloto controlado en CI de equipos con revision obligatoria: puede integrarse como paso que genera avisos revisables, siempre que no bloquee el build, dado que el autor no lo respalda como puerta desatendida.

## Benchmarks y rendimiento

Resultados del conjunto de desarrollo declarados en la model card, con el mismo base anclado, receta INT8 de expertos congelados, vision BF16, imagenes, protocolo de prompt y semillas de ruido de evaluacion en ambos brazos:

| Tarea (test de desarrollo) | Ejemplos | Macro-F1 base | Macro-F1 adaptador | FPR benigno base | FPR benigno adaptador |
|---|---:|---:|---:|---:|---:|
| Comprobacion de requisito local | 1.127 | 0,3132 | 0,7302 | 1,77 % | 16,31 % |
| Regresion a pantalla completa | 787 | 0,2055 | 0,4053 | 0,76 % | 3,05 % |
| Alcanzabilidad por teclado | 27 | 0,8911 | 1,0000 | 0 % | 0 % |

Metricas adicionales reportadas:

| Metrica | Base | Adaptador |
|---|---|---|
| Recall de defecto local | 120/563 (21,31 %) | 456/563 (80,99 %) |
| Falsas alarmas locales | 10/564 | 92/564 |
| Recall de defecto a pantalla completa (cualquier categoria) | 58/393 | 150/393 |
| Fallos a pantalla completa con categoria correcta | no disponible | 115/393 |
| Fallos de aspect ratio a pantalla completa detectados | no disponible | 0/12 |
| Tasa de falsa alarma en validacion local | 2,07 % | 12,03 % |

En 311 pares externos de Scry, el recall de categorias anotadas paso de 266/505 (52,67 %) a 337/505 (66,73 %), y las predicciones adicionales no anotadas pasaron de 994 a 1.214. El autor advierte que las anotaciones estan incompletas, que los extras no son falsos positivos certificados y que estas cifras no establecen una mejora de precision ni de localizacion. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas, y no procede extrapolarlos para este adaptador.

## Requisitos de hardware

- El autor no publica requisitos de hardware oficiales; las cifras siguientes son estimaciones derivadas del tamano del modelo base y deben tratarse como orientativas.
- VRAM estimada para inferencia: aproximadamente 52 GB solo para pesos en BF16 sobre un base de 26B, mas activaciones y el presupuesto de 1.120 tokens visuales por imagen (dos imagenes por par en la tarea de pantalla completa). La conversion INT8 de los expertos fusionados reduce parcialmente esa cifra, pero no se documenta el ahorro exacto.
- GPU recomendadas: A100 80 GB o H100 80 GB para ejecutar el base en una sola GPU con margen para vision y activaciones.
- No cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090) en la configuracion evaluada; no se documenta soporte multi-GPU para este adaptador.
- Opciones de despliegue: unicamente el helper `modeling.py` incluido en el repositorio. El autor indica que la integracion con vLLM/OpenJev y con Inference Providers hosted no ha sido validada, y que la etiqueta `custom-inference` del repositorio no implica un endpoint listo para usar.
- Entorno de referencia: Linux con CUDA, Python 3.12/3.13, PyTorch 2.10.0+cu128, Transformers 5.11.0 y PEFT 0.21.0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el adaptador contra su propio modelo base, que es la referencia directa del experimento. No se aportan datos de otros adaptadores o modelos de prueba visual comparables.

| Modelo | Parametros | Contexto | Rendimiento (macro-F1 local / pantalla completa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shelter/UI-testjev (adaptador LoRA) | 26B base / ~4B activos; adaptador rango 32 (0,2 GB) | 8.192 tokens de entrada, 1.120 tokens visuales por imagen | 0,7302 / 0,4053 | Apache 2.0 | HuggingFace, inferencia solo via helper incluido |
| google/diffusiongemma-26B-A4B-it (base, sin adaptador) | 26B / ~4B activos | El del modelo base | 0,3132 / 0,2055 | No disponible en esta informacion | HuggingFace |
| Otros modelos de prueba visual comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de test proceden de una familia sintetica inspeccionada que influyo en la reparacion v3 de datos; son diagnosticos de desarrollo, no un holdout final intacto. Se requiere una evaluacion nueva con familias de repositorio distintas y bugs naturales antes de cualquier afirmacion de produccion.
- El checkpoint exportado conserva `validation_recommends_adapter: false`: los tres checkpoints fallaron uno o mas guardrails de validacion predeclarados.
- La tasa de falsa alarma en validacion local subio del 2,07 % al 12,03 %, por encima del incremento maximo permitido de dos puntos porcentuales. Tambien fallaron la deteccion de aspect ratio, la retencion de recall de clipping, las falsas alarmas por categoria y una sonda de estabilidad frente a ruido.
- En produccion esto implica revision humana obligatoria; el autor no respalda su uso como gate de build desatendido.
- Los 12 ejemplos de fallo de aspect ratio a pantalla completa no fueron detectados por el adaptador.
- Solo 115 de 393 fallos a pantalla completa recibieron la categoria correcta, por lo que la clasificacion fina del tipo de regresion es poco fiable.
- En los 311 pares externos de Scry las anotaciones son incompletas: las predicciones extra no son falsos positivos certificados y las cifras no demuestran mejor precision ni exactitud de localizacion.
- No hay localizacion por bounding box ni explicaciones generadas; tampoco capacidades de chat general. No debe usarse fuera de las tareas entrenadas.
- Limitacion idiomatica: solo ingles. Cualquier interfaz o requisito redactado en castellano queda fuera del alcance evaluado.
- El adaptador debe permanecer sin fusionar y aplicarse sobre el base anclado con la receta INT8 congelada; aplicarlo a otro cuantizador o a un base BF16 constituye una configuracion distinta y no evaluada. La comparacion publicada no mide la perdida por cuantizacion respecto al original BF16.
- El helper realiza un unico paso de denoising con slots de respuesta fijos y semilla 3407; desviarse de ese protocolo invalida la comparacion.
- Entrada publica restringida: no se deben anadir etiquetas, registros de mutacion, nombres de fichero como evidencia textual ni mediciones de oraculo ocultas al JSON de entrada.
- Licencia Apache 2.0, sin restricciones comerciales declaradas en la informacion disponible; conviene verificar los terminos del modelo base por separado.
- Estado del repositorio: 0 descargas y 1 like, sin adopcion documentada, lo que limita la evidencia de terceros sobre su comportamiento en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shelter/UI-testjev
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Shelter/UI-testjev-data
- Informe comparativo del repositorio: https://huggingface.co/Shelter/UI-testjev/blob/main/COMPARISON.md
- Datos de comparacion: https://huggingface.co/Shelter/UI-testjev/blob/main/comparison.json
- Criterios de seleccion del checkpoint: https://huggingface.co/Shelter/UI-testjev/blob/main/selection.json
- Reproduccion de metricas: https://huggingface.co/Shelter/UI-testjev/blob/main/metric-replay.json
- Formato de entrada: https://huggingface.co/Shelter/UI-testjev/blob/main/INPUT_FORMAT.md
- Helper de inferencia: https://huggingface.co/Shelter/UI-testjev/blob/main/modeling.py
- Dependencias fijadas: https://huggingface.co/Shelter/UI-testjev/blob/main/requirements.lock.txt
- Informes de validacion por epoch: `validation-epoch-*.json` en el repositorio
- Paper, blog o demo adicionales: no disponible. Las busquedas web realizadas devolvieron unicamente resultados no relacionados (pelicula homonima, cadena hotelera y una marca de gafas), sin conexion con este modelo.
