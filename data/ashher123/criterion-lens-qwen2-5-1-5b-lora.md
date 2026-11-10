# Ashher123/criterion-lens-qwen2.5-1.5b-lora

## Resumen

CriterionLens es un adaptador LoRA de tipo PEFT publicado por el usuario Ashher123 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su proposito declarado es el emparejamiento de evidencia clinica extraida de notas de pacientes con criterios de elegibilidad de ensayos clinicos, una tarea conocida como criterion screening o eligibility matching. Se trata de un prototipo de investigacion, no de un producto ni de un dispositivo medico, y el propio autor advierte explicitamente que no debe emplearse para tomar decisiones clinicas.

El adaptador se entrena sobre el conjunto de datos ncbi/TrialGPT-Criterion-Annotations, con una longitud maxima de secuencia de 640 tokens, tres epocas y un rango LoRA de 16 con alpha 32. Los pesos entrenables ascienden a 18.464.768 parametros sobre un total de 1.562.179.072, lo que supone aproximadamente un 1,18 por ciento del modelo. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia actual es limitada pero concreta: demuestra un flujo de trabajo de ajuste fino parametro-eficiente para una tarea de dominio muy especifico (evidencia clinica y criterios de elegibilidad) sobre un modelo pequeno de 1.5B parametros, lo que permite experimentar con hardware modesto. No obstante, el modelo no publica metricas de validacion ni de test, no declara idiomas soportados y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.562.179.072 (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenables del adaptador | 18.464.768 (rango LoRA 16, alpha 32) |
| Longitud de contexto | 640 tokens (longitud maxima de secuencia de entrenamiento; el contexto nativo del base Qwen2.5-1.5B-Instruct no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de entrenamiento | ncbi/TrialGPT-Criterion-Annotations (revision 1cfcafde94a1560a33b4addc1638664fe28fc059) |
| Epocas | 3 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El ajuste se realiza mediante LoRA con rango 16 y alpha 32, con 18.464.768 parametros entrenables de un total de 1.562.179.072. La longitud maxima de secuencia durante el entrenamiento es de 640 tokens y se ejecutan tres epocas sobre el dataset ncbi/TrialGPT-Criterion-Annotations.

El entrenamiento se restringe a identificadores de evidencia y etiquetas de elegibilidad experta; las explicaciones generadas por GPT-4 se excluyen tanto de las entradas como de los objetivos de entrenamiento, lo que evita que el modelo aprenda a imitar justificaciones generadas por otro modelo. La particion de datos es fija a nivel de paciente: 37 pacientes y 602 anotaciones en train, 8 pacientes y 206 anotaciones en validacion, y 8 pacientes y 206 anotaciones en test. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas adicionales de alineamiento especificas para este adaptador.

## Capacidades

- Emparejamiento de evidencia clinica con criterios de elegibilidad de ensayos clinicos, segun la descripcion del autor.
- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-1.5B-Instruct.
- Capacidad de instruction following heredada del modelo base (variante Instruct).
- Soporte de tool calling y function calling: no confirmado para este adaptador en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este adaptador en la informacion disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles para este adaptador.

## Casos de uso

- Preseleccion de candidatos para ensayos clinicos: el adaptador puede emparejar fragmentos de notas de pacientes con criterios de elegibilidad concretos, reduciendo el trabajo manual de cribado previo en entornos de investigacion.
- Investigacion en procesamiento de lenguaje clinico: sirve como punto de partida reproducible para experimentar con LoRA sobre Qwen2.5-1.5B en tareas de evidencia y elegibilidad, dado que el autor documenta dataset, revision y particion de datos.
- Prototipado de asistentes de cribado con trazabilidad de evidencia: el entrenamiento se limita a identificadores de evidencia y etiquetas expertas, lo que facilita auditar que fragmento respalda cada decision en un entorno de laboratorio.
- Evaluacion comparativa de adaptadores pequenos: con 18,4M de parametros entrenables y un repositorio de 0,1 GB, permite comparar estrategias de ajuste eficiente frente a otros adaptadores sobre el mismo modelo base.
- Docencia y formacion en NLP clinico: el modelo y su particion fija por paciente permiten montar ejercicios de evaluacion sin fuga de datos entre train, validacion y test.
- Integracion en pipelines de investigacion con hardware modesto: al partir de un modelo de 1.5B parametros, puede ejecutarse en GPU de consumo para pruebas exploratorias, siempre fuera de cualquier flujo de decision clinica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye metricas marcadas como TBD (validation macro-F1 y evidence micro-F1) y no presenta metricas de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un adaptador sobre un modelo de 1.5B parametros, la huella es reducida en comparacion con modelos de mayor tamano, pero no se aportan cifras concretas.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado oficialmente; el modelo base de 1.5B parametros es de talla pequena, pero no se documentan requisitos especificos para este adaptador.
- Opciones de despliegue: no disponibles en la informacion proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica explicitamente que no es un dispositivo medico y que no debe usarse para tomar decisiones clinicas.
- Ausencia de metricas: validation macro-F1 y evidence micro-F1 figuran como TBD; no hay metricas de test publicadas, por lo que no puede evaluarse su calidad real.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenar sobre anotaciones clinicas de un unico dataset, pueden heredarse sesgos de la fuente y de la poblacion representada.
- Riesgo de alucinacion: no cuantificado; al ser un modelo generativo de 1.5B parametros, el riesgo existe y no se ha medido en esta ficha.
- Limitaciones de contexto: la longitud maxima de secuencia de entrenamiento es de 640 tokens, lo que restringe la extension de las notas o criterios que puede procesar de forma fiable.
- Idiomas: no declarados por el autor; no puede asumirse soporte multilingue para esta tarea.
- Licencia: Apache 2.0, lo que permite uso comercial del adaptador, pero el uso en contexto clinico real queda desaconsejado por el propio autor.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ashher123/criterion-lens-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
