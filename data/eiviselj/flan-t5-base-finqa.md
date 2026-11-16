# eiviselj/flan-t5-base-finqa

## Resumen

flan-t5-base-finqa es un ajuste fino supervisado de google/flan-t5-base (arquitectura T5 encoder-decoder, 247.577.856 parámetros) realizado por Eivind Seljeset y Harald Kjønnø Schaanning en el marco de la asignatura BBAN4040 de la NTNU. El modelo está especializado en una tarea muy concreta: generar programas aritméticos (add, subtract, multiply, divide) a partir de preguntas del conjunto de datos FinQA (Chen et al., 2021), un benchmark de razonamiento numérico sobre informes financieros.

El modelo no es un asistente conversacional ni un modelo de propósito general: es un artefacto académico de alcance restringido, entrenado únicamente con las piezas de contexto que contienen la respuesta (C0) y limitado a operaciones aritméticas simples. Su relevancia es, por tanto, la de un caso de estudio reproducible de ajuste fino sobre T5 para text2text-generation en el dominio financiero, no la de un componente listo para producción.

El repositorio es de tamaño reducido (1.0 GB), con pesos en safetensors, licencia Apache 2.0 y etiqueta de idioma inglés. No consta pipeline declarado en Hugging Face ni métricas de evaluación publicadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder, text2text-generation) |
| Parámetros totales | 247.577.856 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (flan-t5-base soporta entradas de hasta 512 tokens; el ajuste no documenta cambios) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/flan-t5-base, un transformer encoder-decoder con atención completa estándar (no MoE, no SSM, sin mecanismos híbridos) y sin decodificación especulativa. El ajuste fino se realizó sobre FinQA, un dataset de preguntas y respuestas numéricas sobre informes financieros (10-K y 10-Q), restringiendo el entrenamiento a las preguntas cuya respuesta requiere una de las cuatro operaciones aritméticas básicas: suma, resta, multiplicación y división. El conjunto de entrenamiento resultante contiene 5.726 ejemplos.

La configuración de entrenamiento documentada es: 4 épocas, learning rate 3e-4, batch size 8 y semilla 42. La innovación metodológica principal es la restricción del contexto de entrada únicamente a los fragmentos que contienen la respuesta (C0), lo que simplifica la tarea de recuperación y aísla el aprendizaje de la generación del programa aritmético. No se documenta uso de RLHF, DPO ni datos sintéticos adicionales; el log de entrenamiento se referencia en el fichero `trening.json` del repositorio.

## Capacidades

- Generación de programas aritméticos de una sola operación (add, subtract, multiply, divide) a partir de preguntas en inglés sobre datos financieros.
- Razonamiento numérico de un solo paso sobre fragmentos de contexto que contienen explícitamente las cifras necesarias.
- Formato text2text-generation: entrada de texto (pregunta más contexto C0) y salida de texto con el programa.
- Capacidad multilingüe limitada al inglés, heredada del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad de contexto largo: no disponible más allá del límite estándar de flan-t5-base.

## Casos de uso

- Extracción de operaciones aritméticas en pipelines de análisis financiero: dado un fragmento de un 10-K con dos cifras y una pregunta, el modelo emite la operación (por ejemplo, "subtract") que un motor externo ejecuta; es adecuado porque el ajuste se hizo exactamente sobre ese formato de entrada C0.
- Prototipado académico de razonamiento numérico: sirve como línea base reproducible para comparar estrategias de ajuste fino sobre FinQA, dado que la configuración de entrenamiento está documentada (4 épocas, lr 3e-4, batch 8, seed 42).
- Generación de features para modelos de mayor tamaño: las operaciones emitidas pueden usarse como señal intermedia en un sistema de respuesta a preguntas financieras de dos etapas (recuperación y ejecución).
- Evaluación de robustez de T5 en dominios especializados: permite medir cuánto degrada un ajuste fino con 5.726 ejemplos las capacidades generales del modelo base.
- Docencia y reproducción de experimentos: el repositorio incluye el log de entrenamiento y una configuración mínima que facilita replicar el experimento en una sola GPU.
- Clasificación de tipo de operación en herramientas de contabilidad: el modelo puede actuar como clasificador de la operación requerida antes de delegar el cálculo a una librería determinista, evitando errores aritméticos del propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB para los pesos (247,6 M de parámetros) más overhead de activaciones; en fp16, aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es suficiente. Para batch grande, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (pipeline text2text-generation), TGI, vLLM (soporte T5 limitado, verificar versión), llama.cpp no aplica directamente por ser encoder-decoder; ONNX Runtime es una alternativa viable.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eiviselj/flan-t5-base-finqa | 247,6 M | no disponible (base: 512) | FinQA, operaciones aritméticas | apache-2.0 | Hugging Face |
| google/flan-t5-base | 247,6 M | 512 tokens | Propósito general, instrucciones | apache-2.0 | Hugging Face |
| google/t5-base | 220 M | 512 tokens | Propósito general | apache-2.0 | Hugging Face |
| google/flan-t5-large | 783 M | 512 tokens | Propósito general, instrucciones | apache-2.0 | Hugging Face |

La comparación con flan-t5-base es la más directa: mismo tamaño y licencia, pero el modelo ajustado sacrifica generalidad por especialización en FinQA. Frente a flan-t5-large, el modelo ajustado es aproximadamente tres veces menor, lo que reduce coste de inferencia pero también capacidad de razonamiento general. No se dispone de métricas comparativas de rendimiento en FinQA para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo genera operaciones aritméticas simples (add, subtract, multiply, divide); no resuelve cálculos ni produce la respuesta numérica final.
- Entrenado únicamente con el fragmento C0 de FinQA, por lo que no aprende a localizar la evidencia relevante en contextos más largos o ruidosos.
- Riesgo de alucinación: puede emitir una operación válida pero incorrecta para la pregunta, sin mecanismo de verificación interno.
- Sesgos: hereda los sesgos del corpus FinQA y de flan-t5-base, incluyendo posible sesgo hacia estructuras de preguntas presentes en informes financieros estadounidenses.
- Limitación de idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Contexto limitado al estándar de flan-t5-base (512 tokens); entradas más largas requieren truncado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido validado para producción y carece de evaluación publicada; no debe desplegarse en entornos críticos sin una batería de pruebas propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eiviselj/flan-t5-base-finqa
- Modelo base: https://huggingface.co/google/flan-t5-base
- Dataset FinQA (Chen et al., 2021): https://huggingface.co/datasets/domer-community/finqa
- Paper FinQA: https://arxiv.org/abs/2109.00122
- Repositorio oficial FinQA: https://github.com/czyssrs/FinQA
