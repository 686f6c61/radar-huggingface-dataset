# saidutta69/Qwen2.5-0.5B-Instruct-heretic

## Resumen

Qwen2.5-0.5B-Instruct-heretic es una variante "decensored" del modelo Qwen2.5-0.5B-Instruct de Alibaba, desarrollada por el usuario saidutta69 (RACER IS OP) mediante la técnica de ablación direccional conocida como "abliteration", implementada en la herramienta Heretic. El objetivo es suprimir el comportamiento de rechazo del modelo base sin recurrir a fine-tuning, de modo que el conocimiento y la capacidad de seguir instrucciones se conservan prácticamente intactos.

Con 494 millones de parámetros, es el modelo más pequeño de la serie heretic del autor, pensado para inferencia solo con CPU, despliegue en entornos embebidos o de borde, o cualquier escenario donde el peso del modelo sea más crítico que la profundidad de razonamiento. Su techo de capacidad es inherentemente inferior al de sus hermanos mayores (3B y 14B), pero ofrece una alternativa ligera para aplicaciones de generación de texto sin moderación. El modelo hereda la licencia qwen-research de la base y está disponible en formatos safetensors y GGUF cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 33.000 tokens (segun Antbase; el modelo base Qwen2.5 soporta 32K) |
| Tipos de cuantizacion | BF16/FP16 (safetensors), GGUF F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (declarado) |
| Licencia | qwen-research (uso investigativo, terminos comerciales en el enlace de la licencia) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura Qwen2.5-0.5B-Instruct, un transformer decoder-only con normalizacion RMSNorm, activaciones SwiGLU y atencion con sesgo de atencion (attention bias). La modificacion principal es la ablacion direccional aplicada con Heretic, que edita los pesos de las proyecciones de salida de atencion y las down-projections del MLP para eliminar la direccion de activacion asociada al rechazo de solicitudes. Este proceso no emplea datos nuevos ni fine-tuning, por lo que las capacidades del modelo base se mantienen en gran medida.

El modelo base fue entrenado por Alibaba con un corpus multilingue extenso, seguido de fases de fine-tuning con instrucciones y optimizacion con RLHF/DPO. La variante heretic solo modifica pesos existentes; no hay informacion sobre el numero de tokens de entrenamiento adicionales, ya que no se realizo entrenamiento adicional.

## Capacidades
- Generacion de texto conversacional y de instrucciones, con rechazo de solicitudes suprimido: el modelo cumple con peticiones que la base rechazaria, incluidas algunas que no deberia.
- Soporte de tool calling / function calling, segun la informacion de Antbase.
- Compatible con pipelines de texto generativo via transformers, llama.cpp, Ollama, vLLM, SGLang y LM Studio.
- Capacidades multilingues limitadas: solo ingles declarado, aunque el modelo base Qwen2.5 soporta varios idiomas; la calidad en otros idiomas puede ser variable.
- Sin modo de vision ni audio; es un modelo puramente textual.
- Razonamiento y matematicas limitadas por el tamano de 0.5B, con capacidad de seguir instrucciones simples.

## Casos de uso
- Despliegue en dispositivos embebidos o de borde: el modelo en GGUF Q4_K_M ocupa 398 MB, por lo que puede ejecutarse en CPU con poca RAM, ideal para prototipos en Raspberry Pi o microcontroladores con suficiente memoria.
- Generacion de texto en entornos sin GPU: al ser de 0.5B, es ejecutable en CPU de forma fluida con llama.cpp o Ollama, adecuado para aplicaciones de chat locales.
- Investigacion de tecnicas de ablacion: permite estudiar el efecto de la supresion de rechazo en un modelo pequeno y comparar con el base.
- Prototipado rapido de aplicaciones de chat sin moderacion: para pruebas internas donde se requiera respuestas sin filtros de seguridad, con advertencias claras de uso.
- Fine-tuning posterior: al conservar las capacidades del base, puede servir de partida para fine-tuning en dominios especificos con requisitos de tamano reducido.
- Evaluacion de riesgos de modelos ablacionados: util para medir el impacto de la supresion de rechazo en la fiabilidad factual y la calidad de las respuestas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta variante heretic. El modelo base Qwen2.5-0.5B-Instruct tiene resultados conocidos, pero no se ha publicado una comparativa especifica de la version ablacionada.

## Requisitos de hardware
- VRAM estimada para inferencia: con cuantizacion Q4_K_M, requiere menos de 1 GB de VRAM en GPU; en CPU, alrededor de 400 MB de RAM.
- GPU recomendadas: cualquier GPU con soporte CUDA y 1 GB de VRAM, como NVIDIA GTX 1050, GTX 1650, RTX 2060 o superiores; tambien puede ejecutarse en GPU integradas.
- Cabe en consumer GPU: si, en practicamente cualquier GPU disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang, transformers.
- Latencia y throughput: al ser un modelo de 0.5B, la generacion es rapida en CPU (varios tokens por segundo) y muy rapida en GPU, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 494M | 32K | Apache 2.0 | safetensors, GGUF | Con rechazo de solicitudes; es el modelo original |
| Qwen2.5-0.5B-Instruct-heretic | 494M | 33K | qwen-research | safetensors, GGUF | Sin rechazo, ablacion direccional |
| Qwen2.5-Coder-0.5B-Instruct-heretic | 494M | 33K | qwen-research | safetensors, GGUF | Variante especializada en codigo, misma tecnica de ablacion |

La comparativa se limita a caracteristicas estructurales, ya que no hay datos de rendimiento publicados para la variante heretic. El modelo base tiene licencia Apache 2.0, mientras que la variante heretic hereda la licencia qwen-research, mas restrictiva para uso comercial.

## Limitaciones y advertencias
- Sin capa de seguridad adicional: el modelo cumple con solicitudes que el base rechazaria, incluidas algunas que no deberia. El autor advierte de no desplegarlo en endpoints publicos no moderados.
- Riesgo de alucinacion: con 0.5B, la fiabilidad factual es limitada incluso antes de la ablacion; la supresion del rechazo no mejora la correccion.
- Idioma: solo se declara ingles; el rendimiento en otros idiomas puede ser degradado.
- Licencia qwen-research: uso comercial sujeto a los terminos de la licencia enlazada; no es de dominio publico.
- Limitaciones de razonamiento: el tamano de 0.5B limita la capacidad de razonamiento complejo, matematica avanzada y generacion de codigo extenso.
- Riesgo de uso indebido: al no tener filtros de seguridad, puede generar contenido inapropiado o danino; el responsable del despliegue asume el riesgo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/saidutta69/Qwen2.5-0.5B-Instruct-heretic
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Licencia qwen-research: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- Variante relacionada Qwen2.5-3B-Instruct-heretic: https://huggingface.co/saidutta69/Qwen2.5-3B-Instruct-heretic
- Variante Qwen2.5-Coder-0.5B-Instruct-heretic: https://huggingface.co/saidutta69/Qwen2.5-Coder-0.5B-Instruct-heretic
- Ficha en Antbase: https://antbase.ai/models/qwen2-5-0-5b-instruct-heretic
