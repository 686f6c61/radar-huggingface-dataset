# 42ailab/olmOCR-2-7B-1025-GGUF

## Resumen

olmOCR-2-7B-1025 es un modelo de reconocimiento de documentos orientado a articulos academicos y PDF, con especial cuidado en la notacion matematica y las formulas. El modelo original fue desarrollado por el Allen Institute for AI (AI2) y publicado bajo licencia Apache-2.0. Esta ficha concreta es una conversion a formato GGUF preparada por 42ailab para su integracion en la aplicacion de escritorio 42model; los ficheros son identicos byte a byte a los publicados por lmstudio-community.

El modelo resuelve el problema de la extraccion de texto estructurado a partir de imagenes de paginas de documentos, un paso critico en pipelines de digitalizacion, RAG sobre documentacion cientifica y procesamiento masivo de PDF. Su enfasis en formulas y notacion matematica lo diferencia de OCR genericos, que suelen degradar el contenido tecnico.

Con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones) y un proyector visual separado en F16, se distribuye en dos ficheros: los pesos cuantizados en Q4_K_M (4,36 GiB) y el proyector de vision (1,26 GiB). La longitud de contexto, los idiomas soportados y los detalles de entrenamiento no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; pesos en GGUF) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos); proyector visual en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo + mmproj) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El pipeline declarado es image-text-to-text, lo que implica un codificador visual acoplado a un modelo de lenguaje mediante un proyector multimodal; en este repositorio el proyector se distribuye como fichero independiente `mmproj-olmOCR-2-7B-1025-F16.gguf` en precision F16, mientras que los pesos del modelo van en Q4_K_M.

Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El modelo se presenta como especializado en documentos academicos y PDF con atencion a formulas matematicas, lo que sugiere un corpus de entrenamiento centrado en literatura cientifica, pero esta afirmacion no viene acompanada de cifras en la informacion disponible. La conversion a GGUF fue realizada por lmstudio-community y redistribuida sin modificaciones por 42ailab.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos y paginas de PDF.
- Conversion de documentos academicos a texto estructurado, con tratamiento cuidadoso de notacion matematica y formulas.
- Procesamiento multimodal image-text-to-text: acepta imagenes como entrada y genera texto.
- Interfaz conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue detras de APIs compatibles.
- Soporte de tool calling, agentes, vision adicional, audio o modo de razonamiento extendido: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Digitalizacion de repositorios cientificos: procesar lotes de PDF de articulos academicos y extraer texto con formulas preservadas, aprovechando la especializacion del modelo en notacion matematica frente a OCR genericos.
- Construccion de bases de conocimiento para RAG: convertir documentacion tecnica en texto indexable antes de trocearlo y generar embeddings, reduciendo errores en fragmentos con ecuaciones.
- Extraccion de contenido de informes y papers internos: ingerir documentacion corporativa con tablas y formulas y volcarla a Markdown o texto plano para su posterior analisis.
- Archivado y busqueda documental: indexar fondos escaneados de bibliotecas o hemerotecas y habilitar busqueda full-text sobre el contenido reconocido.
- Preprocesamiento en pipelines de publicacion: normalizar manuscritos recibidos en PDF a texto editable antes de la revision editorial.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF Q4_K_M (4,36 GiB) con proyector F16 (1,26 GiB), puede ejecutarse en equipos con GPU de consumo mediante runners compatibles con GGUF, sin depender de servicios en la nube.
- Integracion en la aplicacion 42model: descarga en un clic mediante `42model download olmocr2:7b-q4_k_m` para flujos de reconocimiento de documentos en escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos Q4_K_M ocupan 4,36 GiB y el proyector visual F16 1,26 GiB, lo que suma aproximadamente 5,6 GiB solo en ficheros; hay que anadir el overhead de contexto y del runtime, por lo que un presupuesto realista ronda los 7-9 GiB de VRAM para inferencia comoda.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, tarjetas con 8-12 GiB o mas son el objetivo razonable.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8 GiB o mas (por ejemplo, gamas RTX 3060 Ti/4060 Ti en adelante), aunque este dato no viene confirmado por el autor.
- Opciones de despliegue: al ser GGUF, es compatible con runners de la familia llama.cpp (incluido Ollama) y con LM Studio, dado que la conversion procede de lmstudio-community. El tag `endpoints_compatible` sugiere soporte de servidores compatibles con API de endpoints. vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; como modelo generativo aplicado a OCR, puede producir texto plausible que no aparezca en la imagen, especialmente en zonas de baja calidad o formulas complejas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles, lo que impide garantizar su comportamiento en documentos en castellano o en paginas de gran densidad.
- Restricciones de licencia: los pesos son Apache-2.0, lo que permite uso comercial con atribucion y conservacion del aviso de licencia; el fichero `LICENSE` del repositorio procede del repositorio oficial de AI2 (allenai/olmocr).
- Este repositorio es una redistribucion: las capacidades pertenecen a los autores originales (AI2) y la conversion GGUF a lmstudio-community; 42ailab no modifica los ficheros.
- Los ficheros estan fijados por sha256 y no cambiaran aunque el repositorio original se renombre o elimine; conviene verificar los digests antes de desplegar en produccion.
- No se documentan limitaciones especificas de resolucion de imagen, numero de paginas por peticion ni calidad minima de escaneo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/olmOCR-2-7B-1025-GGUF
- ModelScope (espejo): https://modelscope.cn/models/42ailab/olmOCR-2-7B-1025-GGUF
- Repositorio GGUF original de lmstudio-community (ModelScope): https://www.modelscope.cn/models/lmstudio-community/olmOCR-2-7B-1025-GGUF
- Repositorio oficial de AI2 (allenai/olmocr): https://github.com/allenai/olmocr
- Sitio de 42ailab: https://42ailab.com
- Sitio de 42model: https://42model.com
