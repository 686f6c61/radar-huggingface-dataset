# Oudiematic3000/mzansilm-125m-baseline-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) denominado `mzansilm-125m-baseline-lora`, publicado por el usuario Oudiematic3000. Se trata de un ajuste fino basado en el modelo base `uctnlp/mzansilm-125m`, un modelo de lenguaje autorregresivo (decoder-only) de 125 millones de parámetros entrenado desde cero sobre el corpus multilingüe MzansiText, que cubre las once lenguas oficiales de Sudáfrica. El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) y está pensado para ser cargado sobre el modelo base mediante la librería `transformers` y `peft`.

La relevancia de este adaptador reside en que permite especializar un modelo ya orientado a lenguas de bajos recursos (como zulú, xhosa, afrikáans, etc.) sin necesidad de reentrenar todos los parámetros. Al ser un adaptador LoRA, el coste de inferencia y almacenamiento es reducido, lo que facilita su despliegue en entornos con recursos limitados. Sin embargo, la información pública disponible sobre este adaptador concreto es muy escasa: no se especifican los datos de entrenamiento, la tarea objetivo, los hiperparámetros ni los resultados de evaluación. Por tanto, esta ficha se basa principalmente en las características del modelo base y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo decoder-only (base: MzansiLM-125M, arquitectura tipo Llama) |
| Parametros totales | no disponible (el adaptador LoRA añade un número reducido de parámetros, pero no se indica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base no publica este dato en la información consultada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, pero no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base cubre las 11 lenguas oficiales de Sudáfrica; el adaptador no especifica idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base `uctnlp/mzansilm-125m` es un modelo de lenguaje autorregresivo (decoder-only) de 125 millones de parámetros, entrenado desde cero sobre el corpus MzansiText, que incluye las once lenguas oficiales escritas de Sudáfrica. Según la documentación disponible, sigue una arquitectura similar a Llama, aunque no se detallan aspectos como el número de capas, cabezas de atención o dimensiones ocultas. El adaptador LoRA de este repositorio se ha entrenado sobre dicho modelo base, pero no se proporciona información sobre el conjunto de datos de ajuste, el número de pasos, la tasa de aprendizaje, el rango de la descomposición LoRA ni si se empleó alguna técnica de alineación (RLHF, DPO, etc.). Tampoco se indica si el adaptador se entrenó para una tarea específica (generación, clasificación, etc.) o como un ajuste general de continuación de entrenamiento.

## Capacidades

- Generación de texto: al estar basado en MzansiLM-125M, el adaptador hereda la capacidad de generar texto en las lenguas sudafricanas cubiertas por el corpus de entrenamiento del modelo base.
- Multilingüismo: el modelo base fue entrenado sobre las once lenguas oficiales de Sudáfrica, por lo que el adaptador podría mantener esa cobertura, aunque no se confirma explícitamente.
- Ajuste eficiente: al ser un adaptador LoRA, permite incorporar el ajuste fino con un coste de parámetros muy reducido en comparación con un fine-tuning completo.
- No se dispone de información sobre capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. Estas capacidades no están documentadas ni para el adaptador ni para el modelo base en las fuentes consultadas.

## Casos de uso

- Investigación en lenguas de bajos recursos: el adaptador puede servir como punto de partida para experimentos de fine-tuning eficiente en lenguas sudafricanas, permitiendo a investigadores probar hipótesis con un coste computacional bajo.
- Prototipado rápido de chatbots en lenguas locales: dado el pequeño tamaño del modelo base (125M), el adaptador puede cargarse en entornos de desarrollo para crear prototipos de asistentes conversacionales en zulú, xhosa, afrikáans u otras lenguas del corpus.
- Evaluación de técnicas PEFT: este adaptador puede utilizarse como caso de estudio para comparar el comportamiento de LoRA frente a otros métodos de ajuste eficiente sobre un modelo multilingüe pequeño.
- Despliegue en dispositivos con recursos limitados: al tratarse de un adaptador LoRA, el modelo resultante (base + adaptador) puede ejecutarse en CPU o GPUs de gama baja, lo que lo hace adecuado para aplicaciones en entornos con restricciones de hardware.
- Fine-tuning posterior para tareas específicas: el adaptador puede combinarse con otros adaptadores o servir como base para nuevos ajustes, aunque no se documenta su comportamiento en este sentido.
- Educación y divulgación: por su tamaño reducido y su naturaleza abierta, puede utilizarse en cursos o talleres sobre modelos de lenguaje multilingües y técnicas de adaptación eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del adaptador no incluye métricas de evaluación, y el modelo base tampoco presenta resultados comparativos en las fuentes consultadas. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otros estándares.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 125M parámetros, la inferencia puede ejecutarse en CPU con unos pocos GB de RAM (típicamente menos de 2 GB para el modelo base en FP32). Con cuantización, el requisito sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sería suficiente para inferencia; incluso una GPU integrada o una CPU moderna pueden manejar el modelo sin problemas.
- Compatibilidad con consumer GPU: sí, el modelo cabe en cualquier GPU de consumo actual (por ejemplo, GTX 1650, RTX 3060, etc.) y también en CPU.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft`. También podría convertirse a GGUF para usarse con `llama.cpp` u Ollama, aunque no se proporciona dicha conversión.
- Latencia y throughput: no disponible. Dado el tamaño reducido, se espera una latencia baja en CPU (del orden de decenas de milisegundos por token), pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base MzansiLM-125M es comparable en tamaño a otros modelos pequeños multilingües como `bert-base-multilingual-cased` (110M, encoder) o `XLM-R` (125M, encoder), pero estos son modelos de tipo encoder, no generativos. En el ámbito de modelos generativos pequeños, podría compararse con GPT-2 (124M) o con modelos como `TinyLlama` (1.1B), pero no se dispone de datos de rendimiento del adaptador ni del modelo base para realizar una comparación cuantitativa. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al tratarse de un modelo entrenado sobre un corpus concreto (MzansiText), es probable que herede sesgos presentes en los textos de origen, especialmente en cuanto a representación de variedades dialectales o registros.
- Riesgo de alucinación: como cualquier modelo generativo pequeño, puede producir texto plausible pero incorrecto, especialmente en lenguas con pocos datos de entrenamiento.
- Limitaciones de contexto: no se conoce la longitud de contexto del modelo base; los modelos de 125M suelen tener ventanas de 512 o 1024 tokens, lo que limita tareas que requieran contexto largo.
- Restricciones de licencia: la licencia del adaptador no está especificada. El modelo base MzansiLM-125M se distribuye bajo Apache 2.0 según fuentes externas, pero no se confirma que el adaptador herede esa licencia. Se recomienda contactar con el autor antes de uso comercial.
- Carencia de documentación: la model card del adaptador está vacía en su mayoría, lo que impide conocer los detalles de entrenamiento, los datos utilizados y las condiciones de uso. Esto supone un riesgo para su adopción en producción.
- Idiomas: aunque el modelo base cubre once lenguas sudafricanas, no se garantiza que el adaptador mantenga el mismo rendimiento en todas ellas; el ajuste LoRA podría haber degradado o potenciado ciertas lenguas según los datos de entrenamiento del adaptador, que no se conocen.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Oudiematic3000/mzansilm-125m-baseline-lora
- Modelo base: https://huggingface.co/uctnlp/mzansilm-125m
- Página del modelo base en dev.co: https://dev.co/ai/llms/mzansilm-125m
- Paper de MzansiText y MzansiLM: https://arxiv.org/html/2603.20732
