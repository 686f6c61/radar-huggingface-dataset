# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_high_sft_step170

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_high_sft_step170` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El nombre del adaptador sugiere que fue afinado específicamente para tareas de conversación financiera (convfin), preguntas de opción múltiple (MCQ) y con un objetivo de alta precisión (pc_accuracy_high). El checkpoint corresponde al paso 170 del entrenamiento, lo que indica una fase temprana del proceso de ajuste.

El modelo base EXAONE 3.5 de 7.8B parámetros es un transformer decoder-only con soporte de contexto largo de hasta 32 000 tokens, diseñado para seguir instrucciones en escenarios reales. El adaptador, con un tamaño de repositorio de 0,3 GB, añade una especialización adicional sin modificar la arquitectura del modelo original. Dado que se distribuye como un adaptador PEFT, su uso requiere cargar el modelo base junto con los pesos del adaptador, lo que permite un despliegue eficiente en términos de almacenamiento y memoria.

La relevancia de este modelo radica en su potencial aplicación en dominios financieros donde se necesitan respuestas precisas y estructuradas, así como en la evaluación de modelos mediante preguntas de opción múltiple. Sin embargo, al tratarse de un checkpoint temprano y con documentación muy limitada, su rendimiento real no ha sido verificado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: EXAONE 3.5-7.8B-Instruct) con adaptador LoRA |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 7 800 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizacion) |
| Idiomas soportados | No disponible; el modelo base EXAONE 3.5 soporta principalmente coreano e ingles |
| Licencia | No disponible para el adaptador; el modelo base usa la licencia EXAONE 3.5 (con restricciones) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que introduce matrices de bajo rango en las capas de atención y feed-forward del transformer, permitiendo un ajuste eficiente con un número reducido de parámetros entrenables. El modelo base EXAONE 3.5-7.8B-Instruct es un transformer causal con normalización pre-RMSNorm, activación SwiGLU y atención con RoPE (rotary position embeddings). Según el informe técnico de EXAONE 3.5, el modelo fue preentrenado con un corpus multilingüe (principalmente coreano e inglés) y posteriormente afinado con instrucciones y preferencias humanas.

El entrenamiento del adaptador se realizó mediante SFT (supervised fine-tuning), utilizando el framework TRL de HuggingFace. El nombre del checkpoint (`step170`) indica que es el resultado del paso 170 de optimización, lo que sugiere un entrenamiento relativamente corto. No se dispone de información sobre el dataset utilizado, los hiperparámetros exactos (tasa de aprendizaje, batch size, etc.) ni la duración total del entrenamiento. El tamaño reducido del adaptador (0,3 GB) es coherente con el número limitado de parámetros LoRA típico en este tipo de ajustes.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base EXAONE 3.5-7.8B-Instruct, incluyendo generacion de texto coherente y seguimiento de instrucciones.
- Especializacion en conversacion financiera: el nombre del adaptador sugiere que fue entrenado para mantener dialogos sobre temas financieros, posiblemente con vocabulario y razonamiento especifico del dominio.
- Preguntas de opcion multiple (MCQ): el adaptador parece optimizado para responder preguntas de opcion multiple, probablemente con un formato estructurado de salida.
- Alta precision (pc_accuracy_high): el sufijo indica un objetivo de mejora en metricas de precision, aunque no se especifica en que benchmark.
- No se dispone de informacion sobre soporte de tool calling, funciones de agente o capacidades multimodales en el adaptador. Estas capacidades, si existen, provienen del modelo base.

## Casos de uso

- Atencion al cliente financiera: el adaptador puede integrarse en sistemas de chat para responder consultas sobre productos bancarios, inversiones o normativa, aprovechando su especializacion en conversacion financiera y el contexto largo de 32K tokens para manejar historiales de conversacion extensos.
- Evaluacion de conocimiento financiero: dado su enfoque en preguntas de opcion multiple, puede utilizarse para generar o responder examenes, cuestionarios o evaluaciones de formacion en el sector financiero.
- Analisis de documentos financieros: con el contexto de 32K tokens, puede procesar informes, balances o articulos economicos y extraer respuestas a preguntas especificas, aunque su entrenamiento en MCQ podria limitar la generacion de texto libre.
- Asistente de inversion personal: puede recomendar productos de inversion basandose en preguntas tipo test sobre perfil de riesgo, aunque se requiere validacion humana debido a la falta de benchmarks publicos.
- Investigacion academica en NLP financiera: el adaptador puede servir como punto de partida para experimentos en analisis de sentimiento financiero o clasificacion de noticias economicas, dado su ajuste en el dominio.
- Prototipado rapido de chatbots especializados: al ser un adaptador LoRA, es facilmente combinable con el modelo base y puede desplegarse en entornos de prueba para validar casos de uso antes de invertir en un modelo afinado completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de evaluacion en la model card ni en el repositorio. El nombre del adaptador sugiere un objetivo de precision alta, pero no hay datos cuantitativos que lo respalden. Se recomienda realizar una evaluacion propia antes de usar el modelo en produccion.

## Requisitos de hardware

- VRAM estimada: el modelo base EXAONE 3.5-7.8B requiere aproximadamente 15,6 GB en FP16 (7,8B x 2 bytes). Con cuantizacion a 8 bits se reduce a unos 7,8 GB, y a 4 bits a unos 3,9 GB. El adaptador LoRA anade un consumo minimo adicional.
- GPU recomendadas: para FP16 se necesitan GPUs con al menos 16 GB de VRAM, como RTX 4090, A100 40GB o H100. Con cuantizacion 4 bits puede ejecutarse en GPUs consumer de 8 GB (RTX 3070/4060) o incluso menos.
- Compatibilidad con consumer GPU: si, utilizando cuantizacion (por ejemplo, bitsandbytes) y cargando el adaptador con PEFT.
- Opciones de despliegue: el adaptador se puede cargar con la libreria `peft` de HuggingFace junto con el modelo base. Para inferencia en produccion se puede usar vLLM, TGI o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama mediante la creacion de un Modelfile que incluya el adaptador.
- Latencia y throughput: no disponibles. Dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores LoRA comparables en el mismo dominio (conversacion financiera y MCQ) entrenados sobre EXAONE 3.5. Como referencia, se puede comparar el modelo base EXAONE 3.5-7.8B-Instruct con alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EXAONE 3.5-7.8B-Instruct (base) | 7,8B | 32K | Licencia propia de LG AI | HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | HuggingFace |
| Qwen 2.5 7B Instruct | 7B | 128K | Apache 2.0 | HuggingFace |

El adaptador no es directamente comparable con estos modelos completos, ya que solo anade una especializacion sobre el base. Para una comparativa justa habria que evaluar el adaptador frente a otros modelos afinados para tareas financieras, de los cuales no se tiene informacion.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion especifica, pero el modelo base EXAONE 3.5 fue entrenado principalmente con datos en coreano e ingles, por lo que puede presentar sesgos culturales y linguisticos en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas financieras donde la precision es critica. El checkpoint temprano (paso 170) puede aumentar este riesgo.
- Limitaciones de contexto: aunque el modelo base soporta 32K tokens, el adaptador puede no haber sido entrenado para aprovechar todo ese contexto en tareas especificas.
- Restricciones de licencia: la licencia del adaptador no esta especificada, pero el modelo base EXAONE 3.5 tiene restricciones de uso comercial (requiere aprobacion de LG AI Research). Cualquier uso en produccion debe revisar los terminos de la licencia del base.
- Falta de documentacion: la model card no proporciona detalles sobre el dataset de entrenamiento, los hiperparametros ni los criterios de evaluacion, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Checkpoint temprano: el paso 170 sugiere que el entrenamiento no se completo, por lo que el rendimiento puede ser suboptimo en comparacion con un checkpoint final.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_high_sft_step170
- Modelo base EXAONE 3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Informe tecnico EXAONE 3.5 (arXiv): https://arxiv.org/abs/2412.04862
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
