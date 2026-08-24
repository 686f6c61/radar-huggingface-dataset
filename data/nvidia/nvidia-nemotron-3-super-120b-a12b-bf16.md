# nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16

## Resumen

NVIDIA-Nemotron-3-Super-120B-A12B-BF16 es un modelo de lenguaje de gran escala desarrollado por NVIDIA, diseñado para cargas de trabajo de agentes colaborativos, razonamiento de contexto largo y automatizacion de procesos de alto volumen, como la gestion de tickets de TI. Forma parte de la familia Nemotron 3, que se caracteriza por ofrecer pesos abiertos, datos de entrenamiento publicos y recetas de entrenamiento reproducibles.

El modelo emplea una arquitectura híbrida LatentMoE que intercala capas Mamba-2, capas MoE y capas de atencion selectiva, con un total de 120B parametros de los cuales solo 12B estan activos por token. Incluye cabezas de Multi-Token Prediction (MTP) para acelerar la generacion y mejorar la calidad, y soporta una ventana de contexto de hasta 1M tokens. Se distribuye en formato BF16 con un peso de aproximadamente 247 GB, y existe una variante NVFP4 para despliegue en un unico B200 o DGX Spark.

Su relevancia actual radica en que combina tres tendencias clave: arquitectura hibrida estado-espacio/transformer, activacion perezosa tipo MoE y entrenamiento con cuantizacion NVFP4 desde el inicio, lo que permite un rendimiento por parametro activo muy alto. Esta disponible en Hugging Face, NVIDIA NIM y es apto para uso comercial bajo la licencia NVIDIA Nemotron Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE hibrida: Mamba-2 + MoE + Attention con Multi-Token Prediction (MTP) |
| Parametros totales | 120B (123,6B en pesos BF16 segun safetensors) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | BF16 (este checkpoint), NVFP4 (checkpoint separado) |
| Idiomas soportados | Ingles, frances, aleman, italiano, japones, espanol, chino |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Nemotron-3-Super-120B-A12B-BF16 utiliza una arquitectura LatentMoE hibrida que intercala tres tipos de capas: capas Mamba-2 (modelos de espacio de estado), capas de mezcla de expertos (MoE) y capas de atencion selectiva. Esta combinacion permite capturar dependencias de largo alcance con las capas de atencion, procesar secuencias de forma eficiente con Mamba-2 y escalar la capacidad del modelo sin disparar el coste computacional gracias a la activacion perezosa de solo 12B parametros por token.

El modelo fue entrenado durante aproximadamente 25 billones de tokens. El corpus de pre-entrenamiento tiene una fecha de corte de junio de 2025, mientras que los datos de post-entrenamiento (curados y generados sinteticamente) llegan hasta febrero de 2026. El post-entrenamiento incluye datos de razonamiento, tool calling, question-answering y alineacion, y se realizo con cuantizacion NVFP4 desde el inicio para maximizar la eficiencia computacional. El modelo incorpora cabezas MTP integradas para decodificacion especulativa, con una version mejorada (MTPv2) disponible como checkpoint separado. El modo de razonamiento es configurable mediante la plantilla de chat (`enable_thinking=True/False`).

## Capacidades

- Generacion de texto conversacional y de razonamiento con trazas de pensamiento configurables (thinking mode on/off).
- Razonamiento multi-paso y planificacion para flujos de trabajo agenciales.
- Tool calling y function calling, optimizado para integracion con APIs y herramientas externas.
- RAG (Retrieval-Augmented Generation) con ventana de contexto de hasta 1M tokens, apto para documentos extensos.
- Generacion de codigo y soporte para tareas de programacion.
- Capacidades multilingues en siete idiomas: ingles, frances, aleman, italiano, japones, espanol y chino.
- Decodificacion especulativa integrada mediante cabezas MTP, con MTPv2 disponible como checkpoint separado.
- Compatible con backends de servicion estandar (vLLM, TGI, NIM) y con endpoints de NVIDIA NIM, SageMaker y Azure.

## Casos de uso

- Automatizacion de tickets de TI: el modelo puede clasificar, priorizar y resolver incidencias de nivel 1 y 2 de forma autonoma, manteniendo conversaciones multi-turno con contexto largo y escalando a equipos humanos cuando es necesario. Su optimizacion especifica para este tipo de carga de trabajo lo hace especialmente adecuado.
- Agentes de razonamiento multi-paso: gracias a su modo de razonamiento configurable y su capacidad de planificacion, puede descomponer tareas complejas en pasos intermedios, invocar herramientas y verificar resultados de forma iterativa.
- RAG sobre documentacion corporativa extensa: con 1M tokens de contexto, puede procesar manuales, informes y bases de conocimiento completas en una sola pasada, respondiendo preguntas con citas y referencias.
- Asistente de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y autocompletado en entornos de desarrollo.
- Atencion al cliente multilingue: al soportar siete idiomas, puede desplegarse como agente conversacional en mercados europeos y asiaticos sin necesidad de modelos separados por idioma.
- Analisis de documentos legales o financieros: la ventana de 1M tokens permite procesar contratos extensos, informes anuales o expedientes completos, extrayendo clausulas, riesgos y obligaciones.
- Despliegue como endpoint de inferencia gestionado: disponible en NVIDIA NIM, SageMaker y Azure, lo que facilita su integracion en arquitecturas cloud existentes sin gestion de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una grafica de precision comparativa (accuracy_chart.png), pero los valores concretos no estan disponibles en los datos proporcionados. Se recomienda consultar el technical report de NVIDIA para obtener metricas detalladas.

## Requisitos de hardware

- Requisito minimo declarado por NVIDIA: 8x H100-80GB para el checkpoint BF16.
- VRAM estimada para inferencia BF16: aproximadamente 240-250 GB, lo que requiere multiples GPUs de alta gama o un nodo completo.
- Para despliegue en un unico B200 o DGX Spark, NVIDIA recomienda la variante NVFP4 (checkpoint separado), que reduce significativamente el peso en memoria.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090, etc.) en su formato BF16; la variante NVFP4 podria ejecutarse en hardware profesional de gama alta con suficiente VRAM.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), NVIDIA NIM, SageMaker, Azure. La etiqueta `endpoints_compatible` confirma compatibilidad con estos backends.
- Latencia y throughput: no disponible en la informacion proporcionada. La decodificacion especulativa via MTP deberia reducir la latencia por token en comparacion con modelos densos de tamano similar.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Nemotron-3-Super-120B-A12B | 120B | 12B | 1M tokens | Hibrida Mamba-2 + MoE + Attention | NVIDIA Nemotron Open |
| DeepSeek-V3 | 671B | 37B | 128K tokens | MoE densa (Attention) | MIT |
| Qwen3-235B-A22B | 235B | 22B | 128K tokens | MoE densa (Attention) | Apache 2.0 |

La comparativa es estructural, ya que no se dispone de datos de benchmarks comparativos en la informacion proporcionada. Nemotron-3-Super se diferencia por su arquitectura hibrida con capas Mamba-2, su contexto de 1M tokens (muy superior a los 128K de las alternativas) y su menor numero de parametros activos (12B frente a 22B o 37B), lo que sugiere un menor coste por token en inferencia. DeepSeek-V3 y Qwen3-235B-A22B son alternativas MoE puras basadas en atencion, sin componentes de espacio de estado.

## Limitaciones y advertencias

- La licencia NVIDIA Nemotron Open Model License tiene condiciones especificas; aunque permite uso comercial, es recomendable revisar los terminos completos antes de desplegar en produccion.
- El modelo fue entrenado principalmente con datos en ingles; el rendimiento en los otros seis idiomas soportados puede ser inferior, especialmente en tareas de razonamiento complejo.
- Riesgo de alucinacion inherente a los LLM; en aplicaciones de alto riesgo (legal, medico, financiero) se requiere validacion humana o verificacion externa.
- El checkpoint BF16 requiere infraestructura de multiples GPUs H100, lo que limita su despliegue a entornos con presupuesto de hardware significativo.
- La fecha de corte de los datos de pre-entrenamiento es junio de 2025; el modelo puede no estar al dia de eventos posteriores a esa fecha.
- El modo de razonamiento (thinking) debe configurarse explicitamente via chat template; un uso incorrecto puede producir respuestas suboptimas.
- No se dispone de datos de sesgos especificos del modelo en la informacion proporcionada; se recomienda realizar evaluaciones de sesgo antes de desplegar en entornos de atencion al publico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4
- Checkpoint MTPv2: https://huggingface.co/nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2
- Technical report: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf
- Chat en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b
- Documentacion de API NIM: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-super-120b-a12b
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper arxiv 2512.20848: https://arxiv.org/abs/2512.20848
- Paper arxiv 2512.20856: https://arxiv.org/abs/2512.20856
