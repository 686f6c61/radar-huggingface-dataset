# eval-apply/silvann_tq_D4_qwen3.5_4b

## Resumen

silvann_tq_D4_qwen3.5_4b es un empaquetado cuantizado del modelo Qwen/Qwen3.5-4B, publicado por el usuario eval-apply. No se trata de un modelo entrenado desde cero ni de un fine-tune con datos nuevos: el repositorio solo cambia el formato de almacenamiento de los pesos originales para que puedan cargarse en el motor de inferencia SiLVANN (el intérprete GPU de Eval-Apply y su librería de redes neuronales). El modelo base es un transformer denso de 4.000 millones de parámetros desarrollado por el equipo Qwen.

La cuantización aplicada es TurboQuant a 4 bits por peso en todas las matrices de capa, con una escala por fila y una rotación de Hadamard con signos por bloques aplicada sobre el eje de entrada. La matriz de embedding y la cabeza de salida se mantienen a 8 bits, y la cabeza se construye a partir del embedding porque el modelo original las tiene atadas (weight tying). Las normas y tensores pequeños se conservan sin pérdida. El resultado ocupa unos 3,5 GB.

Su relevancia es acotada pero concreta: demuestra un pipeline de cuantización de 4 bits con rotaciones ortogonales que preserva la fidelidad de la distribución de logits (desviación media de 0,33 en el top-5 frente al forward original de Hugging Face) y ofrece cifras de rendimiento en hardware poco habitual, como una AMD Instinct MI50. El formato propietario `silvann-packed-v3` lo hace inutilizable fuera del runtime SiLVANN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-4B); empaquetado para el motor SiLVANN |
| Parametros totales | 4 000 millones (modelo base); el repositorio no indica el recuento exacto |
| Parametros activos | No aplica (modelo denso, sin expertos; el sufijo D4 indica dense 4) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | 4 bits por peso en matrices de capa (TurboQuant, escala por fila, rotacion Hadamard+signos por bloques); 8 bits en embedding y cabeza; normas y tensores pequenos sin perdida |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con transformers |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. Este repositorio no aporta entrenamiento adicional: no hay datos de preentrenamiento, RLHF ni DPO propios, y toda la información sobre el dataset de origen corresponde al modelo Qwen original, que no se detalla en la model card. Lo que sí documenta el autor es el esquema de compresión.

El codec TurboQuant aplica 4 bits por peso a cada matriz de capa con una escala por fila, y antes de cuantizar rota cada matriz a lo largo de su eje de entrada mediante una transformación de Hadamard con signos por bloques. Esta rotación ortogonal reparte la energía de los valores y reduce el error de cuantización en las colas de la distribución. El embedding y la cabeza de salida se guardan a 8 bits, con la cabeza derivada del embedding por el weight tying del modelo original. Las normas y tensores pequeños quedan en precisión completa. El autor verificó el resultado comparando la continuación greedy token a token contra el forward de Hugging Face con los pesos originales, con una desviación media de 0,33 en los cinco logits más altos. El formato se describe en `pack.json` (codec y política de anchura por tensor), con los registros de cada capa en `layers/NNN/` y el embedding, la cabeza y la norma final en `global.pkl`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B; el repositorio no documenta capacidades adicionales.
- Las capacidades específicas del modelo base (código, matemáticas, tool calling, agentes, multilingüismo, modo thinking o visión) no se detallan en la información proporcionada.
- El tokenizador, la plantilla de chat y las configuraciones son los del modelo original, por lo que el comportamiento conversacional debería reproducirse si el runtime SiLVANN los respeta.
- La fidelidad medida (continuación greedy idéntica token a token y top-5 de logits con 0,33 de desviación media) sugiere que la cuantización preserva el comportamiento del modelo original en la práctica.

## Casos de uso

- Despliegue en el motor SiLVANN: el caso de uso directo es ejecutar Qwen3.5-4B dentro del intérprete GPU de Eval-Apply, ya que el formato `silvann-packed-v3` solo lo lee ese runtime.
- Inferencia en GPUs de gama alta con poca memoria: los 3,5 GB del repositorio permiten cargar el modelo en tarjetas con 8 GB o menos, algo imposible con los pesos en fp16 (unos 8 GB solo de pesos).
- Evaluación de técnicas de cuantización: sirve como referencia reproducible para medir el impacto de TurboQuant con rotaciones de Hadamard frente al modelo original, gracias a la comparación token a token publicada.
- Procesamiento por lotes en hardware AMD: las 101,9 tokens/s medidas en una Instinct MI50 tras un prompt de 2.000 posiciones lo hacen viable para tareas de generación masiva en infraestructura AMD.
- Inferencia en CPU para entornos sin GPU: las 17,8 tokens/s en dos Xeon E5-2680 v4 permiten usos interactivos ligeros o generación en segundo plano en servidores de CPU.
- Pruebas de integración del runtime SiLVANN: útil para desarrolladores que quieran validar el cargador de pesos, la plantilla de chat y el tokenizador del motor con un modelo de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de fidelidad y velocidad:

| Metrica | Valor |
|---|---|
| Fidelidad de continuacion greedy | Identica token a token frente al forward de Hugging Face |
| Desviacion media del top-5 de logits | 0,33 |
| Throughput en AMD Instinct MI50 | 101,9 tokens/s tras un prompt de 2.000 posiciones |
| Throughput en CPU (2x Xeon E5-2680 v4) | 17,8 tokens/s |
| Throughput en CPU (4 hilos) | 4,0 tokens/s |

## Requisitos de hardware

- VRAM estimada: unos 3,5 GB para los pesos empaquetados, más el espacio de activaciones y caché KV, que depende de la longitud de contexto y no se documenta.
- GPU recomendadas: AMD Instinct MI50 es la única con medición publicada (101,9 tokens/s). No hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: por tamaño, cabe en cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, etc.), aunque no hay mediciones publicadas en estas tarjetas.
- CPU: funciona en CPU sola, con 17,8 tokens/s en dos Xeon E5-2680 v4 y 4,0 tokens/s en cuatro hilos.
- Opciones de despliegue: exclusivamente el runtime SiLVANN; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato no lo lee transformers.
- Latencia y throughput: solo los valores medidos por el autor en MI50 y CPU; no hay datos de latencia por token ni de throughput con lotes mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| silvann_tq_D4_qwen3.5_4b | 4 000 M (4 bits en capas) | No disponible | silvann-packed-v3 | Apache 2.0 | SiLVANN |
| Qwen/Qwen3.5-4B | 4 000 M | No disponible | safetensors (original) | Apache 2.0 | transformers, vLLM, llama.cpp, etc. |
| Otras cuantizaciones GGUF/AWQ del mismo base | 4 000 M | No disponible | GGUF, AWQ, GPTQ | Apache 2.0 | llama.cpp, vLLM, Ollama |

La comparación con alternativas de cuantización del mismo modelo base (GGUF Q4_K_M, AWQ, GPTQ) no puede cuantificarse en rendimiento porque no hay benchmarks publicados en la información disponible. La diferencia práctica es el ecosistema: las cuantizaciones estándar funcionan en runtimes ampliamente adoptados, mientras que esta solo funciona en SiLVANN.

## Limitaciones y advertencias

- El formato `silvann-packed-v3` no lo lee transformers ni ninguna herramienta estándar; sin el runtime SiLVANN el repositorio es inutilizable.
- No hay benchmarks de calidad (MMLU, HumanEval, GSM8K) que permitan verificar que la cuantización a 4 bits no degrada tareas de razonamiento o código; la única validación es la coincidencia greedy y la desviación de logits.
- La desviación media de 0,33 en el top-5 de logits implica que en generación con muestreo las distribuciones no son idénticas a las del modelo original.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; deben asumirse los del modelo base Qwen3.5-4B, no descritos aquí.
- No se indica la longitud de contexto soportada, dato crítico para planificar memoria de caché KV en producción.
- El repositorio tiene 182 descargas y 0 likes, con un único autor; no hay evidencia de validación independiente de las métricas reportadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el empaquetado; la responsabilidad sobre el modelo original recae en el equipo Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D4_qwen3.5_4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
