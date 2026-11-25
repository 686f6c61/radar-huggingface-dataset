# s6dk/DeepSeek-R1-Distill-Qwen-1.5B-heretic

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-heretic es una variante "decensored" (abliterated) del modelo destilado DeepSeek-R1-Distill-Qwen-1.5B, publicado por el usuario s6dk en Hugging Face. El modelo base es un transformer denso de tipo Qwen2 con 1.777.088.000 parametros, destilado por DeepSeek a partir de su modelo de razonamiento DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B. La modificacion consiste en una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada con la herramienta Heretic v2.2.0.dev0, que reduce la tasa de rechazos del modelo original de 71/100 a 7/100 en el conjunto de evaluacion del autor.

El interes de esta ficha reside en dos frentes. Por un lado, el modelo base es un destilado de razonamiento de pequeno tamano que conserva las capacidades de chain-of-thought de DeepSeek-R1 y cabe en GPU de consumo. Por otro, la variante heretic demuestra una tecnica de "abliteration" reproducible y medible, con parametros de ablacion publicados y una divergencia KL de 0.0340 respecto al original, lo que permite evaluar el coste de eliminar los rechazos en terminos de deriva de comportamiento.

La licencia es MIT, lo que facilita el uso comercial, pero conviene tener presente que la eliminacion de rechazos implica riesgos de seguridad y de cumplimiento que el autor no aborda en la model card. El modelo tiene un volumen de descargas muy bajo (60 en el momento de la consulta) y no dispone de benchmarks propios mas alla de la metrica de rechazos y la divergencia KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen2 (tag `qwen2`) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el repo ocupa 3,6 GB) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen2 con 1.777 millones de parametros. DeepSeek lo obtuvo mediante destilacion a partir de DeepSeek-R1: segun la documentacion del modelo original, los destilados se entrenan con datos de razonamiento generados por DeepSeek-R1 sobre arquitecturas Llama y Qwen, en lugar de aplicar RL directamente sobre el modelo pequeno. DeepSeek-R1, a su vez, se entreno con un pipeline de dos etapas de RL y dos etapas de SFT, partiendo de DeepSeek-R1-Zero, que valido que las capacidades de razonamiento pueden incentivarse solo con RL sin SFT previo. La model card no detalla el numero de tokens de destilacion ni la composicion del dataset para esta variante de 1.5B.

La modificacion heretic aplica una Arbitrary-Rank Ablation sobre las capas 13 a 23 (start_layer_index 13, end_layer_index 23), con neighbor_count 3 y pesos preserve_good_behavior_weight 0.4864, steer_bad_behavior_weight 0.0012 y overcorrect_relative_weight 0.1923. La herramienta Heretic v2.2.0.dev0 permite reproducir el proceso, y el autor incluye un directorio `reproduce` con instrucciones. El resultado medido es una reduccion de rechazos de 71/100 a 7/100 con una divergencia KL de 0.0340 frente al modelo original, lo que cuantifica la deriva introducida por la ablacion.

## Capacidades

- Generacion de texto conversacional en formato chat, con soporte de plantilla Qwen2.
- Razonamiento con chain-of-thought heredado de DeepSeek-R1 (modo de pensamiento del destilado).
- Resolucion de problemas matematicos y de logica de complejidad media, limitada por el tamano de 1.5B.
- Generacion de codigo basico y explicacion de fragmentos de codigo.
- Reduccion drastica de rechazos: el modelo responde a peticiones que el original rechazaria en la mayoria de casos (7/100 frente a 71/100).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible (modelo solo de texto).

## Casos de uso

- Prototipado de razonamiento en local: el modelo cabe en una GPU de consumo y permite experimentar con chain-of-thought de DeepSeek-R1 sin infraestructura dedicada; util para validar prompts y plantillas antes de escalar a variantes mayores.
- Investigacion sobre abliteration y alineacion: los parametros ARA publicados y el directorio de reproduccion permiten replicar el proceso y estudiar la relacion entre eliminacion de rechazos y divergencia KL en modelos pequenos.
- Evaluacion de seguridad de modelos decensored: util para construir conjuntos de prueba que midan la tasa de cumplimiento de peticiones sensibles y comparar con el modelo original.
- Generacion de codigo asistida en entornos controlados: para tareas de autocompletado y explicacion de fragmentos donde el desarrollador revisa la salida, aprovechando el sesgo de razonamiento del destilado.
- Chat conversacional sin filtros para investigacion linguistica: analisis de estilos de respuesta y de sesgos cuando se retira la capa de rechazo, con fines academicos.
- Fine-tuning posterior: al ser un modelo pequeno con licencia MIT y pesos safetensors, sirve como base para ajuste supervisado en dominios concretos (soporte interno, documentacion tecnica) con coste de computo reducido.
- Despliegue en dispositivos con VRAM limitada: el repo de 3,6 GB en safetensors permite cuantizacion a 8 o 4 bits para entornos de borde, aunque las cuantizaciones no estan publicadas por el autor.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (DeepSeek-R1-Distill-Qwen-1.5B) |
|---|---|---|
| Rechazos (sobre 100) | 7/100 | 71/100 |
| Divergencia KL | 0.0340 | 0 (por definicion) |

No se han publicado resultados de benchmarks de razonamiento (MMLU, GSM8K, HumanEval u otros) en la informacion disponible para esta variante. Los unicos datos medidos son la tasa de rechazos y la divergencia KL frente al original.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-5 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100 y H100 no son necesarias y estarian sobredimensionadas.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas; tambien en CPU con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama mediante conversion a GGUF, aunque el autor no publica esos formatos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s6dk/DeepSeek-R1-Distill-Qwen-1.5B-heretic | 1.777 M | no disponible | 7/100 | MIT | Hugging Face (60 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.777 M | no disponible | 71/100 | MIT | Hugging Face (modelo base, ampliamente usado) |
| Qwen2.5-1.5B-Instruct | ~1.5 B | no disponible | no disponible | Apache 2.0 (segun el modelo original de Qwen) | Hugging Face |

La comparativa con otros modelos abliterated de la misma familia (por ejemplo, variantes heretic de Llama o Qwen de mayor tamano) no esta disponible en la informacion proporcionada. Frente al original, la diferencia medible es la tasa de rechazos y la divergencia KL; no hay datos de rendimiento en tareas de razonamiento que permitan afirmar si la ablacion degrada la calidad en matematicas o codigo.

## Limitaciones y advertencias

- La eliminacion de rechazos reduce las salvaguardas del modelo: puede generar contenido danino, ilegal o inseguro, y no es adecuado para aplicaciones de cara al publico sin moderacion externa.
- La divergencia KL de 0.0340 indica una deriva medible respecto al original; no se han publicado evaluaciones de si esta deriva afecta a la calidad del razonamiento o a la factualidad.
- Riesgo de alucinacion inherente a los modelos de 1.5B, agravado por el modo de razonamiento largo del destilado, que puede producir cadenas de pensamiento plausibles pero incorrectas.
- La model card no documenta sesgos conocidos, idiomas soportados ni comportamiento multilingue; no hay garantias de calidad fuera del ingles.
- La licencia MIT permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado sin filtros.
- Volumen de uso muy bajo (60 descargas, 0 likes) y sin validacion independiente; conviene tratar la variante como experimental.
- La longitud de contexto no esta documentada en la informacion disponible; no se debe asumir la ventana del modelo base sin verificarla.
- El autor no publica cuantizaciones GGUF ni versiones optimizadas; el despliegue en produccion requeriria conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s6dk/DeepSeek-R1-Distill-Qwen-1.5B-heretic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Heretic (proyecto): https://heretic-project.org
- Directorio de reproduccion: https://huggingface.co/s6dk/DeepSeek-R1-Distill-Qwen-1.5B-heretic/tree/main/reproduce
- Paper de referencia (arXiv 2501.12948): https://arxiv.org/abs/2501.12948
