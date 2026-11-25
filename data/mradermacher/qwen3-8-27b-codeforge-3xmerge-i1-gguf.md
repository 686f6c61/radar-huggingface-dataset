# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF es la versión cuantizada con GGUF del modelo xtools-at/Qwen3.8-27B-CodeForge-3xMerge, un merge de modelos de la familia Qwen3.8 orientado a generación de código, razonamiento y uso agéntico. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF (con y sin imatrix) para la comunidad de llama.cpp. El modelo base es un merge de tres modelos, según indica el sufijo "3xMerge", y está pensado para tareas de programación, razonamiento eficiente ("efficient-thinking"), tool use e instrucciones.

El modelo cuenta con 27.320.697.856 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de 27B. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligatorias del texto de la licencia. Los idiomas declarados en la model card son inglés (en) y chino (zh).

Esta ficha se centra en la versión i1-GGUF, que ofrece un conjunto amplio de cuantizaciones con imatrix (desde i1-Q2_K de 11,0 GB hasta i1-Q6_K de 22,5 GB), lo que permite desplegar el modelo en hardware de consumo con pérdida de calidad controlada. Es relevante para desarrolladores que quieran ejecutar localmente un modelo de código de 27B sin depender de GPUs de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8; no se detalla en la información proporcionada) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix); también existe repositorio de cuantizaciones estáticas |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base es un merge de tres modelos de la familia Qwen3.8, según el nombre "3xMerge", y las etiquetas indican que incorpora destilación ("distillation") y razonamiento eficiente ("efficient-thinking"). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La versión aquí descrita es una cuantización GGUF con imatrix (importancia matrix) generada por mradermacher, que aplica una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas. El repositorio incluye también el fichero imatrix para que otros puedan generar sus propias cuantizaciones. Existe un repositorio paralelo de cuantizaciones estáticas (sin imatrix) y, según la model card, el modelo es multimodal ("vision model"), con posibles ficheros mmproj en el repositorio estático.

## Capacidades

- Generación de código y code-generation, según las etiquetas del modelo.
- Razonamiento ("reasoning") y modo de pensamiento eficiente ("efficient-thinking").
- Uso agéntico ("agentic") y tool use / function calling, según etiquetas.
- Seguimiento de instrucciones ("instruction-following").
- Capacidades conversacionales multi-turno.
- Soporte multilingüe limitado a inglés y chino según la model card.
- Posible capacidad de visión según la model card ("This is a vision model"), aunque los ficheros mmproj estarían en el repositorio estático y no se confirma su disponibilidad.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en editores o IDE mediante llama.cpp u Ollama para autocompletar y generar funciones, aprovechando sus 27B de parámetros y su enfoque en code-generation.
- Revisión de código en CI/CD: con soporte de tool use e instruction-following, puede conectarse a pipelines para analizar diffs y sugerir correcciones antes del merge.
- Agentes de resolución de tareas multi-paso: las etiquetas "agentic" y "tool-use" lo hacen adecuado para orquestar llamadas a herramientas en flujos de automatización.
- Razonamiento eficiente en entornos con recursos limitados: las cuantizaciones i1-Q4_K_M (16,9 GB) e i1-IQ4_XS (15,4 GB) permiten ejecución en GPUs de consumo manteniendo calidad razonable.
- Generación de documentación técnica y explicaciones de código: su capacidad conversacional y de razonamiento permite resumir repositorios o explicar fragmentos complejos.
- Prototipado de asistentes bilingües inglés-chino: para equipos que trabajan con documentación o código en ambos idiomas.
- Investigación sobre merges de modelos: al ser un merge de tres modelos, sirve como caso de estudio para evaluar técnicas de model merging y cuantización con imatrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, tamaño del fichero GGUF):
  - i1-Q2_K: ~11,0 GB
  - i1-IQ3_S: ~12,7 GB
  - i1-Q4_K_M: ~16,9 GB
  - i1-Q5_K_M: ~19,6 GB
  - i1-Q6_K: ~22,5 GB
- GPU recomendadas: para cuantizaciones Q4 en adelante se recomienda una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) o superior; para Q2/Q3 podría intentarse en GPUs de 12-16 GB, aunque con posible offloading a CPU. Para despliegue en datacenter, A100 o H100 permiten ejecutar el modelo sin cuantizar o en cuantizaciones altas con margen.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q4 y Q5 en RTX 3090/4090 (24 GB); las cuantizaciones Q6_K (22,5 GB) van muy justas y pueden requerir offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers y posiblemente vLLM o TGI (no confirmado en la información).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Esta ficha; cuantización con imatrix |
| Qwen3.8-27B-CodeForge-3xMerge (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Alternativas de 27B-30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información |

## Limitaciones y advertencias

- Solo se declaran inglés y chino como idiomas; el rendimiento en castellano no está garantizado.
- Al ser un merge de tres modelos, puede heredar sesgos y comportamientos inconsistentes de sus componentes; no se documentan sesgos específicos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en código y hechos técnicos; requiere validación en producción.
- Las cuantizaciones agresivas (Q2_K, Q3) degradan la calidad; el autor recomienda IQ3_XXS o IQ4_XS frente a Q2_K y Q3_K_S.
- El modelo base es un merge no oficial de la familia Qwen3.8; no hay garantía de soporte ni de resultados de evaluación publicados.
- La capacidad de visión no está confirmada para esta versión GGUF; los ficheros mmproj, si existen, están en el repositorio estático.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los modelos componentes del merge, no detalladas en la información.
- No se dispone de información sobre longitud de contexto, por lo que no se puede garantizar el rendimiento en conversaciones o repositorios muy largos.

## Enlaces

- Repositorio Hugging Face (esta versión): https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
