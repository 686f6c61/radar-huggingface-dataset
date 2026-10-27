# Goekdeniz-Guelmez/SmolLM2-135M-Instruct-lora-sft-2026-10-27-143221

## Resumen

SmolLM2-135M-Instruct-lora-sft-2026-10-27-143221 es un ajuste fino supervisado (SFT) del modelo SmolLM2-135M-Instruct, generado con la aplicación MLX LoRA Studio sobre el entrenador mlx-lm-lora. Lo firma Goekdeniz-Guelmez y se publica como un artefacto de 0,3 GB con 134.515.008 parámetros, pesos fusionados (mergedWeights) en safetensors para MLX y licencia "other". No es un modelo nuevo: es un derivado de 135M parámetros que hereda la arquitectura, el tokenizador y el conocimiento del base, y añade un ajuste sobre el dataset JOSIE-v2-Instruct-5K durante un único epoch.

Su interés es fundamentalmente práctico y de investigación: documenta de forma reproducible un pipeline completo de fine-tuning en Apple Silicon (LoRA de rango 8, learning rate 1e-5 constante, batch 1, 4.096 tokens de longitud máxima de secuencia, 12,2 millones de tokens procesados y una pérdida final de 0,032). Sirve como ejemplo de bajo coste para experimentar con SFT, para validar herramientas de entrenamiento local y para desplegar un generador de texto minúsculo en entornos con recursos muy limitados.

Conviene calibrar expectativas: con 135M parámetros y un único epoch sobre unas 5.000 muestras, el modelo es adecuado para tareas estrechas y prototipado, no para razonamiento complejo ni para conocimiento factual fiable. La model card no publica evaluación completa ni especifica idiomas, y la comparación de benchmarks incluida mezcla configuraciones de few-shot, por lo que no permite aislar la ganancia real del ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la del modelo base SmolLM2-135M-Instruct; número de capas y cabezas no disponible en la información proporcionada) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens usados como max_seq_length en el entrenamiento; el contexto nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantización | No se incluyen pesos cuantizados en el repositorio; pesos fusionados sin cuantizar (≈0,3 GB). Convertible a 8, 6 y 4 bits con mlx-lm o llama.cpp, aunque no se distribuyen esas variantes |
| Idiomas soportados | No disponibles en la model card; sin evaluación multilingüe publicada |
| Licencia | other (la model card remite a la licencia del modelo base, del dataset y del tokenizador; no se detalla cuál) |
| Formato de pesos | safetensors en formato MLX (librería mlx); pesos LoRA ya fusionados en el modelo, no se distribuyen adaptadores separados |

## Arquitectura y entrenamiento

El artefacto es un checkpoint de SmolLM2-135M-Instruct, un transformer decoder-only de tipo Llama, tras un SFT con LoRA. El entrenamiento se ejecutó con mlx-lm-lora desde MLX LoRA Studio con los siguientes hiperparámetros: rango 8, escala 20, dropout 0, optimizador AdamW, learning rate 1e-5 con schedule constante, batch size 1, acumulación de gradientes 1, 1 epoch completo, 4.096 tokens de longitud máxima de secuencia, grad checkpointing activado y "efficient long context" desactivado. Se procesaron 12,2 millones de tokens en 5.090 pasos registrados, con una memoria pico de 3,10 GB y un throughput de entrenamiento reportado de 3,1 tok/s. El modo de subida es mergedWeights y la opción de fusión (fuse) está activada, de modo que los pesos LoRA quedaron integrados en el checkpoint final.

El dataset es mlx-community/JOSIE-v2-Instruct-5K, con aproximadamente 5.000 ejemplos de instrucciones conversacionales. La pérdida final de entrenamiento fue 0,032 (mínimo 0,011, máximo 0,142), con 25 batches de validación configurados. No se documentan técnicas adicionales como decodificación especulativa, atención lineal, RLHF o DPO; los parámetros de preferencia/RL/GRPO que aparecen en la plantilla (β 0,1, loss sigmoid, δ 50) son valores por defecto de la herramienta y no indican que se aplicara un entrenamiento de preferencias, ya que el modo declarado es sft. La reproducibilidad se apoya en el archivo run_spec.json incluido en el repositorio.

## Capacidades

- Generación de texto conversacional de un solo turno y multiturno, con formato de instrucciones heredado del modelo base Instruct.
- Respuestas cortas, resúmenes simples y reformulación de texto dentro de dominios acotados.
- Generación de código y matemáticas muy limitada: el propio autor reporta un 2,6% en GSM8K a 1-shot, insuficiente para uso fiable.
- Soporte de tool calling y function calling: no documentado en la model card; no debe asumirse.
- Capacidades de agente y razonamiento multi-paso: no documentadas y previsiblemente muy limitadas por el tamaño.
- Capacidades multilingües: no evaluadas ni declaradas; el comportamiento fuera del inglés no está caracterizado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ajuste específico al estilo del dataset JOSIE-v2-Instruct-5K, lo que puede mejorar la adherencia al formato de instrucciones de ese corpus concreto.

## Casos de uso

- Prototipado de pipelines de generación de texto en local: permite validar cadenas de preprocesado, prompting y postprocesado con un modelo de 0,3 GB antes de pasar a modelos mayores, sin coste de GPU dedicada.
- Clasificación y enrutamiento ligero de consultas: con prompts cerrados y salidas restringidas, puede etiquetar tickets o mensajes en categorías simples en el propio dispositivo, como paso previo a un modelo mayor.
- Extracción de campos en documentos muy estructurados: formularios, correos con plantilla fija o registros con esquema conocido, donde la ventana de 4.096 tokens cubre el documento completo.
- Autocompletado y sugerencias en editores o herramientas internas: su latencia potencialmente baja y su huella de memoria permiten ejecutarlo en Apple Silicon o en una GPU de gama de entrada junto a otras aplicaciones.
- Experimentación educativa y de investigación sobre SFT: sirve como caso reproducible para estudiar el efecto de LoRA (rango 8), learning rates bajos y una sola época sobre un corpus de 5.000 instrucciones.
- Generación de respuestas en asistentes de dominio muy acotado (FAQ internas, guiones de soporte, mensajes de estado) donde se prioriza el control del formato sobre la precisión factual.
- Pruebas de infraestructura de despliegue: banco de pruebas para convertir safetensors MLX a GGUF, medir throughput en llama.cpp/Ollama o comparar decodificación en CPU, GPU y Neural Engine.
- Filtrado y normalización de texto a gran escala por lotes, donde un modelo pequeño y barato es suficiente para descartar o reformatear contenido antes de un análisis más costoso.

## Benchmarks y rendimiento

La model card incluye una única comparación, etiquetada por el autor como "GMS8K" (probable errata por GSM8K):

| Benchmark | Modelo base (OG) | Este modelo | Observaciones |
|---|---|---|---|
| GSM8K ("GMS8K" en la card) | 1,4 (5-shot) | 2,6 (1-shot) | La comparación mezcla 5-shot y 1-shot, por lo que no aísla el efecto del ajuste ni es directamente equivalente |

No se han publicado resultados de MMLU, HumanEval, HellaSwag, ARC ni otras evaluaciones en la información disponible. Tampoco se reportan métricas de latencia o throughput de inferencia; el dato de 3,1 tok/s corresponde al entrenamiento, no a la generación.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 0,27 GB solo para pesos, más KV cache; en la práctica menos de 1 GB para contextos moderados.
- VRAM estimada en 4 bits: aproximadamente 0,07-0,10 GB de pesos, aunque esas variantes no se incluyen en el repositorio y habría que generarlas.
- GPU recomendadas: cualquier GPU consumer sirve; no requiere A100 ni H100. Funciona en RTX 3060/4060, GTX 1650, iGPU modernas y en Apple Silicon mediante MLX.
- Cabe en GPU consumer y en dispositivos de borde: sí, con margen amplio; también en Raspberry Pi 5 o portátiles sin GPU dedicada si se convierte a GGUF y se cuantiza.
- Opciones de despliegue: mlx-lm para Apple Silicon (formato nativo del repo); conversión a GGUF para llama.cpp u Ollama; conversión a PyTorch para transformers y TGI, aunque el formato MLX publicado no se carga directamente en transformers sin transformar los pesos.
- Latencia y throughput estimados: no disponibles. El autor solo reporta 3,1 tok/s durante el entrenamiento y 3,10 GB de memoria pico, métricas que no deben extrapolarse a inferencia.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de sus model cards públicas y no se han verificado en la información proporcionada; se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-lora-sft (este) | 134,5 M | 4.096 en entrenamiento; nativo no indicado | other | Hugging Face, formato MLX | Ajuste SFT sobre JOSIE-v2-Instruct-5K; GSM8K 2,6 a 1-shot |
| SmolLM2-135M-Instruct (base) | 135 M | 8.192 según su model card pública | Apache 2.0 según su model card pública | Hugging Face, safetensors y GGUF | Referencia directa; GSM8K 1,4 a 5-shot según la card de este derivado |
| SmolLM2-360M-Instruct | 360 M | 8.192 según su model card pública | Apache 2.0 según su model card pública | Hugging Face, safetensors y GGUF | Más capacidad y mejor seguimiento de instrucciones a cambio de más memoria |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 según su model card pública | Apache 2.0 según su model card pública | Hugging Face, safetensors y GGUF | Alternativa multilingüe con contexto mucho mayor; requiere revisar evaluación propia |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 según su model card pública | Apache 2.0 según su model card pública | Hugging Face, safetensors y GGUF | Mayor tamaño y coste; contexto más corto |

## Limitaciones y advertencias

- Tamaño muy reducido: 135M parámetros implican conocimiento factual escaso, razonamiento limitado y alta propensión a alucinaciones, especialmente en preguntas abiertas.
- El 2,6% en GSM8K a 1-shot hace desaconsejable su uso para matemáticas, cálculo o cualquier tarea que requiera precisión numérica.
- Pérdida de entrenamiento muy baja (0,032 final, 0,011 mínima) en un solo epoch sobre ~5.000 ejemplos: puede indicar sobreajuste al estilo del dataset o un corpus muy homogéneo; no hay evaluación held-out detallada más allá de 25 batches de validación.
- El ajuste LoRA está fusionado en los pesos; no se distribuyen adaptadores separados, lo que limita reutilizar el entrenamiento con otros bases o combinarlo con otros LoRA.
- Idiomas no declarados y sin evaluación multilingüe: no hay garantías de calidad en castellano ni en lenguas distintas del inglés.
- Licencia "other" sin texto explícito: la model card remite a las licencias del modelo base, del dataset y del tokenizador. Antes de uso comercial o redistribución hay que verificar esas licencias por separado; no debe asumirse Apache 2.0 por herencia del base.
- Procedencia y reproducibilidad: el identificador incluye la marca temporal 2026-10-27, coherente con la fecha de creación reportada, pero el repositorio no incluye una evaluación independiente ni revisión por pares.
- Sin soporte documentado de tool calling, agentes, visión o audio; cualquier uso en esos escenarios requiere validación propia.
- El formato MLX safetensors no es directamente consumible por transformers, vLLM o TGI sin conversión previa de pesos.
- Riesgo de sesgos no caracterizado: no se publica análisis de sesgo, toxicidad ni evaluación de seguridad del checkpoint ajustado.
- El dataset JOSIE-v2-Instruct-5K no se describe en detalle en la información disponible (composición, procedencia, licencia), lo que dificulta evaluar la calidad y los sesgos introducidos por el SFT.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Goekdeniz-Guelmez/SmolLM2-135M-Instruct-lora-sft-2026-10-27-143221
- Dataset de entrenamiento: https://huggingface.co/datasets/mlx-community/JOSIE-v2-Instruct-5K
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Entrenador mlx-lm-lora: https://github.com/Goekdeniz-Guelmez/mlx-lm-lora
- Curva de pérdida incluida en el repo: loss_curve.png (referenciada en la model card)
- Especificación de ejecución reproducible: run_spec.json (incluido en el repositorio)
