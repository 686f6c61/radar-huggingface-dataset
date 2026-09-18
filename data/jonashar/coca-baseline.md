# jonashar/coca-baseline

## Resumen

`jonashar/coca-baseline` es un repositorio experimental publicado en HuggingFace por el usuario jonashar que contiene una implementacion propia de una arquitectura denominada Coca orientada a aprendizaje contrastivo. Segun su model card, el objetivo no es ofrecer un modelo entrenado, sino un punto de partida reproducible que permita inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. El repositorio incluye el script `finetune.py` como artefacto principal, junto con `config.json`, `training_args.json` y `model.safetensors`.

El checkpoint `model.safetensors` se describe explicitamente como una inicializacion valida para pruebas de humo (smoke tests) y no como un checkpoint entrenado ni evaluado. El autor declara que no se reclama ninguna puntuacion de benchmark en el repositorio y que el modelo no ha sido auditado en robustez, equidad ni transferencia de dominio. Esto lo situa en la categoria de material de investigacion y fontaneria de entrenamiento, no en la de modelo desplegable en produccion.

Arquitecturalmente, la model card indica escala "giant", atencion dispersa (sparse), fusion mediante "co attention", activacion "gelu tanh" y normalizacion "scalenorm". Sin embargo, el recuento real de parametros en el fichero safetensors es de 24.832, una cifra incompatible con cualquier escala denominada "giant", lo que apunta a que la configuracion publicada es una version reducida de prueba. La receta por defecto usa el optimizador rmsprop con un schedule de tipo step.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (transformer con atencion dispersa y fusion "co attention") |
| Parametros totales | 24.832 (segun recuento real del fichero safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors (`model.safetensors`); acompanado de `config.json`, `training_args.json` y `finetune.py` |

Otros datos declarados en la model card: escala "giant", activacion "gelu tanh", normalizacion "scalenorm", optimizador rmsprop con schedule "step". Tamano del repositorio: 0,0 GB. Creado el 2026-09-18, actualizado el 2026-09-18. Descargas: 16. Likes: 0.

## Arquitectura y entrenamiento

La arquitectura declarada es Coca, con atencion dispersa (sparse attention), un mecanismo de fusion denominado "co attention", activacion gelu tanh y normalizacion scalenorm. No se especifica el numero de capas, dimensiones de embedding, numero de cabezas de atencion, tamano de vocabulario ni la naturaleza exacta de la fusion multimodal o multi-ramal implicada por el termino "co attention". Tampoco se detalla si la atencion dispersa sigue un patron fijo, aprendido o de ventana deslizante.

En cuanto al entrenamiento, la model card es explicita: las configuraciones incluidas son valores de partida del script y no evidencia de una ejecucion completada. No se indica numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otro ajuste por preferencias. La receta por defecto usa rmsprop con schedule de tipo step, y el autor recomienda que cualquier evaluacion significativa entrene todos los baselines con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, SSM, etc.) mas alla de los elementos arquitectonicos citados.

## Capacidades

- No se declara ninguna capacidad funcional de generacion de texto, razonamiento, codigo, matematicas o vision.
- El checkpoint publicado es una inicializacion sin entrenar, por lo que no cabe esperar capacidades de inferencia utiles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas soportados.
- El proposito declarado es servir como base experimental para inspeccionar cambios de arquitectura en un pipeline de aprendizaje contrastivo.
- Se indica que, al ser una implementacion propia, las APIs genericas de carga automatica requieren un adaptador explicito antes de poder usarse.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicializacion permite verificar que el script `finetune.py` carga pesos, construye el grafo y ejecuta un paso hacia delante y hacia atras sin errores antes de invertir en un entrenamiento real.
- Baseline de capacidad equiparable en investigacion contrastiva: el autor recomienda comparar contra un baseline de capacidad ajustada; este repositorio puede actuar como el punto de partida minimo de esa comparacion, siempre que se entrene con la misma exposicion de datos y semillas.
- Estudios de ablacion de arquitectura: al ser un codebase propio y aislado, permite sustituir la atencion dispersa, la fusion "co attention" o la normalizacion scalenorm de forma controlada y medir el efecto en una tarea concreta.
- Validacion de adaptadores de carga personalizados: dado que las APIs automaticas no cargan esta implementacion sin un adaptador explicito, el repositorio sirve para desarrollar y probar ese adaptador en un entorno controlado.
- Reproducibilidad docente y formacion: util como ejemplo didactico de estructura de repositorio de modelo (script, config, training args y pesos de inicializacion) y de por que un checkpoint de inicializacion no debe confundirse con un modelo evaluado.
- Infraestructura de evaluacion: puede emplearse para montar el arnes de evaluacion (conjunto de validacion especifico de tarea, metrica reportada en al menos tres semillas, registro de versiones de entorno) que el autor describe como primer paso necesario.
- Verificacion de coste de entrenamiento: al ser un modelo de 24.832 parametros, permite medir tiempo por paso y consumo de memoria para extrapolar al escalado previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint de inicializacion no ha sido entrenado ni evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 24.832 parametros en precision completa el peso de los parametros es del orden de decenas de kilobytes, por lo que el cuello de botella es el framework (PyTorch) y no los pesos.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, GTX 1650 o superior, RTX 3060, RTX 4090) es mas que suficiente; el entrenamiento de prueba puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU sin aceleracion dedicada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor indica que esta implementacion propia requiere un adaptador explicito para las APIs genericas de carga, por lo que el despliegue estandar no esta soportado de fabrica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion con alternativas. Ademas, se trata de un checkpoint de inicializacion experimental y no de un modelo entrenado, por lo que una comparativa de capacidades no seria significativa.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado: no debe esperarse ninguna capacidad de inferencia util.
- El modelo no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No se reclama ninguna puntuacion de benchmark; cualquier resultado futuro correspondera a un checkpoint distinto y debe documentarse por separado de los valores por defecto publicados aqui.
- No se documentan sesgos conocidos, pero la ausencia de auditoria implica que no puede descartarse su presencia tras un entrenamiento.
- El recuento real de parametros (24.832) contradice la escala "giant" declarada en la model card; conviene tratar la configuracion publicada como una version reducida de prueba.
- No hay informacion sobre longitud de contexto, idiomas soportados ni tipos de cuantizacion, lo que impide planificar un despliegue en produccion.
- Requiere un adaptador explicito para cargarse con APIs genericas; no funciona con carga automatica estandar.
- La licencia bsd-3-clause permite uso comercial del codigo y los pesos, pero los terminos de los datos de origen deben revisarse por separado cuando se utilice el repositorio con datasets externos.
- El modelo no es apto para uso en produccion en su estado actual.

## Enlaces

- HuggingFace: https://huggingface.co/jonashar/coca-baseline
- Los resultados de busqueda web proporcionados no guardan relacion con el modelo: corresponden al sitio corporativo de MCI (refrigeracion y genio climatique, https://mci.fr/), por lo que no se han incluido como referencias tecnicas.
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
