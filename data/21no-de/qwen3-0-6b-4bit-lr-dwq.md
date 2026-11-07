# 21no-de/Qwen3-0.6B-4bit-LR-DWQ

## Resumen

21no-de/Qwen3-0.6B-4bit-LR-DWQ es una versión cuantizada a 4 bits del modelo Qwen/Qwen3-0.6B, publicada por el desarrollador independiente 21no-de. No se trata de un modelo nuevo entrenado desde cero, sino de un reemplazo directo ("drop-in replacement") de mlx-community/Qwen3-0.6B-4bit que mantiene exactamente el mismo formato (4-bit affine, group size 64), los mismos nombres y formas de tensores, el mismo tamaño de fichero (335 MB) y la misma velocidad de decodificación. Lo único que cambia son los valores numéricos internos: los códigos de 4 bits se recalcularon mediante learned rounding de estilo AutoRound y las escalas y sesgos se destilaron con DWQ (Distillation-aware Weight Quantization) para que la distribución de siguiente token se acerque a la del original en bf16.

El modelo resuelve un problema concreto: la pérdida de calidad que introduce la cuantización ingenua round-to-nearest a 4 bits en modelos pequeños. Según la model card, esta versión recupera buena parte de la degradación: MMLU pasa de 32,0% a 38,9% frente al 40,5% del bf16 original, y la divergencia KL respecto al original se reduce un 61%. Es relevante para quienes despliegan Qwen3-0.6B en Apple Silicon con MLX y quieren mejorar la fidelidad sin tocar código ni cambiar el pipeline.

El modelo base Qwen3-0.6B es un transformer de 0,6 mil millones de parámetros de la familia Qwen3. La ficha se centra en la versión cuantizada publicada, que es la que documenta el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B), cuantizado a 4 bits con MLX |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-0.6B) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (unico formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-0.6B original: un transformer decoder-only denso de 0,6B parametros. Sobre esa base, esta publicacion aplica un proceso de cuantizacion consciente de la calidad en dos fases. Primero, learned rounding (estilo AutoRound): para cada peso, un sign-SGD aprende si redondear hacia arriba o hacia abajo, y para cada grupo de 64 aprende dos factores de recorte que ajustan el rango del grupo. El proceso es block-wise, con reconstruccion contra los bloques del profesor (el modelo bf16) dada la entrada real de 4 bits: 200 pasos por bloque, batch de 8 x 512 tokens y 256 fragmentos de chat. Los codigos del embedding se mantienen en round-to-nearest. Se procesaron 28 bloques en 14 minutos y se invirtieron entre el 18% y el 23% de los codigos.

La segunda fase es DWQ (destilacion sobre la distribucion de salida) en tres etapas: 512 muestras de chat con learning rate 2e-6, batch 2, seed 123; 1.536 muestras adicionales de chat con learning rate 2e-6, batch 2, seed 7; y 1.024 muestras de datos mixtos con learning rate 1e-6, batch 1, seed 31. DWQ entrena solo escalas, sesgos y pesos de normalizacion (18,7M numeros), nunca los codigos; en la practica los pesos de normalizacion apenas se movieron (0,5% de sus valores, cada uno menos de 0,0003). Los datos de calibracion de chat proceden de allenai/tulu-3-sft-mixture; los mixtos combinan 1.498 transcripciones de chat de tulu, 1.490 pasajes de wikitext-103 y 107 fragmentos del texto de calibracion GPTQ de mlx-lm (codigo, matematicas, multilingue), filtrando cualquier fila que compartiera una secuencia de 12 palabras con un item de evaluacion o con los libros de evaluacion. El proceso se ejecuto con mlx-lm 0.32.2 y mlx 0.32.4 en un MacBook M2 Pro con 16 GB. La seleccion de candidatos se hizo por pasos sobre un dev set, exigiendo menor KL de libro con mas de 2 errores estandar de mejora, MMLU de dev no peor en mas de 2 errores estandar y una puerta de motor (carga y genera en MLX Runner, coincide con mlx-lm y velocidad de decodificacion completa).

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del Qwen3-0.6B base.
- Razonamiento basico y respuesta a preguntas de conocimiento general (evaluado en MMLU, HellaSwag, ARC).
- Generacion de codigo y matematicas a nivel basico, coherente con el tamano de 0,6B parametros.
- Soporte de plantilla de chat (chat template de mlx-community, identica byte a byte).
- Compatibilidad con el modo thinking de Qwen3 (no medido por el autor; solo se comprobo con una generacion greedy de sanidad).
- Capacidades multilingues: no verificadas en esta publicacion; dependen del modelo base.
- Tool calling / function calling: no evaluado ni documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Vision y audio: no soportadas (modelo de texto).

## Casos de uso

- Prototipado rapido en Apple Silicon: cargar el modelo con mlx-lm o MLX Runner para validar prompts e ideas de producto con un coste de inferencia minimo y 335 MB de disco.
- Sustitucion directa en pipelines MLX existentes: al mantener nombres de tensores, formas, config, tokenizer y chat template, se puede cambiar el identificador del modelo sin tocar el codigo de integracion.
- Generacion de texto en local con requisitos de privacidad: al ejecutarse enteramente en el dispositivo, es apto para borradores de texto o clasificacion sencilla sobre datos que no deben salir del equipo.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia practica de cuanto mejora learned rounding + DWQ frente a round-to-nearest en un modelo pequeno, con metricas publicadas y reproducibles.
- Educacion e investigacion: modelo pequeno y ligero para experimentar con tecnicas de destilacion de cuantizacion, analisis de sesgo hacia la respuesta "A" en evaluacion zero-shot o estudios de divergencia KL.
- Tareas auxiliares de bajo coste: etiquetado simple, reformateo de texto, resumenes cortos o generacion de plantillas donde la latencia y el consumo importan mas que la calidad puntera.
- Base para fine-tuning ligero en MLX: al ser un checkpoint de 4 bits compatible, puede servir de punto de partida para adaptaciones de bajo rango en entornos con poca memoria.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre un holdout reservado. La comparacion es pareada con el modelo 4-bit de mlx-community sobre los mismos items; `se` es el error estandar pareado de la diferencia y `p` el test exacto de McNemar.

| Metrica de holdout | mlx-community 4-bit | Este modelo | bf16 original |
|---|---|---|---|
| MMLU (2.000 preguntas) | 32,0% | 38,9% (+6,9; se 1,0; p < .001) | 40,5% |
| HellaSwag, normalizado por longitud (2.000) | 43,2% | 45,6% (+2,4; se 0,7; p = .001) | 47,6% |
| ARC-Easy, accuracy (570) | 56,1% | 58,1% (+1,9; no significativo) | 59,1% |
| ARC-Challenge, accuracy (297) | 28,3% | 30,6% (+2,4; no significativo) | 33,3% |
| KL respecto al bf16 original, *Moby-Dick*, 48 x 1.024 tokens | 0,291 | 0,115 (-61%) | 0 |
| Acuerdo top-1 con el bf16 original | 69,7% | 80,3% | 100% |
| Decodificacion tok/s a 16 / 1.024 tokens, MLX Runner, M2 Pro | 285,8 / 234,1 | 285,9 / 234,5 | n/a |

Notas del autor: la evaluacion de opcion multiple es zero-shot por log-likelihood con las convenciones de prompt de lm-eval-harness, ejecutada por su propio harness, por lo que no es directamente comparable con cifras publicadas en otros sitios. Un dato empeoro: ARC-Challenge normalizado por longitud paso de 31,6% a 28,3% (-3,4; se 2,2; p = .17, no significativo). La velocidad de decodificacion es la mediana de 3 ejecuciones alternadas y la diferencia esta dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 335 MB; con el runtime MLX el consumo en memoria unificada es de aproximadamente 1 GB o menos, segun el contexto y el batch.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. En GPU NVIDIA no es el formato nativo; requeriria conversion a otro formato.
- Cabe en GPU consumer: si, en cualquier Mac con Apple Silicon; el autor lo desarrollo y ejecuto en un MacBook M2 Pro con 16 GB.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, API de Python), MLX Runner (`mlxr download` / `mlxr run`) y cualquier herramienta compatible con pesos MLX. No esta pensado para vLLM, llama.cpp, Ollama ni TGI sin conversion previa.
- Latencia y throughput: 285,9 tok/s a 16 tokens de contexto y 234,5 tok/s a 1.024 tokens en M2 Pro con MLX Runner (mediana de 3 ejecuciones alternadas), practicamente identico al modelo 4-bit de mlx-community.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (holdout del autor) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| 21no-de/Qwen3-0.6B-4bit-LR-DWQ | 0,6B | no disponible | 38,9% | Apache 2.0 | MLX 4-bit, Hugging Face |
| mlx-community/Qwen3-0.6B-4bit | 0,6B | no disponible | 32,0% | Apache 2.0 | MLX 4-bit, Hugging Face |
| mlx-community/Qwen3-0.6B-4bit-DWQ | 0,6B | no disponible | no disponible (no comparado por el autor) | Apache 2.0 | MLX 4-bit, Hugging Face |
| Qwen/Qwen3-0.6B (bf16) | 0,6B | no disponible | 40,5% | Apache 2.0 | safetensors bf16, Hugging Face |

## Limitaciones y advertencias

- Evaluado unicamente en opcion multiple zero-shot en ingles y en KL sobre texto de libro; la calidad de chat, el modo thinking, el uso multilingue, el contexto largo y la seguridad no se midieron mas alla de una comprobacion de generacion greedy.
- El MMLU zero-shot en un modelo de este tamano esta fuertemente afectado por el sesgo hacia la respuesta "A"; pequenos cambios en ese sesgo mueven la puntuacion varios puntos. El autor considera la KL respecto al original una senal mas estable.
- El modelo se selecciono entre cinco finalistas sobre el mismo holdout en el que se reportan los resultados, lo que infla ligeramente sus cifras de holdout.
- No se compara con mlx-community/Qwen3-0.6B-4bit-DWQ, una alternativa directa de la misma categoria.
- Al estar destilado hacia Qwen3-0.6B, la calidad maxima esperable es la del original, con sus limitaciones (tamano reducido, alucinaciones probables en conocimiento factual, razonamiento limitado).
- Licencia Apache 2.0, igual que Qwen3-0.6B; permite uso comercial, pero conviene revisar los terminos del modelo base y de los datasets de calibracion.
- Formato especifico de MLX: no es portable a otros runtimes sin conversion, lo que limita su uso fuera del ecosistema Apple Silicon.
- Riesgo de alucinacion: no medido por el autor; inherente a un modelo de 0,6B parametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/21no-de/Qwen3-0.6B-4bit-LR-DWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo de referencia 4-bit de mlx-community: https://huggingface.co/mlx-community/Qwen3-0.6B-4bit
- Alternativa DWQ de mlx-community: https://huggingface.co/mlx-community/Qwen3-0.6B-4bit-DWQ
- Articulo del autor sobre el proceso: https://21no.de/publications/open-brain-surgery-4bit-llm/
- MLX Runner: https://mlx-runner.21no.de/
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Dataset de calibracion de chat: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset de calibracion de texto: https://huggingface.co/datasets/Salesforce/wikitext
