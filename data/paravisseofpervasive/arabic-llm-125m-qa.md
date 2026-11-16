# ParavisseOfPervasive/arabic-llm-125m-qa

## Resumen

Arabic LLM 125M (QA Fine-tuned - v1) es un modelo de lenguaje de pequeno tamano desarrollado por el usuario ParavisseOfPervasive, entrenado desde cero sobre la Wikipedia en arabe y posteriormente ajustado mediante fine-tuning supervisado para tareas de preguntas y respuestas (QA) utilizando el corpus CIDAR. Se trata de un proyecto con una finalidad declaradamente educativa y de investigacion, no orientado a produccion.

El modelo emplea una arquitectura de tipo Llama (SwiGLU, RMSNorm y RoPE) con 16 capas, una dimension de embedding de 768 y un vocabulario de 32.000 tokens, totalizando aproximadamente 125 millones de parametros. Su ventana de contexto es de solo 512 tokens, lo que limita su aplicabilidad a conversaciones o documentos cortos.

Es relevante en el contexto del ecosistema de modelos en arabe de codigo abierto porque demuestra un flujo completo de entrenamiento from-scratch usando litgpt, con licencia Apache 2.0. No obstante, su tamano reducido, su contexto corto y la ausencia de datos de benchmarks publicos lo sitúan como una pieza de aprendizaje mas que como una herramienta de uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (SwiGLU + RMSNorm + RoPE) |
| Parametros totales | 125M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`model.pt`) con configuracion embebida; no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama clasica: 16 capas transformer con atencion multi-cabeza, activacion SwiGLU, normalizacion RMSNorm y codificacion posicional rotatoria (RoPE). La dimension oculta es de 768 y el vocabulario de 32.000 tokens. No se trata de un modelo MoE ni hibrido; es un transformer denso de 125M de parametros.

El entrenamiento se realizo en dos fases. Primero, un preentrenamiento from-scratch sobre 200.000 articulos de la Wikipedia en arabe durante 20.000 pasos. Segundo, un fine-tuning supervisado sobre el dataset CIDAR (arbml/CIDAR) para tareas de QA. El autor indica explicitamente que esta version v1 no utiliza loss masking, por lo que el modelo puede tender a reformular la pregunta antes de responder. Una version v2 con loss masking esta en desarrollo segun la model card. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en arabe.
- Respuesta a preguntas (QA) sobre conocimiento general derivado de la Wikipedia en arabe.
- Fine-tuning especifico sobre el corpus CIDAR de preguntas y respuestas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al arabe; no se documenta soporte de otros idiomas.

## Casos de uso

- Prototipado educativo de pipelines de entrenamiento from-scratch: sirve para estudiar el flujo completo de preentrenamiento y fine-tuning con litgpt sobre un corpus arabe, dado su reducido coste computacional.
- Experimentacion academica con QA en arabe: permite comparar estrategias de fine-tuning (con y sin loss masking) sobre un modelo pequeno y un dataset publico como CIDAR.
- Generacion de respuestas cortas en arabe: adecuado para tareas de QA de una sola interaccion con contexto inferior a 512 tokens, como fichas de trivia o preguntas factuales simples.
- Base para investigacion sobre tokenizacion en arabe: su vocabulario de 32.000 tokens y su entrenamiento sobre Wikipedia permiten analizar el comportamiento del tokenizador en un idioma morfologicamente rico.
- Docencia y demostraciones de inferencia local: al ser un modelo de 125M, puede ejecutarse en CPU o en GPUs de gama baja para ilustrar conceptos de arquitectura transformer.
- Punto de partida para fine-tuning posterior: al estar bajo Apache 2.0 y en formato PyTorch, puede servir como inicializacion para experimentos de ajuste en dominios arabes especificos, aunque su capacidad de conocimiento sera limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 125M de parametros en precision FP32, el checkpoint ocupa aproximadamente 0,5 GB, por lo que la inferencia requiere del orden de 1 GB de VRAM; en FP16 o BF16 se reduce a unos 0,25-0,5 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 1-2 GB de memoria libre.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch (`model.pt`) para cargar con litgpt y el modulo `GPT` de litgpt; no se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI. La conversion a GGUF o safetensors requeriria trabajo adicional no documentado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arabic LLM 125M QA (este modelo) | 125M | 512 | Arabe | Apache 2.0 | Hugging Face (checkpoint PyTorch) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se han identificado alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Proyecto educativo y de investigacion: el autor indica explicitamente que no esta destinado a uso en produccion.
- Conocimiento limitado: con 125M de parametros, la cobertura factual y la calidad de las respuestas son reducidas.
- Riesgo de alucinacion: el autor advierte que el modelo puede alucinar y cometer errores.
- Sin loss masking en esta version: el modelo puede reformular la pregunta antes de responder, lo que degrada la calidad del QA; se anuncia una v2 con loss masking en desarrollo.
- Contexto muy corto: 512 tokens limitan las conversaciones multi-turno y los documentos largos.
- Solo arabe: no se documenta soporte de otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre Wikipedia en arabe, puede heredar sesgos del corpus.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones tecnicas hacen desaconsejable su uso en produccion.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion comunitaria ni evidencia de uso real.

## Enlaces

- Hugging Face: https://huggingface.co/ParavisseOfPervasive/arabic-llm-125m-qa
- Dataset CIDAR: https://huggingface.co/datasets/arbml/CIDAR
- Dataset Wikipedia (referenciado en la model card): https://huggingface.co/datasets/wikipedia
- Libreria litgpt: https://github.com/Lightning-AI/litgpt
