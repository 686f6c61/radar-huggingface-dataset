# mradermacher/Athena-27B-GGUF

## Resumen

Athena-27B es un modelo de lenguaje de tipo transformer denso desarrollado por Athena Research, orientado a tareas de razonamiento, generacion de codigo y uso de herramientas (tool calling) en entornos de agentes. El modelo cuenta con 26.895.998.464 parametros totales (aproximadamente 26,9 mil millones) y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La ficha que nos ocupa es la cuantizacion GGUF realizada por mradermacher, que facilita la ejecucion del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicacion radica en dos factores. Por un lado, el modelo base esta disenado explicitamente para flujos de trabajo agenticos y generacion de codigo, capacidades muy demandadas en pipelines de automatizacion. Por otro, la disponibilidad de cuantizaciones GGUF en multiples niveles (desde Q2_K hasta Q8_0, ademas de variantes IQ) permite desplegar el modelo en estaciones de trabajo con GPU consumer, algo impracticable con los pesos originales en precision completa.

El modelo declara soporte para once idiomas, con especial enfasis en el ingles y en lenguas de la India (hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayalam, punjabi y urdu). Esta orientacion multilingue lo diferencia de otros modelos de su tamano centrados exclusivamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante concreta en la informacion disponible) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los datos disponibles indican que se trata de un transformer denso de aproximadamente 26,9 mil millones de parametros, sin indicios de que emplee mezcla de expertos (MoE). El repositorio de cuantizacion incluye archivos `mmproj` (multi-modal supplement), lo que sugiere que el modelo base incorpora capacidades multimodales, probablemente vision, aunque no se detalla el mecanismo exacto ni el codificador visual empleado.

Tampoco se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas del modelo (`coding-agent`, `agents`, `tool-use`, `reasoning`) indican que el entrenamiento se ha orientado hacia tareas de razonamiento y uso de herramientas, pero no se aportan detalles tecnicos sobre el proceso.

## Capacidades

- Generacion de texto y razonamiento de proposito general.
- Generacion y comprension de codigo, con orientacion explicita a tareas de `coding-agent`.
- Soporte de tool calling y function calling, segun las etiquetas del modelo.
- Capacidad para flujos agenticos y razonamiento multi-paso.
- Multilingue: once idiomas declarados, con cobertura destacada de lenguas de la India.
- Capacidades multimodales: la presencia de archivos `mmproj` sugiere soporte de entrada visual, aunque no se detalla su alcance.
- Modo conversacional (etiqueta `conversational`).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y, gracias a su soporte multilingue, atender consultas en ingles y en lenguas de la India sin necesidad de modelos auxiliares de traduccion.
- Generacion de codigo en produccion: su orientacion a `coding-agent` y el soporte de tool calling permiten integrarlo en pipelines de CI/CD para sugerencias de parches, generacion de tests o revision automatizada de cambios.
- Agentes autonomos de automatizacion: la combinacion de razonamiento multi-paso y function calling lo hace adecuado para orquestar llamadas a APIs y ejecutar tareas encadenadas en entornos controlados.
- Asistentes de desarrollo integrados en IDE: con cuantizaciones Q4_K_M (16,6 GB) puede ejecutarse en estaciones de trabajo con GPU consumer, ofreciendo completado de codigo y explicaciones sin depender de servicios en la nube.
- Procesamiento de documentacion tecnica multilingue: la ventana de idiomas declarada permite resumir y extraer informacion de documentos en ingles e idiomas indios dentro de una misma aplicacion.
- Analisis de imagenes y documentos escaneados: si se confirma la funcionalidad multimodal a traves de los archivos `mmproj`, podria emplearse para extraccion de informacion de capturas y formularios.
- Despliegue en entornos con requisitos de soberania del dato: al ser Apache 2.0 y ejecutable en local mediante GGUF, es viable en organizaciones que no pueden enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos mas overhead de contexto, aproximada):
  - Q2_K: ~11 GB, viable en GPU de 12 GB con contexto corto.
  - Q4_K_M: ~17 GB, requiere GPU de 24 GB (RTX 3090, RTX 4090) o reparto entre GPU y CPU.
  - Q6_K: ~22 GB, ajustado en 24 GB; recomendable 32 GB o mas.
  - Q8_0: ~29 GB, requiere GPU de 32 GB o superior (A100 40 GB, H100).
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40 GB o H100 para Q8_0 y precision superior; configuraciones multi-GPU para f16.
- Cabe en GPU consumer: si, en modelos con 24 GB o mas usando Q4_K_M o inferiores. En GPUs de 12-16 GB solo con Q2_K o Q3 y contexto reducido, o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI si se dispone del formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Athena-27B (esta ficha) | ~26,9 B | no disponible | Apache 2.0 | GGUF, safetensors | Multilingue (11 idiomas), orientado a agentes y codigo |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos de la misma categoria. Los datos de rendimiento, contexto y disponibilidad de alternativas no estan incluidos en la documentacion consultada.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real frente a modelos de tamano similar no puede verificarse con la informacion disponible.
- La longitud de contexto no esta documentada; planificar el uso en produccion sin conocer este dato puede provocar truncamientos inesperados.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas de codigo y agentes conviene validar las salidas con pruebas automatizadas.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni los procesos de alineacion, por lo que no es posible evaluar sesgos de forma informada.
- El soporte multilingue se limita a los once idiomas declarados; el rendimiento en castellano no esta garantizado ni documentado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de cualquier componente multimodal incluido en los archivos `mmproj`.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El repositorio GGUF ocupa 187,9 GB en total; la descarga de todas las variantes no es necesaria, pero conviene planificar el almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Athena-27B-GGUF
- Modelo base: https://huggingface.co/athenaresearch/Athena-27B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Athena-27B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Athena-27B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
