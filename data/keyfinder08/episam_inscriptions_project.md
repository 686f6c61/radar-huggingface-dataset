# keyfinder08/EpiSAM_Inscriptions_Project

## Resumen

EpiSAM es un conjunto de pesos publicado en Hugging Face por el usuario keyfinder08 dentro del proyecto EpiSAM_Inscriptions_Project, orientado a la segmentacion de caracteres en inscripciones sobre piedra. No es un modelo de lenguaje: se trata de un modulo de vision por computador compuesto por dos checkpoints, `episam.pth` (modulo de segmentacion) y `binarizer.pth` (binarizador empleado en el modulo de auto-prompting o self-prompting). El modelo procede del grupo de investigacion responsable del sitio del proyecto alojado en el dominio ihdia.iiit.ac.in, y esta vinculado a dos publicaciones: una en ICDAR 2026 sobre segmentacion de caracteres en inscripciones lapideas complejas y otra en ICVGIP 2025 sobre binarizacion mediante una estrategia de parcheado sensible al contexto de caracter.

El problema que aborda es concreto y poco cubierto por los modelos genericos: las inscripciones en piedra presentan desgaste, iluminacion irregular, texturas heterogeneas y caracteres parcialmente erosionados, lo que degrada los pipelines clasicos de OCR y de analisis documental historico. EpiSAM se presenta como una pieza especifica para esa fase del proceso, combinando segmentacion y binarizacion, y se distribuye junto con un conjunto de datos descrito en el sitio del proyecto.

La relevancia actual del artefacto es acotada pero clara: cero descargas y cero likes en el momento de la consulta, repositorio de 0,5 GB, licencia CC BY-SA 4.0 y sin arquitectura, numero de parametros ni resultados de benchmarks documentados en la informacion disponible. Su interes principal es para investigadores en epigrafia computacional, patrimonio digital y analisis de documentos historicos que necesiten integrar un modulo especializado de segmentacion lapidea en lugar de reentrenar un modelo generico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la denominacion EpiSAM y la existencia de un modulo de self-prompting apuntan a un esquema de segmentacion promptable, pero la informacion proporcionada no especifica la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas ni formatos reducidos) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; los textos objetivo de las inscripciones no se especifican) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.pth` (checkpoints de PyTorch) |
| Numero de checkpoints | 2 (`episam.pth` para segmentacion, `binarizer.pth` para el binarizador) |
| Tamano del repositorio | 0,5 GB |
| Tarea principal | segmentacion de caracteres en inscripciones lapideas |
| Dataset asociado | descrito en el sitio del proyecto (`https://ihdia.iiit.ac.in/episam/`) |
| Codigo de entrenamiento | disponible en el repositorio de GitHub referenciado desde el sitio del proyecto |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna, el numero de parametros, la resolucion de entrada ni el esquema de entrenamiento. Lo que si se explicita es la descomposicion funcional en dos modulos: un modulo de segmentacion (`episam.pth`) y un binarizador (`binarizer.pth`) que actua dentro de un modulo de self-prompting. La presencia de este ultimo sugiere un flujo en el que el propio modelo genera indicaciones o mascaras preliminares que despues refina, un patron habitual en arquitecturas de segmentacion promptable, aunque la model card no confirma esta interpretacion.

En cuanto a los datos, las imagenes de inscripciones proceden de The Mythic Society Bengaluru, en el marco del proyecto Inscriptions 3D Digital Conservation Project (Akshara Bhandara). No se especifican el volumen del dataset, la composicion por script o periodo historico, el numero de imagenes de entrenamiento, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco plausibles en un modelo de segmentacion). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La contribucion tecnica declarada por los autores en el articulo de ICVGIP 2025 es una estrategia de parcheado sensible al contexto de caracter para la binarizacion, y en el articulo de ICDAR 2026 la segmentacion de caracteres en inscripciones complejas.

## Capacidades

- Segmentacion de caracteres en imagenes de inscripciones sobre piedra, incluidas condiciones de desgaste y ruido visual.
- Binarizacion de texto en inscripciones lapideas mediante un modulo especifico (`binarizer.pth`).
- Auto-prompting: generacion interna de indicaciones o mascaras de apoyo para el proceso de segmentacion.
- Procesamiento de documentos historicos digitalizados o fotografiados, segun los tags del repositorio (`historical_document`, `inscriptions`, `stone_inscriptions`).
- Integracion en pipelines de analisis documental previos a OCR, ya que la segmentacion y binarizacion son etapas tipicamente anteriores al reconocimiento de caracteres.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; no se especifican los scripts o idiomas de las inscripciones tratadas.
- Capacidades especiales (modo thinking, vision, audio): vision, en la vertiente concreta de segmentacion y binarizacion de documentos historicos; sin datos adicionales.

## Casos de uso

- Digitalizacion de patrimonio epigrafico: el modulo de segmentacion aísla caracteres individuales en fotografias de inscripciones erosionadas, lo que permite alimentar posteriormente un sistema de reconocimiento optico de caracteres especializado en escrituras historicas.
- Preprocesado para OCR de inscripciones: el binarizador separa texto y fondo en imagenes con iluminacion irregular, reduciendo el ruido de entrada de los motores de reconocimiento y mejorando potencialmente su tasa de acierto.
- Catalogacion academica de corpus epigraficos: investigadores pueden segmentar automaticamente inscripciones completas y generar indices de caracteres para estudios paleograficos comparativos entre periodos y regiones.
- Conservacion y documentacion 3D: en proyectos como el Inscriptions 3D Digital Conservation Project, la segmentacion facilita anotar y etiquetar modelos o fotografias de inscripciones para su archivo digital a largo plazo.
- Creacion y anotacion de datasets: el modulo de self-prompting puede emplearse para preanotar mascaras de caracteres que despues se revisan manualmente, reduciendo el coste de construir corpus supervisados de epigrafia.
- Analisis de deterioro documental: la comparacion de segmentaciones sobre la misma inscripcion en distintas fechas permitiria detectar cambios en la legibilidad o en la superficie de la piedra.
- Apoyo a la traduccion y estudio filologico: la salida del pipeline, una vez reconocidos los caracteres, sirve de entrada a herramientas de transliteracion y analisis linguistico de inscripciones.
- Investigacion en vision por computador aplicada a documentos historicos: el modelo sirve como linea base o componente de comparacion frente a modelos genericos de segmentacion en dominios con texturas y fondos atipicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los articulos asociados (ICDAR 2026 e ICVGIP 2025) probablemente contienen evaluaciones cuantitativas, pero sus cifras no forman parte de la informacion proporcionada en esta ficha. No se incluye ninguna estimacion propia para no introducir datos no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa 0,5 GB e incluye dos checkpoints, por lo que, como estimacion orientativa basada unicamente en el tamano de los pesos, la inferencia en precision completa deberia caber en el rango de 1 a 2 GB de VRAM, mas el consumo adicional de activaciones segun la resolucion de imagen de entrada. Esta cifra es una estimacion, no un dato publicado.
- GPU recomendadas: no especificadas por los autores. Por tamano de pesos, cualquier GPU con al menos 4 GB de memoria deberia ser suficiente; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 no representan una restriccion por capacidad de memoria para este tipo de carga.
- Viabilidad en GPU de consumo: probablemente alta dado el tamano del repositorio, aunque no esta confirmado por los autores. La inferencia en CPU tambien es plausible para procesamiento por lotes sin requisitos de latencia estrictos.
- Opciones de despliegue: al distribuirse como checkpoints `.pth`, el despliegue natural es PyTorch con carga directa del estado del modelo. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que corresponden a modelos de lenguaje y no aplican a esta carga. Tampoco se documenta una exportacion oficial a ONNX o TorchScript.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EpiSAM | Segmentacion y binarizacion de caracteres en inscripciones lapideas | no disponible | no aplica | CC BY-SA 4.0 | Pesos `.pth` en Hugging Face, 0 descargas |
| SAM (Segment Anything Model, Meta) | Segmentacion promptable de proposito general | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Publico |
| SAM 2 (Meta) | Segmentacion promptable en imagen y video | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Publico |
| Herramientas clasicas de binarizacion (por ejemplo, umbralizado adaptativo tipo Sauvola) | Binarizacion de documentos | no aplica | no aplica | variable segun implementacion | Amplitud de implementaciones |

No se dispone de datos comparativos de rendimiento entre EpiSAM y estos sistemas en la informacion proporcionada. Las filas correspondientes a alternativas se han dejado como "no disponible" cuando no consta el dato, en lugar de completarlas con cifras no verificadas en esta ficha.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al operar sobre imagenes de un corpus concreto (inscripciones del sur de la India aportadas por The Mythic Society Bengaluru), su generalizacion a otros alfabetos, soportes o condiciones de captura es incierta y no esta cuantificada.
- Riesgo de alucinacion: en un modelo de segmentacion el equivalente seria generar mascaras o regiones inexistentes o fusionar caracteres adyacentes, especialmente en inscripciones muy erosionadas. No hay datos publicados sobre la tasa de error.
- Limitaciones de contexto o idioma: se desconoce que scripts o lenguas cubre el dataset de entrenamiento; no se debe asumir cobertura multilingue.
- Licencia: CC BY-SA 4.0 permite uso comercial, pero impone atribucion y obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar sus adaptaciones. Conviene revisar la interaccion de esta licencia con las condiciones de uso de las imagenes originales de The Mythic Society.
- Procedencia de los datos: las imagenes pertenecen al proyecto Inscriptions 3D Digital Conservation Project, con condiciones propias que deben verificarse antes de reutilizarlas o redistribuirlas.
- Ausencia de informacion operativa: no hay ficha de parametros, resolucion de entrada, tareas exactas de salida, ni instrucciones de inferencia en la model card; el flujo de uso depende del codigo de GitHub enlazado desde el sitio del proyecto.
- Madurez del repositorio: cero descargas, cero likes y una unica version publicada; no existe evidencia de mantenimiento ni de soporte a usuarios.
- En produccion, la ausencia de benchmarks publicos en esta informacion impide estimar su ventaja frente a alternativas genericas de segmentacion o frente a pipelines clasicos de binarizacion.

## Enlaces

- Hugging Face: https://huggingface.co/keyfinder08/EpiSAM_Inscriptions_Project
- Sitio del proyecto EpiSAM: https://ihdia.iiit.ac.in/episam/
- Repositorio de GitHub con el codigo de entrenamiento: referenciado desde el sitio del proyecto, URL directa no disponible en la informacion proporcionada
- Articulo ICDAR 2026: Sharma, Jena, Joseph y Sarvadevabhatla, "EpiSAM: Character Segmentation in Challenging Stone Inscriptions", Document Analysis and Recognition - ICDAR 2026, Springer Nature Switzerland, paginas 299-315, ISBN 978-3-032-36039-7
- Articulo ICVGIP 2025: Jena, Joseph, Sharma y Sarvadevabhatla, "Unveiling Text in Challenging Stone Inscriptions: A Character-Context-Aware Patching Strategy for Binarization", DOI 10.1145/3774521.3774539, https://doi.org/10.1145/3774521.3774539
- Proyecto Akshara Bhandara - Inscriptions 3D Digital Conservation Project (The Mythic Society Bengaluru): https://mythicsociety.github.io/AksharaBhandara/
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo; los resultados obtenidos correspondian a paginas corporativas de Microsoft y no guardan relacion con EpiSAM.
