# logan7000/llm-math345-gt-phi35mini-endpoint

## Resumen

El modelo `logan7000/llm-math345-gt-phi35mini-endpoint` es un ajuste fino (fine-tune) del modelo base `microsoft/Phi-3.5-mini-instruct`, desarrollado por el usuario logan7000. Está orientado a mejorar el razonamiento matemático mediante la técnica GRPO (Group Relative Policy Optimization), introducida en el paper de DeepSeekMath. El entrenamiento se realizó con la librería TRL de Hugging Face, lo que lo convierte en un ejemplo práctico de aplicación de refuerzo para tareas de razonamiento.

El modelo conserva la arquitectura transformer decoder de Phi-3.5-mini-instruct, con aproximadamente 3.800 millones de parámetros y una ventana de contexto de 128.000 tokens. Su relevancia radica en demostrar cómo un modelo compacto puede especializarse en matemáticas mediante GRPO, una técnica que ha mostrado buenos resultados en modelos de tamaño medio. Sin embargo, la información pública disponible es limitada: no se especifican datos de entrenamiento, benchmarks ni licencia, lo que dificulta una evaluación completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Phi-3.5-mini-instruct) |
| Parametros totales | 3.800 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

Nota: el dato de "parametros totales" extraido de HuggingFace (199.680) parece un error de medicion; el modelo base Phi-3.5-mini-instruct tiene 3.800 millones de parametros, y el tamano del repositorio (7,6 GB) es consistente con pesos en FP16/BF16 para esa magnitud.

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Phi-3.5-mini-instruct, un transformer decoder con atencion causal, disenado para generacion de texto y conversacion. El ajuste fino se realizo con GRPO, un algoritmo de optimizacion de politicas que utiliza un grupo de respuestas muestreadas para estimar la ventaja relativa, en lugar de un critic separado. Este metodo, descrito en el paper de DeepSeekMath, ha demostrado ser eficaz para mejorar el razonamiento matematico en modelos de lenguaje.

El entrenamiento se llevo a cabo con la libreria TRL (version 1.2.0.dev0) y Transformers 4.57.6, sobre PyTorch 2.10.0. No se especifica el dataset utilizado ni el numero de tokens de entrenamiento. El nombre del modelo ("math345") sugiere una especializacion en problemas de matematicas, pero no hay detalles publicos sobre la composicion de los datos ni sobre el uso de tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: al estar basado en Phi-3.5-mini-instruct, conserva la capacidad de mantener dialogos multi-turno.
- Razonamiento matematico: el entrenamiento con GRPO esta orientado a mejorar la resolucion de problemas aritmeticos y algebraicos, aunque no se han publicado evaluaciones cuantitativas.
- Soporte de contexto largo: hereda la ventana de 128.000 tokens del modelo base, util para documentos extensos o historiales de conversacion largos.
- No se ha confirmado soporte para tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede utilizarse como asistente para explicar pasos de calculo o resolver ecuaciones, aprovechando su entrenamiento especifico en razonamiento numerico.
- Generacion de ejercicios de matematicas: dado su enfoque en el dominio, podria generar problemas con soluciones paso a paso para plataformas de aprendizaje automatico.
- Chatbots de soporte tecnico con contexto largo: gracias a su ventana de 128K tokens, puede manejar conversaciones extensas con historial completo, aunque su especializacion matematica limita su uso general.
- Analisis de documentos cientificos con contenido matematico: el contexto amplio permite procesar articulos completos y extraer o resumir formulas y razonamientos.
- Prototipado de agentes de razonamiento: al ser un modelo pequeno, es adecuado para experimentar con pipelines de razonamiento multi-paso en entornos con recursos limitados.
- Investigacion en RL para LLMs: sirve como caso de estudio para replicar el entrenamiento GRPO en modelos de tamano medio, dado que el codigo y los pesos estan disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se han encontrado comparaciones con modelos similares en la documentacion publica.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 3.800 millones de parametros, se estima un consumo de aproximadamente 8 GB en FP16 y unos 4 GB en cuantizacion de 4 bits (valores orientativos, no confirmados por el autor).
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060/3070, RTX 4060 Ti o superiores. Para cuantizacion 4-bit, una RTX 3060 de 12 GB seria suficiente.
- Compatibilidad con GPU de consumo: si, siempre que se utilice cuantizacion (GGUF o AWQ) para reducir el uso de memoria.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), segun los tags del repositorio.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, un modelo de 3.8B suele generar entre 20 y 50 tokens por segundo en FP16, pero estos valores son estimaciones generales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. Como referencia cualitativa, se puede comparar con:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| logan7000/llm-math345-gt-phi35mini-endpoint | 3.8B | 128K | Matematicas (GRPO) | No disponible |
| microsoft/Phi-3.5-mini-instruct | 3.8B | 128K | General | MIT |
| DeepSeekMath-7B | 7B | 4K | Matematicas | MIT |

La comparacion es limitada porque no hay benchmarks del modelo evaluado. DeepSeekMath-7B es un modelo mas grande y con contexto menor, pero con resultados publicados en GSM8K y MATH. Phi-3.5-mini-instruct es el modelo base, con licencia MIT y amplia documentacion.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "licence: license" sin detallar los terminos, lo que impide conocer si es de uso comercial o tiene restricciones.
- Sin datos de entrenamiento: no se informa sobre el dataset utilizado, lo que dificulta evaluar sesgos o calidad de los datos.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventadas, especialmente en problemas matematicos complejos.
- Sesgos potenciales: al ser un ajuste fino de un modelo base, puede heredar sesgos de Phi-3.5-mini-instruct, aunque no se han realizado auditorias publicas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento real en tareas matematicas, por lo que su eficacia es incierta.
- Soporte de idiomas desconocido: no se especifican los idiomas soportados; el modelo base soporta principalmente ingles, pero el fine-tune podria haber alterado este aspecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/llm-math345-gt-phi35mini-endpoint
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Libreria TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/logan-yang2002-johns-hopkins-university/grpo-training/runs/ixlmabc8
