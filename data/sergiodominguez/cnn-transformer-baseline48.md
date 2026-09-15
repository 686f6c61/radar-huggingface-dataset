# sergiodominguez/cnn-transformer-baseline48

## Resumen

cnn-transformer-baseline48 es un repositorio de HuggingFace publicado por el usuario sergiodominguez que contiene una implementacion propia de una arquitectura CNN Transformer orientada a tareas multiples (multitask). No se trata de un modelo entrenado, sino de un punto de partida reproducible: el propio autor indica en la model card que el checkpoint incluido es una inicializacion valida para pruebas de humo (smoke tests) y no un checkpoint evaluado con benchmarks. El repositorio tiene 0 descargas y 0 likes, y la ultima actualizacion registrada es del 15 de septiembre de 2026.

El dato mas relevante es su tamano real: el fichero safetensors contiene 49.600 parametros totales, lo que lo situa en la categoria de modelos microscopicos. Existe una discrepancia notable con la model card, que etiqueta la escala como "huge" (enorme) mientras que las dimensiones reales del checkpoint corresponden a un prototipo de laboratorio. El repositorio ocupa 0,0 GB.

Su relevancia actual es como andamiaje de investigacion mas que como modelo desplegable: permite reproducir una receta de entrenamiento concreta (AdamW con calentamiento lineal), probar integraciones en pipelines de PyTorch y servir como fixture en pruebas automatizadas. No hay evidencia de que se haya completado ningun ciclo de entrenamiento sobre datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida convolucional + atencion) |
| Parametros totales | 49.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se declaran esquemas de cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros parametros declarados en la model card: atencion de tipo flash, fusion de caracteristicas de bajo rango (low rank), funcion de activacion GELU y normalizacion LayerNorm.

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con bloques de atencion tipo transformer, con un mecanismo de fusion de bajo rango para combinar las representaciones de ambas ramas. La atencion es de tipo flash, la activacion GELU y la normalizacion LayerNorm. El modelo esta disenado para un regimen multitask, es decir, compartir un tronco comun entre varias cabezas de tarea. El repositorio incluye el fichero `inference.py` con la implementacion y un bloque `__main__` de ejemplo, ademas de `config.json` (arquitectura generada) y `training_args.json` (receta por defecto).

No se ha completado ningun entrenamiento publicado. La receta por defecto especifica optimizador AdamW con un esquema de calentamiento lineal, pero el autor aclara explicitamente que son valores de partida del script y no evidencia de una ejecucion finalizada. No se declaran volumen de tokens, composicion del dataset, ni fases de RLHF, DPO o ajuste por instrucciones; tampoco innovaciones tecnicas adicionales mas alla del uso de atencion flash y fusion de bajo rango. El checkpoint `model.safetensors` es una inicializacion, no un modelo convergido.

## Capacidades

- Generacion de texto: no disponible. El checkpoint no ha sido entrenado, por lo que no produce salidas linguisticas coherentes.
- Razonamiento, codigo, matematicas: no disponible por la misma razon.
- Vision: no disponible, aunque la rama convolucional es compatible con entradas tipo imagen o senal si se define la cabeza correspondiente.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponible; no hay idiomas declarados en la model card.
- Capacidades especiales: la unica capacidad demostrable es servir como implementacion ejecutable de referencia. El script permite verificar que la arquitectura se instancia correctamente (`python inference.py --help`).
- Multitask: la arquitectura esta preparada para compartir tronco entre varias cabezas, pero no se incluye ninguna cabeza entrenada.

## Casos de uso

- Pruebas de humo de infraestructura: el checkpoint de inicializacion permite comprobar que un pipeline de carga de safetensors, tokenizacion y forward pass funciona de extremo a extremo antes de invertir en modelos grandes. Es adecuado porque su tamano de 49.600 parametros hace que el ciclo sea instantaneo.
- Fixture en pruebas automatizadas de CI: puede integrarse en una suite de tests para validar que los cambios en el codigo de entrenamiento no rompen la construccion del grafo ni las formas de los tensores, sin coste de GPU.
- Prototipado de recetas de entrenamiento: sirve para depurar configuraciones de AdamW, calentamiento lineal y programacion del learning rate antes de trasladarlas a un modelo de mayor escala.
- Investigacion sobre fusion CNN-transformer: permite experimentar con el mecanismo de fusion de bajo rango y comparar variantes sin requerir recursos de computo significativos.
- Docencia y formacion: util como ejemplo minimo y ejecutable de una arquitectura hibrida con atencion flash, adecuado para explicar como se combinan convoluciones y atencion en un mismo tronco.
- Punto de partida para un baseline propio: el autor sugiere entrenar todos los baselines con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias. Este repositorio proporciona el esqueleto para ese baseline, no el resultado.
- Integracion con APIs de carga automatica: requiere un adaptador explicito, ya que al ser una implementacion propia las APIs genericas de `transformers` no la cargan directamente. Puede usarse como caso de prueba para desarrollar ese adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint es una inicializacion, no un checkpoint evaluado. La guia de evaluacion propuesta por el autor sugiere emplear un conjunto de validacion especifico de la tarea, reportar la metrica a lo largo de al menos tres semillas e incluir un baseline de capacidad equiparable, conservando los registros de entrenamiento y las versiones del entorno.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,2 MB en precision fp32 (49.600 parametros x 4 bytes), despreciable en cualquier GPU. La cifra no incluye el coste de activaciones, que dependera de la longitud de secuencia y del tamano de lote.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna ejecuta el modelo sin problema. Si se entrena, una GTX 1650, RTX 3060 o superior es mas que suficiente.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, incluidas integradas y aceleradores de gama baja.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI. El unico artefacto desplegable es `inference.py` con PyTorch, y las APIs automaticas requieren un adaptador explicito.
- Latencia y throughput: no disponible. Al no haber un modelo entrenado ni una tarea definida, no existen mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (CNN Transformer multitask) con los que establecer una comparacion de parametros, contexto, rendimiento, licencia y disponibilidad. Ademas, al tratarse de un checkpoint de inicializacion sin entrenar, cualquier comparacion de rendimiento con modelos entrenados no seria metodologicamente valida.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. No ha sido auditado en robustez, equidad ni transferencia de dominio. Cualquier uso generativo directo producira salidas sin sentido.
- No hay resultados de benchmarks ni evidencia empirica de calidad. Cualquier cifra de rendimiento que se atribuya a este repositorio seria inventada.
- Discrepancia entre la etiqueta de escala ("huge") de la model card y los 49.600 parametros reales del safetensors. Conviene guiarse por el dato del fichero de pesos, no por la etiqueta.
- Sin idiomas declarados. No se puede asumir competencia en castellano ni en ninguna otra lengua.
- Longitud de contexto no especificada. No se conocen los limites de secuencia de la implementacion ni si soporta atencion con mascara causal.
- Compatibilidad limitada: al ser una implementacion propia, las utilidades estandar de carga de HuggingFace no la reconocen sin un adaptador.
- Licencia Apache 2.0, permisiva y apta para uso comercial del codigo. No obstante, el autor advierte de que deben revisarse por separado los terminos de los datos de origen si el repositorio se usa con conjuntos de datos externos.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que no hay un modelo de lenguaje entrenado; el riesgo real es interpretar el repositorio como un modelo funcional cuando es un esqueleto.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin mantenimiento posterior documentado ni comunidad que lo valide.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sergiodominguez/cnn-transformer-baseline48
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos por el buscador corresponden a sitios de escorts y contenido para adultos, sin ninguna relacion con este repositorio, por lo que se omiten.
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
