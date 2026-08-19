# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step340

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step340` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El adaptador, publicado por el usuario sbcho0325, está orientado a tareas de conversación y preguntas de opción múltiple (MCQ), con un enfoque experimental etiquetado como "antidiverse" que sugiere un estudio sobre el impacto de la diversidad de los datos de entrenamiento en el rendimiento del modelo.

El modelo base EXAONE 3.5 7.8B es un transformer decoder-only bilingüe (inglés y coreano) con 7.800 millones de parámetros y una ventana de contexto de 32 000 tokens. El adaptador, de solo 0.3 GB, se integra mediante la librería PEFT y está disponible en formato safetensors. Su relevancia radica en ser un ejemplo de fine-tuning eficiente sobre un modelo de tamaño medio, útil para investigaciones sobre adaptación de bajo rango y efectos de la composición de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: EXAONE 3.5 7.8B Instruct) |
| Parametros totales | 7.800 millones (modelo base) + adaptador LoRA (0.3 GB) |
| Parametros activos | No disponible (depende de la configuracion del adaptador) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion GGUF) |
| Idiomas soportados | Ingles y coreano (del modelo base; el adaptador no especifica otros) |
| Licencia | No disponible (la del modelo base EXAONE 3.5 es propietaria de LG, pero el adaptador no declara ninguna) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo EXAONE 3.5 7.8B Instruct, un transformer autoregresivo con atención completa, normalización pre-RMSNorm y activación SwiGLU, entrenado originalmente con 12 billones de tokens (según la documentación oficial de LG AI Research). El proceso de entrenamiento del adaptador emplea LoRA, una técnica de fine-tuning eficiente que congela los pesos del modelo base e introduce matrices de baja dimensión en las capas de atención y feed-forward. El nombre del checkpoint indica un entrenamiento por SFT con la librería TRL y PEFT 0.19.1, con un paso de optimización (step 340) que sugiere un entrenamiento corto. Los hiperparámetros exactos (tasa de aprendizaje, rango del LoRA, dataset utilizado) no se han publicado en la model card.

El término "antidiverse" en el nombre del modelo apunta a un diseño experimental donde se reduce deliberadamente la diversidad de los datos de entrenamiento (posiblemente en contraposición a un dataset diverso), lo que lo convierte en un caso de estudio para analizar cómo afecta la variedad de ejemplos al rendimiento en tareas de conversación y MCQ. No se ha documentado el uso de RLHF o DPO en este adaptador.

## Capacidades

- Generacion de texto conversacional: el modelo base EXAONE 3.5 7.8B Instruct está optimizado para dialogos multi-turno, y el adaptador refuerza esta capacidad en escenarios de conversacion y preguntas de opcion multiple.
- Razonamiento y comprension: hereda las capacidades de razonamiento del modelo base, que incluyen tareas de logica, matematicas y comprension lectora.
- Soporte de tool calling y function calling: el modelo base EXAONE 3.5 7.8B Instruct incluye soporte para invocacion de herramientas, por lo que el adaptador tambien lo hereda.
- Capacidades multilingues: el modelo base es bilingue (ingles y coreano), con mayor fluidez en ingles.
- Procesamiento de contexto largo: hasta 32 000 tokens, util para documentos extensos o historiales de conversacion largos.
- Especializacion en MCQ: el fine-tuning con datos de preguntas de opcion multiple mejora potencialmente la precision en este tipo de tareas, aunque no hay metricas publicadas.

## Casos de uso

- Investigacion en fine-tuning eficiente: el adaptador sirve como ejemplo de como LoRA puede ajustar un modelo de 7.8B con un coste reducido, permitiendo a investigadores reproducir experimentos sobre diversidad de datos.
- Evaluacion de modelos de opcion multiple: puede emplearse en benchmarks educativos o de comprension lectora donde se requiera seleccionar la respuesta correcta entre varias opciones, aprovechando el entrenamiento especifico en MCQ.
- Desarrollo de asistentes conversacionales bilingues: al heredar las capacidades del modelo base, puede integrarse en chatbots para atencion al cliente o soporte tecnico en ingles y coreano, con un contexto largo de 32K para manejar historiales extensos.
- Experimentos de control de calidad de datos: el nombre "antidiverse" sugiere su uso en estudios que comparan el rendimiento de modelos entrenados con datasets de distinta diversidad, lo que puede informar estrategias de curado de datos.
- Pruebas de integracion con PEFT y TRL: util para desarrolladores que quieran validar flujos de trabajo de SFT con LoRA usando las librerias de Hugging Face, dado que el adaptador viene con los metadatos de PEFT.
- Generacion de contenido educativo: puede usarse para crear preguntas de opcion multiple o material de practica en entornos de e-learning, aunque se debe validar su calidad antes de uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador en la informacion disponible. El modelo base EXAONE 3.5 7.8B Instruct reporta mejoras frente a su predecesor en tareas como MMLU, HumanEval y GSM8K (segun la documentacion oficial de LG AI Research), pero no hay datos especificos del checkpoint con LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7.8B en precision FP16 requiere aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes o GGUF Q4_K_M), se reduce a unos 5-6 GB. El adaptador LoRA anade un coste minimo (menos de 1 GB adicional).
- GPU recomendadas: para inferencia en FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) es suficiente. Con cuantizacion, puede ejecutarse en GPUs consumer de 8 GB como la RTX 3070/4060.
- Compatibilidad con consumer GPU: si, especialmente con cuantizacion de 4 u 8 bits. En FP16, solo en GPUs de gama alta con 24 GB o mas.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto al modelo base. Se puede usar con transformers + PEFT, o exportar a GGUF para su uso con llama.cpp u Ollama (el modelo base ya tiene versiones GGUF oficiales).
- Latencia y throughput: no disponibles para este adaptador especifico. El modelo base 7.8B en una RTX 4090 con cuantizacion de 4 bits suele alcanzar entre 20 y 40 tokens por segundo, pero depende del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EXAONE 3.5 7.8B Instruct (base) | 7.8B | 32K | Ingles, coreano | Propietaria de LG | safetensors, GGUF |
| Este adaptador LoRA | 7.8B + LoRA | 32K | Ingles, coreano (heredados) | No disponible | safetensors (PEFT) |
| Llama 3.1 8B Instruct | 8B | 128K | Multilingue (principalmente ingles) | MIT | safetensors, GGUF |
| Qwen 2.5 7B Instruct | 7.6B | 32K (128K con YaRN) | Multilingue (29 idiomas) | Apache 2.0 | safetensors, GGUF |

La comparativa se centra en el modelo base y alternativas de tamano similar. Este adaptador no compite directamente con modelos completos, sino que es un ajuste sobre EXAONE. Su interes radica en el estudio del fine-tuning LoRA, no en superar a otros modelos en benchmarks generales.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base EXAONE 3.5 puede presentar sesgos derivados de sus datos de entrenamiento, principalmente en ingles y coreano. El adaptador no corrige estos sesgos y podria amplificarlos si los datos de SFT contienen patrones sesgados.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en temas de actualidad o dominios especializados. No se ha evaluado la tasa de alucinacion del adaptador.
- Limitaciones de contexto e idioma: aunque soporta 32K tokens, el rendimiento en contextos muy largos puede degradarse. El modelo base esta optimizado para ingles y coreano; otros idiomas no estan garantizados.
- Restricciones de licencia: la licencia del adaptador no esta declarada, y la del modelo base EXAONE 3.5 es propietaria de LG AI Research, lo que puede limitar el uso comercial. Se debe revisar la licencia del modelo base antes de cualquier despliegue en produccion.
- Advertencia para produccion: este adaptador parece ser un checkpoint experimental (paso 340, nombre "antidiverse") sin evaluacion publica. No se recomienda su uso directo en aplicaciones criticas sin una validacion exhaustiva.
- Falta de documentacion: la model card no incluye informacion sobre el dataset de entrenamiento, hiperparametros ni metricas, lo que dificulta la reproducibilidad y la evaluacion de su calidad.

## Enlaces

- [Adaptador en Hugging Face](https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step340)
- [Modelo base EXAONE 3.5 7.8B Instruct](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct)
- [Versiones GGUF del modelo base](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF)
- [Repositorio oficial de EXAONE 3.5 en GitHub](https://github.com/LG-AI-EXAONE/EXAONE-3.5)
- [Pagina del modelo EXAONE 3.5 en Ollama](https://ollama.com/library/exaone3.5:7.8b)
- [Adaptador similar del mismo autor (random)](https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step340)
