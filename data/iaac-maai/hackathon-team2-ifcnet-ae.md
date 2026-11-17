# iaac-maai/hackathon-team2-ifcnet-ae

## Resumen

`hackathon-team2-ifcnet-ae` es un autoencoder convolucional de pequeno tamano (593.009 parametros) entrenado para detectar elementos BIM atipicos en renders del dataset IFCNet. Lo desarrolla el equipo 2 del hackathon de AI Methods I del Master in AI for Architecture & Business Innovation (MaAI) del IAAC en noviembre de 2026. El modelo aprende la apariencia de 18 clases comunes de elementos IFC y, cuando no consigue reconstruir bien una imagen de entrada, la marca como "objeto inusual, revisar". Ademas, expone su vector latente de 64 dimensiones para busqueda de similitud por coseno.

El modelo resuelve un problema acotado pero practico: el triaje automatico de elementos de modelo en flujos de coordinacion BIM. Un coordinador puede enviar un render o captura de un elemento y recibir una puntuacion de anormalidad, un veredicto binario y los 5 elementos mas parecidos de una galeria precalculada. No es un modelo generativo ni un clasificador supervisado de clases; su senal de anormalidad es el error de reconstruccion normalizado por la masa de pixeles del objeto.

La relevancia es la de una prueba de concepto reproducible y ligera: se ejecuta en CPU con ONNX Runtime, ocupa un repositorio de 0,0 GB y su licencia es MIT. Sus limitaciones son explicitas y notables (precision 0,47, recall 0,63, P@5 0,53), por lo que debe tratarse como herramienta de apoyo al triaje, no como validador autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional (`conv_64`), capa de salida lineal |
| Parametros totales | 593.009 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen 64 x 64) |
| Tipos de cuantizacion | No disponible (pesos ONNX en float32) |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`), mas `config.json` y `gallery.npz` |
| Entrada | `image`: float32 `[batch, 1, 64, 64]` |
| Salidas | `reconstruction` `[batch, 1, 64, 64]`, `latent` `[batch, 64]`, `score` `[batch]` |
| Tamano latente | 64 |
| Umbral de decision | 0,0340 (percentil 95 del score en validacion normal) |
| Preprocesado | Escala de grises, redimensionado a 64 x 64, normalizacion a 0-1, inversion (`x = 1 - x`) |
| Libreria | ONNX Runtime |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un autoencoder convolucional con cuello latente de 64 dimensiones y una capa de salida lineal. Recibe imagenes en escala de grises de 64 x 64 con el objeto en claro sobre fondo oscuro (de ahi la inversion en el preprocesado) y produce tres salidas en una sola pasada: la reconstruccion, el vector latente y una puntuacion de anormalidad. La puntuacion se define como el error cuadratico medio de reconstruccion dividido por la masa de pixeles del objeto (media de pixeles mas 0,001), un ajuste introducido para corregir el sesgo de tamano que hacia que el MSE plano clasificara objetos finos como mas normales.

Los datos provienen de IFCNet (IFCNetCore), con 20 clases IFC y 12 vistas por objeto. Se usaron 3 vistas por objeto, como maximo 300 objetos por clase, en escala de grises de 64 x 64: 11.931 imagenes de entrenamiento, 1.986 de validacion y 7.137 de test, con la particion de validacion separada por objeto. Las 18 clases normales de entrenamiento son AirTerminal, Beam, CableCarrierFitting, CableCarrierSegment, Door, DuctFitting, DuctSegment, Furniture, Lamp, Outlet, PipeFitting, PipeSegment, Plate, SanitaryTerminal, Slab, SpaceHeater, Valve y Wall. Las clases de anomalia (`IfcStair`, `IfcRailing`) se reservan solo para test. El entrenamiento se hizo en CPU durante 30 epocas con Adam (lr 1e-3), batch 128, perdida MSE y seleccion de la mejor epoca por MSE de validacion, con una unica semilla y sin entrenamiento completo. El autor compara cuatro variantes (dense_16, dense_64, conv_16 y conv_64) con la misma particion y semilla.

## Capacidades

- Deteccion de anormalidad por error de reconstruccion en elementos BIM renderizados de 18 clases IFC.
- Veredicto binario ("typical" o "unusual object, check it") a partir de un umbral calibrado al percentil 95 de validacion.
- Busqueda de similitud: devuelve los 5 elementos mas cercanos de una galeria mediante similitud coseno sobre el latente L2-normalizado.
- Extraccion de embeddings de 64 dimensiones para indexacion o agrupamiento posterior.
- Inferencia en CPU con ONNX Runtime, sin GPU ni dependencias pesadas.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, vision general ni audio.

## Casos de uso

- Triaje de coordinacion BIM: el coordinador envia capturas de elementos y el modelo prioriza cuales revisar manualmente, usando el score frente al umbral 0,0340 y el veredicto binario.
- Control de calidad de librerias de familias: se codifican los renders de una libreria de familias y se detectan elementos atipicos respecto a las 18 clases aprendidas, utiles para auditar contenido no estandar.
- Busqueda de elementos similares: dado un elemento nuevo, el latente permite recuperar los 5 mas parecidos de `gallery.npz` por coseno, lo que sirve para localizar precedentes en el catalogo.
- Deteccion de clases no contempladas: al no haber visto `IfcStair` ni `IfcRailing` en entrenamiento, estos elementos tienden a puntuar alto y pueden usarse como senal de "categoria fuera de catalogo" (con el recall limitado del modelo).
- Preprocesado de pipelines de analisis: el embedding de 64 dimensiones puede alimentar un agrupamiento o un clasificador ligero aguas abajo, siempre que se acepte su calidad limitada (P@5 0,53).
- Prototipado y docencia: al ejecutarse en CPU y con licencia MIT, es adecuado para demos, talleres y ejercicios de deteccion de anormalidad sobre datos IFC sin infraestructura dedicada.
- Filtro previo en revisiones masivas: en lotes grandes de renders, el modelo puede ordenar por score y reducir el volumen de elementos que llegan a revision humana, asumiendo la tasa de falsos positivos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (misma particion y semilla, 30 epocas):

| Modelo | Parametros | Val MSE | Test MSE | ROC AUC | Precision | Recall | P@5 |
|---|---|---|---|---|---|---|---|
| dense_16 | 4.334.864 | 0,00179 | 0,00180 | 0,821 | 0,399 | 0,396 | 0,496 |
| dense_64 | 4.347.200 | 0,00154 | 0,00154 | 0,810 | 0,391 | 0,420 | 0,506 |
| conv_16 | 199.745 | 0,00158 | 0,00158 | 0,884 | 0,449 | 0,515 | 0,507 |
| **conv_64 (este modelo)** | **593.009** | **0,00055** | **0,00056** | **0,891** | **0,467** | **0,627** | **0,534** |

Baselines de P@5: pixeles crudos 0,504; aleatorio 0,063. Las anomalias representan el 6 % del conjunto de test y el umbral marca el 5 % de las imagenes normales.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU con ONNX Runtime (`CPUExecutionProvider`).
- Memoria RAM: minima, dado el tamano del modelo (593.009 parametros) y la entrada de 64 x 64.
- GPU recomendadas: no aplica; cualquier GPU es innecesaria para este modelo.
- Cabe en cualquier equipo consumer, incluidos portatiles modestos y entornos sin acelerador.
- Opciones de despliegue: ONNX Runtime (Python), integrable en servicios ligeros; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano y la resolucion de entrada se espera baja latencia en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | ROC AUC | Precision | Recall | P@5 | Licencia |
|---|---|---|---|---|---|---|
| conv_64 (este modelo) | 593.009 | 64 x 64, 1 canal | 0,891 | 0,467 | 0,627 | 0,534 | MIT |
| conv_16 | 199.745 | 64 x 64, 1 canal | 0,884 | 0,449 | 0,515 | 0,507 | No disponible |
| dense_64 | 4.347.200 | 64 x 64, 1 canal | 0,810 | 0,391 | 0,420 | 0,506 | No disponible |
| dense_16 | 4.334.864 | 64 x 64, 1 canal | 0,821 | 0,399 | 0,396 | 0,496 | No disponible |

Las alternativas comparables son las variantes internas del propio autor; no se dispone de comparacion con modelos externos de deteccion de anormalidad en BIM en la informacion proporcionada.

## Limitaciones y advertencias

- Precision 0,47: muchas falsas alarmas; con anomalias al 6 % del test y un umbral que marca el 5 % de las normales, el ruido operativo es alto.
- Recall 0,63: se pierde aproximadamente un tercio de las anomalias, sobre todo railings y escaleras por ser formas simples y compactas.
- Sesgo de tamano: la division por masa de pixeles corrige parcialmente el sesgo del MSE plano, pero objetos muy pequenos o muy grandes aun pueden puntuarse mal.
- Similitud debil: P@5 0,53, apenas por encima de los pixeles crudos (0,50); el latente se entreno para reconstruccion, no para separar clases.
- Solo renders limpios de IFCNet: capturas reales de Revit o Rhino (otros angulos, colores, fondos) pueden puntuar como inusuales.
- Configuracion reducida: 64 px, 3 vistas por objeto, maximo 300 objetos por clase, una sola semilla y entrenamiento no completo.
- Licencia del dataset no declarada por los autores de IFCNet; el modelo se uso solo con fines academicos no comerciales. Los pesos se publican con licencia MIT, pero conviene revisar la procedencia de los datos antes de un uso comercial.
- No es un clasificador de clases IFC: no devuelve la etiqueta del elemento, solo un score de anormalidad y vecinos por similitud.
- Riesgo de alucinacion no aplica (no es generativo), pero si el riesgo de veredictos erroneos por dominio distinto al de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/hackathon-team2-ifcnet-ae
- Codigo del proyecto: https://github.com/iaac-maai/hackathon-team2-ifcnet
- Dataset IFCNet: https://ifcnet.e3d.rwth-aachen.de/
- Paper de IFCNet: Emunds, C. et al. (2021) "IFCNet: A Benchmark Dataset for IFC Entity Classification", arXiv 2106.09712 (https://arxiv.org/abs/2106.09712)
