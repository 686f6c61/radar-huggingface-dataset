# AI-KSK/ksk-video-215-comfyui-workflows

## Resumen

AI-KSK/ksk-video-215-comfyui-workflows no es un modelo de pesos en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI orientados a la generacion de video con LTX 2.3, un modelo de difusion de video de 22 000 millones de parametros. El repositorio documenta un grafo de cuatro imagenes con tecnica de primer/ultimo fotograma (first/last frame) al que se anade un LoRA de transicion, de modo que las uniones entre imagenes se perciban como movimiento continuo y no como cortes secos.

El contenido publicado es una nota tutorial (README) que describe los hechos del grafo JSON: 81 nodos, checkpoint `ltx-2.3-22b-dev.safetensors`, tres LoRA apilados (`ltx-2.3-22b-distilled-lora-384` a 0.5, `ltx2.3-transition` a 1.0 y `LTX2.3_Reasoning_V1` a 1.0), un render en tres pasadas con muestreadores `euler_ancestral_cfg_pp` y `euler_cfg_pp` a CFG 1, y un upscaler espacial x2 que lleva el total a un aumento de 4x.

Es relevante ahora porque demuestra un patron practico de generacion de video multi-imagen con control de transiciones mediante LoRA, un caso de uso creciente en produccion audiovisual. El tamano del repositorio es de 0.0 GB: no contiene pesos, solo el README descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no describe la arquitectura interna de LTX 2.3; el flujo usa difusion de video con muestreo euler ancestral y euler, CFG 1) |
| Parametros totales | 22 000 millones (checkpoint referenciado `ltx-2.3-22b-dev.safetensors`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (latentes de video 320x288x97 y audio de 97 fotogramas a 25 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (checkpoint y LoRA referenciados en el grafo); el repositorio en si no incluye pesos |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de LTX 2.3 ni sus datos de entrenamiento. Lo que si describe es la topologia del grafo de inferencia: un primer pase con el muestreador `euler_ancestral_cfg_pp`, CFG 1 y una cadena de nueve valores sigma que arranca en 1.0; y dos pases posteriores con `euler_cfg_pp`, CFG 1 y sigmas `0.85, 0.7250, 0.4219, 0.0`. Los latentes de la primera pasada son de 320x288x97, con audio de 97 fotogramas a 25 fps, y el upscaler `ltx-2.3-spatial-upscaler-x2-1.1` aplica un aumento espacial x2 por pase.

La innovacion tecnica destacable es la combinacion de tres LoRA sobre el checkpoint base: un LoRA destilado (`ltx-2.3-22b-distilled-lora-384` a 0.5) que reduce pasos de muestreo, un LoRA de transicion (`ltx2.3-transition` a 1.0) que convierte las uniones entre imagenes en movimiento, y un LoRA de razonamiento (`LTX2.3_Reasoning_V1` a 1.0, efectivo desde 0.5 y con techo en torno a 1.5, siendo 1.0 el valor equilibrado recomendado). El render en tres pasadas produce un aumento total de 4x, lo que obliga a mantener pequena la resolucion del primer pase.

## Capacidades

- Generacion de video a partir de multiples imagenes de entrada con control de primer y ultimo fotograma (first/last frame).
- Transiciones entre imagenes percibidas como movimiento continuo gracias al LoRA de transicion.
- Generacion de audio sincronizado: 97 fotogramas de audio a 25 fps en el grafo descrito.
- Render multietapa con upscaling espacial progresivo (x2 por pase, x4 total en tres pasadas).
- Control fino del muestreo mediante cadenas de sigma personalizadas y CFG 1.
- Aplicacion de LoRA apilados con pesos ajustables por separado.
- Idioma de trabajo: ingles (prompts y documentacion).

## Casos de uso

- Produccion de video multi-escena: el flujo encadena cuatro imagenes con primer/ultimo fotograma y el LoRA de transicion, util para generar secuencias donde cada corte debe leerse como continuidad de camara.
- Storyboards animados: a partir de fotogramas clave dibujados, el grafo interpola movimiento entre ellos, lo que permite previsualizar una secuencia antes de rodarla.
- Transiciones de marca en publicidad: las reglas de prompt (lenguaje de camara primero, luego sujeto y escena, enfasis en el proceso de cambio) permiten generar transiciones con detalle de luz, material y color controlados.
- Prototipado de video musical o contenido corto: el audio generado a 25 fps y los 97 fotogramas permiten clips breves listos para montaje.
- Investigacion en generacion de video condicionada por imagenes: el repositorio documenta los parametros exactos (sigmas, CFG, pesos de LoRA) para reproducir y modificar el flujo.
- Integracion en pipelines de ComfyUI existentes: el grafo JSON de 81 nodos puede importarse y adaptarse, cambiando el numero de imagenes de entrada mediante modificacion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint base es de 22 000 millones de parametros, lo que en precision de 16 bits implicaria del orden de 44 GB solo para pesos, mas latentes y estados del muestreador; no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (el flujo se distribuye como grafo JSON para este entorno).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Los resultados son probabilisticos segun el propio autor; la reproducibilidad exacta no esta garantizada.
- El numero de imagenes de entrada del grafo publicado es cuatro; modificarlo es una alteracion local no soportada oficialmente.
- La estructura de tres pasadas es heredada del flujo original y no se justifica ni se valida en la documentacion.
- El repositorio no contiene pesos (0.0 GB): solo el README. No es desplegable por si mismo.
- Licencia "other": no se especifican los terminos de uso comercial; es necesario consultar la licencia del checkpoint LTX 2.3 y de cada LoRA por separado.
- Idioma soportado unicamente ingles; los prompts en otros idiomas no estan documentados.
- Los pesos de LoRA tienen rangos efectivos acotados (el de razonamiento, por ejemplo, desde 0.5 hasta un techo de ~1.5); valores fuera de rango pueden degradar la salida.
- No se documentan sesgos, tasas de alucinacion visual ni limitaciones de contexto mas alla de las dimensiones del grafo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-215-comfyui-workflows
- RunningHub: https://www.runninghub.ai/post/2039960294918721537/?inviteCode=rh-v1111
- Video en YouTube: https://www.youtube.com/watch?v=SreDG4JbT9U
- Video en Bilibili: https://www.bilibili.com/video/BV18B9gB1Eni
