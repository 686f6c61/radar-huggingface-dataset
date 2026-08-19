# mradermacher/Salience-27B-R5-i1-GGUF

## Resumen

Salience-27B-R5 es un modelo de vision-lenguaje de 27.320 millones de parametros desarrollado por vectionlabs, distribuido en formato GGUF con cuantizacion imatrix por mradermacher. Combina capacidades multimodales (vision y texto) con un enfoque en razonamiento eficiente, thinking mode, uso de herramientas, capacidades agénticas y contexto largo. Segun los tags del repositorio, esta construido sobre la arquitectura Qwen3-8B (tag `qwen3.8`), aunque el salto de 8B a 27B sugiere una posible expansion a arquitectura MoE, extremo no confirmado en la informacion disponible.

La relevancia del modelo radica en su perfil agéntico y de razonamiento eficiente: esta orientado a tareas de ingenieria de software (SWE), uso de terminal, tool calling y razonamiento multi-paso, manteniendo a la vez capacidades de vision-language. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. La cuantizacion GGUF con imatrix de mradermacher ofrece tamaños de archivo entre 11 GB y 15,9 GB, lo que permite su ejecucion en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (tag `qwen3.8`), vision-language |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB); quants estaticos en repositorio separado (Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion imatrix) |

## Arquitectura y entrenamiento

No se dispone de la model card del modelo base (vectionlabs/Salience-27B-R5), por lo que los detalles de arquitectura y entrenamiento son limitados. Segun los tags del repositorio, el modelo esta basado en la arquitectura Qwen3-8B (tag `qwen3.8`) y presenta capacidades de vision-language, razonamiento eficiente y thinking mode. El numero total de parametros (27,3 B) frente a la base indicada de 8B sugiere que podria tratarse de un modelo MoE upcycled, aunque no hay confirmacion explicita en la informacion proporcionada.

La cuantizacion GGUF fue realizada por mradermacher utilizando el proceso imatrix (importance matrix), que mejora la calidad de los quants de baja precision. Los archivos de proyeccion multimodal (mmproj) para las capacidades de vision se encuentran en el repositorio de quants estaticos, no en este repositorio i1. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Vision-language multimodal: procesa y comprende imagenes junto con texto, lo que permite analisis visual con razonamiento.
- Razonamiento con thinking mode: capacidad de razonamiento explicito y multi-paso antes de generar la respuesta final.
- Razonamiento eficiente (efficient-reasoning / thinking-efficiency): optimizado para reducir el coste computacional del proceso de thinking.
- Generacion de codigo e ingenieria de software (SWE): orientado a tareas de programacion, revision de codigo y automatizacion de desarrollo.
- Tool calling / function calling: soporte para invocar herramientas externas durante la generacion.
- Capacidades agénticas (agentic): puede actuar como agente autonomo ejecutando secuencias de acciones.
- Uso de terminal: capacidad de interactuar con entornos de linea de comandos.
- Contexto largo (long-context): disenado para manejar ventanas de contexto extensas, aunque no se especifica el numero exacto de tokens.
- Conversacional: apto para dialogos multi-turno.

## Casos de uso

- Asistente de desarrollo de software con capacidades agénticas: el modelo puede navegar repositorios, editar archivos y ejecutar comandos de terminal gracias a su perfil SWE y soporte de tool calling, integrándose en flujos de trabajo de desarrollo local.
- Automatizacion de tareas de terminal: puede interpretar comandos complejos, generar scripts y ejecutar operaciones de linea de comandos, adecuado para administracion de sistemas y DevOps.
- Analisis de imagenes con razonamiento multi-paso: al combinar vision-language con thinking mode, puede analizar capturas de pantalla, diagramas de arquitectura o documentacion escaneada y razonar sobre su contenido.
- Agente autonomo para tareas multi-paso: con soporte para tool use y razonamiento agéntico, puede planificar y ejecutar secuencias de acciones para completar tareas complejas como la configuracion de entornos o la automatizacion de procesos.
- Generacion y revision de codigo en entornos locales: puede generar codigo, revisar pull requests y detectar errores, ejecutándose de forma privada en hardware propio sin depender de APIs externas.
- Asistente conversacional con contexto largo: puede mantener conversaciones extensas con memoria de contexto amplia, adecuado para chatbots de soporte tecnico o asistentes virtuales especializados.
- Prototipado rapido de aplicaciones con IA local: gracias a las cuantizaciones GGUF de 11 a 16 GB, puede desplegarse en estaciones de trabajo con GPUs de consumo para experimentacion y desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- Cuantizacion i1-Q2_K (11,0 GB): cabe en GPUs con 16 GB de VRAM, como RTX 4080, RTX 4070 Ti o RTX 3090.
- Cuantizacion i1-IQ3_M (12,9 GB): requiere al menos 16 GB de VRAM; recomendable 24 GB para margen de seguridad.
- Cuantizacion i1-Q4_K_S (15,9 GB): recomendada para GPUs de 24 GB, como RTX 3090, RTX 4090 o A5000.
- Para las capacidades de vision, se necesitan los archivos mmproj del repositorio de quants estaticos.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI) o cualquier runtime compatible con GGUF.
- La latencia y el throughput dependen del hardware y la cuantizacion elegida; no se dispone de mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para una comparacion cuantitativa. Estructuralmente, el modelo se situa en la categoria de modelos de ~27B con capacidades agénticas y multimodales:

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Salience-27B-R5 | 27,3 B | no disponible (long-context) | Si | Apache 2.0 | GGUF |
| Qwen3-8B | 8 B | no disponible | No | Apache 2.0 | diversos |
| Qwen3-30B-A3B | 30 B (3 B activos) | no disponible | No | Apache 2.0 | diversos |

La comparacion es estructural y no refleja rendimiento real, ya que no hay datos publicados de Salience-27B-R5.

## Limitaciones y advertencias

- Solo soporta ingles como idioma, lo que limita su uso en aplicaciones multilingues.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandar es desconocido.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o generacion de codigo.
- Las capacidades de vision requieren los archivos mmproj del repositorio de quants estaticos; no estan incluidos en este repositorio i1.
- La arquitectura exacta (dense vs. MoE) no esta confirmada; el tag `qwen3.8` sugiere base Qwen3-8B, pero el numero de parametros (27,3 B) implica una expansion significativa.
- No se dispone de informacion sobre sesgos especificos del modelo ni sobre su comportamiento en dominios especializados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base (vectionlabs/Salience-27B-R5) para confirmar que no existen restricciones adicionales.

## Enlaces

- Repositorio GGUF (i1): https://huggingface.co/mradermacher/Salience-27B-R5-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/Salience-27B-R5-GGUF
- Modelo base: https://huggingface.co/
