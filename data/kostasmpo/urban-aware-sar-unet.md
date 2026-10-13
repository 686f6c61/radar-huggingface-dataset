# kostasmpo/urban-aware-sar-unet

## Resumen

Urban-Aware SAR U-Net es un modelo de segmentacion semantica de imagenes radar de apertura sintetica (SAR) disenado para cartografiar inundaciones en entornos urbanos a partir de datos Sentinel-1. Lo publica el autor Konstantinos Botonakis (NTUA) junto con su tesis de octubre de 2026, titulada "Implementation and Evaluation of the Urban-Aware U-Net Model for Flood Mapping in Urban Areas with Sentinel-1 Data". El repositorio contiene los dos checkpoints finales del trabajo, no un modelo de lenguaje ni un modelo fundacional, sino dos pesos concretos de una red convolutional entrenada para una tarea geoespacial acotada.

Tecnicamente es una Attention U-Net de 5 niveles con 147,9 M de parametros y ancho base 64, adaptada con un segundo encoder que procesa una mascara urbana probabilistica generada por SPUM. La entrada es un chip de 8 bandas del benchmark UrbanSARFloods (coherencia pre y co-evento, intensidad pre y post-evento, en polarizaciones VH y VV) mas la citada mascara urbana. La salida tiene tres clases: no inundado (NF), inundado en zona abierta (FO) e inundado en zona urbana (FU).

Su relevancia es metodologica mas que de producto: el modelo se centra en el caso dificil de la inundacion urbana, donde las senales SAR se confunden con superficies construidas y la etiqueta de referencia es escasa. Los resultados publicados son honestos y modestos (F1 de 0,383 en la clase FU sobre el conjunto de test), lo que lo convierte en una linea base reproducible para investigacion en teledeteccion mas que en una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention U-Net de 5 niveles (encoder-decoder con attention gates) y ancho base 64, con un segundo encoder dedicado a la mascara urbana |
| Parametros totales | 147,9 M |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagenes; la entrada es un chip de 8 bandas, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (se distribuye como `state_dict` de PyTorch; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (entrada de imagenes SAR; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pth.tar`) |

## Arquitectura y entrenamiento

El modelo es una Attention U-Net clasica de 5 niveles, es decir, un encoder-decoder convolutional con conexiones de salto moduladas por attention gates. La variante "urban-aware" anade una rama de entrada independiente: la mascara urbana probabilistica generada con SPUM pasa por su propio encoder, y sus caracteristicas se fusionan con las del chip SAR de 8 bandas. Este diseno busca que la red no tenga que aprender implicitamente donde hay edificios, sino recibir esa informacion de forma explicita. La cabeza de salida produce tres clases (NF, FO, FU) sobre la rejilla de pixeles de entrada.

El entrenamiento se realizo sobre UrbanSARFloods con las mascaras SPUM de `urbansarfloods-spum-masks`, usando el optimizador Adam con learning rate 1e-4, weight decay 1e-4, batch size 8 y 100 epocas, con aumento de datos y un muestreador ponderado. Se publican dos checkpoints: `M-BEST.pth.tar` (perdida Focal + Tversky con α=0,3 y β=0,7, mejor epoca 71) y `M-REF.pth.tar` (perdida Focal, mejor epoca 85). En ambos casos el checkpoint corresponde a la epoca con mejor F1 de validacion de la clase FU. El conjunto de test lo forman tres eventos etiquetados manualmente (Jubba, Weihui y Nova Kakhovka) que nunca se usaron durante el entrenamiento. El checkpoint almacena unicamente los pesos, la epoca y la puntuacion de guardado; la arquitectura se infiere a partir de las formas de los tensores.

## Capacidades

- Segmentacion semantica de imagenes SAR Sentinel-1 en tres clases: no inundado, inundado en zona abierta e inundado en zona urbana.
- Integracion de datos multitemporales: combina coherencia interferometrica pre y co-evento con intensidad pre y post-evento.
- Uso de doble polarizacion (VH y VV) como entrada.
- Incorporacion de una mascara urbana externa probabilistica a traves de un encoder dedicado.
- Inferencia sobre escenas completas mediante una herramienta de linea de comandos (`tools.py inference`) que recibe un GeoTIFF de escena y un GeoTIFF de mascara urbana, y devuelve un mapa de inundacion.
- Deteccion fiable de objetos inundados de gran tamano en zona urbana (recall del 94 % por encima de 0,4 km²).
- No dispone de generacion de texto, razonamiento, codigo, tool calling, capacidades de agente ni soporte multilingue: es un modelo puramente visual y de un unico dominio.

## Casos de uso

- Cartografia de inundaciones urbanas en respuesta a emergencias: dada una escena Sentinel-1 posterior a un evento y una mascara urbana SPUM de la zona, el modelo genera un mapa raster con las areas inundadas clasificadas por tipo de superficie, util para priorizar inspecciones sobre el terreno.
- Investigacion en teledeteccion: sirve como linea base reproducible frente a la que comparar variantes de atencion, funciones de perdida o esquemas de fusion de la mascara urbana, gracias a que los pesos, la configuracion de entrenamiento y el conjunto de test estan documentados.
- Validacion de productos de inundacion existentes: el mapa de salida puede cruzarse con cartografia oficial o con modelos hidrodinamicos para detectar discrepancias en zonas densamente construidas, que es justamente donde los metodos clasicos fallan mas.
- Analisis de impacto sobre infraestructura urbana: la clase FU permite aislar el agua que afecta a suelo edificado, lo que ayuda a estimar que distritos, polígonos industriales o redes viarias quedan comprometidos tras un episodio de lluvias extremas.
- Estudio comparativo entre eventos: al haberse evaluado sobre Jubba, Weihui y Nova Kakhovka, el modelo permite analizar como varian las tasas de deteccion segun el tipo de cuenca, el clima y la morfologia urbana de cada zona.
- Apoyo a la evaluacion de danos para aseguradoras y reaseguradoras: un mapa por pixel con distincion entre inundacion urbana y no urbana aporta una primera estimacion de exposicion antes de las peritaciones de campo.
- Docencia y prototipado en teledeteccion: el repositorio incluye el codigo completo y los pesos, lo que facilita reproducir el pipeline extremo a extremo (descarga de datos, generacion de mascara SPUM, inferencia y evaluacion) en un curso o en un proyecto fin de master.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la propia model card, medidos sobre el conjunto de test de tres eventos etiquetados manualmente. FU corresponde a la clase de inundacion urbana, que es la clase objetivo del trabajo.

| Modelo | Perdida | Mejor epoca | F1 validacion (FU) | F1 test (FU) | Precision test (FU) | Recall test (FU) |
|---|---|---|---|---|---|---|
| `M-BEST.pth.tar` | Focal + Tversky (α=0,3, β=0,7) | 71 | 0,539 | 0,383 | 0,425 | 0,349 |
| `M-REF.pth.tar` | Focal | 85 | 0,513 | 0,367 | 0,545 | 0,276 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor si reporta un desglose del recall por tamano de objeto: aproximadamente un 8 % para objetos urbanos inundados de hasta 8.000 m² y un 94 % por encima de 0,4 km².

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 0,6 GB en fp32 y 0,3 GB en fp16/bf16, calculado a partir de los 147,9 M de parametros. Es una estimacion propia, no confirmada por el autor.
- Memoria de activaciones: en una U-Net de 5 niveles procesando chips de alta resolucion, las activaciones suelen dominar el consumo total y crecen con el tamano del tile y el batch. No hay cifras publicadas; como referencia practica, un chip de 512x512 en fp32 puede requerir varios GB adicionales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar inferencia por tiles en fp16 (RTX 3060, RTX 4060, RTX 2070 o superiores). Para escenas grandes sin trocear o para reentrenamiento, se recomienda una GPU de 24 GB o mas (RTX 3090, RTX 4090, A5000, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas, siempre que se trocee la escena y se use precision reducida. El modelo es de 147,9 M de parametros, muy por debajo de los grandes modelos de vision.
- Opciones de despliegue: PyTorch nativo (es la unica ruta documentada, mediante el script `tools.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo de segmentacion de imagenes. Un pipeline propio con TorchScript, ONNX Runtime o TensorRT es viable, pero requiere conversion manual por parte del usuario.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni requisitos de memoria medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Urban-Aware SAR U-Net (este repositorio) | 147,9 M | Chip de 8 bandas + mascara urbana SPUM | F1 test FU 0,383; precision 0,425; recall 0,349 | MIT | Pesos en HuggingFace y codigo en GitHub |
| Urban-Aware U-Net (Zhao et al., 2022) | no disponible | Intensidad multitemporal y coherencia Sentinel-1 en doble polarizacion | no disponible (el resumen indica potencial para cartografia casi en tiempo real con pocos datos de entrenamiento) | no disponible | Articulo en IEEE y ResearchGate; no se han localizado pesos publicos |
| SAR-UNet (mathieurenault1) | no disponible | Imagenes SAR | no disponible | no disponible | Repositorio en GitHub |

La comparacion cuantitativa no es posible con la informacion disponible. El trabajo que sirve de referencia metodologica es la Urban-Aware U-Net de Zhao et al. (2022), de la que esta implementacion toma el concepto de modulo urbano y a la que anade la mascara probabilistica externa de SPUM en lugar de aprender esa informacion de forma implicita.

## Limitaciones y advertencias

- El recall depende fuertemente del tamano del objeto: alrededor del 8 % para objetos urbanos inundados de hasta 8.000 m² y del 94 % por encima de 0,4 km². Los edificios o manzanas pequenas quedan practicamente sin detectar.
- Los resultados varian de forma notable entre eventos, segun admite el propio autor. El F1 de test (0,383 en FU) es sensiblemente inferior al de validacion (0,539), lo que indica problemas de generalizacion.
- Las etiquetas de entrenamiento son semiautomaticas. Esto limita tanto lo que la red puede aprender como la fiabilidad de la evaluacion, ya que parte del error medido puede provenir del propio ruido de las anotaciones.
- El modelo no es un sistema de alerta autonomo ni un producto operativo: esta pensado como prototipo de investigacion y sus metricas no alcanzan un umbral de fiabilidad apto para decisiones criticas sin validacion adicional en la zona de interes.
- Requiere una mascara urbana probabilistica generada por SPUM como entrada adicional. Sin ese paso previo, que implica su propio pipeline, el modelo no puede ejecutarse.
- El dominio de aplicacion es estrecho: imagenes Sentinel-1 con la configuracion de bandas y el preprocesamiento concretos del benchmark UrbanSARFloods. Aplicarlo a otros sensores, otras polarizaciones u otro preprocesamiento invalidaria las garantias de rendimiento.
- La licencia es MIT, lo que permite uso comercial, modificacion y redistribucion con atribucion. No obstante, la licencia permisiva no implica que el modelo sea apto para produccion; es una advertencia tecnica, no legal.
- Sin datos publicados de latencia, consumo de memoria ni pruebas de estres, cualquier despliegue real requiere una fase de benchmarking propia.
- Sesgos conocidos: el desbalance entre zonas urbanas y no urbanas y la composicion geografica del conjunto de entrenamiento pueden sesgar las predicciones hacia las morfologias y condiciones climaticas representadas en UrbanSARFloods.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kostasmpo/urban-aware-sar-unet
- Codigo de la implementacion: https://github.com/kostasmpo/urban_aware_sar_unet
- Generador de mascaras urbanas SPUM: https://github.com/kostasmpo/SAR_derived_probabilistic_urban_mask
- Dataset de mascaras SPUM: https://huggingface.co/datasets/kostasmpo/urbansarfloods-spum-masks
- Dataset de entrenamiento (referenciado en las etiquetas): S1Floodbenchmark/UrbanSARFloods_v1
- Articulo de referencia, Urban-Aware U-Net for Large-Scale Urban Flood Mapping Using Multi-Temporal Sentinel-1 Intensity and Interferometric Coherence (Zhao et al., 2022): https://ieeexplore.ieee.org/document/9857936
- Version en ResearchGate del mismo articulo: https://www.researchgate.net/publication/362705299_Urban-aware_U-Net_for_large-scale_urban_flood_mapping_using_multi-temporal_Sentinel-1_intensity_and_interferometric_coherence
- Repositorio SAR-UNet (mathieurenault1): https://github.com/mathieurenault1/SAR-UNet
- Trabajo relacionado sobre prediccion de inundaciones guiada por fisica: https://arxiv.org/abs/2606.06524
