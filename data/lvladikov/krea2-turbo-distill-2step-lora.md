# lvladikov/Krea2-Turbo-Distill-2step-LoRA

## Resumen

Krea2-Turbo-Distill-2step-LoRA es un adaptador LoRA de destilacion de pasos para el modelo de generacion de imagenes Krea 2 Turbo, desarrollado por el usuario lvladikov. Su objetivo es reducir el coste de muestreo del modelo base: alli donde Krea 2 Turbo opera habitualmente en 8 pasos de denoising, este adaptador pretende producir resultados comparables en 2 pasos, usando los propios pesos y los dos sigmas del modelo Turbo con guidance 0.0, es decir, una cuarta parte de las pasadas de denoising. El adaptador se publica como LoRA de rango 64 sobre los mismos 228 modulos que el anterior LoRA de 4 pasos del mismo autor, manteniendo la forma del adaptador para que sea intercambiable.

El interes tecnico del proyecto esta en su metodo de entrenamiento. El autor documenta que la destilacion progresiva clasica sobre trayectorias grabadas del profesor, incluso con un critico al estilo LADD como remate, convergia a un punto muerto: contornos duplicados en caras y extremidades, textura fina difusa y multitudes promediadas en solapamientos translucidos. El diagnostico es estructural, porque una perdida de regresion cuadratica empuja al estudiante hacia la media de las imagenes plausibles cuando el salto de dos pasos es amplio, y la media de dos imagenes nitidas es una imagen borrosa con bordes duplicados. El proyecto se reorienta hacia *distribution matching*, una objetivo mode-seeking que pregunta si el profesor habria podido producir la imagen del estudiante en lugar de exigir coincidencia con una imagen concreta.

A dia de la informacion disponible el modelo esta en estado de trabajo en curso: el propio autor declara que todavia no hay archivos publicados, con 0 descargas y 0 likes en HuggingFace, y que la pagina se actualiza conforme cambia la receta. La evaluacion reportada es interna (un juez automatico y comparaciones espectrales contra el profesor), no hay validacion independiente ni benchmarks estandar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusion de Krea 2 Turbo |
| Parametros totales | no disponible (repositorio de 0,4 GB; rango 64 sobre 228 modulos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el autor no declara una lista de idiomas para los prompts) |
| Licencia | krea-2-community-license (`license: other`) |
| Formato de pesos | no disponible (libreria `diffusers`; el autor indica que todavia no hay archivos publicados) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado sobre 228 modulos del modelo base Krea 2 Turbo, con la misma forma que el LoRA de 4 pasos del mismo autor. Se disena como *drop-in*: se muestrea con el sampler Euler estandar en `diffusers`, ComfyUI o MLX, con sigmas `[1.0, 0.5128]` y guidance 0.0, sin sampler personalizado, sin cabeza de politica y sin trucos por paso. El autor explicita que si la calidad exigiera un sampler especial, el proyecto no tendria sentido tal como esta planteado.

El entrenamiento parte de los pesos finales del LoRA de 4 pasos y reutiliza las mismas 13.750 trayectorias de profesor grabadas, sin reejecutar el profesor ni una sola vez. La primera fase aplica destilacion progresiva sobre esas trayectorias, con cada llamada del estudiante cubriendo cuatro pasos del profesor, y un critico al estilo LADD como acabado. Al estancarse las metricas y aparecer artefactos estructurales (contornos duplicados, textura fina blanda, multitudes promediadas), el autor descarta el rango del adaptador mediante una prueba de capacidad y descarta el optimizador mediante una perturbacion de la tasa de aprendizaje. La solucion adoptada es un objetivo de *distribution matching* sobre los pesos ya destilados por trayectoria, con el que segun el autor se obtiene en una fraccion del entrenamiento anterior lo que la receta previa no logro, y ademas con distancias latentes al profesor que suben, comportamiento coherente con un objetivo mode-seeking. Sobre esa base se anade un termino de coincidencia espectral contra las propias imagenes del profesor. Todo el entrenamiento se realiza en una unica RTX 3090 de 24 GB.

## Capacidades

- Generacion de imagenes texto-a-imagen en 2 pasos de denoising, frente a los 8 pasos del modelo base Krea 2 Turbo.
- Compatibilidad declarada como *drop-in* con `diffusers`, ComfyUI y MLX usando el sampler Euler estandar.
- Cobertura de un barrido de 12 resoluciones, con resultados reportados desde 512x512 y 768x1024 hasta 1280x1280 y 1440x1440.
- No es un modelo de lenguaje: no realiza generacion de texto, razonamiento, codigo, matematicas, tool calling ni function calling.
- No se declaran capacidades de agente, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento.
- No se declaran capacidades multilingues especificas para los prompts.

## Casos de uso

- Prototipado rapido de imagenes: al reducir el muestreo a 2 pasos con guidance 0.0, permite iterar sobre prompts e ideas con una fraccion del coste de inferencia del modelo de 8 pasos, adecuado para exploracion conceptual antes de fijar una direccion visual.
- Generacion de imagenes por lotes en pipelines de contenido: con una ventana de 12 resoluciones hasta 1440x1440, puede alimentar procesos automatizados de produccion de ilustraciones cuando el coste por imagen es el factor limitante.
- Integracion en flujos ComfyUI existentes: al ser un LoRA estandar muestreado por Euler, se puede insertar en grafos ya construidos sobre Krea 2 Turbo sin reescribir el sampler ni anadir nodos personalizados.
- Despliegue en entornos MLX: la compatibilidad declarada con MLX abre la puerta a inferencia en hardware Apple Silicon dentro de aplicaciones de escritorio o edicion local.
- Reduccion de coste en servicios de generacion de imagenes: bajar de 8 a 2 pasadas de denoising reduce el tiempo de GPU por peticion, lo que resulta relevante en servicios con muchos usuarios concurrentes y presupuesto de computo acotado.
- Investigacion en destilacion de modelos de difusion: el proyecto documenta de forma abierta el fallo de la destilacion por regresion a 2 pasos y la correccion mediante *distribution matching*, lo que lo convierte en un caso de estudio util para quien investigue destilacion de pasos.
- Experimentacion con adaptadores de bajo rango sobre modelos Turbo: al reutilizar 13.750 trayectorias de profesor ya grabadas, sirve como banco de pruebas para recetas de destilacion que evitan reejecutar el profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, etc.) en la informacion disponible. Los unicos datos de evaluacion son internos y autoinformados por el autor.

| Metrica | Resultado reportado |
|---|---|
| Evaluacion por juez automatico a 512x512 | 7,8/10 |
| Evaluacion por juez automatico a 768x1024 | 8,1/10 |
| Coincidencia espectral con el profesor, hasta 1024x768 | Paridad (textura fina y ambas bandas de rejilla dentro de unos pocos puntos porcentuales) |
| Coincidencia espectral, tamanos grandes (1280x1280 y superiores) | Exceso reducido entre un cuarto y un tercio, pero persistente; hasta aproximadamente 1,4x a 1440x1440 en los sujetos mas texturados (naves espaciales, arcilla, aves) |
| Distancia al profesor y saturacion | Sin cambios en todas las resoluciones |
| Variedad entre semillas | Al nivel del profesor |
| Perdidas por pares frente al profesor a 1440x1440 | Ninguna reportada |
| Punto de partida de la pagina | El checkpoint inicial corria entre un 20 y un 50 por ciento por encima en espectro |

## Requisitos de hardware

- Entrenamiento: una unica RTX 3090 de 24 GB, segun declara el autor, con una receta condicionada por esa memoria.
- VRAM de inferencia: no disponible. El tamano del adaptador es de 0,4 GB, pero el consumo depende de los pesos del modelo base Krea 2 Turbo, para el que no se proporcionan parametros ni requisitos de memoria.
- GPU recomendadas: no disponible para inferencia; la unica GPU mencionada en la informacion es la RTX 3090 empleada en entrenamiento.
- Encaje en GPU de consumo: no disponible, a falta de los requisitos del modelo base.
- Opciones de despliegue: `diffusers`, ComfyUI y MLX, con sampler Euler estandar y sigmas `[1.0, 0.5128]`.
- Latencia y throughput: no disponible. La unica indicacion cuantitativa es que 2 pasos suponen una cuarta parte de las pasadas de denoising respecto a los 8 pasos del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Contexto de resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lvladikov/Krea2-Turbo-Distill-2step-LoRA | LoRA de destilacion | 2 | 12 resoluciones, hasta 1440x1440 reportado | krea-2-community-license | En desarrollo; sin archivos publicados segun el autor |
| lvladikov/Krea2-Turbo-Distill-4step-LoRA | LoRA de destilacion | 4 | Mismas 12 resoluciones | krea-2-community-license (no confirmado en la informacion disponible) | Publicado; es la linea de base y el punto de partida del proyecto de 2 pasos |
| krea/Krea-2-Turbo | Modelo base | 8 | no disponible en detalle | krea-2-community-license | Publicado |

No se dispone de informacion sobre otros adaptadores de destilacion comparables para este modelo base ni sobre alternativas de otros autores en la misma categoria.

## Limitaciones y advertencias

- Estado de trabajo en curso: el autor indica explicitamente que todavia no hay archivos publicados y que la pagina se actualiza conforme cambia la receta. El repositorio figura con 0 descargas y 0 likes.
- Artefactos en resoluciones altas: a 1280x1280 y superiores persiste un grano fino en los sujetos mas texturados, por encima del nivel del profesor aunque muy por debajo del inicial.
- Desviaciones de aspecto: en tamanos grandes la piel se percibe algo mas suave y menos saturada que la del profesor, y el pelaje se ve ligeramente mas blando en todos los tamanos.
- Contorno duplicado: las caras a 512x512 aun muestran un contorno doble tenue.
- Evaluacion no independiente: todas las cifras de calidad provienen de un juez automatico y de comparaciones espectrales internas del autor, sin validacion por terceros ni benchmarks estandar.
- Distancias latentes al profesor: el propio autor reporta que las distancias al profesor suben con el objetivo de *distribution matching*; es un comportamiento esperado para un objetivo mode-seeking, pero implica que la similitud pixel a pixel con el profesor no es el criterio de exito.
- Rendimiento dependiente del sujeto: el exceso espectral a 1440x1440 se concentra en sujetos muy texturados (naves espaciales, arcilla, aves), por lo que el comportamiento no es uniforme entre dominios.
- Licencia: se distribuye bajo `krea-2-community-license`, marcada como `other` en HuggingFace. Es una licencia de comunidad, no una licencia de codigo abierto permisiva, por lo que conviene revisar el PDF enlazado antes de cualquier uso comercial.
- Dependencia del modelo base: el adaptador requiere Krea 2 Turbo y hereda las limitaciones, sesgos y restricciones de licencia de ese modelo, no documentadas en la informacion disponible.
- Idiomas: no se declara soporte multilingue de prompts, por lo que el comportamiento con idiomas distintos del usado en el entrenamiento es desconocido.
- Riesgo de alucinacion visual: como modelo generativo de imagenes, puede producir contenido plausible pero incorrecto o incoherente, especialmente en escenas complejas; no se documentan tasas de fallo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-2step-LoRA
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- LoRA de 4 pasos del mismo autor: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA
- Licencia (PDF): https://huggingface.co/lvladikov/Krea2-Turbo-Distill-2step-LoRA/blob/main/LICENSE.pdf
