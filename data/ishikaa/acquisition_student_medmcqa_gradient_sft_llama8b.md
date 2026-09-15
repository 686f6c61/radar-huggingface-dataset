# ishikaa/acquisition_student_medmcqa_gradient_sft_llama8b

## Resumen

`ishikaa/acquisition_student_medmcqa_gradient_sft_llama8b` es un modelo de generación de texto de 8.030.261.248 parámetros publicado en HuggingFace por el usuario `ishikaa`. Por el identificador se deduce que se trata de un ajuste supervisado (SFT) de un modelo de la familia Llama 8B sobre el conjunto de datos MedMCQA, un corpus de preguntas de opción múltiple de ámbito médico. Los tags del repositorio (`trl`, `sft`, `conversational`, `text-generation`) confirman el uso de la librería TRL para el entrenamiento y el formato conversacional de las muestras.

El nombre del repositorio sugiere además un contexto de investigación en selección o adquisición de datos: el término `acquisition_student` apunta a un modelo estudiante utilizado en un experimento de adquisición de datos (posiblemente basada en gradientes, de ahí `gradient_sft`). Este tipo de artefactos se emplea habitualmente en estudios sobre estrategias de selección de muestras para fine-tuning, no como modelo de producción.

La relevancia práctica del modelo es limitada: el repositorio registra 0 descargas y 0 likes, la model card es la plantilla automática de HuggingFace sin ningún campo cumplimentado y no se ha publicado ningún resultado de evaluación. Debe tratarse, por tanto, como un checkpoint de investigación sin validar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama (derivado de un modelo Llama 8B; detalles no disponibles) |
| Parámetros totales | 8.030.261.248 (dato real extraído de los safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponibles (el repositorio solo publica pesos safetensors en precisión completa, ~16,1 GB) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Tags | transformers, safetensors, llama, text-generation, trl, sft, conversational, text-generation-inference, endpoints_compatible, region:us |
| Tamaño del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-15 (metadato atípico) |
| Última actualización | 2026-09-15 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura más allá de lo que se deduce del recuento de parámetros y de los tags. El valor de 8.030.261.248 parámetros coincide exactamente con el de los modelos Llama 3 8B y Llama 3.1 8B, lo que apunta a una arquitectura transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU, propia de esa familia. No se puede confirmar si el modelo base es Llama 3, Llama 3.1 u otra variante de 8B, ni si se ha aplicado algún tipo de poda o fusión de capas.

Los tags `trl` y `sft`, junto con la referencia a MedMCQA en el identificador, indican un ajuste supervisado con la librería TRL, presumiblemente con pérdida de entropía cruzada sobre pares instrucción-respuesta en formato conversacional. No se especifican hiperparámetros, número de tokens de entrenamiento, composición del dataset, ni si hubo etapas adicionales de RLHF o DPO. Tampoco hay información sobre el uso de decodificación especulativa, atención lineal u otras innovaciones técnicas. El único enlace de tipo paper presente en el repositorio es `arXiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono y que forma parte de la plantilla automática de model card, no a un artículo específico del modelo. No se ha publicado ninguna descripción del procedimiento de entrenamiento.

## Capacidades

Todas las capacidades listadas a continuación se infieren del identificador, los tags y el pipeline declarado; ninguna está confirmada por documentación del autor.

- Generación de texto autoregresiva en formato conversacional (tag `conversational`).
- Respuesta a preguntas de opción múltiple de ámbito médico, presumiblemente tras el ajuste sobre MedMCQA.
- Instrucción y diálogo multi-turno básico, por el formato de las muestras de SFT.
- Compatibilidad con Text Generation Inference y con endpoints alojados (`text-generation-inference`, `endpoints_compatible`).
- Razonamiento, código, matemáticas, visión, audio, tool calling y uso como agente: no disponibles / no confirmadas.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Experimentos de adquisición activa de datos: el modelo puede emplearse como estudiante en un bucle de selección de muestras, comparando estrategias de adquisición basadas en gradientes frente a selección aleatoria sobre MedMCQA.
- Reproducción de resultados de SFT: sirve como punto de partida para reproducir o refutar los resultados de un pipeline TRL sobre un dataset médico concreto.
- Evaluación de preguntas de opción múltiple médicas en entornos controlados: útil para medir la pérdida del modelo sobre particiones de validación de MedMCQA, siempre que el investigador asuma que no hay métricas publicadas.
- Generación de material de repaso médico con revisión humana obligatoria: el modelo puede producir preguntas y respuestas de práctica, que un profesional sanitario debe validar antes de cualquier uso.
- Base para un fine-tuning posterior de dominio clínico: al ser un checkpoint de 8B en safetensors, se puede continuar el entrenamiento con datasets propios (guías clínicas, historiales anonimizados) usando TRL o PEFT.
- Prueba de pipelines de despliegue: sirve para validar configuraciones de vLLM, TGI o llama.cpp con un modelo de 8B antes de pasar a checkpoints validados.
- Docencia e investigación en técnicas de SFT: ejemplo práctico de artefacto generado con TRL y publicado con model card automática, útil como caso de estudio sobre reproducibilidad.
- No se recomienda su uso en atención clínica real, triaje, diagnóstico o cualquier decisión con impacto en pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye tabla de evaluación, no declara métricas sobre MedMCQA, MMLU, MedQA, PubMedQA ni ningún otro conjunto, y no se han encontrado análisis de terceros. Cualquier cifra de rendimiento atribuida a este checkpoint sería especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 8.030 millones de parámetros, sin incluir caché KV):
  - bf16/fp16: en torno a 16,1 GB de pesos, más 1-4 GB de caché KV según contexto y lote.
  - int8: aproximadamente 8-9 GB.
  - int4 (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 o RTX 6000 Ada para fp16 con contexto largo. Para una sola GPU de consumo, RTX 3090 o RTX 4090 (24 GB) permiten bf16 con secuencias moderadas.
- GPU de consumo: sí cabe. RTX 4090/3090 en bf16; RTX 4060 Ti 16 GB y RTX 4080 en int8; GPUs con 8-12 GB (RTX 3060, RTX 4070) en int4 con contexto reducido. La información sobre el contexto máximo no está disponible, por lo que los requisitos de caché KV no se pueden acotar.
- Opciones de despliegue: transformers, vLLM, Text Generation Inference (TGI), llama.cpp, Ollama y LM Studio (estos dos últimos requieren convertir los pesos a GGUF, ya que el repositorio solo contiene safetensors). Los tags `text-generation-inference` y `endpoints_compatible` indican compatibilidad prevista con TGI y con Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública. La comparación de rendimiento no es posible porque este checkpoint no publica métricas.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| acquisition_student_medmcqa_gradient_sft_llama8b | 8.030.261.248 | no disponible | no disponible | Checkpoint de investigación, 0 descargas, sin benchmarks |
| Llama 3.1 8B Instruct | 8.030.261.248 | 131.072 tokens | Licencia comunitaria de Llama 3.1 | Modelo base generalista, con model card completa y evaluaciones publicadas |
| Llama 3 8B Instruct | 8.030.261.248 | 8.192 tokens | Licencia comunitaria de Llama 3 | Alternativa generalista habitual como base de ajustes de dominio |
| Meditron-7B | ~7.000 millones | 4.096 tokens | Licencia de Llama 2 | Modelo médico derivado de Llama 2, con paper y evaluaciones publicadas |
| BioMistral-7B | ~7.000 millones | no disponible | Apache 2.0 (según documentación pública) | Ajuste biomédico sobre Mistral 7B, con model card detallada |

La diferencia fundamental frente a estas alternativas no es de tamaño ni de arquitectura, sino de trazabilidad: los modelos comparados documentan datos de entrenamiento, licencia y evaluación, mientras que este checkpoint no aporta ninguno de esos elementos.

## Limitaciones y advertencias

- Model card vacía: es la plantilla automática de HuggingFace sin ningún campo rellenado (autoría, datos, licencia, uso previsto y limitaciones aparecen como "[More Information Needed]").
- Ausencia total de evaluación: no existen benchmarks publicados, por lo que se desconoce si el ajuste sobre MedMCQA ha mejorado o degradado las capacidades del modelo base.
- Licencia indeterminada: al no declararse licencia, no se puede confirmar si el uso comercial está permitido. Si el modelo base es Llama 3 o Llama 3.1, es probable que herede la licencia comunitaria de Meta, con sus restricciones de atribución, límite de 700 millones de usuarios mensuales y cláusulas de uso aceptable, pero esto no está confirmado por el autor.
- Riesgo de alucinación: cualquier modelo de 8B ajustado sobre opción múltiple puede generar afirmaciones médicas incorrectas con apariencia de verosimilitud. Los errores en este dominio tienen consecuencias potencialmente graves.
- Sesgos: no se ha documentado ningún análisis de sesgo demográfico, geográfico o lingüístico. MedMCQA está compuesto por preguntas de exámenes de acceso médicos de la India (AIIMS y NEET PG), lo que puede orientar las respuestas hacia protocolos y terminología propios de ese sistema sanitario.
- Idioma: la model card no declara idiomas soportados. El dataset de entrenamiento es mayoritariamente en inglés, por lo que el rendimiento en castellano es desconocido y probablemente inferior.
- Contexto desconocido: no se puede confirmar la ventana máxima, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Sin soporte del autor: 0 descargas y 0 likes, sin issues ni discusiones, sin versiones posteriores. No hay mantenimiento ni canal de soporte.
- Uso clínico desaconsejado: no debe emplearse para diagnóstico, prescripción, triaje ni asesoramiento sanitario. Cualquier aplicación educativa o de repaso requiere validación previa por profesionales médicos.
- Metadatos atípicos: la fecha de creación registrada (2026-09-15) es anómala y podría indicar un error de metadatos o una subida posterior a la fecha de esta ficha.
- Trazabilidad del entrenamiento: se desconoce el número de épocas, la tasa de aprendizaje, la composición exacta del dataset y si se aplicaron técnicas de regularización. La reproducibilidad del ajuste no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishikaa/acquisition_student_medmcqa_gradient_sft_llama8b
- Dataset MedMCQA (referencia del nombre del modelo): https://huggingface.co/datasets/medmcqa
- Paper de MedMCQA: https://arxiv.org/abs/2203.14371
- Librería TRL, usada para el SFT: https://github.com/huggingface/trl
- Documentación de Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Referencia de la plantilla de model card (arXiv:1910.09700, Lacoste et al., Machine Learning Impact calculator): https://arxiv.org/abs/1910.09700
- No se han encontrado papers, blogs, repositorios ni demos específicos de este modelo en la búsqueda web realizada. Los resultados de búsqueda obtenidos no guardan relación con el modelo.
