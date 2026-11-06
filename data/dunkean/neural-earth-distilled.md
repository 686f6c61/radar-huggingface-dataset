# dunkean/neural-earth-distilled

## Resumen

Neural Earth — distilled Infinite Generation es una coleccion de ocho checkpoints de inferencia en PyTorch publicados por el desarrollador dunkean bajo el paraguas del proyecto Neural Earth. No es un modelo de lenguaje, sino un conjunto de componentes destilados para generacion procedural de terreno sintetico, derivados del pipeline del modelo profesor Terrain Diffusion 30m (xandergos/terrain-diffusion-30m). Los checkpoints contienen pesos de inferencia seleccionados (no estados de optimizador) y estan pensados para ejecutarse dentro del runtime Python de Neural Earth y Magna Urbis, no como pipeline independiente de Diffusers ni en el formato WASM de navegador.

El interes tecnico reside en la destilacion de un modelo de difusion de terreno en variantes de pocos pasos (1, 2, 4 y 8 pasos para la etapa coarse) mas decodificadores de distinta anchura (64 y 16) y una base residual experimental de tile finito (`residual8k`). El repositorio completo ocupa 0,1 GB y los ocho ficheros suman 88.582.903 bytes, lo que refleja que se trata de componentes ligeros de inferencia, no de un modelo de gran tamano.

La relevancia actual es acotada pero especifica: permite generar terreno plausible de forma rapida y con pocos pasos de difusion en entornos Python, algo util para videojuegos, simulacion y visualizacion geografica. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la ficha, y su uso esta fuertemente condicionado a la integracion con el codigo fuente de Neural Earth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion (destilada del profesor Terrain Diffusion 30m); etapas coarse, residual y decoder |
| Parametros totales | no disponible (ocho checkpoints; el mayor, `residual8k.pt`, ocupa 18.284.418 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generacion de terreno, no texto) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT (Copyright © 2026 dunkean); atribucion del profesor en `LICENSE-TEACHER.txt` |
| Formato de pesos | `.pt` (PyTorch, `weights_only=True`), ocho ficheros |

## Arquitectura y entrenamiento

El modelo es una destilacion del pipeline de generacion de terreno del profesor Terrain Diffusion 30m. Se distribuyen ocho checkpoints organizados por etapa: cuatro variantes coarse con distinto numero de pasos (1, 2, 4 y 8 pasos, con seleccion EMA a 200k, 200k, 50k y 25k respectivamente), una variante legacy de 8 pasos (EMA 22,5k), una base residual de tile finito (`residual8k`, pesos raw 8k), y dos decodificadores de anchura 64 (EMA 200k) y anchura 16 (EMA 10k). No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset, dado que no es un modelo de lenguaje.

La innovacion principal es la destilacion para reducir el numero de pasos de difusion necesarios en la etapa coarse, lo que permite generar terreno con 1, 2, 4 u 8 pasos segun el checkpoint. El checkpoint `residual8k` es experimental y opera en un dominio latente propio, requiriendo el `coarse2` exacto y uno de los dos decodificadores; usa flujo finito y reconstruccion fisica guiada, y no puede sustituir a la base original en el pipeline de mundo continuo. Las revisiones de origen (Neural Earth: `9195504...`, profesor: `9ef8030...`) y los pasos de entrenamiento estan registrados en `model-inventory.json`.

## Capacidades

- Generacion de terreno sintetico plausible mediante difusion, con variantes de 1, 2, 4 y 8 pasos en la etapa coarse.
- Decodificacion de terreno con dos anchuras de decoder (64 y 16), lo que permite distintos compromisos de detalle y coste.
- Base residual de tile finito (`residual8k`) con flujo finito y reconstruccion fisica guiada para refinamiento de detalle cercano.
- Integracion con el runtime Python de Neural Earth y Magna Urbis (funciones `load_student` y carga de tiles finitos).
- Verificacion de integridad de checkpoints mediante SHA-256 y carga segura con `weights_only=True`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo linguistico.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de mapas de terreno para videojuegos: los checkpoints coarse de 1 a 8 pasos permiten producir tiles de terreno de forma rapida dentro del runtime Python de Neural Earth, reduciendo el coste de difusion frente al profesor.
- Simulacion geografica y entrenamiento: la generacion de terreno sintetico plausible sirve para poblar entornos de simulacion donde no se dispone de datos de elevacion reales, con la advertencia de que las salidas no son geografia certificada.
- Visualizacion y previsualizacion de mundos: el decoder de anchura 16 (860.920 bytes) ofrece una variante ligera para vistas previas de bajo coste antes de generar el terreno final con `decoder64`.
- Refinamiento de detalle cercano: `residual8k` combinado con `coarse2` y un decoder permite reconstruccion fisica guiada de detalle en tiles finitos, adecuado para escenas donde se requiere mayor fidelidad local.
- Investigacion en destilacion de modelos de difusion: los ocho checkpoints con distintos pasos y selecciones EMA (desde 10k hasta 200k) permiten estudiar el compromiso entre pasos de muestreo, seleccion de pesos y calidad de salida.
- Integracion en pipelines de generacion procedural: al cargarse como tensores PyTorch verificables por SHA-256, los checkpoints pueden incorporarse en herramientas de autoria de contenido que ya usen el runtime de Magna Urbis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el tamano del modelo por si solo no establece el uso de memoria en runtime, la velocidad de generacion, los requisitos de hardware ni la calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los checkpoints son ligeros (el mayor, 18.284.418 bytes; el total, 88.582.903 bytes), pero la model card advierte que el tamano del modelo no determina el uso de memoria en runtime.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la model card no confirma que quepa en GPU de consumo concretas.
- Opciones de despliegue: runtime Python de Neural Earth y Magna Urbis (funciones `load_student` y carga de tiles finitos); se requiere `torch` y `huggingface_hub`. No es compatible con Diffusers como pipeline independiente ni con el formato WASM de navegador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dunkean/neural-earth-distilled | difusion de terreno destilada (8 checkpoints) | no disponible (88,6 MB total) | no aplica | MIT | Hugging Face, runtime Python propio |
| xandergos/terrain-diffusion-30m (profesor) | difusion de terreno | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Otros modelos de generacion de terreno | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre el modelo destilado y el profesor en la informacion proporcionada.

## Limitaciones y advertencias

- Las salidas son terreno sintetico plausible; no son elevacion medida, geografia certificada ni sustituto de datos de topografia o seguridad critica.
- `residual8k` es experimental, opera en un dominio latente propio y requiere el `coarse2` exacto y `decoder64` o `decoder16`; no puede sustituir a la base original en el pipeline de mundo continuo.
- Los checkpoints no son un pipeline autonomo: requieren el codigo fuente de Neural Earth y las dependencias Python correspondientes; no funcionan como pipeline de Diffusers ni en navegador.
- La model card no confirma compatibilidad con navegador pese a que los checkpoints sean independientes del navegador.
- No se especifican sesgos conocidos ni riesgos de alucinacion en la informacion disponible, aunque al ser generacion sintetica no debe interpretarse como dato real.
- Licencia MIT permite uso comercial, pero debe reproducirse la atribucion del profesor recogida en `LICENSE-TEACHER.txt`.
- El repositorio tiene 0 descargas y 0 likes, y no hay benchmarks publicados que permitan validar la calidad frente al profesor.

## Enlaces

- Hugging Face: https://huggingface.co/dunkean/neural-earth-distilled
- Modelo profesor: https://huggingface.co/xandergos/terrain-diffusion-30m
- Revision del profesor: https://huggingface.co/xandergos/terrain-diffusion-30m/tree/9ef8030cb805b433b98ec25c5dddefbac07a9e26
- Codigo fuente Neural Earth: https://github.com/dunkean/neural-earth
- Revision Neural Earth: https://github.com/dunkean/neural-earth/tree/919550498b3fd7c9d4c53e575f6a2d5475f9be2d
- Codigo de destilacion: https://github.com/dunkean/neural-earth/tree/919550498b3fd7c9d4c53e575f6a2d5475f9be2d/distill
