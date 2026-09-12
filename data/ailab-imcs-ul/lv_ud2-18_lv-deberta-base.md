# AiLab-IMCS-UL/lv_ud2.18_lv-deberta-base

## Resumen

El modelo `lv_ud2.18_lv-deberta-base`, publicado por el grupo AiLab-IMCS-UL (Universidad de Letonia, IMCS), es un analizador morfosintáctico del letón construido sobre el encoder `AiLab-IMCS-UL/lv-deberta-base`. Se trata de un modelo de clasificacion de tokens con arquitectura multi-tarea que, en una sola pasada, predice etiquetas UPOS y XPOS, rasgos morfologicos, lemas, cabezas de dependencia (heads) y relaciones de dependencia. Con 146.109.171 parametros (aproximadamente 146 M) y pesos en safetensors, ocupa un repositorio de 0,6 GB, por lo que es un modelo compacto orientado a produccion.

El problema que resuelve es el analisis morfosintactico completo del leton, un idioma con recursos limitados y morfologia rica (siete casos nominales, declinaciones y conjugaciones complejas). El modelo se entreno y evaluo sobre el treebank letón de Universal Dependencies en su version UD 2.18, y combina en su entrenamiento el treebank gold con 285.000 frases anotadas automaticamente (silver) procedentes del Corpus Equilibrado del Leton Moderno (LVK2022) y 13.800 frases con expresiones multipalabra anotadas.

Su relevancia actual radica en que, a diferencia de pipelines clasicos que encadenan analizador morfologico y parser, este modelo no necesita el analizador morfologico en tiempo de inferencia: la decodificacion restringida por analizador (`parser.parse(..., analyzer=True)`) es opcional y solo aporta mejoras marginales en XPOS y lemas. La licencia Apache 2.0 y su tamano reducido lo hacen directamente desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa con cabezas multi-tarea de clasificacion de tokens (UPOS, XPOS, rasgos morfologicos, lemas, heads de dependencia, relaciones de dependencia) |
| Parametros totales | 146.109.171 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (arquitectura DeBERTa-base, tipicamente 512 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Leton (lv) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder preentrenado `AiLab-IMCS-UL/lv-deberta-base` y anade un esquema conjunto (joint) de analisis morfosintactico: en lugar de entrenar tareas separadas, un unico modelo predice simultaneamente UPOS, XPOS, rasgos morfologicos, lemas, cabezas de dependencia y relaciones de dependencia. Esto reduce la propagacion de errores entre etapas y simplifica el despliegue, ya que no requiere encadenar un analizador morfologico externo ni un lematizador independiente.

El entrenamiento se realizo en dos fases. En la primera se utilizo, ademas del treebank gold, un conjunto silver de 285.000 frases del Balanced Corpus of Modern Latvian (LVK2022) anotadas automaticamente por un ensemble de modelos anteriores con decodificacion restringida por analizador, junto con 13.800 frases con expresiones multipalabra anotadas. En la segunda fase se entreno unicamente sobre el treebank gold de UD 2.18. La decodificacion restringida por analizador es opcional en inferencia: cuando se activa (`parser.parse(..., analyzer=True)`) mejora ligeramente XPOS y lemas, pero no afecta a LAS. No se documenta en la informacion disponible el uso de RLHF o DPO, algo esperable en un modelo discriminativo de etiquetado y no generativo.

## Capacidades

- Etiquetado morfologico completo: categorias UPOS y XPOS para cada token.
- Prediccion de rasgos morfologicos (caso, numero, genero, tiempo, persona, etc.).
- Lematizacion integrada, sin necesidad de un lematizador externo.
- Analisis de dependencias: prediccion de cabeza sintactica (head) y etiqueta de relacion de dependencia (dependency relation), que permiten reconstruir el arbol sintactico.
- Analisis conjunto multi-tarea en una sola pasada de inferencia.
- Decodificacion restringida por analizador opcional, que mejora XPOS y lemas sin degradar LAS.
- Idiomas: exclusivamente leton (lv). No se documenta soporte multilingue.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Anotacion de corpus a gran escala: el modelo puede procesar grandes volumenes de texto leton para generar treebanks anotados con UPOS, XPOS, rasgos, lemas y dependencias, lo que resulta adecuado para construir recursos de entrenamiento o evaluacion en un idioma con recursos limitados.
- Preprocesado en pipelines de PLN para el leton: la salida lematizada y las etiquetas morfosintacticas sirven como entrada para tareas posteriores como reconocimiento de entidades, extraccion de relaciones, traduccion automatica o resumen.
- Normalizacion y enriquecimiento de bibliotecas digitales y archivos: permite indexar textos letones por lema y categoria gramatical, facilitando busquedas que distingan formas flexionadas de la misma palabra.
- Herramientas de aprendizaje de leton: un analizador que devuelve caso, numero, lema y funcion sintactica por token puede alimentar aplicaciones de analisis gramatical asistido para estudiantes.
- Busqueda y recuperacion de informacion: la lematizacion y el etiquetado permiten construir indices que agrupen variantes morfologicas y aplicar filtros por categoria gramatical en motores de busqueda sobre corpus letones.
- Validacion y control de calidad de anotaciones: al comparar las predicciones del modelo con anotaciones humanas se pueden detectar discrepancias e inconsistencias en esquemas de anotacion existentes.
- Extraccion de estructuras sintacticas para analisis de discurso o estilometria: las relaciones de dependencia permiten derivar patrones de subordinacion y orden de constituyentes en estudios linguisticos cuantitativos.
- Servicio de analisis bajo demanda: con 146 M de parametros y pesos en safetensors, el modelo puede exponerse como endpoint de token-classification (por ejemplo, via Hugging Face Inference Endpoints, dado el tag `endpoints_compatible`) con coste de infraestructura bajo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test del treebank leton de UD 2.18:

| Configuracion | XPOS | Lemmas | LAS |
|---|---:|---:|---:|
| Modelo solo | 95,20 | 98,62 | 93,49 |
| Con decodificacion restringida por analizador | 95,31 | 98,91 | 93,49 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, UAS u otros) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (146 M de parametros), en torno a 0,3 GB en FP16 y unos 0,15 GB en cuantizacion INT8, mas el consumo de activaciones, que es reducido al procesar secuencias de longitud moderada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionadas para este tamano de modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada actual e incluso en iGPU con memoria compartida suficiente.
- Ejecucion en CPU: viable para inferencia por lotes pequenos o medianos, dado que se trata de un encoder de 146 M de parametros.
- Opciones de despliegue: la libreria transformers (pipeline de token-classification), Inference Endpoints de Hugging Face (el modelo lleva el tag `endpoints_compatible`), y librerias de inferencia de encoders como ONNX Runtime o TorchScript. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `AiLab-IMCS-UL/lv_ud2.18_lv-deberta-base` | 146.109.171 | No disponible | XPOS 95,20 / Lemmas 98,62 / LAS 93,49 (UD 2.18 test) | Apache 2.0 | Hugging Face |
| `AiLab-IMCS-UL/lv-deberta-base` (modelo base) | No disponible | No disponible | No es un parser; solo encoder preentrenado | No disponible | Hugging Face |
| Analizadores UD genericos para leton (por ejemplo, pipelines basados en Stanza o UDPipe entrenados sobre el treebank leton de UD) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible |

No se dispone de datos numericos comparables de terceros en la informacion proporcionada, por lo que la comparacion cuantitativa queda limitada a los resultados del propio autor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible. Al entrenarse sobre un corpus equilibrado y un treebank concretos, el rendimiento puede degradarse en variedades dialectales, registros informales o texto de dominio especializado poco representados.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre. El riesgo equivalente es la asignacion de etiquetas, lemas o dependencias incorrectas, especialmente en oraciones largas, con estructuras ambiguas o con vocabulario fuera del dominio de entrenamiento.
- Limitaciones de idioma: el modelo solo soporta leton. No debe esperarse un comportamiento correcto en lituano, estonio, ruso ni en otros idiomas presentes en Letonia.
- Limitacion de contexto: no se especifica la longitud maxima de secuencia en la informacion proporcionada; en arquitecturas DeBERTa-base es habitual 512 tokens, por lo que textos largos requeriran segmentacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya la autoria. Conviene revisar las condiciones de los corpus de entrenamiento (UD y LVK2022) si se redistribuyen datos derivados.
- Caveats para produccion: la decodificacion restringida por analizador mejora XPOS y lemas de forma marginal (0,11 y 0,29 puntos respectivamente) y no afecta a LAS, por lo que puede omitirse si se prioriza simplicidad; el modelo no incluye segmentacion de oraciones ni tokenizacion de entrada, que deben resolverse aguas arriba; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de terceros.
- Idiomas y multilingue: no hay soporte multilingue ni traduccion; es un componente especializado dentro de un pipeline mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiLab-IMCS-UL/lv_ud2.18_lv-deberta-base
- Modelo base: https://huggingface.co/AiLab-IMCS-UL/lv-deberta-base
- Repositorio GitHub de LVNLP: https://github.com/LUMII-AILab/lvnlp
- Articulo (LREC 2026): https://lrec.elra.info/lrec2026-main-918
- DOI del articulo: https://doi.org/10.63317/5khpzsaiqrzw
- Proyecto Language Technology Initiative: https://www.vti.lu.lv
