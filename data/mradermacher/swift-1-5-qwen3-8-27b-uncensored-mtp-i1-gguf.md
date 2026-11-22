# mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF es una cuantizacion en formato GGUF del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, publicada por el usuario mradermacher, especializado en generar versiones cuantizadas con imatrix de modelos abiertos. El modelo subyacente es un derivado de la familia Qwen3.8 de 27.320.697.856 parametros (aproximadamente 27,3 mil millones), sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo y filtrado de contenido, lo que da lugar a una variante "uncensored" orientada a usos sin restricciones de alineamiento.

La relevancia de esta ficha radica en que combina tres elementos tecnicos poco frecuentes: un modelo de gran tamano (27B) en formato GGUF listo para inferencia local, cuantizaciones generadas con matriz de importancia (imatrix) que mejoran la calidad respecto a las cuantizaciones estaticas, y la etiqueta MTP (multi-token prediction), que sugiere capacidades de decodificacion especulativa o prediccion de multiples tokens por paso. El repositorio ocupa 218,6 GB e incluye 15 variantes de cuantizacion desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB), lo que permite desplegar el modelo en hardware que va desde GPUs de consumo con 12-16 GB de VRAM hasta estaciones de trabajo con 24 GB o mas.

La licencia declarada es swift-open-license-1.0, una licencia personalizada enlazada desde el repositorio original, por lo que las condiciones exactas de uso comercial deben verificarse en el enlace de licencia antes de cualquier despliegue en produccion. El modelo esta etiquetado unicamente para ingles y su model card no proporciona informacion sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.8, transformer; detalles no publicados) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | ingles (en) |
| Licencia | swift-open-license-1.0 (licencia personalizada, ver enlace) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |
| Tamano del repositorio | 218,6 GB |
| Descargas | 1.794 |
| Likes | 7 |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la nomenclatura (Qwen3.8-27B) y el tamano de parametros, se trata de un transformer denso de aproximadamente 27,3 mil millones de parametros, presumiblemente derivado de la familia Qwen3. La etiqueta MTP (multi-token prediction) indica que el modelo incorpora un cabezal o mecanismo de prediccion de multiples tokens, tecnica empleada para acelerar la decodificacion mediante especulacion interna de tokens futuros. La etiqueta "abliterated" confirma que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para eliminar el comportamiento de negativa a responder, dando lugar a la variante "uncensored".

El proceso de cuantizacion realizado por mradermacher emplea matrices de importancia (imatrix) calculadas sobre el modelo original, lo que permite asignar precision de forma selectiva a los tensores mas sensibles y mejorar la perplejidad de las cuantizaciones de baja tasa de bits respecto a las cuantizaciones estaticas equivalentes. El repositorio incluye tanto el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones como 14 variantes listas para usar. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Modo "uncensored": ausencia de mecanismos de rechazo entrenados, lo que permite generar contenido que los modelos alineados convencionales bloquearian.
- Prediccion multi-token (MTP), potencialmente util para decodificacion especulativa y aceleracion de la inferencia.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8 (no verificados en la documentacion disponible).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte de cuantizaciones de 2 a 6 bits, con variantes IQ para mejor relacion calidad/tamano.
- No se documenta soporte explicito de tool calling, function calling, vision ni audio.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando sus respuestas con las de la version alineada para analizar sesgos, toxicidad y limites de las tecnicas de abliteration.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera explorar temas sensibles sin las negativas tipicas de los modelos alineados, ejecutada localmente con llama.cpp u Ollama.
- Desarrollo y pruebas de pipelines de inferencia local: las 14 cuantizaciones permiten validar el rendimiento de un modelo de 27B en distintos presupuestos de VRAM, desde 12 GB hasta 24 GB, y medir el impacto de la cuantizacion en la calidad.
- Evaluacion de tecnicas de cuantizacion imatrix: el repositorio incluye el fichero imatrix y variantes IQ y K, lo que lo convierte en un banco de pruebas para comparar perplejidad y calidad entre esquemas de cuantizacion.
- Prototipado de asistentes conversacionales en ingles: al ser compatible con endpoints y con transformers, puede integrarse en servicios de chat para pruebas internas donde no se requiera filtrado de contenido.
- Experimentacion con decodificacion especulativa: la etiqueta MTP sugiere que el modelo puede aprovecharse para estudiar tecnicas de prediccion multi-token y su impacto en latencia y throughput.
- Analisis de contenido y red teaming: util para generar prompts adversarios y evaluar la robustez de sistemas de moderacion, dado que el modelo no se niega a producir contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 27,3 B parametros):
  - i1-Q2_K (11,0 GB): cabe en GPUs de 12 GB con contexto corto.
  - i1-IQ3_S / i1-IQ3_M (12,7-12,9 GB): requiere 16 GB de VRAM para margen de contexto.
  - i1-Q4_K_S / i1-Q4_K_M (15,9-16,9 GB): recomendado para GPUs de 24 GB (RTX 3090, RTX 4090, A10G).
  - i1-Q5_K_M (19,6 GB): requiere 24 GB de VRAM o descarga parcial a RAM.
  - i1-Q6_K (22,5 GB): limite practico de una RTX 4090; mejor en A100 40 GB o H100.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4-Q5; A100 40 GB u H100 80 GB para Q6 o pesos sin cuantizar; RTX 3090 y A10G como alternativas economicas para Q4.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo Q2-Q3) y GPUs con 12 GB para las cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF) y TGI. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. Como referencia general para un modelo denso de 27B en Q4 con una RTX 4090, cabe esperar decenas de tokens por segundo, pero no se ha publicado una medicion concreta para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF | 27,3 B | no disponible | GGUF (i1) | swift-open-license-1.0 | Variante uncensored con MTP e imatrix |
| Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF (mradermacher) | 27,3 B | no disponible | GGUF estatico | swift-open-license-1.0 | Misma base, cuantizaciones sin imatrix |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP | 27,3 B | no disponible | safetensors | swift-open-license-1.0 | Modelo base sin cuantizar |
| Qwen3.8-27B (familia original) | ~27 B | no disponible | safetensors/GGUF | depende de la variante | Modelo alineado de referencia; no se dispone de datos de rendimiento comparativo |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored" por diseno: no aplica filtros de contenido, por lo que puede generar material ofensivo, ilegal o danino. No es apto para aplicaciones orientadas al publico sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual; al tratarse de un modelo de 27B sin datos de benchmark, la fiabilidad en tareas de conocimiento debe validarse empiricamente.
- Idioma limitado al ingles: la model card solo declara `en`; el rendimiento en castellano no esta garantizado.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Licencia personalizada (swift-open-license-1.0): es necesario revisar el enlace de licencia antes de cualquier uso comercial; no es una licencia OSI estandar y puede contener restricciones adicionales.
- Procedencia de la abliteration: la eliminacion de direcciones de rechazo puede degradar capacidades generales del modelo (razonamiento, instrucciones) de forma no cuantificada.
- Cuantizaciones de 2-3 bits: las variantes i1-Q2_K e i1-IQ3_S pierden calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Repositorio de 218,6 GB: la descarga completa es costosa; conviene descargar solo la cuantizacion necesaria.
- Sin garantias del autor de la cuantizacion: mradermacher no ofrece soporte ni validacion de calidad mas alla de las notas orientativas del README.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Modelo base: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
