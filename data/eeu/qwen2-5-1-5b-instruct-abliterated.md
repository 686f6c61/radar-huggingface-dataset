# EEU/Qwen2.5-1.5B-Instruct-abliterated

## Resumen

EEU/Qwen2.5-1.5B-Instruct-abliterated es una variante del modelo Qwen2.5-1.5B-Instruct de Alibaba Cloud, publicada por el usuario EEU en Hugging Face. Se trata de una version "abliterated", es decir, un ajuste fino orientado a eliminar o atenuar el comportamiento de rechazo (refusal) que incorpora el modelo original tras su alineamiento. El modelo base pertenece a la familia Qwen2.5, una de las mas utilizadas en el ecosistema open source por su relacion calidad/tamano y su licencia permisiva.

Con 1.500 millones de parametros, este modelo esta disenado para ejecutarse en hardware modesto, incluyendo GPUs de consumo, y para tareas de generacion de texto, razonamiento basico, codigo y conversacion multi-turno. El contexto nativo de la familia Qwen2.5-1.5B es de 32.768 tokens, ampliable mediante configuracion, aunque la model card publicada por EEU no aporta especificaciones propias.

La relevancia de esta publicacion es limitada: la model card esta practicamente vacia (solo contiene la etiqueta de licencia), no hay descargas ni likes registrados, y no se documenta el proceso de abliteration, los datos usados ni las evaluaciones. Para produccion, conviene tratarlo como un experimento comunitario no validado y no como un modelo con garantias tecnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct; no confirmada en la model card) |
| Parametros totales | 1.500 millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite GGUF, AWQ, GPTQ y cuantizaciones de 8 y 4 bits mediante herramientas de la comunidad |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 soporta principalmente ingles y chino, con soporte parcial de otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la model card; presumiblemente safetensors, como el modelo base |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura ni el proceso de entrenamiento de esta variante. Por herencia del modelo base Qwen2.5-1.5B-Instruct, se trata de un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings de tipo RoPE. El modelo original fue preentrenado por Alibaba Cloud sobre un corpus multilingue de gran escala (del orden de billones de tokens, segun la documentacion publica de Qwen2.5) y posteriormente ajustado con instrucciones y tecnicas de alineamiento (SFT y optimizacion por preferencias).

La tecnica de "abliteration" consiste habitualmente en identificar la direccion del espacio de activaciones asociada al comportamiento de rechazo y aplicar una modificacion (por ejemplo, ortogonalizacion o edicion de pesos) para suprimirla, sin reentrenamiento completo. En este caso concreto, el autor no publica ni el metodo exacto, ni el dataset, ni la magnitud de la intervencion, ni evaluaciones que confirmen que el modelo conserva capacidades del original tras la edicion. Tampoco se indica si se aplico RLHF, DPO o ajuste adicional alguno.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y resolucion de problemas de complejidad baja o media, limitado por el tamano de 1.500 millones de parametros.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, etc.), con calidad propia de un modelo pequeno.
- Aritmetica y matematicas elementales; no se recomienda para problemas de varios pasos sin verificación externa.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-Instruct lo documenta, aunque no hay confirmacion de que esta variante lo conserve intacto.
- Capacidad multilingue parcial (ingles, chino y otros idiomas), segun el modelo base; no verificada en esta variante.
- Supresion atenuada o eliminada de rechazos: el modelo tiende a responder a peticiones que el original rechazaria, sin que el autor documente el alcance de este efecto.
- No se documentan capacidades de vision, audio ni modo "thinking" extendido.

## Casos de uso

- Prototipado rapido en local: al ser un modelo de 1.500 millones de parametros, permite iterar en portatiles con GPU modesta o incluso en CPU con cuantizacion de 4 bits, util para pruebas de concepto antes de escalar a modelos mayores.
- Generacion de texto asistida en entornos con recursos limitados: redaccion de borradores, resumenes y reformulaciones en aplicaciones donde el coste por token o la privacidad impiden usar APIs en la nube.
- Experimentacion en investigacion sobre alineamiento y refusal: sirve como objeto de estudio para comparar el comportamiento del modelo original frente a la variante abliterated en tareas de evaluacion de sesgos y seguridad.
- Chatbots de dominio acotado: con un contexto de hasta 32.768 tokens (segun el modelo base), puede gestionar conversaciones multi-turno en escenarios de soporte interno o documentacion tecnica.
- Filtrado y clasificacion de texto: tareas de etiquetado, extraccion de entidades simples y moderacion preliminar, donde la latencia baja y el coste contenido son prioritarios.
- Generacion de codigo en pipelines de desarrollo: autocompletado y generacion de fragmentos en entornos con recursos limitados, con revision humana obligatoria dada la tasa de error esperable en un modelo de este tamano.
- Fine-tuning como base: al tener licencia Apache 2.0, puede servir como punto de partida para ajustes especificos en dominios verticales sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones propias ni comparaciones con el modelo original. Los resultados publicos de Qwen2.5-1.5B-Instruct (por ejemplo, en MMLU, HumanEval o GSM8K) no son extrapolables a esta variante sin verificacion, ya que la edicion de pesos puede alterar el rendimiento en tareas de razonamiento y seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB solo para pesos, mas overhead de KV cache y runtime; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits (GGUF Q4_K_M), en torno a 1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). En cuantizacion de 4 bits cabe en GPUs de 4 GB o incluso en CPU.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4060, etc.) y en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM, TGI y transformers con PyTorch. Para produccion con concurrencia, vLLM o TGI son las opciones mas eficientes.
- Latencia y throughput: no disponibles en la informacion proporcionada. En un modelo de este tamano, en una RTX 4090 con vLLM se esperan decenas de tokens por segundo por peticion, pero no hay datos medidos para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EEU/Qwen2.5-1.5B-Instruct-abliterated | 1.500 M | no disponible (base: 32.768) | Apache 2.0 | Variante abliterated sin documentacion tecnica ni evaluaciones |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | Modelo original, documentado y evaluado por Alibaba |
| meta-llama/Llama-3.2-1B-Instruct | 1.200 M | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamano similar con contexto mayor y licencia mas restrictiva |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Apache 2.0 | Modelo pequeno orientado a eficiencia, con evaluaciones publicas |

La comparacion directa con el modelo original es la mas relevante: esta variante no aporta mejoras documentadas en rendimiento y solo modifica el comportamiento de rechazo, por lo que para usos generales el modelo original es la opcion recomendada.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre el metodo de abliteration, los datos usados, el impacto en capacidades ni evaluaciones de seguridad.
- La supresion del comportamiento de rechazo implica que el modelo puede generar contenido danino, ilegal o inseguro sin las salvaguardas del original; no es adecuado para aplicaciones orientadas al publico sin filtros externos.
- Riesgo elevado de alucinacion, inherente a un modelo de 1.500 millones de parametros, y potencialmente agravado por la edicion de pesos no documentada.
- No hay confirmacion de que las capacidades de tool calling, multilingue o razonamiento del modelo base se conserven tras la modificacion.
- Los idiomas soportados no estan documentados; se presume el comportamiento del modelo base (predominio de ingles y chino).
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no ofrece garantias de ningun tipo; el uso en produccion requiere evaluacion propia y filtros de seguridad adicionales.
- No hay descargas ni validacion de la comunidad en el momento de la consulta, lo que reduce la confianza en la reproducibilidad del artefacto.
- Fecha de creacion registrada como 2026-11-22, lo que resulta anomala; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EEU/Qwen2.5-1.5B-Instruct-abliterated
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog tecnico de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
