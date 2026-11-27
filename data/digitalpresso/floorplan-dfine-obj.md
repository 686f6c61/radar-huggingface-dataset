# digitalpresso/floorplan-dfine-obj

## Resumen

floorplan-dfine-obj es un detector de objetos especializado en elementos de fontanería y cocina (inodoro, lavabo, bañera, fregadero y fogón) dentro de planos arquitectónicos. Lo desarrolla digitalpresso como parte de una familia de tres modelos hermanos que comparten una taxonomía de clases común y cuyas salidas pueden fusionarse en un único parseo de página. Emplea la arquitectura D-FINE-M con backbone HGNetv2-B2, cuenta con 19,9 millones de parámetros y se distribuye en safetensors con un tamaño de repositorio de 0,1 GB.

El modelo resuelve un problema muy concreto de la digitalización de documentación arquitectónica: la detección automática de sanitarios y electrodomésticos en planos de vivienda, un paso previo necesario para tareas de vectorización, inventariado o análisis de edificios. Su relevancia radica en que se entrena sobre datos reales de apartamentos coreanos (AI-Hub 71465) y suizos (Swiss Dwellings v3.0.0), con un protocolo de inferencia por teselas de 1920 px con solapamiento del 25 % que permite procesar dibujos de gran formato sin perder símbolos pequeños.

La licencia es Apache-2.0, lo que facilita su uso comercial, aunque los pesos se cargan únicamente contra el código fuente upstream de D-FINE fijado al commit `956d170`. No es un modelo de lenguaje: es un detector puro, sin capacidades de OCR, lectura de cotas ni generación de polígonos de habitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE-M con backbone HGNetv2-B2 (transformer detector con 128 queries) |
| Parametros totales | 19.939.766 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada por teselas de 1920 x 1920 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de visión; sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (80 MB) |

## Arquitectura y entrenamiento

D-FINE-M es un detector transformer de la familia D-FINE, que refina las cajas predichas mediante un mecanismo de distribución de probabilidad (Fine-grained Distribution Refinement) sobre 128 queries. El backbone es HGNetv2-B2, una CNN ligera. El modelo se inicializa desde el checkpoint oficial de D-FINE-M entrenado solo con COCO, sin linaje Objects365, y se ajusta específicamente para la capa de fixtures de planos.

El entrenamiento usa 134.053 teselas procedentes de AI-Hub 건축 도면 데이터 (71465, Corea) y 18.070 teselas rasterizadas de Swiss Dwellings v3.0.0 (Zenodo 10.5281/zenodo.7788422, CC BY 4.0). Se realizan 6 épocas con AdamW, batch 12, aumentación fuerte durante las dos primeras épocas y una aumentación de degradación de escaneo o reimpresión aplicada a la mitad de las teselas (pérdida de resolución, desenfoque, cambios de nivel de papel y tinta, ruido, artefactos JPEG). Las teselas son recortes de 1920 px; en Swiss se usan mosaicos de 2048 px de los planos. La pérdida de las clases `sink` y `stove` se enmascara en las teselas suizas porque ese render no las contiene.

## Capacidades

- Detección de objetos en planos arquitectónicos para cinco clases: `toilet` (id 23), `washbasin` (id 24), `bathtub` (id 25), `sink` (id 26) y `stove` (id 27).
- Salida en formato JSON con `label`, `category_id`, `bbox` en píxeles de página y `score`.
- Inferencia por teselas de 1920 px con solapamiento del 25 % y NMS por clase entre teselas, reproduciendo el protocolo de entrenamiento.
- Umbral de score por defecto de 0,3 y NMS con IoU 0,6, configurables en `config.json`.
- Opción `--drop-truncated` para eliminar fragmentos cortados en los bordes interiores de tesela.
- Selección de dispositivo mediante `--device cpu` o `--device cuda:0`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es exclusivamente un detector visual.

## Casos de uso

- Digitalización de inventarios de vivienda: procesar lotes de planos en PDF o imagen para extraer automáticamente la posición y el recuento de sanitarios y electrodomésticos, útil en tasaciones, seguros o gestión de patrimonio inmobiliario.
- Vectorización de planos CAD rasterizados: usar las detecciones como capa semántica de fixtures que se superpone a la geometría de muros y puertas obtenida por otros medios, facilitando la reconstrucción de un modelo BIM preliminar.
- Análisis de accesibilidad y habitabilidad: localizar baños y cocinas para verificar que cada unidad dispone de los elementos mínimos exigidos por normativa, con revisión humana posterior sobre las detecciones de baja confianza.
- Enriquecimiento de portales inmobiliarios: generar metadatos estructurados (número de baños, tipo de cocina) a partir de los planos publicados, reduciendo la introducción manual de datos.
- Control de calidad de documentación técnica: comparar las detecciones contra el inventario declarado en memoria de proyecto para detectar planos desactualizados o incoherentes.
- Investigación en análisis de planos: emplear el modelo como baseline o como componente de un pipeline mayor junto a los modelos hermanos `floorplan-dfine-str` y `floorplan-dfine-spa`, compartiendo la taxonomía de clases para fusionar salidas en un único parseo de página.
- Procesamiento por lotes en CPU: al tardar unos segundos por página de 2048 px en CPU, es viable integrarlo en colas de trabajo sin GPU dedicada para volúmenes moderados.

## Benchmarks y rendimiento

| Benchmark | Métrica | Este release (seed 0) |
|---|---|---|
| Test retenido coreano (1.010 planos, derivado de AI-Hub 71465) | mAP@0.5 | 0,976 |
| Swiss Dwellings val | mAP@0.5 | 0,976 |
| Swiss Dwellings val | mAP@0.5:0.95 | 0,969 |

AP@0.5 por clase, seed 0, Swiss Dwellings val:

| Clase | AP@0.5 | Cajas GT |
|---|---|---|
| toilet | 0,977 | 5.682 |
| washbasin | 0,976 | 5.977 |
| bathtub | 0,973 | 4.034 |

AP@0.5 por clase, seed 0, test retenido coreano:

| Clase | AP@0.5 |
|---|---|
| toilet | 0,971 |
| washbasin | 0,981 |
| sink | 0,963 |
| stove | 0,986 |
| bathtub | 0,979 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan 80 MB en safetensors y el modelo tiene 19,9 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU de gama baja procesan las teselas sin problema.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos unos pocos GB de VRAM libres; también funciona en CPU (unos segundos por página de 2048 px según el autor).
- Opciones de despliegue: el autor proporciona `inference/infer.py`, que requiere el código fuente upstream de D-FINE fijado al commit `956d170` y carga los pesos con `strict=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican cifras de throughput; solo se indica que una página de 2048 px tarda unos segundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, los dos modelos hermanos del mismo autor comparten taxonomía y arquitectura base:

| Modelo | Capa | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| floorplan-dfine-obj | Fixtures (sanitarios y cocina) | 19,9 M | Apache-2.0 | Hugging Face |
| floorplan-dfine-str | Estructura (muros, puertas, ventanas) | no disponible | Apache-2.0 | Hugging Face |
| floorplan-dfine-spa | Espacios (habitaciones) | no disponible | Apache-2.0 | Hugging Face |

No se han identificado en la información disponible otros detectores de fixtures en planos con los que comparar parámetros, contexto o rendimiento de forma rigurosa.

## Limitaciones y advertencias

- El render suizo contiene solo toilet, washbasin y bathtub; `sink` y `stove` se aprenden únicamente de AI-Hub y no se evalúan sobre Swiss.
- Los sanitarios dibujados con símbolos poco habituales (por ejemplo, suspendidos o en esquina con convenciones distintas) pueden no detectarse.
- Convenciones de dibujo: el modelo se entrena con planos de apartamentos coreanos, suizos y edificios sintéticos; planos con estilos de rayado, esquemas de color CAD o bocetos a mano muy distintos quedan fuera de distribución.
- Escala: en los datos de entrenamiento una puerta mide aproximadamente 60-70 px; las imágenes de mucha menor resolución deben reescalarse a esa escala antes de la inferencia.
- Calidad de escaneo: aunque se entrena con aumentación de degradación de escaneo en la mitad de las teselas, los escaneos muy degradados, especialmente los reducidos de resolución, aumentan las cajas perdidas y espurias.
- Solo detección: no genera polígonos de habitaciones, no hace OCR ni lectura de cotas.
- Los pesos requieren el código upstream de D-FINE en el commit exacto `956d170`; versiones distintas pueden no cargar con `strict=True`.
- No se redistribuye ningún dato de AI-Hub en el repositorio; solo se publican los pesos entrenados.
- Riesgo de alucinación de detecciones: como todo detector, puede producir cajas espurias con score bajo; se recomienda revisión humana o umbrales conservadores en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/digitalpresso/floorplan-dfine-obj
- Modelo hermano de estructura: https://huggingface.co/digitalpresso/floorplan-dfine-str
- Modelo hermano de espacios: https://huggingface.co/digitalpresso/floorplan-dfine-spa
- Código fuente upstream de D-FINE: https://github.com/Peterande/D-FINE
- Swiss Dwellings v3.0.0 (Zenodo): https://doi.org/10.5281/zenodo.7788422
- AI-Hub (Corea): https://www.aihub.or.kr
