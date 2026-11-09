# AI-KSK/ksk-video-273-comfyui-workflows

## Resumen

AI-KSK/ksk-video-273-comfyui-workflows no es un modelo de IA en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI asociados al episodio 273 del canal AI-KSK, centrado en el acabado de imagen de alta resolucion con la familia de modelos Krea 2. El repositorio contiene seis grafos JSON que cubren desde un flujo de "desbloqueo de textura" hasta una cadena de escalado a 4K/6K, pasando por un motor de muestreo que combina Clownshark con WanVAE y dos rutas bifasicas que alternan los modelos RAW y Turbo.

El problema que resuelve es de orquestacion: empaquetar en archivos JSON reproducibles una cadena de posprocesado y escalado de imagen que de otro modo quedaria dispersa en un video tutorial. Cada grafo tiene un numero de nodos concreto (entre 11 y 28) y depende de packs de nodos personalizados de ComfyUI, en particular UltimateSDUpscale y CR Upscale, ademas de un nodo de expresion matematica.

Es relevante ahora para desarrolladores que trabajan con pipelines de generacion de imagen en ComfyUI y quieren reproducir una cadena de acabado a alta resolucion sobre modelos Krea 2, aunque conviene advertir que el repositorio no incluye pesos de modelo, no tiene descargas ni interacciones registradas y su licencia figura como "other" sin texto adicional en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows ComfyUI, no de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | other |
| Formato de pesos | JSON (grafos de ComfyUI); no se distribuyen pesos |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado sino de un paquete de seis grafos de ComfyUI en formato JSON, cada uno con un recuento de nodos declarado por el autor: 13 nodos para el flujo de desbloqueo de textura con control condicional mejorado, 13 para el grafo de modelo fusionado Turbo + RAW, 11 para el motor de muestreo Clownshark x WanVAE, 28 para la cadena de escalado 4K/6K, 21 para la ruta bifasica RAW x Turbo y 15 para la cadena RAW base + Turbo. El orden de uso propuesto por el autor es: nucleo de textura, modelo fusionado, motor de muestreo, escalado 4K/6K y las dos rutas bifasicas.

La innovacion tecnica declarada es la combinacion de modelos RAW y Turbo en rutas de dos etapas (borrador con RAW, convergencia con Turbo) y el uso de Clownshark junto con WanVAE como motor de muestreo. No hay informacion sobre datos de entrenamiento, tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, porque el repositorio no entrena ningun modelo.

## Capacidades

- Generacion y acabado de imagen de alta resolucion mediante cadenas de escalado a 4K y 6K.
- Desbloqueo de textura con control condicional mejorado (grafo de 13 nodos).
- Fusion de modelos Turbo y RAW en un unico grafo de muestreo.
- Muestreo con Clownshark y WanVAE como componentes del motor.
- Rutas bifasicas de dos etapas: borrador con RAW y convergencia con Turbo.
- Escalado con UltimateSDUpscale y CR Upscale, apoyado en un nodo de expresion matematica.
- Reproducibilidad: los JSON incluyen los ajustes de sampler tal como se publicaron en el episodio.
- No incluye tool calling, agentes, vision, audio ni modo de razonamiento; es exclusivamente un pipeline de imagen.

## Casos de uso

- Reproduccion de un tutorial: cargar los seis JSON en ComfyUI para replicar exactamente la cadena de acabado del episodio 273, con los samplers y parametros originales.
- Escalado de imagenes generadas a 4K/6K en produccion: usar el grafo de 28 nodos como etapa final de un pipeline de generacion, aplicando UltimateSDUpscale y CR Upscale sobre la salida base.
- Prototipado rapido con rutas bifasicas: emplear el grafo RAW x Turbo de 21 nodos para obtener un borrador rapido y refinarlo en una segunda etapa, reduciendo el coste frente a un muestreo unico a alta resolucion.
- Experimentacion con mezcla de modelos: usar el grafo de modelo fusionado Turbo + RAW para comparar la calidad de una sola pasada frente a la ruta bifasica.
- Evaluacion de motores de muestreo: montar el grafo Clownshark x WanVAE para comparar textura y detalle frente a otros samplers en el mismo pipeline.
- Base para automatizacion por lotes: extraer los parametros de los JSON y trasladarlos a scripts de ComfyUI API para procesar carpetas de imagenes con la misma cadena de acabado.
- Formacion interna de equipo: usar los grafos como referencia documentada de una cadena de posprocesado completa, con recuento de nodos y dependencias explicitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende enteramente de los modelos Krea 2, Clownshark y WanVAE que se carguen en los grafos, no del repositorio en si.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el escalado a 4K/6K con UltimateSDUpscale suele ser intensivo en memoria, pero no hay datos concretos en el repositorio.
- Opciones de despliegue: ComfyUI, con los packs de nodos personalizados UltimateSDUpscale y CR Upscale, mas un nodo de expresion matematica, declarados como requisito por el autor.
- Latencia y throughput: no disponible.
- Tamano del repositorio: 0.0 GB, es decir, solo texto JSON e imagenes de portada.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Nodos o grafos | Licencia | Descargas |
|---|---|---|---|---|---|
| AI-KSK/ksk-video-273-comfyui-workflows | Workflows ComfyUI | 6 grafos JSON + portadas | 11 a 28 nodos por grafo | other | 0 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre repositorios comparables de workflows de ComfyUI para Krea 2 en la informacion proporcionada.

## Limitaciones y advertencias

- No contiene pesos de modelo: es unicamente un conjunto de grafos JSON; sin los modelos Krea 2, Clownshark y WanVAE no produce ninguna salida.
- Dependencias externas obligatorias: UltimateSDUpscale, CR Upscale y un nodo de expresion matematica deben instalarse por separado en ComfyUI.
- Licencia "other" sin texto de licencia en la informacion disponible: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor antes de usarlo en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria ni evidencia de que los grafos funcionen en todas las versiones de ComfyUI.
- Los nombres de los archivos y las portadas estan en chino; el autor advierte que las portadas son arte promocional original y no capturas de ComfyUI ni localizaciones al ingles.
- La correspondencia de `cover_06.jpg` con su grafo se establece solo por carpeta de origen, no por lectura del titulo de la tarjeta, segun el propio autor.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto porque no es un modelo de lenguaje.
- Los enlaces apuntan a RunningHub con codigo de invitacion y a YouTube/Bilibili; la disponibilidad futura de esos recursos no esta garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-273-comfyui-workflows
- Flujo de textura: https://www.runninghub.ai/post/2072681347575017474/?inviteCode=rh-v1111
- Modelo fusionado: https://www.runninghub.ai/post/2072942696737632257/?inviteCode=rh-v1111
- Nuevo motor de muestreo: https://www.runninghub.ai/post/2072703853161705474/?inviteCode=rh-v1111
- Escalado 4K/6K: https://www.runninghub.ai/post/2072681330575495169/?inviteCode=rh-v1111
- Bifasico RAW x Turbo: https://www.runninghub.ai/post/2072657822646624257/?inviteCode=rh-v1111
- Cadena RAW base + Turbo: https://www.runninghub.ai/post/2072657816011231234/?inviteCode=rh-v1111
- Video en YouTube: https://www.youtube.com/watch?v=afMDpUkbO04
- Video en Bilibili: https://www.bilibili.com/video/BV1oUTt6ZEEp
