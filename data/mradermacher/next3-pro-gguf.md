# mradermacher/next3-pro-GGUF

## Resumen

next3-pro es un modelo de lenguaje multimodal (vision-language) desarrollado originalmente por el usuario thelamapi y distribuido en formato GGUF por mradermacher. Se trata de un modelo instruction-tuned orientado a tareas de razonamiento, generacion de codigo y uso de herramientas, con soporte declarado para contexto largo. El repositorio que nos ocupa es una coleccion de cuantizaciones estaticas del modelo base thelamapi/next3-pro, no el modelo original.

El modelo cuenta con aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors del modelo base), lo que lo situa en la categoria de modelos de ~27B. Incorpora un componente multimodal separado (mmproj) para el procesamiento de vision, lo que confirma su naturaleza vision-language. La informacion publica sobre arquitectura interna, datos de entrenamiento y contexto maximo es muy limitada en la model card disponible.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de ~27B en hardware de consumo mediante cuantizaciones GGUF que van desde 11,2 GB (Q2_K) hasta 28,7 GB (Q8_0), con el modulo de vision adicional de 0,7 a 1,0 GB. No obstante, la ausencia de documentacion tecnica detallada, benchmarks publicados y una licencia explicita obliga a tratarlo con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal vision-language, segun tags) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (tag "long-context" sin cifra concreta) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mas mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (en), turco (tr) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Los tags indican que es un modelo multimodal vision-language, lo que implica un codificador visual acoplado a un modelo de lenguaje (el repositorio GGUF incluye archivos mmproj separados, confirmando esta estructura). El tamano de ~26,9B parametros sugiere un transformer denso de escala media-grande, aunque no se confirma si emplea tecnicas como MoE o atencion lineal.

En cuanto al entrenamiento, la model card referencia los datasets openai/gsm8k y google-research-datasets/mbpp, lo que indica que se uso entrenamiento o evaluacion orientada a razonamiento matematico y generacion de codigo Python. Los tags mencionan instruction-tuned, tool-use y reasoning, lo que sugiere fases de ajuste supervisado y posiblemente RLHF/DPO, aunque no se documenta el proceso. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles y turco.
- Razonamiento multimodal: procesamiento de imagenes junto con texto mediante el modulo mmproj.
- Generacion de codigo, con enfasis en Python segun la referencia al dataset mbpp.
- Razonamiento matematico, segun la referencia al dataset gsm8k.
- Soporte de tool calling / function calling (tag "tool-use").
- Capacidades de agente y razonamiento multi-paso (tags "reasoning" y "tool-use").
- Manejo de contexto largo (tag "long-context", sin cifra concreta disponible).
- Modelo instruction-tuned, orientado a seguir instrucciones en formato conversacional.
- Capacidades multilingues limitadas a ingles y turco.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y completar codigo Python en entornos sin conexion gracias a su formato GGUF y su entrenamiento con mbpp, ejecutable con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo.
- Analisis de imagenes con descripcion textual: usando el modulo mmproj, se puede alimentar una imagen junto con una pregunta para obtener descripciones, extraccion de texto o interpretacion de diagramas, en aplicaciones de accesibilidad o documentacion tecnica.
- Razonamiento matematico asistido: con entrenamiento sobre gsm8k, es adecuado para resolver problemas aritmeticos de varios pasos en herramientas educativas o de validacion de calculos.
- Agente con tool calling en pipelines internos: los tags de tool-use permiten integrarlo en flujos donde el modelo decide que funcion invocar (APIs, bases de datos) y encadena pasos, util para automatizacion de tareas administrativas.
- Atencion al cliente en turco e ingles: al soportar ambos idiomas, puede desplegarse en chatbots multi-turno para mercados turco y anglosajon, con cuantizaciones Q4_K_M (16,8 GB) que caben en GPUs de 24 GB.
- Procesamiento de documentos largos: el tag de contexto largo permite resumir o extraer informacion de documentos extensos, aunque la falta de cifra concreta obliga a validar el limite real antes de producción.
- Prototipado rapido en investigacion: las cuantizaciones Q2_K (11,2 GB) y Q3_K_S (12,2 GB) permiten experimentar con un modelo de ~27B en GPUs de 12-16 GB, facilitando pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,2 GB
  - Q3_K_S: ~12,2 GB
  - Q4_K_M: ~16,8 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - Modulo vision (mmproj): +0,7 GB (Q8_0) o +1,0 GB (f16)
- GPU recomendadas: para Q4_K_M o superiores, RTX 4090 (24 GB), A100 40 GB, H100 80 GB. Para Q2_K/Q3_K_S, RTX 3090/4080 (16-24 GB) o GPUs de 12 GB con offloading parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_S; en RTX 3090 (24 GB) con Q5_K_M; en GPUs de 12 GB solo con Q2_K o Q3_K_S y posible offloading.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requeririan el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, licencia) que permitan una comparativa rigurosa con alternativas de la misma categoria. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| next3-pro (este) | ~26,9B | no disponible | no disponible | GGUF / safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Idiomas limitados a ingles y turco; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin evaluaciones publicadas no se puede acotar su magnitud.
- La longitud de contexto real no esta documentada pese al tag "long-context"; validar empiricamente antes de confiar en ventanas extensas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema practicamente inexistente, sin comunidad que reporte problemas o ajustes.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; solo recomendables para pruebas, no para produccion.
- El repositorio GGUF es una cuantizacion de terceros (mradermacher), no el modelo oficial; posibles divergencias respecto al original.
- Fecha de creacion futura (2026-11-27) en los metadatos: verificar la integridad y procedencia del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/next3-pro-GGUF
- Modelo base: https://huggingface.co/thelamapi/next3-pro
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#next3-pro-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
