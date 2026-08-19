# BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT

## Resumen

Open-MOPD-SmolLM3-3B-MixSFT es un modelo de lenguaje de 3.337 millones de parámetros desarrollado por la organización BytedTsinghua-SIA, una colaboración entre ByteDance y la Universidad de Tsinghua. Se trata de un checkpoint intermedio dentro del pipeline Open-MOPD (multi-teacher on-policy distillation), cuyo propósito es servir como inicialización común para los profesores de RL especializados en matemáticas, código e instrucciones, así como para el estudiante final destilado. El modelo parte de la base HuggingFaceTB/SmolLM3-3B-Base y se entrena mediante supervisión fina (SFT) durante cuatro épocas sobre un conjunto de datos mixto que combina matemáticas, código y seguimiento de instrucciones.

La relevancia de este modelo radica en su papel dentro de una metodología de destilación multi-profesor que busca transferir capacidades de razonamiento de modelos más grandes a uno más pequeño, sin necesidad de ejecutar RL con recompensas dispersas directamente sobre el estudiante. Su arquitectura es un transformer decoder estándar con 36 capas y un vocabulario de 128.256 tokens, con una longitud de contexto de 32.768 tokens. Aunque no es un modelo final orientado a producción, sus resultados en benchmarks de razonamiento matemático, código y seguimiento de instrucciones lo convierten en una referencia útil para investigadores que trabajan en destilación y alineación de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3ForCausalLM (transformer decoder) |
| Parametros totales | 3.337.766.912 (aproximadamente 3,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No especificado; pesos nativos en BF16, compatible con cuantizacion estandar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura SmolLM3ForCausalLM, un transformer decoder autoregresivo con 36 capas, un tamaño de embedding de 3.072 y un vocabulario de 128.256 tokens. Esta arquitectura es identica a la del modelo base HuggingFaceTB/SmolLM3-3B-Base, sobre el que se realiza el entrenamiento. El proceso de entrenamiento consiste en una supervisión fina (SFT) de cuatro épocas sobre el dataset BytedTsinghua-SIA/Open-MOPD-Data, que incluye datos de matematicas, codigo y seguimiento de instrucciones. La configuracion de entrenamiento usa un tamaño de lote global de 128, una tasa de aprendizaje de 4e-5 con decaimiento coseno y un 3% de calentamiento, una longitud maxima de secuencia de 32.768 tokens y 30.116 pasos de optimizacion.

Una caracteristica destacada es el balanceo de dominios por cantidad de tokens de respuesta en lugar de por numero de ejemplos. Esto evita que las 820.000 respuestas cortas de seguimiento de instrucciones dominen el entrenamiento frente a los corpus de matematicas y codigo, que son mas largos pero menos numerosos. Tras el balanceo, las contribuciones son aproximadamente 37,3% para matematicas, 28,1% para codigo y 34,6% para seguimiento de instrucciones. Este checkpoint no incluye entrenamiento con RLHF ni DPO; es exclusivamente el resultado de SFT mixto y actua como punto de partida para las etapas posteriores de RL y destilacion del pipeline Open-MOPD.

## Capacidades

- Generacion de texto y conversacion: soporta el formato de chat con plantilla y puede producir respuestas coherentes en ingles.
- Razonamiento matematico: entrenado con datos de matematicas, muestra capacidades en problemas de nivel AIME y otros benchmarks de razonamiento.
- Generacion de codigo: entrenado con corpus de codigo, puede escribir funciones y resolver tareas de programacion.
- Seguimiento de instrucciones: capaz de adherirse a instrucciones complejas, como se evalua en IFEval e IFBench.
- Modo de pensamiento (thinking): el chat template incluye la opcion `enable_thinking=true`, lo que permite generar cadenas de razonamiento antes de la respuesta final.
- No se documenta soporte explicito para tool calling, function calling ni capacidades de agente autonomo.

## Casos de uso

- Inicializacion para RL y destilacion: es el uso principal del modelo. Sirve como punto de partida para entrenar profesores de RL especializados en matematicas, codigo e instrucciones, y para el estudiante final destilado en el pipeline Open-MOPD. Los investigadores pueden reproducir el flujo completo de destilacion multi-profesor a partir de este checkpoint.
- Generacion de codigo en entornos de desarrollo: puede integrarse en asistentes de programacion para generar funciones, completar fragmentos de codigo o explicar algoritmos, aprovechando su entrenamiento en corpus de codigo y su ventana de contexto de 32K tokens para manejar archivos extensos.
- Resolucion de problemas matematicos: util como herramienta de apoyo en plataformas educativas o de investigacion para resolver problemas de nivel competitivo (AIME) y explicar el razonamiento paso a paso.
- Asistente conversacional de proposito general: gracias a su entrenamiento en seguimiento de instrucciones, puede mantener dialogos multi-turno y responder consultas variadas en ingles, aunque con un alcance limitado a las capacidades del modelo base.
- Evaluacion comparativa de tecnicas de destilacion: dado que se publican los resultados en benchmarks estandarizados, sirve como referencia para medir el impacto de diferentes estrategias de RL y destilacion en modelos de 3B parametros.
- Investigacion en balanceo de dominios: el enfoque de balancear por tokens de respuesta en lugar de por ejemplos puede estudiarse y replicarse a partir de este checkpoint, ya que se documentan las proporciones exactas de cada dominio.

## Benchmarks y rendimiento

Los resultados reportados por el autor en la model card, siguiendo el protocolo de evaluacion descrito (matematicas con avg@64, codigo con avg@10, instrucciones con n=1 y `enable_thinking=true`), son los siguientes:

| AIME24 | AIME25 | Math (promedio) | LCBv5 | LCBv6 | Code (promedio) | IFEval | IFBench_test | IF (promedio) | Overall |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 15,63 | 20,26 | 17,95 | 15,99 | 19,20 | 17,60 | 66,91 | 16,00 | 41,46 | 25,67 |

Los resultados de IFEval son notablemente altos (66,91), mientras que los de IFBench_test son bajos (16,00), lo que sugiere una sensibilidad al formato de evaluacion. En general, el rendimiento en matematicas y codigo es moderado para un modelo de 3B, pero suficiente para servir como base en experimentos de destilacion. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en BF16, el modelo ocupa aproximadamente 6,2 GB. Para inferencia en FP16 se necesitan al menos 8 GB de VRAM. Con cuantizacion de 8 bits se reduce a unos 3,3 GB, y con 4 bits a unos 2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia sin cuantizar (por ejemplo, RTX 3060, RTX 4060, RTX 4070). Para cuantizacion de 4 bits, una GPU con 4 GB puede ser suficiente (por ejemplo, RTX 3050, GTX 1660).
- Es compatible con GPUs de consumo, siempre que se use cuantizacion adecuada para las de menor capacidad.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), o mediante la libreria transformers directamente con `device_map="auto"`. Tambien es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no se han publicado datos especificos de latencia o throughput para este modelo. Como referencia, un modelo de 3B en BF16 en una RTX 4090 puede generar del orden de 50-100 tokens por segundo, pero estos valores dependen del backend y la configuracion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar en la informacion proporcionada. El modelo base SmolLM3-3B-Base es el punto de partida, pero no se publican sus resultados en los mismos benchmarks. Tampoco se mencionan alternativas como Qwen2.5-3B o Llama-3.2-3B en la documentacion. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se recomienda su uso en otros idiomas sin fine-tuning adicional.
- Es un checkpoint intermedio, no un modelo final optimizado para produccion. Su rendimiento en tareas reales puede ser inferior al de modelos finales con RL.
- Puede presentar sesgos presentes en los datos de entrenamiento (matematicas, codigo e instrucciones), asi como alucinaciones en contextos donde no tiene conocimiento suficiente.
- La ventana de contexto de 32.768 tokens es amplia, pero el modelo puede degradar su coherencia en secuencias muy largas si no se gestiona adecuadamente.
- No se documenta soporte para tool calling ni agentes, por lo que no es adecuado para aplicaciones que requieran interaccion con APIs externas de forma nativa.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero es responsabilidad del usuario verificar el cumplimiento de las licencias de los datos subyacentes (el dataset Open-MOPD-Data).
- Los resultados de IFBench_test son notablemente bajos (16,00), lo que sugiere que el modelo puede fallar en ciertos formatos de evaluacion de instrucciones, por lo que se recomienda probar en el caso de uso concreto antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
- Repositorio GitHub Open-MOPD: https://github.com/BytedTsinghua-SIA/Open-MOPD
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Organizacion BytedTsinghua-SIA: https://huggingface.co/BytedTsinghua-SIA
