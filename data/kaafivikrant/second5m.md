# kaafivikrant/Second5M

## Resumen
Second5M es un modelo de lenguaje experimental de tipo decoder-only desarrollado por el usuario kaafivikrant y publicado en Hugging Face. Se trata de un proyecto educativo construido desde cero en PyTorch, con tan solo 4.943.040 parametros entrenables (incluyendo embeddings atados), lo que lo situa en la categoria de modelos ultrapequenos orientados al aprendizaje de arquitecturas transformer mas que al uso practico.

El modelo fue preentrenado sobre WikiText-103 y posteriormente ajustado mediante supervised fine-tuning en dos fases: primero con conversaciones de Smol-Smoltalk y despues con Empathetic Dialogues. La arquitectura emplea innovaciones propias de modelos modernos como pre-normalizacion con RMSNorm, atencion causal con grouped-query attention, RoPE y FFN con SwiGLU, todo ello implementado manualmente.

Su relevancia es exclusivamente didactica: el autor advierte explicitamente que el modelo ofrece respuestas incoherentes con frecuencia, carece de capacidad de razonamiento e instruccion y no es apto para produccion. Resulta util como referencia para quienes quieran estudiar la implementacion completa de un transformer decoder-only en PyTorch, incluyendo tokenizador BPE propio y pipeline de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado con pre-normalizacion |
| Parametros totales | 4.943.040 (incluye embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (el autor no declara licencia del modelo) |
| Formato de pesos | PyTorch (.pt), codigo Python personalizado; no es compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer decoder-only con 8 capas, dimension oculta de 192, atencion causal con grouped-query attention (6 cabezas de query y 2 de key/value), FFN con SwiGLU de dimension 560, RMSNorm para normalizacion, RoPE como codificacion posicional y weight tying entre embeddings de entrada y cabeza de salida. El tokenizador es un BPE a nivel de byte con vocabulario de 8.192 tokens, entrenado especificamente para este proyecto.

El preentrenamiento se realizo sobre WikiText-103 durante 20.000 pasos, muestreando 655.360.000 tokens en una NVIDIA T4, alcanzando una perdida de validacion final de 3,5913. Despues se aplico un primer SFT con hasta 50.000 conversaciones elegibles de Smol-Smoltalk durante 3.000 pasos (con truncado por la izquierda que en ocasiones eliminaba el prompt del usuario) y un SFT final con 19.531 conversaciones preparadas de Empathetic Dialogues durante 3.000 pasos, con perdida de validacion de 3,0663 en ese conjunto. El entrenamiento uso AdamW con schedule coseno. No se aplicaron tecnicas de RLHF ni DPO, y el autor advierte que las perdidas entre etapas no son comparables.

## Capacidades
- Generacion de texto autoregresiva basica en ingles.
- Conversacion de un solo turno con formato de plantilla (`<|bos|>`, `<|user|>`, `<|eos|>`, `<|assistant|>`).
- Generacion condicionada por parametros de muestreo (`max_new_tokens`, `temperature`, `top_k`, `eos_id`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni modo thinking.
- Capacidad multilingue practicamente nula: solo entrenado en ingles.
- Capacidad conversacional muy limitada; el autor reporta respuestas incoherentes incluso ante saludos basicos.

## Casos de uso
- Estudio de arquitecturas transformer: el codigo `model.py` sirve como referencia didactica completa de un decoder-only con GQA, RoPE, RMSNorm y SwiGLU implementados a mano, sin dependencias de `transformers`.
- Aprendizaje de pipelines de entrenamiento: el proyecto documenta preentrenamiento, SFT y ajuste conversacional con hiperparametros y perdidas concretas, util para cursos o talleres.
- Experimentacion con tokenizadores BPE personalizados: el `tokenizer.json` y su integracion con la libreria `tokenizers` permiten estudiar el flujo completo de tokenizacion a nivel de byte.
- Pruebas de infraestructura de inferencia en CPU: al ser un modelo de ~5M de parametros, se puede cargar y ejecutar en cualquier portatil para validar scripts de generacion o integrarlo en tests unitarios de pipelines.
- Reproduccion de experimentos educativos: sirve como punto de partida para quienes quieran reentrenar con otros datasets o escalar la arquitectura manteniendo el mismo codigo.
- Demostracion de limitaciones de modelos pequenos: util en docencia para ilustrar por que un modelo de 5M de parametros no puede mantener conversaciones coherentes y por que el escalado importa.
- No se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo ni tareas de razonamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta perdidas de validacion por etapa (3,5913 en preentrenamiento sobre WikiText-103 y 3,0663 en el SFT final sobre Empathetic Dialogues), sin comparaciones con otros modelos ni evaluaciones estandarizadas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 100 MB en fp32 (los pesos ocupan aproximadamente 20 MB, mas overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU, incluida una NVIDIA T4, GTX 1650 o incluso CPU. El autor entreno en una T4.
- Cabe holgadamente en cualquier GPU de consumo e integrada; tambien se ejecuta en CPU sin problemas.
- Opciones de despliegue: el modelo no es compatible con vLLM, TGI ni llama.cpp de forma nativa, ya que usa codigo PyTorch personalizado y pesos en `.pt`. El unico camino documentado es cargar `model.py` y `pytorch_model.pt` con PyTorch. Ollama no es viable sin conversion previa a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Second5M | 4,94 M | 512 | no disponible | Hugging Face, codigo custom | Proyecto educativo, sin benchmarks |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Apache 2.0 | Hugging Face, transformers | Modelo pequeno de referencia con evaluaciones publicadas |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Hugging Face, transformers | Modelo pequeno con benchmarks y amplio soporte de inferencia |
| GPT-2 small | 124 M | 1.024 | MIT | Hugging Face, transformers | Referencia historica, ampliamente soportado |

La comparacion es orientativa: Second5M es entre 25 y 200 veces mas pequeno que las alternativas listadas y no dispone de evaluaciones publicadas, por lo que no es directamente comparable en calidad. Su unico valor diferencial es el caracter didactico del codigo y la transparencia del proceso de entrenamiento.

## Limitaciones y advertencias
- El autor reconoce explicitamente que las respuestas a saludos basicos pueden ser incoherentes o no relacionadas.
- Conocimiento, razonamiento, contexto e instruccion muy limitados; propenso a errores factuales, repeticiones y salidas inapropiadas o enganosas.
- No apto para produccion, decisiones de alto riesgo ni uso como soporte emocional.
- Contexto de solo 512 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo ingles; sin capacidades multilingues.
- Licencia del modelo no declarada: el autor no afirma ninguna licencia, lo que genera incertidumbre legal para redistribucion o uso comercial. Ademas, los datasets de entrenamiento tienen terminos propios (WikiText bajo CC BY-SA 3.0 y GFDL; Smol-Smoltalk y Empathetic Dialogues bajo Apache 2.0) que deben consultarse antes de cualquier uso derivado.
- El modelo depende de codigo Python personalizado (`model.py`) que debe cargarse con `sys.path.insert` y ejecucion de codigo arbitrario; el autor advierte descargar el codigo solo de fuentes de confianza.
- No es compatible con `AutoModel` de Transformers, lo que complica su integracion en ecosistemas estandar.
- Sesgos: no documentados por el autor, pero al entrenarse sobre WikiText y Empathetic Dialogues es probable que herede sesgos de esos corpus; no hay evaluaciones al respecto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kaafivikrant/Second5M
- Dataset WikiText: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset Smol-Smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset Empathetic Dialogues for LLM: https://huggingface.co/datasets/Estwld/empathetic_dialogues_llm
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
