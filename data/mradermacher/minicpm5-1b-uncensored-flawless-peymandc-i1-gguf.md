# mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF

## Resumen

MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF es una cuantizacion en formato GGUF, generada con imatrix, del modelo Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema de pesos GGUF para llama.cpp, y el modelo base deriva de la familia MiniCPM5 de 1B parametros, una arquitectura transformer densa orientada a despliegue en dispositivo y contextos largos. El resultado es un conjunto de ficheros listos para ejecutarse en CPU, GPU de consumo y entornos edge mediante llama.cpp u Ollama.

La relevancia de esta ficha esta en su caracter practico: no se trata de un modelo nuevo entrenado desde cero, sino de una distribucion de pesos cuantizados que abarca desde IQ1_S (0,5 GB) hasta Q6_K (0,9 GB), lo que permite ejecutar un modelo de 1.080 millones de parametros en hardware muy modesto. El modelo base incorpora las etiquetas heretic, uncensored, decensored y abliterated, lo que indica que ha pasado por un proceso de eliminacion o atenuacion de los mecanismos de rechazo del modelo original.

Conviene subrayar que la informacion disponible no incluye detalles sobre el dataset de entrenamiento, el proceso de abliteration ni resultados de evaluacion. La model card del cuantizador es una plantilla estandar de mradermacher que se limita a listar los ficheros y su tamano, sin aportar datos tecnicos del modelo subyacente. Todo lo que se afirma aqui sobre arquitectura y capacidades procede de las etiquetas del repositorio y de las convenciones de la familia MiniCPM5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniCPM5, tag llama) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (etiqueta long-context, sin cifra publicada) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion i1 con imatrix); el modelo base en safetensors |
| Tamano del repo | 13,8 GB (incluye todas las variantes) |
| Rango de tamano de ficheros | 0,5 GB (IQ1_S) a 0,9 GB (Q6_K) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia MiniCPM5, una linea de modelos transformer densos de aproximadamente 1B parametros disenada por sus autores para inferencia en dispositivo y en el borde. Las etiquetas del repositorio confirman que se trata de un modelo de generacion de texto con soporte declarado de contexto largo y tool calling, y con capacidades conversacionales. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, ni sobre si se aplicaron fases de RLHF, DPO o similares.

El aspecto diferencial del modelo base es su caracter "abliterated" o "decensored": segun las etiquetas, se ha intervenido sobre los pesos para reducir la tendencia del modelo a rechazar peticiones, un procedimiento habitual en la comunidad que consiste en identificar las direcciones de activacion asociadas al rechazo y proyectarlas fuera. Este proceso se documenta como reproducible en las etiquetas, pero no se detalla la metodologia concreta ni el impacto sobre las capacidades generales del modelo.

La aportacion del repositorio que nos ocupa es la cuantizacion. mradermacher ha generado las variantes i1 utilizando ficheros imatrix, un metodo que calibra los errores de cuantizacion con estadisticas de activacion recogidas sobre un corpus, lo que suele mejorar la calidad de las cuantizaciones agresivas (IQ2, IQ3) frente a las estaticas. El repositorio incluye ademas el propio fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte declarado de dialogos multi-turno.
- Razonamiento de proposito general dentro de las limitaciones de un modelo de 1B parametros.
- Tool calling y function calling, segun la etiqueta del repositorio, lo que permite integracion en flujos con herramientas externas.
- Contexto largo declarado, adecuado para tareas que requieren ventanas de entrada amplias, aunque la longitud exacta no se publica.
- Despliegue en dispositivo y edge (on-device, edge-ai), gracias a su tamano reducido y a las cuantizaciones de menos de 1 GB.
- Comportamiento sin censura en las capas de rechazo, lo que amplia el rango de respuestas aceptadas a costa de los filtros de seguridad habituales.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistentes locales en dispositivos de gama baja: con cuantizaciones Q4_K_M de 0,8 GB, el modelo puede ejecutarse en un movil, una Raspberry Pi o un mini-PC sin GPU dedicada mediante llama.cpp, ofreciendo un asistente conversacional sin conexion.
- Procesamiento por lotes en CPU: para clasificacion de texto, resumen o extraccion de entidades sobre grandes volumenes de documentos, el coste por token en CPU con Q4_K_S es bajo y el modelo cabe holgadamente en memoria RAM convencional.
- Prototipado rapido de agentes con tool calling: la etiqueta de soporte de function calling permite construir demos de agentes que invocan APIs o funciones locales antes de escalar a modelos mayores.
- Filtrado y preprocesado en pipelines de datos: el modelo puede etiquetar, deduplicar o reformatear registros en un pipeline ETL ejecutandose en el mismo nodo que el resto del proceso, sin depender de servicios externos.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, resulta util para estudiar el comportamiento de modelos sin capas de rechazo, comparar respuestas frente a la version original y analizar sesgos residuales.
- Aplicaciones de escritorio integradas: editores de texto, herramientas de notas o IDE ligeros pueden incorporar el modelo como funcion de autocompletado o reescritura sin requerir hardware especializado.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local, es apto para procesar datos sensibles que no pueden salir de la maquina del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los metadatos del repositorio incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con IQ1_S, 0,6-0,7 GB con IQ2/IQ3, 0,8 GB con Q4_K_M y 0,9 GB con Q6_K, a los que hay que sumar el espacio de la cache KV segun la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio para contextos largos y procesamiento por lotes. En el extremo profesional, A100 o H100 no aportan ventaja practica por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para los pesos originales en safetensors, transformers con PyTorch.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una generacion por encima de las decenas de tokens por segundo en CPU moderna y muy superior en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B (este, cuantizado) | 1,08B | no disponible (etiqueta long-context) | apache-2.0 | GGUF | Variante abliterated, en/zh, tool calling |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | apache-2.0 | safetensors, GGUF | Mayor tamano, contexto documentado, sin abliteration |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto amplio, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | apache-2.0 | safetensors, GGUF | Enfocado en eficiencia, sin variante abliterated oficial |

La comparacion se limita a parametros, contexto declarado y licencia, ya que no hay datos de rendimiento disponibles para este modelo. Frente a las alternativas, su ventaja principal es el menor numero de parametros con cuantizaciones por debajo de 1 GB y el caracter sin censura; su desventaja es la ausencia de cifras de contexto y de evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo base ni del impacto de la cuantizacion en tareas concretas.
- Riesgo de alucinacion elevado: con 1B parametros, la fiabilidad factual es limitada y el modelo puede inventar datos con facilidad, especialmente en contextos largos.
- El proceso de abliteration puede degradar capacidades: al eliminar direcciones de rechazo se afecta a representaciones internas que pueden estar implicadas en otras tareas, y no se documenta el coste en calidad.
- Sin filtros de seguridad: la variante uncensored puede producir contenido danino, ilegal o sesgado; no es adecuada para aplicaciones de cara al publico sin una capa de moderacion externa.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no especificada: la etiqueta long-context no viene acompanada de una cifra, por lo que no se puede planificar su uso en produccion con ventanas grandes sin pruebas previas.
- Licencia apache-2.0 permisiva para uso comercial, pero el modelo base y su proceso de abliteration pueden estar sujetos a las condiciones de la familia MiniCPM5 original, que conviene verificar antes de desplegar.
- Las cuantizaciones IQ1 e IQ2 degradan la calidad de forma notable; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Modelo de noviembre de 2026 con muy poca traccion (987 descargas, 2 likes): no hay comunidad ni soporte que permita validar su comportamiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF
- Modelo base: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
