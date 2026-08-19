# NextGenInstitute/socraticLlama8B

## Resumen

Socratic Llama-8B es un adaptador LoRA desarrollado por NextGenInstitute sobre el modelo base Llama-3.1-8B-Instruct (en su versión cuantizada a 4 bits con bitsandbytes). Su propósito es transformar un modelo de generación de código estándar en un tutor socrático para educación universitaria en inteligencia artificial: en lugar de proporcionar soluciones de código directas cuando un estudiante se enfrenta a un error de programación, el modelo debe guiar al alumno mediante preguntas y pistas que fomenten el razonamiento conceptual. El proyecto aborda un problema concreto de la pedagogía asistida por IA: la fuga de código (code leakage) que impide el aprendizaje por esfuerzo productivo.

El modelo se ha alineado mediante un currículo de dos etapas: Supervised Fine-Tuning (SFT) seguido de Direct Preference Optimization (DPO), utilizando un dataset propio de 1.680 cuádruples de preferencias pedagógicas (NextGenInstitute/socraticDataset1680). El adaptador pesa aproximadamente 0.2 GB y se distribuye bajo licencia Apache 2.0. No se especifican idiomas soportados ni la longitud de contexto efectiva tras el ajuste, aunque el modelo base Llama-3.1-8B-Instruct soporta hasta 128.000 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) con adaptadores LoRA |
| Parametros totales | 8B (modelo base) + adaptadores LoRA (tamano del repo: 0.2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k) |
| Tipos de cuantizacion | bnb-4bit (modelo base), adaptadores en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Llama-3.1-8B-Instruct, pero solo se publican los adaptadores LoRA, no los pesos completos. El entrenamiento se realizó en dos fases: primero un ajuste supervisado (SFT) sobre un conjunto de diálogos socráticos, y posteriormente una alineación con Direct Preference Optimization (DPO) utilizando el dataset propietario de 1.680 cuádruples, donde cada cuádruple contiene una consulta de depuración, una respuesta preferida (socrática) y una respuesta no preferida (con solución directa). El objetivo explícito era reducir la fuga de código a 0% y aumentar la precisión en el diagnóstico de conceptos erróneos.

No se detallan los hiperparámetros de entrenamiento, el número de pasos, ni la composición exacta del dataset más allá de su tamaño. Tampoco se indica si se aplicaron técnicas de regularización adicionales o si se evaluó la degradación en tareas generales de generación de código tras el ajuste.

## Capacidades

- Tutoría socrática: guía al estudiante mediante preguntas y pistas en lugar de proporcionar soluciones de código completas.
- Diagnóstico de errores conceptuales: identifica concepciones erróneas en algoritmos y programación en cinco áreas de inteligencia artificial.
- Generación de texto conversacional: mantiene diálogos multi-turno en contextos educativos.
- Supresión de código directo: el modelo está alineado para no emitir bloques de código o funciones completas (0% de fuga de código según el benchmark del autor).
- No se menciona soporte para tool calling, function calling, ni capacidades multimodales.
- No se especifican capacidades multilingües; se asume que el modelo base (Llama-3.1-8B-Instruct) tiene soporte multilingüe, pero el adaptador no lo confirma.

## Casos de uso

- Tutoría en cursos universitarios de programación e IA: el modelo puede integrarse en plataformas de aprendizaje (LMS) para responder a preguntas de estudiantes sobre errores de código, guiándolos hacia el descubrimiento de la solución sin entregar el código final.
- Asistentes en foros de ayuda técnica: en comunidades de desarrollo, el modelo puede intervenir en hilos de depuración para ofrecer pistas conceptuales en lugar de soluciones copiables, fomentando el aprendizaje colaborativo.
- Plataformas de e-learning con evaluación formativa: el modelo puede generar preguntas socráticas personalizadas según el error del estudiante, ayudando a consolidar conceptos antes de un examen.
- Entornos de desarrollo integrado (IDE) con asistente pedagógico: un plugin que, al detectar un error de compilación, ofrece orientación paso a paso sin revelar la corrección, útil en bootcamps y cursos intensivos.
- Formación corporativa en ingeniería de software: para programas de upskilling donde se quiere evitar la dependencia de soluciones automáticas y promover el razonamiento crítico.
- Generación de material didáctico: el modelo puede crear ejercicios de depuración con pistas progresivas, útiles para diseñar evaluaciones o laboratorios.
- Investigación en pedagogía asistida por IA: sirve como baseline de código abierto para estudiar el impacto de la alineación por preferencias en entornos educativos.

## Benchmarks y rendimiento

El autor proporciona resultados en el benchmark EAAI (150 escenarios de depuración de IA retenidos), comparando con varios modelos. Se presentan a continuación los datos publicados en la model card:

| Modelo | Fuga de codigo directa (↓) | Utilidad pedagogica (1-5) (↑) | Precision conceptual % (↑) |
| :--- | :---: | :---: | :---: |
| Gemini 3.5 Flash (Google) | 0.0% | 4.79 / 5.0 | 98.7% |
| GPT-5.4-mini (propietario) | 0.0% | 4.67 / 5.0 | 98.7% |
| Socratic Muse-30B (SFT+DPO) | 0.0% | 4.75 / 5.0 | 90.0% |
| **Socratic Llama-8B (SFT+DPO)** | **0.0%** | **3.54 / 5.0** | **76.0%** |
| Llama-3.1-8B-Instruct (base) | 1.3% | 2.55 / 5.0 | 20.0% |
| Qwen2.5-Coder-7B-Instruct | 6.0% | 2.37 / 5.0 | 20.0% |

El modelo consigue eliminar la fuga de código, pero queda por debajo de los modelos propietarios y de un modelo más grande (30B) en utilidad pedagógica y precisión conceptual. No se han publicado otros benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, se requiere cargar el modelo base Llama-3.1-8B-Instruct. Con cuantización de 4 bits (como se usó en el entrenamiento), la VRAM estimada es de aproximadamente 5-6 GB para inferencia.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10G, A100 (cualquier GPU con al menos 8 GB de VRAM puede servir con cuantización 4-bit).
- Es viable en GPUs de consumo (RTX 3060 12GB, RTX 4070, etc.) si se usa cuantización 4-bit o 8-bit.
- Opciones de despliegue: se puede fusionar el adaptador con el modelo base y exportar a GGUF para usarlo con llama.cpp u Ollama; también es compatible con vLLM, TGI y Transformers + PEFT.
- La latencia dependerá del hardware; en una RTX 4090 se puede esperar un throughput de 30-50 tokens/s para generación de respuestas de tamaño medio.

## Comparativa con modelos similares

La tabla del benchmark ya ofrece una comparativa directa. Adicionalmente, se puede comparar con otros modelos de tutoría de código abierto:

| Modelo | Parametros | Contexto | Fuga de codigo | Utilidad pedagogica | Licencia |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Socratic Llama-8B | 8B + LoRA | no disponible | 0.0% | 3.54/5 | Apache 2.0 |
| Socratic Muse-30B | 30B | no disponible | 0.0% | 4.75/5 | no disponible |
| Llama-3.1-8B-Instruct | 8B | 128k | 1.3% | 2.55/5 | Llama 3.1 Community License |
| Qwen2.5-Coder-7B-Instruct | 7B | 128k | 6.0% | 2.37/5 | Apache 2.0 |

Socratic Llama-8B supera a los modelos base en las métricas pedagógicas, pero es inferior al modelo de 30B del mismo instituto, lo que sugiere que el tamaño del modelo influye en la calidad de la tutoría.

## Limitaciones y advertencias

- El modelo es un adaptador LoRA, no un modelo completo; requiere el modelo base Llama-3.1-8B-Instruct para funcionar, lo que añade complejidad de despliegue.
- El rendimiento pedagógico (3.54/5) es moderado y muy inferior al de modelos propietarios (4.7-4.8), por lo que no es adecuado para entornos donde se requiera una guía de alta calidad sin supervisión humana.
- La precisión conceptual del 76% implica que aproximadamente uno de cada cuatro diagnósticos puede ser incorrecto, lo que puede confundir al estudiante si no hay un instructor humano que valide.
- No se han evaluado sesgos específicos del adaptador, pero el modelo base puede presentar sesgos de género, raza o idioma heredados.
- Riesgo de alucinación: como cualquier LLM, puede generar explicaciones plausibles pero incorrectas, especialmente en temas avanzados de IA.
- No se especifican idiomas soportados; si el adaptador se entrenó solo con datos en inglés, su rendimiento en otros idiomas será limitado.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo base Llama-3.1-8B-Instruct tiene su propia licencia (Llama 3.1 Community License) que puede imponer restricciones adicionales para uso comercial en ciertos casos.
- No se proporcionan datos sobre la degradación en tareas generales de generación de código o razonamiento tras el ajuste; el modelo puede haber perdido capacidades fuera del ámbito pedagógico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextGenInstitute/socraticLlama8B
- Dataset de entrenamiento: https://huggingface.co/datasets/NextGenInstitute/socraticDataset1680
- Repositorio alternativo del modelo (misma organización): https://huggingface.co/NextGenInstitute/socratic-llama3.1-8b-sft-dpo-ai-education
