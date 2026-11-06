# colinurbs/moss-passenger-trains-lora

## Resumen

`colinurbs/moss-passenger-trains-lora` es un adaptador LoRA para el modelo de generación de imágenes OpenMOSS/MOSS-Image-Base, especializado en fotografía de trenes de pasajeros de América del Norte. Lo desarrolla el usuario de Hugging Face colinurbs y complementa a su LoRA anterior sobre trenes de mercancías. El adaptador cubre 40 clases de material rodante: locomotoras diésel (EMD F40PH en libreas de Amtrak, commuter, Coaster y VIA, GE Genesis, F59PH/PHI, MPI MP36/MP40, Siemens Charger, MLW LRC, E8/E9), eléctricas (ACS-64, AEM-7, HHP-8, GG1) y coches y trenes completos (Amfleet, Horizon, Viewliner, Superliner, bilevels, gallery cars, Acela, Avelia Liberty, Talgo, Brightline, Budd RDC), bajo operadores como Amtrak, VIA Rail y diversos operadores de cercanías.

El modelo se entrenó sobre 2.667 fotografías de Wikimedia Commons con licencias libres (CC BY, BY-SA, CC0, dominio público y GFDL), con captions largos, medios y cortos. El resultado es un adaptador de rank 64 y alpha 16 que se aplica sobre el checkpoint base sin palabra de activación: el prompt debe empezar por operador, fabricante y modelo, seguido de una descripción fotográfica al estilo de un aficionado al ferrocarril.

Es relevante para quienes necesiten generar imágenes fotorrealistas de material ferroviario norteamericano con fines documentales, editoriales o de ilustración, un nicho que los modelos generalistas cubren mal. El adaptador pesa 0,6 GB y se distribuye en formato safetensors, por lo que requiere el pipeline de MOSS-Image para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un modelo de difusion (OpenMOSS/MOSS-Image-Base) |
| Parametros totales | no disponible (adaptador LoRA de rank 64 / alpha 16; el modelo base no reporta cifra en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el autor entreno en INT8 con block swap) |
| Idiomas soportados | no disponible (los prompts del ejemplo estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`na_passenger_trains_moss_v1.0.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA aplicado sobre MOSS-Image-Base, un modelo de difusion para generacion de imagenes. El adaptador tiene rank 64 y alpha 16. El entrenamiento se realizo con kohya sd-scripts en su variante para MOSS-Image, sobre una GPU RTX 4070 Super con cuantizacion INT8 y block swap, optimizador AdamW8bit, batch 1 y buckets de 1 megapixel. Se uso una tasa de aprendizaje de 1,5e-4 con 200 pasos de warmup y decaimiento coseno hasta el 10 %, durante 6.500 pasos.

El dataset lo componen 2.667 fotografias de Wikimedia Commons en 40 clases. Cada imagen dispone de tres captions (larga, media y corta), todas encabezadas por una linea con operador y modelo. Las clases con pocos ejemplos se repitieron hasta cuatro veces para compensar el desbalance. El checkpoint final corresponde al paso 6.500.

## Capacidades

- Generacion de imagenes fotorrealistas de trenes de pasajeros norteamericanos en 40 clases predefinidas.
- Reproduccion de libreas y esquemas de color de Amtrak (Phase III y otras), VIA Rail, Coaster, Metrolink y operadores de cercanias.
- Generacion de composiciones ferroviarias completas: locomotora mas coches (Amfleet, Horizon, Viewliner, Superliner, bilevels, gallery cars).
- Representacion de escenarios: costa, vias de doble carril, paisajes urbanos y rurales, segun la descripcion del prompt.
- Soporte de numeros de carretera cortos de forma fiable; rotulacion larga y escudos heraldicos se degradan.
- Control de encuadre mediante prompt: angulo de tres cuartos frontal, vista lateral, plano general.
- No dispone de palabra de activacion: el disparador es la propia descripcion de operador, fabricante y modelo.
- No cubre trenes de mercancias (existe un LoRA aparte), vapor ni material no norteamericano.

## Casos de uso

- Ilustracion editorial y documental: generar imagenes de material rodante concreto (por ejemplo, un ACS-64 de Amtrak en la linea del Northeast Corridor) para articulos, libros o revistas especializadas, con control de librea y numero de unidad.
- Creacion de contenido para aficionados al ferrocarril: portadas, posters y fichas de material rodante con composiciones realistas y encuadres fotograficos.
- Prototipado visual de escenarios ferroviarios: generar referencias de ambiente (costa, estaciones, vias) para equipos de diseno o produccion audiovisual.
- Material educativo: ilustrar explicaciones sobre tipos de locomotora, coches y trenes de alta velocidad (Acela, Avelia Liberty, Talgo) con imagenes reconocibles.
- Contenido para simuladores y juegos: generar texturas o referencias visuales de libreas y modelos para assets de baja fidelidad.
- Ilustracion de articulos divulgativos sobre historia del ferrocarril de pasajeros en America del Norte, siempre que se eviten las clases con pocos ejemplos y la rotulacion larga.
- Generacion de variaciones controladas de una misma escena cambiando librea, numero o entorno mediante el prompt, util para comparativas visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,6 GB; el requisito real lo marca el modelo base MOSS-Image-Base, cuyas necesidades de VRAM no se detallan en la informacion disponible.
- El autor entreno el LoRA en una RTX 4070 Super (12 GB) con INT8 y block swap, lo que da una referencia del orden de magnitud para inferencia en GPU de consumo.
- Para inferencia se recomienda una GPU con al menos 12-16 GB de VRAM si se usa el pipeline de MOSS-Image en precision reducida; no hay datos oficiales de VRAM para el modelo base.
- Despliegue: el adaptador se carga junto al base con el pipeline de MOSS-Image; no se mencionan integraciones con vLLM, llama.cpp ni Ollama (no aplicables a un modelo de difusion de este tipo).
- Parametros de generacion recomendados por el autor: fuerza 1.0, CFG 3, 30-50 pasos, sampler euler, scheduler sgm_uniform, shift 5, resolucion de aproximadamente 1 MP en formato apaisado (el ejemplo usa 1216x832).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| colinurbs/moss-passenger-trains-lora | LoRA sobre MOSS-Image-Base | no disponible (adaptador rank 64) | no aplica | no disponible | Hugging Face y Civitai |
| colinurbs/moss-trains-lora | LoRA sobre MOSS-Image-Base | no disponible | no aplica | no disponible | Hugging Face |
| MOSS-Image-Base (OpenMOSS) | Modelo de difusion base | no disponible en la informacion | no aplica | no disponible | Hugging Face |
| Alternativas genericas de difusion (SDXL, Flux) | Modelos de difusion generalistas | no aplica a esta ficha | no aplica | no disponible | no disponible |

El unico comparable directo documentado es el LoRA de mercancias del mismo autor, que cubre el material que este adaptador deja fuera. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con otros adaptadores ferroviarios.

## Limitaciones y advertencias

- Acela Express y Avelia Liberty pueden mezclarse entre si en la generacion.
- Las clases con pocos ejemplos (Coaster F40PH, F59PHI, SC-44, MLW LRC) aciertan la librea mas a menudo que los detalles exactos de la carroceria.
- Los coches "cabbage" de Amtrak y las F40PH reales pueden confundirse.
- La rotulacion larga y los escudos heraldicos se generan a veces corruptos; solo los numeros de carretera cortos son fiables.
- Fuera de alcance: trenes de mercancias, locomotoras de vapor y material no norteamericano.
- Sesgos: el dataset proviene exclusivamente de Wikimedia Commons, lo que puede sobrerrepresentar ciertos operadores, epocas y condiciones de luz.
- Riesgo de alucinacion visual en detalles tecnicos (ventanas, bogies, pantografos) cuando el modelo no ha visto suficientes ejemplos de la clase.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; las imagenes de entrenamiento son de licencias libres, pero eso no determina la licencia del peso derivado.
- El modelo base es necesario para la inferencia; el adaptador por si solo no genera imagenes.

## Enlaces

- Hugging Face: https://huggingface.co/colinurbs/moss-passenger-trains-lora
- Modelo base: https://huggingface.co/OpenMOSS/MOSS-Image-Base
- LoRA de trenes de mercancias: https://huggingface.co/colinurbs/moss-trains-lora
- Civitai: https://civitai.com/models/3030067
