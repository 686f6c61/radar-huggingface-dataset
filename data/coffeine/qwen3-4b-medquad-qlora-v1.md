# coffeine/qwen3-4b-medquad-qlora-v1

## Resumen

El repositorio `coffeine/qwen3-4b-medquad-qlora-v1` contiene un adaptador QLoRA experimental, fine-tuneado a partir del modelo base Qwen/Qwen3-4B utilizando el conjunto de datos MedQuAD de preguntas y respuestas médicas. El objetivo declarado del autor es explorar el fine-tuning eficiente en parámetros (PEFT) para tareas de respuesta a preguntas médicas, empleando el framework TRL de Hugging Face, PEFT y bitsandbytes. Se trata de un adaptador LoRA, no de un modelo completo fusionado, y su tamaño de repositorio es de 0.1 GB.

Este modelo es relevante como caso de estudio para quienes investigan técnicas de adaptación de modelos de lenguaje de código abierto a dominios especializados con recursos computacionales limitados, ya que el entrenamiento se realizó en una GPU NVIDIA Tesla T4 con 15 GB de VRAM. Sin embargo, el autor advierte explícitamente que es un modelo experimental, entrenado con solo 96 ejemplos, y que no debe utilizarse para diagnóstico, tratamiento o decisiones clínicas. La licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B (Transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA, repo de 0.1 GB; el base Qwen3-4B tiene 4B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (usada durante el entrenamiento; el adaptador en si no esta cuantizado) |
| Idiomas soportados | No disponible (el dataset MedQuAD es en ingles, pero no se declara) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA (Quantized Low-Rank Adaptation) sobre el modelo base Qwen3-4B. La configuracion LoRA utiliza un rango de 8, alpha de 16, dropout de 0.05 y se aplica a todas las capas lineales. El entrenamiento se realiza con el SFTTrainer de TRL, con cuantizacion de 4 bits NF4 y doble cuantizacion habilitada. Se emplean 96 ejemplos del dataset MedQuAD, filtrados para incluir preguntas no vacias y respuestas de entre 20 y 160 palabras. El formato de chat de Qwen3 se usa con mensaje de sistema, pregunta del usuario y respuesta de referencia, con el modo de pensamiento desactivado. Se entrenan 2 epocas con una tasa de aprendizaje de 2e-4, batch size de 1, acumulacion de gradientes de 8 y longitud maxima de secuencia de 384 tokens. La perdida media observada fue de aproximadamente 1.72. No se aplicaron tecnicas de RLHF ni DPO.

## Capacidades

- Generacion de respuestas a preguntas medicas en ingles, basada en el conocimiento del modelo base y el ajuste con MedQuAD.
- Capacidad limitada de razonamiento sobre temas medicos comunes, aunque con riesgo alto de alucinacion en condiciones raras o especificas.
- No se reporta soporte para tool calling, function calling, agentes, vision, audio ni modo de pensamiento.
- No se especifican capacidades multilingues; el dataset de entrenamiento es en ingles.
- El adaptador no es un modelo autonomo; requiere cargar el modelo base Qwen3-4B y el adaptador PEFT.

## Casos de uso

- Experimentacion con QLoRA y PEFT: sirve como ejemplo reproducible de fine-tuning eficiente en parametros para un dominio especializado, con configuracion documentada y codigo basado en TRL.
- Comparacion de modelos base vs. fine-tuneados: permite estudiar como el ajuste con pocos ejemplos afecta el rendimiento en tareas de QA medico, comparando con Qwen3-4B sin adaptar.
- Investigacion sobre alucinaciones en dominios medicos: el modelo es util para analizar patrones de generacion incorrecta o plausible pero falsa, especialmente en preguntas sobre enfermedades raras.
- Prototipos de investigacion academica: puede integrarse en pipelines de investigacion para evaluar tecnicas de adaptacion, sin uso en produccion.
- Aprendizaje de flujos de fine-tuning con Hugging Face: el repositorio documenta un flujo completo (dataset, formateo, entrenamiento, evaluacion) que puede servir como material didactico.
- Estudio de metricas de evaluacion: el uso de Token-F1 como metrica de solapamiento lexico permite discutir sus limitaciones frente a la correccion clinica.

## Benchmarks y rendimiento

El autor evaluo el adaptador en 8 ejemplos de la particion de validacion de MedQuAD, calculando una puntuacion Token-F1 media de 28.2. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La comparacion con el modelo base Qwen3-4B esta planificada pero aun no se ha realizado.

| Modelo | Token-F1 |
|---|---:|
| Qwen3-4B Base | No probado aun |
| Qwen3-4B + MedQuAD QLoRA v1 | 28.2 |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA, se requiere cargar el modelo base Qwen3-4B. Con cuantizacion de 4 bits, se estima un uso de aproximadamente 4-5 GB de VRAM, aunque no se proporciona una cifra exacta.
- GPU recomendada: NVIDIA Tesla T4 (15 GB) fue usada para el entrenamiento; cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente para inferencia con cuantizacion.
- Compatibilidad con GPU de consumo: si, tarjetas como RTX 3060, RTX 4060 o superiores pueden ejecutar el modelo en 4 bits.
- Opciones de despliegue: se puede cargar con la libreria transformers y PEFT (peft). No se mencionan vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada. El unico punto de referencia planificado es el modelo base Qwen3-4B, cuya evaluacion esta pendiente. No se puede establecer una comparativa con alternativas como otros adaptadores medicos o modelos de tamano similar sin datos adicionales.

## Limitaciones y advertencias

- Entrenamiento con solo 96 ejemplos, lo que limita la generalizacion y la robustez.
- Alto riesgo de alucinacion: puede generar sintomas, estadisticas, tratamientos o patrones de herencia incorrectos.
- Puede confundir enfermedades similares o no responder al tipo de pregunta especifica.
- La metrica Token-F1 mide solapamiento lexico, no correccion clinica, exactitud factual ni tasa de alucinacion.
- No debe usarse para diagnostico, seleccion de tratamiento, decisiones sobre medicacion, decisiones medicas de emergencia ni soporte clinico sin validacion independiente.
- La licencia no esta especificada, lo que genera incertidumbre sobre su uso comercial.
- El adaptador no es un modelo completo; requiere el modelo base Qwen3-4B, cuya licencia (Apache 2.0) puede tener implicaciones adicionales.
- El conocimiento medico del modelo base puede degradarse o no mejorar con el fine-tuning a pequena escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/coffeine/qwen3-4b-medquad-qlora-v1
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset MedQuAD (mencionado en la model card): https://huggingface.co/datasets/Hmehdi515/MedQuad
