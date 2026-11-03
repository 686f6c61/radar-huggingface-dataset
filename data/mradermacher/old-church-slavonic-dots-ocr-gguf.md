# mradermacher/old-church-slavonic-dots-ocr-GGUF

## Resumen

`mradermacher/old-church-slavonic-dots-ocr-GGUF` es la version cuantizada en formato GGUF del modelo `wjbmattingly/old-church-slavonic-dots-ocr`, un modelo de vision-lenguaje especializado en OCR (reconocimiento optico de caracteres) para documentos en eslavo eclesiastico antiguo. El autor original es wjbmattingly y la cuantizacion la realiza mradermacher, un perfil conocido en HuggingFace por producir versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles.

El modelo resuelve un problema muy concreto: la digitalizacion y el parseo de documentos historicos escritos en eslavo eclesiastico antiguo, incluyendo texto con marcas diacriticas (los "dots" del nombre), layouts complejos, tablas y formulas. Con 1.777 millones de parametros (aproximadamente 1,8 B), es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace accesible para proyectos de humanidades digitales y archivos historicos con presupuestos limitados.

La relevancia actual radica en la escasez de modelos OCR especializados en lenguas historicas y escrituras no latinas, y en la disponibilidad de cuantizaciones GGUF que permiten desplegar el modelo en local sin depender de APIs externas. La licencia MIT facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-to-text basado en transformers) |
| Parametros totales | 1.777.088.000 (aprox. 1,8 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | en, zh, multilingual (segun la model card; el modelo esta especializado en eslavo eclesiastico antiguo) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por los tags (`image-to-text`, `document-parse`, `layout`, `table`, `formula`) y por el pipeline declarado (`image-to-text`), se trata de un modelo multimodal que recibe imagenes de documentos y genera texto estructurado. El tamano de 1,8 B parametros y la presencia de un componente `mmproj` (proyeccion multimodal) en las cuantizaciones confirman que sigue el patron habitual de los modelos vision-lenguaje compactos compatibles con llama.cpp.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio cuantizado es una plantilla generica de mradermacher y no incluye detalles del entrenamiento original. La innovacion principal del repositorio es la propia cuantizacion: ofrece 13 variantes GGUF con tamanos desde 0,9 GB (Q2_K) hasta 3,7 GB (f16), incluyendo el proyector multimodal en dos precisiones, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, con salida en formato texto.
- Parseo de documentos (`document-parse`): extraccion de estructura y contenido de digitalizaciones.
- Deteccion y extraccion de layout de pagina.
- Extraccion de tablas.
- Extraccion de formulas.
- Manejo de texto en eslavo eclesiastico antiguo, incluyendo marcas diacriticas ("dots").
- Capacidad multimodal image-to-text mediante el componente `mmproj`.
- Soporte multilingue declarado (en, zh, multilingual) ademas de la lengua historica objetivo.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags).

## Casos de uso

- Digitalizacion de archivos historicos: el modelo permite convertir imagenes de manuscritos y libros impresos en eslavo eclesiastico antiguo a texto digital, preservando las marcas diacriticas que otros OCR genericos pierden. Es adecuado por su especializacion en esta escritura y por su tamano reducido, que permite procesar lotes grandes en hardware modesto.
- Humanidades digitales e investigacion linguistica: investigadores pueden transcribir corpus historicos de forma automatizada y construir bases de datos textuales para analisis filologico, aprovechando la extraccion de layout y tablas para mantener la estructura original.
- Preservacion cultural en bibliotecas y monasterios: instituciones con colecciones liturgicas pueden digitalizar fondos sin enviar imagenes a servicios en la nube, gracias a la licencia MIT y a la posibilidad de ejecucion local con llama.cpp.
- Extraccion de contenido de misales y libros liturgicos: el modelo puede separar texto principal, anotaciones y formulas, facilitando la catalogacion y la busqueda full-text sobre el corpus.
- Procesamiento por lotes en pipelines documentales: al disponer de cuantizaciones desde 0,9 GB, se puede integrar en pipelines de CI/CD o en servidores sin GPU dedicada para procesar grandes volumenes de escaneos.
- Prototipado rapido de aplicaciones OCR especializadas: desarrolladores pueden usar la version Q4_K_M (1,2 GB) para validar un producto de transcripcion historica antes de invertir en infraestructura mayor.
- Educacion y divulgacion: herramientas didacticas para el estudio del eslavo eclesiastico que transcriban facsimiles en tiempo real en equipos de estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K, 1,2-1,4 GB con Q4_K_M/Q5_K_M, 2 GB con Q8_0 y 3,7 GB con f16. A estas cifras hay que sumar el componente multimodal (`mmproj`), entre 1,4 GB (Q8_0) y 2,6 GB (f16), aunque su carga puede compartirse con CPU.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090); para despliegues de mayor throughput, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers. Para el componente multimodal se requiere una version de llama.cpp con soporte `mmproj`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| old-church-slavonic-dots-ocr (este) | 1,8 B | no disponible | MIT | GGUF, safetensors | Especializado en eslavo eclesiastico antiguo con diacriticos |
| wjbmattingly/old-church-slavonic-dots-ocr | 1,8 B | no disponible | MIT | safetensors | Modelo base sin cuantizar |
| OCR genericos multimodales (p. ej. familias tipo Qwen-VL o Donut) | variable | variable | variable | variable | No especializados en escrituras historicas eslavas; datos concretos no disponibles en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del repositorio cuantizado no documenta sesgos conocidos del modelo base; se desconoce su comportamiento fuera del dominio de documentos historicos eslavos.
- Riesgo de alucinacion inherente a los modelos generativos: puede inventar texto o caracteres en imagenes de baja calidad o con ruido.
- El modelo esta especializado en eslavo eclesiastico antiguo; su rendimiento en otros idiomas o escrituras no esta validado, pese al tag `multilingual`.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de documentos de gran tamano.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad del OCR; se recomienda Q4_K_M o superior para produccion.
- El componente multimodal (`mmproj`) debe descargarse por separado; olvidarlo impide el procesamiento de imagenes.
- La licencia MIT permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el modelo base.
- No hay resultados de benchmarks publicados, por lo que la calidad real debe validarse con un conjunto de prueba propio antes de desplegar en produccion.

## Enlaces

- Repositorio HuggingFace (cuantizado): https://huggingface.co/mradermacher/old-church-slavonic-dots-ocr-GGUF
- Modelo base: https://huggingface.co/wjbmattingly/old-church-slavonic-dots-ocr
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#old-church-slavonic-dots-ocr-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
