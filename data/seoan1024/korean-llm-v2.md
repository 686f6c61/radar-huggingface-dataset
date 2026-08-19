# seoan1024/korean-llm-v2

## Resumen

Korean-LLM v2 es un modelo de lenguaje grande (LLM) de 1.090 millones de parámetros desarrollado por el usuario seoan1024, con el objetivo de crear un modelo de lenguaje coreano completamente independiente, entrenado desde cero y ejecutable en local. El proyecto nace como respuesta a las limitaciones de las APIs comerciales (ChatGPT, Claude, Gemini) en cuanto a cuotas, costes y control, y busca ofrecer una alternativa transparente, personalizable y sin dependencia de servidores externos.

La arquitectura es un Transformer estilo Llama 2, con 20 capas, dimensión de embedding de 1.920, 10 cabezas de atención y una capa feed-forward de 4.800 unidades. El vocabulario está compuesto por 128.256 tokens coreanos. El contexto de entrenamiento es de 256 tokens, aunque en inferencia soporta hasta 2.048 tokens. El modelo se encuentra en fase de entrenamiento (12% completado a fecha de agosto de 2026), con una pérdida en descenso estable y sin signos de sobreajuste.

La relevancia actual radica en la creciente demanda de modelos de lenguaje locales y personalizables, especialmente para el idioma coreano, donde las opciones open source son limitadas. El proyecto demuestra que es posible entrenar un LLM desde cero en hardware de consumo (RTX 5090) con un presupuesto de tiempo razonable, lo que abre la puerta a iniciativas similares para otros idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (estilo Llama 2) |
| Parametros totales | 1.090.000.000 (1,09B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (entrenamiento) / 2.048 tokens (inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Transformer con normalización RMSNorm (pre-norm), similar a Llama 2. Tiene 20 capas, 10 cabezas de atención con dimensión 192, y una capa feed-forward de 4.800 unidades. El vocabulario es de 128.256 tokens, específicamente diseñado para el coreano. El entrenamiento se realiza con los datasets nlpai-lab/kullm-v2 y beomi/KoAlpaca-v1.1a, ambos en coreano. No se menciona el uso de RLHF o DPO. El entrenamiento se está llevando a cabo en una RTX 5090 Laptop con 24GB de VRAM, utilizando bfloat16 y el optimizador AdamW. A fecha de la model card, el entrenamiento estaba en el paso 6.000 de 50.000, con una pérdida en descenso estable y sin signos de sobreajuste.

## Capacidades

- Generacion de texto en coreano: el modelo es capaz de generar texto coherente en coreano, dado que fue entrenado especificamente para este idioma.
- Comprension del lenguaje coreano: al estar entrenado con datasets coreanos, comprende matices y estructuras gramaticales del coreano.
- Personalizacion: al ser un modelo abierto y con licencia GPL-3.0, permite fine-tuning para tareas especificas.
- Ejecucion local: puede ejecutarse en hardware local sin dependencia de APIs externas.
- No se mencionan capacidades de tool calling, agentes, vision, audio, etc. (no disponible)

## Casos de uso

- Chatbot local en coreano: el modelo puede desplegarse en un servidor local o en una maquina personal para ofrecer un asistente conversacional en coreano sin limites de uso ni costes por API.
- Generacion de contenido en coreano: redaccion de articulos, resumenes, correos electronicos o publicaciones en redes sociales en coreano, aprovechando su conocimiento del idioma.
- Fine-tuning para dominios especificos: al ser un modelo abierto, puede ajustarse con datos propios para tareas como atencion al cliente, analisis de sentimiento o clasificacion de textos en coreano.
- Educacion e investigacion: sirve como plataforma de aprendizaje para estudiantes e investigadores que quieran entender el funcionamiento interno de un LLM, gracias a su transparencia y tamano manejable.
- Prototipado rapido: al ser relativamente pequeno (1,09B), permite iterar rapidamente en experimentos de NLP en coreano sin necesidad de infraestructura costosa.
- Aplicaciones offline: puede integrarse en aplicaciones moviles o de escritorio que requieran procesamiento de lenguaje en coreano sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo muestra una curva de perdida durante el entrenamiento, que indica una disminucion estable de 4,8 a aproximadamente 2,8 en el paso 6.000. No hay comparaciones con otros modelos.

## Requisitos de hardware

- Entrenamiento: la model card indica que el entrenamiento se realiza en una RTX 5090 Laptop con 24GB de VRAM, utilizando 23GB (95,8% de la VRAM). El tiempo estimado total es de 30,5 horas para 50.000 pasos.
- Inferencia: con 1,09B parametros, en bfloat16 los pesos ocupan aproximadamente 2,2GB. Se puede estimar que la inferencia cabe en GPUs con al menos 4-6GB de VRAM, como una RTX 3060 o superior. Sin embargo, no se proporcionan datos oficiales de inferencia.
- Opciones de despliegue: no se mencionan herramientas especificas como vLLM, llama.cpp u Ollama. Dado que es un modelo Transformer estandar, deberia ser compatible con frameworks como Hugging Face Transformers, pero no esta confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El modelo se posiciona como una alternativa local a APIs comerciales, pero no hay benchmarks que lo comparen con otros LLMs coreanos como EXAONE, HyperClova o Solar. Se puede indicar que no hay datos.

## Limitaciones y advertencias

- El modelo esta aun en entrenamiento (12% completado), por lo que su rendimiento final puede variar.
- La longitud de contexto de entrenamiento es de solo 256 tokens, lo que limita la capacidad de manejar contextos largos en tareas que lo requieran.
- Solo soporta coreano; no hay evidencia de capacidades multilingues.
- La licencia GPL-3.0 puede ser restrictiva para uso comercial propietario, ya que exige que las obras derivadas tambien sean GPL.
- No se han publicado benchmarks ni evaluaciones de sesgos, alucinaciones o seguridad.
- El modelo no tiene capacidades avanzadas como tool calling, agentes o razonamiento multi-paso documentadas.
- El formato de pesos no esta especificado, lo que puede dificultar su uso con ciertas herramientas.

## Enlaces

- HuggingFace: https://huggingface.co/seoan1024/korean-llm-v2
- GitHub: https://github.com/seoan1210/korean-llm-v2
- Dataset kullm-v2: https://huggingface.co/datasets/nlpai-lab/kullm-v2
- Dataset KoAlpaca: https://huggingface.co/datasets/beomi/KoAlpaca-v1.1a
