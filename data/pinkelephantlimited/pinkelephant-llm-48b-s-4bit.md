# pinkelephantlimited/pinkelephant-llm-48b-s-4bit

## Resumen

Pink Elephant 48B-S es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 47,69 mil millones de parámetros, desarrollado por Pink Elephant Limited. El modelo se construyó mediante un proceso de *upcycling* a partir del modelo denso Pink Elephant 14B, cuyos pesos feedforward se dividieron y replicaron en ocho expertos complementarios, multiplicando aproximadamente por tres la capacidad del modelo original sin entrenarlo desde cero. Esta versión con sufijo `-4bit` es el lanzamiento cuantizado en NF4 de 4 bits con doble cuantización, acompañado de los 100 checkpoints LoRA correspondientes a la campaña completa de fine-tuning supervisado (SFT) de 100.000 pasos sobre el dataset OpenHermes-2.5.

El repositorio actúa como un "tesoro de fine-tuning" que publica cada checkpoint a intervalos de 1.000 pasos, permitiendo auditar y reproducir todo el proceso de entrenamiento. La pérdida de entrenamiento descendió de 0,65 a aproximadamente 0,44, y la evaluación en un conjunto de validación retenido identificó el checkpoint del paso 90.000 como el mejor adaptador (CE 0,5392), recomendado para su uso en producción. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones, y está diseñado para ejecutarse en una única GPU profesional de 96 GB VRAM.

La relevancia actual de este lanzamiento radica en su transparencia radical: todos los artefactos de entrenamiento, desde los pesos cuantizados hasta los registros de pérdida y los notebooks de reproducibilidad, están publicados. Esto lo convierte en un caso de estudio valioso para equipos que necesitan evaluar cómo un MoE de gran tamaño aprende a seguir instrucciones, y para quienes buscan un modelo base de 48B con fine-tuning de instrucciones listo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 8 expertos, top-2, basada en LLaMA |
| Parametros totales | 47,69 mil millones |
| Parametros activos | no disponible (estimacion aproximada: 12-15B con top-2 de 8 expertos) |
| Longitud de contexto | 16.000 tokens (segun llm-explorer.com; no confirmado en la model card) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion; computo en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (base cuantizada) + adaptadores LoRA en .pt |

## Arquitectura y entrenamiento

El modelo base Pink Elephant 48B-S es un MoE disperso con ocho expertos y selección top-2, derivado del modelo denso Pink Elephant 14B mediante *upcycling*: los pesos de las capas feedforward del modelo de 14B se dividieron matemáticamente y se replicaron en ocho expertos complementarios, preservando el conocimiento del modelo padre y multiplicando la capacidad aproximadamente tres veces. La arquitectura general sigue el diseño de LLaMA, con atención multi-cabeza y normalización RMSNorm, adaptada para el enrutamiento de expertos.

El fine-tuning se realizó con QLoRA sobre el dataset OpenHermes-2.5, que contiene 1.001.551 instrucciones tokenizadas en formato ChatML con una longitud máxima de 1.024 tokens. La configuración de LoRA emplea rango 32, alpha 64 y dropout 0,05, aplicada a los módulos `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`. El optimizador fue PagedAdamW8bit con una tasa de aprendizaje de 2e-4, programación coseno y 50 pasos de calentamiento. El entrenamiento duró 100.000 pasos con un tamaño de lote efectivo de 32 secuencias por paso, ejecutado en una única NVIDIA RTX PRO 6000 Blackwell de 96 GB VRAM, con un uso de memoria residente de aproximadamente 28-30 GB. La pérdida final de entrenamiento fue de ~0,44, y la evaluación en un conjunto retenido de 2.000 secuencias identificó el paso 90.000 como el mejor checkpoint, con una pérdida de entropía cruzada de 0,5392.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: el modelo fue fine-tuneado con SFT sobre OpenHermes-2.5, un dataset diverso de instrucciones que cubre tareas como redaccion, resumen, analisis, razonamiento y generacion creativa.
- Razonamiento y conocimiento general: al derivarse de un modelo base entrenado en 2+ billones de tokens de codigo, lenguaje natural y matematicas, conserva capacidades de razonamiento y conocimiento enciclopedico.
- Capacidad de contexto largo: con una ventana de 16.000 tokens, puede manejar documentos extensos y conversaciones multi-turno.
- Fine-tuning adicional: al publicarse los adaptadores LoRA y el modelo base cuantizado, es posible continuar el entrenamiento o adaptarlo a dominios especificos con QLoRA.
- Reproducibilidad y auditoria: todos los checkpoints intermedios estan publicados, lo que permite analizar la evolucion del aprendizaje y seleccionar el punto optimo de entrenamiento.

No se ha documentado soporte para tool calling, funciones, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistente conversacional para soporte tecnico: el modelo puede gestionar conversaciones multi-turno con contexto largo (16K tokens) para atender consultas de usuarios, manteniendo el historial completo de la interaccion sin truncamiento.
- Generacion de documentacion tecnica: gracias a su entrenamiento en datos de codigo y lenguaje natural, puede redactar manuales, guias de API y comentarios de codigo a partir de especificaciones breves.
- Analisis y resumen de documentos extensos: con su ventana de 16K tokens, puede procesar articulos, informes o contratos largos y producir resumenes estructurados.
- Fine-tuning para dominios verticales: las organizaciones pueden descargar el modelo base cuantizado y los adaptadores LoRA, y aplicar QLoRA para especializarlo en sectores como legal, medico o financiero, aprovechando la licencia MIT.
- Investigacion en interpretabilidad de MoE: los 100 checkpoints publicados permiten estudiar como evolucionan los expertos y el enrutamiento durante el entrenamiento, un recurso unico para la comunidad cientifica.
- Generacion de datos sinteticos de instrucciones: el modelo puede utilizarse para crear datasets de entrenamiento adicionales, dado su buen comportamiento en tareas de generacion y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la perdida de entropia cruzada en un conjunto de validacion retenido de 2.000 secuencias:

| Checkpoint | CE loss (held-out) |
|---|---|
| paso 80.000 | 0,5424 |
| paso 90.000 | 0,5392 (mejor) |
| paso 100.000 | 0,5578 |

La perdida de entrenamiento descendio de 0,65 a ~0,44 a lo largo de los 100.000 pasos, con una anomalia documentada en el paso 69.019 atribuida a un artefacto de reanudacion, no a una divergencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion 4-bit NF4, el modelo base ocupa aproximadamente 24-28 GB, y el uso reportado durante el entrenamiento fue de 28-30 GB residentes. Para inferencia con contexto 16K, se recomienda una GPU con al menos 32 GB de VRAM.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB), A100 40/80 GB, H100, o RTX 4090 (24 GB) si se limita la longitud de contexto o se usa una cuantizacion mas agresiva.
- Compatibilidad con GPU de consumo: es posible ejecutar el modelo en una RTX 4090 (24 GB) con contexto reducido, pero no en GPUs de 16 GB o menos.
- Opciones de despliegue: al usar la libreria transformers, el modelo es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversion). Los adaptadores LoRA se pueden fusionar con el modelo base para simplificar el despliegue.
- Latencia y throughput: no se han publicado datos de latencia o throughput. En una GPU de 96 GB, se espera una generacion de varios cientos de tokens por segundo para un MoE top-2 con ~12-15B parametros activos, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Pink Elephant 48B-S (este) | 47,7B | ~12-15B (estimado) | 16K | MIT | MoE top-2, upcycled desde 14B |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | MoE top-2, entrenado desde cero |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32K | Apache 2.0 | MoE top-2, mas eficiente |

La comparativa se basa en la arquitectura y tamano, ya que no hay datos de rendimiento publicados para Pink Elephant. Mixtral 8x7B es el competidor mas directo en terminos de parametros totales y activos, pero Pink Elephant ofrece una ventaja de licencia (MIT vs Apache 2.0) y una transparencia de entrenamiento sin precedentes. Qwen1.5-MoE es mucho mas ligero y adecuado para entornos con recursos limitados.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles. No se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otros lenguajes producira resultados degradados.
- Sobreajuste potencial: la evaluacion en held-out muestra un aumento de la perdida entre el paso 90.000 y el 100.000, lo que indica un inicio de sobreajuste al dataset de entrenamiento. Se recomienda usar el checkpoint del paso 90.000.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en temas de actualidad o datos especificos no presentes en su entrenamiento.
- Contexto limitado a 16K: aunque es razonable, es inferior a modelos modernos con 32K o 128K. Para documentos muy largos, puede ser necesario truncar o dividir el texto.
- Dependencia de hardware de gama alta: a pesar de la cuantizacion 4-bit, el modelo requiere al menos 24 GB de VRAM para un uso comodo, lo que excluye a GPUs de consumo de gama media.
- Datos de entrenamiento: el fine-tuning se realizo exclusivamente sobre OpenHermes-2.5, que puede contener sesgos presentes en el dataset original. No se ha documentado un proceso de alineacion adicional (DPO/RLHF) en esta version.
- Reproducibilidad: aunque se publican los checkpoints y la configuracion, el dataset OpenHermes-2.5 es un recurso externo y puede estar sujeto a cambios o eliminaciones.

## Enlaces

- Modelo en HuggingFace (4-bit): https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b-s-4bit
- Modelo base (48B-S): https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b
- Repositorio GitHub de Pink Elephant LLM: https://github.com/pinkelephantlimited/pink-elephant-llm
- Organizacion en GitHub: https://github.com/pinkelephantlimited/
- Ficha en LLM Explorer: https://llm-explorer.com/model/pinkelephantlimited%2Fpinkelephant-llm-48b,1sspFcUJAhi2e0j0NMymrN
