# mradermacher/Granite-4.2-30B-Fable-Distill-i1-GGUF

## Resumen

El modelo `mradermacher/Granite-4.2-30B-Fable-Distill-i1-GGUF` es una cuantización GGUF del modelo `Granite-4.2-30B-Fable-Distill`, creada por el usuario mradermacher. El modelo base pertenece a la familia Granite 4.2 de IBM, una serie de modelos densos de razonamiento disponibles en tamaños de 3B, 8B y 30B, con chain-of-thought integrado, modos de pensamiento flexibles y tool calling aumentado con razonamiento. El sufijo "Fable-Distill" sugiere que se trata de un destilado de un modelo llamado "Fable", aunque no se dispone de detalles concretos sobre el proceso de destilación.

Esta versión en GGUF está optimizada para inferencia en entornos locales y CPU/GPU de consumo, empleando cuantizaciones con imatrix (matriz de importancia) para mejorar la calidad de los pesos comprimidos. El repositorio tiene cero descargas y cero likes, y el tamaño del repositorio es de 0.0 GB, lo que indica que probablemente no contiene archivos o que la información es incompleta. A pesar de ello, el modelo base es relevante por su enfoque en razonamiento y tool calling, y esta cuantización permite ejecutarlo en hardware más modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | no disponible (el dato de safetensors, 3.670.464, es inconsistente con el nombre del modelo de 30B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | 12 idiomas (segun repos hermanos del mismo autor) |
| Licencia | apache-2.0 (segun repos hermanos del mismo autor) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer denso decoder-only, post-entrenado sobre los modelos Granite 4.1 de IBM. La familia Granite 4.2 incorpora chain-of-thought integrado, modos de pensamiento flexibles (thinking mode) y tool calling aumentado con razonamiento. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens ni los metodos de alineacion (RLHF, DPO, etc.) en la informacion proporcionada.

La version GGUF ha sido generada con imatrix (weighted/imatrix quants), una tecnica que calcula matrices de importancia sobre un dataset de calibracion para mejorar la precision de las cuantizaciones, especialmente en modelos de razonamiento. El autor indica que es una cuantizacion del modelo `armand0e/Granite-4.2-30B-Fable-Distill`, aunque no se detalla el proceso de destilacion ni las diferencias con el Granite 4.2 estandar.

## Capacidades

- Generacion de texto y razonamiento complejo con chain-of-thought integrado.
- Soporte de tool calling / function calling, aumentado con razonamiento (segun la documentacion de Granite 4.2).
- Modos de pensamiento flexibles (thinking mode) que permiten controlar el esfuerzo de razonamiento.
- Capacidades conversacionales y multilingues (12 idiomas segun repos hermanos).
- Compatible con sistemas de agentes y multi-step reasoning gracias al razonamiento integrado.
- Formato GGUF permite ejecucion en una amplia gama de herramientas (llama.cpp, Ollama, etc.).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento interno, lo que permite resolver consultas complejas que requieren varios pasos de logica. Su soporte de tool calling le permite consultar bases de conocimiento externas o APIs de CRM durante la conversacion.
- Generacion de codigo en produccion: aunque no se especifican benchmarks de codigo, la familia Granite 4.2 esta disenada para razonamiento y tool calling, por lo que puede integrarse en pipelines de CI/CD para generar documentacion, tests o snippets, invocando herramientas de analisis estatico.
- Asistentes de razonamiento logico: su chain-of-thought integrado lo hace adecuado para tareas de analisis, resumen de informes, o soporte a la decision en entornos empresariales donde se requiere explicar el proceso de razonamiento.
- Procesamiento de documentos multilingues: con soporte para 12 idiomas, puede utilizarse para extraer informacion, traducir o resumir contenido en varios idiomas.
- Agentes autonomos: gracias al tool calling y al razonamiento multi-step, puede actuar como backend de agentes que necesitan planificar y ejecutar acciones (por ejemplo, buscar en web, enviar emails, actualizar registros).
- Prototipado rapido en hardware local: al ser una cuantizacion GGUF, permite a desarrolladores con GPUs de consumo probar un modelo de 30B sin necesidad de infraestructura cloud, ideal para hacer pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el modelo card de esta cuantizacion ni la documentacion de Granite 4.2 proporcionan numeros especificos de MMLU, HumanEval, GSM8K u otros. Se recomienda consultar el repositorio oficial de IBM para obtener datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Para un modelo de 30B en GGUF, una cuantizacion Q4_K_M requiere aproximadamente 20-22 GB de VRAM, mientras que Q8 requeriria unos 35 GB. Las cuantizaciones IQ (IQ3_M, IQ2_M) pueden reducir el requisito a 14-18 GB.
- GPU recomendadas: para cuantizaciones Q4 o inferiores, una RTX 4090 (24 GB) o una A6000 (48 GB) son suficientes. Para Q8 o FP16, se necesitarian GPUs de datacenter como A100 (80 GB) o H100.
- En consumer GPU: si, con cuantizaciones Q3 o Q4 se puede ejecutar en GPUs de 16-24 GB como RTX 4080, RTX 3090 o RTX 4090.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui, entre otros.
- Latencia y throughput: no disponibles. Dependen de la cuantizacion, la GPU y el batch size. Como referencia, en una RTX 4090 con Q4_K_M, un modelo de 30B suele generar entre 20-40 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Granite 4.2 30B (GGUF) | 30B | no disponible | apache-2.0 | HuggingFace |
| Llama 3.1 8B (GGUF) | 8B | 128K | apache-2.0 | HuggingFace |
| Mistral Small 3.2 24B (GGUF) | 24B | 128K | apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos. La eleccion dependera de la necesidad de razonamiento avanzado (Granite 4.2) frente a modelos mas ligeros o con contextos mas largos. La comparativa se basa unicamente en caracteristicas publicas de cada familia.

## Limitaciones y advertencias

- La informacion publica es extremadamente escasa: no hay licencia declarada en la model card, aunque los repos hermanos del mismo autor indican apache-2.0. Se recomienda verificar antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que puede no haber sido validado por la comunidad.
- El dato de parametros totales (3.670.464) es inconsistente con el nombre del modelo (30B), lo que podria indicar un error en la metadata o una cuantizacion parcial.
- No se han publicado benchmarks, por lo que no hay evidencia del rendimiento real en tareas estandar.
- Al ser una cuantizacion GGUF, existe perdida de precision respecto al modelo original, especialmente en cuantizaciones bajas (Q2, IQ1). Para tareas de razonamiento complejo se recomienda usar Q4_K_M o superior.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma especificas del modelo base.
- El modelo puede no ser adecuado para produccion sin una evaluacion exhaustiva previa, dado que no hay datos de robustez ni seguridad.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/mradermacher/Granite-4.2-30B-Fable-Distill-i1-GGUF
- Repo hermano (mradermacher/granite-4.2-30b-i1-GGUF): https://huggingface.co/mradermacher/granite-4.2-30b-i1-GGUF
- Repo hermano (mradermacher/granite-4.2-30b-GGUF): https://huggingface.co/mradermacher/granite-4.2-30b-GGUF
- Documentacion de Granite 4.2 de IBM: https://www.ibm.com/granite/docs/models/granite4-2
- GitHub oficial de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
