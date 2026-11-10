# hanseungwook/fineweb-edu-llama-1.6b-scratch

## Resumen

El modelo `fineweb-edu-llama-1.6b-scratch` es un modelo de lenguaje causal de tipo Llama entrenado desde inicialización aleatoria (from scratch) sobre el corpus FineWeb-Edu. Lo publica el usuario de Hugging Face `hanseungwook` como parte de una familia de experimentos centrados en comparar estrategias de inicialización (scratch, Dyck y NCA) bajo un mismo presupuesto de entrenamiento. No es un modelo orientado a producto, sino una pieza de investigación sobre preentrenamiento.

La arquitectura es un transformer decoder-only con tokenizer GPT-2, contexto de 1.024 tokens y 1.816.565.760 parámetros reales (la familia se denomina "1.6B", pero el vocabulario de texto eleva el recuento exportado a 1.817B). Se distribuye en safetensors FP32, sin fine-tuning de instrucciones ni de chat, por lo que su utilidad práctica se limita a experimentación y evaluación de dinámicas de preentrenamiento.

Su relevancia es metodológica: permite estudiar cómo afecta la inicialización (pesos aleatorios frente a transferencia desde tareas sintéticas como Dyck o NCA) al aprendizaje de texto con un presupuesto fijo de ~32B tokens. El checkpoint publicado es el paso final 60.975, con una validation loss registrada de 2,4614 en el paso 60.500.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), tokenizer GPT-2 |
| Parametros totales | 1.816.565.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (publicado en FP32 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

Se trata de un transformer causal decoder-only con la configuración típica de Llama y un tokenizer GPT-2. El modelo se entrena desde cero (scratch), es decir, con pesos iniciales aleatorios: los embeddings de entrada usan N(mean=0, std=1) y la cabeza de salida no atada (untied) usa la inicialización uniforme por defecto de las capas lineales de PyTorch. La inicialización histórica queda registrada en `config.json` bajo `training_initialization`.

El entrenamiento emplea FineWeb-Edu con un presupuesto nominal de 31,97B tokens (calculado como pasos del optimizador × batch efectivo de 512 × longitud de contexto, excluyendo trabajo repetido antes de reanudaciones). Se usó learning rate 0,0005, weight decay 0,0001 y semilla 0. El checkpoint liberado es el paso 60.975. La familia incluye variantes con la misma configuración pero distinta inicialización (Dyck y NCA), que transfieren un transformer pre-pretrenado y reinician embeddings de texto y cabeza de salida, lo que permite aislar el efecto de la inicialización. No se documenta RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt.
- Modelado de lenguaje causal puro: no hay modo de instrucciones ni de chat.
- Razonamiento y conocimiento factual limitados por el presupuesto de entrenamiento (~32B tokens) y por el contexto de 1.024 tokens.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe restringida al inglés.
- Sin capacidades de visión, audio ni modo "thinking".
- Utilizable como base para experimentos de fine-tuning o como referencia en estudios de inicialización.

## Casos de uso

- Investigación sobre inicialización de modelos: comparar este checkpoint con las variantes `from-dyck` y `from-nca` de la misma familia para medir el impacto de la inicialización en la pérdida de validación con presupuesto fijo.
- Reproducibilidad de experimentos de preentrenamiento: el `conversion_report.json` documenta paridad de logits nativo/HF, igualdad exacta de tensores tras recarga y paridad de tokenizer, lo que facilita auditorías.
- Baseline en estudios de scaling: usar el modelo como referencia de 1.8B parámetros y ~32B tokens frente a la variante de 3B y ~98B tokens de la misma familia.
- Evaluación de corpus: analizar qué aprende un modelo pequeño entrenado exclusivamente con FineWeb-Edu en tareas de perplejidad y generación libre.
- Fine-tuning supervisado posterior: al ser un modelo base sin alineación, sirve como punto de partida para experimentos de SFT en inglés con contexto corto.
- Docencia y divulgación: ejemplo reproducible de un pipeline completo de preentrenamiento (tokenizer GPT-2, configuración Llama, registro en Weights & Biases) para cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento registrado es la validation loss de 2,4614 en el paso 60.500, que el autor advierte que no constituye una evaluación nueva de los pesos liberados.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 7,3 GB solo para pesos (1.817B parámetros × 4 bytes), más memoria para activaciones y caché KV; en la práctica, 10-12 GB para inferencia con contexto completo de 1.024 tokens.
- En FP16/BF16: unos 3,6 GB de pesos; en int8, unos 1,8 GB; en int4, alrededor de 0,9 GB (estimaciones teóricas, no verificadas con este checkpoint).
- GPU recomendadas: A100 o H100 para entrenamiento o evaluación a gran escala; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia en FP16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-12 GB de VRAM en FP16, y en configuraciones de 4-6 GB con cuantización a 8 o 4 bits.
- Opciones de despliegue: `transformers` (carga documentada en la model card), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se ofrece conversión oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fineweb-edu-llama-1.6b-scratch | 1.817B | 1.024 | ~32B tokens FineWeb-Edu, desde cero | no disponible | Hugging Face |
| fineweb-edu-llama-1.6b-from-dyck | no disponible | no disponible | ~32B tokens, inicialización Dyck | no disponible | Hugging Face |
| fineweb-edu-llama-1.6b-from-nca | no disponible | no disponible | ~32B tokens, inicialización NCA | no disponible | Hugging Face |
| fineweb-edu-llama-3b-scratch-wd0p1 | no disponible | no disponible | ~98B tokens FineWeb-Edu, desde cero | no disponible | Hugging Face |

Las tres alternativas pertenecen a la misma familia experimental del autor y comparten configuración de entrenamiento, semilla y weight decay, lo que las convierte en las comparaciones más directas. No se dispone de datos de benchmarks para comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Modelo base sin instrucciones ni chat: no responde de forma fiable a prompts conversacionales ni sigue instrucciones.
- Contexto muy corto (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado solo en inglés; el rendimiento en otros idiomas será deficiente.
- Presupuesto de entrenamiento reducido (~32B tokens) para su tamaño, lo que implica conocimiento factual y razonamiento limitados y mayor propensión a alucinaciones.
- Licencia no disponible: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sin filtros de seguridad ni alineación: puede generar contenido inapropiado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- La validation loss reportada corresponde al paso 60.500 y no a una evaluación de los pesos finales.
- El nombre "1.6B" no coincide con el recuento real de parámetros (1.817B), lo que puede inducir a error en estimaciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-scratch
- Variante Dyck 1.6B: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-dyck
- Variante NCA 1.6B: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
- Variante scratch 3B: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-scratch-wd0p1
- Variante Dyck 3B: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-dyck-wd0p1
- Variante NCA 3B: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-nca-wd0p1
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/hanseungwook/fineweb-edu-pt/runs/9kv12ayg
- Paper de FineWeb-Edu: no disponible en la informacion proporcionada
- Repositorio de código: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
