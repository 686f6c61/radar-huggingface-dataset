# digitalpresso/floorplan-dfine-spa

## Resumen

floorplan-dfine-spa es un detector de objetos especializado en planos de arquitectura, concretamente en la capa de espacios y habitaciones (SPA, *spaces / rooms*). Lo desarrolla digitalpresso y forma parte de una familia de tres modelos hermanos que comparten una taxonomía de clases común, de modo que sus salidas pueden fusionarse en un único análisis de página. Los otros dos modelos cubren las capas de objetos (mobiliario y elementos) y de estructura (muros, puertas, ventanas).

El modelo se basa en la arquitectura D-FINE-M (con backbone HGNetv2-B2), tiene 19,9 millones de parámetros, emplea 128 queries en el decodificador y se distribuye en safetensors con un tamaño de repositorio de 0,1 GB. Se inicializa desde el checkpoint oficial D-FINE-M entrenado solo con COCO, sin linaje de Objects365, y se entrena sobre planos de apartamentos coreanos (AI-Hub 71465), apartamentos suizos (Swiss Dwellings v3.0.0) y edificios sintéticos.

Su relevancia práctica radica en que resuelve una tarea de extracción de información muy concreta sobre documentos técnicos de gran formato: localizar y clasificar habitaciones (salón, dormitorio, cocina, baño, balcón, pasillo, escaleras, etc.) en planos de alta resolución. El protocolo de inferencia por teselas de 1920 px con 25 % de solapamiento permite procesar dibujos de gran tamaño donde los símbolos son pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE-M (backbone HGNetv2-B2, detector transformer con 128 queries) |
| Parametros totales | 19.932.061 (19,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de deteccion de objetos, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; entrenado con planos coreanos y suizos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carga con `strict=True` en el codigo upstream D-FINE) |

## Arquitectura y entrenamiento

D-FINE-M es un detector de objetos basado en transformer con un backbone convolucional HGNetv2-B2 y un decodificador con 128 queries. El modelo se inicializa desde el checkpoint oficial D-FINE-M entrenado únicamente con COCO (sin linaje de Objects365) y se afina para la tarea de detección de espacios en planos. La salida es una lista de detecciones con etiqueta, identificador de categoría, caja delimitadora y puntuación de confianza.

El entrenamiento combina tres fuentes: el conjunto AI-Hub 71465 de Corea (no redistribuido), Swiss Dwellings v3.0.0 (Zenodo 10.5281/zenodo.7788422, CC BY 4.0) y edificios sintéticos (SYNBUILD). Los pesos publicados corresponden a la semilla de entrenamiento 0 (g1scan s0); el autor indica que la dispersión entre semillas se añadirá cuando finalicen las otras dos semillas. La taxonomía de clases es compartida con los modelos hermanos, con identificadores que corresponden al índice de taxonomía más uno, de ahí que no empiecen en 1.

## Capacidades

- Detección de objetos de tipo habitación y espacio en planos de arquitectura: 18 clases (living, bedroom, kitchen, bathroom, balcony, entry, closet, corridor, dining, utility, storage, multipurpose, outdoor_unit, stairs, elevator, elevator_hall, outdoor, room_generic).
- Procesamiento de planos de alta resolución mediante teselado de 1920 px con 25 % de solapamiento y NMS por clase entre teselas.
- Salida estructurada en JSON con etiqueta, categoría, caja delimitadora en píxeles de página y puntuación.
- Fusión con los modelos hermanos (obj y str) gracias a la taxonomía compartida para obtener un análisis completo de la página.
- Opción de descartar fragmentos truncados en los bordes interiores de las teselas (`--drop-truncated`).
- Ejecución en CPU o GPU (`--device cpu` o `cuda:0`); una página de 2048 px tarda unos segundos en CPU.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un detector de objetos visual.

## Casos de uso

- Digitalización de inventarios inmobiliarios: procesar lotes de planos de apartamentos para extraer automáticamente el número y tipo de habitaciones de cada vivienda, alimentando bases de datos de patrimonio o portales inmobiliarios. El teselado de 1920 px permite manejar planos de gran formato sin perder símbolos pequeños.
- Automatización de tasaciones y seguros: a partir de un plano en PDF o imagen, obtener la lista de estancias para estimar superficies y riesgos, combinando la salida del modelo con la capa de estructura (muros) del modelo hermano.
- Verificación de cumplimiento normativo: comprobar que una vivienda dispone de las estancias mínimas exigidas (dormitorio, baño, cocina) detectando su presencia y ubicación en el plano.
- Generación de fichas técnicas de vivienda: enriquecer anuncios inmobiliarios con metadatos estructurados de habitaciones extraídos directamente del plano, reduciendo la introducción manual de datos.
- Análisis de planos de edificios suizos y coreanos para estudios de investigación urbana o de vivienda, aprovechando el entrenamiento específico en ambos dominios y la validación por sitio (sin fuga de edificios entre train y validación).
- Integración en pipelines de gestión documental (BIM, CAD): preprocesar planos rasterizados antes de su conversión a modelos digitales, usando la salida JSON como paso intermedio de etiquetado de espacios.
- Control de calidad en la producción de planos: detectar estancias sin etiquetar o mal clasificadas comparando la salida del modelo con la anotación del delineante.

## Benchmarks y rendimiento

| Benchmark | Metrica | Este release (semilla 0) |
|---|---|---|
| Test retenido coreano (1.204 planos, derivado de AI-Hub 71465) | mAP@0.5 | 0,958 |
| Swiss Dwellings val | mAP@0.5 (macro sobre clases) | 0,504 |
| Swiss Dwellings val | mAP@0.5:0.95 | 0,471 |
| Swiss Dwellings val | mAP@0.5 ponderado por ground truth | 0,850 |

AP@0.5 por clase en Swiss Dwellings val (semilla 0): living 0,753 (2.864 cajas GT), bedroom 0,386 (2.187), kitchen 0,948 (4.356), bathroom 0,987 (6.413), balcony 0,969 (4.581), entry 0,012 (16), closet 0,000 (2), corridor 0,920 (5.196), dining 0,042 (145), storage 0,652 (1.087), multipurpose 0,413 (23), stairs 0,594 (786), elevator 0,000 (11), outdoor 0,074 (83), room_generic 0,813 (8.320).

AP@0.5 por clase en el test retenido coreano: other room (room_generic) 0,968, bedroom 0,961, bathroom 0,981, balcony 0,948, entry 0,980, kitchen 0,955, living 0,896, closet 0,983, outdoor_unit 0,988, stairs 0,958, elevator_hall 0,914, elevator 0,974, multipurpose 0,949.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamaño del modelo (19,9 M de parámetros, 80 MB en safetensors); cabe holgadamente en cualquier GPU consumer, incluso en tarjetas con 4 GB o menos.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 4090, RTX 3090, A100, H100) funciona; el modelo no requiere memoria significativa.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: el código de inferencia oficial usa el código fuente upstream de D-FINE fijado al commit `956d170`, con dependencias en `inference/requirements.txt`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos de este tipo).
- Latencia y throughput: una página de 2048 px tarda unos segundos en CPU según el autor; no se proporcionan cifras de latencia en GPU.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros detectores de espacios en planos de arquitectura. Los modelos hermanos del mismo autor comparten taxonomía pero cubren capas distintas (objetos y estructura), por lo que no son alternativas directas sino complementos:

| Modelo | Capa | Parametros | Licencia | Funcion |
|---|---|---|---|---|
| floorplan-dfine-spa (este) | Espacios / habitaciones | 19,9 M | Apache-2.0 | Deteccion de estancias |
| floorplan-dfine-obj | Objetos / mobiliario | no disponible | Apache-2.0 | Deteccion de elementos |
| floorplan-dfine-str | Estructura | no disponible | Apache-2.0 | Deteccion de muros, puertas, ventanas |

## Limitaciones y advertencias

- El macro mAP@0.5 en Swiss Dwellings es bajo (0,504) principalmente por ambigüedad de etiquetas y clases raras: sin mobiliario, bedroom, living y room_generic son a menudo indistinguibles, y la confusión bedroom <-> room_generic es el error dominante.
- Varias clases están casi ausentes en la validación suiza (closet 2 cajas, elevator 11, entry 16, multipurpose 23) y puntúan entre 0,00 y 0,41, lo que arrastra la media macro; el autor recomienda reportar tanto la media macro como la ponderada por ground truth (0,850).
- Las etiquetas de escaleras en Swiss Dwellings están fragmentadas (escaleras de caracol como muchas cajas de peldaño, escaleras rectas parcialmente etiquetadas), lo que limita el AP de stairs a unos 0,59.
- Las estancias de almacenamiento (storage, AP 0,65) suelen confundirse con room_generic.
- Convenciones de dibujo: el modelo se entrenó con planos de apartamentos coreanos, suizos y edificios sintéticos; planos con convenciones muy distintas (estilos de sombreado, esquemas de color CAD, bocetos a mano) quedan fuera de distribución.
- Riesgo de alucinación: como todo detector, puede generar cajas con confianza moderada en regiones ambiguas; el umbral por defecto es 0,3 con NMS IoU 0,6, ajustable en `config.json`.
- Licencia Apache-2.0: permite uso comercial, pero el código upstream D-FINE debe usarse sin modificar y fijado al commit `956d170` para cargar los pesos con `strict=True`.
- Los datos de AI-Hub 71465 no se redistribuyen; solo se publican los pesos entrenados.
- Los resultados publicados corresponden a una sola semilla (seed 0); la dispersión entre semillas aún no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/digitalpresso/floorplan-dfine-spa
- Modelo hermano (objetos): https://huggingface.co/digitalpresso/floorplan-dfine-obj
- Modelo hermano (estructura): https://huggingface.co/digitalpresso/floorplan-dfine-str
- Codigo fuente upstream D-FINE: https://github.com/Peterande/D-FINE (commit `956d170`)
- Dataset Swiss Dwellings v3.0.0: https://doi.org/10.5281/zenodo.7788422 (CC BY 4.0)
