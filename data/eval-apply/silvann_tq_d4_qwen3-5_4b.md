# eval-apply/silvann_tq_D4_qwen3.5_4b

## Resumen

silvann_tq_D4_qwen3.5_4b es una versión cuantizada y reempaquetada de Qwen/Qwen3.5-4B, publicada por el usuario eval-apply. No se trata de un modelo nuevo ni de un fine-tune con cambios en los pesos: el repositorio solo modifica cómo se almacenan las matrices de pesos para que puedan cargarse en el motor de inferencia SiLVANN (el intérprete GPU de Eval-Apply y su librería de redes neuronales). El modelo subyacente, su arquitectura y su comportamiento son los del Qwen3.5-4B original.

La cuantización aplicada es TurboQuant con escala por fila: cada matriz de capa se guarda a 4 bits por peso y se rota a lo largo de su eje de entrada mediante una rotación bloqueada de Hadamard y signos. La capa de embedding y la cabeza de salida se mantienen a 8 bits (la cabeza se deriva del embedding, ya que el modelo los tiene atados), mientras que las normas y tensores pequeños se conservan sin pérdida. El resultado ocupa unos 3,5 GB.

Su relevancia es doble: por un lado, demuestra una técnica de compresión agresiva (4 bits) con verificación explícita contra el forward original de Hugging Face; por otro, introduce un formato propietario (`silvann-packed-v3`) que no es compatible con `transformers`, lo que limita su uso al runtime de SiLVANN. Es un artefacto interesante para quien evalúe codecs de cuantización, no para quien busque un modelo listo para producción con el ecosistema estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B); empaquetado para el motor SiLVANN |
| Parametros totales | 4B (modelo base); tamaño del repo 3,5 GB |
| Parametros activos | no disponible (modelo denso, sin expertos; el autor indica "dense 4") |
| Longitud de contexto | no disponible (no se especifica en la información proporcionada) |
| Tipos de cuantizacion | TurboQuant 4 bits por peso en matrices de capa (escala por fila); 8 bits en embedding y cabeza; normas y tensores pequeños sin pérdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros desarrollado por el equipo Qwen. Este repositorio no aporta información sobre la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card original de Qwen3.5-4B, no a este artefacto.

La innovación técnica de este repositorio está en el codec de almacenamiento. Cada matriz de capa se cuantiza a 4 bits por peso con TurboQuant, aplicando una escala por fila y una rotación bloqueada de Hadamard y signos a lo largo del eje de entrada antes de la cuantización. El embedding y la cabeza de salida se mantienen a 8 bits; como el modelo ata la cabeza al embedding, esta se reconstruye a partir de aquel. El autor reporta una verificación contra el forward de los pesos originales en Hugging Face: el token de continuación greedy coincide token a token y los cinco logits superiores difieren 0,33 de media. El formato `silvann-packed-v3` se describe mediante `pack.json` (codec y política de anchura por tensor), con los registros de cada capa en `layers/NNN/` y el embedding, la cabeza y la norma final en `global.pkl`. El tokenizer, la plantilla de chat y las configuraciones son los del modelo original.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Qwen3.5-4B original, aunque no se detallan en la información disponible.
- Código y matemáticas: no se documentan explícitamente en este repositorio; dependen del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas del repo está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia en el motor SiLVANN: única vía de ejecución soportada por el formato empaquetado.

## Casos de uso

- Evaluación de codecs de cuantización: comparar la calidad de TurboQuant a 4 bits frente a otras técnicas (GPTQ, AWQ, GGUF Q4) usando la verificación del autor contra el forward original como referencia de fidelidad.
- Investigación en formatos de pesos propietarios: estudiar el diseño de `silvann-packed-v3` (`pack.json`, registros por capa, `global.pkl`) como caso de empaquetado orientado a un runtime específico.
- Despliegue en hardware AMD Instinct: el autor reporta 101,9 tokens/s en una MI50 tras un prompt de 2.000 posiciones, lo que lo hace adecuado para prototipos en GPUs AMD con el runtime SiLVANN.
- Inferencia en CPU sin GPU: con 17,8 tokens/s en dos Xeon E5-2680 v4 y 4,0 tokens/s en cuatro hilos, sirve para entornos de laboratorio o pruebas de humo sin acelerador.
- Reproducción de experimentos de cuantización: al incluir la metodología de rotación Hadamard y escala por fila, permite replicar el pipeline sobre otros modelos del mismo tamaño.
- Docencia y divulgación: como ejemplo práctico de cuantización post-entrenamiento con verificación de fidelidad token a token frente al modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de inferencia y fidelidad:

| Metrica | Valor |
|---|---|
| Fidelidad de token greedy vs. original | Coincidencia token a token |
| Desviación media de los cinco logits superiores | 0,33 |
| Throughput en AMD Instinct MI50 (prompt de 2.000 posiciones) | 101,9 tokens/s |
| Throughput en CPU, 2x Xeon E5-2680 v4 | 17,8 tokens/s |
| Throughput en CPU, 4 hilos | 4,0 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB de pesos; el consumo real depende del runtime SiLVANN y de la longitud de contexto (no disponible).
- GPU recomendadas: AMD Instinct MI50 (medida por el autor); no se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? Por tamaño (3,5 GB) sí cabría en GPUs con 8 GB o más, pero no hay confirmación de compatibilidad con el runtime SiLVANN en esas tarjetas.
- Opciones de despliegue: exclusivamente el motor SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato no lo lee `transformers`.
- Latencia y throughput: 101,9 tokens/s en MI50; 17,8 tokens/s en 2x Xeon E5-2680 v4; 4,0 tokens/s en 4 hilos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| silvann_tq_D4_qwen3.5_4b | 4B | no disponible | TurboQuant 4 bits (capas) + 8 bits (embedding/cabeza) | Apache 2.0 | `silvann-packed-v3`, solo SiLVANN |
| Qwen/Qwen3.5-4B (original) | 4B | no disponible | FP16/BF16 | Apache 2.0 | safetensors, `transformers` |
| Versiones GGUF de Qwen3.5-4B | 4B | no disponible | Q4_K_M, Q5_K_M, etc. | Apache 2.0 | GGUF, llama.cpp / Ollama |

La comparación con otras alternativas de cuantización (GPTQ, AWQ) no está disponible en la información proporcionada. La diferencia clave frente al original y frente a GGUF es la compatibilidad: este repositorio solo funciona en SiLVANN, mientras que las otras dos vías se integran en el ecosistema estándar.

## Limitaciones y advertencias

- Incompatibilidad con `transformers`: el formato `silvann-packed-v3` requiere el runtime SiLVANN; no se puede cargar con `AutoModelForCausalLM` ni con herramientas estándar.
- Sin datos de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede evaluar la degradación de calidad frente al modelo original más allá de la verificación de logits del autor.
- Idiomas no declarados: el campo de idiomas está vacío; no se puede confirmar el soporte multilingüe.
- Contexto no especificado: se desconoce la longitud máxima de contexto soportada por el runtime.
- Sesgos y alucinaciones: no documentados en este repositorio; heredados del Qwen3.5-4B original, cuya model card no se incluye en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor recuerda que todos los créditos del modelo pertenecen al equipo Qwen y que se aplica la licencia original.
- Madurez del artefacto: 23 descargas y 0 likes en el momento de la consulta; es un experimento de investigación, no un artefacto con soporte de producción.
- Verificación limitada: la comprobación de fidelidad se basa en un único criterio (token greedy y cinco logits), no en una evaluación completa de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D4_qwen3.5_4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos del motor SiLVANN.
