# ml-resources/sam3.1

## Resumen

SAM 3.1 es un modelo fundacional de segmentacion promptable para imagenes y video, desarrollado por Meta (Facebook Research). Este repositorio concreto, `ml-resources/sam3.1`, es un espejo no oficial de `facebook/sam3.1` publicado por un tercero, que conserva la licencia original (SAM License) y no constituye un lanzamiento oficial de Meta. El pipeline declarado en Hugging Face es `mask-generation` y el idioma soportado para los prompts de texto es el ingles.

El modelo resuelve la segmentacion exhaustiva de todas las instancias de un concepto de vocabulario abierto especificado mediante una frase corta de texto, ademas de la segmentacion guiada por prompts visuales (puntos, cajas y mascaras) y el seguimiento de objetos en video. Sobre la base de SAM 3, la version 3.1 incorpora Object Multiplex, un enfoque de memoria compartida para el seguimiento conjunto de multiples objetos, con una mejora declarada de aproximadamente 7 veces en velocidad de inferencia con 128 objetos sobre una unica GPU H100, sin perdida de precision.

La relevancia actual del modelo radica en su caracter unificado: cubre deteccion, segmentacion y tracking con una sola arquitectura y una sola interfaz de prompts, lo que simplifica pipelines de anotacion, analisis de video y busqueda visual por concepto. El repositorio ocupa 3,5 GB y se distribuye como checkpoint, sin integracion con Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional unificado de segmentacion promptable (imagen y video); detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion, no generativo de texto) |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones oficiales en la informacion facilitada) |
| Idiomas soportados | en (prompts de texto en ingles) |
| Licencia | other (SAM License; ver archivo `LICENSE` del repositorio) |
| Formato de pesos | checkpoint (no se especifica safetensors ni GGUF); tamano del repositorio 3,5 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens de imagen o video vistos durante el entrenamiento ni sobre tecnicas de ajuste como RLHF o DPO. La model card tampoco describe la arquitectura interna mas alla de su caracter unificado: un unico modelo que realiza deteccion, segmentacion y seguimiento de objetos a partir de prompts de texto o visuales (puntos, cajas y mascaras).

La innovacion tecnica destacada en SAM 3.1 es Object Multiplex, un mecanismo de memoria compartida disenado para el seguimiento conjunto de multiples objetos. Segun la informacion proporcionada, este enfoque permite procesar 128 objetos simultaneamente con una mejora de aproximadamente 7 veces en velocidad de inferencia sobre una unica GPU H100, manteniendo la precision, y eleva el rendimiento en tareas de segmentacion de video (VOS) en 6 de los 7 benchmarks evaluados. La version base, SAM 3, introdujo la segmentacion exhaustiva de conceptos de vocabulario abierto, cubriendo mas de 50 veces mas conceptos unicos que los benchmarks existentes, aunque no se detalla en la informacion disponible el numero concreto de conceptos ni las cifras absolutas de dichos benchmarks.

## Capacidades

- Segmentacion promptable en imagenes mediante puntos, cajas y mascaras.
- Segmentacion de video con propagacion de mascaras a lo largo del tiempo.
- Segmentacion exhaustiva de todas las instancias de un concepto de vocabulario abierto descrito por una frase corta de texto.
- Deteccion de objetos guiada por prompt textual o visual.
- Seguimiento conjunto de multiples objetos en video (multi-object tracking) mediante Object Multiplex.
- Rendimiento optimizado para escenarios con muchos objetos simultaneos (hasta 128 objetos citados en las pruebas con H100).
- Prompts de texto unicamente en ingles.
- No disponible: soporte de tool calling, function calling, agentes o razonamiento multi-paso (no son capacidades de este tipo de modelo).

## Casos de uso

- Autoetiquetado de datasets de vision por computador: el modelo permite generar mascaras de instancia a partir de una frase de texto, lo que reduce el coste de anotacion manual en pipelines de entrenamiento de modelos de deteccion y segmentacion.
- Rotoscopia y efectos visuales en produccion audiovisual: la segmentacion promptable y el tracking multiobjeto con Object Multiplex permiten aislar y seguir actores u objetos a lo largo de un plano con una mejora declarada de hasta 7x en velocidad con 128 objetos.
- Analisis de video en vigilancia o transporte: el seguimiento conjunto de muchos objetos en una sola pasada sobre GPU permite contar y rastrear vehiculos o peatones de forma consistente en secuencias largas.
- Busqueda visual por concepto: dado un prompt textual en ingles, el modelo puede localizar y segmentar todas las instancias de una categoria abierta en un catalogo de imagenes, util en comercio electronico o gestion de archivos multimedia.
- Robotica y percepcion: la segmentacion promptable con puntos o cajas facilita la delimitacion de objetos de interes para tareas de manipulacion y planificacion, sin necesidad de reentrenar por cada nueva categoria.
- Inspeccion industrial y control de calidad: segmentacion de defectos o componentes definidos por prompt para medir areas, contar piezas o verificar presencia de elementos en lineas de produccion.
- Analisis de imagenes remotas: conteo y delimitacion de instancias (edificios, parcelas, vegetacion) usando prompts de texto, aprovechando que el modelo generaliza a conceptos no vistos durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente indica mejoras relativas: aproximadamente 7x mas velocidad de inferencia con 128 objetos en una H100 y mejor rendimiento en segmentacion de video (VOS) en 6 de 7 benchmarks, sin detallar nombres de benchmarks ni valores absolutos.

| Benchmark | Resultado | Notas |
|---|---|---|
| VOS (6 de 7 benchmarks) | mejora cualitativa | sin cifras publicadas en la informacion disponible |
| Inferencia con 128 objetos | ~7x mas rapido | medido en una unica GPU H100, sin perdida de precision declarada |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 3,5 GB, por lo que los pesos en precision original caben en GPUs de gama alta de consumo, pero el consumo real dependera de la resolucion de entrada, del numero de objetos y de la duracion del video.
- GPU recomendadas: la model card cita explicitamente una unica GPU H100 para el escenario de 128 objetos. No se especifican otros modelos de GPU validados.
- GPU de consumo: no confirmado oficialmente. Por tamano de checkpoint es plausible en GPUs tipo RTX 4090 o superiores, pero requiere verificacion con el codigo del repositorio oficial.
- Opciones de despliegue: no hay integracion con Hugging Face Transformers; el despliegue se realiza mediante el codigo del repositorio oficial de GitHub de SAM 3. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: el unico dato disponible es la mejora de ~7x con 128 objetos en H100. No se publican cifras absolutas de latencia ni de FPS.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tipo | Contexto/prompts | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3.1 | Meta | Segmentacion promptable imagen y video + Object Multiplex | Texto (en), puntos, cajas, mascaras | SAM License | Checkpoint en Hugging Face, codigo en GitHub |
| SAM 3 | Meta | Segmentacion promptable con conceptos de vocabulario abierto | Texto (en), puntos, cajas, mascaras | SAM License | Checkpoint y codigo en GitHub |
| SAM 2 | Meta | Segmentacion promptable en imagen y video ("Segment Anything 2") | Puntos, cajas, mascaras | Licencia de Meta (no verificada en esta busqueda) | Pesos y codigo publicados |
| Grounded-SAM u otras combinaciones deteccion + segmentacion | Comunidad | Pipeline que une un detector de vocabulario abierto con un segmentador | Texto | Depende de los componentes | Repositorios de la comunidad |

Nota: los datos de SAM 2 y de las alternativas de la comunidad no proceden de la informacion facilitada, por lo que los campos no verificados deben confirmarse en sus fuentes oficiales. No se dispone de cifras comparativas de parametros ni de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial de `facebook/sam3.1`; no cuenta con el respaldo de Meta y sus cifras de descargas y likes (0 en el momento de la consulta) no reflejan el uso real del modelo original.
- No existe integracion con Hugging Face Transformers: la carga mediante `AutoModel` u otras utilidades estandar no esta soportada y requiere el codigo del repositorio oficial.
- Los prompts de texto solo funcionan en ingles; no se declara soporte multilingue.
- Riesgo de fallo en conceptos muy especificos, poco representados o ambiguos: la segmentacion de vocabulario abierto no garantiza cobertura exhaustiva en dominios fuera de distribucion.
- La licencia SAM License es una licencia "other" con condiciones especificas; es imprescindible revisar el archivo `LICENSE` antes de un uso comercial.
- Las mejoras de velocidad (~7x con 128 objetos) estan medidas en una unica GPU H100, por lo que no son extrapolables directamente a hardware de consumo.
- No se publican datos sobre sesgos, robustez ante dominios adversos ni comportamiento en imagenes de baja calidad; se recomienda validacion propia antes de produccion.
- La fecha de creacion del espejo (2026-10-15) y la ausencia de actividad sugieren que puede no estar sincronizado con futuras actualizaciones del modelo original.

## Enlaces

- Repositorio del espejo en Hugging Face: https://huggingface.co/ml-resources/sam3.1
- Repositorio original en Hugging Face: https://huggingface.co/facebook/sam3.1
- Repositorio de codigo oficial (SAM 3): https://github.com/facebookresearch/sam3
- Diagrama de SAM 3.1: https://github.com/facebookresearch/sam3/blob/main/assets/sam3.1_diagram.png
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados devueltos corresponden a paginas de desambiguacion y contenidos no relacionados con SAM 3.1.
