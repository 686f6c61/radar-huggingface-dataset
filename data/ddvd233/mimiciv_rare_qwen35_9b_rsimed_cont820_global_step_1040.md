# ddvd233/mimiciv_rare_qwen35_9b_rsimed_cont820_global_step_1040

## Resumen

`mimiciv_rare_qwen35_9b_rsimed_cont820_global_step_1040` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario ddvd233 como artefacto de investigación. Se trata de los pesos consolidados en formato bf16 safetensors a partir de un checkpoint de entrenamiento FSDP generado con el framework verl, concretamente el paso global 1040 del experimento denominado RSIMed-9B. El objetivo del entrenamiento es mejorar el rendimiento en preguntas y casos clínicos de enfermedades raras, un dominio donde los modelos generalistas suelen fallar por escasez de ejemplos y por la ambigüedad de la terminología.

El modelo forma parte de una línea de experimentos con datos autogenerados por el propio modelo ("self-evolving data"): el checkpoint del paso 1040 continúa el entrenamiento desde un checkpoint anterior del mismo autor (`mimiciv_rare_qwen35_9b_evolve_from_sft_global_step_820`) aplicando una función de recompensa corregida. El autor reporta una precisión de 0,469 en 2.452 casos de evaluación de enfermedades raras sobre MIMIC-IV, y lo señala como el último checkpoint limpio de la ejecución antes de que el juez congelado de 9B dejara de funcionar correctamente.

La relevancia de esta ficha es acotada y hay que leerla con cautela: se trata de un artefacto de investigación con cero descargas y cero valoraciones en el momento de la consulta, sin publicación de resultados más allá de una única métrica, y con una advertencia explícita del autor de que no está destinado a uso clínico. Su interés principal es metodológico (RL con verl sobre datos sintéticos en un dominio médico especializado) más que su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; derivada del modelo base Qwen/Qwen3.5-9B (familia transformer, segun el tag `qwen3_5`) |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4 mil millones), segun los pesos safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos bf16 en safetensors. No se han publicado versiones GGUF, GPTQ, AWQ ni FP8 |
| Idiomas soportados | No disponible (el campo de idiomas de la ficha de HuggingFace no esta cumplimentado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en bf16 (pesos fusionados desde un checkpoint FSDP de verl) |
| Tamano del repositorio | 18,8 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline declarado | reinforcement-learning |
| Framework de entrenamiento | verl (FSDP) |
| Fecha de publicacion | 28 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos propios en la informacion proporcionada: el autor solo indica que son pesos fusionados en bf16 safetensors procedentes de un checkpoint FSDP de verl, y que el modelo base es Qwen/Qwen3.5-9B. Por tanto, la arquitectura subyacente es la del modelo base (no documentada aqui), y el trabajo publicado consiste en un ajuste por RL sobre esos pesos, no en un cambio estructural. El tag `qwen3_5` confirma la familia, pero no se especifican numero de capas, tipo de atencion, atencion lineal ni ningun otro detalle interno.

Respecto al entrenamiento, la model card describe un experimento llamado RSIMed-9B basado en "datos autoevolutivos" (self-evolving data), es decir, tareas escritas por el propio modelo. El checkpoint del paso 1040 es la continuacion de `ddvd233/mimiciv_rare_qwen35_9b_evolve_from_sft_global_step_820` aplicando una funcion de recompensa corregida ("the fixed reward"). El resultado reportado es una precision de 0,469 en 2.452 casos de evaluacion de enfermedades raras de MIMIC-IV, evaluados con un juez congelado. El autor indica que este es el ultimo checkpoint limpio de la ejecucion porque el juez congelado de 9B dejo de comportarse correctamente despues de este paso, lo que sugiere inestabilidad en la senal de recompensa al final del entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto y respuesta a preguntas en el dominio medico, con enfasis en casos de enfermedades raras, segun el objetivo declarado del entrenamiento.
- Razonamiento clinico a partir de descripciones de casos: la metrica reportada mide aciertos sobre 2.452 casos de evaluacion, lo que implica cierta capacidad de razonamiento sobre informacion clinica textual.
- Capacidades heredadas del modelo base Qwen/Qwen3.5-9B: no verificadas ni documentadas en la informacion disponible. Se recomienda consultar la ficha del modelo base antes de asumir soporte de tool calling, agentes, vision o audio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la ficha no declara idiomas soportados.
- Modo de pensamiento (thinking mode), vision o audio: no disponible en la informacion proporcionada.
- Ajuste por RL sobre recompensa de exactitud en un dominio concreto: capacidad metodologica documentada, no una capacidad funcional del modelo.

## Casos de uso

- Investigacion en RL para dominios medicos: el modelo sirve como referencia reproducible de un pipeline verl + FSDP con datos autogenerados y recompensa basada en aciertos. Se usaria para estudiar como evoluciona la precision a lo largo de los pasos globales y como afecta la correccion de la funcion de recompensa.
- Analisis de sensibilidad a la senal de recompensa: el autor documenta que el juez congelado dejo de funcionar tras el paso 1040, por lo que este checkpoint es un caso de estudio util para investigar el colapso de evaluadores automaticos en bucles de autoentrenamiento.
- Generacion de preguntas y casos clinicos sinteticos de enfermedades raras: dado que el entrenamiento se baso en tareas escritas por el modelo, puede emplearse para producir borradores de casos que despues sean revisados por especialistas humanos antes de cualquier uso.
- Evaluacion comparativa de modelos medicos: la metrica de 0,469 sobre 2.452 casos de MIMIC-IV permite situar al modelo frente a otros sistemas en el mismo conjunto de evaluacion, siempre que se replique el mismo juez y el mismo protocolo.
- Filtrado y preanotacion en investigacion sobre registros de UCI: el modelo podria usarse para proponer hipotesis de enfermedad rara sobre notas clinicas desidentificadas, con supervision humana obligatoria y sin uso asistencial.
- Formacion y simulacion docente: generacion de escenarios de enfermedad rara poco frecuente para practicar razonamiento diferencial en entornos de formacion medica, nunca como sustituto de material clinico validado.
- Estudio de sesgos y alucinacion en modelos medicos: al ser un ajuste agresivo sobre un dominio estrecho, es un candidato util para medir degradacion de capacidades generales y tasa de invencion de hallazgos clinicos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Tamano del conjunto de evaluacion | Notas |
|---|---|---|---|---|
| MIMIC-IV, enfermedades raras | Precision (accuracy) | 0,469 | 2.452 casos | Evaluado con juez congelado ("fixed judge"); el autor lo describe como el ultimo checkpoint limpio de la ejecucion |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, MedQA u otros) en la informacion disponible. No se dispone de la puntuacion del modelo base ni de la del checkpoint predecesor, por lo que no es posible calcular la mejora atribuible al RL con los datos proporcionados.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (9,41 mil millones) y del formato de pesos publicado. No son datos medidos por el autor.

- Pesos en bf16 (formato publicado): aproximadamente 18,8 GB solo en pesos, lo que coincide con el tamano del repositorio.
- VRAM estimada para inferencia en bf16: alrededor de 22-26 GB contando cache KV y activaciones con contexto corto. Requiere GPU de 24 GB o mas con margen limitado, o de 40/80 GB para contexto largo.
- VRAM estimada en cuantizacion de 8 bits (previa conversion, no publicada): aproximadamente 10-12 GB, viable en RTX 4080, RTX 3090, RTX 4090 o A100.
- VRAM estimada en cuantizacion de 4 bits (previa conversion, no publicada): aproximadamente 6-8 GB, viable en RTX 4060 Ti 16 GB, RTX 3080 10 GB con contexto reducido o RTX 4070.
- GPUs recomendadas: A100 80 GB o H100 para bf16 con contexto largo y lotes grandes; A100 40 GB o L40S para bf16 con contexto moderado; RTX 4090 (24 GB) para bf16 con contexto recortado o para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: si, con matices. En bf16 solo en tarjetas de 24 GB y con contexto limitado; en 8 o 4 bits (tras convertir los pesos) cabe en tarjetas de 16 GB e incluso de 10-12 GB.
- Opciones de despliegue: vLLM, TGI, SGLang y transformers para el formato safetensors. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio no publica versiones cuantizadas.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad, solo el resultado de precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (mimiciv_rare_qwen35_9b_rsimed_cont820, paso 1040) | 9,41 mil millones | No disponible | Precision 0,469 en 2.452 casos de enfermedades raras de MIMIC-IV | Apache-2.0 | HuggingFace; 0 descargas y 0 valoraciones en la fecha de consulta |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace (modelo base referenciado por el autor) |
| ddvd233/mimiciv_rare_qwen35_9b_evolve_from_sft_global_step_820 (checkpoint predecesor del mismo autor) | No disponible (mismo modelo base) | No disponible | No disponible; la model card del modelo actual no reproduce su puntuacion | No disponible | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (ajustes medicos de ~9B para enfermedades raras) en los datos proporcionados, por lo que no se incluye una comparativa adicional.

## Limitaciones y advertencias

- Advertencia explicita del autor: "Not for clinical use". El modelo no debe emplearse para diagnostico, triaje, decision terapeutica ni ninguna otra aplicacion asistencial.
- Artefacto de investigacion entrenado con tareas escritas por el propio modelo y evaluado sobre una unica familia de benchmarks, segun la propia model card. La generalizacion a otros dominios medicos o a otros idiomas es desconocida.
- Riesgo de sobreajuste al formato y a la distribución de MIMIC-IV: la unica metrica reportada (0,469) procede de ese conjunto, y no hay evaluaciones independientes.
- Riesgo de alucinacion clinica: los ajustes por RL orientados a exactitud en dominios medicos estrechos pueden aumentar la confianza en respuestas incorrectas. Cualquier salida debe ser verificada por un profesional.
- Inestabilidad documentada del evaluador: el autor senala que el juez congelado de 9B dejo de funcionar despues del paso 1040, lo que cuestiona la fiabilidad de la senal de recompensa en la parte final del entrenamiento y sugiere que el checkpoint no es necesariamente el optimo de la ejecucion.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo por sexo, etnia, edad ni por subgrupos de enfermedades.
- Limitaciones de contexto e idioma: no disponibles; no se declaran ni la ventana de contexto ni los idiomas soportados.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero esa permisibilidad tecnica no exime de las obligaciones regulatorias aplicables a software sanitario ni de las restricciones de uso de los datos de origen. MIMIC-IV se distribuye bajo acceso acreditado en PhysioNet, por lo que la procedencia de los datos de evaluacion merece verificacion antes de cualquier reutilizacion.
- Sin soporte de cuantizacion publicado: no hay GGUF, GPTQ ni AWQ en el repositorio, lo que obliga a convertir los pesos para despliegues en hardware de consumo.
- Adopcion nula: cero descargas y cero valoraciones en la fecha de consulta, sin garantia de mantenimiento ni soporte por parte del autor.
- Reproducibilidad limitada: la ficha no documenta hiperparametros de RL, composicion del dataset, semilla ni versiones exactas del framework, mas alla de la referencia generica a verl.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/mimiciv_rare_qwen35_9b_rsimed_cont820_global_step_1040
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint predecesor citado en la model card: https://huggingface.co/ddvd233/mimiciv_rare_qwen35_9b_evolve_from_sft_global_step_820
- Framework de entrenamiento verl: no se proporciona enlace en la informacion disponible
- Paper o publicacion asociada: no disponible
- Demo o espacio interactivo: no disponible
