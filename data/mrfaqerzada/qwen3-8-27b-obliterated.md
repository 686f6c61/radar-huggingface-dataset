# mrfaqerzada/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una versión del modelo Qwen3.8-27B de Qwen a la que se ha aplicado una técnica de ablación (abliteration) para eliminar los mecanismos de rechazo o negativa del modelo original. El desarrollo corre a cargo de la comunidad OBLITERATUS (autor `mrfaqerzada`), especializada en investigación de seguridad y red-teaming. La versión V3 presentada en la model card logra una tasa de rechazo del 0 % tanto con el modo de pensamiento activado como desactivado, con una regresión de solo -0,9 puntos porcentuales en MMLU respecto al modelo base.

Se trata de un transformer denso de aproximadamente 27 000 millones de parámetros, distribuido en formatos safetensors, GGUF y MLX. La técnica de ablación combina dos métodos complementarios (SVD agresivo y LEACE) en una proporción 40/60, y la versión V3 incorpora un refinamiento iterativo con un corpus de 1000 prompts. La licencia es Apache 2.0, lo que permite uso comercial, aunque el contenido generado puede ser problemático en entornos regulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8, model_type: qwen3) |
| Parametros totales | 26.895.995.464 (aproximadamente 27B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Safetensors (BF16), GGUF (cuantizaciones variadas), MLX |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un transformer denso de 27B parametros que hereda la arquitectura de la familia Qwen3. El proceso de ablación se aplica sobre los pesos del modelo original, no mediante un fine-tuning convencional. La tecnica V2 combina dos metodos: una poda agresiva basada en descomposicion en valores singulares (SVD) que elimina direcciones de rechazo en el espacio de pesos, y una proyeccion LEACE que minimiza la informacion mutua entre las representaciones y las etiquetas de rechazo. La combinacion en proporcion 60% LEACE + 40% SVD equilibra la eliminacion de rechazos con la preservacion de capacidades. La version V3 anade un paso de refinamiento con un corpus de 1000 prompts (852 incorporados, 100 consultas simples y 48 avanzadas de red-teaming), aplicado de forma iterativa sobre la version V2.

No se proporcionan datos sobre el pre-entrenamiento del modelo base, como el numero de tokens o la composicion del dataset, ya que corresponden al modelo original de Qwen. El proceso de ablacion no implica entrenamiento adicional en el sentido clasico, sino una intervencion directa sobre los pesos.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades de Qwen3.8-27B para tareas de lenguaje general, con una perdida minima en MMLU (83,7 % frente al 84,6 % del modelo base).
- Generacion de codigo: el modelo destaca en tareas de programacion, incluyendo refactorizacion de codigo asincrono y depuracion de sistemas distribuidos.
- Tool calling y agentes: soporta loops de agente ReAct (Thought/Action/Observation) y encadenamiento de herramientas, como se valida en la prueba de agente ReAct con SQL.
- Razonamiento avanzado: resuelve tareas de diseno de sistemas, extraccion de esquemas JSON y revision de seguridad de codigo.
- Modo de pensamiento: compatible con el modo thinking de Qwen3, aunque la documentacion recomienda desactivarlo para evitar rechazos residuales.
- Sin censura: el modelo responde a consultas que el modelo base rechazaria, con una tasa de rechazo de 0/15 en pruebas V3.
- Capacidades multilingues: no se especifican idiomas concretos en la informacion disponible, aunque la familia Qwen3 es multilingue.

## Casos de uso

- Red-teaming de seguridad de IA: el modelo permite evaluar la robustez de sistemas de moderacion y de politicas de seguridad, generando prompts adversariales sin la restriccion de rechazo del modelo base. Se puede integrar en pipelines de evaluacion de seguridad como generador de ataques.
- Generacion de codigo en entornos sin restricciones: util para prototipado rapido de scripts, exploits de seguridad en entornos controlados o generacion de codigo ofuscado, donde el modelo base se negaria a colaborar.
- Agentes autonomos con tool calling: su capacidad para ejecutar loops ReAct y encadenar herramientas permite construir agentes que realizan busquedas, ejecutan SQL y generan respuestas estructuradas sin intervencion humana.
- Investigacion de alineacion y sesgos: al eliminar los rechazos, se pueden estudiar los sesgos subyacentes del modelo base y su comportamiento ante instrucciones adversariales.
- Evaluacion de modelos de seguridad: para probar sistemas de deteccion de contenido peligroso, el modelo puede generar respuestas que se espera que sean detectadas, sirviendo como generador de casos de prueba.
- Automatizacion de tareas de desarrollo: en entornos de investigacion sin restricciones, el modelo puede generar documentacion tecnica, resolver problemas de depuracion o disenar sistemas complejos con altos niveles de detalle.

## Benchmarks y rendimiento

La model card proporciona resultados de MMLU (lm-eval-harness, 0-shot) y de tasa de rechazo para las versiones V1, V2 y V3, junto con el modelo base de referencia.

| Modelo | MMLU (0-shot) | Refusal rate (think OFF) | Refusal rate (think ON) | Advanced real-world |
|---|---|---|---|---|
| Stock Qwen3.8-27B | 84,6 % (n=2850) | ~100 % | ~100 % | 7/8 |
| V1 (aggressive SVD) | 81,4 % | 0,0 % | N/D | No evaluado |
| V2 (blend 60/40) | 84,32 % | 0,24 % (2/842) | ~33 % (5/15) | 7/8 |
| V3 (refinement) | 83,7 % | 0/15 | 0/15 | 7/8 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible. La model card indica que la validacion completa de MMLU con 14 000 preguntas esta en progreso.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB (26.9B parametros × 2 bytes). En cuantizacion 4-bit, unos 14-16 GB; en 8-bit, unos 22-30 GB.
- GPUs recomendadas: A100 80GB, H100 80GB, RTX 4090 (24GB, con cuantizacion 4-bit), RTX A6000 48GB, o clusters con varias GPUs.
- En Apple Silicon: se puede ejecutar con MLX, aprovechando la memoria unificada de los chips M-series.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, MLX, TGI, o transformers con `device_map="auto"`.
- Latencia y throughput: no se proporcionan datos concretos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Refusal rate | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27B | No disponible | 84,6 % | ~100 % | Apache 2.0 |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED (V3) | 27B | No disponible | 83,7 % | 0 % (V3) | Apache 2.0 |
| OrcaRouter Qwen3.8-27B Uncensored MLX | 27B | No disponible | No disponible | No disponible | Apache 2.0 |
| AEON Qwen3.8-27B Uncensored | 27B | No disponible | No disponible | No disponible | Apache 2.0 |

La comparativa se limita a los datos disponibles en la informacion proporcionada. No se conocen resultados de benchmark para las variantes OrcaRouter y AEON, ni para la longitud de contexto de ninguno de los modelos.

## Limitaciones y advertencias

- Contenido no seguro: al eliminar los rechazos, el modelo puede generar contenido ilegal, peligroso o eticamente cuestionable. No debe desplegarse en entornos de produccion sin supervision humana.
- Alucinaciones: el modelo puede inventar informacion, especialmente en tareas de razonamiento complejas o con contexto largo.
- Modo de pensamiento: aunque V3 muestra 0 rechazos con thinking activado, la documentacion recomienda desactivarlo porque el razonamiento puede reintroducir rechazos residuales.
- Sesgos del modelo base: hereda los sesgos de Qwen3.5-27B, que no se han corregido en el proceso de ablacion.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar leyes de propiedad intelectual, privacidad o seguridad. La responsabilidad recae en el usuario.
- Recomendaciones de configuracion: el modelo requiere temperatura 0, repetition_penalty 1,15 y system prompt vacio para un funcionamiento optimo, lo que limita su uso en aplicaciones que necesiten variabilidad o prompts de sistema.

## Enlaces

- [HuggingFace - mrfaqerzada/Qwen3.8-27B-OBLITERATED](https://huggingface.co/mrfaqerzada/Qwen3.8-27B-OBLITERATED)
- [HuggingFace - Qwen/Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B)
- [HuggingFace - OBLITERATUS/Qwen3.5-27B-OBLITERATED](https://huggingface.co/OBLITERATUS/Qwen3.5-27B-OBLITERATED)
- [Repositorio OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS)
- [Articulo sobre OrcaRouter Qwen3.5-27B Uncensored MLX](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)
- [Articulo sobre AEON Uncensored](https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration)
