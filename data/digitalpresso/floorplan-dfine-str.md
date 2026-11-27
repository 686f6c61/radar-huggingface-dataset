# digitalpresso/floorplan-dfine-str

## Resumen

floorplan-dfine-str es un detector de objetos especializado en la capa estructural de planos arquitectonicos (paredes, puertas, ventanas y barandillas). Lo desarrolla digitalpresso y se publica bajo licencia Apache-2.0. Forma parte de una familia de tres modelos hermanos que comparten una taxonomia comun de clases: este cubre la capa STR (structure), mientras que floorplan-dfine-obj y floorplan-dfine-spa cubren las capas de objetos y espacios. Sus salidas pueden fusionarse en un unico parseo de pagina.

Tecnicamente es un D-FINE-M con backbone HGNetv2-B2, 19,9 millones de parametros y 256 queries, distribuido en safetensors con un tamano de repositorio de 0,1 GB. Se inicializa desde el checkpoint oficial D-FINE-M entrenado solo con COCO (sin linaje Objects365) y se ajusta para deteccion de elementos estructurales en dibujos de planta. El protocolo de inferencia es especifico: teselas de 1920 x 1920 px con 25 por ciento de solape, deteccion por tesela y NMS por clase entre teselas.

Su relevancia practica esta en que digitaliza la estructura de planos reales (apartamentos coreanos, suizos y edificios sinteticos) con metricas de mAP@0.5 que van de 0,889 en Swiss Dwellings a 0,993 en Floorplan Synthetic 2500. Es un modelo pequeno, desplegable en CPU en unos segundos por pagina de 2048 px, lo que lo hace util para pipelines de analisis documental arquitectonico a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE-M con backbone HGNetv2-B2, 256 queries |
| Parametros totales | 19.904.323 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de deteccion de objetos, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto; entrada grafica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pytorch), ~80 MB |
| Entrada | teselas de 1920 x 1920 px con 25 % de solape |
| Clases detectadas | wall (1), door (2), window (3), railing (4) |
| Umbral de score por defecto | 0,3 |
| NMS IoU por defecto | 0,6 |
| Salida | JSON con label, category_id, bbox [x, y, w, h], score en pixeles de pagina |

## Arquitectura y entrenamiento

D-FINE es un detector basado en transformers con decodificacion DETR-like refinada; en esta variante se usa el tamano M con backbone convolucional HGNetv2-B2 y 256 queries. El modelo se inicializa desde el checkpoint oficial D-FINE-M entrenado exclusivamente con COCO, sin linaje Objects365, y se ajusta para el dominio de planos. La inferencia debe reproducir el protocolo de entrenamiento (teselado 1920 px con 25 por ciento de solape, deteccion por tesela y NMS por clase entre teselas), lo que es critico porque los simbolos son pequenos respecto al tamano de la pagina.

Los datos de entrenamiento combinan cuatro fuentes: AI-Hub 71465 (Corea, no redistribuido), Swiss Dwellings v3.0.0 (Zenodo, CC BY 4.0), SYNBUILD-3D (Stanford Digital Repository, arXiv:2508.21169, CC BY 4.0) y Floorplan Synthetic 2500 (figshare, CC BY 4.0). Se aplica una aumentacion de degradacion de escaneo o reimpresion sobre la mitad de las teselas de entrenamiento, con perdida de resolucion, desenfoque, cambios de nivel de papel y tinta, ruido y artefactos JPEG. Las particiones de validacion se hacen por emplazamiento (Swiss) o por edificio (SYNBUILD) para evitar fuga de informacion. Los pesos publicados corresponden a la semilla 0 de entrenamiento.

## Capacidades

- Deteccion de objetos estructurales en planos: paredes, puertas, ventanas y barandillas.
- Deteccion por tesela con solape y fusion mediante NMS por clase, adecuada para paginas de alta resolucion.
- Salida estructurada en JSON con coordenadas en pixeles de pagina, lista para postproceso.
- Compatibilidad con la taxonomia compartida de la familia (id2label en config.json), lo que permite fusionar resultados con los modelos obj y spa.
- Opcion `--drop-truncated` para eliminar fragmentos cortados en bordes interiores de tesela.
- Ejecucion en CPU o CUDA (`--device cpu` o `cuda:0`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.
- No realiza OCR, lectura de cotas, poligonos de habitaciones ni extraccion de texto.

## Casos de uso

- Digitalizacion de archivos de planos: procesar lotes de PDFs o imagenes rasterizadas de plantas de vivienda para extraer cajas de paredes, puertas y ventanas, con el teselado a 1920 px que preserva la deteccion de simbolos pequenos.
- Generacion de modelos BIM o CAD asistida: usar las detecciones como paso previo a la vectorizacion de muros y huecos, aprovechando la convencion de pared como segmento entre aberturas.
- Analisis de inventario inmobiliario: contar puertas, ventanas y barandillas por planta para estimaciones de reforma o catalogacion, con umbrales de score ajustables.
- Control de calidad de planos sinteticos: validar planos generados por herramientas como SYNBUILD-3D comparando las detecciones con la verdad de referencia, dado el mAP@0.5:0.95 de 0,968 en ese dominio.
- Investigacion en vision documental: usar el modelo como baseline reproducible con pesos publicos y protocolo de inferencia fijado para experimentos de deteccion en planos.
- Preprocesado para pipelines de parseo de pagina: combinar las salidas de este modelo con floorplan-dfine-obj y floorplan-dfine-spa para obtener una representacion completa de la pagina.
- Procesamiento en entornos sin GPU: inferencia en CPU de unos segundos por pagina de 2048 px, util para servidores modestos o procesamiento por lotes nocturno.

## Benchmarks y rendimiento

Resultados publicados en la model card, media ± desviacion estandar sobre 3 semillas de entrenamiento; la ultima columna corresponde a la semilla 0 publicada.

| Benchmark | Metrica | 3 semillas, media ± sd | Esta release (semilla 0) |
|---|---|---|---|
| Test retenido coreano (1.453 planos, AI-Hub 71465) | mAP@0.5 | 0,952 ± 0,000 | 0,952 |
| Swiss Dwellings val | mAP@0.5 | 0,889 ± 0,001 | 0,890 |
| Swiss Dwellings val | mAP@0.5:0.95 | 0,761 ± 0,001 | 0,761 |
| SYNBUILD-3D val | mAP@0.5 | 0,989 ± 0,000 | 0,989 |
| SYNBUILD-3D val | mAP@0.5:0.95 | 0,970 ± 0,013 | 0,968 |
| Floorplan Synthetic 2500 val | mAP@0.5 | 0,993 ± 0,000 | 0,993 |
| Floorplan Synthetic 2500 val | mAP@0.5:0.95 | 0,991 ± 0,000 | 0,991 |

AP@0.5 por clase, semilla 0, Swiss Dwellings val:

| Clase | AP@0.5 | Cajas GT |
|---|---|---|
| wall | 0,813 | 166.331 |
| door | 0,928 | 50.358 |
| window | 0,987 | 23.249 |
| railing | 0,831 | 16.071 |

AP@0.5 por clase, semilla 0, test retenido coreano: wall 0,928, window 0,969, door 0,960.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 19,9 M de parametros y pesos de ~80 MB, la huella es minima y cabe con holgura en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 4090 o superiores; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, sin restricciones practicas por tamano de modelo.
- CPU: soportada via `--device cpu`; una pagina de 2048 px tarda unos segundos.
- Opciones de despliegue: el script `inference/infer.py` del repositorio sobre el codigo fuente upstream D-FINE fijado al commit `956d170`; los pesos cargan con `strict=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector).
- Latencia y throughput: solo se indica "unos segundos por pagina de 2048 px en CPU"; no hay cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, la familia incluye dos modelos hermanos con la misma taxonomia:

| Modelo | Capa | Parametros | Contexto de entrada | Licencia |
|---|---|---|---|---|
| floorplan-dfine-str | Estructura (wall, door, window, railing) | 19,9 M | teselas 1920 px | Apache-2.0 |
| floorplan-dfine-obj | Objetos | no disponible | no disponible | no disponible |
| floorplan-dfine-spa | Espacios | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Convencion de pared unica: la pared se define como segmento recto entre aberturas (convencion AI-Hub); las paredes suizas se rederivaron para coincidir. Las paredes no ortogonales se encajan en cajas alineadas a ejes, lo que produce cajas holgadas.
- El AP de paredes en Swiss (0,81) es inferior al de puertas y ventanas porque los segmentos son finos y estan densamente empaquetados.
- Las barandillas solo estan anotadas en Swiss Dwellings y su AP (0,83) es menor que en una version interna previa con paredes tipo blob (0,89), por confusion entre segmentos finos y barandillas.
- SYNBUILD-3D y Floorplan Synthetic 2500 son sinteticos y estan casi saturados (mAP@0.5 en torno a 0,99), por lo que dicen poco sobre planos reales; en SYNBUILD la metrica estricta mAP@0.5:0.95 baja a 0,970.
- El modelo detecta segmentos de pared como cajas, no lineas centrales ni poligonos.
- Fuera de distribucion: planos con convenciones de dibujo muy distintas (estilos de sombreado, esquemas de color CAD, bocetos a mano).
- Escala: en entrenamiento una puerta mide aproximadamente 60-70 px; los rasters de mucha menor resolucion deben reescalarse a esa escala antes de inferir.
- Calidad de escaneo: se entreno con aumentacion de degradacion, pero escaneos muy degradados, especialmente reescalados a la baja, aumentan las cajas perdidas y espurias.
- Solo deteccion: no genera poligonos de habitaciones, no hace OCR ni lectura de cotas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de detecciones espurias en planos fuera de distribucion.
- Licencia Apache-2.0: permite uso comercial; los datos de entrenamiento AI-Hub 71465 no se redistribuyen y las demas fuentes son CC BY 4.0, con obligacion de atribucion si se redistribuyen derivados de esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/digitalpresso/floorplan-dfine-str
- Modelo hermano (capa de objetos): https://huggingface.co/digitalpresso/floorplan-dfine-obj
- Modelo hermano (capa de espacios): https://huggingface.co/digitalpresso/floorplan-dfine-spa
- Codigo fuente D-FINE (upstream, Apache-2.0): https://github.com/Peterande/D-FINE
- Paper SYNBUILD-3D (arXiv:2508.21169): https://arxiv.org/abs/2508.21169
- Dataset Swiss Dwellings v3.0.0 (Zenodo): https://doi.org/10.5281/zenodo.7788422
- Dataset SYNBUILD-3D (Stanford Digital Repository): https://purl.stanford.edu/kz908vb7844
- Dataset Floorplan Synthetic 2500 (figshare): https://figshare.com/account/articles/28282802
