# ionovikov/cnn-transformer-contrastive

## Resumen

Cnn Transformer for Contrastive es un prototipo de investigacion publicado por el usuario ionovikov en HuggingFace. Se presenta como una implementacion propia de una arquitectura hibrida que combina capas convolucionales (CNN) con mecanismos de atencion tipo transformer, orientada a tareas de aprendizaje contrastivo. El repositorio incluye el codigo de entrenamiento (`train.py`), la configuracion de arquitectura (`config.json`), una receta de experimento por defecto (`training_args.json`) y un checkpoint de pesos en formato safetensors.

A pesar de la etiqueta interna "xlarge" que aparece en la model card, el recuento real de parametros del checkpoint es de 24.832, es decir, en torno a 25.000 parametros, un orden de magnitud propio de un ejemplo minimo de juguete mas que de un modelo a escala. El propio autor indica explicitamente que el fichero `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo (smoke tests) y que no debe interpretarse como un modelo entrenado ni como un benchmark.

Por tanto, no se trata de un modelo listo para produccion ni de un artefacto con capacidades demostradas: es un punto de partida experimental para reproducir o desarrollar una arquitectura CNN-Transformer con fusion con compuertas (gated fusion) y atencion de ventana deslizante. Su relevancia actual es la de material de investigacion reproducible bajo licencia Apache 2.0, sin resultados verificados asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (hibrida CNN + transformer) |
| Parametros totales | 24.832 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ademas de codigo Python y ficheros JSON de configuracion) |
| Escala declarada | xlarge (segun la model card del autor) |
| Tipo de atencion | sliding window (ventana deslizante) |
| Fusion | gated fusion |
| Activacion | relu |
| Normalizacion | batchnorm |
| Optimizador por defecto | novograd con linear warmup |

## Arquitectura y entrenamiento

La arquitectura descrita es una Cnn Transformer hibrida que combina un componente convolucional con un mecanismo de atencion transformer. La model card especifica tres decisiones tecnicas concretas: atencion de ventana deslizante (sliding window), fusion con compuertas (gated fusion) entre las ramas CNN y transformer, activacion relu y normalizacion por lotes (batchnorm). La escala declarada internamente es "xlarge", aunque el checkpoint real cuenta con 24.832 parametros, una discrepancia que conviene tener presente.

En cuanto al entrenamiento, el autor indica que la receta por defecto usa el optimizador novograd con un esquema de linear warmup. Sin embargo, insiste en que estos son valores de partida del script y no evidencia de una ejecucion completada. El fichero `model.safetensors` se describe como un checkpoint de inicializacion para pruebas de humo, no como un modelo entrenado. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. No hay datos sobre tecnicas de decodificacion especulativa ni optimizaciones de atencion mas alla de la ventana deslizante declarada.

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint incluido es una inicializacion sin entrenar.
- No hay evidencia de generacion de texto, razonamiento, codigo ni matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas soportados.
- La tarea objetivo declarada del prototipo es el aprendizaje contrastivo, es decir, aprender representaciones donde muestras similares quedan proximas y las dispares se separan; no hay resultados que confirmen que esta capacidad se haya alcanzado.

## Casos de uso

Dado que el checkpoint no esta entrenado, no existen casos de uso productivos validados. Los siguientes escenarios son aplicaciones potenciales de la arquitectura una vez entrenada y evaluada, y se listan a modo orientativo, no como capacidades confirmadas:

- Recuperacion de informacion y busqueda semantica: un modelo contrastivo entrenado podria generar embeddings para indexar y recuperar documentos o imagenes por similitud.
- Sistemas de recomendacion por similitud: embeddings contrastivos para emparejar usuarios con items afines.
- Deduplicacion y clustering de contenido: agrupar textos o imagenes semanticamente equivalentes en pipelines de limpieza de datos.
- Clasificacion con pocas etiquetas (few-shot): reutilizar representaciones contrastivas como base para tareas posteriores con pocos ejemplos etiquetados.
- Deteccion de similitud textual o de plagio: comparar pares de fragmentos mediante distancia en el espacio de embeddings.
- Fine-tuning como backbone de investigacion: servir de base reproducible para estudiar el efecto de la fusion gated fusion y la atencion de ventana deslizante frente a baselines de capacidad equivalente.

En todos los casos seria imprescindible entrenar el modelo, definir el dataset y reportar metricas en un conjunto de validacion especifico, tal como recomienda el propio autor.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible."

El autor declara explicitamente que el repositorio no reclama ninguna puntuacion de benchmark y que el checkpoint no ha sido entrenado ni evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 24.832 parametros, el modelo es de tamano minimo y los pesos caben en cualquier dispositivo.
- GPU recomendadas: cualquiera; el modelo cabe en CPU, en una GPU integrada o en cualquier GPU dedicada (GTX 1650, RTX 3060, RTX 4090, A100, H100), sin que ninguna aporte ventaja por tamano.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: al ser una implementacion personalizada, las APIs de carga automatica (vLLM, TGI, Ollama, llama.cpp) requeririan un adaptador explicito; el propio autor advierte que hay que inspeccionar el bloque `__main__` de `train.py` y ejecutar `python train.py --help`.
- Latencia y throughput estimados: no disponibles; al no estar entrenado, no tiene sentido medir rendimiento de inferencia.

## Comparativa con modelos similares

No disponible. Un checkpoint sin entrenar de aproximadamente 25.000 parametros no es comparable con modelos contrastivos o encoder en produccion, que operan en rangos de decenas o cientos de millones de parametros (por ejemplo, familias tipo sentence-transformers o CLIP). No se dispone de modelos de referencia equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no esta entrenado: cualquier salida que produzca carece de valor semantico.
- No ha sido auditado en robustez, equidad (fairness) ni transferencia de dominio.
- No se han publicado metricas, por lo que no hay evidencia de rendimiento.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide planificar su uso multilingue.
- La etiqueta "xlarge" de la model card no concuerda con el recuento real de parametros (24.832); conviene no fiarse de esa denominacion.
- Licencia Apache 2.0: permite uso comercial del codigo y los pesos, pero el autor recomienda revisar aparte los terminos de las fuentes de datos externas que se usen con el repositorio.
- Al ser una implementacion personalizada, no es cargable directamente con APIs genericas sin escribir un adaptador.
- No debe presentarse como modelo en produccion ni como benchmark; el autor pide documentar por separado cualquier resultado de un futuro checkpoint entrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ionovikov/cnn-transformer-contrastive
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
