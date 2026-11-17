# eademir/TurkLM-scratch-0.5B

## Resumen

TurkLM-scratch-0.5B es un modelo de lenguaje causal en turco de 473 millones de parámetros desarrollado por el usuario eademir y publicado en Hugging Face. Se trata de un modelo entrenado completamente desde cero (inicialización aleatoria, sin transferencia de pesos de ningún checkpoint existente) sobre datos exclusivamente en turco, empleando la arquitectura de Qwen3 y un tokenizador BPE turco de 32.000 tokens compartido con el modelo hermano TurkLM-scratch-0.3B.

El modelo resuelve un problema concreto: la mayoría de los modelos multilingües de tamaño pequeño asignan una fracción reducida de su presupuesto de parámetros y de entrenamiento al turco, lo que se traduce en una tokenización ineficiente (fertilidad alta) y un modelado del lenguaje pobre para ese idioma. TurkLM aborda esto con un vocabulario específico para turco y un entrenamiento monoingüe, lo que se refleja en una fertilidad de 1,80 tokens por palabra frente a 2,69 de Qwen3-0.6B.

Es relevante ahora como base de investigación para modelado de texto en turco, estudios de tokenización y punto de partida para ajuste fino. No es un modelo instructivo ni ha recibido entrenamiento de seguridad, por lo que su uso en producción requiere fine-tuning y capas adicionales de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Qwen3: GQA, SwiGLU, RoPE, RMSNorm, embeddings atados |
| Parametros totales | 473.235.456 (473,2M medidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 posiciones máximas, pero entrenado solo con secuencias de 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer de estilo Qwen3 con 28 capas, tamaño oculto de 1.024, 16 cabezas de consulta y 8 cabezas KV (grouped-query attention), dimensión de cabeza de 128, FFN intermedio de 3.072 y embeddings atados. La base RoPE es 10.000 (no 1.000.000 como en el modelo de 0.3B), valor que debe mantenerse tal como aparece en `config.json`: el autor documenta que cambiarlo a 1.000.000 degrada el modelo de 1,034 a 1,277 bits por carácter en su conjunto de evaluación.

El entrenamiento consta de 142.900 pasos de optimizador repartidos en varias fases con tamaño de lote variable: unos 40.800 pasos a 32.768 tokens por paso, después 131.072 tokens por paso hasta el paso 140.000 y 196.608 tokens por paso en los últimos 2.900 pasos, lo que suma aproximadamente 14.900 millones de tokens (con incertidumbre de ±1.000 millones, ya que la cifra se reconstruye a partir de los cambios de configuración y no de un registro directo). Los datos son Wikipedia en turco (30%) y el subconjunto turco de CulturaX (70%). No se documenta RLHF, DPO ni ajuste por instrucciones. El tokenizador es un BPE ByteLevel de 32.000 tokens con normalización NFC, entrenado desde cero sobre 500.000 documentos turcos.

## Capacidades

- Generación de texto causal en turco: continuación de texto, modelado de lenguaje y predicción del siguiente token.
- Modelado de lenguaje base: útil para calcular probabilidades y bits por carácter sobre texto turco.
- Tokenización eficiente para turco: fertilidad de 1,80 tokens por palabra, frente a 2,69 de Qwen3.
- Punto de partida para ajuste fino supervisado (SFT) y para estudios de tokenización.
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al turco; no se documenta soporte de otros idiomas.

## Casos de uso

- Investigación en modelado de lenguaje turco: el modelo sirve para medir bits por carácter y comparar arquitecturas o tokenizadores sobre texto turco reciente, con scripts de evaluación reproducibles incluidos en el repositorio.
- Estudios de tokenización: su vocabulario BPE de 32.000 tokens entrenado específicamente en turco permite analizar fertilidad y coste computacional por palabra frente a tokenizadores multilingües.
- Base para ajuste fino supervisado: al ser un modelo base sin instrucciones, es adecuado para aplicar SFT con datasets turcos propios y obtener un asistente especializado de tamaño reducido.
- Generación de texto asistida en turco: continuación de documentos, borradores y texto libre, siempre con revisión humana debido a la ausencia de entrenamiento de seguridad.
- Experimentación académica de bajo coste: con 473M de parámetros y pesos en bfloat16 (aproximadamente 0,9 GB de repositorio), cabe en GPUs de consumo y permite iterar rápidamente en entornos de investigación.
- Evaluación comparativa de modelos pequeños: sirve como referencia monoingüe para contrastar el rendimiento de modelos multilingües de tamaño similar en turco.
- Preentrenamiento continuado: puede emplearse como inicialización para seguir preentrenando con dominios específicos (legal, médico, técnico) en turco.

## Benchmarks y rendimiento

| Modelo | Parámetros | BPC ↓ | XCOPA-TR ↑ | Fertilidad ↓ | Velocidad (tok/s) ↑ |
|---|---|---|---|---|---|
| TurkLM-scratch-0.3B | 316M | 1,0108 | 56,0% | 1,80 | 64,9 |
| **TurkLM-scratch-0.5B** | 473M | 0,9956 | 54,0% | 1,80 | 53,5 |
| Qwen3-0.6B | 596M | 1,6026 | 54,2% | 2,69 | 51,4 |
| Qwen3-1.7B | 1.721M | 1,3467 | 51,0% | 2,69 | 37,3 |
| Turkcell-LLM-7b-v1 | 7.376M | 0,9528 | 56,2% | 2,17 | 15,4 |

El BPC se mide sobre 200 artículos de Wikipedia en turco creados después de la recogida de datos de entrenamiento (page id ≥ 4.500.000 del dump de 2026-11-01, 958.229 caracteres). XCOPA-TR son 500 preguntas de sentido común con dos opciones (aleatorio = 50%). La velocidad se mide generando 100 tokens en bfloat16 sobre un Mac con Apple Silicon, en la misma sesión para todos los modelos. El autor advierte que 200 artículos es un conjunto pequeño y que diferencias inferiores a 0,02 BPC no deben sobreinterpretarse.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (473M × 2 bytes) más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 3 GB según longitud de secuencia y framework.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB. No se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas para inferencia.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se publican conversiones oficiales.
- Latencia y throughput: el autor reporta 53,5 tokens por segundo generando 100 tokens en bfloat16 sobre Apple Silicon, lo que equivale a unos 30 palabras por segundo en turco dada la fertilidad de 1,80.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPC (turco) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurkLM-scratch-0.5B | 473M | 40.960 (entrenado a 1.024) | 0,9956 | Apache 2.0 | Hugging Face |
| TurkLM-scratch-0.3B | 316M | No disponible | 1,0108 | Apache 2.0 (según el modelo hermano) | Hugging Face |
| Qwen3-0.6B | 596M | No disponible en la información | 1,6026 | No disponible en la información | Hugging Face |
| Turkcell-LLM-7b-v1 | 7.376M | No disponible en la información | 0,9528 | No disponible en la información | Hugging Face |

TurkLM-scratch-0.5B supera en BPC a Qwen3-0.6B y Qwen3-1.7B en texto turco, a pesar de tener menos parámetros que ambos, gracias a su tokenizador específico. Turkcell-LLM-7b-v1, quince veces más grande, obtiene un BPC un 4% mejor que el modelo de 0.5B.

## Limitaciones y advertencias

- Modelo base únicamente: no ha recibido ajuste por instrucciones ni RLHF, por lo que no sigue instrucciones de forma fiable.
- Sin entrenamiento de seguridad: puede generar contenido incorrecto, ofensivo o sesgado.
- Conocimiento del mundo limitado: entrenado con aproximadamente 14.900 millones de tokens, muy por debajo de modelos multilingües del mismo tamaño; no debe usarse para responder preguntas factuales sin recuperación o ajuste fino.
- Contexto efectivo reducido: aunque la configuración admite 40.960 posiciones, el entrenamiento se realizó solo con secuencias de 1.024 tokens, por lo que el rendimiento más allá de esa longitud no está garantizado.
- Evaluación limitada: principalmente sobre texto estilo Wikipedia; el comportamiento en turco conversacional o de dominio específico no está probado.
- Entrenamiento único sin variación de semilla, lo que impide estimar la varianza de los resultados.
- La base RoPE debe mantenerse en 10.000 tal como está guardada; cambiarla degrada claramente el modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento (Wikipedia CC BY-SA 3.0 y GFDL, y CulturaX con sus propios términos) imponen obligaciones de atribución que conviene revisar antes de un despliegue comercial.
- Solo turco: no se documenta soporte de otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eademir/TurkLM-scratch-0.5B
- Scripts y datos de evaluación: https://huggingface.co/eademir/TurkLM-scratch-0.5B/tree/main/eval (referenciado en la model card como `eval/README.md`)
- Modelo hermano TurkLM-scratch-0.3B: no disponible en la información proporcionada
- Dataset Wikipedia en turco: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
