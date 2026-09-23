# ewin-reg/MiniCPM5-2B-GSQ-RCO-IQ3_S

## Resumen

MiniCPM5-2B-GSQ-RCO-IQ3_S es una version cuantizada del modelo openbmb/MiniCPM5-2B, publicada por el usuario ewin-reg en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un checkpoint de pesos comprimidos mediante dos tecnicas descritas en la model card: GSQ (Gumbel-Softmax Quantization), que aplica una relajacion discreta de desplazamiento local con valores en {-1, 0, 1} sobre codigos de arranque en caliente, y RCO (Riemannian Constrained Optimization), que resuelve una optimizacion global de precision mixta sobre una variedad riemanniana sujeto a un presupuesto estricto de 3,50 bits por peso.

El modelo base conserva la arquitectura transformer de 42 bloques y 2.516.756.480 parametros (aproximadamente 2,52 mil millones). La cuantizacion asigna 3 bits a 21 capas y 4 bits a las 21 restantes, dejando las proyecciones de atencion Q, K y V bloqueadas en 4 bits para preservar estabilidad de representacion. El resultado declarado es un artefacto de aproximadamente 1,15 GB, equivalente en presupuesto al formato GGUF IQ3_S.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de cuantizacion de precision mixta guiada por metodos de optimizacion con restricciones, un area activa para desplegar modelos de ~2B en hardware de gama de consumo. El repositorio no tiene descargas ni interacciones registradas y la verificacion empirica publicada es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniCPM5-2B), 42 bloques |
| Parametros totales | 2.516.756.480 (2,52 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta 3/4 bits a 3,50 bpw (GSQ + RCO); equivalente declarado a GGUF IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Repositorio | ewin-reg/MiniCPM5-2B-GSQ-RCO-IQ3_S |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamano del repo | 5,0 GB (tamano comprimido declarado: ~1,15 GB) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base MiniCPM5-2B: un transformer denso de 42 bloques con aproximadamente 2,52 mil millones de parametros. Este repositorio no contiene un proceso de entrenamiento nuevo; contiene unicamente pesos cuantizados derivados de dicho modelo base. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO.

La innovacion tecnica reside en el pipeline de cuantizacion en dos etapas. La primera, GSQ, parte de codigos de cuantizacion preexistentes (warm-start) con un prior de identidad y aplica una relajacion discreta de desplazamiento local limitada a {-1, 0, 1}, lo que permite explorar vecindades discretas de forma diferenciable mediante Gumbel-Softmax. La segunda, RCO, plantea la asignacion de precision por capa como una optimizacion sobre una variedad riemanniana con una restriccion dura de 3,50 bits por peso. El reparto final es 21 capas a 3 bits y 21 capas a 4 bits. Las proyecciones Q, K y V se fuerzan a 4 bits de forma explicita, lo que sugiere que el metodo identifica la atencion como el componente mas sensible a la degradacion por cuantizacion agresiva.

## Capacidades

- Generacion de texto conversacional en ingles, segun el prompt de prueba publicado.
- Generacion de texto condicionada por prompt largo (el unico ejemplo disponible usa una pregunta tecnica de una frase).
- Capacidad de continuacion de texto generico, heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Capacidad de razonamiento tecnico fiable: limitada. La unica generacion publicada como verificacion empirica deriva en una confusion terminologica ("Riemannian Constructual Optimization" y "RMSD") y describe incorrectamente el contenido del paper de referencia.

## Casos de uso

- Despliegue en hardware de gama de consumo: con un artefacto comprimido de ~1,15 GB, es viable ejecutar el modelo en GPU con 4-6 GB de VRAM o incluso en CPU con llama.cpp, lo que permite prototipado local sin acceso a aceleradores de datacenter.
- Experimentacion academica en cuantizacion: el repositorio sirve como caso de estudio reproducible de precision mixta con restriccion de bitrate, util para comparar GSQ y RCO frente a tecnicas clasicas como GPTQ o AWQ sobre un mismo modelo base.
- Generacion de texto de bajo coste en lote: para tareas de resumen, clasificacion o reescritura donde el presupuesto de memoria es la restriccion dominante y no se requiere maxima calidad.
- Evaluacion de degradacion por cuantizacion: comparar las salidas de este checkpoint con las del modelo base openbmb/MiniCPM5-2B permite medir la perdida de calidad a 3,50 bpw en tareas concretas.
- Investigacion sobre asignacion por capa: el reparto 3/4 bits publicado es un punto de partida para estudiar que capas toleran menor precision, especialmente util si se dispone de un conjunto de validacion propio.
- Integracion en pipelines de inferencia locales con llama.cpp u Ollama: la etiqueta IQ3_S sugiere compatibilidad con el ecosistema GGUF, lo que facilita el despliegue en entornos sin CUDA.
- Chatbot de asistencia basico sin requisitos de contexto largo: viable mientras la ventana de contexto del modelo base no sea un cuello de botella y el caso de uso no exija alta fidelidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una verificacion empirica cualitativa:

| Prueba | Prompt | Salida publicada |
|---|---|---|
| Generacion cualitativa | "Explain why Riemannian Constrained Optimization is effective for mixed-precision quantization." | Texto que menciona C, FP32, FP16 y confunde el nombre del metodo con "Riemannian Constructual Optimization" y "RMSD" |

No hay datos de MMLU, HumanEval, GSM8K, perplexity ni comparaciones numericas frente al modelo base o a otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,2-1,5 GB a 3,50 bpw, partiendo del tamano comprimido declarado de ~1,15 GB.
- VRAM total estimada en inferencia: del orden de 2-4 GB, sumando pesos y cache KV, en funcion de la longitud de contexto efectiva (no declarada).
- GPU consumer compatibles: GTX 1650 4 GB, RTX 3050 6 GB, RTX 3060 8/12 GB, RTX 4060, RTX 4090. Cabe con holgura en cualquier GPU consumer moderna.
- GPU de datacenter: A100, H100, L40S y similares, aunque son sobredimensionadas para este modelo salvo por agregacion de lotes.
- Ejecucion en CPU: viable gracias al tamano reducido; el formato de pesos safetensors requiere conversion previa si se quiere usar llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y otros runners GGUF si se convierte a ese formato; vLLM y TGI son compatibles con el modelo base en precision completa; transformers sirve para carga directa de los safetensors cuantizados si el formato es reconocido.
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 5,0 GB frente a los ~1,15 GB de pesos comprimidos declarados. La model card no explica esta diferencia, lo que puede implicar la presencia de tensores adicionales o de varias versiones de los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Bitrate | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM5-2B-GSQ-RCO-IQ3_S | 2,52 B | 3,50 bpw (mixto 3/4 bits) | ~1,15 GB | no disponible | Apache 2.0 | Repositorio sin descargas |
| openbmb/MiniCPM5-2B (base) | 2,52 B | 16 bits | ~5 GB | no disponible | Apache 2.0 | Modelo original |
| Otras alternativas de ~2-3 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento que permitan comparar este checkpoint con alternativas equivalentes de la misma categoria.

## Limitaciones y advertencias

- El unico ejemplo de generacion publicado contiene errores factuales y terminologicos evidentes, lo que apunta a una degradacion notable de la calidad respecto al modelo base.
- Riesgo elevado de alucinacion en contenido tecnico: el modelo inventa nombres de metodos y describe incorrectamente el paper citado en su propio prompt de prueba.
- No se declara la longitud de contexto soportada, dato critico para planificar aplicaciones conversacionales.
- No se declaran los idiomas soportados; la evidencia disponible solo cubre ingles.
- No hay resultados de benchmarks ni evaluacion de perplexity, por lo que no es posible cuantificar la perdida de calidad frente al modelo base.
- La cuantizacion a 3,50 bpw es agresiva; el propio autor bloquea Q/K/V a 4 bits por estabilidad, lo que indica sensibilidad conocida.
- El repositorio tiene 0 descargas y 0 likes, sin proceso de revision comunitario. La validacion es practicamente inexistente.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; conviene verificar los terminos del modelo base de todos modos.
- La discrepancia entre el tamano del repositorio (5,0 GB) y el tamano comprimido declarado (~1,15 GB) no esta explicada y deberia verificarse antes de integrar en produccion.
- No apto para produccion en tareas que exijan precision factual sin una evaluacion propia previa y un conjunto de validacion especifico del dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ewin-reg/MiniCPM5-2B-GSQ-RCO-IQ3_S
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper GSQ, "Gumbel-Softmax Quantization with Local-Shift Discrete Relaxation": arXiv:2604.18556
- Paper RCO, "Riemannian Constrained Optimization for Mixed-Precision LLMs": arXiv:2605.00649
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos por el buscador no guardan relacion con el contenido solicitado.
