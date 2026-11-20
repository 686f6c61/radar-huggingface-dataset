# mradermacher/wayfinder-qwen-35b-a3b-i1-GGUF

## Resumen

Wayfinder Qwen 35B A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado originalmente por MongoDB y distribuido en formato GGUF cuantizado por mradermacher. Con 35.505.251.456 parámetros totales, está diseñado específicamente para tareas de búsqueda de código (code-search), uso agéntico y llamadas a herramientas (tool-use), incluyendo un rol de subagente dentro de pipelines multiagente. El modelo parte de una base Qwen y ha sido sometido a un proceso de fusión de LoRA (lora-merged), lo que indica un ajuste fino orientado a tareas concretas de ingeniería de software.

La relevancia de esta ficha radica en que se trata de una cuantización comunitaria (no oficial) en formato GGUF con cuantizaciones ponderadas mediante imatrix, lo que permite ejecutar un modelo MoE de 35B en hardware de consumo con pérdidas de calidad controladas. El repositorio incluye un amplio abanico de cuantizaciones desde i1-Q2_K (13,3 GB) hasta i1-Q6_K (29,3 GB), lo que facilita el despliegue en estaciones de trabajo con GPU de gama alta o incluso configuraciones con memoria unificada.

No se dispone de información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación proporcionada. La licencia es mixta (Apache 2.0 y Muse Model License), lo que introduce restricciones adicionales que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen, transformer con fusión de LoRA |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ponderadas con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0-and-muse-model-license |
| Formato de pesos | GGUF (con fichero imatrix separado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es una arquitectura Mixture of Experts (MoE) derivada de la familia Qwen, con 35.505.251.456 parámetros totales. La denominación "A3B" en el nombre sugiere, siguiendo la convención de Qwen, un número reducido de parámetros activos por token (posiblemente en el entorno de 3B), aunque este dato no se confirma explícitamente en la información disponible. El modelo base MongoDB/wayfinder-qwen-35b-a3b ha sido sometido a un proceso de fusión de LoRA (lora-merged), lo que indica un ajuste fino supervisado orientado a tareas de búsqueda de código, uso agéntico y llamadas a herramientas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio de cuantización no incluye detalles sobre innovaciones técnicas como decodificación especulativa o atención lineal. Las cuantizaciones han sido generadas con ponderaciones imatrix, una técnica que mejora la calidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, con orientación a tareas de ingeniería de software.
- Búsqueda de código (code-search): el modelo está etiquetado explícitamente para localizar y razonar sobre fragmentos de código en repositorios.
- Uso agéntico (agentic): capacitado para operar como agente autónomo en flujos de trabajo multi-paso.
- Llamadas a herramientas (tool-use / function calling): soporte para invocar funciones externas dentro de pipelines.
- Rol de subagente (subagent): diseñado para ser orquestado por un agente principal en arquitecturas multiagente.
- Capacidades de visión: la model card indica que es un modelo de visión y que los ficheros mmproj (si existen) se encuentran en el repositorio estático.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo conversacional: etiquetado como conversational, apto para diálogo multi-turno.

## Casos de uso

- Búsqueda semántica de código en repositorios grandes: el modelo puede indexar y localizar fragmentos relevantes dentro de bases de código extensas, aprovechando su orientación específica a code-search para responder consultas en lenguaje natural sobre dónde se implementa una función o dónde se produce un error.
- Agente de resolución de incidencias en CI/CD: integrado como subagente, puede recibir un fallo de build, inspeccionar los ficheros implicados mediante tool calling y proponer un parche, reduciendo el tiempo de diagnóstico en pipelines automatizados.
- Asistente de refactorización asistida: dentro de un IDE o herramienta de desarrollo, el modelo puede analizar dependencias entre módulos y sugerir cambios concretos, apoyándose en su capacidad de razonamiento multi-paso sobre el árbol de código.
- Orquestación multiagente en plataformas de desarrollo: al estar etiquetado como subagent, encaja como worker especializado en tareas de recuperación de contexto que un agente planificador principal delega, por ejemplo en sistemas de generación automática de documentación técnica.
- Automatización de revisión de pull requests: el modelo puede examinar diffs, consultar el contexto del repositorio mediante herramientas y generar comentarios de revisión con referencias a líneas y ficheros concretos.
- Despliegue local en estaciones de trabajo para desarrollo asistido: gracias a las cuantizaciones GGUF desde 13,3 GB, un equipo con una GPU de 24 GB puede ejecutar el modelo con llama.cpp u Ollama para tareas de asistencia de código sin depender de la nube, preservando la confidencialidad del código propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K ≈ 13,3 GB; i1-IQ3_S ≈ 15,7 GB; i1-Q4_K_M ≈ 21,8 GB; i1-Q5_K_M ≈ 25,4 GB; i1-Q6_K ≈ 29,3 GB (más overhead de contexto y caché KV).
- GPU recomendadas: para Q4_K_M o superior, una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubren las cuantizaciones hasta Q4_K_M; para Q5 y Q6 se recomienda A100 40 GB, H100 80 GB o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con cuantizaciones IQ3 o Q2, con pérdida de calidad apreciable.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repositorio incluye el tag endpoints_compatible. Para el modelo base en safetensors, vLLM o TGI serían las opciones habituales, aunque no se confirman en la documentación.
- Latencia y throughput: no disponibles. Al tratarse de una arquitectura MoE, el throughput por token debería ser superior al de un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wayfinder Qwen 35B A3B (esta ficha) | 35,5B totales (MoE) | no disponible | Apache 2.0 + Muse Model License | GGUF, safetensors | Especializado en code-search y agentes |
| Qwen2.5-Coder-32B | 32,5B densos | 128K (según versión) | Apache 2.0 | safetensors, GGUF | Referencia en código, denso, sin rol de subagente |
| DeepSeek-Coder-V2-Lite | 16B totales (MoE, 2,4B activos) | 128K | DeepSeek License | safetensors, GGUF | MoE ligero para código, licencia más restrictiva |
| CodeLlama-34B | 34B densos | 16K | Llama 2 License | safetensors, GGUF | Más antiguo, contexto corto, licencia restrictiva |

La comparación con Qwen2.5-Coder-32B y DeepSeek-Coder-V2-Lite se basa en categoría y tamaño, no en resultados medidos contra este modelo, ya que no hay benchmarks publicados. La ventaja diferencial de Wayfinder es su orientación explícita a subagente y tool-use, junto con la disponibilidad de cuantizaciones imatrix; su desventaja es la licencia mixta y la falta de datos de rendimiento verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente en inglés, puede presentar sesgos lingüísticos y culturales propios de ese corpus.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede inventar referencias a ficheros, funciones o APIs inexistentes, especialmente en tareas de code-search donde la verificación contra el repositorio real es imprescindible.
- Limitaciones de contexto e idioma: el único idioma declarado es el inglés; no se especifica la longitud de contexto, lo que impide planificar despliegues que requieran ventanas largas sin pruebas previas.
- Restricciones de licencia: la licencia combina Apache 2.0 con la Muse Model License, que puede imponer condiciones adicionales al uso comercial; es obligatorio revisar el enlace de licencia antes de desplegar en producción.
- Cuantizaciones de baja precisión: las variantes Q2 y Q3 pierden calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- Modelo derivado y comunitario: esta ficha describe una cuantización no oficial; el comportamiento puede diferir del modelo base en safetensors, y no hay garantías de soporte por parte de MongoDB.
- Visión: aunque se etiqueta como modelo de visión, los ficheros mmproj no están en este repositorio sino en el estático, y no se detalla qué tareas visuales soporta.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/wayfinder-qwen-35b-a3b-i1-GGUF
- Modelo base: https://huggingface.co/MongoDB/wayfinder-qwen-35b-a3b
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/wayfinder-qwen-35b-a3b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#wayfinder-qwen-35b-a3b-i1-GGUF
- Licencia Muse Model License: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
