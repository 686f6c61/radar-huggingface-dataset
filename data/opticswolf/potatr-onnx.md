# opticsWolf/potatr-onnx

## Resumen

POTATR ONNX es un repositorio de despliegue autocontenido que empaqueta el modelo Kensho POTATR v1.1 (Page-Object Table Transformer, presentado en DAS 2026) en formato ONNX. POTATR es un modelo de deteccion de objetos orientado a la extraccion de tablas a nivel de pagina: no genera texto, sino que predice la estructura de la tabla (filas, columnas, cabeceras, celdas con spanning, leyendas y pies) sobre la imagen de una pagina completa. El repositorio lo publica el usuario opticsWolf y exporta los pesos originales de `kensho/POTATR-v1.1-Pub` con licencia MIT de extremo a extremo.

El modelo resuelve el problema de la deteccion de estructura tabular en documentos escaneados o digitales, un paso previo imprescindible para pipelines de extraccion de datos de facturas, articulos cientificos, informes financieros o formularios. Frente a aproximaciones basadas en OCR seguido de heuristica, POTATR opera directamente sobre la imagen y devuelve cajas y logits de aristas que un post-procesador convierte en celdas, combinando despues con las palabras de la pagina obtenidas por un OCR externo.

La relevancia actual del repositorio es practica: ofrece un artefacto ONNX listo para servir con paridad verificada frente a PyTorch (diferencia maxima absoluta de 1e-6 a 6e-5) y un tiempo de inferencia de aproximadamente 340 ms por pagina en CPU con ONNX Runtime. El tamano del repositorio es de 0,1 GB y el peso exportado es de 115,8 MB, lo que lo hace desplegable en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Page-Object Table Transformer (POTATR), transformer de deteccion de objetos sobre imagen de pagina |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen; lado mayor redimensionado a 1000 px, ejes H y W dinamicos) |
| Tipos de cuantizacion | no disponible (exportacion en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; el texto lo aporta el OCR externo) |
| Licencia | MIT (modelo, codigo y pesos) |
| Formato de pesos | ONNX (opset 18, exportado con torchscript exporter, torch 2.15 CPU) |

## Arquitectura y entrenamiento

POTATR es un transformer de deteccion de objetos tipo DETR adaptado a la estructura de tablas a nivel de pagina. La red recibe una imagen RGB `[1,3,H,W]` en float32, normalizada con media y desviacion estandar de ImageNet, y devuelve tres salidas: `pred_node_logits` de forma `[1,250,17]` (16 clases de objeto mas la clase "sin objeto": tabla, filas, columnas, cabeceras, celdas con spanning, leyendas, pies y variantes rotadas), `pred_boxes` de forma `[1,250,4]` en formato normalizado `(cx,cy,h,w)` y `pred_edge_logits` de forma `[1,250,250,2]` que modela las aristas entre objetos de la tabla. Los ejes de altura y anchura son dinamicos, por lo que el mismo grafo admite cualquier lienzo de entrada.

El entrenamiento original corresponde a Kensho Technologies y se documenta en el paper de DAS 2026; el repositorio no detalla el volumen de tokens ni la composicion del dataset de entrenamiento, aunque la evaluacion de referencia se realiza sobre PubTables-v2 Single Pages. La exportacion a ONNX se hizo con `torch.onnx.export`, opset 18, sin cirugia de grafo ni operadores personalizados, desde el checkpoint `POTATR-v1.1-Pub.safetensors` en el commit `4f853618bb4393a191ac1cd45ae86e2774b37c3a`. La paridad entre PyTorch y ONNX Runtime en CPU se verifico sobre lienzos de 1000x773, 1000x1000 y 800x600, con diferencias atribuibles al redondeo en float32.

Un detalle arquitectonico relevante para produccion: las palabras de la pagina (`bbox`, `text`, `block_num`, `line_num`, `span_num`) no son entrada de la red. Se consumen aguas abajo por el post-procesador para asignar el texto a cada celda detectada. La implementacion de referencia es `kensho-technologies/POTATR`, con las funciones `potatr.inference.run_on_page` y `postprocess.potatr_outputs_to_tables_cells`.

## Capacidades

- Deteccion de tablas en imagenes de pagina completa, incluyendo tablas rotadas.
- Reconocimiento de estructura tabular: filas, columnas, cabeceras, celdas con spanning (combinadas), leyendas y pies de tabla.
- Prediccion de relaciones (aristas) entre objetos de la tabla mediante `pred_edge_logits`, que permite reconstruir la jerarquia de celdas.
- Entrada de imagen con resolucion variable gracias a los ejes dinamicos de altura y anchura.
- Integracion con OCR externo: el post-procesador asigna el texto de las palabras de la pagina a las celdas detectadas.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues: es exclusivamente un detector de estructura tabular.

## Casos de uso

- Extraccion de tablas de articulos cientificos: se rasteriza cada pagina, se ejecuta el modelo ONNX para obtener la estructura y se combina con las palabras del PDF (via OCR o capa de texto) para reconstruir tablas en formato estructurado; el modelo esta entrenado y evaluado sobre PubTables-v2 y datos derivados de JATS.
- Digitalizacion de informes financieros y memorias anuales: las tablas de resultados suelen ocupar paginas completas con celdas combinadas y cabeceras multi-nivel; POTATR detecta explicitamente spanning cells y cabeceras, lo que simplifica el mapeo a CSV o bases de datos.
- Procesamiento de facturas y albaranes: la deteccion a nivel de pagina permite localizar la tabla de lineas aunque no ocupe toda la imagen, y el post-procesador asigna los importes y descripciones a cada celda.
- Pipelines de document AI en CPU: con aproximadamente 340 ms por pagina en ONNX Runtime CPU y un peso de 115,8 MB, es viable procesar lotes de documentos en servidores sin GPU o en entornos edge.
- Ingesta de literatura tecnica en repositorios academicos: la evaluacion independiente sobre 39 tablas derivadas de JATS con contenido fisico y matematico (micro GriTS-Con F1 de 0,900 y TEDS de 0,873) respalda su uso en bibliotecas digitales.
- Extraccion de tablas en formularios y documentos administrativos escaneados: el modelo tolera rotaciones y variaciones de lienzo, util para digitalizacion masiva de archivos historicos o administrativos.
- Preprocesado para sistemas RAG sobre documentos: convertir tablas a texto estructurado antes de la indexacion mejora la recuperacion de informacion numerica que el chunking de texto plano pierde.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Contexto |
|---|---|---|---|
| PubTables-v2 Single Pages | GriTS_Con | 0,964 | Reportado en el paper (DAS 2026) |
| 39 tablas derivadas de JATS (8 papers, fisica/matematicas) | micro GriTS-Con F1 | 0,900 | Evaluacion independiente en PyTorch |
| 39 tablas derivadas de JATS (8 papers, fisica/matematicas) | TEDS | 0,873 | Evaluacion independiente en PyTorch |
| Paridad torch vs ONNX Runtime CPU | max abs diff | 1e-6 a 6e-5 | Lienzos 1000x773, 1000x1000 y 800x600 |
| Inferencia ONNX Runtime CPU | latencia | ~340 ms/pagina | No se especifica hardware concreto |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de reconocimiento de estructura tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el peso ONNX es de 115,8 MB en float32, por lo que la huella de memoria es muy reducida y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 1-2 GB de memoria libre es suficiente por el tamano del modelo. Se documenta inferencia en CPU como opcion principal.
- Cabe en GPU consumer: si, en practicamente cualquier modelo actual (RTX 3060, RTX 4090, etc.), aunque el caso de uso documentado es CPU.
- Opciones de despliegue: ONNX Runtime (referencia validada), y en general cualquier runtime compatible con ONNX (por ejemplo, servidores de inferencia ONNX); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 340 ms por pagina en CPU con ONNX Runtime; no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos de reconocimiento de estructura tabular (parametros, contexto, rendimiento o licencia) que permitan una comparativa rigurosa. La comparacion queda como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| POTATR ONNX (este) | no disponible | no aplica (imagen) | MIT | ONNX | GriTS_Con 0,964 en PubTables-v2 |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de vision para estructura tabular: no genera texto ni razona; requiere un OCR o una capa de texto externa para poblar las celdas.
- La evaluacion independiente se limita a 39 tablas de 8 papers con sesgo hacia fisica y matematicas; el rendimiento en otros dominios (facturas, formularios manuscritos, tablas muy densas) no esta documentado.
- La salida esta limitada a 250 objetos por pagina (`[1,250,...]`); paginas con un numero de celdas superior podrian truncarse.
- El redimensionado del lado mayor a 1000 px puede degradar tablas con tipografia muy pequena o con muchas columnas.
- Riesgo de alucinacion estructural: el modelo puede predecir filas, columnas o celdas inexistentes, o fusionar celdas incorrectamente; se recomienda validacion posterior y metricas de confianza.
- Sesgos: no se documentan analisis de sesgo; al ser un detector visual, puede verse afectado por sesgos en el dataset de entrenamiento (tipografias, idiomas, estilos de tabla).
- Idiomas: no disponible; el modelo no procesa texto, pero el rendimiento puede variar segun la escritura (por ejemplo, RTL o CJK) por la distribucion visual del dataset original.
- Licencia MIT, que permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de copyright; conviene verificar la licencia del checkpoint original `kensho/POTATR-v1.1-Pub`, tambien MIT segun la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- La fecha de creacion indicada (2026-11-07) es posterior a la de la consulta; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/opticsWolf/potatr-onnx
- Modelo original: https://huggingface.co/kensho/POTATR-v1.1-Pub
- Implementacion de referencia: https://github.com/kensho-technologies/POTATR
- Perfil del autor: https://huggingface.co/opticsWolf
- Paper: POTATR, DAS 2026 (no se proporciona enlace directo en la informacion disponible)
- Dataset de evaluacion: PubTables-v2 (no se proporciona enlace directo en la informacion disponible)
