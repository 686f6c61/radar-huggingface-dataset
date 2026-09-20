# mrinal22258/floorgen

## Resumen

FloorGen es un sistema de generacion de planos de planta vectoriales publicado en HuggingFace por el autor Kumar Mrinal (usuario mrinal22258) bajo el identificador `mrinal22258/floorgen`. No es un modelo de lenguaje ni un modelo fundacional de pesos unicos, sino un pipeline multi-etapa que combina recuperacion aumentada (RAG) sobre un corpus de planos reales, difusion de coordenadas continuas y un solucionador combinatorio de restricciones para producir geometria CAD regularizada. La version documentada en la model card es la 1.3.0.

El sistema indexa los conjuntos de datos RPLAN (80.788 planos) y ResPlan mediante un almacen vectorial denso FAISS de 384 dimensiones combinado con un grafo topologico relacional, y genera las coordenadas de las habitaciones con un nucleo de difusion DDIM condicionado por atencion cruzada y capas RGCN. Despues extrae las lineas centrales de los muros, decodifica el raster con un VQ-VAE de 512 entradas de libro de codigos y aplica Google OR-Tools CP-SAT para garantizar el no solapamiento de estancias y las areas minimas, con un tiempo de resolucion declarado inferior a 8 ms.

Su relevancia radica en que se presenta como una plataforma 100% local y sin coste de nube, con exportacion directa a DXF, SVG e IFC BIM (ISO-16739) y un runner autonomo (`run.py`) que cubre instalacion, verificacion de checkpoints, pruebas y sintesis. En el momento de la consulta el repositorio figura con 0 descargas, 0 likes y un tamano de 0,0 GB, por lo que se trata de una publicacion reciente y sin traccion verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa: RAG dual (FAISS de 384 dimensiones + grafo topologico relacional), difusion de coordenadas continuas con muestreo DDIM, capas RGCN y atencion cruzada multi-cabeza, decodificador raster VQ-VAE y solucionador CP-SAT |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la condicion de entrada es un brief de texto y los ejemplos recuperados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card no declara checkpoints ni formato de pesos) |
| Desarrollador | Kumar Mrinal (mrinal22258) |
| Version declarada | 1.3.0 |
| Fecha de creacion segun HuggingFace | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado en HuggingFace | no disponible |
| Formatos de salida | AutoCAD DXF (9 capas), SVG vectorial escalable, IFC BIM (ISO-16739) |
| Entorno de ejecucion | Docker con soporte CUDA, Python 3.10 / 3.11 / 3.12, FastAPI v1.3.0, Gradio 4.44.0 |
| Dependencias principales | FAISS, Google OR-Tools CP-SAT, VQ-VAE, servidor local Ollama con un modelo Qwen |

## Arquitectura y entrenamiento

El sistema se descompone en seis etapas desacopladas. La etapa 0 ingiere y parsea el corpus (RPLAN, 80.788 planos, y ResPlan), normaliza fronteras no Manhattan, valida topologia de variedad y construye grafos de burbujas relacionales. La etapa 1 monta un doble almacen de recuperacion: un espacio vectorial semantico denso de 384 dimensiones indexado con FAISS y un grafo topologico con emparejamiento por isomorfismo de subgrafos, combinados mediante un ranking hibrido definido como `S_hybrid = 0,65 * S_dense + 0,35 * S_topo` para recuperar los `k` ejemplares arquitectonicos mas cercanos.

La etapa 2 es el nucleo generativo: un modelo de difusion que predice coordenadas limpias de delimitacion `X_0` en `R^(N x 4)` a partir de ruido, con muestreo inverso acelerado DDIM y capas intercaladas de convolucion de grafo relacional (RGCN) y atencion cruzada multi-cabeza condicionadas por los ejemplos recuperados, usando un calendario de varianza coseno. La etapa 3 extrae las lineas centrales de los muros distinguiendo envolventes exteriores de 200 mm y particiones interiores de 100 mm, clasifica los nodos estructurales en uniones en L (esquinas), T (intersecciones de muro) y X (nodos de pasillo) y decodifica el raster con un VQ-VAE de 512 entradas y un decodificador convolucional de superresolucion. La etapa 4 aplica OR-Tools CP-SAT para imponer `AddNoOverlap2D`, areas funcionales minimas y cotas de relacion de aspecto, y coloca mobiliario guiado por holguras. La etapa 5 corresponde a la evaluacion de cumplimiento normativo; su descripcion aparece truncada en la model card.

No se especifican en la informacion proporcionada los detalles de entrenamiento del nucleo de difusion: numero de tokens o muestras, composicion exacta del dataset de entrenamiento, funcion de perdida, numero de pasos de difusion, si hubo ajuste por RLHF/DPO ni la procedencia de los checkpoints. La model card cita como inspiracion estructural el trabajo GSDiff y referencia un PDF (`paper.pdf`) con la arquitectura formal, pero no se incluyen sus contenidos.

## Capacidades

- Generacion de planos de planta vectoriales a partir de un brief en lenguaje natural, con un ejemplo declarado: "Modern 3-bedroom apartment with open kitchen, spacious living room, master ensuite, and sunset balcony".
- Recuperacion aumentada sobre corpus arquitectonicos reales mediante indice vectorial FAISS de 384 dimensiones combinado con coincidencia por isomorfismo de subgrafos.
- Generacion de geometria CAD regularizada mediante difusion de coordenadas continuas con muestreo DDIM acelerado.
- Extraccion y clasificacion de grafos de muros, distinguiendo muros exteriores (200 mm) de interiores (100 mm) y nodos L, T y X.
- Decodificacion raster de superresolucion con VQ-VAE de 512 entradas de libro de codigos.
- Resolucion de restricciones geometricas duras (no solapamiento, areas minimas, relaciones de aspecto) con Google OR-Tools CP-SAT.
- Colocacion automatizada de mobiliario guiado por holguras: camas king con mesillas laterales, conjuntos de salon, encimeras de cocina y sanitarios conformes con ADA.
- Exportacion a AutoCAD DXF (9 capas), SVG vectorial escalable e IFC BIM (ISO-16739) como modelo fisico STEP.
- Auditoria de cumplimiento de codigo arquitectonico IRC/IBC, declarada al 94,1% de verificacion.
- Interpretacion de briefs en lenguaje natural mediante un modelo Qwen servido localmente con Ollama.
- Interfaces de uso: estudio web Gradio (puerto 7860), API REST FastAPI (puerto 8000, con documentacion en `/docs`) y linea de comandos unificada (`run.py`).
- No hay informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Anteproyecto residencial rapido: a partir de un brief textual como el del ejemplo, el sistema propone una distribucion vectorial completa con muros clasificados y mobiliario, reduciendo el tiempo hasta una primera variante CAD frente al dibujo manual.
- Exploracion de alternativas de distribucion: el solucionador CP-SAT garantiza no solapamiento y areas minimas en menos de 8 ms, lo que permite iterar sobre muchas variantes de un mismo programa funcional y compararlas antes de fijar una propuesta.
- Generacion de datasets sinteticos etiquetados: la salida incluye grafo topologico, muros clasificados por tipo de union y raster decodificado, lo que sirve para aumentar corpus de entrenamiento o validacion en investigacion sobre generacion de planos.
- Pre-validacion normativa: la auditoria IRC/IBC integrada permite descartar automaticamente propuestas que incumplan reglas de areas o solapamientos antes de la revision humana, como filtro previo en un flujo de trabajo de estudio de arquitectura.
- Integracion en pipelines CAD y BIM: la exportacion directa a DXF con 9 capas e IFC BIM permite insertar la salida en herramientas de delineacion y en entornos BIM sin conversion manual intermedia.
- Visualizacion inmobiliaria y staging: la colocacion automatica de mobiliario con criterios de holgura (camas con mesillas, sanitarios conformes ADA) permite producir imagenes y planos amueblados para marketing de promociones.
- Servicio interno de diseno: el despliegue como API REST con FastAPI y Docker con CUDA facilita exponer la generacion de planos como microservicio dentro de una herramienta corporativa de diseno.
- Docencia e investigacion en generacion geometrica: el pipeline es modular y verificable etapa por etapa, con registro de la trayectoria de difusion inversa, lo que lo hace util como material didactico sobre difusion condicionada y satisfaccion de restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo que es coherente con que FloorGen no sea un modelo de lenguaje. Los unicos datos cuantitativos declarados por el autor son los siguientes.

| Metrica | Valor | Nota |
|---|---|---|
| Suite de tests automatizados | 53/53 superados | Tests unitarios y de regresion del propio repositorio |
| Cumplimiento normativo IRC/IBC | 94,1% verificado | Auditoria de codigo arquitectonico declarada por el autor |
| Tiempo de resolucion CP-SAT | inferior a 8 ms | Resolucion combinatoria de restricciones |
| Ranking de recuperacion | 0,65 denso + 0,35 topologico | Formula `S_hybrid` declarada en la model card |

Estos valores proceden exclusivamente de la model card y no han podido contrastarse con evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica requisitos de memoria ni tamano de los componentes generativos.
- GPU recomendadas: no disponible. El repositorio se distribuye como imagen Docker con soporte CUDA, pero no se especifica ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no disponible. No se indica si el pipeline cabe en tarjetas tipo RTX 4090 u otras.
- Dependencia de un servidor local: se requiere ejecutar Ollama con un modelo Qwen para el parseo de briefs en lenguaje natural; el tamano concreto de ese modelo no se especifica.
- Almacenamiento e indice: el sistema construye un indice FAISS sobre 80.788 planos de RPLAN mas ResPlan, ademas de un grafo topologico; no se indica el espacio en disco ni la RAM necesarios para construir o consultar dichos indices.
- Opciones de despliegue: Docker con CUDA, servidor FastAPI (`run.py --api`, puerto 8000) y estudio Gradio (`run.py --demo`, puerto 7860). No se mencionan vLLM, llama.cpp, Ollama como motor de inferencia del modelo principal ni TGI.
- Latencia y throughput: el unico dato disponible es el tiempo de resolucion del solucionador CP-SAT, inferior a 8 ms. No hay cifras de latencia del nucleo de difusion ni de la decodificacion VQ-VAE.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos con alternativas. El unico trabajo citado en la model card es GSDiff, mencionado como inspiracion para la difusion del grafo estructural de muros, pero sin cifras de rendimiento asociadas.

| Sistema | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FloorGen 1.3.0 | no disponible | no disponible | 53/53 tests, 94,1% IRC/IBC, CP-SAT < 8 ms | MIT | Repositorio HuggingFace con 0,0 GB y 0 descargas |
| GSDiff (citado como inspiracion) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otras alternativas de generacion de planos (HouseDiffusion, RPLAN como dataset de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio figura con 0,0 GB de tamano y 0 descargas: no hay evidencia de que los pesos o checkpoints esten publicados, lo que impide reproducir el sistema solo con la informacion de HuggingFace.
- La model card esta truncada: la descripcion de la etapa 5 (verificacion de cumplimiento de codigo y evaluacion en tiempo real) aparece cortada, por lo que se desconoce como se calcula y sobre que normativa exacta se aplica el 94,1% declarado.
- No se documentan los detalles de entrenamiento del nucleo de difusion (datos, perdida, pasos, procedimiento de ajuste), lo que limita la evaluacion tecnica independiente.
- El cumplimiento IRC/IBC declarado es del 94,1%, es decir, existe un margen aproximado del 5,9% de casos no conformes; cualquier salida debe pasar por revision de un profesional cualificado antes de su uso real.
- Dependencia de componentes externos: el parseo de lenguaje natural recurre a Ollama con un Qwen local, cuyas condiciones de licencia, version y rendimiento no se detallan.
- Los conjuntos de datos empleados (RPLAN y ResPlan) tienen sus propias condiciones de uso que no se explicitan; la licencia MIT del repositorio no cubre necesariamente dichos datos ni los modelos derivados de ellos.
- Riesgo de alucinacion geometrica: aunque el solucionador CP-SAT impone restricciones duras de no solapamiento y area, la etapa de difusion puede generar topologias o muros fisicamente inconsistentes que el postprocesado no siempre corrija.
- No se declara ninguna limitacion de idioma, sesgo demografico ni cobertura geografica de los planos generados; el corpus RPLAN procede de una tipologia residencial concreta, lo que puede sesgar las distribuciones hacia ese estilo.
- Las fechas de creacion y actualizacion indicadas por HuggingFace (2026-09-20) son inconsistentes con la fecha de consulta habitual y conviene verificarlas antes de citarlas.
- No hay informacion sobre tool calling, agentes, vision, audio ni soporte multilingue; no debe asumirse ninguna de estas capacidades.
- Los resultados de busqueda web asociados a esta consulta no guardan relacion con el modelo y no aportan verificacion externa alguna.

## Enlaces

- HuggingFace: https://huggingface.co/mrinal22258/floorgen
- Perfil del autor en GitHub: https://github.com/mrinal22258
- Paper de arquitectura formal citado en la model card: `paper.pdf` (referenciado de forma relativa, sin URL absoluta disponible)
- Documentacion de la API REST declarada por el autor: http://localhost:8000/docs (solo tras despliegue local)
- Estudio Gradio declarado por el autor: http://localhost:7860 (solo tras despliegue local)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a herramientas y discusiones sobre ChatGPT y no guardan relacion con FloorGen.
