# bartowski/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo Mixture of Experts (MoE) desarrollado por Thinking Machines, distribuido en formato GGUF por el cuantizador bartowski. Con 26.070.385.152 parametros totales (26B) en el checkpoint original, el modelo acepta entradas de texto e imagen (image-text-to-text) y esta disenado para conversacion. Su naturaleza MoE sugiere una arquitectura con activacion selectiva de expertos, aunque el numero de parametros activos no esta disponible en la informacion proporcionada.

La relevancia de esta ficha radica en que se trata de la version cuantizada oficial publicada por bartowski, una de las referencias habituales en el ecosistema llama.cpp para llevar modelos grandes a hardware de consumo. El repositorio ofrece un abanico amplio de cuantizaciones, desde bf16 completo (52,23 GB) hasta IQ3_XS (13,77 GB), lo que permite desplegar el modelo en configuraciones que van desde estaciones de trabajo con multiples GPU hasta equipos de consumo con 16 GB de VRAM.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en productos derivados. La fecha de creacion del repositorio (21 de noviembre de 2026) y su actualizacion dos dias despues indican un lanzamiento reciente, con 51.864 descargas y 18 likes acumulados en el momento de la consulta. La ausencia de datos sobre benchmarks, idiomas soportados y longitud de contexto en la informacion disponible limita la evaluacion cuantitativa, pero la ficha se completa con los datos tecnicos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal (image-text-to-text) |
| Parametros totales | 26.070.385.152 (26B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, IQ4_NL, IQ4_XS, Q4_0, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); checkpoint original en safetensors segun metadatos del modelo base |

## Arquitectura y entrenamiento

La informacion disponible confirma que Inkling-2-Mini es un modelo MoE (tag `moe` en el repositorio) con capacidad multimodal de entrada texto-imagen (`pipeline_tag: image-text-to-text`). El checkpoint original consta de 26B parametros totales. No se dispone de datos sobre el numero de parametros activos por token, el numero de expertos, la dimension oculta, el numero de capas ni la estrategia de enrutamiento. Tampoco se documenta la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF, DPO o similar.

El proceso de cuantizacion fue realizado por bartowski con llama.cpp release b12600, empleando calibracion imatrix (`imatrix: yes`). El modelo soporta entrada de imagen mediante un archivo `mmproj` separado, lo que es habitual en el ecosistema llama.cpp para modelos multimodales. No se emplea decodificacion especulativa (`speculative decoding: no`). El prompt format documentado incluye tokens especiales como `<|message_system|>`, `<|content_text|>`, `<|end_message|>`, `<|message_user|>` y `<|content_xml|>`, ademas de un parametro explicito de "Thinking effort level" (por ejemplo, 0.9) que sugiere un modo de razonamiento configurable. Tambien se documenta el formato para declaracion de herramientas (tool_declare) en XML.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de prompt documentado para system, user y mensajes.
- Procesamiento de imagenes como entrada (image-text-to-text), requiriendo el archivo `mmproj` para habilitar la modalidad visual.
- Soporte de tool calling / function calling mediante el bloque `tool_declare` en XML, con definicion de parametros en JSON.
- Modo de razonamiento configurable a traves del parametro "Thinking effort level" (valor de ejemplo 0.9), lo que sugiere control sobre la profundidad de razonamiento.
- Arquitectura MoE, que en principio permite mayor capacidad efectiva con menor coste computacional por token, aunque no se dispone de datos de parametros activos.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o agentes multi-paso: no documentadas explicitamente en la informacion disponible.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede recibir texto e imagenes en el mismo turno, lo que permite construir asistentes que respondan a capturas de pantalla, fotografias o diagramas. Es adecuado por su pipeline `image-text-to-text` y su formato de prompt documentado.
- Automatizacion de atencion al cliente con soporte visual: integrado en un backend con llama.cpp, puede gestionar conversaciones multi-turno donde el usuario adjunte imagenes (por ejemplo, capturas de errores o productos danados). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.
- Agentes con herramientas: el soporte de `tool_declare` en XML y el formato de parametros JSON permiten definir funciones como consulta de precios, busqueda o envio de correos, y que el modelo las invoque en un bucle de agente.
- Despliegue en hardware de consumo: gracias a las cuantizaciones IQ4_XS (15,09 GB) y Q4_K_M (18,66 GB), el modelo puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, lo que facilita prototipado local y despliegues en estaciones de trabajo sin infraestructura de datacenter.
- Razonamiento con esfuerzo configurable: el parametro "Thinking effort level" permite ajustar la profundidad de razonamiento segun la tarea, lo que es util en pipelines donde se quiere equilibrar latencia y calidad (por ejemplo, nivel bajo para clasificacion y alto para analisis).
- Procesamiento de documentos con imagenes: al aceptar imagenes, puede emplearse para extraer informacion de facturas, formularios o capturas, combinando OCR implicito con razonamiento textual en un solo modelo.
- Integracion en entornos con endpoints compatibles: el tag `endpoints_compatible` sugiere compatibilidad con APIs de inferencia estandar, lo que facilita su despliegue en plataformas que consumen modelos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos unicamente, sin contar KV cache ni overhead):
  - bf16: 52,23 GB
  - Q8_0: 27,82 GB
  - Q6_K_L: 25,36 GB
  - Q6_K: 24,70 GB
  - Q6_K_S: 24,04 GB
  - Q5_K_M: 21,22 GB
  - Q5_K_S: 19,16 GB
  - Q4_K_L: 19,72 GB
  - Q4_K_M: 18,66 GB
  - Q4_K_S: 16,87 GB
  - Q4_1: 16,59 GB
  - IQ4_NL: 16,11 GB
  - IQ4_XS: 15,09 GB
  - Q4_0: 15,06 GB
  - IQ3_M: 15,26 GB
  - Q3_K_L: 15,26 GB
  - Q3_K_M: 14,55 GB
  - IQ3_XS: 13,77 GB
- GPU recomendadas: para bf16 y Q8_0 se requiere una A100 80 GB o H100; para Q6 y Q5 una A100 40 GB o dos RTX 4090; para Q4_K_M una RTX 4090 (24 GB) o RTX 3090; para IQ4_XS y Q3 una RTX 4080 (16 GB) o similar.
- Cabe en GPU de consumo: si, en configuraciones Q4 y Q3 (16-24 GB de VRAM). Las cuantizaciones Q6 y superiores requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp (release b12600 o superior, usado para la cuantizacion), Ollama, y cualquier runtime compatible con GGUF. Para la modalidad de imagen es necesario cargar el archivo `mmproj` correspondiente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada. La comparativa se limita a los datos verificables del propio modelo frente a alternativas genericas de la misma categoria (MoE multimodal de ~26B en GGUF):

| Modelo | Parametros totales | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Inkling-2-Mini | 26B | no disponible | Apache 2.0 | GGUF, safetensors | no disponible |
| Alternativas MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad del modelo.
- Riesgo de alucinacion: no cuantificado; como en cualquier modelo generativo, existe riesgo, especialmente en tareas factuales y en el modo de razonamiento configurable.
- Longitud de contexto no documentada: limita la planificacion de casos de uso con documentos largos o conversaciones extensas.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles (si es que el modelo fue entrenado principalmente en ese idioma).
- La modalidad de imagen requiere el archivo `mmproj` adicional; sin el, el modelo funciona solo como texto.
- El repositorio tiene un tamano de 444,8 GB, lo que implica un coste de almacenamiento considerable si se descargan todas las cuantizaciones.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de incluir el aviso de licencia y la atribucion correspondiente. No se detectan restricciones adicionales en la informacion disponible.
- La fecha de creacion (noviembre de 2026) y la escasez de documentacion tecnica sugieren que el modelo es reciente y puede carecer de validacion independiente en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizacion Q4_K_M (recomendada por defecto): https://huggingface.co/bartowski/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini-Q4_K_M.gguf
- llama.cpp release b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
