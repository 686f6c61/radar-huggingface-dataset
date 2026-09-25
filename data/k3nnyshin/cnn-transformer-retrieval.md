# k3nnyshin/cnn-transformer-retrieval

## Resumen

`k3nnyshin/cnn-transformer-retrieval` es un repositorio de HuggingFace publicado por el usuario k3nnyshin que contiene una implementación propia y de tamano muy reducido de una arquitectura hibrida CNN-Transformer orientada a tareas de recuperacion (retrieval). No se trata de un modelo entrenado ni de un lanzamiento con pesos listos para produccion: la model card indica explicitamente que `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo (smoke tests), no un checkpoint con benchmarks. El peso total del repositorio, segun el dato real de safetensors, es de 49.600 parametros, es decir, aproximadamente 0,05 millones.

El modelo declara una escala "tiny", atencion de ventana deslizante (sliding window), fusion bilineal de caracteristicas, activacion gelu/tanh y normalizacion InstanceNorm, una combinacion mas propia de vision por computador que de un transformer de lenguaje convencional. La receta de experimento por defecto usa el optimizador AdamW con un schedule polinomico, pero el autor advierte que son valores de partida en el script y no evidencia de un entrenamiento completado. No se reclama ninguna puntuacion de benchmark en el repositorio.

Su relevancia actual es acotada y de caracter experimental: sirve como punto de partida reproducible para investigacion en arquitecturas hibridas aplicadas a retrieval, como base para pruebas de integracion de pipelines propios y como material docente. La guia de evaluacion propuesta por el autor sugiere usar Flickr30k, reportar la metrica de la tarea con al menos tres semillas e incluir una linea base de capacidad equivalente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida CNN + transformer) |
| Parametros totales | 49.600 (≈ 0,05 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (se declara atencion de ventana deslizante, sin especificar el tamano de ventana) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (no se declaran idiomas en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicializacion) |

## Arquitectura y entrenamiento

La arquitectura es una hibrida CNN-Transformer de escala tiny. Los elementos declarados en la model card son: atencion de ventana deslizante (sliding window attention), fusion bilineal entre las representaciones de las dos ramas, funcion de activacion combinada gelu-tanh y normalizacion InstanceNorm. Esta combinacion sugiere un diseno orientado a extraer caracteristicas locales con la rama convolucional y modelar dependencias de mayor alcance con la rama de atencion, con la fusion bilineal encargada de combinar ambas representaciones para producir el embedding final de recuperacion. No se especifica el numero de capas, dimensiones ocultas, tamano de la ventana de atencion ni la composicion del vocabulario o del encoder de entrada.

En cuanto al entrenamiento, no hay evidencia de ningun run completado. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta por defecto, que emplea AdamW y un schedule polinomico. No se documenta el numero de tokens o pares de entrenamiento, la composicion del dataset, ni el uso de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se describen innovaciones adicionales como decodificacion especulativa o atencion lineal. El autor insiste en que, para una evaluacion con sentido, todas las lineas base deben entrenarse con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias, y que los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto aqui incluidos.

## Capacidades

- Recuperacion (retrieval): es la tarea declarada del modelo. La implementacion produce representaciones para emparejamiento entre consultas y candidatos, presumiblemente en un escenario multimodal, dado que el autor propone Flickr30k como conjunto de evaluacion.
- Estado de entrenamiento: el checkpoint publicado no ha sido entrenado ni auditado, por lo que no se puede afirmar que realice ninguna tarea de forma funcional. Las capacidades listadas a continuacion son las que el codigo esta disenado para soportar, no capacidades verificadas.
- Generacion de texto: no disponible.
- Razonamiento, matematicas y codigo: no disponibles.
- Tool calling / function calling: no soportado ni declarado.
- Soporte de agentes y razonamiento multi-paso: no soportado ni declarado.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Vision: la rama CNN y el uso propuesto de Flickr30k apuntan a un posible componente visual, pero la model card no detalla el pipeline de entrada ni confirma el tipo de modalidad.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.
- Integracion: al ser una implementacion propia, las APIs automaticas de carga generica requieren un adaptador explicito antes de su uso.

## Casos de uso

- Pruebas de humo (smoke tests) de infraestructura: el checkpoint de inicializacion permite verificar que un pipeline de carga de safetensors, construccion del grafo y forward pass funciona correctamente antes de invertir en entrenamientos reales, sin coste de computo apreciable dado su tamano de 49.600 parametros.
- Punto de partida para investigacion en arquitecturas hibridas: un grupo que quiera estudiar el efecto de la fusion bilineal o de la atencion de ventana deslizante en retrieval puede partir de esta configuracion y compararla con variantes propias bajo el mismo presupuesto de entrenamiento.
- Reproduccion de lineas base academicas: la guia del autor propone evaluar con Flickr30k, al menos tres semillas y una linea base de capacidad equivalente; el repositorio encaja como base para montar ese protocolo de comparacion reproducible.
- Material docente: el repo incluye un unico artefacto principal (`finetune.py`) mas configuracion y checkpoint, lo que lo hace util para explicar en clase la diferencia entre un checkpoint de inicializacion y un modelo entrenado, y para mostrar el ciclo completo de definicion, configuracion y entrenamiento.
- Validacion de integraciones con `transformers`: al requerir un adaptador explicito, sirve para probar flujos de registro de modelos personalizados en la libreria de HuggingFace antes de escalar a implementaciones mayores.
- Investigacion en retrieval multimodal a pequena escala: si se entrena con pares imagen-texto, el modelo podria emplearse para experimentos de recuperacion cruzada en conjuntos de datos de referencia, aunque esta capacidad no esta demostrada ni medida en el repositorio.
- Prototipado de bajo coste en entornos sin GPU: por su tamano, cualquier experimento de integracion puede ejecutarse en CPU o en portatiles sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint incluido no es un checkpoint entrenado con metricas asociadas. La model card unicamente propone una metodologia de evaluacion futura (Flickr30k, minimo tres semillas, linea base de capacidad equivalente, registro de logs de entrenamiento y versiones del entorno), sin aportar numeros.

## Requisitos de hardware

- VRAM estimada: con 49.600 parametros, el peso en fp32 es de aproximadamente 198 KB, en fp16 de unos 99 KB y en int8 de unos 50 KB. A esto hay que sumar el coste de activaciones y del optimizador si se entrena, que no se puede estimar sin conocer las dimensiones ocultas y el tamano de lote, datos no disponibles.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integradas modernas; no se requiere A100, H100 ni RTX 4090 para este modelo.
- GPU de consumo: si, cabe en cualquier GPU de consumo e incluso se ejecuta en CPU sin problemas.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI. Al tratarse de una implementacion propia con atencion de ventana deslizante y fusion bilineal, el despliegue requiere cargar el codigo del repositorio y anadir un adaptador explicito para APIs genericas.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, contexto o capacidad de ningun modelo comparable, y el propio repositorio se presenta como un esqueleto sin entrenar y sin benchmarks, por lo que cualquier comparacion numerica con alternativas de la categoria de retrieval (por ejemplo, modelos de recuperacion multimodal consolidados) seria especulativa. La busqueda web no aporta cifras comparativas: los resultados encontrados son otros notebooks o tutoriales de terceros con nombres similares y un articulo sobre retrieval de viento con redes CNN-Transformer, ninguna de las cuales ofrece una comparacion directa.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado: no sirve para inferencia util en produccion.
- El autor indica que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No hay benchmarks, por lo que no existe evidencia de calidad en ninguna tarea.
- No se declaran idiomas soportados ni cobertura multilingue.
- No se especifica la longitud de contexto ni el tamano de la ventana de atencion, lo que impide planificar escenarios con entradas largas.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento fuera de distribucion; al no estar entrenado, estas evaluaciones no aplican todavia, pero tampoco existen para futuros checkpoints.
- Licencia MIT: permite uso comercial y modificacion, pero el autor advierte que deben revisarse por separado los terminos de los datos de origen si el repositorio se usa con datasets externos.
- Al ser una implementacion personalizada, las APIs automaticas de carga de `transformers` no funcionan sin un adaptador explicito, lo que anade trabajo de integracion.
- Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto incluidos en `training_args.json`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/k3nnyshin/cnn-transformer-retrieval
- Repositorio con nombre similar de otro autor (notebook): https://huggingface.co/artemyakovlev/cnn-transformer-retrieval-notebook
- Repositorio con nombre similar de otro autor (tutorial): https://huggingface.co/nathanvin/cnn-transformer-retrieval-tutorial
- Articulo sobre una red hibrida CNN-Transformer para retrieval de velocidad del viento (IEEE): https://ieeexplore.ieee.org/document/10754265
- Repositorio de la libreria transformers de HuggingFace: https://github.com/huggingface/transformers
- Seguimiento de lanzamientos de modelos de IA (contexto temporal, septiembre de 2026): https://aireleasetracker.com/latest
