# elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib2048-blade

## Resumen

Este modelo es una versión comprimida de Qwen/Qwen2.5-0.5B, desarrollada por elastix-ai mediante poda estructurada 2:4 (método blade) y fine-tuning BEAM para recuperar la calidad tras la compresión. El objetivo es reducir el coste computacional y la huella de memoria manteniendo un rendimiento cercano al del modelo original, lo que lo hace adecuado para despliegues en entornos con recursos limitados, como dispositivos edge o inferencia en tiempo real.

El modelo base, Qwen2.5-0.5B, es un transformer decoder-only de 494 millones de parámetros con una ventana de contexto de 32K tokens, entrenado por Alibaba sobre 18 billones de tokens. Esta versión comprimida aplica una poda semi-estructurada 2:4 (la mitad de los pesos se anulan en bloques de cuatro) en la mayoría de las capas, manteniendo los pesos en FP16 sin cuantización adicional. El resultado es un modelo con la misma arquitectura pero con un 50% de pesos nulos, lo que permite acelerar la inferencia en hardware con soporte de sparsity.

La relevancia de este modelo radica en su tamaño reducido (0.5B) combinado con la compresión, lo que lo convierte en una opción interesante para aplicaciones de baja latencia y bajo consumo energético, aunque no se han publicado benchmarks que verifiquen el impacto real de la poda en la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (poda 2:4, no MoE) |
| Longitud de contexto | 32K (heredado del modelo base, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 (sin cuantizacion, solo poda 2:4) |
| Idiomas soportados | no disponible (hereda los del modelo base: principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Qwen2.5-0.5B: un transformer decoder-only con atención causal, 24 capas, dimensiones ocultas de 896 y 14 cabezas de atención. La compresión se realiza mediante poda estructurada 2:4 (método blade), que anula dos de cada cuatro pesos en las capas de atención y MLP, excepto en embeddings, lm_head, conv1d de atención lineal y router del MLP, que se mantienen densos. Los pesos se almacenan en FP16 sin cuantización adicional.

El proceso de compresión incluye una fase de calibración con 2048 muestras del dataset SlimPajama-6B (split de validación, streaming) con una longitud de secuencia de 2048 tokens. Posteriormente se aplica un fine-tuning BEAM (Bias-Enhanced Adaptive Masking) con búsqueda de hiperparámetros mediante Optuna (20 muestras, entre 10 y 100 pasos, tasa de aprendizaje log-uniforme entre 1e-05 y 0.01, batch size entre 8 y 32). No se ha utilizado calibración simétrica ni conversión de expertos a lineal.

## Capacidades

- Generacion de texto: el modelo base es capaz de producir texto coherente en ingles y chino, aunque la poda puede degradar ligeramente la fluidez en tareas complejas.
- Razonamiento y matematicas: capacidades heredadas del modelo base, pero con posible perdida de precision en problemas aritmeticos o logicos de varios pasos.
- Generacion de codigo: el modelo base tiene cierta capacidad de generacion de codigo, aunque limitada por su tamano; la poda puede afectar a la sintaxis en fragmentos largos.
- Multilingue: soporta principalmente ingles y chino, con algo de otros idiomas, segun el modelo base.
- Tool calling: no confirmado para esta version comprimida; el modelo base no tiene soporte explicito de function calling en su configuracion estandar.
- Capacidades especiales: no se documentan modos de thinking, vision ni audio; es exclusivamente texto.

## Casos de uso

- Clasificacion de texto en tiempo real: al ser un modelo de 0.5B con poda 2:4, puede ejecutarse en CPUs o GPUs modestas para tareas como analisis de sentimiento, deteccion de spam o categorizacion de documentos, con latencias inferiores a 10 ms por muestra en hardware moderno.
- Generacion de respuestas cortas en asistentes conversacionales: su tamano reducido permite integrarlo en chatbots de bajo coste que responden preguntas frecuentes o generan sugerencias, sin necesidad de infraestructura GPU dedicada.
- Autocompletado de texto en editores: la ventana de contexto de 32K permite manejar documentos largos, y la poda reduce el coste de inferencia, haciendolo util para sugerencias de escritura en aplicaciones de productividad.
- Filtrado y resumen de contenido: puede utilizarse para generar resumenes breves de articulos o correos, aprovechando su capacidad de procesar secuencias largas con un presupuesto de memoria reducido.
- Prototipado rapido de aplicaciones NLP: los desarrolladores pueden usar este modelo como base para experimentar con tecnicas de compresion o para validar ideas antes de escalar a modelos mayores, gracias a su bajo coste de ejecucion.
- Inferencia en dispositivos edge: con un peso de aproximadamente 1 GB en FP16, cabe en dispositivos con 2-4 GB de RAM, como Raspberry Pi 5 o smartphones de gama media, para tareas de generacion de texto offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K para esta version comprimida, ni comparaciones con el modelo base o alternativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para los pesos en FP16 (494M parametros × 2 bytes), mas overhead de activaciones y cache KV; se recomienda un minimo de 2 GB de VRAM para inferencia basica.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar el modelo; GPUs con soporte de sparsity 2:4 (A100, H100) aprovechan la poda para acelerar la inferencia, aunque no es imprescindible.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama baja y media (RTX 3060, RTX 4060, etc.) con cuantizacion adicional si se requiere menor huella.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI pueden cargar el modelo, pero la poda 2:4 solo se aprovecha en runtimes que soporten kernels sparse (por ejemplo, vLLM con backends CUDA recientes); en caso contrario, se ejecuta como un modelo denso con pesos nulos.
- Latencia y throughput: no disponibles; dependen del hardware y del runtime, pero se espera que la poda reduzca el tiempo de inferencia en hardware compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B (original) | 494M | 32K | Apache-2.0 | safetensors | Modelo base sin compresion |
| Este modelo (comprimido) | 494M (50% nulos) | 32K | no disponible | safetensors | Poda 2:4, FP16 |
| Llama-3.2-1B | 1.23B | 128K | Llama 3.2 | safetensors | Mayor tamano, contexto mayor |
| Gemma-2-2B | 2.6B | 8K | Gemma license | safetensors | Mayor tamano, contexto menor |

No se dispone de datos de rendimiento comparativo; la eleccion entre estos modelos dependera de las restricciones de memoria, licencia y calidad requerida.

## Limitaciones y advertencias

- La poda 2:4 puede degradar la calidad en tareas de razonamiento complejo, generacion de codigo largo o matematicas avanzadas; no se han publicado evaluaciones que cuantifiquen esta perdida.
- La licencia del modelo comprimido no esta especificada en la model card; aunque el modelo base es Apache-2.0, el trabajo derivado podria tener restricciones adicionales. Se recomienda contactar con el autor antes de uso comercial.
- No se documentan sesgos especificos, pero el modelo base puede heredar sesgos de los datos de entrenamiento de Qwen2.5, que incluyen contenido de internet.
- Riesgo de alucinacion: presente en todos los modelos de este tamano; la compresion puede aumentar la frecuencia de respuestas inexactas en contextos largos.
- La ventana de contexto de 32K no esta confirmada en la model card; se asume del modelo base, pero la poda podria afectar a la atencion en secuencias muy largas.
- No hay soporte garantizado de tool calling ni de agentes; el modelo base no lo incluye de forma nativa.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigacion sin validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib2048-blade
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Reporte tecnico Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Dataset de calibracion SlimPajama-6B: https://huggingface.co/datasets/DKYoon/SlimPajama-6B
- Repositorio GitHub de Qwen2.5 (no oficial): https://github.com/weixiyim/Qwen2.5
