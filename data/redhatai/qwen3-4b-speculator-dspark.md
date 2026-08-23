# RedHatAI/Qwen3-4B-speculator.dspark

## Resumen

RedHatAI/Qwen3-4B-speculator.dspark es un modelo de decodificacion especulativa (speculator) desarrollado por Red Hat AI para acelerar la inferencia del modelo base Qwen/Qwen3-4B. No es un modelo de proposito general: actua como un modelo borrador (draft) que genera secuencias de tokens candidatas que un modelo verificador (el propio Qwen3-4B) acepta o rechaza, reduciendo la latencia de generacion en entornos de produccion. Utiliza la arquitectura DSpark, una extension de DFlash que incorpora una cabeza de Markov (dependencia intra-bloque de tokens) y una cabeza de confianza (prediccion de aceptacion por posicion).

El modelo fue entrenado con la libreria Speculators de vLLM sobre el dataset inference-optimization/Qwen3-8B-Regenerated-Collection, donde las respuestas fueron regeneradas por Qwen3-8B. Con 1.393.133.569 parametros (aproximadamente 1.4B), es un modelo compacto disenado para complementar al modelo base de 4B sin duplicar el coste computacional. Su licencia Apache 2.0 facilita su adopcion comercial, y Red Hat AI lo valida para su portfolio de productos de IA generativa.

La relevancia de este modelo radica en su capacidad para acelerar la inferencia de Qwen3-4B en entornos productivos, especialmente en escenarios de alto trafico donde la latencia es critica. Red Hat AI ha publicado tasas de aceptacion por posicion en varios datasets, mostrando una longitud media aceptada de entre 3.19 y 5.37 tokens, lo que indica una mejora sustancial en el throughput respecto a la generacion autoregresiva clasica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (speculator con cabeza Markov y cabeza de confianza) |
| Parametros totales | 1.393.133.569 (1.4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen3-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Libreria de entrenamiento | Speculators (vllm-project) |
| Hardware de validacion | Nvidia H100 |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura DSpark, que extiende DFlash anadiendo una cabeza Markov (con rango 256) para modelar la dependencia intra-bloque entre tokens candidatos y una cabeza de confianza que predice la probabilidad de aceptacion de cada posicion. Esta combinacion permite al modelo borrador generar secuencias de hasta 8 tokens especulativos por paso (configuracion por defecto en el despliegue), que el verificador Qwen3-4B acepta o rechaza en bloque. La funcion de perdida combina entropia cruzada (peso 0.1) y divergencia total (peso 0.9), con un factor de decaimiento gamma de 4.0 para DFlash.

El entrenamiento se realizo con la libreria Speculators de vLLM, utilizando el dataset Qwen3-8B-Regenerated-Collection, compuesto por respuestas regeneradas por Qwen3-8B a partir de multiples conjuntos de datos (AutoIF, Evol-CodeAlpaca, LMSYS Arena, Magpie, MetaMathQA, Nemotron, Orca Math, Tulu3, UltraChat, UltraFeedback y UltraInteract). La preparacion de datos genero secuencias de longitud 4096, y el entrenamiento se ejecuto con 7 GPUs (presumiblemente H100) mediante FSDP, con optimizador AdamW, tasa de aprendizaje 6e-4, scheduler coseno con calentamiento del 4%, y 10 epocas. El modelo se entreno con bloques de 7 tokens y un maximo de 512 anclas, apuntando a las capas 1, 9, 17, 25 y 33 del modelo base Qwen3-4B.

## Capacidades

- Decodificacion especulativa: genera secuencias candidatas de hasta 8 tokens por paso para el verificador Qwen3-4B, reduciendo la latencia de inferencia.
- Head de confianza: predice la probabilidad de aceptacion de cada posicion, lo que permite al sistema decidir dinamicamente cuantos tokens validar.
- Dependencia intra-bloque: la cabeza Markov modela dependencias entre tokens dentro del mismo bloque, mejorando la coherencia de las secuencias propuestas.
- Compatibilidad con vLLM: se despliega mediante el endpoint especulativo de vLLM con el metodo dspark, integrandose directamente con el modelo base.
- Soporte de chat: hereda la plantilla de chat de Qwen3-4B, por lo que puede usarse con el endpoint /chat/completions.
- Multilingue: no se publican idiomas especificos, pero al ser un especulador para Qwen3-4B, hereda las capacidades multilingues del modelo base.
- No apto para generacion autonoma: no genera texto de forma independiente; solo produce borradores para el verificador.

## Casos de uso

- Aceleracion de inferencia en chatbots: en un servicio de chat basado en Qwen3-4B, el especulador puede reducir la latencia percibida por el usuario al generar tokens candidatos en paralelo, especialmente en conversaciones multi-turno con contexto largo.
- Optimizacion de agentes con tool calling: en agentes que usan Qwen3-4B para llamar a herramientas, el especulador acelera la generacion de llamadas de funcion y respuestas intermedias, mejorando la capacidad de respuesta de sistemas autonomos.
- Reduccion de costes en inferencia a gran escala: al aumentar el throughput por GPU (mas tokens generados por segundo), se necesitan menos instancias para servir el mismo volumen de peticiones, reduciendo el coste operativo.
- Despliegue en entornos de produccion con vLLM: el modelo se integra como configuracion especulativa en vLLM, permitiendo a equipos de ML desplegarlo sin cambios en la logica de aplicacion.
- Validacion de modelos en el portfolio de Red Hat AI: Red Hat valida este especulador para sus productos de IA generativa, por lo que es apto para empresas que usan OpenShift AI o RHEL AI.
- Entrenamiento de especuladores personalizados: el codigo de entrenamiento es publico, por lo que equipos de investigacion pueden reutilizarlo para crear especuladores para otros modelos base.

## Benchmarks y rendimiento

Se publicaron tasas de aceptacion por posicion del especulador sobre el modelo base Qwen3-4B en diferentes datasets:

| Dataset | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 | Longitud media aceptada |
|---|---|---|---|---|---|---|---|---|---|
| HumanEval | 85.6% | 71.5% | 58.9% | 48.2% | 39.1% | 31.4% | 25.0% | 19.6% | 4.79 |
| math_reasoning | 87.7% | 75.7% | 65.1% | 56.3% | 48.2% | 40.9% | 34.6% | 28.8% | 5.37 |
| qa | 75.9% | 56.7% | 41.7% | 31.4% | 23.6% | 17.6% | 13.0% | 9.6% | 3.70 |
| question | 79.0% | 60.6% | 46.6% | 35.9% | 27.9% | 21.7% | 17.2% | 13.2% | 4.02 |
| rag | 78.0% | 59.8% | 45.0% | 33.7% | 25.0% | 18.4% | 13.1% | 9.5% | 3.82 |
| summarization | 73.7% | 51.7% | 35.2% | 23.4% | 15.4% | 9.7% | 6.2% | 4.0% | 3.19 |
| tool_call | 78.9% | 60.3% | 45.8% | 34.3% | 25.7% | 19.0% | 14.2% | 10.3% | 3.89 |
| translation | 83.4% | 68.2% | 54.5% | 42.2% | 33.4% | 25.7% | 19.9% | 15.0% | 4.42 |
| writing | 79.0% | 60.7% | 46.8% | 36.1% | 28.0% | 21.9% | 17.2% | 13.2% | 4.03 |

No se publican resultados de benchmarks clasicos (MMLU, HumanEval, etc.) porque el modelo no es de proposito general, sino un especulador. Las tasas de aceptacion son el indicador de rendimiento relevante para esta categoria.

## Requisitos de hardware

- Inferencia: el especulador se ejecuta junto con el modelo base Qwen3-4B. La VRAM total depende del modelo base y de la cuantizacion elegida. Con Qwen3-4B en precision completa (FP16) y el especulador de 1.4B, se estima un uso de VRAM de aproximadamente 12-14 GB, lo que cabe en una RTX 4090 (24 GB) o A100 (40/80 GB).
- GPU recomendada: Nvidia H100 para validacion oficial, aunque cualquier GPU con suficiente VRAM para Qwen3-4B (e.g., RTX 4090, A100, L40S) deberia funcionar.
- Entrenamiento: se usaron 7 GPU (probablemente H100) con FSDP; no se especifica la VRAM minima por GPU.
- Despliegue: compatible con vLLM (metodo dspark en --speculative-config). No se documenta soporte para llama.cpp u Ollama.
- Latencia: no se publican cifras de throughput o latencia absolutas; las tasas de aceptacion sugieren una reduccion de latencia proporcional a la longitud media aceptada (3.19 a 5.37 tokens por paso).
- Opciones de despliegue: vLLM con configuracion especulativa; tambien es posible usar el codigo de entrenamiento de Speculators para ajustar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Qwen3-4B-speculator.dspark | 1.4B | 4096 | DSpark (Markov + confianza) | Apache 2.0 | Hugging Face |
| DFlash (especulador generico) | variable | variable | DFlash (sin cabeza Markov) | Apache 2.0 | Parte de Speculators |
| RedHatAI/Qwen3.6-35B-A3B-speculator.dspark | no disponible | no disponible | DSpark | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos especuladores. DSpark es una extension de DFlash, por lo que el modelo de Red Hat AI ofrece funcionalidad adicional (cabeza de confianza y dependencia intra-bloque) sobre DFlash. No hay datos de otros especuladores de tamano comparable para una comparacion directa.

## Limitaciones y advertencias

- No es un modelo de generacion de texto autonomo: solo funciona como borrador dentro de un sistema de decodificacion especulativa con vLLM y un verificador (Qwen3-4B).
- Dependencia de vLLM: requiere la libreria Speculators y vLLM con el metodo `dspark`; no es compatible con otras infraestructuras de inferencia.
- Validado solo con Qwen3-4B: no se garantiza que funcione correctamente con otros modelos base o versiones de Qwen.
- Contexto limitado: la secuencia de entrenamiento es de 4096 tokens; no se ha validado su rendimiento en contextos mas largos.
- Sesgos del modelo base: el especulador hereda los sesgos y limitaciones de Qwen3-4B, incluyendo riesgos de alucinacion y sesgos linguisticos o culturales.
- Datos de entrenamiento: el dataset regenerado por Qwen3-8B puede introducir patrones de generacion especificos que no generalizan a todos los dominios.
- Documentacion limitada: no se publican detalles sobre el hardware exacto de entrenamiento, la VRAM consumida ni el rendimiento en terminos de throughput o latencia absoluta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia de los datos de entrenamiento (Qwen3-8B-Regenerated-Collection) para posibles restricciones de redistribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3-4B-speculator.dspark
- Libreria Speculators de vLLM: https://github.com/vllm-project/speculators
- Documentacion de DSpark: https://docs.vllm.ai/projects/speculators/en/latest/user_guide/algorithms/dspark/
- Repositorio DeepSpec (configuracion DSpark): https://github.com/deepseek-ai/DeepSpec/blob/main/config/dspark/dspark_qwen3_4b.py
- Perfil de Red Hat AI en Hugging Face: https://huggingface.co/RedHatAI
- Dataset de entrenamiento: https://huggingface.co/datasets/inference-optimization/Qwen3-8B-Regenerated-Collection
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
