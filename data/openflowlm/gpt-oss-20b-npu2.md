# OpenFlowLM/GPT-OSS-20B-NPU2

# OpenFlowLM/GPT-OSS-20B-NPU2

## Resumen

GPT-OSS-20B-NPU2 es una redistribucion del modelo abierto `openai/gpt-oss-20b` publicada por el usuario OpenFlowLM en HuggingFace. Se trata de una variante cuantizada en formato MXFP4 y orientada a su despliegue en aceleradores de tipo NPU (el sufijo "NPU2" sugiere una segunda generacion de soporte sobre este tipo de hardware), manteniendo la licencia Apache 2.0 y la compatibilidad con la libreria `transformers` y con endpoints compatibles con la API de OpenAI.

El modelo base es un transformer de tipo mezcla de expertos (MoE) de 21.000 millones de parametros totales y 3.600 millones de parametros activos por token, disenado por OpenAI para razonamiento, tareas agenticas y uso general con baja latencia en hardware local. La relevancia de esta ficha radica en que el repositorio redistribuye pesos ya cuantizados en MXFP4 (aproximadamente 12,0 GB en el Hub), lo que permite ejecutar un modelo de razonamiento de 21B en equipos con memoria limitada.

No obstante, la model card del repositorio no anade informacion tecnica propia: reproduce el material de `openai/gpt-oss-20b`. A fecha de la publicacion del repositorio (2 de octubre de 2026) registra 0 descargas y 0 "likes", por lo que no existe validacion de la comunidad sobre esta compilacion concreta ni sobre sus diferencias respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada de `openai/gpt-oss-20b` |
| Parametros totales | 21.000 millones (21B), segun el modelo base |
| Parametros activos | 3.600 millones (3,6B), segun el modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos de las capas MoE, segun el modelo base); repositorio etiquetado como `mxfp4` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no especificado en la informacion proporcionada (repositorio compatible con `transformers`, 12,0 GB) |
| Modelo base | openai/gpt-oss-20b |
| Pipeline | text-generation |
| Libreria | transformers |
| Etiquetas adicionales | conversational, endpoints_compatible, region:us, arxiv:2508.10925 |
| Tamano del repositorio | 12,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

La informacion disponible corresponde integramente al modelo base `openai/gpt-oss-20b`. Se trata de una arquitectura de mezcla de expertos con 21B de parametros totales y 3,6B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso de tamano equivalente. OpenAI indica que los pesos de las capas MoE fueron sometidos a cuantizacion MXFP4 durante el post-entrenamiento, de modo que las evaluaciones publicadas se realizaron con esa misma cuantizacion; este repositorio redistribuye precisamente esa version cuantizada.

El modelo fue entrenado con el formato de respuesta "harmony" de OpenAI y, segun la model card, solo funciona correctamente si se utiliza dicho formato, aplicado automaticamente por la plantilla de chat de `transformers` o manualmente mediante el paquete `openai-harmony`. La model card menciona que ambos modelos de la familia son ajustables mediante fine-tuning de parametros y ofrecen un nivel de esfuerzo de razonamiento configurable (bajo, medio, alto) con acceso completo a la cadena de pensamiento. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Tampoco se documenta ninguna modificacion tecnica introducida por OpenFlowLM respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta disenado para tareas de razonamiento general y razonamiento con esfuerzo configurable (bajo, medio, alto) en funcion de la latencia requerida.
- Cadena de pensamiento accesible: expone el proceso de razonamiento completo, lo que facilita la depuracion y la auditoria de las respuestas. La model card advierte explicitamente de que no esta pensado para mostrarse al usuario final.
- Tool calling / function calling nativo.
- Navegacion web como capacidad agentica declarada por OpenAI.
- Ejecucion de codigo Python en el flujo del agente.
- Salidas estructuradas (structured outputs).
- Capacidades agenticas y de razonamiento multi-paso.
- Ajuste fino de parametros (fine-tunable) segun la model card.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Capacidades de vision o audio: no disponibles.
- Requisito de formato: debe usarse con el formato harmony; de lo contrario el modelo no funciona correctamente.

## Casos de uso

- Asistentes de razonamiento en local: gracias a que ocupa aproximadamente 16 GB de memoria en la version MXFP4, puede desplegarse en una estacion de trabajo con una unica GPU de consumo o en un equipo con NPU y mantener el proceso de razonamiento en la maquina del usuario, sin enviar datos a servicios externos.
- Agentes con herramientas: su soporte nativo de function calling permite construir agentes que consulten APIs internas, bases de datos o servicios de ticketing, encadenando varias llamadas en un mismo turno.
- Automatizacion de analisis de datos: con ejecucion de codigo Python, el modelo puede escribir y ejecutar scripts para limpiar, transformar y resumir conjuntos de datos tabulares dentro de un pipeline controlado.
- Extraccion de informacion estructurada: las salidas estructuradas permiten convertir texto libre (correos, contratos, incidencias) en JSON validado contra un esquema, integrable en sistemas de gestion.
- Generacion y revision de codigo en CI/CD: puede actuar como revisor automatizado de pull requests o generar pruebas unitarias, integrándose mediante el servidor compatible con OpenAI que exponen vLLM o `transformers serve`.
- Despliegue en hardware con NPU: el etiquetado "NPU2" y el formato MXFP4 apuntan a escenarios de inferencia en aceleradores integrados; en el ecosistema llama.cpp se ha tratado el backend XDNA, donde `gpt-oss:20b` aparece como uno de los modelos de mayor tamano soportados.
- Investigacion sobre cuantizacion: al ser una redistribucion cuantizada de un modelo abierto, puede utilizarse para comparar calidad de salida frente al modelo original o frente a otras cuantizaciones.
- Atencion al cliente automatizada: no disponible como caso verificado, ya que no se documentan idiomas soportados ni longitud de contexto en la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona que se realizaron evaluaciones con la cuantizacion MXFP4, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. No se deben asumir valores no publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card del modelo base indica que `gpt-oss-20b` se ejecuta dentro de 16 GB de memoria en la version MXFP4. El repositorio ocupa 12,0 GB en disco.
- CPU: no disponible la informacion concreta sobre requisitos de CPU.
- GPU recomendadas: la model card cita una unica GPU de 80 GB (NVIDIA H100 o AMD MI300X) para `gpt-oss-120b`; para el modelo de 20B no cita GPU concreta, pero por su huella de 16 GB es compatible con GPU de consumo de 16 GB o mas, como RTX 4080/4090 (16-24 GB) o RTX 3090 (24 GB).
- Compatibilidad con GPU de consumo: si, segun la propia model card, que menciona Ollama y LM Studio como vias de despliegue en hardware de consumo.
- NPU: el repositorio esta etiquetado como `NPU2` y orientado a aceleradores de este tipo; no se especifica que familia de NPU ni que versiones son compatibles.
- Opciones de despliegue documentadas para el modelo base: `transformers` (pipeline y `transformers serve`), vLLM (version `0.10.1+gptoss` con ruedas precompiladas), Ollama (`gpt-oss:20b`) y LM Studio (`lms get openai/gpt-oss-20b`). Implementaciones de referencia en PyTorch y Triton en el repositorio oficial de gpt-oss. `llama.cpp` aparece vinculado en resultados de busqueda relativos al backend XDNA.
- Latencia y throughput estimados: no disponibles. La model card solo indica que `gpt-oss-20b` esta pensado para casos de uso de baja latencia y despliegue local o especializado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenFlowLM/GPT-OSS-20B-NPU2 | 21B (heredado) | 3,6B (heredado) | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| openai/gpt-oss-20b (modelo base) | 21B | 3,6B | no disponible en la informacion proporcionada | apache-2.0 | HuggingFace, coleccion oficial de OpenAI |
| openai/gpt-oss-120b | 117B | 5,1B | no disponible en la informacion proporcionada | apache-2.0 | HuggingFace, cabe en una GPU de 80 GB |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Otras alternativas de la misma categoria (modelos abiertos de razonamiento en el rango de 20B): no disponible.

## Limitaciones y advertencias

- Requisito de formato: el modelo debe usarse con el formato harmony; segun la model card, no funciona correctamente con otros formatos.
- Cadena de pensamiento: el contenido de razonamiento no debe mostrarse al usuario final, segun la advertencia explicita de OpenAI.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad ni de tasas de alucinacion para esta compilacion.
- Idiomas: no disponible. El repositorio no declara idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano.
- Longitud de contexto: no disponible en la informacion proporcionada, lo que impide planificar cargas de trabajo con documentos largos.
- Trazabilidad: el repositorio reproduce la model card del modelo base y no documenta que cambios introduce OpenFlowLM ni como se generaron los pesos MXFP4. Sin descargas ni validacion de la comunidad, no hay evidencia externa de que la compilacion sea correcta o reproducible.
- Cuantizacion: al tratarse de pesos MXFP4, cabe esperar una perdida de precision respecto a una ejecucion en precision completa; no se publican metricas de esa degradacion.
- Licencia: Apache 2.0, permisiva, sin restricciones de copyleft ni riesgo de patentes segun la model card del modelo base. No obstante, conviene verificar los terminos aplicables a la redistribucion concreta de OpenFlowLM antes de un uso comercial.
- Hardware especifico: el sufijo "NPU2" implica dependencia de aceleradores que no se detallan; en produccion habria que validar previamente compatibilidad, kernels y operadores soportados.
- Fechas: el repositorio esta fechado en octubre de 2026 y no ha recibido actualizaciones posteriores a su creacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenFlowLM/GPT-OSS-20B-NPU2
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Modelo de mayor tamano de la familia: https://huggingface.co/openai/gpt-oss-120b
- Coleccion oficial de OpenAI en HuggingFace: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Sitio del modelo: https://gpt-oss.com
- Guias oficiales: https://cookbook.openai.com/topic/gpt-oss
- Paper / model card (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
- Blog de anuncio de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Pagina de modelos abiertos de OpenAI: https://openai.com/open-models
- Repositorio del formato harmony: https://github.com/openai/harmony
- Repositorio oficial gpt-oss (implementaciones de referencia): https://github.com/openai/gpt-oss
- Lista de recursos de la comunidad gpt-oss: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Instrucciones de vLLM para gpt-oss: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- Instrucciones de Transformers para gpt-oss: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Instrucciones de Ollama para gpt-oss: https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama
- Descarga de Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
- Issue de llama.cpp sobre el backend XDNA, donde se menciona `gpt-oss:20b`: https://github.com/ggml-org/llama.cpp/issues/21725
- Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes adicionales sobre este repositorio; el resto de resultados no guardaban relacion con el modelo.
