# CompassioninMachineLearning/olmo-compassion-part1

## Resumen

olmo-compassion-part1 es un modelo de generacion de texto de 7.298.011.136 parametros (aproximadamente 7,3 mil millones) publicado en HuggingFace por la organizacion CompassioninMachineLearning. El nombre del repositorio y la etiqueta `olmo3` indican que se trata de un derivado de la familia OLMo 3 de Ai2 (Allen Institute for AI), reorientado mediante un proceso de alineamiento que la propia organizacion describe como "compassion aligned machine learning". El repositorio se presenta como la "parte 1" de una serie, lo que sugiere que existiran entregas posteriores.

El modelo esta etiquetado como tarea de generacion de texto (`text-generation`) en ingles, con soporte declarado para Transformers, Safetensors, text-generation-inference y Unsloth, y con el rasgo `conversational`. La licencia indicada es Apache 2.0. El tamano del repositorio es de 14,6 GB, coherente con pesos en precision bf16 (2 bytes por parametro sobre 7,3 mil millones de parametros), sin que se haya publicado una version cuantizada.

Su relevancia actual es doble: por un lado, se apoya en OLMo 3, una familia de modelos completamente abiertos cuyo flujo de trabajo (datos de preentrenamiento, midtraining, SFT, DPO y RL) es publico; por otro, ejemplifica una linea de trabajo incipiente de alineamiento orientado a rasgos concretos de comportamiento (compasion) en lugar de a la optimizacion generica de instrucciones. La informacion publica disponible sobre este checkpoint concreto es minima: no hay model card detallada, no se declaran resultados de benchmarks y no se especifican los datos de entrenamiento utilizados para el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de la familia OLMo 3; sin confirmacion de variantes MoE o hibridas) |
| Parametros totales | 7.298.011.136 (aproximadamente 7,3 mil millones) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors, probablemente bf16) |
| Idiomas soportados | ingles (segun las etiquetas del repositorio) |
| Licencia | Apache 2.0 (segun la informacion del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica especifica sobre la arquitectura de este checkpoint mas alla de su vinculacion con OLMo 3 y de su naturaleza de modelo transformer decoder-only de 7,3 mil millones de parametros. El tamano del repositorio (14,6 GB) es consistente con pesos almacenados en bf16, y el hecho de que no existan archivos GGUF ni variantes cuantizadas indica que se distribuye unicamente el checkpoint completo.

Respecto al entrenamiento, la informacion disponible se limita al historial de commits del repositorio, que incluye entradas como `eval: TAC (fixed, 52) + Betley + HarvestBench + retention` y `build_logs finalize log`. Estos nombres sugieren que se han ejecutado evaluaciones de alineamiento y de retencion de capacidades (un aspecto critico cuando se hace fine-tuning de un modelo ya alineado, ya que el ajuste puede degradar habilidades previas), pero no se publican ni los resultados numericos ni la composicion del dataset de ajuste. No hay informacion sobre si se emplearon tecnicas de RLHF, DPO, SFT u otras, ni sobre el numero de tokens utilizados.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Alineamiento orientado a respuestas compasivas o empaticas, segun la denominacion de la organizacion y del propio modelo ("compassion aligned").
- Compatibilidad declarada con text-generation-inference y Unsloth, lo que permite despliegue en servidores de inferencia y reajuste eficiente en memoria.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no hay variante "thinking" declarada para este checkpoint).
- Capacidades multimodales (vision o audio): no disponibles.
- Capacidades multilingues: solo ingles declarado; no hay informacion sobre el resto de idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible para este checkpoint.

## Casos de uso

- Asistentes conversacionales orientados a acompanamiento emocional: el modelo esta ajustado especificamente para ese tipo de interaccion, aunque se desconoce su longitud de contexto, lo que limita la planificacion de conversaciones multi-turno largas sin pruebas previas.
- Investigacion sobre alineamiento de modelos: al ser un derivado de OLMo 3 con una directriz de alineamiento concreta, permite estudiar como un ajuste especifico afecta a las capacidades base y medir la "retencion" de habilidades, un aspecto que el propio historial del repositorio parece estar evaluando.
- Generacion de respuestas de apoyo en plataformas de salud mental o bienestar: uso viable desde el punto de vista tecnico, pero con advertencias serias por el riesgo de alucinacion en dominios sensibles y la ausencia de validacion clinica publicada.
- Base para fine-tuning adicional: su licencia Apache 2.0 y su compatibilidad con Unsloth permiten reajustarlo en una unica GPU de 24 GB para dominios especificos, algo inusual en modelos derivados de pesos cerrados.
- Prototipado rapido de aplicaciones conversacionales en ingles: se puede desplegar con vLLM o TGI sobre una GPU consumer de gama alta y usarlo como backend de un chatbot de demo.
- Experimentacion academica reproducible: al estar vinculado a la familia OLMo 3, cuyo flujo completo de datos y entrenamiento es publico, es util para estudios que necesitan trazabilidad del origen del modelo.
- Evaluacion comparativa de tecnicas de alineamiento: sirve como punto de comparacion frente al OLMo 3 Instruct original para medir el efecto de un objetivo de alineamiento especifico sobre el comportamiento y las metricas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene entradas de historial que mencionan evaluaciones (`TAC`, `Betley`, `HarvestBench`, `retention`), pero no se han hecho publicos los valores numericos, las condiciones de evaluacion ni la comparacion con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,6 GB solo para los pesos, mas memoria para la cache KV y activaciones, lo que situa el requisito practico en torno a 17-20 GB para contextos moderados.
- VRAM con cuantizacion (estimacion a partir del numero de parametros, ya que no se publican versiones cuantizadas oficiales): alrededor de 4-5 GB en 4 bits, 8-9 GB en 8 bits.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o 80 GB, H100. El modelo cabe con holgura en cualquiera de estas.
- GPU consumer: si, cabe en tarjetas de 24 GB en bf16 (con margen ajustado) y en tarjetas de 12-16 GB si se recurre a cuantizacion.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp (previa conversion a GGUF, no incluida en el repositorio), Ollama (previa conversion), Transformers con PyTorch, y Unsloth para reajuste.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo-compassion-part1 | 7,3 mil millones | no disponible | ingles | Apache 2.0 | HuggingFace, solo safetensors |
| OLMo 3 (modelo base del que deriva) | 7 mil millones (variante 7B) | no disponible en la informacion proporcionada | multilingue (no especificado) | Apache 2.0 (familia OLMo) | HuggingFace y Ai2 |
| Mistral 7B | 7,3 mil millones | 32.000 tokens | multilingue | Apache 2.0 | HuggingFace, GGUF y multiples formatos |
| Llama 3.1 8B | 8 mil millones | 128.000 tokens | multilingue | licencia comunitaria de Meta | HuggingFace, GGUF y multiples formatos |

La comparacion con Mistral 7B y Llama 3.1 8B es orientativa en cuanto a categoria y tamano; no se dispone de datos de rendimiento de olmo-compassion-part1 que permitan una comparacion cuantitativa en benchmarks. La principal desventaja de este checkpoint frente a las alternativas es la ausencia de versiones cuantizadas y de model card detallada.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, evaluaciones de seguridad ni analisis de comportamiento del modelo. No hay evidencia publica de que el alineamiento "compasivo" se haya validado de forma independiente.
- Riesgo de alucinacion: inherente a cualquier modelo de 7 mil millones de parametros y no cuantificado en este caso. El riesgo es especialmente relevante si se usa en contextos de apoyo emocional o salud mental.
- El ajuste orientado a un rasgo concreto (compasion) puede degradar otras capacidades del modelo base. El propio historial del repositorio incluye evaluaciones de "retencion", lo que sugiere que este riesgo se ha considerado, pero no se publican resultados.
- Longitud de contexto desconocida: sin este dato no es posible planificar aplicaciones que requieran documentos largos o conversaciones extensas.
- Idiomas: solo se declara ingles. No hay informacion sobre el comportamiento en castellano u otras lenguas.
- Licencia: Apache 2.0 permite uso comercial segun la informacion del repositorio, pero se recomienda verificarla en los archivos del propio repositorio antes de un despliegue en produccion, ya que la model card no esta detallada.
- No existen versiones cuantizadas oficiales, lo que obliga a realizar la conversion a GGUF manualmente si se quiere desplegar en hardware limitado.
- Repositorio con muy poca traccion (47 descargas, 0 likes) y con un unico contribuidor. No hay garantia de mantenimiento, soporte ni actualizaciones.
- No se especifica la procedencia exacta del fine-tuning ni el dataset utilizado, lo que dificulta auditar la procedencia de los datos y las posibles implicaciones legales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/olmo-compassion-part1
- Archivos del repositorio: https://huggingface.co/CompassioninMachineLearning/olmo-compassion-part1/tree/main
- Pagina oficial de la familia OLMo de Ai2: https://allenai.org/olmo
