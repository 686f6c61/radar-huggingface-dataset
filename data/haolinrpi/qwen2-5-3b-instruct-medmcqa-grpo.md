# HaolinRPI/Qwen2.5-3B-Instruct-MedMCQA-GRPO

## Resumen

Qwen2.5-3B-Instruct-MedMCQA-GRPO es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario HaolinRPI. El objetivo es especializar un modelo generalista de 3.000 millones de parametros en la resolucion de preguntas medicas de opcion multiple del conjunto de datos MedMCQA, forzando ademas un formato de respuesta estructurado mediante etiquetas `<answer>X</answer>`.

El entrenamiento se realizo con la libreria verl sobre 20.000 preguntas del split de entrenamiento de MedMCQA, durante 3 epocas (240 pasos globales) y con una recompensa binaria que solo premia la letra correcta dentro de la ultima etiqueta bien formada. En el checkpoint publicado (`global_step_240`), el autor reporta una precision de 0,605 y una tasa de formato correcto de 0,995 sobre un split de validacion de 200 preguntas.

Su relevancia es acotada: no es un modelo medico de proposito general ni un asistente clinico, sino un experimento reproducible de RLHF/GRPO sobre un modelo pequeno, util para investigadores que quieran estudiar el efecto del ajuste por refuerzo con recompensas verificables en dominios de conocimiento especializado y con formatos de salida estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajustado con GRPO |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en el momento de la consulta) |
| Idiomas soportados | no disponibles (heredados del modelo base, no declarados por el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.085.938.688 parametros con atencion causal estandar y las innovaciones propias de la familia Qwen2.5 (RoPE, RMSNorm, SwiGLU, atencion con GQA en el modelo base). Sobre el se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) usando verl como framework de RL, con actor FSDP2 y rollout con vLLM sobre 4 GPU H200.

El dataset de entrenamiento son 20.000 preguntas de opcion multiple de MedMCQA, con el enunciado original y la instruccion de terminar la respuesta con `<answer>X</answer>` donde X es A, B, C o D. La recompensa es binaria: 1 solo si la letra de la ultima etiqueta bien formada coincide con la opcion correcta. Los hiperparametros declarados son batch global de 250 prompts, 4 muestras por prompt, learning rate 1e-6 y coeficiente KL de 0.001. Se entrenaron 3 epocas (80 pasos por epoca, 240 pasos totales) y se guardaron checkpoints en los pasos 100, 200 y 240; la revision publicada corresponde al paso 240. No se documentan tecnicas adicionales como decodificacion especulativa ni datos de preentrenamiento propios.

## Capacidades

- Generacion de texto y respuesta a preguntas de opcion multiple en el dominio medico (MedMCQA).
- Salida estructurada obligatoria mediante etiquetas `<answer>X</answer>`, con una tasa de formato correcto de 0,995 en la validacion reportada.
- Razonamiento de un solo turno orientado a seleccionar la opcion correcta entre A, B, C y D.
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct (generacion general, codigo, matematicas basicas, multilingueismo), aunque no han sido evaluadas ni declaradas por el autor tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no se documenta ni se evalua).
- Soporte de agentes y razonamiento multi-paso: no disponible (el entrenamiento se limita a una unica respuesta por pregunta).
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Evaluacion de tecnicas de RL con recompensas verificables: el modelo sirve como referencia reproducible para comparar GRPO frente a SFT en tareas de opcion multiple, ya que el autor documenta framework (verl), hardware (4x H200), hiperparametros y checkpoint exacto.
- Investigacion en formato estructurado: util para estudiar como el RL fuerza la aparicion de etiquetas `<answer>X</answer>` y su robustez (0,995 de tasa de formato) en modelos pequenos.
- Baseline en benchmarks medicos de opcion multiple: puede usarse como punto de partida para comparar con modelos medicos especializados en MedMCQA, siempre que se respete el mismo protocolo de evaluacion greedy.
- Generacion de datos sinteticos de QA medico: el modelo puede producir pares pregunta-opcion-respuesta con formato consistente para aumentar datasets de entrenamiento, con revision humana obligatoria por el riesgo de error clinico.
- Prototipado de pipelines de evaluacion automatica: la salida estructurada facilita el parseo y la verificacion automatica en sistemas de scoring de preguntas tipo test.
- Docencia e investigacion academica: como ejemplo didactico de ajuste por refuerzo sobre un modelo de 3 B en un unico dominio, con coste de computo moderado (4 GPU H200 durante 240 pasos).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, evaluacion greedy sobre el split de 200 preguntas de MedMCQA usado durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Precision (accuracy) | 0,605 |
| Tasa de formato de etiqueta de respuesta correcta | 0,995 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, MedQA, PubMedQA) ni comparaciones con otros modelos en la informacion disponible. Tampoco se aporta la metrica del modelo base sin ajustar en el mismo split, por lo que no es posible cuantificar la mejora atribuible al GRPO.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos (3,09 B x 2 bytes), mas overhead de activaciones y KV cache; en la practica, entre 8 y 10 GB para contextos cortos.
- Cuantizacion a 8 bits: en torno a 3,1 GB de pesos; a 4 bits: en torno a 1,6 GB. El repo no publica versiones GGUF ni cuantizadas, por lo que habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100, H100 o H200 para entrenamiento o evaluacion a gran escala; RTX 4090, RTX 3090 o L40S para inferencia en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante) y en 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers, vLLM (usado por el autor para el rollout), TGI y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-MedMCQA-GRPO | 3,09 B | no disponible | MedMCQA con formato `<answer>` via GRPO | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Generalista, instrucciones | apache-2.0 | Hugging Face (ampliamente usado) |
| Modelos medicos de 3-7 B (p. ej. variantes de Meditron o BioMistral) | 3-7 B | variable | Dominio medico general | variable | Hugging Face |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: el autor no publica resultados frente al modelo base ni frente a otros modelos medicos en el mismo split, y no se dispone de cifras externas verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de los resultados reportados.
- La precision de 0,605 se mide sobre un split de 200 preguntas usado durante el entrenamiento, no sobre un conjunto de test independiente; existe riesgo de sobreajuste y de que la cifra no se generalice.
- No es un dispositivo medico ni un asistente clinico: no debe usarse para diagnostico, tratamiento ni decisiones sanitarias sin supervision profesional.
- Riesgo de alucinacion elevado en preguntas fuera del formato de opcion multiple o fuera de la distribucion de MedMCQA; el ajuste esta disenado para forzar una respuesta A-D y puede producir etiquetas `<answer>` aunque la pregunta no sea de opcion multiple.
- El formato de salida esta acoplado a la etiqueta `<answer>X</answer>`; prompts que no la soliciten pueden degradar la calidad o la parseabilidad de la respuesta.
- Idiomas, contexto y cuantizaciones no declarados por el autor: hay que asumir los del modelo base y verificar empiricamente el comportamiento multilingue.
- Licencia apache-2.0 permisiva para uso comercial, pero el uso comercial de un modelo medico ajustado con datos de MedMCQA exige revisar las condiciones de dicho dataset y anadir las advertencias regulatorias correspondientes.
- Entrenamiento limitado a 240 pasos y un unico checkpoint publicado; no se documentan pruebas de robustez, sesgos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-3B-Instruct-MedMCQA-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Framework de RL utilizado (verl): https://github.com/volcengine/verl
- Dataset MedMCQA: no disponible en la informacion proporcionada (no se incluye enlace en la model card)
- Paper de GRPO: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
