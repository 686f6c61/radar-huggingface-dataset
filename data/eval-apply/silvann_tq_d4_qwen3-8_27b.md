# eval-apply/silvann_tq_D4_qwen3.8_27b

## Resumen

silvann_tq_D4_qwen3.8_27b es un empaquetado cuantizado del modelo Qwen/Qwen3.8-27B, publicado por el usuario eval-apply en Hugging Face. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión del checkpoint original de Qwen a un formato propietario denominado `silvann-packed-v3`, diseñado para ser leído por el motor de inferencia SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). El repositorio ocupa aproximadamente 15,7 GB, frente al peso que tendría el modelo en precisión completa.

La cuantización aplica 4 bits por peso a todas las matrices de las capas (TurboQuant con escala por fila), precedida de una rotación Hadamard con signos por bloques a lo largo del eje de entrada. La matriz de embeddings y la cabeza de salida se mantienen a 8 bits, mientras que las normas y tensores pequeños se conservan sin pérdida. El sufijo `D4` indica que el modelo es denso (sin expertos), en contraposición a las variantes `D4E4` que el mismo autor publica para arquitecturas MoE.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue de bajo peso para un modelo de 27B parámetros; por otro, advierte de una limitación fundamental, ya que el formato no es compatible con `transformers`, vLLM ni llama.cpp, sino únicamente con el runtime SiLVANN. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B); empaquetado propietario `silvann-packed-v3` |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, sin expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits por peso en matrices de capas (TurboQuant, escala por fila, rotacion Hadamard con signos por bloques); 8 bits en embedding y cabeza; tensores pequenos sin perdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros. Esta ficha no aporta información sobre la composición del dataset de entrenamiento, el número de tokens procesados ni las etapas de alineación (RLHF, DPO u otras) del modelo original; esos datos corresponden a la model card de Qwen, no a este repositorio.

La innovación técnica de este empaquetado reside en el códec de cuantización. Cada matriz de capa se almacena a 4 bits por peso mediante TurboQuant, con una escala por fila, y antes de la cuantización se aplica una rotación Hadamard con signos por bloques sobre el eje de entrada. Esta rotación distribuye los valores atípicos y reduce el error de cuantización en comparación con una cuantización por fila sin rotar. El embedding y la cabeza de salida se mantienen a 8 bits para preservar la fidelidad del vocabulario, y las normas y tensores pequeños se guardan sin pérdida. El resultado son unos 15 GB de pesos empaquetados.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, sujetas a la degradación introducida por la cuantización a 4 bits.
- Generación de código y matemáticas: capacidad del modelo original, no verificada en este empaquetado.
- Tool calling y function calling: presumiblemente soportado por el modelo base, pero no documentado en la model card de este repositorio.
- Razonamiento multi-paso y uso como agente: no documentado en este repositorio.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en este repositorio.

## Casos de uso

- Despliegue en el motor SiLVANN: el caso de uso directo es ejecutar el modelo con el runtime de Eval-Apply, que lee el formato `silvann-packed-v3`. Es el único entorno en el que el repositorio funciona sin conversión adicional.
- Investigación sobre cuantización: el empaquetado sirve como referencia para estudiar el efecto de TurboQuant con rotación Hadamard por bloques frente a otras técnicas de cuantización a 4 bits, comparando la perplejidad y la calidad de generación contra el checkpoint original.
- Evaluación de la degradación por cuantización: al mantener el tokenizador, la plantilla de chat y las configuraciones originales, permite comparar respuestas del modelo cuantizado con las del Qwen3.8-27B completo en la misma tarea.
- Inferencia con presupuesto de memoria reducido: con unos 15 GB de pesos, el modelo puede residir en GPUs de 24 GB (RTX 4090, L4, A10G) dejando margen para el KV cache, siempre que se use el runtime SiLVANN.
- Archivado y distribución de bajo ancho de banda: el tamaño reducido del repositorio facilita la descarga y el almacenamiento del modelo en entornos con cuotas de disco o red limitadas.
- Base para experimentos de cuantización mixta: la política de 4 bits en capas y 8 bits en embedding y cabeza puede servir de punto de partida para estudiar políticas alternativas de anchura por tensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15 GB solo para los pesos empaquetados; hay que sumar el KV cache, cuya magnitud depende de la longitud de contexto y del número de secuencias concurrentes (no disponible).
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, encaja en GPUs de 24 GB o más (RTX 4090, L4, A10G, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más, siempre que el runtime SiLVANN gestione correctamente el KV cache.
- Opciones de despliegue: exclusivamente el motor SiLVANN (Eval-Apply GPU Interpreter). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Compatibilidad de despliegue |
|---|---|---|---|---|---|
| silvann_tq_D4_qwen3.8_27b | 27B (denso) | no disponible | `silvann-packed-v3` (4/8 bits) | Apache 2.0 | Solo runtime SiLVANN |
| Qwen/Qwen3.8-27B (original) | 27B (denso) | no disponible | safetensors | Apache 2.0 | `transformers`, vLLM, TGI y otros |
| Otras cuantizaciones GGUF/AWQ del mismo modelo base | 27B (denso) | no disponible | GGUF, AWQ, GPTQ | Apache 2.0 | llama.cpp, Ollama, vLLM |

La diferencia principal frente a las alternativas no está en la capacidad del modelo, sino en el ecosistema de despliegue: este empaquetado exige un runtime propietario, mientras que el checkpoint original y las cuantizaciones estándar funcionan con herramientas ampliamente adoptadas.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato `silvann-packed-v3` solo lo lee el runtime SiLVANN; no funciona con `transformers`, vLLM, llama.cpp, Ollama ni TGI.
- Degradación por cuantización: la cuantización a 4 bits de todas las matrices de capa introduce pérdida de calidad respecto al modelo original; el autor no publica métricas de dicha degradación.
- Sesgos y alucinaciones: no documentados en este repositorio; se heredan los del modelo base Qwen3.8-27B, sin que el autor aporte evaluación alguna.
- Idiomas: la model card no declara idiomas soportados, por lo que no puede confirmarse el comportamiento multilingüe de este empaquetado.
- Contexto: la longitud de contexto no se especifica en el repositorio.
- Madurez del proyecto: el repositorio acumula 98 descargas y 0 likes, y el motor SiLVANN no se documenta en la información disponible; conviene evaluar su estabilidad antes de usarlo en producción.
- Licencia: Apache 2.0, incluida en el repositorio; permite uso comercial, pero el crédito del modelo corresponde al equipo de Qwen.
- Producción: al no haber benchmarks ni datos de latencia, no se recomienda adoptar este empaquetado en producción sin una evaluación propia previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D4_qwen3.8_27b
- Perfil del autor: https://huggingface.co/eval-apply/models
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
