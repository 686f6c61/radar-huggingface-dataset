# Alibaba-DAMO-Academy/ClinFusion-8B

## Resumen

ClinFusion-8B es un modelo de lenguaje multimodal de gran tamano (LLM) desarrollado por Alibaba DAMO Academy, disenado especificamente para comprension medica integral. Construido sobre la base de Qwen3-VL-8B-Instruct, integra un marco de codificador visual compuesto y en cascada que combina DINOv2 y ConvNeXt para ofrecer capacidades de razonamiento clinico de vanguardia. Su arquitectura compositiva permite procesar tanto imagenes medicas 2D estandar (radiografias, ecografias, histologia) como volumenes medicos 3D nativos en formato NIfTI (.nii.gz), lo que lo convierte en una solucion versatil para entornos clinicos reales.

La relevancia de ClinFusion-8B radica en su equilibrio entre capacidades de razonamiento clinico excepcionales y consumo de recursos gestionable, lo que lo hace adecuado para despliegue en el borde, asistentes clinicos en tiempo real e instituciones con presupuestos computacionales limitados. Con una licencia Apache 2.0, el modelo esta disponible de forma abierta para la comunidad investigadora y de desarrollo. Su tamano compacto de 8.000 millones de parametros no compromete su rendimiento, superando a modelos medicos abiertos de mayor tamano en multiples puntos de referencia de VQA 2D y 3D, generacion de informes medicos y seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B-Instruct con codificadores visuales compuestos (DINOv2 + CLIP-ConvNeXt) y operador de fusion Cascade Spatial-Aware Locality |
| Parametros totales | 8.000 millones (aproximadamente; el dato exacto de safetensors indica 3.396.528, que corresponde al tamano de un archivo individual, no al total del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles y chino (segun el repositorio de GitHub; el rendimiento en ingles es superior) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ClinFusion-8B adopta una arquitectura compositiva de vision que integra tres componentes principales: DINOv2 para semantica espacial densa, CLIP-ConvNeXt para caracteristicas estructurales y holisticas, y Qwen3-VL como modelo de lenguaje base. Estos componentes se optimizan mediante un operador de fusion denominado Cascade Spatial-Aware Locality Fusion, que permite combinar de forma eficiente las representaciones visuales de diferentes escalas y granularidades. Esta arquitectura esta disenada para manejar tanto imagenes 2D convencionales como volumenes 3D nativos, una capacidad poco comun en los modelos medicos multimodales actuales.

El modelo se entrena sobre la base de Qwen3-VL-8B-Instruct, que ya incorpora capacidades de razonamiento multimodal y seguimiento de instrucciones. Los detalles especificos del entrenamiento, como el numero de tokens, la composicion del dataset y el uso de tecnicas de RLHF o DPO, no estan disponibles en la informacion proporcionada. El modelo se evalua en el nuevo punto de referencia MedIF-Bench, disenado para medir el seguimiento de instrucciones en contextos medicos, asi como en tareas de generacion de informes clinicos y VQA 2D y 3D.

## Capacidades

- Comprension multimodal de imagenes medicas 2D: radiografias, ecografias, histologia y otras modalidades de imagen plana.
- Procesamiento de volumenes medicos 3D nativos: archivos NIfTI (.nii.gz) de tomografia computarizada (TC) y resonancia magnetica (RM).
- Razonamiento clinico de alto nivel: capacidad para responder preguntas de VQA (Visual Question Answering) sobre hallazgos, diagnosticos y pronosticos.
- Generacion de informes medicos estructurados: produce informes clinicos organizados y coherentes a partir de imagenes.
- Seguimiento de instrucciones medicas: evaluado en MedIF-Bench, mantiene capacidades de instruccion cercanas al modelo base Qwen3-VL-8B-Instruct.
- Soporte bilingue: opera en ingles y chino, con mejor rendimiento en ingles.
- Despliegue en el borde: su tamano compacto (8B) permite ejecucion en hardware con recursos limitados.

## Casos de uso

- Asistencia al diagnostico radiologico: un radiologo puede cargar una radiografia de torax y obtener una descripcion preliminar de hallazgos anormales, acelerando la revision inicial y priorizando casos urgentes. El modelo procesa la imagen 2D y genera texto en lenguaje natural con los hallazgos relevantes.
- Analisis de volumenes TC en urgencias: en un servicio de urgencias, el modelo puede procesar un volumen TC craneal completo (formato NIfTI) para detectar signos de hemorragia o fracturas, proporcionando una evaluacion preliminar mientras el radiologo de guardia revisa el caso.
- Generacion automatizada de informes de ecografia: un sistema de informacion radiologica puede integrar ClinFusion-8B para generar borradores de informes ecograficos a partir de las imagenes capturadas, reduciendo el tiempo de dictado y estandarizando la estructura de los informes.
- Educacion medica y formacion de residentes: los estudiantes de medicina pueden interactuar con el modelo para practicar la interpretacion de imagenes medicas, recibiendo explicaciones detalladas sobre hallazgos radiologicos y su correlacion clinica.
- Telemedicina en entornos con recursos limitados: hospitales rurales o centros de salud con presupuesto computacional reducido pueden desplegar ClinFusion-8B en hardware local para obtener apoyo diagnostico sin depender de servicios en la nube, gracias a su equilibrio entre rendimiento y requisitos de hardware.
- Investigacion clinica y extraccion de datos: los investigadores pueden utilizar el modelo para procesar grandes volumenes de imagenes medicas y extraer hallazgos estructurados que alimenten bases de datos de investigacion o estudios retrospectivos.
- Segunda opinion y control de calidad: los departamentos de radiologia pueden emplear el modelo como verificador independiente, comparando sus hallazgos con los informes emitidos por los radiologos para detectar discrepancias u omisiones.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que ClinFusion-8B supera a modelos abiertos comparables como Hulu-Med y Lingshu-8B en MedIF-Bench (evaluacion de seguimiento de instrucciones), generacion de informes clinicos y multiples puntos de referencia de VQA 2D y 3D. Tambien se menciona que exhibe un rendimiento competitivo frente a sistemas medicos propietarios. Para metricas completas, se remite al articulo de arXiv (2607.24743).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo de 8B parametros en precision FP16 requiere aproximadamente 16 GB de VRAM solo para los pesos, y mas para el contexto y las activaciones.
- GPU recomendadas: no disponible oficialmente. Por su tamano, seria ejecutable en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB), y en GPUs de centro de datos como A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: probablemente si, en GPUs con 24 GB de VRAM o mas, especialmente con cuantizacion (aunque no se especifican tipos de cuantizacion disponibles).
- Opciones de despliegue: el repositorio de GitHub proporciona instrucciones de instalacion mediante `uv`, asi como scripts de inferencia y evaluacion. No se mencionan integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinFusion-8B | 8B | no disponible | Vision medica 2D/3D | Apache 2.0 | Abierto (HuggingFace) |
| Hulu-Med | no disponible | no disponible | Vision medica | no disponible | Abierto (segun la model card) |
| Lingshu-8B | 8B | no disponible | Vision medica | no disponible | Abierto (segun la model card) |

Segun la informacion de la model card, ClinFusion-8B supera a Hulu-Med y Lingshu-8B en MedIF-Bench, generacion de informes clinicos y VQA 2D/3D. No se dispone de datos detallados de estos modelos comparables para una comparacion exhaustiva.

## Limitaciones y advertencias

- La informacion sobre la longitud de contexto, tipos de cuantizacion y datos de entrenamiento detallados no esta disponible, lo que dificulta la evaluacion completa de sus capacidades y limitaciones.
- El rendimiento declarado se basa en las afirmaciones de los autores; los resultados independientes de terceros aun no estan disponibles.
- Aunque soporta ingles y chino, el rendimiento en ingles es superior, lo que puede limitar su uso en entornos clinicos hispanohablantes sin una capa de traduccion adicional.
- No se especifican sesgos conocidos ni riesgos de alucinacion. Como todo LLM medico, existe riesgo de generar informacion clinica incorrecta o inventada, por lo que no debe utilizarse como unico criterio para decisiones diagnosticas.
- El procesamiento de volumenes 3D puede requerir recursos computacionales significativamente mayores que las imagenes 2D, aunque el modelo esta optimizado para ello.
- No se proporciona informacion sobre la procedencia y composicion de los datos de entrenamiento, lo que impide evaluar posibles sesgos en poblaciones o modalidades de imagen especificas.
- Para uso en produccion clinica, se recomienda una validacion exhaustiva en el entorno especifico de despliegue y la supervision de profesionales sanitarios cualificados.

## Enlaces

- HuggingFace: https://huggingface.co/Alibaba-DAMO-Academy/ClinFusion-8B
- Repositorio GitHub: https://github.com/alibaba-damo-academy/ClinFusion
- Articulo arXiv: https://arxiv.org/abs/2607.24743
- PDF del articulo: https://arxiv.org/pdf/2607.24743
- Demo en navegador: disponible a traves del repositorio de GitHub (segun el changelog del repositorio)
