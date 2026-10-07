# akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA

## Resumen

Qwen-Image-2.1 · Multiple-Angles es un adaptador LoRA de control de cámara para el modelo de difusión Qwen-Image-2.1, publicado por el usuario akhaliq. Su función es reencuadrar (reshoot) un objeto a partir de una única imagen de referencia: se le entrega una foto y una indicacion de azimut y elevacion, y devuelve el mismo sujeto desde ese punto de vista. Es, segun la model card, el primer LoRA de control de cámara para Qwen-Image-2.1, la base de imagen mas reciente de Qwen (generacion y edicion unificadas, con soporte RGBA nativo), donde este formato no existia.

El adaptador define un trigger token obligatorio (`<mva>`) y un diccionario de encuadres: 12 azimuts en pasos de 30 grados multiplicados por 4 elevaciones (0 grados a nivel de ojos, 30 grados elevado, 60 grados en angulo alto y 90 grados en picado cenital), mas una variante close-up de cada uno, lo que da 72 encuadres direccionables. Se distribuye en dos versiones: la v1 (checkpoint recomendado en el paso 1.000) y una v2 reentrenada sobre los puntos debiles de la v1, que es la recomendada por el autor.

La relevancia actual del adaptador esta en que resuelve una tarea concreta (multi-view consistente) con un coste minimo: los pesos del adaptador ocupan 159 MB en la v1 y 319 MB en la v2, y se aplican sobre una base ya existente en lugar de requerir un modelo especifico. La licencia apache-2.0 y el formato safetensors para diffusers y ComfyUI facilitan su integracion en pipelines de image-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre el modelo de difusion Qwen/Qwen-Image-2.1 |
| Parametros totales | no disponible (rango 64 en la v2, rango 32 en la v1; pesos del adaptador de 159 MB en la v1 y 319 MB en la v2) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento de la v2 en bf16 a precision completa; la v1 uso convrot8 int8 durante el entrenamiento) |
| Idiomas soportados | no disponible (los prompts de ejemplo de la model card estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Rango / alpha | 64 (v2) / 32 (v1) |
| Fuerza recomendada | 0,8 a 1,0 en ComfyUI y diffusers |
| Trigger token | `<mva>` |
| Encuadres direccionables | 72 (12 azimuts x 4 elevaciones, mas variante close-up de cada uno) |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tamano del repositorio | 7,5 GB |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan al modelo base de difusion Qwen-Image-2.1 sin modificar sus pesos originales. No se trata por tanto de una red completa: la arquitectura subyacente es la del propio Qwen-Image-2.1. El unico control estructural que anade el adaptador es la asociacion entre el trigger `<mva>` mas una descripcion textual de encuadre y una pose de camara concreta del diccionario. El entrenamiento es de tipo image-to-image con pares de vistas, no texto-a-imagen puro.

La version 1 se entreno con 5.028 pares a rango 32, con muestreo de timesteps de tipo shift y precision base convrot8 int8, guardando checkpoints cada 250 pasos dentro de una ejecucion de 2.500 pasos. La version 2 incrementa el volumen y el rango: 13.328 pares (9.376 de Dome-Objaverse con prioridad a personajes, mas 3.952 procedentes de 1.986 personajes riggeados filtrados por licencia), rango 64, precision bf16 a precision completa y muestreo de timesteps ponderado. El checkpoint recomendado de la v2 es el paso 1.500 (319 MB); el de la v1 es el paso 1.000 (159 MB, en la raiz del repositorio). El autor justifica la eleccion del paso 1.500 con dos lecturas independientes: las rejillas de muestras cada 250 pasos, donde el seguimiento de angulo es solido desde el paso 1.000 y aparece una ligera deriva de orientacion en el 2.500, y una curva sobre fotos reales fuera de distribucion que no reproduce esa deriva.

## Capacidades

- Reencuadre controlado por camara: genera el mismo sujeto desde un azimut y una elevacion especificos a partir de una sola imagen.
- Cobertura de 72 encuadres: 12 azimuts (pasos de 30 grados), 4 elevaciones (0, 30, 60 y 90 grados) y una variante close-up de cada combinacion.
- Image-to-image con preservacion de sujeto: mantiene la identidad del objeto y, en gran medida, el fondo de la escena original.
- Generalizacion a fotos reales fuera de distribucion: probado con un golden retriever, un gato y una manzana de Wikimedia Commons, con fidelidad de identidad calificada como buena pero no perfecta (el detalle fino de pelo se suaviza).
- Edicion de imagen: la etiqueta image-editing forma parte del modelo, orientada a modificar el punto de vista sin regenerar el sujeto.
- Integracion como adaptador: se aplica sobre Qwen-Image-2.1 en diffusers y ComfyUI, sin reentrenar la base.
- No consta soporte de tool calling, function calling, agentes, audio ni vision de entrada mas alla del propio pipeline image-to-image. No hay datos de capacidades multilingues.

## Casos de uso

- Fotografia de producto para comercio electronico: a partir de una sola foto de un articulo se generan vistas frontal, trasera, en angulo y cenital, evitando una sesion fotografica con multiples tomas y asegurando consistencia de identidad entre imagenes.
- Previsualizacion de assets en desarrollo de videojuegos: convertir un render o una foto de referencia de un objeto o personaje en un conjunto de vistas orbitadas para evaluar su silueta y legibilidad desde distintos angulos antes de modelar en 3D.
- Aumento de datos para vision por computador: generar vistas multi-angulo etiquetadas de objetos para ampliar datasets de entrenamiento de clasificacion, deteccion o estimacion de pose, usando el diccionario de 72 encuadres como etiquetado de camara.
- Preparacion para reconstruccion 3D: obtener vistas adicionales coherentes del mismo sujeto como entrada para pipelines de fotogrametria o de reconstruccion multi-vista.
- Catalogacion y digitalizacion de patrimonio: documentar piezas de museo o archivo desde angulos estandarizados (incluido el cenital a 90 grados) partiendo de un numero reducido de fotografias.
- Ilustracion y concept art: explorar el mismo personaje u objeto desde distintos puntos de vista manteniendo el diseno, util en fases de preproduccion.
- Inmobiliaria y visualizacion de espacios: generar encuadres alternativos de un objeto o mobiliario dentro de una escena para presentaciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion aportada por el autor es cualitativa: rejillas de muestras cada 250 pasos de la ejecucion de la v2, una curva sobre fotos reales fuera de distribucion (gato, perro y un tercer sujeto reservado, comparando v1 en el paso 1.000 frente a v2 del paso 500 al 2.500 con el mismo prompt y las mismas semillas) y un conjunto de ejemplos con el checkpoint v1 del paso 1.000. El autor indica que la v2 mantiene identidad y detalle de fondo al menos igual de bien que la v1 en el paso 1.000 en los tres sujetos y que no se observa deriva en el paso 2.500 sobre fotos reales. Queda pendiente, segun la propia model card, una prueba especifica sobre personajes (el dominio objetivo de los datos de Linzhan), por lo que el paso 1.000 de la v1 sigue siendo el respaldo completamente verificado hasta entonces.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El consumo lo determina casi por completo el modelo base Qwen-Image-2.1, no el adaptador, y la model card no publica cifras.
- Peso del adaptador: 159 MB (v1, paso 1.000) y 319 MB (v2, paso 1.500); el repositorio completo ocupa 7,5 GB por la acumulacion de checkpoints.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende de los requisitos del modelo base.
- Opciones de despliegue: diffusers (libreria declarada) y ComfyUI, ambos mencionados en la model card para el ajuste de fuerza del adaptador.
- Ajuste de fuerza: empezar en 1,0 y bajar hacia 0,8 si el resultado tiende a copiar la vista de referencia en lugar de mover la camara.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros LoRA de control de camara ni de adaptadores multi-vista comparables, ni cifras que permitan contrastar parametros, contexto, rendimiento o licencia frente a alternativas. El unico punto de referencia objetivo es el modelo base, Qwen/Qwen-Image-2.1, sobre el que este adaptador se aplica.

## Limitaciones y advertencias

- Fidelidad de identidad fuera de distribucion limitada: el propio autor la califica de buena pero no perfecta, con perdida de detalle fino (por ejemplo, textura de pelo) en sujetos que el modelo no ha visto.
- Deriva en checkpoints tardios: en el paso 2.500 de la v1 las salidas empiezan a copiar la vista de referencia en lugar de mover la camara; en la rejilla de muestras de la v2 aparece una ligera deriva de orientacion en el paso 2.500, aunque no se reproduce sobre fotos reales.
- Dependencia del prompt y del trigger: cada prompt debe comenzar por `<mva>` para activar el control de camara; sin el, el comportamiento no esta documentado.
- Sensibilidad a la fuerza de aplicacion: por encima o por debajo del rango recomendado (0,8 a 1,0) el resultado puede degradarse; el autor recomienda ajustar la fuerza antes que cambiar de checkpoint.
- Checkpoints no intercambiables: los guardados en los pasos 250 a 750 estan subentrenados y los archivos de tipo smoke son artefactos de prueba que conviene ignorar.
- Prueba de personajes pendiente: el dominio objetivo de los datos de la v2 no cuenta todavia con una evaluacion dedicada publicada.
- Idiomas soportados no declarados; los ejemplos de la model card estan en ingles.
- Licencia apache-2.0, que en principio permite uso comercial, pero el adaptador depende del modelo base Qwen/Qwen-Image-2.1: conviene verificar los terminos de ese modelo antes de un despliegue en produccion.
- Riesgo de alucinacion visual: como modelo generativo, puede introducir o eliminar detalles del sujeto al cambiar de punto de vista.
- Cero descargas registradas en el momento de la consulta, con 18 likes: el modelo es muy reciente y cuenta con poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de entrenamiento de la v2: https://huggingface.co/datasets/akhaliq/qwen21-multiple-angles-train-v2
- Panel de entrenamiento de la v2 (trackio): https://huggingface.co/spaces/akhaliq/qwen21-multiple-angles-v2-trackio
- Ejemplos de fotos reales (Wikimedia Commons): https://commons.wikimedia.org/wiki/File:Golden_Retriever_Carlos_(10581910556).jpg, https://commons.wikimedia.org/wiki/File:Cat03.jpg, https://commons.wikimedia.org/wiki/File:Red_Apple.jpg
- No se han encontrado papers, blogs ni repositorios adicionales en la informacion proporcionada.
