# happyinhappy/dinov3-car-id-dimensions

## Resumen

El modelo `happyinhappy/dinov3-car-id-dimensions` es un adaptador LoRA sobre el backbone de visión DINOv3 ViT-L/16, desarrollado por el autor `happyinhappy` para un pipeline automatizado de concesionario de coches. Su función es doble: identificar el vehículo (marca, modelo, tipo de carrocería, clase) y regresar sus dimensiones reales en milímetros (largo, ancho, alto, batalla y distancia al suelo) a partir de una única fotografía. Está diseñado para resolver el problema de escalar y encuadrar correctamente un coche en escenas generadas, donde un error de dimensiones produce imágenes irreales.

El modelo combina un backbone congelado (DINOv3 ViT-L/16, el snapshot público de `camenduru/dinov3-vitl16-pretrain-lvd1689m`) con adaptadores LoRA y 11 cabezas de clasificación más una cabeza de regresión. Los checkpoints publicados son "slim" (solo LoRA y cabezas, aproximadamente 85 MB cada uno) y no incluyen el backbone, que debe descargarse por separado. La licencia es `card-only-weights-not-released`, lo que significa que los pesos no están disponibles públicamente; solo se publica la tarjeta del modelo con fines de inspección.

La relevancia actual radica en que demuestra un caso práctico de uso de DINOv3, un modelo de visión de Meta que mejora a DINOv2 en escala y rendimiento, aplicado a una tarea industrial concreta con datos de listados reales de vehículos. Aunque los pesos no se distribuyen, la arquitectura y los resultados de evaluación se documentan de forma transparente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 congelado + adaptadores LoRA + 11 cabezas de clasificacion + 1 cabeza de regresion de dimensiones |
| Parametros totales | No disponible (el checkpoint publicado es de ~85 MB, pero no se especifica el total del modelo completo) |
| Parametros activos | No disponible (es un adaptador LoRA, pero no se indica el numero de parametros entrenables) |
| Longitud de contexto | No aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | card-only-weights-not-released (los pesos no se publican) |
| Formato de pesos | No disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

La arquitectura se basa en un backbone DINOv3 ViT-L/16 congelado, sobre el que se insertan adaptadores LoRA. Sobre este backbone se montan 11 cabezas de clasificacion que producen etiquetas como marca, modelo, tipo de carroceria, clase de vehiculo y combinaciones de estas (por ejemplo, `make_model_body_type`). Ademas, una cabeza de regresion independiente predice cinco dimensiones en milimetros: largo, ancho, alto, batalla y distancia al suelo. Los adaptadores LoRA se fusionan en los pesos del backbone en tiempo de carga, por lo que no se requiere la libreria `peft` para la inferencia.

El entrenamiento se realizo con mas de 7 millones de fotografias de vehiculos obtenidas de listados publicos en linea, de-duplicadas y etiquetadas a partir de los campos estructurados de los propios listados, contrastados con una tabla de referencia de dimensiones. El conjunto de evaluacion interno se denomina `cars170k`. Las imagenes de entrenamiento incluyen tanto planos generales del vehiculo como recortes de detalle (faros, parrilla, insignias), lo que permite distinguir entre facelifts y pre-facelifts del mismo modelo. No se menciona el uso de RLHF ni DPO, ya que es una tarea de vision supervisada.

Una innovacion destacable es la doble via para obtener dimensiones: `regressed_mm` (regresion directa desde la imagen) y `resolved_mm` (consulta en una tabla de referencia de 8.632 carrocerias conocidas, con una cadena de respaldo que va desde el identificador de fila hasta el valor global). El campo `resolved_level` indica que nivel de la cadena respondio, lo que permite al usuario saber si el valor es exacto o una aproximacion.

## Capacidades

- Clasificacion de vehiculos: identifica marca, modelo, tipo de carroceria y clase de vehiculo, ademas de combinaciones de estas etiquetas (por ejemplo, `make_model_body_type`).
- Regresion de dimensiones: predice largo, ancho, alto, batalla y distancia al suelo en milimetros, con dos modos de salida (`regressed_mm` y `resolved_mm`).
- Salida estructurada: devuelve un JSON con `make`, `model`, `body_type`, `dims_mm_json`, `confidence`, `results_json` con top-k por cabeza, `identity_text` (por ejemplo, `"audi q3, suv"`) y `prompt_text` (una frase lista para alimentar un modelo de difusion).
- Soporte de top-k: proporciona las k mejores predicciones para cada cabeza de clasificacion.
- Sin soporte de tool calling ni agentes: es un modelo de vision puro, no un LLM.
- Capacidades multilingues: no aplica, al ser un modelo de vision.
- Sin modo de pensamiento ni vision adicional: solo procesa imagenes.

## Casos de uso

- Pipeline de generacion de escenas para concesionarios: el modelo identifica el vehiculo y sus dimensiones, y el `prompt_text` resultante se alimenta directamente a un modelo de difusion para generar una escena realista donde el coche aparece correctamente escalado y encuadrado. Es adecuado porque la regresion de dimensiones evita que el coche "flote" o parezca un juguete.
- Catalogacion automatica de inventario: al recibir una foto de un vehiculo, el modelo devuelve marca, modelo, tipo de carroceria y dimensiones, lo que permite clasificar y organizar automaticamente un parque de vehiculos en una base de datos. Su salida JSON facilita la integracion con sistemas de gestion.
- Verificacion de anuncios de venta: comparando las dimensiones regresadas con las del catalogo, se puede detectar inconsistencias en anuncios de segunda mano (por ejemplo, un SUV declarado como compacto). El modelo aporta una medida objetiva a partir de la imagen.
- Preparacion de imagenes para publicidad: antes de colocar un vehiculo en un banner o folleto, el modelo proporciona las dimensiones exactas para escalar correctamente el recorte. La doble via (`regressed_mm` y `resolved_mm`) permite elegir entre valores estables o exactos segun la necesidad.
- Analisis de flota para logistica: dado un conjunto de fotos de vehiculos, el modelo puede estimar las dimensiones de cada uno, lo que ayuda a planificar el transporte o el almacenamiento. Su robustez ante condiciones adversas (nieve, lluvia, mala iluminacion) lo hace util en entornos reales.
- Investigacion en vision por computador: como ejemplo de adaptacion LoRA sobre DINOv3, el modelo sirve como referencia para estudiar tecnicas de fine-tuning eficiente en tareas de clasificacion y regresion simultaneas. Aunque los pesos no estan publicados, la arquitectura y los resultados documentados son utiles para la comunidad.

## Benchmarks y rendimiento

Los resultados se reportan sobre el conjunto de evaluacion interno `cars170k` para el checkpoint canonico:

| Metrica | Valor |
|---|---|
| Top-1 | 0.614 |
| Top-3 | 0.857 |

Estos valores corresponden a la identificacion completa (combinacion de marca, modelo y carroceria) sobre un espacio de etiquetas de cola muy larga, con miles de combinaciones y muchos vehiculos casi identicos de la misma plataforma. Las cabezas mas gruesas (tipo de carroceria, clase de vehiculo) son significativamente mas faciles, y la regresion de dimensiones se evalua por separado en milimetros, no como precision. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos especificos de hardware en la informacion disponible.
- El checkpoint publicado (LoRA + cabezas) ocupa aproximadamente 85 MB, pero el backbone DINOv3 ViT-L/16 debe descargarse por separado y es un modelo de vision de tamano medio (del orden de 300 millones de parametros, aunque no se confirma el numero exacto).
- Para inferencia en FP16, se estima que se necesita una GPU con al menos 8 GB de VRAM, como una RTX 3060 o superior, aunque no hay datos oficiales.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, etc.), pero al ser un modelo de Transformers, puede ejecutarse con la libreria `transformers` y `torch`.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se han encontrado referencias a otros modelos de clasificacion de vehiculos con regresion de dimensiones en la busqueda web. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Cola larga: los trims raros, importaciones grises y vehiculos muy modificados pueden caer en la carroceria comun mas cercana. Se recomienda revisar `confidence` y `resolved_level`.
- Dependencia del recorte: el modelo se entreno con planos generales y recortes de detalle; si el coche ocupa una fraccion muy pequena de una imagen panoramica, el rendimiento degrada notablemente.
- Dimensiones de catalogo, no del objeto: el modelo reporta las medidas normales de esa carroceria, no las del vehiculo concreto. Una suspension elevada, una baca o un kit aftermarket no modifican los numeros.
- Sesgo geografico: las fuentes de datos se extrajeron de listados publicos de ciertos mercados; los modelos vendidos solo en otras regiones estan infrarrepresentados.
- No es un tasador: el modelo no proporciona informacion sobre estado, kilometraje, danos o valor del vehiculo, y no debe utilizarse para fijar precios.
- Licencia restrictiva: los pesos no estan publicados (`card-only-weights-not-released`); solo se distribuye la tarjeta del modelo. Cualquier uso comercial o investigacion requiere contacto con el autor.
- Riesgo de alucinacion: aunque no es un modelo de lenguaje, la regresion de dimensiones puede producir valores inexactos en casos extremos; la doble via de `resolved_mm` mitiga parcialmente este riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/happyinhappy/dinov3-car-id-dimensions
- Repositorio de DINOv3 (Meta): https://github.com/facebookresearch/dinov3
- Documentacion de DINOv3 en Transformers: https://huggingface.co/docs/transformers/model_doc/dinov3
- Pagina de investigacion de DINOv3: https://ai.meta.com/research/dinov3/
- Repositorio alternativo de DINOv3: https://github.com/3Dsamples/dinov3-ai
