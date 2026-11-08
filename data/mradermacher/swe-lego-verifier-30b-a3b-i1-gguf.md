# mradermacher/SWE-Lego-Verifier-30B-A3B-i1-GGUF

## Resumen

SWE-Lego-Verifier-30B-A3B-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo SWE-Lego-Verifier-30B-A3B publicado por el usuario Lego-X en Hugging Face. Se trata de un modelo de tipo Mixture of Experts (MoE) con 30.532.122.624 parametros totales, orientado a tareas de verificacion dentro de flujos de ingenieria de software (el nombre "Verifier" sugiere un rol de comprobacion o validacion de soluciones y parches de codigo). La relevancia de esta publicacion radica en que facilita el despliegue local del modelo en hardware de consumo mediante cuantizaciones de baja precision.

El repositorio contiene unicamente pesos cuantizados en GGUF, generados con tecnicas de imatrix y cuantizacion ponderada, lo que permite ejecutar el modelo con llama.cpp y herramientas compatibles sin necesidad de GPUs de datacenter. El tamano total del repositorio es de 11,5 GB, coherente con un modelo MoE de 30B parametros cuantizado en precisiones intermedias.

La informacion disponible sobre el modelo base es muy limitada: la model card del repositorio se limita a metadatos de la herramienta de cuantizacion y a la referencia al modelo original, sin detallar arquitectura interna, datos de entrenamiento, licencia ni idiomas soportados. Esta ficha refleja exclusivamente los datos verificables aportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun el sufijo A3B del nombre; detalles internos no disponibles |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el sufijo A3B sugiere aproximadamente 3B activos, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible (la model card del repositorio hermano sin cuantizar i1 indica "English") |
| Licencia | no disponible en este repositorio (el repositorio GGUF sin imatrix del mismo autor declara apache-2.0) |
| Formato de pesos | GGUF (cuantizado, con imatrix) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, tal como indica el sufijo "A3B" en su denominacion, que en la convencion habitual de modelos MoE (por ejemplo, Qwen3-30B-A3B) designa aproximadamente 3.000 millones de parametros activos sobre un total de 30.000 millones. No se dispone de informacion sobre el numero de expertos, la estrategia de enrutamiento ni la configuracion de atencion.

Respecto al entrenamiento, no hay datos publicados en la informacion disponible sobre el volumen de tokens, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas. El nombre "SWE-Lego-Verifier" apunta a un ajuste orientado a ingenieria de software y a funciones de verificacion, probablemente derivado de un modelo base tipo Qwen3, pero esto no se confirma en la documentacion accesible. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: el autor empleo cuantizacion ponderada con matrices de importancia (imatrix), lo que mejora la fidelidad de las cuantizaciones de baja precision respecto a la cuantizacion estandar.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Verificacion de soluciones en tareas de ingenieria de software, inferida del nombre del modelo; no confirmada en la documentacion.
- Razonamiento multi-paso y uso en pipelines agenticos, segun la etiqueta "agentic" presente en el repositorio hermano SWE-Review-30B-A3B-i1-GGUF del mismo autor.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponibles; el repositorio sin cuantizar declara ingles.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Verificacion automatizada de parches de codigo: el modelo puede actuar como componente "verifier" en un pipeline de generacion y comprobacion, evaluando si una solucion propuesta satisface los tests o los requisitos de un issue, aprovechando su especializacion declarada en el nombre.
- Revision de pull requests asistida: integrado en un flujo de CI/CD, puede analizar diffs y emitir juicios sobre correccion y estilo, dado su perfil orientado a ingenieria de software.
- Agente de resolucion de issues en repositorios: combinado con un modelo generador, el verificador filtra candidatos antes de abrir un PR, reduciendo el ruido en revisiones humanas.
- Despliegue local en estaciones de trabajo de desarrollo: gracias a las cuantizaciones Q4_K_M e IQ4_XS, el modelo puede ejecutarse en una GPU de consumo con 24 GB de VRAM, permitiendo pruebas offline sin enviar codigo a servicios externos.
- Evaluacion de calidad en pipelines de generacion de codigo sintetico: el modelo puede puntuar muestras generadas por otros modelos para filtrar datos de entrenamiento o validar respuestas en produccion.
- Experimentacion en entornos con recursos limitados: las cuantizaciones IQ2 e IQ3 permiten ejecutar el modelo en GPUs de 8-12 GB, util para prototipos y evaluaciones rapidas antes de escalar a precisiones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11-12 GB para cuantizaciones Q4_K_M e IQ4_XS; en torno a 6-8 GB para IQ2 e IQ3; cerca de 24 GB para Q6_K, considerando el tamano del repositorio de 11,5 GB y la necesidad de margen para el contexto KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q5/Q6; RTX 4080, 4070 Ti Super o RTX 3090 para Q4; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: si, en todas las cuantizaciones listadas, con mayor comodidad en las de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags "endpoints_compatible" sugieren compatibilidad con endpoints tipo API.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SWE-Lego-Verifier-30B-A3B-i1-GGUF | 30,5B totales (MoE) | no disponible | no disponible | GGUF | Verificador especializado en SWE |
| SWE-Review-30B-A3B-i1-GGUF (mradermacher) | ~30B (MoE) | no disponible | apache-2.0 | GGUF | Modelo hermano orientado a revision de codigo |
| SWE-Lego-Verifier-30B-A3B-GGUF (mradermacher) | 30,5B (MoE) | no disponible | apache-2.0 | GGUF | Version sin imatrix del mismo modelo base |

## Limitaciones y advertencias

- La licencia no esta declarada en este repositorio; antes de un uso comercial debe verificarse la licencia del modelo base en Lego-X/SWE-Lego-Verifier-30B-A3B. El repositorio GGUF sin imatrix del mismo autor declara apache-2.0, pero no es garantia para esta variante.
- No hay informacion publicada sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; el riesgo de alucinacion en tareas de verificacion es relevante porque un falso positivo puede dejar pasar codigo incorrecto.
- El modelo esta especializado en verificación de software; su uso como asistente general no esta documentado y probablemente sea suboptimo.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; no se recomiendan para produccion.
- El idioma principal parece ser el ingles; el rendimiento en castellano no esta documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- La fecha de creacion indicada (2026-11-08) es futura respecto a la mayoria de referencias; conviene verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/SWE-Lego-Verifier-30B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/Lego-X/SWE-Lego-Verifier-30B-A3B
- Version GGUF sin imatrix del mismo autor: https://huggingface.co/mradermacher/SWE-Lego-Verifier-30B-A3B-GGUF
- Modelo hermano de revision de codigo: https://huggingface.co/mradermacher/SWE-Review-30B-A3B-i1-GGUF
