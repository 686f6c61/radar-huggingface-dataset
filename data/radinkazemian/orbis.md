# Radinkazemian/orbis

## Resumen
Orbis es un pipeline de generacion 3D unificado y consciente de la profundidad, publicado en HuggingFace por el usuario Radinkazemian bajo licencia Apache 2.0. A diferencia de un modelo generativo convencional, Orbis no es un unico checkpoint entrenado de extremo a extremo: se trata de una capa de orquestacion que encadena automaticamente varios modelos upstream para convertir texto o una imagen en una malla 3D. El usuario solo aporta un prompt o una imagen, y el sistema decide que etapas ejecutar sin exponer configuracion de backends de geometria o profundidad.

El flujo automatico declarado por el autor es el siguiente: para entrada de imagen, aplica estimacion de profundidad con DepthPro o Marigold, seguida de geometria con TripoSR y refinado de malla con LLaMA-Mesh. Para entrada de texto, genera geometria con Shap-E y refina con LLaMA-Mesh. Adicionalmente incluye una etapa de sintesis de vistas novedosas mediante VAST-AI/TripoSplat para renderizado por splats.

Su relevancia actual radica en que empaqueta en una sola interfaz varios modelos de generacion 3D de referencia (TripoSR, Shap-E, Marigold, DepthPro) y no requiere clave de API ni token de HuggingFace. Es un repositorio con muy poca traccion (27 descargas y 0 likes en el momento de la consulta) y no redistribuye pesos upstream, sino que los referencia por sus licencias y arquitecturas originales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de orquestacion sobre modelos upstream (no es un unico transformer entrenado) |
| Parametros totales | no disponible (suma de varios modelos upstream, sin dato agregado publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la entrada de texto depende del soporte de Shap-E y LLaMA-Mesh, no documentado en la ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene codigo de orquestacion y configuracion; los pesos upstream no se redistribuyen) |

## Arquitectura y entrenamiento
Orbis no entrena un modelo unificado. El autor indica explicitamente que "un checkpoint fusionado real requeriria entrenar los modelos componente en una arquitectura comun", por lo que el repositorio actua como orquestador que carga archivos publicos de otros repositorios y los encadena. Las etapas declaradas son: estimacion de profundidad (DepthPro o Marigold) para entradas de imagen, generacion de geometria (TripoSR en el caso de imagen, Shap-E en el caso de texto), refinado de malla mediante LLaMA-Mesh y una etapa opcional de sintesis de vistas con TripoSplat.

El autor no documenta numero de tokens de entrenamiento, composicion del dataset, ni procesos de alineacion tipo RLHF o DPO, ya que no entrena el pipeline como tal. Una innovacion destacable es la seleccion automatica de la cadena de etapas segun el tipo de entrada (texto o imagen), sin exponer parametros de backend al usuario. `microsoft/TRELLIS-text-xlargeZ` aparece mencionado pero esta deshabilitado porque no esta disponible en el Hub.

## Capacidades
- Generacion 3D a partir de texto: convierte un prompt en una malla mediante geometria Shap-E y refinado LLaMA-Mesh.
- Generacion 3D a partir de una imagen: reconstruye geometria con TripoSR tras estimar profundidad con DepthPro o Marigold.
- Estimacion de profundidad: usa modelos dedicados (DepthPro, Marigold) como etapa intermedia del pipeline de imagen.
- Refinado de malla: aplica LLaMA-Mesh para mejorar la geometria generada.
- Sintesis de vistas novedosas: incorpora VAST-AI/TripoSplat para renderizado por splats y generacion de vistas.
- Orquestacion automatica: selecciona y ejecuta las etapas correctas sin intervencion manual.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- El soporte multilingue no esta declarado; depende de los modelos upstream de texto.

## Casos de uso
- Prototipado rapido de assets 3D: un disenador escribe un prompt descriptivo y obtiene una malla preliminar para iterar antes de modelar en detalle, gracias a la cadena Shap-E mas LLaMA-Mesh.
- Reconstruccion 3D desde una sola fotografia: a partir de una imagen de referencia, el pipeline estima profundidad y genera geometria, util para digitalizar objetos sin escaner dedicado.
- Visualizacion de productos en comercio electronico: convertir fotos de catalogo en mallas 3D para vistas interactivas en tienda online.
- Previsualizacion en pipelines de videojuegos: generar mallas base a partir de conceptos de texto para blockout de niveles o props.
- Generacion de datasets sinteticos: usar la etapa TripoSplat para producir vistas novedosas de un objeto y ampliar datos de entrenamiento de vision por computador.
- Preparacion de modelos para impresion 3D: obtener una malla inicial refinada que despues se postprocese (reparacion de topologia, escalado) en herramientas de impresion.
- Realidad aumentada: crear assets 3D ligeros a partir de imagenes de producto para superponer en escenas AR.
- Investigacion en generacion 3D: servir como banco de pruebas para comparar combinaciones de modelos de profundidad, geometria y refinado dentro de un mismo flujo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (por ejemplo Chamfer Distance, F-Score, PSNR de vistas novedosas) ni comparaciones numericas con otros pipelines.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. Al encadenar varios modelos (DepthPro o Marigold, TripoSR o Shap-E, LLaMA-Mesh y, opcionalmente, TripoSplat), el consumo depende de cuantas etapas se ejecuten y del modelo de profundidad elegido; no se documenta un requisito agregado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado. La ejecucion de varios modelos 3D en serie hace probable que se requiera una GPU con VRAM dedicada, pero el autor no especifica minimos.
- Opciones de despliegue: el repositorio usa la libreria `transformers` y expone una clase `OrbisPipeline` importable desde `orbis_pipeline`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a generacion 3D).
- Latencia y throughput estimados: no disponible. Al ser un pipeline secuencial de varias etapas, la latencia acumulada por peticion sera la suma de todas las etapas ejecutadas.

## Comparativa con modelos similares
No se dispone de datos de rendimiento publicados para Orbis, por lo que la comparacion es estructural y no cuantitativa.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Estado en Orbis |
|---|---|---|---|---|---|
| Orbis | Orquestacion de varios modelos 3D | no disponible (agregado) | no aplica | apache-2.0 | Modelo analizado |
| TripoSR | Imagen a 3D basado en transformer | no disponible en la informacion | no disponible | no disponible en la informacion | Usado como etapa de geometria para imagen |
| Shap-E | Texto/imagen a 3D (difusion) | no disponible en la informacion | no disponible | no disponible en la informacion | Usado como etapa de geometria para texto |
| LLaMA-Mesh | Generacion de mallas como texto | no disponible en la informacion | no disponible | no disponible en la informacion | Usado como etapa de refinado |

No se dispone de cifras de benchmarks ni de la licencia concreta de cada componente dentro de la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable.

## Limitaciones y advertencias
- No es un modelo unificado: la calidad final depende enteramente de la calidad de los modelos upstream encadenados, y los errores se pueden acumular etapa a etapa.
- No redistribuye pesos: el repositorio referencia repositorios externos, por lo que la disponibilidad y las licencias de esos pesos pueden cambiar sin control del autor.
- `microsoft/TRELLIS-text-xlargeZ` no esta disponible en el Hub y permanece deshabilitado, lo que limita parte de la funcionalidad prevista.
- Ausencia de benchmarks: no hay evidencia publicada de calidad geometrica, fidelidad o tiempo de inferencia.
- Adopcion muy baja: 27 descargas y 0 likes, lo que implica escasa validacion por parte de la comunidad.
- Licencia del repositorio Apache 2.0, pero las licencias de los modelos upstream (TripoSR, Shap-E, Marigold, DepthPro, LLaMA-Mesh, TripoSplat) pueden ser distintas y condicionar el uso comercial; deben verificarse por separado.
- Riesgo de alucinacion geometrica: los modelos generativos de 3D pueden producir mallas incoherentes o con topologia defectuosa, especialmente con prompts ambiguos.
- Soporte de idiomas no declarado, lo que puede degradar la generacion a partir de texto en idiomas distintos del ingles si los modelos upstream no los cubren.
- Fecha de creacion indicada como 2026-09-21, posterior a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar su madurez.

## Enlaces
- HuggingFace: https://huggingface.co/Radinkazemian/orbis
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repos o demos) en los resultados de busqueda web proporcionados; los resultados devueltos no guardan relacion con el modelo.
