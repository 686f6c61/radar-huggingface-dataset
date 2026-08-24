# rasa04/tinylm-1m

## Resumen

TinyLM-1M es un modelo de lenguaje de 1,22 millones de parámetros (1,09 millones sin contar los embeddings) entrenado desde cero en solo 20 minutos sobre una única GPU RTX 5090. Lo desarrolla el autor rasa04 como parte de una línea de investigación sobre arquitecturas eficientes para modelos extremadamente pequeños, siendo la hermana menor de TinyLM-11M. El modelo está pensado exclusivamente como banco de pruebas para técnicas arquitectónicas que no son compatibles con llama.cpp, por lo que no se distribuye en formato GGUF y requiere ejecutarse con el código propio del repositorio.

La relevancia de este modelo radica en su carácter experimental: incorpora innovaciones como capas Canon (convolución causal depthwise sobre el tiempo), value residual, embedding shortcut, ReLU² en lugar de SwiGLU, y entrenamiento con el optimizador Muon. Está entrenado sobre 3,28 mil millones de tokens de un corpus de dominio estrecho (historias simples, instrucciones cortas y aritmética básica) con un vocabulario BPE de 1024 tokens. Su licencia MIT permite uso libre, pero su capacidad factual es prácticamente nula, por lo que no es adecuado para tareas de conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con GQA, RoPE, QK-norm, capas Canon, value residual, embedding shortcut, ReLU², RMSNorm sin gain, zero-init en proyecciones de salida, tanh-softcap en logits, μP-readout |
| Parametros totales | 1,22 millones (1,09 millones sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se proporciona GGUF ni cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | model.pt (PyTorch) y tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un transformer pequeño con varias modificaciones experimentales. Incluye capas Canon, basadas en el trabajo de Allen-Zhu («Physics of LLM 4.1»), que consisten en una convolución causal depthwise a lo largo del tiempo, dando a cada canal acceso a las tres posiciones anteriores sin pasar por la atención. También incorpora un value residual (las capas mezclan el valor V de la primera capa) y un embedding shortcut que conecta los embeddings directamente con cada bloque. La activación es ReLU² en lugar de SwiGLU, se usa RMSNorm sin parámetro de gain, proyecciones de salida inicializadas a cero, softcap tangente hiperbólico en los logits y un readout con μP (maximal update parametrization). El entrenamiento se realizó con el optimizador Muon, con cautious weight decay y un programación de tasa de aprendizaje WSD (warmup-stable-decay). El dataset de entrenamiento consta de 3,28 mil millones de tokens, con un vocabulario BPE de 1024 tokens y dígitos separados individualmente. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles, limitada a dominios simples: historias cortas, instrucciones breves y aritmetica de 2-3 digitos.
- Mantenimiento del formato de chat con tokens especiales `<|bos|>`, `<|user|>` y `<|assistant|>`.
- Resolucion de tareas algoritmicas sencillas (89,0% en held-out tasks).
- Capacidad de seguir instrucciones cortas y generar respuestas coherentes dentro de su dominio.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso complejo.
- No tiene capacidades multimodales (ni vision ni audio).
- Multilingue: no, solo ingles.

## Casos de uso

- Investigacion academica sobre arquitecturas eficientes: el modelo sirve para estudiar el efecto de capas Canon, value residual y embedding shortcut en modelos de menos de 2M parametros, comparando con TinyLM-11M.
- Validacion de tecnicas de entrenamiento: permite probar el optimizador Muon, cautious weight decay y el schedule WSD en un entorno de bajo coste computacional (20 minutos de entrenamiento).
- Ensenanza de conceptos de LLMs: por su tamano minimo y codigo abierto, puede usarse en cursos para ilustrar el funcionamiento interno de atencion, embeddings y normalizacion.
- Generacion de texto de juguete en aplicaciones educativas o demos: por ejemplo, generar micro-historias o responder a preguntas aritmeticas simples en un entorno sin GPU.
- Benchmark de eficiencia de hardware: al ser tan pequeno, permite medir latencias y throughput en CPUs o GPUs de gama baja, aunque no se han publicado datos oficiales.
- Base para experimentos de destilacion o pruning: su arquitectura inusual puede servir como punto de partida para estudiar la transferencia de conocimiento desde modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que los benchmarks convencionales carecen de sentido para un modelo de 1,22M parametros y no se midieron. En su lugar, se evaluaron 200 tareas held-out con decodificacion greedy, comparando con TinyLM-11M:

| Prueba | TinyLM-1M | TinyLM-11M |
|---|---|---|
| Tareas algoritmicas | 89,0% | 99,5% |
| Mantenimiento de formato chat | 96,0% | 100% |
| Frases con mayuscula inicial | 87,8% | 88,5% |
| Frases con terminador | 89,9% | 91,2% |
| Repeticion de 5-gramas | 0,2% | 0,2% |
| bits/char en historias | 0,691 | 0,457 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamano de 1,22M parametros, cabe en cualquier GPU con mas de 1 GB de VRAM e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizo en una RTX 5090 en 20 minutos, por lo que la inferencia es trivial en hardware consumer.
- Compatibilidad con consumer GPU: si, cualquier GPU con al menos 1 GB de VRAM es suficiente.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI. Se ejecuta mediante el script `chat.py` del repositorio, que requiere PyTorch y tokenizers.
- Latencia y throughput: no se han publicado datos oficiales.

## Comparativa con modelos similares

El unico modelo comparable directamente es TinyLM-11M, del mismo autor y misma familia. No se dispone de informacion sobre otros modelos de tamano similar con las mismas caracteristicas experimentales.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| TinyLM-1M | 1,22M | no disponible | 3,28B tokens, 20 min en RTX 5090 | MIT | PyTorch (model.pt) |
| TinyLM-11M | 11M (aprox.) | no disponible | no disponible | MIT | no disponible |

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo historias simples, instrucciones cortas y aritmetica de 2-3 digitos. No es util para tareas generales.
- Sin conocimiento factual: la capacidad de almacenamiento de conocimiento se estima en unos 300 KB, por lo que no puede responder preguntas de cultura general ni datos reales.
- Solo ingles: no soporta otros idiomas.
- Sin compatibilidad con herramientas estandar: no hay GGUF, ni soporte para vLLM, llama.cpp u Ollama. Requiere ejecutar el codigo del repositorio.
- Riesgo de alucinacion: aunque no se han medido formalmente, al ser un modelo tiny con poca capacidad, es probable que genere texto incoherente o inventado fuera de su dominio.
- Sesgos: no se han evaluado sesgos especificos, pero al entrenarse con un corpus limitado (TinyStories y similares), puede reflejar sesgos presentes en esos datos.
- No apto para produccion: es un modelo de investigacion, sin garantias de calidad ni soporte.
- La informacion sobre contexto, cuantizacion y benchmarks estandar no esta disponible en la documentacion publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasa04/tinylm-1m
- No se encontraron otros enlaces relevantes en la busqueda web (los resultados de TinyLM en GitHub y otros repos corresponden a proyectos distintos).
