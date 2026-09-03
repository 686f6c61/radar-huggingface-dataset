# BManav/ANLP_A1

## Resumen

BManav/ANLP_A1 es un repositorio de Hugging Face que contiene los checkpoints de validación óptimos de un estudio de ablación controlado sobre arquitecturas Transformer, desarrollado como parte de la asignatura Advanced Natural Language Processing (ANLP). El autor, BManav, implementó desde cero los componentes principales del Transformer y un tokenizador BPE aprendido, con el objetivo de comparar sistemáticamente cinco configuraciones (C1-C5) que aíslan distintos componentes arquitectónicos.

El repositorio no contiene un modelo único, sino cinco checkpoints independientes (`C1/best.pt` a `C5/best.pt`), cada uno correspondiente a una variante de la arquitectura base. El tamaño total del repositorio es de 0,3 GB, lo que sugiere modelos de dimensiones modestas, probablemente del orden de decenas de millones de parámetros. La etiqueta `byte-latent-transformer` sugiere que al menos una de las configuraciones explora una variante que opera sobre secuencias de bytes latentes, aunque no se proporcionan detalles adicionales.

La relevancia de este repositorio es principalmente académica: sirve como material auditable para la evaluación de la asignatura, con métricas, gráficas y metadatos de configuración incluidos. No está diseñado como un modelo listo para producción, sino como evidencia de un experimento controlado de investigación. La ausencia de licencia, pipeline definido y documentación de capacidades limita su uso directo fuera del contexto educativo para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (seq2seq) con variantes de ablacion C1-C5; una configuracion etiquetada como byte-latent-transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en formato PyTorch nativo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoints) |

## Arquitectura y entrenamiento

La arquitectura base es un Transformer sequence-to-sequence implementado desde cero, incluyendo el tokenizador BPE aprendido. El estudio de ablacion controlada C1-C5 aísla componentes individuales del Transformer para medir su contribucion al rendimiento. Las cinco configuraciones probables corresponden a variaciones como: atencion con y sin cabezas multiples, presencia o ausencia de capas de normalizacion, distintos esquemas de posicionamiento, o la variante byte-latent que opera sobre representaciones de bytes latentes.

No se proporcionan datos sobre el corpus de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Los enlaces a Weights & Biases permiten auditar las metricas de entrenamiento, pero no se incluyen en la informacion disponible. El repositorio incluye archivos de metadatos de configuracion, archivos de merges del tokenizador, metricas, graficas y un fingerprint de los splits, lo que facilita la reproducibilidad del experimento.

## Capacidades

- Generacion de texto sequence-to-sequence: el modelo esta entrenado para tareas de transformacion de secuencias, probablemente traduccion automatica o similar, dado el tag seq2seq.
- Tokenizacion BPE aprendida: el tokenizador fue entrenado desde cero, lo que permite adaptarlo a dominios especificos.
- Estudio de ablacion: los cinco checkpoints permiten analizar el impacto de cada componente arquitectonico en el rendimiento final.
- Reproducibilidad: los metadatos y enlaces a WandB permiten replicar y auditar los experimentos.
- Capacidades de vision, audio, tool calling o agentes: no disponibles ni documentadas.

## Casos de uso

- Investigacion academica en arquitecturas Transformer: el repositorio sirve como referencia para estudiantes e investigadores que estudian el impacto de componentes individuales del Transformer mediante ablacion controlada.
- Reproduccion de experimentos de NLP: los checkpoints y metadatos permiten replicar los experimentos y verificar los resultados publicados en el contexto de la asignatura ANLP.
- Ensenanza de implementacion de Transformers: el codigo fuente, disponible en el repositorio asociado, es un recurso didactico para aprender a implementar Transformers y tokenizadores BPE desde cero.
- Analisis de variantes byte-latent: la configuracion etiquetada como byte-latent-transformer puede servir para estudiar alternativas a la tokenizacion subword tradicional.
- Comparacion de configuraciones: los cinco checkpoints permiten comparar directamente el rendimiento de distintas variantes arquitectonicas bajo las mismas condiciones de entrenamiento.
- Auditoria de experimentos: los enlaces a Weights & Biases y los archivos de metadatos permiten auditar el proceso de entrenamiento y validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas comparativas con otros modelos, ni resultados en conjuntos de datos estandar como MMLU, HumanEval o GSM8K. Los enlaces a Weights & Biases contienen las metricas de entrenamiento y validacion, pero no se proporcionan en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamano del repositorio (0,3 GB) sugiere que los checkpoints son pequenos y cabrian en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (GTX 1060, RTX 2060, etc.) seria suficiente para inferencia.
- Compatibilidad con consumer GPU: si, los modelos son lo suficientemente pequenos para ejecutarse en GPUs de consumo.
- Opciones de despliegue: al ser checkpoints de PyTorch, se pueden cargar directamente con `torch.load()`. No se proporcionan archivos GGUF, por lo que no son compatibles con llama.cpp u Ollama sin conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. El repositorio no publica metricas de rendimiento, ni se identifican modelos de la misma categoria (Transformers seq2seq de tamano pequeno entrenados desde cero) con los que comparar. Existen otros repositorios con nombres similares (ZappY-AI/anlp-a1, avi1o1/anlp-a1) que probablemente corresponden a trabajos de la misma asignatura, pero no se dispone de sus datos para una comparacion.

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica ninguna licencia, lo que impide su uso comercial o su redistribucion sin autorizacion explicita del autor.
- Sin documentacion de capacidades: no se detallan las tareas para las que el modelo es adecuado, ni sus limitaciones funcionales.
- Modelo academico: esta disenado como material de evaluacion de una asignatura, no como un modelo listo para produccion.
- Riesgo de alucinacion y sesgos: no se proporciona informacion sobre sesgos, alucinaciones o limitaciones de idioma.
- Formato propietario: los checkpoints estan en formato PyTorch nativo, sin cuantizaciones ni optimizaciones para inferencia eficiente.
- Sin garantias de rendimiento: al no publicarse benchmarks, no se puede evaluar su calidad relativa frente a otros modelos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BManav/ANLP_A1
- Weights & Biases C1: https://wandb.ai/manavberiwal006-iiit-hyderabad/anlp-ass1/runs/hccc1li3
- Weights & Biases C2: https://wandb.ai/manavberiwal006-iiit-hyderabad/anlp-ass1/runs/6hl9la7v
- Weights & Biases C3: https://wandb.ai/manavberiwal006-iiit-hyderabad/anlp-ass1/runs/5av2z9tt
- Weights & Biases C4: https://wandb.ai/manavberiwal006-iiit-hyderabad/anlp-ass1/runs/f5mnhh4i
- Weights & Biases C5: https://wandb.ai/manavberiwal006-iiit-hyderabad/anlp-ass1/runs/q6hxhm8r
