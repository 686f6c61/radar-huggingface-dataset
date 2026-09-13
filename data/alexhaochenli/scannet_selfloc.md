# AlexHaochenLi/scannet_selfloc

## Resumen

Este repositorio de Hugging Face no contiene un modelo entrenado, sino un generador de datos independiente para la autolocalizacion sobre ScanNet. Lo publica el usuario AlexHaochenLi y su proposito es construir muestras de entrenamiento con las que un modelo pueda inferir su celda de camara y uno de ocho vectores de orientacion de rejilla a partir de una rejilla de objetos en ASCII y una entrada RGB multi-imagen de ScanNet. El repositorio ocupa 9,1 GB y no declara licencia, idiomas ni pipeline.

Cada registro JSONL incluye un objetivo oculto (celda de camara y vector de orientacion), la rejilla ASCII recortada, las rutas de las imagenes RGB y metadatos de auditoria; la camara nunca se dibuja en la rejilla. Los grupos multi-imagen se expanden deliberadamente en registros separados, uno por imagen ancla elegible, manteniendo la correlacion mediante `image_group_id` y `anchor_image_index`.

Es relevante ahora porque aborda la generacion de datos de razonamiento espacial y localizacion egocentrica, un cuello de botella habitual en benchmarks de agentes embodied. No se publican pesos, arquitectura, parametros ni resultados de benchmarks: el valor del repositorio esta en el pipeline de generacion y en su esquema de etiquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: es un generador de datos en Python, no una red neuronal |
| Parametros totales | no disponible (no es un modelo de pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible; las etiquetas y metadatos estan en ingles |
| Licencia | no disponible |
| Formato de pesos | no aplica; los artefactos son JSONL, imagenes RGB, JSON de resumen y HTML de visualizacion |
| Autor | AlexHaochenLi |
| Tamano del repositorio | 9,1 GB |
| Fecha de creacion | 2026-09-02 |
| Ultima actualizacion | 2026-09-13 |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

El repositorio es un pipeline de generacion de datos, no un modelo entrenado. El script principal, `generate_scannet_self_localization.py`, produce registros con un objetivo oculto compuesto por `CAMERA_CELL: (x, y)` y `FACING_VECTOR: [dx, dy]`. Las etiquetas de orientacion se restringen a ocho direcciones: `[0, -1]`, `[1, -1]`, `[1, 0]`, `[1, 1]`, `[0, 1]`, `[-1, 1]`, `[-1, 0]` y `[-1, -1]`. El generador no importa el codigo de construccion de QA de VSI-590K; las rutinas de visibilidad, desenfoque y clips coherentes residen localmente en `common.py`.

El filtrado aplica varianza laplaciana con los valores por defecto del pipeline original: un minimo de 50,0 y el percentil 30 por escena. Se descartan las etiquetas a menos de 5 grados de una frontera angular de 22,5 grados. Los centros de camara deben caer en el cuadrado central de 0,9 m x 0,9 m de su celda de rejilla de 1 m, con un desplazamiento maximo de 0,45 m respecto al centro en cada eje. Las categorias de objetos visibles y su interseccion con la rejilla se conservan como metadatos de auditoria, pero no determinan la elegibilidad del ancla.

Los grupos multi-imagen se extraen de ventanas deslizantes fijas de 180 fotogramas. Dentro de una ventana, cada imagen posterior debe diferir de la inmediatamente anterior en al menos 0,50 m de movimiento de camara o 20 grados de guinada, de modo que un grupo contiene entre dos y `--max-multi-images` imagenes. El `source_span` inclusivo va del primer al ultimo fotograma clave seleccionado y, una vez aceptado, ese intervalo queda indisponible para grupos posteriores de la misma escena, evitando solapamiento entre segmentos de trayectoria. El script `generate_scannet_self_localization_uniform.py` construye grupos base dividiendo el video en ventanas de `--uniform-window-size` fotogramas y muestreando `--uniform-frames-per-window` fotogramas por ventana, con busqueda de reemplazo en un radio de `--uniform-replacement-radius` fotogramas y evitando reutilizar fotogramas dentro de la escena.

## Capacidades

- Generacion de registros JSONL de autolocalizacion con celda de camara y vector de orientacion como objetivo oculto.
- Extraccion de rejillas de objetos en ASCII a partir de la escena, con recorte de la region relevante.
- Filtrado por desenfoque mediante varianza laplaciana, con umbral absoluto de 50,0 y percentil 30 por escena.
- Descarte de etiquetas ambiguas: elimina las que quedan a menos de 5 grados de una frontera angular de 22,5 grados.
- Restriccion geometrica de centros de camara al cuadrado central de 0,9 m x 0,9 m de cada celda de 1 m.
- Construccion de grupos multi-imagen coherentes con separacion minima de 0,50 m o 20 grados de guinada entre imagenes consecutivas.
- Generacion de una linea base uniforme por ventanas de fotogramas, con reemplazo por distancia mas cercana y sin reutilizacion de fotogramas.
- Auditoria y resumen: `summarize_self_localization.py` agrega estadisticas y `visualize_self_localization_samples.py` produce un HTML con ejemplos.
- Rebase de rutas absolutas historicas del manifiesto a los directorios `--vsi-root`, `--data-root`, `--video-root` y `--grid-root`.
- No ofrece generacion de texto, codigo, matematicas, vision de proposito general, tool calling ni capacidades de agente: es exclusivamente un generador de datos.

## Casos de uso

- Entrenamiento de modelos de autolocalizacion indoor: el pipeline produce pares de rejilla ASCII e imagenes RGB de ScanNet con celda y orientacion anotadas, listos para supervisar tareas de prediccion de pose discreta.
- Evaluacion de razonamiento espacial en agentes embodied: los registros permiten medir si un modelo deduce la posicion de la camara a partir de una representacion simbolica del entorno.
- Benchmarking de modelos multimodales sobre rejillas simbolicas: al combinar ASCII e imagenes, sirve para probar la fusion de modalidades simbolica y visual en tareas de localizacion.
- Filtrado y curaduria de datos de ScanNet: las rutinas de desenfoque, coherencia y elegibilidad de ancla pueden reutilizarse para limpiar otros conjuntos derivados de la misma fuente.
- Generacion de conjuntos con control de solapamiento: el mecanismo de `source_span` permite crear particiones de trayectoria sin fuga entre segmentos, util para divisiones train/test limpias.
- Inspeccion cualitativa de datos: la salida HTML de visualizacion facilita revisar manualmente ejemplos y detectar etiquetas erroneas antes de entrenar.
- Replicacion de experimentos sobre la linea base uniforme: el script uniforme permite comparar estrategias de muestreo (ventanas fijas frente a seleccion voraz) manteniendo los mismos filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de exactitud, ablaciones ni comparaciones numericas entre el muestreo voraz y el uniforme.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el repositorio no ejecuta inferencia de modelos.
- GPU recomendadas: no aplica para el pipeline de generacion; un entrenamiento posterior sobre estos datos quedaria fuera del alcance del repositorio.
- Ejecucion en GPU de consumo: no aplica al generador.
- Almacenamiento: el repositorio ocupa 9,1 GB y los resultados intermedios (imagenes en `--media-root`, JSONL y HTML) anaden espacio adicional segun el numero de escenas.
- Despliegue: no procede con vLLM, llama.cpp, Ollama ni TGI; la ejecucion se realiza con Python. El ejemplo de la model card usa un entorno conda concreto, `/home/haochen/anaconda3/envs/vsibench/bin/python`, que no es portable tal cual.
- Requisitos de datos: el pipeline espera un manifiesto y un layout de 200 escenas, con raices configurables mediante `--vsi-root`, `--data-root`, `--video-root` y `--grid-root`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo y no se proporcionan alternativas comparables equivalentes. La unica referencia interna es la linea de construccion de QA de VSI-590K, cuyo codigo este generador declina importar y sobre el que no se ofrecen datos comparativos de tamano, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo: no puede usarse para inferencia directa ni para generacion de texto, codigo o respuestas.
- Licencia no declarada, lo que impide determinar si su uso comercial es viable; conviene contactar con el autor antes de cualquier despliegue.
- Sin descargas ni likes, y sin documentacion externa: no hay evidencia de validacion por parte de terceros.
- La propia model card advierte de que las anotaciones de visibilidad e instancias persistentes son incompletas y no pueden probar de forma fiable la ausencia de evidencia visual compartida entre dos imagenes; por eso no se exige solapamiento visible minimo.
- El filtro de elegibilidad puede descartar anclas validas en escenas con iluminacion pobre o movimiento rapido, reduciendo la cobertura de la escena.
- El script uniforme puede conservar fotogramas como imagen de entrada sin generar pregunta de ancla cuando no encuentra reemplazo elegible en el radio configurado, lo que introduce registros sin objetivo.
- Las rutas absolutas historicas del manifiesto deben rebasarse manualmente; si las raices no apuntan al layout correcto, la generacion falla.
- El esquema de etiquetas discretiza la orientacion en ocho direcciones y exige que la camara este cerca del centro de la celda, por lo que no representa poses continuas ni posiciones proximas a los bordes.
- No hay garantia de que los datos no contengan sesgos heredados de ScanNet en cuanto a tipos de interior, geografia o distribucion de escenas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AlexHaochenLi/scannet_selfloc
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardan relacion con este repositorio.
